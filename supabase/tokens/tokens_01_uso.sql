-- ═════════════════════════════════════════════════════════════════════════════
-- tokens_01_uso.sql — uso do Claude Code por máquina, para o painel /tokens
--
-- Uma linha por máquina. O coletor (scripts/tokens-coletor.mjs) roda no PC,
-- soma os tokens dos logs locais do Claude Code em baldes de 1 hora e faz
-- upsert da própria linha. O painel lê todas as linhas e soma os baldes.
--
-- Só a service_role mexe aqui (a rota /api/tokens). RLS ligada e SEM nenhuma
-- policy: anon e authenticated não leem nem escrevem. Contagem de tokens não é
-- dado sensível, mas não há motivo para a chave pública enxergar a tabela.
--
-- Rodar à mão no SQL Editor do Supabase do site. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create table if not exists public.tokens_uso (
  maquina       text primary key check (char_length(maquina) between 1 and 64),
  -- Hora do servidor no último envio do coletor (não confia no relógio do PC).
  coletado_em   timestamptz not null default now(),
  -- [{ "h": <início da hora em ms epoch>, "t": <input+output+cache criado>, "c": <cache lido> }, ...]
  horas         jsonb not null default '[]'::jsonb
);

alter table public.tokens_uso enable row level security;

revoke all on public.tokens_uso from anon, authenticated;
grant all on public.tokens_uso to service_role;

comment on table public.tokens_uso is 'Tokens do Claude Code por hora e por máquina — alimenta o painel /tokens. Escrita só pela rota /api/tokens.';
