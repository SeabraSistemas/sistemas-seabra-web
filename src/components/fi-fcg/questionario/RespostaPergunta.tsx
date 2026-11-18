'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Sugestao } from '@/lib/fi-fcg/questionario/sugestoes';

export interface RespostaGravada {
  valor: string | null;
  gravado_por: string;
  gravado_em: string;
}

function quando(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function Fontes({ s }: { s: Sugestao }) {
  if (!s.fontes?.length) return null;
  return (
    <span className="text-muted-foreground">
      {' ['}
      {s.fontes.map((f, i) => (
        <span key={i}>
          {i > 0 && '; '}
          <a href={`#${f.ref}`} className="underline underline-offset-2">
            {f.ref}
          </a>
          {f.pagina ? ` ${f.pagina}` : ''}
        </span>
      ))}
      {']'}
    </span>
  );
}

/**
 * Campo de resposta do proprietário. Nasce vazio; a sugestão fica embaixo,
 * num bloco separado, e só vai para o campo pelo botão. A pergunta só conta
 * como respondida depois de salva.
 */
export function RespostaPergunta({
  n,
  proposta,
  sugestoes,
  gravada,
}: {
  n: number;
  /** resposta que o sistema propõe (perguntas "Respondida pelo sistema") */
  proposta?: string;
  sugestoes: Sugestao[];
  gravada: RespostaGravada | null;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(gravada?.valor ?? '');
  const [pendente, iniciar] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const id = `resposta-${n}`;
  const mudou = texto.trim() !== (gravada?.valor ?? '');

  function salvar() {
    iniciar(async () => {
      const r = await fetch('/FI_FCG/api/questionario', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ n, resposta: texto }),
      });
      const j = (await r.json().catch(() => ({}))) as { erro?: string };
      if (!r.ok) setMsg({ ok: false, texto: j.erro ?? 'Não salvou.' });
      else {
        setMsg({ ok: true, texto: 'Salvo.' });
        router.refresh();
      }
    });
  }

  const banco = sugestoes.filter((s) => s.origem === 'banco');
  const lit = sugestoes.filter((s) => s.origem === 'literatura');

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-sm font-medium">
          Sua resposta
          {gravada?.valor ? (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-px text-[11px] font-semibold text-emerald-300">
              Respondida por você em {quando(gravada.gravado_em)}
            </span>
          ) : (
            <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-px text-[11px] font-semibold text-amber-300">Ainda sem resposta</span>
          )}
        </label>
        <textarea
          id={id}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Escreva aqui"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" disabled={pendente || !mudou} onClick={salvar}>
            {pendente ? 'Salvando…' : 'Salvar'}
          </Button>
          {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.texto}</span>}
        </div>
      </div>

      {proposta && (
        <div className="rounded-lg border border-dashed border-zinc-500/70 bg-zinc-500/10 p-3 text-sm text-zinc-300">
          <p className="text-xs font-semibold">O sistema propõe · você confirma ou troca</p>
          <p className="mt-1 max-w-prose">{proposta}</p>
          <button type="button" onClick={() => setTexto(`Confirmo: ${proposta}`)} className="mt-2 rounded border border-zinc-500/70 px-2 py-0.5 text-xs hover:text-foreground">
            Usar esta resposta
          </button>
        </div>
      )}

      {banco.length > 0 && (
        <div className="rounded-lg border border-dashed border-zinc-500/70 bg-zinc-500/10 p-3 text-sm text-zinc-300">
          <p className="text-xs font-semibold">O que o sistema vê hoje · você confirma ou troca</p>
          <ul className="mt-1 space-y-2">
            {banco.map((s, i) => (
              <li key={i} className="max-w-prose">
                <span className="mr-1.5 rounded-full border border-emerald-500/40 px-1.5 py-px text-[10px] font-semibold text-emerald-300">lido no banco em {s.lidoEm}</span>
                <span className="italic">{s.valor}.</span> <span className="text-muted-foreground">{s.base}</span>
                <div>
                  <button type="button" onClick={() => setTexto(s.valor)} className="mt-1 rounded border border-zinc-500/70 px-2 py-0.5 text-xs hover:text-foreground">
                    Usar esta sugestão
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lit.length > 0 && (
        <div className="rounded-lg border border-dashed border-zinc-500/70 bg-zinc-500/10 p-3 text-sm text-zinc-300">
          <p className="text-xs font-semibold">Sugestão · da literatura, não é resposta</p>
          <ul className="mt-1 space-y-2">
            {lit.map((s, i) => (
              <li key={i} className="max-w-prose">
                <span className="italic">{s.valor}.</span> <span className="text-muted-foreground">{s.base}</span>
                <Fontes s={s} />
                <div>
                  <button type="button" onClick={() => setTexto(s.valor)} className="mt-1 rounded border border-zinc-500/70 px-2 py-0.5 text-xs hover:text-foreground">
                    Usar esta sugestão
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
