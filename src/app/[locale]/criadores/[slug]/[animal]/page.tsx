import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPaginaAnimal, getTodosSlugsAnimais } from '@/lib/criadores/queries';
import { altAnimal, idadeExibivel, metricasDe, nomeExibivel } from '@/lib/criadores/normalize';
import { AnimalFoto } from '@/components/criadores/AnimalFoto';
import { SexoBadge } from '@/components/criadores/SexoBadge';
import { GenealogiaArvore } from '@/components/criadores/GenealogiaArvore';
import { FichaTabs } from '@/components/criadores/FichaTabs';
import { RodapeFicha } from '@/components/criadores/RodapeFicha';
import { Disclaimer } from '@/components/criadores/Disclaimer';

// dynamicParams=true: fichas rendem sob demanda (cache ISR de 1h).
export const revalidate = 3600;
export const dynamicParams = true;

/** "YYYY-MM-DD" -> "DD/MM/YYYY"; null se ausente/invalido. */
function fmtData(d: string | null): string | null {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return null;
  return `${day}/${m}/${y}`;
}

export async function generateStaticParams() {
  try {
    const rows = await getTodosSlugsAnimais();
    return rows.map((r) => ({ slug: r.criador, animal: r.animal }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; animal: string }>;
}): Promise<Metadata> {
  const { locale, slug, animal } = await params;
  const t = await getTranslations({ locale, namespace: 'criadores' });
  const pag = await getPaginaAnimal(slug, animal).catch(() => null);
  if (!pag) return { title: t('naoEncontradoTitulo'), robots: { index: false, follow: false } };
  return {
    title: `${nomeExibivel(pag.animal)} — ${pag.criador.criador}`,
    robots: { index: false, follow: true },
  };
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; animal: string }>;
}) {
  const { locale, slug, animal } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('criadores');
  const pag = await getPaginaAnimal(slug, animal);
  if (!pag) notFound();
  const { criador, animal: a, indice, total, anteriorSlug, proximoSlug } = pag;

  const idade = idadeExibivel(a);
  const nascimento = fmtData(a.data_nascimento);
  const metricas = metricasDe(a);

  return (
    <>
      <Link href={`/criadores/${slug}`} className="crd-back">
        <ChevronLeft size={15} strokeWidth={2} />
        {t('verAnimais', { n: total })}
      </Link>

      <section className="ficha-head">
        <div className="ficha-photo">
          <AnimalFoto
            src={a.fotos[0] ?? null}
            alt={altAnimal(a, criador.criador)}
            blurDataURL={a.blur_data_url}
            priority
            sizes="(max-width:640px) 220px, 188px"
          />
        </div>

        <div className="ficha-id">
          <span className="eyebrow">{criador.criador}</span>
          <h1 className="serif">{nomeExibivel(a)}</h1>
          <div className="idnum">Nº {a.numero}</div>
          <div className="idrow">
            <SexoBadge sexo={a.sexo_norm} />
            {a.raca && <span className="badge b-raca">{a.raca}</span>}
            {a.grau_sangue && <span className="badge b-po">{a.grau_sangue}</span>}
            {a.categoria_rg && <span className="badge">{a.categoria_rg}</span>}
            {idade && <span className="badge">{idade}</span>}
          </div>
          {(nascimento || a.peso_kg != null) && (
            <div className="facts">
              {nascimento && (
                <div className="fact">
                  {t('fatoNascimento')}
                  <b>{nascimento}</b>
                </div>
              )}
              {a.peso_kg != null && (
                <div className="fact">
                  {t('fatoPeso')}
                  <b>{a.peso_kg} kg</b>
                </div>
              )}
            </div>
          )}
          {criador.whatsapp && (
            <div className="ficha-actions">
              <a
                className="btn btn-wa"
                href={`https://wa.me/${criador.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} />
                {t('contato')}
              </a>
            </div>
          )}
        </div>

        <GenealogiaArvore genealogia={a.genealogia} />
      </section>

      <FichaTabs metricas={metricas} />

      <div className="ficha-nav">
        {anteriorSlug ? (
          <Link href={`/criadores/${slug}/${anteriorSlug}`}>
            <ChevronLeft size={15} strokeWidth={2} />
            {t('anterior')}
          </Link>
        ) : (
          <span />
        )}
        <span className="idx">
          {indice} / {total}
        </span>
        {proximoSlug ? (
          <Link href={`/criadores/${slug}/${proximoSlug}`}>
            {t('proximo')}
            <ChevronRight size={15} strokeWidth={2} />
          </Link>
        ) : (
          <span />
        )}
      </div>

      <RodapeFicha />
      <div className="crd-foot">
        <Disclaimer />
      </div>
    </>
  );
}
