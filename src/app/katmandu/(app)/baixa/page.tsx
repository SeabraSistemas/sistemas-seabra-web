import { BaixaView } from '@/components/katmandu/BaixaView';
import { getBaixas } from '@/lib/katmandu/queries';

export default async function KatmanduBaixaPage() {
  const baixas = await getBaixas();
  return <BaixaView baixas={baixas} />;
}
