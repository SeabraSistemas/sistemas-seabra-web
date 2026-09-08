#!/usr/bin/env node
/**
 * Testa se uma senha bate com o ADM_PASSWORD_HASH que está em .env.local —
 * sem imprimir a senha, o hash, nem gravar nada em lugar nenhum. Só diz
 * "confere" ou "não confere".
 *
 *   node scripts/testar-senha.mjs
 *
 * Existe porque gerar credenciais várias vezes (comum ao configurar o /adm
 * pela primeira vez) deixa mais de uma senha "candidata" na cabeça de quem
 * configurou — e "credenciais inválidas" sozinho não diz qual fator falhou.
 * Mesmos parâmetros scrypt de src/lib/adm/password.ts.
 */

import { scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const MAXMEM = 64 * 1024 * 1024;
const CTRL_C = '';
const CTRL_D = '';
const BACKSPACE = '';

function decomporHash(hash) {
  const partes = hash.trim().split('$');
  if (partes.length !== 6 || partes[0] !== 'scrypt') return null;
  const N = Number(partes[1]);
  const r = Number(partes[2]);
  const p = Number(partes[3]);
  if (!Number.isInteger(N) || N < 2 || (N & (N - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r < 1 || !Number.isInteger(p) || p < 1) return null;
  if (128 * N * r > MAXMEM) return null;
  try {
    const salt = Buffer.from(partes[4], 'base64');
    const dk = Buffer.from(partes[5], 'base64');
    if (salt.length === 0 || dk.length < 16) return null;
    return { N, r, p, salt, dk };
  } catch {
    return null;
  }
}

function verificarSenha(senha, decomposto) {
  const calculado = scryptSync(senha.normalize('NFKC'), decomposto.salt, decomposto.dk.length, {
    N: decomposto.N,
    r: decomposto.r,
    p: decomposto.p,
    maxmem: MAXMEM,
  });
  return calculado.length === decomposto.dk.length && timingSafeEqual(calculado, decomposto.dk);
}

function lerSenhaOculta(rotulo) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(rotulo);
    if (!stdin.isTTY) {
      // Entrada via pipe: lê uma linha, sem eco especial (já não tem terminal para ocultar).
      const rl = createInterface({ input: stdin });
      rl.once('line', (linha) => {
        rl.close();
        resolve(linha);
      });
      return;
    }
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

let conteudo;
try {
  conteudo = readFileSync('.env.local', 'utf8');
} catch {
  console.error('Não achei .env.local nesta pasta. Rode a partir da raiz do projeto.');
  process.exit(1);
}

const linha = conteudo.split('\n').find((l) => l.startsWith('ADM_PASSWORD_HASH='));
if (!linha) {
  console.error('ADM_PASSWORD_HASH não está preenchido em .env.local.');
  process.exit(1);
}

// O arquivo guarda o hash com '$' escapado ('\$') — necessário para o Next.js
// não interpretar "$32768" como referência a outra variável de ambiente (ver
// o comentário de CHAVES_COM_CIFRAO_LITERAL em preencher-env-adm.mjs). O
// Next.js desfaz esse escape sozinho ao carregar; lendo o arquivo direto como
// este script faz, é preciso desfazer à mão — senão todo hash "não confere"
// aqui mesmo com a senha certa, porque a barra invertida sobra dentro do '$'.
const hashBruto = linha.slice('ADM_PASSWORD_HASH='.length).replace(/\\\$/g, '$');
const decomposto = decomporHash(hashBruto);
if (!decomposto) {
  console.error('ADM_PASSWORD_HASH em .env.local não decompõe como hash scrypt válido.');
  process.exit(1);
}

const senha = await lerSenhaOculta('Senha para testar (não aparece na tela): ');
const confere = verificarSenha(senha, decomposto);

console.log('');
console.log(confere ? '✓ SENHA CONFERE com o que está em .env.local.' : '✗ SENHA NÃO CONFERE com .env.local.');
