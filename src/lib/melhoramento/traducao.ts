/**
 * TRADUÇÃO das linhas das views `adm.melhoramento_*` para as entradas do
 * motor — e as projeções (o SELECT) de cada view, conferidas em compilação
 * contra o contrato (src/lib/adm/areas/contrato.ts).
 *
 * Fica fora de src/lib/adm/areas/melhoramento.ts (que é `server-only`) porque
 * o script de rodadas (scripts/melhoramento/rodar.ts) lê as MESMAS views com a
 * MESMA tradução: duas cópias divergiriam na primeira coluna nova. Puro: não
 * lê banco, só converte.
 */

import type {
  LinhaMelhoramentoBovinoAnimal,
  LinhaMelhoramentoBovinoFazenda,
  LinhaMelhoramentoBovinoPesagem,
  LinhaMelhoramentoFazenda,
  LinhaMelhoramentoLactacao,
  LinhaMelhoramentoPedigree,
  LinhaMelhoramentoResultado,
  LinhaMelhoramentoRodada,
  LinhaMelhoramentoValidacao,
  LinhaMelhoramentoVinculo,
} from '@/lib/adm/areas/contrato';
import type { AnimalCorteEntrada, PesagemCorteEntrada } from '@/lib/melhoramento/corte';
import type { AnimalEntrada, LactacaoEntrada } from '@/lib/melhoramento/tipos';
import type { Confirmacao, VinculoEntrada } from '@/lib/melhoramento/vinculos';

export type Linha = Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Projeções
// ─────────────────────────────────────────────────────────────────────────────

const PROJ_LACTACAO = {
  propriedade_id: true,
  especie: true,
  lactacao_id: true,
  animal_id: true,
  raca: true,
  ordem_lactacao: true,
  lactacoes_do_animal: true,
  ordem_parto_cadastro: true,
  data_inicio: true,
  ano_parto: true,
  mes_parto: true,
  estacao_parto: true,
  ano_estacao: true,
  idade_parto_dias: true,
  data_encerramento: true,
  encerrada: true,
  duracao_dias: true,
  dias_registrados: true,
  total_leite: true,
  media_leite: true,
  metodo_inferencia: true,
  confianca_inferencia: true,
  sintetica: true,
  pai_id: true,
  mae_id: true,
} satisfies Record<keyof LinhaMelhoramentoLactacao, true>;

const PROJ_PEDIGREE = {
  animal_id: true,
  propriedade_id: true,
  especie: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  data_de_nascimento: true,
  pai_id: true,
  mae_id: true,
  raca: true,
  status: true,
} satisfies Record<keyof LinhaMelhoramentoPedigree, true>;

const PROJ_FAZENDA = {
  propriedade_id: true,
  especie: true,
  nome: true,
  produtor_id: true,
  teste: true,
  animais: true,
  lactacoes: true,
  lactacoes_encerradas: true,
  lactacoes_sinteticas: true,
} satisfies Record<keyof LinhaMelhoramentoFazenda, true>;

const PROJ_BOVINO_ANIMAL = {
  animal_id: true,
  propriedade_id: true,
  sexo: true,
  data_de_nascimento: true,
  pai_id: true,
  mae_id: true,
  receptora_id: true,
  numero: true,
  nome: true,
  apenas_genealogia: true,
  status: true,
  peso_ao_nascer: true,
  peso_nascer_parto: true,
  origem_prenhez: true,
  pais_candidatos: true,
} satisfies Record<keyof LinhaMelhoramentoBovinoAnimal, true>;

const PROJ_BOVINO_PESAGEM = {
  pesagem_id: true,
  animal_id: true,
  propriedade_id: true,
  propriedade_pesagem: true,
  data_pesagem: true,
  peso_kg: true,
  idade_dias: true,
  lote_id: true,
  condicao_criacao: true,
} satisfies Record<keyof LinhaMelhoramentoBovinoPesagem, true>;

const PROJ_BOVINO_FAZENDA = {
  propriedade_id: true,
  nome: true,
  produtor_id: true,
  teste: true,
  animais: true,
  com_nascimento: true,
  com_pai: true,
  com_mae: true,
  apenas_genealogia: true,
  pesagens: true,
  pesagens_sem_nascimento: true,
  pesagens_janela: true,
  animais_janela: true,
} satisfies Record<keyof LinhaMelhoramentoBovinoFazenda, true>;

const PROJ_VINCULO = {
  id: true,
  especie: true,
  animal_a: true,
  propriedade_a: true,
  animal_b: true,
  propriedade_b: true,
  motivos: true,
  detalhe: true,
  confirmacao: true,
  confirmado_por: true,
  confirmado_em: true,
  observacao: true,
  gerado_em: true,
  atualizado_em: true,
} satisfies Record<keyof LinhaMelhoramentoVinculo, true>;

const PROJ_RODADA = {
  id: true,
  criada_em: true,
  especie: true,
  propriedade_id: true,
  modelo: true,
  caracteristica: true,
  parametros: true,
  versao_motor: true,
  status: true,
  n_animais: true,
  n_registros: true,
  resumo: true,
  observacao: true,
} satisfies Record<keyof LinhaMelhoramentoRodada, true>;

const PROJ_VALIDACAO = {
  rodada_id: true,
  metrica: true,
  valor: true,
  n: true,
  detalhe: true,
} satisfies Record<keyof LinhaMelhoramentoValidacao, true>;

const PROJ_RESULTADO = {
  rodada_id: true,
  animal_id: true,
  propriedade_id: true,
  valor: true,
  confiabilidade: true,
  posicao: true,
  extra: true,
} satisfies Record<keyof LinhaMelhoramentoResultado, true>;

export const SELECT = {
  lactacao: Object.keys(PROJ_LACTACAO).join(','),
  pedigree: Object.keys(PROJ_PEDIGREE).join(','),
  fazenda: Object.keys(PROJ_FAZENDA).join(','),
  bovinoAnimal: Object.keys(PROJ_BOVINO_ANIMAL).join(','),
  bovinoPesagem: Object.keys(PROJ_BOVINO_PESAGEM).join(','),
  bovinoFazenda: Object.keys(PROJ_BOVINO_FAZENDA).join(','),
  vinculo: Object.keys(PROJ_VINCULO).join(','),
  rodada: Object.keys(PROJ_RODADA).join(','),
  validacao: Object.keys(PROJ_VALIDACAO).join(','),
  resultado: Object.keys(PROJ_RESULTADO).join(','),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Conversões elementares (as mesmas regras de src/lib/adm/areas/leitura.ts)
// ─────────────────────────────────────────────────────────────────────────────

export function textoDe(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

/** `numeric` chega como string pelo PostgREST quando não cabe em double. */
export function numeroDe(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function inteiroOuNull(v: unknown): number | null {
  const n = numeroDe(v);
  return n == null ? null : Math.round(n);
}

function objetoDe(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// Linha → entrada do motor
// ─────────────────────────────────────────────────────────────────────────────

export function paraLactacao(l: Linha): LactacaoEntrada {
  return {
    lactacaoId: inteiroOuNull(l.lactacao_id) ?? 0,
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    propriedadeId: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    raca: textoDe(l.raca),
    ordemLactacao: inteiroOuNull(l.ordem_lactacao) ?? 1,
    lactacoesDoAnimal: inteiroOuNull(l.lactacoes_do_animal) ?? 1,
    ordemPartoCadastro: inteiroOuNull(l.ordem_parto_cadastro),
    dataInicio: textoDe(l.data_inicio) ?? '',
    anoEstacao: inteiroOuNull(l.ano_estacao) ?? 0,
    estacao: textoDe(l.estacao_parto) ?? '',
    idadePartoDias: inteiroOuNull(l.idade_parto_dias),
    encerrada: l.encerrada === true,
    duracaoDias: inteiroOuNull(l.duracao_dias),
    totalLeite: numeroDe(l.total_leite),
    mediaLeite: numeroDe(l.media_leite),
    metodo: textoDe(l.metodo_inferencia),
    sintetica: l.sintetica === true,
    paiId: inteiroOuNull(l.pai_id),
    maeId: inteiroOuNull(l.mae_id),
  };
}

export function paraAnimal(l: Linha): AnimalEntrada {
  return {
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    propriedadeId: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    numero: textoDe(l.numero_animal),
    nome: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    nascimento: textoDe(l.data_de_nascimento),
    paiId: inteiroOuNull(l.pai_id),
    maeId: inteiroOuNull(l.mae_id),
  };
}

export function paraFazenda(l: Linha): LinhaMelhoramentoFazenda {
  return {
    propriedade_id: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    nome: textoDe(l.nome),
    produtor_id: inteiroOuNull(l.produtor_id),
    teste: l.teste === true,
    animais: inteiroOuNull(l.animais) ?? 0,
    lactacoes: inteiroOuNull(l.lactacoes) ?? 0,
    lactacoes_encerradas: inteiroOuNull(l.lactacoes_encerradas) ?? 0,
    lactacoes_sinteticas: inteiroOuNull(l.lactacoes_sinteticas) ?? 0,
  };
}

export function paraAnimalCorte(l: Linha): AnimalCorteEntrada {
  return {
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    propriedadeId: inteiroOuNull(l.propriedade_id) ?? 0,
    sexo: textoDe(l.sexo),
    nascimento: textoDe(l.data_de_nascimento),
    paiId: inteiroOuNull(l.pai_id),
    maeId: inteiroOuNull(l.mae_id),
    numero: textoDe(l.numero),
    nome: textoDe(l.nome),
    apenasGenealogia: l.apenas_genealogia === true,
    pesoNascer: numeroDe(l.peso_ao_nascer) ?? numeroDe(l.peso_nascer_parto),
    origemPrenhez: textoDe(l.origem_prenhez),
    paisCandidatos: inteiroOuNull(l.pais_candidatos) ?? 0,
  };
}

export function paraPesagemCorte(l: Linha): PesagemCorteEntrada {
  return {
    pesagemId: inteiroOuNull(l.pesagem_id) ?? 0,
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    data: textoDe(l.data_pesagem) ?? '',
    pesoKg: numeroDe(l.peso_kg) ?? 0,
    idadeDias: inteiroOuNull(l.idade_dias) ?? -1,
    loteId: inteiroOuNull(l.lote_id),
  };
}

export function paraFazendaCorte(l: Linha): LinhaMelhoramentoBovinoFazenda {
  const n = (k: string) => inteiroOuNull(l[k]) ?? 0;
  return {
    propriedade_id: n('propriedade_id'),
    nome: textoDe(l.nome),
    produtor_id: inteiroOuNull(l.produtor_id),
    teste: l.teste === true,
    animais: n('animais'),
    com_nascimento: n('com_nascimento'),
    com_pai: n('com_pai'),
    com_mae: n('com_mae'),
    apenas_genealogia: n('apenas_genealogia'),
    pesagens: n('pesagens'),
    pesagens_sem_nascimento: n('pesagens_sem_nascimento'),
    pesagens_janela: n('pesagens_janela'),
    animais_janela: n('animais_janela'),
  };
}

const CONFIRMACOES: Confirmacao[] = ['nao_confirmado', 'confirmado', 'rejeitado'];

export function paraVinculo(l: Linha): VinculoEntrada {
  const c = textoDe(l.confirmacao) as Confirmacao | null;
  return {
    id: inteiroOuNull(l.id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    animalA: inteiroOuNull(l.animal_a) ?? 0,
    propriedadeA: inteiroOuNull(l.propriedade_a) ?? 0,
    animalB: inteiroOuNull(l.animal_b) ?? 0,
    propriedadeB: inteiroOuNull(l.propriedade_b) ?? 0,
    motivos: Array.isArray(l.motivos) ? l.motivos.filter((x): x is string => typeof x === 'string') : [],
    // Valor desconhecido NUNCA vira confirmado.
    confirmacao: c && CONFIRMACOES.includes(c) ? c : 'nao_confirmado',
    confirmadoPor: textoDe(l.confirmado_por),
    confirmadoEm: textoDe(l.confirmado_em),
    observacao: textoDe(l.observacao),
  };
}

export function paraRodada(l: Linha): LinhaMelhoramentoRodada {
  return {
    id: inteiroOuNull(l.id) ?? 0,
    criada_em: textoDe(l.criada_em) ?? '',
    especie: textoDe(l.especie) ?? '',
    propriedade_id: inteiroOuNull(l.propriedade_id),
    modelo: textoDe(l.modelo) ?? '',
    caracteristica: textoDe(l.caracteristica) ?? '',
    parametros: objetoDe(l.parametros),
    versao_motor: textoDe(l.versao_motor) ?? '',
    status: textoDe(l.status) ?? '',
    n_animais: inteiroOuNull(l.n_animais),
    n_registros: inteiroOuNull(l.n_registros),
    resumo: objetoDe(l.resumo),
    observacao: textoDe(l.observacao),
  };
}

export function paraValidacaoGravada(l: Linha): LinhaMelhoramentoValidacao {
  return {
    rodada_id: inteiroOuNull(l.rodada_id) ?? 0,
    metrica: textoDe(l.metrica) ?? '',
    valor: numeroDe(l.valor),
    n: inteiroOuNull(l.n),
    detalhe: objetoDe(l.detalhe),
  };
}

export function paraResultadoGravado(l: Linha): LinhaMelhoramentoResultado {
  return {
    rodada_id: inteiroOuNull(l.rodada_id) ?? 0,
    animal_id: inteiroOuNull(l.animal_id) ?? 0,
    propriedade_id: inteiroOuNull(l.propriedade_id),
    valor: numeroDe(l.valor),
    confiabilidade: numeroDe(l.confiabilidade),
    posicao: inteiroOuNull(l.posicao),
    extra: objetoDe(l.extra),
  };
}
