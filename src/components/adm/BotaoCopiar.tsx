'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Botão genérico de copiar-para-a-área-de-transferência. Mesmo padrão de
 * `NumeroCopiavel` em CabecalhoUsuario.tsx — extraído aqui porque a tela de
 * Reprodução precisa copiar um TEXTO FORMATADO (o aviso de DG pendente para o
 * WhatsApp), não um número, e um segundo componente ad-hoc faria essa mesma
 * lógica de feedback (ícone vira check por 1,4s) divergir com o tempo.
 */
export function BotaoCopiar({ texto, rotulo = 'Copiar' }: { texto: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1400);
    } catch {
      // Clipboard exige contexto seguro e permissão. Falhar em silêncio é o
      // certo: o texto continua na tela pra selecionar à mão, e um alerta de
      // erro por um clique de conveniência seria pior que o problema.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      disabled={texto.length === 0}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copiado ? (
        <Check size={13} strokeWidth={2} className="text-primary" aria-hidden />
      ) : (
        <Copy size={13} strokeWidth={1.8} aria-hidden />
      )}
      {copiado ? 'Copiado' : rotulo}
    </button>
  );
}
