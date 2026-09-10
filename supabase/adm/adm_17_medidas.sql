-- ═════════════════════════════════════════════════════════════════════════════
-- adm_17_medidas.sql — as medidas corporais, medicao a medicao
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.medida_detalhe  ->  LinhaMedida
--
-- Irma da AML (adm_16): mesmo tecnico, mesma visita, mesmo animal -- a AML da a
-- NOTA e as medidas dao o CENTIMETRO. Por isso as duas repetem as armadilhas:
--
--   * UMA COLUNA ACENTUADA: "medida_1_perímetrotoracico". Sai com apelido sem
--     acento, como os dois pontos acentuados da AML.
--   * `tipo` COM AS MESMAS DUAS GRAFIAS: 'fêmea' (59) e 'femea' (40), mais
--     'Padrão' (37), 'macho' (13) e 6 nulos. A view entrega cru; quem normaliza
--     e `normalizarTipo()` -- a MESMA funcao da AML, importada, e nao uma copia:
--     duas versoes da mesma regra e como o bug do `mesmaOrigem` nasceu.
--
-- ⚠️ O QUE O DADO REVELA E VALE MAIS QUE QUALQUER MEDIA: em 2025-07-26, na
-- propriedade 227, SEIS medicoes tem perimetro toracico de 19 a 29 cm com
-- altura normal (70 a 78 cm). Cabra de 78 cm de altura tem uns 90 cm de
-- perimetro -- nunca 22. O numero anotado e compativel com a LARGURA de peito
-- (17 a 22 na mesma linha): alguem preencheu o campo errado, o dia inteiro. Mais
-- uma linha na 214 com 12,00 em tudo, que e placeholder.
--
-- A view NAO conserta e NAO esconde: entrega o centimetro como esta, e o
-- TypeScript separa o implausivel das medias e mostra a data. O padrao (mesmo
-- dia, mesma fazenda) e justamente o diagnostico -- e o que permite pedir a
-- remedicao para o tecnico certo.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.medida_detalhe as
select
  m.propriedade_id,
  m.id                                        as medida_id,
  m.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  m.data_medida,
  m.tecnico_id,
  m.tipo,

  -- Corpo (cm).
  m."medida_1_perímetrotoracico"              as perimetro_toracico,
  m.medida_2_altura                           as altura,
  m.altura_garupa,
  m.medida_3_larguradepeito                   as largura_peito,
  m.medida_4_larguradegarupa                  as largura_garupa,

  -- Ubere (cm) -- so em femea, como na AML.
  m.medida_5_ligamentoposteriordeubere        as ligamento_posterior,
  m.medida_6_ligamentosuspensoriomedio        as ligamento_suspensorio,
  m.medida_7_volumedeubere                    as volume_ubere,
  m.medida8_diametrodetetos                   as diametro_tetos,

  -- So em macho, e por isso esta preenchida em 14 das 155 linhas.
  m.medida_circunferenciaescrotal             as circunferencia_escrotal

from public.medidas m
join public.rebanho r on r.id = m.animal_id
where m.data_medida is not null;

comment on view adm.medida_detalhe is
  'Uma medicao por linha, em centimetros, com apelidos sem acento. Traz valores IMPLAUSIVEIS de '
  'proposito (7 perimetros toracicos abaixo de 30 cm, seis deles do mesmo dia na mesma fazenda) -- '
  'quem separa e o consumidor. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.medida_detalhe from public;
revoke all on adm.medida_detalhe from anon, authenticated;
grant select on adm.medida_detalhe to service_role;
