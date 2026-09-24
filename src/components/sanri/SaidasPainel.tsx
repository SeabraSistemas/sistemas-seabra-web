'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { diaDeInput, diaParaInput, formatDia, formatNumber } from '@/lib/painel/format';
import { DESTINOS, destinoPorChave, type ChaveDestino, type Saida } from '@/lib/sanri/producao';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { DataTable, type DataTableColumn } from './DataTable';
import { Escolha } from './Escolha';
import { EstadoPlanilha } from './EstadoPlanilha';

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
    { key: 'obs', header: 'Obs', cell: (s) => <span className="text-ink-2">{s.obs ?? ''}</span> },
    {
      key: 'acoes',
      header: '',
      cell: (s) => (
        <div className="flex justify-end">
          <PainelBotao variante="perigo" onClick={() => excluir(s)}>
            Apagar
          </PainelBotao>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Lançar saída de leite</h2>
        <p className="mb-5 mt-1 text-sm text-ink-2">Cada vez que sair leite do tanque durante as ordenhas. Pode lançar quantas precisar no dia.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Rotulo texto="Data">
            <PainelCampo type="date" value={data} max={diaParaInput(hoje)} onChange={(e) => setData(e.target.value)} />
          </Rotulo>
          <div className="hidden sm:block" />

          <Escolha
            rotulo="Destino"
            opcoes={DESTINOS.map((d) => ({ valor: d.chave, label: d.nome }))}
            valor={form.destino}
            onChange={(v) => setForm({ ...form, destino: v as ChaveDestino })}
            className="sm:col-span-2"
          />

          <Rotulo texto="Litros">
            <PainelCampo
              inputMode="decimal"
              placeholder="ex: 60"
              value={form.litros}
              onChange={(e) => setForm({ ...form, litros: e.target.value })}
              className="text-lg"
            />
          </Rotulo>
          <Rotulo texto="Observação">
            <PainelCampo value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </Rotulo>
        </div>

        {erro && (
          <div className="mt-3">
            <Aviso tom="erro">{erro}</Aviso>
          </div>
        )}
        <PainelBotao onClick={salvar} disabled={!valido || salvando} className="mt-5 min-w-40">
          {salvando ? 'Salvando…' : 'Lançar saída'}
        </PainelBotao>
      </section>

      {dia != null && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Total de saídas em {formatDia(dia)}</h2>
          <div className="grid grid-cols-3 gap-3">
            {totaisDoDia.map((t) => (
              <div key={t.chave} className="min-w-0 rounded-card border border-rule bg-paper px-4 py-3 shadow-card">
                <p className="truncate text-xs text-ink-2">{t.nome}</p>
                <p className="mt-0.5 text-xl font-semibold text-ink">{formatNumber(t.litros)} L</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">Saídas lançadas</h2>
        <DataTable columns={colunas} rows={ordenadas} rowKey={(s) => `${s.id}:${s.destino}`} pageSize={20} />
      </section>
    </div>
  );
}
