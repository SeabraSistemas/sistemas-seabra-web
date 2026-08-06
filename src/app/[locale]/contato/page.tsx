import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { ContactForm } from '@/components/ContactForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });

  return {
    title: `${t('title')} | Seabra Solutions`,
    description: t('subtitle'),
  };
}

export default async function ContatoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const tWhatsapp = await getTranslations({ locale, namespace: 'whatsapp' });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(tWhatsapp('defaultMessage'))}`;

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
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto mb-16">
          {/* WhatsApp */}
          <Card className="border-border hover:border-[#25D366]/50 transition-colors hover:shadow-md">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-[#25D366]" />
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
                <Button className="rounded-full gap-2 w-full bg-[#25D366] hover:bg-[#20BA5C] text-background">
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
                  felipeseabracl@gmail.com
                </p>
              </div>
              <a href="mailto:felipeseabracl@gmail.com">
                <Button variant="outline" className="rounded-full gap-2 w-full">
                  {t('emailButton')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
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
