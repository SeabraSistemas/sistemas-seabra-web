/**
 * "Dias sem manejo" (21/09/2026) — motor puro por trás da página
 * `/FI_FCG/monitorar` (animais ativos há muitos dias sem nenhum evento
 * registrado).
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

/** Não está na venda/baixa — mesmo critério de `vivo()` em RebanhoView.tsx / engorda.ts / custoFormacao.ts. Só animal ATIVO entra no monitoramento — vendido/baixado não precisa mais de manejo. */
function vivo(a: RegRebanho): boolean {
  return a.categoria !== 'Venda' && a.categoria !== 'Baixa';
}

export interface AnimalMonitorado {
  id: string;
  fazenda: string | null;
  categoria: string | null;
  sexo: string | null;
  /** Data de nascimento (RebanhoProd) — pra idade exata em anos/meses/dias, ver idadeQuebrada em lib/painel/format.ts. */
  nascimento: DiaCompacto | null;
  /** null = nenhum evento conhecido (nunca apareceu em Pesagem/Toque/IATF/Parto-como-mãe) — "sem dado", nunca "0 dias". */
  diasSemManejo: number | null;
  /** Data do último evento em si (pra mostrar "Último manejo: dd/mm/aaaa" ao lado dos dias). */
  ultimoManejo: DiaCompacto | null;
}

/** Só os animais ATIVOS (ver `vivo`), um por linha, pronto pra empacotar e mandar pro cliente da página Monitorar. */
export function animaisMonitorados(
  rebanho: RegRebanho[],
  pesagem: RegPesagem[],
  toque: RegToque[],
  iatf: RegIatf[],
  partos: RegParto[],
  hoje: DiaCompacto,
): AnimalMonitorado[] {
  const ultimoManejo = ultimoManejoPorAnimal(pesagem, toque, iatf, partos);
  return rebanho.filter(vivo).map((a) => {
    const ultimo = ultimoManejo.get(a.id) ?? null;
    return {
      id: a.id,
      fazenda: a.fazenda,
      categoria: a.categoria,
      sexo: a.sexo,
      nascimento: a.nascimento,
      diasSemManejo: diasEntre(ultimo, hoje),
      ultimoManejo: ultimo,
    };
  });
}
