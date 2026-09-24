'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Estado = 'ideia' | 'confirmando' | 'enviando' | 'feito' | 'erro';

export interface ResultadoMovimentacao {
  movidos: number;
  ignorados: number;
  logFalhou?: boolean;
}

/**
 * Máquina de estado do botão "Movimentar" (pedir => confirmar => enviar =>
 * feito/erro), comum às movimentações por recorte e animal a animal. Mexer
 * na seleção chama `editou()`: uma pergunta de confirmação aberta ficaria
 * descrevendo um recorte que já não é o da tela.
 */
export function useMovimentacao() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('ideia');
  const [resultado, setResultado] = useState<ResultadoMovimentacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(body: object) {
    setEstado('enviando');
    setErro(null);
    try {
      const res = await fetch('/api/katmandu/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; erro?: string } & Partial<ResultadoMovimentacao>;
      if (!res.ok || !data.ok) {
        setErro(data.erro ?? 'Não foi possível mover os animais.');
        setEstado('erro');
        return;
      }
      setResultado({ movidos: data.movidos ?? 0, ignorados: data.ignorados ?? 0, logFalhou: data.logFalhou });
      setEstado('feito');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEstado('erro');
    }
  }

  return {
    estado,
    resultado,
    erro,
    enviar,
    editou: () => setEstado('ideia'),
    pedir: () => setEstado('confirmando'),
    reiniciar: () => {
      setEstado('ideia');
      setResultado(null);
      setErro(null);
    },
  };
}

/** Botão + caixa de confirmação + resultado/erro, igual nos dois modos de movimentar. */
export function AcaoMovimentacao({
  mov,
  body,
  podeMover,
  pergunta,
  feito,
  motivoIgnorados,
  onNova,
}: {
  mov: ReturnType<typeof useMovimentacao>;
  /** Corpo enviado à rota ao confirmar. */
  body: object;
  podeMover: boolean;
  pergunta: React.ReactNode;
  feito: (r: ResultadoMovimentacao) => React.ReactNode;
  /** Completa "N ficaram de fora — …". */
  motivoIgnorados: string;
  onNova: () => void;
}) {
  const { estado, resultado, erro } = mov;
  return (
    <div className="mt-6 flex flex-col gap-3">
      {estado === 'ideia' && (
        <Button type="button" className="w-fit" disabled={!podeMover} onClick={mov.pedir}>
          Movimentar
        </Button>
      )}

      {(estado === 'confirmando' || estado === 'enviando') && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
          <span>{pergunta}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={estado === 'enviando'} onClick={() => mov.enviar(body)}>
              {estado === 'enviando' ? 'Movimentando…' : 'Confirmar'}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={estado === 'enviando'} onClick={mov.editou}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {estado === 'feito' && resultado && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
          <span>
            {feito(resultado)}
            {resultado.ignorados > 0 && (
              <span className="ml-1 text-muted-foreground">
                {resultado.ignorados} ficaram de fora — {motivoIgnorados}
              </span>
            )}
            {resultado.logFalhou && (
              <span className="ml-1 text-destructive">
                A movimentação valeu, mas o registro em &quot;movimentacao&quot; falhou — confira depois.
              </span>
            )}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              mov.reiniciar();
              onNova();
            }}
          >
            Nova movimentação
          </Button>
        </div>
      )}

      {estado === 'erro' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button type="button" size="sm" variant="outline" onClick={mov.editou}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}
