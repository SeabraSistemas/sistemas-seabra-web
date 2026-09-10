'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, ChevronDown, CalendarClock } from 'lucide-react';
import { AndroidIcon } from '@/components/shared/AndroidIcon';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AGENDA_URL, buildAgendaUrl } from '@/lib/agenda';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Navegação em três pilares. O menu antigo tinha "Serviços" (que era
 * desenvolvimento web), "Vendas" (consultoria + microchips) e "Soluções" (o
 * sistema) — três rótulos que significavam a mesma coisa para quem chega.
 *
 * Só o agrupamento mudou: nenhuma rota foi criada, movida ou renomeada.
 */
const pillars = [
  {
    labelKey: 'header.systems',
    match: ['/pequenos-ruminantes', '/bovinos-corte', '/solucoes'],
    items: [
      { href: '/pequenos-ruminantes', key: 'segments.smallRuminantsHub' },
      { href: '/bovinos-corte', key: 'segments.beefCattleHub' },
    ],
  },
  {
    labelKey: 'header.services',
    match: ['/vendas/consultoria', '/servicos'],
    items: [
      { href: '/vendas/consultoria', key: 'segments.consulting' },
      { href: '/servicos', key: 'segments.webDev' },
    ],
  },
] as const;

const directLinks = [
  { href: '/vendas/produtos', labelKey: 'header.products' },
  { href: '/criadores', labelKey: 'header.criadores' },
  { href: '/blog', labelKey: 'header.blog' },
] as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pr.sistemaseabra.com.br/';

// APK hospedado no GitHub. Enquanto não houver link, o botão de download não
// é renderizado: prometer "baixar" e entregar navegador frustra o visitante.
const APK_URL = process.env.NEXT_PUBLIC_APK_URL || '';

export function Header() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Mensagem padrão (sem UTM dinâmico) para não depender de window durante a
  // primeira renderização client — mesmo motivo do agenda.ts não ler a URL.
  const whatsappUrl = buildWhatsAppUrl({ locale });
  const agendaUrl = buildAgendaUrl({ locale, utm: { utm_content: 'header' } });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const isPillarActive = (match: readonly string[]) =>
    match.some((m) => pathname.startsWith(m));

  const handleHashClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const hash = href.split('#')[1];
      if (!hash) return;

      if (pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, '', `#${hash}`);
        }
      } else {
        e.preventDefault();
        router.push(`/#${hash}`);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    },
    [pathname, router]
  );

  const navLink = 'px-3 py-2 text-sm transition-colors rounded-full hover:text-foreground';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'py-3 bg-background/85 backdrop-blur-xl border-b border-border'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="container-wide flex items-center justify-between gap-4">
        {/* Wordmark tipográfico. O logo gráfico continua existindo como ativo
            de rodapé e material, mas fora da navegação. */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground shrink-0"
        >
          Seabra
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {pillars.map((pillar) => (
            <DropdownMenu key={pillar.labelKey}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    navLink,
                    'flex items-center gap-1.5',
                    isPillarActive(pillar.match) ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {t(pillar.labelKey)}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-1.5">
                {pillar.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm"
                    >
                      {t(item.key)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {directLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                navLink,
                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}

          <Link
            href="/#about"
            onClick={(e) => handleHashClick(e, '/#about')}
            className={cn(navLink, 'text-muted-foreground')}
          >
            {t('header.about')}
          </Link>
        </nav>

        {/* Ações */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <LanguageSwitcher />

          {/* Contato: WhatsApp sempre disponível, Agendar só com AGENDA_URL
              configurada. Um botão só em vez de dois disputando espaço com
              "Entrar" — mesmo padrão de dropdown já usado ali ao lado. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full px-5 gap-1.5">
                {t('header.contact')}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5">
              <DropdownMenuItem asChild>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm gap-2"
                >
                  <WhatsAppIcon className="h-4 w-4 text-wa" />
                  {t('header.whatsapp')}
                </a>
              </DropdownMenuItem>
              {AGENDA_URL && (
                <DropdownMenuItem asChild>
                  <a
                    href={agendaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm gap-2"
                  >
                    <CalendarClock className="h-4 w-4" strokeWidth={2} />
                    {t('agenda.cta')}
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full px-5 gap-1.5">
                {t('header.signIn')}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5">
              <DropdownMenuItem asChild>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm"
                >
                  {t('header.accessWeb')}
                </a>
              </DropdownMenuItem>
              {APK_URL && (
                <DropdownMenuItem asChild>
                  <a
                    href={APK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm gap-2"
                  >
                    <AndroidIcon className="h-4 w-4" />
                    {t('header.downloadApp')}
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {/* <a> proposital: /planos e /apresentacao são rewrites (next.config.ts)
                  para HTML estático fora do [locale], sem prefixo de idioma. O <Link/>
                  do next-intl prefixaria pt/en/es e quebraria o rewrite. */}
              <DropdownMenuItem asChild>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/planos" className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm">
                  {t('header.viewPlans')}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/apresentacao" className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-sm">
                  {t('header.presentation')}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Menu mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Seabra
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-1">
                  <Accordion type="single" collapsible className="w-full">
                    {pillars.map((pillar) => (
                      <AccordionItem
                        key={pillar.labelKey}
                        value={pillar.labelKey}
                        className="border-b-0"
                      >
                        <AccordionTrigger className="py-3 text-base hover:no-underline">
                          {t(pillar.labelKey)}
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="space-y-1 pl-2">
                            {pillar.items.map((item) => (
                              <SheetClose asChild key={item.href}>
                                <Link
                                  href={item.href}
                                  className="block py-2.5 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                  {t(item.key)}
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <div className="h-px bg-border my-2" />

                  {directLinks.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-3 text-base text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t(item.labelKey)}
                      </Link>
                    </SheetClose>
                  ))}

                  <SheetClose asChild>
                    <Link
                      href="/#about"
                      onClick={(e) => {
                        setIsOpen(false);
                        handleHashClick(e, '/#about');
                      }}
                      className="block py-3 text-base text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('header.about')}
                    </Link>
                  </SheetClose>
                </div>

                <div className="p-6 border-t border-border space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button className="w-full h-12 rounded-full gap-2 bg-wa hover:bg-wa-hover text-wa-ink">
                      <WhatsAppIcon className="h-4 w-4" />
                      {t('header.whatsapp')}
                    </Button>
                  </a>

                  {AGENDA_URL && (
                    <a
                      href={agendaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full h-12 rounded-full gap-2">
                        <CalendarClock className="h-4 w-4" strokeWidth={2} />
                        {t('agenda.cta')}
                      </Button>
                    </a>
                  )}

                  {APK_URL && (
                    <a
                      href={APK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full h-12 rounded-full gap-2">
                        <AndroidIcon className="h-4 w-4" />
                        {t('header.downloadApp')}
                      </Button>
                    </a>
                  )}

                  <a
                    href={APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button variant="outline" className="w-full h-12 rounded-full">
                      {t('header.signIn')}
                    </Button>
                  </a>

                  {APK_URL && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('header.downloadHint')}
                    </p>
                  )}

                  {/* <a> proposital: ver comentário no dropdown desktop acima —
                      são rewrites sem prefixo de locale. */}
                  <div className="flex items-center justify-center gap-4 pt-1">
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                      href="/planos"
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('header.viewPlans')}
                    </a>
                    <span className="text-border">·</span>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                      href="/apresentacao"
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('header.presentation')}
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
