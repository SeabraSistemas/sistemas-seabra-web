'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterSelect } from './FilterSelect';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { formatNumber } from '@/lib/katmandu/format';
import { filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/katmandu/filters';
import { FAIXAS_CATEGORIA, categoriaLabel, type FaixaCategoria } from '@/lib/katmandu/categoria';
import type { AnimalRebanho } from '@/lib/katmandu/types';

type Estado = 'ideia' | 'confirmando' | 'enviando' | 'feito' | 'erro';

function sexoLabel(a: AnimalRebanho): string {
  return a.sexo === 'macho' ? 'Macho' : a.sexo === 'femea' ? 'Fêmea' : '—';
}

/**
 * Corrige em lote a categoria de animais lançados errado: filtra do mesmo
 * jeito que Rebanho/Movimentar e empurra a Data de nascimento pro primeiro
 * dia da faixa escolhida — Categoria e Idade recalculam sozinhas na
 * planilha (são fórmulas), então a categoria "muda" sem a gente escrevê-la
 * direto. Ver lib/katmandu/categoria.ts pro racional da fórmula.
 */
export function AlterarCategoriaView({ animais: todos }: { animais: AnimalRebanho[] }) {
  const router = useRouter();
  const animais = useMemo(() => todos.filter((a) => a.baixa == null), [todos]);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [sexo, setSexo] = useState('');
  const [lote, setLote] = useState('');
  const [local, setLocal] = useState('');
  const [faixa, setFaixa] = useState<FaixaCategoria | ''>('');
  const [verAnimais, setVerAnimais] = useState(false);
  const [estado, setEstado] = useState<Estado>('ideia');
  const [resultado, setResultado] = useState<{ alterados: number; ignorados: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const condicoes = useMemo((): Condicao<AnimalRebanho>[] => [
    { key: 'busca', test: (a) => !busca || a.idAnimal.toLowerCase().includes(busca.toLowerCase()) },
    { key: 'categoria', test: (a) => !categoria || a.categoria === categoria },
    { key: 'sexo', test: (a) => !sexo || sexoLabel(a) === sexo },
    { key: 'lote', test: (a) => !lote || a.lote === lote },
    { key: 'local', test: (a) => !local || a.local === local },
  ], [busca, categoria, sexo, lote, local]);

  const categorias = useMemo(() => opcoesExcluindo(animais, condicoes, 'categoria', (a) => a.categoria), [animais, condicoes]);
  const lotes = useMemo(() => opcoesExcluindo(animais, condicoes, 'lote', (a) => a.lote), [animais, condicoes]);
  const locais = useMemo(() => opcoesExcluindo(animais, condicoes, 'local', (a) => a.local), [animais, condicoes]);

  const filtrados = useMemo(() => filtrarPor(animais, condicoes), [animais, condicoes]);

  function trocarFiltro(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setEstado('ideia');
    };
  }

  function reiniciar() {
    setBusca('');
    setCategoria('');
    setSexo('');
    setLote('');
    setLocal('');
    setFaixa('');
    setVerAnimais(false);
    setEstado('ideia');
    setResultado(null);
    setErro(null);
  }

  async function confirmar() {
    if (!faixa) return;
    setEstado('enviando');
    setErro(null);
    try {
      const res = await fetch('/api/katmandu/alterar-categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faixa, ids: filtrados.map((a) => a.idAnimal) }),
      });
      const data = (await res.json()) as { ok: boolean; alterados?: number; ignorados?: number; erro?: string };
      if (!res.ok || !data.ok) {
        setErro(data.erro ?? 'Não foi possível alterar a categoria.');
        setEstado('erro');
        return;
      }
      setResultado({ alterados: data.alterados ?? 0, ignorados: data.ignorados ?? 0 });
      setEstado('feito');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEstado('erro');
    }
  }

  const faixaLabel = faixa ? FAIXAS_CATEGORIA.find((f) => f.valor === faixa)?.label : null;

  const colunas: DataTableColumn<AnimalRebanho>[] = [
    { key: 'id', header: 'N° manejo', cell: (a) => a.idAnimal, sortValue: (a) => a.idAnimal },
    { key: 'sexo', header: 'Sexo', cell: sexoLabel },
    { key: 'categoriaAtual', header: 'Categoria atual', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
    { key: 'idade', header: 'Idade (dias)', cell: (a) => formatNumber(a.idadeDias), sortValue: (a) => a.idadeDias },
    {
      key: 'categoriaNova',
      header: 'Categoria nova',
      cell: (a) => (faixa ? categoriaLabel(faixa, a.sexo) : '—'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Corrige em lote a categoria de animais lançados com idade errada: filtra os animais, escolhe a faixa certa e
          a Data de nascimento de cada um vira o primeiro dia dessa faixa — a categoria (macho/fêmea) recalcula
          sozinha a partir daí. Animais com baixa não são afetados.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">N° manejo</span>
            <Input
              value={busca}
              onChange={(e) => trocarFiltro(setBusca)(e.target.value)}
              placeholder="Buscar…"
              className="h-9 w-full sm:w-40"
            />
          </div>
          <FilterSelect label="Categoria atual" value={categoria} onChange={trocarFiltro(setCategoria)} options={categorias} />
          <FilterSelect label="Sexo" value={sexo} onChange={trocarFiltro(setSexo)} options={['Macho', 'Fêmea']} />
          <FilterSelect label="Lote" value={lote} onChange={trocarFiltro(setLote)} options={lotes} />
          <FilterSelect label="Local" value={local} onChange={trocarFiltro(setLocal)} options={locais} />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <FilterSelect
            label="Nova categoria"
            value={faixa}
            onChange={(v) => {
              setFaixa(v as FaixaCategoria | '');
              setEstado('ideia');
            }}
            options={FAIXAS_CATEGORIA.map((f) => f.valor)}
            labelDe={(v) => FAIXAS_CATEGORIA.find((f) => f.valor === v)?.label ?? v}
            placeholder="Selecione"
            triggerClassName="w-full sm:w-72"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <div className="sm:w-44">
            <MetricCard id="filtrados" label="No recorte" value={String(filtrados.length)} />
          </div>
        </div>

        {filtrados.length > 0 && (
          <div className="mt-4">
            <Button type="button" size="sm" variant="outline" onClick={() => setVerAnimais((v) => !v)}>
              {verAnimais ? 'Esconder animais' : `Ver os ${filtrados.length} animais`}
            </Button>
            {verAnimais && (
              <div className="mt-3">
                <DataTable columns={colunas} rows={filtrados} rowKey={(a) => a.idAnimal} />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {estado === 'ideia' && (
            <Button
              type="button"
              className="w-fit"
              disabled={!faixa || filtrados.length === 0}
              onClick={() => setEstado('confirmando')}
            >
              Alterar categoria
            </Button>
          )}

          {(estado === 'confirmando' || estado === 'enviando') && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
              <span>
                Alterar a categoria de <strong className="tabular-nums">{filtrados.length}</strong> animais pra{' '}
                <strong>{faixaLabel}</strong>? A data de nascimento de cada um vai mudar pra refletir isso.
              </span>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={estado === 'enviando'} onClick={confirmar}>
                  {estado === 'enviando' ? 'Alterando…' : 'Confirmar'}
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
                {resultado.alterados} animais tiveram a categoria alterada pra <strong>{faixaLabel}</strong>.
                {resultado.ignorados > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    {resultado.ignorados} ficaram de fora — receberam baixa na planilha depois que esta tela carregou.
                  </span>
                )}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={reiniciar}>
                Nova alteração
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
