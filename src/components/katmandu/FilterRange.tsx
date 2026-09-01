'use client';

import { Slider } from '@/components/ui/slider';
import { formatNumber } from '@/lib/katmandu/format';
import { cn } from '@/lib/utils';

export function FilterRange({
  label,
  bounds,
  value,
  onChange,
  className,
  formatValue = formatNumber,
}: {
  label: string;
  bounds: [number, number];
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
  /** Como mostrar as pontas do slider — default formata número, mas ex. uma faixa de datas passa um formatador próprio. */
  formatValue?: (n: number) => string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1 sm:min-w-48', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <Slider
        min={bounds[0]}
        max={bounds[1]}
        value={value}
        onValueChange={(v) => onChange([v[0] ?? bounds[0], v[1] ?? bounds[1]])}
        className="py-2"
      />
      <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
    </div>
  );
}
