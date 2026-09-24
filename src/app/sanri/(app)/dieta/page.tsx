import { DietaPainel } from '@/components/sanri/DietaPainel';
import { getBaias, getDieta } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function DietaPage() {
  await exigirSessao();
  const [{ configurado, ok, carregadoEm, historico }, baias] = await Promise.all([getDieta(), getBaias()]);
  return <DietaPainel baias={baias ?? []} historico={historico} configurado={configurado} ok={ok && baias != null} carregadoEm={carregadoEm} />;
}
