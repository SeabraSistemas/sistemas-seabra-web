'use client';

import { useMemo } from 'react';
import { NOME_GRUPO, ORDEM_GRUPOS, calculavel } from '@/lib/nutricao/alimentos';
import { NUTRIENTES_COMPARADOR, custoDoInsumo, maisBarato, type CustoInsumo, type NutrienteComparador } from '@/lib/nutricao/comparador';
import type { Alimento } from '@/lib/nutricao/tipos';
import { numero, reais } from '@/components/nutricao/formato';
import type { EstadoComparador } from '@/components/nutricao/estado';
import { Aviso, NumeroInput, Rotulo, Secao, Selecao } from '@/components/nutricao/ui';
import { cn } from '@/lib/utils';

const NOME_NUTRIENTE: Record<NutrienteComparador, string> = { pb: 'proteína bruta (PB)', ndt: 'NDT', ca: 'cálcio (Ca)', p: 'fósforo (P)' };
const SIGLA: Record<NutrienteComparador, string> = { pb: 'PB', ndt: 'NDT', ca: 'Ca', p: 'P' };

export function AbaComparador({ comparador, mudar, banco }: { comparador: EstadoComparador; mudar: (c: EstadoComparador) => void; banco: Alimento[] }) {
  const alimentoA = banco.find((a) => a.id === comparador.a);
  const alimentoB = banco.find((a) => a.id === comparador.b);
  const custoA = useMemo(() => (alimentoA ? custoDoInsumo(alimentoA, comparador.precoA ?? alimentoA.preco) : null), [alimentoA, comparador.precoA]);
  const custoB = useMemo(() => (alimentoB ? custoDoInsumo(alimentoB, comparador.precoB ?? alimentoB.preco) : null), [alimentoB, comparador.precoB]);

  return (
    <div className="space-y-4">
      <Secao
        titulo="Comparador de insumos"
        info={
          <>
            <p>Quanto custa cada kg de <b>matéria seca</b> e de cada nutriente em dois alimentos, para ver qual compensa comprar.</p>
            <p>R$/kg MS = R$/kg MN ÷ %MS &nbsp;·&nbsp; R$/kg de nutriente = R$/kg MS ÷ fração do nutriente na MS.</p>
            <p>O preço vem do banco; se digitar um preço aqui, vale só nesta comparação.</p>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Lado letra="A" alimentoId={comparador.a} preco={comparador.precoA} alimento={alimentoA} banco={banco} aoEscolher={(id) => mudar({ ...comparador, a: id, precoA: null })} aoPreco={(n) => mudar({ ...comparador, precoA: n })} />
          <Lado letra="B" alimentoId={comparador.b} preco={comparador.precoB} alimento={alimentoB} banco={banco} aoEscolher={(id) => mudar({ ...comparador, b: id, precoB: null })} aoPreco={(n) => mudar({ ...comparador, precoB: n })} />
        </div>
      </Secao>

      {custoA && custoB && <Resultado a={custoA} b={custoB} />}
    </div>
  );
}

function Lado({
  letra,
  alimentoId,
  preco,
  alimento,
  banco,
  aoEscolher,
  aoPreco,
}: {
  letra: string;
  alimentoId: string;
  preco: number | null;
  alimento: Alimento | undefined;
  banco: Alimento[];
  aoEscolher: (id: string) => void;
  aoPreco: (n: number | null) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border p-3">
      <Rotulo texto={`Alimento ${letra}`} />
      <Selecao rotuloAria={`Alimento ${letra}`} valor={alimentoId} aoMudar={aoEscolher}>
        {ORDEM_GRUPOS.map((g) => (
          <optgroup key={g} label={NOME_GRUPO[g]}>
            {banco
              .filter((a) => a.grupo === g)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
          </optgroup>
        ))}
      </Selecao>
      <div className="space-y-1">
        <Rotulo texto="Preço" info={<p>R$ por kg de matéria natural. Vazio = usa o preço do banco ({alimento?.preco != null ? reais(alimento.preco) : 'sem preço'}).</p>} />
        <NumeroInput rotuloAria={`Preço do alimento ${letra}`} valor={preco} aoMudar={aoPreco} sufixo="R$/kg" placeholder={alimento?.preco != null ? numero(alimento.preco, 2) : 'sem preço'} casas={3} />
      </div>
      {alimento && !calculavel(alimento) && <Aviso>Sem matéria seca no banco: preencha na aba Banco.</Aviso>}
    </div>
  );
}

function Resultado({ a, b }: { a: CustoInsumo; b: CustoInsumo }) {
  const linhas: { rotulo: string; va: number | null; vb: number | null; casas: number }[] = [
    { rotulo: 'Preço (R$/kg MN)', va: a.precoKgMn, vb: b.precoKgMn, casas: 3 },
    { rotulo: 'R$/kg de MS', va: a.porKgMs, vb: b.porKgMs, casas: 3 },
    ...NUTRIENTES_COMPARADOR.map((n) => ({ rotulo: `R$/kg de ${SIGLA[n]}`, va: a.porKgNutriente[n], vb: b.porKgNutriente[n], casas: n === 'ca' || n === 'p' ? 1 : 2 })),
  ];
  const semPreco = a.precoKgMn == null || b.precoKgMn == null;
  return (
    <>
      {semPreco && <Aviso>Falta preço em {a.precoKgMn == null && b.precoKgMn == null ? 'os dois alimentos' : a.precoKgMn == null ? a.alimento.nome : b.alimento.nome}: digite um preço acima para comparar.</Aviso>}
      <Secao titulo="Quem sai mais barato" info={<p>O <b>verde</b> marca o menor valor de cada linha. Vazio (—) quando falta preço, matéria seca ou o nutriente é zero.</p>}>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[19rem] text-sm">
            <thead>
              <tr className="text-right text-xs text-muted-foreground">
                <th className="px-1 pb-2" />
                <th className="px-1 pb-2 font-semibold text-foreground">A · {a.alimento.nome}</th>
                <th className="px-1 pb-2 font-semibold text-foreground">B · {b.alimento.nome}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {linhas.map((l, i) => {
                const vence = i === 0 ? null : maisBarato(l.va, l.vb);
                return (
                  <tr key={l.rotulo} className="border-t border-border">
                    <th className="py-2 pr-1 text-left font-medium">{l.rotulo}</th>
                    <Valor v={l.va} casas={l.casas} verde={vence === 'a'} />
                    <Valor v={l.vb} casas={l.casas} verde={vence === 'b'} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao titulo="R$ por kg de nutriente" info={<p>Barras na mesma escala dentro de cada nutriente: quanto menor, mais barato.</p>}>
        <div className="space-y-4">
          {NUTRIENTES_COMPARADOR.map((n) => (
            <Barras key={n} nome={NOME_NUTRIENTE[n]} a={a.porKgNutriente[n]} b={b.porKgNutriente[n]} nomeA={a.alimento.nome} nomeB={b.alimento.nome} />
          ))}
        </div>
      </Secao>
    </>
  );
}

function Valor({ v, casas, verde }: { v: number | null; casas: number; verde: boolean }) {
  return <td className={cn('px-1 py-2 text-right', verde && 'bg-ok-soft font-semibold text-ok')}>{v == null ? '—' : numero(v, casas)}</td>;
}

function Barras({ nome, a, b, nomeA, nomeB }: { nome: string; a: number | null; b: number | null; nomeA: string; nomeB: string }) {
  const max = Math.max(a ?? 0, b ?? 0);
  const vence = maisBarato(a, b);
  const barra = (valor: number | null, nomeAl: string, verde: boolean) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 truncate text-muted-foreground">{nomeAl}</span>
      <div className="h-5 min-w-0 flex-1 rounded bg-secondary">
        {valor != null && max > 0 && <div className={cn('h-5 rounded', verde ? 'bg-ok' : 'bg-muted-foreground/50')} style={{ width: `${Math.max(2, (valor / max) * 100)}%` }} />}
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums">{valor == null ? '—' : numero(valor, valor >= 100 ? 0 : 2)}</span>
    </div>
  );
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium first-letter:uppercase">{nome}</p>
      {barra(a, nomeA, vence === 'a')}
      {barra(b, nomeB, vence === 'b')}
    </div>
  );
}
