'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LinhaCrescimento } from '@/lib/adm/areas/contrato';
import { VAZIO, formatarInteiro, formatarKg } from '@/lib/adm/format';
import {
  CLASSES_VAZIO,
  COR_GRID,
  COR_OUTROS,
  COR_REFERENCIA,
  EIXO_BASE,
  EIXO_VALOR,
  MENSAGEM_VAZIA,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  comoNumero,
  corSerie,
} from './theme';

/**
 * O tipo do ponto vem do CONTRATO, não de uma interface própria deste arquivo.
 *
 * `LinhaCrescimento.nuvem_peso_idade` é a coluna jsonb que a view
 * `adm.propriedade_crescimento` projeta; derivar o tipo dela aqui significa que,
 * se o contrato ganhar ou perder um campo, este gráfico deixa de compilar em vez
 * de renderizar `undefined` em silêncio. `import type` é apagado na compilação,
 * então nada de servidor entra no bundle do cliente por causa desta linha.
 */
export type PontoNuvem = NonNullable<LinhaCrescimento['nuvem_peso_idade']>[number];

interface Props {
  pontos: PontoNuvem[];
  /**
   * Os três parâmetros zootécnicos de `propriedades` que desenham a BANDA DE
   * META. São eles que transformam uma nuvem de bolinhas em diagnóstico: sem
   * banda, o gráfico só diz "animais mais velhos pesam mais", que todo mundo já
   * sabe. Nulo é caso REAL e frequente (a propriedade nunca preencheu) — aí o
   * componente desenha a nuvem sem banda e quem chama avisa por quê.
   */
  pesoIdealDesmame?: number | null;
  idadeDesmame?: number | null;
  pesoIdealEntradaReproducao?: number | null;
  altura?: number;
  /**
   * Teto de bolinhas desenhadas. Acima disso a nuvem é AMOSTRADA e a legenda diz
   * que foi: o maior rebanho da base tem 4.820 animais, e 4.820 <circle> num SVG
   * de 600 px travam a aba por vários segundos para desenhar uma mancha que já
   * estava saturada aos 2.000.
   */
  maximo?: number;
  mensagemVazia?: string;
}

/**
 * Os três baldes de cor. `indefinido` NÃO é um erro de dado a esconder: um animal
 * sem sexo cadastrado continua tendo peso e idade, e some da nuvem se for
 * descartado — o que faria o consultor diagnosticar um rebanho menor do que o
 * que existe.
 */
type Grupo = 'femea' | 'macho' | 'indefinido';

const GRUPOS: readonly { chave: Grupo; nome: string; cor: string }[] = [
  // Mesma atribuição da <PiramideEtaria>: fêmea = --ocre, macho = --ocre clareado.
  // Os dois estão a 26 pontos de L*, o máximo que a escala monocromática permite,
  // e continuam distinguíveis no dossiê impresso em preto e branco (D4).
  { chave: 'femea', nome: 'Fêmeas', cor: corSerie(0) },
  { chave: 'macho', nome: 'Machos', cor: corSerie(1) },
  { chave: 'indefinido', nome: 'Sem sexo', cor: COR_OUTROS },
];

const NOME_DO_GRUPO: Record<Grupo, string> = {
  femea: 'Fêmea',
  macho: 'Macho',
  indefinido: 'Sem sexo cadastrado',
};

/**
 * ARMADILHA DO DADO: o banco grava 'fêmea' COM acento, e também aparecem 'F',
 * 'M', 'Macho' e vazio. Comparar com a string 'femea' não casa nada e a nuvem
 * sairia inteira cinza, sem erro nenhum na tela. Por isso: tira acento, minúscula
 * e olha a INICIAL — a única letra em que todas as grafias concordam.
 */
function grupoDoSexo(sexo: string | null | undefined): Grupo {
  if (typeof sexo !== 'string') return 'indefinido';
  const s = sexo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (s.startsWith('f')) return 'femea';
  if (s.startsWith('m')) return 'macho';
  return 'indefinido';
}

function finito(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/** Cor do alerta. `--destructive` é o token que o painel já usa para "isto é
 *  ruim" (ver KpiCard); em 7% de opacidade ele vira um fundo, não um susto. */
const COR_ALERTA = 'var(--destructive)';

/**
 * Nuvem peso × idade com banda de meta — o gráfico central da aba Crescimento.
 *
 * A NUVEM SOZINHA NÃO DIAGNOSTICA NADA. Peso cresce com idade em qualquer
 * rebanho do mundo; o que o consultor precisa ver é QUEM está fora da meta que
 * aquela fazenda declarou. Daí as três marcas de referência, todas construídas a
 * partir de `propriedades.peso_ideal_desmame`, `idade_desmame` e
 * `peso_ideal_entrada_reproducao` — nada aqui é inventado nem estimado:
 *
 *   faixa de meta   corredor horizontal entre o peso ideal ao desmame e o peso de
 *                   entrada em reprodução. É a distância que a recria precisa
 *                   percorrer. Abaixo dela = ainda não desmamou de fato; acima =
 *                   pronto para reproduzir.
 *   linha do desmame  vertical na idade de desmame declarada.
 *   zona de atraso  o retângulo à DIREITA da linha e ABAIXO do corredor: animais
 *                   que já passaram da idade de desmame e não chegaram ao peso.
 *                   Cada bolinha ali é um telefonema.
 *
 * A zona de atraso é o cruzamento das duas referências, e é por isso que ela é a
 * informação: nem a idade sozinha nem o peso sozinho apontam um problema.
 *
 * `ifOverflow="extendDomain"` na faixa e na linha é deliberado: se NENHUM animal
 * chegou ao peso de entrada em reprodução, a meta continua desenhada e o eixo
 * estica para caber. O vão vazio entre a nuvem e a meta é exatamente o que se
 * quer mostrar — descartar a marca por estar fora do domínio esconderia o pior
 * diagnóstico possível.
 */
export function NuvemPesoIdade({
  pontos,
  pesoIdealDesmame,
  idadeDesmame,
  pesoIdealEntradaReproducao,
  altura = 340,
  maximo = 2000,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  const { series, total, desenhados } = useMemo(() => {
    // Ponto inválido some antes de tudo: idade negativa e peso zero existem no
    // banco (digitação), e um deles ancorado no canto puxaria o domínio do eixo
    // e achataria a nuvem inteira contra o topo.
    const validos = pontos.filter(
      (p) => finito(p.idade_dias) && p.idade_dias >= 0 && finito(p.peso_kg) && p.peso_kg > 0,
    );

    // Amostragem por passo fixo, não aleatória: o mesmo conjunto desenha o mesmo
    // gráfico em toda recarga. Um `Math.random()` aqui faria a nuvem mudar de
    // forma entre dois prints da mesma tela — e o Felipe imprime isto (D4).
    const passo = validos.length > maximo ? Math.ceil(validos.length / maximo) : 1;
    const amostra = passo === 1 ? validos : validos.filter((_, i) => i % passo === 0);

    const baldes = new Map<Grupo, PontoNuvem[]>(GRUPOS.map((g) => [g.chave, []]));
    for (const p of amostra) baldes.get(grupoDoSexo(p.sexo))?.push(p);

    return {
      series: GRUPOS.map((g) => ({ ...g, pontos: baldes.get(g.chave) ?? [] })).filter(
        (g) => g.pontos.length > 0,
      ),
      total: validos.length,
      desenhados: amostra.length,
    };
  }, [pontos, maximo]);

  const pesoDesmame = finito(pesoIdealDesmame) && pesoIdealDesmame > 0 ? pesoIdealDesmame : null;
  const pesoReproducao =
    finito(pesoIdealEntradaReproducao) && pesoIdealEntradaReproducao > 0 ? pesoIdealEntradaReproducao : null;
  const idade = finito(idadeDesmame) && idadeDesmame > 0 ? idadeDesmame : null;

  // O corredor só existe quando os dois pesos existem E fazem sentido juntos.
  // Peso de reprodução MENOR que o de desmame é dado sujo: desenhar um retângulo
  // invertido daria uma banda que acusaria de atrasado exatamente quem está bem.
  const corredor = pesoDesmame != null && pesoReproducao != null && pesoReproducao > pesoDesmame;
  const zonaDeAtraso = pesoDesmame != null && idade != null;

  if (total === 0) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura }}>
        {mensagemVazia}
      </div>
    );
  }

  return (
    <div className="w-full tabular-nums">
      <ul className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {series.map((g) => (
          <li key={g.chave} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: g.cor }} aria-hidden />
            <span className="text-foreground">{g.nome}</span>
            <span className="tabular-nums">{formatarInteiro(g.pontos.length)}</span>
          </li>
        ))}
        {corredor && (
          <li className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-4 rounded-[2px]"
              style={{ background: corSerie(0), opacity: 0.22 }}
              aria-hidden
            />
            <span>
              faixa de meta {formatarKg(pesoDesmame, 0)} → {formatarKg(pesoReproducao, 0)}
            </span>
          </li>
        )}
        {idade != null && (
          <li className="flex items-center gap-1.5">
            <svg width="18" height="8" aria-hidden className="shrink-0">
              <line x1="9" y1="0" x2="9" y2="8" stroke={COR_REFERENCIA} strokeWidth="1.5" strokeDasharray="3 2" />
            </svg>
            <span>desmame aos {formatarInteiro(idade)} dias</span>
          </li>
        )}
      </ul>

      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={COR_GRID} />

            {/* Domínio ancorado em zero nos dois eixos: idade e peso têm zero
                REAL (o nascimento), e cortar o eixo em 'dataMin' faria dois
                rebanhos idênticos parecerem diferentes só por causa da escala. */}
            <XAxis
              {...EIXO_BASE}
              type="number"
              dataKey="idade_dias"
              name="Idade"
              domain={[0, 'dataMax']}
              tickFormatter={(v: number) => formatarInteiro(v)}
              minTickGap={24}
            />
            <YAxis
              {...EIXO_VALOR}
              type="number"
              dataKey="peso_kg"
              name="Peso"
              width={56}
              domain={[0, 'auto']}
              tickFormatter={(v: number) => formatarInteiro(v)}
            />

            {/* Ordem de declaração = ordem de pintura por baixo dos pontos (o
                Scatter tem zIndex 600, a ReferenceArea 100 e a ReferenceLine
                400). A zona de atraso vem primeiro para o corredor ficar por
                cima na fronteira comum entre os dois. */}
            {zonaDeAtraso && (
              <ReferenceArea
                x1={idade}
                y1={0}
                y2={pesoDesmame}
                ifOverflow="hidden"
                fill={COR_ALERTA}
                fillOpacity={0.07}
                stroke="none"
              />
            )}

            {corredor && (
              <ReferenceArea
                y1={pesoDesmame}
                y2={pesoReproducao}
                ifOverflow="extendDomain"
                fill={corSerie(0)}
                fillOpacity={0.1}
                stroke={corSerie(0)}
                strokeOpacity={0.3}
              />
            )}

            {/* Sem corredor, a meta que existir vira uma linha só — meia
                referência ainda diagnostica; nenhuma referência não. */}
            {!corredor && pesoDesmame != null && (
              <ReferenceLine
                y={pesoDesmame}
                ifOverflow="extendDomain"
                stroke={corSerie(0)}
                strokeDasharray="5 4"
              />
            )}
            {!corredor && pesoDesmame == null && pesoReproducao != null && (
              <ReferenceLine
                y={pesoReproducao}
                ifOverflow="extendDomain"
                stroke={corSerie(0)}
                strokeDasharray="5 4"
              />
            )}

            {idade != null && (
              <ReferenceLine x={idade} ifOverflow="extendDomain" stroke={COR_REFERENCIA} strokeDasharray="3 2" />
            )}

            <Tooltip
              // Cruz tracejada em vez da faixa cheia da barra: num gráfico de
              // dispersão o que ajuda a ler é projetar o ponto nos dois eixos.
              cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={TOOLTIP_ESTILO}
              labelStyle={TOOLTIP_ROTULO_ESTILO}
              itemStyle={TOOLTIP_ITEM_ESTILO}
              // O título do tooltip é o SEXO do animal apontado, e não o valor do
              // eixo X: "Fêmea" no topo com idade e peso embaixo é a frase que o
              // consultor lê; "128" repetido no título e na linha é ruído.
              labelFormatter={(_, itens) => {
                const primeiro = Array.isArray(itens) ? itens[0] : undefined;
                const dado = (primeiro as { payload?: PontoNuvem } | undefined)?.payload;
                return NOME_DO_GRUPO[grupoDoSexo(dado?.sexo)];
              }}
              formatter={(valor, nome) => {
                const n = comoNumero(valor);
                if (nome === 'Peso') return [n == null ? VAZIO : formatarKg(n, 1), 'Peso'];
                return [n == null ? VAZIO : `${formatarInteiro(n)} dias`, 'Idade'];
              }}
            />

            {/* Uma série por sexo em vez de <Cell> por ponto: o recharts então
                sabe o nome do conjunto, o hover não precisa recalcular o grupo, e
                cada série mantém sua própria cor sem 4.000 elementos <Cell>. */}
            {series.map((g) => (
              <Scatter
                key={g.chave}
                name={g.nome}
                data={g.pontos}
                fill={g.cor}
                // Opacidade é o que faz a densidade aparecer: onde o rebanho se
                // acumula, os discos somam e a mancha escurece. Bolinha opaca
                // esconde quantos animais estão empilhados no mesmo ponto.
                fillOpacity={0.55}
                shape="circle"
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {desenhados < total && (
        <p className="mt-2 text-xs text-muted-foreground">
          Desenhando {formatarInteiro(desenhados)} de {formatarInteiro(total)} animais — amostra de passo fixo,
          sempre a mesma a cada recarga. Os cards e a tabela abaixo continuam contando o rebanho inteiro.
        </p>
      )}
    </div>
  );
}
