import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Símbolo + nome em texto claro. O logo.png completo traz "Seabra" em cinza
 * médio, que some no fundo preto do projetor — o nome vai em texto, como o
 * wordmark do cabeçalho do site.
 */
export function MarcaSeabra({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-[18px]', className)}>
      <Image
        src="/images/logo-icon.png"
        alt=""
        width={1011}
        height={1011}
        loading="eager"
        className="size-[64px]"
      />
      <span className="text-[30px] font-bold tracking-tight text-foreground">Sistema Seabra</span>
    </div>
  );
}
