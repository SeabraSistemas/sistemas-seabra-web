import { redirect } from 'next/navigation';
import { PedidosPainel } from '@/components/pedidos/PedidosPainel';
import { sessaoValida } from '@/lib/pedidos/sessao';

/** Pedidos da AliExpress + estoque e baixas. Na Vercel só abre depois do login por gesto — ver src/lib/pedidos/auth.ts. */
export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  if (!(await sessaoValida())) redirect('/pedidos/login');
  return <PedidosPainel />;
}
