/**
 * Modelo financeiro do /FI_FCG. Puro — sem leitura de planilha, sem Date.now()
 * (o "hoje" entra como parâmetro, pra ser testável).
 *
 * DECISÃO DE FONTE: as abas de EVENTO (Venda, Baixa, Aborto) são a fonte de
 * verdade — têm Fazenda correta, Cliente, kg e causa, e são o que o usuário
 * realmente edita no AppSheet. O livro-caixa (aba "Financeiro", gerado pelo
 * AppSheet) entra só pra conciliar e pra fornecer o valor do aborto (a aba
 * Aborto não tem coluna de valor) — a coluna "Fazenda" do livro-caixa está
 * SEMPRE "Inhumas" (achado ao vivo, 2.622/2.622 linhas), nunca usar como
 * fonte de Fazenda. Essa mesma trava vale pra Venda: sua própria Fazenda
 * (não a do livro-caixa) é a que o evento carrega.
 *
 * DECISÃO DE RECEITA (Felipe, 14/09→15/09): mudou no caminho.
 * - 14/09: "só o registrado" — nunca estimar.
 * - 15/09: "só no front" — quando o valor de uma Venda não existe OU não
 *   faz sentido (irrisório/parece preço de @/absurdamente alto), ESTIMAR
 *   com a MESMA fórmula que o AppSheet já usa pra valorar a Baixa
 *   automaticamente: Média@ (arrobas da categoria) × Valor da @ (aba
 *   Categoria@, hoje R$ 320). A estimativa nunca é ESCRITA na planilha —
 *   só entra na conta do /FI_FCG. A categoria do animal na venda não está
 *   em lugar nenhum (RebanhoProd.Categoria vira "Venda" pra sempre assim
 *   que ele sai), então ela é RECONSTRUÍDA com a mesma fórmula de idade
 *   que a própria RebanhoProd usa pra calcular Categoria (conferida ao
 *   vivo, ver `categoriaEstimadaPorIdade`), usando a idade do animal NA
 *   DATA DA VENDA (não hoje) — Sexo e Data de nascimento nunca são
 *   sobrescritos, diferente de Categoria.
 * - 16/09: a MESMA reconstrução vale pra Morte/Matula (Baixa) quando ela
 *   não tem valor NEM categoria própria (achado ao vivo: 23 de 24 baixas
 *   sem valor também estão sem Categoria — é por isso que o AppSheet não
 *   calculou sozinho). Baixa com categoria própria já é valorada pelo
 *   AppSheet, nunca é reestimada aqui.
 */
import { diasEntre } from '@/lib/painel/format';
import type { CategoriaArroba, DiaCompacto, LancamentoFinanceiro, RegAborto, RegBaixa, RegRebanho, RegVenda } from './types';

export type OrigemEvento = 'Venda' | 'Baixa' | 'Aborto';
/** 'Venda' e 'Aborto' vêm da própria aba; 'Morte'/'Matula'/'Conferência' são os 3 valores reais de Baixa.Causa da baixa. */
export type TipoEvento = 'Venda' | 'Morte' | 'Matula' | 'Conferência' | 'Aborto';

export type StatusConciliacao = 'conciliado' | 'sem-lancamento' | 'valor-diverge' | 'nao-aplicavel';
export type StatusValorVenda = 'sem-valor' | 'irrisorio' | 'parece-arroba' | 'alto' | 'ok';
/** De onde veio o valor que de fato entra na conta — a base de tudo que a UI mostra como "Estimado". */
export type OrigemValor = 'registrado' | 'estimado' | 'sem-valor';

/** Limites da classificação de Venda.valor — nomeados pra poder confirmar/ajustar com o Felipe sem caçar número mágico no meio do código. */
export const LIMITE_IRRISORIO = 100;
export const LIMITE_ARROBA_MAX = 1000;
export const LIMITE_ALTO = 20000;

/** Todo Aborto com lançamento no livro-caixa vem com este valor fixo (conferido ao vivo, 132/132) — usado como fallback quando NÃO existe lançamento nenhum (16/09/2026, decisão do Felipe). */
export const VALOR_ABORTO_PADRAO = 2500;

/**
 * Espelha a fórmula real da coluna Categoria em RebanhoProd (lida com
 * valueRenderOption=FORMULA em 15/09/2026): idade em dias ≤365/730/1095/
 * >1095, cruzada com Sexo — SÓ o ramo etário, sem os overrides manuais tipo
 * "Sêmen"/"Touro"/"Leiteira" (não fazem sentido pra reconstruir uma venda
 * passada). Único desvio deliberado da fórmula original: ela trata
 * QUALQUER Sexo diferente de "Macho" como fêmea (nem sempre e por padrão);
 * aqui um Sexo que não seja exatamente "Macho" ou "Fêmea" (ex: o "-" que
 * existe na planilha) devolve null — melhor não estimar do que estimar em
 * cima de um chute.
 *
 * Achado no caminho: a faixa 366–730 dias dá "Garrote" (macho) / "Recria"
 * (fêmea) — mas a aba Categoria@ não tem preço pra "Recria" (só Bezerro,
 * Bezerra, Novilha, Garrote, Boi, Vaca, Touro, Leiteira). `mapaPrecosPorCategoria`
 * cobre isso com um preço DERIVADO (média Bezerra/Novilha), decisão do
 * Felipe (16/09) — não é um número inventado à toa, é a mesma lógica de
 * "entre a faixa anterior e a seguinte" que a própria idade já usa.
 */
export function categoriaEstimadaPorIdade(sexo: string | null, idadeDiasNaVenda: number | null): string | null {
  if (idadeDiasNaVenda == null || idadeDiasNaVenda < 0) return null;
  if (sexo !== 'Macho' && sexo !== 'Fêmea') return null;
  const macho = sexo === 'Macho';
  if (idadeDiasNaVenda <= 365) return macho ? 'Bezerro' : 'Bezerra';
  if (idadeDiasNaVenda <= 730) return macho ? 'Garrote' : 'Recria';
  if (idadeDiasNaVenda <= 1095) return macho ? 'Boi' : 'Novilha';
  return macho ? 'Touro' : 'Vaca';
}

/** Idade na data da venda (não hoje) => categoria estimada => preço da aba Categoria@. null em qualquer etapa se faltar dado ou a categoria não tiver preço cadastrado. */
export function estimarValorVenda(
  sexo: string | null,
  nascimento: DiaCompacto | null,
  dataVenda: DiaCompacto | null,
  precosPorCategoria: Map<string, number>,
): { categoria: string | null; valor: number | null } {
  const idade = diasEntre(nascimento, dataVenda);
  const categoria = categoriaEstimadaPorIdade(sexo, idade);
  if (!categoria) return { categoria: null, valor: null };
  return { categoria, valor: precosPorCategoria.get(categoria) ?? null };
}

export interface EventoFin {
  origem: OrigemEvento;
  tipo: TipoEvento;
  /** Id da linha na aba de origem (ex: "ID venda") — nunca o "ID animal", que pode repetir entre vários eventos do mesmo bicho. */
  id: string;
  idAnimal: string | null;
  data: DiaCompacto | null;
  fazenda: string | null;
  /** Só preenchido pra Venda (Frigorífico/Leilão). */
  cliente: string | null;
  /** Só preenchido pra Venda. */
  pesoKg: number | null;
  /** Só preenchido pra Baixa (Categoria na baixa). */
  categoria: string | null;
  /** Causa do óbito (Baixa) ou suspeita (Aborto). */
  causa: string | null;
  /** Valor bruto da própria aba de origem — null pra Aborto (a aba não tem essa coluna) e pra maioria das Vendas/Baixas. */
  valorEvento: number | null;
  /** Valor achado no livro-caixa pra este evento (null se não conciliou). */
  valorLancado: number | null;
  conciliacao: StatusConciliacao;
  /** Só preenchido quando tipo === 'Venda'. */
  statusValorVenda: StatusValorVenda | null;
  /**
   * Categoria reconstruída pela idade do animal na data do evento — pra
   * Venda, só quando statusValorVenda !== 'ok'; pra Morte/Matula, só quando
   * a Baixa não tem valor NEM categoria própria (a Baixa normalmente já vem
   * com Categoria preenchida e o AppSheet já valora sozinho; só reconstrói
   * quando falta os dois). Nunca calculada à toa.
   */
  categoriaEstimada: string | null;
  /** Valor Categoria@ (ou derivado, no caso de "Recria" — ver `mapaPrecosPorCategoria`) correspondente a `categoriaEstimada`; null só quando nem isso deu pra estimar. */
  valorEstimado: number | null;
  /**
   * O valor que de fato entra nas métricas de receita/perdas — nunca o
   * mesmo cálculo pros 3 tipos: Venda usa `valorEvento` quando 'ok', cai
   * pra `valorEstimado` quando não é (nunca pro `valorLancado` do
   * livro-caixa — "só o registrado" era sobre o que o usuário digitou NA
   * VENDA, o livro-caixa não é uma fonte melhor); Morte/Matula usam
   * `valorEvento` e caem pro `valorLancado` só quando a Baixa em si não
   * tem valor; Aborto usa SEMPRE `valorLancado` (a aba não tem coluna de
   * valor); Conferência nunca tem valor (é só contagem de cabeça, não
   * movimenta dinheiro).
   */
  valorMetrica: number | null;
  /** De onde veio `valorMetrica` — a UI usa isto pra marcar "Estimado" na tabela, nunca `statusValorVenda` sozinho (que só existe pra Venda). */
  origemValor: OrigemValor;
}

export function classificarValorVenda(valor: number | null): StatusValorVenda {
  if (valor == null) return 'sem-valor';
  const abs = Math.abs(valor);
  if (abs < LIMITE_IRRISORIO) return 'irrisorio';
  if (abs <= LIMITE_ARROBA_MAX) return 'parece-arroba';
  if (abs > LIMITE_ALTO) return 'alto';
  return 'ok';
}

/** Forma do evento ANTES de conciliar com o livro-caixa — `conciliar` preenche valorLancado/conciliacao/valorMetrica/origemValor. Exportado pra `conciliar` ser testável direto, sem precisar montar a partir das abas. */
export type EventoBase = Omit<EventoFin, 'valorLancado' | 'conciliacao' | 'valorMetrica' | 'origemValor'>;

function mapaRebanhoPorId(rebanho: RegRebanho[]): Map<string, { sexo: string | null; nascimento: DiaCompacto | null }> {
  const mapa = new Map<string, { sexo: string | null; nascimento: DiaCompacto | null }>();
  for (const r of rebanho) {
    if (!r.id) continue;
    mapa.set(r.id.trim().toLowerCase(), { sexo: r.sexo, nascimento: r.nascimento });
  }
  return mapa;
}

/**
 * "Recria" (fêmea, 366-730 dias — ver `categoriaEstimadaPorIdade`) não tem
 * preço próprio na aba Categoria@ (só Bezerro/Bezerra/Novilha/Garrote/Boi/
 * Vaca/Touro/Leiteira — achado ao vivo, 16/09/2026). Decisão do Felipe:
 * média entre a faixa anterior (Bezerra) e a seguinte (Novilha), só no
 * cálculo do painel — nunca escrita na planilha. Se um dia a aba ganhar uma
 * linha "Recria" de verdade, ela passa a valer (nunca sobrescreve um preço
 * que já exista).
 */
function precoRecriaDerivado(mapa: Map<string, number>): number | null {
  const bezerra = mapa.get('Bezerra');
  const novilha = mapa.get('Novilha');
  return bezerra != null && novilha != null ? (bezerra + novilha) / 2 : null;
}

function mapaPrecosPorCategoria(precos: CategoriaArroba[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const p of precos) {
    if (p.valorCategoria != null) mapa.set(p.categoria, p.valorCategoria);
  }
  if (!mapa.has('Recria')) {
    const derivado = precoRecriaDerivado(mapa);
    if (derivado != null) mapa.set('Recria', derivado);
  }
  return mapa;
}

/**
 * Remove Venda duplicada: mesmo animal + mesma data. Achado ao vivo
 * (16/09/2026, planilha real): 5 pares assim, sempre com mesmo Cliente e
 * mesma Fazenda também (peso às vezes com 1kg de diferença) — um animal
 * físico não é vendido duas vezes no mesmo dia, então é lançamento
 * duplicado (o usuário/AppSheet salvou 2x), não duas vendas reais. Decisão
 * do Felipe (16/09): excluir da conta, mantendo a PRIMEIRA ocorrência (a
 * ordem da própria planilha) — a linha extra continua existindo na
 * planilha, só não entra em nenhuma métrica nem na tabela de Vendas. Nunca
 * agrupa por `idAnimal` vazio (senão juntaria vendas sem ID que não têm
 * nada a ver umas com as outras).
 */
export function removerVendasDuplicadas(vendas: RegVenda[]): RegVenda[] {
  const vistos = new Set<string>();
  const resultado: RegVenda[] = [];
  for (const v of vendas) {
    if (!v.idAnimal) {
      resultado.push(v);
      continue;
    }
    const chave = `${v.idAnimal.trim().toLowerCase()}|${v.data ?? ''}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    resultado.push(v);
  }
  return resultado;
}

/** Monta os eventos SEM conciliação ainda. `rebanhoPorId`/`precosPorCategoria` só valem pra Venda (ver `estimarValorVenda`). */
function montarBase(
  vendasBrutas: RegVenda[],
  baixas: RegBaixa[],
  abortos: RegAborto[],
  rebanhoPorId: Map<string, { sexo: string | null; nascimento: DiaCompacto | null }>,
  precosPorCategoria: Map<string, number>,
): EventoBase[] {
  const vendas = removerVendasDuplicadas(vendasBrutas);
  const deVendas = vendas.map((v) => {
    const statusValorVenda = classificarValorVenda(v.valor);
    const animal = v.idAnimal ? rebanhoPorId.get(v.idAnimal.trim().toLowerCase()) : undefined;
    const estimativa =
      statusValorVenda !== 'ok' && animal ? estimarValorVenda(animal.sexo, animal.nascimento, v.data, precosPorCategoria) : null;
    return {
      origem: 'Venda' as const,
      tipo: 'Venda' as const,
      id: v.id,
      idAnimal: v.idAnimal,
      data: v.data,
      fazenda: v.fazenda,
      cliente: v.cliente,
      pesoKg: v.pesoKg,
      categoria: null,
      causa: null,
      valorEvento: v.valor,
      statusValorVenda,
      categoriaEstimada: estimativa?.categoria ?? null,
      valorEstimado: estimativa?.valor ?? null,
    };
  });
  const deBaixas = baixas.map((b) => {
    // Os 3 valores reais de "Causa da baixa" (conferido ao vivo); um valor
    // fora disso (dado novo na planilha) cai em 'Conferência' — nunca gera
    // R$, então o pior caso é só entrar como cabeça contada, não dinheiro
    // errado.
    const tipo = (b.tipo === 'Morte' || b.tipo === 'Matula' ? b.tipo : 'Conferência') as TipoEvento;
    // Achado ao vivo (16/09/2026): 24 Morte/Matula sem Valor TÊM a Categoria
    // na baixa também vazia — é por isso que o próprio AppSheet não
    // calculou o valor (a fórmula dele também precisa da categoria). Mesmo
    // fallback da Venda: reconstrói a categoria pela idade+sexo do animal
    // NA DATA DA BAIXA (RebanhoProd.Sexo/Nascimento nunca são sobrescritos),
    // só quando a baixa em si não tem valor nem categoria.
    const animal = tipo !== 'Conferência' && b.valor == null && !b.categoria ? rebanhoPorId.get(b.id.trim().toLowerCase()) : undefined;
    const estimativa = animal ? estimarValorVenda(animal.sexo, animal.nascimento, b.data, precosPorCategoria) : null;
    return {
      origem: 'Baixa' as const,
      tipo,
      id: b.id,
      idAnimal: b.id,
      data: b.data,
      fazenda: b.fazenda,
      cliente: null,
      pesoKg: null,
      categoria: b.categoria,
      causa: b.causaObito,
      valorEvento: b.valor,
      statusValorVenda: null,
      categoriaEstimada: estimativa?.categoria ?? null,
      valorEstimado: estimativa?.valor ?? null,
    };
  });
  const deAbortos = abortos.map((a) => ({
    origem: 'Aborto' as const,
    tipo: 'Aborto' as const,
    id: a.id,
    idAnimal: a.idAnimal,
    data: a.data,
    fazenda: a.fazenda,
    cliente: null,
    pesoKg: null,
    categoria: null,
    causa: a.suspeita,
    valorEvento: null,
    statusValorVenda: null,
    categoriaEstimada: null,
    valorEstimado: null,
  }));
  return [...deVendas, ...deBaixas, ...deAbortos];
}

function chaveConciliacao(idAnimal: string | null, data: DiaCompacto | null, descricao: string): string {
  return `${(idAnimal ?? '').trim().toLowerCase()}|${data ?? ''}|${descricao}`;
}

/** 'Conferência' não tem contrapartida no livro-caixa (Descrição só tem Venda/Morte/Matula/Aborto — conferido ao vivo). */
function descricaoDoTipo(tipo: TipoEvento): string | null {
  return tipo === 'Conferência' ? null : tipo;
}

/**
 * Casa cada evento com uma linha do livro-caixa por (idAnimal, data, tipo).
 * Linhas do livro-caixa com a mesma chave (duplicata) formam uma fila por
 * chave; cada evento consome a primeira da fila, preferindo uma de valor
 * igual ao do próprio evento quando existir mais de uma na fila. O que sobra
 * nas filas no final são lançamentos "órfãos" — o AppSheet gerou uma linha
 * que já não bate com nenhum evento hoje (ex: venda apagada/editada).
 */
export function conciliar(
  base: EventoBase[],
  lancamentos: LancamentoFinanceiro[],
): { eventos: EventoFin[]; orfaos: LancamentoFinanceiro[] } {
  const filas = new Map<string, LancamentoFinanceiro[]>();
  for (const l of lancamentos) {
    if (!l.descricao) continue;
    const chave = chaveConciliacao(l.identificacao, l.data, l.descricao);
    const fila = filas.get(chave);
    if (fila) fila.push(l);
    else filas.set(chave, [l]);
  }

  const eventos: EventoFin[] = base.map((e) => {
    const descricao = descricaoDoTipo(e.tipo);
    if (!descricao) {
      return { ...e, valorLancado: null, conciliacao: 'nao-aplicavel', valorMetrica: null, origemValor: 'sem-valor' };
    }

    const chave = chaveConciliacao(e.idAnimal, e.data, descricao);
    const fila = filas.get(chave);
    let lancamento: LancamentoFinanceiro | undefined;
    if (fila && fila.length > 0) {
      const iPreferido = e.valorEvento != null ? fila.findIndex((l) => l.valor === e.valorEvento) : -1;
      const i = iPreferido >= 0 ? iPreferido : 0;
      [lancamento] = fila.splice(i, 1);
    }

    const valorLancado = lancamento?.valor ?? null;
    const conciliacao: StatusConciliacao =
      lancamento == null
        ? 'sem-lancamento'
        : e.valorEvento != null && valorLancado != null && e.valorEvento !== valorLancado
          ? 'valor-diverge'
          : 'conciliado';

    let valorMetrica: number | null;
    let origemValor: OrigemValor;
    if (e.tipo === 'Venda') {
      if (e.statusValorVenda === 'ok') {
        valorMetrica = e.valorEvento;
        origemValor = 'registrado';
      } else if (e.valorEstimado != null) {
        valorMetrica = e.valorEstimado;
        origemValor = 'estimado';
      } else {
        valorMetrica = null;
        origemValor = 'sem-valor';
      }
    } else if (e.tipo === 'Aborto') {
      // Todo aborto CONCILIADO (com lançamento) vem com o mesmo R$ fixo —
      // quando não existe lançamento NENHUM (não é questão de valor, é a
      // linha que não existe), usa esse mesmo valor como estimativa em vez
      // de deixar sem nada (decisão do Felipe, 16/09).
      valorMetrica = valorLancado ?? VALOR_ABORTO_PADRAO;
      origemValor = valorLancado != null ? 'registrado' : 'estimado';
    } else if (e.tipo === 'Conferência') {
      valorMetrica = null;
      origemValor = 'sem-valor';
    } else {
      // Morte/Matula: registrado (na própria Baixa ou no livro-caixa) antes
      // de estimado — `categoriaEstimada`/`valorEstimado` só existem quando
      // NENHUM dos dois veio preenchido (ver montarBase).
      valorMetrica = e.valorEvento ?? valorLancado ?? e.valorEstimado;
      origemValor = e.valorEvento != null || valorLancado != null ? 'registrado' : valorMetrica != null ? 'estimado' : 'sem-valor';
    }

    return { ...e, valorLancado, conciliacao, valorMetrica, origemValor };
  });

  const orfaos = Array.from(filas.values()).flat();
  return { eventos, orfaos };
}

export function montarEventos(
  vendas: RegVenda[],
  baixas: RegBaixa[],
  abortos: RegAborto[],
  lancamentos: LancamentoFinanceiro[],
  rebanho: RegRebanho[],
  precos: CategoriaArroba[],
): { eventos: EventoFin[]; orfaos: LancamentoFinanceiro[] } {
  const rebanhoPorId = mapaRebanhoPorId(rebanho);
  const precosPorCategoria = mapaPrecosPorCategoria(precos);
  return conciliar(montarBase(vendas, baixas, abortos, rebanhoPorId, precosPorCategoria), lancamentos);
}

// ---- Métricas ----

function soma(valores: (number | null)[]): number {
  return valores.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

export interface ResumoFinanceiro {
  cabecasVendidas: number;
  /** Venda com `statusValorVenda === 'ok'` — o valor que o usuário digitou fez sentido, usado como está. */
  vendasRegistradas: number;
  /** Venda sem valor bom, mas com categoria+preço estimável (idade × sexo na data da venda). */
  vendasEstimadas: number;
  /** Venda sem valor bom E sem como estimar — só resta o animal não achado no rebanho (sem ele não dá nem pra saber sexo/idade). */
  vendasSemValor: number;
  vendasComPeso: number;
  kgVendidos: number;
  receitaRegistrada: number;
  receitaEstimada: number;
  /** registrada + estimada — o número que entra em Resultado/Perdas-Receita%. */
  receitaTotal: number;
  ticketMedio: number | null;
  perdasRegistradas: number;
  perdasMorteMatula: number;
  perdasAborto: number;
  cabecasBaixadas: number;
  abortos: number;
  resultadoTotal: number;
  percentualPerdasReceita: number | null;
}

export function resumoFinanceiro(eventos: EventoFin[]): ResumoFinanceiro {
  const vendas = eventos.filter((e) => e.tipo === 'Venda');
  const vendasRegistradasArr = vendas.filter((e) => e.origemValor === 'registrado');
  const vendasEstimadasArr = vendas.filter((e) => e.origemValor === 'estimado');
  const morteMatula = eventos.filter((e) => e.tipo === 'Morte' || e.tipo === 'Matula');
  const abortoEventos = eventos.filter((e) => e.tipo === 'Aborto');

  const receitaRegistrada = soma(vendasRegistradasArr.map((e) => e.valorMetrica));
  const receitaEstimada = soma(vendasEstimadasArr.map((e) => e.valorMetrica));
  const receitaTotal = receitaRegistrada + receitaEstimada;
  const perdasMorteMatula = soma(morteMatula.map((e) => e.valorMetrica));
  const perdasAborto = soma(abortoEventos.map((e) => e.valorMetrica));
  const perdasRegistradas = perdasMorteMatula + perdasAborto;
  const vendasComValor = vendasRegistradasArr.length + vendasEstimadasArr.length;

  return {
    cabecasVendidas: vendas.length,
    vendasRegistradas: vendasRegistradasArr.length,
    vendasEstimadas: vendasEstimadasArr.length,
    vendasSemValor: vendas.length - vendasComValor,
    vendasComPeso: vendas.filter((e) => e.pesoKg != null).length,
    kgVendidos: soma(vendas.map((e) => e.pesoKg)),
    receitaRegistrada,
    receitaEstimada,
    receitaTotal,
    ticketMedio: vendasComValor > 0 ? receitaTotal / vendasComValor : null,
    perdasRegistradas,
    perdasMorteMatula,
    perdasAborto,
    cabecasBaixadas: eventos.filter((e) => e.origem === 'Baixa').length,
    abortos: abortoEventos.length,
    resultadoTotal: receitaTotal - perdasRegistradas,
    percentualPerdasReceita: receitaTotal > 0 ? (perdasRegistradas / receitaTotal) * 100 : null,
  };
}

export interface PontoMes {
  mes: string; // "aaaamm"
  valor: number;
}

function agruparPorMes(eventos: EventoFin[], filtro: (e: EventoFin) => boolean, valor: (e: EventoFin) => number | null): PontoMes[] {
  const mapa = new Map<string, number>();
  for (const e of eventos) {
    if (e.data == null || !filtro(e)) continue;
    const v = valor(e);
    if (v == null) continue;
    const mes = String(Math.floor(e.data / 100));
    mapa.set(mes, (mapa.get(mes) ?? 0) + v);
  }
  return Array.from(mapa, ([mes, valor]) => ({ mes, valor }));
}

/** Receita mensal (registrada + estimada) — o mês fica completo mesmo quando a maioria das vendas do período não tinha valor digitado. */
export function receitaMensal(eventos: EventoFin[]): PontoMes[] {
  return agruparPorMes(eventos, (e) => e.tipo === 'Venda' && e.origemValor !== 'sem-valor', (e) => e.valorMetrica);
}

export function perdasMensais(eventos: EventoFin[]): PontoMes[] {
  return agruparPorMes(eventos, (e) => e.tipo === 'Morte' || e.tipo === 'Matula' || e.tipo === 'Aborto', (e) => e.valorMetrica);
}

export function vendidasMensal(eventos: EventoFin[]): PontoMes[] {
  return agruparPorMes(eventos, (e) => e.tipo === 'Venda', () => 1);
}

export function baixadasMensal(eventos: EventoFin[]): PontoMes[] {
  return agruparPorMes(eventos, (e) => e.origem === 'Baixa', () => 1);
}

export interface FatiaRotulo {
  rotulo: string;
  valor: number;
}

/** Receita (registrada + estimada) agrupada por um campo do evento — usado pra "por Cliente" e "por Fazenda". */
export function receitaPor(eventos: EventoFin[], campo: (e: EventoFin) => string | null, semRotulo: string): FatiaRotulo[] {
  const mapa = new Map<string, number>();
  for (const e of eventos) {
    if (e.tipo !== 'Venda' || e.origemValor === 'sem-valor') continue;
    const chave = campo(e) ?? semRotulo;
    mapa.set(chave, (mapa.get(chave) ?? 0) + (e.valorMetrica ?? 0));
  }
  return Array.from(mapa, ([rotulo, valor]) => ({ rotulo, valor }));
}

// ---- "A conferir" ----

export type ProblemaFin =
  | 'venda-valor-substituido'
  | 'venda-sem-estimativa'
  | 'venda-sem-peso'
  | 'data-invalida-ou-futura'
  | 'baixa-valor-substituido'
  | 'baixa-sem-valor'
  | 'sem-lancamento'
  | 'lancamento-orfao'
  | 'valor-diverge';

export interface ItemConferir {
  problema: ProblemaFin;
  evento?: EventoFin;
  lancamentoOrfao?: LancamentoFinanceiro;
}

/**
 * Lista "A conferir" — cada linha aponta UM problema (um evento pode aparecer
 * mais de uma vez, uma vez por problema, pra cada aba de conferência poder
 * filtrar só o seu). `hoje` entra como parâmetro pra a função ficar pura e
 * testável sem mockar relógio.
 */
export function aConferir(eventos: EventoFin[], orfaos: LancamentoFinanceiro[], hoje: DiaCompacto): ItemConferir[] {
  const itens: ItemConferir[] = [];
  for (const e of eventos) {
    if (e.tipo === 'Venda') {
      if (e.statusValorVenda !== 'ok') {
        itens.push({ problema: e.origemValor === 'estimado' ? 'venda-valor-substituido' : 'venda-sem-estimativa', evento: e });
      }
      if (e.pesoKg == null) itens.push({ problema: 'venda-sem-peso', evento: e });
    }
    if (e.tipo === 'Morte' || e.tipo === 'Matula') {
      if (e.valorMetrica == null) {
        itens.push({ problema: 'baixa-sem-valor', evento: e });
      } else if (e.origemValor === 'estimado') {
        itens.push({ problema: 'baixa-valor-substituido', evento: e });
      }
    }
    if (e.data == null || e.data > hoje) itens.push({ problema: 'data-invalida-ou-futura', evento: e });
    if (e.conciliacao === 'sem-lancamento') itens.push({ problema: 'sem-lancamento', evento: e });
    if (e.conciliacao === 'valor-diverge') itens.push({ problema: 'valor-diverge', evento: e });
  }
  for (const o of orfaos) itens.push({ problema: 'lancamento-orfao', lancamentoOrfao: o });
  return itens;
}
