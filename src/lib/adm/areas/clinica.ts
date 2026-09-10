import 'server-only';

import { VIEWS_CLINICA, type LinhaCaso } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * CLÍNICA — a leitura de `adm.clinica_detalhe` e as regras da tela.
 *
 * A ENTREGA QUE JUSTIFICA A TELA é a LETALIDADE POR SUSPEITA: de cada dez
 * animais que tiveram um caso de X, quantos morreram logo depois. Nenhuma outra
 * tela cruza doença com morte — a Sanidade conta casos de um lado e óbitos do
 * outro, e a pergunta que decide protocolo está no meio.
 *
 * ⚠️ E É UMA AFIRMAÇÃO SOBRE SEQUÊNCIA, NÃO SOBRE CAUSA. O módulo só conta como
 * desfecho a morte que vem dentro de `JANELA_DESFECHO` dias do caso, e a tela
 * escreve "morreu em até 60 dias do caso" — nunca "morreu disso". Um animal que
 * teve diarreia em 2021 e morreu em 2026 não é letalidade de diarreia; sem a
 * janela, seria contado como se fosse.
 */

const SQL_CLINICA = 'supabase/adm/adm_24_clinica.sql';

const PROJECAO = {
  propriedade_id: true,
  caso_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  categoria: true,
  data_do_caso: true,
  suspeita: true,
  suspeita_tipo: true,
  sinais: true,
  tratamento: true,
  data_obito: true,
  dias_ate_obito: true,
} satisfies Record<keyof LinhaCaso, true>;

const SELECT = Object.keys(PROJECAO).join(',');

/**
 * Dias entre o caso e a morte dentro dos quais um desfecho ainda se relaciona ao
 * outro. Sessenta é generoso de propósito — doença que mata em caprino mata em
 * dias ou semanas —, e o número vai impresso na tela para o leitor julgar.
 */
export const JANELA_DESFECHO = 60;

export const SEM_SUSPEITA = 'Sem suspeita registrada';

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarCasos(propriedadeId: number): Promise<Resultado<LinhaCaso[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_CLINICA.detalhe;
  const res = await paginarView(view, SQL_CLINICA, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      .order('data_do_caso', { ascending: false })
      .order('caso_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraCaso));
}

function paraCaso(l: Linha): LinhaCaso {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    caso_id: Math.round(numeroDe(l.caso_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    categoria: textoDe(l.categoria),
    data_do_caso: textoDe(l.data_do_caso) ?? '',
    suspeita: textoDe(l.suspeita),
    suspeita_tipo: textoDe(l.suspeita_tipo),
    sinais: textoDe(l.sinais),
    tratamento: textoDe(l.tratamento),
    data_obito: textoDe(l.data_obito),
    dias_ate_obito: numeroDe(l.dias_ate_obito),
  };
}

/** Morreu dentro da janela em que a morte ainda se relaciona ao caso. */
export function morreuAposCaso(caso: LinhaCaso): boolean {
  const dias = caso.dias_ate_obito;
  return dias !== null && dias >= 0 && dias <= JANELA_DESFECHO;
}

// ─────────────────────────────────────────────────────────────────────────────
// Letalidade por suspeita — a entrega central
// ─────────────────────────────────────────────────────────────────────────────

export interface SuspeitaClinica {
  suspeita: string;
  /** 'sistema' | 'propriedade' | null — vocabulário do app ou daquele criador. */
  tipo: string | null;
  casos: number;
  animais: number;
  /** Casos seguidos de morte dentro da janela. */
  mortes: number;
  /** mortes ÷ casos. Sempre com o denominador ao lado na tela. */
  letalidade: number;
}

/** Abaixo disto o percentual é anedota com cara de estatística — a tela mostra
 *  o número absoluto e esconde a barra. */
export const MINIMO_PARA_LETALIDADE = 5;

/**
 * O ranking de suspeitas, com quantas mataram.
 *
 * Ordena por CASOS, e não por letalidade, de propósito: uma suspeita com dois
 * casos e duas mortes tem 100% de letalidade e não é o problema da fazenda. A
 * letalidade vai na linha, para ser lida junto do volume — e abaixo de
 * `MINIMO_PARA_LETALIDADE` casos a tela não desenha a barra.
 */
export function porSuspeita(casos: LinhaCaso[]): SuspeitaClinica[] {
  const grupos = new Map<string, LinhaCaso[]>();
  for (const caso of casos) {
    const chave = caso.suspeita?.trim() || SEM_SUSPEITA;
    const lista = grupos.get(chave);
    if (lista) lista.push(caso);
    else grupos.set(chave, [caso]);
  }

  return [...grupos.entries()]
    .map(([suspeita, doGrupo]) => {
      const mortes = doGrupo.filter(morreuAposCaso).length;
      return {
        suspeita,
        tipo: doGrupo[0].suspeita_tipo,
        casos: doGrupo.length,
        animais: new Set(doGrupo.map((c) => c.animal_id)).size,
        mortes,
        letalidade: doGrupo.length > 0 ? mortes / doGrupo.length : 0,
      };
    })
    .sort((a, b) => b.casos - a.casos || a.suspeita.localeCompare(b.suspeita, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoClinica {
  casos: number;
  animais: number;
  /** Animais com mais de um caso — reincidência. */
  reincidentes: number;
  mortes: number;
  letalidade: number | null;
  /** Casos com sinais clínicos descritos. */
  comSinais: number;
  /** Casos com tratamento registrado — 6% na base inteira. */
  comTratamento: number;
  suspeitasDistintas: number;
  primeiro: string | null;
  ultimo: string | null;
}

export function resumoClinica(casos: LinhaCaso[]): ResumoClinica {
  const porAnimal = new Map<number, number>();
  for (const caso of casos) porAnimal.set(caso.animal_id, (porAnimal.get(caso.animal_id) ?? 0) + 1);

  const datas = casos.map((c) => c.data_do_caso).filter((d) => d !== '').sort();
  const mortes = casos.filter(morreuAposCaso).length;

  return {
    casos: casos.length,
    animais: porAnimal.size,
    reincidentes: [...porAnimal.values()].filter((n) => n > 1).length,
    mortes,
    letalidade: casos.length > 0 ? mortes / casos.length : null,
    comSinais: casos.filter((c) => (c.sinais ?? '').trim() !== '').length,
    comTratamento: casos.filter((c) => (c.tratamento ?? '').trim() !== '').length,
    suspeitasDistintas: new Set(casos.map((c) => c.suspeita?.trim() || SEM_SUSPEITA)).size,
    primeiro: datas[0] ?? null,
    ultimo: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reincidência e série
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimalReincidente {
  animal_id: number;
  numero: string;
  nome: string | null;
  casos: number;
  suspeitas: string[];
  morreu: boolean;
}

export const LISTA_LIMITE = 10;

/**
 * Os animais que adoeceram mais de uma vez.
 *
 * É lista de ação e de decisão: animal que volta à enfermaria três vezes custa
 * tratamento, custa leite e costuma ser candidato a descarte — e essa conversa
 * não acontece se ninguém somar os casos por animal.
 */
export function reincidentes(casos: LinhaCaso[], limite: number = LISTA_LIMITE): AnimalReincidente[] {
  const grupos = new Map<number, LinhaCaso[]>();
  for (const caso of casos) {
    const lista = grupos.get(caso.animal_id);
    if (lista) lista.push(caso);
    else grupos.set(caso.animal_id, [caso]);
  }

  return [...grupos.entries()]
    .filter(([, doAnimal]) => doAnimal.length > 1)
    .map(([animal_id, doAnimal]) => ({
      animal_id,
      numero: doAnimal[0].numero_animal,
      nome: doAnimal[0].nome_animal,
      casos: doAnimal.length,
      // Set: a mesma suspeita repetida vira uma entrada — o que interessa é a
      // variedade do que aconteceu com aquele animal.
      suspeitas: [...new Set(doAnimal.map((c) => c.suspeita?.trim() || SEM_SUSPEITA))],
      morreu: doAnimal.some((c) => c.data_obito !== null),
    }))
    .sort((a, b) => b.casos - a.casos || a.numero.localeCompare(b.numero, 'pt-BR'))
    .slice(0, limite);
}

/** Casos por mês — a curva de morbidade, que costuma ter estação. */
export function serieCasos(casos: LinhaCaso[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const caso of casos) {
    if (caso.data_do_caso === '') continue;
    const mes = caso.data_do_caso.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
