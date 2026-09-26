import { ROTULO_SEVERIDADE } from '@/lib/bovinos/catalogo';
import type { Severidade } from '@/lib/bovinos/tipos';
import { cn } from '@/lib/utils';

const CLASSE: Record<Severidade, string> = {
  corrigivel: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  manual: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  info: 'border-border bg-muted/40 text-muted-foreground',
};

export function SeveridadeBadge({ severidade, className }: { severidade: Severidade; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', CLASSE[severidade], className)}>
      {ROTULO_SEVERIDADE[severidade]}
    </span>
  );
}
