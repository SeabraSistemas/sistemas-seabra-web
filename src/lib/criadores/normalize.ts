import type { Animal, Criador, SexoNorm } from './types';
import { AML_NUMERO } from './aml';

/**
 * Regras de exibicao da vitrine. NUNCA renderizar rotulo orfao: cada helper
 * devolve null/'' quando o dado falta, e o componente omite o bloco.
 * Proibido "—", "N/D", "Nao informado", "0 kg" (plano secao 6.5).
 */

/** Nome de exibicao: o nome, ou "Nº <numero>" quando nao ha nome. */
export function nomeExibivel(a: Pick<Animal, 'nome' | 'numero'>): string {
  const nome = a.nome?.trim();
  if (nome) return nome;
  return `Nº ${a.numero}`;
}

/** "1 ano" / "3 anos" / "8 meses" / "nascido em 2019" / null. */
export function idadeExibivel(a: Pick<Animal, 'idade_meses' | 'ano_nascimento'>): string | null {
  if (a.idade_meses == null) {
    return a.ano_nascimento ? `nascido em ${a.ano_nascimento}` : null;
  }
  if (a.idade_meses < 12) {
    const m = Math.max(0, a.idade_meses);
    return m <= 1 ? '1 mês' : `${m} meses`;
  }
  const anos = Math.floor(a.idade_meses / 12);
  return anos === 1 ? '1 ano' : `${anos} anos`;
}

export function sexoLabel(sexo: SexoNorm): string {
  return sexo === 'macho' ? 'Macho' : 'Fêmea';
}

export function sexoSimbolo(sexo: SexoNorm): string {
  return sexo === 'macho' ? '♂' : '♀';
}

/** Titulo da secao da grade (a grade e agrupada por sexo — decisao do prototipo v12). */
export function grupoLabel(sexo: SexoNorm): string {
  return sexo === 'macho' ? 'Machos' : 'Fêmeas';
}

/** Machos primeiro; dentro do grupo, por ordem e depois numero. */
export function ordenarAnimais(animais: Animal[]): Animal[] {
  return [...animais].sort((x, y) => {
    if (x.sexo_norm !== y.sexo_norm) return x.sexo_norm === 'macho' ? -1 : 1;
    if (x.ordem !== y.ordem) return x.ordem - y.ordem;
    return x.numero.localeCompare(y.numero, 'pt-BR', { numeric: true });
  });
}

/** Metricas da ficha (bloco "FICHA"): so as presentes. Teto real ~2. */
export function metricasDe(a: Animal): { label: string; valor: string; sufixo?: string }[] {
  const out: { label: string; valor: string; sufixo?: string }[] = [];
  if (a.dias_em_lactacao != null)
    out.push({ label: 'dias em lactação', valor: String(a.dias_em_lactacao) });
  if (a.partos != null) out.push({ label: 'partos', valor: String(a.partos) });
  if (a.peso_kg != null) out.push({ label: 'peso atual', valor: String(a.peso_kg), sufixo: 'kg' });
  if (a.producao_vitalicia_kg != null)
    out.push({ label: 'produção vitalícia', valor: fmtKg(a.producao_vitalicia_kg), sufixo: 'kg' });
  if (a.lactacoes_encerradas != null)
    out.push({ label: 'lactações', valor: String(a.lactacoes_encerradas) });
  return out;
}

/** "YYYY-MM-DD" -> "DD/MM/YYYY"; null se ausente/invalido. */
export function fmtDataBr(d: string | null | undefined): string | null {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return null;
  return `${day}/${m}/${y}`;
}

/** Ponto da AML já resolvido para render: numero da caracteristica (quando
 * conhecido), label e nota 1-9. */
export type AmlPonto = { n: number | null; label: string; valor: number };

/** Snapshot da AML pronto para render (retorno de amlDe), consumido por AmlBloco/RadarAml. */
export type AmlData = { totalFmt: string | null; totalInt: number | null; dataFmt: string | null; pts: AmlPonto[] };

/**
 * Snapshot da AML pronto para render, ou null quando não há avaliação com pontos
 * (aí a aba mostra o placeholder). Formata o total como pt-BR ("76,13") no servidor
 * para evitar mismatch de hidratação no client component; totalInt arredonda pro
 * medalhão do radar (mesmo texto do app: "80 PONTOS", não "79,61").
 *
 * Cada ponto pode vir como [label, valor] (snapshot atual) ou [ord, label, valor]
 * (pós vitrine_19_aml_ord no app) — o numero e resolvido nessa ordem: ord do
 * proprio snapshot > AML_NUMERO[label] > null (barra/badge sem numero).
 */
export function amlDe(a: Animal): AmlData | null {
  const ptsRaw = a.aml?.pts;
  if (!Array.isArray(ptsRaw) || ptsRaw.length === 0) return null;
  const total = a.aml?.total;
  const totalFmt = typeof total === 'number' ? total.toFixed(2).replace('.', ',') : null;
  const totalInt = typeof total === 'number' ? Math.round(total) : null;
  const dataFmt = fmtDataBr(a.aml?.data);
  const pts: AmlPonto[] = ptsRaw.map((pt) => {
    if (pt.length === 3) {
      const [ord, label, valor] = pt;
      return { n: ord, label, valor };
    }
    const [label, valor] = pt;
    return { n: AML_NUMERO[label] ?? null, label, valor };
  });
  return { totalFmt, totalInt, dataFmt, pts };
}

function fmtKg(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Densidade do layout da ficha por PESO VISUAL, nao por contagem de blocos
 * (plano D14/§6.3). rich = 2 colunas + pedigree; sparse = 2 colunas simples;
 * minimal = foto centrada.
 */
export function pesoDensity(a: Animal): 'rich' | 'sparse' | 'minimal' {
  const peso =
    Math.min(metricasDe(a).length, 2) +
    (a.genealogia_profundidade === 3 ? 3 : a.genealogia_profundidade) +
    a.titulos.length;
  if (peso >= 3) return 'rich';
  if (peso >= 1) return 'sparse';
  return 'minimal';
}

/** Racas para os badges do card do criador: no maximo 2 + "+N". */
export function racasResumo(racas: string[]): { badges: string[]; extra: number } {
  const badges = racas.slice(0, 2);
  return { badges, extra: Math.max(0, racas.length - 2) };
}

/** Alt text: nunca vazio, nunca "foto". */
export function altAnimal(a: Animal, criador: string): string {
  const base = nomeExibivel(a);
  const partes = [base, sexoLabel(a.sexo_norm)];
  if (a.raca) partes.push(a.raca);
  return `${partes.join(', ')}, criador ${criador}`;
}

/** Iniciais para o avatar do criador quando nao ha logo. */
export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Resumo "N machos · N fêmeas" (some o lado zero). */
export function resumoSexos(c: Pick<Criador, 'machos' | 'femeas'>): string {
  const partes: string[] = [];
  if (c.machos > 0) partes.push(`${c.machos} macho${c.machos > 1 ? 's' : ''}`);
  if (c.femeas > 0) partes.push(`${c.femeas} fêmea${c.femeas > 1 ? 's' : ''}`);
  return partes.join(' · ');
}
