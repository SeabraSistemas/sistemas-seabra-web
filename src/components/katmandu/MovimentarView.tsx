'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterSelect } from './FilterSelect';
import { FilterMultiSelect } from './FilterMultiSelect';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { DESTINO_LABEL, DESTINO_ORDEM, destinoOrdinal, opcoesDeOrigem } from '@/lib/katmandu/filters';
import { SEM_LOCAL, SEM_LOCAL_LABEL, SEM_LOTE, SEM_LOTE_LABEL, type AnimalRebanho } from '@/lib/katmandu/types';

type Estado = 'ideia' | 'confirmando' | 'enviando' | 'feito' | 'erro';
type Modo = 'local' | 'lote';

/** Sentinela só desta tela: marca explicitamente "os que não têm destino preenchido" (server recebe IDs, não filtros). */
const SEM_DESTINO = '__sem_destino__';

/**
 * Descreve o eixo principal da movimentação (local ou lote) e o eixo
 * secundário usado só pra refinar o recorte dentro dele — os dois papéis se
 * invertem conforme `modo`, mas a mecânica é a mesma dos dois lados.
 */
function config(modo: Modo) {
  return modo === 'local'
    ? {
        campo: 'local' as const,
        labelPrincipal: 'Local',
        labelSecundario: 'Lote',
        principalDe: (a: AnimalRebanho) => a.local,
        secundarioDe: (a: AnimalRebanho) => a.lote,
        sentinelaPrincipal: SEM_LOCAL,
        sentinelaPrincipalLabel: SEM_LOCAL_LABEL,
        sentinelaSecundaria: SEM_LOTE,
        sentinelaSecundariaLabel: SEM_LOTE_LABEL,
      }
    : {
        campo: 'lote' as const,
        labelPrincipal: 'Lote',
        labelSecundario: 'Local',
        principalDe: (a: AnimalRebanho) => a.lote,
        secundarioDe: (a: AnimalRebanho) => a.local,
        sentinelaPrincipal: SEM_LOTE,
        sentinelaPrincipalLabel: SEM_LOTE_LABEL,
        sentinelaSecundaria: SEM_LOCAL,
        sentinelaSecundariaLabel: SEM_LOCAL_LABEL,
      };
}

/**
 * Só oferece a sentinela "Sem X" quando existe pelo menos um valor real pra
 * contrastar: com a lista de opções vazia o filtro aparece desabilitado, que
 * é a leitura honesta de "não há o que filtrar aqui".
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
 * Movimentação por recorte: local (ou lote) de origem => lote/local => destino(s)
 * de desempenho, em cascata (cada filtro só oferece o que existe dentro do
 * anterior). "Por local" move o pasto/baia inteiro (ou uma fatia dele por
 * lote/destino); "Por lote" faz o mesmo trocando o eixo principal pro lote.
 *
 * Filtro vazio = "todos" (convenção dos outros filtros do dashboard), então
 * escolher só a origem reproduz o comportamento de mover tudo que está nela.
 */
export function MovimentarView({
  animais,
  locais,
  lotes: lotesDisponiveis,
}: {
  animais: AnimalRebanho[];
  locais: string[];
  lotes: string[];
}) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('local');
  const [origem, setOrigem] = useState('');
  const [secundarios, setSecundarios] = useState<string[]>([]);
  const [destinos, setDestinos] = useState<string[]>([]);
  const [para, setPara] = useState('');
  const [verAnimais, setVerAnimais] = useState(false);
  const [estado, setEstado] = useState<Estado>('ideia');
  const [resultado, setResultado] = useState<{ movidos: number; ignorados: number; logFalhou?: boolean } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const cfg = useMemo(() => config(modo), [modo]);
  const opcoesPrincipais = modo === 'local' ? locais : lotesDisponiveis;

  const ativos = useMemo(() => animais.filter((a) => a.baixa == null), [animais]);

  const contagemPrincipal = useMemo(
    () => contar(ativos.map((a) => cfg.principalDe(a) || cfg.sentinelaPrincipal)),
    [ativos, cfg],
  );

  const opcoesOrigem = useMemo(
    () => opcoesDeOrigem(opcoesPrincipais, contagemPrincipal, cfg.sentinelaPrincipal),
    [opcoesPrincipais, contagemPrincipal, cfg],
  );
  const opcoesPara = useMemo(() => opcoesPrincipais.filter((l) => l !== origem), [opcoesPrincipais, origem]);

  // Cascata: cada nível parte do conjunto já estreitado pelo nível acima.
  const naOrigem = useMemo(
    () => (origem ? ativos.filter((a) => (cfg.principalDe(a) || cfg.sentinelaPrincipal) === origem) : []),
    [ativos, origem, cfg],
  );

  const contagemSecundaria = useMemo(
    () => contar(naOrigem.map((a) => cfg.secundarioDe(a) ?? cfg.sentinelaSecundaria)),
    [naOrigem, cfg],
  );
  const opcoesSecundarias = useMemo(() => {
    const nomes = Object.keys(contagemSecundaria)
      .filter((l) => l !== cfg.sentinelaSecundaria)
      .sort();
    return comSentinela(nomes, cfg.sentinelaSecundaria, Boolean(contagemSecundaria[cfg.sentinelaSecundaria]));
  }, [contagemSecundaria, cfg]);

  const noSecundario = useMemo(
    () => naOrigem.filter((a) => secundarios.length === 0 || secundarios.includes(cfg.secundarioDe(a) ?? cfg.sentinelaSecundaria)),
    [naOrigem, secundarios, cfg],
  );

  const contagemDestino = useMemo(() => contar(noSecundario.map((a) => a.destino ?? SEM_DESTINO)), [noSecundario]);
  const opcoesDestino = useMemo(() => {
    const presentes = DESTINO_ORDEM.filter((d) => contagemDestino[d]);
    return comSentinela(presentes, SEM_DESTINO, Boolean(contagemDestino[SEM_DESTINO]));
  }, [contagemDestino]);

  const selecionados = useMemo(
    () => noSecundario.filter((a) => destinos.length === 0 || destinos.includes(a.destino ?? SEM_DESTINO)),
    [noSecundario, destinos],
  );

  function nomePrincipal(l: string): string {
    return l === cfg.sentinelaPrincipal ? cfg.sentinelaPrincipalLabel : l;
  }
  function nomeSecundario(l: string): string {
    return l === cfg.sentinelaSecundaria ? cfg.sentinelaSecundariaLabel : l;
  }
  function nomeDestino(d: string): string {
    return d === SEM_DESTINO ? 'Sem destino' : (DESTINO_LABEL[d as keyof typeof DESTINO_LABEL] ?? d);
  }

  /** "lotes A, B · destino Cabeceira" — só o que o usuário de fato restringiu. */
  const recorte = useMemo(() => {
    const partes: string[] = [];
    if (secundarios.length > 0) {
      const rotulo = secundarios.length === 1 ? cfg.labelSecundario.toLowerCase() : `${cfg.labelSecundario.toLowerCase()}s`;
      const nomes = secundarios.map((s) => (s === cfg.sentinelaSecundaria ? cfg.sentinelaSecundariaLabel : s));
      partes.push(`${rotulo} ${nomes.join(', ')}`);
    }
    if (destinos.length > 0) {
      partes.push(`${destinos.length === 1 ? 'destino' : 'destinos'} ${destinos.map(nomeDestino).join(', ')}`);
    }
    return partes.join(' · ');
  }, [secundarios, destinos, cfg]);

  function trocarModo(v: string) {
    setModo(v === 'lote' ? 'lote' : 'local');
    setOrigem('');
    setSecundarios([]);
    setDestinos([]);
    setPara('');
    setVerAnimais(false);
    setEstado('ideia');
    setResultado(null);
    setErro(null);
  }

  function trocarOrigem(v: string) {
    setOrigem(v);
    setSecundarios([]);
    setDestinos([]);
    if (v === para) setPara('');
    setEstado('ideia');
  }

  function trocarSecundarios(v: string[]) {
    setSecundarios(v);
    // Um destino escolhido antes pode não existir no novo recorte — mantê-lo
    // marcado deixaria a seleção vazia sem o usuário entender por quê.
    const permitidos = new Set<string>(
      naOrigem
        .filter((a) => v.length === 0 || v.includes(cfg.secundarioDe(a) ?? cfg.sentinelaSecundaria))
        .map((a) => a.destino ?? SEM_DESTINO),
    );
    setDestinos((atual) => atual.filter((d) => permitidos.has(d)));
    setEstado('ideia');
  }

  function reiniciar() {
    setOrigem('');
    setSecundarios([]);
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
        body: JSON.stringify({ campo: cfg.campo, origem, destino: para, ids: selecionados.map((a) => a.idAnimal) }),
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
    {
      key: 'secundario',
      header: cfg.labelSecundario,
      cell: (a) => cfg.secundarioDe(a) ?? '—',
      sortValue: (a) => cfg.secundarioDe(a),
    },
    {
      key: 'destino',
      header: 'Destino',
      cell: (a) => (a.destino ? DESTINO_LABEL[a.destino] : '—'),
      sortValue: (a) => destinoOrdinal(a.destino),
    },
    { key: 'categoria', header: 'Categoria', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <Tabs value={modo} onValueChange={trocarModo} className="mb-4">
          <TabsList>
            <TabsTrigger value="local">Por local</TabsTrigger>
            <TabsTrigger value="lote">Por lote</TabsTrigger>
          </TabsList>
        </Tabs>

        <p className="mb-4 text-sm text-muted-foreground">
          Move os animais ativos de um {cfg.labelPrincipal.toLowerCase()} pra outro. Sem marcar{' '}
          {cfg.labelSecundario.toLowerCase()} ou destino, vai o {cfg.labelPrincipal.toLowerCase()} inteiro; marcando,
          vão só os animais do recorte. Animais com baixa não são afetados.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            label="De"
            value={origem}
            onChange={trocarOrigem}
            options={opcoesOrigem}
            labelDe={(l) => `${nomePrincipal(l)} (${contagemPrincipal[l] ?? 0})`}
            placeholder="Selecione"
            triggerClassName="w-full sm:w-56"
          />
        </div>

        {!origem && (
          <p className="mt-3 text-sm text-muted-foreground">Selecione um {cfg.labelPrincipal} pra continuar.</p>
        )}

        {origem && (
          <>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <FilterMultiSelect
                label={cfg.labelSecundario}
                values={secundarios}
                onChange={trocarSecundarios}
                options={opcoesSecundarias}
                labelDe={(l) => `${nomeSecundario(l)} (${contagemSecundaria[l] ?? 0})`}
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
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div className="sm:w-44">
                <MetricCard id="selecionados" label="Selecionados" value={String(selecionados.length)} />
              </div>
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
                triggerClassName="w-full sm:w-56"
              />
            </div>

            {selecionados.length > 0 && (
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
          </>
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
                <strong>{nomePrincipal(origem)}</strong>
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
                {resultado.movidos} animais movidos de <strong>{nomePrincipal(origem)}</strong> pra <strong>{para}</strong>.
                {resultado.ignorados > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    {resultado.ignorados} ficaram de fora — mudaram de {cfg.labelPrincipal.toLowerCase()} ou receberam
                    baixa na planilha depois que esta tela carregou.
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
