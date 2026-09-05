'use client';

import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { VAZIO, formatarNumero } from '@/lib/adm/format';
import {
  CLASSES_VAZIO,
  COR_FUNDO,
  COR_GRID,
  MENSAGEM_VAZIA,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  comoNumero,
  corSerie,
} from './theme';

/**
 * Um eixo do radar: o NÚMERO do ponto da AML (1..16), o rótulo por extenso e a
 * média.
 *
 * Repare no que este contrato NÃO tem: nome de coluna do banco. É de propósito.
 * As colunas da AML têm grafia inconsistente (`ponto_5_profundidadedeúbere` e
 * `ponto_12_ligamentosuspensóriomedio` têm ACENTO, os `class_*` correspondentes
 * não), e qualquer código que gere essas chaves por template quebra em silêncio.
 * Aqui chega dado já resolvido: quem monta a lista é `pontosDoRadar()` em
 * src/lib/adm/areas/avaliacoes.ts, a partir do que a view entregou.
 */
export interface PontoRadar {
  /** 1..16 — o número do ponto, o mesmo que o app mostra no perfil do animal. */
  numero: number;
  /** Rótulo inteiro ('5 · Profundidade de úbere'), para o tooltip. */
  rotulo: string;
  valor: number;
}

interface Props {
  pontos: PontoRadar[];
  /**
   * Teto do eixo radial. Default 9 porque a AML é uma escala BIOLÓGICA de 1 a 9,
   * não uma nota: 9 em "ângulo de garupa" não é melhor que 5, é diferente. Fixar
   * o teto em vez de deixar o recharts escalar pelo dado é o que torna dois
   * criadores comparáveis — com domínio automático, um rebanho fraco desenharia
   * o mesmo polígono cheio de um rebanho excelente.
   */
  escala?: number;
  /** Pontuação total média (0-100), no medalhão central. Null esconde o medalhão. */
  total?: number | null;
  rotuloTotal?: string;
  altura?: number;
  mensagemVazia?: string;
}

/** Raio do disco numerado de cada eixo. */
const R_BADGE = 11;

/**
 * Radar do perfil morfológico — a média por ponto da AML.
 *
 * MESMA LEITURA VISUAL DO APP (ver src/components/criadores/RadarAml.tsx, que
 * espelha o compartilhamento de perfil do SeabraApp): polígono preenchido,
 * grade em anéis, discos NUMERADOS em volta e o medalhão da pontuação total no
 * centro. Isso não é homenagem — o técnico que faz a AML já lê esse desenho no
 * celular, e um segundo dialeto visual para o mesmo dado obrigaria a traduzir de
 * cabeça na frente do cliente.
 *
 * A DIFERENÇA em relação ao do app: lá o radar é de UM animal, aqui é a MÉDIA do
 * rebanho avaliado. A forma continua sendo a informação — um polígono afundado
 * em 10, 11 e 12 é um rebanho com problema de úbere, e isso se vê antes de ler
 * qualquer número.
 *
 * Os números ficam nos discos e no tooltip; a leitura exata de cada eixo é da
 * lista de barras que a página desenha ao lado, exatamente como o app faz — o
 * radar mostra a FORMA, a barra mostra o VALOR.
 */
export function RadarAml({
  pontos,
  escala = 9,
  total = null,
  rotuloTotal = 'pontos',
  altura = 340,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  const dados = useMemo(() => {
    return (
      pontos
        .filter((p) => Number.isFinite(p.valor))
        .map((p) => ({
          numero: p.numero,
          rotulo: p.rotulo,
          // Clamp no teto da escala: um valor acima de 9 é dado sujo (a AML não
          // tem 10), e desenhá-lo estouraria o polígono para fora da grade —
          // o que parece defeito de renderização, não dado errado.
          valor: Math.max(0, Math.min(escala, p.valor)),
        }))
        // Ordem pelo NÚMERO do ponto, sempre. A forma do polígono só é
        // comparável entre dois criadores se os eixos estiverem na mesma ordem;
        // ordenar por valor (o reflexo de quem vem de gráfico de barras) daria a
        // todo rebanho o mesmo formato de espiral e destruiria a leitura.
        .sort((a, b) => a.numero - b.numero)
    );
  }, [pontos, escala]);

  // Menos de três eixos não fecham polígono: o recharts desenharia um traço solto
  // e o app trata o mesmo caso devolvendo null. Aqui vira estado vazio explícito.
  if (dados.length < 3) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura }}>
        {mensagemVazia}
      </div>
    );
  }

  return (
    <div className="relative w-full tabular-nums" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* outerRadius menor que o default (80%) para os discos numerados, que
            são desenhados FORA da grade, caberem dentro do card. */}
        <RadarChart data={dados} outerRadius="68%" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <PolarGrid stroke={COR_GRID} gridType="polygon" />

          <PolarAngleAxis
            dataKey="numero"
            tickLine={false}
            axisLine={false}
            // Disco numerado no lugar do texto solto: é o que o app desenha, e
            // com 16 eixos um número dentro de um disco continua ancorado ao seu
            // raio, enquanto texto nu "flutua" e o olho o atribui ao eixo vizinho.
            tick={(props) => {
              const cx = Number(props.x);
              const cy = Number(props.y);
              const rotulo = props.payload?.value;
              if (!Number.isFinite(cx) || !Number.isFinite(cy)) return <g key={`tick-${props.index}`} />;
              return (
                <g key={`tick-${props.index}`}>
                  <circle cx={cx} cy={cy} r={R_BADGE} fill="var(--secondary)" stroke="var(--border)" />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--ink-1)"
                    fontSize={11}
                  >
                    {String(rotulo ?? '')}
                  </text>
                </g>
              );
            }}
          />

          {/* Sem régua radial: com 16 eixos, os números de escala caem dentro do
              polígono e disputam espaço com ele. A escala é dita em texto pela
              página ("escala de 1 a 9"), que é onde ela cabe. */}
          <PolarRadiusAxis domain={[0, escala]} tick={false} axisLine={false} tickLine={false} />

          <Tooltip
            contentStyle={TOOLTIP_ESTILO}
            labelStyle={TOOLTIP_ROTULO_ESTILO}
            itemStyle={TOOLTIP_ITEM_ESTILO}
            // O título é o rótulo INTEIRO da característica. O disco só carrega o
            // número, e um número sem lugar onde virar nome é dado escondido —
            // mesma regra do rótulo cortado em <DistribuicaoBarras>.
            labelFormatter={(rotulo, itens) => {
              const primeiro = Array.isArray(itens) ? itens[0] : undefined;
              const dado = (primeiro as { payload?: PontoRadar } | undefined)?.payload;
              return dado?.rotulo ?? `Ponto ${String(rotulo ?? '')}`;
            }}
            formatter={(valor) => {
              const n = comoNumero(valor);
              return [n == null ? VAZIO : `${formatarNumero(n, 1)} de ${escala}`, 'Média'];
            }}
          />

          <Radar
            dataKey="valor"
            name="Média"
            stroke={corSerie(0)}
            strokeWidth={2}
            fill={corSerie(0)}
            fillOpacity={0.28}
            dot={{ r: 3, fill: COR_FUNDO, stroke: corSerie(0), strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>

      {total != null && Number.isFinite(total) && (
        // Medalhão central, como no app. Sobreposto em HTML e não em SVG porque
        // o recharts centra o gráfico em 50%/50% da área — e `pointer-events-none`
        // para ele nunca roubar o hover dos eixos que estão embaixo.
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 flex-col items-center justify-center rounded-full border border-border bg-card">
            <span className="text-base leading-none tabular-nums text-foreground">
              {formatarNumero(total, 1)}
            </span>
            <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">{rotuloTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
