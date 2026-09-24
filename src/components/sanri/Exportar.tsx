'use client';

import { gerarXlsx, XLSX_CONTENT_TYPE } from '@/lib/painel/xlsx';
import { PainelBotao } from './Controles';

export interface CsvColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string;
}

function escapeCsv(value: string): string {
  return /[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Baixa a tabela em CSV ou Excel, com todas as colunas. Delimitador ";" (não
 * ",") porque o Excel em pt-BR usa vírgula como decimal; BOM UTF-8 na frente
 * pelo mesmo motivo (acentos). Sem a escolha de colunas do painel da Seabra:
 * esta tabela tem 9 colunas e todas interessam.
 */
export function Exportar<T>({ columns, rows, filename }: { columns: CsvColumn<T>[]; rows: T[]; filename: string }) {
  function baixar(blob: Blob, extensao: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extensao}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarCsv() {
    const linhas = [
      columns.map((c) => escapeCsv(c.header)).join(';'),
      ...rows.map((row) => columns.map((c) => escapeCsv(c.value(row))).join(';')),
    ];
    baixar(new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8;' }), 'csv');
  }

  function exportarExcel() {
    const bytes = gerarXlsx({
      cabecalho: columns.map((c) => c.header),
      linhas: rows.map((row) => columns.map((c) => c.value(row))),
      nomeAba: filename,
    });
    baixar(new Blob([new Uint8Array(bytes)], { type: XLSX_CONTENT_TYPE }), 'xlsx');
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-2">Baixar</span>
      <PainelBotao variante="pequeno" onClick={exportarCsv} disabled={rows.length === 0}>
        CSV
      </PainelBotao>
      <PainelBotao variante="pequeno" onClick={exportarExcel} disabled={rows.length === 0}>
        Excel
      </PainelBotao>
    </div>
  );
}
