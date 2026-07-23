import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPaginaAnimal, getTodosSlugsAnimais } from '@/lib/criadores/queries';
import { altAnimal, idadeExibivel, nomeExibivel } from '@/lib/criadores/normalize';
import { AnimalFoto } from '@/components/criadores/AnimalFoto';
import { SexoBadge } from '@/components/criadores/SexoBadge';
import { BlocoMetricas } from '@/components/criadores/BlocoMetricas';
import { GenealogiaLista } from '@/components/criadores/GenealogiaLista';
import { MarcaSeabra } from '@/components/criadores/MarcaSeabra';
import { Disclaimer } from '@/components/criadores/Disclaimer';

// dynamicParams=true: fichas rendem sob demanda (com cache ISR de 1h) e a
// genealogia e um snapshot, entao muda pouco. generateStaticParams nunca quebra.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await getTodosSlugsAnimais();
    return rows.map((r) => ({ slug: r.criador, animal: r.animal }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; animal: string }>;
}): Promise<Metadata> {
  const { locale, slug, animal } = await params;
  const t = await getTranslations({ locale, namespace: 'criadores' });
  const pag = await getPaginaAnimal(slug, animal).catch(() => null);
  if (!pag) return { title: t('naoEncontradoTitulo'), robots: { index: false, follow: false } };
  return {
    title: `${nomeExibivel(pag.animal)} — ${pag.criador.criador}`,
    robots: { index: false, follow: true },
  };
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; animal: string }>;
}) {
  const { locale, slug, animal } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('criadores');
  const pag = await getPaginaAnimal(slug, animal);
  if (!pag) notFound();
  const { criador, animal: a, indice, total, anteriorSlug, proximoSlug } = pag;
  const idade = idadeExibivel(a);

  return (
    <div className="container-wide pb-24 pt-24 md:pt-28">
      <Link
        href={`/criadores/${slug}`}
        className="mb-4 inline-flex h-11 items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('verAnimais', { n: total })}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <AnimalFoto
            src={a.fotos[0] ?? null}
            alt={altAnimal(a, criador.criador)}
            blurDataURL={a.blur_data_url}
            priority
            sizes="(max-width:1023px) 100vw, 460px"
            className="aspect-[4/5] rounded-2xl border border-gray-200"
          />
        </div>

        <div>
          <h1 className="font-serif text-2xl font-semibold leading-tight text-gray-900">{nomeExibivel(a)}</h1>
          <div className="mt-1 font-mono text-sm text-gray-500">Nº {a.numero}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SexoBadge sexo={a.sexo_norm} />
            {a.raca && <Badge>{a.raca}</Badge>}
            {a.grau_sangue && <Badge>{a.grau_sangue}</Badge>}
            {a.categoria_rg && <Badge>{a.categoria_rg}</Badge>}
            {idade && <Badge>{idade}</Badge>}
          </div>

          <div className="mt-6 space-y-6">
            <BlocoMetricas animal={a} label={t('fichaLabel')} />
            <GenealogiaLista genealogia={a.genealogia} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
        {anteriorSlug ? (
          <Link
            href={`/criadores/${slug}/${anteriorSlug}`}
            className="inline-flex h-11 items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('anterior')}
          </Link>
        ) : (
          <span />
        )}
        <span className="font-mono text-sm text-gray-400">
          {indice} / {total}
        </span>
        {proximoSlug ? (
          <Link
            href={`/criadores/${slug}/${proximoSlug}`}
            className="inline-flex h-11 items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {t('proximo')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="mt-8 space-y-4">
        <MarcaSeabra />
        <Disclaimer />
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-gray-600">{children}</span>
  );
}
