/**
 * Paleta, defaults e utilitários compartilhados pelos quatro gráficos do /adm.
 *
 * Duas decisões atravessam o arquivo inteiro:
 *
 * 1. COR VEM DE TOKEN, SEMPRE. O que o recharts aceita como `var(--token)` —
 *    grade, eixos, cursor, tooltip — vai por `var()`, igual ao que
 *    src/components/katmandu/EvolucaoChart.tsx já faz em produção. O que precisa
 *    de cor resolvida (série e gradiente) vai em hex, e cada hex traz ao lado o
 *    token de origem e o L* aproximado. Não se usa `getComputedStyle()` aqui:
 *    ler token do DOM exige efeito + segundo render, o primeiro paint sairia sem
 *    cor, e no SSR não há DOM nenhum para ler.
 *
 * 2. UM ACENTO SÓ. O tema é escuro monocromático com um acento ocre; dar um
 *    matiz novo a cada série transformaria o painel num arco-íris e mataria a
 *    identidade. A escala varia LUMINOSIDADE sobre o mesmo matiz — o que tem o
 *    efeito colateral de ser a única escala que continua legível depois de o
 *    Felipe imprimir o dossiê (D4) em preto e branco.
 */

import type { CSSProperties } from 'react';
import type { FatiaDistribuicao } from '@/lib/adm/types';
import {
  VAZIO,
  formatarDiaCurto,
  formatarInteiro,
  formatarKg,
  formatarLitros,
  formatarMes,
  formatarMoeda,
  formatarNumero,
} from '@/lib/adm/format';

// ─────────────────────────────────────────────────────────────────────────────
// Cores
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A escala de séries, derivada de --ocre (#c8813c) por luminosidade.
 *
 * Degraus de ~11 a ~15 pontos de L*, e a ORDEM é embaralhada de propósito: as
 * séries 1 e 2 (as que quase sempre são as únicas) ficam a 26 pontos de
 * distância, o máximo que a escala permite. Em cinza puro elas continuam sendo
 * "a escura" e "a clara", sem depender do matiz.
 *
 * O piso é L*≈40. Abaixo disso a linha desaparece: o card é --surface-1
 * (#121212, L*≈7) e um traço em L*30 dá menos de 2:1 contra ele — invisível
 * exatamente para quem mais precisa de contraste.
 */
export const SERIES = [
  '#c8813c', // --ocre                    L*≈60 — série única = o acento, sempre
  '#f0d3b0', // --ocre clareado 2×        L*≈86
  '#a06a35', // --ocre escurecido         L*≈50
  '#dfb181', // --ocre clareado           L*≈75
  '#82552f', // --ocre escurecido 2×      L*≈40 (o piso)
] as const;

/**
 * A MESMA escala, rebaixada para FUNDO BRANCO — a folha do dossiê (decisão D4).
 *
 * Índice a índice: quem é a série 2 na tela é a série 2 no papel; muda só a
 * luminosidade. Duas séries de SERIES foram calibradas para brilhar sobre o
 * canvas #000 e desaparecem sobre o branco: `#f0d3b0` dá ~1,4:1 e `#dfb181`
 * ~2,0:1 — no PDF a fatia do donut some e o anel sai com um buraco onde deveria
 * haver 20% do plantel. O mínimo aqui é 3:1 (WCAG 1.4.11, elemento gráfico).
 *
 * O TIPO AMARRA O COMPRIMENTO ao de SERIES: acrescentar uma cor lá sem
 * acrescentar aqui não compila. É o oposto de duas paletas divergindo em
 * silêncio — que é exatamente o que o §3 de src/app/adm/dossie.css alerta.
 */
/** Mapeia uma tupla para outra do MESMO comprimento. Precisa do parâmetro
 *  genérico: `{ [K in keyof typeof SERIES]: string }` escrito direto não é
 *  homomórfico e acaba mapeando `length` e os métodos de Array para string. */
type MesmoComprimento<T extends readonly unknown[]> = { [K in keyof T]: string };

export const SERIES_PAPEL: MesmoComprimento<typeof SERIES> = [
  '#c8813c', // = --ocre, 3,2:1 — o acento da marca não muda de cor no papel
  '#7a4e1c', // no lugar de #f0d3b0 (1,4:1) → 8,0:1
  '#a06a35', // 4,4:1 — já servia
  '#5e3a12', // no lugar de #dfb181 (2,0:1) → 11,3:1
  '#82552f', // 6,4:1 — já servia
];

export function corSerie(indice: number): string {
  return SERIES[indice % SERIES.length];
}

/**
 * Segundo canal de distinção, para o PDF em preto e branco: mesmo com ΔL* de 11
 * pontos entre duas séries vizinhas, o padrão de traço separa na hora. A série 1
 * é sólida — é sempre a que importa.
 */
const TRACOS: readonly (string | undefined)[] = [undefined, '6 4', '2 3', '10 4 2 4', '1 3'];

export function tracoSerie(indice: number): string | undefined {
  return TRACOS[indice % TRACOS.length];
}

/**
 * O agregado "outros" não é uma categoria: é o resto. Cinza neutro (--ink-2)
 * para não competir com as fatias que têm nome próprio.
 */
export const COR_OUTROS = 'var(--ink-2)';

export const COR_GRID = 'var(--line-subtle)';
export const COR_EIXO_TEXTO = 'var(--ink-1)';
export const COR_EIXO_LINHA = 'var(--line-subtle)';
/** Linha de referência (o zero da pirâmide): precisa ser vista, não só sugerida. */
export const COR_REFERENCIA = 'var(--line-strong)';
/** Fundo do card, usado como "vão" entre fatias e como miolo do ponto da linha. */
export const COR_FUNDO = 'var(--card)';

// ─────────────────────────────────────────────────────────────────────────────
// Defaults de eixo, grade e tooltip
// ─────────────────────────────────────────────────────────────────────────────

/** Altura default de um gráfico de série/donut. Cabe em card sem virar pôster. */
export const ALTURA_PADRAO = 260;

/** Tick de texto dos eixos — spread em <XAxis tick={...}>. */
export const TICK_EIXO = { fill: COR_EIXO_TEXTO, fontSize: 12 };

/**
 * Props comuns dos eixos. Sem borda em volta do gráfico e sem marcador de tick:
 * a grade discreta já dá a referência, e cada traço a mais é ruído entre o olho
 * e o número.
 */
export const EIXO_BASE = {
  stroke: COR_EIXO_LINHA,
  tick: TICK_EIXO,
  tickLine: false,
  axisLine: { stroke: COR_EIXO_LINHA },
};

/** Eixo de valor: sem linha de base própria — a grade horizontal já cumpre o papel. */
export const EIXO_VALOR = {
  ...EIXO_BASE,
  axisLine: false as const,
};

/**
 * --popover é --surface-3 e --border é --line-subtle (ver globals.css): os nomes
 * semânticos são os que o repo manda consumir, e resolvem exatamente nos tokens
 * pedidos. fontVariantNumeric aqui é o que garante tabular-nums também no
 * tooltip, que o recharts renderiza fora da árvore do gráfico.
 */
export const TOOLTIP_ESTILO: CSSProperties = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--popover-foreground)',
  fontSize: 13,
  boxShadow: 'none',
  fontVariantNumeric: 'tabular-nums',
};

export const TOOLTIP_ROTULO_ESTILO: CSSProperties = {
  color: 'var(--muted-foreground)',
  fontSize: 12,
  marginBottom: 4,
};

export const TOOLTIP_ITEM_ESTILO: CSSProperties = {
  color: 'var(--popover-foreground)',
  padding: 0,
};

/** Cursor de gráfico cartesiano de linha: um fio vertical, não uma faixa. */
export const CURSOR_LINHA = { stroke: 'var(--line-strong)', strokeWidth: 1 };
/** Cursor de barra: faixa translúcida em --secondary (= --surface-2). */
export const CURSOR_BARRA = { fill: 'var(--secondary)', fillOpacity: 0.6 };

// ─────────────────────────────────────────────────────────────────────────────
// Estado vazio
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Um gráfico sem dado NÃO deve renderizar eixos vazios: uma moldura com grade e
 * nada dentro parece falha de carregamento, e o Felipe vai recarregar a página
 * atrás de um dado que não existe. A borda tracejada diz "aqui é um gráfico, e
 * ele está vazio de propósito".
 */
export const CLASSES_VAZIO =
  'flex w-full items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground';

export const MENSAGEM_VAZIA = 'Sem dados no período';

// ─────────────────────────────────────────────────────────────────────────────
// Períodos
// ─────────────────────────────────────────────────────────────────────────────

export type Granularidade = 'mes' | 'dia';

/** 'YYYY-MM' é mensal; 'YYYY-MM-DD' é diário. É o contrato de PontoSerie.periodo. */
export function detectarGranularidade(periodo: string | undefined): Granularidade {
  return periodo != null && periodo.length > 7 ? 'dia' : 'mes';
}

/** Rótulo curto do eixo X: 'set/2026' ou '04/09'. */
export function rotuloEixo(periodo: string, granularidade: Granularidade): string {
  return granularidade === 'mes' ? formatarMes(periodo) : formatarDiaCurto(periodo);
}

/**
 * Nomes por extenso em tabela local, e não via Intl, pelo mesmo motivo que
 * formatarMes() em src/lib/adm/format.ts: a grafia do pt-BR mudou entre versões
 * do ICU, e com Node e browser em ICUs diferentes o tooltip renderizado no
 * servidor não bate com o do cliente — o React descarta a árvore com erro de
 * hidratação.
 */
const MESES_EXTENSO = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

/**
 * Título do tooltip: 'setembro de 2026' ou 'sexta-feira, 4 de setembro de 2026'.
 *
 * O dia da semana é calculado em UTC sobre a data PURA ('YYYY-MM-DD'), sem
 * passar por fuso: `periodo` é um dia civil, não um instante, e convertê-lo para
 * America/Sao_Paulo devolveria o dia anterior — o bug que o app já teve.
 */
export function rotuloExtenso(periodo: string, granularidade: Granularidade): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(periodo);
  if (!m) return periodo;

  const ano = Number(m[1]);
  const mes = Number(m[2]) - 1;
  if (mes < 0 || mes > 11) return periodo;

  if (granularidade === 'mes' || m[3] == null) {
    return `${MESES_EXTENSO[mes]} de ${ano}`;
  }

  const dia = Number(m[3]);
  const semana = DIAS_SEMANA[new Date(Date.UTC(ano, mes, dia)).getUTCDay()];
  return `${semana}, ${dia} de ${MESES_EXTENSO[mes]} de ${ano}`;
}

/**
 * Devolve TODOS os períodos entre o primeiro e o último, inclusive os que não
 * vieram do banco. É o que permite ao gráfico mostrar o buraco: sem isto, um
 * mês sem lançamento simplesmente não existe no eixo e a linha liga fevereiro em
 * abril como se março tivesse sido normal.
 *
 * `teto` existe porque uma série diária de 5 anos daria 1.800 pontos para
 * ~600 px de largura: acima do teto, devolve só o que veio ordenado — melhor um
 * eixo irregular do que travar o browser desenhando pontos de subpixel.
 */
export function eixoDePeriodos(periodos: readonly string[], granularidade: Granularidade, teto = 800): string[] {
  const unicos = Array.from(new Set(periodos)).sort();
  if (unicos.length === 0) return [];

  const inicio = unicos[0];
  const fim = unicos[unicos.length - 1];

  if (granularidade === 'mes') {
    const a = /^(\d{4})-(\d{2})/.exec(inicio);
    const b = /^(\d{4})-(\d{2})/.exec(fim);
    if (!a || !b) return unicos;

    const de = Number(a[1]) * 12 + (Number(a[2]) - 1);
    const ate = Number(b[1]) * 12 + (Number(b[2]) - 1);
    if (ate < de || ate - de + 1 > teto) return unicos;

    const saida: string[] = [];
    for (let i = de; i <= ate; i += 1) {
      const ano = Math.floor(i / 12);
      const mes = (i % 12) + 1;
      saida.push(`${ano}-${String(mes).padStart(2, '0')}`);
    }
    return saida;
  }

  const de = Date.parse(`${inicio}T00:00:00Z`);
  const ate = Date.parse(`${fim}T00:00:00Z`);
  if (Number.isNaN(de) || Number.isNaN(ate) || ate < de) return unicos;

  const DIA_MS = 86_400_000;
  if ((ate - de) / DIA_MS + 1 > teto) return unicos;

  const saida: string[] = [];
  for (let t = de; t <= ate; t += DIA_MS) {
    saida.push(new Date(t).toISOString().slice(0, 10));
  }
  return saida;
}

// ─────────────────────────────────────────────────────────────────────────────
// Valores
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formatador default de qualquer gráfico. Inteiro sai sem casa decimal (4.820
 * animais, não 4.820,0) e fracionário sai com uma.
 */
export function formatarValorPadrao(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return VAZIO;
  return Number.isInteger(valor) ? formatarInteiro(valor) : formatarNumero(valor, 1);
}

/**
 * Quem precisa de R$, L ou kg passa `formato`, uma CHAVE — nunca a função de
 * `src/lib/adm/format.ts` diretamente. `SerieTemporal` e `DistribuicaoBarras`
 * são Client Components; uma página server passando `formatarValor={formatarMoeda}`
 * manda uma FUNÇÃO pela fronteira RSC, e o React recusa em runtime com "Functions
 * cannot be passed directly to Client Components" — 500 na tela, não aviso de
 * build. Esse foi exatamente o defeito que existiu aqui antes desta chave
 * existir: compilava, passava no lint, e quebrava a primeira vez que alguém
 * abriu a tela com dado de verdade.
 */
export type ChaveFormato = 'inteiro' | 'moeda' | 'numero1' | 'litros' | 'litros0' | 'kg';

const FORMATADORES_POR_CHAVE: Record<ChaveFormato, (valor: number) => string> = {
  inteiro: formatarInteiro,
  moeda: formatarMoeda,
  numero1: (v) => formatarNumero(v, 1),
  litros: (v) => formatarLitros(v),
  litros0: (v) => formatarLitros(v, 0),
  kg: (v) => formatarKg(v),
};

/** Resolve a chave na função — chamado DENTRO do componente client, nunca antes. */
export function resolverFormatador(chave: ChaveFormato | undefined): (valor: number) => string {
  return chave ? FORMATADORES_POR_CHAVE[chave] : formatarValorPadrao;
}

/** O recharts entrega o valor como number | string | array; aqui só number interessa. */
export function comoNumero(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  if (typeof valor === 'string') {
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribuições
// ─────────────────────────────────────────────────────────────────────────────

/** FatiaDistribuicao depois do corte em N — o "outros" é sintético e se declara. */
export interface FatiaAgregada extends FatiaDistribuicao {
  /** true só na fatia sintética: ela recebe cinza, nunca cor de série. */
  outros: boolean;
  /** Quantas categorias reais a fatia representa — 1, ou N quando é "outros". */
  itens: number;
}

/**
 * Ordena por valor, corta em `maximo` e soma o resto em "Outros (n)".
 *
 * Categoria com valor 0 ou negativo cai fora: no donut ela desapareceria sozinha
 * e na barra viraria um rótulo apontando para nada. Distribuição é composição de
 * um total — quem não compõe não é fatia.
 */
export function agregarOutros(dados: readonly FatiaDistribuicao[], maximo: number): FatiaAgregada[] {
  const validas = dados
    .filter((d) => typeof d.valor === 'number' && Number.isFinite(d.valor) && d.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  if (validas.length <= maximo) {
    return validas.map((d) => ({ rotulo: d.rotulo, valor: d.valor, outros: false, itens: 1 }));
  }

  const principais = validas.slice(0, maximo);
  const resto = validas.slice(maximo);
  const soma = resto.reduce((acc, d) => acc + d.valor, 0);

  return [
    ...principais.map((d) => ({ rotulo: d.rotulo, valor: d.valor, outros: false, itens: 1 })),
    { rotulo: `Outros (${resto.length})`, valor: soma, outros: true, itens: resto.length },
  ];
}

/**
 * Encurta rótulo comprido do eixo de categoria. O SVG não quebra linha nem
 * mostra title no hover, então o corte é definitivo — por isso o tooltip do
 * gráfico sempre carrega o rótulo inteiro.
 */
export function encurtar(rotulo: string, limite = 22): string {
  return rotulo.length <= limite ? rotulo : `${rotulo.slice(0, limite - 1).trimEnd()}…`;
}
