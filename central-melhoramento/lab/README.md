# Calculadoras do Laboratório

As calculadoras interativas da aba **Laboratório** da Central de Melhoramento Seabra (`../index.html`). Cada uma abre com um exemplo dos relatórios de `reports/`, marcado como exemplo, e cita o relatório e a seção de onde vem a conta. Os dados dos exemplos são fictícios, e as variâncias (h², repetibilidade, σP, σa) vêm da literatura: as calculadoras nunca as estimam com os dados do rebanho.

**O motor Python (`../laboratorio/`, pacote `melhoramento`) é a referência.** `calculadoras.js` é uma porta dele em JavaScript puro, sem dependências: cada função tem o mesmo nome, os mesmos argumentos, na mesma ordem, e devolve a mesma forma que o JSON de `vetores_teste.json`. Se uma fórmula mudar, mude primeiro o Python, regere os vetores (`python3 gerar_vetores_teste.py`) e só depois a porta.

## Arquivos

| Arquivo | O que é |
|---|---|
| `calculadoras.js` | módulo com as funções; no navegador vira `window.LabSeabra`, no Node é `require("./calculadoras.js")` |
| `testar_calculadoras.mjs` | confere a porta contra os vetores do motor Python e contra os números impressos nos relatórios |

`LabSeabra.ASSINATURAS` lista os argumentos de cada função na ordem do Python (por exemplo, `"taxas.ic_exato": ["x", "n", "confianca"]`). O teste usa essa lista para chamar as funções com os argumentos nomeados dos vetores, e ela serve de guia para a porta em Dart.

## As oito calculadoras

| Calculadora | O que faz | Exemplo com que abre | Funções |
|---|---|---|---|
| MPPA e índice da fêmea | MPPA (descarte) e EBV por índice com registros próprios e PTA ou EBV do pai (reposição), com a REL e a ordem de cada fêmea | cabras C1 a C6, caprinos, Exemplo 6 | `indices.mppa`, `indices.indice_femea` |
| Confiabilidade | REL por filhas-equivalentes com k = (4 − h²)/h² e k_d = (4 − 2h²)/h², filhas concentradas (USDA), PEV exata do modelo de touro com filhas em vários rebanhos, DE para uma REL alvo; conversão entre REL, r e acurácia BIF | bode X com 2 filhas em 15 rebanhos, caprinos, Exemplo 3 | `confiabilidade.*`, `blup.rel_exata_modelo_touro` |
| Acurácia e Possible Change | REL, r e acurácia BIF a partir da PEV (com F) ou de uma acurácia publicada; erro-padrão da DEP; PC a 68% e 95%; a leitura da mesma acurácia em outra escala | animal 4 do pedigree de corte, Passo 3; touro de P450 | `confiabilidade.rel_de_pev`, `blup.possible_change` |
| Parentesco e endogamia | matriz A de um pedigree digitado (animal, pai, mãe), F de cada animal, F de cada acasalamento planejado, reprodutor de menor F e o primeiro da lista dentro do limite; Ne, ΔF por geração e por ano, F acumulado, machos para um Ne alvo | rebanho do Exemplo 8 de caprinos | `parentesco.*` |
| Taxas do rebanho | intervalos de Wald, Wilson e exato (Clopper-Pearson, com beta incompleta própria); animais por grupo para comparar duas proporções e o poder com o n do rebanho | 6 de 30 (leite); aborto de 10% para 20% (caprinos, Ex. 7) | `taxas.*` |
| Índice de reprodutores | índice econômico de dois reprodutores, ênfase relativa, DP do erro de cada índice e probabilidade de um superar o outro | touros A e B do relatório de leite | `indices.indice_economico`, `enfase_relativa`, `dp_erro_indice`, `prob_superar` |
| Lactação padronizada | TIM/Fleischmann pela ICAR (TMY ou TMM, hiato máximo, mínimo de controles, fim pela secagem) a partir de uma lista de controles, com o passo a passo e o aviso de hiato | cabra do Exemplo 1 de caprinos (675,9 kg) | `lactacao.lactacao_pequenos_ruminantes`, `lactacao.fleischmann` |
| Ganho genético | intensidade a partir da fração selecionada, equação do criador por via e ganho anual em várias vias | teste de progênie, caprinos, Exemplo 5 (17,1 kg/ano) | `ganho.intensidade_selecao`, `ganho.ganho_vias` |

O resultado de `lactacao.fleischmann` traz o passo a passo numa propriedade não enumerável, `trechos`, que a interface mostra; ela não entra na comparação com os vetores.

## Testes

A partir de `central-melhoramento/`:

```bash
node lab/testar_calculadoras.mjs
```

O script:

1. carrega `calculadoras.js` como módulo do Node e como script de navegador e confere que os dois expõem as mesmas funções;
2. roda os 137 vetores de `../laboratorio/vetores_teste.json` com a tolerância do próprio arquivo (erro de até 1 × 10⁻⁹ × máx(1, |valor|)). Hoje passam os **125 vetores aplicáveis**, entre eles a A⁻¹ do Exemplo 5.1 de Mrode et al. (2023). Os 12 restantes ficam como "não coberto", porque nenhuma calculadora usa essas funções: `blup.modelo_animal` (três vetores do relatório de corte e dos Exemplos 4.4 e 5.2 de Mrode et al.), `blup.modelo_direto_materno`, `blup.modelo_multicaracteristica`, `blup.ajuste_hva`, `blup.gauss_seidel` e `parentesco.inversa_A_grupos`, os ajustes de curva de Wood (log-linear e Gauss-Newton) e de Wilmink, e `indices.smith_hazel`. Os modelos matriciais ficam para a Edge Function, como diz o roteiro do motor;
3. confere 112 números impressos nos relatórios para os exemplos das calculadoras (MPPA do Exemplo 6, tabela de REL do Exemplo 3, alocação e tabela de Ne do Exemplo 8, taxas e n do Exemplo 7, touros A e B, lactações e cenários de ganho), com tolerância de meia unidade na última casa impressa.

Sai com código 1 se algo falhar.
