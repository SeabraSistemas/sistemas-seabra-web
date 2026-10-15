/**
 * Lista de nomes das crias do Capril Sanri — regras puras (sem banco, sem tela).
 *
 * O banco do app dá o nome sozinho no Nascimento: a cria recebe o primeiro nome
 * LIVRE, em ordem alfabética, da lista do ano em que nasceu e do sexo dela,
 * seguido do sufixo do criador ("AMORA SANRI"). Cada ano tem uma letra
 * (2026 = A, 2027 = B…). Migration do app: 20261015120000_nome_automatico_sanri.sql.
 *
 * O banco é quem manda (gatilho de validação); estas regras só repetem as
 * dele para a tela avisar antes de gravar. Se divergirem, vale o banco.
 */

export type Sexo = 'fêmea' | 'macho';
export const SEXOS: { chave: Sexo; plural: string }[] = [
  { chave: 'fêmea', plural: 'Fêmeas' },
  { chave: 'macho', plural: 'Machos' },
];

export interface ConfigNomes {
  sufixo: string;
  anoBase: number;
  letraBase: string;
}

export interface NomeLista {
  id: number;
  ano: number;
  sexo: Sexo;
  nome: string;
  /** Animal da fazenda ligado a este nome (derivado do rebanho). null = livre. */
  animal: { id: number; numero: string | null; nome: string | null; nascimento: string | null; ativo: boolean } | null;
  /**
   * 'dado' = o sistema deu a uma cria; 'existe' = parecido com um nome do
   * rebanho (palavra igual ou 1 letra de diferença) — não será usado; null = livre.
   */
  situacao: 'dado' | 'existe' | null;
}

export interface CriaSemNome {
  id: number;
  numero: string | null;
  sexo: Sexo;
  nascimento: string;
}

/** Mesma chave do banco (`nome_automatico_chave`): sem acento, sem caixa, aparado. */
export function chaveNome(nome: string): string {
  return nome
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
}

/** 2026 = A (ano-base), 2027 = B… Depois do Z volta ao A. */
export function letraDoAno(ano: number, config: Pick<ConfigNomes, 'anoBase' | 'letraBase'>): string {
  const base = config.letraBase.toUpperCase().charCodeAt(0) - 65;
  const i = (((base + (ano - config.anoBase)) % 26) + 26) % 26;
  return String.fromCharCode(65 + i);
}

/**
 * Texto colado/digitado -> nomes. Um por linha, ou separados por vírgula ou
 * ponto e vírgula. NÃO separa por espaço: "Ana Clara" tem de voltar como erro
 * ("uma palavra só"), não virar dois nomes que ela não pediu.
 */
export function separarNomes(texto: string): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const parte of texto.split(/[\n,;]+/)) {
    const nome = parte.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!nome) continue;
    const k = chaveNome(nome);
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(nome);
  }
  return out;
}

/** Motivo da recusa, ou null se o nome serve para o ano. */
export function problemaDoNome(nome: string, ano: number, config: ConfigNomes): string | null {
  const n = nome.trim();
  if (!n) return 'vazio';
  if (!/^\p{L}+$/u.test(n)) return 'tem de ser uma palavra só, sem espaço, número ou símbolo';
  const letra = letraDoAno(ano, config);
  if (chaveNome(n)[0] !== letra) return `em ${ano} os nomes começam com ${letra}`;
  return null;
}

/**
 * Erro do banco -> frase para a Maria Pia. As recusas do gatilho começam com
 * uma MARCA (NOME_UMA_PALAVRA, NOME_LETRA_ERRADA, NOME_EM_USO); o índice
 * único devolve o código 23505.
 */
export function traduzirErro(erro: { message?: string; code?: string } | null | undefined): string {
  const msg = erro?.message ?? '';
  if (erro?.code === '23505') return 'já está na lista';
  if (msg.startsWith('NOME_UMA_PALAVRA')) return 'tem de ser uma palavra só, sem espaço, número ou símbolo';
  if (msg.startsWith('NOME_LETRA_ERRADA')) {
    const m = /em (\d{4}) os nomes começam com (\w)/.exec(msg);
    return m ? `em ${m[1]} os nomes começam com ${m[2]}` : 'letra errada para o ano';
  }
  if (msg.startsWith('NOME_EM_USO')) return 'já foi dado a um animal — não pode ser alterado nem excluído';
  if (msg.startsWith('NOME_JA_EXISTE')) {
    // "NOME_JA_EXISTE: AMORAS parece com AMORA SANRI (nº 123), que já está no rebanho"
    const m = /parece com .*$/.exec(msg);
    return m ? m[0] : 'parece com um nome que já está no rebanho';
  }
  return 'não foi possível gravar';
}

/** Nome completo que a cria recebe: "AMORA" + "SANRI" -> "AMORA SANRI". */
export function nomeCompleto(nome: string, sufixo: string): string {
  const s = sufixo.trim().toUpperCase();
  return s ? `${nome} ${s}` : nome;
}

export interface ResumoSexo {
  livres: NomeLista[];
  usados: NomeLista[];
  /** Parecidos com nomes do rebanho: ficam de fora (dá para excluir). */
  conflitos: NomeLista[];
  /** O próximo a sair: o primeiro livre em ordem alfabética (mesma ordem do banco). */
  proximo: NomeLista | null;
}

/** Ordem do banco: alfabética pela chave sem acento, depois pelo id. */
export function ordenar(nomes: NomeLista[]): NomeLista[] {
  return [...nomes].sort((a, b) => {
    const ka = chaveNome(a.nome);
    const kb = chaveNome(b.nome);
    return ka < kb ? -1 : ka > kb ? 1 : a.id - b.id;
  });
}

export function resumir(nomes: NomeLista[], ano: number, sexo: Sexo): ResumoSexo {
  const doGrupo = ordenar(nomes.filter((n) => n.ano === ano && n.sexo === sexo));
  const livres = doGrupo.filter((n) => n.situacao == null);
  const usados = doGrupo.filter((n) => n.situacao === 'dado');
  const conflitos = doGrupo.filter((n) => n.situacao === 'existe');
  return { livres, usados, conflitos, proximo: livres[0] ?? null };
}

/**
 * Anos que aparecem no seletor: todo ano com lista, o ano corrente e o
 * seguinte (para ela preparar a lista de 2027 ainda em 2026).
 */
export function anosDoSeletor(nomes: NomeLista[], anoAtual: number, config: Pick<ConfigNomes, 'anoBase'>): number[] {
  const anos = new Set<number>(nomes.map((n) => n.ano));
  anos.add(Math.max(anoAtual, config.anoBase));
  anos.add(Math.max(anoAtual, config.anoBase) + 1);
  return [...anos].sort((a, b) => a - b);
}

/** Ano de uma data "AAAA-MM-DD". */
export function anoDe(data: string): number {
  return Number(data.slice(0, 4));
}
