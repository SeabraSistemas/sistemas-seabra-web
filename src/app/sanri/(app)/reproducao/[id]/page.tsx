import Link from 'next/link';
import { EstacaoDetalhe } from '@/components/sanri/EstacaoDetalhe';
import { hojeCompacto } from '@/lib/painel/format';
import { acompanharEstacao, candidatas, estacaoAtiva, fimEfetivo, indicadores } from '@/lib/sanri/monta';
import { getReproducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function EstacaoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirSessao();
  const { id } = await params;
  const { configurado, ok, carregadoEm, animais, dados, estacoes } = await getReproducao();
  const estacao = estacoes.find((e) => e.id === id);
  if (!estacao) {
    return (
      <p className="text-sm text-ink-2">
        Estação não encontrada (pode ter sido excluída).{' '}
        <Link href="/sanri/reproducao" className="font-semibold text-bay underline underline-offset-2">
          Voltar para Monta livre
        </Link>
      </p>
    );
  }

  const hoje = hojeCompacto();
  const linhas = acompanharEstacao(estacao, dados, hoje);
  const periodo = { inicio: estacao.inicio, fim: Math.min(fimEfetivo(estacao), hoje) };
  const novas = candidatas(dados.coberturas, estacoes, estacao.reprodutor, periodo, estacao.id).filter(
    (c) => !c.ocupadaEm && !estacao.femeas.includes(c.femea),
  ).length;
  const daEstacao = new Set([estacao.reprodutor, ...estacao.femeas]);

  return (
    <EstacaoDetalhe
      estacao={estacao}
      ativa={estacaoAtiva(estacao, hoje)}
      linhas={linhas}
      ind={indicadores(linhas, hoje)}
      animais={animais.filter((a) => daEstacao.has(a.chave))}
      novas={novas}
      hoje={hoje}
      configurado={configurado}
      ok={ok}
      carregadoEm={carregadoEm}
    />
  );
}
