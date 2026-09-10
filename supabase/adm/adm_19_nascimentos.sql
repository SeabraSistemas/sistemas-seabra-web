-- ═════════════════════════════════════════════════════════════════════════════
-- adm_19_nascimentos.sql — o nascimento como evento, cria a cria
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.nascimento_detalhe  ->  LinhaNascimento
--
-- ⚠️ NAO EXISTE TABELA DE PARTO (a mesma nota de adm_07_areas.sql). O parto e o
-- INSERT das crias em `rebanho` com mae_id. Entao o TAMANHO DA NINHADA e uma
-- window function: count(*) over (partition by mae_id, data_de_nascimento).
--
-- Isso permite a leitura zootecnica que nenhuma outra tela do painel faz: peso
-- ao nascer POR TAMANHO DE NINHADA. Cria unica nasce mais pesada que gemelar, e
-- gemelar mais que trigemelar -- comparar o peso medio do rebanho sem separar
-- por ninhada mistura tres populacoes diferentes.
--
-- Cria SEM mae_id fica com ninhada NULA, e nao 1: 3.580 animais da base nao tem
-- mae cadastrada, e chuta-los como "cria unica" inflaria o grupo mais pesado
-- justamente com os animais de cadastro pior.
--
-- ⚠️ PESO AO NASCER VEM SUJO: 237 linhas com valor <= 0 e 27 acima de 10 kg,
-- sendo a maior 408 kg -- que e peso de boi adulto, nao de cabrito. A view
-- entrega o numero cru; quem separa e o TypeScript, com teste.
--
-- O OBITO VEM JUNTO, por LEFT JOIN: sem ele nao ha como responder "dos que
-- nasceram neste periodo, quantos ja morreram" -- que e a mortalidade que
-- importa no neonato e que a aba Sanidade nao separa dos adultos.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.nascimento_detalhe as
select
  r.propriedade_id,
  r.id                                          as animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  r.status,
  r.data_de_nascimento                          as data_nascimento,
  r.peso_ao_nascer,
  r.origem,

  r.mae_id,
  mae.numero_animal                             as mae_numero,
  mae.nome_animal                               as mae_nome,
  r.pai_id,

  -- TAMANHO DA NINHADA. NULL quando nao ha mae cadastrada: sem ela nao da para
  -- saber com quantos irmaos a cria nasceu, e supor "1" premiaria o cadastro
  -- ruim com o grupo de maior peso esperado.
  case when r.mae_id is not null
       then count(*) over (partition by r.mae_id, r.data_de_nascimento)::int
  end                                           as ninhada,

  o.data_obito,
  -- Idade ao morrer, em dias, para a cria que morreu. NULL para quem esta vivo.
  case when o.data_obito is not null
       then (o.data_obito - r.data_de_nascimento)::int
  end                                           as idade_ao_morrer

from public.rebanho r
left join public.rebanho mae on mae.id = r.mae_id
left join public.obito o     on o.animal_id = r.id
where r.data_de_nascimento is not null;

comment on view adm.nascimento_detalhe is
  'Uma cria por linha, com tamanho da ninhada (window sobre mae + dia, pois nao existe tabela de '
  'parto), peso ao nascer CRU (ha valores <= 0 e ate 408 kg) e o obito quando houve. Filtrar '
  'SEMPRE por propriedade_id.';

revoke all on adm.nascimento_detalhe from public;
revoke all on adm.nascimento_detalhe from anon, authenticated;
grant select on adm.nascimento_detalhe to service_role;
