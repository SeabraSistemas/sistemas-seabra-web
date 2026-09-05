'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * A única peça interativa do dossiê — e ela some no papel (`.sem-impressao`).
 *
 * POR QUE `window.print()` E NÃO UM ARQUIVO GERADO NO SERVIDOR: é o navegador
 * que já sabe paginar HTML com fidelidade tipográfica, e ele usa as MESMAS
 * fontes e cores da página. Um gerador server-side (Chromium headless) faria a
 * mesma coisa por dentro, custando uma dependência pesada na função serverless —
 * e ele entra depois, se isto virar rotina, apontando para esta mesma URL.
 *
 * O aviso sobre "Gráficos de fundo" não é detalhe: sem essa opção marcada, o
 * Chrome imprime as barras e o donut em branco. É o erro que faz alguém achar
 * que o dossiê está quebrado.
 */
export function BotaoImprimir({ nomeSugerido }: { nomeSugerido: string }) {
  return (
    <div className="sem-impressao flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-sm text-foreground">Pronto para enviar ao cliente</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Na janela de impressão, escolha <strong className="font-medium">Salvar como PDF</strong> e
          marque <strong className="font-medium">Gráficos de fundo</strong> — sem essa opção o
          navegador imprime os gráficos em branco. Sugestão de nome: {nomeSugerido}.
        </p>
      </div>
      <Button type="button" className="gap-1.5" onClick={() => window.print()}>
        <Printer className="size-4" aria-hidden />
        Imprimir / Salvar PDF
      </Button>
    </div>
  );
}
