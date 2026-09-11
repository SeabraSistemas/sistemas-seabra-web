import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  JANELA_GESTACAO,
  MINIMO_POR_REPRODUTOR,
  RETORNO_CIO,
  TERMO_GESTACAO,
  desfechoDe,
  distribuicaoDesfechos,
  listaDeAbortos,
  listarServicos,
  porMetodo,
  porOrdemParto,
  porReprodutor,
  resumoServicos,
  serieServicos,
  ROTULO_DESFECHO,
  type Aborto,
  type ContagemDesfecho,
  type GrupoTaxa,
  type Reprodutor,
  type ResumoServicos,
} from '@/lib/adm/areas/servicos';
import type { LinhaServico } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * SERVIÇOS REPRODUTIVOS — qual reprodutor emprenha.
 *
 * A aba Reprodução mostra o funil agregado. Esta tela desce a CADA serviço, com
 * quem cobriu e o que aconteceu depois — e é aqui que se responde a pergunta
 * mais cara do caprino leiteiro: qual bode, qual sêmen, emprenha as fêmeas.
 *
 * ⚠️ COBERTURA NÃO É SERVIÇO: 52% dos pares de coberturas consecutivas da mesma
 * fêmea estão a 3 dias ou menos — quase todos no MESMO dia, e quase todos numa
 * fazenda só: dupla cobertura, ou o mesmo lançamento feito duas vezes. A view
 * agrupa essas coberturas num serviço só. Sem isso, nessa fazenda 72% dos
 * "serviços" seriam falsos e a taxa de concepção sairia destruída.
 *
 * ⚠️ O DENOMINADOR É O SERVIÇO COM DESFECHO CONHECIDO. O serviço deste mês ainda
 * está gestando: contá-lo como falha puniria o reprodutor que acabou de
 * trabalhar.
 */
export const dynamic = 'force-dynamic';

export default async function ServicosPage({
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

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaReproducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há serviço reprodutivo para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. O ranking por reprodutor é do plantel de UMA fazenda — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarServicos(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const servicos = res.dados;
  const resumo = resumoServicos(servicos, agora);
  const desfechos = distribuicaoDesfechos(servicos, agora);
  const reprodutores = porReprodutor(servicos, agora);
  const metodos = porMetodo(servicos, agora);
  const ordens = porOrdemParto(servicos, agora);
  const abortos = listaDeAbortos(servicos);
  const serie = serieServicos(servicos);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <VoltarParaReproducao usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Serviços reprodutivos</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.coberturas)} coberturas agrupadas em{' '}
          {formatarInteiro(resumo.servicos)} serviços — coberturas da mesma fêmea a até 3 dias são o
          mesmo cio.
        </p>
      </div>

      {servicos.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma cobertura registrada.</strong> Sem
          ela não há como saber qual reprodutor emprenha — e o bode que não emprenha continua comendo
          e cobrindo o ano inteiro sem ninguém perceber.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          <Desfechos desfechos={desfechos} resumo={resumo} />

          <Reprodutores reprodutores={reprodutores} resumo={resumo} />

          <div className="grid gap-4 lg:grid-cols-2">
            <TabelaTaxa
              titulo="Por método"
              nota="Monta, inseminação ou embrião — cada um com o seu denominador."
              grupos={metodos}
            />
            <TabelaTaxa
              titulo="Por ordem de parto"
              nota="A nulípara é onde falha de desenvolvimento aparece primeiro."
              grupos={ordens}
            />
          </div>

          {serie.length > 1 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Serviços por mês</h2>
                <p className="text-xs text-muted-foreground">
                  A estação de monta — é ela que desenha o pico de parição cinco meses depois.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'servicos', nome: 'Serviços', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          {abortos.length > 0 && <Abortos abortos={abortos} resumo={resumo} />}

          <Tabela servicos={servicos} agora={agora} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaReproducao({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/reproducao${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Reprodução
    </Link>
  );
}

function Cards({ resumo }: { resumo: ResumoServicos }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Serviços"
        valor={formatarInteiro(resumo.servicos)}
        detalhe={`${formatarInteiro(resumo.femeas)} fêmeas · ${formatarInteiro(resumo.servicosMultiplos)} com dupla cobertura`}
      />
      <KpiCard
        rotulo="Taxa de concepção"
        valor={resumo.taxa === null ? VAZIO : formatarPercentual(resumo.taxa)}
        // O denominador é a informação: serviço recente e serviço sem registro
        // ficam fora, nem sucesso nem falha.
        detalhe={`sobre ${formatarInteiro(resumo.comDesfecho)} serviços com desfecho conhecido`}
      />
      <KpiCard
        rotulo="Serviços por concepção"
        valor={
          resumo.servicosPorConcepcao === null ? VAZIO : formatarNumero(resumo.servicosPorConcepcao, 2)
        }
        detalhe="quantas coberturas custa cada prenhez"
      />
      <KpiCard
        rotulo="Voltaram ao cio"
        valor={formatarInteiro(resumo.retornosCio)}
        detalhe={`novo serviço entre ${RETORNO_CIO.de} e ${RETORNO_CIO.ate} dias — o anterior falhou`}
      />
      <KpiCard
        rotulo="Abortos"
        // Só os de ANTES do termo: aborto lançado com 145+ dias é cria morta ao
        // nascer, e somá-lo aqui mandaria o consultor atrás de uma doença que é
        // hábito de lançamento.
        valor={formatarInteiro(resumo.abortos - resumo.abortosATermo)}
        detalhe={[
          resumo.taxaAborto === null ? null : `${formatarPercentual(resumo.taxaAborto)} das concepções`,
          resumo.abortosATermo > 0
            ? `+${formatarInteiro(resumo.abortosATermo)} lançados a termo, à parte`
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || undefined}
      />
      <KpiCard
        rotulo="Aguardando desfecho"
        valor={formatarInteiro(resumo.aguardando)}
        detalhe={`serviços com menos de ${JANELA_GESTACAO} dias — ainda podem parir`}
      />
    </div>
  );
}

function Desfechos({ desfechos, resumo }: { desfechos: ContagemDesfecho[]; resumo: ResumoServicos }) {
  const maior = Math.max(...desfechos.map((d) => d.servicos), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">O que aconteceu depois de cada serviço</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(resumo.servicos)} serviços, na ordem do evento mais conclusivo.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {desfechos.map((d) => (
          <li key={d.desfecho} className="grid grid-cols-[15rem_1fr_5.5rem] items-center gap-3 text-sm">
            <span className="truncate text-foreground">{d.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${
                  d.concebeu === true
                    ? 'bg-primary'
                    : d.concebeu === false
                      ? 'bg-destructive/70'
                      : 'bg-muted-foreground/40'
                }`}
                style={{ width: `${(d.servicos / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(d.servicos)}
              <span className="ms-1 text-xs text-muted-foreground">
                {d.fracao === null ? VAZIO : formatarPercentual(d.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Verde é concepção, vermelho é falha, cinza é &quot;não se sabe&quot; — e só as duas primeiras
        cores entram na taxa. O aborto conta como concepção de propósito: a fêmea emprenhou, o que
        falhou foi a gestação, e isso é sanidade, não fertilidade do reprodutor.
        {resumo.semInformacao > 0 && (
          <>
            {' '}
            <strong className="text-foreground">
              {formatarInteiro(resumo.semInformacao)} serviços antigos
            </strong>{' '}
            não têm DG, parto nem retorno registrados — o desfecho aconteceu e ninguém lançou.
          </>
        )}
      </p>
    </section>
  );
}

/**
 * O ranking por reprodutor — a entrega central da tela.
 *
 * Ordenado por VOLUME de serviços, não pela taxa: o bode com 3 serviços e 100%
 * não é o melhor do rebanho, é o que menos trabalhou. Abaixo de
 * MINIMO_POR_REPRODUTOR desfechos a taxa sai como fração ("2 de 3"), não como
 * percentual.
 */
function Reprodutores({
  reprodutores,
  resumo,
}: {
  reprodutores: Reprodutor[];
  resumo: ResumoServicos;
}) {
  if (reprodutores.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Qual reprodutor emprenha</h2>
        <p className="text-xs text-muted-foreground">
          Bode (monta) ou sêmen (inseminação), do que mais trabalhou para o que menos.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Reprodutor</th>
              <th className="py-1.5 pe-3 font-normal">Método</th>
              <th className="py-1.5 pe-3 text-right font-normal">Serviços</th>
              <th className="py-1.5 pe-3 text-right font-normal">Fêmeas</th>
              <th className="py-1.5 text-right font-normal">Concepção</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reprodutores.slice(0, 30).map((r) => (
              <tr key={r.reprodutor}>
                <td className="py-1.5 pe-3 text-foreground">{r.reprodutor}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">{r.metodo}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(r.servicos)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(r.femeas)}
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {r.comDesfecho === 0 ? (
                    <span className="text-xs text-muted-foreground">sem desfecho</span>
                  ) : r.comDesfecho < MINIMO_POR_REPRODUTOR ? (
                    <span className="text-muted-foreground">
                      {formatarInteiro(r.concebeu)} de {formatarInteiro(r.comDesfecho)}
                    </span>
                  ) : (
                    <span className={(r.taxa ?? 0) < 0.5 ? 'text-destructive' : 'text-foreground'}>
                      {formatarPercentual(r.taxa)}
                      <span className="ms-1 text-xs text-muted-foreground">
                        n={formatarInteiro(r.comDesfecho)}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A ordem é por volume de trabalho, não pela taxa: bode com 3 serviços e 100% não é o melhor do
        rebanho, é o que menos cobriu. Abaixo de {MINIMO_POR_REPRODUTOR} desfechos a taxa sai como
        fração, porque porcentagem sobre dois serviços é anedota.
        {resumo.paternidadeAmbigua > 0 && (
          <>
            {' '}
            {formatarInteiro(resumo.paternidadeAmbigua)} serviços com dois reprodutores no mesmo cio
            ficaram de fora — a paternidade é ambígua.
          </>
        )}
      </p>
    </section>
  );
}

function TabelaTaxa({ titulo, nota, grupos }: { titulo: string; nota: string; grupos: GrupoTaxa[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">{titulo}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>

      {grupos.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sem dado para este recorte.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {grupos.map((g) => (
            <li key={g.rotulo} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
              <span className="min-w-0 truncate text-foreground">{g.rotulo}</span>
              <span className="shrink-0 tabular-nums text-foreground">
                {g.taxa === null ? VAZIO : formatarPercentual(g.taxa)}
                <span className="ms-1 text-xs text-muted-foreground">
                  {formatarInteiro(g.concebeu)} de {formatarInteiro(g.comDesfecho)} ·{' '}
                  {formatarInteiro(g.servicos)} serv.
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Abortos({ abortos, resumo }: { abortos: Aborto[]; resumo: ResumoServicos }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Abortos</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(resumo.abortos)} gestações perdidas, com o dia da gestação em que
          aconteceram.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Serviço</th>
              <th className="py-1.5 pe-3 font-normal">Aborto</th>
              <th className="py-1.5 pe-3 text-right font-normal">Dia da gestação</th>
              <th className="py-1.5 font-normal">Reprodutor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {abortos.slice(0, 30).map((a) => (
              <tr key={`${a.animal_id}-${a.data_aborto}`}>
                <td className="py-1.5 pe-3 text-foreground">{a.nome?.trim() || a.numero}</td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(a.data_servico)}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(a.data_aborto)}
                </td>
                <td
                  className={`py-1.5 pe-3 text-right tabular-nums ${
                    a.aTermo
                      ? 'text-muted-foreground'
                      : a.diasGestacao >= 100
                        ? 'text-destructive'
                        : 'text-foreground'
                  }`}
                >
                  {formatarInteiro(a.diasGestacao)} d
                  {a.aTermo && <span className="ms-1 text-xs">a termo</span>}
                </td>
                <td className="py-1.5 text-muted-foreground">{a.reprodutor ?? VAZIO}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        O momento aponta a causa: aborto no terço final da gestação (em vermelho, de 100 a{' '}
        {TERMO_GESTACAO - 1} dias) costuma ser infeccioso — clamídia, toxoplasma, brucela —, enquanto
        perda precoce aponta nutrição ou estresse. Surto de aborto tardio é conversa com veterinário e
        laboratório, não com o reprodutor.
        {resumo.abortosATermo > 0 && (
          <>
            {' '}
            <strong className="text-foreground">
              {formatarInteiro(resumo.abortosATermo)} foram lançados com {TERMO_GESTACAO} dias ou mais
            </strong>{' '}
            — a gestação já estava a termo, então é parto com cria morta, não aborto. Ficam fora da
            taxa de aborto; vale perguntar ao produtor como ele lança cria que nasce morta.
          </>
        )}
      </p>
    </section>
  );
}

function Tabela({
  servicos,
  agora,
  usuarioId,
  sufixo,
}: {
  servicos: LinhaServico[];
  agora: Date;
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Serviços</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(servicos.length)} serviços, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 font-normal">Método</th>
              <th className="py-1.5 pe-3 font-normal">Reprodutor</th>
              <th className="py-1.5 font-normal">Desfecho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {servicos.slice(0, 100).map((s) => (
              <tr key={`${s.animal_id}-${s.data_servico}`}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">{s.nome_animal?.trim() || s.numero_animal}</span>
                  {s.coberturas > 1 && (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {formatarInteiro(s.coberturas)} cob.
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(s.data_servico)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{s.metodo ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {s.reprodutores_no_servico > 1 ? (
                    <span className="text-xs">dois no mesmo cio</span>
                  ) : (
                    (s.reprodutor ?? VAZIO)
                  )}
                </td>
                <td className="py-1.5 text-foreground">{ROTULO_DESFECHO[desfechoDe(s, agora)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {servicos.length > 100 && <>Mostrando os 100 mais recentes de {formatarInteiro(servicos.length)}. </>}
        As coberturas cruas ficam nas tabelas de{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/monta_controlada${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          monta controlada
        </Link>{' '}
        e{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/inseminacao${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          inseminação
        </Link>
        .
      </p>
    </section>
  );
}
