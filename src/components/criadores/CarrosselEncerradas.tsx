'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CurvaSvg } from './CurvaSvg';

type Enc = {
  ordem: number;
  ano: number;
  total: number;
  dias: number;
  media: number;
  pts?: [number, number][];
};

/** Miniatura (recolhida): quase toda a altura, sem rótulo por ponto. */
const CAIXA_MINI = { x: 3, xr: 97, yt: 8, yb: 92 };
/** Expandida: mesma caixa da lactação aberta, pra ficar visualmente igual. */
const CAIXA_GRANDE = { x: 4, xr: 95, yt: 26, yb: 80 };

/** Carrossel de lactações encerradas (protótipo v12): card por lactação.
 * Cards com curva (2+ pontos) são clicáveis — expandem no lugar mostrando a
 * mesma curva detalhada da lactação aberta, com rótulo de kg/dia por ponto. */
export function CarrosselEncerradas({ enc }: { enc: Enc[] }) {
  const t = useTranslations('criadores');
  const [aberto, setAberto] = useState<number | null>(null);
  const refs = useRef<Record<number, HTMLButtonElement | null>>({});

  function toggle(ordem: number) {
    const abrindo = aberto !== ordem;
    setAberto(abrindo ? ordem : null);
    if (abrindo) {
      requestAnimationFrame(() => {
        refs.current[ordem]?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      });
    }
  }

  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('lactacoesEncerradas')}</h3>
        <span className="k">{enc.length}</span>
      </div>
      <div className="carousel">
        {enc.map((l) => {
          const clicavel = !!l.pts && l.pts.length > 1;
          const expandida = clicavel && aberto === l.ordem;
          const corpo = (
            <>
              <div className="lo">
                <b>{t('lactacaoOrdinal', { n: l.ordem })}</b>
                <span className="lo-right">
                  <span>{l.ano}</span>
                  {clicavel && <ChevronDown className="ppchev" strokeWidth={2.2} />}
                </span>
              </div>
              <div className="big">
                {l.total}
                <small> kg</small>
              </div>
              <div className="sub">
                <span>{l.media} kg/d</span>
                <span>{l.dias} d</span>
              </div>
              {clicavel &&
                (expandida ? (
                  <div className="lac-chart">
                    <CurvaSvg pts={l.pts!} caixa={CAIXA_GRANDE} />
                  </div>
                ) : (
                  <div className="lcard-chart">
                    <CurvaSvg pts={l.pts!} caixa={CAIXA_MINI} mostrarRotulos={false} />
                  </div>
                ))}
            </>
          );

          if (!clicavel) {
            return (
              <div className="lcard" key={l.ordem}>
                {corpo}
              </div>
            );
          }

          return (
            <button
              type="button"
              key={l.ordem}
              ref={(el) => {
                refs.current[l.ordem] = el;
              }}
              className={`lcard clicavel${expandida ? ' aberto' : ''}`}
              aria-expanded={expandida}
              aria-label={t('lactacaoVerCurva')}
              onClick={() => toggle(l.ordem)}
            >
              {corpo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
