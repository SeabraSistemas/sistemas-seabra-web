import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { escopoConsolidado, idsDoEscopo, lerSelecaoParam } from '@/lib/adm/escopo';
import { formatarInteiro } from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, registrosPorArea, type TabelaCatalogo } from '@/lib/adm/tabelas';
import type { Escopo } from '@/lib/adm/types';

/**
 * O índice do escape hatch: TODAS as tabelas do banco declaradas no catálogo,
 * agrupadas por área, com a contagem de linhas DESTE escopo em cada uma.
 *
 * Por que a contagem importa mais que a lista: "financeiro_lancamentos — 0" não
 * é uma tabela vazia, é a informação de que este cliente nunca abriu o módulo
 * financeiro. O índice vira mapa de adoção por módulo, que é material de venda e
 * de suporte, não só navegação.
 *
 * CUSTO, declarado: são ~43 registros e cada contagem é uma ida ao PostgREST.
 * Rodam em lotes para não abrir 43 conexões de uma vez, e as tabelas volumosas
 * usam a contagem do PLANNER (`count: 'planned'`, marcada com "~" na tela) —
 * um COUNT(*) exato em `controle_leiteiro` varre dezenas de milhares de linhas
 * para desenhar um número ao lado de um link.
 */

/** Requisições simultâneas ao PostgREST. Seis é o meio-termo entre uma cascata
 *  de 43 idas em série e um estouro de conexões do pooler. */
const LOTE = 6;

interface Contagem {
  registro: TabelaCatalogo;
  total: number | null;
  aproximado: boolean;
  erro: string | null;
}

export default async function IndiceTabelasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const usuarioId = Number(id);
  const selecao = lerSelecaoParam((await searchParams).prop);

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;
  const grupos = registrosPorArea();
  const contagens = await contar(escopo, grupos.flatMap((g) => g.registros));
  const porNome = new Map(contagens.map((c) => [chaveRota(c.registro), c]));

  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const comLinhas = contagens.filter((c) => (c.total ?? 0) > 0).length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl">Todas as tabelas</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Cobertura completa do banco a partir do catálogo declarativo — cada entrada abre a mesma
          grade, com filtros, seletor de colunas e exportação. {formatarInteiro(contagens.length)}{' '}
          tabelas mapeadas, {formatarInteiro(comLinhas)} com registros neste escopo.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {escopoConsolidado(escopo)
            ? `Contagens somando ${formatarInteiro(escopo.propriedades.length)} propriedades do escopo.`
            : escopo.selecionada
              ? `Contagens da propriedade ${escopo.selecionada.nome}.`
              : 'Sem propriedade no escopo — as tabelas escopadas por fazenda aparecem zeradas.'}
        </p>
      </header>

      {grupos.map((grupo) => (
        <section key={grupo.area} className="flex flex-col gap-3">
          <h2 className="text-lg">{grupo.area}</h2>
          <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {grupo.registros.map((registro) => {
              const chave = chaveRota(registro);
              const contagem = porNome.get(chave);
              return (
                <li key={chave}>
                  <Link
                    href={`/adm/u/${usuarioId}/tabelas/${chave}${sufixo}`}
                    className="flex h-full flex-col rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-input"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-foreground">{registro.rotulo}</span>
                      <Numero contagem={contagem} />
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {registro.descricao}
                    </span>
                    <span className="mt-1.5 font-mono text-[11px] text-muted-foreground/70">
                      {registro.nome}
                      {registro.colunaTenant === 'nenhuma' && ' · catálogo global'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Numero({ contagem }: { contagem: Contagem | undefined }) {
  if (!contagem || contagem.erro) {
    return (
      <span
        className="shrink-0 text-sm text-muted-foreground"
        title={contagem?.erro ?? 'Contagem indisponível'}
      >
        —
      </span>
    );
  }
  const zero = (contagem.total ?? 0) === 0;
  return (
    <span
      className={`shrink-0 text-sm tabular-nums ${zero ? 'text-muted-foreground' : 'text-foreground'}`}
      title={contagem.aproximado ? 'Contagem estimada pelo planner do Postgres' : undefined}
    >
      {contagem.aproximado && (contagem.total ?? 0) > 0 ? '~' : ''}
      {formatarInteiro(contagem.total ?? 0)}
    </span>
  );
}

/**
 * Conta linha por tabela, em lotes. `limite: 1` porque o que interessa é o
 * `count`, não a linha — mas ela vem junto porque o PostgREST resolve as duas
 * coisas na mesma consulta escopada, e pedir zero linhas exigiria uma segunda
 * forma de montar a query só para esta tela.
 *
 * Falha de uma tabela NÃO derruba o índice: vira um traço com o motivo no title.
 * Uma tabela com escopo impossível (o caso de `analise_leite`, que liga pelo
 * texto livre `id_animal`) é exatamente isso — recusada de propósito por
 * queries.ts, para não devolver linhas de outro criador dentro desta ficha.
 */
async function contar(escopo: Escopo, registros: TabelaCatalogo[]): Promise<Contagem[]> {
  const semEscopo = idsDoEscopo(escopo).length === 0;
  const saida: Contagem[] = [];

  for (let i = 0; i < registros.length; i += LOTE) {
    const lote = registros.slice(i, i + LOTE);
    const resultados = await Promise.all(
      lote.map(async (registro) => {
        // Escopo vazio só zera quem depende de tenant: catálogo global
        // (categoria_animal) continua tendo linhas, e mostrá-lo como 0 seria falso.
        if (semEscopo && registro.colunaTenant !== 'nenhuma') {
          return { registro, total: 0, aproximado: false, erro: null } satisfies Contagem;
        }
        const res = await listarTabela(registro, escopo, { limite: 1, contarTotal: true });
        return {
          registro,
          total: res.ok ? res.dados.total : null,
          aproximado: contagemAproximada(registro),
          erro: res.ok ? null : res.detalhe,
        } satisfies Contagem;
      }),
    );
    saida.push(...resultados);
  }

  return saida;
}

