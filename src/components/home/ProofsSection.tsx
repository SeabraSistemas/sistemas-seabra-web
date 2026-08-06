'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Maximize2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const DEMO_APP_URL = process.env.NEXT_PUBLIC_DEMO_APP_URL || 'https://pr.sistemaseabra.com.br';

export function ProofsSection() {
  const t = useTranslations('proofs');
  const { ref, isVisible } = useScrollAnimation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [demoSrc, setDemoSrc] = useState<string>(DEMO_APP_URL);
  const [mobileDemoHref, setMobileDemoHref] = useState<string>(DEMO_APP_URL);

  // Auto-login do usuário demo no iframe do app Flutter.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/demo-session', { method: 'POST' });
        if (!resp.ok) return;
        const data = (await resp.json()) as { access_token?: string; refresh_token?: string };
        if (cancelled || !data.refresh_token) return;
        const params = new URLSearchParams({
          demo: 'true',
          access_token: data.access_token || '',
          refresh_token: data.refresh_token,
        });
        const src = `${DEMO_APP_URL}/?${params.toString()}`;
        setDemoSrc(src);
        setMobileDemoHref(src);
      } catch {
        // silencioso — fallback mostra tela de login normal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let locked = false;
    const lock = () => {
      if (!locked) {
        document.body.style.overflow = 'hidden';
        locked = true;
      }
    };
    const unlock = () => {
      if (locked) {
        document.body.style.overflow = '';
        locked = false;
      }
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.activeElement === iframe) lock();
      }, 0);
    };
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (e.target !== iframe) unlock();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', unlock);
    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', unlock);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      unlock();
    };
  }, []);

  const centerIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    document.body.style.overflow = '';
    const rect = iframe.getBoundingClientRect();
    const headerHeight =
      document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const available = window.innerHeight - headerHeight;
    const desiredTopFromViewport =
      rect.height > available
        ? headerHeight + 20
        : headerHeight + (available - rect.height) / 2;
    const targetY = window.scrollY + rect.top - desiredTopFromViewport;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <section className="section-padding band" id="demo" ref={ref}>
      <div className="container-wide">
        <div className={`text-center space-y-4 mb-12 scroll-fade-up ${isVisible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-4">
            <h2 className="heading-2">{t('title')}</h2>
            <button
              type="button"
              onClick={centerIframe}
              aria-label={t('liveCtaTitle')}
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-[var(--ocre-hover)] transition-colors"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <p className="body-large max-w-2xl mx-auto text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div
          className={`max-w-5xl mx-auto flex justify-center scroll-fade-up scroll-fade-up-delay-2 ${
            isVisible ? 'visible' : ''
          }`}
        >
          <div className="hidden lg:flex justify-center">
            {/* Moldura escura. O conteúdo do iframe é o app real, com interface
                clara e não-tematizável — o retângulo branco é inevitável. A
                moldura o transforma em "tela de aparelho" em vez de buraco
                branco no meio da página. */}
            <div className="relative rounded-[2rem] border border-border bg-secondary p-2.5">
              <iframe
                ref={iframeRef}
                src={demoSrc}
                aria-label={t('liveCtaTitle')}
                loading="lazy"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                referrerPolicy="no-referrer"
                width={461}
                height={831}
                className="block rounded-3xl bg-white"
              />
              <button
                type="button"
                onClick={() => iframeRef.current?.requestFullscreen()}
                aria-label="Maximizar"
                className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-xl bg-popover/90 backdrop-blur-md border border-border text-popover-foreground hover:bg-popover transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <a
            href={mobileDemoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:hidden group relative aspect-4/3 rounded-3xl border border-border bg-card hover:border-input transition-colors flex flex-col items-center justify-center gap-7 p-10"
          >
            <Image
              src="/images/logo.png"
              alt="Seabra"
              width={72}
              height={72}
              className="object-contain"
            />

            <div className="text-center space-y-1.5">
              <h3 className="text-2xl">{t('liveCtaTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('liveCtaSubtitle')}</p>
            </div>

            <span className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors group-hover:bg-[var(--ocre-hover)]">
              {t('liveCtaButton')}
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}
