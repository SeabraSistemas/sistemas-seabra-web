'use client';

import { useTranslations } from 'next-intl';

/** Snapshot da AML pronto para render (vem de amlDe, já serializável). */
type AmlData = { totalFmt: string | null; pts: [string, number][] };

/** Faixa de cor do ponto (protótipo v12, amlCor): verde ≥7, amarelo ≥4, vermelho <4. */
function faixa(v: number): 'g' | 'y' | 'r' {
  return v >= 7 ? 'g' : v >= 4 ? 'y' : 'r';
}

/**
 * Bloco AML (avaliação morfológica linear): pontuação total + barras coloridas
 * por faixa, SEM números (decisão do protótipo v12). Cada ponto vem no snapshot
 * como [label, valor 1-9]; a largura da barra é valor/9. Pontos de úbere de macho
 * já não vêm no snapshot (NULL no banco), então não aparecem aqui.
 */
export function AmlBarras({ aml }: { aml: AmlData }) {
  const t = useTranslations('criadores');
  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('amlTitulo')}</h3>
      </div>
      {aml.totalFmt && (
        <div className="aml-score">
          <b>{aml.totalFmt}</b>
          <span>{t('amlPontuacao')}</span>
        </div>
      )}
      <div className="bars">
        {aml.pts.map(([label, valor]) => (
          <div className="bar" key={label}>
            <span className="bl">{label}</span>
            <span className="bt">
              <span className={`bf ${faixa(valor)}`} style={{ width: `${(valor / 9) * 100}%` }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
