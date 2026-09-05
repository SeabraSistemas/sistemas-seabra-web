import { Suspense } from 'react';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { ListaConsultores } from '@/components/adm/ListaConsultores';
import { listarConsultores } from '@/lib/adm/areas/consultoria';
import { formatarInteiro } from '@/lib/adm/format';

/**
 * /adm/consultores — a visão de consultoria.
 *
 * "Alguns são de consultoria", e é por onde a Sistema Seabra vende para quem não
 * é produtor. A tela responde três perguntas na mesma grade: quem está
 * habilitado para AML (competência, grátis), quem paga plano técnico (produto), e
 * QUEM ESTÁ COM A CARTEIRA CHEIA — que é a lista de upgrade, ou seja, dinheiro
 * na tela.
 *
 * A ordem default é carteira mais cheia primeiro, e a razão importa mais que a
 * contagem: 6 de 7 vagas pede uma ligação hoje; 6 de 15, não. A ordenação vem
 * pronta de `listarConsultores()` — a tela não reordena por conta própria, senão
 * a primeira linha deixaria de ser a mais urgente na primeira manutenção.
 *
 * Mesmo desenho da lista mestra (/adm/usuarios): a página busca a lista INTEIRA
 * uma vez e entrega para o Client Component, que filtra, ordena e pagina em
 * memória. São dezenas de técnicos — o `paginar()` continua obrigatório mesmo
 * assim, porque o PostgREST trunca a resposta no `db-max-rows` e devolve HTTP
 * 200: uma carteira incompleta chegaria aqui parecendo completa.
 *
 * `force-dynamic` porque isto é tela de conferência: uma carteira em cache de 60
 * segundos já divergiu do banco quando o Felipe aperta F5 depois de vincular uma
 * fazenda no app.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Consultores · Sistema Seabra',
  robots: { index: false, follow: false },
};

/** A querystring recebida vira a `key` da lista: as facetas são lidas da URL na
 *  montagem, e é a mudança desta chave — que só acontece em navegação de verdade
 *  — que remonta a grade com o filtro do link clicado. Mesmo padrão de
 *  /adm/usuarios. */
function chaveDaBusca(params: Record<string, string | string[] | undefined>): string {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor == null) continue;
    for (const item of Array.isArray(valor) ? valor : [valor]) busca.append(chave, item);
  }
  return busca.toString();
}

export default async function ConsultoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const agora = new Date();
  const params = await searchParams;
  const resultado = await listarConsultores();

  // Um componente só decide entre "sem configuração", "erro" e "vazio". O caso
  // do meio é o que mais importa aqui: uma lista de consultores vazia por falta
  // de env pareceria "não temos consultores", que é uma conclusão comercial
  // errada tirada de uma variável ausente.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const consultores = resultado.dados;
  const semVaga = consultores.filter(
    (c) => c.carteira_cheia || (c.limite_propriedades == null && c.vinculos_ativos > 0),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl">Consultores</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {formatarInteiro(consultores.length)} contas com papel técnico, da carteira mais cheia para a mais vazia.
          {semVaga > 0 && (
            <>
              {' '}
              <span className="text-primary">
                {formatarInteiro(semVaga)} sem vaga no plano atual
              </span>{' '}
              — é a lista de upgrade.
            </>
          )}{' '}
          Habilitação AML e plano de consultoria são coisas separadas: a primeira libera o fluxo grátis de avaliação
          morfológica, o segundo é o produto pago que dá as vagas de fazenda.
        </p>
      </header>

      {/*
        Suspense porque <ListaConsultores> lê a URL com useSearchParams: numa
        página dinâmica ele resolve no servidor e o fallback nem aparece, mas a
        fronteira é o que impede a tela inteira de virar erro de build no dia em
        que alguém tirar o `force-dynamic` daqui.
      */}
      <Suspense
        fallback={
          <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            Carregando os consultores…
          </p>
        }
      >
        <ListaConsultores key={chaveDaBusca(params)} consultores={consultores} agora={agora.toISOString()} />
      </Suspense>
    </div>
  );
}
