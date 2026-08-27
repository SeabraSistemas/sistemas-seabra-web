'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AmlData } from '@/lib/criadores/normalize';
import { AmlBloco } from './AmlBloco';
import { MedidasChips } from './MedidasChips';
import { LactacaoAberta } from './LactacaoAberta';
import { CarrosselEncerradas } from './CarrosselEncerradas';
import { ProgeniePerf } from './ProgeniePerf';
import { Filhas } from './Filhas';

/** Métrica serializável vinda de metricasDe(animal). */
type Metrica = { label: string; valor: string; sufixo?: string };

/** Medida do snapshot: [label, valor, unidade]. */
type Medida = [string, number, string];

/** Lactação serializável (snapshot); campos ausentes quando não há dado. */
type Lactacao = {
  aberta?: { dias: number; med: number; pts: [number, number][] };
  enc?: {
    ordem: number;
    ano: number;
    total: number;
    dias: number;
    media: number;
    pts?: [number, number][];
  }[];
};

/** Filhas serializável (snapshot). */
type FilhasData = {
  total: number;
  publicadas: { slug: string; nome: string | null; numero: string; sexo: 'macho' | 'femea'; foto: string | null }[];
};

/** Progênie serializável (snapshot); sem `cats` → o bloco não aparece. */
type ProgenieData = {
  conf?: number;
  total_filhas?: number | null;
  cats?: { n: string; v: number; sub: [string, number][] }[];
};

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
  lactacao,
  filhas,
  progenie,
  criadorSlug,
}: {
  metricas: Metrica[];
  aml: AmlData | null;
  medidas: Medida[];
  lactacao: Lactacao;
  filhas: FilhasData;
  progenie: ProgenieData;
  criadorSlug: string;
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
        {lactacao.aberta && <LactacaoAberta aberta={lactacao.aberta} />}
        {lactacao.enc && lactacao.enc.length > 0 && <CarrosselEncerradas enc={lactacao.enc} />}
        {metricas.length > 0 && (
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
        )}
        <ProgeniePerf progenie={progenie} />
        <Filhas filhas={filhas} criadorSlug={criadorSlug} />
        {!lactacao.aberta &&
          !(lactacao.enc && lactacao.enc.length > 0) &&
          metricas.length === 0 &&
          !(progenie.cats && progenie.cats.length > 0) &&
          filhas.publicadas.length === 0 && (
            <div className="block">
              <div className="empty-note">
                <Info size={13} strokeWidth={1.8} />
                {t('emBreveProducao')}
              </div>
            </div>
          )}
      </div>

      <div className="panel" role="tabpanel" hidden={tab !== 'ta'}>
        {aml && <AmlBloco aml={aml} />}
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
