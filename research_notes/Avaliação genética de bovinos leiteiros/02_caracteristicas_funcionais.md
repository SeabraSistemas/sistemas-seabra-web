# Características funcionais em bovinos leiteiros: modelos de avaliação genética

**Escopo:** fertilidade feminina, partos, longevidade, saúde, conformação/tipo, workability, tolerância ao calor, eficiência alimentar e metano, e correlações com produção. Modelos de produção (controle de lactação, curvas) e genômica em profundidade ficam fora do escopo.

## Nota de método e convenções

- Pesquisa feita somente com WebSearch (WebFetch e HTTP indisponíveis). Foram cerca de 24 buscas. Quase todo o conteúdo vem de trechos de resultados e resumos, não de texto integral. Por isso, cada item traz um marcador de tipo de fonte:
  - **(P)**: fonte primária (artigo, relatório oficial, documento de associação), conteúdo lido só no trecho.
  - **(S)**: fonte secundária (imprensa especializada, site comercial de touros, patente, resumo de terceiros).
  - **(A)**: atribuição inferida. O fato aparece num resultado de busca, mas a ligação com a URL indicada é provável e não confirmada.
  - **[não verificado]**: conhecimento de fundo sem fonte localizada. Equações marcadas assim não foram confirmadas nos artigos originais e devem ser conferidas antes de publicação.
- DOIs aparecem só quando estão na URL ou quando são derivados do PII do periódico (padrão do Journal of Dairy Science: 10.3168/jds.<PII>). A derivação está indicada. Nenhum DOI foi inventado. Quando não há DOI nem URL, a referência está como "sem URL localizada".
- Títulos de artigos, siglas de traços e nomes de índices foram mantidos no original.

**Discrepâncias encontradas (verificar antes de escrever):**
1. Implementação do modelo sire-maternal grandsire (SMGS) para facilidade de parto: a pergunta fala em adoção pelo USDA em 2003. O resumo do PubMed indica implementação em 2002 e publicação do método em 2003.
2. Início da DPR: uma fonte do ARS indica uso de dias abertos preditos a partir de novembro de 2003; um resumo do PubMed indica novembro de 2004.
3. Herdabilidade da DPR: 0,02 a 0,04 em meta-análise citada em resumo (fonte antiga) contra 1,4% para 2,9% no run de agosto de 2026 (imprensa).
4. Herdabilidade do consumo residual (RFI): 0,43 (Frontiers 2024, genômica nos EUA), 0,12 a 0,23 (regressão aleatória, JDS 2023), 0,05 a 0,38 (estudo de 1994, depende da definição de exigência). Não são comparáveis sem explicitar o modelo.
5. Limiar de THI: 72 (Ravagnolo e Misztal, 2000, Holandês nos EUA), 69 (McWhorter et al., 2023, EUA), 67 (Holandês no Brasil), 70 a 75,85 (Gir no Brasil, conforme fonte climática).
6. Confiabilidade do Heat Tolerance ABV (Austrália): 48% para Holandês no Technote 18, com comentário de imprensa dizendo que uma atualização de 2024 elevou 10 pontos.
7. Correlação genética entre intervalo parto-primeiro serviço e leite: 0,43 (Sun et al., 2010, citado em fonte secundária) contra 0,14 (estudo de ureia do leite, medida diferente).

---

## 1. Fertilidade feminina (DPR, CCR, HCR, CFI, dias abertos, intervalo entre partos, não retorno)

### Takeaway
A fertilidade é medida a partir de eventos reprodutivos registrados (serviços, diagnósticos de gestação, dias abertos), transformados em características binárias, contagens ou escalas lineares. Nos EUA, a DPR nasceu em 2003 como conversão linear de dias abertos em taxa de prenhez. Hoje a avaliação cobre DPR, CCR (taxa de concepção de vacas), HCR (taxa de concepção de novilhas) e intervalo ao primeiro serviço. As herdabilidades são muito baixas (cerca de 0,02 a 0,05 na maioria das fontes), o que limita a acurácia dos PTA mesmo com muitas filhas. Modelos lineares dominam a avaliação oficial, e modelos threshold aparecem sobretudo em pesquisa.

### Cited Findings

**Definição a partir de registros de campo e conversão para DPR**
- A DPR foi lançada pelo USDA no início de 2003, convertendo dias abertos em taxa de prenhez por função linear. O relatório AIPL define a taxa de prenhez como 21 / (dias abertos − período de espera voluntário + 11), com período de espera de 60 dias; o +11 centra a estimativa no dia médio do ciclo de 21 dias. — [AIPL, DPR evaluation report](https://aipl.arsusda.gov/reference/fertility/DPR_rpt.htm) (P, trecho)
- Regra prática do mesmo relatório: 1% de PTA de DPR equivale a 4 dias de PTA de dias abertos. — mesma fonte (P, trecho)
- Conversão linear citada numa patente que referencia VanRaden et al. (2004), "Development of a national genetic evaluation for cow fertility", J. Dairy Sci. 87:2285–2292: DPR = 0,25 × (233 − dias abertos). — [Patente US 7666599, "Calpastatin markers for fertility and longevity"](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7666599) (S). A constante 233 e a inclinação 0,25 não foram verificadas no artigo original.
- Companion paper: Kuhn, VanRaden e Hutchison (2004), J. Dairy Sci. 87:2277–2284, indicam que dias abertos podem ser preditos com precisão aos 130 dias em lactação para avaliação de traço único. Citação feita em fonte secundária, sem URL localizada.
- Início da implementação: uma publicação do ARS fala em dias abertos preditos a partir de novembro de 2003 ([ARS, DPR](https://www.ars.usda.gov/research/publications/publication/?seqNo115=142354)) (P/A). Um resumo do PubMed sobre predição de dias abertos com diagnóstico de gestação é [PubMed 15829681](https://pubmed.ncbi.nlm.nih.gov/15829681) (A; não confirmei que o resumo trata dessa data).
- Mudança de definição: um resumo afirma que, em dezembro de 2014, a DPR passou a usar status de gestação observado em janelas de 21 dias, em vez de dias abertos convertidos. Fonte primária não localizada (ver Gaps).

**Componentes e índice atuais (EUA)**
- Avaliações rotineiras de fertilidade feminina em Holandês nos EUA: HCR, CCR, DPR e intervalo ao primeiro serviço (CFI). — [CDCB, Reproductive Performance Traits Summary (2026)](https://uscdcb.com/wp-content/uploads/2026/05/Reproductive-Performance-Traits-Summary-Final-1.pdf) (A; trecho não lido diretamente)
- Índice de fertilidade (Holstein USA, revisão de agosto de 2024): FI = 0,4·DPR + 0,4·CCR + 0,1·HCR + 0,1·Early First Calving. Antes, o peso da DPR era 0,7. — [WW Sires, "Holstein's fertility index shake up"](https://wwsires.com/resources/genetics/holstein-s-fertility-index-shake-up) (S; site de venda de sêmen; checar no documento da associação)
- Diferença DPR vs. CCR: explicada sobretudo pela taxa de submissão e detecção de cio. A DPR também ignora o número de serviços e fêmeas que não foram cobertas. — mesma fonte (S)
- Run de agosto de 2026: a CDCB teria reconstruído todas as características reprodutivas em 11/08/2026. A h² da DPR subiria de 1,4% para 2,9%. Para touros com status de IA de abril de 2026, o PTA médio subiu cerca de 1,2 ponto em DPR e 1,4 em CCR, e caiu 0,14 em HCR. — [The Bullvine, "Frazz Lionel DPR CCR August 2026"](https://www.thebullvine.com/news/frazz-lionel-dpr-ccr-august-2026/) (S; a própria fonte alerta que parte da informação circulante não foi verificada)

**Herdabilidade e variação entre populações**
- Meta-análise citada (55 populações leiteiras): h² típica de características reprodutivas femininas entre 0,02 e 0,04; fertilidade tem acurácia menor que outros traços; população multi-raça não traz ganho para fertilidade. — [Science.gov, tópico "dairy cattle fertility"](https://www.science.gov/topicpages/d/dairy+cattle+fertility.html) (S; resumo agregado, artigo original não identificado)
- Dias abertos, intervalo entre partos e não retorno em registros convencionais: h² < 0,05. — [ResearchGate, "Genetic aspects of fertility traits in dairy cattle - review"](https://www.researchgate.net/publication/265844803_Genetic_aspects_of_fertility_traits_in_dairy_cattle_-_review) (A)
- Avaliação multi-traço alemã (cinco características): h² de 1% (não retorno de novilhas) a 4% (intervalo parto à primeira IA). — [PubMed 18946139, "Genetic evaluation of fertility traits of dairy cattle using a multiple-trait animal model"](https://pubmed.ncbi.nlm.nih.gov/18946139/) (A; autoria da análise alemã não confirmada)
- Holstein chinês, oito características de fertilidade: h² de 0,024 a 0,085; idade ao primeiro serviço é exceção, com 0,390. — [PMC13255800, "Genetic Parameters and Weighted Single-Step GWAS of Fertility Traits in Chinese Holstein"](https://pmc.ncbi.nlm.nih.gov/articles/PMC13255800/) (P, trecho)
- Estimativa antiga: h² da taxa de concepção de cerca de 8,5%, obtida por grupos de meio-irmãos paternos. — [ScienceDirect S0022030261899761, "Hereditary Variation in Conception Rate of Holstein-Friesian Cattle"](https://www.sciencedirect.com/science/article/pii/S0022030261899761) (P; estudo antigo, pelo PII é de 1961)

**Taxa de concepção de novilhas e vacas (modelo threshold)**
- Análise bayesiana de primeiro serviço bem-sucedido: h² de CR para novilhas 0,031; primeira lactação 0,034; segunda lactação 0,028. — [Animal (Cambridge), "Relationships between conception rate in Holstein heifers and cows and milk yield at various stages of lactation"](https://www.cambridge.org/core/journals/animal/article/abs/relationships-between-conception-rate-in-holstein-heifers-and-cows-and-milk-yield-at-various-stages-of-lactation/F2C0D9258951A61007644D4F6DEA444A) (A; atribuição pelo título)
- Na mesma análise, rg entre CR de novilhas e produção de leite em todos os períodos foi positiva (0,082 a 0,287). Rg entre CR de vacas e produção na primeira e segunda lactação foi negativa (−0,121 a −0,250). Os autores concluem que selecionar por produção pode reduzir a concepção de vacas. — mesma fonte (A)
- Estudo mais antigo não encontrou correlação genética entre fertilidade de novilhas e de vacas. Isso conflita com a análise acima. — fonte não identificada (A-gap)
- Holstein iraniano (primeira lactação): concepção no primeiro serviço de 0,78 em novilhas contra 0,54 em vacas primíparas. — [ScienceDirect S1871141315300263, "Genetic relationship between heifers and cows fertility and milk yield traits in first-parity Iranian Holstein dairy cows"](https://www.sciencedirect.com/science/article/abs/pii/S1871141315300263) (A)
- Dados de GWAS em cerca de um milhão de vacas da primeira lactação nos EUA (DPR, CCR, HCR) identificaram vários loci, incluindo regiões em Chr18, Chr06 e Chr01. — [PMC10341978, "A Million-Cow Genome-Wide Association Study of Three Fertility Traits in U.S. Holstein Cows"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10341978/) (A)

**Brasil (Girolando e Holandês)**
- Girolando (estudo de 2017): h² de idade ao primeiro parto de 0,20 (REML, análises uni e bi-traço). Outra estimativa para Girolando de dupla aptidão: 0,18. Intervalo entre partos 0,00 a 0,08; período seco 0,07 a 0,14. — [Italian Journal of Animal Science (DOI 10.1080/1828051X.2017.1335180), "Genetic parameters of milk production and reproduction traits of Girolando cattle in Brazil"](https://www.tandfonline.com/doi/full/10.1080/1828051X.2017.1335180) (A; periódico pelo ISSN/DOI)
- Estudo genômico em Girolando: h² de fertilidade de 0,03 a 0,06; de indicadores de longevidade produtiva de 0,06 a 0,31; de características produtivas de 0,06 a 0,14. — [Embrapa, "Genomic analysis of longevity with productive and reproductive traits in Girolando cattle" (EAAP 426)](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1171323/1/Genomic-analysis-of-longevity-with-productive-and-reproductive-traits-in-Girolando-cattle.pdf) (A)
- Heterose favorável para características reprodutivas em 35.582 vacas Girolando (registros de 1998 a 2014). — [SciELO, RBZ, "Breed and heterosis effects on reproduction and production traits of Girolando cows"](https://www.scielo.br/j/rbz/a/nNRVdQGJVZZSzPbPPyFgc7q/?lang=en) (A; título compatível com a descrição)

**Modelo (forma padrão)**
- Modelo linear de animal ou touro: y = Xb + Zu + e, com Var(u) = Aσ²_u (ou G ⊗ A em multi-traço) e Var(e) = Iσ²_e. [não verificado] Equações exatas do USDA/CDCB para DPR, CCR e HCR não foram localizadas.
- Threshold para resposta binária: y_i = 1 se l_i > 0, com l = Xb + Zu + e e Var(e) = 1 na escala de liability; P(y = 1) = Φ(Xb + Zu). [não verificado]

### Inferences
- **Acurácia com h² baixa.** Usando r² = n·h² / (4 + (n−1)·h²) para um touro com n filhas, sem outra informação e ignorando efeitos ambientais comuns [não verificado, fórmula padrão de genética quantitativa]. Cálculo meu com h² = 0,03: n = 10 gera r ≈ 0,27; n = 100 gera r ≈ 0,66. Isso explica por que os PTA de fertilidade têm confiabilidade limitada mesmo com muitas filhas.
- **DPR como conversão linear.** Com DO = 120 dias, a fórmula linear dá 0,25 × (233 − 120) = 28,25%, e a fórmula AIPL dá 21 / (120 − 60 + 11) = 29,6%. A diferença de cerca de 1,4 ponto é esperada da aproximação linear. A inclinação de 0,25 por dia corresponde à regra de 4 dias por ponto percentual. (Cálculo meu, com base nas fontes acima.)
- **Mudança de h² com o modelo.** O run de 2026 mostra h² de DPR passando de 1,4% para 2,9% após reconstruir a avaliação. Isso indica que a h² depende da definição e da estrutura do modelo, não só da biologia. Confirmar com a documentação oficial.
- **Sinais opostos.** A correlação genética de CCR de vacas com leite é negativa, e a de HCR de novilhas é positiva em um estudo. Um índice com peso alto em produção tende a piorar CCR. Isso justifica incluir CCR e HCR com peso próprio no índice de fertilidade (inferência).
- **Threshold vs. linear.** Modelos lineares são usados na avaliação oficial por simplicidade computacional e por resultados comparáveis em incidência moderada (ver §4 para conflitos entre fontes).

### Gaps
- Texto do VanRaden et al. (2004) não localizado: equação exata do modelo de DPR, covariáveis e forma matricial.
- Data e definição exatas da mudança de DPR em dezembro de 2014: apenas resumo sem fonte primária.
- Início da DPR: conflito entre novembro de 2003 e novembro de 2004.
- Documentação oficial do run de agosto de 2026: apenas imprensa.
- Estimativa de Sun et al. (2010): não localizada.
- Avaliação oficial brasileira de fertilidade em Holandês e Girolando (quem publica e com que modelo): não pesquisada diretamente.
- Fertilidade de novilhas e vacas em Canadá e países nórdicos: não pesquisada.
- Tradução do "+11" e do período de espera voluntário como parâmetros atuais: não verificada no documento vigente.

---

## 2. Partos: facilidade de parto (SCE, DCE) e natimortalidade

### Takeaway
A facilidade de parto (CE) é um escore categórico de 1 (sem problema) a 5 (dificuldade extrema). É modelada com threshold (liability). Nos EUA, desde 2002/2003, usa-se o modelo sire–maternal grandsire (SMGS), porque a identificação de bezerros é incompleta e um modelo animal convergiria lentamente. A natimortalidade (SB) segue o mesmo arcabouço. Herdabilidades diretas e maternas são baixas na escala de liability (direta cerca de 0,09; materna cerca de 0,05 nos EUA).

### Cited Findings

**Definição e modelo nos EUA**
- Escore de CE de 1 (sem problema) a 5 (dificuldade extrema), com base de mais de 10 milhões de registros. — [Van Tassell, Wiggans e Misztal (2003), "Calving Ease (Co)Variance Components for a Sire-Maternal Grandsire Threshold Model", J. Dairy Sci.](https://www.journalofdairyscience.org/article/S0022-0302(03)73771-0/fulltext) (P, trecho). DOI derivado do PII: 10.3168/jds.S0022-0302(03)73771-0 (A)
- Componentes de variância escolhidos (escala de liability): herd-year 0,438; touro 0,022; MGS 0,016; touro–MGS 0,009. Herdabilidades resultantes: direta 0,086; materna 0,048. Os valores são os de um conjunto escolhido por resultar em maiores h², não a média de todos os ajustes. — [PubMed 12778596](https://pubmed.ncbi.nlm.nih.gov/12778596/) (P, trecho)
- Justificativa para não usar modelo animal: identificação incompleta dos bezerros e convergência lenta de um modelo animal threshold. — mesma fonte (P, trecho)
- Implementação: o modelo SMGS foi implementado em 2002 para a avaliação de CE nos EUA e substituiu o modelo de touro. A publicação de implementação é de 2003. — [PubMed 14594257, "Implementation of a sire-maternal grandsire model for evaluation of calving ease in the United States"](https://pubmed.ncbi.nlm.nih.gov/14594257/) (P, trecho). Ver discrepância 1.
- Modelo alternativo sire–maternal (SMAT, usa a mãe em vez do avô materno): gerou avaliações semelhantes para touros fenotipados e para os avôs maternos. O estudo comparou os solvers Newton-Raphson e EM. — [PMC12958189, "Computational and modeling approaches for US threshold genetic evaluations of calving ease"](https://pmc.ncbi.nlm.nih.gov/articles/PMC12958189/) (P, trecho; estudo de 2025)

**Natimortalidade**
- Natimortalidade com modelo SMGS threshold: h² direta média 0,030 e materna 0,058; correlação genética entre direta e materna −0,02 ± 0,16. Um índice de facilidade de parto com natimortalidade (calving ability index) foi construído para o Lifetime Net Merit. — [JDS 2007, "Stillbirth (Co)Variance Components for a Sire-Maternal Grandsire Threshold Model and Development of a Calving Ability Index for Sire Selection"](https://www.journalofdairyscience.org/article/S0022-0302(07)71746-0/fulltext) (P, trecho). Também [PubMed 17430952](https://pubmed.ncbi.nlm.nih.gov/17430952/) (A).

**Outras populações e cruzamento de corte**
- Holstein de primeira lactação, Irlanda: h² direta 0,13; materna 0,04; correlação direta–materna −0,47. Fonte primária não identificada (A-gap).
- Holstein coreano, primeira parturição: h² direta 0,03; materna 0,04; correlações direta–materna entre −0,63 e −0,32. Fonte primária não identificada (A-gap).
- Holstein e Jersey com touros de corte, primeira lactação (JDS, dezembro de 2025): h² direta 0,01 a 0,02; materna 0,02 a 0,04. Com as três primeiras lactações, h² materna sobe para 0,19 a 0,26. — [DOAJ, "Journal of Dairy Science (Dec 2025)"](https://doaj.org/article/f1fb4e9984b8408fa7b797035d430c12) (A; título do registro DOAJ)
- Nelore, novilhas (não leiteiro): h² direta 0,11 a 0,24; materna 0,09 a 0,11, com 39.664 registros nascidos entre 2010 e 2017. Fonte não localizada com segurança; usar apenas como ordem de grandeza. (A-gap)
- Brasil, Holandês: não localizei estimativa de h² de facilidade de parto. A única referência encontrada é descritiva, sobre provas de touros Holandês e Jersey vendidos no Brasil.

**Definições de SCE e DCE**
- SCE (sire calving ease): PTA direto do touro para facilidade de parto de suas filhas, nascimentos de seus bezerros. [não verificado]
- DCE (daughter calving ease): PTA para facilidade de parto das filhas do touro como mães. Definição precisa e forma de combinação com a CE direta na avaliação atual dos EUA não localizadas. [não verificado]

**Modelo (forma padrão)**
- Liability: l_i = x_i′β + z_s s + z_g g + z_sg (sg) + e_i, com e_i ~ N(0, 1). Categoria k observada quando t_{k−1} < l_i ≤ t_k. P(y = k) = Φ(t_k − μ_i) − Φ(t_{k−1} − μ_i), μ_i = x_i′β + … [não verificado]. Sem matriz de parentesco A para o efeito de touro; a forma exata usada nos EUA não foi verificada.

### Inferences
- O efeito materno via avô materno (MGS) depende da estrutura de pedigree. Quando a mãe é fenotipada, o modelo SMAT pode ser equivalente (inferência com base no estudo de 2025).
- A h² materna é mais sensível à escolha do modelo e à população (valores de 0,02 a 0,26 nas fontes), o que pede cautela ao comparar PTA de CE materna entre países.
- Natimortalidade e CE são separadas no índice de facilidade de parto; a correlação direta–materna negativa nas fontes da Irlanda e da Coreia sugere antagonismo entre efeito do touro e da mãe.

### Gaps
- Equação exata do SMGS (vetor de efeitos, matrizes de incidência, covariância touro–MGS): não verificada.
- Definição precisa de DCE e sua combinação com a CE direta atual: não localizada.
- Estimativas brasileiras de CE e natimortalidade em Holandês e Girolando: não localizadas.
- Interbull e avaliação de outros países: não pesquisados.

---

## 3. Longevidade: PL, herd life, livability (modelos lineares e de sobrevivência)

### Takeaway
A longevidade é medida como tempo de vida produtiva até descarte, com censura para vacas que ainda estão vivas. A PL (productive life) dos EUA é um total de dias ou meses em lactação, com limite de 305 dias por lactação até 84 meses de idade. A PTA publicada combina medida direta (descartes do DHIA) com preditores indiretos de tipo linear e de produção. Na literatura, modelos Weibull de riscos proporcionais (Ducrocq e Sölkner, 1998; Survival Kit) são padrão, com efeitos genéticos aditivos. Herdabilidade efetiva é baixa (0,04 a 0,10), e a censura reduz a variância aparente.

### Cited Findings

**Definição a partir de registros de campo**
- PL nos EUA: número total de DIM com limite de 305 por lactação aos 84 meses de idade, para Holandês. — [ScienceDirect S002203020572782X, "Changing Definition of Productive Life in US Holsteins: Effect on Genetic Correlations"](https://www.sciencedirect.com/science/article/pii/S002203020572782X) (P, título; trecho sobre a definição é de busca, (A))
- Holstein USA descreve a PL como um total de meses em lactação, que imita as curvas de lactação, com peso maior para as lactações iniciais e para a terceira lactação. A PTA publicada combina medida direta (dados de descarte DHIA) com preditores indiretos de tipo linear e de produção, aproximando uma avaliação multi-traço. — [Holstein USA, PL](https://www.holsteinusa.com/genetic_evaluations/ss_Gen_Eval_for_PL.html) (P, documento de associação; trecho)
- Em estudos de sobrevivência, a longevidade é os dias entre o primeiro parto e o fim do registro (LPL). Vacas vivas no fim do estudo são censuradas à direita. — [ScienceDirect S1871141316300191, "Survival analysis of productive life in Brazilian holstein using a piecewise Weibull proportional hazard model"](https://www.sciencedirect.com/science/article/pii/S1871141316300191) (A)

**Modelo de sobrevivência (Weibull e riscos proporcionais)**
- Fundamento: Ducrocq et al. (1988) mostraram que modelos de riscos proporcionais servem para analisar o comprimento da vida produtiva. Artigo original sem URL localizada (A, citado em fontes secundárias). Survival Kit: Ducrocq e Sölkner (1998), sem URL localizada.
- Hazard: λ(t) é a probabilidade de descarte no tempo t, dado que a vaca estava viva até t. A linha de base é Weibull com escala λ e forma ρ. Forma ρ > 1 gera hazard crescente; ρ = 1 gera hazard constante. — [ScienceDirect S0022030206724493, "Development of a Survival Model with Piecewise Weibull Baselines for the Analysis of Length of Productive Life of Holstein Cows in Japan"](https://www.sciencedirect.com/science/article/pii/S0022030206724493) (A; trecho de definição)
- Riscos proporcionais só valem se efeitos dependentes do tempo (como herd-year) forem incluídos. — mesma fonte (A)
- Weibull com linha de base por lactação (piecewise) no Canadá, Holandês, Jersey e Ayrshire, com resultados de Sewalem et al. (2005). Também há a versão francesa de Ducrocq (2005), dentro da lactação. — [JDS 2005, "Genetic Analysis of Herd Life in Canadian Dairy Cattle on a Lactation Basis Using a Weibull Proportional Hazards Model"](https://www.journalofdairyscience.org/article/S0022-0302(05)72696-5/fulltext) (P, trecho; DOI derivado do PII: 10.3168/jds.S0022-0302(05)72696-5)
- Seis raças leiteiras suíças, mais de 2,44 milhões de vacas: Weibull com riscos proporcionais; a suposição foi checada graficamente sem desvios relevantes. Fatores incluídos: produção, fertilidade, saúde, manejo e escores de conformação. — [PMC13264184, "Effects of production, fertility, health, management and conformation scores on longevity in six Swiss dairy breeds"](https://pmc.ncbi.nlm.nih.gov/articles/PMC13264184) (P, trecho)
- Espanhol (cabras leiteiras): Weibull com riscos proporcionais para fatores de risco e parâmetros genéticos. — [Tandfonline 10.1080/1828051X.2023.2288624](https://www.tandfonline.com/doi/full/10.1080/1828051X.2023.2288624) (P, trecho; cabras, não bovinos)
- Modelos lineares versus riscos proporcionais para dados discretos de longevidade: comparação em Animal (Cambridge), resultados não lidos. — [Cambridge, "A comparison of a linear and proportional hazards approach to analyse discrete longevity data in dairy cows"](https://www.cambridge.org/core/journals/animal-science/article/abs/comparison-of-a-linear-and-proportional-hazards-approach-to-analyse-discrete-longevity-data-in-dairy-cows/108873882ACE458900AA7DBDF485E9F7) (P, título)

**Herdabilidade e dados**
- EUA: h² de longevidade entre 0,08 e 0,10 para todas as definições testadas. — fonte primária não identificada (A-gap)
- Brasil (Holandês, piecewise Weibull): h² efetivo, sem censura, de 7,8%. — ScienceDirect S1871141316300191, já citado (A)
- GWAS de PL com 1.103.641 vacas Holandês com fenótipo de PL. Os EUA já tinham mais de um milhão de Holandês em genômica no fim de 2022. — [PMC11426094, "A million-cow genome-wide association study of productive life in U.S. Holstein cows"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11426094/) (P, trecho)
- Relação entre tipo e sobrevivência funcional nos EUA com modelo Weibull. — [ScienceDirect S0022030204733949, "Analysis of the Relationship Between Type Traits and Functional Survival in US Holstein Cattle Using a Weibull Proportional Hazards Model"](https://www.sciencedirect.com/science/article/pii/S0022030204733949) (P, título; resultados não lidos)
- Reavaliação da importância dos traços lineares para predizer mérito genético de sobrevivência em população envelhecida. — [JDS 2022, "Re-assessing the importance of linear type traits in predicting genetic merit for survival in an aging Holstein-Friesian dairy cow population"](https://www.journalofdairyscience.org/article/S0022-0302(22)00406-4/fulltext) (P, título; resultados não lidos)

**Modelo (forma padrão)**
- Hazard individual: λ_i(t) = λ_0(t) · exp(x_i′β + z_i′u), com λ_0(t) = ρλt^(ρ−1) na forma de taxa (parametrização exata do Survival Kit não verificada), e u ~ N(0, Aσ²_u) para efeito de animal, ou via touro com σ²_s = σ²_a/4. [não verificado]
- Razão de risco: exp(β) é o fator multiplicativo de risco de descarte para uma unidade do preditor. [não verificado]
- Modelo linear alternativo: y_i = Xb + Zu + e, com censura tratada por ajuste ou truncamento. Forma exata não verificada. [não verificado]

### Inferences
- A PL oficial dos EUA combina uma medida linear implícita com preditores indiretos. Por isso a PTA não é, em rigor, uma estimativa de riscos proporcionais, e as duas escalas não são diretamente comparáveis.
- Com censura pesada, a variância genética aparente tende a cair (inferência a partir do valor brasileiro de 7,8% sem censura).
- Modelos piecewise com linha de base por lactação são mais adequados quando o descarte depende de lactação (inferência, com base nas fontes do Canadá e da França).
- Tipo linear e produção entram como preditores da longevidade: é preciso considerar as correlações genéticas com produção ao usar o tipo como ferramenta indireta (ver §9).

### Gaps
- Equações exatas do Survival Kit e da avaliação oficial de PL (EUA): não verificadas.
- Herd life, cow livability e heifer livability: definições da CDCB ou da Holstein USA não localizadas.
- Resultado do estudo linear versus PH (Cambridge): não lido.
- Herdabilidades de PL da avaliação oficial: apenas valores de fontes secundárias.
- Avaliação brasileira oficial de longevidade: não localizada.

---

## 4. Saúde: mastite, cetose, deslocamento de abomaso, metrite, retenção de placenta, hipocalcemia

### Takeaway
Nos EUA, a CDCB publica avaliações genômicas de resistência a seis doenças em Holandês desde abril de 2018: febre do leite (hipocalcemia), deslocamento de abomaso, cetose, mastite, metrite e retenção de placenta. Os dados são ocorrências registradas pelo produtor. Desde agosto de 2018, esses traços entram no NM$. As herdabilidades são baixas (0,003 a 0,05 na maioria dos estudos) na escala observada e podem ser maiores (até 0,2) na escala threshold. O Canadá coleta oito condições desde 2007 e o Nórdico usa modelos threshold bivariados para mastite. Não localizei uma fonte primária com a equação do modelo CDCB.

### Cited Findings

**Avaliação nos EUA (CDCB)**
- Avaliações de resistência a seis doenças para Holandês, introduzidas em abril de 2018 e incluídas no Net Merit em agosto de 2018. — [CDCB, changes to evaluation system (August 2018)](https://uscdcb.com/wp-content/uploads/2023/08/CDCB-changes-to-evaluation-system-August-2018-_-Council-on-Dairy-Cattle-Breeding-1.pdf) (P, trecho)
- Parker Gaddis et al. (2018, WCGALP), "Development of national genomic evaluations for health ...": descreve o desenvolvimento das avaliações. Conteúdo do modelo não lido. — [CDCB, WCGALP 2018](https://www.uscdcb.com/wp-content/uploads/2018/04/WCGALP2018Paper_Gaddis_HealthEval_final.pdf) (P, título)
- Gado Brown Swiss recebe as mesmas seis avaliações a partir de 9 de agosto de 2022. — fonte não localizada com URL precisa (A-gap)
- Abril de 2024: o modelo dos seis traços foi revisto porque o número de registros de saúde no National Cooperator Database cresceu três a quatro vezes, dependendo do traço. — [The Bullvine, "CDCB: April 2024 Evaluation Changes"](https://www.thebullvine.com/news/cdcb-april-2024-evaluation-changes-whats-new/) (S)
- Saúde de bezerros: primeiras avaliações nacionais para diarreia (DIA) e doença respiratória (RSP). Expressas como PTA em pontos percentuais de resistência em relação à base da raça. h² estimada de 2,6% (DIA) e 2,2% (RSP). — [Bovine Vet, "CDCB Launches First National Genetic Evaluations for Calf Health"](https://www.bovinevetonline.com/news/cdcb-launches-first-national-genetic-evaluations-calf-health) (S)

**Canadá**
- Produtores canadenses registram oito condições desde abril de 2007: mastite (MAST), claudicação (LAME), cisto ovariano (COS), deslocamento de abomaso à esquerda (LDA), cetose (KETO), metrite (METR), febre do leite (MF) e retenção de placenta (RP). Incidências de 2,3% (MF) a 9,7% (MAST) em 46.104 casos. — [ScienceDirect S1751731111002059, "Genetic parameters for producer-recorded health data in Canadian Holstein cattle"](https://www.sciencedirect.com/science/article/pii/S1751731111002059) (A)
- Avaliação genômica para resistência a distúrbios reprodutivos (cistos ovarianos, metrite, retenção de placenta) em Ayrshire, Holandês e Jersey, com primeira liberação oficial em dezembro de 2020 (data não confirmada). — [CDN 2019, "Genetic parameters for fertility disorders in Canadian Holsteins"](https://www.cdn.ca/Articles/GEBOCT2019/EN_3C_DCBGC_Sept2019-Janusz-FertDis.pdf) (A)
- Holstein canadense: h² de ~0,01 para claudicação, úlcera de sola e sobrevivência de bezerro. Fonte não identificada (A-gap)

**Nórdico (Dinamarca, Suécia, Finlândia)**
- Nordic Total Merit (NTM): saúde do úbere = mastite clínica + CCS + inserção anterior do úbere + profundidade do úbere (peso 0,30 em Holandês). Saúde geral = distúrbios reprodutivos precoces e tardios + outros distúrbios metabólicos + cetose + problemas de pés e pernas (peso 0,14 em Holandês). — [ScienceDirect S0022030223003466, "Correlation between breeding values for milk fatty acids and Nordic Total Merit index traits for Danish Holstein and Danish Jersey"](https://www.sciencedirect.com/science/article/pii/S0022030223003466) (A)
- Publicações da NordicEBV: modelo threshold bivariado para suscetibilidade e capacidade de recuperação de mastite em Holandês dinamarquês (2017); avaliação conjunta de úbere combinando CCS do controle leiteiro com mastite clínica (2010); comparação de modelos de mastite clínica para avaliação conjunta Suécia–Dinamarca–Finlândia (2007). — [NordicEBV, papers](https://nordicebv.info/papersandpresentations/papers/) (A; títulos da lista de publicações)

**Herdabilidades e correlações em estudos recentes**
- Holstein na Eslováquia (registros brutos de diagnóstico): h² de metrite e cetose 0,003; de doenças de casco 0,050; de mastite 0,020. — [Tandfonline 10.1080/1828051X.2026.2615481, "Genetic evaluation of health traits in Slovak Holstein herds using raw diagnoses data"](https://www.tandfonline.com/doi/full/10.1080/1828051X.2026.2615481) (A)
- Holstein chinês: h² de predisposição a mastite 0,09; a endometrite 0,01; a cetose 0,02. — [PMC11350879, "Phenotypic and Genetic Analyses of Mastitis, Endometritis, and Ketosis on Milk Production and Reproduction Traits in Chinese Holstein Cattle"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11350879/) (A)
- Holstein chinês, threshold versus linear: h² até 0,226 em threshold e até 0,048 em linear. — [PubMed 37746924, "Genetic parameters for health traits and their association with fertility and milk production in Chinese Holsteins"](https://pubmed.ncbi.nlm.nih.gov/37746924) (A)
- Holstein orgânico nos EUA: correlação genética cetose–mastite de 0,06 ± 0,066. — [ScienceDirect S0022030221009589, "Genetic parameters and association of national evaluations with breeding values for health traits in US organic Holstein cows"](https://www.sciencedirect.com/science/article/pii/S0022030221009589) (A)
- Estudo de 2024 sobre conversão de EBV de traços de saúde da escala observada para a escala de probabilidade. Resultado não lido. — [PubMed 39004126](https://pubmed.ncbi.nlm.nih.gov/39004126) (P, título)
- Reino Unido (estudo antigo): modelos threshold de touro deram h² e repetibilidade maiores que lineares para traços binários, mas os modelos lineares tiveram desempenho igual ou melhor para quase todos os traços. Os autores sugeriram reduzir os modelos lineares aos efeitos fixos significativos. — [ResearchGate 256493033, "Linear and threshold model genetic parameters for disease, fertility and milk production in dairy cattle"](https://www.researchgate.net/publication/256493033_Linear_and_threshold_model_genetic_parameters_for_disease_fertility_and_milk_production_in_dairy_cattle) (A)

**Modelos (forma padrão)**
- Threshold (liability): y_i = 1 se l_i > 0, com l = Xb + Zu + e e Var(e) = 1. Herdabilidade na liability: h²_l = σ²_u / (σ²_u + 1). [não verificado]
- Conversão para escala observada (Dempster e Lerner): h²_obs = h²_l · z² / [p(1 − p)], onde z é a densidade normal no limiar Φ⁻¹(1 − p) e p é a incidência. [não verificado]. Exemplos meus com essa fórmula:
  - Incidência p = 5%: z² ≈ 0,0106, logo h²_obs ≈ 0,22 · h²_l. Para h²_l = 0,10, h²_obs ≈ 0,022.
  - Incidência p = 20%: z² ≈ 0,0784, logo h²_obs ≈ 0,49 · h²_l. Para h²_l = 0,10, h²_obs ≈ 0,049.
- Modelo linear de animal para registros 0/1: y_i = Xb + Zu + e, sem restrição de escala. [não verificado]

### Inferences
- Para incidências de 5% ou menos, a aproximação linear tende a subestimar a variância genética frente à escala de liability. Os dados das fontes são conflitantes (Reino Unido, linear melhor; China, threshold com h² bem maior). A escolha deve ser justificada pela incidência e pela medida de desempenho.
- Com h² observada tão baixa, GEBV de metrite e cetose terão confiabilidade limitada. O aumento de 3 a 4 vezes nos registros em 2024 mostra que parâmetros mudam com a intensidade de registro, o que exige reestimação periódica (inferência).
- Os registros de produtor têm viés de registro (diferentes intensidades de diagnóstico entre rebanhos). A CDCB trabalha com isso ao ajustar o modelo, mas o procedimento não foi verificado.

### Gaps
- Modelo exato da CDCB (threshold ou linear, covariáveis, tratamento de diferentes intensidades de registro): não lido. Verificar no paper WCGALP 2018.
- Avaliação multi-país (Interbull) de saúde: não pesquisada.
- Nenhuma fonte brasileira sobre avaliação de saúde em Holandês ou Girolando.
- Hipocalcemia e deslocamento de abomaso: h² específicas apenas via imprensa.
- Brown Swiss: URL precisa da avaliação não localizada.

---

## 5. Conformação e tipo: traços lineares, compostos, PTAT

### Takeaway
Os traços lineares são medidas de grau, não de preferência. O ICAR define a escala (1 a 9, com âncoras em 1, 5 e 9) e exige que ela cubra a faixa biológica da população. Herdabilidades típicas: 0,10 a 0,30 para corpo e úbere, e um pouco menores para pés e pernas, com grande variação entre populações. A Holstein USA publica compostos (úbere, pés e pernas, corpo) e usa peso negativo em estatura para desacoplar os compostos de tamanho. No Brasil, as h² em Holandês variam de 0,09 a 0,38.

### Cited Findings

**Padrão ICAR**
- ICAR, Seção 5 (Conformation Recording, versão de fevereiro de 2022): tipo linear é a base de todos os sistemas de descrição do animal. Os escores medem o grau de expressão, não a desejabilidade. A escala precisa cobrir a faixa biológica da população. — [ICAR Wiki, "Section 05 – Conformation Recording"](https://wiki.icar.org/index.php/Conformation_Recording) (P, trecho)
- Anexo do grupo de trabalho de 2015: escala de 1 a 9, com âncoras em 1, 5 e 9 (por exemplo, estatura: 1 baixo, 5 intermediário, 9 alto). — [ICAR CR WG appendix (2015)](https://old.icar.org/Documents/Board/2015/2015-07-21/Docs/Appendix%204%20Conformation%20Recording_(CR%20WG).pdf) (P, trecho). Âncoras da versão de 2022 não verificadas.

**EUA (Holstein USA)**
- Herdabilidades publicadas por traço: pés e pernas (escore) 0,17; ângulo do casco 0,15; pernas traseiras vista traseira 0,11; profundidade do úbere 0,28; tamanho de teto 0,26. — [Holstein USA, Linear Type Evaluations](https://www.holsteinusa.com/genetic_evaluations/ss_linear.html) (P, trecho)
- Peso negativo em estatura nos compostos, para permitir melhorar úbere e pés e pernas sem aumentar a altura das vacas. — mesma fonte (P, trecho)
- PTAT (Holstein USA): definição não verificada. [não verificado]
- Documento do Canadá sobre cálculo das avaliações de conformação: título encontrado, conteúdo não lido. — [CDN, "Calculating Genetic Evaluations for Holstein Conformation Traits"](https://www.cdn.ca/document.php?id=65) (P, título)

**Outras populações (Holandês)**
- Coreia do Sul: h² médias de pés e pernas 0,21 (variação 0,13 a 0,29); de garupa 0,29 (0,21 a 0,35); de corpo de 0,10 a 0,50; de úbere de 0,05 a 0,46. — [PMC10915218, "Evaluation of accuracies of genomic predictions for body conformation traits in Korean Holstein"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10915218/) (A)
- Irã: pés e pernas 0,06 a 0,15; corpo 0,17 a 0,24; úbere 0,12 a 0,25. Fonte primária não identificada (A-gap)
- Indonésia: h² de pernas traseiras (conjunto) 0,334; ângulo do casco 0,236; profundidade do úbere 0,147; comprimento de teto 0,213. — [PMC7065408, "(Co)variance components and genetics parameter estimation for linear traits in Holstein cattle in Indonesia: traits related to foot/leg and udder"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7065408/) (A)

**Brasil**
- Holandês brasileiro: h² de 0,09 a 0,38; menores para textura do úbere e ângulo do casco; maior para comprimento de teto. — [Animal Bioscience, "Genetic Parameters for Linear Type Traits and Milk, Fat, and Protein Production in Holstein Cows in Brazil"](https://www.animbiosci.org/journal/view.php?doi=10.5713%2Fajas.14.0288) (P, trecho; DOI 10.5713/ajas.14.0288 derivado da URL)
- Girolando e Gir: traços lineares não localizados.

**Correlações entre traços (fonte não identificada)**
- Ângulo do casco com pernas traseiras vista traseira: 0,64. Pernas traseiras (conjunto) com o mesmo traço: −0,54. Escore de locomoção com pés e pernas: correlação alta. (A-gap)

**Modelo (forma padrão)**
- Multi-traço linear: y_i = X_i b + Z_i u + e, com Var(u) = G ⊗ A para n traços. Composto = Σ w_k · PTA_k, com pesos da associação não verificados. [não verificado]

### Inferences
- Pés e pernas tendem a ter h² mais baixa que corpo e úbere. A variação entre populações (0,06 a 0,35) mostra que as estimativas não são transferíveis sem checagem local (inferência).
- O peso negativo em estatura é uma escolha de índice, não uma propriedade biológica. Ele deve ser reportado ao comparar compostos.
- Traços de tipo são preditores de longevidade. Isso aproxima conformação e sobrevivência, e exige atenção às correlações com produção (inferência).

### Gaps
- Equações do modelo multi-traço da Holstein USA e definição do PTAT: não lidas.
- Âncoras da versão 2022 do ICAR: não confirmadas.
- Traços lineares em Girolando e Gir: não localizados.
- Correlações tipo–produção: apenas títulos encontrados (por exemplo, ResearchGate 281711907, "Genetic Relationships Among Linear Type Traits and Milk Production Traits of Holstein Dairy Cattle"), resultados não lidos.

---

## 6. Workability: velocidade de ordenha e temperamento

### Takeaway
Temperamento e velocidade de ordenha são medidos por escore do produtor ou por sensores em sistemas automáticos. As herdabilidades são moderadas, tipicamente 0,10 a 0,25 em sistemas convencionais. Os dois traços são geneticamente correlacionados (0,23 a 0,57 em estudos antigos). Em robôs de ordenha (AMS), a velocidade parece mais herdável. Velocidade muito alta associa-se a CCS mais alta, o que pede equilíbrio na seleção.

### Cited Findings
- Revisão: temperamento e velocidade de ordenha são os principais traços de workability. Estimativas de temperamento de 0,08 a 0,25; velocidade de ordenha medida pelo produtor de 0,10 a 0,24. — [Animal Frontiers, "Incorporating temperament traits in dairy cattle breeding programs: challenges and opportunities in the phenomics era"](https://academic.oup.com/af/article/10/2/29/5814667) (A)
- Holstein canadense (cerca de 20.000 registros): h² de temperamento (MT) 0,128; de velocidade (MS) 0,139; correlação genética MT–MS 0,247. — [PubMed 21183064, "Genetic parameters of milking temperament and milking speed in Canadian Holsteins"](https://pubmed.ncbi.nlm.nih.gov/21183064) (P/A)
- Meta-análise (Pinto et al., 2025, J. Anim. Breed. Genet.): média de temperamento de ordenha em leite de 0,16; temperamento geral de 0,13. Os autores apontam baixa quantidade de estudos em leite e alta heterogeneidade. — [J. Anim. Breed. Genet., DOI 10.1111/jbg.12874, "A systematic review with meta-analysis of heritability estimates for temperament-related traits in beef and dairy cattle populations"](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12874) (P, trecho)
- Sistemas automáticos (AMS): h² de velocidade de ordenha de 0,37 a 0,48; de temperamento menor. Fonte primária não identificada (A-gap). Para comparação de traços entre sistemas: [JDS 2020, "Are farmer assessed temperament, milking speed, and leakage genetically the same traits in automatic milking systems and traditional milking systems?"](https://www.journalofdairyscience.org/article/S0022-0302(20)30125-9/fulltext) (P, título)
- Correlação genética velocidade–temperamento: 0,23 (Cue et al., 1996) a 0,57 (Visscher e Goddard, 1995), citadas em fonte secundária (A-gap)
- Velocidade muito alta associa-se a CCS mais alta; velocidade moderada é preferida. Fonte primária não identificada (A-gap)
- Escores de produtor de décadas passadas: h² de temperamento de 0,12 e de velocidade de 0,11, com valor prático limitado para seleção. — [ScienceDirect S0022030288796198, "Management Traits Scored Linearly by Dairy Producers"](https://www.sciencedirect.com/science/article/pii/S0022030288796198) (P/A, título; estudo antigo)
- Holandês polonês: estimativas de workability com dados convencionais e genômicos. Valores não lidos. — [PMC8388624, "Genetic Parameters of Workability Traits in the Population of Polish Holstein-Friesian Cows Based on Conventional and Genomic Data"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8388624/) (P, título)

**Modelo (forma padrão) [não verificado]**
- Modelo bivariado de animal para temperamento (MT) e velocidade (MS): [y_MT; y_MS] = Xb + Zu + e, com Var(u) = G₀ ⊗ A. Escores ordinais podem ser tratados com threshold.

### Inferences
- Com h² de 0,1 a 0,25, sensores de velocidade (AMS) podem melhorar a acurácia frente a escores manuais. Isso é inferência, a partir do valor de AMS (fonte não identificada).
- Ganho em velocidade pode vir acompanhado de aumento de CCS. A seleção conjunta com saúde da úbere deve considerar isso (inferência).

### Gaps
- Nenhuma fonte brasileira sobre temperamento em Gir, Girolando ou Holandês brasileiro. Essa é uma lacuna relevante, pois o temperamento é tema de manejo em raças zebuínas (background [não verificado]).
- Modelo oficial de avaliação de workability em EUA ou Canadá: não localizado.

---

## 7. Tolerância ao calor: regressão aleatória sobre THI e índices de desempenho

### Takeaway
A tolerância ao calor é modelada por regressão aleatória (reaction norm) sobre um índice de temperatura-umidade (THI). Ravagnolo e Misztal (2000) separaram dois efeitos genéticos: desempenho em condição termoneutra e taxa de declínio sob estresse térmico. O limiar de 72 THI desse estudo foi revisto para valores menores em estudos posteriores (69 nos EUA, 67 em Holandês brasileiro). A correlação genética entre produção e tolerância é negativa. Na Austrália, o DataGene publica o Heat Tolerance ABV (apenas genômica, Holstein e Jersey). No Brasil, avaliações nacionais com dados climáticos encontram limiares diferentes para Holandês e Gir.

### Cited Findings

**Modelo original (Ravagnolo e Misztal, 2000)**
- Ravagnolo e Misztal (2000), "Genetic Component of Heat Stress in Dairy Cattle, Parameter Estimation", J. Dairy Sci. 83:2126–2130. DOI 10.3168/jds.S0022-0302(00)75095-8 (derivado do PII; confirmado no texto de busca). Dados: 119.205 registros de teste-dia de primíparas, 15.002 Holandeses, 134 rebanhos na Geórgia, 21 estações meteorológicas. — [JDS PDF](https://www.journalofdairyscience.org/article/S0022-0302(00)75095-8/pdf) (P, trecho)
- Modelo: dois efeitos genéticos aleatórios, um para desempenho em condição termoneutra e outro para a taxa de declínio sob estresse térmico. — mesma fonte (P, trecho)
- THI foi o melhor índice entre os candidatos testados, com início do estresse perto de 72. — mesma fonte (P, trecho)
- Relação genética entre produção e tolerância ao calor é negativa, e seleção contínua por produção reduz a tolerância ao calor. — mesma fonte (P, trecho)
- Companion paper sobre a função do índice de calor: Ravagnolo, Misztal e Hoogenboom (2000), J. Dairy Sci. 83:2120–2125. Sem URL localizada. (P, citação)
- Misztal et al. (2002, WCGALP): sob nível de estresse f, a variância genética é σ²_a + 2f·σ_av + f²·σ²_v. Assim, a variância genética total é quadrática em f. — [INIA PDF, Misztal et al. 2002](https://www.inia.uy/sites/default/files/publications/2024-10/Misztal-et-al2002-WCGALP.pdf) (P, trecho)
- Bohmanova et al. (2005, Interbull Bulletin 33): avaliação nacional de produção de leite para tolerância ao calor nos EUA, com modelo de regressão aleatória sobre dados de teste-dia, data do teste, dias em leite e idade. Limiar de 72 e parâmetros de Ravagnolo e Misztal (2000). — [USDA-ARS, Bohmanova et al. 2005](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2005/IB_33_160_BohmanovaEtAl.pdf) (P, trecho)
- Função de estresse por partes: f(THI) = 0 se THI ≤ limiar; f(THI) = THI − limiar se THI > limiar. — [USDA-ARS, Misztal 2006 (8WC)](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2006/8WC_Misztal_01-12.pdf) (A; documento não lido diretamente)

**Limiares e estudos recentes**
- McWhorter et al. (2023), Holandês nos EUA: limiar de 69 THI para características de produção. Artigo original não localizado. — citado em [The Bullvine, "Heat tolerance genetics: why THI 69 is the new 72"](https://www.thebullvine.com/news/heat-tolerance-genetics-thi-threshold/) (S)
- Holandês brasileiro, avaliação nacional com dados climáticos (NASA POWER e estações): 253.972 vacas em 1.013 rebanhos. Gir: 155.816 registros de primíparas de 20.388 vacas em 316 rebanhos. Limiar de 67 THI para Holandês; 70 a 75,85 THI para Gir, conforme a fonte climática. Perda de leite por unidade de THI: Gir −0,440 a −0,367 kg/dia; Holandês −1,562 a −0,522 kg/dia. h² da produção de leite, com dados de estação, ~0,23 nas duas raças. — [PubMed 41887511, "From satellites to the milking parlor: National Aeronautics and Space Administration prediction of worldwide energy resources as an information source for the national genetic evaluation of heat stress tolerance in Holstein and Gir cattle"](https://pubmed.ncbi.nlm.nih.gov/41887511/) (A)
- Gir (revisão, tabela atribuída a Santana et al., não lida): rg de −0,23 entre nível de produção e capacidade de resposta ao calor; h² até 0,22 em THI baixo; até 0,29 para THI < 78 e DIM > 290. — [Frontiers in Veterinary Science, 2023](https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2023.1121499/full) (A)
- Girolando (cruzados com Holandês): h² média de 0,21 para produção de leite regredida em THI; limiares de 80 THI (1/4 Holandês) a 77 THI (7/8 Holandês); rg entre produção e efeito de calor de −0,35 a −0,92. — [ResearchGate 374903428, "Genomic-enhanced breeding values for heat stress tolerance in Girolando cattle in Brazil"](https://www.researchgate.net/publication/374903428_Genomic-enhanced_breeding_values_for_heat_stress_tolerance_in_Girolando_cattle_in_Brazil) (A)
- Holandês brasileiro: limiares de 68 THI (Negri et al.) e 60 THI (Carrara et al.), citados em revisão. Referências originais não localizadas. (A-gap)
- Outros estudos brasileiros e internacionais localizados (títulos, resultados não lidos): [Animals 2021, DOI 10.3390/ani11010128, "Selection for Test-Day Milk Yield and Thermotolerance in Brazilian Holstein Cattle"](https://doi.org/10.3390/ani11010128); [PMC9774245, "Estimation of Genetic Parameters of Heat Tolerance for Production Traits in Canadian Holsteins Cattle"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9774245/); [JDS, "Genetic analysis of the impact of heat stress on fertility traits in dairy cows in the Netherlands"](https://www.journalofdairyscience.org/article/S0022-0302(24)01257-8/fulltext) (P, títulos)

**Austrália (DataGene)**
- Heat Tolerance ABV: primeira liberação em dezembro de 2017. Escala base 100, em que 105 indica cerca de 5% mais tolerância. Publicado para Holandês e Jersey; apenas genômico. Confiabilidade de 48% (Holandês) e 39% (Jersey) no Technote 18. — [DataGene, Technote 18, Heat Tolerance ABV](https://www.datagene.com.au/wp-content/uploads/2023/11/Technote-18-Heat-Tolerance-ABV.pdf) (P, trecho)
- Orientação do DataGene: selecionar touros com ABV acima de 100 e usar vários touros para compensar a baixa confiabilidade. Seleção forte só por tolerância pode prejudicar a produção. — mesma fonte (P, trecho)
- Um comentário de imprensa diz que uma atualização de 2024 elevou a confiabilidade em holandeses em 10 pontos. Fonte primária não identificada (S, A-gap)
- Estudo de 2023 (Animals): correlações negativas entre HT e índices de seleção australianos (BPI, ASI, HWI): −0,28 a −0,74 (p ≤ 0,001). — [DOI 10.3390/ani13142259, "Association of Phenotypic Markers of Heat Tolerance with Australian Genomic Estimated Breeding Values and Dairy Cattle Selection Indices"](https://doi.org/10.3390/ani13142259) (P, trecho)
- Imprensa relata que a CDCB ainda não publica traço de tolerância ao calor no NM$. Não verificado em documento da CDCB. — [The Bullvine, "197 Bulls. 8 Years. Zero in Your NM$ Catalog"](https://www.thebullvine.com/news/197-bulls-8-years-zero-in-your-nm-catalog-the-heat-tolerance-trait-cdcb-still-wont-publish/) (S; apenas título)

**Modelo (forma padrão)**
- Regressão aleatória: y_ijk = X b + Σ (efeitos de dias em leite) + a_i,0 + a_i,1 · f(THI_ijk) + p_i + e_ijk, com [a_0, a_1] ~ N(0, G₀ ⊗ A). A variância genética sob estresse f é σ²(f) = σ²_a0 + 2f·σ_a01 + f²·σ²_a1 (conforme Misztal et al., 2002). Equação completa de Ravagnolo e Misztal (2000) não verificada. [não verificado para a forma completa]

### Inferences
- O covariável de estresse depende da definição de THI, da fonte climática e do limiar. Isso é parte do modelo. Ao comparar limiares (72, 69, 67, 70 a 75,85), é preciso reportar a fonte climática e o modelo.
- Como a correlação genética com produção é negativa, um índice sem componente de tolerância pode piorar a tolerância ao calor. Isso reforça a recomendação de cautela do DataGene.
- Com h² de cerca de 0,2 em produção regredida em THI, há variância genética para seleção em trópico. A confiabilidade do índice ainda é limitada (inferência).

### Gaps
- Equação matricial completa de Ravagnolo e Misztal (2000): não confirmada.
- McWhorter et al. (2023): artigo original não localizado.
- Estado atual da CDCB sobre tolerância ao calor: apenas imprensa.
- Avaliação oficial brasileira de tolerância ao calor (quem publica, se houver): não localizada.
- Gir: poucas fontes primárias; parte dos números vem de revisão.

---

## 8. Eficiência alimentar e metano: RFI, Feed Saved, metano

### Takeaway
Eficiência alimentar em leite é medida como consumo residual (RFI), ou seja, o resíduo do consumo real em relação ao esperado para produção e peso. A CDCB publica Feed Saved (FSAV) desde dezembro de 2020, em libras de alimento economizado por lactação, excluído dos índices NM$ para evitar dupla contagem de peso corporal. As herdabilidades variam de 0,05 a 0,43, dependendo do modelo de exigência. Não localizei fontes primárias de metano nem de eficiência alimentar no Brasil.

### Cited Findings

**Estimativas de h² do RFI**
- Estudo multi-paridade e multi-país (J. Dairy Sci., 2023): 7.379 vacas em seis países. h² de gRFI de 22% a 34%, maior na primeira parturição. Pelo resumo, a faixa de 22% a 34% no texto completo é atribuída ao ECM e não ao gRFI; verificar. — [PubMed 37678762, "Novel genetic parameters for genetic residual feed intake in dairy cattle using time series data from multiple parities and countries in North America and Europe"](https://pubmed.ncbi.nlm.nih.gov/37678762/) (P, trecho; [JDS S0022-0302(23)00589-1](https://www.journalofdairyscience.org/article/S0022-0302(23)00589-1/fulltext))
- Mesmo estudo: correlações genéticas entre parturições são altas no meio e no fim da lactação, e mais fracas no início, sobretudo entre primeira e terceira parturição. — mesma fonte (P, trecho)
- Holandês dos EUA, avaliação genômica (Frontiers in Genetics, 2024, DOI 10.3389/fgene.2024.1462306): h² de RFI 0,43; de consumo de matéria seca 0,44; de ECM 0,40; de peso vivo 0,46. Confiabilidade genômica média de 44% na população de treino e 30% na de predição. — [Frontiers in Genetics](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2024.1462306/full) (P, trecho). Valores altos em relação às outras fontes: verificar escala.
- Regressão aleatória em primeira lactação (JDS 2023): h² de gRFI de 0,12 a 0,23 ao longo da lactação. — [JDS S0022-0302(23)00620-3, "Estimation of genetic parameters for feed efficiency traits using random regression models in dairy cattle"](https://www.journalofdairyscience.org/article/S0022-0302(23)00620-3/fulltext) (A)
- Novilhas: h² de RFI de 0,13 ± 0,03; correlação genética entre consumo de matéria seca e RFI de 0,68 ± 0,07. — [PMC8072614, "Effects of Incorporating Dry Matter Intake and Residual Feed Intake into a Selection Index for Dairy Cattle Using Deterministic Modeling"](https://pmc.ncbi.nlm.nih.gov/articles/PMC8072614/) (A)
- Estudo antigo (1994, "Variance components for residual feed intake in dairy cows"): h² de 0,30 a 0,38 com regressões fenotípicas para exigência, e de 0,05 com regressões genéticas parciais. A estimativa mais alta vem de correlações genéticas fortes com variação de peso e escore de condição corporal. — [ScienceDirect S030162269400056D](https://www.sciencedirect.com/science/article/abs/pii/030162269400056D) (A; título do registro)
- Novilhas, RFI e comportamento alimentar: [JDS, "Short communication: estimation of genetic parameters for residual feed intake and feeding behavior traits in dairy heifers"](https://pubmed.ncbi.nlm.nih.gov/23462165/) (P, título; resultados não lidos)

**CDCB Feed Saved (FSAV)**
- Lançado em 1º de dezembro de 2020 para Holandês (machos e fêmeas). Expresso em libras de alimento economizado por lactação em relação à média da raça. Valores positivos são favoráveis. É construído a partir de Body Weight Composite e RFI. Exemplo da CDCB: filhas de um touro com +200 lb devem comer cerca de 200 lb a menos por lactação do que o previsto pela produção e pelo tamanho. — [CDCB, Feed Saved (FSAV)](https://uscdcb.com/feed-saved) (P, trecho); [CDCB, "Feed Saved trait can vary 1,600 pounds"](https://uscdcb.com/feed-saved-trait-can-vary-1600-pounds/) (P, trecho)
- FSAV fica fora do NM$ e de outros índices da CDCB para evitar dupla contagem de peso corporal. RFI foi incluído nesses índices em agosto de 2021. — mesma fonte (P, trecho)
- Base de referência inicial: mais de 6.300 vacas Holandês em rebanhos de pesquisa. Um projeto de coleta de dados de consumo e sensores em cerca de 3.600 Holandês adicionais estava em andamento. — mesma fonte (P, trecho)
- Em agosto de 2022, um procedimento retirou o FSAV de alguns touros só dos EUA. Corrigido na avaliação de dezembro de 2022. — mesma fonte (P, trecho)

**Metano e Brasil**
- Avaliações genéticas de metano nos Países Baixos, Canadá e Austrália: não localizadas.
- Eficiência alimentar em Holandês ou Girolando no Brasil: não localizada.

**Modelo (forma padrão) [não verificado]**
- RFI = consumo observado − consumo esperado, em que o consumo esperado vem de uma regressão sobre produção, peso e variação de peso ou escore. A escolha entre regressão fenotípica e regressão genética parcial muda a herdabilidade (ver resultados de 1994). Modelo genético: y_RFI = Xb + Zu + e, com u do componente genético do resíduo.
- Para curvas de RFI ao longo da lactação, modelos de regressão aleatória (background; sem fonte específica lida).

### Inferences
- As h² de RFI (0,05 a 0,43) não são comparáveis sem explicitar a definição do consumo esperado. Regressões fenotípicas inflam a herdabilidade em relação a regressões genéticas parciais.
- A correlação RFI–consumo (0,68) indica que seleção por RFI reduz consumo. Se o RFI for definido com peso corporal, há risco de dupla contagem, o que explica a exclusão do FSAV do NM$ (fonte CDCB).

### Gaps
- Metano (CH4): nenhuma avaliação genética localizada. Background [não verificado]: alguns países têm avaliações desse traço.
- Eficiência alimentar no Brasil: nenhuma fonte.
- Modelo exato do FSAV (CDCB): não lido.
- h² de 0,43 (Frontiers 2024) e de 0,22 a 0,34 (JDS 2023): checar escala e definição.

---

## 9. Correlações genéticas com a produção (antagonismo fertilidade–leite; Holandês e Girolando)

### Takeaway
Em Holandês, a correlação genética entre fertilidade e produção de leite é desfavorável. Dias abertos e intervalo ao primeiro serviço são positivamente correlacionados com leite (pior fertilidade com mais produção), com magnitudes de cerca de 0,1 a 0,4 em valor absoluto conforme o estudo. Para CCR de vacas, a correlação com leite é negativa; para HCR de novilhas, positiva em um estudo. Em Girolando, a heterose favorece características reprodutivas, a h² de fertilidade é baixa (0,03 a 0,06), e as h² de longevidade indicativa variam de 0,06 a 0,31.

### Cited Findings

**Holandês**
- Dias abertos com leite: rg de cerca de 0,35 (VanRaden et al., 2004). Intervalo parto–primeiro serviço com leite: rg de cerca de 0,43 (Sun et al., 2010). Ambas citadas em fonte secundária; sem URL primária localizada (A).
- Estudo de ureia do leite, fertilidade e leite (PubMed 18946143): rg entre produção e não retorno aos 56 dias = −0,31; entre produção e intervalo parto–primeiro serviço = 0,14. h² de fertilidade de 0,03 a 0,07. — [PubMed 18946143, "Genetic and phenotypic relationships among milk urea nitrogen, fertility, and milk yield in holstein cows"](https://pubmed.ncbi.nlm.nih.gov/18946143/) (P/A, trecho)
- JDS 2015 (traços reprodutivos detalhados): aumento de 100 kg no mérito de leite de 305 dias corresponde a queda de cerca de 0,4 ponto percentual na ciclicidade. — [JDS S0022-0302(15)00915-7](https://www.journalofdairyscience.org/article/S0022-0302(15)00915-7/fulltext) (A)
- Dias abertos em Holandês aumentaram 37 dias entre 1960 e 2000; cerca de 75% desse aumento foi atribuído à genética pela seleção para leite. — [WSU Extension](https://vetextension.wsu.edu/2014/02/23/genomic-selection-and-reproductive-efficiency-in-dairycattle/) (S; resumo de extensão)
- Primíparas de regiões subtropicais (2025): correlações entre produção diária e fertilidade mudam ao longo da lactação; produção alta e relação gordura/proteína no início afetam a fertilidade negativamente. A fonte indica "subtropical regions"; país não confirmado. — [PMC12501733, "Genetic Insights: Balancing Milk Yield, Fat: Protein Ratio and Fertility in Primiparous Cows From Subtropical Regions"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12501733/) (A)
- Estudo recursivo de fertilidade com composição do leite e ácidos graxos em Holandês, Brown Swiss e Simmental (JDS 2021). Resultados não lidos. — [JDS S0022030221004501](https://www.sciencedirect.com/science/article/pii/S0022030221004501) (P, título)
- Correlações genômicas entre traços de casco, úbere e produção de leite em Holandês (JDS 2022). Valores não lidos. — [JDS S0022-0302(22)00699-3](https://www.journalofdairyscience.org/article/S0022-0302(22)00699-3/fulltext) (P, título)
- Correlações de traços reprodutivos detalhados com traços de desempenho em Holandês (JDS 2015): ver item de ciclicidade acima.

**Girolando e Gir**
- Girolando: heterose favorável para características reprodutivas em 35.582 vacas (1998 a 2014). — [SciELO RBZ](https://www.scielo.br/j/rbz/a/nNRVdQGJVZZSzPbPPyFgc7q/?lang=en) (A)
- Girolando: h² de idade ao primeiro parto 0,18 a 0,20; de intervalo entre partos 0,00 a 0,08; de fertilidade (genômica) 0,03 a 0,06. — ver §1 (A)
- Girolando: rg entre produção e efeito de calor de −0,35 a −0,92 (ver §7). Gir: −0,23 entre produção e resposta ao calor (ver §7). (A)

### Inferences
- O antagonismo fertilidade–leite é consistente entre fontes, mas a magnitude depende da medida de fertilidade e do estágio da lactação. CCR de vacas é a medida mais afetada (inferência).
- Como HCR e CCR têm correlações de sinal oposto com leite em um estudo, a composição de índices deve tratar CCR, HCR e DPR separadamente (inferência).
- Em Girolando, h² baixa de fertilidade e heterose favorável sugerem que a seleção intra-raça para fertilidade é lenta e que o cruzamento tem papel importante. Generalização [não verificado].

### Gaps
- Tabela padronizada de correlações fertilidade–produção por raça (Interbull ou ICAR): não localizada.
- Correlações de RFI e de tolerância ao calor com fertilidade: não pesquisadas.
- Correlações de longevidade com leite nos EUA: não pesquisadas diretamente.
- Brasil: estudos com Girolando de 2016 a 2017, e um estudo de 2025 de regiões subtropicais. Ausência de estimativas recentes oficiais.
