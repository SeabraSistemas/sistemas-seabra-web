import { PesagemView } from '@/components/katmandu/PesagemView';
import { getPesagem } from '@/lib/katmandu/queries';

export const revalidate = 60;

export default async function KatmanduPesagemPage() {
  const registros = await getPesagem();
  return <PesagemView registros={registros} />;
}
