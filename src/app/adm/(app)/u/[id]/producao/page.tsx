import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import { idsDoEscopo, lerSelecaoParam } from '@/lib/adm/escopo';
import { VAZIO, formatarDiasRelativo, formatarInteiro, formatarLitros, formatarNumero } from '@/lib/adm/format';
import { consolidarVisoes } from '@/lib/adm/metricas';
import { contagemAproximada, getEscopo, getVisaoGeral, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { VisaoGeralPropriedade } from '@/lib/adm/types';

/**
 * Aba 3 — Produção de leite. Mesmo desenho da aba Rebanho: cards e a série por
 * cima, a <TabelaGenerica> do escape hatch por baixo.
 *
 * A TABELA DESTA ABA É `producao_diaria` — o tanque por dia, que é a série do
 * gráfico — e não `controle_leiteiro`. As duas medem leite e respondem perguntas
 * diferentes: produção diária é o volume da fazenda (uma linha por dia, por
 * segmento), controle leiteiro é a pesagem POR ANIMAL no dia de controle (uma
 * linha por animal × ordenha, dezenas de milhares num criador ativo). Abrir a aba
 * na segunda seria abrir num volume que ninguém audita de relance; ela fica a um
 * clique, nos atalhos.
 *
 * A SÉRIE É ESPARSA DE PROPÓSITO. Dia sem lançamento não é dia de zero litro — é
 * dia não medido. Preencher com zero desenharia uma queda a pique que não
 * existiu, e é assim que um gráfico mente sem ninguém perceber. Daí
 * `buracos="vazio"`.
 */

const TABELA = 'producao_diaria';

/**
 * Teto do consolidado — a mesma regra da aba Visão geral. Cada propriedade custa
 * uma leitura de cards/distribuições/série, e o admin geral alcança todas as 31.
 * Acima disso a aba pede uma escolha em vez de travar; a tabela abaixo continua
 * valendo, porque ela é UMA consulta com `IN (ids)` seja qual for o tamanho do
 * escopo.
 */
const TETO_CONSOLIDADO = 15;

export default async function ProducaoPage({
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

  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;
  const [visoesRes, tabelaRes] = await Promise.all([
    excedeConsolidado
      ? Promise.resolve([])
      : Promise.all(alvos.map((p) => getVisaoGeral(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const visoes = visoesRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const visao = visoes.length > 0 ? consolidarVisoes(visoes) : null;
  const consolidado = alvos.length > 1;

  return (
    <div className="flex flex-col gap-8">
      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {visao && <Cards visao={visao} consolidado={consolidado} />}

      {visao && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Produção diária · últimos 90 dias</h2>
            <p className="text-xs text-muted-foreground">
              Litros do tanque por dia. A lacuna é a informação: dia sem lançamento não vira zero.
            </p>
          </div>
          <div className="mt-3">
            <SerieTemporal
              series={[{ chave: 'producao', nome: 'Litros do tanque', pontos: visao.producaoDiaria90d }]}
              granularidade="dia"
              buracos="vazio"
              formato="litros0"
              altura={300}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {formatarInteiro(visao.producaoDiaria90d.length)} de 90 dias com lançamento
            {consolidado ? ' — somando as propriedades do escopo.' : '.'}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base">Outras tabelas de produção</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mesma grade, outro registro do catálogo — controle leiteiro, lactações, secagem, saída de
          leite e análise.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {listarRegistros()
            .filter((r) => r.area === 'Produção' && r.nome !== TABELA)
            .map((r) => (
              <li key={chaveRota(r)}>
                <Link
                  href={`/adm/u/${usuarioId}/tabelas/${chaveRota(r)}${selecao == null ? '' : `?prop=${selecao}`}`}
                  title={r.descricao}
                  className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {r.rotulo}
                </Link>
              </li>
            ))}
        </ul>
      </section>

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
        titulo="Produção diária"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${selecao == null ? '' : `?prop=${selecao}`}`}
      />
    </div>
  );
}

function Cards({ visao, consolidado }: { visao: VisaoGeralPropriedade; consolidado: boolean }) {
  const semMedia = consolidado ? 'média não se soma entre fazendas' : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard rotulo="Produção 30 dias" valor={formatarLitros(visao.producao30d, 0)} />
      <KpiCard
        rotulo="Média por dia lançado"
        valor={formatarLitros(visao.mediaProducaoDia, 1)}
        detalhe="dividido pelos dias lançados, não por 30"
      />
      <KpiCard
        rotulo="Média por lactante/dia"
        valor={consolidado ? VAZIO : formatarLitros(visao.mediaPorLactanteDia, 2)}
        detalhe={semMedia}
      />
      <KpiCard rotulo="Lactantes" valor={formatarInteiro(visao.lactantes)} />
      <KpiCard
        rotulo="DEL médio"
        valor={consolidado ? VAZIO : formatarNumero(visao.mediaDel, 0)}
        detalhe={semMedia ?? 'dias em lactação'}
      />
      <KpiCard
        rotulo="Dias com lançamento (90d)"
        valor={formatarInteiro(visao.producaoDiaria90d.length)}
        detalhe="de 90 — a lacuna é a informação"
      />
      <KpiCard rotulo="Lançamentos 30 dias" valor={formatarInteiro(visao.lancamentos30d)} />
      <KpiCard
        rotulo="Sem lançar"
        valor={formatarDiasRelativo(visao.diasSemLancar)}
        detalhe="qualquer módulo, não só produção (D2)"
      />
    </div>
  );
}


