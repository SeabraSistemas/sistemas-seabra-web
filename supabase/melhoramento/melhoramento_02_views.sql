-- ═════════════════════════════════════════════════════════════════════════════
-- melhoramento_02_views.sql
-- Aplicado em 30/10/2026 no projeto SeabraApp (migração "melhoramento_views_adm").
--
-- A FRONTEIRA DE LEITURA do módulo interno de melhoramento genético do /adm.
-- Implementa VIEWS_MELHORAMENTO de src/lib/adm/areas/contrato.ts:
--
--   adm.melhoramento_lactacao     ->  LinhaMelhoramentoLactacao
--   adm.melhoramento_pedigree     ->  LinhaMelhoramentoPedigree
--   adm.melhoramento_fazenda      ->  LinhaMelhoramentoFazenda
--   adm.melhoramento_rodada       ->  leitura de melhoramento.rodada
--   adm.melhoramento_resultado    ->  leitura de melhoramento.resultado_animal
--   adm.melhoramento_validacao    ->  leitura de melhoramento.validacao
--   adm.melhoramento_diagnostico  ->  leitura de melhoramento.diagnostico_dado
--
-- O QUE ESTE ARQUIVO NÃO FAZ, e é a regra do módulo: nenhuma tabela, função,
-- gatilho ou política do schema `public` é criada ou alterada. Só VIEWS no
-- schema `adm` (o teto do que o painel vê, ver adm_01) — e o adm_01 proíbe
-- tabela e materialized view aqui. Leitura pura: o cálculo dos modelos é feito
-- no servidor do Next (src/lib/melhoramento/*), nunca no banco.
--
-- Mesmas regras do adm_01: views em security_invoker = OFF (rodam como o dono,
-- `postgres`, e por isso não dependem da RLS de `public`), e `revoke all ...
-- from public, anon, authenticated` ANTES do `grant select ... to service_role`
-- depois de CADA view. O schema `adm` não tem USAGE para anon nem
-- authenticated; o revoke por objeto é a segunda tranca.
--
-- PEQUENOS RUMINANTES APENAS. Bovinos de corte vivem em public.rebanho_bovino,
-- pesagem_bovino e parto_bovino, com outra característica (peso, não leite) e
-- outro desenho de grupo de contemporâneos; ficam fora desta versão de
-- propósito. O desenho do TypeScript já separa "espécie" de "fonte de dados"
-- (ESPECIES_MELHORAMENTO em src/lib/melhoramento/especies.ts) para entrarem
-- depois sem mexer nestas views.
--
-- Rodar DEPOIS de adm_01 e de melhoramento_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.melhoramento_lactacao — uma linha por lactação de cabra ou ovelha
--
-- Achados auditados em 30/10/2026 que moldam esta view (ver também adm_15):
--
--   * ENCERRAMENTO = coalesce(data_fim, data_termino). As duas colunas
--     concordam em todos os casos com as duas preenchidas, salvo 3.
--   * 1.500 LACTAÇÕES SINTÉTICAS (confianca_inferencia = 'sintetico', uma
--     fazenda só). A view as entrega com `sintetica = true`; quem tira é o
--     TypeScript, que as conta — mesma decisão do adm_15.
--   * `rebanho.ordem_parto` É A ORDEM ATUAL DO ANIMAL, não a desta lactação.
--     Por isso a view entrega TRÊS coisas e não inventa uma quarta:
--       ordem_lactacao       posição desta lactação entre as REGISTRADAS do
--                            animal (sintéticas fora da contagem);
--       lactacoes_do_animal  quantas lactações reais o animal tem na base;
--       ordem_parto_cadastro o rebanho.ordem_parto cru.
--     Quem decide primípara/adulta é classificarParto() no TypeScript (com
--     teste), porque 314 cabras têm ordem_parto maior que as lactações
--     registradas: entraram na base com partos anteriores ao app.
--   * ESTAÇÃO DO PARTO pelo hemisfério sul: verão dez–fev, outono mar–mai,
--     inverno jun–ago, primavera set–nov. Dezembro é o início do verão do ANO
--     SEGUINTE (ano_estacao), senão um verão seria partido em dois grupos.
--   * DURAÇÃO = data_encerramento − data_inicio (bate com dias_em_lactacao em
--     todas as encerradas, salvo 4). `dias_registrados` vai cru ao lado.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.melhoramento_lactacao as
with base as (
  select
    r.propriedade_id,
    r.especie::text                                     as especie,
    l.id                                                as lactacao_id,
    l.animal_id,
    r.raca,
    r.ordem_parto                                       as ordem_parto_cadastro,
    r.data_de_nascimento,
    r.pai_id,
    r.mae_id,
    l.data_inicio,
    coalesce(l.data_fim, l.data_termino)                as data_encerramento,
    l.dias_em_lactacao                                  as dias_registrados,
    l.total_leite,
    l.media_leite,
    l.metodo_inferencia,
    l.confianca_inferencia,
    (coalesce(l.confianca_inferencia, '') = 'sintetico') as sintetica
  from public.lactacao l
  join public.rebanho r on r.id = l.animal_id
  where r.especie::text in ('caprino', 'ovino')
    and l.data_inicio is not null
)
select
  b.propriedade_id,
  b.especie,
  b.lactacao_id,
  b.animal_id,
  b.raca,
  -- A sintética não empurra a ordem das reais: ela é contada à parte.
  (row_number() over (partition by b.animal_id, b.sintetica
                      order by b.data_inicio, b.lactacao_id))::int      as ordem_lactacao,
  (count(*) over (partition by b.animal_id, b.sintetica))::int          as lactacoes_do_animal,
  b.ordem_parto_cadastro,
  b.data_inicio,
  extract(year from b.data_inicio)::int                                 as ano_parto,
  extract(month from b.data_inicio)::int                                as mes_parto,
  case
    when extract(month from b.data_inicio) in (12, 1, 2) then 'verao'
    when extract(month from b.data_inicio) in (3, 4, 5)  then 'outono'
    when extract(month from b.data_inicio) in (6, 7, 8)  then 'inverno'
    else 'primavera'
  end                                                                   as estacao_parto,
  (extract(year from b.data_inicio)
     + case when extract(month from b.data_inicio) = 12 then 1 else 0 end)::int as ano_estacao,
  -- Idade ao parto em dias. null sem data de nascimento; pode ser negativa
  -- (nascimento lançado depois do parto) — o TypeScript trata, não esconde.
  (b.data_inicio - b.data_de_nascimento)                                as idade_parto_dias,
  b.data_encerramento,
  (b.data_encerramento is not null)                                     as encerrada,
  case when b.data_encerramento is not null
       then (b.data_encerramento - b.data_inicio) end                   as duracao_dias,
  b.dias_registrados,
  b.total_leite,
  b.media_leite,
  b.metodo_inferencia,
  b.confianca_inferencia,
  b.sintetica,
  b.pai_id,
  b.mae_id
from base b;

comment on view adm.melhoramento_lactacao is
  'Melhoramento (interno): uma lactação de cabra ou ovelha por linha, com fazenda, espécie, raça, '
  'ordem da lactação entre as registradas, ano/estação do parto (hemisfério sul; dezembro conta no '
  'verão do ano seguinte), duração, total, média diária, encerramento, método de inferência, pai e '
  'mãe. Traz as sintéticas com sintetica = true — quem separa é o consumidor. Filtrar SEMPRE por '
  'propriedade_id ou especie.';

revoke all on adm.melhoramento_lactacao from public;
revoke all on adm.melhoramento_lactacao from anon, authenticated;
grant select on adm.melhoramento_lactacao to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.melhoramento_pedigree — o rebanho como pedigree
--
-- Uma linha por animal de pequeno ruminante. Auditado em 30/10/2026: todo
-- pai_id e mae_id aponta para um animal existente, da MESMA fazenda e da mesma
-- espécie (por isso, hoje, nenhuma conexão genética entre fazendas). A view
-- não filtra nada disso: se amanhã um pai vier de outra fazenda, montarPedigree()
-- o trata como desconhecido e conta, em vez de esconder.
--
-- numero_animal e nome_animal vêm porque o ranking precisa dizer QUAL cabra é
-- (as outras views do adm já os expõem); não há dado pessoal de produtor aqui.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.melhoramento_pedigree as
select
  r.id                    as animal_id,
  r.propriedade_id,
  r.especie::text         as especie,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  r.data_de_nascimento,
  r.pai_id,
  r.mae_id,
  r.raca,
  r.status
from public.rebanho r
where r.especie::text in ('caprino', 'ovino');

comment on view adm.melhoramento_pedigree is
  'Melhoramento (interno): animal, pai, mãe, sexo, nascimento, fazenda e espécie de cada cabra ou '
  'ovelha. Pais desconhecidos são null. Filtrar SEMPRE por propriedade_id ou especie.';

revoke all on adm.melhoramento_pedigree from public;
revoke all on adm.melhoramento_pedigree from anon, authenticated;
grant select on adm.melhoramento_pedigree to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. adm.melhoramento_fazenda — quais fazendas têm o que analisar
--
-- Uma linha por (propriedade, espécie) com pelo menos um animal. É a lista da
-- página /adm/melhoramento; os números de lactação aqui são CONTAGENS para
-- decidir o que carregar, e o diagnóstico de verdade é feito no TypeScript
-- sobre adm.melhoramento_lactacao.
--
-- `teste` segue a regra de adm.propriedade_panorama (tester, demo, ou "teste"/
-- "fixture" no nome) sem depender daquela view, que é pesada e lê assinatura.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.melhoramento_fazenda as
select
  p.id                                                               as propriedade_id,
  r.especie::text                                                    as especie,
  p.nome_propriedade                                                 as nome,
  p.produtor_id,
  (coalesce(u.is_tester, false) or coalesce(u.is_demo, false)
     or p.nome_propriedade ilike '%teste%'
     or p.nome_propriedade ilike '%fixture%')                        as teste,
  (count(distinct r.id))::int                                        as animais,
  (count(l.id) filter (where coalesce(l.confianca_inferencia, '') <> 'sintetico'))::int
                                                                     as lactacoes,
  (count(l.id) filter (where coalesce(l.confianca_inferencia, '') <> 'sintetico'
                         and coalesce(l.data_fim, l.data_termino) is not null))::int
                                                                     as lactacoes_encerradas,
  (count(l.id) filter (where coalesce(l.confianca_inferencia, '') = 'sintetico'))::int
                                                                     as lactacoes_sinteticas
from public.propriedades p
join public.rebanho r on r.propriedade_id = p.id and r.especie::text in ('caprino', 'ovino')
left join public.lactacao l on l.animal_id = r.id and l.data_inicio is not null
left join public.usuarios u on u.id = p.produtor_id
group by p.id, r.especie, p.nome_propriedade, p.produtor_id, u.is_tester, u.is_demo;

comment on view adm.melhoramento_fazenda is
  'Melhoramento (interno): uma linha por (propriedade, espécie) de pequeno ruminante, com o dono '
  '(produtor_id, para o link da ficha), a marca de teste e contagens de animais e lactações reais, '
  'encerradas e sintéticas.';

revoke all on adm.melhoramento_fazenda from public;
revoke all on adm.melhoramento_fazenda from anon, authenticated;
grant select on adm.melhoramento_fazenda to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Leitura das tabelas do schema interno `melhoramento`
--
-- O schema `melhoramento` NÃO está no Exposed schemas do PostgREST (e não deve
-- entrar): o painel lê por estas views, com as colunas explícitas. Nesta
-- versão o painel não grava nada lá (o cálculo é sob demanda); as views já
-- existem para a próxima, em que rodadas forem persistidas.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.melhoramento_rodada as
select id, criada_em, especie, propriedade_id, modelo, caracteristica, parametros,
       versao_motor, status, n_animais, n_registros, resumo, observacao
from melhoramento.rodada;

comment on view adm.melhoramento_rodada is
  'Melhoramento (interno): rodadas de modelos gravadas no schema melhoramento.';

revoke all on adm.melhoramento_rodada from public;
revoke all on adm.melhoramento_rodada from anon, authenticated;
grant select on adm.melhoramento_rodada to service_role;

create or replace view adm.melhoramento_resultado as
select rodada_id, animal_id, propriedade_id, valor, confiabilidade, posicao, extra
from melhoramento.resultado_animal;

comment on view adm.melhoramento_resultado is
  'Melhoramento (interno): resultado de cada animal numa rodada (EBV, MPPA ou índice e confiabilidade).';

revoke all on adm.melhoramento_resultado from public;
revoke all on adm.melhoramento_resultado from anon, authenticated;
grant select on adm.melhoramento_resultado to service_role;

create or replace view adm.melhoramento_validacao as
select rodada_id, metrica, valor, n, detalhe
from melhoramento.validacao;

comment on view adm.melhoramento_validacao is
  'Melhoramento (interno): métricas de validação de cada rodada.';

revoke all on adm.melhoramento_validacao from public;
revoke all on adm.melhoramento_validacao from anon, authenticated;
grant select on adm.melhoramento_validacao to service_role;

create or replace view adm.melhoramento_diagnostico as
select id, gerado_em, especie, propriedade_id, metricas
from melhoramento.diagnostico_dado;

comment on view adm.melhoramento_diagnostico is
  'Melhoramento (interno): diagnósticos de qualidade de dado gravados por fazenda.';

revoke all on adm.melhoramento_diagnostico from public;
revoke all on adm.melhoramento_diagnostico from anon, authenticated;
grant select on adm.melhoramento_diagnostico to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Asserts — falham alto se alguma view nova ficou visível fora da service_role
-- ─────────────────────────────────────────────────────────────────────────────

do $verifica$
declare
  v text;
  papel text;
begin
  foreach v in array array[
    'melhoramento_lactacao', 'melhoramento_pedigree', 'melhoramento_fazenda',
    'melhoramento_rodada', 'melhoramento_resultado', 'melhoramento_validacao',
    'melhoramento_diagnostico'
  ] loop
    if to_regclass('adm.' || v) is null then
      raise exception 'melhoramento_02: a view adm.% não existe', v;
    end if;
    foreach papel in array array['anon', 'authenticated'] loop
      if has_table_privilege(papel, 'adm.' || v, 'select') then
        raise exception 'melhoramento_02: % enxerga adm.%', papel, v;
      end if;
    end loop;
    if not has_table_privilege('service_role', 'adm.' || v, 'select') then
      raise exception 'melhoramento_02: service_role sem select em adm.%', v;
    end if;
  end loop;
  foreach papel in array array['anon', 'authenticated'] loop
    if has_schema_privilege(papel, 'adm', 'usage') or has_schema_privilege(papel, 'melhoramento', 'usage') then
      raise exception 'melhoramento_02: % tem USAGE em adm ou melhoramento', papel;
    end if;
  end loop;
end
$verifica$;

-- PostgREST: view nova em schema já exposto só aparece depois de recarregar o cache.
notify pgrst, 'reload schema';
