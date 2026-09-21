import { PesagemView } from '@/components/fi-fcg/PesagemView';
import {
  CAMPOS_LOTE_CADASTRADO,
  CAMPOS_PESAGEM,
  CAMPOS_REBANHO_ENGORDA,
  CAMPOS_REBANHO_LOTE,
  empacotarLeitura,
} from '@/lib/fi-fcg/pacotes';
import { getAnimaisEmEngorda, getLotes, getPesagem, getRebanhoLotes } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';

export default async function PesagemPage() {
  await exigirSessao();
  const [pesagem, engorda, rebanhoLotes, lotes] = await Promise.all([
    getPesagem(),
    getAnimaisEmEngorda(),
    getRebanhoLotes(),
    getLotes(),
  ]);
  return (
    <PesagemView
      dados={empacotarLeitura(pesagem, CAMPOS_PESAGEM)}
      engorda={empacotarLeitura(engorda, CAMPOS_REBANHO_ENGORDA)}
      rebanhoLotes={empacotarLeitura(rebanhoLotes, CAMPOS_REBANHO_LOTE)}
      lotesCadastrados={empacotarLeitura(lotes, CAMPOS_LOTE_CADASTRADO)}
    />
  );
}
