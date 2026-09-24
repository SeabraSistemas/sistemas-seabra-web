'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { diaDeInput, diaParaInput, formatDia, formatNumber } from '@/lib/painel/format';
import { leituraPorDia, litrosDaRegua, normalizarRegua, volumeDaLeitura, type Leitura, type TabelaRegua } from '@/lib/sanri/producao';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { DataTable, type DataTableColumn } from './DataTable';
import { Escolha } from './Escolha';
import { EstadoPlanilha } from './EstadoPlanilha';

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
  if (litros != null) return <p className="text-sm font-semibold text-sage">= {formatNumber(litros)} litros</p>;
  const f = faixa(tabela, tanque);
  return (
    <p className="text-sm text-erro">
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
        return v == null ? <span className="text-erro">sem litros</span> : formatNumber(v);
      },
      sortValue: (l) => volumeDaLeitura(l),
      className: 'text-right',
    },
    { key: 'animais', header: 'Cabras', cell: (l) => formatNumber(l.totalAnimais), className: 'text-right' },
    { key: 'obs', header: 'Obs', cell: (l) => <span className="text-ink-2">{l.obs ?? ''}</span> },
    {
      key: 'acoes',
      header: '',
      cell: (l) => (
        <div className="flex justify-end gap-1">
          <PainelBotao variante="discreto" onClick={() => editar(l)}>
            Editar
          </PainelBotao>
          <PainelBotao variante="perigo" onClick={() => excluir(l)}>
            Apagar
          </PainelBotao>
        </div>
      ),
    },
  ];

  const opcoesTanque = tanques.map((t) => ({ valor: t, label: t }));

  return (
    <div className="flex flex-col gap-6">
      <EstadoPlanilha configurado={configurado} ok={ok && tabela != null} carregadoEm={carregadoEm} />

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold text-ink">{editandoId ? 'Editar régua' : 'Lançar régua'}</h2>
        <p className="mb-5 mt-1 text-sm text-ink-2">Medida uma vez por dia, antes da 1ª ordenha. As saídas de leite vão na aba Saídas.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Rotulo texto="Data">
            <PainelCampo type="date" value={form.data} max={diaParaInput(hoje)} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </Rotulo>
          <Rotulo texto="Total de cabras em lactação">
            <PainelCampo
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={form.totalAnimais}
              onChange={(e) => setForm({ ...form, totalAnimais: e.target.value })}
            />
          </Rotulo>

          <Escolha
            rotulo="Tanque"
            opcoes={opcoesTanque}
            valor={form.tanque}
            onChange={(v) => setForm({ ...form, tanque: v })}
            className="sm:col-span-2"
          />

          <div className="flex flex-col gap-1.5">
            <Rotulo texto="Régua">
              <PainelCampo
                inputMode="decimal"
                placeholder="ex: 24.7"
                value={form.regua}
                onChange={(e) => setForm({ ...form, regua: e.target.value })}
                className="text-lg"
              />
            </Rotulo>
            {tabela && <ResultadoRegua tabela={tabela} tanque={form.tanque} regua={form.regua} />}
          </div>

          <label className="flex items-center gap-2.5 self-end pb-3 text-sm text-ink-1">
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
              className="size-5 accent-ink"
            />
            Leite em 2 tanques neste dia
          </label>

          {form.extra && (
            <>
              <Escolha
                rotulo="Tanque extra"
                opcoes={opcoesTanque.filter((o) => o.valor !== form.tanque)}
                valor={form.tanqueExtra}
                onChange={(v) => setForm({ ...form, tanqueExtra: v })}
                className="sm:col-span-2"
              />
              <div className="flex flex-col gap-1.5">
                <Rotulo texto="Régua do tanque extra">
                  <PainelCampo
                    inputMode="decimal"
                    placeholder="ex: 2.0"
                    value={form.reguaExtra}
                    onChange={(e) => setForm({ ...form, reguaExtra: e.target.value })}
                    className="text-lg"
                  />
                </Rotulo>
                {tabela && <ResultadoRegua tabela={tabela} tanque={form.tanqueExtra} regua={form.reguaExtra} />}
              </div>
            </>
          )}

          <Rotulo texto="Observação" className="sm:col-span-2">
            <PainelCampo value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </Rotulo>
        </div>

        {litros != null && (
          <p className="mt-5 text-sm text-ink-1">
            Volume no tanque:{' '}
            <span className="font-semibold text-ink">{formatNumber(litros + (form.extra ? (litrosExtra ?? 0) : 0))} L</span>
          </p>
        )}
        {conflito && (
          <div className="mt-3">
            <Aviso tom="aviso">
              Já existe régua em {formatDia(conflito.data)}.{' '}
              <button type="button" className="font-semibold underline underline-offset-2" onClick={() => editar(conflito)}>
                Editar a existente
              </button>
            </Aviso>
          </div>
        )}
        {erro && (
          <div className="mt-3">
            <Aviso tom="erro">{erro}</Aviso>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <PainelBotao onClick={salvar} disabled={!valido || salvando} className="min-w-40">
            {salvando ? 'Salvando…' : editandoId ? 'Salvar alteração' : 'Lançar régua'}
          </PainelBotao>
          {editandoId && (
            <PainelBotao variante="contorno" onClick={cancelar}>
              Cancelar
            </PainelBotao>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">Réguas lançadas</h2>
        <DataTable columns={colunas} rows={ordenadas} rowKey={(l) => l.id} pageSize={15} />
      </section>
    </div>
  );
}
