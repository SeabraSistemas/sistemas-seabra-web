import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAdmSession } from '@/lib/adm/guard';
import { decomporHash } from '@/lib/adm/password';
import { envFaltando } from '@/lib/adm/supabase-admin';
import { totpConfigurado } from '@/lib/adm/totp';

/**
 * Login do /adm. Server Component com FORM PURO — POST direto para
 * /adm/api/login, sem 'use client', sem fetch, sem estado.
 *
 * POR QUE SEM JAVASCRIPT (o mesmo padrão do /katmandu)
 * A tela que guarda a base inteira é a que menos deve depender de JS: o
 * navegador já sabe enviar formulário, guardar senha no gerenciador e preencher
 * o código do autenticador. Um componente cliente aqui só acrescentaria
 * superfície (estado da senha em memória do browser, handler de submit) sem
 * ganhar nada — e um erro de hidratação viraria "não consigo entrar".
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Mensagens que o usuário vê. `credenciais` cobre usuário errado, senha errada
 * E código errado DE PROPÓSITO: um texto diferente por fator transforma a tela
 * num oráculo ("este login existe", "a senha estava certa, faltou o TOTP") e
 * entrega ao atacante exatamente o mapa de por onde continuar. As duas exceções
 * não dizem nada sobre credencial nenhuma: bloqueio é estado do rate limit e
 * configuração é problema do servidor — esconder essas duas só faria o Felipe
 * digitar a senha certa dez vezes achando que errou.
 */
const ERROS: Record<string, string> = {
  credenciais: 'Credenciais inválidas.',
  bloqueado: 'Muitas tentativas. O login está bloqueado temporariamente.',
  config: 'Login indisponível: falta configuração no servidor.',
};

function formatarEspera(bruto: string | undefined): string | null {
  const segundos = Number.parseInt(bruto ?? '', 10);
  if (!Number.isFinite(segundos) || segundos <= 0) return null;
  return segundos < 60 ? `${segundos} s` : `${Math.ceil(segundos / 60)} min`;
}

/**
 * Envs sem as quais o login é IMPOSSÍVEL — e não apenas degradado. Faltando
 * qualquer uma, o formulário nem é oferecido: melhor uma tela que explica do
 * que um POST que sempre devolve "credenciais inválidas" e faz o operador
 * duvidar da própria senha.
 *
 * O piso de 32 caracteres do segredo repete a regra de src/lib/adm/auth.ts
 * (segredo curto não é segredo). A duplicação é deliberada: auth.ts não exporta
 * esse teste, e a tela precisa saber ANTES do POST se o login pode acontecer.
 */
function envLoginFaltando(): string[] {
  const faltando: string[] = [];
  if ((process.env.ADM_SESSION_SECRET ?? '').length < 32) faltando.push('ADM_SESSION_SECRET');
  if (!process.env.ADM_USUARIO) faltando.push('ADM_USUARIO');
  if (!decomporHash(process.env.ADM_PASSWORD_HASH)) faltando.push('ADM_PASSWORD_HASH');
  if (!totpConfigurado()) faltando.push('ADM_TOTP_SECRET');
  return faltando;
}

export default async function AdmLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; espera?: string; saiu?: string }>;
}) {
  /**
   * Preview da Vercel é uma URL pública com deploy de qualquer branch. Um /adm
   * respondendo lá seria uma segunda porta para a mesma base, com metade da
   * configuração e nenhuma revisão. 404 em preview, e SÓ em preview: em
   * desenvolvimento (VERCEL_ENV indefinido) e em produção a tela existe
   * normalmente. O mesmo bloqueio está em src/app/adm/(app)/layout.tsx.
   */
  if (process.env.VERCEL_ENV === 'preview') notFound();

  // Já logado não vê tela de login — evita o clássico "entrei e continuo aqui"
  // quando o navegador reabre a aba pelo histórico.
  const sessao = await getAdmSession();
  if (sessao) redirect('/adm/carteira');

  const { erro, espera, saiu } = await searchParams;
  const faltando = envLoginFaltando();
  const configOk = faltando.length === 0;

  // Nomes de variável de ambiente são pista de stack: em produção o operador só
  // vê "falta configuração" (e o detalhe vai para o log da Vercel, via o
  // console.error do route handler). Em dev a lista aparece — é ela que faz
  // `npm run dev` numa máquina sem service_role ser uma experiência utilizável.
  const mostrarDetalhe = process.env.NODE_ENV !== 'production';

  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;
  const tempoEspera = erro === 'bloqueado' ? formatarEspera(espera) : null;

  // O painel abre sem Supabase — só abre vazio. É aviso, não impedimento: o
  // login continua liberado para conferir a própria configuração de dentro.
  const supabaseFaltando = envFaltando();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sistema Seabra
          </p>
          <h1 className="mt-2 text-3xl">Painel interno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestão da carteira do SeabraApp. Acesso restrito.
          </p>

          {saiu && !mensagemErro && (
            <p className="mt-6 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
              Sessão encerrada.
            </p>
          )}

          {!configOk && (
            <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <p className="font-medium">Login indisponível: falta configuração.</p>
              {mostrarDetalhe && (
                <p className="mt-1 font-mono text-xs leading-relaxed break-all">
                  {faltando.join(' · ')}
                </p>
              )}
            </div>
          )}

          <form action="/adm/api/login" method="POST" className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="usuario" className="text-sm text-muted-foreground">
                Usuário
              </label>
              <Input
                id="usuario"
                name="usuario"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={120}
                required
                autoFocus
                disabled={!configOk}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className="text-sm text-muted-foreground">
                Senha
              </label>
              <Input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                required
                disabled={!configOk}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="codigo" className="text-sm text-muted-foreground">
                Código do autenticador
              </label>
              {/* type="text" + inputMode numérico: com type="number" o navegador
                  desenha setas de incremento, deixa colar "1e6" e come o zero à
                  esquerda de um código como 012345. autoComplete one-time-code é
                  o que faz o iOS/Android oferecer o código do teclado. */}
              <Input
                id="codigo"
                name="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                placeholder="000000"
                required
                disabled={!configOk}
                className="text-center text-lg tracking-[0.4em] tabular-nums"
              />
            </div>

            {mensagemErro && (
              <p className="text-sm text-destructive">
                {mensagemErro}
                {tempoEspera && ` Tente de novo em ${tempoEspera}.`}
              </p>
            )}

            <Button type="submit" className="mt-1" disabled={!configOk}>
              Entrar
            </Button>
          </form>
        </div>

        {supabaseFaltando.length > 0 && configOk && (
          <p className="mt-4 px-1 text-xs text-muted-foreground">
            Sem conexão com o banco configurada — o painel abre vazio.
            {mostrarDetalhe && <span className="font-mono"> ({supabaseFaltando.join(' · ')})</span>}
          </p>
        )}

        <p className="mt-4 px-1 text-xs text-muted-foreground">
          Todo acesso a dados de cliente fica registrado na trilha de auditoria.
        </p>
      </div>
    </div>
  );
}
