'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { PainelBotao } from './Controles';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string | null;
  className?: string;
}

const PAGE_SIZE_PADRAO = 25;

/**
 * Tabela com sort por coluna (clique no cabeçalho) e paginação em memória.
 * Mesma lógica de sistemas-seabra-web/src/components/painel/DataTable.tsx,
 * em HTML puro (sem shadcn) e sem biblioteca de ícones — a seta de ordem é
 * caractere, não glifo.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = PAGE_SIZE_PADRAO,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return 0;
    });
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageAtual = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(pageAtual * pageSize, pageAtual * pageSize + pageSize);

  /**
   * `rowKey` sai do dado, e a planilha pode ter id repetido. Chave repetida
   * faz o React deixar uma <tr> antiga colada na tela — o sufixo entra só na
   * 2ª ocorrência em diante.
   */
  const chaves = useMemo(() => {
    const contagem = new Map<string, number>();
    return pageRows.map((row) => {
      const base = rowKey(row);
      const n = contagem.get(base) ?? 0;
      contagem.set(base, n + 1);
      return n === 0 ? base : `${base}#${n}`;
    });
  }, [pageRows, rowKey]);

  function toggleSort(col: DataTableColumn<T>) {
    if (!col.sortValue) return;
    setPage(0);
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-card border border-rule bg-paper">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-paper-1">
            <tr>
              {columns.map((col) => {
                const ativo = sort?.key === col.key ? sort.dir : null;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ativo === 'asc' ? 'ascending' : ativo === 'desc' ? 'descending' : undefined}
                    className={cn('whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-ink-2', col.className)}
                  >
                    {col.sortValue ? (
                      <button type="button" onClick={() => toggleSort(col)} className="inline-flex items-center gap-1 hover:text-ink">
                        {col.header}
                        <span aria-hidden className={ativo ? 'text-ink' : 'opacity-0'}>
                          {ativo === 'desc' ? '↓' : '↑'}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-2">
                  Nenhum registro.
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={chaves[i]} className="border-t border-rule">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('whitespace-nowrap px-3 py-2.5 tabular-nums', col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-2">
          <span>
            Página {pageAtual + 1} de {totalPages} · {sorted.length} registros
          </span>
          <div className="flex gap-2">
            <PainelBotao variante="pequeno" disabled={pageAtual === 0} onClick={() => setPage(pageAtual - 1)}>
              Anterior
            </PainelBotao>
            <PainelBotao variante="pequeno" disabled={pageAtual >= totalPages - 1} onClick={() => setPage(pageAtual + 1)}>
              Próxima
            </PainelBotao>
          </div>
        </div>
      )}
    </div>
  );
}
