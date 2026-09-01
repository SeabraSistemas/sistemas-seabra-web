'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSelect } from './FilterSelect';
import { MetricCard } from './MetricCard';
import type { AnimalRebanho } from '@/lib/katmandu/types';

type Estado = 'ideia' | 'confirmando' | 'enviando' | 'feito' | 'erro';

export function MovimentarView({ animais, locais }: { animais: AnimalRebanho[]; locais: string[] }) {
  const router = useRouter();
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState<Estado>('ideia');
  const [resultado, setResultado] = useState<{ movidos: number; logFalhou?: boolean } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const contagem = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const a of animais) {
      if (a.baixa != null || !a.local) continue;
      mapa[a.local] = (mapa[a.local] ?? 0) + 1;
    }
    return mapa;
  }, [animais]);

  const opcoesDestino = useMemo(() => locais.filter((l) => l !== origem), [locais, origem]);
  const qtdOrigem = origem ? (contagem[origem] ?? 0) : 0;

  function reiniciar() {
    setOrigem('');
    setDestino('');
    setEstado('ideia');
    setResultado(null);
    setErro(null);
  }

  async function confirmar() {
    setEstado('enviando');
    setErro(null);
    try {
      const res = await fetch('/api/katmandu/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem, destino }),
      });
      const data = (await res.json()) as { ok: boolean; movidos?: number; logFalhou?: boolean; erro?: string };
      if (!res.ok || !data.ok) {
        setErro(data.erro ?? 'Não foi possível mover os animais.');
        setEstado('erro');
        return;
      }
      setResultado({ movidos: data.movidos ?? 0, logFalhou: data.logFalhou });
      setEstado('feito');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEstado('erro');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Move todos os animais ativos de um local pra outro. Animais com baixa não são afetados.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect
            label="De"
            value={origem}
            onChange={(v) => {
              setOrigem(v);
              if (v === destino) setDestino('');
              setEstado('ideia');
            }}
            options={locais}
            labelDe={(l) => `${l} (${contagem[l] ?? 0})`}
            placeholder="Selecione"
            triggerClassName="w-full sm:w-56"
          />
          <ArrowRight className="mb-2.5 size-4 shrink-0 text-muted-foreground" />
          <FilterSelect
            label="Para"
            value={destino}
            onChange={(v) => {
              setDestino(v);
              setEstado('ideia');
            }}
            options={opcoesDestino}
            placeholder="Selecione"
          />
        </div>

        {origem && (
          <div className="mt-4 max-w-40">
            <MetricCard id="qtd" label={`Ativos em ${origem}`} value={String(qtdOrigem)} />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {estado === 'ideia' && (
            <Button
              type="button"
              className="w-fit"
              disabled={!origem || !destino || qtdOrigem === 0}
              onClick={() => setEstado('confirmando')}
            >
              Movimentar
            </Button>
          )}

          {(estado === 'confirmando' || estado === 'enviando') && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
              <span>
                Mover <strong className="tabular-nums">{qtdOrigem}</strong> animais ativos de{' '}
                <strong>{origem}</strong> pra <strong>{destino}</strong>?
              </span>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={estado === 'enviando'} onClick={confirmar}>
                  {estado === 'enviando' ? 'Movimentando…' : 'Confirmar'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={estado === 'enviando'}
                  onClick={() => setEstado('ideia')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {estado === 'feito' && resultado && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
              <span>
                {resultado.movidos} animais movidos de <strong>{origem}</strong> pra{' '}
                <strong>{destino}</strong>.
                {resultado.logFalhou && (
                  <span className="ml-1 text-destructive">
                    A movimentação valeu, mas o registro em &quot;movimentacao&quot; falhou — confira depois.
                  </span>
                )}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={reiniciar}>
                Nova movimentação
              </Button>
            </div>
          )}

          {estado === 'erro' && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <span>{erro}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setEstado('ideia')}>
                Tentar de novo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
