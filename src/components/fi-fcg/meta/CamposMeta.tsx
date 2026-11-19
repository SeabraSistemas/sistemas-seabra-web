'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoTip } from '@/components/painel/CampoInfo';
import { CAMPOS, GRUPOS, type Campo } from '@/lib/fi-fcg/meta/campos';
import { FAZENDAS, chaveParam } from '@/lib/fi-fcg/meta/fazendas';

export interface GravacaoTela {
  valor: number | string | null;
  gravado_por: string;
  gravado_em: string;
}

function quando(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/** Os campos da aba Meta, por grupo. Cada grupo grava sozinho; o painel recalcula na hora. */
export function CamposMeta({ gravacoes }: { gravacoes: Record<string, GravacaoTela> }) {
  return (
    <div className="space-y-4">
      {GRUPOS.map((g) => (
        <GrupoForm key={g.id} titulo={g.titulo} campos={CAMPOS.filter((c) => c.grupo === g.id)} gravacoes={gravacoes} />
      ))}
    </div>
  );
}

interface Linha {
  campo: Campo;
  propriedadeId: number | null;
  sufixo: string | null;
}

function GrupoForm({ titulo, campos, gravacoes }: { titulo: string; campos: Campo[]; gravacoes: Record<string, GravacaoTela> }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const linhas: Linha[] = campos.flatMap((c): Linha[] =>
    c.escopo === 'fazenda'
      ? FAZENDAS.map((f) => ({ campo: c, propriedadeId: f.id as number, sufixo: f.nome.replace('Fazenda ', '') }))
      : [{ campo: c, propriedadeId: null, sufixo: null }],
  );
  const inicial = Object.fromEntries(
    linhas.map((l) => {
      const g = gravacoes[chaveParam(l.campo.chave, l.propriedadeId)];
      return [chaveParam(l.campo.chave, l.propriedadeId), g?.valor == null ? '' : typeof g.valor === 'number' ? g.valor.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) : String(g.valor)];
    }),
  );
  const [valores, setValores] = useState<Record<string, string>>(inicial);
  const vazios = linhas.filter((l) => !inicial[chaveParam(l.campo.chave, l.propriedadeId)]).length;

  function gravar(e: React.FormEvent) {
    e.preventDefault();
    const mudou = linhas.filter((l) => {
      const k = chaveParam(l.campo.chave, l.propriedadeId);
      return (valores[k] ?? '') !== (inicial[k] ?? '');
    });
    if (mudou.length === 0) {
      setMsg({ ok: true, texto: 'Nada mudou.' });
      return;
    }
    iniciar(async () => {
      const r = await fetch('/FI_FCG/api/parametros', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          valores: mudou.map((l) => ({ chave: l.campo.chave, propriedadeId: l.propriedadeId, valor: valores[chaveParam(l.campo.chave, l.propriedadeId)] })),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { erro?: string; gravados?: number };
      if (!r.ok) setMsg({ ok: false, texto: j.erro ?? 'Não gravou.' });
      else {
        setMsg({ ok: true, texto: `Gravado (${j.gravados}).` });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={gravar} className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">{titulo}</h3>
        {vazios > 0 && <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">{vazios} em branco</span>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {linhas.map((l) => {
          const k = chaveParam(l.campo.chave, l.propriedadeId);
          const g = gravacoes[k];
          const id = `campo-${k.replace(/[^a-z0-9]/gi, '-')}`;
          return (
            <div key={k} className="flex flex-col gap-1">
              <label htmlFor={id} className="flex items-center gap-1.5 text-sm">
                <span>
                  {l.campo.rotulo}
                  {l.sufixo && <span className="text-muted-foreground"> · {l.sufixo}</span>}
                  {l.campo.unidade && <span className="text-muted-foreground"> ({l.campo.unidade})</span>}
                </span>
                <InfoTip info={l.campo.info} />
              </label>
              {l.campo.tipo === 'opcao' ? (
                <select
                  id={id}
                  value={valores[k] ?? ''}
                  onChange={(e) => setValores({ ...valores, [k]: e.target.value })}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Em branco</option>
                  {l.campo.opcoes?.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={id}
                  inputMode={l.campo.tipo === 'numero' ? 'decimal' : 'text'}
                  value={valores[k] ?? ''}
                  onChange={(e) => setValores({ ...valores, [k]: e.target.value })}
                  placeholder="Em branco"
                />
              )}
              {l.campo.sugestoes && l.campo.sugestoes.length > 0 && !g && (
                <div className="rounded-md border border-dashed border-zinc-500/70 bg-zinc-500/10 p-2 text-xs text-zinc-300">
                  <p className="font-semibold">Sugestão · não é resposta e não entra nas contas até você gravar</p>
                  <ul className="mt-1 space-y-1">
                    {l.campo.sugestoes.map((sg, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={sg.origem === 'banco' ? 'text-emerald-300' : 'text-sky-300'}>
                          {sg.origem === 'banco' ? `O que o sistema vê hoje (lido em ${sg.lidoEm})` : `Da literatura [${sg.fontes}]`}
                        </span>
                        <span className="italic">{sg.texto}</span>
                        {sg.preencher != null && (
                          <button
                            type="button"
                            onClick={() => setValores({ ...valores, [k]: sg.preencher as string })}
                            className="rounded border border-zinc-500/70 px-1.5 py-px hover:text-foreground"
                          >
                            Usar esta sugestão
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {g && <span className="text-xs text-muted-foreground">Gravado por {g.gravado_por} em {quando(g.gravado_em)}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pendente}>
          {pendente ? 'Gravando…' : 'Gravar'}
        </Button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.texto}</span>}
      </div>
    </form>
  );
}
