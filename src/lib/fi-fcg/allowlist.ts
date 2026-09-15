/**
 * Quem entra no /FI_FCG. Espelha a aba "User Manager" da planilha do
 * cliente (mesmo modelo de src/lib/katmandu/allowlist.ts: cópia manual, sem
 * ler a aba em runtime pro login — evita depender da service account só
 * pra autenticar). A leitura em si da aba foi bloqueada pelo classifier de
 * auto mode desta sessão (dado pessoal de terceiros); o Felipe colou os
 * e-mails direto no chat em 14/09/2026.
 */
export const EMAILS_PERMITIDOS = [
  'sergio.benoni.junior@gmail.com',
  'benonisandri@gmail.com',
  'felipeseabracl@gmail.com',
  'fzdinhumas@gmail.com',
];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
