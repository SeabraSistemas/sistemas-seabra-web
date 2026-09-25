import { ProducaoView } from '@/components/sanri/ProducaoView';
import { hojeCompacto } from '@/lib/painel/format';
import { getProducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function ProducaoPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, leituras, saidas } = await getProducao();
  return <ProducaoView leituras={leituras} saidas={saidas} hoje={hojeCompacto()} configurado={configurado} ok={ok} carregadoEm={carregadoEm} />;
}
