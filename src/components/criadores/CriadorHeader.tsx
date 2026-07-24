import Image from 'next/image';
import { Globe, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { iniciais } from '@/lib/criadores/normalize';
import type { Criador } from '@/lib/criadores/types';

/**
 * Cabeçalho da página do criador (protótipo v12): faixa azul com logo + nome
 * (serif) + raças/localização, botões Contato (verde, só com whatsapp) e Site
 * (só com site_url), e a tira de resumo N machos · N fêmeas · N raças.
 * Rótulo "Contato" (nunca "WhatsApp") — regra CFMV. href = wa.me/<whatsapp>.
 */
export async function CriadorHeader({ criador }: { criador: Criador }) {
  const t = await getTranslations('criadores');
  const by = [criador.racas.join(', '), criador.localizacao].filter(Boolean).join(' · ');

  return (
    <section className="crd-head">
      <div className="crd-head-in">
        {criador.logo_url ? (
          <div className="crd-logo">
            <Image src={criador.logo_url} alt="" width={66} height={66} />
          </div>
        ) : (
          <div className="crd-logo mono">{iniciais(criador.criador)}</div>
        )}
        <div className="crd-id">
          <h1 className="serif">{criador.criador}</h1>
          {by && <div className="by">{by}</div>}
          {(criador.titulos ?? []).length > 0 && (
            <div className="crd-titulos">
              {(criador.titulos ?? []).map((titulo) => (
                <span className="crd-titulo" key={titulo}>
                  {titulo}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="crd-contacts">
          {criador.whatsapp && (
            <a className="btn btn-wa" href={`https://wa.me/${criador.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              {t('contato')}
            </a>
          )}
          {criador.site_url && (
            <a className="btn btn-ghost" href={criador.site_url} target="_blank" rel="noopener noreferrer">
              <Globe size={15} strokeWidth={1.8} />
              {t('siteBtn')}
            </a>
          )}
        </div>
      </div>
      <div className="crd-strip">
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
    </section>
  );
}
