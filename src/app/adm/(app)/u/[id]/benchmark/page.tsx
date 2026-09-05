import Link from 'next/link';
import { BarraBenchmark } from '@/components/adm/BarraBenchmark';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { getBenchmark, rotuloSegmento, type Benchmark } from '@/lib/adm/areas/benchmark';
import { METRICAS_BENCHMARK, MINIMO_BENCHMARK } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';
import type { PropriedadeEscopo } from '@/lib/adm/types';

/**
 * Aba 14 — Benchmark: como ESTE criador se compara com o resto da carteira,
 * dentro do segmento dele.
 *
 * É a tela mais vendável do painel — "seu custo por litro é R$ 2,10; a mediana
 * do caprino leiteiro é R$ 1,70" abre uma conversa que nenhum outro número desta
 * ficha abre. E é, pela mesma razão, a tela em que uma imprecisão custa mais
 * caro: aqui o painel não descreve o cadastro do cliente, ele AFIRMA uma posição
 * dele em relação aos vizinhos, e essa afirmação sai da empresa pela boca de
 * quem estiver na ligação.
 *
 * As quatro regras que a tela não pode violar — todas implementadas em
 * src/lib/adm/areas/benchmark.ts e em <BarraBenchmark>, e repetidas aqui porque
 * quem editar esta página precisa saber que elas existem:
 *
 * 1. Amostra menor que MINIMO_BENCHMARK (7) NÃO publica comparação: a régua some
 *    e a tela diz quantas fazendas há.
 * 2. Criador sem o dado não é criador com zero: traço, mais a frase do que falta
 *    lançar para a métrica passar a existir.
 * 3. Nenhum outro criador é identificado, nem por nome nem por dedução — a
 *    referência é só quartil e contagem.
 * 4. Janela e tamanho de amostra andam colados em todo número.
 *
 * POR QUE ESTA ABA NÃO CONSOLIDA. As irmãs (Crescimento, Estrutura, Financeiro)
 * somam N fazendas numa visão só. Aqui isso é impossível por definição: cada
 * fazenda tem o segmento dela, e mediana não se soma nem se tira média. Uma
 * "posição consolidada" de três fazendas seria um número que não pertence a
 * fazenda nenhuma. Por isso, com mais de uma propriedade no escopo, a tela
 * mostra o placar por fazenda e manda escolher uma para ver a régua.
 */

/**
 * Teto de fazendas no placar. Cada uma custa duas leituras (o valor dela e a
 * régua do segmento), e o mesmo teto das abas irmãs mantém o comportamento
 * previsível para o técnico com carteira grande.
 */
const TETO_CONSOLIDADO = 15;

export default async function BenchmarkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const usuarioId = Number(id);
  const sp = await searchParams;
  const selecao = lerSelecaoParam(sp.prop);

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;

  if (alvos.length === 0) {
    return (
      <Aviso>
        Sem propriedade no escopo — benchmark é comparação entre FAZENDAS, e esta conta não alcança
        nenhuma. Um colaborador sem fazenda vinculada ou um admin de associação sem filiados cai
        aqui.
      </Aviso>
    );
  }

  if (alvos.length === 1) {
    return <UmaFazenda propriedade={alvos[0]} />;
  }

  if (alvos.length > TETO_CONSOLIDADO) {
    return (
      <Aviso>
        Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
        teto de {TETO_CONSOLIDADO} para montar o placar numa tela só. Escolha uma fazenda no seletor
        acima para ver a comparação dela.
      </Aviso>
    );
  }

  return <Placar propriedades={alvos} usuarioId={usuarioId} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Uma fazenda — a tela de verdade
// ─────────────────────────────────────────────────────────────────────────────

async function UmaFazenda({ propriedade }: { propriedade: PropriedadeEscopo }) {
  /*
   * Os segmentos declarados do cadastro vão junto DE PROPÓSITO. Uma fazenda pode
   * ter segmento e ainda não ter nenhuma das seis métricas calculadas — e aí ela
   * não aparece em `adm.benchmark_propriedade`. Sem esta dica, a tela concluiria
   * "fazenda sem segmento declarado", que é uma afirmação falsa sobre o cadastro
   * do cliente. Com ela, a régua do segmento aparece sem marcador e a tela diz o
   * que falta lançar — a versão útil da mesma situação.
   */
  const res = await getBenchmark(propriedade.id, propriedade.segmentos);
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const b = res.dados;

  if (b.semSegmento) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso>
          <strong className="font-medium text-foreground">
            {propriedade.nome} não tem segmento declarado.
          </strong>{' '}
          Sem segmento não existe grupo de comparação: pôr caprino leiteiro ao lado de ovino de corte
          não é benchmark, é ruído — e o número resultante daria uma conversa comercial errada com os
          dois criadores. Declarar o segmento da propriedade no app liga esta tela inteira, sem
          precisar de mais nenhum lançamento.
        </Aviso>
        <ComoLemos />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho benchmark={b} propriedade={propriedade} />

      {/* Duas colunas a partir de md: a régua precisa de largura para a posição
          significar alguma coisa, e seis delas empilhadas viram uma tela de
          rolagem infinita. A ordem é a do contrato — decisão de produto, não do
          que a view devolveu primeiro. */}
      <div className="grid gap-3 md:grid-cols-2">
        {b.metricas.map((c) => (
          <BarraBenchmark key={c.metrica} comparacao={c} />
        ))}
      </div>

      <ComoLemos />
      <AvisosDeContrato benchmark={b} />
    </div>
  );
}

function Cabecalho({
  benchmark,
  propriedade,
}: {
  benchmark: Benchmark;
  propriedade: PropriedadeEscopo;
}) {
  const b = benchmark;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          rotulo="Segmento da comparação"
          valor={rotuloSegmento(b.segmento)}
          detalhe={
            b.maiorAmostra === 0
              ? 'nenhuma fazenda do segmento calculou estas métricas'
              : // "Pelo menos" não é modéstia: a maior amostra conta quem calculou
                // ALGUMA das seis métricas. Quem não calculou nenhuma não aparece em
                // amostra nenhuma, então este número é piso do segmento, não tamanho.
                `pelo menos ${formatarInteiro(b.maiorAmostra)} fazendas no segmento`
          }
        />
        <KpiCard
          rotulo="Métricas comparáveis"
          valor={`${formatarInteiro(b.comparaveis)} de ${formatarInteiro(METRICAS_BENCHMARK.length)}`}
          detalhe={`com amostra de ${MINIMO_BENCHMARK}+ fazendas e com o dado lançado aqui`}
        />
        <KpiCard
          rotulo="Melhor que a mediana"
          valor={
            b.comparaveis === 0
              ? VAZIO
              : `${formatarInteiro(b.acimaDaMediana)} de ${formatarInteiro(b.comparaveis)}`
          }
          // "Melhor", e não "acima": em custo por litro e mortalidade, estar
          // acima da mediana é o pior lado. A direção de cada métrica vem de
          // BENCHMARK_INFO e já está aplicada nesta contagem.
          detalhe={
            b.comparaveis === 0
              ? 'nenhuma métrica comparável ainda'
              : 'direção de cada métrica já aplicada'
          }
        />
      </div>

      {b.outrosSegmentos.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {propriedade.nome} também está declarada em{' '}
          {b.outrosSegmentos.map(rotuloSegmento).join(', ')}. A comparação usa{' '}
          {rotuloSegmento(b.segmento)} porque é o segmento com a maior amostra — o critério é a
          solidez da comparação, e nunca o segmento em que o cliente aparece melhor.
        </p>
      )}
    </div>
  );
}

/**
 * O método, escrito na própria tela. Não é rodapé de conformidade: quem usa esta
 * aba vai repetir os números numa ligação, e precisa saber de cor o que eles
 * sustentam — inclusive para responder o "comparado com quem?" que todo criador
 * faz na primeira vez que ouve uma mediana.
 */
function ComoLemos() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">Como esta comparação é feita</h2>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="font-medium text-foreground">Sempre dentro do segmento.</strong> Caprino
          leiteiro se compara com caprino leiteiro. Misturar segmentos produziria um número que não
          descreve rebanho nenhum.
        </li>
        <li>
          <strong className="font-medium text-foreground">
            Mínimo de {MINIMO_BENCHMARK} fazendas por métrica.
          </strong>{' '}
          Abaixo disso a régua não aparece: com três fazendas, a mediana da carteira é o valor do
          vizinho vestido de estatística.
        </li>
        <li>
          <strong className="font-medium text-foreground">Ninguém é identificado.</strong> A
          referência traz só o 1º quartil, a mediana, o 3º quartil e quantas fazendas entraram —
          nenhum nome, nenhuma fazenda, nem por dedução.
        </li>
        <li>
          <strong className="font-medium text-foreground">Traço não é zero.</strong> Métrica sem
          dado aparece como traço e diz o que falta lançar. Custo por litro zero seria um milagre;
          produção por lactante zero seria um rebanho seco.
        </li>
        <li>
          <strong className="font-medium text-foreground">Cada número traz a janela.</strong> O
          período e o tamanho da amostra ficam colados no valor, porque uma comparação sem os dois
          não dá para conferir.
        </li>
      </ul>
    </section>
  );
}

/**
 * Diagnóstico de OPERADOR — nunca de cliente. As duas coisas aqui significam que
 * o SQL andou sem o contrato (`src/lib/adm/areas/contrato.ts`), que é exatamente
 * o defeito que derrubou a Fase 1: métrica com nome que o painel não conhece, ou
 * taxa chegando em 0-100 quando o /adm inteiro trata taxa como fração. Sem este
 * bloco, o primeiro sintoma seria um número absurdo na tela, e a suspeita cairia
 * sobre o cadastro do criador.
 */
function AvisosDeContrato({ benchmark }: { benchmark: Benchmark }) {
  const b = benchmark;
  if (b.metricasDesconhecidas.length === 0 && b.escalaSuspeita.length === 0) return null;

  return (
    <section className="rounded-2xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
      <h2 className="text-base text-foreground">A view divergiu do contrato</h2>
      {b.metricasDesconhecidas.length > 0 && (
        <p className="mt-2">
          As views devolveram métricas que o contrato não declara e que foram descartadas:{' '}
          <code className="rounded border border-border bg-secondary px-1 py-0.5 text-xs text-foreground">
            {b.metricasDesconhecidas.join(', ')}
          </code>
          . A lista de METRICAS_BENCHMARK é fechada de propósito — sem rótulo, unidade e direção,
          o painel não sabe nem se maior é melhor.
        </p>
      )}
      {b.escalaSuspeita.length > 0 && (
        <p className="mt-2">
          Métricas de percentual chegaram acima de 1,5:{' '}
          <code className="rounded border border-border bg-secondary px-1 py-0.5 text-xs text-foreground">
            {b.escalaSuspeita.join(', ')}
          </code>
          . Taxa no /adm é fração (0,62 = 62%); a view provavelmente está devolvendo 0-100, e os
          percentuais desta tela saem 100 vezes maiores.
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Várias fazendas — o placar da carteira
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O caso do técnico e do admin de associação. Uma linha por fazenda, com o
 * segmento e quantas métricas estão melhor que a mediana — que é uma contagem
 * honesta (não mistura medianas de segmentos diferentes) e serve de fila de
 * atendimento: quem está pior aparece com menos vitórias.
 *
 * A régua fica a um clique: cada nome leva para a mesma aba com `?prop=`.
 */
async function Placar({
  propriedades,
  usuarioId,
}: {
  propriedades: PropriedadeEscopo[];
  usuarioId: number;
}) {
  const resultados = await Promise.all(
    propriedades.map((p) => getBenchmark(p.id, p.segmentos)),
  );

  const linhas = propriedades.map((propriedade, indice) => ({
    propriedade,
    resultado: resultados[indice],
  }));

  const falhas = linhas.filter((l) => !l.resultado.ok);

  // Uma falha isolada vira linha vazia no placar; TODAS falharem é falta de
  // configuração ou view ausente, e aí a tela precisa dizer o que rodar em vez
  // de mostrar uma lista de traços que parece cliente sem dado.
  if (falhas.length === linhas.length) {
    return <EstadoVazio resultado={falhas[0].resultado} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Este usuário alcança {formatarInteiro(propriedades.length)} propriedades, e benchmark não
        consolida: cada fazenda tem o segmento dela, e mediana não se soma nem se tira média. Abaixo,
        o placar de cada uma — clique no nome para ver as réguas daquela fazenda.
      </p>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {linhas.map(({ propriedade, resultado }) => (
          <li
            key={propriedade.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
          >
            <div className="min-w-0">
              <Link
                href={`/adm/u/${usuarioId}/benchmark?prop=${propriedade.id}`}
                className="text-sm text-foreground underline underline-offset-4"
              >
                {propriedade.nome}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {resultado.ok
                  ? rotuloSegmento(resultado.dados.segmento)
                  : 'não carregou — abra a fazenda para ver o motivo'}
              </p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
              {!resultado.ok ? VAZIO : resumoDaFazenda(resultado.dados)}
            </p>
          </li>
        ))}
      </ul>

      {falhas.length > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas.length)} de {formatarInteiro(linhas.length)} propriedades não
          carregaram — o placar acima é só das que responderam.
        </p>
      )}

      <ComoLemos />
    </div>
  );
}

/**
 * A frase do placar. Zero métrica comparável não é "0 de 6": é uma de TRÊS
 * situações diferentes, e cada uma leva a uma conversa diferente com o cliente —
 * cadastrar o segmento, lançar no app, ou esperar a carteira crescer. Colapsar
 * as três num zero faria o placar culpar o criador pelo tamanho da amostra.
 *
 * A distinção é feita pelo que a fazenda TEM lançado, e não pelo tamanho da
 * amostra do segmento: uma fazenda pode ter valor em métricas cuja régua ainda
 * não é publicável, e aí dizer que ela não lançou nada seria falso.
 */
function resumoDaFazenda(b: Benchmark): string {
  if (b.semSegmento) return 'sem segmento declarado';
  if (b.comparaveis === 0) {
    return b.metricas.some((c) => c.valor != null)
      ? 'segmento ainda pequeno para comparar'
      : 'sem métrica lançada para comparar';
  }
  return `${formatarInteiro(b.acimaDaMediana)} de ${formatarInteiro(b.comparaveis)} melhor que a mediana`;
}

// ─────────────────────────────────────────────────────────────────────────────

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
