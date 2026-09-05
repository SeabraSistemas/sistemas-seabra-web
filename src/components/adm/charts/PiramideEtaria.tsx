'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FatiaDistribuicao } from '@/lib/adm/types';
import {
  CLASSES_VAZIO,
  COR_GRID,
  COR_REFERENCIA,
  CURSOR_BARRA,
  EIXO_BASE,
  MENSAGEM_VAZIA,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  comoNumero,
  corSerie,
  encurtar,
  formatarValorPadrao,
} from './theme';

interface Props {
  /**
   * Uma FatiaDistribuicao por faixa etária, com `rotulo` = a faixa. As duas
   * listas são separadas (e não uma só com o sexo no rótulo) porque a pirâmide
   * precisa parear faixa a faixa: é a comparação entre os dois lados da MESMA
   * faixa que revela o rebanho, não a distribuição de cada sexo isolada.
   */
  femeas: FatiaDistribuicao[];
  machos: FatiaDistribuicao[];
  /**
   * Ordem das faixas, de cima para baixo. Sem ela a ordem é a de chegada — e é
   * quase sempre necessária: faixa etária tem ordem NATURAL ('0-2 m' antes de
   * '3-6 m'), que nem ordem alfabética nem ordem por contagem reproduzem.
   */
  ordem?: string[];
  /** Default: calculada pelo número de faixas — 32px por linha. */
  altura?: number;
  larguraRotulo?: number;
  formatarValor?: (valor: number) => string;
  mensagemVazia?: string;
}

interface LinhaPiramide {
  faixa: string;
  /** Negativo de propósito: é o que joga a barra para o lado esquerdo do eixo. */
  femeas: number;
  machos: number;
}

const COR_FEMEAS = corSerie(0); // --ocre, L*≈60
const COR_MACHOS = corSerie(1); // --ocre clareado, L*≈86 — 26 pontos de L* separam os lados

/**
 * Pirâmide etária: fêmeas à esquerda, machos à direita, uma faixa por linha.
 *
 * O truque das barras divergentes é empilhar as duas séries no MESMO stackId com
 * as fêmeas negativas — assim cada faixa é uma barra só, partida no zero, e não
 * duas barras vizinhas. O eixo devolve o sinal com Math.abs() na formatação:
 * "-412 fêmeas" seria um número errado exibido como se fosse certo.
 *
 * O domínio é simétrico (±maior valor dos dois lados) mesmo quando um lado é
 * muito menor. Num rebanho leiteiro os machos são poucos, e escalar cada lado
 * pelo seu próprio máximo faria 38 machos ocuparem o mesmo comprimento de 412
 * fêmeas — a leitura ficaria "meio a meio", que é o oposto do que a pirâmide
 * existe para mostrar.
 */
export function PiramideEtaria({
  femeas,
  machos,
  ordem,
  altura,
  larguraRotulo = 88,
  formatarValor = formatarValorPadrao,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  const { linhas, limite, totalFemeas, totalMachos } = useMemo(() => {
    const mapaF = new Map(femeas.map((f) => [f.rotulo, f.valor]));
    const mapaM = new Map(machos.map((m) => [m.rotulo, m.valor]));

    const faixas =
      ordem && ordem.length > 0
        ? // Só as faixas que a ordem declara, e só as que têm dado: faixa
          // declarada e vazia vira linha em branco no meio da pirâmide.
          ordem.filter((f) => mapaF.has(f) || mapaM.has(f))
        : Array.from(new Set([...femeas.map((f) => f.rotulo), ...machos.map((m) => m.rotulo)]));

    const dados: LinhaPiramide[] = faixas.map((faixa) => ({
      faixa,
      femeas: -(mapaF.get(faixa) ?? 0),
      machos: mapaM.get(faixa) ?? 0,
    }));

    const maior = dados.reduce((acc, l) => Math.max(acc, Math.abs(l.femeas), l.machos), 0);

    return {
      linhas: dados,
      limite: maior,
      totalFemeas: dados.reduce((acc, l) => acc + Math.abs(l.femeas), 0),
      totalMachos: dados.reduce((acc, l) => acc + l.machos, 0),
    };
  }, [femeas, machos, ordem]);

  const alturaFinal = altura ?? Math.max(140, linhas.length * 32 + 24);

  if (linhas.length === 0 || limite === 0) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura ?? 140 }}>
        {mensagemVazia}
      </div>
    );
  }

  return (
    <div className="w-full tabular-nums">
      <ul className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: COR_FEMEAS }} aria-hidden />
          <span className="text-foreground">Fêmeas</span>
          <span className="tabular-nums">{formatarValor(totalFemeas)}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: COR_MACHOS }} aria-hidden />
          <span className="text-foreground">Machos</span>
          <span className="tabular-nums">{formatarValor(totalMachos)}</span>
        </li>
      </ul>

      <div style={{ height: alturaFinal }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={linhas}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 0 }}
            barCategoryGap="18%"
            stackOffset="sign"
          >
            <CartesianGrid stroke={COR_GRID} horizontal={false} />

            <XAxis
              {...EIXO_BASE}
              type="number"
              domain={[-limite, limite]}
              axisLine={false}
              // Math.abs porque o negativo é um artifício de layout, não um dado:
              // não existe "-412 fêmeas".
              tickFormatter={(v: number) => formatarValor(Math.abs(v))}
            />

            <YAxis
              {...EIXO_BASE}
              type="category"
              dataKey="faixa"
              width={larguraRotulo}
              axisLine={false}
              tickFormatter={(v: string) => encurtar(v, Math.floor(larguraRotulo / 7))}
            />

            {/* O zero é a espinha da pirâmide: sem uma linha marcando-o, os dois
                lados parecem dois gráficos soltos lado a lado. */}
            <ReferenceLine x={0} stroke={COR_REFERENCIA} strokeWidth={1} />

            <Tooltip
              cursor={CURSOR_BARRA}
              contentStyle={TOOLTIP_ESTILO}
              labelStyle={TOOLTIP_ROTULO_ESTILO}
              itemStyle={TOOLTIP_ITEM_ESTILO}
              itemSorter="dataKey"
              formatter={(valor, nome) => {
                const n = comoNumero(valor);
                return [n == null ? '—' : formatarValor(Math.abs(n)), String(nome ?? '')];
              }}
            />

            {/* Mesmo stackId nos dois: é o que faz a faixa virar UMA barra
                partida no zero, em vez de duas barras empilhadas verticalmente. */}
            <Bar dataKey="femeas" name="Fêmeas" stackId="faixa" fill={COR_FEMEAS} isAnimationActive={false} />
            <Bar dataKey="machos" name="Machos" stackId="faixa" fill={COR_MACHOS} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
