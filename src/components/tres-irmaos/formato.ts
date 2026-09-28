/** Formatação pt-BR do /3irmaos. */

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const umaCasa = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "1.436 L" */
export function litros(n: number): string {
  return `${inteiro.format(Math.round(n))} L`;
}

/** Contagem de animais: inteira quando é inteira, uma casa quando vem de taxa de prenhez. */
export function animais(n: number): string {
  return umaCasa.format(Math.round(n * 10) / 10);
}

/** "2,77" */
export function media(n: number): string {
  return duasCasas.format(n);
}

export const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
