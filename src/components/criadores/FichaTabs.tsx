'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AmlBarras } from './AmlBarras';
import { MedidasChips } from './MedidasChips';

/** Métrica serializável vinda de metricasDe(animal). */
type Metrica = { label: string; valor: string; sufixo?: string };

/** AML serializável vinda de amlDe(animal); null → a aba mostra o placeholder. */
type AmlData = { totalFmt: string | null; pts: [string, number][] };

/** Medida do snapshot: [label, valor, unidade]. */
type Medida = [string, number, string];

/**
 * Abas da ficha (protótipo v12). Duas abas SEMPRE existem:
 *  - "Produção · Progênie": mostra os stats de produção presentes (metricasDe);
 *    sem dado → nota discreta. Curva de lactação / progênie / filhas são Fase B/C.
 *  - "AML · Medidas": bloco AML (se há avaliação) e/ou Medidas (se há); senão placeholder.
 */
export function FichaTabs({
  metricas,
  aml,
  medidas,
}: {
  metricas: Metrica[];
  aml: AmlData | null;
  medidas: Medida[];
}) {
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
        {aml && <AmlBarras aml={aml} />}
        {medidas.length > 0 && <MedidasChips medidas={medidas} />}
        {!aml && medidas.length === 0 && (
          <div className="block">
            <div className="empty-note">
              <Info size={13} strokeWidth={1.8} />
              {t('emBreveAml')}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
