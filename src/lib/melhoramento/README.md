# Módulo interno de melhoramento genético

Biblioteca pura (sem Next, sem banco) que o painel `/adm` usa para diagnosticar os dados, rodar e validar modelos de melhoramento sobre o rebanho de cada fazenda. É análise **interna, não validada**: nada daqui chega ao app nem a cliente. O painel só lê; quem grava rodadas é o script de linha de comando abaixo, rodado à mão.

## Telas

- `/adm/melhoramento?esp=caprino|ovino|bovino_corte` — visão entre fazendas: diagnóstico e validação de cada fazenda, resumo entre fazendas (só com 7+ fazendas), conexão genética e os candidatos do cadastro único de reprodutores.
- `/adm/u/[id]/melhoramento?prop=…&esp=…` — uma fazenda: diagnóstico (com a validação do pedigree e a endogamia), validação para frente, REML, rankings e o histórico de rodadas gravadas comparado com o cálculo de agora.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `tipos.ts` | contrato de entrada, espécies, características e a configuração por espécie, com a fonte de cada parâmetro (`CONFIG_PADRAO` caprinos, `CONFIG_OVINO`) |
| `numerico.ts` | distribuições (porta do Python), álgebra densa, Gauss-Seidel e o **Cholesky esparso** (grau mínimo + inversa seletiva de Takahashi) |
| `parentesco.ts` | pedigree, A, A⁻¹; montagem de fazenda com a **validação do pedigree** (duplicado, autoparentesco, pai ausente, pai mais novo que o filho, ciclo, sexo incoerente, pai-e-mãe) e **F de Sargolzaei e Iwaisaki** sem montar A (Meuwissen e Luo ao lado, para conferência) |
| `blup.ts` | porta do `modelo_animal` e o modelo de repetibilidade esparso (o nível do efeito ambiental pode ser a mãe: `nivelPe`) |
| `reml.ts` | **AI-REML** com passo de EM, erro-padrão aproximado e o julgamento de quando a estimativa pode ser usada |
| `contemporaneas.ts`, `diagnostico.ts`, `modelos.ts`, `validacao.ts`, `analise.ts`, `resumo.ts`, `indices.ts`, `conexao.ts` | leite (caprinos e ovinos): grupos, diagnóstico, modelos, validação para frente |
| `corte.ts` | **bovinos de corte**: P210 padronizado, grupos, diagnóstico, modelo animal + ambiente comum da mãe, validação |
| `vinculos.ts` | uso dos vínculos do cadastro único (só os confirmados) e a conexão que existiria se fossem confirmados |
| `rodada.ts`, `rodada-supabase.ts` | linhas a gravar, execução de uma rodada por uma porta injetada, histórico e comparação |
| `traducao.ts` | projeções das views e linha → entrada do motor (compartilhado pelo painel e pelo script) |

## Parâmetros por espécie

| Espécie | Característica | BLUP (h², r) | MPPA (r) | Fonte |
|---|---|---|---|---|
| Caprinos | média diária e total da lactação | (0,20; 0,36), (0,30; 0,36) | 0,36; 0,44; 0,50 | relatório de caprinos (r da PL305 Saanen, Embrapa 2015) |
| Ovinos | média diária e total da lactação | (0,24; 0,41), (0,30; 0,50) | 0,41; 0,50 | relatório de ovinos: Vouraki et al. 2025; Larroque 2011 (avaliação nacional Lacaune) |
| Bovinos de corte | P210 (ABCZ, 150–270 dias) | h² 0,24 (0,15 e 0,33), c² = 0,33 − h²/4 | 0,20; 0,33; 0,51 | relatório de corte: Giannotti 2004; Souza et al. 1994; Weik et al. 2021 |

Além desses, o leite tem o modelo **BLUP com variâncias estimadas na fazenda** (AI-REML). Ele só roda quando a estimativa é usável (100+ lactações, 30+ fêmeas com 2+ lactações, convergência, h² e pe longe da fronteira, h² − 1,96·EP > 0); senão a tela diz por quê.

## SQL (supabase/melhoramento/)

| Arquivo | O que cria |
|---|---|
| `melhoramento_01_schema.sql` | schema `melhoramento` e as tabelas de rodada |
| `melhoramento_02_views.sql` | views de leitura do leite e das rodadas |
| `melhoramento_03_vinculos.sql` | `melhoramento.reprodutor_vinculo`, `melhoramento.gerar_vinculos()` e `adm.melhoramento_vinculo` |
| `melhoramento_04_corte.sql` | `adm.melhoramento_bovino_animal`, `_pesagem`, `_fazenda` |
| `melhoramento_05_gravacao.sql` | views de ESCRITA do script: `adm.melhoramento_grava_rodada`, `_resultado`, `_validacao`, `_diagnostico` |

Nada no schema `public` é criado ou alterado. `anon` e `authenticated` não enxergam nada do módulo (cada arquivo termina com asserts).

## Cadastro único de reprodutores: confirmar por SQL

Os candidatos nascem `nao_confirmado` e **nada é ligado sem confirmação humana**. No editor SQL do Supabase:

```sql
-- ver os candidatos
select id, especie, animal_a, propriedade_a, animal_b, propriedade_b, motivos, detalhe
from melhoramento.reprodutor_vinculo where confirmacao = 'nao_confirmado' order by especie, id;

-- confirmar (ou 'rejeitado'); confirmado_por e confirmado_em são obrigatórios
update melhoramento.reprodutor_vinculo
   set confirmacao = 'confirmado', confirmado_por = 'Felipe', confirmado_em = now(),
       observacao = 'mesmo RGN; conferido com o produtor'
 where id = 123;

-- desfazer
update melhoramento.reprodutor_vinculo
   set confirmacao = 'nao_confirmado', confirmado_por = null, confirmado_em = null
 where id = 123;

-- regenerar os candidatos depois de cadastros novos (preserva as confirmações)
select * from melhoramento.gerar_vinculos();
```

A página `/adm/melhoramento` passa a contar o reprodutor confirmado como um só nas duas fazendas (cache de 5 minutos).

## Guardar rodadas: `scripts/melhoramento/rodar.ts`

Lê as views `adm.melhoramento_*` com a `service_role`, roda os modelos de cada fazenda (fazendas de teste ficam de fora) e grava em `melhoramento.rodada`, `resultado_animal` (todos os animais do ranking, não só o topo), `validacao` e `diagnostico_dado`, pelas views de escrita do `melhoramento_05`. Cada rodada nasce `rodando` e só vira `concluida` depois dos resultados e da validação; a tela só mostra as concluídas.

Variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (a mesma chave do painel, nunca com prefixo `NEXT_PUBLIC_`). Na raiz do repositório:

```bash
node --env-file=.env.local --import ./scripts/testes/alias-hook.mjs \
     --conditions=react-server --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
     scripts/melhoramento/rodar.ts
# opções:
#   --especie caprino,ovino,bovino_corte   (padrão: as três)
#   --propriedade 234                       (só uma fazenda)
#   --incluir-teste                         (inclui fazendas de teste)
#   --execucao nome                         (padrão: rodar-<data ISO>)
```

O script exige Node 22.18+ (TypeScript sem compilação). Saída: uma linha por fazenda e o total de rodadas, resultados e métricas; código 1 se alguma fazenda falhou (a rodada dela fica com `status = 'erro'` e a mensagem em `observacao`). Para apagar uma execução: `delete from melhoramento.rodada where parametros->>'execucao' = '…';` (resultados e validação vão junto, em cascata).

## Testes

`npm test` roda tudo; só o módulo:

```bash
node --import ./scripts/testes/alias-hook.mjs --conditions=react-server \
     --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test 'src/lib/melhoramento/*.test.ts'
```

Os fixtures são sintéticos ou de livro (Mrode et al. 2023, Exemplos 4.1, 5.1, 5.2 e 17.7; vetores do motor Python). Nenhum dado de produtor entra no repositório.
