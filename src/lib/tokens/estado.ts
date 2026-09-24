import { useMemo, useSyncExternalStore } from 'react';
import { DIA_MS, ESTADO_INICIAL, type Estado, type Leitura } from './ciclo';

/*
 * O /tokens guarda tudo no localStorage deste navegador — é ferramenta de uma
 * pessoa só e não tem dado sensível, então não vale uma tabela. O preço é não
 * sincronizar entre aparelhos. Sem localStorage (aba privada), segue na memória.
 */

const CHAVE = 'seabra:tokens:v1';
const EVENTO = 'seabra:tokens';
/** Leituras mais velhas que isto saem na próxima gravação — o painel só olha o ciclo atual. */
const GUARDAR_MS = 42 * DIA_MS;

let memoria: string | null = null;

function ler(): string | null {
  try {
    return window.localStorage.getItem(CHAVE) ?? memoria;
  } catch {
    return memoria;
  }
}

function assinar(avisar: () => void) {
  window.addEventListener('storage', avisar);
  window.addEventListener(EVENTO, avisar);
  return () => {
    window.removeEventListener('storage', avisar);
    window.removeEventListener(EVENTO, avisar);
  };
}

const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function interpretar(bruto: string | null): Estado {
  if (!bruto) return ESTADO_INICIAL;
  try {
    const o = JSON.parse(bruto) as Record<string, unknown>;
    const leituras = Array.isArray(o.leituras) ? (o.leituras as Record<string, unknown>[]) : [];
    return {
      resetDiaSemana: numero(o.resetDiaSemana) ?? ESTADO_INICIAL.resetDiaSemana,
      resetHora: numero(o.resetHora) ?? ESTADO_INICIAL.resetHora,
      resetExtra: numero(o.resetExtra),
      proximoManual: numero(o.proximoManual),
      leituras: leituras
        .filter((l) => numero(l?.t) != null && numero(l?.pct) != null)
        .map((l) => ({ t: l.t as number, pct: l.pct as number })),
    };
  } catch {
    return ESTADO_INICIAL;
  }
}

function gravar(estado: Estado) {
  const corte = Date.now() - GUARDAR_MS;
  const leituras: Leitura[] = estado.leituras.filter((l) => l.t >= corte).sort((a, b) => a.t - b.t);
  const texto = JSON.stringify({ ...estado, leituras });
  memoria = texto;
  try {
    window.localStorage.setItem(CHAVE, texto);
  } catch {
    // Sem armazenamento: fica só na memória desta aba.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function alterarEstado(mudar: (e: Estado) => Estado) {
  gravar(mudar(interpretar(ler())));
}

/** `null` até hidratar — no servidor não há localStorage. */
export function useEstadoTokens(): Estado | null {
  const bruto = useSyncExternalStore(assinar, ler, () => undefined);
  return useMemo(() => (bruto === undefined ? null : interpretar(bruto)), [bruto]);
}

/* Relógio: avança de 15 em 15 s (basta para contagem regressiva em minutos)
   e também a cada gravação — senão uma leitura ou reset feito agora ficaria
   "no futuro" do último tique e só entraria na conta no tique seguinte. Entre
   um aviso e outro o snapshot é o mesmo número, como useSyncExternalStore pede. */
const PASSO_MS = 15_000;
let relogio = 0;

function assinarRelogio(avisar: () => void) {
  const tique = () => {
    relogio = Date.now();
    avisar();
  };
  relogio = Date.now();
  const id = window.setInterval(tique, PASSO_MS);
  document.addEventListener('visibilitychange', tique);
  window.addEventListener(EVENTO, tique);
  window.addEventListener('storage', tique);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', tique);
    window.removeEventListener(EVENTO, tique);
    window.removeEventListener('storage', tique);
  };
}

/** 0 até hidratar. */
export function useAgora(): number {
  return useSyncExternalStore(assinarRelogio, () => relogio, () => 0);
}
