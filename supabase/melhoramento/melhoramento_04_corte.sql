-- ═════════════════════════════════════════════════════════════════════════════
-- melhoramento_04_corte.sql
-- Aplicado em 04/11/2026 no projeto SeabraApp (migração "melhoramento_corte_views").
--
-- A FRONTEIRA DE LEITURA do melhoramento de BOVINOS DE CORTE (src/lib/
-- melhoramento/corte.ts). Só VIEWS NOVAS no schema `adm`; nada do public é
-- criado ou alterado. Lidos antes, com os comentários das tabelas (04/11/2026):
--
--   * rebanho_bovino guarda corte E leite (`sistema_producao`): aqui, só corte.
--     A transferência entre fazendas MUDA propriedade_id na mesma linha
--     (comentário de transferencia_bovino) — então um pai_id ou mae_id de outra
--     fazenda é o MESMO animal, e não um homônimo. Em 04/11/2026, 1.225
--     bovinos tinham a mãe em outra fazenda (transferência entre fazendas).
--   * O pai é incerto: só ~23% têm pai_id. Na monta com vários touros, o app
--     guarda os possíveis pais em animal_pai_candidato_bovino ("pai: um destes")
--     — a view conta quantos candidatos cada animal tem, para o diagnóstico.
--   * pesagem_bovino.idade_dias está vazia em 99% das linhas: a idade da
--     pesagem é refeita aqui, data_pesagem − data_de_nascimento.
--   * O peso ao nascer existe em rebanho_bovino.peso_ao_nascer e em
--     parto_bovino_cria.peso_kg (cada bezerro do parto); a view entrega os dois.
--   * pesagem_bovino.lote_id é o lote NO DIA da pesagem — o manejo do grupo de
--     contemporâneos.
--
--   adm.melhoramento_bovino_animal   um animal de corte (pedigree e dados do bezerro)
--   adm.melhoramento_bovino_pesagem  pesagens de 150 a 270 dias de idade — a janela
--                                    do peso aos 210 dias do CDP da ABCZ (2023, arts.
--                                    20–25), a mais larga das janelas de desmama
--                                    brasileiras citadas no relatório de corte
--   adm.melhoramento_bovino_fazenda  uma linha por fazenda com bovino de corte, com
--                                    as contagens do diagnóstico
--
-- Mesmas regras do adm_01 e do melhoramento_02: security_invoker OFF, revoke
-- antes do grant à service_role, asserts no fim. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.melhoramento_bovino_animal as
select
  b.id                          as animal_id,
  b.propriedade_id,
  b.sexo::text                  as sexo,
  b.data_de_nascimento,
  b.pai_id,
  b.mae_id,
  b.receptora_id,
  b.numero_manejo               as numero,
  b.nome,
  b.apenas_genealogia,
  b.status::text                as status,
  b.peso_ao_nascer,
  c.peso_kg                     as peso_nascer_parto,
  p.origem::text                as origem_prenhez,
  (select count(*) from public.animal_pai_candidato_bovino k where k.animal_id = b.id)::int as pais_candidatos
from public.rebanho_bovino b
left join lateral (
  select c.peso_kg, c.parto_id from public.parto_bovino_cria c
  where c.animal_id = b.id order by c.id limit 1
) c on true
left join public.parto_bovino p on p.id = c.parto_id
where b.sistema_producao::text = 'corte';

comment on view adm.melhoramento_bovino_animal is
  'Melhoramento (interno): animal de corte com pai, mãe, receptora, sexo, nascimento, peso ao nascer '
  '(da ficha e do parto), origem da prenhez (iatf/te/monta) e número de pais candidatos. Filtrar '
  'SEMPRE por propriedade_id ou animal_id.';

revoke all on adm.melhoramento_bovino_animal from public;
revoke all on adm.melhoramento_bovino_animal from anon, authenticated;
grant select on adm.melhoramento_bovino_animal to service_role;

create or replace view adm.melhoramento_bovino_pesagem as
select
  w.id                                     as pesagem_id,
  w.animal_id,
  b.propriedade_id,
  w.propriedade_id                         as propriedade_pesagem,
  w.data_pesagem,
  w.peso_kg,
  (w.data_pesagem - b.data_de_nascimento)  as idade_dias,
  w.lote_id,
  w.condicao_criacao::text                 as condicao_criacao
from public.pesagem_bovino w
join public.rebanho_bovino b on b.id = w.animal_id
where b.sistema_producao::text = 'corte'
  and b.data_de_nascimento is not null
  and (w.data_pesagem - b.data_de_nascimento) between 150 and 270;

comment on view adm.melhoramento_bovino_pesagem is
  'Melhoramento (interno): pesagens de bovino de corte entre 150 e 270 dias de idade (janela do PC210 '
  'da ABCZ), com o lote do dia. propriedade_id é a fazenda ATUAL do animal. Filtrar SEMPRE por '
  'propriedade_id.';

revoke all on adm.melhoramento_bovino_pesagem from public;
revoke all on adm.melhoramento_bovino_pesagem from anon, authenticated;
grant select on adm.melhoramento_bovino_pesagem to service_role;

create or replace view adm.melhoramento_bovino_fazenda as
with a as (
  select b.propriedade_id,
         count(*)                                          as animais,
         count(*) filter (where b.data_de_nascimento is not null) as com_nascimento,
         count(*) filter (where b.pai_id is not null)      as com_pai,
         count(*) filter (where b.mae_id is not null)      as com_mae,
         count(*) filter (where b.apenas_genealogia)       as apenas_genealogia
  from public.rebanho_bovino b
  where b.sistema_producao::text = 'corte'
  group by b.propriedade_id
),
w as (
  select b.propriedade_id,
         count(*)                                                       as pesagens,
         count(*) filter (where b.data_de_nascimento is null)           as pesagens_sem_nascimento,
         count(*) filter (where (w.data_pesagem - b.data_de_nascimento) between 150 and 270) as pesagens_janela,
         count(distinct w.animal_id) filter (where (w.data_pesagem - b.data_de_nascimento) between 150 and 270)
                                                                        as animais_janela
  from public.pesagem_bovino w
  join public.rebanho_bovino b on b.id = w.animal_id
  where b.sistema_producao::text = 'corte'
  group by b.propriedade_id
)
select
  p.id                                                           as propriedade_id,
  p.nome_propriedade                                             as nome,
  p.produtor_id,
  (coalesce(u.is_tester, false) or coalesce(u.is_demo, false)
     or p.nome_propriedade ilike '%teste%' or p.nome_propriedade ilike '%fixture%') as teste,
  a.animais::int, a.com_nascimento::int, a.com_pai::int, a.com_mae::int, a.apenas_genealogia::int,
  coalesce(w.pesagens, 0)::int                as pesagens,
  coalesce(w.pesagens_sem_nascimento, 0)::int as pesagens_sem_nascimento,
  coalesce(w.pesagens_janela, 0)::int         as pesagens_janela,
  coalesce(w.animais_janela, 0)::int          as animais_janela
from a
join public.propriedades p on p.id = a.propriedade_id
left join public.usuarios u on u.id = p.produtor_id
left join w on w.propriedade_id = a.propriedade_id;

comment on view adm.melhoramento_bovino_fazenda is
  'Melhoramento (interno): uma linha por fazenda com bovino de corte, com o dono, a marca de teste e as '
  'contagens de animais, pais conhecidos e pesagens (todas e na janela de 150 a 270 dias).';

revoke all on adm.melhoramento_bovino_fazenda from public;
revoke all on adm.melhoramento_bovino_fazenda from anon, authenticated;
grant select on adm.melhoramento_bovino_fazenda to service_role;

do $verifica$
declare
  v text;
  papel text;
begin
  foreach v in array array['melhoramento_bovino_animal', 'melhoramento_bovino_pesagem', 'melhoramento_bovino_fazenda'] loop
    foreach papel in array array['anon', 'authenticated'] loop
      if has_table_privilege(papel, 'adm.' || v, 'select') then
        raise exception 'melhoramento_04: % enxerga adm.%', papel, v;
      end if;
    end loop;
    if not has_table_privilege('service_role', 'adm.' || v, 'select') then
      raise exception 'melhoramento_04: service_role sem select em adm.%', v;
    end if;
  end loop;
end
$verifica$;

notify pgrst, 'reload schema';
