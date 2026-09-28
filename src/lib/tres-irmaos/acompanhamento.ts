import { diaDaSemana, diasEntre, inicioDaSemana, somarDias } from '@/lib/tres-irmaos/datas';
import type { Comprador } from '@/lib/tres-irmaos/projecao';

/**
 * Acompanhamento das coletas, SÓ LEITURA, a partir da Produção Diária que o
 * produtor lança no app (1ª ordenha de manhã, 2ª à tarde).
 *
 * Os compradores recolhem DEPOIS DA 1ª ORDENHA do dia de coleta (decisão do
 * Felipe, 28/09/2026). Então cada coleta leva o leite da ordenha seguinte à
 * coleta anterior até a 1ª ordenha do próprio dia:
 *
 *   Rose, terça   → da tarde de quinta até a manhã de terça  (10 ordenhas)
 *   Marina, quinta → da tarde de terça até a manhã de quinta (4 ordenhas)
 *
 * O tanque é simulado: cada comprador leva até o seu máximo semanal, e o
 * que ele não leva fica para a coleta seguinte. A semana é a da Rose (terça
 * a segunda) e o teto semanal vale para a soma das coletas da semana.
 */

export interface ProducaoDoApp {
  data: string;
  lactantes: number | null;
  /** 1ª ordenha (manhã). null = não lançada. */
  litros1: number | null;
  /** 2ª ordenha (tarde). null = não lançada. */
  litros2: number | null;
}

export interface SaidaDoApp {
  data: string;
  litros: number;
  destinos: string[];
}

export interface Ordenha {
  data: string;
  turno: 1 | 2;
  litros: number;
}

/** Cada ordenha lançada vira uma entrada; ordenha em branco (null) não conta como lançada. */
export function ordenhasDoApp(producoes: ProducaoDoApp[]): Ordenha[] {
  const out: Ordenha[] = [];
  for (const p of producoes) {
    if (p.litros1 != null) out.push({ data: p.data, turno: 1, litros: Number(p.litros1) || 0 });
    if (p.litros2 != null) out.push({ data: p.data, turno: 2, litros: Number(p.litros2) || 0 });
  }
  return out;
}

/** Comprador de uma saída do app: o primeiro destino que casar com `destinosApp`; senão null. */
export function compradorDaSaida(destinos: string[], compradores: Comprador[]): string | null {
  const norm = (t: string) => t.trim().toLowerCase();
  for (const d of destinos) {
    const c = compradores.find((x) => x.destinosApp.some((a) => norm(a) === norm(d)));
    if (c) return c.id;
  }
  return null;
}

// Posição de uma ordenha na linha do tempo: 2 por dia, manhã antes da tarde.
const REF = '2000-01-04'; // uma terça qualquer
const posicao = (data: string, turno: 1 | 2) => diasEntre(REF, data) * 2 + (turno - 1);

export interface Coleta {
  compradorId: string;
  /** Dia da coleta (depois da 1ª ordenha dele). */
  data: string;
  /** Terça da semana a que a coleta pertence (teto semanal). */
  semana: string;
  /** Primeira e última ordenha que esta coleta leva. */
  desde: { data: string; turno: 1 | 2 };
  ate: { data: string; turno: 1 | 2 };
  ordenhasEsperadas: number;
  ordenhasLancadas: number;
  produzido: number;
  /** Litros por ordenha nas ordenhas lançadas desta janela (para estimar o que falta). */
  mediaPorOrdenha: number | null;
  /** Ficou no tanque da coleta anterior. */
  sobraAnterior: number;
  tanque: number;
  /** O que cabe para o comprador: até o máximo dele e o que resta do teto da semana. */
  leva: number;
  /** Ficou no tanque depois desta coleta. */
  sobra: number;
  /** Tanque acima do máximo do comprador. */
  acimaDoMaximo: number;
  /** Tanque acima da capacidade física (leite que não caberia até a coleta). */
  acimaDaCapacidade: number;
  abaixoDoMinimo: boolean;
  /** A coleta ainda não aconteceu (a 1ª ordenha do dia não foi lançada). */
  aberta: boolean;
  /** Litros que o app registrou como Saída de Leite para este comprador neste dia. */
  saidaNoApp: number | null;
}

export interface SemanaDeColetas {
  inicio: string;
  coletas: Coleta[];
  produzido: number;
  vendido: number;
  acimaDoTeto: number;
  completa: boolean;
}

/**
 * Monta as coletas de `desde` até a primeira coleta ainda aberta depois de
 * `hoje`. Janela com ordenha faltando fica marcada (lançadas < esperadas) e
 * ZERA a sobra carregada: sem todas as ordenhas, não dá para saber o que
 * ficou no tanque.
 */
export function montarColetas(
  ordenhas: Ordenha[],
  saidas: SaidaDoApp[],
  compradores: Comprador[],
  teto: number,
  hoje: string,
  capacidade = 0,
): Coleta[] {
  if (ordenhas.length === 0 || compradores.length === 0) return [];
  const porPosicao = new Map<number, number>();
  for (const o of ordenhas) porPosicao.set(posicao(o.data, o.turno), (porPosicao.get(posicao(o.data, o.turno)) ?? 0) + o.litros);

  const primeiroDia = ordenhas.reduce((m, o) => (o.data < m ? o.data : m), ordenhas[0].data);
  // Uma semana antes da primeira ordenha, para a primeira janela ter começo.
  const inicio = somarDias(inicioDaSemana(primeiroDia), -7);
  const fim = somarDias(hoje, 7);

  const eventos: Array<{ comprador: Comprador; data: string; corte: number }> = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) {
    for (const c of compradores) if (diaDaSemana(d) === c.diaColeta) eventos.push({ comprador: c, data: d, corte: posicao(d, 1) });
  }
  // Mesmo dia: a ordem de prioridade decide quem leva primeiro.
  eventos.sort((a, b) => a.corte - b.corte || compradores.indexOf(a.comprador) - compradores.indexOf(b.comprador));

  const saidasPorChave = new Map<string, number>();
  for (const s of saidas) {
    const id = compradorDaSaida(s.destinos, compradores);
    if (id) saidasPorChave.set(`${id}|${s.data}`, (saidasPorChave.get(`${id}|${s.data}`) ?? 0) + s.litros);
  }

  const coletas: Coleta[] = [];
  const vendidoNaSemana = new Map<string, number>();
  let sobra = 0;
  let aberturaJaVista = false;
  for (let i = 1; i < eventos.length; i++) {
    const { comprador: c, data, corte } = eventos[i];
    const anterior = eventos[i - 1].corte;
    const esperadas = corte - anterior;
    let lancadas = 0;
    let produzido = 0;
    for (let pos = anterior + 1; pos <= corte; pos++) {
      const litros = porPosicao.get(pos);
      if (litros != null) {
        lancadas++;
        produzido += litros;
      }
    }
    const semAntes = somarDias(REF, Math.floor((anterior + 1) / 2));
    if (semAntes < primeiroDia && lancadas === 0) continue; // antes de haver lançamentos

    const aberta = data > hoje || (data === hoje && !porPosicao.has(corte));
    if (aberta && aberturaJaVista) break;
    if (aberta) aberturaJaVista = true;

    const semana = inicioDaSemana(data);
    const completa = lancadas === esperadas;
    const tanque = sobra + produzido;
    const restoTeto = Math.max(0, teto - (vendidoNaSemana.get(semana) ?? 0));
    const leva = Math.min(tanque, c.maxSemanal, restoTeto);
    vendidoNaSemana.set(semana, (vendidoNaSemana.get(semana) ?? 0) + leva);
    const sobraDepois = tanque - leva;

    const posDesde = anterior + 1;
    coletas.push({
      compradorId: c.id,
      data,
      semana,
      desde: { data: somarDias(REF, Math.floor(posDesde / 2)), turno: ((posDesde % 2) + 1) as 1 | 2 },
      ate: { data, turno: 1 },
      ordenhasEsperadas: esperadas,
      ordenhasLancadas: lancadas,
      produzido,
      mediaPorOrdenha: lancadas ? produzido / lancadas : null,
      sobraAnterior: sobra,
      tanque,
      leva,
      sobra: sobraDepois,
      acimaDoMaximo: Math.max(0, tanque - c.maxSemanal),
      acimaDaCapacidade: capacidade > 0 ? Math.max(0, tanque - capacidade) : 0,
      abaixoDoMinimo: leva + 1e-9 < c.minSemanal,
      aberta,
      saidaNoApp: saidasPorChave.get(`${c.id}|${data}`) ?? null,
    });
    // Sem todas as ordenhas não se sabe o que ficou: não carrega sobra inventada.
    sobra = completa && !aberta ? sobraDepois : 0;
  }
  return coletas;
}

/** Agrupa as coletas pela semana (terça a segunda), mais recente primeiro. */
export function agruparColetas(coletas: Coleta[], teto: number): SemanaDeColetas[] {
  const semanas = new Map<string, Coleta[]>();
  for (const c of coletas) semanas.set(c.semana, [...(semanas.get(c.semana) ?? []), c]);
  return [...semanas.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([inicio, cs]) => {
      const produzido = cs.reduce((t, c) => t + c.produzido, 0);
      const vendido = cs.reduce((t, c) => t + c.leva, 0);
      return {
        inicio,
        coletas: cs,
        produzido,
        vendido,
        acimaDoTeto: Math.max(0, produzido - teto),
        completa: cs.every((c) => c.ordenhasLancadas === c.ordenhasEsperadas && !c.aberta),
      };
    });
}
