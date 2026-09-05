import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { CabecalhoUsuario } from '@/components/adm/CabecalhoUsuario';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { requireAdmSession } from '@/lib/adm/guard';
import { getEscopo } from '@/lib/adm/queries';

/**
 * A ficha do cliente. Este layout é o tronco das cinco abas (`u/[id]`,
 * `/rebanho`, `/producao`, `/assinatura`, `/tabelas`) e faz três coisas que
 * nenhuma delas deve repetir.
 *
 * 1. AUDITORIA ANTES DO DADO. `abriu_usuario` é gravado antes de qualquer
 *    leitura da ficha, como manda audit.ts: registrar depois deixaria um acesso
 *    sem rastro toda vez que o carregamento falhasse no meio. Não é capricho —
 *    Marco Civil art. 15 e LGPD art. 37 pedem registro de quem acessou dado de
 *    terceiro, e a partir do /adm esse acesso passa a ser rotina.
 *
 * 2. ESCOPO UMA VEZ, DEGRADAÇÃO UMA VEZ. `getEscopo()` responde "quais
 *    propriedades este usuário alcança"; se ele não responde (sem env, view
 *    ausente, usuário inexistente), o painel para AQUI, com um aviso que diz o
 *    que fazer. É o que permite `npm run dev` sem a service_role na máquina:
 *    as abas abaixo assumem escopo resolvido e não precisam repetir o aviso.
 *
 * 3. O CABEÇALHO STICKY. Trocar de aba não pode fazer o Felipe perder de vista
 *    de quem é a ficha — o erro mais caro do painel é agir sobre o cliente errado.
 *
 * ⚠️ O layout NÃO lê `?prop=`: o App Router não entrega searchParams a layouts.
 * Por isso `getEscopo()` é chamado aqui SEM seleção e quem resolve a propriedade
 * em foco é o <SeletorPropriedade>, que é Client Component e lê a URL sozinho.
 * As páginas repetem a chamada com a seleção; a repetição é barata porque o Next
 * memoiza `fetch` idêntico dentro do mesmo render (o supabase-js usa fetch), e
 * de todo modo são duas views indexadas.
 *
 * O gate de sessão já rodou em (app)/layout.tsx. Chamar `requireAdmSession()` de
 * novo não é redundância decorativa: é daqui que sai o `sid` que amarra a linha
 * de auditoria à sessão específica, e é a segunda tranca caso um dia esta
 * subárvore mude de route group.
 */

export default async function LayoutFichaUsuario({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const sessao = await requireAdmSession();

  // No Next 16 params é Promise. `id` vem da URL: qualquer coisa que não seja
  // inteiro positivo é 404 e não chega a virar consulta.
  const { id } = await params;
  const usuarioId = Number(id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) notFound();

  const cabecalhos = await headers();
  await registrarAcesso('abriu_usuario', {
    sid: sessao.sid,
    ator: sessao.sub,
    alvoTipo: 'usuario',
    alvoId: usuarioId,
    ip: extrairIp(cabecalhos),
    userAgent: extrairUserAgent(cabecalhos),
  });

  const escopo = await getEscopo(usuarioId);

  if (!escopo.ok) {
    // Heurística estreita e deliberada, amarrada à mensagem exata de
    // queries.ts (`[adm] usuário N não existe.`): id válido mas inexistente é
    // 404, não erro de infraestrutura. Qualquer outra falha é mostrada como
    // falha — inventar "não encontrado" para um erro de rede esconderia uma
    // view quebrada atrás de uma tela de "cliente não existe".
    if (escopo.motivo === 'erro' && /não existe/.test(escopo.detalhe)) notFound();
    // <EstadoVazio> recebe o Resultado inteiro e separa sozinho "falta env" de
    // "a consulta quebrou" — quem chama não tem como esquecer o caso do meio, que
    // é o pior de todos: uma ficha vazia por falta de variável de ambiente parece
    // um cliente que perdeu os dados.
    return <EstadoVazio resultado={escopo} className="mt-6" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoUsuario escopo={escopo.dados} />
      {children}
    </div>
  );
}
