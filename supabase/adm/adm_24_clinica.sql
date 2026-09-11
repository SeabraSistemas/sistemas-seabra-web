-- ═════════════════════════════════════════════════════════════════════════════
-- adm_24_clinica.sql — o caso clinico, e o desfecho dele
--
-- Implementa a interface declarada em src/lib/adm/areas/contrato.ts:
--
--   adm.clinica_detalhe  ->  LinhaCaso
--
-- O QUE ESTA VIEW ACRESCENTA e o DESFECHO. `clinica` sozinha diz que o animal
-- adoeceu; ela nao diz o que aconteceu depois. Cruzando com `obito`: 81 dos 243
-- casos da base (33%) sao de animais que morreram DEPOIS do caso.
--
-- ⚠️ ISSO NAO E CAUSA, E SEQUENCIA. A view entrega `dias_ate_obito` e quem le
-- decide -- o TypeScript so trata como desfecho provavel o obito que vem dentro
-- de uma janela curta (60 dias), e a tela diz "morreu em ate 60 dias do caso",
-- nunca "morreu disso". Um animal que teve diarreia em 2021 e morreu em 2026 nao
-- e letalidade de diarreia.
--
-- `suspeita_id` aponta para o catalogo `suspeitas`, que tem `tipo`:
--   'sistema'     -> suspeita que o app ja traz (Diarreia, Pneumonia, Mastite...)
--   'propriedade' -> suspeita que aquele criador criou
-- A distincao vai para a tela: suspeita propria e vocabulario do cliente, e
-- misturar as duas num ranking esconde que uma delas so existe naquela fazenda.
--
-- ⚠️ `tratamento` ESTA PREENCHIDO EM 15 DAS 243 LINHAS (6%). A view expoe, mas
-- qualquer leitura sobre tratamento fala de 6% dos casos -- e a tela imprime esse
-- denominador em vez de somar uma coluna quase vazia.
--
-- ⚠️ A FONTE E `clinica`, NAO `historico_clinico`. Parece o contrario pelo nome,
-- e nao e. O trigger `registrar_caso_clinico` copia cada INSERT de `clinica` para
-- `historico_clinico`, e nada mais escreve la: edicao nao chega, exclusao nao
-- chega. O historico que o app mostra ao produtor (`view_historico_clinico`) e
-- montado em cima de `clinica`, e excluir um caso no app apaga dele. As 102
-- linhas que so existem em `historico_clinico` (48 delas de uma fazenda, todas
-- criadas no mesmo dia) sao, portanto, casos APAGADOS -- soma-las aqui
-- ressuscitaria lancamento que o produtor removeu.
--
-- Rodar DEPOIS de adm_01. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.clinica_detalhe as
select
  c.propriedade_id,
  c.id                                          as caso_id,
  c.animal_id,
  r.numero_animal,
  r.nome_animal,
  r.sexo,
  coalesce(cat."Label", cat.nome)               as categoria,
  c.data_do_caso,

  s.suspeita,
  -- 'sistema' | 'propriedade' -- ver a nota do cabecalho.
  s.tipo                                        as suspeita_tipo,

  c.sinais,
  c.tratamento,

  -- O PRIMEIRO obito daquele animal APOS o caso, e a distancia em dias. NULL
  -- quando o animal esta vivo -- que e o desfecho bom e o mais comum.
  ob.data_obito,
  case when ob.data_obito is not null
       then (ob.data_obito - c.data_do_caso)::int
  end                                           as dias_ate_obito

from public.clinica c
join public.rebanho r                 on r.id = c.animal_id
left join public.categoria_animal cat on cat.id = r.categoria
left join public.suspeitas s          on s.id = c.suspeita_id
left join lateral (
  -- `obito` tem UNIQUE em animal_id, entao ha no maximo um; o filtro de data
  -- garante que so conta o obito POSTERIOR ao caso.
  select o.data_obito
    from public.obito o
   where o.animal_id = c.animal_id
     and o.data_obito >= c.data_do_caso
   limit 1
) ob on true
where c.data_do_caso is not null;

comment on view adm.clinica_detalhe is
  'Um caso clinico por linha, com a suspeita do catalogo e o obito POSTERIOR ao caso, quando houve. '
  'dias_ate_obito e SEQUENCIA, nao causa -- quem decide a janela e o consumidor. '
  'Filtrar SEMPRE por propriedade_id.';

revoke all on adm.clinica_detalhe from public;
revoke all on adm.clinica_detalhe from anon, authenticated;
grant select on adm.clinica_detalhe to service_role;
