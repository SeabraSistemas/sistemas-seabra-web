import { notFound } from 'next/navigation';
import { MetricCard } from '@/components/painel/MetricCard';
import { BarraLeitura } from '@/components/bovinos/BarraLeitura';
import { ProblemasView } from '@/components/bovinos/ProblemasView';
import { exigirSessao } from '@/lib/bovinos/sessao';
import { clientePorSlug } from '@/lib/bovinos/clientes';
import { obterRelatorio } from '@/lib/bovinos/leitura';
import { formatNumber } from '@/lib/painel/format';

export const maxDuration = 60;

export default async function ClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ cliente: string }>;
  searchParams: Promise<{ fresco?: string; regra?: string }>;
}) {
  await exigirSessao();
  const { cliente: slug } = await params;
  const cliente = clientePorSlug(slug);
  if (!cliente) notFound();
  const { fresco, regra } = await searchParams;

  const { relatorio, configurado, stale, carregadoEm, erro } = await obterRelatorio(cliente.slug, { fresco: !!fresco });

  if (!configurado) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Planilha de {cliente.nome} não configurada: falta a variável {cliente.envPlanilha}.
      </div>
    );
  }
  if (!relatorio) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Não foi possível ler a planilha de {cliente.nome}: {erro}
      </div>
    );
  }

  const conta = (s: string) => relatorio.problemas.filter((p) => p.severidade === s).length;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">{cliente.nome}</h1>
        <p className="text-sm text-muted-foreground">{cliente.descricao}</p>
      </div>
      <BarraLeitura carregadoEm={carregadoEm} stale={stale} />
      {relatorio.avisos.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {relatorio.avisos.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="c" label="Corrigíveis" value={formatNumber(conta('corrigivel'))} tom={conta('corrigivel') ? 'bom' : 'neutro'} detalhe="correção automática com prévia" />
        <MetricCard id="m" label="Manuais" value={formatNumber(conta('manual'))} tom={conta('manual') ? 'aviso' : 'neutro'} detalhe="precisam de decisão" />
        <MetricCard id="i" label="Informativos" value={formatNumber(conta('info'))} detalhe="só para saber" />
        <MetricCard
          id="t"
          label="Animais no Rebanho"
          value={formatNumber(relatorio.totais.linhasRebanho)}
          detalhe={`${formatNumber(relatorio.totais.partos)} partos · ${formatNumber(relatorio.totais.iatfs)} IATFs`}
        />
      </div>
      <ProblemasView problemas={relatorio.problemas} nomeCliente={cliente.slug} regraInicial={regra} />
    </div>
  );
}
