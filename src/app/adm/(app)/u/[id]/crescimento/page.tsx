import { notFound } from 'next/navigation';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { NuvemPesoIdade } from '@/components/adm/charts/NuvemPesoIdade';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import {
  PIORES_GMD_LIMITE,
  TABELA_CRESCIMENTO,
  consolidarCrescimento,
  getCrescimento,
  resumoDaNuvem,
  temBandaDeMeta,
} from '@/lib/adm/areas/crescimento';
import type { LinhaCrescimento } from '@/lib/adm/areas/contrato';
import { idsDoEscopo, lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarKg, formatarNumero } from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, parseColunasParam } from '@/lib/adm/tabelas';
import type { Resultado } from '@/lib/adm/types';

/**
 * Aba 6 — Crescimento. Irmã de Rebanho, Produção e Financeiro: cards em cima,
 * gráfico no meio, a mesma <TabelaGenerica> do escape hatch embaixo.
 *
 * O QUE FAZ ESTA ABA VALER: a nuvem peso × idade sozinha é decoração — uma
 * mancha de bolinhas na qual todo rebanho parece igual. O que a transforma em
 * diagnóstico é a BANDA DE META, desenhada com os parâmetros que o próprio
 * produtor cadastrou em `propriedades` (peso ideal de desmame, idade de desmame,
 * peso de entrada em reprodução). Com a banda, "esses animais estão atrasados"
 * deixa de ser opinião e vira leitura.
 *
 * E é por isso que a ausência da banda é dita na tela, e não escondida: sem os
 * parâmetros, a nuvem continua sendo desenhada, mas o painel avisa que ela não
 * responde nada — e cadastrar os parâmetros vira a próxima conversa com o
 * cliente.
 *
 * A segunda entrega da aba é a LISTA DOS PIORES GMD. Não é gráfico, é lista de
 * ação: os animais que o consultor vai olhar primeiro na próxima visita.
 */

const TETO_CONSOLIDADO = 15;

export default async function CrescimentoPage({
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

  const registro = getRegistro(TABELA_CRESCIMENTO);
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
      ? Promise.resolve<Resultado<LinhaCrescimento>[]>([])
      : Promise.all(alvos.map((p) => getCrescimento(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const itens = dadosRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = dadosRes.filter((r) => !r.ok).length;
  const cres = itens.length > 0 ? consolidarCrescimento(itens) : null;

  // Derivado de `itens`, NÃO de `alvos`: se três fazendas foram pedidas e duas
  // falharam, sobrou UMA linha real, com médias preenchidas — tratá-la como
  // consolidada esconderia dado válido atrás de um "escolha uma fazenda".
  const consolidado = itens.length > 1;
  // Separa "nenhuma fazenda cadastrou meta" de "as fazendas cadastraram metas
  // diferentes e a consolidação anulou". As duas viram null em `cres`, mas são
  // conversas opostas com o cliente.
  const metasDivergem =
    consolidado &&
    itens.some(
      (i) =>
        i.peso_ideal_desmame != null ||
        i.idade_desmame != null ||
        i.peso_ideal_entrada_reproducao != null,
    );
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
          Sem propriedade no escopo — não há pesagem para mostrar.
        </p>
      )}

      {falhas > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não carregaram —
          os números abaixo são só das que responderam.
        </p>
      )}

      {cres && <Cards cres={cres} consolidado={consolidado} />}
      {cres && <Nuvem cres={cres} consolidado={consolidado} metasDivergem={metasDivergem} />}
      {cres && <PioresGmd cres={cres} usuarioId={usuarioId} selecao={selecao} />}

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
        titulo="Pesagens"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
      />
    </div>
  );
}

function Cards({ cres, consolidado }: { cres: LinhaCrescimento; consolidado: boolean }) {
  const resumo = resumoDaNuvem(cres);
  // Média não se soma entre fazendas — `consolidarCrescimento` anula de
  // propósito. Sem esta ressalva o "—" lê como "este cliente não pesa em série",
  // que é uma afirmação FALSA sobre o cliente e leva à ligação errada.
  const semMedia = 'média não se soma entre fazendas — escolha uma no seletor';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard rotulo="Pesagens · 12 meses" valor={formatarInteiro(cres.pesagens_12m)} />
      <KpiCard
        rotulo="Animais pesados"
        valor={formatarInteiro(cres.animais_pesados_12m)}
        detalhe="ao menos uma pesagem em 12 meses"
      />
      <KpiCard
        rotulo="GMD médio"
        valor={cres.gmd_medio == null ? VAZIO : `${formatarNumero(cres.gmd_medio, 3)} kg/dia`}
        detalhe={
          cres.gmd_medio != null
            ? undefined
            : consolidado
              ? semMedia
              : 'sem pesagem consecutiva para calcular'
        }
      />
      <KpiCard
        rotulo="Peso médio ao desmame"
        valor={cres.peso_medio_desmame == null ? VAZIO : formatarKg(cres.peso_medio_desmame)}
        detalhe={cres.peso_medio_desmame == null && consolidado ? semMedia : undefined}
      />
      {/*
        "Abaixo da meta" vem de pesagem.progresso < 100 — é o número que o app já
        calcula por animal. O card leva a contagem de atrasados da nuvem como
        sub-linha porque as duas contas discordam de propósito: `progresso` olha
        a meta individual do animal; `atrasados` cruza idade e peso de desmame da
        propriedade. Ver as duas juntas mostra se o cadastro de metas bate com a
        realidade do rebanho.
      */}
      <KpiCard
        rotulo="Abaixo da meta"
        valor={formatarInteiro(cres.abaixo_da_meta)}
        detalhe={
          resumo.atrasados == null
            ? 'meta de desmame não cadastrada'
            : `${formatarInteiro(resumo.atrasados)} passaram da idade de desmame sem o peso`
        }
      />
    </div>
  );
}

function Nuvem({
  cres,
  consolidado,
  metasDivergem,
}: {
  cres: LinhaCrescimento;
  consolidado: boolean;
  metasDivergem: boolean;
}) {
  const resumo = resumoDaNuvem(cres);
  const temBanda = temBandaDeMeta(cres);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Peso por idade</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(resumo.total)} animais · um ponto por animal, cor por sexo
        </p>
      </div>

      {!temBanda && (
        // O aviso fica ACIMA do gráfico, não abaixo: quem olha a nuvem primeiro
        // e lê a ressalva depois já tirou a conclusão errada.
        <p className="mt-3 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Sem banda de meta.</strong>{' '}
          {metasDivergem
            ? 'As fazendas deste escopo cadastraram metas diferentes, e uma banda só não serve para todas — escolha uma fazenda no seletor para ver a dela.'
            : consolidado
              ? 'Nenhuma das fazendas deste escopo tem peso ideal ou idade de desmame cadastrados.'
              : 'Esta fazenda não tem peso ideal nem idade de desmame cadastrados, então a nuvem mostra o rebanho mas não diz se ele está adiantado ou atrasado. Cadastrar os parâmetros no app é o que transforma este gráfico em diagnóstico.'}
        </p>
      )}

      <div className="mt-3">
        <NuvemPesoIdade
          pontos={cres.nuvem_peso_idade ?? []}
          pesoIdealDesmame={cres.peso_ideal_desmame}
          idadeDesmame={cres.idade_desmame}
          pesoIdealEntradaReproducao={cres.peso_ideal_entrada_reproducao}
          mensagemVazia="Nenhum animal com peso e idade cadastrados."
        />
      </div>

      {resumo.semSexo > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {formatarInteiro(resumo.semSexo)} animais entraram sem sexo cadastrado e aparecem em
          cinza — qualidade do cadastro, à vista.
        </p>
      )}
    </section>
  );
}

/**
 * A lista de ação da aba. Não é gráfico de propósito: o consultor precisa de
 * NOMES para levar na prancheta, e um ranking de 20 linhas responde isso melhor
 * que qualquer barra.
 */
function PioresGmd({
  cres,
  usuarioId,
  selecao,
}: {
  cres: LinhaCrescimento;
  usuarioId: number;
  selecao: SelecaoPropriedade;
}) {
  const piores = cres.piores_gmd ?? [];
  if (piores.length === 0) return null;

  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Menores ganhos de peso</h2>
        <p className="text-xs text-muted-foreground">
          Os {formatarInteiro(Math.min(piores.length, PIORES_GMD_LIMITE))} piores GMD — a lista para
          a próxima visita
        </p>
      </div>

      <ol className="mt-3 flex flex-col divide-y divide-border">
        {piores.slice(0, PIORES_GMD_LIMITE).map((animal, indice) => (
          <li
            key={`${animal.numero_animal}-${indice}`}
            className="flex items-baseline justify-between gap-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                {indice + 1}
              </span>
              <span className="truncate text-foreground">
                {animal.nome_animal?.trim() || animal.numero_animal}
              </span>
              {animal.nome_animal?.trim() && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {animal.numero_animal}
                </span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-foreground">
              {formatarNumero(animal.gmd, 3)} kg/dia
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-muted-foreground">
        Para ver o histórico de cada um, abra a{' '}
        <a
          href={`/adm/u/${usuarioId}/tabelas/pesagem${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de pesagens
        </a>{' '}
        e filtre pelo número do animal.
      </p>
    </section>
  );
}
