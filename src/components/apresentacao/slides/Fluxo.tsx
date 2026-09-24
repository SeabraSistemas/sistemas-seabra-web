import { Fragment, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { Cabecalho, Icone } from '../partes';
import type { Passo, SlideFluxo } from '../tipos';

export function Fluxo({ slide, secao }: { slide: SlideFluxo; secao?: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 flex flex-col px-[120px] pb-[110px] pt-[100px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
        {slide.forma !== 'ciclo' && <FluxoLinha passos={slide.passos} />}
      </div>
      {slide.forma === 'ciclo' && <FluxoCiclo id={slide.id} passos={slide.passos} centro={slide.centro} />}
    </div>
  );
}

function Circulo({ passo }: { passo: Passo }) {
  return (
    <div className="flex size-[128px] shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-card">
      {passo.icone && <Icone nome={passo.icone} className="size-[54px] text-primary" />}
    </div>
  );
}

function FluxoLinha({ passos }: { passos: Passo[] }) {
  return (
    <div className="flex flex-1 items-center">
      <div className="flex w-full items-start">
        {passos.map((passo, i) => (
          <Fragment key={passo.titulo}>
            {i > 0 && (
              <ArrowRight
                aria-hidden
                className="mt-[42px] size-[44px] shrink-0 text-foreground/40"
                strokeWidth={1.75}
              />
            )}
            <div className="flex flex-1 flex-col items-center px-[12px] text-center">
              <Circulo passo={passo} />
              <p className="mt-[30px] text-balance text-[34px] font-semibold leading-tight text-foreground">
                {passo.titulo}
              </p>
              {passo.detalhe && (
                <p className="mt-[10px] text-balance text-[26px] leading-snug text-foreground/65">
                  {passo.detalhe}
                </p>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── Ciclo: etapas numa roda, setas em arco de uma para a outra ─────────── */

const CX = 960;
const CY = 650;
const R = 280;
const RAIO_NO = 64;

function FluxoCiclo({ id, passos, centro }: { id: string; passos: Passo[]; centro?: string }) {
  const n = passos.length;
  const angulo = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const ponto = (a: number, r = R) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });
  // Folga angular para a seta começar e terminar fora do círculo de cada etapa.
  const folga = (RAIO_NO + 18) / R;
  const marcador = `seta-${id}`;

  return (
    <>
      <svg aria-hidden className="absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <marker id={marcador} markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="rgb(245 245 245 / 0.55)" />
          </marker>
        </defs>
        {passos.map((passo, i) => {
          const a = ponto(angulo(i) + folga);
          const b = ponto(angulo(i + 1) - folga);
          return (
            <path
              key={passo.titulo}
              d={`M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`}
              fill="none"
              stroke="rgb(245 245 245 / 0.4)"
              strokeWidth={3}
              strokeLinecap="round"
              markerEnd={`url(#${marcador})`}
            />
          );
        })}
      </svg>

      {centro && (
        <p
          className="deck-titulo absolute w-[360px] -translate-x-1/2 -translate-y-1/2 text-center text-[56px] text-primary"
          style={{ left: CX, top: CY }}
        >
          {centro}
        </p>
      )}

      {passos.map((passo, i) => {
        const a = angulo(i);
        const p = ponto(a);
        const cos = Math.cos(a);
        // Rótulo para fora da roda: acima/abaixo no topo e na base, senão ao lado.
        // (Ao lado do nó do topo ele ficaria em cima da seta que sai dele.)
        const lado = Math.abs(cos) <= 0.2 ? (Math.sin(a) < 0 ? 'acima' : 'abaixo') : cos < 0 ? 'esquerda' : 'direita';
        const posicao: CSSProperties =
          lado === 'acima'
            ? { left: p.x, bottom: 1080 - (p.y - RAIO_NO - 18), transform: 'translateX(-50%)', textAlign: 'center' }
            : lado === 'abaixo'
              ? { left: p.x, top: p.y + RAIO_NO + 18, transform: 'translateX(-50%)', textAlign: 'center' }
              : lado === 'esquerda'
                ? { right: 1920 - (p.x - RAIO_NO - 26), top: p.y, transform: 'translateY(-50%)', textAlign: 'right' }
                : { left: p.x + RAIO_NO + 26, top: p.y, transform: 'translateY(-50%)' };
        return (
          <Fragment key={passo.titulo}>
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
              <Circulo passo={passo} />
            </div>
            <div className="absolute w-[340px]" style={posicao}>
              <p className="text-[34px] font-semibold leading-tight text-foreground">{passo.titulo}</p>
              {passo.detalhe && (
                <p className="mt-[6px] text-[24px] leading-snug text-foreground/65">{passo.detalhe}</p>
              )}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
