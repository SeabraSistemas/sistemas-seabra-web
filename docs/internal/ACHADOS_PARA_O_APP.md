# Achados do `seabra-app-main` — texto para colar no chat daquele repositório

Estes cinco apareceram enquanto eu lia as migrations e o Dart do app para construir o `/adm` do
site. **Nada disso foi alterado por mim no repositório do app** — o único arquivo que escrevi lá
está deliberadamente bloqueado (ver o item 1).

Cada um tem arquivo e linha. Copie daqui para baixo.

---

## Cinco achados no SeabraApp, vindos de fora

Estou trabalhando no painel `/adm` do site institucional, que lê o Supabase deste app. Lendo as
migrations e o código Dart para montar as views de leitura, encontrei cinco coisas que parecem
defeito **neste repositório**. Não toquei em nada aqui — só reporto, com a citação de cada uma.

**Dois deles foram confirmados contra o banco de produção em 05/09/2026** (consultas de leitura,
via Management API) e estão marcados com ✅. Os outros três vêm da leitura do código.

### 1. 🔴 Qualquer pessoa com o APK pode se promover a administrador

`public.usuarios` tem a policy `update_own_user` como `USING(true)` **sem `WITH CHECK`**, e
`insert_user_public` é `WITH CHECK true` para `PUBLIC`. A anon key vai dentro do APK — está
literal em `lib/custom_code/actions/create_colaborador_user.dart:29`. Então:

```
PATCH /rest/v1/usuarios?id=eq.<qualquer>  {"regra_de_acesso":"administrador"}
```

E `regra_de_acesso = 'administrador'` é exatamente o predicado das policies `*_admin_all`.

Isto **já está documentado neste repositório** como achado colateral crítico, em
`docs/planos/PLANO_EVOLUCAO_TECNICO_CONSULTOR.md:178` (e em
`ROTEIRO_TESTE_FASE_B_HABILITACAO.md:88`) — é a "Fase 0.A" que ficou pendente.

**Existe uma migration escrita, e ela está BLOQUEADA de propósito:**
`migrations/2026_09_05_fase_0a_fechar_rls_usuarios.sql`. Um bloco `do $guarda$` no topo aborta o
script antes de alterar qualquer coisa. O motivo está no cabeçalho e em
`docs/FASE_0A_FECHAR_RLS.md §7`: uma auditoria achou que, do jeito que ela está, pode **impedir
todo cadastro novo de confirmar e-mail** — a policy antiga era `to PUBLIC`, que inclui o role
`supabase_auth_admin` sob o qual o trigger `handle_email_confirmed()` insere em `public.usuarios`,
e a nova é `to anon, authenticated`, que não o inclui.

**✅ ESSA DÚVIDA JÁ FOI RESOLVIDA CONTRA O BANCO (05/09/2026):**

```
handle_email_confirmed   security_definer = true   dono = postgres
public.usuarios          dono = postgres   rls = true   force_rls = FALSE
```

A função é `SECURITY DEFINER` do `postgres`, a tabela é do `postgres`, e `force_rls` é **false** —
o INSERT do trigger passa por cima da RLS. **Fechar a policy pública NÃO quebra o cadastro.**
O bloqueante da migration está resolvido; sobram os outros três achados do `§7`.

E o buraco está aberto agora, medido no banco:

```
update_own_user      UPDATE   using = true    with_check = (nenhum)
insert_user_public   INSERT                   with_check = true
```

Há mais três achados importantes sobre essa migration no `§7` do documento — entre eles que a
desativação de colaborador zera `propriedade_id`, que é justamente a coluna de que a policy de
gestão depende, deixando a reativação devolver 0 linhas sem erro.

**Trate a migration como ponto de partida, não como solução pronta.**

### 2. 🔴 Senhas de colaborador em texto plano

`usuarios.colaborador_senha` guarda a senha em texto plano, ao lado de `colaborador_senha_hash`.
Está registrado em `docs/RLS_ROLLOUT.md:124` ("parece guardar senha de colaborador **em texto
plano**... tratar separado"). Pela contagem que fiz, são 6 linhas não-nulas.

### 3. 🟠 O MRR que o painel do app mostra está errado

`supabase/functions/asaas-admin-actions/index.ts:339`:

```ts
const mrr = ativas.reduce((sum, s) => sum + (s.valor_mensal || 0), 0);
```

`valor_mensal` é o **preço de tabela do plano**. A soma portanto:

- ignora o desconto por associação congelado em `usuarios.valor_mensal_promocional`;
- conta cortesia (vencimento em 2099) como receita;
- trata assinatura **anual** como se fosse mensal — e o mesmo arquivo, na linha 229, já sabe que no
  ciclo anual a recorrência cobra `valor_anual`.

O MRR honesto normaliza por ciclo e tira cortesia:

```sql
case when a.ciclo = 'anual'
     then coalesce(u.valor_mensal_promocional, p.valor_anual) / 12.0
     else coalesce(u.valor_mensal_promocional, p.valor_mensal)
end
```

⚠️ E há uma armadilha: apesar do nome, `usuarios.valor_mensal_promocional` guarda o valor **anual**
quando o ciclo é anual — confirmado em `supabase/functions/_shared/asaas.ts:342-345` e `:374-380`.
Somar direto superestima o assinante anual em ~12×.

Some-se que `assinaturas` **não tem UNIQUE por `usuario_id`**: sem `DISTINCT ON`, um dono com duas
linhas é contado duas vezes.

### 4. 🟠 Uma view e duas funções de localização podem estar retornando vazio

`migrations/add_localizacao_constraints_and_functions.sql` compara `status = 'Ativo'`, com **A
maiúsculo**, em quatro lugares:

| Linha | O quê |
|---|---|
| 55 | a view `view_animais_localizacao` |
| 70 | a função `count_animais_in_baia` |
| 89 | a função `count_animais_in_setor` |
| 281-282 | os índices parciais `idx_rebanho_baia_id` e `idx_rebanho_setor_id` |

No resto do repositório a grafia é minúscula: contei **35 escritas com `'ativo'` contra 5 com
`'Ativo'`**, e o `check` de `tecnico_propriedades` (`2026_07_09_tecnico_consultor_schema.sql:47`)
usa minúsculo.

**✅ CONFIRMADO CONTRA O BANCO (05/09/2026).** `select status, count(*) from public.rebanho
group by 1` devolve:

```
inativo   8300
ativo     5975
```

**Nenhuma linha com `'Ativo'`.** Ou seja, em produção, agora:

- a view `view_animais_localizacao` devolve **vazio**;
- `count_animais_in_baia` e `count_animais_in_setor` devolvem **sempre 0**;
- os dois índices parciais nunca são usados — ocupam espaço e são mantidos a cada escrita.

Isso não é mais hipótese. É o estado atual.

### 5. 🟡 O branch de admin global de `app_propriedades_acessiveis()` está morto

O helper testa `tipo_usuario_id = 1` para identificar o Admin Geral. Só que o Admin Geral real
tem `tipo_usuario_id = 2` — o papel canônico é `usuarios.regra_de_acesso = 'administrador'`, e o
próprio `PLANO_EVOLUCAO_TECNICO_CONSULTOR.md:178` registra que `tipo_usuario_id = 1` mapeia para
admin de **associação**. Ou seja: o caminho de "admin enxerga tudo" nunca executa, e quem depende
dele cai no branch seguinte sem erro nenhum.

Foi por causa disso que o `/adm` do site calcula o escopo de propriedades em SQL com
`service_role`, em vez de confiar na RLS.

### 6. 🟡 Um animal com `status = 'ativo'` e `data_venda` preenchida

Apareceu ao conferir uma contagem: existe **1 linha** em `rebanho` com `status = 'ativo'` e
`data_venda` não nula ao mesmo tempo. São estados que se contradizem — um animal vendido não
deveria continuar ativo.

```sql
select id, numero_animal, propriedade_id, status, data_venda
  from public.rebanho where status = 'ativo' and data_venda is not null;
```

É uma linha só, então não muda número nenhum de forma relevante — mas vale entender como ela
chegou nesse estado, porque o caminho que produziu uma pode produzir mais. Provavelmente uma venda
registrada sem passar pelo fluxo que muda o status.

---

*Fim do texto para colar.*

---

## Nota para mim mesmo (não colar)

O que **não** entrou nesta lista, de propósito:

- a grafia inconsistente dos pontos da AML (`ponto_5_profundidadedeúbere` com acento contra
  `class_5_*` sem) — é chato, mas está contornado no `/adm` e não quebra nada no app;
- `plano_id_pendente` exibido como plano atual — já está na auditoria interna deles;
- falta de índice em `rebanho(propriedade_id)` — é otimização para o `/adm`, e o `adm_04` do site
  já cria. Não é defeito do app.
