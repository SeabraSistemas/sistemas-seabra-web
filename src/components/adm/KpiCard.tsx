/**
 * Card de KPI da carteira. Server Component: não tem estado nem evento — só
 * desenha o número que a query já calculou.
 *
 * Duas regras que este componente carrega para o painel inteiro:
 *
 * 1. ELE NÃO FORMATA NADA. `valor` chega pronto de `src/lib/adm/format.ts`
 *    (formatarMoeda, formatarInteiro, formatarPercentual). Se cada card
 *    decidisse a própria unidade, o MRR apareceria como "R$ 4.820,00" num lugar
 *    e "4820" no outro — e a diferença entre os dois seria indistinguível de um
 *    bug de cálculo.
 *
 * 2. VARIAÇÃO TEM DIREÇÃO MORAL, e ela não é sempre "subir é bom". MRR subindo é
 *    verde; inadimplência subindo é vermelha. Quem chama declara isso com
 *    `subirEhBom={false}` — não existe default esperto que acerte os dois.
 *
 * O `href` transforma o card inteiro em link para a lista JÁ FILTRADA que produz
 * aquele número. É o que fecha o ciclo do painel: todo número agregado tem um
 * caminho de volta para as linhas que o compõem.
 */

import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatarVariacao } from '@/lib/adm/format';
import { cn } from '@/lib/utils';

export interface Variacao {
  /** FRAÇÃO (0,12 = +12%), como o resto do /adm — nunca 0-100. Null = sem base de comparação. */
  fracao: number | null;
  /** Contra o quê ('vs. mês anterior'). Sem isto, um "+12%" não quer dizer nada. */
  referencia?: string;
  /** False quando crescer é ruim: inadimplentes, silenciosos, receita em risco. */
  subirEhBom?: boolean;
}

export function KpiCard({
  rotulo,
  valor,
  detalhe,
  variacao,
  href,
  destaque = false,
  className,
}: {
  rotulo: string;
  /** Já formatado. Ver a regra 1 no cabeçalho. */
  valor: string;
  /** Sub-linha de contexto: "de 47 contas", "tabela R$ 5.120". */
  detalhe?: React.ReactNode;
  variacao?: Variacao;
  /** A lista filtrada que explica este número. */
  href?: string;
  /** Variante do MRR — o número que o Felipe olha primeiro. */
  destaque?: boolean;
  className?: string;
}) {
  const fracao = variacao?.fracao ?? null;
  const subirEhBom = variacao?.subirEhBom ?? true;
  const bom = fracao === null || fracao === 0 ? null : fracao > 0 === subirEhBom;
  const Seta = fracao === null || fracao === 0 ? ArrowRight : fracao > 0 ? ArrowUpRight : ArrowDownRight;

  const corpo = (
    <Card
      className={cn(
        'h-full gap-0 py-4 transition-colors',
        destaque && 'border-primary/40 bg-primary/5',
        href && 'group-hover:border-primary/60',
        className,
      )}
    >
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="truncate text-[13px] text-muted-foreground" title={rotulo}>
          {rotulo}
        </p>
        <p
          className={cn(
            'truncate font-medium tabular-nums text-foreground',
            destaque ? 'text-3xl' : 'text-2xl',
          )}
          title={valor}
        >
          {valor}
        </p>

        {(detalhe || variacao) && (
          <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
            {variacao && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 tabular-nums',
                  // emerald para "melhorou" segue o precedente de PAPEL_INFO em
                  // types.ts, que já usa a paleta do Tailwind para sinal semântico;
                  // o vermelho vem do token, porque destrutivo o sistema já tem.
                  bom === null && 'text-muted-foreground',
                  bom === true && 'text-emerald-400',
                  bom === false && 'text-destructive',
                )}
              >
                <Seta className="size-3" />
                {formatarVariacao(fracao)}
                {variacao.referencia && <span className="text-muted-foreground"> {variacao.referencia}</span>}
              </span>
            )}
            {detalhe && <span className="truncate">{detalhe}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!href) return corpo;

  return (
    <Link href={href} className="group block focus-visible:outline-none">
      {corpo}
    </Link>
  );
}
