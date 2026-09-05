'use client';

/**
 * A CAPA e a BARRA DE AÇÕES — as duas peças de "matéria de abertura" do dossiê.
 *
 * ┌─ POR QUE ESTE É O ÚNICO ARQUIVO 'use client' DO DOSSIÊ ────────────────┐
 * │ O dossiê inteiro é conteúdo estático renderizado no servidor. A única  │
 * │ interação que existe na peça é um botão que chama window.print() — e   │
 * │ 'use client' é por ARQUIVO, não por componente.                        │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Colocar esse botão dentro de Dossie.tsx obrigaria o documento inteiro (seis
 * seções, todas as derivações) a atravessar a fronteira do cliente; colocá-lo
 * em SecaoDossie.tsx faria o mesmo com a mobília. Fica aqui porque a barra é a
 * matéria de abertura da página, junto da capa, e porque este arquivo é o menor
 * dos três — o custo do 'use client' fica confinado onde ele é inevitável.
 *
 * REGRA DE FORMATAÇÃO, herdada de <KpiCard>: nada aqui formata número ou data.
 * Tudo chega pronto de src/lib/adm/format.ts, montado no servidor por
 * Dossie.tsx. Além de manter uma verdade só sobre unidade e fuso, isso remove
 * por construção a classe de erro de hidratação em que a data renderizada no
 * servidor (fuso de São Paulo) não bate com a do browser (fuso da máquina).
 */

import Image from 'next/image';
import { Printer } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Barra de ações — some na impressão
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A faixa de operação, acima da folha. Tudo aqui é `.sem-impressao`: é a régua
 * do Felipe, não parte do documento.
 *
 * As instruções não são decorativas. O PDF é gerado PELO NAVEGADOR (decisão
 * D4), e duas opções do diálogo de impressão mudam o resultado:
 *
 *  · "Gráficos de fundo" DESLIGADO (o default do Chrome!) imprime o documento
 *    sem nenhum preenchimento — o donut vira cinco contornos vazios e as barras
 *    somem. O CSS pede `print-color-adjust: exact`, mas isso é um pedido, não
 *    uma ordem: a caixa de seleção continua vencendo.
 *  · Margens diferentes de "Padrão" brigam com o `@page { margin: 18mm 16mm }`
 *    e podem estourar a mancha de 178 mm para uma segunda página em branco.
 *
 * Dizer isso aqui custa duas linhas e evita a peça sair errada na primeira vez
 * que alguém que não conhece o painel for gerar o arquivo.
 */
export function BarraDossie({
  titulo,
  /**
   * Áreas marcadas para o dossiê (ABAS_CLIENTE.noDossie) que ainda não têm
   * seção escrita, ou que falharam ao carregar. Aparece só para o operador —
   * o cliente não pode receber um documento que anuncia o próprio buraco.
   */
  pendencias = [],
}: {
  titulo: string;
  pendencias?: string[];
}) {
  return (
    <div className="sem-impressao mb-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{titulo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Quem gera o arquivo é o navegador: <kbd className="font-sans">Ctrl</kbd>+
          <kbd className="font-sans">P</kbd> (ou <kbd className="font-sans">⌘</kbd>+
          <kbd className="font-sans">P</kbd>) → destino &quot;Salvar como PDF&quot;. Mantenha as
          margens em &quot;Padrão&quot; e ligue <strong className="font-normal text-foreground">Gráficos
          de fundo</strong> — sem essa opção o documento sai sem as cores da marca.
        </p>
        {pendencias.length > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Fora desta versão do documento: {pendencias.join(' · ')}.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[var(--ocre-hover)]"
      >
        <Printer className="size-4" />
        Imprimir / Salvar PDF
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Capa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tudo já formatado no servidor. Os campos opcionais são `null` quando o dado
 * não existe — e um campo nulo simplesmente NÃO APARECE na capa, em vez de
 * virar um travessão. Um "—" ao lado de "Nº de criador" na primeira página de
 * uma peça comercial parece cadastro incompleto; a ausência não parece nada.
 */
export interface DadosCapa {
  /** Nome do titular da conta. */
  criador: string;
  propriedade: string;
  numeroCriador: string | null;
  /** "Cidade — UF", ou só a UF. */
  local: string | null;
  /** Rótulos de SEGMENTO_ROTULO, já unidos. */
  segmentos: string | null;
  /** Contagem já formatada. */
  animaisAtivos: string;
  /** Data de cadastro, formatada. */
  clienteDesde: string | null;
  emitidoEm: string;
  /** A janela mais larga do documento, dita por extenso. */
  janela: string;
  /**
   * Preenchido quando os dados NÃO são do titular da conta — propriedade de
   * consultoria ou vínculo herdado. É uma declaração de responsabilidade, e
   * numa peça que circula por WhatsApp ela precisa estar na capa.
   */
  responsavel: string | null;
}

export function CapaDossie({ dados }: { dados: DadosCapa }) {
  const identificacao: { rotulo: string; valor: string }[] = [
    { rotulo: 'Criador', valor: dados.criador },
    { rotulo: 'Propriedade', valor: dados.propriedade },
    ...(dados.numeroCriador ? [{ rotulo: 'Nº de criador', valor: dados.numeroCriador }] : []),
    ...(dados.local ? [{ rotulo: 'Localização', valor: dados.local }] : []),
    ...(dados.segmentos ? [{ rotulo: 'Segmento', valor: dados.segmentos }] : []),
    { rotulo: 'Rebanho ativo', valor: dados.animaisAtivos },
    ...(dados.clienteDesde ? [{ rotulo: 'Cliente desde', valor: dados.clienteDesde }] : []),
    ...(dados.responsavel ? [{ rotulo: 'Dados sob responsabilidade de', valor: dados.responsavel }] : []),
  ];

  return (
    <header className="dossie-capa">
      {/* Marca. `priority` porque o next/image faz lazy load por default, e uma
          imagem ainda não carregada no momento do Ctrl+P sai como espaço em
          branco no PDF — falha silenciosa e bem no logo. */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt="Sistema Seabra"
          width={458}
          height={544}
          priority
          className="h-14 w-auto"
        />
        <span className="border-l border-border pl-3 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
          Sistema Seabra
          <span className="block tracking-[0.1em]">Pequenos Ruminantes</span>
        </span>
      </div>

      {/* mt-auto empurra o título para o terço inferior da folha: é onde o olho
          descansa numa capa, e deixa a metade de cima só com a marca. */}
      <div className="mt-auto pt-24">
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
          Dossiê do rebanho
        </p>
        <h1 className="mt-3 max-w-[150mm] text-[44px] leading-[1.08]">{dados.propriedade}</h1>
        <p className="mt-3 text-base text-muted-foreground">{dados.criador}</p>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-4 border-t border-[var(--line-strong)] pt-6">
        {identificacao.map((item) => (
          <div key={item.rotulo}>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {item.rotulo}
            </dt>
            <dd className="mt-0.5 text-[15px] text-foreground">{item.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Emitido em {dados.emitidoEm}</span>
        <span>{dados.janela}</span>
      </div>
    </header>
  );
}
