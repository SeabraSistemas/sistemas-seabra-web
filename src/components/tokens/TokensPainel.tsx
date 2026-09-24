'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUp, Check, OctagonX, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DIA_MS, ESTADO_INICIAL, montarPlano, proximoResetPadrao, type Estado, type Leitura, type Plano } from '@/lib/tokens/ciclo';
import { alterarEstado, useAgora, useEstadoTokens } from '@/lib/tokens/estado';
import { SemanaChart } from './SemanaChart';
import { deInput, diaCurto, duracao, formatNum, formatPct, hora, lerPct, paraInput, quando, SEMANA_LONGA } from './formato';

const cartao = 'rounded-2xl border border-border bg-card p-5 sm:p-6';
const rotulo = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
const seletor = 'h-9 rounded-md border border-input bg-input/30 px-2 text-sm text-foreground';

export function TokensPainel() {
  const estado = useEstadoTokens();
  const agora = useAgora();
  if (!estado || !agora) {
    return <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 text-sm text-muted-foreground">Carregando…</main>;
  }
  return <Painel estado={estado} agora={agora} />;
}

function Painel({ estado, agora }: { estado: Estado; agora: number }) {
  const plano = useMemo(() => montarPlano(agora, estado), [agora, estado]);
  const { ciclo } = plano;
  const resetPadrao = `${SEMANA_LONGA[estado.resetDiaSemana]} ${String(estado.resetHora).padStart(2, '0')}:00`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Tokens</h1>
          <p className="mt-1 text-sm text-muted-foreground">Limite semanal do Claude · zera {resetPadrao}</p>
        </div>
        <div className="text-right">
          <p className={rotulo}>Zera em</p>
          <p className="text-2xl font-semibold tabular-nums">{duracao(ciclo.fim - agora)}</p>
          <p className="whitespace-nowrap text-xs text-muted-foreground">{quando(ciclo.fim)}</p>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <Registrar plano={plano} agora={agora} />
        <Hoje plano={plano} estado={estado} />
        <Numeros plano={plano} />
        <Semana plano={plano} />
        <Dias plano={plano} />
        <ResetExtra plano={plano} estado={estado} />
        <Leituras plano={plano} />
        <Ajustes estado={estado} />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        O % é o do <span className="text-foreground">Weekly (7 day)</span>, em Usage no Claude. As leituras ficam só neste navegador.
      </p>
    </main>
  );
}

/* ── Registrar leitura ──────────────────────────────────────────────────── */

function Registrar({ plano, agora }: { plano: Plano; agora: number }) {
  const [texto, setTexto] = useState('');
  const [horario, setHorario] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  /** Leitura menor que a anterior: quase sempre um reset fora de hora. */
  const [queda, setQueda] = useState<{ nova: Leitura; anterior: Leitura } | null>(null);
  const ultima = plano.leituras.at(-1) ?? null;

  function salvar(l: Leitura) {
    alterarEstado((e) => ({ ...e, leituras: [...e.leituras, l] }));
    setTexto('');
    setHorario(null);
    setErro(null);
    setQueda(null);
  }

  function registrar(ev: React.FormEvent) {
    ev.preventDefault();
    const pct = lerPct(texto);
    if (pct == null) return setErro('Digite um número de 0 a 100.');
    const t = horario ? deInput(horario) : Date.now();
    if (t == null || t > Date.now() + 60_000) return setErro('Horário inválido.');
    const anterior = plano.leituras.filter((l) => l.t <= t).at(-1);
    if (anterior && pct < anterior.pct - 0.5) return setQueda({ nova: { t, pct }, anterior });
    salvar({ t, pct });
  }

  function foiReset() {
    if (!queda) return;
    // O reset aconteceu entre a leitura anterior e esta; sem saber quando, fica logo antes desta.
    const r = Math.max(queda.anterior.t + 1, queda.nova.t - 60_000);
    alterarEstado((e) => ({ ...e, resetExtra: r, proximoManual: null, leituras: [...e.leituras, queda.nova] }));
    setTexto('');
    setHorario(null);
    setQueda(null);
  }

  return (
    <section className={cartao}>
      <form onSubmit={registrar} className="flex items-end gap-3">
        <label className="flex-1">
          <span className={rotulo}>Weekly (7 day) agora</span>
          <span className="relative mt-2 block">
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0 a 100"
              aria-invalid={erro ? true : undefined}
              className="h-12 pr-9 text-2xl font-semibold tabular-nums placeholder:text-base placeholder:font-normal md:text-2xl"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">%</span>
          </span>
        </label>
        <Button type="submit" size="lg" className="h-12">
          Registrar
        </Button>
      </form>

      {horario !== null && (
        <label className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          Lido em
          <Input type="datetime-local" value={horario} onChange={(e) => setHorario(e.target.value)} className="w-auto" />
        </label>
      )}

      {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}

      {queda && (
        <div className="mt-4 rounded-xl border border-input bg-secondary p-4 text-sm">
          <p>
            Caiu de <strong>{formatPct(queda.anterior.pct)}</strong> para <strong>{formatPct(queda.nova.pct)}</strong>. Foi um reset?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={foiReset}>
              <RotateCcw /> Foi reset — começar ciclo novo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setQueda(null)}>
              Digitei errado
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">O próximo reset continua {quando(plano.ciclo.fim)}; dá para mudar em “Reset fora de hora”.</p>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {ultima ? (
          <>
            Última: {formatPct(ultima.pct)} · {quando(ultima.t)} (há {duracao(agora - ultima.t)})
          </>
        ) : (
          'Nenhuma leitura neste ciclo ainda.'
        )}
        {horario === null && (
          <>
            {' · '}
            <button type="button" onClick={() => setHorario(paraInput(Date.now()))} className="underline underline-offset-2 hover:text-foreground">
              outro horário
            </button>
          </>
        )}
      </p>
    </section>
  );
}

/* ── Hoje ───────────────────────────────────────────────────────────────── */

const SITUACAO = {
  ok: { Icone: Check, texto: 'Dentro da cota de hoje', cor: 'text-muted-foreground' },
  atencao: { Icone: AlertTriangle, texto: 'Perto do limite de hoje', cor: 'text-primary' },
  estourou: { Icone: OctagonX, texto: 'Passou da cota de hoje — segure até virar o dia', cor: 'text-destructive' },
  esgotado: { Icone: OctagonX, texto: 'Limite da semana atingido', cor: 'text-destructive' },
} as const;

function Hoje({ plano, estado }: { plano: Plano; estado: Estado }) {
  const { situacao, hoje, atual, limiteHoje } = plano;
  const s = SITUACAO[situacao];
  const semLeitura = plano.leituras.length === 0;
  const virada = `${String(estado.resetHora).padStart(2, '0')}:00`;
  const fimDoDia =
    hoje.fim === plano.ciclo.fim ? `Hoje é o último dia, até o reset (${quando(hoje.fim)}).` : `O dia vira às ${hora(hoje.fim)} de ${SEMANA_LONGA[new Date(hoje.fim).getDay()]}.`;
  const passou = situacao === 'estourou' || situacao === 'esgotado';
  const base = hoje.base ?? 0;
  const noLimite = (v: number) => `${Math.min(100, Math.max(0, v))}%`;

  return (
    <section className={cartao}>
      <p className={rotulo}>Hoje · {SEMANA_LONGA[new Date(hoje.rotulo).getDay()]}</p>

      {/* Tudo na escala do Claude: o Weekly sobe de 0 a 100%, então o número
          principal é até onde ele pode chegar hoje, não quanto falta. */}
      <p className="mt-3 text-sm text-muted-foreground">{situacao === 'estourou' ? 'O limite de hoje era' : 'Hoje o Weekly pode ir até'}</p>
      <p className="text-6xl font-semibold tracking-tight">{formatPct(limiteHoje)}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {situacao === 'esgotado' ? (
          <>Weekly em 100%: não sobra nada até {quando(plano.ciclo.fim)}.</>
        ) : situacao === 'estourou' ? (
          <>
            Você está em <strong className="text-foreground">{formatPct(atual)}</strong>, {formatPct(-plano.restaHoje)} acima. Parando agora, dá{' '}
            <strong className="text-foreground">{formatPct(plano.ritmoAmanha)}/dia</strong> daqui em diante.
          </>
        ) : (
          fimDoDia
        )}
      </p>

      <div className="mt-6">
        <div className="relative h-2.5 rounded-full bg-secondary">
          <div className="absolute inset-y-0 rounded-full bg-muted-foreground/25" style={{ left: noLimite(base), width: noLimite(limiteHoje - base) }} />
          <div className={cn('absolute inset-y-0 left-0 rounded-full', passou ? 'bg-destructive' : 'bg-primary')} style={{ width: noLimite(atual) }} />
          <div className="absolute -top-1 h-[18px] w-0.5 -translate-x-1/2 rounded-full bg-foreground" style={{ left: noLimite(limiteHoje) }} />
        </div>
        <div className="mt-2 flex items-baseline justify-between text-sm tabular-nums">
          <span>
            <span className="text-muted-foreground">Agora </span>
            {formatPct(atual)}
          </span>
          <span>
            <span className="text-muted-foreground">Limite de hoje </span>
            {formatPct(limiteHoje)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          Usou {formatPct(plano.usadoHoje)} hoje, de uma cota de {formatPct(plano.cotaHoje)} (começou o dia em {formatPct(base)}).
        </p>
      </div>

      {!semLeitura && (
        <p className={cn('mt-4 flex items-center gap-2 text-sm', s.cor)}>
          <s.Icone className="size-4 shrink-0" /> {s.texto}
        </p>
      )}
      {semLeitura && <p className="mt-4 text-sm text-muted-foreground">Registre o Weekly acima para as contas valerem.</p>}
      {plano.baseEstimada && !semLeitura && (
        <p className="mt-2 text-xs text-muted-foreground">
          Sem leitura antes das {virada} de hoje: o início do dia foi estimado. Para acertar, registre em “outro horário” quanto estava à noite.
        </p>
      )}
    </section>
  );
}

/* ── Números da semana ──────────────────────────────────────────────────── */

function Numeros({ plano }: { plano: Plano }) {
  const base = (100 * DIA_MS) / (plano.ciclo.fim - plano.ciclo.inicio);
  const amanha = plano.dias[plano.dias.indexOf(plano.hoje) + 1];
  const recalculada = Math.abs(plano.ritmoDia - base) >= 0.05;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Numero rotuloTexto="Cota por dia" valor={formatPct(plano.ritmoDia)} nota={recalculada ? `era ${formatPct(base)} no reset` : `100% ÷ ${formatNum(100 / base)} dias`} />
      <Numero
        rotuloTexto="Amanhã, até"
        valor={amanha ? formatPct(amanha.meta) : '—'}
        nota={!amanha ? 'hoje é o último dia' : plano.situacao === 'estourou' ? 'parando agora' : 'se hoje fechar no limite'}
      />
      <Numero rotuloTexto="Ritmo linear" valor={formatPct(plano.linearAgora)} nota="gastando por igual até agora" />
    </div>
  );
}

function Numero({ rotuloTexto, valor, nota }: { rotuloTexto: string; valor: string; nota: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{rotuloTexto}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{valor}</p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{nota}</p>
    </div>
  );
}

/* ── Gráfico da semana ──────────────────────────────────────────────────── */

function Semana({ plano }: { plano: Plano }) {
  const ultima = plano.leituras.at(-1);
  let resumo = 'Registre leituras para comparar com o ritmo linear.';
  if (ultima) {
    const linear = (100 * (ultima.t - plano.ciclo.inicio)) / (plano.ciclo.fim - plano.ciclo.inicio);
    const dif = ultima.pct - linear;
    resumo =
      Math.abs(dif) < 0.5
        ? 'No ritmo linear.'
        : dif > 0
          ? `${formatPct(dif)} acima do ritmo linear na última leitura.`
          : `${formatPct(-dif)} abaixo do ritmo linear — sobra para os próximos dias.`;
  }

  return (
    <section className={cartao}>
      <h2 className="text-2xl">Semana</h2>
      <p className="mt-1 text-sm text-muted-foreground">{resumo}</p>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <Legenda cor="var(--primary)">Weekly registrado</Legenda>
        <Legenda cor="var(--ink-2)">Ritmo linear</Legenda>
        <Legenda cor="var(--foreground)">Limite de hoje ({formatPct(plano.limiteHoje)})</Legenda>
      </ul>
      <div className="mt-3">
        <SemanaChart plano={plano} />
      </div>
    </section>
  );
}

function Legenda({ cor, children }: { cor: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="h-0.5 w-4 rounded-full" style={{ background: cor }} />
      {children}
    </li>
  );
}

/* ── Dia a dia ──────────────────────────────────────────────────────────── */

function Dias({ plano }: { plano: Plano }) {
  return (
    <section className={cartao}>
      <h2 className="text-2xl">Dia a dia</h2>
      <p className="mt-1 text-sm text-muted-foreground">A cota de cada dia é o saldo dividido pelo tempo que falta, recalculada na virada.</p>
      <table className="mt-4 w-full text-sm tabular-nums">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 font-normal">Dia</th>
            <th className="py-2 text-right font-normal">Cota</th>
            <th className="py-2 text-right font-normal">Usado</th>
            <th className="py-2 text-right font-normal">Weekly ao fim</th>
          </tr>
        </thead>
        <tbody>
          {plano.dias.map((d) => {
            const passou = d.usado != null && d.usado > d.cota + 0.05;
            return (
              <tr
                key={d.inicio}
                className={cn('border-b border-border last:border-0', d.fase === 'hoje' && 'bg-secondary font-medium', d.fase === 'futuro' && 'text-muted-foreground')}
              >
                <td className="py-2.5 pl-2">
                  {diaCurto(d.rotulo)}
                  {d.fase === 'hoje' && <span className="ml-2 text-xs text-primary">hoje</span>}
                </td>
                <td className="py-2.5 text-right">{formatPct(d.cota)}</td>
                <td className={cn('py-2.5 text-right', passou && 'text-destructive')}>
                  {d.usado == null ? (
                    '—'
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {passou && <ArrowUp className="size-3" aria-label="acima da cota" />}
                      {d.semLeitura && <span className="text-muted-foreground">≈</span>}
                      {formatPct(d.usado)}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-2 text-right">
                  {d.fase === 'passado' ? formatPct(d.uso ?? 0) : d.fase === 'hoje' ? `até ${formatPct(d.meta)}` : formatPct(d.meta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {plano.dias.some((d) => d.semLeitura) && (
        <p className="mt-3 text-xs text-muted-foreground">≈ dia sem leitura: o uso foi estimado pelas leituras vizinhas.</p>
      )}
    </section>
  );
}

/* ── Reset fora de hora ─────────────────────────────────────────────────── */

function ResetExtra({ plano, estado }: { plano: Plano; estado: Estado }) {
  const [form, setForm] = useState<{ quando: string; proximo: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const ativo = estado.resetExtra != null && estado.resetExtra === plano.ciclo.inicio;
  const manual = estado.proximoManual != null && estado.proximoManual === plano.ciclo.fim;

  function abrir() {
    const agora = Date.now();
    setErro(null);
    setForm({ quando: paraInput(agora), proximo: paraInput(proximoResetPadrao(agora, estado.resetDiaSemana, estado.resetHora)) });
  }

  function confirmar() {
    if (!form) return;
    const lido = deInput(form.quando);
    const p = deInput(form.proximo);
    if (lido == null || lido > Date.now() + 60_000) return setErro('Quando zerou: horário inválido ou no futuro.');
    const r = Math.min(lido, Date.now());
    if (p == null || p <= Date.now()) return setErro('O próximo reset precisa estar no futuro.');
    if (p - r > 8 * DIA_MS) return setErro('O próximo reset está a mais de uma semana do reset.');
    const padrao = proximoResetPadrao(r, estado.resetDiaSemana, estado.resetHora);
    alterarEstado((e) => ({ ...e, resetExtra: r, proximoManual: p === padrao ? null : p }));
    setForm(null);
  }

  return (
    <section className={cartao}>
      <h2 className="text-2xl">Reset fora de hora</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Quando o limite zera antes do dia normal, registre aqui: o ciclo recomeça nesse momento e os 100% são divididos pelos dias que faltam.
      </p>

      {(ativo || manual) && !form && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 text-sm">
          <span>
            {ativo && <>Zerou {quando(plano.ciclo.inicio)}. </>}
            {manual && <>Próximo reset {quando(plano.ciclo.fim)}.</>}
          </span>
          <Button size="sm" variant="ghost" onClick={() => alterarEstado((e) => ({ ...e, resetExtra: null, proximoManual: null }))}>
            Desfazer
          </Button>
        </div>
      )}

      {form ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            Quando zerou
            <Input type="datetime-local" value={form.quando} onChange={(e) => setForm({ ...form, quando: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            Próximo reset
            <Input type="datetime-local" value={form.proximo} onChange={(e) => setForm({ ...form, proximo: e.target.value })} />
            <span className="text-xs">Normalmente continua no dia de sempre. Mude só se o Claude mostrar outra data.</span>
          </label>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <div className="flex gap-2">
            <Button onClick={confirmar}>Confirmar reset</Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="mt-4" onClick={abrir}>
          <RotateCcw /> Tive um reset
        </Button>
      )}
    </section>
  );
}

/* ── Leituras e ajustes ─────────────────────────────────────────────────── */

function Leituras({ plano }: { plano: Plano }) {
  if (!plano.leituras.length) return null;
  return (
    <details className={cn(cartao, 'group')}>
      <summary className="cursor-pointer text-sm text-muted-foreground marker:text-muted-foreground">
        Leituras deste ciclo ({plano.leituras.length})
      </summary>
      <ul className="mt-3 divide-y divide-border text-sm tabular-nums">
        {[...plano.leituras].reverse().map((l) => (
          <li key={`${l.t}-${l.pct}`} className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">{quando(l.t)}</span>
            <span className="flex items-center gap-3">
              {formatPct(l.pct)}
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Apagar leitura de ${quando(l.t)}`}
                onClick={() => alterarEstado((e) => ({ ...e, leituras: e.leituras.filter((x) => x.t !== l.t || x.pct !== l.pct) }))}
              >
                <Trash2 />
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Ajustes({ estado }: { estado: Estado }) {
  return (
    <details className={cartao}>
      <summary className="cursor-pointer text-sm text-muted-foreground marker:text-muted-foreground">Ajustes</summary>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Reset semanal:</span>
        <select
          aria-label="Dia do reset"
          className={seletor}
          value={estado.resetDiaSemana}
          onChange={(e) => alterarEstado((x) => ({ ...x, resetDiaSemana: Number(e.target.value) }))}
        >
          {SEMANA_LONGA.map((nome, i) => (
            <option key={nome} value={i}>
              {nome}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground">às</span>
        <select
          aria-label="Hora do reset"
          className={seletor}
          value={estado.resetHora}
          onChange={(e) => alterarEstado((x) => ({ ...x, resetHora: Number(e.target.value) }))}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">A hora do reset também é a hora em que o dia vira.</p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 text-destructive hover:text-destructive"
        onClick={() => {
          if (window.confirm('Apagar todas as leituras e ajustes deste navegador?')) alterarEstado(() => ESTADO_INICIAL);
        }}
      >
        <Trash2 /> Apagar tudo
      </Button>
    </details>
  );
}
