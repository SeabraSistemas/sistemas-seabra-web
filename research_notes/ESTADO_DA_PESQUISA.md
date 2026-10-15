# Estado da pesquisa: Central de Melhoramento Seabra

**Pausado em 15/10/2026, a pedido do usuário. Retomar a partir da seção "Como retomar".**

## Visão
Montar uma **central de modelos e conteúdo para melhoramento genético**, aplicada conforme a demanda de cada cliente:
- **Associações (N grande):** avaliação genética de população, sumários, índices.
- **Produtores médios e grandes (N menor):** análises dentro do rebanho, metas por categoria e conexão com programas.

A central também terá um **ambiente de teste dos modelos**, o laboratório. Os modelos são validados ali antes de serem levados aos apps (SeabraApp: Flutter + Supabase). A página da central é um Artifact publicado a partir de `central-melhoramento/index.html`: https://claude.ai/artifact/BQpgXroEwwnREhz2XbuiR9. Para atualizá-la de outra conversa, use esse link como `url`.

## Segmentos

| Segmento | Situação | Arquivos |
|---|---|---|
| Bovinos de corte | Relatório v1 pronto (cerca de 13 mil palavras, exemplos conferidos em numpy). Verificação com texto completo **pausada** | `reports/Avaliação genética de bovinos de corte.md`; notas em `research_notes/Avaliação genética de bovinos de corte/` |
| Bovinos leiteiros | Relatório v1 pronto (cerca de 18,6 mil palavras, exemplos conferidos em numpy). Verificação com texto completo **pausada** | `reports/Avaliação genética de bovinos leiteiros.md`; notas em `research_notes/Avaliação genética de bovinos leiteiros/` |
| Caprinos leiteiros | Próximo. Captação já com texto completo desde o início | — |
| Ovinos leiteiros | Planejado | — |

## O que já foi feito
1. Captação em Haiku (6 frentes por segmento) e síntese em Opus, com a skill deep-research, para corte e para leite bovino.
2. A rede do ambiente "Default" foi trocada de **Confiável** para **Completo** em 15/10/2026. Resultado: OpenAlex, Crossref, Europe PMC, PMC, SciELO e Embrapa respondem. O journalofdairyscience.org bloqueia robôs (403); a alternativa é usar cópias no PMC e no USDA-AIPL. A ferramenta WebFetch ainda falha por DNS, então o caminho é `curl` ou Python.
3. Lista de artigos pagos essenciais, com DOIs conferidos no Crossref: `research_notes/Verificação de fontes/artigos_para_obter.md`. O usuário vai baixá-los pelo acesso UFF/CAPES e anexá-los na conversa.
4. Três frentes de verificação (em Sonnet) foram iniciadas e **interrompidas logo no começo, sem resultado salvo**: verificar o corte, verificar o leite e aprofundar o corte. Elas precisam ser reiniciadas.

## Equipe de IA (modelos por fase)

| Fase | Modelo | Como |
|---|---|---|
| Captação de documentos | Haiku 5.5 | 6 subagentes general-purpose em paralelo (skill `anthropic-skills:deep-research`) |
| Verificação e leitura de texto completo | Sonnet 5.5 | Subagentes com `curl`/Python, leitura de PDF pela ferramenta Read |
| Síntese, correções e exemplos numéricos | Opus 5.5 | Sessão principal e subagente redator |
| Revisão independente (opcional) | Fable 5.1 | Subagente revisor |
| Escala maior (opcional) | Workflow multiagente | Só quando o usuário pedir: "use um workflow" |

Skills úteis:
- `anthropic-skills:deep-research`
- `dataviz` (tendência genética, acurácia × número de filhos)
- `anthropic-skills:docx` / `anthropic-skills:pdf` (exportar relatórios)
- `artifact-design` / `artifact-capabilities` (central e laboratório)
- `data:statistical-analysis`

## Como retomar (ordem)
1. Abrir a sessão "Modelos estatísticos" e escrever "retomar a pesquisa".
2. Testar a rede. Se estiver bloqueada, conferir se o ambiente "Default" continua em **Completo**.
3. Reiniciar as três frentes de verificação em Sonnet. As saídas vão para `research_notes/Verificação de fontes/`:
   - `verificacao_corte.md`
   - `verificacao_leite.md`
   - `aprofundamento_corte.md`
4. Ler os PDFs pagos que o usuário anexar e conferir as equações de Henderson, Quaas, Willham, Gilmour, Wood, Wilmink, Ali & Schaeffer, Ptak & Schaeffer e Schaeffer 2004.
5. Aplicar as correções nos dois relatórios (Opus), trocando os [não verificado] pelo que for confirmado. Correção já conhecida: a meta-análise "Oliveira et al. 2018" é de **Rojas de Oliveira et al.** (online em 2017; *Anim. Prod. Sci.* 58:1575, DOI 10.1071/AN16712).
6. Caprinocultura leiteira: captação com texto completo (Haiku/Sonnet), depois síntese (Opus).
7. Ovinocultura leiteira, no mesmo fluxo.
8. Laboratório: calculadoras interativas na central (MPPA, REL a partir de DE, acurácia BIF, Ne/ΔF, intervalos de taxas, índice de touros). Depois, o motor de BLUP intra-rebanho testado com dados anonimizados do SeabraApp.
9. Ao terminar a pesquisa, voltar a rede do ambiente "Default" para **Confiável**.

## Observações
- A sessão na nuvem não depende do Mac ligado. Ela continua mesmo com o computador desligado.
- Não usar Sci-Hub nem fontes não autorizadas. Artigos pagos só pelo acesso institucional do usuário.
- A sessão extra "Verificação de fontes e artigos pagos" ficou pausada e não é usada.
