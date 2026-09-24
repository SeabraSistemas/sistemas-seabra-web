export interface MetricDef {
  id: string;
  label: string;
  value: string;
  /** Linha pequena abaixo do valor — ex. "ordenha de 23/09/2026". */
  detalhe?: string;
  /** 'ruim' pinta o valor de erro (produção negativa) — default neutro. */
  tom?: 'neutro' | 'ruim';
}

/** Card de métrica do resumo. */
export function MetricCard({ label, value, detalhe, tom = 'neutro' }: MetricDef) {
  return (
    <div className="min-w-0 rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
      <p className="truncate text-sm text-ink-2">{label}</p>
      <p className={`mt-1 truncate text-2xl font-semibold ${tom === 'ruim' ? 'text-erro' : 'text-ink'}`} title={value}>
        {value}
      </p>
      {detalhe && <p className="mt-0.5 text-xs leading-snug text-ink-2">{detalhe}</p>}
    </div>
  );
}
