'use client';

/**
 * A grade do /adm — UM componente para as ~93 tabelas do banco.
 *
 * É a generalização do `src/components/katmandu/DataTable.tsx`, não um segundo
 * padrão concorrente: o ciclo de ordenação tri-estado e a regra de "nulo sempre
 * por último" vieram de lá inteiros. O que muda é o alcance — o DataTable serve
 * cinco telas conhecidas de uma planilha; este serve qualquer tabela declarada
 * em `src/lib/adm/tabelas-dados.ts`, sem uma linha de código por tabela.
 *
 * TRÊS DECISÕES QUE DEFINEM O COMPONENTE
 *
 * 1. PAGINAÇÃO, NÃO SCROLL INFINITO. O Felipe está AUDITANDO: ele precisa saber
 *    quantos são ("1–50 de 4.820"), e a exportação precisa de um conjunto
 *    determinístico. Scroll infinito esconde o total e o conjunto muda debaixo
 *    do arquivo que está sendo gerado.
 *
 * 2. TODO O ESTADO NA URL (`?f.status=ativo&sort=-peso_atual&cols=essencial&page=2&size=50`).
 *    O efeito prático é o favorito: "minhas cabras gestantes acima de 40 kg" vira
 *    um link. A exceção deliberada é a DENSIDADE, que fica só no localStorage —
 *    é preferência da vista, não recorte de dado, e viajaria junto num link
 *    compartilhado sem significar nada.
 *
 * 3. O CLIQUE NA LINHA ABRE O REGISTRO COMPLETO, sempre — inclusive as colunas
 *    escondidas. É a garantia de que esconder coluna nunca torna um dado
 *    inalcançável, e é por isso que o clique não navega: navegar tornaria o
 *    esconder irreversível dentro da tela.
 */

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  ExternalLink,
  Rows3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatarInteiro, formatarValorCru, VAZIO } from '@/lib/adm/format';
import type { TipoColuna } from '@/lib/adm/types';
import {
  AdmFilters,
  filtrarLinhas,
  lerFiltros,
  useParamsAdm,
  ZERAR_PAGINA,
  type FacetaDef,
  type Filtros,
  type Mudancas,
} from '@/components/adm/AdmFilters';

// ─────────────────────────────────────────────────────────────────────────────
// Colunas
// ─────────────────────────────────────────────────────────────────────────────

export interface AdmColuna<T> {
  /** Nome da coluna no dado. É o que viaja em `?cols=` e o que a célula padrão lê. */
  chave: string;
  /** O texto do cabeçalho. Vem quase sempre do `rotulo` do catálogo; o nome é
   *  outro porque aqui ele é a coluna DA TELA, e uma tela pode renomear. */
  cabecalho: string;
  /**
   * Tipo do catálogo (`ColunaRegistro.tipo`). Quando presente, decide sozinho o
   * alinhamento, o `tabular-nums` e a formatação — é o que permite ao escape
   * hatch montar uma tela inteira sem escrever nenhuma função de célula.
   */
  tipo?: TipoColuna;
  /** Sobrescreve a renderização. Sem ela, a célula lê `linha[chave]` e formata pelo tipo. */
  celula?: (linha: T) => React.ReactNode;
  /** Chave de ordenação em memória. Sem ela, cai no valor cru de `linha[chave]`. */
  ordenar?: (linha: T) => number | string | boolean | null;
  /** Força alinhamento à direita + tabular-nums, independente do tipo. */
  numerica?: boolean;
  /** Não pode ser escondida no seletor de colunas (o `requiredKeys` do CsvExport). */
  fixa?: boolean;
  /** Agrupa no seletor. As famílias do catálogo são 'essencial' | 'detalhe' | 'tecnica'. */
  familia?: string;
  /** `title` da célula — o lugar do id cru de uma FK cujo rótulo já está na tela. */
  titulo?: (linha: T) => string | undefined;
  className?: string;
}

/**
 * Sufixo da coluna sintética com o rótulo de uma FK resolvida: `categoria` (uuid)
 * chega acompanhada de `categoria__rotulo` ('Lactante').
 *
 * Está duplicado do `SUFIXO_ROTULO` de `src/lib/adm/queries.ts` DE PROPÓSITO:
 * aquele arquivo abre com `import 'server-only'`, e importá-lo daqui quebraria o
 * build deste Client Component. A duplicação é de uma string; o acoplamento
 * inverso seria a `service_role` no bundle do browser.
 */
const SUFIXO_ROTULO = '__rotulo';

/** Presets aceitos em `?cols=`. Espelham `ColunaRegistro.familia` + 'tudo',
 *  exatamente como `parseColunasParam()` faz no servidor. */
const PRESETS_COLUNAS = ['essencial', 'detalhe', 'tecnica', 'tudo'] as const;

const ROTULO_FAMILIA: Record<string, string> = {
  essencial: 'Essencial',
  detalhe: 'Detalhe',
  tecnica: 'Técnica',
};

function comoRegistro(linha: unknown): Record<string, unknown> {
  // O escape hatch entrega `Record<string, unknown>` de verdade; uma lista tipada
  // (UsuarioLista) também é indexável por string em runtime. O cast é o preço de
  // um componente genérico que aceita as duas coisas.
  return (linha ?? {}) as Record<string, unknown>;
}

function ehNumerica<T>(coluna: AdmColuna<T>): boolean {
  return coluna.numerica ?? coluna.tipo === 'numero';
}

function valorCru<T>(coluna: AdmColuna<T>, linha: T): unknown {
  return comoRegistro(linha)[coluna.chave];
}

/** A célula padrão: rótulo resolvido de FK quando existe, senão o valor formatado. */
function celulaPadrao<T>(coluna: AdmColuna<T>, linha: T): React.ReactNode {
  const registro = comoRegistro(linha);
  const rotulo = registro[`${coluna.chave}${SUFIXO_ROTULO}`];
  if (typeof rotulo === 'string' && rotulo.trim() !== '') return rotulo;
  return formatarValorCru(registro[coluna.chave]);
}

function tituloPadrao<T>(coluna: AdmColuna<T>, linha: T): string | undefined {
  const registro = comoRegistro(linha);
  const rotulo = registro[`${coluna.chave}${SUFIXO_ROTULO}`];
  // Rótulo na célula => o id cru vai para o title. É como se vê "#257" atrás de
  // "Fazenda Boa Vista" sem gastar uma coluna com o uuid.
  if (typeof rotulo === 'string' && rotulo.trim() !== '') {
    const bruto = registro[coluna.chave];
    return bruto == null ? undefined : String(bruto);
  }
  return undefined;
}

function chaveDeOrdem<T>(coluna: AdmColuna<T>, linha: T): number | string | boolean | null {
  if (coluna.ordenar) return coluna.ordenar(linha);
  const bruto = valorCru(coluna, linha);
  if (bruto === null || bruto === undefined) return null;
  if (typeof bruto === 'number' || typeof bruto === 'boolean' || typeof bruto === 'string') return bruto;
  return String(bruto);
}

// ─────────────────────────────────────────────────────────────────────────────
// Densidade
// ─────────────────────────────────────────────────────────────────────────────

export type Densidade = 'compacta' | 'normal' | 'confortavel';

/** 28 / 36 / 44px. Default COMPACTA: quem está auditando quer quantas linhas
 *  couberem na tela; quem está lendo é quem afrouxa. */
const DENSIDADES: Record<Densidade, { rotulo: string; altura: string }> = {
  compacta: { rotulo: 'Compacta', altura: 'h-7' },
  normal: { rotulo: 'Normal', altura: 'h-9' },
  confortavel: { rotulo: 'Confortável', altura: 'h-11' },
};

const CHAVE_DENSIDADE = 'adm:densidade';
const CHAVE_COLUNAS = 'adm:colunas:';

/**
 * O localStorage é lido como STORE EXTERNO (useSyncExternalStore), e não com
 * useState + useEffect. Dois motivos, nesta ordem:
 *
 * 1. Hidratação. `getServerSnapshot` devolve null, então o HTML do servidor e o
 *    primeiro render do cliente são idênticos por construção — a preferência
 *    salva entra no render seguinte, sem o React descartar a árvore.
 * 2. Um `setState` dentro de effect para copiar valor de fora é justamente o
 *    padrão que o React Compiler recusa (react-hooks/set-state-in-effect): é
 *    render em cascata para sincronizar algo que já é uma fonte externa.
 *
 * O storage não avisa a própria aba quando ela mesma escreve (o evento
 * 'storage' só chega às OUTRAS abas), então a escrita emite para os inscritos
 * daqui — sem isso, trocar a densidade não redesenharia nada.
 */
const ouvintesLocais = new Set<() => void>();

function assinarLocal(aoMudar: () => void): () => void {
  ouvintesLocais.add(aoMudar);
  window.addEventListener('storage', aoMudar);
  return () => {
    ouvintesLocais.delete(aoMudar);
    window.removeEventListener('storage', aoMudar);
  };
}

/** localStorage não existe em SSR e LANÇA no Safari privativo — nunca sem try. */
function lerLocal(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarLocal(chave: string, valor: string): void {
  try {
    window.localStorage.setItem(chave, valor);
  } catch {
    // Preferência de vista não vale um erro na tela. Perder a densidade salva é
    // o pior que acontece.
  }
  for (const aoMudar of ouvintesLocais) aoMudar();
}

/** O valor salvo, ou null enquanto o servidor renderiza (e no primeiro render do
 *  cliente). O nome começa com `use` — em inglês, fora do padrão do arquivo —
 *  porque é assim que a regra rules-of-hooks reconhece um hook. */
function usePreferenciaLocal(chave: string): string | null {
  return useSyncExternalStore(
    assinarLocal,
    () => lerLocal(chave),
    () => null,
  );
}

function densidadeValida(bruto: string | null): Densidade | null {
  return bruto === 'compacta' || bruto === 'normal' || bruto === 'confortavel' ? bruto : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação múltipla
// ─────────────────────────────────────────────────────────────────────────────

export interface Ordem {
  coluna: string;
  ascendente: boolean;
}

/** Até 3 níveis. Além disso ninguém consegue prever o resultado olhando a tela. */
const MAX_ORDENS = 3;

/** '-peso_atual,numero_animal' → [{peso_atual desc}, {numero_animal asc}]. Mesma
 *  grafia que `validarOrdenacao()` aceita no servidor. */
export function lerOrdens(bruto: string | null, chavesValidas: ReadonlySet<string>): Ordem[] {
  if (!bruto) return [];
  const ordens: Ordem[] = [];
  for (const parte of bruto.split(',')) {
    const texto = parte.trim();
    if (texto === '') continue;
    const ascendente = !texto.startsWith('-');
    const coluna = ascendente ? texto.replace(/^\+/, '') : texto.slice(1);
    if (!chavesValidas.has(coluna) || ordens.some((o) => o.coluna === coluna)) continue;
    ordens.push({ coluna, ascendente });
    if (ordens.length === MAX_ORDENS) break;
  }
  return ordens;
}

export function escreverOrdens(ordens: Ordem[]): string | null {
  if (ordens.length === 0) return null;
  return ordens.map((o) => (o.ascendente ? o.coluna : `-${o.coluna}`)).join(',');
}

/** Comparador estável de valores mistos. NULO SEMPRE POR ÚLTIMO, nos dois
 *  sentidos — herdado do DataTable do katmandu: inverter a direção não pode
 *  encher a primeira página de linhas vazias. */
function comparar(a: number | string | boolean | null, b: number | string | boolean | null, sinal: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'pt-BR') * sinal;
  if (a < b) return -1 * sinal;
  if (a > b) return 1 * sinal;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginação
// ─────────────────────────────────────────────────────────────────────────────

export const TAMANHOS_PAGINA = [25, 50, 100, 250] as const;
const TAMANHO_PADRAO = 50;

/**
 * Modo servidor: a página já veio cortada do banco e a tabela só desenha o rodapé.
 *
 * Duas paginações convivem porque o banco tem as duas: as listas curadas usam
 * `page`/`size` (offset), e o escape hatch usa keyset com cursor opaco
 * (`cursorDaLinha()` em queries.ts), que é o que aguenta `controle_leiteiro`.
 */
export interface PaginacaoServidor {
  /** Posição (1-based) da primeira linha desta página no conjunto todo. */
  inicio: number;
  total: number;
  /** True quando `total` veio do planner (tabela volumosa) — a tela escreve "~". */
  aproximado?: boolean;
  /** Keyset: cursor da próxima página. `null`/ausente = última página. */
  cursorProxima?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// O componente
// ─────────────────────────────────────────────────────────────────────────────

export interface AdmTableProps<T> {
  /**
   * Identidade da grade — chave da preferência de colunas no localStorage.
   * Use algo estável e único: 'usuarios', 'tabela:rebanho', 'u:11954:pagamentos'.
   *
   * Opcional: sem ele a chave sai da FORMA da tabela (a lista de colunas), que é
   * estável entre recargas e diferente entre tabelas diferentes. Perde-se só a
   * distinção entre duas grades de colunas idênticas — e ganha-se poder montar
   * uma grade sem inventar um id.
   */
  id?: string;
  colunas: readonly AdmColuna<T>[];
  linhas: readonly T[];
  /** Identidade estável da linha — a key do React. */
  chave: (linha: T) => string;
  /**
   * Colunas visíveis quando a URL não manda nada. Sem isto, todas aparecem —
   * o que é o certo para uma lista curada e errado para uma tabela de 40 colunas.
   */
  visiveisPadrao?: readonly string[];
  /** Facetas da barra de filtros. Vazio/ausente = sem barra. */
  facetas?: readonly FacetaDef<T>[];
  /** 'cliente' filtra, ordena e pagina em memória (regra de corte: ~2.000 linhas). */
  modo?: 'cliente' | 'servidor';
  /** Obrigatório no modo servidor: o rodapé não tem como saber o total sozinho. */
  paginacao?: PaginacaoServidor;
  /** O 'agora' do servidor (ISO), para o corte de "30 dias" não mudar na hidratação. */
  agora?: string;
  /** O que aparece quando não há linha nenhuma — normalmente um <EstadoVazio>. */
  vazio?: React.ReactNode;
  /** Ações à direita da barra (o <ExportMenu>, tipicamente). */
  acoes?: React.ReactNode;
  /** Link da ficha completa do registro, no rodapé do painel lateral. */
  hrefLinha?: (linha: T) => string;
  /** Legenda do que a grade lista, no canto inferior esquerdo ('animais', 'pagamentos'). */
  substantivo?: string;
  className?: string;
}

export function AdmTable<T>({
  id,
  colunas,
  linhas,
  chave,
  visiveisPadrao,
  facetas,
  modo = 'cliente',
  paginacao,
  agora,
  vazio,
  acoes,
  hrefLinha,
  substantivo = 'registros',
  className,
}: AdmTableProps<T>) {
  const { params, aplicar } = useParamsAdm();

  const chavesValidas = useMemo(() => new Set(colunas.map((c) => c.chave)), [colunas]);

  // Sem `id`, a forma da tabela é a identidade. Não é hash: legível no DevTools
  // vale mais aqui do que curto.
  const idGrade = id ?? colunas.map((c) => c.chave).join('|');

  // ── Densidade ──────────────────────────────────────────────────────────────
  // 'compacta' é o default nos dois lados; a preferência salva entra no render
  // seguinte à hidratação (ver usePreferenciaLocal).
  const densidade = densidadeValida(usePreferenciaLocal(CHAVE_DENSIDADE)) ?? 'compacta';

  function trocarDensidade(nova: Densidade) {
    // Só grava: quem redesenha é o store (gravarLocal avisa os inscritos).
    gravarLocal(CHAVE_DENSIDADE, nova);
  }

  // ── Colunas visíveis ───────────────────────────────────────────────────────
  const padrao = useMemo(() => {
    const pedidas = (visiveisPadrao ?? []).filter((c) => chavesValidas.has(c));
    return pedidas.length > 0 ? pedidas : colunas.map((c) => c.chave);
  }, [colunas, chavesValidas, visiveisPadrao]);

  const colsParam = params.get('cols');

  const visiveisUrl = useMemo(() => {
    if (!colsParam) return null;
    const texto = colsParam.trim();
    if (texto === '') return null;
    // Preset resolvido no cliente pela família — a mesma tradução que
    // parseColunasParam() faz no servidor, para os dois lados mostrarem o mesmo.
    if ((PRESETS_COLUNAS as readonly string[]).includes(texto)) {
      const chaves =
        texto === 'tudo'
          ? colunas.map((c) => c.chave)
          : colunas.filter((c) => c.familia === texto).map((c) => c.chave);
      return chaves.length > 0 ? chaves : null;
    }
    const pedidas = texto
      .split(',')
      .map((c) => c.trim())
      .filter((c) => chavesValidas.has(c));
    return pedidas.length > 0 ? pedidas : null;
  }, [colsParam, colunas, chavesValidas]);

  // Preferência local só entra quando a URL não opinou: um link compartilhado tem
  // que abrir igual para quem mandou e para quem recebeu.
  const salvasBruto = usePreferenciaLocal(`${CHAVE_COLUNAS}${idGrade}`);
  const visiveisSalvas = useMemo(() => {
    if (!salvasBruto) return null;
    const pedidas = salvasBruto.split(',').filter((c) => chavesValidas.has(c));
    return pedidas.length > 0 ? pedidas : null;
  }, [salvasBruto, chavesValidas]);

  const visiveis = useMemo(() => {
    const escolhidas = new Set(visiveisUrl ?? visiveisSalvas ?? padrao);
    // A ordem é sempre a das colunas declaradas, nunca a de escolha: mantém o
    // cabeçalho estável entre recargas e torna duas exportações comparáveis.
    const saida = colunas.filter((c) => c.fixa || escolhidas.has(c.chave));
    return saida.length > 0 ? saida : colunas.slice(0, 1);
  }, [colunas, padrao, visiveisSalvas, visiveisUrl]);

  function alternarColuna(alvo: string) {
    const atual = new Set(visiveis.map((c) => c.chave));
    if (atual.has(alvo)) atual.delete(alvo);
    else atual.add(alvo);
    const lista = colunas.filter((c) => atual.has(c.chave)).map((c) => c.chave);
    if (lista.length === 0) return;
    gravarLocal(`${CHAVE_COLUNAS}${idGrade}`, lista.join(','));
    aplicar({ cols: lista.join(',') });
  }

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filtros: Filtros = useMemo(
    () => (facetas && facetas.length > 0 ? lerFiltros(facetas, params, agora ?? new Date()) : {}),
    [facetas, params, agora],
  );

  const filtradas = useMemo(() => {
    // No modo servidor o WHERE já foi aplicado no banco; refiltrar aqui cortaria
    // de novo a página que já veio cortada.
    if (modo === 'servidor' || !facetas || facetas.length === 0) return linhas as T[];
    return filtrarLinhas(linhas, facetas, filtros);
  }, [facetas, filtros, linhas, modo]);

  // ── Ordenação ──────────────────────────────────────────────────────────────
  const ordens = useMemo(() => lerOrdens(params.get('sort'), chavesValidas), [params, chavesValidas]);

  const ordenadas = useMemo(() => {
    if (modo === 'servidor' || ordens.length === 0) return filtradas;
    const usadas = ordens
      .map((o) => ({ ordem: o, coluna: colunas.find((c) => c.chave === o.coluna) }))
      .filter((x): x is { ordem: Ordem; coluna: AdmColuna<T> } => x.coluna !== undefined);
    if (usadas.length === 0) return filtradas;

    return [...filtradas].sort((a, b) => {
      for (const { ordem, coluna } of usadas) {
        const r = comparar(chaveDeOrdem(coluna, a), chaveDeOrdem(coluna, b), ordem.ascendente ? 1 : -1);
        if (r !== 0) return r;
      }
      return 0;
    });
  }, [colunas, filtradas, modo, ordens]);

  /**
   * Clique cicla asc → desc → sem ordem. Shift+clique EMPILHA em vez de trocar —
   * é como se ordena "por status e, dentro dele, por peso" sem uma segunda UI.
   */
  function alternarOrdem(alvo: string, empilhar: boolean) {
    const atual = ordens.find((o) => o.coluna === alvo);
    let proximas: Ordem[];
    if (!atual) {
      proximas = empilhar ? [...ordens, { coluna: alvo, ascendente: true }] : [{ coluna: alvo, ascendente: true }];
    } else if (atual.ascendente) {
      const trocada = { coluna: alvo, ascendente: false };
      proximas = empilhar ? ordens.map((o) => (o.coluna === alvo ? trocada : o)) : [trocada];
    } else {
      proximas = ordens.filter((o) => o.coluna !== alvo);
    }
    aplicar({ sort: escreverOrdens(proximas.slice(0, MAX_ORDENS)), ...ZERAR_PAGINA });
  }

  // ── Paginação ──────────────────────────────────────────────────────────────
  const tamanhoBruto = Number(params.get('size'));
  const tamanho = (TAMANHOS_PAGINA as readonly number[]).includes(tamanhoBruto) ? tamanhoBruto : TAMANHO_PADRAO;

  const totalCliente = ordenadas.length;
  const total = modo === 'servidor' ? (paginacao?.total ?? ordenadas.length) : totalCliente;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho));

  const paginaBruta = Number(params.get('page'));
  const pagina = Number.isFinite(paginaBruta) && paginaBruta >= 1 ? Math.min(Math.floor(paginaBruta), totalPaginas) : 1;

  const daPagina = useMemo(
    () => (modo === 'servidor' ? ordenadas : ordenadas.slice((pagina - 1) * tamanho, pagina * tamanho)),
    [modo, ordenadas, pagina, tamanho],
  );

  const inicio = total === 0 ? 0 : modo === 'servidor' ? (paginacao?.inicio ?? 1) : (pagina - 1) * tamanho + 1;
  const fim = total === 0 ? 0 : inicio + daPagina.length - 1;

  /**
   * Keyset não tem endereço de volta: o cursor aponta para a frente e só. A
   * pilha de cursores visitados vive na tela (não na URL, que ficaria com um
   * rastro ilegível). Recarregar a página perde a pilha e "Anterior" volta para
   * a primeira — degradação aceitável, e explicitamente melhor que uma URL com
   * dez cursores base64 dentro.
   */
  const pilhaCursores = useRef<string[]>([]);
  const cursorAtual = params.get('cursor');
  const porCursor = modo === 'servidor' && (paginacao?.cursorProxima != null || cursorAtual != null);

  function irPara(destino: number, extras: Mudancas = {}) {
    aplicar({ page: destino <= 1 ? null : String(destino), ...extras });
  }

  function avancar() {
    if (porCursor) {
      const proximo = paginacao?.cursorProxima;
      if (!proximo) return;
      if (cursorAtual) pilhaCursores.current.push(cursorAtual);
      irPara(pagina + 1, { cursor: proximo });
      return;
    }
    irPara(pagina + 1);
  }

  function voltar() {
    if (porCursor) {
      const anterior = pilhaCursores.current.pop() ?? null;
      // Pilha vazia (recarregou a página no meio da navegação) => volta para a
      // PRIMEIRA, não para "a anterior sem cursor": esta última mostraria as
      // linhas da página 1 com o rótulo da 2, que é pior do que voltar ao início.
      irPara(anterior ? pagina - 1 : 1, { cursor: anterior });
      return;
    }
    irPara(pagina - 1);
  }

  const temProxima = porCursor ? Boolean(paginacao?.cursorProxima) : pagina < totalPaginas;
  const temAnterior = pagina > 1;

  // ── Painel lateral do registro ─────────────────────────────────────────────
  const [aberta, setAberta] = useState<T | null>(null);

  const dens = DENSIDADES[densidade];
  const semLinhas = daPagina.length === 0;

  return (
    <div className={cn('flex flex-col gap-3 text-[13px]', className)}>
      {/* ── Barra ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {facetas && facetas.length > 0 && (
            <AdmFilters
              facetas={facetas}
              linhas={linhas}
              filtros={filtros}
              // No servidor só temos a página atual em mãos: contar 50 linhas e
              // escrever o número ao lado do valor seria mentir com precisão.
              mostrarContagem={modo === 'cliente'}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Rows3 className="size-3.5" />
                {dens.rotulo}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Densidade</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={densidade}
                onValueChange={(v) => trocarDensidade(densidadeValida(v) ?? 'compacta')}
              >
                {(Object.keys(DENSIDADES) as Densidade[]).map((d) => (
                  <DropdownMenuRadioItem key={d} value={d}>
                    {DENSIDADES[d].rotulo}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Columns3 className="size-3.5" />
                Colunas
                <span className="tabular-nums text-muted-foreground">
                  {visiveis.length}/{colunas.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[70vh] overflow-y-auto">
              {agrupar(colunas).map((grupo, i) => (
                <div key={grupo.familia ?? `sem-familia-${i}`}>
                  {i > 0 && <DropdownMenuSeparator />}
                  {grupo.familia && <DropdownMenuLabel>{ROTULO_FAMILIA[grupo.familia] ?? grupo.familia}</DropdownMenuLabel>}
                  {grupo.colunas.map((coluna) => (
                    <DropdownMenuCheckboxItem
                      key={coluna.chave}
                      checked={visiveis.some((c) => c.chave === coluna.chave)}
                      disabled={coluna.fixa}
                      // Sem isto o menu fecha a cada clique e escolher cinco
                      // colunas custa cinco reaberturas.
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => alternarColuna(coluna.chave)}
                    >
                      {coluna.cabecalho}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {acoes}
        </div>
      </div>

      {/* ── Grade ──
          O container é o scroller nos dois eixos e tem altura máxima: é isso que
          faz `sticky` funcionar (sticky se ancora no scroller mais próximo, e um
          scroller sem altura definida não tem onde grudar). A página, por tabela
          nenhuma, rola na horizontal. */}
      <div className="max-h-[calc(100vh-18rem)] overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-card">
            <tr className="border-b border-border">
              {visiveis.map((coluna, indice) => {
                const ordem = ordens.find((o) => o.coluna === coluna.chave);
                const nivel = ordens.findIndex((o) => o.coluna === coluna.chave);
                const numerica = ehNumerica(coluna);
                return (
                  <th
                    key={coluna.chave}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap border-b border-border bg-card px-2 py-1.5 text-left align-middle font-medium text-muted-foreground',
                      numerica && 'text-right',
                      // Primeira coluna sticky: é a identificação, e sem ela o
                      // scroll horizontal transforma a linha num monte de números
                      // sem dono.
                      indice === 0 && 'sticky left-0 z-30 border-r border-border',
                      coluna.className,
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => alternarOrdem(coluna.chave, e.shiftKey)}
                      title="Clique para ordenar · Shift+clique para somar uma ordenação"
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-foreground',
                        numerica && 'flex-row-reverse',
                        ordem && 'text-foreground',
                      )}
                    >
                      {coluna.cabecalho}
                      {ordem ? (
                        <span className="inline-flex items-center tabular-nums">
                          {ordens.length > 1 && <span className="text-[10px] text-primary">{nivel + 1}</span>}
                          {ordem.ascendente ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        </span>
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-30" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {semLinhas ? (
              <tr>
                <td colSpan={visiveis.length} className="px-3 py-10 text-center text-muted-foreground">
                  {vazio ?? 'Nenhum registro com os filtros atuais.'}
                </td>
              </tr>
            ) : (
              daPagina.map((linha) => (
                <tr
                  key={chave(linha)}
                  onClick={(e) => {
                    // Célula com link ou botão dentro (copiar o `#`, abrir o
                    // WhatsApp, ir para a ficha) manda no próprio clique — o
                    // painel lateral não pode roubá-lo.
                    if ((e.target as HTMLElement).closest('a,button,input,label,select')) return;
                    setAberta(linha);
                  }}
                  // Sem zebra: a listra vira ruído numa grade de 40 colunas, e o
                  // que separa linha de linha é a régua de 1px do border-b.
                  className={cn('group cursor-pointer border-b border-border last:border-0 hover:bg-secondary', dens.altura)}
                >
                  {visiveis.map((coluna, indice) => {
                    const numerica = ehNumerica(coluna);
                    const conteudo = coluna.celula ? coluna.celula(linha) : celulaPadrao(coluna, linha);
                    const title = coluna.titulo ? coluna.titulo(linha) : tituloPadrao(coluna, linha);
                    return (
                      <td
                        key={coluna.chave}
                        title={title}
                        className={cn(
                          'max-w-72 truncate whitespace-nowrap px-2 align-middle',
                          numerica ? 'text-right tabular-nums' : 'text-left',
                          // A célula sticky precisa de fundo OPACO próprio: sem
                          // ele, as colunas roladas aparecem por baixo. E o fundo
                          // acompanha o hover da linha, senão a primeira coluna
                          // fica destacada por acidente.
                          indice === 0 &&
                            'sticky left-0 z-10 border-r border-border bg-card font-medium text-foreground group-hover:bg-secondary',
                          coluna.className,
                        )}
                      >
                        {conteudo}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Rodapé ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
        <span className="tabular-nums">
          {total === 0 ? (
            `Nenhum ${substantivo.replace(/s$/, '')}`
          ) : (
            <>
              {formatarInteiro(inicio)}–{formatarInteiro(fim)} de {paginacao?.aproximado ? '~' : ''}
              {formatarInteiro(total)} {substantivo}
            </>
          )}
        </span>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Linhas por página</span>
            <select
              value={tamanho}
              onChange={(e) => aplicar({ size: e.target.value, ...ZERAR_PAGINA })}
              className="rounded border border-input bg-card px-1.5 py-1 tabular-nums outline-none"
            >
              {TAMANHOS_PAGINA.map((t) => (
                <option key={t} value={t}>
                  {t} / página
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled={!temAnterior} onClick={voltar} aria-label="Página anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-16 text-center tabular-nums">
              {formatarInteiro(pagina)} / {porCursor ? '…' : formatarInteiro(totalPaginas)}
            </span>
            <Button variant="outline" size="icon-sm" disabled={!temProxima} onClick={avancar} aria-label="Próxima página">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Registro completo ──
          TODAS as colunas declaradas, inclusive as escondidas: é o que garante
          que esconder coluna nunca deixe um dado inalcançável. */}
      <Sheet open={aberta !== null} onOpenChange={(v) => !v && setAberta(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{aberta ? tituloDoRegistro(colunas, aberta) : 'Registro'}</SheetTitle>
          </SheetHeader>
          {aberta && (
            <dl className="grid grid-cols-[minmax(6rem,10rem)_1fr] gap-x-3 gap-y-1.5 overflow-y-auto px-4 text-[13px]">
              {colunas.map((coluna) => {
                const conteudo = coluna.celula ? coluna.celula(aberta) : celulaPadrao(coluna, aberta);
                return (
                  <div key={coluna.chave} className="contents">
                    <dt className="truncate py-1 text-muted-foreground" title={coluna.cabecalho}>
                      {coluna.cabecalho}
                    </dt>
                    <dd
                      className={cn(
                        'min-w-0 break-words border-b border-border py-1 text-foreground',
                        ehNumerica(coluna) && 'tabular-nums',
                      )}
                    >
                      {conteudo === null || conteudo === undefined || conteudo === '' ? VAZIO : conteudo}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
          {aberta && hrefLinha && (
            <SheetFooter>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={hrefLinha(aberta)}>
                  <ExternalLink className="size-3.5" />
                  Abrir ficha completa
                </Link>
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Agrupa as colunas por família preservando a ordem de declaração. Coluna sem
 *  família fica num grupo sem rótulo, no lugar em que foi declarada. */
function agrupar<T>(colunas: readonly AdmColuna<T>[]): { familia: string | null; colunas: AdmColuna<T>[] }[] {
  const grupos: { familia: string | null; colunas: AdmColuna<T>[] }[] = [];
  for (const coluna of colunas) {
    const familia = coluna.familia ?? null;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.familia === familia) ultimo.colunas.push(coluna);
    else grupos.push({ familia, colunas: [coluna] });
  }
  return grupos;
}

/** O título do painel lateral: a primeira coluna com conteúdo — quase sempre o
 *  identificador, que é exatamente o que se quer ler no cabeçalho. */
function tituloDoRegistro<T>(colunas: readonly AdmColuna<T>[], linha: T): string {
  for (const coluna of colunas) {
    const bruto = valorCru(coluna, linha);
    if (bruto !== null && bruto !== undefined && String(bruto).trim() !== '') {
      return `${coluna.cabecalho}: ${formatarValorCru(bruto)}`;
    }
  }
  return 'Registro';
}
