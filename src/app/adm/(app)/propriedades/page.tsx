import { Suspense } from 'react';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { ListaPropriedades, type PropriedadeNaTela } from '@/components/adm/ListaPropriedades';
import { fichaDaPropriedade, listarPropriedades, resumirPropriedades } from '@/lib/adm/areas/propriedades';
import { formatarInteiro } from '@/lib/adm/format';

/**
 * /adm/propriedades — o diretório da entidade que o Felipe realmente gere.
 *
 * "Não quero acompanhar nada de colaborador, somente da propriedade que eu quero
 * ver, nela posso até ter a relação dos colaboradores" (05/09/2026). O tenant
 * real do banco é `propriedade_id` — 93 tabelas o carregam —, e é a FAZENDA que
 * ele administra; o usuário é só quem loga nela.
 *
 * Esta tela responde o que a lista de usuários não tem como responder:
 *
 *   · a conta com DUAS fazendas, que lá aparece como uma linha só somando dois
 *     rebanhos que não se parecem;
 *   · a fazenda de CONSULTORIA, que lá não aparece de jeito nenhum, porque não
 *     existe conta para listar.
 *
 * E ela NÃO abre uma ficha nova: cada linha leva para `/adm/u/<dono>?prop=<id>`,
 * com as 13 abas que já existem.
 *
 * Mesmo desenho da lista mestra e da de consultores: a página busca a lista
 * INTEIRA uma vez e entrega para o Client Component, que filtra, ordena e pagina
 * em memória (são dezenas de fazendas). O `paginar()` de `areas/propriedades.ts`
 * continua obrigatório mesmo assim — o PostgREST trunca a resposta no
 * `db-max-rows` e devolve HTTP 200, então uma lista incompleta chegaria aqui
 * parecendo completa, e os cards contariam sobre ela.
 *
 * OS CARDS FALAM DA CARTEIRA INTEIRA; a linha acima da tabela fala da SELEÇÃO.
 * São perguntas diferentes e por isso números diferentes — cada card leva para a
 * lista já filtrada que o compõe, que é o que fecha o ciclo: nenhum número
 * agregado do painel fica sem caminho de volta para as linhas.
 *
 * `force-dynamic` porque isto é tela de conferência: um diretório em cache de 60
 * segundos já divergiu do banco quando o Felipe aperta F5 depois de cadastrar
 * uma fazenda no app.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Propriedades · Sistema Seabra',
  robots: { index: false, follow: false },
};

/**
 * Os parâmetros que a grade sabe ler: `f.<chave>` é a gramática de filtro da
 * <AdmFilters> e `sort=-coluna` a da <AdmTable>. Um link que erre o prefixo não
 * dá erro — abre a lista inteira, que é pior, porque parece ter funcionado.
 * Por isso as chaves abaixo são as MESMAS declaradas nas facetas e colunas de
 * <ListaPropriedades>.
 */
const AQUI = '/adm/propriedades';

export default async function PropriedadesPage() {
  const agora = new Date();
  const resultado = await listarPropriedades({ ordem: 'risco' });

  // Um componente só decide entre "sem configuração", "erro" e "vazio". O caso
  // do meio é o que mais importa: um diretório vazio por falta de env (ou por
  // falta da migration da Fase 3) pareceria "não temos clientes" — uma conclusão
  // comercial tirada de uma variável ausente.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const propriedades = resultado.dados;
  const resumo = resumirPropriedades(propriedades);

  // A URL da ficha é resolvida AQUI, no servidor, por uma função pura e testada.
  // `null` é a fazenda de consultoria: a linha não é clicável, e a célula do
  // produtor explica por quê e por onde ir.
  const linhas: PropriedadeNaTela[] = propriedades.map((l) => ({ ...l, ficha: fichaDaPropriedade(l) }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl">Propriedades</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {formatarInteiro(resumo.propriedades)} fazendas de {formatarInteiro(resumo.produtores)} contas de produtor
          {resumo.semProdutor > 0 && <>, mais {formatarInteiro(resumo.semProdutor)} sem produtor no sistema</>}. A
          fazenda é o tenant real do banco — a linha abre a ficha do dono com ela em foco, e a equipe que trabalha nela
          é uma coluna daqui. Da mais em risco para a mais saudável; o sinal de vida é o último lançamento, não o
          último login.
        </p>
      </header>

      {/* ── Cards ────────────────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          rotulo="Propriedades"
          valor={formatarInteiro(resumo.propriedades)}
          detalhe={
            resumo.contasComMaisDeUmaFazenda > 0
              ? `${formatarInteiro(resumo.produtores)} contas de produtor · ${formatarInteiro(resumo.contasComMaisDeUmaFazenda)} com mais de uma fazenda`
              : `${formatarInteiro(resumo.produtores)} contas de produtor`
          }
        />

        <KpiCard
          rotulo="Com acesso ativo"
          valor={formatarInteiro(resumo.comAcessoAtivo)}
          // A assinatura é do DONO — a fazenda não assina. Dizer isso no card
          // evita a leitura errada de que a fazenda de consultoria "está sem pagar".
          detalhe="pela assinatura do produtor dono"
          href={`${AQUI}?f.acesso=ativo`}
        />

        <KpiCard
          rotulo="Animais na base"
          valor={formatarInteiro(resumo.animais)}
          detalhe={`vivos · ${formatarInteiro(resumo.lactantes)} em lactação`}
          href={`${AQUI}?sort=-animais_ativos`}
        />

        {/* D2: atividade é LANÇAMENTO, não login. E "sumida" aqui é sumida MAS
            AINDA PAGANDO — sem o acesso ativo a lista se encheria de conta
            cancelada há um ano, que não é ação nenhuma. Quem nunca lançou fica
            no detalhe, e não somado: é ligação de onboarding, não de retenção. */}
        <KpiCard
          rotulo="Silenciosas há +30 dias"
          valor={formatarInteiro(resumo.silenciosas)}
          detalhe={`com acesso ativo · ${formatarInteiro(resumo.nuncaLancaram)} nunca lançaram`}
          href={`${AQUI}?f.atividade=silencioso`}
        />

        <KpiCard
          rotulo="Sem produtor no sistema"
          valor={formatarInteiro(resumo.semProdutor)}
          detalhe="fazendas de consultoria — o cliente do técnico não usa o app"
          href={`${AQUI}?f.produtor=consultoria`}
        />
      </section>

      {/*
        Suspense porque <ListaPropriedades> lê a URL com useSearchParams: numa
        página dinâmica ele resolve no servidor e o fallback nem aparece, mas a
        fronteira é o que impede a tela inteira de virar erro de build no dia em
        que alguém tirar o `force-dynamic` daqui.

        Sem `key` derivada da querystring (a lista mestra tem, porque lá o campo
        de busca guarda estado próprio que precisa ser recriado). Aqui todo o
        estado da tela mora na URL e é lido a cada render — remontar a grade a
        cada clique de chip só jogaria fora o painel lateral aberto.
      */}
      <Suspense
        fallback={
          <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            Carregando as fazendas…
          </p>
        }
      >
        <ListaPropriedades propriedades={linhas} agora={agora.toISOString()} />
      </Suspense>
    </div>
  );
}
