-- ═════════════════════════════════════════════════════════════════════════════
-- adm_26_servicos.sql — o SERVICO reprodutivo e o desfecho dele
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.servico_reprodutivo  ->  LinhaServico
--
-- A aba Reproducao mostra o funil agregado (coberturas -> DG -> positivos ->
-- partos). Esta view desce ao nivel que decide manejo: CADA servico, com quem
-- cobriu (bode ou semen) e o que aconteceu depois. E o que responde a pergunta
-- reprodutiva mais cara do caprino leiteiro -- QUAL reprodutor emprenha.
--
-- ⚠️ COBERTURA NAO E SERVICO. Esta e a decisao central do arquivo, e ela veio
-- do dado: dos 1.963 pares de coberturas consecutivas da mesma femea, 1.021
-- (52%) estao a 3 dias ou menos uma da outra. Estao concentrados numa fazenda
-- so (646 dos 653 servicos com mais de uma cobertura), e quase todos no MESMO
-- DIA (974 de 1.014 pares nela) -- dupla cobertura no dia, ou o mesmo
-- lancamento feito duas vezes. Nos dois casos e UM servico so.
--
-- Tratar cada linha como servico separado destruiria a taxa de concepcao: mais
-- da metade dos "servicos" seria falsa, e o primeiro de cada par teria a janela
-- de desfecho terminando no dia seguinte -- sem DG, contado como falha. Aqui,
-- coberturas da mesma femea a ate 3 dias uma da outra viram UM servico, datado
-- pela primeira.
--
-- O DESFECHO DE CADA SERVICO fica na JANELA ATE O PROXIMO SERVICO da femea:
-- o DG feito depois de ela ser coberta de novo pertence a cobertura nova, nao a
-- antiga. Sem esse corte, o DG positivo do segundo servico seria creditado ao
-- primeiro, que falhou.
--
-- O PARTO e atribuido ao servico feito 130 a 170 dias antes dele (gestacao
-- caprina ~150 dias) -- e, se dois servicos se qualificarem, ao MAIS RECENTE:
-- a femea que voltou ao cio e foi coberta de novo nao pariu da primeira vez.
--
-- ⚠️ SERVICO COM DOIS REPRODUTORES DIFERENTES NO MESMO CIO tem paternidade
-- ambigua. `reprodutores_no_servico` fica exposto para a tela nao creditar esse
-- servico a nenhum dos dois no ranking por reprodutor.
--
-- `aborto.categoria_pos_aborto` e um UUID de categoria_animal; sai com rotulo.
--
-- Rodar DEPOIS de adm_01. Idempotente. Indices: adm_04_indices.sql BLOCO G.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.servico_reprodutivo as
with coberturas as (
  -- As quatro formas de cobertura, cada uma com o SEU nome de coluna de data e
  -- a SUA forma de identificar quem cobriu.
  select mc.propriedade_id, mc.animal_id_femea as femea, mc.data_da_cobertura as dt,
         'Monta controlada'::text as metodo,
         coalesce(nullif(btrim(rep.nome_animal), ''), rep.numero_animal) as reprodutor
    from public.monta_controlada mc
    left join public.rebanho rep on rep.id = mc.animal_id_reprodutor
  union all
  select ml.propriedade_id, ml.animal_id_femea, ml.data_entrada_reprodutor,
         'Monta livre',
         coalesce(nullif(btrim(rep.nome_animal), ''), rep.numero_animal)
    from public.monta_livre ml
    left join public.rebanho rep on rep.id = ml.animal_id_reprodutor
  union all
  -- Na inseminacao, "quem cobriu" e o semen, identificado por texto livre.
  select i.propriedade_id, i.animal_id_femea, i.data_inseminacao,
         'Inseminação',
         nullif(btrim(i.identificacao_semen), '')
    from public.inseminacao i
  union all
  select te.propriedade_id, te.receptora_id, te.data_transferencia::date,
         'Transferência de embrião',
         'embrião ' || te.embriao_id
    from public.transferencia_embriao te
),
marcadas as (
  -- Uma nova "linha de servico" comeca quando a cobertura anterior da mesma
  -- femea esta a MAIS de 3 dias. Ver a nota do cabecalho.
  select c.*,
         case when c.dt - lag(c.dt) over (partition by c.femea order by c.dt) <= 3
              then 0 else 1 end as novo_servico
    from coberturas c
   where c.dt is not null and c.femea is not null
),
numeradas as (
  select m.*,
         sum(m.novo_servico) over (partition by m.femea order by m.dt
                                   rows between unbounded preceding and current row) as servico_seq
    from marcadas m
),
servicos as (
  select
    n.propriedade_id,
    n.femea,
    n.servico_seq,
    min(n.dt)                                            as data_servico,
    count(*)::int                                        as coberturas,
    count(distinct n.reprodutor)::int                    as reprodutores_no_servico,
    -- O reprodutor da PRIMEIRA cobertura do cio. Quando ha mais de um, a tela
    -- olha `reprodutores_no_servico` e nao credita a ninguem.
    (array_agg(n.reprodutor order by n.dt))[1]           as reprodutor,
    case when count(distinct n.metodo) > 1 then 'Misto'
         else min(n.metodo) end                          as metodo
  from numeradas n
  group by n.propriedade_id, n.femea, n.servico_seq
),
com_proximo as (
  select s.*,
         lead(s.data_servico) over (partition by s.femea order by s.data_servico) as proximo_servico
    from servicos s
)
select
  cp.propriedade_id,
  cp.femea                                               as animal_id,
  r.numero_animal,
  r.nome_animal,
  r.ordem_parto,
  cp.data_servico,
  cp.metodo,
  cp.reprodutor,
  cp.reprodutores_no_servico,
  cp.coberturas,
  cp.proximo_servico,
  (cp.proximo_servico - cp.data_servico)::int            as dias_ate_proximo_servico,

  dg.data_diagnostico                                    as data_dg,
  dg.resultado                                           as resultado_dg,
  (dg.data_diagnostico - cp.data_servico)::int           as dias_ate_dg,

  pa.data_parto,
  ab.data_aborto,
  ab.categoria_pos_aborto

from com_proximo cp
join public.rebanho r on r.id = cp.femea

-- O PRIMEIRO DG da femea dentro da janela do servico (ate o proximo servico,
-- com teto de 170 dias). DG depois da proxima cobertura e da cobertura nova.
left join lateral (
  select d.data_diagnostico, lower(btrim(d.diagnostico::text)) as resultado
    from public.diagnostico_gestacao d
   where d.animal_id = cp.femea
     and d.data_diagnostico >= cp.data_servico
     and d.data_diagnostico <= cp.data_servico + 170
     and (cp.proximo_servico is null or d.data_diagnostico < cp.proximo_servico)
   order by d.data_diagnostico
   limit 1
) dg on true

-- O PARTO que este servico explica: cria nascida 130 a 170 dias depois, e que o
-- servico SEGUINTE nao explicaria (menos de 130 dias depois dele). Ver a nota.
left join lateral (
  select min(cria.data_de_nascimento) as data_parto
    from public.rebanho cria
   where cria.mae_id = cp.femea
     and cria.data_de_nascimento between cp.data_servico + 130 and cp.data_servico + 170
     and (cp.proximo_servico is null or cria.data_de_nascimento - cp.proximo_servico < 130)
) pa on true

left join lateral (
  select a.data_aborto, coalesce(cat."Label", cat.nome) as categoria_pos_aborto
    from public.aborto a
    left join public.categoria_animal cat on cat.id::text = a.categoria_pos_aborto
   where a.animal_id = cp.femea
     and a.data_aborto >= cp.data_servico
     and a.data_aborto <= cp.data_servico + 170
     and (cp.proximo_servico is null or a.data_aborto < cp.proximo_servico)
   order by a.data_aborto
   limit 1
) ab on true;

comment on view adm.servico_reprodutivo is
  'Um SERVICO reprodutivo por linha: coberturas da mesma femea a ate 3 dias viram um servico so '
  '(52% dos pares consecutivos da base, quase todos no mesmo dia). O desfecho (DG, parto, '
  'aborto) fica na janela ate o proximo servico. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.servico_reprodutivo from public;
revoke all on adm.servico_reprodutivo from anon, authenticated;
grant select on adm.servico_reprodutivo to service_role;
