import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { DistribuicaoDonut } from '@/components/adm/charts/DistribuicaoDonut';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { animaisDoEscopo, escopoConsolidado, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarDiasRelativo,
  formatarInteiro,
  formatarLitros,
  formatarNumero,
  formatarTelefone,
} from '@/lib/adm/format';
import {
  calcularHealthScore,
  COBRANCA_DETALHE,
  COBRANCA_NORM,
  consolidarVisoes,
  faixaDeScore,
  interpolar,
  METAS_HEALTH,
  PESOS_HEALTH,
  type EstadoCobranca,
} from '@/lib/adm/metricas';
import { getEscopo, getVisaoGeral } from '@/lib/adm/queries';
import { SEGMENTO_ROTULO, type ComponenteHealth, type Escopo, type FatiaDistribuicao, type UsuarioLista, type VisaoGeralPropriedade } from '@/lib/adm/types';

/**
 * Aba 1 — Visão geral. A tela que responde "como está este cliente" antes de
 * qualquer detalhe: quanto rebanho, quanto leite, há quanto tempo lança, e o
 * porquê do health score.
 *
 * O DETALHAMENTO DO SCORE não é enfeite de dashboard. Um score sem explicação
 * vira superstição: na primeira divergência com a intuição do Felipe, ele para
 * de confiar no número e o painel perde a única métrica que ordena a carteira
 * por urgência. Aqui os 5 componentes aparecem com peso, meta e valor cru.
 *
 * CONSOLIDADO SOMA O QUE SOMA, e só isso. Para o técnico com carteira, os
 * totais (animais, litros, lançamentos) somam entre fazendas; as MÉDIAS não —
 * média de médias é um número que parece certo e não é de ninguém. DEL médio e
 * média por lactante ficam vazios com a explicação, em vez de errados.
 */

/**
 * Teto do consolidado. Cada propriedade custa 3 idas ao banco (cards,
 * distribuições e série), então o admin geral — que alcança TODAS as 31 — abriria
 * quase uma centena de consultas em paralelo para desenhar uma tela que ninguém
 * lê somada. Acima do teto a aba pede uma escolha, em vez de travar: a visão
 * agregada do negócio inteiro é a /adm/carteira, não a ficha de um usuário.
 *
 * O número cobre com folga o caso real que a consolidação existe para servir: o
 * técnico com carteira, cujo plano mais caro (Pro) permite 15 propriedades.
 */
const TETO_CONSOLIDADO = 15;

export default async function VisaoGeralPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const usuarioId = Number(id);
  const selecao = lerSelecaoParam((await searchParams).prop);

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;
  const visoesRes = excedeConsolidado
    ? []
    : await Promise.all(alvos.map((p) => getVisaoGeral(p.id)));
  const visoes = visoesRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = visoesRes.filter((r) => !r.ok).length;

  const consolidado = escopoConsolidado(escopo);
  const visao = visoes.length > 0 ? consolidarVisoes(visoes) : null;

  return (
    <div className="flex flex-col gap-8">
      <Identificacao escopo={escopo} />

      {excedeConsolidado && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para consolidar numa tela só. Escolha uma fazenda no seletor
          acima; o retrato do negócio inteiro é a carteira.
        </p>
      )}

      {alvos.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Sem propriedade no escopo — não há rebanho nem produção para mostrar. A aba Assinatura
          continua valendo: ela é por conta, não por fazenda.
        </p>
      ) : excedeConsolidado ? null : (
        visao && (
          <>
            {falhas > 0 && (
              <p className="text-sm text-destructive">
                {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não
                carregaram — os números abaixo são só das que responderam.
              </p>
            )}

            <Cards
              visao={visao}
              consolidado={consolidado}
              base={`/adm/u/${usuarioId}`}
              sufixo={sufixoDeProp(selecao)}
            />

            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">Produção diária · 90 dias</h2>
                <p className="text-xs text-muted-foreground">
                  Dia sem lançamento fica como buraco, não como zero: não medir não é produzir nada.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <SerieTemporal
                  series={[{ chave: 'producao', nome: 'Litros do tanque', pontos: visao.producaoDiaria90d }]}
                  granularidade="dia"
                  buracos="vazio"
                  formatarValor={(v) => formatarLitros(v, 0)}
                />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <Painel titulo="Rebanho por categoria">
                <DistribuicaoDonut dados={visao.porCategoria} rotuloTotal="animais ativos" />
              </Painel>
              <Painel titulo="Rebanho por raça">
                <DistribuicaoBarras dados={visao.porRaca} mostrarPercentual />
              </Painel>
            </div>

            <Painel
              titulo="Distribuição etária"
              nota="Em ordem cronológica, não por volume — ordenada por contagem, uma pirâmide deixa de ser pirâmide."
            >
              <FaixasEtarias faixas={visao.piramideEtaria} />
            </Painel>
          </>
        )
      )}

      <Saude usuario={escopo.usuario} />

      <Atalhos usuarioId={usuarioId} selecao={selecao} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────────────

function Cards({
  visao,
  consolidado,
  base,
  sufixo,
}: {
  visao: VisaoGeralPropriedade;
  consolidado: boolean;
  base: string;
  sufixo: string;
}) {
  // A média só existe por fazenda. No consolidado ela vira VAZIO com o motivo
  // escrito — um traço explicado vale mais que um número que ninguém defende.
  const semMedia = consolidado ? 'média não se soma entre fazendas' : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Animais ativos"
        valor={formatarInteiro(visao.animaisAtivos)}
        href={`${base}/rebanho${sufixo}`}
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(visao.femeas)} · ${formatarInteiro(visao.machos)}`}
        href={`${base}/rebanho${sufixo}`}
      />
      <KpiCard rotulo="Em lactação" valor={formatarInteiro(visao.lactantes)} />
      <KpiCard rotulo="Gestantes" valor={formatarInteiro(visao.gestantes)} />

      <KpiCard
        rotulo="Produção 30 dias"
        valor={formatarLitros(visao.producao30d, 0)}
        href={`${base}/producao${sufixo}`}
      />
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
      <KpiCard
        rotulo="DEL médio"
        valor={consolidado ? VAZIO : formatarNumero(visao.mediaDel, 0)}
        detalhe={semMedia ?? 'dias em lactação'}
      />

      <KpiCard rotulo="Lançamentos 30 dias" valor={formatarInteiro(visao.lancamentos30d)} />
      <KpiCard
        rotulo="Sem lançar"
        valor={formatarDiasRelativo(visao.diasSemLancar)}
        detalhe="qualquer módulo — o sinal de vida da conta (D2)"
      />
      <KpiCard rotulo="Colaboradores" valor={formatarInteiro(visao.colaboradores)} />
      <KpiCard rotulo="Técnicos vinculados" valor={formatarInteiro(visao.tecnicosVinculados)} />
    </div>
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

/**
 * Faixas etárias em ordem cronológica. Não usa <DistribuicaoBarras> de propósito:
 * aquele componente ordena do maior para o menor (é um ranking, e faz bem o que
 * faz), e uma distribuição etária reordenada por contagem perde justamente a
 * informação que ela carrega — a forma da curva de reposição do rebanho.
 */
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
            <span className="ms-1 text-xs text-muted-foreground">
              {Math.round((faixa.valor / total) * 100)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Identificação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O bloco de contato. Os valores chegam MASCARADOS da view `adm.usuarios_lista`
 * — a máscara é feita em SQL, nunca aqui. Se fosse no React, o e-mail cru já
 * teria viajado no payload RSC e estaria no DevTools: máscara decorativa.
 * O CPF nunca aparece, só `tem_cpf`.
 */
function Identificacao({ escopo }: { escopo: Escopo }) {
  const u = escopo.usuario;
  const itens: { rotulo: string; valor: string }[] = [
    { rotulo: 'E-mail', valor: u.email_mascarado ?? VAZIO },
    { rotulo: 'WhatsApp', valor: formatarTelefone(u.whatsapp_mascarado, u.whatsapp_pais) },
    { rotulo: 'Associação', valor: u.associacao_nome ?? VAZIO },
    { rotulo: 'Cadastro', valor: formatarData(u.data_cadastro) },
    { rotulo: 'CPF', valor: u.tem_cpf ? 'cadastrado' : 'não cadastrado' },
    { rotulo: 'Propriedades', valor: formatarInteiro(u.total_propriedades) },
    { rotulo: 'Animais no escopo', valor: formatarInteiro(animaisDoEscopo(escopo)) },
    {
      rotulo: 'Segmentos',
      valor:
        escopo.selecionada && escopo.selecionada.segmentos.length > 0
          ? escopo.selecionada.segmentos.map((s) => SEGMENTO_ROTULO[s] ?? s).join(', ')
          : VAZIO,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 sm:grid-cols-4">
      {itens.map((item) => (
        <div key={item.rotulo}>
          <dt className="text-xs text-muted-foreground">{item.rotulo}</dt>
          <dd className="truncate text-sm text-foreground" title={item.valor}>
            {item.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Health score
// ─────────────────────────────────────────────────────────────────────────────

/**
 * As linhas do explicador. Derivam de `ComponenteHealth` (chave, rótulo, peso vêm
 * do contrato) e acrescentam o que a tela precisa e o contrato não tem: a META de
 * cada componente e a possibilidade de `norm` ser DESCONHECIDA.
 *
 * Por que desconhecida: o score inteiro é calculado em SQL, sobre
 * `adm.atividade_propriedade`, e agregado entre propriedades pela MEDIANA. Dois
 * componentes se reconstroem exatamente com o que a view projeta (recência e
 * cobrança); os outros três dependem de colunas que ficam dentro da view
 * (`dias_distintos_30d`, `modulos_90d`, `animais_com_evento_90d`).
 *
 * Recalcular esses três por aproximação aqui seria pior que não mostrar: a barra
 * explicaria um número diferente do que ordenou a lista mestra, e a primeira
 * divergência derruba a confiança no score inteiro. Então o total exibido é
 * SEMPRE o da view, e o que não dá para reconstruir se declara como tal.
 */
interface LinhaHealth extends Pick<ComponenteHealth, 'chave' | 'rotulo' | 'peso'> {
  /** 0..1 quando reconstruível a partir do que a view projeta; null quando não. */
  norm: number | null;
  /** O valor cru disponível nesta camada. */
  detalhe: string;
  /** O que vale 100 neste componente. */
  meta: string;
}

const CLASSE_FAIXA = {
  saudavel: 'text-emerald-300',
  atencao: 'text-amber-300',
  risco: 'text-destructive',
} as const;

function Saude({ usuario }: { usuario: UsuarioLista }) {
  const linhas = componentesHealth(usuario);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Health score</h2>
        {usuario.health_score !== null ? (
          <p className="text-sm text-muted-foreground">
            <span
              className={`text-2xl tabular-nums ${CLASSE_FAIXA[faixaDeScore(usuario.health_score)]}`}
            >
              {formatarInteiro(usuario.health_score)}
            </span>
            <span className="ms-1">/ 100</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">sem score</p>
        )}
      </div>

      {usuario.health_score === null && (
        <p className="mt-2 text-sm text-muted-foreground">
          A view não pontua conta com menos de 14 dias de cadastro, sem animal vivo, ou sem
          assinatura própria (o colaborador herda o acesso do produtor dono). &quot;Sem score&quot;
          é diferente de score baixo — nenhuma dessas contas é risco de churn.
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2.5">
        {linhas.map((linha) => (
          <li key={linha.chave} className="grid grid-cols-[9rem_1fr] items-start gap-3 text-sm">
            <div>
              <p className="text-foreground">{linha.rotulo}</p>
              <p className="text-xs tabular-nums text-muted-foreground">peso {linha.peso}</p>
            </div>
            <div>
              <div className="flex h-2.5 items-center gap-2">
                <span className="h-2.5 flex-1 rounded-full bg-secondary" aria-hidden>
                  {linha.norm !== null && (
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(linha.norm * 100)}%` }}
                    />
                  )}
                </span>
                <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {linha.norm === null
                    ? 'só em SQL'
                    : `${formatarNumero(linha.norm * linha.peso, 0)} / ${linha.peso}`}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {linha.detalhe} <span aria-hidden>·</span> meta: {linha.meta}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        As parcelas vêm de <code>adm.atividade_propriedade</code>, agregadas para a conta e
        normalizadas por <code>calcularHealthScore()</code> — a MESMA função que os testes cobrem,
        com as MESMAS constantes que o SQL usa. O número grande continua sendo o da view, que é o
        que ordena &quot;quem está em risco&quot; na lista mestra: se ele e a soma das parcelas
        discordarem, é sinal de que a fórmula do SQL e a do TypeScript saíram de sincronia.
      </p>
    </section>
  );
}

/**
 * As normas dos três componentes de USO, tiradas de `calcularHealthScore()`.
 *
 * Por que passar pela função em vez de interpolar aqui: ela é a única
 * implementação testada da fórmula (56 casos em metricas.test.ts), e antes
 * desta mudança ela era CÓDIGO MORTO — a tela reconstruía dois componentes à
 * mão e deixava três sem valor, porque a view não projetava as entradas. Agora
 * projeta, e a fórmula tem um dono só.
 *
 * A cobrança continua vindo de `COBRANCA_NORM` direto: o estado dela é derivado
 * das bandeiras da conta, não das janelas de atividade.
 */
function normaDe(u: UsuarioLista): { frequencia: number; amplitude: number; profundidade: number } {
  const score = calcularHealthScore({
    diasSemLancar: u.dias_sem_lancar,
    diasComLancamento30d: u.dias_distintos_30d,
    modulos90d: u.modulos_90d,
    cobranca: estadoDeCobranca(u),
    animaisComEvento90d: u.animais_com_evento_90d,
    animaisVivos: u.animais_ativos,
  });
  const norma = (chave: ComponenteHealth['chave']) =>
    score.componentes.find((c) => c.chave === chave)?.norm ?? 0;
  return {
    frequencia: norma('frequencia'),
    amplitude: norma('amplitude'),
    profundidade: norma('profundidade'),
  };
}

function componentesHealth(u: UsuarioLista): LinhaHealth[] {
  const cobranca = estadoDeCobranca(u);

  return [
    {
      chave: 'recencia',
      rotulo: 'Recência',
      peso: PESOS_HEALTH.recencia,
      norm: interpolar(u.dias_sem_lancar, METAS_HEALTH.recenciaPior, METAS_HEALTH.recenciaMelhor),
      detalhe: u.ultimo_lancamento_em
        ? `último lançamento ${formatarDiasRelativo(u.dias_sem_lancar)}${u.ultimo_modulo ? ` em ${u.ultimo_modulo}` : ''}`
        : 'nunca lançou',
      meta: `zero em ≥${METAS_HEALTH.recenciaPior} dias, cheio em ≤${METAS_HEALTH.recenciaMelhor} dias`,
    },
    {
      chave: 'frequencia',
      rotulo: 'Frequência 30d',
      peso: PESOS_HEALTH.frequencia,
      norm: normaDe(u).frequencia,
      detalhe: `${formatarInteiro(u.dias_distintos_30d)} dias distintos com lançamento (${formatarInteiro(u.lancamentos_30d)} lançamentos)`,
      meta: `${METAS_HEALTH.frequenciaMeta} dias DISTINTOS com lançamento`,
    },
    {
      chave: 'amplitude',
      rotulo: 'Amplitude 90d',
      peso: PESOS_HEALTH.amplitude,
      norm: normaDe(u).amplitude,
      detalhe: `${formatarInteiro(u.modulos_90d)} de 8 módulos em 90 dias${u.ultimo_modulo ? ` · mais recente: ${u.ultimo_modulo}` : ''}`,
      meta: `${METAS_HEALTH.amplitudeMeta} dos 8 módulos de trabalho diário`,
    },
    {
      chave: 'cobranca',
      rotulo: 'Cobrança',
      peso: PESOS_HEALTH.cobranca,
      norm: COBRANCA_NORM[cobranca],
      detalhe: COBRANCA_DETALHE[cobranca],
      meta: 'escada fixa — cortesia vale cheio, pagamento vencido vale 0,3',
    },
    {
      chave: 'profundidade',
      rotulo: 'Profundidade',
      peso: PESOS_HEALTH.profundidade,
      norm: normaDe(u).profundidade,
      detalhe: `${formatarInteiro(u.animais_com_evento_90d)} de ${formatarInteiro(u.animais_ativos)} animais com evento em 90 dias`,
      meta: `${Math.round(METAS_HEALTH.profundidadeMeta * 100)}% do rebanho com evento em 90 dias`,
    },
  ];
}

/**
 * A mesma escada da view, reconstruída do que a lista mestra projeta. A única
 * aproximação está no degrau do inadimplente: a view lê `assinatura_normalizada.
 * inadimplente`, que não vem na lista, e aqui o proxy é `status_efetivo` em
 * 'pendente' ou 'vencida' com acesso ainda ativo — que é exatamente o estado que
 * aquele campo marca.
 */
function estadoDeCobranca(u: UsuarioLista): EstadoCobranca {
  if (u.origem_acesso === 'cortesia') return 'cortesia';
  if (u.origem_acesso === 'extensao') return 'so-extensao';
  if (!u.acesso_ativo) return 'sem-acesso';
  if (u.status_efetivo === 'pendente' || u.status_efetivo === 'vencida') return 'inadimplente';
  return 'em-dia';
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação
// ─────────────────────────────────────────────────────────────────────────────




// ─────────────────────────────────────────────────────────────────────────────
// Rodapé e utilidades
// ─────────────────────────────────────────────────────────────────────────────

function Atalhos({ usuarioId, selecao }: { usuarioId: number; selecao: SelecaoPropriedade }) {
  const sufixo = sufixoDeProp(selecao);
  const atalhos = [
    { href: `/adm/u/${usuarioId}/rebanho${sufixo}`, rotulo: 'Rebanho completo' },
    { href: `/adm/u/${usuarioId}/producao${sufixo}`, rotulo: 'Produção de leite' },
    { href: `/adm/u/${usuarioId}/assinatura`, rotulo: 'Assinatura e cobrança' },
    { href: `/adm/u/${usuarioId}/tabelas${sufixo}`, rotulo: 'Todas as tabelas do banco' },
  ];

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Atalhos">
      {atalhos.map((atalho) => (
        <Link
          key={atalho.href}
          href={atalho.href}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {atalho.rotulo}
        </Link>
      ))}
    </nav>
  );
}

/** A propriedade em foco atravessa os links internos da ficha: perder o `?prop=`
 *  ao clicar num card jogaria o técnico de volta para a carteira consolidada sem
 *  ele pedir, e os números mudariam sem explicação. */
function sufixoDeProp(selecao: SelecaoPropriedade): string {
  return selecao == null ? '' : `?prop=${selecao}`;
}

