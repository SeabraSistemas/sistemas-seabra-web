import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { idsDoEscopo, lerSelecaoParam } from '@/lib/adm/escopo';
import { getAdmSession } from '@/lib/adm/guard';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, colunasPermitidas, getRegistro, parseColunasParam } from '@/lib/adm/tabelas';

/**
 * O ESCAPE HATCH: qualquer tabela do catálogo, para qualquer cliente, sem uma
 * tela por tabela.
 *
 * É a jogada de maior alavancagem do painel. Foram pedidas "todas as tabelas do
 * banco em view de tabela" — são 93 com `propriedade_id`. Construir 93 telas são
 * meses, e a maioria seria aberta duas vezes por ano. Aqui existe UMA página: ela
 * lê o registro declarativo e monta a grade. Cobrir uma tabela nova custa um
 * objeto em `tabelas-dados.ts`, não um arquivo em `src/app`.
 *
 * O QUE ESTA PÁGINA VALIDA, e por que cada validação existe:
 *
 * · `[tabela]` — vem da URL e é o NOME DE UMA TABELA no `from()`. Se não estiver
 *   no catálogo, é 404 aqui: nada que o operador digite na barra de endereços
 *   pode virar consulta. O catálogo é a allowlist de tabelas.
 * · `?cols=` — passa por `parseColunasParam()`, que é ALLOWLIST (a coluna precisa
 *   estar declarada NESTE registro) com uma denylist por cima. `cpf`,
 *   `colaborador_senha` e `colaborador_senha_hash` são recusados em toda tabela,
 *   existam nela ou não. O que for recusado a tela DIZ que recusou, em vez de
 *   sumir com a coluna em silêncio.
 * · o escopo — `listarTabela()` corta antes de consultar quando o escopo é vazio.
 *   Um `.in('propriedade_id', [])` que escorregasse para "consulta sem WHERE"
 *   devolveria a base inteira, todos os clientes, dentro da ficha de um.
 *
 * Nada disso depende de RLS: o /adm fala com o Postgres pela `service_role`, que
 * ignora policy. Estas verificações SÃO a fronteira.
 */

export default async function TabelaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; tabela: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id, tabela } = await params;
  const usuarioId = Number(id);
  const sp = await searchParams;
  const selecao = lerSelecaoParam(sp.prop);
  const agora = new Date();

  const registro = getRegistro(tabela);
  if (!registro) notFound();

  const sessao = await getAdmSession();
  const cabecalhos = await headers();
  await registrarAcesso('abriu_tabela', {
    sid: sessao?.sid ?? null,
    ator: sessao?.sub ?? null,
    alvoTipo: 'tabela',
    alvoId: usuarioId,
    // Só o nome da tabela e o alvo — nunca conteúdo de linha. A trilha registra
    // QUE houve acesso, não o dado acessado.
    detalhes: { tabela: chaveRota(registro), prop: selecao ?? null },
    ip: extrairIp(cabecalhos),
    userAgent: extrairUserAgent(cabecalhos),
  });

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);
  // Orçamento de células: `?cols=tudo` no rebanho são ~80 colunas, e 1.000 linhas
  // delas viram um payload RSC de vários MB. O teto desce conforme a largura sobe.
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const res = await listarTabela(registro, escopo, { colunas, limite, contarTotal: true });
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href={`/adm/u/${usuarioId}/tabelas${sufixo}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft size={15} strokeWidth={1.8} aria-hidden />
          Todas as tabelas
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-xl">{registro.rotulo}</h1>
          <span className="font-mono text-xs text-muted-foreground">{registro.nome}</span>
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {registro.area}
          </span>
          <span className="text-xs text-muted-foreground">
            {colunasPermitidas(registro).length} colunas declaradas
          </span>
        </div>

        <p className="max-w-4xl text-sm text-muted-foreground">{registro.descricao}</p>

        {registro.notaEscopo && (
          <p className="max-w-4xl rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <span className="text-foreground">Escopo indireto: </span>
            {registro.notaEscopo}
          </p>
        )}

        {registro.filtroFixo && (
          <p className="max-w-4xl rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            Filtro fixo desta tela: <code>{registro.filtroFixo.coluna}</code>{' '}
            {registro.filtroFixo.op === 'contem' ? 'contém' : '='} <code>{registro.filtroFixo.valor}</code>{' '}
            — aplicado ANTES de qualquer filtro da URL, e é o que separa esta tela da tabela inteira.
          </p>
        )}

        {registro.colunaTenant === 'nenhuma' && (
          <p className="max-w-4xl rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            Catálogo GLOBAL: esta tabela não tem coluna de tenant, então o que aparece aqui não é
            deste cliente — é o dicionário que o app inteiro compartilha.
          </p>
        )}
      </header>

      <TabelaGenerica
        tabela={chaveRota(registro)}
        linhas={res.ok ? res.dados.linhas : []}
        total={res.ok ? res.dados.total : 0}
        colunas={colunas}
        rejeitadas={rejeitadas}
        usuarioId={usuarioId}
        agora={agora.toISOString()}
        aproximado={contagemAproximada(registro)}
        erro={res.ok ? null : res.detalhe}
        escopoVazio={idsDoEscopo(escopo).length === 0 && registro.colunaTenant !== 'nenhuma'}
      />
    </div>
  );
}

