import { RebanhoView } from '@/components/fi-fcg/RebanhoView';
import { CAMPOS_REBANHO, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getRebanho } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function RebanhoPage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getRebanho(), CAMPOS_REBANHO);
  return <RebanhoView dados={dados} />;
}
