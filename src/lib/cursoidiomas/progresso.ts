'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

/**
 * Progresso do aluno, guardado no localStorage do navegador — o curso é
 * interno, para duas pessoas, e não vale uma tabela no Supabase do app.
 * A chave inclui o e-mail para que dois alunos no mesmo computador não
 * misturem os checks. Limitação assumida: o progresso não sincroniza entre
 * dispositivos.
 */
const PREFIXO = 'cursoidiomas:v1:';

export interface RegistroLicao {
  /** ISO 8601 de quando foi marcada como concluída. */
  em: string;
  acertos?: number;
  total?: number;
}

export interface Progresso {
  concluidas: Record<string, RegistroLicao>;
}

const VAZIO: Progresso = { concluidas: {} };
const ouvintes = new Set<() => void>();
const cache = new Map<string, Progresso>();

function chaveStorage(email: string) {
  return `${PREFIXO}${email.toLowerCase()}`;
}

function ler(email: string): Progresso {
  const k = chaveStorage(email);
  const emCache = cache.get(k);
  if (emCache) return emCache;
  let valor: Progresso = VAZIO;
  try {
    const bruto = window.localStorage.getItem(k);
    if (bruto) {
      const parsed = JSON.parse(bruto) as Partial<Progresso>;
      if (parsed && typeof parsed === 'object' && parsed.concluidas && typeof parsed.concluidas === 'object') {
        valor = { concluidas: parsed.concluidas };
      }
    }
  } catch {
    valor = VAZIO;
  }
  cache.set(k, valor);
  return valor;
}

function gravar(email: string, valor: Progresso) {
  const k = chaveStorage(email);
  cache.set(k, valor);
  try {
    window.localStorage.setItem(k, JSON.stringify(valor));
  } catch {
    // modo privado / cota cheia: o estado em memória ainda vale nesta sessão
  }
  ouvintes.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  ouvintes.add(cb);
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(PREFIXO)) {
      cache.delete(e.key);
      cb();
    }
  };
  window.addEventListener('storage', aoMudarStorage);
  return () => {
    ouvintes.delete(cb);
    window.removeEventListener('storage', aoMudarStorage);
  };
}

export const ProgressoContext = createContext<string>('');

export function useProgresso() {
  const email = useContext(ProgressoContext);
  const progresso = useSyncExternalStore(
    subscribe,
    () => (email ? ler(email) : VAZIO),
    () => VAZIO,
  );

  const marcar = useCallback(
    (chave: string, registro?: Omit<RegistroLicao, 'em'>) => {
      if (!email) return;
      const atual = ler(email);
      gravar(email, {
        concluidas: { ...atual.concluidas, [chave]: { em: new Date().toISOString(), ...registro } },
      });
    },
    [email],
  );

  const desmarcar = useCallback(
    (chave: string) => {
      if (!email) return;
      const atual = ler(email);
      const { [chave]: _removida, ...resto } = atual.concluidas;
      void _removida;
      gravar(email, { concluidas: resto });
    },
    [email],
  );

  return { progresso, marcar, desmarcar };
}

export function contarConcluidas(progresso: Progresso, chaves: string[]): number {
  return chaves.reduce((n, k) => (progresso.concluidas[k] ? n + 1 : n), 0);
}
