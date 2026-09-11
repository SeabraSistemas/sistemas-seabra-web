import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  CURVA_NASCIMENTOS,
  CURVA_OBITOS,
  CURVA_VENDAS,
  REGISTRO_CONFIAVEL,
  buracosDeCadastro,
  composicaoDoEfetivo,
  composicaoSaidas,
  curvaDoFluxo,
  efetivoPorBaia,
  getInventario,
  listarAnimaisAtivos,
  saldoDoFluxo,
  taxaSaidaRegistrada,
  type Buraco,
  type CelulaComposicao,
  type Saida,
} from '@/lib/adm/areas/rebanho-inventario';
import type { LinhaInventario } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { VAZIO, formatarInteiro, formatarPercentual } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * INVENTÁRIO DO REBANHO — quem está, quem saiu, e por onde.
 *
 * A ENTREGA CENTRAL É UM NÚMERO QUE NENHUMA OUTRA TELA MOSTRA: quantos animais
 * saíram do rebanho sem motivo registrado. Na base inteira são 79% dos inativos,
 * e o padrão varia de 0% a 100% conforme o cliente — o que faz dele um indicador
 * de ADOÇÃO do app, não de rebanho.
 *
 * Importa porque é ele que decide se dá para AFIRMAR alguma coisa: enquanto a
 * saída não é registrada, a taxa de mortalidade e a de descarte daquela fazenda
 * são incalculáveis. Não por dificuldade de conta — por ausência de denominador.
 */
export const dynamic = 'force-dynamic';

export default async function InventarioPage({
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
        <VoltarParaRebanho usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há rebanho para inventariar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. A qualidade do registro de saída varia de 0% a 100% entre fazendas — somá-las esconderia exatamente quem não registra. Escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const [invRes, animaisRes] = await Promise.all([
    getInventario(alvo.id),
    listarAnimaisAtivos(alvo.id),
  ]);
  if (!invRes.ok) return <EstadoVazio resultado={invRes} />;
  if (!animaisRes.ok) return <EstadoVazio resultado={animaisRes} />;

  const inv = invRes.dados;
  const animais = animaisRes.dados;

  const saidas = composicaoSaidas(inv);
  const taxa = taxaSaidaRegistrada(inv);
  const buracos = buracosDeCadastro(inv);
  const composicao = composicaoDoEfetivo(animais);
  const porBaia = efetivoPorBaia(animais);
  const saldo = saldoDoFluxo(inv);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaRebanho usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Inventário e fluxo do rebanho</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(inv.ativos)} animais no efetivo e {formatarInteiro(inv.inativos)} que já
          saíram.
        </p>
      </div>

      {taxa !== null && taxa < REGISTRO_CONFIAVEL && (
        <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-destructive">
            {formatarPercentual(1 - taxa)} das saídas não têm motivo registrado.
          </strong>{' '}
          São {formatarInteiro(inv.saida_sem_motivo)} animais inativados sem venda, óbito ou
          descarte. Enquanto isso, a taxa de mortalidade e a de descarte desta fazenda são
          incalculáveis — não por dificuldade de conta, mas porque o denominador das saídas não
          existe. É conversa de treinamento, e é o que destrava metade dos indicadores do painel.
        </p>
      )}

      <Cards inv={inv} taxa={taxa} saldo={saldo} />

      <Saidas saidas={saidas} inv={inv} />

      {inv.fluxo_mensal && inv.fluxo_mensal.length > 0 && (
        <section className="painel">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Entradas e saídas · 24 meses</h2>
            <p className="text-xs text-muted-foreground">
              Nascimentos contra vendas e óbitos. Mês sem evento aparece como zero.
            </p>
          </div>
          <div className="mt-3">
            <SerieTemporal
              series={[
                {
                  chave: CURVA_NASCIMENTOS,
                  nome: 'Nascimentos',
                  pontos: curvaDoFluxo(inv, CURVA_NASCIMENTOS),
                },
                { chave: CURVA_VENDAS, nome: 'Vendas', pontos: curvaDoFluxo(inv, CURVA_VENDAS) },
                { chave: CURVA_OBITOS, nome: 'Óbitos', pontos: curvaDoFluxo(inv, CURVA_OBITOS) },
              ]}
              granularidade="mes"
              buracos="zero"
              formato="inteiro"
              altura={280}
            />
          </div>
          {inv.saida_sem_motivo > 0 && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              O saldo deste gráfico <strong className="text-foreground">não fecha</strong> com a
              variação do efetivo, e isso é esperado: os {formatarInteiro(inv.saida_sem_motivo)}{' '}
              animais que saíram sem motivo não têm data de saída, então não aparecem em curva
              nenhuma. Eles estão contados no bloco acima.
            </p>
          )}
        </section>
      )}

      <Composicao composicao={composicao} total={inv.ativos} />

      {porBaia.length > 0 && (
        <section className="painel">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Efetivo por baia</h2>
            <p className="text-xs text-muted-foreground">
              Onde o rebanho está hoje — e quantos não têm curral cadastrado.
            </p>
          </div>
          <div className="mt-3">
            <DistribuicaoBarras
              dados={porBaia}
              larguraRotulo={140}
              formato="inteiro"
              mostrarPercentual
              maximo={12}
              mensagemVazia="Nenhum animal ativo"
            />
          </div>
        </section>
      )}

      <Buracos buracos={buracos} inv={inv} usuarioId={usuarioId} sufixo={sufixo} />
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

function Cards({
  inv,
  taxa,
  saldo,
}: {
  inv: LinhaInventario;
  taxa: number | null;
  saldo: { entradas: number; saidas: number; saldo: number };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard rotulo="Efetivo ativo" valor={formatarInteiro(inv.ativos)} detalhe="animais no rebanho hoje" />
      <KpiCard
        rotulo="Já saíram"
        valor={formatarInteiro(inv.inativos)}
        detalhe="inativos, por qualquer motivo"
      />
      <KpiCard
        rotulo="Saídas registradas"
        valor={taxa === null ? VAZIO : formatarPercentual(taxa)}
        // null e 0% são coisas diferentes: null é fazenda que nunca perdeu
        // animal, 0% é fazenda que perdeu e não registrou nenhuma.
        detalhe={
          taxa === null
            ? 'nenhuma saída ainda — sem denominador'
            : `${formatarInteiro(inv.saida_sem_motivo)} sem motivo`
        }
      />
      <KpiCard
        rotulo="Nascimentos · 24 meses"
        valor={formatarInteiro(saldo.entradas)}
        detalhe="a única entrada com data no banco"
      />
      <KpiCard
        rotulo="Saídas com data · 24 meses"
        valor={formatarInteiro(saldo.saidas)}
        detalhe="vendas mais óbitos"
      />
      <KpiCard
        rotulo="Saldo do período"
        valor={`${saldo.saldo >= 0 ? '+' : ''}${formatarInteiro(saldo.saldo)}`}
        detalhe="só do que tem data — ver a nota do gráfico"
      />
    </div>
  );
}

/**
 * A composição das saídas, desenhada à mão: são categorias EXCLUDENTES de um
 * mesmo total (os inativos), e o que interessa é o tamanho relativo do balde
 * "sem motivo" — não um ranking.
 */
function Saidas({ saidas, inv }: { saidas: Saida[]; inv: LinhaInventario }) {
  if (inv.inativos === 0) {
    return (
      <section className="painel">
        <h2 className="text-base">Por onde saíram</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhum animal saiu do rebanho ainda. É rebanho novo, não falha de registro — e a diferença
          entre as duas coisas é exatamente o que este bloco existe para não confundir.
        </p>
      </section>
    );
  }

  const maior = Math.max(...saidas.map((s) => s.animais), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Por onde saíram</h2>
        <p className="text-xs text-muted-foreground">
          Sobre {formatarInteiro(inv.inativos)} animais inativos.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {saidas.map((saida) => (
          <li key={saida.motivo} className="grid grid-cols-[13rem_1fr_5.5rem] items-center gap-3 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{saida.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{saida.detalhe}</span>
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${
                  saida.motivo === 'sem_motivo' ? 'bg-destructive/70' : 'bg-primary'
                }`}
                style={{ width: `${(saida.animais / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(saida.animais)}
              <span className="ms-1 text-xs text-muted-foreground">
                {saida.fracao === null ? VAZIO : formatarPercentual(saida.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Composicao({ composicao, total }: { composicao: CelulaComposicao[]; total: number }) {
  if (composicao.length === 0) return null;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Efetivo por categoria e sexo</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(total)} animais ativos. É a tabela que o criador tem na cabeça.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Categoria</th>
              <th className="py-1.5 pe-3 text-right font-normal">Fêmeas</th>
              <th className="py-1.5 pe-3 text-right font-normal">Machos</th>
              <th className="py-1.5 pe-3 text-right font-normal">Sem sexo</th>
              <th className="py-1.5 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {composicao.map((linha) => (
              <tr key={linha.categoria}>
                <td className="py-1.5 pe-3 text-foreground">{linha.categoria}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(linha.femeas)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(linha.machos)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {linha.semSexo > 0 ? formatarInteiro(linha.semSexo) : VAZIO}
                </td>
                <td className="py-1.5 text-right tabular-nums text-foreground">
                  {formatarInteiro(linha.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Buracos({
  buracos,
  inv,
  usuarioId,
  sufixo,
}: {
  buracos: Buraco[];
  inv: LinhaInventario;
  usuarioId: number;
  sufixo: string;
}) {
  const contradicoes = inv.ativos_com_obito + inv.ativos_com_venda;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Buracos no cadastro do efetivo</h2>
        <p className="text-xs text-muted-foreground">
          Cada linha aqui é um &quot;—&quot; que aparece em outra tela do painel.
        </p>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {buracos.map((buraco) => (
          <li key={buraco.rotulo} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate text-foreground">{buraco.rotulo}</span>
              <span className="block truncate text-xs text-muted-foreground">{buraco.detalhe}</span>
            </span>
            <span className="shrink-0 tabular-nums text-foreground">
              {formatarInteiro(buraco.animais)}
              <span className="ms-1 text-xs text-muted-foreground">
                {buraco.fracao === null ? VAZIO : formatarPercentual(buraco.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {contradicoes > 0 && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <strong className="text-destructive">
            {formatarInteiro(contradicoes)} animais contraditórios:
          </strong>{' '}
          {inv.ativos_com_obito > 0 && (
            <>{formatarInteiro(inv.ativos_com_obito)} estão ativos COM óbito registrado</>
          )}
          {inv.ativos_com_obito > 0 && inv.ativos_com_venda > 0 && ' e '}
          {inv.ativos_com_venda > 0 && (
            <>{formatarInteiro(inv.ativos_com_venda)} estão ativos COM data de venda</>
          )}
          . Aparecem no efetivo e não existem mais.
        </p>
      )}

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Para a lista completa com todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/rebanho${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela do rebanho
        </Link>
        .
      </p>
    </section>
  );
}
