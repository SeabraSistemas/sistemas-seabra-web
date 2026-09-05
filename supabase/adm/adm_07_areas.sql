-- ═════════════════════════════════════════════════════════════════════════════
-- adm_07_areas.sql — as OITO views de area da ficha do cliente (Fase 2)
--
-- Implementa, uma a uma, as interfaces declaradas em
-- src/lib/adm/areas/contrato.ts:
--
--   adm.propriedade_reproducao   ->  LinhaReproducao
--   adm.propriedade_sanidade     ->  LinhaSanidade
--   adm.propriedade_crescimento  ->  LinhaCrescimento
--   adm.propriedade_avaliacoes   ->  LinhaAvaliacoes
--   adm.propriedade_financeiro   ->  LinhaFinanceiro
--   adm.propriedade_estrutura    ->  LinhaEstrutura
--   adm.propriedade_equipe       ->  LinhaEquipe
--   adm.criador_vitrine          ->  LinhaVitrine
--
-- O CONTRATO MANDA, ESTE ARQUIVO OBEDECE. Na Fase 1 o SQL e o TypeScript
-- nomearam as mesmas views de formas diferentes: dez consumidas, seis criadas, e
-- so /adm/usuarios abria. O nome da view e de CADA coluna esta declarado em
-- VIEWS_FASE_2 e nas interfaces Linha*; aqui nada e batizado de novo. Quando uma
-- coluna do contrato nao da para calcular com o schema real, ela e projetada
-- como NULL COM COMENTARIO -- nunca omitida, porque a omissao e exatamente o
-- defeito que o contrato existe para impedir.
--
-- Rodar DEPOIS de adm_01 (propriedades_escopo) e adm_02 (atividade_propriedade).
-- adm_05 assere que as dez views da Fase 2 existem e tem grant.
-- Idempotente: `drop view if exists` antes de cada `create`.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- CONVENCAO DE NULO (identica a do contrato -- ela e a razao de existir da view)
--
--   contagem   -> 0 significa "nenhum", NUNCA "nao sei"
--   media/taxa -> null significa "nao da para calcular" (denominador zero)
--
-- 0% de prenhez e um problema do cliente; "—" e ausencia de dado. Mostrar um
-- pelo outro faz o Felipe ligar para cobrar coisa errada.
--
-- SERIE E DISTRIBUICAO SAEM COMO jsonb NA PROPRIA LINHA -- o padrao de
-- adm.propriedade_visao_geral (adm_01, secao 8), nao uma view lateral por
-- grafico. Sempre com `coalesce(..., '[]'::jsonb)`: o TypeScript espera um
-- array, e null ali vira `.map of undefined` na tela.
--
-- FORMATO `propriedades p cross join lateral (...)`: com ele, um
-- `where propriedade_id = $1` restringe `p` primeiro e cada lateral roda para
-- UMA propriedade. Sem esse formato toda abertura de ficha agregaria as 31
-- propriedades da base. Repetir uma subconsulta em dois laterais e deliberado:
-- e o preco de manter o escopo por propriedade.
--
-- ARMADILHAS DO SCHEMA REAL respeitadas aqui (confirmadas na auditoria da Fase 1
-- -- ignorar qualquer uma deixa a tela vazia SEM dar erro):
--   * rebanho.categoria guarda o UUID da categoria -> join com categoria_animal
--   * rebanho.sexo e 'fêmea' COM ACENTO
--   * rebanho.status e 'ativo' MINUSCULO
--   * manejo guarda TAMBEM os descartes (tipo_manejo contem 'descarte')
--   * pesagem.gmd esta gravado em 0,7% das linhas -- o app calcula em Dart
--   * nao existe tabela de PARTO: parto = crias em rebanho (mae_id + nascimento)
--   * a AML tem duas colunas ACENTUADAS entre 32 sem acento
-- ═════════════════════════════════════════════════════════════════════════════

drop view if exists adm.propriedade_reproducao;
drop view if exists adm.propriedade_sanidade;
drop view if exists adm.propriedade_crescimento;
drop view if exists adm.propriedade_avaliacoes;
drop view if exists adm.propriedade_financeiro;
drop view if exists adm.propriedade_estrutura;
drop view if exists adm.propriedade_equipe;
drop view if exists adm.criador_vitrine;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.propriedade_reproducao  ->  interface LinhaReproducao
--
-- NAO EXISTE TABELA DE PARTO. O parto e (a) o INSERT das crias em `rebanho` com
-- mae_id, ou (b) a RPC registrar_parto, que so faz UPDATE na mae. Entao "partos
-- do periodo" e o numero de pares DISTINTOS (mae_id, data_de_nascimento): uma
-- ninhada de tres crias no mesmo dia e UM parto, nao tres. O efeito colateral
-- conhecido: ninhada lancada em dois dias vira dois partos -- por isso o
-- intervalo entre partos joga fora tudo abaixo de 90 dias (ver ipp).
--
-- Cobertura tem QUATRO formas no banco (as mesmas de view_ultima_cobertura):
-- monta controlada, monta livre, inseminacao e transferencia de embriao. Cada
-- uma com o SEU nome de coluna de data -- nenhuma se chama `data_cobertura`.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_reproducao as
select
  p.id                                                       as propriedade_id,

  -- Cobertura = a soma das quatro formas. Fica explicita como coluna propria
  -- porque e o topo do funil e o denominador mental do consultor.
  (rep.inseminacoes_12m + rep.montas_12m + rep.te_12m)::int   as coberturas_12m,
  rep.inseminacoes_12m,
  rep.montas_12m,
  rep.te_12m,
  rep.diagnosticos_12m,
  rep.diagnosticos_positivos_12m,

  -- TAXA DE PRENHEZ como FRACAO 0..1 (a tela formata como %). null so quando NAO
  -- HOUVE diagnostico: com diagnosticos > 0 e positivos = 0 o valor correto e
  -- 0.0000 -- e um problema do cliente, nao ausencia de dado.
  case when rep.diagnosticos_12m > 0
       then round(rep.diagnosticos_positivos_12m::numeric / rep.diagnosticos_12m, 4)
  end                                                        as taxa_prenhez,

  par.partos_12m,
  rep.abortos_12m,
  mat.idade_primeiro_parto_dias,
  mat.prolificidade_media,
  ipp.intervalo_partos_dias,
  reb.femeas_ativas,
  reb.gestantes,
  ser.serie_mensal,
  fun.funil

from public.propriedades p

cross join lateral (
  -- Um lateral com subconsultas escalares, e nao seis joins: cada contagem tem
  -- a sua tabela e a sua coluna de data, e um join agregado exigiria um
  -- distinct que esconderia erro de cardinalidade.
  select
    (select count(*) from public.inseminacao i
      where i.propriedade_id = p.id
        and i.data_inseminacao >= current_date - interval '12 months')::int
                                                             as inseminacoes_12m,

    -- Monta controlada (data_da_cobertura) + monta livre (data_entrada_reprodutor).
    -- Somadas numa coluna so porque o card da tela diz "montas": o consultor
    -- separa controlada de livre na tabela de baixo, nao no card.
    ((select count(*) from public.monta_controlada mc
       where mc.propriedade_id = p.id
         and mc.data_da_cobertura >= current_date - interval '12 months')
     + (select count(*) from public.monta_livre ml
         where ml.propriedade_id = p.id
           and ml.data_entrada_reprodutor >= current_date - interval '12 months'))::int
                                                             as montas_12m,

    (select count(*) from public.transferencia_embriao te
      where te.propriedade_id = p.id
        and te.data_transferencia >= current_date - interval '12 months')::int
                                                             as te_12m,

    (select count(*) from public.diagnostico_gestacao dg
      where dg.propriedade_id = p.id
        and dg.data_diagnostico >= current_date - interval '12 months')::int
                                                             as diagnosticos_12m,

    -- lower(btrim(...)) porque `diagnostico` e text livre gravado pelo app
    -- ('gestante' | 'vazia' | 'suspeita'), sem CHECK que garanta a caixa.
    (select count(*) from public.diagnostico_gestacao dg
      where dg.propriedade_id = p.id
        and dg.data_diagnostico >= current_date - interval '12 months'
        and lower(btrim(dg.diagnostico)) = 'gestante')::int
                                                             as diagnosticos_positivos_12m,

    (select count(*) from public.aborto ab
      where ab.propriedade_id = p.id
        and ab.data_aborto >= current_date - interval '12 months')::int
                                                             as abortos_12m
) rep

cross join lateral (
  -- PARTOS: pares distintos (mae, dia). Ver a nota do cabecalho da view.
  select count(*)::int as partos_12m
    from (select distinct r.mae_id, r.data_de_nascimento
            from public.rebanho r
           where r.propriedade_id = p.id
             and r.mae_id is not null
             and r.data_de_nascimento is not null
             and r.data_de_nascimento >= current_date - interval '12 months') x
) par

cross join lateral (
  -- IPP e prolificidade sao TRACOS DE VIDA do animal, mantidos por trigger
  -- (atualizar_maternidade, prolificidade_01_coluna_e_triggers). Nao se
  -- recalculam aqui: reimplementar so criaria um segundo numero para o Felipe
  -- conferir contra o do app. Sem recorte de 12 meses, e de proposito -- a mediana
  -- de um rebanho pequeno com janela curta oscila sem significar nada.
  select
    round(avg(r.idade_ao_primeiro_parto)
          filter (where r.idade_ao_primeiro_parto > 0))::int    as idade_primeiro_parto_dias,
    round(avg(r.prolificidade)
          filter (where r.prolificidade > 0), 2)                as prolificidade_media
    from public.rebanho r
   where r.propriedade_id = p.id
) mat

cross join lateral (
  -- INTERVALO ENTRE PARTOS: diferenca entre partos consecutivos da MESMA mae.
  -- Janela de 24 meses porque um intervalo exige DOIS partos e o caprino leiteiro
  -- tem intervalo tipico de 8 a 12 meses -- 12 meses de janela raramente contem
  -- dois. O filtro `between 90 and 730` joga fora (a) a mesma ninhada lancada em
  -- dias diferentes, que e biologicamente impossivel como dois partos, e (b) o
  -- intervalo de anos que so aparece quando faltou lancamento no meio.
  select round(avg(k.dias))::int as intervalo_partos_dias
    from (
      select (d.data_parto
              - lag(d.data_parto) over (partition by d.mae_id order by d.data_parto)) as dias
        from (select distinct r.mae_id, r.data_de_nascimento as data_parto
                from public.rebanho r
               where r.propriedade_id = p.id
                 and r.mae_id is not null
                 and r.data_de_nascimento is not null
                 and r.data_de_nascimento >= current_date - interval '24 months') d
    ) k
   where k.dias between 90 and 730
) ipp

cross join lateral (
  -- 'fêmea' COM ACENTO: o banco grava {'fêmea':7304,'macho':4317,null:328}.
  -- 'femea' sem acento casa zero linhas e some com metade do rebanho na tela.
  select
    (count(*) filter (where r.sexo = 'fêmea'))::int                as femeas_ativas,
    (count(*) filter (where coalesce(r.gestacao_ativa, false)))::int as gestantes
    from public.rebanho r
   where r.propriedade_id = p.id
     and r.status = 'ativo'
     and r.data_venda is null
) reb

cross join lateral (
  -- SERIE MENSAL com DUAS curvas na mesma coluna jsonb, cada ponto carregando a
  -- que serie pertence (PontoSerieNomeada). Duas colunas jsonb que sempre andam
  -- juntas seriam duas coisas para o consumidor manter em sincronia.
  -- O mes SEM evento fica ausente em vez de virar zero: a lacuna e informacao.
  select coalesce(jsonb_agg(jsonb_build_object(
             'serie',   s.serie,
             'periodo', s.periodo,
             'valor',   s.valor) order by s.serie, s.periodo), '[]'::jsonb) as serie_mensal
    from (
      select 'coberturas'::text                 as serie,
             to_char(c.dt, 'YYYY-MM')           as periodo,
             count(*)::int                      as valor
        from (
          select i.data_inseminacao as dt from public.inseminacao i
           where i.propriedade_id = p.id
             and i.data_inseminacao >= current_date - interval '12 months'
          union all
          select mc.data_da_cobertura from public.monta_controlada mc
           where mc.propriedade_id = p.id
             and mc.data_da_cobertura >= current_date - interval '12 months'
          union all
          select ml.data_entrada_reprodutor from public.monta_livre ml
           where ml.propriedade_id = p.id
             and ml.data_entrada_reprodutor >= current_date - interval '12 months'
          union all
          select te.data_transferencia from public.transferencia_embriao te
           where te.propriedade_id = p.id
             and te.data_transferencia >= current_date - interval '12 months'
        ) c
       group by 2

      union all

      select 'partos'::text,
             to_char(t.data_parto, 'YYYY-MM'),
             count(*)::int
        from (select distinct r.mae_id, r.data_de_nascimento as data_parto
                from public.rebanho r
               where r.propriedade_id = p.id
                 and r.mae_id is not null
                 and r.data_de_nascimento is not null
                 and r.data_de_nascimento >= current_date - interval '12 months') t
       group by 2
    ) s
) ser

cross join lateral (
  -- FUNIL cobertura -> DG -> positivo -> parto. Os quatro rotulos sao os do
  -- contrato, e a ordem e a do funil (nao a do volume): um funil ordenado por
  -- contagem deixa de ser funil. Reusa o que os laterais acima ja contaram.
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', f.rotulo, 'valor', f.valor)
                            order by f.ordem), '[]'::jsonb) as funil
    from (values
      (1, 'Coberturas',   (rep.inseminacoes_12m + rep.montas_12m + rep.te_12m)),
      (2, 'Diagnósticos', rep.diagnosticos_12m),
      (3, 'Positivos',    rep.diagnosticos_positivos_12m),
      (4, 'Partos',       par.partos_12m)
    ) as f(ordem, rotulo, valor)
) fun;

comment on view adm.propriedade_reproducao is
  'Aba Reproducao, uma linha por propriedade. Parto = par distinto (mae_id, data_de_nascimento): '
  'nao existe tabela de parto. Filtrar SEMPRE por propriedade_id.';

revoke all on adm.propriedade_reproducao from public;
revoke all on adm.propriedade_reproducao from anon, authenticated;
grant select on adm.propriedade_reproducao to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.propriedade_sanidade  ->  interface LinhaSanidade
--
-- `manejo` GUARDA TAMBEM OS DESCARTES -- nao existe tabela `descarte`. Descarte
-- e uma linha de manejo cujo tipo_manejo (enum ARRAY) contem 'descarte', e o
-- trigger poe rebanho.status = 'inativo'. Contar manejo sem filtrar mistura
-- baixa de animal com manejo sanitario e infla o card em ate um terco nos
-- criadores que descartam muito.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_sanidade as
select
  p.id                                                       as propriedade_id,
  san.casos_12m,
  san.animais_tratados_12m,
  san.obitos_12m,

  -- TAXA DE MORTALIDADE = obitos / rebanho do periodo. O denominador exato
  -- exigiria o efetivo dia a dia, que o banco nao guarda; a aproximacao honesta
  -- e "o que esta vivo hoje + o que morreu no periodo". Fica documentada aqui
  -- porque um numero de mortalidade e argumento de consultoria: se um dia
  -- existir efetivo historico, e ESTA linha que muda.
  -- Fracao 0..1; null so quando nao ha rebanho NEM obito (denominador zero).
  case when (san.vivos + san.obitos_12m) > 0
       then round(san.obitos_12m::numeric / (san.vivos + san.obitos_12m), 4)
  end                                                        as taxa_mortalidade,

  fam.famacha_medio,
  fam.escore_corporal_medio,
  san.manejos_12m,
  san.sessoes_coletivas_12m,
  obm.obitos_mensais,
  dfa.distribuicao_famacha,
  sus.principais_suspeitas

from public.propriedades p

cross join lateral (
  select
    (select count(*) from public.clinica cl
      where cl.propriedade_id = p.id
        and cl.data_do_caso >= current_date - interval '12 months')::int
                                                             as casos_12m,

    (select count(distinct cl.animal_id) from public.clinica cl
      where cl.propriedade_id = p.id
        and cl.data_do_caso >= current_date - interval '12 months')::int
                                                             as animais_tratados_12m,

    (select count(*) from public.obito ob
      where ob.propriedade_id = p.id
        and ob.data_obito >= current_date - interval '12 months')::int
                                                             as obitos_12m,

    -- Denominador da mortalidade. 'ativo' MINUSCULO: a variante 'Ativo' nao casa
    -- nada e ja matou dois indices em producao.
    (select count(*) from public.rebanho r
      where r.propriedade_id = p.id
        and r.status = 'ativo'
        and r.data_venda is null)::int                       as vivos,

    -- MANEJO SEM DESCARTE. O coalesce cobre tipo_manejo NULL: manejo sem tipo
    -- ainda e manejo, e `not (x = any(null))` seria NULL e sumiria da contagem.
    (select count(*) from public.manejo m
      where m.propriedade_id = p.id
        and m.data_manejo >= current_date - interval '12 months'
        and coalesce(not ('descarte' = any(m.tipo_manejo)), true))::int
                                                             as manejos_12m,

    (select count(*) from public.manejo_coletivo_sessao s
      where s.propriedade_id = p.id
        and s.data_sessao >= current_date - interval '12 months')::int
                                                             as sessoes_coletivas_12m
) san

cross join lateral (
  -- Um unico scan de `manejo` para as duas medias e para o denominador da
  -- distribuicao. FAMACHA e 1..5 (anemia por verminose); qualquer valor fora
  -- disso e digitacao e nao entra na media.
  -- Aqui NAO se filtra descarte: uma linha de descarte que trouxe FAMACHA
  -- trouxe uma medicao real do animal, e a media e sobre medicoes.
  select
    round(avg(m.famacha) filter (where m.famacha between 1 and 5), 2)     as famacha_medio,
    -- ::numeric obrigatorio. `manejo.escore_corporal` e REAL (a RPC
    -- 20260601_rpc_registrar_manejo.sql:22 declara `p_escore_corporal real` ao
    -- lado de `p_peso numeric`, na mesma assinatura), e avg(real) devolve double
    -- precision -- para o qual round(x, 2) simplesmente NAO EXISTE no Postgres.
    -- Sem o cast, esta view aborta com 42883 e leva junto as seis seguintes do
    -- arquivo. O DTO Dart nao serve para decidir isto: ele mapeia numeric, real e
    -- float8 todos para `double`.
    round(avg(m.escore_corporal::numeric) filter (where m.escore_corporal > 0), 2) as escore_corporal_medio,
    count(*) filter (where m.famacha between 1 and 5)                     as famacha_n
    from public.manejo m
   where m.propriedade_id = p.id
     and m.data_manejo >= current_date - interval '12 months'
) fam

cross join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('periodo', x.periodo, 'valor', x.valor)
                            order by x.periodo), '[]'::jsonb) as obitos_mensais
    from (select to_char(ob.data_obito, 'YYYY-MM') as periodo,
                 count(*)::int                     as valor
            from public.obito ob
           where ob.propriedade_id = p.id
             and ob.data_obito >= current_date - interval '12 months'
           group by 1) x
) obm

cross join lateral (
  -- DISTRIBUICAO FAMACHA com os cinco graus SEMPRE presentes quando existe ao
  -- menos uma medicao -- grau sem animal e zero, e um grafico que esconde o grau
  -- 5 vazio mente sobre a escala. Sem NENHUMA medicao, devolve '[]' e a tela
  -- mostra estado vazio em vez de cinco barras de zero.
  select case when fam.famacha_n > 0 then d.arr else '[]'::jsonb end as distribuicao_famacha
    from (
      select coalesce(jsonb_agg(jsonb_build_object('rotulo', g.g::text,
                                                   'valor',  coalesce(c.n, 0))
                                order by g.g), '[]'::jsonb) as arr
        from generate_series(1, 5) as g(g)
        left join (
          select m.famacha as grau, count(*)::int as n
            from public.manejo m
           where m.propriedade_id = p.id
             and m.data_manejo >= current_date - interval '12 months'
             and m.famacha between 1 and 5
           group by 1
        ) c on c.grau = g.g
    ) d
) dfa

cross join lateral (
  -- PRINCIPAIS SUSPEITAS pelo catalogo `suspeitas` (clinica.suspeita_id -> FK).
  -- obito.suspeita fica FORA: e text[] de texto livre que casa com o catalogo
  -- por NOME, e misturar as duas fontes contaria o mesmo caso duas vezes quando
  -- o animal tratado morre. Oito e o teto legivel de uma barra horizontal.
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', s.rotulo, 'valor', s.valor)
                            order by s.valor desc, s.rotulo), '[]'::jsonb) as principais_suspeitas
    from (select coalesce(nullif(btrim(su.suspeita), ''), '(sem suspeita)') as rotulo,
                 count(*)::int                                             as valor
            from public.clinica cl
            left join public.suspeitas su on su.id = cl.suspeita_id
           where cl.propriedade_id = p.id
             and cl.data_do_caso >= current_date - interval '12 months'
           group by 1
           order by 2 desc, 1
           limit 8) s
) sus;

comment on view adm.propriedade_sanidade is
  'Aba Sanidade, uma linha por propriedade. manejos_12m EXCLUI descarte (que vive na mesma tabela). '
  'taxa_mortalidade usa denominador aproximado (vivos hoje + obitos do periodo).';

revoke all on adm.propriedade_sanidade from public;
revoke all on adm.propriedade_sanidade from anon, authenticated;
grant select on adm.propriedade_sanidade to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. adm.propriedade_crescimento  ->  interface LinhaCrescimento
--
-- O GMD GRAVADO NAO SERVE. pesagem.gmd/pdi/gpdi estao preenchidos em 0,7% das
-- linhas (docs/RELATORIOS_MANEJO_PESAGEM.md:243) porque dependem do marco de
-- engorda, que existe em 19 dos 13.038 animais -- e o app calcula em Dart, na
-- hora. Ler a coluna aqui daria uma tela vazia em 99% dos clientes.
--
-- Entao o GMD desta view e DERIVADO DA PROPRIA SERIE DE PESAGENS: para cada
-- animal, (peso - peso anterior) / (dias entre as duas pesagens), com lag() em
-- janela por animal. E ganho medio diario de verdade, so que ancorado na
-- pesagem anterior em vez do marco de engorda -- e usa peso_kg e data_pesagem,
-- que existem sempre, em vez de peso_ultima_pesagem/dias_entre_pesagens, cujo
-- preenchimento nao esta garantido.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_crescimento as
select
  p.id                                                       as propriedade_id,
  pes.pesagens_12m,
  pes.animais_pesados_12m,
  gmd.gmd_medio,
  des.peso_medio_desmame,
  meta.abaixo_da_meta,

  -- As tres metas da propria propriedade, para a tela desenhar a banda de
  -- referencia no grafico. Sao colunas legadas de `propriedades`, ainda lidas
  -- pelo app (a curva de peso ideal por idade vive em Dart e em CSV, NAO no
  -- banco -- por isso a banda e uma faixa de metas, nao uma curva).
  p.peso_ideal_desmame,
  p.idade_desmame,
  p.peso_ideal_entrada_reproducao,

  nuv.nuvem_peso_idade,
  pio.piores_gmd

from public.propriedades p

cross join lateral (
  select
    count(*)::int                        as pesagens_12m,
    count(distinct pe.animal_id)::int    as animais_pesados_12m
    from public.pesagem pe
   where pe.propriedade_id = p.id
     and pe.data_pesagem >= current_date - interval '12 months'
) pes

cross join lateral (
  -- GMD MEDIO. A janela de origem e de 24 meses porque um intervalo exige DUAS
  -- pesagens; so entram na media os intervalos cuja pesagem MAIS RECENTE caiu
  -- nos ultimos 12 meses -- assim o card fala do ano corrente sem descartar a
  -- pesagem-ancora do ano anterior.
  -- `between -1 and 2` (kg/dia) descarta digitacao: cabrito nao ganha 3 kg/dia,
  -- e queda de 1 kg/dia por dias seguidos e erro de balanca, nao desempenho.
  select round(avg(k.gmd), 3) as gmd_medio
    from (
      select pe.data_pesagem,
             (pe.peso_kg - lag(pe.peso_kg) over w)
               / nullif((pe.data_pesagem - lag(pe.data_pesagem) over w), 0) as gmd
        from public.pesagem pe
       where pe.propriedade_id = p.id
         and pe.peso_kg is not null
         and pe.data_pesagem >= current_date - interval '24 months'
      window w as (partition by pe.animal_id order by pe.data_pesagem)
    ) k
   where k.gmd is not null
     and k.data_pesagem >= current_date - interval '12 months'
     and k.gmd between -1 and 2
) gmd

cross join lateral (
  -- PESO MEDIO AO DESMAME: pesagens feitas na janela de +-15 dias em torno de
  -- propriedades.idade_desmame. Sem idade_desmame cadastrada nao ha o que
  -- medir e o valor e null -- "nao da para calcular", nao "zero quilo".
  select round(avg(pe.peso_kg), 2) as peso_medio_desmame
    from public.pesagem pe
   where pe.propriedade_id = p.id
     and pe.data_pesagem >= current_date - interval '12 months'
     and pe.peso_kg is not null
     and p.idade_desmame is not null
     and p.idade_desmame > 0
     and pe.idade_dias is not null
     and pe.idade_dias between p.idade_desmame - 15 and p.idade_desmame + 15
) des

cross join lateral (
  -- ABAIXO DA META conta ANIMAIS, nao pesagens: o que interessa e "quantos
  -- bichos estao atras da meta hoje", e por isso so a ULTIMA pesagem de cada
  -- animal na janela e avaliada. Contar pesagens puniria duas vezes quem pesa
  -- com mais frequencia.
  -- progresso NULL (pesagem fora do escopo do trigger de meta -- so femea
  -- leiteira) nao conta como abaixo da meta: e ausencia de meta, nao falha.
  select count(*)::int as abaixo_da_meta
    from (select distinct on (pe.animal_id) pe.animal_id, pe.progresso
            from public.pesagem pe
           where pe.propriedade_id = p.id
             and pe.data_pesagem >= current_date - interval '12 months'
           order by pe.animal_id, pe.data_pesagem desc, pe.id desc) u
   where u.progresso is not null
     and u.progresso < 100
) meta

cross join lateral (
  -- NUVEM PESO x IDADE: um ponto por ANIMAL (a ultima pesagem dele), sem recorte
  -- de 12 meses -- um rebanho que parou de pesar ha 14 meses ainda tem uma nuvem
  -- verdadeira, e escondê-la faria a tela parecer quebrada.
  -- idade_dias da propria pesagem (idade NA pesagem); quando nula, cai para
  -- (data_pesagem - data_de_nascimento). Idade negativa e data invertida: fora.
  -- Teto de 2000 pontos: acima disso um scatter vira mancha e o payload jsonb
  -- cresce sem entregar leitura (o maior rebanho da base tem ~4.8 mil animais).
  select coalesce(jsonb_agg(jsonb_build_object(
             'idade_dias', n.idade_dias,
             'peso_kg',    n.peso_kg,
             'sexo',       n.sexo) order by n.idade_dias), '[]'::jsonb) as nuvem_peso_idade
    from (
      select q.idade_dias, q.peso_kg, q.sexo
        from (select distinct on (pe.animal_id)
                     pe.data_pesagem,
                     coalesce(pe.idade_dias,
                              (pe.data_pesagem - r.data_de_nascimento))::int as idade_dias,
                     round(pe.peso_kg, 2)                                    as peso_kg,
                     nullif(btrim(r.sexo), '')                               as sexo
                from public.pesagem pe
                join public.rebanho r on r.id = pe.animal_id
               where pe.propriedade_id = p.id
                 and pe.peso_kg is not null
                 and coalesce(pe.idade_dias, (pe.data_pesagem - r.data_de_nascimento)) >= 0
               order by pe.animal_id, pe.data_pesagem desc, pe.id desc) q
       order by q.data_pesagem desc
       limit 2000
    ) n
) nuv

cross join lateral (
  -- OS 20 PIORES GMD -- a lista de acao do consultor, nao um grafico. Um animal
  -- aparece uma vez, com o GMD do seu intervalo MAIS RECENTE (o passado ja foi
  -- resolvido ou nao interessa mais). Mesma derivacao e mesmos limites de
  -- sanidade do card gmd_medio; a repeticao da subconsulta e o preco de manter
  -- tudo escopado por propriedade no lateral.
  select coalesce(jsonb_agg(jsonb_build_object(
             'numero_animal', w.numero_animal,
             'nome_animal',   w.nome_animal,
             'gmd',           w.gmd) order by w.gmd), '[]'::jsonb) as piores_gmd
    from (
      select z.numero_animal, z.nome_animal, z.gmd
        from (
          select distinct on (k.animal_id)
                 r.numero_animal,
                 nullif(btrim(r.nome_animal), '') as nome_animal,
                 round(k.gmd, 3)                  as gmd
            from (
              select pe.animal_id,
                     pe.data_pesagem,
                     (pe.peso_kg - lag(pe.peso_kg) over w2)
                       / nullif((pe.data_pesagem - lag(pe.data_pesagem) over w2), 0) as gmd
                from public.pesagem pe
               where pe.propriedade_id = p.id
                 and pe.peso_kg is not null
                 and pe.data_pesagem >= current_date - interval '24 months'
              window w2 as (partition by pe.animal_id order by pe.data_pesagem)
            ) k
            join public.rebanho r on r.id = k.animal_id
           where k.gmd is not null
             and k.data_pesagem >= current_date - interval '12 months'
             and k.gmd between -1 and 2
           order by k.animal_id, k.data_pesagem desc
        ) z
       order by z.gmd
       limit 20
    ) w
) pio;

comment on view adm.propriedade_crescimento is
  'Aba Crescimento, uma linha por propriedade. GMD e DERIVADO das pesagens consecutivas '
  '(pesagem.gmd esta gravado em 0,7% das linhas e nao serve). nuvem_peso_idade tem teto de 2000 pontos.';

revoke all on adm.propriedade_crescimento from public;
revoke all on adm.propriedade_crescimento from anon, authenticated;
grant select on adm.propriedade_crescimento to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. adm.propriedade_avaliacoes  ->  interface LinhaAvaliacoes
--
-- A AML e RARA por natureza: so animal avaliado por tecnico habilitado
-- (perfil_tecnico.habilitacao_aml_status = 'aprovada'), e a maioria dos criadores
-- tem ZERO. Por isso os totais aqui sao de HISTORIA INTEIRA e nao de 12 meses --
-- amls_12m fica ao lado para a tela mostrar movimento recente.
--
-- ARMADILHA DE GRAFIA, verificada no DTO gerado do banco vivo: DUAS das 16
-- colunas de ponto tem ACENTO (ponto_5_profundidadedeúbere,
-- ponto_12_ligamentosuspensóriomedio) enquanto as class_* equivalentes NAO tem.
-- Gerar essas chaves por template quebra; as duas vao entre aspas, escritas a mao.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_avaliacoes as
select
  p.id                                                       as propriedade_id,
  av.amls_total,
  av.amls_12m,
  av.medidas_total,
  av.pontuacao_media,
  av.aml_corte_total,
  pm.pontuacao_mensal,
  rad.media_por_ponto

from public.propriedades p

cross join lateral (
  select
    (select count(*) from public.avaliacao_morfologica_linear a
      where a.propriedade_id = p.id)::int                     as amls_total,

    (select count(*) from public.avaliacao_morfologica_linear a
      where a.propriedade_id = p.id
        and a.data_avaliacao >= current_date - interval '12 months')::int
                                                             as amls_12m,

    (select count(*) from public.medidas md
      where md.propriedade_id = p.id)::int                    as medidas_total,

    -- Media da pontuacao total (max 100) sobre TODAS as avaliacoes. `> 0` porque
    -- avaliacao gravada sem conversao de pontuacao vem com 0 e puxaria a media
    -- para baixo sem representar nenhum animal.
    (select round(avg(a.pontuacao_total::numeric), 2) from public.avaliacao_morfologica_linear a
      where a.propriedade_id = p.id
        and a.pontuacao_total > 0)                            as pontuacao_media,

    -- AML de CORTE e um modelo separado, sem sobreposicao com a linear leiteira.
    (select count(*) from public.aml_corte ac
      where ac.propriedade_id = p.id)::int                    as aml_corte_total
) av

cross join lateral (
  -- Evolucao da pontuacao: TODA a historia, nao 12 meses. A AML e rara o
  -- bastante para uma janela de 12 meses deixar o grafico com um ponto so --
  -- e um ponto nao e uma evolucao.
  select coalesce(jsonb_agg(jsonb_build_object('periodo', x.periodo, 'valor', x.valor)
                            order by x.periodo), '[]'::jsonb) as pontuacao_mensal
    from (select to_char(a.data_avaliacao, 'YYYY-MM')  as periodo,
                 round(avg(a.pontuacao_total::numeric), 2) as valor
            from public.avaliacao_morfologica_linear a
           where a.propriedade_id = p.id
             and a.data_avaliacao is not null
             and a.pontuacao_total > 0
           group by 1) x
) pm

cross join lateral (
  -- As 16 medias num UNICO scan. Sao 16 colunas diferentes da mesma tabela:
  -- 16 subconsultas dariam 16 varreduras para produzir um radar so.
  select
    round(avg(a.ponto_1_mobilidade), 2)                          as p01,
    round(avg(a.ponto_2_larguradepeito), 2)                      as p02,
    round(avg(a.ponto_3_profundidadecorporal), 2)                as p03,
    round(avg(a.ponto_4_angulodegarupa), 2)                      as p04,
    -- ACENTO no nome da coluna. Entre aspas de proposito.
    round(avg(a."ponto_5_profundidadedeúbere"), 2)               as p05,
    round(avg(a.ponto_6_membrosposterioresvistalateral), 2)      as p06,
    round(avg(a.ponto_7_ligamentoanteriordeubere), 2)            as p07,
    round(avg(a.ponto_8_capacidade), 2)                          as p08,
    round(avg(a.ponto_9_larguradegarupa), 2)                     as p09,
    round(avg(a.ponto_10_ligamentoposteriordeubere), 2)          as p10,
    round(avg(a.ponto_11_volumedeubere), 2)                      as p11,
    -- ACENTO no nome da coluna (o class_12_* equivalente NAO tem).
    round(avg(a."ponto_12_ligamentosuspensóriomedio"), 2)        as p12,
    round(avg(a.ponto_13_posicaodetetos), 2)                     as p13,
    round(avg(a.ponto_14_diametrodetetos), 2)                    as p14,
    round(avg(a.ponto_15_membrosposterioresvistaanterior), 2)    as p15,
    round(avg(a.ponto_16_estruturaossea), 2)                     as p16
    from public.avaliacao_morfologica_linear a
   where a.propriedade_id = p.id
) med

cross join lateral (
  -- Radar: 16 eixos na ORDEM DOS PONTOS (1..16), nunca por valor -- radar
  -- reordenado por magnitude nao e comparavel entre dois criadores.
  -- Ponto sem media (ex.: rebanho so de machos, que nao tem os pontos de ubere)
  -- some do radar em vez de virar zero: zero seria uma nota pessima, e o certo
  -- e "nao avaliado".
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', v.rotulo, 'valor', v.valor)
                            order by v.ordem), '[]'::jsonb) as media_por_ponto
    from (values
      ( 1, 'Mobilidade',                  med.p01),
      ( 2, 'Largura de peito',            med.p02),
      ( 3, 'Profundidade corporal',       med.p03),
      ( 4, 'Ângulo de garupa',            med.p04),
      ( 5, 'Profundidade de úbere',       med.p05),
      ( 6, 'Membros post. (lateral)',     med.p06),
      ( 7, 'Ligamento anterior de úbere', med.p07),
      ( 8, 'Capacidade',                  med.p08),
      ( 9, 'Largura de garupa',           med.p09),
      (10, 'Ligamento posterior de úbere', med.p10),
      (11, 'Volume de úbere',             med.p11),
      (12, 'Ligamento suspensório médio', med.p12),
      (13, 'Posição de tetos',            med.p13),
      (14, 'Diâmetro de tetos',           med.p14),
      (15, 'Membros post. (anterior)',    med.p15),
      (16, 'Estrutura óssea',             med.p16)
    ) as v(ordem, rotulo, valor)
   where v.valor is not null
) rad;

comment on view adm.propriedade_avaliacoes is
  'Aba Avaliacoes, uma linha por propriedade. Totais sao de historia inteira (a AML e rara). '
  'media_por_ponto sai na ordem 1..16 para o radar ser comparavel entre criadores.';

revoke all on adm.propriedade_avaliacoes from public;
revoke all on adm.propriedade_avaliacoes from anon, authenticated;
grant select on adm.propriedade_avaliacoes to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. adm.propriedade_financeiro  ->  interface LinhaFinanceiro
--
-- ESTA E A ECONOMIA DA FAZENDA, nao a cobranca do SeabraApp (essa e a aba
-- Assinatura, adm.assinatura_normalizada). Confundir as duas e o erro classico:
-- "receita" aqui e o leite que o produtor vendeu, nao a mensalidade que ele paga.
--
-- Duas fontes independentes, de propriedade diferente:
--   financeiro_lancamentos      livro-caixa manual (receita/despesa por setor)
--   estimativa_custo_snapshot   foto congelada do calculo de custo por litro,
--                               a UNICA serie temporal financeira pronta no banco
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_financeiro as
select
  p.id                                                       as propriedade_id,

  -- SINAL DO VALOR: o dossie descreve financeiro_lancamentos.valor como
  -- assinado (receita positiva, despesa negativa), mas o discriminante real e a
  -- coluna `tipo`, com CHECK. abs() deixa a conta certa nas DUAS convencoes --
  -- sem ele, uma base que grava despesa positiva inverteria a margem e o painel
  -- diria que a fazenda lucra o que ela perde.
  fin.receita_12m,
  fin.despesa_12m,

  -- MARGEM so existe se houve lancamento. Com lancamentos, ausencia de despesa e
  -- zero de verdade (coalesce); sem NENHUM lancamento, os tres campos sao null:
  -- margem zero e "empatou", margem "—" e "o produtor nao usa o modulo".
  case when fin.lancamentos_12m > 0
       then round(coalesce(fin.receita_12m, 0) - coalesce(fin.despesa_12m, 0), 2)
  end                                                        as margem_12m,

  snap.custo_litro,
  snap.lucro_lactante_mes,
  snap.data_snapshot,
  fin.lancamentos_12m,
  cls.custo_litro_serie,
  dps.despesa_por_setor

from public.propriedades p

cross join lateral (
  select
    count(*)::int                                                          as lancamentos_12m,
    case when count(*) filter (where fl.tipo = 'receita') > 0
         then round(sum(abs(fl.valor)) filter (where fl.tipo = 'receita'), 2)
         when count(*) > 0 then 0::numeric
    end                                                                    as receita_12m,
    case when count(*) filter (where fl.tipo = 'despesa') > 0
         then round(sum(abs(fl.valor)) filter (where fl.tipo = 'despesa'), 2)
         when count(*) > 0 then 0::numeric
    end                                                                    as despesa_12m
    from public.financeiro_lancamentos fl
   where fl.propriedade_id = p.id
     and fl.data >= current_date - interval '12 months'
) fin

-- LEFT join lateral, e nao cross: este e o UNICO lateral do arquivo com `limit 1`
-- em vez de agregado, entao ele devolve ZERO linha quando o produtor nunca
-- calculou custo -- e um cross join apagaria a propriedade inteira da view.
left join lateral (
  -- O SNAPSHOT MAIS RECENTE. `deleted_at is null` porque a tabela tem soft
  -- delete: sem esse filtro o painel exibiria um custo que o produtor apagou.
  -- Uma propriedade multi-segmento (caprino + ovino) tem um snapshot POR
  -- SEGMENTO: aqui vence o mais recente, e o segmento fica visivel na tabela de
  -- baixo da aba -- somar custos por litro de especies diferentes nao significa
  -- nada.
  select
    round(ec.custo_litro, 4)         as custo_litro,
    round(ec.lucro_lactante_mes, 2)  as lucro_lactante_mes,
    ec.data_referencia               as data_snapshot
    from public.estimativa_custo_snapshot ec
   where ec.propriedade_id = p.id
     and ec.deleted_at is null
   order by ec.data_referencia desc nulls last, ec.created_at desc nulls last, ec.id desc
   limit 1
) snap on true

cross join lateral (
  -- CUSTO POR LITRO NO TEMPO: historia inteira. O produtor recalcula o custo
  -- poucas vezes por ano -- cortar em 12 meses costuma deixar um ponto so.
  -- Media entre segmentos no mesmo mes, pelo mesmo motivo do card acima.
  select coalesce(jsonb_agg(jsonb_build_object('periodo', x.periodo, 'valor', x.valor)
                            order by x.periodo), '[]'::jsonb) as custo_litro_serie
    from (select to_char(ec.data_referencia, 'YYYY-MM') as periodo,
                 round(avg(ec.custo_litro), 4)          as valor
            from public.estimativa_custo_snapshot ec
           where ec.propriedade_id = p.id
             and ec.deleted_at is null
             and ec.data_referencia is not null
             and ec.custo_litro is not null
           group by 1) x
) cls

cross join lateral (
  -- DESPESA POR SETOR. financeiro_lancamentos NAO tem coluna de descricao: o
  -- unico texto do lancamento e o nome do setor, entao esta e a unica quebra
  -- possivel da despesa. setor_id e ON DELETE SET NULL -- setor apagado vira
  -- '(sem setor)' em vez de sumir da soma.
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.valor desc, x.rotulo), '[]'::jsonb) as despesa_por_setor
    from (select coalesce(nullif(btrim(fs.nome), ''), '(sem setor)') as rotulo,
                 round(sum(abs(fl.valor)), 2)                       as valor
            from public.financeiro_lancamentos fl
            left join public.financeiro_setores fs on fs.id = fl.setor_id
           where fl.propriedade_id = p.id
             and fl.tipo = 'despesa'
             and fl.data >= current_date - interval '12 months'
           group by 1) x
) dps;

comment on view adm.propriedade_financeiro is
  'Aba Financeiro: a economia DA FAZENDA, nao a assinatura do SeabraApp. '
  'receita/despesa/margem sao null quando nao houve lancamento nenhum (0 seria mentira).';

revoke all on adm.propriedade_financeiro from public;
revoke all on adm.propriedade_financeiro from anon, authenticated;
grant select on adm.propriedade_financeiro to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. adm.propriedade_estrutura  ->  interface LinhaEstrutura
--
-- Hierarquia fisica lote -> setor -> baia. Contexto que muda a leitura da tela:
-- so 16% dos animais ativos tem baia preenchida (docs/BOVINOS_INVENTARIO_TELAS.md)
-- -- "sem localizacao" nao e defeito do painel, e o estado real da base, e por
-- isso ganha um card proprio em vez de virar uma fatia perdida no grafico.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_estrutura as
select
  p.id                                                       as propriedade_id,
  est.setores,
  est.baias,
  est.lotes,
  est.movimentacoes_12m,
  est.animais_sem_localizacao,
  plo.por_lote,
  pse.por_setor

from public.propriedades p

cross join lateral (
  select
    (select count(*) from public.setores s where s.propriedade_id = p.id)::int   as setores,
    (select count(*) from public.baias b   where b.propriedade_id = p.id)::int   as baias,
    (select count(*) from public.lotes l   where l.propriedade_id = p.id)::int   as lotes,

    (select count(*) from public.movimentacoes mv
      where mv.propriedade_id = p.id
        and mv.data_movimentacao >= current_date - interval '12 months')::int    as movimentacoes_12m,

    -- SEM LOCALIZACAO = sem baia E sem setor. Animal com setor mas sem baia esta
    -- localizado (grosso modo) e nao entra aqui -- senao o card contaria como
    -- perdido um animal que o produtor sabe onde esta.
    (select count(*) from public.rebanho r
      where r.propriedade_id = p.id
        and r.status = 'ativo'
        and r.data_venda is null
        and r.baia_id is null
        and r.setor_id is null)::int                                             as animais_sem_localizacao
) est

cross join lateral (
  -- Por LOTE, incluindo o balde '(sem lote)' -- omiti-lo faria as fatias somarem
  -- menos que o rebanho sem explicar por que.
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.valor desc, x.rotulo), '[]'::jsonb) as por_lote
    from (select coalesce(nullif(btrim(l.nome_lote), ''), '(sem lote)') as rotulo,
                 count(*)::int                                          as valor
            from public.rebanho r
            left join public.lotes l on l.id = r.lote_atual_id
           where r.propriedade_id = p.id
             and r.status = 'ativo'
             and r.data_venda is null
           group by 1) x
) plo

cross join lateral (
  select coalesce(jsonb_agg(jsonb_build_object('rotulo', x.rotulo, 'valor', x.valor)
                            order by x.valor desc, x.rotulo), '[]'::jsonb) as por_setor
    from (select coalesce(nullif(btrim(s.nome_setor), ''), '(sem setor)') as rotulo,
                 count(*)::int                                            as valor
            from public.rebanho r
            left join public.setores s on s.id = r.setor_id
           where r.propriedade_id = p.id
             and r.status = 'ativo'
             and r.data_venda is null
           group by 1) x
) pse;

comment on view adm.propriedade_estrutura is
  'Aba Estrutura: lote/setor/baia e ocupacao. animais_sem_localizacao e sem baia E sem setor '
  '-- so 16% da base tem baia preenchida, entao esse card costuma ser o maior numero da tela.';

revoke all on adm.propriedade_estrutura from public;
revoke all on adm.propriedade_estrutura from anon, authenticated;
grant select on adm.propriedade_estrutura to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. adm.propriedade_equipe  ->  interface LinhaEquipe
--
-- QUEM ALCANCA ESTA FAZENDA vem de adm.propriedades_escopo (adm_01), que ja
-- resolveu as quatro maneiras de um usuario chegar a uma propriedade. Reusar e
-- obrigatorio: reimplementar aqui criaria uma segunda definicao de "vinculo",
-- e as duas divergiriam na primeira mudanca de papel.
--
-- FILTRO prioridade_vinculo <= 3: a perna 4 do escopo (associacao) inclui o
-- ADMIN GERAL, que alcanca TODA propriedade da base. Sem esse corte, o Felipe
-- apareceria como membro da equipe de todos os 31 clientes.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.propriedade_equipe as
select
  p.id                                                       as propriedade_id,
  eq.colaboradores,
  eq.colaboradores_ativos,
  eq.tecnicos_vinculados,
  eq.visitas_12m,
  pes.pessoas

from public.propriedades p

cross join lateral (
  select
    (select count(*) from public.usuarios cu
      where cu.propriedade_id = p.id
        and cu.regra_de_acesso = 'colaborador')::int          as colaboradores,

    -- `ativo` NULL e legado, e legado esta ATIVO: o app so barra em ativo=false.
    (select count(*) from public.usuarios cu
      where cu.propriedade_id = p.id
        and cu.regra_de_acesso = 'colaborador'
        and coalesce(cu.ativo, true))::int                    as colaboradores_ativos,

    (select count(*) from public.tecnico_propriedades tp
      where tp.propriedade_id = p.id
        and tp.status = 'ativo')::int                         as tecnicos_vinculados,

    -- VISITA TECNICA e o fluxo GRATUITO (produtor convida o tecnico), coisa
    -- diferente do vinculo de consultoria em tecnico_propriedades. As duas
    -- aparecem juntas na aba porque as duas sao gente entrando na fazenda.
    -- data_solicitacao e NOT NULL; data_agendada nao e.
    (select count(*) from public.visitas_tecnicas vt
      where vt.propriedade_id = p.id
        and vt.data_solicitacao >= now() - interval '12 months')::int
                                                              as visitas_12m
) eq

cross join lateral (
  select coalesce(jsonb_agg(jsonb_build_object(
             'usuario_id',           z.usuario_id,
             'nome',                 z.nome,
             'papel',                z.papel,
             'ativo',                z.ativo,
             'vinculo',              z.vinculo,
             'permissoes',           z.permissoes,
             'ultimo_lancamento_em', z.ultimo_lancamento_em)
           order by z.ordem, z.nome), '[]'::jsonb) as pessoas
    from (
      select
        u.id                                                     as usuario_id,
        u.nome,
        -- Papel fora da lista fechada vira null, para nao furar a union do TS.
        case when u.regra_de_acesso in ('administrador', 'admin_associacao',
                                        'produtor', 'tecnico', 'colaborador')
             then u.regra_de_acesso end                          as papel,
        coalesce(u.ativo, true)                                  as ativo,
        e.vinculo,
        e.prioridade_vinculo                                     as ordem,

        -- colaborador_permissoes: NULL ou vazio significa TODAS as permissoes
        -- (backward-compat do app). O array cru viaja como esta e a tela decide
        -- como dizer "tudo liberado" -- traduzir aqui esconderia a diferenca
        -- entre "nunca configurado" e "configurado com tudo".
        u.colaborador_permissoes                                 as permissoes,

        -- ⚠️ ATRIBUICAO PARCIAL, e de proposito. A MAIORIA das tabelas de
        -- lancamento (manejo, pesagem, controle_leiteiro, producao_diaria...)
        -- NAO guarda autor -- so `rebanho` e `movimentacoes` tem
        -- criado_por_usuario_id. Entao NULL aqui significa "nao da para
        -- atribuir a esta pessoa", NUNCA "esta pessoa nao trabalha". A recencia
        -- da CONTA continua vindo de adm.atividade_propriedade (D2), que soma as
        -- oito tabelas de trabalho diario sem depender de autoria.
        -- rebanho_log tambem tem usuario_id e ficou FORA: e a tabela de maior
        -- volume da base (cresce a cada update) e so repetiria a autoria que
        -- `rebanho` ja da.
        (select max(x.em) from (
            select max(rb.created_at) as em
              from public.rebanho rb
             where rb.propriedade_id = p.id
               and rb.criado_por_usuario_id = u.id
            union all
            select max(mv.created_at)
              from public.movimentacoes mv
             where mv.propriedade_id = p.id
               and mv.criado_por_usuario_id = u.id
         ) x)                                                    as ultimo_lancamento_em

        from adm.propriedades_escopo e
        join public.usuarios u on u.id = e.usuario_id
       where e.id = p.id
         and e.prioridade_vinculo <= 3
    ) z
) pes;

comment on view adm.propriedade_equipe is
  'Aba Equipe: quem alcanca esta fazenda (dono, colaborador, consultor), reusando adm.propriedades_escopo. '
  'ultimo_lancamento_em por pessoa e PARCIAL: so rebanho e movimentacoes guardam autor.';

revoke all on adm.propriedade_equipe from public;
revoke all on adm.propriedade_equipe from anon, authenticated;
grant select on adm.propriedade_equipe to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. adm.criador_vitrine  ->  interface LinhaVitrine
--
-- ANCORADA NO CRIADOR (usuario_id), nao na propriedade -- e a unica das oito
-- assim. A aba responde "posso publicar a foto deste animal?", e a resposta e do
-- TITULAR, nao da fazenda. No banco, porem, vitrine_criador e keyed por
-- propriedade_id: a ponte e propriedades.produtor_id.
--
-- Consequencia deliberada: propriedade de CONSULTORIA (produtor_id NULL, cliente
-- que nao usa o app) nunca aparece aqui. Nao ha titular no sistema para consentir
-- -- e publicar sem titular e exatamente o que esta view existe para impedir.
--
-- DISTINCT ON (produtor_id): um usuario com duas propriedades na vitrine (nao
-- existe hoje -- 30 dos 31 produtores tem exatamente uma) rende a linha do
-- consentimento MAIS RECENTE, e as contagens sao DELA. Somar animais de uma
-- fazenda enquanto se mostra a versao do termo de outra seria pior que escolher.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.criador_vitrine as
select
  vc.produtor_id                                             as usuario_id,
  vc.ativo                                                   as publicado,
  vc.bloqueado_admin,
  vc.consentido_em,
  vc.consentido_canal,
  vc.consentido_versao,

  -- Versao VIGENTE do termo (indice unico parcial: existe no maximo uma). Se
  -- diferir de consentido_versao, o consentimento e de um texto que ja mudou --
  -- e a tela destaca. Nao ha nada aqui que decida por ela: a comparacao e visual
  -- de proposito, porque "termo novo" nem sempre significa "reconsentir".
  (select t.versao from public.vitrine_termo t where t.vigente limit 1)
                                                             as termo_vigente,

  vc.revogado_em,
  vc.revogado_motivo,
  va.animais_publicados,
  va.animais_ocultos,
  vc.updated_at                                              as atualizado_em

from (
  select distinct on (p.produtor_id)
         p.produtor_id,
         v.propriedade_id,
         v.ativo,
         v.bloqueado_admin,
         v.consentido_em,
         nullif(btrim(v.consentido_canal), '')   as consentido_canal,
         nullif(btrim(v.consentido_versao), '')  as consentido_versao,
         v.revogado_em,
         nullif(btrim(v.revogado_motivo), '')    as revogado_motivo,
         v.updated_at
    from public.vitrine_criador v
    join public.propriedades p on p.id = v.propriedade_id
   where p.produtor_id is not null
   order by p.produtor_id, v.consentido_em desc nulls last, v.propriedade_id
) vc

cross join lateral (
  -- `publicar` e a chave por animal; `destaque`/`indexavel` sao refinamentos de
  -- exibicao e nao entram na conta de publicado/oculto.
  select
    (count(*) filter (where va0.publicar))::int       as animais_publicados,
    (count(*) filter (where not va0.publicar))::int   as animais_ocultos
    from public.vitrine_animal va0
   where va0.propriedade_id = vc.propriedade_id
) va;

comment on view adm.criador_vitrine is
  'Aba Vitrine: consentimento LGPD do CRIADOR (ancorada em usuario_id via propriedades.produtor_id). '
  'Criador que nunca entrou na vitrine NAO TEM LINHA aqui (a aba mostra estado vazio); '
  'propriedade de consultoria (produtor_id NULL) tambem nao: nao ha titular para consentir.';

revoke all on adm.criador_vitrine from public;
revoke all on adm.criador_vitrine from anon, authenticated;
grant select on adm.criador_vitrine to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Fecho
--
-- Repeticao deliberada do fecho do adm_01: nenhum objeto deste schema pode ser
-- gravavel, e nenhum papel alem de service_role pode le-lo. Os `grant select`
-- individuais acima ja cobrem as oito views; este bloco existe para o caso de
-- alguem acrescentar uma view aqui e esquecer o par revoke/grant.
-- ─────────────────────────────────────────────────────────────────────────────

revoke all on all tables in schema adm from public;
revoke all on all tables in schema adm from anon, authenticated;
grant select on all tables in schema adm to service_role;

-- Lembrete: view nova em schema ja exposto SO aparece no PostgREST depois de
-- Settings -> API -> Reload schema cache (ou `notify pgrst, 'reload schema'`).
-- Sem isso o /adm recebe PGRST205 para as views desta fase e mostra estado vazio.
