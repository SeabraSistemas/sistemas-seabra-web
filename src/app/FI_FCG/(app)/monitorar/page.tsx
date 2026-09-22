import { MonitorarView } from '@/components/fi-fcg/MonitorarView';
import { animaisMonitorados, type FontesManejo } from '@/lib/fi-fcg/manejo';
import { CAMPOS_ANIMAL_MONITORADO, type PacoteMonitor } from '@/lib/fi-fcg/pacotes';
import {
  getAbortos,
  getClinica,
  getD8,
  getEmbarque,
  getEngordaEventos,
  getIatf,
  getManejoSanitario,
  getPartos,
  getPesagem,
  getProtocolo,
  getRebanho,
  getToque,
  getTransferir,
} from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';
import { hojeCompacto } from '@/lib/painel/format';

/**
 * "Monitorar" (21/09/2026) — animais ATIVOS há muitos dias sem manejo, pra
 * cobrar retomada de rotina (pesagem, toque, cobertura, sanidade). Só
 * animal ativo entra (ver `animaisMonitorados`, manejo.ts) — vendido/
 * baixado não precisa mais de manejo.
 *
 * Lê 12 abas inteiras (22/09/2026, revisão completa das abas de lançamento
 * do AppSheet — ver `FontesManejo`), mas o cliente só recebe um número por
 * animal, não os datasets brutos: cada `getX()` já é cacheado por aba
 * (`queries.ts`), então uma leitura fica pronta pra reusar tanto aqui
 * quanto em `/FI_FCG/api/ficha-animal` (a ficha de histórico de UM animal),
 * sem bater na planilha de novo dentro do TTL de 5 min.
 */
export default async function MonitorarPage() {
  await exigirSessao();
  const [rebanho, pesagem, toque, iatf, partos, manejoSanitario, d8, protocolo, transferir, engordaEventos, clinica, abortos, embarque] =
    await Promise.all([
      getRebanho(),
      getPesagem(),
      getToque(),
      getIatf(),
      getPartos(),
      getManejoSanitario(),
      getD8(),
      getProtocolo(),
      getTransferir(),
      getEngordaEventos(),
      getClinica(),
      getAbortos(),
      getEmbarque(),
    ]);

  const hoje = hojeCompacto();
  const fontes: FontesManejo = {
    pesagem: pesagem.itens,
    toque: toque.itens,
    iatf: iatf.itens,
    partos: partos.itens,
    manejoSanitario: manejoSanitario.itens,
    d8: d8.itens,
    protocolo: protocolo.itens,
    transferir: transferir.itens,
    engordaEventos: engordaEventos.itens,
    clinica: clinica.itens,
    abortos: abortos.itens,
    embarque: embarque.itens,
  };
  const animais = animaisMonitorados(rebanho.itens, fontes, hoje);

  const todas = [rebanho, pesagem, toque, iatf, partos, manejoSanitario, d8, protocolo, transferir, engordaEventos, clinica, abortos, embarque];
  const carregadoEm = todas
    .map((l) => l.carregadoEm)
    .filter((v): v is number => v != null)
    .reduce((min, v) => (min == null ? v : Math.min(min, v)), null as number | null);

  const dados: PacoteMonitor = {
    animais: empacotar(animais, CAMPOS_ANIMAL_MONITORADO),
    configurado: rebanho.configurado,
    stale: todas.some((l) => l.stale),
    carregadoEm,
  };

  return <MonitorarView dados={dados} hoje={hoje} />;
}
