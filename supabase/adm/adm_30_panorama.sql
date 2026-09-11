-- ═════════════════════════════════════════════════════════════════════════════
-- adm_30_panorama.sql — o PANORAMA da base: onde estao os clientes e quanto pesam
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.propriedade_panorama  ->  LinhaPanorama
--
-- A carteira (adm_06) responde "quanto isto vale e para quem eu ligo". Esta
-- view responde a pergunta geografica e de concentracao: em que estados e
-- cidades estao as fazendas, quantos animais e quanto MRR cada lugar carrega,
-- e quanto da base esta nas maos de poucas propriedades.
--
-- REUSAR, NAO RECALCULAR (regra do adm_10): animais, lactantes, atividade,
-- plano e acesso vem de adm.propriedades_lista, que ja e a mesma fonte da tela
-- de propriedades. Aqui entram so quatro coisas novas:
--
--   1. A UF RESOLVIDA. `propriedades.estado` esta vazio em 13 das 34 fazendas.
--      Antes de desistir, a view tenta o CEP da fazenda (a faixa do CEP e
--      determinada por UF), depois o estado do dono, depois o CEP do dono.
--      `uf_origem` diz de onde veio -- e a tela lista as que sobraram para o
--      cadastro ser corrigido, em vez de somar 38% da base em "Sem estado".
--
--   2. O MRR ATRIBUIDO A FAZENDA. A assinatura e do produtor, nao da fazenda;
--      um produtor com duas fazendas (o da 212/220) pagaria duas vezes se cada
--      uma somasse o valor. O MRR vai para a fazenda PRINCIPAL do dono
--      (usuarios.propriedade_id) e a outra recebe zero, com `mrr_atribuido`
--      dizendo qual e qual.
--
--   3. `teste`: fazenda de tester/demo ou com "teste"/"fixture" no nome. A 214
--      ("Seabra", do tester) tem 1.397 animais -- 21% da base -- e nao e cliente.
--      A tela exclui por padrao e diz quantas excluiu.
--
--   4. `producao_30d` e `femeas`, de adm.propriedade_visao_geral, que a lista
--      nao expoe.
--
-- Rodar DEPOIS de adm_01 e adm_10. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

-- As faixas de CEP por UF (Correios). Fonte unica desta regra no painel.
create or replace function adm.uf_por_cep(p_cep text)
returns text
language sql
immutable
as $$
  select case
    when n is null then null
    when n between 1000 and 19999 then 'SP'
    when n between 20000 and 28999 then 'RJ'
    when n between 29000 and 29999 then 'ES'
    when n between 30000 and 39999 then 'MG'
    when n between 40000 and 48999 then 'BA'
    when n between 49000 and 49999 then 'SE'
    when n between 50000 and 56999 then 'PE'
    when n between 57000 and 57999 then 'AL'
    when n between 58000 and 58999 then 'PB'
    when n between 59000 and 59999 then 'RN'
    when n between 60000 and 63999 then 'CE'
    when n between 64000 and 64999 then 'PI'
    when n between 65000 and 65999 then 'MA'
    when n between 66000 and 68899 then 'PA'
    when n between 68900 and 68999 then 'AP'
    when n between 69000 and 69299 then 'AM'
    when n between 69300 and 69399 then 'RR'
    when n between 69400 and 69899 then 'AM'
    when n between 69900 and 69999 then 'AC'
    when n between 70000 and 72799 then 'DF'
    when n between 72800 and 72999 then 'GO'
    when n between 73000 and 73699 then 'DF'
    when n between 73700 and 76799 then 'GO'
    when n between 76800 and 76999 then 'RO'
    when n between 77000 and 77999 then 'TO'
    when n between 78000 and 78899 then 'MT'
    when n between 79000 and 79999 then 'MS'
    when n between 80000 and 87999 then 'PR'
    when n between 88000 and 89999 then 'SC'
    when n between 90000 and 99999 then 'RS'
  end
  from (
    select case when length(regexp_replace(coalesce(p_cep, ''), '\D', '', 'g')) = 8
                then left(regexp_replace(p_cep, '\D', '', 'g'), 5)::int end as n
  ) x;
$$;

create or replace view adm.propriedade_panorama as
with base as (
  select
    pl.*,
    p.latitude,
    p.longitude,
    p.cep,
    p.produtor_id                                    as dono_id,
    u.is_tester,
    u.is_demo,
    u.propriedade_id                                 as principal_do_dono,
    nullif(upper(btrim(p.estado)), '')               as uf_cadastro,
    adm.uf_por_cep(p.cep)                            as uf_cep,
    nullif(upper(btrim(u.estado)), '')               as uf_dono,
    adm.uf_por_cep(u.cep)                            as uf_cep_dono
  from adm.propriedades_lista pl
  join public.propriedades p on p.id = pl.id
  left join public.usuarios u on u.id = p.produtor_id
)
select
  b.id,
  b.nome,
  b.cidade,
  b.segmentos,
  -- O primeiro segmento do array e o "principal" -- e o que o app mostra
  -- primeiro, e a unica escolha que nao inventa um criterio novo.
  b.segmentos[1]                                     as segmento_principal,
  b.produtor_id,
  b.produtor_nome,

  coalesce(b.uf_cadastro, b.uf_cep, b.uf_dono, b.uf_cep_dono) as uf,
  case when b.uf_cadastro is not null then 'cadastro'
       when b.uf_cep      is not null then 'cep'
       when b.uf_dono     is not null then 'dono'
       when b.uf_cep_dono is not null then 'cep_dono' end     as uf_origem,
  b.latitude,
  b.longitude,

  b.animais_ativos,
  vg.femeas,
  b.lactantes,
  vg.producao_30d,

  b.lancamentos_30d,
  b.dias_sem_lancar,
  b.acesso_ativo,
  b.plano_nome,
  b.status_efetivo,

  -- Ver a nota 2 do cabecalho.
  case when b.acesso_ativo and (b.principal_do_dono is null or b.principal_do_dono = b.id)
       then coalesce(asn.valor_real_mensal, 0) else 0 end     as mrr_mensal,
  (b.acesso_ativo and (b.principal_do_dono is null or b.principal_do_dono = b.id)) as mrr_atribuido,

  (coalesce(b.is_tester, false) or coalesce(b.is_demo, false)
     or b.nome ilike '%teste%' or b.nome ilike '%fixture%')  as teste

from base b
left join adm.propriedade_visao_geral vg on vg.propriedade_id = b.id
-- A assinatura vigente do dono: a mesma view que da plano e acesso a lista.
left join lateral (
  select a.valor_real_mensal
    from adm.assinatura_normalizada a
   where a.usuario_id = b.dono_id and a.acesso_ativo
   order by a.valor_real_mensal desc nulls last
   limit 1
) asn on true;

comment on view adm.propriedade_panorama is
  'Uma propriedade por linha com a UF resolvida (cadastro > CEP > dono > CEP do dono), o MRR '
  'atribuido a fazenda principal do dono e a marca de teste. Numeros de rebanho e atividade vem '
  'de adm.propriedades_lista -- nunca recalculados aqui.';

-- A funcao roda dentro da view: quem le a view precisa poder executa-la.
revoke all on function adm.uf_por_cep(text) from public;
grant execute on function adm.uf_por_cep(text) to service_role;
revoke all on adm.propriedade_panorama from public;
revoke all on adm.propriedade_panorama from anon, authenticated;
grant select on adm.propriedade_panorama to service_role;
