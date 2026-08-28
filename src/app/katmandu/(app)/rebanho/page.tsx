import { RebanhoView } from '@/components/katmandu/RebanhoView';
import { getRebanho } from '@/lib/katmandu/queries';

export const revalidate = 60;

export default async function KatmanduRebanhoPage() {
  const animais = await getRebanho();
  return <RebanhoView animais={animais} />;
}
