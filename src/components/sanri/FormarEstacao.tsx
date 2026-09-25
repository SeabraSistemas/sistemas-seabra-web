'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { diaDeInput, diaParaInput, formatDia, somarDias } from '@/lib/painel/format';
import {
  acompanharFemea,
  candidatas,
  conflitoReprodutor,
  indicadores,
  type Animal,
  type DadosReproducao,
  type Estacao,
} from '@/lib/sanri/monta';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { NomeAnimal, ResumoCurto, Selo, tituloEstacao } from './MontaComum';

interface Reprodutor {
  chave: string;
  coberturas: number;
  ultima: number;
}

/** Por padrão só aparece reprodutor com cobertura nos últimos 6 meses — estação é coisa recente. */
const RECENTE_DIAS = 180;

/** "21/09" no ano corrente, "02/10/25" em outro — sem o ano, cobertura de 2025 parecia futura. */
function dataCurta(d: number, hoje: number): string {
  const t = formatDia(d);
  return Math.floor(d / 10000) === Math.floor(hoje / 10000) ? t.slice(0, 5) : `${t.slice(0, 6)}${t.slice(8)}`;
}

/**
 * Formar (ou editar) a "view" de uma estação: reprodutor + período, e as
 * fêmeas que ele cobriu no período SEGUNDO O APP. Não lança nada no app —
 * só grava a estação na aba estacao_monta.
 */
export function FormarEstacao({
  animais,
  dados,
  estacoes,
  hoje,
  estacao,
}: {
  animais: Animal[];
  dados: DadosReproducao;
  estacoes: Estacao[];
  hoje: number;
  /** Presente = editando esta estação (o reprodutor não muda). */
  estacao?: Estacao;
}) {
  const router = useRouter();
  const porChave = useMemo(() => new Map(animais.map((a) => [a.chave, a])), [animais]);

  // Reprodutores com cobertura lançada, o mais recente primeiro.
  const reprodutores = useMemo<Reprodutor[]>(() => {
    const m = new Map<string, Reprodutor>();
    for (const c of dados.coberturas) {
      const r = m.get(c.reprodutor) ?? { chave: c.reprodutor, coberturas: 0, ultima: 0 };
      r.coberturas++;
      r.ultima = Math.max(r.ultima, c.data);
      m.set(c.reprodutor, r);
    }
    // Sem nome de verdade ("Desconhecido") não dá para formar estação.
    return [...m.values()].filter((r) => (porChave.get(r.chave)?.nome ?? '').toLowerCase() !== 'desconhecido').sort((a, b) => b.ultima - a.ultima);
  }, [dados.coberturas, porChave]);
  const [verTodos, setVerTodos] = useState(false);
  const limiteRecente = somarDias(hoje, -RECENTE_DIAS)!;
  const recentes = reprodutores.filter((r) => r.ultima >= limiteRecente);
  const mostrados = verTodos || recentes.length === 0 ? reprodutores : recentes;

  const [reprodutor, setReprodutor] = useState(estacao?.reprodutor ?? '');
  const [inicio, setInicio] = useState(estacao ? diaParaInput(estacao.inicio) : '');
  const [fim, setFim] = useState(estacao ? diaParaInput(estacao.fim) : '');
  const [obs, setObs] = useState(estacao?.obs ?? '');
  const [marcadas, setMarcadas] = useState<Set<string>>(() => new Set(estacao?.femeas ?? []));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ini = diaDeInput(inicio);
  const fi = diaDeInput(fim);
  // Sem fim ainda, mostra as coberturas até hoje — a lista já serve para decidir o período.
  const periodo = ini != null ? { inicio: ini, fim: fi ?? hoje } : null;
  const lista = reprodutor && periodo ? candidatas(dados.coberturas, estacoes, reprodutor, periodo, estacao?.id) : [];
  const elegiveis = lista.filter((c) => !c.ocupadaEm);
  const selecionadas = elegiveis.filter((c) => marcadas.has(c.femea)).map((c) => c.femea);
  const conflito = reprodutor && ini != null && fi != null ? conflitoReprodutor(estacoes, reprodutor, { inicio: ini, fim: fi }, estacao?.id) : null;

  const previa = (() => {
    if (!reprodutor || ini == null || selecionadas.length === 0) return null;
    const rascunho: Estacao = {
      id: estacao?.id ?? 'rascunho',
      reprodutor,
      reprodutorNumero: null,
      reprodutorNome: null,
      inicio: ini,
      fim: fi ?? hoje,
      finalizadaEm: estacao?.finalizadaEm ?? null,
      femeas: selecionadas,
      obs: null,
      alteradaEm: hoje,
      alteradaPor: null,
      criadaEm: hoje,
    };
    return indicadores(selecionadas.map((f) => acompanharFemea(f, rascunho, dados, hoje)), hoje);
  })();

  function escolherReprodutor(chave: string) {
    setReprodutor(chave);
    setErro(null);
    // Começa pela cobertura mais recente dele e já marca quem ele cobriu dali até hoje.
    const r = reprodutores.find((x) => x.chave === chave);
    const novoInicio = r ? r.ultima : null;
    if (novoInicio != null) setInicio(diaParaInput(novoInicio));
    const c = novoInicio != null ? candidatas(dados.coberturas, estacoes, chave, { inicio: novoInicio, fim: fi ?? hoje }) : [];
    setMarcadas(new Set(c.filter((x) => !x.ocupadaEm).map((x) => x.femea)));
  }

  function alternar(f: string) {
    const s = new Set(marcadas);
    if (s.has(f)) s.delete(f);
    else s.add(f);
    setMarcadas(s);
  }

  const todasMarcadas = elegiveis.length > 0 && selecionadas.length === elegiveis.length;
  const valido = !!reprodutor && ini != null && fi != null && fi >= ini && selecionadas.length > 0 && !conflito;

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch('/sanri/api/estacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: estacao ? 'alterar' : 'criar',
          estacaoId: estacao?.id,
          reprodutor,
          inicio,
          fim,
          femeas: selecionadas,
          obs,
        }),
      });
      const corpo = (await res.json().catch(() => ({}))) as { erro?: string; id?: string };
      if (!res.ok || !corpo.id) {
        setErro(corpo.erro ? `Não salvou: ${corpo.erro}.` : 'Não foi possível salvar — tente de novo.');
        return;
      }
      router.push(`/sanri/reproducao/${corpo.id}`);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  const nomeReprodutor = (chave: string) => porChave.get(chave)?.nome ?? porChave.get(chave)?.numero ?? chave.replace(/^[nc]:/, '');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="t-mono">Reprodução · Monta livre</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">{estacao ? `Editar estação — ${tituloEstacao(estacao)}` : 'Formar estação'}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Só entra fêmea com cobertura lançada no app com este reprodutor dentro do período. O painel não lança nada no app.
        </p>
      </div>

      <section className="flex flex-col gap-5 rounded-card border border-rule bg-paper p-4 shadow-card sm:p-6">
        {estacao ? (
          <div className="text-sm">
            <span className="font-medium text-ink-1">Reprodutor</span>
            <p className="mt-1 text-base font-semibold text-ink">{tituloEstacao(estacao)}</p>
          </div>
        ) : reprodutores.length === 0 ? (
          <Aviso tom="aviso">Nenhuma cobertura lançada no app no último ano.</Aviso>
        ) : (
          <div role="group" aria-label="Reprodutor" className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-1">Reprodutor</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {mostrados.map((r) => (
                <button
                  key={r.chave}
                  type="button"
                  aria-pressed={reprodutor === r.chave}
                  onClick={() => escolherReprodutor(r.chave)}
                  className={cn(
                    'flex min-h-14 flex-col items-start justify-center rounded-campo border px-3 py-2 text-left transition-colors',
                    reprodutor === r.chave ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink hover:bg-paper-2',
                  )}
                >
                  <span className="w-full truncate text-sm font-semibold">{nomeReprodutor(r.chave)}</span>
                  <span className={cn('text-xs', reprodutor === r.chave ? 'text-paper' : 'text-ink-2')}>
                    {r.coberturas} cob. · últ. {dataCurta(r.ultima, hoje)}
                  </span>
                </button>
              ))}
            </div>
            {recentes.length > 0 && recentes.length < reprodutores.length && (
              <button type="button" onClick={() => setVerTodos(!verTodos)} className="self-start text-xs font-medium text-bay underline underline-offset-2">
                {verTodos ? 'Só com cobertura nos últimos 6 meses' : `Ver todos (${reprodutores.length})`}
              </button>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Rotulo texto="Início (entrada do reprodutor)">
            <PainelCampo type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Rotulo>
          <Rotulo texto="Fim (saída prevista)">
            <PainelCampo type="date" value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} />
          </Rotulo>
        </div>
        {conflito && (
          <Aviso tom="erro">
            Este reprodutor já tem uma estação de {formatDia(conflito.inicio)} a {formatDia(conflito.fim)}. Ajuste o período.
          </Aviso>
        )}
        {fi != null && ini != null && fi < ini && <Aviso tom="erro">O fim não pode ser antes do início.</Aviso>}
      </section>

      {reprodutor && periodo && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-ink">
              Coberturas no app · {formatDia(periodo.inicio)} a {formatDia(periodo.fim)}
              {fi == null && <span className="font-normal text-ink-2"> (até hoje)</span>}
            </h3>
            {elegiveis.length > 0 && (
              <PainelBotao
                variante="pequeno"
                onClick={() => setMarcadas(todasMarcadas ? new Set() : new Set([...marcadas, ...elegiveis.map((c) => c.femea)]))}
              >
                {todasMarcadas ? 'Desmarcar todas' : 'Marcar todas'}
              </PainelBotao>
            )}
          </div>

          {lista.length === 0 ? (
            <p className="rounded-card border border-rule bg-paper p-4 text-sm text-ink-2">Nenhuma cobertura deste reprodutor lançada no app neste período.</p>
          ) : (
            <ul className="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-paper">
              {lista.map((c) => {
                const a = porChave.get(c.femea);
                const nova = estacao != null && !estacao.femeas.includes(c.femea);
                return (
                  <li key={c.femea}>
                    <label className={cn('flex items-center gap-3 px-4 py-3', c.ocupadaEm ? 'opacity-60' : 'cursor-pointer hover:bg-paper-1')}>
                      <input
                        type="checkbox"
                        className="size-5 shrink-0 accent-ink"
                        checked={!c.ocupadaEm && marcadas.has(c.femea)}
                        disabled={!!c.ocupadaEm}
                        onChange={() => alternar(c.femea)}
                      />
                      <div className="min-w-0 flex-1">
                        <NomeAnimal animal={a} chave={c.femea} />
                      </div>
                      <div className="hidden text-right text-xs text-ink-2 sm:block">
                        {[a?.categoria, a?.baia].filter(Boolean).join(' · ')}
                      </div>
                      <div className="text-right text-sm tabular-nums text-ink-1">
                        {c.datas.map((d) => formatDia(d).slice(0, 5)).join(' · ')}
                        {c.datas.length > 1 && <span className="block text-xs text-ink-2">repasse</span>}
                      </div>
                      {nova && <Selo className="bg-aviso-fundo text-aviso">nova</Selo>}
                      {c.ocupadaEm && <Selo className="bg-paper-2 text-ink-1">em outra estação</Selo>}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {previa && (
        <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
          <h3 className="mb-3 text-base font-semibold text-ink">Prévia · {selecionadas.length} {selecionadas.length === 1 ? 'fêmea' : 'fêmeas'}</h3>
          <ResumoCurto i={previa} />
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-card border border-rule bg-paper p-4 shadow-card sm:p-6">
        <Rotulo texto="Observação">
          <PainelCampo value={obs} onChange={(e) => setObs(e.target.value)} placeholder="ex: lote da baia G2-6" />
        </Rotulo>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className="flex flex-wrap gap-2">
          <PainelBotao onClick={salvar} disabled={!valido || salvando} className="min-w-40">
            {salvando ? 'Salvando…' : estacao ? 'Salvar estação' : 'Formar estação'}
          </PainelBotao>
          <PainelBotao variante="contorno" onClick={() => router.back()} disabled={salvando}>
            Cancelar
          </PainelBotao>
        </div>
        {!valido && !salvando && (
          <p className="text-xs text-ink-2">
            {!reprodutor ? 'Escolha o reprodutor.' : ini == null || fi == null ? 'Informe início e fim.' : selecionadas.length === 0 ? 'Marque pelo menos uma fêmea.' : ''}
          </p>
        )}
      </section>
    </div>
  );
}
