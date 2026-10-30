'use client';

import { useState } from 'react';

/** Botão "i": a explicação mora aqui, não solta na tela. */
export function Info({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={aberto}
        aria-label="Como funciona"
        onClick={() => setAberto(!aberto)}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-xs font-bold italic text-ink-1 hover:bg-paper-2"
      >
        i
      </button>
      {aberto && <div className="basis-full rounded-campo bg-paper-2 px-3 py-2 text-sm text-ink-1">{children}</div>}
    </>
  );
}
