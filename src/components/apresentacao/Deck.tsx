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
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  abrirApresentador,
  alternarTelaCheia,
  useNavegacao,
  useTecladoDeck,
  useTelaCheia,
} from './navegacao';
import './deck.css';

export interface DeckSlide {
  id: string;
  /** Título curto — vai para o leitor de tela. */
  titulo: string;
  /** O slide já renderizado no servidor. */
  conteudo: ReactNode;
}

interface DeckProps {
  titulo: string;
  slides: DeckSlide[];
  /** Nome do BroadcastChannel compartilhado com a janela do apresentador. */
  canal: string;
  /** Rota da janela do apresentador (tecla P). */
  rotaApresentador?: string;
}

const LARGURA = 1920;
const ALTURA = 1080;
/** Sem mexer o mouse por este tempo, setas e cursor somem da projeção. */
const OCIOSO_MS = 2500;
/** Deslocamento mínimo, em px, para um arrasto no celular virar troca de slide. */
const SWIPE_MIN = 50;

function assinarResize(avisar: () => void) {
  window.addEventListener('resize', avisar);
  return () => window.removeEventListener('resize', avisar);
}

function lerEscala(): number {
  return Math.min(window.innerWidth / LARGURA, window.innerHeight / ALTURA);
}

const semAssinatura = () => () => {};

/** Clique nestes elementos é do próprio elemento — não avança o slide. */
const INTERATIVO = 'button, a, input, select, textarea, label, [data-deck-interativo]';

/**
 * A tela de projeção: só o slide, as setas (somem com o mouse parado) e o
 * botão de tela cheia. Notas e cronômetro ficam na janela do apresentador
 * (tecla P), que o público não vê.
 */
export function Deck({ titulo, slides, canal, rotaApresentador }: DeckProps) {
  const total = slides.length;
  const { indice, irPara, proximo, anterior, apagada, setApagada } = useNavegacao(total, canal);
  const escala = useSyncExternalStore(assinarResize, lerEscala, () => 1);
  const telaCheia = useTelaCheia();
  const montado = useSyncExternalStore(semAssinatura, () => true, () => false);
  /** O navegador barrou a janela do apresentador: oferece um botão (gesto novo). */
  const [bloqueada, setBloqueada] = useState(false);

  const raizRef = useRef<HTMLDivElement>(null);
  const toqueRef = useRef<{ x: number; y: number } | null>(null);

  const urlApresentador = useCallback(
    () => `${rotaApresentador}#${window.location.hash.slice(1) || '1'}`,
    [rotaApresentador]
  );

  const iniciarApresentador = useCallback(async () => {
    if (!rotaApresentador) return;
    const abriu = await abrirApresentador(urlApresentador());
    setBloqueada(!abriu);
  }, [rotaApresentador, urlApresentador]);

  const teclaExtra = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'p' && e.key !== 'P') return false;
      e.preventDefault();
      void iniciarApresentador();
      return true;
    },
    [iniciarApresentador]
  );

  const primeiro = useCallback(() => irPara(0), [irPara]);
  const ultimo = useCallback(() => irPara(total - 1), [irPara, total]);

  useTecladoDeck({
    proximo,
    anterior,
    primeiro,
    ultimo,
    apagada,
    setApagada,
    telaCheia: alternarTelaCheia,
    extra: teclaExtra,
  });

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

  // Liga transições e animações dois quadros depois de montar — já com o
  // slide do hash na tela.
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
    if (e.target instanceof Element && e.target.closest(INTERATIVO)) return;
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
          rotulo={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          onClick={alternarTelaCheia}
        >
          {telaCheia ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </BotaoRedondo>
      </div>

      {bloqueada && (
        <div className="deck-so-tela fixed left-1/2 top-6 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-card/95 py-2 pl-6 pr-2 text-sm text-foreground backdrop-blur">
          O navegador bloqueou a janela do apresentador.
          <button
            type="button"
            onClick={() => {
              setBloqueada(!window.open(urlApresentador(), 'deck-apresentador', 'popup,width=1440,height=900'));
            }}
            className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground"
          >
            Abrir
          </button>
          <button
            type="button"
            onClick={() => setBloqueada(false)}
            aria-label="Fechar aviso"
            className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
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
  onClick,
  children,
}: {
  rotulo: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'flex size-11 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur',
        'text-foreground/80 hover:bg-black/75 hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
