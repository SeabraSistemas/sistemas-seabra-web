-- ═════════════════════════════════════════════════════════════════════════════
-- adm_29_femeas.sql — cada femea ativa e o pe em que esta HOJE
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.femea_situacao  ->  LinhaFemea
--
-- E a base do BALANCO REPRODUTIVO da fazenda: quantas femeas estao gestantes
-- (e quando parem), quantas estao cobertas esperando DG, quantas deram vazio,
-- quantas pariram e ninguem cobriu de novo, quantas cabritas ja tem idade e
-- nunca foram ao bode. O painel antigo em planilha tinha isso ("Balanco do
-- rebanho: prenhas / cobertas / vazias / prontas para cobrir / secar / parto")
-- e o /adm nao tinha -- a aba Reproducao mostra o funil dos ultimos 12 meses,
-- que e outra pergunta.
--
-- ⚠️ NADA AQUI VEM DOS CACHES DE `rebanho` (reproducao, ultima_cobertura,
-- data_dg, gestacao_ativa). Sao gravados por trigger e ficam para tras: na
-- 244, 55 femeas estao "gestante" no cache e 38 delas ja pariram dessa
-- gestacao. A view reconstroi o estado pelos EVENTOS -- ultimo parto, e a
-- cobertura, o DG e o aborto POSTERIORES a ele -- e o TypeScript rotula com a
-- mesma regra do controle leiteiro (areas/situacao-reprodutiva.ts).
--
-- O ULTIMO PARTO e o mais recente entre a cria mais nova com `mae_id` (nao
-- existe tabela de parto; ver adm_07), o cache `rebanho.data_ultimo_parto` e o
-- inicio da ultima lactacao -- `greatest` dos tres, porque cada fazenda lanca
-- por um caminho diferente e o parto que falta num sinal aparece no outro.
--
-- `em_lactacao` = tem lactacao aberta (data_fim nula). `seca_em` = a ultima
-- secagem depois do ultimo parto. Os dois juntos separam "gestante e ainda
-- ordenhando" (devia secar) de "gestante e ja seca" (esta certo).
--
-- O servico vem de adm.servico_reprodutivo (adm_26): coberturas a ate 3 dias
-- ja agrupadas, com metodo e reprodutor. Rodar DEPOIS de adm_26. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.femea_situacao as
with femea as (
  select
    r.id, r.propriedade_id, r.numero_animal, r.nome_animal, r.data_de_nascimento,
    r.baia_id, r.setor_id, r.categoria, r.ordem_parto, r.peso_atual, r.ultima_pesagem_data,
    -- O parto mais recente por QUALQUER dos tres sinais: a cria cadastrada com
    -- mae_id, o cache rebanho.data_ultimo_parto e o inicio da ultima lactacao
    -- (o app abre a lactacao a partir do parto). Na 234 ha femea com cria
    -- cadastrada em 2023 e parto de 2025 so no cache -- ficar com um sinal so
    -- deixaria uma cobertura de 2025 "antes do parto". Ver a nota do cabecalho.
    greatest(
      (select max(c.data_de_nascimento) from public.rebanho c where c.mae_id = r.id),
      r.data_ultimo_parto,
      (select max(l.data_inicio) from public.lactacao l where l.animal_id = r.id and l.data_inicio <= current_date)
    ) as ultimo_parto
  from public.rebanho r
  where r.status = 'ativo'
    and r.sexo ilike 'f%'
    -- 7 femeas ATIVAS estao na categoria Obito/Vendido/Descartado -- baixa que
    -- mudou a categoria e nao o status. Uma morta em "prontas para cobrir" e
    -- pior que a ausencia; o inventario do rebanho (adm_18) e quem aponta.
    and not exists (
      select 1 from public.categoria_animal c
       where c.id = r.categoria
         and lower(c.nome) in ('obito', 'óbito', 'venda', 'vendido', 'descartado', 'descarte')
    )
)
select
  f.propriedade_id,
  f.id                                                     as animal_id,
  f.numero_animal,
  f.nome_animal,
  coalesce(cat."Label", cat.nome)                          as categoria,
  b.nome_baia                                              as baia,
  coalesce(st.nome_setor, stb.nome_setor)                  as setor,
  f.data_de_nascimento,
  case when f.data_de_nascimento is not null
       then (current_date - f.data_de_nascimento)::int end as idade_dias,
  f.ordem_parto,
  f.ultimo_parto,
  case when f.ultimo_parto is not null
       then (current_date - f.ultimo_parto)::int end       as dias_desde_parto,
  exists (
    select 1 from public.lactacao l
     where l.animal_id = f.id and l.data_fim is null
  )                                                        as em_lactacao,
  sec.data_secagem                                         as seca_em,
  f.peso_atual,
  f.ultima_pesagem_data::date                              as ultima_pesagem,

  sv.data_servico                                          as servico_data,
  sv.metodo                                                as servico_metodo,
  sv.reprodutor                                            as servico_reprodutor,
  dg.data_diagnostico                                      as dg_data,
  dg.resultado                                             as dg_resultado,
  ab.data_aborto                                           as aborto_data,

  -- A idade do feto no DG. Quando existe e ela que diz quando a cabra emprenhou
  -- e quando pare -- ver a nota em adm_28. O app faz o mesmo: grava em
  -- rebanho.ultima_cobertura a data do DG menos os dias de gestacao.
  dg.dias_de_gestacao                                      as dg_dias_gestacao,

  -- O ultimo DG NEGATIVO entre a cobertura e o DG positivo. Quando existe, a
  -- cobertura registrada foi refutada -- a femea emprenhou depois, do bode do
  -- piquete, e ai a idade do feto e a unica pista da concepcao. Sem ele, a
  -- cobertura vence o feto: auditado contra 73 partos, a cobertura acertou 64 e
  -- o feto 9 -- o "30 dias" e valor padrao digitado, nao medida.
  dgneg.data_diagnostico                                    as dg_negativo_data

from femea f
left join public.categoria_animal cat on cat.id = f.categoria
left join public.baias b              on b.id = f.baia_id
left join public.setores st           on st.id = f.setor_id
left join public.setores stb          on stb.id = b.setor_id

-- Os tres eventos POSTERIORES ao ultimo parto (todos, quando nunca pariu).
left join lateral (
  select s.data_servico, s.metodo, s.reprodutor
    from adm.servico_reprodutivo s
   where s.animal_id = f.id
     and s.data_servico <= current_date
     and (f.ultimo_parto is null or s.data_servico > f.ultimo_parto)
   order by s.data_servico desc
   limit 1
) sv on true

left join lateral (
  select d.data_diagnostico, lower(btrim(d.diagnostico::text)) as resultado,
         nullif(d.dias_de_gestacao, 0) as dias_de_gestacao
    from public.diagnostico_gestacao d
   where d.animal_id = f.id
     and d.data_diagnostico <= current_date
     and (f.ultimo_parto is null or d.data_diagnostico > f.ultimo_parto)
   order by d.data_diagnostico desc
   limit 1
) dg on true

left join lateral (
  select v.data_diagnostico
    from public.diagnostico_gestacao v
   where v.animal_id = f.id
     and lower(btrim(v.diagnostico::text)) = 'vazia'
     and sv.data_servico is not null
     and v.data_diagnostico > sv.data_servico
     and v.data_diagnostico < dg.data_diagnostico
   order by v.data_diagnostico desc
   limit 1
) dgneg on true

left join lateral (
  select a.data_aborto
    from public.aborto a
   where a.animal_id = f.id
     and a.data_aborto <= current_date
     and (f.ultimo_parto is null or a.data_aborto > f.ultimo_parto)
   order by a.data_aborto desc
   limit 1
) ab on true

left join lateral (
  select s.data_secagem
    from public.secagem s
   where s.animal_id = f.id
     and s.data_secagem <= current_date
     and (f.ultimo_parto is null or s.data_secagem >= f.ultimo_parto)
   order by s.data_secagem desc
   limit 1
) sec on true;

comment on view adm.femea_situacao is
  'Uma femea ATIVA por linha, com o ultimo parto e a cobertura, o DG e o aborto posteriores a ele. '
  'Estado reconstruido pelos eventos, nunca pelos caches de rebanho. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.femea_situacao from public;
revoke all on adm.femea_situacao from anon, authenticated;
grant select on adm.femea_situacao to service_role;
