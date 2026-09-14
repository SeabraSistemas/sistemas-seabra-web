import { IatfView } from '@/components/fi-fcg/IatfView';
import { CAMPOS_IATF, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getIatf } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function IatfPage() {
  await exigirSessao();
  const dados = empacotarLeitura(await getIatf(), CAMPOS_IATF);
  return <IatfView dados={dados} />;
}
