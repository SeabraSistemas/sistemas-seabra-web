import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, TrendingDown } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { RadarAml } from '@/components/adm/charts/RadarAml';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  ESCALA_AML,
  PONTUACAO_MAXIMA,
  TABELA_AVALIACOES,
  avaliacaoParada,
  consolidarAvaliacoes,
  getAvaliacoes,
  pontosDoRadar,
  semAvaliacao,
} from '@/lib/adm/areas/avaliacoes';
import type { LinhaAvaliacoes } from '@/lib/adm/areas/contrato';
import { idsDoEscopo, lerSelecaoParam } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, parseColunasParam } from '@/lib/adm/tabelas';
import type { Resultado } from '@/lib/adm/types';

/**
 * Aba 7 — Avaliações e registro. **É a aba que o Felipe vende**, e por isso ela
 * é a única do painel que fala em linguagem comercial, não só de auditoria.
 *
 * As duas leituras que importam aqui não são números, são situações:
 *
 *  · NUNCA AVALIOU  — nenhuma AML, nenhuma medida, nenhuma AML de corte. É a
 *    conversa de primeira venda, e o painel diz isso com todas as letras em vez
 *    de mostrar uma parede de zeros que o Felipe teria que interpretar.
 *  · AVALIOU E PAROU — tem histórico, mas nada nos últimos 12 meses. É a outra
 *    conversa: reativação. Confundir as duas custa a abordagem errada.
 *
 * O RADAR é o gráfico central. A escala é FIXA em 1..9 de propósito (ver o
 * comentário do componente): a AML é uma escala biológica, não uma nota, e
 * deixar o recharts escalar pelo dado faria um rebanho fraco desenhar o mesmo
 * polígono cheio de um rebanho excelente — destruindo a única coisa que o
 * gráfico existe para permitir, que é comparar dois criadores.
 *
 * ⚠️ Nenhuma chave de coluna da AML é montada por template nesta tela. A grafia
 * dos 16 pontos é inconsistente no banco (dois têm acento, os `class_*`
 * correspondentes não), e `pontosDoRadar()` resolve isso por LOOKUP no catálogo.
 */

const TETO_CONSOLIDADO = 15;

export default async function AvaliacoesPage({
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

  const registro = getRegistro(TABELA_AVALIACOES);
  if (!registro) notFound();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;

  const [dadosRes, tabelaRes] = await Promise.all([
    excedeConsolidado
      ? Promise.resolve<Resultado<LinhaAvaliacoes>[]>([])
      : Promise.all(alvos.map((p) => getAvaliacoes(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const itens = dadosRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = dadosRes.filter((r) => !r.ok).length;
  const aval = itens.length > 0 ? consolidarAvaliacoes(itens) : null;

  // De `itens`, não de `alvos`: com duas das três fazendas falhando, sobra uma
  // linha REAL — e escondê-la atrás de "escolha uma fazenda" perderia dado bom.
  const consolidado = itens.length > 1;
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <div className="flex flex-col gap-8">
      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {alvos.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Sem propriedade no escopo — não há avaliação para mostrar.
        </p>
      )}

      {falhas > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não carregaram —
          os números abaixo são só das que responderam.
        </p>
      )}

      {/* A leitura comercial afirma coisas sobre o CLIENTE ("nunca avaliou",
          "avaliou e parou"). No consolidado ela sai: os totais somam, mas
          "parou" depende da distribuição no tempo de cada fazenda, e a frase
          errada aqui manda o Felipe para a abordagem errada. */}
      {aval && !consolidado && <LeituraComercial aval={aval} />}
      {aval && <Cards aval={aval} consolidado={consolidado} />}
      {aval && !semAvaliacao(aval) && <Radar aval={aval} consolidado={consolidado} />}
      {aval && !semAvaliacao(aval) && <Evolucao aval={aval} />}

      {/*
        A AML em detalhe tem tela própria: aqui o radar é a MÉDIA da fazenda, e
        lá a pergunta é por animal — quem foi avaliado, com que nota, e quanto do
        plantel já passou pelo avaliador.
      */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base">AML animal a animal</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cobertura do plantel, distribuição das notas, dispersão de cada característica e o
              ranking das maiores pontuações.
            </p>
          </div>
          <Link
            href={`/adm/u/${usuarioId}/avaliacoes/aml${selecao == null ? '' : `?prop=${selecao}`}`}
            className="shrink-0 rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Abrir AML
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base">Medidas corporais</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A fita métrica: perfil de cada medida em centímetros, animais remedidos e as medições
              com valor impossível — que quase sempre são campo trocado na coleta.
            </p>
          </div>
          <Link
            href={`/adm/u/${usuarioId}/avaliacoes/medidas${selecao == null ? '' : `?prop=${selecao}`}`}
            className="shrink-0 rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Abrir medidas
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
        titulo="Avaliações morfológicas lineares"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
      />
    </div>
  );
}

/**
 * A situação comercial, dita antes dos números. Só aparece quando há algo a
 * dizer: cliente que avalia em dia não precisa de faixa nenhuma.
 */
function LeituraComercial({ aval }: { aval: LinhaAvaliacoes }) {
  if (semAvaliacao(aval)) {
    return (
      <section className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Award className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          <strong className="font-medium text-foreground">
            Este criador nunca recebeu avaliação.
          </strong>{' '}
          Nenhuma AML de leite, nenhuma medida corporal, nenhuma AML de corte. É uma conversa de
          primeira venda de consultoria — e o rebanho já está cadastrado, que é a parte difícil.
        </span>
      </section>
    );
  }

  if (avaliacaoParada(aval)) {
    return (
      <section className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          <strong className="font-medium text-foreground">Avaliou e parou.</strong> São{' '}
          {formatarInteiro(aval.amls_total)} avaliações no histórico e nenhuma nos últimos 12 meses.
          Conversa de reativação, não de primeira venda: o criador já conhece o serviço.
        </span>
      </section>
    );
  }

  return null;
}

function Cards({ aval, consolidado }: { aval: LinhaAvaliacoes; consolidado: boolean }) {
  // Pontuação média de fazendas diferentes não se soma: `consolidarAvaliacoes`
  // anula. Dizer "sem avaliação pontuada" aí seria mentir sobre o criador.
  const semMedia = 'média não se soma entre fazendas — escolha uma no seletor';
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard rotulo="AMLs realizadas" valor={formatarInteiro(aval.amls_total)} />
      <KpiCard
        rotulo="AMLs · 12 meses"
        valor={formatarInteiro(aval.amls_12m)}
        detalhe={aval.amls_total > 0 && aval.amls_12m === 0 ? 'nenhuma no período' : undefined}
      />
      <KpiCard rotulo="Medidas corporais" valor={formatarInteiro(aval.medidas_total)} />
      <KpiCard
        rotulo="Pontuação média"
        valor={
          aval.pontuacao_media == null
            ? VAZIO
            : `${formatarNumero(aval.pontuacao_media, 1)} / ${PONTUACAO_MAXIMA}`
        }
        detalhe={
          aval.pontuacao_media != null
            ? undefined
            : consolidado
              ? semMedia
              : 'sem avaliação pontuada'
        }
        destaque
      />
      <KpiCard
        rotulo="AML de corte"
        valor={formatarInteiro(aval.aml_corte_total)}
        detalhe="motor separado do de leite"
      />
    </div>
  );
}

function Radar({ aval, consolidado }: { aval: LinhaAvaliacoes; consolidado: boolean }) {
  const pontos = pontosDoRadar(aval.media_por_ponto);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Perfil morfológico do rebanho</h2>
        <p className="text-xs text-muted-foreground">
          Média de cada ponto da AML · escala fixa 1 a {ESCALA_AML}
        </p>
      </div>

      <div className="mt-3">
        <RadarAml
          pontos={pontos}
          escala={ESCALA_AML}
          total={aval.pontuacao_media}
          rotuloTotal="pontuação média"
          mensagemVazia={
            consolidado
              ? 'O perfil médio não se soma entre fazendas — escolha uma no seletor para ver o radar dela.'
              : 'Sem avaliação com pontos preenchidos.'
          }
        />
      </div>

      {/*
        A ressalva que evita a leitura errada mais comum do radar: um polígono
        pequeno num ponto NÃO é necessariamente ruim. A AML mede conformação, e
        vários pontos são ótimos no meio da escala.
      */}
      <p className="mt-3 text-xs text-muted-foreground">
        A escala da AML é biológica, não uma nota: em vários pontos o ideal fica no meio da escala,
        não no 9. O radar serve para comparar rebanhos e enxergar o padrão do criador — não para
        somar &quot;quanto mais cheio, melhor&quot;.
      </p>
    </section>
  );
}

function Evolucao({ aval }: { aval: LinhaAvaliacoes }) {
  const serie = aval.pontuacao_mensal ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Pontuação média por mês</h2>
        <p className="text-xs text-muted-foreground">
          Mês sem avaliação fica vazio — não é queda de nota, é ausência de trabalho
        </p>
      </div>
      <div className="mt-3">
        <SerieTemporal
          series={[{ chave: 'pontuacao', nome: 'Pontuação média', pontos: serie }]}
          granularidade="mes"
          buracos="vazio"
          formato="numero1"
          mensagemVazia="Sem avaliação pontuada no período."
        />
      </div>
    </section>
  );
}
