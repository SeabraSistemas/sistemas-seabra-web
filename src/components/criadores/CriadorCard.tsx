import { ArrowRight, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { racasResumo } from '@/lib/criadores/normalize';
import { CriadorAvatar } from './CriadorAvatar';
import { CriadorContatos } from './CriadorContatos';
import type { Criador } from '@/lib/criadores/types';

/**
 * Card do criador no indice. Stretched link (um tab stop no card); o botao de
 * contato fica relative z-10 como tab stop separado. Nunca <a> dentro de <a>.
 */
export async function CriadorCard({ criador }: { criador: Criador }) {
  const t = await getTranslations('criadores');
  const { badges, extra } = racasResumo(criador.racas);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-primary/40">
      <div className="flex items-start gap-4 p-6">
        <CriadorAvatar criador={criador} size={64} />
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-tight text-gray-900">
            <Link href={`/criadores/${criador.slug}`} className="after:absolute after:inset-0">
              {criador.criador}
            </Link>
          </h3>
          {criador.numero_criador && (
            <div className="mt-1 text-sm text-gray-500">
              {t('criadorLabel', { numero: criador.numero_criador })}
            </div>
          )}
          {criador.localizacao && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {criador.localizacao}
            </div>
          )}
        </div>
      </div>
      <hr className="border-gray-200" />
      <div className="p-6 pt-4">
        <div className="text-xl font-semibold tabular-nums text-gray-900">
          {t('animaisNaVitrine', { n: criador.total_animais })}
        </div>
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map((r) => (
              <span key={r} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-gray-600">
                {r}
              </span>
            ))}
            {extra > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-gray-600">+{extra}</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-auto flex flex-col gap-2 p-6 pt-0">
        <Link
          href={`/criadores/${criador.slug}`}
          className="btn-modern relative z-10 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium"
        >
          {t('verAnimais', { n: criador.total_animais })}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <CriadorContatos criador={criador} label={t('contatoCriador')} className="relative z-10 w-full" />
      </div>
    </article>
  );
}
