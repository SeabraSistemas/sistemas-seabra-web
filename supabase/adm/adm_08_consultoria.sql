-- ═════════════════════════════════════════════════════════════════════════════
-- adm_08_consultoria.sql — a visao de CONSULTORIA (/adm/consultores e /adm/c/[id])
--
-- Implementa as duas ultimas interfaces de src/lib/adm/areas/contrato.ts:
--
--   adm.consultores_lista   ->  LinhaConsultor          (uma linha por tecnico)
--   adm.consultor_carteira  ->  LinhaCarteiraConsultor  (uma linha por vinculo)
--
-- Rodar DEPOIS de adm_01 (assinatura_normalizada) e adm_02
-- (atividade_propriedade). adm_05 assere que existem e tem grant.
-- Idempotente: `drop view if exists` antes de cada `create`.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- O QUE E UM CONSULTOR NESTE BANCO (a confusao que estas views existem para
-- desfazer, confirmada na auditoria da Fase 1)
--
-- NAO EXISTE regra_de_acesso = 'consultor'. Consultor e um MODO do TECNICO,
-- e uma conta `tecnico` tem DUAS capacidades independentes:
--
--   AML/Medidas (GRATIS, a convite)  o produtor convida por `visitas_tecnicas`.
--                                    Gate: perfil_tecnico.habilitacao_aml_status.
--                                    NUNCA consulta assinatura.
--   Consultoria (PAGO, iniciativa    o tecnico cadastra as fazendas de clientes
--   dele)                            que nao usam o app. Gate: assinatura de
--                                    plano tipo='tecnico' + vinculo em
--                                    `tecnico_propriedades` com status='ativo'.
--
-- Tres consequencias que mudam o SQL:
--   1. usuarios.propriedade_id e NULL no tecnico -- a carteira dele SO existe em
--      tecnico_propriedades. Resolver o escopo pela coluna escalar da zero.
--   2. a propriedade de consultoria tem propriedades.produtor_id NULL: o dono
--      nao e um usuario do app, e o nome do cliente vive em
--      propriedades.nome_proprietario, texto livre que o tecnico preenche.
--   3. o limite de fazendas e do PLANO (planos.limite_propriedades: 1/7/15),
--      nao uma constante -- e "carteira cheia" e dinheiro na tela.
-- ═════════════════════════════════════════════════════════════════════════════

drop view if exists adm.consultores_lista;
drop view if exists adm.consultor_carteira;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. adm.consultores_lista  ->  interface LinhaConsultor
--
-- Uma linha por usuario com regra_de_acesso = 'tecnico', INCLUSIVE quem tem zero
-- vinculos: o tecnico do fluxo gratuito de AML tambem e um relacionamento da
-- Sistema Seabra, e "quem esta habilitado e nao virou consultor" e justamente a
-- lista de prospeccao. Filtrar por vinculos_ativos > 0 esconderia o funil.
--
-- `regra_de_acesso` e o papel CANONICO. tipo_usuario_id NAO entra aqui: e dado
-- sujo (em producao 1 mapeia 1:1 para admin_associacao, e o Admin Geral real tem
-- 2), e ja causou vazamento cross-tenant real.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.consultores_lista as
select
  u.id                                                       as usuario_id,
  u.nome,

  -- MASCARA EM SQL, NAO EM REACT -- mesma expressao de adm.usuarios_lista. Se a
  -- mascara fosse no componente, o valor cru ja teria viajado no payload RSC e
  -- estaria no DevTools. Usa usuarios.email (a identidade de login), e nao
  -- perfil_tecnico.email, que e um segundo cadastro que pode divergir.
  case
    when nullif(btrim(u.email), '') is null then null
    when position('@' in u.email) = 0      then left(btrim(u.email), 1) || '***'
    else left(btrim(u.email), 1) || '***@' || split_part(btrim(u.email), '@', 2)
  end                                                        as email_mascarado,

  -- perfil_tecnico e 1:1 com usuarios desde 07/2026 (indice unico
  -- perfil_tecnico_usuario_id_uniq), mas o join e LEFT: existem/existiram
  -- perfis orfaos e tecnicos sem perfil, e nenhum dos dois pode sumir da lista.
  nullif(btrim(pt.profissao), '')                            as profissao,
  nullif(btrim(pt.especialidade), '')                        as especialidade,

  -- 'nao_solicitada' | 'pendente' | 'aprovada' | 'rejeitada' (CHECK na tabela).
  -- Tecnico sem perfil nenhum fica null -- que e diferente de 'nao_solicitada':
  -- um nunca criou o perfil, o outro criou e nao pediu.
  pt.habilitacao_aml_status,

  con.vinculos_ativos,

  con.limite_propriedades,

  -- Plano, status e receita vem de adm.assinatura_normalizada, e nao de
  -- view_status_assinatura crua: e la que o MRR ja foi normalizado por ciclo
  -- (anual / 12), deduplicado por dono e limpo de cortesia. Dois numeros de
  -- receita para o mesmo tecnico seria pior que um numero incompleto.
  an.plano_nome,
  an.status_efetivo,
  an.valor_real_mensal,

  con.animais_sob_consultoria,
  con.amls_90d,
  con.medidas_90d,
  con.visitas_90d,

  -- `ativo` NULL e legado, e legado esta ATIVO. Nesta tabela `ativo` significa
  -- "visivel para os produtores" (quem mexe e o admin da associacao), NAO
  -- competencia -- competencia e habilitacao_aml_status.
  coalesce(u.ativo, true)                                    as ativo,

  -- CARTEIRA CHEIA = oportunidade de upgrade, o dado mais vendavel da tela.
  -- Sem limite conhecido nao da para estar cheia: false, nao null (o contrato
  -- pede boolean). Um tecnico sem assinatura de consultoria tem limite null e
  -- carteira_cheia false -- ele nao esta cheio, esta fora do produto.
  coalesce(con.vinculos_ativos >= con.limite_propriedades, false)
                                                             as carteira_cheia

from public.usuarios u
left join public.perfil_tecnico pt        on pt.usuario_id = u.id
left join adm.assinatura_normalizada an   on an.usuario_id = u.id

cross join lateral (
  select
    -- LIMITE DE FAZENDAS: exatamente o predicado que o RPC
    -- vincular_propriedade_cliente() usa para decidir se deixa vincular mais uma
    -- (view_status_assinatura ⋈ planos.limite_propriedades, com plano_tipo =
    -- 'tecnico' e acesso_ativo). Deliberadamente NAO derivado de
    -- adm.assinatura_normalizada: aquela view faz DISTINCT ON por dono e, se um
    -- dia um tecnico tiver tambem uma assinatura de produtor, poderia escolher a
    -- errada e zerar o limite. Aqui o limite TEM que bater com o que o app
    -- permite, senao a tela acusa carteira cheia em quem ainda pode vender.
    -- Fica no lateral, e nao no select, porque carteira_cheia precisa do mesmo
    -- valor: duas copias da subconsulta divergiriam na primeira manutencao.
    (select pl.limite_propriedades
       from public.view_status_assinatura vs
       join public.planos pl on pl.id = vs.plano_id
      where vs.usuario_id = u.id
        and vs.plano_tipo = 'tecnico'
        and vs.acesso_ativo
      -- O DESEMPATE TAMBEM E O DO RPC: `data_vencimento desc`
      -- (2026_07_09_tecnico_consultor_schema.sql:104, e o mesmo em
      -- reativar_propriedade_cliente:177-181). So importa quando ha mais de uma
      -- assinatura tecnica ativa para o mesmo usuario -- o que NAO e hipotese:
      -- `assinaturas` nao tem UNIQUE por usuario_id (adm_01:283-286), e e por
      -- isso que assinatura_normalizada existe.
      --
      -- Ordenar por maior limite parecia generoso e era pior: o painel mostraria
      -- '1 de 15' num tecnico cujo app so permite 1, e a ligacao oferecendo mais
      -- fazendas terminaria num erro LIMITE_PLANO_ATINGIDO na frente do cliente.
      -- Limite que discorda do app nao e limite, e boato.
      order by vs.data_vencimento desc
      limit 1)                                               as limite_propriedades,

    -- SO status='ativo' conta vaga. 'inativo' preserva os dados e LIBERA a vaga
    -- do plano (RPC desativar_propriedade_cliente) -- contar inativo aqui faria
    -- a tela dizer "cheia" para quem tem vaga sobrando.
    (select count(*) from public.tecnico_propriedades tp
      where tp.tecnico_id = u.id
        and tp.status = 'ativo')::int                        as vinculos_ativos,

    -- O tamanho real da responsabilidade tecnica: animais VIVOS somados sobre as
    -- fazendas com vinculo ativo. 'ativo' minusculo, data_venda nula -- as duas
    -- condicoes, porque venda registrada nem sempre mexe no status.
    (select count(*)
       from public.rebanho r
       join public.tecnico_propriedades tp on tp.propriedade_id = r.propriedade_id
      where tp.tecnico_id = u.id
        and tp.status = 'ativo'
        and r.status = 'ativo'
        and r.data_venda is null)::int                       as animais_sob_consultoria,

    -- PRODUCAO DOS 90 DIAS. Escopo: tudo que este tecnico assinou, dentro ou
    -- fora da carteira paga -- a AML a convite (fluxo gratuito) e trabalho dele
    -- do mesmo jeito, e e o sinal de que a habilitacao virou uso.
    (select count(*) from public.avaliacao_morfologica_linear a
      where a.tecnico_id = u.id
        and a.data_avaliacao >= current_date - interval '90 days')::int
                                                             as amls_90d,

    (select count(*) from public.medidas md
      where md.tecnico_id = u.id
        and md.data_medida >= current_date - interval '90 days')::int
                                                             as medidas_90d,

    -- Visita CANCELADA nao e trabalho feito e fica fora. 'solicitada' e
    -- 'agendada' ficam: numa janela de 90 dias, agenda futura tambem e sinal de
    -- atividade. data_solicitacao e NOT NULL (data_agendada nao e) -- por isso a
    -- janela e ancorada nela.
    (select count(*) from public.visitas_tecnicas vt
      where vt.tecnico_id = u.id
        and vt.data_solicitacao >= now() - interval '90 days'
        and coalesce(lower(btrim(vt.status_visita)), '') <> 'cancelada')::int
                                                             as visitas_90d
) con

where u.regra_de_acesso = 'tecnico';

comment on view adm.consultores_lista is
  'Uma linha por usuario tecnico, inclusive os de zero vinculos (o funil de prospeccao). '
  'limite_propriedades usa o MESMO predicado do RPC de vinculo (plano tipo=tecnico + acesso_ativo).';

revoke all on adm.consultores_lista from public;
revoke all on adm.consultores_lista from anon, authenticated;
grant select on adm.consultores_lista to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. adm.consultor_carteira  ->  interface LinhaCarteiraConsultor
--
-- A UNICA view da Fase 2 que devolve MUITAS linhas por ancora: e uma lista (as
-- fazendas de um tecnico), nao um cabecalho. Filtrar por usuario_id.
--
-- Le `tecnico_propriedades` direto, e nao adm.propriedades_escopo, por um motivo
-- que o escopo nao pode atender: a perna de consultoria de la filtra
-- status='ativo' (correto para "o que este usuario alcanca"), e aqui os
-- INATIVOS precisam aparecer. Vinculo inativo libera a vaga do plano mas
-- preserva os dados -- e a rotatividade da carteira e informacao comercial: um
-- tecnico que desvincula tres clientes por trimestre esta perdendo cliente, nao
-- economizando vaga.
-- ─────────────────────────────────────────────────────────────────────────────

create view adm.consultor_carteira as
select
  tp.tecnico_id                                              as usuario_id,
  tp.propriedade_id,
  p.nome_propriedade                                         as propriedade_nome,

  -- De quem sao estes dados. Mesma precedencia de adm.propriedades_escopo: o
  -- nome do usuario DONO quando ele existe; senao nome_proprietario, o texto
  -- livre que o tecnico preenche na propriedade de consultoria (produtor_id
  -- NULL). Nas fazendas cadastradas pelo tecnico, so o segundo existe.
  coalesce(nullif(btrim(dono.nome), ''), nullif(btrim(p.nome_proprietario), ''))
                                                             as nome_proprietario,
  nullif(btrim(p.estado), '')                                as estado,

  -- 'ativo' | 'inativo' (CHECK da tabela, so dois valores).
  tp.status                                                  as status_vinculo,
  tp.data_vinculo,
  coalesce(reb.animais_ativos, 0)                            as animais_ativos,

  -- D2: sinal de vida da FAZENDA, nao do tecnico -- e por propriedade que se
  -- responde "esta fazenda parou de lancar". Vem pronto de
  -- adm.atividade_propriedade, que soma as oito tabelas de trabalho diario.
  -- null = nunca lancou nada.
  ativ.ultimo_lancamento_em,

  coalesce(aml.amls_90d, 0)                                  as amls_90d

from public.tecnico_propriedades tp
join public.propriedades p                on p.id = tp.propriedade_id
left join public.usuarios dono            on dono.id = p.produtor_id
left join adm.atividade_propriedade ativ  on ativ.propriedade_id = p.id

cross join lateral (
  select count(*)::int as animais_ativos
    from public.rebanho r
   where r.propriedade_id = p.id
     and r.status = 'ativo'
     and r.data_venda is null
) reb

cross join lateral (
  -- AMLs DESTE tecnico NESTA fazenda. As duas condicoes juntas de proposito: a
  -- mesma propriedade pode ser atendida por mais de um tecnico ao longo do
  -- tempo, e a linha da carteira responde pelo trabalho de quem ela lista.
  select count(*)::int as amls_90d
    from public.avaliacao_morfologica_linear a
   where a.propriedade_id = p.id
     and a.tecnico_id = tp.tecnico_id
     and a.data_avaliacao >= current_date - interval '90 days'
) aml;

comment on view adm.consultor_carteira is
  'Lista de fazendas por tecnico (muitas linhas por usuario_id). Inclui vinculo INATIVO de proposito: '
  'inativo libera a vaga do plano mas preserva os dados, e a rotatividade e informacao comercial.';

revoke all on adm.consultor_carteira from public;
revoke all on adm.consultor_carteira from anon, authenticated;
grant select on adm.consultor_carteira to service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fecho
--
-- Mesmo reforco do adm_01 e do adm_07: nada gravavel, ninguem alem de
-- service_role lendo. Os grants individuais acima ja cobrem as duas views; este
-- bloco cobre o esquecimento futuro.
-- ─────────────────────────────────────────────────────────────────────────────

revoke all on all tables in schema adm from public;
revoke all on all tables in schema adm from anon, authenticated;
grant select on all tables in schema adm to service_role;

-- Lembrete (o mesmo do adm_07, e a pegadinha que custa uma tarde): view nova em
-- schema ja exposto so aparece no PostgREST depois de
-- Settings -> API -> Reload schema cache (ou `notify pgrst, 'reload schema'`).
