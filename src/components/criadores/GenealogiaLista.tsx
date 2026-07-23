import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Ancestral, Genealogia } from '@/lib/criadores/types';

/**
 * Genealogia da ficha (Fase 1): acordeao por linhagem, 2 geracoes abertas + 3a
 * em <details> nativo (indexavel, Ctrl+F acha, funciona sem JS). Fonte = snapshot
 * vitrine_animal.genealogia (nome + numero). Traco azul = macho, rosa = femea.
 * So renderiza a linhagem que existe; nunca card vazio "MAE nao informada".
 */
const AZUL = '#2563eb';
const ROSA = '#db2777';

function fmt(a?: Ancestral): { nome: string; numero: string | null } | null {
  if (!a) return null;
  const nome = a.nome?.trim();
  const numero = a.numero?.trim() || null;
  if (nome) return { nome, numero };
  if (numero) return { nome: `Nº ${numero}`, numero: null };
  return null;
}

function Avo({ sexo, anc }: { sexo: 'm' | 'f'; anc?: Ancestral }) {
  const f = fmt(anc);
  if (!f) return null;
  return (
    <div className="border-l-2 pl-3" style={{ borderColor: sexo === 'm' ? AZUL : ROSA }}>
      <div className="text-xs font-medium text-gray-900" title={f.nome}>
        <span aria-hidden style={{ color: sexo === 'm' ? AZUL : ROSA }}>{sexo === 'm' ? '♂ ' : '♀ '}</span>
        {f.nome}
      </div>
      {f.numero && <div className="font-mono text-[11px] text-gray-500">{f.numero}</div>}
    </div>
  );
}

function Bolha({ sexo, anc }: { sexo: 'm' | 'f'; anc?: Ancestral }) {
  const f = fmt(anc);
  if (!f) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
      <div className="line-clamp-2 text-[11px] font-medium uppercase text-gray-900" title={f.nome}>
        <span aria-hidden style={{ color: sexo === 'm' ? AZUL : ROSA }}>{sexo === 'm' ? '♂ ' : '♀ '}</span>
        {f.nome}
      </div>
      {f.numero && <div className="font-mono text-[10px] text-gray-500">{f.numero}</div>}
    </div>
  );
}

function Linhagem({
  sexo,
  topLabel,
  top,
  avoM,
  avoF,
  bis,
  bisLabel,
}: {
  sexo: 'm' | 'f';
  topLabel: string;
  top?: Ancestral;
  avoM?: Ancestral;
  avoF?: Ancestral;
  bis: (Ancestral | undefined)[];
  bisLabel: string;
}) {
  const f = fmt(top);
  if (!f) return null;
  const temAvos = Boolean(fmt(avoM) || fmt(avoF));
  const bisPresentes = bis.filter((b) => fmt(b));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: sexo === 'm' ? AZUL : ROSA }}>
        {sexo === 'm' ? '♂ ' : '♀ '}
        {topLabel}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900">{f.nome}</div>
      {f.numero && <div className="font-mono text-[11px] text-gray-500">{f.numero}</div>}
      {temAvos && (
        <div className="mt-3 space-y-2">
          <Avo sexo="m" anc={avoM} />
          <Avo sexo="f" anc={avoF} />
        </div>
      )}
      {bisPresentes.length > 0 && (
        <details className="group mt-3">
          <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-primary">
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
            {bisLabel}
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Bolha sexo="m" anc={bis[0]} />
            <Bolha sexo="f" anc={bis[1]} />
            <Bolha sexo="m" anc={bis[2]} />
            <Bolha sexo="f" anc={bis[3]} />
          </div>
        </details>
      )}
    </div>
  );
}

export async function GenealogiaLista({ genealogia }: { genealogia: Genealogia }) {
  const t = await getTranslations('criadores');
  if (!fmt(genealogia.pai) && !fmt(genealogia.mae)) return null;

  const bisPat = [genealogia.bis_ppp, genealogia.bis_ppm, genealogia.bis_pmp, genealogia.bis_pmm];
  const bisMat = [genealogia.bis_mpp, genealogia.bis_mpm, genealogia.bis_mmp, genealogia.bis_mmm];
  const nPat = bisPat.filter((b) => fmt(b)).length;
  const nMat = bisMat.filter((b) => fmt(b)).length;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('genealogiaLabel')}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Linhagem
          sexo="m"
          topLabel={t('pai')}
          top={genealogia.pai}
          avoM={genealogia.avo_pp}
          avoF={genealogia.avo_pm}
          bis={bisPat}
          bisLabel={t('bisavosPaternos', { n: nPat })}
        />
        <Linhagem
          sexo="f"
          topLabel={t('mae')}
          top={genealogia.mae}
          avoM={genealogia.avo_mp}
          avoF={genealogia.avo_mm}
          bis={bisMat}
          bisLabel={t('bisavosMaternos', { n: nMat })}
        />
      </div>
    </section>
  );
}
