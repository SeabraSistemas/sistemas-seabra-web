-- ═════════════════════════════════════════════════════════════════════════════
-- adm_27_saida_leite.sql — para onde vai o leite
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.saida_leite_detalhe  ->  LinhaSaidaLeite
--
-- `saida_leite` registra cada saida do tanque: quantos litros e para onde
-- (laticinio, venda direta, aleitamento de cabrito, consumo). E o outro lado da
-- producao diaria -- o que entrou no tanque contra o que saiu dele.
--
-- ⚠️ `destino` E UM ARRAY. Auditado: nas 150 linhas reais, todas tem UM destino
-- so. A view junta com ' + ' em vez de desaninhar, porque desaninhar contaria os
-- litros de uma saida com dois destinos duas vezes -- e o total que saiu e
-- justamente o numero que a tela compara com a producao.
--
-- ⚠️ O VOCABULARIO E DE CADA FAZENDA. `destino_saida_leite` e cadastro por
-- propriedade ('Laticinio', 'laticinios', 'Leite Rose'...). A view entrega o
-- texto como esta; o TypeScript agrupa sem acento e sem caixa.
--
-- ⚠️ SAIDA NAO E DIARIA. Na fazenda com mais registros, os litros que sairam nos
-- dias de saida somam o DOBRO do que foi produzido nesses mesmos dias: o
-- laticinio coleta o tanque de dois dias. Comparar dia a dia daria "saiu 200% do
-- produzido"; a tela compara por MES, nunca por dia.
--
-- ⚠️ DATA NO FUTURO: 1.500 linhas de uma propriedade de teste vao ate 2039 -- o
-- mesmo padrao de producao_diaria. A view entrega como esta; o TypeScript separa
-- e avisa, pelo mesmo motivo de adm_14.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- Indice: idx_saida_leite_propriedade_data (adm_04_indices.sql).
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.saida_leite_detalhe as
select
  sl.propriedade_id,
  sl.id                                                   as saida_id,
  sl.data_saida                                           as data,
  sl.litros,
  nullif(btrim(array_to_string(sl.destino, ' + ')), '')   as destino,
  nullif(btrim(sl.observacao), '')                        as observacao
from public.saida_leite sl
where sl.data_saida is not null;

comment on view adm.saida_leite_detalhe is
  'Uma saida de leite do tanque por linha. Destinos multiplos vem juntos com " + " (nunca desaninhados: '
  'os litros contariam duas vezes). A saida nao e diaria -- comparar com a producao por MES. '
  'Filtrar SEMPRE por propriedade_id.';

revoke all on adm.saida_leite_detalhe from public;
revoke all on adm.saida_leite_detalhe from anon, authenticated;
grant select on adm.saida_leite_detalhe to service_role;
