import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Foto do animal com marca d'agua anti-crop (diagonal + selo no canto) e
 * fallback de logo quando nao ha foto. A moldura (aspect/rounded) vem do pai
 * via className; aqui so cuidamos de imagem + overlay.
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
    <div className={cn('relative overflow-hidden bg-gray-100', className)}>
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
        <div className="absolute inset-0 grid place-items-center bg-gray-50">
          <Image
            src="/images/logo-icon.png"
            alt="Sistema Seabra"
            width={72}
            height={72}
            className="opacity-40"
          />
        </div>
      )}
      <Watermark />
    </div>
  );
}

function Watermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-1/4 flex rotate-[-22deg] flex-col gap-6 opacity-[0.12]">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-mono text-[9px] tracking-[0.22em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,.35)]"
          >
            SISTEMA SEABRA · SISTEMASEABRA.COM.BR · PEQUENOS RUMINANTES ·&nbsp;
          </span>
        ))}
      </div>
      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-[rgba(10,25,55,0.52)] px-1.5 py-0.5 font-mono text-[8px] text-white backdrop-blur-[2px]">
        sistemaseabra.com.br
      </div>
    </div>
  );
}
