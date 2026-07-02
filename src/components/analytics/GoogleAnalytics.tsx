import Script from 'next/script';

// ID de métrica do GA4 (propriedade sob sistemaseabra@gmail.com). É público (aparece no HTML),
// então fica embutido como fallback — não dá pra definir env var na Vercel (conta do sócio).
// Se NEXT_PUBLIC_GA_ID existir um dia, ela tem prioridade.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-W7GRRT5X36';

/**
 * Google Analytics 4 via gtag. A "Medição avançada" do GA4 (ligada nesta propriedade)
 * cobre pageviews de navegação SPA por eventos de histórico — não precisa de wiring manual
 * de rota. Carrega após a interação para não pesar no LCP.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
