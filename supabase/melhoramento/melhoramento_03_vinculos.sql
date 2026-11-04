-- ═════════════════════════════════════════════════════════════════════════════
-- melhoramento_03_vinculos.sql
-- Aplicado em 04/11/2026 no projeto SeabraApp (migração "melhoramento_vinculos").
--
-- CADASTRO ÚNICO DE REPRODUTORES — etapa de CANDIDATOS. O app não tem cadastro
-- único: o mesmo bode, carneiro ou touro comprado ou usado em IA vira um
-- animal novo em cada fazenda, e por isso nenhum EBV de uma fazenda se compara
-- com o de outra. Este arquivo cria:
--
--   melhoramento.normalizar_identificacao(text)   caixa, acento, espaço e
--                        pontuação não distinguem animal (a mesma regra de
--                        normalizarIdentificacao em src/lib/melhoramento/conexao.ts)
--   melhoramento.reprodutor_vinculo               os pares candidatos, com o
--                        motivo e a confirmação, que NASCE 'nao_confirmado'
--   melhoramento.gerar_vinculos()                 gera ou atualiza os candidatos
--                        lendo public.rebanho e public.rebanho_bovino (SÓ
--                        LEITURA do public); preserva a confirmação de quem já
--                        estava lá
--   adm.melhoramento_vinculo                      a leitura do painel
--
-- NADA É LIGADO SEM CONFIRMAÇÃO HUMANA. O módulo (src/lib/melhoramento/
-- vinculos.ts) só usa os pares com confirmacao = 'confirmado'. A confirmação
-- pela tela fica para depois; por SQL, no editor do Supabase:
--
--   update melhoramento.reprodutor_vinculo
--      set confirmacao = 'confirmado', confirmado_por = 'Felipe',
--          confirmado_em = now(), observacao = 'mesmo RGN; conferido com o produtor'
--    where id = <id do par>;
--
--   (rejeitar: confirmacao = 'rejeitado', com confirmado_por/confirmado_em;
--    voltar atrás: confirmacao = 'nao_confirmado', confirmado_por = null, confirmado_em = null)
--
-- e, para regenerar os candidatos depois de novos cadastros:
--
--   select * from melhoramento.gerar_vinculos();
--
-- REGRAS DO CANDIDATO (cada par é de fazendas DIFERENTES, da mesma espécie,
-- nenhuma das duas de teste, os dois machos — ou sem sexo — e pelo menos um
-- deles pai de algum animal):
--   identidade (pelo menos uma):
--     'registro'  RGN, registro FBB, certificado ou ID eletrônica (pequeno
--                 ruminante); registro, SISBOV ou ID eletrônica (bovino);
--                 normalizados, 5+ caracteres, iguais entre si;
--     'numero'    número do animal (numero_animal / numero_manejo), 5+ caracteres;
--     'nome'      nome normalizado, 3+ letras.
--   reforço (entra em `motivos` quando há):
--     'pai'/'mae' o pai (a mãe) dos dois tem nome, número ou registro igual;
--     'nascimento' as duas datas existem e diferem em até 31 dias.
--   contradição (o par NÃO é candidato): datas de nascimento a mais de 31 dias
--     uma da outra; ou pai (mãe) conhecido dos dois lados, identificado, e sem
--     nenhuma identificação em comum.
-- Os mínimos de 3 e 5 caracteres são os da etapa 1 (MINIMO_CHAVE_NOME e
-- MINIMO_CHAVE_NUMERO em conexao.ts): número curto é numeração local.
--
-- Mesmas regras de segurança de melhoramento_01/02: nada no public é criado ou
-- alterado; a tabela não tem FK para o public; anon e authenticated não
-- enxergam nada (asserts no fim). Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace function melhoramento.normalizar_identificacao(t text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    regexp_replace(
      upper(translate(coalesce(t, ''),
        'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
        'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN')),
      '[^A-Z0-9]', '', 'g'),
    '')
$$;

comment on function melhoramento.normalizar_identificacao(text) is
  'Melhoramento (interno): identificação de animal sem caixa, acento, espaço nem pontuação.';

create table if not exists melhoramento.reprodutor_vinculo (
  id             bigint generated always as identity primary key,
  especie        text not null check (especie in ('caprino', 'ovino', 'bovino_corte')),
  animal_a       bigint not null,           -- o de menor id; sem FK de propósito
  propriedade_a  integer not null,
  animal_b       bigint not null,
  propriedade_b  integer not null,
  motivos        text[] not null,           -- registro, numero, nome, pai, mae, nascimento
  detalhe        jsonb not null default '{}'::jsonb,
  confirmacao    text not null default 'nao_confirmado'
                 check (confirmacao in ('nao_confirmado', 'confirmado', 'rejeitado')),
  confirmado_por text,
  confirmado_em  timestamptz,
  observacao     text,
  gerado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  constraint reprodutor_vinculo_ordem check (animal_a < animal_b),
  constraint reprodutor_vinculo_fazendas check (propriedade_a <> propriedade_b),
  constraint reprodutor_vinculo_quem check (
    confirmacao = 'nao_confirmado' or (confirmado_por is not null and confirmado_em is not null)),
  constraint reprodutor_vinculo_unico unique (especie, animal_a, animal_b)
);

comment on table melhoramento.reprodutor_vinculo is
  'Candidatos a MESMO REPRODUTOR em fazendas diferentes (cadastro único). Nasce nao_confirmado; '
  'o módulo só usa os confirmados. Gerado por melhoramento.gerar_vinculos(); confirmado por SQL (ver '
  'supabase/melhoramento/melhoramento_03_vinculos.sql).';

alter table melhoramento.reprodutor_vinculo enable row level security;

create or replace function melhoramento.gerar_vinculos()
returns table (especie text, candidatos integer, novos integer, descartados_por_contradicao integer)
language plpgsql
security invoker
set search_path = ''
as $fn$
#variable_conflict use_column
begin
  drop table if exists _vinc_animal, _vinc_par, _vinc_avaliado;
  create temporary table _vinc_animal on commit drop as
  with faz as (
    select p.id,
           (coalesce(u.is_tester, false) or coalesce(u.is_demo, false)
              or p.nome_propriedade ilike '%teste%' or p.nome_propriedade ilike '%fixture%') as teste
    from public.propriedades p
    left join public.usuarios u on u.id = p.produtor_id
  ),
  bruto as (
    select r.especie::text as especie, r.id::bigint as id, r.propriedade_id as faz, lower(coalesce(r.sexo, '')) as sexo,
           r.data_de_nascimento as nasc, r.pai_id::bigint as pai, r.mae_id::bigint as mae,
           melhoramento.normalizar_identificacao(r.nome_animal) as nome,
           melhoramento.normalizar_identificacao(r.numero_animal) as numero,
           array[melhoramento.normalizar_identificacao(r.numero_rgn),
                 melhoramento.normalizar_identificacao(r.fbb_registro),
                 melhoramento.normalizar_identificacao(r.numero_certificado),
                 melhoramento.normalizar_identificacao(r.id_eletronica)] as regs
    from public.rebanho r
    where r.especie::text in ('caprino', 'ovino')
    union all
    select 'bovino_corte', b.id, b.propriedade_id, lower(coalesce(b.sexo::text, '')),
           b.data_de_nascimento, b.pai_id, b.mae_id,
           melhoramento.normalizar_identificacao(b.nome),
           melhoramento.normalizar_identificacao(b.numero_manejo),
           array[melhoramento.normalizar_identificacao(b.numero_registro),
                 melhoramento.normalizar_identificacao(b.sisbov),
                 melhoramento.normalizar_identificacao(b.id_eletronica)]
    from public.rebanho_bovino b
    where b.sistema_producao::text = 'corte'
  )
  select b.especie, b.id, b.faz, b.sexo, b.nasc, b.pai, b.mae,
         case when length(b.nome) >= 3 then b.nome end as nome,
         case when length(b.numero) >= 5 then b.numero end as numero,
         coalesce((select array_agg(distinct x) from unnest(b.regs) x where length(x) >= 5), '{}') as regs,
         coalesce(f.teste, false) as teste
  from bruto b
  left join faz f on f.id = b.faz;

  create temporary table _vinc_par on commit drop as
  with chaves as (
    select a.especie, a.id, a.faz, 'nome'::text as tipo, a.nome as chave
      from _vinc_animal a where a.nome is not null
    union all
    select a.especie, a.id, a.faz, 'numero', a.numero from _vinc_animal a where a.numero is not null
    union all
    select a.especie, a.id, a.faz, 'registro', x from _vinc_animal a, unnest(a.regs) x
  ),
  elegivel as (
    select a.* from _vinc_animal a
    where not a.teste and a.sexo not like 'f%'
  ),
  reprodutor as (
    select distinct f.especie, f.pai as id from _vinc_animal f where f.pai is not null
  ),
  casa as (
    -- número e registro se cruzam: quem anota o RGN no campo do número é o mesmo animal.
    select k1.especie, k1.id as a, k2.id as b,
           case when k1.tipo = 'nome' then 'nome'
                when k1.tipo = 'numero' and k2.tipo = 'numero' then 'numero'
                else 'registro' end as motivo,
           k1.chave
    from chaves k1
    join chaves k2
      on k2.especie = k1.especie and k2.chave = k1.chave and k2.id > k1.id and k2.faz <> k1.faz
     and ((k1.tipo = 'nome') = (k2.tipo = 'nome'))
  )
  select c.especie, c.a, c.b,
         array_agg(distinct c.motivo order by c.motivo) as identidade,
         jsonb_agg(distinct jsonb_build_object('motivo', c.motivo, 'chave', c.chave)) as chaves
  from casa c
  join elegivel ea on ea.especie = c.especie and ea.id = c.a
  join elegivel eb on eb.especie = c.especie and eb.id = c.b
  where exists (select 1 from reprodutor r where r.especie = c.especie and r.id in (c.a, c.b))
  group by c.especie, c.a, c.b;

  create temporary table _vinc_avaliado on commit drop as
  with pais as (
    select p.especie, p.a, p.b, p.identidade, p.chaves,
           ea.faz as faz_a, eb.faz as faz_b, ea.nasc as nasc_a, eb.nasc as nasc_b,
           pa_a.nome as pai_a_nome, pa_a.numero as pai_a_num, pa_a.regs as pai_a_regs,
           pa_b.nome as pai_b_nome, pa_b.numero as pai_b_num, pa_b.regs as pai_b_regs,
           ma_a.nome as mae_a_nome, ma_a.numero as mae_a_num, ma_a.regs as mae_a_regs,
           ma_b.nome as mae_b_nome, ma_b.numero as mae_b_num, ma_b.regs as mae_b_regs,
           (pa_a.id is not null) as tem_pai_a, (pa_b.id is not null) as tem_pai_b,
           (ma_a.id is not null) as tem_mae_a, (ma_b.id is not null) as tem_mae_b
    from _vinc_par p
    join _vinc_animal ea on ea.especie = p.especie and ea.id = p.a
    join _vinc_animal eb on eb.especie = p.especie and eb.id = p.b
    left join _vinc_animal pa_a on pa_a.especie = p.especie and pa_a.id = ea.pai
    left join _vinc_animal pa_b on pa_b.especie = p.especie and pa_b.id = eb.pai
    left join _vinc_animal ma_a on ma_a.especie = p.especie and ma_a.id = ea.mae
    left join _vinc_animal ma_b on ma_b.especie = p.especie and ma_b.id = eb.mae
  ),
  comparado as (
    select x.*,
      -- cada genitor: 'igual', 'diferente' ou null (não dá para comparar)
      case when x.tem_pai_a and x.tem_pai_b then
             case when x.pai_a_nome = x.pai_b_nome or x.pai_a_num = x.pai_b_num
                       or x.pai_a_regs && x.pai_b_regs then 'igual'
                  when (x.pai_a_nome is not null or x.pai_a_num is not null or cardinality(x.pai_a_regs) > 0)
                   and (x.pai_b_nome is not null or x.pai_b_num is not null or cardinality(x.pai_b_regs) > 0)
                  then 'diferente' end end as pai,
      case when x.tem_mae_a and x.tem_mae_b then
             case when x.mae_a_nome = x.mae_b_nome or x.mae_a_num = x.mae_b_num
                       or x.mae_a_regs && x.mae_b_regs then 'igual'
                  when (x.mae_a_nome is not null or x.mae_a_num is not null or cardinality(x.mae_a_regs) > 0)
                   and (x.mae_b_nome is not null or x.mae_b_num is not null or cardinality(x.mae_b_regs) > 0)
                  then 'diferente' end end as mae,
      case when x.nasc_a is not null and x.nasc_b is not null then abs(x.nasc_a - x.nasc_b) end as dif_nasc
    from pais x
  )
  select c.*,
         (coalesce(c.pai = 'diferente', false) or coalesce(c.mae = 'diferente', false)
            or coalesce(c.dif_nasc > 31, false)) as contradicao,
         c.identidade
           || case when c.pai = 'igual' then array['pai'] else '{}'::text[] end
           || case when c.mae = 'igual' then array['mae'] else '{}'::text[] end
           || case when c.dif_nasc <= 31 then array['nascimento'] else '{}'::text[] end as motivos
  from comparado c;

  insert into melhoramento.reprodutor_vinculo as v
    (especie, animal_a, propriedade_a, animal_b, propriedade_b, motivos, detalhe)
  select x.especie, x.a, x.faz_a, x.b, x.faz_b, x.motivos,
         jsonb_build_object('chaves', x.chaves, 'pai', x.pai, 'mae', x.mae, 'dias_entre_nascimentos', x.dif_nasc)
  from _vinc_avaliado x
  where not x.contradicao
  on conflict on constraint reprodutor_vinculo_unico do update
    set motivos = excluded.motivos,
        detalhe = excluded.detalhe,
        propriedade_a = excluded.propriedade_a,
        propriedade_b = excluded.propriedade_b,
        atualizado_em = now();
  -- A confirmação (confirmacao, confirmado_por, confirmado_em, observacao) não é tocada.

  return query
    select e.especie,
           (count(*) filter (where not e.contradicao))::int,
           -- gerado_em = now() (início da transação) só nas linhas inseridas agora.
           (count(*) filter (where not e.contradicao and v.gerado_em = now()))::int,
           (count(*) filter (where e.contradicao))::int
    from _vinc_avaliado e
    left join melhoramento.reprodutor_vinculo v
      on v.especie = e.especie and v.animal_a = e.a and v.animal_b = e.b
    group by e.especie
    order by e.especie;
end
$fn$;

comment on function melhoramento.gerar_vinculos() is
  'Melhoramento (interno): gera ou atualiza os candidatos de melhoramento.reprodutor_vinculo (só lê o public). '
  'Preserva a confirmação dos pares que já existiam.';

revoke all on function melhoramento.gerar_vinculos() from public, anon, authenticated;
revoke all on function melhoramento.normalizar_identificacao(text) from public, anon, authenticated;
grant execute on function melhoramento.gerar_vinculos() to service_role;
grant execute on function melhoramento.normalizar_identificacao(text) to service_role;

revoke all on melhoramento.reprodutor_vinculo from public, anon, authenticated;
grant all on melhoramento.reprodutor_vinculo to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Leitura do painel
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.melhoramento_vinculo as
select id, especie, animal_a, propriedade_a, animal_b, propriedade_b, motivos, detalhe,
       confirmacao, confirmado_por, confirmado_em, observacao, gerado_em, atualizado_em
from melhoramento.reprodutor_vinculo;

comment on view adm.melhoramento_vinculo is
  'Melhoramento (interno): candidatos a mesmo reprodutor em fazendas diferentes, com o motivo e a '
  'confirmação. Só service_role. O módulo usa só os confirmados.';

revoke all on adm.melhoramento_vinculo from public;
revoke all on adm.melhoramento_vinculo from anon, authenticated;
grant select on adm.melhoramento_vinculo to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Asserts
-- ─────────────────────────────────────────────────────────────────────────────

do $verifica$
declare
  papel text;
begin
  foreach papel in array array['anon', 'authenticated'] loop
    if has_table_privilege(papel, 'adm.melhoramento_vinculo', 'select') then
      raise exception 'melhoramento_03: % enxerga adm.melhoramento_vinculo', papel;
    end if;
    if has_table_privilege(papel, 'melhoramento.reprodutor_vinculo', 'select') then
      raise exception 'melhoramento_03: % enxerga melhoramento.reprodutor_vinculo', papel;
    end if;
    if has_function_privilege(papel, 'melhoramento.gerar_vinculos()', 'execute') then
      raise exception 'melhoramento_03: % executa melhoramento.gerar_vinculos()', papel;
    end if;
    if has_schema_privilege(papel, 'melhoramento', 'usage') or has_schema_privilege(papel, 'adm', 'usage') then
      raise exception 'melhoramento_03: % tem USAGE em adm ou melhoramento', papel;
    end if;
  end loop;
  if not has_table_privilege('service_role', 'adm.melhoramento_vinculo', 'select') then
    raise exception 'melhoramento_03: service_role sem select em adm.melhoramento_vinculo';
  end if;
end
$verifica$;

notify pgrst, 'reload schema';

-- Primeira geração (rodada na aplicação, 04/11/2026):
select * from melhoramento.gerar_vinculos();
