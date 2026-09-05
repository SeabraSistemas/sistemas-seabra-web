-- ═════════════════════════════════════════════════════════════════════════════
-- adm_09_carteira_fase3.sql — as QUATRO views da Fase 3
--
-- Implementa, uma a uma, as interfaces declaradas em VIEWS_FASE_3
-- (src/lib/adm/areas/contrato.ts):
--
--   adm.coorte_retencao        ->  LinhaCoorte
--   adm.benchmark_propriedade  ->  LinhaBenchmarkPropriedade
--   adm.benchmark_referencia   ->  LinhaBenchmarkReferencia
--   adm.cobrancas_lista        ->  LinhaCobranca
--
-- O CONTRATO MANDA, ESTE ARQUIVO OBEDECE — mesma regra do adm_07. O nome da view
-- e o de CADA coluna estao declarados em VIEWS_FASE_3 e nas interfaces Linha*;
-- aqui nada e batizado de novo. Coluna que o schema real nao permite calcular e
-- projetada como NULL COM COMENTARIO, nunca omitida: foi a omissao silenciosa
-- que na Fase 1 deixou quatro abas abrindo vazias sem dar um erro sequer.
--
-- ORDEM DE EXECUCAO: rodar DEPOIS de adm_01 (assinatura_normalizada,
-- propriedade_visao_geral), adm_02 (atividade_propriedade) e adm_07 (as cinco
-- views de area que o benchmark reusa). O adm_05 roda por ultimo e assere que as
-- quatro views daqui existem, tem ancora e tem grant.
-- Idempotente: `drop view if exists` antes de cada `create`.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- O QUE MUDA NESTA FASE, e por que ela precisou de decisoes novas
--
-- As views da Fase 2 respondem sobre UMA propriedade. As quatro daqui respondem
-- sobre A CARTEIRA — e isso troca dois pressupostos:
--
--   1. Nenhuma delas e filtravel por propriedade_id sem custo. Elas varrem a
--      base inteira por desenho (31 propriedades e ~45 contas hoje; o desenho
--      declara "dezenas, nao milhares"). Se a base crescer uma ordem de
--      grandeza, o caminho e materializar em adm_cache, nao espremer aqui.
--
--   2. O tempo deixa de ser "ultimos 12 meses" e passa a ser HISTORIA. Coorte e
--      inadimplencia falam do passado inteiro, e o passado do banco tem buracos
--      declarados (dias_acesso NULL no legado, assinatura que so guarda o ultimo
--      vencimento). Cada buraco vira um comentario aqui, nao um numero bonito.
-- ═════════════════════════════════════════════════════════════════════════════

-- benchmark_referencia LE benchmark_propriedade (a regua e o valor do cliente
-- saem da MESMA expressao — ver a nota da secao 3), entao a dependente cai
-- primeiro. Sem esta ordem o `drop` da segunda pediria `cascade`.
drop view if exists adm.benchmark_referencia;
drop view if exists adm.benchmark_propriedade;
drop view if exists adm.coorte_retencao;
drop view if exists adm.cobrancas_lista;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.coorte_retencao  ->  interface LinhaCoorte
--
-- A matriz triangular classica: uma linha por (mes de entrada, mes de vida).
-- coorte = 'YYYY-MM' do cadastro; mes 0 = o mes do cadastro.
--
-- ═══ O MODELO DE COBERTURA, que e a decisao inteira desta view ═══
--
-- "Ativo no mes M" NAO pode ser `assinaturas.data_vencimento > <data do mes>`.
-- Essa linha guarda so o ULTIMO vencimento: quem venceu em marco, ficou dois
-- meses fora e voltou a pagar em junho tem data_vencimento em julho — e o teste
-- ingenuo o daria como ativo em abril e maio tambem. O churn simplesmente
-- desapareceria da matriz, que e o unico numero que ela existe para mostrar.
--
-- Entao a conta e feita por COBERTURA: a uniao dos intervalos de acesso.
--
--   (a) UMA COBRANCA PAGA cobre [data_pagamento, data_pagamento + dias_acesso).
--       `pagamentos.dias_acesso` e a coluna de intencao criada em
--       2026_08_01_proracao_upgrade.sql: "dias concedidos por ESTA cobranca
--       (30/365); NULL = legado, usa assinaturas.ciclo" — e o fallback aqui e
--       exatamente esse, 365 no anual e 30 no resto. Cada pagamento e um bloco
--       de acesso: dois pagamentos separados por tres meses deixam um BURACO de
--       tres meses, que e o churn aparecendo.
--
--   (b) A LINHA DA ASSINATURA cobre so as PONTAS: de data_inicio ate a primeira
--       cobranca paga, e do fim da ultima cobranca paga ate data_vencimento.
--       Nunca o miolo — o miolo e onde mora o churn, e e la que o vencimento
--       unico mentiria. A ponta ANTERIOR e o que faz o trial existir na matriz
--       (trial nao gera pagamento nenhum: o trigger create_auto_trial_for_produtor
--       so grava data_inicio/data_vencimento). A ponta POSTERIOR e o acesso
--       concedido SEM pagamento — cortesia (vencimento em 2099) e extensao
--       manual: ele vale a partir do fim da ultima cobranca, que e o unico
--       comeco que o banco permite inferir.
--
-- ═══ QUEM E "UMA CONTA" ═══
--
-- Fora: colaborador (e funcionario do produtor, nao cliente — a mesma exclusao
-- da serie 'novos_clientes' em adm_06), is_demo, is_tester, e o ADMINISTRADOR,
-- que nao assina nada e entraria como um zero permanente puxando para baixo a
-- coorte do mes em que a conta dele foi criada.
--
-- Dentro, e este e o ponto nao obvio: o PRODUTOR FILIADO A UMA ASSOCIACAO.
-- Ele costuma nao ter assinatura propria — quem paga e a associacao, com
-- assinaturas.associacao_id preenchido e usuario_id nulo. Procurar acesso so por
-- a.usuario_id = u.id daria churn imediato para toda a base filiada. Por isso a
-- cobertura de uma conta vem da assinatura DELA **ou** da assinatura da
-- associacao a que ela pertence.
--
-- Nao ha DISTINCT ON por dono aqui, ao contrario do MRR: duas assinaturas para o
-- mesmo dono contariam dinheiro duas vezes, mas cobertura e UNIAO — intervalo
-- repetido nao altera o resultado.
--
-- ═══ LEITURA DA MATRIZ ═══
--
-- Um mes conta como ativo se a cobertura tocar QUALQUER dia dele. Ponto-no-tempo
-- (ex.: "coberto no ultimo dia do mes") castigaria quem renova dia 25 por causa
-- do dia do mes em que assinou, que nao e informacao sobre retencao.
-- Consequencias declaradas: o mes corrente e PARCIAL e nao e penalizado por
-- isso; e o mes 0 pode ficar abaixo de 100% quando a conta nunca teve assinatura
-- nenhuma (nem propria nem de associacao) — o que e verdade sobre a conta, e nao
-- defeito da view.
-- ─────────────────────────────────────────────────────────────────────────────

-- ---------------------------------------------------------------------------
-- O fim do acesso de uma assinatura, na MESMA definicao de
-- public.view_status_assinatura.acesso_ate: o maior entre o vencimento e a
-- extensao manual.
--
-- Existe como FUNCAO para que a coorte e a carteira nunca discordem sobre quem
-- estava ativo em que mes. Duas copias da expressao divergiriam na primeira
-- manutencao, e o sintoma seria uma matriz de retencao contradizendo o card de
-- contas ativas na tela ao lado -- sem erro nenhum, so dois numeros diferentes
-- para a mesma pergunta.
--
-- `periodo_gracia_ate` fica de fora de proposito: a coluna foi DROPADA em
-- 2026-05-12 (ver adm_01:269). Nao existe mais periodo de graca no modelo.
-- ---------------------------------------------------------------------------
create or replace function adm.acesso_ate(p_vencimento timestamptz, p_extensao timestamptz)
returns date
language sql
immutable
as $$
  select greatest(p_vencimento, coalesce(p_extensao, p_vencimento))::date;
$$;

revoke all on function adm.acesso_ate(timestamptz, timestamptz) from public;
revoke all on function adm.acesso_ate(timestamptz, timestamptz) from anon, authenticated;
grant execute on function adm.acesso_ate(timestamptz, timestamptz) to service_role;

create view adm.coorte_retencao as
with contas as (
  -- date_trunc em timestamptz usa o TimeZone da sessao (UTC no Supabase), a
  -- mesma convencao do to_char de adm_06 — as duas telas precisam concordar
  -- sobre a que mes pertence um cadastro da virada.
  select
    u.id                                        as usuario_id,
    u.associacao_id,
    date_trunc('month', u.data_cadastro)::date  as mes_entrada
  from public.usuarios u
  where u.data_cadastro is not null
    -- Cadastro no futuro e digitacao, e criaria uma coorte que ainda nao
    -- aconteceu, com mes negativo na grade.
    and u.data_cadastro <= now()
    and coalesce(u.regra_de_acesso, '') not in ('colaborador', 'administrador')
    and coalesce(u.is_demo, false) = false
    and coalesce(u.is_tester, false) = false
),

acesso as (
  -- As assinaturas que dao acesso a cada conta: a propria e a da associacao.
  -- O OR nao e sargavel; com ~45 contas e ~31 assinaturas isso e irrelevante, e
  -- a alternativa (dois UNION ALL) esconderia a regra em duas metades.
  select
    c.usuario_id,
    a.id             as assinatura_id,
    a.data_inicio,
    a.data_vencimento,
    -- SEM ISTO A MATRIZ INVENTA CHURN. `extensao_manual_ate` e fonte de acesso
    -- de primeira classe no resto do painel: adm_01:310-316 deriva
    -- origem_acesso='extensao' dela, e view_status_assinatura.acesso_ate e
    -- GREATEST(data_vencimento, extensao_manual_ate). Toda conta que o Felipe
    -- mantem a mao apareceria como churn -- justamente o "despencar falso" que
    -- esta view existe para nao desenhar, e ha um balde inteiro dessas contas
    -- em /adm/carteira/risco.
    a.extensao_manual_ate,
    a.ciclo
  from contas c
  join public.assinaturas a
    on a.usuario_id = c.usuario_id
    or (c.associacao_id is not null and a.associacao_id = c.associacao_id)
),

pago as (
  -- (a) Um bloco de acesso por cobranca PAGA. STATUS PAGO = a constante
  -- STATUS_PAGOS de _shared/asaas.ts, a mesma de adm_01 e adm_06 — tres lugares
  -- com a mesma lista e nenhum com uma lista propria.
  select
    ac.usuario_id,
    ac.assinatura_id,
    pa.data_pagamento::date as ini,
    (pa.data_pagamento
       + make_interval(days => coalesce(
           pa.dias_acesso,
           case when ac.ciclo = 'anual' then 365 else 30 end)))::date as fim
  from acesso ac
  join public.pagamentos pa on pa.assinatura_id = ac.assinatura_id
  where pa.status in ('CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH')
    and pa.data_pagamento is not null
),

extremos as (
  -- Onde a cobertura paga comeca e termina, por assinatura. E o que define as
  -- duas pontas da alinea (b) — e o que garante que a linha da assinatura nunca
  -- preencha o miolo.
  select assinatura_id, min(ini) as primeiro_ini, max(fim) as ultimo_fim
  from pago
  group by 1
),

intervalos as (
  select usuario_id, ini, fim from pago

  union all

  -- (b1) PONTA ANTERIOR: do inicio da assinatura ate a primeira cobranca paga.
  -- Sem cobranca nenhuma, vai ate o vencimento — e isso cobre os dois casos que
  -- so existem aqui: o trial (que nunca gera pagamento) e a cortesia (vencimento
  -- em 2099, acesso real e permanente).
  select
    ac.usuario_id,
    ac.data_inicio::date,
    least(adm.acesso_ate(ac.data_vencimento, ac.extensao_manual_ate),
          coalesce(ex.primeiro_ini, adm.acesso_ate(ac.data_vencimento, ac.extensao_manual_ate)))
  from acesso ac
  left join extremos ex on ex.assinatura_id = ac.assinatura_id

  union all

  -- (b2) PONTA POSTERIOR: quando o vencimento vigente vai ALEM da ultima
  -- cobranca paga, a diferenca e acesso concedido sem pagamento (extensao
  -- manual do admin, ajuste, cortesia tardia). Comeca no fim da ultima
  -- cobertura paga porque e o unico comeco que o banco registra — e, por
  -- comecar la, ela so estende para a frente: nunca tapa um buraco anterior.
  select
    ac.usuario_id,
    ex.ultimo_fim,
    adm.acesso_ate(ac.data_vencimento, ac.extensao_manual_ate)
  from acesso ac
  join extremos ex on ex.assinatura_id = ac.assinatura_id
  where adm.acesso_ate(ac.data_vencimento, ac.extensao_manual_ate) > ex.ultimo_fim
),

coortes as (
  select mes_entrada, count(*)::int as tamanho
  from contas
  group by 1
),

grade as (
  -- A matriz TRIANGULAR: cada coorte vai do mes 0 ate o mes corrente. Coorte de
  -- agosto nao tem linha de setembro — o futuro em branco e diferente de zero
  -- retencao, e uma matriz retangular com nulos convidaria a leitura errada.
  select
    co.mes_entrada,
    co.tamanho,
    g.mes,
    (co.mes_entrada + make_interval(months => g.mes))::date     as ini_mes,
    (co.mes_entrada + make_interval(months => g.mes + 1))::date as fim_mes
  from coortes co
  cross join lateral generate_series(
    0,
    ((extract(year  from current_date) - extract(year  from co.mes_entrada)) * 12
     + extract(month from current_date) - extract(month from co.mes_entrada))::int
  ) as g(mes)
),

ativos as (
  -- Sobreposicao de intervalos meio-abertos: [ini, fim) toca [ini_mes, fim_mes)
  -- se ini < fim_mes e fim > ini_mes. `fim > ini` descarta o intervalo vazio que
  -- a ponta anterior produz quando a conta pagou no proprio dia do cadastro.
  select g.mes_entrada, g.mes, count(distinct c.usuario_id)::int as ativos
  from grade g
  join contas c      on c.mes_entrada = g.mes_entrada
  join intervalos i  on i.usuario_id = c.usuario_id
                    and i.fim > i.ini
                    and i.ini < g.fim_mes
                    and i.fim > g.ini_mes
  group by 1, 2
)

select
  to_char(g.mes_entrada, 'YYYY-MM')                        as coorte,
  g.mes,
  g.tamanho,
  coalesce(a.ativos, 0)                                    as ativos,
  -- 0..1; a tela formata como %. tamanho vem de um count agrupado, entao nunca
  -- e zero e a divisao nao precisa de nullif.
  round(coalesce(a.ativos, 0)::numeric / g.tamanho, 4)     as retencao
from grade g
left join ativos a
  on a.mes_entrada = g.mes_entrada
 and a.mes         = g.mes;

comment on view adm.coorte_retencao is
  'Matriz de retencao por coorte de cadastro. "Ativo no mes M" e COBERTURA: uniao dos intervalos '
  '[data_pagamento, +dias_acesso) das cobrancas pagas, mais as PONTAS da linha da assinatura '
  '(trial/cortesia antes da 1a cobranca, extensao depois da ultima) -- nunca o miolo, que e onde '
  'o vencimento unico esconderia o churn. Produtor filiado herda a assinatura da associacao.';

revoke all on adm.coorte_retencao from public;
revoke all on adm.coorte_retencao from anon, authenticated;
grant select on adm.coorte_retencao to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.benchmark_propriedade  ->  interface LinhaBenchmarkPropriedade
--
-- O valor de UMA propriedade em UMA metrica, dentro de UM segmento. Uma linha
-- por (propriedade, segmento, metrica).
--
-- ═══ NADA E RECALCULADO AQUI ═══
--
-- As seis metricas de METRICAS_BENCHMARK saem, uma a uma, das views de area que
-- ja existem (adm_01 e adm_07). Reimplementar qualquer uma criaria um segundo
-- numero para a MESMA pergunta: a aba Financeiro diria custo/litro R$ 2,10 e o
-- benchmark diria R$ 2,17, na mesma tela, sem que nada estivesse "errado". A
-- frase comercial do painel ("seu custo por litro e R$ 2,10; a mediana da
-- carteira e R$ 1,70") so se sustenta se o primeiro numero for literalmente o
-- da aba.
--
--   producao_por_lactante_dia  <-  propriedade_visao_geral.media_por_lactante_dia
--   custo_litro                <-  propriedade_financeiro.custo_litro
--   taxa_prenhez               <-  propriedade_reproducao.taxa_prenhez
--   gmd_medio                  <-  propriedade_crescimento.gmd_medio
--   taxa_mortalidade           <-  propriedade_sanidade.taxa_mortalidade
--   intervalo_partos_dias      <-  propriedade_reproducao.intervalo_partos_dias
--
-- Consequencia herdada, de proposito: cada metrica traz a JANELA da sua aba
-- (producao 30d, prenhez e mortalidade 12m, IPP 24m, custo o snapshot mais
-- recente). Uniformizar janelas aqui seria justamente recalcular.
-- CONCILIADO em 05/09/2026: a explicacao do contrato dizia "90 dias" e a janela
-- publicada em benchmark.ts dizia 90 e 12 meses; as views calculam 30 dias
-- (adm_01:723) e 24 meses (adm_07:203). Os dois lados foram corrigidos para a
-- janela REAL. Numa tela que vira ligacao para o cliente, o numero certo com o
-- periodo errado escrito ao lado e o pior defeito possivel.
--
-- As duas taxas viajam como FRACAO 0..1, exatamente como saem das abas; a tela
-- ja formata as duas como %. Converter para 0..100 aqui faria o benchmark
-- discordar da aba no primeiro grafico que reusasse as duas fontes.
--
-- ═══ SEMPRE POR SEGMENTO ═══
--
-- propriedades.segmentos e text[] ('caprino_leiteiro' | 'caprino_corte' |
-- 'ovino_leiteiro' | 'ovino_corte'), entao o unnest. Comparar caprino leiteiro
-- com ovino de corte nao e benchmark, e ruido — e o numero resultante daria uma
-- conversa comercial errada com os DOIS criadores.
--
-- A propriedade multi-segmento entra nos dois grupos com o mesmo valor: ela
-- concorre nos dois mercados, e tirar dela um dos lados seria escolher por ela.
--
-- LIMITACAO DECLARADA: propriedade SEM segmento cadastrado nao aparece — nem
-- como valor, nem na regua. A tela mostra estado vazio e diz por que. A
-- alternativa (um balde 'todos') e exatamente a comparacao sem sentido que o
-- "sempre por segmento" existe para impedir.
--
-- Conta demo/tester fica fora dos DOIS lados: uma fazenda de demonstracao no
-- meio da amostra move a mediana da carteira real.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.benchmark_propriedade as
select
  b.propriedade_id,
  b.segmento,
  met.metrica,
  met.valor
from (
  select
    p.id                as propriedade_id,
    btrim(s.segmento)   as segmento
  from public.propriedades p
  -- produtor_id NULL e a propriedade de CONSULTORIA (cliente do tecnico que nao
  -- usa o app). Ela e uma fazenda real e continua na amostra — dai o LEFT join.
  left join public.usuarios dono on dono.id = p.produtor_id
  cross join lateral unnest(coalesce(p.segmentos, array[]::text[])) as s(segmento)
  where coalesce(dono.is_demo, false) = false
    and coalesce(dono.is_tester, false) = false
    and nullif(btrim(s.segmento), '') is not null
) b
-- INNER join nas cinco: todas sao `propriedades p cross join lateral (...)`, o
-- que garante uma linha por propriedade sempre — inclusive quando a propriedade
-- nao tem dado nenhum, caso em que as colunas vem NULL. Nenhuma propriedade se
-- perde por causa destes joins.
join adm.propriedade_visao_geral  vg on vg.propriedade_id = b.propriedade_id
join adm.propriedade_reproducao   rp on rp.propriedade_id = b.propriedade_id
join adm.propriedade_crescimento  cr on cr.propriedade_id = b.propriedade_id
join adm.propriedade_sanidade     sn on sn.propriedade_id = b.propriedade_id
join adm.propriedade_financeiro   fi on fi.propriedade_id = b.propriedade_id

cross join lateral (
  -- As SEIS de METRICAS_BENCHMARK, escritas LITERALMENTE e na ordem do contrato,
  -- para serem lidas lado a lado com ele sem nenhuma interpretacao no meio.
  -- Acrescentar uma setima aqui sem acrescentar la produz uma metrica que a tela
  -- nao sabe rotular; o assert 30 do adm_05 quebra nesse caso.
  -- ::numeric em todas: a lista precisa de um tipo so, e intervalo_partos_dias e
  -- int enquanto as outras cinco sao numeric.
  select v.metrica, v.valor
  from (values
    ('producao_por_lactante_dia'::text, vg.media_por_lactante_dia::numeric),
    ('custo_litro',                     fi.custo_litro::numeric),
    ('taxa_prenhez',                    rp.taxa_prenhez::numeric),
    ('gmd_medio',                       cr.gmd_medio::numeric),
    ('taxa_mortalidade',                sn.taxa_mortalidade::numeric),
    ('intervalo_partos_dias',           rp.intervalo_partos_dias::numeric)
  ) as v(metrica, valor)
) met;

comment on view adm.benchmark_propriedade is
  'O valor de UMA propriedade nas 6 metricas de METRICAS_BENCHMARK, por segmento. '
  'Cada valor e LIDO da view de area correspondente (nunca recalculado), com a janela dela. '
  'Taxas como fracao 0..1. Propriedade sem segmentos cadastrados nao aparece.';

revoke all on adm.benchmark_propriedade from public;
revoke all on adm.benchmark_propriedade from anon, authenticated;
grant select on adm.benchmark_propriedade to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. adm.benchmark_referencia  ->  interface LinhaBenchmarkReferencia
--
-- A REGUA: uma linha por (segmento, metrica), com n, p25, mediana e p75.
--
-- LE adm.benchmark_propriedade de proposito. As duas metades da frase comercial
-- — "o seu" e "a mediana da carteira" — precisam sair da MESMA expressao, senao
-- um dia divergem por uma correcao aplicada num lado so, e o painel afirma um
-- desvio que nao existe.
--
-- QUARTIS com percentile_cont (interpolado), ignorando NULL. Propriedade sem o
-- dado NAO e propriedade com valor zero: contar o ausente como zero puxaria a
-- mediana de custo por litro para baixo e faria todo cliente que preenche o
-- modulo parecer caro. Por isso o `where valor is not null`, e por isso `n` e a
-- contagem de propriedades que TEM o dado naquela metrica e segmento.
--
-- ⚠️ TIPO: percentile_cont devolve DOUBLE PRECISION, e `round(double precision,
-- int)` NAO EXISTE no Postgres — e o mesmo 42883 que na Fase 2 abortou a 2a de 8
-- views e levou as seis seguintes junto (adm_07, escore_corporal). O `order by`
-- diz `::double precision` para a escolha do agregado ficar explicita, e o
-- resultado volta para ::numeric ANTES do round.
--
-- A view NAO esconde a linha com n baixo. MINIMO_BENCHMARK (7) e decisao de
-- TELA: escondendo aqui, a tela receberia zero linha e nao teria como distinguir
-- "poucos criadores neste segmento" de "a view nao rodou" — e essa e exatamente
-- a confusao que o painel ja pagou caro uma vez.
--
-- A grade e COMPLETA (todo segmento x todas as seis metricas), com n = 0 e
-- quartis nulos onde ninguem tem o dado: uma linha presente dizendo "0 de base"
-- e uma resposta; a ausencia de linha e um silencio que a tela nao sabe ler.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.benchmark_referencia as
with metricas(metrica) as (
  -- Espelho de METRICAS_BENCHMARK, na mesma ordem do contrato.
  values ('producao_por_lactante_dia'::text),
         ('custo_litro'),
         ('taxa_prenhez'),
         ('gmd_medio'),
         ('taxa_mortalidade'),
         ('intervalo_partos_dias')
),
segmentos as (
  -- Direto de public.propriedades, e nao de adm.benchmark_propriedade: aquela
  -- view arrasta as cinco views de area, e usa-la so para listar segmentos as
  -- faria rodar duas vezes por consulta.
  -- O MESMO recorte da secao 2 (demo/tester fora), palavra por palavra: com um
  -- recorte diferente aqui, um segmento que so existe numa conta de demonstracao
  -- ganharia uma linha de regua eternamente vazia na tela.
  select distinct btrim(s.segmento) as segmento
  from public.propriedades p
  left join public.usuarios dono on dono.id = p.produtor_id
  cross join lateral unnest(coalesce(p.segmentos, array[]::text[])) as s(segmento)
  where coalesce(dono.is_demo, false) = false
    and coalesce(dono.is_tester, false) = false
    and nullif(btrim(s.segmento), '') is not null
),
grade as (
  select sg.segmento, m.metrica
  from segmentos sg
  cross join metricas m
),
agrupado as (
  select
    b.segmento,
    b.metrica,
    -- n = PROPRIEDADES com o dado, que e o que o contrato define. count(*) diz
    -- isso porque adm.benchmark_propriedade emite exatamente UMA linha por
    -- (propriedade, segmento, metrica) -- invariante do lateral de seis valores
    -- da secao 2. Se aquela cardinalidade mudar, esta contagem muda de
    -- significado, e e por isso que a invariante esta escrita aqui e la.
    count(*)::int                                                                as n,
    -- Os parenteses em volta do agregado nao sao decoracao: sem eles o `::numeric`
    -- fica visualmente colado no `order by` e a leitura do trecho vira adivinhacao.
    round((percentile_cont(0.25) within group (order by b.valor::double precision))::numeric, 4) as p25,
    round((percentile_cont(0.50) within group (order by b.valor::double precision))::numeric, 4) as mediana,
    round((percentile_cont(0.75) within group (order by b.valor::double precision))::numeric, 4) as p75
  from adm.benchmark_propriedade b
  where b.valor is not null
  group by 1, 2
)
select
  g.segmento,
  g.metrica,
  coalesce(a.n, 0) as n,
  a.p25,
  a.mediana,
  a.p75
from grade g
left join agrupado a
  on a.segmento = g.segmento
 and a.metrica  = g.metrica;

comment on view adm.benchmark_referencia is
  'A regua da carteira: p25/mediana/p75 por (segmento, metrica), sobre adm.benchmark_propriedade. '
  'NULL nao vira zero -- n conta so quem TEM o dado. A view publica tambem n baixo: '
  'esconder abaixo de MINIMO_BENCHMARK e trabalho da tela, que precisa saber a diferenca '
  'entre "poucos criadores" e "sem resposta".';

revoke all on adm.benchmark_referencia from public;
revoke all on adm.benchmark_referencia from anon, authenticated;
grant select on adm.benchmark_referencia to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. adm.cobrancas_lista  ->  interface LinhaCobranca
--
-- Uma linha por COBRANCA (public.pagamentos), com usuario e plano resolvidos —
-- a materia-prima de /adm/carteira/receita. E um livro-caixa: nenhuma linha e
-- escondida. REFUNDED e DELETED aparecem com o seu status e nunca sao
-- inadimplentes; filtrar aqui faria as somas da tela nao fecharem com o Asaas.
--
-- OS TRES CONJUNTOS DE STATUS, os mesmos de adm_01 e adm_06 (constante
-- STATUS_PAGOS de _shared/asaas.ts):
--   PAGO      CONFIRMED | RECEIVED | RECEIVED_IN_CASH
--   EM ABERTO PENDING | OVERDUE
--   nem um nem outro   REFUNDED | DELETED
--
-- INADIMPLENTE exige a cobranca JA TER VENCIDO: um PENDING com vencimento na
-- semana que vem e uma cobranca normal, nao um caloteiro — marca-lo de vermelho
-- e como o Felipe liga cobrando quem esta em dia.
--
-- ARTEFATOS DE COBRANCA FORA: pix_payload, pix_qr_code_url, boleto_url e
-- invoice_url dao acesso a pagina de pagamento do cliente e nao tem uso
-- administrativo — mesma decisao de adm.pagamentos_conta.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.cobrancas_lista as
select
  pa.id                                            as pagamento_id,

  -- NULL quando a assinatura e de uma ASSOCIACAO (assinatura_owner_check deixa
  -- exatamente um dos dois preenchido). O usuario_id nulo e o discriminante
  -- honesto do caso; o nome logo abaixo diz de quem e a cobranca.
  a.usuario_id,

  -- Assinatura de associacao nao tem usuario, mas tem pagador com nome. O
  -- prefixo deixa impossivel ler 'ABCC' como se fosse uma pessoa chamada ABCC —
  -- mesma pratica dos rotulos '(sem setor)'/'(sem lote)' das views de area.
  coalesce(nullif(btrim(u.nome), ''),
           case when a.associacao_id is not null
                then 'Associação ' || coalesce(nullif(btrim(ac.nome), ''), '#' || a.associacao_id)
           end)                                    as usuario_nome,

  -- O plano da ASSINATURA (plano_id = o plano EFETIVAMENTE PAGO).
  -- pagamentos.plano_id_alvo fica de fora de proposito: ele e o plano contratado
  -- e AINDA NAO PAGO de um upgrade, e exibi-lo como o plano da linha repete o
  -- vazamento 3 da auditoria (mostrar plano superior antes de a cobranca
  -- confirmar). O status da propria linha ja conta que a troca esta pendente.
  pl.nome                                          as plano_nome,

  pa.valor,
  pa.status,
  pa.metodo_pagamento,
  pa.data_vencimento,
  pa.data_pagamento,

  -- status e data_vencimento sao NOT NULL, entao este booleano nunca e nulo --
  -- o contrato pede boolean, nao boolean | null.
  (pa.status = 'OVERDUE'
   or (pa.status = 'PENDING' and pa.data_vencimento < current_date))
                                                   as inadimplente,

  -- Dias corridos desde o vencimento, e NULL fora da inadimplencia. Nao-nulo
  -- exatamente quando `inadimplente` e true: uma cobranca liquidada nao tem
  -- atraso pendente, e uma cobranca futura muito menos. (O atraso na LIQUIDACAO
  -- de uma cobranca ja paga -- "pagou 40 dias depois" -- e outra pergunta, e
  -- pediria outra coluna no contrato.)
  case when pa.status = 'OVERDUE'
         or (pa.status = 'PENDING' and pa.data_vencimento < current_date)
       then (current_date - pa.data_vencimento)
  end                                              as dias_de_atraso

from public.pagamentos pa
-- INNER: assinatura_id e NOT NULL com FK, entao nao ha cobranca orfa por
-- construcao. Se um dia houver, ela some daqui e o total da tela nao bate com o
-- Asaas -- e e isso que se quer notar, em vez de exibir uma linha sem dono.
join public.assinaturas a       on a.id = pa.assinatura_id
join public.planos pl           on pl.id = a.plano_id
left join public.usuarios u     on u.id = a.usuario_id
left join public.associacoes ac on ac.id = a.associacao_id;

comment on view adm.cobrancas_lista is
  'Uma linha por cobranca do Asaas, com usuario e plano resolvidos. PAGO = CONFIRMED/RECEIVED/'
  'RECEIVED_IN_CASH; EM ABERTO = PENDING/OVERDUE. inadimplente exige a cobranca JA vencida. '
  'Cobranca de associacao vem com usuario_id NULL e usuario_nome "Associação <nome>". '
  'Sem pix_payload/boleto_url/invoice_url.';

revoke all on adm.cobrancas_lista from public;
revoke all on adm.cobrancas_lista from anon, authenticated;
grant select on adm.cobrancas_lista to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Fecho
--
-- Repeticao deliberada do fecho do adm_01 e do adm_07: nenhum objeto deste
-- schema pode ser gravavel, e nenhum papel alem de service_role pode le-lo. Os
-- `grant select` individuais acima ja cobrem as quatro views; este bloco existe
-- para o caso de alguem acrescentar uma view aqui e esquecer o par revoke/grant.
-- ─────────────────────────────────────────────────────────────────────────────

revoke all on all tables in schema adm from public;
revoke all on all tables in schema adm from anon, authenticated;
grant select on all tables in schema adm to service_role;

-- Lembrete: view nova em schema ja exposto SO aparece no PostgREST depois de
-- Settings -> API -> Reload schema cache (ou `notify pgrst, 'reload schema'`).
-- Sem isso o /adm recebe PGRST205 para as quatro views desta fase e mostra
-- estado vazio -- indistinguivel de "a carteira nao tem dados".
