import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  PERIODOS,
  ROTULO_PERIODO,
  faixasEtarias,
  filtrarPorPeriodo,
  lerPeriodo,
  listarObitos,
  rankingCausas,
  resumoObitos,
  serieMensalObitos,
  type CausaObito,
  type FaixaEtaria,
  type Periodo,
  type ResumoObitos,
} from '@/lib/adm/areas/obitos';
import type { LinhaObito } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * ÓBITOS — quem morreu, com que idade e de quê.
 *
 * POR QUE É UMA TELA À PARTE da aba Sanidade: lá o óbito é uma contagem de 12
 * meses e uma taxa. A pergunta que decide manejo é outra — mortalidade de
 * NEONATO é colostro, higiene de baia e assistência ao parto; mortalidade de
 * ADULTO é outro assunto inteiro. As duas somam no mesmo `obitos_12m` e saem de
 * lá indistinguíveis.
 *
 * A TELA INSISTE EM DENOMINADOR, e isso não é rodapé: só 39% dos óbitos da base
 * têm suspeita anotada e 9% não têm data de nascimento. Um ranking de causas sem
 * dizer sobre quantos óbitos ele fala é o tipo de gráfico que vira decisão
 * errada — por isso o número aparece ao lado de cada bloco, e as faixas etárias
 * incluem "sem data" e "data inconsistente" em vez de escondê-las.
 */
export const dynamic = 'force-dynamic';

export default async function ObitosPage({
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
  const periodo = lerPeriodo(sp.periodo);
  const agora = new Date();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  // Uma fazenda só: idade ao morrer e suspeita são do animal, e somar rebanhos
  // diferentes num histograma de idade não responde pergunta de ninguém.
  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaSanidade usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há óbito para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Escolha uma no seletor acima: faixa etária e causa são do animal, e somar rebanhos diferentes não responde pergunta nenhuma.`}
        </p>
      </div>
    );
  }

  const obitosRes = await listarObitos(alvo.id);
  if (!obitosRes.ok) return <EstadoVazio resultado={obitosRes} />;

  const todos = obitosRes.dados;
  const obitos = filtrarPorPeriodo(todos, periodo, agora);

  const resumo = resumoObitos(obitos);
  const faixas = faixasEtarias(obitos);
  const causas = rankingCausas(obitos);
  const serie = serieMensalObitos(obitos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VoltarParaSanidade usuarioId={usuarioId} sufixo={sufixo} />
          <h1 className="mt-1 text-lg">Óbitos · {ROTULO_PERIODO[periodo]}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatarInteiro(todos.length)} óbitos registrados nesta fazenda desde o primeiro
            lançamento.
          </p>
        </div>
        <Periodos usuarioId={usuarioId} selecao={selecao} atual={periodo} />
      </div>

      {todos.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhum óbito lançado.</strong> Isso pode ser
          um rebanho saudável ou um módulo que ninguém usa — a diferença aparece cruzando com o
          tamanho do rebanho e o tempo de casa do cliente.
        </p>
      ) : obitos.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          Nenhum óbito em {ROTULO_PERIODO[periodo]} — mas há {formatarInteiro(todos.length)} no
          histórico. Amplie o período acima.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} periodo={periodo} />

          {serie.length > 0 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Óbitos mês a mês</h2>
                <p className="text-xs text-muted-foreground">
                  Mês sem óbito aparece como zero — aqui a lacuna É a boa notícia, ao contrário da
                  série de litros.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'obitos', nome: 'Óbitos', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={260}
                />
              </div>
            </section>
          )}

          <FaixasEtarias faixas={faixas} total={obitos.length} />

          <Causas causas={causas} resumo={resumo} />

          <Tabela obitos={obitos} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaSanidade({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/sanidade${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Sanidade
    </Link>
  );
}

function Periodos({
  usuarioId,
  selecao,
  atual,
}: {
  usuarioId: number;
  selecao: SelecaoPropriedade;
  atual: Periodo;
}) {
  const base = `/adm/u/${usuarioId}/sanidade/obitos`;
  const prop = selecao == null ? '' : `prop=${selecao}&`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {PERIODOS.map((periodo) => (
        <Link
          key={periodo}
          href={`${base}?${prop}periodo=${periodo}`}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            periodo === atual
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          {ROTULO_PERIODO[periodo]}
        </Link>
      ))}
    </div>
  );
}

function Cards({ resumo, periodo }: { resumo: ResumoObitos; periodo: Periodo }) {
  const fracaoNeonatal = resumo.total > 0 ? resumo.neonatais / resumo.total : null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        rotulo={`Óbitos · ${ROTULO_PERIODO[periodo]}`}
        valor={formatarInteiro(resumo.total)}
        detalhe="no recorte escolhido acima"
      />
      <KpiCard
        rotulo="Neonatais (até 30 d)"
        valor={formatarInteiro(resumo.neonatais)}
        detalhe={
          fracaoNeonatal === null
            ? undefined
            : `${formatarPercentual(fracaoNeonatal)} dos óbitos — colostro e baia de parto`
        }
      />
      <KpiCard
        rotulo="Idade média ao morrer"
        valor={
          resumo.idadeMediaDias === null ? VAZIO : `${formatarNumero(resumo.idadeMediaDias, 0)} d`
        }
        // O denominador vai junto: a média é sobre quem TEM data de nascimento
        // utilizável, e 9% da base não tem.
        detalhe={
          resumo.idadeMediaDias === null
            ? 'nenhum óbito com data de nascimento'
            : `sobre ${formatarInteiro(resumo.comIdade)} de ${formatarInteiro(resumo.total)} com idade calculável`
        }
      />
      <KpiCard
        rotulo="Com suspeita anotada"
        valor={formatarInteiro(resumo.comSuspeita)}
        detalhe={
          resumo.total > 0
            ? `${formatarPercentual(resumo.comSuspeita / resumo.total)} — o resto morreu sem causa registrada`
            : undefined
        }
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(resumo.femeas)} · ${formatarInteiro(resumo.machos)}`}
        detalhe={
          resumo.semSexo > 0 ? `${formatarInteiro(resumo.semSexo)} sem sexo cadastrado` : undefined
        }
      />
    </div>
  );
}

/**
 * Faixas desenhadas à mão, e não com <DistribuicaoBarras>: aquele componente
 * ordena por volume (é ranking) e a idade é uma ESCALA. Reordenada, ela deixa de
 * dizer "a mortalidade está concentrada no neonato" e passa a dizer só "a faixa
 * mais comum é essa" — mesmo motivo do histograma do controle leiteiro e da
 * escala FAMACHA da Sanidade.
 */
function FaixasEtarias({ faixas, total }: { faixas: FaixaEtaria[]; total: number }) {
  const maior = Math.max(...faixas.map((f) => f.obitos), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Mortalidade por faixa etária</h2>
        <p className="text-xs text-muted-foreground">
          As faixas somam {formatarInteiro(total)} — as duas últimas não são idade, são recado sobre
          o cadastro.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li
            key={faixa.chave}
            className="grid grid-cols-[11rem_1fr_5.5rem] items-center gap-3 text-sm"
          >
            <span className="min-w-0">
              <span className="block truncate text-foreground">{faixa.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{faixa.detalhe}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${
                  faixa.chave === 'sem_data' || faixa.chave === 'inconsistente'
                    ? 'bg-muted-foreground/40'
                    : 'bg-primary'
                }`}
                style={{ width: `${(faixa.obitos / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.obitos)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Causas({ causas, resumo }: { causas: CausaObito[]; resumo: ResumoObitos }) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Suspeitas registradas</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.comSuspeita)} de {formatarInteiro(resumo.total)} óbitos — o
          resto não tem causa anotada.
        </p>
      </div>

      {causas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma suspeita anotada no período. O campo existe no app e está vazio: sem ele, a
          mortalidade vira um número sem endereço, e não dá para saber se o problema é sanidade,
          manejo de parto ou nutrição.
        </p>
      ) : (
        <>
          <div className="mt-3">
            <DistribuicaoBarras
              dados={causas.map((c) => ({ rotulo: c.suspeita, valor: c.obitos }))}
              larguraRotulo={168}
              formato="inteiro"
              maximo={10}
              mensagemVazia="Nenhuma suspeita anotada"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Um óbito pode ter mais de uma suspeita, então as barras somam mais que o número de
            óbitos. A porcentagem de cada uma é sobre os {formatarInteiro(resumo.comSuspeita)} com
            causa anotada — nunca sobre o total.
          </p>
        </>
      )}
    </section>
  );
}

function Tabela({
  obitos,
  usuarioId,
  sufixo,
}: {
  obitos: LinhaObito[];
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Óbitos do período</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(obitos.length)} registros, do mais recente para o mais antigo.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Sexo</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 text-right font-normal">Idade</th>
              <th className="py-1.5 pe-3 font-normal">Suspeita</th>
              <th className="py-1.5 font-normal">Observação clínica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {obitos.map((obito) => (
              <tr key={obito.obito_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {obito.nome_animal?.trim() || obito.numero_animal}
                  </span>
                  {obito.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {obito.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{obito.sexo ?? VAZIO}</td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(obito.data_obito)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {idadeLegivel(obito.idade_dias)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {obito.suspeitas.length > 0 ? obito.suspeitas.join(', ') : VAZIO}
                </td>
                <td className="py-1.5 text-muted-foreground">
                  {obito.diagnostico_obito?.trim() || obito.sinais_clinicos?.trim() || VAZIO}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para as colunas cruas e a exportação, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/obito${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de óbitos
        </Link>
        .
      </p>
    </section>
  );
}

/** Dias viram meses ou anos quando o número fica grande demais para ser lido —
 *  "3041 d" não diz nada; "8,3 anos" diz. Negativo é erro de cadastro, e a
 *  tabela avisa em vez de mostrar uma idade impossível. */
function idadeLegivel(dias: number | null): string {
  if (dias === null) return VAZIO;
  if (dias < 0) return 'data inconsistente';
  if (dias <= 90) return `${formatarInteiro(dias)} d`;
  if (dias < 730) return `${formatarNumero(dias / 30.44, 1)} m`;
  return `${formatarNumero(dias / 365.25, 1)} anos`;
}
