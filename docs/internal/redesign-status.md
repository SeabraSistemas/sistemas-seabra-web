# Redesign visual — status e handoff

> Documento de continuidade. Escrito em 2026-08-06 ao final de uma sessão longa de
> redesign, para retomar o trabalho numa conversa nova sem perder contexto.
> Plano original completo em `~/.claude/plans/wondrous-humming-quail.md` (fora do
> repo — se não existir mais, este documento é a fonte de verdade).

## Regra de ouro (não negociável)

**Tudo fica local até o usuário aprovar explicitamente.** Nenhum `git push`, nenhum
deploy, nenhuma publicação externa. O site em produção (sistemaseabra.com.br)
continua exatamente como estava antes desta sessão começar. Validação é sempre
`npm run dev` na máquina do usuário.

**Nenhuma URL muda.** As 21 rotas do site são idênticas às de antes, com atenção
especial a `/criadores/[slug]` e `/criadores/[slug]/[animal]` — terceiros linkam
essas URLs a partir dos próprios sites. Confirmado rota a rota depois de cada fase.

## Branch e estado do git

- Branch: `redesign/fase-0-higiene` (criado a partir de `main`)
- 21 commits locais, working tree limpo, nada para commitar
- `main` não foi tocado — o branch de redesign nunca foi mesclado nem enviado
- Ver `git log --oneline main..HEAD` para a lista completa de commits

## O pedido original

O site (Next.js 16 + Tailwind v4 + shadcn + next-intl, pt/en/es) "tinha cara de IA":
100% claro, azul de template SaaS (`#1d4ed8`), fonte Inter, zero fotografia de
campo, ícones decorativos repetidos, números de marketing inventados. Referência
declarada: openai.com — minimalista, sério, escuro, adaptado à realidade da
pecuária (a Sistema Seabra vende o SeabraApp, sistema de gestão de rebanho).

## O que está pronto (fases 0–6 do plano + ajustes pós-fase)

**Fase 0 — Higiene.** Utilitários CSS mortos removidos (`blur-blob`,
`animate-float`, `shine`, `bg-gradient-radial-top`). 5 componentes órfãos da
vitrine deletados. Ícone de WhatsApp, antes duplicado em 7 arquivos, unificado em
`src/components/shared/WhatsAppIcon.tsx`.

**Fase 1 — Tokens escuros.** `src/app/globals.css` reescrito com dois tiers:
primitivos (`--surface-0..3`, `--ink-0..2`, `--ocre`) e semânticos (mapeamento
shadcn). **Importante:** a rampa é cinza **neutro** (`#000000` → `#2a2a2a`), não
quente — a primeira tentativa usou cinza quente e ficou parecendo marrom/sépia,
foi corrigida no commit `453e75e`. O calor da marca vem só do acento ocre
(`#c8813c`) e das fotos, não do fundo. Tipografia: Newsreader (serifa, títulos,
via `@layer base h1,h2,h3`) + Archivo (corpo, substituiu Inter). `color-scheme:
dark` setado. `:focus-visible` usa `--ring` (senão o anel de foco do navegador
fica azul, fora da paleta).

**Fase 2 — Chrome global.** Header vira wordmark tipográfico **"Seabra"** (sem
logo gráfico) + navegação em **três pilares**: Sistemas · Serviços · Produtos
(substituindo "Serviços"/"Vendas"/"Soluções", que confundiam). CTAs: **Entrar**
(app web) + **Baixar o app** (só renderiza se `NEXT_PUBLIC_APK_URL` existir —
ainda não existe, então o botão está oculto). Footer também virou wordmark
só-texto (ajuste posterior, commit `602f879`).

**Fase 3 — Home.** Hero perdeu o painel de estatísticas inventadas
(+30%/100%/15 anos), no lugar entra uma foto de campo (`FieldPhoto`, ver abaixo).
`SegmentsSection` virou 3 cards editoriais grandes (Sistemas/Serviços/Produtos).
`ProcessSection` trocou o mapa de 4 cores por numeração serifada (01–04).

**Fase 4 — Landing/Serviços/Vendas.** ~194 hardcodes de cor migrados para tokens.
`ConsultorProfile` perdeu ícones decorativos (capelo, medalha, ✓ verde × 11) —
virou lista com régua fina. `ConsultoriaServicos` (10 cards com ícone) virou
lista tipográfica. `ServiceTiers` perdeu o mapa azul/verde/roxo, planos se
distinguem por numeração serifada.

**Fase 5 — Cauda longa + blog.** Todas as páginas restantes migradas. Blog ganhou
`.article` em globals.css (as classes `prose-*` que existiam nunca funcionaram —
`@tailwindcss/typography` não está instalado; decisão consciente não instalar,
escrito à mão sobre os tokens).

**Fase 6 — Vitrine de criadores.** A parte mais sensível (linkada por terceiros),
migrada em 3 passos isolados: **6a** renomeou os 28 tokens locais do
`vitrine.css` com prefixo `--vit-` sem mudar nenhuma cor (provado por diff de
hex antes/depois — necessário porque a vitrine sombreava `--primary` global,
ficaria azul enquanto o resto virava ocre); **6b** recoloriu para a rampa
escura; **6c** migrou `EstadoVazio`/`MarcaSeabra`/`Disclaimer` e as telas de
loading/error/not-found.

## Ajustes feitos depois da Fase 6 (pedidos do usuário revisando o resultado)

Nesta ordem cronológica:

1. **Rampa cinza quente → neutra** (commit `453e75e`) — o usuário comparou lado a
   lado com um print da OpenAI e apontou que o fundo parecia marrom.
2. **Consultoria simplificada** — removidos ícones decorativos de currículo.
3. **Botão WhatsApp**: tentei verde escuro (`#075e54`) por contraste AA, o
   usuário viu renderizado e achou pouco reconhecível como marca → **revertido**
   para verde claro `#25D366` com texto branco, decisão consciente registrada em
   comentário no token `--wa` (reprova AA 1,98:1, mas é escolha deliberada de
   reconhecimento de marca sobre a norma).
4. **Checkmarks viraram bolinhas** (`BulletDot.tsx`) em 3 listas do site (hero,
   benefícios, planos de serviço) — check colorido competia com o texto.
5. **Logos de clientes**: chip branco → **selo monocromático sem caixa**,
   técnica: extrair a forma pelo canal alfa do PNG e pintar off-white sólido,
   descartando a cor original. Script Python ad-hoc (não faz parte do build).
   3 dos 10 logos tinham fundo opaco de verdade (não transparência) e precisaram
   de chroma-key antes: Santa Rita (retângulo azul-marinho), Fazenda Campinas
   (fundo branco, puxada do Supabase Storage, salva em
   `public/images/logos/fazenda-campinas-transparent.png`), e depois os 4 ícones
   de segmento em `/pequenos-ruminantes` (caprinos/ovinos leite/corte, mesmo
   problema). Todos os `.png` mono ficam em `public/images/logos/mono/` e
   `public/images/icons/mono/`.
6. **"Seabra Solutions" → "Seabra"** em todo o site (83 ocorrências, 24
   arquivos) — metadata SEO, JSON-LD, rodapé, WhatsApp, Termos/Privacidade
   (confirmado sem CNPJ/razão social antes de mexer, é só nome de marca).
7. **4 pontos de excesso de ocre/ícone removidos**: botão circular laranja do
   ProofsSection (deletado com a função `centerIframe`), ícone do logo no
   rodapé, ícones de segmento (mono), CTAs de Landing/Vendas que ainda estavam
   `bg-primary` inteiro (miss da Fase 4, só a home tinha sido corrigida).
8. **Catálogo RFID** (`/vendas/produtos`): grid por categoria deixava o
   microchip sozinho numa grade de 3 colunas (buraco visual) → virou grid único;
   depois refinado: microchip é o único com tabela de preço (bem mais alto) →
   virou **card largo horizontal** separado, os 3 leitores ficam juntos numa
   grade pareada. Specs corrigidas: "Alcance: longo alcance (bastão)"
   (tautologia) removida; "USB" removido de dois leitores (nenhum usa USB pra
   leitura) — e o FAQ da mesma página, que contradizia isso, foi ajustado junto.
   Preço do microchip 1000+ corrigido de R$8,50 para R$8,60.
9. **5 badges perderam ícone decorativo**: Consultoria, Produtos (RFID hero),
   Desenvolvimento Web (Serviços hero), Nossos Planos (ServiceTiers), Sistema
   especializado (LandingHero — texto também saiu do hardcode pt e foi para
   i18n). Regra aplicada: ícone que informa fica (ex.: o `+` de "inclui plano
   anterior"), ícone que só decora sai.

## O que falta (Fase 7 — não iniciada)

1. **Vetorizar o logo para SVG.** Hoje é raster (`public/images/logos/logo.png`,
   458×544, bordas moles). Precisa do arquivo vetorial original do usuário —
   traçar o PNG à mão daria resultado pior que o atual. **Bloqueado no usuário.**
2. **Melhorar os 6 HTMLs de apresentação** em `public/docs-seabra/` (`/apresentacao`,
   `/planos`, 3 idiomas cada). O usuário disse "precisamos melhorar ele" mas não
   detalhou o quê além do tema visual. **Precisa de escopo do usuário.**
3. **Auditoria de contraste final** e `<meta name="theme-color">` (já setado como
   `#000000` na Fase 1, conferir se ainda é o valor certo).
4. **OG image** — hoje usa `logo.png` como fallback, mencionado no
   `MEDIA_CHECKLIST.md` como pendência.

## Pendências que dependem do usuário (não travam nada, mas destravam mais)

- **Fotos de campo**: 5 espaços reservados em `src/data/fotos.ts`
  (`FieldPhoto.tsx` mostra o briefing do que falta enquanto `src` for `null`).
  Nenhum componente precisa ser tocado — só trocar o arquivo e preencher o
  caminho. Ver `MEDIA_CHECKLIST.md` na raiz.
- **Link do APK** (`NEXT_PUBLIC_APK_URL`): sem ele o botão "Baixar o app" do
  header fica oculto. Usuário mencionou ter o link no GitHub, ainda não passou.
- **Referência de logos de clientes** estilo OpenAI: usuário disse que ia mandar
  um exemplo — acabou não sendo necessário porque a técnica de silhueta mono
  resolveu bem sem precisar dessa referência, mas registrar caso ele volte a
  mencionar.
- **Escopo dos HTMLs de apresentação** (item 2 da Fase 7 acima).

## Coisas técnicas para lembrar antes de continuar

- **Dev server**: `npm run dev`, roda em `localhost:3000`. Se editar
  `globals.css`/dados e o navegador mostrar conteúdo velho, o Turbopack às
  vezes cacheia de forma teimosa — `rm -rf .next` e reiniciar resolve (aconteceu
  uma vez nesta sessão).
- **Build de verificação**: `npm run build` — sempre rodar depois de mudanças
  estruturais, pega erro de tipo e de chave de tradução faltando (o build gera
  186 páginas estáticas; se faltar uma chave em algum dos 3 locales, quebra).
- **2 erros de lint pré-existentes**, não introduzidos por este trabalho e fora
  de escopo: `WhatsAppButton.tsx` e `CartContext.tsx`, ambos
  "Calling setState synchronously within an effect" — já existiam antes da
  sessão começar.
- **`.vitrine-scope`** (vitrine de criadores) é importado **sem `@layer`** no
  CSS — qualquer classe Tailwind nova adicionada lá dentro que toque a mesma
  propriedade que uma regra do `vitrine.css` **perde**, independente de
  especificidade. Armadilha real se alguém mexer ali sem saber disso.
- **Técnica de logo mono**: script Python ad-hoc rodado manualmente via Bash
  nesta sessão (PIL/Pillow), não é parte do pipeline do projeto. Se precisar
  gerar mono de um logo novo, o método é: extrair canal alfa → se o fundo for
  opaco de verdade (não transparência), recortar por chroma-key primeiro →
  pintar sólido numa cor off-white única (`#f5f5f5`) usando o alfa como máscara.

## Convenção de commit desta sessão

Mensagens em português, formato `tipo(escopo): resumo curto`, corpo explicando o
**porquê** (não o quê — o diff já mostra o quê). Sempre menciona o trade-off
quando existe um (ex.: contraste vs. reconhecimento de marca no botão WhatsApp).
