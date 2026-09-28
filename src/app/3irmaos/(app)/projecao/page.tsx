import { ProjecaoPainel } from '@/components/tres-irmaos/ProjecaoPainel';
import { lerParametros, lerRebanho } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

export const dynamic = 'force-dynamic';

export default async function ProjecaoPage() {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const rebanho = await lerRebanho(hoje);
  if (!rebanho.ok) return <p className="text-sm text-destructive">{rebanho.erro}</p>;
  const salvos = await lerParametros(rebanho.dados);
  if (!salvos.ok) return <p className="text-sm text-destructive">{salvos.erro}</p>;
  return <ProjecaoPainel hoje={hoje} rebanho={rebanho.dados} salvos={salvos.dados} />;
}
