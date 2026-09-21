import { RebanhoView } from '@/components/fi-fcg/RebanhoView';
import { calcularDiasSemManejo } from '@/lib/fi-fcg/manejo';
import { CAMPOS_MANEJO_ANIMAL, CAMPOS_REBANHO, empacotarLeitura } from '@/lib/fi-fcg/pacotes';
import { getIatf, getPartos, getPesagem, getRebanho, getToque } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';
import { hojeCompacto } from '@/lib/painel/format';

export default async function RebanhoPage() {
  await exigirSessao();
  const [rebanho, pesagem, toque, iatf, partos] = await Promise.all([
    getRebanho(),
    getPesagem(),
    getToque(),
    getIatf(),
    getPartos(),
  ]);
  const dados = empacotarLeitura(rebanho, CAMPOS_REBANHO);
  const manejo = empacotar(
    calcularDiasSemManejo(rebanho.itens, pesagem.itens, toque.itens, iatf.itens, partos.itens, hojeCompacto()),
    CAMPOS_MANEJO_ANIMAL,
  );
  return <RebanhoView dados={dados} manejo={manejo} />;
}
