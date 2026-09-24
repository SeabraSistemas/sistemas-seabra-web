'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { diaDeInput, diaParaInput, formatDia, formatNumber } from '@/lib/painel/format';
import { leituraPorDia, litrosDaRegua, normalizarRegua, volumeDaLeitura, type Leitura, type TabelaRegua } from '@/lib/sanri/producao';
import { EstadoPlanilha } from './EstadoPlanilha';
import { Escolha } from './Escolha';

function numeroDoTanque(t: string): number {
  return Number(t.replace(/\D/g, '')) || 0;
}

function faixa(tabela: TabelaRegua, tanque: string): string | null {
  const reguas = Object.keys(tabela[tanque] ?? {}).map(Number);
  if (reguas.length === 0) return null;
  return `${formatNumber(Math.min(...reguas))} a ${formatNumber(Math.max(...reguas))}`;
}

function ResultadoRegua({ tabela, tanque, regua }: { tabela: TabelaRegua; tanque: string; regua: string }) {
  if (!tanque || !regua.trim()) return null;
  const litros = litrosDaRegua(tabela, tanque, regua);
  if (litros != null) return <p className="text-sm text-emerald-400">= {formatNumber(litros)} litros</p>;
  const f = faixa(tabela, tanque);
  return (
    <p className="text-sm text-destructive">
      {normalizarRegua(regua) == null ? 'Régua inválida' : 'Régua não está na tabela'}
      {f ? ` — ${tanque} vai de ${f}` : ''}
    </p>
  );
}

interface Form {
  data: string;
  totalAnimais: string;
  tanque: string;
  regua: string;
  extra: boolean;
  tanqueExtra: string;
  reguaExtra: string;
  obs: string;
}

export function ReguaPainel({
  tabela,
  leituras,
  hoje,
  configurado,
  ok,
  carregadoEm,
}: {
  tabela: TabelaRegua | null;
  leituras: Leitura[];
  hoje: number;
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const router = useRouter();
  const tanques = useMemo(() => Object.keys(tabela ?? {}).sort((a, b) => numeroDoTanque(a) - numeroDoTanque(b)), [tabela]);
  const ordenadas = useMemo(() => [...leituras].sort((a, b) => b.data - a.data), [leituras]);
  const porDia = useMemo(() => leituraPorDia(leituras), [leituras]);
  const ultima = ordenadas[0];

  const vazio = (): Form => ({
    data: diaParaInput(hoje),
    totalAnimais: ultima?.totalAnimais != null ? String(ultima.totalAnimais) : '',
    tanque: ultima && tanques.includes(ultima.tanque) ? ultima.tanque : (tanques[0] ?? ''),
    regua: '',
    extra: false,
    tanqueExtra: '',
    reguaExtra: '',
    obs: '',
  });

  const [form, setForm] = useState<Form>(vazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const dia = diaDeInput(form.data);
  const existente = dia != null ? porDia.get(dia) : undefined;
  const conflito = existente && existente.id !== editandoId ? existente : null;

  const litros = tabela && form.tanque ? litrosDaRegua(tabela, form.tanque, form.regua) : null;
  const litrosExtra = tabela && form.extra && form.tanqueExtra ? litrosDaRegua(tabela, form.tanqueExtra, form.reguaExtra) : null;
  const animais = Number(form.totalAnimais);
  const valido =
    dia != null &&
    Number.isInteger(animais) &&
    animais > 0 &&
    litros != null &&
    (!form.extra || litrosExtra != null) &&
    !conflito;

  function editar(l: Leitura) {
    setEditandoId(l.id);
    setErro(null);
    setForm({
      data: diaParaInput(l.data),
      totalAnimais: l.totalAnimais != null ? String(l.totalAnimais) : '',
      tanque: l.tanque,
      regua: l.regua,
      extra: l.reguaExtra != null,
      tanqueExtra: l.tanqueExtra ?? '',
      reguaExtra: l.reguaExtra ?? '',
      obs: l.obs ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelar() {
    setEditandoId(null);
    setErro(null);
    setForm(vazio());
  }

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    try {
      const corpo = {
        ...(editandoId ? { id: editandoId } : {}),
        data: form.data,
        totalAnimais: animais,
        tanque: form.tanque,
        regua: form.regua,
        tanqueExtra: form.extra ? form.tanqueExtra : '',
        reguaExtra: form.extra ? form.reguaExtra : '',
        obs: form.obs,
      };
      const res = await fetch('/sanri/api/regua', {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (!res.ok) {
        const { erro: msg } = (await res.json().catch(() => ({}))) as { erro?: string };
        setErro(msg ? `Não salvou: ${msg}.` : 'Não foi possível salvar — tente de novo.');
        return;
      }
      setEditandoId(null);
      setForm({ ...vazio(), totalAnimais: String(animais), tanque: form.tanque });
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(l: Leitura) {
    if (!window.confirm(`Apagar a régua de ${formatDia(l.data)}?`)) return;
    const res = await fetch('/sanri/api/regua', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: l.id }),
    });
    if (!res.ok) {
      setErro('Não foi possível apagar — tente de novo.');
      return;
    }
    if (editandoId === l.id) cancelar();
    router.refresh();
  }

  const colunas: DataTableColumn<Leitura>[] = [
    { key: 'data', header: 'Data', cell: (l) => formatDia(l.data), sortValue: (l) => l.data },
    { key: 'tanque', header: 'Tanque', cell: (l) => (l.tanqueExtra ? `${l.tanque} + ${l.tanqueExtra}` : l.tanque) },
    { key: 'regua', header: 'Régua', cell: (l) => (l.reguaExtra ? `${l.regua} + ${l.reguaExtra}` : l.regua), className: 'text-right' },
    {
      key: 'litros',
      header: 'Litros',
      cell: (l) => {
        const v = volumeDaLeitura(l);
        return v == null ? <span className="text-destructive">sem litros</span> : formatNumber(v);
      },
      sortValue: (l) => volumeDaLeitura(l),
      className: 'text-right',
    },
    { key: 'animais', header: 'Cabras', cell: (l) => formatNumber(l.totalAnimais), className: 'text-right' },
    { key: 'obs', header: 'Obs', cell: (l) => <span className="text-muted-foreground">{l.obs ?? ''}</span> },
    {
      key: 'acoes',
      header: '',
      cell: (l) => (
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => editar(l)} aria-label="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => excluir(l)} aria-label="Apagar">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const opcoesTanque = tanques.map((t) => ({ valor: t, label: t }));

  return (
    <div className="flex flex-col gap-6">
      <EstadoPlanilha configurado={configurado} ok={ok && tabela != null} carregadoEm={carregadoEm} />

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">{editandoId ? 'Editar régua' : 'Lançar régua'}</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">Medida uma vez por dia, antes da 1ª ordenha. As saídas de leite vão na aba Saídas.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Data</span>
            <Input type="date" value={form.data} max={diaParaInput(hoje)} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Total de cabras em lactação</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={form.totalAnimais}
              onChange={(e) => setForm({ ...form, totalAnimais: e.target.value })}
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Tanque</span>
            <Escolha opcoes={opcoesTanque} valor={form.tanque} onChange={(v) => setForm({ ...form, tanque: v })} />
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Régua</span>
            <Input
              inputMode="decimal"
              placeholder="ex: 24.7"
              value={form.regua}
              onChange={(e) => setForm({ ...form, regua: e.target.value })}
              className="text-lg"
            />
            {tabela && <ResultadoRegua tabela={tabela} tanque={form.tanque} regua={form.regua} />}
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.extra}
              onChange={(e) =>
                setForm({
                  ...form,
                  extra: e.target.checked,
                  tanqueExtra: e.target.checked ? (tanques.find((t) => t !== form.tanque) ?? '') : '',
                  reguaExtra: '',
                })
              }
              className="size-4 rounded border-input accent-primary"
            />
            Leite em 2 tanques neste dia
          </label>

          {form.extra && (
            <>
              <div className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="text-muted-foreground">Tanque extra</span>
                <Escolha
                  opcoes={opcoesTanque.filter((o) => o.valor !== form.tanque)}
                  valor={form.tanqueExtra}
                  onChange={(v) => setForm({ ...form, tanqueExtra: v })}
                />
              </div>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-muted-foreground">Régua do tanque extra</span>
                <Input
                  inputMode="decimal"
                  placeholder="ex: 2.0"
                  value={form.reguaExtra}
                  onChange={(e) => setForm({ ...form, reguaExtra: e.target.value })}
                  className="text-lg"
                />
                {tabela && <ResultadoRegua tabela={tabela} tanque={form.tanqueExtra} regua={form.reguaExtra} />}
              </label>
            </>
          )}

          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Observação</span>
            <Input value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </label>
        </div>

        {litros != null && (
          <p className="mt-5 text-sm">
            Volume no tanque: <span className="font-semibold tabular-nums">{formatNumber(litros + (form.extra ? (litrosExtra ?? 0) : 0))} L</span>
          </p>
        )}
        {conflito && (
          <p className="mt-3 text-sm text-amber-400">
            Já existe régua em {formatDia(conflito.data)}.{' '}
            <button type="button" className="underline underline-offset-2" onClick={() => editar(conflito)}>
              Editar a existente
            </button>
          </p>
        )}
        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}

        <div className="mt-5 flex gap-2">
          <Button type="button" onClick={salvar} disabled={!valido || salvando} className="min-w-32">
            {salvando ? 'Salvando…' : editandoId ? 'Salvar alteração' : 'Lançar régua'}
          </Button>
          {editandoId && (
            <Button type="button" variant="ghost" onClick={cancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Réguas lançadas</h3>
        <DataTable columns={colunas} rows={ordenadas} rowKey={(l) => l.id} pageSize={15} />
      </div>
    </div>
  );
}
