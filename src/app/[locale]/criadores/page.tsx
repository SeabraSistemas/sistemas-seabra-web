import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCriadores } from '@/lib/criadores/queries';
import { CriadorCard } from '@/components/criadores/CriadorCard';
import { EstadoVazio } from '@/components/criadores/EstadoVazio';

// RSC + ISR: revalida a cada 5 min (a lista muda quando um produtor
// consente/publica pelo app). Fase 1: noindex (thin content com 1 criador).
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'criadores' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function CriadoresIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('criadores');
  const criadores = await getCriadores();
  const totalAnimais = criadores.reduce((s, c) => s + c.total_animais, 0);

  return (
    <div className="container-wide pb-20 pt-28 md:pt-32">
      <div className="mb-8 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{t('eyebrow')}</span>
        <h1 className="heading-1 mt-2 text-gray-900">{t('title')}</h1>
        <p className="body-large mt-3 text-gray-500">{t('subtitle')}</p>
        {criadores.length > 0 && (
          <p className="mt-4 text-sm text-gray-500" aria-live="polite">
            {t('contagem', { criadores: criadores.length, animais: totalAnimais })}
          </p>
        )}
      </div>

      {criadores.length === 0 ? (
        <EstadoVazio
          titulo={t('vazioTitulo')}
          texto={t('vazioTexto')}
          ctaLabel={t('vazioCta')}
          ctaHref="/contato"
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {criadores.map((c) => (
              <CriadorCard key={c.slug} criador={c} />
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-gray-200 bg-surface-light p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900">{t('seuPlantelTitulo')}</h2>
            <p className="mt-1 max-w-xl text-sm text-gray-500">{t('seuPlantelTexto')}</p>
            <Link
              href="/contato"
              className="btn-modern mt-4 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium"
            >
              {t('seuPlantelCta')}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
