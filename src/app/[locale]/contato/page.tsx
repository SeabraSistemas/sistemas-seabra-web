import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, CalendarClock, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { buildAgendaUrl, isAgendaEnabled } from '@/lib/agenda';
import type { Locale } from '@/i18n/config';
import { ContactForm } from '@/components/ContactForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });

  return {
    title: `${t('title')} | Seabra`,
    description: t('subtitle'),
  };
}

export default async function ContatoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const tWhatsapp = await getTranslations({ locale, namespace: 'whatsapp' });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(tWhatsapp('defaultMessage'))}`;

  // Sem link de agenda configurado, o card não aparece: melhor duas opções que
  // funcionam do que três com uma quebrada.
  const agendaUrl = buildAgendaUrl({ locale: locale as Locale, utm: { utm_content: 'contato' } });
  const showAgenda = isAgendaEnabled();

  return (
    <div className="section-padding">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Contact Options */}
        <div
          className={`grid gap-6 mx-auto mb-16 ${
            showAgenda ? 'md:grid-cols-3 max-w-4xl' : 'md:grid-cols-2 max-w-2xl'
          }`}
        >
          {/* WhatsApp */}
          <Card className="border-border hover:border-wa/50 transition-colors">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-wa/10 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-wa" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {t('whatsapp')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('whatsappDesc')}
                </p>
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full gap-2 w-full bg-wa hover:bg-wa-hover text-wa-ink">
                  {t('whatsappButton')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="border-border hover:border-primary/50 transition-colors hover:shadow-md">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {t('email')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  sistemaseabra@gmail.com
                </p>
              </div>
              <a href="mailto:sistemaseabra@gmail.com">
                <Button variant="outline" className="rounded-full gap-2 w-full">
                  {t('emailButton')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Agenda — Google Calendar */}
          {showAgenda && (
            <Card className="border-border hover:border-primary/50 transition-colors hover:shadow-md">
              <CardContent className="p-8 text-center space-y-6">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
                  <CalendarClock className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t('schedule')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('scheduleDesc')}
                  </p>
                </div>
                <a href={agendaUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full gap-2 w-full">
                    {t('scheduleButton')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-border shadow-sm">
            <CardContent className="p-8">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
