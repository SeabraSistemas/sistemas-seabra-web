'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AmlData } from '@/lib/criadores/normalize';
import { RadarAml } from './RadarAml';

/** Faixa de cor do ponto (protótipo v12, amlCor): verde ≥7, amarelo ≥4, vermelho <4. */
function faixa(v: number): 'g' | 'y' | 'r' {
  return v >= 7 ? 'g' : v >= 4 ? 'y' : 'r';
}

/**
 * Bloco AML (avaliação morfológica linear): radar do perfil à esquerda +
 * barras numeradas à direita — mesma dupla que o app monta no compartilhar
 * perfil (ficha_animal_jpg.dart, _amlSection). Substitui o antigo AmlBarras
 * "sem números" do protótipo v12: o número agora amarra cada barra ao seu
 * eixo no radar, e o total sai da barra solta pro medalhão do próprio radar.
 *
 * destaqueIndex é local (índice na lista `aml.pts`, não o número oficial da
 * característica — funciona mesmo quando o número não é conhecido): passar o
 * mouse numa barra realça o vértice/badge correspondente no radar e vice-versa.
 */
export function AmlBloco({ aml }: { aml: AmlData }) {
  const t = useTranslations('criadores');
  const [destaqueIndex, setDestaqueIndex] = useState<number | null>(null);

  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('amlTitulo')}</h3>
        {(aml.totalFmt || aml.dataFmt) && (
          <span className="k">
            {aml.totalFmt}
            {aml.totalFmt && aml.dataFmt && ' · '}
            {aml.dataFmt && t('amlAvaliadaEm', { data: aml.dataFmt })}
          </span>
        )}
      </div>
      <div className="aml-grid">
        <div className="aml-radar">
          <RadarAml
            pts={aml.pts}
            totalInt={aml.totalInt}
            destaqueIndex={destaqueIndex}
            onDestaqueIndexChange={setDestaqueIndex}
          />
        </div>
        <div className="bars">
          {aml.pts.map((p, i) => (
            <div
              className={`bar${i === destaqueIndex ? ' on' : ''}`}
              key={p.label}
              onMouseEnter={() => setDestaqueIndex(i)}
              onMouseLeave={() => setDestaqueIndex(null)}
            >
              <span className="bn">{p.n ?? ''}</span>
              <span className="bl">{p.label}</span>
              <span className="bt">
                <span className={`bf ${faixa(p.valor)}`} style={{ width: `${(p.valor / 9) * 100}%` }} />
              </span>
              <span className="bv">{p.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
