/*
 * Preço atual do produto (página do item da AliExpress) e quando vale avisar.
 *
 * O preço depende da VARIANTE escolhida (a padrão da página costuma ser outra: no microchip
 * da WSRFID o padrão é um leitor de R$ 72) e tem faixa por quantidade ("R$323,54 cada, ≥ 3 peças").
 * Quem compra de 8 em 8 olha a faixa; por isso guardamos as duas.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { numeroBR } from './util.mjs';

const DIR = process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');
const ARQ_PRECOS = join(DIR, 'precos.json');
const ARQ_AJUSTES = join(DIR, 'ajustes.json');
const MAX_HISTORICO = 800;

/** Texto da página do item -> preço da variante selecionada. */
export function parsearProduto(texto) {
  const i = texto.search(/vendido\(s\)|\bsold\b/i);
  const corpo = i >= 0 ? texto.slice(i, i + 700) : texto.slice(0, 1500);
  const lote = /R\$\s?([\d.,]+)\s+(?:cada|each),\s*[≥>=]+\s*(\d+)\s+(?:pe[cç]as|pieces|pcs)/i.exec(corpo);
  const imp = /R\$\s?([\d.,]+)\+?\s+(?:em impostos|in (?:estimated )?(?:taxes|duties))/i.exec(corpo);
  return {
    preco: numeroBR(/R\$\s?([\d.,]+)/.exec(corpo)?.[1]),
    precoLote: lote ? numeroBR(lote[1]) : null,
    minLote: lote ? Number(lote[2]) : null,
    impostos: imp ? numeroBR(imp[1]) : null,
    variante: /^(?:cor|color|colour):\s*(.+)$/im.exec(texto)?.[1]?.trim() ?? null,
  };
}

const linhasDe = (texto) => texto.split('\n').map((l) => l.trim()).filter(Boolean);

/**
 * Tela final da compra (/p/trade/confirm), ANTES de "Fazer o pedido":
 *   Resumo / Subtotal R$332,99 / Cupom de desconto / Frete grátis / Imposto de importação R$36,88 / ICMS R$75,76 / Total R$445,63
 * O rótulo e o valor podem vir na mesma linha ou em linhas seguidas.
 */
export function parsearCheckout(texto) {
  const linhas = linhasDe(texto);
  const iResumo = linhas.findIndex((l) => /^(Resumo|Order summary)$/i.test(l));
  const resumo = iResumo >= 0 ? linhas.slice(iResumo) : linhas;
  const valor = (rotulo) => {
    const i = resumo.findIndex((l) => rotulo.test(l));
    if (i < 0) return null;
    for (const l of [resumo[i], resumo[i + 1] ?? '']) {
      const m = /R\$\s?([\d.,]+)/.exec(l);
      if (m) return numeroBR(m[1]);
      if (/gr[aá]tis|free/i.test(l)) return 0;
    }
    return null;
  };
  const total = valor(/^Total\b/i);
  return {
    subtotal: valor(/^Subtotal/i),
    frete: valor(/^(Frete|Shipping)/i),
    imposto: valor(/^Imposto de importa/i),
    icms: valor(/^ICMS/i),
    total,
  };
}

/**
 * Preço de UMA unidade com tudo incluído (imposto, ICMS, frete) quando a leitura passou pelo checkout; senão o da página.
 * Quem compra até 3 por vez olha o de uma unidade: acima disso o imposto sobe.
 */
export function precoDeCompra(e) {
  if (e.checkout?.total) return e.checkout.total / (e.checkout.qtd || 1);
  return e.precoLote ?? e.preco;
}

/** Entradas comparáveis: se alguma passou pelo checkout, só essas (preço de página sem imposto não se mistura). */
const comparaveis = (h) => (h.some((e) => e.checkout?.total) ? h.filter((e) => e.checkout?.total) : h);

/** Média dos últimos 7 e 30 dias (sem contar hoje) e onde o preço de hoje está. */
export function medias(historico) {
  const h = comparaveis(historico);
  const hoje = h.at(-1);
  if (!hoje) return null;
  const nDias = (e) => (Date.parse(hoje.em) - Date.parse(e.em)) / 86_400_000;
  const antes = h.slice(0, -1);
  const media = (dias) => {
    const v = antes.filter((e) => nDias(e) <= dias).map(precoDeCompra);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const atual = precoDeCompra(hoje);
  const m30 = media(30);
  const vs30 = m30 ? atual / m30 - 1 : null;
  const veredito = vs30 == null || antes.length < 2 ? 'sem_historico' : vs30 <= -0.03 ? 'bom' : vs30 >= 0.03 ? 'caro' : 'na_media';
  return { n: h.length, atual, media7: media(7), media30: m30, vs30, veredito };
}

/** Uma entrada por dia e produto (a leitura mais nova do dia substitui). Do mais antigo ao mais novo. */
export function registrarPreco(historico, entrada) {
  const dia = entrada.em.slice(0, 10);
  const resto = historico.filter((e) => !(e.grupo === entrada.grupo && e.em.slice(0, 10) === dia));
  return [...resto, entrada].sort((a, b) => a.em.localeCompare(b.em)).slice(-MAX_HISTORICO);
}

const usd = (e) => (e.dolar ? precoDeCompra(e) / e.dolar : null);
const MENOS = 0.995;

/**
 * Quando avisar sobre o preço de um produto acompanhado.
 * @param historico  entradas do grupo, do mais antigo ao mais novo (a última é a de hoje)
 * @param pago       menor preço unitário (R$) que o Felipe pagou em compras recentes em lote, ou null
 */
export function avaliarPreco(todo, pago = null) {
  const historico = comparaveis(todo);
  const hoje = historico.at(-1);
  if (!hoje) return [];
  const alertas = [];
  const brl = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  const antes = historico.slice(0, -1);
  const ontem = antes.at(-1);
  const u = usd(hoje);
  if (u && ontem && usd(ontem)) {
    const queda = 1 - u / usd(ontem);
    if (queda >= 0.03) alertas.push(`caiu ${(queda * 100).toFixed(1).replace('.', ',')}% em dólar (não é só câmbio)`);
  }
  const ult30 = antes.filter((e) => Date.parse(hoje.em) - Date.parse(e.em) <= 30 * 86_400_000).map(usd).filter(Boolean);
  if (u && ult30.length >= 3 && u < Math.min(...ult30) * MENOS) alertas.push('menor preço em dólar em 30 dias');
  if (pago && precoDeCompra(hoje) < pago * 0.99) alertas.push(`abaixo do último pago (${brl(pago)})`);
  return alertas;
}

/* ── arquivos locais ────────────────────────────────────────────────────── */

const ler = (arq, padrao) => {
  try {
    return JSON.parse(readFileSync(arq, 'utf8'));
  } catch {
    return padrao;
  }
};
const gravar = (arq, valor) => {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(arq, JSON.stringify(valor, null, 2), { mode: 0o600 });
  chmodSync(arq, 0o600);
};

export const lerHistoricoPrecos = () => ler(ARQ_PRECOS, []);
export const gravarHistoricoPrecos = (h) => gravar(ARQ_PRECOS, h);

/** Quais produtos acompanhar. Padrão do Felipe: microchip sim (recompra), leitor não. */
export const AJUSTES_PADRAO = { acompanhar: { microchip: true, leitor: false }, variante: { microchip: 'green 2.12x12mm' },
  // Só chega até a tela final da compra (nunca "Fazer o pedido") para ler o total com impostos; quantidade 1 (acima de 3 o imposto sobe).
  checkout: { microchip: true },
  qtd: { microchip: 1 },
};
export function lerAjustes() {
  const a = ler(ARQ_AJUSTES, null);
  return { acompanhar: { ...AJUSTES_PADRAO.acompanhar, ...(a?.acompanhar ?? {}) }, variante: { ...AJUSTES_PADRAO.variante, ...(a?.variante ?? {}) }, checkout: { ...AJUSTES_PADRAO.checkout, ...(a?.checkout ?? {}) }, qtd: { ...AJUSTES_PADRAO.qtd, ...(a?.qtd ?? {}) } };
}
export const existeAjustes = () => existsSync(ARQ_AJUSTES);
