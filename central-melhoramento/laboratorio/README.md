# Laboratório de Modelos: motor de cálculo

Este é o motor do **Laboratório de Modelos** da Central de Melhoramento Seabra: um pacote Python (`melhoramento`) que implementa os modelos documentados nos quatro relatórios da série, em `reports/`:

- *Avaliação genética de bovinos de corte*
- *Avaliação genética de bovinos leiteiros*
- *Avaliação genética de caprinos leiteiros*
- *Avaliação genética de ovinos leiteiros*

Cada relatório traz, no Apêndice A, um script numpy com exemplos numéricos já conferidos. O pacote reorganiza essas contas em funções com nome, docstring e referência, e os testes reproduzem os números publicados. É aqui que um modelo é testado antes de ir para o **SeabraApp** (Flutter + Supabase). Por isso o código é escrito para ser lido e traduzido: funções curtas, sem dependências além de numpy e da biblioteca padrão, e com rotinas numéricas próprias, já que Dart e TypeScript não trazem scipy.

> Os dados de `exemplos/` são **fictícios**. Nenhum animal ou criador é real.

## Estrutura

```
laboratorio/
├── melhoramento/
│   ├── parentesco.py      A tabular, F, A⁻¹ (Henderson + Quaas), A* com grupos de pais desconhecidos,
│   │                      F por par, escolha de reprodutor, Ne, ΔF
│   ├── blup.py            MME: modelo animal (+ ambiente permanente ou comum, grupos de pais desconhecidos),
│   │                      direto-materno, multicaracterística, modelo de touro; Gauss-Seidel; PEV, REL com
│   │                      (1 + F), acurácia, acurácia BIF, DEP, Possible Change
│   ├── lactacao.py        TIM/Fleischmann (TMY e TMM, regras ICAR), Wood, Wilmink, FCM, ECM, ECS
│   ├── confiabilidade.py  REL = DE/(DE + k), filhas-equivalentes, Daetwyler, conversões r ↔ REL ↔ a_BIF
│   ├── indices.py         Smith-Hazel, índice econômico, P(superar), MPPA, índice da fêmea
│   ├── taxas.py           Wald, Wilson, exato, n por grupo, poder, CUSUM + núcleo numérico sem scipy
│   ├── ganho.py           intensidade, equação do criador, vias de seleção, tendência, DPR
│   └── rebanho.py         pipeline de exemplo para um rebanho de cabras (CSV → relatório)
├── exemplos/rebanho_caprino_exemplo.csv   rebanho fictício (30 cabras, 2 lactações)
├── tests/                 unittest; cada teste diz de que relatório e exemplo vem o número
│                          (test_mrode.py: saída dos scripts R oficiais de Mrode et al. 2023)
├── validacao_mrode/       shim de pedigreemm/nadiv em R, rodar_scripts.sh e comparar.py
├── gerar_vetores_teste.py gera vetores_teste.json
└── vetores_teste.json     137 pares entrada → saída para validar as calculadoras em JS/TS e Dart
```

Requisitos: Python 3.13 e numpy. Não há outras dependências (nem scipy, nem pytest).

## Como usar

Todos os comandos rodam dentro de `central-melhoramento/laboratorio/`.

```bash
python3 -m unittest discover -s tests        # 142 testes: cerca de 800 números dos relatórios e
                                              # 18 testes com a saída dos scripts de Mrode et al. (2023)
python3 -m melhoramento.rebanho               # pipeline com o CSV de exemplo
python3 -m melhoramento.rebanho outro.csv     # o mesmo pipeline com outro arquivo no mesmo formato
python3 gerar_vetores_teste.py                # regrava vetores_teste.json depois de mudar uma função
```

Uso como biblioteca:

```python
from melhoramento import parentesco, indices, taxas

ped = {"C5": ("B2", "C2"), "B2": ("B1", "D1"), "C2": ("B1", "D2")}
parentesco.F_acasalamento(ped, "B2", "C2")                 # 0.125: meios-irmãos paternos
indices.indice_femea([-60], h2=0.20, r=0.36, sigma_p=200,
                     pta_pai=60, rel_pai=0.70).ebv         # +39,5 kg (caprinos, Exemplo 6)
taxas.ic_exato(6, 30)                                      # (0.0771, 0.3857)
```

### O pipeline do rebanho

`melhoramento.rebanho` lê um CSV com cinco tipos de linha (`animal`, `parto`, `controle`, `cobertura` e `acasalamento_planejado`; o formato está na docstring do módulo) e faz, na ordem proposta nos relatórios de caprinos e de ovinos:

1. padroniza cada lactação em PL305 pelo Fleischmann da ICAR, separando TMY (ordenha desde o parto) de TMM (depois da separação dos cabritos), e marca as lactações inválidas: menos de 3 controles, hiato acima de 60 dias, menos de 60 dias de lactação;
2. calcula o desvio de cada cabra em relação às contemporâneas (ano × primípara/adulta × TMY/TMM);
3. calcula a MPPA, usada para descarte, e o EBV por índice com a PTA do pai, usado para reposição, com repetibilidade 0,36 e sensibilidade em 0,44 e 0,50 (h² 0,20, σP 200 kg);
4. calcula as taxas (parição, aborto, células acima de 1 milhão, prolificidade) com os intervalos de Wald, Wilson e exato;
5. calcula o F de cada acasalamento planejado e sugere outro reprodutor quando o F passa de 6,25%.

O CSV de exemplo foi montado para conferir o pipeline contra os relatórios. A lactação de 2023 da cabra C01 repete os controles do Exemplo 1 de caprinos e dá **675,9 kg**, 22,51 kg de gordura, 20,38 kg de proteína e CCS geométrica de 1.135 mil. A estação de monta de 2023 tem 26 paridas em 30 expostas, como no Exemplo 7, e dá parição de **86,7% (exato de 69,3% a 96,2%)**.

## Mapa: função → relatório

Abreviações: **Corte**, **Leite**, **Caprinos** e **Ovinos** são os quatro relatórios de `reports/`. Os nomes de seção são os títulos do relatório.

### `parentesco.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `ordenar_pedigree` | pais antes dos filhos; pais sem linha viram fundadores; detecta ciclo | Corte, Passo 1 |
| `matriz_A` | método tabular: A_ij = ½(A_j,pai + A_j,mãe); A_ii = 1 + ½A_pai,mãe | Corte, Passo 1 |
| `coeficientes_F` | F_i = A_ii − 1 | Corte, Passo 1 (F₆ = 0,125) |
| `inversa_A` | regras de Henderson com d_i de Quaas: ½ − ¼(F_s + F_d); ¾ − ¼F_s; 1 | Corte, Passo 1 (pedigree estendido) |
| `inversa_A_grupos`, `pedigree_sem_grupos` | A* de Quaas (1988): pai ou mãe desconhecido vira o rótulo de um grupo; animais primeiro, grupos no fim | Corte, "Equação, pressupostos e efeitos"; Ovinos, "Equação, pressupostos e solução"; Mrode et al. (2023), Ex. 4.4 |
| `parentesco`, `F_acasalamento` | a_xy e F do filho = ½·a_pai,mãe | Leite, "Endogamia: decidir por par"; Caprinos, Ex. 8; Ovinos, Ex. 7 |
| `tabela_F_acasalamentos` | F de todos os pares macho × fêmea | idem |
| `escolher_reprodutor(es)` | menor F, ou o primeiro da preferência abaixo de um limite | Leite (alocação B1–B4); Caprinos, Ex. 8 (limite de 6,25%) |
| `ne_wright`, `delta_F`, `ne_de_delta_F` | Ne = 4NmNf/(Nm + Nf); ΔF = 1/(2Ne) | Corte, "Endogamia e tamanho efetivo"; Caprinos, Ex. 8; Ovinos, Ex. 7 |
| `F_acumulado` | F_t = 1 − (1 − F₀)(1 − ΔF)^t | Caprinos, Ex. 8; Ovinos, Ex. 7 |
| `numero_efetivo_pais` | 1/Σp² com uso desigual de reprodutores | Ovinos, Ex. 7 |
| `n_machos_para_ne` | Nm = Ne·Nf/(4Nf − Ne) | Caprinos, Ex. 8 (12,7 bodes para Ne 50) |

### `blup.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `incidencia`, `montar_X` | X com GC, outros fatores (1º nível = 0) e covariáveis | Corte, Passo 2 |
| `montar_mme`, `resolver_mme` | MME de Henderson com λa·A⁻¹ e λpe·I; montar devolve LHS e RHS, resolver devolve solução e C | Corte, Passo 2 |
| `gauss_seidel` | Gauss-Seidel sobre as MME, sem inversa; para em Σ(Δx)²/Σx² ≤ tolerância | Corte, Passo 2; Mrode et al. (2023), Ex. 19.2 |
| `modelo_animal` | modelo animal completo: efeitos fixos, EBV, PEV = c^ii·σ²e, REL com (1 + F), r, a_BIF, DEP, SEP; opcionais: ambiente permanente, ambiente comum de irmãos (`rotulos_pe`) e grupos de pais desconhecidos (`grupos_geneticos`, 1º grupo = 0) | Corte, Passos 2 e 3; Mrode et al. (2023), Ex. 4.1, 4.4, 5.1, 5.2 e 9.1 |
| `blup_gls` | forma GLS para conferir as MME | Corte, Passo 2 |
| `dep_de_ebv` | DEP/PTA = EBV/2 | Corte, Passo 3 |
| `possible_change` | PC = t(1 − a_BIF)σA/2 (BIF, 9ª ed., p. 73) | Corte, Passo 3 |
| `possible_change_de_r` | t·(σA/2)·√(1 − r²), a conta da tabela da ANCP | Corte, Passo 3 |
| `modelo_direto_materno` | G₀ ⊗ A⁻¹, ambiente permanente materno, TMD = DEPm + ½DEPd; GC, outros fatores e covariáveis fixos | Corte, "Pesos até a desmama"; Mrode et al. (2023), Ex. 8.1 |
| `repetibilidade_direto_materno` | (a_ij·σ²a + σ²m + σam + σ²pe)/σ²P | idem |
| `modelo_multicaracteristica` | G₀ ⊗ A⁻¹ e R₀ por animal, com característica ausente | Corte, "Pesos depois da desmama"; Mrode et al. (2023), Ex. 6.1 |
| `modelo_touro` | y = GC + s + e com touros não aparentados (A_s = I), λ = (4 − h²)/h², prova externa como DE, fator de escala | Ovinos, Ex. 2 |
| `rel_exata_modelo_touro` | REL exata de um reprodutor a partir do desenho (filhas por rebanho) | Caprinos, Ex. 3; Ovinos, Ex. 4 |
| `padronizar_variancia` | y* = y·σ₀/σ_k (razões constantes, modelo francês) | Ovinos, Ex. 2 |
| `ajuste_hva` | HVA do USDA (Wiggans e VanRaden 1991) | Leite, "Modelo de lactação" |

### `lactacao.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `fleischmann` | I₀M₁ + Σ I_i(M_i + M_{i+1})/2 + I_nM_n; corte no fim com interpolação; parada por hiato | Leite, "Do controle ao total"; Caprinos, Ex. 1; Ovinos, Ex. 1 |
| `tim` | TIM da ICAR Procedure 2 até 305 dias | Leite, "Do controle ao total" |
| `producao_componente` | gordura e proteína em kg pelo mesmo método | Leite; Caprinos, Ex. 1 |
| `intervalo_medio_do_metodo` | intervalo médio por método (A4 30, A5 36, A6 42, A7 49; AT, AC, AZ e AY 30) | Seção 16 da ICAR, 2.5.1 e 1.2.4.1 |
| `fim_icar` | secagem real ou último controle + ½ intervalo, limitado ao comprimento | Caprinos, Ex. 1 |
| `lactacao_pequenos_ruminantes` | regras da Seção 16 da ICAR: TMY/TMM, 1º controle, hiato de 2× o intervalo, mínimo de 3 controles; com `estrito_norma=True`, sem cálculo se o 1º controle passa da janela e hiato por método (ver "Modo estrito da Seção 16") | Caprinos, "Pela ICAR, só o leite da ordenha exclusiva"; Ovinos, "A ICAR só mede depois do desmame" |
| `wood`, `pico_wood`, `inflexao_wood` | y = a·t^b·e^(−ct); pico em b/c; inflexão em (b + √b)/c | Leite, "Curvas de lactação"; Ovinos, Ex. 1 |
| `ajustar_wood_loglinear` | MQO em ln y | Leite; Caprinos, Ex. 1 |
| `ajustar_wood_gauss_newton` | mínimos quadrados não lineares (6 iterações no exemplo) | Leite, "Curvas de lactação" |
| `wilmink`, `ajustar_wilmink`, `pico_wilmink` | y = a + b·e^(−0,05t) + ct | Leite, "Curvas de lactação" |
| `ajustar_exponencial` | declínio ln y = ln a − kt (proposta para poucos controles) | Ovinos, Ex. 1 |
| `total_pela_curva`, `rmse` | soma diária da curva; erro nos controles | Leite; Caprinos, Ex. 1 |
| `fcm4` | 0,4·leite + 15·gordura (Gaines) | Leite, "Sólidos, energia e células" |
| `ecm` | Sjaunja et al. (1990): leite × (0,383G% + 0,242P% + 0,7832)/divisor; **divisor padrão 3,140** (`ECM_DIVISOR_SJAUNJA`); variante 3,1138 (`ECM_DIVISOR_4G_3_3P`) | idem |
| `ecs`, `ccs_de_ecs`, `ccs_media_geometrica` | ECS = log₂(CCS/100) + 3 (CCS em mil/mL); média geométrica | Leite; Caprinos; Ovinos, "Células somáticas" |
| `controle_at`, `controle_ac` | AT = 2 × ordenha; AC = ordenha × tanque total/tanque da ordenha | Ovinos, Ex. 1 |

### `confiabilidade.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `k_d`, `k_touro` | k_d = (4 − 2h²)/h² (mérito das companheiras conhecido); k = (4 − h²)/h² (desconhecido) | Leite, "Filhas-equivalentes"; Caprinos, "PTA, base e confiabilidade" |
| `rel_de_de`, `de_de_rel`, `rel_filhas` | REL = DE/(DE + k); DE = k·REL/(1 − REL) | idem |
| `de_filhas_mesmo_rebanho` | 1/(0,16 + 0,84/d) | Leite (VanRaden e Wiggans 1991, Tab. 2) |
| `h2_media_repetida`, `de_registros_proprios`, `de_filha_com_lactacoes` | DE de registros repetidos | Leite (Tab. 1) |
| `rel_media_pais`, `rel_total` | REL_PA = (REL_pai + REL_mãe)/4; soma de DE | Leite |
| `rel_de_pev` | 1 − PEV/[(1 + F)σ²a] | Corte, Passo 3 |
| `r_de_rel`, `rel_de_r`, `bif_de_rel`, `rel_de_bif`, `bif_de_r`, `r_de_bif` | conversões entre r, REL e acurácia BIF | Corte, Passo 3 |
| `daetwyler_rel`, `daetwyler_r`, `daetwyler_n_para_rel` | REL = Nh²/(Nh² + Me) | Leite, "Confiabilidade genômica"; Corte; Caprinos |

### `indices.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `smith_hazel` | b = P⁻¹Gv, r_IH, resposta | Corte, "Índice de seleção" |
| `indice_economico` | Σ v·PTA | Corte; Leite, "Índices econômicos"; Caprinos, Ex. 4; Ovinos, Ex. 3 |
| `enfase_relativa` | \|v\|σ/Σ\|v\|σ | Leite, "Índices econômicos" |
| `indice_padronizado` | Σ peso·sinal·PTA/σ | Corte |
| `dp_erro_indice`, `prob_superar` | DP do erro do índice e P(A > B) | Corte; Leite |
| `prob_superar_pta` | P(A > B) numa característica, pelas PTAs e REL | fórmula derivada das anteriores |
| `fator_mppa`, `mppa` | MPPA = μ + [nr/(1 + (n − 1)r)](ȳ − μ) | Corte, "razão BIF e MPPA"; Leite; Caprinos, Ex. 6; Ovinos, Ex. 5 |
| `indice_femea`, `ebv_registros_proprios` | EBV com registros próprios + PTA (ou EBV) do pai | Leite, "Comparar com contemporâneas"; Caprinos, Ex. 6; Ovinos, Ex. 5 |

### `taxas.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `ic_wald`, `ic_wilson`, `ic_exato` | intervalos de uma proporção (exato = Clopper-Pearson pela beta) | Leite, "Toda taxa precisa de intervalo"; Caprinos, Ex. 7; Ovinos, Ex. 6 |
| `ic_exato_por_binomial` | o mesmo exato pela soma binomial (método dos apêndices), só para conferência | idem |
| `ic_media_t` | média ± t·s/√n (prolificidade) | Caprinos, Ex. 7; Ovinos, Ex. 6 |
| `taxa_encolhida` | (x + a)/(n + a + b), priori Beta | Leite |
| `tamanho_amostral_duas_proporcoes`, `n_por_grupo` | variância agrupada (Caprinos, Ovinos) ou separada (Leite) | Leite; Caprinos, Ex. 7; Ovinos, Ex. 6 |
| `poder_duas_proporcoes` | poder com n por grupo | Caprinos, Ex. 7; Ovinos, Ex. 6 |
| `cusum` | S_t = máx(0; S_{t−1} + x_t − μ₀ − k), superior ou inferior | Leite; Caprinos, Ex. 7 |
| `log_gama` | Lanczos (g = 7, 9 coeficientes) | núcleo numérico |
| `erfc`, `gama_incompleta_regularizada_q`, `norm_cdf`, `norm_pdf` | erfc(x) = Q(½, x²); Φ(z) = ½erfc(−z/√2) | núcleo numérico |
| `norm_ppf` | Acklam (erro 1,15 × 10⁻⁹) + um passo de Halley (erro ~10⁻¹⁵) | núcleo numérico |
| `beta_incompleta_regularizada`, `beta_quantil` | fração continuada de Lentz; quantil por bisseção | núcleo numérico |
| `t_cdf`, `t_quantil` | t de Student pela beta incompleta | núcleo numérico |

### `ganho.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `intensidade_selecao` | i = φ(z)/p, z = Φ⁻¹(1 − p) | Corte; Caprinos, Ex. 5; Ovinos, Ex. 8 |
| `resposta_selecao` | ΔG = i·r·σa/L | Corte, "Resposta à seleção" |
| `ganho_vias` | ΔG = Σ(i·r)·σa/ΣL (duas ou quatro vias) | Corte; Caprinos, Ex. 5; Ovinos, Ex. 8 |
| `ganho_diferenciais` | ΣΔG_k/ΣL_k | Leite, "Resposta à seleção pelas quatro vias" |
| `tendencia` | inclinação da média por ano | Corte, "Tendência genética" |
| `absorcao` | G_{t+1} = G_t + ½(R_t − G_t); R_{t+1} = R_t + TL | Ovinos, Ex. 8 |
| `dpr_aipl`, `dpr_linear` | PR = 21/(DO − PEV + 11); DPR = 0,25(233 − DO) | Leite, "Fertilidade" |

## Números reproduzidos

Os testes conferem cerca de 800 números impressos nos relatórios, sempre "arredondando para o número impresso", com tolerância de meia unidade na última casa. Entre eles:

- **Corte:** A e A⁻¹ do pedigree de 8 animais (A⁻¹ por regras igual à inversa numérica; erro de 0,133 sem a correção de Quaas); GC 2022 = 203,71 e GC 2024 = 207,56; EBV, DEP, PEV, r, r², a_BIF e SEP dos 8 animais; acurácia em GCs de 2 a 100 animais; DEPs direta e materna, TMD e ambiente permanente; σam = 0; EBV de PS bi e unicaracterística; Smith-Hazel; índice de dois touros com P(B > A) = 0,66; Possible Change; MPPA; Ne e ΔF; tendência.
- **Leite:** TIM de 7.469,4 kg; sólidos; FCM; ECM com os dois divisores; ECS; Wood log-linear e Gauss-Newton (6 iterações); Wilmink; HVA; tabela de REL com k_d = 14 e 98; filhas no mesmo rebanho; Tabela 1 de VanRaden e Wiggans; Daetwyler; DPR; índice de dois touros com P = 72,5%; vacas V1 a V6; tabela de IC, com o exato de 6/30 = 7,7% a 38,6%; n de 291, 136 e 373; F por par.
- **Caprinos:** Exemplo 1 completo (TIM, Wood, mamada, componentes); células; REL do Exemplo 3; ICC e MFP$; MPPA e EBV do Exemplo 6 com r = 0,36, 0,44, 0,50 e (0,12; 0,14); taxas do Exemplo 7; F e alocação do Exemplo 8; tabela de Ne; ganho do Exemplo 5.
- **Ovinos:** Exemplo 1 (TMM, regra dos 70 dias, AT/AC); escalas de células; variância heterogênea do Exemplo 2; REL do Exemplo 4; ISOL do Exemplo 3; MPPA e EBV do Exemplo 5; taxas do Exemplo 6 e n = 435 (434,4 bruto); Ne de 3 carneiros × 100 ovelhas = 11,65; absorção do Exemplo 8.

### Discrepâncias encontradas

As três diferenças estavam na v1 do relatório de ovinos e tinham a mesma origem: a tabela do texto arredondava **de novo** a saída de 3 casas do Apêndice A. A v2 (15/10/2026) corrigiu as três, e o apêndice passou a imprimir 4 casas. Os testes documentam cada uma (`tests/test_blup.py` e `tests/test_indices.py`).

| Onde | Tabela da v1 | Valor exato | v2 (2 casas) |
|---|---|---|---|
| Ovinos, Exemplo 4, h² 0,24, "ao lado de 10 filhas de outro carneiro local" | 0,20 | 0,1948 (apêndice: 0,195) | 0,19 |
| Ovinos, Exemplo 4, h² 0,30, "40 filhas em 10 rebanhos", e o texto "0,68 a 0,70" | 0,70 | 0,6948 (apêndice: 0,695) | 0,69 |
| Ovinos, Exemplo 5, REL da ovelha O2 com r = 0,41 | 0,50 | 0,4945 (apêndice: 0,495) | 0,49 |

O tamanho amostral para 90% contra 95% de fertilidade é 434,4 sem arredondar. O relatório publica **435 ovelhas por ano** (arredondado para cima, como deve ser), e o pacote devolve os dois valores: `tamanho_amostral_duas_proporcoes` dá o bruto e `n_por_grupo`, o inteiro.

## Validação contra Mrode et al. (2023)

O livro de referência dos exemplos resolvidos é Mrode, Pocrnić, Gorjanc e Thompson (2023), *Linear Models for the Prediction of the Genetic Merit of Animals*, 4ª ed., CABI, [DOI 10.1079/9781800620506.0000](https://doi.org/10.1079/9781800620506.0000). O código R oficial dos exemplos está em [github.com/MrodesBook/Examples_R](https://github.com/MrodesBook/Examples_R): 24 scripts dos capítulos 4 a 19, com os dados embutidos. Em 15/10/2026 os 24 rodaram até o fim, sem erro nem aviso, e o motor foi conferido contra cada exemplo que tem função equivalente.

**Como foi rodado.** Usamos o R 4.3.3 do apt do Ubuntu, com Matrix, MASS, tidyverse e orthopolynom. Os pacotes `pedigreemm` e `nadiv` não estão no apt, e o CRAN estava bloqueado. Por isso um shim em R (`validacao_mrode/shim_pedigreemm_nadiv.R`) os substitui, instalado como dois pacotes mínimos com os mesmos nomes. Ele implementa só o que os scripts chamam:

- do pedigreemm, `pedigree`, `getA` e `getAInv`;
- do nadiv, `makeAinv` (com e sem grupos), `ggcontrib` e `makeD`.

O shim calcula A pelo método tabular e A⁻¹ por T⁻ᵀD⁻¹T⁻¹, um caminho diferente do motor, e confere em cada chamada que A⁻¹·A = I. Todo o resto, inclusive a montagem e a solução das MME, é o código oficial, sem alteração. Os scripts rodam numa cópia de trabalho, e os objetos numéricos de cada um são gravados com 17 algarismos. Para repetir, em cerca de um minuto:

```bash
git clone https://github.com/MrodesBook/Examples_R /tmp/Examples_R     # leia os scripts antes
bash validacao_mrode/rodar_scripts.sh /tmp/Examples_R /tmp/mrode        # roda numa cópia de trabalho
python3 -B validacao_mrode/comparar.py /tmp/mrode/saidas                # tabela da comparação
```

**Resultado.** O critério é |motor − R| ≤ 10⁻⁹ × máx(1, |R|) em cada valor. Bateram 44 comparações, com 3.146 valores e diferença máxima de 8,5 × 10⁻¹⁴. Uma comparação divergiu, por convenção.

| Exemplo (script) | Função do motor | Valores | Maior diferença | Resultado |
|---|---|---|---|---|
| A⁻¹ de 9 pedigrees de 3 a 26 animais: Ex. 4.1, 4.2 (touros), 5.1, 5.2, 8.1, 9.1, 11.6, 13.1 e 15.1 | `inversa_A` | 1.619 | 0 | OK |
| A dos Ex. 12.1 (26 animais) e 17.7 (`getA`) | `matriz_A` | 740 | 0 | OK |
| F de 9 pedigrees: diag(A) do R ou, quando o script só tem A⁻¹, diag((A⁻¹)⁻¹) − 1 | `coeficientes_F` | 132 | 5,6 × 10⁻¹⁶ | OK |
| A* com os grupos 9 e 10, Ex. 4.4 (`makeAinv(ggroups = 2)`) | `inversa_A_grupos` | 100 | 0 | OK |
| Modelo animal, Ex. 4.1, 17.7 e 18.1: efeitos fixos, EBV e resíduos | `modelo_animal` | 35 | 1,1 × 10⁻¹⁶ | OK |
| Acurácia, Ex. 4.1 e 17.7: c^ii, r², r e SEP | `modelo_animal` (`pev`, `confiabilidade`, `acuracia`) | 40 | 1,3 × 10⁻¹⁵ | OK |
| Modelo animal reduzido, Ex. 4.3 (`Chapter_04_2.R`) | `modelo_animal` (completo) | 10 | 4,4 × 10⁻¹⁶ | OK |
| Repetibilidade, Ex. 5.1: EBV, p̂ e parte fixa Xb de cada registro | `modelo_animal(sigma2_pe)` | 23 | 8,5 × 10⁻¹⁴ | OK |
| Ambiente comum, Ex. 5.2 (família) e 9.1 sem efeitos associativos (leitegada) | `modelo_animal(rotulos_pe)` | 42 | 1,4 × 10⁻¹⁴ | OK |
| Multicaracterística, Ex. 6.1 | `modelo_multicaracteristica` | 20 | 6,4 × 10⁻¹⁵ | OK |
| Direto-materno, Ex. 8.1 | `modelo_direto_materno` | 36 | 1,4 × 10⁻¹⁴ | OK |
| Grupos de pais desconhecidos, Ex. 4.4 (transformação QP) | `modelo_animal(grupos_geneticos)` | 11 | 1,8 × 10⁻¹⁴ | OK |
| Gauss-Seidel, Ex. 19.2: MME, 20 voltas e o critério de cada volta | `montar_mme`, `gauss_seidel` | 330 | 1,8 × 10⁻¹⁵ | OK |
| Modelo de touro, Ex. 4.2 (`Chapter_04_1.R`) | `modelo_touro` | 5 | 0,032 | divergente (convenção) |
| O mesmo modelo com A_s = I, numa variante no R (`variante_touro_sem_parentesco.R`) | `modelo_touro` (ŝ e REL) | 8 | 1,7 × 10⁻¹⁸ | OK |

**Divergência e convenções.**

- **Modelo de touro (Ex. 4.2).** O script usa A_s⁻¹ entre os touros, porque o touro 4 é filho do touro 1. Já `modelo_touro` supõe touros não aparentados (A_s = I), como nos Exemplos 3 de caprinos e 2 e 4 de ovinos. Com A_s = I no próprio R, soluções e REL batem com o motor; a diferença é de premissa, não de conta. O motor devolve EBV = 2ŝ, e o script imprime ŝ.
- **SEP.** O `SEP` do script é √PEV, o erro do EBV. O `sep_dep` do motor é √PEV/2, o erro da DEP.
- **r².** O script calcula r² = 1 − c^ii·α, sem o fator (1 + F), enquanto o motor divide a PEV por (1 + F)σ²a. No Ex. 4.1 os dois coincidem, porque nenhum animal é endogâmico.
- **Ex. 5.1.** A paridade está aninhada no HYS: os HYS 1 e 2 só têm primeira lactação, e os 3 e 4 só segunda. O script desfaz a dependência retirando a coluna hys3. O motor exige X de posto completo e, com os dois fatores, para com "Singular matrix". Por isso a comparação usou só o HYS, que gera o mesmo espaço de colunas. EBV, p̂ e a parte fixa de cada registro saem idênticos.
- **Correção de Quaas.** Ela não é exercitada aqui: nenhum pedigree dos scripts tem pai endogâmico. Há animais endogâmicos, como a vaca 8 do Ex. 5.1, mas eles não têm filhos. A correção continua coberta pelo pedigree estendido do relatório de corte.
- **A⁻¹ do lado do R.** A A⁻¹ vem do shim, não do pedigreemm. A comparação confere o motor contra uma segunda implementação, independente e checada por A⁻¹·A = I. Já as soluções das MME que usam essa A⁻¹ saem do código oficial.

**Problemas nos scripts.** Nenhum dos dois muda os números impressos:

- em `threshold_fja.R`, linha 175, `length(s)` lê o `s` do ambiente global. Funciona porque `Chapter_15_1.R` define `s` com os 4 touros; chamado de outro lugar, quebra ou usa o tamanho errado;
- em `Chapter_18.R`, a média condicional do Gibbs subtrai `LHS[i,i]*theta[i]` quando deveria somar, porque é preciso tirar o termo da diagonal de LHS[i,]·θ. Isso não afeta a única volta do script, que parte de θ = 0, mas erraria a partir da segunda.

**Testes.** `tests/test_mrode.py` tem 18 testes, que fixam os casos que batem. Os valores esperados são a saída impressa dos scripts (round de 3 ou 4 casas, com tolerância de meia unidade). Para A⁻¹, A, A* e o Ex. 4.1, os testes também usam 10 a 12 algarismos, com tolerância de 10⁻⁹. Cada teste cita o exemplo e o script.

**O que entrou no motor com a validação:**

- `parentesco.inversa_A_grupos` e a opção `grupos_geneticos` de `modelo_animal`, para grupos de pais desconhecidos (Ex. 4.4), citados no modelo francês de ovinos e na base genética do relatório de corte;
- a opção `rotulos_pe` de `modelo_animal`, para o ambiente comum de irmãos de leitegada ou parto (Ex. 5.2 e 9.1);
- `outros_fatores` em `modelo_direto_materno`, como já havia em `modelo_animal` (Ex. 8.1);
- `montar_mme` e `gauss_seidel`, conferido volta a volta com o Ex. 19.2;
- cinco vetores novos em `vetores_teste.json`.

Nenhuma conta antiga mudou. Os 110 testes anteriores continuam passando, e o único vetor alterado, `blup.modelo_animal_corte`, só ganhou a chave `grupos_geneticos: null`.

**Ainda fora do motor:**

- **Modelo animal reduzido (Ex. 4.3).** Dá as mesmas soluções do modelo completo, como a tabela mostra, e só economiza memória em avaliações grandes.
- **Modelo de touro com parentesco entre touros (Ex. 4.2).** É o próximo passo simples: A_s⁻¹ no lugar de I em `modelo_touro`. Ficou para depois porque `calculadoras.js` replica a assinatura atual da função.
- **Colunas dependentes em `montar_X` (Ex. 5.1).** Falta detectá-las e dizer o nome de cada uma, em vez de parar com "Singular matrix".
- **Os demais exemplos dos scripts**, que continuam fora, como diz "Limites": efeitos associativos (9.1), regressão fixa e aleatória (10), modelos genômicos (11, 12 e 14), dominância e epistasia (13), limiar (15), REML (17) e Gibbs (18).

## Modo estrito da Seção 16 (22/10/2026)

O estudo da norma (`research_notes/estudo_software/icar_section16_e_lactacao.md`, conferido de novo na wiki da Seção 16 em 22/10/2026) achou quatro pontos em que `lactacao_pequenos_ruminantes` diverge da ICAR. Para não mudar nenhum número existente, as regras da norma entraram como opção: `estrito_norma=False` é o padrão e o comportamento de antes; com `estrito_norma=True` a função aplica a norma.

| Regra da norma | Padrão (`estrito_norma=False`, como antes) | Com `estrito_norma=True` |
|---|---|---|
| 1º controle fora da janela: cabra ordenhada desde o parto, depois do 80º dia (2.4.2.1); com mamada, depois da mamada + 52 dias (2.4.2.2 e, em ovinos, 1.2.3.2). Exemplos da norma: mamada de 0, 25 e 45 dias, limite de 52, 77 e 97 dias. "There should be no lactation calculation" | avisa e calcula | total e `ate_dia` NaN, `completa = False`, aviso. `limite_primeiro_controle` (dia a partir do parto) abre a exceção "se a sociedade da raça justificar limite maior", só para cabras (ovinos: `ValueError`). Cabra com 1º controle antes do 6º dia continua só com aviso, porque a norma escreve "não calcular" para o limite superior |
| Hiato máximo entre controles não nulos: cabras, 2 × o intervalo médio do método (60, 72, 84 e 98 dias em A4, A5, A6 e A7; 2.5.2); ovelhas, 70 dias (1.2.4.2) | 2 × `intervalo_medio` (padrão 30 em cabras e 35 em ovelhas, ou seja, 60 e 70); A5, A6 e A7 exigem passar 36, 42 e 49 | `metodo="A5"` etc. define o intervalo (A4/B4/C4/E4, AT, AC, AZ e AY = 30; 5 = 36; 6 = 42; 7 = 49, só cabras); ovelhas sempre 70 dias; sem `metodo` e sem `intervalo_medio`, 30 dias (A4) |
| Fim sem secagem: último controle + metade do intervalo (2.7.5, escrito só para cabras); para ovelhas a norma deixa a secagem calculada a cargo da organização, e o intervalo médio do A4 é 30 dias (1.2.4.1) | ovelha: 35/2 = 17,5 dias (o 35 vem do limite de 70 dias, não de um intervalo médio) | ovelha: metade do intervalo médio do método (15 dias no A4, 18 no A5, 21 no A6), por analogia com a cabra, com aviso explícito |

Continua igual nos dois modos: o mínimo de 3 controles (2.7.3 e 2.7.4; o parágrafo 2.5.2 diz "não fixado", e para ovelhas a norma também não fixa), a produção mínima de 200 g (só avisa; o Anexo 1 da Seção 16 diz 150 g), o corte no comprimento-padrão e a interpolação. O motor **não** estima controles faltantes num hiato de até 100 dias pela média dos vizinhos (2.8.2, caprinos): para no controle anterior (2.5.2). As duas cláusulas coexistem no texto da norma e não se conciliam. Fora do modo estrito, `metodo` é ignorado com um aviso.

O comentário de `controle_ac` dizia que "o Anexo 1 da ICAR não foi transcrito". O Anexo 1 não traz fórmula do AC: só define o método (nota 1: correção pelo volume do tanque do rebanho nas duas ordenhas). A fórmula usada aqui, ordenha medida × tanque das duas ordenhas / tanque da ordenha medida, continua sendo a forma usual, não verificada.

**Testes.** `tests/test_lactacao.py`, classe `TestEstritoNorma` (14 testes), cada um com a seção da norma e os números do exemplo oficial (6º a 80º dia; 52, 77 e 97 dias; 60, 72, 84 e 98 dias; 70 dias; 15, 18, 21 e 24,5 dias), mais a prova de que o padrão não mudou. Os 128 testes anteriores continuam iguais. `vetores_teste.json` ganhou quatro vetores (`lactacao.intervalo_metodo_a7`, `lactacao.cabra_estrito_1o_controle_tardio`, `lactacao.cabra_estrito_hiato_a5` e `lactacao.ovelha_estrito_sem_secagem`) e os 133 antigos ficaram idênticos. A porta `../lab/calculadoras.js` ganhou os mesmos parâmetros opcionais (`estrito_norma`, `metodo`, `limite_primeiro_controle`), sem mudar o padrão.

## Limites

- **As variâncias vêm da literatura.** h², repetibilidade, σP, G₀ e R₀ são parâmetros de entrada, nunca estimados com os dados do rebanho. O relatório de corte mostra por quê: 100 registros estimam h² com desvio-padrão de 0,30. Todo resultado deve vir com o parâmetro usado e, quando a fonte deixa dúvida, com uma análise de sensibilidade (o pipeline faz isso para a repetibilidade).
- **O pacote não substitui uma avaliação nacional** (Capragene, ANCP, PMGZ, Geneplus, controle leiteiro oficial). Um rebanho isolado não tem conexão com a população: as PTAs internas só se comparam entre si e não se comparam com as de um sumário. Os Exemplos 3 de caprinos e 4 de ovinos mostram que filhas sem contemporâneas de outro pai não avaliam o pai.
- **O pacote serve para ranquear dentro do rebanho:** quem descartar (MPPA), de quem guardar filhas (EBV com a PTA do pai), que par evitar (F) e se uma taxa mudou de fato (intervalo de confiança).
- **Matrizes densas.** A, A⁻¹ e as MME são montadas por inteiro, o que serve para até alguns milhares de animais. Avaliações grandes usam Meuwissen e Luo para F, iteração sobre os dados (Gauss-Seidel, PCG) e PEV aproximada. O motor tem Gauss-Seidel sobre as MME já montadas (`gauss_seidel`), mas não a iteração sobre os dados.
- **X de posto completo.** Fatores fixos aninhados ou confundidos (por exemplo, a paridade dentro do HYS) param com "Singular matrix"; use só o fator mais fino.
- **Fora do escopo:** ssGBLUP, GBLUP e APY; regressão aleatória (dia de controle); modelos de limiar; estimação de variâncias (REML, Gibbs); efeitos associativos e não aditivos; modelo de touro com parentesco entre touros; melhor predição (BP) da lactação. Os relatórios descrevem esses métodos, mas eles não entram neste motor. Grupos de pais desconhecidos entraram em 15/10/2026 (veja "Validação contra Mrode et al. (2023)").

## Roteiro para portar ao SeabraApp

O pacote tem duas camadas, com destinos diferentes.

**1. Fórmulas fechadas, em Dart no app.** Funcionam offline, sem álgebra linear além de 2 × 2:
- `taxas` (IC de Wald, Wilson e exato; n por grupo; poder; CUSUM), `ganho`, `confiabilidade`;
- `lactacao.fleischmann` e `lactacao_pequenos_ruminantes` (com os avisos da ICAR), `ecs`, `ccs_media_geometrica`, `ecm` e `fcm4`;
- `indices.mppa` e `indices.indice_femea`;
- F de um par: em vez de montar A inteira, aplique a regra do método tabular de forma recursiva, a_xy = ½(a_x,pai(y) + a_x,mãe(y)) com y o mais novo, só sobre os ancestrais dos dois animais e com memoização.

O núcleo numérico de `taxas.py` (`log_gama`, `erfc`, `norm_cdf`, `norm_ppf`, `beta_incompleta_regularizada`, `beta_quantil`, `t_quantil`) não usa numpy e se traduz linha a linha. Dart e JavaScript não têm `erf` nem `lgamma` nativos, por isso essas funções foram escritas à mão.

**2. Modelos matriciais, em TypeScript numa Edge Function do Supabase** (ou num worker Python, se a Edge Function não bastar):
- `matriz_A`, `inversa_A`, `modelo_animal`, `modelo_direto_materno`, `modelo_multicaracteristica` e `rel_exata_modelo_touro`;
- as MME são simétricas e positivas definidas: use Cholesky (algumas dezenas de linhas) em vez de inversa geral; a diagonal de C, necessária para a PEV, sai resolvendo os sistemas com a mesma fatoração. Quando a matriz não couber na memória, `gauss_seidel` resolve sem inversa e já está conferido volta a volta com o Exemplo 19.2 de Mrode et al. (2023);
- rode por rebanho, sob demanda ou em lote noturno, e grave os resultados (EBV, REL, data do cálculo, parâmetros usados) numa tabela própria.

**Passos sugeridos:**
1. Portar `taxas`, `confiabilidade` e `ganho` para Dart e criar um teste que lê `vetores_teste.json` e confere cada vetor com a `tolerancia_relativa` do arquivo (1 × 10⁻⁹).
2. Portar o Fleischmann com as regras da ICAR. O app precisa registrar a **data de separação das crias** (TMY × TMM) e a **data de secagem**; sem elas, o cálculo não segue a ICAR.
3. Portar a MPPA e o índice da fêmea, mostrando sempre as duas ordens (descarte e reposição) com a REL ao lado.
4. Portar o F por par e o alerta de 6,25% no planejamento de acasalamentos.
5. Levar o BLUP para a Edge Function, validado com os vetores de `blup.*`.

As colunas do CSV de exemplo (`animal`, `parto`, `controle`, `cobertura`, `acasalamento_planejado`) são o mínimo de dados que essas contas pedem; servem de checklist para as tabelas do Supabase. Na tela, declare sempre a escala (r, REL ou acurácia BIF), o parâmetro usado e o intervalo de confiança, como pedem os relatórios.
