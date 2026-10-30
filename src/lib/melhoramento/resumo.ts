/**
 * RESUMO ENTRE FAZENDAS da validação — a pergunta "qual modelo funciona
 * melhor nos rebanhos da Sistema Seabra", que nenhuma fazenda sozinha responde.
 *
 * Mesma regra do benchmark (src/lib/adm/areas/benchmark.ts): abaixo de um
 * mínimo de fazendas o resumo NÃO é publicado. Com três fazendas, "a mediana
 * da correlação" é o resultado de uma delas vestido de estatística; e, numa
 * tela que lista as fazendas, um agregado de poucas deixa deduzir cada uma.
 * Só a mediana e a contagem saem daqui — nenhum id, nenhum nome.
 *
 * Fazenda de teste (tester, demo, "teste" no nome) não entra.
 */

import type { AnaliseFazenda } from '@/lib/melhoramento/analise';
import type { CaracteristicaChave } from '@/lib/melhoramento/tipos';

export interface ResumoModeloEntreFazendas {
  modelo: string;
  fazendas: number;
  medianaCorrelacao: number | null;
  medianaRegressao: number | null;
  /** Em quantas fazendas este modelo teve a maior correlação (estimativa pontual). */
  maiorCorrelacaoEm: number;
}

export interface ResumoEntreFazendas {
  caracteristica: CaracteristicaChave;
  fazendasComValidacao: number;
  minimo: number;
  publicavel: boolean;
  porModelo: ResumoModeloEntreFazendas[];
}

function mediana(v: number[]): number | null {
  if (v.length === 0) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function resumirEntreFazendas(
  analises: readonly { teste: boolean; analise: AnaliseFazenda }[],
  caracteristica: CaracteristicaChave,
  minimo: number,
): ResumoEntreFazendas {
  const validacoes = analises
    .filter((a) => !a.teste)
    .map((a) => a.analise.caracteristicas.find((c) => c.caracteristica === caracteristica)?.validacao)
    .filter((v): v is NonNullable<typeof v> => v != null && v.rodou);
  const publicavel = validacoes.length >= minimo;
  const saida: ResumoEntreFazendas = {
    caracteristica,
    fazendasComValidacao: validacoes.length,
    minimo,
    publicavel,
    porModelo: [],
  };
  if (!publicavel) return saida;

  const modelos = [...new Set(validacoes.flatMap((v) => v.porModelo.map((m) => m.modelo)))];
  const maior = new Map<string, number>();
  for (const v of validacoes) {
    const comR = v.porModelo.filter((m) => m.metricas.correlacao != null);
    if (comR.length === 0) continue;
    const topo = Math.max(...comR.map((m) => m.metricas.correlacao!));
    for (const m of comR) if (m.metricas.correlacao === topo) maior.set(m.modelo, (maior.get(m.modelo) ?? 0) + 1);
  }
  saida.porModelo = modelos.map((modelo) => {
    const ms = validacoes.map((v) => v.porModelo.find((m) => m.modelo === modelo)?.metricas).filter((m) => m != null);
    return {
      modelo,
      fazendas: ms.length,
      medianaCorrelacao: mediana(ms.map((m) => m.correlacao).filter((x): x is number => x != null)),
      medianaRegressao: mediana(ms.map((m) => m.regressao).filter((x): x is number => x != null)),
      maiorCorrelacaoEm: maior.get(modelo) ?? 0,
    };
  });
  return saida;
}
