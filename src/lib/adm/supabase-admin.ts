import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { semConfig, type Resultado } from '@/lib/adm/types';

/**
 * Transporte de dados do /adm. Três clientes irmãos, um por schema, todos com a
 * MESMA credencial: a `service_role`.
 *
 * POR QUE A CHAVE NÃO LEVA `NEXT_PUBLIC_`
 * O Next só inlina no bundle do browser as variáveis que começam com
 * `NEXT_PUBLIC_`. Uma `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` viraria texto
 * literal dentro de um .js servido publicamente — ou seja, a chave que ignora
 * toda a RLS ficaria no DevTools de qualquer visitante. Por isso a env é
 * `SUPABASE_SERVICE_ROLE_KEY`, sem prefixo, exatamente como
 * src/lib/supabase/vitrine-server.ts já faz com a anon key de propósito.
 * A segunda trava é o `import 'server-only'` no topo: se alguém importar este
 * módulo num Client Component, o build QUEBRA — não vaza silenciosamente.
 *
 * POR QUE TRÊS CLIENTES E NÃO UM
 * O client do supabase-js fixa o schema na criação (`db.schema`), e cada schema
 * aqui tem um papel diferente:
 *
 *   adm        views de leitura, o TETO do que o painel enxerga. `colaborador_senha`
 *              e `cpf` não existem lá dentro — é impossível projetá-los por engano.
 *   public     tabelas de domínio cruas, só para o escape hatch (/adm/u/[id]/tabelas/[tabela])
 *              e para as RPCs SECURITY DEFINER que alcançam o schema `auditoria`.
 *   auditoria  a ÚNICA escrita permitida no /adm (decisão D3: o painel é somente
 *              leitura). Fallback de audit.ts/rate-limit.ts quando as RPCs não existem.
 *
 * NUNCA LANÇA: sem env, devolve null. Isso é o que permite rodar `npm run dev`
 * numa máquina sem a service_role — a página mostra "falta configurar" em vez de
 * um 500 sem explicação.
 */

type SchemaAdm = 'adm' | 'public' | 'auditoria';

/**
 * Memoização por schema. O client do supabase-js é só um wrapper de fetch sem
 * conexão persistente, mas recriá-lo a cada request desperdiça alocação em
 * lambda fria — e o /katmandu/vitrine já estabeleceram esse padrão no repo.
 */
const clientes = new Map<SchemaAdm, SupabaseClient>();

function criarCliente(schema: SchemaAdm): SupabaseClient | null {
  const memo = clientes.get(schema);
  if (memo) return memo;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;

  // Cast: `db.schema` aponta o PostgREST para o schema em runtime (header
  // Accept-Profile/Content-Profile), mas o generic SchemaName do tipo continua
  // preso ao default 'public'. Mesmo cast de vitrine-server.ts.
  const cliente = createClient(url, chave, {
    // Sessão de usuário não existe aqui: a service_role é uma chave de máquina.
    // Deixar o auth ligado só criaria refresh timers e escrita em storage à toa.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { schema },
    global: { headers: { 'x-client-info': `sistemaseabra-web/adm-${schema}` } },
  }) as unknown as SupabaseClient;

  clientes.set(schema, cliente);
  return cliente;
}

/** Leitura do painel. Só views do schema `adm` — o teto de colunas. */
export function admClient(): SupabaseClient | null {
  return criarCliente('adm');
}

/**
 * Tabelas de domínio no schema `public`. Usar SOMENTE onde a view do `adm` não
 * cobre (escape hatch) e sempre com `.select()` de colunas explícitas: um
 * `select('*')` em `usuarios` traria 6 senhas em texto plano e 14 CPFs para
 * dentro da memória do Next, dos logs da Vercel e possivelmente do payload RSC.
 * Também é o cliente das RPCs (`.rpc()` só enxerga funções do schema do client).
 */
export function publicClient(): SupabaseClient | null {
  return criarCliente('public');
}

/**
 * Trilha de auditoria e tentativas de login. A única escrita do /adm.
 *
 * ATENÇÃO: o schema `auditoria` foi propositalmente deixado FORA do db-schemas
 * do PostgREST (é o que o torna inalcançável pela API REST, inclusive com a
 * service_role). Enquanto ele continuar fora, este cliente devolve PGRST106 e o
 * caminho real é a RPC SECURITY DEFINER em `public` — audit.ts e rate-limit.ts
 * tentam a RPC primeiro e só caem aqui se o schema tiver sido exposto.
 */
export function auditoriaClient(): SupabaseClient | null {
  return criarCliente('auditoria');
}

/** Quais envs do transporte estão faltando. Vazio = configurado. */
export function envFaltando(): string[] {
  const faltando: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) faltando.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) faltando.push('SUPABASE_SERVICE_ROLE_KEY');
  return faltando;
}

export function admConfigurado(): boolean {
  return envFaltando().length === 0;
}

/**
 * Atalho para o `Resultado` de degradação. Toda query do /adm começa com
 * `const supa = admClient(); if (!supa) return semConfigSupabase();` — o
 * componente distingue "sem configuração" de "vazio" e de "quebrado".
 */
export function semConfigSupabase<T>(): Resultado<T> {
  return semConfig<T>(`Falta configurar no ambiente: ${envFaltando().join(', ')}`);
}
