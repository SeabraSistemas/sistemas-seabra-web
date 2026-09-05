'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Copy } from 'lucide-react';

import { AdmTable, type AdmColuna } from '@/components/adm/AdmTable';
import { filtrarLinhas, lerFiltros, type FacetaDef } from '@/components/adm/AdmFilters';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import {
  VAZIO,
  formatarData,
  formatarDataRelativa,
  formatarInteiro,
  formatarMoeda,
} from '@/lib/adm/format';
import type { LinhaCarteiraConsultor, LinhaConsultor } from '@/lib/adm/areas/contrato';
import { cn } from '@/lib/utils';

/**
 * A SUPERFÍCIE CLIENTE DA CONSULTORIA — as duas grades e o vocabulário visual
 * que elas compartilham com o perfil do consultor.
 *
 * São duas tabelas irmãs porque a área tem duas perguntas:
 *   <ListaConsultores>   quem são os técnicos e quanto de carteira cada um tem
 *   <CarteiraConsultor>  quais fazendas um técnico atende (e quais têm dono no app)
 *
 * As duas moram no mesmo arquivo, e não em dois, porque compartilham o
 * vocabulário: o chip de habilitação, a barra de vagas e o chip de status.
 * Separá-las obrigaria a exportar esse vocabulário para um terceiro lugar ou —
 * pior — a duplicá-lo, que é como duas telas da mesma área passam a pintar o
 * mesmo estado de cores diferentes.
 *
 * NADA aqui importa de `areas/consultoria`, nem tipo. O módulo de leitura abre
 * com `import 'server-only'` e existe justamente para ser inalcançável do
 * browser; um `import type` seria apagado na compilação e provavelmente
 * funcionaria, mas "provavelmente" não é o padrão desta pasta — a <AdmTable>
 * chegou a duplicar a string `SUFIXO_ROTULO` pelo mesmo motivo. O tipo da linha
 * da carteira é escrito aqui a partir do CONTRATO (`areas/contrato.ts`, que é
 * puro), e a checagem estrutural do TypeScript garante que ele e o que a query
 * devolve continuem sendo a mesma coisa.
 *
 * POR QUE NÃO HÁ CAMPO DE BUSCA aqui, ao contrário da lista mestra: são dezenas
 * de técnicos, não milhares de contas. A busca da <ListaUsuarios> existe para
 * achar uma conta em 2 segundos numa base grande; aqui as facetas e a ordenação
 * de coluna já fazem isso, e um campo a menos é um estado a menos na URL.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulário visual da área
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A máquina de 4 estados de `perfil_tecnico.habilitacao_aml_status` (CHECK na
 * tabela — a lista é fechada no banco, não uma convenção).
 *
 * Ela responde por COMPETÊNCIA, não por pagamento: AML e Medidas são o fluxo
 * GRATUITO, a convite do produtor, e nunca consultam assinatura. Um técnico pode
 * estar aprovado aqui e não ter plano nenhum de consultoria — e vice-versa.
 */
const HABILITACAO_INFO: Record<string, { rotulo: string; classe: string; titulo: string }> = {
  aprovada: {
    rotulo: 'Habilitado',
    classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40',
    titulo: 'Pode fazer AML e Medidas (fluxo grátis, a convite do produtor)',
  },
  pendente: {
    rotulo: 'Pendente',
    classe: 'text-amber-300 border-amber-900/60 bg-amber-950/40',
    titulo: 'Solicitou habilitação e está esperando aprovação do Admin Geral',
  },
  rejeitada: {
    rotulo: 'Rejeitada',
    classe: 'text-destructive border-destructive/40 bg-destructive/10',
    titulo: 'Habilitação negada — o motivo fica em perfil_tecnico.habilitacao_motivo_rejeicao',
  },
  nao_solicitada: {
    rotulo: 'Não pediu',
    classe: 'text-muted-foreground border-border bg-secondary',
    titulo: 'Tem perfil técnico, mas nunca solicitou a habilitação para AML',
  },
};

/** Ordem dos chips na faceta: do fim do funil para o começo. `sem_perfil` é o
 *  valor sintético do `null` — ver <ChipHabilitacao>. */
const HABILITACOES = ['aprovada', 'pendente', 'rejeitada', 'nao_solicitada', 'sem_perfil'];

/**
 * O chip de habilitação AML.
 *
 * `null` NÃO é 'nao_solicitada': um nunca criou perfil técnico (a linha em
 * `perfil_tecnico` não existe), o outro criou e não pediu. A diferença é de
 * ação — o primeiro é um cadastro incompleto, o segundo é um técnico que decidiu
 * não pedir — e colapsar os dois num rótulo só apagaria essa distinção.
 */
export function ChipHabilitacao({ status, className }: { status: string | null; className?: string }) {
  const info = status ? HABILITACAO_INFO[status] : undefined;

  if (!info) {
    return (
      <span
        title={
          status
            ? `Valor fora do CHECK da tabela: "${status}"`
            : 'Sem linha em perfil_tecnico — o técnico nunca preencheu o perfil profissional'
        }
        className={cn(
          'whitespace-nowrap rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground',
          className,
        )}
      >
        {status ?? 'Sem perfil'}
      </span>
    );
  }

  return (
    <span
      title={info.titulo}
      className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', info.classe, className)}
    >
      {info.rotulo}
    </span>
  );
}

/**
 * Espelha a forma de STATUS_INFO da <ListaUsuarios>. Mora aqui, e não no
 * contrato, porque isto é APRESENTAÇÃO — o dado canônico é `status_efetivo`,
 * vindo de `adm.assinatura_normalizada`, e nunca `assinaturas.status` cru.
 */
const STATUS_INFO: Record<string, { rotulo: string; classe: string }> = {
  ativa: { rotulo: 'Ativa', classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40' },
  trial: { rotulo: 'Trial', classe: 'text-sky-300 border-sky-900/60 bg-sky-950/40' },
  pendente: { rotulo: 'Pendente', classe: 'text-amber-300 border-amber-900/60 bg-amber-950/40' },
  vencida: { rotulo: 'Vencida', classe: 'text-destructive border-destructive/40 bg-destructive/10' },
  cancelada: { rotulo: 'Cancelada', classe: 'text-muted-foreground border-border bg-secondary' },
};

const STATUS = ['ativa', 'trial', 'pendente', 'vencida', 'cancelada'];

/** Status da assinatura técnica. Sem assinatura nenhuma é traço, não "cancelada":
 *  quem nunca assinou não cancelou nada. */
export function ChipStatusAssinatura({ status, className }: { status: string | null; className?: string }) {
  const info = status ? STATUS_INFO[status] : undefined;
  if (!info) {
    return (
      <span className={cn('text-muted-foreground', className)} title="Nenhuma assinatura de plano técnico">
        {status ?? VAZIO}
      </span>
    );
  }
  return (
    <span className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', info.classe, className)}>
      {info.rotulo}
    </span>
  );
}

/**
 * VAGAS DA CARTEIRA — a barra "3/7".
 *
 * A cor da carteira cheia é o ACENTO OCRE (`bg-primary`), não o vermelho de
 * alerta: carteira cheia não é um defeito do técnico, é o limite do plano que
 * ele já pagou — ou seja, o momento exato de vender o upgrade. Pintar de
 * vermelho ensinaria o olho a evitar justamente a linha que dá dinheiro.
 *
 * `cheia` vem do SQL (`consultores_lista.carteira_cheia`) e não é recalculado
 * aqui de propósito: o limite tem que ser o MESMO que o RPC de vínculo usa para
 * deixar o técnico cadastrar mais uma fazenda, senão a tela acusa lotação em
 * quem ainda pode vender.
 *
 * Sem limite conhecido (nenhuma assinatura técnica com acesso ativo) as vagas
 * contratadas são ZERO — então qualquer vínculo já é carteira sem vaga, e a
 * barra fica cheia mesmo com `cheia = false`. Não é contradição: o SQL responde
 * "passou do limite do plano" e o plano não existe.
 */
export function BarraCarteira({
  usados,
  limite,
  cheia,
  /** Falso no card do perfil, onde o "3 / 7" já é o número grande do card e
   *  repeti-lo ao lado da barra seria o mesmo dado duas vezes. */
  mostrarNumeros = true,
  className,
}: {
  usados: number;
  limite: number | null;
  cheia: boolean;
  mostrarNumeros?: boolean;
  className?: string;
}) {
  const semPlano = limite == null || limite <= 0;
  const semVaga = semPlano ? usados > 0 : cheia;
  const fracao = semPlano ? (usados > 0 ? 1 : 0) : Math.min(1, usados / limite);

  return (
    <span className={cn('inline-flex min-w-28 items-center gap-2', className)}>
      <span className="h-1.5 w-14 shrink-0 rounded-full bg-secondary" aria-hidden>
        <span
          className={cn('block h-full rounded-full', semVaga ? 'bg-primary' : 'bg-muted-foreground')}
          style={{ width: `${Math.round(fracao * 100)}%` }}
        />
      </span>
      {mostrarNumeros && (
        <span className={cn('whitespace-nowrap tabular-nums', semVaga && 'text-primary')}>
          {formatarInteiro(usados)}
          <span className="text-muted-foreground">/{semPlano ? VAZIO : formatarInteiro(limite)}</span>
        </span>
      )}
      {semPlano && usados > 0 && (
        <span
          className="whitespace-nowrap text-[10px] text-primary"
          title="Atende fazendas sem nenhuma assinatura de plano técnico com acesso ativo"
        >
          sem plano
        </span>
      )}
    </span>
  );
}

/** O balde de carteira, usado pela faceta e pela ordenação. Uma definição só:
 *  duas listas paralelas divergem no primeiro balde novo. */
function baldeCarteira(c: LinhaConsultor): string {
  if (c.limite_propriedades == null) return c.vinculos_ativos > 0 ? 'sem_plano' : 'sem_produto';
  if (c.carteira_cheia) return 'cheia';
  return c.vinculos_ativos === 0 ? 'vazia' : 'com_vaga';
}

const CARTEIRA_ROTULO: Record<string, string> = {
  cheia: 'Carteira cheia (upgrade)',
  com_vaga: 'Com vaga livre',
  vazia: 'Plano sem nenhum vínculo',
  sem_plano: 'Atende sem plano ativo',
  sem_produto: 'Fora do produto de consultoria',
};

const CARTEIRA_BALDES = ['cheia', 'sem_plano', 'com_vaga', 'vazia', 'sem_produto'];

/** Vagas ainda vendáveis dentro do plano atual. Sem plano não há vaga — e o
 *  negativo (mais vínculos que o limite, possível em dado legado) vira 0. */
function vagasLivres(c: LinhaConsultor): number {
  if (c.limite_propriedades == null) return 0;
  return Math.max(0, c.limite_propriedades - c.vinculos_ativos);
}

/** Ordenação da coluna de carteira: a RAZÃO, não a contagem — 6 de 7 vale mais
 *  atenção do que 6 de 15. Mesma regra de `preenchimento()` em areas/consultoria.ts,
 *  que é quem decide a ordem inicial que chega do servidor. */
function preenchimento(c: LinhaConsultor): number {
  const limite = c.limite_propriedades;
  if (limite == null || limite <= 0) return c.vinculos_ativos > 0 ? 1 : -1;
  return c.vinculos_ativos / limite;
}

/** Profissão e especialidade são texto LIVRE do perfil (nada de lista fechada):
 *  a célula junta os dois e a faceta os oferece como vieram. */
function atuacao(c: LinhaConsultor): string | null {
  const partes = [c.profissao, c.especialidade].filter((p): p is string => !!p);
  return partes.length > 0 ? partes.join(' · ') : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// /adm/consultores — a lista
// ─────────────────────────────────────────────────────────────────────────────

export function ListaConsultores({
  consultores,
  agora,
}: {
  consultores: LinhaConsultor[];
  /** ISO do instante do servidor. Entra na <AdmTable> para os cortes de data das
   *  facetas não mudarem entre o HTML e a hidratação. */
  agora: string;
}) {
  const params = useSearchParams();
  const [copiado, setCopiado] = useState<number | null>(null);
  const timerCopia = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerCopia.current) clearTimeout(timerCopia.current);
    },
    [],
  );

  const copiar = useCallback(async (id: number) => {
    // Clipboard só existe em contexto seguro (https ou localhost). Falhar em
    // silêncio é o certo: o número continua na tela para ser selecionado à mão.
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(String(id));
      setCopiado(id);
      if (timerCopia.current) clearTimeout(timerCopia.current);
      timerCopia.current = setTimeout(() => setCopiado(null), 1500);
    } catch {
      // Permissão negada: nada a fazer, e nada a alarmar.
    }
  }, []);

  const facetas = useMemo<FacetaDef<LinhaConsultor>[]>(
    () => [
      {
        chave: 'habilitacao',
        rotulo: 'Habilitação AML',
        tipo: 'enum',
        valor: (c) => c.habilitacao_aml_status ?? 'sem_perfil',
        opcoes: HABILITACOES,
        rotuloValor: (v) => (v === 'sem_perfil' ? 'Sem perfil técnico' : (HABILITACAO_INFO[v]?.rotulo ?? v)),
      },
      {
        chave: 'carteira',
        rotulo: 'Carteira',
        tipo: 'enum',
        valor: baldeCarteira,
        opcoes: CARTEIRA_BALDES,
        rotuloValor: (v) => CARTEIRA_ROTULO[v] ?? v,
      },
      {
        chave: 'status',
        rotulo: 'Assinatura técnica',
        tipo: 'enum',
        valor: (c) => c.status_efetivo,
        opcoes: STATUS,
        rotuloValor: (v) => STATUS_INFO[v]?.rotulo ?? v,
      },
      { chave: 'plano', rotulo: 'Plano', tipo: 'enum', valor: (c) => c.plano_nome },
      { chave: 'profissao', rotulo: 'Profissão', tipo: 'enum', valor: (c) => c.profissao },
      {
        chave: 'visivel',
        rotulo: 'Visível aos produtores',
        tipo: 'enum',
        // `usuarios.ativo` aqui significa "aparece na busca de técnicos do app",
        // NÃO competência — competência é a habilitação, e são coisas que o
        // Felipe mexe em lugares diferentes.
        valor: (c) => (c.ativo ? 'sim' : 'nao'),
        opcoes: ['sim', 'nao'],
        rotuloValor: (v) => (v === 'sim' ? 'Visível' : 'Oculto no app'),
      },
      { chave: 'vinculos', rotulo: 'Vínculos ativos', tipo: 'intervalo', valor: (c) => c.vinculos_ativos, casas: 0 },
      {
        chave: 'animais',
        rotulo: 'Animais sob consultoria',
        tipo: 'intervalo',
        valor: (c) => c.animais_sob_consultoria,
        unidade: 'animais',
        casas: 0,
      },
    ],
    [],
  );

  // O MESMO recorte que a <AdmTable> vai aplicar, com as MESMAS funções dela: é
  // o que garante que o resumo se refira exatamente às linhas na tela. Recontar
  // por conta própria é como dois números da mesma tela passam a discordar.
  const filtros = useMemo(() => lerFiltros(facetas, params, agora), [facetas, params, agora]);
  const visiveis = useMemo(() => filtrarLinhas(consultores, facetas, filtros), [consultores, facetas, filtros]);

  const cheias = visiveis.filter((c) => baldeCarteira(c) === 'cheia' || baldeCarteira(c) === 'sem_plano').length;
  const vagas = visiveis.reduce((acc, c) => acc + vagasLivres(c), 0);
  const receita = visiveis.reduce((acc, c) => acc + (c.valor_real_mensal ?? 0), 0);

  const colunas = useMemo<AdmColuna<LinhaConsultor>[]>(
    () => [
      {
        chave: 'usuario_id',
        cabecalho: '#',
        familia: 'essencial',
        numerica: true,
        fixa: true,
        ordenar: (c) => c.usuario_id,
        // D1: `usuarios.id` é a identidade do painel, inclusive para o técnico —
        // é o número que o Felipe cola no suporte e na busca da lista mestra.
        celula: (c) => (
          <button
            type="button"
            onClick={() => void copiar(c.usuario_id)}
            title={`Copiar o número ${c.usuario_id}`}
            className="-mx-1 inline-flex items-center gap-1 rounded px-1 tabular-nums transition-colors hover:bg-accent"
          >
            {c.usuario_id}
            {copiado === c.usuario_id ? (
              <Check className="size-3 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-50" aria-hidden="true" />
            )}
            <span className="sr-only">{copiado === c.usuario_id ? 'copiado' : 'copiar'}</span>
          </button>
        ),
      },
      {
        chave: 'nome',
        cabecalho: 'Nome',
        familia: 'essencial',
        ordenar: (c) => c.nome,
        // O clique na linha abre o painel do registro (decisão da <AdmTable>); o
        // nome é o atalho explícito para o perfil do consultor.
        celula: (c) => (
          <span className="inline-flex items-center gap-1.5">
            <Link href={`/adm/c/${c.usuario_id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
              {c.nome}
            </Link>
            {!c.ativo && (
              <span
                className="shrink-0 rounded border border-border px-1 text-[10px] text-muted-foreground"
                title="usuarios.ativo = false: não aparece para os produtores no app"
              >
                oculto
              </span>
            )}
          </span>
        ),
      },
      {
        chave: 'atuacao',
        cabecalho: 'Profissão · especialidade',
        familia: 'essencial',
        ordenar: (c) => atuacao(c),
        celula: (c) => <span className="truncate text-muted-foreground">{atuacao(c) ?? VAZIO}</span>,
      },
      {
        chave: 'habilitacao',
        cabecalho: 'Habilitação AML',
        familia: 'essencial',
        ordenar: (c) => c.habilitacao_aml_status,
        celula: (c) => <ChipHabilitacao status={c.habilitacao_aml_status} />,
      },
      {
        chave: 'carteira',
        cabecalho: 'Vínculos / limite',
        familia: 'essencial',
        // Ordena pela RAZÃO — é a ordem em que a tela chega do servidor, e clicar
        // no cabeçalho tem que reproduzi-la, não uma segunda regra.
        ordenar: preenchimento,
        titulo: (c) =>
          c.limite_propriedades == null
            ? 'Sem plano técnico com acesso ativo — nenhuma vaga contratada'
            : `${formatarInteiro(vagasLivres(c))} vaga(s) livre(s) no plano ${c.plano_nome ?? 'atual'}`,
        celula: (c) => (
          <BarraCarteira usados={c.vinculos_ativos} limite={c.limite_propriedades} cheia={c.carteira_cheia} />
        ),
      },
      {
        chave: 'plano',
        cabecalho: 'Plano',
        familia: 'essencial',
        ordenar: (c) => c.plano_nome,
        celula: (c) => <span className="truncate">{c.plano_nome ?? VAZIO}</span>,
      },
      {
        chave: 'status',
        cabecalho: 'Status',
        familia: 'essencial',
        ordenar: (c) => c.status_efetivo,
        celula: (c) => <ChipStatusAssinatura status={c.status_efetivo} />,
      },
      {
        chave: 'animais_sob_consultoria',
        cabecalho: 'Animais',
        familia: 'essencial',
        numerica: true,
        ordenar: (c) => c.animais_sob_consultoria,
        titulo: () => 'Animais vivos somados nas fazendas com vínculo ativo',
        celula: (c) => <span className="tabular-nums">{formatarInteiro(c.animais_sob_consultoria)}</span>,
      },
      {
        chave: 'amls_90d',
        cabecalho: 'AMLs 90d',
        familia: 'essencial',
        numerica: true,
        ordenar: (c) => c.amls_90d,
        titulo: () => 'Avaliações morfológicas assinadas por este técnico nos últimos 90 dias, dentro ou fora da carteira paga',
        celula: (c) => <span className="tabular-nums">{formatarInteiro(c.amls_90d)}</span>,
      },
      {
        chave: 'medidas_90d',
        cabecalho: 'Medidas 90d',
        familia: 'essencial',
        numerica: true,
        ordenar: (c) => c.medidas_90d,
        celula: (c) => <span className="tabular-nums">{formatarInteiro(c.medidas_90d)}</span>,
      },
      {
        chave: 'visitas_90d',
        cabecalho: 'Visitas 90d',
        familia: 'essencial',
        numerica: true,
        ordenar: (c) => c.visitas_90d,
        titulo: () => 'Visitas técnicas solicitadas nos últimos 90 dias, canceladas fora',
        celula: (c) => <span className="tabular-nums">{formatarInteiro(c.visitas_90d)}</span>,
      },
      {
        chave: 'valor_real_mensal',
        cabecalho: 'Receita/mês',
        familia: 'detalhe',
        numerica: true,
        ordenar: (c) => c.valor_real_mensal,
        // Já normalizado por ciclo no SQL (anual dividido por 12, cortesia
        // zerada). É a assinatura DELE, não a dos produtores que ele atende.
        celula: (c) => (
          <span className="tabular-nums">{c.valor_real_mensal != null ? formatarMoeda(c.valor_real_mensal) : VAZIO}</span>
        ),
      },
      {
        chave: 'email_mascarado',
        cabecalho: 'E-mail',
        familia: 'detalhe',
        ordenar: (c) => c.email_mascarado,
        // Mascarado na view (LGPD). Mascarar no React seria teatro: o valor cru
        // já teria viajado no payload RSC e estaria no DevTools.
        celula: (c) => <span className="text-muted-foreground">{c.email_mascarado ?? VAZIO}</span>,
      },
    ],
    [copiado, copiar],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs tabular-nums text-muted-foreground">
        <span className="text-foreground">{formatarInteiro(visiveis.length)}</span> de{' '}
        {formatarInteiro(consultores.length)} técnicos ·{' '}
        <span className="text-primary">{formatarInteiro(cheias)}</span> sem vaga ·{' '}
        {formatarInteiro(vagas)} vagas livres no plano atual ·{' '}
        <span className="text-foreground">{formatarMoeda(receita)}</span>/mês na seleção
      </p>

      <AdmTable
        id="consultores"
        colunas={colunas}
        linhas={consultores}
        chave={(c) => String(c.usuario_id)}
        facetas={facetas}
        agora={agora}
        hrefLinha={(c) => `/adm/c/${c.usuario_id}`}
        substantivo="técnicos"
        vazio={
          <EstadoVazio
            titulo="Nenhum técnico com esses filtros"
            texto="A lista traz toda conta com regra_de_acesso = 'tecnico', inclusive quem tem zero vínculos — é o funil de quem ainda não virou consultor."
          />
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// /adm/c/[id] — a carteira de um consultor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A linha da carteira como esta grade precisa dela: o contrato da view mais o
 * `usuarios.id` do produtor dono, que `getCarteiraConsultor()` resolve por
 * leitura (a view devolve o NOME do proprietário e nenhum id — ver o comentário
 * de `LinhaCarteira` em areas/consultoria.ts).
 *
 * Escrito como interseção em vez de importado de lá porque aquele módulo é
 * `server-only`. Se um dia a view passar a projetar o id do dono, o campo sai
 * daqui e entra no contrato — e este alias some sem trocar uma linha da grade.
 */
type LinhaCarteira = LinhaCarteiraConsultor & { produtor_usuario_id: number | null };

const VINCULO_INFO: Record<string, { rotulo: string; classe: string; titulo: string }> = {
  ativo: {
    rotulo: 'Ativo',
    classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40',
    titulo: 'Ocupa uma vaga do plano e dá acesso aos dados da fazenda',
  },
  inativo: {
    rotulo: 'Inativo',
    classe: 'text-muted-foreground border-border bg-secondary',
    titulo: 'Vaga liberada, dados preservados — o técnico perdeu o acesso a esta fazenda',
  },
};

/**
 * A CARTEIRA — a tabela que faz a ponte consultor → produtor.
 *
 * Cada linha com dono no app leva a `/adm/u/<id do produtor>`: é o caminho que o
 * desenho pede, e sem ele a visão de consultoria seria um beco (dá para ver que
 * o técnico atende a Fazenda X e não dá para abrir a Fazenda X).
 *
 * A linha SEM dono no app é a informação comercial desta tela. A fazenda de
 * consultoria nasce com `propriedades.produtor_id` NULL: o técnico cadastra o
 * cliente que não usa o app, e o nome do proprietário é texto livre que ele
 * digitou. Não existe conta para cobrar, nem ficha para abrir — existe um lead,
 * e é uma categoria diferente de cliente. Ela aparece marcada, e o destino do
 * clique muda: vai para a ficha do próprio técnico com a fazenda em foco, que é
 * de onde os dados dela são alcançáveis.
 */
export function CarteiraConsultor({
  linhas,
  consultorId,
  agora,
}: {
  linhas: LinhaCarteira[];
  /** `usuarios.id` do técnico — o escopo por onde as fazendas sem dono se abrem. */
  consultorId: number;
  agora: string;
}) {
  const facetas = useMemo<FacetaDef<LinhaCarteira>[]>(
    () => [
      {
        chave: 'vinculo',
        rotulo: 'Vínculo',
        tipo: 'enum',
        valor: (l) => l.status_vinculo,
        opcoes: ['ativo', 'inativo'],
        rotuloValor: (v) => VINCULO_INFO[v]?.rotulo ?? v,
      },
      {
        chave: 'produtor',
        rotulo: 'Produtor',
        tipo: 'enum',
        valor: (l) => (l.produtor_usuario_id != null ? 'no_app' : 'fora'),
        opcoes: ['no_app', 'fora'],
        rotuloValor: (v) => (v === 'no_app' ? 'Tem conta no app' : 'Cliente fora do app'),
      },
      { chave: 'estado', rotulo: 'UF', tipo: 'enum', valor: (l) => l.estado },
      { chave: 'animais', rotulo: 'Animais', tipo: 'intervalo', valor: (l) => l.animais_ativos, unidade: 'animais', casas: 0 },
      { chave: 'vinculado', rotulo: 'Vinculado em', tipo: 'data', valor: (l) => l.data_vinculo },
    ],
    [],
  );

  const colunas = useMemo<AdmColuna<LinhaCarteira>[]>(
    () => [
      {
        chave: 'propriedade_nome',
        cabecalho: 'Propriedade',
        familia: 'essencial',
        fixa: true,
        ordenar: (l) => l.propriedade_nome,
        celula: (l) =>
          l.produtor_usuario_id != null ? (
            <Link
              href={`/adm/u/${l.produtor_usuario_id}?prop=${l.propriedade_id}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
              title="Abrir a ficha do produtor dono, com esta fazenda em foco"
            >
              {l.propriedade_nome}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="truncate">{l.propriedade_nome}</span>
              <span
                className="shrink-0 rounded border border-dashed border-border px-1 text-[10px] text-muted-foreground"
                title="propriedades.produtor_id é NULL: o cliente do técnico não tem conta no app"
              >
                fora do app
              </span>
            </span>
          ),
      },
      {
        chave: 'nome_proprietario',
        cabecalho: 'Proprietário',
        familia: 'essencial',
        ordenar: (l) => l.nome_proprietario,
        titulo: (l) =>
          l.produtor_usuario_id != null
            ? `Conta #${l.produtor_usuario_id} no app`
            : 'Texto livre preenchido pelo técnico — não é uma conta do sistema',
        celula: (l) => (
          <span className={cn('truncate', l.produtor_usuario_id == null && 'text-muted-foreground')}>
            {l.nome_proprietario ?? VAZIO}
          </span>
        ),
      },
      { chave: 'estado', cabecalho: 'UF', familia: 'essencial', ordenar: (l) => l.estado, celula: (l) => l.estado ?? VAZIO },
      {
        chave: 'status_vinculo',
        cabecalho: 'Vínculo',
        familia: 'essencial',
        ordenar: (l) => l.status_vinculo,
        celula: (l) => {
          const info = l.status_vinculo ? VINCULO_INFO[l.status_vinculo] : undefined;
          if (!info) return <span className="text-muted-foreground">{l.status_vinculo ?? VAZIO}</span>;
          return (
            <span title={info.titulo} className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', info.classe)}>
              {info.rotulo}
            </span>
          );
        },
      },
      {
        chave: 'data_vinculo',
        cabecalho: 'Vinculado em',
        familia: 'essencial',
        ordenar: (l) => l.data_vinculo,
        celula: (l) => <span className="tabular-nums">{formatarData(l.data_vinculo)}</span>,
      },
      {
        chave: 'animais_ativos',
        cabecalho: 'Animais',
        familia: 'essencial',
        numerica: true,
        ordenar: (l) => l.animais_ativos,
        celula: (l) => <span className="tabular-nums">{formatarInteiro(l.animais_ativos)}</span>,
      },
      {
        chave: 'ultimo_lancamento_em',
        cabecalho: 'Último lançamento',
        familia: 'essencial',
        // D2: o sinal de vida é o lançamento, não o login — e ele é DA FAZENDA.
        // Ordenar pela data (e não pelo texto) põe quem parou no fim da lista
        // ascendente, que é onde se procura.
        ordenar: (l) => l.ultimo_lancamento_em,
        titulo: (l) => (l.ultimo_lancamento_em ? `Em ${formatarData(l.ultimo_lancamento_em)}` : 'Nunca lançou nada'),
        celula: (l) => (
          <span className={cn('whitespace-nowrap', l.ultimo_lancamento_em == null && 'text-muted-foreground')}>
            {l.ultimo_lancamento_em == null ? 'nunca' : formatarDataRelativa(l.ultimo_lancamento_em, agora)}
          </span>
        ),
      },
      {
        chave: 'amls_90d',
        cabecalho: 'AMLs 90d',
        familia: 'essencial',
        numerica: true,
        ordenar: (l) => l.amls_90d,
        titulo: () => 'AMLs feitas POR ESTE técnico nesta fazenda nos últimos 90 dias',
        celula: (l) => <span className="tabular-nums">{formatarInteiro(l.amls_90d)}</span>,
      },
    ],
    [agora],
  );

  return (
    <AdmTable
      id={`carteira:${consultorId}`}
      colunas={colunas}
      linhas={linhas}
      // Vínculo repetido para a mesma fazenda é possível no schema (não há UNIQUE
      // em tecnico_propriedades) — a data entra na chave para o React não perder
      // uma linha em silêncio.
      chave={(l) => `${l.propriedade_id}:${l.data_vinculo ?? ''}`}
      facetas={facetas}
      agora={agora}
      hrefLinha={(l) =>
        l.produtor_usuario_id != null
          ? `/adm/u/${l.produtor_usuario_id}?prop=${l.propriedade_id}`
          : `/adm/u/${consultorId}?prop=${l.propriedade_id}`
      }
      substantivo="fazendas"
      vazio={
        <EstadoVazio
          titulo="Nenhuma fazenda com esses filtros"
          texto="A carteira inclui os vínculos inativos, que liberam a vaga do plano mas preservam os dados."
        />
      }
    />
  );
}
