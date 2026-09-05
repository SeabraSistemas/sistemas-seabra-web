import type { Escopo, Papel, PropriedadeEscopo, UsuarioLista } from '@/lib/adm/types';

/**
 * Resolução de escopo: traduzir "um usuário" para "quais propriedades".
 * Módulo PURO — quem lê o banco é queries.ts; aqui só mora a regra.
 *
 * Por que isto é um arquivo e não três linhas dentro da página: o tenant real do
 * banco é `propriedade_id` (93 tabelas o carregam), NÃO `usuario_id`. A hipótese
 * "1 usuário = 1 propriedade" é falsa para 3 dos 5 papéis, e é falsa exatamente
 * nos casos que mais importam comercialmente (o consultor com carteira e o admin
 * de associação). Uma tela que assume a hipótese não dá erro: ela mostra a
 * fazenda errada, ou nenhuma.
 *
 * A resolução acontece em SQL com service_role e NUNCA pela RLS — o branch de
 * admin global do helper app_propriedades_acessiveis() testa `tipo_usuario_id = 1`
 * e ninguém tem esse valor hoje: pela RLS, o admin não enxergaria nada.
 */

/** Sentinela de URL (?prop=todas) para a visão consolidada de quem tem várias. */
export const TODAS = 'todas';

export type SelecaoPropriedade = number | typeof TODAS | null | undefined;

/**
 * Como cada papel alcança uma propriedade. É a mesma tabela do desenho, em
 * código, para a tela poder explicar de onde veio o dado que está mostrando.
 */
export const REGRA_DE_ESCOPO: Record<Papel, { vinculo: PropriedadeEscopo['vinculo'] | null; origem: string }> = {
  produtor: { vinculo: 'dono', origem: 'propriedades.produtor_id' },
  colaborador: { vinculo: 'herdado', origem: 'usuarios.propriedade_id (a fazenda do produtor dono)' },
  tecnico: { vinculo: 'consultoria', origem: "tecnico_propriedades com status='ativo'" },
  admin_associacao: { vinculo: 'associacao', origem: 'propriedades dos filiados da associação' },
  // Admin geral alcança tudo, por várias origens ao mesmo tempo — não há um
  // vínculo único que descreva a linha, então cada propriedade traz o seu.
  administrador: { vinculo: null, origem: 'todas as propriedades' },
};

const ROTULO_VINCULO: Record<PropriedadeEscopo['vinculo'], string> = {
  dono: 'Propriedade própria',
  herdado: 'Fazenda do produtor',
  consultoria: 'Cliente de consultoria',
  associacao: 'Filiado da associação',
};

export function rotuloDeVinculo(vinculo: PropriedadeEscopo['vinculo']): string {
  return ROTULO_VINCULO[vinculo];
}

/**
 * Ordem estável do seletor: primeiro a propriedade do próprio usuário, depois as
 * de terceiros pelo tamanho do rebanho. Determinística até no empate (desempate
 * por nome e por id) porque a "primeira propriedade" é o default da tela — uma
 * ordenação instável faria o dashboard abrir numa fazenda diferente a cada
 * request, sem ninguém entender por quê.
 */
export function ordenarPropriedades(propriedades: PropriedadeEscopo[]): PropriedadeEscopo[] {
  const peso: Record<PropriedadeEscopo['vinculo'], number> = { dono: 0, herdado: 1, consultoria: 2, associacao: 3 };
  return [...propriedades].sort((a, b) => {
    const dp = peso[a.vinculo] - peso[b.vinculo];
    if (dp !== 0) return dp;
    const da = b.animais_ativos - a.animais_ativos;
    if (da !== 0) return da;
    const dn = a.nome.localeCompare(b.nome, 'pt-BR');
    return dn !== 0 ? dn : a.id - b.id;
  });
}

/**
 * True quando ?prop=<id> aponta para uma propriedade que este usuário NÃO
 * alcança. A tela precisa dizer isso em voz alta: cair em silêncio na fazenda
 * "mais parecida" é como um painel mostra o dado de um cliente sob o nome de
 * outro.
 */
export function selecaoForaDoEscopo(propriedades: PropriedadeEscopo[], selecao: SelecaoPropriedade): boolean {
  if (typeof selecao !== 'number') return false;
  return !propriedades.some((p) => p.id === selecao);
}

/**
 * Papéis cuja tela só faz sentido ancorada em UMA fazenda. Produtor e
 * colaborador vivem numa propriedade só (o trigger upsert_propriedade_trigger
 * funde as do produtor: 30 dos 31 têm exatamente uma); técnico, admin de
 * associação e admin geral têm carteira, e para eles o consolidado é a visão
 * padrão legítima.
 */
function ancoraNumaPropriedade(papel: Papel | null): boolean {
  return papel === 'produtor' || papel === 'colaborador';
}

export function resolverEscopo(
  usuario: UsuarioLista,
  propriedades: PropriedadeEscopo[],
  selecao: SelecaoPropriedade = null,
): Escopo {
  const lista = ordenarPropriedades(propriedades);

  // Seletor vira rótulo estático com 0 ou 1 propriedade — que é o caso de quase
  // toda a base. Um <select> de um item só é ruído.
  const colapsado = lista.length <= 1;

  let selecionada: PropriedadeEscopo | null = null;
  if (lista.length === 0) {
    selecionada = null;
  } else if (selecao === TODAS) {
    // Consolidado pedido explicitamente. Com uma propriedade só, "todas" e "a
    // única" são a mesma coisa — mostrar a única evita uma tela agregada de 1.
    selecionada = lista.length === 1 ? lista[0] : null;
  } else if (typeof selecao === 'number') {
    // Id fora do escopo => consolidado (null), NUNCA outra fazenda no lugar.
    //
    // Com UMA propriedade só, porém, "consolidado" e "a única" são exatamente o
    // mesmo conjunto — e cair em null aqui apagava o banner "dados de <dono>"
    // enquanto `idsDoEscopo()` continuava devolvendo a fazenda herdada: a tela
    // mostrava o rebanho de outra pessoa sem dizer de quem era. Mostrar a única
    // não é "outra fazenda no lugar", é a mesma que o escopo já tinha.
    const achada = lista.find((p) => p.id === selecao);
    selecionada = achada ?? (lista.length === 1 ? lista[0] : null);
  } else if (lista.length === 1) {
    selecionada = lista[0];
  } else {
    selecionada = ancoraNumaPropriedade(usuario.papel) ? lista[0] : null;
  }

  return { usuario, propriedades: lista, selecionada, colapsado };
}

/**
 * Os `propriedade_id` que uma consulta deve filtrar. É a fronteira de tenant do
 * /adm inteiro: consolidado devolve TODAS as do escopo, seleção devolve uma.
 *
 * Devolver [] significa "este usuário não alcança propriedade nenhuma" — e quem
 * consome PRECISA tratar isso como conjunto vazio, jamais como "sem filtro".
 * Um `.in('propriedade_id', [])` que virasse consulta sem WHERE devolveria a
 * base inteira sob o nome de um colaborador. queries.ts corta antes de consultar.
 */
export function idsDoEscopo(escopo: Escopo): number[] {
  if (escopo.selecionada) return [escopo.selecionada.id];
  return escopo.propriedades.map((p) => p.id);
}

/** True quando a tela está agregando mais de uma fazenda (carteira do consultor). */
export function escopoConsolidado(escopo: Escopo): boolean {
  return escopo.selecionada === null && escopo.propriedades.length > 1;
}

/** Rótulo do seletor — o que aparece quando ele está colapsado. */
export function rotuloDoEscopo(escopo: Escopo): string {
  if (escopo.selecionada) return escopo.selecionada.nome;
  if (escopo.propriedades.length === 0) return 'Sem propriedade';
  return `Todas as propriedades (${escopo.propriedades.length})`;
}

/**
 * Banner obrigatório quando os dados na tela não são do usuário aberto.
 *
 * Dois casos que sem aviso parecem bug:
 *  · colaborador — o rebanho é do produtor dono, não dele;
 *  · propriedade de consultoria — `propriedades.produtor_id IS NULL` não é dado
 *    faltando, é o marcador canônico de que a fazenda é cliente de um técnico.
 *    Sem o banner, a ficha aparece sem produtor e a tela parece quebrada.
 *
 * Também é a fronteira jurídica: dado de cliente de consultoria pertence a quem
 * não usa o app e não assinou nada com a Sistema Seabra.
 */
export function avisoDeOrigem(escopo: Escopo): string | null {
  const alvo = escopo.selecionada;
  if (!alvo) {
    if (escopo.propriedades.length === 0) {
      return escopo.usuario.papel === 'admin_associacao'
        ? 'Admin de associação não tem propriedade própria — o que aparece aqui é o agregado dos filiados.'
        : 'Este usuário não alcança nenhuma propriedade.';
    }
    return escopoConsolidado(escopo)
      ? `Visão consolidada de ${escopo.propriedades.length} propriedades — os números somam fazendas de donos diferentes.`
      : null;
  }
  if (alvo.vinculo === 'herdado') {
    return `Dados da fazenda${alvo.dono_nome ? ` de ${alvo.dono_nome}` : ''} — ${escopo.usuario.nome} é colaborador, não dono.`;
  }
  if (alvo.vinculo === 'consultoria') {
    return `Propriedade de consultoria${alvo.dono_nome ? ` (${alvo.dono_nome})` : ''} — atendida por ${escopo.usuario.nome}, que não é o dono dos dados.`;
  }
  if (alvo.vinculo === 'associacao') {
    return `Filiado da associação${alvo.dono_nome ? ` — dados de ${alvo.dono_nome}` : ''}.`;
  }
  return null;
}

/**
 * Total de animais do escopo. Somar por PROPRIEDADE e nunca por usuário: um
 * produtor e o colaborador dele apontam para a mesma fazenda pelas duas pernas
 * do vínculo (`usuarios.propriedade_id` e `propriedades.produtor_id`), e somar
 * por usuário conta o mesmo rebanho duas vezes.
 */
export function animaisDoEscopo(escopo: Escopo): number {
  const alvo = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const unicas = new Map(alvo.map((p) => [p.id, p.animais_ativos]));
  let total = 0;
  for (const n of unicas.values()) total += n;
  return total;
}

/**
 * `?prop=` cru para seleção tipada. Vive aqui porque `escopo.ts` já é o dono de
 * `TODAS` e de `SelecaoPropriedade` — antes desta função a mesma lógica estava
 * copiada em seis arquivos, e uma das cópias divergia no tipo.
 *
 * Id que não pertence ao escopo NÃO vira "a propriedade mais parecida": cai em
 * null, e resolverEscopo() devolve o consolidado — que é visivelmente outra
 * coisa na tela, em vez de dado de outra fazenda passando por certo.
 */
export function lerSelecaoParam(bruto: string | string[] | null | undefined): SelecaoPropriedade {
  const texto = Array.isArray(bruto) ? bruto[0] : bruto;
  if (!texto) return null;
  if (texto === TODAS) return TODAS;
  return /^\d+$/.test(texto) ? Number(texto) : null;
}
