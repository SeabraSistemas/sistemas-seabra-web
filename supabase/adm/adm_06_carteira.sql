-- ═════════════════════════════════════════════════════════════════════════════
-- adm_06_carteira.sql — a visao AGREGADA do negocio (/adm/carteira)
--
-- Rodar DEPOIS de adm_01 (usuarios_lista, assinatura_normalizada,
-- propriedades_escopo) e adm_02 (atividade_propriedade): as tres views daqui
-- so agregam o que aquelas ja resolveram, e nao tocam em public.* alem de
-- pagamentos e usuarios.
--
-- POR QUE TRES VIEWS E NAO UMA: sao tres FORMATOS diferentes. KPI e uma linha
-- larga; serie e (serie, periodo, valor); distribuicao e (dimensao, rotulo,
-- valor). Espremer os tres num payload so obrigaria o TypeScript a desempacotar
-- jsonb aninhado — e o padrao aqui e o inverso: o Postgres entrega pronto e o
-- Node so mapeia.
--
-- CONTRATO: as colunas abaixo sao lidas nome a nome por mapearKpis(),
-- mapearSerie() e mapearFatias() em src/lib/adm/queries.ts. Renomear qualquer
-- uma quebra a tela sem erro de compilacao — a coluna some e o valor vira 0.
-- ═════════════════════════════════════════════════════════════════════════════

drop view if exists adm.carteira_kpis;
drop view if exists adm.carteira_serie_mensal;
drop view if exists adm.carteira_distribuicao;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.carteira_kpis  ->  interface KpisCarteira
--
-- Exatamente UMA linha. Os quatro baldes de acesso vem prontos e mutuamente
-- exclusivos de adm.assinatura_normalizada.origem_acesso, entao somar aqui nao
-- conta ninguem duas vezes.
-- ─────────────────────────────────────────────────────────────────────────────
create view adm.carteira_kpis as
with assinaturas as (
  -- So contas de USUARIO. Assinatura de associacao tem associacao_id e
  -- usuario_id nulo: entra na receita, mas nao e "uma conta de cliente".
  select * from adm.assinatura_normalizada
),
receita as (
  select
    count(*) filter (where origem_acesso = 'pagante')::int   as acesso_pagante,
    count(*) filter (where origem_acesso = 'trial')::int     as acesso_trial,
    count(*) filter (where origem_acesso = 'cortesia')::int  as acesso_cortesia,
    count(*) filter (where origem_acesso = 'extensao')::int  as acesso_extensao,
    count(*) filter (where acesso_ativo)::int                as contas_com_acesso,

    -- MRR REAL: so pagante, ja normalizado por ciclo na view de origem.
    coalesce(sum(valor_real_mensal) filter (where acesso_ativo), 0)     as mrr_real,

    -- MRR de TABELA: o numero que o app mostra hoje (asaas-admin-actions
    -- soma view_status_assinatura.valor_mensal). Fica lado a lado na tela ate
    -- a troca ganhar confianca — o honesto vai ser MENOR, e isso precisa ser
    -- visivel em vez de parecer que o painel perdeu receita.
    coalesce(sum(valor_tabela_mensal) filter (where acesso_ativo), 0)   as mrr_tabela,

    -- Receita em risco = vence em <=7 dias  +  cobranca ja vencida. Sem dupla
    -- contagem: quem esta nos dois entra uma vez so.
    coalesce(sum(valor_real_mensal)
             filter (where acesso_ativo and (vencendo_7d or inadimplente)), 0) as receita_em_risco,
    count(*) filter (where acesso_ativo and vencendo_7d)::int           as vencendo_7d,
    count(*) filter (where acesso_ativo and inadimplente)::int          as inadimplentes
  from assinaturas
),
base as (
  select
    count(*)::int                                                       as contas_total,
    coalesce(sum(u.animais_ativos), 0)::int                             as animais_ativos
  from adm.usuarios_lista u
),
propriedades as (
  select count(*)::int as propriedades from public.propriedades
),
-- ENGAJAMENTO POR PROPRIEDADE, nao por usuario: nao existe registro de login
-- utilizavel (auth.users.last_sign_in_at exige Admin API e e nulo para todo
-- colaborador legado), e o sinal de vida acordado com o Felipe e o LANCAMENTO.
-- Ver decisao D2 em docs/internal/ADM_DASHBOARD_DESENHO.md.
uso as (
  select
    count(*) filter (where t.lancamentos_30d > 0)::int                  as mau,
    count(*) filter (where t.lancamentos_7d  > 0)::int                  as wau,
    count(*) filter (where t.ultimo_lancamento_em >= now() - interval '1 day')::int as dau,
    count(*) filter (where t.ultimo_lancamento_em <  now() - interval '30 days')::int as silenciosos,
    count(*) filter (where t.ultimo_lancamento_em is null)::int         as nunca_lancaram
  from adm.atividade_propriedade t
)
select
  r.acesso_pagante,
  r.acesso_trial,
  r.acesso_cortesia,
  r.acesso_extensao,
  r.contas_com_acesso,
  b.contas_total,
  round(r.mrr_real, 2)                                                  as mrr_real,
  round(r.mrr_tabela, 2)                                                as mrr_tabela,
  -- ARPU sobre PAGANTES, nao sobre todo mundo com acesso: dividir pela base
  -- inteira (com 19 cortesias dentro) reportaria metade do ticket real.
  round(coalesce(r.mrr_real / nullif(r.acesso_pagante, 0), 0), 2)       as arpu,
  round(r.receita_em_risco, 2)                                          as receita_em_risco,
  r.vencendo_7d,
  r.inadimplentes,
  p.propriedades,
  b.animais_ativos,
  us.mau,
  us.wau,
  us.dau,
  us.silenciosos,
  us.nunca_lancaram
from receita r, base b, propriedades p, uso us;

comment on view adm.carteira_kpis is
  'Uma linha com os KPIs de /adm/carteira. MRR real (normalizado por ciclo, sem cortesia) ao lado do MRR de tabela.';

revoke all on adm.carteira_kpis from public;
revoke all on adm.carteira_kpis from anon, authenticated;
grant select on adm.carteira_kpis to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.carteira_serie_mensal  ->  PontoSerie[], filtrada por `serie`
--
-- (serie, periodo 'YYYY-MM', valor). O TypeScript preenche os meses faltantes
-- (preencherSerie) — aqui so sai mes que teve fato, e e de proposito: inventar
-- a linha do zero no SQL esconderia a diferenca entre "mes sem receita" e "mes
-- anterior ao primeiro pagamento da historia".
-- ─────────────────────────────────────────────────────────────────────────────
create view adm.carteira_serie_mensal as
-- RECEITA RECONHECIDA POR COMPETENCIA DE CAIXA: soma dos pagamentos com status
-- pago, pelo mes em que foram PAGOS. Nao e MRR (que e uma foto de hoje) — e o
-- que efetivamente entrou, que e o unico numero reconstruivel do historico.
-- Nao existe snapshot mensal de assinatura no banco: a unica tabela historica e
-- auditoria.assinaturas_snapshot_20260721, congelada.
select
  'receita'::text                                          as serie,
  to_char(pa.data_pagamento, 'YYYY-MM')                    as periodo,
  round(coalesce(sum(pa.valor), 0), 2)                     as valor
from public.pagamentos pa
where pa.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH')
  and pa.data_pagamento is not null
group by 2

union all

select
  'novos_clientes'::text                                   as serie,
  to_char(u.data_cadastro, 'YYYY-MM')                      as periodo,
  count(*)::numeric                                        as valor
from public.usuarios u
where u.data_cadastro is not null
  -- Colaborador nao e cliente novo: e um funcionario que o produtor cadastrou.
  -- Conta-lo inflaria a curva de aquisicao com gente que nunca comprou nada.
  and coalesce(u.regra_de_acesso, '') <> 'colaborador'
  and coalesce(u.is_demo, false) = false
  and coalesce(u.is_tester, false) = false
group by 2;

comment on view adm.carteira_serie_mensal is
  'Series mensais da carteira: receita (pagamentos pagos por mes) e novos_clientes (cadastros, sem colaborador/demo/tester).';

revoke all on adm.carteira_serie_mensal from public;
revoke all on adm.carteira_serie_mensal from anon, authenticated;
grant select on adm.carteira_serie_mensal to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. adm.carteira_distribuicao  ->  FatiaDistribuicao[], filtrada por `dimensao`
--
-- (dimensao, rotulo, valor).
-- ─────────────────────────────────────────────────────────────────────────────
create view adm.carteira_distribuicao as
-- SEGMENTO: propriedades.segmentos e text[], e uma propriedade pode ter dois.
-- As fatias NAO somam o total de propriedades — a tela rotula "uma propriedade
-- pode contar em dois segmentos" para o numero nao parecer errado.
select
  'segmento'::text                                         as dimensao,
  seg                                                      as rotulo,
  count(distinct p.id)::numeric                            as valor
from public.propriedades p
cross join lateral unnest(coalesce(p.segmentos, array[]::text[])) as seg
group by 2

union all

select
  'estado'::text                                           as dimensao,
  coalesce(nullif(btrim(p.estado), ''), 'Sem estado')      as rotulo,
  count(*)::numeric                                        as valor
from public.propriedades p
group by 2

union all

-- PLANO: so quem tem acesso ativo. Um plano cancelado ha um ano na fatia
-- desenharia uma carteira que nao existe mais.
select
  'plano'::text                                            as dimensao,
  coalesce(a.plano_nome, 'Sem plano')                      as rotulo,
  count(*)::numeric                                        as valor
from adm.assinatura_normalizada a
where a.acesso_ativo
group by 2;

comment on view adm.carteira_distribuicao is
  'Distribuicoes da carteira por segmento, estado e plano. Segmento e multivalorado: as fatias nao somam o total.';

revoke all on adm.carteira_distribuicao from public;
revoke all on adm.carteira_distribuicao from anon, authenticated;
grant select on adm.carteira_distribuicao to service_role;
