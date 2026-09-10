-- ═════════════════════════════════════════════════════════════════════════════
-- adm_22_vendas.sql — a venda como evento, animal a animal
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.venda_detalhe  ->  LinhaVenda
--
-- ⚠️ O PRECO ESTA PREENCHIDO EM 100% DAS LINHAS E VAZIO EM 87% DELAS. `valor`
-- nunca e NULL -- mas 1.114 das 1.281 vendas tem valor ZERO. Nao e "vendeu de
-- graca": e o criador registrando a saida do animal sem informar quanto recebeu.
--
-- A consequencia e a mesma do balde "sem motivo" de adm_18: enquanto o preco nao
-- for lancado, RECEITA POR ANIMAL e PRECO MEDIO daquela fazenda nao existem --
-- e uma media que dividisse por 1.281 daria R$ 153, quando o preco medio real
-- das vendas COM valor e sete vezes maior. Por isso a view marca `com_valor` e o
-- TypeScript usa esse denominador em tudo que envolve dinheiro.
--
-- O contraste por fazenda e grande: a propriedade 211 tem 18 vendas somando
-- R$ 54.400 (lanca preco), e a 234 tem 392 vendas somando R$ 2.500 (nao lanca).
--
-- ⚠️ `sessao_coletivo_id` E COLUNA MORTA: zero linhas preenchidas em toda a
-- base. Nao e exposta -- expor coluna que nunca teve valor so cria a duvida de
-- se a tela esta quebrada.
--
-- ⚠️ 44 ANIMAIS APARECEM EM MAIS DE UMA VENDA. Vender duas vezes o mesmo animal
-- e impossivel; a view entrega as duas linhas e o TypeScript conta o caso, que e
-- sintoma de relancamento (ou de venda desfeita sem apagar a primeira).
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- Indice: idx_venda_propriedade_data (adm_04_indices.sql BLOCO A).
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.venda_detalhe as
select
  v.propriedade_id,
  v.id                                          as venda_id,
  v.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  coalesce(c."Label", c.nome)                   as categoria,
  v.data_venda,

  v.valor,
  -- O denominador de tudo que e dinheiro nesta tela. Ver a nota do cabecalho.
  (v.valor is not null and v.valor > 0)         as com_valor,

  r.data_de_nascimento,
  -- Idade ao vender, em dias. NULL sem data de nascimento; pode vir NEGATIVA se
  -- o cadastro tiver nascimento posterior a venda -- o TypeScript trata, como
  -- faz com a idade ao morrer em adm_13.
  case when r.data_de_nascimento is not null
       then (v.data_venda - r.data_de_nascimento)::int
  end                                           as idade_ao_vender,

  r.peso_atual,
  v.observacao

from public.venda v
join public.rebanho r               on r.id = v.animal_id
left join public.categoria_animal c on c.id = r.categoria
where v.data_venda is not null;

comment on view adm.venda_detalhe is
  'Uma venda por linha, com o animal e a idade ao vender. `com_valor` marca as 13% que tem preco '
  'lancado -- e o denominador obrigatorio de qualquer conta de dinheiro aqui. Filtrar SEMPRE por '
  'propriedade_id.';

revoke all on adm.venda_detalhe from public;
revoke all on adm.venda_detalhe from anon, authenticated;
grant select on adm.venda_detalhe to service_role;
