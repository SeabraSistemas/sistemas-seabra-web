/**
 * Resolve o alias `@/` do tsconfig para o runner nativo de testes do Node.
 *
 * POR QUE ISTO EXISTE: o Node 26 executa TypeScript direto (apaga os tipos e
 * roda), o que dispensa um runner externo — mas ele não lê `paths` do
 * tsconfig. Sem esta ponte, `import '@/lib/adm/types'` só resolve dentro do
 * bundler do Next, e os módulos puros do painel ficariam sem teste justamente
 * por causa da forma de escrever o import.
 *
 * Vinte linhas em vez de uma dependência de runner — a mesma decisão que o
 * repo já tomou ao escrever o próprio TOTP e o próprio gerador de .xlsx.
 *
 * `registerHooks` e não `register`: o segundo está deprecado no Node 26, e o
 * primeiro roda na mesma thread, sem o custo do worker de hooks.
 */
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';

const RAIZ = new URL('../../', import.meta.url);

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (!especificador.startsWith('@/')) return proximo(especificador, contexto);

    const base = new URL(`src/${especificador.slice(2)}`, RAIZ);
    // A ordem importa: `x.ts` antes de `x/index.ts`, como o TypeScript resolve.
    for (const extensao of ['.ts', '.tsx', '/index.ts', '.js']) {
      const alvo = new URL(base.href + extensao);
      if (existsSync(alvo)) return proximo(alvo.href, contexto);
    }
    // Sem candidato, deixa o Node falhar com a mensagem dele — melhor que uma
    // minha inventada.
    return proximo(base.href, contexto);
  },
});
