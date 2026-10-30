import 'server-only';

import {
  MINIMO_BENCHMARK,
  VIEWS_MELHORAMENTO,
  type LinhaMelhoramentoFazenda,
  type LinhaMelhoramentoLactacao,
  type LinhaMelhoramentoPedigree,
} from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, type Resultado } from '@/lib/adm/types';
import { analisarFazenda, type AnaliseFazenda } from '@/lib/melhoramento/analise';
import {
  candidatosMesmoAnimal,
  reprodutoresConectores,
  type CandidatoMesmoAnimal,
  type ReprodutorConector,
} from '@/lib/melhoramento/conexao';
import { resumirEntreFazendas, type ResumoEntreFazendas } from '@/lib/melhoramento/resumo';
import {
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  type AnimalEntrada,
  type EspecieChave,
  type LactacaoEntrada,
} from '@/lib/melhoramento/tipos';
import { criarCache, type Cache } from '@/lib/sheets/cache';

/**
 * ÁREA MELHORAMENTO (interna) — a leitura das views `adm.melhoramento_*` e a
 * chamada do motor de src/lib/melhoramento/.
 *
 * SÓ PARA O FELIPE. Nada daqui chega ao app nem ao dossiê: a aba é
 * `noDossie: false`, as views só têm grant para a service_role, e o cálculo
 * acontece aqui, no servidor, ao abrir a página. NADA É GRAVADO — nem no
 * schema `melhoramento` (as views de leitura dele já existem para a próxima
 * versão, em que rodadas forem persistidas). O /adm continua somente leitura.
 *
 * CACHE CURTO EM MEMÓRIA, POR INSTÂNCIA (src/lib/sheets/cache.ts), e não o
 * data cache do Next (`unstable_cache`): este resultado leva número e nome de
 * animal de cliente, e o data cache da Vercel o persistiria fora do processo,
 * além do limite de 2 MB por item que o repo já documentou lá. Cinco minutos
 * bastam para reabrir a aba sem recalcular o BLUP; quem precisar do número de
 * agora espera o prazo.
 *
 * Mesmas regras de leitura do resto do /adm: projeção explícita conferida em
 * compilação contra o contrato, paginação com teto que vira ERRO (nunca lista
 * truncada), e falta de view vira 'sem-config', não "fazenda sem dados".
 */

const SQL = 'supabase/melhoramento/melhoramento_02_views.sql';
const TTL_MS = 5 * 60 * 1000;

const PROJ_LACTACAO = {
  propriedade_id: true,
  especie: true,
  lactacao_id: true,
  animal_id: true,
  raca: true,
  ordem_lactacao: true,
  lactacoes_do_animal: true,
  ordem_parto_cadastro: true,
  data_inicio: true,
  ano_parto: true,
  mes_parto: true,
  estacao_parto: true,
  ano_estacao: true,
  idade_parto_dias: true,
  data_encerramento: true,
  encerrada: true,
  duracao_dias: true,
  dias_registrados: true,
  total_leite: true,
  media_leite: true,
  metodo_inferencia: true,
  confianca_inferencia: true,
  sintetica: true,
  pai_id: true,
  mae_id: true,
} satisfies Record<keyof LinhaMelhoramentoLactacao, true>;

const PROJ_PEDIGREE = {
  animal_id: true,
  propriedade_id: true,
  especie: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  data_de_nascimento: true,
  pai_id: true,
  mae_id: true,
  raca: true,
  status: true,
} satisfies Record<keyof LinhaMelhoramentoPedigree, true>;

const PROJ_FAZENDA = {
  propriedade_id: true,
  especie: true,
  nome: true,
  produtor_id: true,
  teste: true,
  animais: true,
  lactacoes: true,
  lactacoes_encerradas: true,
  lactacoes_sinteticas: true,
} satisfies Record<keyof LinhaMelhoramentoFazenda, true>;

const SELECT_LACTACAO = Object.keys(PROJ_LACTACAO).join(',');
const SELECT_PEDIGREE = Object.keys(PROJ_PEDIGREE).join(',');
const SELECT_FAZENDA = Object.keys(PROJ_FAZENDA).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Tradução linha → entrada do motor
// ─────────────────────────────────────────────────────────────────────────────

function inteiroOuNull(v: unknown): number | null {
  const n = numeroDe(v);
  return n == null ? null : Math.round(n);
}

export function paraLactacao(l: Linha): LactacaoEntrada {
  return {
    lactacaoId: inteiroOuNull(l.lactacao_id) ?? 0,
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    propriedadeId: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    raca: textoDe(l.raca),
    ordemLactacao: inteiroOuNull(l.ordem_lactacao) ?? 1,
    lactacoesDoAnimal: inteiroOuNull(l.lactacoes_do_animal) ?? 1,
    ordemPartoCadastro: inteiroOuNull(l.ordem_parto_cadastro),
    dataInicio: textoDe(l.data_inicio) ?? '',
    anoEstacao: inteiroOuNull(l.ano_estacao) ?? 0,
    estacao: textoDe(l.estacao_parto) ?? '',
    idadePartoDias: inteiroOuNull(l.idade_parto_dias),
    encerrada: l.encerrada === true,
    duracaoDias: inteiroOuNull(l.duracao_dias),
    totalLeite: numeroDe(l.total_leite),
    mediaLeite: numeroDe(l.media_leite),
    metodo: textoDe(l.metodo_inferencia),
    sintetica: l.sintetica === true,
    paiId: inteiroOuNull(l.pai_id),
    maeId: inteiroOuNull(l.mae_id),
  };
}

export function paraAnimal(l: Linha): AnimalEntrada {
  return {
    animalId: inteiroOuNull(l.animal_id) ?? 0,
    propriedadeId: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    numero: textoDe(l.numero_animal),
    nome: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    nascimento: textoDe(l.data_de_nascimento),
    paiId: inteiroOuNull(l.pai_id),
    maeId: inteiroOuNull(l.mae_id),
  };
}

function paraFazenda(l: Linha): LinhaMelhoramentoFazenda {
  return {
    propriedade_id: inteiroOuNull(l.propriedade_id) ?? 0,
    especie: textoDe(l.especie) ?? '',
    nome: textoDe(l.nome),
    produtor_id: inteiroOuNull(l.produtor_id),
    teste: l.teste === true,
    animais: inteiroOuNull(l.animais) ?? 0,
    lactacoes: inteiroOuNull(l.lactacoes) ?? 0,
    lactacoes_encerradas: inteiroOuNull(l.lactacoes_encerradas) ?? 0,
    lactacoes_sinteticas: inteiroOuNull(l.lactacoes_sinteticas) ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

interface Filtro {
  /** Lactação e pedigree são sempre lidos com espécie; a lista de fazendas pode vir sem. */
  especie?: EspecieChave;
  propriedadeId?: number;
}

type ComEq = { eq(coluna: string, valor: unknown): ComEq } & Consulta;

function aplicarFiltro(q: Consulta, f: Filtro): Consulta {
  let saida = q as ComEq;
  if (f.especie != null) saida = saida.eq('especie', f.especie);
  if (f.propriedadeId != null) saida = saida.eq('propriedade_id', f.propriedadeId);
  return saida;
}

export async function listarFazendasMelhoramento(f: Filtro): Promise<Resultado<LinhaMelhoramentoFazenda[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.fazenda;
  const res = await paginarView(view, SQL, (de, ate) =>
    aplicarFiltro(supa.from(view).select(SELECT_FAZENDA) as unknown as Consulta, f)
      // Ordem TOTAL: uma propriedade pode ter caprinos e ovinos (duas linhas).
      .order('propriedade_id', { ascending: true })
      .order('especie', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraFazenda)) : res;
}

/**
 * As sintéticas ficam no banco (`sintetica = false`): são 1.500 linhas de
 * teste do app numa fazenda só, e trafegá-las a cada abertura não acrescenta
 * nada. A contagem delas vem de adm.melhoramento_fazenda e vai para o
 * diagnóstico, que continua dizendo quantas eram.
 */
async function lerLactacoes(f: Filtro & { especie: EspecieChave }): Promise<Resultado<LactacaoEntrada[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.lactacao;
  const res = await paginarView(view, SQL, (de, ate) =>
    (aplicarFiltro(supa.from(view).select(SELECT_LACTACAO) as unknown as Consulta, f) as ComEq)
      .eq('sintetica', false)
      .order('lactacao_id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraLactacao)) : res;
}

async function lerPedigree(f: Filtro & { especie: EspecieChave }): Promise<Resultado<AnimalEntrada[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.pedigree;
  const res = await paginarView(view, SQL, (de, ate) =>
    aplicarFiltro(supa.from(view).select(SELECT_PEDIGREE) as unknown as Consulta, f)
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraAnimal)) : res;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo com cache
// ─────────────────────────────────────────────────────────────────────────────

/** Leva o Resultado de falha para fora do cache: falha não é guardada. */
class FalhaDeLeitura extends Error {
  readonly resultado: Resultado<never>;
  constructor(resultado: Resultado<never>) {
    super(resultado.ok ? 'falha' : resultado.detalhe);
    this.resultado = resultado;
  }
}

async function comCache<T>(
  cache: Cache<T>,
  chave: string,
  carregar: () => Promise<Resultado<T>>,
): Promise<Resultado<{ valor: T; calculadoEm: number }>> {
  try {
    const r = await cache.obter(chave, async () => {
      const res = await carregar();
      if (!res.ok) throw new FalhaDeLeitura(res as Resultado<never>);
      return res.dados;
    });
    return ok({ valor: r.valor, calculadoEm: r.carregadoEm });
  } catch (e) {
    if (e instanceof FalhaDeLeitura) return e.resultado;
    console.error('[adm] melhoramento: o cálculo falhou', chave, e);
    return erro(`[adm] melhoramento: o cálculo falhou — ${e instanceof Error ? e.message : String(e)}`);
  }
}

const cacheFazenda = criarCache<AnaliseFazenda>(TTL_MS);
const cacheEspecie = criarCache<VisaoEspecie>(TTL_MS);

export interface AnaliseComHora {
  analise: AnaliseFazenda;
  calculadoEm: number;
}

/**
 * A análise completa de UMA fazenda (com rankings) — a aba da ficha do
 * cliente. Lê só as linhas desta propriedade: nada de outra fazenda entra no
 * cálculo nem no payload desta tela.
 */
export async function getMelhoramentoFazenda(
  propriedadeId: number,
  especie: EspecieChave,
): Promise<Resultado<AnaliseComHora>> {
  if (!ESPECIES_MELHORAMENTO[especie].leDados) return erro(`[adm] melhoramento: ${especie} não é lido nesta versão`);
  const res = await comCache(cacheFazenda, `fazenda|${especie}|${propriedadeId}`, async () => {
    const f = { especie, propriedadeId };
    const [lact, ped, faz] = await Promise.all([lerLactacoes(f), lerPedigree(f), listarFazendasMelhoramento(f)]);
    if (!lact.ok) return lact;
    if (!ped.ok) return ped;
    if (!faz.ok) return faz;
    return ok(
      analisarFazenda(
        {
          propriedadeId,
          especie,
          lactacoes: lact.dados,
          animais: ped.dados,
          sinteticasForaDaLeitura: faz.dados[0]?.lactacoes_sinteticas ?? 0,
        },
        { ranking: true },
      ),
    );
  });
  return res.ok ? ok({ analise: res.dados.valor, calculadoEm: res.dados.calculadoEm }) : res;
}

function agruparPorFazenda<T extends { propriedadeId: number }>(linhas: readonly T[]): Map<number, T[]> {
  const saida = new Map<number, T[]>();
  for (const l of linhas) {
    const lista = saida.get(l.propriedadeId);
    if (lista) lista.push(l);
    else saida.set(l.propriedadeId, [l]);
  }
  return saida;
}

export interface FazendaNaVisao {
  fazenda: LinhaMelhoramentoFazenda;
  analise: AnaliseFazenda;
}

export interface VisaoEspecie {
  especie: EspecieChave;
  /** Toda fazenda com rebanho da espécie — para dar nome às fazendas dos candidatos. */
  todasFazendas: LinhaMelhoramentoFazenda[];
  fazendas: FazendaNaVisao[];
  /** Fazendas com rebanho da espécie e nenhuma lactação real — só contadas. */
  semLactacao: number;
  resumo: ResumoEntreFazendas[];
  conectores: ReprodutorConector[];
  candidatos: CandidatoMesmoAnimal[];
}

/**
 * A visão entre fazendas de uma espécie: diagnóstico e validação de cada
 * fazenda (sem ranking — ranking é da ficha do cliente), o resumo agregado com
 * a regra de 7 fazendas, e a conexão genética. Esta é a ÚNICA tela que junta
 * fazendas — e por isso a única que lista os candidatos a mesmo reprodutor.
 */
export async function getMelhoramentoEspecie(especie: EspecieChave): Promise<Resultado<VisaoEspecie & { calculadoEm: number }>> {
  if (!ESPECIES_MELHORAMENTO[especie].leDados) return erro(`[adm] melhoramento: ${especie} não é lido nesta versão`);
  const res = await comCache(cacheEspecie, `especie|${especie}`, async () => {
    const f = { especie };
    const [faz, lact, ped] = await Promise.all([listarFazendasMelhoramento(f), lerLactacoes(f), lerPedigree(f)]);
    if (!faz.ok) return faz;
    if (!lact.ok) return lact;
    if (!ped.ok) return ped;

    const lactPor = agruparPorFazenda(lact.dados);
    const pedPor = agruparPorFazenda(ped.dados);

    const comLactacao = faz.dados.filter((z) => (lactPor.get(z.propriedade_id)?.length ?? 0) > 0);
    const fazendas: FazendaNaVisao[] = comLactacao
      .map((z) => ({
        fazenda: z,
        analise: analisarFazenda(
          {
            propriedadeId: z.propriedade_id,
            especie,
            lactacoes: lactPor.get(z.propriedade_id) ?? [],
            animais: pedPor.get(z.propriedade_id) ?? [],
            sinteticasForaDaLeitura: z.lactacoes_sinteticas,
          },
          { ranking: false },
        ),
      }))
      .sort((a, b) => b.analise.diagnostico.caracteristicas[0].registros - a.analise.diagnostico.caracteristicas[0].registros);

    const analisadas = fazendas.map((x) => ({ teste: x.fazenda.teste, analise: x.analise }));
    return ok({
      especie,
      todasFazendas: faz.dados,
      fazendas,
      semLactacao: faz.dados.length - comLactacao.length,
      resumo: ORDEM_CARACTERISTICAS.map((c) => resumirEntreFazendas(analisadas, c, MINIMO_BENCHMARK)),
      conectores: reprodutoresConectores(ped.dados),
      candidatos: candidatosMesmoAnimal(ped.dados),
    });
  });
  return res.ok ? ok({ ...res.dados.valor, calculadoEm: res.dados.calculadoEm }) : res;
}
