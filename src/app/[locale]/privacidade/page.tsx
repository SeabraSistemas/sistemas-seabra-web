import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PrivacidadeContentPt } from './content-pt';
import { PrivacidadeContentEn } from './content-en';
import { PrivacidadeContentEs } from './content-es';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  return {
    title: `${t('title')} | Seabra`,
    description: t('title'),
    robots: { index: true, follow: true },
  };
}

function contentForLocale(locale: string) {
  switch (locale) {
    case 'en':
      return <PrivacidadeContentEn />;
    case 'es':
      return <PrivacidadeContentEs />;
    default:
      return <PrivacidadeContentPt />;
  }
}

export default async function PrivacidadePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  const localeNotice = t('localeNotice');

  return (
    <article className="section-padding">
      <div className="container-tight max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">{t('lastUpdated')}</p>
          {localeNotice ? (
            <div className="mt-6 rounded-lg border border-primary/40 bg-secondary p-4 text-sm text-foreground">
              {localeNotice}
            </div>
          ) : null}
        </header>

        <div className="space-y-6 text-foreground leading-relaxed">
          {contentForLocale(locale)}
        </div>
      </div>
    </article>
  );
}
