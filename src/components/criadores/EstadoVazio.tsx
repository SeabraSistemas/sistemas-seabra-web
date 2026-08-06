import { Link } from '@/i18n/routing';

/**
 * Estado vazio da vitrine (indice sem criadores publicados, ou filtro sem
 * resultado). NUNCA renderizar skeleton permanente nem "nada aqui" seco.
 */
export function EstadoVazio({
  titulo,
  texto,
  ctaLabel,
  ctaHref,
}: {
  titulo: string;
  texto: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="btn-modern mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
