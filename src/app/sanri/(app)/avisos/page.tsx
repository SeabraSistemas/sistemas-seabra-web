import { AvisosPainel } from '@/components/sanri/AvisosPainel';
import { dataValida, hojeBrasilia } from '@/lib/sanri/avisos';
import { getAvisos } from '@/lib/sanri/avisos-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function AvisosPage({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const data = dataValida((await searchParams).data) ?? hoje;
  const leitura = await getAvisos(data);
  return <AvisosPainel {...leitura} data={data} hoje={hoje} />;
}
