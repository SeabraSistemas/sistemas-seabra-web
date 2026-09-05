'use client';

import { useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PontoSerie } from '@/lib/adm/types';
import {
  ALTURA_PADRAO,
  CLASSES_VAZIO,
  COR_FUNDO,
  COR_GRID,
  CURSOR_LINHA,
  EIXO_BASE,
  EIXO_VALOR,
  MENSAGEM_VAZIA,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  comoNumero,
  corSerie,
  detectarGranularidade,
  eixoDePeriodos,
  formatarValorPadrao,
  rotuloEixo,
  rotuloExtenso,
  tracoSerie,
  type Granularidade,
} from './theme';

/** Uma série do gráfico. `pontos` é o contrato PontoSerie de '@/lib/adm/types'. */
export interface Serie {
  /** Identificador estável da série — usado só como key de React. */
  chave: string;
  /** O que aparece na legenda e no tooltip. */
  nome: string;
  pontos: PontoSerie[];
}

interface Props {
  /**
   * 1..n séries. Uma só continua sendo um array — a alternativa (aceitar
   * `pontos` OU `series`) obrigaria a discriminar em runtime, e a chamada
   * `series={[{ chave: 'mrr', nome: 'Receita', pontos }]}` é uma linha.
   */
  series: Serie[];
  /** Default: deduzida do formato do período ('YYYY-MM' = mês, 'YYYY-MM-DD' = dia). */
  granularidade?: Granularidade;
  /** Default: área quando há uma série, linha quando há várias. */
  tipo?: 'linha' | 'area';
  /**
   * O que fazer com período ausente. 'zero' (default) é o certo para contagem e
   * dinheiro: o mês sem venda vendeu zero. 'vazio' é para média e taxa, onde não
   * houve medição — a linha se interrompe e o buraco aparece como buraco.
   */
  buracos?: 'zero' | 'vazio';
  altura?: number;
  /** Default: inteiro sem casa, fracionário com uma. Passe formatarMoeda/formatarLitros. */
  formatarValor?: (valor: number) => string;
  /**
   * Default true. Série de contagem e de receita PRECISA da base zero, senão uma
   * variação de 2% ocupa a altura toda do card e parece um tombo. O caso
   * contrário (EvolucaoChart do /katmandu, que mostra ganho de peso de um lote)
   * é a exceção, não a regra.
   */
  ancorarEmZero?: boolean;
  mensagemVazia?: string;
}

interface Linha {
  periodo: string;
  [chave: string]: string | number | null;
}

/**
 * Série temporal de 1..n métricas, por mês ou por dia.
 *
 * A regra que dá razão de existir a este componente: ele reconstrói o eixo
 * inteiro entre o primeiro e o último período e materializa os períodos que o
 * banco não devolveu. Sem isso, um mês sem lançamento não vira ponto, e o
 * recharts liga fevereiro em abril com uma reta — o gráfico passa a afirmar que
 * março foi um mês mediano quando março foi um mês morto. Interpolar em silêncio
 * é a única forma de um gráfico mentir sem ninguém perceber.
 */
export function SerieTemporal({
  series,
  granularidade,
  tipo,
  buracos = 'zero',
  altura = ALTURA_PADRAO,
  formatarValor = formatarValorPadrao,
  ancorarEmZero = true,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  // Um id por instância: duas séries temporais na mesma página compartilhariam o
  // <linearGradient> se o id fosse constante, e a segunda repintaria a primeira.
  const idBase = useId().replace(/:/g, '');

  const { linhas, gran, comDados, totalPontos } = useMemo(() => {
    const validas = series.filter((s) => s.pontos.length > 0);
    const todos = validas.flatMap((s) => s.pontos.map((p) => p.periodo));
    const g = granularidade ?? detectarGranularidade(todos.slice().sort()[0]);
    const eixo = eixoDePeriodos(todos, g);

    // Um Map por série: período duplicado no retorno do banco (nunca deveria
    // acontecer, mas o escape hatch lê tabela crua) resolve pelo último valor,
    // em vez de somar dois e inventar um pico.
    const mapas = validas.map((s) => new Map(s.pontos.map((p) => [p.periodo, p.valor])));

    const dados: Linha[] = eixo.map((periodo) => {
      const linha: Linha = { periodo };
      mapas.forEach((mapa, i) => {
        const v = mapa.get(periodo);
        linha[chaveSerie(i)] = v ?? (buracos === 'zero' ? 0 : null);
      });
      return linha;
    });

    return { linhas: dados, gran: g, comDados: validas, totalPontos: eixo.length };
  }, [series, granularidade, buracos]);

  if (comDados.length === 0 || linhas.length === 0) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura }}>
        {mensagemVazia}
      </div>
    );
  }

  const forma = tipo ?? (comDados.length === 1 ? 'area' : 'linha');
  // Acima de ~24 pontos os marcadores viram um colar de contas e escondem a
  // linha; abaixo disso eles são o que deixa clicável a leitura ponto a ponto.
  const comPontos = totalPontos <= 24;

  return (
    <div className="w-full tabular-nums">
      {comDados.length > 1 && (
        <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {comDados.map((s, i) => (
            <li key={s.chave} className="flex items-center gap-1.5">
              {/* A legenda repete o padrão de traço, e não só a cor: é o que
                  sobrevive à impressão em preto e branco do dossiê (D4). */}
              <svg width="18" height="8" aria-hidden className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="18"
                  y2="4"
                  stroke={corSerie(i)}
                  strokeWidth="2"
                  strokeDasharray={tracoSerie(i)}
                />
              </svg>
              <span className="text-foreground">{s.nome}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={linhas} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
            {forma === 'area' && (
              <defs>
                {comDados.map((s, i) => (
                  <linearGradient key={s.chave} id={`${idBase}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={corSerie(i)} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={corSerie(i)} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
            )}

            <CartesianGrid stroke={COR_GRID} vertical={false} />

            <XAxis
              {...EIXO_BASE}
              dataKey="periodo"
              tickFormatter={(v: string) => rotuloEixo(v, gran)}
              interval="preserveStartEnd"
              // Deixa o recharts descartar rótulos em vez de sobrepô-los: 90 dias
              // de série diária não cabem como 90 etiquetas.
              minTickGap={24}
            />

            <YAxis
              {...EIXO_VALOR}
              width={64}
              domain={ancorarEmZero ? [0, 'auto'] : ['dataMin', 'dataMax']}
              padding={ancorarEmZero ? undefined : { top: 16, bottom: 16 }}
              tickFormatter={(v: number) => formatarValor(v)}
            />

            <Tooltip
              cursor={CURSOR_LINHA}
              contentStyle={TOOLTIP_ESTILO}
              labelStyle={TOOLTIP_ROTULO_ESTILO}
              itemStyle={TOOLTIP_ITEM_ESTILO}
              // Ordem de declaração das séries, não ordem alfabética: as chaves
              // são 'v00', 'v01'… justamente para o sort lexicográfico bater com
              // a ordem em que o chamador passou as séries.
              itemSorter="dataKey"
              labelFormatter={(rotulo) => rotuloExtenso(String(rotulo), gran)}
              formatter={(valor, nome) => {
                const n = comoNumero(valor);
                return [n == null ? '—' : formatarValor(n), String(nome ?? '')];
              }}
            />

            {forma === 'area' &&
              comDados.map((s, i) => (
                <Area
                  key={`area-${s.chave}`}
                  type="monotone"
                  dataKey={chaveSerie(i)}
                  name={s.nome}
                  stroke={corSerie(i)}
                  strokeWidth={2}
                  strokeDasharray={tracoSerie(i)}
                  fill={`url(#${idBase}-${i})`}
                  // connectNulls false é o ponto do componente: com buracos='vazio'
                  // a linha PRECISA se romper. Ligar os pontos por cima do vão
                  // desenharia um dado que ninguém mediu.
                  connectNulls={false}
                  dot={comPontos ? { r: 3, fill: COR_FUNDO, stroke: corSerie(i), strokeWidth: 2 } : false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}

            {forma === 'linha' &&
              comDados.map((s, i) => (
                <Line
                  key={`linha-${s.chave}`}
                  type="monotone"
                  dataKey={chaveSerie(i)}
                  name={s.nome}
                  stroke={corSerie(i)}
                  strokeWidth={2}
                  strokeDasharray={tracoSerie(i)}
                  connectNulls={false}
                  dot={comPontos ? { r: 3, fill: COR_FUNDO, stroke: corSerie(i), strokeWidth: 2 } : false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * A chave da série no dataset é posicional e zero-padded, nunca a `chave` que o
 * chamador passou: nome de coluna do banco pode repetir, vir com acento ou com
 * ponto, e qualquer um dos três quebra o dataKey do recharts em silêncio.
 */
function chaveSerie(indice: number): string {
  return `v${String(indice).padStart(2, '0')}`;
}
