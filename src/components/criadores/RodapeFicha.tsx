import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

/**
 * Rodapé da ficha (protótipo v12): faixa azul com a logo branca +
 * "Sistema Seabra / Pequenos Ruminantes" + CTA "Conheça o sistema →".
 * É o material que "sai" para circular no WhatsApp. Único link real: /apresentacao.
 */
export async function RodapeFicha() {
  const t = await getTranslations('criadores');
  return (
    <div className="ficha-foot">
      <div className="foot-logo">
        <Image
          src="/images/logo-icon.png"
          alt="Sistema Seabra"
          width={56}
          height={56}
          className="brightness-0 invert"
        />
      </div>
      <div className="ft">
        <b>{t('marcaTitulo')}</b>
        <span>{t('marcaSub')}</span>
      </div>
      <div className="grow" />
      <a
        className="cta"
        href="https://www.sistemaseabra.com.br/apresentacao"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('conhecaSistema')} →
      </a>
    </div>
  );
}
