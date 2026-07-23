'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Progenie } from '@/lib/criadores/types';

/** v.toFixed(1) com o sinal preservado (0.0, 7.1, -3.9). */
function fmt(v: number): string {
  return v.toFixed(1);
}
/** classe de cor: azul (>=0) / vermelho (<0), igual ao card do app. */
function cor(v: number): 'pos' | 'neg' {
  return v >= 0 ? 'pos' : 'neg';
}

/**
 * Performance da Progênie (Base Materna) — espelha o card do app e o protótipo
 * v12 (perfProgenie). Categorias expansíveis: header com o índice médio (azul/
 * vermelho) e, ao expandir, os subitens. A confiabilidade (%) vira um badge
 * verde/âmbar/vermelho; some quando é 0 (ex.: fêmea sem filhas avaliadas).
 *
 * Os valores vêm prontos do snapshot (vitrine_animal.progenie) — herdados do app,
 * nunca recalculados aqui. A composição do leite já vem fora dos subitens.
 */
export function ProgeniePerf({ progenie }: { progenie: Progenie }) {
  const t = useTranslations('criadores');
  const [abertas, setAbertas] = useState<Set<number>>(new Set());

  const cats = progenie.cats ?? [];
  if (cats.length === 0) return null;

  const conf = progenie.conf ?? 0;
  const confClasse = conf >= 66 ? 'g' : conf >= 33 ? 'y' : 'r';

  function toggle(i: number) {
    setAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('progenieTitulo')}</h3>
        <span className="k">{t('progenieBase')}</span>
      </div>

      {conf > 0 && (
        <div className={`ppconf ${confClasse}`}>
          {t('progenieConfiabilidade', { n: Math.round(conf) })}
        </div>
      )}

      <div className="ppcats">
        {cats.map((c, i) => {
          const aberta = abertas.has(i);
          return (
            <div className="ppcat" key={c.n}>
              <button
                type="button"
                className="ppcat-h"
                aria-expanded={aberta}
                onClick={() => toggle(i)}
              >
                <span className="ppcat-n">{c.n}</span>
                <span className={`ppcat-v ${cor(c.v)}`}>{fmt(c.v)}</span>
                <ChevronDown className="ppchev" strokeWidth={2.2} />
              </button>
              <div className="ppcat-sub" hidden={!aberta}>
                {(c.sub ?? []).map(([label, val]) => (
                  <div className="ppsub" key={label}>
                    <span>{label}</span>
                    <span className={cor(val)}>{fmt(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
