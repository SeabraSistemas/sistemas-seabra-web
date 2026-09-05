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
Algumas eu não consigo confirmar de fora, e digo quais.

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

Duas consultas resolvem essa dúvida, e elas precisam ser rodadas **contra o banco**:

```sql
select p.proname, p.prosecdef, pg_get_userbyid(p.proowner) as dono
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where p.proname = 'handle_email_confirmed';

select relowner::regrole, relrowsecurity, relforcerowsecurity
  from pg_class where oid = 'public.usuarios'::regclass;
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

**Não consigo confirmar de fora** qual grafia `rebanho.status` realmente guarda. Se for minúscula
(o que as 35 escritas sugerem), então a view devolve vazio, as duas funções de contagem devolvem
sempre 0, e os dois índices nunca são usados — ocupando espaço e sendo mantidos a cada escrita.

Uma consulta resolve:

```sql
select status, count(*) from public.rebanho group by 1 order by 2 desc;
```

### 5. 🟡 O branch de admin global de `app_propriedades_acessiveis()` está morto

O helper testa `tipo_usuario_id = 1` para identificar o Admin Geral. Só que o Admin Geral real
tem `tipo_usuario_id = 2` — o papel canônico é `usuarios.regra_de_acesso = 'administrador'`, e o
próprio `PLANO_EVOLUCAO_TECNICO_CONSULTOR.md:178` registra que `tipo_usuario_id = 1` mapeia para
admin de **associação**. Ou seja: o caminho de "admin enxerga tudo" nunca executa, e quem depende
dele cai no branch seguinte sem erro nenhum.

Foi por causa disso que o `/adm` do site calcula o escopo de propriedades em SQL com
`service_role`, em vez de confiar na RLS.

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
