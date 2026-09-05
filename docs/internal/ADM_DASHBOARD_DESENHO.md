# `/adm` — Painel de gestão de clientes do SeabraApp

> Desenho técnico. Documento vivo — nada implementado ainda.
> Base: leitura de ~190 migrations, os DTOs gerados do banco vivo (`lib/backend/supabase/database/tables/`)
> e o código Dart do `seabra-app-main`, mais o chassis já existente em `/katmandu` e `/criadores`.
> Data: 04/09/2026.

## O que é

Área privada em `sistemaseabra.com.br/adm` onde o Felipe:

1. loga com usuário e senha,
2. vê a **carteira inteira** (o negócio: clientes, MRR, quem sumiu, quem cresce),
3. escolhe um cliente e abre o **dashboard completo dele** — todas as tabelas do banco em
   view de tabela, com cards e gráficos,
4. exporta o que estiver vendo em CSV, Excel ou PDF.

Fonte de dados: **Supabase do `seabra-app-main`** (as tabelas reais), não o schema `vitrine`
restrito que o `/criadores` usa, e não o Google Sheets do `/katmandu`.

**O `/adm` é o sucessor do `/katmandu`.** Com a migração dos clientes do Sheets para o Supabase,
o Katmandu vira legado — então o `/adm` precisa cobrir o que hoje só existe lá (rebanho, pesagem,
movimentação, baixa), senão a migração perde função.


## Decisões travadas pelo Felipe (04/09/2026)

| # | Decisão | Consequência no desenho |
|---|---|---|
| D1 | **"Número de usuário" = `usuarios.id`** (ex.: 11954). Não é o `numero_criador` da ABCC/ARCO nem um sequencial novo | Coluna `#` é a identidade primária da lista, copiável ao clicar. `numero_criador` fica como coluna secundária, filtrável, aceita vazia. Nenhuma coluna nova, nenhum backfill |
| D2 | **Sinal de vida = último lançamento**, não último login | Não usar a Admin API do Supabase. `adm.atividade_propriedade` vira a fonte única de recência — some a dependência do `auth.users` e o buraco dos colaboradores sem `uuid`. Reforça a prioridade nº 1 do MVP |
| D3 | **MVP é somente leitura + exportação** | Sem proxy da Edge `asaas-admin-actions` no MVP. A `service_role` só faz `SELECT` — o schema `adm` só de views passa a ser teto real, não convenção. Ações de assinatura ficam na Fase 2 |
| D4 | **PDF é peça comercial com marca**, para mandar a cliente e consultor | Não é relatório de auditoria. Muda a abordagem técnica (ver abaixo) e sobe de prioridade: é material de venda, não de conferência |

### O que D3 simplifica

Com o `/adm` só lendo, a `service_role` nunca precisa de `INSERT`/`UPDATE`/`DELETE`. Duas
consequências boas:

- as views do schema `adm` deixam de ser só uma boa prática e viram a fronteira real do que o painel
  alcança;
- some do MVP a necessidade de cunhar JWT de admin server-side para falar com a Edge Function.

A única escrita que sobra é a **trilha de auditoria** (quem abriu qual cliente), que vai para o
schema `auditoria`, fora do PostgREST.

### O que D4 muda no PDF

Peça comercial exige fidelidade de marca — a serifa editorial, a paleta terra, o logo. Isso descarta
gerar o PDF por biblioteca (`@react-pdf/renderer` obriga a reimplementar layout e gráficos, e o
resultado nunca bate com o site).

Caminho recomendado, em duas etapas:

1. **Agora:** `/adm/u/[id]/dossie` como página real, com o design do site e uma folha de estilo de
   impressão (`@media print`: quebra de página controlada, sem navegação, gráficos em tamanho fixo).
   Ctrl+P → "Salvar como PDF" produz um arquivo com fidelidade total de marca, a custo zero de
   dependência. Os gráficos são os mesmos componentes recharts da tela.
2. **Se virar rotina:** um botão que gera o arquivo pelo servidor, com Chromium headless
   (`@sparticuz/chromium` na Vercel) apontando para a mesma URL do dossiê. Mesmo HTML, mesma marca —
   só automatiza o Ctrl+P.

Fazer na ordem inversa (biblioteca primeiro) custa mais e entrega menos.

Conteúdo do dossiê a definir com o Felipe — proposta inicial: capa com identificação do criador,
retrato do rebanho, produção dos últimos 12 meses, destaques de avaliação morfológica, e uma página
de comparação com a mediana da carteira (o benchmark da Fase 3 é o que dá valor comercial à peça).

---

## 🔴 Três coisas para decidir antes de escrever código

### 1. Existe um buraco de segurança em produção, hoje, independente do `/adm`

A policy `update_own_user` em `public.usuarios` é `USING(true)` **sem `WITH CHECK`**, e
`insert_user_public` é `WITH CHECK true` para `PUBLIC`. Consequência: qualquer pessoa de posse da
anon key — que **vai dentro do APK**, ou seja, é pública — pode dar `PATCH` em qualquer linha de
`usuarios`, inclusive na própria, e se promover a `regra_de_acesso = 'administrador'`. Esse é
exatamente o predicado das policies `*_admin_all`.

Isso já está documentado no repo do app como "achado colateral CRÍTICO pré-existente"
(`docs/planos/PLANO_EVOLUCAO_TECNICO_CONSULTOR.md:178`) e é a "Fase 0.A" que ficou adiada.

Impacto no `/adm`: **não dá para usar "é administrador no banco" como o único gate de login**,
porque esse papel é auto-atribuível por qualquer um. Daí a allowlist de UUIDs em variável de
ambiente como segunda tranca.

Fechar esse buraco não é pré-requisito técnico do `/adm`, mas construir um cofre ao lado de uma
porta destrancada é estranho. Atenção: fechar exige migrar antes o login do colaborador, que hoje
depende de `select_user_public` — senão todos os colaboradores ficam trancados para fora.

### 2. O MRR que o app te mostra hoje está errado

`asaas-admin-actions/index.ts:344` soma `view_status_assinatura.valor_mensal`, que é **preço de
tabela** — ignora desconto de associação, ignora cortesia e trata plano anual como mensal.

E a correção óbvia também erra: `usuarios.valor_mensal_promocional`, apesar do nome e do próprio
comentário da coluna, guarda o valor **anual** quando `ciclo = 'anual'` (`_shared/asaas.ts:342-345`
e `:374-380`). Somar direto superestima o assinante anual em ~12×.

Fórmula honesta:

```sql
CASE WHEN a.ciclo = 'anual'
     THEN COALESCE(u.valor_mensal_promocional, p.valor_anual) / 12
     ELSE COALESCE(u.valor_mensal_promocional, p.valor_mensal)
END
```

...com `DISTINCT ON` por usuário (`assinaturas` **não tem UNIQUE por `usuario_id`**) e cortesias
(`data_vencimento >= 2090`) fora da conta.

**O número honesto vai ser menor que o que você vê hoje.** Melhor saber disso antes da tela existir.
Proposta: mostrar os dois lado a lado — "tabela R$ X · real R$ Y" — até você confiar na troca.

### 3. "Último login" quase não existe — e "último lançamento" é melhor

Não há nenhuma coluna de última atividade em `usuarios` nem em `propriedades`. Busquei no repo
inteiro: nada de `last_sign_in`, `ultimo_login`, `ultimo_acesso`.

O que existe é `auth.users.last_sign_in_at`, e ele tem dois problemas: só é acessível pela Admin API
do Supabase (uma chamada extra por carregamento da lista), e **é nulo para todo colaborador legado**,
porque `usuarios.uuid` é nulo neles.

O sinal real de vida da conta é o **último lançamento** — a data mais recente em qualquer das 8
tabelas de trabalho diário (`controle_leiteiro`, `producao_diaria`, `manejo`, `pesagem`, `rebanho`,
`venda`, `obito`, `saida_leite`). Só que calcular isso ingenuamente é `MAX(created_at)` em ~25
tabelas × 31 propriedades = 775 idas ao banco por carregamento da lista.

Solução: uma view `adm.atividade_propriedade` (`propriedade_id`, `ultimo_lancamento_em`,
`ultimo_modulo`, `lancamentos_7d/30d/90d`). **É a maior peça de backend do projeto e a primeira a
construir** — sem ela, "quem sumiu" simplesmente não existe.

---

## Arquitetura de acesso

### Login: cookie próprio, não Supabase Auth

Evolução do que o `/katmandu` já faz (`src/lib/katmandu/auth.ts`), com o que falta:

| Peça | Decisão | Por quê |
|---|---|---|
| Credencial | Usuário + senha, hash **scrypt** em env var `ADM_PASSWORD_HASH` | O ACL default do schema `public` neste projeto concede `arwdDxt` a `anon` em **toda tabela nova**. Uma tabela `adm_credenciais` nasceria legível pela anon key do APK. |
| 2º fator | **TOTP obrigatório** (~60 linhas com `node:crypto`, sem dependência) | A base inteira atrás de uma senha só é um phishing de distância. |
| Sessão | 8h absolutas + 30 min de inatividade, `sid` revogável | O cookie do Katmandu dura **30 dias** e o logout não revoga nada — inaceitável aqui. |
| Rate limit | Tabela no schema `auditoria` | Serverless não tem memória compartilhada; `Map` em memória é rate limit de mentira. |
| Gate | `requireAdmSession()` em layout server-side **e** em todo route handler | Middleware é filtro, não fronteira (lição do CVE-2025-29927). |
| 2ª tranca | Allowlist de UUIDs em `ADM_ALLOWED_UUIDS` | Porque `regra_de_acesso = 'administrador'` é auto-atribuível (ver §1). |

### Leitura: `service_role` confinada num schema `adm` só de views

Espelho invertido do padrão `vitrine`: a chave `service_role` é o **transporte**, e as views são o
**teto** do que o `/adm` consegue enxergar.

```sql
create schema if not exists adm;
revoke all on schema adm from public, anon, authenticated;
alter default privileges in schema adm revoke all on tables from anon, authenticated, public;
grant usage on schema adm to service_role;
-- NUNCA criar TABELA neste schema, só views.
```

Ganho concreto: um `select('*')` em `usuarios` traria `colaborador_senha` — **6 senhas em texto
plano** (`docs/RLS_ROLLOUT.md:124`) — e 14 CPFs para dentro da memória do Next, dos logs da Vercel e
possivelmente do payload RSC. Com as views, esses campos ficam estruturalmente fora de alcance.

Cinco travas para a `service_role` nunca chegar ao browser:

1. env var **sem** prefixo `NEXT_PUBLIC_` (o Next só inlina `NEXT_PUBLIC_*` no bundle) — convenção
   que o repo já usa de propósito em `vitrine-server.ts`;
2. `import 'server-only'` no topo de `src/lib/adm/supabase-admin.ts` (`npm i server-only`, ~1 KB,
   zero runtime) — import acidental num Client Component vira **erro de build**, não vazamento;
3. header `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store` em `/adm/:path*`;
4. **não** listar `/adm` no `robots.txt` (divergindo da convenção do repo — listar entrega o caminho
   a scanner, e o `noindex` remove melhor do índice);
5. trilha de auditoria de quem abriu qual cliente e quando — não é capricho: Marco Civil art. 15
   (6 meses de registro de acesso) e LGPD art. 37 (registro das operações de tratamento).

### LGPD

- Máscara de e-mail/telefone **em SQL**, não em React. Se a máscara for no componente, o valor cru já
  viajou no payload RSC e está no DevTools — máscara decorativa. "Revelar" vira um POST que grava na
  auditoria e chama uma RPC.
- CPF: proposta é nunca aparecer, só `tem_cpf ✓`.
- A **Política de Privacidade precisa mudar**: a seção "4. Compartilhamento de dados" lista só
  terceiros e não diz em lugar nenhum que a própria equipe da Sistema Seabra acessa dados da conta
  para administração e suporte. O `/adm` institucionaliza esse acesso — precisa estar escrito, nos 3
  locales.
- Contas de consultoria guardam dados de clientes do técnico que **não usam o app**. Se você quiser
  abrir essas propriedades no `/adm`, falta cláusula de operador no contrato do plano `tipo='tecnico'`.

---

## Mapa de rotas

```
/adm                              redirect (com sessão → /adm/carteira)
/adm/login                        usuário + senha + TOTP

VISÃO AGREGADA — "meu dashboard de gestão deles"
/adm/carteira                     6 cards + gráficos + 3 listas de risco
/adm/carteira/receita             MRR real vs tabela, receita mês a mês, inadimplência
/adm/carteira/risco               4 baldes: silêncio · inadimplente · trial estourando · acesso sem pagamento
/adm/carteira/adocao              coorte de retenção, tempo até o 1º lançamento
/adm/carteira/mapa                clientes no mapa (lat/long das propriedades)

DIRETÓRIOS
/adm/usuarios                     LISTA MESTRA
/adm/propriedades                 mesma tabela ancorada no tenant real
/adm/consultores                  carteira de cada técnico
/adm/associacoes · /adm/planos · /adm/cobrancas

CLIENTE
/adm/u/[id]                       Visão geral
/adm/u/[id]/rebanho · producao · reproducao · sanidade · crescimento
         · avaliacoes · financeiro · estrutura · assinatura · equipe · atividade
         · vitrine                (consentimento e moderação)
/adm/u/[id]/tabelas/[tabela]      ESCAPE HATCH — qualquer tabela do banco
/adm/c/[id]                       consultor → carteira dele
```

### O seletor não pode assumir "1 usuário = 1 propriedade"

Isso é falso para 3 dos 5 papéis, e o tenant real do banco é `propriedade_id` (93 tabelas o
carregam), não `usuario_id`:

| Papel | Como se resolve o escopo |
|---|---|
| produtor | `propriedades.produtor_id` → suas propriedades |
| colaborador | herda `usuarios.propriedade_id`; banner "dados de \<produtor dono\>" |
| técnico/consultor | `usuarios.propriedade_id` é NULL. Vínculo via `tecnico_propriedades` (status `ativo`) — escolher entre "carteira consolidada" ou uma propriedade |
| admin_associacao | não tem propriedade; o que ele "tem" é o agregado dos filiados |
| administrador | tudo |

Calculado em SQL com `service_role`, **não pela RLS** — porque o branch de admin global do helper
`app_propriedades_acessiveis()` está morto (testa `tipo_usuario_id = 1`, e ninguém tem esse valor hoje).

O seletor colapsa para rótulo estático quando há 1 propriedade só — o caso de 30 dos 31 produtores.

---

## A lista mestra (`/adm/usuarios`)

Cada coluna com a origem real confirmada no código:

| Coluna | Origem | Observação |
|---|---|---|
| `#` | `usuarios.id` (int PK) | **D1** — a identidade primária. Copiável ao clicar |
| Nº criador | `propriedades.numero_criador` | secundária e filtrável; aceita vazia (D1) |
| Nome | `usuarios.nome` | |
| E-mail | `usuarios.email` | colaborador tem sintético `<user>@colaborador.seabra` |
| Telefone | `usuarios.whatsapp_pessoal` + `whatsapp_pais` | ⚠️ **não existe** `usuarios.telefone`. E.164 sem `+` |
| Tipo | `usuarios.regra_de_acesso` | ⚠️ **nunca** `tipo_usuario_id` — dado sujo |
| Plano / status | `view_status_assinatura` | `status_efetivo`, nunca `assinaturas.status` cru |
| Valor real | fórmula do §2 | |
| Último lançamento | `adm.atividade_propriedade` | **D2** — a view a construir. Substitui "último login" |
| Animais | `rebanho` count | |
| Bandeiras | `is_tester`, `is_demo`, cortesia, extensão manual, `ativo`, sem `uuid` | |

**Busca única** casando em paralelo: `id` numérico exato, nome (unaccent ilike), e-mail, CPF (só
dígitos), whatsapp, nome da propriedade, número de criador. Digitar `11954` acha na hora; digitar
`boa vista` acha pela fazenda.

**Filtros facetados** com contagem por valor: papel · status · plano · associação · segmento
(`caprino_leiteiro | caprino_corte | ovino_leiteiro | ovino_corte`) · estado · atividade (7/30/90d /
nunca) · bandeiras · consultoria.

---

## O escape hatch — cobertura total do banco no dia 1

Você pediu "todas as tabelas do banco em view de tabela". São **93 tabelas** com `propriedade_id`.
Construir 93 telas à mão são meses, e a maioria seria aberta duas vezes por ano.

Em vez disso: um registro declarativo em `src/lib/adm/tabelas.ts` —
`{ nome, rotulo, colunaTenant, colunaData, colunas: [...], colunasBloqueadas, preset }` — e **uma**
página genérica que lê o registro e renderiza `<AdmTable>`. Adicionar tabela nova = uma entrada no
registro, não uma tela.

As abas curadas (Rebanho, Produção, Reprodução...) viram **presets bonitos sobre o mesmo motor**:
cards e gráficos por cima, a mesma tabela por baixo.

Isso é a jogada de maior alavancagem do projeto: o MVP entrega cobertura total do banco já, e cada
fase seguinte só melhora a apresentação de algo que já está acessível.

### `<AdmTable>` — um padrão só

Generalização do `DataTable.tsx` que já existe em `src/components/katmandu/` (já tem sort tri-estado
com nulos por último). Densidade compacta 28px por default (você está auditando, não lendo),
`tabular-nums` nos números, cabeçalho sticky, primeira coluna sticky no scroll horizontal.

**Paginação, não scroll infinito**: você precisa saber *quantos* são, a exportação precisa de um
conjunto determinístico, e 4.820 animais cabem em 50/página sem drama.

**Todo o estado na URL** — `?f.status=ativo&f.sexo=F&sort=-peso_atual&cols=essencial&page=2`. Efeito
prático: você salva "minhas cabras gestantes acima de 40kg" nos favoritos.

---

## Abas do dashboard do cliente

| # | Aba | Cards | Gráficos | Fase |
|---|---|---|---|---|
| 1 | **Visão geral** | animais ativos · lactantes · produção 30d · média/lactante/dia · DEL médio · lançamentos 30d · dias sem acesso · assinatura | produção diária 90d (linha) · categoria (donut) · raça (barras) | MVP |
| 2 | **Rebanho** | total · ativos · F/M · em lactação · gestantes · idade média · peso médio | pirâmide etária · distribuição de peso | MVP |
| 3 | **Produção de leite** | litros 30d · média/dia · média/lactante · nº lactantes · DEL · saída 30d · estoque | produção diária · curva de lactação · CCS/CBT | MVP |
| 4 | **Reprodução** | coberturas 12m · taxa de prenhez · intervalo entre partos · IPP · prolificidade · abortos | funil cobertura→DG→parto | Fase 2 |
| 5 | **Sanidade** | casos 12m · tratados · óbitos · mortalidade · FAMACHA · escore | mortalidade mensal · FAMACHA 1-5 | Fase 2 |
| 6 | **Crescimento** | pesagens 12m · GMD médio · peso ao desmame · abaixo da meta | curva peso × idade com banda de meta · 20 piores GMD | Fase 2 |
| 7 | **Avaliações e registro** | AMLs · medidas · pontuação média · solicitações · fichas RGN | radar AML · evolução da pontuação | Fase 2 |
| 8 | **Financeiro do produtor** | receita/despesa 12m · margem · custo por litro · lucro/lactante | custo/litro no tempo | Fase 2 |
| 9 | **Estrutura** | setores · baias · lotes · equipamentos | sunburst lote→setor→baia | Fase 2 |
| 10 | **Assinatura** | plano · status · valor real · acesso até · total pago · em aberto | histórico de pagamentos | MVP |
| 11 | **Equipe** | colaboradores e permissões · técnicos vinculados | — | Fase 2 |
| 12 | **Vitrine e consentimento** | status · versão do termo aceita vs vigente · animais publicados · `bloqueado_admin` | — | Fase 2 |

Aba 8 é a economia **da fazenda**, não a cobrança do SeabraApp — não confundir com a 10. E o módulo
financeiro é **oculto para consultor** por decisão de produto já travada no app.

---

## Armadilhas do schema que quebram a tela em silêncio

Estas não dão erro — a tela só fica vazia:

- **`rebanho.categoria` guarda o UUID da categoria, não o nome.** Comparar com `'lactante'` nunca
  casa. `JOIN categoria_animal ON rebanho.categoria = categoria_animal.id`, rótulo em
  `categoria_animal.nome`.
- **`manejo` guarda também os descartes**, separados só por filtro de array. Sem filtrar, o `/adm`
  mistura descarte com manejo.
- **`assinaturas.periodo_gracia_ate` e `atrasos_consecutivos` foram DROPADAS** em 12/05/2026. Não
  existe mais período de graça. `acesso_ativo = (data_vencimento > now() OR extensao_manual_ate > now())`.
- **`plano_id_pendente` é upgrade contratado e NÃO pago** — exibi-lo como plano atual repete um
  vazamento já identificado na auditoria.
- **Não existe índice em `rebanho(propriedade_id)`**, e os dois índices parciais de localização estão
  mortos (`WHERE status = 'Ativo'` com maiúscula, enquanto o valor real é `'ativo'`). São 7 índices a
  criar `CONCURRENTLY` antes da primeira query.
- **PostgREST corta a resposta em silêncio** no limite configurado — sem `.range()`/keyset a tabela
  vem truncada com HTTP 200. O `paginar()` de `src/lib/criadores/queries.ts` já resolve isso; reusar.
- Grafia inconsistente na AML: `ponto_5_profundidadedeúbere` tem acento, mas o `class_5_*`
  correspondente não. Quebra qualquer geração de chave por template.

---

## Exportação

Os três formatos são coisas diferentes, não um botão com três opções:

| Formato | Como | Teto |
|---|---|---|
| **CSV** | Streaming server-side (`ReadableStream` + keyset por id), sem carregar tudo em memória. BOM UTF-8 + separador `;` para o Excel PT-BR abrir certo | sem teto |
| **Excel** | XLSX escrito em stream server-side | teto explícito de linhas, avisado na UI |
| **PDF** | **D4 — peça comercial com marca.** Página `/adm/u/[id]/dossie` com print CSS; Ctrl+P dá fidelidade total a custo zero. Chromium headless só se virar rotina | nunca tabela crua completa |

Gerar PDF de um rebanho de 4.820 linhas dentro de uma Route Handler da Vercel estoura tempo e
memória — por isso o PDF nunca é a tabela crua. Ver §D4 para o caminho do dossiê comercial.

---

## Health score de risco de churn

Score 0-100, tudo calculável hoje sem migration:

| # | Componente | Peso | Fórmula | 0 | 100 |
|---|---|---|---|---|---|
| 1 | Recência | 35 | dias desde o último lançamento | ≥30d | ≤2d |
| 2 | Frequência 30d | 25 | dias distintos com ≥1 lançamento | 0 | ≥12 |
| 3 | Amplitude 90d | 15 | nº de módulos usados (de 8) | 0 | ≥4 |
| 4 | Cobrança | 15 | escada fixa | — | — |
| 5 | Profundidade | 10 | animais com evento em 90d ÷ animais vivos | 0% | ≥60% |

---

## Ordem de implementação

**MVP** — critério: você abre, vê a carteira, acha qualquer cliente em 2 segundos, e vê rebanho +
produção + assinatura dele.

1. SQL: schema `adm` + views + auditoria + os 7 índices. Expor `adm` no PostgREST (senão: `PGRST106`)
2. **`adm.atividade_propriedade`** — a peça sem a qual "quem sumiu" não existe
3. `npm i server-only`; `src/lib/adm/{supabase-admin,auth,password,totp,guard,rate-limit,audit}.ts`
4. `/adm/login` + gate
5. `/adm/carteira` — 6 cards com o MRR corrigido + 3 listas de risco
6. `/adm/usuarios` — lista mestra completa
7. `<AdmTable>` com export CSV
8. `/adm/u/[id]` — 4 abas: Visão geral, Rebanho, Produção, Assinatura
9. `/adm/u/[id]/tabelas/[tabela]` — escape hatch

**Fase 2** — abas 4 a 12 · `/adm/consultores` · receita e risco completas · XLSX · **dossiê
comercial em PDF** (D4) · ações de escrita de assinatura (sempre proxiando a Edge
`asaas-admin-actions`, **jamais** UPDATE direto, senão o Asaas dessincroniza e fica sem trilha).

**Fase 3** — coorte de retenção · mapa · **benchmark entre clientes** ("seu custo/litro é R$ 2,10, a
mediana da carteira é R$ 1,70") — provavelmente o recurso mais vendável do painel inteiro.

---

## Estado da implementação (05/09/2026)

MVP construído e compilando. **Nada foi publicado nem migrado** — o SQL está escrito e não executado,
e o painel roda em `npm run dev`.

### O que existe

| Camada | Arquivos |
|---|---|
| SQL | `supabase/adm/adm_01…06` — schema `adm` só de views, atividade, auditoria, índices, verificação e carteira |
| Acesso | `src/lib/adm/{supabase-admin,password,totp,auth,rate-limit,audit,guard}.ts` |
| Dados | `src/lib/adm/{queries,metricas,escopo,format,params,url,tabelas,tabelas-dados}.ts` |
| Exportação | `src/lib/adm/xlsx.ts` + `src/app/adm/api/export/route.ts` |
| UI | `src/components/adm/**` (tabela, filtros, exportação, 4 gráficos) |
| Telas | `src/app/adm/**` — login, carteira, usuários, ficha do cliente com 4 abas e o escape hatch |

### O que foi verificado, não suposto

- `tsc --noEmit` e ESLint limpos; `npm run build` passa com as 13 rotas do `/adm` dinâmicas.
- **XLSX aberto por um parser real de Excel** (openpyxl): tipos nativos (float, datetime, bool),
  acentuação, escape de XML e painel congelado corretos.
- **Login ponta a ponta**, com o código TOTP calculado por uma implementação independente
  (RFC 6238 em Python) — o `totp.ts` está correto. Cookie sai com `Path=/adm`, `HttpOnly`,
  `Secure`, `SameSite=strict` e 30 min de inatividade.
- Sem `SUPABASE_SERVICE_ROLE_KEY`, o painel responde **503 dizendo o que falta** — não 500, não
  tela branca.
- Invariante D3 conferida por varredura: nenhuma escrita fora do schema `auditoria`.

### Defeitos encontrados na revisão e corrigidos

Dois revisores independentes (segurança e integração) leram os 48 arquivos. O que acharam de grave
tinha a mesma natureza: **controles que o desenho declara e que, no código, nunca executavam.**

| # | Defeito | Efeito |
|---|---|---|
| 1 | 10 views consumidas pelo TS, 6 criadas pelo SQL, nomes divergentes | Só `/adm/usuarios` abria; todo o resto caía em erro |
| 2 | RPC de auditoria com um argumento de nome errado (`p_sid` vs `p_sessao_sid`) | A trilha **nunca gravava uma linha** — e é ela que sustenta o acesso a dado pessoal |
| 3 | RPCs de rate limit inexistentes | Login **sem proteção de força bruta**, falhando aberto em silêncio |
| 4 | Route handlers em `/api/adm/*`, fora do `path` do cookie | **Toda exportação respondia 401**, mesmo com sessão válida |
| 5 | `cursor.id` concatenado no filtro do PostgREST sem escape | Injeção de filtro: outro conjunto de linhas, sem erro |
| 6 | Login digitado gravado em texto | PII de terceiro na trilha numa varredura de dicionário |
| 7 | `{...visoes[0]}` na consolidação de propriedades | Campo não somado virava o valor da 1ª fazenda, exibido como consolidado |
| 8 | Duas gramáticas de `?sort=` | Arquivo exportado saía em ordem diferente da tela |
| 9 | Rádio "só a página atual" | Baixava o conjunto inteiro — botão que mente |
| 10 | `?prop=todas` descartado na exportação | Tela com N fazendas, arquivo com uma |

Mais dois defeitos meus, pegos por teste e não por leitura: o EOCD do ZIP do XLSX com o offset do
diretório central em 14 em vez de 16 (arquivo que abre em algumas ferramentas e falha em outras), e
a ausência da própria rota `/api/adm/export`, que o `ExportMenu` já chamava.

### Limitações conhecidas

- **O SQL não foi executado.** Nada do painel lê dado real até rodar `supabase/adm/*` na ordem e
  expor o schema `adm` no PostgREST (Settings → API → Exposed schemas). Sem isso: `PGRST106`.
- **Nenhuma coluna foi conferida contra o banco vivo** — só contra migrations e DTOs. O primeiro
  `adm_05_verificacao.sql` vai dizer o que diverge.
- O cookie usa `secure: true` sempre, inclusive em dev. Funciona em `localhost`, mas **não** ao
  abrir o painel por IP de LAN em http (testar no celular exige túnel https).
- `/adm/consultores` ainda não existe; o link foi removido do nav em vez de virar 404.
- Abas 4 a 12 (Reprodução, Sanidade, Crescimento, Avaliações, Financeiro, Estrutura, Equipe,
  Vitrine) seguem como Fase 2 — mas as tabelas delas já estão acessíveis pelo escape hatch.
- O dossiê comercial em PDF (D4) ainda não foi construído; o `ExportMenu` só oferece o PDF quando
  recebe `hrefDossie`, então hoje ele não aparece.

### Para o painel ler dado de verdade

1. Rodar `supabase/adm/adm_01` … `adm_06` na ordem (ver `supabase/adm/README.md`).
2. Rodar `adm_05_verificacao.sql` e exigir que passe.
3. Expor o schema `adm` no PostgREST.
4. `node scripts/gerar-credenciais-adm.mjs` e colar as variáveis no `.env.local`.
5. Acrescentar `SUPABASE_SERVICE_ROLE_KEY`.

---

## Fase 2 — estado em 05/09/2026

Construída e compilando. Continua tudo local: o SQL está escrito e **não executado**.

### O que entrou

| Peça | Estado |
|---|---|
| SQL das áreas | `adm_07_areas.sql` (8 views) e `adm_08_consultoria.sql` (2 views) |
| Abas 4–12 | Reprodução, Sanidade, Crescimento, Avaliações, Financeiro, Estrutura, Equipe, Vitrine |
| Consultoria | `/adm/consultores` e `/adm/c/[id]`, com a ponte consultor → produtor |
| Dossiê comercial | `/adm/u/[id]/dossie` — página real com print CSS (decisão D4) |
| Gráficos novos | nuvem peso × idade com banda de meta, e radar da AML |

São **24 rotas** do `/adm` no build, todas dinâmicas. `tsc` e ESLint limpos.

### A mudança de método desta fase

O pior defeito da Fase 1 foi o TypeScript e o SQL nomearem as mesmas views de formas diferentes —
dez consumidas, seis criadas, e o painel compilando enquanto só uma tela abria. Nenhum tipo pega
isso, porque a divergência só aparece em runtime e se disfarça de "cliente sem dados".

A resposta foi `src/lib/adm/areas/contrato.ts`: **nomes de view e de coluna declarados uma vez,
antes da implementação.** O SQL implementa o arquivo, o TypeScript consome o arquivo, e ninguém
digita string de nome de view. Verificado depois:

- as 10 views existem no SQL com o nome exato do contrato;
- nenhum módulo de área digita nome de view — todos importam de `VIEWS_FASE_2`;
- `adm_05_verificacao.sql` ganhou um bloco que **falha** se qualquer uma das 10 faltar, ou se
  estiver sem grant para `service_role`. A divergência agora quebra na migration, não na tela.

E as abas passaram a ser derivadas de `ABAS_CLIENTE`, no mesmo contrato, em vez de uma lista
paralela dentro do cabeçalho — conferido: as 13 abas declaradas têm rota de verdade.

### Defeitos corrigidos ao integrar

| # | Defeito | Efeito |
|---|---|---|
| 1 | O `hrefDossie` do `ExportMenu` nunca era preenchido | O botão de PDF **não aparecia em lugar nenhum**. Agora o link é derivado da URL dentro do próprio menu, em vez de depender de cada tela lembrar de passá-lo |
| 2 | Numeração das seções do dossiê por contador mutável no render | Erro de lint real (`react-hooks/immutability`): em modo estrito o React renderiza duas vezes e a numeração sairia errada. Passou a ser derivada da lista de seções presentes |
| 3 | `<PiramideEtaria>` alimentada com uma lista sem separação por sexo | A pirâmide pareia fêmeas e machos na mesma faixa; com metade do dado ela prometeria uma leitura que não sustenta. Trocado por barras, com o porquê no código |

### Limitações desta fase

- **O SQL da Fase 2 também não foi executado.** As 10 views novas não existem no banco ainda.
- **A revisão automática não rodou:** o processo foi interrompido antes dos dois revisores. Os
  achados que este documento lista vieram da integração manual, não de uma auditoria completa como
  a da Fase 1. Vale rodá-la antes de considerar a fase fechada.
- Sem banco, o teste de fumaça só prova que as 24 rotas respondem 200 e explicam a falta de
  configuração — **não** que os dados aparecem corretamente. Isso só se verifica após rodar o SQL.
- `adm.propriedade_visao_geral` não separa a faixa etária por sexo, então a pirâmide de verdade
  continua indisponível. O componente existe e passa a ser usado quando a view separar.
- O dossiê depende de o operador marcar "Gráficos de fundo" na janela de impressão do Chrome —
  sem isso os gráficos saem em branco. O aviso está na tela.

### Revisão adversarial da Fase 2 (05/09/2026)

Seis dimensões independentes, e cada achado grave submetido a um cético cuja tarefa era **refutá-lo**
lendo os arquivos reais. 18 agentes, 12 achados graves — nenhum caiu inteiro, mas a refutação
trabalhou: o primeiro cético derrubou 4 das 5 linhas de um achado e salvou só a que procedia.
Três pares eram o mesmo defeito visto de dimensões diferentes, então são **9 defeitos distintos**,
todos corrigidos.

| # | Defeito | Efeito |
|---|---|---|
| 1 | `round(avg(escore_corporal), 2)` — a coluna é `real`, e `round(double precision, int)` **não existe** no Postgres | **O script abortava na 2ª de 8 views** e levava as seis seguintes junto. Provado pela RPC do app, que declara `p_escore_corporal real` ao lado de `p_peso numeric` na mesma assinatura |
| 2 | `limite_propriedades` desempatava por maior limite; o RPC do app desempata por `data_vencimento` | O painel mostraria "1 de 15" num técnico cujo app só permite 1 — a ligação oferecendo mais fazendas terminaria em erro na frente do cliente |
| 3 | O run-book mandava rodar a verificação **antes** das views da Fase 2 existirem | Os asserts de LGPD varrem o `information_schema` e só veem o que existe: passariam **no vácuo** justamente sobre as 10 views novas |
| 4 | `select('*')` em duas das oito áreas | Coluna renomeada na view viraria `undefined` → `0` na tela: "0 partos em 12 meses" para um criador que teve 90. As outras seis já usavam projeção explícita conferida em compilação |
| 5 | Funil e pirâmide do dossiê desenhados pelo componente de **ranking** | Ele reordena por volume e some com etapa zerada. No PDF enviado ao criador, um funil sairia de cabeça para baixo — "Partos 40, Coberturas 12" — afirmando o oposto do que aconteceu |
| 6 | Crescimento e Avaliações não sabiam que estavam consolidando | Com duas fazendas, a tela dizia "nunca fez AML" e "sem pesagem consecutiva" para um cliente que faz as duas coisas |
| 7 | `.dossie-mesa` usada como régua de KPIs — é a **mesa** em volta da folha | ~7cm de vão por seção, barra de rolagem em cada régua, e a folha nunca envolvida pela mesa |
| 8 | O dossiê não deixava rastro próprio na trilha | A única peça que **sai da empresa** registrava o mesmo evento de abrir uma aba: numa resposta a incidente, não havia como responder se um dossiê foi emitido |
| 9 | O CSS declarava uma escala de impressão que **não existia** | Duas das cinco cores de série dão 1,4:1 e 2,0:1 sobre branco: no PDF a fatia do donut sumia e o anel saía com um buraco onde havia 20% do plantel |

Correções estruturais, não pontuais:

- `SERIES_PAPEL` em `theme.ts` é tipada como `MesmoComprimento<typeof SERIES>` — **acrescentar uma
  cor na paleta de tela sem acrescentar na de papel não compila.** Verificado removendo uma cor: o
  build quebra.
- As projeções das áreas usam `satisfies Record<keyof Linha*, true>`: coluna esquecida vira erro de
  `tsc`, não zero na tela.
- O `adm_05` agora declara no cabeçalho por que roda por último, e o README explica o motivo de
  LGPD — não só a ordem.

Depois de tudo: `tsc` e ESLint limpos, build passa, e as 18 rotas do painel respondem 200 com
sessão real (login testado ponta a ponta, TOTP conferido contra implementação independente).

