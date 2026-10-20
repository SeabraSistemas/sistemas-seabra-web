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

  // Desembaraço concluído novo = hora de olhar o preço para repor.
  const liberados = novas.filter((m) => /Desembaraço concluído/.test(m.texto)).map((m) => nomeCurto(snap.pedidos.find((p) => p.id === m.pedidoId)?.itens[0]?.titulo));
  if (liberados.length) linhas.push('', `✅ Desembaraço concluído: ${[...new Set(liberados)].join(', ')}`);

  const aCaminho = snap.pedidos.filter((p) => p.entrega === 'a_caminho' || (p.entrega === 'desconhecido' && p.pagamento === 'pendente'));
  if (aCaminho.length) {
    linhas.push('', 'A caminho:');
    for (const p of aCaminho) {
      // Sem a palavra "chega": no celular ela empurra a data para a linha de baixo.
      const prev = p.previsao ? ` · ${diaMes(p.previsao.de)}–${diaMes(p.previsao.ate)}` : '';
      const pag = p.pagamento === 'pendente' ? ' · pagar!' : '';
      linhas.push(`• ${nomeCurto(p.itens[0]?.titulo)} ${p.itens[0]?.qtd ?? 1} un.${prev}${pag}`);
    }
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

export async function enviar(texto, config = lerConfig()) {
  if (!config) return false;
  // O Telegram limita a 4096 caracteres por mensagem.
  await telegram(config.token, 'sendMessage', { chat_id: config.chatId, text: texto.slice(0, 4000), disable_web_page_preview: true });
  return true;
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
