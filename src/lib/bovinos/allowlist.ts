/**
 * Quem entra no /bovinos. Ferramenta interna do Sistema Seabra (lê e, na
 * fase 2, corrige as planilhas de três clientes) — por decisão do Felipe
 * (26/09/2026), só o e-mail dele por enquanto. Outro e-mail entra aqui.
 */
export const EMAILS_PERMITIDOS = ['felipeseabracl@gmail.com'];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
