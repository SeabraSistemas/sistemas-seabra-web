import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  LISTA_LIMITE,
  PERIODO_SECO_ALVO,
  PERIODO_SECO_MAXIMO,
  faixasDePeriodo,
  listarSecagens,
  maisCurtas,
  normalizarTipo,
  porTipo,
  resumoSecagens,
  serieSecagens,
  type FaixaPeriodo,
  type ResumoSecagens,
  type TipoSecagem,
} from '@/lib/adm/areas/secagens';
import type { LinhaSecagem } from '@/lib/adm/areas/contrato';
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
 * SECAGEM — quanto tempo a fêmea descansa antes de parir.
 *
 * O NÚMERO DESTA TELA NÃO EXISTE EM COLUNA NENHUMA DO APP. `secagem.del` está
 * preenchida em 33% das linhas e tem máximo de 20.617 dias — 56 anos de
 * lactação. O período seco é calculado na view: dias entre a secagem e o parto
 * seguinte da mesma fêmea.
 *
 * Por que decide manejo: a glândula mamária precisa descansar para regenerar.
 * Secar tarde demais faz a próxima lactação vir menor — e é um prejuízo que só
 * aparece meses depois, quando ninguém mais liga uma coisa à outra. Secar cedo
 * demais transforma a fêmea em animal que come e não produz.
 */
export const dynamic = 'force-dynamic';

export default async function SecagensPage({
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
            ? 'Sem propriedade no escopo — não há secagem para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. O período seco é decisão de manejo de UMA fazenda — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarSecagens(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const secagens = res.dados;
  const resumo = resumoSecagens(secagens);
  const faixas = faixasDePeriodo(secagens);
  const tipos = porTipo(secagens);
  const curtas = maisCurtas(secagens);
  const serie = serieSecagens(secagens);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Secagens</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.secagens)} secagens no histórico
          {resumo.primeira && resumo.ultima
            ? `, de ${formatarData(resumo.primeira)} a ${formatarData(resumo.ultima)}.`
            : '.'}
        </p>
      </div>

      {secagens.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma secagem registrada.</strong> Sem
          ela não há período seco medido — e o prejuízo de secar tarde só aparece meses depois, na
          lactação seguinte, quando ninguém mais liga uma coisa à outra.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {resumo.comPeriodo > 0 && resumo.curtasDemais / resumo.comPeriodo > 0.3 && (
            <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
              <strong className="font-medium text-destructive">
                {formatarPercentual(resumo.curtasDemais / resumo.comPeriodo)} das secagens deram
                menos de 30 dias de descanso.
              </strong>{' '}
              São {formatarInteiro(resumo.curtasDemais)} fêmeas que pariram sem a glândula ter
              regenerado. O efeito não aparece agora: aparece na próxima lactação, menor — e aí já
              não se liga uma coisa à outra.
            </p>
          )}

          <Periodo faixas={faixas} resumo={resumo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Secagens por mês</h2>
                <p className="text-xs text-muted-foreground">
                  É a antecâmara da parição — o pico daqui vira pico de tanque dois meses depois.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'secagens', nome: 'Secagens', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          <Tipos tipos={tipos} />

          {curtas.length > 0 && <Curtas secagens={curtas} />}

          <Tabela secagens={secagens} usuarioId={usuarioId} sufixo={sufixo} />
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

function Cards({ resumo }: { resumo: ResumoSecagens }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Secagens"
        valor={formatarInteiro(resumo.secagens)}
        detalhe={`${formatarInteiro(resumo.animais)} fêmeas distintas`}
      />
      <KpiCard
        rotulo="Confirmadas"
        valor={formatarInteiro(resumo.confirmadas)}
        // A distinção não é burocrática: a não confirmada é previsão do app, e
        // contá-la como feita diria que a fazenda secou o que ela só planejou.
        detalhe={`${formatarInteiro(resumo.previstas)} ainda são previsão do app`}
      />
      <KpiCard
        rotulo="Período seco médio"
        valor={
          resumo.periodoMedio === null ? VAZIO : `${formatarNumero(resumo.periodoMedio, 0)} d`
        }
        detalhe={`alvo ~${PERIODO_SECO_ALVO} dias · sobre ${formatarInteiro(resumo.comPeriodo)} com parto posterior`}
      />
      <KpiCard
        rotulo="Descanso curto demais"
        valor={formatarInteiro(resumo.curtasDemais)}
        detalhe={
          resumo.comPeriodo > 0
            ? `${formatarPercentual(resumo.curtasDemais / resumo.comPeriodo)} — menos de 30 dias`
            : 'menos de 30 dias antes do parto'
        }
      />
      <KpiCard
        rotulo="Aguardando parto"
        valor={formatarInteiro(resumo.aguardandoParto)}
        detalhe="secou e ainda não pariu — normal nas recentes"
      />
      <KpiCard
        rotulo="Última secagem"
        valor={resumo.ultima ? formatarData(resumo.ultima) : VAZIO}
        detalhe={resumo.primeira ? `primeira em ${formatarData(resumo.primeira)}` : undefined}
      />
    </div>
  );
}

function Periodo({ faixas, resumo }: { faixas: FaixaPeriodo[]; resumo: ResumoSecagens }) {
  const maior = Math.max(...faixas.map((f) => f.secagens), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Período seco</h2>
        <p className="text-xs text-muted-foreground">
          Dias entre a secagem e o parto seguinte, sobre {formatarInteiro(resumo.comPeriodo)}{' '}
          secagens que já tiveram parto.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[12rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{faixa.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{faixa.detalhe}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${faixa.alerta ? 'bg-destructive/70' : 'bg-primary'}`}
                style={{ width: `${(faixa.secagens / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.secagens)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        As duas pontas custam, por motivos opostos: abaixo de 30 dias a glândula não regenera e a
        próxima lactação vem menor; acima de 120 a fêmea come sem produzir. Períodos acima de{' '}
        {PERIODO_SECO_MAXIMO} dias ficam fora da conta — ali já não é descanso, é fêmea que passou
        uma estação sem parir.
      </p>
    </section>
  );
}

function Tipos({ tipos }: { tipos: TipoSecagem[] }) {
  if (tipos.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Como a fazenda seca</h2>
        <p className="text-xs text-muted-foreground">
          Natural é a fêmea parando sozinha; manual é decisão de manejo.
        </p>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {tipos.map((tipo) => (
          <li key={tipo.tipo} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="truncate text-foreground">{tipo.tipo}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatarInteiro(tipo.secagens)}
              <span className="ms-1 text-xs">
                {tipo.fracao === null ? VAZIO : formatarPercentual(tipo.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Curtas({ secagens }: { secagens: LinhaSecagem[] }) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Descansos mais curtos</h2>
        <p className="text-xs text-muted-foreground">
          As {formatarInteiro(Math.min(secagens.length, LISTA_LIMITE))} fêmeas que pariram com menos
          descanso — a lista para a próxima visita.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Secagem</th>
              <th className="py-1.5 pe-3 font-normal">Parto</th>
              <th className="py-1.5 text-right font-normal">Descanso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {secagens.map((secagem) => (
              <tr key={secagem.secagem_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {secagem.nome_animal?.trim() || secagem.numero_animal}
                  </span>
                  {secagem.ordem_parto !== null && (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {secagem.ordem_parto}ª cria
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(secagem.data_secagem)}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {secagem.proximo_parto ? formatarData(secagem.proximo_parto) : VAZIO}
                </td>
                <td className="py-1.5 text-right tabular-nums text-destructive">
                  {formatarInteiro(secagem.periodo_seco)} d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Tabela({
  secagens,
  usuarioId,
  sufixo,
}: {
  secagens: LinhaSecagem[];
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Secagens</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(secagens.length)} registros, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 font-normal">Tipo</th>
              <th className="py-1.5 pe-3 font-normal">Situação</th>
              <th className="py-1.5 text-right font-normal">Período seco</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {secagens.slice(0, 100).map((secagem) => (
              <tr key={secagem.secagem_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {secagem.nome_animal?.trim() || secagem.numero_animal}
                  </span>
                  {secagem.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {secagem.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(secagem.data_secagem)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {normalizarTipo(secagem.tipo_secagem)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {secagem.confirmada ? 'confirmada' : 'prevista'}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {secagem.periodo_seco === null ? (
                    <span className="text-xs text-muted-foreground">aguardando parto</span>
                  ) : (
                    `${formatarInteiro(secagem.periodo_seco)} d`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {secagens.length > 100 && (
          <>Mostrando as 100 mais recentes de {formatarInteiro(secagens.length)}. </>
        )}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/secagem${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de secagens
        </Link>
        .
      </p>
    </section>
  );
}
