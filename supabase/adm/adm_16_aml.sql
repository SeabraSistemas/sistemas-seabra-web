-- ═════════════════════════════════════════════════════════════════════════════
-- adm_16_aml.sql — a avaliacao morfologica linear, animal a animal
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.aml_detalhe  ->  LinhaAml
--
-- ⚠️ AS DUAS COLUNAS ACENTUADAS. Entre os 16 pontos, DOIS tem acento no nome da
-- coluna: "ponto_5_profundidadedeúbere" e "ponto_12_ligamentosuspensóriomedio".
-- Sem as aspas duplas o Postgres nao acha nenhuma das duas -- e o erro nao e
-- silencioso, mas ja custou tempo antes (esta anotado no cabecalho de
-- adm_07_areas.sql). Aqui elas saem com apelido SEM acento, para o TypeScript
-- nunca precisar saber disso.
--
-- ⚠️ A NOTA ESTA GUARDADA TRES VEZES. `ponto_N_*`, `class_N_*` e
-- `classificacao_N_*` tem os MESMOS valores, linha a linha (auditado). Nao ha
-- nota "crua" e nota "convertida": e triplicacao. Esta view expoe so `ponto_N`,
-- e as outras 32 colunas ficam de fora de proposito -- tres colunas para o mesmo
-- numero e tres chances de a tela escolher a errada.
--
-- ⚠️ OS SETE PONTOS DE UBERE NAO SE APLICAM A MACHO. Auditado: os pontos 5, 7,
-- 10, 11, 12, 13 e 14 estao preenchidos em 192 das 213 avaliacoes, e as 21 que
-- faltam sao os 20 machos (mais uma avaliacao 'padrao'). Isso NAO e dado
-- faltando: e a ausencia do orgao. Quem calcular media de ubere sobre as 213
-- esta certo no denominador e errado na pergunta.
--
-- ⚠️ `tipo` MISTURA SEXO E TIPO DE FICHA, E COM ACENTO INCONSISTENTE:
-- 'fêmea' (90), 'femea' (74), 'Padrão' (28), 'macho' (20), 'linear' (1).
-- Agrupar por esta coluna sem normalizar parte as femeas em dois grupos. A view
-- entrega o valor cru; quem normaliza e `normalizarTipo()`, com teste.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.aml_detalhe as
select
  a.propriedade_id,
  a.id                                          as aml_id,
  a.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  a.data_avaliacao,
  a.tecnico_id,

  -- Cru, com acento e tudo. Ver a nota do cabecalho.
  a.tipo,

  -- 0 a 100, e AQUI maior e melhor: e a nota composta da avaliacao, nao um
  -- escore linear descritivo. A base vai de 13,06 a 91,31.
  a.pontuacao_total,

  -- Os nove pontos de CORPO -- preenchidos em toda avaliacao.
  a.ponto_1_mobilidade                          as p1_mobilidade,
  a.ponto_2_larguradepeito                      as p2_largura_peito,
  a.ponto_3_profundidadecorporal                as p3_profundidade_corporal,
  a.ponto_4_angulodegarupa                      as p4_angulo_garupa,
  a.ponto_6_membrosposterioresvistalateral      as p6_membros_lateral,
  a.ponto_8_capacidade                          as p8_capacidade,
  a.ponto_9_larguradegarupa                     as p9_largura_garupa,
  a.ponto_15_membrosposterioresvistaanterior    as p15_membros_anterior,
  a.ponto_16_estruturaossea                     as p16_estrutura_ossea,

  -- Os sete pontos de UBERE -- nulos no macho, por ausencia do orgao.
  a."ponto_5_profundidadedeúbere"               as p5_profundidade_ubere,
  a.ponto_7_ligamentoanteriordeubere            as p7_ligamento_anterior,
  a.ponto_10_ligamentoposteriordeubere          as p10_ligamento_posterior,
  a.ponto_11_volumedeubere                      as p11_volume_ubere,
  a."ponto_12_ligamentosuspensóriomedio"        as p12_ligamento_suspensorio,
  a.ponto_13_posicaodetetos                     as p13_posicao_tetos,
  a.ponto_14_diametrodetetos                    as p14_diametro_tetos

from public.avaliacao_morfologica_linear a
join public.rebanho r on r.id = a.animal_id
where a.data_avaliacao is not null;

comment on view adm.aml_detalhe is
  'Uma AML por linha, com os 16 pontos em apelidos sem acento e a pontuacao total (0-100, maior '
  'e melhor). Os sete pontos de ubere sao NULOS em macho -- ausencia do orgao, nao dado faltando. '
  '`tipo` vem cru e precisa de normalizacao (femea/fêmea). Filtrar SEMPRE por propriedade_id.';

revoke all on adm.aml_detalhe from public;
revoke all on adm.aml_detalhe from anon, authenticated;
grant select on adm.aml_detalhe to service_role;
