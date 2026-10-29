#!/usr/bin/env node
/*
 * Coletor do /pedidos — lê a SUA conta da AliExpress e grava um snapshot local.
 *
 *   node coletor.mjs login      abre o Chrome com um perfil só do coletor; você entra na conta
 *                               (senha e código só você digita) e fecha a janela. Uma vez.
 *   node coletor.mjs            lê os pedidos e grava ~/.seabra-pedidos/pedidos.json
 *   node coletor.mjs --visivel  idem, mostrando a janela (para ver o que ele faz)
 *   node coletor.mjs --dry      lê e mostra o resumo, sem gravar
 *   node coletor.mjs --dump     grava texto/HTML bruto das páginas em ~/.seabra-pedidos/dump
 *                               (é como se ajusta a leitura quando a AliExpress muda o layout)
 *
 * O coletor NUNCA digita senha, NUNCA paga, cancela, confirma recebimento nem abre disputa:
 * só abre páginas e lê texto. A sessão fica no perfil ~/.seabra-pedidos/perfil (cookies do
 * Chrome); o snapshot sai com permissão 600. Nada é enviado para fora desta máquina — o
 * /pedidos lê o arquivo pela rota local /pedidos/api/snapshot.
 *
 * Variáveis: PEDIDOS_DIR (padrão ~/.seabra-pedidos), ALIEXPRESS_BASE (padrão https://www.aliexpress.com).
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { classificar, ROTULOS } from './classificar.mjs';
import { numeroBR, reaisTexto, reaisParaNumero } from './util.mjs';
import { grupoDoProduto } from './grupos.mjs';
import { lerAjustes, lerHistoricoPrecos, gravarHistoricoPrecos, parsearProduto, parsearCheckout, registrarPreco, avaliarPreco, medias, precoDeCompra } from './precos.mjs';
import { descarregarFila, dolarAtual, enviarOuGuardar, lerConfig, montarAvisoDesembaraco, montarAvisoPedidos, montarMensagem, temNovidade } from './notificar.mjs';
import { dadosLocais, enviarParaNuvem, lerNuvem } from './nuvem.mjs';

const DIR = process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');
const BASE = (process.env.ALIEXPRESS_BASE ?? 'https://pt.aliexpress.com').replace(/\/$/, '');
const ARQUIVO = join(DIR, 'pedidos.json');
const PERFIL = join(DIR, 'perfil');
const DUMP = join(DIR, 'dump');
const MAX_DETALHES = 40;
const MAX_MUDANCAS = 80;
const GUARDA_MUDANCA_MS = 30 * 24 * 3_600_000;

// Toda linha do log leva data e hora: o launchd não marca, e sem isso não dá para saber QUANDO cada checagem rodou.
const _log = console.log;
console.log = (...a) => _log(`[${new Date().toLocaleString('pt-BR')}]`, ...a);

const args = new Set(process.argv.slice(2));
const modoLogin = args.has('login');
const dry = args.has('--dry');
const rapido = args.has('--rapido');
const dump = args.has('--dump');
const visivel = args.has('--visivel') || modoLogin;

const espera = (min, max) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

export { numeroBR };

/* ── snapshot em disco ──────────────────────────────────────────────────── */

function lerSnapshot() {
  try {
    return JSON.parse(readFileSync(ARQUIVO, 'utf8'));
  } catch {
    return null;
  }
}

export function gravarSnapshot(snap) {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  const tmp = `${ARQUIVO}.tmp`;
  writeFileSync(tmp, JSON.stringify(snap, null, 2), { mode: 0o600 });
  renameSync(tmp, ARQUIVO);
  chmodSync(ARQUIVO, 0o600);
}

/* ── o que mudou desde a coleta anterior ────────────────────────────────── */

export function diferencas(antes, depois, em) {
  const mudancas = [];
  const prev = new Map((antes ?? []).map((p) => [p.id, p]));
  for (const p of depois) {
    const nome = p.itens[0]?.titulo?.slice(0, 50) ?? `pedido ${p.id}`;
    const a = prev.get(p.id);
    if (!a) {
      mudancas.push({ pedidoId: p.id, em, texto: `Novo pedido: ${nome}`, grave: p.alertas.length > 0 });
      continue;
    }
    for (const trilha of ['pagamento', 'aduana', 'entrega']) {
      if (a[trilha] === p[trilha]) continue;
      const grave = p.alertas.some((x) => x.tipo === trilha);
      mudancas.push({ pedidoId: p.id, em, texto: `${nome}: ${ROTULOS[trilha][p[trilha]]}`, grave });
    }
  }
  return mudancas;
}

/* ── extração (roda dentro da página) ───────────────────────────────────── */

/** Lista: um registro por pedido, com o texto do cartão. */
function extrairLista() {
  const ids = new Map();
  for (const a of document.querySelectorAll('a[href*="orderId="], a[href*="order/detail"]')) {
    const m = /orderId=(\d{8,})/.exec(a.href);
    if (m && !ids.has(m[1])) ids.set(m[1], a);
  }
  const idsEm = (el) => new Set([...el.querySelectorAll('a[href*="orderId="]')].map((a) => /orderId=(\d{8,})/.exec(a.href)?.[1]).filter(Boolean));
  const saida = [];
  for (const [id, ancora] of ids) {
    let card = ancora;
    while (card.parentElement && card.parentElement !== document.body) {
      const so = idsEm(card.parentElement);
      if (so.size > 1 || (so.size === 1 && !so.has(id))) break;
      card = card.parentElement;
    }
    const imagens = [...card.querySelectorAll('img')].map((i) => i.currentSrc || i.src).filter((s) => /alicdn|aliexpress/.test(s));
    const item = card.querySelector('a[href*="/item/"]');
    saida.push({
      id,
      itemPath: item ? new URL(item.href).pathname : null,
      url: ancora.href,
      texto: card.innerText.replace(/\n{2,}/g, '\n').trim().slice(0, 1500),
      imagem: imagens[0] ?? null,
    });
  }
  return saida;
}

const textoPagina = () => document.body.innerText.replace(/\n{2,}/g, '\n').trim();

/* ── interpretação do texto ─────────────────────────────────────────────── */

const MESES = { jan: 0, fev: 1, feb: 1, mar: 2, abr: 3, apr: 3, mai: 4, may: 4, jun: 5, jul: 6, ago: 7, aug: 7, set: 8, sep: 8, out: 9, oct: 9, nov: 10, dez: 11, dec: 11 };

const linhasDe = (texto) => texto.split('\n').map((l) => l.trim()).filter(Boolean);
const dois = (n) => String(n).padStart(2, '0');

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "14 out, 2026" ou "Oct 14, 2026" -> Date (meio-dia local), ou null. */
export function dataDoCartao(texto) {
  const t = texto ?? '';
  const pt = /(\d{1,2})\s+([a-zç]{3})\w*\.?,?\s+(\d{4})/i.exec(t);
  const en = pt ? null : /([a-z]{3})\w*\.?\s+(\d{1,2}),?\s+(\d{4})/i.exec(t);
  const [dia, mesTxt, ano] = pt ? [pt[1], pt[2], pt[3]] : en ? [en[2], en[1], en[3]] : [];
  const mes = mesTxt ? MESES[mesTxt.toLowerCase()] : undefined;
  return mes !== undefined ? new Date(Number(ano), mes, Number(dia), 12) : null;
}

/** Date -> "14 out, 2026": a data do pedido sai sempre em português, que é o que o painel lê. */
const dataEmPortugues = (d) => `${d.getDate()} ${MESES_PT[d.getMonth()]}, ${d.getFullYear()}`;

/**
 * Cartão da lista de pedidos. Layout visto na conta (pt-BR):
 *   Aguardando a entrega / Data: 14 out, 2026 / Número de referência: … / Copiar / Detalhes /
 *   <loja> / <título> / <variante> / R$334,94   x1 / Cupom… / Total:R$374,62 / botões
 */
export function parsearCartao(texto) {
  const linhas = linhasDe(texto);
  const status = linhas[0] ?? '';
  const iDet = linhas.findIndex((l) => l === 'Detalhes' || l === 'Details');
  const corpo = iDet >= 0 ? linhas.slice(iDet + 1) : linhas.slice(1);
  const iPreco = corpo.findIndex((l) => /^R\$\s?[\d.,]+\s+x\s?\d+/i.test(l));
  const qtd = iPreco >= 0 ? Number(/x\s?(\d+)/i.exec(corpo[iPreco])[1]) : 1;
  const preco = iPreco >= 0 ? numeroBR(/R\$\s?([\d.,]+)/.exec(corpo[iPreco])?.[1]) : null;
  // Loja, título e variante vêm antes da linha de preço; o título é a linha mais longa.
  const antes = corpo.slice(0, iPreco >= 0 ? iPreco : 3);
  const titulo = [...antes].sort((x, y) => y.length - x.length)[0] ?? '';
  const loja = antes.length > 2 ? antes[0] : null;
  const variante = antes.length > 2 ? antes[antes.length - 1] : null;
  return {
    status,
    data: (() => {
      const d = dataDoCartao(linhas.find((l) => /^(Data|Date):/i.test(l)));
      return d ? dataEmPortugues(d) : null;
    })(),
    loja,
    titulo,
    variante,
    qtd,
    preco,
    total: reaisTexto(numeroBR(/Total:\s*R\$\s?([\d.,]+)/i.exec(texto)?.[1])),
  };
}

/** "Ter. | Oct. 20 15:50" -> "2026-10-20 15:50" (a AliExpress não mostra o ano: vale o mais recente que não seja futuro). */
export function dataDoEvento(linha, agora = new Date()) {
  const m = /^[^|]{2,6}\|\s*([A-Za-zç]{3})\w*\.?\s+(\d{1,2})\s+(\d{1,2}:\d{2})$/.exec(linha);
  const mes = m ? MESES[m[1].toLowerCase()] : undefined;
  if (!m || mes === undefined) return null;
  let ano = agora.getFullYear();
  if (new Date(ano, mes, Number(m[2])) > new Date(agora.getTime() + 2 * 86_400_000)) ano--;
  return `${ano}-${dois(mes + 1)}-${dois(m[2])} ${m[3].padStart(5, '0')}`;
}

/** "Entrega:Oct. 26 - Nov. 07" -> { de: '2026-10-26', ate: '2026-11-07' } (sem ano na tela: vale o que cai perto de hoje). */
export function previsaoDeEntrega(linha, agora = new Date()) {
  const m = /^(?:Entrega|Delivery):\s*([A-Za-zç]{3})\w*\.?\s+(\d{1,2})\s*[-–]\s*([A-Za-zç]{3})\w*\.?\s+(\d{1,2})/i.exec(linha ?? '');
  const m1 = m ? MESES[m[1].toLowerCase()] : undefined;
  const m2 = m ? MESES[m[3].toLowerCase()] : undefined;
  if (!m || m1 === undefined || m2 === undefined) return null;
  let ano = agora.getFullYear();
  if (new Date(ano, m1, Number(m[2])) < new Date(agora.getTime() - 45 * 86_400_000)) ano++;
  const de = new Date(ano, m1, Number(m[2]));
  let ate = new Date(ano, m2, Number(m[4]));
  if (ate < de) ate = new Date(ano + 1, m2, Number(m[4]));
  const iso = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
  return { de: iso(de), ate: iso(ate) };
}

/**
 * Rastreio (/p/tracking). Cada evento é: [título] [descrição] "Dom. | Oct. 18 03:49", do mais novo ao mais antigo.
 * Antes do 1º evento há um cabeçalho com o número de rastreamento e, entre eventos, uma barra de progresso
 * e avisos ("Este pacote foi enviado…"): só as 2 linhas logo acima da data contam.
 */
export function parsearRastreio(texto, agora = new Date()) {
  const linhas = linhasDe(texto);
  const previsao = previsaoDeEntrega(linhas.find((l) => /^(Entrega|Delivery):/i.test(l)), agora);
  const iCod = linhas.findIndex((l) => /^(n[uú]mero de rastre\w+|tracking (number|no\.?))/i.test(l));
  const codigo = iCod >= 0 ? (/:\s*([A-Z0-9]{8,30})\s*$/i.exec(linhas[iCod])?.[1] ?? null) : null;
  const inicio = iCod >= 0 ? iCod + 1 : 0;
  const fim = linhas.findIndex((l, i) => i >= inicio && /^(Detalhes do pedido|Itens relacionados|Order details|Related items|\d+ (moedas|coins))/i.test(l));
  const trecho = linhas.slice(inicio, fim >= 0 ? fim : undefined).filter((l) => l !== 'Copiar' && !/^(Este pacote foi enviado|Seu pacote tem chegada estimada)/i.test(l));
  const eventos = [];
  let desde = 0;
  trecho.forEach((l, i) => {
    const data = dataDoEvento(l, agora);
    if (!data) return;
    const bloco = trecho.slice(desde, i).slice(-2);
    const textos = bloco.length === 2 && bloco[0] === bloco[1] ? [bloco[0]] : bloco;
    if (textos.length) eventos.push({ data, texto: textos.join(' — ').slice(0, 300) });
    desde = i + 1;
  });
  return { codigo, previsao, eventos };
}

/**
 * Prazo para pagar, da página de detalhes ("Sem pagamento, este pedido será cancelado em 18 dias"). O Felipe deixa
 * pedidos separados no preço bom e paga depois: o que importa é quantos dias ainda tem. Devolve a data-limite (ISO) ou null.
 */
export function parsearPrazoPagamento(texto, agora = new Date()) {
  const m = String(texto ?? '').match(/cancelad[oa] em (\d+) (dia|hora|minuto)s?|(?:closed|cancell?ed) in (\d+) (day|hour|minute)s?/i);
  if (!m) return null;
  const n = Number(m[1] ?? m[3]);
  const unidade = (m[2] ?? m[4]).toLowerCase();
  const ms = /^(dia|day)$/.test(unidade) ? 86_400_000 : /^(hora|hour)$/.test(unidade) ? 3_600_000 : 60_000;
  return new Date(agora.getTime() + n * ms).toISOString();
}

/** Dias inteiros que faltam até `ate` (arredonda para cima: "18 dias" lido hoje continua 18 hoje). */
export function diasParaPagar(ate, agora = new Date()) {
  return Math.max(0, Math.ceil((Date.parse(ate) - agora.getTime()) / 86_400_000));
}

export function montarPedido(item, rastreioTexto, agora = new Date(), detalheTexto = '') {
  const c0 = parsearCartao(item.texto);
  const r = rastreioTexto ? parsearRastreio(rastreioTexto, agora) : { codigo: null, previsao: null, eventos: [] };
  const c = classificar({ statusTexto: c0.status, eventos: [...r.eventos].reverse() });
  const alertas = [...c.alertas];
  const prazoPagamento = c.pagamento === 'pendente' ? parsearPrazoPagamento(detalheTexto, agora) : null;

  // Pedido separado esperando pagamento é escolha dele: só vira alerta quando o prazo está acabando (≤ 3 dias).
  // Sem o prazo lido, vale a regra antiga: pendente há mais de um dia.
  const feito = dataDoCartao(c0.data);
  const dias = feito ? Math.floor((agora - feito) / 86_400_000) : 0;
  if (c.pagamento === 'pendente' && prazoPagamento) {
    const resta = diasParaPagar(prazoPagamento, agora);
    if (resta <= 3) alertas.push({ tipo: 'pagamento', texto: `Pagar em ${resta} dia${resta === 1 ? '' : 's'} ou o pedido é cancelado` });
  } else if (c.pagamento === 'pendente' && dias >= 1) alertas.push({ tipo: 'pagamento', texto: `Pagamento pendente há ${dias} dia${dias > 1 ? 's' : ''} (pedido de ${c0.data})` });

  return {
    id: item.id,
    url: `${BASE}/p/order/detail.html?orderId=${item.id}`,
    data: c0.data,
    loja: c0.loja,
    itens: [{ titulo: c0.titulo || `Pedido ${item.id}`, qtd: c0.qtd, preco: c0.preco, imagem: item.imagem }],
    total: c0.total,
    statusTexto: c0.status,
    pagamento: c.pagamento,
    aduana: c.aduana,
    entrega: c.entrega,
    alertas,
    produto: item.itemPath ? { url: `${BASE}${item.itemPath}`, variante: c0.variante } : null,
    codigoRastreio: r.codigo,
    previsao: r.previsao,
    eventos: r.eventos.slice(0, 30),
    ...(prazoPagamento ? { prazoPagamento } : {}),
  };
}

/** Pedido já conhecido + rastreio novo -> mesmo pedido com pagamento/aduana/entrega reclassificados. */
export function reclassificar(p, rastreioTexto, agora = new Date()) {
  const r = parsearRastreio(rastreioTexto, agora);
  // Sem nenhum evento a leitura é inconclusiva (página não carregou): nunca vira "mudança".
  if (r.eventos.length === 0) return p;
  const c = classificar({ statusTexto: p.statusTexto, eventos: [...r.eventos].reverse() });
  return { ...p, pagamento: c.pagamento, aduana: c.aduana, entrega: c.entrega, alertas: c.alertas, codigoRastreio: r.codigo ?? p.codigoRastreio, previsao: r.previsao ?? p.previsao ?? null, eventos: r.eventos.slice(0, 30) };
}

/* ── navegador ──────────────────────────────────────────────────────────── */

async function abrir() {
  const { chromium } = await import('playwright-core');
  mkdirSync(PERFIL, { recursive: true, mode: 0o700 });
  return chromium.launchPersistentContext(PERFIL, {
    channel: 'chrome',
    headless: !visivel,
    locale: 'pt-BR',
    extraHTTPHeaders: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
    timezoneId: 'America/Sao_Paulo',
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
}

function problemaDeAcesso(pagina, texto) {
  const url = pagina.url();
  if (/login|passport|signin/i.test(url)) return 'sessão expirada — rode "node coletor.mjs login" e entre de novo';
  if (/punish|_tmd_|captcha|baxia/i.test(url) || /captcha|deslize para verificar|slide to verify|verifica[cç][aã]o de seguran/i.test(texto.slice(0, 2000))) {
    return 'a AliExpress pediu verificação (CAPTCHA) — rode "node coletor.mjs --visivel login", resolva e feche';
  }
  return null;
}

async function salvarDump(nome, pagina) {
  mkdirSync(DUMP, { recursive: true, mode: 0o700 });
  writeFileSync(join(DUMP, `${nome}.txt`), await pagina.evaluate(textoPagina), { mode: 0o600 });
  writeFileSync(join(DUMP, `${nome}.html`), await pagina.content(), { mode: 0o600 });
}

async function lerListaDePedidos(pagina) {
  await pagina.goto(`${BASE}/p/order/index.html`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await pagina.waitForTimeout(4000);
  const bloqueio = problemaDeAcesso(pagina, await pagina.evaluate(textoPagina));
  if (bloqueio) throw new Error(bloqueio);

  // A lista carrega por rolagem e por um botão "ver mais".
  let antes = -1;
  for (let i = 0; i < 12; i++) {
    await pagina.mouse.wheel(0, 2500);
    await pagina.waitForTimeout(1200);
    const mais = pagina.getByRole('button', { name: /ver mais|mais pedidos|view more|load more/i }).first();
    if (await mais.isVisible().catch(() => false)) await mais.click().catch(() => {});
    const n = await pagina.evaluate(() => document.querySelectorAll('a[href*="orderId="]').length);
    if (n === antes) break;
    antes = n;
  }
  if (dump) await salvarDump('lista', pagina);
  return pagina.evaluate(extrairLista);
}

/** Preço da VARIANTE escolhida na página do item. Se a variante não for selecionada, recusa: o preço padrão da página é de outro produto. */
async function lerPrecoDoProduto(pagina, url, variante, { checkout = false } = {}) {
  await pagina.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await pagina.waitForTimeout(4000);
  if (variante) {
    // A página hidrata depois de carregar: o clique só vale quando a miniatura está visível, e só se confirma
    // quando o texto "cor: <variante>" aparece. Tenta algumas vezes antes de desistir.
    const miniatura = pagina.getByAltText(variante, { exact: true });
    await miniatura.first().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {
      throw new Error(`variante "${variante}" não apareceu na página do produto`);
    });
    const marcada = () => pagina.evaluate((v) => new RegExp(`^cor:\\s*${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im').test(document.body.innerText), variante);
    for (let i = 0; i < 4 && !(await marcada()); i++) {
      await miniatura.nth(0).scrollIntoViewIfNeeded().catch(() => {});
      // force: a miniatura fica em animação logo após carregar e o clique normal espera "estabilizar" até estourar o prazo.
      await miniatura.nth(0).click({ force: true, timeout: 5_000 }).catch(() => {});
      await pagina.waitForTimeout(1800);
    }
  }
  if (dump) await salvarDump('produto', pagina);
  const lido = parsearProduto(await pagina.evaluate(textoPagina));
  if (variante && lido.variante?.toLowerCase() !== variante.toLowerCase()) throw new Error(`não consegui selecionar a variante "${variante}" (a página mostrou "${lido.variante}")`);
  if (!lido.preco) throw new Error('não achei o preço na página do produto');
  if (!checkout) return lido;
  try {
    return { ...lido, checkout: await lerCheckout(pagina) };
  } catch (e) {
    // O preço da página continua valendo; o motivo vai junto para o painel e o aviso.
    return { ...lido, checkoutErro: String(e?.message ?? e) };
  }
}

/*
 * TELA FINAL DA COMPRA — lê o total com imposto de importação, ICMS e frete, para UMA unidade.
 *
 * REGRA INEGOCIÁVEL (pedido do Felipe, 20/10/2026): o coletor NUNCA faz o pedido. O único clique permitido em
 * toda esta função é o do botão "Comprar" da página do produto, que só abre a tela de revisão. Na tela de
 * revisão ele não clica em NADA: só lê o texto e sai. "Fazer o pedido", "Confirmar compra", pagar, Pix e cartão
 * ficam proibidos por duas travas: o rótulo do botão tem de ser exatamente "Comprar" e não pode casar com PROIBIDO.
 */
export const PROIBIDO = /fazer (o )?pedido|place order|confirmar compra|confirm (purchase|order)|pagar|pay\b|pix|cart[aã]o|finalizar/i;
export const SO_ESTE_BOTAO = /^(Comprar|Buy now)$/i;

async function lerCheckout(pagina) {
  const botao = pagina.getByRole('button', { name: SO_ESTE_BOTAO }).first();
  if (!(await botao.count())) throw new Error('não achei o botão "Comprar" na página do produto');
  const rotulo = ((await botao.innerText()) || (await botao.getAttribute('aria-label')) || '').trim();
  if (!SO_ESTE_BOTAO.test(rotulo) || PROIBIDO.test(rotulo)) throw new Error(`recusei clicar em "${rotulo}": só "Comprar" é permitido`);

  // 'commit': basta o endereço trocar; esperar o "load" completo estoura o prazo (a tela de revisão carrega muitos rastreadores).
  await Promise.all([pagina.waitForURL(/\/trade\/confirm/, { timeout: 30_000, waitUntil: 'commit' }), botao.click({ force: true, timeout: 8_000 })]).catch((e) => {
    throw new Error(`a tela final da compra não abriu (${String(e?.message ?? e).split('\n')[0].slice(0, 120)})`);
  });
  await pagina.waitForTimeout(6000);
  // A partir daqui NENHUM clique: só leitura.
  const texto = await pagina.evaluate(textoPagina);
  if (dump) await salvarDump('checkout', pagina);
  await pagina.goto('about:blank').catch(() => {});
  const lido = parsearCheckout(texto);
  if (!lido.total) throw new Error('não achei o total na tela final da compra');
  return { qtd: 1, ...lido };
}

async function lerRastreio(pagina, id) {
  await pagina.goto(`${BASE}/p/tracking/index.html?tradeOrderId=${id}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  // Espera o rastreio APARECER (com o navegador recém-aberto a página demora): tempo fixo lia a tela vazia.
  // Pedido ainda sem envio não tem o número de rastreamento: segue após o prazo.
  await pagina.waitForFunction(() => /N[uú]mero de rastre|Tracking (number|no)/i.test(document.body.innerText), null, { timeout: 20_000 }).catch(() => {});
  await pagina.waitForTimeout(800);
  const bloqueio = problemaDeAcesso(pagina, await pagina.evaluate(textoPagina));
  if (bloqueio) throw new Error(bloqueio);
  // Só expande o histórico (nenhum efeito na conta).
  const mais = pagina.getByText(/ver mais detalhes de rastreamento|view more tracking/i).first();
  if (await mais.isVisible().catch(() => false)) {
    await mais.click().catch(() => {});
    await pagina.waitForTimeout(1200);
  }
  if (dump) await salvarDump(`rastreio-${id}`, pagina);
  return pagina.evaluate(textoPagina);
}

/** Página de detalhes do pedido (só leitura): é onde aparece o prazo para pagar. */
async function lerDetalhe(pagina, id) {
  await pagina.goto(`${BASE}/p/order/detail.html?orderId=${id}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await pagina.waitForFunction(() => /N[uú]mero de refer|Order (number|ID)/i.test(document.body.innerText), null, { timeout: 20_000 }).catch(() => {});
  await pagina.waitForTimeout(800);
  const texto = await pagina.evaluate(textoPagina);
  const bloqueio = problemaDeAcesso(pagina, texto);
  if (bloqueio) throw new Error(bloqueio);
  if (dump) await salvarDump(`detalhe-${id}`, pagina);
  return texto;
}

/* ── execução ───────────────────────────────────────────────────────────── */

async function login() {
  const ctx = await abrir();
  const pagina = ctx.pages()[0] ?? (await ctx.newPage());
  await pagina.goto(`${BASE}/p/order/index.html`).catch(() => {});
  console.log('Entre na sua conta na janela que abriu. Quando a lista de pedidos aparecer, feche a janela.');
  await new Promise((r) => ctx.on('close', r));
  console.log('Sessão guardada em', PERFIL);
}

/** Menor custo por unidade, com imposto, nas últimas compras de até 3 unidades (acima disso o imposto sobe). */
function menorPago(pedidos, grupo) {
  const pagos = pedidos
    .filter((p) => grupoDoProduto(p.itens[0]?.titulo ?? '') === grupo && p.pagamento === 'ok' && p.entrega !== 'cancelado' && p.itens[0]?.qtd >= 1 && p.itens[0].qtd <= 3 && reaisParaNumero(p.total))
    .slice(0, 5)
    .map((p) => reaisParaNumero(p.total) / p.itens[0].qtd);
  return pagos.length ? Math.min(...pagos) : null;
}

/** Compras dos últimos 60 dias (1 a 3 unidades, mesma variante) no formato das leituras, só para a média. */
function comprasRecentes(pedidos, grupo, variante) {
  const limite = Date.now() - 60 * 86_400_000;
  const saida = [];
  for (const p of pedidos) {
    const d = dataDoCartao(p.data);
    const total = reaisParaNumero(p.total);
    const it = p.itens[0];
    if (!d || !total || d.getTime() < limite || p.pagamento !== 'ok' || p.entrega === 'cancelado') continue;
    if (grupoDoProduto(it?.titulo ?? '') !== grupo || !(it.qtd >= 1 && it.qtd <= 3)) continue;
    if (variante && p.produto?.variante && p.produto.variante.toLowerCase() !== variante.toLowerCase()) continue;
    saida.push({ em: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T12:00:00.000Z`, grupo, fonte: 'compra', checkout: { total, qtd: it.qtd } });
  }
  return saida;
}

/** Lê o preço de cada produto acompanhado e guarda o histórico. Falha de um produto não derruba a coleta. */
async function coletarPrecos(pagina, pedidos, agora) {
  const ajustes = lerAjustes();
  let historico = lerHistoricoPrecos();
  const dolar = await dolarAtual();
  const resumo = {};
  for (const grupo of Object.keys(ajustes.acompanhar).filter((g) => ajustes.acompanhar[g])) {
    const base = pedidos.find((p) => p.produto?.url && grupoDoProduto(p.itens[0]?.titulo ?? '') === grupo);
    if (!base) continue;
    const variante = ajustes.variante[grupo] ?? base.produto.variante;
    try {
      await espera(1500, 3500);
      const lido = await lerPrecoDoProduto(pagina, base.produto.url, variante, { checkout: ajustes.checkout[grupo] === true });
      const entrada = { em: agora, grupo, itemUrl: base.produto.url, variante, preco: lido.preco, precoLote: lido.precoLote, minLote: lido.minLote, impostos: lido.impostos, dolar, ...(lido.checkout ? { checkout: lido.checkout } : {}), ...(lido.checkoutErro ? { checkoutErro: lido.checkoutErro } : {}) };
      historico = registrarPreco(historico, entrada);
      const doGrupo = historico.filter((e) => e.grupo === grupo);
      const alertas = avaliarPreco(doGrupo, menorPago(pedidos, grupo));
      // Até o histórico próprio de leituras ter dias suficientes, a média também considera o que ele pagou nos últimos 60 dias.
      resumo[grupo] = { ...entrada, alertas, medias: medias([...comprasRecentes(pedidos, grupo, variante), ...doGrupo].sort((a, b) => a.em.localeCompare(b.em))) };
    } catch (e) {
      resumo[grupo] = { em: agora, grupo, variante, erro: String(e?.message ?? e), alertas: [] };
    }
  }
  if (!dry) gravarHistoricoPrecos(historico);
  return resumo;
}

async function coletar() {
  const anterior = lerSnapshot();
  const agora = new Date().toISOString();
  let ctx;
  try {
    // A checagem rápida pode estar com o navegador: espera até ~3 min antes de desistir.
    for (let tentativa = 0; ; tentativa++) {
      try {
        ctx = await abrir();
        break;
      } catch (e) {
        if (tentativa >= 8 || !/SingletonLock|ProcessSingleton/i.test(String(e?.message))) throw e;
        await new Promise((r) => setTimeout(r, 20_000));
      }
    }
  } catch (e) {
    const emUso = /SingletonLock|ProcessSingleton|já está em uso/i.test(String(e?.message));
    return {
      versao: 1,
      atualizadoEm: agora,
      ok: false,
      erro: emUso ? 'o navegador do coletor já está aberto (feche a janela de login) e tente de novo' : `não consegui abrir o navegador: ${String(e?.message ?? e).split('\n')[0]}`,
      pedidos: anterior?.pedidos ?? [],
      precos: anterior?.precos ?? {},
      mudancas: anterior?.mudancas ?? [],
    };
  }
  try {
    const pagina = ctx.pages()[0] ?? (await ctx.newPage());
    const lista = await lerListaDePedidos(pagina);
    if (lista.length === 0) throw new Error('nenhum pedido encontrado na página — o layout pode ter mudado (rode com --dump)');

    const antes = new Map((anterior?.pedidos ?? []).map((p) => [p.id, p]));
    const pedidos = [];
    let abertos = 0;
    for (const item of lista) {
      const velho = antes.get(item.id);
      // Entregue/cancelado já lido não muda mais: reaproveita e poupa acessos.
      if (velho && (velho.entrega === 'entregue' || velho.entrega === 'cancelado')) {
        pedidos.push(velho);
        continue;
      }
      const status = parsearCartao(item.texto).status;
      const final = ['entregue', 'cancelado'].includes(classificar({ statusTexto: status }).entrega);
      // Esperando pagamento: não tem rastreio, mas a página de detalhes diz quantos dias faltam para pagar.
      if (/esperando pagamento|a ser pago|awaiting payment|to pay/i.test(status) && abertos < MAX_DETALHES) {
        abertos++;
        await espera(1500, 3500);
        const novo = montarPedido(item, '', new Date(), await lerDetalhe(pagina, item.id).catch(() => ''));
        pedidos.push(novo.prazoPagamento || !velho?.prazoPagamento ? novo : { ...novo, prazoPagamento: velho.prazoPagamento });
        continue;
      }
      // Concluído/cancelado já se explica pelo cartão: não precisa abrir o rastreio (a 1ª leitura traz o histórico todo).
      if (final || abertos >= MAX_DETALHES || /esperando pagamento|a ser pago|awaiting payment|to pay/i.test(status)) {
        // Sem envio ainda (ou limite de acessos): só o cartão da lista.
        pedidos.push(montarPedido(item, ''));
        continue;
      }
      abertos++;
      await espera(1500, 3500);
      let novo = montarPedido(item, await lerRastreio(pagina, item.id));
      // Rastreio que já tínhamos e agora veio vazio = leitura ruim, não pacote sem histórico: mantém o anterior.
      if (velho?.eventos?.length && novo.eventos.length === 0) {
        novo = { ...novo, aduana: velho.aduana, eventos: velho.eventos, previsao: novo.previsao ?? velho.previsao ?? null, codigoRastreio: novo.codigoRastreio ?? velho.codigoRastreio };
      }
      pedidos.push(novo);
    }

    const precos = await coletarPrecos(pagina, pedidos, agora);

    const novas = diferencas(anterior?.pedidos, pedidos, agora);
    const guardadas = (anterior?.mudancas ?? []).filter((m) => Date.now() - Date.parse(m.em) < GUARDA_MUDANCA_MS);
    return {
      versao: 1,
      atualizadoEm: agora,
      ok: true,
      pedidos,
      precos,
      // Primeira coleta não vira "mudança": seria a conta inteira como novidade.
      mudancas: [...(anterior ? novas : []), ...guardadas].slice(0, MAX_MUDANCAS),
    };
  } catch (e) {
    // Falha não apaga o que já se sabia: o painel mostra o último estado bom e o motivo.
    return {
      versao: 1,
      atualizadoEm: agora,
      ok: false,
      erro: String(e?.message ?? e),
      pedidos: anterior?.pedidos ?? [],
      precos: anterior?.precos ?? {},
      mudancas: anterior?.mudancas ?? [],
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

/**

 * Checagem LEVE, a cada poucas horas (--rapido): relê a lista (pedido novo, pagamento aprovado) e o rastreio dos pedidos
 * que ainda esperam o desembaraço aduaneiro, para avisar logo que acontecer. Qualquer falha (perfil em
 * uso pela leitura completa, sessão, CAPTCHA) é silenciosa: não grava erro, a leitura das 8h cuida disso.
 * Devolve o novo snapshot só se algo mudou; senão null.
 */
async function coletarRapido() {
  const anterior = lerSnapshot();
  if (!anterior?.ok) {
    console.log('Sem leitura completa anterior: nada a conferir.');
    return null;
  }
  const agora = new Date().toISOString();
  let ctx;
  try {
    ctx = await abrir();
    const pagina = ctx.pages()[0] ?? (await ctx.newPage());

    // 1) A lista: pedido NOVO e mudança de status do cartão (ex.: pagamento aprovado).
    const lista = await lerListaDePedidos(pagina);
    const conhecidos = new Map(anterior.pedidos.map((p) => [p.id, p]));
    let pedidos = [...anterior.pedidos];
    // A lista às vezes vem com um pedido a mais ou a menos: só vale como "novo" o que foi feito nos últimos dias.
    const recente = (data) => {
      const d = dataDoCartao(data);
      return d != null && Date.now() - d.getTime() < 4 * 86_400_000;
    };
    for (const item of lista) {
      const c0 = parsearCartao(item.texto);
      const velho = conhecidos.get(item.id);
      if (!velho) {
        if (recente(c0.data)) {
          const pagar = /esperando pagamento|a ser pago|awaiting payment|to pay/i.test(c0.status ?? '');
          const detalhe = pagar ? await lerDetalhe(pagina, item.id).catch(() => '') : '';
          pedidos = [montarPedido(item, '', new Date(), detalhe), ...pedidos];
        }
      } else if (c0.status && !['entregue', 'cancelado'].includes(velho.entrega)) {
        const c = classificar({ statusTexto: c0.status, eventos: [...(velho.eventos ?? [])].reverse() });
        // Atualiza se o texto do cartão mudou OU se a leitura que temos ficou para trás do classificador (ex.: "status ?").
        if (c0.status !== velho.statusTexto || c.pagamento !== velho.pagamento || c.entrega !== velho.entrega) {
          pedidos = pedidos.map((p) => (p.id === item.id ? { ...p, statusTexto: c0.status, pagamento: c.pagamento, entrega: c.entrega, aduana: p.aduana === 'concluida' ? p.aduana : c.aduana, alertas: c.alertas } : p));
        }
      }
    }

    // 2) O rastreio de quem ainda espera o desembaraço aduaneiro.
    const pendentes = pedidos.filter((p) => p.entrega === 'a_caminho' && p.aduana !== 'concluida');
    const atualizados = new Map();
    for (const p of pendentes) {
      await espera(1500, 3500);
      atualizados.set(p.id, reclassificar(p, await lerRastreio(pagina, p.id)));
    }
    pedidos = pedidos.map((p) => atualizados.get(p.id) ?? p);

    const novas = diferencas(anterior.pedidos, pedidos, agora);
    if (novas.length === 0) {
      console.log(`Sem novidade (${lista.length} pedidos na lista, ${pendentes.length} esperando desembaraço).`);
      return null;
    }
    console.log(`Mudou: ${novas.map((m) => m.texto).join(' | ')}`);
    return { ...anterior, atualizadoEm: agora, pedidos, mudancas: [...novas, ...anterior.mudancas].slice(0, MAX_MUDANCAS) };
  } catch (e) {
    console.log(`Checagem rápida pulada: ${String(e?.message ?? e).split('\n')[0]}`);
    return null;
  } finally {
    await ctx?.close().catch(() => {});
  }
}

function resumo(snap) {
  const n = (f) => snap.pedidos.filter(f).length;
  console.log(
    `${snap.ok ? 'OK' : 'FALHOU: ' + snap.erro} — ${snap.pedidos.length} pedidos · ` +
      `${n((p) => p.alertas.length > 0)} com problema · ${n((p) => p.pagamento === 'ok')} pagos · ` +
      `${n((p) => p.aduana === 'concluida')} desembaraçados · ${n((p) => p.entrega === 'entregue')} entregues`,
  );
  for (const [g, x] of Object.entries(snap.precos ?? {})) {
    console.log(x.erro ? `  preço ${g}: ERRO ${x.erro}` : `  preço ${g} (${x.variante}): R$ ${precoDeCompra(x).toFixed(2)} ${x.checkout ? '(com impostos, tela final da compra)' : `(só da página, sem impostos${x.checkoutErro ? ': ' + x.checkoutErro : ''})`} ${x.alertas.map((a) => '· ' + a).join(' ')}`);
  }
  for (const p of snap.pedidos.filter((x) => x.alertas.length > 0)) {
    console.log(`  ! ${p.itens[0]?.titulo?.slice(0, 60)} (${p.id})`);
    for (const a of p.alertas) console.log(`      ${a.tipo}: ${a.texto}`);
  }
}

/** Manda o resultado ao site (só se ~/.seabra-pedidos/nuvem.json existir). Falha daqui nunca derruba a coleta. */
async function subirParaOSite() {
  if (dry || args.has('--sem-site') || !lerNuvem()) return;
  try {
    const r = await enviarParaNuvem(dadosLocais());
    console.log(`Enviado ao site: ${(r?.gravados ?? []).join(', ') || 'nada'}.`);
  } catch (e) {
    console.log(`Não consegui enviar ao site: ${e.message}`);
  }
}

/** Aviso no Telegram (só se configurado). Falha de aviso nunca derruba a coleta. */
async function avisar(snap) {
  if (dry || args.has('--sem-aviso') || !lerConfig()) return;
  const novas = snap.mudancas.filter((m) => m.em === snap.atualizadoEm);
  const mandar = async (texto, rotulo) => {
    try {
      await enviarOuGuardar(texto);
      console.log(`${rotulo} enviado no Telegram.`);
    } catch (e) {
      console.log(`Não consegui avisar no Telegram (${rotulo}): ${e.message}`);
    }
  };
  // Desembaraço novo: mensagem PRÓPRIA e em destaque, antes de tudo — é o sinal para comprar.
  const urgente = montarAvisoDesembaraco(snap, novas);
  if (urgente) await mandar(urgente, 'Aviso de desembaraço');
  // Compra nova na conta (ou pagamento aprovado): confirma que o coletor viu.
  const pedidosNovos = montarAvisoPedidos(snap, novas);
  if (pedidosNovos) await mandar(pedidosNovos, 'Aviso de pedido');
  if (rapido) return;
  // Todo dia chega um resumo; o que muda é só o quanto tem de novidade no topo.
  await mandar(montarMensagem(snap, novas, await dolarAtual()), temNovidade(snap, novas) ? 'Aviso' : 'Resumo do dia');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (modoLogin) {
    await login();
  } else {
    if (!existsSync(PERFIL) && !dry) console.log('Aviso: sem sessão guardada ainda — rode "node coletor.mjs login" primeiro.');
    // Mensagem que não saiu por falha de rede numa execução anterior sai agora.
    if (!dry && lerConfig()) {
      const reenviadas = await descarregarFila().catch(() => 0);
      if (reenviadas) console.log(`Reenviei ${reenviadas} mensagem(ns) que estava(m) na fila.`);
    }
    const snap = rapido ? await coletarRapido() : await coletar();
    if (!snap) process.exit(0);
    resumo(snap);
    if (!dry) gravarSnapshot(snap);
    process.exitCode = snap.ok ? 0 : 1;
    await subirParaOSite();
    await avisar(snap);
  }
}
