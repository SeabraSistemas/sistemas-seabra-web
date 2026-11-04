/**
 * CADASTRO ÚNICO DE REPRODUTORES — o uso dos vínculos de
 * melhoramento.reprodutor_vinculo (supabase/melhoramento/melhoramento_03_vinculos.sql).
 *
 * Quem GERA os candidatos é o SQL (melhoramento.gerar_vinculos()), com as
 * regras escritas lá: identificação igual (registro, número, nome), reforço
 * por pais e nascimento, e contradição de nascimento ou de pais descarta.
 * Aqui ficam as duas contas do lado do módulo:
 *
 *   aplicarVinculos      junta, num animal só, os pares ACEITOS (union-find,
 *                        o representante é o menor id) e reescreve pai e mãe
 *                        de todo mundo para o representante. O módulo chama
 *                        só com os CONFIRMADOS: nada é ligado sem confirmação
 *                        humana. Sem nenhum confirmado, devolve os animais
 *                        como vieram — o comportamento de antes.
 *   conexaoComVinculos   quanto de conexão genética entre fazendas existe com
 *                        os confirmados e quanto existiria se TODOS os
 *                        candidatos não rejeitados fossem confirmados: os
 *                        reprodutores conectores, as fazendas ligadas e os
 *                        grupos de fazendas que passam a ter régua comum.
 *
 * Só a página interna /adm/melhoramento usa isto: é a única que junta fazendas.
 */

import { reprodutoresConectores, type ReprodutorConector } from '@/lib/melhoramento/conexao';
import type { AnimalEntrada } from '@/lib/melhoramento/tipos';

export type Confirmacao = 'nao_confirmado' | 'confirmado' | 'rejeitado';

export interface VinculoEntrada {
  id: number;
  especie: string;
  animalA: number;
  propriedadeA: number;
  animalB: number;
  propriedadeB: number;
  /** registro, numero, nome, pai, mae, nascimento */
  motivos: string[];
  confirmacao: Confirmacao;
  confirmadoPor: string | null;
  confirmadoEm: string | null;
  observacao: string | null;
}

export const ROTULO_MOTIVO_VINCULO: Record<string, string> = {
  registro: 'registro igual',
  numero: 'número igual',
  nome: 'nome igual',
  pai: 'pai igual',
  mae: 'mãe igual',
  nascimento: 'nascimento compatível',
};

class Conjuntos {
  private readonly pai = new Map<number, number>();
  achar(x: number): number {
    let r = x;
    while (this.pai.has(r) && this.pai.get(r) !== r) r = this.pai.get(r)!;
    // compressão de caminho
    let y = x;
    while (this.pai.has(y) && this.pai.get(y) !== r) {
      const prox = this.pai.get(y)!;
      this.pai.set(y, r);
      y = prox;
    }
    return r;
  }
  unir(a: number, b: number): void {
    const ra = this.achar(a);
    const rb = this.achar(b);
    if (ra === rb) return;
    const [menor, maior] = ra < rb ? [ra, rb] : [rb, ra];
    this.pai.set(maior, menor);
    if (!this.pai.has(menor)) this.pai.set(menor, menor);
  }
}

export interface Unificacao {
  animais: AnimalEntrada[];
  /** animal → representante, só de quem foi ligado a outro. */
  representante: Map<number, number>;
  aplicados: number;
}

/** Junta os pares aceitos por `aceitar` (o módulo passa só os confirmados). */
export function aplicarVinculos(
  animais: readonly AnimalEntrada[],
  vinculos: readonly VinculoEntrada[],
  aceitar: (v: VinculoEntrada) => boolean = (v) => v.confirmacao === 'confirmado',
): Unificacao {
  const aceitos = vinculos.filter(aceitar);
  if (aceitos.length === 0) return { animais: [...animais], representante: new Map(), aplicados: 0 };
  const c = new Conjuntos();
  for (const v of aceitos) c.unir(v.animalA, v.animalB);
  const representante = new Map<number, number>();
  for (const v of aceitos) {
    for (const x of [v.animalA, v.animalB]) {
      const r = c.achar(x);
      if (r !== x) representante.set(x, r);
    }
  }
  const rep = (id: number | null) => (id == null ? null : (representante.get(id) ?? id));
  return {
    animais: animais.map((a) => ({ ...a, paiId: rep(a.paiId), maeId: rep(a.maeId) })),
    representante,
    aplicados: aceitos.length,
  };
}

export interface ResumoConexao {
  conectores: ReprodutorConector[];
  /** Fazendas que algum conector liga a outra. */
  fazendasLigadas: number;
  /** Pares de fazendas com pelo menos um conector em comum. */
  paresDeFazendas: number;
  /** Grupos de fazendas que ficam na mesma régua (componentes do grafo de fazendas), só os de 2+. */
  componentes: number[][];
  /** Filhas dos conectores (em todas as fazendas que eles ligam). */
  filhasDosConectores: number;
}

function resumir(animais: readonly AnimalEntrada[]): ResumoConexao {
  const conectores = reprodutoresConectores(animais);
  const pares = new Set<string>();
  const ligadas = new Set<number>();
  const c = new Conjuntos();
  for (const k of conectores) {
    for (let i = 0; i < k.propriedades.length; i++) {
      ligadas.add(k.propriedades[i]);
      for (let j = i + 1; j < k.propriedades.length; j++) {
        pares.add(`${k.propriedades[i]}-${k.propriedades[j]}`);
        c.unir(k.propriedades[i], k.propriedades[j]);
      }
    }
  }
  const grupos = new Map<number, number[]>();
  for (const f of ligadas) {
    const r = c.achar(f);
    grupos.set(r, [...(grupos.get(r) ?? []), f]);
  }
  return {
    conectores,
    fazendasLigadas: ligadas.size,
    paresDeFazendas: pares.size,
    componentes: [...grupos.values()].map((g) => g.sort((a, b) => a - b)).sort((a, b) => b.length - a.length || a[0] - b[0]),
    filhasDosConectores: conectores.reduce((s, k) => s + k.filhas, 0),
  };
}

export interface ConexaoComVinculos {
  candidatos: number;
  confirmados: number;
  rejeitados: number;
  /** Com os confirmados só — o que o módulo usa. */
  atual: ResumoConexao;
  /** Se todo candidato não rejeitado fosse confirmado — o que está em jogo. */
  seConfirmados: ResumoConexao;
}

export function conexaoComVinculos(
  animais: readonly AnimalEntrada[],
  vinculos: readonly VinculoEntrada[],
): ConexaoComVinculos {
  const atual = aplicarVinculos(animais, vinculos, (v) => v.confirmacao === 'confirmado');
  const todos = aplicarVinculos(animais, vinculos, (v) => v.confirmacao !== 'rejeitado');
  return {
    candidatos: vinculos.filter((v) => v.confirmacao === 'nao_confirmado').length,
    confirmados: vinculos.filter((v) => v.confirmacao === 'confirmado').length,
    rejeitados: vinculos.filter((v) => v.confirmacao === 'rejeitado').length,
    atual: resumir(atual.animais),
    seConfirmados: resumir(todos.animais),
  };
}
