# Modelos estatísticos para avaliação genética de características de produção de leite em bovinos leiteiros

**Notas metodológicas.** Pesquisa realizada em 2026-10-14 apenas com WebSearch (WebFetch e HTTP externo indisponíveis). Foram cerca de 22 chamadas de busca e leitura. Quase todas as informações vêm de resumos de busca, metadados bibliográficos e citações secundárias. Nenhum texto-fonte completo foi lido. Por isso as equações "como apresentadas nas fontes" não puderam ser transcritas literalmente: as formas matriciais abaixo são formas gerais de referência, marcadas como [não verificado] quando não há fonte no corpus. Onde uma fonte conflita com outra, o conflito está registrado. Antes de redigir o documento técnico, recomenda-se ler os textos completos dos artigos marcados como prioritários nas lacunas.

---

## 1. Cálculo da produção em 305 dias: Test Interval Method (TIM) e Best Prediction (BP)

### Takeaway
A produção padronizada de 305 dias é obtida a partir de controles mensais por dois métodos principais: o TIM, recomendado pelo ICAR e ainda o mais usado, e o BP de VanRaden, que é mais acurado, sobretudo quando o controle é menos frequente, e que também fornece uma estimativa fenotípica de persistência.

### Cited Findings
- O ICAR Procedure 2 ("Computing Lactation Yield", jan. 2020) documenta a interpolação com curvas-padrão de lactação, que preenche controles faltantes e projeta o total de 305 dias. Segundo o resumo, não é o TIM em si. Leitura direta não feita. — [ICAR Procedure 2](https://www.icar.org/Guidelines/02-Procedure-2-Computing-Lactation-Yield.pdf)
- Levantamento global citado pelo buscador: 74% das organizações de controle leiteiro usam o TIM, por simplicidade, ao custo de alguma acurácia. A fonte individualizada não foi confirmada; o documento listado mais próximo é um resumo de ICAR 2026. — [ICAR Verona 2026, TS12 van Leerdam](https://www.icar.org/Documents/Verona-2026/Abstracts/TS12_van%20Leerdam.pdf)
- Em estudo do USDA (J. Dairy Sci. 82:438, 1999), com controle mensal, o TIM tem correlação de cerca de 0,97 entre a estimativa e o total real de 305 dias. Com controle trimestral a correlação cai para cerca de 0,93. — [AIPL/USDA, JDS 1999 82:438](https://www.aipl.arsusda.gov/publish/jds/1999/82_438.pdf)
- Em um estudo croata citado pelo buscador, o TIM foi a referência ICAR para 100, 200 e 305 dias. Controle a cada 6 semanas, em vez de 4, aumentou viés e reduziu acurácia nas predições de 305 dias. Fonte individualizada não confirmada; URL listado: [istocar.bg.ac.rs V24-I3-4-2](https://www.istocar.bg.ac.rs/wp-content/uploads/2023/01/V24-I3-4-2.pdf)
- VanRaden (1997), J. Dairy Sci. 80(11):3015–3022: BP combina controles disponíveis com as correlações entre produções diárias. Essas correlações foram estimadas a partir de cerca de 500.000 lactações de controle diário. — [AIPL, Best Prediction of Lactation Yield](https://aipl.arsusda.gov/reference/bestpred.htm) (referência bibliográfica do artigo de 1997 vem do resumo do buscador; texto integral não lido)
- Data de adoção do BP nas avaliações do USDA: **conflito entre fontes**. A página AIPL diz que começou em fevereiro de 1999. Cole, Null e VanRaden, citados em resumo, dizem 1998, substituindo o TIM usado desde 1969. Fonte individualizada do segundo dado não confirmada. — [AIPL, Best Prediction](https://aipl.arsusda.gov/reference/bestpred.htm); [WCGALP 1998, paper 343](https://aipl.arsusda.gov/publish/other/1998/conf_wcg23_343.pdf)
- Comparação TIM x BP em WCGALP 1998 (Norman et al.): BP é mais complexo, mas mais acurado, especialmente com menor frequência de controle. — [Norman et al., WCGALP 1998](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/1998/WC6_23_343_NormanEtAl.pdf)
- Registros por BP têm desvio-padrão ligeiramente menor que os do TIM, porque o BP encolhe as estimativas em direção à média do rebanho. — [PMC12094053, revisão sobre BP](https://pmc.ncbi.nlm.nih.gov/articles/PMC12094053)
- O mesmo procedimento BP gera uma estimativa de persistência, a partir da combinação dos controles. — [VanRaden 1998, Best prediction of lactation yield and persistency (WCGALP)](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/1998/WC6_23_347_VanRaden.pdf)
- Limitação do BP: força persistência e produção a serem fenotipicamente independentes. VanRaden argumenta que a variância de controles parciais deve ser maior que a de controles completos, por causa do erro de medida adicional. — [PMC12094053](https://pmc.ncbi.nlm.nih.gov/articles/PMC12094053)
- Títulos relacionados, sem leitura do conteúdo: "Best prediction of yields for long lactations" (JDS 2009) — [link](https://www.journalofdairyscience.org/article/S0022-0302(09)70493-X/pdf); "Genetic Evaluation and Best Prediction of Lactation Persistency" (JDS 2006) — [link](https://www.journalofdairyscience.org/article/S0022-0302(06)72348-7/fulltext).

**Formas matriciais de referência (não verificadas no texto-fonte):**
```
BP:   Ŷ305 = μ_Y + C_YT · C_TT⁻¹ · (T − μ_T)
      T = vetor de controles observados; C_YT, C_TT = covariâncias obtidas das
      correlações entre produções diárias (ver VanRaden 1997)            [não verificado]

TIM:  Y305 = soma, sobre os intervalos entre controles, de (dias do intervalo) × média
      dos dois controles extremos, com extrapolação nas pontas           [não verificado]
```
O método TIM original costuma ser atribuído a Sargent et al. (1968). Não foi verificado.

### Inferences
- Em rebanhos com controle mensal regular, TIM e BP devem produzir totais próximos. A vantagem do BP aparece com controles esparsos ou irregulares, situação comum em sistemas tropicais com controle não padronizado (inferência a partir dos resultados de frequência de controle).
- Como o BP encolhe os registros, as variâncias de 305 dias por BP são menores que as do TIM. Comparações de herdabilidade entre os dois métodos devem levar isso em conta (inferência).

### Gaps
- Fórmula exata do TIM na ICAR Procedure 2 não obtida. Texto integral não lido.
- Fonte do número de 74% de adoção do TIM não confirmada.
- Conflito de datas de adoção do BP nos EUA (1998 x fevereiro de 1999) não resolvido.
- Tratamento de lactações incompletas no TIM e no BP: não pesquisado nesta rodada (ver seção 2).

---

## 2. Maturidade equivalente (ME), ajustes de idade-estação e extensão de lactações incompletas

### Takeaway
Não pesquisado com fontes verificadas nesta rodada. Os conceitos são padrão, mas não há fonte no corpus para os fatores numéricos.

### Cited Findings
- Nenhuma fonte verificada com URL foi obtida para fatores de ME, para efeitos de idade-estação ou para métodos de extensão de lactações incompletas.
- Conceito de referência (não verificado): ME converte a produção de primíparas para o equivalente de vaca adulta, por meio de fatores de idade ao parto e de ordem de parto. A idade-estação entra nos modelos como efeito fixo.

### Inferences
- Nenhuma inferência fundamentada com as fontes desta rodada.

### Gaps
- Fatores ME (ICAR e USDA), fatores de idade-estação e métodos de extensão (ex.: curvas de Wood, extensão por fatores fixos). Sugestão de busca: "mature equivalent factors ICAR", "age season adjustment lactation yield".

---

## 3. Modelos de lactação: repetibilidade do animal e multi-características entre lactações

### Takeaway
Os modelos de lactação com produção de 305 dias usam repetibilidade (efeito genético aditivo e de ambiente permanente) ou tratam as lactações como traços correlacionados. As correlações genéticas entre lactações para produção de leite são geralmente altas (em torno de 0,7 a 0,9 em estudos de gado Holandês e búfalos), mas variam entre populações e definições de característica.

### Cited Findings
- Gado leiteiro tailandês (AJAS 2020): modelo multi-característica de regressão aleatória com 3 lactações. Correlações dentro da mesma lactação entre produções de 305 dias: 0,44 a 0,69. Entre lactações: 0,36 a 0,68, com o maior valor entre a 1ª e a 2ª. — [DOAJ, AJAS 2020](https://doaj.org/article/0eea6095f40745d09199c46055d2d501)
- Holandês da Etiópia (regressão aleatória de controle diário, 3 lactações tratadas como traços): correlações genéticas de 305 dias de 0,88 (1–2), 0,83 (2–3) e 0,70 (1–3). Os autores concluíram que as lactações devem ser tratadas como traços diferentes e correlacionados. Fonte individualizada não confirmada.
- Búfalos (Archiv für Tierzucht, 2013): correlações genéticas para produção de leite de 0,77 (1–2), 0,67 (1–3) e 0,79 (2–3). As correlações para produção de gordura foram negativas. — [AAB 2013, 56:423](https://aab.copernicus.org/articles/56/423/2013/aab-56-423-2013.pdf)
- Gir (Pesquisa Agropecuária Brasileira, 2015, "Models for genetic evaluation of milk yield in multiple lactations"): herdabilidade de 0,24 a 0,29, parecida entre modelos e lactações. Correlações para produção acumulada de 305 dias próximas de 1,0, o que sugere usar dados da primeira lactação para selecionar touros. Valores quase unitários são incomuns e podem refletir a definição do traço acumulado. — [Embrapa PAB 2015](https://apct.sede.embrapa.br/pab/article/view/20433)
- Holandês tcheco e Pied tcheco (Dedková & Wolf, 2001): análises multi-característica com as três primeiras lactações como traços separados, para leite, gordura e proteína, com REML sob modelo animal. Valores numéricos não obtidos. — [AGRIS, Czech dairy cattle populations](https://agris.fao.org/search/ar/records/647235bd2c1d629bc978c242)

**Forma matricial de referência (não verificada no texto-fonte):**
```
Repetibilidade:    y = Xb + Za + Wp + e
                   h² = σ²a / σ²p ;  r = (σ²a + σ²pe) / σ²p          [não verificado]

Multi-característica entre lactações (ℓ = 1,2,3):
                   y = Xb + Za + e,   Var(a) = G0 ⊗ A
                   G0 = matriz 3×3 de covariâncias genéticas entre lactações  [não verificado]
```

### Inferences
- As correlações genéticas altas entre a 1ª e a 2ª lactação justificam aproveitar a informação de primíparas para avaliar multíparas, desde que o modelo trate os traços como correlacionados (inferência).
- A diferença entre correlações dentro e entre lactações, no estudo tailandês, sugere que o efeito de ambiente permanente é relevante para a segunda lactação (inferência a partir de um resultado único, não confirmada).

### Gaps
- Matrizes G0 e equações dos estudos citados não obtidas.
- Valores de repetibilidade por lactação para Holandês brasileiro não encontrados.
- Capítulos de Mrode (Linear Models for the Prediction of Animal Breeding Values) sobre multi-característica não acessados.

---

## 4. Funções de curva de lactação: Wood, Wilmink, Ali & Schaeffer e Legendre

### Takeaway
Wood (3 parâmetros) e Wilmink (3 parâmetros) descrevem a curva com poucos parâmetros. Ali & Schaeffer (5 parâmetros, em log) e os polinômios de Legendre captam mais formas. Em vários estudos, Ali & Schaeffer ou Wilmink ajustam melhor que Wood, principalmente perto do pico. Pico e persistência são derivados dos parâmetros, e as definições variam.

### Cited Findings
- Número de parâmetros: Wood (gama incompleta) 3; Wilmink 3; Ali & Schaeffer 5. — [Comparação em primíparas Holandesas iranianas](https://www.researchgate.net/publication/228967019_Comparison_and_evaluation_of_mathematical_lactation_curve_functions_of_Iranian_primiparous_Holsteins)
- Holandês de uma fazenda na Turquia: Ali & Schaeffer teve o maior R² e o menor RMSE em todas as lactações. Entre os modelos de 3 parâmetros, Wilmink e Guo–Swalve foram melhores. — [Turquia, comparação de modelos](https://www.researchgate.net/publication/233799450_Comparison_of_different_lactation_curve_models_in_Holstein_cows_raised_on_a_farm_in_the_south-eastern_Anatolia_region)
- No Irã, Ali & Schaeffer teve o melhor ajuste (Olori et al., 1999, citado), mas por pouco em relação a Wilmink. Wood foi escolhido para predição diária por ter parâmetros mais simples e menor custo computacional. — [Irã, comparação de funções](https://www.researchgate.net/publication/228967019_Comparison_and_evaluation_of_mathematical_lactation_curve_functions_of_Iranian_primiparous_Holsteins)
- Regressão quantílica em gado leiteiro: a função de Wood teve o pior desempenho entre as funções testadas, para todas as características. — [Using quantile regression for fitting lactation curve in dairy cows](https://www.cambridge.org/core/journals/journal-of-dairy-research/article/abs/using-quantile-regression-for-fitting-lactation-curve-in-dairy-cows/08C1DE44E814A5C8628BA1A8DB55B174)
- Wood não ajusta de forma consistente vacas de alta produção em torno do pico (Rowlands et al., 1982, citado em resumo). Fonte individualizada não confirmada.
- Detecção de formas de curva em estudo com dados de gado Simmental (resumo descreve estudo italiano): modelos de 3 parâmetros (Wood e Wilmink) separaram 2 grupos, padrão e atípico. Modelos de 5 parâmetros (Ali & Schaeffer e Legendre) reconheceram mais formas. — [JDS 2005, Detection of Different Shapes of Lactation Curve](https://www.sciencedirect.com/science/article/pii/S0022030205727843); vínculo exato entre o artigo e o estudo italiano não confirmado.
- A função de Wilmink foi a original do programa oficial de avaliação genética do Canadá (Schaeffer et al., 2000, citado). Fonte individualizada não confirmada.
- Brasil: comparação entre polinômios de Legendre e a função de Wilmink para avaliação genética de persistência em Holandês. Usou 87.045 registros de controle diário de 11.023 vacas de primeira lactação. O resumo atribui o estudo a Minas Gerais, sem confirmação. — [SciELO, ABMVZ 2006](https://scielo.br/scielo.php?pid=S0102-09352006000400025&script=sci_arttext)
- Esse mesmo estudo cita Schaeffer (2004) como base para usar polinômios ortogonais como covariáveis em regressão aleatória. Artigo de referência de Schaeffer (2004), "Application of random regression models in animal breeding", Livestock Production Science, com link listado: [ScienceDirect S0301622603001519](https://www.sciencedirect.com/science/article/abs/pii/S0301622603001519). Texto não lido.
- Persistência derivada da curva: o Girolando usou a medida PS7 proposta por Kistemaker (2003), com Legendre de ordem 3 para o efeito genético aditivo e de ordem 5 para o efeito de ambiente permanente. — [Animal Bioscience, Girolando, RRM](https://www.animbiosci.org/journal/view.php?number=23198)

**Formas de referência (não verificadas no texto-fonte):**
```
Wood (gama incompleta):   y(t) = a · t^b · e^(−c·t)
                          t_pico = b / c ;  y_pico = a · (b/c)^b · e^(−b)          [não verificado]
Wilmink:                  y(t) = a + b · e^(−k·t) + c · t   (k fixo, ~0,05)        [não verificado]
Ali & Schaeffer (1987):   polinômio de 5 parâmetros em termos de log(t) (forma exata não verificada)
Legendre (ordem k):       y(t) = Σ_{m=0..k} φ_m(x(t)) · β_m ;  x(t) ∈ [−1, 1] reescala os DEL
                          φ_m = polinômios de Legendre                              [não verificado]
Persistência:             definição varia (razão ou diferença entre pontos da curva,
                          ou inclinação); usar a definição do artigo de origem        [não verificado]
```

### Inferences
- Para descrever o formato geral da curva, três parâmetros bastam. Para pico e persistência, especialmente em vacas de alta produção, convém usar cinco parâmetros ou Legendre (inferência a partir dos estudos de forma).
- Wood é inadequado para descrever o pico em alta produção. Para regressão aleatória, polinômios ortogonais de Legendre são a escolha usual nos estudos encontrados.

### Gaps
- Equações exatas e definições de persistência de cada função não obtidas de texto-fonte.
- Olori et al. (1999), Rowlands et al. (1982) e Schaeffer et al. (2000) não acessados.
- Ali & Schaeffer (1987) não acessado. Sua forma exata está marcada como não verificada.

---

## 5. Modelo de regressão fixa com controle diário (Ptak & Schaeffer, 1993) e grupo HTD

### Takeaway
Ptak & Schaeffer (1993) propuseram um modelo de controle diário em que a forma da curva é fixa dentro de subclasses (idade-estação, região, ordem de parto e intervalo entre partos), e os coeficientes de regressão fixa seguem Ali & Schaeffer (1987). O grupo de contemporâneos é o rebanho-dia-de-controle (HTD). Esse grupo produziu variâncias residuais menores que as alternativas testadas. O modelo ignora diferenças de persistência entre animais. Todas as afirmações desta seção vêm de descrições secundárias.

### Cited Findings
- Citação bibliográfica de Ptak & Schaeffer (1993): "Use of test day yields for genetic evaluation of dairy sires and cows", Livestock Production Science 34:23–34. Metadados indicados pelo buscador, sem conferência em base bibliográfica. Sem URL verificado.
- Regressões fixas (Ali & Schaeffer, 1987) aninhadas em idade-estação, região, ordem de parto e intervalo entre partos, como efeitos fixos ambientais. — descrição secundária, fonte individualizada não confirmada.
- O grupo HTD produziu variâncias residuais menores que as alternativas testadas por Ptak & Schaeffer. — descrição secundária, fonte individualizada não confirmada.
- Ali & Schaeffer (1987) é apresentado como base das regressões fixas. Schaeffer (1987), "Accounting for covariances among test day milk yields in dairy cows", Can. J. Anim. Sci. 67:637–644, é citado nos mesmos resumos. Sem URL.
- Classificação de modelos de controle diário em duas etapas, regressão fixa e regressão aleatória, com a regressão aleatória permitindo que o valor genético do animal varie ao longo da lactação. — [Swalve (2000), JDS 83(5):1115–1124](https://www.sciencedirect.com/science/article/pii/S0022030200749770) (somente resumo lido)
- Revisão de Swalve (1995), "Test day models in the analysis of dairy production data: a review", Archiv für Tierzucht 38(6):11–31. Citação do buscador, sem URL.

**Forma matricial de referência (não verificada no texto-fonte):**
```
y = Xb + Φ·β_s + Zu + e
Φ  = covariáveis de Ali & Schaeffer (fixas dentro de subclasse s)
Z  = matriz de incidência do efeito genético aditivo u
Var(u) = A·σ²u ;  Var(e) = R                                              [não verificado]
```

### Inferences
- O grupo HTD absorve variação ambiental de cada dia de controle dentro do rebanho. Isso é útil em rebanhos com muitos controles (inferência).
- Ao fixar a forma da curva por subclasse, o modelo supõe que a curva genética é a mesma para todos os animais da subclasse. Os modelos de regressão aleatória relaxam essa suposição (inferência a partir da descrição secundária).

### Gaps
- Texto-fonte de Ptak & Schaeffer (1993) não acessado, e sem URL. As descrições vêm de citações secundárias.
- Equações de Ptak & Schaeffer não obtidas.
- Schaeffer & Dekkers (1994) e Swalve (2000) não lidos em texto integral.

---

## 6. Modelos de regressão aleatória (RRM) em controle diário

### Takeaway
Os modelos de regressão aleatória, introduzidos por Schaeffer & Dekkers (1994), modelam a curva de cada animal com coeficientes aleatórios (aditivos e de ambiente permanente) sobre funções de Legendre. Ordens 3 a 5 costumam ajustar bem. Variâncias residuais heterogêneas por classe de dias em lactação melhoram o ajuste. As predições de 305 dias e de persistência derivam dos coeficientes. A ordem ideal depende da população e do critério de comparação (AIC, BIC, DIC ou acurácia com dados mascarados).

### Cited Findings
- Schaeffer & Dekkers (1994), "Random regressions in animal models for test-day production in dairy cattle", Proc. 5th World Congress on Genetics Applied to Livestock Production, Guelph, vol. 18, pp. 443–446. Citação bibliográfica apenas. Sem URL.
- Segundo fontes posteriores, o RRM trata o tempo de forma contínua, permite variâncias e covariâncias heterogêneas ao longo do tempo e inclui dias não amostrados. — descrição secundária.
- Jamrozik & Schaeffer (1997), "Estimates of genetic parameters for a test day model with random regressions for yield traits of first lactation Holsteins", J. Dairy Sci. 80(4):762–770. DOI: [10.3168/jds.S0022-0302(97)75996-4](https://doi.org/10.3168/jds.S0022-0302(97)75996-4). Resumo não obtido. Estudos posteriores citam este trabalho.
- Estudo de Holandês Valão (JABG 2022, Paiva et al.), que cita Jamrozik & Schaeffer (1997), com regressão aleatória e efeito de ambiente permanente. A DIC cai com a ordem do polinômio, mas o terceiro grau foi considerado o mais parcimonioso para leite. — [JABG 2022, Walloon Holstein](https://onlinelibrary.wiley.com/doi/abs/10.1111/jbg.12673)
- Jamrozik, Schaeffer & Dekkers (1997), "Genetic evaluation of dairy cattle using test day yields and a random regression model", J. Dairy Sci. (autores e volume 80:1217 de conhecimento prévio, não verificados). — [JDS 1997, PDF](https://www.journalofdairyscience.org/article/S0022-0302(97)76050-8/pdf). Texto não lido.
- Covariance functions e regressões aleatórias para avaliação de produção de leite por controle diário (título listado, JDS 1998): [link](https://www.sciencedirect.com/science/article/pii/S0022030298758953). Texto não lido.
- Holandês chinês (cerca de 419.000 registros de primeira lactação): ordens 1 a 5 comparadas. O modelo com Legendre de ordem 3 e variância residual heterogênea teve o menor TRV e −2logL, e a maior correlação para EBV305 em teste com dados mascarados. Ordens 3 a 5 deram parâmetros genéticos semelhantes. — [bioRxiv 2019](https://www.biorxiv.org/content/10.1101/562991v1); [PMC, versão publicada](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7674963/)
- Holandês brasileiro: ordens 3 a 5 comparadas, sem tendência consistente nas variâncias. Outro estudo brasileiro concluiu que a ordem 5 foi a melhor por AIC e BIC. — [SciELO RBZ, Legendre em controle diário de primeira lactação](http://www.scielo.br/j/rbz/a/qvpCDsgr6TZS4w68VBchqCN/?lang=en); [SciELO RBZ, produção em primíparas](http://www.scielo.br/j/rbz/a/tLJqMNpnjvCNVMnSj7RNdcM/?lang=en)
- Holandês do Rio Grande do Sul: 21.702 registros de 2.429 primíparas, polinômio de quarta ordem, com efeitos de rebanho-ano-estação e idade ao parto. — [Ciência Rural, persistência via RRM](http://www.scielo.br/j/cr/a/mLsrrHQBvkYwYbKxcKXqtpP/?lang=pt)
- Comparação de RRM com o modelo de lactação de 305 dias para Holandês no Brasil (dados ABCBRH 1990–2011): polinômios de Legendre de ordem 3 a 5 e restrição a vacas com pelo menos 4, 6, 8 e 10 controles. — [CORE, RRM como alternativa ao modelo de lactação](https://core.ac.uk/display/293560837)
- Holandês brasileiro: RRM com Legendre aumenta a confiabilidade dos valores genéticos em relação ao modelo de lactação de 305 dias. Ordens 4 a 6 são citadas como boas opções. — [Pesquisa Agropecuária Brasileira 2016](http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0100-204X2016001101848)
- Holandês brasileiro: usar múltiplas regressões fixas no modelo de Legendre muda a ordem dos valores genéticos de touros, tanto para persistência quanto para 305 dias. — [SciELO RBZ, persistência e modelos de regressão fixa](https://www.scielo.br/j/rbz/a/3KPYRkNqWrc4CLvyJtmPZsS/?lang=en)
- Girolando: Legendre de quarta ordem com variância residual heterogênea em cinco classes foi o modelo mais adequado em estudo de tese da UNESP, com dados genômicos. Herdabilidade média de 0,56 e repetibilidade de 0,84. Valores muito altos para controle diário, que devem ser verificados. — [UNESP, RRM genômica Girolando](https://repositorio.unesp.br/entities/publication/8d58acaf-91a3-4814-b8fe-26825f60a670)
- Girolando (tese UFV, 973 primíparas): modelo W05 teve o melhor ajuste para controle diário. Herdabilidade até 305 dias de 0,31 pelo RRM e 0,24 pelo modelo de produção de 305 dias. — [UFV, RRM na avaliação de Girolando](https://locus.ufv.br/items/69f0f6aa-6b1d-4848-8b47-d2a1d4116ef6)
- Guzerá: herdabilidade de 0,24 a 0,52 para produção de leite no controle diário, com polinômios de Legendre, em análise de agrupamento de valores genéticos. — [SciELO Ciência Rural, Guzerá](https://www.scielo.br/j/cr/a/9b8hfRxZYMxhHQv6S8LKJyM/?lang=en); [SciELO PAB, Guzerá RRM Legendre](http://www.scielo.br/j/pab/a/8gCSMXy35PHNVDQfdLJYsgD/?lang=en)
- Gir leiteiro: para PL305 das três primeiras lactações, herdabilidades de 0,26 a 0,28. Para produção no controle diário, o modelo autorregressivo foi preferido, com herdabilidades de 0,26 a 0,32. Fonte individualizada provável: [UFV, alternativas para avaliação do Gir leiteiro](https://locus.ufv.br/items/0b0566e5-13fe-4a35-b7b1-433a061a8baa).
- Um estudo citado em tese da UNESP (Costa et al., 2005) relatou herdabilidade de cerca de 0,74 no início da lactação, caindo para cerca de 0,20 ao longo dela. Esses valores são altos e devem ser checados no artigo original.
- Ordem de Legendre usada em avaliações nacionais (resumo do buscador): Canadá e Itália usam ordem 4, e o Reino Unido usa ordem 5. Fonte individualizada não confirmada.
- Títulos listados sem leitura do conteúdo: Legendre versus splines lineares em Gyr (JDS 2012): [link](https://www.sciencedirect.com/science/article/pii/S0022030212007709); variância residual heterogênea no Holandês sueco: [link](https://www.sciencedirect.com/science/article/pii/S0022030213001240).

**Forma matricial de referência do RRM (não verificada no texto-fonte):**
```
y = Xb + Z·Φ·a + Z·Φ·p + e          (Φ = covariáveis de Legendre, uma linha por controle)
Var(a) = K_a ⊗ A                    (efeito genético aditivo; K_a = matriz k×k de coeficientes)
Var(p) = K_p ⊗ I                    (ambiente permanente)
Var(e) = R = diag(R_c)              (variância residual por classe c de dias em lactação)
Legendre: x(t) = 2(t − t_min)/(t_max − t_min) − 1 ; φ0 = 1, φ1 = x, φ2 = (3x² − 1)/2 ...
EBV305 ≈ Σ_{t=5..305} Φ(t)·â(t)    (soma das predições diárias)               [não verificado]
Persistência: combinação dos coeficientes lineares e quadráticos (fórmula conforme artigo de origem) [não verificado]
```

### Inferences
- O RRM aumentou a herdabilidade de 305 dias em relação ao modelo de lactação na população Girolando de Viçosa (0,31 contra 0,24), o que sugere ganho de informação. Precisa de replicação (inferência).
- A escolha da medida de persistência (ex.: PS7) altera a ranking dos touros. Por isso, a definição de persistência deve ser documentada na avaliação (inferência a partir dos estudos de Girolando e Holandês brasileiro).
- Variância residual heterogênea por classe de dias em lactação parece ser uma escolha consistente nos estudos tropicais, mas a estrutura exata varia (inferência).

### Gaps
- Fórmulas de EBV de 305 dias e de persistência a partir dos coeficientes de regressão não obtidas de fonte primária.
- Texto integral de Jamrozik & Schaeffer (1997), Jamrozik, Schaeffer & Dekkers (1997) e Schaeffer & Dekkers (1994) não lido.
- Acurácia (confiabilidade) de RRM e de modelos de 305 dias em Holandês brasileiro só foi visto em resumo.
- Não foi identificado o modelo de avaliação genética oficial brasileiro (controle diário ou 305 dias) para Holandês, Gir, Girolando ou Guzerá.
- Estimativas da UNESP (h² 0,56) e de Costa et al. (2005) precisam de verificação.

---

## 7. Países que usam controle diário x modelos de lactação

### Takeaway
Segundo uma revisão recente, Canadá, Finlândia, Alemanha, Itália, Países Baixos e Suíça avaliam diretamente com dados de controle diário. Os EUA usam produção de 305 dias projetada a partir de um subconjunto de controles diários. Na União Europeia, a maioria usa regressão sobre controle diário. França, Hungria, Itália (para Jersey) e Espanha ainda usam registros de 305 dias em modelo de repetibilidade, segundo uma página da Interbull. O Brasil tem muitos estudos comparando RRM e modelo de lactação, mas o modelo oficial não foi confirmado.

### Cited Findings
- Revisão recente: em Canadá, Finlândia, Alemanha, Itália, Países Baixos e Suíça, as avaliações são feitas diretamente com dados de controle diário (modelo de controle diário). Nos EUA, as avaliações são baseadas em produção de 305 dias projetada a partir de controles diários (modelo de produção de lactação). Os dados diários dos EUA existem desde 1905 e alimentam avaliações nacionais desde 1936. — [PMC10750416, revisão sobre fatores de controle diário](https://pmc.ncbi.nlm.nih.gov/articles/PMC10750416/)
- Página da Interbull sobre avaliação na UE: quase todos os 22 países usam registros de 24 horas por regressão. França, Hungria, Itália (para Jersey) e Espanha usam registros de 305 dias em modelo de repetibilidade. Data da página incerta; o buscador indicou cerca de 205 dias de idade. — [Interbull, avaliação genética de bovinos leiteiros na UE](https://interbull.org/ib/eurc_dairy_prod_prepdb)
- Brasil: estudo com dados da ABCBRH (1990–2011) comparou RRM e modelo de lactação de 305 dias. — [CORE](https://core.ac.uk/display/293560837). Ver também a seção 6.
- Brasil: pesquisa em Pesquisa Agropecuária Brasileira (2016) indica que RRM com Legendre tem maior confiabilidade que o modelo de 305 dias. — [PAB 2016](http://www.scielo.br/scielo.php?script=sci_arttext&pid=S0100-204X2016001101848)

### Inferences
- A tendência internacional, segundo a revisão, é usar controle diário. O modelo de 305 dias dos EUA reflete uma escolha histórica, e a revisão não confirma se houve mudança recente (inferência).

### Gaps
- Situação atual dos EUA, do Canadá e dos países nórdicos (Suécia e Dinamarca não listadas) não verificada individualmente.
- Modelo oficial brasileiro para Holandês, Gir, Girolando e Guzerá não confirmado.
- Lista da Interbull tem data incerta. Usar com cautela.

---

## 8. Contagem de células somáticas (SCC) e escore de células somáticas (SCS)

### Takeaway
O SCS = log2(SCC/100.000) + 3 (SCC em células/mL) aproxima uma distribuição normal da contagem. Com SCC de 100.000 células/mL o SCS vale 3. A herdabilidade do SCS é baixa, entre cerca de 0,03 e 0,18 nos estudos encontrados. As correlações genéticas com produção são pequenas, geralmente dentro de ±0,3, mas o sinal varia entre estudos. O SCS é usado como indicador de mastite, e há modelos de regressão aleatória para mastite clínica com traços indicadores.

### Cited Findings
- Fórmula SCS = log2(SCC/100.000) + 3, citando Wiggans & Shook (1987). — [Understanding and using somatic cell counts to improve milk quality](https://www.researchgate.net/publication/259779742_Understanding_and_using_somatic_cell_counts_to_improve_milk_quality); [Animal Bioscience, SCS em Holandês e Simmental](https://www.animbiosci.org/journal/view.php?doi=10.5713%2Fab.20.0720). Fonte exata da fórmula não confirmada.
- Atenção à unidade: alguns artigos escrevem log2(SCC/100) + 3, com SCC em milhares por mL. Um artigo descreve log10, mas imprime a fórmula em log2. Outro escreve "3 x log2", provavelmente um erro de digitação. A origem do log2 é atribuída a Ali & Shook (1980), e Wiggans & Shook (1987) tratam da correção por estádio de lactação e da média até 120 dias.
- Iran, primíparas (2016), inferência bayesiana com regressão fixa sobre cerca de 1,08 milhão de controles: herdabilidade do SCS 0,03; leite 0,204; gordura 0,096; proteína 0,147. Correlações genéticas com produção entre 0,01 e 0,11, levemente antagônicas, mais fortes para proteína que para gordura. — [Springer, Genetic parameters for daily milk SCS in primiparous Holstein, Iran](https://link.springer.com/article/10.1186/s40781-016-0121-5)
- Iran, três lactações em regressão aleatória (2021, provável correspondência com o estudo do PubMed): herdabilidade do SCS 0,15 a 0,18; leite 0,36 a 0,38; gordura 0,30 a 0,31; proteína 0,31 a 0,32; gordura % 0,21 a 0,25; proteína % 0,21 a 0,22. Correlações genéticas do SCS com produção negativas, de cerca de −0,05 a −0,30. Gordura % quase sem correlação com SCS. Proteína % com correlação positiva de cerca de 0,12 a 0,17. — [PubMed, Genetic Aspects of SCC in Holstein Dairy Cows in Iran](https://pubmed.ncbi.nlm.nih.gov/34205847/)
- Shanghai Holstein: herdabilidade do SCS de 0,04 a 0,14. Características de produção ficaram entre 0,11 e 0,35. Herdabilidades mais baixas no pico da lactação. — [PMC9483179](https://pmc.ncbi.nlm.nih.gov/articles/PMC9483179/)
- Quebec, dados antigos (controle de 1977): herdabilidade média da CCS de cerca de 0,08, maior em vacas mais velhas. Correlações genéticas com leite, gordura e proteína pequenas e positivas (0,14; 0,08; 0,18). Gordura % −0,08 e proteína % 0,04. Estudo antigo, possivelmente o JDS de 1982 listado: [link](https://www.sciencedirect.com/science/article/pii/S0022030282822741). Correspondência não confirmada.
- Herdabilidade da CCS de 0,19 em estimativa de 2007, citada em artigo sobre colesterol do leite, que atribui as diferenças a tamanho de amostra e modelo. — [CJAS 2018, colesterol do leite em Holandês](https://cdnsciencepub.com/doi/full/10.1139/cjas-2018-0010)
- Modelo de regressão aleatória para mastite clínica com traços indicadores (título listado, JDS 2014): [link](https://www.journalofdairyscience.org/article/S0022-0302(14)00285-9/fulltext). Texto não lido.
- Comparação de modelos de regressão aleatória para produção de leite e SCS em Holandês sul-coreano (título listado, JDS 2026): [link](https://www.sciencedirect.com/science/article/pii/S0022030226003541). Texto não lido.

### Inferences
- Como as correlações entre SCS e produção mudam de sinal entre estudos, não se deve assumir um valor para índices de seleção. É preciso estimar localmente (inferência).
- A herdabilidade baixa do SCS (0,03 a 0,18) limita a resposta à seleção direta. Isso é relevante para decisões sobre inclusão do SCS em índices (inferência).

### Gaps
- Parâmetros de SCS para Gir, Girolando e Guzerá não encontrados.
- Mecanismo do SCS como indicador de mastite não verificado em fonte primária.
- Correspondência entre o estudo iraniano de 2021 e o registro do PubMed não confirmada.
- Equação de SCS em modelo de regressão aleatória não obtida. A forma usual é tratar o SCS como traço contínuo com a mesma estrutura de Legendre (não verificado).

---

## 9. Ajuste de variância heterogênea entre rebanhos (HVA)

### Takeaway
O HVA corrige o fato de que a variância fenotípica muda entre rebanhos e grupos de rebanho-ano. Sem correção, touros com filhas em rebanhos de alta variância são superestimados ou subestimados. Wiggans & VanRaden (1991) propuseram um ajuste por pré-correção dos registros. Meuwissen et al. (1996) propuseram estimar valores genéticos e variâncias heterogêneas em conjunto. A avaliação nórdica de controle diário usa um método multiplicativo derivado de Meuwissen (1996).

### Cited Findings
- Wiggans & VanRaden (1991), J. Dairy Sci. 74:4350–4357: os registros de lactação são padronizados pela variância fenotípica de cada grupo rebanho-ano-ordem, e os desvios em relação à média do grupo de manejo são reescalados pela razão entre o desvio-padrão genético base e o derivado de herdabilidade e desvio-padrão fenotípico. As variâncias de cada grupo são combinadas com anos adjacentes e regredidas à variância de região-ano-ordem. — descrição de listagem do ScienceDirect, com mistura de texto de um artigo de 1988; não confirmada. Contexto metodológico: [Springer, Adjustments for heterogeneous herd-year variances in a random regression model (Polônia)](https://link.springer.com/article/10.1007/BF03194611)
- Efeitos reportados (listagem não confirmada): correlações pai-filho ligeiramente maiores com HVA; maior redução para vacas de rebanhos de alta variância; adoção nas avaliações nacionais dos EUA em julho de 1991; a tendência genética do leite Holandês subiu cerca de 5 kg por ano, reduzindo em cerca de 100 kg a predição dos animais mais velhos.
- Meuwissen, de Jong & Engel (1996), J. Dairy Sci. 79:310–316, "Joint estimation of breeding values and heterogeneous variances of large data files": estima valores genéticos e variâncias heterogêneas em conjunto, durante a análise. Descrição de fonte secundária. Atribuição da fonte ao documento listado não confirmada: [Nordic EBV, Interbull test IV, estimação de variância genética](https://www.nordicebv.info/wp-content/uploads/2015/04/Experiences-with-Interbull-test-IV-estimation-of-genetic-variance_paper.pdf)
- A avaliação nórdica de controle diário usa um método multiplicativo baseado em Meuwissen (1996). Canavesi et al. (1998) compararam a pré-correção com o método multiplicativo e obtiveram resultados semelhantes. — citado em fonte secundária.
- Títulos listados sem leitura: transformação de regressões aleatórias para heterogeneidade de covariância devida à produção do rebanho (JDS 2005): [link](https://www.sciencedirect.com/science/article/pii/S0022030205729787); variância heterogênea em Holandês iraniano para controle diário: [link](https://www.sciencedirect.com/science/article/abs/pii/S1871141314002480).

### Inferences
- Em sistemas brasileiros com grande variação de manejo (confinamento, pasto, rebanhos pequenos), o HVA deve ter efeito relevante. Não há estudo brasileiro de HVA no corpus desta rodada (inferência).
- Variância residual heterogênea por classe de dias em lactação (seção 6) e HVA por rebanho são problemas diferentes. Documentos técnicos devem distingui-los.

### Gaps
- Equações do HVA de Wiggans & VanRaden (1991) e de Meuwissen et al. (1996) não obtidas de texto-fonte.
- Efeitos numéricos reportados não confirmados no texto original.
- Prática de HVA em avaliações brasileiras não encontrada.

---

## 10. Parâmetros genéticos típicos (herdabilidades e correlações)

### Takeaway
Para produção de leite em 305 dias, herdabilidades de Holandês ficam em torno de 0,2 a 0,3 em estudos de lactação e de controle diário. Estudos de regressão aleatória com múltiplas lactações chegam a 0,36 a 0,38. Gordura e proteína em produção ficam em torno de 0,1 a 0,3. O SCS tem herdabilidade baixa, de 0,03 a 0,18. Em populações tropicais brasileiras, os estudos encontrados dão cerca de 0,24 a 0,32 para leite em 305 dias (Gir e Gyr), e 0,24 a 0,52 para controle diário de Guzerá. Os valores de Girolando variam de 0,24 a 0,56, e os extremos precisam de verificação.

### Cited Findings
- Holandês do Texas (USDA ARS): herdabilidade da produção de leite em 305 dias de 0,29 (EP 0,01), contra 0,23 (EP 0,01) para produção de leite em controle diário. — [USDA ARS, publicação](https://www.ars.usda.gov/research/publications/publication/?seqNo115=420707)
- Estudo de 1998 com mais de 122.000 registros de lactação de Holandês: herdabilidade de cerca de 0,2 para leite, 0,18 para gordura e 0,18 para proteína (produção, não percentual). — [PubMed 9812275](https://pubmed.ncbi.nlm.nih.gov/9812275/)
- EUA, dados de controle diário com grupos de contemporâneos por piquete: herdabilidades de 0,21 a 0,29 para produção de 305 dias, conforme o modelo. — [PMC12094056, análise de pesagens diárias de leite](https://pmc.ncbi.nlm.nih.gov/articles/PMC12094056/)
- Holandês iraniano e chinês: ver seções 6 e 8. Holandês iraniano de 2021 (três lactações, regressão aleatória): leite 0,36 a 0,38; gordura 0,30 a 0,31; proteína 0,31 a 0,32; gordura % 0,21 a 0,25; proteína % 0,21 a 0,22.
- Holandês com gordura %: em artigo antigo do JDS, herdabilidade da gordura % de lactação caiu de 0,60 para 0,40 da primeira à quinta lactação, enquanto a da produção de 305 dias subiu. Data e fonte exatas não confirmadas.
- Estudo de herdabilidades para leite, gordura e proteína de produção nos EUA (Method R, JDS 1999), somente título: [link](https://www.sciencedirect.com/science/article/pii/S0022030299754706).
- Gir: herdabilidade de 0,26 a 0,28 para PL305 das três primeiras lactações (seção 6).
- Gyr: herdabilidade de 0,24 a 0,29 em modelos de múltiplas lactações (seção 3).
- Girolando (UFV, 973 primíparas): 0,31 pelo RRM e 0,24 pelo modelo de 305 dias (seção 6).
- Girolando (UNESP, dados genômicos): herdabilidade média de 0,56; repetibilidade de 0,84 (seção 6). Valor muito alto, precisa de verificação.
- Guzerá: herdabilidade de 0,24 a 0,52 para controle diário (seção 6).
- Holandês turco de novilhas (374 animais): herdabilidade de 0,32 a 0,54 para características de produção. Fonte exata não confirmada.
- Correlações genéticas entre produção de leite, gordura, proteína e seus percentuais: nenhuma fonte com valores numéricos foi obtida. Nos estudos citados, correlações genéticas entre lactações de produção são altas. Correlações entre produção e percentual não foram obtidas de fonte verificada.

Padrão de referência, não verificado: produções entre si têm correlação genética próxima de 1; produção e percentual de gordura tendem a ser negativamente correlacionadas; gordura % e proteína % tendem a ser positivamente correlacionadas. [não verificado]

### Inferences
- As herdabilidades de 305 dias em populações tropicais são da mesma ordem de grandeza que as de Holandês. A diferença entre populações depende muito da estrutura dos dados, e não se deve interpretar como diferença biológica sem comparação controlada (inferência).
- Herdabilidades de persistência não foram encontradas. Estudos de Shanghai indicam que a herdabilidade do SCS e de produção é menor no pico (inferência a partir de um estudo).

### Gaps
- Herdabilidades atuais de gordura % e proteína % em Holandês (CDCB ou Interbull) não encontradas. A busca sugere consultar a documentação do CDCB.
- Herdabilidades oficiais brasileiras para Holandês, Gir, Girolando e Guzerá em modelos de avaliação não encontradas.
- Correlações genéticas entre produção e percentual não encontradas de fonte verificada.
- Herdabilidades de persistência não encontradas.
- Valores de Girolando (0,56 e repetibilidade 0,84) e de Costa et al. (2005) precisam de conferência.

---

## 11. ECM e FCM

### Takeaway
A FCM a 4% é FCM = 0,4 × leite + 15 × gordura (kg), atribuída a Gaines (1928). A ECM (Sjaunja et al., 1990) usa a energia dos componentes do leite com divisor de cerca de 3,1138 (coeficientes de conhecimento prévio, não verificados). Equações diferentes que visam a mesma composição-alvo diferem por usar energias ou divisores diferentes, segundo uma revisão do JDS de 2023.

### Cited Findings
- FCM 4%: FCM = 0,4 × leite (kg/d) + 15 × gordura (kg/d). Gaines (1928), segundo suplemento de 2022. — [Cambridge, suplemento de 2022](https://static.cambridge.org/content/id/urn:cambridge.org:id:article:S0022029922000851/resource/name/S0022029922000851sup001.pdf)
- Forma percentual equivalente: FCM = 0,4 × leite + 0,15 × leite × gordura %. — [JASBSci, tabela 6](https://jasbsci.biomedcentral.com/articles/10.1186/s40104-022-00721-3/tables/6)
- Derivação pela energia: a equação de energia (kcal/kg) com 291,14 kcal/kg de leite e 10.944 kcal/kg de gordura, dividida por 728,88 kcal/kg, dá cerca de 0,3994 × leite + 15,0148 × gordura, que arredonda para 0,4 e 15. Fonte: revisão de correção do leite (JDS 2023). — [DOAJ, JDS abr. 2023](https://doaj.org/article/e6a8244d8ca4462d9295a64912d82e66). Autoria não confirmada.
- Revisão de 2023: as equações mais acuradas para energia do leite incluem gordura, proteína e lactose, com a energia de cada componente como coeficiente. Os valores de energia da gordura de Sjaunja et al. (1990) vêm de amostras de leite da manhã. — [DOAJ, JDS abr. 2023](https://doaj.org/article/e6a8244d8ca4462d9295a64912d82e66)
- FCM 3,5% (University of Illinois Extension, citado pelo buscador): FCM = 0,4324 × leite (lb) + 16,216 × gordura (lb). Sem URL verificado.
- Ressalva de estudo de leite de camelo: a equação de Gaines não se ajustou bem ao leite de camelo, e o estudo propôs outra equação. Ilustra que a FCM é específica da espécie.
- ECM de Sjaunja et al. (1990), forma de referência: ECM = leite × (0,383 × gordura % + 0,242 × proteína % + 0,7832) / 3,1138. [não verificado, coeficientes de conhecimento prévio]. O buscador não encontrou a fonte original.

### Inferences
- Para comparar produção de rebanhos com diferentes teores de gordura, FCM ou ECM são úteis. Mas o documento técnico deve indicar qual versão foi usada, pois versões diferentes não são equivalentes (inferência).

### Gaps
- Coeficientes exatos de Sjaunja et al. (1990) não confirmados. A busca encontrou apenas listagens de calculadoras de baixa qualidade, que não foram usadas como fonte.
- Autoria exata da revisão de 2023 não confirmada.
- Fonte individualizada da FCM 3,5% de Illinois não confirmada.
- Não há cálculo numérico de exemplo com fonte. Exemplos devem ser construídos no documento final a partir das equações confirmadas.
