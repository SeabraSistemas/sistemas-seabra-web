import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { iniciais } from '@/lib/criadores/normalize';
import type { Criador } from '@/lib/criadores/types';

/**
 * Card do criador no índice (protótipo v12): faixa azul com a logo transbordando,
 * nome (serif), raças, localização condicional, resumo N machos/N fêmeas/N raças,
 * e CTA "Ver plantel". O card inteiro é o link para a página do criador.
 */
export async function CriadorCard({ criador }: { criador: Criador }) {
  const t = await getTranslations('criadores');
  const racas = criador.racas.join(', ');
  return (
    <Link href={`/criadores/${criador.slug}`} className="ccard">
      <div
        className="ccard-top"
        style={criador.capa_url ? { backgroundImage: `url(${criador.capa_url})` } : undefined}
      >
        {criador.logo_url ? (
          <div className="ccard-logo">
            <Image src={criador.logo_url} alt="" width={62} height={62} />
          </div>
        ) : (
          <div className="ccard-logo mono">{iniciais(criador.criador)}</div>
        )}
      </div>
      <div className="ccard-body">
        <h3 className="serif">{criador.criador}</h3>
        {racas && <div className="sub">{racas}</div>}
        {criador.localizacao && (
          <div className="cloc">
            <MapPin size={12} strokeWidth={1.8} />
            {criador.localizacao}
          </div>
        )}
        <div className="ccard-meta">
          {criador.machos > 0 && (
            <div>
              <b>{criador.machos}</b>
              {t('metaMachos', { n: criador.machos })}
            </div>
          )}
          {criador.femeas > 0 && (
            <div>
              <b>{criador.femeas}</b>
              {t('metaFemeas', { n: criador.femeas })}
            </div>
          )}
          {criador.racas.length > 0 && (
            <div>
              <b>{criador.racas.length}</b>
              {t('metaRacas', { n: criador.racas.length })}
            </div>
          )}
        </div>
        <div className="ccard-cta">
          {t('verPlantel')}
          <ArrowRight size={15} strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
