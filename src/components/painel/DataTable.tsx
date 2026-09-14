'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string | null;
  className?: string;
}

const PAGE_SIZE_PADRAO = 25;

/**
 * Tabela genérica com sort por coluna (click no header) e paginação simples
 * em memória. Cópia de src/components/katmandu/DataTable.tsx (Katmandu
 * congelado) em pasta neutra — ver o plano de /FI_FCG.
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
   * `rowKey` sai do dado, e o dado da planilha tem duplicata de verdade (o
   * mesmo ID cadastrado duas vezes). Chave repetida faz o React guardar só
   * uma das <tr> no mapa de reconciliação e nunca remover a outra — ao
   * filtrar até sobrar nada, a linha antiga ficava colada na tela junto com
   * o "Nenhum registro". O sufixo entra só na 2ª ocorrência em diante.
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
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === 'asc' ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum registro.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, i) => (
                <TableRow key={chaves[i]}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {pageAtual + 1} de {totalPages} · {sorted.length} registros
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={pageAtual === 0} onClick={() => setPage(pageAtual - 1)}>
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageAtual >= totalPages - 1}
              onClick={() => setPage(pageAtual + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
