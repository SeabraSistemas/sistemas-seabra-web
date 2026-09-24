import { Factory } from 'lucide-react';
import { Cabecalho } from '../partes';
import type { SlideRede } from '../tipos';

const CX = 1290;
const CY = 590;
const R = 360;

/** Frigorífico no centro, propriedades em volta: quem cobre qual parte do ano. */
export function Rede({ slide, secao }: { slide: SlideRede; secao?: string }) {
  const n = slide.nos.length;
  const pos = slide.nos.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  });

  return (
    <div className="absolute inset-0">
      <div className="absolute left-[120px] top-[100px] w-[640px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
      </div>

      <svg aria-hidden className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        {pos.map((p, i) => (
          <line
            key={slide.nos[i].nome}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="rgb(245 245 245 / 0.25)"
            strokeWidth={2}
          />
        ))}
      </svg>

      <div
        className="absolute flex size-[250px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-primary bg-card text-center"
        style={{ left: CX, top: CY }}
      >
        <Factory className="size-[46px] text-primary" strokeWidth={1.75} aria-hidden />
        <p className="mt-[10px] text-[32px] font-semibold leading-tight text-foreground">{slide.centro.nome}</p>
        {slide.centro.detalhe && (
          <p className="mt-[4px] px-[20px] text-[22px] leading-tight text-foreground/70">{slide.centro.detalhe}</p>
        )}
      </div>

      {slide.nos.map((no, i) => (
        <div
          key={no.nome}
          className="absolute w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-white/15 bg-card px-[22px] py-[16px] text-center"
          style={{ left: pos[i].x, top: pos[i].y }}
        >
          <p className="text-[26px] font-semibold leading-tight text-foreground">{no.nome}</p>
          {no.detalhe && <p className="mt-[6px] text-[22px] uppercase tracking-[0.08em] text-primary">{no.detalhe}</p>}
        </div>
      ))}
    </div>
  );
}
