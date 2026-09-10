-- ═════════════════════════════════════════════════════════════════════════════
-- adm_18_rebanho.sql — o inventario do rebanho e o fluxo de entrada e saida
--
-- Implementa as interfaces declaradas em src/lib/adm/areas/contrato.ts:
--
--   adm.rebanho_inventario  ->  LinhaInventario   (uma linha por propriedade)
--   adm.rebanho_animal      ->  LinhaAnimal       (uma linha por animal)
--
-- ⚠️ A DESCOBERTA QUE DEU ORIGEM A ESTE ARQUIVO, auditada nas 14.521 linhas de
-- `rebanho`: dos 8.359 animais INATIVOS, apenas 1.209 tem venda, 537 tem obito e
-- 18 tem descarte. SOBRAM 6.620 -- 79% -- que sairam do rebanho sem motivo
-- nenhum registrado.
--
-- E o padrao NAO e uniforme, e e isso que o torna util por cliente:
--     propriedade 238 -> 4.176 inativos, 4.176 sem motivo (100%)
--     propriedade 234 -> 1.982 inativos, 1.563 sem motivo (79%)
--     propriedade 244 -> 1.474 inativos,   760 sem motivo (52%)
--     propriedade 233 ->   167 inativos,     0 sem motivo (0%)
--
-- Enquanto esse numero for alto, taxa de mortalidade e taxa de descarte daquela
-- fazenda sao INCALCULAVEIS -- o denominador das saidas e desconhecido. Por isso
-- a view conta os quatro motivos separados, em vez de somar "saidas".
--
-- ⚠️ DESCARTE NAO TEM TABELA: e uma linha de `manejo` com 'descarte' dentro do
-- array `tipo_manejo` (a mesma armadilha ja anotada em adm_07_areas.sql). Sao 19
-- linhas em toda a base.
--
-- ⚠️ TRES ANIMAIS ESTAO 'ativo' COM OBITO REGISTRADO, e um esta ativo com data
-- de venda. Contradicao de cadastro: a view conta pelo `status`, que e o que o
-- app usa para listar o efetivo, e o TypeScript expoe a contradicao a parte.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.rebanho_animal  ->  interface LinhaAnimal
--
-- Uma linha por animal, com o motivo da saida ja resolvido. A tela le so os
-- ATIVOS (filtro no consumidor): a maior propriedade tem 806 ativos e 4.176
-- inativos, e trazer os inativos para montar uma lista de efetivo seria pagar
-- cinco vezes o payload para descartar.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.rebanho_animal as
select
  r.propriedade_id,
  r.id                                          as animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  r.status,
  coalesce(c."Label", c.nome)                   as categoria,
  b.nome_baia                                   as baia,
  r.data_de_nascimento,
  r.idade_dias,
  r.peso_atual,
  r.dias_em_lactacao,
  r.ordem_parto,
  r.gestacao_ativa,
  r.reproducao                                  as status_reproducao,
  r.data_venda,

  -- O MOTIVO DA SAIDA, resolvido na ordem em que os eventos se excluem: quem foi
  -- vendido nao morreu na fazenda, e quem morreu nao foi descartado. 'ativo'
  -- para quem esta no efetivo; 'sem_motivo' e o balde que este arquivo existe
  -- para tornar visivel.
  case
    when r.status = 'ativo'        then 'ativo'
    when r.data_venda is not null  then 'venda'
    when o.id is not null          then 'obito'
    when d.animal_id is not null   then 'descarte'
    else 'sem_motivo'
  end                                           as motivo_saida

from public.rebanho r
left join public.categoria_animal c on c.id = r.categoria
left join public.baias b            on b.id = r.baia_id
left join public.obito o            on o.animal_id = r.id
left join (
  -- 'descarte' dentro do array tipo_manejo -- nao existe tabela de descarte.
  select distinct animal_id from public.manejo where 'descarte' = any(tipo_manejo)
) d on d.animal_id = r.id;

comment on view adm.rebanho_animal is
  'Um animal por linha, com categoria, baia e o motivo da saida resolvido (ativo/venda/obito/'
  'descarte/sem_motivo). Filtrar SEMPRE por propriedade_id, e por status quando so o efetivo '
  'interessa -- ha fazenda com 5x mais inativo que ativo.';

revoke all on adm.rebanho_animal from public;
revoke all on adm.rebanho_animal from anon, authenticated;
grant select on adm.rebanho_animal to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.rebanho_inventario  ->  interface LinhaInventario
--
-- Uma linha por propriedade, com os contadores e o fluxo mensal em jsonb -- o
-- padrao de adm.propriedade_visao_geral. Existe para a tela NAO precisar ler os
-- 4.982 animais de uma fazenda so para contar quantos sairam sem motivo.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.rebanho_inventario as
select
  p.id                                                          as propriedade_id,

  inv.ativos,
  inv.inativos,
  inv.saida_venda,
  inv.saida_obito,
  inv.saida_descarte,
  inv.saida_sem_motivo,

  -- Qualidade do cadastro do EFETIVO (so ativos): sao os buracos que aparecem
  -- em toda outra tela do painel como "—".
  inv.sem_categoria,
  inv.sem_sexo,
  inv.sem_baia,
  inv.sem_nascimento,

  -- Contradicoes: 'ativo' com obito ou com data de venda. Poucos, mas cada um e
  -- um animal que aparece no efetivo e nao existe mais.
  inv.ativos_com_obito,
  inv.ativos_com_venda,

  flu.fluxo_mensal

from public.propriedades p

cross join lateral (
  select
    (count(*) filter (where a.status = 'ativo'))::int                     as ativos,
    (count(*) filter (where a.status = 'inativo'))::int                   as inativos,
    (count(*) filter (where a.motivo_saida = 'venda'))::int               as saida_venda,
    (count(*) filter (where a.motivo_saida = 'obito'))::int               as saida_obito,
    (count(*) filter (where a.motivo_saida = 'descarte'))::int            as saida_descarte,
    (count(*) filter (where a.motivo_saida = 'sem_motivo'))::int          as saida_sem_motivo,
    (count(*) filter (where a.status = 'ativo' and a.categoria is null))::int          as sem_categoria,
    (count(*) filter (where a.status = 'ativo' and a.sexo is null))::int               as sem_sexo,
    (count(*) filter (where a.status = 'ativo' and a.baia is null))::int               as sem_baia,
    (count(*) filter (where a.status = 'ativo' and a.data_de_nascimento is null))::int as sem_nascimento,
    (count(*) filter (where a.status = 'ativo' and a.motivo_saida = 'ativo'
                        and exists (select 1 from public.obito o2 where o2.animal_id = a.animal_id)))::int
                                                                          as ativos_com_obito,
    (count(*) filter (where a.status = 'ativo' and a.data_venda is not null))::int     as ativos_com_venda
  from adm.rebanho_animal a
  where a.propriedade_id = p.id
) inv

cross join lateral (
  -- FLUXO MENSAL dos ultimos 24 meses: nascimentos de um lado, vendas e obitos
  -- do outro. Cada perna tem a SUA data (nascimento, venda, obito) -- nao existe
  -- uma "data de movimento" unica.
  --
  -- O animal que saiu SEM MOTIVO nao aparece aqui, e nao ha como fazer aparecer:
  -- ele nao tem data de saida nenhuma. E por isso que o card de "sem motivo"
  -- fica ao lado do grafico -- o buraco do fluxo esta contado la, nao aqui.
  select coalesce(jsonb_agg(jsonb_build_object(
             'serie',   f.serie,
             'periodo', f.periodo,
             'valor',   f.valor) order by f.serie, f.periodo), '[]'::jsonb) as fluxo_mensal
    from (
      select 'nascimentos'::text as serie, to_char(r.data_de_nascimento, 'YYYY-MM') as periodo, count(*)::int as valor
        from public.rebanho r
       where r.propriedade_id = p.id
         and r.data_de_nascimento >= current_date - interval '24 months'
       group by 2
      union all
      select 'vendas', to_char(v.data_venda, 'YYYY-MM'), count(*)::int
        from public.venda v
       where v.propriedade_id = p.id
         and v.data_venda >= current_date - interval '24 months'
       group by 2
      union all
      select 'obitos', to_char(o.data_obito, 'YYYY-MM'), count(*)::int
        from public.obito o
       where o.propriedade_id = p.id
         and o.data_obito >= current_date - interval '24 months'
       group by 2
    ) f
) flu;

comment on view adm.rebanho_inventario is
  'Uma linha por propriedade: efetivo, motivos de saida (inclusive o balde "sem motivo", que e '
  '79% dos inativos da base), buracos de cadastro do efetivo e o fluxo mensal de 24 meses em jsonb.';

revoke all on adm.rebanho_inventario from public;
revoke all on adm.rebanho_inventario from anon, authenticated;
grant select on adm.rebanho_inventario to service_role;
