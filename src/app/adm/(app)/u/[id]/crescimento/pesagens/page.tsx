import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  PESO_MAXIMO_KG,
  RANKING_LIMITE,
  distribuicaoGmd,
  listarPesagens,
  melhoresGanhos,
  pioresGanhos,
  porCategoria,
  resumoPesagens,
  seriePesagens,
  sessoesDePesagem,
  type CategoriaPeso,
  type FaixaGmd,
  type ResumoPesagens,
  type SessaoPesagem,
} from '@/lib/adm/areas/pesagens';
import type { LinhaPesagem } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarKg,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * PESAGENS — a balança: quando, quanto do rebanho, e quanto cada um ganhou.
 *
 * A aba Crescimento já tem a nuvem peso × idade e os 20 piores GMD. Esta tela
 * acrescenta as sessões de curral (quando a fazenda pesa e quantos passam), a
 * distribuição do ganho — e não só a cauda ruim — e o ganho por categoria, que é
 * onde a conversa de nutrição acontece.
 *
 * ⚠️ O "GMD ENTRE PESAGENS" DAQUI NÃO É O "GMD MÉDIO" DA ABA CRESCIMENTO, e o
 * nome é diferente por isso. Lá: 12 meses, sem filtro de intervalo. Aqui: todo o
 * histórico, e só intervalos de 15 a 365 dias — duas pesagens com três dias de
 * diferença transformam 1 kg de erro de balança em 0,33 kg/dia de "ganho". Dois
 * recortes com o mesmo nome seriam dois números discordando na cara do operador.
 */
export const dynamic = 'force-dynamic';

export default async function PesagensPage({
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
        <VoltarParaCrescimento usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há pesagem para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Cobertura da balança e ganho por categoria são de UM rebanho — escolha uma fazenda no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarPesagens(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const pesagens = res.dados;
  const resumo = resumoPesagens(pesagens);
  const sessoes = sessoesDePesagem(pesagens);
  const faixas = distribuicaoGmd(pesagens);
  const categorias = porCategoria(pesagens);
  const melhores = melhoresGanhos(pesagens);
  const piores = pioresGanhos(pesagens);
  const serie = seriePesagens(pesagens);

  const cobertura = alvo.animais_ativos > 0 ? resumo.animais / alvo.animais_ativos : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <VoltarParaCrescimento usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Pesagens</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.pesagens)} pesagens em {formatarInteiro(resumo.sessoes)} dias de
          curral
          {resumo.primeira && resumo.ultima
            ? `, de ${formatarData(resumo.primeira)} a ${formatarData(resumo.ultima)}.`
            : '.'}
        </p>
      </div>

      {pesagens.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Nenhuma pesagem registrada.</strong> Sem
          balança não há ganho de peso medido — e sem ganho medido, discutir nutrição é discutir
          impressão.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} cobertura={cobertura} plantel={alvo.animais_ativos} />

          {serie.length > 1 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Pesagens por mês</h2>
                <p className="text-xs text-muted-foreground">
                  Mostra se a balança é rotina ou evento raro — e ganho só existe onde há duas
                  passagens.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'pesagens', nome: 'Pesagens', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          <Ganhos faixas={faixas} resumo={resumo} />

          <Categorias categorias={categorias} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Ranking
              titulo="Maiores ganhos"
              nota="Os melhores intervalos entre duas pesagens — o que o manejo consegue quando dá certo."
              pesagens={melhores}
            />
            <Ranking
              titulo="Menores ganhos"
              nota="A lista para a próxima visita: perder peso em recria é nutrição, verminose ou lote errado."
              pesagens={piores}
            />
          </div>

          <Sessoes sessoes={sessoes} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaCrescimento({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/crescimento${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Crescimento
    </Link>
  );
}

function Cards({
  resumo,
  cobertura,
  plantel,
}: {
  resumo: ResumoPesagens;
  cobertura: number | null;
  plantel: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Animais pesados"
        valor={formatarInteiro(resumo.animais)}
        detalhe={`${formatarInteiro(resumo.comDuasOuMais)} com duas ou mais passagens`}
      />
      <KpiCard
        rotulo="Cobertura do plantel"
        valor={cobertura === null ? VAZIO : formatarPercentual(cobertura)}
        detalhe={`${formatarInteiro(resumo.animais)} de ${formatarInteiro(plantel)} ativos`}
      />
      <KpiCard
        rotulo="Peso médio"
        valor={formatarKg(resumo.pesoMedio, 1)}
        detalhe={`sobre ${formatarInteiro(resumo.comPeso)} pesagens válidas`}
      />
      <KpiCard
        rotulo="GMD entre pesagens"
        valor={resumo.gmdMedio === null ? VAZIO : `${formatarNumero(resumo.gmdMedio * 1000, 0)} g/dia`}
        // O nome é diferente do card da aba Crescimento de propósito — recortes
        // diferentes. Ver o cabeçalho deste arquivo.
        detalhe={`${formatarInteiro(resumo.intervalos)} intervalos de 15 a 365 dias`}
      />
      <KpiCard
        rotulo="Perderam peso"
        valor={formatarInteiro(resumo.intervalosNegativos)}
        detalhe={
          resumo.intervalos > 0
            ? `${formatarPercentual(resumo.intervalosNegativos / resumo.intervalos)} dos intervalos`
            : undefined
        }
      />
      <KpiCard
        rotulo="Última pesagem"
        valor={resumo.ultima ? formatarData(resumo.ultima) : VAZIO}
        detalhe={`${formatarInteiro(resumo.sessoes)} dias de curral no histórico`}
      />
    </div>
  );
}

function Ganhos({ faixas, resumo }: { faixas: FaixaGmd[]; resumo: ResumoPesagens }) {
  const maior = Math.max(...faixas.map((f) => f.intervalos), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Distribuição do ganho</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(resumo.intervalos)} intervalos entre pesagens consecutivas do mesmo
          animal.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[8rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${faixa.alerta ? 'bg-destructive/70' : 'bg-primary'}`}
                style={{ width: `${(faixa.intervalos / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.intervalos)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        As duas primeiras faixas são de alerta: animal que perdeu peso ou ganhou menos de 50 g por
        dia entre duas pesagens não está crescendo.
        {resumo.pesoImplausivel > 0 && (
          <>
            {' '}
            <strong className="text-destructive">
              {formatarInteiro(resumo.pesoImplausivel)} pesagens
            </strong>{' '}
            ficaram fora das médias por peso impossível (abaixo de 1 kg ou acima de {PESO_MAXIMO_KG}{' '}
            kg — a base tem uma de 408 kg).
          </>
        )}
      </p>
    </section>
  );
}

function Categorias({ categorias }: { categorias: CategoriaPeso[] }) {
  if (categorias.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Peso e ganho por categoria</h2>
        <p className="text-xs text-muted-foreground">
          Peso é da ÚLTIMA pesagem de cada animal; ganho usa todos os intervalos do histórico.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Categoria</th>
              <th className="py-1.5 pe-3 text-right font-normal">Animais</th>
              <th className="py-1.5 pe-3 text-right font-normal">Peso médio</th>
              <th className="py-1.5 text-right font-normal">GMD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categorias.map((categoria) => (
              <tr key={categoria.categoria}>
                <td className="py-1.5 pe-3 text-foreground">{categoria.categoria}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(categoria.animais)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarKg(categoria.pesoMedio, 1)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {categoria.gmdMedio === null
                    ? VAZIO
                    : `${formatarNumero(categoria.gmdMedio * 1000, 0)} g/dia`}
                  <span className="ms-1 text-xs">
                    {categoria.intervalos > 0 && `n=${formatarInteiro(categoria.intervalos)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Ranking({
  titulo,
  nota,
  pesagens,
}: {
  titulo: string;
  nota: string;
  pesagens: LinhaPesagem[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">{titulo}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>

      {pesagens.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhum intervalo com ganho calculável — é preciso pesar o mesmo animal duas vezes.
        </p>
      ) : (
        <ol className="mt-3 flex flex-col divide-y divide-border">
          {pesagens.slice(0, RANKING_LIMITE).map((pesagem, indice) => (
            <li
              key={pesagem.pesagem_id}
              className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {indice + 1}
                </span>
                <span className="truncate text-foreground">
                  {pesagem.nome_animal?.trim() || pesagem.numero_animal}
                </span>
                {pesagem.categoria && (
                  <span className="shrink-0 text-xs text-muted-foreground">{pesagem.categoria}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatarNumero((pesagem.gmd ?? 0) * 1000, 0)} g/dia
                <span className="ms-1 text-xs text-muted-foreground">
                  {formatarKg(pesagem.peso_anterior, 1)} → {formatarKg(pesagem.peso_kg, 1)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Sessoes({
  sessoes,
  usuarioId,
  sufixo,
}: {
  sessoes: SessaoPesagem[];
  usuarioId: number;
  sufixo: string;
}) {
  if (sessoes.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Dias de curral</h2>
        <p className="text-xs text-muted-foreground">
          Cada dia em que a fazenda passou animais na balança, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 text-right font-normal">Animais</th>
              <th className="py-1.5 pe-3 text-right font-normal">Peso médio</th>
              <th className="py-1.5 text-right font-normal">GMD da sessão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessoes.slice(0, 30).map((sessao) => (
              <tr key={sessao.data}>
                <td className="py-1.5 pe-3 tabular-nums text-foreground">
                  {formatarData(sessao.data)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(sessao.animais)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarKg(sessao.pesoMedio, 1)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {sessao.gmdMedio === null
                    ? VAZIO
                    : `${formatarNumero(sessao.gmdMedio * 1000, 0)} g/dia`}
                  <span className="ms-1 text-xs text-muted-foreground">
                    n={formatarInteiro(sessao.comGmd)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {sessoes.length > 30 && <>Mostrando os 30 dias mais recentes de {formatarInteiro(sessoes.length)}. </>}
        Para as colunas cruas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/pesagem${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de pesagens
        </Link>
        .
      </p>
    </section>
  );
}
