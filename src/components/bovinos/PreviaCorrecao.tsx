'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CATALOGO } from '@/lib/bovinos/catalogo';
import { decodificarLote, tamanhoLote, type OpLote } from '@/lib/bovinos/lote';
import type { ResultadoLote } from '@/lib/bovinos/escrita';

export interface EstadoPrevia {
  token: string | null;
  recusados: { id: string; motivo: string }[];
}

function linhaOp(o: OpLote): string {
  if (o.tipo === 'valor') return `${o.aba} L${o.linha} · ${o.col}: "${o.de || '(vazio)'}" → "${o.para || '(vazio)'}"`;
  if (o.tipo === 'formula') return `${o.aba} L${o.linha} · ${o.col}: copiar a fórmula da linha ${o.doadora}`;
  return `${o.aba}: EXCLUIR a linha ${o.linha} (entre ${o.acima || '—'} e ${o.abaixo || '—'})`;
}

/**
 * Prévia → confirmar → gravar → resultado. A lista desenhada vem de DENTRO
 * do token assinado (decodificarLote), então é exatamente o que o servidor
 * aceita gravar — nada é recalculado entre o que aparece e o que grava.
 */
export function PreviaCorrecao({ previa, onFechar }: { previa: EstadoPrevia | null; onFechar: () => void }) {
  const router = useRouter();
  const lote = useMemo(() => (previa?.token ? decodificarLote(previa.token) : null), [previa]);
  const [gravando, setGravando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoLote | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function gravar() {
    if (!previa?.token) return;
    setGravando(true);
    setErro(null);
    try {
      const r = await fetch('/bovinos/api/gravar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: previa.token }) });
      const j = await r.json();
      if (j && typeof j.aplicados === 'number') setResultado(j as ResultadoLote);
      else setErro(j?.erro ?? `Falha (${r.status}).`);
    } catch {
      setErro('Falha de rede ao gravar.');
    } finally {
      setGravando(false);
    }
  }

  function fechar() {
    const gravou = (resultado?.aplicados ?? 0) > 0;
    setResultado(null);
    setErro(null);
    onFechar();
    if (gravou) {
      const url = new URL(window.location.href);
      url.searchParams.set('fresco', String(Date.now()));
      router.push(`${url.pathname}${url.search}`);
    }
  }

  const n = lote ? tamanhoLote(lote) : 0;
  const exclusao = lote?.tipo === 'exclusao';

  return (
    <Sheet open={previa !== null} onOpenChange={(o) => !o && !gravando && fechar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{resultado ? 'Resultado' : 'Prévia da correção'}</SheetTitle>
          <SheetDescription>
            {resultado
              ? `Lote ${lote?.idLote ?? ''}`
              : lote
                ? `${lote.itens.length} problema(s), ${n} ${exclusao ? 'linha(s) a excluir' : 'alteração(ões)'} na planilha. Nada foi gravado ainda.`
                : 'Nenhum dos problemas escolhidos pode ser corrigido agora.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 text-sm">
          {resultado ? (
            <>
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${resultado.ok ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>
                {resultado.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
                <div>
                  <p>
                    {resultado.aplicados} alteração(ões) gravada(s) em {resultado.itensAplicados} problema(s); {resultado.verificacao.conferidos} conferida(s) na releitura.
                  </p>
                  {resultado.erro && <p className="mt-1">{resultado.erro}</p>}
                </div>
              </div>
              {resultado.pulados.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-400">Pulados (a planilha mudou desde a prévia)</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    {resultado.pulados.map((p) => (
                      <li key={p.problemaId}>
                        <span className="font-mono text-xs">{p.animal || '—'}</span> — {p.motivo}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {resultado.verificacao.divergencias.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">Divergências na releitura</h3>
                  <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
                    {resultado.verificacao.divergencias.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </section>
              )}
              <p className="text-xs text-muted-foreground">
                Valor anterior de cada célula registrado na aba LOG_SEABRA da planilha. Peça para a fazenda sincronizar os celulares antes de editar esses animais — um aparelho com cópia antiga regrava a linha inteira e desfaz a correção.
              </p>
            </>
          ) : (
            <>
              {lote && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Antes de gravar, cada célula é relida: se o valor não for mais o &quot;de&quot; mostrado aqui, aquele problema é pulado inteiro.
                  {exclusao && ' Excluir linha não tem volta pelo app — o conteúdo fica só no LOG_SEABRA.'}
                </div>
              )}
              {lote?.itens.map((i) => (
                <div key={i.problemaId} className="rounded-lg border border-border px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {CATALOGO[i.regra].titulo}
                    {i.animal ? <span className="ml-2 font-mono text-foreground">{i.animal}</span> : null}
                  </p>
                  <ul className="mt-1 space-y-0.5 font-mono text-xs">
                    {i.ops.slice(0, 20).map((o, k) => (
                      <li key={k}>{linhaOp(o)}</li>
                    ))}
                    {i.ops.length > 20 && <li className="text-muted-foreground">… e mais {i.ops.length - 20}</li>}
                  </ul>
                </div>
              ))}
              {previa && previa.recusados.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fora do lote</h3>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {previa.recusados.slice(0, 50).map((r) => (
                      <li key={r.id}>{r.motivo}</li>
                    ))}
                  </ul>
                </section>
              )}
              {erro && <p className="text-sm text-destructive">{erro}</p>}
            </>
          )}
        </div>

        <SheetFooter>
          {resultado ? (
            <Button className="w-full" onClick={fechar}>
              Fechar e ler a planilha de novo
            </Button>
          ) : (
            <>
              <Button className="w-full gap-1.5" onClick={gravar} disabled={!lote || gravando} variant={exclusao ? 'destructive' : 'default'}>
                {gravando && <Loader2 className="size-4 animate-spin" />}
                {gravando ? 'Gravando…' : exclusao ? `Excluir ${n} linha(s)` : `Gravar ${n} alteração(ões)`}
              </Button>
              <Button className="w-full" variant="outline" onClick={fechar} disabled={gravando}>
                Cancelar
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
