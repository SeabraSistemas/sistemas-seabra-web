'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { FilePlus2, FileDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATALOGO, type ItemCatalogo } from '@/data/orcamentos';
import { brl, numeroCampo, tituloArquivo, totais, totalItem, type Item } from '@/lib/orcamentos/valores';
import { carregar, novoId, proximo, salvar, type Orcamento } from './estado';
import { Folha } from './Folha';
import './orcamento.css';

const cartao = 'rounded-2xl border border-border bg-card p-4 sm:p-5';
const rotulo = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
const areaTexto =
  'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30';

const semAssinatura = () => () => {};

/** Espera o navegador: o rascunho mora no localStorage, que o servidor não tem. */
export function Orcamentos() {
  const pronto = useSyncExternalStore(semAssinatura, () => true, () => false);
  if (!pronto) return <main className="p-6 text-sm text-muted-foreground">Carregando…</main>;
  return <Editor />;
}

function Editor() {
  const [o, setO] = useState<Orcamento>(carregar);
  const [focar, setFocar] = useState<string | null>(null);

  useEffect(() => salvar(o), [o]);
  useEffect(() => {
    if (!focar) return;
    const el = document.querySelector<HTMLInputElement>(`[data-qtd="${focar}"]`);
    el?.focus();
    el?.select();
  }, [focar]);

  const mudar = <K extends keyof Orcamento>(k: K, v: Orcamento[K]) => setO((a) => ({ ...a, [k]: v }));
  const mudarItem = (id: string, parte: Partial<Item>) =>
    setO((a) => ({ ...a, itens: a.itens.map((i) => (i.id === id ? { ...i, ...parte } : i)) }));

  function adicionar(c?: ItemCatalogo) {
    const id = novoId();
    const item: Item = c
      ? { id, nome: c.nome, detalhe: c.detalhe, qtd: '1', valor: c.valor ? numeroCampo(c.valor) : '' }
      : { id, nome: '', detalhe: '', qtd: '1', valor: '' };
    setO((a) => ({ ...a, itens: [...a.itens, item] }));
    setFocar(id);
  }

  function gerarPdf() {
    const antes = document.title;
    document.title = tituloArquivo(o.numero, o.cliente);
    window.addEventListener(
      'afterprint',
      () => {
        document.title = antes;
      },
      { once: true },
    );
    window.print();
  }

  function novo() {
    const temConteudo = o.cliente.trim() || o.itens.length > 0;
    if (temConteudo && !window.confirm('Começar um orçamento novo? O atual será apagado desta tela.')) return;
    setO(proximo(o));
  }

  const t = totais(o.itens, o.desconto);

  return (
    <div className="orc-raiz lg:grid lg:h-screen lg:grid-cols-[minmax(380px,460px)_1fr]">
      <main className="orc-nao-imprime flex flex-col gap-4 px-4 py-6 lg:overflow-y-auto">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-3xl">Orçamentos</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={novo}>
              <FilePlus2 /> Novo
            </Button>
            <Button onClick={gerarPdf}>
              <FileDown /> Gerar PDF
            </Button>
          </div>
        </header>

        <section className={cartao}>
          <p className={rotulo}>Cliente</p>
          <div className="mt-3 grid gap-2">
            <Input placeholder="Nome ou razão social" value={o.cliente} onChange={(e) => mudar('cliente', e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="CNPJ ou CPF" value={o.documento} onChange={(e) => mudar('documento', e.target.value)} />
              <Input placeholder="Cidade/UF ou endereço" value={o.endereco} onChange={(e) => mudar('endereco', e.target.value)} />
            </div>
            <Input placeholder="Contato (nome, telefone, e-mail)" value={o.contato} onChange={(e) => mudar('contato', e.target.value)} />
          </div>
        </section>

        <section className={cartao}>
          <p className={rotulo}>Adicionar item</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATALOGO.map((c) => (
              <button
                key={c.nome}
                type="button"
                onClick={() => adicionar(c)}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {c.curto}
              </button>
            ))}
            <button
              type="button"
              onClick={() => adicionar()}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3" /> Outro
            </button>
          </div>

          {o.itens.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {o.itens.map((i) => (
                <li key={i.id} className="rounded-xl border border-border p-3">
                  <div className="flex gap-2">
                    <Input
                      aria-label="Descrição"
                      placeholder="Descrição"
                      value={i.nome}
                      onChange={(e) => mudarItem(i.id, { nome: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover item"
                      onClick={() => setO((a) => ({ ...a, itens: a.itens.filter((x) => x.id !== i.id) }))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <Input
                    aria-label="Detalhe"
                    placeholder="Detalhe (opcional)"
                    className="mt-2 h-8 text-xs md:text-xs"
                    value={i.detalhe}
                    onChange={(e) => mudarItem(i.id, { detalhe: e.target.value })}
                  />
                  <div className="mt-2 grid grid-cols-[5rem_1fr_auto] items-center gap-2">
                    <Input
                      aria-label="Quantidade"
                      data-qtd={i.id}
                      inputMode="decimal"
                      value={i.qtd}
                      onChange={(e) => mudarItem(i.id, { qtd: e.target.value })}
                      className="text-center tabular-nums"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        aria-label="Valor unitário"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={i.valor}
                        onChange={(e) => mudarItem(i.id, { valor: e.target.value })}
                        className="pl-9 tabular-nums"
                      />
                    </div>
                    <span className="min-w-24 text-right text-sm font-semibold tabular-nums">{brl(totalItem(i))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Desconto R$
              <Input
                inputMode="decimal"
                placeholder="0,00"
                value={o.desconto}
                onChange={(e) => mudar('desconto', e.target.value)}
                className="h-8 w-28 tabular-nums"
              />
            </label>
            <p className="text-right">
              <span className={rotulo}>Total</span>
              <span className="block text-xl font-semibold tabular-nums">{brl(t.total)}</span>
            </p>
          </div>
        </section>

        <section className={cartao}>
          <p className={rotulo}>Documento e condições</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Campo nome="Nº">
              <Input value={o.numero} onChange={(e) => mudar('numero', e.target.value)} />
            </Campo>
            <Campo nome="Data">
              <Input type="date" value={o.data} onChange={(e) => mudar('data', e.target.value)} />
            </Campo>
            <Campo nome="Validade (dias)">
              <Input inputMode="numeric" value={o.validadeDias} onChange={(e) => mudar('validadeDias', e.target.value)} />
            </Campo>
          </div>
          <div className="mt-2 grid gap-2">
            <Campo nome="Pagamento">
              <Input value={o.pagamento} onChange={(e) => mudar('pagamento', e.target.value)} />
            </Campo>
            <Campo nome="Prazo de entrega">
              <Input placeholder="Ex.: envio em até 5 dias úteis" value={o.prazo} onChange={(e) => mudar('prazo', e.target.value)} />
            </Campo>
            <Campo nome="Observações">
              <textarea rows={3} className={areaTexto} value={o.observacoes} onChange={(e) => mudar('observacoes', e.target.value)} />
            </Campo>
          </div>
        </section>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Salvo automaticamente neste navegador. Em &ldquo;Gerar PDF&rdquo;, escolha <b>Salvar como PDF</b> como destino.
        </p>
      </main>

      <div className="orc-palco overflow-x-auto bg-muted/40 px-4 py-6 lg:overflow-y-auto lg:py-8">
        <div className="mx-auto w-fit">
          <Folha o={o} />
        </div>
      </div>
    </div>
  );
}

function Campo({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-muted-foreground">{nome}</span>
      {children}
    </label>
  );
}
