/**
 * Produção de leite do Capril Sanri — puro (sem rede), testável.
 *
 * Modelo (balanço do tanque): a régua é medida UMA vez por dia, antes da
 * 1ª ordenha; depois disso só saem litros (Cabritinhos, Laticínio, Venda).
 * O leite ordenhado no dia D aparece na régua da manhã de D+1, então:
 *
 *   produção(D) = volume(D+1) − volume(D) + saídas(D)
 *
 * e a produção é sempre atribuída ao dia da ordenha (D), não ao da leitura.
 * A fórmula antiga do AppSheet subtraía o `total_dia` de ontem (não o volume)
 * e ignorava as saídas — por isso dava 11 L e −92,1 L em 24/09/2026.
 */
import { diaDe, parseNumber, parseText, somarDias } from '@/lib/painel/format';

export type DiaCompacto = number;

export const DESTINOS = [
  { chave: 'cabritinhos', nome: 'Cabritinhos', coluna: 'cabrtinho' },
  { chave: 'laticinio', nome: 'Laticínio', coluna: 'laticinio' },
  { chave: 'venda', nome: 'Venda', coluna: 'venda' },
] as const;

export type ChaveDestino = (typeof DESTINOS)[number]['chave'];

export function destinoPorChave(chave: string) {
  return DESTINOS.find((d) => d.chave === chave) ?? null;
}

export interface Usuario {
  email: string;
  nome: string | null;
  papel: string | null;
}

export interface Leitura {
  id: string;
  data: DiaCompacto;
  tanque: string;
  regua: string;
  litros: number | null;
  tanqueExtra: string | null;
  reguaExtra: string | null;
  litrosExtra: number | null;
  totalAnimais: number | null;
  obs: string | null;
}

export interface Saida {
  /** id da linha em producao_diaria — uma linha antiga do AppSheet pode ter mais de um destino. */
  id: string;
  data: DiaCompacto;
  destino: ChaveDestino;
  litros: number;
  obs: string | null;
}

/** tanque -> régua normalizada ("24.7") -> litros. */
export type TabelaRegua = Record<string, Record<string, number>>;

function toObjects(rows: string[][] | null): Record<string, string>[] {
  if (!rows || rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((col, i) => {
      obj[col.trim()] = row[i] ?? '';
    });
    return obj;
  });
}

/** "24.7", "24,7", " 24.70 " => "24.7". null se não for número. */
export function normalizarRegua(raw: string | null | undefined): string | null {
  const texto = parseText(raw);
  if (!texto) return null;
  const n = Number(texto.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n.toFixed(1) : null;
}

export function mapUsuarios(rows: string[][] | null): Usuario[] {
  return toObjects(rows)
    .map((r) => ({
      email: (parseText(r['Email']) ?? '').toLowerCase(),
      nome: parseText(r['Name']),
      papel: parseText(r['Role']),
    }))
    .filter((u) => u.email !== '');
}

export function mapTabelaRegua(rows: string[][] | null): TabelaRegua {
  const tabela: TabelaRegua = {};
  for (const r of toObjects(rows)) {
    const tanque = parseText(r['tanque']);
    const regua = normalizarRegua(r['regua']);
    const litros = parseNumber(r['litros']);
    if (!tanque || regua == null || litros == null) continue;
    (tabela[tanque] ??= {})[regua] = litros;
  }
  return tabela;
}

export function litrosDaRegua(tabela: TabelaRegua, tanque: string, regua: string): number | null {
  const chave = normalizarRegua(regua);
  if (chave == null) return null;
  return tabela[tanque]?.[chave] ?? null;
}

/**
 * Cada linha de producao_diaria vira uma leitura (se tiver régua) e/ou
 * saídas (uma por coluna cabrtinho/laticinio/venda preenchida). As linhas
 * gravadas pelo site são só uma coisa ou outra; as antigas do AppSheet
 * podem ter as duas.
 */
export function mapProducao(rows: string[][] | null): { leituras: Leitura[]; saidas: Saida[] } {
  const leituras: Leitura[] = [];
  const saidas: Saida[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['id']);
    const data = diaDe(r['data']);
    if (!id || data == null) continue;
    const obs = parseText(r['obs']);

    const tanque = parseText(r['tanque']);
    const regua = parseText(r['regua']);
    if (tanque && regua) {
      const reguaExtra = parseText(r['regua_extra']);
      const tanqueExtra = parseText(r['tanque_extra']);
      const temExtra = reguaExtra != null && tanqueExtra != null;
      leituras.push({
        id,
        data,
        tanque,
        regua,
        litros: parseNumber(r['regua_litros']),
        tanqueExtra: temExtra ? tanqueExtra : null,
        reguaExtra: temExtra ? reguaExtra : null,
        litrosExtra: temExtra ? parseNumber(r['regua_extra_litros']) : null,
        totalAnimais: parseNumber(r['total_animais']),
        obs,
      });
    }

    for (const d of DESTINOS) {
      const litros = parseNumber(r[d.coluna]);
      if (litros != null && litros !== 0) saidas.push({ id, data, destino: d.chave, litros, obs });
    }
  }
  return { leituras, saidas };
}

/** Volume total no tanque na leitura (tanque + extra). null se alguma régua não tiver litros. */
export function volumeDaLeitura(l: Leitura): number | null {
  if (l.litros == null) return null;
  if (l.reguaExtra == null) return l.litros;
  return l.litrosExtra == null ? null : l.litros + l.litrosExtra;
}

export type StatusDia = 'ok' | 'aguardando' | 'sem-leitura' | 'regua-invalida';

export interface DiaProducao {
  data: DiaCompacto;
  animais: number | null;
  volumeInicio: number | null;
  volumeFim: number | null;
  saidas: Record<ChaveDestino, number>;
  totalSaidas: number;
  producao: number | null;
  media: number | null;
  status: StatusDia;
}

function arred(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Última leitura de cada dia (ordem da planilha) — o formulário não deixa lançar duas, mas a planilha pode ter. */
export function leituraPorDia(leituras: Leitura[]): Map<DiaCompacto, Leitura> {
  const mapa = new Map<DiaCompacto, Leitura>();
  for (const l of leituras) mapa.set(l.data, l);
  return mapa;
}

/** Um registro por dia de ordenha (dias com leitura ou saída), do mais recente pro mais antigo. */
export function calcularProducao(leituras: Leitura[], saidas: Saida[]): DiaProducao[] {
  const porDia = leituraPorDia(leituras);
  const saidasPorDia = new Map<DiaCompacto, Record<ChaveDestino, number>>();
  for (const s of saidas) {
    const acc = saidasPorDia.get(s.data) ?? { cabritinhos: 0, laticinio: 0, venda: 0 };
    acc[s.destino] = arred(acc[s.destino] + s.litros);
    saidasPorDia.set(s.data, acc);
  }

  const dias = [...new Set([...porDia.keys(), ...saidasPorDia.keys()])].sort((a, b) => b - a);
  return dias.map((data) => {
    const inicio = porDia.get(data);
    const fim = porDia.get(somarDias(data, 1)!);
    const saidasDia = saidasPorDia.get(data) ?? { cabritinhos: 0, laticinio: 0, venda: 0 };
    const totalSaidas = arred(saidasDia.cabritinhos + saidasDia.laticinio + saidasDia.venda);
    const volumeInicio = inicio ? volumeDaLeitura(inicio) : null;
    const volumeFim = fim ? volumeDaLeitura(fim) : null;

    let status: StatusDia;
    let producao: number | null = null;
    if (!inicio) status = 'sem-leitura';
    else if (!fim) status = 'aguardando';
    else if (volumeInicio == null || volumeFim == null) status = 'regua-invalida';
    else {
      status = 'ok';
      producao = arred(volumeFim - volumeInicio + totalSaidas);
    }

    const animais = inicio?.totalAnimais ?? null;
    const media = producao != null && animais ? arred(producao / animais) : null;
    return { data, animais, volumeInicio, volumeFim, saidas: saidasDia, totalSaidas, producao, media, status };
  });
}
