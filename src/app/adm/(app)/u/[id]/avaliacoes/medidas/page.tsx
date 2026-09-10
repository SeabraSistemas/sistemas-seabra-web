import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { normalizarTipo } from '@/lib/adm/areas/aml';
import {
  PERIMETRO_MINIMO_CM,
  diasComProblema,
  listarMedidas,
  perfilDasMedidas,
  resumoMedidas,
  separarImplausiveis,
  serieMedicoes,
  type PerfilMedida,
  type ResumoMedidas,
} from '@/lib/adm/areas/medidas';
import type { LinhaMedida } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { VAZIO, formatarData, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * MEDIDAS — a fita métrica, medição a medição.
 *
 * Irmã da AML: mesmo técnico, mesma visita, mesmo animal. A diferença de conteúdo
 * é que AQUI a média vale a pena — centímetro é grandeza contínua e comparável
 * entre animais e entre anos, enquanto o escore linear da AML é descritivo e não
 * tem ideal no banco.
 *
 * A ENTREGA QUE NÃO ESTAVA NO PLANO é o bloco de medição implausível: o dado tem
 * seis medições do mesmo dia com perímetro torácico de 19 a 29 cm em animais de
 * 70 a 78 cm de altura. É campo trocado (o número bate com a largura de peito da
 * mesma linha), e o padrão — mesmo dia, mesmo técnico — é o que permite pedir a
 * remedição a quem mediu.
 */
export const dynamic = 'force-dynamic';

export default async function MedidasPage({
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
        <VoltarParaAvaliacoes usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há medição para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Medida média de rebanhos diferentes não é medida de ninguém — escolha uma fazenda no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarMedidas(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const { validas, implausiveis } = separarImplausiveis(res.dados);
  const resumo = resumoMedidas(validas);
  const perfil = perfilDasMedidas(validas);
  const serie = serieMedicoes(validas);
  const problemas = diasComProblema(implausiveis);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <VoltarParaAvaliacoes usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Medidas corporais</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(res.dados.length)} medições no histórico desta fazenda
          {resumo.primeira && resumo.ultima
            ? `, de ${formatarData(resumo.primeira)} a ${formatarData(resumo.ultima)}.`
            : '.'}
        </p>
      </div>

      {implausiveis.length > 0 && (
        <section className="rounded-2xl border border-destructive/40 bg-card p-4">
          <h2 className="text-base text-destructive">
            {formatarInteiro(implausiveis.length)} medições com perímetro impossível
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perímetro torácico abaixo de {PERIMETRO_MINIMO_CM} cm em animal adulto não existe — o
            número anotado costuma ser a <strong className="text-foreground">largura</strong> de
            peito, preenchida no campo errado. Elas ficaram de fora de todas as médias.
          </p>

          <ul className="mt-3 flex flex-col divide-y divide-border">
            {implausiveis.slice(0, 10).map((medida) => (
              <li
                key={medida.medida_id}
                className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
              >
                <span className="truncate text-foreground">
                  {medida.nome_animal?.trim() || medida.numero_animal}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  perímetro {formatarNumero(medida.perimetro_toracico, 0)} cm · altura{' '}
                  {formatarNumero(medida.altura, 0)} cm · {formatarData(medida.data_medida)}
                </span>
              </li>
            ))}
          </ul>

          {problemas.length > 0 && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              Concentradas em{' '}
              {problemas
                .map((p) => `${formatarData(p.data)} (${formatarInteiro(p.medicoes)})`)
                .join(', ')}
              . Dia inteiro com o mesmo erro é campo trocado na coleta, não engano de digitação —
              vale pedir a remedição a quem mediu.
            </p>
          )}
        </section>
      )}

      {validas.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma medição válida.</strong> A fita
          métrica é o registro mais barato de porte e crescimento — e o único comparável entre anos
          sem depender de balança.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {serie.length > 1 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Medições por mês</h2>
                <p className="text-xs text-muted-foreground">
                  Mostra se a fita métrica virou rotina ou foi mutirão isolado.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'medicoes', nome: 'Medições', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={220}
                />
              </div>
            </section>
          )}

          <Perfil perfil={perfil} />

          <Tabela medidas={validas} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaAvaliacoes({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/avaliacoes${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Avaliações
    </Link>
  );
}

function Cards({ resumo }: { resumo: ResumoMedidas }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Medições"
        valor={formatarInteiro(resumo.medicoes)}
        detalhe={`${formatarInteiro(resumo.animais)} animais distintos`}
      />
      <KpiCard
        rotulo="Perímetro torácico"
        valor={resumo.perimetroMedio === null ? VAZIO : `${formatarNumero(resumo.perimetroMedio, 1)} cm`}
        detalhe="média do rebanho medido"
      />
      <KpiCard
        rotulo="Altura"
        valor={resumo.alturaMedia === null ? VAZIO : `${formatarNumero(resumo.alturaMedia, 1)} cm`}
        detalhe="média do rebanho medido"
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(resumo.femeas)} · ${formatarInteiro(resumo.machos)}`}
        detalhe="grafias de 'fêmea' já unificadas"
      />
      <KpiCard
        rotulo="Remedidos"
        valor={formatarInteiro(resumo.remedidos)}
        detalhe="animais com mais de uma medição — dá para ver crescimento"
      />
      <KpiCard
        rotulo="Última medição"
        valor={resumo.ultima ? formatarData(resumo.ultima) : VAZIO}
        detalhe={resumo.primeira ? `primeira em ${formatarData(resumo.primeira)}` : undefined}
      />
    </div>
  );
}

function Perfil({ perfil }: { perfil: PerfilMedida[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Perfil das medidas</h2>
        <p className="text-xs text-muted-foreground">
          Em centímetros. Cada medida com o seu denominador — úbere só existe em fêmea, escrotal só
          em macho.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Medida</th>
              <th className="py-1.5 pe-3 text-right font-normal">Média</th>
              <th className="py-1.5 pe-3 text-right font-normal">Mínimo</th>
              <th className="py-1.5 pe-3 text-right font-normal">Máximo</th>
              <th className="py-1.5 text-right font-normal">Medições</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {perfil.map((medida) => (
              <tr key={medida.chave}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">{medida.rotulo}</span>
                  {medida.grupo !== 'corpo' && (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {medida.grupo === 'ubere' ? 'úbere' : 'macho'}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {medida.media === null ? VAZIO : formatarNumero(medida.media, 1)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {medida.minimo === null ? VAZIO : formatarNumero(medida.minimo, 0)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {medida.maximo === null ? VAZIO : formatarNumero(medida.maximo, 0)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(medida.medicoes)}
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
  medidas,
  usuarioId,
  sufixo,
}: {
  medidas: LinhaMedida[];
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Medições</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(medidas.length)} registros, do mais recente para o mais antigo.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Tipo</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 text-right font-normal">Perímetro</th>
              <th className="py-1.5 pe-3 text-right font-normal">Altura</th>
              <th className="py-1.5 text-right font-normal">Larg. peito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {medidas.slice(0, 100).map((medida) => (
              <tr key={medida.medida_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {medida.nome_animal?.trim() || medida.numero_animal}
                  </span>
                  {medida.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {medida.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{normalizarTipo(medida.tipo)}</td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(medida.data_medida)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {medida.perimetro_toracico === null
                    ? VAZIO
                    : `${formatarNumero(medida.perimetro_toracico, 0)} cm`}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {medida.altura === null ? VAZIO : `${formatarNumero(medida.altura, 0)} cm`}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {medida.largura_peito === null
                    ? VAZIO
                    : `${formatarNumero(medida.largura_peito, 0)} cm`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {medidas.length > 100 && (
          <>Mostrando as 100 mais recentes de {formatarInteiro(medidas.length)}. </>
        )}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/medidas${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de medidas
        </Link>
        .
      </p>
    </section>
  );
}
