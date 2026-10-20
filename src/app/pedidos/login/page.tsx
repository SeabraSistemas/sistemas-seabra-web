import { redirect } from 'next/navigation';
import { GradeGesto } from '@/components/adm/GradeGesto';
import { Button } from '@/components/ui/button';
import { sessaoValida } from '@/lib/pedidos/sessao';

/** Tela muda de propósito (como a do /adm): a grade do gesto e o botão "Entrar", sem rótulo nem explicação. */
export const dynamic = 'force-dynamic';

const ERROS: Record<string, string> = { credenciais: 'Não confere.', bloqueado: 'Bloqueado. Tente mais tarde.', config: 'Falta configuração.' };

export default async function PedidosLogin({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await sessaoValida()) redirect('/pedidos');
  const { erro } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4">
      <form action="/pedidos/api/login" method="POST" className="flex flex-col items-center gap-3">
        <GradeGesto />
        {erro && ERROS[erro] ? <p className="text-sm text-muted-foreground">{ERROS[erro]}</p> : null}
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </main>
  );
}
