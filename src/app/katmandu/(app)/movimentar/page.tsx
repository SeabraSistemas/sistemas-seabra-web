import { MovimentarView } from '@/components/katmandu/MovimentarView';
import { getRebanho } from '@/lib/katmandu/queries';
import { getLocais } from '@/lib/katmandu/mutations';

export default async function KatmanduMovimentarPage() {
  const [animais, locais] = await Promise.all([getRebanho(), getLocais()]);
  return <MovimentarView animais={animais} locais={locais} />;
}
