'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { CampoLabel, type InfoCampo } from '@/components/painel/CampoInfo';
import { comparadorDataDesc } from '@/lib/painel/filters';
import { formatDia, formatNumber } from '@/lib/painel/format';
import type { LoteCadastrado, RegPesagem, RegRebanho } from '@/lib/fi-fcg/types';

const INFO_DATA_PESAGEM: InfoCampo = {
  oQue: 'A data da pesagem que trouxe os animais que você quer agrupar.',
  ajuda: 'É por aqui que o lote nasce: quem foi pesado naquele dia é quem entra na lista abaixo.',
  como: 'Escolha a data. Dá pra estreitar mais ainda escolhendo a Fazenda ao lado.',
};
const INFO_NOME_LOTE: InfoCampo = {
  oQue: 'O nome do lote que vai ser gravado no cadastro de cada animal marcado.',
  ajuda: 'É por esse nome que você acha o lote depois, pra iniciar o GMD e acompanhar o ganho do grupo.',
  como: 'Digite um nome livre. Se já existir um lote com esse nome, eu aviso — aí os animais entram no lote existente em vez de criar um repetido.',
};
const INFO_DATA_GMD: InfoCampo = {
  oQue: 'A data em que a engorda do lote começa a contar (vira "Entrada engorda" no cadastro).',
  ajuda: 'A partir dela o GMD de cada pesagem é recalculado: dias = data da pesagem − esta data.',
  como: 'Normalmente é a data da pesagem que formou o lote. O peso de entrada sai da primeira pesagem nessa data ou depois.',
};

interface MudancaGmd {
  id: string;
  pesoEntradaKg: number;
  dataPesoEntrada: number;
  diasDe: number | null;
  gmdDe: number | null;
  diasPara: number;
  gmdPara: number | null;
  pesagensAfetadas: number;
}

interface Previa {
  totalAnimais: number;
  totalPesagens: number;
  semPesagemNoPeriodo: string[];
  naoEncontrados: string[];
  mudancas: MudancaGmd[];
}

function vivo(a: RegRebanho): boolean {
  return a.categoria !== 'Venda' && a.categoria !== 'Baixa';
}

/**
 * "Formar lote" + "Iniciar/editar GMD" (21/09/2026) — tira do AppSheet o
 * fluxo que confundia o produtor.
 *
 * 1) Forma o lote a partir de uma PESAGEM (data + fazenda): quem foi pesado
 *    naquele dia vira a lista, ele desmarca quem não quer e dá um nome. Isso
 *    grava `lote` em RebanhoProd (e cadastra o nome na aba Lotes se for
 *    novo).
 * 2) Com o lote formado, define a data de início do GMD. Aí o site
 *    recalcula pesagem a pesagem e grava — porque na planilha GMD/Dias são
 *    VALOR, não fórmula, e o AppSheet parou de atualizá-los (ver gmd.ts).
 *
 * Toda gravação passa por uma prévia: o usuário vê "de -> para" antes de
 * confirmar. É a primeira tela do site que escreve nas abas do AppSheet.
 */
export function FormarLotePainel({
  pesagens,
  rebanhoLotes,
  lotesCadastrados,
}: {
  pesagens: RegPesagem[];
  rebanhoLotes: RegRebanho[];
  lotesCadastrados: LoteCadastrado[];
}) {
  const router = useRouter();

  // ---------- seção 1: formar lote ----------
  const [dataPesagem, setDataPesagem] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [desmarcados, setDesmarcados] = useState<Set<string>>(new Set());
  const [nomeLote, setNomeLote] = useState('');
  const [salvandoLote, setSalvandoLote] = useState(false);
  const [recadoLote, setRecadoLote] = useState<string | null>(null);

  const porId = useMemo(() => new Map(rebanhoLotes.map((a) => [a.id, a])), [rebanhoLotes]);

  const datas = useMemo(() => {
    const vistas = new Set<string>();
    for (const p of pesagens) if (p.data != null) vistas.add(String(p.data));
    return [...vistas].sort(comparadorDataDesc);
  }, [pesagens]);

  const fazendas = useMemo(() => {
    const vistas = new Set<string>();
    for (const p of pesagens) if (p.fazenda) vistas.add(p.fazenda);
    return [...vistas].sort();
  }, [pesagens]);

  const candidatos = useMemo(() => {
    if (!dataPesagem) return [];
    const vistos = new Set<string>();
    const lista: { id: string; pesoKg: number | null; loteAtual: string | null }[] = [];
    for (const p of pesagens) {
      if (String(p.data) !== dataPesagem) continue;
      if (fazenda && p.fazenda !== fazenda) continue;
      if (vistos.has(p.id)) continue;
      vistos.add(p.id);
      const animal = porId.get(p.id);
      if (animal && !vivo(animal)) continue; // vendido/baixado não entra em lote novo
      lista.push({ id: p.id, pesoKg: p.pesoKg, loteAtual: animal?.lote ?? null });
    }
    return lista.sort((a, b) => a.id.localeCompare(b.id));
  }, [pesagens, dataPesagem, fazenda, porId]);

  const omitidos = useMemo(() => {
    if (!dataPesagem) return 0;
    const vistos = new Set<string>();
    let n = 0;
    for (const p of pesagens) {
      if (String(p.data) !== dataPesagem) continue;
      if (fazenda && p.fazenda !== fazenda) continue;
      if (vistos.has(p.id)) continue;
      vistos.add(p.id);
      const animal = porId.get(p.id);
      if (animal && !vivo(animal)) n++;
    }
    return n;
  }, [pesagens, dataPesagem, fazenda, porId]);

  const marcados = useMemo(() => candidatos.filter((c) => !desmarcados.has(c.id)), [candidatos, desmarcados]);

  const loteJaExiste = useMemo(() => {
    const alvo = nomeLote.trim().toLowerCase();
    if (!alvo) return false;
    return lotesCadastrados.some((l) => l.nome.trim().toLowerCase() === alvo);
  }, [nomeLote, lotesCadastrados]);

  function alternar(id: string) {
    setDesmarcados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  async function salvarLote() {
    const nome = nomeLote.trim();
    if (!nome || marcados.length === 0) return;
    setSalvandoLote(true);
    setRecadoLote(null);
    try {
      const res = await fetch('/FI_FCG/api/formar-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeLote: nome, ids: marcados.map((m) => m.id) }),
      });
      if (!res.ok) {
        setRecadoLote('Não consegui gravar — tenta de novo.');
        return;
      }
      const r = (await res.json()) as { atualizados: number; naoEncontrados: string[]; loteCadastrado: boolean };
      setRecadoLote(
        `${formatNumber(r.atualizados)} animal(is) no lote "${nome}"` +
          (r.loteCadastrado ? ' · lote novo cadastrado' : '') +
          (r.naoEncontrados.length > 0 ? ` · ${r.naoEncontrados.length} não achado(s) no cadastro` : ''),
      );
      setDesmarcados(new Set());
      router.refresh();
    } finally {
      setSalvandoLote(false);
    }
  }

  // ---------- seção 2: iniciar/editar GMD ----------
  const lotesComAnimais = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const a of rebanhoLotes) {
      const l = (a.lote ?? '').trim();
      if (!l || !vivo(a)) continue;
      contagem.set(l, (contagem.get(l) ?? 0) + 1);
    }
    return [...contagem.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rebanhoLotes]);

  const [loteGmd, setLoteGmd] = useState('');
  const [dataGmd, setDataGmd] = useState('');
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [carregandoPrevia, setCarregandoPrevia] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [recadoGmd, setRecadoGmd] = useState<string | null>(null);

  const idsDoLote = useMemo(
    () => rebanhoLotes.filter((a) => vivo(a) && (a.lote ?? '').trim() === loteGmd).map((a) => a.id),
    [rebanhoLotes, loteGmd],
  );

  async function verPrevia() {
    if (!loteGmd || !dataGmd || idsDoLote.length === 0) return;
    setCarregandoPrevia(true);
    setRecadoGmd(null);
    setPrevia(null);
    try {
      const res = await fetch('/FI_FCG/api/gmd-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsDoLote, dataInicio: dataGmd }),
      });
      if (!res.ok) {
        setRecadoGmd('Não consegui calcular a prévia — tenta de novo.');
        return;
      }
      setPrevia((await res.json()) as Previa);
    } finally {
      setCarregandoPrevia(false);
    }
  }

  async function aplicar() {
    if (!loteGmd || !dataGmd || idsDoLote.length === 0) return;
    setAplicando(true);
    setRecadoGmd(null);
    try {
      const res = await fetch('/FI_FCG/api/gmd-lote', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsDoLote, dataInicio: dataGmd }),
      });
      if (!res.ok) {
        setRecadoGmd('Não consegui gravar — tenta de novo.');
        return;
      }
      const r = (await res.json()) as {
        animaisAtualizados: number;
        pesagensAtualizadas: number;
        linhasEngordaCriadas: number;
      };
      setRecadoGmd(
        `Pronto: ${formatNumber(r.animaisAtualizados)} animal(is) e ${formatNumber(r.pesagensAtualizadas)} pesagem(ns) recalculadas · ${formatNumber(r.linhasEngordaCriadas)} lançamento(s) na aba Engorda.`,
      );
      setPrevia(null);
      router.refresh();
    } finally {
      setAplicando(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---------- 1. Formar lote ---------- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">1. Formar lote a partir de uma pesagem</h2>

        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Data da pesagem"
            info={INFO_DATA_PESAGEM}
            placeholder="Escolha a data"
            value={dataPesagem}
            onChange={(v) => {
              setDataPesagem(v);
              setDesmarcados(new Set());
              setRecadoLote(null);
            }}
            options={datas}
            labelDe={(v) => formatDia(Number(v))}
            triggerClassName="w-full sm:w-44"
          />
          <FilterSelect
            label="Fazenda"
            value={fazenda}
            onChange={(v) => {
              setFazenda(v);
              setDesmarcados(new Set());
            }}
            options={fazendas}
          />
        </div>

        {!dataPesagem ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Escolha uma data de pesagem pra ver os animais daquele dia.
          </p>
        ) : candidatos.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhum animal ativo nessa pesagem.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{formatNumber(marcados.length)}</span> de {formatNumber(candidatos.length)}{' '}
                marcados
                {omitidos > 0 && (
                  <span className="text-muted-foreground"> · {formatNumber(omitidos)} vendido(s)/baixado(s) omitido(s)</span>
                )}
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setDesmarcados(new Set())}>
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setDesmarcados(new Set(candidatos.map((c) => c.id)))}
                >
                  Desmarcar todos
                </Button>
              </div>
            </div>

            <ul className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/60">
              {candidatos.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-3 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-primary"
                    checked={!desmarcados.has(c.id)}
                    onChange={() => alternar(c.id)}
                    aria-label={`Incluir ${c.id}`}
                  />
                  <span className="flex-1 truncate text-foreground">{c.id}</span>
                  <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{formatNumber(c.pesoKg)} kg</span>
                  <span className="w-44 shrink-0 truncate text-right text-muted-foreground">
                    {c.loteAtual ? `lote atual: ${c.loteAtual}` : 'sem lote'}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <CampoLabel texto="Nome do lote" info={INFO_NOME_LOTE} />
                <Input
                  value={nomeLote}
                  onChange={(e) => setNomeLote(e.target.value)}
                  placeholder="Ex: Engorda 1 - Inhumas"
                  className="h-8 w-64"
                />
              </div>
              <Button type="button" size="sm" disabled={salvandoLote || !nomeLote.trim() || marcados.length === 0} onClick={salvarLote}>
                {salvandoLote ? 'Gravando...' : `Formar lote com ${formatNumber(marcados.length)}`}
              </Button>
            </div>

            {loteJaExiste && (
              <p className="mt-2 text-xs text-amber-400">
                Já existe um lote com esse nome — os animais marcados vão entrar nele, sem criar um repetido.
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Grava o lote no cadastro (RebanhoProd) de cada animal marcado, substituindo o lote anterior dele.
            </p>
            {recadoLote && <p className="mt-2 text-xs text-emerald-400">{recadoLote}</p>}
          </div>
        )}
      </section>

      {/* ---------- 2. Iniciar / editar GMD ---------- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">2. Iniciar / editar a data de GMD de um lote</h2>

        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Lote"
            placeholder="Selecione o lote"
            value={loteGmd}
            onChange={(v) => {
              setLoteGmd(v);
              setPrevia(null);
              setRecadoGmd(null);
            }}
            options={lotesComAnimais.map(([nome]) => nome)}
            labelDe={(v) => `${v} (${lotesComAnimais.find(([n]) => n === v)?.[1] ?? 0})`}
            triggerClassName="w-full sm:w-64"
          />
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Data de início do GMD" info={INFO_DATA_GMD} />
            <Input
              type="date"
              value={dataGmd}
              onChange={(e) => {
                setDataGmd(e.target.value);
                setPrevia(null);
              }}
              className="h-8 w-44"
            />
          </div>
          <Button type="button" size="sm" variant="outline" disabled={carregandoPrevia || !loteGmd || !dataGmd} onClick={verPrevia}>
            {carregandoPrevia ? 'Calculando...' : 'Ver prévia'}
          </Button>
        </div>

        {loteGmd && (
          <p className="text-xs text-muted-foreground">
            {formatNumber(idsDoLote.length)} animal(is) ativo(s) no lote {loteGmd}.
          </p>
        )}

        {previa && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              Vai recalcular <span className="font-semibold">{formatNumber(previa.totalAnimais)}</span> animal(is) e{' '}
              <span className="font-semibold">{formatNumber(previa.totalPesagens)}</span> pesagem(ns).
            </p>
            {previa.semPesagemNoPeriodo.length > 0 && (
              <p className="mt-1 text-xs text-amber-400">
                {formatNumber(previa.semPesagemNoPeriodo.length)} animal(is) sem nenhuma pesagem a partir dessa data — ficam de
                fora (não inventamos peso de entrada).
              </p>
            )}
            {previa.naoEncontrados.length > 0 && (
              <p className="mt-1 text-xs text-amber-400">
                {formatNumber(previa.naoEncontrados.length)} não encontrado(s) no cadastro.
              </p>
            )}

            <ul className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/60">
              {previa.mudancas.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-xs">
                  <span className="w-40 shrink-0 truncate text-foreground">{m.id}</span>
                  <span className="text-muted-foreground">
                    entra com <span className="tabular-nums text-foreground">{formatNumber(m.pesoEntradaKg)} kg</span> (
                    {formatDia(m.dataPesoEntrada)})
                  </span>
                  <span className="text-muted-foreground">
                    dias: <span className="tabular-nums">{m.diasDe == null ? '—' : formatNumber(m.diasDe)}</span> →{' '}
                    <span className="font-semibold tabular-nums text-foreground">{formatNumber(m.diasPara)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    GMD: <span className="tabular-nums">{m.gmdDe == null ? '—' : formatNumber(m.gmdDe)}</span> →{' '}
                    <span className="font-semibold tabular-nums text-foreground">
                      {m.gmdPara == null ? '—' : formatNumber(m.gmdPara)}
                    </span>
                  </span>
                  <Badge variant="outline">{formatNumber(m.pesagensAfetadas)} pesagem(ns)</Badge>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-3">
              <Button type="button" size="sm" disabled={aplicando || previa.totalAnimais === 0} onClick={aplicar}>
                {aplicando ? 'Gravando...' : 'Confirmar e gravar'}
              </Button>
              <span className="text-xs text-muted-foreground">
                Pesagens anteriores a essa data ficam intocadas.
              </span>
            </div>
          </div>
        )}

        {recadoGmd && <p className="text-xs text-emerald-400">{recadoGmd}</p>}
      </section>
    </div>
  );
}
