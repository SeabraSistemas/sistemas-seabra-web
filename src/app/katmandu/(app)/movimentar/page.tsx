import { MovimentarView } from '@/components/katmandu/MovimentarView';
import { getRebanho } from '@/lib/katmandu/queries';
import { getLocais, getLotes } from '@/lib/katmandu/mutations';

export default async function KatmanduMovimentarPage() {
  const [animais, locais, lotes] = await Promise.all([getRebanho(), getLocais(), getLotes()]);
  return <MovimentarView animais={animais} locais={locais} lotes={lotes} />;
}
