'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Filha = { slug: string; nome: string | null; numero: string; sexo: 'macho' | 'femea'; foto: string | null };
type FilhasData = { total: number; publicadas: Filha[] };

/**
 * Filhas (progênie) publicadas — bloco "Filhas: N de Total" + cards linkando
 * para a ficha de cada filha divulgada. Só as publicadas viram card; o total
 * (todas as filhas) é sempre citado. Some quando não há filha publicada.
 */
export function Filhas({ filhas, criadorSlug }: { filhas: FilhasData; criadorSlug: string }) {
  const t = useTranslations('criadores');
  if (!filhas.publicadas || filhas.publicadas.length === 0) return null;
  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('filhasTitulo')}</h3>
        <span className="k">{t('filhasContagem', { n: filhas.publicadas.length, total: filhas.total })}</span>
      </div>
      <div className="prog">
        {filhas.publicadas.map((f) => {
          const nome = f.nome ?? `Nº ${f.numero}`;
          return (
            <Link key={f.slug} href={`/criadores/${criadorSlug}/${f.slug}`} className="pcard">
              <div className="pcard-photo">
                {f.foto ? (
                  <Image src={f.foto} alt={nome} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="pcard-ph">
                    <Image src="/images/logo-icon.png" alt="" width={40} height={40} />
                  </div>
                )}
              </div>
              <div className="pb">
                <div className="nm">{nome}</div>
                <div className="pd">Nº {f.numero}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
