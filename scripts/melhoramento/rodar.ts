/**
 * RODAR E GUARDAR as análises de melhoramento — o único caminho de escrita do
 * módulo. O painel /adm só lê; quem grava é este script, rodado à mão.
 *
 * Uso (na raiz do repositório, com o .env.local ou as variáveis no ambiente):
 *
 *   node --env-file=.env.local --import ./scripts/testes/alias-hook.mjs \
 *        --conditions=react-server --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
 *        scripts/melhoramento/rodar.ts [--especie caprino,ovino,bovino_corte] \
 *        [--propriedade 234] [--incluir-teste] [--execucao nome]
 *
 * Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (a mesma
 * chave do painel; nunca com prefixo NEXT_PUBLIC_). Lê as views
 * adm.melhoramento_* e grava pelas views de escrita de
 * supabase/melhoramento/melhoramento_05_gravacao.sql. Instruções completas em
 * src/lib/melhoramento/README.md.
 */

import { createClient } from '@supabase/supabase-js';
import { executarRodada } from '@/lib/melhoramento/rodada';
import { portaSupabase, type ClienteMinimo } from '@/lib/melhoramento/rodada-supabase';
import { especieValida, type EspecieChave } from '@/lib/melhoramento/tipos';

function argumento(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function principal(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.');
    return 2;
  }
  const especies = (argumento('especie') ?? 'caprino,ovino,bovino_corte')
    .split(',')
    .map((e) => especieValida(e.trim()))
    .filter((e): e is EspecieChave => e != null);
  if (especies.length === 0) {
    console.error('--especie: use caprino, ovino e/ou bovino_corte, separados por vírgula.');
    return 2;
  }
  const prop = argumento('propriedade');
  const propriedadeId = prop != null ? Number(prop) : undefined;
  if (propriedadeId != null && !Number.isInteger(propriedadeId)) {
    console.error('--propriedade: um id inteiro.');
    return 2;
  }
  const execucao = argumento('execucao') ?? `rodar-${new Date().toISOString()}`;
  const cliente = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { schema: 'adm' },
    global: { headers: { 'x-client-info': 'sistemaseabra-web/melhoramento-rodar' } },
  }) as unknown as ClienteMinimo;

  console.log(`execução ${execucao} · ${especies.join(', ')}${propriedadeId != null ? ` · fazenda #${propriedadeId}` : ''}`);
  const r = await executarRodada(portaSupabase(cliente), {
    especies,
    propriedadeId,
    execucao,
    incluirTeste: process.argv.includes('--incluir-teste'),
    log: (m) => console.log('  ' + m),
  });
  console.log(
    `${r.fazendas} fazenda(s), ${r.rodadas} rodada(s), ${r.resultados} resultado(s) por animal, ${r.validacoes} métrica(s) de validação.`,
  );
  for (const e of r.erros) console.error(`  erro em ${e.especie} #${e.propriedadeId}: ${e.erro}`);
  return r.erros.length > 0 ? 1 : 0;
}

principal().then(
  (codigo) => process.exit(codigo),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
