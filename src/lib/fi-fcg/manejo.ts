/**
 * "Dias sem manejo" (21/09/2026) — monitoramento de animais que ficaram
 * muitos dias sem nenhum evento registrado.
 *
 * A RebanhoProd tem colunas prontas (`ultimo_manejo`/`ultimo_manejo_dias`),
 * mas achadas ao vivo (21/09/2026) com dois problemas: cobertura baixa (só
 * 2.354 dos 5.477 vivos têm `ultimo_manejo`, 1.693 têm o campo de dias) e
 * congeladas — um animal com manejo em 03/11/2025 marcava "15 dias" quando
 * já eram ~322 (o AppSheet parou de recalcular essa coluna). Em vez de usar
 * essas colunas, este módulo deriva o último manejo diretamente dos eventos
 * que o dashboard já lê — Pesagem, Toque, IATF (Reprodução) e Parto (como
 * MÃE, via `ID Mãe`) — cobrindo qualquer animal que já apareceu em algum
 * desses, sempre recalculado contra `hoje`, nunca congelado.
 */
import { diasEntre } from '@/lib/painel/format';
import type { DiaCompacto, RegIatf, RegParto, RegPesagem, RegRebanho, RegToque } from './types';

function maisRecentePorId<T>(
  linhas: T[],
  idDe: (r: T) => string | null,
  dataDe: (r: T) => DiaCompacto | null,
): Map<string, DiaCompacto> {
  const mapa = new Map<string, DiaCompacto>();
  for (const linha of linhas) {
    const id = idDe(linha);
    const dia = dataDe(linha);
    if (!id || dia == null) continue;
    const atual = mapa.get(id);
    if (atual == null || dia > atual) mapa.set(id, dia);
  }
  return mapa;
}

function combinar(mapas: Map<string, DiaCompacto>[]): Map<string, DiaCompacto> {
  const resultado = new Map<string, DiaCompacto>();
  for (const mapa of mapas) {
    for (const [id, dia] of mapa) {
      const atual = resultado.get(id);
      if (atual == null || dia > atual) resultado.set(id, dia);
    }
  }
  return resultado;
}

/** Data do último manejo conhecido de cada animal — o mais recente entre Pesagem, Toque, IATF e (se fêmea) o próprio Parto como mãe. */
export function ultimoManejoPorAnimal(
  pesagem: RegPesagem[],
  toque: RegToque[],
  iatf: RegIatf[],
  partos: RegParto[],
): Map<string, DiaCompacto> {
  return combinar([
    maisRecentePorId(pesagem, (r) => r.id, (r) => r.data),
    maisRecentePorId(toque, (r) => r.id, (r) => r.data),
    maisRecentePorId(iatf, (r) => r.id, (r) => r.data),
    maisRecentePorId(partos, (r) => r.idMae, (r) => r.nascimento),
  ]);
}

export interface ManejoAnimal {
  id: string;
  /** null = nenhum evento conhecido (nunca apareceu em Pesagem/Toque/IATF/Parto-como-mãe) — não é "0 dias", é "sem dado". */
  diasSemManejo: number | null;
}

/** Uma linha por animal do rebanho (mesmo universo de `getRebanho`), pronta pra empacotar e mandar pro cliente. */
export function calcularDiasSemManejo(
  rebanho: RegRebanho[],
  pesagem: RegPesagem[],
  toque: RegToque[],
  iatf: RegIatf[],
  partos: RegParto[],
  hoje: DiaCompacto,
): ManejoAnimal[] {
  const ultimoManejo = ultimoManejoPorAnimal(pesagem, toque, iatf, partos);
  return rebanho.map((a) => ({
    id: a.id,
    diasSemManejo: diasEntre(ultimoManejo.get(a.id) ?? null, hoje),
  }));
}
