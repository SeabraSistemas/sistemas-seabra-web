import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

/**
 * Faixa de marca no rodape da pagina do criador e da ficha: logo branca +
 * "Sistema Seabra / Pequenos Ruminantes" + dominio + CTA "Conheca o sistema".
 * E o material que "sai" para circular no WhatsApp. Unico link real: /apresentacao.
 */
export async function MarcaSeabra() {
  const t = await getTranslations('criadores');
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-primary to-blue-500 px-5 py-5 text-white sm:flex-row sm:text-left">
      <div className="grid h-12 w-12 shrink-0 place-items-center">
        <Image
          src="/images/logo.png"
          alt="Sistema Seabra"
          width={48}
          height={48}
          className="object-contain brightness-0 invert"
        />
      </div>
      <div className="min-w-0 text-center sm:text-left">
        <b className="block font-serif text-base font-semibold leading-tight">{t('marcaTitulo')}</b>
        <span className="text-xs opacity-80">{t('marcaSub')}</span>
        <div className="mt-0.5 font-mono text-xs opacity-90">{t('marcaDominio')}</div>
      </div>
      <div className="hidden flex-1 sm:block" />
      <a
        href="https://www.sistemaseabra.com.br/apresentacao"
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
      >
        {t('conhecaSistema')} →
      </a>
    </div>
  );
}
