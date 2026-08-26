import { cn } from '@/lib/utils';

/**
 * Marcador de lista minimalista: uma bolinha, não um ícone de check.
 * Um check colorido chama atenção para si mesmo em vez do texto ao lado —
 * a bolinha marca o item sem competir com o conteúdo.
 */
export function BulletDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70', className)}
    />
  );
}
