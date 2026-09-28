import { GruposPainel } from '@/components/tres-irmaos/GruposPainel';
import { lerParametros, lerRebanho } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

export const dynamic = 'force-dynamic';

export default async function GruposPage() {
  await exigirSessao();
  const hoje = hojeBrasilia();
  const rebanho = await lerRebanho(hoje);
  if (!rebanho.ok) return <p className="text-sm text-destructive">{rebanho.erro}</p>;
  const salvos = await lerParametros(rebanho.dados);
  if (!salvos.ok) return <p className="text-sm text-destructive">{salvos.erro}</p>;
  return <GruposPainel salvos={salvos.dados} hoje={hoje} />;
}
