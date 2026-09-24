import { Fragment } from 'react';
import { ArrowRight } from 'lucide-react';
import { Cabecalho } from '../partes';
import type { SlideArquitetura } from '../tipos';

/** A tabela módulo × entrada/processamento/saída desenhada como fluxo. */
export function Arquitetura({ slide, secao }: { slide: SlideArquitetura; secao?: string }) {
  const colunas = '300px 1fr 56px 1fr 56px 1fr';
  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[100px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />

      <div className="mt-auto">
        <div className="grid items-end pb-[16px]" style={{ gridTemplateColumns: colunas }}>
          <span />
          {slide.etapas.map((etapa, i) => (
            <Fragment key={etapa}>
              {i > 0 && <span />}
              <p className="deck-rotulo px-[4px]">{etapa}</p>
            </Fragment>
          ))}
        </div>

        <div className="space-y-[14px]">
          {slide.modulos.map((modulo) => (
            <div key={modulo.nome} className="grid items-stretch" style={{ gridTemplateColumns: colunas }}>
              <p className="flex items-center pr-[24px] text-[30px] font-semibold leading-tight text-foreground">
                {modulo.nome}
              </p>
              {[modulo.entrada, modulo.processamento, modulo.saida].map((texto, i) => (
                <Fragment key={texto}>
                  {i > 0 && (
                    <span className="flex items-center justify-center">
                      <ArrowRight className="size-[30px] text-foreground/40" strokeWidth={1.75} aria-hidden />
                    </span>
                  )}
                  <p
                    className={
                      i === 2
                        ? 'flex min-h-[96px] items-center rounded-[12px] border border-primary/50 bg-card px-[22px] py-[14px] text-[24px] leading-snug text-foreground'
                        : 'flex min-h-[96px] items-center rounded-[12px] border border-white/10 bg-card px-[22px] py-[14px] text-[24px] leading-snug text-foreground/85'
                    }
                  >
                    {texto}
                  </p>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
