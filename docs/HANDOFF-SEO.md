# Handoff — Deploy & SEO (sistemaseabra.com.br)

Documento de continuidade. Foco: **somente sistemaseabra.com.br**.

## Hospedagem / deploy

- App **Next.js** hospedado na **Vercel — conta do sócio** (não em `sistemaseabra@gmail.com`).
- Conectada ao repositório GitHub **`uniatrix/sistemas-seabra-web`**.
- **Deploy automático:** todo `git push origin main` dispara build + deploy na Vercel.
  → Mudanças de **código/SEO NÃO precisam do painel da Vercel**, só do git.
- **Só precisa do painel da Vercel (acesso do sócio):** variáveis de ambiente,
  domínio/DNS, integrações, logs de build.
- Host canônico: **`https://www.sistemaseabra.com.br`** (o apex sem www faz 307 → www).

## SEO técnico — estado atual (jul/2026)

Implementado e no ar:
- `src/app/sitemap.ts` → `sitemap.xml` com **hreflang** pt/es/en (blog é só pt, sem alternates).
- `public/robots.txt` com diretiva `Sitemap:`.
- JSON-LD (`src/components/seo/JsonLd.tsx`): Organization + WebSite (layout), Product
  (`/vendas/produtos`), Service (`/vendas/consultoria`), BlogPosting + BreadcrumbList (blog).
- Canonical dos posts → versão pt.
- `SITE_URL` / `metadataBase` no host canônico com www.

## Google Search Console

- Propriedade **`https://www.sistemaseabra.com.br`** (tipo "Prefixo do URL") criada na
  conta **`sistemaseabra@gmail.com`**.
- Verificação por **meta tag**, com o token **embutido no código** em
  `src/app/[locale]/layout.tsx` → `metadata.verification.google`
  (fallback hardcoded; a env var `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, se definida na
  Vercel, tem prioridade). Não depende do painel da Vercel.
- Sitemap a submeter no Search Console: `sitemap.xml`.

## Pendências que dependem do sócio (painel Vercel)

1. **(Opcional)** mover o token de verificação para a env var
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (hoje funciona sem isso, via fallback no código).
2. **GA4:** quando houver o *Measurement ID* (`G-XXXX`), ligar no site (mudança de código,
   auto-deploy via git) — não precisa do painel da Vercel, só do ID.
3. Conferir domínio/redirect na Vercel (já funciona: apex 307 → www).

## Como continuar (fluxo)

- Mudança de código/SEO → editar o repo e `git push origin main` → deploy automático.
- Config de infra (env vars/domínio) → painel da Vercel (conta do sócio).
