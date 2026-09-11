import 'server-only';

import { VIEWS_PANORAMA, type LinhaPanorama } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type Resultado } from '@/lib/adm/types';

/**
 * PANORAMA — onde estão os clientes e quanto pesam.
 *
 * A carteira responde "quanto isto vale e para quem eu ligo". Este módulo
 * responde a pergunta que vem antes de qualquer plano comercial: EM QUE
 * ESTADOS E CIDADES a base está, quantos animais e quanto MRR cada lugar
 * carrega, e QUANTO DA BASE ESTÁ EM POUCAS MÃOS — porque uma base em que cinco
 * fazendas têm 70% dos animais é outro negócio, com outro risco, que uma base
 * espalhada.
 *
 * ⚠️ AS FAZENDAS DE TESTE FICAM FORA POR PADRÃO. A 214 ("Seabra", do tester)
 * tem 1.397 animais — 21% da base inteira — e não é cliente. Somá-la faria o
 * estado do Rio parecer o maior mercado da empresa. A tela diz quantas
 * excluiu e deixa incluir com um clique.
 *
 * Toda derivação é função pura sobre as linhas da view.
 */

const SQL_PANORAMA = 'supabase/adm/adm_30_panorama.sql';

const PROJECAO = {
  id: true,
  nome: true,
  cidade: true,
  segmentos: true,
  segmento_principal: true,
  produtor_id: true,
  produtor_nome: true,
  uf: true,
  uf_origem: true,
  latitude: true,
  longitude: true,
  animais_ativos: true,
  femeas: true,
  lactantes: true,
  producao_30d: true,
  lancamentos_30d: true,
  dias_sem_lancar: true,
  acesso_ativo: true,
  plano_nome: true,
  status_efetivo: true,
  mrr_mensal: true,
  mrr_atribuido: true,
  teste: true,
} satisfies Record<keyof LinhaPanorama, true>;

const SELECT = Object.keys(PROJECAO).join(',');

export const SEM_LOCALIZACAO = 'Sem localização';
/** Mesmo limiar da carteira: 30 dias sem lançar é fazenda silenciosa. */
export const SILENCIO_DIAS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarPanorama(): Promise<Resultado<LinhaPanorama[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_PANORAMA.propriedades;
  const res = await paginarView(view, SQL_PANORAMA, (de, ate) =>
    (supa.from(view).select(SELECT) as unknown as Consulta).order('id', { ascending: true }).range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraLinha));
}

function listaDe(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)).filter((x) => x !== '') : [];
}

function paraLinha(l: Linha): LinhaPanorama {
  return {
    id: Math.round(numeroDe(l.id) ?? 0),
    nome: textoDe(l.nome) ?? '—',
    cidade: textoDe(l.cidade),
    segmentos: listaDe(l.segmentos),
    segmento_principal: textoDe(l.segmento_principal),
    produtor_id: numeroDe(l.produtor_id),
    produtor_nome: textoDe(l.produtor_nome),
    uf: textoDe(l.uf),
    uf_origem: textoDe(l.uf_origem),
    latitude: numeroDe(l.latitude),
    longitude: numeroDe(l.longitude),
    animais_ativos: Math.round(numeroDe(l.animais_ativos) ?? 0),
    femeas: Math.round(numeroDe(l.femeas) ?? 0),
    lactantes: Math.round(numeroDe(l.lactantes) ?? 0),
    producao_30d: numeroDe(l.producao_30d),
    lancamentos_30d: Math.round(numeroDe(l.lancamentos_30d) ?? 0),
    dias_sem_lancar: numeroDe(l.dias_sem_lancar),
    acesso_ativo: l.acesso_ativo === true,
    plano_nome: textoDe(l.plano_nome),
    status_efetivo: textoDe(l.status_efetivo),
    mrr_mensal: numeroDe(l.mrr_mensal) ?? 0,
    mrr_atribuido: l.mrr_atribuido === true,
    teste: l.teste === true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Teste fora, resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface Separacao {
  reais: LinhaPanorama[];
  teste: LinhaPanorama[];
}

export function separarTeste(linhas: LinhaPanorama[]): Separacao {
  return {
    reais: linhas.filter((l) => !l.teste),
    teste: linhas.filter((l) => l.teste),
  };
}

export interface ResumoPanorama {
  propriedades: number;
  comLocalizacao: number;
  /** Das localizadas, quantas precisaram do CEP ou do dono para achar a UF. */
  localizadasPorInferencia: number;
  ufs: number;
  cidades: number;
  animais: number;
  femeas: number;
  lactantes: number;
  producao30d: number;
  comAcesso: number;
  mrr: number;
  silenciosas: number;
}

export function resumoPanorama(linhas: LinhaPanorama[]): ResumoPanorama {
  const localizadas = linhas.filter((l) => l.uf !== null);
  return {
    propriedades: linhas.length,
    comLocalizacao: localizadas.length,
    localizadasPorInferencia: localizadas.filter((l) => l.uf_origem !== 'cadastro').length,
    ufs: new Set(localizadas.map((l) => l.uf)).size,
    cidades: new Set(linhas.filter((l) => l.cidade).map((l) => `${l.cidade}|${l.uf ?? ''}`)).size,
    animais: linhas.reduce((acc, l) => acc + l.animais_ativos, 0),
    femeas: linhas.reduce((acc, l) => acc + l.femeas, 0),
    lactantes: linhas.reduce((acc, l) => acc + l.lactantes, 0),
    producao30d: linhas.reduce((acc, l) => acc + (l.producao_30d ?? 0), 0),
    comAcesso: linhas.filter((l) => l.acesso_ativo).length,
    mrr: linhas.reduce((acc, l) => acc + l.mrr_mensal, 0),
    silenciosas: linhas.filter((l) => l.dias_sem_lancar !== null && l.dias_sem_lancar > SILENCIO_DIAS).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Por estado e por cidade
// ─────────────────────────────────────────────────────────────────────────────

export interface LugarPanorama {
  /** UF, ou SEM_LOCALIZACAO. */
  rotulo: string;
  propriedades: number;
  comAcesso: number;
  animais: number;
  lactantes: number;
  producao30d: number;
  mrr: number;
  silenciosas: number;
  /** Fração dos animais da base. */
  fracaoAnimais: number | null;
  fracaoMrr: number | null;
}

/**
 * A base por UF, do estado com mais animais para o com menos. "Sem
 * localização" vai por último — não é um lugar, é cadastro por corrigir.
 */
export function porUf(linhas: LinhaPanorama[]): LugarPanorama[] {
  return agrupar(linhas, (l) => l.uf ?? SEM_LOCALIZACAO, SEM_LOCALIZACAO);
}

export interface CidadePanorama extends LugarPanorama {
  uf: string | null;
}

/** As cidades com mais animais. Cidade sem nome não entra — não há o que mostrar. */
export function porCidade(linhas: LinhaPanorama[], limite = 10): CidadePanorama[] {
  const comCidade = linhas.filter((l) => l.cidade);
  const grupos = agrupar(comCidade, (l) => `${l.cidade}${l.uf ? ` · ${l.uf}` : ''}`, '');
  const ufPorRotulo = new Map(comCidade.map((l) => [`${l.cidade}${l.uf ? ` · ${l.uf}` : ''}`, l.uf]));
  // As frações são sobre a base INTEIRA, não só sobre quem tem cidade.
  const totalAnimais = linhas.reduce((acc, l) => acc + l.animais_ativos, 0);
  const totalMrr = linhas.reduce((acc, l) => acc + l.mrr_mensal, 0);
  return grupos.slice(0, limite).map((g) => ({
    ...g,
    uf: ufPorRotulo.get(g.rotulo) ?? null,
    fracaoAnimais: totalAnimais > 0 ? g.animais / totalAnimais : null,
    fracaoMrr: totalMrr > 0 ? g.mrr / totalMrr : null,
  }));
}

function agrupar(
  linhas: LinhaPanorama[],
  chave: (l: LinhaPanorama) => string,
  ultimo: string,
): LugarPanorama[] {
  const grupos = new Map<string, LinhaPanorama[]>();
  for (const l of linhas) {
    const k = chave(l);
    const lista = grupos.get(k);
    if (lista) lista.push(l);
    else grupos.set(k, [l]);
  }
  const totalAnimais = linhas.reduce((acc, l) => acc + l.animais_ativos, 0);
  const totalMrr = linhas.reduce((acc, l) => acc + l.mrr_mensal, 0);

  return [...grupos.entries()]
    .map(([rotulo, doGrupo]) => {
      const animais = doGrupo.reduce((acc, l) => acc + l.animais_ativos, 0);
      const mrr = doGrupo.reduce((acc, l) => acc + l.mrr_mensal, 0);
      return {
        rotulo,
        propriedades: doGrupo.length,
        comAcesso: doGrupo.filter((l) => l.acesso_ativo).length,
        animais,
        lactantes: doGrupo.reduce((acc, l) => acc + l.lactantes, 0),
        producao30d: doGrupo.reduce((acc, l) => acc + (l.producao_30d ?? 0), 0),
        mrr,
        silenciosas: doGrupo.filter((l) => l.dias_sem_lancar !== null && l.dias_sem_lancar > SILENCIO_DIAS)
          .length,
        fracaoAnimais: totalAnimais > 0 ? animais / totalAnimais : null,
        fracaoMrr: totalMrr > 0 ? mrr / totalMrr : null,
      };
    })
    .sort((a, b) => {
      if (a.rotulo === ultimo) return b.rotulo === ultimo ? 0 : 1;
      if (b.rotulo === ultimo) return -1;
      return b.animais - a.animais || b.propriedades - a.propriedades || a.rotulo.localeCompare(b.rotulo, 'pt-BR');
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Concentração — quanto da base está em poucas mãos
// ─────────────────────────────────────────────────────────────────────────────

export interface FatiaConcentracao {
  id: number;
  nome: string;
  uf: string | null;
  valor: number;
  fracao: number;
  /** Fração acumulada até esta linha, inclusive. */
  acumulada: number;
}

export interface Concentracao {
  total: number;
  /** Fração do total nas 1, 3 e 5 maiores. null quando o total é zero. */
  top1: number | null;
  top3: number | null;
  top5: number | null;
  /** Quantas propriedades bastam para chegar a 80% do total. null sem total. */
  paraOitentaPorCento: number | null;
  maiores: FatiaConcentracao[];
}

/**
 * A curva de concentração de uma medida (animais, MRR, produção): as maiores
 * propriedades e a fração acumulada. "Cinco fazendas têm 70% dos animais" é a
 * frase que muda uma decisão comercial — e é a que esta função produz.
 */
export function concentracao(
  linhas: LinhaPanorama[],
  valorDe: (l: LinhaPanorama) => number,
  limite = 10,
): Concentracao {
  const total = linhas.reduce((acc, l) => acc + Math.max(0, valorDe(l)), 0);
  const ordenadas = [...linhas]
    .map((l) => ({ l, valor: Math.max(0, valorDe(l)) }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.l.nome.localeCompare(b.l.nome, 'pt-BR'));

  let acumulado = 0;
  let paraOitenta: number | null = null;
  const fatias: FatiaConcentracao[] = ordenadas.map(({ l, valor }, i) => {
    acumulado += valor;
    const acumulada = total > 0 ? acumulado / total : 0;
    if (paraOitenta === null && acumulada >= 0.8) paraOitenta = i + 1;
    return { id: l.id, nome: l.nome, uf: l.uf, valor, fracao: total > 0 ? valor / total : 0, acumulada };
  });

  // Soma os VALORES e divide uma vez: somar frações acumula erro de ponto
  // flutuante (0,5 + 0,3 + 0,15 dá 0,9500000000000001).
  const ate = (n: number) =>
    total > 0 ? fatias.slice(0, n).reduce((acc, f) => acc + f.valor, 0) / total : null;

  return {
    total,
    top1: ate(1),
    top3: ate(3),
    top5: ate(5),
    paraOitentaPorCento: total > 0 ? paraOitenta : null,
    maiores: fatias.slice(0, limite),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tamanho e segmento
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaTamanho {
  rotulo: string;
  propriedades: number;
  animais: number;
  fracaoPropriedades: number | null;
}

/** Faixas de tamanho de rebanho, na ordem da escala — todas saem, mesmo vazias. */
export const FAIXAS_TAMANHO: { rotulo: string; de: number; ate: number | null }[] = [
  { rotulo: 'Sem animal', de: 0, ate: 0 },
  { rotulo: '1 – 50', de: 1, ate: 50 },
  { rotulo: '51 – 150', de: 51, ate: 150 },
  { rotulo: '151 – 300', de: 151, ate: 300 },
  { rotulo: '301 – 600', de: 301, ate: 600 },
  { rotulo: 'Acima de 600', de: 601, ate: null },
];

export function faixasDeTamanho(linhas: LinhaPanorama[]): FaixaTamanho[] {
  return FAIXAS_TAMANHO.map((faixa) => {
    const dentro = linhas.filter(
      (l) => l.animais_ativos >= faixa.de && (faixa.ate === null || l.animais_ativos <= faixa.ate),
    );
    return {
      rotulo: faixa.rotulo,
      propriedades: dentro.length,
      animais: dentro.reduce((acc, l) => acc + l.animais_ativos, 0),
      fracaoPropriedades: linhas.length > 0 ? dentro.length / linhas.length : null,
    };
  });
}

export interface SegmentoPanorama {
  segmento: string;
  propriedades: number;
  animais: number;
  mrr: number;
  ufs: string[];
}

/**
 * Por segmento PRINCIPAL (o primeiro do array): uma propriedade conta uma vez,
 * ao contrário da carteira, que conta em cada segmento que ela marcou. Aqui o
 * que se quer é dividir animais e MRR, e dividir exige que cada fazenda esteja
 * num lugar só.
 */
export function porSegmento(linhas: LinhaPanorama[]): SegmentoPanorama[] {
  const grupos = new Map<string, LinhaPanorama[]>();
  for (const l of linhas) {
    const k = l.segmento_principal ?? 'Sem segmento';
    const lista = grupos.get(k);
    if (lista) lista.push(l);
    else grupos.set(k, [l]);
  }
  return [...grupos.entries()]
    .map(([segmento, doGrupo]) => ({
      segmento,
      propriedades: doGrupo.length,
      animais: doGrupo.reduce((acc, l) => acc + l.animais_ativos, 0),
      mrr: doGrupo.reduce((acc, l) => acc + l.mrr_mensal, 0),
      ufs: [...new Set(doGrupo.map((l) => l.uf).filter((u): u is string => u !== null))].sort(),
    }))
    .sort((a, b) => b.animais - a.animais || a.segmento.localeCompare(b.segmento, 'pt-BR'));
}

/** As fazendas sem UF — a lista de cadastro a corrigir, das maiores para as menores. */
export function semLocalizacao(linhas: LinhaPanorama[]): LinhaPanorama[] {
  return linhas
    .filter((l) => l.uf === null)
    .sort((a, b) => b.animais_ativos - a.animais_ativos || a.nome.localeCompare(b.nome, 'pt-BR'));
}
