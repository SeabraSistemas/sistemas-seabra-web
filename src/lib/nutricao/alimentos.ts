import { ALIMENTOS_FORMULADOR } from '@/data/nutricao/alimentos';
import type { Alimento, AvisoAlimento, GrupoAlimento } from '@/lib/nutricao/tipos';

export const NOME_GRUPO: Record<GrupoAlimento, string> = {
  pastagem: 'Pastagem',
  volumoso: 'Volumosos',
  concentrado: 'Concentrados e subprodutos',
  suplemento: 'Minerais, núcleos e aditivos',
};

export const ORDEM_GRUPOS: GrupoAlimento[] = ['pastagem', 'volumoso', 'concentrado', 'suplemento'];

export function bancoOriginal(): Alimento[] {
  return ALIMENTOS_FORMULADOR;
}

/**
 * Edições do banco guardadas no navegador: campos trocados de alimentos do
 * banco original + alimentos criados pelo usuário. As planilhas do consultor
 * não mudam; as correções vivem só aqui.
 */
export type EdicoesBanco = {
  alteracoes: Record<string, Partial<Omit<Alimento, 'id'>>>;
  criados: Alimento[];
};

export const SEM_EDICOES: EdicoesBanco = { alteracoes: {}, criados: [] };

export function aplicarEdicoes(edicoes: EdicoesBanco): Alimento[] {
  const base = ALIMENTOS_FORMULADOR.map((a) => {
    const alt = edicoes.alteracoes[a.id];
    return alt ? { ...a, ...alt } : a;
  });
  return [...base, ...edicoes.criados];
}

export function foiEditado(edicoes: EdicoesBanco, id: string): boolean {
  return id in edicoes.alteracoes && Object.keys(edicoes.alteracoes[id]).length > 0;
}

/** Valor original do banco do consultor (para o "voltar ao original"). */
export function alimentoOriginal(id: string): Alimento | undefined {
  return ALIMENTOS_FORMULADOR.find((a) => a.id === id);
}

export function alimentoPorId(banco: Alimento[], id: string): Alimento | undefined {
  return banco.find((a) => a.id === id);
}

const CAMPOS_COMPOSICAO = ['pb', 'ndt', 'fdn', 'ca', 'p', 'ee', 'mm', 'cnf', 'amido'] as const;
const ROTULO_CAMPO: Record<(typeof CAMPOS_COMPOSICAO)[number], string> = {
  pb: 'PB',
  ndt: 'NDT',
  fdn: 'FDN',
  ca: 'Ca',
  p: 'P',
  ee: 'EE',
  mm: 'MM',
  cnf: 'CNF',
  amido: 'amido',
};

const pct = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')}%`;
const reais = (x: number) => `R$ ${x.toFixed(2).replace('.', ',')}`;

/**
 * Valores suspeitos de um alimento. Não corrige nada: o número continua o da
 * planilha até o produtor editar, e o aviso diz o porquê da desconfiança.
 * `erro` = quase certo que está errado; `aviso` = conferir; `info` = falta dado.
 */
export function avisosDoAlimento(a: Alimento): AvisoAlimento[] {
  const avisos: AvisoAlimento[] = [];
  if (a.avisoFonte) avisos.push({ nivel: 'aviso', texto: `Da planilha: ${a.avisoFonte}.` });

  if (a.ms == null) {
    avisos.push({ nivel: 'info', texto: 'Sem matéria seca no banco: não entra no cálculo até preencher.' });
    return avisos;
  }
  if (a.ms <= 0 || a.ms > 1) avisos.push({ nivel: 'erro', texto: `Matéria seca de ${pct(a.ms)} fora de 0–100%.` });

  const faltando = CAMPOS_COMPOSICAO.filter((c) => a[c] == null).map((c) => ROTULO_CAMPO[c]);
  const mineralOuAditivo = a.grupo === 'suplemento';
  if (faltando.length > 0 && !mineralOuAditivo) {
    avisos.push({ nivel: 'info', texto: `Sem dado de ${faltando.join(', ')} no banco: conta como zero na dieta.` });
  }

  // Amido não pode passar dos carboidratos não fibrosos (o amido é parte do CNF).
  if (a.amido != null && a.cnf != null && a.amido > a.cnf + 0.005) {
    avisos.push({ nivel: 'erro', texto: `Amido (${pct(a.amido)}) maior que o CNF (${pct(a.cnf)}): o amido é parte do CNF. Um dos dois está errado.` });
  }

  // PB + FDN + EE + MM + CNF deveria fechar perto de 100% da MS.
  if (CAMPOS_COMPOSICAO.filter((c) => c !== 'ndt' && c !== 'ca' && c !== 'p' && c !== 'amido').every((c) => a[c] != null) && !mineralOuAditivo) {
    const soma = (a.pb ?? 0) + (a.fdn ?? 0) + (a.ee ?? 0) + (a.mm ?? 0) + (a.cnf ?? 0);
    if (soma < 0.95 || soma > 1.05) {
      avisos.push({ nivel: 'aviso', texto: `PB + FDN + EE + MM + CNF somam ${pct(soma)} da MS (deveria fechar perto de 100%).` });
    }
  }

  if (a.ndt != null && a.ndt > 1) {
    avisos.push({ nivel: 'aviso', texto: `NDT de ${pct(a.ndt)} da MS passa de 100%: só faz sentido para gordura pura. Conferir o valor usado.` });
  }

  if (a.preco != null) {
    if (a.preco === 0 && a.grupo !== 'pastagem') avisos.push({ nivel: 'aviso', texto: 'Preço R$ 0,00: sem custo ou preço que faltou preencher?' });
    else if (a.preco > 0 && a.preco < 0.05 && a.grupo !== 'pastagem') {
      avisos.push({ nivel: 'aviso', texto: `Preço de ${reais(a.preco)} por kg de matéria natural parece baixo demais. Conferir.` });
    }
    if (a.pb != null && a.preco > 0 && Math.abs(a.preco - a.pb) < 1e-9) {
      avisos.push({ nivel: 'aviso', texto: `Preço (${reais(a.preco)}) igual ao valor de PB (${a.pb.toString().replace('.', ',')}): possível cópia de coluna. Conferir.` });
    }
  } else if (a.grupo !== 'pastagem') {
    avisos.push({ nivel: 'info', texto: 'Sem preço: o custo da dieta fica incompleto.' });
  }
  return avisos;
}

/** O alimento pode entrar na conta? (precisa de matéria seca). */
export function calculavel(a: Alimento): boolean {
  return a.ms != null && a.ms > 0;
}

export function novoAlimentoVazio(id: string, nome: string, grupo: GrupoAlimento): Alimento {
  return { id, nome, grupo, ms: null, pb: null, ndt: null, fdn: null, ca: null, p: null, ee: null, mm: null, cnf: null, amido: null, preco: null, precoOrigem: null, avisoFonte: null };
}
