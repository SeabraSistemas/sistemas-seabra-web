import { ReprodutoresView } from '@/components/sanri/ReprodutoresView';
import { getReprodutores } from '@/lib/sanri/reprodutores-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

/** Reprodução → Reprodutores: desempenho leiteiro das filhas, lido do app (só leitura). */
export default async function ReprodutoresPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, animais, lactacoes } = await getReprodutores();
  return <ReprodutoresView animais={animais} lactacoes={lactacoes} configurado={configurado} ok={ok} carregadoEm={carregadoEm} />;
}
