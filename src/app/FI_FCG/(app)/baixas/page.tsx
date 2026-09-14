import { BaixasView } from '@/components/fi-fcg/BaixasView';
import { getBaixas } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function BaixasPage() {
  await exigirSessao();
  const dados = await getBaixas();
  return <BaixasView dados={dados} />;
}
