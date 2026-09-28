/**
 * Quem entra no /3irmaos: o dono da fazenda e o Felipe (decisão de 28/09/2026).
 * A senha é a do app — conferida no Supabase Auth, não guardada aqui.
 * Outro e-mail entra nesta lista.
 */
export const EMAILS_PERMITIDOS = ['felipeseabracl@gmail.com', 'lucasfuurtado27@gmail.com'];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
