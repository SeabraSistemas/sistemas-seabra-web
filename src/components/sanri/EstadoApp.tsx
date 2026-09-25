'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso, PainelBotao } from './Controles';

/**
 * Topo das telas que leem o banco do app (não a planilha): quando foi lido e
 * o botão "Atualizar". Aqui não há cache — atualizar só relê a página.
 */
export function EstadoApp({ configurado, ok, carregadoEm }: { configurado: boolean; ok: boolean; carregadoEm: number | null }) {
  const router = useRouter();
  const [atualizando, setAtualizando] = useState(false);

  function atualizar() {
    setAtualizando(true);
    router.refresh();
    // refresh() não devolve promessa; o aviso some sozinho.
    window.setTimeout(() => setAtualizando(false), 1200);
  }

  if (!configurado) return <Aviso tom="erro">O banco do app não está configurado neste ambiente — fale com o suporte.</Aviso>;

  const hora = carregadoEm
    ? new Date(carregadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    : '—';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
        <span>Dados do app lidos às {hora}</span>
        <PainelBotao variante="discreto" onClick={atualizar} disabled={atualizando}>
          {atualizando ? 'Atualizando…' : 'Atualizar'}
        </PainelBotao>
      </div>
      {!ok && <Aviso tom="erro">Não foi possível ler os dados do app agora — tente Atualizar em instantes.</Aviso>}
    </div>
  );
}
