'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDia } from '@/lib/painel/format';
import {
  MAXIMO_CONTADOS,
  animaisDaBaia,
  buscarAnimais,
  compararContagem,
  contagemPorBaia,
  foraDaContagem,
  ultimaPorBaia,
  type AnimalNaBaia,
  type Conferencia,
} from '@/lib/sanri/conferencia';
import type { Baia } from '@/lib/sanri/dieta';
import type { Animal } from '@/lib/sanri/monta';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, PainelCampo, Rotulo } from './Controles';
import { DataTable, type DataTableColumn } from './DataTable';
import { EstadoPlanilha } from './EstadoPlanilha';
import { Selo } from './MontaComum';

interface Resumo {
  baia: string;
  contados: number;
  esperados: number;
  diferenca: number;
}

function plural(n: number, um: string, varios: string): string {
  return `${n} ${Math.abs(n) === 1 ? um : varios}`;
}

/** "bateu", "faltavam 2", "sobravam 1" — como a equipe fala. */
function resultadoDe(diferenca: number): { rotulo: string; classe: string } {
  if (diferenca === 0) return { rotulo: 'Bateu', classe: 'bg-sage-100 text-sage' };
  return diferenca < 0
    ? { rotulo: `Faltavam ${-diferenca}`, classe: 'bg-aviso-fundo text-aviso' }
    : { rotulo: `Sobravam ${diferenca}`, classe: 'bg-aviso-fundo text-aviso' };
}

function nomeOuNumero(a: { nome: string | null; numero: string }): string {
  return a.nome ?? a.numero;
}

/** Onde a planilha põe o animal — para o "animal a mais". */
function ondeEsta(a: Animal): string {
  if (!a.vivo) return `consta como ${a.categoria ?? 'baixa'}`;
  return a.baia ? `na planilha: ${a.baia}` : 'sem baia na planilha';
}

// ---------------------------------------------------------------- conferindo uma baia

function FormConferencia({
  baia,
  daBaia,
  fora,
  pool,
  anterior,
  onVoltar,
  onSalva,
}: {
  baia: Baia;
  daBaia: AnimalNaBaia[];
  fora: Animal[];
  pool: Animal[];
  anterior: Conferencia | undefined;
  onVoltar: () => void;
  onSalva: (r: Resumo) => void;
}) {
  const router = useRouter();
  const [contados, setContados] = useState('');
  const [vistos, setVistos] = useState<Set<string>>(new Set());
  const [aMais, setAMais] = useState<Animal[]>([]);
  const [busca, setBusca] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const esperados = daBaia.length;
  const c = contados.trim() === '' ? null : Number(contados.trim());
  const valido = c != null && Number.isInteger(c) && c >= 0 && c <= MAXIMO_CONTADOS;
  const cmp = valido ? compararContagem(esperados, c) : null;

  const naoVistos = vistos.size > 0 ? daBaia.filter((a) => !vistos.has(a.numero)) : [];
  const resultados = useMemo(() => {
    const daqui = new Set([...daBaia.map((a) => a.numero), ...aMais.map((a) => a.numero)]);
    return buscarAnimais(pool, busca).filter((a) => !daqui.has(a.numero));
  }, [pool, busca, daBaia, aMais]);

  function marcar(numero: string) {
    const novo = new Set(vistos);
    if (!novo.delete(numero)) novo.add(numero);
    setVistos(novo);
  }

  async function salvar() {
    if (!valido) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch('/sanri/api/conferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baia: baia.nome, contados: c, vistos: [...vistos], aMais: aMais.map((a) => a.numero), obs }),
      });
      const corpo = (await res.json().catch(() => ({}))) as { erro?: string; esperados?: number; diferenca?: number };
      if (!res.ok) {
        setErro(corpo.erro ? `Não salvou: ${corpo.erro}.` : 'Não foi possível salvar — tente de novo.');
        return;
      }
      onSalva({ baia: baia.nome, contados: c, esperados: corpo.esperados ?? esperados, diferenca: corpo.diferenca ?? c - esperados });
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button type="button" onClick={onVoltar} className="text-sm font-medium text-bay underline underline-offset-2">
          ← Baias
        </button>
        <h2 className="mt-2 text-2xl font-bold text-ink">{baia.nome}</h2>
        <p className="mt-1 text-sm text-ink-2">
          {[baia.categoria, `${plural(esperados, 'animal', 'animais')} na planilha`].filter(Boolean).join(' · ')}
          {anterior && (
            <>
              {' · '}última conferência {formatDia(anterior.data)}: {resultadoDe(anterior.diferenca).rotulo.toLowerCase()}
            </>
          )}
        </p>
      </div>

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
        <Rotulo texto="Quantos animais você contou na baia?">
          <PainelCampo
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            max={MAXIMO_CONTADOS}
            value={contados}
            onChange={(e) => setContados(e.target.value)}
            className="h-14 max-w-40 text-center text-2xl font-bold"
            autoFocus
          />
        </Rotulo>
        <div className="mt-3 flex flex-col gap-2">
          {cmp?.situacao === 'bate' && <Aviso tom="ok">Bate: {plural(esperados, 'animal', 'animais')}, igual à planilha.</Aviso>}
          {cmp?.situacao === 'falta' && (
            <Aviso tom="aviso">
              Faltam {plural(-cmp.diferenca, 'animal', 'animais')}: a planilha tem {esperados} e você contou {c}. Marque abaixo quem você viu para descobrir quem não está.
            </Aviso>
          )}
          {cmp?.situacao === 'sobra' && (
            <Aviso tom="aviso">
              Sobram {plural(cmp.diferenca, 'animal', 'animais')}: a planilha tem {esperados} e você contou {c}. Se souber quem é, procure em “Animal a mais”.
            </Aviso>
          )}
          {contados.trim() !== '' && !valido && <Aviso tom="erro">Digite um número inteiro (0 se a baia está vazia).</Aviso>}
        </div>
      </section>

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">
            Quem está na baia <span className="font-normal text-ink-2">· visto {vistos.size} de {esperados}</span>
          </h3>
          {esperados > 0 && (
            <div className="flex gap-1">
              <PainelBotao variante="pequeno" onClick={() => setVistos(new Set(daBaia.map((a) => a.numero)))}>
                Marcar todos
              </PainelBotao>
              <PainelBotao variante="discreto" onClick={() => setVistos(new Set())} disabled={vistos.size === 0}>
                Limpar
              </PainelBotao>
            </div>
          )}
        </div>

        {esperados === 0 ? (
          <p className="mt-2 text-sm text-ink-2">A planilha não tem nenhum animal nesta baia.</p>
        ) : (
          <ul className="mt-2 divide-y divide-rule">
            {daBaia.map((a) => {
              const marcado = vistos.has(a.numero);
              return (
                <li key={a.numero}>
                  <label className={cn('flex min-h-12 cursor-pointer items-center gap-3 py-2', vistos.size > 0 && !marcado && 'bg-aviso-fundo/60')}>
                    <input type="checkbox" checked={marcado} onChange={() => marcar(a.numero)} className="h-6 w-6 shrink-0 accent-[var(--color-ink)]" />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate font-semibold text-ink">{nomeOuNumero(a)}</span>
                      <span className="text-xs text-ink-2">
                        {a.nome ? `${a.numero} · ` : ''}
                        {a.categoria ?? 'sem categoria'}
                      </span>
                    </span>
                    {a.tambemEm.length > 0 && <Selo className="bg-aviso-fundo text-aviso">consta também na {a.tambemEm.join(', ')}</Selo>}
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {naoVistos.length > 0 && (
          <div className="mt-3">
            <Aviso tom="aviso">
              Ainda não marcados ({naoVistos.length}): {naoVistos.map(nomeOuNumero).join(', ')}.
            </Aviso>
          </div>
        )}
      </section>

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
        <h3 className="text-base font-semibold text-ink">Animal a mais</h3>
        <p className="mt-1 text-sm text-ink-2">Tem bicho na baia que não está na lista? Procure pelo número, microchip ou nome.</p>
        <div className="mt-3">
          <PainelCampo
            type="search"
            aria-label="Procurar animal"
            placeholder="ex.: 25285 ou Faísca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoComplete="off"
          />
        </div>
        {busca.trim().length >= 2 && (
          <ul className="mt-2 divide-y divide-rule rounded-campo border border-rule">
            {resultados.length === 0 ? (
              <li className="px-3 py-2 text-sm text-ink-2">Nenhum animal encontrado.</li>
            ) : (
              resultados.map((a) => (
                <li key={a.numero} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate font-semibold text-ink">{nomeOuNumero(a)}</span>
                    <span className="text-xs text-ink-2">
                      {a.nome ? `${a.numero} · ` : ''}
                      {ondeEsta(a)}
                    </span>
                  </span>
                  <PainelBotao
                    variante="pequeno"
                    onClick={() => {
                      setAMais([...aMais, a]);
                      setBusca('');
                    }}
                  >
                    Está aqui
                  </PainelBotao>
                </li>
              ))
            )}
          </ul>
        )}
        {aMais.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-ink-1">Marcados como a mais ({aMais.length})</p>
            <ul className="mt-1 flex flex-col gap-1">
              {aMais.map((a) => (
                <li key={a.numero} className="flex items-center justify-between gap-3 rounded-campo bg-paper-1 px-3 py-1.5 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold text-ink">{nomeOuNumero(a)}</span> <span className="text-ink-2">· {ondeEsta(a)}</span>
                  </span>
                  <PainelBotao variante="perigo" onClick={() => setAMais(aMais.filter((x) => x.numero !== a.numero))}>
                    Tirar
                  </PainelBotao>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {fora.length > 0 && (
        <Aviso tom="aviso">
          A planilha ainda mantém {plural(fora.length, 'animal vendido ou morto', 'animais vendidos ou mortos')} com esta baia preenchida (não entram na contagem):{' '}
          {fora.map((a) => `${nomeOuNumero(a)} (${a.categoria ?? 'baixa'})`).join(', ')}. O “Animais” do AppSheet pode estar contando eles.
        </Aviso>
      )}

      <Rotulo texto="Observação (opcional)">
        <PainelCampo placeholder="ex.: cabra doente no curral de isolamento" value={obs} maxLength={500} onChange={(e) => setObs(e.target.value)} />
      </Rotulo>

      {valido && (vistos.size > 0 || aMais.length > 0) && (
        <p className="text-sm text-ink-2">
          Contou {c} · marcou {vistos.size} da lista{aMais.length > 0 ? ` + ${aMais.length} a mais` : ''}.
        </p>
      )}
      {erro && <Aviso tom="erro">{erro}</Aviso>}

      <div className="flex flex-wrap gap-2">
        <PainelBotao onClick={salvar} disabled={!valido || salvando} className="min-w-44">
          {salvando ? 'Salvando…' : 'Salvar conferência'}
        </PainelBotao>
        <PainelBotao variante="contorno" onClick={onVoltar} disabled={salvando}>
          Cancelar
        </PainelBotao>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- lista de baias + histórico

function Ultima({ c }: { c: Conferencia | undefined }) {
  if (!c) return <span className="text-xs text-ink-2">Nunca conferida</span>;
  const r = resultadoDe(c.diferenca);
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
      <Selo className={r.classe}>{r.rotulo}</Selo>
      {formatDia(c.data)}
    </span>
  );
}

const COLUNAS_HISTORICO: DataTableColumn<Conferencia>[] = [
  { key: 'data', header: 'Data', cell: (c) => formatDia(c.data), sortValue: (c) => c.data },
  { key: 'baia', header: 'Baia', cell: (c) => <span className="font-semibold text-ink">{c.baia}</span>, sortValue: (c) => c.baia },
  { key: 'contou', header: 'Contou', cell: (c) => c.contados, sortValue: (c) => c.contados, className: 'text-right' },
  { key: 'planilha', header: 'Planilha', cell: (c) => c.esperados, sortValue: (c) => c.esperados, className: 'text-right' },
  {
    key: 'resultado',
    header: 'Resultado',
    cell: (c) => <Selo className={resultadoDe(c.diferenca).classe}>{resultadoDe(c.diferenca).rotulo}</Selo>,
    sortValue: (c) => c.diferenca,
  },
  { key: 'a-mais', header: 'A mais', cell: (c) => (c.aMais.length > 0 ? c.aMais.length : '—'), sortValue: (c) => c.aMais.length, className: 'text-right' },
  { key: 'quem', header: 'Quem', cell: (c) => c.lancadoPor ?? '—', sortValue: (c) => c.lancadoPor },
  { key: 'obs', header: 'Obs.', cell: (c) => c.obs ?? '' },
];

export function ConferenciaPainel({
  baias,
  animais,
  historico,
  configurado,
  ok,
  carregadoEm,
}: {
  baias: Baia[];
  animais: Animal[];
  historico: Conferencia[];
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const [galpao, setGalpao] = useState('');
  const [aberta, setAberta] = useState<string | null>(null);
  const [salva, setSalva] = useState<Resumo | null>(null);

  const contagem = useMemo(() => contagemPorBaia(animais), [animais]);
  const ultima = useMemo(() => ultimaPorBaia(historico), [historico]);
  const galpoes = useMemo(() => [...new Set(baias.map((b) => b.galpao))], [baias]);
  const visiveis = galpao ? baias.filter((b) => b.galpao === galpao) : baias;
  const recentes = useMemo(() => [...historico].reverse(), [historico]);

  const baia = aberta ? baias.find((b) => b.nome === aberta) : undefined;
  const daBaia = useMemo(() => (baia ? animaisDaBaia(animais, baia.nome) : []), [animais, baia]);
  const fora = useMemo(() => (baia ? foraDaContagem(animais, baia.nome) : []), [animais, baia]);

  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      {baia ? (
        <FormConferencia
          // A chave zera a tela ao trocar de baia.
          key={baia.nome}
          baia={baia}
          daBaia={daBaia}
          fora={fora}
          pool={animais}
          anterior={ultima.get(baia.nome)}
          onVoltar={() => setAberta(null)}
          onSalva={(r) => {
            setSalva(r);
            setAberta(null);
          }}
        />
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold text-ink">Conferência de baia</h2>
            <p className="mt-1 text-sm text-ink-2">Escolha a baia, conte os animais e digite o total: o painel compara com o que a planilha diz que está lá.</p>
          </div>

          {salva && (
            <Aviso tom={salva.diferenca === 0 ? 'ok' : 'aviso'}>
              Conferência da {salva.baia} salva: você contou {salva.contados} e a planilha tem {salva.esperados} —{' '}
              {resultadoDe(salva.diferenca).rotulo.toLowerCase()}.
            </Aviso>
          )}

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

          {baias.length === 0 ? (
            <Aviso tom="aviso">Nenhuma baia encontrada na planilha.</Aviso>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((b) => {
                const n = contagem.get(b.nome) ?? 0;
                return (
                  <button
                    key={b.nome}
                    type="button"
                    onClick={() => {
                      setSalva(null);
                      setAberta(b.nome);
                    }}
                    className="flex flex-col items-start gap-1.5 rounded-card border border-rule bg-paper p-4 text-left shadow-card transition-colors hover:border-ink"
                  >
                    <span className="text-xl font-bold leading-tight text-ink">{b.nome}</span>
                    <span className="text-sm text-ink-2">
                      {[b.categoria, n === 0 ? 'vazia na planilha' : plural(n, 'animal', 'animais')].filter(Boolean).join(' · ')}
                    </span>
                    <Ultima c={ultima.get(b.nome)} />
                  </button>
                );
              })}
            </div>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-ink">Conferências feitas</h3>
            {recentes.length === 0 ? (
              <p className="text-sm text-ink-2">Nenhuma conferência ainda.</p>
            ) : (
              <DataTable columns={COLUNAS_HISTORICO} rows={recentes} rowKey={(c) => c.id} pageSize={10} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
