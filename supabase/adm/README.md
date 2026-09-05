# SQL do `/adm` — fronteira de leitura no Supabase do SeabraApp

Nove arquivos que criam tudo que o painel `/adm` do site precisa **ler** no banco do
`seabra-app-main`, mais a trilha de auditoria que ele **escreve**. Nada aqui roda sozinho:
o Felipe executa à mão, no SQL Editor do painel Supabase.

O contrato que este SQL serve são dois arquivos: `src/lib/adm/types.ts` (Fase 1) e
`src/lib/adm/areas/contrato.ts` (Fase 2 — nome de view e de cada coluna). Coluna que sai destas
views tem nome igual ao campo da interface correspondente. **O SQL implementa o contrato; ele não
batiza nada** — se um dia divergir, quem manda é o TypeScript.

---

## Ordem de execução

| # | Arquivo | O que faz | Dá para rodar tudo de uma vez? |
|---|---|---|---|
| 1 | `adm_01_schema_e_views.sql` | Schema `adm`, grants e 5 views de leitura | sim |
| 2 | `adm_02_atividade.sql` | `adm.atividade_propriedade` — o sinal de vida (D2) | sim |
| 3 | `adm_03_auditoria.sql` | Tabelas e RPCs de auditoria + rate limit | sim |
| 4 | `adm_04_indices.sql` | 11 índices novos + conserto de 2 mortos | **NÃO — um comando por vez** |
| 5 | `adm_06_carteira.sql` | As 3 views agregadas de `/adm/carteira` | sim |
| 6 | `adm_07_areas.sql` | As 8 views de área da ficha do cliente (Fase 2) | sim |
| 7 | `adm_08_consultoria.sql` | `consultores_lista` e `consultor_carteira` (Fase 2) | sim |
| 8 | `adm_09_carteira_fase3.sql` | Coorte de retenção, benchmark entre criadores e a lista de cobranças (Fase 3) | sim |
| 9 | `adm_10_propriedades.sql` | `propriedades_lista` — o diretório ancorado no tenant real (Fase 3) | sim |
| 10 | `adm_11_pagamentos_cliente.sql` | `pagamentos_por_cliente` — quem pagou e quanto, acumulado (Fase 3) | sim |
| 11 | `adm_05_verificacao.sql` | Os asserts. Falha alto se algo estiver errado | sim |

**O número no arquivo não é a ordem.** O `adm_05` numera 05 por história e roda por
ÚLTIMO — sempre, e de novo a cada vez que qualquer um dos outros for reexecutado.

Duas razões, e a segunda é a que importa:

1. os Blocos 5 e 6 dele exigem as 10 views da Fase 2 e as 6 da Fase 3, que só existem depois do
   `adm_07`, do `adm_08`, do `adm_09`, do `adm_10` e do `adm_11`. Rodá-lo antes aborta ali, e o
   operador nem chega a saber que faltam arquivos;
2. **a guarda de LGPD passaria no vácuo.** Os asserts 4a/4b/4c — nenhuma view do schema `adm`
   projetando `cpf`, senha, coordenada, e-mail ou whatsapp cru — varrem o `information_schema`
   e só enxergam as views **que já existem**. Rodá-los antes do `adm_06`/`07`/`08` os faz
   passar sem nunca olhar para as views novas, que são justamente as que ninguém auditou ainda.

Depois de cada arquivo que cria view — `adm_01`, `adm_02`, `adm_06`, `adm_07`, `adm_08`,
`adm_09`, `adm_10` e `adm_11` — faça o
passo manual do PostgREST (abaixo). Sem recarregar o cache, a view existe no banco e o painel
continua respondendo `PGRST205`.

Todos são **idempotentes**: rodar duas vezes não faz mal.

### Por que o `adm_04` é diferente

`CREATE INDEX CONCURRENTLY` não roda dentro de transação, e o SQL Editor manda o conteúdo do
painel como um lote — lote com várias instruções vira transação implícita. O erro é
`CREATE INDEX CONCURRENTLY cannot run inside a transaction block`. Selecione um bloco,
execute, confira, siga para o próximo. Rode em horário de baixa: são tabelas de produção.

---

## Passo manual obrigatório: expor o schema `adm`

Depois do `adm_01`:

> **Painel Supabase → Settings → API → Exposed schemas** → adicionar `adm` → **Reload schema cache**

Sem isso o PostgREST devolve `PGRST106` / `PGRST205` e o `/adm` não lê absolutamente nada —
a mesma pegadinha que já custou uma tarde na vitrine (`migrations/vitrine_02_views.sql:7-8`).

**Expor é seguro** justamente porque os grants são explícitos: uma requisição com a anon key
roda como `anon`, que não tem `USAGE` no schema `adm`, e leva `permission denied`. O assert 2
do `adm_05` prova isso a cada execução.

Não exponha `auditoria`. Ele fica fora do PostgREST de propósito — a escrita passa pelas RPCs
`SECURITY DEFINER` em `public`.

---

## O que cada view entrega

| View | Interface em `types.ts` | Filtre por |
|---|---|---|
| `adm.usuarios_lista` | `UsuarioLista` | — (a lista inteira; ~45 linhas) |
| `adm.propriedades_escopo` | `PropriedadeEscopo` | `usuario_id` |
| `adm.assinatura_normalizada` | `AssinaturaResumo` + KPIs da carteira | `usuario_id` / `associacao_id` |
| `adm.pagamentos_conta` | `PagamentoLinha` | `usuario_id` |
| `adm.propriedade_visao_geral` | `VisaoGeralPropriedade` | **`propriedade_id` sempre** |
| `adm.atividade_propriedade` | fonte de `ultimo_lancamento_em` e do health score | `propriedade_id` |
| `adm.auditoria_recente` | leitura da trilha | — |

Duas armadilhas de uso:

- **`adm.propriedade_visao_geral` sem `where propriedade_id` agrega a base inteira.** Ela é
  escrita com `cross join lateral` para que o filtro empurre para dentro; sem filtro, cada
  lateral roda para as 31 propriedades.
- **O MRR não se soma de `adm.usuarios_lista`.** Essa view junta só a assinatura *própria* do
  usuário (colaborador aparece com plano nulo; associação nem aparece). A fonte do MRR é
  `adm.assinatura_normalizada`, que tem uma linha por **contrato**, não por pessoa.

### Colunas que existem fora da interface

Chaves e apoios, deliberados: `propriedades_escopo.usuario_id` e `.prioridade_vinculo`
(1 dono · 2 herdado · 3 consultoria · 4 associação — é como se escolhe a propriedade
principal); `assinatura_normalizada.total_assinaturas_do_dono`, `.inadimplente`,
`.vencendo_7d`; `pagamentos_conta.pago` e `.vencido`.

---

## O que este SQL corrige de propósito

Três coisas que o painel herdaria erradas se lesse `public` direto:

1. **O MRR fica menor — e certo.** O número que o app mostra hoje
   (`asaas-admin-actions/index.ts:344`) soma preço de tabela: ignora desconto de associação,
   trata plano anual como mensal e soma cortesias. `valor_real_mensal` normaliza por ciclo,
   deduplica por dono e zera cortesia; `valor_tabela_mensal` fica ao lado para a tela mostrar
   os dois até a troca ganhar confiança.
2. **`valor_mensal_promocional` guarda o valor ANUAL quando `ciclo = 'anual'`** — apesar do
   nome e do próprio comentário da coluna. Somar direto superestima o assinante anual em ~12×.
   O `/12` vem dentro do ramo do anual.
3. **`assinaturas` não tem UNIQUE por `usuario_id`.** `DISTINCT ON` obrigatório; o assert 10
   do `adm_05` prova que valeu.

E dois defeitos de índice: `rebanho` não tem **nenhum** índice com `propriedade_id`, e os dois
parciais de localização filtram `status = 'Ativo'` (maiúsculo) enquanto o valor real é
`'ativo'` — casam zero linhas e são mantidos a cada escrita.

---

## Regras que não se negociam

- **Nunca criar TABELA nem MATERIALIZED VIEW no schema `adm`.** O ACL default deste projeto
  concede `arwdDxt` a `anon` em toda tabela nova, e `adm` é exposto ao PostgREST. Cache pesado,
  se um dia for preciso, vai para o schema `adm_cache` (variante comentada no fim do `adm_02`).
- **Toda view nova: `revoke all ... from public, anon, authenticated` ANTES do
  `grant select ... to service_role`.** Nesta ordem, sempre.
- **Nenhuma view projeta `cpf`, `colaborador_senha`, `colaborador_senha_hash`, `latitude` ou
  `longitude`.** E-mail e whatsapp saem mascarados **em SQL** — mascarar em React é teatro: o
  valor cru já teria viajado no payload RSC.
- **Somente leitura (D3).** Nenhuma view de `adm` é gravável, nem pela `service_role`. A única
  escrita do painel é a trilha de auditoria, e ela passa por RPC.

---

## RPCs disponíveis para o Next

Todas em `public` (o PostgREST só alcança `public`), `SECURITY DEFINER`, com `EXECUTE`
revogado de `anon`/`authenticated` e concedido só a `service_role`.

```
adm_registrar_acesso(p_ator, p_acao, p_sessao_sid, p_alvo_tipo, p_alvo_id,
                     p_detalhes jsonb, p_ip, p_user_agent) -> bigint
adm_registrar_tentativa_login(p_ator, p_sucesso, p_motivo, p_ip, p_user_agent) -> void
adm_status_login(p_ator, p_ip, p_janela_min := 15, p_max_falhas := 6) -> jsonb
```

`adm_status_login` devolve `{bloqueado, falhas_ator, falhas_ip, janela_min, libera_em}` —
o suficiente para a tela dizer "bloqueado por mais 7 minutos" em vez de "senha inválida" pela
sétima vez.

`p_acao` usa o vocabulário de `EventoAuditoria` (`types.ts`): `login_ok`, `login_falha`,
`logout`, `abriu_carteira`, `abriu_usuario`, `abriu_tabela`, `exportou`, `revelou_contato`.
Não há CHECK na coluna de propósito — um valor novo no TypeScript não pode fazer a gravação
da trilha derrubar a página que ela só observa.

Duas regras de uso: gravar `abriu_usuario` **antes** de carregar os dados (senão um erro no
meio deixa o acesso sem rastro), e nunca colocar PII em `detalhes` — id sim, valor não.

---

## Retenção

12 meses para `auditoria.adm_acessos` (acima do mínimo de 6 do Marco Civil art. 15, abaixo do
"para sempre" que a LGPD desaconselha) e 30 dias para `auditoria.adm_tentativas_login`.

O `pg_cron` está pronto e **comentado** no fim do `adm_03`. Antes de descomentar, confirme a
extensão:

```sql
select * from pg_extension where extname = 'pg_cron';
```

Sem `pg_cron`, rodar os dois `delete` à mão a cada semestre é aceitável no volume atual — mas
anote no calendário: retenção que depende de lembrança vira retenção infinita.

---

## Se algo falhar

**`FALHA 1: tabela/matview no schema adm`** — alguém criou tabela em `adm`. Mova para outro
schema. A regra "só views" é o que torna o schema um teto de leitura em vez de uma porta nova.

**`FALHA 2a/2b: anon/authenticated alcançam adm`** — algum `grant` vazou, ou o objeto foi
criado por um papel cujo *default ACL* concede a `anon`. Rode os `revoke` do fim do `adm_01`:

```sql
revoke all on all tables in schema adm from public, anon, authenticated;
revoke all on schema adm from public, anon, authenticated;
```

**`FALHA 3: view ausente`** — falta rodar o arquivo correspondente.

**`FALHA 7: ainda é o esqueleto do adm_01`** — o `adm_01` cria um `adm.atividade_propriedade`
vazio, com a assinatura exata de colunas, só para a ordem numérica dos arquivos funcionar
(`usuarios_lista` depende dela). Rode o `adm_02`, que a substitui com
`create or replace view`. Sem isso o painel abre com **todo mundo marcado como "nunca lançou"**,
silenciosamente.

**`FALHA 10: dono com mais de uma linha`** — o `DISTINCT ON` parou de funcionar, ou apareceu
uma assinatura com `usuario_id` e `associacao_id` ao mesmo tempo (o CHECK
`assinatura_owner_check` deveria impedir). Investigue antes de olhar qualquer número de receita.

**`FALHA 15/16: e-mail ou telefone sem máscara`** — pare tudo. Alguém trocou a coluna
mascarada pela crua; o valor já está viajando no payload RSC.

**`FALHA 20: 0 animais com a base cheia`** — literal de status errado em alguma view.
`rebanho.status` é `'ativo'` **minúsculo**. `'Ativo'` não casa nada e não dá erro.

**`FALHA 21: índice INVÁLIDO`** — um `CREATE INDEX CONCURRENTLY` falhou no meio. O índice não
serve a consulta nenhuma mas continua sendo mantido a cada escrita:
`drop index concurrently <nome>` e refaça o comando.

**`PGRST106` / `PGRST205` no Next** — o schema `adm` não está em *Exposed schemas*, ou falta
recarregar o schema cache. Ver o passo manual acima.

**Views retornam menos linhas do que deveriam** — as views de `adm` ficam em
`security_invoker = off` (o padrão) e rodam como o **dono**. Se você as criou com um papel que
não enxerga as tabelas de `public` sem RLS, o filtro aparece como "sumiram linhas", não como
erro. Rode tudo como `postgres`, pelo SQL Editor do painel. Para conferir o dono:

```sql
select c.relname, pg_get_userbyid(c.relowner)
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'adm';
```

**Preciso mudar as colunas de uma view** — `create or replace view` recusa mudança de colunas.
O `adm_01` já dropa e recria as suas em ordem de dependência; basta rodá-lo de novo. Se mexer
nas colunas de `adm.atividade_propriedade`, mexa **também** no esqueleto do `adm_01`, senão o
`create or replace` do `adm_02` falha.

---

## Fora de escopo aqui

- Cliente Supabase, gate de sessão, TOTP e rate limit no Next: `src/lib/adm/*`.
- `SUPABASE_SERVICE_ROLE_KEY` **nunca** com prefixo `NEXT_PUBLIC_`, nunca importada por Client
  Component, sempre atrás de `import 'server-only'`.
- Ações de escrita em assinatura (estender, cancelar, trocar plano) são Fase 2 e continuam
  passando pela Edge Function `asaas-admin-actions` — escrever direto em `assinaturas`
  dessincronizaria o Asaas e ficaria sem trilha em `pagamentos_log`.
