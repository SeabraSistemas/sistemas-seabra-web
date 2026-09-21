/**
 * Recálculo de GMD de um lote de engorda (21/09/2026) — o motor puro, sem
 * planilha, pra ser testável.
 *
 * POR QUE EXISTE: o AppSheet grava `Dias em engorda`/`GMD` como VALOR
 * (conferido ao vivo: em RebanhoProd só `Categoria` e as `Idade (...)` são
 * fórmula), e nunca reatualiza. Resultado achado na planilha real: os 378
 * animais em engorda estão todos com `Dias em engorda` = 61 congelado desde
 * ~out/2025 — a mesma pesagem de dezembro e a de fevereiro usam 61 dias, o
 * que infla o GMD em ~3x (1,5 onde o real é 0,49). Ao setar a data de
 * início pelo site, recalculamos pesagem a pesagem.
 *
 * REGRAS (decididas pelo Felipe, 21/09/2026):
 * - só mexe nas pesagens com data >= a data de início; as anteriores ficam
 *   intocadas (podem ser de uma engorda antiga, não é nosso assunto);
 * - o peso de entrada é o da PRIMEIRA pesagem >= a data de início;
 * - `dias` de cada pesagem = data da pesagem − data de início (o erro do
 *   AppSheet era usar um número fixo pra todas);
 * - `dias` = 0 (a própria pesagem de entrada) => GMD vazio, não divide por
 *   zero nem finge 0,0.
 */
import { diasEntre } from '@/lib/painel/format';
import type { DiaCompacto } from '@/lib/fi-fcg/types';

export interface PesagemDoAnimal {
  /** Linha na aba Pesagem (1-based, como o Sheets) — é por onde a escrita acha a célula. */
  linha: number;
  data: DiaCompacto;
  pesoKg: number;
}

export interface AnimalParaRecalculo {
  id: string;
  /** Linha na aba RebanhoProd (1-based). */
  linhaRebanho: number;
  pesagens: PesagemDoAnimal[];
}

export interface PesagemRecalculada {
  linha: number;
  data: DiaCompacto;
  pesoKg: number;
  pesoEntradaKg: number;
  diasEngorda: number;
  /** null quando `diasEngorda` é 0 (a pesagem de entrada). */
  gmd: number | null;
}

export interface AnimalRecalculado {
  id: string;
  linhaRebanho: number;
  entrada: DiaCompacto;
  pesoEntradaKg: number;
  /** Data da pesagem que deu o peso de entrada — pode ser depois da data escolhida, se não houve pesagem no dia. */
  dataPesoEntrada: DiaCompacto;
  /** Dias/GMD "de hoje" do animal em RebanhoProd = os da pesagem mais recente dele. */
  diasEngordaAtual: number;
  gmdAtual: number | null;
  pesoAtualKg: number;
  pesagens: PesagemRecalculada[];
}

export interface RecalculoLote {
  animais: AnimalRecalculado[];
  /** IDs sem nenhuma pesagem a partir da data escolhida — ficam de fora (não inventamos peso de entrada). */
  semPesagemNoPeriodo: string[];
  /** Quantas linhas da aba Pesagem vão ser reescritas ao todo. */
  totalPesagens: number;
}

/**
 * @param dataInicio a data de início do GMD escolhida pelo usuário (vira `Entrada engorda`).
 */
export function recalcularGmdDoLote(animais: AnimalParaRecalculo[], dataInicio: DiaCompacto): RecalculoLote {
  const recalculados: AnimalRecalculado[] = [];
  const semPesagemNoPeriodo: string[] = [];

  for (const animal of animais) {
    const aPartirDaData = animal.pesagens
      .filter((p) => p.data >= dataInicio)
      .sort((a, b) => a.data - b.data);

    if (aPartirDaData.length === 0) {
      semPesagemNoPeriodo.push(animal.id);
      continue;
    }

    const entrada = aPartirDaData[0];
    const pesoEntradaKg = entrada.pesoKg;

    const pesagens: PesagemRecalculada[] = aPartirDaData.map((p) => {
      const dias = diasEntre(dataInicio, p.data) ?? 0;
      return {
        linha: p.linha,
        data: p.data,
        pesoKg: p.pesoKg,
        pesoEntradaKg,
        diasEngorda: dias,
        gmd: dias > 0 ? (p.pesoKg - pesoEntradaKg) / dias : null,
      };
    });

    const ultima = pesagens[pesagens.length - 1];
    recalculados.push({
      id: animal.id,
      linhaRebanho: animal.linhaRebanho,
      entrada: dataInicio,
      pesoEntradaKg,
      dataPesoEntrada: entrada.data,
      diasEngordaAtual: ultima.diasEngorda,
      gmdAtual: ultima.gmd,
      pesoAtualKg: ultima.pesoKg,
      pesagens,
    });
  }

  return {
    animais: recalculados,
    semPesagemNoPeriodo,
    totalPesagens: recalculados.reduce((s, a) => s + a.pesagens.length, 0),
  };
}
