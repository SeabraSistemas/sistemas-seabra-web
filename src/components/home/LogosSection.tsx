'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * Versões "mono" em public/images/logos/mono/: cada PNG original tem a cor
 * descartada e a forma (canal alfa) pintada num off-white único — mesma
 * lógica de um selo gravado, sem caixa branca por trás. Gerado por script a
 * partir dos arquivos originais em public/images/logos/, que permanecem
 * intocados (usados no rodapé e em outros lugares que preservam a cor).
 *
 * Duas logos precisaram de um passo a mais antes do alfa: Santa Rita tinha
 * um retângulo azul-marinho pintado dentro do próprio arquivo, e Fazenda
 * Campinas (puxada do Supabase Storage, é a mesma logo usada na vitrine de
 * criadores) tinha fundo branco opaco — nenhum dos dois é transparência
 * real. Para as duas, o fundo foi recortado por chroma key antes do mesmo
 * tratamento; as outras 7 foram direto.
 */
const logos = [
  { name: 'Fazenda Campinas', src: '/images/logos/mono/fazenda-campinas.png', w: 1024, h: 724 },
  { name: 'Minas Cabra', src: '/images/logos/mono/minas-cabra.png', w: 358, h: 347 },
  { name: 'Fazenda Santa Rita - Capril Sanri', src: '/images/logos/mono/santa-rita.png', w: 320, h: 174 },
  { name: 'Capril Conquista', src: '/images/logos/mono/capril-conquista.png', w: 360, h: 360 },
  { name: 'Capril do Chaparral', src: '/images/logos/mono/capril-chaparral.png', w: 607, h: 575 },
  { name: 'Capril Cerro Alto', src: '/images/logos/mono/capril-cerro-alto.png', w: 620, h: 350 },
  { name: '3 Irmãos', src: '/images/logos/mono/3-irmaos.png', w: 360, h: 360 },
  { name: 'Lá do Alto', src: '/images/logos/mono/la-do-alto.png', w: 360, h: 360 },
  { name: 'Bonito', src: '/images/logos/mono/bonito.png', w: 422, h: 380 },
];

export function LogosSection() {
  const t = useTranslations('logos');

  const duplicated = [...logos, ...logos];

  return (
    <section className="py-10 sm:py-12 overflow-hidden band">
      <div className="container-wide">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-8 font-medium">
          {t('title')}
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--surface-1)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--surface-1)] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max items-center animate-scroll-logos">
          {duplicated.map((logo, index) => (
            <div key={index} className="flex-shrink-0 mx-8 sm:mx-10 flex items-center">
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.w}
                height={logo.h}
                loading="eager"
                className="h-11 sm:h-14 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
