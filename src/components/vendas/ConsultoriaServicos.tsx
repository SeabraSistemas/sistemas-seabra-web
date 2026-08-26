'use client';

import { useTranslations } from 'next-intl';

/**
 * As dez frentes de consultoria como lista tipográfica.
 *
 * Antes eram dez cartões idênticos numa grade de cinco colunas, cada um com um
 * ícone Lucide dentro de um quadrado arredondado. Dez repetições do mesmo
 * molde não informam nada — só ocupam espaço e assinam "layout gerado". Uma
 * lista com régua fina lê como cardápio de serviços de verdade, e cabe em
 * metade da altura.
 */
const items = [
  'projetos',
  'clinica',
  'reproducao',
  'nutricao',
  'qualidadeLeite',
  'treinamentos',
  'regGenealogico',
  'avLinear',
  'melhoramento',
  'gestao',
] as const;

export function ConsultoriaServicos() {
  const t = useTranslations('vendas.consultoria.servicos');

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="max-w-2xl mb-12 space-y-4">
          <h2 className="heading-2">{t('title')}</h2>
          <p className="body-large">{t('subtitle')}</p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 max-w-5xl">
          {items.map((key) => (
            <li key={key} className="border-t border-border py-4 text-sm text-foreground">
              {t(`items.${key}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
