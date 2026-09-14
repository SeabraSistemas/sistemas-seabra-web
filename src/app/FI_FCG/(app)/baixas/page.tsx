import { BaixasView } from '@/components/fi-fcg/BaixasView';
import { CAMPOS_BAIXA, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getBaixas } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function BaixasPage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getBaixas(), CAMPOS_BAIXA);
  return <BaixasView dados={dados} />;
}
