/**
 * Cache em memória, por instância do servidor, para leituras de planilha.
 * Puro (sem `server-only`) — a lógica é genérica e testável fora do runtime
 * do Next; quem guarda a chave privada é sheets/server.ts, não isto aqui.
 *
 * Não usa `unstable_cache`/`'use cache'` do Next: o data cache da Vercel tem
 * limite de 2 MB por item (a Pesagem do FI_FCG passa disso) e `'use cache'`
 * exigiria ligar `cacheComponents` pro site inteiro, mudando o Katmandu junto.
 */

interface Entrada<T> {
  valor: T;
  expiraEm: number;
  /** Quando este valor foi efetivamente carregado — pro "Atualizado às HH:MM" da página, não confundir com `expiraEm`. */
  carregadoEm: number;
}

export interface Cache<T> {
  /**
   * Devolve o valor em cache se ainda válido; senão chama `carregar()`. Duas
   * chamadas concorrentes pra mesma chave compartilham a MESMA promise (não
   * disparam duas leituras). Se `carregar()` falhar e houver um valor antigo,
   * devolve o valor antigo com `stale: true` em vez de propagar o erro — só
   * lança se nunca houve valor nenhum.
   */
  obter(chave: string, carregar: () => Promise<T>): Promise<{ valor: T; stale: boolean; carregadoEm: number }>;
  /** Remove todas as chaves que começam com `prefixo` (ou tudo, se omitido). */
  invalidar(prefixo?: string): void;
}

export function criarCache<T>(ttlMs: number): Cache<T> {
  const entradas = new Map<string, Entrada<T>>();
  const emVoo = new Map<string, Promise<T>>();

  async function obter(chave: string, carregar: () => Promise<T>) {
    const agora = Date.now();
    const existente = entradas.get(chave);
    if (existente && existente.expiraEm > agora) {
      return { valor: existente.valor, stale: false, carregadoEm: existente.carregadoEm };
    }

    let promise = emVoo.get(chave);
    if (!promise) {
      promise = carregar();
      emVoo.set(chave, promise);
      // .finally() devolve uma promise DERIVADA que também rejeita se `promise`
      // rejeitar — já que ninguém mais espera essa derivada, sem o .catch()
      // aqui o Node reporta unhandledRejection mesmo com o erro original
      // tratado abaixo (no `catch` do await principal).
      promise.finally(() => emVoo.delete(chave)).catch(() => {});
    }

    try {
      const valor = await promise;
      const carregadoEm = Date.now();
      entradas.set(chave, { valor, expiraEm: carregadoEm + ttlMs, carregadoEm });
      return { valor, stale: false, carregadoEm };
    } catch (err) {
      if (existente) {
        console.error('[sheets/cache] releitura falhou, usando valor anterior', chave, err);
        return { valor: existente.valor, stale: true, carregadoEm: existente.carregadoEm };
      }
      throw err;
    }
  }

  function invalidar(prefixo?: string) {
    if (prefixo == null) {
      entradas.clear();
      return;
    }
    for (const chave of entradas.keys()) {
      if (chave.startsWith(prefixo)) entradas.delete(chave);
    }
  }

  return { obter, invalidar };
}
