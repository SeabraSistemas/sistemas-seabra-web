import { AcompanhamentoPainel } from '@/components/tres-irmaos/AcompanhamentoPainel';
import { lerDoApp, lerParametros, lerRebanho } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

export const dynamic = 'force-dynamic';

export default async function AcompanhamentoPage() {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const rebanho = await lerRebanho(hoje);
  if (!rebanho.ok) return <p className="text-sm text-destructive">{rebanho.erro}</p>;
  const [salvos, doApp] = await Promise.all([lerParametros(rebanho.dados), lerDoApp()]);
  if (!salvos.ok) return <p className="text-sm text-destructive">{salvos.erro}</p>;
  if (!doApp.ok) return <p className="text-sm text-destructive">{doApp.erro}</p>;
  return <AcompanhamentoPainel hoje={hoje} parametros={salvos.dados.parametros} doApp={doApp.dados} />;
}
