'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampoNumero } from '@/components/tres-irmaos/CampoNumero';
import { COR_EXCEDENTE, COR_SERIES, GraficoSemanal } from '@/components/tres-irmaos/GraficoSemanal';
import { DIAS_SEMANA, litros } from '@/components/tres-irmaos/formato';
import { agruparPorSemana, type Lancamento, type SemanaRealizada } from '@/lib/tres-irmaos/acompanhamento';
import type { RebanhoDoApp } from '@/lib/tres-irmaos/dados';
import { dataCurta, diaMes, inicioDaSemana, somarDias } from '@/lib/tres-irmaos/datas';
import type { Parametros } from '@/lib/tres-irmaos/projecao';

type Tipo = 'producao' | `coleta:${string}`;

export function AcompanhamentoPainel({
  hoje,
  rebanho,
  parametros,
  lancamentos: iniciais,
}: {
  hoje: string;
  rebanho: RebanhoDoApp;
  parametros: Parametros;
  lancamentos: Lancamento[];
}) {
  const router = useRouter();
  const { compradores, tetoSemanal } = parametros;
  const [lancamentos, setLancamentos] = useState(iniciais);
  const [data, setData] = useState(hoje);
  const [tipo, setTipo] = useState<Tipo>('producao');
  const [valor, setValor] = useState(0);
  const [obs, setObs] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);

  const semanas = useMemo(() => agruparPorSemana(lancamentos, compradores, tetoSemanal), [lancamentos, compradores, tetoSemanal]);
  const semanaAtual = inicioDaSemana(hoje);
  const atual = semanas.find((s) => s.inicio === semanaAtual) ?? semanaVazia(semanaAtual, compradores.map((c) => c.id));
  const nomeDe = (id: string | null) => compradores.find((c) => c.id === id)?.nome ?? id ?? '';

  const linhasGrafico = [...semanas]
    .reverse()
    .slice(-16)
    .map((s) => {
      const linha: Record<string, number | string> = { inicio: s.inicio };
      s.coletas.forEach((c) => (linha[c.compradorId] = Math.round(c.litros)));
      linha.saldo = Math.max(0, Math.round(s.saldo));
      return linha;
    });

  async function lancar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!(valor > 0)) {
      setErro('Informe os litros.');
      return;
    }
    setEnviando(true);
    const coleta = tipo.startsWith('coleta:');
    try {
      const r = await fetch('/3irmaos/api/lancamentos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data, tipo: coleta ? 'coleta' : 'producao', comprador: coleta ? tipo.slice(7) : null, litros: valor, observacao: obs }),
      });
      const corpo = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(corpo.erro ?? 'Não foi possível gravar.');
        if (r.status === 401) router.refresh();
        return;
      }
      setLancamentos((l) => [corpo.lancamento, ...l]);
      setValor(0);
      setObs('');
      setAberta(inicioDaSemana(data));
    } catch {
      setErro('Sem conexão. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(l: Lancamento) {
    const descricao = l.tipo === 'producao' ? `produção de ${litros(l.litros)}` : `coleta de ${litros(l.litros)} (${nomeDe(l.comprador)})`;
    if (!window.confirm(`Apagar ${descricao} de ${dataCurta(l.data)}?`)) return;
    const r = await fetch(`/3irmaos/api/lancamentos?id=${l.id}`, { method: 'DELETE' });
    if (r.ok) setLancamentos((ls) => ls.filter((x) => x.id !== l.id));
    else window.alert((await r.json().catch(() => ({}))).erro ?? 'Não foi possível apagar.');
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Acompanhamento semanal</h1>
        <p className="text-sm text-muted-foreground">
          O que o tanque produziu e o que cada comprador levou, de terça a segunda. Teto de venda: {litros(tetoSemanal)} por semana. {compradores.map((c) => `${c.nome}: ${DIAS_SEMANA[c.diaColeta]}, até ${litros(c.maxSemanal)}`).join(' · ')}.
        </p>
      </header>

      <section className="painel flex flex-col gap-3">
        <h2 className="font-sans text-sm font-semibold">
          Semana atual · {diaMes(atual.inicio)} a {diaMes(atual.fim)}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Medidor rotulo="Produzido" valor={atual.producao} detalhe={atual.diasComProducao ? `${atual.diasComProducao} ${atual.diasComProducao === 1 ? 'dia lançado' : 'dias lançados'}` : 'nada lançado'} />
          {atual.coletas.map((c) => {
            const comp = compradores.find((x) => x.id === c.compradorId)!;
            return <Medidor key={c.compradorId} rotulo={comp.nome} valor={c.litros} de={comp.maxSemanal} detalhe={`mín ${litros(comp.minSemanal)} · máx ${litros(comp.maxSemanal)}`} alerta={c.acimaDoMaximo} />;
          })}
          <Medidor rotulo="Total vendido" valor={atual.vendido} de={tetoSemanal} detalhe={atual.vendido <= tetoSemanal ? `cabem mais ${litros(tetoSemanal - atual.vendido)}` : `${litros(atual.vendidoAcimaDoTeto)} acima do teto`} alerta={atual.vendidoAcimaDoTeto > 0} />
        </div>
        <p className="text-xs text-muted-foreground">
          No app hoje: {rebanho.lactantes} lactantes. Se a produção dos lançamentos estiver muito longe de {litros(rebanho.lactantes * parametros.mediaLitros * 7)} por semana ({rebanho.lactantes} × {String(parametros.mediaLitros).replace('.', ',')} L × 7), vale revisar a média na Projeção.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <form onSubmit={lancar} className="painel flex h-fit flex-col gap-3">
          <h2 className="font-sans text-sm font-semibold">Lançar</h2>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1 text-xs text-muted-foreground">O quê</legend>
            <Opcao nome="tipo" valor="producao" atual={tipo} aoEscolher={setTipo} rotulo="Produção do tanque" ajuda="do dia, ou o total de vários dias" />
            {compradores.map((c) => (
              <Opcao key={c.id} nome="tipo" valor={`coleta:${c.id}`} atual={tipo} aoEscolher={setTipo} rotulo={`Coleta da ${c.nome}`} ajuda={DIAS_SEMANA[c.diaColeta]} />
            ))}
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="data" className="text-xs text-muted-foreground">
                Data
              </label>
              <Input id="data" type="date" value={data} max={hoje} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="litros" className="text-xs text-muted-foreground">
                Litros
              </label>
              <CampoNumero id="litros" valor={valor} aoMudar={setValor} sufixo="L" max={100000} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="obs" className="text-xs text-muted-foreground">
              Observação (opcional)
            </label>
            <Input id="obs" value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Gravando…' : 'Lançar'}
          </Button>
        </form>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="painel">
            <h2 className="mb-3 font-sans text-sm font-semibold">Vendido por semana (últimas 16)</h2>
            <GraficoSemanal
              linhas={linhasGrafico}
              series={[
                ...compradores.map((c, i) => ({ chave: c.id, nome: c.nome, cor: COR_SERIES[i % COR_SERIES.length] })),
                { chave: 'saldo', nome: 'Produzido e não vendido', cor: COR_EXCEDENTE },
              ]}
              teto={tetoSemanal}
              altura={240}
            />
          </section>

          <section className="painel overflow-x-auto">
            <h2 className="mb-3 font-sans text-sm font-semibold">Semanas</h2>
            {semanas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento ainda. Comece pela produção do tanque e pelas coletas desta semana.</p>
            ) : (
              <table className="w-full min-w-[36rem] text-sm whitespace-nowrap tabular-nums">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-medium">Semana</th>
                    <th className="px-2 text-right font-medium">Produzido</th>
                    {compradores.map((c) => (
                      <th key={c.id} className="px-2 text-right font-medium">
                        {c.nome}
                      </th>
                    ))}
                    <th className="px-2 text-right font-medium">Vendido</th>
                    <th className="pl-2 text-right font-medium">Não vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {semanas.map((s) => (
                    <LinhaSemana
                      key={s.inicio}
                      s={s}
                      teto={tetoSemanal}
                      aberta={aberta === s.inicio}
                      alternar={() => setAberta((a) => (a === s.inicio ? null : s.inicio))}
                      lancamentos={lancamentos.filter((l) => inicioDaSemana(l.data) === s.inicio)}
                      colunas={compradores.length + 4}
                      nomeDe={nomeDe}
                      apagar={apagar}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function semanaVazia(inicio: string, ids: string[]): SemanaRealizada {
  return {
    inicio,
    fim: somarDias(inicio, 6),
    producao: 0,
    diasComProducao: 0,
    coletas: ids.map((compradorId) => ({ compradorId, litros: 0, abaixoDoMinimo: true, acimaDoMaximo: false })),
    coletasOutros: 0,
    vendido: 0,
    saldo: 0,
    vendidoAcimaDoTeto: 0,
    producaoAcimaDoTeto: 0,
  };
}

function LinhaSemana({
  s,
  teto,
  aberta,
  alternar,
  lancamentos,
  colunas,
  nomeDe,
  apagar,
}: {
  s: SemanaRealizada;
  teto: number;
  aberta: boolean;
  alternar: () => void;
  lancamentos: Lancamento[];
  colunas: number;
  nomeDe: (id: string | null) => string;
  apagar: (l: Lancamento) => void;
}) {
  return (
    <>
      <tr className="border-b border-border/60">
        <td className="py-2 pr-3 whitespace-nowrap">
          <button type="button" onClick={alternar} className="hover:text-primary" aria-expanded={aberta}>
            {aberta ? '▾' : '▸'} {diaMes(s.inicio)}–{diaMes(s.fim)}
          </button>
        </td>
        <td className={`px-2 text-right ${s.producaoAcimaDoTeto > 0 ? 'text-destructive' : ''}`}>{s.producao ? litros(s.producao) : '—'}</td>
        {s.coletas.map((c) => (
          <td key={c.compradorId} className={`px-2 text-right ${c.acimaDoMaximo ? 'text-destructive' : ''}`}>
            {c.litros ? litros(c.litros) : '—'}
            {c.litros > 0 && c.abaixoDoMinimo && <span className="ml-1 text-xs text-primary" title="abaixo do mínimo combinado">↓mín</span>}
          </td>
        ))}
        <td className={`px-2 text-right font-medium ${s.vendido > teto ? 'text-destructive' : ''}`}>
          {s.vendido > teto && <AlertTriangle className="mr-1 inline size-3.5" aria-label="acima do teto" />}
          {litros(s.vendido)}
        </td>
        <td className={`pl-2 text-right ${s.saldo > 0.5 ? '' : 'text-muted-foreground'}`}>{s.producao ? litros(s.saldo) : '—'}</td>
      </tr>
      {aberta && (
        <tr className="border-b border-border/60 bg-accent/40">
          <td colSpan={colunas} className="px-3 py-2">
            <ul className="flex flex-col gap-1 text-xs">
              {lancamentos.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <span className="w-12 tabular-nums text-muted-foreground">{diaMes(l.data)}</span>
                  <span className="flex-1">
                    {l.tipo === 'producao' ? 'Produção' : `Coleta · ${nomeDe(l.comprador)}`}
                    {l.observacao && <span className="text-muted-foreground"> — {l.observacao}</span>}
                  </span>
                  <span className="tabular-nums">{litros(l.litros)}</span>
                  <span className="hidden text-muted-foreground sm:inline">{l.criado_por?.split('@')[0]}</span>
                  <button type="button" onClick={() => apagar(l)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Apagar lançamento">
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
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

function Opcao({ nome, valor, atual, aoEscolher, rotulo, ajuda }: { nome: string; valor: Tipo; atual: Tipo; aoEscolher: (t: Tipo) => void; rotulo: string; ajuda: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-sm ${atual === valor ? 'border-primary' : 'border-border'}`}>
      <input type="radio" name={nome} checked={atual === valor} onChange={() => aoEscolher(valor)} className="accent-primary" />
      <span className="flex-1">{rotulo}</span>
      <span className="text-xs text-muted-foreground">{ajuda}</span>
    </label>
  );
}
