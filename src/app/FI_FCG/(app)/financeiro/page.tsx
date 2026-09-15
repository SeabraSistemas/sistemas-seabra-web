import { FinanceiroView } from '@/components/fi-fcg/FinanceiroView';
import { montarEventos } from '@/lib/fi-fcg/financeiro';
import {
  CAMPOS_CATEGORIA_CUSTO,
  CAMPOS_CUSTO,
  CAMPOS_DESCRICAO_CUSTO,
  CAMPOS_EVENTO,
  CAMPOS_FINANCEIRO,
  type PacoteFinanceiro,
} from '@/lib/fi-fcg/pacotes';
import { getDadosFinanceiro } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';

export default async function FinanceiroPage() {
  await exigirSessao();
  const { vendas, baixas, abortos, lancamentos, rebanho, categoriaArroba, custos, categoriasCusto, descricoesCusto } =
    await getDadosFinanceiro();
  const { eventos, orfaos } = montarEventos(
    vendas.itens,
    baixas.itens,
    abortos.itens,
    lancamentos.itens,
    rebanho.itens,
    categoriaArroba.itens,
  );

  const todas = [vendas, baixas, abortos, lancamentos, rebanho, categoriaArroba, custos, categoriasCusto, descricoesCusto];
  const carregadoEm = todas
    .map((l) => l.carregadoEm)
    .filter((v): v is number => v != null)
    .reduce((min, v) => (min == null ? v : Math.min(min, v)), null as number | null);

  const dados: PacoteFinanceiro = {
    eventos: empacotar(eventos, CAMPOS_EVENTO),
    orfaos: empacotar(orfaos, CAMPOS_FINANCEIRO),
    custos: empacotar(custos.itens, CAMPOS_CUSTO),
    categoriasCusto: empacotar(categoriasCusto.itens, CAMPOS_CATEGORIA_CUSTO),
    descricoesCusto: empacotar(descricoesCusto.itens, CAMPOS_DESCRICAO_CUSTO),
    configurado: vendas.configurado,
    stale: todas.some((l) => l.stale),
    carregadoEm,
  };

  return <FinanceiroView dados={dados} />;
}
