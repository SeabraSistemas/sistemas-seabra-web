import 'server-only';

import {
  MINIMO_BENCHMARK,
  VIEWS_MELHORAMENTO,
  type LinhaMelhoramentoBovinoFazenda,
  type LinhaMelhoramentoFazenda,
  type LinhaMelhoramentoResultado,
  type LinhaMelhoramentoValidacao,
} from '@/lib/adm/areas/contrato';
import { paginarView, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, type Resultado } from '@/lib/adm/types';
import { analisarFazenda, type AnaliseFazenda } from '@/lib/melhoramento/analise';
import { reprodutoresConectores, type ReprodutorConector } from '@/lib/melhoramento/conexao';
import {
  analisarFazendaCorte,
  type AnaliseFazendaCorte,
  type AnimalCorteEntrada,
  type PesagemCorteEntrada,
} from '@/lib/melhoramento/corte';
import { agruparExecucoes, type ExecucaoGravada } from '@/lib/melhoramento/rodada';
import { resumirEntreFazendas, type ResumoEntreFazendas } from '@/lib/melhoramento/resumo';
import {
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  type AnimalEntrada,
  type EspecieChave,
  type EspecieLeite,
  type LactacaoEntrada,
} from '@/lib/melhoramento/tipos';
import {
  SELECT,
  paraAnimal,
  paraAnimalCorte,
  paraFazenda,
  paraFazendaCorte,
  paraLactacao,
  paraPesagemCorte,
  paraResultadoGravado,
  paraRodada,
  paraValidacaoGravada,
  paraVinculo,
} from '@/lib/melhoramento/traducao';
import { aplicarVinculos, conexaoComVinculos, type ConexaoComVinculos, type VinculoEntrada } from '@/lib/melhoramento/vinculos';
import { criarCache, type Cache } from '@/lib/sheets/cache';

/**
 * ÁREA MELHORAMENTO (interna) — a leitura das views `adm.melhoramento_*` e a
 * chamada do motor de src/lib/melhoramento/.
 *
 * SÓ PARA O FELIPE. Nada daqui chega ao app nem ao dossiê: a aba é
 * `noDossie: false`, as views só têm grant para a service_role, e o cálculo
 * acontece aqui, no servidor, ao abrir a página. O PAINEL NÃO GRAVA NADA: as
 * rodadas que aparecem no histórico foram gravadas pelo script
 * scripts/melhoramento/rodar.ts, rodado à mão; aqui elas só são lidas.
 *
 * CACHE CURTO EM MEMÓRIA, POR INSTÂNCIA (src/lib/sheets/cache.ts), e não o
 * data cache do Next (`unstable_cache`): este resultado leva número e nome de
 * animal de cliente, e o data cache da Vercel o persistiria fora do processo,
 * além do limite de 2 MB por item que o repo já documentou lá. Cinco minutos
 * bastam para reabrir a aba sem recalcular o BLUP; quem precisar do número de
 * agora espera o prazo.
 *
 * Mesmas regras de leitura do resto do /adm: projeção explícita conferida em
 * compilação contra o contrato (src/lib/melhoramento/traducao.ts), paginação
 * com teto que vira ERRO (nunca lista truncada), e falta de view vira
 * 'sem-config', não "fazenda sem dados".
 */

const SQL = 'supabase/melhoramento/melhoramento_02_views.sql';
const SQL_VINCULOS = 'supabase/melhoramento/melhoramento_03_vinculos.sql';
const SQL_CORTE = 'supabase/melhoramento/melhoramento_04_corte.sql';
const TTL_MS = 5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

interface Filtro {
  /** Lactação e pedigree são sempre lidos com espécie; a lista de fazendas pode vir sem. */
  especie?: EspecieChave;
  propriedadeId?: number;
}

type ComFiltros = {
  eq(coluna: string, valor: unknown): ComFiltros;
  in(coluna: string, v: readonly unknown[]): ComFiltros;
  lte(coluna: string, valor: unknown): ComFiltros;
} & Consulta;

function aplicarFiltro(q: Consulta, f: Filtro): Consulta {
  let saida = q as ComFiltros;
  if (f.especie != null) saida = saida.eq('especie', f.especie);
  if (f.propriedadeId != null) saida = saida.eq('propriedade_id', f.propriedadeId);
  return saida;
}

export async function listarFazendasMelhoramento(f: Filtro): Promise<Resultado<LinhaMelhoramentoFazenda[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.fazenda;
  const res = await paginarView(view, SQL, (de, ate) =>
    aplicarFiltro(supa.from(view).select(SELECT.fazenda) as unknown as Consulta, f)
      // Ordem TOTAL: uma propriedade pode ter caprinos e ovinos (duas linhas).
      .order('propriedade_id', { ascending: true })
      .order('especie', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraFazenda)) : res;
}

/** Fazendas com bovino de corte (uma linha por fazenda). */
export async function listarFazendasCorte(propriedadeId?: number): Promise<Resultado<LinhaMelhoramentoBovinoFazenda[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.bovinoFazenda;
  const res = await paginarView(view, SQL_CORTE, (de, ate) =>
    aplicarFiltro(supa.from(view).select(SELECT.bovinoFazenda) as unknown as Consulta, { propriedadeId })
      .order('propriedade_id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraFazendaCorte)) : res;
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
    (aplicarFiltro(supa.from(view).select(SELECT.lactacao) as unknown as Consulta, f) as ComFiltros)
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
    aplicarFiltro(supa.from(view).select(SELECT.pedigree) as unknown as Consulta, f)
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraAnimal)) : res;
}

async function lerAnimaisCorte(filtro: { propriedadeId?: number; ids?: number[] }): Promise<Resultado<AnimalCorteEntrada[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.bovinoAnimal;
  const res = await paginarView(view, SQL_CORTE, (de, ate) => {
    let q = supa.from(view).select(SELECT.bovinoAnimal) as unknown as ComFiltros;
    if (filtro.propriedadeId != null) q = q.eq('propriedade_id', filtro.propriedadeId);
    if (filtro.ids) q = q.in('animal_id', filtro.ids);
    return q.order('animal_id', { ascending: true }).range(de, ate);
  });
  return res.ok ? ok(res.dados.map(paraAnimalCorte)) : res;
}

async function lerPesagensCorte(propriedadeId: number): Promise<Resultado<PesagemCorteEntrada[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.bovinoPesagem;
  const res = await paginarView(view, SQL_CORTE, (de, ate) =>
    (supa.from(view).select(SELECT.bovinoPesagem) as unknown as ComFiltros)
      .eq('propriedade_id', propriedadeId)
      .order('pesagem_id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraPesagemCorte)) : res;
}

/**
 * Os animais de corte da fazenda e os pais deles que moram em OUTRA fazenda
 * (transferência muda propriedade_id na mesma linha — o id é o mesmo animal).
 * Os de fora entram só no pedigree: sem registro, e a tela não mostra o número.
 */
async function lerAnimaisCorteComPais(propriedadeId: number): Promise<Resultado<AnimalCorteEntrada[]>> {
  const base = await lerAnimaisCorte({ propriedadeId });
  if (!base.ok) return base;
  const todos = [...base.dados];
  const presentes = new Set(todos.map((a) => a.animalId));
  for (let geracao = 0; geracao < 5; geracao++) {
    const faltam = [
      ...new Set(todos.flatMap((a) => [a.paiId, a.maeId]).filter((x): x is number => x != null && !presentes.has(x))),
    ];
    if (faltam.length === 0) break;
    for (let i = 0; i < faltam.length; i += 300) {
      const r = await lerAnimaisCorte({ ids: faltam.slice(i, i + 300) });
      if (!r.ok) return r;
      for (const a of r.dados) {
        if (!presentes.has(a.animalId)) todos.push(a);
        presentes.add(a.animalId);
      }
    }
    for (const id of faltam) presentes.add(id);
  }
  return ok(todos);
}

async function lerVinculos(especie: EspecieChave): Promise<Resultado<VinculoEntrada[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const view = VIEWS_MELHORAMENTO.vinculo;
  const res = await paginarView(view, SQL_VINCULOS, (de, ate) =>
    (supa.from(view).select(SELECT.vinculo) as unknown as ComFiltros)
      .eq('especie', especie)
      .order('id', { ascending: true })
      .range(de, ate),
  );
  return res.ok ? ok(res.dados.map(paraVinculo)) : res;
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
const cacheCorte = criarCache<AnaliseFazendaCorte>(TTL_MS);
const cacheEspecie = criarCache<VisaoEspecie>(TTL_MS);
const cacheEspecieCorte = criarCache<VisaoEspecieCorte>(TTL_MS);

export interface AnaliseComHora<T = AnaliseFazenda> {
  analise: T;
  calculadoEm: number;
}

/**
 * A análise completa de UMA fazenda (com rankings) — a aba da ficha do
 * cliente. Lê só as linhas desta propriedade: nada de outra fazenda entra no
 * cálculo nem no payload desta tela.
 */
export async function getMelhoramentoFazenda(
  propriedadeId: number,
  especie: EspecieLeite,
): Promise<Resultado<AnaliseComHora>> {
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

/** A análise de corte de UMA fazenda (com rankings). Os pais de outra fazenda entram só no pedigree. */
export async function getMelhoramentoCorte(propriedadeId: number): Promise<Resultado<AnaliseComHora<AnaliseFazendaCorte>>> {
  const res = await comCache(cacheCorte, `corte|${propriedadeId}`, async () => {
    const [animais, pesagens] = await Promise.all([lerAnimaisCorteComPais(propriedadeId), lerPesagensCorte(propriedadeId)]);
    if (!animais.ok) return animais;
    if (!pesagens.ok) return pesagens;
    return ok(analisarFazendaCorte({ propriedadeId, animais: animais.dados, pesagens: pesagens.dados }, { ranking: true }));
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

/** Um candidato a mesmo reprodutor, com o que a tela precisa para reconhecê-lo. */
export interface CandidatoVinculo {
  vinculo: VinculoEntrada;
  a: { numero: string | null; nome: string | null; filhos: number };
  b: { numero: string | null; nome: string | null; filhos: number };
}

export interface VinculosNaVisao {
  /** null = a view de vínculos não está acessível (o motivo vai em `motivo`). */
  conexao: ConexaoComVinculos | null;
  candidatos: CandidatoVinculo[];
  motivo: string | null;
}

function montarVinculos(
  vinc: Resultado<VinculoEntrada[]>,
  animais: readonly AnimalEntrada[],
  identificar: (id: number) => { numero: string | null; nome: string | null },
  progenie: 'filhas' | 'filhos',
): VinculosNaVisao {
  if (!vinc.ok) return { conexao: null, candidatos: [], motivo: vinc.detalhe };
  const filhos = new Map<number, number>();
  for (const a of animais) {
    if (a.paiId == null) continue;
    if (progenie === 'filhas' && !/^f/i.test(a.sexo ?? '')) continue;
    filhos.set(a.paiId, (filhos.get(a.paiId) ?? 0) + 1);
  }
  return {
    conexao: conexaoComVinculos(animais, vinc.dados),
    candidatos: vinc.dados.map((v) => ({
      vinculo: v,
      a: { ...identificar(v.animalA), filhos: filhos.get(v.animalA) ?? 0 },
      b: { ...identificar(v.animalB), filhos: filhos.get(v.animalB) ?? 0 },
    })),
    motivo: null,
  };
}

export interface FazendaNaVisao {
  fazenda: LinhaMelhoramentoFazenda;
  analise: AnaliseFazenda;
}

export interface VisaoEspecie {
  especie: EspecieLeite;
  /** Toda fazenda com rebanho da espécie — para dar nome às fazendas dos candidatos. */
  todasFazendas: LinhaMelhoramentoFazenda[];
  fazendas: FazendaNaVisao[];
  /** Fazendas com rebanho da espécie e nenhuma lactação real — só contadas. */
  semLactacao: number;
  resumo: ResumoEntreFazendas[];
  /** Conectores com os vínculos CONFIRMADOS aplicados (sem nenhum confirmado, os de sempre). */
  conectores: ReprodutorConector[];
  vinculos: VinculosNaVisao;
}

/**
 * A visão entre fazendas de uma espécie de leite: diagnóstico e validação de
 * cada fazenda (sem ranking — ranking é da ficha do cliente), o resumo
 * agregado com a regra de 7 fazendas, e a conexão genética. Esta é a ÚNICA
 * tela que junta fazendas — e por isso a única que lista os candidatos a mesmo
 * reprodutor.
 */
export async function getMelhoramentoEspecie(
  especie: EspecieLeite,
): Promise<Resultado<VisaoEspecie & { calculadoEm: number }>> {
  if (!ESPECIES_MELHORAMENTO[especie].leDados) return erro(`[adm] melhoramento: ${especie} não é lido nesta versão`);
  const res = await comCache(cacheEspecie, `especie|${especie}`, async () => {
    const f = { especie };
    const [faz, lact, ped, vinc] = await Promise.all([
      listarFazendasMelhoramento(f),
      lerLactacoes(f),
      lerPedigree(f),
      lerVinculos(especie),
    ]);
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
    const porId = new Map(ped.dados.map((a) => [a.animalId, a]));
    // Só os CONFIRMADOS mudam a conta: sem nenhum, é exatamente a de antes.
    const unificados = vinc.ok ? aplicarVinculos(ped.dados, vinc.dados).animais : ped.dados;
    return ok({
      especie,
      todasFazendas: faz.dados,
      fazendas,
      semLactacao: faz.dados.length - comLactacao.length,
      resumo: ORDEM_CARACTERISTICAS.map((c) => resumirEntreFazendas(analisadas, c, MINIMO_BENCHMARK)),
      conectores: reprodutoresConectores(unificados),
      vinculos: montarVinculos(
        vinc,
        ped.dados,
        (id) => ({ numero: porId.get(id)?.numero ?? null, nome: porId.get(id)?.nome ?? null }),
        'filhas',
      ),
    });
  });
  return res.ok ? ok({ ...res.dados.valor, calculadoEm: res.dados.calculadoEm }) : res;
}

export interface FazendaCorteNaVisao {
  fazenda: LinhaMelhoramentoBovinoFazenda;
  analise: AnaliseFazendaCorte;
}

export interface VisaoEspecieCorte {
  especie: 'bovino_corte';
  todasFazendas: LinhaMelhoramentoBovinoFazenda[];
  fazendas: FazendaCorteNaVisao[];
  /** Fazendas com bovino de corte e nenhuma pesagem de desmama — só contadas. */
  semPesagem: number;
  conectores: ReprodutorConector[];
  vinculos: VinculosNaVisao;
}

/**
 * A visão entre fazendas de BOVINOS DE CORTE. Lida fazenda por fazenda (o
 * cadastro de corte passa de 30 mil animais: a leitura da espécie inteira
 * bateria no teto de paginação), sem ranking, com o resumo de conexão.
 */
export async function getMelhoramentoEspecieCorte(): Promise<Resultado<VisaoEspecieCorte & { calculadoEm: number }>> {
  const res = await comCache(cacheEspecieCorte, 'especie|bovino_corte', async () => {
    const [faz, vinc] = await Promise.all([listarFazendasCorte(), lerVinculos('bovino_corte')]);
    if (!faz.ok) return faz;
    const comPesagem = faz.dados.filter((z) => z.animais_janela > 0);
    // Uma fazenda por vez no banco seria ~80 idas e voltas em série; em paralelo, o tempo da maior.
    const lidas = await Promise.all(
      faz.dados.map(async (z) => {
        const [animais, pesagens] = await Promise.all([
          lerAnimaisCorteComPais(z.propriedade_id),
          z.animais_janela > 0 ? lerPesagensCorte(z.propriedade_id) : Promise.resolve(ok<PesagemCorteEntrada[]>([])),
        ]);
        return { z, animais, pesagens };
      }),
    );
    const fazendas: FazendaCorteNaVisao[] = [];
    const todosAnimais: AnimalEntrada[] = [];
    const ident = new Map<number, { numero: string | null; nome: string | null }>();
    for (const { z, animais, pesagens } of lidas) {
      if (!animais.ok) return animais;
      if (!pesagens.ok) return pesagens;
      for (const a of animais.dados) {
        if (a.propriedadeId !== z.propriedade_id) continue;
        ident.set(a.animalId, { numero: a.numero, nome: a.nome });
        todosAnimais.push({
          animalId: a.animalId,
          propriedadeId: a.propriedadeId,
          especie: 'bovino_corte',
          numero: a.numero,
          nome: a.nome,
          sexo: a.sexo,
          nascimento: a.nascimento,
          paiId: a.paiId,
          maeId: a.maeId,
        });
      }
      if (z.animais_janela === 0) continue;
      fazendas.push({
        fazenda: z,
        analise: analisarFazendaCorte(
          { propriedadeId: z.propriedade_id, animais: animais.dados, pesagens: pesagens.dados },
          { ranking: false },
        ),
      });
    }
    fazendas.sort((a, b) => b.analise.diagnostico.registros - a.analise.diagnostico.registros);
    // Corte: conexão por PROGÊNIE (filhos e filhas), com os vínculos confirmados aplicados.
    const progenie = todosAnimais.map((a) => ({ ...a, sexo: 'fêmea' }));
    const unificados = vinc.ok ? aplicarVinculos(progenie, vinc.dados).animais : progenie;
    return ok({
      especie: 'bovino_corte' as const,
      todasFazendas: faz.dados,
      fazendas,
      semPesagem: faz.dados.length - comPesagem.length,
      conectores: reprodutoresConectores(unificados),
      vinculos: montarVinculos(vinc, progenie, (id) => ident.get(id) ?? { numero: null, nome: null }, 'filhos'),
    });
  });
  return res.ok ? ok({ ...res.dados.valor, calculadoEm: res.dados.calculadoEm }) : res;
}

// ─────────────────────────────────────────────────────────────────────────────
// Histórico de rodadas gravadas (pelo script; aqui só leitura)
// ─────────────────────────────────────────────────────────────────────────────

export interface HistoricoRodadas {
  execucoes: ExecucaoGravada[];
  /** Validação e topo do ranking (posição ≤ 10) da execução mais recente. */
  validacoes: LinhaMelhoramentoValidacao[];
  resultados: LinhaMelhoramentoResultado[];
}

/** O histórico desta fazenda e espécie. Vazio quando nunca se rodou o script. */
export async function getHistoricoRodadas(
  propriedadeId: number,
  especie: EspecieChave,
): Promise<Resultado<HistoricoRodadas>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();
  const vRod = VIEWS_MELHORAMENTO.rodada;
  const rod = await paginarView(vRod, SQL, (de, ate) =>
    (supa.from(vRod).select(SELECT.rodada) as unknown as ComFiltros)
      .eq('propriedade_id', propriedadeId)
      .eq('especie', especie)
      .eq('status', 'concluida')
      .order('id', { ascending: true })
      .range(de, ate),
  );
  if (!rod.ok) return rod;
  const execucoes = agruparExecucoes(rod.dados.map(paraRodada));
  if (execucoes.length === 0) return ok({ execucoes, validacoes: [], resultados: [] });
  const ids = execucoes[0].rodadas.map((r) => r.id);
  const vVal = VIEWS_MELHORAMENTO.validacao;
  const vRes = VIEWS_MELHORAMENTO.resultado;
  const [val, resu] = await Promise.all([
    paginarView(vVal, SQL, (de, ate) =>
      (supa.from(vVal).select(SELECT.validacao) as unknown as ComFiltros)
        .in('rodada_id', ids)
        .order('rodada_id', { ascending: true })
        .order('metrica', { ascending: true })
        .range(de, ate),
    ),
    paginarView(vRes, SQL, (de, ate) =>
      (supa.from(vRes).select(SELECT.resultado) as unknown as ComFiltros)
        .in('rodada_id', ids)
        .lte('posicao', 10)
        .order('rodada_id', { ascending: true })
        .order('animal_id', { ascending: true })
        .range(de, ate),
    ),
  ]);
  if (!val.ok) return val;
  if (!resu.ok) return resu;
  return ok({ execucoes, validacoes: val.dados.map(paraValidacaoGravada), resultados: resu.dados.map(paraResultadoGravado) });
}

export type { Linha };
