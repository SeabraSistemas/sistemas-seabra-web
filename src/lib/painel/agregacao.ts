/**
 * Agregação numérica genérica pros KPIs dos cards — usada direto nas Views
 * (cada card calcula sua fórmula com `useMemo`, perto do JSX que a mostra,
 * o que facilita auditar contra o número do Looker). Ignora `null` sempre:
 * é a mesma regra de format.ts — um agregado só existe se houver pelo menos
 * um valor real, nunca conta null como 0.
 */

export function media(valores: (number | null)[]): number | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function soma(valores: (number | null)[]): number | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0);
}

export function contar<T>(itens: T[], teste: (item: T) => boolean): number {
  return itens.filter(teste).length;
}

/** numerador/denominador em %, 0-100. null se o denominador for 0 (não faz sentido "0%" nem "—" silencioso vira 0). */
export function percentual(numerador: number, denominador: number): number | null {
  if (denominador === 0) return null;
  return (numerador / denominador) * 100;
}

/**
 * Contagem por categoria — a base de todo Donut/BarrasHorizontais do
 * FI_FCG (partida, diagnóstico, sexo, método...). Duas regras, sempre:
 *
 * 1. Item com `campo(item)` vazio/null é SEMPRE descartado da contagem —
 *    nunca aparece como categoria "" ou "null" no gráfico.
 * 2. Grafias que só diferem em maiúscula/minúscula ou espaço nas pontas
 *    ("Monta Livre" / "Monta livre") viram UMA fatia só, contada junto —
 *    duas fatias pra mesma categoria é estatisticamente errado, não só
 *    feio. O rótulo mostrado é a grafia mais FREQUENTE entre as
 *    variantes (não a primeira encontrada, que seria arbitrária). Só vale
 *    pra AGREGAÇÃO (aqui) — filtro e tabela continuam mostrando a grafia
 *    exata de cada linha, sem normalizar nada (decisão do Felipe,
 *    14/09/2026: ele corrige o dado na planilha, o filtro é o jeito dele
 *    de enxergar a duplicata).
 *
 * Existia como função idêntica duplicada em 3 Views (Toque/Rebanho/
 * Partos) — consolidado aqui pra as duas regras valerem em todo gráfico
 * novo por construção, não por cada View lembrar de repetir a lógica.
 */
export function contagemPor<T>(itens: T[], campo: (item: T) => string | null): { rotulo: string; valor: number }[] {
  // chave = grafia normalizada (minúscula, sem espaço nas pontas) só pra
  // AGRUPAR; o rótulo de exibição guarda a contagem de cada grafia exata
  // dentro do grupo, pra escolher a mais frequente no final.
  const grupos = new Map<string, Map<string, number>>();
  for (const item of itens) {
    const bruto = campo(item);
    const valor = bruto?.trim();
    if (!valor) continue;
    const chave = valor.toLowerCase();
    let variantes = grupos.get(chave);
    if (!variantes) {
      variantes = new Map();
      grupos.set(chave, variantes);
    }
    variantes.set(valor, (variantes.get(valor) ?? 0) + 1);
  }
  return Array.from(grupos.values(), (variantes) => {
    let total = 0;
    let rotulo = '';
    let maiorContagem = -1;
    for (const [grafia, contagem] of variantes) {
      total += contagem;
      if (contagem > maiorContagem) {
        maiorContagem = contagem;
        rotulo = grafia;
      }
    }
    return { rotulo, valor: total };
  });
}
