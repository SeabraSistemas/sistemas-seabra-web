import 'server-only';

import {
  VIEWS_REBANHO,
  type LinhaAnimal,
  type LinhaInventario,
  type MotivoSaida,
  type PontoSerieNomeada,
} from '@/lib/adm/areas/contrato';
import {
  comoLinhas,
  falhaDeLeitura,
  numeroDe,
  paginarView,
  textoDe,
  type Consulta,
  type ErroPostgrest,
  type Linha,
} from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type FatiaDistribuicao, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * REBANHO — inventário e fluxo.
 *
 * A ENTREGA CENTRAL DESTE MÓDULO é o balde `saida_sem_motivo`, e ele merece a
 * explicação: dos 8.359 animais inativos da base, 6.620 (79%) saíram do rebanho
 * sem venda, sem óbito e sem descarte registrados. Enquanto esse número é
 * grande, a taxa de mortalidade e a de descarte daquela fazenda são
 * INCALCULÁVEIS — não porque a conta seja difícil, mas porque o denominador das
 * saídas não existe.
 *
 * E o padrão varia de 0% a 100% conforme o cliente, o que faz dele um indicador
 * de ADOÇÃO, não de rebanho: a fazenda 233 registra todas as saídas; a 238
 * tem 4.176 inativos e nenhum motivo — perfil de importação histórica, não de
 * uso do app.
 */

const SQL_REBANHO = 'supabase/adm/adm_18_rebanho.sql';

const PROJECAO_INVENTARIO = {
  propriedade_id: true,
  ativos: true,
  inativos: true,
  saida_venda: true,
  saida_obito: true,
  saida_descarte: true,
  saida_sem_motivo: true,
  sem_categoria: true,
  sem_sexo: true,
  sem_baia: true,
  sem_nascimento: true,
  ativos_com_obito: true,
  ativos_com_venda: true,
  fluxo_mensal: true,
} satisfies Record<keyof LinhaInventario, true>;

const PROJECAO_ANIMAL = {
  propriedade_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  status: true,
  categoria: true,
  baia: true,
  data_de_nascimento: true,
  idade_dias: true,
  peso_atual: true,
  dias_em_lactacao: true,
  ordem_parto: true,
  gestacao_ativa: true,
  status_reproducao: true,
  data_venda: true,
  motivo_saida: true,
} satisfies Record<keyof LinhaAnimal, true>;

const SELECT_INVENTARIO = Object.keys(PROJECAO_INVENTARIO).join(',');
const SELECT_ANIMAL = Object.keys(PROJECAO_ANIMAL).join(',');

export const CURVA_NASCIMENTOS = 'nascimentos';
export const CURVA_VENDAS = 'vendas';
export const CURVA_OBITOS = 'obitos';

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export function inventarioVazio(propriedadeId: number): LinhaInventario {
  return {
    propriedade_id: propriedadeId,
    ativos: 0,
    inativos: 0,
    saida_venda: 0,
    saida_obito: 0,
    saida_descarte: 0,
    saida_sem_motivo: 0,
    sem_categoria: 0,
    sem_sexo: 0,
    sem_baia: 0,
    sem_nascimento: 0,
    ativos_com_obito: 0,
    ativos_com_venda: 0,
    fluxo_mensal: null,
  };
}

export async function getInventario(propriedadeId: number): Promise<Resultado<LinhaInventario>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_REBANHO.inventario;
  const { data, error } = (await supa
    .from(view)
    .select(SELECT_INVENTARIO)
    .eq('propriedade_id', propriedadeId)
    .limit(1)) as { data: unknown[] | null; error: ErroPostgrest | null };

  if (error) return falhaDeLeitura<LinhaInventario>(view, SQL_REBANHO, error);

  const linha = comoLinhas(data ?? [])[0];
  if (!linha) return ok(inventarioVazio(propriedadeId));

  const inteiro = (chave: string) => Math.round(numeroDe(linha[chave]) ?? 0);
  return ok({
    propriedade_id: inteiro('propriedade_id') || propriedadeId,
    ativos: inteiro('ativos'),
    inativos: inteiro('inativos'),
    saida_venda: inteiro('saida_venda'),
    saida_obito: inteiro('saida_obito'),
    saida_descarte: inteiro('saida_descarte'),
    saida_sem_motivo: inteiro('saida_sem_motivo'),
    sem_categoria: inteiro('sem_categoria'),
    sem_sexo: inteiro('sem_sexo'),
    sem_baia: inteiro('sem_baia'),
    sem_nascimento: inteiro('sem_nascimento'),
    ativos_com_obito: inteiro('ativos_com_obito'),
    ativos_com_venda: inteiro('ativos_com_venda'),
    fluxo_mensal: pontosNomeados(linha.fluxo_mensal),
  });
}

function pontosNomeados(v: unknown): PontoSerieNomeada[] | null {
  if (!Array.isArray(v)) return null;
  const pontos = comoLinhas(v)
    .map((l) => ({
      serie: textoDe(l.serie) ?? '',
      periodo: textoDe(l.periodo) ?? '',
      valor: numeroDe(l.valor) ?? 0,
    }))
    .filter((p) => p.serie !== '' && p.periodo !== '');
  return pontos.length > 0 ? pontos : null;
}

/**
 * O EFETIVO — só os ativos.
 *
 * O filtro de status é no BANCO, e não em memória: a maior propriedade tem 806
 * ativos contra 4.176 inativos, e trazer os inativos para montar uma lista de
 * efetivo seria pagar cinco vezes o payload para descartar.
 */
export async function listarAnimaisAtivos(propriedadeId: number): Promise<Resultado<LinhaAnimal[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_REBANHO.animal;
  const res = await paginarView(view, SQL_REBANHO, (de, ate) =>
    (
      supa
        .from(view)
        .select(SELECT_ANIMAL)
        .eq('propriedade_id', propriedadeId)
        // 'ativo' MINÚSCULO — dois índices do banco nasceram com 'Ativo' e nunca
        // casaram uma linha (ver adm_04_indices.sql BLOCO C).
        .eq('status', 'ativo') as unknown as Consulta
    )
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraAnimal));
}

function paraAnimal(l: Linha): LinhaAnimal {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    status: textoDe(l.status),
    categoria: textoDe(l.categoria),
    baia: textoDe(l.baia),
    data_de_nascimento: textoDe(l.data_de_nascimento),
    idade_dias: numeroDe(l.idade_dias),
    peso_atual: numeroDe(l.peso_atual),
    dias_em_lactacao: numeroDe(l.dias_em_lactacao),
    ordem_parto: numeroDe(l.ordem_parto),
    gestacao_ativa: l.gestacao_ativa === true,
    status_reproducao: textoDe(l.status_reproducao),
    data_venda: textoDe(l.data_venda),
    motivo_saida: (textoDe(l.motivo_saida) ?? 'ativo') as MotivoSaida,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Composição das saídas — o achado
// ─────────────────────────────────────────────────────────────────────────────

export interface Saida {
  motivo: Exclude<MotivoSaida, 'ativo'>;
  rotulo: string;
  detalhe: string;
  animais: number;
  /** Fração sobre os INATIVOS, nunca sobre o rebanho todo. */
  fracao: number | null;
}

export function composicaoSaidas(inv: LinhaInventario): Saida[] {
  const total = inv.inativos;
  const fracao = (n: number) => (total > 0 ? n / total : null);

  return [
    {
      motivo: 'venda' as const,
      rotulo: 'Venda',
      detalhe: 'saiu com data de venda registrada',
      animais: inv.saida_venda,
      fracao: fracao(inv.saida_venda),
    },
    {
      motivo: 'obito' as const,
      rotulo: 'Óbito',
      detalhe: 'morreu, com registro na tabela de óbitos',
      animais: inv.saida_obito,
      fracao: fracao(inv.saida_obito),
    },
    {
      motivo: 'descarte' as const,
      rotulo: 'Descarte',
      detalhe: "manejo com 'descarte' — não existe tabela própria",
      animais: inv.saida_descarte,
      fracao: fracao(inv.saida_descarte),
    },
    {
      motivo: 'sem_motivo' as const,
      rotulo: 'Sem motivo registrado',
      detalhe: 'inativado sem venda, óbito ou descarte',
      animais: inv.saida_sem_motivo,
      fracao: fracao(inv.saida_sem_motivo),
    },
  ];
}

/**
 * A fração de saídas COM motivo — o indicador de adoção que sai daqui.
 *
 * null quando não houve saída nenhuma: fazenda que nunca perdeu animal não tem
 * "0% de registro", tem ausência de denominador. Distinguir os dois importa
 * porque um é problema de uso do app e o outro é um rebanho novo.
 */
export function taxaSaidaRegistrada(inv: LinhaInventario): number | null {
  if (inv.inativos === 0) return null;
  return (inv.saida_venda + inv.saida_obito + inv.saida_descarte) / inv.inativos;
}

/** Abaixo disto, mortalidade e descarte daquela fazenda não podem ser afirmados. */
export const REGISTRO_CONFIAVEL = 0.8;

// ─────────────────────────────────────────────────────────────────────────────
// Buracos de cadastro
// ─────────────────────────────────────────────────────────────────────────────

export interface Buraco {
  rotulo: string;
  animais: number;
  fracao: number | null;
  detalhe: string;
}

/**
 * O que falta no cadastro do EFETIVO — e onde cada buraco reaparece.
 *
 * Não é lista de reclamação: cada linha aqui é uma tela do painel que mostra
 * "—" por causa dela. Animal sem data de nascimento não entra em faixa etária
 * nem em idade ao primeiro parto; sem baia, não entra em nenhum recorte de
 * curral.
 */
export function buracosDeCadastro(inv: LinhaInventario): Buraco[] {
  const fracao = (n: number) => (inv.ativos > 0 ? n / inv.ativos : null);

  return [
    {
      rotulo: 'Sem categoria',
      animais: inv.sem_categoria,
      fracao: fracao(inv.sem_categoria),
      detalhe: 'fica fora do donut de composição do rebanho',
    },
    {
      rotulo: 'Sem sexo',
      animais: inv.sem_sexo,
      fracao: fracao(inv.sem_sexo),
      detalhe: 'não entra em fêmeas ativas nem em nenhuma conta de reprodução',
    },
    {
      rotulo: 'Sem baia',
      animais: inv.sem_baia,
      fracao: fracao(inv.sem_baia),
      detalhe: 'some de todo recorte por curral — produção por baia, DG pendente por baia',
    },
    {
      rotulo: 'Sem data de nascimento',
      animais: inv.sem_nascimento,
      fracao: fracao(inv.sem_nascimento),
      detalhe: 'sem idade: fora da pirâmide etária e da idade ao primeiro parto',
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Composição do efetivo
// ─────────────────────────────────────────────────────────────────────────────

export interface CelulaComposicao {
  categoria: string;
  femeas: number;
  machos: number;
  semSexo: number;
  total: number;
}

const SEM_CATEGORIA = 'Sem categoria';

/** 'fêmea' COM ACENTO é o valor real; a comparação ignora acento para não
 *  depender da grafia que veio do app. */
function ehFemea(animal: LinhaAnimal): boolean {
  return (animal.sexo ?? '').toLowerCase().startsWith('f');
}
function ehMacho(animal: LinhaAnimal): boolean {
  return (animal.sexo ?? '').toLowerCase().startsWith('m');
}

/**
 * Categoria × sexo do efetivo, da categoria mais numerosa para a menor.
 *
 * É a tabela que o criador tem na cabeça ("tenho 60 lactantes, 20 secas, 15
 * borregas") e que nenhuma tela mostrava — o donut da aba Rebanho reparte por
 * categoria mas não abre por sexo, e categoria como "Cria" tem os dois.
 */
export function composicaoDoEfetivo(animais: LinhaAnimal[]): CelulaComposicao[] {
  const porCategoria = new Map<string, LinhaAnimal[]>();
  for (const animal of animais) {
    const chave = animal.categoria?.trim() || SEM_CATEGORIA;
    const lista = porCategoria.get(chave);
    if (lista) lista.push(animal);
    else porCategoria.set(chave, [animal]);
  }

  return [...porCategoria.entries()]
    .map(([categoria, doGrupo]) => ({
      categoria,
      femeas: doGrupo.filter(ehFemea).length,
      machos: doGrupo.filter(ehMacho).length,
      semSexo: doGrupo.filter((a) => !ehFemea(a) && !ehMacho(a)).length,
      total: doGrupo.length,
    }))
    .sort((a, b) => {
      // "Sem categoria" por último: é falha de cadastro, não uma categoria do
      // rebanho — mesmo critério de "Sem baia" nas outras telas.
      if (a.categoria === SEM_CATEGORIA) return b.categoria === SEM_CATEGORIA ? 0 : 1;
      if (b.categoria === SEM_CATEGORIA) return -1;
      return b.total - a.total || a.categoria.localeCompare(b.categoria, 'pt-BR');
    });
}

/** Distribuição do efetivo por baia, para <DistribuicaoBarras>. */
export function efetivoPorBaia(animais: LinhaAnimal[]): FatiaDistribuicao[] {
  const contagem = new Map<string, number>();
  for (const animal of animais) {
    const chave = animal.baia?.trim() || 'Sem baia';
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo mensal
// ─────────────────────────────────────────────────────────────────────────────

/** Uma das três curvas do fluxo, no formato que <SerieTemporal> come. */
export function curvaDoFluxo(inv: LinhaInventario, curva: string): PontoSerie[] {
  return (inv.fluxo_mensal ?? [])
    .filter((p) => p.serie === curva)
    .map((p) => ({ periodo: p.periodo, valor: p.valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export interface SaldoFluxo {
  entradas: number;
  saidas: number;
  saldo: number;
}

/**
 * Entradas e saídas dos 24 meses do fluxo.
 *
 * ⚠️ O SALDO NÃO FECHA COM A VARIAÇÃO DO EFETIVO, e não deveria mesmo: os
 * animais que saíram sem motivo não têm data de saída e não estão em curva
 * nenhuma. A tela imprime esse aviso junto do número — sem ele, alguém tenta
 * conciliar e conclui que a conta está errada, quando o errado é o cadastro.
 */
export function saldoDoFluxo(inv: LinhaInventario): SaldoFluxo {
  const soma = (curva: string) => curvaDoFluxo(inv, curva).reduce((acc, p) => acc + p.valor, 0);
  const entradas = soma(CURVA_NASCIMENTOS);
  const saidas = soma(CURVA_VENDAS) + soma(CURVA_OBITOS);
  return { entradas, saidas, saldo: entradas - saidas };
}
