import Link from 'next/link';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { ExportBotoes } from '@/components/adm/ExportBotoes';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LinhaPagamentosCliente } from '@/lib/adm/areas/contrato';
import {
  SITUACAO_CLIENTE_AJUDA,
  SITUACAO_CLIENTE_ROTULO,
  SITUACOES_CLIENTE,
  contarPorSituacao,
  filtrarPorSituacao,
  lerSituacoesClienteDaUrl,
  listarPagamentosPorCliente,
  resumirPagamentos,
  situacaoDoCliente,
  type SituacaoCliente,
} from '@/lib/adm/areas/pagamentos-cliente';
import {
  VAZIO,
  formatarData,
  formatarDataHora,
  formatarInteiro,
  formatarMoeda,
  formatarPercentual,
} from '@/lib/adm/format';
import { PREFIXO_FILTRO, SEPARADOR_VALORES } from '@/lib/adm/url';
import { cn } from '@/lib/utils';

/**
 * /adm/carteira/pagamentos — QUEM PAGOU E QUANTO.
 *
 * A tela irmã de `/adm/carteira/receita` responde por EVENTO: cada cobrança, uma
 * linha, com data e status. Esta responde por PESSOA: quanto cada cliente já
 * deixou na empresa desde que entrou, e quanto isso soma. São a mesma matéria
 * lida em dois eixos, e a segunda não sai da primeira olhando — são 88 cobranças
 * espalhadas em 18 clientes, e somar isso de cabeça na tela não é leitura, é
 * trabalho.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE É UMA PÁGINA SEPARADA e não mais uma seção da /receita.
 *
 * A /receita já tem uma tabela com ordenação, paginação e dois filtros próprios,
 * todos escritos na query string (`?f.situacao=`, `?sort=`, `?page=`). Uma
 * segunda tabela na mesma URL disputaria essas mesmas chaves: ordenar a de baixo
 * reordenaria a de cima. Duas perguntas, dois eixos, duas URLs.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A REGRA DESTA TELA: OS CARDS SÃO A SOMA DAS LINHAS QUE ESTÃO EMBAIXO DELES.
 *
 * Com um filtro de situação ligado, "Total recebido" passa a ser o total DAQUELE
 * recorte, e o total da base inteira desce para a sub-linha em vez de sumir. A
 * alternativa — card sempre sobre a base toda — produz a tela em que o número de
 * cima não bate com a soma da coluna de baixo, e é assim que um painel de
 * dinheiro perde a confiança de quem olha: não por errar a conta, por não deixar
 * conferir.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DOIS NÚMEROS QUE NÃO SE SUBSTITUEM, e por isso aparecem lado a lado.
 *
 *   TOTAL PAGO  é biografia — quem pagou doze meses e saiu tem total alto.
 *   MRR ATUAL   é a foto de hoje — esse mesmo cliente tem zero.
 *
 * Sozinho, cada um mente por omissão: o total sozinho faz um ex-cliente parecer
 * o melhor da carteira; o MRR sozinho apaga quem sustentou a empresa no primeiro
 * ano. Juntos, a linha conta a história inteira.
 *
 * SOMENTE LEITURA (decisão D3).
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quem pagou e quanto · Sistema Seabra',
  robots: { index: false, follow: false },
};

const ROTA = '/adm/carteira/pagamentos';
const P_SITUACAO = `${PREFIXO_FILTRO}situacao`;

type Params = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

function comQuery(sp: Params, mudancas: Record<string, string | null>): string {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(sp)) {
    if (valor == null) continue;
    for (const item of Array.isArray(valor) ? valor : [valor]) busca.append(chave, item);
  }
  for (const [chave, valor] of Object.entries(mudancas)) {
    busca.delete(chave);
    if (valor !== null && valor !== '') busca.set(chave, valor);
  }
  const qs = busca.toString();
  return qs ? `${ROTA}?${qs}` : ROTA;
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default async function PagamentosPage({ searchParams }: { searchParams: Promise<Params> }) {
  const agora = new Date();
  const sp = await searchParams;

  const resultado = await listarPagamentosPorCliente();
  // O componente recebe o `Resultado` inteiro e decide entre "sem configuração",
  // "erro" e "vazio". Uma tela de caixa zerada por falta de migration lida como
  // "a empresa nunca recebeu nada" seria a pior leitura errada possível aqui.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const todos = resultado.dados;
  const situacoes = lerSituacoesClienteDaUrl(primeiro(sp[P_SITUACAO]));
  const filtrados = filtrarPorSituacao(todos, situacoes);

  // Contagem sobre a BASE INTEIRA, não sobre o recorte: contar sobre o filtro
  // zeraria o número de todo chip não selecionado, e um chip que anuncia "0"
  // parece um beco sem saída — quando na verdade tem gente lá dentro.
  const contagem = contarPorSituacao(todos);

  // Dois resumos: o do recorte (que é o que os cards mostram) e o da base
  // inteira (que vira a sub-linha "de R$ X no total"). Ver a regra no cabeçalho.
  const resumo = resumirPagamentos(filtrados);
  const resumoBase = resumirPagamentos(todos);
  const filtrando = situacoes.length > 0;

  // Base das barras da coluna "Total pago". É o MAIOR do recorte, não o total:
  // com o líder em 26% do caixa, barras proporcionais ao total ficariam todas
  // rentes ao chão e não comparariam nada. A barra compara; o "%" ao lado é que
  // informa a fatia real.
  const maiorTotal = filtrados.reduce((m, l) => Math.max(m, l.total_pago), 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/adm/carteira" className="underline underline-offset-4 hover:text-foreground">
              Carteira
            </Link>{' '}
            › Pagamentos
          </p>
          <h1 className="mt-1 text-2xl">Quem pagou e quanto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatarInteiro(resumoBase.clientes)} clientes com histórico de cobrança ·{' '}
            {formatarMoeda(resumoBase.totalRecebido)} recebidos desde o primeiro pagamento
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-xs tabular-nums text-muted-foreground">lido agora, {formatarDataHora(agora)}</p>
          {/* A URL do arquivo carrega o MESMO `f.situacao` que filtrou a tabela
              abaixo — nunca a base inteira quando um filtro está ligado. */}
          <ExportBotoes
            tela="pagamentos"
            parametros={{ [P_SITUACAO]: primeiro(sp[P_SITUACAO]) ?? undefined }}
            contagem={filtrados.length}
          />
        </div>
      </header>

      {/* ── Os cards ─────────────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          destaque
          rotulo="Total recebido"
          valor={formatarMoeda(resumo.totalRecebido)}
          detalhe={
            filtrando ? (
              <>
                neste recorte · {formatarMoeda(resumoBase.totalRecebido)} na base inteira
              </>
            ) : (
              <>histórico completo · {formatarInteiro(resumo.clientes)} clientes</>
            )
          }
        />

        <KpiCard
          rotulo="Média por cliente"
          valor={resumo.mediaPorCliente === null ? VAZIO : formatarMoeda(resumo.mediaPorCliente)}
          // CONCENTRAÇÃO é risco, e é o número que a média esconde: uma carteira
          // com média boa e um cliente valendo um terço dela é frágil de um jeito
          // que a média sozinha não mostra.
          detalhe={
            resumo.fracaoDoMaior === null ? (
              'sem base para comparar'
            ) : (
              <>o maior cliente é {formatarPercentual(resumo.fracaoDoMaior)} de tudo que entrou</>
            )
          }
        />

        {/* VENCIDO ESTÁ DENTRO DE EM ABERTO, não ao lado dele.
            `em_aberto` é PENDING + OVERDUE; `vencido` é o recorte disso que já
            passou da data. Dois cards vizinhos com R$ 3.569 e R$ 1.844 convidam
            a somar — e somar conta o mesmo dinheiro duas vezes. A sub-linha de
            cada um diz a relação, para que a conta certa esteja escrita na tela
            em vez de depender de quem lê saber a regra. */}
        <KpiCard
          rotulo="Em aberto"
          valor={formatarMoeda(resumo.emAberto)}
          detalhe={
            <>
              emitido e não confirmado · {formatarMoeda(resumo.emAberto - resumo.vencido)} ainda dentro do prazo
            </>
          }
          variacao={{ fracao: null, subirEhBom: false }}
        />

        {/* O único card com caminho de saída: dinheiro vencido é o que vira
            telefonema, e /adm/carteira/risco é a tela onde essa lista já mora. */}
        <KpiCard
          rotulo="Vencido"
          valor={formatarMoeda(resumo.vencido)}
          detalhe={
            <>
              {formatarInteiro(resumo.clientesComVencido)} clientes · é a parte atrasada do que está em aberto,
              não uma soma nova
            </>
          }
          href="/adm/carteira/risco"
          variacao={{ fracao: null, subirEhBom: false }}
        />
      </section>

      {/* ── Filtro de situação ───────────────────────────────────────────── */}
      <Chips sp={sp} situacoes={situacoes} contagem={contagem} />

      {/* ── A tabela ─────────────────────────────────────────────────────── */}
      {filtrados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum cliente neste recorte"
          texto="O filtro de situação não deixou nenhuma linha. Os contadores nos chips mostram onde há gente."
          acao={
            <Link
              href={comQuery(sp, { [P_SITUACAO]: null })}
              className="mt-2 text-sm text-foreground underline underline-offset-4"
            >
              Limpar o filtro
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Pagos</TableHead>
                  <TableHead className="text-right">Total pago</TableHead>
                  <TableHead className="text-right">MRR hoje</TableHead>
                  <TableHead className="text-right">Em aberto</TableHead>
                  <TableHead className="text-right">Cliente desde</TableHead>
                  <TableHead className="text-right">Último pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((l) => (
                  <Linha
                    key={l.usuario_id}
                    linha={l}
                    maiorTotal={maiorTotal}
                    totalDoRecorte={resumo.totalRecebido}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <ComoLer clientesSemCobranca={filtrando} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pedaços
// ─────────────────────────────────────────────────────────────────────────────

function Chips({
  sp,
  situacoes,
  contagem,
}: {
  sp: Params;
  situacoes: SituacaoCliente[];
  contagem: Record<SituacaoCliente, number>;
}) {
  const selecionadas = new Set(situacoes);

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-xs">
      <span className="mr-1 text-muted-foreground">Situação:</span>
      {SITUACOES_CLIENTE.map((s) => {
        const ativa = selecionadas.has(s);
        // Toggle: clicar num chip ativo tira só ele. Dentro da faceta os valores
        // são OU — a mesma semântica do resto do painel.
        const proximas = ativa ? situacoes.filter((v) => v !== s) : [...situacoes, s];
        return (
          <Link
            key={s}
            href={comQuery(sp, {
              [P_SITUACAO]: proximas.length > 0 ? proximas.join(SEPARADOR_VALORES) : null,
            })}
            title={SITUACAO_CLIENTE_AJUDA[s]}
            // `aria-current` e não `aria-pressed`: é link de navegação, não botão
            // de alternância — o mesmo atributo que o <AdmNav> usa.
            aria-current={ativa ? 'true' : undefined}
            className={cn(
              'rounded-full border px-2 py-0.5 tabular-nums transition-colors',
              ativa
                ? 'border-primary/60 bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {SITUACAO_CLIENTE_ROTULO[s]} <span className="text-foreground">{formatarInteiro(contagem[s])}</span>
          </Link>
        );
      })}
      {situacoes.length > 0 && (
        <Link
          href={comQuery(sp, { [P_SITUACAO]: null })}
          className="ml-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          limpar
        </Link>
      )}
    </div>
  );
}

/** Cores da situação. Vermelho só para "sem acesso": é o único estado em que há
 *  dinheiro parado do outro lado — conta desativada é fato consumado, não alerta. */
const COR_SITUACAO: Record<SituacaoCliente, string> = {
  pagando: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  inadimplente: 'border-red-500/40 bg-red-500/10 text-red-300',
  desativado: 'border-border bg-muted/40 text-muted-foreground',
};

function Linha({
  linha: l,
  maiorTotal,
  totalDoRecorte,
}: {
  linha: LinhaPagamentosCliente;
  maiorTotal: number;
  totalDoRecorte: number;
}) {
  const situacao = situacaoDoCliente(l);
  const fatia = totalDoRecorte > 0 ? l.total_pago / totalDoRecorte : null;
  const largura = maiorTotal > 0 ? (l.total_pago / maiorTotal) * 100 : 0;

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/adm/u/${l.usuario_id}/assinatura`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {l.nome}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn('rounded-full border px-1.5 py-px', COR_SITUACAO[situacao])}
            title={SITUACAO_CLIENTE_AJUDA[situacao]}
          >
            {SITUACAO_CLIENTE_ROTULO[situacao]}
          </span>
          <span>{l.plano_nome ?? 'sem plano'}</span>
          <span className="tabular-nums opacity-60">#{l.usuario_id}</span>
        </div>
      </TableCell>

      <TableCell className="text-right tabular-nums">{formatarInteiro(l.pagamentos)}</TableCell>

      <TableCell className="text-right">
        <div className="tabular-nums text-foreground">{formatarMoeda(l.total_pago)}</div>
        {/* A barra compara com o maior; o "%" ao lado diz a fatia real do caixa.
            Ver a nota sobre `maiorTotal` na página. */}
        <div className="mt-1 flex items-center justify-end gap-1.5">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${largura}%` }} />
          </div>
          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
            {fatia === null ? VAZIO : formatarPercentual(fatia)}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-right tabular-nums">
        {l.mrr_atual === null || l.mrr_atual === 0 ? (
          // Zero e traço não são a mesma coisa, mas aqui os dois viram o mesmo
          // símbolo de propósito: cortesia e ex-cliente são ambos "não entra
          // dinheiro por mês", e é isso que a coluna pergunta. O porquê está na
          // ficha do cliente, a um clique.
          <span className="text-muted-foreground">{VAZIO}</span>
        ) : (
          formatarMoeda(l.mrr_atual)
        )}
      </TableCell>

      <TableCell className="text-right">
        <div className="tabular-nums">
          {l.em_aberto === 0 ? <span className="text-muted-foreground">{VAZIO}</span> : formatarMoeda(l.em_aberto)}
        </div>
        {l.vencido > 0 && (
          <div className="mt-0.5 text-xs tabular-nums text-red-400">
            {formatarMoeda(l.vencido)} vencido
          </div>
        )}
      </TableCell>

      <TableCell className="text-right">
        <div className="tabular-nums">{formatarData(l.primeiro_pagamento)}</div>
        {l.meses_como_cliente !== null && (
          <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {l.meses_como_cliente === 0 ? 'primeiro mês' : `${formatarInteiro(l.meses_como_cliente)} meses`}
          </div>
        )}
      </TableCell>

      <TableCell className="text-right tabular-nums">{formatarData(l.ultimo_pagamento)}</TableCell>
    </TableRow>
  );
}

/**
 * As três coisas que fazem alguém desconfiar do número sem esta nota: por que a
 * lista é menor que a de usuários, por que "Ativo" não quer dizer "pagando" e
 * por que o total daqui não é o mesmo da /receita.
 */
function ComoLer({ clientesSemCobranca }: { clientesSemCobranca: boolean }) {
  return (
    <section className="painel text-sm text-muted-foreground">
      <h2 className="text-xs uppercase tracking-wide text-foreground">Como ler</h2>
      <ul className="mt-2 flex flex-col gap-1.5">
        <li>
          <span className="text-foreground">Só aparece quem tem histórico de cobrança.</span> Cadastro que nunca
          gerou nenhuma cobrança não pertence a uma tela de &ldquo;quem pagou&rdquo; — apareceria como uma parede
          de zeros. Esses estão em{' '}
          <Link href="/adm/carteira/risco" className="underline underline-offset-4 hover:text-foreground">
            Risco
          </Link>
          , que é a tela onde a ausência de pagamento é o assunto.
        </li>
        <li>
          <span className="text-foreground">&ldquo;Ativo&rdquo; é conta ativa E assinatura dando acesso hoje.</span>{' '}
          Quem parou de pagar tem a conta funcionando e o acesso cortado: fica em{' '}
          <em>Sem acesso</em>, e é justamente ele que interessa numa tela de cobrança. Conta desativada é outra
          coisa — a pessoa não entra no aplicativo, tendo assinatura ou não.
        </li>
        <li>
          <span className="text-foreground">Total pago é histórico; MRR é hoje.</span> Quem pagou doze meses e saiu
          tem total alto e MRR zero. Os dois lado a lado são a história inteira; cada um sozinho conta metade.
        </li>
        <li>
          <span className="text-foreground">Este total não é o da tela de Receita.</span> Lá o corte é por período
          (o que entrou nos últimos doze meses); aqui é a vida inteira de cada cliente, desde o primeiro pagamento
          registrado. Números diferentes porque são perguntas diferentes —{' '}
          <Link
            href="/adm/carteira/receita"
            className="underline underline-offset-4 hover:text-foreground"
          >
            ver cobrança a cobrança
          </Link>
          .
        </li>
        {clientesSemCobranca && (
          <li className="text-foreground">
            Com filtro de situação ligado, os cards de cima somam apenas o recorte visível — o total da base
            inteira fica na sub-linha do primeiro card.
          </li>
        )}
      </ul>
    </section>
  );
}
