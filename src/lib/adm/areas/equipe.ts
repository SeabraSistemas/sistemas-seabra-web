import 'server-only';

import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { VIEWS_FASE_2, type LinhaEquipe } from '@/lib/adm/areas/contrato';
import { erro, ok, semConfig, PAPEIS, type Papel, type PropriedadeEscopo, type Resultado } from '@/lib/adm/types';

/**
 * Área EQUIPE — quem mais mexe nesta conta.
 *
 * Lê `adm.propriedade_equipe` (nome vindo de VIEWS_FASE_2, nunca digitado) e
 * entrega à tela um objeto em camelCase, como o resto do painel. A view já
 * resolveu a parte difícil: quem alcança a fazenda sai de
 * `adm.propriedades_escopo`, que conhece as quatro pernas de vínculo — reusar é
 * obrigatório, porque uma segunda definição de "vínculo" divergiria da primeira
 * na primeira mudança de papel.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A REGRA QUE ESTE ARQUIVO EXISTE PARA CARREGAR
 *
 * `usuarios.colaborador_permissoes` é um `text[]` em que **NULL ou vazio
 * significa TUDO LIBERADO** (backward-compat: o app só passou a restringir
 * depois, e a coluna nasceu nula em todo mundo). Uma tela que renderizasse esse
 * array cru diria "sem permissões" — exatamente o oposto do que o banco quer
 * dizer — e o Felipe ligaria para um cliente avisando que o funcionário está
 * travado quando ele tem acesso total.
 *
 * Por isso a interpretação mora AQUI, em `resumirPermissoes()`, e não em JSX
 * espalhado: é uma regra de negócio com um jeito certo, não uma decisão de
 * layout. A view devolve o array como está de propósito — traduzir no SQL
 * apagaria a diferença entre "nunca configurado" (NULL) e "configurado com tudo
 * marcado" (as 16 chaves no array), que são fatos diferentes sobre a conta.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SOMENTE LEITURA (D3). Nada aqui escreve em `usuarios` — mexer em permissão
 * continua sendo no app.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
//
// `queries.ts` tem `umaLinha()`, `falha()` e os coercitivos, mas nenhum deles é
// exportado. Duplicar ~30 linhas custa menos que acoplar as áreas ao arquivo de
// 54 KB do MVP; no dia em que aqueles helpers virarem API pública, este bloco
// some sem tocar em mais nada.
// ─────────────────────────────────────────────────────────────────────────────

/** O SQL que cria a view. O caminho aparece na mensagem: "view não existe" sem
 *  dizer o que rodar custa meia hora de investigação. */
const SQL_AREAS = 'supabase/adm/adm_07_areas.sql';

type ErroPostgrest = { message: string; code?: string };
type Linha = Record<string, unknown>;

/**
 * PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 * 42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma
 * (rodar o SQL / expor o schema), então os cinco viram 'sem-config' — que a
 * `<EstadoVazio>` desenha diferente de "este cliente não tem equipe".
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode ${SQL_AREAS} no Supabase e confirme ` +
        'que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

/** `numeric` do Postgres pode chegar como string quando não cabe em double —
 *  ignorar isso transformaria uma contagem em 0 sem aviso. */
function inteiro(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v) : 0;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return 0;
}

/** Postgres pode devolver boolean como 't'/'true' dependendo do caminho. */
function booleano(v: unknown, padrao = false): boolean {
  if (v === true || v === 't' || v === 'true') return true;
  if (v === false || v === 'f' || v === 'false') return false;
  return padrao;
}

function comoLinhas(valores: unknown): Linha[] {
  if (!Array.isArray(valores)) return [];
  return valores.filter((v): v is Linha => typeof v === 'object' && v !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Permissões do colaborador
// ─────────────────────────────────────────────────────────────────────────────

/**
 * As 16 chaves REAIS de `usuarios.colaborador_permissoes`, confirmadas no guard
 * do app (`lib/custom_code/actions/colaborador_permission_guard.dart`). São
 * chaves de MENU, não de tabela: `cadastro_escolha` é a tela de cadastro,
 * `setor_baia_lote` é um item só que cobre os três.
 *
 * A ordem é a do menu do app, não alfabética — quem confere uma permissão está
 * com o celular do cliente do lado, e a mesma ordem nas duas telas é o que torna
 * a conferência rápida.
 */
export const PERMISSOES_COLABORADOR: readonly { chave: string; rotulo: string }[] = [
  { chave: 'cadastro_escolha', rotulo: 'Cadastro de animal' },
  { chave: 'listagem_rebanho', rotulo: 'Listagem do rebanho' },
  { chave: 'nascimento', rotulo: 'Nascimento' },
  { chave: 'reproducao', rotulo: 'Reprodução' },
  { chave: 'aborto', rotulo: 'Aborto' },
  { chave: 'controle_leiteiro', rotulo: 'Controle leiteiro' },
  { chave: 'producao_diaria', rotulo: 'Produção diária' },
  { chave: 'saida_leite', rotulo: 'Saída de leite' },
  { chave: 'secagem', rotulo: 'Secagem' },
  { chave: 'pesagem', rotulo: 'Pesagem' },
  { chave: 'manejo', rotulo: 'Manejo' },
  { chave: 'clinica', rotulo: 'Clínica' },
  { chave: 'setor_baia_lote', rotulo: 'Setor, baia e lote' },
  { chave: 'venda', rotulo: 'Venda' },
  { chave: 'obito', rotulo: 'Óbito' },
  { chave: 'descarte', rotulo: 'Descarte' },
];

const ROTULO_PERMISSAO = new Map(PERMISSOES_COLABORADOR.map((p) => [p.chave, p.rotulo]));

export function rotuloDePermissao(chave: string): string {
  return ROTULO_PERMISSAO.get(chave) ?? chave;
}

/**
 * Avaliação morfológica linear é bloqueada para QUALQUER colaborador, no código
 * do app, independente do array. Não é uma chave que possa ser marcada — não
 * existe nas 16 — então a tela precisa dizer isso em voz alta: sem essa nota,
 * "tudo liberado" parece incluir a AML, e não inclui.
 */
export const PERMISSAO_SEMPRE_BLOQUEADA =
  'Avaliação morfológica linear (AML) é bloqueada para todo colaborador no próprio app, ' +
  'independente desta lista — não existe chave para liberá-la.';

export type ResumoPermissoes =
  /** Coluna sem sentido para este papel: só o colaborador tem menu restringível. */
  | { modo: 'nao-se-aplica' }
  /**
   * Tudo liberado. `nunca-configurado` (NULL) e `lista-vazia` (`{}`) chegam à
   * mesma permissão efetiva por caminhos diferentes, e a diferença é informação:
   * a primeira nunca passou pela tela de permissões, a segunda passou e ficou
   * sem nada marcado — que o app trata como "tudo" por backward-compat, e é
   * quase certamente o oposto do que quem mexeu quis dizer.
   */
  | { modo: 'tudo'; motivo: 'nunca-configurado' | 'lista-vazia' }
  | {
      modo: 'restrito';
      liberadas: { chave: string; rotulo: string }[];
      bloqueadas: { chave: string; rotulo: string }[];
      /** Chave gravada que não está nas 16 conhecidas — menu novo no app.
       *  Aparece na tela em vez de ser engolida: uma permissão invisível aqui é
       *  uma permissão que ninguém audita. */
      desconhecidas: string[];
    };

export function resumirPermissoes(pessoa: Pick<PessoaEquipe, 'papel' | 'permissoes'>): ResumoPermissoes {
  if (pessoa.papel !== 'colaborador') return { modo: 'nao-se-aplica' };

  const bruto = pessoa.permissoes;
  if (bruto === null) return { modo: 'tudo', motivo: 'nunca-configurado' };
  if (bruto.length === 0) return { modo: 'tudo', motivo: 'lista-vazia' };

  const marcadas = new Set(bruto);
  const liberadas = PERMISSOES_COLABORADOR.filter((p) => marcadas.has(p.chave));
  const bloqueadas = PERMISSOES_COLABORADOR.filter((p) => !marcadas.has(p.chave));
  const desconhecidas = bruto.filter((c) => !ROTULO_PERMISSAO.has(c));

  // Todas as 16 marcadas é "restrito" no papel e "tudo" na prática. Devolver
  // 'tudo' aqui apagaria o fato de que alguém configurou de propósito — e a
  // tela quer mostrar "16 de 16", não "nunca configurado".
  return { modo: 'restrito', liberadas: [...liberadas], bloqueadas: [...bloqueadas], desconhecidas };
}

// ─────────────────────────────────────────────────────────────────────────────
// Forma que a tela consome
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Espelho em camelCase de um item de `LinhaEquipe['pessoas']`. Os NOMES das
 * chaves cruas continuam declarados só no contrato; aqui elas viram o vocabulário
 * do painel, como `VisaoGeralPropriedade` já faz com a visão geral.
 */
export interface PessoaEquipe {
  usuarioId: number;
  nome: string;
  papel: Papel | null;
  ativo: boolean;
  vinculo: PropriedadeEscopo['vinculo'];
  /** Array CRU de `usuarios.colaborador_permissoes`. Interpretar só por
   *  `resumirPermissoes()` — ver o cabeçalho do arquivo. */
  permissoes: string[] | null;
  /**
   * ⚠️ PARCIAL POR CONSTRUÇÃO. Só `rebanho` e `movimentacoes` guardam autor
   * (`criado_por_usuario_id`); manejo, pesagem, controle leiteiro e produção
   * diária não guardam nenhum. `null` aqui significa "não dá para atribuir a
   * esta pessoa", NUNCA "esta pessoa não trabalha" — e a tela precisa dizer
   * isso, senão a aba vira uma lista de gente que parece ociosa.
   */
  ultimoLancamentoEm: string | null;
  /** Em quantas propriedades do escopo esta pessoa aparece (só > 1 no consolidado). */
  propriedades: number;
}

export interface Equipe {
  colaboradores: number;
  colaboradoresAtivos: number;
  /** Vínculos `tecnico_propriedades` com status 'ativo'. */
  tecnicosVinculados: number;
  /** `visitas_tecnicas` — o fluxo GRÁTIS (produtor convida), diferente do
   *  vínculo durável de consultoria. As duas contam porque as duas são gente
   *  entrando na fazenda. */
  visitas12m: number;
  pessoas: PessoaEquipe[];
}

export function equipeVazia(): Equipe {
  return { colaboradores: 0, colaboradoresAtivos: 0, tecnicosVinculados: 0, visitas12m: 0, pessoas: [] };
}

function mapearPessoa(l: Linha): PessoaEquipe {
  const papelBruto = texto(l.papel);
  const permissoes = Array.isArray(l.permissoes)
    ? l.permissoes.filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    : null;

  return {
    usuarioId: inteiro(l.usuario_id),
    nome: texto(l.nome) ?? 'Sem nome',
    // Papel fora da união fechada vira null e a tela mostra "Sem papel" — é o
    // que o banco de fato diz. Adotar um default inventaria permissão.
    papel: papelBruto !== null && (PAPEIS as readonly string[]).includes(papelBruto) ? (papelBruto as Papel) : null,
    // `ativo` NULL é conta legada, e legada está ATIVA: o app só barra em false.
    ativo: booleano(l.ativo, true),
    vinculo: umVinculo(l.vinculo),
    permissoes,
    ultimoLancamentoEm: texto(l.ultimo_lancamento_em),
    propriedades: 1,
  };
}

const VINCULOS: readonly PropriedadeEscopo['vinculo'][] = ['dono', 'herdado', 'consultoria', 'associacao'];

function umVinculo(v: unknown): PropriedadeEscopo['vinculo'] {
  const s = texto(v);
  return s !== null && (VINCULOS as readonly string[]).includes(s) ? (s as PropriedadeEscopo['vinculo']) : 'dono';
}

/** Mesmo peso de `ordenarPropriedades()` em escopo.ts — a lista de pessoas sai
 *  na mesma ordem mental do seletor: o dono, depois quem herda, depois quem
 *  atende de fora. */
const PESO_VINCULO: Record<PropriedadeEscopo['vinculo'], number> = {
  dono: 0,
  herdado: 1,
  consultoria: 2,
  associacao: 3,
};

function ordenarPessoas(pessoas: PessoaEquipe[]): PessoaEquipe[] {
  return [...pessoas].sort((a, b) => {
    const dv = PESO_VINCULO[a.vinculo] - PESO_VINCULO[b.vinculo];
    if (dv !== 0) return dv;
    // Inativo por último dentro do mesmo vínculo: quem está trabalhando hoje é
    // o que a aba responde primeiro.
    if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
    const dn = a.nome.localeCompare(b.nome, 'pt-BR');
    return dn !== 0 ? dn : a.usuarioId - b.usuarioId;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/** Projeção explícita, nunca `select('*')` — a mesma disciplina de queries.ts. */
const COLUNAS: readonly (keyof LinhaEquipe)[] = [
  'propriedade_id',
  'colaboradores',
  'colaboradores_ativos',
  'tecnicos_vinculados',
  'visitas_12m',
  'pessoas',
];

/**
 * A equipe de UMA propriedade. Uma leitura só: `pessoas` chega como coluna
 * jsonb da própria linha, no padrão de `adm.propriedade_visao_geral` — não como
 * view lateral.
 *
 * Propriedade sem linha na view é caso legítimo (fazenda recém-criada): devolve
 * equipe zerada, não erro. Zero colaborador é informação comercial — inclusive
 * de venda, porque plano Iniciante não dá direito a nenhum.
 */
export async function getEquipe(propriedadeId: number): Promise<Resultado<Equipe>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FASE_2.equipe;
  const resposta = (await supa
    .from(view)
    .select(COLUNAS.join(','))
    .eq('propriedade_id', propriedadeId)
    .limit(1)) as unknown as { data: unknown[] | null; error: ErroPostgrest | null };

  if (resposta.error) return falha<Equipe>(view, resposta.error);

  const l = comoLinhas(resposta.data)[0];
  if (!l) return ok(equipeVazia());

  return ok({
    colaboradores: inteiro(l.colaboradores),
    colaboradoresAtivos: inteiro(l.colaboradores_ativos),
    tecnicosVinculados: inteiro(l.tecnicos_vinculados),
    visitas12m: inteiro(l.visitas_12m),
    pessoas: ordenarPessoas(comoLinhas(l.pessoas).map(mapearPessoa)),
  });
}

/**
 * Consolidação para o técnico com carteira. As contagens SOMAM porque são fatos
 * por fazenda — `tecnicosVinculados` conta VÍNCULOS, e o mesmo consultor
 * atendendo três fazendas conta três vezes (a tela diz isso no card).
 *
 * As PESSOAS, ao contrário, são deduplicadas por `usuario_id`: um consultor que
 * atende três fazendas é uma pessoa, e listá-lo três vezes faria a aba
 * responder "quantos vínculos existem" quando a pergunta é "quem mexe nesta
 * conta". A recência fica com a MAIS RECENTE das fazendas, e o vínculo com o
 * mais forte (dono > herdado > consultoria > associação).
 */
export function consolidarEquipes(equipes: Equipe[]): Equipe {
  if (equipes.length === 1) return equipes[0];

  const total = equipeVazia();
  const porUsuario = new Map<number, PessoaEquipe>();

  for (const eq of equipes) {
    total.colaboradores += eq.colaboradores;
    total.colaboradoresAtivos += eq.colaboradoresAtivos;
    total.tecnicosVinculados += eq.tecnicosVinculados;
    total.visitas12m += eq.visitas12m;

    for (const pessoa of eq.pessoas) {
      const anterior = porUsuario.get(pessoa.usuarioId);
      if (!anterior) {
        porUsuario.set(pessoa.usuarioId, { ...pessoa });
        continue;
      }
      anterior.propriedades += 1;
      if (PESO_VINCULO[pessoa.vinculo] < PESO_VINCULO[anterior.vinculo]) anterior.vinculo = pessoa.vinculo;
      // Comparação de ISO como texto: os dois vêm do mesmo timestamptz do
      // Postgres, no mesmo formato, e ordenar string evita dois `new Date()`
      // por pessoa só para descobrir qual é maior.
      if (
        pessoa.ultimoLancamentoEm !== null &&
        (anterior.ultimoLancamentoEm === null || pessoa.ultimoLancamentoEm > anterior.ultimoLancamentoEm)
      ) {
        anterior.ultimoLancamentoEm = pessoa.ultimoLancamentoEm;
      }
    }
  }

  total.pessoas = ordenarPessoas([...porUsuario.values()]);
  return total;
}
