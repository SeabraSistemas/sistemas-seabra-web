import { ReguaPainel } from '@/components/sanri/ReguaPainel';
import { hojeCompacto } from '@/lib/painel/format';
import { getProducao, getTabelaRegua } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function ReguaPage() {
  await exigirSessao();
  const [{ configurado, ok, carregadoEm, leituras }, tabela] = await Promise.all([getProducao(), getTabelaRegua()]);
  return <ReguaPainel tabela={tabela} leituras={leituras} hoje={hojeCompacto()} configurado={configurado} ok={ok} carregadoEm={carregadoEm} />;
}
