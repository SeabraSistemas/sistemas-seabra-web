import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPaginaCriador, getTodosSlugsCriadores } from '@/lib/criadores/queries';
import { CriadorHeader } from '@/components/criadores/CriadorHeader';
import { PlantelFiltravel } from '@/components/criadores/PlantelFiltravel';
import { MarcaSeabra } from '@/components/criadores/MarcaSeabra';
import { Disclaimer } from '@/components/criadores/Disclaimer';

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
    <>
      <Link href="/criadores" className="crd-back">
        <ChevronLeft size={15} strokeWidth={2} />
        {t('voltarCriadores')}
      </Link>

      <CriadorHeader criador={criador} />

      <PlantelFiltravel
        machos={machos}
        femeas={femeas}
        racas={criador.racas}
        criadorNome={criador.criador}
      />

      <div className="crd-foot">
        <MarcaSeabra />
        <Disclaimer />
      </div>
    </>
  );
}
