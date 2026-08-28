'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface CsvColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string;
}

function escapeCsv(value: string): string {
  return /[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Exportação CSV com seleção de colunas. Delimitador ";" (não ",") porque o
 * Excel em pt-BR usa vírgula como separador decimal — CSV com "," quebra a
 * abertura automática. BOM UTF-8 na frente pelo mesmo motivo (acentos).
 */
export function CsvExport<T>({
  columns,
  rows,
  requiredKeys,
  filename,
}: {
  columns: CsvColumn<T>[];
  rows: T[];
  requiredKeys: string[];
  filename: string;
}) {
  const [open, setOpen] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => new Set(columns.map((c) => c.key)));

  function toggle(key: string) {
    if (requiredKeys.includes(key)) return;
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function exportar() {
    const cols = columns.filter((c) => selecionadas.has(c.key));
    const linhas = [
      cols.map((c) => escapeCsv(c.header)).join(';'),
      ...rows.map((row) => cols.map((c) => escapeCsv(c.value(row))).join(';')),
    ];
    const csv = '﻿' + linhas.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Download className="size-3.5" />
        Exportar CSV
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Exportar CSV</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 overflow-y-auto px-4">
            {columns.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selecionadas.has(c.key)}
                  disabled={requiredKeys.includes(c.key)}
                  onChange={() => toggle(c.key)}
                  className="size-4 rounded border-input accent-primary disabled:opacity-60"
                />
                {c.header}
                {requiredKeys.includes(c.key) && <span className="text-xs text-muted-foreground">(obrigatório)</span>}
              </label>
            ))}
          </div>
          <SheetFooter>
            <Button onClick={exportar} disabled={selecionadas.size === 0}>
              Baixar {rows.length} registros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
