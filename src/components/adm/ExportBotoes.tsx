import { Download, FileSpreadsheet, FileText } from 'lucide-react';

import { formatarInteiro } from '@/lib/adm/format';
import { cn } from '@/lib/utils';

/**
 * Exportar CSV/Excel das telas de CARTEIRA (pagamentos, receita, risco,
 * adoção) — o par mais simples de `<ExportMenu>`, e de propósito.
 *
 * POR QUE NÃO É `<ExportMenu>`: aquele componente resolve um problema que
 * estas telas não têm. Ele existe para as tabelas CRUAS de UM cliente —
 * dezenas de colunas, milhares de linhas, paginação, e por isso pede um Sheet
 * inteiro com seletor de coluna e escolha entre "página atual" e "tudo que os
 * filtros selecionam". As quatro telas de carteira agregam a base inteira,
 * têm de sete a dez colunas fixas, e NUNCA são paginadas — não existe "página
 * atual" para escolher, e uma tela de nove linhas não precisa de seletor de
 * coluna. Reaproveitar o Sheet inteiro para duas perguntas ("qual formato?")
 * seria complexidade sem pergunta que a responda.
 *
 * SERVER COMPONENT, DE PROPÓSITO: os dois links são a URL da rota de export
 * mais os parâmetros que já estão disponíveis no servidor (a página já leu a
 * query string para desenhar a própria grade) — não há estado de cliente
 * nenhum aqui, então não há razão para mandar JavaScript ao browser por isto.
 *
 * O PDF não aparece aqui: decisão D4 já fixou que PDF no /adm é o dossiê
 * comercial de UM cliente, não despejo de tabela agregada — não existe "PDF
 * da carteira inteira" que faça sentido como peça de venda.
 */
export function ExportBotoes({
  tela,
  parametros,
  contagem,
  className,
}: {
  /** Qual das quatro telas — vira `?tela=` na rota de export. */
  tela: 'pagamentos' | 'receita' | 'risco' | 'adocao';
  /**
   * O que mais identifica o recorte: o filtro atual da tela (`f.situacao`,
   * `f.vencimento`) ou o balde do risco. Copiado da URL que a página já leu —
   * nunca reconstruído, para o arquivo bater com o que está na grade.
   */
  parametros?: Record<string, string | undefined>;
  /** Quantas linhas o arquivo vai ter — mostrado ao lado do CSV, se souber. */
  contagem?: number;
  className?: string;
}) {
  function href(formato: 'csv' | 'xlsx'): string {
    const p = new URLSearchParams();
    p.set('tela', tela);
    p.set('formato', formato);
    for (const [chave, valor] of Object.entries(parametros ?? {})) {
      if (valor != null && valor !== '') p.set(chave, valor);
    }
    return `/adm/api/export/carteira?${p.toString()}`;
  }

  const classeLink =
    'inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-muted-foreground ' +
    'transition-colors hover:border-primary/40 hover:text-foreground';

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <Download className="size-3.5 text-muted-foreground" aria-hidden />
      <a href={href('csv')} className={classeLink}>
        <FileText className="size-3.5" />
        CSV{contagem != null ? ` · ${formatarInteiro(contagem)}` : ''}
      </a>
      <a href={href('xlsx')} className={classeLink}>
        <FileSpreadsheet className="size-3.5" />
        Excel
      </a>
    </div>
  );
}
