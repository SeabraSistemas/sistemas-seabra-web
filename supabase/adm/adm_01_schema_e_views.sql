-- ============================================================================
-- adm_01_schema_e_views.sql
-- A FRONTEIRA DE LEITURA DO /adm. Schema `adm`, so de VIEWS.
--
-- Por que um schema proprio, e nao ler `public` direto com a service_role:
--   1. O ACL default deste projeto concede arwdDxt a `anon` em TODA tabela nova
--      criada em `public` (conferido em pg_default_acl; ver a nota de
--      migrations/2026-07-21_snapshot_assinaturas_pre_limpeza_extensao.sql:8-13).
--      Qualquer objeto novo nascido em `public` ja nasce legivel pela anon key
--      que viaja dentro do APK. Aqui isso nao acontece.
--   2. Um `select('*')` em public.usuarios traria colaborador_senha (6 senhas em
--      TEXTO PLANO) e 14 CPFs para dentro da memoria do Next, dos logs da Vercel
--      e possivelmente do payload RSC. Com as views, esses campos ficam
--      ESTRUTURALMENTE fora de alcance: nao existem no schema `adm`.
--   3. Da para ler este arquivo inteiro e saber exatamente o que o /adm enxerga.
--
-- REGRA DE OURO, repetida apos cada view: `revoke all ... from public, anon,
-- authenticated` ANTES do `grant select ... to service_role`. O default ACL de
-- `public` ja mordeu este projeto antes; nao confie no default aqui.
--
-- NUNCA criar TABELA nem MATERIALIZED VIEW neste schema (assert 1 do adm_05).
-- O schema fica exposto ao PostgREST, e tabela em schema exposto herda o ACL
-- default. Cache pesado, se um dia existir, vai para o schema `adm_cache`
-- (ver a variante comentada no fim do adm_02).
--
-- RODAR COMO `postgres` (SQL Editor do painel Supabase). As views ficam em
-- security_invoker = OFF (o default) de proposito: elas rodam como o dono e
-- ignoram a RLS instavel de `public`. Espelho invertido do schema `vitrine`,
-- onde as views SAO invoker porque anon precisa continuar filtrado pela RLS.
-- Aqui a seguranca vem 100% do GRANT, nao da RLS.
--
-- Ordem: adm_01 -> adm_02 -> adm_03 -> adm_04 -> adm_05.
-- Idempotente: pode rodar de novo sem efeito colateral.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Schema e privilegios
-- ----------------------------------------------------------------------------

create schema if not exists adm;

comment on schema adm is
  'Fronteira de leitura do painel /adm do site. SO VIEWS, so SELECT, so service_role. '
  'Nenhuma coluna de senha, CPF ou coordenada geografica atravessa este schema.';

-- `public` aqui e o pseudo-papel PUBLIC (todo mundo), nao o schema public.
revoke all on schema adm from public;
revoke all on schema adm from anon, authenticated;

-- Objetos futuros criados neste schema pelo papel corrente ja nascem sem ACL
-- para anon/authenticated/PUBLIC. Nao cobre objeto criado por OUTRO papel --
-- por isso o revoke explicito depois de cada view abaixo, e o assert 2 do adm_05.
alter default privileges in schema adm revoke all on tables from anon, authenticated, public;

grant usage on schema adm to service_role;

-- ----------------------------------------------------------------------------
-- 2. Esqueleto de adm.atividade_propriedade
--
-- adm.usuarios_lista e adm.propriedade_visao_geral LEEM adm.atividade_propriedade,
-- que so ganha corpo no adm_02. Para a ordem numerica dos arquivos continuar
-- valendo, criamos aqui um esqueleto vazio com a assinatura EXATA de colunas; o
-- adm_02 o substitui com `create or replace view`, que exige nome e tipo iguais
-- na mesma ordem -- e por isso os casts explicitos dos dois lados.
--
-- O marcador ESQUELETO_ADM_01 no corpo e o que o assert 7 do adm_05 procura para
-- gritar "voce esqueceu de rodar o adm_02".
-- ----------------------------------------------------------------------------

do $esqueleto$
begin
  if to_regclass('adm.atividade_propriedade') is null then
    execute $v$
      create view adm.atividade_propriedade as
      select
        null::integer     as propriedade_id,        -- ESQUELETO_ADM_01
        null::timestamptz as ultimo_lancamento_em,
        null::text        as ultimo_modulo,
        null::bigint      as lancamentos_7d,
        null::bigint      as lancamentos_30d,
        null::bigint      as lancamentos_90d,
        null::bigint      as dias_distintos_30d,
        null::bigint      as modulos_90d,
        null::bigint      as animais_com_evento_90d
      where false
    $v$;
  end if;
end
$esqueleto$;

revoke all on adm.atividade_propriedade from public;
revoke all on adm.atividade_propriedade from anon, authenticated;
grant select on adm.atividade_propriedade to service_role;

-- ----------------------------------------------------------------------------
-- 3. Recriacao limpa
--
-- `create or replace view` recusa mudanca de colunas. Como este arquivo e a
-- definicao completa das views (menos a atividade, que e do adm_02), dropar em
-- ordem de dependencia deixa o script re-rodavel depois de qualquer edicao.
-- atividade_propriedade NAO entra aqui: quem manda nela e o adm_02.
-- ----------------------------------------------------------------------------

drop view if exists adm.usuarios_lista;
drop view if exists adm.propriedade_visao_geral;
drop view if exists adm.pagamentos_conta;
drop view if exists adm.assinatura_normalizada;
drop view if exists adm.propriedades_escopo;

-- ----------------------------------------------------------------------------
-- 4. adm.propriedades_escopo  ->  interface PropriedadeEscopo
--
-- O tenant real do banco e propriedade_id (93 tabelas o carregam), NAO
-- usuario_id. Esta view e a traducao "um usuario" -> "quais propriedades", e a
-- regra muda por papel. Uma perna de UNION por papel, com prioridade para
-- desempatar quando o mesmo usuario alcanca a mesma propriedade por dois
-- caminhos (acontece: o produtor tem propriedades.produtor_id E
-- usuarios.propriedade_id, e as duas colunas ja divergiram em producao).
--
-- Colunas fora da interface, mas indispensaveis:
--   usuario_id         a chave de filtro (`where usuario_id = $1`)
--   prioridade_vinculo 1 dono | 2 herdado | 3 consultoria | 4 associacao --
--                      usada para escolher a propriedade PRINCIPAL do usuario
--
-- Nao existe latitude/longitude aqui de proposito: coordenada de propriedade
-- rural e localizacao precisa de pessoa fisica. Cidade/estado bastam ao painel.
-- ----------------------------------------------------------------------------

create view adm.propriedades_escopo as
with pernas as (
  -- (1) DONO por propriedades.produtor_id -- o caminho canonico do produtor.
  select p.id as propriedade_id, u.id as usuario_id, 1::smallint as prioridade
    from public.propriedades p
    join public.usuarios u on u.id = p.produtor_id

  union all

  -- (2) DONO por usuarios.propriedade_id -- o produtor tambem carrega a coluna
  -- escalar (o onboarding grava as duas). Resolver so por produtor_id perderia
  -- os casos em que as duas divergiram.
  select u.propriedade_id, u.id, 1::smallint
    from public.usuarios u
   where u.propriedade_id is not null
     and u.regra_de_acesso = 'produtor'

  union all

  -- (3) HERDADO -- colaborador nao tem dado proprio: ele trabalha na
  -- propriedade do produtor dono, e e isso que o painel precisa dizer.
  select u.propriedade_id, u.id, 2::smallint
    from public.usuarios u
   where u.propriedade_id is not null
     and u.regra_de_acesso = 'colaborador'

  union all

  -- (4) CONSULTORIA -- o tecnico tem usuarios.propriedade_id NULL; o vinculo
  -- vive em tecnico_propriedades. `status = 'ativo'` minusculo (CHECK da tabela).
  select tp.propriedade_id, tp.tecnico_id, 3::smallint
    from public.tecnico_propriedades tp
   where tp.status = 'ativo'

  union all

  -- (5) ASSOCIACAO -- o admin de associacao nao tem propriedade; o que ele "tem"
  -- e o agregado dos filiados.
  select p.id, adm_a.id, 4::smallint
    from public.usuarios adm_a
    join public.usuarios filiado
      on filiado.associacao_id = adm_a.associacao_id
    join public.propriedades p on p.produtor_id = filiado.id
   where adm_a.regra_de_acesso = 'admin_associacao'
     and adm_a.associacao_id is not null

  union all

  -- (6) ADMIN GERAL -- ve tudo. O predicado e `administrador AND associacao_id
  -- IS NULL`, o mesmo que o app usa para separar o admin geral do admin de
  -- associacao. Sem o `associacao_id is null` isto viraria um produto cartesiano
  -- toda vez que alguem se auto-promovesse a administrador (a policy
  -- update_own_user e USING(true) sem WITH CHECK -- buraco conhecido em producao).
  select p.id, u.id, 4::smallint
    from public.usuarios u
   cross join public.propriedades p
   where u.regra_de_acesso = 'administrador'
     and u.associacao_id is null
),
resolvido as (
  select distinct on (usuario_id, propriedade_id)
         usuario_id, propriedade_id, prioridade
    from pernas
   where propriedade_id is not null
   order by usuario_id, propriedade_id, prioridade
)
select
  r.usuario_id,
  r.prioridade                                        as prioridade_vinculo,
  p.id,
  p.nome_propriedade                                  as nome,
  nullif(btrim(p.numero_criador), '')                 as numero_criador,
  nullif(btrim(p.estado), '')                         as estado,
  nullif(btrim(p.cidade), '')                         as cidade,
  -- Filtra para os 4 valores fechados do tipo Segmento: lixo historico no
  -- text[] nao pode furar a union do TypeScript.
  coalesce(
    (select array_agg(s order by s)
       from unnest(coalesce(p.segmentos, '{}'::text[])) s
      where s in ('caprino_leiteiro', 'caprino_corte', 'ovino_leiteiro', 'ovino_corte')),
    '{}'::text[]
  )                                                   as segmentos,
  case r.prioridade
    when 1 then 'dono'
    when 2 then 'herdado'
    when 3 then 'consultoria'
    else        'associacao'
  end                                                 as vinculo,
  -- So faz sentido quando o vinculo nao e 'dono': "de quem sao estes dados".
  -- Propriedade de consultoria tem produtor_id NULL -- cai no nome_proprietario,
  -- que e o campo livre que o tecnico preenche.
  case when r.prioridade > 1
       then coalesce(nullif(btrim(dono.nome), ''), nullif(btrim(p.nome_proprietario), ''))
  end                                                 as dono_nome,
  coalesce(reb.animais_ativos, 0)                     as animais_ativos
from resolvido r
join public.propriedades p on p.id = r.propriedade_id
left join public.usuarios dono on dono.id = p.produtor_id
left join lateral (
  -- `status = 'ativo'` MINUSCULO. A versao 'Ativo' nao casa nada -- ja quebrou
  -- view em producao (migrations/fix_view_animais_localizacao_status_ativo.sql)
  -- e e a causa dos dois indices mortos que o adm_04 conserta.
  select count(*)::int as animais_ativos
    from public.rebanho rb
   where rb.propriedade_id = p.id
     and rb.status = 'ativo'
     and rb.data_venda is null
) reb on true;

comment on view adm.propriedades_escopo is
  'Traducao usuario -> propriedades, por papel (dono/herdado/consultoria/associacao). '
  'Filtrar sempre por usuario_id. prioridade_vinculo=1 e a propriedade principal.';

revoke all on adm.propriedades_escopo from public;
revoke all on adm.propriedades_escopo from anon, authenticated;
grant select on adm.propriedades_escopo to service_role;

-- ----------------------------------------------------------------------------
-- 5. adm.assinatura_normalizada  ->  interface AssinaturaResumo (+ KPIs da carteira)
--
-- O MRR HONESTO. Tres defeitos verificados que esta view existe para corrigir:
--
-- (a) `assinaturas` NAO tem UNIQUE por usuario_id. O schema aceita duas linhas
--     para o mesmo dono. Sem DISTINCT ON, uma conta com duas linhas conta duas
--     vezes no MRR. Coluna total_assinaturas_do_dono expoe o caso para a tela
--     pintar de vermelho.
--
-- (b) `usuarios.valor_mensal_promocional` guarda o valor ANUAL quando
--     ciclo='anual', apesar do nome e do proprio COMMENT da coluna
--     (_shared/asaas.ts:342-345 congela `precoBase = plano.valor_anual`, e a
--     renovacao repete em asaas-webhook/index.ts:356-375). Somar direto
--     superestima o assinante anual em ~12x -- justamente o caso que a formula
--     pretendia consertar. Por isso o /12 vem DENTRO do ramo do anual.
--
-- (c) O MRR que o app mostra hoje (asaas-admin-actions/index.ts:344) soma
--     view_status_assinatura.valor_mensal, que e PRECO DE TABELA: ignora
--     desconto de associacao, ignora ciclo anual e ainda soma cortesias.
--     Mantemos os dois lado a lado (valor_real_mensal x valor_tabela_mensal)
--     ate o Felipe confiar na troca. O numero honesto VAI ser menor.
--
-- Nao existe mais periodo de graca: periodo_gracia_ate e atrasos_consecutivos
-- foram DROPADAS em 20260512_simplify_payment_renewal.sql:20-21.
-- Cortesia = data_vencimento >= 2090 (o padrao 2099-12-31 decidido em 21/07/2026).
--
-- view_status_assinatura NAO expoe `ciclo` nem `valor_anual` -- dai o join
-- obrigatorio de volta a `assinaturas` e a `planos`.
-- ----------------------------------------------------------------------------

create view adm.assinatura_normalizada as
with dedup as (
  -- Uma linha por DONO. usuario_id e associacao_id sao mutuamente exclusivos
  -- (CHECK assinatura_owner_check), e ids sao positivos, entao -associacao_id
  -- nunca colide com um usuario_id. Desempate pela vigencia mais longa.
  select distinct on (coalesce(a.usuario_id, -a.associacao_id))
         a.id as assinatura_id,
         a.usuario_id, a.associacao_id, a.plano_id, a.plano_id_pendente,
         a.status, a.ciclo, a.data_inicio, a.data_vencimento,
         a.extensao_manual_ate, a.metodo_pagamento,
         count(*) over (partition by coalesce(a.usuario_id, -a.associacao_id))::int
           as total_assinaturas_do_dono
    from public.assinaturas a
   order by coalesce(a.usuario_id, -a.associacao_id),
            a.data_vencimento desc, a.id desc
),
classificada as (
  select
    d.*,
    p.nome           as plano_nome,
    p.tipo           as plano_tipo,
    p.valor_mensal   as plano_valor_mensal,
    p.valor_anual    as plano_valor_anual,
    pp.nome          as plano_pendente_nome,
    v.status_efetivo,
    v.acesso_ativo,
    v.acesso_ate,
    v.dias_restantes,
    u.valor_mensal_promocional,
    -- Os QUATRO BALDES, mutuamente exclusivos -- e a ordem do CASE que garante
    -- isso. E o que permite o card da carteira somar sem contar ninguem duas
    -- vezes. Cortesia primeiro: uma extensao para 2099 tambem e cortesia, nao
    -- "extensao manual".
    case
      when d.data_vencimento     >= timestamptz '2090-01-01' then 'cortesia'
      when d.extensao_manual_ate >= timestamptz '2090-01-01' then 'cortesia'
      when v.status_efetivo = 'trial'                        then 'trial'
      when d.data_vencimento > now()                         then 'pagante'
      when d.extensao_manual_ate > now()                     then 'extensao'
    end as origem_acesso
  from dedup d
  join public.planos p            on p.id = d.plano_id
  left join public.planos pp      on pp.id = d.plano_id_pendente
  left join public.view_status_assinatura v on v.assinatura_id = d.assinatura_id
  left join public.usuarios u     on u.id = d.usuario_id
)
select
  c.assinatura_id,
  c.usuario_id,
  c.associacao_id,
  c.plano_id,
  c.plano_nome,
  c.plano_tipo,
  -- NUNCA exibir plano_id_pendente como plano atual: e upgrade CONTRATADO E NAO
  -- PAGO. Exibi-lo como vigente repete o vazamento 3 da auditoria.
  c.plano_pendente_nome,
  c.status_efetivo,
  coalesce(c.acesso_ativo, false)                as acesso_ativo,
  c.origem_acesso,
  c.ciclo,
  c.data_inicio,
  c.data_vencimento,
  c.extensao_manual_ate,
  c.acesso_ate,
  c.dias_restantes,
  c.metodo_pagamento,
  c.total_assinaturas_do_dono,

  -- RECEITA REAL DE HOJE. So pagante gera receita: trial ainda nao paga,
  -- cortesia nunca paga, extensao manual e justamente acesso SEM pagamento.
  -- Somar esta coluna com filtro `origem_acesso = 'pagante'` da o MRR honesto.
  round(
    case
      when c.origem_acesso is distinct from 'pagante' then 0
      when c.ciclo = 'anual'
        then coalesce(c.valor_mensal_promocional, c.plano_valor_anual, 0) / 12.0
      else coalesce(c.valor_mensal_promocional, c.plano_valor_mensal, 0)
    end
  , 2)                                            as valor_real_mensal,

  -- O numero que o app mostra hoje: preco de tabela do plano, sem desconto, sem
  -- normalizar ciclo, sem tirar cortesia. Fica exposto para a tela mostrar
  -- "tabela R$ X - real R$ Y" ate a troca ganhar confianca.
  round(coalesce(c.plano_valor_mensal, 0), 2)     as valor_tabela_mensal,

  -- Preco congelado no signup por whitelist de associacao (20% ou 33%).
  (c.valor_mensal_promocional is not null)        as desconto_associacao,

  coalesce(pg.total_pago, 0)                      as total_pago,
  coalesce(pg.em_aberto, 0)                       as em_aberto,
  coalesce(pg.inadimplente, false)                as inadimplente,

  -- Receita em risco = quem vence em <=7 dias + quem ja esta com cobranca
  -- vencida. Cortesia fora: 2099 nunca "vence".
  coalesce(c.acesso_ativo
           and c.origem_acesso = 'pagante'
           and c.data_vencimento <= now() + interval '7 days', false) as vencendo_7d

from classificada c
left join lateral (
  -- PAGO = CONFIRMED/RECEIVED/RECEIVED_IN_CASH (constante STATUS_PAGOS de
  -- _shared/asaas.ts). EM ABERTO = PENDING/OVERDUE. Inadimplente exige a
  -- cobranca ja ter vencido -- um PENDING de vencimento futuro e normal.
  select
    sum(pa.valor) filter (
      where pa.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'))          as total_pago,
    sum(pa.valor) filter (
      where pa.status in ('PENDING', 'OVERDUE'))                                 as em_aberto,
    bool_or(pa.status = 'OVERDUE'
            or (pa.status = 'PENDING' and pa.data_vencimento < current_date))    as inadimplente
    from public.pagamentos pa
   where pa.assinatura_id = c.assinatura_id
) pg on true;

comment on view adm.assinatura_normalizada is
  'Uma linha por dono (DISTINCT ON), com MRR normalizado por ciclo e os 4 baldes '
  'de origem_acesso. valor_real_mensal e 0 fora do balde pagante -- de proposito.';

revoke all on adm.assinatura_normalizada from public;
revoke all on adm.assinatura_normalizada from anon, authenticated;
grant select on adm.assinatura_normalizada to service_role;

-- ----------------------------------------------------------------------------
-- 6. adm.pagamentos_conta  ->  interface PagamentoLinha
--
-- Historico de cobrancas ancorado no DONO, nao na assinatura: o painel filtra
-- por usuario, e a assinatura e detalhe interno. Nenhum artefato de cobranca
-- (pix_payload, boleto_url, invoice_url) atravessa -- sao links que dao acesso a
-- pagina de pagamento do cliente e nao tem uso administrativo no /adm.
-- ----------------------------------------------------------------------------

create view adm.pagamentos_conta as
select
  a.usuario_id,
  a.associacao_id,
  pa.assinatura_id,
  pa.id,
  pa.asaas_payment_id,
  pa.valor,
  pa.status,
  pa.metodo_pagamento,
  pa.data_vencimento,
  pa.data_pagamento,
  pa.tipo_cobranca,
  (pa.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'))                as pago,
  (pa.status = 'OVERDUE'
   or (pa.status = 'PENDING' and pa.data_vencimento < current_date))          as vencido,
  pa.dias_acesso,
  pa.credito_proracao,
  pa.created_at
from public.pagamentos pa
join public.assinaturas a on a.id = pa.assinatura_id;

comment on view adm.pagamentos_conta is
  'Cobrancas Asaas por dono. Filtrar por usuario_id (ou associacao_id). '
  'Sem pix_payload/boleto_url/invoice_url: link de pagamento nao e dado administrativo.';

revoke all on adm.pagamentos_conta from public;
revoke all on adm.pagamentos_conta from anon, authenticated;
grant select on adm.pagamentos_conta to service_role;

-- ----------------------------------------------------------------------------
-- 7. adm.usuarios_lista  ->  interface UsuarioLista
--
-- A lista mestra. D1: a identidade primaria e usuarios.id (11954), nao
-- numero_criador. D2: o sinal de vida e o ultimo LANCAMENTO, nao o ultimo login
-- (auth.users nao e consultavel pelo PostgREST e e nulo para todo colaborador
-- legado, que nem passa pelo Supabase Auth).
--
-- MASCARA EM SQL, NAO EM REACT. Se a mascara fosse no componente, o valor cru ja
-- teria viajado no payload RSC e estaria no DevTools -- mascara decorativa. Aqui
-- o valor cru NAO SAI DO BANCO nesta view; revelar e uma RPC dedicada, auditada.
-- CPF nunca sai, nem mascarado: so `tem_cpf`. Sao 14 CPFs na base -- o campo de
-- maior risco e o de menor utilidade administrativa.
--
-- MRR NAO SE SOMA DAQUI. Esta view junta apenas a assinatura PROPRIA do usuario
-- (usuario_id = u.id). Colaborador aparece com plano nulo (ele herda o acesso do
-- produtor dono) e a assinatura de uma associacao aparece so em
-- adm.assinatura_normalizada, com associacao_id preenchido. Somar plano por aqui
-- contaria pessoas, nao contratos. A fonte do MRR e adm.assinatura_normalizada.
-- ----------------------------------------------------------------------------

create view adm.usuarios_lista as
select
  u.id,
  u.nome,

  -- Colaborador tem e-mail sintetico <username>@colaborador.seabra; o dominio
  -- fica visivel de proposito, porque e ele que identifica o tipo de conta.
  case
    when nullif(btrim(u.email), '') is null then null
    when position('@' in u.email) = 0      then left(btrim(u.email), 1) || '***'
    else left(btrim(u.email), 1) || '***@' || split_part(btrim(u.email), '@', 2)
  end                                                     as email_mascarado,

  -- whatsapp_pessoal e E.164 so digitos, sem '+'. NAO existe usuarios.telefone.
  case
    when nullif(btrim(u.whatsapp_pessoal), '') is null then null
    when length(btrim(u.whatsapp_pessoal)) < 4         then '****'
    else '(**) *****-' || right(btrim(u.whatsapp_pessoal), 4)
  end                                                     as whatsapp_mascarado,
  nullif(btrim(u.whatsapp_pais), '')                      as whatsapp_pais,

  -- regra_de_acesso e o papel CANONICO. tipo_usuario_id e dado sujo: o Admin
  -- Geral real tem tipo_usuario_id = 2, e e por isso que o branch de admin
  -- global do helper app_propriedades_acessiveis() (que testa = 1) esta morto.
  -- Valor fora da lista fechada vira NULL para nao furar a union do TypeScript.
  case
    when u.regra_de_acesso in ('administrador', 'admin_associacao',
                               'produtor', 'tecnico', 'colaborador')
    then u.regra_de_acesso
  end                                                     as papel,

  -- ativo NULL e legado, e legado esta ATIVO: o app so barra em ativo = false.
  -- Tratar NULL como false desativaria contas boas na tela.
  coalesce(u.ativo, true)                                 as ativo,
  coalesce(u.is_tester, false)                            as is_tester,
  coalesce(u.is_demo, false)                              as is_demo,
  (u.cpf is not null and btrim(u.cpf) <> '')              as tem_cpf,
  (u.uuid is null)                                        as sem_auth,
  coalesce(u.onboarding_finalizado, false)                as onboarding_finalizado,
  u.data_cadastro,

  u.associacao_id,
  ass.nome                                                as associacao_nome,

  pp.id                                                   as propriedade_id,
  pp.nome                                                 as propriedade_nome,
  pp.numero_criador,
  pp.estado,
  coalesce(pp.segmentos, '{}'::text[])                    as segmentos,
  coalesce(esc.total_propriedades, 0)                     as total_propriedades,

  -- Soma do ESCOPO inteiro, nao so da principal: para o consultor com 7 clientes
  -- o numero util e quantos animais a conta alcanca.
  coalesce(esc.animais_ativos, 0)                         as animais_ativos,

  an.plano_nome,
  an.status_efetivo,
  coalesce(an.acesso_ativo, false)                        as acesso_ativo,
  an.origem_acesso,
  an.valor_real_mensal,
  an.data_vencimento,

  ativ.ultimo_lancamento_em,
  ativ.ultimo_modulo,
  coalesce(ativ.lancamentos_30d, 0)                       as lancamentos_30d,
  case when ativ.ultimo_lancamento_em is not null
       then floor(extract(epoch from (now() - ativ.ultimo_lancamento_em)) / 86400)::int
  end                                                     as dias_sem_lancar,

  -- HEALTH SCORE 0-100. Componentes e pesos vivem em
  -- docs/internal/ADM_DASHBOARD_DESENHO.md; o explicador da tela (HealthScore /
  -- ComponenteHealth) TEM que reusar estes mesmos numeros, senao a barra explica
  -- um score diferente do que ordenou a lista.
  --
  --   35 recencia    dias desde o ultimo lancamento   >=30d -> 0 | <=2d -> 1
  --   25 frequencia  dias distintos com lancamento/30d    0 -> 0 | >=12 -> 1
  --   15 amplitude   modulos distintos usados em 90d      0 -> 0 | >=4  -> 1
  --   10 profundidade animais com evento 90d / vivos      0 -> 0 | >=60% -> 1
  --   15 cobranca    escada discreta (abaixo)
  --
  -- Os quatro primeiros sao POR PROPRIEDADE; a agregacao para a conta e a
  -- MEDIANA, nao a soma -- senao um consultor com 7 clientes parece 7x mais
  -- saudavel. Cobranca e por conta.
  --
  -- Guard-rails que evitam o score mentir (null = "nao da para pontuar ainda"):
  --   conta com menos de 14 dias de cadastro, ou sem animal vivo,
  --   ou sem assinatura propria (colaborador herda o acesso do produtor).
  case
    when u.data_cadastro is null or u.data_cadastro > now() - interval '14 days' then null
    when coalesce(esc.animais_ativos, 0) = 0                                     then null
    when an.assinatura_id is null                                                then null
    else least(100, greatest(0, round(
           coalesce(ativ.saude_propriedade_mediana, 0)
           + 15 * case
                    when an.origem_acesso = 'cortesia'       then 1.0
                    when an.origem_acesso = 'extensao'       then 0.4
                    when an.acesso_ativo and an.inadimplente then 0.3
                    when an.acesso_ativo                     then 1.0
                    else 0.0
                  end
         )))::int
  end                                                     as health_score,

  -- ─────────────────────────────────────────────────────────────────────────
  -- CAMPO DE BUSCA. Existe SO para o `ilike` do campo unico de pesquisa em
  -- /adm/usuarios: digitar "11954" acha pelo id, "boa vista" acha pela fazenda,
  -- e um pedaco de telefone acha pelo whatsapp.
  --
  -- ⚠️ NUNCA PROJETAR ESTA COLUNA. Ela contem o e-mail e o whatsapp CRUS: se
  -- entrar num select, o dado que as colunas *_mascarado escondem viaja no
  -- payload RSC e reaparece no DevTools -- a mascara feita em SQL viraria
  -- decoracao. E por isso que COLUNAS_USUARIO em src/lib/adm/queries.ts e uma
  -- lista explicita e nunca `select('*')`, e por isso que adm_05 levanta
  -- excecao se alguem projeta-la.
  --
  -- unaccent nao esta garantido como extensao instalada; translate() cobre as
  -- letras acentuadas que aparecem em nome de criador e de fazenda no pt-BR.
  -- ─────────────────────────────────────────────────────────────────────────
  lower(translate(
    concat_ws(' ',
      u.id::text,
      u.nome,
      u.email,
      regexp_replace(coalesce(u.whatsapp_pessoal, ''), '[^0-9]', '', 'g'),
      regexp_replace(coalesce(u.cpf, ''),              '[^0-9]', '', 'g'),
      esc.nome,
      esc.numero_criador
    ),
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
  ))                                                      as busca

from public.usuarios u
left join public.associacoes ass on ass.id = u.associacao_id

-- Assinatura PROPRIA. Ver a nota de "MRR nao se soma daqui", acima.
left join adm.assinatura_normalizada an on an.usuario_id = u.id

left join lateral (
  select count(*)::int                        as total_propriedades,
         coalesce(sum(e.animais_ativos), 0)::int as animais_ativos
    from adm.propriedades_escopo e
   where e.usuario_id = u.id
) esc on true

-- A propriedade PRINCIPAL: menor prioridade de vinculo, depois menor id.
-- Para 30 dos 31 produtores existe exatamente uma, e o seletor da tela colapsa.
left join lateral (
  select e.id, e.nome, e.numero_criador, e.estado, e.segmentos
    from adm.propriedades_escopo e
   where e.usuario_id = u.id
   order by e.prioridade_vinculo, e.id
   limit 1
) pp on true

left join lateral (
  select
    max(t.ultimo_lancamento_em)                                    as ultimo_lancamento_em,
    coalesce(sum(t.lancamentos_30d), 0)::bigint                    as lancamentos_30d,
    (array_agg(t.ultimo_modulo
       order by t.ultimo_lancamento_em desc nulls last))[1]        as ultimo_modulo,
    percentile_cont(0.5) within group (order by (
        35 * greatest(0, least(1,
              (30 - coalesce(
                      extract(epoch from (now() - t.ultimo_lancamento_em)) / 86400,
                      999)) / 28.0))
      + 25 * least(1, coalesce(t.dias_distintos_30d, 0) / 12.0)
      + 15 * least(1, coalesce(t.modulos_90d, 0) / 4.0)
      + 10 * least(1, coalesce(coalesce(t.animais_com_evento_90d, 0)::numeric
                       / nullif(e.animais_ativos, 0), 0) / 0.60)
    )::double precision)                                           as saude_propriedade_mediana
    from adm.propriedades_escopo e
    join adm.atividade_propriedade t on t.propriedade_id = e.id
   where e.usuario_id = u.id
) ativ on true;

comment on view adm.usuarios_lista is
  'Lista mestra do /adm. E-mail e whatsapp mascarados em SQL; CPF so como tem_cpf. '
  'D1: id = usuarios.id. D2: recencia vem de adm.atividade_propriedade, nao de login.';

revoke all on adm.usuarios_lista from public;
revoke all on adm.usuarios_lista from anon, authenticated;
grant select on adm.usuarios_lista to service_role;

-- ----------------------------------------------------------------------------
-- 8. adm.propriedade_visao_geral  ->  interface VisaoGeralPropriedade
--
-- Reusa public.view_dashboard_produtor_dados_gerais para media_del (o DEL medio
-- depende da logica de lactacao do app, e reimplementar aqui so criaria um
-- segundo numero para o Felipe conferir). O resto vem das tabelas base porque a
-- view do app soma ativos E inativos em total_femeas/total_machos, e o painel
-- precisa do recorte de rebanho VIVO.
--
-- Escrita com `propriedades p cross join lateral (...)`: um
-- `where propriedade_id = $1` restringe p primeiro e cada lateral roda para uma
-- propriedade so. Sem esse formato a view agregaria as 31 propriedades a cada
-- abertura de ficha.
-- ----------------------------------------------------------------------------

create view adm.propriedade_visao_geral as
select
  p.id                                                    as propriedade_id,
  coalesce(reb.ativos, 0)                                 as animais_ativos,
  coalesce(reb.inativos, 0)                               as animais_inativos,
  coalesce(reb.femeas, 0)                                 as femeas,
  coalesce(reb.machos, 0)                                 as machos,
  coalesce(reb.lactantes, 0)                              as lactantes,
  coalesce(reb.gestantes, 0)                              as gestantes,
  dg.media_del,
  prod.producao_30d,
  prod.media_producao_dia,
  prod.media_por_lactante_dia,
  coalesce(t.lancamentos_30d, 0)                          as lancamentos_30d,
  case when t.ultimo_lancamento_em is not null
       then floor(extract(epoch from (now() - t.ultimo_lancamento_em)) / 86400)::int
  end                                                     as dias_sem_lancar,
  coalesce(eq.colaboradores, 0)                           as colaboradores,
  coalesce(eq.tecnicos_vinculados, 0)                     as tecnicos_vinculados,
  cat.por_categoria,
  rac.por_raca,
  pir.piramide_etaria,
  ser.producao_diaria_90d
from public.propriedades p

left join public.view_dashboard_produtor_dados_gerais dg on dg.propriedade_id = p.id
left join adm.atividade_propriedade t                    on t.propriedade_id = p.id

cross join lateral (
  select
    (count(*) filter (where r.status = 'ativo' and r.data_venda is null))::int      as ativos,
    (count(*) filter (where r.status <> 'ativo' or r.data_venda is not null))::int  as inativos,
    -- 'fêmea' COM ACENTO -- o banco grava {'fêmea':7304,'macho':4317,null:328}.
    -- 'femea' sem acento casa zero linhas e some com metade do rebanho na tela.
    (count(*) filter (where r.status = 'ativo' and r.data_venda is null
                        and r.sexo = 'fêmea'))::int                               as femeas,
    (count(*) filter (where r.status = 'ativo' and r.data_venda is null
                        and r.sexo = 'macho'))::int                               as machos,
    (count(*) filter (where r.status = 'ativo' and r.data_venda is null
                        and ca.nome = 'lactante'))::int                           as lactantes,
    (count(*) filter (where r.status = 'ativo' and r.data_venda is null
                        and coalesce(r.gestacao_ativa, false)))::int              as gestantes
    from public.rebanho r
    -- rebanho.categoria guarda o UUID da categoria, NAO o nome. Comparar com
    -- 'lactante' direto nunca casa e nao da erro -- a tela so fica vazia.
    -- Cast para text dos dois lados porque o tipo declarado da coluna divergiu
    -- entre uuid e text ao longo das migrations; categoria_animal e catalogo
    -- pequeno (dezenas de linhas), entao o cast nao custa plano.
    left join public.categoria_animal ca on ca.id::text = r.categoria::text
   where r.propriedade_id = p.id
) reb

cross join lateral (
  -- Dividir pelos dias LANCADOS, nao por 30: quem lanca 3x por semana nao e
  -- improdutivo, e menos frequente -- e isso ja e medido pelo health score.
  -- producao_diaria e UNIQUE (propriedade_id, data_producao, segmento): um
  -- produtor caprino+ovino tem 2 linhas por dia, e a soma aqui junta as especies.
  select
    round(sum(pd.total_producao), 2)                                         as producao_30d,
    round(sum(pd.total_producao)
          / nullif(count(distinct pd.data_producao), 0), 2)                  as media_producao_dia,
    round(sum(pd.total_producao)
          / nullif(sum(pd.total_lactantes), 0), 2)                           as media_por_lactante_dia
    from public.producao_diaria pd
   where pd.propriedade_id = p.id
     and pd.data_producao >= current_date - 29
) prod

cross join lateral (
  select
    (select count(*)::int from public.usuarios cu
      where cu.propriedade_id = p.id
        and cu.regra_de_acesso = 'colaborador')                              as colaboradores,
    (select count(*)::int from public.tecnico_propriedades tp
      where tp.propriedade_id = p.id
        and tp.status = 'ativo')                                             as tecnicos_vinculados
) eq

cross join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.valor desc), '[]'::jsonb) as por_categoria
    from (select coalesce(nullif(btrim(ca.nome), ''), '(sem categoria)') as rotulo,
                 count(*)::int                                          as valor
            from public.rebanho r
            left join public.categoria_animal ca on ca.id::text = r.categoria::text
           where r.propriedade_id = p.id and r.status = 'ativo' and r.data_venda is null
           group by 1) x
) cat

cross join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.valor desc), '[]'::jsonb) as por_raca
    from (select coalesce(nullif(btrim(r.raca), ''), '(sem raca)') as rotulo,
                 count(*)::int                                    as valor
            from public.rebanho r
           where r.propriedade_id = p.id and r.status = 'ativo' and r.data_venda is null
           group by 1) x
) rac

cross join lateral (
  -- Piramide etaria: ordem cronologica, nao por contagem -- piramide ordenada
  -- por volume deixa de ser piramide.
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.ordem), '[]'::jsonb) as piramide_etaria
    from (select case
                   when r.idade_dias is null   then 6
                   when r.idade_dias <= 60     then 1
                   when r.idade_dias <= 180    then 2
                   when r.idade_dias <= 365    then 3
                   when r.idade_dias <= 1095   then 4
                   else 5
                 end                                        as ordem,
                 case
                   when r.idade_dias is null   then 'sem nascimento'
                   when r.idade_dias <= 60     then '0-60 dias'
                   when r.idade_dias <= 180    then '61-180 dias'
                   when r.idade_dias <= 365    then '181-365 dias'
                   when r.idade_dias <= 1095   then '1-3 anos'
                   else '3+ anos'
                 end                                        as rotulo,
                 count(*)::int                              as valor
            from public.rebanho r
           where r.propriedade_id = p.id and r.status = 'ativo' and r.data_venda is null
           group by 1, 2) x
) pir

cross join lateral (
  -- 90 dias de producao. O dia SEM lancamento nao vira zero: fica ausente, e a
  -- lacuna e a informacao (o grafico desenha com connectNulls={false}).
  select coalesce(jsonb_agg(jsonb_build_object(
             'periodo', to_char(x.dia, 'YYYY-MM-DD'),
             'valor',   x.litros) order by x.dia), '[]'::jsonb) as producao_diaria_90d
    from (select pd.data_producao       as dia,
                 round(sum(pd.total_producao), 2) as litros
            from public.producao_diaria pd
           where pd.propriedade_id = p.id
             and pd.data_producao >= current_date - 89
           group by 1) x
) ser;

comment on view adm.propriedade_visao_geral is
  'Cards e graficos da aba Visao geral, uma linha por propriedade. '
  'Filtrar SEMPRE por propriedade_id: sem filtro, agrega a base inteira.';

revoke all on adm.propriedade_visao_geral from public;
revoke all on adm.propriedade_visao_geral from anon, authenticated;
grant select on adm.propriedade_visao_geral to service_role;

-- ----------------------------------------------------------------------------
-- 9. Fecho
--
-- Reforco final: nenhum objeto deste schema pode ser gravavel, e nenhum papel
-- alem de service_role pode le-lo. O adm_05 transforma isto em assert.
-- ----------------------------------------------------------------------------

revoke all on all tables in schema adm from public;
revoke all on all tables in schema adm from anon, authenticated;
grant select on all tables in schema adm to service_role;

-- PASSO MANUAL OBRIGATORIO, e a pegadinha que custa uma tarde:
-- Painel Supabase -> Settings -> API -> Exposed schemas -> adicionar `adm`
-- -> Reload schema cache. Sem isso o PostgREST devolve PGRST106/PGRST205 e o
-- /adm nao le nada. Expor e SEGURO porque os grants sao explicitos: uma
-- requisicao com a anon key roda como `anon`, que nao tem USAGE aqui.
