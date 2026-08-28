import { LoteView } from '@/components/katmandu/LoteView';
import { getPesagem } from '@/lib/katmandu/queries';

export const revalidate = 60;

export default async function KatmanduLotePage() {
  const registros = await getPesagem();
  return <LoteView registros={registros} />;
}
