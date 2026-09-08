import { NextResponse } from 'next/server';
import { ADM_COOKIE, assinarSessao, criarSessao, mesmaOrigem, opcoesCookie } from '@/lib/adm/auth';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { normalizarGesto } from '@/lib/adm/gesto';
import { decomporHash, igualdadeConstante, verificarSenha } from '@/lib/adm/password';
import {
  aplicarPisoDeLatencia,
  registrarTentativa,
  verificarBloqueio,
  type MotivoTentativa,
} from '@/lib/adm/rate-limit';

/**
 * Login do /adm: usuário + senha (scrypt) + um padrão de gesto (grade 3x3) no
 * lugar do TOTP, com rate limit antes de tudo e trilha de auditoria depois de
 * tudo.
 *
 * DECISÃO DO FELIPE: o gesto substitui só o TOTP, não os três fatores — ver o
 * trade-off de segurança documentado em src/lib/adm/gesto.ts. O gesto
 * normalizado passa pelo MESMO scrypt (gerarHash/verificarSenha) que já
 * protegia a senha.
 *
 * runtime 'nodejs' NÃO é decoração: scrypt e HMAC vêm de node:crypto, que não
 * existe no runtime Edge. force-dynamic porque a rota lê headers e escreve
 * cookie — nada aqui pode ser cacheado por engano.
 *
 * O QUE ESTE HANDLER **NÃO** FAZ, de propósito:
 * - códigos de recuperação (ADM_RECOVERY_HASHES). password.ts tem
 *   verificarCodigoRecuperacao(), mas ele só é seguro com o consumo marcado em
 *   `auditoria.adm_recovery_usados`; sem esse registro o código vira um segundo
 *   fator PERMANENTE, que é o oposto de uso único. Fica para quando a tabela e a
 *   RPC de consumo existirem.
 * - "manter conectado". A caixinha do /katmandu troca segurança por
 *   conveniência; aqui o preço do cookie vazado é a base inteira.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DESTINO_SUCESSO = '/adm/carteira';
const DESTINO_LOGIN = '/adm/login';

function paraLogin(origem: string, parametros: Record<string, string>): NextResponse {
  const url = new URL(DESTINO_LOGIN, origem);
  for (const [chave, valor] of Object.entries(parametros)) url.searchParams.set(chave, valor);
  const resposta = NextResponse.redirect(url, 303);
  resposta.headers.set('Cache-Control', 'no-store');
  return resposta;
}

export async function POST(request: Request) {
  const inicio = Date.now();
  const url = new URL(request.url);
  const origem = url.origin;
  const ip = extrairIp(request.headers);
  const userAgent = extrairUserAgent(request.headers);

  if (!mesmaOrigem(request, url)) {
    await aplicarPisoDeLatencia(inicio);
    return new NextResponse('Origem inválida.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // Corpo que não é formulário: alguém sondando a rota, não o formulário da
    // tela. Mesma resposta genérica, mesmo piso de latência.
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(origem, { erro: 'credenciais' });
  }

  const usuario = String(form.get('usuario') ?? '').trim();
  const senha = String(form.get('senha') ?? '');
  const gestoDigitado = String(form.get('gesto') ?? '').trim();

  /** Encerra a tentativa: registra, iguala o tempo de resposta e volta ao login. */
  const encerrarComFalha = async (
    erro: 'credenciais' | 'bloqueado' | 'config',
    motivo: MotivoTentativa,
    extras: Record<string, string> = {},
  ): Promise<NextResponse> => {
    await registrarAcesso('login_falha', {
      // Sem sid porque não houve sessão. O login DIGITADO fica fora do log de
      // propósito: é dado de identificação e, numa varredura de dicionário,
      // vira lixo com PII de terceiros dentro da trilha.
      ip,
      userAgent,
      detalhes: { motivo },
    });

    // 'bloqueado' NÃO vai para a tabela do rate limit. avaliarBalde() conta o
    // bloqueio a partir da ÚLTIMA falha registrada: gravar as tentativas que já
    // chegaram barradas empurraria o fim do bloqueio para frente a cada POST, e
    // quem estivesse martelando manteria o Felipe trancado para fora sem nunca
    // acertar. O ataque aparece na auditoria; o que ele não pode ter é o
    // controle do relógio do lockout.
    if (motivo !== 'bloqueado') {
      await registrarTentativa({ ip, usuario, sucesso: false, motivo });
    }

    await aplicarPisoDeLatencia(inicio);
    return paraLogin(origem, { erro, ...extras });
  };

  // ── 1. Rate limit ──────────────────────────────────────────────────────────
  // Antes de qualquer trabalho caro: uma verificação de senha custa ~100 ms e
  // ~33 MB de RAM, e quem já está bloqueado não pode consumir isso da lambda.
  const bloqueio = await verificarBloqueio(ip, usuario);
  if (bloqueio.bloqueado) {
    return encerrarComFalha('bloqueado', 'bloqueado', { espera: String(bloqueio.esperaSegundos) });
  }

  // ── 2. Configuração ────────────────────────────────────────────────────────
  // FALHA FECHADA. Sem o gesto configurado o terceiro fator não teria como ser
  // conferido — e "seguir em frente só com a senha" seria exatamente o bug que
  // esse terceiro fator existe para impedir. Sem configuração, ninguém entra.
  const usuarioEsperado = (process.env.ADM_USUARIO ?? '').trim();
  const hashSenhaEsperado = process.env.ADM_PASSWORD_HASH;
  const hashGestoEsperado = process.env.ADM_GESTO_HASH;
  if (!usuarioEsperado || !decomporHash(hashSenhaEsperado) || !decomporHash(hashGestoEsperado)) {
    console.error('[adm] login indisponível: ADM_USUARIO, ADM_PASSWORD_HASH ou ADM_GESTO_HASH ausente/inválido');
    return encerrarComFalha('config', 'config');
  }

  // ── 3, 4 e 5. Usuário, senha e gesto ───────────────────────────────────────
  // Os três são conferidos SEMPRE, sem saída antecipada: cada `return` no meio
  // do caminho é um degrau de tempo mensurável de fora.
  const usuarioConfere = igualdadeConstante(usuario.toLowerCase(), usuarioEsperado.toLowerCase());

  // Hash null quando o usuário não confere — verificarSenha roda o scrypt do
  // mesmo jeito e devolve false. Sem isso, "usuário inexistente" responderia em
  // 2 ms contra ~100 ms do usuário certo, e o cronômetro viraria um oráculo de
  // qual login existe.
  const senhaConfere = await verificarSenha(senha, usuarioConfere ? hashSenhaEsperado : null);

  // normalizarGesto devolve null para traço curto demais ou com ponto
  // repetido; vira string vazia, que verificarSenha já trata com o mesmo custo
  // de tempo de uma verificação real — o traço malformado não responde mais
  // rápido que o errado.
  const gestoNormalizado = normalizarGesto(gestoDigitado) ?? '';
  const gestoConfere = await verificarSenha(gestoNormalizado, usuarioConfere ? hashGestoEsperado : null);

  if (!usuarioConfere || !senhaConfere || !gestoConfere) {
    // O motivo interno é fino — é o que permite ler a auditoria e distinguir "o
    // Felipe errou a senha" de "alguém está varrendo logins". O que volta para a
    // tela é sempre o mesmo 'credenciais': a mensagem nunca diz qual fator caiu.
    const motivo: MotivoTentativa = !usuarioConfere ? 'usuario' : !senhaConfere ? 'senha' : 'gesto';
    return encerrarComFalha('credenciais', motivo);
  }

  // ── 6. Sessão ──────────────────────────────────────────────────────────────
  // `sub` é o valor CANÔNICO do ambiente, não algo digitado: assim o ator da
  // auditoria e a allowlist do guard comparam sempre a mesma string.
  const sessao = criarSessao(usuarioEsperado);
  const valorCookie = assinarSessao(sessao);
  if (!valorCookie) {
    // Único motivo possível: ADM_SESSION_SECRET ausente ou com menos de 32
    // caracteres. Checar aqui, e não junto do resto da configuração, mantém o
    // custo de tempo do caminho de sucesso idêntico ao de falha.
    console.error('[adm] ADM_SESSION_SECRET ausente ou curto demais — sessão não assinada');
    await registrarAcesso('login_falha', { ip, userAgent, detalhes: { motivo: 'config' } });
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(origem, { erro: 'config' });
  }

  // Auditoria com await, antes de responder: na Vercel a lambda pode ser
  // congelada assim que a resposta sai, e uma promessa solta some sem gravar.
  await registrarAcesso('login_ok', { sid: sessao.sid, ip, userAgent });
  await registrarTentativa({ ip, usuario: usuarioEsperado, sucesso: true, motivo: 'ok' });
  await aplicarPisoDeLatencia(inicio);

  const resposta = NextResponse.redirect(new URL(DESTINO_SUCESSO, origem), 303);
  resposta.headers.set('Cache-Control', 'no-store');
  // opcoesCookie(): httpOnly, secure, sameSite 'strict', path '/adm' e maxAge
  // colado no menor dos dois prazos da sessão. Os atributos vêm de auth.ts, e
  // não repetidos aqui, porque login e logout PRECISAM ser idênticos — atributos
  // divergentes fazem o navegador guardar dois cookies de mesmo nome, e esse bug
  // é invisível.
  resposta.cookies.set(ADM_COOKIE, valorCookie, opcoesCookie(sessao));
  return resposta;
}
