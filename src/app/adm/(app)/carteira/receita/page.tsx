import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  SITUACAO_REGRA,
  SITUACAO_ROTULO,
  SITUACOES,
  contarPorSituacao,
  filtrarCobrancas,
  listarCobrancas,
  resumirCobrancas,
  situacaoDaCobranca,
  type SituacaoCobranca,
} from '@/lib/adm/areas/cobrancas';
import type { LinhaCobranca } from '@/lib/adm/areas/contrato';
import {
  VAZIO,
  diaCivil,
  formatarData,
  formatarDataHora,
  formatarInteiro,
  formatarMoeda,
} from '@/lib/adm/format';
import { soma } from '@/lib/adm/metricas';
import { getCarteira } from '@/lib/adm/queries';
import { PREFIXO_FILTRO, SEPARADOR_VALORES, ehPeriodoRelativo, inicioDoPeriodo } from '@/lib/adm/url';
import { cn } from '@/lib/utils';

/**
 * /adm/carteira/receita — O DINHEIRO.
 *
 * A `/adm/carteira` responde "quanto isto vale hoje". Esta tela responde as duas
 * perguntas que sobram, e que são de caixa e não de foto: QUANTO ENTROU e QUANTO
 * FALTA ENTRAR. Por isso ela é a única do painel em que a tabela embaixo não é um
 * anexo — a lista de cobranças É a tela, e os cards de cima são só o resumo dela.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A REGRA QUE ORGANIZA A PÁGINA: TODO NÚMERO É ANCORADO NO QUE ESTÁ AO LADO DELE.
 *
 *   MRR real / de tabela / ARPU  vêm de `getCarteira()`, exatamente a mesma
 *                                leitura que a home usa. Não há um segundo cálculo
 *                                de MRR neste arquivo, e é de propósito: duas
 *                                telas do mesmo painel mostrando MRRs diferentes
 *                                é o defeito clássico deste tipo de dashboard —
 *                                os dois números parecem plausíveis e ninguém
 *                                descobre qual está errado.
 *   Recebido em 12 meses         é a SOMA DAS BARRAS do gráfico logo abaixo. Não é
 *                                uma segunda consulta que "deveria dar o mesmo":
 *                                é literalmente a soma da série desenhada.
 *   Em aberto / inadimplente     saem da MESMA lista que a tabela mostra, pelo
 *                                `resumirCobrancas()`. Clicar no card filtra a
 *                                tabela pela situação correspondente — o card e as
 *                                linhas nunca podem discordar porque são o mesmo
 *                                array.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DUAS DIFERENÇAS PARA O RESTO DO PAINEL, e o porquê de cada uma.
 *
 * 1. A TABELA NÃO É A `<AdmTable>`, e não é por preguiça. `AdmTable` exige
 *    `chave: (linha) => string` — uma FUNÇÃO — além de `celula`, `ordenar` e
 *    `FacetaDef.valor`. Função não atravessa a fronteira RSC (é o que
 *    `TabelaGenerica.tsx` explica no cabeçalho: "montar as colunas no servidor e
 *    passá-las como prop lançaria em runtime"), então usá-la exigiria um Client
 *    Component novo — `src/components/adm/TabelaCobrancas.tsx`, no molde de
 *    `ListaUsuarios` —, que é um arquivo fora do escopo desta peça. O que se
 *    perde: seletor de colunas, densidade e o painel lateral da linha. O que se
 *    ganha: o filtro vira recorte de verdade no servidor, e cada linha vira LINK
 *    para a ficha do cliente (o que a AdmTable, sem `hrefLinha`, não daria).
 *    Quando o Client Component existir, as colunas daqui migram inteiras.
 *
 * 2. NENHUMA FUNÇÃO É PASSADA PARA O `<SerieTemporal>`. Ele é `'use client'`, e
 *    `formatarValor` é função — mesma fronteira do item 1. O eixo sai com o
 *    formato numérico default, e por isso o painel do gráfico diz "em R$" no
 *    título em vez de repetir o símbolo em cada marca.
 *
 * `force-dynamic` porque isto é tela de conferência: um valor em aberto em cache
 * de 60 s já divergiu do banco quando o Felipe aperta F5 depois de dar baixa.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Receita · Sistema Seabra',
  robots: { index: false, follow: false },
};

const ROTA = '/adm/carteira/receita';
const USUARIOS = '/adm/usuarios';

/** A gramática de filtro do painel (`f.<chave>=`), a mesma que a `<AdmFilters>`
 *  escreve e que a exportação lê. Aqui quem interpreta é o servidor, mas o
 *  dialeto é um só — um link desta tela continua legível para o resto do /adm. */
const P_SITUACAO = `${PREFIXO_FILTRO}situacao`;
const P_VENCIMENTO = `${PREFIXO_FILTRO}vencimento`;

/** Espelha TAMANHOS_PAGINA da `<AdmTable>`. Não dá para importar de lá (módulo
 *  `'use client'`: os exports chegariam ao servidor como referência de cliente,
 *  não como o array), então a lista é duplicada — a alternativa seria a tela ter
 *  uma escala de paginação diferente do resto do painel. */
const TAMANHOS = [25, 50, 100, 250] as const;
const TAMANHO_PADRAO = 50;

/** Sub-linha dos cards que dependem da view da Fase 3 quando ela não respondeu. */
const SEM_COBRANCAS = 'a lista de cobranças não carregou — veja o aviso abaixo';

/** Presets do recorte por vencimento. 'tudo' é a ausência do parâmetro: dinheiro
 *  parado não tem janela — uma cobrança vencida em 2024 continua vencida hoje, e
 *  esconder isso atrás de um filtro default de 12 meses seria apagar da tela
 *  justamente a inadimplência mais velha. */
const PERIODOS = [
  { chave: '30d', rotulo: '30 dias' },
  { chave: '90d', rotulo: '90 dias' },
  { chave: '12m', rotulo: '12 meses' },
  { chave: 'tudo', rotulo: 'Tudo' },
] as const;

/** Segue o precedente de `STATUS_INFO` em `ListaUsuarios.tsx` e de `PAPEL_INFO`
 *  em `types.ts`: cor semântica pela paleta do Tailwind, destrutivo pelo token.
 *  Mora aqui, e não no módulo de área, porque isto é APRESENTAÇÃO — o dado
 *  canônico é a situação, e ela é regra de negócio. */
const SITUACAO_CLASSE: Record<SituacaoCobranca, string> = {
  paga: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40',
  em_aberto: 'text-amber-300 border-amber-900/60 bg-amber-950/40',
  vencida: 'text-destructive border-destructive/40 bg-destructive/10',
  estornada: 'text-sky-300 border-sky-900/60 bg-sky-950/40',
  cancelada: 'text-muted-foreground border-border bg-secondary',
  outra: 'text-muted-foreground border-border bg-secondary',
};

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação — a mesma gramática de `?sort=`, interpretada no servidor
// ─────────────────────────────────────────────────────────────────────────────

type ChaveOrdem = 'usuario' | 'plano' | 'valor' | 'situacao' | 'vencimento' | 'pagamento' | 'atraso';

const ORDENADORES: Record<ChaveOrdem, (l: LinhaCobranca) => string | number | null> = {
  usuario: (l) => l.usuario_nome,
  plano: (l) => l.plano_nome,
  valor: (l) => l.valor,
  // Ordena pelo RÓTULO e não pela chave: a ordem alfabética de "Em aberto,
  // Paga, Vencida" é a que o operador vê na coluna. Ordenar por 'em_aberto' |
  // 'paga' | 'vencida' daria quase o mesmo resultado por acidente e outro
  // qualquer no dia em que um rótulo mudar.
  situacao: (l) => SITUACAO_ROTULO[situacaoDaCobranca(l)],
  vencimento: (l) => l.data_vencimento,
  pagamento: (l) => l.data_pagamento,
  atraso: (l) => l.dias_de_atraso,
};

const ORDEM_PADRAO: { chave: ChaveOrdem; ascendente: boolean } = { chave: 'vencimento', ascendente: false };

function ehChaveOrdem(valor: string): valor is ChaveOrdem {
  return Object.prototype.hasOwnProperty.call(ORDENADORES, valor);
}

/** '-valor' → { valor, desc }. Mesma grafia do `?sort=` da `<AdmTable>` (o '-'
 *  é descendente), aceitando um nível só: aqui não há Shift+clique para empilhar. */
function lerOrdem(bruto: string | null): { chave: ChaveOrdem; ascendente: boolean } {
  const texto = (bruto ?? '').split(SEPARADOR_VALORES)[0]?.trim() ?? '';
  if (texto === '') return ORDEM_PADRAO;
  const ascendente = !texto.startsWith('-');
  const chave = ascendente ? texto.replace(/^\+/, '') : texto.slice(1);
  // Chave desconhecida (link velho, coluna renomeada) volta ao default em vez de
  // virar erro: um favorito do Felipe não pode quebrar uma tela de dinheiro.
  return ehChaveOrdem(chave) ? { chave, ascendente } : ORDEM_PADRAO;
}

/** NULO SEMPRE POR ÚLTIMO, nos dois sentidos — a regra herdada do `DataTable` do
 *  /katmandu e mantida na `<AdmTable>`: inverter a direção não pode encher a
 *  primeira página de linhas vazias. */
function comparar(a: string | number | null, b: string | number | null, sinal: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'pt-BR') * sinal;
  if (a < b) return -1 * sinal;
  if (a > b) return 1 * sinal;
  return 0;
}

function ordenar(linhas: LinhaCobranca[], ordem: { chave: ChaveOrdem; ascendente: boolean }): LinhaCobranca[] {
  const pegar = ORDENADORES[ordem.chave];
  const sinal = ordem.ascendente ? 1 : -1;
  return [...linhas].sort((a, b) => {
    const r = comparar(pegar(a), pegar(b), sinal);
    // Desempate pela chave: sem ele, duas cobranças do mesmo dia trocam de lugar
    // entre uma página e a seguinte, e a paginação passa a pular e repetir linha.
    return r !== 0 ? r : b.pagamento_id - a.pagamento_id;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// URL
// ─────────────────────────────────────────────────────────────────────────────

type Params = Record<string, string | string[] | undefined>;

/**
 * A URL atual com algumas chaves trocadas. `null` remove.
 *
 * Todo link de filtro e de ordenação passa por aqui com `page: null` junto:
 * manter `page=7` depois de cortar a lista para 12 linhas mostra uma tela vazia
 * que parece bug. É a mesma decisão do `ZERAR_PAGINA` da `<AdmFilters>`.
 */
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

function primeiro(valor: string | string[] | undefined): string | null {
  if (valor == null) return null;
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto == null || texto.trim() === '' ? null : texto.trim();
}

function lerSituacoes(bruto: string | null): SituacaoCobranca[] {
  if (!bruto) return [];
  const pedidas = bruto.split(SEPARADOR_VALORES).map((v) => v.trim());
  // Allowlist: valor desconhecido é DESCARTADO em silêncio, e não vira erro — a
  // mesma decisão de `lerOpcoesTabela()` em params.ts, e pelo mesmo motivo (link
  // salvo meses atrás, situação renomeada desde então).
  return SITUACOES.filter((s) => pedidas.includes(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default async function ReceitaPage({ searchParams }: { searchParams: Promise<Params> }) {
  // Um instante só para a página inteira: o carimbo do cabeçalho e o corte do
  // período falam do mesmo relógio.
  const agora = new Date();
  const sp = await searchParams;

  // As duas leituras são independentes de propósito. `getCarteira()` só usa views
  // da Fase 1, que já estão no banco; `listarCobrancas()` usa a view mais nova da
  // obra. Se a Fase 3 ainda não foi migrada, a tela mostra MRR e receita e diz o
  // que falta no lugar da tabela — em vez de morrer inteira por causa da peça mais
  // recente.
  const [carteiraRes, cobrancasRes] = await Promise.all([getCarteira(agora), listarCobrancas()]);

  if (!carteiraRes.ok) return <EstadoVazio resultado={carteiraRes} />;

  const { kpis, receitaMensal } = carteiraRes.dados;
  const todas = cobrancasRes.ok ? cobrancasRes.dados : [];

  // O recorte de período é lido cedo porque o resumo, os contadores e a tabela
  // dependem dele — os três têm que falar do mesmo conjunto.
  const situacoesSel = lerSituacoes(primeiro(sp[P_SITUACAO]));
  const periodoSel = primeiro(sp[P_VENCIMENTO]);
  const periodoAtivo = periodoSel && ehPeriodoRelativo(periodoSel) ? periodoSel : null;
  const desde = periodoAtivo ? diaCivil(inicioDoPeriodo(periodoAtivo, agora)) : null;
  const noPeriodo = filtrarCobrancas(todas, { de: desde });
  // `null` quando a leitura falhou, e NUNCA um resumo de lista vazia: "R$ 0,00 em
  // aberto" por falta de migration é uma afirmação falsa sobre o caixa, e é a
  // mais perigosa desta tela — some com dinheiro que existe sem dar erro nenhum.
  //
  // Resumido sobre `noPeriodo`, não sobre `todas` — ver o recorte logo abaixo.
  const resumo = cobrancasRes.ok ? resumirCobrancas(noPeriodo) : null;

  // O card "recebido em 12 meses" É a soma das barras do gráfico — ver a regra no
  // cabeçalho. `receitaMensal` já vem preenchida mês a mês por `preencherSerie()`,
  // então a soma cobre a janela inteira, inclusive os meses de R$ 0,00.
  const recebido12m = soma(receitaMensal.map((p) => p.valor));

  // ── Recorte da tabela ──────────────────────────────────────────────────────
  const situacoes = situacoesSel;

  // O PERÍODO RECORTA A TELA INTEIRA, não só a tabela.
  //
  // Antes o card e os contadores dos chips somavam `todas` enquanto a tabela
  // mostrava o recorte: com o chip "90 dias" ativo, "Em aberto" anunciava a
  // carteira inteira e o clique entregava outro conjunto. O cabeçalho deste
  // arquivo promete o contrário — o card e as linhas são o mesmo array — e numa
  // tela de dinheiro discordância vira "esse painel está errado".
  //
  // A situação NÃO entra aqui de propósito: ela é o próprio filtro que os chips
  // aplicam, e contá-la aqui zeraria o contador de todo chip não selecionado.
  const filtradas = filtrarCobrancas(noPeriodo, { situacoes });
  const ordem = lerOrdem(primeiro(sp.sort));
  const ordenadas = ordenar(filtradas, ordem);

  const tamanhoBruto = Number(primeiro(sp.size));
  const tamanho = (TAMANHOS as readonly number[]).includes(tamanhoBruto) ? tamanhoBruto : TAMANHO_PADRAO;
  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / tamanho));
  const paginaBruta = Number(primeiro(sp.page));
  const pagina =
    Number.isFinite(paginaBruta) && paginaBruta >= 1 ? Math.min(Math.floor(paginaBruta), totalPaginas) : 1;
  const daPagina = ordenadas.slice((pagina - 1) * tamanho, pagina * tamanho);

  // Contadores dos chips também sobre o período — o número que o chip anuncia
  // tem que ser o número que o clique entrega.
  const contagem = contarPorSituacao(noPeriodo);
  const inicio = ordenadas.length === 0 ? 0 : (pagina - 1) * tamanho + 1;
  const fim = inicio === 0 ? 0 : inicio + daPagina.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl">Receita</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            O que entra por mês (MRR), o que entrou (caixa) e o que falta entrar. Cortesia e extensão
            manual não geram cobrança nenhuma — elas aparecem em{' '}
            <Link href="/adm/carteira/risco" className="text-foreground underline underline-offset-4">
              risco
            </Link>
            , como receita que nunca existiu.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <p className="tabular-nums">lido agora, {formatarDataHora(agora)}</p>
          <nav className="flex gap-2">
            <Link href="/adm/carteira" className="underline-offset-4 hover:text-foreground hover:underline">
              ← Carteira
            </Link>
            <Link href="/adm/carteira/risco" className="underline-offset-4 hover:text-foreground hover:underline">
              Risco →
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Os cinco números ──────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* O único card com dois números do MESMO indicador. O real é MENOR que o
            de tabela de propósito (§2 do desenho), e os dois ficam lado a lado até
            a troca ganhar confiança. Sem `variacao`: pintar a diferença de
            vermelho diria que o número honesto é um problema. */}
        <KpiCard
          destaque
          rotulo="MRR mensal"
          valor={formatarMoeda(kpis.mrrReal)}
          detalhe={
            <>
              tabela {formatarMoeda(kpis.mrrTabela)} · real {formatarMoeda(kpis.mrrReal)}
            </>
          }
          href={`${USUARIOS}?f.origem=pagante&sort=-valor`}
        />

        <KpiCard
          rotulo="Recebido · 12 meses"
          valor={formatarMoeda(recebido12m)}
          detalhe="a soma das barras do gráfico abaixo — caixa, não MRR"
        />

        <KpiCard
          rotulo="ARPU"
          valor={formatarMoeda(kpis.arpu)}
          detalhe={`MRR real dividido pelas ${formatarInteiro(kpis.acesso.pagante)} contas pagantes`}
          href={`${USUARIOS}?f.origem=pagante&sort=-valor`}
        />

        {/* Os três cards abaixo saem da lista de cobranças. Sem ela, valem TRAÇO e
            não R$ 0,00 — e o detalhe diz o que falta, porque um caixa zerado por
            migration ausente é indistinguível de um caixa realmente zerado. */}
        <KpiCard
          rotulo="Em aberto"
          valor={resumo ? formatarMoeda(resumo.emAbertoValor) : VAZIO}
          detalhe={
            resumo
              ? `${formatarInteiro(resumo.emAberto)} cobranças emitidas, no prazo e não confirmadas`
              : SEM_COBRANCAS
          }
          // O href filtra a TABELA desta mesma tela: o card e as linhas são o
          // mesmo array, então o número de cima sempre bate com a soma de baixo.
          href={resumo ? comQuery(sp, { [P_SITUACAO]: 'em_aberto', page: null }) : undefined}
        />

        <KpiCard
          rotulo="Inadimplente"
          valor={resumo ? formatarMoeda(resumo.vencidasValor) : VAZIO}
          detalhe={
            !resumo
              ? SEM_COBRANCAS
              : resumo.vencidas === 0
                ? 'nenhuma cobrança vencida em aberto'
                : [
                    `${formatarInteiro(resumo.vencidas)} cobranças`,
                    `${formatarInteiro(resumo.contasInadimplentes)} contas`,
                    // Só entra quando existe: a view pode não ter calculado atraso
                    // para nenhuma delas, e "maior atraso — dias" não é frase.
                    resumo.maiorAtraso != null
                      ? `maior atraso ${formatarInteiro(resumo.maiorAtraso)} dias`
                      : null,
                  ]
                    .filter((p): p is string => p !== null)
                    .join(' · ')
          }
          href={resumo ? comQuery(sp, { [P_SITUACAO]: 'vencida', page: null }) : undefined}
        />

        <KpiCard
          rotulo="Ticket médio"
          valor={resumo ? formatarMoeda(resumo.ticketMedio) : VAZIO}
          detalhe={
            resumo ? `média das ${formatarInteiro(resumo.pagas)} cobranças pagas do histórico` : SEM_COBRANCAS
          }
        />
      </section>

      <p className="max-w-prose text-xs leading-snug text-muted-foreground">
        O MRR real desconta cortesia, aplica o desconto de associação e divide o plano anual por 12 —
        é menor que o de tabela de propósito, e o de tabela é o número que o app mostra hoje. Já
        &ldquo;recebido&rdquo; é competência de caixa: a soma do que foi efetivamente pago, pelo mês
        em que foi pago.
      </p>

      {/* ── Receita mês a mês ─────────────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-base leading-tight">Receita recebida por mês, em R$</h2>
          <span className="shrink-0 text-xs text-muted-foreground">
            últimos 12 meses · {formatarMoeda(recebido12m)} no período
          </span>
        </div>
        <div className="mt-3">
          {/*
            Sem `formatarValor`: função não atravessa a fronteira RSC (ver o
            cabeçalho). O eixo sai no formato numérico default e a unidade está
            dita no título — o que é preferível a uma tela que estoura em runtime
            no dia em que o banco tiver dado.

            `buracos` fica no default 'zero': mês sem pagamento faturou zero, e
            interromper a linha sugeriria que não houve medição.
          */}
          <SerieTemporal
            series={[{ chave: 'recebido', nome: 'Recebido', pontos: receitaMensal }]}
            altura={220}
            mensagemVazia="Nenhum pagamento confirmado nos últimos 12 meses."
          />
        </div>
      </section>

      {/* ── As cobranças ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg">Cobranças</h2>
          {/* Só conta quando há o que contar: "0 cobranças" ao lado de um aviso de
              migration faltando seria o painel afirmando que a carteira nunca
              faturou nada. */}
          {cobrancasRes.ok && (
            <p className="text-xs tabular-nums text-muted-foreground">
              {ordenadas.length === todas.length
                ? `${formatarInteiro(todas.length)} cobranças`
                : `${formatarInteiro(ordenadas.length)} de ${formatarInteiro(todas.length)} cobranças`}
            </p>
          )}
        </div>

        {!cobrancasRes.ok ? (
          <EstadoVazio resultado={cobrancasRes} />
        ) : (
          <>
            <Filtros sp={sp} situacoes={situacoes} periodo={periodoSel} contagem={contagem} />

            {daPagina.length === 0 ? (
              <EstadoVazio
                titulo="Nenhuma cobrança com esse recorte"
                texto="Os chips acima se somam: situação E período. Limpar os dois devolve a carteira inteira."
                acao={
                  <Link
                    href={comQuery(sp, { [P_SITUACAO]: null, [P_VENCIMENTO]: null, page: null })}
                    className="text-sm text-foreground underline underline-offset-4"
                  >
                    Limpar os filtros
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <Table className="text-[13px]">
                  <TableHeader>
                    <TableRow>
                      <Cabecalho sp={sp} chave="usuario" ordem={ordem}>
                        Usuário
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="plano" ordem={ordem}>
                        Plano
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="valor" ordem={ordem} numerica>
                        Valor
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="situacao" ordem={ordem}>
                        Situação
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="vencimento" ordem={ordem}>
                        Vencimento
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="pagamento" ordem={ordem}>
                        Pagamento
                      </Cabecalho>
                      <Cabecalho sp={sp} chave="atraso" ordem={ordem} numerica>
                        Atraso
                      </Cabecalho>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daPagina.map((c) => (
                      <LinhaCobrancaTabela key={c.pagamento_id} cobranca={c} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Sem linha nenhuma não há o que paginar, e o rodapé "0 / 1" ao lado
                do estado vazio só repetiria a mesma notícia com outra fonte. */}
            {ordenadas.length > 0 && (
              <Paginacao
                sp={sp}
                pagina={pagina}
                totalPaginas={totalPaginas}
                inicio={inicio}
                fim={fim}
                total={ordenadas.length}
                tamanho={tamanho}
              />
            )}

            <p className="max-w-prose text-xs leading-snug text-muted-foreground">
              &ldquo;Vencida&rdquo; é calculada contra o relógio do banco, e não pelo status
              <code className="mx-1 rounded bg-secondary px-1">OVERDUE</code>: esse status só chega
              quando o Asaas manda o webhook, então uma cobrança que venceu ontem ainda está
              <code className="mx-1 rounded bg-secondary px-1">PENDING</code> lá e já é dinheiro
              atrasado aqui — e é justamente a que ainda dá para salvar com um telefonema.
              {resumo != null && resumo.semValor > 0 && (
                <>
                  {' '}
                  {formatarInteiro(resumo.semValor)} cobranças estão sem valor no banco e ficam fora
                  de todas as somas desta tela.
                </>
              )}
            </p>
          </>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Painel somente leitura (D3): nada aqui escreve no banco do app. Dar baixa, reemitir e
        estender continuam sendo pelo Asaas ou pelo app.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Peças
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os chips. São `<Link>` e não checkbox porque quem filtra aqui é o SERVIDOR: a
 * navegação é o próprio mecanismo, o estado fica na URL (favoritável, como o
 * resto do painel) e não há um segundo motor de filtro no cliente.
 */
function Filtros({
  sp,
  situacoes,
  periodo,
  contagem,
}: {
  sp: Params;
  situacoes: SituacaoCobranca[];
  periodo: string | null;
  contagem: Record<SituacaoCobranca, number>;
}) {
  const selecionadas = new Set(situacoes);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="mr-1 text-muted-foreground">Situação:</span>
        {SITUACOES.map((s) => {
          const ativa = selecionadas.has(s);
          // Toggle: clicar num chip ativo tira só ele, e os outros continuam.
          // Dentro da faceta os valores são OU — a mesma semântica da <AdmFilters>.
          const proximas = ativa ? situacoes.filter((v) => v !== s) : [...situacoes, s];
          // Situação sem nenhuma cobrança continua clicável de propósito: o
          // contador ao lado já avisa que o resultado é vazio, e um chip que some
          // faz a barra de filtros mudar de tamanho a cada clique.
          return (
            <Link
              key={s}
              href={comQuery(sp, {
                [P_SITUACAO]: proximas.length > 0 ? proximas.join(SEPARADOR_VALORES) : null,
                page: null,
              })}
              title={SITUACAO_REGRA[s]}
              // `aria-current` e não `aria-pressed`: isto é um link de navegação,
              // não um botão de alternância — o mesmo atributo que o <AdmNav> usa.
              aria-current={ativa ? 'true' : undefined}
              className={cn(
                'rounded-full border px-2 py-0.5 tabular-nums transition-colors',
                ativa
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {SITUACAO_ROTULO[s]} <span className="text-foreground">{formatarInteiro(contagem[s])}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="mr-1 text-muted-foreground">Vencimento:</span>
        {PERIODOS.map((p) => {
          const ativo = p.chave === 'tudo' ? periodo == null : periodo === p.chave;
          return (
            <Link
              key={p.chave}
              href={comQuery(sp, { [P_VENCIMENTO]: p.chave === 'tudo' ? null : p.chave, page: null })}
              aria-current={ativo ? 'true' : undefined}
              className={cn(
                'rounded-full border px-2 py-0.5 transition-colors',
                ativo
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {p.rotulo}
            </Link>
          );
        })}
        <span className="ml-1 text-muted-foreground">
          o corte é pela data de vencimento — a de pagamento é nula em tudo que ainda não foi pago
        </span>
      </div>
    </div>
  );
}

/** Cabeçalho ordenável: clique cicla ascendente → descendente → volta ao padrão.
 *  Mesma grafia de `?sort=` da `<AdmTable>`, mesma ciclagem de três estados. */
function Cabecalho({
  sp,
  chave,
  ordem,
  numerica = false,
  children,
}: {
  sp: Params;
  chave: ChaveOrdem;
  ordem: { chave: ChaveOrdem; ascendente: boolean };
  numerica?: boolean;
  children: React.ReactNode;
}) {
  const atual = ordem.chave === chave;
  const proximo = !atual ? chave : ordem.ascendente ? `-${chave}` : null;
  const Seta = !atual ? ChevronsUpDown : ordem.ascendente ? ArrowUp : ArrowDown;

  return (
    <TableHead
      // `aria-sort` é atributo da CÉLULA de cabeçalho, não do link dentro dela —
      // no link o leitor de tela simplesmente ignora.
      aria-sort={atual ? (ordem.ascendente ? 'ascending' : 'descending') : 'none'}
      className={cn('whitespace-nowrap', numerica && 'text-right')}
    >
      <Link
        href={comQuery(sp, { sort: proximo, page: null })}
        className={cn(
          'inline-flex items-center gap-1 underline-offset-4 hover:underline',
          numerica && 'flex-row-reverse',
          atual ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
        <Seta className={cn('size-3', !atual && 'opacity-40')} aria-hidden="true" />
      </Link>
    </TableHead>
  );
}

function LinhaCobrancaTabela({ cobranca }: { cobranca: LinhaCobranca }) {
  const situacao = situacaoDaCobranca(cobranca);
  const atraso = cobranca.dias_de_atraso;

  return (
    <TableRow>
      <TableCell className="max-w-56 truncate">
        {/* A cobrança de uma ASSOCIAÇÃO não tem usuario_id (o CHECK do banco
            aceita um dono só). Não é dado faltando: é dinheiro real sem ficha de
            cliente para abrir — e por isso a linha não vira link falso. */}
        {cobranca.usuario_id != null ? (
          <Link
            href={`/adm/u/${cobranca.usuario_id}`}
            className="text-foreground underline-offset-4 hover:underline"
            title={`Abrir a ficha do usuário ${cobranca.usuario_id}`}
          >
            {cobranca.usuario_nome ?? `#${cobranca.usuario_id}`}
          </Link>
        ) : (
          <span className="text-muted-foreground" title="Assinatura de associação: não há conta de usuário">
            associação
          </span>
        )}
      </TableCell>

      <TableCell className="max-w-48 truncate text-muted-foreground">{cobranca.plano_nome ?? VAZIO}</TableCell>

      <TableCell className="text-right tabular-nums">{formatarMoeda(cobranca.valor)}</TableCell>

      <TableCell>
        <span
          className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', SITUACAO_CLASSE[situacao])}
          title={`${SITUACAO_REGRA[situacao]}${cobranca.status ? ` (${cobranca.status})` : ''}`}
        >
          {SITUACAO_ROTULO[situacao]}
        </span>
      </TableCell>

      {/* `date` puro do Postgres: formatarData fatia o texto em vez de passar por
          new Date(), que voltaria um dia depois das 21h no fuso de São Paulo. */}
      <TableCell className="tabular-nums">{formatarData(cobranca.data_vencimento)}</TableCell>

      <TableCell className="tabular-nums text-muted-foreground">
        {formatarData(cobranca.data_pagamento)}
      </TableCell>

      <TableCell className="text-right tabular-nums">
        {/* Atraso só aparece quando existe: um "0" numa coluna de atraso lê como
            "em dia hoje", e o que a linha quer dizer é "não se aplica". */}
        {atraso == null || atraso <= 0 ? (
          <span className="text-muted-foreground">{VAZIO}</span>
        ) : (
          <span className={cn(situacao === 'vencida' && 'text-destructive')}>
            {formatarInteiro(atraso)}d
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Paginação por links — o mesmo vocabulário do rodapé da `<AdmTable>` ("1–50 de
 *  N"), porque o operador está auditando e precisa saber QUANTOS são. */
function Paginacao({
  sp,
  pagina,
  totalPaginas,
  inicio,
  fim,
  total,
  tamanho,
}: {
  sp: Params;
  pagina: number;
  totalPaginas: number;
  inicio: number;
  fim: number;
  total: number;
  tamanho: number;
}) {
  const temAnterior = pagina > 1;
  const temProxima = pagina < totalPaginas;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <p className="tabular-nums">
        {total === 0 ? 'nenhuma cobrança' : `${formatarInteiro(inicio)}–${formatarInteiro(fim)} de ${formatarInteiro(total)} cobranças`}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span>por página:</span>
          {TAMANHOS.map((t) => (
            <Link
              key={t}
              href={comQuery(sp, { size: t === TAMANHO_PADRAO ? null : String(t), page: null })}
              className={cn(
                'rounded px-1.5 py-0.5 tabular-nums transition-colors',
                t === tamanho ? 'bg-secondary text-foreground' : 'hover:text-foreground',
              )}
            >
              {t}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <PassoPagina sp={sp} destino={pagina - 1} ativo={temAnterior} rotulo="Página anterior">
            <ChevronLeft className="size-4" aria-hidden="true" />
          </PassoPagina>
          <span className="tabular-nums">
            {formatarInteiro(pagina)} / {formatarInteiro(totalPaginas)}
          </span>
          <PassoPagina sp={sp} destino={pagina + 1} ativo={temProxima} rotulo="Próxima página">
            <ChevronRight className="size-4" aria-hidden="true" />
          </PassoPagina>
        </div>
      </div>
    </div>
  );
}

/** O passo desativado vira `<span>`, não um link morto: um `<a>` que não navega
 *  ainda é foco de teclado e ainda parece clicável. */
function PassoPagina({
  sp,
  destino,
  ativo,
  rotulo,
  children,
}: {
  sp: Params;
  destino: number;
  ativo: boolean;
  rotulo: string;
  children: React.ReactNode;
}) {
  const classe = 'rounded border border-border p-1 transition-colors';
  if (!ativo) {
    return (
      <span className={cn(classe, 'opacity-30')} aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={comQuery(sp, { page: destino <= 1 ? null : String(destino) })}
      aria-label={rotulo}
      className={cn(classe, 'hover:border-primary/60 hover:text-foreground')}
    >
      {children}
    </Link>
  );
}
