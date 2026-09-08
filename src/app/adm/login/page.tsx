import { notFound, redirect } from 'next/navigation';
import { GradeGesto } from '@/components/adm/GradeGesto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAdmSession } from '@/lib/adm/guard';
import { decomporHash } from '@/lib/adm/password';

/**
 * Login do /adm — três fatores: usuário, senha (scrypt) e um padrão de gesto
 * numa grade 3x3 no lugar do TOTP. Decisão do Felipe: só ele usa o painel, e
 * um traço memorizado é mais rápido no dia a dia do que abrir o autenticador
 * — ver src/lib/adm/gesto.ts para o porquê e o trade-off assumido.
 *
 * TELA DELIBERADAMENTE MUDA, de propósito: sem título, sem rótulo em campo,
 * sem texto explicando o que é cada coisa. Só quem já sabe usa este painel —
 * cada palavra a mais na tela era uma pista a menos escondida de quem não
 * devia estar aqui. As três respostas ainda vêm SEMPRE conferidas, sem saída
 * antecipada (ver api/login/route.ts): a tela ficou muda, a defesa não.
 *
 * SERVER COMPONENT COM FORM QUASE PURO — POST direto para /adm/api/login,
 * sem fetch, sem estado de submit. A ÚNICA peça client é `<GradeGesto>`, que
 * captura o traço com o dedo/mouse e preenche um `<input type="hidden">`
 * antes do submit nativo do form.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Mesma mensagem para os três fatores errados, de propósito: um texto
 * diferente por campo transformaria a tela num oráculo ("este usuário
 * existe", "a senha estava certa, faltou o gesto"). Bloqueio e configuração
 * são as únicas exceções — não dizem nada sobre qual credencial está certa.
 */
const ERROS: Record<string, string> = {
  credenciais: 'Não confere.',
  bloqueado: 'Bloqueado. Tente mais tarde.',
  config: 'Falta configuração.',
};

function formatarEspera(bruto: string | undefined): string | null {
  const segundos = Number.parseInt(bruto ?? '', 10);
  if (!Number.isFinite(segundos) || segundos <= 0) return null;
  return segundos < 60 ? `${segundos}s` : `${Math.ceil(segundos / 60)}min`;
}

/**
 * Envs sem as quais o login é IMPOSSÍVEL. Faltando qualquer uma, o formulário
 * nem é oferecido — melhor um aviso técnico (só em dev) do que um POST que
 * sempre devolve "não confere" e faz o Felipe duvidar da própria senha.
 */
function envLoginFaltando(): string[] {
  const faltando: string[] = [];
  if ((process.env.ADM_SESSION_SECRET ?? '').length < 32) faltando.push('ADM_SESSION_SECRET');
  if (!process.env.ADM_USUARIO) faltando.push('ADM_USUARIO');
  if (!decomporHash(process.env.ADM_PASSWORD_HASH)) faltando.push('ADM_PASSWORD_HASH');
  if (!decomporHash(process.env.ADM_GESTO_HASH)) faltando.push('ADM_GESTO_HASH');
  return faltando;
}

export default async function AdmLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; espera?: string }>;
}) {
  // Preview da Vercel é uma URL pública com deploy de qualquer branch — 404 lá,
  // e só lá. Mesmo bloqueio em src/app/adm/(app)/layout.tsx.
  if (process.env.VERCEL_ENV === 'preview') notFound();

  const sessao = await getAdmSession();
  if (sessao) redirect('/adm/carteira');

  const { erro, espera } = await searchParams;
  const faltando = envLoginFaltando();
  const configOk = faltando.length === 0;
  const mostrarDetalhe = process.env.NODE_ENV !== 'production';

  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;
  const tempoEspera = erro === 'bloqueado' ? formatarEspera(espera) : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xs">
        {!configOk && mostrarDetalhe && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center font-mono text-xs text-destructive">
            {faltando.join(' · ')}
          </p>
        )}

        <form action="/adm/api/login" method="POST" className="flex flex-col items-center gap-3">
          <Input
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
          <Input
            name="senha"
            type="password"
            autoComplete="current-password"
            maxLength={200}
            required
            disabled={!configOk}
          />

          <GradeGesto disabled={!configOk} />

          {mensagemErro && (
            <p className="text-center text-sm text-destructive">
              {mensagemErro}
              {tempoEspera && ` (${tempoEspera})`}
            </p>
          )}

          <Button type="submit" disabled={!configOk} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
