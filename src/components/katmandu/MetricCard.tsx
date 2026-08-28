import { Card, CardContent } from '@/components/ui/card';
import type { MetricDef } from '@/lib/katmandu/metrics';

/**
 * Card de métrica do resumo. A lista de métricas já vem filtrada (sem entradas
 * nulas) de src/lib/katmandu/metrics.ts — este componente só desenha o que recebe,
 * nunca decide se um valor "não existe pro usuário".
 */
export function MetricCard({ label, value }: MetricDef) {
  return (
    <Card className="py-5">
      <CardContent className="px-5">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums text-foreground" title={value}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
