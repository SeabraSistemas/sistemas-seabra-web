'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, NotebookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import './deck.css';

export interface DeckSlide {
  id: string;
  /** Título curto — aparece nas notas e no leitor de tela. */
  titulo: string;
  notas?: string;
  /** O slide já renderizado no servidor. */
  conteudo: ReactNode;
}

interface DeckProps {
  titulo: string;
  slides: DeckSlide[];
}

const LARGURA = 1920;
const ALTURA = 1080;
/** Sem mexer o mouse por este tempo, setas e cursor somem da projeção. */
const OCIOSO_MS = 2500;
/** Deslocamento mínimo, em px, para um arrasto no celular virar troca de slide. */
const SWIPE_MIN = 50;

/* ── Estado que mora fora do React ────────────────────────────────────────
   A posição vive no hash da URL (#12): o link já abre no slide certo e o
   refresh não perde o lugar. useSyncExternalStore lê o hash sem divergir do
   HTML do servidor, que sempre desenha o slide 1. */

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
function lerHash(): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}

function assinarResize(avisar: () => void) {
  window.addEventListener('resize', avisar);
  return () => window.removeEventListener('resize', avisar);
}

function lerEscala(): number {
  return Math.min(window.innerWidth / LARGURA, window.innerHeight / ALTURA);
}

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

function alternarTelaCheia() {
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

const semAssinatura = () => () => {};

/** Clique nestes elementos é do próprio elemento — não avança o slide. */
const INTERATIVO = 'button, a, input, select, textarea, label, [data-deck-interativo]';

export function Deck({ titulo, slides }: DeckProps) {
  const total = slides.length;
  const limitar = useCallback(
    (n: number) => Math.max(0, Math.min(total - 1, n)),
    [total]
  );

  const indice = limitar(useSyncExternalStore(assinarHash, lerHash, () => 0));
  const escala = useSyncExternalStore(assinarResize, lerEscala, () => 1);
  const telaCheia = useSyncExternalStore(assinarTelaCheia, lerTelaCheia, () => false);
  const montado = useSyncExternalStore(semAssinatura, () => true, () => false);

  const [notasAbertas, setNotasAbertas] = useState(false);
  /** Tela preta (tecla B ou "."), como no PowerPoint — o botão de apagar do passador. */
  const [apagada, setApagada] = useState(false);

  const raizRef = useRef<HTMLDivElement>(null);
  const toqueRef = useRef<{ x: number; y: number } | null>(null);

  const irPara = useCallback(
    (n: number) => {
      window.history.replaceState(null, '', `#${limitar(n) + 1}`);
      window.dispatchEvent(new Event(EVENTO_HASH));
    },
    [limitar]
  );
  const proximo = useCallback(() => irPara(limitar(lerHash()) + 1), [irPara, limitar]);
  const anterior = useCallback(() => irPara(limitar(lerHash()) - 1), [irPara, limitar]);

  // Teclado e passador de slides. Passadores mandam PageDown/PageUp (alguns,
  // setas), "." ou B para apagar a tela e F5 para "iniciar apresentação" —
  // que aqui vira tela cheia em vez de recarregar a página.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const alvo = e.target instanceof HTMLElement ? e.target : null;
      if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return;
      // Espaço e Enter num botão focado são do botão.
      if ((e.key === ' ' || e.key === 'Enter') && alvo?.closest('button, a')) return;

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
          navegar(() => irPara(0));
          break;
        case 'End':
          navegar(() => irPara(total - 1));
          break;
        case 'f':
        case 'F':
        case 'F5':
          e.preventDefault();
          alternarTelaCheia();
          break;
        case 'n':
        case 'N':
          setNotasAbertas((v) => !v);
          break;
        case 'b':
        case 'B':
        case '.':
          setApagada((v) => !v);
          break;
        case 'Escape':
          setNotasAbertas(false);
          setApagada(false);
          break;
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [apagada, anterior, irPara, proximo, total]);

  // Cursor e setas somem com o mouse parado. Direto no DOM, sem estado do
  // React: re-renderizar o deck inteiro a cada mousemove seria desperdício.
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    let timer: number | undefined;
    const adormecer = () => raiz.setAttribute('data-ocioso', '');
    const acordar = () => {
      raiz.removeAttribute('data-ocioso');
      window.clearTimeout(timer);
      timer = window.setTimeout(adormecer, OCIOSO_MS);
    };
    adormecer();
    raiz.addEventListener('mousemove', acordar);
    raiz.addEventListener('touchstart', acordar, { passive: true });
    return () => {
      raiz.removeEventListener('mousemove', acordar);
      raiz.removeEventListener('touchstart', acordar);
      window.clearTimeout(timer);
    };
  }, []);

  // Liga a transição dois quadros depois de montar — já com o slide do hash
  // na tela.
  useEffect(() => {
    let segundo = 0;
    const primeiro = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => raizRef.current?.setAttribute('data-animar', ''));
    });
    return () => {
      cancelAnimationFrame(primeiro);
      cancelAnimationFrame(segundo);
    };
  }, []);

  function aoClicar(e: MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest(`${INTERATIVO}, .deck-notas`)) return;
    if (apagada) setApagada(false);
    else proximo();
  }

  function aoTocar(e: TouchEvent<HTMLDivElement>) {
    const t = e.touches[0];
    toqueRef.current = t ? { x: t.clientX, y: t.clientY } : null;
  }

  function aoSoltar(e: TouchEvent<HTMLDivElement>) {
    const inicio = toqueRef.current;
    const t = e.changedTouches[0];
    toqueRef.current = null;
    if (!inicio || !t) return;
    const dx = t.clientX - inicio.x;
    const dy = t.clientY - inicio.y;
    // Arrasto curto ou mais vertical que horizontal não é troca de slide.
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) proximo();
    else anterior();
  }

  const atual = slides[indice];
  const seguinte = slides[indice + 1];

  return (
    <div
      ref={raizRef}
      className="deck-raiz"
      data-montado={montado || undefined}
      role="region"
      aria-roledescription="apresentação"
      aria-label={titulo}
      onClick={aoClicar}
      onTouchStart={aoTocar}
      onTouchEnd={aoSoltar}
    >
      <div className="deck-palco" style={{ '--deck-escala': escala } as CSSProperties}>
        {slides.map((slide, i) => (
          <section
            key={slide.id}
            className="deck-slide"
            data-ativo={i === indice || undefined}
            aria-hidden={i !== indice}
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}: ${slide.titulo}`}
          >
            <div className="deck-tela-slide">{slide.conteudo}</div>
          </section>
        ))}

        {indice > 0 && (
          <div className="deck-so-tela" aria-hidden>
            <div className="deck-progresso">
              <span style={{ transform: `scaleX(${(indice + 1) / total})` }} />
            </div>
            <div className="deck-numero">
              {indice + 1} / {total}
            </div>
          </div>
        )}
      </div>

      {/* Anúncio para leitor de tela a cada troca. */}
      <p className="sr-only" aria-live="polite">
        Slide {indice + 1} de {total}: {atual?.titulo}
      </p>

      <BotaoSeta lado="esquerda" onClick={anterior} desabilitado={indice === 0} />
      <BotaoSeta lado="direita" onClick={proximo} desabilitado={indice === total - 1} />

      <div className="deck-so-tela deck-controle fixed right-4 top-4 z-30 flex gap-2">
        <BotaoRedondo
          rotulo={notasAbertas ? 'Ocultar notas (N)' : 'Mostrar notas (N)'}
          ativo={notasAbertas}
          onClick={() => setNotasAbertas((v) => !v)}
        >
          <NotebookText className="size-5" />
        </BotaoRedondo>
        <BotaoRedondo
          rotulo={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          onClick={alternarTelaCheia}
        >
          {telaCheia ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </BotaoRedondo>
      </div>

      {notasAbertas && atual && (
        <aside
          className="deck-so-tela deck-notas fixed inset-x-0 bottom-0 z-40 max-h-[42vh] select-text overflow-y-auto border-t border-border bg-card/95 px-8 py-6 backdrop-blur"
          aria-label="Notas do apresentador"
        >
          <div className="flex items-baseline justify-between gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground tabular-nums">
                {indice + 1} / {total}
              </strong>
              <span className="mx-2">·</span>
              {atual.titulo}
            </span>
            <span>N fecha</span>
          </div>
          <p className="mt-3 max-w-5xl whitespace-pre-line text-xl leading-relaxed text-foreground">
            {atual.notas ?? 'Sem notas para este slide.'}
          </p>
          {seguinte && (
            <p className="mt-4 text-sm text-muted-foreground">Próximo: {seguinte.titulo}</p>
          )}
        </aside>
      )}

      {apagada && <div className="deck-so-tela fixed inset-0 z-50 bg-black" aria-hidden />}
    </div>
  );
}

function BotaoSeta({
  lado,
  onClick,
  desabilitado,
}: {
  lado: 'esquerda' | 'direita';
  onClick: () => void;
  desabilitado: boolean;
}) {
  const Icone = lado === 'esquerda' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      // Sem roubar o foco: espaço e setas continuam indo para o deck.
      onMouseDown={(e) => e.preventDefault()}
      disabled={desabilitado}
      aria-label={lado === 'esquerda' ? 'Slide anterior (←)' : 'Próximo slide (→)'}
      title={lado === 'esquerda' ? 'Slide anterior (←)' : 'Próximo slide (→)'}
      className={cn(
        'deck-so-tela deck-controle fixed top-1/2 z-30 flex size-14 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-white/10 bg-black/55 text-foreground/80 backdrop-blur hover:bg-black/75 hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-0',
        lado === 'esquerda' ? 'left-4' : 'right-4'
      )}
    >
      <Icone className="size-7" />
    </button>
  );
}

function BotaoRedondo({
  rotulo,
  ativo,
  onClick,
  children,
}: {
  rotulo: string;
  ativo?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={rotulo}
      aria-pressed={ativo}
      title={rotulo}
      className={cn(
        'flex size-11 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur',
        'text-foreground/80 hover:bg-black/75 hover:text-foreground',
        ativo && 'border-primary/60 text-primary'
      )}
    >
      {children}
    </button>
  );
}
