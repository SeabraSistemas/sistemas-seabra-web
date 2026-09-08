'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSelect } from './FilterSelect';
import { FilterMultiSelect } from './FilterMultiSelect';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { DESTINO_LABEL, DESTINO_ORDEM } from '@/lib/katmandu/filters';
import { SEM_LOCAL, SEM_LOCAL_LABEL, type AnimalRebanho } from '@/lib/katmandu/types';

type Estado = 'ideia' | 'confirmando' | 'enviando' | 'feito' | 'erro';

/**
 * Sentinelas só desta tela (o servidor recebe IDs, não filtros): permitem
 * marcar explicitamente "os que não têm lote/destino preenchido", que de
 * outro modo só entrariam pela ausência de filtro. Mesmo papel do SEM_LOCAL,
 * mas sem precisar cruzar a fronteira cliente/servidor.
 */
const SEM_LOTE = '__sem_lote__';
const SEM_DESTINO = '__sem_destino__';

/**
 * Só oferece a sentinela "Sem lote"/"Sem destino" quando existe pelo menos um
 * valor real pra contrastar: hoje a coluna Destino está 100% vazia na
 * planilha, e um filtro com a única opção "Sem destino" seria um clique que
 * não recorta nada (com a lista vazia o filtro aparece desabilitado, que é a
 * leitura honesta de "não há o que filtrar aqui").
 */
function comSentinela(reais: string[], sentinela: string, temVazios: boolean): string[] {
  return reais.length > 0 && temVazios ? [...reais, sentinela] : reais;
}

function contar(valores: string[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const v of valores) mapa[v] = (mapa[v] ?? 0) + 1;
  return mapa;
}

/**
 * Movimentação por recorte: local de origem => lote(s) => destino(s), em
 * cascata (cada filtro só oferece o que existe dentro do anterior). Um mesmo
 * pasto costuma misturar lotes e destinos diferentes, e mover o pasto inteiro
 * junto era justamente o que não dava pra fazer antes.
 *
 * Filtro vazio = "todos" (convenção dos outros filtros do dashboard), então
 * escolher só o local reproduz o comportamento antigo de mover tudo.
 */
export function MovimentarView({ animais, locais }: { animais: AnimalRebanho[]; locais: string[] }) {
  const router = useRouter();
  const [origem, setOrigem] = useState('');
  const [lotes, setLotes] = useState<string[]>([]);
  const [destinos, setDestinos] = useState<string[]>([]);
  const [para, setPara] = useState('');
  const [verAnimais, setVerAnimais] = useState(false);
  const [estado, setEstado] = useState<Estado>('ideia');
  const [resultado, setResultado] = useState<{ movidos: number; ignorados: number; logFalhou?: boolean } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const ativos = useMemo(() => animais.filter((a) => a.baixa == null), [animais]);

  const contagemLocal = useMemo(() => contar(ativos.map((a) => a.local || SEM_LOCAL)), [ativos]);

  const opcoesOrigem = useMemo(() => {
    const comAnimais = locais.filter((l) => (contagemLocal[l] ?? 0) > 0);
    return (contagemLocal[SEM_LOCAL] ?? 0) > 0 ? [...comAnimais, SEM_LOCAL] : comAnimais;
  }, [locais, contagemLocal]);
  const opcoesPara = useMemo(() => locais.filter((l) => l !== origem), [locais, origem]);

  // Cascata: cada nível parte do conjunto já estreitado pelo nível acima.
  const naOrigem = useMemo(
    () => (origem ? ativos.filter((a) => (a.local || SEM_LOCAL) === origem) : []),
    [ativos, origem],
  );

  const contagemLote = useMemo(() => contar(naOrigem.map((a) => a.lote ?? SEM_LOTE)), [naOrigem]);
  const opcoesLote = useMemo(() => {
    const nomes = Object.keys(contagemLote)
      .filter((l) => l !== SEM_LOTE)
      .sort();
    return comSentinela(nomes, SEM_LOTE, Boolean(contagemLote[SEM_LOTE]));
  }, [contagemLote]);

  const noLote = useMemo(
    () => naOrigem.filter((a) => lotes.length === 0 || lotes.includes(a.lote ?? SEM_LOTE)),
    [naOrigem, lotes],
  );

  const contagemDestino = useMemo(() => contar(noLote.map((a) => a.destino ?? SEM_DESTINO)), [noLote]);
  const opcoesDestino = useMemo(() => {
    const presentes = DESTINO_ORDEM.filter((d) => contagemDestino[d]);
    return comSentinela(presentes, SEM_DESTINO, Boolean(contagemDestino[SEM_DESTINO]));
  }, [contagemDestino]);

  const selecionados = useMemo(
    () => noLote.filter((a) => destinos.length === 0 || destinos.includes(a.destino ?? SEM_DESTINO)),
    [noLote, destinos],
  );

  function nomeLocal(l: string): string {
    return l === SEM_LOCAL ? SEM_LOCAL_LABEL : l;
  }
  function nomeLote(l: string): string {
    return l === SEM_LOTE ? 'Sem lote' : l;
  }
  function nomeDestino(d: string): string {
    return d === SEM_DESTINO ? 'Sem destino' : (DESTINO_LABEL[d as keyof typeof DESTINO_LABEL] ?? d);
  }

  /** "lotes A, B · destino Melhor" — só o que o usuário de fato restringiu. */
  const recorte = useMemo(() => {
    const partes: string[] = [];
    if (lotes.length > 0) partes.push(`${lotes.length === 1 ? 'lote' : 'lotes'} ${lotes.map(nomeLote).join(', ')}`);
    if (destinos.length > 0) {
      partes.push(`${destinos.length === 1 ? 'destino' : 'destinos'} ${destinos.map(nomeDestino).join(', ')}`);
    }
    return partes.join(' · ');
  }, [lotes, destinos]);

  function trocarOrigem(v: string) {
    setOrigem(v);
    setLotes([]);
    setDestinos([]);
    if (v === para) setPara('');
    setEstado('ideia');
  }

  function trocarLotes(v: string[]) {
    setLotes(v);
    // Um destino escolhido antes pode não existir no novo recorte de lotes —
    // mantê-lo marcado deixaria a seleção vazia sem o usuário entender por quê.
    const permitidos = new Set<string>(
      naOrigem.filter((a) => v.length === 0 || v.includes(a.lote ?? SEM_LOTE)).map((a) => a.destino ?? SEM_DESTINO),
    );
    setDestinos((atual) => atual.filter((d) => permitidos.has(d)));
    setEstado('ideia');
  }

  function reiniciar() {
    setOrigem('');
    setLotes([]);
    setDestinos([]);
    setPara('');
    setVerAnimais(false);
    setEstado('ideia');
    setResultado(null);
    setErro(null);
  }

  async function confirmar() {
    setEstado('enviando');
    setErro(null);
    try {
      const res = await fetch('/api/katmandu/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem, destino: para, ids: selecionados.map((a) => a.idAnimal) }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        movidos?: number;
        ignorados?: number;
        logFalhou?: boolean;
        erro?: string;
      };
      if (!res.ok || !data.ok) {
        setErro(data.erro ?? 'Não foi possível mover os animais.');
        setEstado('erro');
        return;
      }
      setResultado({ movidos: data.movidos ?? 0, ignorados: data.ignorados ?? 0, logFalhou: data.logFalhou });
      setEstado('feito');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEstado('erro');
    }
  }

  const colunas: DataTableColumn<AnimalRebanho>[] = [
    { key: 'id', header: 'N° manejo', cell: (a) => a.idAnimal, sortValue: (a) => a.idAnimal },
    { key: 'lote', header: 'Lote', cell: (a) => a.lote ?? '—', sortValue: (a) => a.lote },
    {
      key: 'destino',
      header: 'Destino',
      cell: (a) => (a.destino ? DESTINO_LABEL[a.destino] : '—'),
      sortValue: (a) => a.destino,
    },
    { key: 'categoria', header: 'Categoria', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Move os animais ativos de um local pra outro. Sem marcar lote ou destino, vai o local inteiro; marcando, vão
          só os animais do recorte. Animais com baixa não são afetados.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            label="De"
            value={origem}
            onChange={trocarOrigem}
            options={opcoesOrigem}
            labelDe={(l) => `${nomeLocal(l)} (${contagemLocal[l] ?? 0})`}
            placeholder="Selecione"
            triggerClassName="w-full sm:w-56"
          />
          <FilterMultiSelect
            label="Lote"
            values={lotes}
            onChange={trocarLotes}
            options={opcoesLote}
            labelDe={(l) => `${nomeLote(l)} (${contagemLote[l] ?? 0})`}
            triggerClassName="w-full sm:w-44"
          />
          <FilterMultiSelect
            label="Destino"
            values={destinos}
            onChange={(v) => {
              setDestinos(v);
              setEstado('ideia');
            }}
            options={opcoesDestino}
            labelDe={(d) => `${nomeDestino(d)} (${contagemDestino[d] ?? 0})`}
            triggerClassName="w-full sm:w-44"
          />
          <ArrowRight className="mb-2.5 size-4 shrink-0 text-muted-foreground" />
          <FilterSelect
            label="Para"
            value={para}
            onChange={(v) => {
              setPara(v);
              setEstado('ideia');
            }}
            options={opcoesPara}
            placeholder="Selecione"
          />
        </div>

        {origem && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="sm:w-44">
              <MetricCard id="ativos" label={`Ativos em ${nomeLocal(origem)}`} value={String(naOrigem.length)} />
            </div>
            <div className="sm:w-44">
              <MetricCard id="selecionados" label="Vão mover" value={String(selecionados.length)} />
            </div>
          </div>
        )}

        {origem && selecionados.length > 0 && (
          <div className="mt-4">
            <Button type="button" size="sm" variant="outline" onClick={() => setVerAnimais((v) => !v)}>
              {verAnimais ? 'Esconder animais' : `Ver os ${selecionados.length} animais`}
            </Button>
            {verAnimais && (
              <div className="mt-3">
                <DataTable columns={colunas} rows={selecionados} rowKey={(a) => a.idAnimal} />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {estado === 'ideia' && (
            <Button
              type="button"
              className="w-fit"
              disabled={!origem || !para || selecionados.length === 0}
              onClick={() => setEstado('confirmando')}
            >
              Movimentar
            </Button>
          )}

          {(estado === 'confirmando' || estado === 'enviando') && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
              <span>
                Mover <strong className="tabular-nums">{selecionados.length}</strong> animais ativos de{' '}
                <strong>{nomeLocal(origem)}</strong>
                {recorte && <> ({recorte})</>} pra <strong>{para}</strong>?
              </span>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={estado === 'enviando'} onClick={confirmar}>
                  {estado === 'enviando' ? 'Movimentando…' : 'Confirmar'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={estado === 'enviando'}
                  onClick={() => setEstado('ideia')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {estado === 'feito' && resultado && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
              <span>
                {resultado.movidos} animais movidos de <strong>{nomeLocal(origem)}</strong> pra <strong>{para}</strong>.
                {resultado.ignorados > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    {resultado.ignorados} ficaram de fora — mudaram de local ou receberam baixa na planilha depois que
                    esta tela carregou.
                  </span>
                )}
                {resultado.logFalhou && (
                  <span className="ml-1 text-destructive">
                    A movimentação valeu, mas o registro em &quot;movimentacao&quot; falhou — confira depois.
                  </span>
                )}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={reiniciar}>
                Nova movimentação
              </Button>
            </div>
          )}

          {estado === 'erro' && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <span>{erro}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setEstado('ideia')}>
                Tentar de novo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
