# Genômica e avaliação internacional em bovinos leiteiros

**Escopo e método.** Notas para o redator do relatório "Avaliação genética de bovinos leiteiros". Pesquisa feita em 14/10/2026 com 24 buscas via WebSearch (modos standard e extended). WebFetch e requisições HTTP não funcionam neste ambiente, então todo o conteúdo vem de trechos e resumos de busca, não da leitura integral dos artigos. Consequências:

- **Equações não copiadas das fontes primárias.** Nenhuma notação matricial foi extraída de artigo lido. As fórmulas abaixo estão marcadas como "[não verificado]" (reconstruídas de memória) ou como "resumo de busca" (trecho recuperado, a conferir). Antes de reproduzir qualquer equação no relatório, conferir no artigo original.
- **"(resumo de busca)"** indica que o dado veio de trecho recuperado pela busca, sem leitura do texto completo.
- Autores ou DOI que não apareceram nos resultados estão marcados "[não verificado]" ou omitidos.
- Como o guia de pesquisa sugere cerca de 10 a 15 chamadas, 24 buscas ficaram acima do esperado, mas os sete temas e a exigência de cobrir Brasil e exterior justificam o volume.

---

## 1. História e método da avaliação genômica nos EUA (USDA-AIPL/CDCB, 2009) e status single-step até 2026

### Takeaway
A avaliação genômica oficial dos EUA começou em janeiro de 2009 no modelo multi-step: PTAs/DYDs deregressados de animais com registro viram variável resposta para os efeitos de SNP, e o valor genômico resultante é combinado com a PTA tradicional. Pelo que foi encontrado, a página de pesquisa do CDCB (data não identificada na busca) descreve a abordagem atual como multi-step, com trabalho em ssBLUP iniciado em janeiro de 2023 e um protótipo bem testado previsto para o fim de 2026. Não encontrei anúncio de data de virada para single-step.

### Cited Findings
- **Referência primária.** VanRaden PM et al. 2009. "Invited review: Reliability of genomic predictions for North American Holstein bulls." J. Dairy Sci. 92:16-24. PDF: [aipl.arsusda.gov/publish/jds/2009/92_16.pdf](https://aipl.arsusda.gov/publish/jds/2009/92_16.pdf). O DOI 10.3168/jds.2008-1514 aparece só em resumo de busca; conferir.
- **Desenho de validação.** Genótipos de 38.416 SNPs do chip Illumina BovineSNP50 em 5.335 touros Holandês (resumo de busca de [IB2008, VanRaden et al.](https://aipl.arsusda.gov/publish/submit/IB2008-vanraden.pdf)). Previsão de 1.759 touros nascidos em 1999-2002 usando 3.576 touros nascidos antes de 1999, com dados de agosto de 2003 (mesma fonte, resumo de busca).
- **Genotipar mais touros vale mais que mais marcadores.** Segundo o resumo do artigo de 2009, dobrar o número de touros genotipados aumenta mais a confiabilidade do que dobrar o número de marcadores ([JDS 2009](https://aipl.arsusda.gov/publish/jds/2009/92_16.pdf), resumo de busca).
- **Modelo linear e modelo não linear (2009).** O artigo compara um modelo linear, em que os efeitos de marcador têm distribuição normal, com um modelo não linear de prior de cauda mais pesada, para capturar genes de efeito maior ([JDS 2009](https://aipl.arsusda.gov/publish/jds/2009/92_16.pdf), resumo de busca). Um valor de "50% vs 27%" apareceu em busca, mas não foi confirmado.
- **Confiabilidade de touros jovens (2008).** Para o índice líquido de touros jovens, confiabilidade de 63% com a abordagem genômica contra 32% com a matriz de parentesco tradicional. O ajuste não linear acrescenta cerca de 3%, chegando a 66% (VanRaden 2008, [JDS 91:4414-4423](https://aipl.arsusda.gov/publish/jds/submit/jdsabstr_genomiccomputations_pvr.html); [PubMed 18946147](https://pubmed.ncbi.nlm.nih.gov/18946147/), resumo de busca). O resumo menciona dados simulados (2.967 touros e 50.000 marcadores). Não ficou claro qual conjunto gera o número de 63%.
- **Status do ssBLUP no CDCB.** "Single-step (ssBLUP) work started in January 2023 ... Currently targeting by the end of 2026, a well-tested prototype ... for evaluation and decisions related to implementation." A página também diz que a abordagem multi-step atual não usa todos os dados disponíveis e que as tendências genéticas tendem a ser subestimadas ([CDCB Research](https://uscdcb.com/research), resumo de busca).
- **Mudanças recentes na avaliação multi-step do CDCB.**
  - Abril de 2024: UPGs (unknown-parent groups) estrangeiros e domésticos foram combinados. Correlações entre PTAs antes e depois acima de 0,9997, exceto EFC ([CDCB April 2024](https://uscdcb.com/april-2024-evaluation-changes-whats-new/), resumo de busca).
  - Abril de 2025: mudança de base genética de vacas nascidas em 2015 para vacas nascidas em 2020. Os traços de parto foram adiados para agosto de 2025 ([CDCB August 2025](https://uscdcb.com/august-2025-evaluation-changes-whats-new/); [apresentação WDMC 2025](https://uscdcb.com/wp-content/uploads/2025/04/WDMC2025-McWhorter.pdf), resumo de busca).
  - Junho de 2025: anúncio de integração de dados de genotipagem por sequenciamento. O resumo cita cerca de 11 milhões de genótipos no National Cooperator Database. Artigo não lido, fonte exata não identificada ([arquivo CDCB](https://uscdcb.com/author_category/cdcb/)).
  - Agosto de 2026: novos traços de saúde de bezerros, fertilidade revisada, e PTAs de DIA e RSP incluídos nas avaliações nacionais de Holandês e Jersey, machos e fêmeas ([CDCB August 2026 Evaluation Recap](https://uscdcb.com/august-2026-evaluation-recap/), resumo de busca).
- **Estrutura do multi-step (sem confirmação de fonte nesta busca).** A sequência geral é: (1) deregressed proof dos animais com registro; (2) efeitos de SNP por modelo linear (equivalente a SNP-BLUP com pesos) ou não linear; (3) GEBV como soma dos efeitos de SNP; (4) combinação com a PTA tradicional por índice de seleção. A etapa 4 não foi lida em fonte. Notação de memória, não a do artigo:

```
y_DRP = Z u + e                         (pseudo-fenótipo: DRP por animal)
û     = (Z' W Z + λ I)^(-1) Z' W y_DRP  (efeitos de SNP; W = pesos do DRP)
ĝ     = Z û                             (GEBV = soma dos efeitos de SNP)
```
`[não verificado]`. Os pesos W e o parâmetro λ dependem da ponderação de Garrick et al. (2009) e dos componentes de variância; ver seção 2.

### Inferences
- Pelas fontes encontradas, o CDCB ainda não tem data de virada para ssBLUP. A conclusão do protótipo, prevista para o fim de 2026, precede qualquer decisão de implementação.
- O argumento do CDCB, de que o multi-step não usa todos os dados, é o mesmo que motiva o single-step em outros países (ver seção 3).

### Gaps
- Equações do artigo de 2009 não extraídas. A fórmula de combinação com a PTA tradicional não foi confirmada.
- Os números "50% vs 27%" não foram confirmados.
- Valor de confiabilidade atual (2025-2026) para touros jovens de produção em Holandês não encontrado. A expectativa de ~0,70 para touros jovens em produção não foi verificada nesta busca.
- Documento técnico do ssBLUP do CDCB/AGIL (protótipo, cronograma) não localizado.

---

## 2. DYD, deregressed proofs e pseudo-fenótipos

### Takeaway
A DYD (VanRaden & Wiggans 1991) é o desvio médio das filhas, depois de descontados os efeitos de grupo de manejo, herd-sire e ambiente permanente. O deregressed proof (DRP) é, em essência, o EBV sem informação parental dividido pela confiabilidade. Garrick et al. (2009) mostram que nem a confiabilidade nem a variância do erro de predição são os pesos corretos; o peso ideal depende da fração da variância genética que os marcadores não explicam. Jairath et al. (1998), que deregressam por equações de modelo misto completas, foi comparado com o método de Garrick em estudos com resultados divergentes.

### Cited Findings
- **DYD.** "A cow's yield deviation is a weighted average of lactation yields minus solutions for management group, herd-sire, and permanent environmental effects. Bulls do not have yield deviations; however, a weighted average of daughter yield deviations adjusted for mates' merit can provide a useful, unregressed measure of daughter performance." VanRaden & Wiggans 1991, J. Dairy Sci. 74:2737-2746 ([PDF](https://www.aipl.arsusda.gov/publish/jds/1991/74_2737.pdf), resumo de busca). O título completo é "Derivation, calculation, and use of national animal model information".
- **Confiabilidade da DYD/avaliação USDA (1991).** Confiabilidade = (total de equivalentes de filhas) / (total de equivalentes de filhas + 14), conforme o mesmo resumo. Conferir o valor da constante no artigo.
- **Garrick, Taylor & Fernando 2009.** "Deregressing estimated breeding values and weighting information for genomic regression analyses." Genet. Sel. Evol. 41:55. DOI 10.1186/1297-9686-41-55 ([DOI](https://doi.org/10.1186/1297-9686-41-55), resumo de busca). Conclusões do resumo:
  - (a) A deregressão adequada é EBV sem informação de pais dividido por r², onde r² é a confiabilidade desse EBV.
  - (b) O peso adequado é a razão (1 - h²) / [(c + (1 - r²)/r²) h²], onde c > 0 é a fração da variância genética não explicada pelos marcadores. Notação do resumo, conferir no artigo.
  - (c) Confiabilidade e variância do erro de predição não são os pesos corretos. Ambas foram usadas em estudos anteriores.
  - (d) Fenótipos de alguns animais podem ser combinados com DRPs de outros se a ponderação for feita corretamente.
- **Práticas antes de 2009.** Segundo o artigo de Garrick, um levantamento do Interbull mostrou práticas variadas: DRP ponderado pela confiabilidade, DYD ponderado pela contribuição efetiva de filhas, ou EBV sem ponderação ([Garrick 2009](https://doi.org/10.1186/1297-9686-41-55), resumo de busca).
- **Jairath et al. 1998.** Deregressão que monta as equações de modelo misto completas para todos os animais da pedigree. Descrição em trabalho de 2018 (resumo de busca). O artigo original não foi localizado.
- **Comparação entre métodos.** Um estudo com Holandês chinês relatou que o DRP de Jairath (DRP_J) superou o de Garrick (DRP_G) em acurácia e em falta de viés para quatro traços de leite. Em simulação, porém, o DRP_J teve mais viés nos três traços simulados (resumo de busca). Citação completa não obtida. Possível fonte principal, não lida: "Accuracy and bias of genomic prediction with different deregression methods" ([Animal](https://resolve.cambridge.org/core/journals/animal/article/accuracy-and-bias-of-genomic-prediction-with-different-deregression-methods/B151A3B1B13CB3478458F45B2894951F)).
- **DYD vs EBV como pseudo-fenótipo.** Quando não há registros, EBVs são usados no lugar das DYDs (resumo de busca). Simulação de Sigurdsson & Banos (1995), citada em trabalho posterior, classificou o DRP nacional acima da DYD para comparação entre países, por estar sempre disponível [não verificado; fonte primária não localizada].
- **Pré-seleção genômica.** Patry C & Ducrocq V. 2011. "Evidence of biases in genetic evaluations due to genomic preselection in dairy cattle." J. Dairy Sci. 94:1011-1020. DOI 10.3168/jds.2010-3804 (resumo de busca). Segundo artigo de 2021 que o cita ([Jibrila et al., JABG](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12533), resumo de busca; identificação do artigo de 2021 provável, não confirmada):
  - O BLUP não considera que os animais foram selecionados por informação genômica antes de terem fenótipo.
  - O cálculo da DYD supõe amostragem mendeliana aleatória, que a seleção viola.
  - Incluir pseudo-desempenhos genômicos para pré-selecionados e pré-descartados evita o viés.
  - Companion paper: Patry & Ducrocq 2011, [Genet. Sel. Evol. 43:30](https://link.springer.com/article/10.1186/1297-9686-43-30), simulação baseada em dados franceses de Holandês.

### Inferences
- Em populações pequenas, cada touro tem poucas filhas e o DRP pesa mais no resultado. Por isso a escolha da ponderação (Garrick versus confiabilidade) tende a influenciar mais o GEBV. Inferência não verificada.
- A pré-seleção genômica é mais grave onde o GEBV de jovens orienta a seleção de touros em volume alto (caso do Holandês nos EUA). Em Gir ou Girolando o volume é menor, mas os mesmos princípios se aplicam. Inferência.

### Gaps
- Jairath et al. (1998) não localizado. Notação exata do DRP e do peso não lida em fonte primária.
- A fórmula de confiabilidade da DYD (DE + 14) veio de resumo; conferir.
- Sigurdsson & Banos (1995) não localizado em fonte primária.

---

## 3. Single-step em bovinos leiteiros: países, vieses e grandes populações

### Takeaway
ssGBLUP é o padrão em países nórdicos e é amplamente pesquisado nos EUA. Com APY, avaliações podem incluir centenas de milhares de genotipados. Os problemas recorrentes são: viés por pedigree incompleto (UPG, metafundadores), viés por pré-seleção genômica e a escolha do núcleo no APY. Esta busca não levantou a situação atual de CRV (Países Baixos/Flandres), vit (Alemanha), França, Lactanet (Canadá), ICBF (Irlanda) e DataGene (Austrália). Essa lacuna precisa de nova rodada.

### Cited Findings
- **Revisão de referência.** Mäntysaari EA, Koivula M, Strandén I. 2020. "Symposium review: Single-step genomic evaluations in dairy cattle." J. Dairy Sci. 103(6):5314-5326. DOI 10.3168/jds.2019-17754 ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022030220303143), resumo de busca).
- **NAV (Nordic).** Koivula et al. 2015, J. Dairy Sci. 98:2775-2784: ssGBLUP com modelo multitraço de regressão aleatória e dados de controle leiteiro (resumo de busca; sem URL obtido).
- **Fertilidade feminina Nordic Red.** Matilainen et al. 2018, JABG: ssGBLUP aplicado à avaliação conjunta de Dinamarca, Finlândia e Suécia, que antes usava BLUP multitraço multilactação ([Wiley](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12353), resumo de busca).
- **NAV, eficiência alimentar.** Índice "Saved Feed" em um passo, incorporado ao total merit nórdico (NTM) ([ResearchGate](https://www.researchgate.net/publication/397709134_Nordic_Genetic_Evaluation_of_Feed_Efficiency_-Updated_Model_for_Saved_Feed_in_Nordic_Dairy_Cattle_Breeds), resumo de busca).
- **Rússia usando dados nórdicos.** Kudinov et al. 2022, JABG: avaliação de Holandês russo com informação interna e externa, incluindo EBVs e genótipos nórdicos ([Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/jbg.12660), resumo de busca).
- **Validação em Interbull.** Mäntysaari et al. 2010, Interbull Bulletin 41, "Interbull validation test for genomic evaluations" ([PDF](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/Scientific/Conferences/2010/IB_41_17_MantysaariEtAl.pdf)). Título e autoria confirmados; conteúdo não lido.
- **Viés de pré-seleção em ssGBLUP.** Jibrila et al. 2021, JABG, "Avoiding preselection bias in subsequent single-step genomic BLUP evaluations of genomically preselected animals" ([Wiley](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12533), resumo de busca). Um estudo com dados de suínos mostra o impacto de pré-seleção em avaliações ssGBLUP subsequentes ([PubMed 35764921](https://pubmed.ncbi.nlm.nih.gov/35764921/), resumo de busca).
- **UPG e metafundadores.** Masuda Y, VanRaden PM, Tsuruta S, Lourenco DAL, Misztal I. 2021. "Invited review: Unknown-parent groups and metafounders in single-step genomic BLUP." J. Dairy Sci. 105(2):923-939 ([ResearchGate](https://www.researchgate.net/publication/356344145_Invited_review_Unknown-parent_groups_and_metafounders_in_single-step_genomic_BLUP), resumo de busca; resumo truncado). Metafundadores funcionam como ancestrais de base que ligam animais de raças diferentes pela pedigree, tornando as matrizes genômica e de pedigree mais compatíveis.
- **Estudos de UPG e pedigree incompleto.** Cesarani et al. 2021, JDS 104(5):5843-5853 (UPG em traços de produção de Holandês dos EUA); Bradford et al. 2019, JDS 102(3):2308-2318 (acurácia de pedigree e paternidade incerta em ssGBLUP). Citados em resultados de busca; sem URL obtido.
- **Fertilidade, all-breed, EUA.** Tabet et al. 2024, JDS, "All-breed single-step genomic best linear unbiased predictor evaluations for fertility traits in US dairy cattle" ([JDS](https://www.journalofdairyscience.org/article/S0022-0302%2824%2901234-7/fulltext), resumo de busca). Dados da avaliação multirraça de dezembro de 2022 do CDCB. Quatro traços: DPR, CCR, HCR e EFC. Compararam BLUP de pedigree, ssGBLUP com UPG e ssGBLUP com metafundadores, com resíduo poligênico de 5% ou 10%. O melhor em viés, dispersão e correlação foi o metafundador com 10%. Primeiro autor conforme o resumo de busca; conferir. Não é avaliação oficial.
- **Implementação all-breed nos EUA (Interbull).** Seis raças e todos os cruzamentos; cerca de 45 mil animais no núcleo e cerca de 2 milhões fora dele. A inversa G_APY ocupa cerca de 720 GB. Para os quatro traços de fertilidade, G^-1_APY levou 28 horas e 100 GB de RAM com mmap ([Interbull, art. 1924](https://journal.interbull.org/index.php/ib/article/view/1924), resumo de busca).
- **Multirraça em produção, EUA.** Multibreed genomic evaluation for production traits of dairy cattle in the United States using ssGBLUP, JDS 2022 ([JDS](https://www.journalofdairyscience.org/article/S0022-0302%2822%2900154-0/fulltext)). Com cinco raças, a predictabilidade e a confiabilidade para AY, BS e GU foram em média 7% e 2% menores do que nas avaliações de raça única (resumo de busca).
- **APY com grandes bases, EUA.** Estudo JDS 2016 ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022030216000825), resumo de busca): 569.404 genotipados, 11.626.576 escores finais de 7.093.380 vacas, validação para touros jovens. Outro estudo ARS usou 764.029 genotipados com 18.359 núcleos escolhidos ao acaso (resumo de busca; atribuição não confirmada, [ARS](https://www.ars.usda.gov/research/publications/publication/?seqNo115=338674)).
- **Escolha do núcleo no APY.** Estudo JAS 2020, "Core-dependent changes in genomic predictions using the Algorithm for Proven and Young in single-step GBLUP" ([OUP](https://academic.oup.com/jas/article/98/12/skaa374/5992278)). Segundo o resumo, a escolha do núcleo muda as predições, com mudança máxima de 45% do SD_a em Holandês.
- **Cruzados, EUA.** ssGBLUP para Holandês e Jersey cruzados, com animais cruzados avaliados numa mesma corrida junto aos ancestrais puros ([PubMed 38482122](https://pubmed.ncbi.nlm.nih.gov/38482122); [PMC10928432](https://pmc.ncbi.nlm.nih.gov/articles/PMC10928432/), resumo de busca).
- **Cruzados, avaliação implementada.** "Genomic evaluation for cow wellness traits in crossbred and purebred Holsteins and Jersey cattle", J. Dairy Res., maio de 2026 ([Cambridge](https://www.cambridge.org/core/journals/journal-of-dairy-research/article/genomic-evaluation-for-cow-wellness-traits-in-crossbred-and-purebred-holsteins-and-jersey-cattle/7D23E5CD7714576D70E72820DB2125BD), resumo de busca). O resumo indica uma avaliação de cruzados implementada com metodologia single-step. Conferir.
- **Populações pequenas com ssGBLUP.** "Single-step genomic BLUP (ssGBLUP) effectively models small cattle populations: lessons from the Israeli-Holstein Herdbook" ([PMC11600912](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11600912/)). Título e acesso; conteúdo não lido.

### Inferences
- A pré-seleção genômica é o viés mais discutido. Ele se resolve no ssGBLUP se a informação genômica entrar na avaliação nacional conjunta. Os resultados mostram que avaliações PBLUP posteriores podem ficar enviesadas (Jibrila 2021). Inferência com base nos resumos.
- Para populações pequenas, ssGBLUP com metafundadores é natural para ligar raças (Gir, Girolando, Holandês). Hipótese, detalhada na seção 7.

### Gaps
- Nesta busca não encontrei: CRV, vit, França, Lactanet, ICBF e DataGene, nem datas de implementação. Precisa de nova rodada.
- Viés de inflação do GEBV de jovens em Holandês: nenhuma fonte específica foi encontrada.
- Equações do ssGBLUP (H^-1, APY) ficam para o relatório anterior, como combinado.

---

## 4. Reliabilidade das predições genômicas: fórmulas e valores típicos

### Takeaway
A forma determinística mais citada é r² = N h² / (N h² + Me), em que N é o tamanho da população de referência, h² é a herdabilidade do quase-fenótipo e Me é o número efetivo de segmentos cromossômicos independentes. Nos EUA, a confiabilidade publicada para touros jovens em índice líquido foi de 63% (2008), subindo para 66% com ajuste não linear. Para Gir e Girolando, os números de confiabilidade e acurácia encontrados (50-67% para jovens; acurácia de 0,65 em Gir) são menores, com ressalvas sobre a comparabilidade. O valor de ~0,70 para touros jovens em produção não foi confirmado.

### Cited Findings
- **Daetwyler, Villanueva & Woolliams 2008.** "Accuracy of predicting the genetic risk of disease using a genome-wide approach." PLoS ONE 3(10):e3395 [DOI não verificado]. Título e autoria confirmados em resultado de busca; corpo do artigo não lido.
- **Forma citada.** Slides de curso (SISG, módulo 7) dão a forma h² / (h² + Me/n), em que n é o tamanho da população de referência, para q² = 1 ([slides](https://cnsgenomics.com/data/teaching/SISG/module_7/Mod7_BH_Day1GenomicSelection_PartB.pdf), resumo de busca). Equivalente de memória, [não verificado]:

```
r² = N h² / (N h² + Me)      ;  r = sqrt(r²)
```

- **Me.** Depende do tamanho efetivo da população e do comprimento médio dos cromossomos em Morgans. A atribuição mais citada é a Goddard (2009), segundo o resumo dos slides [não verificado; fonte primária não localizada].
- **Acurácia independe do número de QTL.** Daetwyler et al. mostraram que a acurácia do GBLUP não depende do número de QTL subjacentes (resumo de busca).
- **Valores dos EUA (2008).** Confiabilidade de touros jovens em índice líquido: 63% contra 32% com a matriz tradicional; 66% com ajuste não linear ([VanRaden 2008](https://aipl.arsusda.gov/publish/jds/submit/jdsabstr_genomiccomputations_pvr.html), resumo de busca). Ver também seção 1.
- **Aproximações em ssGBLUP.** Artigo JDS 2013 (vol. 96, p. 647) propõe duas aproximações de confiabilidade para ssGBLUP, por ser inviável inverter exatamente a matriz em bases grandes. Adequadas para até cerca de 100.000 genotipados ([PDF](https://www.aipl.arsusda.gov/publish/jds/2013/96_647.pdf), resumo de busca; autoria não confirmada).
- **Aproximação blended.** Gao et al. (ano 2022 ou 2023, conferir) descrevem uma aproximação para modelo single-step com efeito poligênico residual. Correlações de 0,992 a 0,994 com a confiabilidade exata no melhor caso ([PMC9814342](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9814342/), resumo de busca).
- **Aproximações em multi-step.** Harris & Johnson 2010 e VanRaden et al. 2011, citados em material do Interbull ([Interbull 51-75](https://aipl.arsusda.gov/publish/other/2018/Interbull_51_75.pdf), resumo de busca). Países adotaram aproximações próprias.
- **Gir, 2017 (JDS).** Validação com R² de 0,443 para produção de leite, com referência só de touros. O resumo não deixa claro a coluna desse valor; conferir na tabela ([JDS 2017](https://www.journalofdairyscience.org/article/S0022-0302%2817%2930497-6/fulltext); [PubMed 28527809](https://pubmed.ncbi.nlm.nih.gov/28527809/)). R² de validação não é a mesma métrica que a confiabilidade ou a acurácia.
- **Gir, 2025 (Scientific Reports).** Acurácia de GEBV de 0,65 com referência de raça única para produção de leite em 305 dias de primeira lactação, com h² de 0,30 ± 0,07 ([Nature](https://www.nature.com/articles/s41598-025-15733-y), resumo de busca).
- **Girolando (Embrapa).** Confiabilidade de 50% a 67% para animais jovens em produção de leite, fertilidade e longevidade, segundo citação de pesquisador da Embrapa em 2017 ([Comprerural](https://www.comprerural.com/girolando-ganha-primeiro-sumario-de-avaliacao-genomica/), resumo de busca). Em avaliação de cerca de 2020, acurácia média de 76,41% para animais jovens, com máximo de 90,88%, em documento de sumário da Embrapa/Girolando ([Sumário de Touros Girolando 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1132959/1/DOC-255-Sumario-Touros-Girolando-2021.pdf), resumo de busca; documento exato não confirmado).

### Inferences
- Pela forma determinística, para um mesmo r², o N necessário cresce com Me. Holandês com N grande pode alcançar confiabilidades altas para jovens. Gir e Girolando, com N pequeno, dependem de referência ampliada ou de ligação entre raças. Inferência qualitativa; os valores de Me de Gir e Girolando não foram obtidos.
- Um valor de ~0,70 para touros jovens em produção de Holandês é plausível para bases grandes, mas não foi verificado nesta busca.

### Gaps
- Equação exata do artigo de 2008 não lida.
- Me de Holandês, Gir e Girolando não obtido.
- Valores atuais (2025-2026) de confiabilidade dos sumários do CDCB e do Interbull não encontrados.
- Autoria dos artigos de aproximação (JDS 2013 e Gao et al.) não confirmada.

---

## 5. Avaliação internacional: MACE, GMACE e uso por criadores brasileiros

### Takeaway
O MACE (Interbull) combina avaliações nacionais numa avaliação multi-país e devolve, para cada país, resultados de touros comparáveis entre países. Está em uso desde 1995 (primeiro release oficial em fevereiro de 1995, com dados de nove países). O GMACE é a versão para touros jovens genotipados. Em agosto de 2025 a avaliação de produção usou dados de 33 países. Para um criador brasileiro, a prova MACE de um touro importado é uma referência relativa, por país. Não encontrei confirmação de participação brasileira no MACE.

### Cited Findings
- **Origem.** A página "MACE explained" do Interbull diz que o método foi desenvolvido no Canadá em 1994 por "Prof. Larry Shaffer" (grafia da fonte; provavelmente Schaeffer), em uso desde 1995 ([Interbull](https://interbull.org/ib/interbullactivities), resumo de busca).
- **Primeiro release oficial.** Fevereiro de 1995, dados de Holandês de nove países (USDA-ARS, [registro](https://www.ars.usda.gov/research/publications/publication/?seqNo115=58875), resumo de busca).
- **Schaeffer 1994, "Multiple-country comparison of dairy sires", J. Dairy Sci.: não confirmado.** A busca não encontrou esse artigo com esse título e ano. [não verificado]
- **Schaeffer, Reents & Jamrozik 1996.** "Factors influencing international comparisons of dairy sires." J. Dairy Sci. 79:1108-1116. Citado em lista de referências da Universidade de Guelph (resumo de busca); não confirmado na fonte primária.
- **Substituição das equações de conversão.** Em 1995, o procedimento multi-traço entre países substituiu as equações de conversão baseadas em regressão como método preferido para comparar touros entre países (retrospectiva JDS 2000, [JDS 83:1081](https://aipl.arsusda.gov/publish/jds/2000/abs83_1081.html), resumo de busca).
- **STMACE e MTMACE.** O procedimento original foi uma avaliação de traço único entre países (STMACE). A versão multi-traço dentro de cada país (MTMACE) foi uma extensão posterior ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0301622600002554), resumo de busca).
- **Escopo.** Touros de 6 raças e 7 grupos de traços: produção, saúde do úbere, conformação, longevidade, parto, fertilidade feminina e facilidade de manejo ([Interbull dairy services](https://interbull.org/ib/dairy_services), resumo de busca).
- **Resultados por país.** Cada país recebe seu próprio conjunto de resultados, porque o MACE considera a reclassificação de touros entre países (resumo de busca; [Interbull dairy services](https://interbull.org/ib/dairy_services)).
- **Edição de agosto de 2025.** Avaliação de MACE para produção (leite, gordura e proteína) com dados de 33 países. Um teste extra foi agendado para maio de 2025 ([Interbull, prod2508r](https://interbull.org/static/web/prod2508r.pdf), resumo de busca).
- **GMACE.** Serviço do Interbull para touros com menos de 7 anos. Motivação: a comparação entre países deixou de ser resolvida pela seleção genômica. Combina dados genômicos de países participantes, corrigindo confiabilidade e correlações ([Interbull services](https://interbull.org/ib/services), resumo de busca). Implementação descrita em Sullivan & VanRaden, proceedings Interbull 2010 (sem URL obtido). Risco principal: viés nacional nas predições de jovens se propaga ao GMACE dos pais.
- **Validação de GMACE.** Em estudo com Holandês da República Tcheca, a concordância com GMACE de 96 touros estrangeiros jovens variou de 0,33 a 0,75 (resumo de busca; estudo não identificado).
- **Integração com ssGBLUP nacional.** Interbull Bulletin 61 (junho de 2025, Louisville): estudo de Wallonia propõe ssGBLUP nacional que incorpora dados nacionais e valores MACE. Correlações acima de 0,97 entre EBV MACE e EBV integrado, por traço ([Bulletin 61](https://edepot.wur.nl/707840), resumo de busca).
- **Suíça.** Integração de valores MACE em avaliação de controle leiteiro (test-day) multitraço, com informação de touros do Interbull ([Interbull Journal, art. 1967](https://journal.interbull.org/index.php/ib/article/view/1967), resumo de busca; o número de touros no resumo está truncado).
- **Austrália (Australian Red).** Integração de valores multi-país do Interbull em avaliação single-step de regressão aleatória ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022030222006853), resumo de busca).
- **Plano 2026.** "Future MACE" como novo software planejado para 2026, e Bulletin 62 previsto para o encontro anual de 2026 ([Interbull Centre Annual Operating Plan 2026](https://interbull.org/web/static/web/20260202_Interbull_Centre_Annual_Operating_Plan_2026_%28PUBLIC_version%29%20_V2.pdf), resumo de busca).
- **Material explicativo.** "Understanding Interbull Evaluations: MACE and New IGI Values" ([cdn.ca](https://www.cdn.ca/document.php?id=345)). Título; conteúdo não lido.
- **"InterGenomics".** Nome citado no pedido não foi encontrado nas buscas. A referência mais próxima é o GMACE.

### Inferences (uso por criadores brasileiros)
- A prova MACE de um touro importado deve ser lida como posição relativa dentro de um grupo de comparação, por país. Não é um valor absoluto comparável a Gir ou Girolando.
- Um touro Holandês ou Jersey tem prova MACE comparável apenas à população de origem. Para cruzados, a comparação exige ajuste (BOA ou ssGBLUP multirraça; ver seção 7).
- A participação do Brasil no MACE/GMACE não foi confirmada. Antes de usar uma prova MACE na decisão, confirmar com a associação de raça responsável pela avaliação brasileira.

### Gaps
- Participação brasileira no MACE/GMACE não verificada.
- Correlações genéticas entre países (valores numéricos) não encontradas.
- Schaeffer 1994 não confirmado.
- Bulletin 62 e resultados de 2026 não encontrados.

---

## 6. Impacto da seleção genômica: intervalo de geração, ganho genético e ROH

### Takeaway
García-Ruiz et al. (2016, PNAS) mostram que, nos EUA, o intervalo de geração do caminho pai-de-touros caiu de cerca de 7 anos para menos de 2,5, e o do caminho mãe-de-touros de cerca de 4 para cerca de 2,5. Segundo o comentário que acompanha o artigo (resumo de busca), a taxa anual de ganho genético de traços de produção aumentou de 50% para 100%, e a de traços de baixa herdabilidade de 300% para 400%. A unidade desses percentuais não está clara no resumo. A seleção genômica também aumentou a autozigose em linhagens selecionadas (Kim et al. 2013). ROH de segmentos longos pesam mais na depressão endogâmica recente (JDS 2025).

### Cited Findings
- **García-Ruiz et al. 2016.** "Changes in genetic selection differentials and generation intervals in US Holstein dairy cattle as a result of genomic selection." PNAS 113(28):E3995-E4004. DOI 10.1073/pnas.1519061113 ([DOI](https://doi.org/10.1073/pnas.1519061113), resumo de busca). Modelo de quatro caminhos: pai de touro, pai de vaca, mãe de touro e mãe de vaca.
- **Intervalos de geração.** Caminho pai-de-touros: de cerca de 7 anos para menos de 2,5 anos. Caminho mãe-de-touros: de cerca de 4 anos para cerca de 2,5 anos (resumo de busca).
- **Seleção por traço.** Intensidade de seleção aumentou para traços de baixa herdabilidade. As tendências genéticas aceleraram para fertilidade, longevidade e saúde do úbere. Os diferenciais de seleção para produção ficaram estáveis (resumo de busca; trecho truncado).
- **Errata.** Correção publicada em 1º de agosto de 2016 para a Figura 2 (resumo de busca).
- **Dados.** USDA Ag Data Commons, DOI 10.15482/USDA.ADC/1256513 ([link](https://doi.org/10.15482/USDA.ADC/1256513)).
- **Extensão a outras raças.** Ruiz-López et al. 2018, WCGALP: para índice líquido em Holandês, Jersey e Pardo Suíço, o intervalo pai-de-touros caiu pela metade em Holandês e Jersey ([WCGALP 2018](https://www.aipl.arsusda.gov/publish/other/2018/WCGALP2018_Ruiz-Lopez.pdf), resumo de busca).
- **Comentário companion.** Taxas anuais de ganho genético "aumentaram de 50% para 100%" para traços de produção, e de "300% para 400%" para traços de fitness (resumo de busca; comentário não identificado; interpretar com cuidado).
- **ROH e seleção.** Kim et al. 2013, PLoS ONE, "Effect of artificial selection on runs of homozygosity in U.S. Holstein cattle" ([PMC3858116](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3858116/), resumo de busca). A linhagem selecionada teve aumento geral da autozigose. A linhagem não selecionada não mudou de forma significativa na maior parte dos cromossomos.
- **ROH antes e depois da seleção genômica.** Forutan et al. 2018, BMC Genomics ([PMC5787230](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5787230/), resumo de busca). Dados de chip de 50k de Holandês norte-americano nascidos entre 1990 e 2016. Em simulação por gene-dropping, janelas de 20 a 50 SNPs foram as que mais se aproximaram da endogamia verdadeira. A endogamia por pedigree subestimou a real.
- **Depressão endogâmica no genoma.** Doekes et al. 2020, Genet. Sel. Evol., "Inbreeding depression across the genome of Dutch Holstein Friesian dairy cattle" ([DOAJ](https://doaj.org/article/31835772821942f9b6ae09e0200bcbf7), resumo de busca). Efeitos de dominância e ROH para mapear a depressão endogâmica.
- **ROH recentes.** JDS 2025, autores não listados no resultado ([DOAJ](https://doaj.org/article/4eb4ad040ec6405a842aab41e6ca23d6), resumo de busca). Em Holandês, FROH genômico foi significativo e alinhado ao pedigree. ROH recentes (acima de 16 Mb) tiveram efeito 2,6 a 3,3 vezes maior na depressão endogâmica que ROH menores.

### Inferences
- Se ROH recentes pesam mais na depressão endogâmica, o monitoramento genômico deve privilegiar segmentos longos (inferência a partir do JDS 2025).
- O ganho de intervalo de geração vem com risco de endogamia quando poucos pais concentram o uso. Inferência; não quantificada nesta busca.
- Para populações pequenas, o ganho de intervalo de geração com seleção genômica tende a ser menor ou incerto. Sem números para Gir ou Girolando.

### Gaps
- Nenhuma estimativa quantitativa brasileira de redução do intervalo de geração com seleção genômica (Girolando, Gir) foi encontrada.
- Taxa de aumento de endogamia por geração com seleção genômica em Holandês não quantificada nesta busca.

---

## 7. Avaliação genômica em populações pequenas e tropicais (Gir, Girolando, Guzerá, Jersey, cruzados)

### Takeaway
A avaliação genômica brasileira para Girolando é oficial e tem população de referência própria: 25.936 animais de Gir, Girolando e Holandês genotipados em 2023, com chips de densidades diferentes (resumo de busca). Em Gir, a acurácia com referência de raça única foi de cerca de 0,65 para produção de leite em 305 dias (2025). Nesse mesmo estudo, juntar outras raças reduziu a acurácia de Gir, o que mostra que o ganho com dados de outras raças não é automático. Em cruzados, a atribuição de origem alélica (BOA) é a abordagem prática, e a Nova Zelândia estima que a população cruzada exija uma referência de pelo menos 400 mil animais, sem comparações publicadas (relatório do grupo de trabalho do setor). Em Guzerá, ssGBLUP mostrou ganhos relativos grandes. Não encontrei estudo de Jersey em pequena população no Brasil.

### Cited Findings

**Girolando (Brasil)**
- **Ferramenta de seleção genômica.** O Clarifide Girolando foi desenvolvido por Embrapa Gado de Leite, Girolando, CRV Lagoa e Zoetis. É apresentado como a primeira ferramenta de seleção genômica para bovinos leiteiros criada no Brasil e a única no mundo para Girolando ([Programa de Melhoramento Genético da Raça Girolando, 2023](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1154279/1/Programa-de-Melhoramento-Genetico-da-Raca-Girolando-junho-2023.pdf), resumo de busca; fonte exata não confirmada).
- **Dados de 2023.** 25.936 animais de Gir, Girolando e Holandês (touros, vacas e jovens), genotipados com chips de densidades diferentes (mesma fonte, resumo de busca).
- **Estrutura populacional.** Estudo com 26.969 animais: endogamia média de 0,11%, tamanho efetivo de 188 considerando a genealogia completa. Dos 9.457 ancestrais da população de referência, 457 explicam 50% da variabilidade genética ([Embrapa, estrutura populacional](https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/1006603/estrutura-populacional-da-raca-girolando), resumo de busca; autores não identificados no resumo).
- **Referência inicial.** Em um sumário mais antigo, os touros de referência eram os 572 genotipados com chip de alta densidade (777K). Fêmeas adultas e animais com registro próprio nascidos desde 2012 complementavam a referência ([Sumário de Touros Girolando, 2022](https://www.girolando.com.br/ckfinder/userfiles/files/imagens%202/megaleite%202022/Sumario_Touros_Girolando_2022_DOC266.pdf), resumo de busca; edição a conferir).
- **Sumário de fêmeas, junho de 2025.** Top 1.000 fêmeas jovens (menos de 24 meses), com GPTA e acurácia para produção de leite em 305 dias ([Embrapa, junho de 2025](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1176483/1/Programa-de-Melhoramento-Genetico-da-Raca-Girolando-Femeas-junho-2025.pdf), resumo de busca).
- **Benefícios declarados pela Embrapa.** Aumento de acurácia, redução do intervalo de gerações e correção de erros de pedigree (resumo de busca; mesmas fontes acima).

**Gir (Brasil e outras populações)**
- **Gir, JDS 2017.** "Accuracy of genomic predictions in Gyr (Bos indicus) dairy cattle." J. Dairy Sci. ([JDS](https://www.journalofdairyscience.org/article/S0022-0302%2817%2930497-6/fulltext); [PubMed 28527809](https://pubmed.ncbi.nlm.nih.gov/28527809/)). Quatro chips de SNP e efeito de genótipos imputados. Referência: nascidos até 2004. Validação: nascidos depois. Comparação entre referência só de touros (TR1) e touros mais vacas (TR2). Vacas foram necessárias porque o número de touros era pequeno (resumo de busca). Autores não identificados nos resultados.
- **Gir, Scientific Reports 2025.** "Shared SNP effects across breeds increase the genomic prediction accuracy for numerically small breeds" ([Nature](https://www.nature.com/articles/s41598-025-15733-y), resumo de busca). Com referência de raça única, acurácia de GEBV de 0,65 para Gir (h² = 0,30 ± 0,07). Adicionar outras raças reduziu a acurácia de Gir em 3,1% a 6,5% com matriz GRM compartilhada, e em 6,5% a 10,7% com a abordagem de metafundadores. O resumo não mostra o país de origem dos dados. O título fala em ganho para raças pequenas, mas o trecho sobre Gir mostra redução. Sinal a conferir no artigo.
- **Gir, avaliação de pedigree (não genômica).** Modelo de regressão aleatória em controle leiteiro com 10.576 primeiras lactações: ganho de acurácia de 2,7% a 3,0% sobre o modelo de 305 dias ([SciELO PAB](https://www.scielo.br/j/pab/a/RJKr44QrDnPML4fD8XwnM9y/?lang=en), resumo de busca).
- **Estrutura do Gir.** "History, structure, and genetic diversity of Brazilian Gir cattle" ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1871141314000948)). Título; conteúdo não lido.

**Guzerá (Brasil)**
- "Genomic prediction in Brazilian Guzerá cattle: application of a single-step approach to productive and reproductive traits" ([ResearchGate](https://www.researchgate.net/publication/363778989_Genomic_prediction_in_Brazilian_Guzera_cattle_application_of_a_single-step_approach_to_productive_and_reproductive_traits)). Ganhos de acurácia com ssGBLUP para traços de leite de 27% (MY305) a 108% (SY305), em relação à avaliação sem genômica (resumo de busca). Os valores são percentuais relativos; conferir se são sobre acurácia absoluta.

**Holandês brasileiro (referência pequena)**
- Short communication, "Improving accuracy of predicting breeding values in Brazilian Holstein population by adding data from Nordic and French Holstein populations" ([PubMed 27040784](https://pubmed.ncbi.nlm.nih.gov/27040784/), resumo de busca; ano não confirmado). Modelo genômico bicaracter. Touros brasileiros genotipados ganharam muito de confiabilidade em relação ao pedigree. Incluir dados nórdicos e franceses aumentou ainda mais. Vacas não genotipadas melhoraram pouco. Os autores enfatizam que uma referência nativa brasileira é necessária.

**Cruzados, Jersey e Nova Zelândia**
- **Método BOA.** Predições de cruzados usam efeitos de marcadores de raças puras, combinados pela origem alélica detectada (BOA) ou pela proporção de raça estimada pelo genótipo. Nenhum dos dois usa os registros dos próprios cruzados ([GSE 2021](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-021-00678-3), resumo de busca; [PMC8572482](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8572482/)).
- **Modelo BOA com dados de cruzados.** Melhora a acurácia para cruzados em população multirraça ([PMC10184430](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10184430/), resumo de busca).
- **BOA vs proporção de raça (proteína).** Habilidade preditiva de 0,45 com BOA contra 0,43 com proporção. O modelo de proporção gerou viés de nível (estudo JDS; citação exata não confirmada, [JDS S0022-0302(22)00253-3](https://www.journalofdairyscience.org/article/S0022-0302%2822%2900253-3/fulltext), resumo de busca).
- **Qualidade da atribuição.** Em população simulada de pequeno produtor, 95,76% dos alelos foram atribuídos corretamente, 1,39% errados e 2,85% não atribuídos. O cruzado com menor atribuição teve 72,4% ([bioRxiv 2024.04.12.589204](https://www.biorxiv.org/content/10.1101/2024.04.12.589204.full.pdf), resumo de busca).
- **Nova Zelândia, requisito de referência.** Relatório do grupo de trabalho da indústria (DairyNZ, [PDF](https://www.dairynz.co.nz/media/sbujkk1q/iwg-final-report-8-july.pdf)): a heterogeneidade dos cruzados exige referência muito maior, estimada em pelo menos 400.000 animais. Afirma que não há comparações publicadas para populações cruzadas. Data do relatório não identificada.
- **Nova Zelândia, ganho genético.** Mudança genética cumulativa por seleção e cruzamento nas últimas duas décadas foi próxima das previsões de um modelo publicado em 2000 ([PubMed 36338774](https://pubmed.ncbi.nlm.nih.gov/36338774/), resumo de busca).
- **LIC.** Nenhum material específico do LIC sobre avaliação genômica de cruzados foi encontrado.

**Jersey e multirraça**
- Ver seção 3: ssGBLUP multirraça nos EUA para produção, com 7% e 2% de perda média de predictabilidade e confiabilidade em cinco raças, e ssGBLUP para cruzados Holandês e Jersey ([JDS 2022](https://www.journalofdairyscience.org/article/S0022-0302%2822%2900154-0/fulltext); [PMC10928432](https://pmc.ncbi.nlm.nih.gov/articles/PMC10928432/)).

### Inferences: comparação entre grandes e pequenas populações

| Aspecto | Holandês (EUA e Nórdicos) | Gir, Girolando e Guzerá (Brasil) |
|---|---|---|
| Tamanho da referência | Centenas de milhares a milhões de genotipados (APY) | Dezenas de milhares de animais no total (Girolando, 2023); centenas de touros genotipados em sumários antigos |
| Método predominante | Multi-step (oficial nos EUA até 2026, segundo fontes); ssGBLUP com APY em estudos e países nórdicos | Referência própria com GBLUP ou ssGBLUP; metafundadores para ligar raças |
| Acurácia ou confiabilidade citada | 63% para touros jovens (2008); 66% com não linear | Gir: 0,65 com referência de raça única (2025). Girolando: 50-67% para jovens (2017, citação) |
| Riscos principais | Viés por pré-seleção; UPG e pedigree incompleto; escolha do núcleo no APY | Acurácia reduzida ao juntar raças (Gir, 2025); pedigree raso ou com registros incompletos; tamanho efetivo baixo (Girolando: Ne = 188) |
| Ferramentas típicas | APY, metafundadores, MACE/GMACE para comparação entre países | Metafundadores, BOA para cruzados, referência nativa |

Inferências adicionais:
- A diferença de tamanho de referência é o fator dominante. As fontes indicam que os ganhos de acurácia em pequenas populações dependem de referência nativa maior. Adicionar outras raças pode reduzir a acurácia da raça-alvo (Gir, 2025), a não ser que o modelo seja bem calibrado. Inferência com base em dois estudos.
- Para cruzados, BOA e ssGBLUP multirraça são as abordagens de referência nas fontes encontradas. A escolha depende do volume de dados de cruzados. Inferência.

### Gaps (lacunas transversais desta seção e das demais)
- Nenhum estudo de Jersey em pequena população no Brasil foi encontrado.
- Números de Me necessários para Gir, Girolando e Guzerá não obtidos.
- Comparação oficial de acurácia entre Holandês, Girolando e Gir em avaliações brasileiras não encontrada.
- Metodologia atual das avaliações brasileiras de Holandês (Qualitas, ABCBH) e de zebu não encontrada.
- Avaliação genômica de cruzados do LIC (Nova Zelândia) não encontrada.
- Situação atual de CRV, vit, França, Lactanet, ICBF e DataGene não pesquisada nesta rodada.
- Equações em notação de artigo primário: nenhuma foi extraída de texto integral. Antes de citar equações no relatório, conferir nos artigos listados.

**Próximos passos sugeridos:** (1) ler o texto integral de VanRaden et al. 2009 e Garrick et al. 2009 para extrair a notação; (2) buscar a documentação técnica do CDCB/AGIL sobre o protótipo ssBLUP; (3) pesquisar CRV, vit, Lactanet, ICBF e DataGene; (4) buscar a metodologia da avaliação brasileira de Holandês e a participação do Brasil no MACE; (5) confirmar autores e DOIs marcados como "não verificado".
