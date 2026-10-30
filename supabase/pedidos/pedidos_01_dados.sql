-- ═════════════════════════════════════════════════════════════════════════════
-- pedidos_01_dados.sql — dados do painel /pedidos (compras da AliExpress do Felipe)
--
-- Uma linha por documento:
--   'snapshot'  o que o coletor do Mac leu da conta (pedidos, previsão, preços do dia)
--   'precos'    histórico diário do preço do microchip (com impostos)
--   'estado'    estoque, vendas e ponto de partida, editados na própria página
--
-- Só a service_role mexe aqui (rotas /pedidos/api/*). RLS ligada e SEM nenhuma
-- policy: anon e authenticated não leem nem escrevem. A página só mostra os
-- dados depois do login por gesto.
--
-- Rodar à mão no SQL Editor do Supabase do site. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists public.pedidos_dados (
  chave          text primary key check (char_length(chave) between 1 and 32),
  valor          jsonb not null,
  atualizado_em  timestamptz not null default now()
);

alter table public.pedidos_dados enable row level security;

revoke all on public.pedidos_dados from anon, authenticated;
grant all on public.pedidos_dados to service_role;

comment on table public.pedidos_dados is 'Documentos do painel /pedidos (snapshot da AliExpress, histórico de preços e estoque). Acesso só pela service_role.';
