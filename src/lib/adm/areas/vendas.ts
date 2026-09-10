import 'server-only';

import { VIEWS_VENDA, type LinhaVenda } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * VENDAS — a leitura de `adm.venda_detalhe` e as regras da tela.
 *
 * ⚠️ TODO NÚMERO DE DINHEIRO AQUI TEM DENOMINADOR PRÓPRIO, e é a regra que
 * organiza o módulo inteiro: `valor` nunca é null e é ZERO em 87% das vendas.
 * O criador registra a saída do animal e não informa o preço.
 *
 * Dividir a receita pelas 1.281 vendas daria R$ 153 de preço médio; sobre as 167
 * que têm preço, o valor real é sete vezes maior. Um é uma afirmação sobre o
 * mercado, o outro é uma afirmação sobre o preenchimento — e só o segundo é
 * verdade.
 */

const SQL_VENDAS = 'supabase/adm/adm_22_vendas.sql';

const PROJECAO = {
  propriedade_id: true,
  venda_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  categoria: true,
  data_venda: true,
  valor: true,
  com_valor: true,
  data_de_nascimento: true,
  idade_ao_vender: true,
  peso_atual: true,
  observacao: true,
} satisfies Record<keyof LinhaVenda, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

export const PERIODOS = ['12m', '24m', 'ano', 'tudo'] as const;
export type Periodo = (typeof PERIODOS)[number];
export const PERIODO_PADRAO: Periodo = '12m';

export const ROTULO_PERIODO: Record<Periodo, string> = {
  '12m': '12 meses',
  '24m': '24 meses',
  ano: 'ano corrente',
  tudo: 'todo o histórico',
};

export function lerPeriodo(bruto: string | string[] | undefined): Periodo {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : PERIODO_PADRAO;
}

const UM_DIA_MS = 86_400_000;

export function inicioDoPeriodo(periodo: Periodo, hoje: Date): string | null {
  if (periodo === 'tudo') return null;
  if (periodo === 'ano') return `${hoje.getUTCFullYear()}-01-01`;
  const dias = periodo === '12m' ? 365 : 730;
  return new Date(hoje.getTime() - dias * UM_DIA_MS).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarVendas(
  propriedadeId: number,
  desde: string | null,
): Promise<Resultado<LinhaVenda[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_VENDA.detalhe;
  const res = await paginarView(view, SQL_VENDAS, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = desde === null ? base : base.gte('data_venda', desde);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: um lote inteiro sai no mesmo dia — o id desempata.
      .order('data_venda', { ascending: false })
      .order('venda_id', { ascending: false })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraVenda));
}

function paraVenda(l: Linha): LinhaVenda {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    venda_id: Math.round(numeroDe(l.venda_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    categoria: textoDe(l.categoria),
    data_venda: textoDe(l.data_venda) ?? '',
    valor: numeroDe(l.valor),
    com_valor: l.com_valor === true,
    data_de_nascimento: textoDe(l.data_de_nascimento),
    idade_ao_vender: numeroDe(l.idade_ao_vender),
    peso_atual: numeroDe(l.peso_atual),
    observacao: textoDe(l.observacao),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoVendas {
  vendas: number;
  animais: number;
  /** Vendas com preço lançado — o denominador de tudo que é dinheiro. */
  comValor: number;
  /** Fração com preço. null quando não houve venda. */
  fracaoComValor: number | null;
  /** Soma dos valores lançados. NUNCA é "a receita da fazenda". */
  receita: number;
  /** Receita ÷ vendas COM valor. Nunca ÷ total de vendas. */
  precoMedio: number | null;
  maiorVenda: LinhaVenda | null;
  femeas: number;
  machos: number;
  idadeMediaDias: number | null;
  comIdade: number;
  /** Animais que aparecem em mais de uma venda — impossível, é relançamento. */
  animaisRepetidos: number;
}

/** Abaixo disto, preço médio e receita não descrevem o negócio do cliente. */
export const PRECO_CONFIAVEL = 0.5;

export function resumoVendas(vendas: LinhaVenda[]): ResumoVendas {
  const comValor = vendas.filter((v) => v.com_valor);
  const receita = comValor.reduce((acc, v) => acc + (v.valor ?? 0), 0);
  const comIdade = vendas.filter((v) => v.idade_ao_vender !== null && v.idade_ao_vender >= 0);

  const porAnimal = new Map<number, number>();
  for (const venda of vendas) porAnimal.set(venda.animal_id, (porAnimal.get(venda.animal_id) ?? 0) + 1);

  const ehFemea = (v: LinhaVenda) => (v.sexo ?? '').toLowerCase().startsWith('f');
  const ehMacho = (v: LinhaVenda) => (v.sexo ?? '').toLowerCase().startsWith('m');

  return {
    vendas: vendas.length,
    animais: porAnimal.size,
    comValor: comValor.length,
    fracaoComValor: vendas.length > 0 ? comValor.length / vendas.length : null,
    receita,
    // O denominador é `comValor`, e essa é a linha mais importante do arquivo.
    precoMedio: comValor.length > 0 ? receita / comValor.length : null,
    maiorVenda:
      comValor.length > 0
        ? comValor.reduce((maior, v) => ((v.valor ?? 0) > (maior.valor ?? 0) ? v : maior))
        : null,
    femeas: vendas.filter(ehFemea).length,
    machos: vendas.filter(ehMacho).length,
    idadeMediaDias:
      comIdade.length > 0
        ? comIdade.reduce((acc, v) => acc + (v.idade_ao_vender ?? 0), 0) / comIdade.length
        : null,
    comIdade: comIdade.length,
    animaisRepetidos: [...porAnimal.values()].filter((n) => n > 1).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Por categoria
// ─────────────────────────────────────────────────────────────────────────────

export interface SexoVenda {
  rotulo: string;
  vendas: number;
  comValor: number;
  precoMedio: number | null;
  idadeMediaDias: number | null;
}

/**
 * Vendas por sexo.
 *
 * ⚠️ POR QUE NÃO EXISTE UM CORTE POR CATEGORIA AQUI, que seria o óbvio: o app
 * TROCA a categoria do animal quando ele é vendido — as 512 vendas da fazenda
 * 244 estão todas na categoria "Vendido", então agrupar por ela devolve uma
 * linha só e não informa nada. A coluna `rebanho.categoria_anterior`, que
 * guardaria o que o animal era, está preenchida em 33 das 1.281 vendas (2,6%).
 *
 * Sobram duas dimensões que sobrevivem à venda: SEXO e IDADE — e são elas que a
 * tela usa.
 */
export function porSexo(vendas: LinhaVenda[]): SexoVenda[] {
  const grupo = (rotulo: string, filtro: (v: LinhaVenda) => boolean): SexoVenda => {
    const doGrupo = vendas.filter(filtro);
    const comValor = doGrupo.filter((v) => v.com_valor);
    const comIdade = doGrupo.filter((v) => v.idade_ao_vender !== null && v.idade_ao_vender >= 0);
    return {
      rotulo,
      vendas: doGrupo.length,
      comValor: comValor.length,
      precoMedio:
        comValor.length > 0
          ? comValor.reduce((acc, v) => acc + (v.valor ?? 0), 0) / comValor.length
          : null,
      idadeMediaDias:
        comIdade.length > 0
          ? comIdade.reduce((acc, v) => acc + (v.idade_ao_vender ?? 0), 0) / comIdade.length
          : null,
    };
  };

  const ehFemea = (v: LinhaVenda) => (v.sexo ?? '').toLowerCase().startsWith('f');
  const ehMacho = (v: LinhaVenda) => (v.sexo ?? '').toLowerCase().startsWith('m');

  return [
    grupo('Fêmeas', ehFemea),
    grupo('Machos', ehMacho),
    grupo('Sem sexo cadastrado', (v) => !ehFemea(v) && !ehMacho(v)),
  ].filter((g) => g.vendas > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Idade ao vender
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaIdadeVenda {
  rotulo: string;
  detalhe: string;
  vendas: number;
  fracao: number | null;
  /** Quantas daquela faixa tiveram preço lançado — o denominador do preço. */
  comValor: number;
  precoMedio: number | null;
}

/**
 * Faixas de idade na saída, na ordem da vida.
 *
 * A primeira faixa não é enfeite: em leiteiro o cabrito MACHO sai nos primeiros
 * dias, porque não dá leite — e o dado confirma (há vendas com um dia de vida).
 * Ver quanto do total está ali diz se a fazenda tem destino para o macho ou se
 * ele é descartado no nascimento, que é uma conversa comercial inteira.
 */
const FAIXAS_IDADE: { rotulo: string; detalhe: string; de: number; ate: number | null }[] = [
  { rotulo: 'até 7 dias', detalhe: 'cabrito macho recém-nascido', de: 0, ate: 7 },
  { rotulo: '8 a 90 dias', detalhe: 'antes do desmame', de: 8, ate: 90 },
  { rotulo: '91 a 365', detalhe: 'recria', de: 91, ate: 365 },
  { rotulo: '1 a 3 anos', detalhe: 'jovem adulto', de: 366, ate: 1095 },
  { rotulo: 'acima de 3 anos', detalhe: 'matriz ou reprodutor de descarte', de: 1096, ate: null },
];

export function faixasDeIdade(vendas: LinhaVenda[]): FaixaIdadeVenda[] {
  const comIdade = vendas.filter((v) => v.idade_ao_vender !== null && v.idade_ao_vender >= 0);
  const total = comIdade.length;

  return FAIXAS_IDADE.map((faixa) => {
    const daFaixa = comIdade.filter((v) => {
      const idade = v.idade_ao_vender ?? 0;
      return faixa.ate === null ? idade >= faixa.de : idade >= faixa.de && idade <= faixa.ate;
    });
    // O preço vem junto da faixa porque a pergunta comercial é uma só: vale
    // segurar o animal mais tempo? Ela só se responde vendo idade E preço lado a
    // lado — e cada faixa tem o seu próprio punhado de preços lançados.
    const comValor = daFaixa.filter((v) => v.com_valor);
    return {
      rotulo: faixa.rotulo,
      detalhe: faixa.detalhe,
      vendas: daFaixa.length,
      fracao: total > 0 ? daFaixa.length / total : null,
      comValor: comValor.length,
      precoMedio:
        comValor.length > 0
          ? comValor.reduce((acc, v) => acc + (v.valor ?? 0), 0) / comValor.length
          : null,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Séries
// ─────────────────────────────────────────────────────────────────────────────

export const CURVA_VENDAS = 'vendas';
export const CURVA_RECEITA = 'receita';

/** Vendas por mês — a contagem, que existe mesmo sem preço lançado. */
export function serieVendas(vendas: LinhaVenda[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const venda of vendas) {
    if (venda.data_venda === '') continue;
    const mes = venda.data_venda.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

/**
 * Receita por mês — só do que tem preço.
 *
 * O mês em que ninguém lançou preço fica AUSENTE, e não zerado: zero diria "não
 * faturou", quando a verdade é "não anotou". Quem preenche o eixo é a tela.
 */
export function serieReceita(vendas: LinhaVenda[]): PontoSerie[] {
  const soma = new Map<string, number>();
  for (const venda of vendas) {
    if (venda.data_venda === '' || !venda.com_valor) continue;
    const mes = venda.data_venda.slice(0, 7);
    soma.set(mes, (soma.get(mes) ?? 0) + (venda.valor ?? 0));
  }
  return [...soma.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export const RANKING_LIMITE = 10;

/** As maiores vendas — só as que têm preço, ordem TOTAL por valor e animal. */
export function maioresVendas(vendas: LinhaVenda[], limite: number = RANKING_LIMITE): LinhaVenda[] {
  return vendas
    .filter((v) => v.com_valor)
    .sort(
      (a, b) =>
        (b.valor ?? 0) - (a.valor ?? 0) || a.numero_animal.localeCompare(b.numero_animal, 'pt-BR'),
    )
    .slice(0, limite);
}
