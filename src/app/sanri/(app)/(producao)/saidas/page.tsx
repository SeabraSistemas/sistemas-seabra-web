import { SaidasPainel } from '@/components/sanri/SaidasPainel';
import { hojeCompacto } from '@/lib/painel/format';
import { getProducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function SaidasPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, saidas } = await getProducao();
  return <SaidasPainel saidas={saidas} hoje={hojeCompacto()} configurado={configurado} ok={ok} carregadoEm={carregadoEm} />;
}
