import { NomesPainel } from '@/components/sanri/NomesPainel';
import { getNomes } from '@/lib/sanri/nomes-queries';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function NomesPage() {
  await exigirSessao();
  const leitura = await getNomes();
  // Ano de Brasília: no réveillon o servidor (UTC) vira o ano 3h antes da fazenda.
  const anoAtual = Number(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 4));
  return <NomesPainel {...leitura} anoAtual={anoAtual} />;
}
