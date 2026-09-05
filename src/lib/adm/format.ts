/**
 * Formatadores do /adm. pt-BR e America/Sao_Paulo SEMPRE explícitos, nunca o
 * default do runtime — o servidor da Vercel roda em UTC e o browser do Felipe
 * em -03: qualquer `toLocaleDateString()` sem argumento devolve strings
 * diferentes dos dois lados e o React descarta a árvore inteira com erro de
 * hidratação. Aqui só existe formatação determinística.
 *
 * Duas armadilhas concretas do schema do app que este arquivo resolve:
 *
 * 1. `manejo.data_manejo`, `pesagem.data_pesagem` e `pagamentos.data_vencimento`
 *    são `date` PURO no Postgres e chegam como 'YYYY-MM-DD'. Passar isso por
 *    `new Date()` interpreta como meia-noite UTC e, convertido para São Paulo,
 *    volta um dia — o app já teve exatamente esse bug (por isso o DTO Dart usa
 *    supaDeserializeDate). Aqui data pura NUNCA vira Date: é fatiada como texto.
 * 2. Os campos de contato chegam JÁ MASCARADOS da view `adm.*` ('(**) *****-1234').
 *    formatarTelefone() devolve máscara intacta em vez de tentar reformatá-la.
 */

/** Traço para "não existe valor". Nunca '0', nunca string vazia: 0 é um dado. */
export const VAZIO = '—';

const LOCALE = 'pt-BR';
const FUSO = 'America/Sao_Paulo';

// ─────────────────────────────────────────────────────────────────────────────
// Números
// ─────────────────────────────────────────────────────────────────────────────

const nfInteiro = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const nfMoeda = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL' });
const nfMoedaCompacta = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Cache por casas decimais: criar Intl.NumberFormat por chamada é caro numa tabela de 1.000 linhas. */
const cacheDecimal = new Map<number, Intl.NumberFormat>();

function nfDecimal(casas: number): Intl.NumberFormat {
  const existente = cacheDecimal.get(casas);
  if (existente) return existente;
  const nf = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: casas, maximumFractionDigits: casas });
  cacheDecimal.set(casas, nf);
  return nf;
}

/** -0 existe em JS e imprime "-0"; qualquer soma de negativos que zera cai nisso. */
function semZeroNegativo(n: number): number {
  return n === 0 ? 0 : n;
}

function finito(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/** Inteiro com separador de milhar. Use com `tabular-nums` na classe. */
export function formatarInteiro(n: number | null | undefined): string {
  return finito(n) ? nfInteiro.format(semZeroNegativo(Math.round(n))) : VAZIO;
}

/** Número com casas fixas — casas fixas, e não "até N", para a coluna alinhar. */
export function formatarNumero(n: number | null | undefined, casas = 1): string {
  return finito(n) ? nfDecimal(casas).format(semZeroNegativo(n)) : VAZIO;
}

/** R$ 1.234,56 */
export function formatarMoeda(n: number | null | undefined): string {
  return finito(n) ? nfMoeda.format(semZeroNegativo(n)) : VAZIO;
}

/** R$ 12,3 mil — só para card de KPI, nunca para valor de cobrança (que precisa dos centavos). */
export function formatarMoedaCompacta(n: number | null | undefined): string {
  return finito(n) ? nfMoedaCompacta.format(semZeroNegativo(n)) : VAZIO;
}

/**
 * Percentual a partir de FRAÇÃO (0,625 → "63%"). Recebe fração e não 0-100 de
 * propósito: as métricas do /adm nascem como razão (animais com evento ÷ vivos)
 * e multiplicar por 100 em dois lugares diferentes é como um número vira 6.250%.
 */
export function formatarPercentual(fracao: number | null | undefined, casas = 0): string {
  if (!finito(fracao)) return VAZIO;
  return `${nfDecimal(casas).format(semZeroNegativo(fracao * 100))}%`;
}

/** Variação relativa com sinal explícito: "+12%" / "−8%" (menos tipográfico, alinha com o dígito). */
export function formatarVariacao(fracao: number | null | undefined, casas = 0): string {
  if (!finito(fracao)) return VAZIO;
  const corpo = `${nfDecimal(casas).format(Math.abs(fracao) * 100)}%`;
  if (fracao > 0) return `+${corpo}`;
  if (fracao < 0) return `−${corpo}`;
  return `0%`;
}

/** Litros de leite — 1 casa: a balança do tanque não tem resolução melhor que isso. */
export function formatarLitros(n: number | null | undefined, casas = 1): string {
  return finito(n) ? `${nfDecimal(casas).format(semZeroNegativo(n))} L` : VAZIO;
}

export function formatarKg(n: number | null | undefined, casas = 1): string {
  return finito(n) ? `${nfDecimal(casas).format(semZeroNegativo(n))} kg` : VAZIO;
}

export function formatarBooleano(v: boolean | null | undefined): string {
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  return VAZIO;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datas
// ─────────────────────────────────────────────────────────────────────────────

/** 'YYYY-MM-DD' exato — o formato do `date` puro do Postgres, sem hora nem fuso. */
const SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

const dtfData = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dtfDataHora = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * 'YYYY-MM-DD' do instante NO FUSO DE SÃO PAULO. en-CA é o único locale que o
 * Intl formata em ISO puro — o truque evita montar a string na mão a partir de
 * getFullYear()/getMonth(), que leem o fuso da máquina e não o nosso.
 */
const dtfDiaCivil = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function paraDate(iso: string | Date | null | undefined): Date | null {
  if (iso == null || iso === '') return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Dia civil em São Paulo ('YYYY-MM-DD'). Data pura passa reto, sem virar Date. */
export function diaCivil(iso: string | Date | null | undefined): string | null {
  if (typeof iso === 'string') {
    const m = SO_DATA.exec(iso);
    if (m) return iso;
  }
  const d = paraDate(iso);
  return d ? dtfDiaCivil.format(d) : null;
}

/** 04/09/2026. Aceita `date` puro e timestamptz. */
export function formatarData(iso: string | Date | null | undefined): string {
  if (typeof iso === 'string') {
    const m = SO_DATA.exec(iso);
    // Data pura é texto, não instante: fatiar é o único jeito de não perder um dia.
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  const d = paraDate(iso);
  return d ? dtfData.format(d) : VAZIO;
}

/** 04/09/2026 14:32 — só para carimbo de created_at, onde a hora importa. */
export function formatarDataHora(iso: string | Date | null | undefined): string {
  const d = paraDate(iso);
  if (!d) return formatarData(iso);
  return dtfDataHora.format(d).replace(', ', ' ');
}

/**
 * 'set/2026' a partir de 'YYYY-MM'. Os nomes vêm de uma tabela local em vez do
 * Intl porque a abreviação de mês em pt-BR mudou entre versões do ICU ('set' e
 * 'set.'): com Node e browser em ICUs diferentes, o eixo do gráfico renderizado
 * no servidor não bateria com o do cliente.
 */
const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatarMes(periodo: string | null | undefined): string {
  if (!periodo) return VAZIO;
  const m = /^(\d{4})-(\d{2})/.exec(periodo);
  if (!m) return periodo;
  const indice = Number(m[2]) - 1;
  if (indice < 0 || indice > 11) return periodo;
  return `${MESES_ABREV[indice]}/${m[1]}`;
}

/** '04/09' — rótulo curto do eixo X de série diária, onde o ano é ruído. */
export function formatarDiaCurto(periodo: string | null | undefined): string {
  if (!periodo) return VAZIO;
  const m = SO_DATA.exec(periodo);
  if (m) return `${m[3]}/${m[2]}`;
  const d = paraDate(periodo);
  if (!d) return VAZIO;
  const civil = dtfDiaCivil.format(d);
  return `${civil.slice(8, 10)}/${civil.slice(5, 7)}`;
}

/**
 * Dias civis inteiros entre dois instantes, contados em São Paulo. Conta DIA,
 * não 24h: quem lançou ontem às 23h50 e é consultado hoje às 00h10 sumiu "há 1
 * dia", não "há 0". É a mesma semântica que o Felipe usa falando.
 */
export function diasEntre(de: string | Date | null | undefined, ate: string | Date | null | undefined): number | null {
  const a = diaCivil(de);
  const b = diaCivil(ate);
  if (!a || !b) return null;
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return null;
  return Math.round((tb - ta) / 86_400_000);
}

/**
 * Dias desde um instante até `agora`. `agora` é PARÂMETRO, não Date.now()
 * escondido: o valor precisa ser o mesmo no render do servidor e no do cliente,
 * e uma página com revalidate serve o mesmo HTML por minutos.
 */
export function diasDesde(iso: string | Date | null | undefined, agora: Date | string): number | null {
  return diasEntre(iso, agora);
}

/**
 * "hoje" · "ontem" · "há 12 dias" · "há 3 meses" · "nunca".
 * Recebe DIAS, não data: o número já vem calculado do SQL (dias_sem_lancar) e
 * refazer a conta no cliente reintroduz a divergência de relógio.
 */
export function formatarDiasRelativo(dias: number | null | undefined): string {
  if (!finito(dias)) return 'nunca';
  const d = Math.round(dias);
  if (d < 0) return 'no futuro';
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 30) return `há ${formatarInteiro(d)} dias`;
  if (d < 60) return 'há 1 mês';
  if (d < 365) return `há ${Math.floor(d / 30)} meses`;
  const anos = Math.floor(d / 365);
  return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
}

/** Versão com data na entrada. `agora` explícito pelo mesmo motivo de diasDesde(). */
export function formatarDataRelativa(iso: string | Date | null | undefined, agora: Date | string): string {
  return formatarDiasRelativo(diasDesde(iso, agora));
}

/** "vence em 7 dias" / "vencido há 3 dias" — o sinal do número vira a palavra. */
export function formatarVencimento(diasRestantes: number | null | undefined): string {
  if (!finito(diasRestantes)) return VAZIO;
  const d = Math.round(diasRestantes);
  if (d < 0) return `vencido ${formatarDiasRelativo(-d)}`;
  if (d === 0) return 'vence hoje';
  if (d === 1) return 'vence amanhã';
  return `vence em ${formatarInteiro(d)} dias`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contato
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `usuarios.whatsapp_pessoal` é E.164 SÓ DÍGITOS, sem '+' (e não existe coluna
 * `telefone` em usuarios). '5511999999999' → '+55 (11) 99999-9999'.
 *
 * Se o valor vier com qualquer caractere que não seja dígito, ele JÁ É a máscara
 * da view (`(**) *****-1234`) e sai intacto — reformatar máscara produziria um
 * telefone plausível e falso, que é pior do que não mostrar nada.
 */
export function formatarTelefone(valor: string | null | undefined, pais?: string | null): string {
  if (!valor) return VAZIO;
  const bruto = valor.trim();
  if (bruto === '') return VAZIO;
  if (/[^\d]/.test(bruto)) return bruto;

  const brasileiro = (!pais || pais.toUpperCase() === 'BR') && bruto.startsWith('55');
  if (brasileiro && (bruto.length === 12 || bruto.length === 13)) {
    const ddd = bruto.slice(2, 4);
    const resto = bruto.slice(4);
    const corte = resto.length - 4; // celular tem 9 dígitos, fixo tem 8
    return `+55 (${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
  }
  return `+${bruto}`;
}

/** Link de conversa. Sem '+' e sem pontuação — é o formato que o wa.me exige. */
export function linkWhatsapp(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const digitos = valor.replace(/\D/g, '');
  // Máscara vira '' ou um punhado de dígitos soltos: menos de 10 nunca é telefone.
  return digitos.length >= 10 ? `https://wa.me/${digitos}` : null;
}

/** Rótulo de lista: 'a, b e c'. Vazio => VAZIO (e não a string 'undefined'). */
export function formatarLista(itens: readonly string[] | null | undefined): string {
  if (!itens || itens.length === 0) return VAZIO;
  if (itens.length === 1) return itens[0];
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

/**
 * Célula genérica da <AdmTable>: o escape hatch renderiza colunas que ninguém
 * curou, então o fallback precisa ser seguro para qualquer valor do Postgres —
 * inclusive jsonb, array e null.
 */
export function formatarValorCru(valor: unknown): string {
  if (valor == null) return VAZIO;
  if (typeof valor === 'boolean') return formatarBooleano(valor);
  if (typeof valor === 'number') return Number.isInteger(valor) ? formatarInteiro(valor) : formatarNumero(valor, 2);
  if (Array.isArray(valor)) return valor.length === 0 ? VAZIO : valor.map((v) => formatarValorCru(v)).join(', ');
  if (typeof valor === 'object') return JSON.stringify(valor);
  const texto = String(valor);
  if (texto.trim() === '') return VAZIO;
  // Timestamptz e date puro chegam como texto no PostgREST; reconhecer é o que
  // impede a tabela de mostrar '2026-09-04T12:00:00+00:00' numa coluna de data.
  if (SO_DATA.test(texto)) return formatarData(texto);
  if (/^\d{4}-\d{2}-\d{2}T[\d:.]+/.test(texto)) return formatarDataHora(texto);
  return texto;
}
