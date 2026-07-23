'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimalCard } from './AnimalCard';
import type { Animal } from '@/lib/criadores/types';

/**
 * Grade filtrável do plantel (protótipo v12). Chips de sexo + raça com lógica
 * OR: animal passa se (nenhum sexo marcado OU o seu sexo marcado) E (nenhuma
 * raça marcada OU a sua raça marcada). Nenhum chip começa pressionado. A seção
 * (label + grade) que ficar vazia após o filtro SOME inteira. Machos primeiro.
 */
export function PlantelFiltravel({
  machos,
  femeas,
  racas,
  criadorNome,
}: {
  machos: Animal[];
  femeas: Animal[];
  racas: string[];
  criadorNome: string;
}) {
  const t = useTranslations('criadores');
  const [sexSel, setSexSel] = useState<Set<string>>(new Set());
  const [racaSel, setRacaSel] = useState<Set<string>>(new Set());

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  const pass = (a: Animal) =>
    (sexSel.size === 0 || sexSel.has(a.sexo_norm)) &&
    (racaSel.size === 0 || (a.raca != null && racaSel.has(a.raca)));

  const machosF = machos.filter(pass);
  const femeasF = femeas.filter(pass);

  return (
    <>
      <div className="controls">
        <span className="flabel">{t('filtrar')}</span>
        <div className="chips">
          {machos.length > 0 && (
            <button
              type="button"
              className="chip"
              aria-pressed={sexSel.has('macho')}
              onClick={() => toggle(sexSel, setSexSel, 'macho')}
            >
              ♂ {t('secaoMachos')}
            </button>
          )}
          {femeas.length > 0 && (
            <button
              type="button"
              className="chip"
              aria-pressed={sexSel.has('femea')}
              onClick={() => toggle(sexSel, setSexSel, 'femea')}
            >
              ♀ {t('secaoFemeas')}
            </button>
          )}
          {racas.map((r) => (
            <button
              key={r}
              type="button"
              className="chip"
              aria-pressed={racaSel.has(r)}
              onClick={() => toggle(racaSel, setRacaSel, r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {machosF.length > 0 && (
        <Secao titulo={t('secaoMachos')} animais={machosF} criadorNome={criadorNome} />
      )}
      {femeasF.length > 0 && (
        <Secao titulo={t('secaoFemeas')} animais={femeasF} criadorNome={criadorNome} />
      )}
    </>
  );
}

function Secao({ titulo, animais, criadorNome }: { titulo: string; animais: Animal[]; criadorNome: string }) {
  return (
    <>
      <div className="sec-label">
        <h2>{titulo}</h2>
        <span className="count">{animais.length}</span>
        <div className="rule" />
      </div>
      <div className="agrid">
        {animais.map((a) => (
          <AnimalCard key={a.animal_slug} animal={a} criadorNome={criadorNome} />
        ))}
      </div>
    </>
  );
}
