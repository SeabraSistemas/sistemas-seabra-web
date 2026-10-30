import { EmConstrucao } from '@/components/sanri/EmConstrucao';
import { exigirSessao } from '@/lib/sanri/sessao';

export const dynamic = 'force-dynamic';

export default async function RGDPage() {
  await exigirSessao();
  return <EmConstrucao titulo="RGD" />;
}
