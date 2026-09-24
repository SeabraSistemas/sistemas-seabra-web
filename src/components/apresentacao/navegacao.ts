'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Navegação compartilhada entre a tela de projeção (Deck) e a janela do
 * apresentador (Apresentador).
 *
 * A posição vive no hash da URL (#12): o link já abre no slide certo e o
 * refresh não perde o lugar. useSyncExternalStore lê o hash sem divergir do
 * HTML do servidor, que sempre desenha o slide 1.
 *
 * Entre janelas, um BroadcastChannel repete cada troca de slide e a tela
 * preta. Mensagem recebida nunca é reenviada — sem eco entre as duas. Quem
 * abre depois pergunta a posição ('ola') e adota a da janela que já estava lá.
 */

const EVENTO_HASH = 'deck:hash';

function assinarHash(avisar: () => void) {
  window.addEventListener('hashchange', avisar);
  window.addEventListener(EVENTO_HASH, avisar);
  return () => {
    window.removeEventListener('hashchange', avisar);
    window.removeEventListener(EVENTO_HASH, avisar);
  };
}

/** Índice (base 0) pedido pelo hash, ainda sem limitar ao total de slides. */
export function lerHash(): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}

type MensagemDeck =
  | { tipo: 'ir'; indice: number }
  | { tipo: 'apagar'; valor: boolean }
  | { tipo: 'ola' };

export function useNavegacao(total: number, canal: string) {
  const limitar = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);
  const indice = limitar(useSyncExternalStore(assinarHash, lerHash, () => 0));

  /** Tela preta (tecla B ou "."), como no PowerPoint — o botão de apagar do passador. */
  const [apagada, setApagadaLocal] = useState(false);
  /** A outra janela respondeu pelo canal pelo menos uma vez. */
  const [conectado, setConectado] = useState(false);

  const canalRef = useRef<BroadcastChannel | null>(null);
  const apagadaRef = useRef(apagada);
  useEffect(() => {
    apagadaRef.current = apagada;
  }, [apagada]);

  const irLocal = useCallback(
    (n: number) => {
      window.history.replaceState(null, '', `#${limitar(n) + 1}`);
      window.dispatchEvent(new Event(EVENTO_HASH));
    },
    [limitar]
  );

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(canal);
    canalRef.current = bc;
    bc.onmessage = (ev: MessageEvent<MensagemDeck>) => {
      const m = ev.data;
      setConectado(true);
      if (m.tipo === 'ir') irLocal(m.indice);
      else if (m.tipo === 'apagar') setApagadaLocal(m.valor);
      else if (m.tipo === 'ola') {
        bc.postMessage({ tipo: 'ir', indice: limitar(lerHash()) } satisfies MensagemDeck);
        bc.postMessage({ tipo: 'apagar', valor: apagadaRef.current } satisfies MensagemDeck);
      }
    };
    bc.postMessage({ tipo: 'ola' } satisfies MensagemDeck);
    return () => {
      bc.close();
      canalRef.current = null;
    };
  }, [canal, irLocal, limitar]);

  // Hash editado à mão (barra de endereço, voltar/avançar) também vale para a
  // outra janela. As trocas do próprio deck usam replaceState, que não
  // dispara hashchange — então isto não vira eco.
  useEffect(() => {
    function aoMudarHash() {
      canalRef.current?.postMessage({ tipo: 'ir', indice: limitar(lerHash()) } satisfies MensagemDeck);
    }
    window.addEventListener('hashchange', aoMudarHash);
    return () => window.removeEventListener('hashchange', aoMudarHash);
  }, [limitar]);

  const irPara = useCallback(
    (n: number) => {
      irLocal(n);
      canalRef.current?.postMessage({ tipo: 'ir', indice: limitar(n) } satisfies MensagemDeck);
    },
    [irLocal, limitar]
  );
  const proximo = useCallback(() => irPara(limitar(lerHash()) + 1), [irPara, limitar]);
  const anterior = useCallback(() => irPara(limitar(lerHash()) - 1), [irPara, limitar]);

  const setApagada = useCallback((valor: boolean) => {
    setApagadaLocal(valor);
    canalRef.current?.postMessage({ tipo: 'apagar', valor } satisfies MensagemDeck);
  }, []);

  return { indice, irPara, proximo, anterior, apagada, setApagada, conectado };
}

interface AcoesTeclado {
  proximo: () => void;
  anterior: () => void;
  primeiro: () => void;
  ultimo: () => void;
  apagada: boolean;
  setApagada: (valor: boolean) => void;
  telaCheia: () => void;
  /** Teclas próprias de cada janela. Devolve true se tratou a tecla. */
  extra?: (e: KeyboardEvent) => boolean;
}

/**
 * Teclado e passador de slides. Passadores mandam PageDown/PageUp (alguns,
 * setas), "." ou B para apagar a tela e F5 para "iniciar apresentação" —
 * que aqui vira tela cheia em vez de recarregar a página.
 */
export function useTecladoDeck(acoes: AcoesTeclado) {
  const { proximo, anterior, primeiro, ultimo, apagada, setApagada, telaCheia, extra } = acoes;
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const alvo = e.target instanceof HTMLElement ? e.target : null;
      if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return;
      // Espaço e Enter num botão focado são do botão.
      if ((e.key === ' ' || e.key === 'Enter') && alvo?.closest('button, a')) return;
      if (extra?.(e)) return;

      const navegar = (acao: () => void) => {
        e.preventDefault();
        // Com a tela apagada, a primeira tecla só acende — não pula slide.
        if (apagada) setApagada(false);
        else acao();
      };

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case 'Enter':
          navegar(proximo);
          break;
        case ' ':
          navegar(e.shiftKey ? anterior : proximo);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          navegar(anterior);
          break;
        case 'Home':
          navegar(primeiro);
          break;
        case 'End':
          navegar(ultimo);
          break;
        case 'f':
        case 'F':
        case 'F5':
          e.preventDefault();
          telaCheia();
          break;
        case 'b':
        case 'B':
        case '.':
          setApagada(!apagada);
          break;
        case 'Escape':
          setApagada(false);
          break;
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [anterior, apagada, extra, primeiro, proximo, setApagada, telaCheia, ultimo]);
}

/* ── Tela cheia ─────────────────────────────────────────────────────────── */

type DocumentoWebkit = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type ElementoWebkit = HTMLElement & { webkitRequestFullscreen?: () => void };

function assinarTelaCheia(avisar: () => void) {
  document.addEventListener('fullscreenchange', avisar);
  document.addEventListener('webkitfullscreenchange', avisar);
  return () => {
    document.removeEventListener('fullscreenchange', avisar);
    document.removeEventListener('webkitfullscreenchange', avisar);
  };
}

function lerTelaCheia(): boolean {
  const doc = document as DocumentoWebkit;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

export function useTelaCheia(): boolean {
  return useSyncExternalStore(assinarTelaCheia, lerTelaCheia, () => false);
}

export function alternarTelaCheia() {
  const doc = document as DocumentoWebkit;
  if (lerTelaCheia()) {
    if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
    else doc.webkitExitFullscreen?.();
    return;
  }
  const raiz = document.documentElement as ElementoWebkit;
  if (raiz.requestFullscreen) raiz.requestFullscreen().catch(() => {});
  else raiz.webkitRequestFullscreen?.();
}

/* ── Dois monitores (Window Management API, Chrome/Edge) ───────────────── */

interface TelaDetalhada {
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
}
type JanelaComTelas = Window & {
  getScreenDetails?: () => Promise<{ screens: TelaDetalhada[]; currentScreen: TelaDetalhada }>;
};

/**
 * Com monitor estendido, põe a projeção em tela cheia no OUTRO monitor e abre
 * a janela do apresentador neste — os dois com a mesma tecla, como o
 * PowerPoint. Na primeira vez o Chrome pede permissão para "gerenciar
 * janelas"; a espera pela resposta gasta o gesto do usuário, então pode ser
 * preciso apertar P de novo. Sem a API (Safari, Firefox) ou sem segundo
 * monitor, só abre a janela: a tela cheia fica no F da projeção.
 *
 * Devolve false se o navegador bloqueou a janela.
 */
export async function abrirApresentador(url: string): Promise<boolean> {
  const NOME = 'deck-apresentador';
  const estendida = (window.screen as Screen & { isExtended?: boolean }).isExtended;
  const janela = window as JanelaComTelas;

  if (estendida && janela.getScreenDetails) {
    try {
      const detalhes = await janela.getScreenDetails();
      const atual = detalhes.currentScreen;
      const projetor = detalhes.screens.find((tela) => tela !== atual);
      if (projetor) {
        await document.documentElement.requestFullscreen({ screen: projetor } as FullscreenOptions);
        const aberta = window.open(
          url,
          NOME,
          `popup,left=${atual.availLeft},top=${atual.availTop},width=${atual.availWidth},height=${atual.availHeight}`
        );
        if (aberta) return true;
      }
    } catch {
      // Permissão negada ou gesto expirado: cai na janela simples.
    }
  }

  return Boolean(window.open(url, NOME, 'popup,width=1440,height=900'));
}
