import { EstadoPlanilha } from '@/components/sanri/EstadoPlanilha';
import { FormarEstacao } from '@/components/sanri/FormarEstacao';
import { hojeCompacto } from '@/lib/painel/format';
import { getReproducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function NovaEstacaoPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, animais, dados, estacoes } = await getReproducao();
  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />
      <FormarEstacao animais={animais} dados={dados} estacoes={estacoes} hoje={hojeCompacto()} />
    </div>
  );
}
