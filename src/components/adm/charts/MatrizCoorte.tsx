import type { FaixaCoorte, MatrizRetencao, RetencaoAgregada } from '@/lib/adm/areas/coorte';
import { formatarInteiro, formatarMes, formatarPercentual } from '@/lib/adm/format';
import { cn } from '@/lib/utils';
import { CLASSES_VAZIO } from '@/components/adm/charts/theme';

/**
 * A matriz de coorte de retenção — uma TABELA HTML, e não um gráfico.
 *
 * POR QUE NÃO É UM HEATMAP DE SVG, que é o desenho óbvio:
 *
 *   copiar     esta tabela vai inteira para o Excel com Ctrl+C. Um <svg> não
 *              copia nada — nem os números que ele desenha.
 *   imprimir   é texto de DOM: sai no PDF do dossiê (decisão D4) sem depender de
 *              o operador ter marcado "Gráficos de fundo" na janela do Chrome,
 *              que é justamente a pegadinha já documentada da Fase 2.
 *   ler        o valor está escrito na célula. Num heatmap, "quanto é esse tom
 *              de ocre?" é uma pergunta que a legenda responde mal e o tooltip
 *              responde uma célula por vez.
 *   navegar    <th scope> dá ao leitor de tela a coordenada de cada número; num
 *              SVG a matriz inteira é uma imagem sem conteúdo.
 *
 * E é SERVER COMPONENT: sem estado, sem evento, sem hook. O "passar o mouse" é o
 * atributo `title` nativo, que funciona com JavaScript desligado, aparece na
 * impressão do Firefox e não custa um kilobyte de bundle. A regra do projeto —
 * 'use client' só com hook/evento/estado — não é burocracia aqui: é o que mantém
 * a tela mais pesada do painel com zero JS.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DESENHO CARREGA AS TRÊS REGRAS DE HONESTIDADE
 *
 * 1. CÉLULA VAZIA ≠ CÉLULA ZERADA. O mês que ainda não aconteceu não desenha
 *    nada: nenhum fundo, nenhum texto, nem um traço. O mês que aconteceu e não
 *    reteve ninguém desenha um bloco com "0%" escrito. São duas coisas visuais
 *    diferentes porque são duas coisas diferentes — e trocar uma pela outra
 *    desenha uma queda de retenção que é só o calendário.
 * 2. Coorte pequena não chega aqui: `montarMatriz` já a descartou, e a tela
 *    conta quantas foram (o corte é da área, não do componente — este só desenha
 *    o que recebe).
 * 3. O TAMANHO DA COORTE VIAJA COLADO NO MÊS, na mesma coluna congelada. "Março:
 *    92%" sem o denominador não é um dado, é uma impressão.
 *
 * A cor sai do ocre da marca por OPACIDADE (a paleta do /adm é monocromática —
 * ver charts/theme.ts). Um heatmap com matiz próprio seria a única mancha de cor
 * estranha do painel, e uma escala verde-vermelho ainda por cima é ilegível para
 * daltônicos e some no dossiê impresso em preto e branco. Aqui a leitura
 * sobrevive às duas coisas: mais escuro = mais retido, e só.
 */

/**
 * A rampa: nove degraus sobre o mesmo ocre.
 *
 * O TEXTO TROCA DE COR NO MEIO DO CAMINHO, e o ponto de troca não é estético.
 * Sobre o card (--surface-1, #121212), o ocre a 65% dá ~5,0:1 com o texto claro
 * (--ink-0) e a 85% já cai para ~3,7:1 — abaixo do mínimo de 4,5:1 de AA para
 * texto normal. Nesses dois degraus mais fortes o texto vira --primary-foreground
 * (que é preto), e aí o contraste sobe de novo: ~5,2:1 a 85% e ~6,7:1 no ocre
 * cheio. Ou seja, TODA célula desta matriz passa em AA — inclusive as duas que
 * um degradê ingênuo deixaria ilegíveis exatamente onde a retenção é melhor.
 *
 * O degrau de retenção zero não é ocre nenhum: é --secondary. Ele precisa ser
 * visivelmente uma célula (senão vira o vazio da regra 1) e visivelmente não
 * fazer parte da escala de retenção (porque não retém nada).
 */
function classeCelula(retencao: number): string {
  if (retencao <= 0) return 'bg-secondary text-muted-foreground';
  if (retencao <= 0.125) return 'bg-primary/10 text-foreground';
  if (retencao <= 0.25) return 'bg-primary/20 text-foreground';
  if (retencao <= 0.375) return 'bg-primary/30 text-foreground';
  if (retencao <= 0.5) return 'bg-primary/40 text-foreground';
  if (retencao <= 0.625) return 'bg-primary/50 text-foreground';
  if (retencao <= 0.75) return 'bg-primary/65 text-foreground';
  if (retencao <= 0.875) return 'bg-primary/85 text-primary-foreground';
  return 'bg-primary text-primary-foreground';
}

/** Amostras da legenda. Os valores são o meio de cada faixa que representam. */
const LEGENDA = [0, 0.25, 0.5, 0.75, 1];

function contas(n: number): string {
  return `${formatarInteiro(n)} ${n === 1 ? 'conta' : 'contas'}`;
}

/** 'jul/2026 · mês 6 · 9 de 12 contas ativas · 75%' — a frase inteira, no hover. */
function tituloCelula(coorte: string, mes: number, ativos: number, tamanho: number, retencao: number): string {
  return `${formatarMes(coorte)} · mês ${mes} de vida · ${formatarInteiro(ativos)} de ${contas(tamanho)} ativas · ${formatarPercentual(retencao)}`;
}

export function MatrizCoorte({ matriz, className }: { matriz: MatrizRetencao; className?: string }) {
  const { faixas, mesesMaximo, media } = matriz;

  // Sem faixa nenhuma o componente não desenha uma tabela de cabeçalhos vazios:
  // uma moldura com grade e nada dentro parece falha de carregamento, e quem
  // olha recarrega a página atrás de um dado que não existe (mesma regra dos
  // outros gráficos do painel — CLASSES_VAZIO em charts/theme.ts).
  if (faixas.length === 0 || mesesMaximo < 0) {
    return (
      <div className={cn(CLASSES_VAZIO, 'py-10', className)}>
        Nenhuma coorte com meses fechados suficientes para montar a matriz.
      </div>
    );
  }

  const meses = Array.from({ length: mesesMaximo + 1 }, (_, i) => i);

  return (
    <div className={className}>
      {/* A rolagem é DESTE contêiner, não da página: 25 colunas não cabem em
          telefone nenhum, e uma página que rola de lado inteira perde a coluna
          congelada de vista junto com o resto. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="border-separate border-spacing-0 text-sm">
          <caption className="sr-only">
            Retenção por coorte de entrada. Cada linha é o mês em que um grupo de contas entrou, cada
            coluna é o mês de vida, e a célula é a fração dessas contas ainda ativas. Célula em branco
            é mês que ainda não aconteceu.
          </caption>

          <thead>
            <tr>
              <th
                scope="col"
                rowSpan={2}
                className="sticky left-0 z-10 border-r border-border bg-card px-1 pb-2 text-left align-bottom text-xs font-normal text-muted-foreground"
              >
                Coorte de entrada
              </th>
              <th
                scope="colgroup"
                colSpan={meses.length}
                className="pb-1 text-center text-xs font-normal text-muted-foreground"
              >
                mês de vida
              </th>
            </tr>
            <tr>
              {meses.map((mes) => (
                <th
                  key={mes}
                  scope="col"
                  className="min-w-14 px-1 pb-1 text-center text-xs font-normal tabular-nums text-muted-foreground"
                >
                  {mes}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {faixas.map((faixa) => (
              <LinhaFaixa key={faixa.coorte} faixa={faixa} meses={meses} />
            ))}
          </tbody>

          {/*
            A média ponderada por contas — a curva que os cards resumem.
            Ela mora no <tfoot> e não como mais uma linha do corpo porque NÃO é
            uma coorte: cada coluna dela tem um denominador diferente (só entra
            quem já viveu aquele mês), e é por isso que a base vai escrita
            embaixo do percentual em vez de ficar subentendida.
          */}
          <tfoot>
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 whitespace-nowrap border-r border-t-2 border-border bg-card px-1 py-2 text-left align-middle text-xs font-normal"
              >
                <span className="block text-foreground">Todas as coortes</span>
                <span className="block tabular-nums text-muted-foreground">{contas(matriz.contas)}</span>
              </th>
              {meses.map((mes) => (
                <CelulaMedia key={mes} mes={mes} agregada={media[mes] ?? null} />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <Legenda />
    </div>
  );
}

function LinhaFaixa({ faixa, meses }: { faixa: FaixaCoorte; meses: number[] }) {
  return (
    <tr>
      {/*
        Regra 3: o mês e o tamanho da coorte na MESMA célula congelada. Se o
        denominador ficasse numa segunda coluna, bastaria rolar dois centímetros
        para a direita para o percentual perder o chão — e é rolando que se lê
        uma matriz destas.
      */}
      <th
        scope="row"
        className="sticky left-0 z-10 whitespace-nowrap border-r border-border bg-card px-1 py-1 text-left align-middle font-normal"
      >
        <span className="block text-foreground">{formatarMes(faixa.coorte)}</span>
        <span className="block text-xs tabular-nums text-muted-foreground">{contas(faixa.tamanho)}</span>
      </th>

      {meses.map((mes) => {
        const celula = faixa.celulas[mes] ?? null;

        // AQUI ESTÁ A REGRA 1. `null` não vira '0%', não vira '—', não vira um
        // bloco cinza: vira uma célula que não desenha nada. O buraco na matriz é
        // o formato do calendário, e ele precisa ser visível como buraco.
        if (!celula) return <td key={mes} className="p-px" />;

        return (
          <td key={mes} className="p-px align-middle">
            <div
              title={tituloCelula(faixa.coorte, mes, celula.ativos, faixa.tamanho, celula.retencao)}
              className={cn(
                'min-w-14 rounded-sm px-2 py-1.5 text-center tabular-nums',
                classeCelula(celula.retencao),
              )}
            >
              {formatarPercentual(celula.retencao)}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function CelulaMedia({ mes, agregada }: { mes: number; agregada: RetencaoAgregada | null }) {
  if (!agregada) return <td className="border-t-2 border-border p-px" />;

  return (
    <td className="border-t-2 border-border p-px align-middle">
      <div
        title={`Mês ${mes} de vida · ${formatarInteiro(agregada.ativos)} de ${contas(agregada.base)} ativas · ${formatarPercentual(agregada.retencao)} · ${agregada.coortes === 1 ? '1 coorte chegou' : `${formatarInteiro(agregada.coortes)} coortes chegaram`} a este mês`}
        className={cn('min-w-14 rounded-sm px-2 py-1 text-center tabular-nums', classeCelula(agregada.retencao))}
      >
        <span className="block">{formatarPercentual(agregada.retencao)}</span>
        {/* O denominador de CADA coluna, à vista: sem ele, a queda da curva média
            no fim da matriz se confunde com churn quando é só a coluna tendo
            menos coortes dentro. */}
        <span className="block text-[10px] opacity-70">{formatarInteiro(agregada.base)}</span>
      </div>
    </td>
  );
}

function Legenda() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        {LEGENDA.map((fracao) => (
          <span
            key={fracao}
            className={cn(
              'inline-block rounded-sm px-1.5 py-0.5 tabular-nums',
              classeCelula(fracao),
            )}
          >
            {formatarPercentual(fracao)}
          </span>
        ))}
      </span>
      <span className="flex items-center gap-1.5">
        {/* A amostra do vazio é uma moldura tracejada e não um bloco cinza: cinza
            é o degrau do 0%, e a legenda seria o primeiro lugar a confundir os
            dois. */}
        <span className="inline-block h-5 w-8 rounded-sm border border-dashed border-border" />
        mês que ainda não aconteceu — não é 0%
      </span>
    </div>
  );
}
