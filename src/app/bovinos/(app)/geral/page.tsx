import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BarraLeitura } from '@/components/bovinos/BarraLeitura';
import { SeveridadeBadge } from '@/components/bovinos/Severidade';
import { exigirSessao } from '@/lib/bovinos/sessao';
import { CLIENTES } from '@/lib/bovinos/clientes';
import { obterRelatorio } from '@/lib/bovinos/leitura';
import { CATALOGO } from '@/lib/bovinos/catalogo';
import type { RegraId, Severidade } from '@/lib/bovinos/tipos';

export const maxDuration = 60;

type Conta = Record<Severidade, number>;
const zero = (): Conta => ({ corrigivel: 0, manual: 0, info: 0 });

export default async function GeralPage({ searchParams }: { searchParams: Promise<{ fresco?: string }> }) {
  await exigirSessao();
  const { fresco } = await searchParams;
  const leituras = await Promise.all(CLIENTES.map(async (c) => ({ c, l: await obterRelatorio(c.slug, { fresco: !!fresco }) })));

  // Matriz regra × cliente.
  const porRegra = new Map<RegraId, Map<string, Conta>>();
  for (const { c, l } of leituras) {
    for (const p of l.relatorio?.problemas ?? []) {
      const m = porRegra.get(p.regra) ?? new Map<string, Conta>();
      const conta = m.get(c.slug) ?? zero();
      conta[p.severidade]++;
      m.set(c.slug, conta);
      porRegra.set(p.regra, m);
    }
  }
  const regras = (Object.keys(CATALOGO) as RegraId[]).filter((r) => porRegra.has(r));
  const horas = leituras.map(({ l }) => l.carregadoEm).filter((x): x is number => x != null);
  const maisAntiga = horas.length ? Math.min(...horas) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Conferência das planilhas</h1>
        <p className="text-sm text-muted-foreground">Pai, mãe, chaves, fórmulas e fazenda — cruzando RebanhoProd, Reproduçao e partos.</p>
      </div>
      <BarraLeitura carregadoEm={maisAntiga} stale={leituras.some(({ l }) => l.stale)} />

      <div className="grid gap-3 md:grid-cols-3">
        {leituras.map(({ c, l }) => {
          const total = zero();
          for (const p of l.relatorio?.problemas ?? []) total[p.severidade]++;
          return (
            <Link key={c.slug} href={`/bovinos/${c.slug}`} className="block">
              <Card className="h-full py-5 transition-colors hover:border-primary/60">
                <CardContent className="flex flex-col gap-3 px-5">
                  <div>
                    <p className="font-semibold">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.descricao}</p>
                  </div>
                  {!l.configurado ? (
                    <p className="text-sm text-destructive">Planilha não configurada ({c.envPlanilha}).</p>
                  ) : !l.relatorio ? (
                    <p className="text-sm text-destructive">Erro de leitura: {l.erro}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {(['corrigivel', 'manual', 'info'] as Severidade[]).map((s) => (
                        <span key={s} className="flex items-center gap-1.5">
                          <SeveridadeBadge severidade={s} />
                          <span className="tabular-nums">{total[s]}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Problema</th>
              {CLIENTES.map((c) => (
                <th key={c.slug} className="px-3 py-2 font-medium">
                  {c.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regras.map((r) => (
              <tr key={r} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2">
                  <p>{CATALOGO[r].titulo}</p>
                  <p className="text-xs text-muted-foreground">{CATALOGO[r].grupo}</p>
                </td>
                {CLIENTES.map((c) => {
                  const conta = porRegra.get(r)?.get(c.slug);
                  const n = conta ? conta.corrigivel + conta.manual + conta.info : 0;
                  return (
                    <td key={c.slug} className="px-3 py-2 tabular-nums">
                      {n === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Link href={`/bovinos/${c.slug}?regra=${r}`} className="underline-offset-2 hover:underline">
                          {n}
                          {conta!.corrigivel > 0 && <span className="ml-1.5 text-xs text-emerald-400">{conta!.corrigivel} corrigível</span>}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
