'use client';

import { AlertTriangle, Check, ChevronDown, Info as InfoIcon, XCircle } from 'lucide-react';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { lerNumero, paraCampo } from '@/components/nutricao/formato';

/**
 * Primitivos do laboratório. Regras de tela do produtor (30/10/2026): celular
 * primeiro, para ler no sol; NADA de texto explicativo solto em formulário —
 * a explicação vai num ícone "i"; a opção escolhida fica em verde.
 */

/** Ícone "i" que abre a explicação do campo. */
export function Info({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={titulo ? `Explicação: ${titulo}` : 'Explicação'}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <InfoIcon className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] space-y-2 p-3 text-sm leading-snug" align="start">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className="space-y-2 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

export function Rotulo({ texto, info, htmlFor, className }: { texto: string; info?: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-6 items-center gap-1 text-sm font-medium', className)}>
      <label htmlFor={htmlFor}>{texto}</label>
      {info && <Info titulo={texto}>{info}</Info>}
    </div>
  );
}

const CAMPO =
  'h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50';

/**
 * Número digitado em pt-BR ("2,77" e "2.77"). type="text" + inputMode="decimal":
 * o type="number" rejeita vírgula conforme o idioma do aparelho. Guarda o texto
 * enquanto a pessoa digita ("2," ainda não é número). Vazio = null.
 */
export function NumeroInput({
  valor,
  aoMudar,
  sufixo,
  placeholder,
  casas = 4,
  min = 0,
  max,
  id,
  rotuloAria,
  className,
}: {
  valor: number | null;
  aoMudar: (n: number | null) => void;
  sufixo?: string;
  placeholder?: string;
  casas?: number;
  min?: number;
  max?: number;
  id?: string;
  rotuloAria?: string;
  className?: string;
}) {
  const [texto, setTexto] = useState(() => paraCampo(valor, casas));
  useEffect(() => {
    if (lerNumero(texto) !== valor) setTexto(paraCampo(valor, casas));
    // só reage ao valor de fora (ex.: "voltar ao original"); `texto` mudando não deve sobrescrever a digitação
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className={cn('relative', className)}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        enterKeyHint="next"
        autoComplete="off"
        aria-label={rotuloAria}
        placeholder={placeholder}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          const n = lerNumero(e.target.value);
          if (e.target.value.trim() === '') aoMudar(null);
          else if (n != null && n >= min && (max == null || n <= max)) aoMudar(n);
        }}
        onBlur={() => setTexto(paraCampo(valor, casas))}
        onFocus={(e) => e.target.select()}
        className={cn(CAMPO, sufixo && 'pr-12')}
      />
      {sufixo && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">{sufixo}</span>}
    </div>
  );
}

/** Lista suspensa nativa (no celular abre o seletor do sistema). */
export function Selecao({
  valor,
  aoMudar,
  children,
  id,
  rotuloAria,
  className,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  children: ReactNode;
  id?: string;
  rotuloAria?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        aria-label={rotuloAria}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={cn(CAMPO, 'appearance-none truncate pr-9 tabular-nums')}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/** Escolha entre poucas opções: a escolhida fica em VERDE. */
export function Opcoes<T extends string>({
  valor,
  opcoes,
  aoMudar,
  rotuloAria,
  className,
}: {
  valor: T;
  opcoes: { valor: T; rotulo: string }[];
  aoMudar: (v: T) => void;
  rotuloAria: string;
  className?: string;
}) {
  const grupo = useId();
  return (
    <div role="radiogroup" aria-label={rotuloAria} className={cn('flex flex-wrap gap-2', className)}>
      {opcoes.map((o) => {
        const escolhida = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={escolhida}
            data-grupo={grupo}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm leading-tight font-medium transition-colors',
              escolhida ? 'border-ok bg-ok font-semibold text-ok-foreground' : 'border-input bg-card text-foreground active:bg-secondary',
            )}
          >
            {escolhida && <Check className="size-4 shrink-0" strokeWidth={3} />}
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export type NivelSelo = 'ok' | 'falta' | 'sobra' | 'neutro' | 'aviso' | 'erro';

const ESTILO_SELO: Record<NivelSelo, string> = {
  ok: 'bg-ok-soft text-ok',
  falta: 'bg-bad-soft text-bad',
  sobra: 'bg-warn-soft text-warn',
  neutro: 'bg-secondary text-muted-foreground',
  aviso: 'bg-warn-soft text-warn',
  erro: 'bg-bad-soft text-bad',
};

export function Selo({ nivel, children, className }: { nivel: NivelSelo; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums whitespace-nowrap', ESTILO_SELO[nivel], className)}>{children}</span>;
}

/** Bloco de aviso (valor suspeito, fora da faixa, dado faltando). */
export function Aviso({ nivel = 'aviso', children, className }: { nivel?: 'aviso' | 'erro' | 'info'; children: ReactNode; className?: string }) {
  const Icone = nivel === 'erro' ? XCircle : nivel === 'info' ? InfoIcon : AlertTriangle;
  return (
    <div
      role={nivel === 'erro' ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-2 rounded-lg px-3 py-2 text-sm leading-snug',
        nivel === 'erro' && 'bg-bad-soft text-bad',
        nivel === 'aviso' && 'bg-warn-soft text-warn',
        nivel === 'info' && 'bg-secondary text-muted-foreground',
        className,
      )}
    >
      <Icone className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function Secao({ titulo, info, acao, children, className }: { titulo: string; info?: ReactNode; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1 text-lg">
          {titulo}
          {info && <Info titulo={titulo}>{info}</Info>}
        </h2>
        {acao}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Botao({
  children,
  onClick,
  variante = 'secundario',
  className,
  type = 'button',
  desabilitado,
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  className?: string;
  type?: 'button' | 'submit';
  desabilitado?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={desabilitado}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-40',
        variante === 'primario' && 'border-ok bg-ok text-ok-foreground active:opacity-90',
        variante === 'secundario' && 'border-input bg-card text-foreground active:bg-secondary',
        variante === 'perigo' && 'border-bad/40 bg-card text-bad active:bg-bad-soft',
        className,
      )}
    >
      {children}
    </button>
  );
}
