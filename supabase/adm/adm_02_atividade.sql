-- ============================================================================
-- adm_02_atividade.sql
-- adm.atividade_propriedade -- a peca central do /adm (decisao D2).
--
-- POR QUE ELA EXISTE
-- Nao ha nenhuma coluna de ultima atividade em `usuarios` nem em `propriedades`.
-- Busca no repo inteiro do app: nada de last_sign_in, ultimo_login, ultimo_acesso.
-- O que existe e auth.users.last_sign_in_at, e ele tem dois furos que o
-- desqualificam como "sinal de vida":
--   1. so e alcancavel pela Admin API do Supabase (uma chamada extra por
--      carregamento da lista, fora do PostgREST);
--   2. e NULO para todo colaborador legado, porque usuarios.uuid e nulo neles --
--      o colaborador loga por sha256 contra colaborador_senha_hash, sem passar
--      pelo Supabase Auth.
--
-- O sinal real e o ULTIMO LANCAMENTO: a data mais recente em qualquer das 8
-- tabelas de trabalho diario. Calcular isso na ingenuidade seria MAX(created_at)
-- em 8 tabelas x 31 propriedades a cada carregamento da lista. Esta view faz
-- UMA passada e devolve tudo que a lista, o health score e os cards de risco
-- precisam.
--
-- POR QUE created_at, E NAO A DATA DO EVENTO
-- data_producao / data_pesagem / data_manejo sao a data a que o lancamento SE
-- REFERE, e aceitam retroativo. created_at e QUANDO a pessoa digitou -- que e a
-- pergunta ("esse cliente esta vivo?"). updated_at nao serve: ate 12/08/2026 o
-- app reenviava o carimbo do cache local e a data ANDAVA PARA TRAS (62 casos
-- medidos, o maior recuo de 9 dias). So `rebanho` tem carimbo de servidor hoje.
--
-- AS 8 TABELAS, com propriedade_id + created_at confirmados nos DTOs gerados do
-- banco vivo: controle_leiteiro, producao_diaria, manejo, pesagem, rebanho,
-- venda, obito, saida_leite. Nenhuma delas (fora rebanho) tem coluna de autor --
-- por isso o /adm diz "propriedades ativas", nunca "usuarios ativos".
--
-- Depende de: adm_01 (schema e grants). Substitui o esqueleto criado la.
-- Idempotente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. A view
--
-- `create or replace` (e nao drop/create) de proposito: adm.usuarios_lista e
-- adm.propriedade_visao_geral dependem desta view, e um drop levaria as duas
-- junto. A assinatura de colunas bate com o esqueleto do adm_01 -- se voce
-- mexer nas colunas aqui, mexa la tambem.
-- ----------------------------------------------------------------------------

create or replace view adm.atividade_propriedade as
with lancamentos as (
  -- Uma linha por lancamento, com o modulo de origem. UNION ALL (nao UNION):
  -- deduplicar aqui seria varrer tudo duas vezes para remover linhas que, por
  -- construcao, sao distintas.
  select cl.propriedade_id, cl.created_at, 'controle_leiteiro'::text as modulo
    from public.controle_leiteiro cl
   where cl.propriedade_id is not null and cl.created_at is not null

  union all
  select pd.propriedade_id, pd.created_at, 'producao_diaria'
    from public.producao_diaria pd
   where pd.propriedade_id is not null and pd.created_at is not null

  union all
  -- `manejo` guarda TAMBEM os descartes (nao existe tabela `descarte`: e manejo
  -- com 'descarte' dentro do array tipo_manejo). Aqui eles entram de proposito:
  -- registrar um descarte tambem e trabalho feito no app. Quem NAO pode misturar
  -- os dois e a aba de manejo, que precisa filtrar o array.
  select m.propriedade_id, m.created_at, 'manejo'
    from public.manejo m
   where m.propriedade_id is not null and m.created_at is not null

  union all
  select pe.propriedade_id, pe.created_at, 'pesagem'
    from public.pesagem pe
   where pe.propriedade_id is not null and pe.created_at is not null

  union all
  select r.propriedade_id, r.created_at, 'rebanho'
    from public.rebanho r
   where r.propriedade_id is not null and r.created_at is not null

  union all
  select v.propriedade_id, v.created_at, 'venda'
    from public.venda v
   where v.propriedade_id is not null and v.created_at is not null

  union all
  select o.propriedade_id, o.created_at, 'obito'
    from public.obito o
   where o.propriedade_id is not null and o.created_at is not null

  union all
  -- saida_leite nao tem updated_at, so created_at -- mais um motivo para o
  -- carimbo de atividade ser sempre created_at.
  select sl.propriedade_id, sl.created_at, 'saida_leite'
    from public.saida_leite sl
   where sl.propriedade_id is not null and sl.created_at is not null
),
janelas as (
  select
    l.propriedade_id,
    max(l.created_at)                                                    as ultimo_lancamento_em,
    (count(*) filter (where l.created_at >= now() - interval '7 days'))::bigint  as lancamentos_7d,
    (count(*) filter (where l.created_at >= now() - interval '30 days'))::bigint as lancamentos_30d,
    (count(*) filter (where l.created_at >= now() - interval '90 days'))::bigint as lancamentos_90d,
    -- DIAS DISTINTOS e o numero que mais separa cliente vivo de cliente morto:
    -- 40 lancamentos num sabado a tarde nao valem o mesmo que 12 dias de uso.
    -- O dia e o dia DO PRODUTOR: um lancamento as 22h de Sao Paulo e 01h UTC do
    -- dia seguinte, e contar em UTC inventaria um dia de uso.
    (count(distinct (l.created_at at time zone 'America/Sao_Paulo')::date)
      filter (where l.created_at >= now() - interval '30 days'))::bigint  as dias_distintos_30d,
    -- AMPLITUDE: de quantos dos 8 modulos a conta usou em 90 dias. Separa quem
    -- roda o app inteiro de quem so lanca leite -- o primeiro tem custo de troca
    -- muito maior, e por isso o componente entra no health score.
    (count(distinct l.modulo)
      filter (where l.created_at >= now() - interval '90 days'))::bigint  as modulos_90d
    from lancamentos l
   group by l.propriedade_id
),
ultimo as (
  -- Qual modulo foi o ultimo. distinct on e mais barato que uma window aqui, e
  -- deixa o desempate explicito (mais recente; empate resolve pelo nome, para a
  -- coluna nao ficar instavel entre dois carregamentos).
  select distinct on (l.propriedade_id)
         l.propriedade_id, l.modulo as ultimo_modulo
    from lancamentos l
   order by l.propriedade_id, l.created_at desc, l.modulo
),
profundidade as (
  -- PROFUNDIDADE: quantos animais distintos receberam algum evento em 90 dias.
  -- E o unico componente do health score que nao e gameavel por um lancamento
  -- simbolico -- lancar producao_diaria uma vez por mes nao move este numero.
  -- So as tres tabelas com animal_id entram (producao_diaria e saida_leite sao
  -- da propriedade, nao do animal).
  select p.propriedade_id, count(distinct p.animal_id)::bigint as animais_com_evento_90d
    from (
      select mj.propriedade_id, mj.animal_id
        from public.manejo mj
       where mj.created_at >= now() - interval '90 days' and mj.animal_id is not null
      union all
      select pe.propriedade_id, pe.animal_id
        from public.pesagem pe
       where pe.created_at >= now() - interval '90 days' and pe.animal_id is not null
      union all
      select cl.propriedade_id, cl.animal_id
        from public.controle_leiteiro cl
       where cl.created_at >= now() - interval '90 days' and cl.animal_id is not null
    ) p
   group by p.propriedade_id
)
select
  j.propriedade_id::integer                        as propriedade_id,
  j.ultimo_lancamento_em::timestamptz              as ultimo_lancamento_em,
  ul.ultimo_modulo::text                           as ultimo_modulo,
  j.lancamentos_7d::bigint                         as lancamentos_7d,
  j.lancamentos_30d::bigint                        as lancamentos_30d,
  j.lancamentos_90d::bigint                        as lancamentos_90d,
  j.dias_distintos_30d::bigint                     as dias_distintos_30d,
  j.modulos_90d::bigint                            as modulos_90d,
  coalesce(pf.animais_com_evento_90d, 0)::bigint   as animais_com_evento_90d
from janelas j
left join ultimo ul       on ul.propriedade_id = j.propriedade_id
left join profundidade pf on pf.propriedade_id = j.propriedade_id;

comment on view adm.atividade_propriedade is
  'Sinal de vida por propriedade (D2): ultimo lancamento, volume por janela, '
  'dias distintos em 30d, modulos em 90d e animais tocados em 90d. Base do '
  'health score e das listas de risco. Uma propriedade sem NENHUM lancamento '
  'nao aparece aqui -- o left join de quem consome e que a marca como "nunca lancou".';

revoke all on adm.atividade_propriedade from public;
revoke all on adm.atividade_propriedade from anon, authenticated;
grant select on adm.atividade_propriedade to service_role;

-- ----------------------------------------------------------------------------
-- 2. Custo, e quando isto deixa de servir
--
-- Hoje a view varre as 8 tabelas inteiras a cada chamada. Com os indices
-- (propriedade_id, created_at desc) do adm_04, cada perna vira index-only scan;
-- na escala atual (31 propriedades, ~13 mil animais, controle_leiteiro na casa
-- das dezenas de milhares de linhas) isso e dezenas de milissegundos. Nao vale
-- materializar: MATERIALIZED VIEW traz staleness, job de refresh e o risco de
-- esquecer o refresh -- tres problemas novos para resolver um que nao existe.
--
-- GATILHO OBJETIVO PARA MIGRAR (nao migre antes de medir):
--   `explain analyze select * from adm.atividade_propriedade` passar de ~800 ms
--   com cache frio, OU o total de linhas das 8 tabelas passar de ~1 milhao.
--
-- QUANDO ISSO ACONTECER, o desenho e este -- e repare que a MV NAO pode morar em
-- `adm`: o schema e exposto ao PostgREST e o assert 1 do adm_05 proibe tabela e
-- materialized view la dentro. Ela vai para um schema proprio, nao exposto, e
-- adm.atividade_propriedade continua sendo uma VIEW por cima. Assim o contrato
-- de colunas nao muda e nada no Next precisa saber que virou cache.
--
--   create schema if not exists adm_cache;
--   revoke all on schema adm_cache from public, anon, authenticated;
--   grant usage on schema adm_cache to service_role;
--
--   -- Grao DIARIO, nao agregado: com (propriedade_id, dia, modulo) a mesma MV
--   -- alimenta DAU/WAU/MAU, o grafico de pulso de lancamentos da base e 3 dos 5
--   -- componentes do health score. Agregar direto em "ultimo lancamento"
--   -- economizaria linhas e perderia os tres usos.
--   create materialized view adm_cache.lancamentos_dia as
--   select propriedade_id,
--          (created_at at time zone 'America/Sao_Paulo')::date as dia,
--          modulo,
--          count(*)::bigint as n,
--          max(created_at)  as ultimo_em
--     from ( <as mesmas 8 pernas do UNION ALL acima> ) l
--    group by 1, 2, 3;
--
--   -- UNIQUE e OBRIGATORIO para o REFRESH CONCURRENTLY; sem ele o refresh
--   -- trava a leitura da MV enquanto roda.
--   create unique index if not exists uq_adm_cache_lancamentos_dia
--     on adm_cache.lancamentos_dia (propriedade_id, dia, modulo);
--
--   -- pg_cron ja e usado neste projeto (whatsapp_scheduler_pgcron.sql).
--   -- De hora em hora e suficiente: o /adm responde "esse cliente sumiu?", uma
--   -- pergunta em dias, nao em minutos.
--   select cron.schedule('adm_refresh_lancamentos_dia', '7 * * * *',
--     $$refresh materialized view concurrently adm_cache.lancamentos_dia$$);
--
--   -- E entao adm.atividade_propriedade e reescrita sobre adm_cache.lancamentos_dia
--   -- com as MESMAS 9 colunas -- com uma perda a declarar na tela: as janelas
--   -- passam a ter a idade do ultimo refresh.
-- ----------------------------------------------------------------------------
