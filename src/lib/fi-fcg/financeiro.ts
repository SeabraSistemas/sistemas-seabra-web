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
 * fonte de Fazenda.
 *
 * DECISÃO DE RECEITA (Felipe, 14/09): "só o registrado" — nunca estimar um
 * valor de venda que não foi digitado. `classificarValorVenda` só CLASSIFICA
 * pra separar o que entra na receita do que precisa de conferência; nunca
 * inventa um número.
 */
import type { DiaCompacto, LancamentoFinanceiro, RegAborto, RegBaixa, RegVenda } from './types';

export type OrigemEvento = 'Venda' | 'Baixa' | 'Aborto';
/** 'Venda' e 'Aborto' vêm da própria aba; 'Morte'/'Matula'/'Conferência' são os 3 valores reais de Baixa.Causa da baixa. */
export type TipoEvento = 'Venda' | 'Morte' | 'Matula' | 'Conferência' | 'Aborto';

export type StatusConciliacao = 'conciliado' | 'sem-lancamento' | 'valor-diverge' | 'nao-aplicavel';
export type StatusValorVenda = 'sem-valor' | 'irrisorio' | 'parece-arroba' | 'alto' | 'ok';

/** Limites da classificação de Venda.valor — nomeados pra poder confirmar/ajustar com o Felipe sem caçar número mágico no meio do código. */
export const LIMITE_IRRISORIO = 100;
export const LIMITE_ARROBA_MAX = 1000;
export const LIMITE_ALTO = 20000;

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
   * O valor que de fato entra nas métricas de receita/perdas — nunca o mesmo
   * cálculo pros 3 tipos: Venda só conta se `statusValorVenda === 'ok'`
   * (nunca o lançamento, mesmo que ele exista — "só o registrado" é sobre o
   * que o usuário digitou na VENDA); Morte/Matula usam `valorEvento` e caem
   * pro `valorLancado` só quando a Baixa em si não tem valor; Aborto usa
   * SEMPRE `valorLancado` (a aba não tem coluna de valor); Conferência
   * nunca tem valor (é só contagem de cabeça, não movimenta dinheiro).
   */
  valorMetrica: number | null;
}

export function classificarValorVenda(valor: number | null): StatusValorVenda {
  if (valor == null) return 'sem-valor';
  const abs = Math.abs(valor);
  if (abs < LIMITE_IRRISORIO) return 'irrisorio';
  if (abs <= LIMITE_ARROBA_MAX) return 'parece-arroba';
  if (abs > LIMITE_ALTO) return 'alto';
  return 'ok';
}

/** Forma do evento ANTES de conciliar com o livro-caixa — `conciliar` preenche valorLancado/conciliacao/valorMetrica. Exportado pra `conciliar` ser testável direto, sem precisar montar a partir das abas. */
export type EventoBase = Omit<EventoFin, 'valorLancado' | 'conciliacao' | 'valorMetrica'>;

/** Monta os eventos SEM conciliação ainda. */
function montarBase(vendas: RegVenda[], baixas: RegBaixa[], abortos: RegAborto[]): EventoBase[] {
  const deVendas = vendas.map((v) => ({
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
    statusValorVenda: classificarValorVenda(v.valor),
  }));
  const deBaixas = baixas.map((b) => ({
    origem: 'Baixa' as const,
    // Os 3 valores reais de "Causa da baixa" (conferido ao vivo); um valor
    // fora disso (dado novo na planilha) cai em 'Conferência' — nunca gera
    // R$, então o pior caso é só entrar como cabeça contada, não dinheiro
    // errado.
    tipo: (b.tipo === 'Morte' || b.tipo === 'Matula' ? b.tipo : 'Conferência') as TipoEvento,
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
  }));
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
      return { ...e, valorLancado: null, conciliacao: 'nao-aplicavel', valorMetrica: null };
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

    const valorMetrica =
      e.tipo === 'Venda'
        ? (e.statusValorVenda === 'ok' ? e.valorEvento : null)
        : e.tipo === 'Aborto'
          ? valorLancado
          : e.tipo === 'Conferência'
            ? null
            : (e.valorEvento ?? valorLancado); // Morte/Matula

    return { ...e, valorLancado, conciliacao, valorMetrica };
  });

  const orfaos = Array.from(filas.values()).flat();
  return { eventos, orfaos };
}

export function montarEventos(
  vendas: RegVenda[],
  baixas: RegBaixa[],
  abortos: RegAborto[],
  lancamentos: LancamentoFinanceiro[],
): { eventos: EventoFin[]; orfaos: LancamentoFinanceiro[] } {
  return conciliar(montarBase(vendas, baixas, abortos), lancamentos);
}

// ---- Métricas ----

function soma(valores: (number | null)[]): number {
  return valores.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

export interface ResumoFinanceiro {
  cabecasVendidas: number;
  vendasComValorOk: number;
  vendasComPeso: number;
  kgVendidos: number;
  receitaRegistrada: number;
  ticketMedio: number | null;
  perdasRegistradas: number;
  perdasMorteMatula: number;
  perdasAborto: number;
  cabecasBaixadas: number;
  abortos: number;
  resultadoRegistrado: number;
  percentualPerdasReceita: number | null;
}

export function resumoFinanceiro(eventos: EventoFin[]): ResumoFinanceiro {
  const vendas = eventos.filter((e) => e.tipo === 'Venda');
  const vendasOk = vendas.filter((e) => e.statusValorVenda === 'ok');
  const morteMatula = eventos.filter((e) => e.tipo === 'Morte' || e.tipo === 'Matula');
  const abortoEventos = eventos.filter((e) => e.tipo === 'Aborto');

  const receitaRegistrada = soma(vendasOk.map((e) => e.valorMetrica));
  const perdasMorteMatula = soma(morteMatula.map((e) => e.valorMetrica));
  const perdasAborto = soma(abortoEventos.map((e) => e.valorMetrica));
  const perdasRegistradas = perdasMorteMatula + perdasAborto;

  return {
    cabecasVendidas: vendas.length,
    vendasComValorOk: vendasOk.length,
    vendasComPeso: vendas.filter((e) => e.pesoKg != null).length,
    kgVendidos: soma(vendas.map((e) => e.pesoKg)),
    receitaRegistrada,
    ticketMedio: vendasOk.length > 0 ? receitaRegistrada / vendasOk.length : null,
    perdasRegistradas,
    perdasMorteMatula,
    perdasAborto,
    cabecasBaixadas: eventos.filter((e) => e.origem === 'Baixa').length,
    abortos: abortoEventos.length,
    resultadoRegistrado: receitaRegistrada - perdasRegistradas,
    percentualPerdasReceita: receitaRegistrada > 0 ? (perdasRegistradas / receitaRegistrada) * 100 : null,
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

export function receitaMensal(eventos: EventoFin[]): PontoMes[] {
  return agruparPorMes(eventos, (e) => e.tipo === 'Venda' && e.statusValorVenda === 'ok', (e) => e.valorMetrica);
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

/** Receita ('ok') agrupada por um campo do evento — usado pra "por Cliente" e "por Fazenda". */
export function receitaPor(eventos: EventoFin[], campo: (e: EventoFin) => string | null, semRotulo: string): FatiaRotulo[] {
  const mapa = new Map<string, number>();
  for (const e of eventos) {
    if (e.tipo !== 'Venda' || e.statusValorVenda !== 'ok') continue;
    const chave = campo(e) ?? semRotulo;
    mapa.set(chave, (mapa.get(chave) ?? 0) + (e.valorMetrica ?? 0));
  }
  return Array.from(mapa, ([rotulo, valor]) => ({ rotulo, valor }));
}

// ---- "A conferir" ----

export type ProblemaFin =
  | 'venda-sem-valor'
  | 'venda-valor-suspeito'
  | 'venda-sem-peso'
  | 'data-invalida-ou-futura'
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
      if (e.statusValorVenda === 'sem-valor') itens.push({ problema: 'venda-sem-valor', evento: e });
      else if (e.statusValorVenda !== 'ok') itens.push({ problema: 'venda-valor-suspeito', evento: e });
      if (e.pesoKg == null) itens.push({ problema: 'venda-sem-peso', evento: e });
    }
    if ((e.tipo === 'Morte' || e.tipo === 'Matula') && e.valorMetrica == null) {
      itens.push({ problema: 'baixa-sem-valor', evento: e });
    }
    if (e.data == null || e.data > hoje) itens.push({ problema: 'data-invalida-ou-futura', evento: e });
    if (e.conciliacao === 'sem-lancamento') itens.push({ problema: 'sem-lancamento', evento: e });
    if (e.conciliacao === 'valor-diverge') itens.push({ problema: 'valor-diverge', evento: e });
  }
  for (const o of orfaos) itens.push({ problema: 'lancamento-orfao', lancamentoOrfao: o });
  return itens;
}
