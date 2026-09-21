'use client';

import { useMemo } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CurvaPeso, type PontoPeso } from '@/components/painel/CurvaPeso';
import { GlossarioTip, type TermoGlossario } from '@/components/painel/CampoInfo';
import { formatDia, formatNumber } from '@/lib/painel/format';
import type { RegPesagem } from '@/lib/fi-fcg/types';

function Tendencia({ diferencaKg }: { diferencaKg: number | null }) {
  if (diferencaKg == null || diferencaKg === 0) return <Minus className="size-3.5 text-muted-foreground" aria-label="sem variação" />;
  if (diferencaKg < 0) return <ArrowDown className="size-3.5 text-destructive" aria-label="perdeu peso" />;
  return <ArrowUp className="size-3.5 text-emerald-400" aria-label="ganhou peso" />;
}

/**
 * Ficha de um animal na aba Pesagem (21/09/2026, pedido do Felipe): clicar
 * na linha abre aqui o histórico dele — curva de peso, os indicadores da
 * última pesagem e a lista completa.
 *
 * Não busca nada: a página de Pesagem já carrega as ~33 mil pesagens no
 * cliente (é a página de orçamento maior, ver o plano do /FI_FCG), e
 * `RegPesagem.id` JÁ É o ID do animal — então o histórico é um filtro em
 * memória, custo zero de payload.
 */
export function FichaAnimalPesagem({
  animalId,
  pesagens,
  siglas,
  onFechar,
}: {
  /** null = painel fechado. */
  animalId: string | null;
  /** Todas as pesagens (a ficha filtra as do animal). */
  pesagens: RegPesagem[];
  siglas: readonly TermoGlossario[];
  onFechar: () => void;
}) {
  const historico = useMemo(() => {
    if (animalId == null) return [];
    return pesagens
      .filter((p) => p.id === animalId && p.data != null)
      .sort((a, b) => (b.data ?? 0) - (a.data ?? 0));
  }, [animalId, pesagens]);

  const ultima = historico[0] ?? null;
  const pontos: PontoPeso[] = useMemo(
    () => historico.filter((p) => p.pesoKg != null).map((p) => ({ dia: p.data as number, pesoKg: p.pesoKg as number })),
    [historico],
  );

  return (
    <Sheet open={animalId !== null} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Animal {animalId}
            <GlossarioTip titulo="O que significa cada sigla" termos={siglas} />
          </SheetTitle>
          {ultima && (
            <div className="flex flex-wrap gap-1.5">
              {ultima.fazenda && <Badge variant="outline">{ultima.fazenda}</Badge>}
              {ultima.lote && <Badge variant="outline">Lote {ultima.lote}</Badge>}
              {ultima.sexo && <Badge variant="outline">{ultima.sexo}</Badge>}
            </div>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <CurvaPeso pontos={pontos} />

          {ultima && (
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Peso atual</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatNumber(ultima.pesoKg)} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">GPD</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatNumber(ultima.gpd)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">GMD</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatNumber(ultima.gmd)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PDI</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatNumber(ultima.pdi)}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-foreground">Pesos ({formatNumber(historico.length)})</h3>
            {historico.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nenhuma pesagem registrada para este animal.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border/60">
                {historico.map((p, i) => (
                  <li key={`${p.data}-${i}`} className="flex items-center gap-3 py-2 text-xs">
                    <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{formatDia(p.data)}</span>
                    <span className="w-16 shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatNumber(p.pesoKg)} kg
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">
                      GPD: {formatNumber(p.gpd)}
                      {p.gpdi != null && <> · GPDi: {formatNumber(p.gpdi)}</>}
                      {p.diasEngorda != null && <> · {formatNumber(p.diasEngorda)}d engorda</>}
                    </span>
                    <Tendencia diferencaKg={p.diferencaKg} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
