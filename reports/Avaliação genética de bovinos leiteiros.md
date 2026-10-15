# Como controles leiteiros viram PTAs e metas

As PTAs (capacidades previstas de transmissão) de bovinos leiteiros são metade do valor genético predito pelo mesmo **BLUP de modelo animal** descrito no relatório de corte, mas o leite acrescenta três camadas próprias. A primeira é o tempo: a produção entra como **lactação padronizada de 305 dias**, calculada a partir dos controles mensais pelo método dos intervalos (TIM) ou pela melhor predição (BP) e analisada num modelo de repetibilidade, ou entra pesagem a pesagem num **modelo de dia de controle**, com grupo rebanho-dia-de-controle (HTD) e **regressão aleatória em polinômios de Legendre**, que dá a cada animal uma curva própria, uma PTA de 305 dias e uma persistência. A segunda são as **características funcionais**, com herdabilidade entre 1% e 10% e escala própria: fertilidade como dias abertos convertidos em taxa de prenhez (DPR) e taxas de concepção, facilidade de parto em modelo de limiar touro–avô materno, longevidade por análise de sobrevivência, saúde por ocorrências registradas pelo produtor e tolerância ao calor por norma de reação sobre o índice de temperatura e umidade (THI). A terceira é a genômica: nos EUA ela ainda roda em **várias etapas** sobre provas desregredidas, com protótipo single-step do CDCB previsto só para o fim de 2026, enquanto Nova Zelândia, Alemanha e Irlanda já adotaram o passo único (datas confirmadas só em parte), e o **MACE** do Interbull põe touros de 33 países na escala de cada país. A confiabilidade segue REL = DE/(DE + k_d), com k_d = (4 − 2h²)/h², que vale 14 para h² = 0,25, o valor do USDA, e daí sai a assimetria central do leite: **100 filhas, cada uma num rebanho diferente, dão 88% de confiabilidade para leite e cerca de 50% para DPR**. Ela explica o peso crescente de fertilidade, saúde e longevidade nos índices (NM$ 2025, TPI 2026, LPI 2025) e o valor da genômica para essas características. No Brasil, a Embrapa Gado de Leite conduz os testes de progênie do Gir Leiteiro, do Girolando e do Guzerá e participa da avaliação da Holandesa. O Gir Leiteiro e o Girolando são avaliados por modelo animal de lactação com ambiente permanente, e a genômica entra nos sumários oficiais por single-step (ssGBLUP): no Gir desde o sumário de 2019, no Girolando para vacas desde 2017 e para touros desde 2019. Desde 2022, o Girolando põe a composição racial no grupo de contemporâneos e a heterozigosidade como efeito fixo. A avaliação multirracial Holandês–Gir–Girolando ainda aparecia como "a ser lançada" em 2024. Para rebanhos médios e grandes, a precisão não vem de estimar parâmetros próprios, e sim de comparar cada vaca com as contemporâneas, ranquear com repetibilidade e PTA do pai, fixar variâncias pela literatura, genotipar novilhas e reportar cada taxa com intervalo de confiança: 6 prenhezes em 30 vacas (20%) têm intervalo exato de **7,7% a 38,6%**. Todos os exemplos numéricos foram conferidos em Python/numpy e são reproduzidos pelo script do Apêndice A.

**Grau de confirmação.** A primeira versão deste relatório (v1, 14/10/2026) foi compilada só por busca na web, a partir de resumos e trechos, sem leitura do texto integral de nenhum artigo. Em 15/10/2026, uma verificação com leitura do texto completo das fontes primárias abertas conferiu **123 itens**: **65 confirmados**, **36 corrigidos**, **17 não confirmados** (fonte não lida ou sem o dado) e **5 de acesso pago** (Wood 1967, Wilmink 1987, Ali e Schaeffer 1987, Ptak e Schaeffer 1993 e Schaeffer 2004). Esta versão (v2) incorpora as correções; a lista das principais está no "Histórico de revisões", antes do apêndice. Os marcadores são estes. **"(conferido em ...)"** indica item confirmado na fonte primária lida, com página ou seção quando disponível; "conferido no resumo" indica que só o resumo foi lido. **[não verificado]** indica fórmula ou afirmação ainda sem fonte primária lida. **"Acesso pago; forma conferida em Schaeffer (2016), livro aberto"** indica artigo original pago cuja forma foi conferida no livro aberto *Random Regression Models* de L. R. Schaeffer. **[conferido numericamente]** indica relação que este relatório verificou por computação: isso prova a consistência interna, mas não confirma a notação nem a autoria do artigo original. **"Atribuição a confirmar"** indica número de trecho de busca cujo vínculo com a fonte não ficou inequívoco. **"Fonte secundária"** indica imprensa especializada, empresa de sêmen ou extensão, usada só quando não apareceu fonte primária. Os estudos de terceiros citados só como ordem de grandeza (tabelas de herdabilidade e estudos regionais) não foram conferidos um a um e devem ser lidos como não verificados, salvo indicação em contrário. Os DOIs aparecem só quando constavam nas notas ou na verificação. Os exemplos usam dados fictícios. Os valores econômicos e as variâncias marcados como hipotéticos servem só para ilustrar o método.

## O leite roda a mesma máquina do corte, com o tempo como dimensão extra

O núcleo matemático é o do relatório de corte, que este texto não repete: o modelo animal, a montagem de A⁻¹ pelas regras de Henderson e Quaas, as equações de modelos mistos (MME), a variância do erro de predição (PEV) como base da confiabilidade, a estimação de variâncias por REML e a troca de A⁻¹ por H⁻¹ no ssGBLUP, com o APY para milhões de genotipados, estão descritos e exemplificados lá (seções "O modelo animal resolve ambiente, pedigree e genética num único sistema" e "A genômica entra trocando a matriz de parentesco"). Para ler este relatório basta a forma com registros repetidos **[não verificado na fonte primária; forma padrão]**:

```
y = X b + Z a + W p + e
a: valor genético aditivo (um por animal do pedigree)   p: ambiente permanente da vaca (um por vaca com registro)
var(a) = A σ²a     var(p) = I σ²pe     var(e) = R (I σ²e, ou heterogênea)
MME:  [ X'R⁻¹X   X'R⁻¹Z             X'R⁻¹W            ] [b̂]   [X'R⁻¹y]
      [ Z'R⁻¹X   Z'R⁻¹Z + A⁻¹/σ²a    Z'R⁻¹W            ] [â] = [Z'R⁻¹y]
      [ W'R⁻¹X   W'R⁻¹Z             W'R⁻¹W + I/σ²pe    ] [p̂]   [W'R⁻¹y]
PTA = â / 2        REL = 1 − PEV / [(1 + F) σ²a]        h² = σ²a / σ²P        r = (σ²a + σ²pe) / σ²P
```

Cinco coisas são específicas do leite. A vaca tem **muitos registros**, controles dentro da lactação e lactações ao longo da vida, e por isso todo modelo leiteiro precisa de ambiente permanente ou de traços correlacionados. O grupo de contemporâneos é o **rebanho-ano-estação** de parto nos modelos de lactação ou o **rebanho-dia-de-controle** nos modelos de dia de controle. O touro não produz leite e é avaliado pelas filhas: o desvio de produção de uma vaca é "uma média ponderada das lactações menos as soluções de grupo de manejo, rebanho-touro e ambiente permanente", e a média desses desvios das filhas, ajustada pelo mérito das parceiras, dá a DYD, medida não encolhida do desempenho da progênie (conferido em [VanRaden e Wiggans 1991, J. Dairy Sci. 74:2737](https://queries.uscdcb.com/publish/jds/1991/74_2737.pdf), p. 2737). A variância da produção muda de rebanho para rebanho, o que exige ajuste de variância heterogênea. E a confiabilidade é contada em **filhas-equivalentes (DE)**, não em número bruto de filhas. A definição prática de PTA nos sumários brasileiros é a mesma da literatura internacional. O glossário do sumário do Gir de 2019 diz: "PTA - É a capacidade prevista de transmissão, sendo uma medida do desempenho esperado das filhas do touro em relação à média genética dos rebanhos", e a PTA é publicada com a confiabilidade (conferido em [Embrapa/ABCGIL, Sumário Gir Leiteiro 2019, Documentos 235](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1108520/1/DOC235SumarioGir2019.pdf), glossário).

## Dez controles mensais viram uma lactação de 305 dias

### Do controle ao total: método dos intervalos e melhor predição

A produção padronizada de 305 dias sai dos controles mensais por dois caminhos. O **TIM** (test interval method) integra a curva por trapézios entre controles e extrapola nas pontas. O **BP** (best prediction) de VanRaden (1997) combina os controles disponíveis com as correlações entre produções diárias, estimadas por Norman et al. e aproximadas por funções suaves ([VanRaden 1997, J. Dairy Sci. 80:3015](https://queries.uscdcb.com/publish/jds/1997/80_3015.pdf), p. 3016); a ICAR usa a forma autorregressiva Corr(M₁, M₂) = 0,995^I na primeira lactação e 0,992^I nas seguintes, com I o intervalo em dias entre os controles. As duas formas abaixo conferem, em notação equivalente, com as Equações 1 e 3 da Procedure 2 da ICAR e com VanRaden (1997, p. 3017) (conferido em [ICAR Procedure 2, versão de janeiro de 2020](https://www.icar.org/Guidelines/02-Procedure-2-Computing-Lactation-Yield.pdf), pp. 4 e 9):

```
TIM:  Y305 = I₀·M₁ + Σ_{i=1..n−1} I_i·(M_i + M_{i+1})/2 + I_n·M_n
      I₀ = dias do parto ao 1º controle ; I_i = dias entre controles ; I_n = dias do último controle até 305 (ou até a secagem)
      M_i = produção no dia do controle i (kg/dia) ; gordura e proteína: mesma regra sobre leite × teor
      (na ICAR, I_n vai até o fim do período de lactação; o corte em 305 dias é convenção deste relatório)
BP:   Ŷ305 = μ_Y + C_YT · C_TT⁻¹ · (T − μ_T)          (ICAR: MY = E(MY) + Cov(y, MY)·Var(y)⁻¹·[y − E(y)])
      T = vetor de controles observados ; C_YT, C_TT = covariâncias derivadas das correlações entre produções diárias
```

O BP é uma regressão de índice de seleção aplicada ao fenótipo e por isso **encolhe** os registros em direção à média do rebanho, o que dá desvio-padrão ligeiramente menor que o do TIM (conferido na ICAR Procedure 2, p. 9, e no [AIPL Research Report CH13, fevereiro de 1999](https://queries.uscdcb.com/reference/changes/chng9902.html): "best prediction regresses estimates toward the herd average"; ver também [PMC12094053](https://pmc.ncbi.nlm.nih.gov/articles/PMC12094053)). O mesmo procedimento gera uma estimativa de persistência e a força a ser fenotipicamente independente da produção, porque os coeficientes de persistência são desviados de um ponto central da lactação, de 128, 146 e 135 dias para leite, gordura e proteína (conferido em [VanRaden 1998, WCGALP](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/1998/WC6_23_347_VanRaden.pdf)). Em 658 vacas canadenses de 17 rebanhos, a correlação do TIM com o total real foi de **0,97** com controle mensal, 0,96 com controle a.m.-p.m. e **0,93** com controle trimestral; o BP deu 0,97, 0,97 e 0,93 e reduziu o erro de estimação em 4%, 6% e 10% nos mesmos esquemas. A vantagem do BP foi moderada com duas pesagens mensais e maior quando o controle era menos frequente (conferido em [Norman, VanRaden, Wright e Clay 1999, J. Dairy Sci. 82:438-444](https://queries.uscdcb.com/publish/jds/1999/82_438.pdf), resumo). O trabalho dos mesmos autores no WCGALP de 1998 comparou só o controle mensal e achou pouca diferença entre os dois métodos ([Norman et al., WCGALP 1998](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/1998/WC6_23_343_NormanEtAl.pdf)). Num estudo croata, controlar a cada 6 semanas em vez de 4 aumentou o viés e reduziu a acurácia das predições de 305 dias (atribuição a confirmar, [istocar](https://www.istocar.bg.ac.rs/wp-content/uploads/2023/01/V24-I3-4-2.pdf)). Num levantamento global de organizações de controle leiteiro, 74% usavam o TIM (conferido no resumo de van Leerdam, de Kok, Osei-Tete, Trapanese e Hostens, [ICAR Verona 2026, TS12](https://www.icar.org/Documents/Verona-2026/Abstracts/TS12_van%20Leerdam.pdf)). A Procedure 2 da ICAR descreve quatro métodos: o TIM (Sargent 1968), que é o método de referência, a interpolação por curvas-padrão de lactação (ISLC, Wilmink 1987), a melhor predição (VanRaden 1997) e o procedimento multicaracterística (Schaeffer e Jamrozik 1996) (conferido em [ICAR Procedure 2](https://www.icar.org/Guidelines/02-Procedure-2-Computing-Lactation-Yield.pdf), sumário e §1 a §4). O TIM foi inventado em 1880 e se tornou o método oficial americano em 1969 (conferido em VanRaden 1997, p. 3015). O USDA o trocou pelo BP em **fevereiro de 1999**, aplicando o BP às vacas paridas a partir de janeiro de 1997 (conferido no [AIPL Research Report CH13](https://queries.uscdcb.com/reference/changes/chng9902.html)). O ano de 1998, que a versão anterior deste relatório registrava como conflito, é o do estudo de comparação (Norman et al., aceito em novembro de 1998), e não o da troca.

O exemplo usa uma vaca fictícia com dez controles, identificados pelos dias em lactação (DEL). A coluna de ECS (escore de células somáticas) é explicada adiante.

| Controle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| DEL (dias) | 12 | 42 | 73 | 101 | 133 | 162 | 194 | 224 | 255 | 286 |
| Leite (kg/dia) | 24,0 | 29,5 | 30,2 | 28,6 | 27,1 | 25,0 | 23,4 | 21,2 | 19,5 | 17,6 |
| Gordura (%) | 3,9 | 3,5 | 3,4 | 3,5 | 3,6 | 3,7 | 3,8 | 3,9 | 4,0 | 4,2 |
| Proteína (%) | 3,1 | 3,0 | 3,0 | 3,1 | 3,2 | 3,3 | 3,3 | 3,4 | 3,5 | 3,5 |
| CCS (mil cél/mL) | 80 | 120 | 95 | 150 | 210 | 180 | 260 | 140 | 300 | 220 |
| ECS | 2,68 | 3,26 | 2,93 | 3,58 | 4,07 | 3,85 | 4,38 | 3,49 | 4,58 | 4,14 |

O passo a passo do TIM é mecânico. Os intervalos são 12 dias (parto ao 1º controle), 30, 31, 28, 32, 29, 32, 30, 31 e 31 dias entre controles e 19 dias do último controle até 305. O primeiro termo é 12 × 24,0 = 288 kg; o segundo, 30 × (24,0 + 29,5)/2 = 802,5 kg; e assim até o último, 19 × 17,6 = 334,4 kg. A soma dá **7.469,4 kg de leite**. Aplicando a mesma regra à produção diária de gordura (leite × gordura%) e de proteína, saem **277,5 kg de gordura (3,72%)** e **240,3 kg de proteína (3,22%)**. Com só os controles 1, 4, 7 e 10, como num controle trimestral, o TIM dá 7.267,1 kg, **2,7% abaixo**, porque a interpolação linear entre controles distantes corta o pico **[conferido numericamente]**.

### Curvas de lactação: forma, pico e persistência

As funções de curva descrevem a produção diária y(t) em função dos dias em lactação t. Wood e Wilmink têm 3 parâmetros, e Ali e Schaeffer tem 5 ([comparação em primíparas iranianas](https://www.researchgate.net/publication/228967019_Comparison_and_evaluation_of_mathematical_lactation_curve_functions_of_Iranian_primiparous_Holsteins)). As três formas conferem, em notação equivalente, com a Tabela 4.1 de Schaeffer (2016), que as compara entre 19 modelos, e a de Wilmink também com a Equação 4 da ICAR Procedure 2, escrita como y = A + Bt ± C·exp(−0,05t) (conferido em [Schaeffer 2016, *Random Regression Models*](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf), cap. 4, p. 68). Os artigos originais de Wood (1967, Nature 216:164-165, DOI 10.1038/216164a0), Wilmink (1987, Livest. Prod. Sci. 16:335-348, DOI 10.1016/0301-6226(87)90003-0) e Ali e Schaeffer (1987, Can. J. Anim. Sci. 67:637-644, DOI 10.4141/cjas87-067) são de acesso pago; forma conferida em Schaeffer (2016), livro aberto. Os polinômios de Legendre e a normalização conferem com Schaeffer (2016, cap. 1, p. 14), e P₃ sai da recorrência dada ali. As derivações de pico foram conferidas numericamente:

```
Wood (gama incompleta):  y(t) = a · t^b · e^(−c·t)
                         dy/dt = 0  →  t_pico = b/c ;  y_pico = a·(b/c)^b·e^(−b)
                         ajuste linearizado: ln y = ln a + b·ln t − c·t  (MQO), depois Gauss-Newton em y
Wilmink:                 y(t) = a + b·e^(−k·t) + c·t   (k fixo ≈ 0,05; linear em a, b, c)
                         t_pico = ln(k·b/c)/k   (b e c negativos)
Ali e Schaeffer:         y(t) = a + b·(t/305) + c·(t/305)² + d·ln(305/t) + e·[ln(305/t)]²
Legendre (ordem k):      y(t) = Σ_{m=0..k} φ_m(x)·β_m ,  x = 2(t − t_min)/(t_max − t_min) − 1
                         P₀ = 1, P₁ = x, P₂ = (3x² − 1)/2, P₃ = (5x³ − 3x)/2 ;  normalizado: φ_m = √[(2m + 1)/2]·P_m
```

A função de Wood foi proposta em 1967 na *Nature* (Wood 1967; acesso pago; forma conferida em Schaeffer (2016), livro aberto; ver também [RBZ, geometria da curva de Wood](https://www.scielo.br/j/rbz/a/6V9rqy5vDHsXychNV3hphrr/?lang=en)), e não deve ser confundida com Wood (1969, Anim. Prod. 11:307-316), que trata das formas da curva por fatores. Ajustada aos dez controles do exemplo, ela e a de Wilmink dão totais muito próximos do TIM:

| Método | Parâmetros | Pico | Produção no pico | Leite em 305 dias | Erro (RMSE) nos controles |
|---|---|---|---|---|---|
| TIM, 10 controles | — | — | — | 7.469,4 kg | — |
| TIM, 4 controles (trimestral) | — | — | — | 7.267,1 kg | — |
| Wood, log-linear (MQO) | a = 13,356; b = 0,2572; c = 0,00413 | 62,3 d | 29,89 kg | 7.441,1 kg | 0,203 kg |
| Wood, não linear (Gauss-Newton, 6 iterações) | a = 13,336; b = 0,2582; c = 0,00415 | 62,2 d | 29,93 kg | 7.440,9 kg | 0,201 kg |
| Wilmink (k = 0,05) | a = 34,787; b = −18,527; c = −0,05985 | 54,8 d | 30,31 kg | 7.455,6 kg | 0,228 kg |

O ajuste se resolve em duas etapas. A regressão linear sobre ln y dá valores iniciais; o método de Gauss-Newton refina a, b e c minimizando os desvios em kg, porque o ajuste em log pondera erros relativos e não absolutos. Pela curva de Wood ajustada, a vaca produz 29,92 kg aos 60 dias, 28,92 aos 100, 22,84 aos 200 e 16,75 aos 300, e a razão y(300)/y(100) = **0,579** mede a persistência. Essa é só uma das definições possíveis: as definições variam, e o programa do Girolando usou a medida PS7, com Legendre de ordem 3 para o efeito genético e de ordem 5 para o ambiente permanente ([Animal Bioscience, Girolando](https://www.animbiosci.org/journal/view.php?number=23198)). Schaeffer (2016, seção 4.5, pp. 79-80) usa outra, a razão (DY260 + 68)/(DY60 + 90), em que DY260 e DY60 são os desvios da vaca aos 260 e aos 60 dias e 68 e 90 kg são as produções da vaca média de primeira ordem de parto nesses dias. A definição de persistência precisa ser documentada junto com cada PTA, porque muda a ordem dos touros.

Com controle mensal regular, as três abordagens diferem em menos de 0,4%. A curva vale mais quando os controles são raros ou quando a lactação está incompleta e precisa ser projetada. Para descrever o pico, a literatura não favorece Wood. Num rebanho Holandês da Turquia, Ali e Schaeffer teve o maior R² e o menor erro em todas as lactações, e Wilmink foi o melhor entre os modelos de 3 parâmetros ([Turquia](https://www.researchgate.net/publication/233799450_Comparison_of_different_lactation_curve_models_in_Holstein_cows_raised_on_a_farm_in_the_south-eastern_Anatolia_region)). No Irã, Ali e Schaeffer ajustou um pouco melhor que Wilmink, mas Wood foi escolhido para predição diária pela simplicidade e pelo menor custo computacional ([Irã](https://www.researchgate.net/publication/228967019_Comparison_and_evaluation_of_mathematical_lactation_curve_functions_of_Iranian_primiparous_Holsteins)). Em regressão quantílica, Wood teve o pior desempenho entre as funções testadas ([J. Dairy Research](https://www.cambridge.org/core/journals/journal-of-dairy-research/article/abs/using-quantile-regression-for-fitting-lactation-curve-in-dairy-cows/08C1DE44E814A5C8628BA1A8DB55B174)). Modelos de 3 parâmetros separaram só dois grupos de forma de curva, enquanto os de 5 parâmetros e Legendre reconheceram mais formas ([JDS 2005](https://www.sciencedirect.com/science/article/pii/S0022030205727843)). Em Girolando, Wilmink teve o melhor ajuste da curva e foi o modelo usado para estimar a heterose (conferido no resumo de Daltro et al. 2019, J. Appl. Anim. Res. 47:85-95, [DOI 10.1080/09712119.2019.1575223](https://www.tandfonline.com/doi/full/10.1080/09712119.2019.1575223)); a afirmação de que Wood e Wilmink foram os mais adequados para a produção de 305 dias não aparece no resumo **[não verificado]**.

### Sólidos, energia e células somáticas

Para comparar vacas e rebanhos com teores diferentes, a produção é corrigida para gordura (FCM) ou energia (ECM). A FCM a 4% é **FCM = 0,4 × leite + 15 × gordura** (kg), de Gaines (1928, Science 67:353-354); a forma confere no suplemento aberto de Seymour et al. (2023, J. Dairy Res. 90:2-4, DOI 10.1017/S0022029922000851), e o texto de Gaines não foi lido ([suplemento](https://static.cambridge.org/content/id/urn:cambridge.org:id:article:S0022029922000851/resource/name/S0022029922000851sup001.pdf)). Os coeficientes saem da energia: 291,14 kcal/kg de leite e 10.944 kcal/kg de gordura, divididos pela energia de 1 kg de leite a 4% (728,88 kcal), dão **0,3994 e 15,0148**, que arredondam para 0,4 e 15. A divisão está **[conferida numericamente]**, mas os três valores de energia não aparecem no resumo da revisão de Hall (2023, J. Dairy Sci. 106:2230-2246, DOI 10.3168/jds.2022-22219), cujo texto integral não foi lido **[não verificado]** ([resumo](https://doaj.org/article/e6a8244d8ca4462d9295a64912d82e66)). A mesma revisão mostra que equações que corrigem para a mesma composição divergem por usarem energias e divisores diferentes, e cita como composição de referência 3,5% de gordura, 3,05% de proteína verdadeira e 4,85% de lactose, com 0,695 Mcal/kg (conferido no resumo). A ECM de Sjaunja et al. (1990) aparece em artigos abertos como **ECM = leite × (383·G% + 242·P% + 783,2)/3.140**, isto é, leite × (0,383·G% + 0,242·P% + 0,7832)/3,140 (conferido em três artigos abertos que citam Sjaunja: [PMC8556608](https://pmc.ncbi.nlm.nih.gov/articles/PMC8556608/), [PMC10204938](https://pmc.ncbi.nlm.nih.gov/articles/PMC10204938/) e [PMC11431119](https://pmc.ncbi.nlm.nih.gov/articles/PMC11431119/); o texto original, publicado pela ICAR em 1990, não foi lido). O suplemento de Seymour et al. traz a forma por rendimento, ECM = 0,01 × leite + 12,2 × gordura + 7,7 × proteína + 5,3 × lactose (kg), com os coeficientes de gordura e proteína divididos por 3,14 (38,3/3,14 ≈ 12,2; 24,2/3,14 ≈ 7,7). Há versões diferentes da fórmula em circulação: um artigo aberto usa o divisor 3,1138 ([PMC12452100](https://pmc.ncbi.nlm.nih.gov/articles/PMC12452100/)), que é o valor do numerador com 4,0% de gordura e 3,3% de proteína e faz a ECM igualar o leite com essa composição; com o divisor 3,140, esse leite vale 0,992 kg de ECM por kg **[conferido numericamente]**. Na vaca do exemplo, **FCM = 7.150,5 kg e ECM = 7.100,4 kg** (7.160,2 kg com o divisor 3,1138). O relatório técnico deve declarar qual equação e qual divisor usou, porque versões diferentes não são equivalentes.

A contagem de células somáticas (CCS) é transformada no escore de células somáticas, **ECS = log₂(CCS/100.000) + 3**, com CCS em células/mL. A transformação é de Shook (1982) e foi adotada pelo programa nacional de controle leiteiro (DHI) dos EUA como escala padrão; Da et al. a escrevem como log₂(CCS/100) + 3, com CCS em milhares por mL, forma equivalente (conferido em [Da, Grossman, Misztal e Wiggans 1992, J. Dairy Sci. 75:2265](https://queries.uscdcb.com/publish/jds/1992/75_2265.pdf), p. 2265). Wiggans e Shook (1987, J. Dairy Sci. 70:2666-2672) construíram a medida de lactação a partir desses escores (só o resumo foi lido; ver também [revisão sobre CCS](https://www.researchgate.net/publication/259779742_Understanding_and_using_somatic_cell_counts_to_improve_milk_quality) e [Animal Bioscience](https://www.animbiosci.org/journal/view.php?doi=10.5713%2Fab.20.0720)). Cada duplicação da CCS soma um ponto: 50, 100, 200, 400 e 800 mil células/mL dão ECS de 2, 3, 4, 5 e 6 **[conferido numericamente]**. A transformação aproxima a normalidade e muda a média: na vaca do exemplo, o ECS médio de 3,70 corresponde a uma CCS geométrica de **162 mil**, contra uma média aritmética de **176 mil**, porque os controles altos pesam mais na média simples. A h² do ECS é baixa, de **0,03 a 0,18** ([Irã 2016](https://link.springer.com/article/10.1186/s40781-016-0121-5); [Xangai](https://pmc.ncbi.nlm.nih.gov/articles/PMC9483179/); [Irã 2021, atribuição a confirmar](https://pubmed.ncbi.nlm.nih.gov/34205847/)). O limite inferior (0,03) e a correlação de 2016 abaixo conferem no resumo de Kheirabadi e Razmkabir (2016, J. Anim. Sci. Technol. 58:38); o limite superior e os outros dois estudos não foram conferidos. O sinal da correlação genética com a produção **muda entre estudos**: levemente antagônico (0,01 a 0,11) num estudo iraniano de 2016, de −0,05 a −0,30 em outro de 2021, e pequeno e positivo (0,14 para leite) em dados antigos de Quebec ([JDS 1982, correspondência não confirmada](https://www.sciencedirect.com/science/article/pii/S0022030282822741)). Por isso o índice não deve assumir um valor de literatura sem conferir a população.

### Modelo de lactação: repetibilidade ou lactações como características diferentes

Com o total de 305 dias em mãos, o modelo de lactação trata cada lactação como um registro. Há duas formas **[não verificado na fonte primária]**:

```
Repetibilidade:     y_ijk = GC_i + (idade ao parto × estação)_j + ... + a_k + p_k + e_ijk
                    y = Xb + Za + Wp + e ;  var(a) = Aσ²a ; var(p) = Iσ²pe ; var(e) = Iσ²e
                    supõe correlação genética 1 entre lactações e variâncias iguais
Multicaracterística: y = [y₁; y₂; y₃]  (1ª, 2ª e 3ª lactações como características)
                    var(a) = G₀ ⊗ A  (G₀: 3×3 covariâncias genéticas entre lactações) ;  var(e) = R₀ ⊗ I
GC = rebanho-ano-estação de parto (ou grupo de manejo); covariáveis: idade ao parto, DEL à secagem quando usado
```

A escolha depende das correlações entre lactações. Em gado tailandês, as correlações entre lactações ficaram entre 0,36 e 0,68, a maior entre a 1ª e a 2ª ([AJAS 2020](https://doaj.org/article/0eea6095f40745d09199c46055d2d501)); em búfalos, entre 0,67 e 0,79 ([AAB 2013](https://aab.copernicus.org/articles/56/423/2013/aab-56-423-2013.pdf)); e em Gir, próximas de 1,0 para a produção acumulada de 305 dias, o que os autores usaram para defender a seleção de touros pela primeira lactação ([PAB 2015](https://apct.sede.embrapa.br/pab/article/view/20433)). Valores quase unitários são incomuns e podem refletir a definição do traço. Quando a correlação é bem menor que 1, o modelo de repetibilidade comprime a informação, e o multicaracterística é mais correto. Os fatores de maturidade equivalente (ME), que convertem a produção da primípara para a de vaca adulta, e as tabelas de idade-estação **não foram encontrados pelas notas**. Por isso os exemplos deste relatório usam desvios em relação às contemporâneas da mesma ordem de parto, sem ME.

A variância fenotípica muda entre rebanhos. Sem correção, filhas em rebanhos de alta variância inflam ou deprimem a prova do pai. O ajuste de variância heterogênea (HVA) de Wiggans e VanRaden (1991), implantado pelo USDA em julho de 1991, funciona em três passos. Primeiro, a variância fenotípica de cada rebanho-ano-ordem é regredida para a de região-ano-ordem (peso relativo 20) e combinada com a dos anos adjacentes. Depois, a herdabilidade do grupo é estimada por h² = 0,05 + 0,2·(DP regredido/DP base), entre 0,2 e 0,3 na versão implantada, e a variância genética do grupo é h² vezes a variância fenotípica regredida. Por fim, o desvio de cada lactação em relação ao grupo de manejo é multiplicado pela razão entre o desvio-padrão **genético** da base e o do rebanho-ano-ordem, e o registro ajustado recebe o peso de erro do rebanho, 0,45/[(0,25/h²) − 0,55]. Com o ajuste, a tendência genética do leite dos Holandeses subiu quase 5 kg/ano (conferido em [Wiggans e VanRaden 1991, J. Dairy Sci. 74:4350](https://queries.uscdcb.com/publish/jds/1991/74_4350.pdf), resumo e pp. 4351-4352; contexto em [Springer, Polônia](https://link.springer.com/article/10.1007/BF03194611)). No exemplo, um desvio de +900 kg num rebanho com desvio-padrão fenotípico de 1.800 kg tem h² = 0,05 + 0,2 × 1,2 = 0,29 e desvio-padrão genético de 969 kg; na base, com 1.500 kg e h² = 0,25, o desvio-padrão genético é de 750 kg. O desvio ajustado fica em **+696 kg**, e o peso de erro desse rebanho, de alta variância, é 1,44 **[conferido numericamente]**. Só se a herdabilidade fosse igual nos dois rebanhos a razão seria a dos desvios fenotípicos, e o resultado seria +750 kg, o número da versão simplificada. Meuwissen, de Jong e Engel (1996, J. Dairy Sci. 79:310-316, DOI 10.3168/jds.S0022-0302(96)76365-8) estimam valores genéticos e variâncias heterogêneas em conjunto, e a avaliação nórdica usa um método multiplicativo derivado desse trabalho (título e referência conferidos; conteúdo não lido; atribuição a confirmar, [NordicEBV](https://www.nordicebv.info/wp-content/uploads/2015/04/Experiences-with-Interbull-test-IV-estimation-of-genetic-variance_paper.pdf)). As notas não acharam estudo de HVA em avaliações brasileiras, embora a variação de manejo entre confinamento, pasto e rebanhos pequenos sugira que ele faça diferença aqui.

## O modelo de dia de controle compara cada vaca com as ordenhadas no mesmo dia

### Regressão fixa e o grupo rebanho-dia-de-controle

O modelo de dia de controle usa cada pesagem como registro. Swalve separa esses modelos em três grupos: os de duas etapas, que corrigem os registros no nível do dia de controle; os de regressão fixa, em que os controles de uma lactação são registros repetidos e a curva é comum a uma subclasse; e os de regressão aleatória, em que o valor genético do animal é descrito por coeficientes de regressão e varia ao longo da lactação (conferido no resumo de [Swalve 2000, J. Dairy Sci. 83:1115-1124](https://www.sciencedirect.com/science/article/pii/S0022030200749770); o texto integral não foi lido). O modelo de regressão fixa de Ptak e Schaeffer (1993, Livest. Prod. Sci. 34:23-34, DOI 10.1016/0301-6226(93)90033-E; acesso pago), conhecido só por descrições secundárias, aninha a curva de Ali e Schaeffer em subclasses de idade-estação, região, ordem de parto e intervalo entre partos, e usa como grupo de contemporâneos o **rebanho-dia-de-controle (HTD)**, que deu variância residual menor que as alternativas **[não verificado]**. A ideia do HTD é absorver tudo o que afetou todas as vacas do rebanho naquele dia: dieta, clima, ordenhador, erro do medidor, comparando cada vaca com as que estavam no mesmo ambiente na mesma data. O próprio Schaeffer, porém, revisou essa escolha. Ele chama o HTD de "probably the biggest mistake I made with the original TD models": as vacas de uma mesma subclasse de HTD pariram em idades e meses diferentes, umas começam e outras terminam a lactação, a subclasse tem um único parâmetro e as contemporâneas mudam de um controle para o outro. Ele conclui "I DO NOT RECOMMEND this factor in TD models" e recomenda, no lugar, grupos de contemporâneas **aleatórios** de ordem de parto-rebanho-ano-estação de parto (PHYS), vacas que compartilham o ambiente durante toda a lactação, cada grupo com a sua curva de Legendre de ordem 4 e estações de três meses; como fator aleatório, o PHYS dispensa um número mínimo de registros por subclasse (conferido em [Schaeffer 2016, *Random Regression Models*](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf), seções 4.3.5 e 4.3.6, pp. 71-72). O HTD continua a aparecer em modelos aplicados, como o de tolerância ao calor de Bohmanova et al. (2005) descrito adiante, e é usado no exemplo abaixo como ilustração; o PHYS é a alternativa defendida pelo autor do modelo original. A outra limitação da regressão fixa é supor a mesma curva genética para todos os animais da subclasse, sem diferenças individuais de persistência.

### Regressão aleatória: cada vaca com a própria curva

A regressão aleatória (RRM) dá a cada animal coeficientes aleatórios sobre polinômios de Legendre, para o efeito genético e para o ambiente permanente. Schaeffer apresentou a ideia, sugerida por Jack Dekkers, no WCGALP de 1994, em Guelph, e o Canadá adotou um modelo de dia de controle nas avaliações de touros e vacas em 2000 (conferido em Schaeffer 2016, pp. 67-68). Jamrozik e Schaeffer (1997, J. Dairy Sci. 80:762-770, [DOI 10.3168/jds.S0022-0302(97)75996-4](https://doi.org/10.3168/jds.S0022-0302(97)75996-4)) descreveram um modelo com regressões fixas e aleatórias para primíparas Holandesas, estimado por métodos bayesianos com amostragem de Gibbs, com h² de 0,32, 0,28 e 0,28 para leite, gordura e proteína em 305 dias (conferido no resumo; texto integral não lido). Polinômios ortogonais como covariáveis vêm das funções de covariância de Kirkpatrick et al. e do trabalho de Meyer e Hill, que relacionou regressões aleatórias e funções de covariância e mostrou como estimá-las por REML (conferido em Schaeffer 2016, prefácio e seção 1.3; Costa, Melo, Packer e Freitas 2008, [RBZ](http://www.scielo.br/j/rbz/a/qvpCDsgr6TZS4w68VBchqCN/?lang=en), aberto, atribuem a Kirkpatrick et al. 1994 o uso de Legendre para a estrutura de covariâncias dos controles). A revisão de Schaeffer (2004, Livest. Prod. Sci. 86:35-45, DOI 10.1016/S0301-6226(03)00151-9, [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0301622603001519)) é de acesso pago; forma conferida em Schaeffer (2016), livro aberto. A estrutura abaixo é corroborada por Schaeffer (2016, cap. 4) e por Costa et al. (2008), com efeitos fixos de curva e aleatórios de animal e de ambiente permanente; a equação completa dos artigos de 1997 não foi lida **[não verificado]**. O EBV305 como soma dos φ(t) vezes os coeficientes, q'â, confere com Schaeffer (2016, seção 4.5, pp. 78-79), e o exemplo foi **[conferido numericamente]**:

```
y_tk = HTD_i + Σ_{m=0..n_f} φ_m(t)·β_{m,s} + Σ_{m=0..n_a} φ_m(t)·a_km + Σ_{m=0..n_p} φ_m(t)·p_km + e_tk

Forma matricial:  y = X b + Z_a a + Z_p p + e      (linhas de Z_a e Z_p trazem φ(t) nas colunas da vaca)
var(a) = A ⊗ K_a   (ordenado por animal; K_a = covariâncias dos coeficientes genéticos, (n_a+1)×(n_a+1))
var(p) = I ⊗ K_p    var(e) = R = diag(σ²e,c)  (variância residual por classe c de DEL)

σ²a(t) = φ(t)'K_a φ(t)        h²(t) = σ²a(t) / [σ²a(t) + σ²p(t) + σ²e(t)]
EBV305_k = Σ_{t=5..305} φ(t)'â_k = q'â_k ,  q = Σ φ(t)        PEV(EBV305_k) = q' C_kk q
REL305_k = 1 − q'C_kk q / [(1 + F_k)·q'K_a q]          PTA305 = EBV305/2
Persistência_k = [φ(t₂) − φ(t₁)]'â_k   (definição ilustrativa; cada programa define a sua)

MME:  [ X'R⁻¹X      X'R⁻¹Z_a                 X'R⁻¹Z_p               ] [b̂]   [X'R⁻¹y  ]
      [ Z_a'R⁻¹X    Z_a'R⁻¹Z_a + A⁻¹⊗K_a⁻¹   Z_a'R⁻¹Z_p             ] [â] = [Z_a'R⁻¹y]
      [ Z_p'R⁻¹X    Z_p'R⁻¹Z_a               Z_p'R⁻¹Z_p + I⊗K_p⁻¹   ] [p̂]   [Z_p'R⁻¹y]
```

As notas escrevem K_a ⊗ A, que é a mesma matriz com o vetor ordenado por coeficiente em vez de por animal. O RRM trata o tempo de forma contínua, permite variâncias diferentes ao longo da lactação e usa dias não amostrados. A ordem do polinômio é escolhida por AIC, BIC, DIC ou acurácia com dados mascarados. Em cerca de 419 mil registros de primíparas Holandesas chinesas, Legendre de ordem 3 com variância residual heterogênea teve o melhor ajuste e a maior correlação com EBV305 em validação, e as ordens 3 a 5 deram parâmetros semelhantes ([PMC7674963](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7674963/)). No Holandês valão, a DIC caiu com a ordem, mas o terceiro grau foi o mais parcimonioso ([JABG 2022](https://onlinelibrary.wiley.com/doi/abs/10.1111/jbg.12673)). No Holandês brasileiro, um estudo não achou tendência consistente entre as ordens 3 a 5 ([RBZ](http://www.scielo.br/j/rbz/a/qvpCDsgr6TZS4w68VBchqCN/?lang=en)), outro escolheu a ordem 5 por AIC e BIC ([RBZ](http://www.scielo.br/j/rbz/a/tLJqMNpnjvCNVMnSj7RNdcM/?lang=en)), e um terceiro concluiu que o RRM eleva a confiabilidade em relação ao modelo de 305 dias, com ordens 4 a 6 como boas opções ([PAB 2016](http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0100-204X2016001101848)). O número de regressões fixas também importa: usar várias regressões fixas mudou a ordem dos touros para persistência e para 305 dias ([RBZ](https://www.scielo.br/j/rbz/a/3KPYRkNqWrc4CLvyJtmPZsS/?lang=en)).

### Exemplo mínimo: seis vacas, seis controles, 37 equações

O exemplo tem um rebanho com seis controles mensais (HTD1 a HTD6, a cada 30 dias), dois touros (T1 e T2, animais 1 e 2) e seis vacas, filhas alternadas de T1 e T2, de mães desconhecidas. As vacas pariram em datas diferentes, de modo que, em cada HTD, há vacas no início, no meio e no fim da lactação. É essa mistura que permite separar o efeito do dia (HTD) do efeito do estágio da lactação (curva).

| Vaca | Pai | DEL no HTD1 | HTD1 | HTD2 | HTD3 | HTD4 | HTD5 | HTD6 |
|---|---|---|---|---|---|---|---|---|
| 3 | T1 | 150 | 17,5 | 20,3 | 12,5 | 18,4 | 12,9 | 15,1 |
| 4 | T2 | 120 | 23,0 | 25,9 | 18,0 | 17,3 | 15,0 | 16,8 |
| 5 | T1 | 90 | 26,4 | 24,1 | 19,2 | 24,3 | 17,9 | 19,5 |
| 6 | T2 | 60 | 31,4 | 24,3 | 28,2 | 29,1 | 20,9 | 20,1 |
| 7 | T1 | 30 | 20,3 | 26,5 | 19,6 | 20,7 | 15,9 | 18,7 |
| 8 | T2 | 8 | 24,3 | 26,7 | 23,2 | 23,6 | 19,7 | 20,0 |

O passo a passo tem cinco etapas. A primeira padroniza o DEL: x = 2(t − 5)/300 − 1, de modo que 5 dias vira −1 e 305 dias vira +1. A segunda monta X com seis colunas de HTD e três colunas de curva fixa (φ₁, φ₂ e φ₃; φ₀ fica de fora porque é colinear com os HTDs). A terceira monta Z_a com φ₀(t) e φ₁(t) nas duas colunas de cada um dos 8 animais (ordem 1, 16 equações) e Z_p com as mesmas funções para as 6 vacas (12 equações). A quarta fixa as variâncias, hipotéticas mas de ordem de grandeza realista: K_a = [8 1; 1 1,5], K_p = [14 1,5; 1,5 3] e σ²e = 6 kg². Com elas, a h² diária vai de 0,22 aos 60 dias a 0,28 aos 305 dias, e a correlação genética entre a produção aos 60 e aos 280 dias é de 0,58. A quinta resolve as MME, com 37 equações para 36 registros, e calcula EBV305, PTA305, confiabilidade e persistência pelas fórmulas acima.

| Animal | â₀ | â₁ | EBV305 (kg) | PTA305 (kg) | REL305 | Persistência (kg/dia, 280 − 60 d) | REL da persistência |
|---|---|---|---|---|---|---|---|
| T1 (1) | −0,646 | 0,155 | −137,5 | −68,8 | 0,098 | +0,28 | 0,052 |
| T2 (2) | 0,646 | −0,155 | 137,5 | 68,8 | 0,098 | −0,28 | 0,052 |
| 3 | −1,097 | 0,023 | −233,6 | −116,8 | 0,150 | +0,04 | 0,077 |
| 4 | 0,321 | −0,231 | 68,3 | 34,2 | 0,222 | −0,42 | 0,119 |
| 5 | 0,306 | 0,263 | 65,0 | 32,5 | 0,235 | +0,47 | 0,110 |
| 6 | 1,694 | −0,090 | 360,6 | 180,3 | 0,232 | −0,16 | 0,104 |
| 7 | −1,147 | 0,180 | −244,0 | −122,0 | 0,212 | +0,32 | 0,102 |
| 8 | −0,077 | −0,144 | −16,4 | −8,2 | 0,147 | −0,26 | 0,065 |

As soluções de HTD foram 21,04; 22,67; 19,35; 22,79; 18,83 e 21,03 kg, e os coeficientes da curva fixa, −4,33; 0,08 e 1,07. Quatro lições saem do exemplo **[conferido numericamente]**. A primeira é que **comparar produções brutas engana**. A vaca 8 tem a segunda maior média bruta (22,9 kg), mas EBV de −16 kg, porque foi medida no início da lactação, quando toda vaca produz mais. A vaca 4 ficou 1,7 kg/dia abaixo da média geral dos controles (19,33 contra 21,04 kg), mas tem EBV positivo (+68 kg), porque foi medida do meio para o fim da lactação. A segunda é que, com Legendre normalizado num intervalo simétrico, **q = Σφ(t) = (212,84; 0)**; o primeiro elemento, 301 × 0,7071, é o mesmo que Schaeffer (2016, seção 4.5) obtém para a soma de 5 a 305 dias, e o zero do segundo vale para o intervalo simétrico usado aqui. O EBV305 depende só de â₀ e a persistência só de â₁, e por isso as duas medidas são ortogonais nesse modelo de ordem 1. O desvio-padrão genético do EBV305 é de 602 kg. A terceira é que **seis controles dão confiabilidade de apenas 0,15 a 0,24** a uma vaca, e três filhas dão 0,10 a um touro. A persistência é ainda menos confiável (0,05 a 0,12). A quarta é que o nível genético médio do rebanho se confunde com os efeitos de HTD: o modelo só estima diferenças entre animais, e as soluções dos dois touros saem simétricas. É por isso que um rebanho isolado ranqueia, mas não se compara com a população; essa questão volta na seção sobre rebanhos com N menor.

### Quem usa dia de controle e quem usa 305 dias

Segundo uma revisão recente, Canadá, Finlândia, Alemanha, Itália, Países Baixos e Suíça avaliam diretamente com dados de controle diário, enquanto os EUA usam a produção de 305 dias projetada a partir dos controles, que existem desde 1905 e alimentam a avaliação nacional desde 1936 ([PMC10750416](https://pmc.ncbi.nlm.nih.gov/articles/PMC10750416/)). Uma página do Interbull, de data incerta, diz que quase todos os 22 países da UE usam registros de 24 horas por regressão, e que França, Hungria, Itália (para Jersey) e Espanha usam 305 dias em modelo de repetibilidade ([Interbull](https://interbull.org/ib/eurc_dairy_prod_prepdb)). O Canadian Test Day Model (CTDM) usa as três primeiras lactações e foi adotado em 2000, segundo Schaeffer (2016, p. 68), e desde abril de 2016 produção e CCS são avaliadas em dois modelos separados (atribuição provável, [CDN 2016](https://www.cdn.ca/Articles/GEBAPR2016/10_Vision%20of%20%20GE%20Services%20-%20ENGLISH.pdf)). No Brasil, os sumários de Gir, Girolando e Guzerá usam modelo animal de lactação (305 dias) com ambiente permanente e variâncias estimadas por REML (no MTDFREML, no Gir e no Guzerá), e o Gir e o Girolando acrescentam a genômica por ssGBLUP (conferido nos Documentos 235, 266 e 269 da Embrapa; detalhes na seção sobre o Brasil); o modelo oficial da Holandesa não foi confirmado. O Girolando estimou as variâncias em análises uni-característica em 2022 ([DOC 266](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1144061/1/DOC-266-Programa-de-Melhoramento-Genetico-da-Raca-Girolando.pdf), p. 21), e um projeto da Embrapa obteve h² de 0,25 a 0,38 para produção no dia de controle por RRM e sugeriu usar esse fenótipo no lugar da produção na lactação (atribuição provável, [Embrapa, projeto 9545](https://www.embrapa.br/web/gado-de-leite/busca-de-projetos/-/projeto/9545/avaliacao-do-merito-genetico-e-selecao-nas-racas-holandesa-e-girolando-para-caracteristicas-de-importancia-economica)). Em Gir, o RRM com 10.576 primeiras lactações ganhou 2,7% a 3,0% de acurácia sobre o modelo de 305 dias ([PAB](https://www.scielo.br/j/pab/a/RJKr44QrDnPML4fD8XwnM9y/?lang=en)).

As herdabilidades de produção dependem do modelo e da estrutura dos dados. A tabela reúne as citadas nas notas; salvo as linhas marcadas como conferidas, os estudos de terceiros não foram conferidos na verificação de 15/10/2026, e os extremos devem ser conferidos antes de virar parâmetro.

| Característica | População e modelo | h² | Fonte |
|---|---|---|---|
| Leite 305 d (controle diário) | Holandês, Texas | 0,29 (0,23) | [USDA-ARS](https://www.ars.usda.gov/research/publications/publication/?seqNo115=420707) |
| Leite, gordura e proteína 305 d | Holandês, mais de 122 mil lactações | ~0,20; 0,18; 0,18 | [PubMed 9812275](https://pubmed.ncbi.nlm.nih.gov/9812275/) |
| Leite 305 d | EUA, controle diário com GC por piquete | 0,21–0,29 | [PMC12094056](https://pmc.ncbi.nlm.nih.gov/articles/PMC12094056/) |
| Leite; gordura; proteína; G%; P% | Holandês, Irã, RRM em 3 lactações | 0,36–0,38; 0,30–0,31; 0,31–0,32; 0,21–0,25; 0,21–0,22 | [PubMed 34205847](https://pubmed.ncbi.nlm.nih.gov/34205847/) (atribuição a confirmar) |
| ECS | Holandês, três estudos | 0,03 a 0,18 | ver texto |
| Leite 305 d; controle diário | Gir, 3 primeiras lactações | 0,26–0,28; 0,26–0,32 (autorregressivo) | [UFV](https://locus.ufv.br/items/0b0566e5-13fe-4a35-b7b1-433a061a8baa) (atribuição provável) |
| Leite 305 d | Gir, múltiplas lactações | 0,24–0,29 | [PAB 2015](https://apct.sede.embrapa.br/pab/article/view/20433) |
| Leite 305 d; persistência; intervalo de partos; idade ao 1º parto | Girolando, sumário 2022 | 0,29; 0,27; 0,03; 0,12 | [DOC 266](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1144061/1/DOC-266-Programa-de-Melhoramento-Genetico-da-Raca-Girolando.pdf), Tabela 4, p. 22 (conferido) |
| Leite 305 d; idade ao 1º parto | Guzerá, sumário 2022, modelo animal | 0,29; 0,13 | Embrapa/CBMG², Documentos 269 (jul/2022), p. 37 (conferido) |
| Leite 305 d por RRM e por lactação | Girolando, 973 primíparas | 0,31 e 0,24 | [UFV](https://locus.ufv.br/items/69f0f6aa-6b1d-4848-8b47-d2a1d4116ef6) |
| Leite no controle (RRM com genômica) | Girolando | 0,56, repetibilidade 0,84 (valores altos, a conferir) | [UNESP](https://repositorio.unesp.br/entities/publication/8d58acaf-91a3-4814-b8fe-26825f60a670) |
| Leite no controle (Legendre) | Guzerá | 0,24–0,52 | [Ciência Rural](https://www.scielo.br/j/cr/a/9b8hfRxZYMxhHQv6S8LKJyM/?lang=en); [PAB](http://www.scielo.br/j/pab/a/8gCSMXy35PHNVDQfdLJYsgD/?lang=en) |

As herdabilidades tropicais são da mesma ordem que as do Holandês. Diferenças entre populações refletem sobretudo a estrutura dos dados e não devem ser lidas como diferença biológica sem comparação controlada. As notas não acharam correlações genéticas entre produção e teores com fonte verificada; o padrão de fundo, de correlação negativa entre produção e teor de gordura, é **[não verificado]**.

## Fertilidade, parto, longevidade e saúde têm herdabilidade de 1% a 10% e modelos próprios

### Fertilidade: dias abertos viram taxa de prenhez

A fertilidade é medida a partir de eventos: inseminações, diagnósticos de gestação e partos. Nos EUA, a **DPR** (daughter pregnancy rate) converte dias abertos (DO) em taxa de prenhez; as avaliações nacionais começaram em fevereiro de 2003, e a DPR entrou no Net Merit em agosto de 2003. VanRaden et al. (2004) definem **PR = 21/(DO − PEV + 11)**, em que PEV é o período de espera voluntário; no exemplo do artigo, com PEV de 60 dias, um rebanho com média de 154 dias abertos tem PR de 20%, e um com 133 dias, de 25%. O mesmo artigo dá a regra prática de que **cada ponto de PTA de DPR equivale a 4 dias de PTA de dias abertos** e a forma linear **DPR = 0,25 × (233 − DO)**, com os dias abertos limitados a 50 e 250, e informa h² de cerca de 0,04 para as duas medidas (conferido em [VanRaden et al. 2004, J. Dairy Sci. 87:2285-2292](https://queries.uscdcb.com/publish/jds/2004/87_2285.pdf), resumo e pp. 2286-2287 e 2291). A avaliação legada do CDCB fixava o PEV em 50 dias, com carência de 20 dias, e desde agosto de 2026 usa PEV específico de rebanho-ano e grupo de lactação (conferido em [CDCB, Reproductive Performance Traits, agosto de 2026](https://uscdcb.com/wp-content/uploads/2026/05/Reproductive-Performance-Traits-Summary-Final-1.pdf), p. 3). A lógica da fórmula hiperbólica é contar ciclos: o denominador mede, em períodos de 21 dias, quanto a vaca levou para conceber depois do PEV, e o +11 centra a medida em cada período de 21 dias, de modo que as vacas que concebem no primeiro período recebem, em média, 100% de crédito (conferido em VanRaden et al. 2004, p. 2286). Com PEV de 60 dias, uma vaca que concebe por volta de 70 dias tem PR = 21/21 = 100%.

| Dias abertos | PR = 21/(DO − 60 + 11) (%) | DPR linear (%) |
|---|---|---|
| 90 | 51,2 | 35,8 |
| 100 | 41,2 | 33,3 |
| 120 | 29,6 | 28,3 |
| 133 | 25,0 | 25,0 |
| 150 | 20,8 | 20,8 |
| 180 | 16,0 | 13,3 |
| 233 | 11,4 | 0,0 |

As duas formas coincidem entre 133 e 150 dias e divergem nos extremos **[conferido numericamente]**: a forma linear é uma secante da hiperbólica na faixa usual de dias abertos, não uma conversão válida para vacas muito férteis ou muito tardias. O próprio artigo diz que a curva está "far from linear" no intervalo total, mas pode ser bem aproximada por uma reta no intervalo das médias de filhas de touros (VanRaden et al. 2004, p. 2287). O uso de dias abertos preditos para lactações em curso, que a versão anterior registrava como conflito, envolve dois eventos distintos: o uso de registros em curso no cálculo de rotina da DPR começou em novembro de 2003 (conferido em VanRaden et al. 2004, p. 2288; ver também [ARS](https://www.ars.usda.gov/research/publications/publication/?seqNo115=142354)), e as novas equações de dias abertos preditos, que usam o diagnóstico de gestação, entraram em novembro de 2004 (conferido no resumo de Wiggans e Goodling 2005, J. Dairy Sci. 88:1873-1877, [PubMed 15829681](https://pubmed.ncbi.nlm.nih.gov/15829681)).

Desde agosto de 2026, a avaliação americana cobre DPR, taxa de concepção de vacas (CCR) e de novilhas (HCR), a característica nova intervalo do primeiro serviço à concepção (FSC), que não depende do PEV, e o parto precoce (EFC) (conferido em [CDCB, agosto de 2026](https://uscdcb.com/wp-content/uploads/2026/05/Reproductive-Performance-Traits-Summary-Final-1.pdf)). O índice de fertilidade da Holstein USA, revisto em agosto de 2024, é **FI = 0,4·DPR + 0,4·CCR + 0,1·HCR + 0,1·EFC** (antes, o peso da DPR era 0,7), e a diferença entre DPR e CCR vem sobretudo da taxa de serviço e da detecção de cio, que a DPR incorpora e a CCR não ([WW Sires](https://wwsires.com/resources/genetics/holstein-s-fertility-index-shake-up); fonte secundária). Um touro com PTAs de DPR +2,0, CCR +2,5, HCR +1,0 e EFC +0,5 tem FI = 1,95. A forma do modelo é a do modelo animal linear com repetibilidade **[não verificado: as equações do CDCB não foram encontradas]**; o modelo de limiar aparece sobretudo em pesquisa:

```
Linear:   y = Xb + Za + Wp + e     (y = DO, PR, sucesso de cada IA, intervalo ao 1º serviço; X: rebanho-ano-estação, paridade)
Limiar:   y_i = 1 se l_i > 0 ;  l = Xb + Za + e ,  var(e) = 1 ;  P(y = 1) = Φ(x'b + z'a) ;  h²_l = σ²a/(σ²a + 1)
```

A herdabilidade é muito baixa: de 0,02 a 0,04 numa meta-análise de 55 populações citada em resumo agregado ([Science.gov](https://www.science.gov/topicpages/d/dairy+cattle+fertility.html)), de 1% a 4% numa avaliação multicaracterística alemã ([PubMed 18946139](https://pubmed.ncbi.nlm.nih.gov/18946139/)) e de 0,024 a 0,085 em oito características de Holandês chinês, com a idade ao primeiro serviço como exceção (0,39) ([PMC13255800](https://pmc.ncbi.nlm.nih.gov/articles/PMC13255800/)). Na revisão de agosto de 2026, o CDCB reconstruiu as características reprodutivas, e a **h² da DPR passou de 1,4% para 2,9%**; a da CCR, de 1,6% para 2,9%; a da HCR, de 1,0% para 1,4%; a do EFC, de 2,7% para 6,0%; e a FSC estreou com 3,2% (conferido em [CDCB, Reintroducing Reproductive Performance Traits, agosto de 2026](https://uscdcb.com/wp-content/uploads/2026/05/Reproductive-Performance-Traits-Summary-Final-1.pdf), Update 10, p. 3; a imprensa, como [The Bullvine](https://www.thebullvine.com/news/frazz-lionel-dpr-ccr-august-2026/), dava o dia 11 de agosto, que não aparece nos documentos do CDCB lidos, cujo resumo da rodada é de 12/08/2026). O fato mostra que a h² depende da definição e do modelo, não só da biologia. A correlação com a produção é desfavorável e de sinal diferente conforme a medida. Numa análise bayesiana, a h² da concepção ao primeiro serviço foi de 0,031 em novilhas e de 0,034 e 0,028 na 1ª e 2ª lactação; a correlação genética com o leite foi positiva para novilhas (0,08 a 0,29) e negativa para vacas (−0,12 a −0,25) ([Animal](https://www.cambridge.org/core/journals/animal/article/abs/relationships-between-conception-rate-in-holstein-heifers-and-cows-and-milk-yield-at-various-stages-of-lactation/F2C0D9258951A61007644D4F6DEA444A), atribuição pelo título). Num estudo de ureia do leite, a correlação entre produção e não retorno aos 56 dias foi de −0,31 ([PubMed 18946143](https://pubmed.ncbi.nlm.nih.gov/18946143/)). Os dias abertos do Holandês aumentaram 37 dias entre 1960 e 2000, e cerca de 75% disso foi atribuído à seleção para leite ([WSU](https://vetextension.wsu.edu/2014/02/23/genomic-selection-and-reproductive-efficiency-in-dairycattle/); extensão). Por isso CCR, HCR e DPR entram com pesos próprios nos índices. Em Girolando, a h² da idade ao primeiro parto foi de 0,20 e a do intervalo entre partos de 0,00 a 0,08, com h² de 0,20 a 0,28 para o leite em 305 dias e de 0,07 a 0,14 para o período seco (conferido no resumo de Canaza-Cayo et al. 2017, Ital. J. Anim. Sci. 17:22-30, [IJAS](https://www.tandfonline.com/doi/full/10.1080/1828051X.2017.1335180)), a de fertilidade em análise genômica de 0,03 a 0,06 ([Embrapa, EAAP](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1171323/1/Genomic-analysis-of-longevity-with-productive-and-reproductive-traits-in-Girolando-cattle.pdf)), e houve heterose favorável para reprodução em 35.582 vacas ([RBZ](https://www.scielo.br/j/rbz/a/nNRVdQGJVZZSzPbPPyFgc7q/?lang=en)).

### Facilidade de parto: modelo de limiar touro–avô materno

A facilidade de parto é um escore de 1 (sem problema ou não observado) a 5 (dificuldade extrema), analisado na escala latente. Nos EUA, o modelo touro–avô materno (SMGS) foi implementado em agosto de 2002, substituindo o modelo de touro, e publicado em 2003 (conferido em [Van Tassell, Wiggans e Misztal 2003, J. Dairy Sci. 86:3366-3373](https://queries.uscdcb.com/publish/jds/2003/86_3366.pdf), DOI 10.3168/jds.S0022-0302(03)73940-X, [PubMed 14594257](https://pubmed.ncbi.nlm.nih.gov/14594257/), resumo e p. 3368). Quem diz que o USDA o "adotou em 2003" mistura as duas datas. As fontes lidas não dizem por que o modelo animal não foi adotado. Dizem que só cerca de metade dos registros de facilidade de parto tinha o avô materno identificado, taxa que subiu de 58% para 73% com a integração ao banco de produção, e que a aproximação de confiabilidade é razoável porque as herdabilidades são baixas e o modelo é de touro e avô materno, não animal (Van Tassell et al. 2003); e que o modelo touro–avô convergiu em menos de 50 iterações (conferido no resumo de Wiggans, Misztal e Van Tassell 2003, J. Dairy Sci. 86:1845-1848, [PubMed 12778596](https://pubmed.ncbi.nlm.nih.gov/12778596/)). A estrutura do modelo confere, em notação equivalente, com Van Tassell et al. (2003, p. 3368): o rebanho-ano é aleatório; há efeitos fixos de ano-estação, ordem de parto-sexo da cria e grupos de ano de nascimento do touro e do avô materno; e o primeiro limiar é fixado em zero. A decomposição de s e g em efeitos direto e materno não está escrita no artigo; é uma derivação deste relatório, coerente com as correlações que ele publica, de 0,48 entre touro e avô, 0,59 só da parte direta e −0,12 entre direto e materno **[conferido numericamente]**:

```
l_ijkl = RA_i + x'β + s_j + g_k + e_ijkl ,  e ~ N(0, 1) ,  RA = rebanho-ano (aleatório) ;  x'β: ano-estação, ordem-sexo, grupos de nascimento
s_j = ½·d_j  (touro do bezerro: metade do efeito direto)
g_k = ¼·d_k + ½·m_k  (avô materno: um quarto do direto e metade do materno)
por touro:  var(s) = ¼σ²d ;  var(g) = (1/16)σ²d + ¼σ²m + ¼σdm ;  cov(s, g) = ⅛σ²d + ¼σdm
categoria k observada se t_{k−1} < l ≤ t_k :  P(y = k) = Φ(t_k − μ) − Φ(t_{k−1} − μ)
```

Os componentes vêm de Wiggans, Misztal e Van Tassell (2003, J. Dairy Sci. 86:1845-1848, DOI 10.3168/jds.S0022-0302(03)73771-0), que os estimaram em cinco amostras de cerca de 200 mil registros cada. Eles escolheram o conjunto de 0,438 para rebanho-ano, 0,022 para touro, 0,016 para avô materno e 0,009 para a covariância touro–avô, que deu herdabilidades "among the highest" das cinco amostras, **h² direta de 0,086 e materna de 0,048**, com correlação direta–materna próxima da média (−0,12) (conferido no resumo, [PubMed 12778596](https://pubmed.ncbi.nlm.nih.gov/12778596/)). Van Tassell et al. (2003, p. 3368), ao descrever a implantação, dão rebanho-ano de 0,434 e h² direta de 0,084 e materna de 0,048 sem o rebanho-ano no denominador, ou 0,059 e 0,034 com ele; a diferença entre 0,438 e 0,434 e entre 0,086 e 0,084 está nos dois artigos e não é explicada. As relações acima permitem reconstruir o resto: σ²d = 4 × 0,022 = 0,088, σdm = −0,008, σ²m = 0,050 e correlação direta–materna de −0,12. Com fenotípica 1 + σ²s + σ²g = 1,038, saem h² direta de 0,085 e materna de 0,048; incluindo o rebanho-ano (0,438) no denominador, 0,060 e 0,034 **[conferido numericamente]**. O artigo de implantação confirma que as h² publicadas excluem o rebanho-ano. A natimortalidade usa o mesmo modelo, com h² direta de 0,030 e materna de 0,058 e correlação genética de −0,02 entre os dois efeitos, e entra com a facilidade de parto num índice de capacidade de parto, −4 × (facilidade de parto do touro) − 3 × (facilidade de parto das filhas) − 4 × (natimortalidade do touro) − 8 × (natimortalidade das filhas) (conferido no resumo de Cole, Wiggans, VanRaden e Miller 2007, J. Dairy Sci. 90:2489-2496, [DOI 10.3168/jds.2006-436](https://doi.org/10.3168/jds.2006-436); o artigo de avaliação é Cole, Wiggans e VanRaden 2007, J. Dairy Sci. 90:2480-2488, DOI 10.3168/jds.2006-435). Um modelo touro–mãe (SMAT) gerou avaliações semelhantes às do SMGS ([PMC12958189](https://pmc.ncbi.nlm.nih.gov/articles/PMC12958189/)). Em Holandesas e Jerseys acasaladas com touros de corte, a h² materna subiu de 0,02–0,04 na primeira lactação para 0,19–0,26 com três lactações ([JDS, dez/2025, pelo título do registro](https://doaj.org/article/f1fb4e9984b8408fa7b797035d430c12)), e em 320.953 registros de bovinos leiteiros portugueses o modelo de limiar deu h² direta de 0,09 contra 0,04 a 0,05 dos modelos lineares (conferido no resumo de Silvestre et al. 2018, Ital. J. Anim. Sci. 18:80-87, [IJAS](https://www.tandfonline.com/doi/full/10.1080/1828051X.2018.1482801)). As notas não acharam estimativas brasileiras de facilidade de parto em Holandês ou Girolando.

### Longevidade: vida produtiva e análise de sobrevivência

Na definição de 2005, a vida produtiva (PL) americana somava os dias em lactação até os 84 meses de idade, com teto de 305 dias por lactação; o artigo comparou tetos de 305, 500 e 999 dias e recomendou tetos maiores para lactações longas (conferido no resumo de Tsuruta, Misztal e Lawlor 2005, J. Dairy Sci. 88:1156-1165, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S002203020572782X)). A definição atual do CDCB não foi conferida. A PTA publicada combina a medida direta, que vem dos descartes do controle leiteiro (DHIA), com preditores indiretos de tipo e produção, como uma avaliação multicaracterística aproximada ([Holstein USA](https://www.holsteinusa.com/genetic_evaluations/ss_Gen_Eval_for_PL.html)). Na literatura, o modelo padrão é o de riscos proporcionais com linha de base Weibull, que aproveita como censuradas as vacas ainda vivas. A forma abaixo confere com as Equações 1 e 2 do Survival Kit, incluindo efeitos aleatórios normais com estrutura de pedigree, censura à direita, versão por partes e covariáveis dependentes do tempo (conferido em [Mészáros, Sölkner e Ducrocq 2013, Comput. Methods Programs Biomed. 110:503-510](https://pmc.ncbi.nlm.nih.gov/articles/PMC3693034/)); o artigo original de Ducrocq (J. Dairy Sci. 1994, 77:855) é pago, e a relação σ²s = σ²a/4 do modelo de touro é deste relatório:

```
λ_i(t) = λ₀(t)·exp(x_i'β + z_i'u) ,   λ₀(t) = λρ(λt)^(ρ−1)   (ρ > 1: risco crescente ; ρ = 1: constante)
u ~ N(0, Aσ²u)  (ou touro, com σ²s = σ²a/4) ;  exp(β) = fator multiplicativo do risco de descarte
vaca viva no fim dos dados: entra com o tempo até a última observação (censura à direita)
versão por partes ("piecewise"): λ₀ muda por lactação ou estágio ; efeitos dependentes do tempo (rebanho-ano) para manter a proporcionalidade
```

Os riscos só são proporcionais se efeitos que variam no tempo, como rebanho-ano, entrarem no modelo ([JDS 2006, Japão](https://www.sciencedirect.com/science/article/pii/S0022030206724493)). A linha de base por lactação foi usada no Canadá ([JDS 2005](https://www.journalofdairyscience.org/article/S0022-0302(05)72696-5/fulltext)), e a proporcionalidade foi checada graficamente em 2,44 milhões de vacas de seis raças suíças ([PMC13264184](https://pmc.ncbi.nlm.nih.gov/articles/PMC13264184)). A h² efetiva, sem censura, foi de **7,8%** no Holandês brasileiro com Weibull por partes ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1871141316300191), atribuição a confirmar). A escala pesa: em 268.008 vacas Jersey, com modelo de touro Weibull, a h² foi de 4,7% na escala logarítmica e de 18,0% na original (conferido no resumo de Caraviello, Weigel e Gianola 2004, J. Dairy Sci. 87:1469-1476, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022030204732981)). Em Girolando, indicadores de longevidade produtiva tiveram h² de 0,06 a 0,31 ([Embrapa, EAAP](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1171323/1/Genomic-analysis-of-longevity-with-productive-and-reproductive-traits-in-Girolando-cattle.pdf)). Nos EUA, um GWAS usou 1.103.641 vacas Holandesas com fenótipo de PL ([PMC11426094](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11426094/)). A PTA de PL e a estimativa de riscos proporcionais estão em escalas diferentes e não se comparam diretamente.

### Saúde: ocorrências do produtor em escala de limiar ou linear

O CDCB publica avaliações genômicas de resistência a seis doenças (febre do leite, deslocamento de abomaso, cetose, mastite, metrite e retenção de placenta) em Holandês desde abril de 2018, em Jersey desde abril de 2020 e em Pardo-Suíço desde agosto de 2022 (conferido em [CDCB, pesquisa](https://uscdcb.com/research), "Health Trait Evaluations"). A inclusão no Net Merit em agosto de 2018 não foi conferida ([CDCB, agosto de 2018](https://uscdcb.com/wp-content/uploads/2023/08/CDCB-changes-to-evaluation-system-August-2018-_-Council-on-Dairy-Cattle-Breeding-1.pdf); [Parker Gaddis et al., WCGALP 2018](https://www.uscdcb.com/wp-content/uploads/2018/04/WCGALP2018Paper_Gaddis_HealthEval_final.pdf)). O modelo foi revisto em abril de 2024 porque os registros triplicaram ou quadruplicaram: os de Holandês iam de 1,2 a 2,2 milhões por doença em 2018 e passaram a 4,3 a 7,7 milhões, somadas as três raças; os pesos dos registros, antes 0 ou 1, passaram a 0 ou 0,25 a 1,46, conforme a lactação e a característica (conferido na mesma página do CDCB). As avaliações de saúde de bezerras, para diarreia (h² de 2,6%) e doença respiratória (2,2%), saem como PTA em pontos percentuais de resistência ([Bovine Vet](https://www.bovinevetonline.com/news/cdcb-launches-first-national-genetic-evaluations-calf-health); fonte secundária) e entraram nas avaliações nacionais de Holandês e Jersey em agosto de 2026 ([CDCB](https://uscdcb.com/august-2026-evaluation-recap/)). No Canadá, produtores registram oito condições desde abril de 2007, com incidências de 2,3% (febre do leite) a 9,7% (mastite) e h² na escala latente de 0,02 (metrite) a 0,21 (deslocamento de abomaso) (conferido no resumo de Neuenschwander et al. 2012, Animal 6:571-578, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1751731111002059)). Nos países nórdicos, a saúde do úbere do NTM junta mastite clínica, CCS, inserção anterior e profundidade do úbere ([JDS 2023](https://www.sciencedirect.com/science/article/pii/S0022030223003466), atribuição a confirmar), e a mastite é avaliada em modelo de limiar bivariado ([NordicEBV, publicações](https://nordicebv.info/papersandpresentations/papers/)).

A h² observada é minúscula: 0,003 para metrite e cetose, 0,020 para mastite e 0,050 para doenças de casco em 16.703 lactações de 8.237 Holandesas eslovacas (conferido no resumo de Chalupková, Costa, Zavadilová e Moravčíková 2026, Ital. J. Anim. Sci. 25:85-97, [Tandfonline](https://www.tandfonline.com/doi/full/10.1080/1828051X.2026.2615481)). A escolha entre limiar e linear é o ponto de **conflito entre fontes**. Em Holandeses chineses, o limiar deu h² de até 0,226 contra até 0,048 do linear ([PubMed 37746924](https://pubmed.ncbi.nlm.nih.gov/37746924)). Num estudo britânico antigo, o limiar deu h² maiores, mas o modelo linear teve desempenho igual ou melhor para quase todas as características ([ResearchGate](https://www.researchgate.net/publication/256493033_Linear_and_threshold_model_genetic_parameters_for_disease_fertility_and_milk_production_in_dairy_cattle), atribuição a confirmar). Parte da discrepância é só de escala, e a fórmula de Dempster e Lerner mostra quanto **[fórmula não verificada na fonte; conferida numericamente]**:

```
h²_obs = h²_l · z² / [p(1 − p)] ,   z = densidade normal no limiar Φ⁻¹(1 − p) ,  p = incidência
```

| Incidência | Fator z²/[p(1 − p)] | h²_obs se h²_l = 0,10 | h²_obs se h²_l = 0,20 |
|---|---|---|---|
| 2% | 0,120 | 0,012 | 0,024 |
| 5% | 0,224 | 0,022 | 0,045 |
| 10% | 0,342 | 0,034 | 0,068 |
| 20% | 0,490 | 0,049 | 0,098 |

Com incidência de 5%, uma h² latente de 0,10 aparece como 0,022 na escala 0/1. A escolha do modelo deve ser justificada pela incidência, e as variâncias precisam ser reestimadas à medida que o registro de doenças se intensifica, como mostrou a revisão americana de 2024.

### Tipo, manejo e eficiência alimentar

Os escores lineares de conformação medem grau, não preferência. A ICAR exige uma escala que cubra a faixa biológica da população ([ICAR, Seção 5](https://wiki.icar.org/index.php/Conformation_Recording)), de 1 a 9 com âncoras em 1, 5 e 9 no documento de 2015 ([ICAR 2015](https://old.icar.org/Documents/Board/2015/2015-07-21/Docs/Appendix%204%20Conformation%20Recording_(CR%20WG).pdf)). A avaliação é multicaracterística linear, com var(a) = G₀ ⊗ A, e os compostos são somas ponderadas de PTAs, Composto = Σ w_k·PTA_k **[não verificado]**. A Holstein USA publica h² de 0,17 para o escore de pés e pernas, 0,15 para ângulo do casco, 0,11 para pernas traseiras vista posterior, 0,28 para profundidade do úbere e 0,26 para tamanho de teto, e usa **peso negativo em estatura** nos compostos para melhorar úbere e pernas sem aumentar a vaca ([Holstein USA](https://www.holsteinusa.com/genetic_evaluations/ss_linear.html)). Em 2026 a associação criou o Holstein Conformation Composite (HCC), com 18 características lineares ponderadas pela relação com longevidade, produção e equilíbrio ([Holstein USA, março de 2026](https://www.holsteinusa.com/pdf/committee/Genetic%20Advancement%20Committee%20Recommendations_Approved%20March%202026.pdf)). No Holandês brasileiro, as h² de tipo vão de 0,09 a 0,38 ([Animal Bioscience](https://www.animbiosci.org/journal/view.php?doi=10.5713%2Fajas.14.0288)); as notas não acharam características lineares de Gir ou Girolando. Temperamento e velocidade de ordenha, as principais características de manejo, têm h² de 0,08 a 0,25 e de 0,10 a 0,24 ([Animal Frontiers](https://academic.oup.com/af/article/10/2/29/5814667), atribuição a confirmar); no Holandês canadense, 0,128 e 0,139, com correlação genética de 0,247 ([PubMed 21183064](https://pubmed.ncbi.nlm.nih.gov/21183064)).

A eficiência alimentar é medida como consumo residual (RFI), o resíduo do consumo observado em relação ao esperado por produção, peso e variação de peso **[forma não verificada]**. A h² vai de 0,05 a 0,43, conforme a regressão de exigência seja fenotípica ou genética ([1994](https://www.sciencedirect.com/science/article/abs/pii/030162269400056D); [Frontiers 2024](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2024.1462306/full); [JDS 2023, RRM](https://www.journalofdairyscience.org/article/S0022-0302(23)00620-3/fulltext)), de modo que os valores só se comparam com a definição explícita. O CDCB lançou o Feed Saved em 1º de dezembro de 2020, em libras de alimento economizado por lactação, construído a partir do composto de peso corporal e do RFI. Um touro com +200 lb tem filhas que comem cerca de 200 lb a menos que o previsto. O Feed Saved fica fora do NM$ para não contar o peso corporal duas vezes, e o RFI entrou no NM$ em agosto de 2021, com h² de 19%, dentro da faixa acima (conferido em [CDCB, Feed Saved](https://uscdcb.com/feed-saved)). O Canadá tem avaliação de eficiência para Holandês desde abril de 2021 ([Dairy Producer](https://dairyproducer.com/canada-among-the-first-to-indroduce-feed-efficiency/)). As notas não acharam avaliações de metano nem de eficiência alimentar no Brasil.

### Tolerância ao calor: norma de reação sobre o THI

Ravagnolo e Misztal (2000, J. Dairy Sci. 83:2126-2130, DOI 10.3168/jds.S0022-0302(00)75095-8) modelaram a tolerância ao calor com **dois efeitos genéticos aleatórios**, um para a produção em condição termoneutra e outro para a taxa de declínio sob estresse, usando 119.205 controles de 15.002 primíparas Holandesas em 134 rebanhos da Geórgia. Abaixo de **THI 72**, a h² do leite foi de 0,17 e a variância aditiva da tolerância foi nula; em THI 86, a variância da tolerância igualou a do efeito geral; e a correlação genética entre os dois efeitos foi de −0,36, ou seja, a seleção para produção reduz a tolerância (conferido no resumo; texto integral não lido, [J. Dairy Sci. 2000](https://www.journalofdairyscience.org/article/S0022-0302(00)75095-8/pdf)). Que o THI foi o melhor índice testado vem do artigo gêmeo, Ravagnolo, Misztal e Hoogenboom (2000, J. Dairy Sci. 83:2120-2125, com 119.337 controles de 15.012 vacas). Bohmanova et al. (2005) aplicaram o método em escala nacional a 57.315.661 controles de primeira lactação de 6.906.815 Holandesas americanas paridas de 1993 a 2004, com THI horário de 202 estações meteorológicas. O modelo deles traz classes de DEL de 10 dias como efeito fixo, frequência de ordenha e regressão aleatória sobre o estresse tanto no efeito genético quanto no ambiente permanente (conferido em [Bohmanova et al. 2005, Interbull Bulletin 33:160-162](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2005/IB_33_160_BohmanovaEtAl.pdf), "Model"):

```
y_ijkℓm = htd_i + dim_j + idade_k + freq_ℓ + a_m + p_m + α_m·t + π_m·t + e_ijkℓm
htd = rebanho-dia de controle (fixo) ;  dim = classe de DEL de 10 dias (37 classes) ;  idade = classe de idade ao parto ;  freq = 1 ou 2 ordenhas
a, p = efeitos genético e de ambiente permanente gerais ;  α, π = regressões aleatórias genética e de ambiente permanente sobre o estresse t
t = 0 se THI < 72 ;  t = THI − 72 se THI ≥ 72        (THI médio do dia, calculado de dados horários)
THI = [1,8·temp + 32] − [0,55 − 0,0055·UR]·[1,8·temp − 26]     (temp em °C ; UR = umidade relativa, %)
[a; α] ~ N(0, G₀ ⊗ A) ;  p e π com variâncias e covariância próprias (σ²p, σ²π, σ_pπ)
σ²g(t) = σ²a + 2t·σ_aα + t²·σ²α     (variância genética quadrática em t)
valor genético do touro sob estresse t:  â + t·α̂
```

A variância quadrática em t é consequência do modelo, porque é a variância de a + t·α, e aparece também em Misztal et al. ([WCGALP 2002](https://www.inia.uy/sites/default/files/publications/2024-10/Misztal-et-al2002-WCGALP.pdf)); a função por partes está em Bohmanova et al. (2005) e em Misztal (2006) (atribuição a confirmar, [USDA-ARS](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2006/8WC_Misztal_01-12.pdf)). Apesar da avaliação nacional descrita por Bohmanova et al., a imprensa relata que o CDCB ainda não publica a característica ([The Bullvine](https://www.thebullvine.com/news/197-bulls-8-years-zero-in-your-nm-catalog-the-heat-tolerance-trait-cdcb-still-wont-publish/); fonte secundária, só o título foi lido). Um exemplo com G₀ hipotética = [4,0 −0,10; −0,10 0,010] (kg²/dia; correlação de −0,5 entre nível e inclinação) mostra o efeito. A variância genética cai de 4,0 em t = 0 para 3,0 em t = 10 e volta a 3,25 em t = 15. O touro A (â = +1,2 kg/dia; α̂ = −0,10) vale +1,2, +0,7, +0,2 e −0,3 kg/dia em t = 0, 5, 10 e 15, e o touro B (+0,6; +0,01) vale +0,6, +0,65, +0,7 e +0,75. **A ordem se inverte a cerca de 5,5 unidades de THI acima do limiar** **[conferido numericamente]**. É a reclassificação que justifica avaliar tolerância separadamente onde o verão é longo.

O limiar é um conflito em aberto, e depende da população e da fonte climática; o limiar de cada população deve ser estimado. Foi de 72 no estudo original e na avaliação nacional americana (conferido em Ravagnolo e Misztal 2000 e em Bohmanova et al. 2005), o único valor confirmado em fonte primária; um estudo de 2023 citado pela imprensa usa 69 para Holandês nos EUA ([The Bullvine](https://www.thebullvine.com/news/heat-tolerance-genetics-thi-threshold/); fonte secundária). Uma avaliação brasileira com dados da NASA POWER e de estações, com 253.972 vacas Holandesas em 1.013 rebanhos e 20.388 vacas Gir em 316 rebanhos, achou limiar de **67 para Holandês e de 70 a 75,85 para Gir**, conforme a fonte climática, e perdas por unidade de THI de 0,52 a 1,56 kg/dia no Holandês contra 0,37 a 0,44 no Gir, com h² de cerca de 0,23 nas duas raças ([PubMed 41887511](https://pubmed.ncbi.nlm.nih.gov/41887511/), atribuição a confirmar). Em Girolando, os limiares foram de 80 (1/4 Holandês) a 77 (7/8 Holandês), a h² da produção regredida no THI foi de 0,21, e a correlação genética entre produção e efeito do calor foi de −0,35 a −0,92 ([ResearchGate](https://www.researchgate.net/publication/374903428_Genomic-enhanced_breeding_values_for_heat_stress_tolerance_in_Girolando_cattle_in_Brazil), atribuição a confirmar). O sumário do Girolando de 2022 incorporou um índice de tolerância ao estresse térmico com h² de 0,21 (conferido no Documentos 266, Tabela 4, p. 22), e a Embrapa afirma que é a única raça brasileira com esse índice, o que não foi conferido ([Embrapa](https://www.embrapa.br/en/busca-de-noticias/-/noticia/71806796/sumario-de-touros-girolando-incorpora-15-novas-caracteristicas-ao-melhoramento-genetico-da-raca)). Na Austrália, o Heat Tolerance ABV do DataGene existe desde dezembro de 2017, só genômico, em base 100 (105 ≈ 5% mais tolerância), com confiabilidade de 48% em Holandês e 39% em Jersey. O DataGene recomenda usar touros acima de 100 e vários touros para compensar a confiabilidade baixa, porque a seleção forte só por tolerância prejudica a produção ([DataGene, Technote 18](https://www.datagene.com.au/wp-content/uploads/2023/11/Technote-18-Heat-Tolerance-ABV.pdf)). Num estudo fenotípico com 150 vacas Holandesas, das quais 20 sensíveis e 20 tolerantes ao calor, as correlações entre a tolerância e os valores genômicos dos índices australianos foram de −0,28 a −0,74; não se trata de uma correlação genética populacional (conferido no resumo de Osei-Amponsah et al. 2023, Animals 13:2259, [DOI 10.3390/ani13142259](https://doi.org/10.3390/ani13142259)).

A tabela reúne as herdabilidades das características funcionais citadas nesta seção. As escalas diferem, e os números servem como ordem de grandeza.

| Característica | h² | Escala ou modelo | Fonte |
|---|---|---|---|
| DPR; CCR; HCR; FSC; EFC (EUA, agosto de 2026) | 0,029; 0,029; 0,014; 0,032; 0,060 (antes: DPR 0,014, CCR 0,016, HCR 0,010, EFC 0,027) | linear | [CDCB, agosto de 2026](https://uscdcb.com/wp-content/uploads/2026/05/Reproductive-Performance-Traits-Summary-Final-1.pdf) (conferido) |
| Fertilidade feminina, vários traços | 0,01–0,085 | linear, multicaracterística | [PubMed 18946139](https://pubmed.ncbi.nlm.nih.gov/18946139/); [PMC13255800](https://pmc.ncbi.nlm.nih.gov/articles/PMC13255800/) |
| Concepção ao 1º serviço (novilha; 1ª; 2ª lactação) | 0,031; 0,034; 0,028 | limiar bayesiano | [Animal](https://www.cambridge.org/core/journals/animal/article/abs/relationships-between-conception-rate-in-holstein-heifers-and-cows-and-milk-yield-at-various-stages-of-lactation/F2C0D9258951A61007644D4F6DEA444A) |
| Girolando: IPP; IEP; fertilidade | 0,20; 0,00–0,08; 0,03–0,06 | REML; genômica | [IJAS 2017](https://www.tandfonline.com/doi/full/10.1080/1828051X.2017.1335180) (resumo conferido); [Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1171323/1/Genomic-analysis-of-longevity-with-productive-and-reproductive-traits-in-Girolando-cattle.pdf) |
| Facilidade de parto direta; materna | 0,086; 0,048 (0,084; 0,048 no artigo de implantação) | limiar SMGS | Wiggans et al. 2003, [PubMed 12778596](https://pubmed.ncbi.nlm.nih.gov/12778596/); Van Tassell et al. 2003 (conferidos) |
| Natimortalidade direta; materna | 0,030; 0,058 | limiar SMGS | Cole et al. 2007, [DOI 10.3168/jds.2006-436](https://doi.org/10.3168/jds.2006-436) (resumo conferido) |
| Vida produtiva | 0,078 (Holandês Brasil); 0,06–0,31 (Girolando, indicadores) | Weibull; genômica | ver texto |
| Mastite; metrite e cetose | 0,02; 0,003 (linear) até 0,226 (limiar) | observada ou latente | ver texto |
| Diarreia; respiratória (bezerras) | 0,026; 0,022 | — | [Bovine Vet](https://www.bovinevetonline.com/news/cdcb-launches-first-national-genetic-evaluations-calf-health) (secundária) |
| Tipo linear | 0,11–0,28 (EUA); 0,09–0,38 (Brasil) | multicaracterística | ver texto |
| Temperamento; velocidade de ordenha | 0,08–0,25; 0,10–0,24 | — | [Animal Frontiers](https://academic.oup.com/af/article/10/2/29/5814667) |
| Tolerância ao calor | 0,21 (Girolando, índice do sumário) | RR sobre THI | ver texto |
| RFI | 0,05–0,43 | depende da regressão de exigência | ver texto |

## A genômica leiteira nasceu em várias etapas e caminha para o passo único

### Multi-step: DYD, prova desregredida e efeitos de SNP

A avaliação genômica oficial dos EUA, no esquema de várias etapas apresentado por VanRaden et al. ([J. Dairy Sci. 92:16](https://queries.uscdcb.com/publish/jds/2009/92_16.pdf)), estava programada para janeiro de 2009: as duas fontes lidas são anteriores à implantação e dizem que as predições genômicas "will be officially implemented in 2009" (VanRaden et al. 2009, p. 24) e estavam "scheduled to replace traditional USDA evaluations in January 2009" ([VanRaden, NSIF 2008](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2008/NSIF_pvr.pdf)). A validação usou 38.416 SNPs do chip BovineSNP50 em 5.335 touros Holandeses, prevendo os desvios de filhas de janeiro de 2008 de 1.759 touros nascidos de 1999 a 2002 a partir das avaliações de agosto de 2003 de 3.576 nascidos antes. Na média de 27 características, a confiabilidade realizada foi de 50% contra 27% da média dos pais, um ganho de informação equivalente a 11 filhas com registro, e dobrar o número de touros genotipados elevou mais a confiabilidade que dobrar o número de marcadores (conferido em [VanRaden et al. 2009, J. Dairy Sci. 92:16-24](https://queries.uscdcb.com/publish/jds/2009/92_16.pdf), resumo e pp. 18-23). As etapas 1 e 4 conferem com a implementação do USDA descrita no mesmo artigo (pp. 18-19): na etapa 1, o USDA ponderou o desvio das filhas pela confiabilidade vinda das filhas, calculada pelas DE totais menos as DE da média dos pais, e os pesos de Garrick et al. (2009) são a alternativa proposta depois; na etapa 4, a predição final combinou três termos por índice de seleção. A notação das etapas 2 e 3 é reconstruída **[não verificado]**:

```
Etapa 1  pseudofenótipo: DYD (touros) ou prova desregredida DRP_i ≈ EBV_i(sem pais) / r²_i(sem pais)
         peso no USDA (2009): confiabilidade das filhas = REL das DE totais menos as DE da média dos pais
         peso proposto por Garrick et al. (2009):  w_i = (1 − h²) / { [c + (1 − r²_i)/r²_i] · h² }
         c = fração da variância genética não explicada pelos marcadores
Etapa 2  efeitos de SNP:  DRP = 1μ + Mα + e ,  var(α) = Iσ²α ,  var(e_i) = σ²e / w_i     (SNP-BLUP ponderado, ou modelo não linear)
         α̂ = (M'WM + λI)⁻¹ M'W (DRP − 1μ̂)
Etapa 3  valor genômico direto do candidato:  DGV_j = m_j'α̂
Etapa 4  GEBV = índice de seleção com três termos: (1) DGV ; (2) PA calculada só com os ancestrais genotipados,
         pelo parentesco tradicional ; (3) PA ou PI publicada
```

Garrick, Taylor e Fernando mostraram que a desregressão correta divide o EBV, sem a informação dos pais, pela confiabilidade, e que **nem a confiabilidade nem a PEV são os pesos corretos**, apesar de terem sido usadas antes (conferido em [Garrick et al. 2009, Genet. Sel. Evol. 41:55, DOI 10.1186/1297-9686-41-55](https://doi.org/10.1186/1297-9686-41-55), resumo). Um EBV de +300 kg com r² = 0,50 desregride para +600 kg. Com h² = 0,30 e c = 0,5, o peso vale 4,22 para r² = 0,95, 3,11 para 0,80, 1,56 para 0,50 e 0,52 para 0,20; com c = 0,1, vai de 15,29 a 0,57 **[conferido numericamente]**. Quanto menor a parte explicada pelos marcadores, menos a confiabilidade discrimina, porque o erro residual domina de qualquer jeito. A desregressão de Jairath et al. (1998), que monta MME completas, superou a de Garrick em acurácia e viés num estudo com Holandês chinês, mas teve mais viés em simulação; o trabalho que provavelmente reporta isso não foi lido ([Animal](https://resolve.cambridge.org/core/journals/animal/article/accuracy-and-bias-of-genomic-prediction-with-different-deregression-methods/B151A3B1B13CB3478458F45B2894951F)).

O multi-step tem dois defeitos que motivam o passo único. O primeiro é que ele não usa todos os dados e tende a subestimar as tendências genéticas, como reconhece o próprio CDCB ([CDCB, pesquisa](https://uscdcb.com/research)). O segundo é o **viés de pré-seleção genômica**: o BLUP supõe que os termos de amostragem mendeliana têm esperança zero, e a pré-seleção genômica viola essa suposição, porque os touros foram escolhidos pelo genoma antes de ter filhas; a solução proposta é incluir na avaliação BLUP a informação de todos os touros genotipados, inclusive os descartados (conferido em [Patry e Ducrocq 2011, Genet. Sel. Evol. 43:30](https://link.springer.com/article/10.1186/1297-9686-43-30), resumo; ver também [Jibrila et al. 2021](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12533)). O artigo do GSE é de simulação, com dados franceses reais como base, e a evidência do viés em dados reais é de outro artigo dos mesmos autores, "Evidence of biases in genetic evaluations due to genomic preselection in dairy cattle" (J. Dairy Sci. 2011). Na França, os valores genômicos de touros jovens caíam quando as primeiras filhas produziam, porque só os melhores chegavam a ter filhas. O single-step corrigiu isso, com inclinações entre 0,97 e 1,03 na regressão dos desvios das filhas sobre os valores genômicos anteriores ([HAL/INRAE 2022](https://hal.inrae.fr/hal-04030691v1)).

### Single-step em populações leiteiras: o que muda em relação ao corte

A forma de H⁻¹, os ajustes de G e o APY estão no relatório de corte. O que é específico do leite são a escala e três problemas. A escala: em 15/10/2026, a página do CDCB informava **94.827.036 animais com avaliação genética (agosto de 2026)**, mais de 13 milhões de genótipos no banco nacional (junho de 2026), 93% de fêmeas entre os genotipados (setembro de 2025) e 50 características calculadas (conferido em [CDCB](https://uscdcb.com/), "CDCB by the Numbers"). A parcela de 89% de Holandesas entre os genotipados não aparece na página **[não verificado]** ([CDCB, estatísticas](https://uscdcb.com/database-stats)). Um ssGBLUP exploratório de 2022 usou cerca de 49 milhões de lactações, 89 milhões de animais no pedigree e cerca de 5 milhões de genotipados ([ADSA 2022, Cesarani et al.](https://aipl.arsusda.gov/publish/jds/submit/ADSA2022_Cesarani.html)). Na implementação multirracial americana, o núcleo do APY tinha cerca de 45 mil animais e cerca de 2 milhões ficavam fora dele; para as quatro características de fertilidade, a inversa levou 28 horas e 100 GB de RAM ([Interbull](https://journal.interbull.org/index.php/ib/article/view/1924)). O núcleo do APY em leite tem cerca de 15 mil animais pela regra dos autovalores que explicam 98% da variância de G ([PMC5088690](https://pmc.ncbi.nlm.nih.gov/articles/PMC5088690/)), mas a escolha do núcleo mudou predições de Holandês em até 45% do desvio-padrão genético ([JAS 2020](https://academic.oup.com/jas/article/98/12/skaa374/5992278)).

O primeiro problema é o pedigree incompleto, tratado por grupos de pais desconhecidos (UPG) ou metafundadores ([Masuda et al. 2021](https://www.researchgate.net/publication/356344145_Invited_review_Unknown-parent_groups_and_metafounders_in_single-step_genomic_BLUP)). Em fertilidade multirracial americana, o melhor em viés, dispersão e correlação foi o ssGBLUP com metafundadores e 10% de resíduo poligênico ([Tabet et al. 2024](https://www.journalofdairyscience.org/article/S0022-0302%2824%2901234-7/fulltext)). O segundo é a avaliação multirracial: com cinco raças, a predictabilidade e a confiabilidade de Ayrshire, Pardo-Suíço e Guernsey ficaram 7% e 2% abaixo das avaliações por raça ([JDS 2022](https://www.journalofdairyscience.org/article/S0022-0302%2822%2900154-0/fulltext)). O terceiro é a pré-seleção, que o single-step resolve se a informação genômica entrar na avaliação nacional conjunta. O cronograma americano está nas palavras do CDCB: o trabalho com ssBLUP "começou em janeiro de 2023", e o alvo é ter "até o fim de 2026 um protótipo bem testado" para avaliar e decidir a implementação ([CDCB, pesquisa](https://uscdcb.com/research)). Até lá, a avaliação genômica americana segue multi-step, mesmo com mudanças recentes: UPGs estrangeiros e domésticos combinados em abril de 2024, com correlações acima de 0,9997 entre as PTAs antes e depois ([CDCB](https://uscdcb.com/april-2024-evaluation-changes-whats-new/)), e dados de genotipagem por sequenciamento anunciados em junho de 2025 ([CDCB](https://uscdcb.com/author_category/cdcb/)).

### Confiabilidade genômica: por que fertilidade exige referência enorme

A aproximação determinística mais citada é **REL = N·h²/(N·h² + Me)**, em que N é o tamanho da referência, h² a herdabilidade do pseudofenótipo e Me o número efetivo de segmentos independentes ([slides SISG](https://cnsgenomics.com/data/teaching/SISG/module_7/Mod7_BH_Day1GenomicSelection_PartB.pdf), resumo de busca) **[não verificado no artigo de Daetwyler et al.]**. Com Me = 5.000 (valor ilustrativo), REL de 0,50 exige 16.667 animais com fenótipo próprio para h² = 0,30, mas **125 mil para h² = 0,04**. Para REL de 0,70, os números são 38.889 e 291.667 **[conferido numericamente]**. É por isso que o leite usa touros com DRP como referência: um touro com 100 filhas tem pseudofenótipo de confiabilidade ~0,87, que entra na fórmula no lugar de h². Com 1.000, 5.000 e 20.000 touros assim, a REL vai a 0,15, 0,47 e 0,78. E é por isso que os EUA já trabalham com fenótipos de fertilidade e de vida produtiva de cerca de um milhão de vacas genotipadas, como mostram os GWAS ([PMC10341978](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10341978/); [PMC11426094](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11426094/)). Os valores observados confirmam a ordem de grandeza. Para o índice líquido de touros jovens Holandeses, a confiabilidade foi de **63% com genômica contra 32% com o pedigree**, e de 66% com o modelo não linear ([VanRaden 2008](https://aipl.arsusda.gov/publish/jds/submit/jdsabstr_genomiccomputations_pvr.html)). Em Gir, a acurácia foi de 0,65 com referência de raça única para leite de 305 dias, e juntar outras raças **reduziu** a acurácia do Gir em 3,1% a 10,7%, apesar de o título do artigo falar em ganho para raças pequenas ([Scientific Reports 2025](https://www.nature.com/articles/s41598-025-15733-y)). Em Girolando, a confiabilidade genômica de animais jovens foi de 50% a 67% para leite, fertilidade e longevidade ([Embrapa, fêmeas 2026](https://ainfo.cnptia.embrapa.br/digital/bitstream/doc/1187257/1/Programa-de-Melhoramento-Genetico-da-Raca-Girolando-femeas-junho-2026.pdf), a conferir no contexto). Em Guzerá, o ssGBLUP elevou a acurácia de 27% (leite) a 108% (sólidos) em termos relativos ([ResearchGate](https://www.researchgate.net/publication/363778989_Genomic_prediction_in_Brazilian_Guzera_cattle_application_of_a_single-step_approach_to_productive_and_reproductive_traits)). No Holandês brasileiro, adicionar dados nórdicos e franceses aumentou a confiabilidade, mas os autores insistem que é preciso referência nativa ([PubMed 27040784](https://pubmed.ncbi.nlm.nih.gov/27040784/)). Em avaliações grandes, a confiabilidade exata do ssGBLUP é inviável, e usam-se aproximações; uma delas teve correlação de 0,992 a 0,994 com a exata ([PMC9814342](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9814342/)).

O efeito sobre o ganho genético é a principal razão da genômica. Nos EUA, o intervalo de geração do caminho pai-de-touros caiu de cerca de 7 anos para menos de 2,5, e o mãe-de-touros de cerca de 4 para cerca de 2,5. A intensidade de seleção subiu para as características de baixa herdabilidade, e as tendências aceleraram para fertilidade, longevidade e saúde do úbere ([García-Ruiz et al. 2016, PNAS](https://doi.org/10.1073/pnas.1519061113)). O custo é a autozigose: a seleção aumentou os segmentos em homozigose (ROH) em linhagens selecionadas ([Kim et al. 2013](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3858116/)), a endogamia de pedigree subestimou a real ([Forutan et al. 2018](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5787230/)), e ROH recentes, acima de 16 Mb, tiveram efeito 2,6 a 3,3 vezes maior na depressão endogâmica que os curtos ([JDS 2025](https://doaj.org/article/4eb4ad040ec6405a842aab41e6ca23d6)).

### MACE e GMACE: a mesma prova em 33 escalas nacionais

O MACE (multiple across-country evaluation) foi desenvolvido no Canadá em 1994 por Schaeffer (grafado "Shaffer" pela fonte) e está em uso desde 1995 ([Interbull](https://interbull.org/ib/interbullactivities)), com o primeiro release oficial em fevereiro de 1995, com Holandeses de nove países ([USDA-ARS](https://www.ars.usda.gov/research/publications/publication/?seqNo115=58875)). Ele substituiu as equações de conversão por regressão ([JDS 2000](https://aipl.arsusda.gov/publish/jds/2000/abs83_1081.html)). Cada país é tratado como uma característica diferente. A forma usual é **[não verificado: equações do Interbull não lidas]**:

```
Para cada país c:  DRP_c = 1μ_c + Z_c Q g + Z_c s_c + e_c
s = [s₁; ...; s_C] ~ N(0, G₀ ⊗ A_s)     A_s: parentesco entre touros pelo pai e pelo avô materno
G₀ = covariâncias genéticas entre países (correlações < 1 capturam interação genótipo × ambiente)
var(e_ci) = σ²e,c / EDC_ci     EDC = contribuição efetiva de filhas do touro i no país c
Q g = grupos genéticos de touros de origem desconhecida
saída: ŝ de todos os touros na base e na escala de cada país
```

O serviço cobre 6 raças e 7 grupos de características: produção, saúde do úbere, conformação, longevidade, parto, fertilidade e manejo. Cada país recebe resultados próprios, porque a ordem dos touros muda entre países ([Interbull, serviços](https://interbull.org/ib/dairy_services)). A avaliação de produção de agosto de 2025 usou dados de **33 países** ([Interbull, prod2508r](https://interbull.org/static/web/prod2508r.pdf)). Entram touros de inseminação com filhas em pelo menos 10 rebanhos de um país participante, e cerca de 95% dos touros Holandeses avaliados tinham filhas em um só país, segundo dado de 2007 ([tese SLU](https://stud.epsilon.slu.se/11150/1/torsell_a_170928.pdf)). O GMACE é a versão para touros genotipados com menos de 7 anos ([Interbull](https://interbull.org/ib/services)). A tendência recente é integrar valores MACE às avaliações nacionais single-step: na Valônia, a correlação entre o EBV MACE e o integrado ficou acima de 0,97 ([Interbull Bulletin 61](https://edepot.wur.nl/707840)). **A participação do Brasil no MACE não foi confirmada pelas notas.** Para o criador brasileiro, uma prova MACE de touro importado é uma posição relativa na escala do país em que foi expressa, não um número comparável a uma PTA de Gir ou Girolando.

## Confiabilidade, base e índice traduzem PTAs em decisão

### Filhas-equivalentes: a régua comum de toda informação

Pela definição de 1991, a confiabilidade é "o total acumulado de filhas-equivalentes dividido por esse total mais 14" ([VanRaden e Wiggans 1991](https://www.aipl.arsusda.gov/publish/jds/1991/74_2737.pdf)). A forma geral, com a constante dependente da herdabilidade, é **[não verificado como fórmula do USDA atual; derivação padrão]**:

```
REL = DE / (DE + k) ,   k = (4 − h²)/h²   ⇔   DE = k·REL/(1 − REL)
n filhas com 1 registro cada:     DE_progênie ≈ n      (REL = n·h² / [4 + (n − 1)h²])
filha com m registros:            DE_filha = k / k_m ,  k_m = (4 − h²_m)/h²_m ,  h²_m = m·h²/[1 + (m − 1)r]
média dos pais:                   REL_PA = (REL_pai + REL_mãe)/4    →  DE_PA = k·REL_PA/(1 − REL_PA)
total aproximado:                 DE = DE_PA + DE_próprio + DE_progênie
```

Há um pequeno conflito: k = 14 corresponde a h² = 4/15 ≈ 0,267, e a fórmula geral com h² = 0,25 dá 15. Com DE = 100, a REL é 0,877 com k = 14 e 0,870 com k = 15 **[conferido numericamente]**; as notas não verificaram qual h² o USDA usa hoje para cada característica. O que a fórmula ensina é a assimetria entre características:

| Filhas | Leite, h² = 0,25 (k = 15) | Leite com PA de REL 0,30 | DPR, h² = 0,04 (k = 99) | DPR com PA de REL 0,30 |
|---|---|---|---|---|
| 10 | 0,400 | 0,523 | 0,092 | 0,346 |
| 50 | 0,769 | 0,790 | 0,336 | 0,483 |
| 100 | 0,870 | 0,876 | 0,503 | 0,590 |
| 200 | 0,930 | 0,932 | 0,669 | 0,710 |
| 500 | 0,971 | 0,971 | 0,835 | 0,846 |

**Cem filhas dão 87% de confiabilidade para leite e 50% para DPR.** A mudança de h² da DPR de 1,4% para 2,9% em 2026, se confirmada, muda k de 285 para 137, o que dobra o valor de cada filha. Com h² = 0,03, a acurácia (√REL) de um touro é de 0,27 com 10 filhas e de 0,66 com 100, como calcularam as notas **[conferido numericamente]**. Três outros números ajudam a ler os sumários. Uma filha com 2 ou 3 lactações vale 1,36 ou 1,55 filha-equivalente (h² = 0,25, repetibilidade 0,50). O registro próprio de uma vaca vale k·h²/(1 − h²) = 5 DE, porque sua confiabilidade (0,25) equivale à de 5 filhas. E uma confiabilidade genômica de 0,70 equivale a **35 filhas para leite e 231 para DPR**, o que mostra por que a genômica rende mais justamente nas características de baixa herdabilidade.

A diferença esperada entre as filhas de dois touros acasalados com vacas de mesmo mérito, na mesma base e escala, é a diferença das PTAs: +1.000 kg contra +600 kg dá 400 kg por lactação. A confiabilidade não muda essa expectativa; muda a incerteza em torno dela.

### Base genética: o zero é móvel

Uma PTA é relativa a uma base, a média das vacas nascidas num ano. Em abril de 2025, a base americana passou das vacas nascidas em 2015 para as nascidas em 2020, e todos os Holandeses perderam **752 lb (341,1 kg) de PTA de leite** ([Alta Genetics](https://us.altagenetics.com/preparing-for-the-2025-genetic-base-change/); fonte secundária). Como todos recebem o mesmo deslocamento, as diferenças entre animais e entre índices não mudam. O exemplo citado pelo CDCB, de um touro que passou de 1.400 lb para 660 lb ([CDCB](https://uscdcb.com/national-dairy-genetic-index-update-base-change-set-for-april-2025/)), dá 740 lb e não 752: a PTA do próprio touro provavelmente mudou na reavaliação **[inferência]**. As características de parto ficaram para agosto de 2025 ([CDCB](https://uscdcb.com/wp-content/uploads/2025/06/Calving-Traits-August-2025-web.pdf)), e há conflito na contagem de características afetadas, 45 numa apresentação ligada ao CDCB e 49 na Cowsmo ([McWhorter 2025](https://uscdcb.com/wp-content/uploads/2025/04/WDMC2025-McWhorter.pdf); [Cowsmo](https://cowsmo.com/news/u-s-genetic-base-change-april-2025/)). O Girolando define a base como "o valor genético médio das vacas nascidas em um determinado ano" ([Sumário Girolando 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1132959/1/DOC-255-Sumario-Touros-Girolando-2021.pdf)); as notas não acharam a base do Gir nem da Holandesa brasileira. Comparar PTAs em libras (EUA) com PTAs em kg (Brasil) exige duas conversões: de unidade e de base, esta última só pelo MACE ([Interbull, Code of Practice](https://interbull.org/ib/cop_appendix5)).

### Índices econômicos: o que cada país põe na balança

Um índice econômico soma PTAs ponderadas por valores econômicos (VE), I = Σ VE_k·PTA_k, com os VE derivados de modelos bioeconômicos de lucro **[estrutura de fundo, não verificada como equação oficial de cada índice]**. A teoria de Smith-Hazel e o exemplo com variâncias estão no relatório de corte. A tabela reúne a composição dos índices leiteiros encontrada pelas notas.

| Índice | Composição publicada | Fonte |
|---|---|---|
| NM$ 2025 (EUA, CDCB), US$ de lucro vitalício | 12 características e 5 compostos; gordura 31,8%, proteína 13%, vida produtiva 13%, livabilidade 5,9%, leite 3,2%, DPR 2,1% (os seis somam 69%); US$ 5,01/lb de gordura, 3,33/lb de proteína, 0,022/lb de leite, 30/mês de VP (a conferir); correlação de 0,992 com o NM$ 2021 em touros jovens | [USDA-ARS, NM$9](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/ARR/nmcalc-2025_ARR-NM9.pdf); [CDCB](https://uscdcb.com/introducing-net-merit-2025/) |
| TPI abril de 2026 (Holstein USA), pontos | proteína de 19% para 24%, gordura de 19% para 14%, produção total de 38%; correlação de 0,9978 com a versão anterior; os 10% de touros do topo perderam 27 pontos em média | [Holstein USA](https://www.holsteinusa.com/pdf/committee/Genetic%20Advancement%20Committee%20Recommendations_Approved%20March%202026.pdf); [Hoard's](https://hoards.com/article-37960-Holstein-Association-USA-Board-Approves-Updates-to-TPIreg-Formula.html) |
| JPI 2020 (Jersey, EUA) | proteína 27, gordura 19, densidade do leite −3, tipo funcional e úbere 19,4, VP 5, livabilidade 3, CCS 4,5, DPR 9, CCR 3,5, HCR 2 (somam 95,4; o restante deve ser dos seis traços de saúde, inferência) | [Hoard's 2020](https://hoards.com/article-27433-jersey-performance-indextm-update--slated-for-april-genetic-evaluations.html) |
| LPI modernizado (Canadá, Lactanet, abril de 2025) | seis subíndices: produção, longevidade e tipo, saúde e bem-estar, reprodução, ordenha e impacto ambiental (só Holandês); Jersey 40/30/10/10/10; Pardo-Suíço 45/30/8/12/5; correlação de 98,5% com o LPI anterior | [Lactanet](https://lactanet.ca/en/lactanet-finalizes-the-modernized-lpi-formula/) |
| NTM (Dinamarca, Finlândia, Suécia) | produção, crescimento, fertilidade, parto, saúde do úbere e outros, ponderados por VE de modelo bioeconômico; saved feed de 0,18 para 0,35 no Holandês após maio de 2026 (empresa; conferir no NAV) | [NAV 2024](https://nordicebv.info/wp-content/uploads/2024/05/NAV-routine-genetic-evaluation-May-2024.pdf); [Viking](https://www.vikinggenetics.us/news/the-growing-importance-of-feed-efficiency) |
| RZG e RZ€ (Alemanha, vit) | RZG pós-2021: leite 36%, bloco funcional 49% (RZGesund 18%), exterior 15% (imprensa); RZ€: leite 41%, longevidade 27%, saúde 16%, fertilidade 7%, vitalidade de bezerras 6%, parto 3% | [topagrar](https://www.topagrar.com/rind/news/rzg-update-weniger-milch-mehr-gesundheit-12525798.html); [VIT](https://www.vit.de/fileadmin/DE/Zuchtwertschaetzung/Der_neue_RZEuro_pptx.pdf) |
| EBI (Irlanda, ICBF) | fertilidade = 33% (confirmado só em trecho) | [ICBF](https://www.icbf.com/wp-content/uploads/2020/02/Understanding-EBI-PTA-BV-Spring-2020.pdf) |
| BPI, HWI (Austrália, DataGene) | BPI em dólares com média zero: produção, saúde e fertilidade, tipo, manejo e feed saved; peso do feed saved cortado pela metade, a A$ 0,1927/kg (≈5,5% do BPI), por baixa confiabilidade | [DataGene 2026](https://www.datagene.com.au/wp-content/uploads/2026/04/ABV-Pocket-Guide-2026-final-WEB.pdf); [ScienceDirect 2022](https://www.sciencedirect.com/science/article/pii/S2666910222000023) |
| BW (Nova Zelândia) | soma de VE × BV de dez características em dois grupos (eficiência de produção e robustez) | [DairyNZ](https://www.dairynz.co.nz/animal/breeding-decisions/breeding-worth/) |
| IPGL (Gir Leiteiro) | leite, gordura, proteína, idade ao primeiro parto e parentesco médio; pesos não obtidos | [Embrapa, 2º sumário genômico](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1184675/1/Programa-Nacional-de-Melhoramento-do-Gir-Leiteiro-2-sumario-genomico-de-touros.pdf) (atribuição provável) |
| IPG (Girolando, 2024) | produção, saúde, fertilidade e conformação (úbere e longevidade), ponderados por importância econômica; pesos não obtidos | [ABCG](https://www.girolando.com.br/noticia/4301/novo-sumario-de-touros-de-girolando-traz-tndice-inedito-de-performance-da-raca) |
| ISG (Holandesa, Brasil) | revisado em 2021 para incluir teores de gordura e proteína, idade ao primeiro parto e taxa de gestação | [Balde Branco](https://digital.baldebranco.com.br/avanco-genetico-da-raca-holandesa-tem-trazido-ganhos-para-o-produtor/) (atribuição provável) |

Três conflitos ficam registrados. Para a vida produtiva no NM$ 2025, o relatório do USDA dá 13% e a imprensa dá 8% ([The Bullvine](https://www.thebullvine.com/news/cdcb-unveils-net-merit-2025-updating-dairy-genetic-selection/)); este relatório usa o do USDA. Duas páginas da Viking Genetics dão pesos diferentes ao NTM, 45% e 53% para saúde e reprodução ([Viking](https://www.vikinggenetics.us/news/total-merit-indexes-ntm-vs-jpi)). E os pesos de 2021 do RZG vêm de uma só fonte de imprensa. Os percentuais publicados são **ênfases relativas**, que dependem do VE e do desvio-padrão genético de cada PTA, e não pesos brutos: comparar "% de gordura mais proteína" entre índices não é direto. As mudanças recentes do NM$ e do TPI foram justificadas por preços, com a gordura ganhando peso nos EUA, e a eficiência alimentar ganhou peso em quase todos.

O exemplo compara dois touros num índice brasileiro **hipotético**, em reais, com PTAs em kg. O touro A é de produção, provado (REL 0,95); o B é equilibrado e genômico (REL 0,65). Os desvios-padrão das PTAs (250 kg de leite, 10 de gordura, 7 de proteína, 1,5 mês de VP, 1,2 ponto de DPR e 0,12 de ECS) também são hipotéticos.

| PTA | Touro A | Touro B | VE base (R$/unidade) | A × VE | B × VE | Ênfase relativa |
|---|---|---|---|---|---|---|
| Leite (kg) | +800 | +320 | 0,05 | 40 | 16 | 1,9% |
| Gordura (kg) | +40 | +27 | 20 | 800 | 540 | 31,0% |
| Proteína (kg) | +27 | +18 | 28 | 756 | 504 | 30,4% |
| Vida produtiva (meses) | +0,2 | +2,0 | 90 | 18 | 180 | 20,9% |
| DPR (pontos) | −1,5 | +1,8 | 60 | −90 | 108 | 11,2% |
| ECS | +0,12 | −0,10 | −250 | −30 | 25 | 4,6% |
| **Índice** | | | | **1.494,0** | **1.373,0** | |

O touro A vence por R$ 121. Supondo erros independentes entre PTAs, o desvio-padrão do erro do índice é de R$ 71,7 para A e de R$ 189,8 para B, e a **probabilidade de A ser de fato melhor é de 72,5%**. Num segundo cenário, típico de pagamento por sólidos e de parição concentrada, o leite passa a valer −R$ 0,02/kg e a DPR R$ 120 por ponto: B passa a vencer (1.458,6 contra 1.348,0), com 69,4% de probabilidade, e a ênfase da DPR sobe de 11,2% para 20,3% **[conferido numericamente]**. Para referência, com os valores do NM$ 2025 nas quatro características com VE nas notas (leite, gordura, proteína e VP), touros com +1.800/+90/+60 lb e +0,5 mês e com +700/+60/+40 lb e +4,5 meses somam US$ 705,3 e 584,2 nessas parcelas. O índice certo depende do sistema de pagamento e de manejo do rebanho, e a confiabilidade diz quanto confiar na diferença.

### Resposta à seleção pelas quatro vias

O progresso anual em leite soma as quatro vias de seleção, pai de touro, pai de vaca, mãe de touro e mãe de vaca, e divide pela soma dos intervalos de geração: **ΔG = Σ_k(i_k·r_k·σ_A)/Σ_k L_k** **[forma reconstruída, não verificada]**. No exemplo americano de 1991, os diferenciais de seleção médios foram de 405, 395, 239 e 42 kg, e os intervalos de 10,2, 6,4, 9,3 e 5,1 anos, o que dá 1.081/31,0 = **34,87 kg por ano**, contra 34,9 kg reportados e um teto teórico de 96 kg ([USDA, J. Dairy Sci. 74:1078](https://www.aipl.arsusda.gov/publish/jds/1991/74_1078.pdf), autoria não verificada) **[conferido numericamente]**. O teto era 2,75 vezes o realizado, por gerações longas e pressão de seleção abaixo do ideal. A genômica atacou exatamente o denominador, ao derrubar o intervalo do caminho pai-de-touros de 7 para menos de 2,5 anos.

## Os programas de N muito grande e os brasileiros fazem escolhas diferentes

A tabela resume o que as notas confirmaram sobre os grandes centros, inclusive as lacunas.

| Programa | Escala | Produção | Genômica | Destaques |
|---|---|---|---|---|
| CDCB/USDA (EUA) | 93 milhões de animais avaliados (abr/2026); mais de 13 milhões de genótipos ([CDCB](https://uscdcb.com/)) | 305 dias por BP, desde 1998 ou fevereiro de 1999 | multi-step desde janeiro de 2009; protótipo ssBLUP previsto até o fim de 2026 ([CDCB](https://uscdcb.com/research)) | NM$ 2025; base 2020; seis doenças desde 2018; saúde de bezerras em 2026; liberações semanais, mensais e quadrimestrais ([calendário](https://uscdcb.com/genetic-evaluation-schedule/2026)) |
| Lactanet (Canadá) | mais de 350 mil vacas com mudança de avaliação por rodada mensal (out/2025) ([Farmtario](https://farmtario.com/dairy/genetics/lactanet-now-publishing-monthly-dairy-genetic-evaluations)) | CTDM desde o fim dos anos 1990; produção e CCS separados desde 2016 | genômica para Holandês há cerca de 15 anos (atribuição provável) | LPI modernizado em abril de 2025; publicação mensal |
| NAV (Dinamarca, Finlândia, Suécia) | 3,5 milhões de vacas com controle (atribuição provável, [ICAR](https://old.icar.org/wp-content/uploads/2015/09/IBOM1_Koivula_PPT.pdf)) | dia de controle | projeto 2014–2020 gerou as primeiras versões genômicas single-step de dia de controle e de fertilidade ([Luke](https://jukuri.luke.fi/items/52857a42-2020-4499-95f7-7127c6f486c0/full)); ssGBLUP de fertilidade em Nordic Red ([Matilainen 2018](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12353)) | NTM; em 2022, modelos single-step ainda eram raros em avaliações nacionais ([MDPI](https://www.mdpi.com/2077-0472/12/3/388)) |
| CRV (Países Baixos e Flandres) | não localizado | não localizado | não localizado | só aparece como CRV Lagoa, parceira do Clarifide Girolando no Brasil |
| vit (Alemanha) | expectativa de ~10 mil bezerros machos genotipados por ano no lançamento do single-step, contra ~1 mil touros testados antes | dia de controle (revisão) | genômica oficial em 17/08/2010 (atribuição provável); single-step para Holandês "a partir da rodada de abril", ano não confirmado ([topagrar](https://www.topagrar.com/rind/news/zuchtwerte-bekannte-und-neue-spitzenbullen-durch-single-step-20013054.html)) | RZG, RZ€ |
| GenEval/Eliance (França) | software para até 20 milhões de animais | 305 dias em repetibilidade (página Interbull) | multi-step em 2022; single-step motivado pela pré-seleção ([HAL](https://hal.inrae.fr/hal-04030691v1)) | aceita fenótipos estrangeiros de Holandês e Pardo-Suíço |
| ICBF (Irlanda) | referência de 2020 com 3.600 fêmeas e 300 machos de outras raças | não localizado | método de uma etapa no EBI em setembro de 2025 ([ICBF](https://www.icbf.com/changes-to-dairy-evaluations-in-september-2025-what-farmers-can-expect/)) | pacote Multibreed com EBI médio de €286 contra €276 do Holstein Friesian ([ICBF 2026](https://www.icbf.com/2026-icbf-dairy-active-bull-list-irish-genetics-to-the-fore/)) |
| DataGene (Austrália) | ABVs genômicos para Holandês, Jersey e raças vermelhas ([Farm Online](https://www.farmonline.com.au/story/7389768/aussie-red-breeders-to-benefit-from-genomic-boost/)) | não localizado | estudo de single-step de regressão aleatória com valores do Interbull para o Australian Red ([JDS](https://www.sciencedirect.com/science/article/pii/S0022030222006853)); modelo oficial não verificado | BPI, HWI; Heat Tolerance ABV; revisão do objetivo a cada cinco anos |
| LIC (Nova Zelândia) | cerca de 30 milhões de animais (atribuição a confirmar) | não localizado | referência multirracial com puros e cruzados desde 2007 ([WCGALP 2014](https://asas.confex.com/asas/WCGALP14/webprogram/Paper10257.html)); single-step em fevereiro de 2020 (atribuição a confirmar) | BW; Holandês neozelandês e estrangeiro tratados como raças distintas, com heterose entre eles |
| Interbull | MACE de produção com 33 países (ago/2025) | — | GMACE para touros com menos de 7 anos | criado em 1983; MACE desde fevereiro de 1995; novo software "Future MACE" planejado para 2026 ([Interbull](https://interbull.org/web/static/web/20260202_Interbull_Centre_Annual_Operating_Plan_2026_%28PUBLIC_version%29%20_V2.pdf)) |

### Brasil: testes de progênie com a Embrapa e genômica como camada

No Brasil, os três programas de raças zebuínas e cruzadas, Gir Leiteiro, Girolando e Guzerá, publicam sumários com a Embrapa Gado de Leite, e a Holandesa tem avaliação nacional da ABCBRH com participação da Embrapa.

| Programa | Volume | Modelo e genômica | Publicação |
|---|---|---|---|
| PNMGL, Gir Leiteiro (ABCGIL e Embrapa) | 182.319 animais avaliados, 92.486 com lactação, 60.154 genotipados, 679 touros provados (atribuição provável ao [2º sumário genômico, fev/2026](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1184675/1/Programa-Nacional-de-Melhoramento-do-Gir-Leiteiro-2-sumario-genomico-de-touros.pdf)) | modelo oficial não confirmado; genômica no sumário desde maio de 2018 (resumo de busca, fonte não confirmada); single-step em pesquisa ([GWAS single-step](https://www.researchgate.net/publication/382601495_Genome-wide_association_study_for_milk_yield_frame_and_udder_conformation_traits_of_Gir_dairy_cattle)) | PTAs de leite, gordura, proteína e sólidos (kg e %) com confiabilidade (2019); IPGL; genótipos de kappa-caseína, beta-lactoglobulina e beta-caseína (2026); primeira avaliação de produção de oócitos |
| PMGG, Girolando (ABCG e Embrapa) | 276.330 registros e 22.860 genotipados com 374.228 SNPs (2022); referência de 25.936 animais Gir, Girolando e Holandês (2023) ([Embrapa 2023](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1154279/1/Programa-de-Melhoramento-Genetico-da-Raca-Girolando-junho-2023.pdf)) | modelo animal BLUP no MTDFREML com rebanho-ano, estação e composição racial fixos e idade como covariável (2016–2017) ([Sumário de Vacas 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1071813/1/DOC204SumariodeVacas2017.pdf)); Clarifide Girolando | teste de progênie desde 1996 (ABCG) ou 1997 (Embrapa), conflito; PTA genômica em 2019; longevidade em 2021; 15 características novas em 2022; IPG em 2024; sumário de fêmeas jovens (top 1.000, menos de 24 meses) em 2025 |
| PNMGuL, Guzerá (CBMG² e Embrapa) | mais de 750 touros e 520 matrizes (2020) | modelo não confirmado; ssGBLUP em pesquisa com 1.618 genotipados e pedigree de 433.823 animais ([TAHP 2023](https://link.springer.com/article/10.1007/s11250-023-03484-9)) | sumário anual desde 2000; último localizado em 2021 (22º), com produção, sólidos, reação ao ambiente e marcadores ([Embrapa](https://www.embrapa.br/en/busca-de-noticias/-/noticia/63431997/embrapa-e-cbmg-lancam-22-sumario-de-touros-e-matrizes-da-raca-guzera)); dupla aptidão |
| Holandesa (ABCBRH e Embrapa) | não localizado | modelo não confirmado | leite, gordura e proteína (kg e %), CCS, taxa de gestação, idade ao primeiro parto e tipo ([MilkPoint](https://www.milkpoint.com.br/colunas/associacao-brasileira-de-gado-holandes/avaliacao-genetica-nacional-da-raca-holandesa-227798/)); ISG |

O núcleo das avaliações brasileiras publicadas são os testes de progênie, e a genômica entrou como camada de pré-seleção e triagem. O PMGG exige, para a mãe de um touro do 29º grupo de progênie, gPTA de leite positiva, genotipagem Clarifide e status "apto" (resumo de busca, [ABCG](https://www.girolando.com.br/imagens/noticias/criterios-pre-selecao.pdf)). O Clarifide Girolando foi desenvolvido por Embrapa, ABCG, CRV Lagoa e Zoetis e descrito como a primeira ferramenta de seleção genômica para bovinos leiteiros criada no Brasil ([Embrapa, Infoteca](https://www.infoteca.cnptia.embrapa.br/handle/doc/1109970?locale=en)). O Girolando teve endogamia média de 0,11% e tamanho efetivo de 188, e 457 dos 9.457 ancestrais explicam metade da variabilidade ([Embrapa](https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/1006603/estrutura-populacional-da-raca-girolando)). As notas não confirmaram uso oficial de dia de controle ou de single-step em nenhuma raça brasileira, e não acharam documentação atual de Sindi, Jersey (ACGJB) ou do controle leiteiro oficial da ABCZ.

### Como os mestiços são avaliados

No Girolando oficial dos documentos de 2016 e 2017, a mestiçagem entra como efeito fixo de composição racial, em faixas de 1/4 a 3/4 (2016) e de 1/4 a 7/8 (2017) de sangue Holandês ([Sumário de Vacas 2016](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1048268/1/DOC192SumarioVacas2016.pdf)). Os estudos de cruzamento acrescentam heterose e, às vezes, recombinação. A forma geral é **[não verificado como modelo oficial atual]**:

```
y = Xb + Σ_k β_k·c_k + δ·H + ρ·R + Za + Wp + e
c_k = fração da raça k na vaca (ou classes de grupo genético)     H = heterozigose esperada
H = f_H(pai)·f_G(mãe) + f_G(pai)·f_H(mãe)        R = perda de heterozigose por recombinação (quando modelada)
Elzo (multirracial): var(a_i) = Σ_k f_ik·σ²a,k (+ termos de segregação)  — a variância aditiva do cruzado é função das variâncias das raças puras
```

A heterozigose esperada se calcula pelas frações de sangue dos pais **[conferido numericamente]**:

| Cruzamento | Fração Holandês | Heterozigose esperada |
|---|---|---|
| Holandês × Gir (F1, 1/2) | 0,500 | 1,000 |
| Holandês × F1 (3/4) | 0,750 | 0,500 |
| Holandês × 3/4 (7/8) | 0,875 | 0,250 |
| 3/4 × 1/2 (5/8) | 0,625 | 0,500 |
| 5/8 × 5/8 (Girolando 5/8 estabilizado) | 0,625 | 0,469 |

O F1 tem toda a heterose; o 5/8 de pais 5/8 retém 47% dela. Em Girolando, as vacas dos grupos genéticos produziram cerca de 12,7% mais leite no início da lactação que a média dos pais, e a maior heterose foi no tempo até o pico, de 24,18% ([IJAS 2018](https://www.tandfonline.com/doi/full/10.1080/1828051X.2018.1507627)). A heterose para intervalos de parto foi de 21,93% entre o 1º e o 2º parto ([LUME/UFRGS](https://lume.ufrgs.br/bitstream/handle/10183/263544/001172431.pdf?sequence=1)). Um trabalho defende que a heterose entre no modelo de avaliação para melhorar a acurácia dos touros ([Semantic Scholar](https://pdfs.semanticscholar.org/7ed2/9ebbe612038e2a44c88a20f0943991117d8d.pdf)); as notas não confirmaram que a avaliação oficial atual faça isso. A teoria multirracial de Elzo, em que a variância aditiva do cruzado é função linear das variâncias das raças puras ([JDS 1992](https://www.journalofdairyscience.org/article/S0022-0302(92)77800-X/pdf)), foi aplicada no Chile com inversa da matriz multirracial calculada por algoritmo recursivo ([PubMed 15291000](https://pubmed.ncbi.nlm.nih.gov/15291000/)).

Na genômica, há duas abordagens. A atribuição de origem alélica (BOA) usa efeitos de marcadores das raças puras combinados pela raça de origem de cada segmento; numa comparação para proteína, a habilidade preditiva foi de 0,45 com BOA contra 0,43 com proporção racial, e o modelo de proporção gerou viés ([GSE 2021](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-021-00678-3); [JDS](https://www.journalofdairyscience.org/article/S0022-0302%2822%2900253-3/fulltext), citação a confirmar). A outra é o ssGBLUP multirracial com metafundadores ou com matrizes específicas por raça, que os EUA aplicam a cruzados Holandês × Jersey numa mesma corrida com os ancestrais puros ([PMC10928432](https://pmc.ncbi.nlm.nih.gov/articles/PMC10928432/)). A Nova Zelândia estima que uma população cruzada exija referência de pelo menos 400 mil animais, sem comparações publicadas ([DairyNZ](https://www.dairynz.co.nz/media/sbujkk1q/iwg-final-report-8-july.pdf)). No Brasil, a ferramenta genômica multirracial Holandês–Gir–Girolando foi anunciada como projeto conjunto de ABCGIL, ABCG, ABCBRH e Embrapa ([O Presente Rural](https://opresenterural.com.br/pela-primeira-vez-ferramenta-genomica-vai-reunir-tres-racas-de-bovinos-leiteiros/)) e ainda aparece como solução "a ser lançada" no Anuário Leite 2024 ([Embrapa](https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/1164754/anuario-leite-2024-avaliacao-genetica-multirracial)). O resultado do Gir de 2025, em que juntar raças reduziu a acurácia da raça pequena, é um alerta de que o ganho multirracial não é automático.

## Indicadores e metas: poucos números brasileiros têm fonte e definição

### Indicadores genéticos publicados e metas genéticas

Os sumários brasileiros publicam PTAs de leite, gordura, proteína e sólidos em kg e em percentual, com confiabilidade ([Gir 2019](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1108520/1/DOC235SumarioGir2019.pdf)); o Girolando acrescenta persistência, duração da gestação, peso ao nascer, compostos de úbere e locomoção e tolerância ao calor, com h² de 0,57 para duração da gestação ([DOC 266](https://www.girolando.com.br/ckfinder/userfiles/files/imagens%202/megaleite%202022/Sumario_Touros_Girolando_2022_DOC266.pdf), atribuição provável); e a Holandesa, CCS, taxa de gestação, idade ao primeiro parto e tipo. As metas genéticas publicadas são cortes de índice, PTA e confiabilidade, e não alvos absolutos. O critério de pré-seleção do Girolando (gPTA de leite positiva para a mãe) é um exemplo; um documento do governo cita, para genitores Holandeses importados, ISG acima de 2.000 pontos ou PTA de leite acima de 400 kg, critério que pode estar desatualizado ([gov.br](https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/registro-genealogico/Holandesa.pdf)).

### Indicadores zootécnicos do rebanho

Os indicadores de rebanho são razões simples cujo valor depende do denominador. As fórmulas da coluna central são definições de trabalho das notas **[não verificado]**; os valores de referência estão citados.

| Indicador | Fórmula | Referência com fonte |
|---|---|---|
| Leite por vaca | produção total ÷ vacas (declarar se em lactação ou total) | Brasil: 2.142 L/vaca/ano (~5,9 L/dia), contra 655 em 1974; produtividade +227% com rebanho +50%; EUA quase 5 vezes a média brasileira ([Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1169403/1/Bovinocultura-de-leite-no-Brasil-evolucao-e-tendencias.pdf)) |
| Leite em 305 d, pico, persistência | TIM ou BP; curva de Wood | sem benchmark brasileiro localizado |
| CCS e CBT do tanque | média geométrica trimestral, com pelo menos uma análise mensal | IN 76/2018: CCS ≤ 500 mil cél/mL e CBT ≤ 300 mil UFC/mL; leite tipo A: 400 mil e 10 mil ([MAPA, IN 76](https://wikisda.agricultura.gov.br/dipoa_baselegal/in_76-2018_rtiq_leite.pdf)) |
| CCS individual | ECS por vaca e % de vacas acima de 200 mil | o corte de 200 mil é convenção **[não verificado]**; em outubro de 2005, só 20% dos rebanhos analisados tinham CCS abaixo de 200 mil ([Cepea](https://cepea.org.br/br/categoria/acessar/boletim-do-leite-138-2005-dezembro.aspx); dado antigo) |
| Nova infecção | vacas que passam de ≤ 200 mil para > 200 mil ÷ vacas em risco | sem benchmark localizado |
| Intervalo entre partos (IEP) | parto atual − parto anterior | meta de 365 dias; IPP de 24 meses; 1,6 serviço por concepção ([Embrapa, doc. 286](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/746967/1/documento286.pdf), atribuição a confirmar); 413,45 ± 94,58 dias num confinamento Holandês ([UFG](https://revistas.ufg.br/vet/article/view/4222), vínculo a confirmar) |
| Taxa de serviço (21 dias) | inseminadas ÷ elegíveis (não gestantes, após o PEV) | acima de 35% ([SAC Escócia](https://www.fas.scot/article/milk-manager-news-january-2023-key-performance-indicators-for-measuring-fertility/)) |
| Taxa de prenhez de 21 dias | taxa de serviço × taxa de concepção | 50% × 30% = 15% no exemplo da fonte ([Wiltbank, Flórida](https://animal.ifas.ufl.edu/media/animalifasufledu/dairy-website/pdf/dairy-production-conference/Wiltbank.pdf); [Hoard's](https://hoards.com/E_reproduction/REP06)); a meta escocesa de "65%" parece ser taxa acumulada, não de 21 dias |
| Taxa de concepção | prenhezes ÷ inseminações | ~80% como limite biológico; concepção ao 1º serviço caiu de ~60% (anos 1950) para ~40% (anos 1990) em vacas de alta produção (Embrapa, mesma atribuição a confirmar) |
| Descarte | descartadas ÷ média de vacas; involuntário ÷ total | distúrbios reprodutivos são 20% a 30% dos descartes (Embrapa, mesma atribuição) |
| Saúde e mortalidade | casos ÷ 100 vacas-ano; bezerras mortas até 60 dias ÷ nascidas | sem referência brasileira localizada |
| Custo de recria | custos da novilha até o parto ÷ novilhas paridas | US$ 1.700 até o parto nos EUA ([The Bovine Veterinarian](https://www.qgdigitalpublishing.com/article/Breeding+Benchmarks/4526797/784809/article.html)) |
| Eficiência e margem | kg de leite (ou ECM) ÷ kg MS; receita − custo da dieta | sem benchmark brasileiro localizado |

Dois cálculos ligam os indicadores entre si. Um IEP de 413,45 dias, com gestação de cerca de 280 dias **[não verificado]**, implica 133 dias abertos, que pela fórmula da AIPL equivalem a uma taxa de prenhez de cerca de 25%. E a CCS do tanque da IN 76 não serve como meta por vaca: a norma é de tanque e de média geométrica trimestral, e há **conflito histórico** nas notas sobre se o limite de 500 mil veio de um degrau da IN 62/2011 ou se a IN 62 já previa 400 mil em 2016 e 2017. O texto oficial da IN 62 não foi lido.

### Metas por categoria

As notas acharam poucas metas com fonte para bovinos leiteiros tropicais. A tabela combina o que existe com uma proposta deste relatório para as lacunas **[proposta, não norma de programa]**.

| Categoria | Indicadores de acompanhamento | Meta com fonte | Critério genético | Proposta para as lacunas |
|---|---|---|---|---|
| Bezerras | mortalidade até 60 dias, diarreia, doença respiratória, ganho de peso | não localizada | PTA de pai e mãe; genômica eleva a confiabilidade de 30–39% (pai médio) para 69–73% em Holandês canadense ([Lactanet](https://lactanet.ca/?p=23484)); PTAs de saúde de bezerras nos EUA | meta pela linha de base do próprio rebanho, com intervalo de confiança |
| Novilhas | peso e estatura à cobertura, idade ao 1º serviço, concepção de novilha, IPP | 55% do peso adulto e 90% da estatura à cobertura; 85% do peso adulto ao parto ([Dairy Herd](https://www.dairyherd.com/news/education/revisiting-benchmarks-age-first-breeding); [Dairy Producer](https://dairyproducer.com/tracking-heifer-growth-building-a-strong-foundation-for-productive-cows/), que atribui 55% ao NRC 2001); IPP de 24 meses (Embrapa) | gPTA de leite positiva (pré-seleção Girolando); índice da raça; HCR | as metas de 55% e 85% são de Holandês; para Gir e Girolando, o peso adulto de referência não foi localizado |
| Primíparas | leite 305 d em relação às contemporâneas, pico, persistência, ECS, dias ao 1º serviço | IEP de 365 dias (Embrapa) | EBV com uma lactação tem REL baixa; combinar com PTA do pai | primeira lactação como triagem, não como sentença |
| Vacas adultas | MPPA, IEP, concepção, casos de saúde, ECS | IEP de 365 dias; 1,6 serviço por concepção | EBV acumulado; MPPA para descarte | descarte por MPPA e saúde, reposição por EBV |
| Touros | índice do sistema, confiabilidade, PTAs funcionais, GFI | ISG > 2.000 ou PTA de leite > 400 kg para importação (possivelmente desatualizado) | percentil superior do índice com REL mínima declarada; vários touros quando a REL é baixa ([DataGene](https://www.datagene.com.au/wp-content/uploads/2023/11/Technote-18-Heat-Tolerance-ABV.pdf)) | checar parentesco com cada vaca, não só o GFI |

O exemplo de crescimento usa um peso adulto **hipotético** de 550 kg e peso ao nascer de 35 kg. A meta de 55% dá 302,5 kg à cobertura; para cobrir aos 15 meses, a novilha precisa de ganho médio de **0,586 kg/dia** desde o nascimento. A meta de 85% dá 467,5 kg ao parto, que aos 24 meses exige 0,592 kg/dia desde o nascimento **[conferido numericamente]**. A primeira cobertura por volta de 15 meses é inferência aritmética da meta de 24 meses, não meta verificada. Em corte, a meta de 55% não reduziu a prenhez nos primeiros 21 dias, mas as novilhas precisaram chegar a 90% do peso adulto antes do parto ([Beef Magazine](https://www.beefmagazine.com/cattle-nutrition/what-is-the-ideal-target-weight-for-heifers-it-depends)), e um guia canadense usa 65% para Bos indicus ([Colúmbia Britânica](https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/agriculture-and-seafood/agricultural-land-and-environment/water/drought/drought-articles/livestock_drought_management_4_-_heifer_target_weights_oct2024_01.pdf)); nenhuma das duas fontes é de leite tropical.

## Rebanhos com N menor ganham precisão comparando contemporâneas e conectando-se

### Não estimar os próprios parâmetros

A simulação do relatório de corte mostrou que 100 registros de 5 touros estimam a herdabilidade com desvio-padrão de 0,30 e dão estimativa negativa em 17,5% das vezes. O argumento vale igual para o leite: um trabalho de leite parte justamente da premissa de que os registros de um único rebanho raramente bastam para estimar as próprias variâncias ([J. Dairy Sci.](https://www.sciencedirect.com/science/article/pii/S0022030293774767)). A regra é **fixar variâncias pela literatura**, usando as tabelas acima, e testar a sensibilidade. Em fazendas pequenas de cruzados, um modelo bayesiano com efeito de fazenda separou componentes genéticos e não genéticos com cerca de duas vacas por fazenda, com a acurácia melhorando até cerca de cinco ([PMC10772325](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10772325)), o que reforça o mesmo ponto: informação vem de conectar fazendas, não de modelar uma só.

### Comparar com contemporâneas e ranquear com repetibilidade

A ferramenta mais robusta para o rebanho é o desvio de cada vaca em relação às contemporâneas: mesmo dia de controle no dia a dia, mesmo rebanho-ano-estação e ordem de parto na lactação. Sobre esses desvios, duas contas respondem a duas perguntas diferentes. A **MPPA** (habilidade mais provável de produção) prevê a próxima lactação da vaca e serve para descarte; ela inclui o ambiente permanente. O **EBV** prevê o que a vaca transmite e serve para escolher de quem guardar filhas; ele combina registros próprios com a PTA do pai por índice de seleção **[fórmulas padrão, não verificadas na fonte; conferidas numericamente]**:

```
MPPA = μ + [n·r / (1 + (n − 1)·r)] · (ȳ − μ)               (n lactações, repetibilidade r)
EBV só com registros próprios = [n·h² / (1 + (n − 1)·r)] · (ȳ − μ)
Índice com PTA do pai (x₁ = ȳ − μ ; x₂ = PTA_pai de confiabilidade REL):
  P = [ σ²P·(r + (1 − r)/n)    REL·σ²a/4 ]      g = [ σ²a ; REL·σ²a/4 ]      b = P⁻¹g
      [ REL·σ²a/4              REL·σ²a/4 ]
  EBV = b'x ;  REL_vaca = b'g / σ²a
```

O exemplo usa seis vacas com lactações de 305 dias expressas como desvio das contemporâneas, h² = 0,25, repetibilidade de 0,50 e σP = 1.600 kg (hipotéticos).

| Vaca | Desvios (kg) | n | MPPA (desvio, kg) | PTA do pai (REL) | EBV pelo índice (kg) | REL da vaca |
|---|---|---|---|---|---|---|
| V1 | +1.200 | 1 | +600,0 | +200 (0,95) | +402,7 | 0,392 |
| V2 | +900, +700, +800 | 3 | +600,0 | +500 (0,99) | +593,3 | 0,482 |
| V3 | +1.000, +400 | 2 | +466,7 | +100 (0,60) | +278,9 | 0,404 |
| V4 | +600, +500, +700, +600 | 4 | +480,0 | 0 (0,90) | +204,4 | 0,489 |
| V5 | −300 | 1 | −150,0 | +600 (0,95) | +417,6 | 0,392 |
| V6 | −500, −100 | 2 | −200,0 | −100 (0,80) | −157,1 | 0,429 |

As duas ordens divergem. Pela MPPA, V1 e V2 empatam no topo, e V5 e V6 são as candidatas a descarte. Pelo EBV, a ordem é V2, V5, V1, V3, V4, V6: a V5, com uma única lactação ruim, sobe para o segundo lugar porque o pai tem PTA de +600 kg com REL de 0,95: com uma lactação e h² de 0,25, o índice dá coeficiente de 0,20 ao desvio da vaca e de 0,80 à PTA do pai. A repetibilidade mexe na MPPA: com r = 0,40, V2 passa à frente de V1 (533 contra 480); com r = 0,60, V1 lidera (720 contra 655). O EBV mantém a ordem nas três hipóteses **[conferido numericamente]**. As notas não acharam repetibilidade de lactação para Girolando ou Gir, e por isso o cálculo deve ser rodado com as três hipóteses.

### BLUP e regressão aleatória dentro do rebanho, com parâmetros externos

O modelo de dia de controle do exemplo da seção 3 roda num rebanho real do mesmo jeito, com o número de equações crescendo com o número de vacas, desde que as variâncias venham da literatura. Ele resolve o problema que mais engana o produtor, a comparação de vacas em estágios diferentes da lactação, e entrega persistência individual. Seus limites também apareceram no exemplo: seis controles dão REL de 0,15 a 0,24, e touros só com filhas no rebanho ficam com 0,10, com soluções que só se comparam entre si. A conexão com a população vem de usar touros de inseminação com prova publicada, cuja informação externa ancora o rebanho. Na prática, a maneira de ter PTAs comparáveis é inscrever o rebanho no controle leiteiro oficial e na avaliação nacional da raça; o BLUP interno serve para ranquear dentro de casa.

### Genotipar novilhas: ganho real, com ressalvas

Em Holandês canadense, a confiabilidade do pai médio de novilhas para LPI e Pro$ ficou entre 30% e 39% na maioria dos rebanhos, e a do pai médio genômico entre 69% e 73%. Para 60% dos rebanhos, a correlação entre a ordem antes e depois da genotipagem ficou entre 85% e 94%, mas alguns rebanhos ficaram abaixo de 65% ([Lactanet](https://lactanet.ca/?p=23484); atribuição dos números a cada documento a confirmar). A genotipagem reordena justamente onde o pedigree é pobre. As ressalvas são três. A confiabilidade genômica de Girolando é menor (50% a 67%) que a de Holandês. A validação do Clarifide em rebanhos pequenos e em Girolando não foi localizada pelas notas. E um teste comercial validado em outra população pode falhar: no relatório de corte, um teste genômico comercial não ranqueou corretamente cruzados de corte × Holandês.

### Toda taxa precisa de intervalo de confiança

Num rebanho pequeno, uma taxa por período tem muito ruído. A aproximação de Wald, EP = √[p(1 − p)/n], falha com n pequeno ou p extremo; os intervalos de Wilson e exato (Clopper-Pearson) são os indicados **[fórmulas padrão; conferidas numericamente]**:

| Caso | Taxa | Wald 95% | Wilson 95% | Exato 95% |
|---|---|---|---|---|
| Prenhez de 21 dias, 6 de 30 elegíveis | 20,0% | 5,7% a 34,3% | 9,5% a 37,3% | 7,7% a 38,6% |
| Prenhez de 21 dias, 20 de 100 | 20,0% | 12,2% a 27,8% | 13,3% a 28,9% | 12,7% a 29,2% |
| Concepção ao 1º serviço, 14 de 35 | 40,0% | 23,8% a 56,2% | 25,6% a 56,4% | 23,9% a 57,9% |
| Aborto, 1 de 20 gestações | 5,0% | −4,6% a 14,6% (impossível) | 0,9% a 23,6% | 0,1% a 24,9% |
| Mortalidade de bezerras, 0 de 25 | 0,0% | 0 a 0 (impossível) | 0 a 13,3% | 0 a 13,7% |

Comparar dois períodos exige ainda mais dados. Para detectar com 80% de poder e 5% de significância uma mudança de 20% para 30% na taxa de prenhez, são precisas **291 oportunidades por grupo**; de 20% para 35%, 136; de 35% para 45%, 373 **[conferido numericamente]**. Um rebanho de 100 vacas raramente distingue uma diferença de 10 pontos entre dois anos. Duas ferramentas ajudam. A primeira é encolher a taxa do período em direção a uma referência, como faz a MPPA: com uma priori Beta(10, 40), centrada em 20% e com peso de 50 oportunidades, 2 prenhezes em 30 viram 15% em vez de 6,7%, e 12 em 30 viram 27,5% em vez de 40% **[proposta deste relatório]**. A segunda é o CUSUM, S_t = máx(0; S_{t−1} + x_t − μ₀ − k), que acumula desvios até cruzar um limite. Em simulação, o CUSUM levou cerca de 300 dias para sinalizar uma queda da eficiência de detecção de cio para 0,55 num rebanho de 100 vacas e cerca de 60 dias num de 1.000, e valores de referência mal escolhidos pioram o desempenho ([J. Dairy Sci. 2003](https://www.sciencedirect.com/science/article/pii/S0022030203737850)). Os sinais devem ser tratados como motivo de investigação, separando novilhas e vacas.

### Endogamia: decidir por par, não por touro

O coeficiente de endogamia do filho é metade do parentesco entre pai e mãe, F = ½·a_pai,mãe, calculado pela matriz A (método tabular, no relatório de corte). O exemplo tem um touro popular P, um touro Q e um touro S filho de P, e quatro vacas: C, filha de P com uma filha de Q; V12, filha de Q; V13, filha de S; e V14, sem parentesco. Os candidatos são B1 (filho de P), B2 (filho de Q), B3 (filho de S) e B4 (sem parentesco) **[conferido numericamente]**.

| Touro | × C | × V12 | × V13 | × V14 | Média no rebanho |
|---|---|---|---|---|---|
| B1 (filho de P) | 12,50% | 0 | 6,25% | 0 | 4,69% |
| B2 (filho de Q) | 6,25% | 12,50% | 0 | 0 | 4,69% |
| B3 (filho de S) | 6,25% | 0 | 12,50% | 0 | 4,69% |
| B4 (sem parentesco) | 0 | 0 | 0 | 0 | 0 |

Os três touros aparentados têm **a mesma endogamia média no rebanho (4,69%)**, mas cada um é perigoso para vacas diferentes. A alocação certa (B1 em V12, B2 em V13, B4 em C, qualquer um em V14) zera a endogamia de todos os acasalamentos sem descartar nenhum touro. É a mesma lição do GFI americano, a versão genômica da endogamia futura esperada, que usa o parentesco do touro com fêmeas genotipadas nascidas nos últimos 48 meses e "não é específico do rebanho" ([Cole, Holstein USA 2019](https://www.holsteinusa.com/pdf/genetics_conference_2019/ColeJohn_Pros%20and%20cons%20of%20hitchhiking%20-%20the%20truth%20about%20inbreeding.pdf)). O USDA publica EFI de touros desde fevereiro de 1998 ([USDA-ARS](https://www.ars.usda.gov/research/publications/publication/?seqNo115=98468)). O limite rígido de 6,25% está em revisão: a AHDB britânica concluiu em 2025 que ele tem pouca relevância atual, porque mesmo os melhores acasalamentos dentro do limite deixariam a progênie com índice abaixo da mãe ([Cow Management](https://www.cowmanagement.co.uk/post/changes-to-inbreeding-advice-introduced-feb-25)). No Holandês americano, a endogamia sobe cerca de 0,25% ao ano, e limitá-la costuma significar escolher touros de índice menor ([JDS 2023](https://www.journalofdairyscience.org/article/S0022-0302(23)00709-9/pdf)). A recomendação prática é tratar 6,25% como alerta e calcular F por par antes de cada acasalamento.

### Estratégia por porte de rebanho

A tabela traduz as evidências numa recomendação **[proposta deste relatório, baseada nas fontes e nos exemplos acima]**.

| Porte | Avaliação genética | Ferramentas no próprio rebanho | Genômica |
|---|---|---|---|
| 30 a 200 vacas | Controle leiteiro oficial mensal e inscrição na avaliação da raça; compra de sêmen por índice e confiabilidade | Desvios das contemporâneas, MPPA com três repetibilidades, taxas com intervalo exato e médias móveis de 12 meses, F por acasalamento | Só para novilhas de reposição de maior valor, via programa da raça |
| 200 a 1.000 vacas | O mesmo, com inseminação estruturada (vários touros por safra, touros de referência repetidos) | Modelo de dia de controle com HTD e regressão aleatória, variâncias da literatura; índice EBV com PTA do pai; CUSUM por categoria | Genotipagem de todas as novilhas, se houver referência genômica validada para a raça |
| Mais de 1.000 vacas | Possível avaliação própria multicaracterística, conectada à nacional e com parâmetros externos; HVA entre unidades | Validação dos rankings com lactações futuras; índice econômico ajustado ao pagamento do laticínio | Genotipagem ampla, com o programa da raça como referência; registro de saúde padronizado para alimentar avaliações futuras |

## Conclusão

O leite parece mais complexo que o corte, mas a máquina é a mesma, e a complexidade está nos dados: a vaca produz o registro todo dia, e cada modelo leiteiro é uma forma de decidir quanto desse fluxo usar e contra quem comparar. A primeira lição é que a escolha mais consequente não é entre BLUP e genômica, e sim entre comparar a vaca com a média do rebanho ou com as contemporâneas do mesmo dia e do mesmo estágio de lactação. O exemplo do dia de controle mostrou que a segunda comparação inverte conclusões que a primeira daria como óbvias. A segunda é reconhecer que as características que mais ganharam peso nos índices recentes, como fertilidade, saúde e longevidade, são justamente as que nenhum rebanho consegue avaliar sozinho: com 100 filhas dando só 50% de confiabilidade em DPR, apenas referências de centenas de milhares de vacas, como a americana, e a genômica produzem PTAs úteis. No Brasil, as raças tropicais têm referências de dezenas de milhares de animais e, onde o modelo foi documentado (Girolando), avaliação oficial por lactação; o salto possível está em levar para elas o dia de controle e o registro padronizado de saúde e reprodução.

Para um software de gestão, a implicação é a mesma do corte com uma nuance. O valor não está em embutir um BLUP sofisticado, mas em registrar cada controle, cada inseminação, cada diagnóstico e cada caso de doença com data, identificação e definição padronizadas, de modo que o rebanho alimente a avaliação nacional e, ao mesmo tempo, receba de volta ferramentas simples e honestas: desvio das contemporâneas, MPPA, EBV com a PTA do pai, taxas com intervalo de confiança e endogamia por acasalamento. A nuance é que no leite os dados de saúde e de clima ainda são raros no Brasil, e quem os registrar bem agora terá, em poucos anos, informação que nenhum sumário oferece.

## O que o rebanho leiteiro precisa registrar para viabilizar essas análises

Quatro regras valem para todos os dados: registrar todas as vacas de cada controle e de cada grupo, inclusive as descartadas e mortas; registrar datas, não idades nem DEL calculados, para que o sistema derive DEL, IEP e dias abertos; usar códigos padronizados para eventos de saúde e motivos de descarte; e exportar no formato aceito pelo controle leiteiro oficial da raça.

| Dado | Para que serve | Mínimo necessário |
|---|---|---|
| Identificação | ligar controles, pedigree e genótipo | brinco ou RFID, raça e grau de sangue (frações Holandês/Gir no Girolando), data de nascimento |
| Pedigree | A⁻¹, PTA do pai no índice, heterozigose, F por acasalamento | pai (código do sêmen), mãe, avô materno; receptora em TE/FIV |
| Parto | início da lactação, ordem de parto, IEP, facilidade de parto, natimortalidade | data, ordem, escore de facilidade de 1 a 5, natimorto, sexo e identificação da cria, gemelaridade |
| Controle leiteiro | 305 dias, curva, dia de controle com HTD, persistência | data do controle (que define o HTD), leite por ordenha e número de ordenhas, gordura, proteína, CCS, laboratório e método |
| Secagem e fim da lactação | lactações incompletas e projeção | data de secagem e motivo |
| Reprodução | DPR, CCR, HCR, taxa de serviço, concepção, aborto | PEV adotado, cios, cada inseminação com data, touro e protocolo, diagnóstico com data, método e resultado, aborto |
| Saúde | avaliações de saúde, incidências, MPPA ajustada | cada caso com data e código: mastite clínica (quarto), metrite, retenção de placenta, cetose, deslocamento de abomaso, hipocalcemia, claudicação; diarreia e doença respiratória de bezerras |
| Saída do rebanho | vida produtiva, sobrevivência, descarte involuntário | data e motivo de venda, descarte ou morte |
| Crescimento e condição | metas de novilhas | peso e altura ao nascer, à desmama, à cobertura e ao parto; escore de condição corporal |
| Tipo e manejo | compostos de tipo, velocidade de ordenha, temperamento | classificação linear de 1 a 9 com data e avaliador; escores do ordenhador ou dados do robô |
| Grupo de manejo e clima | grupo de contemporâneos, tolerância ao calor | lote e regime (pasto, semiconfinamento, confinamento); localização da fazenda para ligar o THI diário |
| Genótipo | genômica, confirmação de paternidade | painel, laboratório e código da amostra |

## Apêndice A: script que reproduz os exemplos

O script usa apenas numpy e roda em menos de um segundo. Os dados de dia de controle foram gerados uma vez por simulação e estão fixados no código.

```python
# Reproduz os exemplos do relatorio de bovinos leiteiros (somente numpy). python3 apendice_leite.py
import math
import numpy as np
np.set_printoptions(precision=3, suppress=True, linewidth=120)
Phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
dens = lambda x: math.exp(-x * x / 2) / math.sqrt(2 * math.pi)

def matriz_A(ped):                       # metodo tabular (pais antes dos filhos)
    m = len(ped); A = np.zeros((m, m))
    for i in range(1, m + 1):
        s, d = ped[i]
        for j in range(1, i):
            A[i-1, j-1] = A[j-1, i-1] = 0.5 * ((A[j-1, s-1] if s else 0) + (A[j-1, d-1] if d else 0))
        A[i-1, i-1] = 1 + (0.5 * A[s-1, d-1] if s and d else 0)
    return A

# 1. Lactacao: TIM, solidos, ECS, Wood (log-linear e Gauss-Newton) e Wilmink
t = np.array([12, 42, 73, 101, 133, 162, 194, 224, 255, 286.])
m = np.array([24.0, 29.5, 30.2, 28.6, 27.1, 25.0, 23.4, 21.2, 19.5, 17.6])
gord = np.array([3.9, 3.5, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2])
prot = np.array([3.1, 3.0, 3.0, 3.1, 3.2, 3.3, 3.3, 3.4, 3.5, 3.5])
ccs = np.array([80, 120, 95, 150, 210, 180, 260, 140, 300, 220.])      # mil celulas/mL

def tim(t, m, fim=305):
    return t[0] * m[0] + sum((t[i+1] - t[i]) * (m[i] + m[i+1]) / 2 for i in range(len(t) - 1)) + (fim - t[-1]) * m[-1]

L, G, P = tim(t, m), tim(t, m * gord / 100), tim(t, m * prot / 100)
print(f"TIM: leite {L:.1f} | gordura {G:.1f} ({100*G/L:.2f}%) | proteina {P:.1f} ({100*P/L:.2f}%) | trimestral {tim(t[[0,3,6,9]], m[[0,3,6,9]]):.1f}")
print(f"FCM4% = {0.4*L + 15*G:.1f} | ECM = {L*(0.383*100*G/L + 0.242*100*P/L + 0.7832)/3.1138:.1f} | ECM/leite a 4,0% e 3,3% = {(0.383*4 + 0.242*3.3 + 0.7832)/3.1138:.4f}")
ecs = np.log2(ccs / 100) + 3
print("ECS:", ecs.round(2), f"| media {ecs.mean():.2f} -> CCS geometrica {100*2**(ecs.mean()-3):.0f} mil; aritmetica {ccs.mean():.0f} mil")
wood = lambda t, a, b, c: a * t**b * np.exp(-c * t)
co, *_ = np.linalg.lstsq(np.column_stack([np.ones(10), np.log(t), -t]), np.log(m), rcond=None)
th = np.array([math.exp(co[0]), co[1], co[2]]); tt = np.arange(1, 306)
print("Wood log-linear: a, b, c =", th.round(5), f"| pico {th[1]/th[2]:.1f} d | L305 {wood(tt, *th).sum():.1f}")
for it in range(50):                                                    # Gauss-Newton
    f = wood(t, *th); J = np.column_stack([f / th[0], f * np.log(t), -f * t])
    step = np.linalg.solve(J.T @ J, J.T @ (m - f)); th = th + step
    if np.abs(step).max() < 1e-12: break
a, b, c = th; rm = math.sqrt(((m - wood(t, *th))**2).mean())
print(f"Wood NLS: a={a:.3f} b={b:.4f} c={c:.5f} | pico {b/c:.1f} d, {a*(b/c)**b*math.exp(-b):.2f} kg | L305 {wood(tt,*th).sum():.1f} | RMSE {rm:.3f} | y300/y100 {wood(300,*th)/wood(100,*th):.3f}")
wm, *_ = np.linalg.lstsq(np.column_stack([np.ones(10), np.exp(-0.05 * t), t]), m, rcond=None)
wil = lambda t: wm[0] + wm[1] * np.exp(-0.05 * t) + wm[2] * t; tp = math.log(0.05 * wm[1] / wm[2]) / 0.05
print("Wilmink:", wm.round(5), f"| pico {tp:.1f} d, {wil(tp):.2f} kg | L305 {wil(tt).sum():.1f} | RMSE {math.sqrt(((m - wil(t))**2).mean()):.3f}")

# 2. Modelo de dia de controle com regressao aleatoria (HTD fixo, Legendre)
ped = {1: (0, 0), 2: (0, 0), 3: (1, 0), 4: (2, 0), 5: (1, 0), 6: (2, 0), 7: (1, 0), 8: (2, 0)}
Ainv = np.linalg.inv(matriz_A(ped)); nA = 8
parto = {3: -150, 4: -120, 5: -90, 6: -60, 7: -30, 8: -8}               # dia do parto relativo ao 1o controle
Y = {3: [17.5, 20.3, 12.5, 18.4, 12.9, 15.1], 4: [23.0, 25.9, 18.0, 17.3, 15.0, 16.8],
     5: [26.4, 24.1, 19.2, 24.3, 17.9, 19.5], 6: [31.4, 24.3, 28.2, 29.1, 20.9, 20.1],
     7: [20.3, 26.5, 19.6, 20.7, 15.9, 18.7], 8: [24.3, 26.7, 23.2, 23.6, 19.7, 20.0]}
def phi(t, k):                                                         # Legendre normalizado, DEL 5-305
    x = -1 + 2 * (t - 5) / 300; Pl = [1, x, (3*x*x - 1) / 2, (5*x**3 - 3*x) / 2]
    return np.array([math.sqrt((2*j + 1) / 2) * Pl[j] for j in range(k)])
Ka, Kp, s2e = np.array([[8., 1.], [1., 1.5]]), np.array([[14., 1.5], [1.5, 3.]]), 6.
rows = [(v, j, 30 * j - parto[v], Y[v][j]) for v in range(3, 9) for j in range(6)]
y = np.array([r[3] for r in rows]); n = len(rows)
X, Za, Zp = np.zeros((n, 9)), np.zeros((n, 2 * nA)), np.zeros((n, 12))
for i, (v, j, d, _) in enumerate(rows):
    X[i, j] = 1; X[i, 6:] = phi(d, 4)[1:]
    Za[i, 2*(v-1):2*v] = phi(d, 2); Zp[i, 2*(v-3):2*(v-2)] = phi(d, 2)
T = np.hstack([X, Za, Zp]); C = T.T @ T / s2e
C[9:9+2*nA, 9:9+2*nA] += np.kron(Ainv, np.linalg.inv(Ka)); C[9+2*nA:, 9+2*nA:] += np.kron(np.eye(6), np.linalg.inv(Kp))
sol = np.linalg.solve(C, T.T @ y / s2e); Ci = np.linalg.inv(C)
q = sum(phi(d, 2) for d in range(5, 306)); dp = phi(280, 2) - phi(60, 2)
print("equacoes:", C.shape[0], "| HTD:", sol[:6], "| curva fixa:", sol[6:9], "| q =", q, f"| DP gen. EBV305 = {math.sqrt(q@Ka@q):.0f}")
for k in range(1, 9):
    ak = sol[9+2*(k-1):9+2*k]; Ck = Ci[9+2*(k-1):9+2*k, 9+2*(k-1):9+2*k]
    print(f"animal {k}: a={ak.round(3)} EBV305={q@ak:7.1f} PTA305={q@ak/2:6.1f} REL={1-q@Ck@q/(q@Ka@q):.3f}"
          f" pers={dp@ak:6.3f} RELpers={1-dp@Ck@dp/(dp@Ka@dp):.3f}")
for d in (5, 60, 155, 250, 305):
    va, vp = phi(d, 2) @ Ka @ phi(d, 2), phi(d, 2) @ Kp @ phi(d, 2)
    print(f"DEL {d}: h2={va/(va+vp+s2e):.3f}", end="  ")
g1, g2 = phi(60, 2), phi(280, 2); print(f"| rg(60,280)={g1@Ka@g2/math.sqrt((g1@Ka@g1)*(g2@Ka@g2)):.3f}")

# 3. Confiabilidade a partir de filhas-equivalentes
k = lambda h2: (4 - h2) / h2
for h2 in (0.25, 0.04):
    kk = k(h2); de_pa = kk * 0.30 / 0.70
    print(f"h2={h2} k={kk:.1f}:", [(nf, round(nf/(nf+kk), 3), round((de_pa+nf)/(de_pa+nf+kk), 3)) for nf in (10, 50, 100, 200, 500)])
print("k(0,014), k(0,029) =", round(k(.014), 1), round(k(.029), 1), "| DE por filha (m = 1, 2, 3 lactacoes; h2 .25, r .5):",
      [round(k(.25) / k(mm*.25/(1+(mm-1)*.5)), 3) for mm in (1, 2, 3)], "| DE de REL .70:", round(15*.7/.3, 1), round(99*.7/.3, 1))

# 4. Dias abertos -> taxa de prenhez (AIPL) e forma linear
print("DO, AIPL, linear:", [(do, round(100*21/(do-60+11), 1), round(0.25*(233-do), 1)) for do in (90, 100, 120, 133, 150, 180, 233)])

# 5. Indice economico de dois touros (valores hipoteticos em R$, exceto o NM$ parcial)
v = np.array([0.022, 5.01, 3.33, 30.])                                 # NM$ 2025 (US$/lb, US$/mes), a conferir
print("NM$ parcial: A =", v @ [1800., 90., 60., 0.5], "B =", v @ [700., 60., 40., 4.5])
w = np.array([0.05, 20., 28., 90., 60., -250.])                        # leite, gordura, proteina, VP, DPR, ECS
tA, tB = np.array([800., 40., 27., 0.2, -1.5, 0.12]), np.array([320., 27., 18., 2.0, 1.8, -0.10])
sd = np.array([250., 10., 7., 1.5, 1.2, 0.12])                         # DP das PTAs (hipotetico)
for nome, ww in (("base", w), ("cenario 2", np.array([-0.02, 20., 28., 90., 120., -250.]))):
    eA, eB = [math.sqrt(np.sum(ww**2 * (1 - r) * sd**2)) for r in (0.95, 0.65)]
    print(f"{nome}: I_A={ww@tA:.1f} I_B={ww@tB:.1f} enfase%={(100*abs(ww)*sd/np.sum(abs(ww)*sd)).round(1)}"
          f" P(A>B)={Phi((ww@tA - ww@tB)/math.hypot(eA, eB)):.3f}")

# 6. Vacas do rebanho: MPPA e indice (registros proprios + PTA do pai)
vacas = {"V1": [1200.], "V2": [900., 700., 800.], "V3": [1000., 400.], "V4": [600., 500., 700., 600.], "V5": [-300.], "V6": [-500., -100.]}
pai = {"V1": (200., .95), "V2": (500., .99), "V3": (100., .60), "V4": (0., .90), "V5": (600., .95), "V6": (-100., .80)}
s2p, h2 = 1600.**2, 0.25; s2a = h2 * s2p
for r in (0.4, 0.5, 0.6):
    out = {}
    for nm, regs in vacas.items():
        nn, dm = len(regs), np.mean(regs); pta, rel = pai[nm]
        Pm = np.array([[s2p * (r + (1 - r) / nn), rel * s2a / 4], [rel * s2a / 4, rel * s2a / 4]]); g = np.array([s2a, rel * s2a / 4])
        bb = np.linalg.solve(Pm, g)
        out[nm] = (round(float(nn * r / (1 + (nn - 1) * r) * dm), 1), round(float(bb @ [dm, pta]), 1), round(float(bb @ g / s2a), 3))
    print(f"r={r}:", out)

# 7. Intervalos de confianca de taxas (Wald, Wilson, exato) e tamanho amostral
z, zb = 1.959963985, 0.8416212335659
def ic(x, n):
    p = x / n; e = z * math.sqrt(p * (1 - p) / n)
    cw = (p + z*z/(2*n)) / (1 + z*z/n); hw = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / (1 + z*z/n)
    cdf = lambda xx, pp: sum(math.comb(n, kk) * pp**kk * (1 - pp)**(n - kk) for kk in range(0, xx + 1))
    def bis(fn):
        lo, hi = 0.0, 1.0
        for _ in range(200):
            mid = (lo + hi) / 2
            if fn(mid): lo = mid
            else: hi = mid
        return lo
    lo = 0.0 if x == 0 else bis(lambda pp: 1 - cdf(x - 1, pp) < 0.025)
    hi = 1.0 if x == n else bis(lambda pp: cdf(x, pp) > 0.025)
    return [round(u, 3) for u in (p - e, p + e, cw - hw, cw + hw, lo, hi)]
for x, n in ((6, 30), (20, 100), (14, 35), (1, 20), (0, 25)):
    print(f"{x}/{n}: Wald, Wilson, exato =", ic(x, n))
print("n por grupo:", [round((z + zb)**2 * (p1*(1-p1) + p2*(1-p2)) / (p1 - p2)**2, 1) for p1, p2 in ((.2, .3), (.2, .35), (.35, .45))],
      "| posteriori Beta(10,40):", [(x + 10) / (30 + 50) for x in (6, 2, 12)])

# 8. Endogamia esperada dos acasalamentos (F do filho = metade do parentesco entre os pais)
pedF = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (2, 0), 5: (1, 0), 6: (0, 0), 7: (1, 3), 8: (1, 4), 9: (2, 6), 10: (5, 6),
        11: (0, 0), 12: (2, 0), 13: (5, 0), 14: (0, 0)}                # 1 = P, 2 = Q, 5 = S (filho de P), 4 = filha de Q
AF = matriz_A(pedF)
for tn, tb in (("B1", 7), ("B2", 9), ("B3", 10), ("B4", 11)):
    Fs = [float(0.5 * AF[tb-1, vc-1]) for vc in (8, 12, 13, 14)]
    print(tn, "x vacas C, V12, V13, V14:", [round(f, 4) for f in Fs], "| media", round(float(np.mean(Fs)), 4))

# 9. Outras contas do texto
for p in (0.02, 0.05, 0.10, 0.20):                                     # Dempster e Lerner
    lo, hi = -10., 10.
    for _ in range(200):
        mid = (lo + hi) / 2; lo, hi = (mid, hi) if Phi(mid) < 1 - p else (lo, mid)
    print(f"incidencia {p}: fator {dens(lo)**2/(p*(1-p)):.3f}", end="  ")
s2d = 4 * .022; sdm = 4 * (.009 - s2d / 8); s2m = 4 * (.016 - s2d / 16 - sdm / 4); sp = 1 + .022 + .016
print(f"\nSMGS: s2d={s2d:.3f} s2m={s2m:.3f} sdm={sdm:.3f} rdm={sdm/math.sqrt(s2d*s2m):.2f} h2d={s2d/sp:.3f} h2m={s2m/sp:.3f}")
G0 = np.array([[4.0, -0.10], [-0.10, 0.010]])
print("calor: var(f) =", [round(float(G0[0, 0] + 2*f*G0[0, 1] + f*f*G0[1, 1]), 2) for f in (0, 5, 10, 15)],
      "| A:", [round(1.2 - .10*f, 2) for f in (0, 5, 10, 15)], "| B:", [round(.6 + .01*f, 2) for f in (0, 5, 10, 15)])
print("Garrick (h2 .30):", {cc: [round(0.7 / ((cc + (1 - r2) / r2) * 0.3), 2) for r2 in (.95, .80, .50, .20)] for cc in (0.1, 0.5)})
print("Daetwyler (Me 5000): N para REL .5/.7 =", {h: (round(5000/h), round(5000/h*7/3)) for h in (0.30, 0.04, 0.87)},
      "| REL com N touros (DRP .87):", [round(N*.87/(N*.87 + 5000), 3) for N in (1000, 5000, 20000)])
het = lambda ps, pd: ps * (1 - pd) + (1 - ps) * pd
print("heterozigose:", {nm: het(*pp) for nm, pp in (("F1", (1, 0)), ("3/4", (1, .5)), ("5/8", (.75, .5)), ("5/8x5/8", (.625, .625)), ("7/8", (1, .75)))})
print(f"base 752 lb = {752*0.45359237:.1f} kg | dG 4 vias = {1081/31:.2f} kg/ano | novilha: GMD ate 55% aos 15 m = {(0.55*550-35)/(15*30.4375):.3f},"
      f" ate 85% aos 24 m = {(0.85*550-35)/(24*30.4375):.3f} | 2142/365 = {2142/365:.2f} | DO CESIPL = {413.45-280:.1f}, PR = {100*21/(413.45-280-49):.1f}%")
```

Os demais números do texto (conversões de unidade, somas de pesos dos índices, cruzamento das normas de reação a cerca de 5,5 unidades de THI e DE de um registro próprio) são aplicações diretas das fórmulas mostradas em cada seção e foram calculados no mesmo ambiente.
