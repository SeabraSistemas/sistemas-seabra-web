-- ═════════════════════════════════════════════════════════════════════════════
-- adm_25_movimentacoes.sql — o animal mudando de lugar
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.movimentacao_detalhe  ->  LinhaMovimentacao
--
-- A aba Estrutura conta baias, lotes e setores parados. Esta view mostra o
-- MOVIMENTO entre eles -- de onde saiu, para onde foi, e quantas vezes o mesmo
-- animal mudou de lugar.
--
-- DOIS TIPOS, e sao coisas diferentes:
--   'lote'        (1.494) -> o animal trocou de LOTE (grupo de manejo)
--   'localizacao'   (710) -> trocou de BAIA/SETOR (lugar fisico)
-- Contar os dois juntos como "movimentacoes" mistura decisao de manejo com
-- mudanca de curral. A view entrega o tipo; a tela separa.
--
-- ⚠️ A ORIGEM COSTUMA SER NULA, e nao e defeito: a PRIMEIRA movimentacao de um
-- animal nao tem de onde. `baia_origem_id` esta em 312 das 2.204 linhas e
-- `lote_origem_id` em 1.306 -- quem contar "movimentos com origem" achara que
-- faltam dados, quando o que falta e o passado.
--
-- ⚠️ `criado_por_usuario_id` ESTA PREENCHIDO EM 2 LINHAS. Nao e exposta: coluna
-- que nunca teve valor so cria a duvida de se a tela quebrou.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.movimentacao_detalhe as
select
  m.propriedade_id,
  m.id                                          as movimentacao_id,
  m.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.status                                      as status_animal,
  coalesce(c."Label", c.nome)                   as categoria,

  -- 'lote' | 'localizacao'
  m.tipo_movimentacao                           as tipo,

  -- A data e timestamptz na origem; vira DATE aqui porque a tela agrupa por dia
  -- e por mes, e a hora do lancamento nao diz nada sobre o manejo.
  m.data_movimentacao::date                     as data_movimentacao,

  bo.nome_baia                                  as baia_origem,
  bd.nome_baia                                  as baia_destino,
  lo.nome_lote                                  as lote_origem,
  ld.nome_lote                                  as lote_destino,
  sd.nome_setor                                 as setor_destino,

  m.observacao

from public.movimentacoes m
join public.rebanho r                 on r.id = m.animal_id
left join public.categoria_animal c   on c.id = r.categoria
left join public.baias bo             on bo.id = m.baia_origem_id
left join public.baias bd             on bd.id = m.baia_destino_id
left join public.lotes lo             on lo.id = m.lote_origem_id
left join public.lotes ld             on ld.id = m.lote_destino_id
left join public.setores sd           on sd.id = m.setor_destino_id
where m.data_movimentacao is not null;

comment on view adm.movimentacao_detalhe is
  'Uma movimentacao por linha, com origem e destino ja resolvidos em nome. `tipo` separa troca de '
  'LOTE (manejo) de troca de BAIA/SETOR (lugar fisico). Origem nula e a primeira movimentacao do '
  'animal, nao dado faltando. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.movimentacao_detalhe from public;
revoke all on adm.movimentacao_detalhe from anon, authenticated;
grant select on adm.movimentacao_detalhe to service_role;
