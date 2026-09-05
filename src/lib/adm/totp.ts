import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * TOTP (RFC 6238) implementado à mão com node:crypto. Zero dependência.
 *
 * POR QUE OBRIGATÓRIO, E NÃO OPCIONAL
 * O /adm dá leitura da base inteira — ~40 usuários, 31 propriedades, 13 mil
 * animais, com contatos e CPF. Uma senha única está a um phishing (ou a um
 * vazamento de senha reutilizada) de distância. O segundo fator custa 80 linhas
 * e nenhum pacote novo; a assimetria é grande demais para dispensar.
 *
 * POR QUE NÃO UMA BIBLIOTECA
 * O algoritmo inteiro é HMAC-SHA1 sobre um contador + truncamento. Qualquer
 * pacote de TOTP traz mais superfície de supply chain do que o código que
 * substitui — e este arquivo é auditável de cabo a rabo numa sentada.
 */

/** Passo de 30 s: o default universal (Google Authenticator, 1Password, Authy). */
export const PASSO_SEGUNDOS = 30;
export const DIGITOS = 6;

/**
 * Tolerância de ±1 passo (aceita t-1, t e t+1). Cobre relógio de celular
 * atrasado e o código digitado em cima da virada. Alargar isso multiplica a
 * janela de reuso de um código roubado — ±1 é o equilíbrio da própria RFC.
 */
export const JANELA_PASSOS = 1;

const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Base32 do RFC 4648 (o alfabeto que os apps autenticadores usam), decodificado
 * na unha. Tolera minúsculas, espaços, hífen e o padding '=' — porque segredo
 * copiado da tela vem com todos eles. null = caractere fora do alfabeto.
 */
export function decodificarBase32(entrada: string | null | undefined): Buffer | null {
  if (!entrada) return null;
  const limpo = entrada.replace(/[\s-]/g, '').replace(/=+$/, '').toUpperCase();
  if (limpo.length === 0) return null;

  const bytes: number[] = [];
  let acumulador = 0;
  let bits = 0;
  for (const caractere of limpo) {
    const valor = ALFABETO_BASE32.indexOf(caractere);
    if (valor < 0) return null;
    acumulador = (acumulador << 5) | valor;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acumulador >> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

/**
 * Contador de 8 bytes big-endian, montado com dois writeUInt32BE em vez de
 * writeBigUInt64BE: o tsconfig do repo mira ES2017 e BigInt fica fora do
 * target. O passo atual (~5,9e7) cabe folgado em 32 bits, e a metade alta só
 * sai de zero no ano 11.000.
 */
function contador(passo: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(passo / 2 ** 32), 0);
  buffer.writeUInt32BE(passo >>> 0, 4);
  return buffer;
}

/** O passo (contador de 30 s) correspondente a um instante em ms. */
export function passoDe(agoraMs: number): number {
  return Math.floor(agoraMs / 1000 / PASSO_SEGUNDOS);
}

/** HOTP/TOTP de um passo específico. Exportada para o teste e para o script. */
export function gerarCodigo(segredo: Buffer, passo: number): string {
  const mac = createHmac('sha1', segredo).update(contador(passo)).digest();

  // Dynamic truncation da RFC 4226: o nibble final do HMAC escolhe de onde
  // começam os 4 bytes usados. O & 0x7f zera o bit de sinal — sem ele, o
  // deslocamento << 24 produziria número negativo em JS.
  const deslocamento = mac[mac.length - 1] & 0x0f;
  const binario =
    ((mac[deslocamento] & 0x7f) << 24) |
    (mac[deslocamento + 1] << 16) |
    (mac[deslocamento + 2] << 8) |
    mac[deslocamento + 3];

  return String(binario % 10 ** DIGITOS).padStart(DIGITOS, '0');
}

/**
 * Verifica o código e devolve O PASSO ACEITO — não um booleano.
 *
 * O passo é o que permite anti-replay: o handler de login grava o último passo
 * aceito e rejeita qualquer tentativa com passo <= ele. Sem isso, um código
 * espiado por cima do ombro vale até 90 s (o passo mais a janela) e pode ser
 * reusado. null = não confere / segredo ausente ou inválido.
 *
 * `agoraMs` é parâmetro, e não Date.now() interno, para o teste conseguir fixar
 * o instante — TOTP sem tempo injetável é intestável.
 */
export function verificarTotpComPasso(
  codigo: string | null | undefined,
  segredoBase32: string | null | undefined,
  agoraMs: number = Date.now(),
): number | null {
  const digitado = (codigo ?? '').replace(/\s/g, '');
  // Comprimento e formato não são segredo: rejeitar cedo aqui não abre oráculo
  // nenhum e evita rodar HMAC à toa em lixo.
  if (!/^\d{6}$/.test(digitado)) return null;

  const segredo = decodificarBase32(segredoBase32);
  if (!segredo || segredo.length === 0) return null;

  const atual = passoDe(agoraMs);
  const alvo = Buffer.from(digitado, 'utf8');

  let aceito: number | null = null;
  for (let delta = -JANELA_PASSOS; delta <= JANELA_PASSOS; delta++) {
    const passo = atual + delta;
    const esperado = Buffer.from(gerarCodigo(segredo, passo), 'utf8');
    // Percorre a janela inteira sem curto-circuito: sair no primeiro acerto
    // revelaria por timing QUAL passo casou, o que é um relógio do servidor de
    // graça para quem estiver medindo.
    if (esperado.length === alvo.length && timingSafeEqual(esperado, alvo) && aceito === null) {
      aceito = passo;
    }
  }
  return aceito;
}

/** Açúcar booleano de verificarTotpComPasso — use a versão com passo se for gravar anti-replay. */
export function verificarTotp(
  codigo: string | null | undefined,
  segredoBase32: string | null | undefined,
  agoraMs: number = Date.now(),
): boolean {
  return verificarTotpComPasso(codigo, segredoBase32, agoraMs) !== null;
}

/** Há segredo TOTP configurado? Sem ele o login NÃO pode ser liberado — falha fechada. */
export function totpConfigurado(): boolean {
  return decodificarBase32(process.env.ADM_TOTP_SECRET) !== null;
}
