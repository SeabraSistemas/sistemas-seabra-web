import { Card, CardContent } from '@/components/ui/card';

export interface MetricDef {
  id: string;
  label: string;
  value: string;
  /** Linha pequena abaixo do valor — ex. cobertura "vendas com valor 124 de 2.287". */
  detalhe?: string;
  /** 'ruim' pinta o valor em vermelho (ex. perdas), 'aviso' em âmbar (ex. valor estimado, não digitado) — default neutro. */
  tom?: 'neutro' | 'ruim' | 'bom' | 'aviso';
}

const TOM_CLASSE: Record<NonNullable<MetricDef['tom']>, string> = {
  neutro: 'text-foreground',
  ruim: 'text-destructive',
  bom: 'text-emerald-400',
  aviso: 'text-amber-400',
};

/**
 * Card de métrica do resumo. Cópia de src/components/katmandu/MetricCard.tsx
 * em pasta neutra, com `detalhe`/`tom` a mais (Financeiro precisa mostrar
 * cobertura ao lado do valor e destacar perdas).
 */
export function MetricCard({ label, value, detalhe, tom = 'neutro' }: MetricDef) {
  return (
    <Card className="py-5">
      <CardContent className="px-5">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 truncate text-2xl font-semibold tabular-nums ${TOM_CLASSE[tom]}`} title={value}>
          {value}
        </p>
        {detalhe && <p className="mt-0.5 truncate text-xs text-muted-foreground">{detalhe}</p>}
      </CardContent>
    </Card>
  );
}
