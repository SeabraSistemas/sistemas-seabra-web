-- ═════════════════════════════════════════════════════════════════════════════
-- adm_14_producao.sql — o dia a dia do tanque, para a tela de produção diária
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.producao_dia  ->  LinhaProducaoDia
--
-- POR QUE UMA VIEW SE A TABELA JA E QUASE ISSO: a view existe para fixar TRES
-- decisoes num lugar só, em vez de repeti-las em cada consumidor --
--
--   1. `litros_por_lactante` calculado aqui, uma vez. E a metrica que o
--      consultor cobra, e cada tela que a recalculasse seria uma chance de
--      dividir por `total_lactantes` sem tratar o zero.
--   2. `litros_tanque` NAO E EXPOSTA. Parece uma segunda medida (o que o tanque
--      recebeu, contra o que as ordenhas somaram) e nao e: auditado em 3.897
--      linhas, a diferenca media e de 0,07 L -- 0,4% -- e so 20 linhas tem
--      tanque MENOR que a producao. Ela e uma copia, e um card de "reconciliacao
--      tanque x ordenhas" leria zero para sempre, dando ar de conferencia a uma
--      conta que nao confere nada.
--   3. `total_producao` e a fonte do total. Auditado: em 5.257 de 5.257 linhas
--      ele bate exatamente com litros_1_ordenha + litros_2_ordenha. (Ao
--      contrario de controle_leiteiro.total_produzido, que esta nulo em 39% dos
--      casos -- ver adm_12_leite.sql. Mesma ideia, tabelas diferentes,
--      confiabilidade oposta: por isso as duas foram auditadas antes de escolher.)
--
-- ⚠️ DATA NO FUTURO. 1.500 linhas de UMA propriedade estao datadas entre 2035 e
-- 2039 -- 28% da tabela inteira. A view entrega essas linhas como estao; quem
-- separa e o TypeScript, que as tira das medias (producao de 2039 nao e producao)
-- e mostra a contagem como aviso. Filtrar aqui esconderia o problema do operador,
-- que e quem pode mandar o cliente corrigir.
--
-- UMA LINHA POR (propriedade, dia): auditado, 5.257 pares distintos em 5.257
-- linhas. Nao ha fan-out por segmento (toda a base e 'caprino_leiteiro' hoje),
-- entao somar aqui seria somar um item so.
--
-- Rodar DEPOIS de adm_01 (schema adm). Idempotente.
-- Indice exigido: idx_producao_diaria_propriedade_data (adm_04_indices.sql BLOCO I).
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.producao_dia as
select
  pd.propriedade_id,
  pd.data_producao                                        as data,

  pd.total_producao                                       as litros,
  pd.litros_1_ordenha,
  pd.litros_2_ordenha,

  pd.total_lactantes                                      as lactantes,

  -- A metrica de produtividade, calculada uma vez só. `nullif` no denominador:
  -- dia lancado com zero lactante existe (rebanho todo seco) e viraria divisao
  -- por zero; null ali significa "nao da para calcular", que e a verdade.
  case when pd.total_lactantes > 0
       then round(pd.total_producao / pd.total_lactantes, 3)
  end                                                     as litros_por_lactante,

  -- 'duas_ordenhas' | 'ordenha_1' | 'ordenha_2'. E o que separa "a fazenda
  -- ordenha duas vezes" de "a fazenda largou a segunda ordenha" -- que sao a
  -- mesma queda de litros no grafico e dois problemas diferentes.
  pd.modo_lancamento::text                                as modo,
  pd.observacao

from public.producao_diaria pd
where pd.data_producao is not null;

comment on view adm.producao_dia is
  'Producao diaria do tanque, uma linha por (propriedade_id, data). litros = total_producao '
  '(bate 100% com a soma das ordenhas). litros_tanque NAO e exposta de proposito: e copia. '
  'Ha linhas com data no FUTURO -- quem separa e o consumidor. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.producao_dia from public;
revoke all on adm.producao_dia from anon, authenticated;
grant select on adm.producao_dia to service_role;
