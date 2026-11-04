-- ═════════════════════════════════════════════════════════════════════════════
-- melhoramento_05_gravacao.sql
-- Aplicado em 04/11/2026 no projeto SeabraApp (migração "melhoramento_gravacao").
--
-- A PORTA DE ESCRITA do script de rodadas (scripts/melhoramento/rodar.ts).
--
-- O schema `melhoramento` não está — e não deve entrar — no Exposed schemas do
-- PostgREST. O script fala com o banco pela API REST com a service_role, como
-- o painel; então a escrita passa por VIEWS NOVAS no schema `adm`, simples
-- (uma tabela, sem agregação), que o Postgres torna atualizáveis sozinho: o
-- INSERT na view vira INSERT na tabela, com os defaults dela (id, criada_em).
--
--   adm.melhoramento_grava_rodada       INSERT e UPDATE só de `status` (rodando → concluida/erro)
--   adm.melhoramento_grava_resultado    INSERT
--   adm.melhoramento_grava_validacao    INSERT
--   adm.melhoramento_grava_diagnostico  INSERT
--
-- O PAINEL CONTINUA SÓ LENDO: ele lê pelas views de leitura de
-- melhoramento_02 (adm.melhoramento_rodada etc.), nunca por estas. Só a
-- service_role tem privilégio aqui; anon e authenticated não têm nada (asserts).
-- Nada no public é criado ou alterado. Idempotente.
-- ═════════════════════════════════════════════════════════════════════════════

create or replace view adm.melhoramento_grava_rodada as
select id, criada_em, especie, propriedade_id, modelo, caracteristica, parametros, versao_motor, status,
       n_animais, n_registros, resumo, observacao
from melhoramento.rodada;

comment on view adm.melhoramento_grava_rodada is
  'Melhoramento (interno): ESCRITA de melhoramento.rodada pelo script de rodadas (service_role). '
  'O painel lê por adm.melhoramento_rodada.';

revoke all on adm.melhoramento_grava_rodada from public;
revoke all on adm.melhoramento_grava_rodada from anon, authenticated;
grant select, insert on adm.melhoramento_grava_rodada to service_role;
grant update (status, observacao) on adm.melhoramento_grava_rodada to service_role;

create or replace view adm.melhoramento_grava_resultado as
select rodada_id, animal_id, propriedade_id, valor, confiabilidade, posicao, extra
from melhoramento.resultado_animal;

comment on view adm.melhoramento_grava_resultado is
  'Melhoramento (interno): ESCRITA de melhoramento.resultado_animal pelo script de rodadas (service_role).';

revoke all on adm.melhoramento_grava_resultado from public;
revoke all on adm.melhoramento_grava_resultado from anon, authenticated;
grant insert on adm.melhoramento_grava_resultado to service_role;

create or replace view adm.melhoramento_grava_validacao as
select rodada_id, metrica, valor, n, detalhe
from melhoramento.validacao;

comment on view adm.melhoramento_grava_validacao is
  'Melhoramento (interno): ESCRITA de melhoramento.validacao pelo script de rodadas (service_role).';

revoke all on adm.melhoramento_grava_validacao from public;
revoke all on adm.melhoramento_grava_validacao from anon, authenticated;
grant insert on adm.melhoramento_grava_validacao to service_role;

create or replace view adm.melhoramento_grava_diagnostico as
select id, gerado_em, especie, propriedade_id, metricas
from melhoramento.diagnostico_dado;

comment on view adm.melhoramento_grava_diagnostico is
  'Melhoramento (interno): ESCRITA de melhoramento.diagnostico_dado pelo script de rodadas (service_role).';

revoke all on adm.melhoramento_grava_diagnostico from public;
revoke all on adm.melhoramento_grava_diagnostico from anon, authenticated;
grant select, insert on adm.melhoramento_grava_diagnostico to service_role;

-- A leitura do histórico na tela filtra por fazenda e espécie e ordena por data.
create index if not exists rodada_execucao_idx on melhoramento.rodada ((parametros->>'execucao'));

do $verifica$
declare
  v text;
  papel text;
  priv text;
begin
  foreach v in array array['melhoramento_grava_rodada', 'melhoramento_grava_resultado',
                           'melhoramento_grava_validacao', 'melhoramento_grava_diagnostico'] loop
    foreach papel in array array['anon', 'authenticated'] loop
      foreach priv in array array['select', 'insert', 'update', 'delete'] loop
        if has_table_privilege(papel, 'adm.' || v, priv) then
          raise exception 'melhoramento_05: % tem % em adm.%', papel, priv, v;
        end if;
      end loop;
    end loop;
    if not has_table_privilege('service_role', 'adm.' || v, 'insert') then
      raise exception 'melhoramento_05: service_role sem insert em adm.%', v;
    end if;
  end loop;
end
$verifica$;

notify pgrst, 'reload schema';
