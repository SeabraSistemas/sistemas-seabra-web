import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  JANELA_DESFECHO,
  LISTA_LIMITE,
  MINIMO_PARA_LETALIDADE,
  listarCasos,
  morreuAposCaso,
  porSuspeita,
  reincidentes,
  resumoClinica,
  serieCasos,
  type AnimalReincidente,
  type ResumoClinica,
  type SuspeitaClinica,
} from '@/lib/adm/areas/clinica';
import type { LinhaCaso } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * CLÍNICA — quem adoeceu, de quê, e o que aconteceu depois.
 *
 * A ENTREGA QUE JUSTIFICA A TELA é a LETALIDADE POR SUSPEITA. A aba Sanidade
 * conta casos de um lado e óbitos do outro; a pergunta que decide protocolo está
 * no meio — de cada dez animais que tiveram um caso de X, quantos morreram logo
 * depois. No dado real isso separa Clostridiose (16 mortes em 20 casos) de
 * Mastite subclínica (nenhuma em 27), e é exatamente a conversa de prioridade de
 * vacina, com o número do próprio cliente.
 *
 * ⚠️ É UMA AFIRMAÇÃO SOBRE SEQUÊNCIA, NÃO SOBRE CAUSA. Só conta a morte que veio
 * dentro de {JANELA_DESFECHO} dias do caso, e a tela escreve "morreu em até 60
 * dias do caso" — nunca "morreu disso".
 */
export const dynamic = 'force-dynamic';

export default async function ClinicaPage({
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
        <VoltarParaSanidade usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há caso clínico para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. A letalidade de cada suspeita é do rebanho daquela fazenda — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarCasos(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const casos = res.dados;
  const resumo = resumoClinica(casos);
  const suspeitas = porSuspeita(casos);
  const repetidos = reincidentes(casos);
  const serie = serieCasos(casos);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaSanidade usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Casos clínicos</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.casos)} casos no histórico
          {resumo.primeiro && resumo.ultimo
            ? `, de ${formatarData(resumo.primeiro)} a ${formatarData(resumo.ultimo)}.`
            : '.'}
        </p>
      </div>

      {casos.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhum caso clínico registrado.</strong>{' '}
          Pode ser rebanho saudável ou módulo que ninguém usa — e a diferença aparece cruzando com a
          mortalidade: fazenda que perde animal e não registra caso nenhum não está sem doença, está
          sem registro.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          <Suspeitas suspeitas={suspeitas} resumo={resumo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Casos por mês</h2>
                <p className="text-xs text-muted-foreground">
                  A curva de morbidade costuma ter estação — verminose e pneumonia respondem a chuva
                  e a frio.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'casos', nome: 'Casos clínicos', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          {repetidos.length > 0 && <Reincidentes animais={repetidos} />}

          <Tabela casos={casos} usuarioId={usuarioId} sufixo={sufixo} />
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

function Cards({ resumo }: { resumo: ResumoClinica }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Casos"
        valor={formatarInteiro(resumo.casos)}
        detalhe={`${formatarInteiro(resumo.animais)} animais distintos`}
      />
      <KpiCard
        rotulo="Reincidentes"
        valor={formatarInteiro(resumo.reincidentes)}
        detalhe="animais que adoeceram mais de uma vez"
      />
      <KpiCard
        rotulo={`Morreram em até ${JANELA_DESFECHO} dias`}
        valor={formatarInteiro(resumo.mortes)}
        // "Morreram DEPOIS do caso", e não "morreram disso" — a tela não afirma
        // causa em lugar nenhum.
        detalhe={
          resumo.letalidade === null
            ? undefined
            : `${formatarPercentual(resumo.letalidade)} dos casos — sequência, não causa`
        }
      />
      <KpiCard
        rotulo="Suspeitas distintas"
        valor={formatarInteiro(resumo.suspeitasDistintas)}
        detalhe="do catálogo do app e do vocabulário do criador"
      />
      <KpiCard
        rotulo="Com sinais descritos"
        valor={formatarInteiro(resumo.comSinais)}
        detalhe={
          resumo.casos > 0 ? `${formatarPercentual(resumo.comSinais / resumo.casos)} dos casos` : undefined
        }
      />
      <KpiCard
        rotulo="Com tratamento registrado"
        valor={formatarInteiro(resumo.comTratamento)}
        detalhe={
          resumo.casos > 0
            ? `${formatarPercentual(resumo.comTratamento / resumo.casos)} — sem isso não há custo de sanidade`
            : undefined
        }
      />
    </div>
  );
}

/**
 * O ranking de suspeitas com a letalidade de cada uma.
 *
 * Ordenado por VOLUME de casos, não por letalidade: uma suspeita com dois casos
 * e duas mortes tem 100% e não é o problema da fazenda. Abaixo de
 * MINIMO_PARA_LETALIDADE casos a barra não é desenhada — percentual sobre três
 * casos é anedota com cara de estatística.
 */
function Suspeitas({ suspeitas, resumo }: { suspeitas: SuspeitaClinica[]; resumo: ResumoClinica }) {
  const maior = Math.max(...suspeitas.map((s) => s.casos), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Suspeitas e o que aconteceu depois</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.casos)} casos. A morte contada é a que veio em até{' '}
          {JANELA_DESFECHO} dias.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-2">
        {suspeitas.map((suspeita) => (
          <li key={suspeita.suspeita} className="grid grid-cols-[13rem_1fr_9rem] items-center gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{suspeita.suspeita}</span>
              {suspeita.tipo === 'propriedade' && (
                <span className="block truncate text-xs text-muted-foreground">
                  suspeita criada por este criador
                </span>
              )}
            </span>
            <span className="flex h-3 overflow-hidden rounded-full bg-secondary" aria-hidden>
              {/* A barra é dividida: a parte escura é quem morreu depois. */}
              <span
                className="block bg-destructive/70"
                style={{ width: `${(suspeita.mortes / maior) * 100}%` }}
              />
              <span
                className="block bg-primary"
                style={{ width: `${((suspeita.casos - suspeita.mortes) / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(suspeita.casos)}
              <span className="ms-1 text-xs text-muted-foreground">
                {suspeita.casos >= MINIMO_PARA_LETALIDADE ? (
                  <>{formatarPercentual(suspeita.letalidade)} morreram</>
                ) : suspeita.mortes > 0 ? (
                  <>{formatarInteiro(suspeita.mortes)} morreram</>
                ) : (
                  'nenhuma morte'
                )}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A ordem é por VOLUME de casos, e não por letalidade: suspeita com dois casos e duas mortes dá
        100% e não é o problema da fazenda. Abaixo de {MINIMO_PARA_LETALIDADE} casos a tela mostra o
        número absoluto em vez do percentual, porque porcentagem sobre três casos é anedota com cara
        de estatística. E nada aqui afirma causa — só que a morte veio depois.
      </p>
    </section>
  );
}

function Reincidentes({ animais }: { animais: AnimalReincidente[] }) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Animais que voltaram à enfermaria</h2>
        <p className="text-xs text-muted-foreground">
          Os {formatarInteiro(Math.min(animais.length, LISTA_LIMITE))} com mais casos.
        </p>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {animais.map((animal) => (
          <li key={animal.animal_id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">
                {animal.nome?.trim() || animal.numero}
                {animal.morreu && (
                  <span className="ms-2 text-xs text-destructive">morreu depois</span>
                )}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {animal.suspeitas.join(' · ')}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-foreground">
              {formatarInteiro(animal.casos)} casos
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Animal que volta à enfermaria custa tratamento, custa leite e costuma ser candidato a
        descarte — e essa conversa não acontece se ninguém somar os casos por animal.
      </p>
    </section>
  );
}

function Tabela({
  casos,
  usuarioId,
  sufixo,
}: {
  casos: LinhaCaso[];
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Casos</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(casos.length)} registros, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 font-normal">Suspeita</th>
              <th className="py-1.5 pe-3 font-normal">Sinais</th>
              <th className="py-1.5 font-normal">Desfecho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {casos.slice(0, 100).map((caso) => (
              <tr key={caso.caso_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {caso.nome_animal?.trim() || caso.numero_animal}
                  </span>
                  {caso.categoria && (
                    <span className="ms-2 text-xs text-muted-foreground">{caso.categoria}</span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(caso.data_do_caso)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{caso.suspeita ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  <span className="line-clamp-1">{caso.sinais?.trim() || VAZIO}</span>
                </td>
                <td className="py-1.5">
                  {morreuAposCaso(caso) ? (
                    <span className="text-destructive">
                      morreu em {formatarInteiro(caso.dias_ate_obito)} d
                    </span>
                  ) : caso.data_obito ? (
                    <span className="text-muted-foreground">
                      morreu depois ({formatarInteiro(caso.dias_ate_obito)} d)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">vivo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {casos.length > 100 && <>Mostrando os 100 mais recentes de {formatarInteiro(casos.length)}. </>}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/clinica${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de casos clínicos
        </Link>
        .
      </p>
    </section>
  );
}
