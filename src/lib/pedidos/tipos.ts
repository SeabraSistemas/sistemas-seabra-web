/*
 * /pedidos — dois lados que se encontram no navegador:
 *
 *  - SNAPSHOT: o que o coletor (scripts/pedidos-coletor) leu da conta da
 *    AliExpress. Vem de um arquivo no Mac, nunca é editado pela página.
 *  - ESTADO LOCAL: o que o Felipe controla (chegadas, vendas, pedidos lançados
 *    à mão). Fica no localStorage deste navegador.
 *
 * Estoque é por PRODUTO (microchip, leitor), não por pedido: ele compra o
 * mesmo item várias vezes e vende do total.
 */

export type Pagamento = 'ok' | 'pendente' | 'problema' | 'desconhecido';
export type Aduana = 'nao_se_aplica' | 'aguardando' | 'em_andamento' | 'imposto_pendente' | 'concluida' | 'problema' | 'desconhecido';
export type Entrega = 'a_caminho' | 'entregue' | 'problema' | 'cancelado' | 'desconhecido';

export type TipoAlerta = 'pagamento' | 'aduana' | 'entrega';

export interface Alerta {
  tipo: TipoAlerta;
  texto: string;
}

export interface EventoRastreio {
  /** "2026-10-18 14:32". */
  data: string | null;
  texto: string;
}

export interface ItemPedido {
  titulo: string;
  qtd: number;
  /** Preço de UMA unidade, em reais. */
  preco?: number | null;
  imagem: string | null;
}

export interface PedidoAli {
  id: string;
  url: string;
  /** Data do pedido, texto como veio da AliExpress ("14 out, 2026"). */
  data: string | null;
  loja: string | null;
  itens: ItemPedido[];
  total: string | null;
  statusTexto: string;
  pagamento: Pagamento;
  aduana: Aduana;
  entrega: Entrega;
  alertas: Alerta[];
  codigoRastreio: string | null;
  /** Página do produto e a variante comprada (para acompanhar o preço). */
  produto?: { url: string; variante: string | null } | null;
  /** Janela de entrega prevista, datas ISO (YYYY-MM-DD). */
  previsao?: { de: string; ate: string } | null;
  /** Esperando pagamento: até quando dá para pagar antes de a AliExpress cancelar (ISO). */
  prazoPagamento?: string | null;
  /** Do mais novo para o mais antigo. */
  eventos: EventoRastreio[];
}

export interface Mudanca {
  pedidoId: string;
  /** ISO da coleta em que a mudança foi vista. */
  em: string;
  texto: string;
  /** Mudanças em alertas aparecem destacadas. */
  grave: boolean;
}

/** Preço lido hoje na página do produto (variante fixa), com os avisos que o coletor gerou. */
export interface PrecoProduto {
  em: string;
  grupo: Grupo;
  variante?: string | null;
  itemUrl?: string;
  /** Unitário, em reais. */
  preco?: number;
  /** Preço por unidade na faixa de lote ("cada, ≥ N peças"). */
  precoLote?: number | null;
  minLote?: number | null;
  impostos?: number | null;
  dolar?: number | null;
  /** Tela final da compra (antes de "Fazer o pedido"): total de UMA unidade com imposto de importação, ICMS e frete. */
  checkout?: { qtd: number; subtotal: number | null; frete: number | null; imposto: number | null; icms: number | null; total: number };
  /** Por que não chegou à tela final da compra (o preço acima é então só o da página, sem impostos). */
  checkoutErro?: string;
  medias?: { n: number; atual: number; media7: number | null; media30: number | null; vs30: number | null; veredito: 'bom' | 'caro' | 'na_media' | 'sem_historico' } | null;
  erro?: string;
  alertas: string[];
}

/** Preço de UMA unidade: com tudo incluído se passou pelo checkout; senão o da página (faixa de lote, se houver). */
export const precoDeCompra = (p: Pick<PrecoProduto, 'preco' | 'precoLote' | 'checkout'>): number =>
  p.checkout?.total ? p.checkout.total / (p.checkout.qtd || 1) : (p.precoLote ?? p.preco ?? 0);

export interface Snapshot {
  versao: 1;
  /** ISO da última coleta (bem-sucedida ou não). */
  atualizadoEm: string;
  /** false quando a última coleta falhou (ex.: sessão expirada) — o `erro` diz por quê. */
  ok: boolean;
  erro?: string;
  pedidos: PedidoAli[];
  /** Preço do dia dos produtos acompanhados, por grupo. */
  precos?: Partial<Record<Grupo, PrecoProduto>>;
  /** Mudanças das últimas coletas, da mais nova para a mais antiga. */
  mudancas: Mudanca[];
}

/* ── produtos ───────────────────────────────────────────────────────────── */

export type Grupo = 'microchip' | 'leitor' | 'outro';

export const GRUPOS: Record<Grupo, { nome: string; unidade: string }> = {
  microchip: { nome: 'Microchips', unidade: 'pacote' },
  leitor: { nome: 'Leitores', unidade: 'leitor' },
  outro: { nome: 'Outros', unidade: 'item' },
};

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Leitor primeiro: o título do leitor também diz "Micro Chip Scanner". */
export function grupoDoProduto(titulo: string): Grupo {
  const t = semAcento(titulo);
  if (/\b(leitor|reader|scanner)\b/.test(t)) return 'leitor';
  if (/micro ?chip|etiqueta de vidro|glass tag|\bchip\b/.test(t)) return 'microchip';
  return 'outro';
}

/** "Readell 100 peças…" -> 100 (chips por pacote); 1 se o título não diz. */
export function pecasPorUnidade(titulo: string): number {
  const m = /(\d+)\s*(?:pecas|pcs|pieces|unidades)\b/.exec(semAcento(titulo));
  return m ? Number(m[1]) : 1;
}

/* ── controle do Felipe ─────────────────────────────────────────────────── */

export interface Controle {
  /** Unidades compradas, se diferente da soma dos itens. */
  qtd?: number;
  /** Marcado como recebido à mão (a entrega "entregue" da AliExpress também conta). */
  recebido?: boolean;
  /** Corrige o grupo que o título sugeriu. */
  grupo?: Grupo;
  /** Fora do estoque (brinde, uso próprio). Padrão: só o grupo "outro". */
  foraDoEstoque?: boolean;
  /** Custo total em reais, quando a AliExpress não trouxe. */
  custo?: number;
  notas?: string;
  arquivado?: boolean;
}

export interface PedidoManual {
  id: string;
  titulo: string;
  qtd: number;
  grupo: Grupo;
  data: string;
}

export interface Venda {
  id: string;
  grupo: Grupo;
  qtd: number;
  /** Preço por unidade, em reais. */
  preco?: number;
  /** ISO. */
  data: string;
  nota?: string;
}

/**
 * Ponto de partida do estoque de um produto: "tenho N agora". Pedidos já recebidos nesse momento (`excluidos`) e
 * vendas até `em` saem da conta; o que chegar ou for vendido depois soma/subtrai de `qtd`. Sem isso o estoque
 * seria a soma de TODA a história de compras da conta.
 */
export interface BaseEstoque {
  qtd: number;
  excluidos: string[];
  /** ISO do momento do acerto. */
  em: string;
}

/**
 * Operação antiga, de fora da AliExpress (ex.: importação de 5.000 microchips): compra e venda já encerradas.
 * Não mexe no estoque; só entra no balanço (faturamento, custo e lucro).
 */
export interface OperacaoAntiga {
  id: string;
  grupo: Grupo;
  descricao: string;
  /** Quando foi, em texto livre ("24 fev 2023"). */
  data?: string;
  /** Unidades de venda (microchip: chips). */
  unidades: number;
  /** Custo e preço de venda por unidade, em reais. */
  custoUnit: number;
  vendaUnit: number;
}

export interface EstadoPedidos {
  controles: Record<string, Controle>;
  manuais: PedidoManual[];
  vendas: Venda[];
  base: Partial<Record<Grupo, BaseEstoque>>;
  /** Preço de venda de UMA unidade (microchip: por chip), em reais. Padrão em PRECO_VENDA_PADRAO. */
  precosVenda?: Partial<Record<Grupo, number>>;
  historico?: OperacaoAntiga[];
  /** ISO do último "visto": alertas e mudanças depois disso aparecem como novos. */
  vistoEm: string | null;
}

export const ESTADO_INICIAL: EstadoPedidos = { controles: {}, manuais: [], vendas: [], base: {}, vistoEm: null };
export const CONTROLE_VAZIO: Controle = {};

/** Preços de venda que o Felipe praticava em 20/10/2026: R$ 8,60 por chip e R$ 280 por leitor. */
export const PRECO_VENDA_PADRAO: Record<Grupo, number> = { microchip: 8.6, leitor: 280, outro: 0 };

/** "14 out, 2026" -> Date (meio-dia local) ou null. */
export function dataDoPedido(texto: string | null): Date | null {
  const m = /(\d{1,2})\s+([a-zç]{3})\w*\.?,?\s+(\d{4})/i.exec(texto ?? '');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const mes = m ? meses.indexOf(m[2].toLowerCase()) : -1;
  return m && mes >= 0 ? new Date(Number(m[3]), mes, Number(m[1]), 12) : null;
}

/* ── estoque ────────────────────────────────────────────────────────────── */

export interface LinhaPedido {
  id: string;
  ali: PedidoAli | null;
  manual: PedidoManual | null;
  grupo: Grupo;
  titulo: string;
  qtd: number;
  recebido: boolean;
  cancelado: boolean;
  /** Entra na conta do estoque (não cancelado, pago, não arquivado, não "fora"). */
  conta: boolean;
}

export const temProblema = (p: PedidoAli) => p.alertas.length > 0;

export function linhasDePedidos(snapshot: PedidoAli[], manuais: PedidoManual[], controles: Record<string, Controle>): LinhaPedido[] {
  const linhas: LinhaPedido[] = [];
  for (const p of snapshot) {
    const c = controles[p.id];
    const titulo = p.itens[0]?.titulo ?? `Pedido ${p.id}`;
    const grupo = c?.grupo ?? grupoDoProduto(titulo);
    const soma = p.itens.reduce((s, i) => s + (i.qtd > 0 ? i.qtd : 0), 0);
    const cancelado = p.entrega === 'cancelado';
    const pago = p.pagamento !== 'problema' && p.pagamento !== 'pendente';
    linhas.push({
      id: p.id,
      ali: p,
      manual: null,
      grupo,
      titulo,
      qtd: c?.qtd ?? (soma > 0 ? soma : 1),
      recebido: c?.recebido === true || p.entrega === 'entregue',
      cancelado,
      conta: !c?.arquivado && !cancelado && pago && !(c?.foraDoEstoque ?? grupo === 'outro'),
    });
  }
  for (const m of manuais) {
    const c = controles[m.id];
    const grupo = c?.grupo ?? m.grupo;
    linhas.push({
      id: m.id,
      ali: null,
      manual: m,
      grupo,
      titulo: m.titulo,
      qtd: c?.qtd ?? m.qtd,
      recebido: c?.recebido === true,
      cancelado: false,
      conta: !c?.arquivado && !(c?.foraDoEstoque ?? grupo === 'outro'),
    });
  }
  return linhas;
}

export interface ResumoGrupo {
  comprado: number;
  recebido: number;
  aCaminho: number;
  vendido: number;
  /** recebido − vendido; negativo = vendeu mais do que marcou como recebido. */
  emEstoque: number;
  /** Soma de qtd × preço das vendas que informaram preço, em reais. */
  receita: number;
  /** Previsão mais próxima ("ate") entre os pedidos a caminho, ISO. */
  proximaChegada: string | null;
  /** Ponto de partida usado, se o estoque foi acertado. */
  base: BaseEstoque | null;
}

export function resumirPorGrupo(linhas: LinhaPedido[], vendas: Venda[], base: EstadoPedidos['base'] = {}): Record<Grupo, ResumoGrupo> {
  const r = (g: Grupo): ResumoGrupo => ({ comprado: 0, recebido: 0, aCaminho: 0, vendido: 0, emEstoque: 0, receita: 0, proximaChegada: null, base: base[g] ?? null });
  const por: Record<Grupo, ResumoGrupo> = { microchip: r('microchip'), leitor: r('leitor'), outro: r('outro') };
  for (const l of linhas) {
    if (!l.conta || base[l.grupo]?.excluidos.includes(l.id)) continue;
    const g = por[l.grupo];
    g.comprado += l.qtd;
    if (l.recebido) g.recebido += l.qtd;
    else {
      g.aCaminho += l.qtd;
      const ate = l.ali?.previsao?.ate ?? null;
      if (ate && (!g.proximaChegada || ate < g.proximaChegada)) g.proximaChegada = ate;
    }
  }
  for (const v of vendas) {
    const b = base[v.grupo];
    if (b && v.data <= b.em) continue;
    por[v.grupo].vendido += v.qtd;
    if (v.preco != null) por[v.grupo].receita += v.qtd * v.preco;
  }
  for (const g of Object.values(por)) g.emEstoque = (g.base?.qtd ?? 0) + g.recebido - g.vendido;
  return por;
}

/** "R$4.636,37" -> 4636.37 (o coletor grava sempre nesse formato). */
export function totalEmReais(total: string | null): number | null {
  const m = /R\$\s?([\d.]+),(\d{2})/.exec(total ?? '');
  return m ? Number(`${m[1].replace(/\./g, '')}.${m[2]}`) : null;
}

/** "Microchip", "Leitor" e, para o resto, a primeira palavra do título ("Relógio"). */
export function nomeCurto(titulo: string): string {
  const g = grupoDoProduto(titulo);
  if (g === 'microchip') return 'Microchip';
  if (g === 'leitor') return 'Leitor';
  const w = titulo.split(/[\s,]+/)[0] ?? '';
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : 'Pedido';
}

/* ── balanço: faturamento, custo e lucro estimado ───────────────────────── */

export interface Balanco {
  grupo: Grupo;
  /** Preço de venda de uma unidade (microchip: por chip). */
  precoVenda: number;
  /** Chips por pacote (média das compras); 1 para leitor. */
  pecas: number;
  /** Unidades de venda (chips, leitores) compradas e já vendidas. */
  compradas: number;
  vendidas: number;
  faturamento: number;
  /** Tudo que foi pago nas compras recebidas (com imposto), e a parte que corresponde ao que já foi vendido. */
  custoCompras: number;
  custoVendido: number;
  /** Custo do que ainda está em estoque. */
  custoEstoque: number;
  lucro: number;
  /** lucro / faturamento; null sem faturamento. */
  margem: number | null;
}

/**
 * Faturamento e lucro estimados de um produto, de TODO o histórico.
 *
 * O que saiu do estoque foi vendido: vendidas = recebidas − estoque atual. As vendas registradas na página usam o
 * preço que o Felipe informou (ou o padrão); o resto do histórico usa o preço padrão. O custo é o total pago em cada
 * compra (imposto de importação, ICMS e frete inclusos), repartido pelo custo médio entre o que vendeu e o que sobrou.
 * Compra lançada à mão não tem valor e fica fora do custo.
 */
export function balanco(grupo: Grupo, linhas: LinhaPedido[], vendas: Venda[], emEstoque: number, precoVendaInformado?: number, antigas: OperacaoAntiga[] = []): Balanco {
  const precoVenda = precoVendaInformado ?? PRECO_VENDA_PADRAO[grupo];
  let pacotes = 0;
  let unidades = 0;
  let custoCompras = 0;
  for (const l of linhas) {
    if (l.grupo !== grupo || !l.conta || !l.recebido || !l.ali) continue;
    pacotes += l.qtd;
    unidades += l.qtd * (grupo === 'microchip' ? pecasPorUnidade(l.titulo) : 1);
    custoCompras += totalEmReais(l.ali.total) ?? 0;
  }
  const pecas = pacotes > 0 ? unidades / pacotes : 1;
  const pacotesVendidos = Math.min(pacotes, Math.max(0, pacotes - emEstoque));
  const registradas = vendas.filter((v) => v.grupo === grupo);
  const pacotesRegistrados = registradas.reduce((s, v) => s + v.qtd, 0);
  const pacotesHistorico = Math.max(0, pacotesVendidos - pacotesRegistrados);
  const faturamento = pacotesHistorico * pecas * precoVenda + registradas.reduce((s, v) => s + v.qtd * pecas * (v.preco ?? precoVenda), 0);
  const custoVendidoAli = pacotes > 0 ? custoCompras * (pacotesVendidos / pacotes) : 0;
  // Operações antigas: compra e venda já encerradas, entram inteiras no balanço.
  const ant = antigas.filter((o) => o.grupo === grupo);
  const antUnidades = ant.reduce((s, o) => s + o.unidades, 0);
  const antCusto = ant.reduce((s, o) => s + o.unidades * o.custoUnit, 0);
  const antFat = ant.reduce((s, o) => s + o.unidades * o.vendaUnit, 0);
  const faturamentoTotal = faturamento + antFat;
  const custoVendido = custoVendidoAli + antCusto;
  return {
    grupo,
    precoVenda,
    pecas,
    compradas: unidades + antUnidades,
    vendidas: pacotesVendidos * pecas + antUnidades,
    faturamento: faturamentoTotal,
    custoCompras: custoCompras + antCusto,
    custoVendido,
    custoEstoque: custoCompras - custoVendidoAli,
    lucro: faturamentoTotal - custoVendido,
    margem: faturamentoTotal > 0 ? (faturamentoTotal - custoVendido) / faturamentoTotal : null,
  };
}
