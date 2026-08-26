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
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-card border border-border px-5 py-5 text-foreground sm:flex-row sm:text-left">
      <div className="grid h-12 w-12 shrink-0 place-items-center">
        <Image
          src="/images/logo-icon.svg"
          alt="Sistema Seabra"
          width={48}
          height={48}
          className="object-contain brightness-0 invert"
        />
      </div>
      <div className="min-w-0 text-center sm:text-left">
        {/* estilos inline (sem classes utilitárias no <b>): no wrapper .crd-foot
            o <b> vinha aparecendo como caixa branca vazia; o RodapeFicha (que
            funciona) também usa um <b> sem classes. */}
        <b style={{ display: 'block', fontFamily: 'var(--vit-serif, Georgia, serif)', fontSize: '1rem', fontWeight: 600, lineHeight: 1.2, background: 'transparent', color: 'inherit' }}>
          {t('marcaTitulo')}
        </b>
        <span className="text-xs opacity-80">{t('marcaSub')}</span>
        <div className="mt-0.5 font-mono text-xs opacity-90">{t('marcaDominio')}</div>
      </div>
      <div className="hidden flex-1 sm:block" />
      <a
        href="https://www.sistemaseabra.com.br/apresentacao"
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--ocre-hover)]"
      >
        {t('conhecaSistema')} →
      </a>
    </div>
  );
}
