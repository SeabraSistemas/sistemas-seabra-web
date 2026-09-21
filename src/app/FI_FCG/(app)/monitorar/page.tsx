import { MonitorarView } from '@/components/fi-fcg/MonitorarView';
import { animaisMonitorados } from '@/lib/fi-fcg/manejo';
import { CAMPOS_ANIMAL_MONITORADO, type PacoteMonitor } from '@/lib/fi-fcg/pacotes';
import { getIatf, getPartos, getPesagem, getRebanho, getToque } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';
import { hojeCompacto } from '@/lib/painel/format';

/**
 * "Monitorar" (21/09/2026) — animais ATIVOS há muitos dias sem manejo, pra
 * cobrar retomada de rotina (pesagem, toque, cobertura). Só animal vivo
 * entra (ver `animaisMonitorados`, manejo.ts) — vendido/baixado não precisa
 * mais de manejo. Lê Pesagem/Toque/IATF/Partos inteiros (mesmo custo de
 * servidor que a extração de Bloco D pagava em Rebanho), mas o cliente só
 * recebe um número por animal, não os datasets brutos.
 */
export default async function MonitorarPage() {
  await exigirSessao();
  const [rebanho, pesagem, toque, iatf, partos] = await Promise.all([
    getRebanho(),
    getPesagem(),
    getToque(),
    getIatf(),
    getPartos(),
  ]);

  const hoje = hojeCompacto();
  const animais = animaisMonitorados(rebanho.itens, pesagem.itens, toque.itens, iatf.itens, partos.itens, hoje);

  const todas = [rebanho, pesagem, toque, iatf, partos];
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

  return <MonitorarView dados={dados} />;
}
