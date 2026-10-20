'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Archive, ChevronDown, Download, ExternalLink, PackageCheck, Plus, RefreshCw, Undo2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { acertarEstoque, alterarControle, alterarEstado, desfazerVenda, exportarEstado, registrarVenda, sincronizarEstado, substituirEstado, useEstadoPedidos } from '@/lib/pedidos/estado';
import {
  dataDoPedido,
  GRUPOS,
  linhasDePedidos,
  pecasPorUnidade,
  precoDeCompra,
  resumirPorGrupo,
  temProblema,
  totalEmReais,
  type Aduana,
  type Controle,
  type Entrega,
  type EstadoPedidos,
  type Grupo,
  type LinhaPedido,
  type Pagamento,
  type PrecoProduto,
  type Snapshot,
} from '@/lib/pedidos/tipos';

const cartao = 'rounded-2xl border border-border bg-card p-4 sm:p-5';
const rotulo = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
const seletor = 'h-9 rounded-md border border-input bg-input/30 px-2 text-sm text-foreground';

type Tom = 'bom' | 'neutro' | 'aviso' | 'ruim';
const TONS: Record<Tom, string> = {
  bom: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  neutro: 'border-border bg-muted/40 text-muted-foreground',
  aviso: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  ruim: 'border-red-500/50 bg-red-500/15 text-red-300',
};

const PAGAMENTO: Record<Pagamento, [string, Tom]> = {
  ok: ['Pagamento aprovado', 'bom'],
  pendente: ['Aguardando pagamento', 'aviso'],
  problema: ['Problema no pagamento', 'ruim'],
  desconhecido: ['Pagamento: ?', 'neutro'],
};
const ADUANA: Record<Aduana, [string, Tom]> = {
  nao_se_aplica: ['Sem aduana', 'neutro'],
  aguardando: ['Aduana: aguardando', 'neutro'],
  em_andamento: ['Na aduana', 'aviso'],
  imposto_pendente: ['Imposto pendente', 'ruim'],
  concluida: ['Desembaraço concluído', 'bom'],
  problema: ['Problema na aduana', 'ruim'],
  desconhecido: ['Aduana: ?', 'neutro'],
};
const ENTREGA: Record<Entrega, [string, Tom]> = {
  a_caminho: ['A caminho', 'aviso'],
  entregue: ['Entregue', 'bom'],
  problema: ['Problema na entrega', 'ruim'],
  cancelado: ['Cancelado', 'neutro'],
  desconhecido: ['Entrega: ?', 'neutro'],
};

function Selo({ texto, tom }: { texto: string; tom: Tom }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', TONS[tom])}>{texto}</span>;
}

function quando(iso: string, agora: number): string {
  const min = Math.max(0, Math.round((agora - Date.parse(iso)) / 60_000));
  if (!Number.isFinite(min)) return '—';
  if (min < 2) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.round(min / 60)} h`;
  return `há ${Math.round(min / 1440)} d`;
}

const real = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dolar = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
/** "2026-11-07" -> "7 nov" */
const diaMes = (iso: string) => `${Number(iso.slice(8, 10))} ${MES[Number(iso.slice(5, 7)) - 1]}`;
const janela = (de: string, ate: string) => `${diaMes(de)} – ${diaMes(ate)}`;
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ── dados externos ─────────────────────────────────────────────────────── */

/** Snapshot do coletor, via rota local (vazio fora do Mac). */
function useSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [agora, setAgora] = useState(0);

  const buscar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await fetch('/pedidos/api/snapshot', { cache: 'no-store' });
      if (r.status === 401) {
        window.location.assign('/pedidos/login');
        return;
      }
      const j = (await r.json()) as { snapshot: Snapshot | null };
      setSnapshot(j.snapshot);
    } catch {
      // Servidor fora: mantém o que já tinha.
    } finally {
      setAgora(Date.now());
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // O setState acontece depois do await, não no corpo do efeito.
    const primeira = window.setTimeout(buscar, 0);
    const id = window.setInterval(buscar, 60_000);
    return () => {
      window.clearTimeout(primeira);
      window.clearInterval(id);
    };
  }, [buscar]);

  return { snapshot, carregando, agora, buscar };
}

interface Dolar {
  atual: { data: string; valor: number } | null;
  serie: Array<{ data: string; valor: number }>;
}

function useDolar(): Dolar | null {
  const [d, setD] = useState<Dolar | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch('/pedidos/api/dolar')
      .then((r) => r.json() as Promise<Dolar>)
      .then((j) => vivo && setD(j))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  return d;
}

type Acompanhar = Partial<Record<Grupo, boolean>>;

/** Quais produtos o coletor acompanha (arquivo local no Mac; `local` = false fora dele, onde não dá para mudar). */
function useAjustes() {
  const [acompanhar, setAcompanhar] = useState<Acompanhar>({ microchip: true, leitor: false });
  const [local, setLocal] = useState(false);
  useEffect(() => {
    let vivo = true;
    fetch('/pedidos/api/ajustes', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ ajustes: { acompanhar: Acompanhar }; local: boolean }>)
      .then((j) => {
        if (!vivo) return;
        setAcompanhar(j.ajustes.acompanhar);
        setLocal(j.local);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  const alternar = useCallback(async (grupo: Grupo, ligado: boolean) => {
    setAcompanhar((a) => ({ ...a, [grupo]: ligado }));
    try {
      await fetch('/pedidos/api/ajustes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grupo, acompanhar: ligado }) });
    } catch {
      setAcompanhar((a) => ({ ...a, [grupo]: !ligado }));
    }
  }, []);
  return { acompanhar, local, alternar };
}

/** Histórico diário de preços (um por dia e produto), do mais antigo ao mais novo. */
function useHistoricoPrecos(atualizadoEm: string | undefined): PrecoProduto[] {
  const [h, setH] = useState<PrecoProduto[]>([]);
  useEffect(() => {
    let vivo = true;
    fetch('/pedidos/api/precos', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ historico: PrecoProduto[] }>)
      .then((j) => vivo && setH(j.historico))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [atualizadoEm]);
  return h;
}

/* ── painel ─────────────────────────────────────────────────────────────── */

export function PedidosPainel() {
  const estado = useEstadoPedidos();
  const dados = useSnapshot();
  const cotacao = useDolar();
  const ajustes = useAjustes();
  useEffect(() => {
    const primeira = window.setTimeout(sincronizarEstado, 0);
    const id = window.setInterval(sincronizarEstado, 60_000);
    return () => {
      window.clearTimeout(primeira);
      window.clearInterval(id);
    };
  }, []);
  const historico = useHistoricoPrecos(dados.snapshot?.atualizadoEm);
  if (!estado) {
    return <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-sm text-muted-foreground">Carregando…</main>;
  }
  return <Painel estado={estado} cotacao={cotacao} ajustes={ajustes} historico={historico} {...dados} />;
}

function Painel({
  estado,
  cotacao,
  ajustes,
  historico,
  snapshot,
  carregando,
  agora,
  buscar,
}: { estado: EstadoPedidos; cotacao: Dolar | null; ajustes: ReturnType<typeof useAjustes>; historico: PrecoProduto[] } & ReturnType<typeof useSnapshot>) {
  const pedidosAli = useMemo(() => snapshot?.pedidos ?? [], [snapshot]);
  const linhas = useMemo(() => linhasDePedidos(pedidosAli, estado.manuais, estado.controles), [pedidosAli, estado]);
  const resumo = useMemo(() => resumirPorGrupo(linhas, estado.vendas, estado.base), [linhas, estado.vendas, estado.base]);

  const alertas = useMemo(() => pedidosAli.filter((p) => temProblema(p) && !estado.controles[p.id]?.arquivado), [pedidosAli, estado.controles]);
  const vistoMs = estado.vistoEm ? Date.parse(estado.vistoEm) : 0;
  const mudancasNovas = (snapshot?.mudancas ?? []).filter((m) => Date.parse(m.em) > vistoMs);

  const aCaminho = useMemo(
    () =>
      linhas
        .filter((l) => !l.recebido && !l.cancelado && !estado.controles[l.id]?.arquivado)
        .sort((a, b) => (a.ali?.previsao?.ate ?? '9999').localeCompare(b.ali?.previsao?.ate ?? '9999')),
    [linhas, estado.controles],
  );
  const chegaram = useMemo(() => linhas.filter((l) => l.recebido && !estado.controles[l.id]?.arquivado), [linhas, estado.controles]);
  const outros = useMemo(() => linhas.filter((l) => l.cancelado || estado.controles[l.id]?.arquivado), [linhas, estado.controles]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Meus pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">AliExpress · chegadas, estoque e vendas</p>
        </div>
        <Button variant="outline" size="sm" onClick={buscar} disabled={carregando}>
          <RefreshCw className={cn('size-4', carregando && 'animate-spin')} /> Atualizar
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <StatusColeta snapshot={snapshot} agora={agora} />
        {alertas.length > 0 && <Atencao alertas={alertas} />}
        {mudancasNovas.length > 0 && (
          <section className={cartao}>
            <div className="flex items-center justify-between gap-3">
              <p className={rotulo}>Mudou desde a última vez</p>
              <Button variant="ghost" size="sm" onClick={() => alterarEstado((e) => ({ ...e, vistoEm: new Date().toISOString() }))}>
                Marcar como visto
              </Button>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {mudancasNovas.slice(0, 12).map((m, i) => (
                <li key={`${m.pedidoId}-${m.em}-${i}`} className={cn(m.grave && 'font-medium text-red-300')}>
                  <span className="tabular-nums text-muted-foreground">{agora ? quando(m.em, agora) : ''} · </span>
                  {m.texto}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2">
          <CartaoEstoque grupo="microchip" resumo={resumo.microchip} linhas={linhas} />
          <CartaoEstoque grupo="leitor" resumo={resumo.leitor} linhas={linhas} />
        </section>

        <PrecoProdutos precos={snapshot?.precos} historico={historico} ajustes={ajustes} />

        <VaiChegar linhas={aCaminho} />
        <JaChegaram linhas={chegaram} />
        <Vendas vendas={estado.vendas} />
        <PrecoDolar linhas={linhas} cotacao={cotacao} />

        {outros.length > 0 && <Secundarios linhas={outros} controles={estado.controles} />}

        <NovoManual />
        <Backup />
      </div>

      <form action="/pedidos/api/logout" method="POST" className="mt-6">
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        O status vem do coletor que roda no seu Mac e lê a sua conta da AliExpress. Chegadas, vendas e anotações ficam salvas no servidor, atrás do login.
      </p>
    </main>
  );
}

/* ── blocos ─────────────────────────────────────────────────────────────── */

function StatusColeta({ snapshot, agora }: { snapshot: Snapshot | null; agora: number }) {
  if (!snapshot) {
    return (
      <p className={cn(cartao, 'text-sm text-muted-foreground')}>
        Coletor ainda não rodou (ou esta página está fora do seu Mac). Os pedidos lançados à mão e o estoque funcionam normalmente.
      </p>
    );
  }
  const velho = agora > 0 && agora - Date.parse(snapshot.atualizadoEm) > 36 * 3_600_000;
  if (!snapshot.ok || velho) {
    return (
      <div className={cn(cartao, 'flex items-start gap-3 border-amber-500/50 text-sm')}>
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
        <p>
          {!snapshot.ok ? `A última leitura da AliExpress falhou: ${snapshot.erro ?? 'motivo desconhecido'}.` : 'O coletor não roda há mais de um dia.'}{' '}
          Os status abaixo são da última leitura boa ({agora ? quando(snapshot.atualizadoEm, agora) : '—'}).
        </p>
      </div>
    );
  }
  return <p className="text-xs text-muted-foreground">Lido da AliExpress {agora ? quando(snapshot.atualizadoEm, agora) : ''}.</p>;
}

function Atencao({ alertas }: { alertas: Array<{ id: string; url: string; itens: Array<{ titulo: string }>; alertas: Array<{ texto: string }> }> }) {
  return (
    <section className={cn(cartao, 'border-red-500/50 bg-red-500/5')}>
      <p className="flex items-center gap-2 text-sm font-semibold text-red-300">
        <AlertTriangle className="size-4" /> Precisa de atenção ({alertas.length})
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {alertas.map((p) => (
          <li key={p.id} className="text-sm">
            <a href={p.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
              {p.itens[0]?.titulo ?? `Pedido ${p.id}`}
            </a>
            {p.alertas.map((a, i) => (
              <p key={i} className="mt-0.5 text-red-300">
                {a.texto}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CartaoEstoque({ grupo, resumo, linhas }: { grupo: Grupo; resumo: ReturnType<typeof resumirPorGrupo>[Grupo]; linhas: LinhaPedido[] }) {
  const [aberto, setAberto] = useState(false);
  const [qtd, setQtd] = useState('1');
  const [preco, setPreco] = useState('');
  const [acertando, setAcertando] = useState(false);
  const [tenho, setTenho] = useState('');
  const g = GRUPOS[grupo];
  const recebidos = linhas.filter((l) => l.grupo === grupo && l.recebido).map((l) => l.id);
  const semBase = !resumo.base && recebidos.length > 3;
  const acertar = () => {
    const n = Math.floor(Number(tenho));
    if (!(n >= 0) || tenho.trim() === '') return;
    acertarEstoque(grupo, n, recebidos);
    setTenho('');
    setAcertando(false);
  };
  // Chips por pacote: do pedido mais recente do grupo (só faz sentido para microchip).
  const pecas = grupo === 'microchip' ? pecasPorUnidade(linhas.find((l) => l.grupo === grupo)?.titulo ?? '') : 1;

  const vender = () => {
    const n = Math.floor(Number(qtd));
    if (!(n >= 1)) return;
    const p = Number(preco.replace(',', '.'));
    registrarVenda({ grupo, qtd: n, preco: preco.trim() !== '' && Number.isFinite(p) && p >= 0 ? p : undefined });
    setQtd('1');
    setPreco('');
    setAberto(false);
  };

  return (
    <article className={cartao}>
      <p className={rotulo}>{g.nome} · em estoque</p>
      <p className={cn('mt-1 text-5xl font-semibold tabular-nums', resumo.emEstoque < 0 && 'text-red-300')}>{resumo.emEstoque}</p>
      {pecas > 1 && resumo.emEstoque > 0 && <p className="text-xs text-muted-foreground">{(resumo.emEstoque * pecas).toLocaleString('pt-BR')} chips ({g.unidade}s de {pecas})</p>}
      {resumo.emEstoque < 0 && <p className="text-xs text-red-300">Vendeu mais do que marcou como recebido.</p>}
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">A caminho</dt>
          <dd className="tabular-nums">{resumo.aCaminho}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Vendidos</dt>
          <dd className="tabular-nums">{resumo.vendido}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Comprados</dt>
          <dd className="tabular-nums">{resumo.comprado}</dd>
        </div>
      </dl>
      {resumo.proximaChegada && <p className="mt-2 text-xs text-amber-300">Próxima chegada até {diaMes(resumo.proximaChegada)}</p>}
      {semBase && (
        <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          O número acima soma {recebidos.length} pedidos antigos da conta. Toque em &quot;Acertar estoque&quot; e diga quantos você tem agora.
        </p>
      )}
      {resumo.base && <p className="mt-1 text-xs text-muted-foreground">Contando desde {new Date(resumo.base.em).toLocaleDateString('pt-BR')}, quando você tinha {resumo.base.qtd}.</p>}
      {acertando ? (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Quantos {g.unidade}s você tem agora?</span>
            <Input className="w-28" type="number" min={0} value={tenho} onChange={(e) => setTenho(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && acertar()} />
          </label>
          <Button size="sm" onClick={acertar}>
            Salvar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAcertando(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button className="mt-3 mr-2" size="sm" variant={semBase ? 'default' : 'ghost'} onClick={() => setAcertando(true)}>
          Acertar estoque
        </Button>
      )}
      {resumo.receita > 0 && <p className="mt-1 text-xs text-muted-foreground">Vendas com preço: {real(resumo.receita)}</p>}

      {aberto ? (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Quantos</span>
            <Input className="w-20" type="number" min={1} value={qtd} onChange={(e) => setQtd(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Preço un. (R$, opcional)</span>
            <Input className="w-36" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && vender()} />
          </label>
          <Button size="sm" onClick={vender}>
            Dar baixa
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button className="mt-3" size="sm" variant="outline" onClick={() => setAberto(true)} disabled={resumo.emEstoque <= 0}>
          Registrar venda
        </Button>
      )}
    </article>
  );
}

/** Linha de preços (do mais antigo ao mais novo) com a média pontilhada e o ponto de hoje. */
function Sparkline({ valores, media }: { valores: number[]; media: number | null }) {
  if (valores.length < 2) return null;
  const todos = media ? [...valores, media] : valores;
  const min = Math.min(...todos);
  const max = Math.max(...todos);
  const y = (v: number) => 44 - ((v - min) / (max - min || 1)) * 38;
  const x = (i: number) => 4 + (i / (valores.length - 1)) * 232;
  const pontos = valores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 240 48" className="h-12 w-full" role="img" aria-label="Preço ao longo dos dias, com a média pontilhada">
      {media ? <line x1="0" x2="240" y1={y(media)} y2={y(media)} stroke="currentColor" strokeDasharray="3 3" className="text-muted-foreground" /> : null}
      <polyline points={pontos} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-300" />
      <circle cx={x(valores.length - 1)} cy={y(valores[valores.length - 1])} r="3" className="fill-amber-300" />
    </svg>
  );
}

function PrecoProdutos({ precos, historico, ajustes }: { precos: Snapshot['precos']; historico: PrecoProduto[]; ajustes: ReturnType<typeof useAjustes> }) {
  const grupos: Grupo[] = ['microchip', 'leitor'];
  return (
    <section className={cartao}>
      <p className={rotulo}>Preço do produto</p>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {grupos.map((g) => {
          const ligado = ajustes.acompanhar[g] === true;
          const hoje = precos?.[g];
          const doGrupo = historico.filter((h) => h.grupo === g && h.preco != null);
          // Preço de página (sem impostos) não se mistura com o do checkout.
          const serie = (doGrupo.some((h) => h.checkout) ? doGrupo.filter((h) => h.checkout) : doGrupo).slice(-14).reverse();
          return (
            <div key={g} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {GRUPOS[g].nome}
                  {hoje?.variante ? <span className="font-normal text-muted-foreground"> · {hoje.variante}</span> : null}
                </p>
                <label className={cn('flex items-center gap-2 text-xs text-muted-foreground', !ajustes.local && 'opacity-50')}>
                  <input type="checkbox" checked={ligado} disabled={!ajustes.local} onChange={(e) => ajustes.alternar(g, e.target.checked)} />
                  Acompanhar preço
                </label>
              </div>
              {!ligado ? (
                <p className="text-xs text-muted-foreground">Não estou acompanhando o preço de {GRUPOS[g].nome.toLowerCase()}.</p>
              ) : !hoje ? (
                <p className="text-xs text-muted-foreground">Ainda não li o preço. Entra na próxima leitura do coletor.</p>
              ) : hoje.erro ? (
                <p className="text-xs text-amber-300">Não consegui ler o preço: {hoje.erro}</p>
              ) : (
                <>
                  <p className="flex flex-wrap items-baseline gap-x-3 text-sm tabular-nums">
                    <span className="text-2xl font-semibold">{real(precoDeCompra(hoje))}</span>
                    <span className="text-muted-foreground">{hoje.checkout ? '1 un., com impostos' : '1 un., SEM impostos (só da página)'}</span>
                    {hoje.dolar ? <span className="text-muted-foreground">· {dolar(precoDeCompra(hoje) / hoje.dolar)}</span> : null}
                  </p>
                  {hoje.checkout && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      produto {real(hoje.checkout.subtotal ?? 0)} + importação {real(hoje.checkout.imposto ?? 0)} + ICMS {real(hoje.checkout.icms ?? 0)}
                      {hoje.checkout.frete ? ` + frete ${real(hoje.checkout.frete)}` : ' · frete grátis'}
                    </p>
                  )}
                  {hoje.checkoutErro && <p className="text-xs text-amber-300">Não cheguei ao total com impostos: {hoje.checkoutErro}</p>}
                  {hoje.medias && hoje.medias.veredito !== 'sem_historico' && hoje.medias.media30 != null && hoje.medias.vs30 != null ? (
                    <p className={cn('text-xs font-medium', hoje.medias.veredito === 'bom' ? 'text-emerald-300' : hoje.medias.veredito === 'caro' ? 'text-red-300' : 'text-muted-foreground')}>
                      {hoje.medias.veredito === 'bom' ? '▼ bom preço' : hoje.medias.veredito === 'caro' ? '▲ caro' : '≈ na média'}: {Math.abs(hoje.medias.vs30 * 100).toFixed(1).replace('.', ',')}%{' '}
                      {hoje.medias.vs30 < 0 ? 'abaixo' : 'acima'} da média de 30 dias ({real(hoje.medias.media30)}, contando suas últimas compras)
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Histórico começando: a média de 7 e 30 dias aparece em alguns dias.</p>
                  )}
                  {hoje.alertas.map((a, i) => (
                    <p key={i} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                      {a}
                    </p>
                  ))}
                  <Sparkline valores={[...serie].reverse().map((h) => precoDeCompra(h))} media={hoje.medias?.media30 ?? null} />
                  {serie.length > 1 && (
                    <table className="w-full text-xs tabular-nums">
                      <tbody>
                        {serie.map((h) => (
                          <tr key={h.em} className="border-t border-border text-muted-foreground">
                            <td className="py-1">{diaMes(h.em.slice(0, 10))}</td>
                            <td className="py-1 text-right">{real(precoDeCompra(h))}</td>
                            <td className="py-1 text-right">{h.dolar ? dolar(precoDeCompra(h) / h.dolar) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Preço de 1 unidade com impostos, lido na tela final da compra (acima de 3 unidades o imposto sobe). O coletor nunca faz o pedido: só chega até a tela de revisão. O pedido feito na AliExpress trava o preço por até 20 dias sem pagar.
        {!ajustes.local && ' (Para ligar ou desligar o acompanhamento, abra esta página no seu Mac.)'}
      </p>
    </section>
  );
}

function Selos({ l }: { l: LinhaPedido }) {
  if (!l.ali) return <Selo texto="Lançado à mão" tom="neutro" />;
  return (
    <div className="flex flex-wrap gap-1.5">
      <Selo texto={PAGAMENTO[l.ali.pagamento][0]} tom={PAGAMENTO[l.ali.pagamento][1]} />
      <Selo texto={ADUANA[l.ali.aduana][0]} tom={ADUANA[l.ali.aduana][1]} />
      <Selo texto={ENTREGA[l.ali.entrega][0]} tom={ENTREGA[l.ali.entrega][1]} />
    </div>
  );
}

function VaiChegar({ linhas }: { linhas: LinhaPedido[] }) {
  return (
    <section className={cartao}>
      <p className={rotulo}>Vai chegar ({linhas.length})</p>
      {linhas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nada a caminho.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {linhas.map((l) => (
            <li key={l.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">{l.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {GRUPOS[l.grupo].nome} · {l.qtd} {l.qtd > 1 ? 'un.' : 'un.'}
                    {l.ali?.previsao ? ` · chega ${janela(l.ali.previsao.de, l.ali.previsao.ate)}` : l.ali ? ' · sem previsão' : ''}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => alterarControle(l.id, (x) => ({ ...x, recebido: true }))}>
                  <PackageCheck className="size-4" /> Cheguei
                </Button>
              </div>
              <Selos l={l} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function JaChegaram({ linhas }: { linhas: LinhaPedido[] }) {
  const [aberto, setAberto] = useState(false);
  if (linhas.length === 0) return null;
  return (
    <section className={cartao}>
      <button type="button" className="flex w-full items-center justify-between" onClick={() => setAberto((v) => !v)}>
        <p className={rotulo}>Já chegaram ({linhas.length})</p>
        <ChevronDown className={cn('size-5 text-muted-foreground transition-transform', aberto && 'rotate-180')} />
      </button>
      {aberto && (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {linhas.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium">{l.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {GRUPOS[l.grupo].nome} · {l.qtd} un. · {l.ali?.data ?? l.manual?.data ?? ''}
                  {!l.conta ? ' · fora do estoque' : ''}
                </p>
              </div>
              <Opcoes l={l} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Ajustes de um pedido: grupo, quantidade, fora do estoque, arquivar. */
function Opcoes({ l }: { l: LinhaPedido }) {
  const [aberto, setAberto] = useState(false);
  const numero = (t: string): number | undefined => {
    const n = Number(t);
    return t.trim() !== '' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  };
  if (!aberto) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setAberto(true)}>
        Ajustar
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <select className={seletor} aria-label="Produto" value={l.grupo} onChange={(e) => alterarControle(l.id, (x) => ({ ...x, grupo: e.target.value as Grupo }))}>
        {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
          <option key={g} value={g}>
            {GRUPOS[g].nome}
          </option>
        ))}
      </select>
      <Input className="w-20" type="number" min={0} aria-label="Quantidade" defaultValue={l.qtd} onBlur={(e) => alterarControle(l.id, (x) => ({ ...x, qtd: numero(e.target.value) }))} />
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <input type="checkbox" checked={!l.conta} onChange={(e) => alterarControle(l.id, (x) => ({ ...x, foraDoEstoque: e.target.checked }))} /> Fora do estoque
      </label>
      {l.recebido && !(l.ali?.entrega === 'entregue') && (
        <Button size="sm" variant="ghost" onClick={() => alterarControle(l.id, (x) => ({ ...x, recebido: undefined }))}>
          <Undo2 className="size-4" /> Desmarcar chegada
        </Button>
      )}
      {l.ali && (
        <Button size="sm" variant="ghost" asChild>
          <a href={l.ali.url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" /> AliExpress
          </a>
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => alterarControle(l.id, (x) => ({ ...x, arquivado: x.arquivado ? undefined : true }))}>
        <Archive className="size-4" /> Arquivar
      </Button>
    </div>
  );
}

function Vendas({ vendas }: { vendas: EstadoPedidos['vendas'] }) {
  if (vendas.length === 0) return null;
  return (
    <section className={cartao}>
      <p className={rotulo}>Vendas ({vendas.length})</p>
      <ul className="mt-3 flex flex-col divide-y divide-border text-sm">
        {vendas.slice(0, 15).map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <span>
              {new Date(v.data).toLocaleDateString('pt-BR')} · {v.qtd} × {GRUPOS[v.grupo].nome.toLowerCase()}
              {v.preco != null ? ` · ${real(v.preco)} cada` : ''}
            </span>
            <Button size="sm" variant="ghost" onClick={() => desfazerVenda(v.id)} aria-label="Desfazer esta venda">
              <Undo2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** O que o Felipe pagou por unidade em cada compra, no câmbio do dia do pedido — para ver se o preço sobe só com o dólar ou por promoção/alta do vendedor. */
function PrecoDolar({ linhas, cotacao }: { linhas: LinhaPedido[]; cotacao: Dolar | null }) {
  const dolarDoDia = useCallback(
    (iso: string): number | null => {
      if (!cotacao?.serie.length) return null;
      let achado: number | null = null;
      for (const c of cotacao.serie) {
        if (c.data <= iso) achado = c.valor;
        else break;
      }
      return achado;
    },
    [cotacao],
  );

  const grupos = (['microchip', 'leitor'] as Grupo[])
    .map((g) => {
      const compras = linhas
        .filter((l) => l.grupo === g && l.ali && !l.cancelado && l.ali.pagamento !== 'problema' && l.ali.pagamento !== 'pendente' && l.ali.itens[0]?.preco != null)
        .map((l) => {
          const d = dataDoPedido(l.ali?.data ?? null);
          const iso = d ? isoLocal(d) : null;
          const cambio = iso ? dolarDoDia(iso) : null;
          const preco = l.ali?.itens[0]?.preco ?? 0;
          const total = totalEmReais(l.ali?.total ?? null);
          return { id: l.id, iso, preco, cambio, usd: cambio ? preco / cambio : null, qtd: l.qtd, comImposto: total && l.qtd > 0 ? total / l.qtd : null };
        })
        .filter((c) => c.iso)
        .sort((a, b) => (b.iso ?? '').localeCompare(a.iso ?? ''))
        .slice(0, 10);
      return { g, compras };
    })
    .filter((x) => x.compras.length > 0);

  if (grupos.length === 0) return null;
  const hoje = cotacao?.atual?.valor ?? null;

  return (
    <section className={cartao}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={rotulo}>Preço pago × dólar</p>
        {hoje && <p className="text-sm tabular-nums">Dólar hoje: {real(hoje)}</p>}
      </div>
      {grupos.map(({ g, compras }) => {
        const usds = compras.map((c) => c.usd).filter((v): v is number => v != null);
        const menor = usds.length ? Math.min(...usds) : null;
        const ultimo = compras[0];
        const hojeEmReais = ultimo.usd && hoje ? ultimo.usd * hoje : null;
        return (
          <div key={g} className="mt-4">
            <p className="text-sm font-medium">
              {GRUPOS[g].nome} <span className="font-normal text-muted-foreground">· preço por {GRUPOS[g].unidade}</span>
            </p>
            {hojeEmReais && ultimo.usd && (
              <p className="mt-1 text-xs text-muted-foreground">
                Pelo preço em dólar da última compra ({dolar(ultimo.usd)}), hoje custaria {real(hojeEmReais)} (pagou {real(ultimo.preco)}).
              </p>
            )}
            <table className="mt-2 w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-1 font-normal">Pedido</th>
                  <th className="py-1 text-right font-normal">R$</th>
                  <th className="py-1 text-right font-normal">Dólar</th>
                  <th className="py-1 text-right font-normal">US$</th>
                  <th className="py-1 text-right font-normal">Com imposto</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="py-1.5">{c.iso ? diaMes(c.iso) : '—'}</td>
                    <td className="py-1.5 text-right">{real(c.preco)}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{c.cambio ? c.cambio.toFixed(2).replace('.', ',') : '—'}</td>
                    <td className={cn('py-1.5 text-right', menor != null && c.usd === menor && 'font-semibold text-emerald-300')}>{c.usd ? dolar(c.usd) : '—'}</td>
                    <td className="py-1.5 text-right">{c.comImposto ? `${real(c.comImposto)} (${c.qtd}×)` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      <p className="mt-3 text-xs text-muted-foreground">Dólar do dia do pedido (cotação de mercado). Verde = menor preço em dólar que você já pagou. &quot;Com imposto&quot; = total pago no pedido dividido pelas unidades, que muda com a quantidade comprada.</p>
    </section>
  );
}

function Secundarios({ linhas, controles }: { linhas: LinhaPedido[]; controles: Record<string, Controle> }) {
  const [aberto, setAberto] = useState(false);
  return (
    <section className={cartao}>
      <button type="button" className="flex w-full items-center justify-between" onClick={() => setAberto((v) => !v)}>
        <p className={rotulo}>Cancelados e arquivados ({linhas.length})</p>
        <ChevronDown className={cn('size-5 text-muted-foreground transition-transform', aberto && 'rotate-180')} />
      </button>
      {aberto && (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {linhas.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium">{l.titulo}</p>
                <p className="text-xs text-muted-foreground">{l.cancelado ? 'Cancelado' : 'Arquivado'}</p>
              </div>
              {controles[l.id]?.arquivado && (
                <Button size="sm" variant="ghost" onClick={() => alterarControle(l.id, (x) => ({ ...x, arquivado: undefined }))}>
                  Desarquivar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NovoManual() {
  const [titulo, setTitulo] = useState('');
  const [qtd, setQtd] = useState('1');
  const [grupo, setGrupo] = useState<Grupo>('microchip');
  const adicionar = () => {
    const n = Math.max(1, Math.floor(Number(qtd)) || 1);
    if (!titulo.trim()) return;
    const hoje = new Date().toLocaleDateString('pt-BR');
    alterarEstado((e) => ({ ...e, manuais: [...e.manuais, { id: `m-${Date.now().toString(36)}`, titulo: titulo.trim(), qtd: n, grupo, data: hoje }] }));
    setTitulo('');
    setQtd('1');
  };
  return (
    <section className={cartao}>
      <p className={rotulo}>Lançar compra à mão</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Input className="min-w-48 flex-1" placeholder="O que você comprou" value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionar()} />
        <select className={seletor} aria-label="Produto" value={grupo} onChange={(e) => setGrupo(e.target.value as Grupo)}>
          {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
            <option key={g} value={g}>
              {GRUPOS[g].nome}
            </option>
          ))}
        </select>
        <Input className="w-20" type="number" min={1} aria-label="Quantidade" value={qtd} onChange={(e) => setQtd(e.target.value)} />
        <Button onClick={adicionar} disabled={!titulo.trim()}>
          <Plus className="size-4" /> Adicionar
        </Button>
      </div>
    </section>
  );
}

function Backup() {
  const entrada = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState('');
  const baixar = () => {
    const url = URL.createObjectURL(new Blob([exportarEstado()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importar = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    const ok = substituirEstado(await arquivo.text());
    setAviso(ok ? 'Importado.' : 'Arquivo inválido — nada foi alterado.');
  };
  return (
    <section className={cartao}>
      <p className={rotulo}>Backup (chegadas e vendas)</p>
      <p className="mt-2 text-xs text-muted-foreground">Cópia de segurança do estoque e das vendas. Importar substitui o que há aqui.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={baixar}>
          <Download className="size-4" /> Exportar
        </Button>
        <Button size="sm" variant="outline" onClick={() => entrada.current?.click()}>
          <Upload className="size-4" /> Importar
        </Button>
        <input ref={entrada} type="file" accept="application/json" className="hidden" onChange={(e) => importar(e.target.files?.[0])} />
        {aviso && <span className="text-xs text-muted-foreground">{aviso}</span>}
      </div>
    </section>
  );
}
