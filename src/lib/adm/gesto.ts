import 'server-only';

/**
 * Login do /adm por PADRÃO DE GESTO — substitui usuário+senha+TOTP.
 *
 * DECISÃO DO FELIPE, e a troca é REAL, não decorativa: um padrão de 9 pontos
 * (mínimo 4, sem repetir) tem muito menos combinações que senha forte + TOTP,
 * e sofre de "smudge attack" (a marca de dedo na tela denuncia o traço). Para
 * um painel com CPF e dado financeiro de cliente, isso É uma segurança menor
 * — decisão dele, sobre o sistema dele, tomada ciente do trade-off.
 *
 * O QUE NÃO MUDA, e é o que ainda protege o painel:
 * - o gesto vira uma STRING (a sequência de pontos, "1259" p.ex.) e passa
 *   pelo MESMO scrypt que protegia a senha (gerarHash/verificarSenha de
 *   password.ts) — nunca fica em texto puro em lugar nenhum;
 * - rate limit, piso de latência e trilha de auditoria de login.ts continuam
 *   idênticos: o que muda é só QUAL fator é comparado.
 *
 * Grade numerada como teclado numérico (7 8 9 / 4 5 6 / 1 2 3) — é a
 * disposição que a maioria já tem na cabeça de calculadora e telefone.
 */
export const PONTOS_GRADE = [7, 8, 9, 4, 5, 6, 1, 2, 3] as const;

export const MINIMO_PONTOS = 4;

/**
 * Normaliza o que chegou (digitado no script de configuração, ou montado a
 * partir dos cliques na grade): só dígitos 1-9, sem repetir nenhum, pelo
 * menos MINIMO_PONTOS. null = formato inválido — nunca lança.
 */
export function normalizarGesto(bruto: string | null | undefined): string | null {
  const limpo = (bruto ?? '').replace(/[^1-9]/g, '');
  if (limpo.length < MINIMO_PONTOS) return null;

  const vistos = new Set<string>();
  for (const caractere of limpo) {
    if (vistos.has(caractere)) return null; // ponto revisitado não é gesto válido
    vistos.add(caractere);
  }
  return limpo;
}
