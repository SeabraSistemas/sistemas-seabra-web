import { CdnPainel } from '@/components/sanri/CdnCdcPainel';
import { getAbcc, hojeBrasilia } from '@/lib/sanri/abcc-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function CdnPage() {
  await exigirSessao();
  const leitura = await getAbcc({ crias: true });
  return <CdnPainel {...leitura} hoje={hojeBrasilia()} />;
}
