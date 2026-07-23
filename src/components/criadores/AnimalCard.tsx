import { Link } from '@/i18n/routing';
import { altAnimal, nomeExibivel } from '@/lib/criadores/normalize';
import { AnimalFoto } from './AnimalFoto';
import { SexoBadge } from './SexoBadge';
import type { Animal } from '@/lib/criadores/types';

/** Card do animal na grade do criador. Foto 4:5 + badge de sexo + nome + Nº · raca. */
export function AnimalCard({ animal, criadorNome }: { animal: Animal; criadorNome: string }) {
  return (
    <Link
      href={`/criadores/${animal.criador_slug}/${animal.animal_slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40"
    >
      <div className="relative">
        <AnimalFoto
          src={animal.fotos[0] ?? null}
          alt={altAnimal(animal, criadorNome)}
          blurDataURL={animal.blur_data_url}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1280px) 25vw, 220px"
          className="aspect-[4/5] rounded-t-xl"
        />
        <div className="absolute bottom-2 right-2">
          <SexoBadge sexo={animal.sexo_norm} />
        </div>
      </div>
      <div className="p-3">
        <div className="line-clamp-2 min-h-[2.4em] font-serif text-sm font-medium leading-snug text-gray-900">
          {nomeExibivel(animal)}
        </div>
        <div className="mt-1 font-mono text-[11px] text-gray-500">
          Nº {animal.numero}
          {animal.raca ? ` · ${animal.raca}` : ''}
        </div>
      </div>
    </Link>
  );
}
