#!/usr/bin/env node
/**
 * Gera TODAS as credenciais do /adm de uma vez, prontas para colar na Vercel.
 *
 *   node scripts/gerar-credenciais-adm.mjs
 *   node scripts/gerar-credenciais-adm.mjs --usuario=felipe
 *
 * Node puro, zero dependência — roda sem `npm install` e sem rede.
 *
 * REGRAS QUE ESTE SCRIPT SEGUE (e o motivo de cada uma):
 * - A senha entra por STDIN, sem eco. Nunca por argv: argumento de linha de
 *   comando vai para o histórico do shell, aparece em `ps` e vaza para qualquer
 *   processo do mesmo usuário.
 * - Nada é escrito em disco. O que sai é na tela, uma vez. Perdeu, roda de novo.
 * - Os parâmetros do scrypt são IDÊNTICOS aos de src/lib/adm/password.ts
 *   (N=32768, r=8, p=1, keylen=64, maxmem=64MB) e a senha passa pelo mesmo
 *   normalize('NFKC') — divergir aqui produz um hash que nunca confere no login.
 * - Ao final, faz o round-trip (verifica o hash gerado contra a senha digitada)
 *   e imprime o código TOTP do momento, para conferir com o autenticador ANTES
 *   de mexer na Vercel.
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const QTD_CODIGOS_RECUPERACAO = 5;
const TAMANHO_MINIMO_SENHA = 12;

// Teclas que o modo raw entrega como caractere de controle.
const CTRL_C = '\u0003';
const CTRL_D = '\u0004';
const BACKSPACE = '\u007f';

// ── utilidades ───────────────────────────────────────────────────────────────

function gerarHash(senha) {
  const salt = randomBytes(16);
  const dk = scryptSync(senha.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ['scrypt', N, R, P, salt.toString('base64'), dk.toString('base64')].join('$');
}

function conferirHash(senha, hash) {
  const [prefixo, n, r, p, saltB64, dkB64] = hash.split('$');
  if (prefixo !== 'scrypt') return false;
  const salt = Buffer.from(saltB64, 'base64');
  const dk = Buffer.from(dkB64, 'base64');
  const calculada = scryptSync(senha.normalize('NFKC'), salt, dk.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
  });
  return calculada.length === dk.length && timingSafeEqual(calculada, dk);
}

/** Base32 RFC 4648 sem padding — o formato que os apps autenticadores leem. */
function paraBase32(buffer) {
  let bits = 0;
  let acumulador = 0;
  let saida = '';
  for (const byte of buffer) {
    acumulador = (acumulador << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      saida += ALFABETO_BASE32[(acumulador >> bits) & 31];
    }
  }
  if (bits > 0) saida += ALFABETO_BASE32[(acumulador << (5 - bits)) & 31];
  return saida;
}

function deBase32(texto) {
  let bits = 0;
  let acumulador = 0;
  const bytes = [];
  for (const caractere of texto.toUpperCase()) {
    const valor = ALFABETO_BASE32.indexOf(caractere);
    if (valor < 0) continue;
    acumulador = (acumulador << 5) | valor;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acumulador >> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

/** Mesmo algoritmo de src/lib/adm/totp.ts — só para conferência na tela. */
function codigoTotp(segredoBase32, agoraMs = Date.now()) {
  const segredo = deBase32(segredoBase32);
  const passo = Math.floor(agoraMs / 1000 / 30);
  const contador = Buffer.alloc(8);
  contador.writeUInt32BE(Math.floor(passo / 2 ** 32), 0);
  contador.writeUInt32BE(passo >>> 0, 4);
  const mac = createHmac('sha1', segredo).update(contador).digest();
  const deslocamento = mac[mac.length - 1] & 0x0f;
  const binario =
    ((mac[deslocamento] & 0x7f) << 24) |
    (mac[deslocamento + 1] << 16) |
    (mac[deslocamento + 2] << 8) |
    mac[deslocamento + 3];
  return String(binario % 1e6).padStart(6, '0');
}

/**
 * Sorteio uniforme sobre o alfabeto base32: 32 é potência de 2, então a máscara
 * `& 31` não enviesa (um `% 26` sobre um alfabeto de 26 enviesaria).
 * O código é hasheado JÁ NORMALIZADO (sem hífen, maiúsculo) porque é assim que
 * verificarCodigoRecuperacao() de password.ts normaliza o que o Felipe digitar.
 */
function codigoRecuperacao() {
  const bytes = randomBytes(10);
  let bruto = '';
  for (const byte of bytes) bruto += ALFABETO_BASE32[byte & 31];
  return { exibicao: `${bruto.slice(0, 5)}-${bruto.slice(5)}`, normalizado: bruto };
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

function lerSenhaOculta(rotulo) {
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
        // Ignora o resto dos controles (setas chegam como sequência de escape).
        if (caractere < ' ') continue;
        buffer += caractere;
      }
    };
    stdin.on('data', aoDigitar);
  });
}

async function obterSenha() {
  // Sem TTY (senha vinda de pipe) não dá para pedir confirmação: lê a primeira
  // linha e segue. Modo pensado para automação, não para o uso do dia a dia.
  if (!process.stdin.isTTY) {
    const tudo = await lerTudoStdin();
    return tudo.split(/\r?\n/)[0] ?? '';
  }
  const primeira = await lerSenhaOculta('Senha do /adm (não aparece na tela): ');
  const segunda = await lerSenhaOculta('Repita a senha: ');
  if (primeira !== segunda) {
    console.error('\nAs duas senhas não bateram. Nada foi gerado.');
    process.exit(1);
  }
  return primeira;
}

function argumento(nome, padrao) {
  const prefixo = `--${nome}=`;
  const achado = process.argv.find((a) => a.startsWith(prefixo));
  return achado ? achado.slice(prefixo.length) : padrao;
}

// ── execução ─────────────────────────────────────────────────────────────────

const usuario = argumento('usuario', 'felipe');
const emissor = argumento('emissor', 'Sistema Seabra');

console.log('');
console.log('Credenciais do /adm — Sistema Seabra');
console.log('Nada é gravado em disco. Copie desta tela para a Vercel e feche o terminal.');
console.log('');

const senha = await obterSenha();

if (senha.length < TAMANHO_MINIMO_SENHA) {
  console.error(`\nSenha muito curta (mínimo ${TAMANHO_MINIMO_SENHA} caracteres). Nada foi gerado.`);
  console.error('Esta senha protege a base inteira: contatos, CPFs e o rebanho de 31 propriedades.');
  process.exit(1);
}

process.stdout.write('Derivando os hashes (scrypt, ~100 ms cada)... ');

const hashSenha = gerarHash(senha);

// O dummy é o hash de uma senha aleatória que ninguém jamais saberá. Serve só
// para o login gastar o tempo do KDF quando o USUÁRIO está errado — sem ele, a
// resposta rápida denuncia "este login não existe".
const hashDummy = gerarHash(randomBytes(32).toString('base64'));

const segredoTotp = paraBase32(randomBytes(20));
const segredoSessao = randomBytes(32).toString('hex');

const codigos = Array.from({ length: QTD_CODIGOS_RECUPERACAO }, codigoRecuperacao);
const hashesRecuperacao = codigos.map((c) => gerarHash(c.normalizado));

console.log('ok');

if (!conferirHash(senha, hashSenha)) {
  console.error('\nRound-trip falhou: o hash gerado não confere com a senha digitada.');
  console.error('Não cole nada na Vercel — isso é bug do script, não erro de digitação.');
  process.exit(1);
}

const uriOtpauth =
  `otpauth://totp/${encodeURIComponent(`${emissor} ADM`)}:${encodeURIComponent(usuario)}` +
  `?secret=${segredoTotp}&issuer=${encodeURIComponent(emissor)}&algorithm=SHA1&digits=6&period=30`;

console.log('');
console.log('════════ 1. VARIÁVEIS DA VERCEL ════════');
console.log('Environment: Production · marque todas como Sensitive · NENHUMA com prefixo NEXT_PUBLIC_');
console.log('');
console.log(`ADM_USUARIO=${usuario}`);
console.log(`ADM_PASSWORD_HASH=${hashSenha}`);
console.log(`ADM_DUMMY_HASH=${hashDummy}`);
console.log(`ADM_TOTP_SECRET=${segredoTotp}`);
console.log(`ADM_SESSION_SECRET=${segredoSessao}`);
console.log(`ADM_RECOVERY_HASHES=${hashesRecuperacao.join(',')}`);
console.log('');
console.log('Opcionais:');
console.log('ADM_SESSION_VERSION=1        # incrementar derruba todas as sessões vivas');
console.log('ADM_ALLOWED_UUIDS=           # segunda tranca; vazia = não em uso');
console.log('');
console.log('Já devem existir no projeto: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
console.log('');
console.log('════════ 2. SEGUNDO FATOR (escaneie agora) ════════');
console.log(uriOtpauth);
console.log('');
console.log(`Ou digite o segredo à mão: ${segredoTotp}`);
console.log(`Código deste instante: ${codigoTotp(segredoTotp)}  — o app tem que mostrar o mesmo.`);
console.log('Se não bater, o relógio do celular está fora de hora; ajuste antes de continuar.');
console.log('');
console.log('════════ 3. CÓDIGOS DE RECUPERAÇÃO (uso único) ════════');
console.log('Sem eles, perder o celular fecha o /adm para sempre.');
console.log('Guarde no gerenciador de senhas ou no papel. Não voltam a aparecer.');
console.log('');
for (const codigo of codigos) console.log(`  ${codigo.exibicao}`);
console.log('');
console.log('════════ 4. DEPOIS DE COLAR ════════');
console.log('· Redeploy: variável de ambiente nova só vale no próximo deploy.');
console.log('· Limpe o scrollback do terminal (a senha não apareceu, mas os códigos sim).');
console.log('· Teste o login e, na sequência, erre a senha 6 vezes: tem que travar.');
console.log('');
