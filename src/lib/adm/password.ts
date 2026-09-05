import 'server-only';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

/**
 * Senha do /adm: scrypt do node:crypto, hash guardado em env var — NUNCA em tabela.
 *
 * POR QUE ENV VAR E NÃO TABELA
 * O default ACL do schema `public` neste projeto concede `arwdDxt` a `anon` e
 * `authenticated` em TODA tabela nova. Uma `public.adm_credenciais` nasceria
 * legível E GRAVÁVEL pela anon key — que viaja dentro do APK. Guardar o hash no
 * banco seria entregar o /adm junto com o app. Em env var, um comprometimento do
 * Supabase não dá login no painel.
 *
 * POR QUE scrypt E NÃO bcrypt/argon2
 * `crypto.scrypt` é nativo do Node: zero dependência nova, zero binário nativo
 * (argon2 quebra no build da Vercel) e memory-hard de verdade (bcryptjs puro-JS
 * não é). Os parâmetros abaixo custam ~100 ms e ~33 MB por verificação — caro
 * para quem faz força bruta, irrelevante para um login por dia.
 */

/**
 * N=2^15, r=8, p=1, keylen=64. Mudar qualquer um destes NÃO invalida hashes
 * antigos: os parâmetros viajam dentro da própria string do hash, e a
 * verificação usa os do hash, não estes. Estes só valem para hashes NOVOS.
 */
const N_PADRAO = 32768;
const R_PADRAO = 8;
const P_PADRAO = 1;
const KEYLEN_PADRAO = 64;

/**
 * O scrypt do Node aborta com "memory limit exceeded" acima de 32 MB por
 * default, e 128 * N * r = 33,5 MB já estoura esse teto. Sem este maxmem o
 * login falha em produção com um erro que não parece de senha.
 */
const MAXMEM = 64 * 1024 * 1024;

/** Formato do valor guardado: scrypt$N$r$p$salt_b64$dk_b64 */
const PREFIXO = 'scrypt';

interface HashDecomposto {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  dk: Buffer;
}

function derivar(senha: string, salt: Buffer, N: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // NFKC: senha com acento digitada no macOS chega decomposta ("a" + "~") e no
    // Android composta ("ã"). Sem normalizar, a MESMA senha gera bytes diferentes
    // e o login falha só num dos aparelhos — bug caríssimo de diagnosticar.
    scryptCallback(senha.normalize('NFKC'), salt, keylen, { N, r, p, maxmem: MAXMEM }, (erro, dk) => {
      if (erro) reject(erro);
      else resolve(dk);
    });
  });
}

/** Decompõe `scrypt$N$r$p$salt$dk`. null = formato inválido (nunca lança). */
export function decomporHash(hash: string | null | undefined): HashDecomposto | null {
  if (!hash) return null;
  const partes = hash.trim().split('$');
  if (partes.length !== 6 || partes[0] !== PREFIXO) return null;

  const N = Number(partes[1]);
  const r = Number(partes[2]);
  const p = Number(partes[3]);
  // Sanidade dos parâmetros: N precisa ser potência de 2 > 1 e o custo de
  // memória (128*N*r) tem que caber no maxmem. Um hash corrompido com N enorme
  // travaria a lambda por minutos em vez de devolver "senha errada".
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

/** Gera o valor de ADM_PASSWORD_HASH / ADM_DUMMY_HASH / ADM_RECOVERY_HASHES. */
export async function gerarHash(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = await derivar(senha, salt, N_PADRAO, R_PADRAO, P_PADRAO, KEYLEN_PADRAO);
  return [PREFIXO, N_PADRAO, R_PADRAO, P_PADRAO, salt.toString('base64'), dk.toString('base64')].join('$');
}

/**
 * Queima o mesmo tempo de uma verificação real, mas sem hash válido para comparar.
 *
 * É o ponto do ADM_DUMMY_HASH: se o login retornasse cedo quando o USUÁRIO está
 * errado, a resposta voltaria em 2 ms contra ~100 ms do usuário certo — e o
 * tempo de resposta viraria um oráculo de existência ("este login existe").
 * Usar o dummy quando ele está configurado mantém até os parâmetros idênticos;
 * sem ele, derivamos contra um salt aleatório, que custa o mesmo.
 */
async function queimarTempo(senha: string): Promise<void> {
  const dummy = decomporHash(process.env.ADM_DUMMY_HASH);
  try {
    if (dummy) {
      await derivar(senha, dummy.salt, dummy.N, dummy.r, dummy.p, dummy.dk.length);
    } else {
      await derivar(senha, randomBytes(16), N_PADRAO, R_PADRAO, P_PADRAO, KEYLEN_PADRAO);
    }
  } catch {
    // Falhar aqui não muda o veredito (que já é "não confere"); só perde o
    // nivelamento de tempo. Silencioso de propósito.
  }
}

/**
 * Verifica a senha contra o hash armazenado.
 *
 * `hashArmazenado` NULO É USO PREVISTO, não erro: o handler de login passa
 * `usuarioConfere ? process.env.ADM_PASSWORD_HASH : null` e esta função gasta o
 * tempo do KDF mesmo assim, devolvendo false. Assim o caminho de falha custa o
 * mesmo que o de sucesso.
 */
export async function verificarSenha(senha: string, hashArmazenado: string | null | undefined): Promise<boolean> {
  if (typeof senha !== 'string' || senha.length === 0) {
    await queimarTempo('');
    return false;
  }

  const alvo = decomporHash(hashArmazenado);
  if (!alvo) {
    await queimarTempo(senha);
    return false;
  }

  let derivada: Buffer;
  try {
    derivada = await derivar(senha, alvo.salt, alvo.N, alvo.r, alvo.p, alvo.dk.length);
  } catch (e) {
    console.error('[adm] scrypt falhou na verificação de senha:', e instanceof Error ? e.message : 'erro');
    return false;
  }

  // `===` em string compara byte a byte e para no primeiro diferente — vaza o
  // prefixo correto por timing. timingSafeEqual sempre percorre tudo.
  return derivada.length === alvo.dk.length && timingSafeEqual(derivada, alvo.dk);
}

/**
 * Comparação de dois textos em tempo constante, tolerante a comprimentos
 * diferentes (timingSafeEqual exige buffers do mesmo tamanho, e comparar o
 * tamanho antes já vaza o comprimento do segredo).
 *
 * Truque padrão: passar os dois por HMAC com uma chave efêmera do processo.
 * Os digests têm sempre 32 bytes, e sem a chave ninguém consegue construir uma
 * colisão. É assim que se compara o nome de usuário sem virar oráculo.
 */
const CHAVE_EFEMERA = randomBytes(32);

export function igualdadeConstante(a: string | null | undefined, b: string | null | undefined): boolean {
  const da = createHmac('sha256', CHAVE_EFEMERA).update(a ?? '', 'utf8').digest();
  const db = createHmac('sha256', CHAVE_EFEMERA).update(b ?? '', 'utf8').digest();
  return timingSafeEqual(da, db);
}

/**
 * Códigos de recuperação (ADM_RECOVERY_HASHES: hashes scrypt separados por
 * vírgula). Devolve o ÍNDICE do código que conferiu — o handler precisa dele
 * para marcar o consumo em `auditoria.adm_recovery_usados`; sem marcar, o
 * código vira um segundo fator permanente, que é o oposto de uso único.
 *
 * Percorre a lista inteira de propósito, sem curto-circuito: sair no primeiro
 * acerto revelaria por timing QUAL código foi usado.
 */
export async function verificarCodigoRecuperacao(
  codigo: string,
  hashesCsv: string | null | undefined,
): Promise<number | null> {
  const hashes = (hashesCsv ?? '').split(',').map((h) => h.trim()).filter(Boolean);
  if (hashes.length === 0) {
    await queimarTempo(codigo);
    return null;
  }

  // Normaliza a digitação: o código é impresso em grupos ("ABCDE-FGHIJ") e o
  // Felipe pode digitar com espaço, minúscula ou sem o hífen.
  const normalizado = codigo.replace(/[\s-]/g, '').toUpperCase();

  let achado: number | null = null;
  for (let i = 0; i < hashes.length; i++) {
    const confere = await verificarSenha(normalizado, hashes[i]);
    if (confere && achado === null) achado = i;
  }
  return achado;
}
