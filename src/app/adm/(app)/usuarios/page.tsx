import { Suspense } from 'react';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { ListaUsuarios } from '@/components/adm/ListaUsuarios';
import { formatarInteiro } from '@/lib/adm/format';
import { listarUsuarios } from '@/lib/adm/queries';

/**
 * /adm/usuarios — a lista mestra.
 *
 * A página busca a base INTEIRA uma vez e entrega para <ListaUsuarios>, que
 * filtra, ordena e pagina em memória (a regra de corte documentada é ~2.000
 * linhas; hoje são dezenas). O `paginar()` de queries.ts continua obrigatório
 * mesmo assim: o PostgREST trunca a resposta no `db-max-rows` e devolve HTTP
 * 200, então uma lista incompleta chegaria aqui parecendo completa.
 *
 * O ÚNICO parâmetro que a página lê para consultar é `?testes=1`. Ele muda a
 * QUERY, não a vista: `is_tester`/`is_demo` ficam fora por padrão porque a conta
 * demo é a do reviewer da Apple e as de teste são internas — contá-las infla
 * base e engajamento com gente que não é cliente. Os demais parâmetros (`f.*`,
 * `sort`, `cols`, `page`, `q`) são estado de tela e vivem no cliente, sem
 * round-trip: filtrar no servidor a cada tecla numa rota `force-dynamic`
 * significaria uma query no Supabase por caractere digitado, e o requisito é
 * achar qualquer cliente em 2 segundos.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Usuários · Sistema Seabra',
  robots: { index: false, follow: false },
};

/**
 * A querystring recebida, normalizada. Ela é a `key` de <ListaUsuarios>: o
 * componente lê `?q=` só na montagem (ressincronizar a busca com a URL a cada
 * render brigaria com a digitação), então é a mudança desta chave — que só
 * acontece em navegação de verdade — que remonta a lista com os filtros do link
 * clicado na carteira. Sem ela, o segundo clique num KPI diferente não mudaria nada.
 */
function chaveDaBusca(params: Record<string, string | string[] | undefined>): string {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (valor == null) continue;
    for (const item of Array.isArray(valor) ? valor : [valor]) busca.append(chave, item);
  }
  return busca.toString();
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const agora = new Date();
  const params = await searchParams;
  const incluirTestes = params.testes === '1';
  const resultado = await listarUsuarios({ incluirTestes, ordem: 'risco' });

  // Um único componente decide entre "sem configuração", "erro" e "vazio" — e é
  // por isso que ele recebe o Resultado inteiro em vez de um texto pronto: uma
  // carteira zerada por falta de env, desenhada como vazio, faria o Felipe achar
  // que perdeu os clientes.
  if (!resultado.ok) return <EstadoVazio resultado={resultado} />;

  const usuarios = resultado.dados;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl">Usuários</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {formatarInteiro(usuarios.length)} contas
          {incluirTestes ? ', incluindo as de teste e a demo' : ' (contas de teste e demo fora)'}. O{' '}
          <span className="tabular-nums">#</span> é o número do usuário — clique para copiar. O contato vem mascarado do
          banco, e o sinal de vida é o último lançamento, não o último login.
        </p>
      </header>

      {/*
        Suspense porque <ListaUsuarios> lê a URL com useSearchParams: numa página
        dinâmica ele resolve no servidor e o fallback nem aparece, mas a fronteira
        é o que impede a tela inteira de virar erro de build no dia em que alguém
        tirar o `force-dynamic` daqui.
      */}
      <Suspense
        fallback={
          <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            Carregando a lista…
          </p>
        }
      >
        <ListaUsuarios
          key={chaveDaBusca(params)}
          usuarios={usuarios}
          agora={agora.toISOString()}
          incluindoTestes={incluirTestes}
        />
      </Suspense>
    </div>
  );
}
