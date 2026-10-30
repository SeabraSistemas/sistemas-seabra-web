import { SERIES_NRC } from '@/data/nutricao/nrc2007';
import type { Exigencia, LinhaNrc, SerieNrc } from '@/lib/nutricao/tipos';

/** 1 lb = 0,45359237 kg (a faixa de leite do rótulo de ordenha vem em lb/dia). */
export const KG_POR_LB = 0.45359237;

const TOLERANCIA_PESO_KG = 0.05;

/**
 * O NRC 2007 monta cada linha com um degrau de NDT da dieta (≈53%, 66% ou 80%):
 * quanto maior a exigência frente à capacidade de consumo, mais densa a dieta.
 * Por isso a concentração SALTA entre pesos vizinhos — e interpolar entre
 * degraus misturaria duas dietas que não existem.
 */
export type DegrauNdt = 53 | 66 | 80;

export function degrauNdt(ndtFrac: number): DegrauNdt {
  if (ndtFrac < 0.595) return 53;
  if (ndtFrac < 0.73) return 66;
  return 80;
}

export function seriesNrc(): SerieNrc[] {
  return SERIES_NRC;
}

export function serieNrcPorId(id: string): SerieNrc | undefined {
  return SERIES_NRC.find((s) => s.id === id);
}

/** Fases na ordem do arquivo, sem repetir. */
export function fasesNrc(): { fase: string; nome: string }[] {
  const vistas = new Set<string>();
  const saida: { fase: string; nome: string }[] = [];
  for (const s of SERIES_NRC) {
    if (vistas.has(s.fase)) continue;
    vistas.add(s.fase);
    saida.push({ fase: s.fase, nome: s.faseNome });
  }
  return saida;
}

export function niveisDaFase(fase: string): SerieNrc[] {
  return SERIES_NRC.filter((s) => s.fase === fase);
}

/** Valores de uma consulta ao NRC, já como exigência diária. */
export type ValoresNrc = Pick<LinhaNrc, 'cmsKg' | 'ndtKg' | 'pbG' | 'caG' | 'pG' | 'ndtFrac' | 'pbFrac'> & {
  degrau: DegrauNdt;
};

export type SituacaoNrc =
  /** O peso é um ponto da tabela. */
  | 'exato'
  /** Entre dois pontos do MESMO degrau de NDT: interpolação linear. */
  | 'interpolado'
  /** Entre dois pontos de degraus DIFERENTES: não interpola; vale o ponto escolhido. */
  | 'troca-de-degrau'
  /** Fora da faixa de pesos da série: sem extrapolar. */
  | 'fora-da-faixa';

export type ConsultaNrc = {
  serie: SerieNrc;
  pesoKg: number;
  situacao: SituacaoNrc;
  valores: ValoresNrc | null;
  /** Na troca de degrau: os dois pontos vizinhos, para o usuário escolher. */
  vizinhos: { abaixo: ValoresNrc & { pesoKg: number }; acima: ValoresNrc & { pesoKg: number } } | null;
  /** Na troca de degrau: qual vizinho está valendo. */
  escolhido: 'abaixo' | 'acima' | null;
  /** Só ordenha: leite/dia estimado para este peso (kg). */
  leiteKgDia: number | null;
  avisos: string[];
};

function valoresDe(l: LinhaNrc): ValoresNrc {
  return {
    cmsKg: l.cmsKg,
    ndtKg: l.ndtKg,
    pbG: l.pbG,
    caG: l.caG,
    pG: l.pG,
    ndtFrac: l.ndtFrac,
    pbFrac: l.pbFrac,
    degrau: degrauNdt(l.ndtFrac),
  };
}

function misturar(a: LinhaNrc, b: LinhaNrc, t: number): ValoresNrc {
  const f = (x: number, y: number) => x + (y - x) * t;
  return {
    cmsKg: f(a.cmsKg, b.cmsKg),
    ndtKg: f(a.ndtKg, b.ndtKg),
    pbG: f(a.pbG, b.pbG),
    caG: f(a.caG, b.caG),
    pG: f(a.pG, b.pG),
    ndtFrac: f(a.ndtFrac, b.ndtFrac),
    pbFrac: f(a.pbFrac, b.pbFrac),
    degrau: degrauNdt(a.ndtFrac),
  };
}

/**
 * Leite/dia (kg) estimado para um peso, na série de ordenha. O rótulo dá uma
 * faixa em lb/dia que cobre TODOS os pesos da série (50 a 90 kg); a litragem de
 * um peso é a interpolação linear dentro dela (60 kg, meio, baixa: ≈ 3,6 kg).
 */
export function leiteEstimadoKg(serie: SerieNrc, pesoKg: number): number | null {
  if (!serie.leiteLbDia) return null;
  const pesos = serie.linhas.map((l) => l.pesoKg);
  const min = Math.min(...pesos);
  const max = Math.max(...pesos);
  if (pesoKg < min - TOLERANCIA_PESO_KG || pesoKg > max + TOLERANCIA_PESO_KG) return null;
  const [lo, hi] = serie.leiteLbDia;
  const t = max === min ? 0 : (pesoKg - min) / (max - min);
  return (lo + (hi - lo) * t) * KG_POR_LB;
}

export function consultarNrc(serie: SerieNrc, pesoKg: number, escolha: 'abaixo' | 'acima' = 'abaixo'): ConsultaNrc {
  const base: ConsultaNrc = { serie, pesoKg, situacao: 'fora-da-faixa', valores: null, vizinhos: null, escolhido: null, leiteKgDia: leiteEstimadoKg(serie, pesoKg), avisos: [] };
  const linhas = serie.linhas;
  const min = linhas[0].pesoKg;
  const max = linhas[linhas.length - 1].pesoKg;

  if (!Number.isFinite(pesoKg) || pesoKg < min - TOLERANCIA_PESO_KG || pesoKg > max + TOLERANCIA_PESO_KG) {
    return { ...base, avisos: [`${serie.faseNome} (${serie.nivel}) só tem valores de ${min} a ${max} kg de peso vivo; o NRC não é extrapolado.`] };
  }

  const exata = linhas.find((l) => Math.abs(l.pesoKg - pesoKg) <= TOLERANCIA_PESO_KG);
  if (exata) return { ...base, situacao: 'exato', valores: valoresDe(exata) };

  const iAcima = linhas.findIndex((l) => l.pesoKg > pesoKg);
  const a = linhas[iAcima - 1];
  const b = linhas[iAcima];

  if (degrauNdt(a.ndtFrac) === degrauNdt(b.ndtFrac)) {
    const t = (pesoKg - a.pesoKg) / (b.pesoKg - a.pesoKg);
    return { ...base, situacao: 'interpolado', valores: misturar(a, b, t) };
  }

  const vizinhos = { abaixo: { ...valoresDe(a), pesoKg: a.pesoKg }, acima: { ...valoresDe(b), pesoKg: b.pesoKg } };
  return {
    ...base,
    situacao: 'troca-de-degrau',
    valores: escolha === 'acima' ? vizinhos.acima : vizinhos.abaixo,
    vizinhos,
    escolhido: escolha,
    avisos: [
      `Entre ${a.pesoKg} e ${b.pesoKg} kg o NRC troca de degrau de NDT (${degrauNdt(a.ndtFrac)}% → ${degrauNdt(b.ndtFrac)}%): não dá para interpolar. Valendo o ponto de ${escolha === 'acima' ? b.pesoKg : a.pesoKg} kg.`,
    ],
  };
}

/** A faixa de leite do rótulo parece truncada? (Maryland, meio da lactação, alta: 11,0–12,2 lb/d.) */
export function avisosDaSerie(serie: SerieNrc): string[] {
  if (!serie.leiteLbDia) return [];
  const [lo, hi] = serie.leiteLbDia;
  if (hi - lo < 2) {
    return [`A faixa de leite deste nível (${lo.toString().replace('.', ',')}–${hi.toString().replace('.', ',')} lb/dia) é estreita demais perto dos outros níveis; pode haver erro de digitação na fonte. Conferir antes de usar o leite estimado.`];
  }
  return [];
}

/**
 * Nível de ordenha cujo leite estimado para este peso (ver `leiteEstimadoKg`) é
 * o mais próximo do leite informado. Só sugestão: quem escolhe é o usuário.
 */
export function sugerirNivelOrdenha(fase: string, pesoKg: number, leiteKg: number): SerieNrc | null {
  if (!(leiteKg > 0)) return null;
  let melhor: SerieNrc | null = null;
  let menorDist = Infinity;
  for (const s of niveisDaFase(fase)) {
    const estimado = leiteEstimadoKg(s, pesoKg);
    if (estimado == null) continue;
    const dist = Math.abs(leiteKg - estimado);
    if (dist < menorDist) {
      menorDist = dist;
      melhor = s;
    }
  }
  return melhor;
}

export function exigenciaDoNrc(consulta: ConsultaNrc): Exigencia {
  const v = consulta.valores;
  const rotulo = `NRC 2007 · ${consulta.serie.faseNome} · ${consulta.serie.nivel}`;
  if (!v) {
    return {
      fonte: 'nrc',
      rotulo,
      cmsKg: null,
      ndt: { frac: null, absoluto: null },
      pb: { frac: null, absoluto: null },
      ca: { frac: null, absoluto: null },
      p: { frac: null, absoluto: null },
      avisos: consulta.avisos,
    };
  }
  const cms = v.cmsKg;
  return {
    fonte: 'nrc',
    rotulo,
    cmsKg: cms,
    ndt: { frac: v.ndtFrac, absoluto: v.ndtKg },
    pb: { frac: v.pbFrac, absoluto: v.pbG },
    ca: { frac: v.caG / 1000 / cms, absoluto: v.caG },
    p: { frac: v.pG / 1000 / cms, absoluto: v.pG },
    avisos: consulta.avisos,
  };
}
