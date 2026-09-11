import Link from 'next/link';
import { BotaoCopiar } from '@/components/adm/BotaoCopiar';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SeletorControle, type OpcaoControle } from '@/components/adm/SeletorControle';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  DEL_DIVERGENCIA,
  DG_ATRASADO_APOS,
  PRONTA_PARA_COBRIR_APOS,
  RANKING_LIMITE,
  SECAR_AOS_DIAS_DE_GESTACAO,
  SEM_BAIA,
  SEM_SETOR,
  acharSessao,
  costurarSessoes,
  histogramaProducao,
  juntarContexto,
  listarAnimaisDoControle,
  listarContextoDoControle,
  listarSessoes,
  melhoresDoControle,
  pioresDoControle,
  producaoPorBaia,
  producaoPorSetor,
  resumoDoControle,
  resumoReprodutivo,
  serieDasSessoes,
  situacaoReprodutiva,
  type AnimalDoControle,
  type BaiaControle,
  type FaixaProducao,
  type ResumoControle,
  type ResumoReprodutivo,
  type SessaoControle,
} from '@/lib/adm/areas/controle-leiteiro';
import type { LinhaControleAnimal } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarLitros,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';
import type { Resultado } from '@/lib/adm/types';

/**
 * CONTROLE LEITEIRO — a pesagem individual de um dia, com cards, série, baias,
 * histograma e os dois rankings.
 *
 * POR QUE É UMA TELA À PARTE, e não mais uma seção da aba Produção: a aba
 * Produção responde "quanto a fazenda entregou" (o tanque, `producao_diaria`);
 * esta responde "quem entregou" (`controle_leiteiro`). São perguntas de dias
 * diferentes — o tanque é todo dia, o controle é uma vez por mês — e cada
 * número aqui é do DIA DO CONTROLE escolhido, não de uma janela móvel. Misturar
 * as duas na mesma tela faria cards vizinhos falarem de recortes diferentes com
 * a mesma cara, que é o jeito mais fácil de um painel mentir.
 *
 * A TELA EXIGE UMA PROPRIEDADE. Média por baia e ranking por animal não somam
 * entre fazendas: baia "G1-5" existe em duas propriedades e são currais
 * diferentes. Sem fazenda escolhida, a tela pede a escolha em vez de inventar um
 * consolidado.
 *
 * A LISTA DE ANIMAIS TRAZ O CONTEXTO DO DIA (adm_28): setor, lactação, e se a
 * cabra está coberta, com DG, desde quando — avaliado NA DATA DO CONTROLE, a
 * partir dos eventos, nunca dos caches de `rebanho` (que são o estado de hoje e
 * não valem para o controle de março). É o que o consultor pergunta ao abrir a
 * lista, e é o que a planilha antiga não tinha.
 */
export const dynamic = 'force-dynamic';

export default async function ControleLeiteiroPage({
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
  const dataPedida = texto(sp.data);
  const incluirZerados = texto(sp.zeros) === '1';

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  // Uma fazenda só: a selecionada, ou a única do escopo. Ver o cabeçalho.
  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há controle leiteiro para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. A média por baia e o ranking por animal são de UMA fazenda — baia com o mesmo nome em duas propriedades é curral diferente. Escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const sessoesRes = await listarSessoes(alvo.id);
  if (!sessoesRes.ok) return <EstadoVazio resultado={sessoesRes} />;

  const sessoes = costurarSessoes(sessoesRes.dados);
  const sessao = acharSessao(sessoes, dataPedida);

  if (!sessao) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">{alvo.nome} nunca lançou controle leiteiro.</strong>{' '}
          O controle é a pesagem individual de cada fêmea num dia — é o que sustenta ranking por animal,
          média por baia e seleção. Sem ele, a fazenda só tem o volume do tanque.
        </p>
      </div>
    );
  }

  const [animaisRes, contextoRes] = await Promise.all([
    listarAnimaisDoControle(alvo.id, sessao.datas),
    listarContextoDoControle(alvo.id, sessao.datas),
  ]);
  if (!animaisRes.ok) return <EstadoVazio resultado={animaisRes} />;
  // O contexto é complemento: se a view de adm_28 faltar, o controle continua
  // inteiro e a seção de reprodução diz o que faltou, em vez de derrubar a tela.
  const animais = juntarContexto(animaisRes.dados, contextoRes.ok ? contextoRes.dados : []);
  const falhaContexto = contextoRes.ok ? null : contextoRes;

  const resumo = resumoDoControle(animais);
  const baias = producaoPorBaia(animais);
  const setores = producaoPorSetor(animais);
  const reproducao = resumoReprodutivo(animais);
  const faixas = histogramaProducao(animais);
  const melhores = melhoresDoControle(animais);
  const piores = pioresDoControle(animais, RANKING_LIMITE, incluirZerados);
  const serie = serieDasSessoes(sessoes);

  const opcoes: OpcaoControle[] = sessoes.map((s) => ({
    chave: s.chave,
    rotulo: formatarData(s.chave),
    animais: s.animais,
    mediaComLeite: s.mediaComLeite,
    dias: s.datas.length,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <VoltarParaProducao usuarioId={usuarioId} sufixo={sufixo} />
          <h1 className="mt-1 text-lg">Controle leiteiro · {formatarData(sessao.chave)}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pesagem individual do dia. {formatarInteiro(sessoes.length)}{' '}
            {sessoes.length === 1 ? 'controle registrado' : 'controles registrados'} nesta fazenda.
            {sessao.datas.length > 1 && (
              <>
                {' '}
                Este junta {formatarInteiro(sessao.datas.length)} dias seguidos (
                {sessao.datas.map((d) => formatarData(d)).join(' e ')}) — o lançamento atrasado do dia
                seguinte é do mesmo controle.
              </>
            )}
          </p>
        </div>
        <SeletorControle opcoes={opcoes} atual={sessao.chave} />
      </div>

      <Cards resumo={resumo} />

      {serie.length > 1 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base">Média por cabeça a cada controle</h2>
            <p className="text-xs text-muted-foreground">
              Litros ÷ animais que deram leite, controle a controle. A lacuna entre pontos é o
              intervalo real entre as pesagens.
            </p>
          </div>
          <div className="mt-3">
            <SerieTemporal
              series={[{ chave: 'media', nome: 'Média por cabeça', pontos: serie }]}
              granularidade="dia"
              buracos="vazio"
              formato="litros"
              altura={260}
            />
          </div>
        </section>
      )}

      <PorLocal baias={baias} setores={setores} />

      <Reproducao resumo={reproducao} falha={falhaContexto} sessao={sessao} />

      <Histograma faixas={faixas} total={resumo.animais} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Ranking
          titulo={`${formatarInteiro(Math.min(melhores.length, RANKING_LIMITE))} melhores`}
          nota="As que sustentam o tanque — e as candidatas naturais a matriz."
          animais={melhores}
        />
        <Ranking
          titulo={`${formatarInteiro(Math.min(piores.length, RANKING_LIMITE))} piores`}
          nota={
            incluirZerados
              ? 'Incluindo quem registrou 0,0 L — quase sempre cabra seca lançada por engano, não má produtora.'
              : 'Só quem deu leite. A cabra seca lançada com 0,0 L ficaria em primeiro sem ter problema nenhum.'
          }
          animais={piores}
          acao={
            <Link
              href={alternarZeros(usuarioId, selecao, sessao.chave, incluirZerados)}
              className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {incluirZerados ? 'Só com leite' : 'Incluir 0,0 L'}
            </Link>
          }
        />
      </div>

      <Lancamentos
        animais={animais}
        resumo={resumo}
        sessao={sessao}
        usuarioId={usuarioId}
        sufixo={sufixo}
      />
    </div>
  );
}

function texto(v: string | string[] | undefined): string | null {
  const valor = Array.isArray(v) ? v[0] : v;
  return valor && valor.trim() !== '' ? valor.trim() : null;
}

function alternarZeros(
  usuarioId: number,
  selecao: SelecaoPropriedade,
  data: string,
  incluirZerados: boolean,
): string {
  const partes = [`data=${data}`];
  if (selecao != null) partes.unshift(`prop=${selecao}`);
  if (!incluirZerados) partes.push('zeros=1');
  return `/adm/u/${usuarioId}/producao/controle?${partes.join('&')}`;
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

function Cards({ resumo }: { resumo: ResumoControle }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Animais no controle"
        valor={formatarInteiro(resumo.animais)}
        detalhe={
          resumo.semLeite > 0
            ? `${formatarInteiro(resumo.comLeite)} com leite · ${formatarInteiro(resumo.semLeite)} em 0,0 L`
            : 'todos com leite lançado'
        }
      />
      <KpiCard
        rotulo="Total do controle"
        valor={formatarLitros(resumo.litrosTotal, 1)}
        detalhe="soma das ordenhas do dia"
      />
      <KpiCard
        rotulo="Média por cabeça"
        valor={formatarLitros(resumo.mediaComLeite, 2)}
        detalhe={
          resumo.semLeite > 0
            ? `geral ${formatarLitros(resumo.mediaGeral, 2)}, contando quem zerou`
            : 'litros ÷ animais que deram leite'
        }
      />
      <KpiCard
        rotulo="Melhor do dia"
        valor={formatarLitros(resumo.melhor, 1)}
        detalhe="a maior produção individual"
      />
      <KpiCard
        rotulo="DEL médio"
        valor={resumo.delMedio === null ? VAZIO : `${formatarNumero(resumo.delMedio, 0)} d`}
        // O denominador vai junto: "DEL médio 106" sobre 58 dos 61 animais é uma
        // afirmação; sobre 3 de 61 é ruído com cara de número.
        detalhe={
          resumo.delMedio === null
            ? 'sem lactação nem DEL lançado'
            : `${formatarInteiro(resumo.animaisComDel)} de ${formatarInteiro(resumo.animais)} · ${formatarInteiro(resumo.delCalculados)} pela data do parto${resumo.delLancados > 0 ? `, ${formatarInteiro(resumo.delLancados)} lançados` : ''}`
        }
      />
      <KpiCard
        rotulo="Ordenhas pesadas"
        valor={formatarInteiro(resumo.ordenhas)}
        detalhe={`${formatarInteiro(resumo.duasOrdenhas)} animais nas duas`}
      />
    </div>
  );
}

/**
 * O controle por LOCAL — setor (quando a fazenda usa) e baia. Quando nenhum
 * animal tem baia nem setor, a seção vira um aviso: o recorte não existe por
 * falta de cadastro, e a tela diz isso em vez de mostrar um card "Sem baia".
 */
function PorLocal({ baias, setores }: { baias: BaiaControle[]; setores: BaiaControle[] }) {
  const temBaia = baias.some((b) => b.baia !== SEM_BAIA);
  const temSetor = setores.some((s) => s.baia !== SEM_SETOR);

  if (!temBaia && !temSetor) {
    return (
      <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <strong className="font-medium text-foreground">Sem localização.</strong> Nenhum animal deste
        controle tem baia cadastrada no app, então não há produção por baia para mostrar. Quando o
        cliente preencher a baia no rebanho, o recorte aparece aqui sozinho.
      </p>
    );
  }

  return (
    <>
      {temSetor && (
        <GrupoLocal
          titulo="Produção por setor"
          nota="O nível acima da baia — G1, G2, G3, maternidade. Da melhor média para a pior."
          locais={setores}
        />
      )}
      {temBaia && (
        <GrupoLocal
          titulo="Produção por baia"
          nota="Da melhor média para a pior — é o recorte que diz onde olhar o cocho. A baia é a atual do cadastro, não a do dia do controle."
          locais={baias}
        />
      )}
    </>
  );
}

function GrupoLocal({ titulo, nota, locais }: { titulo: string; nota: string; locais: BaiaControle[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{titulo}</h2>
        <p className="text-xs text-muted-foreground">{nota}</p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locais.map((baia) => (
          <div key={baia.baia} className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{baia.baia}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatarInteiro(baia.animais)} animais
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <Metrica rotulo="Total" valor={formatarLitros(baia.litrosTotal, 1)} />
              <Metrica
                rotulo="DEL médio"
                valor={baia.delMedio === null ? VAZIO : `${formatarNumero(baia.delMedio, 0)} d`}
              />
              <Metrica rotulo="Por cabeça" valor={formatarLitros(baia.mediaPorCabeca, 2)} destaque />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * A situação reprodutiva das lactantes NO DIA do controle — a pergunta que o
 * consultor faz ao olhar a lista, respondida antes de ele abrir a lista.
 *
 * As regras (em areas/controle-leiteiro.ts): gestante com 90+ dias de gestação
 * devia estar seca; coberta há mais de 45 dias sem DG é DG atrasado; não coberta
 * com 60+ dias de lactação já pode voltar ao bode.
 */
function Reproducao({
  resumo,
  falha,
  sessao,
}: {
  resumo: ResumoReprodutivo;
  falha: Resultado<never> | null;
  sessao: SessaoControle;
}) {
  if (falha && !falha.ok) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-muted-foreground">
        A situação reprodutiva das lactantes não pôde ser lida — o controle acima não depende dela.
        <span className="mt-1 block text-xs">{falha.detalhe}</span>
      </p>
    );
  }

  if (!resumo.comAlgumEvento) {
    return (
      <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <strong className="font-medium text-foreground">Sem cobertura nem DG lançados</strong> para
        estas fêmeas desde o parto. Por isso a coluna Reprodução da lista abaixo sai toda como
        &quot;não coberta&quot; — é falta de lançamento, não de bode. Sem esse registro não há como
        saber quem já pode ser coberta nem quem devia estar seca.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Situação reprodutiva das lactantes</h2>
        <p className="text-xs text-muted-foreground">
          Em {formatarData(sessao.chave)}, pelos eventos desde o parto de cada uma — não pelo cadastro
          de hoje.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          rotulo="Gestantes"
          valor={formatarInteiro(resumo.gestantes)}
          detalhe={
            resumo.aSecar > 0
              ? `${formatarInteiro(resumo.aSecar)} com ${SECAR_AOS_DIAS_DE_GESTACAO}+ dias de gestação — deviam estar secas`
              : 'nenhuma passou do ponto de secar'
          }
          destaque={resumo.aSecar > 0}
        />
        <KpiCard
          rotulo="Cobertas, aguardando DG"
          valor={formatarInteiro(resumo.cobertas)}
          detalhe={
            resumo.dgAtrasado > 0
              ? `${formatarInteiro(resumo.dgAtrasado)} há mais de ${DG_ATRASADO_APOS} dias — DG atrasado`
              : 'todas dentro do prazo do DG'
          }
        />
        <KpiCard
          rotulo="Vazias"
          valor={formatarInteiro(resumo.vazias)}
          detalhe="DG negativo ou aborto — precisam voltar ao bode"
        />
        <KpiCard
          rotulo="Não cobertas desde o parto"
          valor={formatarInteiro(resumo.naoCobertas)}
          detalhe={
            resumo.prontasParaCobrir > 0
              ? `${formatarInteiro(resumo.prontasParaCobrir)} com ${PRONTA_PARA_COBRIR_APOS}+ dias de lactação — prontas para cobrir`
              : 'nenhuma passou dos 60 dias de lactação'
          }
        />
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A cabra em lactação com {SECAR_AOS_DIAS_DE_GESTACAO}+ dias de gestação ainda no controle está
        sendo ordenhada quando devia estar seca — custa colostro e peso da cria. Quem está no controle
        e não foi coberta com {PRONTA_PARA_COBRIR_APOS}+ dias de lactação é a lista para a próxima
        estação de monta.
        {resumo.semInformacao > 0 && (
          <> {formatarInteiro(resumo.semInformacao)} animais ficaram sem contexto e não entram na conta.</>
        )}
      </p>
    </section>
  );
}

function Metrica({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p className={`tabular-nums ${destaque ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}`}>
        {valor}
      </p>
    </div>
  );
}

/**
 * Histograma desenhado à mão, e não com <DistribuicaoBarras>.
 *
 * Não é preciosismo: aquele componente ordena do maior para o menor (é um
 * ranking e faz bem o que faz) e agrupa a cauda em "Outros". Aqui as faixas são
 * uma ESCALA ordinal — reordenada por volume ela deixa de dizer "o rebanho se
 * concentra entre 2 e 3 litros" e passa a dizer só "a faixa mais comum é essa",
 * que é a informação menos útil das duas. Mesmo motivo do funil da Reprodução e
 * da escala FAMACHA da Sanidade.
 */
function Histograma({ faixas, total }: { faixas: FaixaProducao[]; total: number }) {
  const maior = Math.max(...faixas.map((f) => f.animais), 1);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Distribuição por faixa de produção</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(total)} animais. A faixa vazia continua na lista — esconder faria o gráfico
          mentir sobre a escala.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li
            key={faixa.rotulo}
            className="grid grid-cols-[7.5rem_1fr_5.5rem] items-center gap-3 text-sm"
          >
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(faixa.animais / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.animais)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao, 1)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Ranking({
  titulo,
  nota,
  animais,
  acao,
}: {
  titulo: string;
  nota: string;
  animais: LinhaControleAnimal[];
  acao?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{titulo}</h2>
        {acao}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>

      {animais.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum animal neste recorte.</p>
      ) : (
        <ol className="mt-3 flex flex-col divide-y divide-border">
          {animais.map((animal, indice) => (
            <li
              key={animal.animal_id}
              className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {indice + 1}
                </span>
                <span className="truncate text-foreground">
                  {animal.nome_animal?.trim() || animal.numero_animal}
                </span>
                {animal.baia && (
                  <span className="shrink-0 text-xs text-muted-foreground">{animal.baia}</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatarLitros(animal.litros, 1)}
                {animal.del !== null && (
                  <span className="ms-1 text-xs text-muted-foreground">{animal.del} d</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Todos os lançamentos do controle, com o texto pronto para o WhatsApp. */
function Lancamentos({
  animais,
  resumo,
  sessao,
  usuarioId,
  sufixo,
}: {
  animais: AnimalDoControle[];
  resumo: ResumoControle;
  sessao: SessaoControle;
  usuarioId: number;
  sufixo: string;
}) {
  const temSetor = animais.some((a) => a.contexto?.setor);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Lançamentos do controle</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatarInteiro(animais.length)} animais pesados em {formatarData(sessao.chave)}, com a
            lactação e a situação reprodutiva de cada um naquele dia.
          </p>
        </div>
        <BotaoCopiar
          texto={textoDoControle(animais, resumo, sessao)}
          rotulo="Copiar para WhatsApp"
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[64rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">{temSetor ? 'Setor · baia' : 'Baia'}</th>
              <th className="py-1.5 pe-3 text-right font-normal">Litros</th>
              <th className="py-1.5 pe-3 text-right font-normal">Ord.</th>
              <th className="py-1.5 pe-3 text-right font-normal">DEL</th>
              <th className="py-1.5 pe-3 font-normal">Lactação</th>
              <th className="py-1.5 font-normal">Reprodução no dia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {animais.map((animal) => (
              <LinhaLancamento key={animal.animal_id} animal={animal} temSetor={temSetor} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        O DEL é contado da data do parto (o início da lactação que cobre o dia — a mesma regra do
        app); o valor digitado no app só entra quando não há lactação.
        {resumo.delDivergentes > 0 && (
          <>
            {' '}
            <strong className="text-foreground">
              Em {formatarInteiro(resumo.delDivergentes)} animais o DEL digitado difere do calculado em
              mais de {DEL_DIVERGENCIA} dias
            </strong>{' '}
            (marcados com &quot;app:&quot;) — é valor de uma lactação anterior que nunca foi recalculado.
          </>
        )}{' '}
        A situação reprodutiva é a do DIA do controle, pelos eventos desde o parto. Para o histórico
        bruto de todos os controles, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/controle_leiteiro${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de controle leiteiro
        </Link>
        .
      </p>
    </section>
  );
}

function LinhaLancamento({ animal, temSetor }: { animal: AnimalDoControle; temSetor: boolean }) {
  const ctx = animal.contexto;
  const situacao = situacaoReprodutiva(ctx, animal.data_controle);
  const delDivergente =
    animal.del_origem === 'calculado' &&
    animal.del_lancado !== null &&
    Math.abs((animal.del ?? 0) - animal.del_lancado) > DEL_DIVERGENCIA;

  const local = [temSetor ? ctx?.setor : null, animal.baia].filter(Boolean).join(' · ');

  const detalhesReproducao = [
    situacao.dataCobertura
      ? `cob. ${formatarData(situacao.dataCobertura)}${situacao.reprodutor ? ` · ${situacao.reprodutor}` : situacao.metodo ? ` · ${situacao.metodo}` : ''}`
      : null,
    situacao.dataDg ? `DG ${formatarData(situacao.dataDg)}` : null,
    situacao.partoPrevisto ? `parto ~${formatarData(situacao.partoPrevisto)}` : null,
  ].filter(Boolean);

  return (
    <tr>
      <td className="py-1.5 pe-3">
        <span className="text-foreground">{animal.nome_animal?.trim() || animal.numero_animal}</span>
        {animal.nome_animal?.trim() && (
          <span className="ms-2 text-xs tabular-nums text-muted-foreground">{animal.numero_animal}</span>
        )}
      </td>
      <td className="py-1.5 pe-3 text-muted-foreground">{local || VAZIO}</td>
      <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
        {formatarLitros(animal.litros, 1)}
      </td>
      <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
        {formatarInteiro(animal.ordenhas)}
      </td>
      <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
        {animal.del === null ? VAZIO : `${animal.del} d`}
        {delDivergente && (
          <span className="ms-1 text-xs text-destructive">app: {animal.del_lancado}</span>
        )}
        {ctx?.lactacao_anterior_fim && (
          <span className="block text-xs text-destructive">
            seca em {formatarData(ctx.lactacao_anterior_fim)}
          </span>
        )}
      </td>
      <td className="py-1.5 pe-3 text-muted-foreground">
        {ctx ? (
          <>
            {ctx.lactacao_numero ? `${formatarInteiro(ctx.lactacao_numero)}ª` : VAZIO}
            <span className="ms-2 text-xs tabular-nums">
              {formatarInteiro(ctx.controles_na_lactacao)} ctl · {formatarLitros(ctx.litros_nos_controles, 1)}
            </span>
            {ctx.lactacao_total_app !== null && (
              <span className="block text-xs tabular-nums">
                app: {formatarLitros(ctx.lactacao_total_app, 0)} na lactação
              </span>
            )}
          </>
        ) : (
          VAZIO
        )}
      </td>
      <td className="py-1.5">
        <span
          className={
            situacao.aSecar || situacao.dgAtrasado
              ? 'text-destructive'
              : situacao.estado === 'gestante'
                ? 'text-foreground'
                : 'text-muted-foreground'
          }
        >
          {situacao.rotulo}
          {situacao.aSecar && ' — secar'}
          {situacao.dgAtrasado && ' — DG atrasado'}
        </span>
        {(detalhesReproducao.length > 0 || situacao.semCoberturaLancada) && (
          <span className="block text-xs text-muted-foreground">
            {detalhesReproducao.join(' · ')}
            {situacao.semCoberturaLancada && ' · sem cobertura lançada'}
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * O aviso do controle, pronto para colar. Sai do MESMO array que a tabela acima
 * desenha — não de uma segunda consulta — então o texto e a tela nunca divergem.
 */
function textoDoControle(
  animais: LinhaControleAnimal[],
  resumo: ResumoControle,
  sessao: SessaoControle,
): string {
  const linhas = [
    `*Controle leiteiro — ${formatarData(sessao.chave)}*`,
    '',
    `• Animais no controle: ${formatarInteiro(resumo.animais)}`,
    `• Total do dia: ${formatarLitros(resumo.litrosTotal, 1)}`,
    `• Média por cabeça: ${formatarLitros(resumo.mediaComLeite, 2)}`,
  ];

  if (resumo.delMedio !== null) {
    linhas.push(`• DEL médio: ${formatarNumero(resumo.delMedio, 0)} dias`);
  }

  const melhores = melhoresDoControle(animais, 5);
  if (melhores.length > 0) {
    linhas.push('', '*Maiores produções:*');
    for (const animal of melhores) {
      const nome = animal.nome_animal?.trim();
      linhas.push(
        `• ${nome ? `${animal.numero_animal} - ${nome}` : animal.numero_animal}: ${formatarLitros(animal.litros, 1)}`,
      );
    }
  }

  return linhas.join('\n');
}
