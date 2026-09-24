/**
 * Contas do painel /tokens. O limite semanal do Claude é um medidor de 0 a
 * 100% que zera num dia e hora fixos (padrão: domingo 02:00). O painel divide
 * o que sobra pelo tempo que falta e diz quanto dá para usar hoje.
 *
 * O "dia de uso" vai da hora do reset até a mesma hora do dia seguinte: com
 * reset às 02:00, o que se usa à 01:00 de quinta conta para quarta.
 *
 * Tudo em hora local do navegador — as datas são montadas com setHours/
 * setDate, nunca somando 24h em ms, para não errar se houver horário de verão.
 */

export const HORA_MS = 3_600_000;
export const DIA_MS = 24 * HORA_MS;

/** Um dia partido menor que isto (reset extra às 23h, p.ex.) é somado ao vizinho. */
const DIA_MINIMO_MS = 6 * HORA_MS;

export interface Leitura {
  t: number;
  pct: number;
}

export interface Estado {
  /** 0 = domingo … 6 = sábado. */
  resetDiaSemana: number;
  resetHora: number;
  /** Reset fora de hora (cortesia da Anthropic, troca de plano): zera o medidor nesse instante. */
  resetExtra: number | null;
  /** Próximo reset diferente do padrão, quando o reset extra mudou a data. */
  proximoManual: number | null;
  leituras: Leitura[];
}

export const ESTADO_INICIAL: Estado = {
  resetDiaSemana: 0,
  resetHora: 2,
  resetExtra: null,
  proximoManual: null,
  leituras: [],
};

export interface Ciclo {
  inicio: number;
  fim: number;
}

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

export function cicloAtual(agora: number, e: Estado): Ciclo {
  const padrao = proximoResetPadrao(agora, e.resetDiaSemana, e.resetHora);
  const fim = e.proximoManual != null && e.proximoManual > agora ? e.proximoManual : padrao;
  // O início é o reset mais recente que já aconteceu dentro da janela de 7 dias:
  // o padrão, um reset extra, ou um próximo-manual que já passou.
  let inicio = somarDias(fim, -7);
  for (const r of [e.resetExtra, e.proximoManual]) {
    if (r != null && r <= agora && r > inicio) inicio = r;
  }
  return { inicio, fim };
}

export interface Dia {
  inicio: number;
  fim: number;
  /** Instante que dá nome ao dia (meio do intervalo) — um dia fundido leva o nome da parte maior. */
  rotulo: number;
}

export function diasDoCiclo(ciclo: Ciclo, hora: number): Dia[] {
  const cortes = [ciclo.inicio];
  let ini = ciclo.inicio;
  while (ini < ciclo.fim) {
    const d = new Date(ini);
    d.setHours(hora, 0, 0, 0);
    if (d.getTime() <= ini) d.setDate(d.getDate() + 1);
    ini = Math.min(d.getTime(), ciclo.fim);
    cortes.push(ini);
  }
  // Pedaço curto nas pontas vira parte do dia vizinho.
  if (cortes.length > 2 && cortes[1] - cortes[0] < DIA_MINIMO_MS) cortes.splice(1, 1);
  const n = cortes.length;
  if (n > 2 && cortes[n - 1] - cortes[n - 2] < DIA_MINIMO_MS) cortes.splice(n - 2, 1);

  return cortes.slice(0, -1).map((inicio, i) => {
    const fim = cortes[i + 1];
    return { inicio, fim, rotulo: (inicio + fim) / 2 };
  });
}

/** Leituras do ciclo, em ordem. */
export function leiturasDoCiclo(leituras: Leitura[], ciclo: Ciclo): Leitura[] {
  return leituras.filter((l) => l.t >= ciclo.inicio && l.t < ciclo.fim).sort((a, b) => a.t - b.t);
}

/**
 * Uso do medidor no instante t: a última leitura até t. Enquanto não houver
 * leitura nenhuma desde o reset, reparte a primeira leitura proporcionalmente
 * ao tempo (quem começa a anotar na quarta não tem o uso de dom–ter "caindo"
 * todo em quarta). `estimado` avisa que foi esse o caso.
 */
export function usoEm(t: number, ciclo: Ciclo, leituras: Leitura[]): { pct: number; estimado: boolean } {
  let anterior: Leitura | null = null;
  for (const l of leituras) {
    if (l.t <= t) anterior = l;
    else break;
  }
  if (anterior) return { pct: anterior.pct, estimado: false };
  const primeira = leituras[0];
  if (!primeira || t <= ciclo.inicio) return { pct: 0, estimado: false };
  return { pct: (primeira.pct * (t - ciclo.inicio)) / (primeira.t - ciclo.inicio), estimado: true };
}

export type Situacao = 'ok' | 'atencao' | 'estourou' | 'esgotado';

export interface DiaPlano extends Dia {
  fase: 'passado' | 'hoje' | 'futuro';
  /** Uso no início do dia (passado/hoje). */
  base: number | null;
  /** Passado: uso no fim do dia; hoje: uso atual. */
  uso: number | null;
  /** Quanto foi usado no dia (passado) ou até agora (hoje). */
  usado: number | null;
  /** Cota do dia, calculada como no começo dele: saldo ÷ tempo que faltava. */
  cota: number;
  /** Onde o medidor deveria estar no fim do dia. */
  meta: number;
  /** Passado sem leitura dentro do dia: o uso foi parar no dia seguinte. */
  semLeitura: boolean;
}

export interface Plano {
  ciclo: Ciclo;
  dias: DiaPlano[];
  hoje: DiaPlano;
  leituras: Leitura[];
  atual: number;
  baseEstimada: boolean;
  cotaHoje: number;
  limiteHoje: number;
  usadoHoje: number;
  restaHoje: number;
  /** Cota por 24h, recalculada no início de hoje. 14,3% numa semana cheia sem reset extra. */
  ritmoDia: number;
  /** Cota por 24h a partir de amanhã, supondo que hoje feche no limite (ou onde já está, se passou). */
  ritmoAmanha: number;
  /** Onde o medidor estaria agora gastando por igual desde o reset. */
  linearAgora: number;
  diasRestantes: number;
  situacao: Situacao;
}

export function montarPlano(agora: number, e: Estado): Plano {
  const ciclo = cicloAtual(agora, e);
  const leituras = leiturasDoCiclo(e.leituras, ciclo);
  const atual = leituras.length ? leituras[leituras.length - 1].pct : 0;
  const dias = diasDoCiclo(ciclo, e.resetHora);
  const iHoje = Math.max(0, dias.findIndex((d) => agora >= d.inicio && agora < d.fim));
  const cota = (base: number, d: Dia) => (Math.max(0, 100 - base) * (d.fim - d.inicio)) / (ciclo.fim - d.inicio);

  let baseEstimada = false;
  const plano: DiaPlano[] = [];
  let metaFutura = 0;

  dias.forEach((d, i) => {
    if (i < iHoje) {
      const base = usoEm(d.inicio, ciclo, leituras).pct;
      const fim = usoEm(d.fim - 1, ciclo, leituras);
      const semLeitura = !leituras.some((l) => l.t >= d.inicio && l.t < d.fim);
      const c = cota(base, d);
      plano.push({ ...d, fase: 'passado', base, uso: fim.pct, usado: fim.pct - base, cota: c, meta: base + c, semLeitura });
    } else if (i === iHoje) {
      const b = usoEm(d.inicio, ciclo, leituras);
      baseEstimada = b.estimado;
      const c = cota(b.pct, d);
      plano.push({ ...d, fase: 'hoje', base: b.pct, uso: atual, usado: atual - b.pct, cota: c, meta: b.pct + c, semLeitura: false });
      metaFutura = Math.max(atual, b.pct + c);
    } else {
      const c = cota(metaFutura, d);
      metaFutura += c;
      plano.push({ ...d, fase: 'futuro', base: null, uso: null, usado: null, cota: c, meta: metaFutura, semLeitura: false });
    }
  });

  const hoje = plano[iHoje];
  const base = hoje.base ?? 0;
  const restaHoje = hoje.meta - atual;
  const aposHoje = ciclo.fim - hoje.fim;
  const fechaHoje = Math.max(atual, hoje.meta);

  let situacao: Situacao = 'ok';
  if (atual >= 100) situacao = 'esgotado';
  else if (restaHoje < 0) situacao = 'estourou';
  else if (hoje.usado! >= 0.8 * hoje.cota) situacao = 'atencao';

  return {
    ciclo,
    dias: plano,
    hoje,
    leituras,
    atual,
    baseEstimada,
    cotaHoje: hoje.cota,
    limiteHoje: hoje.meta,
    usadoHoje: hoje.usado ?? 0,
    restaHoje,
    ritmoDia: (Math.max(0, 100 - base) * DIA_MS) / (ciclo.fim - hoje.inicio),
    ritmoAmanha: aposHoje > 0 ? (Math.max(0, 100 - fechaHoje) * DIA_MS) / aposHoje : 0,
    linearAgora: (100 * (agora - ciclo.inicio)) / (ciclo.fim - ciclo.inicio),
    diasRestantes: (ciclo.fim - agora) / DIA_MS,
    situacao,
  };
}
