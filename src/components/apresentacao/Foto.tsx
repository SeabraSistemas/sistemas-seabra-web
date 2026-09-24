import { readdirSync } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Foto as FotoDados } from './tipos';

const PUBLIC = path.join(process.cwd(), 'public');

/**
 * Arquivos de uma pasta de public/, lidos uma vez por renderização. É o que
 * faz a foto "aparecer sozinha": basta soltar o arquivo com o nome do `src`
 * na pasta. Em dev vale no próximo refresh; em produção, no próximo build.
 */
const arquivosDaPasta = cache((pasta: string): Set<string> => {
  try {
    return new Set(readdirSync(path.join(PUBLIC, pasta)));
  } catch {
    return new Set();
  }
});

function existe(src: string): boolean {
  return arquivosDaPasta(path.posix.dirname(src)).has(path.posix.basename(src));
}

interface FotoProps {
  foto: FotoDados;
  /** Largura renderizada na tela, para o next/image escolher o arquivo certo. */
  sizes: string;
  className?: string;
  /** Só a foto do primeiro slide. */
  preload?: boolean;
}

/**
 * Foto de slide. Todas carregam de saída (sem lazy): na hora da fala, trocar
 * de slide não pode esperar a rede do evento, e a impressão em PDF precisa de
 * todas prontas.
 */
export function Foto({ foto, sizes, className, preload }: FotoProps) {
  if (!existe(foto.src)) return <FotoPendente foto={foto} className={className} />;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        sizes={sizes}
        quality={90}
        preload={preload}
        loading={preload ? undefined : 'eager'}
        className={foto.ajuste === 'conter' ? 'object-contain' : 'object-cover'}
        style={foto.posicao ? { objectPosition: foto.posicao } : undefined}
      />
    </div>
  );
}

function FotoPendente({ foto, className }: { foto: FotoDados; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Foto pendente: ${foto.alt}`}
      className={cn('deck-foto-pendente relative overflow-hidden', className)}
    >
      <div className="absolute left-[56px] top-[56px] max-w-[600px]">
        <ImageIcon className="size-[40px] text-muted-foreground" strokeWidth={1.5} />
        <p className="deck-rotulo mt-[24px] text-muted-foreground">Foto pendente</p>
        <p className="mt-[16px] text-[26px] leading-snug text-muted-foreground">{foto.briefing}</p>
        <p className="mt-[20px] font-mono text-[18px] text-muted-foreground/70">
          {path.posix.basename(foto.src)}
        </p>
      </div>
    </div>
  );
}
