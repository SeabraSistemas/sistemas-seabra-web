-- ═════════════════════════════════════════════════════════════════════════════
-- adm_23_secagem.sql — a secagem e o PERIODO SECO calculado
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.secagem_detalhe  ->  LinhaSecagem
--
-- ⚠️ O NUMERO QUE IMPORTA NAO ESTA EM COLUNA NENHUMA. `secagem.del` existe, mas
-- so em 255 das 765 linhas (33%) e com lixo dentro: minimo -1, media 1.194 e
-- MAXIMO 20.617 dias -- 56 anos de lactacao. Nao da para usar.
--
-- O que interessa e o PERIODO SECO: quantos dias a femea ficou seca entre a
-- secagem e o PARTO SEGUINTE. E o indicador classico de manejo pre-parto:
--   · curto demais (menos de 30 dias) -> a glandula nao regenera e a proxima
--     lactacao vem menor;
--   · longo demais -> a femea come sem produzir.
-- O alvo em caprino leiteiro fica em torno de 60 dias.
--
-- Ele sai daqui, por lateral: o MENOR nascimento de cria daquela mae posterior a
-- data da secagem. Como nao existe tabela de parto (ver adm_07 e adm_19), o
-- parto seguinte e a chegada da cria em `rebanho` com mae_id.
--
-- Auditado: 525 das 765 secagens tem parto posterior, e 474 caem numa janela
-- plausivel (1 a 200 dias), com media de 72 dias.
--
-- ⚠️ `tipo_secagem` TEM 'Natural' (526) E 'natural' (1) -- a mesma inconsistencia
-- de caixa que ja apareceu em `tipo` da AML e das medidas. A view entrega cru; o
-- TypeScript normaliza.
--
-- ⚠️ `confirmada` NAO E DETALHE: 159 das 765 estao FALSE. Secagem nao confirmada
-- e previsao do app, nao evento -- misturar as duas contaria como feito o que
-- ainda nao foi.
--
-- `sessao_coletivo_id` esta vazia em toda a base e `lactacao_id` em 97% -- as
-- duas ficam de fora.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.secagem_detalhe as
select
  s.propriedade_id,
  s.id                                          as secagem_id,
  s.animal_id,
  r.numero_animal,
  r.nome_animal,
  coalesce(c."Label", c.nome)                   as categoria,
  r.ordem_parto,
  s.data_secagem,

  -- Cru: 'Natural', 'Manual', 'Pré-Parto', 'Espontânea', 'Estimada Automática'
  -- e um 'natural' minusculo. Ver a nota do cabecalho.
  s.tipo_secagem,

  -- false = previsao do app, nao evento acontecido.
  s.confirmada,

  -- O PARTO SEGUINTE daquela mae, e o periodo seco em dias. NULL quando a femea
  -- ainda nao pariu depois desta secagem -- o que e o normal para a secagem
  -- recente, e nao falha de dado.
  prox.proximo_parto,
  case when prox.proximo_parto is not null
       then (prox.proximo_parto - s.data_secagem)::int
  end                                           as periodo_seco,

  s.observacao

from public.secagem s
join public.rebanho r               on r.id = s.animal_id
left join public.categoria_animal c on c.id = r.categoria
cross join lateral (
  -- A primeira cria nascida DEPOIS desta secagem. `min` e nao `limit 1` para o
  -- planner poder usar o indice de mae_id sem ordenar a ninhada inteira.
  select min(cria.data_de_nascimento) as proximo_parto
    from public.rebanho cria
   where cria.mae_id = s.animal_id
     and cria.data_de_nascimento > s.data_secagem
) prox
where s.data_secagem is not null;

comment on view adm.secagem_detalhe is
  'Uma secagem por linha, com o PERIODO SECO calculado (dias ate o parto seguinte da mesma femea). '
  'A coluna secagem.del do app nao serve: 33% de preenchimento e maximo de 20.617 dias. '
  '`confirmada` = false e previsao, nao evento. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.secagem_detalhe from public;
revoke all on adm.secagem_detalhe from anon, authenticated;
grant select on adm.secagem_detalhe to service_role;
