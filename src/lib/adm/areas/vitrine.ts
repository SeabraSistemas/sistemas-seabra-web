import 'server-only';

import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { VIEWS_FASE_2, type LinhaVitrine } from '@/lib/adm/areas/contrato';
import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * Área VITRINE E CONSENTIMENTO — a aba de LGPD, e a mais delicada do painel.
 *
 * A pergunta que ela responde é uma só, e é operacional: **posso publicar a foto
 * deste animal?** Todo o resto da tela existe para justificar essa resposta.
 * Daí a forma deste módulo: em vez de devolver dez campos para o JSX combinar na
 * mão, ele devolve um ESTADO calculado, com a resposta e o motivo já resolvidos.
 *
 * Por que o cálculo mora aqui, e não na tela: combinar `publicado`,
 * `bloqueado_admin`, `consentido_em` e `revogado_em` em JSX é como se produz o
 * bug clássico dessa família — a página que mostra "publicado" porque leu só a
 * primeira flag, enquanto o titular revogou o consentimento na semana passada.
 * Errar isso não é um número torto num dashboard: é publicar dado pessoal de
 * quem pediu para sair.
 *
 * ORDEM DE PRECEDÊNCIA (a ordem importa, e é esta):
 *   1. revogado    — o titular voltou atrás. É o sinal jurídico mais forte.
 *   2. bloqueado   — nós desligamos, por moderação.
 *   3. sem consentimento — nunca aceitou o termo.
 *   4. consentido, oculto — aceitou e a vitrine está desligada.
 *   5. publicado.
 * O banco reforça parte disso com um CHECK (`ativo` só pode ser true se
 * `consentido_em` não for nulo), mas a tela não pode DEPENDER do CHECK: ela lê
 * uma view, e uma view não valida nada.
 *
 * O QUE ESTE MÓDULO DELIBERADAMENTE NÃO FAZ: decidir que versão de termo
 * desatualizada invalida o consentimento. `versaoDesatualizada()` devolve um
 * booleano e para aí. Termo novo nem sempre significa recoletar — pode ter sido
 * correção de redação — e essa é uma leitura jurídica, não uma regra de código.
 * A tela DESTACA; quem decide é gente.
 *
 * SOMENTE LEITURA (D3). Bloquear e desbloquear continua sendo no app.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local — ver a nota gêmea em areas/equipe.ts
// ─────────────────────────────────────────────────────────────────────────────

const SQL_AREAS = 'supabase/adm/adm_07_areas.sql';

type ErroPostgrest = { message: string; code?: string };
type Linha = Record<string, unknown>;

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

function inteiro(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? Math.round(v) : 0;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return 0;
}

function booleano(v: unknown): boolean {
  return v === true || v === 't' || v === 'true';
}

// ─────────────────────────────────────────────────────────────────────────────
// Forma que a tela consome
// ─────────────────────────────────────────────────────────────────────────────

export interface Vitrine {
  usuarioId: number;
  /** `vitrine_criador.ativo` — a vitrine deste criador aparece no site. */
  publicado: boolean;
  bloqueadoAdmin: boolean;
  consentidoEm: string | null;
  /** Como o consentimento foi colhido. O app grava 'app'; outros canais existem
   *  como texto livre e chegam crus — inventar um mapa de rótulos aqui faria um
   *  canal novo aparecer vazio na tela. */
  consentidoCanal: string | null;
  consentidoVersao: string | null;
  /** Versão vigente de `vitrine_termo`. Null = nenhum termo marcado vigente,
   *  que é um problema de configuração, não do criador. */
  termoVigente: string | null;
  revogadoEm: string | null;
  revogadoMotivo: string | null;
  animaisPublicados: number;
  animaisOcultos: number;
  atualizadoEm: string | null;
}

/**
 * `fora` é o estado de quem NUNCA entrou na vitrine — não existe linha em
 * `vitrine_criador`. É diferente de "revogou" e de "está oculto", e a tela
 * precisa dizer isso: um criador que nunca foi convidado não é um criador que
 * saiu.
 */
export type EstadoVitrine =
  | 'fora'
  | 'revogado'
  | 'bloqueado'
  | 'sem-consentimento'
  | 'consentido-oculto'
  | 'publicado';

export interface InfoEstado {
  rotulo: string;
  /** A resposta de dois segundos para "posso publicar a foto deste animal?". */
  podePublicar: boolean;
  resposta: string;
  explicacao: string;
  /** Classe do bloco de status. Segue o precedente de PAPEL_INFO em types.ts e
   *  do health score em CabecalhoUsuario.tsx: paleta do Tailwind para sinal
   *  semântico, token para o destrutivo — nunca cor crua. */
  classe: string;
}

export const ESTADO_VITRINE: Record<EstadoVitrine, InfoEstado> = {
  publicado: {
    rotulo: 'Publicado',
    podePublicar: true,
    resposta: 'Sim — há consentimento válido e a vitrine está no ar',
    explicacao:
      'O criador aceitou o termo e a vitrine dele aparece no site. Continua valendo animal a animal: ' +
      'só vai ao ar o que estiver marcado como publicado na lista de animais.',
    classe: 'border-emerald-900/60 bg-emerald-950/40 text-emerald-300',
  },
  'consentido-oculto': {
    rotulo: 'Consentido, fora do ar',
    podePublicar: false,
    resposta: 'Não — há consentimento, mas a vitrine está desligada',
    explicacao:
      'O criador aceitou o termo e `vitrine_criador.ativo` está falso. É o estado de quem consentiu e ' +
      'ainda não foi ao ar, ou foi tirado do ar sem revogar. Ligar é no app.',
    classe: 'border-amber-900/60 bg-amber-950/40 text-amber-300',
  },
  'sem-consentimento': {
    rotulo: 'Sem consentimento',
    podePublicar: false,
    resposta: 'Não — este criador nunca aceitou o termo',
    explicacao:
      'A linha da vitrine existe, mas `consentido_em` está vazio. Sem aceite não há base legal para ' +
      'publicar nada deste criador — nem foto, nem genealogia, nem produção.',
    classe: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  bloqueado: {
    rotulo: 'Bloqueado pela administração',
    podePublicar: false,
    resposta: 'Não — bloqueado por nós, independente do consentimento',
    explicacao:
      '`bloqueado_admin` está ligado: a moderação da Sistema Seabra tirou este criador do ar. O bloqueio ' +
      'vence qualquer consentimento — e continua valendo mesmo que o criador reative a vitrine no app.',
    classe: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  revogado: {
    rotulo: 'Consentimento revogado',
    podePublicar: false,
    resposta: 'Não — o titular voltou atrás',
    explicacao:
      'O criador revogou o consentimento. É o sinal mais forte da tela: publicar qualquer coisa dele a ' +
      'partir daqui é tratar dado pessoal de quem pediu para sair. Só um novo aceite reabre.',
    classe: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  fora: {
    rotulo: 'Fora da vitrine',
    podePublicar: false,
    resposta: 'Não — este criador nunca entrou na vitrine',
    explicacao:
      'Não existe linha em `vitrine_criador` para este criador. Não é recusa nem revogação: é ausência. ' +
      'Entrar na vitrine começa com o convite e o aceite do termo, dentro do app.',
    classe: 'border-border bg-card text-muted-foreground',
  },
};

/**
 * O estado, na ordem de precedência do cabeçalho. `null` (sem linha) é 'fora'.
 *
 * ⚠️ Nunca reordenar por conveniência de layout. Se `publicado` fosse testado
 * antes de `revogado`, uma linha com as duas coisas — que o banco permite,
 * porque o CHECK só amarra `ativo` a `consentido_em` — apareceria verde.
 */
export function estadoDaVitrine(v: Vitrine | null): EstadoVitrine {
  if (v === null) return 'fora';
  if (v.revogadoEm !== null) return 'revogado';
  if (v.bloqueadoAdmin) return 'bloqueado';
  if (v.consentidoEm === null) return 'sem-consentimento';
  if (!v.publicado) return 'consentido-oculto';
  return 'publicado';
}

/**
 * True quando a versão aceita difere da vigente — o caso que EXIGE olhar humano
 * e, muitas vezes, recoletar.
 *
 * Os dois nulos são tratados como "não dá para comparar", não como divergência:
 * termo vigente ausente é configuração faltando (`vitrine_termo.vigente` sem
 * nenhuma linha marcada), e criador sem versão aceita já cai em
 * 'sem-consentimento' antes de chegar aqui. Chamar qualquer um dos dois de
 * "versão desatualizada" mandaria o Felipe cobrar reconsentimento de quem não
 * deve nada.
 */
export function versaoDesatualizada(v: Vitrine | null): boolean {
  if (v === null || v.consentidoVersao === null || v.termoVigente === null) return false;
  return v.consentidoVersao !== v.termoVigente;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

const COLUNAS: readonly (keyof LinhaVitrine)[] = [
  'usuario_id',
  'publicado',
  'bloqueado_admin',
  'consentido_em',
  'consentido_canal',
  'consentido_versao',
  'termo_vigente',
  'revogado_em',
  'revogado_motivo',
  'animais_publicados',
  'animais_ocultos',
  'atualizado_em',
];

/**
 * O consentimento de um CRIADOR. Ancorada em `usuario_id` — é a única view de
 * área que não é por propriedade, e de propósito: a resposta sobre publicar é do
 * titular, não da fazenda. A ponte no banco é `propriedades.produtor_id`, feita
 * dentro da view.
 *
 * `null` é um resultado LEGÍTIMO e frequente, e cobre três casos que a tela
 * separa: criador que nunca entrou na vitrine; conta que não é de produtor
 * (colaborador e técnico não têm vitrine própria); e propriedade de consultoria,
 * cujo `produtor_id` é NULL — não há titular no sistema para consentir, que é
 * exatamente o que a view existe para impedir de publicar.
 */
export async function getVitrine(usuarioId: number): Promise<Resultado<Vitrine | null>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FASE_2.vitrine;
  const resposta = (await supa
    .from(view)
    .select(COLUNAS.join(','))
    .eq('usuario_id', usuarioId)
    .limit(1)) as unknown as { data: unknown[] | null; error: ErroPostgrest | null };

  if (resposta.error) return falha<Vitrine | null>(view, resposta.error);

  const linhas = Array.isArray(resposta.data) ? resposta.data : [];
  const l = linhas.find((x): x is Linha => typeof x === 'object' && x !== null);
  if (!l) return ok(null);

  return ok({
    usuarioId: inteiro(l.usuario_id),
    publicado: booleano(l.publicado),
    bloqueadoAdmin: booleano(l.bloqueado_admin),
    consentidoEm: texto(l.consentido_em),
    consentidoCanal: texto(l.consentido_canal),
    consentidoVersao: texto(l.consentido_versao),
    termoVigente: texto(l.termo_vigente),
    revogadoEm: texto(l.revogado_em),
    revogadoMotivo: texto(l.revogado_motivo),
    animaisPublicados: inteiro(l.animais_publicados),
    animaisOcultos: inteiro(l.animais_ocultos),
    atualizadoEm: texto(l.atualizado_em),
  });
}
