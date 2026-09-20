import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface OperatorRow {
  operator: string;
  purpose: string;
  data: string;
  country: string;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'operatorsPage' });
  return {
    title: `${t('title')} | Seabra`,
    description: t('intro'),
    robots: { index: true, follow: true },
  };
}

export default async function OperadoresPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'operatorsPage' });
  const rows = t.raw('rows') as OperatorRow[];

  return (
    <article className="section-padding">
      <div className="container-tight max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {t('lastUpdated')}
          </p>
          <p className="text-foreground leading-relaxed mt-6">{t('intro')}</p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">
                  {t('colOperator')}
                </th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">
                  {t('colPurpose')}
                </th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">
                  {t('colData')}
                </th>
                <th className="text-left py-2 font-semibold text-foreground">
                  {t('colCountry')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.operator}>
                  <td className="py-3 pr-4 align-top font-medium text-foreground">
                    {row.operator}
                  </td>
                  <td className="py-3 pr-4 align-top text-foreground">
                    {row.purpose}
                  </td>
                  <td className="py-3 pr-4 align-top text-foreground">
                    {row.data}
                  </td>
                  <td className="py-3 align-top text-foreground">
                    {row.country}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10">
          <Link href="/privacidade" className="text-primary hover:underline">
            {t('backLink')}
          </Link>
        </p>
      </div>
    </article>
  );
}
