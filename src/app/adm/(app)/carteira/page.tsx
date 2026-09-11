import Link from 'next/link';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { ListaRisco } from '@/components/adm/ListaRisco';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { formatarDataHora, formatarInteiro, formatarMoeda } from '@/lib/adm/format';
import { getCarteira } from '@/lib/adm/queries';
import {
  ORIGEM_ACESSO_ROTULO,
  SEGMENTO_ROTULO,
  type FatiaDistribuicao,
  type OrigemAcesso,
} from '@/lib/adm/types';

/**
 * /adm/carteira — a home do painel: "meu dashboard de gestão deles".
 *
 * A tela responde, de cima para baixo, a três perguntas em ordem de urgência:
 * quanto isto vale (KPIs), para onde está indo (gráficos) e para quem eu ligo
 * hoje (as três listas de risco). Nada aqui soma nada: todos os números já vêm
 * agregados em SQL por getCarteira — somar em JS sobre uma página paginada é o
 * jeito clássico de um KPI ficar 40% menor que a verdade sem dar erro nenhum.
 *
 * TODO KPI É UM LINK para a lista que o compõe. Um número agregado sem caminho
 * de volta para as linhas é um número em que não se confia: ao ver "3
 * inadimplentes", a primeira coisa que se quer saber é QUEM.
 *
 * `force-dynamic` porque isto é tela de conferência: um MRR em cache de 60 s já
 * divergiu do banco quando o Felipe aperta F5 depois de mudar alguma coisa.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Carteira · Sistema Seabra',
  robots: { index: false, follow: false },
};

/**
 * Os parâmetros abaixo são exatamente os que a lista mestra sabe ler: `f.<chave>`
 * é a gramática de filtro da <AdmFilters>, `sort=-coluna` a da <AdmTable>. Um
 * link que erre o prefixo não dá erro — abre a lista inteira, que é pior, porque
 * parece ter funcionado.
 */
const USUARIOS = '/adm/usuarios';

const ORIGENS: OrigemAcesso[] = ['pagante', 'trial', 'cortesia', 'extensao'];

/** 'caprino_leiteiro' → 'Caprino leiteiro'. A view devolve o valor cru do
 *  text[]; um valor novo no banco passa reto em vez de sumir da tela. */
function rotularSegmento(fatia: FatiaDistribuicao): FatiaDistribuicao {
  const conhecido = (SEGMENTO_ROTULO as Record<string, string | undefined>)[fatia.rotulo];
  return conhecido ? { rotulo: conhecido, valor: fatia.valor } : fatia;
}

/** Moldura dos gráficos. O <h2> herda a serifa do site por regra de elemento. */
function Painel({ titulo, descricao, children }: { titulo: string; descricao: string; children: React.ReactNode }) {
  return (
    <section className="painel">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base leading-tight">{titulo}</h2>
        <span className="shrink-0 text-xs text-muted-foreground">{descricao}</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function CarteiraPage() {
  // Um instante só para a página inteira: os "vence em N dias" das três listas e
  // o carimbo do cabeçalho falam todos do mesmo relógio.
  const agora = new Date();
  const resultado = await getCarteira(agora);

  // O componente recebe o Resultado inteiro e decide entre "sem configuração",
  // "erro" e "vazio". Um sem-config desenhado como vazio seria a pior falha
  // possível desta tela: uma carteira zerada por falta de variável de ambiente,
  // lida como perda de clientes.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const {
    kpis,
    receitaMensal,
    novosClientesMensal,
    porSegmento,
    porEstado,
    porPlano,
    riscoSilencio,
    riscoCobranca,
    riscoTrial,
  } = resultado.dados;

  const agoraIso = agora.toISOString();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl">Carteira</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatarInteiro(kpis.contasComAcesso)} contas com acesso · {formatarInteiro(kpis.propriedades)} propriedades
            · {formatarInteiro(kpis.animaisAtivos)} animais
          </p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">lido agora, {formatarDataHora(agora)}</p>
      </header>

      {/*
        As quatro telas de profundidade da carteira. Elas existem desde a Fase 3 e
        ficaram um tempo alcançáveis só digitando a URL — o sintoma disso ("a
        tela não existe") é indistinguível de não ter sido implementada. Aqui,
        e não no <AdmNav>: são seções DESTA página, não áreas de primeiro nível
        ao lado de Usuários e Consultores.
      */}
      <nav className="flex flex-wrap gap-2">
        {[
          { href: '/adm/carteira/receita', rotulo: 'Receita', detalhe: 'cobranças, MRR e inadimplência' },
          { href: '/adm/carteira/pagamentos', rotulo: 'Pagamentos', detalhe: 'quem pagou e quanto, por cliente' },
          { href: '/adm/carteira/risco', rotulo: 'Risco', detalhe: 'os quatro baldes de churn' },
          { href: '/adm/carteira/adocao', rotulo: 'Adoção', detalhe: 'coorte de retenção' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/60"
          >
            <span className="block text-sm text-foreground group-hover:text-primary">{item.rotulo}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{item.detalhe}</span>
          </Link>
        ))}
      </nav>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          rotulo="Contas com acesso"
          valor={formatarInteiro(kpis.contasComAcesso)}
          detalhe={`de ${formatarInteiro(kpis.contasTotal)} cadastradas`}
          href={`${USUARIOS}?f.acesso=ativo`}
        />

        {/* O card mais importante da tela — e o único que mostra dois números do
            MESMO indicador. O real vai ser MENOR que o de tabela, e a troca só
            fica confiável com os dois lado a lado até o Felipe parar de
            estranhar (§2 do desenho). Sem `variacao`: pintar a diferença de
            vermelho diria que o número honesto é um problema.

            O link leva a /adm/carteira/receita, e não à lista de usuários: é lá
            que este número é decomposto em cobrança a cobrança. */}
        <KpiCard
          destaque
          rotulo="MRR mensal"
          valor={formatarMoeda(kpis.mrrReal)}
          detalhe={
            <>
              tabela {formatarMoeda(kpis.mrrTabela)} · real {formatarMoeda(kpis.mrrReal)} · ARPU{' '}
              {formatarMoeda(kpis.arpu)}
            </>
          }
          href="/adm/carteira/receita"
        />

        <KpiCard
          rotulo="Receita em risco"
          valor={formatarMoeda(kpis.receitaEmRisco)}
          detalhe={`${formatarInteiro(kpis.inadimplentes)} vencidos · ${formatarInteiro(kpis.vencendo7d)} vencendo em 7 dias`}
          href="/adm/carteira/risco"
        />

        {/* Era o único card sem link enquanto /adm/propriedades não existia.
            O destino é o diretório ancorado no tenant real — e ele é o caminho
            de volta que faltava para este número, que é justamente o que NÃO
            bate com a contagem de contas. */}
        <KpiCard
          rotulo="Propriedades"
          valor={formatarInteiro(kpis.propriedades)}
          detalhe="o tenant real do banco — não o número de contas"
          href="/adm/propriedades"
        />

        <KpiCard
          rotulo="Animais na base"
          valor={formatarInteiro(kpis.animaisAtivos)}
          detalhe="ativos, somando todas as propriedades"
          href={`${USUARIOS}?sort=-animais`}
        />

        {/* D2: atividade é LANÇAMENTO, não login. Dizer isso no card evita a
            pergunta "mas ele entrou ontem" toda vez que alguém aparece parado. */}
        <KpiCard
          rotulo="Contas ativas no mês"
          valor={formatarInteiro(kpis.mau)}
          detalhe={`quem lançou em 30 dias · ${formatarInteiro(kpis.wau)} na semana · ${formatarInteiro(kpis.dau)} hoje`}
          href={`${USUARIOS}?f.atividade=30d`}
        />
      </section>

      {/* ── Os quatro baldes e os dois atalhos de risco ───────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Origem do acesso:</span>
          {/* Os quatro baldes NÃO se sobrepõem (OrigemAcesso em types.ts) — é o
              que permite a soma bater com "contas com acesso" sem contar ninguém
              duas vezes. Cada um é um link porque a diferença entre "40 clientes"
              e "22 pagando, 6 em trial e 12 de cortesia" é a conversa comercial
              inteira. Ficam fora dos cards para poder ser links de verdade: um
              <a> dentro de um card que já é <a> é HTML inválido. */}
          {ORIGENS.map((origem) => (
            <Link
              key={origem}
              href={`${USUARIOS}?f.origem=${origem}`}
              className="rounded-full border border-border px-2 py-0.5 tabular-nums transition-colors hover:border-primary/60 hover:text-foreground"
            >
              {ORIGEM_ACESSO_ROTULO[origem]} <span className="text-foreground">{formatarInteiro(kpis.acesso[origem])}</span>
            </Link>
          ))}
          <span className="ml-2 text-muted-foreground">Sem lançar:</span>
          <Link
            href={`${USUARIOS}?f.atividade=silencioso`}
            className="rounded-full border border-border px-2 py-0.5 tabular-nums transition-colors hover:border-primary/60 hover:text-foreground"
          >
            sumidos há +30d <span className="text-foreground">{formatarInteiro(kpis.silenciosos)}</span>
          </Link>
          <Link
            href={`${USUARIOS}?f.atividade=nunca`}
            className="rounded-full border border-border px-2 py-0.5 tabular-nums transition-colors hover:border-primary/60 hover:text-foreground"
          >
            nunca lançaram <span className="text-foreground">{formatarInteiro(kpis.nuncaLancaram)}</span>
          </Link>
        </div>
        <p className="max-w-prose text-xs leading-snug text-muted-foreground">
          O MRR real desconta cortesia, aplica o desconto de associação e divide o plano anual por 12. É menor que o de
          tabela de propósito — o de tabela é o número que o app mostra hoje.
        </p>
      </section>

      {/* ── Gráficos ─────────────────────────────────────────────────────── */}
      <section className="grid gap-3 lg:grid-cols-2">
        <Painel titulo="Receita mensal" descricao="últimos 12 meses">
          <SerieTemporal
            series={[{ chave: 'receita', nome: 'Receita', pontos: receitaMensal }]}
            formato="moeda"
            altura={200}
          />
        </Painel>

        <Painel titulo="Novos clientes por mês" descricao="últimos 12 meses">
          <SerieTemporal
            series={[{ chave: 'novos', nome: 'Novos clientes', pontos: novosClientesMensal }]}
            formato="inteiro"
            altura={200}
          />
        </Painel>

        {/* Uma propriedade pode ser caprino leiteiro E ovino corte: a soma das
            fatias passa do total de propriedades, e isso é correto. */}
        <Painel titulo="Por segmento" descricao="propriedades">
          <DistribuicaoBarras
            dados={porSegmento.map(rotularSegmento)}
            formato="inteiro"
            mostrarPercentual
            larguraRotulo={140}
            mensagemVazia="Nenhuma propriedade classificada por segmento."
          />
        </Painel>

        <Painel titulo="Por estado" descricao="propriedades">
          <DistribuicaoBarras
            dados={porEstado}
            formato="inteiro"
            mostrarPercentual
            // UF cabe em pouco espaço; a cauda longa vira "Outros (n)" sozinha.
            larguraRotulo={64}
            mensagemVazia="Nenhuma propriedade com estado preenchido."
          />
        </Painel>
      </section>

      {porPlano.length > 0 && (
        <Painel titulo="Por plano" descricao="contas">
          <DistribuicaoBarras dados={porPlano} formato="inteiro" mostrarPercentual larguraRotulo={160} />
        </Painel>
      )}

      {/* ── As três listas de ação ───────────────────────────────────────── */}
      <section className="grid gap-3 lg:grid-cols-3">
        <ListaRisco
          motivo="silencio"
          titulo="Sumiram"
          descricao="Com acesso ativo e sem lançar nada há mais de 30 dias."
          usuarios={riscoSilencio}
          total={kpis.silenciosos}
          agora={agoraIso}
          verTodosHref={`${USUARIOS}?f.atividade=silencioso`}
        />
        <ListaRisco
          motivo="cobranca"
          titulo="Cobrança"
          descricao="Pagamento vencido ou vencendo nos próximos 7 dias."
          usuarios={riscoCobranca}
          agora={agoraIso}
          verTodosHref={`${USUARIOS}?f.cobranca=vencido,vencendo7d&sort=-valor`}
        />
        <ListaRisco
          motivo="trial"
          titulo="Trial acabando"
          descricao="A janela para converter — o uso ao lado diz se vale a ligação."
          usuarios={riscoTrial}
          total={kpis.acesso.trial}
          agora={agoraIso}
          verTodosHref={`${USUARIOS}?f.status=trial`}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Painel somente leitura (D3): nada aqui escreve no banco do app.
      </p>
    </div>
  );
}
