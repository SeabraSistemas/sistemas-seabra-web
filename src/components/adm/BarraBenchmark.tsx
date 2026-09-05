import { BENCHMARK_INFO, MINIMO_BENCHMARK, type MetricaBenchmark } from '@/lib/adm/areas/contrato';
import type { ComparacaoMetrica } from '@/lib/adm/areas/benchmark';
import { VAZIO, formatarInteiro, formatarMoeda, formatarNumero, formatarPercentual, formatarVariacao } from '@/lib/adm/format';
import { cn } from '@/lib/utils';

/**
 * A RÉGUA DE UMA MÉTRICA — a faixa p25–p75 do segmento como banda, a mediana
 * como traço, e o valor deste criador como marcador.
 *
 * É a leitura que um criador entende em dois segundos: "a maioria das fazendas
 * como a minha vive nesta faixa, e eu estou aqui". Nenhum gráfico do painel
 * precisa de menos explicação — e é por isso que ela é o componente mais
 * perigoso do /adm: uma régua desenhada errado convence na mesma velocidade.
 *
 * QUATRO COISAS QUE ESTE COMPONENTE NÃO FAZ, e cada uma é uma regra de negócio:
 *
 * 1. NÃO DESENHA A RÉGUA COM AMOSTRA PEQUENA. Abaixo de MINIMO_BENCHMARK (7)
 *    fazendas, `comparacao.publicavel` é false e o que aparece é o valor do
 *    criador com o tamanho da amostra dito em voz alta. Uma banda desenhada com
 *    três fazendas seria o vizinho fantasiado de carteira.
 * 2. NÃO TRANSFORMA AUSÊNCIA EM ZERO. Sem valor, o número é um traço e a caixa
 *    embaixo diz o que falta lançar para a métrica existir. Um marcador no zero
 *    afirmaria que o criador produz zero litro ou tem custo zero.
 * 3. NÃO PINTA AS DUAS DIREÇÕES DA MESMA COR. `maiorEhMelhor` do contrato decide
 *    o tom: custo por litro no quartil de cima é atenção, produção por lactante
 *    no quartil de cima é destaque. Uma régua que pinta as duas de verde inverte
 *    a mensagem em metade das métricas — e ninguém percebe olhando.
 * 4. NÃO MOSTRA NÚMERO SEM JANELA E SEM AMOSTRA. As duas ficam coladas embaixo
 *    do valor, sempre, porque "24% acima da mediana" sem período e sem tamanho
 *    de amostra é uma frase que não dá para conferir.
 *
 * Server Component: só desenha o que `getBenchmark()` já decidiu. A direção, a
 * faixa e a publicabilidade chegam prontas em `ComparacaoMetrica` — este arquivo
 * não recalcula nenhuma delas, senão a tela e o dossiê poderiam discordar.
 *
 * A régua é montada com divs posicionados em porcentagem, e não em SVG: assim
 * toda cor sai de token (bg-primary, bg-card, bg-secondary) em vez de atributo
 * de apresentação, que é justamente o que o dossiê precisa reescrever à mão para
 * imprimir (ver o §3 de src/app/adm/dossie.css).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Formatação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O valor de uma métrica, na unidade que o contrato declara.
 *
 * ⚠️ A ARMADILHA AQUI É O PERCENTUAL. Taxa no /adm é FRAÇÃO (0,62 = 62%), como
 * manda `formatarPercentual()` e como o contrato define `taxa_prenhez`
 * (positivos ÷ diagnósticos). Imprimir 0,62 com `formatarNumero` daria "0,6%" —
 * uma taxa de prenhez de sessenta e dois por cento virando menos de um por cento
 * na frente do cliente. Por isso a unidade '%' é um ramo próprio, e não um
 * sufixo colado no número.
 *
 * Exportada porque a página e, mais tarde, o dossiê precisam imprimir o mesmo
 * número do mesmo jeito: dois formatadores para a mesma métrica é como a capa do
 * PDF acaba discordando da tela que o operador revisou.
 */
export function formatarValorBenchmark(metrica: MetricaBenchmark, valor: number | null): string {
  const info = BENCHMARK_INFO[metrica];
  if (valor == null) return VAZIO;
  if (info.unidade === '%') return formatarPercentual(valor, info.casas);
  // formatarMoeda já traz o "R$" e as duas casas do BRL — casar com info.casas
  // aqui seria reimplementar a moeda para chegar ao mesmo lugar.
  if (info.unidade === 'R$') return formatarMoeda(valor);
  return `${formatarNumero(valor, info.casas)} ${info.unidade}`;
}

/** "7 fazendas" / "1 fazenda" — o `n` é dito por extenso o tempo todo (regra 4). */
function fazendas(n: number): string {
  return `${formatarInteiro(n)} ${n === 1 ? 'fazenda' : 'fazendas'}`;
}

/**
 * A distância até a mediana, na unidade que não engana.
 *
 * Para métrica de '%', a diferença sai em PONTOS PERCENTUAIS: 62% contra uma
 * mediana de 55% é "+7 p.p.", e não "+13%". As duas frases são verdadeiras e uma
 * delas é entendida errado por qualquer pessoa — inclusive por quem trabalha com
 * o número todo dia. Para o resto, a variação relativa é a leitura natural
 * ("custo 24% acima da mediana").
 */
function distanciaAteMediana(c: ComparacaoMetrica): string | null {
  if (c.valor == null || c.mediana == null) return null;
  const bruta = c.valor - c.mediana;
  if (bruta === 0) return null;

  if (c.info.unidade === '%') {
    const sinal = bruta > 0 ? '+' : '−';
    return `${sinal}${formatarNumero(Math.abs(bruta) * 100, c.info.casas)} p.p.`;
  }
  return c.desvioMediana == null ? null : formatarVariacao(c.desvioMediana);
}

/**
 * A posição em palavras — e a direção já aplicada, para a frase valer sozinha se
 * alguém ler a tela em preto e branco, com daltonismo, ou por leitor de tela.
 *
 * "Melhor que 3 em cada 4" é o que um quartil significa; "acima do 3º quartil"
 * é o que ele é. A tela diz a primeira porque fala com quem vende e com quem
 * cria cabra, não com quem calcula percentil.
 */
function fraseDePosicao(c: ComparacaoMetrica): string {
  if (c.valor != null && c.valor === c.mediana) return 'exatamente na mediana do segmento';
  if (c.qualidade === 'destaque') return 'melhor que 3 em cada 4 fazendas do segmento';
  if (c.qualidade === 'atencao') return 'pior que 3 em cada 4 fazendas do segmento';
  return c.melhorQueMediana
    ? 'melhor que a mediana, dentro da faixa típica'
    : 'pior que a mediana, dentro da faixa típica';
}

/**
 * O tom da pastilha e do marcador.
 *
 * emerald para "melhor" segue o precedente já estabelecido no painel
 * (<KpiCard>, PAPEL_INFO em types.ts): o sistema tem token para destrutivo, mas
 * não tem um "positivo", e inventar um terceiro acento no tema monocromático
 * seria pior do que reusar a exceção que já existe. Faixa típica não ganha cor
 * nenhuma de propósito — é onde está metade da carteira, e colorir o normal
 * gastaria o vermelho e o verde à toa.
 */
const TOM_TEXTO = {
  destaque: 'text-emerald-400',
  atencao: 'text-destructive',
  tipico: 'text-muted-foreground',
} as const;

const TOM_MARCADOR = {
  destaque: 'bg-emerald-400',
  atencao: 'bg-destructive',
  tipico: 'bg-foreground',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Geometria da régua
// ─────────────────────────────────────────────────────────────────────────────

interface Dominio {
  lo: number;
  hi: number;
}

/**
 * O domínio do eixo: o menor e o maior entre p25, mediana, p75 e o valor do
 * criador, com 15% de folga dos dois lados.
 *
 * O valor do criador ENTRA no domínio, e isso é uma decisão: quando ele é um
 * ponto fora da curva, a faixa interquartil aparece espremida no canto oposto.
 * É feio e é verdade — cortar o eixo para a banda ficar bonita esconderia
 * exatamente o caso que mais interessa à conversa. Se tudo coincidir (segmento
 * com quartis iguais), abre-se uma folga artificial para a régua não virar uma
 * divisão por zero.
 */
function dominioDe(c: ComparacaoMetrica): Dominio | null {
  const pontos = [c.p25, c.mediana, c.p75, c.valor].filter((v): v is number => v != null);
  if (pontos.length === 0) return null;

  let lo = Math.min(...pontos);
  let hi = Math.max(...pontos);

  if (hi === lo) {
    const folga = Math.max(Math.abs(hi) * 0.1, 0.5);
    lo -= folga;
    hi += folga;
  } else {
    const folga = (hi - lo) * 0.15;
    lo -= folga;
    hi += folga;
  }
  return { lo, hi };
}

function posicao(valor: number, dominio: Dominio): number {
  const bruto = ((valor - dominio.lo) / (dominio.hi - dominio.lo)) * 100;
  return Math.min(100, Math.max(0, bruto));
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export function BarraBenchmark({ comparacao }: { comparacao: ComparacaoMetrica }) {
  const c = comparacao;
  const dominio = c.publicavel ? dominioDe(c) : null;
  const distancia = c.publicavel ? distanciaAteMediana(c) : null;

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h3 className="text-sm text-foreground">{c.info.rotulo}</h3>
          <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">{c.info.explicacao}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-medium tabular-nums text-foreground">
            {formatarValorBenchmark(c.metrica, c.valor)}
          </p>
          {/* Regra 4: janela e amostra coladas no número, sempre — inclusive
              quando não há comparação, que é quando o tamanho da amostra é a
              informação mais importante da caixa. */}
          <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
            {c.janela} · {c.n === 0 ? 'sem amostra no segmento' : `${fazendas(c.n)} no segmento`}
          </p>
        </div>
      </div>

      {c.publicavel && c.valor != null && c.qualidade && (
        <p className={cn('mt-3 text-xs', TOM_TEXTO[c.qualidade])}>
          {distancia && <span className="tabular-nums">{distancia} vs. mediana · </span>}
          {fraseDePosicao(c)}
        </p>
      )}

      {dominio && <Regua comparacao={c} dominio={dominio} />}

      {/*
        Regra 1: com amostra menor que MINIMO_BENCHMARK a comparação não é
        publicada. O texto diz o número exato de fazendas porque o operador
        precisa saber o quanto falta — e porque, dito assim, ele consegue repetir
        a frase ao cliente sem prometer uma comparação que o painel não tem.
      */}
      {!c.publicavel && (
        <p className="mt-3 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Ainda não dá para comparar.</strong>{' '}
          {c.n === 0
            ? 'Nenhuma fazenda do segmento tem esta métrica calculada, então não existe mediana para colocar ao lado.'
            : `Só ${fazendas(c.n)} do segmento têm esta métrica calculada, e o mínimo para publicar uma mediana é ${MINIMO_BENCHMARK}. Com menos que isso, a mediana da carteira seria o valor do vizinho vestido de estatística.`}
        </p>
      )}

      {/* Regra 2: ausência não é zero — e a frase do que falta lançar é a
          oportunidade comercial desta tela, não uma nota de rodapé. */}
      {c.faltando && (
        <p className="mt-3 text-xs text-muted-foreground">
          <strong className="font-medium text-foreground">Este criador não tem o número.</strong>{' '}
          {c.faltando}
        </p>
      )}
    </section>
  );
}

/**
 * A régua propriamente dita.
 *
 * `aria-hidden` porque ela é redundante: os três quartis saem escritos logo
 * abaixo, com valor e unidade, e a posição do criador já foi dita em palavras
 * acima. Uma barra decorativa anunciada por leitor de tela como "imagem" só
 * atrapalharia.
 */
function Regua({ comparacao, dominio }: { comparacao: ComparacaoMetrica; dominio: Dominio }) {
  const c = comparacao;

  // A banda é calculada como um objeto único (e não como dois números soltos)
  // porque ela só existe com os DOIS quartis: uma faixa desenhada de p25 até o
  // fim do eixo, por falta de p75, afirmaria que metade do segmento vai até o
  // infinito. Sem os dois, a régua mostra só a mediana.
  const banda =
    c.p25 != null && c.p75 != null && c.p75 > c.p25
      ? { esquerda: posicao(c.p25, dominio), direita: posicao(c.p75, dominio) }
      : null;

  return (
    <div className="mt-4">
      <div className="relative h-2 rounded-full bg-secondary" aria-hidden="true">
        {banda && (
          <span
            className="absolute inset-y-0 rounded-full bg-primary/30"
            style={{ left: `${banda.esquerda}%`, width: `${banda.direita - banda.esquerda}%` }}
          />
        )}

        {c.mediana != null && (
          <span
            className="absolute -top-1 -bottom-1 w-px bg-foreground/70"
            style={{ left: `${posicao(c.mediana, dominio)}%` }}
          />
        )}

        {/* O marcador só existe quando o criador TEM o valor. Sem ele a régua
            continua na tela mostrando a realidade do segmento — que é metade da
            conversa, e a metade que não depende do cadastro do cliente. */}
        {c.valor != null && (
          <span
            className={cn(
              'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card',
              TOM_MARCADOR[c.qualidade ?? 'tipico'],
            )}
            style={{ left: `${posicao(c.valor, dominio)}%` }}
          />
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 text-[11px] tabular-nums text-muted-foreground">
        <span>
          {c.p25 == null ? '' : `1º quartil ${formatarValorBenchmark(c.metrica, c.p25)}`}
        </span>
        <span className="text-foreground">
          mediana {formatarValorBenchmark(c.metrica, c.mediana)}
        </span>
        <span>{c.p75 == null ? '' : `3º quartil ${formatarValorBenchmark(c.metrica, c.p75)}`}</span>
      </div>

      {/* A direção fica escrita, e não só implícita na cor: sem esta linha, um
          custo por litro no quartil de baixo parece ruim para quem lê rápido. */}
      <p className="mt-1 text-[11px] text-muted-foreground">
        Nesta métrica, {c.info.maiorEhMelhor ? 'maior é melhor' : 'menor é melhor'}. A faixa
        colorida é onde vivem metade das fazendas do segmento.
      </p>
    </div>
  );
}
