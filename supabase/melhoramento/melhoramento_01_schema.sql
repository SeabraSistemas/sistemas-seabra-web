-- melhoramento_01_schema.sql
-- Aplicado em 30/10/2026 no projeto SeabraApp (migração "melhoramento_schema_interno").
--
-- Schema INTERNO de análise de melhoramento genético (Central de Melhoramento Seabra).
-- Isolado do app: anon e authenticated não têm USAGE; não há FK, gatilho nem
-- alteração em tabela do schema public. Só a service_role (painel /adm e jobs
-- de cálculo no servidor) lê e escreve aqui. Nada aparece para os produtores.
create schema if not exists melhoramento;
comment on schema melhoramento is 'Análises internas de melhoramento genético (rodadas de modelos, resultados por animal, validação, diagnóstico de dados). Invisível ao app: só service_role. Sem FK para o schema public, de propósito: nada aqui pode bloquear ou alterar operação do app.';

revoke all on schema melhoramento from public, anon, authenticated;
grant usage on schema melhoramento to service_role;

create table melhoramento.rodada (
  id bigint generated always as identity primary key,
  criada_em timestamptz not null default now(),
  especie text not null check (especie in ('caprino','ovino','bovino_corte','bovino_leite')),
  propriedade_id integer,            -- null = rodada com várias fazendas
  modelo text not null,              -- ex.: mppa, indice_femea, blup_repetibilidade
  caracteristica text not null,      -- ex.: leite_lactacao, peso_desmama
  parametros jsonb not null default '{}'::jsonb,   -- h2, r, sigma_p, filtros...
  versao_motor text not null,
  status text not null default 'concluida' check (status in ('rodando','concluida','erro')),
  n_animais integer,
  n_registros integer,
  resumo jsonb not null default '{}'::jsonb,
  observacao text
);
comment on table melhoramento.rodada is 'Uma execução de um modelo sobre os dados de uma fazenda (ou de várias). Guarda parâmetros e versão do motor para a rodada ser reproduzível.';

create table melhoramento.resultado_animal (
  rodada_id bigint not null references melhoramento.rodada(id) on delete cascade,
  animal_id integer not null,        -- id em public.rebanho ou public.rebanho_bovino; sem FK de propósito
  propriedade_id integer,
  valor numeric,                     -- EBV, MPPA ou índice, na escala declarada em rodada.parametros
  confiabilidade numeric,
  posicao integer,
  extra jsonb not null default '{}'::jsonb,
  primary key (rodada_id, animal_id)
);
comment on table melhoramento.resultado_animal is 'Resultado de cada animal numa rodada.';

create table melhoramento.validacao (
  rodada_id bigint not null references melhoramento.rodada(id) on delete cascade,
  metrica text not null,             -- ex.: correlacao_proxima_lactacao, vies, dispersao
  valor numeric,
  n integer,
  detalhe jsonb not null default '{}'::jsonb,
  primary key (rodada_id, metrica)
);
comment on table melhoramento.validacao is 'Métricas de validação de uma rodada (capacidade de prever a lactação seguinte, viés, dispersão).';

create table melhoramento.diagnostico_dado (
  id bigint generated always as identity primary key,
  gerado_em timestamptz not null default now(),
  especie text not null,
  propriedade_id integer,
  metricas jsonb not null default '{}'::jsonb
);
comment on table melhoramento.diagnostico_dado is 'Qualidade dos dados de uma fazenda para melhoramento (completude de pedigree, controles por lactação, grupos de contemporâneas).';

create index on melhoramento.rodada (especie, propriedade_id, criada_em desc);
create index on melhoramento.resultado_animal (propriedade_id);
create index on melhoramento.diagnostico_dado (especie, propriedade_id, gerado_em desc);

alter table melhoramento.rodada enable row level security;
alter table melhoramento.resultado_animal enable row level security;
alter table melhoramento.validacao enable row level security;
alter table melhoramento.diagnostico_dado enable row level security;

revoke all on all tables in schema melhoramento from public, anon, authenticated;
revoke all on all sequences in schema melhoramento from public, anon, authenticated;
grant all on all tables in schema melhoramento to service_role;
grant usage, select on all sequences in schema melhoramento to service_role;
alter default privileges in schema melhoramento revoke all on tables from public, anon, authenticated;
alter default privileges in schema melhoramento grant all on tables to service_role;
alter default privileges in schema melhoramento grant usage, select on sequences to service_role;
