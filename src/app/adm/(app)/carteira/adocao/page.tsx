import Link from 'next/link';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { MatrizCoorte } from '@/components/adm/charts/MatrizCoorte';
import {
  MINIMO_COORTE,
  TETO_COLUNAS,
  getCoorte,
  montarMatriz,
  resumoAdocao,
  type CoortesDescartadas,
  type MatrizRetencao,
  type MeiaVida,
  type RetencaoAgregada,
} from '@/lib/adm/areas/coorte';
import { VAZIO, formatarDataHora, formatarInteiro, formatarMes, formatarPercentual } from '@/lib/adm/format';

/**
 * /adm/carteira/adocao — a matriz de coorte de retenção.
 *
 * A PERGUNTA QUE ESTA TELA RESPONDE, e que nenhuma outra do painel responde:
 * "quem entra fica?". A carteira mostra quantos clientes existem HOJE; um número
 * que sobe tanto porque a empresa retém quanto porque a empresa vende rápido o
 * bastante para repor quem sai. A coorte separa as duas coisas — e é a única
 * tela do /adm em que um resultado ruim aparece antes de o cliente cancelar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE ESTA TELA SE RECUSA A DESENHAR
 *
 * Matriz de coorte é o gráfico que mais fácil mente, e sempre da mesma forma:
 * misturando "a coorte perdeu gente" com "o mês ainda não chegou". As três
 * recusas estão implementadas em src/lib/adm/areas/coorte.ts, não aqui — a tela
 * só as CONTA em português, no bloco "Como ler", porque uma regra que o operador
 * não conhece é uma regra que ele desconta pela metade:
 *
 *   · o mês em curso fica inteiro de fora (hoje é sempre um mês pela metade);
 *   · célula além do horizonte da coorte fica em branco, nunca em 0%;
 *   · coorte com menos de MINIMO_COORTE contas não vira linha — e o quanto isso
 *     descartou aparece escrito, porque encolher o denominador em silêncio é a
 *     outra metade da mesma desonestidade.
 *
 * `force-dynamic` pelo mesmo motivo de /adm/carteira: é tela de conferência, e
 * uma matriz em cache de 60 s já divergiu do banco quando se aperta F5.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Adoção e retenção · Sistema Seabra',
  robots: { index: false, follow: false },
};

export default async function AdocaoPage() {
  // Um instante só para a página inteira: o mês em curso que a regra 2 exclui e
  // o carimbo do cabeçalho falam do mesmo relógio.
  const agora = new Date();

  const resultado = await getCoorte();
  // O componente recebe o Resultado inteiro e decide entre "sem configuração",
  // "erro" e "vazio". Uma matriz zerada por falta de migration lida como carteira
  // que não retém ninguém seria a pior leitura errada possível desta tela.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const matriz = montarMatriz(resultado.dados, agora);
  const resumo = resumoAdocao(matriz);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/adm/carteira" className="underline underline-offset-4 hover:text-foreground">
              Carteira
            </Link>{' '}
            › Adoção
          </p>
          <h1 className="mt-1 text-2xl">Adoção e retenção</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {matriz.faixas.length > 0 ? (
              <>
                {formatarInteiro(matriz.faixas.length)} coortes · {formatarInteiro(matriz.contas)} contas ·
                até o mês {formatarInteiro(matriz.mesesMaximo)} de vida
              </>
            ) : (
              'Quem entra, fica? Uma linha por mês de entrada; uma coluna por mês de vida.'
            )}
          </p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">lido agora, {formatarDataHora(agora)}</p>
      </header>

      {matriz.faixas.length === 0 ? (
        <EstadoVazio
          titulo="Ainda não há coorte para montar a matriz"
          texto={<SemCoortes matriz={matriz} />}
          acao={
            <Link
              href="/adm/usuarios?sort=-cadastro"
              className="mt-2 text-sm text-foreground underline underline-offset-4"
            >
              Ver as contas por data de cadastro
            </Link>
          }
        />
      ) : (
        <>
          <Cards resumo={resumo} matriz={matriz} />

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base leading-tight">Retenção por coorte</h2>
              <span className="shrink-0 text-xs text-muted-foreground">
                linha = mês de entrada · coluna = mês de vida · célula = contas ainda ativas
              </span>
            </div>
            <div className="mt-3">
              <MatrizCoorte matriz={matriz} />
            </div>
          </section>

          <ComoLer matriz={matriz} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────────────

function meses(n: number): string {
  return `${formatarInteiro(n)} ${n === 1 ? 'mês' : 'meses'}`;
}

function contas(n: number): string {
  return `${formatarInteiro(n)} ${n === 1 ? 'conta' : 'contas'}`;
}

/** "9 de 12 contas · 4 coortes" — o denominador e quantas coortes o compõem. */
function detalheAgregada(a: RetencaoAgregada): string {
  const quantas = a.coortes === 1 ? '1 coorte' : `${formatarInteiro(a.coortes)} coortes`;
  return `${formatarInteiro(a.ativos)} de ${contas(a.base)} · ${quantas}`;
}

function Cards({ resumo, matriz }: { resumo: ReturnType<typeof resumoAdocao>; matriz: MatrizRetencao }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/*
        A ATIVAÇÃO vem primeiro porque é a única coluna que ainda dá para mudar:
        retenção do mês 6 é história, ativação é o onboarding de quem entrou
        semana passada. Quem não lança nada no primeiro mês raramente volta.

        RESSALVA QUE O CARD CARREGA: o mês 0 é, por construção, um mês incompleto
        — quem assinou dia 28 teve três dias dele. O número é honesto como
        comparação ENTRE coortes (todas sofrem o mesmo viés) e otimista demais
        como afirmação absoluta.
      */}
      <CardRetencao
        rotulo="Ativação no mês de entrada"
        agregada={resumo.ativacao}
        vazio="nenhuma coorte fechou o mês de entrada"
      />

      {resumo.retencao.map(({ mes, valor }) => (
        <CardRetencao
          key={mes}
          rotulo={`Retenção em ${meses(mes)}`}
          agregada={valor}
          vazio={`nenhuma coorte completou ${meses(mes)}`}
        />
      ))}

      <CardMeiaVida meiaVida={resumo.meiaVida} coortes={matriz.faixas.length} />
    </section>
  );
}

function CardRetencao({
  rotulo,
  agregada,
  vazio,
}: {
  rotulo: string;
  agregada: RetencaoAgregada | null;
  vazio: string;
}) {
  // O "—" AQUI É A REGRA 1 NO CARD. Sem coorte madura o bastante, o valor não é
  // 0% — é uma pergunta que o calendário ainda não deixou responder. Um zero
  // neste card diria que a empresa perdeu todo mundo em doze meses.
  return (
    <KpiCard
      rotulo={rotulo}
      valor={agregada ? formatarPercentual(agregada.retencao) : VAZIO}
      detalhe={agregada ? detalheAgregada(agregada) : vazio}
    />
  );
}

function CardMeiaVida({ meiaVida, coortes }: { meiaVida: MeiaVida | null; coortes: number }) {
  // Censura com horizonte zero ("≥ 0 meses") é uma frase sem conteúdo: diz
  // apenas que ninguém viveu tempo suficiente para a conta existir. Vira traço.
  const semLastro = meiaVida === null || (meiaVida.censurado && meiaVida.meses === 0);

  return (
    <KpiCard
      rotulo="Meia-vida da coorte"
      valor={
        semLastro || !meiaVida
          ? VAZIO
          : meiaVida.censurado
            ? `≥ ${meses(meiaVida.meses)}`
            : meses(meiaVida.meses)
      }
      detalhe={
        semLastro || !meiaVida
          ? 'as coortes ainda não viveram meses fechados suficientes'
          : meiaVida.censurado
            ? `a coorte mediana das ${formatarInteiro(coortes)} ainda não perdeu metade das contas — o número é um piso`
            : 'mês em que a coorte mediana cai abaixo de 50%'
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// As ressalvas, escritas
// ─────────────────────────────────────────────────────────────────────────────

function descarte(d: CoortesDescartadas): string {
  const quantas = d.coortes === 1 ? '1 coorte' : `${formatarInteiro(d.coortes)} coortes`;
  return `${quantas} (${contas(d.contas)})`;
}

/** O estado vazio precisa dizer POR QUE está vazio: "sem coorte" e "todas as
 *  coortes eram pequenas demais" são situações opostas do negócio. */
function SemCoortes({ matriz }: { matriz: MatrizRetencao }) {
  const nada = matriz.pequenas.coortes === 0 && matriz.novasDemais.coortes === 0;

  return (
    <>
      {nada ? (
        <>
          A view <code className="text-foreground">adm.coorte_retencao</code> não devolveu nenhuma coorte
          com mês fechado. Se o SQL da Fase 3 já rodou, isto significa que ainda não há histórico de
          cadastro suficiente — e não que a retenção seja ruim.
        </>
      ) : (
        <>
          Havia coortes, mas nenhuma sobreviveu às regras de leitura:{' '}
          {matriz.pequenas.coortes > 0 && (
            <>
              {descarte(matriz.pequenas)} com menos de {MINIMO_COORTE} contas
              {matriz.novasDemais.coortes > 0 ? ' e ' : '. '}
            </>
          )}
          {matriz.novasDemais.coortes > 0 && (
            <>
              {descarte(matriz.novasDemais)} que entraram em {formatarMes(matriz.mesEmCurso)} e ainda não
              fecharam um mês.{' '}
            </>
          )}
          Uma coorte de uma ou duas contas só sabe dizer 100% ou 0% — desenhá-la estragaria a leitura
          de todas as outras.
        </>
      )}
    </>
  );
}

function ComoLer({ matriz }: { matriz: MatrizRetencao }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base leading-tight">Como ler esta matriz</h2>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="font-medium text-foreground">Célula em branco não é 0%.</strong> É um mês
          que ainda não aconteceu para aquela coorte. Quem entrou há três meses não tem mês 6 — e
          desenhar esse mês como zero inventaria uma queda que é só o calendário.
        </li>
        <li>
          <strong className="font-medium text-foreground">
            {formatarMes(matriz.mesEmCurso)} está fora da matriz.
          </strong>{' '}
          O mês em curso tem calendário inteiro e lançamentos pela metade; incluí-lo faria a última
          diagonal despencar todo dia 1º e se recuperar até o dia 30.
        </li>
        <li>
          <strong className="font-medium text-foreground">
            Coorte com menos de {MINIMO_COORTE} contas não vira linha.
          </strong>{' '}
          {matriz.pequenas.coortes > 0 ? (
            <>Ficaram de fora {descarte(matriz.pequenas)} por este corte.</>
          ) : (
            <>Nenhuma coorte precisou ser cortada por este critério.</>
          )}{' '}
          {matriz.novasDemais.coortes > 0 && (
            <>
              Outras {descarte(matriz.novasDemais)} entraram em {formatarMes(matriz.mesEmCurso)} e ainda
              não fecharam nenhum mês.
            </>
          )}
        </li>
        <li>
          <strong className="font-medium text-foreground">A última linha é média ponderada</strong> por
          contas, não média das porcentagens: uma coorte de 3 e uma de 30 não pesam igual. O número
          menor embaixo de cada célula é o denominador daquela coluna — ele encolhe para a direita
          porque menos coortes chegaram lá, e é isso, e não churn, que explica boa parte da inclinação
          do fim da curva.
        </li>
        {matriz.truncada && (
          <li>
            <strong className="font-medium text-destructive">A matriz está cortada.</strong> Alguma
            coorte já viveu mais de {formatarInteiro(TETO_COLUNAS)} meses, e a tabela para nesse limite
            para continuar legível. Os meses seguintes existem no banco — o corte é da tela.
          </li>
        )}
        <li>
          <strong className="font-medium text-foreground">O que esta tela ainda não responde:</strong>{' '}
          quantos DIAS uma conta leva até o primeiro lançamento. A view{' '}
          <code className="text-foreground">adm.coorte_retencao</code> agrega por mês e não carrega a
          data do primeiro lançamento de cada conta, então o sinal de ativação aqui é a coluna do mês 0
          — a fração que já estava ativa no mês em que entrou. Um número em dias exigiria a coluna no
          contrato (<code className="text-foreground">src/lib/adm/areas/contrato.ts</code>) antes de
          existir na tela; estimá-lo com o que está à mão seria inventá-lo.
        </li>
      </ul>
    </section>
  );
}
