import Link from 'next/link';
import { FichaReprodutor } from '@/components/sanri/FichaReprodutor';
import { getReprodutores } from '@/lib/sanri/reprodutores-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function ReprodutorPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao();
  const { id } = await params;
  const paiId = Number(id);
  const { configurado, ok, carregadoEm, animais, lactacoes } = await getReprodutores();
  const reprodutor = animais.find((a) => a.id === paiId);

  if (!reprodutor) {
    return (
      <p className="text-sm text-ink-2">
        {ok ? 'Reprodutor não encontrado, ou sem filha com lactação encerrada.' : 'Não foi possível ler os dados do app agora.'}{' '}
        <Link href="/sanri/reproducao/reprodutores" className="font-semibold text-bay underline underline-offset-2">
          Voltar para Reprodutores
        </Link>
      </p>
    );
  }

  const filhas = animais.filter((a) => a.sexo === 'femea' && a.paiId === paiId);
  const ids = new Set(filhas.map((f) => f.id));
  return (
    <FichaReprodutor
      reprodutor={reprodutor}
      pai={animais.find((a) => a.id === reprodutor.paiId) ?? null}
      mae={animais.find((a) => a.id === reprodutor.maeId) ?? null}
      animais={[reprodutor, ...filhas]}
      lactacoes={lactacoes.filter((l) => ids.has(l.animalId))}
      configurado={configurado}
      ok={ok}
      carregadoEm={carregadoEm}
    />
  );
}
