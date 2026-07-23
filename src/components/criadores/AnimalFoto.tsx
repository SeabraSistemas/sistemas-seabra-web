import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Foto do animal (protótipo v12): renderiza a caixa .photo (aspect 4/5) com
 * marca d'água anti-crop (9 faixas diagonais + selo sistemaseabra.com.br no
 * canto) e placeholder com a logo quando não há foto. A API é a mesma de antes
 * (src/alt/blurDataURL/priority/sizes/className) — o pai pode empilhar classes.
 */
export function AnimalFoto({
  src,
  alt,
  blurDataURL,
  priority,
  sizes,
  className,
}: {
  src: string | null;
  alt: string;
  blurDataURL?: string | null;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cn('photo', !src && 'noimg', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL ?? undefined}
          className="object-cover"
        />
      ) : (
        <div className="ph">
          <Image src="/images/logo-icon.png" alt="Sistema Seabra" width={82} height={82} />
        </div>
      )}
      <Watermark />
    </div>
  );
}

/** Marca d'água diagonal + selo de canto com a logo branca (anti-crop). */
function Watermark() {
  return (
    <div aria-hidden className="wm">
      <div className="diag">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i}>SISTEMA SEABRA · SISTEMASEABRA.COM.BR · PEQUENOS RUMINANTES ·&nbsp;</span>
        ))}
      </div>
      <div className="corner">
        <Image src="/images/logo-icon.png" alt="" width={9} height={9} />
        sistemaseabra.com.br
      </div>
    </div>
  );
}
