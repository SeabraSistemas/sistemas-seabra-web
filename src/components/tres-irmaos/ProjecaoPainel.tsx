'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampoNumero } from '@/components/tres-irmaos/CampoNumero';
import { EditorPrevisoes } from '@/components/tres-irmaos/EditorPrevisoes';
import { COR_EXCEDENTE, COR_SERIES, GraficoSemanal } from '@/components/tres-irmaos/GraficoSemanal';
import { DIAS_SEMANA, animais, litros, media } from '@/components/tres-irmaos/formato';
import type { ParametrosSalvos, RebanhoDoApp } from '@/lib/tres-irmaos/dados';
import { dataCurta, diaMes, rotuloMesLongo } from '@/lib/tres-irmaos/datas';
import { HORIZONTE_MAX, HORIZONTE_MIN, projetar, type Comprador, type Parametros } from '@/lib/tres-irmaos/projecao';

type Estado = { tipo: 'parado' } | { tipo: 'salvando' } | { tipo: 'salvo'; em: string; por: string } | { tipo: 'erro'; msg: string };

export function ProjecaoPainel({ hoje, rebanho, salvos }: { hoje: string; rebanho: RebanhoDoApp; salvos: ParametrosSalvos }) {
  const [base, setBase] = useState(salvos.parametros);
  const [p, setP] = useState<Parametros>(salvos.parametros);
  const [estado, setEstado] = useState<Estado>(
    salvos.salvo && salvos.atualizadoEm ? { tipo: 'salvo', em: salvos.atualizadoEm, por: salvos.atualizadoPor ?? '' } : { tipo: 'parado' },
  );
  const [verSemanas, setVerSemanas] = useState(false);

  const alterado = JSON.stringify(p) !== JSON.stringify(base);
  const mudar = (parcial: Partial<Parametros>) => setP((atual) => ({ ...atual, ...parcial }));
  const mudarComprador = (i: number, parcial: Partial<Comprador>) => mudar({ compradores: p.compradores.map((c, j) => (j === i ? { ...c, ...parcial } : c)) });

  const proj = useMemo(() => projetar(p, hoje, rebanho.partosPrevistos), [p, hoje, rebanho.partosPrevistos]);
  const primeira = proj.semanas[0];
  const pico = proj.semanas.reduce((m, s) => (s.litrosSemana > m.litrosSemana ? s : m), primeira);
  const acima = proj.semanas.filter((s) => s.acimaDoTeto > 0.5);
  const semanaAcima = acima[0];
  const totalExcedente = proj.semanas.reduce((t, s) => t + s.excedente, 0);

  const linhasGrafico = proj.semanas.map((s) => {
    const linha: Record<string, number | string> = { inicio: s.inicio };
    s.entregas.forEach((e) => (linha[e.compradorId] = Math.round(e.litros)));
    linha.excedente = Math.round(s.excedente);
    return linha;
  });
  const seriesGrafico = [
    ...p.compradores.map((c, i) => ({ chave: c.id, nome: c.nome, cor: COR_SERIES[i % COR_SERIES.length] })),
    { chave: 'excedente', nome: 'Excedente (sem comprador)', cor: COR_EXCEDENTE },
  ];

  async function salvar() {
    setEstado({ tipo: 'salvando' });
    try {
      const r = await fetch('/3irmaos/api/parametros', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) });
      const corpo = await r.json().catch(() => ({}));
      if (!r.ok) {
        setEstado({ tipo: 'erro', msg: corpo.erro ?? 'Não foi possível salvar.' });
        return;
      }
      setP(corpo.parametros);
      setBase(corpo.parametros);
      setEstado({ tipo: 'salvo', em: corpo.atualizadoEm, por: corpo.atualizadoPor });
    } catch {
      setEstado({ tipo: 'erro', msg: 'Sem conexão. Tente de novo.' });
    }
  }

  const outrasCategorias = rebanho.categorias.filter((c) => c.nome !== 'lactante');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Projeção de produção</h1>
        <p className="text-sm text-muted-foreground">
          De {dataCurta(hoje)} a {dataCurta(proj.fim)} ({p.horizonteMeses} {p.horizonteMeses === 1 ? 'mês' : 'meses'}). Semana de terça a segunda. Mude os números dos quadros de parâmetros — a conta refaz na hora; <strong className="text-foreground">Salvar</strong> guarda para o Lucas e para o Felipe.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile rotulo="Esta semana" valor={litros(primeira.litrosSemana)} detalhe={`${animais(primeira.lactantes)} lactantes · ${litros(primeira.litrosDia)}/dia`} />
        <Tile rotulo="Semana de pico" valor={litros(pico.litrosSemana)} detalhe={`${diaMes(pico.inicio)} · ${animais(pico.lactantes)} lactantes`} />
        <Tile
          rotulo={`Acima do teto de ${litros(p.tetoSemanal)}`}
          valor={semanaAcima ? `a partir de ${diaMes(semanaAcima.inicio)}` : 'não passa'}
          detalhe={semanaAcima ? `${acima.length} ${acima.length === 1 ? 'semana' : 'semanas'} · até ${litros(Math.max(...acima.map((s) => s.acimaDoTeto)))} a mais` : 'dentro do teto em todo o período'}
          alerta={!!semanaAcima}
        />
        <Tile rotulo="Leite sem comprador no período" valor={litros(totalExcedente)} detalhe="acima do teto ou dos máximos" alerta={totalExcedente > 0.5} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="painel flex flex-col gap-3">
            <h2 className="font-sans text-sm font-semibold">Rebanho hoje</h2>
            <p className="text-xs text-muted-foreground">
              No app: <strong className="text-foreground">{rebanho.lactantes} lactantes</strong>
              {rebanho.dataUltimoControle && (
                <>
                  , {rebanho.lactantesMedidas} medidas no controle de {dataCurta(rebanho.dataUltimoControle)} (média {rebanho.mediaUltimoControle != null ? media(rebanho.mediaUltimoControle) : '—'} L)
                </>
              )}
              {outrasCategorias.length > 0 && <>; {outrasCategorias.map((c) => `${c.quantidade} ${c.nome}`).join(', ')}</>}.
            </p>
            {rebanho.lactantesAcimaDe305 > 0 && (
              <p className="flex gap-2 rounded-md bg-accent px-2.5 py-2 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span>
                  <strong className="text-foreground">{rebanho.lactantesAcimaDe305} lactantes</strong> passaram de 305 dias do último parto. Se forem secar no período, lance em <em>Secagens previstas</em> — senão a projeção conta com elas o ano todo.
                </span>
              </p>
            )}
            <Campo rotulo="Lactantes hoje" id="lact">
              <CampoNumero id="lact" valor={p.lactantesIniciais} aoMudar={(n) => mudar({ lactantesIniciais: Math.round(n) })} sufixo="cabras" />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Média delas" id="media">
                <CampoNumero id="media" valor={p.mediaLitros} aoMudar={(n) => mudar({ mediaLitros: n })} sufixo="L/dia" max={20} />
              </Campo>
              <Campo rotulo="Média das que parirem" id="media-nova">
                <CampoNumero id="media-nova" valor={p.mediaRecemParida} aoMudar={(n) => mudar({ mediaRecemParida: n })} sufixo="L/dia" max={20} />
              </Campo>
            </div>
            <Campo rotulo="Período da projeção" id="horizonte">
              <select
                id="horizonte"
                value={p.horizonteMeses}
                onChange={(e) => mudar({ horizonteMeses: Number(e.target.value) })}
                className="h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm"
              >
                {Array.from({ length: HORIZONTE_MAX - HORIZONTE_MIN + 1 }, (_, i) => i + HORIZONTE_MIN).map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? 'mês' : 'meses'}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <EditorPrevisoes
            titulo="Partos previstos"
            ajuda="Quantas cabras parem e quando. A semana do parto já entra com a média das que parirem."
            itens={p.partos}
            aoMudar={(partos) => mudar({ partos })}
            dataInicial={hoje}
          />
          <EditorPrevisoes
            titulo="Secagens previstas"
            ajuda="Quantas lactantes param de produzir e quando. Saem primeiro das lactantes de hoje."
            itens={p.secagens}
            aoMudar={(secagens) => mudar({ secagens })}
            dataInicial={hoje}
          />
          <EditorPrevisoes
            titulo="Coberturas sem diagnóstico"
            ajuda={`Cabras cobertas que ainda não se sabe se pegaram: viram parto ${p.gestacaoDias} dias depois, na taxa de prenhez abaixo.`}
            itens={p.coberturas}
            aoMudar={(coberturas) => mudar({ coberturas })}
            dataInicial={hoje}
          />

          <div className="painel flex flex-col gap-3">
            <h2 className="font-sans text-sm font-semibold">Reprodução</h2>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Taxa de prenhez" id="taxa">
                <CampoNumero id="taxa" valor={Math.round(p.taxaPrenhez * 100)} aoMudar={(n) => mudar({ taxaPrenhez: n / 100 })} sufixo="%" max={100} />
              </Campo>
              <Campo rotulo="Gestação" id="gestacao">
                <CampoNumero id="gestacao" valor={p.gestacaoDias} aoMudar={(n) => mudar({ gestacaoDias: Math.round(n) })} sufixo="dias" max={200} />
              </Campo>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.diasLactacaoNovas != null}
                onChange={(e) => mudar({ diasLactacaoNovas: e.target.checked ? 300 : null })}
                className="size-4 accent-primary"
              />
              As que parirem secam sozinhas
            </label>
            {p.diasLactacaoNovas != null && (
              <Campo rotulo="depois de" id="dias-lact">
                <CampoNumero id="dias-lact" valor={p.diasLactacaoNovas} aoMudar={(n) => mudar({ diasLactacaoNovas: Math.max(7, Math.round(n)) })} sufixo="dias" max={730} />
              </Campo>
            )}
            {rebanho.partosPrevistos.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.usarPartosDoApp} onChange={(e) => mudar({ usarPartosDoApp: e.target.checked })} className="size-4 accent-primary" />
                Somar {rebanho.partosPrevistos.reduce((t, x) => t + x.quantidade, 0)} partos com gestação confirmada no app
              </label>
            )}
          </div>

          <div className="painel flex flex-col gap-3">
            <h2 className="font-sans text-sm font-semibold">Compradores e teto</h2>
            <p className="text-xs text-muted-foreground">Na ordem de prioridade: o primeiro leva até o máximo antes do segundo receber.</p>
            {p.compradores.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: COR_SERIES[i % COR_SERIES.length] }} aria-hidden />
                  <Input value={c.nome} onChange={(e) => mudarComprador(i, { nome: e.target.value })} aria-label="Nome do comprador" className="h-8" />
                  <select
                    value={c.diaColeta}
                    onChange={(e) => mudarComprador(i, { diaColeta: Number(e.target.value) })}
                    aria-label="Dia da coleta"
                    className="h-8 rounded-md border border-input bg-input/30 px-2 text-sm"
                  >
                    {DIAS_SEMANA.map((d, n) => (
                      <option key={d} value={n}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {p.compradores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => mudar({ compradores: p.compradores.filter((_, j) => j !== i) })}
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={`Remover ${c.nome}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Campo rotulo="Mínimo/semana" id={`min-${c.id}`}>
                    <CampoNumero id={`min-${c.id}`} valor={c.minSemanal} aoMudar={(n) => mudarComprador(i, { minSemanal: n })} sufixo="L" />
                  </Campo>
                  <Campo rotulo="Máximo/semana" id={`max-${c.id}`}>
                    <CampoNumero id={`max-${c.id}`} valor={c.maxSemanal} aoMudar={(n) => mudarComprador(i, { maxSemanal: n })} sufixo="L" />
                  </Campo>
                </div>
              </div>
            ))}
            {p.compradores.length < COR_SERIES.length && (
              <button
                type="button"
                onClick={() => mudar({ compradores: [...p.compradores, { id: `c${Date.now()}`, nome: 'Novo comprador', diaColeta: 5, minSemanal: 0, maxSemanal: 0 }] })}
                className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm text-primary hover:bg-accent"
              >
                <Plus className="size-4" /> Comprador
              </button>
            )}
            <Campo rotulo="Teto semanal (total vendido)" id="teto">
              <CampoNumero id="teto" valor={p.tetoSemanal} aoMudar={(n) => mudar({ tetoSemanal: n })} sufixo="L" />
            </Campo>
          </div>

          <div className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-xl border border-border bg-card/95 p-3 backdrop-blur">
            <div className="flex gap-2">
              <Button onClick={salvar} disabled={!alterado || estado.tipo === 'salvando'} className="flex-1">
                {estado.tipo === 'salvando' ? 'Salvando…' : 'Salvar'}
              </Button>
              {alterado && (
                <Button variant="outline" onClick={() => setP(base)}>
                  Desfazer
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {estado.tipo === 'erro' && <span className="text-destructive">{estado.msg}</span>}
              {estado.tipo !== 'erro' && alterado && 'Alterações não salvas.'}
              {estado.tipo === 'salvo' && !alterado && `Salvo em ${new Date(estado.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}${estado.por ? ` por ${estado.por}` : ''}.`}
              {estado.tipo === 'parado' && !alterado && 'Valores iniciais — ainda não salvos.'}
            </p>
          </div>
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-6 lg:order-2">
          <section className="painel">
            <h2 className="mb-3 font-sans text-sm font-semibold">Litros por semana e para quem vão</h2>
            <GraficoSemanal linhas={linhasGrafico} series={seriesGrafico} teto={p.tetoSemanal} />
          </section>

          <section className="painel overflow-x-auto">
            <h2 className="mb-1 font-sans text-sm font-semibold">Por mês — para o laticínio</h2>
            <p className="mb-3 text-xs text-muted-foreground">O primeiro mês conta de hoje em diante.</p>
            <table className="w-full min-w-[36rem] text-sm whitespace-nowrap tabular-nums">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium">Mês</th>
                  <th className="px-2 text-right font-medium">Lactantes</th>
                  <th className="px-2 text-right font-medium">L/dia</th>
                  <th className="px-2 text-right font-medium">L no mês</th>
                  <th className="px-2 text-right font-medium">Partos</th>
                  <th className="px-2 text-right font-medium">Secagens</th>
                  <th className="pl-2 text-right font-medium">Sem comprador</th>
                </tr>
              </thead>
              <tbody>
                {proj.meses.map((m) => (
                  <tr key={m.mes} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {rotuloMesLongo(m.mes)}
                      {m.dias < diasNoMes(m.mes) && <span className="ml-1 text-xs text-muted-foreground">({m.dias} dias)</span>}
                    </td>
                    <td className="px-2 text-right">{animais(m.lactantesMedias)}</td>
                    <td className="px-2 text-right">{litros(m.litrosDiaMedio)}</td>
                    <td className="px-2 text-right font-medium">{litros(m.litrosMes)}</td>
                    <td className="px-2 text-right">{m.partos ? animais(m.partos) : '—'}</td>
                    <td className="px-2 text-right">{m.secagens ? animais(m.secagens) : '—'}</td>
                    <td className={`pl-2 text-right ${m.excedente > 0.5 ? 'text-destructive' : 'text-muted-foreground'}`}>{m.excedente > 0.5 ? litros(m.excedente) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="painel overflow-x-auto">
            <button type="button" onClick={() => setVerSemanas((v) => !v)} className="font-sans text-sm font-semibold hover:text-primary" aria-expanded={verSemanas}>
              {verSemanas ? '▾' : '▸'} Semana a semana ({proj.semanas.length})
            </button>
            {verSemanas && (
              <table className="mt-3 w-full min-w-[40rem] text-sm whitespace-nowrap tabular-nums">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-medium">Semana</th>
                    <th className="px-2 text-right font-medium">Lact.</th>
                    <th className="px-2 text-right font-medium">Partos</th>
                    <th className="px-2 text-right font-medium">Secag.</th>
                    <th className="px-2 text-right font-medium">L/semana</th>
                    {p.compradores.map((c) => (
                      <th key={c.id} className="px-2 text-right font-medium">
                        {c.nome}
                      </th>
                    ))}
                    <th className="pl-2 text-right font-medium">Excedente</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.semanas.map((s) => (
                    <tr key={s.inicio} className="border-b border-border/60 last:border-0">
                      <td className="py-1.5 pr-3 whitespace-nowrap">
                        {diaMes(s.inicio)}–{diaMes(s.fim)}
                        {s.dias < 7 && <span className="ml-1 text-xs text-muted-foreground">({s.dias}d)</span>}
                      </td>
                      <td className="px-2 text-right">{animais(s.lactantes)}</td>
                      <td className="px-2 text-right">{s.partos ? animais(s.partos) : ''}</td>
                      <td className="px-2 text-right">{s.secagens ? animais(s.secagens) : ''}</td>
                      <td className={`px-2 text-right font-medium ${s.acimaDoTeto > 0.5 ? 'text-destructive' : ''}`}>{litros(s.litrosSemana)}</td>
                      {s.entregas.map((e) => (
                        <td key={e.compradorId} className="px-2 text-right">
                          {litros(e.litros)}
                          {e.abaixoDoMinimo && <span className="ml-1 text-xs text-primary" title="abaixo do mínimo combinado">↓mín</span>}
                        </td>
                      ))}
                      <td className={`pl-2 text-right ${s.excedente > 0.5 ? 'text-destructive' : 'text-muted-foreground'}`}>{s.excedente > 0.5 ? litros(s.excedente) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <p className="text-xs text-muted-foreground">
            A projeção não inclui mortes, vendas nem a curva da lactação (sobe até o pico e cai depois): cada cabra produz a média informada o tempo todo. A semana de {diaMes(primeira.inicio)} começou antes de hoje e entra inteira.
          </p>
        </div>
      </div>
    </div>
  );
}

function diasNoMes(aaaamm: string): number {
  const [a, m] = aaaamm.split('-').map(Number);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

function Tile({ rotulo, valor, detalhe, alerta = false }: { rotulo: string; valor: string; detalhe: string; alerta?: boolean }) {
  return (
    <div className={`painel flex flex-col gap-1 ${alerta ? 'border-destructive/60' : ''}`}>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {alerta && <AlertTriangle className="size-3.5 text-destructive" aria-label="alerta" />}
        {rotulo}
      </span>
      <span className={`text-xl font-semibold tabular-nums ${alerta ? 'text-destructive' : ''}`}>{valor}</span>
      <span className="text-xs text-muted-foreground">{detalhe}</span>
    </div>
  );
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
