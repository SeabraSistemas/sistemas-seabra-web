'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Copy, Search, X } from 'lucide-react';

import { AdmTable, type AdmColuna } from '@/components/adm/AdmTable';
import { filtrarLinhas, lerFiltros, type FacetaDef } from '@/components/adm/AdmFilters';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { PapelBadge } from '@/components/adm/PapelBadge';
import {
  VAZIO,
  diasEntre,
  formatarDiasRelativo,
  formatarInteiro,
  formatarMoeda,
  formatarTelefone,
} from '@/lib/adm/format';
import { faixaDeScore, soma } from '@/lib/adm/metricas';
import {
  ORIGEM_ACESSO_ROTULO,
  PAPEIS,
  SEGMENTO_ROTULO,
  type OrigemAcesso,
  type StatusEfetivo,
  type UsuarioLista,
} from '@/lib/adm/types';
import { cn } from '@/lib/utils';

/**
 * A lista mestra do /adm — a tela em que toda pergunta sobre um cliente começa.
 *
 * Quase tudo aqui é declaração, não mecanismo: as COLUNAS e as FACETAS são
 * dados, e quem filtra, ordena, pagina, esconde coluna e abre o painel lateral é
 * a <AdmTable> (que monta a <AdmFilters> sozinha a partir das facetas). Só duas
 * coisas justificam este arquivo ser um Client Component próprio:
 *
 * 1. A BUSCA ÚNICA, que responde a cada tecla. Ela não é uma faceta de texto
 *    porque as facetas escrevem na URL com `router.replace` — correto para um
 *    clique de chip, inviável para um campo de digitação, onde cada caractere
 *    viraria uma re-execução do Server Component (e, nesta rota `force-dynamic`,
 *    uma query no Supabase). A busca casa em PARALELO contra id, nome sem
 *    acento, e-mail, telefone e nome da propriedade: digitar "11954" acha na
 *    hora, digitar "boa vista" acha pela fazenda.
 * 2. O `#` COPIÁVEL (D1), que precisa de um clique e de um estado de "copiado".
 *
 * O termo da busca vai para `?q=` por `history.replaceState` — a URL fica
 * compartilhável sem custo de round-trip. É lido uma vez, na montagem: quem traz
 * um filtro novo de fora (o link de um KPI da carteira) é o `key` que a página
 * passa, derivado de searchParams. Um efeito que ressincronizasse a busca com a
 * URL teria uma corrida real com o router e devolveria ao campo um valor
 * anterior no meio da digitação — perder tecla em campo de busca é pior do que o
 * limite conhecido deste desenho.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rótulos locais de apresentação
// ─────────────────────────────────────────────────────────────────────────────

/** Espelha a forma de PAPEL_INFO (types.ts). Mora aqui, e não no contrato,
 *  porque isto é apresentação: o dado canônico é `status_efetivo`. */
const STATUS_INFO: Record<StatusEfetivo, { rotulo: string; classe: string }> = {
  ativa: { rotulo: 'Ativa', classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40' },
  trial: { rotulo: 'Trial', classe: 'text-sky-300 border-sky-900/60 bg-sky-950/40' },
  pendente: { rotulo: 'Pendente', classe: 'text-amber-300 border-amber-900/60 bg-amber-950/40' },
  vencida: { rotulo: 'Vencida', classe: 'text-destructive border-destructive/40 bg-destructive/10' },
  cancelada: { rotulo: 'Cancelada', classe: 'text-muted-foreground border-border bg-secondary' },
};

const STATUS: StatusEfetivo[] = ['ativa', 'trial', 'pendente', 'vencida', 'cancelada'];
const ORIGENS: OrigemAcesso[] = ['pagante', 'trial', 'cortesia', 'extensao'];

/**
 * As bandeiras: UMA definição, usada pela coluna e pela faceta. Duas listas
 * separadas divergem no primeiro dia em que alguém acrescenta uma bandeira.
 */
const BANDEIRAS: { chave: string; rotulo: string; classe: string; tem: (u: UsuarioLista) => boolean }[] = [
  { chave: 'tester', rotulo: 'teste', classe: 'text-muted-foreground border-border', tem: (u) => u.is_tester },
  { chave: 'demo', rotulo: 'demo', classe: 'text-muted-foreground border-border', tem: (u) => u.is_demo },
  { chave: 'cortesia', rotulo: 'cortesia', classe: 'text-sky-300 border-sky-900/60', tem: (u) => u.origem_acesso === 'cortesia' },
  { chave: 'extensao', rotulo: 'extensão', classe: 'text-violet-300 border-violet-900/60', tem: (u) => u.origem_acesso === 'extensao' },
  { chave: 'inativo', rotulo: 'inativo', classe: 'text-destructive border-destructive/40', tem: (u) => !u.ativo },
  // usuarios.uuid nulo: a conta existe e usa o app, mas não passa pelo Supabase
  // Auth — é o caso dos colaboradores legados, e é por isso que "último login"
  // não serviria como sinal de vida (D2).
  { chave: 'sem_auth', rotulo: 'sem auth', classe: 'text-amber-300 border-amber-900/60', tem: (u) => u.sem_auth },
  { chave: 'onboarding', rotulo: 'onboarding', classe: 'text-amber-300 border-amber-900/60', tem: (u) => !u.onboarding_finalizado },
  { chave: 'sem_acesso', rotulo: 'sem acesso', classe: 'text-destructive border-destructive/40', tem: (u) => !u.acesso_ativo },
];

const ATIVIDADE_ROTULO: Record<string, string> = {
  '7d': 'Lançou em 7 dias',
  '30d': 'Lançou em 30 dias',
  '90d': 'Lançou em 90 dias',
  silencioso: 'Sumido há +30d (pagando)',
  nunca: 'Nunca lançou',
};

const COBRANCA_ROTULO: Record<string, string> = {
  vencido: 'Vencido',
  vencendo7d: 'Vence em 7 dias',
  em_dia: 'Em dia',
};

const ACESSO_ROTULO: Record<string, string> = { ativo: 'Com acesso', sem: 'Sem acesso' };

function porMapa(mapa: Record<string, string>, valor: string): string {
  return mapa[valor] ?? valor;
}

function bandeirasDe(u: UsuarioLista): { chave: string; rotulo: string; classe: string }[] {
  return BANDEIRAS.filter((b) => b.tem(u));
}

/** Ponto de saúde da conta. Score nulo (conta nova demais para pontuar) é
 *  CINZA, nunca vermelho: conta nova não é conta em risco. */
function corDoScore(score: number | null): string {
  if (score == null) return 'bg-muted-foreground/40';
  const faixa = faixaDeScore(score);
  if (faixa === 'saudavel') return 'bg-emerald-400';
  if (faixa === 'atencao') return 'bg-amber-400';
  return 'bg-destructive';
}

// ─────────────────────────────────────────────────────────────────────────────
// Busca
// ─────────────────────────────────────────────────────────────────────────────

/** Sem acento e em minúsculas — o mesmo efeito do `unaccent` do servidor, e a
 *  mesma normalização que a AdmFilters faz nas facetas de texto. O intervalo
 *  \u0300-\u036f é o bloco de diacríticos combinantes que o NFD separa da
 *  letra (escape numérico porque \p{Diacritic} exige target ES2018+). */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

interface EntradaIndice {
  u: UsuarioLista;
  texto: string;
  /** Cada campo numérico separado: concatenar criaria casamento entre o fim de
   *  um e o começo do outro, e um id inexistente "acharia" alguém. */
  digitos: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export function ListaUsuarios({
  usuarios,
  agora,
  incluindoTestes = false,
}: {
  usuarios: UsuarioLista[];
  /** ISO do instante do servidor — o corte de "vence em 7 dias" não pode mudar
   *  entre o HTML e a hidratação. */
  agora: string;
  /** Reflete o `?testes=1` que a PÁGINA leu: o corte de conta de teste é feito
   *  na query (queries.ts), não aqui, e este flag só desenha o botão certo. */
  incluindoTestes?: boolean;
}) {
  const params = useSearchParams();
  const [busca, setBusca] = useState(() => params.get('q') ?? '');
  const [copiado, setCopiado] = useState<number | null>(null);
  const timerCopia = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerCopia.current) clearTimeout(timerCopia.current);
  }, []);

  const trocarBusca = useCallback((valor: string) => {
    setBusca(valor);
    if (typeof window === 'undefined') return;
    // `history.replaceState` e NÃO `router.replace`: o replace do router
    // re-executa o Server Component — numa rota `force-dynamic`, uma query por
    // caractere. Aqui a URL fica compartilhável de graça.
    const proximo = new URLSearchParams(window.location.search);
    if (valor.trim() === '') proximo.delete('q');
    else proximo.set('q', valor.trim());
    const qs = proximo.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, []);

  const copiar = useCallback(async (id: number) => {
    // Clipboard só existe em contexto seguro (https ou localhost). Fora disso a
    // cópia falha em silêncio — o que não pode é a lista quebrar por causa disso.
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

  // ── Busca em memória ───────────────────────────────────────────────────────
  const indice = useMemo<EntradaIndice[]>(
    () =>
      usuarios.map((u) => ({
        u,
        texto: normalizar(
          [u.nome, u.email_mascarado, u.whatsapp_mascarado, u.propriedade_nome, u.numero_criador, u.associacao_nome]
            .filter((v): v is string => !!v)
            .join(' '),
        ),
        digitos: [
          String(u.id),
          (u.whatsapp_mascarado ?? '').replace(/\D/g, ''),
          (u.numero_criador ?? '').replace(/\D/g, ''),
        ].filter((v) => v !== ''),
      })),
    [usuarios],
  );

  const termo = busca.trim();

  const buscadas = useMemo(() => {
    if (termo === '') return usuarios;
    const alvo = normalizar(termo);
    const digitos = termo.replace(/\D/g, '');
    const achadas = indice
      .filter(
        (e) =>
          e.texto.includes(alvo) ||
          // 3 dígitos é o piso: com 1 ou 2, metade da base "casa" e a busca vira ruído.
          (digitos.length >= 3 && e.digitos.some((d) => d.includes(digitos))),
      )
      .map((e) => e.u);

    // D1: digitar um número é perguntar por AQUELE usuário. O acerto exato sobe
    // para a primeira linha (enquanto ninguém escolheu uma ordenação própria),
    // mesmo que outras contas tenham o mesmo trecho no número de criador.
    if (!/^\d+$/.test(termo)) return achadas;
    const alvoId = Number(termo);
    const exato = achadas.find((u) => u.id === alvoId);
    return exato ? [exato, ...achadas.filter((u) => u.id !== alvoId)] : achadas;
  }, [indice, termo, usuarios]);

  // ── Facetas ────────────────────────────────────────────────────────────────
  // A faceta de CONSULTORIA, prevista no desenho, não existe aqui: `UsuarioLista`
  // não carrega nenhum campo de vínculo técnico↔propriedade. Ela depende de a
  // view `adm.usuarios_lista` expor algo como `tem_consultor`, e derivá-la de
  // `papel = 'tecnico'` responderia outra pergunta ("quem é consultor") em vez da
  // pedida ("quem tem consultor").
  const facetas = useMemo<FacetaDef<UsuarioLista>[]>(
    () => [
      {
        chave: 'papel',
        rotulo: 'Papel',
        tipo: 'enum',
        valor: (u) => u.papel,
        opcoes: PAPEIS,
        rotuloValor: (v) => porMapa({ administrador: 'Admin', admin_associacao: 'Admin assoc.', tecnico: 'Técnico', produtor: 'Produtor', colaborador: 'Colaborador' }, v),
      },
      {
        chave: 'status',
        rotulo: 'Status',
        tipo: 'enum',
        valor: (u) => u.status_efetivo,
        opcoes: STATUS,
        rotuloValor: (v) => STATUS_INFO[v as StatusEfetivo]?.rotulo ?? v,
      },
      {
        chave: 'origem',
        rotulo: 'Origem do acesso',
        tipo: 'enum',
        valor: (u) => u.origem_acesso,
        opcoes: ORIGENS,
        rotuloValor: (v) => ORIGEM_ACESSO_ROTULO[v as OrigemAcesso] ?? v,
      },
      { chave: 'plano', rotulo: 'Plano', tipo: 'enum', valor: (u) => u.plano_nome },
      { chave: 'associacao', rotulo: 'Associação', tipo: 'enum', valor: (u) => u.associacao_nome },
      {
        chave: 'segmento',
        rotulo: 'Segmento',
        tipo: 'enum',
        // text[]: a propriedade pode ser caprino leiteiro E ovino corte. A linha
        // entra nas duas fatias, e a soma das contagens passa do total — correto.
        valor: (u) => u.segmentos,
        opcoes: Object.keys(SEGMENTO_ROTULO),
        rotuloValor: (v) => (SEGMENTO_ROTULO as Record<string, string | undefined>)[v] ?? v,
      },
      { chave: 'estado', rotulo: 'Estado', tipo: 'enum', valor: (u) => u.estado },
      {
        chave: 'atividade',
        rotulo: 'Atividade',
        tipo: 'enum',
        // Os baldes se contêm de propósito: quem lançou em 7 dias também lançou
        // em 30 e em 90. Marcar "30 dias" tem que trazer quem lançou ontem.
        valor: (u) => {
          if (u.ultimo_lancamento_em == null) return ['nunca'];
          const dias = u.dias_sem_lancar;
          if (dias == null) return [];
          const baldes: string[] = [];
          if (dias <= 7) baldes.push('7d');
          if (dias <= 30) baldes.push('30d');
          if (dias <= 90) baldes.push('90d');
          // Silencioso é sumiu MAS ainda paga: sem o acesso ativo, a lista se
          // enche de conta cancelada há um ano, que não é ação nenhuma.
          if (dias >= 30 && u.acesso_ativo) baldes.push('silencioso');
          return baldes;
        },
        opcoes: ['7d', '30d', '90d', 'silencioso', 'nunca'],
        rotuloValor: (v) => porMapa(ATIVIDADE_ROTULO, v),
      },
      {
        chave: 'cobranca',
        rotulo: 'Cobrança',
        tipo: 'enum',
        valor: (u) => {
          const dias = diasEntre(agora, u.data_vencimento);
          // Status vencida sem data é o pagamento que falhou e limpou o
          // vencimento: continua sendo dinheiro parado, e sumiria se dependesse
          // só da data.
          if (dias == null) return u.status_efetivo === 'vencida' ? ['vencido'] : [];
          if (dias < 0) return ['vencido'];
          if (dias <= 7) return ['vencendo7d'];
          return ['em_dia'];
        },
        opcoes: ['vencido', 'vencendo7d', 'em_dia'],
        rotuloValor: (v) => porMapa(COBRANCA_ROTULO, v),
      },
      {
        chave: 'bandeira',
        rotulo: 'Bandeiras',
        tipo: 'enum',
        valor: (u) => bandeirasDe(u).map((b) => b.chave),
        opcoes: BANDEIRAS.map((b) => b.chave),
        rotuloValor: (v) => BANDEIRAS.find((b) => b.chave === v)?.rotulo ?? v,
      },
      {
        chave: 'acesso',
        rotulo: 'Acesso',
        tipo: 'enum',
        valor: (u) => (u.acesso_ativo ? 'ativo' : 'sem'),
        opcoes: ['ativo', 'sem'],
        rotuloValor: (v) => porMapa(ACESSO_ROTULO, v),
      },
      { chave: 'animais', rotulo: 'Animais', tipo: 'intervalo', valor: (u) => u.animais_ativos, unidade: 'animais', casas: 0 },
      { chave: 'cadastro', rotulo: 'Cadastro', tipo: 'data', valor: (u) => u.data_cadastro },
    ],
    [agora],
  );

  // O MESMO recorte que a <AdmTable> vai aplicar, calculado com as MESMAS
  // funções dela. É o que garante que o dinheiro somado no resumo se refira
  // exatamente às linhas que estão na tela — recontar por conta própria é como
  // dois números da mesma tela passam a discordar.
  const filtros = useMemo(() => lerFiltros(facetas, params, agora), [facetas, params, agora]);
  const visiveis = useMemo(() => filtrarLinhas(buscadas, facetas, filtros), [buscadas, facetas, filtros]);

  const comAcesso = visiveis.filter((u) => u.acesso_ativo).length;
  const valorSelecionado = soma(visiveis.map((u) => u.valor_real_mensal));

  // ── Colunas ────────────────────────────────────────────────────────────────
  const colunas = useMemo<AdmColuna<UsuarioLista>[]>(
    () => [
      {
        chave: 'id',
        cabecalho: '#',
        familia: 'essencial',
        numerica: true,
        fixa: true,
        ordenar: (u) => u.id,
        // D1: usuarios.id é a identidade do painel — o número que o Felipe cola
        // no WhatsApp do suporte. Copiar precisa ser um clique, não uma seleção
        // de texto dentro de uma linha que também é clicável.
        celula: (u) => (
          <button
            type="button"
            onClick={() => void copiar(u.id)}
            title={`Copiar o número ${u.id}`}
            className="-mx-1 inline-flex items-center gap-1 rounded px-1 tabular-nums transition-colors hover:bg-accent"
          >
            {u.id}
            {copiado === u.id ? (
              <Check className="size-3 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-50" aria-hidden="true" />
            )}
            <span className="sr-only">{copiado === u.id ? 'copiado' : 'copiar'}</span>
          </button>
        ),
      },
      {
        chave: 'nome',
        cabecalho: 'Nome',
        familia: 'essencial',
        ordenar: (u) => u.nome,
        // O clique na linha abre o painel do registro (decisão da AdmTable); o
        // nome é o atalho explícito para a ficha completa do cliente.
        celula: (u) => (
          <Link href={`/adm/u/${u.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
            {u.nome}
          </Link>
        ),
      },
      {
        chave: 'numero_criador',
        cabecalho: 'Nº criador',
        familia: 'detalhe',
        ordenar: (u) => u.numero_criador,
        // D1: aceita vazia. Nem todo cliente tem registro na ABCC/ARCO — traço
        // aqui não é dado faltando, é criador sem registro.
        celula: (u) => <span className="tabular-nums">{u.numero_criador ?? VAZIO}</span>,
      },
      {
        chave: 'email',
        cabecalho: 'E-mail',
        familia: 'detalhe',
        ordenar: (u) => u.email_mascarado,
        // Já mascarado na view (LGPD). Mascarar no React seria teatro: o valor
        // cru já teria viajado no payload RSC e estaria no DevTools.
        celula: (u) => <span className="text-muted-foreground">{u.email_mascarado ?? VAZIO}</span>,
      },
      {
        chave: 'telefone',
        cabecalho: 'Telefone',
        familia: 'detalhe',
        ordenar: (u) => u.whatsapp_mascarado,
        celula: (u) => (
          <span className="tabular-nums text-muted-foreground">
            {formatarTelefone(u.whatsapp_mascarado, u.whatsapp_pais)}
          </span>
        ),
      },
      {
        chave: 'papel',
        cabecalho: 'Papel',
        familia: 'essencial',
        ordenar: (u) => u.papel,
        celula: (u) => <PapelBadge papel={u.papel} />,
      },
      {
        chave: 'propriedade',
        cabecalho: 'Propriedade',
        familia: 'essencial',
        ordenar: (u) => u.propriedade_nome,
        celula: (u) => (
          <span className="inline-flex items-center gap-1.5">
            <span className="truncate">{u.propriedade_nome ?? VAZIO}</span>
            {/* Mais de uma propriedade: o dashboard do cliente vai abrir com
                seletor, e a linha precisa avisar que este nome é só uma delas. */}
            {u.total_propriedades > 1 && (
              <span
                className="shrink-0 rounded border border-border px-1 text-[10px] tabular-nums text-muted-foreground"
                title={`${u.total_propriedades} propriedades`}
              >
                +{u.total_propriedades - 1}
              </span>
            )}
          </span>
        ),
      },
      { chave: 'estado', cabecalho: 'UF', familia: 'detalhe', ordenar: (u) => u.estado, celula: (u) => u.estado ?? VAZIO },
      {
        chave: 'plano',
        cabecalho: 'Plano',
        familia: 'detalhe',
        ordenar: (u) => u.plano_nome,
        celula: (u) => <span className="truncate">{u.plano_nome ?? VAZIO}</span>,
      },
      {
        chave: 'status',
        cabecalho: 'Status',
        familia: 'essencial',
        ordenar: (u) => u.status_efetivo,
        celula: (u) => {
          const info = u.status_efetivo ? STATUS_INFO[u.status_efetivo] : null;
          if (!info) return <span className="text-muted-foreground">{VAZIO}</span>;
          return (
            <span className={cn('whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', info.classe)}>
              {info.rotulo}
            </span>
          );
        },
      },
      {
        chave: 'valor',
        cabecalho: 'Valor real',
        familia: 'essencial',
        numerica: true,
        ordenar: (u) => u.valor_real_mensal,
        // Já normalizado por ciclo no SQL: o assinante anual entra dividido por
        // 12 e a cortesia entra zerada (ver mrrDeAssinatura em metricas.ts).
        celula: (u) => (
          <span className="tabular-nums">{u.valor_real_mensal != null ? formatarMoeda(u.valor_real_mensal) : VAZIO}</span>
        ),
      },
      {
        chave: 'ultimo_lancamento',
        cabecalho: 'Último lançamento',
        familia: 'essencial',
        // D2: o sinal de vida é o lançamento, não o login — não existe coluna de
        // último acesso em `usuarios`, e `auth.users` é nulo para todo
        // colaborador legado. Ordenar por DIAS (e não pela data) põe o pior no topo.
        ordenar: (u) => u.dias_sem_lancar,
        titulo: (u) =>
          [
            u.health_score != null ? `health score ${u.health_score}` : 'conta nova demais para pontuar',
            u.ultimo_modulo ? `último módulo: ${u.ultimo_modulo}` : null,
            `${formatarInteiro(u.lancamentos_30d)} lançamentos em 30 dias`,
          ]
            .filter((p): p is string => !!p)
            .join(' · '),
        celula: (u) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className={cn('size-1.5 shrink-0 rounded-full', corDoScore(u.health_score))} aria-hidden="true" />
            <span className={cn(u.ultimo_lancamento_em == null && 'text-muted-foreground')}>
              {u.ultimo_lancamento_em == null ? 'nunca' : formatarDiasRelativo(u.dias_sem_lancar)}
            </span>
          </span>
        ),
      },
      {
        chave: 'animais',
        cabecalho: 'Animais',
        familia: 'essencial',
        numerica: true,
        ordenar: (u) => u.animais_ativos,
        celula: (u) => <span className="tabular-nums">{formatarInteiro(u.animais_ativos)}</span>,
      },
      {
        chave: 'bandeiras',
        cabecalho: 'Bandeiras',
        familia: 'detalhe',
        celula: (u) => {
          const ativas = bandeirasDe(u);
          if (ativas.length === 0) return <span className="text-muted-foreground">{VAZIO}</span>;
          return (
            <span className="flex flex-wrap gap-1">
              {ativas.map((b) => (
                <span key={b.chave} className={cn('whitespace-nowrap rounded border px-1 text-[10px]', b.classe)}>
                  {b.rotulo}
                </span>
              ))}
            </span>
          );
        },
      },
    ],
    [copiado, copiar],
  );

  // O corte de conta de teste é da QUERY (a demo é a do reviewer da Apple e as de
  // teste são internas: contá-las infla base e engajamento com gente que não é
  // cliente). Por isso este é um link de navegação de verdade, e não um filtro
  // de cliente — e por isso ele carrega o resto da URL junto.
  const hrefTestes = useMemo(() => {
    const proximo = new URLSearchParams(params.toString());
    if (incluindoTestes) proximo.delete('testes');
    else proximo.set('testes', '1');
    if (termo === '') proximo.delete('q');
    else proximo.set('q', termo);
    const qs = proximo.toString();
    return qs ? `/adm/usuarios?${qs}` : '/adm/usuarios';
  }, [params, incluindoTestes, termo]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label className="relative flex min-w-64 flex-1 items-center sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Buscar conta</span>
          <input
            value={busca}
            onChange={(evento) => trocarBusca(evento.target.value)}
            placeholder="Número, nome, e-mail, telefone ou fazenda"
            autoComplete="off"
            spellCheck={false}
            className="h-9 w-full rounded-lg border border-input bg-secondary pl-9 pr-8 text-[13px] outline-none placeholder:text-muted-foreground"
          />
          {busca !== '' && (
            <button
              type="button"
              onClick={() => trocarBusca('')}
              className="absolute right-2 rounded p-1 text-muted-foreground hover:text-foreground"
              title="Limpar busca"
            >
              <X className="size-3.5" />
              <span className="sr-only">Limpar busca</span>
            </button>
          )}
        </label>

        <p className="text-xs tabular-nums text-muted-foreground">
          <span className="text-foreground">{formatarInteiro(visiveis.length)}</span> de{' '}
          {formatarInteiro(usuarios.length)} contas · {formatarInteiro(comAcesso)} com acesso ·{' '}
          <span className="text-foreground">{formatarMoeda(valorSelecionado)}</span>/mês na seleção
        </p>
      </div>

      <AdmTable
        id="usuarios"
        colunas={colunas}
        linhas={buscadas}
        chave={(u) => String(u.id)}
        facetas={facetas}
        agora={agora}
        hrefLinha={(u) => `/adm/u/${u.id}`}
        substantivo="contas"
        acoes={
          <Link
            href={hrefTestes}
            className="rounded-lg border border-border px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            title="Contas is_tester e is_demo ficam fora da lista por padrão"
          >
            {incluindoTestes ? 'Ocultar contas de teste' : 'Incluir contas de teste'}
          </Link>
        }
        vazio={
          <EstadoVazio
            titulo={termo === '' ? 'Nenhuma conta com esses filtros' : `Nada encontrado para "${termo}"`}
            texto="A busca cobre número, nome, e-mail, telefone e nome da fazenda — e os filtros da barra acima se somam a ela."
          />
        }
      />
    </div>
  );
}
