-- ═════════════════════════════════════════════════════════════════════════════
-- adm_12_leite.sql — as duas views do CONTROLE LEITEIRO individual
--
-- Implementa as interfaces declaradas em src/lib/adm/areas/contrato.ts:
--
--   adm.controle_leiteiro_animal   ->  LinhaControleAnimal
--   adm.controle_leiteiro_sessoes  ->  LinhaSessaoControle
--
-- POR QUE DUAS VIEWS, E NAO UMA COLUNA jsonb COMO NAS AREAS DA FASE 2:
-- as views de area entregam UMA linha por propriedade porque respondem
-- "como esta esta fazenda". O controle leiteiro responde outra coisa -- "o que
-- deu o controle do dia 09/03" -- e o recorte e uma DATA que o operador escolhe
-- na tela. Uma coluna jsonb teria que escolher a data no SQL (sempre a ultima),
-- e trocar de data viraria outra view. Duas views filtraveis por
-- (propriedade_id, data_controle) deixam a escolha na tela, que e de quem olha.
--
-- A CONTA DO DIA E `sum(litros_produzidos)`, NUNCA `total_produzido`.
-- Auditado em 21.623 linhas: `total_produzido` esta NULO em 6.414 dos 16.483
-- pares (animal, dia) -- 39% -- e, entre os que tem valor, so 7.856 batem com a
-- soma das ordenhas. Ler aquela coluna daria um total menor que o real, sem
-- erro nenhum na tela. A tabela guarda UMA LINHA POR ORDENHA (enum 'primeira' /
-- 'segunda'): 11.345 pares tem uma ordenha, 5.137 tem duas.
--
-- `grupo_controle_id` NAO SERVE COMO CHAVE DE SESSAO, embora o nome prometa:
-- esta preenchido em 37,9% das linhas e, onde esta, e UM GRUPO POR ANIMAL (na
-- propriedade 244, o controle de 07/08 tem um grupo_controle_id distinto para
-- cada uma das 61 cabras). Quem junta as linhas num "controle" e a DATA -- e o
-- rabicho de dias consecutivos (o lancamento atrasado do dia seguinte) e
-- costurado em TypeScript, com teste, em areas/controle-leiteiro.ts.
--
-- ⚠️ O DEL LANCADO NAO E CONFIAVEL, E A VIEW CALCULA O SEU. `controle_leiteiro.del`
-- esta nulo em 10.282 das 16.978 linhas (60%) -- e, onde esta preenchido, nem
-- sempre presta: na propriedade 234 o ultimo controle traz DEL de 517 a 687
-- dias para cabras que pariram 167 a 272 dias antes (o valor veio de uma
-- lactacao anterior e nunca foi recalculado). O app tem um trigger
-- (`calculate_del_on_controle_leiteiro`) cuja regra e "dias desde o inicio da
-- lactacao que COBRE a data do controle" -- a view aplica exatamente essa regra
-- e so cai no valor lancado quando nenhuma lactacao cobre a data. `del_origem`
-- diz qual dos dois saiu, e `del_lancado` fica exposto para a tela apontar a
-- divergencia. Com isso o DEL passa de 6.696 para 15.620 linhas preenchidas.
--
-- ORDEM IMPORTA: `sessoes` le `animal`. Para reescrever `animal` sozinha use
-- `create or replace` (nunca `drop`), senao o Postgres exige CASCADE e derruba
-- `sessoes` junto -- foi exatamente essa armadilha que adm_07 escondeu ate as
-- views de benchmark da Fase 3 baterem nela.
--
-- Rodar DEPOIS de adm_01 (schema adm). Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.controle_leiteiro_animal  ->  interface LinhaControleAnimal
--
-- Uma linha por (propriedade, data, animal): as ordenhas do dia somadas, com o
-- numero, o nome e a baia que a tela precisa para listar sem um segundo join.
--
-- INNER JOIN com rebanho e de proposito (auditado: zero orfaos hoje). Uma
-- pesagem cujo animal sumiu do cadastro nao tem numero nem baia para mostrar --
-- ela viraria uma linha "—" no ranking, que e pior que a ausencia.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.controle_leiteiro_animal as
with dia as (
  select
    cl.propriedade_id,
    cl.data_simples                              as data_controle,
    cl.animal_id,
    -- A soma das ordenhas do dia. Ver a nota do cabecalho sobre total_produzido.
    round(sum(cl.litros_produzidos), 3)          as litros,
    count(*)::int                                as ordenhas,
    -- max() ignora nulo: o animal que trouxe DEL em UMA das duas ordenhas
    -- mantem o valor.
    max(cl.del)                                  as del_lancado
  from public.controle_leiteiro cl
  group by 1, 2, 3
)
select
  d.propriedade_id,
  d.data_controle,
  d.animal_id,
  r.numero_animal,
  r.nome_animal,
  b.nome_baia                                    as baia,
  d.litros,
  d.ordenhas,

  -- O DEL da tela: calculado pela lactacao que cobre a data (a regra do proprio
  -- app), e so na falta dela o valor lancado. Ver a nota do cabecalho. null =
  -- nem lactacao nem lancamento -- "nao medido", que a tela mostra como "—".
  coalesce((d.data_controle - l.data_inicio)::int, d.del_lancado) as del,

  -- Colunas acrescentadas DEPOIS (create or replace exige que venham no fim).
  d.del_lancado,
  case when l.data_inicio is not null then 'calculado'
       when d.del_lancado is not null then 'lancado' end          as del_origem,
  l.data_inicio                                  as lactacao_inicio,
  l.data_fim                                     as lactacao_fim

from dia d
join public.rebanho r on r.id = d.animal_id
left join public.baias b on b.id = r.baia_id
-- A lactacao que COBRE a data do controle -- mesma janela do trigger do app:
-- comecou antes e, se ja terminou, terminou depois. Indice idx_lactacao_animal.
left join lateral (
  select l.data_inicio, l.data_fim
    from public.lactacao l
   where l.animal_id = d.animal_id
     and l.data_inicio <= d.data_controle
     and (l.data_fim is null or l.data_fim >= d.data_controle)
   order by l.data_inicio desc
   limit 1
) l on true;

comment on view adm.controle_leiteiro_animal is
  'Controle leiteiro por animal e por dia: ordenhas somadas. Filtrar SEMPRE por propriedade_id '
  '(e por data_controle na tela do controle). litros = sum(litros_produzidos), nunca total_produzido. '
  'del = dias desde o inicio da lactacao que cobre a data (regra do app); del_lancado so na falta dela.';

revoke all on adm.controle_leiteiro_animal from public;
revoke all on adm.controle_leiteiro_animal from anon, authenticated;
grant select on adm.controle_leiteiro_animal to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.controle_leiteiro_sessoes  ->  interface LinhaSessaoControle
--
-- Uma linha por (propriedade, data): o resumo de cada controle. E o que enche o
-- seletor de data e a serie "media por controle ao longo do tempo" -- sem
-- precisar ler as centenas de linhas de animal de todos os controles.
--
-- MEDIA SOBRE QUEM DEU LEITE, e nao sobre quem foi ao controle: sao numeros
-- diferentes e a tela mostra os dois. Hoje a base nao tem uma unica linha com
-- litros = 0 (a fazenda simplesmente nao lanca a cabra seca), entao os dois
-- coincidem -- o filtro existe para quando alguem comecar a lancar o zero, que e
-- exatamente quando a media "geral" despencaria sem motivo aparente.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view adm.controle_leiteiro_sessoes as
select
  a.propriedade_id,
  a.data_controle,
  count(*)::int                                             as animais,
  count(*) filter (where a.litros > 0)::int                 as animais_com_leite,
  round(sum(a.litros), 2)                                   as litros_total,

  -- null quando ninguem deu leite: 0,00 L/animal seria uma afirmacao (a de que
  -- o rebanho secou), e a verdade e que nao ha denominador.
  case when count(*) filter (where a.litros > 0) > 0
       then round(sum(a.litros) / count(*) filter (where a.litros > 0), 3)
  end                                                       as media_com_leite,

  -- Media de DEL sobre quem TEM DEL medido (ver a nota da view acima). O
  -- denominador vai junto, em `animais_com_del`, porque "DEL medio 91 dias"
  -- sobre 3 animais e sobre 90 sao afirmacoes de forcas diferentes.
  round(avg(a.del) filter (where a.del is not null and a.del > 0))::int
                                                            as del_medio,
  count(*) filter (where a.del is not null and a.del > 0)::int
                                                            as animais_com_del

from adm.controle_leiteiro_animal a
group by 1, 2;

comment on view adm.controle_leiteiro_sessoes is
  'Resumo de cada dia de controle leiteiro, uma linha por (propriedade_id, data_controle). '
  'Alimenta o seletor de data e a serie historica. Dias consecutivos (lancamento atrasado) sao '
  'costurados numa sessao so em TypeScript -- ver areas/controle-leiteiro.ts.';

revoke all on adm.controle_leiteiro_sessoes from public;
revoke all on adm.controle_leiteiro_sessoes from anon, authenticated;
grant select on adm.controle_leiteiro_sessoes to service_role;
