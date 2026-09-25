import { ConferenciaPainel } from '@/components/sanri/ConferenciaPainel';
import { getConferencia } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export default async function ConferenciaPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, baias, animais, historico } = await getConferencia();
  return <ConferenciaPainel baias={baias} animais={animais} historico={historico} configurado={configurado} ok={ok} carregadoEm={carregadoEm} />;
}
