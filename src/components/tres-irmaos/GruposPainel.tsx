'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { CampoNumero } from '@/components/tres-irmaos/CampoNumero';
import { COR_SERIES } from '@/components/tres-irmaos/GraficoSemanal';
import { litros } from '@/components/tres-irmaos/formato';
import type { ParametrosSalvos } from '@/lib/tres-irmaos/dados';
import { calcularGrupos, GRUPOS_PADRAO, type ParametrosGrupos } from '@/lib/tres-irmaos/grupos';

type Estado = { tipo: 'parado' } | { tipo: 'salvando' } | { tipo: 'salvo' } | { tipo: 'erro'; msg: string };

const int = (n: number) => Math.round(n).toLocaleString('pt-BR');
const mes = (dia: number) => `mês ${Math.floor(dia / 30.4) + 1}`;

/** Parto que cai depois do mês 12 é do ciclo seguinte: "mês 2*" em vez de "mês 14". */
function faixaDeMeses(de: number, ate: number, periodo: number): string {
  const rotulo = (d: number) => `${mes(d % periodo)}${d >= periodo ? '*' : ''}`;
  return de === ate || mes(de) === mes(ate) ? rotulo(de) : `${rotulo(de)} a ${rotulo(ate)}`;
}

/**
 * Planejamento dos grupos reprodutivos — modelo GENÉRICO, tudo editável
 * (Felipe, 28/09/2026: "primeiro o modelo, depois eu coloco os dados do
 * Lucas"). A conta está em src/lib/tres-irmaos/grupos.ts; aqui só o painel.
 * Recalcula ~0,3 s depois da última tecla: a simulação leva uns 400 ms.
 */
export function GruposPainel({ salvos }: { salvos: ParametrosSalvos }) {
  const [base, setBase] = useState(salvos.parametros.grupos);
  const [g, setG] = useState<ParametrosGrupos>(salvos.parametros.grupos);
  const [calculado, setCalculado] = useState<ParametrosGrupos>(salvos.parametros.grupos);
  const [estado, setEstado] = useState<Estado>(salvos.salvo ? { tipo: 'salvo' } : { tipo: 'parado' });

  useEffect(() => {
    const t = setTimeout(() => setCalculado(g), 300);
    return () => clearTimeout(t);
  }, [g]);
  const r = useMemo(() => calcularGrupos(calculado), [calculado]);
  const calculando = calculado !== g;
  const alterado = JSON.stringify(g) !== JSON.stringify(base);
  const mudar = (parcial: Partial<ParametrosGrupos>) => setG((atual) => ({ ...atual, ...parcial }));

  async function salvar() {
    setEstado({ tipo: 'salvando' });
    try {
      const resp = await fetch('/3irmaos/api/parametros', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...salvos.parametros, grupos: g }),
      });
      const corpo = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setEstado({ tipo: 'erro', msg: corpo.erro ?? 'Não foi possível salvar.' });
        return;
      }
      setBase(corpo.parametros.grupos);
      setG(corpo.parametros.grupos);
      setEstado({ tipo: 'salvo' });
    } catch {
      setEstado({ tipo: 'erro', msg: 'Sem conexão. Tente de novo.' });
    }
  }

  const porGrupo = r.grupos.length ? r.grupos.reduce((t, x) => t + x.coberturas, 0) / r.grupos.length : 0;
  const serie = r.serie.map((s) => ({ semana: s.semana, lactantes: Math.round(s.lactantes * 10) / 10, secas: Math.round(s.secas * 10) / 10 }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Grupos reprodutivos</h1>
        <p className="text-sm text-muted-foreground">
          Quanto rebanho sustenta a meta de lactantes, com um grupo de cobertura a cada {g.intervaloGrupos} dias. Modelo genérico: todos os números ao lado são editáveis. O resultado é o rebanho já em ritmo, depois de alguns anos no sistema.
        </p>
      </header>

      <section className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${calculando ? 'opacity-60' : ''}`} aria-busy={calculando}>
        <Tile rotulo="Rebanho total" valor={`${int(r.total)} animais`} detalhe={`${Math.round(r.pctLactacao * 100)}% em lactação`} />
        <Tile rotulo="Matrizes" valor={int(r.matrizes)} detalhe={`${r.grupos.length} grupos de ~${int(porGrupo)} cobertas`} />
        <Tile rotulo="Lactantes" valor={`${int(r.lactantes.media)} em média`} detalhe={`varia de ${int(r.lactantes.min)} a ${int(r.lactantes.max)}`} />
        <Tile rotulo="Leite por semana" valor={litros(r.litrosSemana.media)} detalhe={`de ${litros(r.litrosSemana.min)} a ${litros(r.litrosSemana.max)} (${String(g.mediaLitros).replace('.', ',')} L/cabra)`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <Bloco titulo="Meta">
            <Par>
              <Campo rotulo="Lactantes (média)" id="meta">
                <CampoNumero id="meta" valor={g.metaLactantes} aoMudar={(n) => mudar({ metaLactantes: n })} min={1} />
              </Campo>
              <Campo rotulo="Média por cabra" id="media-g">
                <CampoNumero id="media-g" valor={g.mediaLitros} aoMudar={(n) => mudar({ mediaLitros: n })} sufixo="L/dia" max={20} />
              </Campo>
            </Par>
          </Bloco>

          <Bloco titulo="Calendário dos grupos">
            <Par>
              <Campo rotulo="Um grupo a cada" id="intervalo">
                <CampoNumero id="intervalo" valor={g.intervaloGrupos} aoMudar={(n) => mudar({ intervaloGrupos: Math.round(n), duracaoEstacao: Math.min(g.duracaoEstacao, Math.round(n)) })} sufixo="dias" min={15} max={180} />
              </Campo>
              <Campo rotulo="Estação de monta" id="estacao">
                <CampoNumero id="estacao" valor={g.duracaoEstacao} aoMudar={(n) => mudar({ duracaoEstacao: Math.round(n) })} sufixo="dias" min={1} max={g.intervaloGrupos} />
              </Campo>
            </Par>
            <p className="text-xs text-muted-foreground">A estação é quantos dias o grupo fica aberto para cobertura (e espalha os partos).</p>
          </Bloco>

          <Bloco titulo="Cobertura">
            <Par>
              <Campo rotulo="Cobre com (de parida)" id="pos-parto">
                <CampoNumero id="pos-parto" valor={g.diasPosParto} aoMudar={(n) => mudar({ diasPosParto: Math.round(n) })} sufixo="dias" min={20} max={400} />
              </Campo>
              <Campo rotulo="Prenhez por grupo" id="prenhez">
                <CampoNumero id="prenhez" valor={Math.round(g.prenhez * 100)} aoMudar={(n) => mudar({ prenhez: n / 100 })} sufixo="%" min={5} max={100} />
              </Campo>
            </Par>
            <Par>
              <Campo rotulo="Cabritas com" id="idade">
                <CampoNumero id="idade" valor={g.idadeCabritaMeses} aoMudar={(n) => mudar({ idadeCabritaMeses: n })} sufixo="meses" min={4} max={24} />
              </Campo>
              <Campo rotulo="e peso" id="peso">
                <CampoNumero id="peso" valor={g.pesoCabritaKg} aoMudar={(n) => mudar({ pesoCabritaKg: n })} sufixo="kg" max={100} />
              </Campo>
            </Par>
            <Par>
              <Campo rotulo="Gestação" id="gest">
                <CampoNumero id="gest" valor={g.gestacaoDias} aoMudar={(n) => mudar({ gestacaoDias: Math.round(n) })} sufixo="dias" min={140} max={160} />
              </Campo>
              <Campo rotulo="Seca antes do parto" id="seca">
                <CampoNumero id="seca" valor={g.secaAntesDias} aoMudar={(n) => mudar({ secaAntesDias: Math.round(n) })} sufixo="dias" max={120} />
              </Campo>
            </Par>
            <p className="text-xs text-muted-foreground">Quem fica vazia passa para o grupo seguinte.</p>
          </Bloco>

          <Bloco titulo="Crias">
            <Par>
              <Campo rotulo="Prolificidade (crias/parto)" id="prolif">
                <CampoNumero id="prolif" valor={g.prolificidade} aoMudar={(n) => mudar({ prolificidade: n })} max={4} />
              </Campo>
              <Campo rotulo="Fêmeas" id="femeas">
                <CampoNumero id="femeas" valor={Math.round(g.femeas * 100)} aoMudar={(n) => mudar({ femeas: n / 100 })} sufixo="%" max={100} />
              </Campo>
            </Par>
            <Campo rotulo="Mortalidade na recria" id="mort">
              <CampoNumero id="mort" valor={Math.round(g.mortalidade * 100)} aoMudar={(n) => mudar({ mortalidade: n / 100 })} sufixo="%" max={100} />
            </Campo>
          </Bloco>

          <Bloco titulo="Rebanho">
            <Par>
              <Campo rotulo="Reposição de matrizes" id="repos">
                <CampoNumero id="repos" valor={Math.round(g.reposicaoAnual * 100)} aoMudar={(n) => mudar({ reposicaoAnual: n / 100 })} sufixo="%/ano" max={100} />
              </Campo>
              <Campo rotulo="Matrizes por bode" id="bode">
                <CampoNumero id="bode" valor={g.matrizesPorReprodutor} aoMudar={(n) => mudar({ matrizesPorReprodutor: n })} min={1} max={200} />
              </Campo>
            </Par>
            <Par>
              <Campo rotulo="Cabritas que sobram saem com" id="saida-f">
                <CampoNumero id="saida-f" valor={g.saidaExcedenteMeses} aoMudar={(n) => mudar({ saidaExcedenteMeses: n })} sufixo="meses" max={24} />
              </Campo>
              <Campo rotulo="Machos saem com" id="saida-m">
                <CampoNumero id="saida-m" valor={g.saidaMachosMeses} aoMudar={(n) => mudar({ saidaMachosMeses: n })} sufixo="meses" max={24} />
              </Campo>
            </Par>
          </Bloco>

          <div className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-xl border border-border bg-card/95 p-3 backdrop-blur">
            <div className="flex gap-2">
              <Button onClick={salvar} disabled={!alterado || estado.tipo === 'salvando'} className="flex-1">
                {estado.tipo === 'salvando' ? 'Salvando…' : 'Salvar'}
              </Button>
              {alterado && (
                <Button variant="outline" onClick={() => setG(base)}>
                  Desfazer
                </Button>
              )}
              <Button variant="outline" onClick={() => setG(GRUPOS_PADRAO)} title="Voltar aos valores de exemplo">
                Padrão
              </Button>
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {estado.tipo === 'erro' && <span className="text-destructive">{estado.msg}</span>}
              {estado.tipo !== 'erro' && alterado && 'Alterações não salvas.'}
              {estado.tipo === 'salvo' && !alterado && 'Salvo.'}
              {estado.tipo === 'parado' && !alterado && 'Valores de exemplo — ainda não salvos.'}
            </p>
          </div>
        </aside>

        <div className={`order-1 flex min-w-0 flex-col gap-6 lg:order-2 ${calculando ? 'opacity-60' : ''}`}>
          {r.alertas.length > 0 && (
            <section className="flex flex-col gap-2">
              {r.alertas.map((a) => (
                <p key={a} className="flex gap-2 rounded-md border border-destructive/50 px-3 py-2 text-sm text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                  {a}
                </p>
              ))}
            </section>
          )}

          <section className="painel">
            <h2 className="mb-1 font-sans text-sm font-semibold">Lactantes ao longo do ano</h2>
            <p className="mb-3 text-xs text-muted-foreground">Cada grupo pare, produz e seca {g.secaAntesDias} dias antes do próximo parto — a oscilação é essa seca.</p>
            <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: COR_SERIES[0] }} aria-hidden />
                <span className="text-foreground">Lactantes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: COR_SERIES[1] }} aria-hidden />
                <span className="text-foreground">Secas (pré-parto)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-foreground/70" aria-hidden />
                <span className="text-foreground">Meta {int(g.metaLactantes)}</span>
              </li>
            </ul>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serie} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="semana"
                    tickFormatter={(v: number) => mes(v * 7)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis width={40} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--popover-foreground)', fontSize: 13 }}
                    labelFormatter={(v) => `Semana ${Number(v) + 1} (${mes(Number(v) * 7)})`}
                    formatter={(valor, nome) => [int(Number(valor)), String(nome ?? '')]}
                  />
                  <ReferenceLine y={g.metaLactantes} stroke="var(--foreground)" strokeOpacity={0.7} strokeDasharray="5 4" />
                  <Area type="monotone" dataKey="lactantes" name="Lactantes" stackId="a" stroke={COR_SERIES[0]} fill={COR_SERIES[0]} fillOpacity={0.5} strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="secas" name="Secas (pré-parto)" stackId="a" stroke={COR_SERIES[1]} fill={COR_SERIES[1]} fillOpacity={0.4} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="painel overflow-x-auto">
            <h2 className="mb-1 font-sans text-sm font-semibold">Os grupos no ano</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Mês 1 = abertura do primeiro grupo; * = no ciclo seguinte. Cada grupo recebe as matrizes que completaram {g.diasPosParto} dias de parida, as vazias do grupo anterior e as cabritas de {String(g.idadeCabritaMeses).replace('.', ',')} meses.
            </p>
            <table className="w-full min-w-[32rem] text-sm whitespace-nowrap tabular-nums">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium">Grupo</th>
                  <th className="px-2 text-left font-medium">Cobertura</th>
                  <th className="px-2 text-right font-medium">Cobertas</th>
                  <th className="px-2 text-right font-medium">das quais cabritas</th>
                  <th className="px-2 text-right font-medium">Prenhes</th>
                  <th className="pl-2 text-left font-medium">Partos</th>
                </tr>
              </thead>
              <tbody>
                {r.grupos.map((x) => (
                  <tr key={x.numero} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3">{x.numero}</td>
                    <td className="px-2 text-muted-foreground">
                      {mes(x.abre)} ({g.duracaoEstacao} dias)
                    </td>
                    <td className="px-2 text-right font-medium">{int(x.coberturas)}</td>
                    <td className="px-2 text-right text-muted-foreground">{int(x.cabritas)}</td>
                    <td className="px-2 text-right">{int(x.prenhes)}</td>
                    <td className="pl-2 text-muted-foreground">{faixaDeMeses(x.partoDe, x.partoAte, r.periodo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="painel">
              <h2 className="mb-3 font-sans text-sm font-semibold">Composição do rebanho (média)</h2>
              <dl className="flex flex-col text-sm tabular-nums">
                <Linha rotulo="Matrizes" valor={r.matrizes} total={r.total} forte />
                <Linha rotulo="em lactação" valor={r.lactantes.media} total={r.total} recuo />
                <Linha rotulo="secas (pré-parto)" valor={r.secas.media} total={r.total} recuo />
                <Linha rotulo="novilhas prenhes (1ª cria)" valor={r.novilhasPrenhes.media} total={r.total} recuo />
                <Linha rotulo="vazias aguardando cobertura" valor={r.vazias.media} total={r.total} recuo />
                <Linha rotulo="Recria de reposição" valor={r.recria} total={r.total} forte />
                <Linha rotulo={`Cabritas que sobram (até ${String(g.saidaExcedenteMeses).replace('.', ',')} meses)`} valor={r.cabritasExcedentes} total={r.total} forte />
                <Linha rotulo={`Cabritos machos (até ${String(g.saidaMachosMeses).replace('.', ',')} meses)`} valor={r.cabritosMachos} total={r.total} forte />
                <Linha rotulo="Reprodutores" valor={r.reprodutores} total={r.total} forte />
                <div className="mt-1 flex justify-between border-t border-border pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{int(r.total)}</dd>
                </div>
              </dl>
            </section>

            <section className="painel">
              <h2 className="mb-3 font-sans text-sm font-semibold">Por ano</h2>
              <dl className="flex flex-col gap-1.5 text-sm tabular-nums">
                <Dado rotulo="Partos" valor={int(r.partosAno)} />
                <Dado rotulo="Intervalo entre partos" valor={`${int(r.intervaloPartos)} dias`} />
                <Dado rotulo="Lactação" valor={`${int(r.diasLactacao)} dias`} />
                <Dado rotulo="Cabritas nascidas" valor={int(r.cabritasNascidasAno)} />
                <Dado rotulo="Cabritas vivas" valor={int(r.cabritasVivasAno)} />
                <Dado rotulo="Ficam para reposição" valor={int(r.reposicaoAno)} />
                <Dado rotulo="Cabritas que sobram (venda)" valor={int(r.excedenteCabritasAno)} />
                <Dado rotulo="Cabritos machos" valor={int(r.cabritosMachosAno)} />
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe: string }) {
  return (
    <div className="painel flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <span className="text-xl font-semibold tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{detalhe}</span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="painel flex flex-col gap-3">
      <h2 className="font-sans text-sm font-semibold">{titulo}</h2>
      {children}
    </div>
  );
}

function Par({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Campo({ rotulo, id, children }: { rotulo: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

function Linha({ rotulo, valor, total, forte = false, recuo = false }: { rotulo: string; valor: number; total: number; forte?: boolean; recuo?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 py-1 ${recuo ? 'pl-4 text-muted-foreground' : ''} ${forte ? 'text-foreground' : ''}`}>
      <dt>{rotulo}</dt>
      <dd>
        {int(valor)} <span className="ml-1 inline-block w-10 text-right text-xs text-muted-foreground">{total ? Math.round((valor / total) * 100) : 0}%</span>
      </dd>
    </div>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd>{valor}</dd>
    </div>
  );
}
