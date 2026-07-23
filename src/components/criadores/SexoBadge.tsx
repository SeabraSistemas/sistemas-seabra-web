import { cn } from '@/lib/utils';
import { sexoLabel, sexoSimbolo } from '@/lib/criadores/normalize';
import type { SexoNorm } from '@/lib/criadores/types';

/**
 * Sexo nunca e codificado so por cor: sempre simbolo (male/female) + palavra.
 * Macho = azul primario; Femea = ambar forte (#b45309, contraste AA sobre branco).
 */
export function SexoBadge({ sexo, className }: { sexo: SexoNorm; className?: string }) {
  const isMacho = sexo === 'macho';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white',
        isMacho ? 'bg-primary' : 'bg-[#b45309]',
        className,
      )}
    >
      <span aria-hidden>{sexoSimbolo(sexo)}</span>
      {sexoLabel(sexo)}
    </span>
  );
}
