-- ═════════════════════════════════════════════════════════════════════════════
-- adm_10_propriedades.sql — o DIRETÓRIO DE PROPRIEDADES
--
-- Implementa UMA view, a quinta da Fase 3:
--
--   adm.propriedades_lista  ->  interface LinhaPropriedade
--                               (VIEWS_FASE_3.propriedades, src/lib/adm/areas/contrato.ts)
--
-- POR QUE ELA EXISTE — as palavras do Felipe, 05/09/2026:
--   "não quero acompanhar nada de colaborador, somente da propriedade que eu
--    quero ver, nela posso até ter a relação dos colaboradores"
--
-- Isso troca a entidade principal do painel. O tenant real do banco é
-- `propriedade_id` (93 tabelas o carregam), e é a FAZENDA que ele gere — o
-- usuário é só quem loga nela. Duas consequências que a lista de usuários
-- (adm.usuarios_lista) responde errado por construção:
--
--   1. Uma conta com DUAS fazendas vira uma linha só. A lista mestra mostra a
--      propriedade PRINCIPAL (menor prioridade de vínculo, menor id) e some com
--      a outra — que existe, tem rebanho e tem lançamento.
--   2. Uma fazenda de CONSULTORIA (propriedades.produtor_id IS NULL — o técnico
--      cadastrou um cliente que não usa o app) não tem usuário nenhum para
--      ancorar. Ela simplesmente não aparece.
--
-- O CONTRATO MANDA, ESTE ARQUIVO OBEDECE — mesma regra do adm_07 e do adm_09.
-- Nome da view e nome de CADA coluna vêm de `LinhaPropriedade`; aqui nada é
-- batizado de novo, e nada é omitido em silêncio.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- A REGRA QUE GOVERNA O ARQUIVO INTEIRO: REUSAR, NÃO RECALCULAR
--
-- Todo número desta view já é afirmado em outra tela do painel. Recalcular aqui
-- — mesmo "igualzinho" — produz, na primeira divergência de detalhe, uma
-- fazenda com 412 animais na lista e 409 na ficha. Esse é o defeito mais caro
-- deste painel: não quebra nada, não aparece em teste, e destrói a confiança no
-- número na frente do cliente. Então:
--
--   animais_ativos, lactantes,
--   colaboradores, tecnicos_vinculados   <- adm.propriedade_visao_geral (adm_01)
--   ultimo_lancamento_em, ultimo_modulo,
--   lancamentos_30d, dias_sem_lancar     <- adm.atividade_propriedade    (adm_02)
--   plano_nome, status_efetivo,
--   acesso_ativo                         <- adm.assinatura_normalizada   (adm_01)
--   health_score                         <- a MESMA expressão do adm_01 §7
--
-- Não há uma única agregação nova sobre `rebanho`, `manejo` ou `pagamentos`
-- neste arquivo. Se um número estiver errado, ele está errado nas duas telas —
-- que é exatamente o que se quer de um painel.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- CARDINALIDADE: UMA LINHA POR PROPRIEDADE, sem exceção.
--
-- A base é `public.propriedades` e todo o resto entra por LEFT JOIN de um lado
-- só (as três views são de 1 linha por âncora; o `dono` é um lateral com
-- LIMIT 1). Nunca INNER: a fazenda de consultoria não tem dono, não tem
-- assinatura e pode não ter lançamento nenhum — e é justamente ela que o painel
-- precisa mostrar. Um INNER JOIN a faria sumir sem erro nenhum.
--
-- ORDEM DE EXECUÇÃO: rodar DEPOIS de adm_01 (propriedade_visao_geral,
-- assinatura_normalizada) e adm_02 (atividade_propriedade). O adm_05 roda por
-- último e assere que esta view existe, tem âncora e tem grant.
-- Idempotente: `drop view if exists` antes do `create`.
-- ═════════════════════════════════════════════════════════════════════════════

drop view if exists adm.propriedades_lista;


-- ─────────────────────────────────────────────────────────────────────────────
-- adm.propriedades_lista  ->  interface LinhaPropriedade
--
-- A linha NÃO abre tela nova: ela navega para a ficha que já existe,
-- `/adm/u/<produtor_id>?prop=<id>`. Por isso `produtor_id` é tão âncora quanto
-- `id` — sem ele a linha é um beco sem saída, e é o caso da consultoria (ver a
-- nota do produtor, abaixo).
--
-- Sem ORDER BY de propósito: quem ordena é a tela (`<AdmTable>`), e uma view
-- ordenada só engana o leitor sobre o custo — o PostgREST reordena de qualquer
-- jeito no `?order=`.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedades_lista as
select
  -- IDENTIDADE ────────────────────────────────────────────────────────────────
  p.id,
  -- NOT NULL no schema, e projetada crua igual em adm.propriedades_escopo: o
  -- mesmo nome de fazenda tem de sair caractere a caractere igual nas duas.
  p.nome_propriedade                                   as nome,
  -- D1: numero_criador é coluna SECUNDÁRIA e aceita vazia. String vazia vira
  -- NULL para a tela mostrar "—" em vez de uma célula em branco ambígua.
  nullif(btrim(p.numero_criador), '')                  as numero_criador,
  nullif(btrim(p.cidade), '')                          as cidade,
  nullif(btrim(p.estado), '')                          as estado,
  -- Mesmo filtro de adm.propriedades_escopo (adm_01 §4): lixo histórico dentro
  -- do text[] não pode furar a union fechada de `Segmento` no TypeScript.
  coalesce(
    (select array_agg(s order by s)
       from unnest(coalesce(p.segmentos, '{}'::text[])) s
      where s in ('caprino_leiteiro', 'caprino_corte', 'ovino_leiteiro', 'ovino_corte')),
    '{}'::text[]
  )                                                    as segmentos,

  -- O DONO, QUANDO EXISTE ─────────────────────────────────────────────────────
  -- NULL é RESPOSTA, não dado faltando: é a marca da fazenda de consultoria
  -- (`propriedades.produtor_id IS NULL` — o técnico cadastrou um cliente que não
  -- usa o app). A tela precisa dizer "sem produtor no sistema" em vez de deixar
  -- um espaço vazio que parece bug. NÃO caímos em `p.nome_proprietario` aqui:
  -- ele é campo livre digitado pelo técnico, não identifica uma conta, e
  -- preenchê-lo faria a linha PARECER navegável para uma ficha que não existe.
  dono.id                                              as produtor_id,
  nullif(btrim(dono.nome), '')                         as produtor_nome,

  -- REBANHO ───────────────────────────────────────────────────────────────────
  -- De adm.propriedade_visao_geral. `lactantes` em particular NÃO pode ser
  -- recalculado aqui: `rebanho.categoria` guarda o UUID da categoria, não o
  -- nome, e o join com categoria_animal é a armadilha que devolve zero sem dar
  -- erro. A view do adm_01 já resolve isso — e é ela que a ficha mostra.
  coalesce(vg.animais_ativos, 0)                       as animais_ativos,
  coalesce(vg.lactantes, 0)                            as lactantes,

  -- SINAL DE VIDA (D2) ────────────────────────────────────────────────────────
  -- De adm.atividade_propriedade, a mesma fonte da lista de usuários. Uma
  -- propriedade sem NENHUM lançamento não existe naquela view: o LEFT JOIN a
  -- traz com tudo NULL, e é assim que "nunca lançou" se distingue de "lançou há
  -- muito tempo" — dias_sem_lancar NULL, não um número enorme.
  t.ultimo_lancamento_em,
  t.ultimo_modulo,
  coalesce(t.lancamentos_30d, 0)                       as lancamentos_30d,
  case when t.ultimo_lancamento_em is not null
       then floor(extract(epoch from (now() - t.ultimo_lancamento_em)) / 86400)::int
  end                                                  as dias_sem_lancar,

  -- QUEM TRABALHA NESTA FAZENDA ───────────────────────────────────────────────
  -- É a "relação dos colaboradores" que o Felipe pediu, em forma de contagem; a
  -- lista nominal é a aba Equipe (adm.propriedade_equipe, adm_07), que conta
  -- pelas MESMAS duas regras — colaborador = usuarios com
  -- regra_de_acesso='colaborador' e propriedade_id = esta; técnico vinculado =
  -- tecnico_propriedades com status='ativo' (minúsculo, CHECK da tabela).
  -- Vem de adm.propriedade_visao_geral para as três telas nunca discordarem.
  coalesce(vg.colaboradores, 0)                        as colaboradores,
  coalesce(vg.tecnicos_vinculados, 0)                  as tecnicos_vinculados,

  -- ASSINATURA — DO DONO, não da fazenda ──────────────────────────────────────
  -- A fazenda não assina: o produtor assina. Numa conta com duas propriedades as
  -- duas linhas mostram o MESMO plano, de propósito — é um contrato só, e
  -- inventar rateio por fazenda daria um MRR que não bate com adm_06/adm_09.
  -- Fazenda de consultoria fica com plano NULL e acesso_ativo = false: quem paga
  -- ali é o técnico, pelo plano `tipo='tecnico'` dele, que aparece em
  -- /adm/consultores. Somar receita a partir desta view contaria fazenda, não
  -- contrato — a fonte do MRR é adm.assinatura_normalizada.
  an.plano_nome,
  an.status_efetivo,
  coalesce(an.acesso_ativo, false)                     as acesso_ativo,

  -- HEALTH SCORE ──────────────────────────────────────────────────────────────
  -- ⚠️ CÓPIA LITERAL DA EXPRESSÃO DE adm.usuarios_lista (adm_01 §7). Os pesos
  -- (35 recência / 25 frequência / 15 amplitude / 10 profundidade / 15 cobrança)
  -- e as escalas vivem em docs/internal/ADM_DASHBOARD_DESENHO.md §"Health score".
  -- MEXEU AQUI, MEXA LÁ — e vice-versa. Uma fazenda com nota 71 nesta lista e 64
  -- na ficha do dono não é um bug visível: é o painel perdendo a autoridade sem
  -- ninguém perceber.
  --
  -- POR QUE A COPIA E NAO UMA FUNCAO: extrair `adm.saude_propriedade(...)` e
  -- fazer as DUAS pontas chamarem exige reescrever adm.usuarios_lista, que mora
  -- no adm_01 e não pertence a este arquivo. Enquanto as duas forem cópias, este
  -- comentário (e o gêmeo dele no adm_01) é o único fio que as prende. Se um dia
  -- uma terceira view precisar do score, aí sim: função no schema `adm`, e as
  -- três passam a chamá-la no mesmo commit.
  --
  -- A ÚNICA diferença estrutural, e ela é aritmética, não de definição: no
  -- adm_01 os quatro primeiros componentes são calculados POR PROPRIEDADE e
  -- agregados para a conta pela MEDIANA (senão um consultor com 7 clientes
  -- pareceria 7x mais saudável). Aqui a âncora JÁ É a propriedade — a mediana de
  -- um valor só é o próprio valor. Para 30 dos 31 produtores (1 conta = 1
  -- fazenda) os dois números são idênticos, e é isso que se quer.
  --
  -- Guard-rails idênticos aos do adm_01 (null = "não dá para pontuar ainda",
  -- que a tela mostra como "—", nunca como zero):
  --   conta com menos de 14 dias de cadastro | fazenda sem animal vivo |
  --   sem assinatura própria.
  -- Consequência declarada: a fazenda de CONSULTORIA cai no terceiro guard-rail
  -- e sai sempre com health_score NULL. É a leitura honesta da mesma regra —
  -- 15 dos 100 pontos são de cobrança, e não há contrato nenhum ali para
  -- pontuar. A saúde do técnico que a atende é medida em /adm/consultores.
  -- Assimetria conhecida: o guard de 14 dias olha o cadastro do DONO, não o da
  -- propriedade (é o que o adm_01 faz). Uma fazenda NOVA de uma conta ANTIGA já
  -- é pontuada no primeiro dia — e aparece com nota baixa, que é o correto:
  -- ela realmente não tem lançamento nenhum.
  case
    when dono.data_cadastro is null
      or dono.data_cadastro > now() - interval '14 days'                  then null
    when coalesce(vg.animais_ativos, 0) = 0                               then null
    when an.assinatura_id is null                                         then null
    else least(100, greatest(0, round(
           coalesce(saude.componentes, 0)
           + 15 * case
                    when an.origem_acesso = 'cortesia'       then 1.0
                    when an.origem_acesso = 'extensao'       then 0.4
                    when an.acesso_ativo and an.inadimplente then 0.3
                    when an.acesso_ativo                     then 1.0
                    else 0.0
                  end
         )))::int
  end                                                  as health_score

from public.propriedades p

-- O DONO. Reproduz as PERNAS 1 e 2 de adm.propriedades_escopo (adm_01 §4) —
-- prioridade_vinculo = 1 — só que ancoradas na PROPRIEDADE em vez de no usuário,
-- que é o sentido que aquela view não oferece.
--
-- As duas pernas existem porque o vínculo é gravado em DUAS colunas
-- (`propriedades.produtor_id` e `usuarios.propriedade_id`) e elas JÁ divergiram
-- em produção. Resolver só por produtor_id marcaria como "consultoria" uma
-- fazenda que tem produtor de verdade — e a linha ficaria sem para onde navegar.
-- O desempate prefere produtor_id, que é o caminho canônico; `desc nulls last`
-- porque DESC em Postgres é NULLS FIRST por padrão, e sem isso a fazenda de
-- consultoria (comparação sempre NULL) escolheria por acaso.
left join lateral (
  select u.id, u.nome, u.data_cadastro
    from public.usuarios u
   where u.id = p.produtor_id
      or (u.propriedade_id = p.id and u.regra_de_acesso = 'produtor')
   order by (u.id = p.produtor_id) desc nulls last, u.id
   limit 1
) dono on true

-- Assinatura PRÓPRIA do dono. Uma linha por dono garantida pelo DISTINCT ON da
-- view (assinaturas NÃO tem UNIQUE por usuario_id — ver adm_01 §5). Sem dono, o
-- predicado vira `= null`, não casa nada, e as três colunas saem NULL/false.
left join adm.assinatura_normalizada an on an.usuario_id = dono.id

left join adm.atividade_propriedade t   on t.propriedade_id = p.id

-- CUSTO ASSUMIDO: propriedade_visao_geral avisa "filtrar SEMPRE por
-- propriedade_id", e aqui ela roda sem filtro — os quatro jsonb dela
-- (por_categoria, por_raca, pirâmide, produção 90d) são calculados para as 31
-- propriedades e descartados; usamos só quatro escalares. Na escala declarada no
-- desenho ("dezenas, não milhares") isso é uma lista que abre em segundos, e a
-- alternativa — recalcular animais/lactantes aqui — é exatamente o defeito que
-- este arquivo existe para não cometer. Se um dia doer, o caminho é o mesmo do
-- adm_02 §2: materializar em `adm_cache`, nunca duplicar a conta.
left join adm.propriedade_visao_geral vg on vg.propriedade_id = p.id

-- Os QUATRO componentes de atividade do health score, para ESTA propriedade.
-- É o corpo do `percentile_cont(...)` de adm.usuarios_lista, caractere a
-- caractere, sem a mediana (ver a nota do health_score acima). `left join
-- lateral ... on true` e não `cross join`: um lateral sem FROM sempre devolve
-- uma linha, mas o LEFT é a garantia escrita de que nada aqui pode APAGAR uma
-- propriedade da lista.
-- O `::double precision` no fim não é decoração: é o mesmo cast do adm_01, e é
-- ele que faz o round() final arredondar pelo mesmo caminho nos dois lugares.
left join lateral (
  select (
      35 * greatest(0, least(1,
            (30 - coalesce(
                    extract(epoch from (now() - t.ultimo_lancamento_em)) / 86400,
                    999)) / 28.0))
    + 25 * least(1, coalesce(t.dias_distintos_30d, 0) / 12.0)
    + 15 * least(1, coalesce(t.modulos_90d, 0) / 4.0)
    + 10 * least(1, coalesce(coalesce(t.animais_com_evento_90d, 0)::numeric
                     / nullif(vg.animais_ativos, 0), 0) / 0.60)
  )::double precision as componentes
) saude on true;

comment on view adm.propriedades_lista is
  'Diretorio de propriedades do /adm (Fase 3). Uma linha por FAZENDA -- o tenant real '
  'do banco. produtor_id/produtor_nome NULL = propriedade de consultoria, nao dado '
  'faltando. Nao recalcula nada: rebanho e equipe vem de adm.propriedade_visao_geral, '
  'recencia de adm.atividade_propriedade, plano de adm.assinatura_normalizada e o '
  'health_score e a mesma expressao de adm.usuarios_lista.';

revoke all on adm.propriedades_lista from public;
revoke all on adm.propriedades_lista from anon, authenticated;
grant select on adm.propriedades_lista to service_role;


-- ═════════════════════════════════════════════════════════════════════════════
-- CONFERÊNCIA RÁPIDA (não roda sozinha — cole no SQL Editor depois do create).
-- O assert de existência, grant e âncora está no BLOCO 6 do adm_05.
--
--   -- 1. Uma linha por propriedade, sem duplicata e sem sumiço:
--   select (select count(*) from public.propriedades)      as propriedades,
--          (select count(*) from adm.propriedades_lista)   as linhas,
--          (select count(distinct id) from adm.propriedades_lista) as ids;
--
--   -- 2. As fazendas de consultoria APARECEM (o motivo da view existir):
--   select id, nome, cidade, estado, animais_ativos, tecnicos_vinculados
--     from adm.propriedades_lista where produtor_id is null order by id;
--
--   -- 3. O health score BATE com a lista de usuarios nas contas de 1 fazenda:
--   select pl.id, pl.nome, pl.health_score as na_propriedade,
--          ul.health_score as no_usuario
--     from adm.propriedades_lista pl
--     join adm.usuarios_lista ul on ul.id = pl.produtor_id
--    where ul.total_propriedades = 1
--      and pl.health_score is distinct from ul.health_score;
--   -- Espera-se ZERO linha. Uma linha aqui = as duas expressoes divergiram.
-- ═════════════════════════════════════════════════════════════════════════════
