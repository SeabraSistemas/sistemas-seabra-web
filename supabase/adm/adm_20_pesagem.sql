-- ═════════════════════════════════════════════════════════════════════════════
-- adm_20_pesagem.sql — a pesagem como evento, com o GMD calculado
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.pesagem_detalhe  ->  LinhaPesagem
--
-- ⚠️ O GMD GRAVADO NAO SERVE, e isto ja estava anotado em adm_07_areas.sql: a
-- coluna `pesagem.gmd` esta preenchida em 271 das 8.412 linhas (3%), e os
-- valores que ela tem vao de 0,000 a 0,153 -- ordem de grandeza errada para
-- ganho diario de caprino. O app calcula em Dart e nao grava.
--
-- Entao o GMD SAI DAQUI, da diferenca entre pesagens CONSECUTIVAS do mesmo
-- animal (window function), exatamente como a view de Crescimento ja faz.
--
-- ⚠️ E USA O MESMO CORTE DELA: `between -1 and 2` kg/dia. Isto NAO e detalhe de
-- implementacao -- e o que impede a tela de Crescimento e a de Pesagem de
-- mostrarem GMD medio diferente para a mesma fazenda. Quem mexer num corte tem
-- que mexer no outro (adm_07_areas.sql, lateral `gmd`).
--
-- O intervalo tambem e limitado a 15..365 dias: duas pesagens no mesmo mes
-- transformam erro de balanca em GMD gigante (1 kg de diferenca em 2 dias vira
-- 0,5 kg/dia), e mais de um ano entre pesagens nao e ganho diario, e memoria.
--
-- ⚠️ PESO IMPLAUSIVEL: ha UMA linha com 408 kg (o mesmo 408 que aparece em
-- peso_ao_nascer -- provavel digito extra) e duas abaixo de 1 kg. A view entrega
-- cru; o TypeScript separa, como nas outras telas.
--
-- Rodar DEPOIS de adm_01. Idempotente. Indice: idx_pesagem_propriedade_data
-- (adm_04_indices.sql BLOCO A).
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.pesagem_detalhe as
select
  p.propriedade_id,
  p.id                                          as pesagem_id,
  p.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  r.status                                      as status_animal,
  coalesce(c."Label", c.nome)                   as categoria,
  p.data_pesagem,
  p.peso_kg,
  p.idade_dias,

  -- A pesagem anterior DO MESMO ANIMAL. É o par que sustenta o GMD.
  lag(p.peso_kg) over (partition by p.animal_id order by p.data_pesagem, p.id)
                                                as peso_anterior,
  (p.data_pesagem - lag(p.data_pesagem) over (partition by p.animal_id order by p.data_pesagem, p.id))::int
                                                as dias_desde_anterior,

  -- GMD em kg/dia. NULL na primeira pesagem do animal, quando o intervalo esta
  -- fora de 15..365 dias, ou quando o resultado sai da faixa -1..2 (o MESMO
  -- corte da view de Crescimento -- ver o cabecalho).
  case
    when lag(p.peso_kg) over (partition by p.animal_id order by p.data_pesagem, p.id) is not null
     and (p.data_pesagem - lag(p.data_pesagem) over (partition by p.animal_id order by p.data_pesagem, p.id)) between 15 and 365
     and ((p.peso_kg - lag(p.peso_kg) over (partition by p.animal_id order by p.data_pesagem, p.id))
          / (p.data_pesagem - lag(p.data_pesagem) over (partition by p.animal_id order by p.data_pesagem, p.id))) between -1 and 2
    then round(((p.peso_kg - lag(p.peso_kg) over (partition by p.animal_id order by p.data_pesagem, p.id))
          / (p.data_pesagem - lag(p.data_pesagem) over (partition by p.animal_id order by p.data_pesagem, p.id)))::numeric, 4)
  end                                           as gmd,

  -- Meta do app, quando existe (25% das linhas). `progresso` < 100 e o card
  -- "abaixo da meta" da aba Crescimento.
  p.peso_ideal,
  p.progresso

from public.pesagem p
join public.rebanho r               on r.id = p.animal_id
left join public.categoria_animal c on c.id = r.categoria
where p.data_pesagem is not null;

comment on view adm.pesagem_detalhe is
  'Uma pesagem por linha, com a anterior do mesmo animal e o GMD CALCULADO (a coluna pesagem.gmd '
  'so tem 3% de preenchimento e valores de ordem errada). O corte -1..2 kg/dia e o mesmo da view '
  'de Crescimento, de proposito. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.pesagem_detalhe from public;
revoke all on adm.pesagem_detalhe from anon, authenticated;
grant select on adm.pesagem_detalhe to service_role;
