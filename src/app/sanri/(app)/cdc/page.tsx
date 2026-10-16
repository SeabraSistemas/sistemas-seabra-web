import { CdcPainel } from '@/components/sanri/CdnCdcPainel';
import { getAbcc, hojeBrasilia } from '@/lib/sanri/abcc-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function CdcPage() {
  await exigirSessao();
  const leitura = await getAbcc({ coberturas: true });
  return <CdcPainel {...leitura} hoje={hojeBrasilia()} />;
}
