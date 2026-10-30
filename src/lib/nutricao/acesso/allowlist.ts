/**
 * Quem entra no /nutricao: só o Felipe (decisão de 30/10/2026 — laboratório
 * pessoal). A senha é a do app, conferida no Supabase Auth; não é guardada aqui.
 */
export const EMAILS_PERMITIDOS = ['felipeseabracl@gmail.com'];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
