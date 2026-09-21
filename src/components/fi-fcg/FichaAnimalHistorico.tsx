'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatDia, formatNumber } from '@/lib/painel/format';
import type { AnimalMonitorado } from '@/lib/fi-fcg/manejo';
import type { EventoHistorico } from '@/app/FI_FCG/api/ficha-animal/route';

/** Cor por tipo de evento — só pra escanear rápido a lista, sem virar semáforo de status. */
const VARIANTE_TIPO: Record<EventoHistorico['tipo'], 'outline' | 'secondary'> = {
  Pesagem: 'outline',
  Toque: 'secondary',
  IATF: 'outline',
  Parto: 'secondary',
};

/**
 * Ficha de um animal na página Monitorar (21/09/2026) — diferente da
 * `FichaAnimalPesagem` (só pesagens, filtro em memória): aqui o histórico
 * cruza Pesagem/Toque/IATF/Parto, dados que a página Monitorar não carrega
 * inteiros no cliente (custaria caro pra cada linha da lista) — busca sob
 * demanda em `/FI_FCG/api/ficha-animal` só quando o painel abre.
 */
export function FichaAnimalHistorico({ animal, onFechar }: { animal: AnimalMonitorado | null; onFechar: () => void }) {
  const [eventos, setEventos] = useState<EventoHistorico[]>([]);
  // Id do animal a que `eventos`/`erro` se referem — carregando/pronto/erro são
  // DERIVADOS comparando com `animal?.id`, nenhum setState roda de forma
  // síncrona no corpo do efeito (só dentro dos callbacks do fetch), mesmo
  // padrão de src/components/home/ProofsSection.tsx.
  const [resultadoParaId, setResultadoParaId] = useState<string | null>(null);
  const [erroParaId, setErroParaId] = useState<string | null>(null);

  useEffect(() => {
    if (animal == null) return;
    const id = animal.id;
    let cancelado = false;
    fetch(`/FI_FCG/api/ficha-animal?id=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('falha ao buscar');
        return res.json() as Promise<{ eventos: EventoHistorico[] }>;
      })
      .then((dados) => {
        if (cancelado) return;
        setEventos(dados.eventos);
        setResultadoParaId(id);
      })
      .catch(() => {
        if (!cancelado) setErroParaId(id);
      });
    return () => {
      cancelado = true;
    };
  }, [animal]);

  const carregando = animal != null && resultadoParaId !== animal.id && erroParaId !== animal.id;
  const erro = animal != null && erroParaId === animal.id;

  return (
    <Sheet open={animal !== null} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Animal {animal?.id}</SheetTitle>
          {animal && (
            <div className="flex flex-wrap items-center gap-1.5">
              {animal.fazenda && <Badge variant="outline">{animal.fazenda}</Badge>}
              {animal.categoria && <Badge variant="outline">{animal.categoria}</Badge>}
              {animal.sexo && <Badge variant="outline">{animal.sexo}</Badge>}
              <span className="text-xs text-muted-foreground">
                {animal.ultimoManejo != null
                  ? `Último manejo: ${formatDia(animal.ultimoManejo)} (${formatNumber(animal.diasSemManejo)} dias atrás)`
                  : 'Nenhum manejo conhecido'}
              </span>
            </div>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-1 px-4 pb-6">
          <h3 className="text-sm font-medium text-foreground">Histórico de lançamentos</h3>
          {carregando ? (
            <p className="py-4 text-sm text-muted-foreground">Carregando...</p>
          ) : erro ? (
            <p className="py-4 text-sm text-destructive">Não deu pra carregar o histórico deste animal.</p>
          ) : eventos.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhum lançamento (Pesagem/Toque/IATF/Parto) encontrado.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {eventos.map((e, i) => (
                <li key={`${e.tipo}-${e.data}-${i}`} className="flex items-start gap-3 py-2 text-xs">
                  <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{formatDia(e.data)}</span>
                  <Badge variant={VARIANTE_TIPO[e.tipo]} className="shrink-0">
                    {e.tipo}
                  </Badge>
                  <span className="flex-1 text-muted-foreground">{e.resumo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
