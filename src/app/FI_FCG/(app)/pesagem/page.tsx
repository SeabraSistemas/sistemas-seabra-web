import { PesagemView } from '@/components/fi-fcg/PesagemView';
import { CAMPOS_PESAGEM, CAMPOS_REBANHO_ENGORDA, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getAnimaisEmEngorda, getPesagem } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function PesagemPage() {
  await exigirSessao();
  const [pesagem, engorda] = await Promise.all([getPesagem(), getAnimaisEmEngorda()]);
  return (
    <PesagemView
      dados={empacotarLeitura(pesagem, CAMPOS_PESAGEM)}
      engorda={empacotarLeitura(engorda, CAMPOS_REBANHO_ENGORDA)}
    />
  );
}
