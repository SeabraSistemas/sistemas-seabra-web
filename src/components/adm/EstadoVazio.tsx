/**
 * Os três vazios do /adm — que NÃO são a mesma coisa e nunca podem parecer a
 * mesma coisa na tela:
 *
 *   vazio       Não há dado, e está tudo certo. "Este criador nunca lançou
 *               pesagem" é informação de negócio — inclusive de venda.
 *   sem-config  Falta env ou falta rodar o SQL. Não é problema do cliente, é da
 *               máquina; e a tela diz QUAL arquivo rodar, porque descobrir isso
 *               por tentativa custa meia hora.
 *   erro        A consulta quebrou. Mostra o detalhe (com o código do PostgREST),
 *               porque um "algo deu errado" genérico não deixa ninguém agir.
 *
 * Um "sem-config" desenhado como "vazio" é a pior falha possível deste painel: o
 * Felipe olharia uma carteira zerada por falta de variável de ambiente e
 * concluiria que perdeu os clientes. Por isso o componente recebe o
 * `Resultado<T>` inteiro e decide sozinho — quem chama não tem como esquecer o
 * caso do meio.
 *
 * Server Component: só desenha o que a query devolveu.
 */

import { CircleAlert, Inbox, Wrench } from 'lucide-react';
import type { Resultado } from '@/lib/adm/types';
import { cn } from '@/lib/utils';

/** Os arquivos existem no repo, nesta ordem de execução. Citar o caminho exato é
 *  a diferença entre "está quebrado" e "rode este arquivo". */
const SQL_ADM = [
  'supabase/adm/adm_01_schema_e_views.sql',
  'supabase/adm/adm_02_atividade.sql',
  'supabase/adm/adm_03_auditoria.sql',
  'supabase/adm/adm_04_indices.sql',
];

/**
 * O que fazer, deduzido do detalhe que a query mandou. `semConfigSupabase()`
 * escreve "Falta configurar no ambiente: ..."; `falha()` escreve "A view ... não
 * está acessível (PGRST106)". São causas diferentes e receitas diferentes.
 */
function receita(detalhe: string): string[] {
  if (/ambiente/i.test(detalhe)) {
    return [
      'Preencha as variáveis no .env.local e reinicie o servidor.',
      'SUPABASE_SERVICE_ROLE_KEY vai SEM o prefixo NEXT_PUBLIC_ — com ele, a chave que ignora toda a RLS iria para o bundle do browser.',
    ];
  }
  return [
    `Rode no Supabase, nesta ordem: ${SQL_ADM.join(' · ')}`,
    'Depois exponha o schema "adm" em Settings → API → Exposed schemas — sem isso o PostgREST devolve PGRST106 mesmo com as views criadas.',
  ];
}

function Moldura({
  icone,
  titulo,
  children,
  tom = 'neutro',
  className,
}: {
  icone: React.ReactNode;
  titulo: string;
  children?: React.ReactNode;
  tom?: 'neutro' | 'atencao' | 'erro';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center',
        tom === 'atencao' && 'border-primary/40',
        tom === 'erro' && 'border-destructive/40',
        className,
      )}
    >
      <span
        className={cn(
          'text-muted-foreground',
          tom === 'atencao' && 'text-primary',
          tom === 'erro' && 'text-destructive',
        )}
      >
        {icone}
      </span>
      <h3 className="text-base font-medium text-foreground">{titulo}</h3>
      {children}
    </div>
  );
}

export function EstadoVazio<T>({
  resultado,
  titulo,
  texto,
  acao,
  className,
}: {
  /**
   * O resultado da query. Ausente (ou `ok`) cai no estado 'vazio' — é o que
   * permite usar o mesmo componente dentro de uma tabela que carregou bem mas
   * não achou nenhuma linha com os filtros atuais.
   */
  resultado?: Resultado<T> | null;
  /** Título do estado 'vazio'. Ignorado quando há falha: aí o texto é o do erro. */
  titulo?: string;
  /** `titulo` + `texto` são os mesmos nomes de src/components/criadores/EstadoVazio.tsx —
   *  o repo já tem um estado vazio e ele não vai ganhar um segundo dialeto. */
  texto?: React.ReactNode;
  /** Um link de saída ("limpar filtros", "ver todos os clientes"). */
  acao?: React.ReactNode;
  className?: string;
}) {
  if (resultado && !resultado.ok && resultado.motivo === 'sem-config') {
    return (
      <Moldura icone={<Wrench className="size-6" />} titulo="Falta configurar o acesso" tom="atencao" className={className}>
        <p className="max-w-prose text-sm text-muted-foreground">{resultado.detalhe}</p>
        <ul className="mt-2 flex max-w-prose list-disc flex-col gap-1 pl-5 text-left text-sm text-muted-foreground">
          {receita(resultado.detalhe).map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-muted-foreground">
          Nenhum dado foi perdido — a tela só não tem por onde ler.
        </p>
        {acao}
      </Moldura>
    );
  }

  if (resultado && !resultado.ok) {
    return (
      <Moldura icone={<CircleAlert className="size-6" />} titulo="Não foi possível carregar" tom="erro" className={className}>
        <p className="max-w-prose text-sm text-muted-foreground">
          A consulta falhou. O detalhe abaixo traz o código do PostgREST, que é o que identifica a causa.
        </p>
        <code className="mt-1 max-w-full overflow-x-auto rounded border border-border bg-secondary px-2 py-1 text-left text-xs text-foreground">
          {resultado.detalhe}
        </code>
        {acao}
      </Moldura>
    );
  }

  return (
    <Moldura icone={<Inbox className="size-6" />} titulo={titulo ?? 'Nada por aqui'} className={className}>
      {texto && <p className="max-w-prose text-sm text-muted-foreground">{texto}</p>}
      {acao}
    </Moldura>
  );
}
