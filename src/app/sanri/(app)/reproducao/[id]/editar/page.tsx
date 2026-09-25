import Link from 'next/link';
import { EstadoPlanilha } from '@/components/sanri/EstadoPlanilha';
import { FormarEstacao } from '@/components/sanri/FormarEstacao';
import { hojeCompacto } from '@/lib/painel/format';
import { getReproducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function EditarEstacaoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao();
  const { id } = await params;
  const { configurado, ok, carregadoEm, animais, dados, estacoes } = await getReproducao();
  const estacao = estacoes.find((e) => e.id === id);
  if (!estacao) return <EstacaoNaoEncontrada />;
  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />
      <FormarEstacao animais={animais} dados={dados} estacoes={estacoes} hoje={hojeCompacto()} estacao={estacao} />
    </div>
  );
}

function EstacaoNaoEncontrada() {
  return (
    <p className="text-sm text-ink-2">
      Estação não encontrada (pode ter sido excluída).{' '}
      <Link href="/sanri/reproducao" className="font-semibold text-bay underline underline-offset-2">
        Voltar para Monta livre
      </Link>
    </p>
  );
}
