'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { AdmTable, type AdmColuna } from '@/components/adm/AdmTable';
import { filtrarLinhas, lerFiltros, type FacetaDef } from '@/components/adm/AdmFilters';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { VAZIO, formatarDiasRelativo, formatarInteiro } from '@/lib/adm/format';
import { faixaDeScore } from '@/lib/adm/metricas';
import { DIAS_SILENCIO, type LinhaPropriedade } from '@/lib/adm/areas/contrato';
import { SEGMENTO_ROTULO } from '@/lib/adm/types';
import { cn } from '@/lib/utils';

/**
 * O DIRETÓRIO DE PROPRIEDADES — a grade da entidade que o Felipe realmente gere.
 *
 * "Não quero acompanhar nada de colaborador, somente da propriedade que eu quero
 * ver, nela posso até ter a relação dos colaboradores" (05/09/2026). Daí as duas
 * decisões que dão forma a esta tela: a linha é uma FAZENDA, e a equipe é uma
 * COLUNA da fazenda — não uma lista de pessoas ao lado.
 *
 * A LINHA NÃO ABRE UMA TELA NOVA. Ela leva para `/adm/u/<dono>?prop=<id>`, a
 * ficha que já existe, com as 13 abas. Uma segunda ficha ancorada em
 * `propriedade_id` duplicaria treze telas para ganhar nada.
 *
 * A FAZENDA SEM DONO é a informação comercial daqui. `propriedades.produtor_id`
 * NULL não é dado faltando: é a fazenda de consultoria, cadastrada pelo técnico
 * para um cliente que não usa o app. Ela não tem ficha para abrir — e a célula
 * diz isso e diz por onde ir (a ficha do técnico), em vez de mostrar um traço
 * que parece defeito de dado. `ficha` chega resolvida do servidor por
 * `fichaDaPropriedade()` (src/lib/adm/areas/propriedades.ts): é lá, e em nenhum
 * outro lugar, que a URL da ficha é escrita.
 *
 * NADA aqui importa de `areas/propriedades`, nem tipo. Aquele módulo abre com
 * `import 'server-only'` e existe para ser inalcançável do browser; um
 * `import type` seria apagado na compilação e provavelmente funcionaria, mas
 * "provavelmente" não é o padrão desta pasta. O tipo da linha é escrito aqui a
 * partir do CONTRATO (`areas/contrato.ts`, que é puro), e a checagem estrutural
 * do TypeScript garante que ele e o que a query devolve continuem sendo a mesma
 * coisa. A consequência é a duplicação da REGRA DE SILÊNCIO na faceta de
 * atividade, marcada abaixo nos dois lados.
 *
 * Sem campo de busca, ao contrário da lista mestra: são dezenas de fazendas, e
 * as facetas mais a ordenação de coluna já acham qualquer uma. Um campo a menos
 * é um estado a menos na URL.
 */

// ─────────────────────────────────────────────────────────────────────────────
// A linha como a tela precisa dela
// ─────────────────────────────────────────────────────────────────────────────

export interface PropriedadeNaTela extends LinhaPropriedade {
  /**
   * A ficha do dono com esta fazenda em foco, ou `null` quando não há dono no
   * sistema. Vem resolvida do servidor — mesma técnica de `produtor_usuario_id`
   * na carteira do consultor: campo derivado que o Client Component recebe
   * pronto, para a regra morar num lugar só e ter teste.
   */
  ficha: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulário visual
// ─────────────────────────────────────────────────────────────────────────────

/** Espelha o STATUS_INFO da <ListaUsuarios> e da <ListaConsultores>. Mora aqui
 *  porque isto é APRESENTAÇÃO — o dado canônico é `status_efetivo`, vindo de
 *  `adm.assinatura_normalizada`, e nunca `assinaturas.status` cru. */
const STATUS_INFO: Record<string, { rotulo: string; classe: string }> = {
  ativa: { rotulo: 'Ativa', classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40' },
  trial: { rotulo: 'Trial', classe: 'text-sky-300 border-sky-900/60 bg-sky-950/40' },
  pendente: { rotulo: 'Pendente', classe: 'text-amber-300 border-amber-900/60 bg-amber-950/40' },
  vencida: { rotulo: 'Vencida', classe: 'text-destructive border-destructive/40 bg-destructive/10' },
  cancelada: { rotulo: 'Cancelada', classe: 'text-muted-foreground border-border bg-secondary' },
};

const STATUS = ['ativa', 'trial', 'pendente', 'vencida', 'cancelada'];

/**
 * Ponto de saúde da fazenda, igual ao da lista mestra. Score nulo (conta nova
 * demais para pontuar) é CINZA, nunca vermelho: fazenda recém-cadastrada não é
 * fazenda em risco, e pintá-la de vermelho gera alarme falso todo dia.
 */
function corDoScore(score: number | null): string {
  if (score == null) return 'bg-muted-foreground/40';
  const faixa = faixaDeScore(score);
  if (faixa === 'saudavel') return 'bg-emerald-400';
  if (faixa === 'atencao') return 'bg-amber-400';
  return 'bg-destructive';
}


const ATIVIDADE_ROTULO: Record<string, string> = {
  '7d': 'Lançou em 7 dias',
  '30d': 'Lançou em 30 dias',
  '90d': 'Lançou em 90 dias',
  silencioso: 'Sumida há +30d (pagando)',
  nunca: 'Nunca lançou',
};

const PRODUTOR_ROTULO: Record<string, string> = {
  no_app: 'Tem produtor no app',
  consultoria: 'Sem produtor (consultoria)',
};

const ACESSO_ROTULO: Record<string, string> = { ativo: 'Com acesso', sem: 'Sem acesso' };

/** A frase da fazenda de consultoria, escrita uma vez: ela aparece na célula, no
 *  `title` e no painel do registro, e três redações diferentes da mesma coisa
 *  fariam parecer três situações diferentes. */
const SEM_PRODUTOR_EXPLICACAO =
  'Esta fazenda não tem produtor no sistema: foi cadastrada por um técnico para um cliente que não usa o app ' +
  '(propriedades.produtor_id é NULL). Não existe conta para abrir — os dados dela são alcançáveis pela ficha do ' +
  'TÉCNICO que a atende, em Consultores → carteira.';

function rotularSegmento(v: string): string {
  return (SEGMENTO_ROTULO as Record<string, string | undefined>)[v] ?? v;
}

/** Cidade e UF numa chave só, para a coluna ordenar por estado e, dentro dele,
 *  por cidade. Nulo quando não há nem um nem outro — e aí a linha vai para o fim
 *  da ordenação, em vez de fingir ser a primeira do alfabeto. */
function localizacao(l: PropriedadeNaTela): string | null {
  if (l.estado == null && l.cidade == null) return null;
  return `${l.estado ?? 'ZZ'} ${l.cidade ?? ''}`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// A grade
// ─────────────────────────────────────────────────────────────────────────────

export function ListaPropriedades({
  propriedades,
  agora,
}: {
  propriedades: PropriedadeNaTela[];
  /** ISO do instante do servidor. Entra na <AdmTable> para os cortes de data das
   *  facetas não mudarem entre o HTML e a hidratação. */
  agora: string;
}) {
  const params = useSearchParams();

  const facetas = useMemo<FacetaDef<PropriedadeNaTela>[]>(
    () => [
      {
        chave: 'estado',
        rotulo: 'Estado',
        tipo: 'enum',
        valor: (l) => l.estado,
      },
      {
        chave: 'segmento',
        rotulo: 'Segmento',
        tipo: 'enum',
        // text[]: a fazenda pode ser caprino leiteiro E ovino corte. Ela entra
        // nas duas fatias, e a soma das contagens passa do total — correto.
        valor: (l) => l.segmentos,
        opcoes: Object.keys(SEGMENTO_ROTULO),
        rotuloValor: rotularSegmento,
      },
      {
        chave: 'atividade',
        rotulo: 'Atividade',
        tipo: 'enum',
        // Os baldes se CONTÊM de propósito: quem lançou em 7 dias também lançou
        // em 30 e em 90. Marcar "30 dias" tem que trazer quem lançou ontem.
        valor: (l) => {
          if (l.ultimo_lancamento_em == null) return ['nunca'];
          const dias = l.dias_sem_lancar;
          if (dias == null) return [];
          const baldes: string[] = [];
          if (dias <= 7) baldes.push('7d');
          if (dias <= 30) baldes.push('30d');
          if (dias <= 90) baldes.push('90d');
          // Mesma constante do card e de ehSilenciosa(), importada do contrato e
          // não copiada: o card e a lista que ele abre não podem divergir.
          if (dias >= DIAS_SILENCIO && l.acesso_ativo) baldes.push('silencioso');
          return baldes;
        },
        opcoes: ['7d', '30d', '90d', 'silencioso', 'nunca'],
        rotuloValor: (v) => ATIVIDADE_ROTULO[v] ?? v,
      },
      {
        chave: 'produtor',
        rotulo: 'Produtor',
        tipo: 'enum',
        valor: (l) => (l.produtor_id != null ? 'no_app' : 'consultoria'),
        opcoes: ['no_app', 'consultoria'],
        rotuloValor: (v) => PRODUTOR_ROTULO[v] ?? v,
      },
      {
        chave: 'status',
        rotulo: 'Status do plano',
        tipo: 'enum',
        valor: (l) => l.status_efetivo,
        opcoes: STATUS,
        rotuloValor: (v) => STATUS_INFO[v]?.rotulo ?? v,
      },
      {
        chave: 'acesso',
        rotulo: 'Acesso',
        tipo: 'enum',
        // Existe porque é o destino do card "com acesso ativo": todo número
        // agregado do painel tem que ter caminho de volta para as linhas.
        valor: (l) => (l.acesso_ativo ? 'ativo' : 'sem'),
        opcoes: ['ativo', 'sem'],
        rotuloValor: (v) => ACESSO_ROTULO[v] ?? v,
      },
    ],
    [],
  );

  // O MESMO recorte que a <AdmTable> vai aplicar, com as MESMAS funções dela: é
  // o que garante que a linha de resumo se refira exatamente às linhas na tela.
  // Recontar por conta própria é como dois números da mesma tela discordam.
  const filtros = useMemo(() => lerFiltros(facetas, params, agora), [facetas, params, agora]);
  const visiveis = useMemo(
    () => filtrarLinhas(propriedades, facetas, filtros),
    [propriedades, facetas, filtros],
  );

  const animais = visiveis.reduce((acc, l) => acc + l.animais_ativos, 0);
  const semProdutor = visiveis.filter((l) => l.produtor_id == null).length;

  const colunas = useMemo<AdmColuna<PropriedadeNaTela>[]>(
    () => [
      {
        chave: 'nome',
        cabecalho: 'Fazenda',
        familia: 'essencial',
        fixa: true,
        ordenar: (l) => l.nome,
        titulo: (l) =>
          [`propriedade #${l.id}`, l.numero_criador ? `nº de criador ${l.numero_criador}` : null]
            .filter((p): p is string => !!p)
            .join(' · '),
        // O nº de criador vai AO LADO do nome, não embaixo: a linha da grade tem
        // 28px por decisão da <AdmTable> ("você está auditando, não lendo"), e
        // uma célula de duas linhas esticaria TODA a tabela para caber a segunda.
        // Ele é secundário e pode ser vazio (D1) — criador sem registro na
        // associação é normal, e a ausência não ganha traço para não competir
        // com o nome.
        celula: (l) => (
          <span className="inline-flex min-w-0 items-baseline gap-1.5">
            {l.ficha ? (
              <Link
                href={l.ficha}
                className="truncate font-medium text-foreground underline-offset-4 hover:underline"
                title="Abrir a ficha do produtor dono, com esta fazenda em foco"
              >
                {l.nome}
              </Link>
            ) : (
              <span className="truncate">{l.nome}</span>
            )}
            {l.numero_criador && (
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">nº {l.numero_criador}</span>
            )}
          </span>
        ),
      },
      {
        chave: 'produtor_nome',
        cabecalho: 'Produtor',
        familia: 'essencial',
        // Nulo por último na ordenação da <AdmTable>: as fazendas de consultoria
        // ficam juntas no fim, que é onde se olha para elas de uma vez.
        ordenar: (l) => l.produtor_nome,
        titulo: (l) => (l.produtor_id != null ? `conta #${l.produtor_id} no app` : SEM_PRODUTOR_EXPLICACAO),
        celula: (l) =>
          l.produtor_id != null ? (
            <span className="truncate">{l.produtor_nome ?? VAZIO}</span>
          ) : (
            // A célula que carrega a informação comercial da tela. Ela DIZ o que
            // acontece e por onde ir; um traço aqui pareceria dado faltando, e
            // um link para /adm/u/0 abriria a ficha de um usuário que não existe.
            <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <span className="shrink-0 rounded border border-dashed border-border px-1 text-[10px]">consultoria</span>
              <span className="truncate">sem produtor no sistema — abra pela ficha do técnico</span>
            </span>
          ),
      },
      {
        chave: 'cidade',
        cabecalho: 'Cidade / UF',
        familia: 'essencial',
        ordenar: localizacao,
        celula: (l) => (
          <span className="truncate">
            {l.cidade ?? VAZIO}
            {l.estado && <span className="text-muted-foreground"> · {l.estado}</span>}
          </span>
        ),
      },
      {
        chave: 'segmentos',
        cabecalho: 'Segmentos',
        familia: 'essencial',
        ordenar: (l) => (l.segmentos.length > 0 ? l.segmentos.map(rotularSegmento).sort().join(', ') : null),
        titulo: (l) => (l.segmentos.length > 0 ? l.segmentos.map(rotularSegmento).join(' · ') : 'Nenhum segmento cadastrado'),
        celula: (l) =>
          l.segmentos.length === 0 ? (
            <span className="text-muted-foreground">{VAZIO}</span>
          ) : (
            <span className="flex gap-1">
              {l.segmentos.map((s) => (
                <span
                  key={s}
                  className="whitespace-nowrap rounded border border-border px-1 text-[10px] text-muted-foreground"
                >
                  {rotularSegmento(s)}
                </span>
              ))}
            </span>
          ),
      },
      {
        chave: 'animais_ativos',
        cabecalho: 'Animais',
        familia: 'essencial',
        numerica: true,
        ordenar: (l) => l.animais_ativos,
        titulo: () => 'Animais vivos nesta fazenda',
        celula: (l) => <span className="tabular-nums">{formatarInteiro(l.animais_ativos)}</span>,
      },
      {
        chave: 'lactantes',
        cabecalho: 'Lactantes',
        familia: 'essencial',
        numerica: true,
        ordenar: (l) => l.lactantes,
        // A categoria vem resolvida da view: `rebanho.categoria` guarda o UUID da
        // categoria, e comparar essa coluna com o texto 'lactante' nunca casa —
        // é uma das armadilhas que deixam a tela vazia sem dar erro.
        titulo: () => 'Fêmeas em lactação, pela categoria do animal',
        celula: (l) => <span className="tabular-nums">{formatarInteiro(l.lactantes)}</span>,
      },
      {
        chave: 'ultimo_lancamento_em',
        cabecalho: 'Último lançamento',
        familia: 'essencial',
        // D2: o sinal de vida é o LANÇAMENTO, não o login — não existe coluna de
        // último acesso, e `auth.users` é nulo para todo colaborador legado.
        // Ordenar por DIAS, e não pela data, mantém "nunca lançou" como NULL —
        // que a <AdmTable> joga para o fim nos DOIS sentidos, em vez de fingir
        // ser a data mais antiga do mundo e liderar a lista de abandonados. O
        // pior aparece no topo no segundo clique (decrescente).
        ordenar: (l) => l.dias_sem_lancar,
        titulo: (l) =>
          [
            // Score nulo tem TRÊS causas (adm_10:188-192), e afirmar só uma faz
            // a tela mentir justamente sobre a categoria que ela existe para
            // revelar: uma fazenda de consultoria com 500 animais e três anos de
            // lançamento seria descrita como "nova demais para pontuar".
            l.health_score != null
              ? `health score ${l.health_score}`
              : l.produtor_id == null
                ? 'sem score: a assinatura é do técnico, não desta fazenda'
                : l.animais_ativos === 0
                  ? 'sem score: nenhum animal vivo cadastrado'
                  : 'sem score: conta com menos de 14 dias',
            l.ultimo_modulo ? `último módulo: ${l.ultimo_modulo}` : null,
            `${formatarInteiro(l.lancamentos_30d)} lançamentos em 30 dias`,
          ]
            .filter((p): p is string => !!p)
            .join(' · '),
        celula: (l) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className={cn('size-1.5 shrink-0 rounded-full', corDoScore(l.health_score))} aria-hidden="true" />
            <span className={cn(l.ultimo_lancamento_em == null && 'text-muted-foreground')}>
              {l.ultimo_lancamento_em == null ? 'nunca' : formatarDiasRelativo(l.dias_sem_lancar)}
            </span>
          </span>
        ),
      },
      {
        chave: 'colaboradores',
        cabecalho: 'Equipe',
        familia: 'essencial',
        numerica: true,
        // A "relação dos colaboradores" que o Felipe pediu vive na aba Equipe da
        // ficha, com nome e permissão de cada um. Aqui é o TAMANHO da equipe:
        // uma fazenda com quatro pessoas lançando é um cliente diferente de uma
        // com o dono sozinho, e isso se lê de relance numa coluna.
        ordenar: (l) => l.colaboradores + l.tecnicos_vinculados,
        titulo: (l) =>
          `${formatarInteiro(l.colaboradores)} colaborador(es) desta fazenda · ` +
          `${formatarInteiro(l.tecnicos_vinculados)} técnico(s) com vínculo ativo de consultoria`,
        celula: (l) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatarInteiro(l.colaboradores)}
            <span className="text-muted-foreground"> col</span>
            <span className="text-muted-foreground"> · </span>
            {formatarInteiro(l.tecnicos_vinculados)}
            <span className="text-muted-foreground"> téc</span>
          </span>
        ),
      },
      {
        chave: 'status_efetivo',
        cabecalho: 'Plano / status',
        familia: 'essencial',
        ordenar: (l) => l.status_efetivo,
        // A assinatura é do DONO: a fazenda não assina, o produtor assina. Numa
        // fazenda de consultoria não há plano nenhum para mostrar, e o traço aqui
        // é o certo — o porquê está na coluna do produtor.
        titulo: (l) =>
          l.produtor_id == null
            ? 'Fazenda de consultoria: a assinatura é do técnico, não desta fazenda'
            : `Assinatura da conta #${l.produtor_id} · ${l.acesso_ativo ? 'acesso liberado hoje' : 'sem acesso hoje'}`,
        celula: (l) => {
          const info = l.status_efetivo ? STATUS_INFO[l.status_efetivo] : undefined;
          return (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              {info ? (
                <span className={cn('shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs', info.classe)}>
                  {info.rotulo}
                </span>
              ) : (
                <span className="shrink-0 text-muted-foreground">{l.status_efetivo ?? VAZIO}</span>
              )}
              <span className="truncate text-muted-foreground">{l.plano_nome ?? ''}</span>
            </span>
          );
        },
      },
      {
        chave: 'lancamentos_30d',
        cabecalho: 'Lançamentos 30d',
        familia: 'detalhe',
        numerica: true,
        ordenar: (l) => l.lancamentos_30d,
        titulo: () => 'Lançamentos nas 8 tabelas de trabalho diário, nos últimos 30 dias',
        celula: (l) => <span className="tabular-nums">{formatarInteiro(l.lancamentos_30d)}</span>,
      },
      {
        chave: 'id',
        cabecalho: '# propriedade',
        familia: 'detalhe',
        numerica: true,
        ordenar: (l) => l.id,
        // `propriedades.id`, não `usuarios.id` — o cabeçalho diz qual dos dois,
        // porque D1 fez do "#" o número DO USUÁRIO em todo o resto do painel.
        titulo: () => 'propriedades.id — o tenant real do banco, o que 93 tabelas carregam',
        celula: (l) => <span className="tabular-nums text-muted-foreground">{l.id}</span>,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs tabular-nums text-muted-foreground">
        <span className="text-foreground">{formatarInteiro(visiveis.length)}</span> de{' '}
        {formatarInteiro(propriedades.length)} fazendas · {formatarInteiro(animais)} animais na seleção
        {semProdutor > 0 && <> · {formatarInteiro(semProdutor)} sem produtor no sistema</>}
      </p>

      <AdmTable
        id="propriedades"
        colunas={colunas}
        linhas={propriedades}
        chave={(l) => String(l.id)}
        facetas={facetas}
        agora={agora}
        // O botão "abrir ficha completa" do painel lateral. A <AdmTable> pede uma
        // string por linha e não tem como uma linha não ter destino; para a
        // fazenda de consultoria o menos errado é o diretório de técnicos, que é
        // onde se acha quem a atende (a célula do produtor já explicou por quê).
        // No dia em que o contrato trouxer o id do técnico, isto vira um link
        // direto e este comentário some.
        hrefLinha={(l) => l.ficha ?? '/adm/consultores'}
        substantivo="fazendas"
        vazio={
          <EstadoVazio
            titulo="Nenhuma fazenda com esses filtros"
            texto="O diretório traz TODAS as propriedades, inclusive as de consultoria — que não têm produtor no app e não aparecem na lista de usuários."
          />
        }
      />
    </div>
  );
}
