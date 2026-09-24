'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { diaDeInput, diaParaInput, formatDia, formatNumber } from '@/lib/painel/format';
import { DESTINOS, destinoPorChave, type ChaveDestino, type Saida } from '@/lib/sanri/producao';
import { EstadoPlanilha } from './EstadoPlanilha';
import { Escolha } from './Escolha';

const FORM_VAZIO = { destino: '' as ChaveDestino | '', litros: '', obs: '' };

export function SaidasPainel({
  saidas,
  hoje,
  configurado,
  ok,
  carregadoEm,
}: {
  saidas: Saida[];
  hoje: number;
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const router = useRouter();
  const [data, setData] = useState(diaParaInput(hoje));
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const dia = diaDeInput(data);
  const ordenadas = useMemo(() => [...saidas].sort((a, b) => b.data - a.data), [saidas]);
  const doDia = useMemo(() => saidas.filter((s) => s.data === dia), [saidas, dia]);
  const totaisDoDia = DESTINOS.map((d) => ({ ...d, litros: doDia.filter((s) => s.destino === d.chave).reduce((t, s) => t + s.litros, 0) }));

  const litros = Number(form.litros.replace(',', '.'));
  const valido = dia != null && form.destino !== '' && Number.isFinite(litros) && litros > 0;

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch('/sanri/api/saidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, destino: form.destino, litros: form.litros, obs: form.obs }),
      });
      if (!res.ok) {
        const { erro: msg } = (await res.json().catch(() => ({}))) as { erro?: string };
        setErro(msg ? `Não salvou: ${msg}.` : 'Não foi possível salvar — tente de novo.');
        return;
      }
      setForm(FORM_VAZIO);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(s: Saida) {
    const nome = destinoPorChave(s.destino)?.nome ?? s.destino;
    if (!window.confirm(`Apagar a saída de ${formatNumber(s.litros)} L para ${nome} em ${formatDia(s.data)}?`)) return;
    const res = await fetch('/sanri/api/saidas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, destino: s.destino }),
    });
    if (!res.ok) {
      setErro('Não foi possível apagar — tente de novo.');
      return;
    }
    router.refresh();
  }

  const colunas: DataTableColumn<Saida>[] = [
    { key: 'data', header: 'Data', cell: (s) => formatDia(s.data), sortValue: (s) => s.data },
    { key: 'destino', header: 'Destino', cell: (s) => destinoPorChave(s.destino)?.nome ?? s.destino, sortValue: (s) => s.destino },
    { key: 'litros', header: 'Litros', cell: (s) => formatNumber(s.litros), sortValue: (s) => s.litros, className: 'text-right' },
    { key: 'obs', header: 'Obs', cell: (s) => <span className="text-muted-foreground">{s.obs ?? ''}</span> },
    {
      key: 'acoes',
      header: '',
      cell: (s) => (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => excluir(s)} aria-label="Apagar">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Lançar saída de leite</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">Cada vez que sair leite do tanque durante as ordenhas. Pode lançar quantas precisar no dia.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Data</span>
            <Input type="date" value={data} max={diaParaInput(hoje)} onChange={(e) => setData(e.target.value)} />
          </label>
          <div className="hidden sm:block" />

          <div className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Destino</span>
            <Escolha
              opcoes={DESTINOS.map((d) => ({ valor: d.chave, label: d.nome }))}
              valor={form.destino}
              onChange={(v) => setForm({ ...form, destino: v as ChaveDestino })}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Litros</span>
            <Input
              inputMode="decimal"
              placeholder="ex: 60"
              value={form.litros}
              onChange={(e) => setForm({ ...form, litros: e.target.value })}
              className="text-lg"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Observação</span>
            <Input value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </label>
        </div>

        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
        <Button type="button" onClick={salvar} disabled={!valido || salvando} className="mt-5 min-w-32">
          {salvando ? 'Salvando…' : 'Lançar saída'}
        </Button>
      </div>

      {dia != null && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Total de saídas em {formatDia(dia)}</h3>
          <div className="grid grid-cols-3 gap-3">
            {totaisDoDia.map((t) => (
              <div key={t.chave} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="truncate text-xs text-muted-foreground">{t.nome}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatNumber(t.litros)} L</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Saídas lançadas</h3>
        <DataTable columns={colunas} rows={ordenadas} rowKey={(s) => `${s.id}:${s.destino}`} pageSize={20} />
      </div>
    </div>
  );
}
