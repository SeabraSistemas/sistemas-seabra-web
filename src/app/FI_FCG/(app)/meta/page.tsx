import Link from 'next/link';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { lerMeta } from '@/lib/fi-fcg/meta/dados';
import { FAZENDAS, visaoDe, chaveParam, type Visao } from '@/lib/fi-fcg/meta/fazendas';
import { CAMPOS } from '@/lib/fi-fcg/meta/campos';
import {
  CENARIOS,
  MORTALIDADE_RECRIA,
  SEMAFORO_SUGERIDO,
  alertas,
  capacidade,
  femeasPorIdade,
  frescor,
  idadeLimite,
  indicadores,
  machosDepoisDaDesmama,
  projetar,
  reposicaoProximoAno,
  taxasObservadas,
  touros,
  uaAtual,
  vacasPorIdade,
  type Contexto,
  type Indicador,
  type Parametros,
  type Ponto,
} from '@/lib/fi-fcg/meta/modelo';
import { REFERENCIAS } from '@/lib/fi-fcg/questionario/referencias';
import type { Citacao } from '@/lib/fi-fcg/questionario/perguntas';
import { CamposMeta } from '@/components/fi-fcg/meta/CamposMeta';
import { PassoAPasso } from '@/components/fi-fcg/PassoAPasso';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meta do rebanho' };

const n0 = (v: number) => Math.round(v).toLocaleString('pt-BR');
const n1 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dataBR = (s: string | null) => (s ? new Date(`${s.slice(0, 10)}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—');

function fmt(v: number | null, u: Indicador['unidade']): string {
  if (v == null) return '—';
  if (u === '%') return `${n1(v * 100)}%`;
  if (u === 'UA/ha') return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${n0(v)} ${u}`;
}

function Refs({ fontes }: { fontes: Citacao[] }) {
  if (!fontes.length) return null;
  return (
    <span className="text-muted-foreground">
      {' ['}
      {fontes.map((f, i) => (
        <span key={i}>
          {i > 0 && '; '}
          <a href={`#${f.ref}`} className="underline underline-offset-2">
            {f.ref}
          </a>
          {f.pagina ? ` ${f.pagina}` : ''}
        </span>
      ))}
      {']'}
    </span>
  );
}

/** Semáforo pela regra sugerida (±10% verde, ±25% amarelo), só onde há meta e sentido. */
function cor(ind: Indicador): string {
  const v = ind.atual?.valor;
  const m = ind.meta.valor;
  if (v == null || m == null || ind.maiorMelhor == null || m === 0) return 'border-border';
  const desvio = ind.maiorMelhor ? (m - v) / m : (v - m) / m;
  if (desvio <= SEMAFORO_SUGERIDO.verde) return 'border-emerald-500/60';
  if (desvio <= SEMAFORO_SUGERIDO.amarelo) return 'border-amber-500/60';
  return 'border-rose-500/60';
}

function rotuloPonto(p: Ponto | null) {
  if (!p) return null;
  const extra = p.completude === 'parcial' ? ' (parcial)' : p.completude === 'andamento' ? ' (em andamento)' : '';
  return `${p.y}${extra}`;
}

function CartaoIndicador({ ind }: { ind: Indicador }) {
  const semNumero = ind.faltam.length > 0;
  return (
    <article className={`flex flex-col gap-2 rounded-xl border-2 bg-card p-4 ${semNumero ? 'border-border' : cor(ind)}`}>
      <h3 className="text-sm font-medium text-muted-foreground">{ind.nome}</h3>
      {semNumero ? (
        <p className="text-sm">
          <span className="font-semibold text-amber-300">Faltam estes dados: </span>
          {ind.faltam.join(', ')}.
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{fmt(ind.atual?.valor ?? null, ind.unidade)}</span>
            <span className="text-xs text-muted-foreground">{ind.atual ? (ind.periodo === 'hoje' ? 'hoje' : `${ind.periodo} ${ind.atual.y}`) : `sem ${ind.periodo} completo`}</span>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
            <dt className="text-muted-foreground">Anterior</dt>
            <dd className="tabular-nums">
              {ind.anterior ? `${fmt(ind.anterior.valor, ind.unidade)} · ${rotuloPonto(ind.anterior)}` : ind.periodo === 'hoje' ? '—' : `sem ${ind.periodo} completo antes (2024 é parcial: o histórico começa em jun/2024)`}
            </dd>
            <dt className="text-muted-foreground">Média</dt>
            <dd className="tabular-nums">
              {ind.media.valor == null
                ? '—'
                : `${fmt(ind.media.valor, ind.unidade)} · ${ind.media.n === 3 ? (ind.periodo === 'ano' ? '3 anos' : '3 estações') : `${ind.media.n} ${ind.periodo === 'ano' ? (ind.media.n === 1 ? 'ano' : 'anos') : ind.media.n === 1 ? 'estação' : 'estações'}; faltam ${3 - ind.media.n} para 3 (o histórico começa em jun/2024)`}`}
            </dd>
            <dt className="text-muted-foreground">Meta</dt>
            <dd>
              {ind.meta.valor == null ? 'sem meta' : fmt(ind.meta.valor, ind.unidade)}
              {ind.meta.origem === 'sugerida' ? (
                <span className="ml-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-1.5 py-px text-[10px] font-semibold text-sky-300">
                  meta sugerida, aguardando sua aprovação
                </span>
              ) : (
                <span className="ml-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-px text-[10px] font-semibold text-emerald-300">sua meta</span>
              )}
            </dd>
          </dl>
          {ind.meta.origem === 'sugerida' && (
            <p className="text-xs text-muted-foreground">
              {ind.meta.texto}
              <Refs fontes={ind.meta.fontes} />
            </p>
          )}
          {ind.pontos.some((p) => p.falta) && (
            <p className="text-xs text-amber-300">
              {ind.pontos
                .filter((p) => p.falta)
                .map((p) => `${p.y}: ${p.falta}`)
                .join(' · ')}
            </p>
          )}
        </>
      )}
      {ind.avisos.map((a) => (
        <p key={a} className="text-xs text-amber-300">
          {a}
        </p>
      ))}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Como calculo</summary>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">Fórmula</dt>
          <dd>{ind.ficha.formula}</dd>
          <dt className="text-muted-foreground">Numerador</dt>
          <dd>{ind.ficha.numerador}</dd>
          <dt className="text-muted-foreground">Denominador</dt>
          <dd>{ind.ficha.denominador}</dd>
          <dt className="text-muted-foreground">Janela</dt>
          <dd>{ind.ficha.janela}</dd>
          <dt className="text-muted-foreground">Unidade</dt>
          <dd>{ind.ficha.unidade}</dd>
          <dt className="text-muted-foreground">Fonte</dt>
          <dd>{ind.ficha.fonte}</dd>
        </dl>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="font-normal">{ind.periodo === 'ano' ? 'Ano' : 'Estação'}</th>
              <th className="font-normal">Valor</th>
              <th className="font-normal">Conta</th>
            </tr>
          </thead>
          <tbody>
            {ind.pontos.map((p) => (
              <tr key={p.y}>
                <td>{rotuloPonto(p)}</td>
                <td>{fmt(p.valor, ind.unidade)}</td>
                <td className="text-muted-foreground">
                  {n0(p.numerador)} ÷ {p.denominador ? n0(p.denominador) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </article>
  );
}

function Faltam({ itens }: { itens: string[] }) {
  if (!itens.length) return null;
  return (
    <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
      <span className="font-semibold text-amber-300">Faltam estes dados: </span>
      {itens.join('; ')}.{' '}
      <a href="#campos" className="underline underline-offset-2">
        Preencher
      </a>
    </p>
  );
}

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 space-y-3">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function numP(p: Parametros, k: string): number | null {
  const v = p[k];
  return typeof v === 'number' ? v : null;
}

export default async function MetaPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await exigirSessao();
  const { f } = await searchParams;
  const visao: Visao = visaoDe(f);
  const lido = await lerMeta();

  if (!lido.ok) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Meta do rebanho</h1>
        <p className="mt-2 text-sm text-rose-300">Não consegui ler o banco: {lido.erro}</p>
      </section>
    );
  }

  const hoje = new Date();
  const ids = visao === 'grupo' ? FAZENDAS.map((x) => x.id as number) : [visao];
  const fazendas = lido.fazendas.filter((x) => ids.includes(x.propriedade_id));
  const p = lido.parametros;
  const areas = ids.map((id) => numP(p, chaveParam('area_util_ha', id)));
  const areaUtil = areas.every((a) => a != null) ? (areas as number[]).reduce((a, b) => a + b, 0) : null;
  const ctx: Contexto = { hoje, fazendas, parametros: p, areaUtil };

  const ind = indicadores(ctx);
  const cap = capacidade(
    p,
    ids.map((id) => ({
      limpo: numP(p, chaveParam('area_campo_limpo_ha', id)),
      caronal: numP(p, chaveParam('area_caronal_ha', id)),
      cerrado: numP(p, chaveParam('area_cerrado_ha', id)),
      cultivada: numP(p, chaveParam('area_cultivada_ha', id)),
      alaga: numP(p, chaveParam('area_alaga_ha', id)),
    })),
  );
  const custos = CAMPOS.filter((c) => c.chave.startsWith('custo.')).map((c) => numP(p, c.chave));
  const custosPreenchidos = custos.some((c) => c != null);
  const { alertas: als, semDados } = alertas(ctx, ind, cap, custosPreenchidos);
  const fr = frescor(fazendas, hoje);
  const ua = uaAtual(fazendas);
  const lim = idadeLimite(p);
  const rep = reposicaoProximoAno(ctx);
  const taxas = taxasObservadas(ctx);
  const vacas = vacasPorIdade(fazendas);
  const totalVacas = [...vacas.values()].reduce((a, b) => a + b, 0);
  const maxV = Math.max(1, ...vacas.values());
  const camposGravados = Object.entries(lido.gravacoes).filter(([k]) => !k.startsWith('questionario.')).map(([, g]) => g);
  const nGrav = camposGravados.length;
  const ultimaGrav = camposGravados
    .map((g) => g.gravado_em)
    .sort()
    .at(-1);

  // faltas gerais
  const faltasGerais: string[] = [];
  if (areaUtil == null) faltasGerais.push('área de pasto útil');
  if (cap.faltam.length) faltasGerais.push(...cap.faltam.map((x) => x.toLowerCase()));
  if (p['estacao_vacas'] == null) faltasGerais.push('estação de monta');
  if (p['vazia_regra'] == null) faltasGerais.push('regra da vaca vazia');
  if (!custosPreenchidos) faltasGerais.push('custos');
  if (numP(p, 'preco_bezerro_kg') == null) faltasGerais.push('preços');
  const metasSugeridas = ind.filter((i) => i.meta.origem === 'sugerida' && i.meta.valor != null).length;

  // rebanho-meta
  const metaMatrizes = ids.map((id) => numP(p, chaveParam('meta_matrizes', id)));
  const vMeta = metaMatrizes.every((m) => m != null) ? (metaMatrizes as number[]).reduce((a, b) => a + b, 0) : null;
  const V = vMeta ?? totalVacas;
  const s = taxas?.saidaVacas ?? null;
  const R = s != null ? V * s : null;
  const h2 = R != null ? R / (1 - MORTALIDADE_RECRIA) : null;
  const h1 = h2 != null ? h2 / (1 - MORTALIDADE_RECRIA) : null;
  const h0 = h1 != null ? h1 / (1 - MORTALIDADE_RECRIA) : null;
  const machos0 = taxas ? ((V + (h2 ?? 0)) * taxas.nascidosPorTocada * (1 - taxas.mortPreDesmama)) / 2 : null;
  const repassePct = numP(p, 'femeas_repasse_pct');
  const fpt = numP(p, 'femeas_por_touro');
  const tourosMeta = repassePct != null && fpt ? ((V + (h2 ?? 0)) * (repassePct / 100)) / fpt : null;
  const machos0Real = fazendas.reduce((t, x) => t + x.faixas.filter((y) => y.sexo === 'macho' && y.faixa === '0').reduce((a, y) => a + y.n, 0), 0);
  const linhasMeta: { cat: string; real: number; meta: number | null; nota: React.ReactNode }[] = [
    { cat: 'Vacas (3 anos ou mais)', real: totalVacas, meta: V, nota: vMeta != null ? 'sua meta de matrizes' : 'meta de matrizes em branco: uso as vacas de hoje como referência' },
    { cat: 'Novilhas de 2–3 anos', real: femeasPorIdade(fazendas, 2), meta: h2, nota: <>reposição de um ano (vacas × taxa de saída de {s != null ? n1(s * 100) : '—'}% em {taxas?.anos.saida}), com 1% de morte na recria [R2 p.4]</> },
    { cat: 'Fêmeas de 1–2 anos', real: femeasPorIdade(fazendas, 1), meta: h1, nota: 'as novilhas do ano seguinte, com 1% de morte' },
    { cat: 'Bezerras até 1 ano', real: femeasPorIdade(fazendas, 0), meta: h0, nota: 'só as que precisam ficar para a reposição; o resto é venda' },
    { cat: 'Bezerros machos até 1 ano', real: machos0Real, meta: machos0, nota: 'metade dos desmamados, pela taxa de nascidos vivos e de mortalidade de hoje' },
    { cat: 'Machos depois da desmama', real: machosDepoisDaDesmama(fazendas), meta: 0, nota: <>na cria, o macho sai na desmama <Refs fontes={[{ ref: 'R2', pagina: 'p.5' }, { ref: 'R52', pagina: 'p.17–18' }]} /></> },
    { cat: 'Touros', real: touros(fazendas), meta: tourosMeta, nota: tourosMeta == null ? 'faltam: fêmeas que vão ao repasse e fêmeas por touro' : 'fêmeas expostas × % no repasse ÷ fêmeas por touro' },
  ];

  const fontesCitadas = ['R2', 'R4', 'R5', 'R13', 'R25', 'R28', 'R29', 'R39', 'R41', 'R50', 'R51', 'R52', 'R3'];
  const refs = REFERENCIAS.filter((r) => fontesCitadas.includes(r.id));
  const nomeVisao = visao === 'grupo' ? 'As duas fazendas' : FAZENDAS.find((x) => x.id === visao)!.nome;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Meta do rebanho</h1>
        <PassoAPasso />
        <nav aria-label="Fazenda" className="flex flex-wrap gap-2 text-sm">
          {[{ id: 'grupo', nome: 'As duas fazendas' }, ...FAZENDAS.map((x) => ({ id: String(x.id), nome: x.nome }))].map((o) => (
            <Link
              key={o.id}
              href={o.id === 'grupo' ? '/FI_FCG/meta' : `/FI_FCG/meta?f=${o.id}`}
              className={`rounded-full px-4 py-1.5 font-medium ${String(visao) === o.id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {o.nome}
            </Link>
          ))}
        </nav>
        <dl className="grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <dt className="inline">Lido no banco em </dt>
            <dd className="inline text-foreground">{new Date(fazendas[0]?.lido_em ?? hoje).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</dd>
          </div>
          <div>
            <dt className="inline">Lançamento mais recente recebido da planilha: </dt>
            <dd className={`inline ${fr.desatualizado ? 'text-amber-300' : 'text-foreground'}`}>
              {dataBR(fr.ultimo)}
              {fr.dias != null && ` (${fr.dias} dias)`}
            </dd>
          </div>
          <div>
            <dt className="inline">Campos gravados por você: </dt>
            <dd className="inline text-foreground">
              {nGrav}
              {ultimaGrav && `, o último em ${new Date(ultimaGrav).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`}
            </dd>
          </div>
        </dl>
        {fr.desatualizado && (
          <p className="text-sm text-amber-300">Dados desatualizados: o último lançamento recebido tem mais de 7 dias. A planilha é copiada para o sistema quando é pedido.</p>
        )}
        <Faltam itens={faltasGerais} />
        {metasSugeridas > 0 && (
          <p className="text-sm text-muted-foreground">
            {metasSugeridas} metas são sugestões minhas tiradas da literatura, aguardando sua aprovação. Para aprovar ou trocar,{' '}
            <a href="#campos" className="underline underline-offset-2">
              grave a sua meta
            </a>
            .
          </p>
        )}
      </header>

      <Secao id="alertas" titulo="Alertas">
        {als.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum alerta de prioridade alta com os dados que tenho.</p>
        ) : (
          <ul className="space-y-2">
            {als.map((a) => (
              <li key={a.texto} className="rounded-lg border border-rose-500/50 bg-rose-500/10 p-3 text-sm">
                {a.texto}
              </li>
            ))}
          </ul>
        )}
        {semDados.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {semDados.map((x) => (
              <li key={x}>Não consigo avaliar: {x}</li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao id="indicadores" titulo={`Indicadores · ${nomeVisao}`}>
        <p className="text-xs text-muted-foreground">
          Cor da borda pela regra sugerida, aguardando sua aprovação: verde até {SEMAFORO_SUGERIDO.verde * 100}% abaixo da meta, amarelo até {SEMAFORO_SUGERIDO.amarelo * 100}%, vermelho além. É regra minha, não da literatura.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ind.map((i) => (
            <CartaoIndicador key={i.chave} ind={i} />
          ))}
        </div>
      </Secao>

      <Secao id="lotacao" titulo="Lotação e capacidade do pasto">
        <p className="text-sm">
          Rebanho de hoje: <strong>{n0(ua.cabecas)}</strong> cabeças, <strong>{n0(ua.ua)}</strong> UA (1 UA = 450 kg [<a href="#R51" className="underline">R51</a> p.19]).{' '}
          {ua.semPeso > 0 && (
            <span className="text-muted-foreground">
              {n0(ua.semPeso)} animais sem pesagem entram pela tabela de UA por idade [<a href="#R50" className="underline">R50</a> p.8]
              {ua.semIdade > 0 && `; ${n0(ua.semIdade)} sem idade ficam fora`}.
            </span>
          )}
        </p>
        <Faltam itens={cap.faltam} />
        {cap.uaCapacidade != null && (
          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Capacidade no ano</dt>
              <dd className="text-2xl font-semibold">{n0(cap.uaCapacidade)} UA</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Na cheia</dt>
              <dd className="text-2xl font-semibold">{cap.uaCheia == null ? '—' : `${n0(cap.uaCheia)} UA`}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Limite com a sua reserva</dt>
              <dd className="text-2xl font-semibold">{cap.limite == null ? '—' : `${n0(cap.limite)} UA`}</dd>
              {cap.limite != null && <dd className="text-xs text-muted-foreground">uso de {n0((ua.ua / cap.limite) * 100)}% do limite</dd>}
            </div>
          </dl>
        )}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Como calculo</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {(cap.conta.length ? cap.conta : capacidade({}, [{ limpo: 0, caronal: 0, cerrado: 0, cultivada: 0, alaga: 0 }]).conta).map((x) => (
              <li key={x}>{x}</li>
            ))}
            <li>Capacidade = Σ (área × matéria seca × fator de uso) ÷ consumo do ano, mais o pasto cultivado; a lotação limite é a da estação mais apertada (a cheia), menos a sua reserva.</li>
          </ul>
        </details>
      </Secao>

      <Secao id="rebanho-meta" titulo="Rebanho-meta × real">
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-left text-sm tabular-nums">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-3 font-medium">Categoria</th>
                <th className="p-3 font-medium">Real</th>
                <th className="p-3 font-medium">Meta</th>
                <th className="p-3 font-medium">Diferença</th>
                <th className="p-3 font-medium">Como a meta sai</th>
              </tr>
            </thead>
            <tbody>
              {linhasMeta.map((l) => {
                const d = l.meta == null ? null : l.real - l.meta;
                return (
                  <tr key={l.cat} className="border-b border-border last:border-0">
                    <td className="p-3">{l.cat}</td>
                    <td className="p-3">{n0(l.real)}</td>
                    <td className="p-3">{l.meta == null ? '—' : n0(l.meta)}</td>
                    <td className={`p-3 ${d == null ? '' : d > 0 ? 'text-sky-300' : d < 0 ? 'text-amber-300' : ''}`}>
                      {d == null ? '—' : `${d > 0 ? '+' : ''}${n0(d)} ${d > 0 ? 'sobra' : d < 0 ? 'falta' : ''}`}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{l.nota}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Rebanho estável: as novilhas que entram repõem as vacas que saem [<a href="#R51" className="underline">R51</a> p.21]. A taxa de saída é a observada no banco; quando você responder a regra da vaca vazia, ela passa a valer.
        </p>
      </Secao>

      <Secao id="vacas" titulo="Vacas por idade">
        <div className="space-y-1">
          {[...vacas.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([i, n]) => (
              <div key={i} className="grid grid-cols-[64px_1fr_56px] items-center gap-2 text-xs tabular-nums">
                <span className={i >= lim.valor ? 'text-amber-300' : 'text-muted-foreground'}>{i === 20 ? '20 ou +' : `${i} anos`}</span>
                <div className="h-3 rounded-sm bg-muted">
                  <div className={`h-3 rounded-sm ${i >= lim.valor ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(n / maxV) * 100}%` }} />
                </div>
                <span className="text-right">{n0(n)}</span>
              </div>
            ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Em amarelo, as vacas na idade-limite de {lim.valor} anos ou acima ({lim.origem === 'sergio' ? 'valor que você gravou' : 'você disse 12 a 13 anos na ligação de 17/11; uso 12 até você gravar'}).
        </p>
      </Secao>

      <Secao id="reposicao" titulo="Reposição do próximo ano">
        {rep == null ? (
          <p className="text-sm text-muted-foreground">Sem estação completa para calcular.</p>
        ) : (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Saem por idade ({rep.idadeLimite} anos ou mais no próximo ano)</dt>
              <dd className="text-2xl font-semibold">{n0(rep.porIdade)}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Mortes esperadas de vaca (taxa de {taxas ? n1(taxas.morteVacas * 100) : '—'}% em {taxas?.anos.saida})</dt>
              <dd className="text-2xl font-semibold">{n0(rep.mortesEsperadas)}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Vazias no último toque</dt>
              <dd className="text-2xl font-semibold">{n0(rep.vazias)}</dd>
              <dd className="text-xs text-amber-300">{p['vazia_regra'] == null ? 'Não entram na conta: falta a regra da vaca vazia.' : 'Entram conforme a regra que você gravou.'}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Novilhas que chegam aos 3 anos ÷ necessárias</dt>
              <dd className={`text-2xl font-semibold ${rep.saldo < 0 ? 'text-amber-300' : ''}`}>
                {n0(rep.disponiveis)} ÷ {n0(rep.necessarias)}
              </dd>
              <dd className="text-xs text-muted-foreground">{rep.saldo >= 0 ? `sobram ${n0(rep.saldo)}` : `faltam ${n0(-rep.saldo)}`}</dd>
            </div>
          </dl>
        )}
      </Secao>

      <Secao id="projecao" titulo="Projeção de 1, 3 e 5 anos">
        <p className="text-xs text-muted-foreground">
          Modelo de idades: a cada ano as vacas envelhecem, saem as que chegam à idade-limite e as outras pela taxa de saída; as novilhas entram até repor o número de vacas{' '}
          {vMeta != null ? 'da sua meta' : 'de hoje'}. &ldquo;Como estou&rdquo; usa as taxas observadas; &ldquo;Com as metas&rdquo; usa as metas da página. Nada é gravado.
        </p>
        {CENARIOS.map((c) => {
          const proj = projetar(ctx, c.id);
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-medium">{c.nome}</h3>
              {proj == null ? (
                <p className="mt-1 text-sm">
                  <span className="font-semibold text-amber-300">Faltam estes dados: </span>
                  {c.precisa.join(', ') || 'estação completa'}.
                </p>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm tabular-nums">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="py-1 font-medium">Ano</th>
                        <th className="py-1 font-medium">Vacas</th>
                        <th className="py-1 font-medium">Saem</th>
                        <th className="py-1 font-medium">Novilhas entram</th>
                        <th className="py-1 font-medium">Sobram</th>
                        <th className="py-1 font-medium">Faltam</th>
                        <th className="py-1 font-medium">Desmamados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proj
                        .filter((_, k) => [0, 2, 4].includes(k))
                        .map((a, k) => (
                          <tr key={a.ano} className="border-t border-border">
                            <td className="py-1">
                              {a.ano} <span className="text-xs text-muted-foreground">({[1, 3, 5][k]} {k === 0 ? 'ano' : 'anos'})</span>
                            </td>
                            <td className="py-1">{n0(a.vacas)}</td>
                            <td className="py-1">{n0(a.saidas)}</td>
                            <td className="py-1">{n0(a.novilhasEntram)}</td>
                            <td className="py-1">{n0(a.novilhasSobram)}</td>
                            <td className={`py-1 ${a.falta > 0 ? 'text-amber-300' : ''}`}>{n0(a.falta)}</td>
                            <td className="py-1">{n0(a.desmamados)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </Secao>

      <Secao id="economia" titulo="Economia">
        <Faltam itens={[...(custosPreenchidos ? [] : ['custos']), ...(numP(p, 'preco_bezerro_kg') == null ? ['preço do bezerro'] : []), ...(numP(p, 'preco_vaca_kg') == null ? ['preço da vaca de descarte'] : []), ...(areaUtil == null ? ['área de pasto útil'] : [])]} />
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[420px] text-left text-sm">
            <tbody>
              {['Receita', 'Custo total', 'Margem', 'R$ por hectare', 'R$ por matriz exposta', 'R$ por bezerro desmamado'].map((x) => (
                <tr key={x} className="border-b border-border last:border-0">
                  <td className="p-3">{x}</td>
                  <td className="p-3 text-muted-foreground">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          A estrutura fica pronta e vazia até você preencher custos e preços. Investimento, depreciação e custo do capital vão num demonstrativo separado, quando você responder a pergunta 57.
        </p>
      </Secao>

      <Secao id="campos" titulo="Dados que só você tem">
        <p className="text-sm text-muted-foreground">
          O que você grava aqui fica com a data e com o seu e-mail, sem apagar a versão anterior. As fórmulas não mudam; só os números que você informa.
        </p>
        <CamposMeta gravacoes={lido.gravacoes} />
      </Secao>

      <Secao id="referencias" titulo="Referências">
        <ul className="space-y-2 text-sm">
          {refs.map((r) => (
            <li key={r.id} id={r.id} className="grid scroll-mt-4 grid-cols-[44px_1fr] gap-2">
              <span className="font-semibold text-sky-300">{r.id}</span>
              <span className="text-muted-foreground">
                {r.texto}{' '}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                    {r.url}
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Secao>
    </div>
  );
}
