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
- 46 commits locais (o "21" de versões antigas deste doc estava desatualizado)
  **+ diff grande não commitado** de 2026-08-11 (ver lista abaixo) — perguntar
  ao usuário antes de commitar, ele não pediu ainda.
- `main` não foi tocado — o branch de redesign nunca foi mesclado nem enviado
- Ver `git log --oneline main..HEAD` para a lista completa de commits
- `git status --short` em 2026-08-11 fim de sessão: modificados —
  `apresentacao{,-es,-en}.html`, `planos{,-es,-en}.html`,
  `public/images/logo-icon.png`, `src/app/{icon,apple-icon}.png`,
  `src/app/[locale]/{layout,contato,termos,privacidade,pequenos-ruminantes}/page.tsx`
  (layout.tsx é `[locale]/layout.tsx`), `src/components/criadores/MarcaSeabra.tsx`,
  `src/components/layout/{Footer,Header}.tsx`, `src/messages/{pt,en,es}.json`;
  novos — `public/images/logo-icon.svg`, `public/images/og-cover.png`,
  `src/components/shared/AndroidIcon.tsx`, `_recebidos/` (JPEG do logo enviado
  pelo usuário, não deve ir pro commit — é só material de trabalho).

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

## O que falta (Fase 7)

1. ~~Vetorizar o logo para SVG~~ — **resolvido em 2026-08-11.** Usuário mandou
   JPEG 512×512 do ícone (sem texto, `_recebidos/logo/`) via WhatsApp/email —
   não é o vetorial original, mas "é o melhor que tenho". Vetorizado com
   `potrace` (instalado via brew) separando por camada de cor (azul/verde,
   threshold + `--invert`, `--turdsize 8`) e recombinado num SVG único:
   `public/images/logo-icon.svg`. Renderizado em 2048px sem serrilhado —
   qualidade validada. Aplicado em:
   - Favicon: `src/app/icon.png`, `src/app/apple-icon.png`,
     `public/images/logo-icon.png` (raster 1011×1011 gerado a partir do SVG)
     — trocou um ícone antigo com efeito metálico/glow verde neon (bem fora
     da linguagem do redesign) por um flat limpo.
   - `MarcaSeabra.tsx` (rodapé da vitrine de criadores) — usa `brightness-0
     invert` (vira silhueta branca) e já tem o texto "Sistema Seabra" separado
     via i18n ao lado, então trocar pelo SVG só-ícone foi seguro.
   - **Decisão consciente de NÃO tocar**: `openGraph.images`/`twitter.images`
     em `layout.tsx`, `JsonLd.tsx` (schema.org `logo`) e o card mobile do
     demo em `ProofsSection.tsx` continuam no `/images/logo.png` raster
     antigo (ícone colorido + texto "Seabra" embutido). Usuário disse
     "deixe como está" — só queria o favicon mesmo.
2. ~~Melhorar os 6 HTMLs de apresentação~~ — **resolvido em 2026-08-11.**
   Escopo definido como "tema visual" (o usuário nunca detalhou mais que
   isso). `public/docs-seabra/{apresentacao,planos}{,-es,-en}.html`: azul
   `#1e3a5f` de template → ocre `#c8813c` como acento único + cinza neutro;
   Segoe UI → Newsreader (serifa, títulos)/Archivo (corpo) via Google Fonts
   `<link>` (arquivos são HTML estático fora do pipeline de fonts do Next);
   círculos numerados (`.step-num`, `.how-to-step .n`) viraram numeral
   serifado solto, mesma solução já adotada na `ProcessSection` da home pra
   sair do "mapa de 4 cores". Continuam em branco (documentos de
   impressão/PDF, `@media print` real) — não viraram dark mode.
   **Não tocado, é conteúdo não visual**: `planos-es.html` e `planos-en.html`
   têm comentário HTML no topo dizendo que os preços em US$ ainda precisam
   ser confirmados antes de publicar.
3. ~~Auditoria de contraste final~~ — **resolvido em 2026-08-11.** `theme-color`
   confirmado correto (`#000000` = `--surface-0`). Todos os pares de token do
   site principal (`globals.css`) e da vitrine (`--vit-*`) passam AA — só
   recalculei os números, já estavam certos desde a Fase 1; as duas exceções
   documentadas (botão WhatsApp 1,98:1, `--ink-2` não usado em lugar nenhum)
   seguem como estavam. **Achado real**: os 6 HTMLs de apresentação/planos
   (item 2 acima) tinham falha de AA introduzida nesta mesma sessão — o ocre
   portado do fundo escuro pro fundo branco sem recalcular dava só 3,15:1
   (precisa 4,5:1 pra texto normal). Corrigido com `--ocre-text: #9f652d`
   (4,80:1, mesma matiz) aplicado em texto pequeno sobre ocre (legenda de
   economia, "Mais completo", checkmarks, botões idioma/WhatsApp/CTA — só
   ficou `--ocre` puro onde é numeral grande 26-32px ou glifo decorativo,
   que passam no limiar de 3:1). `--ink-faint` também escurecido (`#8f8f8f`
   → `#707070`) pelo mesmo motivo.
   **Achado à parte, não é falha de contraste** (passa 8-10:1, mas é cor fora
   da paleta ocre/neutro): `ContactForm.tsx` e
   `blog/[slug]/opengraph-image.tsx` usam verde esmeralda (`#34d399` e
   gradiente `#064e3b`→`#047857`) — na real é o mesmo `--vit-green` já
   deliberado na vitrine (Fase 6), não bagunça, mas ainda destoa do resto do
   site fora da vitrine. Perguntei ao usuário se queria alinhar — ele disse
   "tudo certo", ficou como está por decisão dele, não pendência.
4. ~~OG image~~ — **resolvido em 2026-08-11.** Card novo em
   `public/images/og-cover.png` (1200×630): ícone vetorizado (o mesmo SVG do
   item 1) + "Seabra" em Newsreader + traço ocre + tagline "Tecnologia para
   pecuária de precisão", gradiente quase-preto igual ao resto do site. Fontes
   reais baixadas do Google Fonts (Newsreader SemiBold, Archivo Medium/Bold)
   e usadas via PIL — não são as mesmas do `next/font` do app, mas visualmente
   idênticas. `layout.tsx`: `openGraph.images` e `twitter.images` trocados de
   `/images/logo.png` pra `/images/og-cover.png`. **Não tocou** `logo.png` em
   si nem os outros lugares que o usam (JsonLd, MarcaSeabra antes da troca do
   item 1, ProofsSection mobile).

Com isso a **Fase 7 está inteiramente concluída** (os 4 itens).

## Pendências que dependem do usuário (não travam nada, mas destravam mais)

- ~~Fotos de campo~~ — **resolvido em 2026-08-25**, ver seção própria abaixo.
- ~~Link do APK~~ — **resolvido em 2026-08-11**, ver seção "Header: dropdown
  Entrar" abaixo.
- **Referência de logos de clientes** estilo OpenAI: usuário disse que ia mandar
  um exemplo — acabou não sendo necessário porque a técnica de silhueta mono
  resolveu bem sem precisar dessa referência, mas registrar caso ele volte a
  mencionar.
- **Preços em US$ nos HTMLs de planos ES/EN** (item 2 da Fase 7) — confirmar
  antes de publicar. Ainda pendente.

## Fotos de campo, carrossel de funcionalidades e logos — 2026-08-25

Retomado o assunto pausado em 2026-08-11 (ver seção antiga abaixo, mantida
por histórico). Decisão final, na prática: o slot único "hero" virou um
**carrossel de 9 funcionalidades** (`FieldPhotoCarousel.tsx`, novo
componente — mesmo padrão do `FieldPhoto`, mas com pontos de navegação,
setas prev/next com `stopPropagation` e autoplay que reinicia o timer a
cada troca manual). Cada imagem foi feita pelo usuário fora do site
(composição ícone + captura de tela do app + fundo), **não** no estilo
clean que eu tinha recomendado — usuário optou por manter o estilo
"marketing" (mockup de celular, cor de marca própria) mesmo depois de eu
sinalizar a divergência com o resto do redesign; decisão dele, registrada.
Arquivos em `public/images/campo/`, referenciados em `heroCarousel` dentro
de `src/data/fotos.ts`.

Os outros 3 slots de foto única também foram preenchidos: **Sistemas**
(16:9, foto real de ordenha com mockups do app sobrepostos, mandada pelo
usuário), **Serviços** (4:3, foto real de consultoria/avaliação com leitor
RFID) e **Sobre** (4:5, foto real do Felipe no curral — teve 2 candidatas,
optou pela com menos distorção de lente).

Card "Produtos" da `SegmentsSection` também virou carrossel — 3 produtos
(microchip, leitor portátil, leitor bastão) recortados com transparência
real a partir dos PNGs de estúdio já existentes em `public/images/produtos/`
(scripts ad-hoc, ver histórico de conversa — não fazem parte do build),
salvos em `public/images/produtos/transparent/`. `FieldPhotoCarousel` ganhou
um modo `fit="contain"` pra esse caso (produto isolado sobre fundo do card,
em vez de foto full-bleed).

**Achado de bug durante o trabalho**: os 3 cards de pilares
(Sistemas/Serviços/Produtos) tinham texto real sobreposto à foto via um véu
simples — quando a foto era clara no canto onde o texto cai, ficava difícil
de ler. `FieldPhoto` ganhou prop `veil` (`'soft'` padrão, `'band'` pros
pilares) — faixa na cor do card (`--card`) subindo da base em vez de
gradiente pra preto puro.

**Logos de parceiros**: 6 novos adicionados ao carrossel de `LogosSection`
(Dinâmica, Gregianin, Casa Bianchi, Cabanha Umari, Gran Sierra, e mais um
via script — total 15 logos agora). Dois deles (Umari, Gran Sierra) exigiram
tratamento diferente dos outros: são arte clara dentro de um círculo escuro,
então a máscara mono é pela luminância (extrai só o que é claro) em vez da
distância até o branco — senão o círculo virava um disco sólido e engolia o
desenho.

## Demo ao vivo (ProofsSection) — desbloqueado em 2026-08-25

Ver seção antiga abaixo pro histórico completo da investigação. Retomado e
fechado nesta sessão:

1. Rodado o `INSERT` em `assinaturas` que estava pendente (linha "Pro
   perpétuo" pro `usuario_id=12057`) — direto no Supabase, via MCP
   read-only pra conferir + SQL Editor do Dashboard pra escrever (accesso de
   escrita via MCP fica bloqueado pelo classificador do modo automático,
   mesmo read-only liberado).
2. Senha da conta demo trocada (`Seabra#Demo2026`) e `.env.local` preenchido
   com `DEMO_USER_EMAIL`/`DEMO_USER_PASSWORD`.
3. **Bug real encontrado**: o parser de `.env` do Next.js corta o valor no
   primeiro `#` sem espaço antes — a senha virava só `"Seabra"` (6
   caracteres) silenciosamente, e a rota engolia o erro sem logar nada.
   Corrigido colocando a senha entre aspas no `.env.local`
   (`DEMO_USER_PASSWORD="Seabra#Demo2026"`) e adicionado
   `console.error` em `api/demo-session/route.ts` no branch de erro — sem
   isso, esse tipo de falha fica invisível de novo no futuro.
4. Testado ponta a ponta via curl direto na rota — `access_token`/
   `refresh_token` voltando certo, HTTP 200.

**Trava de navegação do demo — achada e revisada, mas no repo do
`seabra-app-main`, não deste site.** O usuário lembrava de uma trava que
impedia o visitante de "vasculhar" o app livremente — existia
(`DemoGatedShell` + `demoOpenPaths` em `demo_gated_routes.dart`), mas tinha
sido **desativada sem querer** num commit de 08/05/2026 sobre uma feature
totalmente diferente (`main.dart` comentado). Revisada e realinhada com o
usuário telas a tela (allowlist ficou menor que a original de abril — só
Nascimento/Venda/Óbito/Aborto + menu de Reprodução + Rebanho + Visitas;
Controle Leiteiro em diante saiu, sublistagens de Reprodução saíram) e
religada, mais um guard novo pro botão de sincronizar (que é ação, não rota,
então o gate por rota não alcançava). Testes em `test/demo_mode/` também
atualizados pra não quebrarem sozinhos. Detalhe pra não perder: religar o
`DemoGatedShell` direto (só descomentar) teria apagado o `ShellAtualizacao`/
`AppBottomSafeArea` que foi adicionado depois de abril — teve que compor os
dois, não substituir.

Ficou pendente, de propósito, fora desta rodada: um mecanismo de "deixa
rolar um pouco antes de travar" pro Dashboard e pro Menu (scroll-gate) —
não existe em lugar nenhum do app ainda, é mecanismo novo, não só ajuste de
allowlist. Se for fazer, é sessão própria no repo do app.

## Header: dropdown "Entrar" + link do APK resolvido — 2026-08-11

Pedido do usuário: imitar o padrão da OpenAI/Codex — um clique em "Entrar"
abre um menu com as opções, em vez de botões soltos competindo no header.
Resolveu de quebra uma lacuna real: `/planos` e `/apresentacao` (recém
redesenhadas na Fase 7) não tinham **nenhum link** em lugar nenhum do header.

**`src/components/layout/Header.tsx`**: os dois botões antigos (`Entrar`
outline + `Baixar o app` condicional) viraram um único botão "Entrar" com
`DropdownMenu` (mesmo componente já usado em Sistemas/Serviços — nada novo),
4 itens: Acessar pelo navegador → `APP_URL`; Baixar o app → `APK_URL`
(continua condicional, `{APK_URL && (...)}`); separador; Ver planos → `/planos`;
Apresentação → `/apresentacao`. Repetido no Sheet mobile (os 2 botões de
acesso continuam visíveis diretamente, sem dropdown aninhado — não faz
sentido dropdown dentro de sheet; só os links de planos/apresentação foram
adicionados embaixo). Chaves i18n novas em `pt/en/es.json`: `header.accessWeb`,
`header.viewPlans`, `header.presentation` (`header.downloadApp` já existia,
reaproveitada).

**Link do APK, resolvido de vez.** O repo `seabra-app-main` já tem um workflow
(`​.github/workflows/release-apk.yml`) que publica cada release em
`uniatrix/seabra-app-releases` (repo público) com o arquivo **sempre chamado
`seabra-app.apk`** e marcado `--latest`. Isso significa que existe uma URL
permanente do GitHub que nunca precisa trocar, mesmo quando saem versões
novas — o app já usa essa mesma URL internamente
(`lib/app_constants.dart`). Testada e confirmada ao vivo (resolve pra v1.9.0
no momento da checagem):

```
NEXT_PUBLIC_APK_URL=https://github.com/uniatrix/seabra-app-releases/releases/latest/download/seabra-app.apk
```

Adicionada ao `.env.local` (gitignored). **Falta**: a mesma variável no
ambiente de produção (Vercel) quando for a hora de publicar — não é algo pra
fazer agora, só não esquecer.

**Ícone Android.** Não existe no lucide-react (é ícone genérico, não de
marca). Baixado o SVG oficial do simple-icons
(`cdn.jsdelivr.net/npm/simple-icons/icons/android.svg`) e empacotado em
`src/components/shared/AndroidIcon.tsx`, mesmo padrão do `WhatsAppIcon.tsx`
já existente. Substituiu o `Download` genérico do lucide-react nos 3 lugares
do botão "Baixar o app" (dropdown desktop, sheet mobile, hero de pequenos
ruminantes — ver abaixo).

**Armadilha encontrada nesta sessão, registrar:** `curl` não serve pra
validar conteúdo de dropdown/menu interativo (Radix só monta o
`DropdownMenuContent` no DOM depois de clique real do usuário) — bati nisso
tentando confirmar o botão de Android por HTML estático e cheguei a suspeitar
de bug na env var (cheguei a instrumentar com `console.log` antes de perceber
que o output do curl batia só na string de tradução JSON, não no menu de
verdade). Pra validar CTA dentro de dropdown, só clicando de fato no
navegador — ou testando um elemento sempre-visível equivalente (o hero de
pequenos ruminantes, que é Server Component sem interação, serviu de prova
válida).

**CTAs no hero de `/pequenos-ruminantes`** (pedido do usuário comparando com
a landing da iRancho, mas mantendo o visual próprio do site — ver seção
"Fotos" abaixo pro contexto completo dessa comparação): dois botões abaixo
do subtítulo, "Acessar pelo navegador" e "Baixar o app" (mesmas
`APP_URL`/`APK_URL`, chaves i18n reaproveitadas do header). **Escopo
propositalmente restrito a essa página só** — usuário disse "só pequenos
ruminantes por agora" quando perguntei se replicava pro hub de bovinos de
corte e pras 4 páginas de solução individual. Replicar depois, se aprovar o
resultado.

**Cor dos botões**: os dois nasceram com estilos diferentes (`Acessar` outline,
`Baixar o app` sólido ocre) — usuário pediu pra igualar, os dois viraram
`variant="outline"`. Aplicado no hero de pequenos ruminantes e no par
equivalente do Sheet mobile do header.

## Wordmark do header — 2026-08-11

`text-lg font-semibold` → `text-xl font-bold` no "Seabra" do header (desktop
e mobile) — usuário comparou com o wordmark da OpenAI e achou o nosso fraco
demais perto da navegação. Tamanho relativo à nav (`text-sm`) já batia com a
proporção da referência; o que faltava era peso da fonte.

## E-mail de contato trocado — 2026-08-11

`felipeseabracl@gmail.com` → `sistemaseabra@gmail.com` em 4 arquivos:
`Footer.tsx`, `contato/page.tsx`, `termos/page.tsx`, `privacidade/page.tsx`
(essa última é o contato oficial pra pedidos LGPD — usuário confirmou
explicitamente que queria em todo lugar, não só no rodapé, antes de mexer
nas páginas legais).

## Fotos de campo — discussão aberta, pausada em 2026-08-11

Usuário trouxe referência da **iRancho** (concorrente/app similar): banners
com foto real de produção + funcionalidade específica em destaque (texto +
às vezes mockup de tela do app), em vez de foto solta de clima como
`FieldPhoto` faz hoje.

Concordei com o conceito (foto real mostrando o sistema em uso é melhor que
ícone genérico) mas apontei que o *estilo* da iRancho (bloco de cor verde
saturada, caixa alta, mockup de celular com sombra) contradiz tudo que essa
sessão construiu (monocromático + ocre, serifa editorial, referência
openai.com) — recomendei manter o conceito mas executar no vocabulário visual
do site (foto desaturada como já é, título serifado nomeando a
funcionalidade, traço ocre fino, sem bloco de cor/caixa-alta/mockup-sombra).

**Perguntei 2 coisas e só recebi resposta parcial**: usuário desviou pro
assunto do botão "Entrar" no meio da pergunta sobre estilo visual, e disse só
"jájá mexemos com fotos" pra escolha entre "substitui os 5 slots atuais" vs
"seção nova separada". **Nada foi decidido ou implementado ainda** — os 5
slots de `src/data/fotos.ts` continuam exatamente como estavam (`src: null`,
briefing de clima/ambiente, sem menção a funcionalidade). Retomar perguntando
de novo as duas coisas: (1) estilo clean-do-site vs. mais-próximo-da-iRancho,
(2) substitui os slots atuais ou é seção nova. Ainda depende das fotos reais
existirem — mesmo bloqueio de sempre, sem fotos reais de campo não tem o que
compor.

## Demo ao vivo na home (ProofsSection) — investigação e trabalho parado em 2026-08-10

Ponto fora da Fase 7, aberto numa sessão de continuação: o card "Veja o sistema
na prática" da home estava caindo na tela de login do app em vez de logar
sozinho no usuário demo.

**Causa raiz (não é regressão do redesign):** `ProofsSection.tsx` e a rota
`src/app/api/demo-session/route.ts` estão intactos — o auto-login via
Supabase (`signInWithPassword` com credenciais de ambiente, tokens injetados
na URL do iframe) sempre funcionou assim. O que faltava era só
`DEMO_USER_EMAIL`/`DEMO_USER_PASSWORD` no `.env.local`, que só tinha as duas
chaves do Supabase.

**Descoberta:** a conta demo documentada (`demo@sistemaseabra.com.br`, id
`11973`) em `seabra-app-main/docs/PUBLICACAO_LOJAS/10-reviewer-demo.md` é a
**mesma cadastrada na Apple App Store Connect e no Google Play Console** para
revisores — o próprio doc do app pede para não apagá-la. Confirmado que o
Supabase deste site é o mesmo projeto (`zqrsbrqwghujggjbxjyo`).

**Decisão do usuário:** criar conta separada só para o site em vez de
reaproveitar/renomear a conta ligada às lojas. Reaproveitar os dados prontos
da propriedade 229 "Fazenda Modelo Seabra" (23 animais, visitas, produção) em
vez de popular do zero.

**Executado direto no Supabase Dashboard (SQL Editor + Auth → Users) do
projeto "Caprinos Leiteiros", produção — nada disso está em migração
versionada, só no histórico deste chat:**

1. Conta antiga (`11973`) conferida: **continua intacta**, não foi apagada
   como o usuário temia — só a senha/env vars se perderam.
2. Nova conta criada via Auth Dashboard: `demonstracaoweb@sistemaseabra.com.br`,
   uuid `8d9031e8-8152-4ea2-9659-9ba318033bdd`. Senha gerada nesta sessão,
   **não registrada aqui** (mesma norma do doc de revisores — guardar em
   cofre; se perdida, resetar em Auth → Users → esse usuário).
3. **Armadilha:** criar o usuário via Dashboard com "Auto Confirm User"
   dispara um trigger que já cria a linha em `public.usuarios` sozinho — o
   `INSERT` planejado bateu em `duplicate key value violates unique
   constraint "usuarios_email_key"`. Teve que virar `UPDATE ... WHERE email =
   ...`. Se for repetir esse processo, já esperar isso.
4. Perfil configurado por `UPDATE public.usuarios SET ... WHERE email =
   'demonstracaoweb@sistemaseabra.com.br'` → **id novo: `12057`**
   (`tipo_usuario_id=2`, `regra_de_acesso='produtor'`, `propriedade_id=229`,
   `is_demo=true`, `ativo=true`, `onboarding_finalizado=true`,
   `email_confirmado=true`).
5. `propriedades.produtor_id` da propriedade 229 **transferido de 11973 para
   12057** (`propriedades_produtor_id_fkey` é `ON DELETE CASCADE` — confirmado
   via `pg_constraint`; sem essa transferência, apagar a conta 11973 no futuro
   apagaria a propriedade e os 23 animais junto).

**Bloqueio encontrado — motivo da pausa:** login funciona, mas a conta nova
cai na tela de seleção de planos em vez do dashboard. O app **não tem hoje um
tipo de conta free/trial/demo** que passe pelo gate de assinatura sem exigir
plano — isso é diferente da flag `is_demo` (que só bloqueia escrita via os 43
triggers `demo_block_writes`, não afeta o gate de assinatura). Precisa ser
construído no SeabraApp. **Pausado a pedido do usuário em 2026-08-10** — retomar
quando ele voltar ao assunto.

**Causa exata (achada depois da pausa, ainda não aplicada):** o gate que manda
pra tela de planos é a Edge Function `asaas-check-access`
(`seabra-app-main/supabase/functions/asaas-check-access/index.ts`), chamada
por `AuthGuardWidget._checkUserStatus()`
(`lib/componentes/principal/auth_guard/auth_guard_widget.dart:579-608`). Ela
só dá bypass pra `is_tester=true` (linha 24) ou `regra_de_acesso` administrador
(34)/técnico (49) — **`is_demo` nunca é lido nesse arquivo**, só é usado pro
lado de bloqueio de escrita (as 43 triggers). A conta antiga (`11973`) passa
porque tem uma linha em `assinaturas` com `data_vencimento` e
`extensao_manual_ate = 2099-12-31` ("Pro perpétuo", ver
`docs/planos/AUDITORIA_VAZAMENTO_ACESSO_PAGO.md:76`), não por causa da flag
demo. **Não precisa criar tipo de conta novo** — é só a `12057` não ter essa
linha ainda. Fix (não aplicado, `usuario_id` não tem constraint única em
`assinaturas` — conferir se não existe linha antes de rodar):

```sql
INSERT INTO assinaturas (
  plano_id, usuario_id, status, data_inicio, data_vencimento,
  extensao_manual_ate, metodo_pagamento
) VALUES (
  10, 12057, 'ativa', now(),
  '2099-12-31 23:59:59+00'::timestamptz,
  '2099-12-31 23:59:59+00'::timestamptz,
  NULL
);
```

(`plano_id=10` = Pro, padrão atual conforme
`migrations/2026-07-21_cortesia_pro_ativo_em_vez_de_tester.sql`; schema em
`supabase/migrations/20260319_create_payment_tables.sql:19-38`.)

**Para retomar depois:**

- Rodar o `INSERT` acima (ou confirmar que já foi rodado nesta pausa).
- Verificar se a conta antiga (`11973`, credencial oficial das lojas até o
  formulário ser atualizado) ainda enxerga a propriedade 229 depois da
  transferência do `produtor_id` — item 5 acima. Suspeita é que sim, porque o
  acesso de leitura parece depender de `usuarios.propriedade_id` (inalterado
  na conta antiga), não de `propriedades.produtor_id`, mas não foi confirmado.
- `.env.local` **ainda não foi atualizado** com `DEMO_USER_EMAIL`/
  `DEMO_USER_PASSWORD` — só faz sentido depois que o bloqueio do plano for
  resolvido, senão o iframe loga mas esbarra na mesma tela de planos.
- Conta antiga (`11973`): usuário autorizou apagar/desativar, mas só depois
  da conta nova estar 100% funcional — não fazer antes de validar o item
  acima.

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
- **Dev server morre sozinho quando ocioso** (aconteceu repetidas vezes em
  2026-08-11) — se voltar depois de um tempo parado e `localhost:3000` não
  responder, é só rodar `npm run dev` de novo. Às vezes outro projeto do
  usuário (ex.: `ranove`) pega a porta 3000 primeiro — checar com
  `lsof -i :3000` antes de assumir que é este projeto respondendo.
- **Trocar variável em `.env.local` exige matar processo + `rm -rf .next` +
  reiniciar** — `next dev` só lê `.env.local` na inicialização, e o
  Turbopack pode cachear o valor antigo mesmo depois de reiniciar sem limpar
  `.next`. Aconteceu com `NEXT_PUBLIC_APK_URL` em 2026-08-11: só resolveu
  depois de matar o processo, `rm -rf .next` e subir de novo.
- **`curl` não valida conteúdo de dropdown/menu interativo** (Radix só monta
  no DOM após clique real) — ver detalhe na seção "Header: dropdown Entrar"
  acima. Pra esse tipo de componente, validar num elemento server-rendered
  equivalente ou pedir confirmação visual ao usuário.
- **Vetorização de logo sem arquivo fonte**: se precisar repetir (usuário só
  tinha JPEG, não vetorial original), o caminho que funcionou foi `potrace`
  (`brew install potrace`) + `librsvg`/`rsvg-convert` (`brew install librsvg`
  pra renderizar preview) — separar a imagem em máscaras binárias por cor
  (PIL, threshold por distância euclidiana até a cor-alvo), rodar
  `potrace --invert -s` em cada máscara (sem `--invert` o potrace traça o
  fundo em vez da forma) e recombinar os `<path>` num SVG único reaproveitando
  o `transform="translate(0,H) scale(0.1,-0.1)"` que o potrace já gera.

## Convenção de commit desta sessão

Mensagens em português, formato `tipo(escopo): resumo curto`, corpo explicando o
**porquê** (não o quê — o diff já mostra o quê). Sempre menciona o trade-off
quando existe um (ex.: contraste vs. reconhecimento de marca no botão WhatsApp).
