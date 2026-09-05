-- ============================================================================
-- adm_03_auditoria.sql
-- A UNICA ESCRITA QUE O /adm FAZ. Decisao D3: o painel e somente leitura nas
-- tabelas do app; o que ele grava e o registro de si mesmo.
--
-- POR QUE ISTO NAO E CAPRICHO
--   1. OBRIGACAO LEGAL. Marco Civil da Internet, art. 15: o provedor de
--      aplicacao guarda registros de acesso a aplicacao por 6 meses. LGPD,
--      art. 37: o controlador mantem registro das operacoes de tratamento.
--      Abrir a ficha completa de um produtor identificado E uma operacao de
--      tratamento.
--   2. DETECCAO. E o unico jeito de perceber que a credencial do /adm foi
--      roubada -- uma sessao que abriu 30 clientes as 3h da manha.
--   3. RESPOSTA A INCIDENTE. A diferenca entre "nao sabemos o escopo, notifique
--      todo mundo" e "exatamente estes 4 clientes foram acessados".
--   Precedente do app: as ESCRITAS ja tem trilha (pagamentos_log.admin_usuario_id,
--   admin_delete_actions.usuario_id). As LEITURAS nao tem nenhuma. O /adm e o
--   primeiro lugar onde LER e o risco.
--
-- POR QUE NO SCHEMA `auditoria`, E NAO EM `public` NEM EM `adm`
--   - `public`: o ACL default deste projeto concede arwdDxt a `anon` em toda
--     tabela nova. Uma tabela de auditoria nascida em public seria legivel E
--     GRAVAVEL pela anon key que viaja dentro do APK -- ou seja, apagavel por
--     quem a trilha existe para pegar.
--   - `adm`: e exposto ao PostgREST e o assert 1 do adm_05 proibe tabela la.
--   - `auditoria`: JA existe, JA esta revogado de public/anon/authenticated e
--     JA fica FORA do db-schemas do PostgREST
--     (migrations/2026-07-21_snapshot_assinaturas_pre_limpeza_extensao.sql:16-18).
--     Inalcancavel pela API -- por isso a escrita passa por RPC SECURITY DEFINER.
--
-- Idempotente. Depende de: adm_01 (para adm.auditoria_recente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Schema
-- ----------------------------------------------------------------------------

create schema if not exists auditoria;

revoke all on schema auditoria from public;
revoke all on schema auditoria from anon, authenticated;
alter default privileges in schema auditoria revoke all on tables from anon, authenticated, public;

-- service_role NAO recebe nada aqui, de proposito. A trilha e gravada pelas RPCs
-- SECURITY DEFINER abaixo (que rodam como o dono) e lida pela view adm.auditoria_recente
-- (que tambem roda como o dono). Sem grant direto, nenhum bug de rota consegue
-- um `delete from auditoria.adm_acessos` -- nem com a service_role na mao.

-- ----------------------------------------------------------------------------
-- 2. auditoria.adm_tentativas_login -- rate limit e lockout
--
-- Serverless nao tem memoria compartilhada: um Map em modulo e rate limit de
-- mentira, porque cada invocacao pode cair numa instancia nova. O contador
-- precisa ser o banco.
--
-- NUNCA guardar a senha, nem tentada, nem hasheada, nem "so os 3 primeiros
-- caracteres". A tabela guarda QUEM tentou e SE deu certo -- nada mais.
-- ----------------------------------------------------------------------------

create table if not exists auditoria.adm_tentativas_login (
  id          bigint generated always as identity primary key,
  ocorrido_em timestamptz not null default now(),
  ator        text,          -- o login TENTADO (pode nao existir)
  sucesso     boolean not null,
  motivo      text,          -- 'ok' | 'senha' | 'totp' | 'bloqueado' | 'usuario'
  ip          inet,
  user_agent  text
);

comment on table auditoria.adm_tentativas_login is
  'Tentativas de login no /adm. Base do rate limit e do lockout. Retencao: 30 dias.';

-- Os dois indices sao os dois eixos do lockout: trancar a CONTA (alguem tentando
-- adivinhar a senha do Felipe) e trancar a ORIGEM (um scanner varrendo).
create index if not exists idx_adm_tentativas_ator
  on auditoria.adm_tentativas_login (ator, ocorrido_em desc);
create index if not exists idx_adm_tentativas_ip
  on auditoria.adm_tentativas_login (ip, ocorrido_em desc);

revoke all on auditoria.adm_tentativas_login from public;
revoke all on auditoria.adm_tentativas_login from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. auditoria.adm_acessos -- a trilha
--
-- `acao` carrega o vocabulario do tipo EventoAuditoria de src/lib/adm/types.ts:
--   login_ok | login_falha | logout | abriu_carteira | abriu_usuario |
--   abriu_tabela | exportou | revelou_contato
-- Sem CHECK de proposito: um valor novo no TypeScript nao pode fazer a gravacao
-- da trilha FALHAR (e derrubar a pagina que ela deveria so observar). O contrato
-- e o tipo; aqui e append-only e permissivo.
--
-- GRANULARIDADE: registrar login (ok e falha), logout, abrir a ficha de um
-- cliente, revelar um contato e TODA exportacao (com formato, tabela e numero de
-- linhas em `detalhes`). NAO registrar scroll, filtro ou grafico: vira ruido, e
-- log que ninguem le nao detecta nada.
--
-- ORDEM IMPORTA: gravar 'abriu_usuario' ANTES de carregar os dados. Se gravar
-- depois, um erro no meio deixa o acesso sem rastro.
-- ----------------------------------------------------------------------------

create table if not exists auditoria.adm_acessos (
  id          bigint generated always as identity primary key,
  ocorrido_em timestamptz not null default now(),
  sessao_sid  text,          -- SessaoAdm.sid: liga eventos da mesma sessao
  ator        text not null, -- ADM_USUARIO (o operador), nao o cliente aberto
  acao        text not null,
  alvo_tipo   text,          -- 'usuario' | 'propriedade' | 'tabela' | null
  alvo_id     integer,       -- D1: usuarios.id, ou propriedades.id
  detalhes    jsonb,         -- {formato:'csv', tabela:'rebanho', linhas:4820}
  ip          inet,
  user_agent  text
);

comment on table auditoria.adm_acessos is
  'Trilha de acesso do /adm (Marco Civil art. 15, LGPD art. 37). Append-only. '
  'Retencao: 12 meses. Guardar ID, nunca valor: nada de PII em `detalhes`.';

create index if not exists idx_adm_acessos_ocorrido
  on auditoria.adm_acessos (ocorrido_em desc);
-- "Quem viu os dados deste cliente?" -- a pergunta que um titular tem direito de
-- fazer (LGPD art. 18) e que so este indice responde em tempo util.
create index if not exists idx_adm_acessos_alvo
  on auditoria.adm_acessos (alvo_tipo, alvo_id, ocorrido_em desc);
create index if not exists idx_adm_acessos_sessao
  on auditoria.adm_acessos (sessao_sid, ocorrido_em desc);

revoke all on auditoria.adm_acessos from public;
revoke all on auditoria.adm_acessos from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. RPCs de escrita
--
-- O schema `auditoria` esta fora do PostgREST, entao o Next nao alcanca as
-- tabelas nem com a service_role. A ponte e uma funcao SECURITY DEFINER em
-- `public` (o unico schema que o PostgREST expoe por padrao).
--
-- Duas travas obrigatorias em toda funcao definer:
--   `set search_path = pg_catalog, public` -- sem isso, um schema temporario do
--   chamador pode sequestrar a resolucao de nomes dentro do corpo.
--   `revoke execute from public` -- funcao nova em Postgres nasce EXECUTE para
--   PUBLIC, ou seja, chamavel pela anon key do APK.
--
-- O IP chega como TEXT e nao como INET de proposito: x-forwarded-for costuma vir
-- com varios enderecos separados por virgula, e um cast direto lancaria excecao
-- -- fazendo a gravacao da trilha derrubar a requisicao que ela so observa.
-- ----------------------------------------------------------------------------

create or replace function public.adm_texto_para_inet(p_ip text)
returns inet
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
begin
  -- Primeiro endereco de um x-forwarded-for, sem espaco. Lixo vira NULL.
  return nullif(btrim(split_part(coalesce(p_ip, ''), ',', 1)), '')::inet;
exception when others then
  return null;
end;
$$;

revoke all on function public.adm_texto_para_inet(text) from public;
revoke all on function public.adm_texto_para_inet(text) from anon, authenticated;

create or replace function public.adm_registrar_acesso(
  p_ator       text,
  p_acao       text,
  p_sessao_sid text    default null,
  p_alvo_tipo  text    default null,
  p_alvo_id    integer default null,
  p_detalhes   jsonb   default null,
  p_ip         text    default null,
  p_user_agent text    default null
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_id bigint;
begin
  insert into auditoria.adm_acessos
    (sessao_sid, ator, acao, alvo_tipo, alvo_id, detalhes, ip, user_agent)
  values
    (nullif(btrim(p_sessao_sid), ''),
     btrim(p_ator),
     btrim(p_acao),
     nullif(btrim(p_alvo_tipo), ''),
     p_alvo_id,
     p_detalhes,
     public.adm_texto_para_inet(p_ip),
     left(coalesce(p_user_agent, ''), 400))
  returning id into v_id;
  return v_id;
end;
$$;

comment on function public.adm_registrar_acesso(text, text, text, text, integer, jsonb, text, text) is
  'Grava um evento na trilha do /adm. Chamar ANTES de carregar o dado do alvo.';

revoke all on function public.adm_registrar_acesso(text, text, text, text, integer, jsonb, text, text) from public;
revoke all on function public.adm_registrar_acesso(text, text, text, text, integer, jsonb, text, text) from anon, authenticated;
grant execute on function public.adm_registrar_acesso(text, text, text, text, integer, jsonb, text, text) to service_role;

create or replace function public.adm_registrar_tentativa_login(
  p_ator       text,
  p_sucesso    boolean,
  p_motivo     text default null,
  p_ip         text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into auditoria.adm_tentativas_login (ator, sucesso, motivo, ip, user_agent)
  values (nullif(btrim(p_ator), ''),
          coalesce(p_sucesso, false),
          nullif(btrim(p_motivo), ''),
          public.adm_texto_para_inet(p_ip),
          left(coalesce(p_user_agent, ''), 400));
end;
$$;

revoke all on function public.adm_registrar_tentativa_login(text, boolean, text, text, text) from public;
revoke all on function public.adm_registrar_tentativa_login(text, boolean, text, text, text) from anon, authenticated;
grant execute on function public.adm_registrar_tentativa_login(text, boolean, text, text, text) to service_role;

-- Estado do lockout. Devolve jsonb (e nao boolean) para a tela poder dizer
-- "bloqueado por mais 7 minutos" em vez de "senha invalida" pela setima vez.
-- Os dois eixos sao contados separadamente: trancar so por IP nao segura um
-- ataque distribuido, e trancar so por ator deixa o scanner varrer logins.
create or replace function public.adm_status_login(
  p_ator        text,
  p_ip          text default null,
  p_janela_min  integer default 15,
  p_max_falhas  integer default 6
)
returns jsonb
language plpgsql
security definer
stable
set search_path = pg_catalog, public
as $$
declare
  v_desde    timestamptz := now() - make_interval(mins => greatest(p_janela_min, 1));
  v_ip       inet        := public.adm_texto_para_inet(p_ip);
  v_ator     int;
  v_ip_count int;
  v_ultima   timestamptz;
begin
  select count(*), max(ocorrido_em) into v_ator, v_ultima
    from auditoria.adm_tentativas_login
   where not sucesso and ocorrido_em >= v_desde
     and ator is not distinct from nullif(btrim(p_ator), '');

  select count(*) into v_ip_count
    from auditoria.adm_tentativas_login
   where not sucesso and ocorrido_em >= v_desde
     and v_ip is not null and ip = v_ip;

  return jsonb_build_object(
    'bloqueado',    (v_ator >= p_max_falhas or v_ip_count >= p_max_falhas * 2),
    'falhas_ator',  v_ator,
    'falhas_ip',    v_ip_count,
    'janela_min',   p_janela_min,
    -- Quando libera: a janela corre a partir da ULTIMA falha, entao insistir
    -- durante o bloqueio empurra a liberacao para frente.
    'libera_em',    case when v_ultima is not null
                         then v_ultima + make_interval(mins => greatest(p_janela_min, 1))
                    end
  );
end;
$$;

revoke all on function public.adm_status_login(text, text, integer, integer) from public;
revoke all on function public.adm_status_login(text, text, integer, integer) from anon, authenticated;
grant execute on function public.adm_status_login(text, text, integer, integer) to service_role;

-- ----------------------------------------------------------------------------
-- 5. adm.auditoria_recente -- a trilha de volta para a tela
--
-- Sem esta view a trilha seria write-only, e log que ninguem le nao detecta
-- nada (razao 2 do cabecalho). A view mora em `adm` porque e la que o PostgREST
-- alcanca; `auditoria` continua fechado.
--
-- Teto de 90 dias e de 5.000 linhas: a tela de auditoria e para OLHAR o
-- movimento recente. Investigacao de incidente antigo se faz no SQL Editor, com
-- a pergunta na mao.
-- ----------------------------------------------------------------------------

create or replace view adm.auditoria_recente as
select
  a.id,
  a.ocorrido_em,
  a.sessao_sid,
  a.ator,
  a.acao,
  a.alvo_tipo,
  a.alvo_id,
  a.detalhes,
  -- O IP e dado pessoal e nao tem uso na leitura diaria da trilha: so a /24
  -- atravessa, que basta para ver "tudo da mesma rede" ou "origem estranha".
  -- O endereco inteiro continua na tabela, para responder a incidente.
  case when a.ip is not null then host(network(set_masklen(a.ip, 24))) end as ip_rede,
  a.user_agent
from auditoria.adm_acessos a
where a.ocorrido_em >= now() - interval '90 days'
order by a.ocorrido_em desc
limit 5000;

comment on view adm.auditoria_recente is
  'Leitura da trilha do /adm: 90 dias, teto de 5.000 linhas, IP reduzido a /24.';

revoke all on adm.auditoria_recente from public;
revoke all on adm.auditoria_recente from anon, authenticated;
grant select on adm.auditoria_recente to service_role;

-- ----------------------------------------------------------------------------
-- 6. Retencao
--
-- 12 meses para acessos: acima do minimo de 6 do Marco Civil, abaixo do "para
-- sempre" que a LGPD desaconselha. 30 dias para tentativas de login: passado
-- disso o dado nao serve nem ao rate limit nem a investigacao, e IP e dado
-- pessoal -- guardar tem base legal, guardar para sempre nao.
--
-- pg_cron ja e usado neste projeto (migrations/whatsapp_scheduler_pgcron.sql).
-- DESCOMENTE depois de confirmar que a extensao esta habilitada neste banco
-- (`select * from pg_extension where extname = 'pg_cron'`). Rodar antes de
-- confirmar so gera um erro confuso no meio da migration.
--
-- select cron.schedule(
--   'adm_purga_auditoria',
--   '0 4 * * *',
--   $purga$
--     delete from auditoria.adm_acessos
--      where ocorrido_em < now() - interval '12 months';
--     delete from auditoria.adm_tentativas_login
--      where ocorrido_em < now() - interval '30 days';
--   $purga$
-- );
--
-- Para conferir depois:  select * from cron.job where jobname = 'adm_purga_auditoria';
-- Para desagendar:       select cron.unschedule('adm_purga_auditoria');
--
-- SEM pg_cron: rodar as duas linhas do delete a mao a cada semestre e aceitavel
-- no volume atual (o /adm tem um operador so). Anote no calendario -- retencao
-- que depende de lembranca costuma virar retencao infinita.
-- ----------------------------------------------------------------------------

-- ─────────────────────────────────────────────────────────────────────────────
-- Leitura das tentativas para o rate limit em src/lib/adm/rate-limit.ts.
--
-- POR QUE DEVOLVER AS LINHAS E NAO UM VEREDITO: adm_status_login (acima) ja da
-- um veredito pronto, mas com janela e teto fixos. A politica que o painel
-- aplica e mais fina — escada progressiva de bloqueio, tres baldes separados
-- (ip, ator e global) e descarte das falhas ANTERIORES ao ultimo sucesso do
-- mesmo balde, para um login bem-sucedido nao deixar o operador a duas
-- tentativas do lockout pelo resto da hora. Essa politica vive no TypeScript,
-- onde da para testar sem banco; aqui so sai o dado cru da janela.
--
-- O nome da coluna muda de `ator` para `usuario_tentado` na saida: e o termo
-- que o TS usa, e o valor NAO e o login digitado — e uma chave de balde (HMAC),
-- exceto quando o login e o do proprio operador. Ver normalizarUsuario().
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.adm_tentativas_recentes(p_desde timestamptz)
returns table (
  ocorrido_em timestamptz,
  ip          inet,
  ator        text,
  sucesso     boolean
)
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select t.ocorrido_em, t.ip, t.ator, t.sucesso
    from auditoria.adm_tentativas_login t
   where t.ocorrido_em >= p_desde
   order by t.ocorrido_em desc
   limit 500;
$$;

comment on function public.adm_tentativas_recentes(timestamptz) is
  'Janela de tentativas de login do /adm. A politica de lockout e aplicada no TS.';

revoke all on function public.adm_tentativas_recentes(timestamptz) from public;
revoke all on function public.adm_tentativas_recentes(timestamptz) from anon, authenticated;
grant execute on function public.adm_tentativas_recentes(timestamptz) to service_role;
