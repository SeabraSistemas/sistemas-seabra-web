'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export function ContactForm() {
  const t = useTranslations('contactPage.form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    segment: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const segments = [
    { value: 'caprinos-leite', label: t('segmentGoatDairy') },
    { value: 'caprinos-corte', label: t('segmentGoatBeef') },
    { value: 'ovinos-leite', label: t('segmentSheepDairy') },
    { value: 'ovinos-corte', label: t('segmentSheepBeef') },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const segmentLabel = segments.find((s) => s.value === formData.segment)?.label || '';

    const text = [
      `*${t('formTitle')}*`,
      `*${t('name')}:* ${formData.name}`,
      formData.email ? `*${t('email')}:* ${formData.email}` : '',
      formData.phone ? `*${t('phone')}:* ${formData.phone}` : '',
      segmentLabel ? `*${t('segment')}:* ${segmentLabel}` : '',
      formData.message ? `\n*${t('message')}:*\n${formData.message}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-2">
          <CheckCircle className="h-8 w-8 text-[#34d399]" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{t('successTitle')}</h3>
        <p className="text-muted-foreground">{t('successMessage')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', phone: '', segment: '', message: '' });
          }}
        >
          {t('sendAnother')}
        </Button>
      </div>
    );
  }

  const inputClasses =
    'w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-semibold text-foreground text-center mb-2">
        {t('formTitle')}
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {t('formSubtitle')}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            {t('name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={t('namePlaceholder')}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('emailPlaceholder')}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            {t('phone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('phonePlaceholder')}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="segment" className="block text-sm font-medium text-foreground mb-1.5">
            {t('segment')}
          </label>
          <select
            id="segment"
            name="segment"
            value={formData.segment}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">{t('segmentPlaceholder')}</option>
            {segments.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder={t('messagePlaceholder')}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-xl h-12 text-sm gap-2 bg-[#25D366] text-background hover:bg-[#20BD5A] transition-colors"
      >
        <Send className="h-4 w-4" />
        {t('submit')}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {t('disclaimer')}
      </p>
    </form>
  );
}
