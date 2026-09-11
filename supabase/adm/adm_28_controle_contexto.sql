-- ═════════════════════════════════════════════════════════════════════════════
-- adm_28_controle_contexto.sql — o CONTEXTO de cada animal no dia do controle
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.controle_leiteiro_contexto  ->  LinhaContextoControle
--
-- A view `controle_leiteiro_animal` (adm_12) diz quanto cada cabra deu no dia.
-- Esta diz EM QUE PE ela estava naquele dia: em que setor, em qual lactacao e
-- ha quantos controles, e -- o que o consultor mais pergunta ao olhar a lista --
-- se esta coberta, se tem diagnostico, e desde quando.
--
-- ⚠️ TUDO E AVALIADO NA DATA DO CONTROLE, NUNCA NO "HOJE". `rebanho.reproducao`,
-- `ultima_cobertura` e `data_dg` sao caches do estado ATUAL do animal, e nao
-- servem para um controle de marco: em 244, o ultimo controle (07/08) tem 55
-- cabras marcadas "gestante" no rebanho, e dessas 38 PARIRAM antes do controle
-- -- a gestacao do cache e a que gerou a lactacao atual, nao uma nova. A view
-- reconstroi o estado a partir dos EVENTOS (servico, DG, aborto) desde o inicio
-- da lactacao ate a data do controle, e o TypeScript decide o rotulo.
--
-- A ANCORA E O INICIO DA LACTACAO: cobertura anterior ao parto e a que gerou
-- a lactacao -- ja deu no que deu. So o que veio DEPOIS do parto diz se a cabra
-- que esta sendo ordenhada ja foi coberta de novo. Sem lactacao conhecida a
-- ancora some e vale o ultimo evento antes do controle, que o TypeScript trata
-- com desconfianca (cobertura velha demais sem desfecho nao e "coberta").
--
-- O servico vem de adm.servico_reprodutivo (adm_26): coberturas da mesma femea
-- a ate 3 dias ja chegam agrupadas, com metodo e reprodutor.
--
-- Rodar DEPOIS de adm_12 e adm_26. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.controle_leiteiro_contexto as
select
  a.propriedade_id,
  a.data_controle,
  a.animal_id,

  -- O setor do animal, ou o da baia dele quando o animal nao tem o seu. So a
  -- propriedade 244 usa setor hoje (G1/G2/G3); nas outras sai null.
  coalesce(st.nome_setor, stb.nome_setor)                    as setor,

  -- Quantas lactacoes o animal tinha comecado ate o controle -- a "ordem" que
  -- vale NAQUELA data, ao contrario de rebanho.ordem_parto, que e a de hoje.
  lact.numero                                                 as lactacao_numero,
  -- A ultima lactacao iniciada ate o controle, cobrindo a data ou nao. Quando
  -- ela ja tinha terminado, a cabra esta sendo ordenhada depois de seca -- e
  -- e isso que `lactacao_anterior_fim` deixa a tela apontar.
  case when a.lactacao_inicio is null then ult.data_fim end   as lactacao_anterior_fim,
  -- A estimativa do proprio app para a lactacao (total e media). Rara: 233
  -- tem em todas, 244 e 238 em 5 animais cada. A tela mostra quando existe.
  nullif(ult.total_leite, 0)                                  as lactacao_total_app,
  nullif(ult.media_leite, 0)                                  as lactacao_media_app,

  -- O que os CONTROLES desta lactacao somam ate hoje: a medida real (ainda que
  -- amostral) do que a cabra ja deu nesta lactacao.
  ctl.controles                                               as controles_na_lactacao,
  ctl.litros                                                  as litros_nos_controles,

  sv.data_servico                                             as servico_data,
  sv.metodo                                                   as servico_metodo,
  sv.reprodutor                                               as servico_reprodutor,
  dg.data_diagnostico                                         as dg_data,
  dg.resultado                                                as dg_resultado,
  ab.data_aborto                                              as aborto_data,

  -- A idade do feto no DG (ultrassom). Quando existe, e ela -- e nao a data da
  -- cobertura -- que diz quando a cabra emprenhou e quando pare: na 244, uma
  -- cabra coberta em 01/03 deu DG vazio em 07/05 e DG gestante em 29/05 com 30
  -- dias -- emprenhou por volta de 29/04, do bode do piquete, sem lancamento.
  -- Pela cobertura o parto seria 29/07 (e "vencido"); pelo feto, fim de setembro.
  dg.dias_de_gestacao                                         as dg_dias_gestacao

from adm.controle_leiteiro_animal a
join public.rebanho r on r.id = a.animal_id
left join public.setores st  on st.id = r.setor_id
left join public.baias b     on b.id = r.baia_id
left join public.setores stb on stb.id = b.setor_id

left join lateral (
  select l.data_inicio, l.data_fim, l.total_leite, l.media_leite
    from public.lactacao l
   where l.animal_id = a.animal_id
     and l.data_inicio <= a.data_controle
   order by l.data_inicio desc
   limit 1
) ult on true

left join lateral (
  select count(*)::int as numero
    from public.lactacao l
   where l.animal_id = a.animal_id
     and l.data_inicio <= a.data_controle
) lact on true

-- Os controles da mesma lactacao ate esta data (inclusive). A ancora e a
-- lactacao que cobre a data; sem ela, a ultima iniciada; sem nenhuma, tudo.
left join lateral (
  select count(*)::int as controles, round(sum(c.litros), 2) as litros
    from adm.controle_leiteiro_animal c
   where c.animal_id = a.animal_id
     and c.data_controle <= a.data_controle
     and c.data_controle >= coalesce(a.lactacao_inicio, ult.data_inicio, date '1900-01-01')
) ctl on true

left join lateral (
  select s.data_servico, s.metodo, s.reprodutor
    from adm.servico_reprodutivo s
   where s.animal_id = a.animal_id
     and s.data_servico <= a.data_controle
     and s.data_servico > coalesce(a.lactacao_inicio, ult.data_inicio, date '1900-01-01')
   order by s.data_servico desc
   limit 1
) sv on true

left join lateral (
  select d.data_diagnostico, lower(btrim(d.diagnostico::text)) as resultado,
         nullif(d.dias_de_gestacao, 0) as dias_de_gestacao
    from public.diagnostico_gestacao d
   where d.animal_id = a.animal_id
     and d.data_diagnostico <= a.data_controle
     and d.data_diagnostico > coalesce(a.lactacao_inicio, ult.data_inicio, date '1900-01-01')
   order by d.data_diagnostico desc
   limit 1
) dg on true

left join lateral (
  select ab.data_aborto
    from public.aborto ab
   where ab.animal_id = a.animal_id
     and ab.data_aborto <= a.data_controle
     and ab.data_aborto > coalesce(a.lactacao_inicio, ult.data_inicio, date '1900-01-01')
   order by ab.data_aborto desc
   limit 1
) ab on true;

comment on view adm.controle_leiteiro_contexto is
  'Uma linha por (propriedade, dia de controle, animal): setor, lactacao e os eventos reprodutivos '
  'desde o inicio da lactacao ate a data do controle. Estado avaliado NA DATA DO CONTROLE, nunca '
  'pelos caches de rebanho. Filtrar SEMPRE por propriedade_id e data_controle.';

revoke all on adm.controle_leiteiro_contexto from public;
revoke all on adm.controle_leiteiro_contexto from anon, authenticated;
grant select on adm.controle_leiteiro_contexto to service_role;
