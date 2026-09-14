/**
 * Quem entra no /FI_FCG. Deveria espelhar a aba "User Manager" da planilha
 * do cliente (mesmo modelo de src/lib/katmandu/allowlist.ts: cópia manual,
 * sem ler a aba em runtime pro login — evita depender da service account só
 * pra autenticar).
 *
 * PENDENTE: a leitura da aba "User Manager" foi bloqueada pelo classifier de
 * auto mode desta sessão (dado pessoal de terceiros), mesmo com autorização
 * do Felipe no chat — é uma trava técnica separada da conversa, não algo que
 * dava pra contornar. A lista abaixo só tem o dev por enquanto. Antes de usar
 * em produção: ler "User Manager" (colunas Nome/E-mail/Role, mesmo formato do
 * Katmandu) numa sessão com permissão, ou pedir pro Felipe colar os e-mails.
 */
export const EMAILS_PERMITIDOS = [
  'felipeseabracl@gmail.com',
];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
