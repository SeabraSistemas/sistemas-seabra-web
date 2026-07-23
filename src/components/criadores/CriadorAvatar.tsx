import Image from 'next/image';
import { iniciais } from '@/lib/criadores/normalize';
import type { Criador } from '@/lib/criadores/types';

/**
 * Logo curado do criador (vitrine_criador.logo_url) ou avatar de iniciais.
 * SEM fallback para usuarios.foto (retrato pessoal, sem consentimento) — D15.
 */
export function CriadorAvatar({
  criador,
  size = 64,
}: {
  criador: Pick<Criador, 'logo_url' | 'criador'>;
  size?: number;
}) {
  if (criador.logo_url) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
        style={{ width: size, height: size }}
      >
        <Image
          src={criador.logo_url}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain p-1"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl bg-primary/10 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {iniciais(criador.criador)}
    </div>
  );
}
