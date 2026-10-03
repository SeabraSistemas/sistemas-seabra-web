import { InsumosPainel } from '@/components/tres-irmaos/InsumosPainel';
import { lerDieta, lerParametros, lerRebanho } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { montarCategorias } from '@/lib/tres-irmaos/insumos';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

export const dynamic = 'force-dynamic';

/**
 * Pedido de insumos: o rebanho de hoje (do app) com a dieta cadastrada no app.
 * Os parâmetros salvos entram pelo peso do saco de cada insumo, que o app não
 * guarda (ver `sacos` em src/lib/tres-irmaos/projecao.ts).
 */
export default async function InsumosPage() {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const [rebanho, dieta] = await Promise.all([lerRebanho(hoje), lerDieta()]);
  if (!rebanho.ok) return <p className="text-sm text-destructive">{rebanho.erro}</p>;
  if (!dieta.ok) return <p className="text-sm text-destructive">{dieta.erro}</p>;
  const salvos = await lerParametros(rebanho.dados);
  if (!salvos.ok) return <p className="text-sm text-destructive">{salvos.erro}</p>;
  const categorias = montarCategorias(dieta.dados.dietas, rebanho.dados.efetivo);
  return (
    <InsumosPainel categoriasDoApp={categorias} insumos={dieta.dados.insumos} atualizadoEm={dieta.dados.atualizadoEm} hoje={hoje} salvos={salvos.dados} />
  );
}
