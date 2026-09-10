import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { DistribuicaoDonut } from '@/components/adm/charts/DistribuicaoDonut';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import { idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { consolidarVisoes } from '@/lib/adm/metricas';
import { contagemAproximada, getEscopo, getVisaoGeral, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { FatiaDistribuicao, VisaoGeralPropriedade } from '@/lib/adm/types';

/**
 * Aba 2 — Rebanho. Cards e gráficos por cima, e por baixo a MESMA
 * <TabelaGenerica> do escape hatch, com o preset da área.
 *
 * É essa montagem que torna "aba curada" barata: nenhuma linha de código de
 * tabela é escrita aqui — o registro `rebanho` do catálogo já descreve colunas,
 * tipos, facetas e a FK de categoria. Se amanhã o app ganhar uma coluna, ela
 * aparece nas duas telas ao mesmo tempo, porque só existe uma.
 *
 * ARMADILHA QUE ESTA TELA EVITA: `rebanho.categoria` guarda o UUID da categoria,
 * não o nome. O donut mostra "Lactante" porque a view resolve o join em SQL, e a
 * grade mostra o mesmo porque o catálogo declara a `referencia`. Comparar a
 * coluna com a string 'lactante' — o caminho óbvio — nunca casa e não dá erro:
 * a tela só fica vazia.
 */

const TABELA = 'rebanho';

/**
 * Teto do consolidado — a mesma regra da aba Visão geral. Cada propriedade custa
 * uma leitura de cards/distribuições/série, e o admin geral alcança todas as 31.
 * Acima disso a aba pede uma escolha em vez de travar; a tabela abaixo continua
 * valendo, porque ela é UMA consulta com `IN (ids)` seja qual for o tamanho do
 * escopo.
 */
const TETO_CONSOLIDADO = 15;

export default async function RebanhoPage({
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

  // ALLOWLIST antes de qualquer coisa: `?cols=` é texto de fora e só vira
  // projeção depois de passar pelo catálogo. Ver tabelas.ts — a checagem é por
  // lista de permissão, não por lista de bloqueio.
  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);

  // Orçamento de células, não de linhas: 1.000 linhas de 8 colunas e 250 de 32
  // custam o mesmo no payload RSC, e é ele que trava a aba — não o banco.
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

  return (
    <div className="flex flex-col gap-8">
      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {visao && <Cards visao={visao} consolidado={alvos.length > 1} />}

      {visao && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Painel
            titulo="Distribuição etária"
            nota="Ordem cronológica, não por volume: ordenada por contagem, ela deixa de mostrar a reposição do rebanho."
          >
            <FaixasEtarias faixas={visao.piramideEtaria} />
          </Painel>
          <Painel titulo="Por categoria" nota="O nome vem de categoria_animal — a coluna do rebanho guarda só o UUID.">
            <DistribuicaoDonut dados={visao.porCategoria} rotuloTotal="animais ativos" />
          </Painel>
          <Painel titulo="Por raça">
            <DistribuicaoBarras dados={visao.porRaca} mostrarPercentual />
          </Painel>
          <Painel titulo="Outras tabelas de rebanho" nota="Mesma grade, outro registro do catálogo.">
            <TabelasDaArea usuarioId={usuarioId} area="Rebanho" exceto={TABELA} selecao={selecao} />
          </Painel>
        </div>
      )}

      {/*
        O inventário tem tela própria porque responde outra pergunta: aqui é
        "quem está no rebanho", lá é "por onde saíram os que não estão" — e essa
        segunda expõe que 79% dos inativos da base saíram sem motivo registrado,
        o que torna mortalidade e descarte incalculáveis onde o número é alto.
      */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base">Inventário e fluxo</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Efetivo por categoria e sexo, entradas e saídas de 24 meses, por onde os animais
              saíram e os buracos de cadastro que viram &quot;—&quot; nas outras telas.
            </p>
          </div>
          <Link
            href={`/adm/u/${usuarioId}/rebanho/inventario${selecao == null ? '' : `?prop=${selecao}`}`}
            className="shrink-0 rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Abrir inventário
          </Link>
        </div>
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
        titulo="Animais"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${selecao == null ? '' : `?prop=${selecao}`}`}
      />
    </div>
  );
}

function Cards({ visao, consolidado }: { visao: VisaoGeralPropriedade; consolidado: boolean }) {
  const total = visao.animaisAtivos + visao.animaisInativos;
  const sexado = visao.femeas + visao.machos;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Cadastrados"
        valor={formatarInteiro(total)}
        detalhe="ativos + inativos — venda, óbito e descarte inativam, não apagam"
      />
      <KpiCard rotulo="Ativos" valor={formatarInteiro(visao.animaisAtivos)} />
      <KpiCard rotulo="Inativos" valor={formatarInteiro(visao.animaisInativos)} />
      <KpiCard
        rotulo="Sem sexo definido"
        valor={formatarInteiro(Math.max(0, visao.animaisAtivos - sexado))}
        detalhe="o banco grava 'fêmea' COM acento"
      />
      <KpiCard rotulo="Fêmeas" valor={formatarInteiro(visao.femeas)} />
      <KpiCard rotulo="Machos" valor={formatarInteiro(visao.machos)} />
      <KpiCard rotulo="Em lactação" valor={formatarInteiro(visao.lactantes)} />
      <KpiCard
        rotulo="DEL médio"
        valor={consolidado ? VAZIO : formatarNumero(visao.mediaDel, 0)}
        detalhe={consolidado ? 'média não se soma entre fazendas' : 'dias em lactação'}
      />
    </div>
  );
}

/** Ver a nota gêmea em `u/[id]/page.tsx`: <DistribuicaoBarras> ordena do maior
 *  para o menor (é um ranking, e faz bem o que faz) e faixa etária tem ordem
 *  natural. Reordenar por contagem apaga a informação que a distribuição carrega. */
function FaixasEtarias({ faixas }: { faixas: FatiaDistribuicao[] }) {
  const total = faixas.reduce((acc, f) => acc + f.valor, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground">Sem animais ativos.</p>;
  const maior = faixas.reduce((acc, f) => Math.max(acc, f.valor), 0);

  return (
    <ul className="flex flex-col gap-1.5">
      {faixas.map((faixa) => (
        <li key={faixa.rotulo} className="grid grid-cols-[8rem_1fr_5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
          <span className="h-2.5 rounded-full bg-secondary" aria-hidden>
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${maior > 0 ? (faixa.valor / maior) * 100 : 0}%` }}
            />
          </span>
          <span className="text-right tabular-nums text-foreground">
            {formatarInteiro(faixa.valor)}
            <span className="ms-1 text-xs text-muted-foreground">{Math.round((faixa.valor / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Atalhos para as outras tabelas da mesma área, no escape hatch. É o que impede
 *  a aba curada de virar um beco: o que ela não mostra continua a um clique. */
function TabelasDaArea({
  usuarioId,
  area,
  exceto,
  selecao,
}: {
  usuarioId: number;
  area: string;
  exceto: string;
  selecao: SelecaoPropriedade;
}) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const registros = listarRegistros().filter((r) => r.area === area && r.nome !== exceto);

  return (
    <ul className="flex flex-wrap gap-2">
      {registros.map((registro) => (
        <li key={chaveRota(registro)}>
          <Link
            href={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
            className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            title={registro.descricao}
          >
            {registro.rotulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Painel({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">{titulo}</h2>
      {nota && <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}


