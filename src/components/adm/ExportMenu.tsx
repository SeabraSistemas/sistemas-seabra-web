'use client';

/**
 * Exportação do /adm — a evolução de `src/components/katmandu/CsvExport.tsx`.
 *
 * O QUE MUDOU DO ORIGINAL, e por quê: o CsvExport monta o arquivo no browser
 * (`new Blob` + `URL.createObjectURL`). Isso funciona para as ~300 linhas de uma
 * planilha do Katmandu e TRAVA A ABA num rebanho de 4.820 animais com 40 colunas.
 * Aqui o arquivo é gerado e transmitido pelo servidor (`/adm/api/export`), e este
 * componente só escolhe o que pedir — o link carrega o recorte inteiro na query
 * string, então o que o Felipe está vendo é exatamente o que ele baixa.
 *
 * O QUE NÃO MUDOU, e não pode mudar: separador ';' e BOM UTF-8. O Excel em pt-BR
 * usa vírgula como separador DECIMAL — um CSV com ',' abre com tudo espremido
 * numa coluna só, e sem o BOM os acentos viram caracteres quebrados. As duas
 * constantes vivem aqui e são importadas pelo route handler para não existirem
 * duas verdades sobre o formato.
 *
 * TRÊS FORMATOS, TRÊS COISAS DIFERENTES (não um botão com três opções):
 *   CSV   streaming server-side, sem teto de linhas.
 *   XLSX  também server-side, com teto explícito e avisado na tela.
 *   PDF   decisão D4 — é PEÇA COMERCIAL com marca, não tabela crua. O botão
 *         NAVEGA para a página do dossiê, que tem print CSS; o Ctrl+P de lá dá
 *         fidelidade total de marca a custo zero de dependência.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatarInteiro } from '@/lib/adm/format';
import { cn } from '@/lib/utils';
import { useParamsAdm } from '@/components/adm/AdmFilters';

/** O route handler importa daqui. Ver o cabeçalho: é o que faz o Excel pt-BR abrir certo. */
export const SEPARADOR_CSV = ';';
export const BOM_UTF8 = '\uFEFF';

/** Teto de linhas do XLSX. O limite do formato é 1.048.576, mas o que estoura
 *  primeiro é a memória da lambda montando a planilha — este número é o teto
 *  operacional, e a tela avisa antes de o Felipe esperar por um arquivo que
 *  vai chegar cortado. */
export const TETO_LINHAS_XLSX = 50_000;

export interface ColunaExport {
  chave: string;
  rotulo: string;
  /** Sai sempre — é a identificação da linha. Espelha `requiredKeys` do CsvExport. */
  fixa?: boolean;
}

/** 'filtrado' = todo o conjunto com os filtros atuais; 'pagina' = só o que está na tela. */
export type EscopoExport = 'filtrado' | 'pagina';

const OPCOES_ESCOPO: { chave: EscopoExport; rotulo: string }[] = [
  { chave: 'filtrado', rotulo: 'Tudo que os filtros selecionam' },
  { chave: 'pagina', rotulo: 'Só a página atual' },
];

export function ExportMenu({
  colunas,
  visiveis,
  rota = '/adm/api/export',
  parametros,
  nomeArquivo,
  totalFiltrado,
  totalPagina,
  hrefDossie,
  tetoLinhasXlsx = TETO_LINHAS_XLSX,
  className,
}: {
  /** Tudo que é exportável — inclusive coluna escondida na grade. */
  colunas: readonly ColunaExport[];
  /** As colunas visíveis agora: a pré-seleção do painel. */
  visiveis: readonly string[];
  rota?: string;
  /**
   * O que identifica o conjunto no servidor: `{ tabela: 'rebanho', usuario: '11954' }`.
   * Os filtros, a ordenação e o escopo de propriedade NÃO entram aqui — vêm da
   * URL da tela, para o arquivo bater com o que está na grade.
   */
  parametros?: Record<string, string>;
  /** Nome sugerido do arquivo, sem extensão. */
  nomeArquivo?: string;
  totalFiltrado: number;
  totalPagina: number;
  /** D4: a página do dossiê deste cliente. Sem ela, o PDF não é oferecido. */
  hrefDossie?: string;
  tetoLinhasXlsx?: number;
  className?: string;
}) {
  const { params } = useParamsAdm();
  const [aberto, setAberto] = useState(false);

  /**
   * O link do dossiê é DERIVADO, não passado de cima.
   *
   * A alternativa era cada página que renderiza uma tabela lembrar de mandar
   * `hrefDossie` — e "lembrar" é justamente o que não acontece: a prop existia
   * desde a Fase 1 e nenhuma das doze telas a preenchia, então o botão de PDF
   * simplesmente nunca aparecia. Tudo que ele precisa já está aqui: o id do
   * cliente vem em `parametros.usuario` e a propriedade em foco está na URL.
   * A prop continua aceita, como escape para um caso que fuja desta forma.
   */
  const dossieDerivado = (() => {
    const usuario = parametros?.usuario;
    if (!usuario || !/^\d+$/.test(usuario)) return undefined;
    const prop = params.get('prop');
    return `/adm/u/${usuario}/dossie${prop ? `?prop=${encodeURIComponent(prop)}` : ''}`;
  })();
  const linkDossie = hrefDossie ?? dossieDerivado;
  const [escopo, setEscopo] = useState<EscopoExport>('filtrado');

  const fixas = useMemo(() => colunas.filter((c) => c.fixa).map((c) => c.chave), [colunas]);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => new Set([...visiveis, ...fixas]));

  function alternar(chave: string) {
    if (fixas.includes(chave)) return;
    setSelecionadas((antes) => {
      const proximo = new Set(antes);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  const escolhidas = colunas.filter((c) => selecionadas.has(c.chave)).map((c) => c.chave);
  const linhas = escopo === 'pagina' ? totalPagina : totalFiltrado;
  const estouraXlsx = escopo === 'filtrado' && totalFiltrado > tetoLinhasXlsx;

  /**
   * A URL do arquivo é a URL DA TELA mais o formato. Copiar a query inteira em
   * vez de remontá-la é o que garante que nenhum filtro fique de fora por
   * esquecimento quando uma faceta nova nascer.
   */
  function montarUrl(formato: 'csv' | 'xlsx'): string {
    const p = new URLSearchParams(params.toString());
    for (const [chave, valor] of Object.entries(parametros ?? {})) p.set(chave, valor);
    p.set('formato', formato);
    p.set('cols', escolhidas.join(','));
    if (nomeArquivo) p.set('nome', nomeArquivo);
    // A INTENÇÃO vai explícita, em vez de ser inferida da presença de `page`.
    // Inferir era ambíguo dos dois lados: a grade sempre tem `size` na URL, e o
    // servidor não tinha como distinguir "o Felipe quer esta página" de "a URL
    // por acaso carrega o tamanho de página".
    p.set('escopo', escopo);
    if (escopo === 'filtrado') {
      // O conjunto filtrado inteiro ignora onde a tela parou de paginar.
      p.delete('page');
      p.delete('cursor');
      p.delete('size');
    }
    return `${rota}?${p.toString()}`;
  }

  const semColuna = escolhidas.length === 0;
  const inerte = semColuna ? 'pointer-events-none opacity-50' : null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn('gap-1.5', className)}
        onClick={() => setAberto(true)}
      >
        <Download className="size-3.5" />
        Exportar
      </Button>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Exportar</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 text-[13px]">
            {/* ── Escopo ── */}
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Escopo</h3>
              {OPCOES_ESCOPO.map((opcao) => (
                <label key={opcao.chave} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="escopo-export"
                    checked={escopo === opcao.chave}
                    onChange={() => setEscopo(opcao.chave)}
                    className="size-4 accent-primary"
                  />
                  <span className="flex-1">{opcao.rotulo}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatarInteiro(opcao.chave === 'pagina' ? totalPagina : totalFiltrado)}
                  </span>
                </label>
              ))}
            </section>

            {/* ── Colunas ── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Colunas</h3>
                <button
                  type="button"
                  onClick={() => setSelecionadas(new Set(colunas.map((c) => c.chave)))}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Selecionar todas
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {colunas.map((coluna) => (
                  <label key={coluna.chave} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selecionadas.has(coluna.chave)}
                      disabled={coluna.fixa}
                      onChange={() => alternar(coluna.chave)}
                      className="size-4 rounded border-input accent-primary disabled:opacity-60"
                    />
                    <span className="flex-1 truncate">{coluna.rotulo}</span>
                    {coluna.fixa && <span className="text-xs text-muted-foreground">obrigatória</span>}
                  </label>
                ))}
              </div>
            </section>

            {/* ── Formatos ── */}
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Formato</h3>

              {/* `disabled` não existe em <a>: sem coluna nenhuma o link é neutralizado
                  por classe e por aria, que é o que o leitor de tela entende. */}
              <Button asChild variant="default" size="sm" className={cn('justify-start gap-2', inerte)}>
                {/* <a> e não <Link>: a resposta é um download (Content-Disposition:
                    attachment), não uma rota do App Router — o roteador do Next
                    tentaria renderizá-la como página. */}
                <a href={montarUrl('csv')} aria-disabled={semColuna} tabIndex={semColuna ? -1 : undefined}>
                  <FileText className="size-4" />
                  CSV · {formatarInteiro(linhas)} linhas
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Separador &quot;{SEPARADOR_CSV}&quot; e BOM UTF-8 — é o que faz o Excel em português abrir o arquivo já
                em colunas, com os acentos certos. Sem teto de linhas.
              </p>

              <Button asChild variant="outline" size="sm" className={cn('mt-2 justify-start gap-2', inerte)}>
                <a href={montarUrl('xlsx')} aria-disabled={semColuna} tabIndex={semColuna ? -1 : undefined}>
                  <FileSpreadsheet className="size-4" />
                  Excel (.xlsx)
                </a>
              </Button>
              {estouraXlsx ? (
                <p className="text-xs text-destructive">
                  São {formatarInteiro(totalFiltrado)} linhas e o teto do Excel aqui é {formatarInteiro(tetoLinhasXlsx)}
                  : o arquivo vai chegar cortado. Para o conjunto inteiro, use o CSV.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Números e datas com tipo de verdade (não texto), cabeçalho congelado. Teto de{' '}
                  {formatarInteiro(tetoLinhasXlsx)} linhas.
                </p>
              )}

              {linkDossie ? (
                <>
                  <Button asChild variant="outline" size="sm" className="mt-2 justify-start gap-2">
                    <Link href={linkDossie}>
                      <Printer className="size-4" />
                      PDF · dossiê do cliente
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Abre a página do dossiê, com a marca da Sistema Seabra. Ctrl+P → &quot;Salvar como PDF&quot; gera a
                    peça para mandar ao cliente. Não é a tabela crua: PDF aqui é material de venda.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  PDF só existe como dossiê do cliente, na ficha dele — é peça comercial com marca, não despejo de
                  tabela.
                </p>
              )}
            </section>
          </div>

          <SheetFooter>
            <Button variant="ghost" size="sm" onClick={() => setAberto(false)}>
              Fechar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
