#!/usr/bin/env node
/**
 * Cola as credenciais do /adm no .env.local sem passar por editor de texto.
 *
 *   node scripts/preencher-env-adm.mjs
 *
 * `gerar-credenciais-adm.mjs` manda os valores para a TELA; faltava um jeito
 * de colocá-los no arquivo sem abrir um editor de terminal e navegar até a
 * linha certa (nano/vim exigem prática que quem não mexe com terminal no dia
 * a dia não tem). Este script pergunta cada valor um por vez e escreve na
 * linha certa sozinho — o valor nunca aparece de novo na tela depois de
 * digitado, e não sai deste processo (não vai para log nenhum, não é
 * gravado em nenhum outro lugar além do .env.local).
 *
 * Enter em branco pula a chave e mantém a linha como está. NADA é escrito no
 * arquivo até a ÚLTIMA pergunta ser respondida — cancelar no meio (Ctrl+C)
 * não deixa o .env.local pela metade.
 *
 * POR QUE `for await...of rl` E NÃO `rl.question()` REPETIDO: a versão com
 * `await rl.question(...)` chamado várias vezes seguidas trava na SEGUNDA
 * pergunta — a promessa nunca resolve (bug/limite conhecido do
 * `readline/promises` do Node encadeando `question()`). O padrão abaixo lê
 * uma linha por vez do mesmo jeito nos dois casos, terminal de verdade ou
 * entrada via pipe, e foi o único testado que não trava.
 *
 * DUAS DEFESAS CONTRA O JEITO MAIS FÁCIL DE ERRAR AQUI — colar a linha
 * INTEIRA do gerador ("ADM_GESTO_HASH=scrypt$...") em vez de só o valor. Sem
 * elas isso gravaria "ADM_GESTO_HASH=ADM_GESTO_HASH=scrypt$..." — a chave
 * duplicada dentro do próprio valor, e o login falharia sem nenhuma mensagem
 * de erro clara meia hora depois:
 *   1. `removerPrefixoColado` tira esse "CHAVE=" do início se ele vier junto;
 *   2. os dois campos com formato conhecido (hash scrypt, hex) são CONFERIDOS
 *      contra esse formato antes de aceitar — se não bater (por causa da
 *      colagem, ou de um valor cortado na metade), a MESMA pergunta volta a
 *      aparecer, com o porquê, em vez de gravar algo quebrado.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const ARQUIVO = '.env.local';

const CHAVES = [
  ['SUPABASE_SERVICE_ROLE_KEY', 'chave service_role (Supabase → Settings → API)'],
  ['ADM_SESSION_SECRET', 'ADM_SESSION_SECRET (do gerar-credenciais-adm.mjs)'],
  ['ADM_USUARIO', 'ADM_USUARIO'],
  ['ADM_GESTO_HASH', 'ADM_GESTO_HASH (do gerar-gesto-adm.mjs)'],
];

/** Só nos campos com formato mecânico e conhecido — `SUPABASE_SERVICE_ROLE_KEY`
 *  e `ADM_USUARIO` variam demais (JWT antigo, chave nova `sb_secret_...`, nome
 *  livre) para valer a pena travar em cima de um formato específico. */
const VALIDADORES = {
  ADM_SESSION_SECRET: (v) => /^[0-9a-f]{64}$/i.test(v),
  ADM_GESTO_HASH: (v) => /^scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/.test(v),
};

function removerPrefixoColado(chave, valor) {
  return valor.replace(new RegExp(`^${chave}\\s*=\\s*`), '');
}

/**
 * ADM_PASSWORD_HASH e ADM_DUMMY_HASH usam '$N$r$p$salt$dk' como formato — e
 * `@next/env` (a camada que o Next.js usa para ler `.env.local`) EXPANDE
 * "$32768", "$8", "$1" como se fossem referência a outra variável de ambiente
 * (o mesmo mecanismo de "$HOME"), e como elas não existem, apaga cada uma.
 * Sem este escape, o hash chega à aplicação destruído, e o sintoma é
 * "falta ADM_PASSWORD_HASH" mesmo com o arquivo certo — foi exatamente esse
 * bug que motivou este bloco existir.
 *
 * `\$` no arquivo volta a ser `$` puro na hora de ler (ver `expand()` em
 * node_modules/@next/env/dist/index.js), então isto só muda o que fica GRAVADO
 * em disco — o valor que a aplicação enxerga continua sendo o hash original.
 */
const CHAVES_COM_CIFRAO_LITERAL = new Set(['ADM_GESTO_HASH']);

function paraEscritaNoEnv(chave, valor) {
  return CHAVES_COM_CIFRAO_LITERAL.has(chave) ? valor.replace(/\$/g, '\\$') : valor;
}

function aplicar(conteudoAtual, chave, valor) {
  // Casa a linha (comentada ou não) que declara esta chave — só a linha do
  // `=`, nunca os comentários de explicação que continuam nas linhas abaixo.
  const linha = new RegExp(`^#?\\s*${chave}\\s*=.*$`, 'm');
  return linha.test(conteudoAtual)
    ? conteudoAtual.replace(linha, `${chave}=${valor}`)
    : `${conteudoAtual}\n${chave}=${valor}\n`;
}

let conteudo;
try {
  conteudo = readFileSync(ARQUIVO, 'utf8');
} catch {
  console.error(`Não achei ${ARQUIVO} nesta pasta. Rode a partir da raiz do projeto.`);
  process.exit(1);
}

console.log('Cole cada valor e aperte Enter. Enter em branco pula e mantém a linha atual.\n');

const rl = createInterface({ input: process.stdin });
let indice = 0;
process.stdout.write(`${CHAVES[indice][1]}: `);

for await (const linhaDigitada of rl) {
  const [chave, rotulo] = CHAVES[indice];
  let valor = linhaDigitada.trim();

  if (valor) {
    valor = removerPrefixoColado(chave, valor);
    const valido = VALIDADORES[chave];
    if (valido && !valido(valor)) {
      process.stdout.write(
        `  isso não parece um valor válido de ${chave} — confere se copiou por inteiro ` +
          `(às vezes quebra em duas linhas na tela) e cola de novo.\n${rotulo}: `,
      );
      continue; // mesma pergunta de novo; índice não avança
    }
    conteudo = aplicar(conteudo, chave, paraEscritaNoEnv(chave, valor));
  }

  indice += 1;
  if (indice >= CHAVES.length) break;
  process.stdout.write(`${CHAVES[indice][1]}: `);
}

rl.close();
writeFileSync(ARQUIVO, conteudo, 'utf8');
console.log(`\n\n${ARQUIVO} atualizado.`);
