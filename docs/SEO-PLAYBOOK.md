# SEO & Divulgação — Playbook (Sistema Seabra)

Documento-mestre do trabalho de **SEO orgânico + divulgação R$0** feito no site
`sistemaseabra.com.br`. Serve para (a) referência do que existe e (b) **replicar os mesmos
padrões em outro projeto Next.js** (ex.: ABCGRAN ou novo cliente).

> Complementos: `docs/HANDOFF-SEO.md` (deploy/hospedagem) e o plano de estratégia em
> `/Users/seabra/.claude/plans/twinkly-toasting-goblet.md`.

---

## 1. Stack e premissas
- **Next.js 16** (App Router, segmento `[locale]` pt/es/en), **next-intl** (`localePrefix: 'always'`),
  Tailwind v4, deploy Vercel.
- **Orçamento R$0**, foco **pt + es**.
- **Deploy:** `git push origin main` → auto-deploy na Vercel. Mudanças de código/SEO **não**
  precisam do painel da Vercel (ver `HANDOFF-SEO.md`).

## 2. O que foi implementado (checklist)

**Técnico**
- [x] `sitemap.ts` com **hreflang** pt/es/en (via `alternates.languages`) — `src/app/sitemap.ts`
- [x] `robots.txt` com diretiva `Sitemap:` — `public/robots.txt`
- [x] Host **canônico com www** (`metadataBase` + `SITE_URL`)
- [x] Verificação **Google Search Console** (meta tag via env com fallback hardcoded) — layout
- [x] **Google Analytics 4** (`next/script`, ID público) — `src/components/analytics/GoogleAnalytics.tsx`
- [x] **Feed RSS** — `src/app/feed.xml/route.ts` (+ `alternates.types` no layout)

**Dados estruturados (JSON-LD)** — `src/components/seo/JsonLd.tsx`
- [x] `Organization` + `WebSite` (layout raiz)
- [x] `Product` + `Offer`/`AggregateOffer` com **preços reais** (`/vendas/produtos`, de `rfid-products.ts`)
- [x] `Service` (`/vendas/consultoria`)
- [x] `BlogPosting` (com `image` = card OG e `author.url` = bio) + `BreadcrumbList` (blog)
- [x] `FAQPage` (+ FAQ **visível**) — `/vendas/produtos`, dados em `src/data/produtos-faq.ts`

**Conteúdo**
- [x] Renderizador **markdown** (`react-markdown` + `remark-gfm`) no blog → negrito/links/tabelas
      (corrigiu asteriscos crus dos posts antigos)
- [x] 10 posts **answer-first** mirando funil comercial — `src/data/blog-posts.ts`
- [x] 7 posts **localizados em espanhol** (blog locale-aware) — `src/data/blog-posts-es.ts`
- [x] Imagens **OG/Twitter dinâmicas** por post — `opengraph-image.tsx` / `twitter-image.tsx`
- [x] **Linking interno bidirecional** (página→blog) — `src/components/blog/RelatedArticles.tsx`

## 3. Mapa de arquivos reutilizáveis (copiar p/ outro projeto)

| Arquivo | Papel | Como reusar |
|---|---|---|
| `src/lib/seo.ts` | `SITE_URL`, `localizedUrl`, `alternateLanguages` | copiar; trocar `SITE_URL` |
| `src/components/seo/JsonLd.tsx` | `JsonLd` genérico + Organization/WebSite | copiar; ajustar dados da entidade |
| `src/app/sitemap.ts` | sitemap + hreflang (institucional + blog) | copiar; ajustar lista de rotas |
| `src/components/analytics/GoogleAnalytics.tsx` | GA4 via gtag | copiar; trocar `G-XXXX` |
| `src/app/feed.xml/route.ts` | Feed RSS do blog | copiar |
| `src/components/blog/RelatedArticles.tsx` | seção página→blog | copiar |
| `src/app/[locale]/blog/[slug]/opengraph-image.tsx` (+ `twitter-image.tsx`) | card social por post | copiar; ajustar cores/marca |
| `src/data/produtos-faq.ts` + `FAQPage` na page | FAQ visível + schema (AEO) | padrão |
| blog locale-aware: `blog-posts-es.ts` + `getPostBySlug(slug, locale)` + `postLocales(slug)` | i18n de conteúdo com hreflang só onde há tradução | padrão |

## 4. Estratégia de conteúdo
- **Answer-first:** resposta direta de 40–60 palavras logo após cada `##` (ranqueia + é citado por
  IA / AEO).
- **Clusters + linking interno:** posts se cruzam e apontam para a **página que converte**.
- **E-E-A-T:** autor assinado com credenciais; `author.url` aponta para a bio.
- **Localização es:** traduzir os posts **universais**; pular os BR-específicos (arroba, SISBOV,
  preços em BRL). Links internos viram `/es/...`; cross-links para posts sem versão es ficam `/pt/`.

## 5. Divulgação gratuita (R$0)
Google Business Profile · parcerias/backlinks institucionais (.org.br/.gov.br) · grupos
FB/WhatsApp/Telegram · classificados (OLX/MF Rural/Mercado Livre) · YouTube + Instagram ·
portais agro com guest post · LinkedIn (B2B). Reddit tem baixa alavancagem p/ público pt.
Plano completo e palavras-chave (pt+es): `/Users/seabra/.claude/plans/twinkly-toasting-goblet.md`.

## 6. Governança de contas ⚠️ (crítico)
- **Seabra** = contas do Felipe. Conta oficial: **`sistemaseabra@gmail.com`** (GSC, GA4, GBP,
  YouTube, Instagram).
- **ABCGRAN** = cliente externo → **tudo** em **`associacaoabcgran@gmail.com`**.
- **NUNCA** usar `seabraclaude@gmail.com` (conta usada no Claude) para ativos de negócio.
- Multi-login no Chrome engana: **sempre conferir o avatar** antes de agir.

## 7. Como replicar em outro projeto Next.js
1. Copiar os arquivos da seção 3; trocar `SITE_URL`, marca, IDs e cores.
2. Montar o `sitemap.ts` com as rotas do projeto (institucionais com hreflang; blog conforme locales).
3. Adicionar `Organization` + `WebSite` JSON-LD no layout.
4. **GSC:** criar propriedade (tipo "Prefixo do URL", host **com www**) → método "Tag HTML" →
   token no código (`metadata.verification.google`, env com fallback) → **Sitemaps** → `sitemap.xml`.
5. **GA4:** criar propriedade → **fuso GMT-03:00** → pegar `G-XXXX` → ligar via o componente.
6. Conteúdo: blog answer-first + i18n locale-aware.
7. Respeitar a **governança de contas do projeto** (seção 6).

## 8. Setup manual (não é código — precisa do dono da conta)
- **GSC:** `search.google.com/search-console` → conferir o avatar da conta certa!
- **GA4:** `analytics.google.com` → Admin → Configurações da propriedade → fuso horário.

## 9. Estado / pendências (jul/2026)
- Blog: **25 posts pt + 7 es**; sitemap **83 URLs**; GA4 e GSC ativos.
- Pendências (dependem do dono): postar no Instagram (legendas prontas), enviar palavras-chave
  de campo para a próxima leva de conteúdo. Indexação: questão de tempo do Google.
