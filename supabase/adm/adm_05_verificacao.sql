-- ============================================================================
-- adm_05_verificacao.sql
-- Prova que TODOS os outros arquivos deste diretorio fizeram o que dizem.
-- NAO altera nada.
--
-- RODAR POR ULTIMO, sempre: depois de adm_01..adm_04, adm_06, adm_07 e adm_08 --
-- e de novo a cada vez que qualquer um deles for reexecutado.
--
-- Nao e preferencia de ordem. Os asserts 4a/4b/4c (nenhuma view projetando cpf,
-- senha, coordenada, e-mail ou whatsapp cru) varrem information_schema para o
-- schema `adm` e so enxergam as views QUE JA EXISTEM: rodar antes do adm_07 faz
-- a guarda de LGPD passar por vacuo justamente sobre as views novas.
--
-- Falha = `raise exception`, alto e com o numero do assert -- este arquivo
-- existe para gritar, nao para tranquilizar.
-- Se qualquer bloco falhar, NAO ligue o /adm: conserte e rode de novo.
--
-- Pode (e deve) ser re-rodado depois de qualquer mexida no schema adm.
-- ============================================================================


-- ############################################################################
-- BLOCO 1 -- SEGURANCA. O que torna verdadeira a frase "o /adm e
-- estruturalmente somente-leitura, mesmo segurando a service_role".
-- ############################################################################

do $seguranca$
declare
  v      int;
  v_txt  text;
  v_falta text;
begin
  -- Os tres papeis do Supabase existem? Sem eles os asserts de privilegio
  -- passariam por vacuo, o que e pior que falhar.
  if to_regrole('anon') is null or to_regrole('authenticated') is null
     or to_regrole('service_role') is null then
    raise exception 'FALHA 0: papel anon/authenticated/service_role ausente -- '
                    'este script assume um banco Supabase';
  end if;

  -- 1) NENHUMA TABELA nem MATERIALIZED VIEW no schema `adm`.
  -- O schema e exposto ao PostgREST, e tabela em schema exposto herda o ACL
  -- default deste projeto (arwdDxt para anon). A regra "so views" e o que
  -- transforma o schema num teto de leitura em vez de uma porta nova.
  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'adm' and c.relkind in ('r', 'm', 'p', 'f');
  if v > 0 then
    raise exception 'FALHA 1: % tabela(s)/matview no schema adm -- o schema e so de VIEWS', v;
  end if;

  -- 2) anon e authenticated nao podem ter privilegio NENHUM em adm.
  -- Sem USAGE no schema, uma requisicao com a anon key (que viaja dentro do
  -- APK) recebe permission denied mesmo com `Accept-Profile: adm`.
  if has_schema_privilege('anon', 'adm', 'USAGE')
     or has_schema_privilege('authenticated', 'adm', 'USAGE') then
    raise exception 'FALHA 2a: anon/authenticated tem USAGE no schema adm';
  end if;

  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'adm' and c.relkind = 'v'
     and (has_table_privilege('anon', c.oid, 'SELECT')
       or has_table_privilege('authenticated', c.oid, 'SELECT')
       or has_table_privilege('anon', c.oid, 'INSERT')
       or has_table_privilege('authenticated', c.oid, 'INSERT'));
  if v > 0 then
    raise exception 'FALHA 2b: % view(s) de adm alcancaveis por anon/authenticated', v;
  end if;

  -- 3) Todas as views esperadas existem. Uma view faltando nao da erro na tela:
  -- vira "carteira vazia", que e o pior modo de falha possivel num painel.
  select string_agg(esperada, ', ' order by esperada) into v_falta
    from unnest(array[
      'usuarios_lista', 'propriedades_escopo', 'assinatura_normalizada',
      'pagamentos_conta', 'propriedade_visao_geral', 'atividade_propriedade',
      'auditoria_recente'
    ]) as esperada
   where to_regclass('adm.' || esperada) is null;
  if v_falta is not null then
    raise exception 'FALHA 3: view(s) ausente(s) em adm: %', v_falta;
  end if;

  -- 4a) NENHUMA coluna sensivel exposta. Este e o assert que compra o schema:
  -- colaborador_senha (6 senhas EM TEXTO PLANO), colaborador_senha_hash e cpf
  -- ficam estruturalmente fora de alcance. latitude/longitude entram na mesma
  -- regra: coordenada de propriedade rural e localizacao precisa de pessoa
  -- fisica, e o painel resolve com cidade/estado.
  -- `tem_cpf` passa de proposito (e boolean, nao e o CPF).
  select count(*) into v
    from information_schema.columns
   where table_schema = 'adm'
     and (column_name = 'cpf'
       or column_name like '%senha%'
       or column_name in ('latitude', 'longitude')
       or column_name = 'email'
       or column_name = 'whatsapp_pessoal');
  if v > 0 then
    select string_agg(table_name || '.' || column_name, ', ') into v_txt
      from information_schema.columns
     where table_schema = 'adm'
       and (column_name = 'cpf' or column_name like '%senha%'
         or column_name in ('latitude', 'longitude', 'email', 'whatsapp_pessoal'));
    raise exception 'FALHA 4a: coluna sensivel exposta em adm: %', v_txt;
  end if;

  -- 4b) E nenhuma view sequer MENCIONA as colunas de senha no corpo -- pega o
  -- caso de alguem projetar `colaborador_senha as observacao`.
  -- `cpf` nao entra aqui: usuarios_lista o cita legitimamente para derivar
  -- tem_cpf, e o assert 4a ja garante que ele nao sai como coluna.
  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'adm' and c.relkind = 'v'
     and pg_get_viewdef(c.oid) like '%colaborador_senha%';
  if v > 0 then
    raise exception 'FALHA 4b: % view(s) de adm referenciam colaborador_senha', v;
  end if;

  -- 4c) `busca` e a UNICA excecao deliberada: e uma coluna de texto que
  -- concatena nome + email + whatsapp + cpf sem acento, e existe so para o
  -- `ilike` do campo de pesquisa. Ela NAO pode ser projetada pelo Next (a lista
  -- COLUNAS_USUARIO em src/lib/adm/queries.ts e explicita por isso), e nao pode
  -- se espalhar: se aparecer numa segunda view, a chance de alguem faze-la
  -- vazar num select('*') multiplica.
  select count(*) into v
    from information_schema.columns
   where table_schema = 'adm' and column_name = 'busca'
     and table_name <> 'usuarios_lista';
  if v > 0 then
    raise exception 'FALHA 4c: coluna `busca` fora de usuarios_lista (% view(s))', v;
  end if;

  -- 5) service_role LE tudo. O espelho do assert 2: se faltar grant, o painel
  -- abre e nao mostra nada, e a causa nao aparece em lugar nenhum do Next.
  select string_agg(c.relname, ', ' order by c.relname) into v_falta
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'adm' and c.relkind = 'v'
     and not has_table_privilege('service_role', c.oid, 'SELECT');
  if v_falta is not null then
    raise exception 'FALHA 5: service_role sem SELECT em: %', v_falta;
  end if;

  -- 6) NENHUMA view de adm e gravavel por ninguem -- nem pela service_role.
  -- Decisao D3 virando estrutura: com todo acesso passando pelo client pinado no
  -- schema adm, nao existe caminho de INSERT/UPDATE/DELETE nas tabelas do app.
  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'adm' and c.relkind = 'v'
     and (has_table_privilege('service_role', c.oid, 'INSERT')
       or has_table_privilege('service_role', c.oid, 'UPDATE')
       or has_table_privilege('service_role', c.oid, 'DELETE')
       or pg_relation_is_updatable(c.oid, true) <> 0);
  if v > 0 then
    raise exception 'FALHA 6: % view(s) de adm sao gravaveis', v;
  end if;

  -- 7) adm.atividade_propriedade tem corpo de verdade, e nao o esqueleto vazio
  -- que o adm_01 cria para a ordem numerica funcionar. Sem este assert o painel
  -- abriria com TODO mundo marcado como "nunca lancou" -- silenciosamente.
  if pg_get_viewdef('adm.atividade_propriedade'::regclass) like '%ESQUELETO_ADM_01%' then
    raise exception 'FALHA 7: adm.atividade_propriedade ainda e o esqueleto do adm_01 -- rode adm_02';
  end if;

  -- 8) Auditoria: as tabelas existem e continuam inalcancaveis por anon,
  -- authenticated e ate pela service_role (a escrita passa pelas RPCs definer).
  if to_regclass('auditoria.adm_acessos') is null
     or to_regclass('auditoria.adm_tentativas_login') is null then
    raise exception 'FALHA 8a: tabela de auditoria ausente -- rode adm_03';
  end if;

  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'auditoria'
     and c.relname in ('adm_acessos', 'adm_tentativas_login')
     and (has_table_privilege('anon', c.oid, 'SELECT')
       or has_table_privilege('authenticated', c.oid, 'SELECT')
       or has_table_privilege('anon', c.oid, 'DELETE')
       or has_table_privilege('authenticated', c.oid, 'DELETE'));
  if v > 0 then
    raise exception 'FALHA 8b: tabela de auditoria alcancavel por anon/authenticated';
  end if;

  -- 9) As RPCs de auditoria nao sao executaveis por anon/authenticated. Funcao
  -- nova em Postgres nasce com EXECUTE para PUBLIC -- se o revoke do adm_03 nao
  -- rodou, qualquer pessoa com a anon key do APK poderia poluir a trilha.
  select count(*) into v
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('adm_registrar_acesso', 'adm_registrar_tentativa_login',
                       'adm_status_login', 'adm_texto_para_inet')
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
       or has_function_privilege('authenticated', p.oid, 'EXECUTE'));
  if v > 0 then
    raise exception 'FALHA 9: % RPC(s) de auditoria executaveis por anon/authenticated', v;
  end if;

  raise notice 'BLOCO 1 (seguranca): 9 asserts OK';
end
$seguranca$;


-- ############################################################################
-- BLOCO 2 -- CONTRATO DE DADOS. As views existem; agora, elas dizem a verdade?
-- Cada assert aqui corresponde a um defeito verificado no banco real.
-- ############################################################################

do $contrato$
declare v int; v_txt text;
begin
  -- 10) DEDUPE. `assinaturas` NAO tem UNIQUE por usuario_id -- o schema aceita
  -- duas linhas para o mesmo dono. Sem o DISTINCT ON, a conta entraria duas
  -- vezes no MRR. Este assert prova que o DISTINCT ON esta valendo.
  select count(*) into v
    from (select coalesce(usuario_id, -associacao_id) as dono
            from adm.assinatura_normalizada
           group by 1 having count(*) > 1) d;
  if v > 0 then
    raise exception 'FALHA 10: % dono(s) com mais de uma linha em adm.assinatura_normalizada', v;
  end if;

  -- 11) CORTESIA NAO E RECEITA. Sao ~19 linhas com data_vencimento 2099-12-31 no
  -- banco; soma-las inflaria o MRR com dinheiro que nunca entrou. O MRR de hoje
  -- (asaas-admin-actions/index.ts:344) comete exatamente esse erro.
  select count(*) into v
    from adm.assinatura_normalizada
   where origem_acesso = 'cortesia' and coalesce(valor_real_mensal, 0) <> 0;
  if v > 0 then
    raise exception 'FALHA 11: % cortesia(s) gerando MRR', v;
  end if;

  -- 12) OS QUATRO BALDES SAO EXCLUSIVOS. E o que permite o card da carteira
  -- somar sem contar ninguem duas vezes. Um valor fora da lista quebraria a
  -- union OrigemAcesso do TypeScript sem erro de compilacao.
  select string_agg(distinct origem_acesso, ', ') into v_txt
    from adm.assinatura_normalizada
   where origem_acesso is not null
     and origem_acesso not in ('pagante', 'trial', 'cortesia', 'extensao');
  if v_txt is not null then
    raise exception 'FALHA 12: origem_acesso fora do contrato: %', v_txt;
  end if;

  -- 13) Toda conta com acesso ativo cai em algum balde. Um NULL aqui e um
  -- cliente que o painel mostraria como "sem origem" -- e uma receita que
  -- ninguem consegue explicar.
  select count(*) into v
    from adm.assinatura_normalizada
   where acesso_ativo and origem_acesso is null;
  if v > 0 then
    raise exception 'FALHA 13: % conta(s) com acesso ativo e sem balde de origem', v;
  end if;

  -- 14) PAPEL CANONICO. regra_de_acesso e a fonte de verdade; tipo_usuario_id e
  -- dado sujo (o Admin Geral real tem tipo_usuario_id = 2). A view converte
  -- valor desconhecido em NULL -- este assert confirma que nada fora da lista
  -- fechada passou.
  select string_agg(distinct papel, ', ') into v_txt
    from adm.usuarios_lista
   where papel is not null
     and papel not in ('administrador', 'admin_associacao', 'produtor',
                       'tecnico', 'colaborador');
  if v_txt is not null then
    raise exception 'FALHA 14: papel fora do contrato: %', v_txt;
  end if;

  -- 15) MASCARA DE VERDADE. Se algum email_mascarado for igual a um e-mail real
  -- da base, a mascara nao mascarou nada -- e o valor cru ja estaria no payload
  -- RSC, no DevTools do browser e possivelmente no log da Vercel.
  select count(*) into v
    from adm.usuarios_lista ul
   where ul.email_mascarado is not null
     and exists (select 1 from public.usuarios u
                  where lower(btrim(u.email)) = lower(ul.email_mascarado));
  if v > 0 then
    raise exception 'FALHA 15: % e-mail(s) saindo sem mascara de adm.usuarios_lista', v;
  end if;

  -- 16) Idem para o whatsapp. A mascara deixa so os 4 ultimos digitos.
  select count(*) into v
    from adm.usuarios_lista ul
   where ul.whatsapp_mascarado is not null
     and exists (select 1 from public.usuarios u
                  where btrim(u.whatsapp_pessoal) = ul.whatsapp_mascarado);
  if v > 0 then
    raise exception 'FALHA 16: % telefone(s) saindo sem mascara', v;
  end if;

  -- 17) SEGMENTO dentro da lista fechada (o text[] aceita qualquer coisa).
  select string_agg(distinct s, ', ') into v_txt
    from adm.propriedades_escopo, unnest(segmentos) s
   where s not in ('caprino_leiteiro', 'caprino_corte', 'ovino_leiteiro', 'ovino_corte');
  if v_txt is not null then
    raise exception 'FALHA 17: segmento fora do contrato: %', v_txt;
  end if;

  -- 18) VINCULO dentro da lista fechada.
  select string_agg(distinct vinculo, ', ') into v_txt
    from adm.propriedades_escopo
   where vinculo not in ('dono', 'herdado', 'consultoria', 'associacao');
  if v_txt is not null then
    raise exception 'FALHA 18: vinculo fora do contrato: %', v_txt;
  end if;

  -- 19) Uma linha por (usuario, propriedade). Duas pernas do UNION casando o
  -- mesmo par duplicaria a contagem de animais e de propriedades na lista.
  select count(*) into v
    from (select usuario_id, id from adm.propriedades_escopo
           group by 1, 2 having count(*) > 1) d;
  if v > 0 then
    raise exception 'FALHA 19: % par(es) usuario/propriedade duplicados no escopo', v;
  end if;

  -- 20) 'ativo' MINUSCULO. Se alguem trocar por 'Ativo' em qualquer view, a
  -- contagem de animais zera na tela inteira sem lancar erro -- foi assim que
  -- os dois indices parciais de localizacao nasceram mortos.
  if (select count(*) from public.rebanho where status = 'ativo') > 0
     and (select coalesce(sum(animais_ativos), 0) from adm.propriedades_escopo) = 0 then
    raise exception 'FALHA 20: adm.propriedades_escopo conta 0 animais com a base cheia -- '
                    'literal de status errado?';
  end if;

  raise notice 'BLOCO 2 (contrato de dados): 11 asserts OK';
end
$contrato$;


-- ############################################################################
-- BLOCO 3 -- INDICES (adm_04). Nao falha se voce ainda nao rodou o adm_04;
-- avisa. O painel funciona sem eles, so devagar.
-- ############################################################################

do $indices$
declare v int; v_txt text;
begin
  -- 21) Indice invalido e o pior dos dois mundos: nao e usado em consulta, mas
  -- continua sendo mantido a cada escrita. Este assert FALHA, nao avisa.
  -- Escopo nas tabelas que o adm_04 toca: um indice invalido em outra tabela e
  -- problema real, mas nao e deste pacote e nao pode bloquear a subida do /adm.
  select string_agg(c.relname, ', ') into v_txt
    from pg_index i
    join pg_class c on c.oid = i.indexrelid
    join pg_class t on t.oid = i.indrelid
    join pg_namespace n on n.oid = t.relnamespace
   where not i.indisvalid and n.nspname = 'public'
     and t.relname in ('rebanho', 'pesagem', 'manejo', 'venda', 'obito',
                       'saida_leite', 'controle_leiteiro', 'producao_diaria');
  if v_txt is not null then
    raise exception 'FALHA 21: indice(s) INVALIDO(s) em public: % -- '
                    'drop index concurrently e refaca', v_txt;
  end if;

  -- 22) Os indices parciais mortos. `where status = ''Ativo''` com maiuscula
  -- casa zero linhas -- o valor real e 'ativo'.
  select string_agg(c.relname, ', ') into v_txt
    from pg_class c
    join pg_index i on i.indexrelid = c.oid
    join pg_class t on t.oid = i.indrelid
    join pg_namespace n on n.oid = t.relnamespace
   where n.nspname = 'public' and t.relname = 'rebanho'
     and pg_get_indexdef(c.oid) like '%''Ativo''%';
  if v_txt is not null then
    raise exception 'FALHA 22: indice morto em rebanho (filtra ''Ativo'' maiusculo): %', v_txt;
  end if;

  -- 23) Aviso (nao falha): o indice mais importante do /adm.
  if to_regclass('public.idx_rebanho_propriedade_vivos') is null then
    raise warning 'AVISO 23: idx_rebanho_propriedade_vivos ausente -- rode o adm_04. '
                  'Sem ele, cada linha da lista mestra faz seq scan em rebanho.';
  end if;

  select count(*) into v
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in ('idx_rebanho_propriedade_vivos', 'idx_rebanho_propriedade_created',
       'idx_pesagem_propriedade_data', 'idx_venda_propriedade_data',
       'idx_obito_propriedade_data', 'idx_saida_leite_propriedade_data',
       'idx_manejo_propriedade_data', 'idx_controle_leiteiro_propriedade_created',
       'idx_producao_diaria_propriedade_created', 'idx_manejo_propriedade_created',
       'idx_pesagem_propriedade_created');
  if v < 11 then
    raise warning 'AVISO 23b: % de 11 indices do adm_04 presentes', v;
  end if;

  raise notice 'BLOCO 3 (indices): OK';
end
$indices$;


-- ############################################################################
-- BLOCO 4 -- RETRATO. Nao assere nada: mostra o que o /adm vai exibir, para
-- voce conferir contra o que ja conhece da base antes de abrir a tela.
-- O MRR real VAI ser menor que o R$ 1.934,96 que o app mostra hoje -- e o ponto.
-- ############################################################################

select 'contas'                as metrica, count(*)::text as valor from adm.usuarios_lista
union all
select 'contas com acesso',      count(*)::text from adm.usuarios_lista where acesso_ativo
union all
select 'propriedades',           count(*)::text from public.propriedades
union all
select 'animais vivos',          count(*)::text from public.rebanho
                                  where status = 'ativo' and data_venda is null
union all
select 'pagantes',               count(*)::text from adm.assinatura_normalizada
                                  where origem_acesso = 'pagante'
union all
select 'trial',                  count(*)::text from adm.assinatura_normalizada
                                  where origem_acesso = 'trial'
union all
select 'cortesia',               count(*)::text from adm.assinatura_normalizada
                                  where origem_acesso = 'cortesia'
union all
select 'extensao manual',        count(*)::text from adm.assinatura_normalizada
                                  where origem_acesso = 'extensao'
union all
select 'MRR real (R$)',          to_char(coalesce(sum(valor_real_mensal), 0), 'FM999G999D00')
                                  from adm.assinatura_normalizada
union all
select 'MRR tabela (R$)',        to_char(coalesce(sum(valor_tabela_mensal), 0), 'FM999G999D00')
                                  from adm.assinatura_normalizada where acesso_ativo
union all
select 'inadimplentes',          count(*)::text from adm.assinatura_normalizada
                                  where inadimplente
union all
select 'propriedades que ja lancaram', count(*)::text from adm.atividade_propriedade
union all
select 'ativas nos ultimos 30d', count(*)::text from adm.atividade_propriedade
                                  where lancamentos_30d > 0
union all
select 'silenciosas ha +30d',    count(*)::text from adm.atividade_propriedade
                                  where ultimo_lancamento_em < now() - interval '30 days'
union all
select 'donos com assinatura duplicada', count(*)::text from adm.assinatura_normalizada
                                  where total_assinaturas_do_dono > 1;


-- ############################################################################
-- BLOCO 5 -- CONTRATO DA FASE 2. As dez views declaradas em VIEWS_FASE_2
-- (src/lib/adm/areas/contrato.ts) existem, com ESTE nome exato, e a service_role
-- le todas.
--
-- POR QUE ESTE BLOCO EXISTE, em vez de confiar no assert 3: na Fase 1 o agente
-- do SQL e o das queries escreveram em paralelo e nomearam as MESMAS views de
-- formas diferentes -- dez consumidas, seis criadas, quatro com outro nome. O
-- painel compilou, passou no lint, e so /adm/usuarios abria. Nenhum tipo pega
-- isso: o PostgREST devolve "relacao nao encontrada" em RUNTIME e o Next mostra
-- o estado vazio como se o cliente nao tivesse dados -- o pior modo de falha
-- possivel num painel, porque parece resposta.
--
-- Os dez nomes estao escritos LITERALMENTE, um por linha, para serem lidos lado
-- a lado com VIEWS_FASE_2 sem nenhuma interpretacao no meio.
--
-- ORDEM: este bloco roda depois de adm_07_areas.sql e adm_08_consultoria.sql.
-- Se voce parou no adm_06, ele falha -- e essa e a resposta certa: a partir
-- daqui a Fase 2 nao e opcional, e um painel com metade das abas mudas e pior
-- que um painel que se recusa a subir.
-- ############################################################################

do $fase2$
declare
  -- Espelho de VIEWS_FASE_2. Uma linha por view, com a interface que ela
  -- implementa ao lado -- se um nome mudar de um lado, o diff mostra os dois.
  v_esperadas text[] := array[
    'propriedade_reproducao',   -- LinhaReproducao         adm_07
    'propriedade_sanidade',     -- LinhaSanidade           adm_07
    'propriedade_crescimento',  -- LinhaCrescimento        adm_07
    'propriedade_avaliacoes',   -- LinhaAvaliacoes         adm_07
    'propriedade_financeiro',   -- LinhaFinanceiro         adm_07
    'propriedade_estrutura',    -- LinhaEstrutura          adm_07
    'propriedade_equipe',       -- LinhaEquipe             adm_07
    'criador_vitrine',          -- LinhaVitrine            adm_07
    'consultores_lista',        -- LinhaConsultor          adm_08
    'consultor_carteira'        -- LinhaCarteiraConsultor  adm_08
  ];
  v_existem int;
  v_falta   text;
  v_txt     text;
begin
  select count(*) into v_existem
    from unnest(v_esperadas) e
   where to_regclass('adm.' || e) is not null;

  select string_agg(e, ', ' order by e) into v_falta
    from unnest(v_esperadas) e
   where to_regclass('adm.' || e) is null;

  -- 24) As dez existem. As duas mensagens sao diferentes de proposito: "nenhuma"
  -- e um arquivo que faltou rodar; "algumas" e divergencia de NOME, que e o
  -- defeito que este bloco existe para pegar.
  if v_existem = 0 then
    raise exception 'FALHA 24: nenhuma das 10 views da Fase 2 existe -- '
                    'rode supabase/adm/adm_07_areas.sql e adm_08_consultoria.sql';
  elsif v_falta is not null then
    raise exception 'FALHA 24: view(s) da Fase 2 ausente(s) em adm: % -- '
                    'confira o nome CARACTERE A CARACTERE contra VIEWS_FASE_2 em '
                    'src/lib/adm/areas/contrato.ts. Foi exatamente esta divergencia '
                    'que deixou 4 abas abrindo vazias na Fase 1.', v_falta;
  end if;

  -- 25) A service_role LE as dez. Sem o grant, a aba abre, nao da erro, e mostra
  -- estado vazio -- indistinguivel de "este cliente nao tem dados".
  select string_agg(e, ', ' order by e) into v_txt
    from unnest(v_esperadas) e
   where not has_table_privilege('service_role', ('adm.' || e)::regclass, 'SELECT');
  if v_txt is not null then
    raise exception 'FALHA 25: service_role sem SELECT em view(s) da Fase 2: % -- '
                    'falta o `grant select ... to service_role` depois do create', v_txt;
  end if;

  -- 26) Cada uma mantem a sua COLUNA DE ANCORA, que e por onde o painel filtra.
  -- Uma view que perdeu a ancora nao da erro: o filtro `?propriedade_id=eq.238`
  -- vira PGRST100 ou, pior, some no ruido e a tela agrega a base inteira.
  -- As oito de propriedade sao ancoradas em propriedade_id; as tres de pessoa
  -- (vitrine e consultoria) em usuario_id -- consultor_carteira carrega as duas.
  select string_agg(x.v || ' (falta ' || x.col || ')', ', ' order by x.v) into v_txt
    from (values
      ('propriedade_reproducao',  'propriedade_id'),
      ('propriedade_sanidade',    'propriedade_id'),
      ('propriedade_crescimento', 'propriedade_id'),
      ('propriedade_avaliacoes',  'propriedade_id'),
      ('propriedade_financeiro',  'propriedade_id'),
      ('propriedade_estrutura',   'propriedade_id'),
      ('propriedade_equipe',      'propriedade_id'),
      ('criador_vitrine',         'usuario_id'),
      ('consultores_lista',       'usuario_id'),
      ('consultor_carteira',      'usuario_id'),
      ('consultor_carteira',      'propriedade_id')
    ) as x(v, col)
   where not exists (
     select 1 from information_schema.columns c
      where c.table_schema = 'adm'
        and c.table_name   = x.v
        and c.column_name  = x.col
   );
  if v_txt is not null then
    raise exception 'FALHA 26: view(s) da Fase 2 sem a coluna de ancora: %', v_txt;
  end if;

  raise notice 'BLOCO 5 (contrato da Fase 2): 10 views presentes, com ancora e grant -- 3 asserts OK';
end
$fase2$;


-- ############################################################################
-- BLOCO 6 -- CONTRATO DA FASE 3. As quatro views declaradas em VIEWS_FASE_3
-- (src/lib/adm/areas/contrato.ts) existem, com ESTE nome exato, e a service_role
-- le todas.
--
-- Mesma razao de ser do Bloco 5, e por isso a mesma forma: nome de view e nome
-- de coluna sao declarados no contrato, o SQL implementa, e a divergencia tem de
-- quebrar AQUI -- na migration, onde da para consertar -- e nao na tela, onde
-- ela se disfarca de "a carteira nao tem dados".
--
-- ORDEM: este bloco roda depois de supabase/adm/adm_09_carteira_fase3.sql, que
-- e o arquivo que cria as quatro. O cabecalho deste arquivo lista a ordem dos
-- demais; some a ele o adm_09, imediatamente antes desta verificacao.
--
-- Os quatro nomes estao escritos LITERALMENTE, um por linha, para serem lidos
-- lado a lado com VIEWS_FASE_3 sem nenhuma interpretacao no meio.
-- ############################################################################

do $fase3$
declare
  -- Espelho de VIEWS_FASE_3. Uma linha por view, com a interface que ela
  -- implementa ao lado -- se um nome mudar de um lado, o diff mostra os dois.
  v_esperadas text[] := array[
    'coorte_retencao',        -- LinhaCoorte                 adm_09
    'benchmark_referencia',   -- LinhaBenchmarkReferencia    adm_09
    'benchmark_propriedade',  -- LinhaBenchmarkPropriedade   adm_09
    'cobrancas_lista'         -- LinhaCobranca               adm_09
  ];
  -- Espelho de METRICAS_BENCHMARK. Lista FECHADA de proposito: cada metrica
  -- exigiu uma decisao de denominador, janela e unidade, e a tela so sabe
  -- rotular e orientar (maior e melhor?) o que esta em BENCHMARK_INFO.
  v_metricas text[] := array[
    'producao_por_lactante_dia',
    'custo_litro',
    'taxa_prenhez',
    'gmd_medio',
    'taxa_mortalidade',
    'intervalo_partos_dias'
  ];
  v_existem int;
  v_falta   text;
  v_txt     text;
begin
  select count(*) into v_existem
    from unnest(v_esperadas) e
   where to_regclass('adm.' || e) is not null;

  select string_agg(e, ', ' order by e) into v_falta
    from unnest(v_esperadas) e
   where to_regclass('adm.' || e) is null;

  -- 27) As quatro existem. As duas mensagens sao diferentes de proposito:
  -- "nenhuma" e um arquivo que faltou rodar; "algumas" e divergencia de NOME,
  -- que e o defeito que este bloco existe para pegar.
  if v_existem = 0 then
    raise exception 'FALHA 27: nenhuma das 4 views da Fase 3 existe -- '
                    'rode supabase/adm/adm_09_carteira_fase3.sql';
  elsif v_falta is not null then
    raise exception 'FALHA 27: view(s) da Fase 3 ausente(s) em adm: % -- '
                    'confira o nome CARACTERE A CARACTERE contra VIEWS_FASE_3 em '
                    'src/lib/adm/areas/contrato.ts.', v_falta;
  end if;

  -- 28) A service_role LE as quatro. Sem o grant, a tela abre, nao da erro, e
  -- mostra estado vazio -- indistinguivel de "esta carteira nao tem dados".
  select string_agg(e, ', ' order by e) into v_txt
    from unnest(v_esperadas) e
   where not has_table_privilege('service_role', ('adm.' || e)::regclass, 'SELECT');
  if v_txt is not null then
    raise exception 'FALHA 28: service_role sem SELECT em view(s) da Fase 3: % -- '
                    'falta o `grant select ... to service_role` depois do create', v_txt;
  end if;

  -- 29) Cada uma mantem as COLUNAS DE ANCORA por onde a tela filtra e monta a
  -- matriz. Uma coluna renomeada nao da erro no PostgREST: o campo some do JSON
  -- e o TypeScript le `undefined`, que na tela vira 0 -- "0% de retencao" para
  -- uma coorte inteira, ou um benchmark comparando a propriedade com ela mesma.
  select string_agg(x.v || ' (falta ' || x.col || ')', ', ' order by x.v, x.col) into v_txt
    from (values
      ('coorte_retencao',       'coorte'),
      ('coorte_retencao',       'mes'),
      ('benchmark_referencia',  'segmento'),
      ('benchmark_referencia',  'metrica'),
      ('benchmark_referencia',  'n'),
      ('benchmark_propriedade', 'propriedade_id'),
      ('benchmark_propriedade', 'segmento'),
      ('benchmark_propriedade', 'metrica'),
      ('cobrancas_lista',       'pagamento_id'),
      ('cobrancas_lista',       'usuario_id')
    ) as x(v, col)
   where not exists (
     select 1 from information_schema.columns c
      where c.table_schema = 'adm'
        and c.table_name   = x.v
        and c.column_name  = x.col
   );
  if v_txt is not null then
    raise exception 'FALHA 29: view(s) da Fase 3 sem coluna de ancora: %', v_txt;
  end if;

  -- 30) O VOCABULARIO DE METRICAS E FECHADO. As duas views de benchmark so podem
  -- emitir os seis nomes de METRICAS_BENCHMARK: um nome a mais chega na tela sem
  -- rotulo, sem unidade e sem saber se maior e melhor -- e apareceria como uma
  -- linha muda no comparativo em vez de um erro.
  -- ⚠️ Passa por vacuo com a base vazia (nenhuma propriedade com segmento
  -- cadastrado): sem linha, nao ha nome errado a encontrar. O Bloco 7 abaixo
  -- mostra o tamanho real da amostra, que e onde esse caso aparece.
  -- Efeito colateral valioso: `create view` NAO executa o corpo da view, entao
  -- este assert e o Bloco 7 sao o primeiro lugar em que as quatro views da Fase 3
  -- realmente RODAM -- e o unico que pega um erro de tipo que so aparece em
  -- execucao. Ele varre as cinco views de area para toda a carteira: leva
  -- segundos, e e o preco de descobrir isso aqui em vez de na tela.
  select string_agg(distinct b.metrica, ', ') into v_txt
    from adm.benchmark_propriedade b
   where not (b.metrica = any(v_metricas));
  if v_txt is not null then
    raise exception 'FALHA 30: adm.benchmark_propriedade emite metrica fora de '
                    'METRICAS_BENCHMARK: % -- acrescentar metrica e trabalho de '
                    'produto (contrato + BENCHMARK_INFO + SQL), nao so de SQL.', v_txt;
  end if;

  select string_agg(distinct r.metrica, ', ') into v_txt
    from adm.benchmark_referencia r
   where not (r.metrica = any(v_metricas));
  if v_txt is not null then
    raise exception 'FALHA 30: adm.benchmark_referencia emite metrica fora de '
                    'METRICAS_BENCHMARK: %', v_txt;
  end if;

  raise notice 'BLOCO 6 (contrato da Fase 3): 4 views presentes, com ancora, grant e '
               'vocabulario fechado de metricas -- 4 asserts OK';
end
$fase3$;


-- ############################################################################
-- BLOCO 7 -- RETRATO DA FASE 3. Nao assere nada: mostra o tamanho da amostra e
-- as pontas da carteira, para voce conferir ANTES de a tela afirmar qualquer
-- coisa a um cliente.
--
-- A linha que mais importa e "segmentos com base >= 7": MINIMO_BENCHMARK e 7, e
-- abaixo disso a tela ESCONDE a comparacao. Se este numero vier 0, o benchmark
-- existe, funciona, e nao vai aparecer em lugar nenhum -- e isso e uma
-- descoberta a fazer aqui, nao na frente do criador.
-- ############################################################################

select 'coortes de cadastro'                as metrica, count(distinct coorte)::text as valor
  from adm.coorte_retencao
union all
select 'contas na maior coorte',
       coalesce(max(tamanho) filter (where mes = 0), 0)::text
  from adm.coorte_retencao
union all
select 'retencao no mes 6 (media das coortes que ja chegaram la)',
       coalesce(to_char(avg(retencao) filter (where mes = 6) * 100, 'FM990D0') || '%', 'sem coorte com 6 meses')
  from adm.coorte_retencao
union all
select 'propriedades no benchmark',         count(distinct propriedade_id)::text
  from adm.benchmark_propriedade
union all
select 'segmentos com regua',               count(distinct segmento)::text
  from adm.benchmark_referencia
union all
select 'segmentos x metricas com base >= 7 (MINIMO_BENCHMARK)', count(*)::text
  from adm.benchmark_referencia where n >= 7
union all
select 'metricas sem NENHUMA propriedade medida', count(*)::text
  from adm.benchmark_referencia where n = 0
union all
select 'cobrancas registradas',             count(*)::text from adm.cobrancas_lista
union all
select 'cobrancas inadimplentes',           count(*)::text
  from adm.cobrancas_lista where inadimplente
union all
select 'maior atraso em aberto (dias)',     coalesce(max(dias_de_atraso)::text, '-')
  from adm.cobrancas_lista;
