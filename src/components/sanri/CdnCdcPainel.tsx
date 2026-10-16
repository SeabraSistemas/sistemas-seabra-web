'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Comunicacao, LeituraAbcc } from '@/lib/sanri/abcc-queries';
import {
  CRIAS_POR_CDN,
  METODOS,
  dataBr,
  faltasCdn,
  linhaCdc,
  linhaCdn,
  maiusculo,
  nasceuNoPeriodo,
  porReprodutor,
  proximoNumero,
  recentesPrimeiro,
  separarEmFolhas,
  type CoberturaCdc,
  type CriaCdn,
} from '@/lib/sanri/abcc/regras';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { EstadoApp } from './EstadoApp';
import { Info } from './Info';

/** Linhas de matriz da folha da CDC (16 a 18 no modelo) — o mesmo de folhas.ts. */
const MATRIZES_POR_CDC = 3;

type Mensagem = { tom: 'ok' | 'aviso' | 'erro'; texto: string; baixar?: { id: number; texto: string }[] };
type Resultado = Mensagem | null;

async function chamar(corpo: unknown): Promise<{ ok: boolean; dados: Record<string, unknown> }> {
  const res = await fetch('/sanri/api/abcc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const dados = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, dados };
}

function rotuloMetodo(m: string | null): string {
  return METODOS.find((x) => x.chave === m)?.rotulo ?? 'Monta natural / controlada';
}

/** Reprodutor sem nome na ficha aparece pelo número. */
function nomeReprodutor(r: CoberturaCdc['reprodutor']): string {
  return maiusculo(r?.nome) || (r?.numero ?? '').trim() || 'Sem reprodutor';
}

function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

/** Botões de escolha (filtro, aba): o escolhido em verde. */
function Escolhas<T extends string>({ valor, opcoes, onChange, rotulo }: { valor: T; opcoes: { chave: T; texto: string }[]; onChange: (v: T) => void; rotulo: string }) {
  return (
    <div role="group" aria-label={rotulo} className="flex max-w-full flex-wrap gap-1 self-start rounded-pill bg-paper-2 p-1">
      {opcoes.map((o) => (
        <button
          key={o.chave}
          type="button"
          aria-pressed={valor === o.chave}
          onClick={() => onChange(o.chave)}
          className={cn(
            'shrink-0 rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors',
            valor === o.chave ? 'bg-sage text-paper shadow-card' : 'text-ink-1 hover:text-ink',
          )}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

function CampoData({ texto, valor, onChange }: { texto: string; valor: string; onChange: (v: string) => void }) {
  return (
    <Rotulo texto={texto}>
      <PainelCampo type="date" value={valor} onChange={(e) => onChange(e.target.value)} className={cn(valor && 'border-sage text-sage')} />
    </Rotulo>
  );
}

function Baixar({ id, texto }: { id: number; texto?: string }) {
  return (
    <a
      href={`/sanri/api/abcc/arquivo?id=${id}`}
      className="inline-flex h-8 items-center justify-center rounded-pill border border-rule-strong bg-paper px-3 text-xs font-semibold text-ink hover:bg-paper-2"
    >
      {texto ? `Baixar ${texto}` : 'Baixar'}
    </a>
  );
}

function MostrarResultado({ r }: { r: Resultado }) {
  if (!r) return null;
  return (
    <Aviso tom={r.tom}>
      <span className="block">{r.texto}</span>
      {r.baixar && r.baixar.length > 0 && (
        <span className="mt-2 flex flex-wrap gap-2">
          {r.baixar.map((b) => (
            <Baixar key={b.id} id={b.id} texto={b.texto} />
          ))}
        </span>
      )}
    </Aviso>
  );
}

function resultadoEmissao(dados: Record<string, unknown>, tipo: string): Mensagem {
  const emitidas = (dados.emitidas as { id: number; texto: string; animais: number }[]) ?? [];
  const parou = (dados.parou as string | null) ?? null;
  const partes: string[] = [];
  if (emitidas.length) partes.push(`${emitidas.length === 1 ? `${tipo} emitida` : `${tipo}s emitidas`}: ${emitidas.map((e) => `${e.texto} (${e.animais})`).join(', ')}.`);
  if (parou) partes.push(`Parou na ${parou}.`);
  return { tom: parou ? (emitidas.length ? 'aviso' : 'erro') : 'ok', texto: partes.join(' '), baixar: emitidas.map((e) => ({ id: e.id, texto: e.texto })) };
}

// ---------------------------------------------------------------- CDN

function LinhaCria({
  c,
  marcada,
  onMarcar,
  cdcDigitado,
  onCdc,
}: {
  c: CriaCdn;
  marcada: boolean;
  onMarcar: () => void;
  cdcDigitado: string;
  onCdc: (v: string) => void;
}) {
  const l = linhaCdn(c);
  const faltas = faltasCdn(c).filter((f) => !(f === 'sem CDC' && cdcDigitado.trim()));
  return (
    <li className="flex gap-3 border-t border-rule py-2.5 first:border-t-0">
      <input type="checkbox" checked={marcada} onChange={onMarcar} aria-label={`Escolher ${l.numero}`} className="mt-1 size-5 shrink-0 accent-sage" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-xs text-ink-2">{l.numero}</span>
          <span className={cn('font-semibold', l.descarte ? 'text-erro' : 'text-ink')}>{l.nome || '(sem nome)'}</span>
          <span className="text-xs text-ink-2">
            {l.sexo || '?'} · {dataBr(l.nascimento)}
            {l.peso != null ? ` · ${String(l.peso).replace('.', ',')} kg` : ''}
            {c.status === 'inativo' ? (l.sexo === 'M' ? ' · inativo' : ' · inativa') : ''}
          </span>
        </div>
        <div className="text-xs text-ink-1">
          {l.pai || '—'} × {l.mae || '—'}
          {c.metodo && c.metodo !== 'mn' ? ` · ${rotuloMetodo(c.metodo)}` : ''}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {c.enviada ? (
            <span className="rounded-pill bg-sage-100 px-2 py-0.5 font-medium text-sage">{c.cdn ? `CDN ${c.cdn}` : 'já foi (fora do sistema)'}</span>
          ) : l.cdc ? (
            <span className="text-ink-1">CDC {l.cdc}</span>
          ) : (
            c.metodo !== 'ia' &&
            c.metodo !== 'te' && (
              <label className="flex items-center gap-1 text-ink-1">
                CDC Nº
                <input
                  value={cdcDigitado}
                  onChange={(e) => onCdc(e.target.value)}
                  placeholder="000/2026"
                  inputMode="numeric"
                  className="h-8 w-24 rounded-campo border border-rule-strong bg-paper px-2 text-base text-ink placeholder:text-ink-2"
                />
              </label>
            )
          )}
          {!c.enviada &&
            faltas.map((f) => (
              <span key={f} className="rounded-pill bg-aviso-fundo px-2 py-0.5 font-medium text-aviso">
                {f}
              </span>
            ))}
        </div>
      </div>
    </li>
  );
}

function SecaoCdn({
  crias,
  comunicacoes,
  hoje,
  inicioDoAno,
  carregadoDesde,
}: {
  crias: CriaCdn[];
  comunicacoes: Comunicacao[];
  hoje: string;
  inicioDoAno: string;
  carregadoDesde: string;
}) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'sem' | 'com'>('sem');
  const [nascDe, setNascDe] = useState(inicioDoAno);
  const [nascAte, setNascAte] = useState('');
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [cdc, setCdc] = useState<Record<number, string>>({});
  const [data, setData] = useState(hoje);
  const ano = Number(data.slice(0, 4)) || Number(hoje.slice(0, 4));
  const sugerido = proximoNumero(
    comunicacoes.map((c) => ({ tipo: c.tipo, ano: c.ano, numero: c.numero, cancelada: c.cancelada })),
    'cdn',
    ano,
  );
  const [numero, setNumero] = useState<string>(sugerido ? String(sugerido) : '');
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);

  // Lista: só as nascidas no período, a última que nasceu no topo.
  const doPeriodo = useMemo(() => recentesPrimeiro(crias.filter((c) => nasceuNoPeriodo(c.nascimento, nascDe, nascAte))), [crias, nascDe, nascAte]);
  const sem = useMemo(() => doPeriodo.filter((c) => !c.enviada), [doPeriodo]);
  const com = useMemo(() => doPeriodo.filter((c) => c.enviada), [doPeriodo]);
  const lista = filtro === 'sem' ? sem : com;
  const escolhidas = lista.filter((c) => marcadas.has(c.id));
  const folhas = filtro === 'sem' ? separarEmFolhas(escolhidas) : [];
  const todas = lista.length > 0 && escolhidas.length === lista.length;

  function alternar(id: number) {
    setMarcadas((m) => {
      const n = new Set(m);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function trocarFiltro(f: 'sem' | 'com') {
    setFiltro(f);
    setMarcadas(new Set());
    setResultado(null);
  }

  async function emitir() {
    const n = Number(numero);
    if (!Number.isInteger(n) || n < 1) return setResultado({ tom: 'erro', texto: 'Informe o número da CDN.' });
    setOcupado(true);
    setResultado(null);
    const r = await chamar({
      acao: 'cdn',
      ids: escolhidas.map((c) => c.id),
      numero: n,
      data,
      cdc: Object.fromEntries(escolhidas.filter((c) => (cdc[c.id] ?? '').trim()).map((c) => [String(c.id), cdc[c.id].trim()])),
    });
    setOcupado(false);
    if (!r.ok) return setResultado({ tom: 'erro', texto: `Não emitiu: ${String(r.dados.erro ?? 'tente de novo')}.` });
    const res = resultadoEmissao(r.dados, 'CDN');
    setResultado(res);
    const feitas = ((r.dados.emitidas as unknown[]) ?? []).length;
    setNumero(String(n + feitas));
    setMarcadas(new Set());
    router.refresh();
  }

  async function marcarComo(enviada: boolean) {
    setOcupado(true);
    setResultado(null);
    const r = await chamar({ acao: 'marcar', ids: escolhidas.map((c) => c.id), enviada });
    setOcupado(false);
    if (!r.ok) return setResultado({ tom: 'erro', texto: `Não gravou: ${String(r.dados.erro ?? 'tente de novo')}.` });
    const n = Number(r.dados.alteradas) || 0;
    const naoMudou = escolhidas.length - n;
    setResultado({
      tom: naoMudou ? 'aviso' : 'ok',
      texto: `${plural(n, 'cria', 'crias')} ${enviada ? 'marcada(s) como já enviada(s)' : 'de volta para sem CDN'}.${
        naoMudou ? ` ${plural(naoMudou, 'continua', 'continuam')} numa CDN emitida — para desfazer, cancele a CDN em Emitidas.` : ''
      }`,
    });
    setMarcadas(new Set());
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Escolhas
          rotulo="Crias"
          valor={filtro}
          onChange={trocarFiltro}
          opcoes={[
            { chave: 'sem', texto: `Sem CDN (${sem.length})` },
            { chave: 'com', texto: `Já foram (${com.length})` },
          ]}
        />
        <Info>
          Crias nascidas no período escolhido (começa em 1º de janeiro; dá para voltar até {dataBr(carregadoDesde)}), a última que
          nasceu no topo. Na folha elas saem na ordem dos números, como na CDN oficial. Escolha as que vão na CDN: o sistema separa por tipo de cobertura (monta, IA, TE) e faz uma folha a
          cada {CRIAS_POR_CDN}, numeradas em sequência a partir do número que você informar. O CDC Nº vem da CDC da cobertura da mãe;
          quando o sistema não tem, digite. Macho sem nome sai DESCARTE. Quem já foi em CDN antes do sistema: escolha e toque em
          “Marcar como já enviadas”.
        </Info>
      </div>

      <div className="grid grid-cols-2 items-end gap-3 sm:max-w-md">
        <Rotulo texto="Nascidas de">
          <PainelCampo
            type="date"
            value={nascDe}
            min={carregadoDesde}
            max={nascAte || hoje}
            onChange={(e) => (setNascDe(e.target.value), setMarcadas(new Set()))}
            className={cn(nascDe && 'border-sage text-sage')}
          />
        </Rotulo>
        <Rotulo texto="até">
          <PainelCampo
            type="date"
            value={nascAte}
            min={nascDe || carregadoDesde}
            max={hoje}
            onChange={(e) => (setNascAte(e.target.value), setMarcadas(new Set()))}
            className={cn(nascAte && 'border-sage text-sage')}
          />
        </Rotulo>
      </div>

      <div className="rounded-card border border-rule bg-paper p-4 shadow-card">
        {lista.length === 0 ? (
          <p className="text-sm text-ink-2">{filtro === 'sem' ? 'Nenhuma cria esperando CDN neste período.' : 'Nenhuma cria marcada como enviada neste período.'}</p>
        ) : (
          <>
            <label className="flex items-center gap-3 border-b border-rule pb-2 text-sm font-medium text-ink-1">
              <input
                type="checkbox"
                checked={todas}
                onChange={() => setMarcadas(todas ? new Set() : new Set(lista.map((c) => c.id)))}
                className="size-5 accent-sage"
              />
              Todas ({lista.length})
            </label>
            <ul>
              {lista.map((c) => (
                <LinhaCria
                  key={c.id}
                  c={c}
                  marcada={marcadas.has(c.id)}
                  onMarcar={() => alternar(c.id)}
                  cdcDigitado={cdc[c.id] ?? ''}
                  onCdc={(v) => setCdc((m) => ({ ...m, [c.id]: v }))}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {escolhidas.length > 0 && filtro === 'sem' && (
        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-card border border-sage bg-paper p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">
            {plural(escolhidas.length, 'cria', 'crias')} → {plural(folhas.length, 'folha', 'folhas')}
            <span className="block text-xs font-normal text-ink-1">
              {folhas.map((f, i) => `${numero ? `${Number(numero) + i}/${ano}` : `folha ${i + 1}`}: ${f.crias.length} (${rotuloMetodo(f.metodo).toLowerCase()})`).join(' · ')}
            </span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Rotulo texto={folhas.length > 1 ? 'Nº da primeira CDN' : 'Nº da CDN'}>
              <PainelCampo inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))} placeholder="ex.: 302" />
            </Rotulo>
            <CampoData texto="Data" valor={data} onChange={setData} />
          </div>
          <div className="flex flex-wrap gap-2">
            <PainelBotao onClick={emitir} disabled={ocupado || !numero || !data}>
              {ocupado ? 'Emitindo…' : folhas.length > 1 ? `Emitir ${folhas.length} CDNs` : 'Emitir CDN'}
            </PainelBotao>
            <PainelBotao variante="contorno" onClick={() => marcarComo(true)} disabled={ocupado}>
              Marcar como já enviadas
            </PainelBotao>
          </div>
        </div>
      )}

      {escolhidas.length > 0 && filtro === 'com' && (
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-card border border-rule bg-paper p-4 shadow-card">
          <span className="text-sm font-semibold text-ink">{plural(escolhidas.length, 'cria escolhida', 'crias escolhidas')}</span>
          <PainelBotao variante="contorno" onClick={() => marcarComo(false)} disabled={ocupado}>
            {ocupado ? 'Gravando…' : 'Voltar para sem CDN'}
          </PainelBotao>
        </div>
      )}

      <MostrarResultado r={resultado} />
    </section>
  );
}

// ---------------------------------------------------------------- CDC

function SecaoCdc({ coberturas, comunicacoes, hoje, desde }: { coberturas: CoberturaCdc[]; comunicacoes: Comunicacao[]; hoje: string; desde: string }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'sem' | 'com'>('sem');
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [data, setData] = useState(hoje);
  const ano = Number(data.slice(0, 4)) || Number(hoje.slice(0, 4));
  const sugerido = proximoNumero(
    comunicacoes.map((c) => ({ tipo: c.tipo, ano: c.ano, numero: c.numero, cancelada: c.cancelada })),
    'cdc',
    ano,
  );
  const [numero, setNumero] = useState(sugerido ? String(sugerido) : '');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);

  const grupos = useMemo(
    () => porReprodutor(coberturas.filter((c) => (filtro === 'sem' ? !c.cdc : !!c.cdc))),
    [coberturas, filtro],
  );
  const escolhidas = coberturas.filter((c) => marcadas.has(c.id));
  const reprodutor = escolhidas[0]?.reprodutor ?? null;
  const datas = escolhidas.map((c) => c.data).sort();
  const periodoDe = de || datas[0] || '';
  const periodoAte = ate || datas[datas.length - 1] || '';
  const folhas = Math.ceil(escolhidas.length / MATRIZES_POR_CDC);
  const contagem = new Map<string, number>();
  for (const c of escolhidas) contagem.set(linhaCdc(c).nome || String(c.femea.numero), (contagem.get(linhaCdc(c).nome || String(c.femea.numero)) ?? 0) + 1);
  const repetidas = [...contagem].filter(([, n]) => n > 1).map(([nome, n]) => `${nome} (${n}×)`);

  function alternar(c: CoberturaCdc) {
    setMarcadas((m) => {
      // Uma CDC é de um reprodutor só: escolher de outro recomeça a seleção.
      const outro = [...m].some((id) => coberturas.find((x) => x.id === id)?.reprodutor?.id !== c.reprodutor?.id);
      const n = new Set(outro ? [] : m);
      if (n.has(c.id)) n.delete(c.id);
      else n.add(c.id);
      return n;
    });
    setDe('');
    setAte('');
  }

  async function emitir(externa: boolean) {
    const n = Number(numero);
    if (!Number.isInteger(n) || n < 1) return setResultado({ tom: 'erro', texto: 'Informe o número da CDC.' });
    setOcupado(true);
    setResultado(null);
    const r = await chamar({ acao: 'cdc', ids: escolhidas.map((c) => c.id), numero: n, data, periodoDe, periodoAte, externa });
    setOcupado(false);
    if (!r.ok) return setResultado({ tom: 'erro', texto: `Não gravou: ${String(r.dados.erro ?? 'tente de novo')}.` });
    const res = resultadoEmissao(r.dados, externa ? 'CDC registrada' : 'CDC');
    setResultado(externa ? { ...res, baixar: [] } : res);
    const feitas = ((r.dados.emitidas as unknown[]) ?? []).length;
    if (!externa) setNumero(String(n + feitas));
    setMarcadas(new Set());
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Escolhas
          rotulo="Coberturas"
          valor={filtro}
          onChange={(f) => (setFiltro(f), setMarcadas(new Set()), setResultado(null))}
          opcoes={[
            { chave: 'sem', texto: `Sem CDC (${coberturas.filter((c) => !c.cdc).length})` },
            { chave: 'com', texto: `Com CDC (${coberturas.filter((c) => c.cdc).length})` },
          ]}
        />
        <Info>
          Coberturas (monta controlada) lançadas no app desde {dataBr(desde)}, por reprodutor. Escolha as matrizes de um reprodutor: a
          folha cabe {MATRIZES_POR_CDC}; com mais, saem várias CDCs em sequência. O período vem das datas escolhidas — mude se a
          estação for maior. CDC que já foi enviada antes do sistema: escolha as matrizes e toque em “Registrar CDC já enviada” com o
          número dela — assim a CDN das crias já sai com o CDC Nº.
        </Info>
      </div>

      {grupos.length === 0 && (
        <div className="rounded-card border border-rule bg-paper p-4 text-sm text-ink-2 shadow-card">
          {filtro === 'sem' ? 'Nenhuma cobertura esperando CDC.' : 'Nenhuma cobertura com CDC ainda.'}
        </div>
      )}

      {grupos.map((g) => (
        <details key={g.reprodutor?.id ?? 'sem'} open={grupos.length <= 3 || g.coberturas.some((c) => marcadas.has(c.id))} className="rounded-card border border-rule bg-paper p-4 shadow-card">
          <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-bold text-ink">{nomeReprodutor(g.reprodutor)}</span>
            <span className="text-xs text-ink-2">
              {g.reprodutor?.numero ?? ''} {g.reprodutor?.raca ? `· ${g.reprodutor.raca}` : ''} · {plural(g.coberturas.length, 'matriz', 'matrizes')}
            </span>
          </summary>
          <ul className="mt-2">
            {g.coberturas.map((c) => {
              const l = linhaCdc(c);
              return (
                <li key={c.id} className="flex items-center gap-3 border-t border-rule py-2 text-sm first:border-t-0">
                  {filtro === 'sem' && (
                    <input type="checkbox" checked={marcadas.has(c.id)} onChange={() => alternar(c)} aria-label={`Escolher ${l.nome}`} className="size-5 shrink-0 accent-sage" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-ink">{l.nome || '(sem nome)'}</span>
                    <span className="text-xs text-ink-2">
                      {' '}
                      · {l.rgn} · coberta {dataBr(c.data)}
                      {c.femea.status === 'inativo' ? ' · inativa' : ''}
                    </span>
                  </span>
                  {c.cdc && <span className="shrink-0 rounded-pill bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage">CDC {c.cdc}</span>}
                </li>
              );
            })}
          </ul>
        </details>
      ))}

      {escolhidas.length > 0 && (
        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-card border border-sage bg-paper p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">
            {nomeReprodutor(reprodutor)}: {plural(escolhidas.length, 'matriz', 'matrizes')} → {plural(folhas, 'CDC', 'CDCs')}
          </p>
          {repetidas.length > 0 && (
            <Aviso tom="aviso">
              Matriz mais de uma vez na escolha: {repetidas.join(', ')}. Cada cobertura vira uma linha — desmarque a que não vai.
            </Aviso>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Rotulo texto={folhas > 1 ? 'Nº da primeira CDC' : 'Nº da CDC'}>
              <PainelCampo inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))} placeholder="ex.: 520" />
            </Rotulo>
            <span className="hidden sm:block" />
            <CampoData texto="Período: de" valor={periodoDe} onChange={setDe} />
            <CampoData texto="Período: até" valor={periodoAte} onChange={setAte} />
            <CampoData texto="Data de preenchimento" valor={data} onChange={setData} />
          </div>
          <div className="flex flex-wrap gap-2">
            <PainelBotao onClick={() => emitir(false)} disabled={ocupado || !numero || !data || !periodoDe || !periodoAte}>
              {ocupado ? 'Gravando…' : folhas > 1 ? `Emitir ${folhas} CDCs` : 'Emitir CDC'}
            </PainelBotao>
            <PainelBotao variante="contorno" onClick={() => emitir(true)} disabled={ocupado || !numero || !periodoDe || !periodoAte}>
              Registrar CDC já enviada
            </PainelBotao>
          </div>
        </div>
      )}

      <MostrarResultado r={resultado} />
    </section>
  );
}

// ---------------------------------------------------------------- emitidas

function LinhaEmitida({ c }: { c: Comunicacao }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // A que vale se CANCELA (devolve as crias); a cancelada se EXCLUI (some da lista).
  async function confirmado() {
    const acao = c.cancelada ? 'excluir' : 'cancelar';
    setOcupado(true);
    setErro(null);
    const r = await chamar({ acao, id: c.id });
    setOcupado(false);
    if (!r.ok) return setErro(`Não ${c.cancelada ? 'excluiu' : 'cancelou'}: ${String(r.dados.erro ?? 'tente de novo')}.`);
    setConfirmar(false);
    router.refresh();
  }

  const detalhe =
    c.tipo === 'cdn'
      ? rotuloMetodo(c.metodo)
      : `${String(c.cabecalho.reprodutor ?? '')}${c.periodoDe ? ` · ${dataBr(c.periodoDe)} a ${dataBr(c.periodoAte)}` : ''}`;

  return (
    <li className={cn('flex flex-col gap-2 border-t border-rule py-3 first:border-t-0', c.cancelada && 'opacity-60')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="font-semibold text-ink">
            {c.tipo.toUpperCase()} {c.texto}
          </span>
          <span className="text-xs text-ink-2">
            {' '}
            · {dataBr(c.data)} · {plural(c.linhas.length, c.tipo === 'cdn' ? 'cria' : 'matriz', c.tipo === 'cdn' ? 'crias' : 'matrizes')} · {detalhe}
          </span>
          {c.externa && <span className="ml-2 rounded-pill bg-paper-2 px-2 py-0.5 text-xs text-ink-1">registrada</span>}
          {c.cancelada && <span className="ml-2 rounded-pill bg-erro-fundo px-2 py-0.5 text-xs text-erro">cancelada</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {!c.cancelada && !c.externa && <Baixar id={c.id} />}
          {confirmar ? (
            <>
              <span className="text-xs text-ink-1">{c.cancelada ? 'Excluir de vez?' : 'Cancelar?'}</span>
              <PainelBotao variante="perigo" onClick={confirmado} disabled={ocupado}>
                {ocupado ? (c.cancelada ? 'Excluindo…' : 'Cancelando…') : 'Sim'}
              </PainelBotao>
              <PainelBotao variante="discreto" onClick={() => setConfirmar(false)} disabled={ocupado}>
                Não
              </PainelBotao>
            </>
          ) : (
            <PainelBotao variante="perigo" onClick={() => setConfirmar(true)}>
              {c.cancelada ? 'Excluir' : 'Cancelar'}
            </PainelBotao>
          )}
        </span>
      </div>
      <details>
        <summary className="cursor-pointer text-xs text-ink-1">Animais</summary>
        <ul className="mt-1 text-xs text-ink-1">
          {c.linhas.map((l) => (
            <li key={l.linha}>
              {String(l.dados.numero ?? l.dados.rgn ?? '')} — {String(l.dados.nome ?? '')}
              {c.tipo === 'cdc' && l.dataCobertura ? ` · ${dataBr(l.dataCobertura)}` : ''}
              {c.tipo === 'cdn' && l.dados.cdc ? ` · CDC ${String(l.dados.cdc)}` : ''}
            </li>
          ))}
        </ul>
      </details>
      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </li>
  );
}

function SecaoEmitidas({ comunicacoes }: { comunicacoes: Comunicacao[] }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-ink">Emitidas</h3>
        <Info>
          Toda CDN e CDC feita aqui, a mais nova primeiro. Baixar de novo dá a mesma folha da emissão. Cancelar libera o número e
          devolve as crias para “sem CDN” (ou as coberturas para “sem CDC”). A cancelada pode ser excluída de vez.
        </Info>
      </div>
      <div className="rounded-card border border-rule bg-paper p-4 shadow-card">
        {comunicacoes.length === 0 ? (
          <p className="text-sm text-ink-2">Nenhuma ainda.</p>
        ) : (
          <ul>
            {comunicacoes.map((c) => (
              <LinhaEmitida key={c.id} c={c} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- página

export function CdnCdcPainel({
  configurado,
  ok,
  carregadoEm,
  modelos,
  crias,
  coberturas,
  comunicacoes,
  criasDesde,
  inicioDoAno,
  coberturasDesde,
  hoje,
}: LeituraAbcc & { hoje: string }) {
  const [aba, setAba] = useState<'cdn' | 'cdc' | 'emitidas'>('cdn');

  return (
    <div className="flex flex-col gap-5">
      <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ink">CDN e CDC</h2>
        <Info>
          A folha sai na planilha oficial que você usa, já preenchida — é só baixar e enviar. Nada de copiar e colar. Cada CDN e CDC
          emitida fica guardada com o número, e o app passa a mostrar a cria como “já enviada”.
        </Info>
      </div>

      {ok && (!modelos.cdn || !modelos.cdc) && (
        <Aviso tom="aviso">
          Falta no sistema a planilha modelo da {[!modelos.cdn && 'CDN', !modelos.cdc && 'CDC'].filter(Boolean).join(' e da ')} — fale com o suporte.
        </Aviso>
      )}

      <Escolhas
        rotulo="Comunicação"
        valor={aba}
        onChange={setAba}
        opcoes={[
          { chave: 'cdn', texto: 'Nascimento (CDN)' },
          { chave: 'cdc', texto: 'Cobertura (CDC)' },
          { chave: 'emitidas', texto: `Emitidas (${comunicacoes.filter((c) => !c.cancelada).length})` },
        ]}
      />

      {aba === 'cdn' && <SecaoCdn crias={crias} comunicacoes={comunicacoes} hoje={hoje} inicioDoAno={inicioDoAno} carregadoDesde={criasDesde} />}
      {aba === 'cdc' && <SecaoCdc coberturas={coberturas} comunicacoes={comunicacoes} hoje={hoje} desde={coberturasDesde} />}
      {aba === 'emitidas' && <SecaoEmitidas comunicacoes={comunicacoes} />}
    </div>
  );
}
