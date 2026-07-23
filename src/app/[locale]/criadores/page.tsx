import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCriadores } from '@/lib/criadores/queries';
import { CriadorCard } from '@/components/criadores/CriadorCard';
import { UfFilter } from '@/components/criadores/UfFilter';
import { EstadoVazio } from '@/components/criadores/EstadoVazio';

// RSC + ISR: revalida a cada 5 min (a lista muda quando um produtor
// consente/publica pelo app). Fase 1: noindex (thin content). Ler searchParams.uf
// torna a renderizacao dinamica por request — filtro barato em memoria.
export const revalidate = 300;

/** UF a partir de "Cidade/UF" ou "UF" (sigla de 2 letras). Senao, null. */
function ufDe(loc: string | null): string | null {
  if (!loc) return null;
  const trimmed = loc.trim();
  const seg = trimmed.includes('/') ? (trimmed.split('/').pop() ?? '').trim() : trimmed;
  const uf = seg.toUpperCase();
  return /^[A-Z]{2}$/.test(uf) ? uf : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'criadores' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function CriadoresIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const ufParam = Array.isArray(sp.uf) ? sp.uf[0] : sp.uf;
  setRequestLocale(locale);
  const t = await getTranslations('criadores');
  const criadores = await getCriadores();

  // UFs distintas (para o seletor) e filtro atual normalizado.
  const ufsDisponiveis = Array.from(
    new Set(criadores.map((c) => ufDe(c.localizacao)).filter((u): u is string => u != null)),
  ).sort();
  const ufAtual = ufParam && ufsDisponiveis.includes(ufParam.toUpperCase()) ? ufParam.toUpperCase() : '';
  const visiveis = ufAtual ? criadores.filter((c) => ufDe(c.localizacao) === ufAtual) : criadores;

  return (
    <>
      <div className="idx-hero">
        <span className="eyebrow">{t('eyebrow')}</span>
        <h1 className="serif">{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      {ufsDisponiveis.length > 0 && (
        <UfFilter ufs={ufsDisponiveis} atual={ufAtual} label={t('estado')} todosLabel={t('todos')} />
      )}

      {criadores.length === 0 ? (
        <div style={{ padding: '6px 22px 28px' }}>
          <EstadoVazio
            titulo={t('vazioTitulo')}
            texto={t('vazioTexto')}
            ctaLabel={t('vazioCta')}
            ctaHref="/contato"
          />
        </div>
      ) : (
        <div className="criador-grid">
          {visiveis.map((c) => (
            <CriadorCard key={c.slug} criador={c} />
          ))}
          <CardFantasma
            titulo={t('seuPlantelTitulo')}
            texto={t('seuPlantelTexto')}
            cta={t('exclusivoPro')}
          />
        </div>
      )}
    </>
  );
}

/** Card "Seu plantel aqui" (gancho do plano Pro). Sempre no fim, nao-clicavel. */
function CardFantasma({ titulo, texto, cta }: { titulo: string; texto: string; cta: string }) {
  return (
    <div className="ccard" aria-hidden>
      <div className="ccard-top ghost" />
      <div className="ccard-body">
        <h3 className="serif mute">{titulo}</h3>
        <div className="sub">{texto}</div>
        <div className="ccard-cta mute">{cta}</div>
      </div>
    </div>
  );
}
