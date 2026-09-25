import { SubAbas } from '@/components/sanri/SubAbas';
import { LINKS_PRODUCAO } from '@/lib/sanri/config';

/** Produção, Régua e Saídas dividem a aba "Produção" — um grupo de rotas, mesmas URLs de antes. */
export default function ProducaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <SubAbas links={LINKS_PRODUCAO} rotulo="Produção" />
      {children}
    </div>
  );
}
