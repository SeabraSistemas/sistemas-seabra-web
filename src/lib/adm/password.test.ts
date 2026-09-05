import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import {
  decomporHash,
  gerarHash,
  igualdadeConstante,
  verificarCodigoRecuperacao,
  verificarSenha,
} from '@/lib/adm/password';

/**
 * Duas coisas precisam ser ditas antes dos testes.
 *
 * 1. PARÂMETROS BAIXOS. Os hashes daqui usam N=1024 (≈2 ms) em vez do N=32768
 *    de produção (≈100 ms e 33 MB). Isso é possível porque os parâmetros viajam
 *    DENTRO da string do hash e a verificação usa os do hash — que é exatamente
 *    o que o teste "a verificação usa os parâmetros gravados no hash" prende. O
 *    formato é o mesmo, campo por campo; só o custo muda. Dois testes rodam com
 *    os parâmetros de produção de propósito, e estão marcados.
 *
 * 2. ADM_DUMMY_HASH. Todo caminho de FALHA de verificarSenha() queima o tempo de
 *    um scrypt de propósito (é o nivelamento que impede o cronômetro de virar
 *    oráculo de "este login existe"). Sem um dummy barato configurado, cada
 *    assert de falha custaria 100 ms e este arquivo levaria segundos. O dummy
 *    abaixo mantém o caminho de falha REAL — ele continua derivando —, só
 *    barato.
 */
const N_TESTE = 1024;
const R_TESTE = 8;
const P_TESTE = 1;
const KEYLEN_TESTE = 32;

/** Mesmíssimo formato de gerarHash(), com custo de teste: scrypt$N$r$p$salt$dk. */
function hashBarato(senha: string, opcoes: { N?: number; r?: number; p?: number; keylen?: number } = {}): string {
  const N = opcoes.N ?? N_TESTE;
  const r = opcoes.r ?? R_TESTE;
  const p = opcoes.p ?? P_TESTE;
  const keylen = opcoes.keylen ?? KEYLEN_TESTE;
  const salt = randomBytes(16);
  const dk = scryptSync(senha.normalize('NFKC'), salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', N, r, p, salt.toString('base64'), dk.toString('base64')].join('$');
}

process.env.ADM_DUMMY_HASH = hashBarato('dummy de teste, não é senha de ninguém');

const HASH_VALIDO = hashBarato('senha do painel do felipe');

// ── o que a função existe para fazer ─────────────────────────────────────────

test('a senha certa entra e a errada não', async () => {
  assert.equal(await verificarSenha('senha do painel do felipe', HASH_VALIDO), true);
  assert.equal(await verificarSenha('senha do painel do Felipe', HASH_VALIDO), false);
  assert.equal(await verificarSenha('senha do painel do felipe ', HASH_VALIDO), false);
  assert.equal(await verificarSenha('senha do painel do felip', HASH_VALIDO), false);
  assert.equal(await verificarSenha('outra coisa', HASH_VALIDO), false);
});

test('prefixo certo da senha não passa: a comparação vai até o fim, não para no primeiro byte igual', async () => {
  // Este é o motivo do timingSafeEqual sobre a dk inteira. Como o efeito é de
  // TEMPO, o que dá para afirmar por valor é o veredito — o prefixo correto é
  // tão recusado quanto o texto totalmente diferente.
  for (const prefixo of ['s', 'senha', 'senha do painel', 'senha do painel do felipe!']) {
    assert.equal(await verificarSenha(prefixo, HASH_VALIDO), false, `recusar "${prefixo}"`);
  }
});

test('senha vazia não passa nem contra o hash da própria senha vazia', async () => {
  // Sutil e importante: o hash abaixo CONFERE com '' do ponto de vista do scrypt.
  // A recusa vem da guarda no topo de verificarSenha, e ela existe porque senha
  // vazia num painel que abre a base inteira nunca é intenção — é campo que não
  // chegou, form serializado errado, variável que virou ''.
  const hashDoVazio = hashBarato('');
  assert.equal(await verificarSenha('', hashDoVazio), false);
  assert.equal(await verificarSenha('', HASH_VALIDO), false);
});

test('acento composto e decomposto são a mesma senha: NFKC nos dois lados', async () => {
  // "senhã" digitada no macOS chega decomposta (a + til) e no Android composta.
  // Sem o normalize a MESMA senha gera bytes diferentes, e o login falha só num
  // dos aparelhos. O hash aqui é gerado a partir da forma composta.
  // Escapes explícitos: escritas com o caractere direto, as duas linhas ficariam
  // indistinguíveis no arquivo e o teste não provaria nada.
  const composta = 'cabr\u00e3o do sert\u00e3o 2026'; // ã pré-composto
  const decomposta = 'cabra\u0303o do serta\u0303o 2026'; // a + til combinante
  assert.notEqual(composta, decomposta, 'as duas formas são strings diferentes');

  const hash = hashBarato(composta);
  assert.equal(await verificarSenha(composta, hash), true);
  assert.equal(await verificarSenha(decomposta, hash), true);
});

// ── os parâmetros moram no hash ──────────────────────────────────────────────

test('a verificação usa os parâmetros gravados no hash, não os constantes do módulo', async () => {
  // Promessa escrita no comentário do módulo: mudar N/r/p/keylen NÃO invalida
  // hash antigo. Se derivar() passasse a usar N_PADRAO em vez de alvo.N, este
  // teste cai — e o efeito em produção seria o Felipe trancado para fora depois
  // de um ajuste de custo que ninguém associaria à falha de login.
  const senha = 'senha do painel do felipe';
  const antigo = hashBarato(senha, { N: 256, r: 4, p: 1, keylen: 24 });
  const outro = hashBarato(senha, { N: 2048, r: 8, p: 2, keylen: 64 });

  const decomposto = decomporHash(antigo);
  assert.deepEqual(
    { N: decomposto?.N, r: decomposto?.r, p: decomposto?.p, dk: decomposto?.dk.length },
    { N: 256, r: 4, p: 1, dk: 24 },
  );

  assert.equal(await verificarSenha(senha, antigo), true);
  assert.equal(await verificarSenha(senha, outro), true);
  assert.equal(await verificarSenha('errada', antigo), false);
});

// ── formato: o que o gerador escreve é o que o login lê ──────────────────────

test('gerarHash devolve scrypt$32768$8$1$salt$dk, com salt de 16 bytes e dk de 64', async () => {
  // Parâmetros de produção de propósito: este teste custa ~200 ms e é o único
  // lugar que prova o custo real do KDF, e não uma versão de brinquedo dele.
  const hash = await gerarHash('senha do painel do felipe');
  const partes = hash.split('$');

  assert.equal(partes.length, 6);
  assert.equal(partes[0], 'scrypt');
  assert.deepEqual(partes.slice(1, 4), ['32768', '8', '1']);
  assert.equal(Buffer.from(partes[4], 'base64').length, 16, 'salt de 16 bytes');
  assert.equal(Buffer.from(partes[5], 'base64').length, 64, 'dk de 64 bytes');

  assert.equal(await verificarSenha('senha do painel do felipe', hash), true);
});

test('dois hashes da mesma senha são diferentes: o salt é sorteado a cada geração', async () => {
  // Sem salt novo, dois operadores com a mesma senha teriam o mesmo hash, e o
  // valor colado na Vercel seria comparável com qualquer tabela pré-computada.
  const a = await gerarHash('senha do painel do felipe');
  const b = await gerarHash('senha do painel do felipe');
  assert.notEqual(a, b);
  assert.notEqual(decomporHash(a)!.salt.toString('base64'), decomporHash(b)!.salt.toString('base64'));
});

test('round-trip com o gerador de credenciais: o hash do script entra no login e o hash do login confere pelo script', async () => {
  // As duas metades de scripts/gerar-credenciais-adm.mjs, copiadas linha a linha
  // (o script é .mjs de execução direta — lê stdin no topo — e não dá para
  // importar). Se algum dos lados mudar de formato, este teste é o que grita:
  // divergir aqui produz um hash que NUNCA confere no login, e a descoberta
  // seria na tela de login, com as variáveis já coladas na Vercel.
  const N = 32768;
  const R = 8;
  const P = 1;
  const KEYLEN = 64;
  const MAXMEM = 64 * 1024 * 1024;

  const gerarComoOScript = (senha: string): string => {
    const salt = randomBytes(16);
    const dk = scryptSync(senha.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
    return ['scrypt', N, R, P, salt.toString('base64'), dk.toString('base64')].join('$');
  };

  const conferirComoOScript = (senha: string, hash: string): boolean => {
    const [prefixo, n, r, p, saltB64, dkB64] = hash.split('$');
    if (prefixo !== 'scrypt') return false;
    const salt = Buffer.from(saltB64, 'base64');
    const dk = Buffer.from(dkB64, 'base64');
    const calculada = scryptSync(senha.normalize('NFKC'), salt, dk.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
    });
    return calculada.length === dk.length && timingSafeEqual(calculada, dk);
  };

  const senha = 'senha de doze ou mais';

  // Ida: o que o script imprimiria em ADM_PASSWORD_HASH é aceito pelo login.
  const doScript = gerarComoOScript(senha);
  assert.equal(await verificarSenha(senha, doScript), true);
  assert.equal(await verificarSenha('senha de doze ou mai', doScript), false);

  // Volta: o hash do módulo é legível pelo `split('$')` do script, incluindo o
  // round-trip que ele faz antes de mandar colar na Vercel.
  const doModulo = await gerarHash(senha);
  assert.equal(conferirComoOScript(senha, doModulo), true);
});

test('espaço e quebra de linha em volta do hash não quebram o login', () => {
  // Valor colado no painel da Vercel ou lido de .env.local costuma vir com \n.
  const decomposto = decomporHash(`\n  ${HASH_VALIDO}  \n`);
  assert.ok(decomposto);
  assert.equal(decomposto.N, N_TESTE);
});

// ── hash malformado: false, nunca exceção ────────────────────────────────────

test('hash com campo faltando ou sobrando devolve null, sem lançar', () => {
  const [, N, r, p, salt, dk] = HASH_VALIDO.split('$');
  assert.equal(decomporHash(['scrypt', N, r, p, salt].join('$')), null, 'cinco campos');
  assert.equal(decomporHash([HASH_VALIDO, 'sobra'].join('$')), null, 'sete campos');
  assert.equal(decomporHash(['bcrypt', N, r, p, salt, dk].join('$')), null, 'prefixo de outro KDF');
  assert.equal(decomporHash(''), null);
  assert.equal(decomporHash(null), null);
  assert.equal(decomporHash(undefined), null);
  assert.equal(decomporHash('lixo'), null);
  assert.equal(decomporHash('$$$$$'), null);
});

test('base64 inválido no salt ou na dk devolve null em vez de lançar', () => {
  // Buffer.from(x, 'base64') não lança: ele ignora o que não reconhece e pode
  // devolver buffer VAZIO. Sem a checagem de tamanho, um salt de zero byte
  // passaria e derivaria contra salt vazio — que é o mesmo que não ter salt.
  const [, N, r, p, , dk] = HASH_VALIDO.split('$');
  assert.equal(decomporHash(['scrypt', N, r, p, '!!!!', dk].join('$')), null, 'salt não-base64');
  assert.equal(decomporHash(['scrypt', N, r, p, '', dk].join('$')), null, 'salt vazio');
  assert.equal(decomporHash(['scrypt', N, r, p, 'c2FsdA==', '####'].join('$')), null, 'dk não-base64');
});

test('dk curta demais é recusada: 8 bytes de chave derivada não são hash de senha', () => {
  const [, N, r, p, salt] = HASH_VALIDO.split('$');
  assert.equal(decomporHash(['scrypt', N, r, p, salt, randomBytes(8).toString('base64')].join('$')), null);
  assert.ok(decomporHash(['scrypt', N, r, p, salt, randomBytes(16).toString('base64')].join('$')));
});

test('N que não é potência de dois é recusado — scrypt lançaria em runtime', () => {
  const [, , r, p, salt, dk] = HASH_VALIDO.split('$');
  const com = (N: string) => decomporHash(['scrypt', N, r, p, salt, dk].join('$'));
  assert.equal(com('1000'), null, 'N=1000 não é potência de dois');
  assert.equal(com('1'), null, 'N=1 é rejeitado pelo próprio scrypt');
  assert.equal(com('0'), null);
  assert.equal(com('-1024'), null);
  assert.equal(com('abc'), null, 'Number("abc") é NaN');
  assert.equal(com('1024.5'), null);
  assert.equal(com(''), null, 'Number("") é 0, e não deve virar N=0');
  assert.ok(com('1024'));
});

test('r e p inválidos são recusados', () => {
  const [, N, , , salt, dk] = HASH_VALIDO.split('$');
  assert.equal(decomporHash(['scrypt', N, '0', '1', salt, dk].join('$')), null, 'r=0');
  assert.equal(decomporHash(['scrypt', N, '8', '0', salt, dk].join('$')), null, 'p=0');
  assert.equal(decomporHash(['scrypt', N, '8.5', '1', salt, dk].join('$')), null, 'r fracionário');
  assert.equal(decomporHash(['scrypt', N, '8', 'x', salt, dk].join('$')), null, 'p NaN');
});

test('hash corrompido com N gigante é recusado antes de tentar alocar a memória', () => {
  // 128 * 2^20 * 8 = 1 GB, muito acima do maxmem de 64 MB. Sem esta guarda a
  // função de login ficaria minutos moendo memória para no fim dizer "senha
  // errada" — um DoS de uma linha em cima do próprio painel.
  const [, , r, p, salt, dk] = HASH_VALIDO.split('$');
  assert.equal(decomporHash(['scrypt', String(2 ** 20), r, p, salt, dk].join('$')), null);
  assert.equal(decomporHash(['scrypt', '1024', '4096', p, salt, dk].join('$')), null, 'r grande estoura igual');
  assert.ok(decomporHash(['scrypt', String(2 ** 15), '8', '1', salt, dk].join('$')), 'o N de produção cabe');
});

test('hash malformado ou ausente devolve false em vez de lançar — é como o handler chama', async () => {
  // O handler passa `usuarioConfere ? hash : null` de propósito, para gastar o
  // tempo do KDF mesmo quando o usuário não existe. `null` aqui é uso previsto,
  // não erro: tem que voltar false, calado.
  assert.equal(await verificarSenha('qualquer', null), false);
  assert.equal(await verificarSenha('qualquer', undefined), false);
  assert.equal(await verificarSenha('qualquer', ''), false);
  assert.equal(await verificarSenha('qualquer', 'lixo'), false);
  assert.equal(await verificarSenha('qualquer', 'scrypt$1000$8$1$c2FsdA==$ZGVyaXZhZGFkZXJpdmFkYQ=='), false);
});

// ── comparação de usuário em tempo constante ─────────────────────────────────

test('igualdadeConstante compara o texto inteiro: prefixo correto não passa', () => {
  // Um `startsWith` ou um `===` curto-circuitado deixaria "fel" medir se o
  // usuário começa com "fel". Aqui o veredito é o que dá para afirmar.
  assert.equal(igualdadeConstante('felipe', 'felipe'), true);
  assert.equal(igualdadeConstante('felipe', 'fel'), false);
  assert.equal(igualdadeConstante('fel', 'felipe'), false);
  assert.equal(igualdadeConstante('felipe', 'felipe '), false);
  assert.equal(igualdadeConstante('felipe', 'gelipe'), false);
});

test('igualdadeConstante distingue maiúscula: quem quiser ignorar caixa normaliza antes', () => {
  // O handler de login chama com .toLowerCase() dos dois lados. A função em si
  // não pode decidir isso sozinha — ela também compara segredo, não só login.
  assert.equal(igualdadeConstante('Felipe', 'felipe'), false);
  assert.equal(igualdadeConstante('Felipe'.toLowerCase(), 'felipe'), true);
});

test('igualdadeConstante trata ausente como texto vazio — por isso o handler exige ADM_USUARIO antes', () => {
  // Comportamento fixado de propósito, porque é uma armadilha: com a variável
  // de ambiente não configurada, `undefined` vira '' e um usuário digitado
  // vazio CONFERIRIA. Quem protege contra isso é a guarda `!usuarioEsperado` no
  // handler de login, e é ela que não pode ser removida.
  assert.equal(igualdadeConstante(null, ''), true);
  assert.equal(igualdadeConstante(undefined, ''), true);
  assert.equal(igualdadeConstante(undefined, null), true);
  assert.equal(igualdadeConstante(undefined, 'felipe'), false);
});

// ── códigos de recuperação ───────────────────────────────────────────────────

test('o código de recuperação devolve o ÍNDICE que conferiu, e o índice 0 não é "não conferiu"', async () => {
  // O índice é o que o handler usa para marcar o consumo em
  // auditoria.adm_recovery_usados. O primeiro código da lista devolve 0, que é
  // falsy: um `if (indice)` no chamador deixaria o PRIMEIRO código passar sem
  // ser marcado — e um código de uso único que não se consome vira segundo
  // fator permanente, o oposto do que ele é.
  const csv = [hashBarato('AAAAABBBBB'), hashBarato('CCCCCDDDDD'), hashBarato('EEEEEFFFFF')].join(',');

  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', csv), 0);
  assert.equal(await verificarCodigoRecuperacao('CCCCCDDDDD', csv), 1);
  assert.equal(await verificarCodigoRecuperacao('EEEEEFFFFF', csv), 2);
  assert.equal(await verificarCodigoRecuperacao('GGGGGHHHHH', csv), null);
});

test('o código é aceito como está impresso: com hífen, com espaço e em minúscula', async () => {
  // O script imprime "AAAAA-BBBBB" e hasheia o código JÁ normalizado. Se as duas
  // normalizações divergirem, os cinco códigos de recuperação nascem inúteis — e
  // isso só se descobre no dia em que o celular sumiu.
  const csv = [hashBarato('AAAAABBBBB'), hashBarato('CCCCCDDDDD')].join(',');
  assert.equal(await verificarCodigoRecuperacao('AAAAA-BBBBB', csv), 0);
  assert.equal(await verificarCodigoRecuperacao('aaaaa-bbbbb', csv), 0);
  assert.equal(await verificarCodigoRecuperacao('  ccccc bbbb ', csv), null);
  assert.equal(await verificarCodigoRecuperacao(' ccccc-ddddd ', csv), 1);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', csv), 0);
});

test('lista vazia ou ausente devolve null sem lançar', async () => {
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', null), null);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', undefined), null);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', ''), null);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', '   '), null);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', ',,,'), null);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', 'lixo,mais lixo'), null);
});

test('vírgula sobrando e entrada vazia não desloca o índice: o índice conta os hashes de verdade', async () => {
  // ADM_RECOVERY_HASHES é colada à mão na Vercel; vírgula a mais, espaço e
  // quebra de linha são os erros de dedo prováveis, e nenhum pode mudar qual
  // código é qual. As entradas vazias são DESCARTADAS antes de numerar: o
  // índice é a posição na lista de hashes reais, e é essa a posição que o
  // consumo grava em auditoria.adm_recovery_usados.
  const base = [hashBarato('AAAAABBBBB'), hashBarato('CCCCCDDDDD')];

  const comVirgulaSobrando = `${base.join(',')},`;
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', comVirgulaSobrando), 0);
  assert.equal(await verificarCodigoRecuperacao('CCCCCDDDDD', comVirgulaSobrando), 1);

  const comEspacoEQuebra = ` ${base[0]} ,\n ${base[1]} `;
  assert.equal(await verificarCodigoRecuperacao('CCCCCDDDDD', comEspacoEQuebra), 1);

  // Buraco no meio (rotação de um código, entrada apagada em vez de trocada):
  // o segundo hash continua sendo o índice 1, não o 2.
  const comBuracoNoMeio = `${base[0]},,${base[1]}`;
  assert.equal(await verificarCodigoRecuperacao('CCCCCDDDDD', comBuracoNoMeio), 1);
});

test('código repetido na lista devolve o primeiro índice: a varredura não para no acerto', () => {
  // A lista é percorrida inteira, e `achado === null` guarda o primeiro. Sair no
  // primeiro acerto revelaria por timing QUAL código foi usado; tirar a guarda
  // faria vencer o último, e o consumo seria marcado na linha errada.
  const repetido = hashBarato('AAAAABBBBB');
  const csv = [repetido, hashBarato('CCCCCDDDDD'), repetido].join(',');
  return verificarCodigoRecuperacao('AAAAABBBBB', csv).then((indice) => assert.equal(indice, 0));
});

test('hash quebrado no meio da lista não derruba a verificação dos outros', async () => {
  // Uma entrada corrompida na variável de ambiente não pode transformar "código
  // errado" em exceção — nem impedir que os códigos bons ainda funcionem.
  const csv = ['scrypt$1000$8$1$!!!$!!!', hashBarato('CCCCCDDDDD'), 'lixo'].join(',');
  assert.equal(await verificarCodigoRecuperacao('CCCCCDDDDD', csv), 1);
  assert.equal(await verificarCodigoRecuperacao('AAAAABBBBB', csv), null);
});
