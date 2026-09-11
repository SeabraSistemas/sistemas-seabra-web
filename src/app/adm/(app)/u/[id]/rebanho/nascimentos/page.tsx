import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  PERIODOS,
  PESO_NASCER_MAXIMO_KG,
  ROTULO_PERIODO,
  distribuicaoPeso,
  inicioDoPeriodo,
  lerPeriodo,
  listarNascimentos,
  maesMaisProlificas,
  porNinhada,
  resumoNascimentos,
  serieNascimentos,
  type FaixaPeso,
  type GrupoNinhada,
  type MaeProlifica,
  type Periodo,
  type ResumoNascimentos,
} from '@/lib/adm/areas/nascimentos';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarInteiro,
  formatarKg,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * NASCIMENTOS — a cria como evento.
 *
 * A ENTREGA QUE JUSTIFICA A TELA é o cruzamento PESO × NINHADA. Cria única nasce
 * mais pesada que gemelar, e a diferença é de meio quilo ou mais: comparar o
 * peso médio de um ano com o de outro sem olhar a proporção de gemelares
 * compara duas populações diferentes e chama a diferença de melhora nutricional.
 *
 * A segunda é a mortalidade DOS NASCIDOS — perder cria nos primeiros trinta dias
 * é colostro e assistência ao parto, e a aba Sanidade soma isso com a morte de
 * adulto no mesmo card.
 */
export const dynamic = 'force-dynamic';

export default async function NascimentosPage({
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
        <VoltarParaRebanho usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há nascimento para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Peso ao nascer e prolificidade são de UM rebanho — escolha uma fazenda no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarNascimentos(alvo.id, inicioDoPeriodo(periodo, agora));
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const nascimentos = res.dados;
  const resumo = resumoNascimentos(nascimentos);
  const ninhadas = porNinhada(nascimentos);
  const faixas = distribuicaoPeso(nascimentos);
  const serie = serieNascimentos(nascimentos);
  const maes = maesMaisProlificas(nascimentos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VoltarParaRebanho usuarioId={usuarioId} sufixo={sufixo} />
          <h1 className="mt-1 text-lg">Nascimentos · {ROTULO_PERIODO[periodo]}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            O parto não tem tabela no banco: ele é a chegada das crias com mãe e data. A ninhada
            inteira conta como um parto.
          </p>
        </div>
        <Periodos usuarioId={usuarioId} selecao={selecao} atual={periodo} />
      </div>

      {nascimentos.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          Nenhum nascimento em {ROTULO_PERIODO[periodo]}. Amplie o período acima — ou esta fazenda
          não lançou parição, que já é a informação.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} periodo={periodo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Nascimentos mês a mês</h2>
                <p className="text-xs text-muted-foreground">
                  A sazonalidade de parição manda no tanque cinco meses depois — é ela que explica o
                  pico e o vale da produção.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'nascimentos', nome: 'Crias nascidas', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={260}
                />
              </div>
            </section>
          )}

          <Ninhadas ninhadas={ninhadas} resumo={resumo} />

          <Pesos faixas={faixas} resumo={resumo} />

          <Maes maes={maes} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaRebanho({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/rebanho${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Rebanho
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
  const base = `/adm/u/${usuarioId}/rebanho/nascimentos`;
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

function Cards({ resumo, periodo }: { resumo: ResumoNascimentos; periodo: Periodo }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo={`Crias · ${ROTULO_PERIODO[periodo]}`}
        valor={formatarInteiro(resumo.crias)}
        detalhe={`em ${formatarInteiro(resumo.partos)} partos`}
      />
      <KpiCard
        rotulo="Prolificidade"
        valor={resumo.prolificidade === null ? VAZIO : formatarNumero(resumo.prolificidade, 2)}
        // O denominador importa: prolificidade só é calculável sobre crias com
        // mãe cadastrada, e sem mãe não se sabe de que parto a cria veio.
        detalhe={
          resumo.semMae > 0
            ? `crias por parto — ${formatarInteiro(resumo.semMae)} crias sem mãe ficaram fora`
            : 'crias por parto'
        }
      />
      <KpiCard
        rotulo="Peso ao nascer"
        valor={formatarKg(resumo.pesoMedio, 2)}
        detalhe={`média de ${formatarInteiro(resumo.comPeso)} crias pesadas`}
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(resumo.femeas)} · ${formatarInteiro(resumo.machos)}`}
        detalhe={
          resumo.semSexo > 0 ? `${formatarInteiro(resumo.semSexo)} sem sexo cadastrado` : undefined
        }
      />
      <KpiCard
        rotulo="Já morreram"
        valor={formatarInteiro(resumo.mortas)}
        detalhe={
          resumo.crias > 0
            ? `${formatarPercentual(resumo.mortas / resumo.crias)} das crias do período`
            : undefined
        }
      />
      <KpiCard
        rotulo="Mortes até 30 dias"
        valor={formatarInteiro(resumo.mortasNeonatal)}
        detalhe="colostro e assistência ao parto"
      />
    </div>
  );
}

/**
 * Peso e mortalidade por tamanho de ninhada — a leitura central da tela.
 * Desenhada como tabela porque são três números por linha que se leem juntos, e
 * nenhum deles é ranking.
 */
function Ninhadas({ ninhadas, resumo }: { ninhadas: GrupoNinhada[]; resumo: ResumoNascimentos }) {
  if (ninhadas.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Peso e mortalidade por tamanho de ninhada</h2>
        <p className="text-xs text-muted-foreground">
          Sobre as crias com mãe cadastrada
          {resumo.semMae > 0 && ` — ${formatarInteiro(resumo.semMae)} ficaram de fora`}.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Ninhada</th>
              <th className="py-1.5 pe-3 text-right font-normal">Partos</th>
              <th className="py-1.5 pe-3 text-right font-normal">Crias</th>
              <th className="py-1.5 pe-3 text-right font-normal">Peso médio</th>
              <th className="py-1.5 text-right font-normal">Mortalidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ninhadas.map((grupo) => (
              <tr key={grupo.tamanho}>
                <td className="py-1.5 pe-3 text-foreground">{grupo.rotulo}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(grupo.partos)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(grupo.crias)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarKg(grupo.pesoMedio, 2)}
                  <span className="ms-1 text-xs text-muted-foreground">
                    n={formatarInteiro(grupo.comPeso)}
                  </span>
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {grupo.mortalidade === null ? VAZIO : formatarPercentual(grupo.mortalidade)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Cria única nasce mais pesada que gemelar — é biologia, não manejo. Por isso comparar o peso
        médio de um ano com o de outro só quer dizer alguma coisa se a proporção de gemelares for
        parecida; senão, o que mudou foi a população, não a nutrição.
      </p>
    </section>
  );
}

function Pesos({ faixas, resumo }: { faixas: FaixaPeso[]; resumo: ResumoNascimentos }) {
  const maior = Math.max(...faixas.map((f) => f.crias), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Distribuição do peso ao nascer</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.comPeso)} crias pesadas.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa, indice) => (
          <li key={faixa.rotulo} className="grid grid-cols-[7.5rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                // A primeira faixa (até 2 kg) é a de risco: cria abaixo disso
                // precisa de colostro assistido, então ela é destacada em vez de
                // pintada como as outras.
                className={`block h-full rounded-full ${indice === 0 ? 'bg-destructive/70' : 'bg-primary'}`}
                style={{ width: `${(faixa.crias / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.crias)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Cria abaixo de 2 kg tem risco alto e precisa de colostro assistido — por isso a faixa está
        destacada.
        {resumo.pesoImplausivel > 0 && (
          <>
            {' '}
            <strong className="text-destructive">
              {formatarInteiro(resumo.pesoImplausivel)} crias
            </strong>{' '}
            ficaram fora da conta por peso impossível (zero, negativo ou acima de{' '}
            {PESO_NASCER_MAXIMO_KG} kg — a base tem um registro de 408 kg, que é peso de boi
            adulto).
          </>
        )}
      </p>
    </section>
  );
}

function Maes({
  maes,
  usuarioId,
  sufixo,
}: {
  maes: MaeProlifica[];
  usuarioId: number;
  sufixo: string;
}) {
  if (maes.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Mães que mais entregaram cria</h2>
        <p className="text-xs text-muted-foreground">No período escolhido.</p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Matriz</th>
              <th className="py-1.5 pe-3 text-right font-normal">Partos</th>
              <th className="py-1.5 pe-3 text-right font-normal">Crias</th>
              <th className="py-1.5 text-right font-normal">Crias por parto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {maes.map((mae) => (
              <tr key={mae.mae_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">{mae.nome?.trim() || mae.numero}</span>
                  {mae.nome?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {mae.numero}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(mae.partos)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarInteiro(mae.crias)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {formatarNumero(mae.prolificidade, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para a lista completa das crias, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/rebanho${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela do rebanho
        </Link>{' '}
        e ordene por data de nascimento.
      </p>
    </section>
  );
}
