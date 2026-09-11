import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  FAMACHA_CRITICO,
  TIPOS_MANEJO,
  contarPorTipo,
  escalaFamacha,
  faixasDeEscore,
  lerTipo,
  listarManejos,
  medicoesCriticas,
  resumoManejos,
  rotuloDoTipo,
  serieManejos,
  valoresDeCasco,
  type ContagemTipo,
  type FaixaEscore,
  type GrauFamacha,
  type ResumoManejos,
  type ValorCasco,
} from '@/lib/adm/areas/manejos';
import type { LinhaManejo } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * MANEJO — o curral desmembrado por tipo de lançamento.
 *
 * ⚠️ A LINHA NÃO É O MANEJO: `tipo_manejo` é um array, e a view faz unnest. Uma
 * ida ao curral que mediu FAMACHA, escore e casco vira três linhas — por isso
 * toda contagem aqui é de `manejo_id` distinto. Contar linhas multiplicaria o
 * trabalho da fazenda pelo número de coisas medidas de uma vez, e faria um
 * cliente organizado parecer três vezes mais ativo que outro.
 *
 * O filtro por tipo é o que o operador pede em voz alta ("quero ver só os
 * FAMACHA"), e cada tipo abre a leitura que só ele tem: escala invertida no
 * FAMACHA, extremos nos dois lados no escore, e — no casco — os valores crus,
 * porque aquela coluna mistura duas perguntas e tem um booleano vazado dentro.
 */
export const dynamic = 'force-dynamic';

export default async function ManejosPage({
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
  const tipo = lerTipo(sp.tipo);

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
            ? 'Sem propriedade no escopo — não há manejo para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  // Os TIPOS são sempre contados sobre o histórico inteiro (sem filtro), senão o
  // seletor sumiria com os tipos não escolhidos e não haveria como voltar.
  const [todosRes, filtradoRes] = await Promise.all([
    listarManejos(alvo.id, null),
    tipo === null ? Promise.resolve(null) : listarManejos(alvo.id, tipo),
  ]);
  if (!todosRes.ok) return <EstadoVazio resultado={todosRes} />;
  if (filtradoRes && !filtradoRes.ok) return <EstadoVazio resultado={filtradoRes} />;

  const todos = todosRes.dados;
  const manejos = filtradoRes ? filtradoRes.dados : todos;

  const tipos = contarPorTipo(todos);
  const resumo = resumoManejos(manejos);
  const serie = serieManejos(manejos);
  const famacha = escalaFamacha(manejos);
  const criticas = medicoesCriticas(famacha);
  const escores = faixasDeEscore(manejos);
  const cascos = valoresDeCasco(manejos);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaSanidade usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">
          Manejos{tipo === null ? '' : ` · ${rotuloDoTipo(tipo)}`}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Uma ida ao curral pode medir várias coisas de uma vez — por isso a contagem é de manejos,
          não de lançamentos.
        </p>
      </div>

      <Tipos tipos={tipos} atual={tipo} usuarioId={usuarioId} selecao={selecao} />

      {manejos.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          {todos.length === 0
            ? 'Nenhum manejo registrado nesta fazenda.'
            : 'Nenhum manejo deste tipo. Escolha outro acima.'}
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Manejos por mês</h2>
                <p className="text-xs text-muted-foreground">
                  Manejos distintos, não lançamentos — o mês com manejo multi-tipo apareceria como
                  um pico de trabalho que não houve.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'manejos', nome: 'Manejos', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          {famacha.some((g) => g.medicoes > 0) && (
            <Famacha escala={famacha} criticas={criticas} />
          )}

          {escores.some((f) => f.medicoes > 0) && <Escore faixas={escores} />}

          {cascos.length > 0 && <Casco valores={cascos} />}

          <Tabela manejos={manejos} tipo={tipo} usuarioId={usuarioId} sufixo={sufixo} />
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

/** O desmembramento: cada tipo é um filtro, com a contagem de manejos distintos. */
function Tipos({
  tipos,
  atual,
  usuarioId,
  selecao,
}: {
  tipos: ContagemTipo[];
  atual: string | null;
  usuarioId: number;
  selecao: SelecaoPropriedade;
}) {
  if (tipos.length === 0) return null;

  const base = `/adm/u/${usuarioId}/sanidade/manejos`;
  const prop = selecao == null ? '' : `prop=${selecao}&`;
  const conhecidos = new Set(TIPOS_MANEJO.map((t) => t.chave));

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Tipo de lançamento</h2>
        <p className="text-xs text-muted-foreground">
          A soma passa do total de manejos: um manejo que mediu duas coisas conta nas duas.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link
          href={`${base}${prop ? `?${prop.slice(0, -1)}` : ''}`}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            atual === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos
        </Link>
        {tipos.map((tipo) => (
          <Link
            key={tipo.chave}
            href={`${base}?${prop}tipo=${tipo.chave}`}
            title={tipo.detalhe}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              atual === tipo.chave
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {conhecidos.has(tipo.chave) ? tipo.rotulo : tipo.chave}{' '}
            <span className="tabular-nums opacity-70">{formatarInteiro(tipo.manejos)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Cards({ resumo }: { resumo: ResumoManejos }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Manejos"
        valor={formatarInteiro(resumo.manejos)}
        // A diferença entre manejos e linhas é a informação: ela mostra quantas
        // coisas a fazenda mede de uma vez só.
        detalhe={
          resumo.linhas > resumo.manejos
            ? `${formatarInteiro(resumo.linhas)} lançamentos no total`
            : 'um lançamento cada'
        }
      />
      <KpiCard rotulo="Animais" valor={formatarInteiro(resumo.animais)} detalhe="animais distintos" />
      <KpiCard rotulo="Dias de curral" valor={formatarInteiro(resumo.dias)} detalhe="datas distintas" />
      <KpiCard
        rotulo="Tipos medidos"
        valor={formatarInteiro(resumo.tipos)}
        detalhe="dos dez que o app registra"
      />
      <KpiCard
        rotulo="Manejos multi-tipo"
        valor={formatarInteiro(resumo.multiTipo)}
        detalhe="mediram mais de uma coisa na mesma ida"
      />
      <KpiCard
        rotulo="Último manejo"
        valor={resumo.ultima ? formatarData(resumo.ultima) : VAZIO}
        detalhe={resumo.primeira ? `primeiro em ${formatarData(resumo.primeira)}` : undefined}
      />
    </div>
  );
}

/**
 * A escala FAMACHA, na ORDEM DA ESCALA — nunca ordenada por volume.
 *
 * É uma escala INVERTIDA: 1 é saudável, 5 é anêmico grave. Reordenar por
 * contagem transformaria "o rebanho está concentrado nos graus 4 e 5" em "o grau
 * 4 é o mais comum", que é a informação menos útil das duas.
 */
function Famacha({ escala, criticas }: { escala: GrauFamacha[]; criticas: number }) {
  const total = escala.reduce((acc, g) => acc + g.medicoes, 0);
  const maior = Math.max(...escala.map((g) => g.medicoes), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">FAMACHA</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(total)} medições. Escala invertida: 1 é saudável, 5 é anêmico grave.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {escala.map((grau) => (
          <li key={grau.grau} className="grid grid-cols-[4rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="text-muted-foreground">Grau {grau.grau}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${grau.critico ? 'bg-destructive/70' : 'bg-primary'}`}
                style={{ width: `${(grau.medicoes / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(grau.medicoes)}
              <span className="ms-1 text-xs text-muted-foreground">
                {grau.fracao === null ? VAZIO : formatarPercentual(grau.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <strong className="text-destructive">
          {formatarInteiro(criticas)} medições em grau {FAMACHA_CRITICO} ou 5
        </strong>{' '}
        {total > 0 && `(${formatarPercentual(criticas / total)})`} — é o corte em que o protocolo
        manda tratar o animal. Média subindo aqui é notícia ruim, ao contrário de quase todo número
        do painel.
      </p>
    </section>
  );
}

function Escore({ faixas }: { faixas: FaixaEscore[] }) {
  const total = faixas.reduce((acc, f) => acc + f.medicoes, 0);
  const maior = Math.max(...faixas.map((f) => f.medicoes), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Escore de condição corporal</h2>
        <p className="text-xs text-muted-foreground">{formatarInteiro(total)} medições.</p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((faixa) => (
          <li key={faixa.rotulo} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{faixa.rotulo}</span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className={`block h-full rounded-full ${faixa.alerta ? 'bg-destructive/70' : 'bg-primary'}`}
                style={{ width: `${(faixa.medicoes / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(faixa.medicoes)}
              <span className="ms-1 text-xs text-muted-foreground">
                {faixa.fracao === null ? VAZIO : formatarPercentual(faixa.fracao)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Os dois extremos custam, e por isso os dois estão marcados: abaixo de 2,5 o animal está magro
        e não emprenha; acima de 4,0 está gordo e tem parto difícil.
      </p>
    </section>
  );
}

function Casco({ valores }: { valores: ValorCasco[] }) {
  const suspeitos = valores.filter((v) => v.suspeito);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Casco</h2>
        <p className="text-xs text-muted-foreground">Os valores como estão no banco.</p>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {valores.map((valor) => (
          <li key={valor.valor} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="truncate">
              <span className={valor.suspeito ? 'text-destructive' : 'text-foreground'}>
                {valor.valor}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatarInteiro(valor.manejos)}
            </span>
          </li>
        ))}
      </ul>

      {suspeitos.length > 0 && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Os valores em vermelho não são &quot;Feito&quot; nem &quot;A fazer&quot;. A coluna mistura
          duas perguntas — se o casqueamento foi feito e como o casco está —, e o valor{' '}
          <strong className="text-foreground">False</strong>, quando aparece, é um booleano que vazou
          para uma coluna de texto. A tela não traduz nenhum deles: adivinhar se &quot;False&quot;
          quer dizer &quot;não foi feito&quot; ou &quot;casco ruim&quot; seria inventar o dado.
        </p>
      )}
    </section>
  );
}

function Tabela({
  manejos,
  tipo,
  usuarioId,
  sufixo,
}: {
  manejos: LinhaManejo[];
  tipo: string | null;
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Lançamentos</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(manejos.length)} linhas, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              {tipo === null && <th className="py-1.5 pe-3 font-normal">Tipo</th>}
              <th className="py-1.5 pe-3 text-right font-normal">FAMACHA</th>
              <th className="py-1.5 pe-3 text-right font-normal">Escore</th>
              <th className="py-1.5 font-normal">Detalhe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {manejos.slice(0, 100).map((manejo) => (
              <tr key={`${manejo.manejo_id}-${manejo.tipo}`}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {manejo.nome_animal?.trim() || manejo.numero_animal}
                  </span>
                  {manejo.categoria && (
                    <span className="ms-2 text-xs text-muted-foreground">{manejo.categoria}</span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(manejo.data_manejo)}
                </td>
                {tipo === null && (
                  <td className="py-1.5 pe-3 text-muted-foreground">{rotuloDoTipo(manejo.tipo)}</td>
                )}
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {manejo.famacha === null ? VAZIO : formatarInteiro(manejo.famacha)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {manejo.escore_corporal === null ? VAZIO : formatarNumero(manejo.escore_corporal, 1)}
                </td>
                <td className="py-1.5 text-muted-foreground">
                  {manejo.protocolo_sanitario?.trim() ||
                    manejo.casco_status?.trim() ||
                    manejo.diagnostico_gestacao?.trim() ||
                    manejo.observacao?.trim() ||
                    VAZIO}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {manejos.length > 100 && (
          <>Mostrando as 100 mais recentes de {formatarInteiro(manejos.length)}. </>
        )}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/manejo${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de manejo
        </Link>
        .
      </p>
    </section>
  );
}
