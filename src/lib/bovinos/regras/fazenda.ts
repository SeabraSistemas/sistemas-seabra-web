import { t } from '@/lib/bovinos/texto';
import type { Cliente } from '@/lib/bovinos/clientes';
import type { Problema } from '@/lib/bovinos/tipos';

/** Abas que não são registro de animal/evento (menus, listas, logs de script). */
export const ABAS_IGNORADAS_FAZENDA = /^(LOG|Menu|HelperQueries|Listas|Rebanho hist|RELATORIO|Fazendas$|User Manager|MUDANCA|AUDITORIA)/i;

export interface ColunaFazenda {
  aba: string;
  /** Células da coluna "Fazenda" por linha da planilha (índice 0 = cabeçalho). */
  valores: string[];
}

/**
 * Valor de Fazenda que não é deste cliente, agrupado por aba e valor. Com
 * alias conhecido (ex.: "Bonito" gravado na Santo Antônio) vira correção em
 * massa; sem alias, fica para decisão.
 */
export function regrasFazenda(cliente: Cliente, colunas: ColunaFazenda[]): Problema[] {
  const validas = new Set(cliente.fazendas.map((f) => f.toLowerCase()));
  const out: Problema[] = [];
  for (const { aba, valores } of colunas) {
    if (ABAS_IGNORADAS_FAZENDA.test(aba)) continue;
    const porValor = new Map<string, number[]>();
    valores.forEach((v, i) => {
      const x = t(v);
      if (i === 0 || !x || validas.has(x.toLowerCase())) return;
      porValor.set(x, [...(porValor.get(x) ?? []), i + 1]);
    });
    for (const [valor, linhas] of porValor) {
      const para = cliente.aliasesFazenda[valor];
      out.push({
        id: `fazenda-fora-da-lista|${aba}|${valor}`,
        regra: 'fazenda-fora-da-lista',
        severidade: para ? 'corrigivel' : 'manual',
        aba,
        linha: linhas[0],
        animal: '',
        resumo: `${aba}: ${linhas.length} registro(s) com Fazenda "${valor}"${para ? ` → trocar por "${para}"` : ''}.`,
        prova: [`Linhas ${linhas.slice(0, 15).join(', ')}${linhas.length > 15 ? ' …' : ''}`, `Fazendas deste cliente: ${cliente.fazendas.join(', ')}`],
        bloqueios: para ? [] : ['Valor sem correspondência conhecida — confirmar a fazenda certa.'],
        atual: valor,
        sugerido: para ?? '',
        correcao: para ? { tipo: 'coluna-valor', aba, col: 'Fazenda', linhas, de: valor, para } : null,
      });
    }
  }
  return out;
}
