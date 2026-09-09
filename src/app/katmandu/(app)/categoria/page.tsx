import { AlterarCategoriaView } from '@/components/katmandu/AlterarCategoriaView';
import { getRebanho } from '@/lib/katmandu/queries';

export default async function KatmanduCategoriaPage() {
  const animais = await getRebanho();
  return <AlterarCategoriaView animais={animais} />;
}
