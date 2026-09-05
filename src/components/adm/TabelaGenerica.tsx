'use client';

import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { AdmTable, type AdmColuna } from '@/components/adm/AdmTable';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import type { FacetaDef, ValorFaceta } from '@/components/adm/AdmFilters';
import { ExportMenu, type ColunaExport } from '@/components/adm/ExportMenu';
import { formatarInteiro } from '@/lib/adm/format';
import {
  chaveRota,
  colunasComFaceta,
  colunasPermitidas,
  getRegistro,
  type TabelaCatalogo,
} from '@/lib/adm/tabelas';
import { SEGMENTO_ROTULO, type ColunaRegistro } from '@/lib/adm/types';

/**
 * O motor de tela do escape hatch: registro do catálogo + linhas do servidor →
 * <AdmTable> com facetas, seletor de colunas e exportação.
 *
 * É o componente que faz as abas curadas (Rebanho, Produção) serem "presets
 * bonitos sobre o mesmo motor" em vez de código duplicado: elas montam cards e
 * gráficos por cima e chamam ISTO por baixo, com o mesmo registro que a página
 * genérica `/tabelas/[tabela]` usaria. Tabela nova no catálogo = tela nova, sem
 * um arquivo a mais.
 *
 * POR QUE É CLIENT COMPONENT, e não Server: `AdmColuna.celula`, `AdmColuna.ordenar`
 * e `FacetaDef.valor` são FUNÇÕES, e função não atravessa a fronteira RSC. Montar
 * as colunas no servidor e passá-las como prop lançaria em runtime. Então quem
 * lê o banco é a página (Server Component, com a `service_role`), e quem traduz
 * o catálogo em colunas e facetas é este arquivo, no cliente. A `service_role`
 * nunca chega perto daqui: só entram linhas já projetadas.
 *
 * O REGISTRO NÃO VIAJA COMO PROP — chega a chave de rota (`tabela`) e o catálogo
 * é reaberto aqui com `getRegistro()`. `src/lib/adm/tabelas-dados.ts` é módulo
 * puro e estático, importável dos dois lados; mandar o registro do `rebanho`
 * inteiro pelo payload RSC seriam ~8 KB de metadado repetidos a cada navegação,
 * para descrever algo que o bundle do cliente já tem.
 *
 * MODO CLIENTE, com teto explícito. A página busca até 1.000 linhas de uma vez
 * (o teto de `paginar()` em queries.ts) e a AdmTable filtra, ordena e pagina em
 * memória — instantâneo, com contagem por valor nas facetas, e é o caso de quase
 * tudo (31 propriedades). Quando o conjunto do escopo é maior que isso, a tela
 * DIZ que está truncada em vez de fingir que aquilo é o total: um "1–50 de 4.820"
 * calculado sobre 1.000 linhas seria um número certo apontando para o conjunto
 * errado. O caminho da Fase 2 já existe em queries.ts (`cursor` + keyset e
 * `modo="servidor"` da AdmTable) — falta só o parse de `?sort=`/`?f.*` no servidor.
 */

type Linha = Record<string, unknown>;

/** Sufixo da coluna sintética com o rótulo de uma FK resolvida (`categoria` →
 *  `categoria__rotulo`). Duplicado de `SUFIXO_ROTULO` em queries.ts pelo mesmo
 *  motivo que a AdmTable duplica: aquele arquivo abre com `import 'server-only'`
 *  e importá-lo daqui quebraria o build deste Client Component. Duplicar uma
 *  string custa menos que o acoplamento inverso. */
const SUFIXO_ROTULO = '__rotulo';

export interface TabelaGenericaProps {
  /** Chave de rota do catálogo — `chaveRota(registro)`, não o nome físico. */
  tabela: string;
  linhas: Linha[];
  /** O total do escopo no banco. Pode ser maior que `linhas.length` (truncado). */
  total: number;
  /** As colunas que o servidor REALMENTE projetou. Vira `visiveisPadrao`. */
  colunas: string[];
  usuarioId: number;
  /** Instante do servidor (ISO): as facetas de data cortam por ele, não por um
   *  `new Date()` do browser, que divergiria na hidratação. */
  agora: string;
  /** `true` quando o total veio do planner do Postgres (tabela volumosa). */
  aproximado?: boolean;
  /** Falha da consulta. Vazio ≠ quebrado: os dois estados são desenhados diferente. */
  erro?: string | null;
  /** Colunas pedidas em `?cols=` e recusadas pela allowlist do catálogo. */
  rejeitadas?: string[];
  /** Escopo sem nenhuma propriedade — nem chegou a consultar. */
  escopoVazio?: boolean;
  titulo?: string;
  descricao?: string;
  /** Link para a mesma tabela na página do escape hatch, onde ela aparece
   *  sozinha, com o catálogo de colunas e as notas de escopo do registro. */
  hrefCompleto?: string;
}

export function TabelaGenerica({
  tabela,
  linhas,
  total,
  colunas,
  usuarioId,
  agora,
  aproximado = false,
  erro = null,
  rejeitadas = [],
  escopoVazio = false,
  titulo,
  descricao,
  hrefCompleto,
}: TabelaGenericaProps) {
  const registro = getRegistro(tabela);
  if (!registro) return null;

  const permitidas = colunasPermitidas(registro);
  const chavePk = chaveDaLinha(registro);

  // TODAS as colunas permitidas viram AdmColuna, não só as projetadas: é o que
  // deixa o seletor de colunas oferecer o catálogo inteiro. Marcar uma coluna
  // escreve `?cols=` na URL, o servidor reprojeta e o dado chega — por isso o
  // seletor pode oferecer mais do que veio nesta resposta.
  const colunasGrade: AdmColuna<Linha>[] = permitidas.map((coluna, indice) => ({
    chave: coluna.chave,
    cabecalho: coluna.rotulo,
    tipo: coluna.tipo,
    familia: coluna.familia,
    // A primeira coluna é a identificação: sem ela a grade vira uma parede de
    // valores sem sujeito. É o mesmo `requiredKeys` do CsvExport do /katmandu.
    fixa: indice === 0 || undefined,
  }));

  const facetas: FacetaDef<Linha>[] = colunasComFaceta(registro).map((coluna) => ({
    chave: coluna.chave,
    rotulo: coluna.rotulo,
    tipo: coluna.faceta ?? 'texto',
    // O valor da faceta é o RÓTULO da FK quando ele existe. Sem isto, o chip de
    // "Categoria" listaria UUIDs de 36 caracteres — a mesma armadilha do
    // `rebanho.categoria`, agora na barra de filtros.
    valor: (linha) => valorDeFaceta(linha, coluna),
    rotuloValor: rotuloDeValor,
  }));

  const colunasExport: ColunaExport[] = permitidas.map((coluna, indice) => ({
    chave: coluna.chave,
    rotulo: coluna.rotulo,
    fixa: indice === 0 || undefined,
  }));

  const truncado = total > linhas.length;

  return (
    <section className="flex flex-col gap-3">
      {(titulo || descricao || hrefCompleto) && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            {titulo && <h2 className="text-lg">{titulo}</h2>}
            {descricao && <p className="mt-0.5 max-w-3xl text-sm text-muted-foreground">{descricao}</p>}
          </div>
          {hrefCompleto && (
            <Link
              href={hrefCompleto}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Abrir só esta tabela
              <ExternalLink size={13} strokeWidth={1.8} aria-hidden />
            </Link>
          )}
        </div>
      )}

      {erro && <Aviso tom="erro">{erro}</Aviso>}

      {rejeitadas.length > 0 && (
        <Aviso tom="atencao">
          Coluna ignorada por não existir no catálogo desta tabela ou por estar bloqueada:{' '}
          <span className="font-mono">{rejeitadas.join(', ')}</span>.
        </Aviso>
      )}

      {truncado && (
        <Aviso tom="atencao">
          Mostrando as {formatarInteiro(linhas.length)} linhas mais recentes de{' '}
          {aproximado ? '~' : ''}
          {formatarInteiro(total)}. Filtro, ordenação e contagem valem sobre essas — para o conjunto
          inteiro, use a exportação.
        </Aviso>
      )}

      <AdmTable<Linha>
        // Identidade da preferência de colunas no localStorage. Leva a tabela e
        // NÃO o usuário: a escolha de colunas é do operador, e trocar de cliente
        // não deve zerar a vista que ele acabou de montar.
        id={`tabela:${chaveRota(registro)}`}
        colunas={colunasGrade}
        linhas={linhas}
        chave={(linha) => String(linha[chavePk] ?? '')}
        visiveisPadrao={colunas}
        facetas={facetas}
        modo="cliente"
        agora={agora}
        substantivo={registro.rotulo.toLowerCase()}
        vazio={<Vazio registro={registro} escopoVazio={escopoVazio} temErro={erro !== null} />}
        acoes={
          <ExportMenu
            colunas={colunasExport}
            visiveis={colunas}
            parametros={{ tabela: chaveRota(registro), usuario: String(usuarioId) }}
            nomeArquivo={`${chaveRota(registro)}-${usuarioId}`}
            totalFiltrado={total}
            totalPagina={linhas.length}
          />
        }
      />
    </section>
  );
}

/**
 * A chave estável de cada linha. Espelha `chaveDaTabela()` de queries.ts — `id`
 * em quase todo o schema, `animal_id` nas 1:1 com `rebanho` (que não têm `id`).
 * Duplicado pelo mesmo motivo do SUFIXO_ROTULO: queries.ts é server-only.
 */
function chaveDaLinha(registro: TabelaCatalogo): string {
  const tem = (c: string) => registro.colunas.some((k) => k.chave === c);
  if (!tem('id') && tem('animal_id')) return 'animal_id';
  return 'id';
}

function valorDeFaceta(linha: Linha, coluna: ColunaRegistro): ValorFaceta {
  const rotulo = linha[`${coluna.chave}${SUFIXO_ROTULO}`];
  if (typeof rotulo === 'string' && rotulo.trim() !== '') return rotulo;
  const bruto = linha[coluna.chave];
  if (bruto === null || bruto === undefined) return bruto;
  if (typeof bruto === 'string' || typeof bruto === 'number' || typeof bruto === 'boolean') return bruto;
  // `text[]` do Postgres (propriedades.segmentos): a linha pertence a vários
  // valores da mesma faceta, e a AdmFilters já sabe lidar com o array.
  if (Array.isArray(bruto)) return bruto.map((v) => (v === null ? null : String(v)));
  return String(bruto);
}

/** Rótulos fechados que o painel inteiro já traduz. O resto sai como está — o
 *  catálogo guarda o valor cru do banco, e inventar tradução por heurística
 *  ('nao_lactante' → 'Não lactante') criaria rótulos que não batem com o app. */
function rotuloDeValor(valor: string): string {
  return SEGMENTO_ROTULO[valor as keyof typeof SEGMENTO_ROTULO] ?? valor;
}

/**
 * Vazio tem três causas e cada uma pede uma ação diferente. Uma tela que diz só
 * "nenhum registro" faz o operador procurar bug onde há informação de negócio —
 * "este cliente nunca usou o módulo financeiro" é dado de venda, não falha. O
 * caso `sem-config` não passa por aqui: ele é tratado no layout da ficha, antes
 * de qualquer aba renderizar.
 */
function Vazio({
  registro,
  escopoVazio,
  temErro,
}: {
  registro: TabelaCatalogo;
  escopoVazio: boolean;
  temErro: boolean;
}) {
  if (temErro) {
    return <EstadoVazio titulo="A consulta falhou" texto="O aviso acima tem o motivo e o código do PostgREST." />;
  }
  if (escopoVazio) {
    return (
      <EstadoVazio
        titulo="Sem propriedade no escopo"
        texto="Este usuário não alcança nenhuma fazenda, então não há linha nenhuma para listar aqui."
      />
    );
  }
  return (
    <EstadoVazio
      titulo={`Nenhum registro em ${registro.rotulo}`}
      texto="O módulo existe no app e este cliente nunca o usou — o que é informação de adoção, não falha da tela."
    />
  );
}

function Aviso({ tom, children }: { tom: 'erro' | 'atencao'; children: React.ReactNode }) {
  return (
    <p
      className={
        tom === 'erro'
          ? 'flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-destructive'
          : 'flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground'
      }
    >
      <AlertTriangle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
