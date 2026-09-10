import 'server-only';

import { VIEWS_PESAGEM, type LinhaPesagem } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * PESAGEM — a leitura de `adm.pesagem_detalhe` e as regras da tela.
 *
 * A aba Crescimento já tem a nuvem peso × idade e os 20 piores GMD. Esta tela
 * responde outras três coisas:
 *
 *   · QUANDO a fazenda pesa (as sessões de curral) e QUANTO do rebanho passou
 *     pela balança — cobertura, que nenhum card mostra;
 *   · como o GMD se DISTRIBUI, e não só quem são os 20 piores;
 *   · o ganho por CATEGORIA, que é onde a conversa de nutrição acontece.
 *
 * ⚠️ O "GMD ENTRE PESAGENS" DAQUI NÃO É O "GMD MÉDIO" DA ABA CRESCIMENTO, e o
 * nome é diferente de propósito. Lá: janela de 12 meses, sem filtro de
 * intervalo. Aqui: todo o histórico, e só intervalos de 15 a 365 dias — porque
 * duas pesagens com três dias de diferença transformam 1 kg de erro de balança
 * em 0,33 kg/dia de "ganho". Dois recortes diferentes com o mesmo nome seriam
 * dois números discordando na cara do operador.
 */

const SQL_PESAGEM = 'supabase/adm/adm_20_pesagem.sql';

const PROJECAO = {
  propriedade_id: true,
  pesagem_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  status_animal: true,
  categoria: true,
  data_pesagem: true,
  peso_kg: true,
  idade_dias: true,
  peso_anterior: true,
  dias_desde_anterior: true,
  gmd: true,
  peso_ideal: true,
  progresso: true,
} satisfies Record<keyof LinhaPesagem, true>;

const SELECT = Object.keys(PROJECAO).join(',');

/** Acima disso não é caprino nem ovino: a base tem uma linha com 408 kg — o
 *  mesmo 408 que aparece em peso ao nascer, provável dígito a mais. */
export const PESO_MAXIMO_KG = 150;
/** Abaixo disso é erro de digitação ou balança zerada. */
export const PESO_MINIMO_KG = 1;

export function pesoUtilizavel(pesagem: LinhaPesagem): boolean {
  const peso = pesagem.peso_kg;
  return peso !== null && peso >= PESO_MINIMO_KG && peso <= PESO_MAXIMO_KG;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarPesagens(propriedadeId: number): Promise<Resultado<LinhaPesagem[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_PESAGEM.detalhe;
  const res = await paginarView(view, SQL_PESAGEM, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: a sessão de curral pesa dezenas no mesmo dia — o id desempata.
      .order('data_pesagem', { ascending: false })
      .order('pesagem_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraPesagem));
}

function paraPesagem(l: Linha): LinhaPesagem {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    pesagem_id: Math.round(numeroDe(l.pesagem_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    status_animal: textoDe(l.status_animal),
    categoria: textoDe(l.categoria),
    data_pesagem: textoDe(l.data_pesagem) ?? '',
    peso_kg: numeroDe(l.peso_kg),
    idade_dias: numeroDe(l.idade_dias),
    peso_anterior: numeroDe(l.peso_anterior),
    dias_desde_anterior: numeroDe(l.dias_desde_anterior),
    gmd: numeroDe(l.gmd),
    peso_ideal: numeroDe(l.peso_ideal),
    progresso: numeroDe(l.progresso),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessões de pesagem
// ─────────────────────────────────────────────────────────────────────────────

export interface SessaoPesagem {
  data: string;
  animais: number;
  pesoMedio: number | null;
  /** Quantos daquela sessão tinham GMD calculável (ou seja, já tinham sido pesados antes). */
  comGmd: number;
  gmdMedio: number | null;
}

/**
 * Os dias em que a fazenda passou o rebanho na balança.
 *
 * Diferente do controle leiteiro, aqui NÃO se costura dia consecutivo: pesagem
 * de curral não tem "lançamento atrasado do dia seguinte" com a frequência que
 * o controle tem, e juntar dois dias vizinhos esconderia uma fazenda que pesa em
 * dois turnos por lote.
 */
export function sessoesDePesagem(pesagens: LinhaPesagem[]): SessaoPesagem[] {
  const porDia = new Map<string, LinhaPesagem[]>();
  for (const pesagem of pesagens) {
    if (pesagem.data_pesagem === '') continue;
    const lista = porDia.get(pesagem.data_pesagem);
    if (lista) lista.push(pesagem);
    else porDia.set(pesagem.data_pesagem, [pesagem]);
  }

  return [...porDia.entries()]
    .map(([data, doDia]) => {
      const comPeso = doDia.filter(pesoUtilizavel);
      const comGmd = doDia.filter((p) => p.gmd !== null);
      return {
        data,
        animais: new Set(doDia.map((p) => p.animal_id)).size,
        pesoMedio:
          comPeso.length > 0
            ? comPeso.reduce((acc, p) => acc + (p.peso_kg ?? 0), 0) / comPeso.length
            : null,
        comGmd: comGmd.length,
        gmdMedio:
          comGmd.length > 0
            ? comGmd.reduce((acc, p) => acc + (p.gmd ?? 0), 0) / comGmd.length
            : null,
      };
    })
    .sort((a, b) => b.data.localeCompare(a.data));
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoPesagens {
  pesagens: number;
  animais: number;
  sessoes: number;
  /** Animais com duas ou mais pesagens — os únicos que têm ganho medido. */
  comDuasOuMais: number;
  pesoMedio: number | null;
  comPeso: number;
  pesoImplausivel: number;
  gmdMedio: number | null;
  /** Denominador do GMD: quantos intervalos entraram na média. */
  intervalos: number;
  /** Intervalos com ganho negativo — animal perdendo peso. */
  intervalosNegativos: number;
  ultima: string | null;
  primeira: string | null;
}

export function resumoPesagens(pesagens: LinhaPesagem[]): ResumoPesagens {
  const comPeso = pesagens.filter(pesoUtilizavel);
  const comGmd = pesagens.filter((p) => p.gmd !== null);

  const porAnimal = new Map<number, number>();
  for (const pesagem of pesagens) porAnimal.set(pesagem.animal_id, (porAnimal.get(pesagem.animal_id) ?? 0) + 1);

  const datas = pesagens.map((p) => p.data_pesagem).filter((d) => d !== '').sort();

  return {
    pesagens: pesagens.length,
    animais: porAnimal.size,
    sessoes: new Set(datas).size,
    comDuasOuMais: [...porAnimal.values()].filter((n) => n >= 2).length,
    pesoMedio:
      comPeso.length > 0
        ? comPeso.reduce((acc, p) => acc + (p.peso_kg ?? 0), 0) / comPeso.length
        : null,
    comPeso: comPeso.length,
    pesoImplausivel: pesagens.filter((p) => p.peso_kg !== null && !pesoUtilizavel(p)).length,
    gmdMedio:
      comGmd.length > 0 ? comGmd.reduce((acc, p) => acc + (p.gmd ?? 0), 0) / comGmd.length : null,
    intervalos: comGmd.length,
    intervalosNegativos: comGmd.filter((p) => (p.gmd ?? 0) < 0).length,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribuição do GMD
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaGmd {
  rotulo: string;
  intervalos: number;
  fracao: number | null;
  /** Ganho negativo ou nulo: o animal não cresceu entre as duas pesagens. */
  alerta: boolean;
}

const FAIXAS_GMD: { rotulo: string; de: number; ate: number | null; alerta: boolean }[] = [
  { rotulo: 'perdeu peso', de: -Infinity, ate: 0, alerta: true },
  { rotulo: 'até 50 g/dia', de: 0, ate: 0.05, alerta: true },
  { rotulo: '51 a 100 g', de: 0.05, ate: 0.1, alerta: false },
  { rotulo: '101 a 150 g', de: 0.1, ate: 0.15, alerta: false },
  { rotulo: '151 a 200 g', de: 0.15, ate: 0.2, alerta: false },
  { rotulo: 'acima de 200 g', de: 0.2, ate: null, alerta: false },
];

/**
 * A distribuição do ganho, na ordem da escala.
 *
 * As duas primeiras faixas são de alerta e ficam juntas no começo: animal que
 * perdeu peso ou ganhou menos de 50 g/dia entre duas pesagens não está
 * crescendo — em recria isso é nutrição, verminose ou lote errado, e é a
 * pergunta que o consultor leva para a visita.
 */
export function distribuicaoGmd(pesagens: LinhaPesagem[]): FaixaGmd[] {
  const comGmd = pesagens.filter((p) => p.gmd !== null);
  const total = comGmd.length;

  return FAIXAS_GMD.map((faixa) => {
    const quantos = comGmd.filter((p) => {
      const gmd = p.gmd ?? 0;
      if (faixa.ate === null) return gmd > faixa.de;
      if (faixa.de === -Infinity) return gmd <= faixa.ate;
      return gmd > faixa.de && gmd <= faixa.ate;
    }).length;
    return {
      rotulo: faixa.rotulo,
      intervalos: quantos,
      fracao: total > 0 ? quantos / total : null,
      alerta: faixa.alerta,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Por categoria
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoriaPeso {
  categoria: string;
  animais: number;
  pesoMedio: number | null;
  gmdMedio: number | null;
  intervalos: number;
}

const SEM_CATEGORIA = 'Sem categoria';

/**
 * Peso e ganho por categoria — o recorte em que a conversa de nutrição acontece.
 *
 * Usa a ÚLTIMA pesagem de cada animal para o peso (peso atual do lote) e TODOS
 * os intervalos para o ganho (o histórico é que dá amostra). Misturar as duas
 * coisas numa média só faria o peso do lote depender de quantas vezes cada
 * animal foi pesado.
 */
export function porCategoria(pesagens: LinhaPesagem[]): CategoriaPeso[] {
  // A última pesagem de cada animal: a lista já vem ordenada por data desc, mas
  // não se pode confiar nisso aqui — a função é pura e recebe o que der.
  const ultimaPorAnimal = new Map<number, LinhaPesagem>();
  for (const pesagem of pesagens) {
    const atual = ultimaPorAnimal.get(pesagem.animal_id);
    if (!atual || pesagem.data_pesagem > atual.data_pesagem) {
      ultimaPorAnimal.set(pesagem.animal_id, pesagem);
    }
  }

  const grupos = new Map<string, { ultimas: LinhaPesagem[]; comGmd: LinhaPesagem[] }>();
  const chaveDe = (p: LinhaPesagem) => p.categoria?.trim() || SEM_CATEGORIA;

  for (const ultima of ultimaPorAnimal.values()) {
    const chave = chaveDe(ultima);
    const grupo = grupos.get(chave) ?? { ultimas: [], comGmd: [] };
    grupo.ultimas.push(ultima);
    grupos.set(chave, grupo);
  }
  for (const pesagem of pesagens) {
    if (pesagem.gmd === null) continue;
    const chave = chaveDe(pesagem);
    const grupo = grupos.get(chave) ?? { ultimas: [], comGmd: [] };
    grupo.comGmd.push(pesagem);
    grupos.set(chave, grupo);
  }

  return [...grupos.entries()]
    .map(([categoria, grupo]) => {
      const comPeso = grupo.ultimas.filter(pesoUtilizavel);
      return {
        categoria,
        animais: grupo.ultimas.length,
        pesoMedio:
          comPeso.length > 0
            ? comPeso.reduce((acc, p) => acc + (p.peso_kg ?? 0), 0) / comPeso.length
            : null,
        gmdMedio:
          grupo.comGmd.length > 0
            ? grupo.comGmd.reduce((acc, p) => acc + (p.gmd ?? 0), 0) / grupo.comGmd.length
            : null,
        intervalos: grupo.comGmd.length,
      };
    })
    .sort((a, b) => {
      if (a.categoria === SEM_CATEGORIA) return b.categoria === SEM_CATEGORIA ? 0 : 1;
      if (b.categoria === SEM_CATEGORIA) return -1;
      return b.animais - a.animais || a.categoria.localeCompare(b.categoria, 'pt-BR');
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Rankings e série
// ─────────────────────────────────────────────────────────────────────────────

export const RANKING_LIMITE = 15;

/** Ordem TOTAL: GMD e, no empate, o número do animal. */
function porGmd(a: LinhaPesagem, b: LinhaPesagem, desc: boolean): number {
  const diferenca = desc ? (b.gmd ?? 0) - (a.gmd ?? 0) : (a.gmd ?? 0) - (b.gmd ?? 0);
  return diferenca !== 0 ? diferenca : a.numero_animal.localeCompare(b.numero_animal, 'pt-BR');
}

export function melhoresGanhos(pesagens: LinhaPesagem[], limite = RANKING_LIMITE): LinhaPesagem[] {
  return pesagens.filter((p) => p.gmd !== null).sort((a, b) => porGmd(a, b, true)).slice(0, limite);
}

export function pioresGanhos(pesagens: LinhaPesagem[], limite = RANKING_LIMITE): LinhaPesagem[] {
  return pesagens.filter((p) => p.gmd !== null).sort((a, b) => porGmd(a, b, false)).slice(0, limite);
}

/** Pesagens por mês — mostra se a balança é rotina ou evento raro. */
export function seriePesagens(pesagens: LinhaPesagem[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const pesagem of pesagens) {
    if (pesagem.data_pesagem === '') continue;
    const mes = pesagem.data_pesagem.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
