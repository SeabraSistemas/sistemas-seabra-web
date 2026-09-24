import Image from 'next/image';
import {
  Award,
  CalendarDays,
  Droplets,
  Factory,
  FileText,
  RefreshCw,
  Scale,
  ScanLine,
  Tag,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Logo, NomeIcone, Topico } from './tipos';

/** Peças repetidas entre layouts de slide. */

export function Cabecalho({
  secao,
  titulo,
  lead,
  className,
}: {
  secao?: string;
  titulo: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      {secao && <p className="deck-rotulo">{secao}</p>}
      <h2 className="deck-titulo mt-[22px] text-[84px] text-foreground">{titulo}</h2>
      {lead && (
        <p className="mt-[22px] max-w-[1400px] text-balance text-[34px] leading-snug text-foreground/75">
          {lead}
        </p>
      )}
    </header>
  );
}

/** Dados de exemplo precisam dizer que são de exemplo — na projeção e no PDF. */
export function SeloIlustrativo({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'rounded-full border border-white/20 px-[18px] py-[8px] text-[18px] uppercase tracking-[0.16em] text-muted-foreground',
        className
      )}
    >
      Dados ilustrativos
    </p>
  );
}

const ICONES: Record<NomeIcone, LucideIcon> = {
  frigorifico: Factory,
  grupo: Users,
  calendario: CalendarDays,
  caminhao: Truck,
  brinco: Tag,
  leitura: ScanLine,
  abate: Warehouse,
  higienizacao: Droplets,
  reutilizacao: RefreshCw,
  balanca: Scale,
  ficha: FileText,
  selo: Award,
};

export function Icone({ nome, className }: { nome: NomeIcone; className?: string }) {
  const Componente = ICONES[nome];
  return <Componente className={className} strokeWidth={1.75} aria-hidden />;
}

/** Logo feito para fundo branco, numa ficha clara — no preto ele sumiria. */
export function FichaLogo({
  logo,
  altura,
  className,
}: {
  logo: Logo;
  /** Altura máxima do logo dentro da ficha, em px do palco. */
  altura: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-[14px] bg-foreground px-[22px] py-[14px]',
        className
      )}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.largura}
        height={logo.altura}
        loading="eager"
        className="h-auto w-auto max-w-full object-contain"
        style={{ maxHeight: altura }}
      />
    </div>
  );
}

/** Lista de tópicos nos três estilos do deck. */
export function ListaTopicos({
  itens,
  estilo,
  tamanho = 'grande',
}: {
  itens: Topico[];
  estilo: 'lista' | 'numerado' | 'passos';
  tamanho?: 'grande' | 'medio';
}) {
  const texto = tamanho === 'grande' ? 'text-[42px]' : 'text-[36px]';
  const detalhe = tamanho === 'grande' ? 'text-[28px]' : 'text-[26px]';

  if (estilo === 'passos') {
    return (
      <ol>
        {itens.map((item, i) => (
          <li key={item.texto} className="relative flex gap-[30px] pb-[26px] last:pb-0">
            {/* Linha que liga um passo ao seguinte. */}
            {i < itens.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-[23px] top-[52px] w-[2px] bg-white/20" />
            )}
            <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full border-2 border-primary text-[22px] font-semibold text-primary">
              {i + 1}
            </span>
            <div className="pt-[2px]">
              <p className={cn(texto, 'leading-tight text-foreground')}>{item.texto}</p>
              {item.detalhe && (
                <p className={cn(detalhe, 'mt-[4px] leading-snug text-foreground/65')}>{item.detalhe}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="space-y-[30px]">
      {itens.map((item, i) => (
        <li key={item.texto} className="flex gap-[28px]">
          {estilo === 'numerado' ? (
            <span className="deck-titulo w-[64px] shrink-0 pt-[4px] text-[44px] text-primary">
              {String(i + 1).padStart(2, '0')}
            </span>
          ) : (
            <span aria-hidden className="mt-[17px] size-[14px] shrink-0 bg-primary" />
          )}
          <div>
            <p className={cn(texto, 'leading-tight text-foreground')}>{item.texto}</p>
            {item.detalhe && (
              <p className={cn(detalhe, 'mt-[6px] leading-snug text-foreground/65')}>{item.detalhe}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
