/**
 * Contas do painel /tokens. O Weekly do Claude sobe de 0 a 100% e zera num
 * dia e hora fixos (padrão: domingo 02:00). A semana tem 7 dias de uso — cada
 * um vai da hora do reset até a mesma hora do dia seguinte — e cada dia tem
 * uma meta acumulada, 1/7 do limite por dia: dom 14%, seg 28% … sáb 100%.
 *
 * Reset fora de hora: o dia em que zerou vira o primeiro de uma escada nova
 * até o reset normal, que não muda (reset na quarta → qua 25%, qui 50%,
 * sex 75%, sáb 100%). No domingo seguinte volta tudo para 14%.
 *
 * Datas montadas com setHours/setDate, nunca somando 24h em ms, para não
 * errar se houver horário de verão.
 */

export interface Leitura {
  t: number;
  pct: number;
}

export interface Estado {
  /** 0 = domingo … 6 = sábado. */
  resetDiaSemana: number;
  resetHora: number;
  /** Um instante dentro do dia em que houve reset fora de hora (guardamos o início do dia). */
  resetExtra: number | null;
  /** Último Weekly digitado — opcional, só para comparar com a meta de hoje. */
  leitura: Leitura | null;
}

export const ESTADO_INICIAL: Estado = {
  resetDiaSemana: 0,
  resetHora: 2,
  resetExtra: null,
  leitura: null,
};

/** Próxima ocorrência do dia da semana às hora:00, estritamente depois de t. */
export function proximoResetPadrao(t: number, diaSemana: number, hora: number): number {
  const d = new Date(t);
  d.setHours(hora, 0, 0, 0);
  d.setDate(d.getDate() + ((diaSemana - d.getDay() + 7) % 7));
  if (d.getTime() <= t) d.setDate(d.getDate() + 7);
  return d.getTime();
}

function somarDias(t: number, dias: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + dias);
  return d.getTime();
}

export interface DiaMeta {
  inicio: number;
  fim: number;
  fase: 'passado' | 'hoje' | 'futuro';
  /** Onde o Weekly pode estar no fim do dia; null antes de um reset fora de hora. */
  meta: number | null;
}

export interface Semana {
  inicio: number;
  fim: number;
  dias: DiaMeta[];
  iHoje: number;
  /** Dia em que a escada atual começa: 0 sem reset fora de hora. */
  iReset: number;
  /** Cota por dia da escada atual: 14,3% sem reset, 25% com reset na quarta… */
  porDia: number;
  metaHoje: number;
  /** A leitura digitada, se for desta escada (depois do último reset). */
  leitura: Leitura | null;
}

/** Arredonda para baixo: nunca manda passar do ritmo. O último dia fecha em 100. */
const degrau = (v: number) => Math.floor(v + 1e-9);

export function montarSemana(agora: number, e: Estado): Semana {
  const fim = proximoResetPadrao(agora, e.resetDiaSemana, e.resetHora);
  const inicio = somarDias(fim, -7);
  const cortes = Array.from({ length: 8 }, (_, k) => somarDias(inicio, k));
  const diaDe = (t: number) => cortes.findIndex((c, k) => k < 7 && t >= c && t < cortes[k + 1]);

  const iHoje = Math.max(0, diaDe(agora));
  const r = e.resetExtra != null ? diaDe(e.resetExtra) : -1;
  const iReset = r > 0 && r <= iHoje ? r : 0;
  const n = 7 - iReset;

  const dias: DiaMeta[] = cortes.slice(0, 7).map((c, k) => ({
    inicio: c,
    fim: cortes[k + 1],
    fase: k < iHoje ? 'passado' : k === iHoje ? 'hoje' : 'futuro',
    meta: k < iReset ? null : degrau((100 * (k - iReset + 1)) / n),
  }));

  const leitura = e.leitura && e.leitura.t >= cortes[iReset] && e.leitura.t < fim ? e.leitura : null;

  return { inicio, fim, dias, iHoje, iReset, porDia: 100 / n, metaHoje: dias[iHoje].meta ?? 0, leitura };
}
