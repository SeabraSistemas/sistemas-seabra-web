import { PartosView } from '@/components/fi-fcg/PartosView';
import { CAMPOS_PARTO, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getPartos } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function PartosPage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getPartos(), CAMPOS_PARTO);
  return <PartosView dados={dados} />;
}
