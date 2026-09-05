/**
 * A MOBÍLIA DO DOCUMENTO — as peças de que o dossiê é feito.
 *
 * Server Components, todos: nada aqui tem estado, evento ou hook. O único
 * pedaço interativo do dossiê inteiro é o botão de imprimir, e ele mora em
 * CapaDossie.tsx justamente para não contaminar este arquivo com 'use client'.
 *
 * ┌─ POR QUE ISTO NÃO É <KpiCard> / <TabelaGenerica> ──────────────────────┐
 * │ O dossiê é um DOCUMENTO, não um dashboard. A diferença não é estética: │
 * │ é o que o leitor faz com a página.                                     │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * No painel o Felipe VARRE: densidade de 28 px por linha, tudo em cards com
 * borda para o olho saber onde uma coisa acaba e a outra começa, cor de
 * atenção onde há risco. No dossiê o criador LÊ, uma vez, do começo ao fim,
 * possivelmente no papel — e ali borda em volta de tudo vira grade de
 * formulário, densidade vira letra miúda de contrato, e semáforo vira acusação.
 *
 * As três regras que saem daí e valem para todas as peças abaixo:
 *
 *  1. SEPARAR POR FIO E POR AR, não por caixa. Uma régua de 1 px sob o título
 *     de seção e espaço generoso em volta fazem o mesmo trabalho de uma borda
 *     arredondada, sem transformar a página num painel de controle.
 *  2. O NÚMERO É O PROTAGONISTA. Ele vem na serifa, grande; o rótulo vem
 *     pequeno em cima. É o inverso do card do painel, onde o rótulo lidera
 *     porque você está procurando qual card ler.
 *  3. NADA DE COR SEMÂNTICA. Verde/vermelho pertencem à triagem de carteira.
 *     Num documento que o cliente recebe, vermelho num indicador dele é uma
 *     avaliação que a Sistema Seabra não está fazendo nesta peça — o ocre é o
 *     único acento, e ele destaca, não julga.
 *
 * Tokens semânticos em toda parte (bg-card, text-muted-foreground, border-border):
 * dentro de .dossie eles resolvem para a paleta CLARA declarada em dossie.css.
 * É o que permite reaproveitar os gráficos do painel sem tocar neles.
 */

import type { ReactNode } from 'react';
import { VAZIO, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Seção
// ─────────────────────────────────────────────────────────────────────────────

export function SecaoDossie({
  numero,
  titulo,
  resumo,
  janela,
  children,
}: {
  /** Ordinal impresso ("02"). Numerar é o que faz um maço de páginas virar documento. */
  numero: number;
  titulo: string;
  /** Uma frase que diz o que a seção mostra. Escrita para o criador, não para o operador. */
  resumo?: string;
  /**
   * A JANELA DE APURAÇÃO, dita em toda seção. Cada view do schema `adm` tem a
   * sua (12 meses na reprodução, 90 dias na produção, história inteira na AML),
   * e um número sem janela é um número que o cliente vai comparar com o mês
   * errado. É a informação que mais evita telefonema.
   */
  janela?: string;
  children: ReactNode;
}) {
  return (
    <section className="dossie-secao pt-10 first:pt-0">
      <header className="border-b border-[var(--line-strong)] pb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl text-primary">
            {String(numero).padStart(2, '0')}
          </span>
          <h2 className="text-3xl leading-tight">{titulo}</h2>
        </div>
        {(resumo || janela) && (
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            {resumo && <p className="max-w-[118mm] text-[13px] text-muted-foreground">{resumo}</p>}
            {janela && (
              <p className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {janela}
              </p>
            )}
          </div>
        )}
      </header>

      <div className="flex flex-col gap-8 pt-7">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloco
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma unidade indivisível dentro da seção — um gráfico, uma tabela, uma lista.
 * A classe `.dossie-bloco` é o que impede a dobra da página de passar pelo meio
 * dele (dossie.css §2). Sem borda: o que separa é o título e o ar em volta.
 */
export function BlocoDossie({
  titulo,
  nota,
  children,
  className,
}: {
  titulo?: string;
  /** A ressalva metodológica. Ver a nota longa em <BarrasOrdenadas>. */
  nota?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('dossie-bloco', className)}>
      {titulo && <h3 className="text-lg leading-snug">{titulo}</h3>}
      {nota && <p className="mt-0.5 max-w-[120mm] text-xs text-muted-foreground">{nota}</p>}
      <div className={cn(titulo || nota ? 'mt-3' : undefined)}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Números
// ─────────────────────────────────────────────────────────────────────────────

export interface NumeroDossie {
  rotulo: string;
  /** JÁ FORMATADO por src/lib/adm/format.ts — a mesma regra do <KpiCard>. */
  valor: string;
  /** A ressalva de uma linha: unidade, denominador, ou por que está vazio. */
  nota?: string;
}

/**
 * A régua de indicadores da seção. Quatro por linha na tela e no papel: com
 * 178 mm de mancha, cinco colunas deixariam "Média por lactante/dia" quebrando
 * em três linhas de rótulo.
 *
 * Divisão por fio vertical, não por card — ver a regra 1 do cabeçalho.
 */
export function FichaNumeros({ itens }: { itens: NumeroDossie[] }) {
  if (itens.length === 0) return null;

  return (
    <dl className="dossie-bloco grid grid-cols-4 gap-x-6 gap-y-7">
      {itens.map((item) => (
        <div
          key={item.rotulo}
          className="dossie-numero border-l border-border pl-3"
        >
          <dt className="text-[11px] uppercase leading-tight tracking-[0.08em] text-muted-foreground">
            {item.rotulo}
          </dt>
          <dd className="mt-1 font-display text-[26px] leading-none text-foreground">
            {item.valor}
          </dd>
          {item.nota && (
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{item.nota}</p>
          )}
        </div>
      ))}
    </dl>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barras em ordem declarada
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemBarra {
  rotulo: string;
  /** null = não dá para calcular. Vira "—" SEM barra — nunca uma barra de tamanho zero. */
  valor: number | null;
  /** Sufixo do valor ("kg", "animais"). */
  sufixo?: string;
  /** Anotação à direita do rótulo: contagem da amostra, meta da faixa. */
  nota?: string;
  /** Marca a linha com o acento — a faixa onde cai a meta cadastrada, por exemplo. */
  destaque?: boolean;
}

/**
 * Distribuição em barras NA ORDEM EM QUE CHEGA — e é essa a razão de existir.
 *
 * <DistribuicaoBarras> (o componente do painel) ordena do maior para o menor,
 * e faz certo: ele é um ranking. Mas três das listas deste documento têm ordem
 * NATURAL e perdem o sentido reordenadas por volume:
 *
 *   · o FUNIL de reprodução — coberturas → diagnósticos → positivos → partos.
 *     Ordenado por contagem ele deixa de ser funil, e num criador que não faz
 *     diagnóstico de gestação a ordem trocaria em silêncio, sugerindo mais
 *     partos que coberturas;
 *   · a distribuição ETÁRIA — a forma da curva de reposição É a informação;
 *   · os 16 pontos da AML — o SQL projeta na ordem 1..16 exatamente para o
 *     perfil ser comparável entre dois criadores (adm_07_areas.sql:713).
 *
 * Escala: por default relativa ao maior item da lista (a leitura é a proporção
 * entre eles). `maximo` fixa a régua quando a escala é absoluta e conhecida —
 * a AML é 1..9, e mostrar um 4 como barra cheia porque foi o melhor ponto do
 * rebanho seria elogiar uma nota mediana.
 *
 * Puro CSS, sem SVG: é o que atravessa a impressão sem depender de medição em
 * pixels feita pelo navegador antes do Ctrl+P.
 */
export function BarrasOrdenadas({
  itens,
  maximo,
  vazio = 'Sem dados no período.',
  larguraRotulo = '52mm',
  casas = 0,
}: {
  itens: ItemBarra[];
  /** Régua absoluta. Sem ela, a escala é relativa ao maior valor da lista. */
  maximo?: number;
  vazio?: string;
  larguraRotulo?: string;
  /** Casas decimais do valor impresso. Peso médio pede 1; contagem pede 0. */
  casas?: number;
}) {
  const comValor = itens.filter((i) => i.valor != null);
  if (comValor.length === 0) {
    return <p className="text-sm text-muted-foreground">{vazio}</p>;
  }

  const teto =
    maximo ?? comValor.reduce((acc, i) => Math.max(acc, i.valor ?? 0), 0);

  return (
    <ul className="flex flex-col gap-2">
      {itens.map((item) => {
        const largura =
          item.valor == null || teto <= 0
            ? 0
            : Math.max(0, Math.min(100, (item.valor / teto) * 100));

        return (
          <li
            key={item.rotulo}
            className="grid items-center gap-3 text-[13px]"
            style={{ gridTemplateColumns: `${larguraRotulo} 1fr 26mm` }}
          >
            <span className="min-w-0">
              <span className={cn('block truncate', item.destaque ? 'text-foreground' : 'text-muted-foreground')}>
                {item.rotulo}
              </span>
              {item.nota && (
                <span className="block truncate text-[11px] text-muted-foreground">{item.nota}</span>
              )}
            </span>

            <span className="block h-2.5 rounded-full bg-secondary" aria-hidden>
              <span
                className={cn(
                  'block h-full rounded-full',
                  item.destaque ? 'bg-[var(--ocre-hover)]' : 'bg-primary',
                )}
                style={{ width: `${largura}%` }}
              />
            </span>

            <span className="text-right text-foreground">
              {item.valor == null
                ? VAZIO
                : casas === 0
                  ? formatarInteiro(item.valor)
                  : formatarNumero(item.valor, casas)}
              {item.valor != null && item.sufixo ? (
                <span className="ms-1 text-[11px] text-muted-foreground">{item.sufixo}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabela
// ─────────────────────────────────────────────────────────────────────────────

export interface ColunaDossie {
  chave: string;
  rotulo: string;
  /** Números vão à direita: é o que permite comparar dígito com dígito na coluna. */
  numerica?: boolean;
}

/**
 * Tabela curta e sem moldura — listas de trabalho de dez linhas, não a grade de
 * auditoria. <TabelaGenerica> não serve aqui e não deve servir: ela carrega
 * ordenação, facetas, paginação, seletor de colunas e exportação, tudo inútil
 * no papel e tudo dependente de estado de URL.
 *
 * A regra do documento: se a lista não cabe em ~12 linhas, ela não pertence ao
 * dossiê — pertence à aba correspondente do painel, que é onde se navega.
 */
export function TabelaDossie({
  colunas,
  linhas,
  vazio = 'Sem registros no período.',
}: {
  colunas: ColunaDossie[];
  linhas: Record<string, ReactNode>[];
  vazio?: string;
}) {
  if (linhas.length === 0) {
    return <p className="text-sm text-muted-foreground">{vazio}</p>;
  }

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          {colunas.map((coluna) => (
            <th
              key={coluna.chave}
              scope="col"
              className={cn(
                'border-b border-[var(--line-strong)] pb-1.5 text-[11px] font-normal uppercase tracking-[0.08em] text-muted-foreground',
                coluna.numerica ? 'text-right' : 'text-left',
              )}
            >
              {coluna.rotulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, indice) => (
          <tr key={indice}>
            {colunas.map((coluna) => (
              <td
                key={coluna.chave}
                className={cn(
                  'border-b border-border py-1.5 text-foreground',
                  coluna.numerica ? 'text-right' : 'text-left',
                )}
              >
                {linha[coluna.chave] ?? VAZIO}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ausência
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O vazio do documento — e ele é DIFERENTE do <EstadoVazio> do painel.
 *
 * No painel, "não há dado" pode significar três coisas (vazio, falta de
 * configuração, consulta quebrada) e a tela precisa distinguir as três, porque
 * a ação do Felipe muda. No documento que vai ao cliente existe uma só leitura
 * possível: **este módulo ainda não tem lançamento**. E ela não é uma falha —
 * é a frase mais comercial da peça inteira, porque nomeia exatamente o que a
 * Sistema Seabra tem a entregar em seguida.
 *
 * Por isso o texto é escrito no positivo e nunca menciona view, SQL ou erro. A
 * distinção técnica (vazio × quebrado) fica na barra de ações, que não imprime.
 */
export function AusenciaDossie({ children }: { children: ReactNode }) {
  return (
    <p className="dossie-bloco border-l-2 border-primary/50 py-1 pl-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
