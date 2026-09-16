'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { formatMoeda, formatNumber } from '@/lib/painel/format';
import type { FunilCalculado, RetratoCategoria } from '@/lib/fi-fcg/custoFormacao';
import type { GmdCategoria, Insumo, ItemDieta, MarcoIdade } from '@/lib/fi-fcg/types';

/**
 * Mesma ordem das 7 linhas semeadas em "GMD por Categoria" (mutations.ts,
 * criação da aba) — as categorias do funil bovino (ver custoFormacao.ts).
 */
const CATEGORIAS_FUNIL = ['Bezerro', 'Bezerra', 'Garrote', 'Novilha', 'Boi', 'Vaca', 'Touro'];

/**
 * Aba "Custo de formação" do Financeiro (16/09/2026) — réplica adaptada do
 * motor do seabra-app-main (ver custoFormacao.ts pro porquê e a fórmula).
 * 4 seções: o resultado do funil (por Fazenda), e os 3 cadastros que
 * alimentam ele (GMD por Categoria, Insumos, Dieta por Categoria).
 */
export function CustoFormacaoPainel({
  fazendas,
  funisPorFazenda,
  retratoPorFazenda,
  gmdCategoria,
  gmdSugerido,
  marcosIdade,
  insumos,
  dieta,
}: {
  fazendas: string[];
  funisPorFazenda: { fazenda: string | null; funis: FunilCalculado[] }[];
  retratoPorFazenda: { fazenda: string | null; retrato: RetratoCategoria[] }[];
  gmdCategoria: GmdCategoria[];
  gmdSugerido: [string, number][];
  marcosIdade: MarcoIdade[];
  insumos: Insumo[];
  dieta: ItemDieta[];
}) {
  const router = useRouter();
  const [fazendaSelecionada, setFazendaSelecionada] = useState<string | null>(null);
  const funis = funisPorFazenda.find((f) => f.fazenda === fazendaSelecionada)?.funis ?? [];
  const retrato = retratoPorFazenda.find((f) => f.fazenda === fazendaSelecionada)?.retrato ?? [];
  const sugestaoPorCategoria = useMemo(() => new Map(gmdSugerido), [gmdSugerido]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={fazendaSelecionada === null ? 'default' : 'outline'}
          onClick={() => setFazendaSelecionada(null)}
        >
          Consolidado
        </Button>
        {fazendas.map((f) => (
          <Button
            type="button"
            key={f}
            size="sm"
            variant={fazendaSelecionada === f ? 'default' : 'outline'}
            onClick={() => setFazendaSelecionada(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Retrato do momento</h2>
        <p className="text-xs text-muted-foreground">
          Idade real de cada animal (nascimento até hoje) × custo diário atual da categoria — não depende de GMD nem de cadeia.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {retrato.map((r) => (
            <RetratoCard key={r.categoria} retrato={r} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Funil acumulado (peso/GMD)</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {funis.map((funil) => (
            <FunilCard key={funil.nome} funil={funil} />
          ))}
        </div>
      </section>

      <MarcosIdadeSecao marcosIdade={marcosIdade} onChanged={() => router.refresh()} />

      <GmdCategoriaSecao
        gmdCategoria={gmdCategoria}
        sugestaoPorCategoria={sugestaoPorCategoria}
        onChanged={() => router.refresh()}
      />

      <InsumosSecao insumos={insumos} onChanged={() => router.refresh()} />

      <DietaSecao dieta={dieta} insumos={insumos} onChanged={() => router.refresh()} />
    </div>
  );
}

function RetratoCard({ retrato }: { retrato: RetratoCategoria }) {
  const arrobaReal = retrato.pesoMedioKg != null ? retrato.pesoMedioKg / 15 : null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{retrato.categoria}</h3>
        <span className="text-xs text-muted-foreground">{formatNumber(retrato.efetivo)} cabeças</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Idade média: {retrato.idadeMediaDias != null ? `${formatNumber(retrato.idadeMediaDias)} dias` : '—'}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-y-3 text-xs">
        <div>
          <p className="text-muted-foreground">Custo/dia (dieta+fixo)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoTotalDia)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Acumulado até hoje</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoAcumuladoHoje)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Custo por @ (real)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoPorArrobaReal)}</p>
          {arrobaReal != null && <p className="text-muted-foreground">{formatNumber(arrobaReal)}@ reais</p>}
        </div>
        <div>
          <p className="text-muted-foreground">Custo por @ (referência)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoPorArrobaReferencia)}</p>
          {retrato.arrobaReferencia != null && <p className="text-muted-foreground">{formatNumber(retrato.arrobaReferencia)}@ Categoria@</p>}
        </div>
      </div>
      {retrato.marcos.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-2 text-xs">
          {retrato.marcos.map((m) => (
            <div key={m.nome} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {m.nome.replace(`${retrato.categoria} -> `, '')} ({formatNumber(m.idadeDias)}d)
              </span>
              <span className="tabular-nums text-foreground">{formatMoeda(m.custoAcumulado)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarcosIdadeSecao({ marcosIdade, onChanged }: { marcosIdade: MarcoIdade[]; onChanged: () => void }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  async function salvar(m: MarcoIdade) {
    const bruto = valores[m.id];
    const num = Number((bruto ?? '').replace(',', '.'));
    if (!Number.isFinite(num) || num <= 0) return;
    setSalvandoId(m.id);
    try {
      const res = await fetch('/FI_FCG/api/marcos-idade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, idadeDias: num }),
      });
      if (res.ok) onChanged();
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">Idades por Marco (dias)</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {marcosIdade.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">{m.marco}</p>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={valores[m.id] ?? (m.idadeDias != null ? String(m.idadeDias) : '')}
                onChange={(e) => setValores((v) => ({ ...v, [m.id]: e.target.value }))}
                placeholder="dias"
                className="h-8"
                inputMode="numeric"
              />
              <Button type="button" size="sm" disabled={salvandoId === m.id} onClick={() => salvar(m)}>
                Salvar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FunilCard({ funil }: { funil: FunilCalculado }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground">{funil.nome}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {funil.fases.map((fase) => (
          <div key={fase.categoria} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 text-xs last:border-0">
            <div>
              <p className="font-medium text-foreground">{fase.categoria}</p>
              <p className="text-muted-foreground">
                {fase.dias != null ? `${formatNumber(fase.dias)} dias` : '—'}
                {fase.pesoInicialKg != null && fase.pesoFinalKg != null && fase.pesoInicialKg !== fase.pesoFinalKg
                  ? ` · ${formatNumber(fase.pesoInicialKg)} → ${formatNumber(fase.pesoFinalKg)} kg`
                  : ''}
              </p>
            </div>
            <p className="tabular-nums text-foreground">{fase.custoFase != null ? formatMoeda(fase.custoFase) : '—'}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">Custo por @ formada</span>
        <span className="text-xl font-semibold tabular-nums text-foreground">
          {funil.custoPorArroba != null ? formatMoeda(funil.custoPorArroba) : '—'}
        </span>
      </div>
      {funil.custoTotal == null && (
        <p className="mt-1 text-xs text-amber-400">Falta GMD de alguma categoria da cadeia — ver seção GMD por Categoria.</p>
      )}
    </div>
  );
}

function GmdCategoriaSecao({
  gmdCategoria,
  sugestaoPorCategoria,
  onChanged,
}: {
  gmdCategoria: GmdCategoria[];
  sugestaoPorCategoria: Map<string, number>;
  onChanged: () => void;
}) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  async function salvar(g: GmdCategoria) {
    const bruto = valores[g.id];
    const num = Number((bruto ?? '').replace(',', '.'));
    if (!Number.isFinite(num) || num <= 0) return;
    setSalvandoId(g.id);
    try {
      const res = await fetch('/FI_FCG/api/gmd-categoria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: g.id, gmdKgDia: num }),
      });
      if (res.ok) onChanged();
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">GMD por Categoria (kg/dia)</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIAS_FUNIL.map((categoria) => {
          const g = gmdCategoria.find((x) => x.categoria === categoria);
          if (!g) return null;
          const sugestao = sugestaoPorCategoria.get(categoria) ?? null;
          const valorAtual = valores[g.id] ?? (g.gmdKgDia != null ? String(g.gmdKgDia) : '');
          return (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">{categoria}</p>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  value={valorAtual}
                  onChange={(e) => setValores((v) => ({ ...v, [g.id]: e.target.value }))}
                  placeholder={sugestao != null ? formatNumber(sugestao) : '0,0'}
                  className="h-8"
                  inputMode="decimal"
                />
                <Button type="button" size="sm" disabled={salvandoId === g.id} onClick={() => salvar(g)}>
                  Salvar
                </Button>
              </div>
              {g.gmdKgDia == null && sugestao != null && (
                <p className="mt-1 text-xs text-muted-foreground">Sugestão (média real): {formatNumber(sugestao)}</p>
              )}
              {g.gmdKgDia == null && sugestao == null && (
                <p className="mt-1 text-xs text-amber-400">Sem dado real — preencha manualmente.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsumosSecao({ insumos, onChanged }: { insumos: Insumo[]; onChanged: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [valorKg, setValorKg] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function limpar() {
    setNome('');
    setTipo('');
    setValorKg('');
    setEditandoId(null);
    setErro(null);
  }

  function iniciarEdicao(i: Insumo) {
    setEditandoId(i.id);
    setNome(i.nome);
    setTipo(i.tipo ?? '');
    setValorKg(i.valorKg != null ? String(i.valorKg) : '');
    setErro(null);
  }

  async function salvar() {
    const valorNum = Number(valorKg.replace(',', '.'));
    if (!nome.trim() || !Number.isFinite(valorNum) || valorNum <= 0) {
      setErro('Preencha nome e valor por kg (maior que zero).');
      return;
    }
    setSalvando(true);
    try {
      const corpo = { nome, tipo: tipo || null, valorKg: valorNum };
      const res = await fetch('/FI_FCG/api/insumos', {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoId ? { id: editandoId, ...corpo } : corpo),
      });
      if (!res.ok) {
        setErro('Não foi possível salvar — tenta de novo.');
        return;
      }
      limpar();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Apagar este insumo?')) return;
    const res = await fetch('/FI_FCG/api/insumos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) onChanged();
  }

  const colunas: DataTableColumn<Insumo>[] = [
    { key: 'nome', header: 'Nome', cell: (i) => i.nome, sortValue: (i) => i.nome },
    { key: 'tipo', header: 'Tipo', cell: (i) => i.tipo ?? '—', sortValue: (i) => i.tipo },
    { key: 'valor', header: 'Valor/kg', cell: (i) => formatMoeda(i.valorKg), sortValue: (i) => i.valorKg },
    {
      key: 'acoes',
      header: '',
      cell: (i) => (
        <span className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => iniciarEdicao(i)} aria-label="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive"
            onClick={() => excluir(i.id)}
            aria-label="Apagar"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">Insumos</h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input placeholder="Tipo (opcional)" value={tipo} onChange={(e) => setTipo(e.target.value)} />
          <Input placeholder="Valor por kg" inputMode="decimal" value={valorKg} onChange={(e) => setValorKg(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" onClick={salvar} disabled={salvando} className="flex-1">
              {editandoId ? 'Salvar alterações' : 'Adicionar'}
            </Button>
            {editandoId && (
              <Button type="button" variant="ghost" size="icon" onClick={limpar} aria-label="Cancelar">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
      </div>
      <DataTable columns={colunas} rows={insumos} rowKey={(i) => i.id} />
    </section>
  );
}

function DietaSecao({ dieta, insumos, onChanged }: { dieta: ItemDieta[]; insumos: Insumo[]; onChanged: () => void }) {
  const router = useRouter();
  const [categoria, setCategoria] = useState('');
  const [insumo, setInsumo] = useState('');
  const [kgDia, setKgDia] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function limpar() {
    setCategoria('');
    setInsumo('');
    setKgDia('');
    setEditandoId(null);
    setErro(null);
  }

  function iniciarEdicao(d: ItemDieta) {
    setEditandoId(d.id);
    setCategoria(d.categoria ?? '');
    setInsumo(d.insumo ?? '');
    setKgDia(d.kgDia != null ? String(d.kgDia) : '');
    setErro(null);
  }

  async function salvar() {
    const kgNum = Number(kgDia.replace(',', '.'));
    if (!categoria || !insumo || !Number.isFinite(kgNum) || kgNum <= 0) {
      setErro('Escolha categoria, insumo e um kg/dia maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      const corpo = { categoria, insumo, kgDia: kgNum };
      const res = await fetch('/FI_FCG/api/dieta', {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoId ? { id: editandoId, ...corpo } : corpo),
      });
      if (!res.ok) {
        setErro('Não foi possível salvar — tenta de novo.');
        return;
      }
      limpar();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Apagar esta linha da dieta?')) return;
    const res = await fetch('/FI_FCG/api/dieta', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) onChanged();
  }

  const colunas: DataTableColumn<ItemDieta>[] = [
    { key: 'categoria', header: 'Categoria', cell: (d) => d.categoria ?? '—', sortValue: (d) => d.categoria },
    { key: 'insumo', header: 'Insumo', cell: (d) => d.insumo ?? '—', sortValue: (d) => d.insumo },
    { key: 'kgDia', header: 'Kg/dia', cell: (d) => formatNumber(d.kgDia), sortValue: (d) => d.kgDia },
    {
      key: 'acoes',
      header: '',
      cell: (d) => (
        <span className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => iniciarEdicao(d)} aria-label="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive"
            onClick={() => excluir(d.id)}
            aria-label="Apagar"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">Dieta por Categoria</h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Select value={categoria || undefined} onValueChange={setCategoria}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_FUNIL.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={insumo || undefined} onValueChange={setInsumo}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Insumo" />
            </SelectTrigger>
            <SelectContent>
              {insumos.map((i) => (
                <SelectItem key={i.id} value={i.nome}>
                  {i.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Kg por dia" inputMode="decimal" value={kgDia} onChange={(e) => setKgDia(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" onClick={salvar} disabled={salvando} className="flex-1">
              {editandoId ? 'Salvar alterações' : 'Adicionar'}
            </Button>
            {editandoId && (
              <Button type="button" variant="ghost" size="icon" onClick={limpar} aria-label="Cancelar">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {insumos.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Cadastre ao menos 1 insumo antes.</p>}
        {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
      </div>
      <DataTable columns={colunas} rows={dieta} rowKey={(d) => d.id} />
    </section>
  );
}
