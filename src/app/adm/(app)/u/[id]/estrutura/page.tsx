import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  comFatiaSemLocalizacao,
  consolidarEstruturas,
  fracaoSemLocalizacao,
  getEstrutura,
  semHierarquia,
  type EstruturaFisica,
} from '@/lib/adm/areas/estrutura';
import { animaisDoEscopo, idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import type { FatiaDistribuicao, Resultado } from '@/lib/adm/types';

/**
 * Aba 9 — Estrutura. Irmã de Rebanho, Produção e Financeiro: cards em cima,
 * gráficos no meio, a mesma <TabelaGenerica> do escape hatch embaixo com o
 * preset da área — aqui, `movimentacoes`.
 *
 * O NÚMERO QUE VALE ESTA TELA É "ANIMAIS SEM LOCALIZAÇÃO". Contar lote, setor e
 * baia é inventário; animal sem localização é DADO FALTANDO, e dado faltando é a
 * única coisa desta ficha que o consultor consegue cobrar do cliente numa
 * ligação. Sem localização, manejo coletivo, movimentação e todo relatório por
 * lote ficam em branco no app do produtor — ele acha que o app não faz, quando o
 * que falta é o cadastro.
 *
 * ORDEM DE GRANDEZA ESPERADA: só ~16% dos animais ativos da base têm baia
 * preenchida. Um gráfico dominado por "sem localização" aqui é o dado real, não
 * um bug de leitura — e é por isso que a fatia da ausência é desenhada em vez de
 * omitida: sem ela, o gráfico afirma que o rebanho inteiro está alocado.
 */

const TABELA = 'movimentacoes';

/** Mesmo teto das abas irmãs: acima disso a tela pede uma fazenda em vez de
 *  fazer 31 leituras da view. A tabela abaixo continua cobrindo tudo. */
const TETO_CONSOLIDADO = 15;

/** Colunas de localização do `rebanho`, para o link "quem são eles". A grade do
 *  escape hatch aceita `?cols=` e valida cada nome contra o catálogo. */
const COLUNAS_LOCALIZACAO = 'numero_animal,nome_animal,status,lote_atual_id,setor_id,baia_id';

export default async function EstruturaPage({
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
  const [dadosRes, tabelaRes] = await Promise.all([
    // Anotação explícita: sem ela o ramo vazio tipa como `never[]` e o resultado
    // vira uma união de arrays que o `.filter()` abaixo não consegue percorrer.
    excedeConsolidado
      ? Promise.resolve<Resultado<EstruturaFisica>[]>([])
      : Promise.all(alvos.map((p) => getEstrutura(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const itens = dadosRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = dadosRes.filter((r) => !r.ok).length;
  const estrutura = itens.length > 0 ? consolidarEstruturas(itens) : null;

  // Denominador do percentual: vem do ESCOPO, não da view de estrutura. São duas
  // leituras do mesmo rebanho ativo — `fracaoSemLocalizacao()` recusa o cálculo
  // quando elas discordam, em vez de exibir um percentual acima de 100%.
  const animaisAtivos = animaisDoEscopo(escopo);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const separador = selecao == null ? '?' : '&';

  return (
    <div className="flex flex-col gap-6">
      {excedeConsolidado && (
        <p className="painel text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar cards e gráficos numa tela só. Escolha uma fazenda no
          seletor acima. A tabela abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {alvos.length === 0 && (
        <p className="painel text-sm text-muted-foreground">
          Sem propriedade no escopo — lote, setor e baia são cadastro de fazenda, não de conta.
        </p>
      )}

      {falhas > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não carregaram —
          os números abaixo são só das que responderam.
        </p>
      )}

      {estrutura && (
        <>
          <Cards estrutura={estrutura} animaisAtivos={animaisAtivos} />

          <AcaoSemLocalizacao
            estrutura={estrutura}
            animaisAtivos={animaisAtivos}
            hrefRebanho={`/adm/u/${usuarioId}/rebanho${sufixo}${separador}cols=${COLUNAS_LOCALIZACAO}`}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Painel
              titulo="Animais por lote"
              nota={
                estrutura.consolidado
                  ? 'Indisponível no consolidado: lote é nome local de cada fazenda.'
                  : 'A fatia da ausência é desenhada — sem ela o gráfico afirma que o rebanho todo está alocado.'
              }
            >
              <Distribuicao
                estrutura={estrutura}
                fatias={estrutura.porLote}
                animaisAtivos={animaisAtivos}
                rotuloAusencia="Sem lote"
              />
            </Painel>

            <Painel
              titulo="Animais por setor"
              nota={
                estrutura.consolidado
                  ? 'Indisponível no consolidado: setor é nome local de cada fazenda.'
                  : 'Setor é o nível do meio da hierarquia lote → setor → baia.'
              }
            >
              <Distribuicao
                estrutura={estrutura}
                fatias={estrutura.porSetor}
                animaisAtivos={animaisAtivos}
                rotuloAusencia="Sem setor"
              />
            </Painel>
          </div>
        </>
      )}

      <OutrasTabelas usuarioId={usuarioId} selecao={selecao} />

      {/*
        As movimentações têm tela própria: aqui os números são de estrutura
        PARADA (quantas baias, quantos lotes) e lá é o movimento entre elas —
        de onde para onde o rebanho anda, e quem vive trocando de lugar.
      */}
      <section className="painel">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base">Movimentações</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Caminhos mais percorridos, destinos que mais recebem e os animais que vivem trocando de
              lugar — com filtro entre troca de lote (manejo) e troca de baia (lugar físico).
            </p>
          </div>
          <Link
            href={`/adm/u/${usuarioId}/estrutura/movimentacoes${selecao == null ? '' : `?prop=${selecao}`}`}
            className="shrink-0 rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Abrir movimentações
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
        titulo="Movimentações"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
      />
    </div>
  );
}

function Cards({ estrutura, animaisAtivos }: { estrutura: EstruturaFisica; animaisAtivos: number }) {
  const fracao = fracaoSemLocalizacao(estrutura, animaisAtivos);
  const semLocalizacao = estrutura.animaisSemLocalizacao;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Lotes"
        valor={formatarInteiro(estrutura.lotes)}
        detalhe="topo da hierarquia — é o agrupador do manejo coletivo"
      />
      <KpiCard rotulo="Setores" valor={formatarInteiro(estrutura.setores)} detalhe="nível do meio" />
      <KpiCard
        rotulo="Baias"
        valor={formatarInteiro(estrutura.baias)}
        detalhe="a folha da hierarquia — a menos preenchida da base"
      />
      <KpiCard
        rotulo="Movimentações 12 meses"
        valor={formatarInteiro(estrutura.movimentacoes12m)}
        detalhe="troca de lote e/ou localização"
      />
      <KpiCard
        rotulo="Animais sem localização"
        valor={formatarInteiro(semLocalizacao)}
        // Destaque só quando há o que cobrar: um card em evidência marcando zero
        // treina o olho a ignorar o destaque justamente quando ele importa.
        destaque={semLocalizacao > 0}
        detalhe={
          fracao != null
            ? `${formatarPercentual(fracao)} dos ativos — sem lote, setor nem baia`
            : 'sem lote, setor nem baia'
        }
      />
      <KpiCard
        rotulo="Animais ativos"
        valor={formatarInteiro(animaisAtivos)}
        detalhe="o denominador — vem do escopo, não desta view"
      />
      <KpiCard
        rotulo="Alocados"
        valor={fracao != null ? formatarInteiro(animaisAtivos - semLocalizacao) : VAZIO}
        detalhe={fracao != null ? `${formatarPercentual(1 - fracao)} do rebanho ativo` : 'sem base para comparar'}
      />
      <KpiCard
        rotulo="Movimentações por animal"
        valor={animaisAtivos > 0 ? formatarNumero(estrutura.movimentacoes12m / animaisAtivos, 1) : VAZIO}
        detalhe="nos 12 meses — 0,0 é rebanho parado no cadastro"
      />
    </div>
  );
}

/**
 * O bloco de ação da aba. Três situações que exigem conversas diferentes com o
 * cliente, e que um único número não distingue:
 *   · não há hierarquia nenhuma cadastrada — falta o começo;
 *   · há hierarquia e o rebanho não foi alocado — falta a associação;
 *   · está tudo alocado — não há o que cobrar, e a tela diz isso.
 */
function AcaoSemLocalizacao({
  estrutura,
  animaisAtivos,
  hrefRebanho,
}: {
  estrutura: EstruturaFisica;
  animaisAtivos: number;
  hrefRebanho: string;
}) {
  const semLocalizacao = estrutura.animaisSemLocalizacao;

  if (semHierarquia(estrutura)) {
    return (
      <section className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
        <h2 className="text-base">Nenhum lote, setor ou baia cadastrado</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Esta fazenda não tem hierarquia física. Sem ela, o manejo coletivo e todo relatório por
          lote ficam vazios no app — o produtor conclui que o app não faz, quando o que falta é o
          cadastro. É a conversa mais curta e mais útil desta ficha.
        </p>
      </section>
    );
  }

  if (semLocalizacao <= 0) {
    return (
      <p className="painel text-sm text-muted-foreground">
        {animaisAtivos > 0
          ? 'Todo o rebanho ativo tem localização. Nada a cobrar aqui.'
          : 'Sem rebanho ativo para localizar.'}
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <h2 className="text-base">
        {formatarInteiro(semLocalizacao)} animais ativos sem localização
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        A estrutura existe, mas esses animais não estão associados a lote, setor nem baia. É dado
        faltando do lado do cliente — o tipo de pendência que o consultor cobra numa ligação e que
        destrava manejo coletivo, movimentação e relatório por lote.
      </p>
      <Link
        href={hrefRebanho}
        className="mt-3 inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-foreground transition-colors hover:border-primary/60"
      >
        Ver o rebanho com as colunas de lote, setor e baia
      </Link>
    </section>
  );
}

/** Distribuição de animais, com a fatia da ausência recomposta. No consolidado
 *  não desenha: somar o lote "Lactação" de duas fazendas inventaria um lote. */
function Distribuicao({
  estrutura,
  fatias,
  animaisAtivos,
  rotuloAusencia,
}: {
  estrutura: EstruturaFisica;
  fatias: FatiaDistribuicao[];
  animaisAtivos: number;
  rotuloAusencia: string;
}) {
  if (estrutura.consolidado) {
    return (
      <p className="text-sm text-muted-foreground">
        Lote e setor são catálogos de cada propriedade: dois nomes iguais em fazendas diferentes são
        cadastros diferentes. Escolha uma fazenda no seletor acima.
      </p>
    );
  }

  return (
    <DistribuicaoBarras
      dados={comFatiaSemLocalizacao(fatias, animaisAtivos, rotuloAusencia)}
      mostrarPercentual
      mensagemVazia="Sem animais ativos para distribuir."
    />
  );
}

function OutrasTabelas({ usuarioId, selecao }: { usuarioId: number; selecao: SelecaoPropriedade }) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const registros = listarRegistros().filter((r) => r.area === 'Estrutura' && r.nome !== TABELA);

  return (
    <section className="painel">
      <h2 className="text-base">Outras tabelas de estrutura</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Mesma grade, outro registro do catálogo — o cadastro de lotes, setores e baias que sustenta
        os números acima.
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

function Painel({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="painel">
      <h2 className="text-base">{titulo}</h2>
      {nota && <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
