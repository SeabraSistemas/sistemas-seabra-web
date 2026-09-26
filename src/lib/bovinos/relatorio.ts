import type { Cliente } from '@/lib/bovinos/clientes';
import { montarModelo } from '@/lib/bovinos/modelo';
import { criarIndices } from '@/lib/bovinos/identidade';
import { montarTabela } from '@/lib/bovinos/tabela';
import { regrasEstrutura } from '@/lib/bovinos/regras/estrutura';
import { regrasFazenda, type ColunaFazenda } from '@/lib/bovinos/regras/fazenda';
import { regrasPartos } from '@/lib/bovinos/regras/partos';
import { regrasReproducao } from '@/lib/bovinos/regras/reproducao';
import type { Problema, Relatorio, Severidade } from '@/lib/bovinos/tipos';

/** Tudo o que a leitura da planilha entrega ao motor (puro — os testes montam isto à mão). */
export interface EntradaRelatorio {
  rebanho: string[][] | null;
  partos: { aba: string; valores: string[][] | null }[];
  reproducao: string[][] | null;
  /** Render FORMULA de cada coluna de fórmula do cliente (coluna inteira, com cabeçalho). */
  formulas: { col: string; valores: string[] }[];
  /** Render FORMULA das linhas candidatas a "em branco". */
  linhasCompletas: { linha: number; valores: string[] }[];
  fazendas: ColunaFazenda[];
}

const ORDEM_SEV: Record<Severidade, number> = { corrigivel: 0, manual: 1, info: 2 };

export function montarRelatorio(e: EntradaRelatorio, cliente: Cliente, hoje: number): Relatorio {
  const rebanho = montarTabela('RebanhoProd', e.rebanho);
  const partos = e.partos.map((p) => montarTabela(p.aba, p.valores)).filter((x) => x !== null);
  const avisos: string[] = [];
  for (const p of e.partos) if (!p.valores?.length) avisos.push(`Aba ${p.aba} não encontrada ou vazia.`);

  const m = montarModelo({ rebanho, partos, reproducao: montarTabela('Reproduçao', e.reproducao) });
  if (!m.ok || !rebanho) {
    return { problemas: [], avisos: [...avisos, m.ok ? 'RebanhoProd vazio.' : m.erro], totais: { linhasRebanho: 0, partos: 0, iatfs: 0 } };
  }
  avisos.push(...m.avisos);
  const { modelo } = m;
  const ind = criarIndices(modelo);

  const faltandoFormula = cliente.colunasFormula.filter((c) => !e.formulas.some((f) => f.col === c));
  if (faltandoFormula.length) avisos.push(`RebanhoProd sem as colunas de fórmula: ${faltandoFormula.join(', ')}.`);

  const problemas: Problema[] = [
    ...regrasEstrutura({
      rebanho,
      modelo,
      ind,
      cliente,
      formulas: new Map(e.formulas.map((f) => [f.col, f.valores])),
      linhasCompletas: new Map(e.linhasCompletas.map((l) => [l.linha, l.valores])),
    }),
    ...regrasFazenda(cliente, e.fazendas),
    ...regrasPartos({ modelo, ind, colunasRebanho: new Set(rebanho.cabecalho), hoje }),
    ...regrasReproducao(modelo, ind),
  ];

  // Ids únicos (duas regras nunca devem colidir, mas um id repetido quebraria a seleção).
  const vistos = new Map<string, number>();
  for (const p of problemas) {
    const n = vistos.get(p.id) ?? 0;
    vistos.set(p.id, n + 1);
    if (n > 0) p.id = `${p.id}#${n}`;
  }
  problemas.sort((a, b) => ORDEM_SEV[a.severidade] - ORDEM_SEV[b.severidade]);

  return {
    problemas,
    avisos,
    totais: { linhasRebanho: modelo.rebanho.filter((r) => r.A || r.id).length, partos: modelo.partos.length, iatfs: modelo.iatfs.length },
  };
}
