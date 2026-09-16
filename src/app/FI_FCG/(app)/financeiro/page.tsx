import { FinanceiroView } from '@/components/fi-fcg/FinanceiroView';
import { montarEventos } from '@/lib/fi-fcg/financeiro';
import { FUNIS_BOVINO, calcularFunis, gmdSugeridoPorCategoria, montarRetratoMomento } from '@/lib/fi-fcg/custoFormacao';
import {
  CAMPOS_CATEGORIA_CUSTO,
  CAMPOS_CUSTO,
  CAMPOS_EVENTO,
  CAMPOS_FINANCEIRO,
  CAMPOS_GMD_CATEGORIA,
  CAMPOS_IATF_PROJECAO,
  CAMPOS_ITEM_DIETA,
  CAMPOS_INSUMO,
  CAMPOS_MARCO_IDADE,
  CAMPOS_REBANHO_PROJECAO,
  type PacoteFinanceiro,
} from '@/lib/fi-fcg/pacotes';
import { getDadosFinanceiro } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';
import { hojeCompacto } from '@/lib/painel/format';

export default async function FinanceiroPage() {
  await exigirSessao();
  const {
    vendas,
    baixas,
    abortos,
    lancamentos,
    rebanho,
    categoriaArroba,
    custos,
    categoriasCusto,
    insumos,
    dieta,
    gmdCategoria,
    marcosIdade,
    iatf,
  } = await getDadosFinanceiro();
  const { eventos, orfaos } = montarEventos(
    vendas.itens,
    baixas.itens,
    abortos.itens,
    lancamentos.itens,
    rebanho.itens,
    categoriaArroba.itens,
  );

  const hoje = hojeCompacto();
  const fazendas = Array.from(new Set(rebanho.itens.map((r) => r.fazenda).filter((f): f is string => !!f))).sort();
  const funisPorFazenda = [null, ...fazendas].map((fazenda) => ({
    fazenda,
    funis: calcularFunis(
      FUNIS_BOVINO,
      custos.itens,
      rebanho.itens,
      fazenda,
      categoriaArroba.itens,
      insumos.itens,
      dieta.itens,
      gmdCategoria.itens,
      hoje,
    ),
  }));
  const gmdSugerido = Array.from(gmdSugeridoPorCategoria(rebanho.itens).entries());
  const idsPrenha = new Set(rebanho.itens.filter((a) => a.reproducao === 'Prenha').map((a) => a.id));
  const categoriasFonteProjecao = new Set(['Bezerro', 'Bezerra', 'Garrote', 'Novilha']);
  const rebanhoProjecao = rebanho.itens.filter(
    (a) => idsPrenha.has(a.id) || categoriasFonteProjecao.has(a.categoria ?? ''),
  );
  const iatfProjecao = iatf.itens.filter((r) => idsPrenha.has(r.id));
  const retratoPorFazenda = [null, ...fazendas].map((fazenda) => ({
    fazenda,
    retrato: montarRetratoMomento(
      rebanho.itens,
      fazenda,
      custos.itens,
      categoriaArroba.itens,
      insumos.itens,
      dieta.itens,
      marcosIdade.itens,
      hoje,
    ),
  }));

  const todas = [
    vendas,
    baixas,
    abortos,
    lancamentos,
    rebanho,
    categoriaArroba,
    custos,
    categoriasCusto,
    insumos,
    dieta,
    gmdCategoria,
    marcosIdade,
    iatf,
  ];
  const carregadoEm = todas
    .map((l) => l.carregadoEm)
    .filter((v): v is number => v != null)
    .reduce((min, v) => (min == null ? v : Math.min(min, v)), null as number | null);

  const dados: PacoteFinanceiro = {
    eventos: empacotar(eventos, CAMPOS_EVENTO),
    orfaos: empacotar(orfaos, CAMPOS_FINANCEIRO),
    custos: empacotar(custos.itens, CAMPOS_CUSTO),
    categoriasCusto: empacotar(categoriasCusto.itens, CAMPOS_CATEGORIA_CUSTO),
    insumos: empacotar(insumos.itens, CAMPOS_INSUMO),
    dieta: empacotar(dieta.itens, CAMPOS_ITEM_DIETA),
    gmdCategoria: empacotar(gmdCategoria.itens, CAMPOS_GMD_CATEGORIA),
    gmdSugerido,
    marcosIdade: empacotar(marcosIdade.itens, CAMPOS_MARCO_IDADE),
    funisPorFazenda,
    retratoPorFazenda,
    rebanhoProjecao: empacotar(rebanhoProjecao, CAMPOS_REBANHO_PROJECAO),
    iatfProjecao: empacotar(iatfProjecao, CAMPOS_IATF_PROJECAO),
    configurado: vendas.configurado,
    stale: todas.some((l) => l.stale),
    carregadoEm,
  };

  return <FinanceiroView dados={dados} />;
}
