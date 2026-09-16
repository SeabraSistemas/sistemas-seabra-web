'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { SerieMensal } from '@/components/painel/SerieMensal';
import { CampoLabel, type InfoCampo } from '@/components/painel/CampoInfo';
import { diaParaInput, formatDia, formatMoeda } from '@/lib/painel/format';
import { custosMensais } from '@/lib/fi-fcg/custos';
import type { CategoriaCusto, Custo, DiaCompacto, TipoCusto } from '@/lib/fi-fcg/types';

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

const INFO_DESCRICAO: InfoCampo = {
  oQue: 'Nome curto do gasto — ex: Ração, Salários, Combustível, Manutenção.',
  ajuda: 'Identifica cada custo na lista e nos relatórios do Financeiro.',
  como: 'Digite um nome que descreva o gasto. Pode repetir o mesmo nome em meses diferentes.',
};
const INFO_CATEGORIA: InfoCampo = {
  oQue: 'Um agrupador pra custos parecidos (ex: Alimentação, Mão de obra, Sanidade).',
  ajuda: 'Permite comparar quanto você gasta em cada tipo de custo, não só o total.',
  como: 'Escolha uma categoria existente ou clique em "Novo" pra criar uma. Pode deixar sem categoria.',
};
const INFO_FAZENDA_CUSTO: InfoCampo = {
  oQue: 'A fazenda dona desse custo — Inhumas ou Campina grande.',
  ajuda: 'Faz o custo entrar certo no cálculo de custo por cabeça de CADA fazenda (aba Custo de formação), em vez de dividir errado entre as duas.',
  como: 'Selecione a fazenda. Campo obrigatório — todo custo é de uma fazenda específica.',
};
const INFO_TIPO_CUSTO: InfoCampo = {
  oQue: 'Mensal (se repete todo mês) ou Anual (vale só num período com início e fim).',
  ajuda: 'Define como o valor é distribuído no tempo pros gráficos e cálculos de custo diário.',
  como: 'Escolha Mensal pra gastos recorrentes (ex: salário). Escolha Anual pra um valor de um período fechado (ex: um contrato).',
};
const INFO_VALOR_CUSTO: InfoCampo = {
  oQue: 'O valor em reais do custo.',
  ajuda: 'Base de tudo: soma no total de custos e vira custo por dia/por cabeça nos cálculos.',
  como: 'Se o Tipo é Mensal, digite o valor de UM mês. Se é Anual, digite o valor TOTAL do período inteiro.',
};
const INFO_MES_CUSTO: InfoCampo = {
  oQue: 'O mês a partir de quando esse custo mensal passa a valer.',
  ajuda: 'Define de onde os gráficos e cálculos começam a contar esse gasto.',
  como: 'Escolha o mês/ano. O custo mensal fica valendo todo mês a partir daí, em aberto (sem data de fim).',
};
const INFO_DATA_INICIO_CUSTO: InfoCampo = {
  oQue: 'A data em que esse custo anual começa a valer.',
  ajuda: 'Define de onde os gráficos e cálculos começam a contar esse gasto.',
  como: 'Escolha a data de início do período (ex: início do contrato).',
};
const INFO_DATA_FIM_CUSTO: InfoCampo = {
  oQue: 'A data em que esse custo anual deixa de valer.',
  ajuda: 'Depois dessa data o custo para de contar nos cálculos.',
  como: 'Opcional — deixe em branco se o custo continua em aberto, sem data pra acabar.',
};
const INFO_OBSERVACAO_CUSTO: InfoCampo = {
  oQue: 'Um espaço livre pra qualquer anotação extra sobre esse custo.',
  ajuda: 'Só aparece na tabela detalhada — não entra em nenhum cálculo.',
  como: 'Opcional — preencha só se quiser deixar um lembrete ou detalhe.',
};

function nomeCategoria(id: string | null, categorias: CategoriaCusto[]): string {
  if (!id) return '—';
  return categorias.find((c) => c.id === id)?.nome ?? '(categoria removida)';
}

/**
 * Um campo de seleção que é AO MESMO TEMPO a lista gerenciável (adicionar/
 * renomear/remover) — estilo AppSheet: não existe tela/card separado só
 * pra gerenciar a lista, tudo acontece dentro do próprio popover do campo
 * (16/09/2026, pedido do Felipe). Hoje só a Categoria usa isto (Descrição
 * voltou a ser texto livre no mesmo dia — os 11 itens que tinham ido pra
 * Descrição eram na verdade categorias de gasto, foram remigrados pra cá).
 * `valorDoItem` decide se o valor selecionado é o `id` ou o `nome` — deixado
 * genérico porque é o mesmo componente que já serviu pra Descrição.
 */
function SelectGerenciavel({
  value,
  onValueChange,
  itens,
  valorDoItem,
  placeholder,
  novoPlaceholder,
  apiPath,
  avisoRemover,
  permiteVazio,
  onChanged,
}: {
  value: string;
  onValueChange: (v: string) => void;
  itens: { id: string; nome: string }[];
  valorDoItem: (it: { id: string; nome: string }) => string;
  placeholder: string;
  novoPlaceholder: string;
  apiPath: string;
  avisoRemover: string;
  permiteVazio?: boolean;
  onChanged: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');

  const rotuloAtual = itens.find((it) => valorDoItem(it) === value)?.nome ?? null;

  function selecionar(v: string) {
    onValueChange(v);
    setAberto(false);
  }

  async function adicionar() {
    const nome = novoNome.trim();
    if (!nome) return;
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      const { id } = (await res.json()) as { id: string };
      setNovoNome('');
      setAdicionando(false);
      onChanged();
      selecionar(valorDoItem({ id, nome }));
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
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span className={rotuloAtual ? 'truncate text-foreground' : 'truncate text-muted-foreground'}>
            {rotuloAtual ?? placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <ul className="flex max-h-72 flex-col divide-y divide-border/60 overflow-y-auto">
          {permiteVazio && (
            <li className="py-1.5 text-sm">
              <button type="button" className="w-full text-left text-muted-foreground hover:text-foreground" onClick={() => selecionar('')}>
                {placeholder}
              </button>
            </li>
          )}
          {itens.map((it) => (
            <li key={it.id} className="flex items-center gap-1.5 py-1.5 text-sm">
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
                  <button
                    type="button"
                    className="flex-1 truncate text-left text-foreground hover:text-primary"
                    onClick={() => selecionar(valorDoItem(it))}
                  >
                    {it.nome}
                  </button>
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
          <li className="py-1.5 text-sm">
            {adicionando ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder={novoPlaceholder}
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
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdicionando(true)}
                className="flex w-full items-center gap-1.5 rounded-md py-1 text-primary transition-colors hover:bg-accent"
              >
                <Plus className="size-3.5" />
                Novo
              </button>
            )}
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Cadastro de custos (mensal/anual, com distribuição pelos meses) — aba
 * "Custos" do Financeiro, 15/09/2026. Formulário + tabela + gráfico mensal
 * (o mesmo total que entra no Resumo). Categoria é um `SelectGerenciavel`
 * — não existe card/tela separado pra gerenciar a lista (removido em
 * 16/09, pedido do Felipe): adicionar/renomear/remover acontece dentro do
 * próprio popover do campo, estilo AppSheet. Descrição é texto livre.
 *
 * Fazenda é OBRIGATÓRIA (16/09/2026, reverte a decisão anterior de
 * "Geral" opcional) — todo custo é de uma fazenda específica, nunca da
 * operação inteira.
 *
 * Quando Tipo é "Mensal", só existe UM campo de data ("Mês do custo") —
 * vira `dataInicio`, e `dataFim` fica sempre em aberto (o custo mensal é
 * recorrente por natureza; se um dia precisar encerrar, edita o
 * lançamento). Anual continua com Data início/fim completas, porque um
 * custo anual normalmente TEM um intervalo definido (ex: um contrato).
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
    if (!form.descricao.trim() || !form.fazenda || !form.dataInicio || !Number.isFinite(valorNum) || valorNum <= 0) {
      setErro('Preencha descrição, fazenda, valor (maior que zero) e data.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const corpo = {
        descricao: form.descricao,
        categoria: form.categoria || null,
        fazenda: form.fazenda,
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
    { key: 'fazenda', header: 'Fazenda', cell: (c) => c.fazenda ?? '—', sortValue: (c) => c.fazenda },
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
    { key: 'fazenda', header: 'Fazenda', value: (c) => c.fazenda ?? '' },
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
            <CampoLabel texto="Descrição" info={INFO_DESCRICAO} />
            <Input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ração, mão de obra..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Categoria" info={INFO_CATEGORIA} />
            <SelectGerenciavel
              value={form.categoria}
              onValueChange={(v) => setForm({ ...form, categoria: v })}
              itens={categorias}
              valorDoItem={(it) => it.id}
              placeholder="Sem categoria"
              novoPlaceholder="Nova categoria..."
              apiPath="/FI_FCG/api/categorias-custo"
              avisoRemover='Remover esta categoria? Custos já lançados com ela ficam mostrando "(categoria removida)".'
              permiteVazio
              onChanged={() => router.refresh()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Fazenda" info={INFO_FAZENDA_CUSTO} />
            <Select value={form.fazenda || undefined} onValueChange={(v) => setForm({ ...form, fazenda: v })}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {fazendas.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Tipo" info={INFO_TIPO_CUSTO} />
            <Select
              value={form.tipo}
              onValueChange={(v) => setForm({ ...form, tipo: v as TipoCusto, dataFim: v === 'Mensal' ? '' : form.dataFim })}
            >
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
            <CampoLabel texto="Valor (R$)" info={INFO_VALOR_CUSTO} />
            <Input inputMode="decimal" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="15000" />
          </div>
          {form.tipo === 'Mensal' ? (
            <div className="flex flex-col gap-1">
              <CampoLabel texto="Mês do custo" info={INFO_MES_CUSTO} />
              <Input
                type="month"
                value={form.dataInicio.slice(0, 7)}
                onChange={(e) => setForm({ ...form, dataInicio: e.target.value ? `${e.target.value}-01` : '', dataFim: '' })}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <CampoLabel texto="Data início" info={INFO_DATA_INICIO_CUSTO} />
                <Input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <CampoLabel texto="Data fim (opcional — em aberto se vazio)" info={INFO_DATA_FIM_CUSTO} />
                <Input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
            <CampoLabel texto="Observação" info={INFO_OBSERVACAO_CUSTO} />
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

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{custos.length} lançamentos</h2>
        <CsvExport columns={csvColunas} rows={custos} requiredKeys={['descricao']} filename="fi_fcg_custos" />
      </div>
      <DataTable columns={colunas} rows={custos} rowKey={(c) => c.id} />
    </div>
  );
}
