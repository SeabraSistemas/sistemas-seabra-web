/**
 * Empacota cada `Leitura<T>` (queries.ts) numa tupla compacta antes de virar
 * prop de Server Component pra Client Component — sem isto, o nome de cada
 * campo viaja no payload RSC uma vez POR LINHA. Medido ao vivo: IATF (8.919
 * linhas) ia a 1,75 MB, Toque (11.005) a 2,82 MB, Rebanho (7.851) a 2,33 MB —
 * acima do orçamento do plano. `desempacotar<T>` (nas Views) reconstrói os
 * objetos tipados uma vez, com `useMemo`.
 */
import { empacotar, type Pacote } from '@/lib/painel/pacote';
import type { Leitura } from './queries';
import type {
  CategoriaCusto,
  ConsumoCategoria,
  Custo,
  GmdCategoria,
  Insumo,
  ItemDieta,
  LoteCadastrado,
  MarcoIdade,
  RegBaixa,
  RegIatf,
  RegParto,
  RegPesagem,
  RegRebanho,
  RegToque,
  RegVenda,
  LancamentoFinanceiro,
  RegAborto,
} from './types';

import type { EventoFin } from './financeiro';
import type { FunilCalculado, RetratoCategoria } from './custoFormacao';

export interface PacoteLeitura<T extends object> {
  pacote: Pacote<T>;
  configurado: boolean;
  stale: boolean;
  carregadoEm: number | null;
}

export function empacotarLeitura<T extends object>(
  leitura: Leitura<T>,
  campos: (keyof T & string)[],
): PacoteLeitura<T> {
  return {
    pacote: empacotar(leitura.itens, campos),
    configurado: leitura.configurado,
    stale: leitura.stale,
    carregadoEm: leitura.carregadoEm,
  };
}

export const CAMPOS_IATF: (keyof RegIatf & string)[] = [
  'id',
  'data',
  'protocolo',
  'metodo',
  'partida',
  'inseminador',
  'ecc',
  'eccNum',
  'fazenda',
  'lote',
  'pesoKg',
];

export const CAMPOS_TOQUE: (keyof RegToque & string)[] = [
  'id',
  'data',
  'diagnostico',
  'destino',
  'escore',
  'escoreNum',
  'observacao',
  'idadeAnos',
  'status',
  'reproducao',
  'fazenda',
  'lote',
  'pesoKg',
  'touroIatf',
];

export const CAMPOS_REBANHO: (keyof RegRebanho & string)[] = [
  'id',
  'eletronica',
  'marca',
  'sexo',
  'categoria',
  'causaBaixa',
  'idadeMeses',
  'fazenda',
  'lote',
  'status',
  'reproducao',
  'escore',
  'destino',
  'ultimaPesagemKg',
  'dataUltimaPesagem',
];

export const CAMPOS_PARTO: (keyof RegParto & string)[] = [
  'id',
  'eletronica',
  'marca',
  'idMae',
  'idPai',
  'nascimento',
  'sexo',
  'metodo',
  'pesoNascimento',
  'fazenda',
  'categoria',
];

export const CAMPOS_PESAGEM: (keyof RegPesagem & string)[] = [
  'id',
  'data',
  'pesoKg',
  'entradaKg',
  'diasEngorda',
  'gpd',
  'gmd',
  'pdi',
  'gpdi',
  'fazenda',
  'lote',
  'sexo',
  'destino',
  'diferencaKg',
];

/**
 * Subconjunto de campos de RegRebanho pros "Lotes de engorda" (página
 * Pesagem) — só os animais com `entradaEngorda` preenchida entram aqui (ver
 * `getAnimaisEmEngorda`, queries.ts), então listar os ~96 campos de
 * RebanhoProd sairia caro à toa; `CAMPOS_REBANHO` (o do /rebanho) fica
 * intocado.
 */
export const CAMPOS_REBANHO_ENGORDA: (keyof RegRebanho & string)[] = [
  'id',
  'fazenda',
  'categoria',
  'causaBaixa',
  'status',
  'lote',
  'entradaEngorda',
  'diasEngordaAtual',
  'pesoEntradaEngorda',
  'gmdAtual',
];

/**
 * Subconjunto de RegRebanho pra tela "Formar lote" (Pesagem, 21/09/2026) —
 * o lote ATUAL de cada animal e a categoria (pra barrar vendido/baixado).
 * São os 7.860 animais, mas só 3 campos: empacotado em tupla isso é ordem
 * de grandeza menor que `CAMPOS_REBANHO` (15 campos) do /rebanho.
 */
export const CAMPOS_REBANHO_LOTE: (keyof RegRebanho & string)[] = ['id', 'lote', 'categoria'];

export const CAMPOS_LOTE_CADASTRADO: (keyof LoteCadastrado & string)[] = ['id', 'nome'];

export const CAMPOS_BAIXA: (keyof RegBaixa & string)[] = [
  'id',
  'data',
  'tipo',
  'causaObito',
  'valor',
  'fazenda',
  'obs',
  'categoria',
  'idadeDias',
];

export const CAMPOS_VENDA: (keyof RegVenda & string)[] = ['id', 'idAnimal', 'data', 'valor', 'cliente', 'fazenda', 'pesoKg'];

export const CAMPOS_ABORTO: (keyof RegAborto & string)[] = ['id', 'idAnimal', 'data', 'suspeita', 'fazenda'];

export const CAMPOS_FINANCEIRO: (keyof LancamentoFinanceiro & string)[] = [
  'id',
  'identificacao',
  'descricao',
  'categoria',
  'valor',
  'data',
];

export const CAMPOS_CATEGORIA_CUSTO: (keyof CategoriaCusto & string)[] = ['id', 'nome'];

export const CAMPOS_CUSTO: (keyof Custo & string)[] = [
  'id',
  'descricao',
  'categoria',
  'fazenda',
  'tipo',
  'valor',
  'dataInicio',
  'dataFim',
  'observacao',
];

export const CAMPOS_INSUMO: (keyof Insumo & string)[] = ['id', 'nome', 'tipo', 'valorKg'];

export const CAMPOS_ITEM_DIETA: (keyof ItemDieta & string)[] = ['id', 'categoria', 'insumo', 'percentual'];

export const CAMPOS_CONSUMO_CATEGORIA: (keyof ConsumoCategoria & string)[] = ['id', 'categoria', 'tipo', 'kgDia'];

export const CAMPOS_GMD_CATEGORIA: (keyof GmdCategoria & string)[] = ['id', 'categoria', 'gmdKgDia'];

export const CAMPOS_MARCO_IDADE: (keyof MarcoIdade & string)[] = ['id', 'marco', 'idadeDias'];

/**
 * Subconjunto de campos de RegRebanho pra "Projeção de rebanho" — só os
 * animais Prenha ou numa das 4 categorias-fonte de transição (Bezerro,
 * Bezerra, Garrote, Novilha) entram aqui (filtrado ANTES de empacotar, ver
 * page.tsx), pra não mandar as ~7.500 linhas que não interessam pra essa
 * conta. `projetarRebanho` roda no CLIENTE com este subconjunto — o
 * horizonte em meses é interativo, recalcular no servidor a cada mudança
 * custaria um round-trip por clique.
 */
export const CAMPOS_REBANHO_PROJECAO: (keyof RegRebanho & string)[] = ['id', 'categoria', 'fazenda', 'nascimento', 'reproducao'];

/** Idem, mas de RegIatf — só a Data IATF mais recente de cada animal Prenha importa aqui (ver projecaoRebanho.ts). */
export const CAMPOS_IATF_PROJECAO: (keyof RegIatf & string)[] = ['id', 'data'];

/** Idem, mas de RegToque — âncora de fallback quando o IATF do animal Prenha é velho demais (repasse não lançado, ver projecaoRebanho.ts). */
export const CAMPOS_TOQUE_PROJECAO: (keyof RegToque & string)[] = ['id', 'data', 'diagnostico'];

export const CAMPOS_EVENTO: (keyof EventoFin & string)[] = [
  'origem',
  'tipo',
  'id',
  'idAnimal',
  'data',
  'fazenda',
  'cliente',
  'pesoKg',
  'categoria',
  'causa',
  'valorEvento',
  'valorLancado',
  'conciliacao',
  'statusValorVenda',
  'categoriaEstimada',
  'valorEstimado',
  'valorMetrica',
  'origemValor',
];

/**
 * Prop empacotada da página Financeiro — diferente das outras páginas
 * (`PacoteLeitura<T>`, uma leitura só) porque aqui o servidor já combina 11
 * abas (Venda, Baixa, Aborto, Financeiro, RebanhoProd, Categoria@, Custos,
 * Categorias de Custo, Insumos, Dieta por Categoria, GMD por Categoria) em
 * `eventos` + `orfaos` via `montarEventos` (financeiro.ts) ANTES de
 * empacotar — RebanhoProd/Categoria@ só entram pra CALCULAR
 * categoriaEstimada/valorEstimado no servidor; o cliente nunca vê essas
 * duas abas, só o resultado já pronto em cada evento. `custos` e
 * `categoriasCusto` já vêm prontos (não precisam de conciliação nenhuma).
 *
 * `funisPorFazenda` (Custo de formação, 16/09/2026) é a mesma lógica:
 * `calcularFunis` já roda no servidor (precisa de RebanhoProd inteiro pro
 * efetivo/rateio de custo fixo — não vale a pena mandar pro cliente), um
 * item por Fazenda (`null` = consolidado, todas) pra trocar sem re-buscar.
 * `gmdSugerido` é a sugestão de GMD por categoria (Pesagem/Lotes de
 * engorda) pra pré-preencher "GMD por Categoria" — pequeno, não precisa de
 * `Pacote<T>`.
 */
export interface PacoteFinanceiro {
  eventos: Pacote<EventoFin>;
  orfaos: Pacote<LancamentoFinanceiro>;
  custos: Pacote<Custo>;
  categoriasCusto: Pacote<CategoriaCusto>;
  insumos: Pacote<Insumo>;
  dieta: Pacote<ItemDieta>;
  consumoCategoria: Pacote<ConsumoCategoria>;
  gmdCategoria: Pacote<GmdCategoria>;
  gmdSugerido: [string, number][];
  marcosIdade: Pacote<MarcoIdade>;
  funisPorFazenda: { fazenda: string | null; funis: FunilCalculado[] }[];
  retratoPorFazenda: { fazenda: string | null; retrato: RetratoCategoria[] }[];
  /** Subconjunto reduzido (Prenha + 4 categorias-fonte), ver CAMPOS_REBANHO_PROJECAO — a "Projeção de rebanho" roda `projetarRebanho` no cliente com isto. */
  rebanhoProjecao: Pacote<RegRebanho>;
  iatfProjecao: Pacote<RegIatf>;
  /** Toque de cada animal Prenha — usado como âncora de fallback quando o IATF é velho demais, ver projecaoRebanho.ts. */
  toqueProjecao: Pacote<RegToque>;
  configurado: boolean;
  stale: boolean;
  carregadoEm: number | null;
}
