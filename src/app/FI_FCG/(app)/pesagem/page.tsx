import { PesagemView } from '@/components/fi-fcg/PesagemView';
import { CAMPOS_PESAGEM, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getPesagem } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function PesagemPage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getPesagem(), CAMPOS_PESAGEM);
  return <PesagemView dados={dados} />;
}
