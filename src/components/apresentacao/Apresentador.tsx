'use client';

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, MonitorUp, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniPalco } from './MiniPalco';
import { alternarTelaCheia, useNavegacao, useTecladoDeck, useTelaCheia } from './navegacao';
import './deck.css';

export interface SlideApresentador {
  id: string;
  titulo: string;
  notas?: string;
  conteudo: ReactNode;
}

interface Props {
  titulo: string;
  slides: SlideApresentador[];
  /** Mesmo canal da projeção: cada troca de slide vale para as duas janelas. */
  canal: string;
  rotaProjecao: string;
  duracaoMinutos: number;
}

/**
 * Janela do apresentador, no monitor do notebook: slide atual, próximo,
 * notas e cronômetro. O passador controla esta janela, e ela comanda a
 * projeção pelo BroadcastChannel — o público só vê o slide.
 */
export function Apresentador({ titulo, slides, canal, rotaProjecao, duracaoMinutos }: Props) {
  const total = slides.length;
  const { indice, irPara, proximo, anterior, apagada, setApagada, conectado } = useNavegacao(total, canal);
  const telaCheia = useTelaCheia();
  const cronometro = useCronometro(`${canal}:cronometro`);
  const raizRef = useRef<HTMLDivElement>(null);

  const { iniciarSeParado } = cronometro;
  // O primeiro avanço dispara o cronômetro, se ninguém apertou "Iniciar".
  const avancar = useCallback(() => {
    iniciarSeParado();
    proximo();
  }, [iniciarSeParado, proximo]);
  const primeiro = useCallback(() => irPara(0), [irPara]);
  const ultimo = useCallback(() => irPara(total - 1), [irPara, total]);

  useTecladoDeck({
    proximo: avancar,
    anterior,
    primeiro,
    ultimo,
    apagada,
    setApagada,
    telaCheia: alternarTelaCheia,
  });

  // Animações do slide atual, como na projeção.
  useEffect(() => {
    const id = requestAnimationFrame(() => raizRef.current?.setAttribute('data-animar', ''));
    return () => cancelAnimationFrame(id);
  }, []);

  const atual = slides[indice];
  const seguinte = slides[indice + 1];

  return (
    <div ref={raizRef} className="deck-apresentador fixed inset-0 flex flex-col overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Apresentador · {titulo}</h1>
      <header className="flex items-center gap-6 border-b border-border px-6 py-3">
        <p className="shrink-0 text-xl font-semibold tabular-nums">
          {indice + 1} <span className="text-muted-foreground">/ {total}</span>
        </p>
        <p className="min-w-0 flex-1 truncate text-muted-foreground">{atual?.titulo}</p>
        <Cronometro cronometro={cronometro} duracaoMinutos={duracaoMinutos} />
        <Relogio />
        <button
          type="button"
          onClick={alternarTelaCheia}
          onMouseDown={(e) => e.preventDefault()}
          title={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia desta janela (F)'}
          aria-label={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia desta janela (F)'}
          className="flex size-10 items-center justify-center rounded-full border border-border text-foreground/80 hover:text-foreground"
        >
          {telaCheia ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </button>
      </header>
      <BarraTempo cronometro={cronometro} duracaoMinutos={duracaoMinutos} />

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-6 p-6">
        <section className="flex min-h-0 flex-col gap-5">
          <div className="relative">
            <MiniPalco key={indice} ativo>
              {atual?.conteudo}
            </MiniPalco>
            {apagada && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/85 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Projeção apagada · B para voltar
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-card px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Notas</p>
            <p className="mt-3 whitespace-pre-line text-[clamp(18px,1.6vw,28px)] leading-relaxed">
              {atual?.notas ?? 'Sem notas para este slide.'}
            </p>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Próximo</p>
          {seguinte ? (
            <>
              <MiniPalco>{seguinte.conteudo}</MiniPalco>
              <p className="truncate text-muted-foreground">{seguinte.titulo}</p>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
              Último slide
            </div>
          )}

          <div className="mt-auto space-y-4">
            <div className="flex gap-3">
              <BotaoGrande rotulo="Anterior (←)" onClick={anterior} desabilitado={indice === 0}>
                <ChevronLeft className="size-8" />
              </BotaoGrande>
              <BotaoGrande rotulo="Próximo (→)" onClick={avancar} desabilitado={indice === total - 1}>
                <ChevronRight className="size-8" />
              </BotaoGrande>
              <button
                type="button"
                onClick={() => setApagada(!apagada)}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  'rounded-xl border px-5 text-sm font-semibold uppercase tracking-[0.14em]',
                  apagada ? 'border-primary text-primary' : 'border-border text-foreground/80 hover:text-foreground'
                )}
              >
                {apagada ? 'Acender (B)' : 'Apagar (B)'}
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={cn('size-2.5 rounded-full', conectado ? 'bg-[#0ca30c]' : 'bg-muted-foreground')}
              />
              {conectado ? (
                <span className="text-foreground/80">Projeção conectada</span>
              ) : (
                <>
                  <span className="text-muted-foreground">Projeção não aberta</span>
                  <button
                    type="button"
                    onClick={() => window.open(`${rotaProjecao}#${indice + 1}`, 'deck-projecao')}
                    className="ml-auto flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-foreground/80 hover:text-foreground"
                  >
                    <MonitorUp className="size-4" /> Abrir projeção
                  </button>
                </>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Passador e setas controlam as duas telas. Na projeção, F põe em tela cheia. Use o
              monitor estendido (não espelhado) para as notas não aparecerem no projetor.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function BotaoGrande({
  rotulo,
  onClick,
  desabilitado,
  children,
}: {
  rotulo: string;
  onClick: () => void;
  desabilitado: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={desabilitado}
      title={rotulo}
      aria-label={rotulo}
      className="flex h-16 flex-1 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:border-primary/60 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* ── Relógio e cronômetro ─────────────────────────────────────────────────
   O tempo vem de um "store" que avisa a cada segundo; o cronômetro fica no
   localStorage (se a janela do apresentador recarregar no meio da fala, o
   tempo continua). Sem localStorage, vale só a memória desta aba. */

function assinarSegundo(avisar: () => void) {
  const id = window.setInterval(avisar, 1000);
  return () => window.clearInterval(id);
}
const lerSegundo = () => Math.floor(Date.now() / 1000);

function useSegundo(): number {
  return useSyncExternalStore(assinarSegundo, lerSegundo, () => 0);
}

function Relogio() {
  const segundo = useSegundo();
  const texto = segundo
    ? new Date(segundo * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  return <p className="shrink-0 text-lg tabular-nums text-muted-foreground">{texto}</p>;
}

interface EstadoCronometro {
  /** Início da contagem em ms (Date.now), ou null se parado. */
  inicio: number | null;
  /** Tempo acumulado antes do início atual, em ms. */
  acumulado: number;
}

const EVENTO_CRONOMETRO = 'deck:cronometro';
const memoria = new Map<string, string>();

function lerCronometro(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave) ?? memoria.get(chave) ?? null;
  } catch {
    return memoria.get(chave) ?? null;
  }
}

function gravarCronometro(chave: string, estado: EstadoCronometro) {
  const texto = JSON.stringify(estado);
  memoria.set(chave, texto);
  try {
    window.localStorage.setItem(chave, texto);
  } catch {
    // Sem armazenamento (aba privada): segue só na memória.
  }
  window.dispatchEvent(new Event(EVENTO_CRONOMETRO));
}

function assinarCronometro(avisar: () => void) {
  window.addEventListener('storage', avisar);
  window.addEventListener(EVENTO_CRONOMETRO, avisar);
  return () => {
    window.removeEventListener('storage', avisar);
    window.removeEventListener(EVENTO_CRONOMETRO, avisar);
  };
}

const PARADO: EstadoCronometro = { inicio: null, acumulado: 0 };

function useCronometro(chave: string) {
  const bruto = useSyncExternalStore(
    assinarCronometro,
    () => lerCronometro(chave),
    () => null
  );
  const estado = useMemo<EstadoCronometro>(() => {
    if (!bruto) return PARADO;
    try {
      return JSON.parse(bruto) as EstadoCronometro;
    } catch {
      return PARADO;
    }
  }, [bruto]);
  const segundo = useSegundo();

  const rodando = estado.inicio !== null;
  const decorrido =
    estado.acumulado + (estado.inicio !== null && segundo ? segundo * 1000 - estado.inicio : 0);

  const iniciar = useCallback(() => {
    const atual = JSON.parse(lerCronometro(chave) ?? 'null') as EstadoCronometro | null;
    if (atual?.inicio) return;
    gravarCronometro(chave, { inicio: Date.now(), acumulado: atual?.acumulado ?? 0 });
  }, [chave]);

  const pausar = useCallback(() => {
    const atual = JSON.parse(lerCronometro(chave) ?? 'null') as EstadoCronometro | null;
    if (!atual?.inicio) return;
    gravarCronometro(chave, { inicio: null, acumulado: atual.acumulado + (Date.now() - atual.inicio) });
  }, [chave]);

  const zerar = useCallback(() => gravarCronometro(chave, PARADO), [chave]);

  /** Só inicia se nunca foi iniciado (tempo zero) — não retoma uma pausa. */
  const iniciarSeParado = useCallback(() => {
    const atual = JSON.parse(lerCronometro(chave) ?? 'null') as EstadoCronometro | null;
    if (!atual || (!atual.inicio && !atual.acumulado)) iniciar();
  }, [chave, iniciar]);

  return { decorrido: Math.max(0, decorrido), rodando, iniciar, pausar, zerar, iniciarSeParado };
}

type DadosCronometro = ReturnType<typeof useCronometro>;

function mmss(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function Cronometro({ cronometro, duracaoMinutos }: { cronometro: DadosCronometro; duracaoMinutos: number }) {
  const limite = duracaoMinutos * 60_000;
  const { decorrido, rodando, iniciar, pausar, zerar } = cronometro;
  // Últimos 10 minutos em ocre, estouro em vermelho.
  const tom = decorrido > limite ? 'text-destructive' : decorrido > limite - 600_000 ? 'text-primary' : 'text-foreground';
  return (
    <div className="flex shrink-0 items-center gap-2">
      <p className={cn('text-2xl font-semibold tabular-nums', tom)}>{mmss(decorrido)}</p>
      <p className="text-sm tabular-nums text-muted-foreground">/ {mmss(limite)}</p>
      <button
        type="button"
        onClick={rodando ? pausar : iniciar}
        onMouseDown={(e) => e.preventDefault()}
        title={rodando ? 'Pausar' : 'Iniciar'}
        aria-label={rodando ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
        className="ml-1 flex size-9 items-center justify-center rounded-full border border-border text-foreground/80 hover:text-foreground"
      >
        {rodando ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <button
        type="button"
        onClick={zerar}
        onMouseDown={(e) => e.preventDefault()}
        title="Zerar"
        aria-label="Zerar cronômetro"
        className="flex size-9 items-center justify-center rounded-full border border-border text-foreground/80 hover:text-foreground"
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}

function BarraTempo({ cronometro, duracaoMinutos }: { cronometro: DadosCronometro; duracaoMinutos: number }) {
  const limite = duracaoMinutos * 60_000;
  const fracao = Math.min(1, cronometro.decorrido / limite);
  return (
    <div className="h-1 bg-white/10" aria-hidden>
      <div
        className={cn('h-full', cronometro.decorrido > limite ? 'bg-destructive' : 'bg-primary')}
        style={{ width: `${fracao * 100}%` }}
      />
    </div>
  );
}
