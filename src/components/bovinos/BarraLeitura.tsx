'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Hora da leitura + "Ler de novo". Não usa um route handler para limpar o
 * cache (o cache é por módulo — limpar no handler não limpa o da página, ver
 * lib/fi-fcg/queries.ts): navega para a mesma página com `?fresco=<agora>`,
 * que a página repassa para a leitura ignorar o cache.
 */
export function BarraLeitura({ carregadoEm, stale }: { carregadoEm: number | null; stale: boolean }) {
  const router = useRouter();
  const [lendo, setLendo] = useState(false);

  function lerDeNovo() {
    setLendo(true);
    const url = new URL(window.location.href);
    url.searchParams.set('fresco', String(Date.now()));
    router.push(`${url.pathname}${url.search}`);
  }

  const hora = carregadoEm ? new Date(carregadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>
        Planilha lida às {hora}
        {stale && <span className="ml-2 text-amber-400">— a releitura falhou, mostrando a última leitura boa</span>}
      </span>
      <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 px-2" onClick={lerDeNovo} disabled={lendo}>
        <RefreshCw className={`size-3.5 ${lendo ? 'animate-spin' : ''}`} />
        Ler de novo
      </Button>
    </div>
  );
}
