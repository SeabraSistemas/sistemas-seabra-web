import { getTranslations } from 'next-intl/server';
import { CriadorAvatar } from './CriadorAvatar';
import { CriadorContatos } from './CriadorContatos';
import type { Criador } from '@/lib/criadores/types';

/** Cabecalho da pagina do criador (identidade + contato). */
export async function CriadorHeader({ criador }: { criador: Criador }) {
  const t = await getTranslations('criadores');
  const sub = [
    criador.numero_criador ? t('criadorLabel', { numero: criador.numero_criador }) : null,
    t('animaisNaVitrine', { n: criador.total_animais }),
    criador.localizacao,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <CriadorAvatar criador={criador} size={64} />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold leading-tight text-gray-900">{criador.criador}</h1>
          <div className="mt-1 text-sm text-gray-500">{sub}</div>
        </div>
      </div>
      <CriadorContatos criador={criador} label={t('contatoCriador')} />
    </div>
  );
}
