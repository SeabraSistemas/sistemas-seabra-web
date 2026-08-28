import { parseDateBR } from './format';
import type { PesagemRegistro } from './types';

/**
 * Coorte de lote: quais pesagens anteriores ainda descrevem O MESMO grupo de
 * animais que a data de referência escolhida.
 *
 * O nome do lote é a localização (Baia 03, Pasto 07...), não o grupo — quando
 * os animais são remanejados, o mesmo nome passa a designar outro conjunto de
 * bichos. Comparar a "evolução do Pasto 04" através de um remanejo compararia
 * animais diferentes e produziria uma curva sem sentido.
 *
 * Regra: âncora fixa na data selecionada (decisão do Felipe — o usuário escolhe
 * exatamente uma data de referência). Cada pesagem anterior é comparada contra
 * a âncora, não contra a sua vizinha: assim a troca gradual (3 animais por
 * pesagem, que nunca dispara um alarme isolado) também é detectada, porque a
 * diferença acumula em relação ao grupo atual.
 */
export const LIMIAR_COORTE = 0.8;

export interface PesagemDoLote {
  /** Data como veio da planilha, "dd/mm/aaaa". */
  data: string;
  /** Timestamp pra ordenação. */
  ts: number;
  /** Todos os registros daquela data no lote. */
  registros: PesagemRegistro[];
  /** IDs dos animais pesados naquela data. */
  animais: Set<string>;
  /** Fração dos animais da âncora presentes nesta pesagem (0–1). */
  sobreposicao: number;
}

export interface Coorte {
  /** Pesagens que formam a coorte, da mais antiga pra mais recente (inclui a âncora). */
  pesagens: PesagemDoLote[];
  /** Animais da data de referência — o grupo que está sendo acompanhado. */
  ancora: Set<string>;
  /** Primeira pesagem (indo pra trás) que falhou o limiar, se houve corte. */
  corte: { data: string; sobreposicao: number } | null;
}

/** Agrupa as pesagens de um lote por data, da mais antiga pra mais recente. */
export function pesagensDoLote(registros: PesagemRegistro[], lote: string): PesagemDoLote[] {
  const porData = new Map<string, PesagemRegistro[]>();
  for (const r of registros) {
    if (r.lote !== lote || !r.dataPesagem) continue;
    const lista = porData.get(r.dataPesagem);
    if (lista) lista.push(r);
    else porData.set(r.dataPesagem, [r]);
  }

  return Array.from(porData, ([data, regs]) => ({
    data,
    ts: parseDateBR(data) ?? 0,
    registros: regs,
    animais: new Set(regs.map((r) => r.idAnimal)),
    sobreposicao: 1,
  })).sort((a, b) => a.ts - b.ts);
}

/**
 * Monta a coorte a partir da data de referência, caminhando pra trás enquanto
 * a sobreposição com a âncora se mantiver >= LIMIAR_COORTE. Para na primeira
 * que falha e NÃO volta mais atrás (uma pesagem ainda mais antiga poderia
 * coincidir por acaso, mas o grupo já mudou no meio do caminho).
 */
export function montarCoorte(pesagens: PesagemDoLote[], dataReferencia: string): Coorte | null {
  const idxAncora = pesagens.findIndex((p) => p.data === dataReferencia);
  if (idxAncora < 0) return null;

  const ancora = pesagens[idxAncora].animais;
  if (ancora.size === 0) return null;

  const incluidas: PesagemDoLote[] = [{ ...pesagens[idxAncora], sobreposicao: 1 }];
  let corte: Coorte['corte'] = null;

  for (let i = idxAncora - 1; i >= 0; i--) {
    const p = pesagens[i];
    let comuns = 0;
    for (const id of ancora) if (p.animais.has(id)) comuns++;
    const sobreposicao = comuns / ancora.size;

    if (sobreposicao < LIMIAR_COORTE) {
      corte = { data: p.data, sobreposicao };
      break;
    }
    incluidas.unshift({ ...p, sobreposicao });
  }

  return { pesagens: incluidas, ancora, corte };
}

export type Metrica = 'peso' | 'gmd' | 'pdi' | 'gpdi';

export const METRICA_LABEL: Record<Metrica, string> = {
  peso: 'Peso médio (kg)',
  gmd: 'GMD',
  pdi: 'PDI',
  gpdi: 'GPDi',
};

/** Versão curta pros cards, onde "Média · Peso médio (kg)" não cabe e trunca. */
export const METRICA_LABEL_CURTO: Record<Metrica, string> = {
  peso: 'Peso médio',
  gmd: 'GMD',
  pdi: 'PDI',
  gpdi: 'GPDi',
};

function valorDe(r: PesagemRegistro, metrica: Metrica): number | null {
  switch (metrica) {
    case 'peso':
      return r.pesoKg;
    case 'gmd':
      return r.gmd;
    case 'pdi':
      return r.pdi;
    case 'gpdi':
      return r.gpdi;
  }
}

export interface PontoEvolucao {
  /** Rótulo do eixo X: "DD/MM". */
  rotulo: string;
  data: string;
  valor: number | null;
  /** Quantos animais da âncora entraram nesta média. */
  animais: number;
}

/**
 * Série do gráfico: média da métrica por data, calculada SÓ sobre os animais
 * da âncora. Um animal que entrou no lote depois não deve puxar a média de uma
 * pesagem antiga — a pergunta é "como este grupo evoluiu", não "como o piquete
 * evoluiu".
 */
export function serieEvolucao(coorte: Coorte, metrica: Metrica): PontoEvolucao[] {
  return coorte.pesagens.map((p) => {
    const valores = p.registros
      .filter((r) => coorte.ancora.has(r.idAnimal))
      .map((r) => valorDe(r, metrica))
      .filter((v): v is number => v != null);

    return {
      rotulo: p.data.slice(0, 5), // "dd/mm" de "dd/mm/aaaa"
      data: p.data,
      valor: valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length,
      animais: valores.length,
    };
  });
}

/** Média de uma métrica nos registros da data de referência (para os cards). */
export function mediaNaAncora(coorte: Coorte, metrica: Metrica): number | null {
  const ultima = coorte.pesagens[coorte.pesagens.length - 1];
  if (!ultima) return null;
  const valores = ultima.registros
    .map((r) => valorDe(r, metrica))
    .filter((v): v is number => v != null);
  return valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;
}
