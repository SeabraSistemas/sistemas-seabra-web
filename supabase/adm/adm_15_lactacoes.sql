-- ═════════════════════════════════════════════════════════════════════════════
-- adm_15_lactacoes.sql — a lactação como unidade, para a tela de lactações
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.lactacao_detalhe  ->  LinhaLactacao
--
-- `lactacao` NAO TEM propriedade_id -- e a unica das tabelas de lancamento em
-- que o tenant so existe via animal. O join com rebanho nao e enfeite: sem ele
-- nao ha como filtrar por fazenda, e uma tela que esquecesse isso somaria a
-- carteira inteira.
--
-- ⚠️ QUATRO ARMADILHAS AUDITADAS NAS 6.416 LINHAS DE HOJE:
--
--   * DUAS COLUNAS DE FIM. `data_fim` (5.306 linhas) e `data_termino` (3.730).
--     Onde as duas existem elas sao iguais em 3.678 de 3.681 casos -- ou seja,
--     `data_termino` e redundante e menos preenchida. O encerramento e
--     coalesce(data_fim, data_termino), que cobre 5.355; escolher so uma
--     deixaria de fora 49 ou 1.625 lactacoes, conforme a escolhida.
--
--   * 1.500 LACTACOES SAO SINTETICAS e dizem isso de si mesmas:
--     confianca_inferencia = 'sintetico', metodo = 'teste_paginacao_20260821',
--     todas de UMA propriedade (a mesma que tem 1.500 producoes datadas em
--     2035-2039). A view as entrega; quem separa e o TypeScript, que as tira das
--     contas e mostra a contagem -- esconder aqui tiraria do operador a chance
--     de mandar limpar.
--
--   * `dias_em_lactacao` VEM SUJO: 1.418 linhas com valor <= 0 (min -59) e 119
--     acima de 600 dias (max 3.593 -- quase dez anos). A view entrega o numero
--     cru; a media e feita so sobre os positivos, no TypeScript, com teste.
--
--   * COMPOSICAO DO LEITE ESTA MORTA nesta tabela: gordura_percentual so tem 57
--     linhas preenchidas de 6.416 (0,9%), e as colunas "corrigidas" idem. Nao
--     sao expostas -- um painel de gordura/proteina por lactacao seria bonito e
--     falaria de 0,9% do rebanho.
--
-- `media_leite` E CONFIAVEL, ao contrario: bate com total_leite/dias em 4.974 de
-- 4.974 linhas em que os tres existem. Vem exposta como esta.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.lactacao_detalhe as
select
  r.propriedade_id,
  l.id                                              as lactacao_id,
  l.animal_id,
  r.numero_animal,
  r.nome_animal,

  -- Preenchida em 100% das linhas (auditado) -- e o que permite comparar
  -- primeira cria com as seguintes, que e a leitura zootecnica classica.
  r.ordem_parto,

  l.data_inicio,
  coalesce(l.data_fim, l.data_termino)              as data_encerramento,
  (coalesce(l.data_fim, l.data_termino) is null)    as aberta,

  -- Cru, podendo ser <= 0 ou absurdamente alto. Ver a nota do cabecalho.
  l.dias_em_lactacao                                as dias,
  l.total_leite,
  l.media_leite,

  -- 'DEFINITIVO' | 'INFERIDO' | 'ESTIMATIVA' | 'sintetico' | null.
  -- E a procedencia do numero, e por isso ela vai para a tela: uma media de
  -- total_leite em que 24% das lactacoes foram INFERIDAS pelo app nao e a mesma
  -- afirmacao que uma em que todas foram medidas.
  l.confianca_inferencia                            as confianca,
  l.metodo_inferencia                               as metodo

from public.lactacao l
join public.rebanho r on r.id = l.animal_id
where l.data_inicio is not null;

comment on view adm.lactacao_detalhe is
  'Uma lactacao por linha, com o animal e a propriedade (que so existe via rebanho). '
  'Encerramento = coalesce(data_fim, data_termino). Traz lactacoes SINTETICAS (confianca = '
  'sintetico) de proposito -- quem separa e o consumidor. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.lactacao_detalhe from public;
revoke all on adm.lactacao_detalhe from anon, authenticated;
grant select on adm.lactacao_detalhe to service_role;
