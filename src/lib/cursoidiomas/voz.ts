'use client';

import { useSyncExternalStore } from 'react';

/**
 * Leitura em voz alta via Web Speech API (speechSynthesis) — nativa do
 * navegador, sem serviço externo. No macOS/iOS o Safari e o Chrome trazem
 * vozes de alemão e francês de fábrica; no Chrome de outros sistemas as vozes
 * do Google chegam por rede após o primeiro uso.
 */
const PREFERIDAS: Record<string, string[]> = {
  'de-DE': ['Anna', 'Petra', 'Helena', 'Markus', 'Google Deutsch'],
  'fr-FR': ['Amélie', 'Amelie', 'Thomas', 'Audrey', 'Aurélie', 'Google français'],
  'en-US': ['Samantha', 'Ava', 'Allison', 'Alex', 'Google US English'],
};

const CHAVE_LENTO = 'cursoidiomas:voz-lenta';

export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * null no servidor e durante a hidratação (ainda não se sabe); depois true/false.
 * Três estados para que o HTML do servidor não mostre "sem síntese de voz"
 * num navegador que tem — o aviso só aparece quando o cliente confirma.
 */
export function useVozDisponivel(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => vozDisponivel(),
    () => null,
  );
}

function escolherVoz(lang: string): SpeechSynthesisVoice | null {
  const vozes = window.speechSynthesis.getVoices();
  const daLingua = vozes.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (daLingua.length === 0) return null;
  const preferidas = PREFERIDAS[lang] ?? [];
  for (const nome of preferidas) {
    const v = daLingua.find((x) => x.name.toLowerCase().includes(nome.toLowerCase()));
    if (v) return v;
  }
  const exata = daLingua.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
  return exata ?? daLingua[0];
}

// ── Preferência "áudio lento" — mini store para useSyncExternalStore ──
const ouvintesLento = new Set<() => void>();

export function lerLento(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_LENTO) === '1';
  } catch {
    return false;
  }
}

export function gravarLento(valor: boolean) {
  try {
    window.localStorage.setItem(CHAVE_LENTO, valor ? '1' : '0');
  } catch {
    // modo privado: fica só nesta página
  }
  ouvintesLento.forEach((cb) => cb());
}

export function useVozLenta(): boolean {
  return useSyncExternalStore(
    (cb) => {
      ouvintesLento.add(cb);
      return () => ouvintesLento.delete(cb);
    },
    lerLento,
    () => false,
  );
}

/** Fala o texto na língua indicada. Devolve false se o navegador não suportar. */
export function falar(texto: string, lang: string, opcoes?: { lento?: boolean }): boolean {
  if (!vozDisponivel()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = lang;
  const voz = escolherVoz(lang);
  if (voz) u.voice = voz;
  const lento = opcoes?.lento ?? lerLento();
  u.rate = lento ? 0.7 : 0.92;
  synth.speak(u);
  return true;
}

/** Garante que a lista de vozes esteja carregada (Chrome popula de forma assíncrona). */
export function aquecerVozes() {
  if (!vozDisponivel()) return;
  const synth = window.speechSynthesis;
  if (synth.getVoices().length === 0) {
    synth.addEventListener('voiceschanged', () => synth.getVoices(), { once: true });
  }
}
