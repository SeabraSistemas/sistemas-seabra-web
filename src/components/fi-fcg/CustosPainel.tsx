'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { SerieMensal } from '@/components/painel/SerieMensal';
import { diaParaInput, formatDia, formatMoeda } from '@/lib/painel/format';
import { custosMensais } from '@/lib/fi-fcg/custos';
import type { CategoriaCusto, Custo, DescricaoCusto, DiaCompacto, TipoCusto } from '@/lib/fi-fcg/types';

const FAZENDA_GERAL = 'Geral';

const FORM_VAZIO = {
  descricao: '',
  categoria: '',
  fazenda: '',
  tipo: 'Mensal' as TipoCusto,
  valor: '',
  dataInicio: '',
  dataFim: '',
  observacao: '',
};

function nomeCategoria(id: string | null, categorias: CategoriaCusto[]): string {
  if (!id) return '—';
  return categorias.find((c) => c.id === id)?.nome ?? '(categoria removida)';
}

/**
 * Uma lista editável genérica (adicionar/renomear/remover), o mesmo
 * comportamento pra Categorias e Descrições de custo — cada uma é uma aba
 * própria na planilha ({ID, Nome}), gerenciada por `apiPath`.
 */
function ListaGerenciavel({
  titulo,
  itens,
  apiPath,
  placeholder,
  avisoRemover,
  onChanged,
}: {
  titulo: string;
  itens: { id: string; nome: string }[];
  apiPath: string;
  placeholder: string;
  avisoRemover: string;
  onChanged: () => void;
}) {
  const [novoNome, setNovoNome] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');

  async function adicionar() {
    const nome = novoNome.trim();
    if (!nome) return;
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      setNovoNome('');
      setAdicionando(false);
      onChanged();
    }
  }

  async function salvarRenomeio(id: string) {
    const nome = nomeEdicao.trim();
    if (!nome) return;
    const res = await fetch(apiPath, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nome }),
    });
    if (res.ok) {
      setEditandoId(null);
      onChanged();
    }
  }

  async function excluir(id: string) {
    if (!confirm(avisoRemover)) return;
    const res = await fetch(apiPath, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{titulo}</h3>
      <ul className="flex flex-col divide-y divide-border/60">
        {itens.map((it) => (
          <li key={it.id} className="flex items-center gap-2 py-2 text-sm first:pt-0">
            {editandoId === it.id ? (
              <>
                <Input value={nomeEdicao} onChange={(e) => setNomeEdicao(e.target.value)} className="h-8 flex-1" autoFocus />
                <Button type="button" size="sm" onClick={() => salvarRenomeio(it.id)}>
                  Salvar
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
                  <X className="size-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">{it.nome}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => {
                    setEditandoId(it.id);
                    setNomeEdicao(it.nome);
                  }}
                  aria-label="Renomear"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive"
                  onClick={() => excluir(it.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="size-3" />
                </Button>
              </>
            )}
          </li>
        ))}
        <li className="flex items-center gap-2 py-2 text-sm first:pt-0">
          {adicionando ? (
            <>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder={placeholder}
                className="h-8 flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && adicionar()}
              />
              <Button type="button" size="sm" onClick={adicionar}>
                Salvar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdicionando(false);
                  setNovoNome('');
                }}
              >
                <X className="size-3.5" />
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              className="flex w-full items-center gap-1.5 rounded-md py-1 text-sm text-primary transition-colors hover:bg-accent"
            >
              <Plus className="size-3.5" />
              Novo
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}

/**
 * Cadastro de custos (mensal/anual, com distribuição pelos meses) — aba
 * "Custos" do Financeiro, 15/09/2026. Primeira tela de escrita do FI_FCG:
 * formulário + tabela + gráfico mensal (o mesmo total que entra no Resumo)
 * + um cantinho pra gerenciar Categorias e Descrições (adicionar/renomear/
 * remover — Categorias nasce só com "Geral", Descrições já nasce com uma
 * lista inicial pedida pelo Felipe, 16/09).
 */
export function CustosPainel({
  custos,
  categorias,
  descricoes,
  hoje,
  fazendas,
}: {
  custos: Custo[];
  categorias: CategoriaCusto[];
  descricoes: DescricaoCusto[];
  hoje: DiaCompacto;
  fazendas: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const opcoesFazenda = useMemo(() => [FAZENDA_GERAL, ...fazendas.filter((f) => f !== FAZENDA_GERAL)], [fazendas]);
  const serieCustos = useMemo(() => custosMensais(custos, hoje), [custos, hoje]);

  function iniciarEdicao(c: Custo) {
    setErro(null);
    setEditandoId(c.id);
    setForm({
      descricao: c.descricao ?? '',
      categoria: c.categoria ?? '',
      fazenda: c.fazenda ?? '',
      tipo: c.tipo ?? 'Mensal',
      valor: c.valor != null ? String(c.valor) : '',
      dataInicio: diaParaInput(c.dataInicio),
      dataFim: diaParaInput(c.dataFim),
      observacao: c.observacao ?? '',
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro(null);
  }

  async function salvar() {
    const valorNum = Number(form.valor.replace(',', '.'));
    if (!form.descricao.trim() || !form.dataInicio || !Number.isFinite(valorNum) || valorNum <= 0) {
      setErro('Selecione a descrição, e preencha valor (maior que zero) e data início.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const corpo = {
        descricao: form.descricao,
        categoria: form.categoria || null,
        fazenda: form.fazenda || null,
        tipo: form.tipo,
        valor: valorNum,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || null,
        observacao: form.observacao || null,
      };
      const res = await fetch('/FI_FCG/api/custos', {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoId ? { id: editandoId, ...corpo } : corpo),
      });
      if (!res.ok) {
        setErro('Não foi possível salvar — tenta de novo.');
        return;
      }
      cancelarEdicao();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Apagar este custo?')) return;
    const res = await fetch('/FI_FCG/api/custos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) router.refresh();
  }

  const colunas: DataTableColumn<Custo>[] = [
    { key: 'descricao', header: 'Descrição', cell: (c) => c.descricao ?? '—', sortValue: (c) => c.descricao },
    { key: 'categoria', header: 'Categoria', cell: (c) => nomeCategoria(c.categoria, categorias), sortValue: (c) => nomeCategoria(c.categoria, categorias) },
    { key: 'fazenda', header: 'Fazenda', cell: (c) => c.fazenda ?? FAZENDA_GERAL, sortValue: (c) => c.fazenda },
    { key: 'tipo', header: 'Tipo', cell: (c) => c.tipo ?? '—', sortValue: (c) => c.tipo },
    { key: 'valor', header: 'Valor', cell: (c) => formatMoeda(c.valor), sortValue: (c) => c.valor },
    { key: 'inicio', header: 'Data início', cell: (c) => formatDia(c.dataInicio), sortValue: (c) => c.dataInicio },
    { key: 'fim', header: 'Data fim', cell: (c) => (c.dataFim != null ? formatDia(c.dataFim) : 'Em aberto'), sortValue: (c) => c.dataFim },
    {
      key: 'acoes',
      header: '',
      cell: (c) => (
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => iniciarEdicao(c)} aria-label="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => excluir(c.id)} aria-label="Apagar">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const csvColunas: CsvColumn<Custo>[] = [
    { key: 'descricao', header: 'Descrição', value: (c) => c.descricao ?? '' },
    { key: 'categoria', header: 'Categoria', value: (c) => nomeCategoria(c.categoria, categorias) },
    { key: 'fazenda', header: 'Fazenda', value: (c) => c.fazenda ?? FAZENDA_GERAL },
    { key: 'tipo', header: 'Tipo', value: (c) => c.tipo ?? '' },
    { key: 'valor', header: 'Valor', value: (c) => formatMoeda(c.valor) },
    { key: 'inicio', header: 'Data início', value: (c) => formatDia(c.dataInicio) },
    { key: 'fim', header: 'Data fim', value: (c) => (c.dataFim != null ? formatDia(c.dataFim) : 'Em aberto') },
    { key: 'obs', header: 'Observação', value: (c) => c.observacao ?? '' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Custo por mês (a mesma distribuição do Resumo)</h3>
        <SerieMensal series={[{ chave: 'custos', nome: 'Custos', cor: '#c98500', pontos: serieCustos }]} formatoValor={formatMoeda} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">{editandoId ? 'Editar custo' : 'Novo custo'}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Descrição</span>
            <Select value={form.descricao || undefined} onValueChange={(v) => setForm({ ...form, descricao: v })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {descricoes.map((d) => (
                  <SelectItem key={d.id} value={d.nome}>
                    {d.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Categoria</span>
            <Select value={form.categoria || undefined} onValueChange={(v) => setForm({ ...form, categoria: v })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Sem categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Fazenda</span>
            <Select value={form.fazenda || FAZENDA_GERAL} onValueChange={(v) => setForm({ ...form, fazenda: v === FAZENDA_GERAL ? '' : v })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcoesFazenda.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Tipo</span>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as TipoCusto })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mensal">Mensal</SelectItem>
                <SelectItem value="Anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Valor (R$)</span>
            <Input inputMode="decimal" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="15000" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Data início</span>
            <Input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Data fim (opcional — em aberto se vazio)</span>
            <Input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
            <span className="text-xs text-muted-foreground">Observação</span>
            <Input value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
          </div>
        </div>

        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}

        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={salvar} disabled={salvando} className="gap-1.5">
            <Plus className="size-4" />
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Adicionar custo'}
          </Button>
          {editandoId && (
            <Button type="button" variant="outline" onClick={cancelarEdicao} disabled={salvando}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ListaGerenciavel
          titulo="Categorias"
          itens={categorias}
          apiPath="/FI_FCG/api/categorias-custo"
          placeholder="Nova categoria..."
          avisoRemover='Remover esta categoria? Custos já lançados com ela ficam mostrando "(categoria removida)".'
          onChanged={() => router.refresh()}
        />
        <ListaGerenciavel
          titulo="Descrições"
          itens={descricoes}
          apiPath="/FI_FCG/api/descricoes-custo"
          placeholder="Nova descrição..."
          avisoRemover="Remover esta descrição da lista? Custos já lançados com ela mantêm o texto — só some das opções pra escolher em novos custos."
          onChanged={() => router.refresh()}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{custos.length} lançamentos</h2>
        <CsvExport columns={csvColunas} rows={custos} requiredKeys={['descricao']} filename="fi_fcg_custos" />
      </div>
      <DataTable columns={colunas} rows={custos} rowKey={(c) => c.id} />
    </div>
  );
}
