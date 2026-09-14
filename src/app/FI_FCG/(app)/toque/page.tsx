import { ToqueView } from '@/components/fi-fcg/ToqueView';
import { CAMPOS_TOQUE, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getToque } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function ToquePage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getToque(), CAMPOS_TOQUE);
  return <ToqueView dados={dados} />;
}
