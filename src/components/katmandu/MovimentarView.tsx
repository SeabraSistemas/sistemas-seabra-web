'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterSelect } from './FilterSelect';
import { FilterMultiSelect } from './FilterMultiSelect';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { AcaoMovimentacao, useMovimentacao } from './MovimentarAcao';
import { MovimentarAnimais } from './MovimentarAnimais';
import { DESTINO_LABEL, DESTINO_ORDEM, contar, destinoOrdinal, opcoesDeOrigem } from '@/lib/katmandu/filters';
import { SEM_LOCAL, SEM_LOCAL_LABEL, SEM_LOTE, SEM_LOTE_LABEL, type AnimalRebanho } from '@/lib/katmandu/types';

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

/**
 * Três jeitos de movimentar: por local e por lote levam tudo de uma origem
 * (ou uma fatia dela), por animal é marcação um a um. Trocar de aba remonta
 * o modo (`key`), então nenhuma seleção vaza de um pro outro.
 */
export function MovimentarView({
  animais,
  locais,
  lotes,
}: {
  animais: AnimalRebanho[];
  locais: string[];
  lotes: string[];
}) {
  const [modo, setModo] = useState<Modo | 'animal'>('local');

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <Tabs
          value={modo}
          onValueChange={(v) => setModo(v === 'lote' || v === 'animal' ? v : 'local')}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="local">Por local</TabsTrigger>
            <TabsTrigger value="lote">Por lote</TabsTrigger>
            <TabsTrigger value="animal">Por animal</TabsTrigger>
          </TabsList>
        </Tabs>

        {modo === 'animal' ? (
          <MovimentarAnimais animais={animais} locais={locais} lotes={lotes} />
        ) : (
          <MovimentarRecorte
            key={modo}
            modo={modo}
            animais={animais}
            opcoesPrincipais={modo === 'local' ? locais : lotes}
          />
        )}
      </div>
    </div>
  );
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
function MovimentarRecorte({
  modo,
  animais,
  opcoesPrincipais,
}: {
  modo: Modo;
  animais: AnimalRebanho[];
  /** Cadastro do eixo principal (aba local ou Lotes) — o "Para" só oferece daqui. */
  opcoesPrincipais: string[];
}) {
  const mov = useMovimentacao();
  const [origem, setOrigem] = useState('');
  const [secundarios, setSecundarios] = useState<string[]>([]);
  const [destinos, setDestinos] = useState<string[]>([]);
  const [para, setPara] = useState('');
  const [verAnimais, setVerAnimais] = useState(false);

  const cfg = useMemo(() => config(modo), [modo]);

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

  function trocarOrigem(v: string) {
    setOrigem(v);
    setSecundarios([]);
    setDestinos([]);
    if (v === para) setPara('');
    mov.editou();
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
    mov.editou();
  }

  function reiniciar() {
    setOrigem('');
    setSecundarios([]);
    setDestinos([]);
    setPara('');
    setVerAnimais(false);
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
    <>
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
                mov.editou();
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
                mov.editou();
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

      <AcaoMovimentacao
        mov={mov}
        body={{ campo: cfg.campo, origem, destino: para, ids: selecionados.map((a) => a.idAnimal) }}
        podeMover={Boolean(origem && para && selecionados.length > 0)}
        pergunta={
          <>
            Mover <strong className="tabular-nums">{selecionados.length}</strong> animais ativos de{' '}
            <strong>{nomePrincipal(origem)}</strong>
            {recorte && <> ({recorte})</>} pra <strong>{para}</strong>?
          </>
        }
        feito={(r) => (
          <>
            {r.movidos} animais movidos de <strong>{nomePrincipal(origem)}</strong> pra <strong>{para}</strong>.
          </>
        )}
        motivoIgnorados={`mudaram de ${cfg.labelPrincipal.toLowerCase()} ou receberam baixa na planilha depois que esta tela carregou.`}
        onNova={reiniciar}
      />
    </>
  );
}
