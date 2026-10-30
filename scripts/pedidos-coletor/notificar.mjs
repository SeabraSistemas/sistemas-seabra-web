#!/usr/bin/env node
/*
 * Aviso diário no Telegram — chamado pelo coletor ao fim de cada leitura.
 *
 *   node notificar.mjs --configurar   guia: pede o token do bot, descobre o seu chat sozinho, manda um teste
 *   node notificar.mjs --testar       manda uma mensagem de teste
 *
 * O token fica em ~/.seabra-pedidos/telegram.json (permissão 600) e só é usado para falar com
 * api.telegram.org. Sem esse arquivo, o coletor simplesmente não avisa nada.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { grupoDoProduto } from './grupos.mjs';
import { precoDeCompra } from './precos.mjs';
import { reaisParaNumero } from './util.mjs';

const DIR = process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');
const ARQUIVO = join(DIR, 'telegram.json');

/* ── mensagem ───────────────────────────────────────────────────────────── */

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const diaMes = (iso) => `${Number(iso.slice(8, 10))} ${MES[Number(iso.slice(5, 7)) - 1]}`;
const real = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`;

/** "Microchip", "Leitor" e, para o resto, a primeira palavra do título ("Relógio"). */
export function nomeCurto(titulo) {
  const g = grupoDoProduto(titulo ?? '');
  if (g === 'microchip') return 'Microchip';
  if (g === 'leitor') return 'Leitor';
  const w = (titulo ?? '').split(/[\s,]+/)[0] ?? '';
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : 'Pedido';
}

/**
 * Aviso do dia, o mais curto possível (pedido do Felipe, 20/10/2026): pedidos a caminho com unidades e previsão,
 * o preço de UMA unidade com impostos (acima de 3 o imposto sobe) com a leitura de média, e o dólar embaixo.
 * @param snap     snapshot recém-gravado
 * @param novas    mudanças vistas NESTA leitura
 * @param dolar    cotação atual (número) ou null
 */
export function montarMensagem(snap, novas, dolar, agora = new Date()) {
  const linhas = [`📦 Pedidos — ${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}`];
  if (!snap.ok) linhas.push('', `⚠️ A leitura da AliExpress falhou: ${snap.erro}`, 'Mostro o que eu já sabia.');

  for (const p of snap.pedidos.filter((x) => x.alertas.length > 0)) {
    for (const a of p.alertas) linhas.push('', `🚨 ${nomeCurto(p.itens[0]?.titulo)}: ${a.texto}`);
  }

  const aCaminho = snap.pedidos.filter((p) => p.entrega === 'a_caminho' || (p.entrega === 'desconhecido' && p.pagamento === 'pendente'));
  if (aCaminho.length) {
    linhas.push('', 'A caminho:');
    for (const p of aCaminho) {
      // Sem a palavra "chega": no celular ela empurra a data para a linha de baixo.
      const prev = p.previsao ? ` · ${diaMes(p.previsao.de)}–${diaMes(p.previsao.ate)}` : '';
      // Pedido separado no preço bom: o que ele precisa saber é quantos dias ainda tem para pagar.
      const resta = p.prazoPagamento ? Math.max(0, Math.ceil((Date.parse(p.prazoPagamento) - agora.getTime()) / 86_400_000)) : null;
      const pag = p.pagamento !== 'pendente' ? '' : resta == null ? ' · pagar!' : ` · ${resta <= 3 ? '⚠️ ' : ''}pagar em ${resta} dia${resta === 1 ? '' : 's'}`;
      linhas.push(`• ${nomeCurto(p.itens[0]?.titulo)} ${p.itens[0]?.qtd ?? 1} un.${prev}${pag}`);
    }
  }

  // Enquanto não há desembaraço pendente, o resumo repete a decisão sobre o pedido separado (com a cotação de hoje).
  const decidir = pedidosParaDecidir(snap);
  if (decidir.length) {
    linhas.push('', '🟢 Pode comprar · aduana livre');
    for (const p of decidir) linhas.push(...comparar(snap, p, agora));
  }

  const NOME = { microchip: 'Microchip', leitor: 'Leitor' };
  const precos = Object.values(snap.precos ?? {});
  if (precos.length) {
    linhas.push('');
    for (const x of precos) {
      const nome = NOME[x.grupo] ?? x.grupo;
      if (x.erro) {
        linhas.push(`💰 ${nome}: sem preço (${x.erro})`);
        continue;
      }
      if (x.checkout?.total) {
        linhas.push(`💰 ${nome}: ${real(precoDeCompra(x))}`);
        const m = x.medias;
        // Só avisa quando o preço está bom; "caro" e "na média" ficam em silêncio.
        if (m?.veredito === 'bom' && m.vs30 != null) linhas.push(`   ✅ Bom preço · ▼ ${Math.abs(m.vs30 * 100).toFixed(1).replace('.', ',')}% da média`);
      } else {
        linhas.push(`💰 ${nome}: ${real(x.preco)} (sem impostos${x.checkoutErro ? ', checkout falhou' : ''})`);
      }
      for (const a of x.alertas ?? []) linhas.push(`   💡 ${a}`);
    }
  }

  if (dolar) linhas.push('', `💵 Dólar: ${real(dolar)}`);
  if (linhas.length === 1) linhas.push('', 'Nada novo.');
  return linhas.join('\n');
}

/**
 * Aviso em DESTAQUE, mensagem separada: um pedido que esperava o desembaraço aduaneiro acabou de ser liberado.
 * É o sinal de que o Felipe já pode comprar mais, então vem com o preço de hoje do mesmo produto.
 * null se nenhum desembaraço novo.
 */
export function montarAvisoDesembaraco(snap, novas) {
  const liberados = novas.filter((m) => /Desembaraço concluído/.test(m.texto)).map((m) => snap.pedidos.find((p) => p.id === m.pedidoId)).filter(Boolean);
  if (!liberados.length) return null;
  const linhas = ['✅✅✅ DESEMBARAÇO CONCLUÍDO ✅✅✅', ''];
  for (const p of liberados) {
    // Hora do evento no rastreio (a AliExpress costuma publicar horas depois): o Felipe vê o atraso em vez de achar que o aviso falhou.
    const ev = (p.eventos ?? []).find((e) => /Desembaraço aduaneiro concluído|Desembaraço concluído/i.test(e.texto) && e.data);
    const quando = ev ? `Liberado em ${ev.data.slice(8, 10)}/${ev.data.slice(5, 7)} ${ev.data.slice(11, 16)}` : null;
    linhas.push(`${nomeCurto(p.itens[0]?.titulo)} · ${p.itens[0]?.qtd ?? 1} un.`, `Ref. ${p.id}`, ...(quando ? [quando] : []), '');
  }
  const NOME = { microchip: 'Microchip', leitor: 'Leitor' };
  const grupos = new Set(liberados.map((p) => grupoDoProduto(p.itens[0]?.titulo ?? '')));
  for (const x of Object.values(snap.precos ?? {})) {
    if (!grupos.has(x.grupo) || x.erro || !x.checkout?.total) continue;
    linhas.push(`💰 ${NOME[x.grupo] ?? x.grupo} hoje: ${real(precoDeCompra(x))}`);
    if (x.medias?.veredito === 'bom' && x.medias.vs30 != null) linhas.push(`   ✅ Bom preço · ▼ ${Math.abs(x.medias.vs30 * 100).toFixed(1).replace('.', ',')}% da média`);
    else if (x.medias?.veredito === 'caro' && x.medias.vs30 != null) linhas.push(`   ▲ ${Math.abs(x.medias.vs30 * 100).toFixed(1).replace('.', ',')}% acima da média`);
  }
  return linhas.join('\n').trim();
}

/*
 * PEDIDO SEPARADO × PREÇO DE HOJE (pedido do Felipe, 29/10/2026). Ele deixa um pedido "esperando pagamento" no preço bom
 * e só paga depois que TODOS os pedidos já pagos passarem pelo desembaraço no Brasil. Quando isso acontece, compara o
 * que está para pagar com a cotação de hoje: pagar o separado ou cancelar e comprar de novo. Pedido pago que ainda nem
 * foi enviado ("Processando", sem rastreio) também segura: ainda não passou pela aduana.
 */
const DIA = 86_400_000;

/** Pedidos separados para pagar, se nenhum pedido pago está esperando o desembaraço; senão []. */
export function pedidosParaDecidir(snap) {
  const esperando = snap.pedidos.some((p) => p.pagamento === 'ok' && !['entregue', 'cancelado'].includes(p.entrega) && p.aduana !== 'concluida');
  if (esperando) return [];
  return snap.pedidos.filter((p) => p.pagamento === 'pendente' && p.entrega !== 'cancelado');
}

/** Muda quando aparece um "pode comprar" novo: só então sai a mensagem própria (não a cada checagem). */
export const chaveParaDecidir = (snap) => (snap ? pedidosParaDecidir(snap).map((p) => p.id).sort().join(',') : '');

/** Linhas da comparação de um pedido separado com a cotação de hoje do mesmo produto. */
function comparar(snap, p, agora) {
  const it = p.itens[0];
  const qtd = it?.qtd ?? 1;
  const aPagar = reaisParaNumero(p.total);
  const linhas = [`A pagar: ${nomeCurto(it?.titulo)} ${qtd} un.`, `${aPagar ? real(aPagar) : '?'} · Ref. ${p.id}`];
  const x = snap.precos?.[grupoDoProduto(it?.titulo ?? '')];
  const hoje = x && !x.erro && x.checkout?.total ? precoDeCompra(x) * qtd : null;
  if (hoje && aPagar) {
    const dif = aPagar - hoje;
    linhas.push(`Hoje: ${real(hoje)}`);
    if (dif > 1) linhas.push(`👉 Cancele e compre de novo`, `   ${real(dif)} mais barato`);
    else if (dif < -1) linhas.push(`👉 Pague o separado`, `   novo sairia ${real(-dif)} mais caro`);
    else linhas.push(`👉 Mesmo preço: pague o separado`);
  } else linhas.push('Sem cotação de hoje para comparar');
  if (p.prazoPagamento) {
    const resta = Math.max(0, Math.ceil((Date.parse(p.prazoPagamento) - agora.getTime()) / DIA));
    linhas.push(`Prazo: ${resta} dia${resta === 1 ? '' : 's'}`);
  }
  return linhas;
}

/** Mensagem própria "pode comprar", com a decisão de cada pedido separado. null se ainda há desembaraço pendente. */
export function montarAvisoPodeComprar(snap, agora = new Date()) {
  const lista = pedidosParaDecidir(snap);
  if (!lista.length) return null;
  const linhas = ['🟢 PODE COMPRAR', 'Todos os pedidos já passaram na aduana.'];
  for (const p of lista) linhas.push('', ...comparar(snap, p, agora));
  return linhas.join('\n');
}

/**
 * Pedido NOVO na conta (ou pagamento que acabou de ser aprovado): confirma que o coletor viu a compra.
 * null se não houve nada disso.
 */
export function montarAvisoPedidos(snap, novas) {
  const blocos = [];
  for (const m of novas) {
    const p = snap.pedidos.find((x) => x.id === m.pedidoId);
    if (!p) continue;
    const item = p.itens[0];
    const nome = `${nomeCurto(item?.titulo)} · ${item?.qtd ?? 1} un.`;
    if (/^Novo pedido/.test(m.texto)) {
      const resta = p.prazoPagamento ? Math.max(0, Math.ceil((Date.parse(p.prazoPagamento) - Date.now()) / 86_400_000)) : null;
      const estado = p.pagamento === 'pendente' ? (resta == null ? 'aguardando pagamento' : `pagar em ${resta} dias`) : p.pagamento === 'ok' ? 'pagamento aprovado' : 'status ?';
      blocos.push([`🛒 Novo pedido`, `${nome}${p.total ? ` · ${p.total.replace('R$', 'R$ ')}` : ''}`, `${estado} · Ref. ${p.id}`].join('\n'));
    } else if (/Pagamento aprovado/.test(m.texto)) {
      blocos.push([`💳 Pagamento aprovado`, nome, `Ref. ${p.id}`].join('\n'));
    }
  }
  return blocos.length ? blocos.join('\n\n') : null;
}

/** Pedido que deve gerar aviso mesmo que o dia esteja calmo. */
export const temNovidade = (snap, novas) =>
  !snap.ok || novas.length > 0 || snap.pedidos.some((p) => p.alertas.length > 0) || Object.values(snap.precos ?? {}).some((x) => (x.alertas ?? []).length > 0);

/* ── envio ──────────────────────────────────────────────────────────────── */

export function lerConfig() {
  try {
    const c = JSON.parse(readFileSync(ARQUIVO, 'utf8'));
    return c?.token && c?.chatId ? c : null;
  } catch {
    return null;
  }
}

async function telegram(token, metodo, corpo) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo ?? {}),
    signal: AbortSignal.timeout(20_000),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(`Telegram recusou (${metodo}): ${j.description ?? r.status}`);
  return j.result;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const ARQUIVO_FILA = join(DIR, 'telegram-fila.json');

/** Uma tentativa de envio. Lança se o Telegram não aceitou ou se a rede falhou. */
async function enviarUmaVez(texto, config) {
  // O Telegram limita a 4096 caracteres por mensagem.
  await telegram(config.token, 'sendMessage', { chat_id: config.chatId, text: texto.slice(0, 4000), disable_web_page_preview: true });
}

/** Rede instável (logo que o Mac acorda, por exemplo) é o erro comum: tenta de novo antes de desistir. */
export async function enviar(texto, config = lerConfig(), esperas = [3_000, 10_000, 30_000]) {
  if (!config) return false;
  for (let i = 0; ; i++) {
    try {
      await enviarUmaVez(texto, config);
      return true;
    } catch (e) {
      // Recusa do Telegram (token, chat) não melhora tentando de novo; falha de rede sim.
      if (/Telegram recusou/.test(String(e?.message)) || i >= esperas.length) throw e;
      await dormir(esperas[i]);
    }
  }
}

const lerFila = () => {
  try {
    const f = JSON.parse(readFileSync(ARQUIVO_FILA, 'utf8'));
    return Array.isArray(f) ? f : [];
  } catch {
    return [];
  }
};
const gravarFila = (f) => {
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(ARQUIVO_FILA, JSON.stringify(f, null, 2), { mode: 0o600 });
};

/** Envia; se a rede não deixar, guarda na fila para a próxima execução (resumo 7h ou checagem das 2 em 2 horas). */
export async function enviarOuGuardar(texto, config = lerConfig()) {
  if (!config) return false;
  try {
    return await enviar(texto, config);
  } catch (e) {
    gravarFila([...lerFila(), { texto, em: new Date().toISOString() }]);
    throw new Error(`${e.message} — guardei na fila para reenviar`);
  }
}

/** Reenvia o que ficou na fila (descarta o que tem mais de 24 h: aviso velho confunde mais do que ajuda). */
export async function descarregarFila(config = lerConfig(), agora = Date.now()) {
  if (!config) return 0;
  const fila = lerFila().filter((m) => agora - Date.parse(m.em) < 24 * 3_600_000);
  const restante = [];
  let enviadas = 0;
  for (const m of fila) {
    try {
      await enviar(`${m.texto}\n\n(atrasada: ${new Date(m.em).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })})`, config, [3_000]);
      enviadas++;
    } catch {
      restante.push(m);
    }
  }
  gravarFila(restante);
  return enviadas;
}

/** Cotação do dólar para o aviso; falha silenciosa (o aviso sai sem ela). */
export async function dolarAtual() {
  try {
    const r = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { signal: AbortSignal.timeout(10_000) });
    const v = Number((await r.json())?.USDBRL?.bid);
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

/* ── configuração guiada ────────────────────────────────────────────────── */

function perguntar(texto, { oculto = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (oculto) {
    rl._writeToOutput = (s) => {
      if (s.includes(texto)) process.stdout.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(texto, (r) => {
      if (oculto) process.stdout.write('\n');
      rl.close();
      resolve(r.trim());
    }),
  );
}

/** Texto que chegou por pipe (ex.: `pbpaste | node notificar.mjs --configurar --stdin`). */
async function lerStdin() {
  const partes = [];
  for await (const p of process.stdin) partes.push(p);
  return Buffer.concat(partes).toString('utf8').trim();
}

async function configurar({ stdin = false } = {}) {
  let token;
  if (stdin) {
    token = await lerStdin();
  } else {
    console.log('1) No Telegram, abra @BotFather, mande /newbot, escolha um nome e copie o token que ele devolver.');
    token = await perguntar('2) Cole o token aqui (não aparece na tela): ', { oculto: true });
  }
  // Nunca ecoa o que veio: se não for um token, o que estava no clipboard pode ser outra coisa.
  if (!/^\d+:[\w-]{30,}$/.test(token)) throw new Error('O que foi copiado não parece um token do BotFather (formato 123456789:AAH…). Copie a linha do token de novo.');
  const eu = await telegram(token, 'getMe');
  console.log(`3) Abra a conversa com @${eu.username} no Telegram e mande qualquer mensagem (por exemplo "oi"). Esperando…`);
  let chatId = null;
  for (let i = 0; i < 60 && !chatId; i++) {
    const ups = await telegram(token, 'getUpdates', { timeout: 0 });
    const msg = [...ups].reverse().find((u) => u.message?.chat?.type === 'private');
    chatId = msg?.message?.chat?.id ?? null;
    if (!chatId) await new Promise((r) => setTimeout(r, 2000));
  }
  if (!chatId) throw new Error('Não chegou nenhuma mensagem em 2 minutos. Rode de novo depois de mandar "oi" ao bot.');
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(ARQUIVO, JSON.stringify({ token, chatId }, null, 2), { mode: 0o600 });
  chmodSync(ARQUIVO, 0o600);
  await enviar('✅ Pronto: vou avisar aqui sobre os seus pedidos da AliExpress.');
  console.log('Configurado. Mandei uma mensagem de confirmação para você.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const arg = process.argv[2];
    if (arg === '--configurar') await configurar({ stdin: process.argv.includes('--stdin') });
    else if (arg === '--testar') {
      if (!existsSync(ARQUIVO)) throw new Error('Ainda não configurado: rode "node notificar.mjs --configurar".');
      await enviar('🔔 Teste do aviso de pedidos.');
      console.log('Enviado.');
    } else console.log('Use --configurar ou --testar.');
  } catch (e) {
    console.error(`Erro: ${e.message}`);
    process.exitCode = 1;
  }
}
