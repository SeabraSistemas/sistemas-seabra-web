import { TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Sinalização de perda de peso: só renderiza quando a diferença é negativa.
 * Cópia de src/components/katmandu/WeightLossBadge.tsx em pasta neutra
 * (Katmandu fica intocado) — usada também pelo /FI_FCG/pesagem.
 */
export function WeightLossBadge({ diferencaKg }: { diferencaKg: number | null }) {
  if (diferencaKg == null || diferencaKg >= 0) return null;
  return (
    <Badge variant="destructive" className="gap-1">
      <TrendingDown className="size-3" />
      Perdendo peso
    </Badge>
  );
}
