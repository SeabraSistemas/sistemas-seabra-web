import Image from 'next/image';
import { fotos, type SlotFotoKey } from '@/data/fotos';
import { cn } from '@/lib/utils';

interface FieldPhotoProps {
  slot: SlotFotoKey;
  /** Passe as larguras reais de renderização — evita baixar imagem grande demais. */
  sizes: string;
  className?: string;
  priority?: boolean;
  /**
   * `soft` (padrão): véu leve, para foto sem nada por cima.
   * `band`: faixa na cor do card subindo da base — use quando houver texto
   * sobreposto, senão foto clara (equipamento, céu) engole o texto.
   */
  veil?: 'soft' | 'band';
}

/**
 * Fotografia de campo com tratamento uniforme.
 *
 * O tratamento é o que faz fotos tiradas por pessoas diferentes, em dias
 * diferentes, parecerem do mesmo lugar: dessaturação parcial, contraste
 * controlado e um véu escuro na base para o texto sobreposto respirar.
 *
 * Enquanto a foto não existe (`src: null` em src/data/fotos.ts), renderiza um
 * espaço reservado com o briefing — a página mostra o que está faltando em vez
 * de fingir que está pronta.
 */
export function FieldPhoto({
  slot,
  sizes,
  className,
  priority,
  veil = 'soft',
}: FieldPhotoProps) {
  const foto = fotos[slot];

  if (!foto.src) {
    return (
      <div
        className={cn(
          'relative flex items-end overflow-hidden bg-secondary',
          'border border-dashed border-input',
          className
        )}
      >
        <div className="p-5 sm:p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Foto pendente
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {foto.briefing}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover saturate-[0.75] contrast-[1.05]"
      />
      {/* Véu na base: dá contraste ao texto sobreposto sem escurecer a foto toda. */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-gradient-to-t',
          veil === 'band'
            ? 'from-card from-12% via-card/75 via-40% to-transparent to-74%'
            : 'from-black/75 via-black/25 to-transparent'
        )}
      />
    </div>
  );
}
