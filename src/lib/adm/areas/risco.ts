import 'server-only';

import { diasEntre } from '@/lib/adm/format';
import { listarUsuarios } from '@/lib/adm/queries';
import { ok, type Resultado, type UsuarioLista } from '@/lib/adm/types';

/**
 * OS QUATRO BALDES DE /adm/carteira/risco — extraído da própria tela.
 *
 * POR QUE ISTO VIROU MÓDULO: a exportação (CSV/XLSX) de um balde precisa
 * produzir EXATAMENTE a mesma lista, na mesma ordem, que a tela mostra —
 * "silêncio" na tela e "silêncio" no arquivo não podem ser duas consultas
 * escritas em dois lugares, porque divergem na primeira vez que só uma for
 * editada (foi essa mesma classe de defeito que motivou `areas/leitura.ts`).
 * Cada balde aqui é UMA fonte; a página e a rota de exportação só chamam.
 *
 * A REGRA DE ORDEM É PARTE DO CONTRATO, não um detalhe de exibição:
 *
 *   silêncio        já sai do SQL em ordem de valor (valor_real_mensal desc).
 *   inadimplente    reordenado por TEMPO DE ATRASO — `ordem: 'valor'` do SQL é
 *                   um empate geral aqui (toda assinatura vencida tem
 *                   valor_real_mensal = 0).
 *   trial           filtrado à janela de alerta e ordenado por dias restantes,
 *                   com o rebanho como desempate.
 *   sem_pagamento   união de duas consultas (cortesia/extensão + is_tester),
 *                   deduplicada por `usuarios.id` (D1), ordenada por rebanho.
 */

/** A janela do balde de trial. Sete dias é o que sobra de conversa útil: abaixo
 *  disso a ligação vira cobrança, acima vira lembrete que ninguém atende. */
export const TRIAL_ALERTA_DIAS = 7;

export type BaldeRisco = 'silencio' | 'inadimplente' | 'trial' | 'sem_pagamento';

export const BALDES_RISCO: readonly BaldeRisco[] = ['silencio', 'inadimplente', 'trial', 'sem_pagamento'];

export const BALDE_ROTULO: Record<BaldeRisco, string> = {
  silencio: 'Silêncio',
  inadimplente: 'Inadimplente',
  trial: 'Trial estourando',
  sem_pagamento: 'Acesso sem pagamento',
};

/**
 * Dias até o vencimento: negativo quando já venceu. `agora` é ISO e vem de
 * fora — mesma disciplina de `format.ts`: recalcular o instante dentro de cada
 * chamada faz a mesma conta ser feita com dois relógios, e é assim que um
 * "vence hoje" vira "vencido há 1 dia" no meio de uma mesma leitura.
 */
function diasParaVencer(u: UsuarioLista, agoraIso: string): number | null {
  return diasEntre(agoraIso, u.data_vencimento);
}

/** União sem repetir ninguém, preservando a ordem de chegada. `usuarios.id` é a
 *  identidade do painel (D1), então é ele que decide o que é a mesma conta. */
function unir(...listas: UsuarioLista[][]): UsuarioLista[] {
  const vistos = new Set<number>();
  const saida: UsuarioLista[] = [];
  for (const lista of listas) {
    for (const u of lista) {
      if (vistos.has(u.id)) continue;
      vistos.add(u.id);
      saida.push(u);
    }
  }
  return saida;
}

/**
 * Carrega UM balde — a mesma consulta e o mesmo recorte que a tela usa para
 * desenhar a lista. `agora` é `Date`, não string: cada balde decide sozinho se
 * precisa do ISO (a comparação de vencimento pede um instante fixo).
 */
export async function carregarBalde(balde: BaldeRisco, agora: Date): Promise<Resultado<UsuarioLista[]>> {
  const agoraIso = agora.toISOString();

  switch (balde) {
    case 'silencio':
      // Já sai do SQL na ordem certa: `ordem: 'valor'` é valor_real_mensal
      // desc. A regra "silencioso" da própria query já exige acesso ativo —
      // sem isso a lista se encheria de conta cancelada há um ano, que não é
      // ação nenhuma.
      return listarUsuarios({ atividade: 'silencioso', ordem: 'valor' });

    case 'inadimplente': {
      // Vencida, e não ['vencida','pendente']: pendente é cobrança emitida e
      // ainda NO PRAZO — isso é "em aberto" na tela de receita, não
      // inadimplência.
      const r = await listarUsuarios({ status: ['vencida'], ordem: 'valor' });
      if (!r.ok) return r;
      const linhas = [...r.dados].sort((a, b) => {
        const da = diasParaVencer(a, agoraIso);
        const db = diasParaVencer(b, agoraIso);
        if (da == null && db == null) return a.id - b.id;
        if (da == null) return 1;
        if (db == null) return -1;
        // Mais negativo = vencido há mais tempo = mais no alto.
        return da !== db ? da - db : a.id - b.id;
      });
      return ok(linhas);
    }

    case 'trial': {
      // Recorte em memória sobre a lista COMPLETA de trials — não é agregação
      // sobre página paginada (o que faria um número ficar menor que a
      // verdade), é filtro e ordenação sobre tudo o que a query devolveu.
      const r = await listarUsuarios({ status: ['trial'], ordem: 'valor' });
      if (!r.ok) return r;
      const linhas = r.dados
        .map((u) => ({ u, dias: diasParaVencer(u, agoraIso) }))
        .filter((x): x is { u: UsuarioLista; dias: number } => x.dias != null && x.dias <= TRIAL_ALERTA_DIAS)
        // Mais perto de acabar primeiro; empate desempata por uso, que é o que
        // diz se a conversa vale um telefonema (200 animais lançados ≠
        // cadastro vazio).
        .sort((a, b) => a.dias - b.dias || b.u.animais_ativos - a.u.animais_ativos || a.u.id - b.u.id)
        .map((x) => x.u);
      return ok(linhas);
    }

    case 'sem_pagamento': {
      // União de duas chamadas à MESMA query — não é um segundo motor de
      // lista. A dedupe é obrigatória: uma conta de cortesia também marcada
      // como is_tester aparece nas duas respostas e viraria duas linhas do
      // mesmo nome.
      const [gratuitasRes, testesRes] = await Promise.all([
        listarUsuarios({ origens: ['cortesia', 'extensao'], ordem: 'valor' }),
        // `is_tester` fica FORA da lista mestra por default (a conta demo é a
        // do reviewer da Apple e as de teste são internas), então esta é a
        // única chamada que precisa levantar esse corte — e ela pede
        // exatamente a bandeira.
        listarUsuarios({ incluirTestes: true, bandeiras: ['tester'], ordem: 'valor' }),
      ]);
      if (!gratuitasRes.ok) return gratuitasRes;
      if (!testesRes.ok) return testesRes;
      const linhas = unir(gratuitasRes.dados, testesRes.dados).sort(
        (a, b) => b.animais_ativos - a.animais_ativos || a.id - b.id,
      );
      return ok(linhas);
    }
  }
}
