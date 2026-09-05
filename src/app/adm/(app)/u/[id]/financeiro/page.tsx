import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EyeOff, Wallet } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  consolidarFinanceiro,
  getFinanceiro,
  margemPercentual,
  temLancamentos,
  type FinanceiroProdutor,
} from '@/lib/adm/areas/financeiro';
import { idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarDataRelativa,
  formatarInteiro,
  formatarMoeda,
  formatarPercentual,
} from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { Resultado } from '@/lib/adm/types';

/**
 * Aba 8 — Financeiro DO PRODUTOR. Irmã de Rebanho e Produção: cards em cima,
 * gráficos no meio, a mesma <TabelaGenerica> do escape hatch embaixo com o
 * preset da área. Nenhuma linha de código de tabela é escrita aqui.
 *
 * ⚠️ ESTA ABA NÃO É A ASSINATURA. Aqui é a economia da fazenda (o leite que o
 * produtor vendeu, a ração que ele comprou); a cobrança do SeabraApp está na aba
 * Assinatura. Os dois nomes se confundem e as duas telas medem coisas opostas —
 * por isso o aviso é a PRIMEIRA coisa da página, e não uma nota de rodapé.
 *
 * ⚠️ E ESTA ABA MOSTRA DADO QUE O CONSULTOR NÃO VÊ. O módulo Financeiro é oculto
 * para o consultor no app por decisão de produto já travada. Sem esse aviso, a
 * reação natural de quem abre a tela é achar que o app do técnico está com bug.
 *
 * A REGRA MAIS IMPORTANTE DA TELA: sem `estimativa_custo_snapshot`, o custo por
 * litro não é zero — ele não existe. "R$ 0,00 por litro" seria uma afirmação
 * falsa sobre o negócio do cliente; "sem estimativa de custo calculada" é
 * verdade, e ainda é a oportunidade comercial mais direta desta ficha.
 */

const TABELA = 'financeiro_lancamentos';

/**
 * Teto do consolidado — a mesma regra das abas irmãs. Cada propriedade custa uma
 * leitura da view; o admin geral alcança todas as 31. Acima disso a aba pede uma
 * escolha em vez de travar, e a tabela continua cobrindo o escopo inteiro porque
 * ela é UMA consulta com `IN (ids)`.
 */
const TETO_CONSOLIDADO = 15;

export default async function FinanceiroPage({
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
  const agora = new Date();

  const registro = getRegistro(TABELA);
  if (!registro) notFound();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  // ALLOWLIST: `?cols=` é texto de fora e só vira projeção depois de passar pelo
  // catálogo — lista de permissão, nunca de bloqueio.
  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);

  // Orçamento de células, não de linhas: é o payload RSC que trava a aba.
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;
  const [dadosRes, tabelaRes] = await Promise.all([
    // Anotação explícita: sem ela o ramo vazio tipa como `never[]` e o resultado
    // vira uma união de arrays que o `.filter()` abaixo não consegue percorrer.
    excedeConsolidado
      ? Promise.resolve<Resultado<FinanceiroProdutor>[]>([])
      : Promise.all(alvos.map((p) => getFinanceiro(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const itens = dadosRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = dadosRes.filter((r) => !r.ok).length;
  const fin = itens.length > 0 ? consolidarFinanceiro(itens) : null;
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <div className="flex flex-col gap-8">
      <AvisoDeIdentidade hrefAssinatura={`/adm/u/${usuarioId}/assinatura${sufixo}`} />

      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {alvos.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Sem propriedade no escopo — não há livro-caixa para mostrar. O financeiro é por fazenda,
          não por conta.
        </p>
      )}

      {falhas > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não carregaram —
          os números abaixo são só das que responderam.
        </p>
      )}

      {fin && <Cards fin={fin} agora={agora} />}

      {fin && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Custo por litro no tempo</h2>
            <p className="text-xs text-muted-foreground">
              Um ponto por snapshot de estimativa — é a única série financeira que o app já grava.
            </p>
          </div>
          <div className="mt-3">
            <CustoNoTempo fin={fin} />
          </div>
        </section>
      )}

      {fin && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Despesa por setor · 12 meses</h2>
            <p className="text-xs text-muted-foreground">
              {fin.consolidado
                ? 'Setores de fazendas diferentes com o mesmo nome estão somados.'
                : 'Centros de custo do próprio produtor (financeiro_setores).'}
            </p>
          </div>
          <div className="mt-3">
            <DistribuicaoBarras
              dados={fin.despesaPorSetor}
              formatarValor={formatarMoeda}
              larguraRotulo={150}
              mostrarPercentual
              mensagemVazia="Sem despesa lançada por setor nos últimos 12 meses."
            />
          </div>
        </section>
      )}

      <OutrasTabelas usuarioId={usuarioId} selecao={selecao} />

      <TabelaGenerica
        tabela={chaveRota(registro)}
        linhas={tabelaRes.ok ? tabelaRes.dados.linhas : []}
        total={tabelaRes.ok ? tabelaRes.dados.total : 0}
        colunas={colunas}
        rejeitadas={rejeitadas}
        usuarioId={usuarioId}
        agora={agora.toISOString()}
        aproximado={contagemAproximada(registro)}
        erro={tabelaRes.ok ? null : tabelaRes.detalhe}
        escopoVazio={idsDoEscopo(escopo).length === 0}
        titulo="Lançamentos do produtor"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
      />
    </div>
  );
}

/**
 * As duas confusões desta aba, ditas antes de qualquer número. Vale a área que
 * ocupa: a primeira evita uma conversa comercial sobre a conta errada, e a
 * segunda evita um chamado de "bug" que não é bug.
 */
function AvisoDeIdentidade({ hrefAssinatura }: { hrefAssinatura: string }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <p className="flex items-start gap-2">
        <Wallet className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          <strong className="font-medium text-foreground">Esta aba é a economia da fazenda</strong> —
          o livro-caixa do produtor: o leite que ele vendeu, a ração que ele comprou. O que a Sistema
          Seabra cobra dele pelo SeabraApp está na{' '}
          <Link href={hrefAssinatura} className="text-foreground underline underline-offset-4">
            aba Assinatura
          </Link>
          . As duas se confundem pelo nome e medem coisas opostas.
        </span>
      </p>
      <p className="flex items-start gap-2">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          <strong className="font-medium text-foreground">
            O módulo Financeiro é oculto para o consultor no app
          </strong>{' '}
          — decisão de produto já travada. O técnico que atende esta fazenda não enxerga nada do que
          está nesta tela; se ele perguntar de onde saiu o número, saiu daqui.
        </span>
      </p>
    </section>
  );
}

function Cards({ fin, agora }: { fin: FinanceiroProdutor; agora: Date }) {
  const consolidado = fin.consolidado;
  const semMedia = 'média não se soma entre fazendas';
  const margem = margemPercentual(fin);
  const houveMovimento = temLancamentos(fin);

  // Custo por litro e lucro por lactante têm QUATRO estados, não dois: número,
  // "não dá para consolidar", "nunca foi calculado" e "há snapshot, mas este
  // campo ficou vazio nele". Colapsar qualquer um deles em zero é justamente o
  // que esta tela não pode fazer — zero de custo por litro afirma que a fazenda
  // produz de graça.
  const razao = (valor: number | null) => {
    if (consolidado) return { valor: VAZIO, detalhe: semMedia };
    if (fin.semEstimativa) return { valor: VAZIO, detalhe: 'sem estimativa de custo calculada' };
    if (valor == null) return { valor: VAZIO, detalhe: 'não preenchido no último snapshot' };
    return { valor: formatarMoeda(valor), detalhe: 'do snapshot mais recente' };
  };

  const custo = razao(fin.custoLitro);
  const lucro = razao(fin.lucroLactanteMes);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Receita 12 meses"
        valor={formatarMoeda(fin.receita12m)}
        detalhe={houveMovimento ? 'lançado pelo produtor' : 'nenhum lançamento no período'}
      />
      <KpiCard
        rotulo="Despesa 12 meses"
        valor={formatarMoeda(fin.despesa12m)}
        detalhe="em módulo — no banco a despesa é gravada com sinal negativo"
      />
      <KpiCard
        rotulo="Margem 12 meses"
        valor={formatarMoeda(fin.margem12m)}
        detalhe={margem != null ? `${formatarPercentual(margem)} da receita` : 'sem receita para comparar'}
        className={fin.margem12m != null && fin.margem12m < 0 ? 'border-destructive/40' : undefined}
      />
      <KpiCard
        rotulo="Lançamentos 12 meses"
        valor={formatarInteiro(fin.lancamentos12m)}
        detalhe="receita e despesa somadas"
      />
      <KpiCard rotulo="Custo por litro" valor={custo.valor} detalhe={custo.detalhe} />
      <KpiCard rotulo="Lucro por lactante/mês" valor={lucro.valor} detalhe={lucro.detalhe} />
      <KpiCard
        rotulo="Última estimativa"
        valor={consolidado ? VAZIO : formatarData(fin.dataSnapshot)}
        detalhe={
          consolidado
            ? 'o snapshot é por fazenda'
            : fin.dataSnapshot
              ? formatarDataRelativa(fin.dataSnapshot, agora)
              : 'nunca calculada'
        }
      />
      <KpiCard
        rotulo="Snapshots na série"
        valor={consolidado ? VAZIO : formatarInteiro(fin.custoLitroSerie.length)}
        detalhe={consolidado ? 'razão não se consolida' : 'pontos do gráfico abaixo'}
      />
    </div>
  );
}

/** Os três estados do gráfico de custo: consolidado (não desenha), sem
 *  estimativa (explica) e com estimativa (desenha). */
function CustoNoTempo({ fin }: { fin: FinanceiroProdutor }) {
  if (fin.consolidado) {
    return (
      <p className="text-sm text-muted-foreground">
        Custo por litro é razão, não volume: somar o de várias fazendas produz um número que não é de
        nenhuma delas. Escolha uma fazenda no seletor acima para ver a curva.
      </p>
    );
  }

  if (fin.semEstimativa || fin.custoLitroSerie.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground">Sem estimativa de custo calculada.</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Custo por litro e lucro por lactante saem de{' '}
          <code className="rounded border border-border bg-secondary px-1 py-0.5 text-xs">
            estimativa_custo_snapshot
          </code>
          , criada quando o produtor roda a estimativa no app — e esta propriedade não tem nenhum
          snapshot. Mostrar R$ 0,00 por litro seria afirmar que a fazenda produz sem custo.
        </p>
        <p className="max-w-prose text-sm text-muted-foreground">
          {temLancamentos(fin)
            ? 'Ele já usa o livro-caixa, mas nunca fechou o custo: é o gancho de consultoria mais direto desta ficha.'
            : 'O módulo financeiro inteiro está sem uso nesta fazenda.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <SerieTemporal
        series={[{ chave: 'custo_litro', nome: 'Custo por litro', pontos: fin.custoLitroSerie }]}
        granularidade="mes"
        buracos="vazio"
        formatarValor={formatarMoeda}
        // Base zero é a regra para contagem e receita; aqui seria errada. Custo
        // por litro é razão e vive numa faixa estreita: ancorado em zero, R$ 2,10
        // contra R$ 1,70 vira um traço reto e a variação — que é a informação —
        // some do gráfico.
        ancorarEmZero={false}
        altura={280}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Mês sem snapshot fica como buraco, não como zero: o produtor não recalcula todo mês, e
        interpolar inventaria um custo que ninguém mediu.
      </p>
    </>
  );
}

/** Atalhos para o resto da área no escape hatch — é o que impede a aba curada de
 *  virar um beco: o que ela não mostra continua a um clique. */
function OutrasTabelas({ usuarioId, selecao }: { usuarioId: number; selecao: SelecaoPropriedade }) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const registros = listarRegistros().filter((r) => r.area === 'Financeiro' && r.nome !== TABELA);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">Outras tabelas do financeiro</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Mesma grade, outro registro do catálogo — setores, custos fixos, insumos e os snapshots de
        custo que alimentam os cards acima.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {registros.map((r) => (
          <li key={chaveRota(r)}>
            <Link
              href={`/adm/u/${usuarioId}/tabelas/${chaveRota(r)}${sufixo}`}
              title={r.descricao}
              className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {r.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
