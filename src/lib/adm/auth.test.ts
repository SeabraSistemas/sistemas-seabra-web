import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, test } from 'node:test';

import {
  DURACAO_ABSOLUTA_MS,
  DURACAO_IDLE_MS,
  OPCOES_COOKIE_LIMPEZA,
  VERSAO_SESSAO,
  assinarSessao,
  criarSessao,
  opcoesCookie,
  renovarIdle,
  verificarSessao,
} from '@/lib/adm/auth';
import type { SessaoAdm } from '@/lib/adm/types';

/**
 * Testes de auth.ts — a terceira perna do login do /adm (as outras duas,
 * password.ts e totp.ts, já estão cobertas).
 *
 * O que este arquivo defende, em uma frase: o cookie do painel é a ÚNICA prova
 * de identidade que atravessa cada request, e as duas datas que ele carrega são
 * a diferença entre um notebook esquecido custar 30 minutos (o desenho) ou um
 * mês (o /katmandu, que este módulo existe para não repetir). Por isso os dois
 * prazos são testados no milissegundo exato: trocar um `>=` por `>` numa das
 * duas linhas é a edição de um caractere que ninguém vê no diff.
 *
 * TEMPO. Nada aqui chama `new Date()` sem argumento. Todo instante sai de T0,
 * um número fixo — é isso que faz um teste de expiração continuar valendo
 * amanhã de manhã, e às 23h59 de 31 de dezembro.
 *
 * SEGREDO. `segredo()` lê process.env a CADA chamada (e não uma vez, na carga
 * do módulo), então basta definir a variável aqui no corpo do arquivo — que
 * roda depois do import, por causa do hoisting — para todo o arquivo enxergar.
 * Os testes que precisam de OUTRO segredo trocam e devolvem no finally.
 */

/** 32 bytes em hexa: o mesmo formato que scripts/gerar-credenciais-adm.mjs imprime. */
const SEGREDO = '9f2c41ab7d5e0836bc19af4720d3e85c6a0b7f9124d8e3ca50761b9fd2e4c8a3';
process.env.ADM_SESSION_SECRET = SEGREDO;

/** 05/09/2026, 09:00 em São Paulo. Um número, não um relógio. */
const T0 = Date.parse('2026-09-05T12:00:00.000Z');
const MINUTO = 60_000;
const HORA = 60 * MINUTO;

// ─────────────────────────────────────────────────────────────────────────────
// Ferramentas do atacante
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monta um cookie no formato do módulo a partir de QUALQUER corpo — objeto
 * torto, JSON quebrado, texto que nem base64 é. É a ferramenta que permite
 * bater na porta com um payload hostil e assinatura boa; sem ela, todo teste
 * negativo daqui pararia na assinatura e passaria por motivo errado.
 */
function cookieForjado(corpo: unknown, chave: string = SEGREDO): string {
  const texto = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
  const payload = Buffer.from(texto, 'utf8').toString('base64url');
  return `${payload}.${createHmac('sha256', chave).update(payload).digest('hex')}`;
}

function payloadDe(cookie: string): string {
  return cookie.slice(0, cookie.lastIndexOf('.'));
}

function assinaturaDe(cookie: string): string {
  return cookie.slice(cookie.lastIndexOf('.') + 1);
}

/** O corpo de um cookie legítimo, do jeito que o atacante o leria (base64url não é cofre). */
function corpoDe(cookie: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(payloadDe(cookie), 'base64url').toString('utf8'));
}

/** Sessão assinada de verdade, para os testes que só precisam de um cookie bom. */
function cookieDe(sessao: SessaoAdm): string {
  const valor = assinarSessao(sessao);
  assert.ok(valor, 'assinarSessao devolveu null — o segredo do arquivo não chegou');
  return valor;
}

/** Troca ADM_SESSION_SECRET só pelo tempo da função e devolve o de antes. */
function comSegredo<T>(valor: string | undefined, fn: () => T): T {
  const anterior = process.env.ADM_SESSION_SECRET;
  if (valor === undefined) delete process.env.ADM_SESSION_SECRET;
  else process.env.ADM_SESSION_SECRET = valor;
  try {
    return fn();
  } finally {
    if (anterior === undefined) delete process.env.ADM_SESSION_SECRET;
    else process.env.ADM_SESSION_SECRET = anterior;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// criarSessao — as duas durações que o desenho gasta uma tabela justificando
// ─────────────────────────────────────────────────────────────────────────────

describe('criarSessao', () => {
  test('a jornada é de 8h e a inatividade de 30min — os números do desenho, não os 30 dias do katmandu', () => {
    // Literais de propósito: reescrever `8 * 60 * 60 * 1000` no assert testaria a
    // multiplicação, não a decisão. Se alguém "alinhar com o katmandu", cai aqui.
    assert.equal(DURACAO_ABSOLUTA_MS, 28_800_000);
    assert.equal(DURACAO_IDLE_MS, 1_800_000);
    assert.ok(DURACAO_IDLE_MS < DURACAO_ABSOLUTA_MS);
  });

  test('os três instantes saem do agora recebido, e não do relógio da máquina', () => {
    const sessao = criarSessao('felipe', T0);
    assert.equal(sessao.iat, T0);
    assert.equal(sessao.absExp, T0 + 8 * HORA);
    assert.equal(sessao.idleExp, T0 + 30 * MINUTO);
    assert.equal(sessao.sub, 'felipe');
    assert.equal(sessao.v, VERSAO_SESSAO);
  });

  test('cada sessão nasce com um sid próprio de 32 hexa — é a âncora da auditoria', () => {
    // sid fixo (ou derivado do sub) colapsaria duas sessões do mesmo operador em
    // uma linha só da trilha, e revogar uma revogaria a outra.
    const a = criarSessao('felipe', T0);
    const b = criarSessao('felipe', T0);
    assert.notEqual(a.sid, b.sid);
    assert.match(a.sid, /^[0-9a-f]{32}$/);
    assert.match(b.sid, /^[0-9a-f]{32}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ida e volta
// ─────────────────────────────────────────────────────────────────────────────

describe('assinarSessao + verificarSessao (ida e volta)', () => {
  test('a volta devolve os seis campos idênticos — nada se perde no base64url', () => {
    const sessao = criarSessao('felipe', T0);
    assert.deepEqual(verificarSessao(cookieDe(sessao), T0), sessao);
  });

  test('o cookie é payload base64url + ponto + 64 hexa, sem "=", "+" nem "/"', () => {
    // Não é estética: "=" e "," dentro do valor de um Set-Cookie exigem aspas, e
    // "+" vira espaço em qualquer parser desavisado. base64URL existe para isso.
    assert.match(cookieDe(criarSessao('felipe', T0)), /^[A-Za-z0-9_-]+\.[0-9a-f]{64}$/);
  });

  test('sub com acento e arroba volta byte a byte: o payload é utf8, não latin1', () => {
    const sessao: SessaoAdm = { ...criarSessao('joão.seabra@sistemaseabra.com.br', T0) };
    assert.equal(verificarSessao(cookieDe(sessao), T0)?.sub, 'joão.seabra@sistemaseabra.com.br');
  });

  test('assinar duas vezes a MESMA sessão dá o mesmo cookie — o HMAC é determinístico', () => {
    // Se um dia entrar sal ou timestamp na assinatura, o cookie renovado a cada
    // request mudaria a cada resposta e o teste de renovação viraria loteria.
    const sessao = criarSessao('felipe', T0);
    assert.equal(cookieDe(sessao), cookieDe(sessao));
  });

  test('o forjador destes testes produz assinatura que o verificador aceita', () => {
    // Guarda dos guardas: se `cookieForjado` assinasse errado, TODO teste
    // negativo abaixo passaria sem provar nada — recusado pela assinatura, e não
    // pelo motivo que o teste diz estar testando.
    const sessao = criarSessao('felipe', T0);
    assert.deepEqual(verificarSessao(cookieForjado(sessao), T0), sessao);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ataque: adulterar o cookie
// ─────────────────────────────────────────────────────────────────────────────

describe('verificarSessao — cookie forjado', () => {
  test('trocar o sub e reaproveitar a assinatura antiga não entra como outro operador', () => {
    const legitimo = cookieDe(criarSessao('felipe', T0));
    const corpo = { ...corpoDe(legitimo), sub: 'invasor' };
    const adulterado = Buffer.from(JSON.stringify(corpo), 'utf8').toString('base64url');

    assert.equal(verificarSessao(`${adulterado}.${assinaturaDe(legitimo)}`, T0), null);
    // E o payload adulterado é mesmo aceitável em tudo o mais: só a assinatura o
    // barrou. Sem esta linha, o assert acima passaria até se o módulo recusasse
    // "invasor" por outro motivo qualquer.
    assert.equal(verificarSessao(cookieForjado(corpo), T0)?.sub, 'invasor');
  });

  test('esticar o absExp para 30 dias com a assinatura antiga não estende a jornada', () => {
    // O ataque óbvio contra a decisão central do módulo: o prazo mora DENTRO do
    // cookie, então a única coisa entre o atacante e um mês de acesso é o HMAC.
    const legitimo = cookieDe(criarSessao('felipe', T0));
    const esticado = {
      ...corpoDe(legitimo),
      absExp: T0 + 30 * 24 * HORA,
      idleExp: T0 + 30 * 24 * HORA,
    };
    const payload = Buffer.from(JSON.stringify(esticado), 'utf8').toString('base64url');

    assert.equal(verificarSessao(`${payload}.${assinaturaDe(legitimo)}`, T0 + 9 * HORA), null);
    // Com assinatura boa o prazo esticado valeria — o que prova que é o HMAC, e
    // não outra checagem, que segura as 8 horas.
    assert.ok(verificarSessao(cookieForjado(esticado), T0 + 9 * HORA));
  });

  test('colar o payload de um cookie com a assinatura de outro não vale', () => {
    const felipe = cookieDe(criarSessao('felipe', T0));
    const outro = cookieDe(criarSessao('estagiario', T0));
    assert.equal(verificarSessao(`${payloadDe(felipe)}.${assinaturaDe(outro)}`, T0), null);
    assert.equal(verificarSessao(`${payloadDe(outro)}.${assinaturaDe(felipe)}`, T0), null);
  });

  test('um bit trocado na assinatura reprova — a comparação vai até o fim', () => {
    const cookie = cookieDe(criarSessao('felipe', T0));
    const assinatura = assinaturaDe(cookie);
    const primeiroDiferente = assinatura[0] === '0' ? '1' : '0';
    const ultimoDiferente = assinatura.at(-1) === '0' ? '1' : '0';

    assert.equal(verificarSessao(`${payloadDe(cookie)}.${primeiroDiferente}${assinatura.slice(1)}`, T0), null);
    assert.equal(verificarSessao(`${payloadDe(cookie)}.${assinatura.slice(0, -1)}${ultimoDiferente}`, T0), null);
  });

  test('cookie assinado com o segredo anterior morre quando o segredo é trocado', () => {
    // O outro botão de pânico: trocar ADM_SESSION_SECRET na Vercel derruba tudo.
    const antigo = comSegredo('0'.repeat(64), () => cookieDe(criarSessao('felipe', T0)));
    assert.equal(verificarSessao(antigo, T0), null);
  });

  test('assinatura mais curta ou mais longa é recusada sem explodir', () => {
    // timingSafeEqual LANÇA quando os buffers têm tamanhos diferentes. Um throw
    // aqui não seria só um 500: seria um 500 vindo do guard, em toda página do
    // painel, disparável por qualquer um que mande um cookie curto.
    const cookie = cookieDe(criarSessao('felipe', T0));
    const payload = payloadDe(cookie);
    const assinatura = assinaturaDe(cookie);

    assert.equal(verificarSessao(`${payload}.${assinatura.slice(0, -2)}`, T0), null); // 31 bytes
    assert.equal(verificarSessao(`${payload}.${assinatura}00`, T0), null); // 33 bytes
    assert.equal(verificarSessao(`${payload}.${assinatura}${assinatura}`, T0), null); // 64 bytes
    assert.equal(verificarSessao(`${payload}.`, T0), null); // 0 byte
    assert.equal(verificarSessao(`${payload}.zzzz`, T0), null); // nem hexa é
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ataque: cookie malformado — sempre null, nunca exceção
// ─────────────────────────────────────────────────────────────────────────────

describe('verificarSessao — entrada malformada', () => {
  test('ausência de cookie é null, não erro: quem nunca entrou também passa por aqui', () => {
    assert.equal(verificarSessao(null, T0), null);
    assert.equal(verificarSessao(undefined, T0), null);
    assert.equal(verificarSessao('', T0), null);
  });

  test('cookie sem separador, com separador na ponta ou só separador devolve null', () => {
    const cookie = cookieDe(criarSessao('felipe', T0));
    assert.equal(verificarSessao(payloadDe(cookie), T0), null); // sem ponto
    assert.equal(verificarSessao('.', T0), null);
    assert.equal(verificarSessao(`.${assinaturaDe(cookie)}`, T0), null); // payload vazio
    assert.equal(verificarSessao('sem-ponto-nenhum', T0), null);
  });

  test('payload que não é base64 válido não vira exceção — vira null', () => {
    // Assinado com a chave boa de propósito: é o único jeito de chegar até o
    // decode e provar que o try/catch cobre o caminho todo.
    assert.equal(verificarSessao(cookieForjado('!!!!'), T0), null);
    assert.equal(verificarSessao(cookieForjado(''), T0), null);
  });

  test('JSON quebrado com assinatura boa devolve null, e não um 500 no painel inteiro', () => {
    for (const texto of ['isto nao e json', '{"sub":', '{', '[1,2', 'undefined']) {
      assert.equal(verificarSessao(cookieForjado(texto), T0), null, `recusar ${texto}`);
    }
  });

  test('JSON válido que não é objeto (número, texto, null, lista) devolve null', () => {
    // `typeof null === 'object'` é a pegadinha clássica; lista passa no typeof e
    // só cai na conferência de campo a campo.
    for (const texto of ['123', '"felipe"', 'null', 'true', '[]', '[{"sub":"felipe"}]']) {
      assert.equal(verificarSessao(cookieForjado(texto), T0), null, `recusar ${texto}`);
    }
  });

  test('objeto com campo faltando ou de tipo errado devolve null — nunca uma sessão meio válida', () => {
    const bom = criarSessao('felipe', T0) as unknown as Record<string, unknown>;
    const tortos: Array<[string, Record<string, unknown>]> = [
      ['sem sub', { ...bom, sub: undefined }],
      ['sub vazio', { ...bom, sub: '' }],
      ['sub numérico', { ...bom, sub: 42 }],
      ['sem sid', { ...bom, sid: undefined }],
      ['sid vazio', { ...bom, sid: '' }],
      ['iat como texto', { ...bom, iat: String(T0) }],
      ['absExp como texto', { ...bom, absExp: String(T0 + 8 * HORA) }],
      ['absExp nulo', { ...bom, absExp: null }],
      ['sem idleExp', { ...bom, idleExp: undefined }],
      ['v como texto', { ...bom, v: String(VERSAO_SESSAO) }],
      ['objeto vazio', {}],
    ];
    for (const [nome, corpo] of tortos) {
      assert.equal(verificarSessao(cookieForjado(corpo), T0), null, `recusar ${nome}`);
    }
  });

  test('a sessão devolvida tem só os seis campos: campo extra no payload não entra no objeto', () => {
    // Sem a reconstrução explícita do return, um `admin: true` colado no payload
    // viajaria até quem consome a sessão — e o cookie é dado do cliente.
    const corpo = { ...corpoDe(cookieDe(criarSessao('felipe', T0))), papel: 'root', extra: [1, 2] };
    const sessao = verificarSessao(cookieForjado(corpo), T0);
    assert.ok(sessao);
    assert.deepEqual(Object.keys(sessao).sort(), ['absExp', 'iat', 'idleExp', 'sid', 'sub', 'v']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Guarda de tamanho
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cookie LEGÍTIMO com exatamente `alvo` caracteres, engordando o sub até bater o
 * tamanho. É o único jeito honesto de testar a guarda: o cookie precisa ser
 * válido em tudo o mais, senão a recusa viria de outro lugar e o teste mentiria.
 */
function cookieValidoComTamanho(alvo: number): string {
  const base = criarSessao('felipe', T0);
  for (let n = 1; n <= alvo; n += 1) {
    const cookie = cookieDe({ ...base, sub: 'x'.repeat(n) });
    if (cookie.length === alvo) return cookie;
    if (cookie.length > alvo) break;
  }
  throw new Error(`não foi possível montar um cookie válido de ${alvo} caracteres`);
}

describe('verificarSessao — teto de tamanho', () => {
  test('4096 caracteres ainda entram; 4097 são recusados antes de parsear', () => {
    // O limite não é decoração: o payload chega do cliente e vira JSON.parse. O
    // teto é o mesmo dos 4 KB que o navegador aceita por cookie — acima disso o
    // que chegou é lixo ou tentativa, e nem vale gastar CPU parseando.
    const noLimite = cookieValidoComTamanho(4096);
    const umAMais = cookieValidoComTamanho(4097);

    assert.equal(noLimite.length, 4096);
    assert.equal(umAMais.length, 4097);
    assert.ok(verificarSessao(noLimite, T0), 'cookie de 4096 deveria valer');
    assert.equal(verificarSessao(umAMais, T0), null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Versão da sessão — o botão de expulsar todo mundo
// ─────────────────────────────────────────────────────────────────────────────

type ModuloAuth = typeof import('@/lib/adm/auth');

/**
 * Recarrega auth.ts com outro ADM_SESSION_VERSION. A query no import é só para
 * furar o cache de módulos do Node — VERSAO_SESSAO é lida UMA vez, na carga, e
 * sem recarregar não há como testar o efeito da variável de ambiente.
 */
let recargas = 0;
async function carregarAuthComVersao(versao: string | undefined): Promise<ModuloAuth> {
  const anterior = process.env.ADM_SESSION_VERSION;
  if (versao === undefined) delete process.env.ADM_SESSION_VERSION;
  else process.env.ADM_SESSION_VERSION = versao;
  try {
    recargas += 1;
    return (await import(`./auth.ts?recarga=${recargas}`)) as ModuloAuth;
  } finally {
    if (anterior === undefined) delete process.env.ADM_SESSION_VERSION;
    else process.env.ADM_SESSION_VERSION = anterior;
  }
}

describe('versão da sessão', () => {
  test('cookie com v diferente da versão viva é recusado, para cima e para baixo', () => {
    const sessao = criarSessao('felipe', T0);
    assert.equal(verificarSessao(cookieForjado({ ...sessao, v: VERSAO_SESSAO + 1 }), T0), null);
    assert.equal(verificarSessao(cookieForjado({ ...sessao, v: VERSAO_SESSAO - 1 }), T0), null);
    assert.equal(verificarSessao(cookieForjado({ ...sessao, v: 0 }), T0), null);
  });

  test('incrementar ADM_SESSION_VERSION derruba as sessões já assinadas', async () => {
    const v2 = await carregarAuthComVersao('2');
    const v3 = await carregarAuthComVersao('3');
    assert.equal(v2.VERSAO_SESSAO, 2);
    assert.equal(v3.VERSAO_SESSAO, 3);

    const cookieV2 = v2.assinarSessao(v2.criarSessao('felipe', T0));
    assert.ok(cookieV2);
    assert.equal(v2.verificarSessao(cookieV2, T0)?.v, 2); // quem assinou aceita
    assert.equal(v3.verificarSessao(cookieV2, T0), null); // o mundo depois do botão, não
  });

  test('ADM_SESSION_VERSION vazio ou com lixo cai em 1 — NaN trancaria todo mundo do lado de fora', async () => {
    // `v !== VERSAO_SESSAO` com VERSAO_SESSAO = NaN recusa TODA sessão, inclusive
    // a que acabou de ser criada. Um erro de digitação na Vercel viraria um
    // painel inacessível sem uma linha de log dizendo por quê.
    assert.equal((await carregarAuthComVersao(undefined)).VERSAO_SESSAO, 1);
    assert.equal((await carregarAuthComVersao('')).VERSAO_SESSAO, 1);
    assert.equal((await carregarAuthComVersao('dois')).VERSAO_SESSAO, 1);
    assert.equal((await carregarAuthComVersao('0')).VERSAO_SESSAO, 1);
    assert.equal((await carregarAuthComVersao('12')).VERSAO_SESSAO, 12);

    const lixo = await carregarAuthComVersao('dois');
    const cookie = lixo.assinarSessao(lixo.criarSessao('felipe', T0));
    assert.ok(cookie);
    assert.ok(lixo.verificarSessao(cookie, T0), 'com versão inválida o login ainda tem que funcionar');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// As duas expirações, no milissegundo
// ─────────────────────────────────────────────────────────────────────────────

describe('verificarSessao — expiração absoluta (8h)', () => {
  /** idleExp propositalmente ALÉM do absExp: assim só o teto de 8h pode reprovar. */
  const soTeto = (): SessaoAdm => ({
    sub: 'felipe',
    sid: 'a'.repeat(32),
    iat: T0,
    absExp: T0 + 8 * HORA,
    idleExp: T0 + 9 * HORA,
    v: VERSAO_SESSAO,
  });

  test('vale no último milissegundo da jornada e não vale no absExp cravado', () => {
    const cookie = cookieDe(soTeto());
    assert.ok(verificarSessao(cookie, T0 + 8 * HORA - 1), 'um ms antes ainda é jornada');
    assert.equal(verificarSessao(cookie, T0 + 8 * HORA), null, 'no absExp já acabou');
    assert.equal(verificarSessao(cookie, T0 + 8 * HORA + 1), null);
  });

  test('a hora seguinte não ressuscita a sessão nem por engano de sinal', () => {
    const cookie = cookieDe(soTeto());
    assert.equal(verificarSessao(cookie, T0 + 9 * HORA), null);
    assert.equal(verificarSessao(cookie, T0 + 30 * 24 * HORA), null);
  });
});

describe('verificarSessao — expiração por inatividade (30min)', () => {
  /** absExp longe: só a inatividade pode reprovar. */
  const soIdle = (): SessaoAdm => ({
    sub: 'felipe',
    sid: 'a'.repeat(32),
    iat: T0,
    absExp: T0 + 8 * HORA,
    idleExp: T0 + 30 * MINUTO,
    v: VERSAO_SESSAO,
  });

  test('vale no último milissegundo dos 30 min e não vale no idleExp cravado', () => {
    const cookie = cookieDe(soIdle());
    assert.ok(verificarSessao(cookie, T0 + 30 * MINUTO - 1), 'um ms antes ainda é sessão');
    assert.equal(verificarSessao(cookie, T0 + 30 * MINUTO), null, 'no idleExp o café acabou');
    assert.equal(verificarSessao(cookie, T0 + 30 * MINUTO + 1), null);
  });

  test('quem reprovou no idleExp foi a inatividade, e não a jornada de 8h', () => {
    // Trava a causa: no MESMO instante, a mesma sessão com o idle deslizado passa.
    const instante = T0 + 30 * MINUTO;
    assert.equal(verificarSessao(cookieDe(soIdle()), instante), null);
    assert.ok(verificarSessao(cookieDe({ ...soIdle(), idleExp: instante + 1 }), instante));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renovarIdle — o que faz o teto ser teto
// ─────────────────────────────────────────────────────────────────────────────

describe('renovarIdle', () => {
  test('desliza 30 min a partir do agora e não encosta em nenhum outro campo', () => {
    const sessao = criarSessao('felipe', T0);
    const agora = T0 + 10 * MINUTO;
    const renovada = renovarIdle(sessao, agora);
    assert.ok(renovada);

    assert.equal(renovada.idleExp, agora + 30 * MINUTO);
    assert.equal(renovada.absExp, sessao.absExp, 'o teto de 8h não desliza junto');
    assert.equal(renovada.iat, sessao.iat);
    assert.equal(renovada.sub, sessao.sub);
    assert.equal(renovada.sid, sessao.sid, 'renovar não é nova sessão: a auditoria continua na mesma');
    assert.equal(renovada.v, sessao.v);
    // E o objeto de entrada continua intacto — o guard ainda o usa depois.
    assert.equal(sessao.idleExp, T0 + 30 * MINUTO);
  });

  test('perto do fim da jornada o idle novo é o próprio absExp, e não 30 min além dele', () => {
    // A linha do Math.min. Sem ela, o cookie sairia com maxAge maior que a
    // jornada e o cliente continuaria mandando um cookie que o servidor recusa —
    // que é exatamente o "válido para o navegador, morto para o servidor".
    const sessao = criarSessao('felipe', T0);
    const agora = sessao.absExp - 20 * MINUTO;
    // Quem trabalhou a manhã toda chega aqui com o idle já deslizado — é a
    // sessão real que encosta no teto, não uma recém-criada (essa morreu de
    // inatividade horas antes).
    const trabalhando: SessaoAdm = { ...sessao, idleExp: agora + 5 * MINUTO };
    const renovada = renovarIdle(trabalhando, agora);
    assert.ok(renovada);
    assert.equal(renovada.idleExp, sessao.absExp);
    assert.notEqual(renovada.idleExp, agora + 30 * MINUTO);
  });

  test('no minuto final o idle não passa do teto nem por um milissegundo', () => {
    const sessao = criarSessao('felipe', T0);
    const noLimite: SessaoAdm = { ...sessao, idleExp: sessao.absExp };
    const renovada = renovarIdle(noLimite, sessao.absExp - 1);
    assert.ok(renovada);
    assert.equal(renovada.idleExp, sessao.absExp);
    assert.ok(renovada.idleExp <= renovada.absExp);
  });

  test('trabalhando sem parar, a sessão morre nas 8h — atividade não faz sessão eterna', () => {
    // Este é O teste do módulo. Uma pessoa clicando de 25 em 25 minutos renova
    // para sempre SE o absExp deslizar junto; o laço abaixo não terminaria (e o
    // painel daria um mês de acesso, que é o comportamento do /katmandu que este
    // arquivo existe para não repetir).
    let sessao = criarSessao('felipe', T0);
    let agora = T0;
    let renovacoes = 0;

    while (renovacoes < 1000) {
      agora += 25 * MINUTO;
      const proxima = renovarIdle(sessao, agora);
      if (!proxima) break;
      sessao = proxima;
      renovacoes += 1;
    }

    // 25 min × 19 = 475 min de trabalho contínuo; a 20ª tentativa cai às 500 min,
    // depois das 480 da jornada.
    assert.equal(renovacoes, 19);
    assert.equal(agora, T0 + 500 * MINUTO);
    assert.equal(sessao.absExp, T0 + 8 * HORA, 'o teto é o mesmo do primeiro minuto');
    assert.equal(verificarSessao(cookieDe(sessao), agora), null);
  });

  test('sessão morta não ressuscita: nem no absExp, nem no idleExp, nem depois', () => {
    const sessao = criarSessao('felipe', T0);
    assert.equal(renovarIdle(sessao, sessao.idleExp), null, 'no idleExp cravado já morreu');
    assert.equal(renovarIdle(sessao, sessao.idleExp + 1), null);
    assert.ok(renovarIdle(sessao, sessao.idleExp - 1), 'um ms antes ainda renova');

    const semIdle: SessaoAdm = { ...sessao, idleExp: sessao.absExp };
    assert.equal(renovarIdle(semIdle, sessao.absExp), null, 'no absExp cravado já morreu');
    assert.equal(renovarIdle(semIdle, sessao.absExp + 1), null);
    assert.ok(renovarIdle(semIdle, sessao.absExp - 1));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Atributos do cookie — o path que já custou um 401 em toda exportação
// ─────────────────────────────────────────────────────────────────────────────

describe('opcoesCookie', () => {
  test('os cinco atributos, travados no valor: httpOnly, secure, sameSite strict, path /adm', () => {
    // path '/adm' NÃO é detalhe: o navegador só manda o cookie em URLs sob /adm,
    // então todo route handler do painel precisa morar em src/app/adm/api/* — foi
    // exatamente isso que fez toda exportação responder 401 quando os handlers
    // estavam em src/app/api/adm/*. Se alguém "consertar" o path aqui em vez de
    // mover o handler, este assert é que precisa falhar primeiro.
    assert.deepEqual(opcoesCookie(criarSessao('felipe', T0), T0), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/adm',
      maxAge: 1800,
    });
  });

  test('o maxAge segue o prazo que vencer primeiro, e não sempre o idle', () => {
    // No fim da jornada quem manda é o absExp; no começo, o idle. Usar só o idle
    // deixaria o navegador guardando um cookie que o servidor já recusa.
    const base = criarSessao('felipe', T0);
    assert.equal(opcoesCookie(base, T0).maxAge, 30 * 60);
    assert.equal(opcoesCookie({ ...base, absExp: T0 + 10 * MINUTO }, T0).maxAge, 10 * 60);
    assert.equal(opcoesCookie(base, T0 + 20 * MINUTO).maxAge, 10 * 60);
  });

  test('maxAge é inteiro de segundos, arredondado para baixo — o cookie nunca vive mais que a sessão', () => {
    const base = criarSessao('felipe', T0);
    const meioSegundoAlem = { ...base, idleExp: T0 + 1500 };
    assert.equal(opcoesCookie(meioSegundoAlem, T0).maxAge, 1);
    assert.equal(opcoesCookie({ ...base, idleExp: T0 + 999 }, T0).maxAge, 0);
  });

  test('sessão já vencida não devolve maxAge negativo — negativo é cookie de sessão, que sobreviveria', () => {
    // maxAge negativo em Set-Cookie é ignorado por parte dos navegadores, que
    // guardam o cookie até fechar a aba: o oposto do que se queria.
    const base = criarSessao('felipe', T0);
    assert.equal(opcoesCookie(base, base.idleExp).maxAge, 0);
    assert.equal(opcoesCookie(base, base.absExp + HORA).maxAge, 0);
  });
});

describe('OPCOES_COOKIE_LIMPEZA', () => {
  test('apaga com exatamente os mesmos atributos com que gravou, só que com maxAge 0', () => {
    // Se um atributo divergir (path, sameSite, secure), o navegador guarda DOIS
    // cookies de mesmo nome e o logout deixa o antigo vivo — o bug que não
    // aparece em teste nenhum de tela, porque a tela mostra a de login.
    const vencida = criarSessao('felipe', T0);
    assert.deepEqual(opcoesCookie(vencida, vencida.absExp + HORA), OPCOES_COOKIE_LIMPEZA);
    assert.equal(OPCOES_COOKIE_LIMPEZA.maxAge, 0);
    assert.equal(OPCOES_COOKIE_LIMPEZA.path, '/adm');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sem segredo, falha fechada
// ─────────────────────────────────────────────────────────────────────────────

describe('ADM_SESSION_SECRET ausente ou fraco', () => {
  test('sem segredo, não assina e não valida nada — inclusive o que já estava assinado', () => {
    // Falhar fechada é a única opção: sem chave não há como distinguir cookie
    // legítimo de forjado, e um deploy sem a env var não pode virar painel aberto.
    const antes = cookieDe(criarSessao('felipe', T0));
    comSegredo(undefined, () => {
      assert.equal(assinarSessao(criarSessao('felipe', T0)), null);
      assert.equal(verificarSessao(antes, T0), null);
    });
    // E, com o segredo de volta, o mesmo cookie volta a valer: a recusa acima foi
    // pela ausência da chave, não porque o cookie tivesse algum defeito.
    assert.ok(verificarSessao(antes, T0));
  });

  test('segredo com menos de 32 caracteres conta como ausente; com 32 já serve', () => {
    // 32 hexa = 16 bytes é o piso. Assinar com "segredo123" é pior que não
    // assinar: dá aparência de proteção a uma chave que se quebra na força bruta.
    comSegredo('a'.repeat(31), () => {
      assert.equal(assinarSessao(criarSessao('felipe', T0)), null);
      assert.equal(verificarSessao(cookieForjado(criarSessao('felipe', T0), 'a'.repeat(31)), T0), null);
    });
    comSegredo('a'.repeat(32), () => {
      const sessao = criarSessao('felipe', T0);
      const cookie = assinarSessao(sessao);
      assert.ok(cookie);
      assert.deepEqual(verificarSessao(cookie, T0), sessao);
    });
  });
});
