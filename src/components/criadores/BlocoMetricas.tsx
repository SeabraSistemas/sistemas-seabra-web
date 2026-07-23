import { metricasDe } from '@/lib/criadores/normalize';
import type { Animal } from '@/lib/criadores/types';

/**
 * Bloco "FICHA": as metricas presentes (teto real ~2 na base atual). Se nao
 * houver metrica, o bloco inteiro nao renderiza (nada de rotulo orfao).
 */
export function BlocoMetricas({ animal, label }: { animal: Animal; label: string }) {
  const metricas = metricasDe(animal);
  if (metricas.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</h2>
      <div
        className="grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
      >
        {metricas.map((m) => (
          <div key={m.label} className="bg-white p-3">
            <div className="font-mono text-xl font-semibold tabular-nums text-gray-900">
              {m.valor}
              {m.sufixo && <small className="ml-1 text-xs font-normal text-gray-500">{m.sufixo}</small>}
            </div>
            <div className="mt-0.5 text-[11px] capitalize text-gray-500">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
