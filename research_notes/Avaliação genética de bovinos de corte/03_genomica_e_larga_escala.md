# Métodos de avaliação genômica e computação em larga escala em bovinos de corte

Notas de pesquisa (data de referência: outubro de 2026). Escopo: métodos de avaliação genômica (GBLUP, bayesianos, multi-step, single-step, APY, validação, ssGWAS) e sua implementação em bovinos de corte, com foco em Angus e Nelore.

**Limites desta pesquisa.** Apenas WebSearch esteve disponível; WebFetch e acesso HTTP não foram usados. Foram feitas 18 chamadas (3 de preparação e 15 de busca), acima das ~15 sugeridas pelo guia do pesquisador, em razão da amplitude do escopo. Os textos completos dos artigos não foram lidos. Quase todos os dados vêm de **trechos de resultados de busca** (indicados como "trecho") ou de **citações em artigos posteriores** (indicadas como tal). Quando a fonte é apenas um título, isso está marcado como "título". Equações foram reproduzidas do enunciado da tarefa quando não foi possível extraí-las de fonte primária, e isso está marcado.

**Legenda.** [não verificado] = conhecimento de fundo sem fonte recuperada nesta sessão. "Trecho" = obtido de resumo ou trecho de resultado de busca, não do artigo completo. "Título" = apenas o título foi recuperado.

---

## 1. GBLUP, matriz de parentesco genômico G e SNP-BLUP / regressão ridge

### Takeaway
A fonte original de VanRaden (2008) não foi recuperada, portanto a fórmula de G e a equivalência GBLUP / SNP-BLUP / ridge são registradas como conhecimento de fundo. O único artigo deste tópico efetivamente localizado é Meuwissen, Hayes & Goddard (2001), que mostrou por simulação que modelar a variância por marcador ou por segmento aumenta a acurácia em relação ao BLUP com variância uniforme.

### Equações (notação do enunciado; não extraídas de fonte primária)
- G = ZZ' / [2 Σ p_i(1 − p_i)] — VanRaden (2008), forma segundo o enunciado da tarefa [não verificado no artigo original].
- Modelo SNP-BLUP / ridge: y = 1μ + Zg + e, com g ~ N(0, Iσ²_g) [não verificado].
- Modelo GBLUP com efeitos genéticos genômicos: g ~ N(0, Gσ²_g) [não verificado].

### Cited Findings
- Meuwissen, Hayes & Goddard (2001), Genetics 157(4):1819–1829, "Prediction of total genetic value using genome-wide dense marker maps". DOI não confirmado nesta sessão. [Registro Edinburgh](https://www.research.ed.ac.uk/en/publications/prediction-of-total-genetic-value-using-genome-wide-dense-marker-/) (título e bibliografia).
- Simulação com genoma de 1.000 cM, marcadores a cada 1 cM e Ne = 100. Com Ne pequeno, há desequilíbrio de ligação entre marcadores e QTL, e mínimos quadrados não estimam simultaneamente todos os efeitos de haplótipo — [Registro Edinburgh](https://www.research.ed.ac.uk/en/publications/prediction-of-total-genetic-value-using-genome-wide-dense-marker-/) (trecho de resumo).
- Acurácia do valor genético de descendentes, segundo o mesmo resumo (trecho):
  - 0,32 mantendo apenas os maiores efeitos (estes superestimados);
  - 0,73 com BLUP com variância igual por segmento de 1 cM, premissa que o próprio artigo considera falsa;
  - 0,85 com variância específica por segmento de cromossomo, mesmo com prior mal especificado.
  Fonte: [Registro Edinburgh](https://www.research.ed.ac.uk/en/publications/prediction-of-total-genetic-value-using-genome-wide-dense-marker-/) (trecho).

### Inferences
- A diferença entre 0,73 e 0,85 indica que a modelagem da variância por marcador ou segmento importa para a acurácia. Esse é o argumento que motiva os métodos bayesianos da seção 2. Inferência a partir de trecho.
- A equivalência entre GBLUP e SNP-BLUP com variância igual por marcador depende das premissas do modelo, e não foi verificada numa fonte primária.

### Gaps
- VanRaden (2008) e a dedução da equivalência GBLUP / SNP-BLUP não foram recuperados. A notação exata das fontes não foi extraída.
- O custo computacional de GBLUP (inversão de G, dependência de n_genotipados) não foi pesquisado.
- O DOI de Meuwissen et al. (2001) não foi confirmado.

---

## 2. Métodos bayesianos de efeitos de marcador (BayesA, BayesB, BayesCπ, BayesR, Bayesian LASSO)

### Takeaway
BayesA e BayesB (Meuwissen et al. 2001) diferem na variância por marcador e no componente de efeito nulo. BayesCπ (Habier et al. 2011) estima a proporção π de marcadores com efeito nulo; BayesR (Erbe et al. 2012) usa mistura de normais com um componente de efeito zero. Em trecho, BayesR superou o GBLUP modificado para predição entre raças em Jersey (0,43 para 0,52), com custo computacional alto. O Bayesian LASSO não foi pesquisado.

### Equações (notação padrão de fundo, não extraídas de fonte primária)
- Modelo geral: y = 1μ + Zg + e, com g_j ~ N(0, σ²_j) por marcador [não verificado].
- BayesA: σ²_j com prior escalado-inverso-qui-quadrado, o que gera prior t para os efeitos [não verificado].
- BayesB / BayesCπ: mistura com probabilidade π de efeito nulo; BayesCπ usa variância comum, BayesB usa variância específica [não verificado].
- BayesR: mistura de normais com variâncias pré-definidas, incluindo um componente de variância zero [não verificado].

### Cited Findings
- BayesA usa prior t escalado para efeitos de marcador, e BayesB é uma mistura em que a maioria dos marcadores tem efeito zero. Os dois métodos são atribuídos a Meuwissen et al. (2001). Descrição de fonte secundária, sem URL unívoca. [Registro Edinburgh](https://www.research.ed.ac.uk/en/publications/prediction-of-total-genetic-value-using-genome-wide-dense-marker-/) para a origem (trecho).
- Habier et al. (2011), "Extension of the bayesian alphabet for genomic selection", BMC Bioinformatics 12:186, DOI 10.1186/1471-2105-12-186 — [artigo](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-12-186). Compara BayesCπ e BayesDπ, ambos com π desconhecido, em simulação e em dados de touros Holandeses norte-americanos. Trecho:
  - as estimativas de π do BayesCπ são sensíveis ao número de QTL simulados e ao tamanho do conjunto de treino;
  - as acurácias dos métodos bayesianos alternativos foram semelhantes.
  Autoria não confirmada no trecho.
- Erbe et al. (2012), Journal of Dairy Science 95(7):4114–4129, DOI 10.3168/jds.2011-5019 — [artigo](https://www.journalofdairyscience.org/article/S0022-0302(12)00391-8/pdf). Trecho:
  - GBLUP modificado (GBLUP_mod) e BayesR com referência combinada multi-raça;
  - em Jersey, BayesR elevou a acurácia de 0,43 para 0,52 (média de três características);
  - um subconjunto de 58.532 SNPs de regiões transcritas, extraído de um painel de 624.213 SNPs, superou o painel completo em cerca de 0,03 de acurácia em Jersey.
- Custo computacional do BayesR é alto, e o emBayesR foi relatado como até 8 vezes mais rápido, com acurácia cerca de 0,5% menor. Fonte: [PubMed 25926276](https://pubmed.ncbi.nlm.nih.gov/25926276) (trecho). Autoria desse artigo [não verificada].
- Avaliação do desempenho preditivo e do poder de mapeamento do BayesR, G3 2021, jkab225 — [artigo](https://academic.oup.com/g3journal/article/11/11/jkab225/6317672) (título).
- Gianola et al. (2009), "Additive genetic variability and the Bayesian alphabet", Genetics 183:347–363. Citado por Habier et al. (2011), conteúdo não lido (referência de lista).

### Inferences
- Os trechos situam o ganho do BayesR sobre o GBLUP principalmente em predição entre raças e com treino combinado (Erbe et al. 2012). Não encontrei nesta sessão evidência de superioridade consistente em predição intra-raça com N muito grande em bovinos de corte. Inferência a partir de trechos.
- Métodos de MCMC (BayesCπ, BayesR) tendem a escalar mal com N e com o número de marcadores. Para N da ordem de centenas de milhares ou mais, GBLUP, ssGBLUP e APY são a escolha prática. Inferência de fundo, parcialmente sustentada pelo trecho de custo.

### Gaps
- Bayesian LASSO (Park & Casella 2008) [não verificado] não foi pesquisado.
- Não encontrei nesta sessão as condições (poucos QTL de grande efeito etc.) em que BayesA/B superam o GBLUP em bovinos de corte.
- Não há comparação bayesiana com dados de Nelore nesta sessão.
- Os textos completos de Habier (2011) e Erbe (2012) não foram lidos; figuras de acurácia são de trechos.

---

## 3. Multi-step: DEBVs como pseudo-fenótipos e blending / MBV

### Takeaway
Garrick, Taylor & Fernando (2009) propuseram deregressar EBVs sem informação de pais para usá-los como variável resposta em modelos genômicos. Os resultados posteriores são mistos: em leite (test-day), o método teve o pior desempenho em um estudo; em suínos de raça pura, DEBVs geraram confiabilidades maiores que EBVs. Para carne, o MBV comercial aparece em Thompson et al. (2015, JAS). O artigo de Kachman et al. (2013) identificado trata de treino intra e entre raças, não de blending multi-traço, e MacNeil et al. (2010) não foi localizado.

### Equações
- Deregressão (trecho de resumo): dEBV = EBV_sem_pais / r², em que r² é a confiabilidade do EBV sem pais. A fórmula de peso não foi reproduzida com segurança a partir do trecho. Ele menciona h², r² e c, com c > 0 como fração da variância genética não explicada pelos marcadores.

### Cited Findings
- Garrick, Taylor & Fernando (2009), "Deregressing estimated breeding values and weighting information for genomic regression analyses", Genetics Selection Evolution 41:55, DOI 10.1186/1297-9686-41-55 — [artigo](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-41-55). Trecho: os pesos não devem ser simplesmente a confiabilidade nem a variância do erro de predição, como em estudos anteriores; o pacote R DRP implementa o método (fonte: [repositório DRP](https://github.com/camult/DRP)).
- Conflito: em um estudo de características de test-day em leite, o método de Garrick et al. (2009) teve o pior desempenho entre as comparações e a ponderação não melhorou o método GR — [ResearchGate](https://www.researchgate.net/publication/323417802_Comparing_deregression_methods_for_genomic_prediction_of_test-day_traits_in_dairy_cattle) (trecho). Contradito por:
- Em suínos de raça pura, usar DEBV como variável resposta gerou confiabilidades de GEBV de 18% a 39% maiores que usar EBV — [PubMed 22070746](https://pubmed.ncbi.nlm.nih.gov/22070746/) (trecho; a atribuição do intervalo ao artigo específico não foi confirmada).
- Acurácia de GEBV multi-raça em corte derivada de DEBVs e fenótipos — [PubMed 22767091](https://pubmed.ncbi.nlm.nih.gov/22767091/) (título; resultados não extraídos).
- Kachman et al. (2013), "Comparison of molecular breeding values based on within- and across-breed training in beef cattle", citado como Genetics Selection Evolution em lista de referência de trecho. A referência do enunciado indicava JAS, não confirmado. Trata de treino intra e entre raças, não de blending multi-traço. URL não recuperada.
- Thompson et al. (2015), "Yield and quality grade outcomes as affected by molecular breeding values for commercial beef cattle", JAS, DOI 10.2527/jas.2014-8511 — [artigo](https://doi.org/10.2527/jas.2014-8511). Evidência de uso de MBV em carne comercial. Resultados não extraídos. O mesmo trecho cita Weber et al. (2012b), Bolormaa et al. (2013) e Kachman et al. (2013) como trabalhos sobre acurácia de MBV.

### Inferences
- A dependência de DEBV em r² faz com que estimativas de confiabilidade mal calibradas afetem o peso e o viés. Esse viés é conhecido na literatura de multi-step [não verificado, sem fonte primária nesta sessão].
- Para N grande, o padrão atual em bovinos de corte é substituir DEBV pelo ssGBLUP (seção 4), que não usa pseudo-fenótipos. Inferência, apoiada por trecho de resumo sobre pesquisa Nelore (sem URL unívoca).

### Gaps
- MacNeil et al. (2010) e blending de MBV como característica correlacionada não foram localizados.
- Viés de DEBV e de blending não foi pesquisado com fonte primária.
- Kachman et al. (2013): URL, DOI e periódico exatos não confirmados.

---

## 4. Single-step GBLUP: matriz H, H⁻¹, blending (τ, ω, α), metafounders, ssSNP-BLUP e ssBR

### Takeaway
ssGBLUP (Legarra, Aguilar & Misztal 2009, segundo o enunciado; Aguilar et al. 2010) combina A e G numa matriz H, cuja inversa tem forma esparsa, permitindo avaliar todos os animais, genotipados ou não, numa única etapa. Metafounders (Legarra et al. 2015) corrigem a incompatibilidade entre G e A22. Os detalhes de τ, ω, α, ssSNP-BLUP e ssBR não foram recuperados nesta sessão.

### Equações
- H⁻¹ = A⁻¹ + [0 0; 0 G⁻¹ − A22⁻¹] — forma do enunciado [não verificada na fonte original].
- Blending de G, forma de fundo [não verificado]: G_ω = (1 − ω)G + ωA22, com escalonamento τ e deslocamento α.

### Cited Findings
- Aguilar et al. (2010), "Hot topic: A unified approach to utilize phenotypic, full pedigree, and genomic information for genetic evaluation of Holstein final score", Journal of Dairy Science 93:743–752. DOI 10.3168/jds.2009-2730, indicado em resultado de busca e não conferido no artigo. Trecho de revisão posterior: H substitui A nas equações de modelo misto; H é caro de computar diretamente, mas H⁻¹ tem estrutura simples. Ver [revisão JDS 2022](https://www.journalofdairyscience.org/article/S0022-0302(22)00752-4/fulltext). A redação do trecho sobre o bloco de genotipados é ambígua, e a forma de referência é a do enunciado.
- Aplicação relatada (trecho sem URL unívoca): avaliação de final score para mais de 6 milhões de Holandesas, com acurácia superior à de procedimento em múltiplas etapas.
- Legarra, Christensen, Vitezica, Aguilar & Misztal (2015), "Ancestral relationships using metafounders: finite ancestral populations and across population relationships", Genetics 200:455–468, DOI 10.1534/genetics.115.177014 (DOI conforme lista de artigo posterior). Trecho: metafounders são pseudo-indivíduos que relacionam fundadores de genealogia e populações diferentes; o modelo generaliza Christensen (2012) e o UPG em ssGBLUP — [DOI](https://doi.org/10.1534/genetics.115.177014).
- Incompatibilidade entre as médias e diagonais de A22 e G: Vitezica et al. (2011), citado em trecho, sem URL.
- Requisito citado em trecho: a G é construída com frequências alélicas de 0,5 quando se usam metafounders. Fonte: [nota técnica crossbred com metafounders](https://www.researchgate.net/publication/315716357_Technical_note_Genomic_evaluation_for_crossbred_performance_in_a_single-step_approach_with_metafounders1). Afirmação de resumo, a verificar.
- Extensão com 148 metafounders: uso de Γ148 aumentou a correlação entre elementos de A e G (trecho). Provável origem: [Single-step genomic BLUP with many metafounders (PMC9721289)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9721289).
- Revisão: [Unknown-parent groups and metafounders in single-step genomic BLUP (JDS 2021)](https://www.sciencedirect.com/science/article/pii/S0022030221010110) (título).
- Visão geral: "Single-Step Genomic Evaluations from Theory to Practice: Using SNP Chips and Sequence Data in BLUPF90", Genes 11(7):790 — [MDPI](https://www.mdpi.com/2073-4425/11/7/790) (título; autores não verificados).
- Teoria de GBLUP e ssGBLUP, documentação de BLUPF90, Legarra — [PDF](https://nce.ads.uga.edu/wiki/lib/exe/fetch.php?media=theory_of_gblup_and_single-step_gblup.pdf) (título e link de documentação; conteúdo não lido).

### Inferences
- ssGBLUP evita a etapa de pseudo-fenótipos e produz GEBVs para animais não genotipados. A dificuldade está na compatibilidade entre G e A22 (tratada por blending e metafounders) e na inversão de G (tratada por APY, seção 5). Inferência.
- Metafounders são relevantes para populações multi-raça e para genealogias rasas, como em parte das populações de Nelore. Inferência, sem trecho específico sobre Nelore nesta sessão.

### Gaps
- Equações exatas de τ, ω e α não foram extraídas.
- ssSNP-BLUP (Fernando et al.; Liu et al. 2014) e ssBR não foram pesquisados.
- Legarra, Aguilar & Misztal (2009) e Christensen & Lund (2010) não foram recuperados.

---

## 5. Algorithm for Proven and Young (APY)

### Takeaway
APY (Misztal, Legarra & Aguilar 2014; Misztal 2016) aproxima G⁻¹ com um núcleo (core) de animais genotipados. Segundo trechos, o tamanho do núcleo que maximiza a acurácia é o número de autovalores de G que explicam cerca de 98% da variância. Acima desse ponto, núcleos maiores aumentam o custo sem ganho de acurácia. Em Angus, o ssGBLUP foi executado com mais de 6 milhões de registros (Lourenco et al. 2015).

### Equações
- Forma exata da inversa APY (Misztal et al. 2014) não extraída. Descrição conceitual de trecho: a recursão sobre os animais do núcleo e os não núcleo produz uma aproximação esparsa de G⁻¹.

### Cited Findings
- Descrição do método: os genotipados são separados em núcleo (core) e não núcleo (noncore), e uma recursão constrói uma aproximação esparsa de G⁻¹, segundo Misztal et al. — trecho. Fonte: [Core-dependent changes in genomic predictions using APY in ssGBLUP (JAS 2020, skaa374)](https://academic.oup.com/jas/article/98/12/skaa374/5992278) (título; conteúdo não lido).
- Regra do tamanho do núcleo: número de autovalores que explicam 98% da variância de G. Valores de trecho para conjuntos de animal único: ~15 mil (leite), ~13 mil (corte) e ~6,9 mil (suínos) — [PMC5088690](https://pmc.ncbi.nlm.nih.gov/articles/PMC5088690/) (trecho; autoria Pocrnic et al. 2016 não verificada no trecho).
- Sensibilidade a limiares de variância, num estudo com 357 mil suínos Duroc (atribuição a este artigo com incerteza):
  - 50%: 160 animais;
  - 80%: 700;
  - 90%: 1.363;
  - 95%: 2.344;
  - 99%: 7.320;
  - >99%: 10.000.
  Fonte: [PMC9123737](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9123737/) (trecho), mesmo título em [Genetics Selection Evolution 2022](https://link.springer.com/article/10.1186/s12711-022-00726-6).
- Com núcleo pequeno, a composição do núcleo afeta a acurácia; perto de 99% a escolha da composição é quase arbitrária — trecho da mesma fonte.
- Núcleos maiores que o número de autovalores para 98% reduzem a mudança dos GEBVs quando o núcleo muda, mas exigem mais recursos sem ganho de acurácia — trecho; fonte provável [PMC7739885](https://pmc.ncbi.nlm.nih.gov/articles/PMC7739885).
- Simulação com Ne = 40 e genoma de 15 Morgans: ~2.400 autovalores para 98% (4NeL), ~1.200 para 95% (2NeL) e ~600 para 90% (NeL). Fonte não identificada com precisão (provavelmente PMC5088690 ou PMC7739885).
- Lourenco et al. (2015), Journal of Animal Science 93(6):2653–2662, DOI 10.2527/jas.2014-8836 (citado em listas de referência de artigos posteriores). ssGBLUP em Angus americano com mais de 6 milhões de registros. Predição indireta a partir de efeitos de SNP permite avaliar genotipados jovens sem rodar a avaliação completa, que leva horas para convergir — [PubMed 26115253](https://pubmed.ncbi.nlm.nih.gov/26115253) (trecho). A predictividade dos ganhos depende da composição da população de referência (trecho).
- Lourenco et al. (2020), "Current status of genomic evaluation", Journal of Animal Science 98(4):skaa101 — [artigo](https://academic.oup.com/jas/article/98/4/skaa101/5817903) (título; conteúdo não lido; revisão de estado da arte).
- "Optimizing the performance of large genomic evaluations through data truncation in Angus cattle", Journal of Animal Science, DOI 10.1093/jas/skaf382 — [artigo](https://doi.org/10.1093/jas/skaf382) (título; autoria e ano não confirmados, ano provável 2025 [não verificado]).

### Inferences
- Com N de dezenas de milhares a milhões de genotipados, o custo do APY depende do núcleo e não do número total de genotipados. Inferência a partir da regra de 98% e do exemplo de Angus.
- Para populações pequenas (algumas milhares de genotipados), a inversa completa de G pode ser viável, e APY não seria necessário. Inferência de fundo [não verificado].
- Pela fórmula de trecho, o número de autovalores cresce com Ne e com o comprimento do genoma. Populações com Ne menor exigem núcleos menores. Inferência a partir do exemplo de simulação.

### Gaps
- Misztal (2016) e Misztal, Legarra & Aguilar (2014) não foram recuperados. A recursão exata não foi extraída.
- Tamanhos de núcleo usados em produção em Angus, AGI e Nelore não foram confirmados.
- Custos de memória e de tempo do APY não foram quantificados com fonte.
- A atribuição de algumas cifras (357 mil Duroc; 4NeL) é incerta.

---

## 6. Validação de predições genômicas: LR, forward validation e tamanho da população de referência

### Takeaway
O método LR (Legarra & Reverter 2018) estima viés, dispersão e acurácia populacional a partir da comparação entre predições com conjuntos parcial e completo. Ele supõe modelo correto. Em trecho sobre Holandesas tailandesas, o viés e a dispersão foram 0,44 e 0,84 para BLUP, contra −0,04 e 1,06 para ssGBLUP. Forward validation não foi pesquisada, e as fórmulas de tamanho de referência (Daetwyler et al. 2008; Goddard 2009) foram só parcialmente recuperadas.

### Equações
- Definições (trecho): viés = diferença de médias entre predições e valores de referência; dispersão = inclinação (slope) da regressão de u sobre û.
- Forma exata das estatísticas LR não extraída do artigo.

### Cited Findings
- Legarra & Reverter (2018), "Semi-parametric estimates of population accuracy and bias of predictions of breeding values and future phenotypes using the LR method", Genetics Selection Evolution 50:53, DOI 10.1186/s12711-018-0426-6 — [PDF](https://link.springer.com/content/pdf/10.1186/s12711-018-0426-6.pdf). Trecho:
  - para conjuntos de validação suficientemente grandes, as estatísticas estimam viés, dispersão e acurácia populacional de EBVs;
  - a correlação entre predições com dados completos e parciais estima a razão entre acurácias, não a acurácia em si.
- Premissa de modelo correto. Simulação posterior (trecho) mostrou subestimação de viés e de dispersão em cenários com tendência ambiental: [JDS 2019](https://www.journalofdairyscience.org/article/S0022-0302(19)30957-9/fulltext).
- Aplicação em Holandesas tailandesas (THI 76): BLUP com viés 0,44 e dispersão 0,84; ssGBLUP com viés −0,04 e dispersão 1,06 — [PMC8829417](https://pmc.ncbi.nlm.nih.gov/articles/PMC8829417/) (trecho).
- Extensão, Belay et al. (2022): o método também vale quando o conjunto completo acrescenta genótipos, não fenótipos (trecho sem URL unívoca).
- Limitação: revisão de 2024 afirma que o LR não se aplica a modelos complexos (regressão aleatória, características limitadas ao sexo, efeitos maternos, efeitos aditivo e não aditivo) — [Frontiers in Genetics 2024](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2024.1380643/full) (trecho).
- Daetwyler et al. (2008), "Accuracy of predicting the genetic risk of disease using a genome-wide approach", PLoS ONE, DOI 10.1371/journal.pone.0003395 — [registro](https://www.research.ed.ac.uk/en/publications/accuracy-of-predicting-the-genetic-risk-of-disease-using-a-genome/). Trecho: a acurácia depende de N, de h² e de M, sob a premissa de M loci independentes com efeitos iguais, e as predições representam um limite superior de acurácia. A fórmula aproximada, na forma r = √(h²N / (h²N + M)), foi lida de fragmento ilegível e deve ser conferida [não verificado].
- Número de segmentos Me = 2NeL, com L em Morgans (trecho sem URL unívoca; possível: [PMC5739427](https://pmc.ncbi.nlm.nih.gov/articles/PMC5739427/), a verificar).
- Goddard (2009): extensão para GBLUP com número efetivo de loci (trecho). Fórmula exata e veículo de publicação não recuperados.
- Validação no Brasil: ANCP (2018), "Calibração e validação de DEPs genômicas (Clarified Nelore v3.1)" — [slides](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil) (título; conteúdo não lido).

### Inferences
- LR é o método mais citado para viés e dispersão de predições genômicas em bovinos. Exige conjuntos de validação grandes e modelo correto. Em populações pequenas ou raças especializadas, as estimativas tendem a ser instáveis. Inferência de fundo, não verificada.
- Forward validation (validar com dados posteriores à avaliação) é o complemento natural do LR para validação real. Não foi pesquisada.

### Gaps
- Forward validation: não pesquisada.
- Fórmula exata de Goddard (2009) e de Daetwyler et al. (2010): não recuperadas.
- Tamanhos de população de referência publicados para Nelore: não encontrados.

---

## 7. Acurácia e PEV aproximados em larga escala

### Takeaway
Métodos de amostragem para acurácia (Misztal & Wiggans; Bijma 2012) não foram recuperados nesta sessão. Foram encontradas duas fontes de contexto: uma revisão sobre cálculo de confiabilidade na era single-step (JDS 2022) e um artigo de 2026 sobre preditividade em Angus. Lourenco et al. (2015) usam predição indireta de efeitos de SNP para contornar a avaliação completa, o que é relevante para acurácia de genotipados novos.

### Cited Findings
- "Invited review: Reliability computation from the animal model era to the single-step genomic model era", JDS 2022 — [revisão](https://www.journalofdairyscience.org/article/S0022-0302(22)00752-4/fulltext) (título; conteúdo não lido).
- "Predicting the accuracy of genomic predictions" — [PMC8244147](https://pmc.ncbi.nlm.nih.gov/articles/PMC8244147/) (título; conteúdo não lido).
- "Using predictivity to estimate heritabilities and genetic correlations over time for growth traits in a large genotyped Angus cattle population", JAS, DOI 10.1093/jas/skag078 — [artigo](https://doi.org/10.1093/jas/skag078) (título; ano provável 2026 [não verificado]).
- Predição indireta de genotipados novos a partir de efeitos de SNP: Lourenco et al. (2015), trecho descrito na seção 5.

### Inferences
- Na prática de Angus, duas estratégias contornam a inversão completa: APY (seção 5) e predição indireta a partir dos efeitos de SNP. Inferência a partir de trechos.
- Acurácias de EPDs em avaliações grandes costumam ser aproximadas, sem inversão completa do sistema de equações de modelo misto. Conhecimento de fundo [não verificado].

### Gaps
- Métodos de amostragem (Misztal & Wiggans; Bijma 2012): não pesquisados com fonte.
- PEV aproximado em ssGBLUP e APY: não encontrado.
- Software e opções de cálculo de acurácia em BLUPF90 e BOLT: não verificados.

---

## 8. Implementação em larga escala em bovinos de corte

### Takeaway
A Angus Genetics Inc. (AGI) executa ssGBLUP semanalmente desde julho de 2017, para todos os EPDs e índices. Segundo material de 2025, a base chegou a cerca de 1,8 milhão de animais testados. No Brasil, a ANCP publica DEPs genômicas desde 2011, em parceria com a Zoetis, e a Embrapa Geneplus publica um sumário Nelore com dados de 336 rebanhos e cerca de 2,3 milhões de animais. A implementação de ssGBLUP no programa Nelore estava em fase preliminar em 2018, segundo o título de um seminário da ANCP. IGS, AHA, Red Angus, BREEDPLAN e Interbeef não foram pesquisados.

### Cited Findings
- Angus: a Angus Association e a AGI anunciaram que a Angus será a primeira grande raça de corte a calcular, semanalmente, todos os EPDs e $Values com single-step, a partir de 7 de julho (ano inferido 2017 pela URL) — [release](https://www.angus.org/pub/newsroom/releases/062717-single-step.html).
- Calendário: um genótipo que chega à AGI até uma sexta-feira aparece nos EPDs na sexta seguinte — [AGI](https://www.angus.org/AGI/GenomicEnhancedEPDs.pdf) (trecho; atribuição a verificar).
- GeneMax Advantage (2025): predições a partir dos efeitos de marcador da avaliação nacional single-step (NCE) da AGI, com até 1,8 milhão de animais testados no verão de 2025 — [documento](https://cd.angus.org/-/media/acf83a7d2ec2470fa91fb62142c948ae.ashx) (trecho).
- Angus GS: núcleo de 40.000 SNPs genotipados diretamente, usado na avaliação single-step; preço de US$ 37, que pode estar desatualizado — [FAQ](https://www.angus.org/pub/adv/AngusGS-FAQ.pdf) (trecho).
- Austrália, Angus, single-step T-BLUP multi-traço: [More animals than markers ...](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6796474/) (título). A ligação com o BREEDPLAN é [não verificada].
- Angus, análises entre países (foot score, EUA e Austrália): [PMC10621155](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10621155/) (título).
- ANCP: DEPs genômicas desde 2011, em parceria com a Zoetis; 33 características mais o índice MGTe (trecho). Fonte: [ANCP 2021](https://www.ancp.org.br/novas-parcerias-e-avanco-no-melhoramento-genetico-marcaram-trajetoria-da-ancp-em-2021/).
- Calendário de avaliações da ANCP (6 vezes por ano) e da Geneplus (4 vezes por ano): fonte comercial, não confirmada [não verificado] — [Ponta Agro](https://pontaagro.com/programas-de-melhoramento-genetico/).
- Embrapa Geneplus: aplicativo Sumário Nelore com dados de 336 rebanhos e cerca de 2,3 milhões de animais (trecho) — [Embrapa](https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/4275/app-sumario-nelore---aplicativo-movel-do-sumario-de-touros-nelore-do-programa-embrapa-geneplus-).
- ANCP, seminário 2018: título "Calibração e validação de DEPs genômicas (Clarified Nelore v3.1) e resultados preliminares da implementação do método de passo único BLUP genômico no programa Nelore Brasil" — [slides](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil). Título indica ssGBLUP em fase preliminar em 2018. Estado atual não encontrado.
- Segundo trecho de pesquisa sobre Nelore, o ssGBLUP tem menos viés para características de baixa herdabilidade (como área de olho de lombo) e menos custo computacional, por não usar pseudo-fenótipos. Fonte primária não identificada.
- Pesquisa brasileira sobre composição de carcaça e GWAS em Nelore: [BVS](https://pesquisa.bvsalud.org/portal/resource/pt/vtt-218303) (título; autores e ano não verificados).
- Documentação de software: BLUPF90 (Misztal et al.), ver seção 4. BOLT, MiX99 e notas técnicas da BREEDPLAN não foram recuperados.

### Inferences
- Para N muito grande (AGI com milhões de animais; ANCP e Geneplus com milhões), o ssGBLUP com APY é a configuração que aparece em operação. Inferência a partir das fontes de Angus e do Brasil.
- Para populações pequenas (raças menores ou núcleos de dezenas de milhares), GBLUP ou ssGBLUP sem APY podem ser viáveis, e métodos bayesianos também. A escolha depende de custo e de arquitetura genética. Inferência de fundo.
- Para populações de Nelore com genealogia rasa e muitos rebanhos, metafounders (seção 4) são uma opção a considerar. Inferência, sem trecho específico sobre Nelore.

### Gaps
- IGS/BOLT, American Hereford Association, Red Angus, BREEDPLAN (ABRI/AGBU) e Interbeef/ICAR não foram pesquisados.
- Painéis e empresas brasileiras (Zoetis, Neogen/Igenity, CRV/Paint, Geneplus) não tiveram números de genotipados coletados.
- Os autores brasileiros citados no enunciado (Mokry, Regitano, Carvalheiro, Fernandes Júnior, Silva et al.) não foram confirmados por busca nesta sessão, exceto o trabalho do BVS, cuja autoria não foi extraída.
- Não encontrei comunicados oficiais da ANCP ou da Embrapa de 2026. O calendário de atualização tem fonte comercial.

---

## 9. Acurácias de predição genômica: Nelore e taurinos de corte

### Takeaway
Os números de acurácia disponíveis para Nelore vêm de estudos de 2016 a 2024, com centenas a poucos milhares de animais. Eles reportam acurácias moderadas a altas para carcaça, ssGBLUP acima de BLUP em marbling (0,09 para 0,63 em 2023) e em stayability, e acurácias de 0,345 a 0,665 para lucro (PFT). Para Angus, o ganho de preditividade depende da composição da população de referência, mas não encontrei valores numéricos gerais.

### Cited Findings
- Silva Neto et al. (2023), "Weighted genomic prediction for growth and carcass-related traits in Nelore cattle", Animal Genetics — [artigo](https://onlinelibrary.wiley.com/doi/abs/10.1111/age.13310). Trecho:
  - ssGBLUP elevou a acurácia de marbling de 0,09 (BLUP) para 0,63;
  - backfat e rump fat tiveram as maiores acurácias em todos os modelos;
  - a ponderação dos SNPs por ssGWAS trouxe ganhos limitados para área de olho de lombo.
- Genomic prediction of breeding values for carcass traits in Nellore cattle, Genetics Selection Evolution 2016 — [artigo](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-016-0188-y). Trecho: 1.756 novilhos de dez rebanhos comerciais brasileiros; acurácia moderada a alta; a acurácia acompanha a herdabilidade; fenótipos ajustados superam EBVs em características de alta h². Autores não verificados.
- Ganho médio diário em confinamento: 718 novilhos, vários modelos bayesianos e painéis — [PMC5473763](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5473763/). Resultados numéricos não extraídos.
- Stayability (STAY42, STAY53, STAY64): ssGBLUP teve a maior acurácia para todas as características, comparado com métodos baseados em genealogia — [Ramos 2020, Reproduction in Domestic Animals](https://onlinelibrary.wiley.com/doi/abs/10.1111/rda.13612) (trecho).
- Precocidade reprodutiva (early heifer pregnancy): correlações genéticas com crescimento, circunferência escrotal e carcaça foram frequentemente baixas — [ScienceDirect 2024](https://www.sciencedirect.com/science/article/abs/pii/S1871141324001884) (trecho).
- Características de lucro (PFT e APF): acurácias médias de 0,345 a 0,665 (PFT) e de 0,425 a 0,603 (APF). O modelo multi-traço single-step teve a melhor acurácia para PFT (0,665). ssGBLUP single-trait e a ponderação não linear não melhoraram a acurácia — [PMC12887148](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887148/) (trecho; ano não verificado).
- Angus, ganho de preditividade: Trujano et al. relatam preditividade 13% (BW), 34% (WW) e 31% (PWG) maior que a primeira implementação de ssGBLUP em Angus americano, reportada por Lourenco et al. (2015). Trecho sem URL, a verificar.
- Angus e multi-raça, DEBV e fenótipos: [PubMed 22767091](https://pubmed.ncbi.nlm.nih.gov/22767091/) (título).

### Inferences
- Não há um número único confiável de acurácia para Nelore. Os trechos sugerem faixas moderadas a altas, dependentes da herdabilidade da característica e do tamanho da população de treino. Inferência.
- ssGBLUP superou BLUP em vários estudos de Nelore (Silva Neto 2023; Ramos 2020). Inferência a partir de trechos, não de tabelas completas.

### Gaps
- Números de acurácia para ganho em peso, peso ao sobreano e precocidade não foram extraídos.
- Estudos de Nelore com N grande (ANCP e Geneplus) não foram encontrados com acurácias numéricas.
- Acurácias de referência para taurinos (Angus, Hereford, Simmental) não foram coletadas em números.
- Datas de vários estudos não foram verificadas.

---

## 10. ssGWAS (Wang et al. 2012) como subproduto do ssGBLUP

### Takeaway
ssGWAS usa a matriz H para ligar animais com fenótipo e genótipo a animais com fenótipo e sem genótipo. Em aplicações, o mapeamento é feito por janelas de 20 SNPs, com limiar de 1% da variância genética explicada. Extensões recentes (GSE 2019, GSE 2024) dão p-valores frequentistas numa única rodada e p-valores a partir dos efeitos retrocalculados do ssGBLUP.

### Equações
- Forma exata do modelo de Wang et al. (2012) não extraída. Conexão conceitual de trecho: fenótipos e genótipos são conectados pela matriz H.

### Cited Findings
- Wang, Misztal, Aguilar, Legarra & Muir (2012), "Genome-wide association mapping including phenotypes from relatives without genotypes", Genetics Research 94:73–83, DOI 10.1017/S0016672312000274 (conforme lista de referência de artigo posterior; resumo não recuperado).
- Fenótipos e genótipos são conectados pela matriz H (trecho de aplicação posterior).
- Aplicações costumam testar janelas de 20 SNPs adjacentes e sinalizar janelas que explicam mais de 1% da variância genética (trecho de aplicação posterior).
- Frequentist p-values for large-scale single-step GWAS, with an application to birth weight in American Angus, Genetics Selection Evolution 2019, DOI 10.1186/s12711-019-0469-3 — [artigo](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-019-0469-3). Trecho: todos os p-valores são obtidos numa única rodada de ssGWAS.
- Marker effect p-values for single-step GWAS with APY in large genotyped populations, Genetics Selection Evolution 2024 — [artigo](https://link.springer.com/article/10.1186/s12711-024-00925-3). Trecho: efeitos de SNP são retrocalculados a partir dos GEBVs do ssGBLUP.
- Weighted single-step GWAS para características de carcaça em Hanwoo — [artigo](https://doi.org/10.3390/ani16010136) (título).

### Inferences
- Quando a avaliação ssGBLUP já existe, o ssGWAS tem custo marginal pequeno. Inferência de fundo; o custo não foi quantificado com fonte.
- Os limiares de 1% e as janelas de 20 SNPs são convenções de aplicação, não critérios formais. Inferência a partir dos trechos.

### Gaps
- Equações e resultados de Wang et al. (2012) não foram extraídos; o artigo original não foi recuperado.
- Comparação de ssGWAS com GWAS tradicional em bovinos de corte: não pesquisada.
