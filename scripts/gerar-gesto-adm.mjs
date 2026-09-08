#!/usr/bin/env node
/**
 * Gera o ADM_GESTO_HASH — o login do /adm por padrão de gesto (grade 3x3),
 * substituindo usuário+senha+TOTP.
 *
 *   node scripts/gerar-gesto-adm.mjs
 *
 * Node puro, zero dependência — mesma disciplina de gerar-credenciais-adm.mjs:
 * - o gesto entra por STDIN, sem eco, nunca por argv;
 * - nada é escrito em disco — o que sai é na tela, uma vez;
 * - os parâmetros do scrypt são IDÊNTICOS aos de src/lib/adm/password.ts, e o
 *   gesto passa pelo MESMO normalize('NFKC') — é tratado exatamente como uma
 *   senha depois de normalizado para dígitos.
 *
 * GRADE NUMERADA COMO TECLADO NUMÉRICO:
 *   7 8 9
 *   4 5 6
 *   1 2 3
 * "Desenhar" o padrão na hora de configurar é digitar, em ordem, os números
 * dos pontos por onde o traço passaria — mínimo 4, nenhum repetido.
 */

import { randomBytes, scryptSync } from 'node:crypto';

const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;
const MINIMO_PONTOS = 4;

const CTRL_C = '';
const CTRL_D = '';
const BACKSPACE = '';

function gerarHash(valor) {
  const salt = randomBytes(16);
  const dk = scryptSync(valor.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ['scrypt', N, R, P, salt.toString('base64'), dk.toString('base64')].join('$');
}

function conferirHash(valor, hash) {
  const [prefixo, , , , saltB64, dkB64] = hash.split('$');
  if (prefixo !== 'scrypt') return false;
  const salt = Buffer.from(saltB64, 'base64');
  const dk = Buffer.from(dkB64, 'base64');
  const calculada = scryptSync(valor.normalize('NFKC'), salt, dk.length, { N, r: R, p: P, maxmem: MAXMEM });
  return calculada.length === dk.length && Buffer.compare(calculada, dk) === 0;
}

/** Mesma regra de src/lib/adm/gesto.ts — as duas NÃO PODEM divergir. */
function normalizarGesto(bruto) {
  const limpo = (bruto ?? '').replace(/[^1-9]/g, '');
  if (limpo.length < MINIMO_PONTOS) return null;
  const vistos = new Set();
  for (const c of limpo) {
    if (vistos.has(c)) return null;
    vistos.add(c);
  }
  return limpo;
}

function lerTudoStdin() {
  return new Promise((resolve, reject) => {
    let dados = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (pedaco) => { dados += pedaco; });
    process.stdin.on('end', () => resolve(dados));
    process.stdin.on('error', reject);
  });
}

function lerGestoOculto(rotulo) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(rotulo);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let buffer = '';
    const aoDigitar = (pedaco) => {
      for (const caractere of pedaco) {
        if (caractere === '\r' || caractere === '\n' || caractere === CTRL_D) {
          stdin.removeListener('data', aoDigitar);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(buffer);
          return;
        }
        if (caractere === CTRL_C) {
          stdin.setRawMode(false);
          process.stdout.write('\n');
          process.exit(130);
        }
        if (caractere === BACKSPACE || caractere === '\b') {
          buffer = buffer.slice(0, -1);
          continue;
        }
        if (caractere < ' ') continue;
        buffer += caractere;
      }
    };
    stdin.on('data', aoDigitar);
  });
}

async function obterGesto() {
  if (!process.stdin.isTTY) {
    const tudo = await lerTudoStdin();
    return tudo.split(/\r?\n/)[0] ?? '';
  }
  const primeiro = await lerGestoOculto('Padrão (números da grade, em ordem, sem espaço): ');
  const segundo = await lerGestoOculto('Repita o padrão: ');
  if (primeiro !== segundo) {
    console.error('\nOs dois padrões não bateram. Nada foi gerado.');
    process.exit(1);
  }
  return primeiro;
}

console.log('');
console.log('Gesto do /adm — Sistema Seabra');
console.log('Nada é gravado em disco. Copie desta tela para .env.local e feche o terminal.');
console.log('');
console.log('Grade (teclado numérico):');
console.log('  7 8 9');
console.log('  4 5 6');
console.log('  1 2 3');
console.log('');

const bruto = await obterGesto();
const normalizado = normalizarGesto(bruto);

if (!normalizado) {
  console.error(`\nPadrão inválido: mínimo ${MINIMO_PONTOS} pontos, cada um só uma vez. Nada foi gerado.`);
  process.exit(1);
}

process.stdout.write('Derivando o hash (scrypt, ~100 ms)... ');
const hash = gerarHash(normalizado);
console.log('ok');

if (!conferirHash(normalizado, hash)) {
  console.error('\nRound-trip falhou: o hash gerado não confere com o padrão digitado.');
  console.error('Não cole nada em .env.local — isso é bug do script, não erro de digitação.');
  process.exit(1);
}

console.log('');
console.log('════════ Cole em .env.local (e na Vercel, Production, Sensitive) ════════');
console.log('');
console.log(`ADM_GESTO_HASH=${hash}`);
console.log('');
console.log('════════ Depois de colar ════════');
console.log('· ADM_USUARIO, ADM_PASSWORD_HASH, ADM_DUMMY_HASH e ADM_TOTP_SECRET podem ficar');
console.log('  comentados — o login por gesto não usa nenhum dos quatro.');
console.log('· Redeploy: variável de ambiente nova só vale no próximo deploy.');
console.log('· Teste o login e, na sequência, erre o padrão 6 vezes: tem que travar.');
console.log('');
