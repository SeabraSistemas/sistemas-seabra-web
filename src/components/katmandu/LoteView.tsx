'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { FilterSelect } from './FilterSelect';
import { DataTable, type DataTableColumn } from './DataTable';
import { EvolucaoChart } from './EvolucaoChart';
import { SiglasInfo } from './SiglasInfo';
import { CsvExport, type CsvColumn } from './CsvExport';
import {
  METRICA_LABEL,
  METRICA_LABEL_CURTO,
  mediaNaAncora,
  montarCoorte,
  pesagensDoLote,
  serieEvolucao,
  type Metrica,
} from '@/lib/katmandu/coorte';
import { formatNumber } from '@/lib/katmandu/format';
import type { PesagemRegistro } from '@/lib/katmandu/types';

const METRICAS: Metrica[] = ['peso', 'gmd', 'pdi', 'gpdi'];

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>{children}</p>
    </div>
  );
}

export function LoteView({ registros }: { registros: PesagemRegistro[] }) {
  const lotes = useMemo(
    () => Array.from(new Set(registros.map((r) => r.lote).filter((l): l is string => l != null))).sort(),
    [registros],
  );

  const [lote, setLote] = useState(() => lotes[0] ?? '');
  const [metrica, setMetrica] = useState<Metrica>('peso');

  const pesagens = useMemo(() => (lote ? pesagensDoLote(registros, lote) : []), [registros, lote]);

  // Datas da mais recente pra mais antiga (é a ordem que o usuário espera no seletor).
  const datas = useMemo(() => pesagens.map((p) => p.data).reverse(), [pesagens]);
  const [dataRef, setDataRef] = useState('');
  const dataAtual = dataRef && datas.includes(dataRef) ? dataRef : (datas[0] ?? '');

  const coorte = useMemo(
    () => (dataAtual ? montarCoorte(pesagens, dataAtual) : null),
    [pesagens, dataAtual],
  );
  const serie = useMemo(() => (coorte ? serieEvolucao(coorte, metrica) : []), [coorte, metrica]);

  const cards = useMemo(() => {
    if (!coorte) return [];
    return METRICAS.map((m) => ({ m, valor: mediaNaAncora(coorte, m) }))
      .filter((x): x is { m: Metrica; valor: number } => x.valor != null)
      .map(({ m, valor }) => ({
        id: m,
        label: `Média · ${METRICA_LABEL_CURTO[m]}`,
        value: formatNumber(valor),
      }));
  }, [coorte]);

  // Um registro por animal da âncora, com o valor em cada data da coorte.
  const animaisDaCoorte = useMemo(() => {
    if (!coorte) return [];
    return Array.from(coorte.ancora).sort().map((id) => {
      const porData: Record<string, number | null> = {};
      for (const p of coorte.pesagens) {
        const reg = p.registros.find((r) => r.idAnimal === id);
        porData[p.data] = reg?.pesoKg ?? null;
      }
      return { id, porData };
    });
  }, [coorte]);

  type LinhaAnimal = (typeof animaisDaCoorte)[number];

  const colunasAnimais: DataTableColumn<LinhaAnimal>[] = useMemo(() => {
    if (!coorte) return [];
    return [
      { key: 'id', header: 'N° manejo', cell: (a) => a.id, sortValue: (a) => a.id },
      ...coorte.pesagens.map((p) => ({
        key: p.data,
        header: `${p.data.slice(0, 5)} (kg)`,
        cell: (a: LinhaAnimal) => formatNumber(a.porData[p.data]),
        sortValue: (a: LinhaAnimal) => a.porData[p.data],
      })),
    ];
  }, [coorte]);

  const csvAnimais: CsvColumn<LinhaAnimal>[] = useMemo(() => {
    if (!coorte) return [];
    return [
      { key: 'id', header: 'N° manejo', value: (a) => a.id },
      ...coorte.pesagens.map((p) => ({
        key: p.data,
        header: `${p.data} (kg)`,
        value: (a: LinhaAnimal) => formatNumber(a.porData[p.data]),
      })),
    ];
  }, [coorte]);

  const [listaAberta, setListaAberta] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
        <FilterSelect label="Lote" value={lote} onChange={setLote} options={lotes} placeholder="Selecione" />
        <FilterSelect
          label="Data de referência"
          value={dataAtual}
          onChange={setDataRef}
          options={datas}
          placeholder="Mais recente"
        />
        <FilterSelect
          label="Métrica"
          value={metrica}
          onChange={(v) => setMetrica((v || 'peso') as Metrica)}
          options={METRICAS}
          labelDe={(m) => METRICA_LABEL[m as Metrica]}
          placeholder="Peso médio (kg)"
        />
      </div>

      {!lote && <Aviso>Selecione um lote para ver a evolução do grupo.</Aviso>}

      {lote && pesagens.length === 0 && <Aviso>Nenhuma pesagem registrada para o lote {lote}.</Aviso>}

      {lote && pesagens.length === 1 && (
        <Aviso>
          O lote {lote} tem apenas uma pesagem ({pesagens[0].data}). O gráfico de evolução aparece a partir da
          segunda pesagem deste grupo.
        </Aviso>
      )}

      {/* Coorte de uma pesagem só apesar de o lote ter histórico: o grupo desta data
          de referência não aparece nas anteriores (foi remanejado). Sem esta faixa a
          tela ficaria em branco, sem explicar por quê. */}
      {lote && pesagens.length > 1 && coorte?.pesagens.length === 1 && (
        <Aviso>
          Este grupo aparece só na pesagem de {dataAtual}
          {coorte.corte
            ? ` — em ${coorte.corte.data} apenas ${Math.round(coorte.corte.sobreposicao * 100)}% destes animais estavam no lote ${lote}.`
            : '.'}{' '}
          Não há histórico comparável para montar a evolução. Escolha outra data de referência.
        </Aviso>
      )}

      {coorte && coorte.pesagens.length > 1 && (
        <>
          {coorte.corte && (
            <Aviso>
              Comparativo parado em {coorte.corte.data} — só {Math.round(coorte.corte.sobreposicao * 100)}% dos
              animais do grupo atual estavam nessa pesagem. Antes dessa data o lote {lote} era outro grupo.
            </Aviso>
          )}

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground">
                {METRICA_LABEL[metrica]} · {lote}
              </h2>
              <span className="text-xs text-muted-foreground">
                {coorte.ancora.size} animais acompanhados em {coorte.pesagens.length} pesagens
              </span>
            </div>
            <EvolucaoChart dados={serie} label={METRICA_LABEL[metrica]} />
          </div>

          {cards.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {cards.map((c) => (
                <MetricCard key={c.id} {...c} />
              ))}
            </div>
          )}

          <SiglasInfo />

          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setListaAberta((v) => !v)}
                aria-expanded={listaAberta}
                className="flex flex-1 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <span>Animais que compõem estas pesagens ({coorte.ancora.size})</span>
                <ChevronDown className={`ml-auto size-4 transition-transform ${listaAberta ? 'rotate-180' : ''}`} />
              </button>
              {listaAberta && (
                <CsvExport
                  columns={csvAnimais}
                  rows={animaisDaCoorte}
                  requiredKeys={['id']}
                  filename={`lote-${lote}`}
                />
              )}
            </div>
            {listaAberta && (
              <div className="border-t border-border p-4">
                <DataTable columns={colunasAnimais} rows={animaisDaCoorte} rowKey={(a) => a.id} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
