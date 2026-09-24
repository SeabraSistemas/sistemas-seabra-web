import { cn } from '@/lib/utils';

/**
 * Botão e campo do painel. Pill como o botão do site do Sanri (`shared/Botao` de lá), mas em
 * sans e com altura de toque (44px) — é usado de pé, no celular, na sala de
 * ordenha. Borda de campo sempre `rule-strong`: `rule` não passa 3:1.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50';

export const botao = {
  solido: cn(base, 'h-11 px-6 text-sm bg-ink text-paper hover:bg-ink-1'),
  contorno: cn(base, 'h-11 px-6 text-sm border border-rule-strong bg-paper text-ink hover:bg-paper-2'),
  pequeno: cn(base, 'h-8 px-3 text-xs border border-rule-strong bg-paper text-ink hover:bg-paper-2'),
  discreto: cn(base, 'h-8 px-3 text-xs text-ink-1 hover:bg-paper-2 hover:text-ink'),
  perigo: cn(base, 'h-8 px-3 text-xs text-erro hover:bg-erro-fundo'),
} as const;

export function PainelBotao({
  variante = 'solido',
  className,
  ...props
}: React.ComponentProps<'button'> & { variante?: keyof typeof botao }) {
  return <button type="button" className={cn(botao[variante], className)} {...props} />;
}

export function PainelCampo({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        // text-base (16px) sempre: abaixo disso o Safari do iPhone dá zoom no foco.
        'h-11 w-full min-w-0 rounded-campo border border-rule-strong bg-paper px-3 text-base text-ink placeholder:text-ink-2',
        className,
      )}
      {...props}
    />
  );
}

/** Rótulo + controle empilhados — o padrão de todo campo de formulário do painel. */
export function Rotulo({ texto, className, children }: { texto: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('flex flex-col gap-1.5 text-sm', className)}>
      <span className="font-medium text-ink-1">{texto}</span>
      {children}
    </label>
  );
}

/** Caixa de mensagem de estado. Sempre com texto — a cor nunca carrega o recado sozinha. */
export function Aviso({ tom, children }: { tom: 'erro' | 'aviso'; children: React.ReactNode }) {
  return (
    <div
      role={tom === 'erro' ? 'alert' : 'status'}
      className={cn(
        'rounded-campo px-3 py-2 text-sm',
        tom === 'erro' ? 'bg-erro-fundo text-erro' : 'bg-aviso-fundo text-aviso',
      )}
    >
      {children}
    </div>
  );
}
