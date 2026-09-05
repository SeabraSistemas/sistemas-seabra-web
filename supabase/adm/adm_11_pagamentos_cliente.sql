-- ═════════════════════════════════════════════════════════════════════════════
-- adm_11_pagamentos_cliente.sql — "quem pagou e quanto"
--
-- Rodar DEPOIS de adm_01 (usuarios_lista, assinatura_normalizada,
-- pagamentos_conta). So agrega o que aquelas ja resolveram.
--
-- A PERGUNTA QUE ISTO RESPONDE, e que o painel nao respondia: a tela de receita
-- mostrava "recebido nos ultimos 12 meses" e a lista de cobrancas uma a uma,
-- mas nunca o ACUMULADO POR CLIENTE nem o total de tudo. Sao 88 cobrancas em 18
-- clientes; ler isso somando linha a linha na tela nao e leitura, e trabalho.
--
-- CONTRATO: as colunas abaixo sao lidas nome a nome pela interface
-- LinhaPagamentosCliente em src/lib/adm/areas/contrato.ts.
-- ═════════════════════════════════════════════════════════════════════════════

drop view if exists adm.pagamentos_por_cliente;

create view adm.pagamentos_por_cliente as
with cobrado as (
  -- Uma linha por cliente, agregando o historico INTEIRO.
  --
  -- Os tres baldes de status sao os mesmos de adm_01 e de cobrancas.ts — sao a
  -- constante STATUS_PAGOS de _shared/asaas.ts do app. Divergir aqui faria o
  -- painel dizer "nao pagou" para quem o app ja liberou.
  select
    p.usuario_id,
    count(*)::int                                                     as pagamentos,
    coalesce(sum(p.valor) filter (
      where p.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH')), 0)  as total_pago,
    coalesce(sum(p.valor) filter (
      where p.status in ('PENDING', 'OVERDUE')), 0)                   as em_aberto,
    -- VENCIDO exige a cobranca ja ter passado da data: um PENDING de vencimento
    -- futuro e normal, nao inadimplencia.
    coalesce(sum(p.valor) filter (
      where p.status = 'OVERDUE'
         or (p.status = 'PENDING' and p.data_vencimento < current_date)), 0) as vencido,
    min(p.data_pagamento) filter (
      where p.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'))      as primeiro_pagamento,
    max(p.data_pagamento) filter (
      where p.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'))      as ultimo_pagamento
  from adm.pagamentos_conta p
  where p.usuario_id is not null
  group by p.usuario_id
)

select
  u.id                                                    as usuario_id,
  u.nome,
  an.plano_nome,
  an.status_efetivo,

  -- DUAS COISAS DIFERENTES, e a tela filtra pelas duas separadamente:
  --   `ativo`        e a CONTA (usuarios.ativo) -- desativada some do app;
  --   `acesso_ativo` e a ASSINATURA -- pagou/tem cortesia/tem extensao.
  -- Uma conta ativa pode estar sem acesso (parou de pagar) e uma conta
  -- desativada pode ter assinatura vigente (desativada por outro motivo).
  -- Colapsar as duas num "ativo" so esconderia justamente quem esta no meio.
  u.ativo,
  coalesce(an.acesso_ativo, false)                        as acesso_ativo,

  coalesce(c.pagamentos, 0)                               as pagamentos,
  round(coalesce(c.total_pago, 0), 2)                     as total_pago,
  round(coalesce(c.em_aberto, 0), 2)                      as em_aberto,
  round(coalesce(c.vencido, 0), 2)                        as vencido,

  c.primeiro_pagamento,
  c.ultimo_pagamento,

  -- Idade comercial: do primeiro pagamento ate hoje, em meses cheios. NULL para
  -- quem nunca pagou -- e nao zero, que leria como "cliente novo".
  case when c.primeiro_pagamento is not null
       then greatest(0, (extract(year  from age(now(), c.primeiro_pagamento)) * 12
                       + extract(month from age(now(), c.primeiro_pagamento)))::int)
  end                                                     as meses_como_cliente,

  -- O que ele paga HOJE. Diferente do total: quem pagou 12 meses e saiu tem
  -- total alto e mrr zero, e os dois numeros lado a lado e que contam a
  -- historia. Cortesia entra como 0 (ver assinatura_normalizada).
  round(coalesce(an.valor_real_mensal, 0), 2)             as mrr_atual

from adm.usuarios_lista u
left join adm.assinatura_normalizada an on an.usuario_id = u.id
left join cobrado c                      on c.usuario_id = u.id
-- So quem TEM historia de cobranca. Os 28 cadastros que nunca geraram cobranca
-- nenhuma nao pertencem a uma tela de "quem pagou e quanto" -- eles sao o
-- assunto da tela de risco, e apareceriam aqui como uma parede de zeros.
where c.usuario_id is not null;

comment on view adm.pagamentos_por_cliente is
  'Quem pagou e quanto, historico inteiro por cliente. total_pago e acumulado; mrr_atual e a foto de hoje.';

revoke all on adm.pagamentos_por_cliente from public;
revoke all on adm.pagamentos_por_cliente from anon, authenticated;
grant select on adm.pagamentos_por_cliente to service_role;
