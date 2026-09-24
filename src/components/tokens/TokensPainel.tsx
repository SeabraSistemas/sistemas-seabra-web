'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, OctagonX, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ESTADO_INICIAL, montarSemana, type Estado, type Semana } from '@/lib/tokens/ciclo';
import { alterarEstado, useAgora, useEstadoTokens } from '@/lib/tokens/estado';
import { diaCurto, duracao, formatPct, hora, lerPct, quando, SEMANA_LONGA } from './formato';

const cartao = 'rounded-2xl border border-border bg-card p-5 sm:p-6';
const rotulo = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
const seletor = 'h-9 rounded-md border border-input bg-input/30 px-2 text-sm text-foreground';
const nomeDia = (t: number) => SEMANA_LONGA[new Date(t).getDay()];

export function TokensPainel() {
  const estado = useEstadoTokens();
  const agora = useAgora();
  if (!estado || !agora) {
    return <main className="mx-auto min-h-screen max-w-xl px-4 py-10 text-sm text-muted-foreground">Carregando…</main>;
  }
  return <Painel estado={estado} agora={agora} />;
}

function Painel({ estado, agora }: { estado: Estado; agora: number }) {
  const semana = useMemo(() => montarSemana(agora, estado), [agora, estado]);
  const horaReset = `${String(estado.resetHora).padStart(2, '0')}:00`;

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Tokens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly do Claude · zera {SEMANA_LONGA[estado.resetDiaSemana]} {horaReset}
          </p>
        </div>
        <div className="text-right">
          <p className={rotulo}>Zera em</p>
          <p className="text-2xl font-semibold tabular-nums">{duracao(semana.fim - agora)}</p>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <Hoje semana={semana} />
        <Escada semana={semana} />
        <Reset semana={semana} />
        <Ajustes estado={estado} />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Cada dia vai das {horaReset} às {horaReset}. Metas arredondadas para baixo, para não passar do ritmo. Os dados ficam só neste
        navegador.
      </p>
    </main>
  );
}

/* ── Hoje ───────────────────────────────────────────────────────────────── */

function Hoje({ semana }: { semana: Semana }) {
  const hoje = semana.dias[semana.iHoje];
  const { metaHoje, leitura } = semana;
  const passou = leitura != null && leitura.pct > metaHoje;
  const ultimoDia = semana.iHoje === 6;

  return (
    <section className={cartao}>
      <p className={rotulo}>Hoje · {nomeDia(hoje.inicio)}</p>
      <p className="mt-3 text-sm text-muted-foreground">O Weekly pode ir até</p>
      <p className="text-7xl font-semibold tracking-tight">{formatPct(metaHoje)}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatPct(semana.porDia)} por dia{semana.iReset > 0 && <> desde o reset de {nomeDia(semana.dias[semana.iReset].inicio)}</>}
        {' · '}
        {ultimoDia ? `zera ${quando(hoje.fim)}` : `vira às ${hora(hoje.fim)} de ${nomeDia(hoje.fim)}`}
      </p>

      <Barra semana={semana} />

      <Comparar />
      {leitura && (
        <p className={cn('mt-3 flex items-center gap-2 text-sm', passou ? 'text-destructive' : 'text-muted-foreground')}>
          {leitura.pct >= 100 ? (
            <>
              <OctagonX className="size-4 shrink-0" /> Weekly em 100% — espere o reset.
            </>
          ) : passou ? (
            <>
              <AlertTriangle className="size-4 shrink-0" /> Em {formatPct(leitura.pct)}: passou da meta de hoje. Segure até virar o dia.
            </>
          ) : (
            <>
              <Check className="size-4 shrink-0" /> Em {formatPct(leitura.pct)} ({quando(leitura.t)}): dentro da meta de hoje.
            </>
          )}
        </p>
      )}
    </section>
  );
}

/** 0–100% como a barra do Claude: marcas nas metas de cada dia, a de hoje em destaque. */
function Barra({ semana }: { semana: Semana }) {
  const { leitura, metaHoje } = semana;
  const passou = leitura != null && leitura.pct > metaHoje;
  return (
    <div className="relative mt-6 h-2.5 rounded-full bg-secondary">
      {leitura && (
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full', passou ? 'bg-destructive' : 'bg-primary')}
          style={{ width: `${Math.min(100, leitura.pct)}%` }}
        />
      )}
      {semana.dias.map(
        (d) =>
          d.meta != null &&
          d.meta < 100 && (
            <div
              key={d.inicio}
              className={cn(
                'absolute -translate-x-1/2 rounded-full',
                d.fase === 'hoje' ? '-top-1 h-[18px] w-0.5 bg-foreground' : 'inset-y-0 w-0.5 bg-background'
              )}
              style={{ left: `${d.meta}%` }}
            />
          )
      )}
    </div>
  );
}

function Comparar() {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState(false);

  function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    const pct = lerPct(texto);
    if (pct == null) return setErro(true);
    alterarEstado((e) => ({ ...e, leitura: { t: Date.now(), pct } }));
    setTexto('');
    setErro(false);
  }

  return (
    <form onSubmit={enviar} className="mt-6 flex items-center gap-2">
      <label htmlFor="weekly" className="text-sm text-muted-foreground">
        Weekly agora
      </label>
      <span className="relative w-24">
        <Input
          id="weekly"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={erro || undefined}
          className="pr-7 tabular-nums"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
      </span>
      <Button type="submit" variant="outline">
        Comparar
      </Button>
      {erro && <span className="text-sm text-destructive">0 a 100</span>}
    </form>
  );
}

/* ── Escada da semana ───────────────────────────────────────────────────── */

function Escada({ semana }: { semana: Semana }) {
  return (
    <section className={cartao}>
      <h2 className="text-2xl">Semana</h2>
      <ol className="mt-4 flex flex-col gap-1">
        {semana.dias.map((d, k) => (
          <li
            key={d.inicio}
            className={cn(
              'grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
              d.fase === 'hoje' && 'bg-secondary font-semibold',
              d.fase === 'passado' && 'text-muted-foreground'
            )}
          >
            <span className="flex items-center gap-1.5">
              {diaCurto(d.inicio)}
              {k === semana.iReset && k > 0 && <RotateCcw className="size-3.5 text-primary" aria-label="reset" />}
            </span>
            <span className="h-1.5 rounded-full bg-secondary">
              {d.meta != null && (
                <span
                  className={cn('block h-full rounded-full', d.fase === 'hoje' ? 'bg-primary' : 'bg-muted-foreground/40')}
                  style={{ width: `${d.meta}%` }}
                />
              )}
            </span>
            <span className="text-right tabular-nums">{d.meta != null ? formatPct(d.meta) : '—'}</span>
          </li>
        ))}
      </ol>
      {semana.iReset > 0 && <p className="mt-3 text-xs text-muted-foreground">— antes do reset: não conta mais.</p>}
    </section>
  );
}

/* ── Reset fora de hora ─────────────────────────────────────────────────── */

function Reset({ semana }: { semana: Semana }) {
  // Dá para marcar o reset em qualquer dia desta semana até hoje; domingo já é o começo normal.
  const opcoes = semana.dias.slice(1, semana.iHoje + 1);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const valor = escolhido ?? semana.dias[semana.iHoje].inicio;

  if (semana.iReset > 0) {
    const d = semana.dias[semana.iReset];
    return (
      <section className={cn(cartao, 'flex flex-wrap items-center justify-between gap-3')}>
        <p className="text-sm">
          Reset em <strong>{nomeDia(d.inicio)}</strong>: {formatPct(semana.porDia)} por dia até o reset normal.
        </p>
        <Button size="sm" variant="ghost" onClick={() => alterarEstado((e) => ({ ...e, resetExtra: null }))}>
          Desfazer
        </Button>
      </section>
    );
  }

  return (
    <section className={cartao}>
      <h2 className="text-2xl">Teve reset?</h2>
      {opcoes.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Hoje já é o primeiro dia da semana.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha o dia em que zerou. Dali até o reset normal, os 100% são divididos por igual.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select aria-label="Dia do reset" className={seletor} value={valor} onChange={(e) => setEscolhido(Number(e.target.value))}>
              {opcoes.map((d) => (
                <option key={d.inicio} value={d.inicio}>
                  {nomeDia(d.inicio)} {diaCurto(d.inicio).slice(4)}
                  {d.fase === 'hoje' ? ' (hoje)' : ''}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                // A leitura antiga era do Weekly antes de zerar: não vale mais.
                alterarEstado((e) => ({ ...e, resetExtra: valor, leitura: null }));
                setEscolhido(null);
              }}
            >
              <RotateCcw /> Deu reset
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

/* ── Ajustes ────────────────────────────────────────────────────────────── */

function Ajustes({ estado }: { estado: Estado }) {
  return (
    <details className={cartao}>
      <summary className="cursor-pointer text-sm text-muted-foreground marker:text-muted-foreground">Ajustes</summary>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Reset normal:</span>
        <select
          aria-label="Dia do reset normal"
          className={seletor}
          value={estado.resetDiaSemana}
          onChange={(e) => alterarEstado((x) => ({ ...x, resetDiaSemana: Number(e.target.value), resetExtra: null }))}
        >
          {SEMANA_LONGA.map((nome, i) => (
            <option key={nome} value={i}>
              {nome}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">às</span>
        <select
          aria-label="Hora do reset normal"
          className={seletor}
          value={estado.resetHora}
          onChange={(e) => alterarEstado((x) => ({ ...x, resetHora: Number(e.target.value), resetExtra: null }))}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 text-destructive hover:text-destructive"
        onClick={() => {
          if (window.confirm('Apagar reset e leitura deste navegador?')) alterarEstado(() => ESTADO_INICIAL);
        }}
      >
        <Trash2 /> Apagar dados
      </Button>
    </details>
  );
}
