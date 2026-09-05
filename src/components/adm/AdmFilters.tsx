'use client';

/**
 * Filtros facetados do /adm — e, de quebra, o DIALETO DA URL que o painel inteiro fala.
 *
 * POR QUE O DIALETO NASCE AQUI, e não em AdmTable.tsx: o filtro é o único que
 * escreve chaves DINÂMICAS (`f.<coluna>`); tabela e exportação só leem e escrevem
 * chaves fixas. Se o hook morasse na tabela, este arquivo importaria dela e ela
 * importaria daqui — ciclo de import entre dois Client Components, que o bundler
 * resolve por acaso e quebra na ordem errada. A dependência é de mão única:
 * AdmTable → AdmFilters e ExportMenu → AdmFilters.
 *
 * A GRAMÁTICA (o que o Felipe salva nos favoritos):
 *
 *   ?f.papel=produtor,tecnico     enum multi-seleção
 *   ?f.peso=40..80                intervalo numérico (aberto dos dois lados: `40..` e `..80`)
 *   ?f.nascimento=30d             período relativo — reavaliado a cada visita
 *   ?f.nascimento=2024-01-01..2025-12-31   período absoluto
 *   ?f.ativo=sim                  booleano tri-state (ausente = todos)
 *   ?f.nome=boa vista             texto contém, sem acento e sem caixa
 *
 * A CONTAGEM POR VALOR é calculada sobre o conjunto já filtrado pelas OUTRAS
 * facetas — nunca sobre o conjunto final. Se fosse sobre o final, todo valor não
 * escolhido apareceria com 0 e o painel viraria um beco sem saída: escolher um
 * segundo valor da mesma faceta só poderia diminuir a lista, quando na verdade
 * ele a aumenta (dentro de uma faceta os valores são OU, entre facetas são E).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { diaCivil, formatarData, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { PREFIXO_FILTRO, SEM_VALOR } from '@/lib/adm/url';

// ─────────────────────────────────────────────────────────────────────────────
// O dialeto da URL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O dialeto em si mora em '@/lib/adm/url' — um módulo sem diretiva, porque o
 * SERVIDOR também precisa dele: a rota de exportação lê a mesma query string
 * desta tela para que o arquivo baixado seja o que está na grade. Um módulo
 * 'use client' importado pelo servidor entrega referências de cliente em vez
 * de valores, então a constante precisa nascer fora daqui.
 *
 * Reexportado para não quebrar quem já importa daqui.
 */
export { PREFIXO_FILTRO, SEM_VALOR };

export type Mudancas = Record<string, string | null>;

/**
 * Mudar filtro tem que voltar para a página 1: manter `page=7` depois de cortar
 * a lista para 12 linhas mostra uma tela vazia que parece bug. `cursor` some
 * junto porque o keyset da página 7 não vale mais nada no conjunto novo.
 */
export const ZERAR_PAGINA: Mudancas = { page: null, cursor: null };

/** Só o que se lê de um URLSearchParams. Evita importar ReadonlyURLSearchParams
 *  do next/navigation e aceita tanto o objeto do hook quanto um construído à mão. */
export interface LeitorParams {
  get(chave: string): string | null;
}

/**
 * Lê e escreve o estado do painel na URL.
 *
 * `router.replace` e não `push`: ajustar um filtro seis vezes não pode entupir o
 * histórico com seis entradas — o botão Voltar tem que sair da tela, não desfazer
 * um clique de checkbox. `scroll: false` porque a página não deve pular para o
 * topo quando o Felipe mexe num filtro no rodapé da tabela.
 */
export function useParamsAdm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const aplicar = useCallback(
    (mudancas: Mudancas) => {
      const proximo = new URLSearchParams(params.toString());
      for (const [chave, valor] of Object.entries(mudancas)) {
        if (valor === null || valor === '') proximo.delete(chave);
        else proximo.set(chave, valor);
      }
      const busca = proximo.toString();
      router.replace(busca ? `${pathname}?${busca}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return { params, aplicar };
}

// ─────────────────────────────────────────────────────────────────────────────
// Definição de faceta
// ─────────────────────────────────────────────────────────────────────────────

export type TipoFaceta = 'enum' | 'intervalo' | 'data' | 'booleano' | 'texto';

/** O que `valor()` pode devolver. O array cobre `propriedades.segmentos` (text[]),
 *  onde uma linha pertence a vários valores da mesma faceta ao mesmo tempo. */
export type ValorFaceta = string | number | boolean | null | undefined | readonly (string | null)[];

export interface FacetaDef<T> {
  /** Nome do parâmetro depois do prefixo: `estado` vira `?f.estado=`. */
  chave: string;
  rotulo: string;
  tipo: TipoFaceta;
  /** Extrai da linha o valor que o filtro compara. */
  valor: (linha: T) => ValorFaceta;
  /** Traduz o valor cru para leitura humana ('caprino_leiteiro' → 'Caprino leiteiro'). */
  rotuloValor?: (valor: string) => string;
  /** Ordem e universo fixos das opções (ex.: PAPEIS). Sem isto, as opções saem do
   *  próprio dado, ordenadas por frequência. */
  opcoes?: readonly string[];
  /** Sufixo de unidade no intervalo numérico ('kg', 'L', 'dias'). */
  unidade?: string;
  /** Casas decimais na exibição do intervalo. 0 = inteiro. */
  casas?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtros ativos
// ─────────────────────────────────────────────────────────────────────────────

export const PRESETS_PERIODO = [
  { chave: '7d', rotulo: '7 dias', dias: 7 },
  { chave: '30d', rotulo: '30 dias', dias: 30 },
  { chave: '90d', rotulo: '90 dias', dias: 90 },
  { chave: '12m', rotulo: '12 meses', dias: 365 },
  { chave: 'tudo', rotulo: 'Tudo', dias: null },
] as const;

export type PresetPeriodo = (typeof PRESETS_PERIODO)[number]['chave'];

export type Filtro =
  | { tipo: 'enum'; valores: string[] }
  | { tipo: 'intervalo'; de: number | null; ate: number | null }
  | { tipo: 'data'; de: string | null; ate: string | null; preset: PresetPeriodo | null }
  | { tipo: 'booleano'; valor: boolean }
  | { tipo: 'texto'; termo: string };

/** Chave da faceta → filtro ativo. Faceta ausente = sem filtro (nunca `null`). */
export type Filtros = Record<string, Filtro>;

/** Acentuação e caixa fora: 'São João' casa com 'sao joao'. É o mesmo efeito do
 *  `unaccent` que a busca do servidor usa — as duas pontas precisam concordar. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** 'YYYY-MM-DD' de N dias atrás, contado em dia civil de São Paulo. A aritmética
 *  é em UTC sobre a meia-noite do dia civil — nunca sobre o instante local, que
 *  daria um dia a mais ou a menos dependendo de onde a página renderizou. */
function diaMenos(dias: number, agora: string | Date): string | null {
  const base = diaCivil(agora);
  if (!base) return null;
  const ms = Date.parse(`${base}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms - dias * 86_400_000).toISOString().slice(0, 10);
}

function presetValido(bruto: string): PresetPeriodo | null {
  const achado = PRESETS_PERIODO.find((p) => p.chave === bruto);
  return achado ? achado.chave : null;
}

const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function numeroOuNulo(bruto: string): number | null {
  const limpo = bruto.trim().replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

/**
 * Traduz os `?f.*` da URL para filtros tipados.
 *
 * Nada aqui lança: todo valor vem de fora (link colado, favorito velho, faceta
 * que mudou de tipo). Um parâmetro ilegível é DESCARTADO — a tela mostra a lista
 * sem aquele filtro, nunca um erro.
 */
export function lerFiltros<T>(
  facetas: readonly FacetaDef<T>[],
  params: LeitorParams,
  agora: string | Date = new Date(),
): Filtros {
  const filtros: Filtros = {};

  for (const faceta of facetas) {
    const bruto = params.get(`${PREFIXO_FILTRO}${faceta.chave}`);
    if (bruto === null) continue;
    const texto = bruto.trim();
    if (texto === '') continue;

    switch (faceta.tipo) {
      case 'enum': {
        const valores = texto
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== '');
        if (valores.length > 0) filtros[faceta.chave] = { tipo: 'enum', valores };
        break;
      }
      case 'intervalo': {
        const [a, b] = texto.includes('..') ? texto.split('..') : [texto, texto];
        const de = numeroOuNulo(a ?? '');
        const ate = numeroOuNulo(b ?? '');
        if (de !== null || ate !== null) filtros[faceta.chave] = { tipo: 'intervalo', de, ate };
        break;
      }
      case 'data': {
        const preset = presetValido(texto);
        if (preset) {
          const p = PRESETS_PERIODO.find((x) => x.chave === preset);
          // 'tudo' é um filtro que não filtra: existe para o chip mostrar a
          // escolha explícita em vez de parecer que ninguém tocou na faceta.
          const de = p && p.dias !== null ? diaMenos(p.dias, agora) : null;
          filtros[faceta.chave] = { tipo: 'data', de, ate: null, preset };
          break;
        }
        const [a, b] = texto.includes('..') ? texto.split('..') : [texto, texto];
        const de = a && SO_DATA.test(a.trim()) ? a.trim() : null;
        const ate = b && SO_DATA.test(b.trim()) ? b.trim() : null;
        if (de || ate) filtros[faceta.chave] = { tipo: 'data', de, ate, preset: null };
        break;
      }
      case 'booleano': {
        const v = normalizar(texto);
        if (v === 'sim' || v === 'true' || v === '1') filtros[faceta.chave] = { tipo: 'booleano', valor: true };
        else if (v === 'nao' || v === 'false' || v === '0') filtros[faceta.chave] = { tipo: 'booleano', valor: false };
        break;
      }
      case 'texto': {
        filtros[faceta.chave] = { tipo: 'texto', termo: texto };
        break;
      }
    }
  }

  return filtros;
}

/** Quantas facetas estão de fato filtrando. 'tudo' não conta — não corta nada. */
export function contarFiltrosAtivos(filtros: Filtros): number {
  return Object.values(filtros).filter((f) => !(f.tipo === 'data' && f.preset === 'tudo')).length;
}

/** O valor da linha como lista de chaves de enum. Null/vazio vira SEM_VALOR para
 *  que "sem número de criador" seja uma opção clicável, e não um buraco. */
function chavesDaLinha<T>(faceta: FacetaDef<T>, linha: T): string[] {
  const bruto = faceta.valor(linha);
  if (bruto === null || bruto === undefined) return [SEM_VALOR];
  if (Array.isArray(bruto)) {
    const itens = bruto.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return itens.length > 0 ? itens : [SEM_VALOR];
  }
  const texto = String(bruto).trim();
  return texto === '' ? [SEM_VALOR] : [texto];
}

function numeroDaLinha<T>(faceta: FacetaDef<T>, linha: T): number | null {
  const bruto = faceta.valor(linha);
  if (typeof bruto === 'number') return Number.isFinite(bruto) ? bruto : null;
  if (typeof bruto === 'string' && bruto.trim() !== '') {
    const n = Number(bruto);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function diaDaLinha<T>(faceta: FacetaDef<T>, linha: T): string | null {
  const bruto = faceta.valor(linha);
  if (typeof bruto !== 'string' || bruto.trim() === '') return null;
  return diaCivil(bruto);
}

/** Uma linha passa por um filtro? Dentro da faceta os valores são OU. */
function casa<T>(faceta: FacetaDef<T>, filtro: Filtro, linha: T): boolean {
  switch (filtro.tipo) {
    case 'enum': {
      const chaves = chavesDaLinha(faceta, linha);
      return filtro.valores.some((v) => chaves.includes(v));
    }
    case 'intervalo': {
      const n = numeroDaLinha(faceta, linha);
      // Sem valor nunca cabe num intervalo: 'peso ≥ 40' não pode incluir a cabra
      // que nunca foi pesada — seria inventar um dado que não existe.
      if (n === null) return false;
      if (filtro.de !== null && n < filtro.de) return false;
      if (filtro.ate !== null && n > filtro.ate) return false;
      return true;
    }
    case 'data': {
      if (filtro.de === null && filtro.ate === null) return true;
      const d = diaDaLinha(faceta, linha);
      if (d === null) return false;
      // Comparação de 'YYYY-MM-DD' como TEXTO é correta e não cria Date nenhum:
      // o formato é lexicograficamente ordenado por construção.
      if (filtro.de !== null && d < filtro.de) return false;
      if (filtro.ate !== null && d > filtro.ate) return false;
      return true;
    }
    case 'booleano': {
      const bruto = faceta.valor(linha);
      return (bruto === true) === filtro.valor;
    }
    case 'texto': {
      const alvo = normalizar(filtro.termo);
      if (alvo === '') return true;
      return chavesDaLinha(faceta, linha).some((v) => normalizar(v).includes(alvo));
    }
  }
}

/**
 * Aplica os filtros em memória. `ignorar` deixa uma faceta de fora — é o que
 * permite contar as opções dela sobre o conjunto das OUTRAS.
 */
export function filtrarLinhas<T>(
  linhas: readonly T[],
  facetas: readonly FacetaDef<T>[],
  filtros: Filtros,
  ignorar?: string,
): T[] {
  const ativos = facetas.filter((f) => f.chave !== ignorar && filtros[f.chave] !== undefined);
  if (ativos.length === 0) return [...linhas];
  return linhas.filter((linha) => ativos.every((f) => casa(f, filtros[f.chave]!, linha)));
}

export interface OpcaoFaceta {
  valor: string;
  rotulo: string;
  contagem: number;
}

/** Teto de opções renderizadas num painel. Acima disto a busca é o caminho —
 *  uma lista de 1.500 checkboxes não é um filtro, é um problema novo. */
const MAX_OPCOES = 200;

/**
 * As opções de uma faceta enum com a contagem de cada valor, calculada sobre o
 * conjunto filtrado pelas OUTRAS facetas (ver o cabeçalho do arquivo).
 * Valor já escolhido aparece mesmo com contagem 0 — senão não teria como
 * desmarcá-lo.
 */
export function contarOpcoes<T>(
  linhas: readonly T[],
  facetas: readonly FacetaDef<T>[],
  filtros: Filtros,
  faceta: FacetaDef<T>,
): OpcaoFaceta[] {
  const base = filtrarLinhas(linhas, facetas, filtros, faceta.chave);
  const tally = new Map<string, number>();
  for (const linha of base) {
    for (const chave of chavesDaLinha(faceta, linha)) {
      tally.set(chave, (tally.get(chave) ?? 0) + 1);
    }
  }

  const filtro = filtros[faceta.chave];
  const escolhidos = filtro?.tipo === 'enum' ? filtro.valores : [];
  const rotular = (v: string) => (v === SEM_VALOR ? SEM_VALOR : (faceta.rotuloValor?.(v) ?? v));

  if (faceta.opcoes) {
    const universo = [...faceta.opcoes, ...escolhidos.filter((v) => !faceta.opcoes!.includes(v))];
    if (tally.has(SEM_VALOR) && !universo.includes(SEM_VALOR)) universo.push(SEM_VALOR);
    return universo.map((v) => ({ valor: v, rotulo: rotular(v), contagem: tally.get(v) ?? 0 }));
  }

  for (const v of escolhidos) if (!tally.has(v)) tally.set(v, 0);

  return [...tally.entries()]
    .map(([valor, contagem]) => ({ valor, rotulo: rotular(valor), contagem }))
    .sort((a, b) => b.contagem - a.contagem || a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
    .slice(0, MAX_OPCOES);
}

export interface ResumoIntervalo {
  min: number;
  max: number;
  /** 20 barras já normalizadas em 0..1 — o histograma que mostra ONDE estão as linhas. */
  barras: number[];
}

export function resumirIntervalo<T>(
  linhas: readonly T[],
  facetas: readonly FacetaDef<T>[],
  filtros: Filtros,
  faceta: FacetaDef<T>,
): ResumoIntervalo | null {
  const base = filtrarLinhas(linhas, facetas, filtros, faceta.chave);
  const valores: number[] = [];
  for (const linha of base) {
    const n = numeroDaLinha(faceta, linha);
    if (n !== null) valores.push(n);
  }
  if (valores.length === 0) return null;

  let min = valores[0]!;
  let max = valores[0]!;
  for (const v of valores) {
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const N = 20;
  const baldes = new Array<number>(N).fill(0);
  const largura = (max - min) / N;
  for (const v of valores) {
    // Largura 0 = todo mundo no mesmo valor: uma barra só, cheia.
    const i = largura === 0 ? 0 : Math.min(N - 1, Math.floor((v - min) / largura));
    baldes[i] = (baldes[i] ?? 0) + 1;
  }
  const pico = Math.max(...baldes);
  return { min, max, barras: baldes.map((b) => (pico === 0 ? 0 : b / pico)) };
}

/** O texto do chip quando a faceta está ativa. */
export function descreverFiltro<T>(faceta: FacetaDef<T>, filtro: Filtro): string {
  switch (filtro.tipo) {
    case 'enum': {
      const rotulos = filtro.valores.map((v) => (v === SEM_VALOR ? SEM_VALOR : (faceta.rotuloValor?.(v) ?? v)));
      if (rotulos.length <= 2) return rotulos.join(', ');
      return `${rotulos[0]} +${rotulos.length - 1}`;
    }
    case 'intervalo': {
      const casas = faceta.casas ?? 0;
      const un = faceta.unidade ? ` ${faceta.unidade}` : '';
      const de = filtro.de === null ? null : `${formatarNumero(filtro.de, casas)}${un}`;
      const ate = filtro.ate === null ? null : `${formatarNumero(filtro.ate, casas)}${un}`;
      if (de && ate) return de === ate ? de : `${de} – ${ate}`;
      if (de) return `≥ ${de}`;
      return `≤ ${ate}`;
    }
    case 'data': {
      if (filtro.preset) return PRESETS_PERIODO.find((p) => p.chave === filtro.preset)?.rotulo ?? filtro.preset;
      const de = filtro.de ? formatarData(filtro.de) : null;
      const ate = filtro.ate ? formatarData(filtro.ate) : null;
      if (de && ate) return `${de} – ${ate}`;
      if (de) return `desde ${de}`;
      return `até ${ate}`;
    }
    case 'booleano':
      return filtro.valor ? 'Sim' : 'Não';
    case 'texto':
      return `"${filtro.termo}"`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chip com painel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Popover próprio, e não o DropdownMenu do Radix, por um motivo concreto: o
 * DropdownMenu tem typeahead — ele intercepta as teclas para pular para o item
 * que começa com a letra digitada. Num painel com campo de busca, digitar "sa"
 * mexe na seleção em vez de escrever no input. São 30 linhas para não brigar com
 * o comportamento do menu a cada tecla.
 */
function ChipPainel({
  rotulo,
  resumo,
  ativo,
  aoLimpar,
  children,
}: {
  rotulo: string;
  resumo: string | null;
  ativo: boolean;
  aoLimpar: () => void;
  children: (fechar: () => void) => React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function foraDaCaixa(e: PointerEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function escapou(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false);
    }
    document.addEventListener('pointerdown', foraDaCaixa);
    document.addEventListener('keydown', escapou);
    return () => {
      document.removeEventListener('pointerdown', foraDaCaixa);
      document.removeEventListener('keydown', escapou);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <div
        className={cn(
          'flex items-center rounded-full border text-[13px] transition-colors',
          ativo ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground',
        )}
      >
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2 hover:text-foreground"
        >
          <span>{rotulo}</span>
          {resumo && <span className="max-w-40 truncate font-medium text-primary">{resumo}</span>}
          <ChevronDown className={cn('size-3.5 opacity-60 transition-transform', aberto && 'rotate-180')} />
        </button>
        {ativo && (
          <button
            type="button"
            onClick={aoLimpar}
            aria-label={`Remover filtro ${rotulo}`}
            className="mr-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {aberto && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[min(20rem,90vw)] rounded-lg border border-border bg-popover p-2 text-[13px] shadow-lg">
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  );
}

function LinhaOpcao({
  marcada,
  rotulo,
  contagem,
  aoAlternar,
}: {
  marcada: boolean;
  rotulo: string;
  contagem: number | null;
  aoAlternar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-accent',
        contagem === 0 && !marcada && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded border',
          marcada ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
        )}
      >
        {marcada && <Check className="size-3" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{rotulo}</span>
      {contagem !== null && <span className="tabular-nums text-muted-foreground">{formatarInteiro(contagem)}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Painéis por tipo
// ─────────────────────────────────────────────────────────────────────────────

function PainelEnum({
  opcoes,
  escolhidos,
  mostrarContagem,
  aoEscolher,
}: {
  opcoes: OpcaoFaceta[];
  escolhidos: string[];
  mostrarContagem: boolean;
  aoEscolher: (valores: string[]) => void;
}) {
  const [busca, setBusca] = useState('');
  // A busca só aparece acima de 10 valores — abaixo disso ela é um campo a mais
  // para ler antes de clicar no item que já estava visível.
  const comBusca = opcoes.length > 10;
  const visiveis = useMemo(() => {
    const alvo = normalizar(busca);
    return alvo === '' ? opcoes : opcoes.filter((o) => normalizar(o.rotulo).includes(alvo));
  }, [busca, opcoes]);

  function alternar(valor: string) {
    aoEscolher(escolhidos.includes(valor) ? escolhidos.filter((v) => v !== valor) : [...escolhidos, valor]);
  }

  return (
    <div className="flex flex-col gap-1">
      {comBusca && (
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar valor"
          className="mb-1 w-full rounded border border-input bg-secondary px-2 py-1 text-[13px] outline-none placeholder:text-muted-foreground"
        />
      )}
      <div className="max-h-64 overflow-y-auto">
        {visiveis.length === 0 ? (
          <p className="px-2 py-3 text-center text-muted-foreground">Nenhum valor.</p>
        ) : (
          visiveis.map((o) => (
            <LinhaOpcao
              key={o.valor}
              marcada={escolhidos.includes(o.valor)}
              rotulo={o.rotulo}
              contagem={mostrarContagem ? o.contagem : null}
              aoAlternar={() => alternar(o.valor)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PainelIntervalo({
  filtro,
  resumo,
  unidade,
  casas,
  aoAplicar,
}: {
  filtro: Extract<Filtro, { tipo: 'intervalo' }> | null;
  resumo: ResumoIntervalo | null;
  unidade: string | undefined;
  casas: number;
  aoAplicar: (de: string, ate: string) => void;
}) {
  const [de, setDe] = useState(filtro?.de != null ? String(filtro.de) : '');
  const [ate, setAte] = useState(filtro?.ate != null ? String(filtro.ate) : '');

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        aoAplicar(de, ate);
      }}
    >
      {resumo && (
        <>
          <div className="flex h-10 items-end gap-px" aria-hidden>
            {resumo.barras.map((altura, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm bg-primary/50"
                style={{ height: `${Math.max(altura * 100, 3)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
            <span>{formatarNumero(resumo.min, casas)}</span>
            <span>{formatarNumero(resumo.max, casas)}</span>
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <input
          inputMode="decimal"
          value={de}
          onChange={(e) => setDe(e.target.value)}
          placeholder="mín."
          className="w-full rounded border border-input bg-secondary px-2 py-1 tabular-nums outline-none"
        />
        <span className="text-muted-foreground">–</span>
        <input
          inputMode="decimal"
          value={ate}
          onChange={(e) => setAte(e.target.value)}
          placeholder="máx."
          className="w-full rounded border border-input bg-secondary px-2 py-1 tabular-nums outline-none"
        />
        {unidade && <span className="text-muted-foreground">{unidade}</span>}
      </div>
      <button
        type="submit"
        className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
      >
        Aplicar
      </button>
    </form>
  );
}

function PainelData({
  filtro,
  aoPreset,
  aoAplicar,
}: {
  filtro: Extract<Filtro, { tipo: 'data' }> | null;
  aoPreset: (preset: PresetPeriodo) => void;
  aoAplicar: (de: string, ate: string) => void;
}) {
  const [de, setDe] = useState(filtro?.preset ? '' : (filtro?.de ?? ''));
  const [ate, setAte] = useState(filtro?.preset ? '' : (filtro?.ate ?? ''));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS_PERIODO.map((p) => (
          <button
            key={p.chave}
            type="button"
            onClick={() => aoPreset(p.chave)}
            className={cn(
              'rounded-full border px-2.5 py-1 transition-colors',
              filtro?.preset === p.chave
                ? 'border-primary bg-primary/15 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {p.rotulo}
          </button>
        ))}
      </div>
      <form
        className="flex flex-col gap-2 border-t border-border pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          aoAplicar(de, ate);
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className="w-full rounded border border-input bg-secondary px-2 py-1 tabular-nums outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className="w-full rounded border border-input bg-secondary px-2 py-1 tabular-nums outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Aplicar período
        </button>
      </form>
    </div>
  );
}

function PainelBooleano({
  filtro,
  aoEscolher,
}: {
  filtro: Extract<Filtro, { tipo: 'booleano' }> | null;
  aoEscolher: (valor: 'sim' | 'nao' | null) => void;
}) {
  const atual = filtro === null ? null : filtro.valor ? 'sim' : 'nao';
  const opcoes: { chave: 'sim' | 'nao' | null; rotulo: string }[] = [
    { chave: null, rotulo: 'Todos' },
    { chave: 'sim', rotulo: 'Sim' },
    { chave: 'nao', rotulo: 'Não' },
  ];
  return (
    <div className="flex flex-col">
      {opcoes.map((o) => (
        <button
          key={o.rotulo}
          type="button"
          onClick={() => aoEscolher(o.chave)}
          className={cn(
            'flex items-center gap-2 rounded px-2 py-1 text-left hover:bg-accent',
            atual === o.chave && 'text-primary',
          )}
        >
          <span className="w-4">{atual === o.chave && <Check className="size-3.5" />}</span>
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

function PainelTexto({
  filtro,
  aoAplicar,
}: {
  filtro: Extract<Filtro, { tipo: 'texto' }> | null;
  aoAplicar: (termo: string) => void;
}) {
  const [termo, setTermo] = useState(filtro?.termo ?? '');
  return (
    // Escreve na URL só no Enter (ou no Aplicar), nunca a cada tecla: um
    // router.replace por caractere digitado re-renderiza a rota inteira.
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        aoAplicar(termo);
      }}
    >
      <input
        autoFocus
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Contém…"
        className="w-full rounded border border-input bg-secondary px-2 py-1 outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
      >
        Aplicar
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A barra
// ─────────────────────────────────────────────────────────────────────────────

export function AdmFilters<T>({
  facetas,
  linhas,
  filtros,
  mostrarContagem = true,
  className,
}: {
  facetas: readonly FacetaDef<T>[];
  /**
   * O conjunto COMPLETO em memória — é sobre ele que a contagem por valor é
   * calculada. Em modo servidor (só a página atual em mãos) passe
   * `mostrarContagem={false}`: contar 50 linhas e escrever o número ao lado do
   * valor seria mentir com precisão.
   */
  linhas: readonly T[];
  /**
   * Os filtros já lidos da URL (`lerFiltros`). Vêm de fora, e não de um
   * `useSearchParams()` aqui dentro, porque a tabela precisa filtrar as MESMAS
   * linhas que a barra conta — duas leituras independentes divergiriam no
   * primeiro render depois de um `replace`.
   */
  filtros: Filtros;
  mostrarContagem?: boolean;
  className?: string;
}) {
  const { aplicar } = useParamsAdm();
  const ativos = contarFiltrosAtivos(filtros);

  function definir(chave: string, valor: string | null) {
    aplicar({ [`${PREFIXO_FILTRO}${chave}`]: valor, ...ZERAR_PAGINA });
  }

  function limparTudo() {
    const zerados: Mudancas = { ...ZERAR_PAGINA };
    for (const f of facetas) zerados[`${PREFIXO_FILTRO}${f.chave}`] = null;
    aplicar(zerados);
  }

  if (facetas.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {facetas.map((faceta) => {
        const filtro = filtros[faceta.chave] ?? null;
        const resumo = filtro ? descreverFiltro(faceta, filtro) : null;

        return (
          <ChipPainel
            key={faceta.chave}
            rotulo={faceta.rotulo}
            resumo={resumo}
            ativo={filtro !== null}
            aoLimpar={() => definir(faceta.chave, null)}
          >
            {(fechar) => {
              switch (faceta.tipo) {
                case 'enum':
                  return (
                    <PainelEnum
                      opcoes={contarOpcoes(linhas, facetas, filtros, faceta)}
                      escolhidos={filtro?.tipo === 'enum' ? filtro.valores : []}
                      mostrarContagem={mostrarContagem}
                      aoEscolher={(valores) =>
                        definir(
                          faceta.chave,
                          // Vírgula é o separador da lista na URL: um valor que a
                          // contenha viraria dois filtros. Nenhum enum real do
                          // schema tem vírgula — descartar é mais seguro que
                          // inventar um escape que o servidor teria que conhecer.
                          valores.filter((v) => !v.includes(',')).join(',') || null,
                        )
                      }
                    />
                  );
                case 'intervalo':
                  return (
                    <PainelIntervalo
                      filtro={filtro?.tipo === 'intervalo' ? filtro : null}
                      resumo={mostrarContagem ? resumirIntervalo(linhas, facetas, filtros, faceta) : null}
                      unidade={faceta.unidade}
                      casas={faceta.casas ?? 0}
                      aoAplicar={(de, ate) => {
                        const limpo = `${de.trim()}..${ate.trim()}`;
                        definir(faceta.chave, limpo === '..' ? null : limpo);
                        fechar();
                      }}
                    />
                  );
                case 'data':
                  return (
                    <PainelData
                      filtro={filtro?.tipo === 'data' ? filtro : null}
                      aoPreset={(preset) => {
                        definir(faceta.chave, preset === 'tudo' ? null : preset);
                        fechar();
                      }}
                      aoAplicar={(de, ate) => {
                        const limpo = `${de.trim()}..${ate.trim()}`;
                        definir(faceta.chave, limpo === '..' ? null : limpo);
                        fechar();
                      }}
                    />
                  );
                case 'booleano':
                  return (
                    <PainelBooleano
                      filtro={filtro?.tipo === 'booleano' ? filtro : null}
                      aoEscolher={(valor) => {
                        definir(faceta.chave, valor);
                        fechar();
                      }}
                    />
                  );
                case 'texto':
                  return (
                    <PainelTexto
                      filtro={filtro?.tipo === 'texto' ? filtro : null}
                      aoAplicar={(termo) => {
                        definir(faceta.chave, termo.trim() || null);
                        fechar();
                      }}
                    />
                  );
              }
            }}
          </ChipPainel>
        );
      })}

      {ativos > 0 && (
        <button
          type="button"
          onClick={limparTudo}
          className="rounded-full px-2 py-1 text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}
