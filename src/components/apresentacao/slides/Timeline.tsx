import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cabecalho } from '../partes';
import type { SlideTimeline } from '../tipos';

/**
 * Linha do tempo horizontal. Cada etapa ocupa uma coluna; o ponto fica no
 * centro dela, então a linha vai do centro da primeira ao centro da última.
 * A `faixa` marca um período sobre a linha (progesterona, carência…), com o
 * rótulo por dentro.
 */
export function Timeline({ slide, secao }: { slide: SlideTimeline; secao?: string }) {
  const n = slide.etapas.length;
  const meio = 50 / n; // centro da primeira coluna, em % da largura
  const faixa = slide.faixa;
  const bloqueio = faixa?.tom === 'bloqueio';

  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[110px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />

      <div className="flex flex-1 flex-col justify-center">
        <div className="relative">
          {/* Marcos acima da linha */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {slide.etapas.map((etapa, i) => (
              <p
                key={etapa.marco}
                className={cn(
                  'deck-titulo px-[12px] text-center text-[54px]',
                  i === slide.destaque ? 'text-primary' : 'text-foreground'
                )}
              >
                {etapa.marco}
              </p>
            ))}
          </div>

          {/* Linha, faixa e pontos */}
          <div className="relative mt-[34px] h-[40px]">
            <div
              className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-white/30"
              style={{ left: `${meio}%`, right: `${meio}%` }}
            />
            {/* Faixa com o rótulo por dentro: texto claro no vermelho, preto no
                ocre (o par que passa contraste em globals.css). */}
            {faixa && (
              <div
                className={cn(
                  'absolute top-1/2 flex h-[40px] -translate-y-1/2 items-center justify-center gap-[10px] whitespace-nowrap rounded-[6px] px-[28px] text-[20px] font-semibold uppercase tracking-[0.1em]',
                  bloqueio ? 'bg-destructive/70 text-white' : 'bg-primary text-primary-foreground'
                )}
                style={{
                  left: `${((faixa.de + 0.5) / n) * 100}%`,
                  width: `${((faixa.ate - faixa.de) / n) * 100}%`,
                }}
              >
                {bloqueio && <Lock className="size-[20px]" aria-hidden />}
                {faixa.rotulo}
              </div>
            )}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {slide.etapas.map((etapa, i) => (
                <div key={etapa.marco} className="flex items-center justify-center">
                  <span
                    className={cn(
                      'size-[26px] rounded-full border-[3px] border-background ring-2',
                      i === slide.destaque ? 'bg-primary ring-primary' : 'bg-foreground ring-white/40'
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Títulos e detalhes abaixo */}
          <div
            className="mt-[36px] grid"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
          >
            {slide.etapas.map((etapa) => (
              <div key={etapa.marco} className="px-[16px] text-center">
                <p className="text-[36px] font-semibold leading-tight text-foreground">{etapa.titulo}</p>
                {etapa.detalhe && (
                  <p className="mt-[10px] text-[26px] leading-snug text-foreground/65">{etapa.detalhe}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {slide.nota && <p className="text-[24px] text-muted-foreground">{slide.nota}</p>}
    </div>
  );
}
