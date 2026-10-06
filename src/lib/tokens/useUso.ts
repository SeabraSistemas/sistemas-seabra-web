'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { USO_VAZIO, baldesValidos, type Uso } from './uso';

/** Intervalo do polling automático; o botão de atualizar fura essa espera. */
export const POLLING_MS = 60_000;

export interface UsoLido {
  uso: Uso;
  /** Quando o painel buscou pela última vez (relógio deste aparelho); null antes da 1ª resposta. */
  buscadoEm: number | null;
  carregando: boolean;
  erro: boolean;
  atualizar: () => void;
}

/**
 * Lê /api/tokens. Busca ao abrir, a cada minuto com a aba visível, ao voltar para
 * a aba, e quando o usuário aperta "atualizar". Nunca empilha duas buscas: se uma
 * está em andamento, a outra espera por ela.
 */
export function useUso(): UsoLido {
  const [uso, setUso] = useState<Uso>(USO_VAZIO);
  const [buscadoEm, setBuscadoEm] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const emAndamento = useRef(false);

  const atualizar = useCallback(async () => {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setCarregando(true);
    try {
      const r = await fetch('/api/tokens', { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as Partial<Uso>;
      const horas = baldesValidos(j.horas);
      if (!horas) throw new Error('payload');
      setUso({ horas, coletadoEm: typeof j.coletadoEm === 'number' ? j.coletadoEm : null, maquinas: Number(j.maquinas) || 0 });
      setErro(false);
      setBuscadoEm(Date.now());
    } catch {
      // Mantém o último dado bom na tela e só avisa que a atualização falhou.
      setErro(true);
    } finally {
      emAndamento.current = false;
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // Adiado um tique: a 1ª busca mexe em estado e o effect não deve fazer isso de forma síncrona.
    const primeira = window.setTimeout(() => void atualizar(), 0);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void atualizar();
    }, POLLING_MS);
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void atualizar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearTimeout(primeira);
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [atualizar]);

  return { uso, buscadoEm, carregando, erro, atualizar: () => void atualizar() };
}
