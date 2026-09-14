/**
 * Empacota registros como tuplas (nome do campo só uma vez, não por linha)
 * pro payload RSC do server component -> client View. Sem isto, um objeto
 * nomeado por linha manda a CHAVE de cada campo miliares de vezes — a
 * Pesagem do /FI_FCG tem ~33 mil linhas, então a diferença é real (ver
 * orçamento de payload no plano). A View desempacota com `useMemo` uma vez
 * na montagem.
 */

export interface Pacote<T> {
  campos: (keyof T & string)[];
  linhas: unknown[][];
}

export function empacotar<T extends Record<string, unknown>>(itens: T[], campos: (keyof T & string)[]): Pacote<T> {
  return {
    campos,
    linhas: itens.map((item) => campos.map((c) => item[c] ?? null)),
  };
}

export function desempacotar<T extends Record<string, unknown>>(pacote: Pacote<T>): T[] {
  const { campos, linhas } = pacote;
  return linhas.map((linha) => {
    const obj = {} as T;
    campos.forEach((c, i) => {
      obj[c] = linha[i] as T[typeof c];
    });
    return obj;
  });
}
