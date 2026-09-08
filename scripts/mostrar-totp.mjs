#!/usr/bin/env node
/**
 * Mostra de novo o QR/segredo do TOTP que já está em .env.local — para quando
 * o autenticador ficou com uma entrada de uma geração de credenciais anterior
 * e precisa ser reconfigurado com o segredo que está VALENDO agora.
 *
 *   node scripts/mostrar-totp.mjs
 *
 * Não gera nada novo, não grava nada: só lê ADM_TOTP_SECRET do .env.local e
 * imprime na tela, igual gerar-credenciais-adm.mjs fazia na hora em que o
 * segredo foi criado.
 */

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodificarBase32(entrada) {
  const limpo = entrada.replace(/[\s-]/g, '').replace(/=+$/, '').toUpperCase();
  const bytes = [];
  let acumulador = 0;
  let bits = 0;
  for (const c of limpo) {
    const v = ALFABETO_BASE32.indexOf(c);
    if (v < 0) return null;
    acumulador = (acumulador << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acumulador >> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function contador(passo) {
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(passo / 2 ** 32), 0);
  buffer.writeUInt32BE(passo >>> 0, 4);
  return buffer;
}

function gerarCodigo(segredo, passo) {
  const mac = createHmac('sha1', segredo).update(contador(passo)).digest();
  const deslocamento = mac[mac.length - 1] & 0x0f;
  const binario =
    ((mac[deslocamento] & 0x7f) << 24) |
    (mac[deslocamento + 1] << 16) |
    (mac[deslocamento + 2] << 8) |
    mac[deslocamento + 3];
  return String(binario % 10 ** 6).padStart(6, '0');
}

let conteudo;
try {
  conteudo = readFileSync('.env.local', 'utf8');
} catch {
  console.error('Não achei .env.local nesta pasta. Rode a partir da raiz do projeto.');
  process.exit(1);
}

const linhaUsuario = conteudo.split('\n').find((l) => l.startsWith('ADM_USUARIO='));
const linhaSegredo = conteudo.split('\n').find((l) => l.startsWith('ADM_TOTP_SECRET='));

if (!linhaSegredo) {
  console.error('ADM_TOTP_SECRET não está preenchido em .env.local.');
  process.exit(1);
}

const usuario = linhaUsuario ? linhaUsuario.slice('ADM_USUARIO='.length).trim() : 'felipe';
const segredoBase32 = linhaSegredo.slice('ADM_TOTP_SECRET='.length).trim();
const segredo = decodificarBase32(segredoBase32);

if (!segredo || segredo.length === 0) {
  console.error('ADM_TOTP_SECRET não decodifica como base32 válido.');
  process.exit(1);
}

const emissor = 'Sistema Seabra';
const uriOtpauth =
  `otpauth://totp/${encodeURIComponent(`${emissor} ADM`)}:${encodeURIComponent(usuario)}` +
  `?secret=${segredoBase32}&issuer=${encodeURIComponent(emissor)}&algorithm=SHA1&digits=6&period=30`;

const agora = Date.now();
const passoAtual = Math.floor(agora / 1000 / 30);
const restante = 30 - (Math.floor(agora / 1000) % 30);

console.log('');
console.log('════════ APAGUE a entrada antiga "Sistema Seabra ADM" no seu autenticador ANTES de escanear ════════');
console.log('');
console.log(uriOtpauth);
console.log('');
console.log(`Ou digite o segredo à mão: ${segredoBase32}`);
console.log('');
console.log(`Código deste instante (expira em ${restante}s): ${gerarCodigo(segredo, passoAtual)}`);
console.log('Depois de escanear, o app tem que mostrar ESTE código (ou o próximo, se a janela virar).');
console.log('');
