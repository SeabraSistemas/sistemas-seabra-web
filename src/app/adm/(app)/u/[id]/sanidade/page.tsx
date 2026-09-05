import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  FAMACHA_CRITICO,
  consolidarSanidade,
  escalaFamacha,
  getSanidade,
  medicoesCriticas,
  medicoesFamacha,
  type GrauFamacha,
} from '@/lib/adm/areas/sanidade';
import { idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import { preencherMeses } from '@/lib/adm/metricas';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { LinhaSanidade } from '@/lib/adm/areas/contrato';

/**
 * Aba 5 — Sanidade. Irmã de Rebanho, Produção e Reprodução: cards em cima,
 * gráficos no meio, a mesma <TabelaGenerica> do escape hatch embaixo com o
 * preset da área.
 *
 * A TABELA DESTA ABA É `clinica` — o caso clínico do animal, com suspeita,
 * sinais e tratamento. É a que responde "o que aconteceu com este rebanho". Não
 * é `manejo`, que é volumosa (uma linha por animal por dia de manejo) e mistura
 * cinco coisas, nem `obito`, que é o desfecho e cabe melhor num card.
 *
 * ⚠️ O QUE ESTA TELA PRECISA DIZER EM VOZ ALTA — e diz, no painel "Como os
 * números de manejo foram contados":
 *
 * `manejo` guarda TAMBÉM os descartes. Não existe tabela `descarte` no banco: um
 * descarte é uma linha de `manejo` cujo array `tipo_manejo` contém 'descarte',
 * com um trigger que inativa o animal. Duas regras OPOSTAS saem daí, e as duas
 * estão certas:
 *
 *   · o card "Manejos" EXCLUI descarte — senão baixa de animal entra como manejo
 *     sanitário e o número infla em até um terço em quem descarta muito;
 *   · FAMACHA e escore corporal INCLUEM as linhas de descarte — uma linha de
 *     descarte que trouxe FAMACHA trouxe uma MEDIÇÃO real daquele animal, e a
 *     média é sobre medições, não sobre eventos.
 *
 * Sem essa frase na tela, o Felipe confere o card contra o app, acha 30 de
 * diferença e para de confiar no painel inteiro — que é um custo muito maior do
 * que o de imprimir a explicação.
 *
 * ⚠️ FAMACHA É ESCALA INVERTIDA: 1 é o animal saudável e 5 é o anêmico grave (o
 * cartão lê a cor da mucosa ocular na verminose). Média SUBINDO é notícia ruim.
 */

const TABELA = 'clinica';

/** Doze meses: a mesma janela dos cards, para o gráfico não contar outra história. */
const MESES = 12;

/** Teto do consolidado — a mesma regra das outras abas da ficha. */
const TETO_CONSOLIDADO = 15;

export default async function SanidadePage({
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
  const [areaRes, tabelaRes] = await Promise.all([
    excedeConsolidado ? Promise.resolve([]) : Promise.all(alvos.map((p) => getSanidade(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const lidas = areaRes.flatMap((r) => (r.ok ? [r.dados] : []));
  // A falha é guardada, não engolida: `adm.propriedade_sanidade` nasce no adm_07,
  // e um banco com o adm_01 rodado e o adm_07 não resolve o escopo normalmente e
  // falha só aqui. Descartar em silêncio desenharia um criador sem sanidade
  // nenhuma — o sintoma exato da divergência de nomes da Fase 1.
  const falha = areaRes.find((r) => !r.ok) ?? null;
  const san = lidas.length > 0 ? consolidarSanidade(lidas) : null;
  const consolidado = alvos.length > 1;

  const escala = san ? escalaFamacha(san) : [];
  const medicoes = san ? medicoesFamacha(san) : 0;
  const criticas = san ? medicoesCriticas(san) : 0;

  return (
    <div className="flex flex-col gap-8">
      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {!san && falha && <EstadoVazio resultado={falha} />}

      {san && falha && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          {formatarInteiro(areaRes.length - lidas.length)} de {formatarInteiro(areaRes.length)}{' '}
          propriedades não puderam ser lidas — os números abaixo somam só as que responderam.
          <span className="mt-1 block text-xs">{falha.ok ? null : falha.detalhe}</span>
        </p>
      )}

      {san && <Cards san={san} consolidado={consolidado} medicoes={medicoes} />}

      {san && <NotaDeManejo usuarioId={usuarioId} selecao={selecao} medicoes={medicoes} />}

      {san && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base">Óbitos por mês · 12 meses</h2>
              <p className="text-xs text-muted-foreground">
                Mês sem óbito é zero de verdade — aqui a lacuna não é ausência de medição.
              </p>
            </div>
            <div className="mt-3">
              <SerieTemporal
                series={[
                  {
                    chave: 'obitos',
                    nome: 'Óbitos',
                    pontos: preencherMeses(san.obitos_mensais ?? [], MESES, agora),
                  },
                ]}
                granularidade="mes"
                buracos="zero"
                formatarValor={(v) => formatarInteiro(v)}
                altura={260}
                mensagemVazia="Nenhum óbito lançado em 12 meses"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Um pico concentrado num mês costuma ser surto ou seca; óbito espalhado o ano todo é
              verminose crônica — e aí a leitura continua na distribuição de FAMACHA abaixo.
            </p>
          </section>

          <Painel
            titulo="FAMACHA · distribuição das medições"
            nota="Escala invertida: 1 é o animal saudável, 5 é o anêmico grave. Ordem de grau, nunca de volume."
          >
            <EscalaFamacha escala={escala} medicoes={medicoes} />
            {medicoes > 0 && (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                {criticas > 0 ? (
                  <>
                    <span className="text-destructive">
                      {formatarInteiro(criticas)} medições em grau {FAMACHA_CRITICO} ou 5
                    </span>{' '}
                    ({formatarPercentual(criticas / medicoes)} das {formatarInteiro(medicoes)}) — é a
                    faixa em que o protocolo manda tratar o animal.
                  </>
                ) : (
                  <>
                    Nenhuma medição em grau {FAMACHA_CRITICO} ou 5 nas{' '}
                    {formatarInteiro(medicoes)} do período.
                  </>
                )}
              </p>
            )}
          </Painel>

          <Painel
            titulo="Principais suspeitas · 12 meses"
            nota="Do catálogo de suspeitas da propriedade, por FK em clinica.suspeita_id. Aqui a ordem por volume É a informação."
          >
            <DistribuicaoBarras
              dados={san.principais_suspeitas ?? []}
              larguraRotulo={168}
              mostrarPercentual
              mensagemVazia="Nenhum caso clínico com suspeita no período"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              As suspeitas dos ÓBITOS ficam de fora: `obito.suspeita` é um array de texto livre que
              casa com o catálogo por nome, e somar as duas fontes contaria duas vezes o animal que
              foi tratado e morreu.
              {consolidado && ' No consolidado o ranking é aproximado — cada fazenda contribui com o top 8 dela.'}
            </p>
          </Painel>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base">Outras tabelas de sanidade</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mesma grade, outro registro do catálogo. Óbitos e Descartes vivem na área Rebanho — o
          evento é baixa de animal —, mas é aqui que a pergunta nasce.
        </p>
        <Chips usuarioId={usuarioId} selecao={selecao} chaves={chavesRelacionadas()} />
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
        titulo="Casos clínicos"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${selecao == null ? '' : `?prop=${selecao}`}`}
      />
    </div>
  );
}

function Cards({
  san,
  consolidado,
  medicoes,
}: {
  san: LinhaSanidade;
  consolidado: boolean;
  medicoes: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Casos clínicos 12 meses"
        valor={formatarInteiro(san.casos_12m)}
        detalhe="uma linha por caso, não por animal"
      />
      <KpiCard
        rotulo="Animais tratados"
        valor={formatarInteiro(san.animais_tratados_12m)}
        detalhe={
          san.casos_12m > 0 && san.animais_tratados_12m > 0
            ? `${formatarNumero(san.casos_12m / san.animais_tratados_12m, 1)} casos por animal tratado`
            : 'distintos, no período'
        }
      />
      <KpiCard rotulo="Óbitos 12 meses" valor={formatarInteiro(san.obitos_12m)} />
      <KpiCard
        rotulo="Taxa de mortalidade"
        valor={consolidado ? VAZIO : formatarPercentual(san.taxa_mortalidade, 1)}
        detalhe={
          consolidado
            ? 'o efetivo vivo não é projetado por fazenda — a taxa do conjunto não se recompõe'
            : 'óbitos ÷ (vivos hoje + óbitos do período): o banco não guarda efetivo histórico'
        }
      />
      <KpiCard
        rotulo="FAMACHA médio"
        valor={formatarNumero(san.famacha_medio, 2)}
        detalhe={detalheFamacha(consolidado, medicoes)}
      />
      <KpiCard
        rotulo="Escore corporal médio"
        valor={consolidado ? VAZIO : formatarNumero(san.escore_corporal_medio, 2)}
        detalhe={
          consolidado
            ? 'média não se soma entre fazendas — e não há histograma de ECC para recompor'
            : 'ECC das medições de manejo'
        }
      />
      <KpiCard
        rotulo="Manejos 12 meses"
        valor={formatarInteiro(san.manejos_12m)}
        detalhe="SEM os descartes — eles vivem na mesma tabela"
      />
      <KpiCard
        rotulo="Sessões coletivas"
        valor={formatarInteiro(san.sessoes_coletivas_12m)}
        detalhe="o dia de manejo do lote inteiro"
      />
    </div>
  );
}

/**
 * Por que o FAMACHA médio continua preenchido no consolidado enquanto o escore
 * corporal e a mortalidade viram "—": a view entrega o HISTOGRAMA das medições
 * de FAMACHA, sobre exatamente a mesma população da média. Somar histogramas e
 * dividir dá a média VERDADEIRA do conjunto — não uma média de médias. Os outros
 * dois não têm histograma nem denominador projetado, então não há o que somar.
 *
 * A assimetria salta aos olhos na tela; sem esta legenda ela parece bug.
 */
function detalheFamacha(consolidado: boolean, medicoes: number): string {
  const escala = '1 saudável → 5 anêmico grave (subir é piorar)';
  if (medicoes === 0) return escala;
  const base = `${formatarInteiro(medicoes)} medições · ${escala}`;
  return consolidado ? `${base} · recalculado do histograma somado` : base;
}

/**
 * O painel que explica o recorte — a peça que faz o número ser confiável em vez
 * de apenas correto.
 *
 * Existe porque `manejo` é a única tabela do banco em que duas contagens
 * legítimas do MESMO dado divergem de propósito, e a divergência não tem
 * sintoma: os dois números são plausíveis. Quem confere o card contra o app sem
 * esta explicação encontra uma diferença e conclui que o painel está errado.
 */
function NotaDeManejo({
  usuarioId,
  selecao,
  medicoes,
}: {
  usuarioId: number;
  selecao: SelecaoPropriedade;
  medicoes: number;
}) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">Como os números de manejo foram contados</h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        Não existe tabela <code className="rounded bg-secondary px-1">descarte</code> no banco do
        app. Um descarte é uma linha de <code className="rounded bg-secondary px-1">manejo</code> com
        &quot;descarte&quot; no array <code className="rounded bg-secondary px-1">tipo_manejo</code>{' '}
        — um trigger inativa o animal. Por isso duas regras opostas convivem nesta tela, e as duas
        estão certas:
      </p>
      <ul className="mt-3 flex max-w-prose flex-col gap-2 text-sm text-muted-foreground">
        <li>
          <span className="text-foreground">O card &quot;Manejos&quot; exclui os descartes.</span>{' '}
          Contá-los junto misturaria baixa de animal com manejo sanitário e inflaria o número em até
          um terço em quem descarta muito.
        </li>
        <li>
          <span className="text-foreground">
            FAMACHA e escore corporal incluem as linhas de descarte.
          </span>{' '}
          Um descarte que registrou FAMACHA registrou uma medição real feita naquele animal, e a
          média é sobre medições — são {formatarInteiro(medicoes)} delas no período.
        </li>
        <li>
          <span className="text-foreground">
            A tabela desta aba é <code className="rounded bg-secondary px-1">clinica</code>, não{' '}
            <code className="rounded bg-secondary px-1">manejo</code>.
          </span>{' '}
          O caso clínico é o que responde &quot;o que aconteceu&quot;; o manejo é o registro de
          rotina, muito mais volumoso.
        </li>
      </ul>
      <ul className="mt-3 flex flex-wrap gap-2">
        <li>
          <Link
            href={`/adm/u/${usuarioId}/tabelas/manejo${sufixo}`}
            className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            title="A tabela crua, com descarte e manejo misturados"
          >
            Manejo (tabela crua, misturada)
          </Link>
        </li>
        <li>
          <Link
            href={`/adm/u/${usuarioId}/tabelas/descarte${sufixo}`}
            className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            title="A mesma tabela com o filtro fixo de tipo_manejo contendo 'descarte'"
          >
            Descartes (recorte isolado)
          </Link>
        </li>
      </ul>
    </section>
  );
}

/**
 * A escala FAMACHA desenhada à mão, e não com <DistribuicaoBarras>.
 *
 * <DistribuicaoBarras> ordena do maior para o menor — é um ranking, e faz bem o
 * que faz. Só que FAMACHA é escala ORDINAL: reordenada por volume, ela para de
 * dizer "o rebanho está concentrado nos graus 1 e 2" e passa a dizer só "o grau
 * 2 é o mais comum", que é a informação menos útil das duas. Mesma decisão que a
 * faixa etária da aba Rebanho e o funil da aba Reprodução.
 *
 * O grau com zero medição continua na lista: um gráfico que esconde o grau 5
 * vazio mente sobre a escala — o leitor não sabe se ninguém está anêmico ou se a
 * barra não coube.
 */
function EscalaFamacha({ escala, medicoes }: { escala: GrauFamacha[]; medicoes: number }) {
  if (medicoes === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma medição de FAMACHA em 12 meses. O cartão é o exame de campo mais barato contra
        verminose — cliente que não mede é cliente que só descobre a anemia no óbito.
      </p>
    );
  }

  const maior = escala.reduce((acc, g) => Math.max(acc, g.medicoes), 0);

  return (
    <ul className="flex flex-col gap-1.5">
      {escala.map((grau) => (
        <li key={grau.grau} className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">
            Grau {grau.rotulo}
            {grau.grau === 1 && <span className="ms-1 text-xs">saudável</span>}
            {grau.grau === 5 && <span className="ms-1 text-xs">grave</span>}
          </span>
          <span className="h-2.5 rounded-full bg-secondary" aria-hidden>
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${maior > 0 ? (grau.medicoes / maior) * 100 : 0}%` }}
            />
          </span>
          <span
            className={
              grau.critico && grau.medicoes > 0
                ? 'text-right tabular-nums text-destructive'
                : 'text-right tabular-nums text-foreground'
            }
          >
            {formatarInteiro(grau.medicoes)}
            <span className="ms-1 text-xs text-muted-foreground">
              {formatarPercentual(grau.fracao)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * As tabelas que a aba não desenha mas a pergunta alcança. `obito` e `descarte`
 * são declarados na área Rebanho (o evento é baixa de animal) e entram aqui à
 * mão: o critério da lista é a PERGUNTA do operador, não o agrupamento do
 * catálogo. Um filtro só por `area === 'Sanidade'` deixaria o óbito fora
 * justamente da aba que mostra a taxa de mortalidade.
 */
function chavesRelacionadas(): string[] {
  const daArea = listarRegistros()
    .filter((r) => r.area === 'Sanidade' && r.nome !== TABELA)
    .map(chaveRota);
  return [...daArea, 'obito', 'descarte'];
}

function Chips({
  usuarioId,
  selecao,
  chaves,
}: {
  usuarioId: number;
  selecao: SelecaoPropriedade;
  chaves: string[];
}) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {chaves.map((chave) => {
        const registro = getRegistro(chave);
        if (!registro) return null;
        return (
          <li key={chave}>
            <Link
              href={`/adm/u/${usuarioId}/tabelas/${chave}${sufixo}`}
              className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              title={registro.descricao}
            >
              {registro.rotulo}
            </Link>
          </li>
        );
      })}
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
