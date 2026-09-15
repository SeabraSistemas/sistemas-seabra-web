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
import type { CategoriaCusto, Custo, DiaCompacto, TipoCusto } from '@/lib/fi-fcg/types';

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
 * Cadastro de custos (mensal/anual, com distribuição pelos meses) — aba
 * "Custos" do Financeiro, 15/09/2026. Primeira tela de escrita do FI_FCG:
 * formulário + tabela + gráfico mensal (o mesmo total que entra no Resumo)
 * + um cantinho pra gerenciar as categorias (adicionar/renomear/remover —
 * nasce só com "Geral", pro usuário aprender a agrupar aos poucos, não uma
 * lista pronta que ninguém escolheu).
 */
export function CustosPainel({
  custos,
  categorias,
  hoje,
  fazendas,
}: {
  custos: Custo[];
  categorias: CategoriaCusto[];
  hoje: DiaCompacto;
  fazendas: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaEditandoId, setCategoriaEditandoId] = useState<string | null>(null);
  const [nomeEdicaoCategoria, setNomeEdicaoCategoria] = useState('');

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
      setErro('Preencha descrição, valor (maior que zero) e data início.');
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

  async function adicionarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    const res = await fetch('/FI_FCG/api/categorias-custo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      setNovaCategoria('');
      router.refresh();
    }
  }

  async function salvarRenomeio(id: string) {
    const nome = nomeEdicaoCategoria.trim();
    if (!nome) return;
    const res = await fetch('/FI_FCG/api/categorias-custo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nome }),
    });
    if (res.ok) {
      setCategoriaEditandoId(null);
      router.refresh();
    }
  }

  async function excluirCategoria(id: string) {
    if (!confirm('Remover esta categoria? Custos já lançados com ela ficam mostrando "(categoria removida)".')) return;
    const res = await fetch('/FI_FCG/api/categorias-custo', {
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
            <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ração, mão de obra..." />
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

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Categorias</h3>
        <ul className="mb-3 flex flex-col gap-1.5">
          {categorias.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm">
              {categoriaEditandoId === c.id ? (
                <>
                  <Input
                    value={nomeEdicaoCategoria}
                    onChange={(e) => setNomeEdicaoCategoria(e.target.value)}
                    className="h-8 w-48"
                    autoFocus
                  />
                  <Button type="button" size="sm" onClick={() => salvarRenomeio(c.id)}>
                    Salvar
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCategoriaEditandoId(null)}>
                    <X className="size-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-foreground">{c.nome}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => {
                      setCategoriaEditandoId(c.id);
                      setNomeEdicaoCategoria(c.nome);
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
                    onClick={() => excluirCategoria(c.id)}
                    aria-label="Remover"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nova categoria..."
            className="h-8 w-48"
          />
          <Button type="button" size="sm" variant="outline" onClick={adicionarCategoria} className="gap-1.5">
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{custos.length} lançamentos</h2>
        <CsvExport columns={csvColunas} rows={custos} requiredKeys={['descricao']} filename="fi_fcg_custos" />
      </div>
      <DataTable columns={colunas} rows={custos} rowKey={(c) => c.id} />
    </div>
  );
}
