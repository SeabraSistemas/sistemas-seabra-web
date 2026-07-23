import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPaginaCriador, getTodosSlugsCriadores } from '@/lib/criadores/queries';
import { CriadorHeader } from '@/components/criadores/CriadorHeader';
import { AnimalCard } from '@/components/criadores/AnimalCard';
import { MarcaSeabra } from '@/components/criadores/MarcaSeabra';
import { Disclaimer } from '@/components/criadores/Disclaimer';
import type { Animal } from '@/lib/criadores/types';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getTodosSlugsCriadores();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'criadores' });
  const pag = await getPaginaCriador(slug).catch(() => null);
  if (!pag) return { title: t('naoEncontradoTitulo'), robots: { index: false, follow: false } };
  return {
    title: pag.criador.criador,
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function CriadorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('criadores');
  const pag = await getPaginaCriador(slug);
  if (!pag) notFound();
  const { criador, animais } = pag;
  const machos = animais.filter((a) => a.sexo_norm === 'macho');
  const femeas = animais.filter((a) => a.sexo_norm === 'femea');

  return (
    <div className="container-wide pb-20 pt-24 md:pt-28">
      <Link
        href="/criadores"
        className="mb-4 inline-flex h-11 items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('voltarCriadores')}
      </Link>

      <CriadorHeader criador={criador} />

      <div className="mt-8 space-y-8">
        {machos.length > 0 && (
          <Secao titulo={t('secaoMachos')} animais={machos} criadorNome={criador.criador} />
        )}
        {femeas.length > 0 && (
          <Secao titulo={t('secaoFemeas')} animais={femeas} criadorNome={criador.criador} />
        )}
      </div>

      <div className="mt-12 space-y-4">
        <MarcaSeabra />
        <Disclaimer />
      </div>
    </div>
  );
}

function Secao({ titulo, animais, criadorNome }: { titulo: string; animais: Animal[]; criadorNome: string }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{titulo}</h2>
        <span className="font-mono text-xs text-gray-400">{animais.length}</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {animais.map((a) => (
          <AnimalCard key={a.animal_slug} animal={a} criadorNome={criadorNome} />
        ))}
      </div>
    </section>
  );
}
