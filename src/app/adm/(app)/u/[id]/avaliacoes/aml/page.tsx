import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  RANKING_LIMITE,
  faixasDePontuacao,
  listarAmls,
  mediasPorPonto,
  melhoresAmls,
  normalizarTipo,
  pontosMaisDesiguais,
  resumoAml,
  serieAvaliacoes,
  type FaixaPontuacao,
  type MediaPonto,
  type ResumoAml,
} from '@/lib/adm/areas/aml';
import type { LinhaAml } from '@/lib/adm/areas/contrato';
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
 * AML — quem foi avaliado, com que nota, e quanto do rebanho já passou.
 *
 * A aba Avaliações mostra o radar dos 16 pontos e a pontuação mensal. Esta tela
 * responde o resto: a lista dos animais, o ranking pela nota composta, a
 * cobertura (quantos do plantel têm AML) e a dispersão de cada característica.
 *
 * ⚠️ O QUE ESTA TELA SE RECUSA A FAZER, e é decisão de conteúdo: NÃO existe aqui
 * um bloco de "pontos fortes e fracos". Escore linear é descritivo — 9 em
 * profundidade de úbere quer dizer úbere profundo, que é DEFEITO, enquanto 9 em
 * mobilidade é virtude. Sem tabela de ideal por característica (que o banco não
 * tem), ordenar as médias produziria um ranking com cara de diagnóstico e
 * conteúdo de sorteio. No lugar: perfil, denominador e dispersão.
 */
export const dynamic = 'force-dynamic';

export default async function AmlPage({
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
            ? 'Sem propriedade no escopo — não há avaliação para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. A cobertura da AML é sobre o plantel de UMA fazenda — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarAmls(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const amls = res.dados;
  const resumo = resumoAml(amls);
  const medias = mediasPorPonto(amls);
  const desiguais = pontosMaisDesiguais(medias);
  const faixas = faixasDePontuacao(amls);
  const melhores = melhoresAmls(amls);
  const serie = serieAvaliacoes(amls);

  // O plantel vivo vem do escopo — é o mesmo número que o cabeçalho da ficha
  // mostra, então cobertura e efetivo nunca discordam entre as duas telas.
  const cobertura = alvo.animais_ativos > 0 ? resumo.animais / alvo.animais_ativos : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <VoltarParaAvaliacoes usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Avaliação morfológica linear</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(amls.length)} avaliações no histórico desta fazenda
          {resumo.primeira && resumo.ultima
            ? `, de ${formatarData(resumo.primeira)} a ${formatarData(resumo.ultima)}.`
            : '.'}
        </p>
      </div>

      {amls.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma AML registrada.</strong> A avaliação
          morfológica é o que transforma opinião sobre o animal em nota comparável — e é serviço de
          técnico habilitado, ou seja, é venda antes de ser dado.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} cobertura={cobertura} plantel={alvo.animais_ativos} />

          {serie.length > 1 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Avaliações por mês</h2>
                <p className="text-xs text-muted-foreground">
                  Mostra se a AML virou rotina ou se foi um mutirão isolado.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'amls', nome: 'Avaliações', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={220}
                />
              </div>
            </section>
          )}

          <Faixas faixas={faixas} resumo={resumo} />

          <Perfil medias={medias} desiguais={desiguais} />

          <Melhores amls={melhores} usuarioId={usuarioId} sufixo={sufixo} />
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

function Cards({
  resumo,
  cobertura,
  plantel,
}: {
  resumo: ResumoAml;
  cobertura: number | null;
  plantel: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Avaliações"
        valor={formatarInteiro(resumo.avaliacoes)}
        detalhe={`${formatarInteiro(resumo.animais)} animais distintos`}
      />
      <KpiCard
        rotulo="Cobertura do plantel"
        valor={cobertura === null ? VAZIO : formatarPercentual(cobertura)}
        detalhe={`${formatarInteiro(resumo.animais)} de ${formatarInteiro(plantel)} animais ativos`}
      />
      <KpiCard
        rotulo="Pontuação média"
        valor={resumo.pontuacaoMedia === null ? VAZIO : formatarNumero(resumo.pontuacaoMedia, 1)}
        detalhe={`nota composta 0–100, sobre ${formatarInteiro(resumo.comPontuacao)} avaliações`}
      />
      <KpiCard
        rotulo="Melhor nota"
        valor={
          resumo.melhor?.pontuacao_total === undefined || resumo.melhor?.pontuacao_total === null
            ? VAZIO
            : formatarNumero(resumo.melhor.pontuacao_total, 1)
        }
        detalhe={resumo.melhor ? (resumo.melhor.nome_animal?.trim() || resumo.melhor.numero_animal) : undefined}
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(resumo.femeas)} · ${formatarInteiro(resumo.machos)}`}
        // A normalização importa: a coluna tem 'fêmea' e 'femea', e sem juntar
        // as duas grafias cada metade pareceria uma amostra pequena.
        detalhe="grafias de 'fêmea' já unificadas"
      />
      <KpiCard
        rotulo="Reavaliados"
        valor={formatarInteiro(resumo.reavaliados)}
        detalhe="animais com mais de uma AML — dá para ver evolução"
      />
    </div>
  );
}

function Faixas({ faixas, resumo }: { faixas: FaixaPontuacao[]; resumo: ResumoAml }) {
  const maior = Math.max(...faixas.map((f) => f.avaliacoes), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Distribuição da pontuação</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.comPontuacao)} avaliações com nota. Aqui maior É melhor — a
          pontuação total é nota composta, não escore descritivo.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(faixa.avaliacoes / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.avaliacoes)}
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

/**
 * O perfil dos 16 pontos, NA ORDEM DA FICHA (1 a 16) — não ordenado por média.
 * Ordenar aqui seria justamente o ranking que o cabeçalho deste arquivo explica
 * por que não existe.
 */
function Perfil({ medias, desiguais }: { medias: MediaPonto[]; desiguais: MediaPonto[] }) {
  const chavesDesiguais = new Set(desiguais.map((d) => d.numero));

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Perfil dos 16 pontos</h2>
        <p className="text-xs text-muted-foreground">
          Escala 1 a 9, na ordem da ficha. Cada ponto com o seu denominador.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {medias.map((ponto) => (
          <li key={ponto.numero} className="grid grid-cols-[13rem_1fr_7rem] items-center gap-3 text-sm">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {ponto.numero}
              </span>
              <span className="truncate text-foreground">{ponto.rotulo}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${
                  ponto.grupo === 'ubere' ? 'bg-primary/45' : 'bg-primary'
                }`}
                // Escala fixa de 1 a 9: a barra é a posição na escala, não uma
                // proporção do maior — comparar pontos entre si é exatamente o
                // que não se deve fazer aqui.
                style={{ width: `${(((ponto.media ?? 0) - 1) / 8) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {ponto.media === null ? VAZIO : formatarNumero(ponto.media, 1)}
              <span className="ms-1 text-xs text-muted-foreground">
                n={formatarInteiro(ponto.medicoes)}
                {chavesDesiguais.has(ponto.numero) && ponto.desvio !== null && (
                  <span className="ms-1" title="Um dos pontos com maior variação entre os animais">
                    ±{formatarNumero(ponto.desvio, 1)}
                  </span>
                )}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Os sete pontos de úbere (barra clara) têm denominador menor de propósito: eles não existem em
        macho. E não há aqui nenhuma leitura de &quot;ponto forte&quot; ou &quot;fraco&quot;: em
        escore linear o 9 descreve a característica, não a elogia — úbere profundo é 9 e é defeito.
        O ± marca as características em que o rebanho é mais desigual, que é onde a seleção tem
        material para trabalhar.
      </p>
    </section>
  );
}

function Melhores({
  amls,
  usuarioId,
  sufixo,
}: {
  amls: LinhaAml[];
  usuarioId: number;
  sufixo: string;
}) {
  if (amls.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Maiores pontuações</h2>
        <p className="text-xs text-muted-foreground">
          As {formatarInteiro(Math.min(amls.length, RANKING_LIMITE))} melhores notas — as candidatas
          naturais a matriz e a vitrine.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Tipo</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 text-right font-normal">Pontuação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {amls.map((aml) => (
              <tr key={aml.aml_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {aml.nome_animal?.trim() || aml.numero_animal}
                  </span>
                  {aml.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {aml.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{normalizarTipo(aml.tipo)}</td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(aml.data_avaliacao)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {aml.pontuacao_total === null ? VAZIO : formatarNumero(aml.pontuacao_total, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para as 32 colunas de nota e classificação, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/avaliacao_morfologica_linear${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de avaliações
        </Link>
        .
      </p>
    </section>
  );
}
