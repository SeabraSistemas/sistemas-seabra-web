import Link from 'next/link';
import { BotaoCopiar } from '@/components/adm/BotaoCopiar';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  PERIODOS,
  ROTULO_PERIODO,
  diasSemLancamento,
  inicioDoPeriodo,
  lerPeriodo,
  listarProducaoDiaria,
  resumoMensal,
  resumoProducao,
  separarFuturos,
  serieLitros,
  serieLitrosPorLactante,
  type MesProducao,
  type Periodo,
  type ResumoProducao,
} from '@/lib/adm/areas/producao-diaria';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarLitros,
  formatarMes,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * PRODUÇÃO DIÁRIA EM DETALHE — os dias que faltam, as duas ordenhas e a
 * produtividade por lactante.
 *
 * A ABA PRODUÇÃO JÁ DIZ "62 de 90 dias com lançamento". Esta tela diz QUAIS —
 * e é a lista, não a contagem, que vira a conversa com o cliente.
 *
 * As outras duas entregas são leituras que o volume total esconde:
 *   · 1ª × 2ª ordenha separa "produziu menos" de "largou a segunda ordenha",
 *     que desenham a MESMA queda no gráfico e são problemas diferentes;
 *   · litros por lactante sobe quando o rebanho melhora — e o total pode cair
 *     ao mesmo tempo, só porque o plantel encolheu. Ver as duas curvas juntas é
 *     o que separa uma coisa da outra.
 */
export const dynamic = 'force-dynamic';

export default async function ProducaoDiariaPage({
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

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há produção para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Dia sem lançamento é de UMA fazenda — somar tanques diferentes esconderia justamente quem parou de lançar. Escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const inicio = inicioDoPeriodo(periodo, agora);
  const res = await listarProducaoDiaria(alvo.id, inicio);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const { validos, futuros } = separarFuturos(res.dados, agora);
  const resumo = resumoProducao(validos);
  const meses = resumoMensal(validos);
  const hoje = agora.toISOString().slice(0, 10);
  const faltantes = diasSemLancamento(validos, inicio ?? hoje, hoje);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
          <h1 className="mt-1 text-lg">Produção diária · {ROTULO_PERIODO[periodo]}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Litros do tanque, dia a dia. Média sempre por dia LANÇADO — dia sem lançamento não é dia
            de zero litro, é dia não medido.
          </p>
        </div>
        <Periodos usuarioId={usuarioId} selecao={selecao} atual={periodo} />
      </div>

      {futuros.length > 0 && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-destructive">
            {formatarInteiro(futuros.length)} lançamentos com data no futuro
          </strong>{' '}
          (até {formatarData(futuros[0]?.data ?? '')}) ficaram de fora de todos os números desta
          tela. Produção de um dia que ainda não chegou não é produção — é digitação errada ou massa
          de teste, e vale pedir a correção ao cliente.
        </p>
      )}

      {validos.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhum lançamento de produção em {ROTULO_PERIODO[periodo]}. Amplie o período acima — ou
          este cliente parou de lançar, que é a informação em si.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} periodo={periodo} />

          <Faltantes faltantes={faltantes} periodo={periodo} resumo={resumo} />

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base">Litros por dia</h2>
              <p className="text-xs text-muted-foreground">
                A lacuna fica aberta de propósito: preencher com zero desenharia uma queda a pique
                que não existiu.
              </p>
            </div>
            <div className="mt-3">
              <SerieTemporal
                series={[{ chave: 'litros', nome: 'Litros do tanque', pontos: serieLitros(validos) }]}
                granularidade="dia"
                buracos="vazio"
                formato="litros0"
                altura={280}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base">Litros por lactante</h2>
              <p className="text-xs text-muted-foreground">
                A produtividade de cada fêmea. Ela pode SUBIR enquanto o total cai — é o que separa
                rebanho melhorando de plantel encolhendo.
              </p>
            </div>
            <div className="mt-3">
              <SerieTemporal
                series={[
                  {
                    chave: 'por_lactante',
                    nome: 'Litros por lactante',
                    pontos: serieLitrosPorLactante(validos),
                  },
                ]}
                granularidade="dia"
                buracos="vazio"
                formato="litros"
                altura={240}
              />
            </div>
          </section>

          <Ordenhas resumo={resumo} />

          <Mensal meses={meses} />
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

function Periodos({
  usuarioId,
  selecao,
  atual,
}: {
  usuarioId: number;
  selecao: SelecaoPropriedade;
  atual: Periodo;
}) {
  const base = `/adm/u/${usuarioId}/producao/diaria`;
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

function Cards({ resumo, periodo }: { resumo: ResumoProducao; periodo: Periodo }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo={`Total · ${ROTULO_PERIODO[periodo]}`}
        valor={formatarLitros(resumo.litrosTotal, 0)}
        detalhe={`em ${formatarInteiro(resumo.diasLancados)} dias lançados`}
      />
      <KpiCard
        rotulo="Média por dia lançado"
        valor={formatarLitros(resumo.mediaPorDiaLancado, 1)}
        detalhe="dividido pelos dias lançados, não pelos do calendário"
      />
      <KpiCard
        rotulo="Litros por lactante"
        valor={formatarLitros(resumo.mediaPorLactante, 2)}
        detalhe={
          resumo.lactantesMedio === null
            ? 'sem lactante lançado'
            : `${formatarNumero(resumo.lactantesMedio, 0)} lactantes em média`
        }
      />
      <KpiCard
        rotulo="Melhor dia"
        valor={formatarLitros(resumo.melhorDia?.litros ?? null, 0)}
        detalhe={resumo.melhorDia ? formatarData(resumo.melhorDia.data) : undefined}
      />
      <KpiCard
        rotulo="Pior dia"
        valor={formatarLitros(resumo.piorDia?.litros ?? null, 0)}
        detalhe={resumo.piorDia ? formatarData(resumo.piorDia.data) : undefined}
      />
      <KpiCard
        rotulo="Veio da 2ª ordenha"
        valor={
          resumo.fracaoSegundaOrdenha === null ? VAZIO : formatarPercentual(resumo.fracaoSegundaOrdenha)
        }
        detalhe={
          resumo.diasSoPrimeira > 0
            ? `${formatarInteiro(resumo.diasSoPrimeira)} dias só com a 1ª`
            : 'todos os dias com as duas'
        }
      />
    </div>
  );
}

/**
 * A lista de dias em falta — a entrega central desta tela.
 *
 * Vem com o texto pronto para colar: a cobrança ao cliente é "faltam estes
 * dias", e digitar 14 datas à mão é exatamente o atrito que faz a cobrança não
 * acontecer.
 */
function Faltantes({
  faltantes,
  periodo,
  resumo,
}: {
  faltantes: string[];
  periodo: Periodo;
  resumo: ResumoProducao;
}) {
  const cobertura = resumo.diasLancados + faltantes.length;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Dias sem lançamento</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A janela começa no primeiro lançamento do período, não no primeiro dia dele — cliente
            novo não é cliente relapso.
          </p>
        </div>
        {faltantes.length > 0 && (
          <BotaoCopiar
            texto={textoDeCobranca(faltantes, periodo)}
            rotulo="Copiar para WhatsApp"
          />
        )}
      </div>

      {faltantes.length === 0 ? (
        <p className="mt-3 text-sm text-foreground">
          Nenhum dia em falta — {formatarInteiro(resumo.diasLancados)} de{' '}
          {formatarInteiro(resumo.diasLancados)} dias lançados desde o primeiro registro do período.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong className="text-destructive">{formatarInteiro(faltantes.length)} dias</strong> sem
            lançamento de {formatarInteiro(cobertura)} desde o primeiro registro do período —{' '}
            {formatarPercentual(resumo.diasLancados / cobertura)} de cobertura.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {faltantes.map((dia) => (
              <li
                key={dia}
                className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs tabular-nums text-muted-foreground"
              >
                {formatarData(dia)}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function textoDeCobranca(faltantes: string[], periodo: Periodo): string {
  return [
    `*Produção diária — dias sem lançamento (${ROTULO_PERIODO[periodo]}):*`,
    '',
    ...faltantes.map((dia) => `• ${formatarData(dia)}`),
    '',
    `Total: ${faltantes.length} dias.`,
  ].join('\n');
}

function Ordenhas({ resumo }: { resumo: ResumoProducao }) {
  const total = resumo.litros1Ordenha + resumo.litros2Ordenha;
  if (total === 0) return null;

  const fracao1 = resumo.litros1Ordenha / total;
  const fracao2 = resumo.litros2Ordenha / total;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">1ª e 2ª ordenha</h2>
        <p className="text-xs text-muted-foreground">
          Queda de litros com a 2ª ordenha encolhendo é manejo, não rebanho.
        </p>
      </div>

      <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-secondary" aria-hidden>
        <span className="block bg-primary" style={{ width: `${fracao1 * 100}%` }} />
        <span className="block bg-primary/45" style={{ width: `${fracao2 * 100}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">1ª ordenha</p>
          <p className="tabular-nums text-foreground">
            {formatarLitros(resumo.litros1Ordenha, 0)}{' '}
            <span className="text-xs text-muted-foreground">{formatarPercentual(fracao1)}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">2ª ordenha</p>
          <p className="tabular-nums text-foreground">
            {formatarLitros(resumo.litros2Ordenha, 0)}{' '}
            <span className="text-xs text-muted-foreground">{formatarPercentual(fracao2)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Mensal({ meses }: { meses: MesProducao[] }) {
  if (meses.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Mês a mês</h2>
        <p className="text-xs text-muted-foreground">
          A contagem de dias lançados fica ao lado da média — é ela que diz o peso do número.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Mês</th>
              <th className="py-1.5 pe-3 text-right font-normal">Dias lançados</th>
              <th className="py-1.5 pe-3 text-right font-normal">Total</th>
              <th className="py-1.5 pe-3 text-right font-normal">Média/dia</th>
              <th className="py-1.5 text-right font-normal">Por lactante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {meses.map((mes) => (
              <tr key={mes.mes}>
                <td className="py-1.5 pe-3 text-foreground">{formatarMes(mes.mes)}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(mes.diasLancados)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarLitros(mes.litrosTotal, 0)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarLitros(mes.mediaPorDiaLancado, 1)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {formatarLitros(mes.mediaPorLactante, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
