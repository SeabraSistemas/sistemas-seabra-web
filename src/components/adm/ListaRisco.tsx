import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import {
  VAZIO,
  diasEntre,
  formatarDiasRelativo,
  formatarInteiro,
  formatarMoeda,
  formatarVencimento,
} from '@/lib/adm/format';
import type { UsuarioLista } from '@/lib/adm/types';
import { cn } from '@/lib/utils';

/**
 * As três listas de risco da /adm/carteira. Server Component: nenhuma interação,
 * nenhum estado — só leitura e link.
 *
 * Isto NÃO é uma tabela, e a diferença é de propósito. Tabela é para comparar N
 * colunas; esta lista existe para o Felipe ligar para alguém hoje. Por isso cada
 * linha carrega exatamente três coisas: quem é, O NÚMERO QUE JUSTIFICA A LIGAÇÃO
 * (dias sumido, dias para vencer) e o valor em jogo. Qualquer coluna a mais
 * empurra o número que importa para fora do olhar.
 *
 * `agora` é PROP e não `new Date()` aqui dentro: a página já tem o instante que
 * usou para buscar os dados, e recalcular aqui faria a mesma conta ser feita
 * duas vezes com dois relógios — é assim que um "vence hoje" vira "vencido há 1
 * dia" no meio da renderização. Mesma disciplina de format.ts/metricas.ts.
 */

export type MotivoRisco = 'silencio' | 'cobranca' | 'trial';

type Tom = 'critico' | 'alerta' | 'neutro';

/** Só o número do destaque recebe cor. Colorir a linha inteira transforma a
 *  lista num semáforo, e o olho para de encontrar o que é urgente. */
const TOM_CLASSE: Record<Tom, string> = {
  critico: 'text-destructive',
  alerta: 'text-amber-300',
  neutro: 'text-foreground',
};

/**
 * Vazio aqui é NOTÍCIA BOA, não ausência de dados — e precisa ser escrito assim,
 * senão a tela parece quebrada justamente no dia em que está tudo certo.
 */
const VAZIO_PADRAO: Record<MotivoRisco, string> = {
  silencio: 'Ninguém com acesso ativo parou de lançar. Esta lista vazia é a leitura boa.',
  cobranca: 'Nenhuma cobrança vencida nem vencendo nos próximos 7 dias.',
  trial: 'Nenhum trial terminando agora.',
};

interface Destaque {
  /** O número que justifica a ação. */
  principal: string;
  /** O que está em jogo — dinheiro quando existe, uso quando ainda não há dinheiro. */
  apoio: string;
  tom: Tom;
}

function mensalidade(u: UsuarioLista): string | null {
  return u.valor_real_mensal != null && u.valor_real_mensal > 0 ? `${formatarMoeda(u.valor_real_mensal)}/mês` : null;
}

function destaqueDe(u: UsuarioLista, motivo: MotivoRisco, agora: string): Destaque {
  if (motivo === 'silencio') {
    // `dias_sem_lancar` já vem do SQL (D2). Nunca recalcular a partir da data
    // aqui: o servidor e o cliente contariam dias diferentes na virada do dia.
    const nunca = u.ultimo_lancamento_em == null;
    const dias = u.dias_sem_lancar;
    return {
      principal: nunca ? 'nunca lançou' : formatarDiasRelativo(dias),
      // Sem mensalidade (cortesia, extensão), o que está em jogo é o rebanho que
      // ele já cadastrou — o custo de sair sobe com o número de animais.
      apoio: mensalidade(u) ?? `${formatarInteiro(u.animais_ativos)} animais`,
      tom: nunca || (dias != null && dias >= 60) ? 'critico' : 'alerta',
    };
  }

  const dias = diasEntre(agora, u.data_vencimento);

  if (motivo === 'cobranca') {
    return {
      // Sem data de vencimento e status vencida é o caso do pagamento que falhou
      // e limpou a data: continua sendo cobrança, e some se cair no traço.
      principal: dias == null ? (u.status_efetivo === 'vencida' ? 'vencida' : VAZIO) : formatarVencimento(dias),
      apoio: mensalidade(u) ?? 'sem valor de assinatura',
      tom: dias == null || dias < 0 ? 'critico' : 'alerta',
    };
  }

  // Trial: o que decide a conversão não é o valor (ainda não existe), é o uso.
  // Um trial com 200 animais e lançamento de ontem é uma venda; um com 0 animais
  // e nenhum lançamento é um cadastro. A mesma lista, dois telefonemas diferentes.
  const uso = u.ultimo_lancamento_em == null ? 'nunca lançou' : formatarDiasRelativo(u.dias_sem_lancar);
  return {
    principal: dias == null ? VAZIO : formatarVencimento(dias),
    apoio: `${formatarInteiro(u.animais_ativos)} animais · ${uso}`,
    tom: dias != null && dias <= 3 ? 'critico' : 'alerta',
  };
}

/** Onde ele está, em uma linha. Campo vazio simplesmente não entra — 'null · SP'
 *  é ruído, e a propriedade ausente já é dita por 'sem propriedade'. */
function contextoDe(u: UsuarioLista): string {
  const partes = [u.propriedade_nome, u.estado, u.plano_nome].filter((p): p is string => !!p);
  return partes.length > 0 ? partes.join(' · ') : 'sem propriedade vinculada';
}

export function ListaRisco({
  motivo,
  titulo,
  descricao,
  usuarios,
  agora,
  verTodosHref,
  total,
  limite = 8,
  vazio,
}: {
  motivo: MotivoRisco;
  titulo: string;
  /** A REGRA da lista, escrita por extenso. Sem ela ninguém sabe por que um nome
   *  está aqui, e uma lista de risco em que não se confia é uma lista morta. */
  descricao: string;
  usuarios: UsuarioLista[];
  /** ISO do instante da página. Ver comentário do topo. */
  agora: string;
  /** A mesma seleção, aberta em /adm/usuarios — a lista curta é a porta, não o teto. */
  verTodosHref: string;
  /** Total real da seleção quando a página o conhece (KPI). Sem ele o contador
   *  fala só do que está na tela, e nunca inventa um total. */
  total?: number;
  limite?: number;
  vazio?: string;
}) {
  const linhas = usuarios.slice(0, limite);
  const quantos = total ?? linhas.length;
  const temMais = quantos > linhas.length;

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base leading-tight">{titulo}</h2>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{descricao}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
          {formatarInteiro(quantos)}
        </span>
      </div>

      {linhas.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          {vazio ?? VAZIO_PADRAO[motivo]}
        </p>
      ) : (
        <ul className="-mx-2 mt-3 divide-y divide-border">
          {linhas.map((u) => {
            const destaque = destaqueDe(u, motivo, agora);
            return (
              <li key={u.id}>
                <Link
                  href={`/adm/u/${u.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{u.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{contextoDe(u)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('text-sm font-medium tabular-nums', TOM_CLASSE[destaque.tom])}>
                      {destaque.principal}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">{destaque.apoio}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href={verTodosHref}
        className="mt-3 self-start text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {temMais ? `Ver as ${formatarInteiro(quantos)} contas` : 'Abrir esta seleção na lista'} →
      </Link>
    </section>
  );
}
