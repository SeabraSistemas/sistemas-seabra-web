# Estado da pesquisa: Central de Melhoramento Seabra

**Atualizado em 15/10/2026.** Central publicada: https://claude.ai/artifact/BQpgXroEwwnREhz2XbuiR9. A página vem de `central-melhoramento/index.html`; para atualizá-la a partir de outra conversa, passe esse link como `url`.

## Visão
Montar uma **central de modelos e conteúdo para melhoramento genético**, aplicada conforme a demanda:
- **Associações (N grande):** avaliação da população, sumários, índices.
- **Produtores médios e grandes (N menor):** análises dentro do rebanho, metas por categoria e conexão com programas.

A central também terá um **laboratório de testes dos modelos**. Os modelos são validados ali antes de irem para os apps (SeabraApp: Flutter + Supabase).

## Segmentos

| Segmento | Situação | Arquivos |
|---|---|---|
| Bovinos de corte | **v2**, cerca de 23,6 mil palavras. Verificação com texto completo: 135 itens (78 confirmados, 26 corrigidos, 24 não confirmados, 7 pagos). Inclui o aprofundamento: ANCP 2023–2026, MGTe atual, Possible Change, idade da vaca, Interbeef | `reports/Avaliação genética de bovinos de corte.md`; `research_notes/Verificação de fontes/verificacao_corte.md`; `research_notes/Verificação de fontes/aprofundamento_corte.md` |
| Bovinos leiteiros | **v2**, cerca de 25,7 mil palavras. Verificação: 123 itens (65 confirmados, 36 corrigidos, 17 não confirmados, 5 pagos) | `reports/Avaliação genética de bovinos leiteiros.md`; `research_notes/Verificação de fontes/verificacao_leite.md` |
| Caprinos leiteiros | **v2**, cerca de 27,4 mil palavras. Verificação: 249 itens (194 confirmados, 40 corrigidos, 9 não confirmados, 6 pagos). 8 exemplos em numpy, metas por categoria, dados para o SeabraApp | `reports/Avaliação genética de caprinos leiteiros.md`; `research_notes/Verificação de fontes/verificacao_caprinos.md`; notas em `research_notes/Avaliação genética de caprinos leiteiros/` |
| Ovinos leiteiros | **v2**, cerca de 33 mil palavras. Verificação: 290 itens (232 confirmados, 31 corrigidos, 24 não confirmados, 3 pagos). 8 exemplos em numpy, com sensibilidade no Exemplo 8. Conflitos abertos: Ne da Lacaune (370 × 188), 5,4 L/ano da brochura, superioridade do ISOL (0,62 × 0,51 desvio) | `reports/Avaliação genética de ovinos leiteiros.md`; `research_notes/Verificação de fontes/verificacao_ovinos.md`; notas em `research_notes/Avaliação genética de ovinos leiteiros/` |
| Guia de aplicação | Cerca de 12 mil palavras de texto. Triagem, pacotes por nível (0 a 3), parâmetros por espécie, dados mínimos para o SeabraApp, caminho do laboratório ao app, mensagens ao cliente e 4 atendimentos fictícios calculados com o motor. 13 pontos "a definir" na seção 9.2 | `reports/Guia de aplicação por demanda.md` |

## Laboratório
| Peça | Situação | Onde |
|---|---|---|
| Motor em Python | 8 módulos, 110 testes, 128 vetores de teste | `central-melhoramento/laboratorio/` (`python3 -m unittest discover -s tests`) |
| Calculadoras da central | 8 calculadoras em JavaScript; 120 vetores e 112 números dos relatórios conferidos | `central-melhoramento/lab/` (`node lab/testar_calculadoras.mjs`) |

## Equipe de IA (modelos por fase)

| Fase | Modelo |
|---|---|
| Captação de documentos (6 subagentes por segmento, skill deep-research) | Haiku 5.5 |
| Verificação e leitura de texto completo | Sonnet 5.5 |
| Síntese, correções e exemplos numéricos | Opus 5.5 |
| Revisão independente (opcional) | Fable 5.1 |
| Escala maior (opcional, só quando pedida: "use um workflow") | Workflow multiagente |

## Ambiente
- Rede do ambiente "Default" em **Completo** desde 15/10/2026. Volte para **Confiável** ao terminar a pesquisa.
- OpenAlex devolve 429 sem chave. Use Crossref, Europe PMC, PMC, SciELO, HAL e Embrapa.
- A ferramenta WebFetch falha por DNS; use `curl`/Python.
- Os PDFs de artigos do journalofdairyscience.org (que bloqueia robôs) estão espelhados em `queries.uscdcb.com/publish/jds/<ano>/<vol>_<pág>.pdf`.
- O site da ANCP exige completar a cadeia de certificados (intermediárias da Let's Encrypt), sem desligar o TLS.
- Não usar Sci-Hub nem fontes não autorizadas. Artigos pagos só pelo acesso institucional do usuário (UFF/CAPES): lista em `research_notes/Verificação de fontes/artigos_para_obter.md`.

## Próximos passos
1. Documentos bloqueados para robôs, que o usuário pode anexar: fórmula oficial do ISOL (Idele/Lacaune), catálogos Latxa (ASLANA), relatório MAPA/INIA de ovinos de leite, PDFs da HAL citados nas notas de ovinos e os 9 artigos de ovinos abertos mas bloqueados (lista em `artigos_para_obter.md`).
2. Ler os PDFs pagos que o usuário anexar e confirmar as equações clássicas (Henderson, Quaas, Willham, Gilmour, Wood, Wilmink, Ali & Schaeffer, Ptak & Schaeffer, Schaeffer 2004).
3. Decidir com a equipe os 13 pontos "a definir" do guia (seção 9.2).
4. Laboratório: rodar o motor com dados anonimizados do SeabraApp e começar a porta em Dart pela ordem da seção 6.5 do guia.
5. Ao final, voltar a rede para **Confiável**.
