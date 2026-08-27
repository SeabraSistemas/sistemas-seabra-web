import { Link } from '@/i18n/routing';
import { altAnimal, nomeExibivel } from '@/lib/criadores/normalize';
import { AnimalFoto } from './AnimalFoto';
import type { Animal } from '@/lib/criadores/types';

/**
 * Card do animal na grade do criador (protótipo v12): foto 4/5 com marca d'água
 * + nome (serif, 2 linhas) + "Nº · raça". SEM ícone de sexo, SEM categoria.
 */
export function AnimalCard({ animal, criadorNome }: { animal: Animal; criadorNome: string }) {
  return (
    <Link href={`/criadores/${animal.criador_slug}/${animal.animal_slug}`} className="acard">
      <AnimalFoto
        src={animal.fotos[0] ?? null}
        alt={altAnimal(animal, criadorNome)}
        blurDataURL={animal.blur_data_url}
        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 200px"
        dotsCount={animal.fotos.length}
      />
      <div className="acard-b">
        <div className="nm">{nomeExibivel(animal)}</div>
        <div className="mt">
          Nº {animal.numero}
          {animal.raca ? ` · ${animal.raca}` : ''}
        </div>
      </div>
    </Link>
  );
}
