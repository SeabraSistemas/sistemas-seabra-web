'use client';

import Link from 'next/link';
import { Check, CircleDashed } from 'lucide-react';
import type { ReactNode } from 'react';
import { ProgressoContext, contarConcluidas, useProgresso } from '@/lib/cursoidiomas/progresso';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ProgressoProvider({ email, children }: { email: string; children: ReactNode }) {
  return <ProgressoContext.Provider value={email}>{children}</ProgressoContext.Provider>;
}

/** "3 de 19" + barra. `chaves` são as lições que contam. */
export function BarraProgresso({ chaves, compacta = false }: { chaves: string[]; compacta?: boolean }) {
  const { progresso } = useProgresso();
  const feitas = contarConcluidas(progresso, chaves);
  const pct = chaves.length ? Math.round((feitas / chaves.length) * 100) : 0;
  return (
    <div className={cn('flex items-center gap-3', compacta ? 'text-xs' : 'text-sm')}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
        {feitas}/{chaves.length}
      </span>
    </div>
  );
}

/** Ícone de concluída/pendente ao lado de uma lição. */
export function MarcaLicao({ chave }: { chave: string }) {
  const { progresso } = useProgresso();
  const r = progresso.concluidas[chave];
  return r ? (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      title={`Concluída${r.total != null ? ` · ${r.acertos}/${r.total}` : ''}`}
    >
      <Check className="size-3.5" />
    </span>
  ) : (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
      <CircleDashed className="size-3.5" />
    </span>
  );
}

/** Marca/desmarca a lição atual, independentemente do exercício. */
export function BotaoConcluir({ chave }: { chave: string }) {
  const { progresso, marcar, desmarcar } = useProgresso();
  const r = progresso.concluidas[chave];
  if (r) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-primary">
          <Check className="size-4" /> Concluída
          {r.total != null && (
            <span className="text-muted-foreground">
              · {r.acertos}/{r.total}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => desmarcar(chave)}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          desfazer
        </button>
      </div>
    );
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => marcar(chave)}>
      <Check /> Marcar como concluída
    </Button>
  );
}

/** Link "Continuar" para a primeira lição ainda não concluída. */
export function Continuar({
  itens,
  rotuloInicio = 'Começar',
  className,
}: {
  /** Em ordem da trilha: chave da lição e URL. */
  itens: { chave: string; href: string; titulo: string }[];
  rotuloInicio?: string;
  className?: string;
}) {
  const { progresso } = useProgresso();
  const proxima = itens.find((i) => !progresso.concluidas[i.chave]);
  const feitas = itens.length - itens.filter((i) => !progresso.concluidas[i.chave]).length;
  if (!proxima) {
    return <span className={cn('text-sm text-primary', className)}>Tudo concluído.</span>;
  }
  return (
    <Button asChild size="sm" className={cn('h-auto min-h-8 py-1.5 text-left whitespace-normal', className)}>
      <Link href={proxima.href}>
        {feitas === 0 ? rotuloInicio : 'Continuar'}: {proxima.titulo}
      </Link>
    </Button>
  );
}
