'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSelect } from './FilterSelect';
import { MetricCard } from './MetricCard';
import { AcaoMovimentacao, useMovimentacao } from './MovimentarAcao';
import { contar, opcoesDeOrigem, rotuloLocal, rotuloLote } from '@/lib/katmandu/filters';
import { SEM_LOCAL, SEM_LOTE, type AnimalRebanho } from '@/lib/katmandu/types';

const loteDe = (a: AnimalRebanho) => a.lote || SEM_LOTE;
const localDe = (a: AnimalRebanho) => a.local || SEM_LOCAL;

/** Marcados mostrados como etiqueta; um "Marcar todos" num lote de 100 viraria um paredão. */
const LIMITE_CHIPS = 30;

/** Acima disso a confirmação só dá a contagem — uma lista de 40 números não se confere de olho. */
const LIMITE_IDS_NA_PERGUNTA = 10;

function porManejo(a: AnimalRebanho, b: AnimalRebanho): number {
  return a.idAnimal.localeCompare(b.idAnimal, 'pt-BR', { numeric: true });
}

/**
 * Movimentação animal a animal: pro caso de mover um só, ou alguns de dentro
 * de um lote, ou quem está sem lote — o que o recorte por local/lote não faz,
 * porque ele leva todo mundo da origem.
 *
 * A busca e os filtros só montam a lista de onde se marca; a marcação fica
 * guardada ao trocar de filtro, então dá pra juntar animais de lotes
 * diferentes numa mesma movimentação. Novo local e novo lote são opcionais
 * ("Manter"), mas pelo menos um tem que mudar.
 */
export function MovimentarAnimais({
  animais,
  locais,
  lotes,
}: {
  animais: AnimalRebanho[];
  locais: string[];
  lotes: string[];
}) {
  const mov = useMovimentacao();
  const [busca, setBusca] = useState('');
  const [filtroLote, setFiltroLote] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [marcados, setMarcados] = useState<Set<string>>(() => new Set());
  const [novoLocal, setNovoLocal] = useState('');
  const [novoLote, setNovoLote] = useState('');

  const ativos = useMemo(() => animais.filter((a) => a.baixa == null), [animais]);

  // Lote e Local se estreitam um ao outro, como nos filtros das outras abas.
  const contagemLote = useMemo(
    () => contar(ativos.filter((a) => !filtroLocal || localDe(a) === filtroLocal).map(loteDe)),
    [ativos, filtroLocal],
  );
  const contagemLocal = useMemo(
    () => contar(ativos.filter((a) => !filtroLote || loteDe(a) === filtroLote).map(localDe)),
    [ativos, filtroLote],
  );
  const opcoesLote = useMemo(() => opcoesDeOrigem(lotes, contagemLote, SEM_LOTE), [lotes, contagemLote]);
  const opcoesLocal = useMemo(() => opcoesDeOrigem(locais, contagemLocal, SEM_LOCAL), [locais, contagemLocal]);

  const termo = busca.trim().toLowerCase();
  const temFiltro = termo !== '' || filtroLote !== '' || filtroLocal !== '';

  const candidatos = useMemo(() => {
    if (!temFiltro) return [];
    return ativos
      .filter(
        (a) =>
          (!filtroLote || loteDe(a) === filtroLote) &&
          (!filtroLocal || localDe(a) === filtroLocal) &&
          (!termo || a.idAnimal.toLowerCase().includes(termo)),
      )
      .sort(porManejo);
  }, [ativos, temFiltro, filtroLote, filtroLocal, termo]);

  const marcadosNaLista = useMemo(() => new Set(candidatos.filter((a) => marcados.has(a.idAnimal)).map((a) => a.idAnimal)).size, [candidatos, marcados]);
  const idsNaLista = useMemo(() => new Set(candidatos.map((a) => a.idAnimal)).size, [candidatos]);

  // Um marcado que recebeu baixa depois do refresh some daqui sem alarde.
  const selecionados = useMemo(() => ativos.filter((a) => marcados.has(a.idAnimal)).sort(porManejo), [ativos, marcados]);
  const idsSelecionados = useMemo(() => Array.from(new Set(selecionados.map((a) => a.idAnimal))), [selecionados]);

  const temMudanca = novoLocal !== '' || novoLote !== '';
  const idsAMover = useMemo(() => {
    if (!temMudanca) return [];
    const mudam = selecionados.filter(
      (a) => (novoLocal !== '' && localDe(a) !== novoLocal) || (novoLote !== '' && loteDe(a) !== novoLote),
    );
    return Array.from(new Set(mudam.map((a) => a.idAnimal)));
  }, [selecionados, novoLocal, novoLote, temMudanca]);
  const jaNoDestino = temMudanca ? idsSelecionados.length - idsAMover.length : 0;

  function marcar(ids: string[], ligar: boolean) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      for (const id of ids) {
        if (ligar) novo.add(id);
        else novo.delete(id);
      }
      return novo;
    });
    mov.editou();
  }

  function trocarFiltroLote(v: string) {
    setFiltroLote(v);
    // O local escolhido antes pode não ter ninguém desse lote — a lista ficaria vazia sem motivo aparente.
    if (filtroLocal && !ativos.some((a) => (!v || loteDe(a) === v) && localDe(a) === filtroLocal)) setFiltroLocal('');
  }

  function trocarFiltroLocal(v: string) {
    setFiltroLocal(v);
    if (filtroLote && !ativos.some((a) => (!v || localDe(a) === v) && loteDe(a) === filtroLote)) setFiltroLote('');
  }

  /** Enter marca o animal digitado: dá pra ir lançando N° manejo um atrás do outro sem tirar a mão do teclado. */
  function marcarPelaBusca() {
    const exatos = candidatos.filter((a) => a.idAnimal.toLowerCase() === termo);
    const alvo = exatos.length > 0 ? exatos : candidatos.length === 1 ? candidatos : [];
    if (alvo.length === 0) return;
    marcar(
      alvo.map((a) => a.idAnimal),
      true,
    );
    setBusca('');
  }

  function limpar() {
    setMarcados(new Set());
    setNovoLocal('');
    setNovoLote('');
  }

  const mudancas = [
    novoLocal && (
      <span key="local">
        local pra <strong>{novoLocal}</strong>
      </span>
    ),
    novoLote && (
      <span key="lote">
        lote pra <strong>{novoLote}</strong>
      </span>
    ),
  ].filter(Boolean);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Marque os animais um a um: busque pelo N° manejo ou filtre por lote/local. A marcação fica guardada ao trocar
        de filtro. Animais com baixa não aparecem.
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">N° manejo</span>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                marcarPelaBusca();
              }
            }}
            placeholder="Buscar (Enter marca)"
            inputMode="search"
            className="h-8 w-full sm:w-48"
          />
        </label>
        <FilterSelect
          label="Lote"
          value={filtroLote}
          onChange={trocarFiltroLote}
          options={opcoesLote}
          labelDe={(l) => `${rotuloLote(l)} (${contagemLote[l] ?? 0})`}
          triggerClassName="w-full sm:w-48"
        />
        <FilterSelect
          label="Local"
          value={filtroLocal}
          onChange={trocarFiltroLocal}
          options={opcoesLocal}
          labelDe={(l) => `${rotuloLocal(l)} (${contagemLocal[l] ?? 0})`}
          triggerClassName="w-full sm:w-48"
        />
      </div>

      {!temFiltro ? (
        <p className="mt-3 text-sm text-muted-foreground">Busque um N° manejo ou escolha um lote/local pra listar os animais.</p>
      ) : candidatos.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum animal ativo com essa busca.</p>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              <span className="font-semibold tabular-nums">{marcadosNaLista}</span> de {idsNaLista} marcados nesta lista
            </p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => marcar(candidatos.map((a) => a.idAnimal), true)}>
                Marcar todos
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => marcar(candidatos.map((a) => a.idAnimal), false)}>
                Desmarcar todos
              </Button>
            </div>
          </div>

          <ul className="mt-3 max-h-80 divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/60">
            {candidatos.map((a, i) => (
              // O mesmo "ID animal" pode estar cadastrado duas vezes na planilha (ver DataTable) — o índice desempata a key.
              <li key={`${a.idAnimal}#${i}`}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-accent/40">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-primary"
                    checked={marcados.has(a.idAnimal)}
                    onChange={(e) => marcar([a.idAnimal], e.target.checked)}
                  />
                  <span className="w-20 shrink-0 truncate font-medium tabular-nums text-foreground">{a.idAnimal}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{rotuloLote(loteDe(a))}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{rotuloLocal(localDe(a))}</span>
                  <span className="hidden w-28 shrink-0 truncate text-right text-muted-foreground sm:inline">
                    {a.categoria ?? '—'}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {idsSelecionados.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {idsSelecionados.slice(0, LIMITE_CHIPS).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => marcar([id], false)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs tabular-nums text-foreground hover:border-destructive/60"
              aria-label={`Desmarcar ${id}`}
            >
              {id}
              <X className="size-3 text-muted-foreground" />
            </button>
          ))}
          {idsSelecionados.length > LIMITE_CHIPS && (
            <span className="text-xs text-muted-foreground">+{idsSelecionados.length - LIMITE_CHIPS}</span>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={() => marcar(idsSelecionados, false)}>
            Limpar
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="sm:w-44">
          <MetricCard id="selecionados" label="Selecionados" value={String(idsSelecionados.length)} />
        </div>
        <ArrowRight className="mb-2.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            label="Novo local"
            value={novoLocal}
            onChange={(v) => {
              setNovoLocal(v);
              mov.editou();
            }}
            options={locais}
            placeholder="Manter"
            triggerClassName="w-full sm:w-48"
          />
          <FilterSelect
            label="Novo lote"
            value={novoLote}
            onChange={(v) => {
              setNovoLote(v);
              mov.editou();
            }}
            options={lotes}
            placeholder="Manter"
            triggerClassName="w-full sm:w-48"
          />
        </div>
      </div>

      {jaNoDestino > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {jaNoDestino === 1
            ? '1 marcado já está no destino e fica como está.'
            : `${jaNoDestino} marcados já estão no destino e ficam como estão.`}
        </p>
      )}

      <AcaoMovimentacao
        mov={mov}
        body={{ porAnimal: true, ids: idsAMover, local: novoLocal || undefined, lote: novoLote || undefined }}
        podeMover={idsAMover.length > 0}
        pergunta={
          <>
            Mudar {mudancas.length === 2 ? <>{mudancas[0]} e {mudancas[1]}</> : mudancas[0]} de{' '}
            <strong className="tabular-nums">{idsAMover.length}</strong> {idsAMover.length === 1 ? 'animal' : 'animais'}
            {idsAMover.length <= LIMITE_IDS_NA_PERGUNTA && <> ({idsAMover.join(', ')})</>}?
          </>
        }
        feito={(r) => (
          <>
            {r.movidos} {r.movidos === 1 ? 'animal movido' : 'animais movidos'} — {mudancas.length === 2 ? <>{mudancas[0]}, {mudancas[1]}</> : mudancas[0]}.
          </>
        )}
        motivoIgnorados="receberam baixa ou já estavam no destino quando a planilha foi relida."
        onNova={limpar}
      />
    </>
  );
}
