import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  CURVA_RECEITA,
  CURVA_VENDAS,
  PERIODOS,
  PRECO_CONFIAVEL,
  RANKING_LIMITE,
  ROTULO_PERIODO,
  faixasDeIdade,
  inicioDoPeriodo,
  lerPeriodo,
  listarVendas,
  maioresVendas,
  porSexo,
  resumoVendas,
  serieReceita,
  serieVendas,
  type FaixaIdadeVenda,
  type Periodo,
  type ResumoVendas,
  type SexoVenda,
} from '@/lib/adm/areas/vendas';
import type { LinhaVenda } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarMoeda,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * VENDAS — quem saiu, com que idade, e por quanto (quando alguém anotou).
 *
 * ⚠️ A TELA É ORGANIZADA EM TORNO DE UM DENOMINADOR: `valor` nunca é null e é
 * ZERO em 87% das vendas. O criador registra a saída do animal e não informa o
 * preço. Dividir a receita por todas as vendas daria um preço médio sete vezes
 * menor que o real — por isso toda conta de dinheiro aqui usa só as vendas COM
 * preço, e o número dessas vendas aparece ao lado de cada valor.
 *
 * A segunda leitura é a IDADE na saída: em leiteiro o cabrito macho sai nos
 * primeiros dias (não dá leite), e o dado confirma — há venda com um dia de
 * vida. Quanto do total está nessa faixa diz se a fazenda tem destino para o
 * macho ou se ele é descarte de nascimento.
 */
export const dynamic = 'force-dynamic';

export default async function VendasPage({
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
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há venda para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades, e a proporção de vendas com preço lançado varia muito entre elas — somá-las esconderia quem não anota. Escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarVendas(alvo.id, inicioDoPeriodo(periodo, agora));
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const vendas = res.dados;
  const resumo = resumoVendas(vendas);
  const sexos = porSexo(vendas);
  const idades = faixasDeIdade(vendas);
  const maiores = maioresVendas(vendas);
  const curvaVendas = serieVendas(vendas);
  const curvaReceita = serieReceita(vendas);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VoltarParaRebanho usuarioId={usuarioId} sufixo={sufixo} />
          <h1 className="mt-1 text-lg">Vendas · {ROTULO_PERIODO[periodo]}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Toda conta de dinheiro nesta tela usa só as vendas com preço lançado.
          </p>
        </div>
        <Periodos usuarioId={usuarioId} selecao={selecao} atual={periodo} />
      </div>

      {resumo.fracaoComValor !== null && resumo.fracaoComValor < PRECO_CONFIAVEL && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-destructive">
            {formatarPercentual(1 - resumo.fracaoComValor)} das vendas saíram sem preço.
          </strong>{' '}
          São {formatarInteiro(resumo.vendas - resumo.comValor)} de{' '}
          {formatarInteiro(resumo.vendas)} animais que saíram da fazenda sem registro de quanto
          renderam. A receita e o preço médio abaixo falam só das{' '}
          {formatarInteiro(resumo.comValor)} restantes — e enquanto for assim, o painel não tem como
          dizer quanto o rebanho fatura.
        </p>
      )}

      {vendas.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhuma venda em {ROTULO_PERIODO[periodo]}. Amplie o período acima.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} periodo={periodo} />

          {curvaVendas.length > 1 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Vendas e receita mês a mês</h2>
                <p className="text-xs text-muted-foreground">
                  A contagem existe sempre; a receita só onde alguém lançou preço — e o mês sem
                  preço fica em branco, não em zero.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[
                    { chave: CURVA_VENDAS, nome: 'Animais vendidos', pontos: curvaVendas },
                    { chave: CURVA_RECEITA, nome: 'Receita lançada (R$)', pontos: curvaReceita },
                  ]}
                  granularidade="mes"
                  buracos="vazio"
                  formato="inteiro"
                  altura={280}
                />
              </div>
            </section>
          )}

          <Idades idades={idades} resumo={resumo} />

          <PorSexo sexos={sexos} />

          {maiores.length > 0 && <Maiores vendas={maiores} />}

          <Tabela
            vendas={vendas}
            resumo={resumo}
            usuarioId={usuarioId}
            sufixo={sufixo}
          />
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
  const base = `/adm/u/${usuarioId}/rebanho/vendas`;
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

function Cards({ resumo, periodo }: { resumo: ResumoVendas; periodo: Periodo }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo={`Vendas · ${ROTULO_PERIODO[periodo]}`}
        valor={formatarInteiro(resumo.vendas)}
        detalhe={`${formatarInteiro(resumo.animais)} animais distintos`}
      />
      <KpiCard
        rotulo="Com preço lançado"
        valor={formatarInteiro(resumo.comValor)}
        detalhe={
          resumo.fracaoComValor === null
            ? undefined
            : `${formatarPercentual(resumo.fracaoComValor)} das vendas`
        }
      />
      <KpiCard
        rotulo="Receita lançada"
        valor={formatarMoeda(resumo.receita)}
        // "Lançada", e não "receita": a diferença entre as duas palavras é a
        // diferença entre o que a fazenda faturou e o que ela anotou.
        detalhe="só das vendas com preço — não é o faturamento"
      />
      <KpiCard
        rotulo="Preço médio"
        valor={formatarMoeda(resumo.precoMedio)}
        detalhe={`sobre ${formatarInteiro(resumo.comValor)} vendas com preço`}
      />
      <KpiCard
        rotulo="Idade ao vender"
        valor={
          resumo.idadeMediaDias === null
            ? VAZIO
            : `${formatarNumero(resumo.idadeMediaDias, 0)} d`
        }
        detalhe={`sobre ${formatarInteiro(resumo.comIdade)} com idade calculável`}
      />
      <KpiCard
        rotulo="Fêmeas · machos"
        valor={`${formatarInteiro(resumo.femeas)} · ${formatarInteiro(resumo.machos)}`}
        detalhe={
          resumo.animaisRepetidos > 0
            ? `${formatarInteiro(resumo.animaisRepetidos)} animais vendidos duas vezes`
            : undefined
        }
      />
    </div>
  );
}

function Idades({ idades, resumo }: { idades: FaixaIdadeVenda[]; resumo: ResumoVendas }) {
  const maior = Math.max(...idades.map((f) => f.vendas), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Idade na saída</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(resumo.comIdade)} vendas com data de nascimento no cadastro.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {idades.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[11rem_1fr_5rem_7rem] items-center gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{faixa.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{faixa.detalhe}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(faixa.vendas / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.vendas)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
            {/* O preço fica na mesma linha da idade porque a pergunta comercial
                é uma só: vale segurar o animal mais tempo? */}
            <span className="text-right tabular-nums text-muted-foreground">
              {faixa.precoMedio === null ? (
                <span className="text-xs">sem preço</span>
              ) : (
                <>
                  {formatarMoeda(faixa.precoMedio)}
                  <span className="ms-1 text-xs">n={formatarInteiro(faixa.comValor)}</span>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Em rebanho leiteiro o cabrito macho sai nos primeiros dias, porque não dá leite. Quanto do
        total está na primeira faixa diz se a fazenda tem destino comercial para o macho ou se ele é
        descarte de nascimento — e essa é uma conversa de receita inteira que não aparece em
        nenhum outro card.
      </p>
    </section>
  );
}

function PorSexo({ sexos }: { sexos: SexoVenda[] }) {
  if (sexos.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Vendas por sexo</h2>
        <p className="text-xs text-muted-foreground">
          Cada preço médio carrega o seu denominador.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Sexo</th>
              <th className="py-1.5 pe-3 text-right font-normal">Vendas</th>
              <th className="py-1.5 pe-3 text-right font-normal">Com preço</th>
              <th className="py-1.5 pe-3 text-right font-normal">Preço médio</th>
              <th className="py-1.5 text-right font-normal">Idade média</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sexos.map((sexo) => (
              <tr key={sexo.rotulo}>
                <td className="py-1.5 pe-3 text-foreground">{sexo.rotulo}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(sexo.vendas)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(sexo.comValor)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarMoeda(sexo.precoMedio)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {sexo.idadeMediaDias === null
                    ? VAZIO
                    : `${formatarNumero(sexo.idadeMediaDias, 0)} d`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Não há corte por categoria nesta tela, e a ausência é deliberada: o app TROCA a categoria do
        animal quando ele é vendido — todas as vendas ficam em &quot;Vendido&quot;, e agrupar por
        ela devolve uma linha só. A coluna que guardaria a categoria anterior está preenchida em
        2,6% das vendas. Sexo e idade são as duas dimensões que sobrevivem à venda.
      </p>
    </section>
  );
}

function Maiores({ vendas }: { vendas: LinhaVenda[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Maiores vendas</h2>
        <p className="text-xs text-muted-foreground">
          As {formatarInteiro(Math.min(vendas.length, RANKING_LIMITE))} de maior valor lançado.
        </p>
      </div>

      <ol className="mt-3 flex flex-col divide-y divide-border">
        {vendas.map((venda, indice) => (
          <li key={venda.venda_id} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {indice + 1}
              </span>
              <span className="truncate text-foreground">
                {venda.nome_animal?.trim() || venda.numero_animal}
              </span>
              {venda.categoria && (
                <span className="shrink-0 text-xs text-muted-foreground">{venda.categoria}</span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-foreground">
              {formatarMoeda(venda.valor)}
              <span className="ms-1 text-xs text-muted-foreground">
                {formatarData(venda.data_venda)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Tabela({
  vendas,
  resumo,
  usuarioId,
  sufixo,
}: {
  vendas: LinhaVenda[];
  resumo: ResumoVendas;
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Vendas do período</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(vendas.length)} registros, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Categoria</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 text-right font-normal">Idade</th>
              <th className="py-1.5 text-right font-normal">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendas.slice(0, 100).map((venda) => (
              <tr key={venda.venda_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {venda.nome_animal?.trim() || venda.numero_animal}
                  </span>
                  {venda.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                      {venda.numero_animal}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{venda.categoria ?? VAZIO}</td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(venda.data_venda)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {venda.idade_ao_vender === null
                    ? VAZIO
                    : `${formatarInteiro(venda.idade_ao_vender)} d`}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {venda.com_valor ? (
                    formatarMoeda(venda.valor)
                  ) : (
                    <span className="text-muted-foreground">sem preço</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {vendas.length > 100 && <>Mostrando as 100 mais recentes de {formatarInteiro(vendas.length)}. </>}
        {resumo.animaisRepetidos > 0 && (
          <>
            <strong className="text-destructive">
              {formatarInteiro(resumo.animaisRepetidos)} animais aparecem em mais de uma venda
            </strong>{' '}
            — vender duas vezes o mesmo animal é impossível, então é relançamento ou venda desfeita
            sem apagar a primeira.{' '}
          </>
        )}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/venda${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de vendas
        </Link>
        .
      </p>
    </section>
  );
}
