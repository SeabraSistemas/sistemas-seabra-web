-- ═════════════════════════════════════════════════════════════════════════════
-- adm_21_manejo.sql — o manejo DESMEMBRADO por tipo de lancamento
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.manejo_detalhe  ->  LinhaManejo
--
-- ⚠️ UMA LINHA POR (MANEJO, TIPO), E NAO POR MANEJO. `manejo.tipo_manejo` e um
-- ARRAY: a mesma ida ao curral pode registrar FAMACHA, escore e casco de uma
-- vez. A view faz `unnest`, entao um manejo com tres tipos vira TRES linhas.
--
-- Isso e o que permite filtrar por tipo direto no PostgREST (`tipo=eq.famacha`),
-- que e o desmembramento que a tela precisa. O preco: contar manejos exige
-- `count(distinct manejo_id)`, nunca `count(*)`. Quem consumir precisa saber --
-- por isso a coluna se chama `manejo_id` e nao `id`.
--
-- OS DEZ TIPOS DA BASE, por volume: famacha (1.710), peso (496),
-- escore_condicao_corporal (390), casco (314), protocolo_sanitario (165),
-- diagnostico_gestacao (150), observacao (82), descarte (19), ubere (13) e
-- cmt (9).
--
-- ⚠️ `casco_status` E TEXTO LIVRE E ESTA SUJO: 'Feito' (293), 'False' (29 --
-- um booleano que vazou para uma coluna de texto), 'A fazer' (16), e mais
-- 'saudavel', 'preventivo', 'Bom' e 'trincado' com uma ocorrencia cada. A view
-- entrega cru; quem normaliza e o TypeScript, que separa "foi feito" de "como
-- esta o casco" -- sao duas perguntas que essa coluna mistura.
--
-- ⚠️ DESCARTE MORA AQUI e nao tem tabela propria (ver adm_07 e adm_18). Sao 19
-- linhas em toda a base -- e o motivo de a aba Sanidade excluir 'descarte' da
-- contagem de manejos, mas INCLUIR as linhas dele nas medias de FAMACHA: a
-- medicao feita naquele animal foi real.
--
-- ⚠️ MANEJO SEM TIPO NAO SOME. 82 manejos (81 de uma fazenda, 2024-2025) tem o
-- array `tipo_manejo` VAZIO -- e carregam 37 FAMACHA, 37 escores e 29 cascos.
-- Com `cross join unnest` eles desapareciam da tela sem aviso, enquanto a aba
-- Sanidade (adm_07) os contava: as duas telas discordavam sobre a mesma fazenda.
-- O `left join ... on true` entrega UMA linha com `tipo` NULL, que o TypeScript
-- rotula "Sem tipo informado" -- a medicao foi real, o que faltou foi marcar.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- Indice: idx_manejo_propriedade_data (adm_04_indices.sql BLOCO A).
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.manejo_detalhe as
select
  m.propriedade_id,
  m.id                                          as manejo_id,
  t.tipo,
  m.animal_id,
  r.numero_animal,
  r.nome_animal,
  coalesce(c."Label", c.nome)                   as categoria,
  m.data_manejo,

  -- Escala INVERTIDA: 1 e animal saudavel, 5 e anemico grave. Media subindo e
  -- noticia ruim (ver o cabecalho de areas/sanidade.ts).
  m.famacha,
  m.escore_corporal,

  -- Texto livre e sujo -- ver a nota do cabecalho.
  m.casco_status,
  m.protocolo_sanitario,

  m.diagnostico_gestacao,
  m.dias_gestacao,
  m.observacao,

  -- California Mastitis Test, metade esquerda e direita do ubere. So 9 linhas
  -- na base, e com grafias inconsistentes ('Neg.' e 'negativo', 'traco' e
  -- 'Traço').
  m.cmt_me,
  m.cmt_md,

  m.sessao_coletivo_id

from public.manejo m
-- LEFT, e nao cross: manejo com array vazio vira UMA linha com tipo NULL em vez
-- de sumir. Ver a nota do cabecalho.
left join lateral unnest(m.tipo_manejo) as t(tipo) on true
join public.rebanho r               on r.id = m.animal_id
left join public.categoria_animal c on c.id = r.categoria
where m.data_manejo is not null;

comment on view adm.manejo_detalhe is
  'Uma linha por (manejo, TIPO): tipo_manejo e array e a view faz unnest, entao o mesmo manejo '
  'aparece uma vez por tipo; tipo NULL e manejo lancado sem tipo (array vazio), uma linha so. '
  'Contar manejos exige count(distinct manejo_id). Filtrar SEMPRE por '
  'propriedade_id, e por tipo quando a tela quiser um lancamento so.';

revoke all on adm.manejo_detalhe from public;
revoke all on adm.manejo_detalhe from anon, authenticated;
grant select on adm.manejo_detalhe to service_role;
