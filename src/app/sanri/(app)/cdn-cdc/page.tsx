import { CdnCdcPainel } from '@/components/sanri/CdnCdcPainel';
import { getAbcc, hojeBrasilia } from '@/lib/sanri/abcc-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function CdnCdcPage() {
  await exigirSessao();
  const leitura = await getAbcc();
  return <CdnCdcPainel {...leitura} hoje={hojeBrasilia()} />;
}
