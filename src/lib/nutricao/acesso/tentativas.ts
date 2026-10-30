/**
 * Freio de tentativas do login do /nutricao. Em memória, por instância: sem
 * service_role e sem tabela (o laboratório não grava nada no Supabase). É
 * melhor-esforço — na Vercel uma lambda nova zera a contagem —, e atrás dele
 * ficam a allowlist de um e-mail só, o Supabase Auth (que tem limite próprio)
 * e o piso de latência.
 */
const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS = 5;
const BLOQUEIO_MS = 5 * 60 * 1000;

const falhas = new Map<string, number[]>();

export function bloqueioRestanteSegundos(chave: string, agora = Date.now()): number {
  const recentes = (falhas.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);
  falhas.set(chave, recentes);
  if (recentes.length < MAX_FALHAS) return 0;
  const libera = recentes[recentes.length - 1] + BLOQUEIO_MS;
  return libera > agora ? Math.ceil((libera - agora) / 1000) : 0;
}

export function registrarFalha(chave: string, agora = Date.now()): void {
  const recentes = (falhas.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  falhas.set(chave, recentes);
}

export function limparFalhas(chave: string): void {
  falhas.delete(chave);
}

/** Espera o que falta para completar `pisoMs` desde `inicio`: iguala o tempo de resposta de acerto e erro. */
export async function aplicarPisoDeLatencia(inicio: number, pisoMs = 800): Promise<void> {
  const falta = pisoMs - (Date.now() - inicio);
  if (falta > 0) await new Promise((r) => setTimeout(r, falta));
}

/** Mesma origem (CSRF do POST do formulário). Atrás do proxy da Vercel o host real vem em x-forwarded-host. */
export function mesmaOrigem(request: Request, url: URL): boolean {
  const origem = request.headers.get('origin');
  if (!origem || origem === 'null') return true;
  try {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}

export function ipDaRequisicao(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconhecido';
}
