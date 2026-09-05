import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodificarBase32,
  gerarCodigo,
  passoDe,
  totpConfigurado,
  verificarTotp,
  verificarTotpComPasso,
} from '@/lib/adm/totp';

/**
 * Prova externa desta implementação: os vetores do RFC 6238, Appendix B.
 *
 * O segredo dos vetores é o ASCII "12345678901234567890" (20 bytes) com SHA-1,
 * e o RFC publica o contador em hexa e o código de OITO dígitos para cada
 * instante. Este módulo trabalha com SEIS dígitos (`binario % 10^6`), que é o
 * mesmo número truncado — os seis últimos algarismos do valor de oito. Os dois
 * estão escritos abaixo como literal, e não calculados um a partir do outro:
 * um teste que derive o esperado repetindo a conta do código testa o teste.
 *
 * O que estes números garantem é o que nenhuma leitura garante: HMAC-SHA1,
 * contador big-endian, dynamic truncation com o nibble final, máscara 0x7f no
 * bit de sinal e padStart do zero à esquerda — todos certos AO MESMO TEMPO.
 */
const SEGREDO_ASCII = '12345678901234567890';
const SEGREDO_B32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

const VETORES_RFC = [
  { tempo: 59, contador: 0x0000000000000001, oitoDigitos: '94287082', codigo: '287082' },
  { tempo: 1111111109, contador: 0x00000000023523ec, oitoDigitos: '07081804', codigo: '081804' },
  { tempo: 1111111111, contador: 0x00000000023523ed, oitoDigitos: '14050471', codigo: '050471' },
  { tempo: 1234567890, contador: 0x000000000273ef07, oitoDigitos: '89005924', codigo: '005924' },
  { tempo: 2000000000, contador: 0x0000000003f940aa, oitoDigitos: '69279037', codigo: '279037' },
  { tempo: 20000000000, contador: 0x0000000027bc86aa, oitoDigitos: '65353130', codigo: '353130' },
] as const;

// ── base32 ───────────────────────────────────────────────────────────────────

test('o segredo em base32 decodifica para os mesmos bytes do vetor oficial do RFC', () => {
  const bytes = decodificarBase32(SEGREDO_B32);
  assert.ok(bytes, 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ é base32 válido');
  // Se este assert cair, todos os vetores abaixo estariam testando outro
  // segredo — e passariam ou falhariam por motivo errado.
  assert.deepEqual(bytes, Buffer.from(SEGREDO_ASCII, 'ascii'));
});

test('segredo copiado da tela com minúscula, espaço, hífen e padding decodifica no mesmo segredo', () => {
  const esperado = Buffer.from(SEGREDO_ASCII, 'ascii');
  assert.deepEqual(decodificarBase32(SEGREDO_B32.toLowerCase()), esperado);
  assert.deepEqual(decodificarBase32('GEZD GNBV GY3T QOJQ GEZD GNBV GY3T QOJQ'), esperado);
  assert.deepEqual(decodificarBase32('GEZD-GNBV-GY3T-QOJQ-GEZD-GNBV-GY3T-QOJQ'), esperado);
  assert.deepEqual(decodificarBase32(`${SEGREDO_B32}======`), esperado);
});

test('caractere fora do alfabeto base32 devolve null em vez de decodificar um segredo torto', () => {
  // 0, 1 e 8 não existem no alfabeto RFC 4648 — são justamente os que a pessoa
  // digita no lugar de O, I e B. Aceitar em silêncio daria um segredo diferente
  // do que está no autenticador, e um login que nunca funciona sem dizer por quê.
  assert.equal(decodificarBase32('GEZDGNBVGY3TQOJ0'), null);
  assert.equal(decodificarBase32('GEZDGNBVGY3TQOJ1'), null);
  assert.equal(decodificarBase32('GEZDGNBVGY3TQOJ8'), null);
  assert.equal(decodificarBase32('não é base32'), null);
});

test('segredo ausente ou só com pontuação devolve null, e não um buffer vazio', () => {
  // Buffer vazio seria pior que null: passaria por qualquer `if (segredo)` e
  // viraria uma chave HMAC de zero byte, que gera códigos perfeitamente válidos.
  assert.equal(decodificarBase32(null), null);
  assert.equal(decodificarBase32(undefined), null);
  assert.equal(decodificarBase32(''), null);
  assert.equal(decodificarBase32('   '), null);
  assert.equal(decodificarBase32('===='), null);
  assert.equal(decodificarBase32('- - -'), null);
});

// ── o algoritmo, contra o RFC ────────────────────────────────────────────────

test('o passo de 30 s bate com o contador publicado no RFC 6238', () => {
  for (const vetor of VETORES_RFC) {
    assert.equal(
      passoDe(vetor.tempo * 1000),
      vetor.contador,
      `T=${vetor.tempo} deveria cair no contador 0x${vetor.contador.toString(16)}`,
    );
  }
});

test('o passo só vira aos 30 s cheios: 29,999 s ainda é o passo anterior', () => {
  const inicio = 1111111110000; // início exato do passo 0x23523ED
  assert.equal(passoDe(inicio), 0x23523ed);
  assert.equal(passoDe(inicio + 29999), 0x23523ed);
  assert.equal(passoDe(inicio + 30000), 0x23523ee);
  assert.equal(passoDe(inicio - 1), 0x23523ec);
});

test('os seis códigos do RFC 6238 saem exatamente iguais aos publicados', () => {
  const segredo = decodificarBase32(SEGREDO_B32)!;
  for (const vetor of VETORES_RFC) {
    const gerado = gerarCodigo(segredo, vetor.contador);
    assert.equal(
      gerado,
      vetor.codigo,
      `T=${vetor.tempo}: o RFC publica ${vetor.oitoDigitos}, então os 6 dígitos são ${vetor.codigo}`,
    );
  }
});

test('código com valor pequeno mantém os zeros à esquerda — 6 caracteres, sempre', () => {
  // T=1234567890 dá 005924. Um `String(binario % 1e6)` sem padStart devolveria
  // "5924", que o campo de 6 dígitos da tela recusa antes mesmo de comparar.
  const segredo = decodificarBase32(SEGREDO_B32)!;
  assert.equal(gerarCodigo(segredo, 0x273ef07), '005924');
  assert.equal(gerarCodigo(segredo, 0x23523ec), '081804');
  for (const vetor of VETORES_RFC) {
    assert.equal(gerarCodigo(segredo, vetor.contador).length, 6);
  }
});

// ── a janela de tolerância ───────────────────────────────────────────────────

test('o código do instante confere e a verificação devolve o passo que casou', () => {
  const aceito = verificarTotpComPasso('081804', SEGREDO_B32, 1111111109000);
  assert.equal(aceito, 0x23523ec);
});

test('a janela aceita o código do passo seguinte, com o relógio do celular adiantado', () => {
  // Dois vetores VIZINHOS do RFC: 0x23523EC (T=1111111109) e 0x23523ED
  // (T=1111111111). Estando no primeiro, o código publicado do segundo entra —
  // e o passo devolvido é o do código, não o do servidor. É esse passo que o
  // anti-replay grava; devolver o do servidor deixaria o código do futuro ser
  // reusado quando o relógio chegasse lá.
  const aceito = verificarTotpComPasso('050471', SEGREDO_B32, 1111111109000);
  assert.equal(aceito, 0x23523ed);
});

test('a janela aceita o código do passo anterior, digitado em cima da virada', () => {
  const aceito = verificarTotpComPasso('081804', SEGREDO_B32, 1111111111000);
  assert.equal(aceito, 0x23523ec);
});

test('dois passos atrás é recusado: a tolerância é de ±1, não de ±2', () => {
  // Alargar a janela multiplica o tempo de vida de um código espiado por cima do
  // ombro. Os códigos vizinhos são montados com gerarCodigo — que os vetores
  // acima já prendem ao RFC — e não recalculados dentro do assert.
  const segredo = decodificarBase32(SEGREDO_B32)!;
  const agora = 1111111109000;
  const atual = 0x23523ec;

  assert.equal(verificarTotpComPasso(gerarCodigo(segredo, atual - 2), SEGREDO_B32, agora), null);
  assert.equal(verificarTotpComPasso(gerarCodigo(segredo, atual + 2), SEGREDO_B32, agora), null);
  assert.equal(verificarTotpComPasso(gerarCodigo(segredo, atual - 10), SEGREDO_B32, agora), null);
});

test('código de outro segredo não entra, mesmo estando dentro da janela de tempo', () => {
  const outro = decodificarBase32('JBSWY3DPEHPK3PXP')!;
  const agora = 1111111109000;
  assert.equal(verificarTotpComPasso(gerarCodigo(outro, 0x23523ec), SEGREDO_B32, agora), null);
});

test('passo 0 é resposta válida, não "não confere": o açúcar booleano não pode cair no falsy', () => {
  // verificarTotpComPasso devolve NÚMERO, e o passo 0 é falsy. Um wrapper
  // escrito como `Boolean(passo)` ou `!!passo` recusaria um código legítimo —
  // e o mesmo buraco derruba qualquer `if (passo)` no handler de login.
  const segredo = decodificarBase32(SEGREDO_B32)!;
  const codigoDoPassoZero = gerarCodigo(segredo, 0);

  // T=59 s é o próprio primeiro vetor do RFC: estamos no passo 1, e o passo 0
  // entra pela janela de -1.
  assert.equal(verificarTotpComPasso(codigoDoPassoZero, SEGREDO_B32, 59000), 0);
  assert.equal(verificarTotp(codigoDoPassoZero, SEGREDO_B32, 59000), true);
});

test('o açúcar booleano concorda com a versão que devolve o passo, nos dois sentidos', () => {
  assert.equal(verificarTotp('081804', SEGREDO_B32, 1111111109000), true);
  assert.equal(verificarTotp('050471', SEGREDO_B32, 1111111109000), true);
  assert.equal(verificarTotp('287082', SEGREDO_B32, 1111111109000), false);
  assert.equal(verificarTotp('000000', SEGREDO_B32, 1111111109000), false);
});

test('colisão dentro da janela devolve o passo mais antigo: a varredura fica com o primeiro acerto', () => {
  // Com o segredo do RFC, os passos 153567 e 153569 geram o MESMO código
  // (468457) — colisão encontrada por varredura, não construída. Estando no
  // passo do meio (153568), o código casa nas duas pontas da janela.
  //
  // A verificação percorre de -1 a +1 sem sair no primeiro acerto (o
  // curto-circuito revelaria por timing QUAL passo casou) e guarda o primeiro
  // com `aceito === null`. O efeito observável é este: vence o mais antigo.
  // Tirar a guarda — a "simplificação" óbvia de quem não leu o comentário —
  // faria vencer o mais novo e queimaria dois passos do anti-replay de uma vez.
  const segredo = decodificarBase32(SEGREDO_B32)!;
  assert.equal(gerarCodigo(segredo, 153567), '468457');
  assert.equal(gerarCodigo(segredo, 153569), '468457');
  assert.notEqual(gerarCodigo(segredo, 153568), '468457');

  const agora = 153568 * 30000 + 15000;
  assert.equal(verificarTotpComPasso('468457', SEGREDO_B32, agora), 153567);
});

// ── entrada malformada ───────────────────────────────────────────────────────

test('código malformado é recusado sem lançar — cinco dígitos, sete, letras, vazio, nulo', () => {
  // Isto chega de um <input> público: o que não for exatamente 6 dígitos tem que
  // virar "não confere", nunca uma exceção que o handler de login não trata (e
  // que devolveria 500 no lugar do redirect com erro).
  const agora = 1111111109000;
  for (const ruim of ['08180', '0818040', '08180a', 'abcdef', '', '   ', '-81804', '081.80', '٠٨١٨٠٤']) {
    assert.equal(verificarTotpComPasso(ruim, SEGREDO_B32, agora), null, `recusar ${JSON.stringify(ruim)}`);
    assert.equal(verificarTotp(ruim, SEGREDO_B32, agora), false);
  }
  assert.equal(verificarTotpComPasso(null, SEGREDO_B32, agora), null);
  assert.equal(verificarTotpComPasso(undefined, SEGREDO_B32, agora), null);
});

test('o espaço com que o autenticador mostra o código ("081 804") não atrapalha', () => {
  const agora = 1111111109000;
  assert.equal(verificarTotpComPasso('081 804', SEGREDO_B32, agora), 0x23523ec);
  assert.equal(verificarTotpComPasso('  081804  ', SEGREDO_B32, agora), 0x23523ec);
});

test('segredo ausente ou inválido recusa até o código certo — falha fechada, sem lançar', () => {
  const agora = 1111111109000;
  assert.equal(verificarTotpComPasso('081804', null, agora), null);
  assert.equal(verificarTotpComPasso('081804', undefined, agora), null);
  assert.equal(verificarTotpComPasso('081804', '', agora), null);
  assert.equal(verificarTotpComPasso('081804', '====', agora), null);
  assert.equal(verificarTotpComPasso('081804', 'segredo com 0 e 1', agora), null);
});

// ── configuração ─────────────────────────────────────────────────────────────

test('sem ADM_TOTP_SECRET válido o painel se declara não configurado, e o login fecha', () => {
  const original = process.env.ADM_TOTP_SECRET;
  try {
    delete process.env.ADM_TOTP_SECRET;
    assert.equal(totpConfigurado(), false);

    process.env.ADM_TOTP_SECRET = '';
    assert.equal(totpConfigurado(), false);

    // Segredo colado pela metade, ou com os caracteres que o base32 não tem:
    // vale como "não configurado", não como segredo aproveitável.
    process.env.ADM_TOTP_SECRET = '====';
    assert.equal(totpConfigurado(), false);
    process.env.ADM_TOTP_SECRET = 'GEZDGNBVGY3TQOJ0';
    assert.equal(totpConfigurado(), false);

    process.env.ADM_TOTP_SECRET = SEGREDO_B32;
    assert.equal(totpConfigurado(), true);
  } finally {
    if (original === undefined) delete process.env.ADM_TOTP_SECRET;
    else process.env.ADM_TOTP_SECRET = original;
  }
});
