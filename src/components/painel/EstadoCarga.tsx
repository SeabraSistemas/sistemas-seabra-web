'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Barra de estado da leitura da planilha, no topo de cada página: quando foi
 * lida, aviso se a releitura mais recente falhou (mostrando dado antigo) e o
 * botão "Atualizar" (invalida o cache do servidor e recarrega a página).
 */
export function EstadoCarga({
  configurado,
  stale,
  carregadoEm,
  atualizarHref,
}: {
  configurado: boolean;
  stale: boolean;
  carregadoEm: number | null;
  atualizarHref: string;
}) {
  const router = useRouter();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    try {
      await fetch(atualizarHref, { method: 'POST' });
      router.refresh();
    } finally {
      setAtualizando(false);
    }
  }

  if (!configurado) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        Planilha não configurada — fale com o suporte.
      </div>
    );
  }

  const hora = carregadoEm ? new Date(carregadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>
        Atualizado às {hora}
        {stale && <span className="ml-2 text-amber-400">— a releitura falhou, mostrando o último dado bom</span>}
      </span>
      <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 px-2" onClick={atualizar} disabled={atualizando}>
        <RefreshCw className={`size-3.5 ${atualizando ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );
}
