import type { Metadata } from 'next';
import { Apresentador } from '@/components/apresentacao/Apresentador';
import { montarSlides } from '@/components/apresentacao/montarSlides';
import { ovinosCorte } from '@/data/apresentacoes/ovinos-corte';

export const metadata: Metadata = {
  title: 'Apresentador · Ovinos de corte',
  robots: { index: false, follow: false },
};

/**
 * Janela do apresentador (notebook): slide atual, próximo, notas e
 * cronômetro de 1 hora. Abre com a tecla P na projeção, ou direto por esta
 * rota — as duas janelas se acham pelo canal e seguem juntas.
 */
export default function ApresentadorOvinosCorte() {
  return (
    <Apresentador
      titulo={ovinosCorte.titulo}
      slides={montarSlides(ovinosCorte)}
      canal="deck:ovinos-corte"
      rotaProjecao="/apresentacao/ovinos-corte"
      duracaoMinutos={60}
    />
  );
}
