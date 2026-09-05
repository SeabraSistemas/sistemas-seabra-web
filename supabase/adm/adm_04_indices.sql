-- ============================================================================
-- adm_04_indices.sql
-- Os indices que o /adm exige ANTES da primeira query, e o conserto de dois
-- indices que existem, custam manutencao e nunca casam uma linha.
--
-- 🔴 LEIA ANTES DE COLAR NO SQL EDITOR
-- `create index concurrently` NAO RODA DENTRO DE UMA TRANSACAO. O SQL Editor do
-- Supabase manda o conteudo inteiro do painel como um lote, e um lote com varias
-- instrucoes vira uma transacao implicita -- o comando falha com
-- "CREATE INDEX CONCURRENTLY cannot run inside a transaction block".
-- Entao: RODE UM COMANDO POR VEZ. Selecione o bloco, execute, confira, va para o
-- proximo. E chato de proposito -- cada um destes toca uma tabela de producao.
--
-- Por que CONCURRENTLY: sem ele o CREATE INDEX pega ACCESS EXCLUSIVE na tabela e
-- todo lancamento do app trava ate terminar. Com ele, ninguem para. O custo e
-- ser mais lento e poder deixar um indice INVALIDO se falhar no meio -- e por
-- isso o passo de verificacao no fim deste arquivo.
--
-- Ordem: rode com o app em baixa (madrugada). Nenhum destes comandos escreve
-- dado; todos sao reversiveis com `drop index concurrently`.
--
-- Idempotente: `if not exists` em tudo. Rodar de novo nao recria nada.
-- ============================================================================


-- ############################################################################
-- BLOCO A -- o que falta para o /adm abrir sem sequential scan
-- ############################################################################

-- A1. O INDICE MAIS IMPORTANTE DO /adm.
-- Hoje NAO EXISTE NENHUM indice com propriedade_id em `rebanho`. O unico que
-- chega perto e idx_rebanho_nascimentos_propriedade_data, que e parcial
-- (`where origem = 'nascido'`) e nao serve para listar efetivo.
-- Sem este indice, abrir o maior criador (4.820 animais) faz seq scan nas ~13
-- mil linhas da tabela inteira -- e a contagem de animais aparece em TODA linha
-- da lista mestra, ou seja, 31 seq scans por carregamento.
-- Parcial em data_venda is null porque animal vendido nunca entra no efetivo:
-- o indice fica menor e a manutencao mais barata.
-- CUSTO: alguns segundos de build; poucos MB.
create index concurrently if not exists idx_rebanho_propriedade_vivos
  on public.rebanho (propriedade_id)
  where data_venda is null;

-- A2. Cadastro de animal por periodo: alimenta o modulo 'rebanho' de
-- adm.atividade_propriedade e a serie de crescimento do rebanho.
-- CUSTO: alguns segundos; poucos MB.
create index concurrently if not exists idx_rebanho_propriedade_created
  on public.rebanho (propriedade_id, created_at desc);

-- A3. Pesagem por propriedade e data. Hoje so existe a UNIQUE
-- (animal_id, data_pesagem) -- que serve ao app (a pesagem daquele animal) e nao
-- ao painel (as pesagens daquela fazenda no periodo).
-- CUSTO: baixo; pesagem e tabela de lote, dezenas a centenas por sessao.
create index concurrently if not exists idx_pesagem_propriedade_data
  on public.pesagem (propriedade_id, data_pesagem desc);

-- A4/A5. Venda e obito por propriedade e data: a serie de saidas do rebanho e o
-- KPI de mortalidade. Tabelas pequenas, indices pequenos.
create index concurrently if not exists idx_venda_propriedade_data
  on public.venda (propriedade_id, data_venda desc);

create index concurrently if not exists idx_obito_propriedade_data
  on public.obito (propriedade_id, data_obito desc);

-- A6. Saida de leite por propriedade e data (aba de producao).
create index concurrently if not exists idx_saida_leite_propriedade_data
  on public.saida_leite (propriedade_id, data_saida desc);

-- A7. Manejo por propriedade e data. Existe idx_manejo_propriedade_id, de coluna
-- unica: ele acha as linhas da fazenda, mas o Postgres ainda precisa filtrar a
-- janela de 30/90 dias linha a linha. `manejo` e das tabelas mais volumosas
-- (manejo coletivo grava uma linha POR ANIMAL da sessao), entao a composta paga.
create index concurrently if not exists idx_manejo_propriedade_data
  on public.manejo (propriedade_id, data_manejo desc);


-- ############################################################################
-- BLOCO B -- o que adm.atividade_propriedade exige
--
-- A view de atividade agrega por created_at (QUANDO foi digitado), nao pela data
-- do evento (a que o lancamento se refere, e que aceita retroativo). Sao eixos
-- diferentes, e os indices do bloco A nao servem para ela.
--
-- Com (propriedade_id, created_at desc) cada perna do UNION ALL vira INDEX ONLY
-- SCAN: o Postgres le so o indice, nunca a heap. E a diferenca entre a lista
-- mestra abrir em 80 ms e em 2 s.
-- ############################################################################

-- B1. controle_leiteiro e a maior tabela de lancamento do banco (um ano de 100
-- lactantes com 2 ordenhas/dia passa de 70 mil linhas). O indice existente,
-- idx_controle_leiteiro_propriedade_data_id, e por data_ordenha -- outro eixo.
-- Este e o indice de maior retorno do bloco.
create index concurrently if not exists idx_controle_leiteiro_propriedade_created
  on public.controle_leiteiro (propriedade_id, created_at desc);

-- B2. producao_diaria: 1-2 linhas por propriedade por dia, mas e a tabela lida
-- em toda tela de producao. A UNIQUE existente e (propriedade_id,
-- data_producao, segmento) -- de novo, o eixo da data do evento.
create index concurrently if not exists idx_producao_diaria_propriedade_created
  on public.producao_diaria (propriedade_id, created_at desc);

-- B3/B4. manejo e pesagem pelo eixo de digitacao. Sim, sao a segunda composta
-- na mesma tabela (ver A3 e A7) -- e a duplicidade e deliberada: uma serve a
-- pergunta "o que aconteceu no rebanho no periodo", a outra "quando essa conta
-- deu sinal de vida". As duas aparecem em toda abertura do painel.
create index concurrently if not exists idx_manejo_propriedade_created
  on public.manejo (propriedade_id, created_at desc);

create index concurrently if not exists idx_pesagem_propriedade_created
  on public.pesagem (propriedade_id, created_at desc);

-- NAO criar (decisao registrada, para ninguem "corrigir" depois): venda, obito,
-- saida_leite e rebanho tambem entram na view de atividade, mas venda/obito/
-- saida_leite tem dezenas a centenas de linhas por ano -- o seq scan delas custa
-- menos que manter mais tres indices. rebanho ja esta coberto por A2.


-- ############################################################################
-- BLOCO C -- os dois indices MORTOS
--
-- migrations/add_localizacao_constraints_and_functions.sql:281-282 criou:
--     idx_rebanho_baia_id  on rebanho(baia_id)  where status = 'Ativo'
--     idx_rebanho_setor_id on rebanho(setor_id) where status = 'Ativo'
-- com 'Ativo' MAIUSCULO. O valor real de rebanho.status e 'ativo' minusculo --
-- provado por migrations/fix_view_animais_localizacao_status_ativo.sql, que
-- existe exatamente porque uma view filtrava um valor inexistente.
--
-- Consequencia: os dois casam ZERO linhas. Ocupam espaco, sao mantidos a cada
-- INSERT e UPDATE em rebanho (a tabela mais escrita do banco) e nunca podem ser
-- escolhidos por nenhum plano. Nao e otimizacao: e um bug com custo continuo.
-- ############################################################################

-- C1. Fora os mortos. `concurrently` tambem no drop, para nao travar rebanho.
drop index concurrently if exists public.idx_rebanho_baia_id;

drop index concurrently if exists public.idx_rebanho_setor_id;

-- C2. De volta, com o literal certo. A localizacao (baia/setor) so interessa em
-- animal vivo, entao o parcial continua sendo a forma certa -- so precisava
-- casar com o dado.
create index concurrently if not exists idx_rebanho_baia_id
  on public.rebanho (baia_id)
  where status = 'ativo';

create index concurrently if not exists idx_rebanho_setor_id
  on public.rebanho (setor_id)
  where status = 'ativo';


-- ############################################################################
-- BLOCO D -- opcional, so se a aba de Sanidade sair do papel (Fase 2)
-- ############################################################################

-- create index concurrently if not exists idx_clinica_propriedade_data
--   on public.clinica (propriedade_id, data_do_caso desc);


-- ############################################################################
-- BLOCO E -- estatisticas
--
-- Indice novo que o planner nao conhece pode simplesmente nao ser escolhido.
-- `rebanho` ja tem autovacuum_analyze_scale_factor = 0.02 desde
-- migrations/2026_06_08_perf_perfil_animal_indices.sql -- foi o que curou um
-- timeout de 8 s causado por estatistica velha na view_genealogia_animal.
-- As outras tres tabelas grandes de lancamento nao receberam o mesmo tratamento.
--
-- Estes SIM podem rodar todos juntos (nao sao CONCURRENTLY).
-- ############################################################################

alter table public.controle_leiteiro
  set (autovacuum_analyze_scale_factor = 0.02, autovacuum_vacuum_scale_factor = 0.05);
alter table public.manejo
  set (autovacuum_analyze_scale_factor = 0.02, autovacuum_vacuum_scale_factor = 0.05);
alter table public.pesagem
  set (autovacuum_analyze_scale_factor = 0.02, autovacuum_vacuum_scale_factor = 0.05);

analyze public.rebanho;
analyze public.controle_leiteiro;
analyze public.producao_diaria;
analyze public.manejo;
analyze public.pesagem;


-- ############################################################################
-- BLOCO F -- verificacao (rode depois de tudo)
-- ############################################################################

-- F1. Nenhum indice ficou INVALIDO. CONCURRENTLY que falha no meio deixa um
-- indice invalido: ele nao e usado em consulta, MAS continua sendo mantido a
-- cada escrita -- o pior dos dois mundos. Se aparecer alguma linha aqui,
-- `drop index concurrently <nome>` e refaca o comando correspondente.
select c.relname as indice_invalido
  from pg_index i
  join pg_class c on c.oid = i.indexrelid
  join pg_class t on t.oid = i.indrelid
  join pg_namespace n on n.oid = t.relnamespace
 where not i.indisvalid
   and n.nspname = 'public'
 order by 1;

-- F2. Os indices deste arquivo existem, e os dois parciais de localizacao agora
-- apontam para 'ativo' minusculo. Esperado: 13 linhas, e nenhuma com 'Ativo'.
select c.relname as indice, pg_get_indexdef(c.oid) as definicao
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relname in (
     'idx_rebanho_propriedade_vivos', 'idx_rebanho_propriedade_created',
     'idx_pesagem_propriedade_data', 'idx_venda_propriedade_data',
     'idx_obito_propriedade_data', 'idx_saida_leite_propriedade_data',
     'idx_manejo_propriedade_data',
     'idx_controle_leiteiro_propriedade_created', 'idx_producao_diaria_propriedade_created',
     'idx_manejo_propriedade_created', 'idx_pesagem_propriedade_created',
     'idx_rebanho_baia_id', 'idx_rebanho_setor_id')
 order by 1;

-- F3. Prova de que o indice mais caro esta sendo usado: o plano abaixo tem que
-- mostrar "Index Only Scan using idx_controle_leiteiro_propriedade_created".
-- Se mostrar Seq Scan, rode `analyze public.controle_leiteiro` e repita.
-- explain analyze
-- select propriedade_id, max(created_at)
--   from public.controle_leiteiro
--  group by propriedade_id;
