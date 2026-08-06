'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const solutions = [
  { href: '/pequenos-ruminantes', key: 'smallRuminantsHub' },
  { href: '/solucoes/caprinos/leite', key: 'goatDairy' },
  { href: '/solucoes/caprinos/corte', key: 'goatBeef' },
  { href: '/solucoes/ovinos/leite', key: 'sheepDairy' },
  { href: '/solucoes/ovinos/corte', key: 'sheepBeef' },
  { href: '/servicos', key: 'webDev' },
  { href: '/vendas/consultoria', key: 'consulting' },
  { href: '/vendas/produtos', key: 'rfidProducts' },
];

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="relative bg-card text-muted-foreground">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container-wide py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo-icon.png"
                  alt="Seabra"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Seabra
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t('footer.description')}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center',
                    'h-10 w-10 rounded-xl',
                    'bg-secondary border border-border',
                    'text-muted-foreground hover:text-foreground',
                    'hover:border-input',
                    'transition-all duration-300'
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid gap-8 sm:grid-cols-3">
            {/* Solutions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {t('footer.solutions')}
              </h3>
              <ul className="space-y-3">
                {solutions.map((solution) => (
                  <li key={solution.href}>
                    <Link
                      href={solution.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {t(`segments.${solution.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {t('footer.company')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {t('footer.about')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {t('footer.blog')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contato"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {t('footer.contact')}
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:felipeseabracl@gmail.com"
                    className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>felipeseabracl@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/5521999366784"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>+55 21 99936-6784</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Brasil</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <Separator className="my-12" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Seabra. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/privacidade"
              className="hover:text-foreground transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/termos"
              className="hover:text-foreground transition-colors"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
