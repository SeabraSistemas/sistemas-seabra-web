import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  DURACAO_IMPLAUSIVEL,
  RANKING_LIMITE,
  distribuicaoDuracao,
  listarLactacoes,
  melhoresLactacoes,
  porOrdemParto,
  procedencias,
  resumoLactacoes,
  separarSinteticas,
  serieInicios,
  type FaixaDuracao,
  type OrdemParto,
  type Procedencia,
  type ResumoLactacoes,
} from '@/lib/adm/areas/lactacoes';
import type { LinhaLactacao } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarLitros,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * LACTAÇÕES — o que cada fêmea entregou do parto à secagem.
 *
 * É A UNIDADE ECONÔMICA DO REBANHO LEITEIRO. O controle leiteiro mede um dia e a
 * produção diária mede o tanque; só a lactação permite comparar animais entre si,
 * a 1ª cria com a 3ª, e este ano com o passado.
 *
 * A TELA IMPRIME A PROCEDÊNCIA DE CADA NÚMERO ao lado das médias, e isso é o
 * ponto: o app INFERE o fim de boa parte das lactações (a partir do parto
 * seguinte ou da lacuna de lançamentos). Uma média de litros em que um quarto
 * das lactações foi inferida é uma afirmação mais fraca — e sem o bloco de
 * procedência as duas aparecem com o mesmo peso.
 */
export const dynamic = 'force-dynamic';

export default async function LactacoesPage({
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

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há lactação para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Comparar 1ª cria com 3ª entre rebanhos diferentes não responde pergunta nenhuma — escolha uma fazenda no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarLactacoes(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const { reais, sinteticas } = separarSinteticas(res.dados);
  const resumo = resumoLactacoes(reais);
  const faixas = distribuicaoDuracao(reais);
  const ordens = porOrdemParto(reais);
  const melhores = melhoresLactacoes(reais);
  const serie = serieInicios(reais);
  const proc = procedencias(reais);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Lactações</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Do parto à secagem, uma linha por lactação. {formatarInteiro(reais.length)} no histórico
          desta fazenda.
        </p>
      </div>

      {sinteticas.length > 0 && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-destructive">
            {formatarInteiro(sinteticas.length)} lactações sintéticas
          </strong>{' '}
          ficaram de fora de tudo nesta tela. Elas se declaram como teste no próprio dado
          (procedência &quot;sintetico&quot;, método &quot;{sinteticas[0]?.metodo ?? '—'}&quot;) — é
          massa de teste que ficou no banco de produção e vale pedir a limpeza.
        </p>
      )}

      {reais.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma lactação registrada.</strong> O app
          abre lactação a partir do parto — sem ela não há como comparar animais, nem medir
          persistência, nem calcular produção por cria.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          <Procedencias procedencias={proc} resumo={resumo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Lactações iniciadas por mês</h2>
                <p className="text-xs text-muted-foreground">
                  É a curva de partos vista pelo lado do leite — e a que prevê o tanque dos próximos
                  meses.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'inicios', nome: 'Lactações iniciadas', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          <Duracao faixas={faixas} resumo={resumo} />

          <PorOrdem ordens={ordens} />

          <Melhores lactacoes={melhores} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaProducao({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/producao${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Produção
    </Link>
  );
}

function Cards({ resumo }: { resumo: ResumoLactacoes }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Lactações"
        valor={formatarInteiro(resumo.total)}
        detalhe={`${formatarInteiro(resumo.abertas)} abertas · ${formatarInteiro(resumo.encerradas)} encerradas`}
      />
      <KpiCard
        rotulo="Duração média"
        valor={resumo.duracaoMedia === null ? VAZIO : `${formatarNumero(resumo.duracaoMedia, 0)} d`}
        // O denominador vai junto: a média é só das encerradas com duração
        // plausível, e a base tem 1.418 linhas com dias <= 0.
        detalhe={
          resumo.duracaoMedia === null
            ? 'nenhuma lactação encerrada com duração válida'
            : `sobre ${formatarInteiro(resumo.comDuracao)} encerradas`
        }
      />
      <KpiCard
        rotulo="Total por lactação"
        valor={formatarLitros(resumo.totalMedio, 0)}
        detalhe={
          resumo.totalMedio === null
            ? 'nenhuma lactação encerrada com produção'
            : `sobre ${formatarInteiro(resumo.comTotal)} que produziram`
        }
      />
      <KpiCard
        rotulo="Média diária"
        valor={formatarLitros(resumo.mediaDiaria, 2)}
        detalhe="litros por dia em lactação"
      />
      <KpiCard
        rotulo="Encerramento definitivo"
        valor={resumo.fracaoDefinitiva === null ? VAZIO : formatarPercentual(resumo.fracaoDefinitiva)}
        detalhe="o resto o app inferiu ou estimou"
      />
      <KpiCard
        rotulo="Duração implausível"
        valor={formatarInteiro(resumo.duracaoImplausivel)}
        detalhe={`${formatarInteiro(DURACAO_IMPLAUSIVEL)} dias ou mais — lactação que ninguém fechou`}
      />
    </div>
  );
}

/**
 * De onde veio cada número. Desenhado à mão porque é uma ESCALA de confiança —
 * ordenar por volume (o que <DistribuicaoBarras> faz) tiraria justamente a
 * leitura, que é "quanto do total é definitivo e quanto é dedução".
 */
function Procedencias({
  procedencias: lista,
  resumo,
}: {
  procedencias: Procedencia[];
  resumo: ResumoLactacoes;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">De onde vem o número</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(resumo.total)} lactações. O app deduz o fim quando o criador não lança a
          secagem.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {lista.map((p) => (
          <li key={p.chave} className="grid grid-cols-[10rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{p.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{p.detalhe}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${
                  p.chave === 'DEFINITIVO' ? 'bg-primary' : 'bg-primary/40'
                }`}
                style={{ width: `${(p.fracao ?? 0) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(p.lactacoes)}
              <span className="ms-1 text-xs text-muted-foreground">
                {p.fracao === null ? VAZIO : formatarPercentual(p.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Duracao({ faixas, resumo }: { faixas: FaixaDuracao[]; resumo: ResumoLactacoes }) {
  const maior = Math.max(...faixas.map((f) => f.lactacoes), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Duração das lactações</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.comDuracao)} lactações encerradas com duração plausível.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[8rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(faixa.lactacoes / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.lactacoes)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        305 dias é a lactação-padrão da zootecnia leiteira, a régua com que se compara qualquer
        fêmea. Abaixo dela é lactação curta — secagem antecipada, doença ou manejo; acima, é fêmea
        persistente, que é o traço que se quer na matriz.
      </p>
    </section>
  );
}

function PorOrdem({ ordens }: { ordens: OrdemParto[] }) {
  if (ordens.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Por ordem de parto</h2>
        <p className="text-xs text-muted-foreground">Só lactações encerradas.</p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Ordem</th>
              <th className="py-1.5 pe-3 text-right font-normal">Lactações</th>
              <th className="py-1.5 pe-3 text-right font-normal">Duração média</th>
              <th className="py-1.5 pe-3 text-right font-normal">Total médio</th>
              <th className="py-1.5 text-right font-normal">Média diária</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ordens.map((ordem) => (
              <tr key={ordem.ordem}>
                <td className="py-1.5 pe-3 text-foreground">{ordem.rotulo}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(ordem.lactacoes)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {ordem.duracaoMedia === null ? VAZIO : `${formatarNumero(ordem.duracaoMedia, 0)} d`}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarLitros(ordem.totalMedio, 0)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {formatarLitros(ordem.mediaDiaria, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A primípara produzir menos é biologia, não problema. O que se lê aqui é outra coisa: se a 2ª
        e a 3ª cria não sobem em relação à 1ª, o rebanho não está expressando potencial — e isso
        nenhuma média geral mostra.
      </p>
    </section>
  );
}

function Melhores({
  lactacoes,
  usuarioId,
  sufixo,
}: {
  lactacoes: LinhaLactacao[];
  usuarioId: number;
  sufixo: string;
}) {
  if (lactacoes.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Maiores lactações</h2>
        <p className="text-xs text-muted-foreground">
          As {formatarInteiro(Math.min(lactacoes.length, RANKING_LIMITE))} maiores já encerradas —
          as matrizes que sustentaram o tanque.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 text-right font-normal">Ordem</th>
              <th className="py-1.5 pe-3 font-normal">Início</th>
              <th className="py-1.5 pe-3 text-right font-normal">Dias</th>
              <th className="py-1.5 pe-3 text-right font-normal">Média/dia</th>
              <th className="py-1.5 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lactacoes.map((lactacao) => (
              <tr key={lactacao.lactacao_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {lactacao.nome_animal?.trim() || lactacao.numero_animal}
                  </span>
                  {lactacao.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {lactacao.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {lactacao.ordem_parto === null ? VAZIO : `${lactacao.ordem_parto}ª`}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(lactacao.data_inicio)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {lactacao.dias === null ? VAZIO : formatarInteiro(lactacao.dias)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarLitros(lactacao.media_leite, 2)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {formatarLitros(lactacao.total_leite, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para o histórico completo, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/lactacao${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de lactações
        </Link>
        .
      </p>
    </section>
  );
}
