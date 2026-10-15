# Genômica em caprinos leiteiros: avaliação genômica, pequenas populações e genes de grande efeito

Notas de pesquisa (consulta em 15/10/2026). Cada afirmação tem fonte com DOI verificado no Crossref ou no Europe PMC. O que não foi possível verificar está marcado como "[não verificado]". Equações são transcritas do TeX presente no XML do Europe PMC, com o número da equação na fonte. Quando a extração truncou a equação, isso está indicado.

**Método e limitações da coleta.** O WebFetch não funcionou neste ambiente. A busca foi feita por Europe PMC (REST), Crossref (verificação de DOI) e OpenAlex. A busca no OpenAlex, para o Brasil, retornou HTTP 429 de forma persistente e não foi concluída; a cobertura brasileira é, por isso, parcial. Os PDFs do NCBI e do Europe PMC não foram obtidos, e o texto integral veio do `fullTextXML` do Europe PMC, convertido em texto (arquivos em `.../scratchpad/fontes/caprinos/PMCxxxx/`). Leitura aprofundada: Carillier et al. 2014, Teissier et al. 2018 e Carillier-Jacquin et al. 2016 (resultados, equações e conclusões). Scholtens et al. 2021 e Dagnachew et al. 2011 foram lidos pelo resumo. Os demais foram lidos pelo resumo, por palavra-chave ou só pelo título. Os arquivos da pasta `fontes/caprinos` que já existiam antes desta sessão (Capgenes, Vacca et al. 2020 e outros) não têm URL de origem registrada. Foram lidos só em trechos e são citados como arquivo local.

**Correção ao enquadramento da pergunta.** Carillier et al. 2013 é o artigo do *Journal of Dairy Science* e Carillier et al. 2014 é o do *Genetics Selection Evolution* (GSE). O artigo de Oget et al. 2019 (BMC Genomics), que aparece em buscas sobre "causal point mutation", trata de ovinos leiteiros (SOCS2, dairy sheep) e não de caprinos. Não deve ser usado como evidência caprina.

---

## Q1. Chips SNP, IGGC, VarGoats, genoma de referência ARS1 e imputação

### Takeaway
O Illumina GoatSNP50 (53.347 SNPs, desenvolvido com o IGGC e publicado em 2014) é a plataforma de referência para caprinos e é a usada nas avaliações francesas e nos estudos brasileiros recentes. O genoma de referência ARS1 e o projeto VarGoats (sequenciamento) são a base da imputação. Há pouca evidência, nas fontes lidas, sobre imputação a partir de painéis de baixa densidade em caprinos leiteiros.

### Cited Findings
- O GoatSNP50 contém 53.347 SNPs, foi selecionado a partir de resequenciamento de raças diversas, e foi desenvolvido pelo IGGC/Illumina e publicado em 2014 — [Kang et al. 2026, Front Vet Sci](https://doi.org/10.3389/fvets.2026.1820954) (texto e tabela da revisão, citando a referência 11 do próprio artigo). A descrição original do chip é [Tosser-Klopp et al. 2014, PLoS ONE 9:e86227, "Design and Characterization of a 52K SNP Chip for Goats"](https://doi.org/10.1371/journal.pone.0086227). Há uma correção publicada em 2016 ([doi:10.1371/journal.pone.0152632](https://doi.org/10.1371/journal.pone.0152632)). Nota: o título fala em "52K" e o número de SNPs citado é 53.347.
- Kang et al. 2026 afirmam que o GoatSNP50 "remains the most broadly validated platform" e que painéis com mais de 70.000 SNPs já foram relatados (referência 15 da revisão, não identificada). [Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954). O nome e o número de SNPs desse painel de mais de 70 mil não foram verificados.
- Controle de qualidade no estudo francês: dos 53.347 SNPs, 46.959 passaram com MAF > 1% e call rate > 98%, separadamente por raça. Genótipos ausentes (0,1%) não foram imputados e o GBLUP lidou com os dados faltantes. Dados de 825 machos genotipados (355 Saanen, 470 Alpine) — [Carillier et al. 2014, GSE](https://doi.org/10.1186/s12711-014-0067-3), seção Methods/Data.
- Desequilíbrio de ligação na população francesa: r² médio de 0,14 a 50 kb, e persistência do LD entre Saanen e Alpine (correlação dos r) de 0,56 — [Carillier et al. 2013, JDS](https://doi.org/10.3168/jds.2013-6789) (resumo).
- Kang et al. 2026 dizem que "In goats, LD decays more rapidly than in cattle", o que tornaria necessária a escolha cuidadosa de tag SNPs para imputação. A afirmação vem da revisão e não tem número de acurácia de imputação para caprinos. [Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954).
- VarGoats: "a 1000 genomes resequencing program designed to cover the genetic diversity of the Capra genus". Imputação do GoatSNP50 para nível de sequência em Alpine e Saanen com FImpute. O melhor painel de referência foi o de cabras francesas. Concordância de alelos de 0,86 nas duas raças; concordância de genótipos de 0,75 (Alpine) e 0,73 (Saanen). Foram 1.129 machos, 23.338.436 variantes filtradas, e uma região grande do cromossomo 19 associada a volume de sêmen e produção de leite em Saanen. Os autores relatam correlações médias baixas, por causa da alta proporção de variantes de baixa frequência — [Talouarn et al. 2020, BMC Genetics](https://doi.org/10.1186/s12863-020-0826-9) (resumo e resultados).
- Genoma de referência: [Bickhart et al. 2017, Nature Genetics, "Single-molecule sequencing and chromatin conformation capture enable de novo reference assembly of the domestic goat genome"](https://doi.org/10.1038/ng.3802). O título e o DOI foram verificados no Crossref; o conteúdo do artigo não foi lido. Kang et al. 2026 afirmam que o ARS1 "provided the chromosomal scaffold necessary for high-density marker development and accurate SNP localization".
- Painel de referência para caprinos leiteiros (2026): 1.092 amostras de cabras leiteiras, integradas com datasets públicos de resequenciamento, para lcWGS e chips SNP. Foram comparados Beagle 5.4, SHAPEIT5, GLIMPSE2 e BaseVar + Beagle, e avaliados diversidade do painel, tamanho do painel, profundidade de sequenciamento e plataforma. Métricas: concordância, IQS e r² — [Zhao et al. 2026, Biology](https://doi.org/10.3390/biology15141135) (resumo). Os resultados numéricos não foram extraídos.
- Recombinação em caprinos: mapas sexo-específicos a partir de ~50 K em Alpine e Saanen. Tamanho dos mapas (Alpine, machos/fêmeas): 35,1 M e 30,5 M; Saanen: 34,0 M e 29,0 M. O estudo usa GRR e shuffling intra-cromossômico — [Etourneau et al. 2025, GSE](https://doi.org/10.1186/s12711-025-01001-0) (resumo).
- Imputação de painéis de baixa densidade: Kang et al. 2026 descrevem a estratégia de genotipar candidatos com 5 K–15 K SNPs e imputar para 50 K, e dizem que a acurácia depende da densidade do painel, do LD e do tamanho do painel de referência. A revisão não traz números para caprinos. [Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954).

### Inferences
- Como o pipeline francês usa 50 K sem imputação para a avaliação de rotina, o GoatSNP50 parece suficiente para o ssGBLUP atual. A imputação a sequência (VarGoats) aparece sobretudo em estudos de GWAS, e as concordâncias de 0,73–0,86 indicam limite para genótipos de variantes raras (inferência a partir de Talouarn et al. 2020).
- Para o Brasil, o uso do GoatSNP50 (já aplicado em Marota e Anglo-Nubiana, ver Q5) é o que permite ligar dados locais às referências internacionais (inferência).

### Gaps
- Nome e número de SNPs do painel >70 K citado por Kang et al. 2026 [não verificado].
- Acurácia de imputação de painéis de 5–15 K para 50 K em caprinos leiteiros: não encontrada nas fontes lidas.
- Dong et al. 2013 (sequenciamento do genoma caprino, CHI1) e a publicação principal do VarGoats não foram verificados no Crossref.
- Há um preprint de 2026, "Goat genome assemblies, nine breeds for pangenome contribution" (DOI 10.64898/2026.10.08.757565), não revisado por pares. Não foi lido.

---

## Q2. Avaliação genômica francesa (Alpine e Saanen)

### Takeaway
A avaliação genômica francesa passou de dois passos (DYD + GBLUP) para ssGBLUP multi-raça (Carillier et al. 2014). O ssGBLUP entrou na avaliação oficial em 2017 (Teissier et al. 2018). Depois vieram o ssGBLUP ponderado (wssGBLUP) e a inclusão do gene αs1-caseína. Os ganhos de acurácia medidos são de dezenas de pontos percentuais em relação ao pai médio para candidatos, e de poucos pontos em relação ao PBLUP para proteína.

### Cited Findings
- Dois passos vs. ssGBLUP: "The single-step approach improved prediction accuracy of candidates from 22 to 37% for both breeds compared to the two-step method." — [Carillier et al. 2014, GSE](https://doi.org/10.1186/s12711-014-0067-3) (resumo). Antes, com dois passos, a acurácia dos candidatos "did not outperform that of the parental average" (mesmo resumo).
- Referência: 677 machos progeny-tested e 148 candidatos sem progênie (86 Alpine e 62 Saanen) — Carillier et al. 2014 (Methods). O artigo afirma que a população francesa de caprinos genotipados é "the largest worldwide", com cerca de 900 machos (Background).
- Pai médio: acurácia média de 0,63 para produção de leite, citada pelo artigo de 2014 como "[3]", que é Carillier et al. 2013 — [Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3) (Background).
- Intervalo de gerações no caminho pai-filho com teste de progênie: 5,5 anos (citado em Carillier et al. 2014, Background) — o argumento central para genotipar machos ao nascer.
- Modelos comparados (Carillier et al. 2014, Results): multi-breed, within-breed e multiple-trait com ρ = 0; 0,99 ou estimado. Correlação entre DYD e GEBV em 252 machos de validação (Table 3, coluna multi-breed): leite 0,43; gordura 0,44; proteína 0,33; teor de gordura 0,61; teor de proteína 0,70; SCS 0,47; posição do úbere 0,59; rear udder attachment 0,64; teat angle 0,61. O within-breed foi ligeiramente maior, exceto para proteína (−1%) e teat angle (−3%). O maior ganho foi na proteína (+9%).
- Acurácia de modelo (Figure 1, 148 candidatos): de 0,54 (fore udder, within-breed) a 0,74 (fat e protein content, multi-breed). Observação: o mesmo texto diz que "the highest accuracies (on average 0.5 and 0.56 for fat and protein content, respectively)". Os valores não batem. [não verificado — inconsistência interna na fonte].
- Os modelos multi-breed deram as melhores acurácias para leite. O modelo multiple-trait com ρ = 0,99 deu as melhores para SCS e tipo de úbere (Carillier et al. 2014, Results e Conclusions). A conclusão do artigo: "The most convenient model for genomic evaluation in French dairy goats would be the multi-breed model using a single-step approach."
- Correlação genética Alpine–Saanen: de 0,45 (leite) a 0,76 (posição do úbere) (Carillier et al. 2014, Results).
- Explicação dada pelos autores para o bom resultado do within-breed: "A major gene or causal mutation specific to each breed (DGAT1 and casein variant) could explain the good results obtained for the within-breed model" (Conclusions).
- Equações de Carillier et al. 2014: modelo (eq. 1) `\mathbf{y}=\mathbf{X}\boldsymbol{\upbeta } +\mathbf{Z}\mathbf{u}+\mathbf{W}\mathbf{p}+\mathbf{e}`; matriz H (eq. 2) em blocos, com `\mathbf{A}_{11}+\mathbf{A}_{12}\mathbf{A}_{22}^{-1}(\mathbf{G}-\mathbf{A}_{22})\mathbf{A}_{22}^{-1}\mathbf{A}_{21}` no canto superior esquerdo, `\mathbf{A}_{12}\mathbf{A}_{22}^{-1}\mathbf{G}` no superior direito, `\mathbf{G}\mathbf{A}_{22}^{-1}\mathbf{A}_{21}` no inferior esquerdo e `\mathbf{G}` no inferior direito; G (eq. 3) `\mathbf{G}=\frac{\mathbf{M}{\mathbf{M}}^{\mathbf{\prime}}}{2{\displaystyle \sum_{\mathrm{j}=1}^{\mathrm{p}}{\mathrm{q}}_{\mathrm{j}}\left(1-{\mathrm{q}}_{\mathrm{j}}\right)}}`. Os autores também corrigiram a G para as diferenças de frequência alélica entre a população-base e os genotipados (Christensen).
- Teissier et al. 2018 (GSE) — [doi:10.1186/s12711-018-0400-3](https://doi.org/10.1186/s12711-018-0400-3). ssGBLUP foi implementado na avaliação oficial em 2017. Dados: 2.955 animais genotipados (50 K), 7.202 genotipados no locus αs1 e 6.767.490 fêmeas com fenótipo. Referência: 905 touros, sendo 554 de treinamento (nascidos de 1993 a 2007; 307 Alpine e 247 Saanen) e 351 de validação (nascidos de 2008 a 2012; 205 Alpine e 146 Saanen). A acurácia é a correlação de Pearson entre GEBV e DYD. [Não é acurácia de modelo.] Resultados (multi-breed / Alpine / Saanen): PBLUP 0,72 / 0,71 / 0,66; ssGBLUP 0,77 / 0,76 / 0,73; gene content 0,76 / 0,76 / 0,72; WssGBLUP 0,79 / 0,78 / 0,77. O ssGBLUP melhorou de 5 a 7 pontos percentuais sobre o PBLUP; o WssGBLUP melhorou até 6 pontos sobre o ssGBLUP. O ganho do WssGBLUP sobre o ssGBLUP foi significativo para a Saanen (+4 pontos, teste de Hotelling-Williams).
- Equações de Teissier et al. 2018: modelo (eq. 1) igual ao de 2014. G (eq. 3): `G=0.95M'M/(2\sum_{i=1}^{m}p_i(1-p_i))+0.05A_{22}`. Peso SNP (eq. 4): `\hat{a}=DM'(MDM')^{-1}\hat{u}_g` (parênteses reconstruídos do TeX truncado). Variância por SNP (eq. 5): `\sigma^2_{u,i}=2\hat{a}_i^2 p_i(1-p_i)`. G* (eq. 6): `G^*=0.95M'DM/(2\sum_{i=1}^{m}p_i(1-p_i))+0.05A_{22}`.
- Os cerca de 50 SNPs com maior peso no WssGBLUP ficaram no cromossomo 6 (multi-breed 71–86 Mb; Alpine 64–101 Mb; Saanen 71–92 Mb). Os autores ligam essa região ao locus da αs1-caseína e a uma região descrita por Martin et al. (QTL em 82,5–82,8 Mb). Teissier et al. 2018, Results.
- Teissier et al. 2019 (JDS, doi:10.3168/jds.2018-15650). Dados: 2.955 genotipados e 2.543.680 animais de pedigree. Validação com 205 Alpine e 146 Saanen nascidos de 2009 a 2012. "For traits with unknown QTL, weighted ssGBLUP was less accurate than, or as accurate as, ssGBLUP. For traits with identified QTL (i.e., QTL only present in the Saanen breed), weighted ssGBLUP outperformed ssGBLUP by between 2 and 14%." (resumo). Os autores afirmam que o ssGBLUP "assumes that all SNP explain the same amount of genetic variance, which is unlikely in the case of traits whose major genes or QTL are segregating."
- Teissier et al. 2020 (JDS, doi:10.3168/jds.2020-18662). Compara ssGBLUP e WssGBLUP com SNPs individuais ou haplótipos como pseudo-SNP (resumo lido; números não extraídos).
- Arnal et al. 2023 (JDS, doi:10.3168/jds.2022-22550). ssGBLUP em modelo de regressão aleatória (test-day) para produção de leite em Saanen na França. Dados: 7.904.246 registros de controle diário, 1.308.307 lactações, 2000–2017. Validação com machos candidatos. Os resultados de acurácia não foram extraídos.
- Capgenes (2019, arquivo local, origem não documentada: `.../fontes/caprinos/capgenes_plaquette_genomique_2019.pdf`). Material de divulgação francês que lista como serviços "Jeunes boucs génomiques", "Déploiement progressif de la génomique", "Évaluation génomique internationale" e "entretien de la population de référence". Não traz números de acurácia.

### Inferences
- A opção operacional francesa é o ssGBLUP multi-raça. O WssGBLUP tem ganho pequeno (cerca de 2 a 6 pontos percentuais), concentrado em traços com gene de grande efeito conhecido e segregando nas raças envolvidas (Teissier et al. 2018, 2019).
- O ganho do ssGBLUP sobre o PBLUP depende de usar as fenotipagens de fêmeas não genotipadas (6,77 milhões no estudo de 2018) junto com as 2.955 genotipadas. Essa é uma inferência a partir dos números do artigo, e não é um resultado testado separadamente.
- As acurácias não são diretamente comparáveis entre estudos. Carillier et al. 2014 usam acurácia de modelo (148 candidatos) e Teissier et al. 2018 usam correlação com DYD. São métricas diferentes.
- Quanto ao esquema de reprodutores (AI buck scheme): as fontes lidas mostram o mecanismo (seleção de machos ao nascer e teste de progênie reduzido), mas não quantificam a mudança no intervalo de gerações nem no ganho genético do esquema francês.

### Gaps
- Acurácias exatas de Carillier et al. 2013 (resumo truncado) [não verificado].
- Valores de acurácia de Teissier et al. 2019 e 2020 e de Arnal et al. 2023 (texto integral não lido; artigos sem acesso aberto nesta sessão).
- Quantificação do ganho genético ou do intervalo de gerações sob genômica no esquema francês de caprinos [não verificado].
- O modelo de haplótipos de Teissier et al. 2020, com equações e números [não verificado].

---

## Q3. Noruega e outros países (Espanha, Itália, Reino Unido, EUA; Nova Zelândia como referência de pequena população)

### Takeaway
Nas fontes lidas, não há avaliação genômica operacional de caprinos leiteiros na Noruega; o que existe é um estudo de SNPs de caseína (Dagnachew et al. 2011). O exemplo mais útil de população pequena é o rebanho misto da Nova Zelândia (Scholtens et al. 2021), com 388 de 839 cabras genotipadas. Espanha, Itália e Reino Unido têm estudos de GWAS, ROH e CNV, mas não de avaliação genômica. Não encontrei estudo de avaliação genômica nos EUA.

### Cited Findings
- Noruega: [Dagnachew et al. 2011, GSE, doi:10.1186/1297-9686-43-31](https://doi.org/10.1186/1297-9686-43-31). Foram genotipadas 575 cabras para 38 SNPs nos quatro genes de caseína. Modelos de medidas repetidas com efeitos aditivos e de dominância, incluindo efeito poligênico. Resultados: efeitos aditivos significativos de SNPs em CSN1S1 e CSN3 para % de gordura, % de proteína, produção de leite e sabor do leite. Uma deleção no éxon 12 de CSN1S1 tem frequência de 0,73 e foi "reported only in Norwegian goats". O alelo com a deleção tem efeitos de dominância e sobredominância sobre proteína e gordura. Os autores concluem que a inclusão de informação molecular no programa nacional reduzirá a frequência da deleção.
- Norway, autor citado pelo usuário: a busca por "Nordbø Ø" no Europe PMC retornou apenas um artigo de 2023 sobre transcriptômica (não relacionado). [Nordbø et al., avaliação genômica] não encontrado [não verificado].
- Nova Zelândia: [Scholtens et al. 2021, Animals 11(1):24, doi:10.3390/ani11010024](https://doi.org/10.3390/ani11010024), "Advantage of including Genomic Information to Predict Breeding Values for Lactation Yields of Milk, Fat, and Protein or Somatic Cell Score in a New Zealand Dairy Goat Herd". Dados: 839 cabras (registros de lactação de 305 dias, safra de 2016), 388 genotipadas com Caprine 50K, 41.981 SNPs após controle de qualidade. Modelo: single-step BayesC (ssBC). Acurácias: EBV (PBLUP) 0,20–0,22; GBV 0,34–0,43; "Accuracies of GBVs were up to 103% greater than EBVs." O resumo diz também que a maior vantagem da predição genômica foi para indivíduos sem [o texto está truncado na extração].
- Espanha (Murciano-Granadina): [Guan et al. 2020, GSE, "A genome-wide analysis of copy number variation in Murciano-Granadina goats", doi:10.1186/s12711-020-00564-4](https://doi.org/10.1186/s12711-020-00564-4). Título verificado; resumo não lido. [Genes 2020, "Integrating Casein Complex SNPs Additive, Dominance and Epistatic Effects on Genetic Parameters and Breeding Values...", doi:10.3390/genes11030309](https://doi.org/10.3390/genes11030309). Título verificado; resumo não lido.
- Itália (Sardenha): [Pegolo et al. 2025, JASB, doi:10.1186/s40104-025-01155-3](https://doi.org/10.1186/s40104-025-01155-3). Genotipados 480 caprinos de cinco raças (Saanen, Camosciata delle Alpi, Murciano-Granadina, Maltese e Sarda). ROH detectados: 10.341 (SAA), 11.063 (CAM), 12.250 (MUR), 8.939 (MAL) e 18.441 (SAR). O FROH foi menor na Saanen e maior na Maltese. Genes candidatos em ROH incluem DGAT1 e B4GALT1. Também citado: [Italian goat breeds, medium-density SNP chip, Genetics Selection Evolution 2015, doi:10.1186/s12711-015-0140-6](https://doi.org/10.1186/s12711-015-0140-6). Título verificado, resumo não lido.
- Reino Unido: [Mucha et al. 2018, JDS, "Genome-wide association study of conformation and milk yield in mixed-breed dairy goats", doi:10.3168/jds.2017-12919](https://doi.org/10.3168/jds.2017-12919). 137.235 registros de produção de leite em 4.563 cabras; 2.381 genotipadas com o Illumina Caprine 50K. Análise por GWAS (MLMM) com pseudo-fenótipos (DBV e pseudo-EBV). É um estudo de GWAS, não de avaliação genômica.
- Canadá, França, Itália e Suíça: [Teissier et al. 2022, Front Genet, "Genetic Characterization and Population Connectedness of North American and European Dairy Goats", doi:10.3389/fgene.2022.862838](https://doi.org/10.3389/fgene.2022.862838). Avalia a conectividade genética e a estrutura de Alpine e Saanen de quatro países do projeto europeu SMARTER. O resumo menciona o Canadá, não os EUA.
- Parâmetros genéticos de Alpine e Saanen na América do Norte e na Europa: [Teissier et al. 2024, JDSC, doi:10.3168/jdsc.2023-0389](https://doi.org/10.3168/jdsc.2023-0389). Título verificado, resumo não lido. Não há confirmação nas fontes lidas de dados dos EUA.

### Inferences
- A conectividade genética entre países (Teissier et al. 2022) é a pré-condição para usar referências compartilhadas. O resumo fala em viabilidade de avaliação "acr[oss]…", texto truncado.
- Na Nova Zelândia, um rebanho de 388 genotipados com ssBC produziu acurácia de GBV de 0,34–0,43, acima dos 0,20–0,22 do EBV. É o exemplo mais direto de ganho em população pequena nas fontes lidas. A comparação com os números franceses não é direta: é um rebanho misto, com outro modelo (BayesC) e outra estrutura.

### Gaps
- Noruega: nenhum artigo de avaliação genômica operacional encontrado. A referência a Nordbø et al. não foi confirmada [não verificado].
- EUA: nenhum estudo de avaliação genômica encontrado nas fontes lidas [não verificado].
- Espanha e Itália: os resumos de Guan et al. 2020, da Genes 2020 e de Pegolo et al. 2025 foram lidos parcialmente ou não foram lidos. A parte de predição genômica desses estudos não foi verificada.
- Reino Unido: sem medida de acurácia genômica.

---

## Q4. Pequenas populações: acurácia esperada (Ne e N), genotipagem de fêmeas, multi-raça, controle de endogamia e ROH

### Takeaway
Nas fontes lidas, a limitação de referência aparece como um fato medido. Os próprios autores franceses dizem que a acurácia não deve chegar aos níveis da bovinocultura por causa do tamanho e da estrutura da população. A fórmula teórica (Daetwyler; Goddard) não foi lida: [não verificado]. O que existe é evidência empírica para ssGBLUP com fenótipos de fêmeas, pooling entre raças e cuidado com a superdispersão dos GEBV.

### Cited Findings
- Carillier et al. 2014 (Introdução): "Considering the relatively small sample size and the genetic structure of this population, the prediction accuracy of GEBV is not expected to be as high in these populations as in dairy cattle." Também: os fatores são número de indivíduos, Ne, LD, endogamia, parentesco com a população de referência e herdabilidade (refs. 6–8 do artigo). Número de fundadores efetivos: 191 (Alpine) e 124 (Saanen) — [Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3), citando a referência [2] do próprio artigo.
- Carillier et al. 2014: a estrutura da população de referência "could not be optimized by either genotyping other males because all progeny-tested males were genotyped or by choosing in the reference population the highly related males because of its size."
- Carillier et al. 2013 (JDS): o desenho comparou tamanhos de população de referência, "including or excluding female genotypes (from 67 males to 677 males, and 1,985 females)" — [Carillier et al. 2013](https://doi.org/10.3168/jds.2013-6789). O efeito isolado da genotipagem de fêmeas não aparece no resumo lido [não verificado].
- Teissier et al. 2018: a referência cresceu de 823 animais (Carillier-Jacquin et al. 2016) para 905. Os autores atribuem o pequeno ganho a esse aumento, "a well-known factor" (Discussion). A genotipagem de 82 machos e 2.050 fêmeas foi acrescentada, segundo o texto.
- Carillier-Jacquin et al. 2016: menos de 1% das fêmeas fenotipadas foi genotipada no locus αs1. Isso limitou o ganho da abordagem baseada em fêmeas (ver Q6).
- Zhang et al. 2024 (revisão, [doi:10.3390/ani14182659](https://doi.org/10.3390/ani14182659)): "larger population size leads to higher accuracy"; a razão de sexos na referência tem um ponto ótimo, com aumento razoável elevando e redução excessiva derrubando a acurácia. A revisão diz que a pesquisa em caprinos "is not yet complete". Atenção: a mesma revisão cita Carillier como tendo usado "20,705 bucks and 1946 does" para diferentes tamanhos de referência. Esse número contradiz Carillier et al. 2014, que tem 677 machos progeny-tested na referência e 825 genotipados. [Conflito entre fontes; o número da revisão não foi verificado.]
- Carillier et al. 2014 (Results): a regressão de DYD sobre GEBV foi menor que 1 para quase todas as características, o que indica superdispersão dos GEBV. Isso é apontado como um problema prático, em especial no modelo multi-breed.
- Carillier et al. 2014 (Results): o modelo multi-breed deu as melhores acurácias para leite; o modelo within-breed foi menor porque "the small size of the reference population of each breed". A intuição dos autores é que pooling entre raças ajuda quando a população de cada raça é pequena.
- Scholtens et al. 2021: "The average prediction accuracies ranged from 0.20 to 0.22 for EBVs and 0.34 to 0.43 for GBVs" (388 genotipados de 839).
- Kang et al. 2026 (revisão): os desafios incluem construção da população de referência, imputação, manejo de endogamia com Optimum Contribution Selection (OCS) e integração multi-ômica. [Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954).
- Teórico, não lido: [Daetwyler et al. 2008, PLoS ONE 3:e3395, doi:10.1371/journal.pone.0003395](https://doi.org/10.1371/journal.pone.0003395); [Daetwyler et al. 2010, Genetics 185:1021–1031, doi:10.1534/genetics.110.116855](https://doi.org/10.1534/genetics.110.116855). Os DOIs foram verificados no Crossref, mas o texto não foi lido, então a fórmula de acurácia em função de Ne e N não está citada aqui. Goddard (2009) não foi verificado no Crossref [não verificado]. [Elsen 2016, GSE, doi:10.1186/s12711-016-0183-3](https://doi.org/10.1186/s12711-016-0183-3): acurácia aproximada quando referência e candidatos são aparentados. Título verificado, não lido.

### Inferences
- Pela ordem de grandeza dos números franceses (677 a 905 animais de referência, acurácias de modelo 0,54–0,74 e correlações de 0,33–0,79), a referência de algumas centenas de animais com fenótipo de progênie já produz acurácias úteis para seleção. Uma previsão quantitativa por Ne exigiria a fórmula, que não foi lida.
- O ssGBLUP usa fenótipos de fêmeas não genotipadas, o que aumenta a informação efetiva da referência sem genotipar mais animais. É uma leitura dos números de Teissier et al. 2018, e não um efeito medido isoladamente.
- O pooling entre raças, que funcionou na França entre Alpine e Saanen, relacionadas e com a mesma origem, pode não valer para raças brasileiras locais com menor parentesco. É uma inferência a partir de Carillier et al. 2014, que não testou raças não relacionadas.
- A genotipagem de fêmeas e de machos não progênie é, pelo que os autores descrevem, a alavanca disponível quando todos os machos já estão genotipados.

### Gaps
- Fórmula de acurácia em função de Ne e N (Daetwyler et al. 2008, 2010; Goddard 2009) não lida: [não verificado].
- Efeito isolado da genotipagem de fêmeas sobre a acurácia: não extraído do resumo de Carillier et al. 2013 e não encontrado no texto de 2014.
- Manejo de endogamia com matriz genômica em caprinos leiteiros: nenhuma fonte lida tratou disso com números.
- Valor da genotipagem de fêmeas em caprinos, com medida quantitativa: não encontrado.

---

## Q5. Brasil: estudos genômicos em caprinos leiteiros e de dupla aptidão

### Takeaway
A literatura genômica caprina brasileira encontrada nesta sessão é pequena. O estudo mais direto é de Diniz Sobrinho et al. (2026), que usou o GoatSNP50 em Marota e Anglo-Nubiana para ROH e endogamia. Não encontrei avaliação genômica (GBLUP ou ssGBLUP) em caprinos leiteiros brasileiros nas fontes lidas. A busca no OpenAlex, que cobriria Embrapa, UFV, USP e UFRPE, falhou por limite de taxa (HTTP 429) em duas tentativas, com espera entre elas.

### Cited Findings
- [Diniz Sobrinho et al. 2026, Front Biosci-Scholar 18:43536, doi:10.31083/fbs43536](https://doi.org/10.31083/fbs43536), "Genomic Analysis Revealed Hotspots of Genetic Adaptation and Risk of Disappearance in Brazilian Goat Populations". Foram avaliados 192 animais de três rebanhos, Marota e Anglo-Nubiana, com o Illumina Goat SNP50 BeadChip. Foram identificados 22.872 ROH, além de regiões de heterozigosidade (HRR) e FROH. Os autores afirmam que "In Brazil, little is known about these genomic parameters in Marota goats." Há um preprint de 2024 com título semelhante, [doi:10.1101/2024.06.03.597192](https://doi.org/10.1101/2024.06.03.597192).
- [Castillo Cevallos et al. 2026, Genes 17:566, doi:10.3390/genes17050566](https://doi.org/10.3390/genes17050566), "Landscape Genetics Reveals Geographic Structuring of Locally Adapted Goat Populations from Brazil...". Título verificado; resumo não lido.
- [Mucopolysaccharidosis IIID and Beta-Mannosidosis in Brazilian Anglo-Nubian Goats, doi:10.1002/age.70107](https://doi.org/10.1002/age.70107) (2026). Título verificado; não lido. Relevante só como indicação de genotipagem de Anglo-Nubiana no Brasil.
- Arquivos locais já presentes em `fontes/caprinos` com nomes brasileiros (Capragene, Embrapa, UFV, UFPR, UFC, SciELO): `capragene_eval_brazilian_2014.pdf`, `capragene_sumario_saanen_2017.pdf` e outros. Não foram lidos nesta sessão e não têm URL de origem registrada. Candidatos a leitura posterior, pois o nome sugere avaliação genética brasileira.

### Inferences
- O uso do GoatSNP50 no Brasil (Diniz Sobrinho et al. 2026) é o que permite comparar os dados com as referências internacionais (IGGC, VarGoats) e com as avaliações francesas.
- Com 192 animais de três rebanhos, o estudo brasileiro de ROH tem amostra pequena. Serve como descritivo de endogamia, não como base para avaliação genômica.

### Gaps
- Nenhuma avaliação genômica (GBLUP ou ssGBLUP) para caprinos leiteiros brasileiros encontrada nas fontes lidas.
- Saanen, Alpina, Toggenburg e raças locais (Moxotó, Canindé) em estudos genômicos: sem resultado nas fontes lidas. A busca no OpenAlex falhou por limite de taxa.
- Embrapa Caprinos e Ovinos, UFV, USP e UFRPE: sem resultado genômico verificado nesta sessão.

---

## Q6. Genes de grande efeito: CSN1S1 (αs1-caseína), uso na seleção e modelos genômicos

### Takeaway
O locus CSN1S1 tem efeito grande e bem documentado sobre o teor de proteína, com efeito menor sobre gordura e produção de leite. Na França, o genótipo αs1 entra nas avaliações genômicas de três formas: efeito fixo em machos genotipados, modelo multi-alelo (gene content) e pesos por SNP (WssGBLUP). O ganho de acurácia medido é pequeno (1–14% em Carillier-Jacquin et al. 2016) e é limitado pelo número de animais com genótipo αs1. O efeito sobre rendimento queijeiro não foi encontrado nas fontes lidas.

### Cited Findings
- Efeito do αs1 sobre produção (Carillier-Jacquin et al. 2016, [doi:10.1186/s12711-016-0233-x](https://doi.org/10.1186/s12711-016-0233-x), GSE): "The αs1casein genotype had a highly significant effect on protein and fat contents, with R-squared statistics between 0.11 and 0.20 for fat content and between 0.23 and 0.33 for protein content" (Results). Variância fenotípica explicada: teor de proteína 24,4% (Saanen) e 38,2% (Alpine); teor de gordura 8,7% (Saanen) e 18,2% (Alpine); produção de leite 3,3% (Saanen) e 6,1% (Alpine).
- Teissier et al. 2018 (introdução): o locus αs1 "explains about 40% of the genetic variation in protein content".
- Classes de genótipo (Carillier-Jacquin et al. 2016, Results; Table 2): forte (AA, AB, AC, BB, BC) com efeito até 1,5 g/kg; intermediário (AE, AF, BE, BF, CE, CF) com efeito de 0,5 a 1,5 g/kg; fraco (EE, EF) com efeito até 0,5 g/kg. Na Saanen, o efeito estimado foi de 3,7 (BC) a −0,9 g/kg (EF). Os autores usam as categorias forte/intermediário/fraco. Não aparece a classe "null" nas fontes francesas.
- Frequências na França (Teissier et al. 2018, Results): AA é 49% na Alpine e 7% na Saanen; EE é 3% na Alpine e 32% na Saanen; AE é 49% na Saanen e 30% na Alpine. O alelo C é raro (<5%) nas duas raças.
- Uso na seleção: Carillier-Jacquin et al. 2016 (Results) dizem que as frequências de αs1 não eram reportadas "since selection on the genotypes of males and dams of bucks was introduced" (ref. 24 do artigo). Ou seja, a França já seleciona por genótipo αs1 de machos e de mães de machos. O artigo não descreve a regra de seleção nem o peso dado ao genótipo.
- Imputação do genótipo αs1 de fêmeas: o método de peeling iterativo deu frequências muito diferentes das observadas. Por exemplo, AA: 32% observado e 83% predito na Alpine. (Carillier-Jacquin et al. 2016, Results.)
- Métodos de inclusão (Carillier-Jacquin et al. 2016 e Teissier et al. 2018):
  - Efeito fixo do genótipo αs1 em machos genotipados: acurácias melhoram de 6% a 27%.
  - Gene content multi-alelo, com probabilidades de genótipo (peeling iterativo) para fêmeas sem genótipo: ganho de 1% a 14% sobre o modelo sem αs1.
  - Teissier et al. 2018: gene content ficou praticamente igual ao ssGBLUP (0,76 vs 0,77, multi-breed). O WssGBLUP deu 0,79. O TABLUP com os 5.000 SNPs mais associados deu 0,74, e com 20.000 deu 0,77, igual ao ssGBLUP.
  - O resumo de Teissier et al. 2018 (introdução) resume o gene content como melhor que o ssGBLUP em +8 a 14% para Alpine e Saanen. Esse número conflita com o próprio resultado do artigo, que mostra gene content igual ao ssGBLUP, e com o resumo de Carillier-Jacquin, que diz +3 (multi), +5 (Alpine) e +11 (Saanen) segundo Teissier et al. 2018, Introdução. [Conflito interno; os números não foram reconciliados.]
- Equações de Carillier-Jacquin et al. 2016:
  - Modelo para DYD (eq. 1): `DYD = Xβ + Zu + Ts + e`, com `T` e `s` como definidos no artigo. A eq. 2 é `DYD = Xβ + Zu + e` (sem o efeito αs1).
  - G com blend (eq. 3): `G = 0.95 × MM' / (2Σ_{j=1}^{p} q_j(1−q_j)) + 0.05 × A`.
  - Modelo multi-alelo (eq. 5b): `y_1 = X_1 β_1 + z_A α_A + z_B α_B + z_C α_C + z_E α_E + z_F α_F + z_O α_O + Z_1 ε + WZ_1 p_1 + e_1`.
  - Covariância do efeito genético (eq. 8): `Var(u_1) = H σ²_{u_1} = H[σ²_ε + 2Σ_i p_i q_i α_i² − 2Σ_i Σ_{j≠i} p_i q_j α_i …]` (truncado na extração).
- Equações de gene content em Teissier et al. 2018 (modelo 2): `y_A = μ_A + Z_A u_A + e_A`, …, `y_O = μ_O + Z_O u_O + e_O`, com `Var(u_i) = H σ²_{u_i}` e `σ²_{u_i} = 2 p_i(1−p_i)` (texto do artigo, Methods, "Gene content method").
- Carillier et al. 2014 (Conclusions): "A major gene or causal mutation specific to each breed (DGAT1 and casein variant) could explain the good results obtained for the within-breed model." Teissier et al. 2018 (Introdução): "Several major genes have been identified, such as DGAT1 for fat content…" (texto truncado).
- Noruega: a deleção no éxon 12 de CSN1S1 tem frequência de 0,73, com efeitos de dominância e sobredominância ([Dagnachew et al. 2011](https://doi.org/10.1186/1297-9686-43-31)).
- Literatura adicional, só título verificado: [Mestawet et al. 2013, JDS, "Newly identified mutations at the CSN1S1 gene in Ethiopian goats affect casein content and coagulation", doi:10.3168/jds.2012-6467](https://doi.org/10.3168/jds.2012-6467); [Berget et al. 2010, JDS, "Caprine CSN1S1 haplotype effect on gene expression and milk composition", doi:10.3168/jds.2009-2854](https://doi.org/10.3168/jds.2009-2854); [Cosenza et al. 2025, Genes 16:1011, "CSN1S1 and CSN1S2: Two Remarkable Examples of Genetically Modulated Alternative Splicing…", doi:10.3390/genes16091011](https://doi.org/10.3390/genes16091011).

### Inferences
- O efeito de αs1 é grande para proteína e menor para gordura e leite, e isso justifica tratar o locus como gene de grande efeito. O ssGBLUP, que assume que todos os SNPs têm a mesma variância, não capta isso bem (Teissier et al. 2019).
- O limite principal é o número de animais com genótipo conhecido: menos de 1% das fêmeas fenotipadas (Carillier-Jacquin et al. 2016). Como o ganho de acurácia do modelo com gene content foi maior nos animais genotipados do que nos não genotipados, a genotipagem αs1 de mais fêmeas é a alavanca mais direta. Esta é uma inferência a partir das conclusões dos autores.
- Em populações pequenas, um gene de grande efeito conhecido em poucos animais pode ter mais valor do que mais SNPs sem genótipo do gene. É uma inferência não testada nas fontes lidas.
- Para caprinos brasileiros, a frequência dos alelos αs1 nas raças locais não foi encontrada nas fontes lidas. Sem essa frequência, o modelo de gene content não pode ser parametrizado.

### Gaps
- Efeito de CSN1S1 sobre rendimento queijeiro (cheese yield) em caprinos: não encontrado nas fontes lidas [não verificado]. O artigo de [Vacca et al. 2020, JDS, doi:10.3168/jds.2019-16424](https://doi.org/10.3168/jds.2019-16424) trata de rendimento de queijo caprino e de recuperação de gordura, proteína e sólidos na coalhada. Só o título e a página inicial foram lidos (arquivo local `.../fontes/caprinos/vacca_jds2019_mcp_cheese_yield.pdf`). Não se sabe se ele trata do genótipo αs1.
- Classe "null" de αs1 nas fontes francesas: não reportada como tal. A deleção do éxon 12 descrita por Dagnachew et al. 2011 não é descrita como nula no resumo [não verificado].
- Equação completa de `Var(u_1)` em Carillier-Jacquin et al. 2016 (truncada na extração).
- Frequências de αs1 e resultados de gene content em caprinos brasileiros e em outros países: não encontrados.
- Regra exata de seleção por genótipo αs1 na França (critérios para machos e mães de machos, peso no índice): não descrita nas fontes lidas.
