#!/usr/bin/env node
/*
 * Envio do resultado do coletor para o site (sistemaseabra.com.br/pedidos).
 *
 *   node nuvem.mjs --testar              manda o snapshot e o histórico que já estão no Mac
 *   node nuvem.mjs --semear arquivo.json  manda um ESTOQUE INICIAL (só vale se o site ainda não tem estoque)
 *   node nuvem.mjs --historico arquivo.json  manda OPERAÇÕES ANTIGAS (lista; entram por id, sem apagar nada)
 *
 * Configuração em ~/.seabra-pedidos/nuvem.json (permissão 600): { "url": ".../pedidos/api/ingest", "segredo": "…" }.
 * O segredo é o mesmo PEDIDOS_COLETOR_SECRET cadastrado na Vercel. Sem esse arquivo o coletor não envia
 * nada (o painel funciona só no Mac). O que sobe é o que já estava no painel: pedidos, previsão, preços
 * e códigos de rastreio — nunca endereço, telefone ou dados de pagamento.
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DIR = process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');
const lerJson = (arq) => {
  try {
    return JSON.parse(readFileSync(join(DIR, arq), 'utf8'));
  } catch {
    return null;
  }
};

export function lerNuvem() {
  const c = lerJson('nuvem.json');
  return c?.url && c?.segredo ? c : null;
}

/** Manda para o site. Devolve { ok, gravados } ou lança com o motivo. */
export async function enviarParaNuvem(corpo, config = lerNuvem()) {
  if (!config) return null;
  const r = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.segredo}` },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(30_000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`o site recusou o envio (${r.status}${j.erro ? `: ${j.erro}` : ''})`);
  return j;
}

/** Snapshot + histórico de preços que estão no Mac. */
export const dadosLocais = () => ({ snapshot: lerJson('pedidos.json'), precos: lerJson('precos.json') ?? [] });

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const [cmd, arq] = process.argv.slice(2);
    if (!lerNuvem()) throw new Error('Falta ~/.seabra-pedidos/nuvem.json ({ "url": "...", "segredo": "..." }).');
    if (cmd === '--testar') {
      const d = dadosLocais();
      if (!d.snapshot) throw new Error('Ainda não há leitura no Mac (rode o coletor).');
      console.log(JSON.stringify(await enviarParaNuvem(d)));
    } else if (cmd === '--semear') {
      const estado = lerJson(arq?.replace(`${DIR}/`, '') ?? '');
      if (!estado) throw new Error(`Arquivo não encontrado em ${DIR}: ${arq}`);
      console.log(JSON.stringify(await enviarParaNuvem({ estadoInicial: estado })));
    } else if (cmd === '--historico') {
      const lista = lerJson(arq ?? '');
      if (!Array.isArray(lista)) throw new Error(`Arquivo não encontrado (ou não é uma lista) em ${DIR}: ${arq}`);
      console.log(JSON.stringify(await enviarParaNuvem({ historicoManual: lista })));
    } else console.log('Use --testar, --semear arquivo.json ou --historico arquivo.json');
  } catch (e) {
    console.error(`Erro: ${e.message}`);
    process.exitCode = 1;
  }
}
