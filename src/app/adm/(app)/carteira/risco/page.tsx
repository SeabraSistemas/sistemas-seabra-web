import Link from 'next/link';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { ListaRisco } from '@/components/adm/ListaRisco';
import { listarCobrancas, resumirCobrancas } from '@/lib/adm/areas/cobrancas';
import { diasEntre, formatarDataHora, formatarInteiro, formatarMoeda } from '@/lib/adm/format';
import { soma } from '@/lib/adm/metricas';
import { listarUsuarios } from '@/lib/adm/queries';
import type { UsuarioLista } from '@/lib/adm/types';

/**
 * /adm/carteira/risco — os quatro baldes de churn.
 *
 * A `/adm/carteira` mostra três listas curtas como aperitivo. Esta tela é a
 * versão inteira, e cada balde é uma LISTA DE AÇÃO: nomes para ligar hoje, não
 * uma tabela para analisar. É por isso que nada aqui é `<AdmTable>` — tabela
 * serve para comparar N colunas, e o que decide um telefonema são três coisas:
 * quem é, o número que justifica a ligação, e o que está em jogo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAS REGRAS QUE ATRAVESSAM A TELA
 *
 * 1. CADA BALDE É ORDENADO POR UM NÚMERO QUE A PRÓPRIA LINHA MOSTRA.
 *
 *    Silêncio ordena por VALOR (o cliente de R$ 150 calado há 31 dias importa
 *    mais que o de R$ 15 calado há 90) — e a `<ListaRisco>` escreve a mensalidade
 *    em cada linha. Inadimplente ordena por tempo de atraso, que é o número
 *    grande de cada linha. Trial ordena por dias restantes. Acesso sem pagamento
 *    ordena por animais cadastrados. Ordenar por algo invisível deixa o operador
 *    sem como conferir a ordem — e uma lista cuja ordem não se explica vira uma
 *    lista que ninguém segue.
 *
 * 2. OS BALDES SÃO PERGUNTAS, NÃO UMA PARTIÇÃO. Uma conta de cortesia que parou
 *    de lançar aparece em dois: ela é um cliente indo embora E uma receita que
 *    nunca existiu. Forçar exclusividade esconderia metade da história de alguém
 *    justamente para deixar a soma bonita.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DINHEIRO DE CADA BALDE — e por que dois deles são R$ 0,00 DE VERDADE.
 *
 * `valor_real_mensal` só é maior que zero quando `origem_acesso = 'pagante'`
 * (a regra está no CASE de `adm.usuarios_lista`, em adm_01). Consequência direta,
 * e que precisa estar escrita na tela para não parecer defeito:
 *
 *   silêncio       tem MRR de verdade: são contas pagantes que pararam de usar.
 *   inadimplente   tem MRR ZERO — a assinatura vencida já deixou de gerar receita.
 *                  O dinheiro parado dessas contas não está no MRR, está nas
 *                  COBRANÇAS, e é de lá (`adm.cobrancas_lista`) que sai o valor
 *                  do cabeçalho deste balde.
 *   trial          MRR zero: ainda não paga nada. O que está em jogo é a conversão.
 *   sem pagamento  MRR zero por construção: é a definição do balde.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEGRADAÇÃO. Os quatro baldes saem de `adm.usuarios_lista` (Fase 1, já migrada);
 * só o valor vencido do balde 2 vem de `adm.cobrancas_lista` (Fase 3, a view mais
 * nova da obra). Por isso a falha das cobranças NÃO derruba a página: os baldes
 * continuam, e o cabeçalho do inadimplente diz que o valor depende de uma
 * migration. Uma tela de risco que some inteira quando a peça mais recente falta
 * é uma tela que não se pode usar durante a implantação — que é exatamente quando
 * ela é mais necessária.
 *
 * `force-dynamic` porque isto é tela de conferência: uma lista de risco em cache
 * de 60 s já divergiu do banco quando o Felipe aperta F5 depois de dar baixa.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Risco · Sistema Seabra',
  robots: { index: false, follow: false },
};

const USUARIOS = '/adm/usuarios';

/** A janela do balde de trial. Sete dias é o que sobra de conversa útil: abaixo
 *  disso a ligação vira cobrança, acima vira lembrete que ninguém atende. */
const TRIAL_ALERTA_DIAS = 7;

/** Quantos nomes cada balde mostra antes do "ver todos". Oito é o limite default
 *  da <ListaRisco> na home; aqui a tela é inteira do assunto, e doze ainda cabem
 *  numa olhada sem virar relatório. */
const LINHAS = 12;

export default async function RiscoPage() {
  // Um instante só para a página inteira: os "vence em N dias" dos quatro baldes
  // e o carimbo do cabeçalho falam todos do mesmo relógio.
  const agora = new Date();
  const agoraIso = agora.toISOString();

  const [silencioRes, vencidasRes, trialRes, gratuitasRes, testesRes, cobrancasRes] = await Promise.all([
    // Silêncio já sai do SQL na ordem certa: `ordem: 'valor'` é
    // valor_real_mensal desc. A regra "silencioso" da própria query já exige
    // acesso ativo — sem isso a lista se encheria de conta cancelada há um ano,
    // que não é ação nenhuma.
    listarUsuarios({ atividade: 'silencioso', ordem: 'valor' }),
    // Vencida, e não ['vencida','pendente']: pendente é cobrança emitida e ainda
    // NO PRAZO — isso é "em aberto" na tela de receita, não inadimplência.
    listarUsuarios({ status: ['vencida'], ordem: 'valor' }),
    listarUsuarios({ status: ['trial'], ordem: 'valor' }),
    listarUsuarios({ origens: ['cortesia', 'extensao'], ordem: 'valor' }),
    // `is_tester` fica FORA da lista mestra por default (a conta demo é a do
    // reviewer da Apple e as de teste são internas), então esta é a única chamada
    // da tela que precisa levantar esse corte — e ela pede exatamente a bandeira.
    listarUsuarios({ incluirTestes: true, bandeiras: ['tester'], ordem: 'valor' }),
    listarCobrancas(),
  ]);

  // Os quatro primeiros leem a MESMA view. Se um falhou, todos falharam pelo
  // mesmo motivo — e o <EstadoVazio> distingue "falta configurar" de "quebrou",
  // que é a diferença entre uma carteira sem risco e uma env faltando.
  if (!silencioRes.ok) return <EstadoVazio resultado={silencioRes} />;
  if (!vencidasRes.ok) return <EstadoVazio resultado={vencidasRes} />;
  if (!trialRes.ok) return <EstadoVazio resultado={trialRes} />;
  if (!gratuitasRes.ok) return <EstadoVazio resultado={gratuitasRes} />;
  if (!testesRes.ok) return <EstadoVazio resultado={testesRes} />;

  // ── Balde 1 · silêncio ─────────────────────────────────────────────────────
  const silencio = silencioRes.dados;
  const mrrSilencio = soma(silencio.map((u) => u.valor_real_mensal));

  // ── Balde 2 · inadimplente ─────────────────────────────────────────────────
  // Reordenado pelo tempo de atraso, que é o número que a linha mostra. O
  // `ordem: 'valor'` do SQL não serve aqui: assinatura vencida tem
  // valor_real_mensal = 0 em TODAS as linhas, então aquela ordenação é um empate
  // geral resolvido pelo banco — ou seja, ordem nenhuma.
  const inadimplentes = [...vencidasRes.dados].sort((a, b) => {
    const da = diasParaVencer(a, agoraIso);
    const db = diasParaVencer(b, agoraIso);
    if (da == null && db == null) return a.id - b.id;
    if (da == null) return 1;
    if (db == null) return -1;
    // Mais negativo = vencido há mais tempo = mais no alto.
    return da !== db ? da - db : a.id - b.id;
  });

  const cobrancas = cobrancasRes.ok ? resumirCobrancas(cobrancasRes.dados) : null;

  // ── Balde 3 · trial estourando ─────────────────────────────────────────────
  // Recorte em memória sobre a lista COMPLETA de trials — não é agregação sobre
  // página paginada (o que faria um número ficar menor que a verdade), é filtro
  // e ordenação sobre tudo o que a query devolveu.
  const trial = trialRes.dados
    .map((u) => ({ u, dias: diasParaVencer(u, agoraIso) }))
    .filter((x): x is { u: UsuarioLista; dias: number } => x.dias != null && x.dias <= TRIAL_ALERTA_DIAS)
    // Mais perto de acabar primeiro; empate desempata por uso, que é o que diz se
    // a conversa vale um telefonema (200 animais lançados ≠ cadastro vazio).
    .sort((a, b) => a.dias - b.dias || b.u.animais_ativos - a.u.animais_ativos || a.u.id - b.u.id)
    .map((x) => x.u);

  // ── Balde 4 · acesso sem pagamento ─────────────────────────────────────────
  // União de duas chamadas à MESMA query — não é um segundo motor de lista. A
  // dedupe é obrigatória: uma conta de cortesia também marcada como is_tester
  // aparece nas duas respostas e viraria duas linhas do mesmo nome.
  const semPagamento = unir(gratuitasRes.dados, testesRes.dados).sort(
    (a, b) => b.animais_ativos - a.animais_ativos || a.id - b.id,
  );
  const porCortesia = semPagamento.filter((u) => u.origem_acesso === 'cortesia').length;
  const porExtensao = semPagamento.filter((u) => u.origem_acesso === 'extensao').length;
  const porTeste = semPagamento.filter((u) => u.is_tester).length;
  const animaisSemPagamento = semPagamento.reduce((acc, u) => acc + u.animais_ativos, 0);
  const animaisEmTrial = trial.reduce((acc, u) => acc + u.animais_ativos, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl">Risco</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Quatro perguntas, quatro listas de ação. Um mesmo nome pode aparecer em mais de uma — os
            baldes não dividem a carteira, cada um responde uma coisa. Sinal de vida é o último
            lançamento, nunca o último login (D2): não existe coluna de acesso no banco, e
            colaborador legado nem passa pelo Supabase Auth.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <p className="tabular-nums">lido agora, {formatarDataHora(agora)}</p>
          <nav className="flex gap-2">
            <Link href="/adm/carteira" className="underline-offset-4 hover:text-foreground hover:underline">
              ← Carteira
            </Link>
            <Link
              href="/adm/carteira/receita"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Receita →
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Os três baldes de churn ───────────────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <EmJogo
            valor={formatarMoeda(mrrSilencio)}
            detalhe={`por mês parados nestas ${formatarInteiro(silencio.length)} contas`}
          />
          <ListaRisco
            motivo="silencio"
            titulo="Silêncio"
            descricao="Acesso ativo e nenhum lançamento há mais de 30 dias. Em ordem de valor: quem paga mais vem primeiro, não quem sumiu há mais tempo."
            usuarios={silencio}
            total={silencio.length}
            limite={LINHAS}
            agora={agoraIso}
            verTodosHref={`${USUARIOS}?f.atividade=silencioso&sort=-valor`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <EmJogo
            valor={cobrancas ? formatarMoeda(cobrancas.vencidasValor) : '—'}
            detalhe={
              cobrancas
                ? `vencidos em ${formatarInteiro(cobrancas.vencidas)} cobranças · MRR destas contas já é R$ 0,00`
                : 'o valor vencido depende da view de cobranças (Fase 3), que ainda não respondeu'
            }
            href={cobrancas ? '/adm/carteira/receita?f.situacao=vencida' : undefined}
          />
          <ListaRisco
            motivo="cobranca"
            titulo="Inadimplente"
            descricao="Assinatura vencida: o acesso já caiu e a cobrança não foi paga. Em ordem de atraso, do mais antigo para o mais recente."
            usuarios={inadimplentes}
            total={inadimplentes.length}
            limite={LINHAS}
            agora={agoraIso}
            verTodosHref={`${USUARIOS}?f.status=vencida`}
            vazio="Nenhuma assinatura vencida. Cobrança atrasada com acesso mantido à mão não cai aqui — ela está no balde de acesso sem pagamento, abaixo."
          />
        </div>

        <div className="flex flex-col gap-2">
          <EmJogo
            valor={formatarMoeda(soma(trial.map((u) => u.valor_real_mensal)))}
            detalhe={`trial não gera receita — em jogo estão ${formatarInteiro(trial.length)} contas e ${formatarInteiro(animaisEmTrial)} animais já cadastrados`}
          />
          <ListaRisco
            motivo="trial"
            titulo="Trial estourando"
            descricao={`Trial que termina em até ${TRIAL_ALERTA_DIAS} dias. A janela para converter — o uso ao lado diz se vale a ligação.`}
            usuarios={trial}
            total={trial.length}
            limite={LINHAS}
            agora={agoraIso}
            verTodosHref={`${USUARIOS}?f.status=trial&f.cobranca=vencendo7d`}
            vazio={`Nenhum trial terminando nos próximos ${TRIAL_ALERTA_DIAS} dias.`}
          />
        </div>
      </section>

      {/* ── O quarto balde, que não é churn ───────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-4">
        <div>
          <h2 className="text-lg">Acesso sem pagamento</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Este balde está separado dos outros três porque{' '}
            <strong className="font-medium text-foreground">não é risco de churn</strong>: é receita
            que nunca existiu. Ninguém aqui vai parar de pagar — ninguém aqui paga. São contas com
            acesso liberado por cortesia (assinatura Pro com vencimento em 2099), por extensão manual
            (concessão fora do fluxo de cobrança) ou pela bandeira{' '}
            <code className="rounded bg-secondary px-1">is_tester</code>, que fura o paywall inteiro
            no app. Perder uma destas contas custa zero de MRR — o que se perde é o rebanho que ela
            já cadastrou, e a referência que ela representa.
          </p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            É também onde mora o caso da auditoria: cliente com cobrança vencida e acesso mantido à
            mão. Ele não aparece como inadimplente na lista ao lado, porque a extensão manual
            sobrepõe o vencimento e o status efetivo volta a ser &ldquo;ativa&rdquo; —{' '}
            <Link
              href="/adm/carteira/receita?f.situacao=vencida"
              className="text-foreground underline underline-offset-4"
            >
              a cobrança dele está na tela de receita
            </Link>
            .
          </p>
        </div>

        <EmJogo
          valor={formatarMoeda(soma(semPagamento.map((u) => u.valor_real_mensal)))}
          detalhe={`de MRR, e é zero por construção: só a origem 'pagante' gera receita na view. ${formatarInteiro(porCortesia)} por cortesia · ${formatarInteiro(porExtensao)} por extensão manual · ${formatarInteiro(porTeste)} com is_tester (a bandeira às vezes coincide com as outras duas) · ${formatarInteiro(animaisSemPagamento)} animais cadastrados`}
        />

        <ListaRisco
          // 'silencio' e não 'cobranca': aqui o número que importa é HÁ QUANTO
          // TEMPO a conta não é usada (acesso de graça sem uso é o pior caso), e o
          // apoio cai para o rebanho, já que mensalidade não existe. Com 'cobranca'
          // a linha mostraria "vence em 26.847 dias" para toda cortesia de 2099.
          motivo="silencio"
          titulo="Contas com acesso liberado"
          descricao="Cortesia, extensão manual ou is_tester. Em ordem de rebanho cadastrado — é o que está em jogo quando não há mensalidade."
          usuarios={semPagamento}
          total={semPagamento.length}
          limite={LINHAS}
          agora={agoraIso}
          verTodosHref={`${USUARIOS}?f.bandeira=cortesia,extensao,tester&testes=1&sort=-animais`}
          vazio="Ninguém com acesso liberado sem cobrança por trás. Toda conta ativa hoje tem uma assinatura real."
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Painel somente leitura (D3): nada aqui escreve no banco do app. Estender acesso, cancelar e
        reemitir cobrança continuam pelo app ou pelo Asaas — quando entrarem no painel, vão proxiar a
        Edge Function <code>asaas-admin-actions</code>, jamais UPDATE direto.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Peças
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O cabeçalho de dinheiro de cada balde: o total em jogo acima da lista que o
 * compõe. É uma faixa e não um `<KpiCard>` de propósito — a `<ListaRisco>` já é
 * um cartão, e um cartão em cima do outro faria a tela parecer dois painéis
 * empilhados em vez de um número com a sua lista.
 */
function EmJogo({ valor, detalhe, href }: { valor: string; detalhe: string; href?: string }) {
  const conteudo = (
    <>
      <span className="text-sm font-medium tabular-nums text-foreground">{valor}</span>
      <span className="min-w-0">{detalhe}</span>
    </>
  );

  if (!href) {
    return <p className="flex flex-wrap items-baseline gap-x-2 px-1 text-xs text-muted-foreground">{conteudo}</p>;
  }

  return (
    <Link
      href={href}
      className="flex flex-wrap items-baseline gap-x-2 px-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      {conteudo}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários locais
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dias até o vencimento: negativo quando já venceu. `agora` vem de fora, e é a
 * mesma disciplina de `format.ts` e da `<ListaRisco>` — recalcular o instante
 * dentro de cada função faz a mesma conta ser feita com dois relógios, e é assim
 * que um "vence hoje" vira "vencido há 1 dia" no meio da renderização.
 */
function diasParaVencer(u: UsuarioLista, agora: string): number | null {
  return diasEntre(agora, u.data_vencimento);
}

/** União sem repetir ninguém, preservando a ordem de chegada. `usuarios.id` é a
 *  identidade do painel (D1), então é ele que decide o que é a mesma conta. */
function unir(...listas: UsuarioLista[][]): UsuarioLista[] {
  const vistos = new Set<number>();
  const saida: UsuarioLista[] = [];
  for (const lista of listas) {
    for (const u of lista) {
      if (vistos.has(u.id)) continue;
      vistos.add(u.id);
      saida.push(u);
    }
  }
  return saida;
}
