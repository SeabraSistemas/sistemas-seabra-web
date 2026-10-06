#!/usr/bin/env node
/*
 * Coletor do painel /tokens.
 *
 * Lê os logs que o Claude Code já grava no disco (~/.claude/projects/**.jsonl),
 * soma os tokens em baldes de 1 hora (últimos 8 dias) e manda para
 * /api/tokens. NÃO chama o Claude nem nenhuma IA: é leitura de arquivo + um
 * POST, então não gasta nada da cota de sessão nem da semanal.
 *
 *   node scripts/tokens-coletor.mjs            manda uma vez
 *   node scripts/tokens-coletor.mjs --loop     manda a cada 60 s, até fechar
 *   node scripts/tokens-coletor.mjs --dry      só mostra o resumo, não manda
 *
 * Configuração (variável de ambiente ou ~/.seabra-tokens.json):
 *   TOKENS_COLETOR_SECRET   o mesmo segredo configurado no site (obrigatório p/ enviar)
 *   TOKENS_URL              padrão https://www.sistemaseabra.com.br/api/tokens
 *   TOKENS_MAQUINA          nome desta máquina no painel (padrão: hostname)
 *   CLAUDE_CONFIG_DIR       pasta do Claude, se não for ~/.claude
 *
 * Sem dependências: só Node 18+.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir, hostname } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const HORA_MS = 3_600_000;
const JANELA_MS = 8 * 24 * HORA_MS;
const INTERVALO_MS = 60_000;

/* ── leitura dos logs ─────────────────────────────────────────────────────── */

/** Pastas `projects` do Claude Code que existirem nesta máquina. */
export function pastasDeLogs(env = process.env) {
  const raizes = env.CLAUDE_CONFIG_DIR
    ? env.CLAUDE_CONFIG_DIR.split(',').map((s) => s.trim()).filter(Boolean)
    : [join(homedir(), '.claude'), join(homedir(), '.config', 'claude')];
  return raizes.map((r) => join(r, 'projects')).filter((p) => existsSync(p));
}

function* arquivosJsonl(pasta, desde) {
  let itens;
  try {
    itens = readdirSync(pasta, { withFileTypes: true });
  } catch {
    return;
  }
  for (const it of itens) {
    const caminho = join(pasta, it.name);
    if (it.isDirectory()) yield* arquivosJsonl(caminho, desde);
    else if (it.name.endsWith('.jsonl')) {
      try {
        const st = statSync(caminho);
        if (st.mtimeMs >= desde) yield { caminho, assinatura: `${st.mtimeMs}:${st.size}` };
      } catch {
        // Arquivo sumiu entre o readdir e o stat.
      }
    }
  }
}

/** Entradas de uso de um texto .jsonl: uma por resposta do assistente. */
export function entradasDoTexto(texto) {
  const saida = [];
  for (const linha of texto.split('\n')) {
    if (!linha.includes('"usage"')) continue; // barato: pula o grosso sem fazer parse
    let o;
    try {
      o = JSON.parse(linha);
    } catch {
      continue; // última linha ainda sendo escrita
    }
    const u = o?.message?.usage;
    if (o?.type !== 'assistant' || !u || typeof o.timestamp !== 'string') continue;
    const ms = Date.parse(o.timestamp);
    if (!Number.isFinite(ms)) continue;
    const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
    // Uma resposta aparece várias vezes (streaming) e em logs de sessões retomadas: a chave junta tudo.
    const chave = o.message.id ? `${o.message.id}:${o.requestId ?? ''}` : `u:${o.uuid ?? linha.length + ':' + ms}`;
    saida.push({
      chave,
      h: Math.floor(ms / HORA_MS) * HORA_MS,
      t: num(u.input_tokens) + num(u.output_tokens) + num(u.cache_creation_input_tokens),
      c: num(u.cache_read_input_tokens),
    });
  }
  return saida;
}

/** Junta entradas de vários arquivos em baldes de hora. Mesma resposta repetida: vale a maior. */
export function agregar(entradas, agora = Date.now()) {
  const corte = Math.floor((agora - JANELA_MS) / HORA_MS) * HORA_MS;
  const porChave = new Map();
  for (const e of entradas) {
    if (e.h < corte) continue;
    const antiga = porChave.get(e.chave);
    if (!antiga || e.t + e.c > antiga.t + antiga.c) porChave.set(e.chave, e);
  }
  const baldes = new Map();
  for (const e of porChave.values()) {
    const b = baldes.get(e.h) ?? { h: e.h, t: 0, c: 0 };
    b.t += e.t;
    b.c += e.c;
    baldes.set(e.h, b);
  }
  return [...baldes.values()].sort((a, b) => a.h - b.h);
}

// Só relê o arquivo que mudou desde a última passada (modo --loop).
const cache = new Map();

export function coletar(pastas, agora = Date.now()) {
  const entradas = [];
  const vistos = new Set();
  for (const pasta of pastas) {
    for (const { caminho, assinatura } of arquivosJsonl(pasta, agora - JANELA_MS)) {
      vistos.add(caminho);
      let item = cache.get(caminho);
      if (item?.assinatura !== assinatura) {
        try {
          item = { assinatura, entradas: entradasDoTexto(readFileSync(caminho, 'utf8')) };
        } catch {
          continue;
        }
        cache.set(caminho, item);
      }
      for (const e of item.entradas) entradas.push(e);
    }
  }
  for (const caminho of cache.keys()) if (!vistos.has(caminho)) cache.delete(caminho);
  return agregar(entradas, agora);
}

/* ── envio ────────────────────────────────────────────────────────────────── */

function configuracao() {
  let arquivo = {};
  try {
    arquivo = JSON.parse(readFileSync(join(homedir(), '.seabra-tokens.json'), 'utf8'));
  } catch {
    // Sem arquivo: só variáveis de ambiente.
  }
  const e = process.env;
  return {
    url: e.TOKENS_URL || arquivo.url || 'https://www.sistemaseabra.com.br/api/tokens',
    segredo: e.TOKENS_COLETOR_SECRET || arquivo.secret || '',
    maquina: e.TOKENS_MAQUINA || arquivo.maquina || hostname(),
  };
}

async function enviar(cfg, horas) {
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.segredo}` },
    body: JSON.stringify({ maquina: cfg.maquina, horas }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

const hora = () => new Date().toLocaleTimeString('pt-BR');
const fmt = new Intl.NumberFormat('pt-BR');

async function passada(cfg, seco) {
  const pastas = pastasDeLogs();
  if (pastas.length === 0) return console.error(`${hora()} · não achei a pasta de logs do Claude Code (~/.claude/projects).`);
  const horas = coletar(pastas);
  const total = horas.reduce((s, b) => s + b.t, 0);
  if (seco) {
    console.log(`${pastas.join(', ')}\n${horas.length} baldes de 1h · ${fmt.format(total)} tokens (sem cache lido) nos últimos 8 dias`);
    for (const b of horas.slice(-6)) console.log(`  ${new Date(b.h).toLocaleString('pt-BR')}  ${fmt.format(b.t)}`);
    return;
  }
  try {
    await enviar(cfg, horas);
    console.log(`${hora()} · enviado: ${horas.length} baldes, ${fmt.format(total)} tokens`);
  } catch (e) {
    console.error(`${hora()} · falhou ao enviar (${e instanceof Error ? e.message : e}); tento de novo na próxima.`);
  }
}

async function principal() {
  const args = new Set(process.argv.slice(2));
  const seco = args.has('--dry');
  const cfg = configuracao();
  if (!seco && !cfg.segredo) {
    console.error('Falta o segredo. Defina TOKENS_COLETOR_SECRET (ou "secret" em ~/.seabra-tokens.json).');
    process.exit(1);
  }
  await passada(cfg, seco);
  if (args.has('--loop') && !seco) {
    console.log(`Rodando a cada ${INTERVALO_MS / 1000}s como "${cfg.maquina}". Ctrl+C para parar.`);
    setInterval(() => void passada(cfg, false), INTERVALO_MS);
  }
}

// Só roda quando chamado direto — importar para teste não dispara nada.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await principal();
