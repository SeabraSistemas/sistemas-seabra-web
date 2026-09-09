import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotaoCopiar } from '@/components/adm/BotaoCopiar';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  CURVA_COBERTURAS,
  CURVA_PARTOS,
  DG_LIMIARES_RAPIDOS,
  DG_LIMIAR_PADRAO,
  agruparDgPendentes,
  consolidarReproducao,
  curvaMensal,
  etapasDoFunil,
  funilInvertido,
  getReproducao,
  textoWhatsAppDgPendentes,
  type EtapaFunil,
  type GrupoDgPendente,
} from '@/lib/adm/areas/reproducao';
import { idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import { preencherMeses } from '@/lib/adm/metricas';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { LinhaReproducao } from '@/lib/adm/areas/contrato';

/**
 * Aba 4 — Reprodução. Irmã de Rebanho e Produção: cards em cima, gráficos no
 * meio, a mesma <TabelaGenerica> do escape hatch embaixo com o preset da área.
 * Nenhuma linha de código de tabela é escrita aqui.
 *
 * A TABELA DESTA ABA É `diagnostico_gestacao`, e não uma das quatro de cobertura.
 * Reprodução tem sete tabelas e nenhuma delas conta a história sozinha: monta
 * controlada, monta livre, inseminação e TE registram a INTENÇÃO (cobriu), e o
 * diagnóstico registra o DESFECHO (emprenhou ou não). Quem audita um cliente
 * quer ver o desfecho — "cobriu 180 e não sei o que deu" é a pergunta, não a
 * resposta. As outras seis ficam a um clique, nos atalhos.
 *
 * ⚠️ NÃO EXISTE TABELA DE PARTO no banco. O parto é o INSERT das crias em
 * `rebanho` com `mae_id`; a view conta pares distintos (mãe, dia de nascimento),
 * então uma ninhada de três crias no mesmo dia é UM parto. A definição aparece
 * embaixo do card porque, sem ela, "42 partos" é um número que ninguém consegue
 * conferir contra o app.
 *
 * A JANELA É FIXA EM 12 MESES nos dois gráficos — e o mês sem evento é desenhado
 * como ZERO, ao contrário da série de litros da aba Produção. A diferença é real
 * e vale a divergência: um dia sem lançar produção não é um dia de zero litro (o
 * tanque encheu, ninguém anotou), mas um mês sem cobertura lançada é um mês com
 * zero coberturas lançadas — e é exatamente essa a informação que o consultor
 * precisa ver, porque o vale no gráfico é o mês em que o cliente parou de usar o
 * módulo.
 */

const TABELA = 'diagnostico_gestacao';

/** Doze meses: a mesma janela dos cards, para o gráfico não contar outra história. */
const MESES = 12;

/**
 * Teto do consolidado — a mesma regra das abas Visão geral, Rebanho e Produção.
 * Cada propriedade custa uma leitura da view de área, e o admin geral alcança
 * todas as 31. Acima disso a aba pede uma escolha em vez de travar; a tabela
 * abaixo continua valendo, porque ela é UMA consulta com `IN (ids)` seja qual
 * for o tamanho do escopo.
 */
const TETO_CONSOLIDADO = 15;

export default async function ReproducaoPage({
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
  const limiarDg = lerLimiarDg(sp.dg);

  const registro = getRegistro(TABELA);
  if (!registro) notFound();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  // ALLOWLIST antes de qualquer coisa: `?cols=` é texto de fora e só vira
  // projeção depois de passar pelo catálogo.
  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);
  // Orçamento de CÉLULAS, não de linhas: é o payload RSC que trava a aba.
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;
  const [areaRes, tabelaRes] = await Promise.all([
    excedeConsolidado ? Promise.resolve([]) : Promise.all(alvos.map((p) => getReproducao(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const lidas = areaRes.flatMap((r) => (r.ok ? [r.dados] : []));
  // A PRIMEIRA FALHA É GUARDADA, não descartada. `adm.propriedade_reproducao`
  // nasce no adm_07 — um painel com o adm_01 rodado e o adm_07 não devolve
  // escopo normalmente e falha SÓ aqui. Engolir isso desenharia um criador sem
  // reprodução nenhuma, que é o sintoma exato da divergência de nomes da Fase 1.
  const falha = areaRes.find((r) => !r.ok) ?? null;
  const rep = lidas.length > 0 ? consolidarReproducao(lidas) : null;
  const consolidado = alvos.length > 1;

  const funil = rep ? etapasDoFunil(rep) : [];
  const invertido = funil.length > 0 && funilInvertido(funil);

  return (
    <div className="flex flex-col gap-8">
      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {!rep && falha && <EstadoVazio resultado={falha} />}

      {rep && falha && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          {formatarInteiro(areaRes.length - lidas.length)} de {formatarInteiro(areaRes.length)}{' '}
          propriedades não puderam ser lidas — os números abaixo somam só as que responderam.
          <span className="mt-1 block text-xs">{falha.ok ? null : falha.detalhe}</span>
        </p>
      )}

      {rep && <Cards rep={rep} consolidado={consolidado} />}

      {rep && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Painel
            titulo="Funil reprodutivo · 12 meses"
            nota="Cobriu → diagnosticou → deu positivo → pariu. A porcentagem é a passagem em relação à etapa anterior."
          >
            <Funil etapas={funil} />
            {invertido && (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="text-destructive">Funil invertido:</span> alguma etapa está acima da
                anterior, o que é impossível como biologia e comum como preenchimento. O app EXIGE o
                nascimento (a cria precisa existir no rebanho) e não exige a cobertura nem o
                diagnóstico — o cliente registra a cria e não lança o que veio antes dela. É
                treinamento a oferecer, não rebanho ruim.
              </p>
            )}
            {rep.diagnosticos_12m === 0 && rep.coberturas_12m > 0 && (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                Nenhum diagnóstico de gestação em 12 meses. Sem DG não existe taxa de prenhez — e a
                fêmea vazia só aparece na conta quando não pare, meses depois de comer como uma
                prenha.
              </p>
            )}
          </Painel>

          <Painel
            titulo="Composição das coberturas · 12 meses"
            nota="Como o topo do funil se reparte entre os três métodos que o app registra."
          >
            <DistribuicaoBarras
              dados={[
                { rotulo: 'Monta (controlada + livre)', valor: rep.montas_12m },
                { rotulo: 'Inseminação artificial', valor: rep.inseminacoes_12m },
                { rotulo: 'Transferência de embrião', valor: rep.te_12m },
              ]}
              larguraRotulo={168}
              mostrarPercentual
              mensagemVazia="Nenhuma cobertura lançada em 12 meses"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Monta livre registra a ENTRADA do reprodutor no lote, não a cobertura de cada fêmea —
              por isso ela prevê o parto como janela e não como dia.
            </p>
          </Painel>

          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base">Coberturas e partos · mês a mês</h2>
              <p className="text-xs text-muted-foreground">
                As duas curvas defasadas ~5 meses são o ciclo funcionando; sobrepostas, é lançamento
                retroativo.
              </p>
            </div>
            <div className="mt-3">
              <SerieTemporal
                series={[
                  {
                    chave: CURVA_COBERTURAS,
                    nome: 'Coberturas',
                    pontos: preencherMeses(curvaMensal(rep, CURVA_COBERTURAS), MESES, agora),
                  },
                  {
                    chave: CURVA_PARTOS,
                    nome: 'Partos',
                    pontos: preencherMeses(curvaMensal(rep, CURVA_PARTOS), MESES, agora),
                  },
                ]}
                granularidade="mes"
                buracos="zero"
                formato="inteiro"
                altura={280}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              A gestação da cabra dura ~150 dias: a curva de partos é a de coberturas empurrada cinco
              meses para a direita. Mês sem lançamento aparece como zero — diferente da série de
              litros, onde a lacuna fica aberta de propósito.
            </p>
          </section>
        </div>
      )}

      {rep && (
        <DiagnosticoGestacaoPendente rep={rep} limiarDg={limiarDg} usuarioId={usuarioId} selecao={selecao} />
      )}

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base">Outras tabelas de reprodução</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Mesma grade, outro registro do catálogo — as quatro formas de cobertura, abortos e o plano
          de acasalamento.
        </p>
        <TabelasDaArea usuarioId={usuarioId} area="Reprodução" exceto={TABELA} selecao={selecao} />
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
        titulo="Diagnósticos de gestação"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${selecao == null ? '' : `?prop=${selecao}`}`}
      />
    </div>
  );
}

function Cards({ rep, consolidado }: { rep: LinhaReproducao; consolidado: boolean }) {
  // Uma frase só, reusada: no consolidado toda média some, e o motivo precisa
  // aparecer no card — um "—" sem explicação vira "o painel está quebrado".
  const semMedia = consolidado ? 'média não se soma entre fazendas' : undefined;
  const meses = (dias: number | null) => (dias === null ? null : dias / 30.44);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Coberturas 12 meses"
        valor={formatarInteiro(rep.coberturas_12m)}
        detalhe="montas + inseminações + TE"
      />
      <KpiCard
        rotulo="Taxa de prenhez"
        valor={formatarPercentual(rep.taxa_prenhez)}
        detalhe={
          rep.diagnosticos_12m === 0
            ? 'sem diagnóstico no período — não é 0%, é sem base'
            : `${formatarInteiro(rep.diagnosticos_positivos_12m)} positivos de ${formatarInteiro(rep.diagnosticos_12m)} DG`
        }
      />
      <KpiCard
        rotulo="Partos 12 meses"
        valor={formatarInteiro(rep.partos_12m)}
        detalhe="pares (mãe, dia): a ninhada inteira é um parto"
      />
      <KpiCard
        rotulo="Abortos 12 meses"
        valor={formatarInteiro(rep.abortos_12m)}
        detalhe="o outro desfecho da gestação"
      />
      <KpiCard
        rotulo="Idade ao 1º parto"
        valor={consolidado ? VAZIO : formatarDias(rep.idade_primeiro_parto_dias)}
        detalhe={semMedia ?? `≈ ${formatarNumero(meses(rep.idade_primeiro_parto_dias), 1)} meses`}
      />
      <KpiCard
        rotulo="Prolificidade"
        valor={consolidado ? VAZIO : formatarNumero(rep.prolificidade_media, 2)}
        detalhe={semMedia ?? 'crias por parto, mantida por trigger no app'}
      />
      <KpiCard
        rotulo="Intervalo entre partos"
        valor={consolidado ? VAZIO : formatarDias(rep.intervalo_partos_dias)}
        detalhe={semMedia ?? 'partos consecutivos da mesma mãe, entre 90 e 730 dias'}
      />
      <KpiCard
        rotulo="Gestantes agora"
        valor={formatarInteiro(rep.gestantes)}
        detalhe={`de ${formatarInteiro(rep.femeas_ativas)} fêmeas ativas`}
      />
    </div>
  );
}

/** Dias com a unidade colada — sem ela o card fica com dois números iguais
 *  (IPP e IPP em meses) sem dizer qual é qual. */
function formatarDias(dias: number | null): string {
  return dias === null ? VAZIO : `${formatarInteiro(dias)} d`;
}

/** `?dg=` é texto de fora: só vira número depois de validado, e cai no padrão
 *  para qualquer coisa que não seja um inteiro razoável (o teto da view já é
 *  155, então nada acima disso faz sentido como piso). */
function lerLimiarDg(bruto: string | string[] | undefined): number {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  const numero = Number.parseInt(valor ?? '', 10);
  return Number.isFinite(numero) && numero >= 0 && numero <= 155 ? numero : DG_LIMIAR_PADRAO;
}

/**
 * Lista de ação da aba: fêmeas cobertas sem DG lançado, agrupadas por baia —
 * igual ao painel "Diagnóstico de Gestação (60D+)" do app GAS que inspirou esta
 * seção, mas sem heurística de planilha: `dg_pendentes` já vem certo da view,
 * cruzando as quatro tabelas de cobertura com `diagnostico_gestacao`.
 *
 * O LIMIAR (`?dg=`) é piso, não filtro de UI client-side: trocar de 45 para 60
 * dias é outra URL, então a lista renderizada e o texto do WhatsApp SEMPRE
 * concordam — não tem como copiar um texto diferente do que a tela mostra.
 */
function DiagnosticoGestacaoPendente({
  rep,
  limiarDg,
  usuarioId,
  selecao,
}: {
  rep: LinhaReproducao;
  limiarDg: number;
  usuarioId: number;
  selecao: SelecaoPropriedade;
}) {
  const grupos = agruparDgPendentes(rep, limiarDg);
  const total = grupos.reduce((acc, g) => acc + g.animais.length, 0);
  const totalSemFiltro = rep.dg_pendentes?.length ?? 0;

  const sufixoProp = selecao == null ? '' : `prop=${selecao}&`;
  const linkLimiar = (dias: number) => `?${sufixoProp}dg=${dias}`;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Diagnóstico de gestação pendente</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cobriu, e ainda não tem DG lançado depois da cobertura — até 155 dias, o limite biológico
            da gestação. Acima disso já não é atraso de lançamento, é outro problema.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {DG_LIMIARES_RAPIDOS.map((dias) => (
            <Link
              key={dias}
              href={linkLimiar(dias)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                dias === limiarDg
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {dias} dias
            </Link>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {totalSemFiltro === 0
            ? 'Nenhuma fêmea coberta sem DG no momento.'
            : `Nenhuma pendência com ${formatarInteiro(limiarDg)}+ dias — mas há ${formatarInteiro(totalSemFiltro)} coberturas mais recentes ainda sem DG.`}
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {formatarInteiro(total)} fêmeas em {formatarInteiro(grupos.length)}{' '}
              {grupos.length === 1 ? 'baia' : 'baias'}
            </p>
            <BotaoCopiar texto={textoWhatsAppDgPendentes(grupos, limiarDg)} rotulo="Copiar para WhatsApp" />
          </div>

          <div className="mt-3 flex flex-col gap-4">
            {grupos.map((grupo) => (
              <GrupoBaia key={grupo.baia} grupo={grupo} />
            ))}
          </div>
        </>
      )}

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para ver o histórico completo, abra a{' '}
        <a
          href={`/adm/u/${usuarioId}/tabelas/diagnostico_gestacao${selecao == null ? '' : `?prop=${selecao}`}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de diagnósticos
        </a>
        .
      </p>
    </section>
  );
}

function GrupoBaia({ grupo }: { grupo: GrupoDgPendente }) {
  return (
    <div>
      <h3 className="text-sm text-muted-foreground">
        {grupo.baia} <span className="tabular-nums">· {formatarInteiro(grupo.animais.length)}</span>
      </h3>
      <ol className="mt-1 flex flex-col divide-y divide-border">
        {grupo.animais.map((animal) => (
          <li
            key={`${animal.numero_animal}-${animal.data_ultima_cobertura}`}
            className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-foreground">
                {animal.nome_animal?.trim() || animal.numero_animal}
              </span>
              {animal.nome_animal?.trim() && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {animal.numero_animal}
                </span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatarInteiro(animal.dias_desde_cobertura)} d · {animal.tipo_cobertura}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * O funil, desenhado à mão em vez de com <DistribuicaoBarras>.
 *
 * Não é preciosismo: a <DistribuicaoBarras> ordena do maior para o menor (é um
 * RANKING, e faz bem o que faz), e a informação inteira de um funil é a ORDEM
 * das etapas. Um funil reordenado por volume continua bonito, continua correto
 * em cada barra, e diz outra coisa — é o mesmo motivo que fez a aba Rebanho
 * desenhar a faixa etária à mão.
 *
 * A largura é relativa ao TOPO, e não ao maior valor: é o que faz o afunilamento
 * aparecer como afunilamento. Com clamp em 100%, porque partos podem passar as
 * coberturas quando o cliente lança o nascimento e não a cobertura — e aí a
 * barra estourando o card esconderia o aviso em vez de destacá-lo.
 */
function Funil({ etapas }: { etapas: EtapaFunil[] }) {
  const total = etapas.reduce((acc, e) => acc + e.valor, 0);
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum evento reprodutivo em 12 meses.</p>;
  }

  const topo = etapas[0]?.valor ?? 0;

  return (
    <ol className="flex flex-col gap-2">
      {etapas.map((etapa, i) => (
        <li key={etapa.rotulo} className="grid grid-cols-[7rem_1fr_6.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{etapa.rotulo}</span>
          <span className="h-3 rounded-full bg-secondary" aria-hidden>
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${topo > 0 ? Math.min(100, (etapa.valor / topo) * 100) : 0}%` }}
            />
          </span>
          <span className="text-right tabular-nums text-foreground">
            {formatarInteiro(etapa.valor)}
            {i > 0 && (
              <span
                className={
                  etapa.conversao !== null && etapa.conversao > 1
                    ? 'ms-1 text-xs text-destructive'
                    : 'ms-1 text-xs text-muted-foreground'
                }
                title={`Passagem de ${etapas[i - 1].rotulo} para ${etapa.rotulo}`}
              >
                {etapa.conversao === null ? VAZIO : formatarPercentual(etapa.conversao)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
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
    <ul className="mt-3 flex flex-wrap gap-2">
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
