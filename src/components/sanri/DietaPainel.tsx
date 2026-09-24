'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDia, formatNumber } from '@/lib/painel/format';
import {
  ALIMENTOS,
  TURNOS,
  baiaVazia,
  dietaAtual,
  kgDe,
  kgPorCabra,
  kgPorDia,
  temAlimento,
  totaisPorTurno,
  type Alimento,
  type Baia,
  type ChaveAlimento,
  type ChaveTurno,
  type DietaBaia,
  type Quantidades,
} from '@/lib/sanri/dieta';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { EstadoPlanilha } from './EstadoPlanilha';

const CATEGORIAS_PADRAO = ['Pré-parto', 'Lactante', 'Seca', 'Recria', 'Recriada', 'Cria', 'Reprodutor'];

/** "2,5 baldes" / "1 balde" / "3 kg" — balde no singular abaixo de 2, como a equipe escreve. */
function naUnidade(a: Alimento, v: number): string {
  if (a.unidade === 'kg') return `${formatNumber(v)} kg`;
  return `${formatNumber(v)} ${v < 2 ? 'balde' : 'baldes'}`;
}

/** Célula de quantidade: o que o tratador pega (baldes) em cima, o peso embaixo. */
function Quantidade({ alimento, valor }: { alimento: Alimento; valor: number | null }) {
  if (valor == null) return <span className="text-ink-2">—</span>;
  return (
    <span className="flex flex-col leading-tight">
      <span className="font-semibold text-ink">{naUnidade(alimento, valor)}</span>
      {alimento.unidade !== 'kg' && <span className="text-xs text-ink-2">{formatNumber(kgDe(alimento, valor))} kg</span>}
    </span>
  );
}

/** Tabela alimento × turno. Só entram as linhas de alimento que têm alguma quantidade. */
function TabelaTurnos({ quantidades }: { quantidades: Quantidades }) {
  const linhas = ALIMENTOS.filter((a) => TURNOS.some((t) => quantidades[a.chave][t.chave] != null));
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-ink-2">
          <th className="w-20 py-1 text-left font-medium" />
          {TURNOS.map((t) => (
            <th key={t.chave} scope="col" className="py-1 text-left font-medium">
              {t.nome}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((a) => (
          <tr key={a.chave} className="border-t border-rule align-top">
            <th scope="row" className="py-2 pr-2 text-left font-medium text-ink-1">
              {a.nome}
            </th>
            {TURNOS.map((t) => (
              <td key={t.chave} className="py-2 pr-2">
                <Quantidade alimento={a} valor={quantidades[a.chave][t.chave]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------- edição

type Campos = Record<ChaveAlimento, Record<ChaveTurno, string>>;

interface Form {
  cabras: string;
  categoria: string;
  obs: string;
  q: Campos;
}

function formDe(baia: Baia, atual: DietaBaia | undefined): Form {
  const q = {} as Campos;
  for (const a of ALIMENTOS) {
    q[a.chave] = { manha: '', '12h': '', tarde: '' };
    for (const t of TURNOS) {
      const v = atual?.quantidades[a.chave][t.chave];
      q[a.chave][t.chave] = v == null ? '' : formatNumber(v);
    }
  }
  return {
    cabras: atual?.cabras != null ? String(atual.cabras) : '',
    categoria: atual?.categoria ?? baia.categoria ?? '',
    obs: atual?.obs ?? '',
    q,
  };
}

/** '' => null; "2,5" => 2.5; lixo => NaN. */
function lerCampo(s: string): number | null {
  const t = s.trim();
  return t ? Number(t.replace(',', '.')) : null;
}

function FormDieta({
  baia,
  atual,
  categorias,
  onFechar,
}: {
  baia: Baia;
  atual: DietaBaia | undefined;
  categorias: string[];
  onFechar: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => formDe(baia, atual));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cabras = lerCampo(form.cabras);
  const cabrasOk = cabras != null && Number.isInteger(cabras) && cabras >= 0;
  const invalidos = ALIMENTOS.flatMap((a) =>
    TURNOS.filter((t) => {
      const v = lerCampo(form.q[a.chave][t.chave]);
      return v != null && (!Number.isFinite(v) || v < 0);
    }).map((t) => `${a.nome} (${t.nome})`),
  );
  const valido = cabrasOk && invalidos.length === 0;

  function mudarQ(a: ChaveAlimento, t: ChaveTurno, valor: string) {
    setForm({ ...form, q: { ...form.q, [a]: { ...form.q[a], [t]: valor } } });
  }

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch('/sanri/api/dieta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baia: baia.nome, categoria: form.categoria, cabras: form.cabras, quantidades: form.q, obs: form.obs }),
      });
      if (!res.ok) {
        const { erro: msg } = (await res.json().catch(() => ({}))) as { erro?: string };
        setErro(msg ? `Não salvou: ${msg}.` : 'Não foi possível salvar — tente de novo.');
        return;
      }
      onFechar();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  const listaId = `categorias-${baia.nome}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Rotulo texto="Nº de cabras">
          <PainelCampo type="number" inputMode="numeric" min={0} step={1} value={form.cabras} onChange={(e) => setForm({ ...form, cabras: e.target.value })} />
        </Rotulo>
        <Rotulo texto="Categoria">
          <PainelCampo list={listaId} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          <datalist id={listaId}>
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Rotulo>
      </div>

      <div role="group" aria-label="Quantidades por turno" className="grid grid-cols-[4.5rem_1fr_1fr_1fr] items-start gap-x-2 gap-y-2 text-sm">
        <span />
        {TURNOS.map((t) => (
          <span key={t.chave} className="text-xs font-medium text-ink-2">
            {t.nome}
          </span>
        ))}
        {ALIMENTOS.map((a) => (
          <div key={a.chave} className="contents">
            <span className="pt-2.5 font-medium leading-tight text-ink-1">
              {a.nome}
              <span className="block text-xs font-normal text-ink-2">{a.unidade}</span>
            </span>
            {TURNOS.map((t) => {
              const v = lerCampo(form.q[a.chave][t.chave]);
              return (
                <div key={t.chave} className="flex min-w-0 flex-col gap-0.5">
                  <PainelCampo
                    inputMode="decimal"
                    aria-label={`${a.nome}, ${t.nome}, em ${a.unidade}`}
                    value={form.q[a.chave][t.chave]}
                    onChange={(e) => mudarQ(a.chave, t.chave, e.target.value)}
                    className="px-2 text-center"
                  />
                  {a.unidade !== 'kg' && v != null && Number.isFinite(v) && v > 0 && (
                    <span className="text-center text-xs text-ink-2">{formatNumber(kgDe(a, v))} kg</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Rotulo texto="Observação">
        <PainelCampo placeholder="ex: quantidade em teste" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
      </Rotulo>

      {!cabrasOk && form.cabras !== '' && <Aviso tom="erro">Nº de cabras precisa ser um número inteiro (0 se a baia está vazia).</Aviso>}
      {invalidos.length > 0 && <Aviso tom="erro">Quantidade inválida em {invalidos.join(', ')}.</Aviso>}
      {erro && <Aviso tom="erro">{erro}</Aviso>}

      <div className="flex flex-wrap gap-2">
        <PainelBotao onClick={salvar} disabled={!valido || salvando} className="min-w-32">
          {salvando ? 'Salvando…' : 'Salvar dieta'}
        </PainelBotao>
        <PainelBotao variante="contorno" onClick={onFechar} disabled={salvando}>
          Cancelar
        </PainelBotao>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- cartão da baia

function resumoDia(d: DietaBaia): string {
  const dia = kgPorDia(d.quantidades);
  return ALIMENTOS.filter((a) => dia[a.chave] > 0)
    .map((a) => `${a.nome.toLowerCase()} ${formatNumber(dia[a.chave])} kg`)
    .join(' · ');
}

function CartaoBaia({
  baia,
  atual,
  anteriores,
  editando,
  categorias,
  onEditar,
  onFechar,
}: {
  baia: Baia;
  atual: DietaBaia | undefined;
  anteriores: DietaBaia[];
  editando: boolean;
  categorias: string[];
  onEditar: () => void;
  onFechar: () => void;
}) {
  const vazia = atual != null && baiaVazia(atual);
  const porCabra = atual ? kgPorCabra(atual) : null;
  const categoria = atual?.categoria ?? baia.categoria;

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-card border bg-paper p-4 shadow-card',
        // Editando, ocupa a linha inteira: senão as vizinhas esticam até a altura do formulário.
        editando ? 'border-ink sm:col-span-2 lg:col-span-3' : 'border-rule',
        vazia && !editando && 'bg-paper-1 shadow-none',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-xl font-bold leading-tight text-ink">{baia.nome}</h4>
          <p className="text-sm text-ink-2">
            {[categoria, atual?.cabras != null ? `${atual.cabras} ${atual.cabras === 1 ? 'cabra' : 'cabras'}` : null].filter(Boolean).join(' · ') ||
              'Sem categoria'}
          </p>
        </div>
        {!editando && (
          <PainelBotao variante="pequeno" onClick={onEditar}>
            {atual ? 'Editar' : 'Definir'}
          </PainelBotao>
        )}
      </div>

      {editando ? (
        <div className="w-full max-w-xl">
          <FormDieta baia={baia} atual={atual} categorias={categorias} onFechar={onFechar} />
        </div>
      ) : !atual ? (
        <p className="text-sm text-ink-2">Sem dieta definida.</p>
      ) : vazia ? (
        <p className="text-sm font-medium text-ink-1">Baia vazia</p>
      ) : (
        <>
          {atual.obs && (
            <p className="self-start rounded-pill bg-aviso-fundo px-2.5 py-0.5 text-xs font-medium text-aviso">{atual.obs}</p>
          )}
          {temAlimento(atual.quantidades) ? <TabelaTurnos quantidades={atual.quantidades} /> : <p className="text-sm text-ink-2">Sem quantidade informada.</p>}
          {porCabra && (
            <p className="text-xs text-ink-2">
              Por cabra/dia:{' '}
              {ALIMENTOS.filter((a) => porCabra[a.chave] > 0)
                .map((a) => `${a.nome.toLowerCase()} ${formatNumber(porCabra[a.chave])} kg`)
                .join(' · ')}
            </p>
          )}
        </>
      )}

      {atual && !editando && (
        <div className="mt-auto border-t border-rule pt-2 text-xs text-ink-2">
          Alterada em {formatDia(atual.data)}
          {atual.lancadoPor ? ` por ${atual.lancadoPor}` : ''}
          {anteriores.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer font-medium text-bay">Histórico ({anteriores.length})</summary>
              <ul className="mt-1 flex flex-col gap-1">
                {anteriores.map((d) => (
                  <li key={d.id}>
                    {formatDia(d.data)} · {baiaVazia(d) ? 'vazia' : `${d.cabras ?? '?'} cabras · ${resumoDia(d) || 'sem quantidade'}/dia`}
                    {d.lancadoPor ? ` · ${d.lancadoPor}` : ''}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- página

export function DietaPainel({
  baias,
  historico,
  configurado,
  ok,
  carregadoEm,
}: {
  baias: Baia[];
  historico: DietaBaia[];
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const [galpao, setGalpao] = useState<string>('');
  const [editando, setEditando] = useState<string | null>(null);

  const atual = useMemo(() => dietaAtual(historico), [historico]);
  const anteriores = useMemo(() => {
    const m = new Map<string, DietaBaia[]>();
    for (const d of historico) {
      if (atual.get(d.baia)?.id === d.id) continue;
      m.set(d.baia, [d, ...(m.get(d.baia) ?? [])]);
    }
    return m;
  }, [historico, atual]);

  const galpoes = useMemo(() => [...new Set(baias.map((b) => b.galpao))], [baias]);
  const visiveis = galpao ? baias.filter((b) => b.galpao === galpao) : baias;
  const dietasVisiveis = visiveis.map((b) => atual.get(b.nome)).filter((d): d is DietaBaia => d != null);
  const totais = totaisPorTurno(dietasVisiveis);
  const totalCabras = dietasVisiveis.reduce((s, d) => s + (d.cabras ?? 0), 0);
  const linhasTotal = ALIMENTOS.filter((a) => TURNOS.some((t) => totais[a.chave][t.chave] != null));

  const categorias = useMemo(
    () => [...new Set([...CATEGORIAS_PADRAO, ...baias.map((b) => b.categoria).filter((c): c is string => c != null)])],
    [baias],
  );

  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div>
        <h2 className="text-lg font-semibold text-ink">Dieta por baia</h2>
        <p className="mt-1 text-sm text-ink-2">1 balde de silagem = 20 kg · 1 balde de ração = 2 kg · feno em kg.</p>
      </div>

      <div role="group" aria-label="Galpão" className="flex flex-wrap gap-1.5">
        {[{ valor: '', label: 'Todos' }, ...galpoes.map((g) => ({ valor: g, label: g }))].map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={galpao === o.valor}
            onClick={() => setGalpao(o.valor)}
            className={cn(
              'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
              galpao === o.valor ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">Para preparar {galpao ? `· ${galpao}` : '· todas as baias'}</h3>
          <span className="text-sm text-ink-2">
            {totalCabras} {totalCabras === 1 ? 'cabra' : 'cabras'}
          </span>
        </div>
        {linhasTotal.length > 0 ? (
          <div className="mt-2">
            <TabelaTurnos quantidades={totais} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-2">Nenhuma dieta definida {galpao ? 'neste galpão' : 'ainda'} — use “Definir” em cada baia.</p>
        )}
      </section>

      {(galpao ? [galpao] : galpoes).map((g) => {
        const doGalpao = baias.filter((b) => b.galpao === g);
        return (
          <section key={g} className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-ink">{g}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doGalpao.map((b) => (
                <CartaoBaia
                  key={b.nome}
                  baia={b}
                  atual={atual.get(b.nome)}
                  anteriores={anteriores.get(b.nome) ?? []}
                  editando={editando === b.nome}
                  categorias={categorias}
                  onEditar={() => setEditando(b.nome)}
                  onFechar={() => setEditando(null)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
