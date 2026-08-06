import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

// Criador/animal fora da vitrine (nao publicado, revogado, ou slug inexistente).
export default async function NotFound() {
  const t = await getTranslations('criadores');
  return (
    <div className="container-wide pb-20 pt-32">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">{t('naoEncontradoTitulo')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('naoEncontradoTexto')}</p>
        <Link
          href="/criadores"
          className="btn-modern mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium"
        >
          {t('naoEncontradoCta')}
        </Link>
      </div>
    </div>
  );
}
