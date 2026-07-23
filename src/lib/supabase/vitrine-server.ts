import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase server-side da vitrine. NUNCA importar em client component.
 *
 * - Mesmo par de env de src/app/api/demo-session/route.ts: NEXT_PUBLIC_SUPABASE_URL
 *   (a URL e publica) + SUPABASE_ANON_KEY (SEM prefixo NEXT_PUBLIC, de proposito:
 *   o Next so inlina no bundle do browser variaveis NEXT_PUBLIC_*).
 * - db.schema = 'vitrine': todas as leituras vao para as views vitrine.criadores /
 *   vitrine.animais (security_invoker=on; RLS por consentimento e a rede de seguranca).
 * - Nunca lanca: se faltar env, devolve null e a pagina distingue "vazio" de "quebrado".
 *
 * Nao ha `import 'server-only'` porque o pacote nao esta instalado no repo; a protecao
 * real e a chave nao levar NEXT_PUBLIC_ (import acidental em client => undefined, nao vaza).
 */
let cached: SupabaseClient | null = null;

export function vitrineClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Cast: db.schema='vitrine' faz o client apontar para o schema vitrine em
  // runtime, mas o generic de SchemaName diverge do default 'public' do tipo.
  // As leituras usam .from('criadores'/'animais') (string, sem tipo gerado).
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'vitrine' },
    global: { headers: { 'x-client-info': 'sistemaseabra-web/vitrine' } },
  }) as unknown as SupabaseClient;
  return cached;
}
