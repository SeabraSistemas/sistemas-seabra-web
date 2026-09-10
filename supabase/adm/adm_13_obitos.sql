-- ═════════════════════════════════════════════════════════════════════════════
-- adm_13_obitos.sql — o detalhe de cada óbito, para a tela de mortalidade
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.obito_detalhe  ->  LinhaObito
--
-- POR QUE UMA VIEW DE DETALHE, se a aba Sanidade ja mostra obitos:
-- `adm.propriedade_sanidade` responde "quantos morreram e a que taxa" (contagem
-- de 12 meses, serie mensal e o top 8 de suspeitas). O que ela NAO responde, e e
-- o que decide manejo: QUEM morreu, com que idade e de que. Mortalidade de
-- neonato e problema de colostro e higiene de baia; mortalidade de adulto e
-- outro assunto inteiro -- e as duas somam no mesmo card de "obitos_12m".
--
-- ⚠️ TRES ARMADILHAS DO DADO REAL, todas auditadas nas 540 linhas de hoje:
--
--   * `suspeita` (text[]) esta preenchida em 213 obitos -- 39%. O ranking de
--     causas TEM que dizer sobre quantos obitos ele fala, senao "Clostridiose
--     lidera com 24%" vira uma afirmacao sobre o rebanho quando e uma afirmacao
--     sobre os 39% que alguem anotou.
--   * `data_de_nascimento` falta em 51 dos 540 (9%): a idade ao obito nao existe
--     para eles. Fica NULL, e a tela mostra a faixa "sem data de nascimento" em
--     vez de empurrar todo mundo para "adulto".
--   * 10 obitos tem data_de_nascimento DEPOIS de data_obito (erro de digitacao),
--     o que daria idade negativa. A view NAO conserta nem esconde: entrega o
--     numero como esta e o TypeScript classifica numa faixa propria. Consertar
--     aqui sumiria com o sinal de que o cadastro tem erro; esconder faria as
--     faixas nao fecharem com o total.
--
-- `obito` tem UNIQUE em animal_id (um obito por animal), entao o join com
-- rebanho nao multiplica linha.
--
-- Rodar DEPOIS de adm_01 (schema adm). Idempotente. O indice que esta view usa
-- (idx_obito_propriedade_data) ja existe desde adm_04_indices.sql BLOCO A.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.obito_detalhe as
select
  o.propriedade_id,
  o.id                                          as obito_id,
  o.animal_id,
  r.numero_animal,
  r.nome_animal,

  -- 'fêmea' COM ACENTO e 'macho' -- os valores reais da coluna. Quem comparar
  -- com 'femea' sem acento perde metade do rebanho sem erro nenhum.
  r.sexo,

  -- rebanho.categoria guarda o UUID da categoria; o rotulo bonito esta em
  -- categoria_animal."Label" (com L maiusculo e entre aspas no schema real).
  coalesce(c."Label", c.nome)                   as categoria,
  b.nome_baia                                   as baia,

  o.data_obito,
  r.data_de_nascimento,

  -- Idade ao obito EM DIAS, crua. Pode vir negativa (ver a nota do cabecalho):
  -- e o TypeScript que decide o que fazer com isso, com teste.
  case when r.data_de_nascimento is not null
       then (o.data_obito - r.data_de_nascimento)::int
  end                                           as idade_dias,

  -- '{}' e nao NULL: o consumidor faz unnest/length sem precisar decidir entre
  -- "nenhuma suspeita" e "coluna vazia" a cada uso.
  coalesce(o.suspeita, '{}')::text[]            as suspeitas,
  o.diagnostico_obito,
  o.sinais_clinicos,
  o.observacao

from public.obito o
join public.rebanho r on r.id = o.animal_id
left join public.categoria_animal c on c.id = r.categoria
left join public.baias b on b.id = r.baia_id
where o.data_obito is not null;

comment on view adm.obito_detalhe is
  'Um obito por linha, com o animal, a idade ao morrer (em dias, podendo ser negativa quando o '
  'cadastro tem data errada) e as suspeitas. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.obito_detalhe from public;
revoke all on adm.obito_detalhe from anon, authenticated;
grant select on adm.obito_detalhe to service_role;
