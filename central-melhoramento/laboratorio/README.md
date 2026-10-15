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
│   ├── parentesco.py      A tabular, F, A⁻¹ (Henderson + Quaas), F por par, escolha de reprodutor, Ne, ΔF
│   ├── blup.py            MME: modelo animal (+ ambiente permanente), direto-materno, multicaracterística,
│   │                      modelo de touro; PEV, REL com (1 + F), acurácia, acurácia BIF, DEP, Possible Change
│   ├── lactacao.py        TIM/Fleischmann (TMY e TMM, regras ICAR), Wood, Wilmink, FCM, ECM, ECS
│   ├── confiabilidade.py  REL = DE/(DE + k), filhas-equivalentes, Daetwyler, conversões r ↔ REL ↔ a_BIF
│   ├── indices.py         Smith-Hazel, índice econômico, P(superar), MPPA, índice da fêmea
│   ├── taxas.py           Wald, Wilson, exato, n por grupo, poder, CUSUM + núcleo numérico sem scipy
│   ├── ganho.py           intensidade, equação do criador, vias de seleção, tendência, DPR
│   └── rebanho.py         pipeline de exemplo para um rebanho de cabras (CSV → relatório)
├── exemplos/rebanho_caprino_exemplo.csv   rebanho fictício (30 cabras, 2 lactações)
├── tests/                 unittest; cada teste diz de que relatório e exemplo vem o número
├── gerar_vetores_teste.py gera vetores_teste.json
└── vetores_teste.json     128 pares entrada → saída para validar as calculadoras em JS/TS e Dart
```

Requisitos: Python 3.13 e numpy. Não há outras dependências (nem scipy, nem pytest).

## Como usar

Todos os comandos rodam dentro de `central-melhoramento/laboratorio/`.

```bash
python3 -m unittest discover -s tests        # 110 testes, cerca de 800 números publicados conferidos
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
| `resolver_mme` | MME de Henderson com λa·A⁻¹ e λpe·I; devolve solução e C | Corte, Passo 2 |
| `modelo_animal` | modelo animal completo: efeitos fixos, EBV, PEV = c^ii·σ²e, REL com (1 + F), r, a_BIF, DEP, SEP; ambiente permanente opcional | Corte, Passos 2 e 3 |
| `blup_gls` | forma GLS para conferir as MME | Corte, Passo 2 |
| `dep_de_ebv` | DEP/PTA = EBV/2 | Corte, Passo 3 |
| `possible_change` | PC = t(1 − a_BIF)σA/2 (BIF, 9ª ed., p. 73) | Corte, Passo 3 |
| `possible_change_de_r` | t·(σA/2)·√(1 − r²), a conta da tabela da ANCP | Corte, Passo 3 |
| `modelo_direto_materno` | G₀ ⊗ A⁻¹, ambiente permanente materno, TMD = DEPm + ½DEPd | Corte, "Pesos até a desmama" |
| `repetibilidade_direto_materno` | (a_ij·σ²a + σ²m + σam + σ²pe)/σ²P | idem |
| `modelo_multicaracteristica` | G₀ ⊗ A⁻¹ e R₀ por animal, com característica ausente | Corte, "Pesos depois da desmama" |
| `modelo_touro` | y = GC + s + e, λ = (4 − h²)/h², prova externa como DE, fator de escala | Ovinos, Ex. 2 |
| `rel_exata_modelo_touro` | REL exata de um reprodutor a partir do desenho (filhas por rebanho) | Caprinos, Ex. 3; Ovinos, Ex. 4 |
| `padronizar_variancia` | y* = y·σ₀/σ_k (razões constantes, modelo francês) | Ovinos, Ex. 2 |
| `ajuste_hva` | HVA do USDA (Wiggans e VanRaden 1991) | Leite, "Modelo de lactação" |

### `lactacao.py`

| Função | O que faz | Seção do relatório |
|---|---|---|
| `fleischmann` | I₀M₁ + Σ I_i(M_i + M_{i+1})/2 + I_nM_n; corte no fim com interpolação; parada por hiato | Leite, "Do controle ao total"; Caprinos, Ex. 1; Ovinos, Ex. 1 |
| `tim` | TIM da ICAR Procedure 2 até 305 dias | Leite, "Do controle ao total" |
| `producao_componente` | gordura e proteína em kg pelo mesmo método | Leite; Caprinos, Ex. 1 |
| `fim_icar` | secagem real ou último controle + ½ intervalo, limitado ao comprimento | Caprinos, Ex. 1 |
| `lactacao_pequenos_ruminantes` | regras da Seção 16 da ICAR: TMY/TMM, 1º controle, hiato de 2× o intervalo, mínimo de 3 controles | Caprinos, "Pela ICAR, só o leite da ordenha exclusiva"; Ovinos, "A ICAR só mede depois do desmame" |
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

As três diferenças estão no relatório de ovinos e têm a mesma origem: a tabela do texto arredonda **de novo** a saída de 3 casas do Apêndice A. Os testes documentam cada uma (`tests/test_blup.py` e `tests/test_indices.py`).

| Onde | Tabela do relatório | Valor exato | Correto com 2 casas |
|---|---|---|---|
| Ovinos, Exemplo 4, h² 0,24, "ao lado de 10 filhas de outro carneiro local" | 0,20 | 0,1948 (apêndice: 0,195) | 0,19 |
| Ovinos, Exemplo 4, h² 0,30, "40 filhas em 10 rebanhos", e o texto "0,68 a 0,70" | 0,70 | 0,6948 (apêndice: 0,695) | 0,69 |
| Ovinos, Exemplo 5, REL da ovelha O2 com r = 0,41 | 0,50 | 0,4945 (apêndice: 0,495) | 0,49 |

O tamanho amostral para 90% contra 95% de fertilidade é 434,4 sem arredondar. O relatório publica **435 ovelhas por ano** (arredondado para cima, como deve ser), e o pacote devolve os dois valores: `tamanho_amostral_duas_proporcoes` dá o bruto e `n_por_grupo`, o inteiro.

## Limites

- **As variâncias vêm da literatura.** h², repetibilidade, σP, G₀ e R₀ são parâmetros de entrada, nunca estimados com os dados do rebanho. O relatório de corte mostra por quê: 100 registros estimam h² com desvio-padrão de 0,30. Todo resultado deve vir com o parâmetro usado e, quando a fonte deixa dúvida, com uma análise de sensibilidade (o pipeline faz isso para a repetibilidade).
- **O pacote não substitui uma avaliação nacional** (Capragene, ANCP, PMGZ, Geneplus, controle leiteiro oficial). Um rebanho isolado não tem conexão com a população: as PTAs internas só se comparam entre si e não se comparam com as de um sumário. Os Exemplos 3 de caprinos e 4 de ovinos mostram que filhas sem contemporâneas de outro pai não avaliam o pai.
- **O pacote serve para ranquear dentro do rebanho:** quem descartar (MPPA), de quem guardar filhas (EBV com a PTA do pai), que par evitar (F) e se uma taxa mudou de fato (intervalo de confiança).
- **Matrizes densas.** A, A⁻¹ e as MME são montadas por inteiro, o que serve para até alguns milhares de animais. Avaliações grandes usam Meuwissen e Luo para F, iteração sobre os dados (Gauss-Seidel, PCG) e PEV aproximada.
- **Fora do escopo:** ssGBLUP, GBLUP e APY; regressão aleatória (dia de controle); modelos de limiar; estimação de variâncias (REML, Gibbs); grupos de pais desconhecidos; melhor predição (BP) da lactação. Os relatórios descrevem esses métodos, mas eles não entram neste motor.

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
- as MME são simétricas e positivas definidas: use Cholesky (algumas dezenas de linhas) em vez de inversa geral; a diagonal de C, necessária para a PEV, sai resolvendo os sistemas com a mesma fatoração;
- rode por rebanho, sob demanda ou em lote noturno, e grave os resultados (EBV, REL, data do cálculo, parâmetros usados) numa tabela própria.

**Passos sugeridos:**
1. Portar `taxas`, `confiabilidade` e `ganho` para Dart e criar um teste que lê `vetores_teste.json` e confere cada vetor com a `tolerancia_relativa` do arquivo (1 × 10⁻⁹).
2. Portar o Fleischmann com as regras da ICAR. O app precisa registrar a **data de separação das crias** (TMY × TMM) e a **data de secagem**; sem elas, o cálculo não segue a ICAR.
3. Portar a MPPA e o índice da fêmea, mostrando sempre as duas ordens (descarte e reposição) com a REL ao lado.
4. Portar o F por par e o alerta de 6,25% no planejamento de acasalamentos.
5. Levar o BLUP para a Edge Function, validado com os vetores de `blup.*`.

As colunas do CSV de exemplo (`animal`, `parto`, `controle`, `cobertura`, `acasalamento_planejado`) são o mínimo de dados que essas contas pedem; servem de checklist para as tabelas do Supabase. Na tela, declare sempre a escala (r, REL ou acurácia BIF), o parâmetro usado e o intervalo de confiança, como pedem os relatórios.
