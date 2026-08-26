'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MonitorSmartphone } from 'lucide-react';
import { formacao, experiencia } from '@/data/consultoria';

// Troque pela foto real do Felipe quando enviar (mantenha o caminho ou edite aqui).
const CONSULTANT_PHOTO = '/images/consultoria/foto_felipe.jpg';

export function ConsultorProfile() {
  const t = useTranslations('vendas.consultoria.profile');

  return (
    <section className="section-padding band">
      <div className="container-wide">
        <div className="grid gap-10 md:grid-cols-[340px_1fr] items-start max-w-5xl mx-auto">
          {/* Foto */}
          <div className="space-y-4 md:sticky md:top-28">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card">
              <Image
                src={CONSULTANT_PHOTO}
                alt={t('name')}
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{t('name')}</p>
              <p className="text-sm text-muted-foreground">{t('role')}</p>
            </div>
          </div>

          {/* Formação + Experiência + Remota.
              As listas não têm ícone: capelo, medalha e um ✓ verde repetido
              onze vezes eram decoração, e decoração repetida é o que faz o
              currículo de um profissional real ler como template. A hierarquia
              agora vem do título em serifa e de uma régua fina por item. */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl mb-5">{t('formacaoTitle')}</h2>
              <ul className="space-y-0">
                {formacao.map((f, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground border-t border-border py-3"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl mb-5">{t('experienciaTitle')}</h2>
              <ul className="space-y-0">
                {experiencia.map((e, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground border-t border-border py-3"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </div>

            {/* Este ícone fica: indica modalidade de atendimento, é informação,
                não enfeite. */}
            <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <MonitorSmartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('remotaTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('remotaDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
