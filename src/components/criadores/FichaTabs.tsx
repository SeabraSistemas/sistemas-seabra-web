'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Métrica serializável vinda de metricasDe(animal). */
type Metrica = { label: string; valor: string; sufixo?: string };

/**
 * Abas da ficha (protótipo v12). Duas abas SEMPRE existem:
 *  - "Produção · Progênie": mostra os stats de produção presentes (metricasDe);
 *    sem dado → nota discreta. Curva de lactação / progênie / filhas são Fase B/C.
 *  - "AML · Medidas": placeholder honesto (AML/medidas são Fase B/C).
 */
export function FichaTabs({ metricas }: { metricas: Metrica[] }) {
  const t = useTranslations('criadores');
  const [tab, setTab] = useState<'pl' | 'ta'>('pl');

  return (
    <>
      <div className="tabs" role="tablist">
        <button
          type="button"
          className="tab"
          role="tab"
          aria-selected={tab === 'pl'}
          onClick={() => setTab('pl')}
        >
          {t('abaProducaoProgenie')}
        </button>
        <button
          type="button"
          className="tab"
          role="tab"
          aria-selected={tab === 'ta'}
          onClick={() => setTab('ta')}
        >
          {t('abaAmlMedidas')}
        </button>
      </div>

      <div className="panel" role="tabpanel" hidden={tab !== 'pl'}>
        {metricas.length > 0 ? (
          <div className="stats">
            {metricas.map((m) => (
              <div className="stat" key={m.label}>
                <div className="v">
                  {m.valor}
                  {m.sufixo && <small> {m.sufixo}</small>}
                </div>
                <div className="l">{m.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="block">
            <div className="empty-note">
              <Info size={13} strokeWidth={1.8} />
              {t('emBreveProducao')}
            </div>
          </div>
        )}
      </div>

      <div className="panel" role="tabpanel" hidden={tab !== 'ta'}>
        <div className="block">
          <div className="empty-note">
            <Info size={13} strokeWidth={1.8} />
            {t('emBreveAml')}
          </div>
        </div>
      </div>
    </>
  );
}
