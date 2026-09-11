/**
 * Quem entra no /cursoidiomas. Lista estática por decisão do Felipe: é um
 * curso interno para duas pessoas — o e-mail é o gate, sem senha (mesmo
 * modelo do /katmandu, ver src/lib/katmandu/allowlist.ts).
 *
 * Adicionar/remover alguém é só editar este array. Comparação é
 * case-insensitive e ignora espaços nas pontas (ver emailPermitido).
 */
export const EMAILS_PERMITIDOS = [
  'felipeseabracl@gmail.com',
];

export function emailPermitido(email: string): boolean {
  const alvo = email.trim().toLowerCase();
  if (!alvo) return false;
  return EMAILS_PERMITIDOS.some((e) => e.toLowerCase() === alvo);
}
