'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso, PainelBotao } from './Controles';

/**
 * Topo de cada página: quando a planilha foi lida, botão "Atualizar" (relê
 * User Manager e tanque_regua sem esperar o cache de 5 min) e aviso se a
 * leitura falhou — producao_diaria não tem cache pra cair no dado antigo.
 */
export function EstadoPlanilha({ configurado, ok, carregadoEm }: { configurado: boolean; ok: boolean; carregadoEm: number | null }) {
  const router = useRouter();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    try {
      await fetch('/sanri/api/atualizar', { method: 'POST' });
      router.refresh();
    } finally {
      setAtualizando(false);
    }
  }

  if (!configurado) return <Aviso tom="erro">Planilha não configurada — fale com o suporte.</Aviso>;

  // Fuso fixo: o servidor (Vercel, UTC) e o celular renderizam a mesma hora — sem isso a hidratação diverge.
  const hora = carregadoEm
    ? new Date(carregadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    : '—';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
        <span>Planilha lida às {hora}</span>
        <PainelBotao variante="discreto" onClick={atualizar} disabled={atualizando}>
          {atualizando ? 'Atualizando…' : 'Atualizar'}
        </PainelBotao>
      </div>
      {!ok && <Aviso tom="erro">Não foi possível ler a planilha agora — tente Atualizar em instantes.</Aviso>}
    </div>
  );
}
