import 'server-only';

import { VIEWS_MOVIMENTACAO, type LinhaMovimentacao } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * MOVIMENTAÇÕES — a leitura de `adm.movimentacao_detalhe` e as regras da tela.
 *
 * A aba Estrutura conta baias, lotes e setores PARADOS. Aqui é o movimento entre
 * eles: para onde o rebanho vai, de onde sai, e quantas vezes o mesmo animal
 * muda de lugar.
 *
 * ⚠️ OS DOIS TIPOS NÃO SE SOMAM SEM RESSALVA. 'lote' é decisão de manejo (o
 * animal mudou de grupo); 'localizacao' é lugar físico (mudou de baia ou setor).
 * Uma fazenda pode ter muito de um e nada do outro, e o total sozinho não
 * distingue "manejo por lote bem feito" de "animal trocando de curral toda
 * semana".
 */

const SQL_MOVIMENTACOES = 'supabase/adm/adm_25_movimentacoes.sql';

const PROJECAO = {
  propriedade_id: true,
  movimentacao_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  status_animal: true,
  categoria: true,
  tipo: true,
  data_movimentacao: true,
  baia_origem: true,
  baia_destino: true,
  lote_origem: true,
  lote_destino: true,
  setor_destino: true,
  observacao: true,
} satisfies Record<keyof LinhaMovimentacao, true>;

const SELECT = Object.keys(PROJECAO).join(',');

export const TIPO_LOTE = 'lote';
export const TIPO_LOCALIZACAO = 'localizacao';

export const ROTULO_TIPO: Record<string, string> = {
  [TIPO_LOTE]: 'Troca de lote',
  [TIPO_LOCALIZACAO]: 'Troca de baia ou setor',
};

export function rotuloDoTipo(tipo: string | null): string {
  return ROTULO_TIPO[tipo ?? ''] ?? (tipo ?? 'Não informado');
}

/** `?tipo=` é texto de fora: só passa o que a view realmente tem. */
export function lerTipo(bruto: string | string[] | undefined): string | null {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  if (!valor) return null;
  return valor === TIPO_LOTE || valor === TIPO_LOCALIZACAO ? valor : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarMovimentacoes(
  propriedadeId: number,
  tipo: string | null,
): Promise<Resultado<LinhaMovimentacao[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_MOVIMENTACAO.detalhe;
  const res = await paginarView(view, SQL_MOVIMENTACOES, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = tipo === null ? base : base.eq('tipo', tipo);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: um lote inteiro se move no mesmo dia — o id desempata.
      .order('data_movimentacao', { ascending: false })
      .order('movimentacao_id', { ascending: false })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraMovimentacao));
}

function paraMovimentacao(l: Linha): LinhaMovimentacao {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    movimentacao_id: Math.round(numeroDe(l.movimentacao_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    status_animal: textoDe(l.status_animal),
    categoria: textoDe(l.categoria),
    tipo: textoDe(l.tipo),
    data_movimentacao: textoDe(l.data_movimentacao) ?? '',
    baia_origem: textoDe(l.baia_origem),
    baia_destino: textoDe(l.baia_destino),
    lote_origem: textoDe(l.lote_origem),
    lote_destino: textoDe(l.lote_destino),
    setor_destino: textoDe(l.setor_destino),
    observacao: textoDe(l.observacao),
  };
}

/** O destino da movimentação, seja ele lote, baia ou setor. */
export function destinoDe(mov: LinhaMovimentacao): string | null {
  return mov.lote_destino?.trim() || mov.baia_destino?.trim() || mov.setor_destino?.trim() || null;
}

/** A origem, quando existe. null na primeira movimentação do animal. */
export function origemDe(mov: LinhaMovimentacao): string | null {
  return mov.lote_origem?.trim() || mov.baia_origem?.trim() || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoMovimentacoes {
  movimentacoes: number;
  animais: number;
  porLote: number;
  porLocalizacao: number;
  /** Movimentações por animal — a rotatividade do rebanho. */
  mediaPorAnimal: number | null;
  /** O animal que mais mudou de lugar. */
  maisMovimentado: number;
  /** Sem origem: a primeira movimentação de cada animal. Não é dado faltando. */
  semOrigem: number;
  dias: number;
  primeira: string | null;
  ultima: string | null;
}

export function resumoMovimentacoes(movs: LinhaMovimentacao[]): ResumoMovimentacoes {
  const porAnimal = new Map<number, number>();
  for (const mov of movs) porAnimal.set(mov.animal_id, (porAnimal.get(mov.animal_id) ?? 0) + 1);

  const datas = movs.map((m) => m.data_movimentacao).filter((d) => d !== '').sort();
  const contagens = [...porAnimal.values()];

  return {
    movimentacoes: movs.length,
    animais: porAnimal.size,
    porLote: movs.filter((m) => m.tipo === TIPO_LOTE).length,
    porLocalizacao: movs.filter((m) => m.tipo === TIPO_LOCALIZACAO).length,
    mediaPorAnimal: porAnimal.size > 0 ? movs.length / porAnimal.size : null,
    maisMovimentado: contagens.length > 0 ? Math.max(...contagens) : 0,
    semOrigem: movs.filter((m) => origemDe(m) === null).length,
    dias: new Set(datas).size,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo
// ─────────────────────────────────────────────────────────────────────────────

export interface Fluxo {
  origem: string;
  destino: string;
  animais: number;
  movimentacoes: number;
}

export const FLUXO_LIMITE = 12;

/**
 * Os caminhos mais percorridos: de onde para onde o rebanho anda.
 *
 * Só entram movimentações COM origem — o primeiro movimento de cada animal não
 * tem de onde, e inventar "entrada" como origem transformaria nascimento em
 * fluxo entre lotes.
 */
export function fluxos(movs: LinhaMovimentacao[], limite: number = FLUXO_LIMITE): Fluxo[] {
  const grupos = new Map<string, { origem: string; destino: string; animais: Set<number>; movs: number }>();

  for (const mov of movs) {
    const origem = origemDe(mov);
    const destino = destinoDe(mov);
    if (origem === null || destino === null) continue;

    const chave = `${origem}→${destino}`;
    const grupo = grupos.get(chave) ?? { origem, destino, animais: new Set<number>(), movs: 0 };
    grupo.animais.add(mov.animal_id);
    grupo.movs += 1;
    grupos.set(chave, grupo);
  }

  return [...grupos.values()]
    .map((g) => ({
      origem: g.origem,
      destino: g.destino,
      animais: g.animais.size,
      movimentacoes: g.movs,
    }))
    .sort(
      (a, b) =>
        b.movimentacoes - a.movimentacoes ||
        a.origem.localeCompare(b.origem, 'pt-BR') ||
        a.destino.localeCompare(b.destino, 'pt-BR'),
    )
    .slice(0, limite);
}

export interface Destino {
  destino: string;
  movimentacoes: number;
  animais: number;
  fracao: number | null;
}

/**
 * Para onde o rebanho vai — inclusive as movimentações sem origem, que aqui
 * contam normalmente: a pergunta é o DESTINO, e ele existe sempre.
 */
export function destinosMaisComuns(movs: LinhaMovimentacao[], limite = 10): Destino[] {
  const comDestino = movs.filter((m) => destinoDe(m) !== null);
  const total = comDestino.length;

  const grupos = new Map<string, { movs: number; animais: Set<number> }>();
  for (const mov of comDestino) {
    const destino = destinoDe(mov) as string;
    const grupo = grupos.get(destino) ?? { movs: 0, animais: new Set<number>() };
    grupo.movs += 1;
    grupo.animais.add(mov.animal_id);
    grupos.set(destino, grupo);
  }

  return [...grupos.entries()]
    .map(([destino, g]) => ({
      destino,
      movimentacoes: g.movs,
      animais: g.animais.size,
      fracao: total > 0 ? g.movs / total : null,
    }))
    .sort((a, b) => b.movimentacoes - a.movimentacoes || a.destino.localeCompare(b.destino, 'pt-BR'))
    .slice(0, limite);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rotatividade
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimalMovimentado {
  animal_id: number;
  numero: string;
  nome: string | null;
  categoria: string | null;
  movimentacoes: number;
  ultimoDestino: string | null;
  ultimaData: string | null;
}

export const LISTA_LIMITE = 10;

/**
 * Os animais que mais mudaram de lugar.
 *
 * Não é curiosidade: um animal com dezenas de movimentações ou é o que a fazenda
 * usa para completar lote (e vive sem grupo estável), ou é lançamento repetido.
 * Nos dois casos a lista é o começo da investigação.
 */
export function maisMovimentados(
  movs: LinhaMovimentacao[],
  limite: number = LISTA_LIMITE,
): AnimalMovimentado[] {
  const grupos = new Map<number, LinhaMovimentacao[]>();
  for (const mov of movs) {
    const lista = grupos.get(mov.animal_id);
    if (lista) lista.push(mov);
    else grupos.set(mov.animal_id, [mov]);
  }

  return [...grupos.entries()]
    .map(([animal_id, doAnimal]) => {
      // A mais recente do animal — a lista de entrada pode vir em qualquer ordem,
      // e a função é pura: não confia na ordenação de quem chamou.
      const ultima = doAnimal.reduce((maior, m) =>
        m.data_movimentacao > maior.data_movimentacao ? m : maior,
      );
      return {
        animal_id,
        numero: doAnimal[0].numero_animal,
        nome: doAnimal[0].nome_animal,
        categoria: doAnimal[0].categoria,
        movimentacoes: doAnimal.length,
        ultimoDestino: destinoDe(ultima),
        ultimaData: ultima.data_movimentacao || null,
      };
    })
    .sort((a, b) => b.movimentacoes - a.movimentacoes || a.numero.localeCompare(b.numero, 'pt-BR'))
    .slice(0, limite);
}

/** Movimentações por mês — o ritmo do manejo de lote. */
export function serieMovimentacoes(movs: LinhaMovimentacao[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const mov of movs) {
    if (mov.data_movimentacao === '') continue;
    const mes = mov.data_movimentacao.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
