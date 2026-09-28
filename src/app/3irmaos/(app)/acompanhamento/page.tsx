import { AcompanhamentoPainel } from '@/components/tres-irmaos/AcompanhamentoPainel';
import { lerLancamentos, lerParametros, lerRebanho } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

export const dynamic = 'force-dynamic';

export default async function AcompanhamentoPage() {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const rebanho = await lerRebanho(hoje);
  if (!rebanho.ok) return <p className="text-sm text-destructive">{rebanho.erro}</p>;
  const [salvos, lancamentos] = await Promise.all([lerParametros(rebanho.dados), lerLancamentos()]);
  if (!salvos.ok) return <p className="text-sm text-destructive">{salvos.erro}</p>;
  if (!lancamentos.ok) return <p className="text-sm text-destructive">{lancamentos.erro}</p>;
  return <AcompanhamentoPainel hoje={hoje} rebanho={rebanho.dados} parametros={salvos.dados.parametros} lancamentos={lancamentos.dados} />;
}
