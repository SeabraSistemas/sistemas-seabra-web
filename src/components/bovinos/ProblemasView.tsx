'use client';

import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SeveridadeBadge } from '@/components/bovinos/Severidade';
import { CATALOGO, ROTULO_SEVERIDADE, type GrupoRegra } from '@/lib/bovinos/catalogo';
import type { Correcao, Problema, RegraId, Severidade } from '@/lib/bovinos/tipos';

const GRUPOS: GrupoRegra[] = ['Estrutura', 'Fazenda', 'Pai', 'Mãe e parto', 'Reprodução'];
const SEVERIDADES: Severidade[] = ['corrigivel', 'manual', 'info'];

function descreverCorrecao(c: Correcao): string[] {
  switch (c.tipo) {
    case 'celulas':
      return c.set.map((s) => `${c.aba} L${c.linha} · ${s.col}: "${s.de || '(vazio)'}" → "${s.para || '(vazio)'}"`);
    case 'chave':
      return [
        ...c.recuperar.map((s) => `${c.aba} L${c.linha} · ${s.col}: recuperar "${s.para}"`),
        ...c.gerar.map((col) => `${c.aba} L${c.linha} · ${col}: chave nova (sorteada na prévia)`),
      ];
    case 'coluna-valor':
      return [`${c.aba} · ${c.col}: "${c.de}" → "${c.para}" em ${c.linhas.length} linha(s)`];
    case 'formula':
      return c.colunas.map((f) => `${c.aba} L${c.linha} · ${f.col}: copiar a fórmula da linha ${f.linhaDoadora}`);
    case 'excluir-linha':
      return [`${c.aba}: excluir a linha ${c.linha}`];
  }
}

export function ProblemasView({ problemas, nomeCliente, regraInicial }: { problemas: Problema[]; nomeCliente: string; regraInicial?: string }) {
  const [grupo, setGrupo] = useState('');
  const [regra, setRegra] = useState(regraInicial && regraInicial in CATALOGO ? regraInicial : '');
  const [severidade, setSeveridade] = useState('');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<Problema | null>(null);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return problemas.filter(
      (p) =>
        (!grupo || CATALOGO[p.regra].grupo === grupo) &&
        (!regra || p.regra === regra) &&
        (!severidade || p.severidade === severidade) &&
        (!q || p.animal.toLowerCase().includes(q) || p.resumo.toLowerCase().includes(q)),
    );
  }, [problemas, grupo, regra, severidade, busca]);

  // Opções de regra: só as que existem neste cliente (e no grupo escolhido).
  const regras = useMemo(
    () => [...new Set(problemas.filter((p) => !grupo || CATALOGO[p.regra].grupo === grupo).map((p) => p.regra))],
    [problemas, grupo],
  );

  const columns: DataTableColumn<Problema>[] = [
    { key: 'sev', header: 'Tipo', cell: (p) => <SeveridadeBadge severidade={p.severidade} />, sortValue: (p) => SEVERIDADES.indexOf(p.severidade) },
    { key: 'regra', header: 'Problema', cell: (p) => <span className="whitespace-nowrap">{CATALOGO[p.regra].titulo}</span>, sortValue: (p) => CATALOGO[p.regra].titulo },
    { key: 'animal', header: 'Animal', cell: (p) => <span className="font-mono text-xs">{p.animal || '—'}</span>, sortValue: (p) => p.animal },
    { key: 'onde', header: 'Onde', cell: (p) => <span className="whitespace-nowrap text-xs text-muted-foreground">{p.aba}{p.linha ? ` L${p.linha}` : ''}</span>, sortValue: (p) => p.linha ?? 0 },
    { key: 'resumo', header: 'Resumo', cell: (p) => <span className="text-sm">{p.resumo}</span> },
  ];

  const csv: CsvColumn<Problema>[] = [
    { key: 'tipo', header: 'Tipo', value: (p) => ROTULO_SEVERIDADE[p.severidade] },
    { key: 'problema', header: 'Problema', value: (p) => CATALOGO[p.regra].titulo },
    { key: 'animal', header: 'Animal', value: (p) => p.animal },
    { key: 'aba', header: 'Aba', value: (p) => p.aba },
    { key: 'linha', header: 'Linha', value: (p) => (p.linha ? String(p.linha) : '') },
    { key: 'resumo', header: 'Resumo', value: (p) => p.resumo },
    { key: 'atual', header: 'Atual', value: (p) => p.atual ?? '' },
    { key: 'sugerido', header: 'Sugerido', value: (p) => p.sugerido ?? '' },
    { key: 'prova', header: 'Prova', value: (p) => p.prova.join(' | ') },
    { key: 'bloqueios', header: 'Bloqueios', value: (p) => p.bloqueios.join(' | ') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect label="Grupo" value={grupo} onChange={(v) => { setGrupo(v); setRegra(''); }} options={GRUPOS} />
        <FilterSelect label="Problema" value={regra} onChange={setRegra} options={regras} labelDe={(v) => CATALOGO[v as RegraId]?.titulo ?? v} triggerClassName="w-full sm:w-56" />
        <FilterSelect label="Tipo" value={severidade} onChange={setSeveridade} options={SEVERIDADES} labelDe={(v) => ROTULO_SEVERIDADE[v as Severidade]} />
        <FilterBusca label="Animal ou texto" value={busca} onChange={setBusca} placeholder="Ex.: G24, TNT…" />
        <div className="ml-auto">
          <CsvExport columns={csv} rows={filtrados} requiredKeys={['problema', 'animal']} filename={`bovinos-${nomeCliente}`} />
        </div>
      </div>

      {regra && <p className="text-sm text-muted-foreground">{CATALOGO[regra as RegraId].descricao}</p>}
      <p className="text-xs text-muted-foreground">
        {filtrados.length} de {problemas.length} · clique numa linha para ver a prova
      </p>

      <DataTable columns={columns} rows={filtrados} rowKey={(p) => p.id} pageSize={50} onRowClick={setAberto} />

      <Sheet open={aberto !== null} onOpenChange={(o) => !o && setAberto(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {aberto && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SeveridadeBadge severidade={aberto.severidade} />
                  <span className="text-xs text-muted-foreground">{CATALOGO[aberto.regra].grupo}</span>
                </div>
                <SheetTitle>{CATALOGO[aberto.regra].titulo}</SheetTitle>
                <SheetDescription>{CATALOGO[aberto.regra].descricao}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6 text-sm">
                <p>{aberto.resumo}</p>
                {(aberto.atual !== undefined || aberto.sugerido !== undefined) && (
                  <p className="text-muted-foreground">
                    Hoje: <span className="text-foreground">{aberto.atual || '(vazio)'}</span>
                    {aberto.sugerido !== undefined && (
                      <>
                        {' '}→ sugerido: <span className="text-foreground">{aberto.sugerido || '(vazio)'}</span>
                      </>
                    )}
                  </p>
                )}
                {aberto.prova.length > 0 && (
                  <section>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prova</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {aberto.prova.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {aberto.bloqueios.length > 0 && (
                  <section>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-400">Por que não corrige sozinho</h3>
                    <ul className="list-disc space-y-1 pl-5 text-amber-200">
                      {aberto.bloqueios.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {aberto.correcao && (
                  <section>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">Correção proposta</h3>
                    <ul className="space-y-1 font-mono text-xs">
                      {descreverCorrecao(aberto.correcao).map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">O botão de corrigir (com prévia) chega na próxima fase.</p>
                  </section>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
