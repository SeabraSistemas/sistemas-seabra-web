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
  Custo,
  DescricaoCusto,
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
];

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

export const CAMPOS_DESCRICAO_CUSTO: (keyof DescricaoCusto & string)[] = ['id', 'nome'];

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
 * (`PacoteLeitura<T>`, uma leitura só) porque aqui o servidor já combina 9
 * abas (Venda, Baixa, Aborto, Financeiro, RebanhoProd, Categoria@, Custos,
 * Categorias de Custo, Descrições de Custo) em `eventos` + `orfaos` via
 * `montarEventos` (financeiro.ts) ANTES de empacotar — RebanhoProd/
 * Categoria@ só entram pra CALCULAR categoriaEstimada/valorEstimado no
 * servidor; o cliente nunca vê essas duas abas, só o resultado já pronto em
 * cada evento. `custos`, `categoriasCusto` e `descricoesCusto` já vêm
 * prontos (não precisam de conciliação nenhuma).
 */
export interface PacoteFinanceiro {
  eventos: Pacote<EventoFin>;
  orfaos: Pacote<LancamentoFinanceiro>;
  custos: Pacote<Custo>;
  categoriasCusto: Pacote<CategoriaCusto>;
  descricoesCusto: Pacote<DescricaoCusto>;
  configurado: boolean;
  stale: boolean;
  carregadoEm: number | null;
}
