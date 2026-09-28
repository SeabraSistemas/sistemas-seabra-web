'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { COR_EXCEDENTE, COR_SERIES, GraficoSemanal } from '@/components/tres-irmaos/GraficoSemanal';
import { DIAS_SEMANA, litros } from '@/components/tres-irmaos/formato';
import { agruparColetas, montarColetas, ordenhasDoApp, type Coleta } from '@/lib/tres-irmaos/acompanhamento';
import type { DoApp } from '@/lib/tres-irmaos/dados';
import { dataCurta, diaDaSemana, diaMes, inicioDaSemana, somarDias } from '@/lib/tres-irmaos/datas';
import type { Parametros } from '@/lib/tres-irmaos/projecao';

const DIA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const TURNO = { 1: 'manhã', 2: 'tarde' } as const;

/**
 * Acompanhamento SÓ LEITURA (decisão do Felipe, 28/09/2026: "acompanhamento
 * é para acompanhar, não lançar"). Tudo vem da Produção Diária que o
 * produtor lança no app, ordenha por ordenha, e da Saída de Leite.
 */
export function AcompanhamentoPainel({ hoje, parametros, doApp }: { hoje: string; parametros: Parametros; doApp: DoApp }) {
  const { compradores, tetoSemanal } = parametros;
  const ordenhas = useMemo(() => ordenhasDoApp(doApp.producoes), [doApp.producoes]);
  const coletas = useMemo(() => montarColetas(ordenhas, doApp.saidas, compradores, tetoSemanal, hoje), [ordenhas, doApp.saidas, compradores, tetoSemanal, hoje]);
  const semanas = useMemo(() => agruparColetas(coletas, tetoSemanal), [coletas, tetoSemanal]);
  const nomeDe = (id: string) => compradores.find((c) => c.id === id)?.nome ?? id;
  const maxDe = (id: string) => compradores.find((c) => c.id === id)?.maxSemanal ?? 0;

  const aberta = coletas.find((c) => c.aberta) ?? null;
  const ultimaOrdenha = ordenhas.reduce<{ data: string; turno: 1 | 2 } | null>(
    (m, o) => (!m || o.data > m.data || (o.data === m.data && o.turno > m.turno) ? { data: o.data, turno: o.turno } : m),
    null,
  );

  // Ritmo de manhã e de tarde na semana que termina na última ordenha lançada
  // (mesma janela da média da Projeção): estima o que falta para fechar a
  // coleta aberta. Janela maior misturaria rebanhos — em 28/09 o dia anterior
  // lançado era de agosto, com 44 cabras em vez de 67.
  const ritmo = useMemo(() => {
    if (!ultimaOrdenha) return { manha: null, tarde: null };
    const desde = somarDias(ultimaOrdenha.data, -6);
    const media = (turno: 1 | 2) => {
      const xs = ordenhas.filter((o) => o.turno === turno && o.data >= desde);
      return xs.length ? xs.reduce((t, x) => t + x.litros, 0) / xs.length : null;
    };
    return { manha: media(1), tarde: media(2) };
  }, [ordenhas, ultimaOrdenha]);
  const estimativaAberta = aberta ? estimarFechamento(aberta, ordenhas, ritmo) : null;

  // Gráfico: últimas 16 semanas, com as sem coleta aparecendo vazias (o buraco nos lançamentos fica visível).
  const semanaAtual = inicioDaSemana(hoje);
  const porInicio = new Map(semanas.map((s) => [s.inicio, s]));
  const primeira = semanas.at(-1)?.inicio;
  const linhasGrafico: Array<Record<string, number | string>> = [];
  if (primeira) {
    for (let i = 15, inicio = somarDias(semanaAtual, -7 * 15); i >= 0; i--, inicio = somarDias(inicio, 7)) {
      if (inicio < primeira) continue;
      const s = porInicio.get(inicio);
      const linha: Record<string, number | string> = { inicio };
      compradores.forEach((c) => (linha[c.id] = Math.round(s?.coletas.filter((x) => x.compradorId === c.id && !x.aberta).reduce((t, x) => t + x.leva, 0) ?? 0)));
      linha.sobra = Math.round(Math.max(0, (s?.produzido ?? 0) - (s?.vendido ?? 0)));
      linhasGrafico.push(linha);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Acompanhamento das coletas</h1>
        <p className="text-sm text-muted-foreground">
          Calculado pela <strong className="text-foreground">Produção Diária</strong> lançada no app, ordenha por ordenha. Os compradores recolhem depois da 1ª ordenha do dia:
        </p>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {janelas(compradores).map((j) => (
            <li key={j.id} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: COR_SERIES[compradores.findIndex((c) => c.id === j.id) % COR_SERIES.length] }} aria-hidden />
              <span>
                <strong className="text-foreground">{j.nome}</strong>, {DIAS_SEMANA[j.dia]}: leva da {j.de} até a manhã de {DIAS_SEMANA[j.dia]} ({j.ordenhas} ordenhas), até {litros(j.max)}.
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Teto de venda: {litros(tetoSemanal)} por semana (terça a segunda). Última ordenha lançada:{' '}
          {ultimaOrdenha ? `${DIA_CURTO[diaDaSemana(ultimaOrdenha.data)]} ${dataCurta(ultimaOrdenha.data)}, ${TURNO[ultimaOrdenha.turno]}` : 'nenhuma'}.
        </p>
      </header>

      {aberta && estimativaAberta && (
        <section className="painel flex flex-col gap-3">
          <h2 className="font-sans text-sm font-semibold">
            Próxima coleta · {nomeDe(aberta.compradorId)}, {DIAS_SEMANA[diaDaSemana(aberta.data)]} {diaMes(aberta.data)} depois da 1ª ordenha
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Medidor rotulo="No tanque até agora" valor={aberta.tanque} de={maxDe(aberta.compradorId)} detalhe={`${aberta.ordenhasLancadas} de ${aberta.ordenhasEsperadas} ordenhas lançadas`} />
            <Medidor
              rotulo="Deve chegar a"
              valor={estimativaAberta.total}
              de={maxDe(aberta.compradorId)}
              detalhe={estimativaAberta.faltam ? `faltam ${estimativaAberta.faltam} ordenhas, no ritmo atual` : 'todas as ordenhas lançadas'}
              alerta={estimativaAberta.total > maxDe(aberta.compradorId)}
            />
            <Medidor
              rotulo={`${nomeDe(aberta.compradorId)} leva até`}
              valor={maxDe(aberta.compradorId)}
              detalhe={
                estimativaAberta.total > maxDe(aberta.compradorId)
                  ? `ficam ~${litros(estimativaAberta.total - maxDe(aberta.compradorId))} no tanque`
                  : `cabem mais ~${litros(maxDe(aberta.compradorId) - estimativaAberta.total)}`
              }
            />
            <Medidor
              rotulo="Ritmo por dia"
              valor={(ritmo.manha ?? 0) + (ritmo.tarde ?? 0)}
              detalhe={`manhã ${ritmo.manha != null ? litros(ritmo.manha) : '—'} · tarde ${ritmo.tarde != null ? litros(ritmo.tarde) : '—'}`}
            />
          </div>
          {aberta.sobraAnterior > 0 && <p className="text-xs text-muted-foreground">Inclui {litros(aberta.sobraAnterior)} que ficaram da coleta anterior.</p>}
        </section>
      )}

      <section className="painel">
        <h2 className="mb-3 font-sans text-sm font-semibold">Levado por semana (últimas 16)</h2>
        <GraficoSemanal
          linhas={linhasGrafico}
          series={[
            ...compradores.map((c, i) => ({ chave: c.id, nome: c.nome, cor: COR_SERIES[i % COR_SERIES.length] })),
            { chave: 'sobra', nome: 'Produzido e não levado', cor: COR_EXCEDENTE },
          ]}
          teto={tetoSemanal}
          altura={240}
        />
      </section>

      <section className="painel overflow-x-auto">
        <h2 className="mb-1 font-sans text-sm font-semibold">Coletas</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          &ldquo;Leva&rdquo; é o que cabe no máximo do comprador e no teto da semana; o resto fica no tanque para a coleta seguinte. Coleta com ordenha faltando não passa sobra adiante — não dá para saber o que ficou.
        </p>
        {semanas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma Produção Diária lançada no app ainda.</p>
        ) : (
          <table className="w-full min-w-[46rem] text-sm whitespace-nowrap tabular-nums">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium">Coleta</th>
                <th className="px-2 text-left font-medium">Leite de</th>
                <th className="px-2 text-right font-medium">Ordenhas</th>
                <th className="px-2 text-right font-medium">Produzido</th>
                <th className="px-2 text-right font-medium">No tanque</th>
                <th className="px-2 text-right font-medium">Leva</th>
                <th className="px-2 text-right font-medium">Fica</th>
                <th className="pl-2 text-right font-medium">Saída no app</th>
              </tr>
            </thead>
            <tbody>
              {semanas.map((s) => (
                <FragmentoSemana
                  key={s.inicio}
                  inicio={s.inicio}
                  produzido={s.produzido}
                  vendido={s.vendido}
                  teto={tetoSemanal}
                  completa={s.completa}
                  vazia={s.coletas.every((c) => c.ordenhasLancadas === 0)}
                >
                  {[...s.coletas].reverse().map((c) => (
                    <LinhaColeta key={`${c.compradorId}-${c.data}`} c={c} nome={nomeDe(c.compradorId)} max={maxDe(c.compradorId)} />
                  ))}
                </FragmentoSemana>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

/** Texto de cada janela: da ordenha seguinte à coleta anterior até a 1ª ordenha do dia. */
function janelas(compradores: Parametros['compradores']) {
  const dias = [...new Set(compradores.map((c) => c.diaColeta))].sort((a, b) => a - b);
  return compradores.map((c) => {
    const i = dias.indexOf(c.diaColeta);
    const anterior = dias[(i - 1 + dias.length) % dias.length];
    const distancia = (c.diaColeta - anterior + 7) % 7 || 7;
    return { id: c.id, nome: c.nome, dia: c.diaColeta, max: c.maxSemanal, de: `tarde de ${DIAS_SEMANA[anterior]}`, ordenhas: distancia * 2 };
  });
}

/** Tanque de agora + as ordenhas que faltam na janela, cada uma pela média do seu turno. */
function estimarFechamento(c: Coleta, ordenhas: { data: string; turno: 1 | 2 }[], ritmo: { manha: number | null; tarde: number | null }) {
  const lancadas = new Set(ordenhas.map((o) => `${o.data}|${o.turno}`));
  let total = c.tanque;
  let faltam = 0;
  for (let d = c.desde.data; d <= c.ate.data; d = somarDias(d, 1)) {
    for (const turno of [1, 2] as const) {
      if (d === c.desde.data && turno < c.desde.turno) continue;
      if (d === c.ate.data && turno > c.ate.turno) continue;
      if (lancadas.has(`${d}|${turno}`)) continue;
      faltam++;
      total += (turno === 1 ? ritmo.manha : ritmo.tarde) ?? 0;
    }
  }
  return { total, faltam };
}

function FragmentoSemana({
  inicio,
  produzido,
  vendido,
  teto,
  completa,
  vazia,
  children,
}: {
  inicio: string;
  produzido: number;
  vendido: number;
  teto: number;
  completa: boolean;
  vazia: boolean;
  children: React.ReactNode;
}) {
  const acima = produzido > teto;
  if (vazia) {
    return (
      <tr className="border-b border-border bg-accent/40 text-xs">
        <td colSpan={8} className="px-2 py-1.5">
          <span className="font-semibold text-foreground">
            Semana {diaMes(inicio)}–{diaMes(somarDias(inicio, 6))}
          </span>
          <span className="text-primary"> · nenhuma ordenha lançada no app</span>
        </td>
      </tr>
    );
  }
  return (
    <>
      <tr className="border-b border-border bg-accent/40 text-xs">
        <td colSpan={8} className="px-2 py-1.5">
          <span className="font-semibold text-foreground">
            Semana {diaMes(inicio)}–{diaMes(somarDias(inicio, 6))}
          </span>
          <span className="text-muted-foreground">
            {' '}
            · produzido {litros(produzido)} · levado {litros(vendido)} de {litros(teto)}
          </span>
          {acima && (
            <span className="ml-2 text-destructive">
              <AlertTriangle className="mr-1 inline size-3.5" aria-hidden />
              {litros(produzido - teto)} acima do teto
            </span>
          )}
          {!completa && <span className="ml-2 text-muted-foreground">(incompleta)</span>}
        </td>
      </tr>
      {children}
    </>
  );
}

function LinhaColeta({ c, nome, max }: { c: Coleta; nome: string; max: number }) {
  const incompleta = c.ordenhasLancadas < c.ordenhasEsperadas;
  return (
    <tr className={`border-b border-border/60 ${c.aberta ? 'text-muted-foreground' : ''}`}>
      <td className="py-2 pr-3">
        {DIA_CURTO[diaDaSemana(c.data)]} {diaMes(c.data)} · <strong className={c.aberta ? '' : 'text-foreground'}>{nome}</strong>
        {c.aberta && <span className="ml-1.5 rounded bg-primary/20 px-1 py-px text-[10px] uppercase text-primary">próxima</span>}
      </td>
      <td className="px-2 text-muted-foreground">
        {DIA_CURTO[diaDaSemana(c.desde.data)]} {diaMes(c.desde.data)} {TURNO[c.desde.turno]} → {DIA_CURTO[diaDaSemana(c.ate.data)]} manhã
      </td>
      <td className={`px-2 text-right ${incompleta ? 'text-primary' : 'text-muted-foreground'}`} title={incompleta ? 'ordenhas lançadas no app / esperadas' : undefined}>
        {c.ordenhasLancadas}/{c.ordenhasEsperadas}
      </td>
      <td className="px-2 text-right">{litros(c.produzido)}</td>
      <td className={`px-2 text-right ${c.acimaDoMaximo > 0.5 ? 'text-destructive' : ''}`} title={c.sobraAnterior ? `inclui ${litros(c.sobraAnterior)} da coleta anterior` : undefined}>
        {litros(c.tanque)}
      </td>
      <td className="px-2 text-right font-medium">
        {litros(c.leva)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">/ {litros(max)}</span>
        {!c.aberta && !incompleta && c.abaixoDoMinimo && (
          <span className="ml-1 text-xs text-primary" title="abaixo do mínimo combinado">
            ↓mín
          </span>
        )}
      </td>
      <td className={`px-2 text-right ${c.sobra > 0.5 ? 'text-destructive' : 'text-muted-foreground'}`}>{c.sobra > 0.5 ? litros(c.sobra) : '—'}</td>
      <td className="pl-2 text-right text-muted-foreground">{c.saidaNoApp != null ? litros(c.saidaNoApp) : '—'}</td>
    </tr>
  );
}

function Medidor({ rotulo, valor, de, detalhe, alerta = false }: { rotulo: string; valor: number; de?: number; detalhe: string; alerta?: boolean }) {
  const pct = de ? Math.min(100, (valor / de) * 100) : null;
  return (
    <div className={`flex flex-col gap-1 rounded-lg border p-2.5 ${alerta ? 'border-destructive/60' : 'border-border'}`}>
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <span className={`text-lg font-semibold tabular-nums ${alerta ? 'text-destructive' : ''}`}>
        {litros(valor)}
        {de != null && <span className="text-xs font-normal text-muted-foreground"> / {litros(de)}</span>}
      </span>
      {pct != null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-accent" aria-hidden>
          <div className={`h-full rounded-full ${alerta ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      <span className="text-xs text-muted-foreground">{detalhe}</span>
    </div>
  );
}
