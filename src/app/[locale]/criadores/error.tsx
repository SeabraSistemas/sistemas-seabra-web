'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

// Distingue "erro de leitura" de "vitrine vazia" (estado legitimo do indice).
// Sem stack trace na tela; loga no console para o Felipe.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('criadores');
  useEffect(() => {
    console.error('[vitrine] erro na rota /criadores', error);
  }, [error]);

  return (
    <div className="container-wide pb-20 pt-32">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">{t('erroTitulo')}</h1>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="btn-modern inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium"
          >
            {t('erroTentar')}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-input px-5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            {t('erroVoltar')}
          </Link>
        </div>
      </div>
    </div>
  );
}
