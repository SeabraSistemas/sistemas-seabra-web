# PTA, confiabilidade, daughter equivalents, base genética e índices econômicos em bovinos leiteiros

Data de referência: buscas realizadas em 14/10/2026. Escopo: prática internacional e brasileira.

Método e limites: foram feitas 17 chamadas de WebSearch (modos standard e extended), além de leitura do guia de pesquisa e verificação da pasta de destino. WebFetch e curl não funcionam neste ambiente, então nenhum PDF foi lido na íntegra. Os fatos vêm de trechos e resumos retornados pela busca, e os URLs são os que a busca retornou. Valores que não puderam ser conferidos no documento primário aparecem como "(a conferir)". Conhecimento de fundo sem fonte obtida aparece como "[não verificado]". Fontes secundárias (Bullvine, Alta Genetics, ABS Global, Viking Genetics, topagrar, empresas) só são usadas quando nenhuma fonte primária apareceu, e estão indicadas como tal.

## Q1. Definições: PTA, EBV, PD, RBV, confiabilidade, daughter equivalents e índice de pedigree

### Takeaway
A PTA (predicted transmitting ability) prevê o desempenho esperado das filhas de um touro em relação à referência do rebanho. A confiabilidade é o quadrado da correlação com o valor de transmissão verdadeiro, e a relação REL = DE/(DE + k) liga a confiabilidade às daughter equivalents (DE); a constante k depende de h², e a fonte de 1991 indica k = 14, enquanto a fórmula geral com h² = 0,25 dá 15.

### Cited Findings
- **PTA, sentido prático.** Segundo o próprio programa do Gir Leiteiro, a PTA "é uma projeção do desempenho das filhas de um touro frente à referência genética dos rebanhos" e "é a capacidade prevista de transmissão, sendo uma medida do desempenho esperado das filhas do touro" — [Embrapa/ABCGIL, Sumário Brasileiro de Touros Gir Leiteiro 2019 (DOC 235)](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1108520/1/DOC235SumarioGir2019.pdf) (trecho via resumo de busca).
- **Confiabilidade como r².** "A predicted value's accuracy is measured by squaring its correlation with the true transmitting ability" — [VanRaden & Wiggans 1991, J. Dairy Sci. 74:2737](https://www.aipl.arsusda.gov/publish/jds/1991/74_2737.pdf).
- **Fontes das DE.** As DE de um animal vêm de três fontes: os ancestrais, os próprios registros e os descendentes — mesma fonte.
- **REL a partir de DE (texto de 1991).** A confiabilidade é a soma acumulada de DE dividida por essa soma mais 14 ("accumulated daughter-equivalent total divided by that total plus 14") — mesma fonte (a conferir: a constante e sua dependência de h² por característica).
- **Touro sem produção própria.** Como touros não têm desvios de produção próprios, a média ajustada por rebanho/acasalamento das filhas serve como medida bruta e não encolhida — mesma fonte.
- **Construção da PTA.** A estimativa de transmissão combina registros do próprio animal, avaliações dos pais e informação de progênie por média ponderada — mesma fonte.
- **DE em fertilidade.** A avaliação de taxa de prenhez de filhas (DPR) do USDA usa a mesma lógica de daughter equivalents — [USDA-AIPL, Daughter Pregnancy Rate evaluation (2005)](https://www.aipl.arsusda.gov/reference/fertility/dpr.htm).
- **Confiabilidade no Girolando (descritiva).** "Confiabilidade é a medida da quantidade de informação usada na estimativa de um valor genético" — [Embrapa/Girolando, Sumário de Touros Girolando 2021 (DOC 255)](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1132959/1/DOC-255-Sumario-Touros-Girolando-2021.pdf). Sem fórmula.

### Inferences
- **Relação entre DE e REL.** REL = DE/(DE + k), equivalente a DE = k·REL/(1 − REL). A correlação é r = √REL.
- **Constante k e h².** Pela fórmula geral k = (4 − h²)/h² [fórmula de fundo, não verificada em fonte]. Assim, k = 14 corresponde a h² = 4/15 ≈ 0,267, e k = 15 corresponde a h² = 0,25. Qual h² o USDA usa para cada característica em 2025 não foi verificado.
- **Exemplos numéricos (calculados).**
  - DE = 100: REL = 100/114 = 0,877 (r ≈ 0,937) com k = 14; REL = 100/115 = 0,870 (r ≈ 0,933) com k = 15.
  - DE = 25: REL = 25/39 = 0,641 com k = 14; REL = 25/40 = 0,625 com k = 15.
  - REL = 0,80 corresponde a DE = 56 com k = 14, ou DE = 60 com k = 15.
- **Diferença esperada entre as filhas de dois touros.** Pela definição de PTA (desempenho esperado das filhas), se os dois touros são cruzados com vacas de média igual, na mesma base e escala, a diferença esperada entre as filhas é PTA_A − PTA_B. Exemplo: PTA leite de +1.000 kg contra +600 kg dá diferença esperada de 400 kg por lactação das filhas. Como PTA é metade do valor genético [não verificado como fonte, mas é a convenção padrão], a diferença de valor genético seria de 800 kg. A confiabilidade não muda essa diferença esperada; muda a precisão da previsão.
- **Índice de pedigree.** PI = ½(PTA pai + PTA mãe), e a variante ½ pai + ¼ avô materno [não verificado; não encontrado nesta busca].
- **PD e RBV.** PD (predicted difference) é a notação de alguns países, geralmente equivalente à PTA na unidade da característica [não verificado]. RBV (relative breeding value) é escala relativa com média 100, usada em Alemanha, países nórdicos e Holanda; o desvio-padrão por característica não foi verificado [não verificado].
- **Crescimento da confiabilidade.** A REL cresce com a DE, que cresce com o número de filhas e de rebanhos; as fórmulas específicas não foram obtidas [não verificado].

### Gaps
- Definições oficiais atuais de PD e RBV (USDA/CDCB, Interbull, países) não foram encontradas.
- O h² usado nas DE atuais do USDA e a constante de DE da avaliação de 2025 não foram verificados.
- Fórmulas de PI e de confiabilidade do pai médio não foram obtidas de fonte primária.
- Confiabilidade de touros genômicos (DE combinadas com genômica) fica fora deste escopo.

## Q2. Base genética, mudanças de base e conversão entre países (MACE)

### Takeaway
Uma PTA é relativa a uma base, que é a média de vacas de um ano de nascimento. Nos EUA, a base Holstein passou de vacas nascidas em 2015 para vacas nascidas em 2020, em abril de 2025, com queda de 752 lb no PTA leite Holstein, e as diferenças entre animais se mantêm. Comparações entre países usam MACE (Interbull), que converte valores para a base e a escala de cada país.

### Cited Findings
- **Base Holstein.** "The base was previously set to zero for all cows born in 2015. In April 2025, the genetic base shifted to include all cows born in 2020." — [Alta Genetics, Understanding the 2025 Genetic Base Change](https://us.altagenetics.com/preparing-for-the-2025-genetic-base-change/) (secundária).
- **Ponto zero.** Após o cálculo de PTA de toda a população, a média dos PTAs das vacas de um ano de nascimento é deslocada para zero — [ABS Global, The Upcoming U.S. Base Change](https://www.absglobal.com/us-base-change/) (secundária; a atribuição exata do trecho ao link não foi confirmada).
- **Magnitude.** A Alta Genetics lista ajuste de 752 lb no PTA leite Holstein; todos os machos e fêmeas têm PTA 752 lb menor após a mudança — [Alta Genetics](https://us.altagenetics.com/preparing-for-the-2025-genetic-base-change/).
- **Exemplo de touro.** Um touro com "milk merit" de 1.400 lb na base 2015 (dezembro de 2024) passou a 660 lb na base 2020 (abril de 2025) — [CDCB, National Dairy Genetic Index Update, Base Change Set for April 2025](https://uscdcb.com/national-dairy-genetic-index-update-base-change-set-for-april-2025/) (exemplo citado pela busca; a conferir).
- **Leitura de mercado.** Valores menores depois da mudança não significam perda de mérito genético; a base reflete a melhoria da população — [ABS Global](https://www.absglobal.com/us-base-change/) (secundária).
- **Escopo e calendário.** Em abril de 2025, as características de parto ficaram fora da mudança e foram tratadas em agosto de 2025, com base fenotípica de 1,36% — [CDCB, Calving Traits, agosto de 2025](https://uscdcb.com/wp-content/uploads/2025/06/Calving-Traits-August-2025-web.pdf). Há conflito na contagem de características: uma apresentação ligada à CDCB fala em 45, e a Cowsmo cita 49 — [McWhorter 2025 (CDCB)](https://uscdcb.com/wp-content/uploads/2025/04/WDMC2025-McWhorter.pdf); [Cowsmo, U.S. Genetic Base Change: April 2025](https://cowsmo.com/news/u-s-genetic-base-change-april-2025/).
- **Periodicidade.** Segundo um resumo de busca, a CDCB atualiza a base de todas as características a cada cinco anos — [Alta Genetics](https://us.altagenetics.com/preparing-for-the-2025-genetic-base-change/) (atribuição a confirmar).
- **MACE, definição.** MACE re-expressa o valor genético de um país na base e na escala de outro (citado como Schaeffer, 1994). A expressão (EBV ou PTA), a base e a unidade devem ser declaradas para cada país, raça e característica — [Interbull, Code of Practice, Appendix V](https://interbull.org/ib/cop_appendix5).
- **Equações de conversão.** As equações podem ser marcadas como não aplicáveis quando a escala publicada pelo país é diferente da escala submetida ao MACE — [Interbull, Routine Genetic Evaluation (confdoc 1504r)](https://interbull.org/static/mace_evaluations/1504r/confdoc1504r.pdf).
- **Recomendação.** Quando existe avaliação Interbull para a combinação país-raça-característica, ela deve ser usada para comparações internacionais; o MACE só se aplica quando não existe — mesmo documento (a conferir).
- **MACE multi-característica.** Variantes multi-característica reduziram o erro de predição ou o mantiveram; a EDC precisa ser desregredida quando se usam correlações genéticas entre lactações — [Interbull, "Multiple-Trait MACE with a Variable Number of Traits per Country"](https://journal.interbull.org/index.php/ib/article/download/856/856/1859).
- **Equação MACE por release (Holstein USA).** A Holstein USA publica uma equação de conversão MACE para cada release, incluindo abril de 2025 — [Holstein USA, Genetic Updates](https://www.holsteinusa.com/genetic_evaluations/GenUpdateMain.html) (a conferir a equação de abril de 2025).

### Inferences
- **Mudança de base é deslocamento constante.** Se todos os animais recebem o mesmo deslocamento, as diferenças entre PTAs e entre índices (que somam EV × PTA) se mantêm; mudam só os níveis absolutos. Conversões: 752 lb = 341,1 kg; 740 lb = 335,7 kg (1 lb = 0,45359237 kg).
- **O exemplo 1.400 → 660 lb não é deslocamento puro.** A diferença é de 740 lb, e não de 752 lb. O PTA do próprio touro provavelmente mudou na reavaliação; isso é inferência a confirmar.
- **Unidade e base são coisas diferentes.** PTAs em lb (EUA) e em kg (Brasil e Europa) precisam de conversão de unidade e depois de re-expressão de base (MACE), porque as bases diferem.
- **Caso "74 lb ≈ 53 kg".** Uma comparação antiga, citada em resumo, afirma que 74 lb na escala americana apareceram como cerca de 53 kg na escala alemã. Como 74 lb = 33,6 kg, a conversão de unidade não explica a diferença: deve haver outra característica, outra escala ou outra base. Não usar esse exemplo sem conferir o artigo original.
- **Próxima mudança de base dos EUA.** Se o ciclo de cinco anos se mantiver, a próxima seria por volta de 2030 — inferência, não confirmada pelas fontes.

### Gaps
- Coeficientes das equações MACE para leite, gordura e proteína não foram obtidos.
- A base do PNMGL (Gir) não foi verificada diretamente. O Girolando define sua base como a média das vacas nascidas em um ano (ver Q5).
- Não encontrei dados sobre a base de avaliação do Holandês no Brasil.

## Q3. Índices dos Estados Unidos: NM$, CM$/FM$/GM$, TPI, JPI e PPR

### Takeaway
O NM$ (USDA/CDCB) é um índice de lucro vitalício em dólares, revisado em abril de 2025 (NM$9). Gordura (31,8%) e proteína (13%) somam cerca de 45% dos pesos relatados, seguidos de vida produtiva (13%) e livabilidade de vaca (5,9%). O TPI (Holstein Association) mudou em abril de 2026: proteína passou de 19% para 24% e gordura de 19% para 14%, com produção combinada mantida em 38%.

### Cited Findings
- **NM$ 2025.** Revisão publicada como AIPL Research Report NM$9 (VanRaden, Toghiani, Basiel & Cole), "Net merit as a measure of lifetime profit: 2025 revision" — [USDA-ARS](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/ARR/nmcalc-2025_ARR-NM9.pdf). Cópia da CDCB revisada em fevereiro de 2026: [CDCB](https://uscdcb.com/wp-content/uploads/2026/02/nmcalc-2025_ARR-NM9_without-type_composites_updatedFeb2026.pdf). Vigente desde abril de 2025 para NM$, CM$, FM$ e GM$.
- **Continuidade com 2021.** Correlação de 0,992 para touros jovens Holstein e de 0,981 para touros com progênie recente, em relação ao NM$ de 2021 — mesmo relatório.
- **Composição.** O NM$ combina valores econômicos de 12 características individuais e cinco subíndices compostos. A revisão de 2025 não adiciona características — [CDCB, Introducing Net Merit 2025](https://uscdcb.com/introducing-net-merit-2025/).
- **Parto.** Facilidade de parto entra no NM$ desde 2003 e natimortalidade desde 2006. O composto CA$ entra no NM$, mas não é publicado isoladamente — [CDCB, Introducing Net Merit 2025](https://uscdcb.com/introducing-net-merit-2025/).
- **Ênfase relativa (valores do relatório, via resumo de busca).** Gordura 31,8%; proteína 13%; vida produtiva 13%; livabilidade de vaca 5,9%; leite 3,2%; taxa de prenhez de filhas (DPR) 2,1% — [USDA-ARS, NM$9](https://www.ars.usda.gov/ARSUserFiles/80420530/Publications/ARR/nmcalc-2025_ARR-NM9.pdf) (a conferir na tabela original).
- **Valor por unidade (mesma fonte, a conferir).** Gordura US$ 5,01 por libra de PTA; proteína US$ 3,33 por libra; leite US$ 0,022 por libra; vida produtiva US$ 30 por mês.
- **Feed saved.** Peso relatado de 17,8% em 2025, contra 12,0% em 2021 — [The Bullvine](https://www.thebullvine.com/news/cdcb-unveils-net-merit-2025-updating-dairy-genetic-selection/) (secundária, não verificada no PDF).
- **Motivo da mudança (CDCB, via resumo).** Mais peso para gordura e menos para proteína, por tendências de preço do leite. Menos peso para vida produtiva, porque preços de vacas de descarte e de bezerras subiram, o que aumentou o peso de livabilidade — [CDCB, Introducing Net Merit 2025](https://uscdcb.com/introducing-net-merit-2025/) (a conferir).
- **Conflito de números.** Bullvine dá vida produtiva de 8,0% (2025) e 11,0% (2021); o relatório USDA dá 13% para 2025. Um documento da Universidade do Kentucky dá "PL 15,9" para 2021 — [UKy, Net Merit 2021](https://afs.ca.uky.edu/files/2021_net_merit_genetic_index_includes_additional_traits.pdf). O valor 15,9 provavelmente está em outra unidade (valor econômico ou escala). Usar o relatório USDA.
- **NM$ 2021.** Documento de revisão de 2021 — [AABP, USDA NM 2021 revision](https://www.aabp.org/committees/resources/USDA_NM_2021.pdf). Documento localizado; conteúdo não lido.
- **TPI, abril de 2026.** Proteína de 19% para 24%; gordura de 19% para 14%; produção combinada de 38%, sem mudança; "no other traits were affected" — [Holstein Association USA, Genetic Advancement Committee Recommendations, março de 2026](https://www.holsteinusa.com/pdf/committee/Genetic%20Advancement%20Committee%20Recommendations_Approved%20March%202026.pdf) e [Hoard's, TPIreg formula update](https://hoards.com/article-37960-Holstein-Association-USA-Board-Approves-Updates-to-TPIreg-Formula.html).
- **Impacto do TPI 2026.** Correlação de 0,9978 entre as versões. Entre 493.498 touros, o TPI médio caiu de 2.260 para 2.256. Os 10% do topo perderam em média 27 pontos — mesmas fontes.
- **Histórico de pesos proteína:gordura no TPI.** 27:16 (abril de 2017), 21:17 (abril de 2018) e 19:19 (abril de 2020) — [Hoard's, TPIreg formula update](https://hoards.com/article-37960-Holstein-Association-USA-Board-Approves-Updates-to-TPIreg-Formula.html).
- **Holstein Conformation Composite (HCC).** Índice de conformação com 18 características lineares, ponderadas por relação com longevidade, produção e equilíbrio. Valores para touros ativos em julho de 2026 (com avaliação de abril de 2026) e característica oficial para todas as Holandesas em agosto de 2026 — [Holstein Association USA, março de 2026](https://www.holsteinusa.com/pdf/committee/Genetic%20Advancement%20Committee%20Recommendations_Approved%20March%202026.pdf); [Hoard's, TPIreg e HCC](https://hoards.com/article-37969-Holstein-Association-USA-Board-Approves-Updates-to-TPIreg-New-Conformation-Composite-and-Classification-Changes-to-Reflect-Industry-Trends.html).
- **Pesos completos do TPI.** A página oficial da fórmula é a [Holstein Association USA, TPI formula](https://www.holsteinusa.com/genetic_evaluations/ss_tpi_formula.html). A URL apareceu na busca, mas a página não foi lida.
- **JPI (Jersey), versão de 2015.** Proteína 43, gordura 15, vida produtiva 10, CCS 6 (invertido), DPR 7, concepção de vacas 2 e de novilhas 2, mais um índice de características funcionais a partir de PTAs de tipo — [AJCA, JPI Backgrounder](https://ww2.usjersey.com/Portals/0/AJCA/2_Docs/Genetic-Resources/JPI-Backgrounder.pdf) (a conferir: versão datada).
- **JPI (Jersey), atualização de 2020.** Proteína PTA 27%; gordura PTA 19%; densidade do leite −3%; tipo funcional e úberes 19,4%; vida produtiva 5%; livabilidade 3%; CCS 4,5%; DPR 9%; concepção de vacas 3,5%; concepção de novilhas 2%. Foram adicionados seis traços de saúde específicos da raça — [Hoard's, JPI update (março de 2020)](https://hoards.com/article-27433-jersey-performance-indextm-update--slated-for-april-genetic-evaluations.html).
- **Densidade do leite no JPI.** Definição reportada: "PTA milk minus the sum of protein and fat divided by 0.09". A expressão literal é ambígua; conferir na fonte antes de usar.
- **PPR (Brown Swiss).** Características do índice, segundo resumo de busca: proteína, gordura, CCS, vida produtiva, composto de pé e perna, composto de úbere e DPR. A fonte primária não foi identificada na busca, e os pesos não foram obtidos.
- **Afirmação não sustentada.** Um texto da Bullvine diz que o NM$ 2025 prevê US$ 486 a mais de lucro por vaca que o TPI. Não encontrei apoio nas fontes USDA ou CDCB. Não usar.

### Inferences
- **Ênfase relativa não é o peso bruto.** A ênfase relativa de cada característica depende do valor econômico e da variância genética. Comparar "percentual de gordura + proteína" entre índices diferentes (por exemplo, NM$ com 44,8% e RZG com 36% para leite) não é direto sem padronização [não verificado como fórmula oficial].
- **Exemplo ilustrativo (valores do resumo, a conferir).** Um touro com +50 lb de PTA gordura e +40 lb de PTA proteína contribui com cerca de 50 × 5,01 + 40 × 3,33 = US$ 383,70 pelo par de traços, sem contar os demais componentes. Isso assume NM$ = Σ EV_i × PTA_i [estrutura de fundo, não verificada como equação oficial].
- **Soma dos pesos citados.** Os seis itens citados para o NM$ 2025 somam 69,0%. O restante (cerca de 31%) deve vir de saúde, úbere, pés e pernas, eficiência alimentar e compostos. Isso é inferência; a tabela completa não foi lida.
- **Efeito do TPI 2026.** Com correlação de 0,9978, o efeito por touro é pequeno, exceto para touros com PTA de gordura alto, que é o grupo mais afetado (o top 10% perdeu 27 pontos, em média).

### Gaps
- Pesos completos do TPI em todas as características, com a padronização usada na fórmula.
- Tabela completa do NM$ 2025 (feed saved, CCS, úbere, pés e pernas e demais). O PDF original não foi lido.
- CM$, FM$ e GM$: características, valores econômicos e ênfases não foram pesquisados.
- PPR: pesos não obtidos.
- JPI 2020 em diante: pesos dos seis traços de saúde não obtidos.

## Q4. Índices nacionais de outros países (Canadá, nórdicos, Alemanha, Irlanda, Austrália, Nova Zelândia)

### Takeaway
Os índices diferem em unidade (dólar, euro, pontos ou base 100) e em peso. Fertilidade, saúde e longevidade ganharam peso, e a eficiência alimentar aparece no NM$ 2025, no NTM e no BPI/HWI. Verificados em parte: Canadá (LPI modernizado, abril de 2025), nórdicos (NTM), Alemanha (RZG após 2021), Irlanda (fertilidade de 33% no EBI), Austrália (BPI/HWI) e Nova Zelândia (BW, só a estrutura). França (ISU), Holanda/Flandres (NVI) e Reino Unido (£PLI, Spring Calving Index) não foram obtidos.

### Cited Findings

**Canadá (Lactanet)**
- O LPI modernizado entrou em vigor em 1º de abril de 2025, com seis subíndices: produção, longevidade e tipo, saúde e bem-estar, reprodução, ordenha (milkability) e impacto ambiental (só para Holandês) — [Lactanet, Modernized LPI](https://lactanet.ca/en/lactanet-finalizes-the-modernized-lpi-formula/).
- Os pesos por subíndice são definidos por raça, com a associação de cada raça. Os pesos oficiais do Holandês estavam em uma barra lateral que não foi capturada.
- Pesos do LPI moderno para Jersey e Brown Swiss (mesma fonte, a conferir): Jersey produção 40, longevidade e tipo 30, saúde e bem-estar 10, reprodução 10, ordenha 10. Brown Swiss produção 45, longevidade e tipo 30, saúde e bem-estar 8, reprodução 12, ordenha 5.
- LPI Holandês antigo (abril de 2024): produção 40, durabilidade 40, saúde e fertilidade 20 — [Lactanet, LPI formula April 2024](https://lactanet.ca/?p=22598).
- Deriva: o LPI antigo teria chegado a 49:34:17 (produção:durabilidade:saúde e fertilidade), em vez do 40:40:20 planejado — [The Bullvine, Modernized LPI](https://www.thebullvine.com/news/modernized-lpi-how-canadas-new-genetic-selection-framework-will-transform-dairy-breeding-in-april-2025/) (secundária).
- Correlação de 98,5% entre o LPI modernizado e o anterior, para Holandês; alguns touros do topo são reordenados — [Lactanet, Modernized LPI](https://lactanet.ca/en/lactanet-finalizes-the-modernized-lpi-formula/).
- Pro$: índice de lucro canadense. Os pesos não foram obtidos. O comunicado da Lactanet descreve a relação com o LPI de forma ambígua; um artigo do Manitoba Co-operator descreve o Pro$ como separado do LPI, voltado à lucratividade vitalícia — [Manitoba Co-operator](https://www.manitobacooperator.ca/?p=216929) (secundária).
- Opinião, não dado: Brian Van Doormaal (Lactanet) argumenta que o que importa é a resposta esperada, e não apenas o peso relativo — [The Bullvine, Modernized LPI](https://www.thebullvine.com/news/modernized-lpi-how-canadas-new-genetic-selection-framework-will-transform-dairy-breeding-in-april-2025/).

**Países nórdicos (NAV, NTM)**
- Traços do NTM: produção, crescimento, fertilidade, nascimento, parto e saúde do úbere, ponderados por valores econômicos — [NAV, Routine genetic evaluation (maio de 2024)](https://nordicebv.info/wp-content/uploads/2024/05/NAV-routine-genetic-evaluation-May-2024.pdf).
- Os pesos dos subíndices são ancorados nos valores econômicos de cada subcaracterística — [NAV, Review of the NTM (novembro de 2018)](https://www.nordicebv.info/wp-content/uploads/2018/11/2018.11.06-NTM-2018-report-Full.pdf).
- Valores econômicos por país (Dinamarca, Finlândia, Suécia), no artigo "Economic basis for the Nordic Total Merit Index" (J. Dairy Sci., c. 2014). Leite (€/kg): −0,049 DK, 0,012 FI, −0,052 SE. Gordura (€/kg): 1,62 DK, 0,59 FI, 1,64 SE. Úbere, pés e pernas, velocidade de ordenha e temperamento têm valores idênticos nos três países (€25,5, €17,0, €17,0 e €8,5 por ponto). Autores não obtidos; unidades e valores por característica a conferir — [JDS 2014](https://www.journalofdairyscience.org/article/S0022-0302(14)00684-5/fulltext).
- Mudança recente (empresa, não NAV): após a rodada de provas de maio de 2026, o peso de saved feed subiu de 0,18 para 0,35 no Holandês, de 0,13 para 0,35 no Red Dairy Cattle e de 0,18 para 0,38 no Jersey — [Viking Genetics, The growing importance of feed efficiency](https://www.vikinggenetics.us/news/the-growing-importance-of-feed-efficiency) (secundária; conferir no NAV).
- Conflito entre páginas da Viking: uma dá saúde e reprodução 45%, produção 40% e conformação e manejo 15%; outra dá saúde e reprodução 53% e produção 35% — [Viking Genetics, NTM vs JPI](https://www.vikinggenetics.us/news/total-merit-indexes-ntm-vs-jpi). Não resolvido.

**Alemanha (RZG e RZ€, VIT)**
- RZG antigo (glossário sem data, provavelmente anterior a 2021): leite (RZM) 45%, longevidade (RZN) 20%, exterior 15%, fertilidade (RZR) 10%, saúde do úbere (RZS) 7%, parto (RZKm) 3% — [dsp-agrosoft, Zuchtwerte](https://www.dsp-agrosoft.de/glossar/portal-rind/zuchtwerte/).
- RZG após abril de 2021 (artigo de imprensa): leite 36% (antes 45%); bloco funcional 49% (antes 40%); exterior 15%; RZGesund 18%; RZKälberfit 3%; RZN e RZR levemente reduzidos. Soma: 36 + 49 + 15 = 100 — [topagrar, RZG-Update](https://www.topagrar.com/rind/news/rzg-update-weniger-milch-mehr-gesundheit-12525798.html) (secundária; única fonte para os números pós-2021; conferir no VIT).
- Dentro de RZM, proteína (kg) e gordura (kg) aparecem na proporção 67:33 (artigo sem data), após mudança da relação gordura:proteína de 1:4 para 1:2 — mesma fonte (a conferir).
- RZ€ (econômico): leite 41%, longevidade 27%, saúde 16%, fertilidade de filhas 7%, vitalidade de bezerras 6%, parto 3%. Soma: 100 — [VIT, Der neue RZ€](https://www.vit.de/fileadmin/DE/Zuchtwertschaetzung/Der_neue_RZEuro_pptx.pdf).
- O peso de RZS (CCS) após 2021 não foi confirmado.

**Irlanda (ICBF, EBI)**
- Fertilidade = 33% do EBI — [ICBF, Understanding EBI (primavera de 2020)](https://www.icbf.com/wp-content/uploads/2020/02/Understanding-EBI-PTA-BV-Spring-2020.pdf) (confirmado só no trecho de busca; a conferir).
- Um resumo sem fonte identificada diz que os valores econômicos foram atualizados pela última vez em dezembro de 2017. Verificar no ICBF.

**Austrália (DataGene: ABV, BPI, HWI, TWI)**
- BPI: índice econômico em dólares, com média zero. Pondera produção, saúde e fertilidade, tipo, ordenha (workability) e eficiência alimentar. A atualização deu mais ênfase à saúde — [DataGene, ABV Pocket Guide 2026](https://www.datagene.com.au/wp-content/uploads/2026/04/ABV-Pocket-Guide-2026-final-WEB.pdf) (a conferir).
- HWI: índice de saúde em unidades de índice, com média zero. Tipo e manejo usam média 100 — mesma fonte.
- Feed saved entra no BPI, HWI e TWI, com maior peso no HWI — mesma fonte.
- O peso econômico do feed saved no BPI foi reduzido pela metade, para A$ 0,1927/kg, por baixa confiabilidade. Isso corresponde a cerca de 5,5% do peso relativo do BPI — [Evaluation of updated Feed Saved breeding values in Australian Holstein dairy cattle (2022)](https://www.sciencedirect.com/science/article/pii/S2666910222000023). O modelo econômico de origem é Byrne et al. (2016), [New breeding objectives and selection indices for the Australian dairy industry, J. Dairy Sci.](https://www.sciencedirect.com/science/article/pii/S0022030216305252). A conferir.
- Revisão proposta do HWI (inclui facilidade de parto e duração da gestação, e acelera sobrevivência e CCS; para Jersey, fertilidade e resistência à mastite): status não confirmado.
- Um peso de proteína do BPI apareceu como "6,76" em tabela com texto truncado. Não usar.

**Nova Zelândia (Breeding Worth, LIC/DairyNZ)**
- BW = soma de cada valor econômico multiplicado pelo valor genérico (BV) de cada característica — [DairyNZ, Breeding Worth](https://www.dairynz.co.nz/animal/breeding-decisions/breeding-worth/); [LIC, economic values](https://www.licnz.com/breeding_worth_economic_values.cfm).
- São dez características de BV em dois grupos: eficiência de produção (proteína do leite, gordura, volume de leite e peso vivo) e robustez (grupo separado) — mesmas fontes (resumo; a conferir).
- Os valores econômicos foram revisados recentemente — mesmas fontes.

### Inferences
- **Escalas diferentes.** NM$, BW e BPI são expressos em dólares (BW e BPI em moeda do respectivo país; a moeda exata de cada um não foi verificada); o EBI tem fertilidade com 33% de peso e unidade não verificada (provavelmente euro [não verificado]); RZG/RBV em base 100; HWI em unidades; TPI em pontos. Comparações diretas exigem conversão, ou o MACE para BV e PTA entre países (ver Q2).
- **Tendência convergente.** A eficiência alimentar ganhou peso no NM$ 2025 (17,8% relatado), no NTM 2026 (0,35 para Holandês) e no BPI/HWI. Isso aparece nos documentos consultados.
- **Mudanças de peso seguem o preço.** As mudanças do NM$ 2025 e do TPI 2026 foram justificadas por tendências de preço do leite (gordura contra proteína), segundo CDCB e Holstein USA.

### Gaps
- França (ISU) e Holanda/Flandres (NVI): não pesquisados.
- Reino Unido (£PLI e Spring Calving Index): não pesquisado.
- Pesos completos de: LPI Holandês 2025 (subíndices oficiais por raça), Pro$, NTM por país (versão de 2026), BW, EBI (exceto fertilidade), BPI e HWI completos, RZG atual por característica.
- Os artigos primários do NTM e do BPI não foram lidos.

## Q5. Sumários e índices brasileiros: Gir Leiteiro, Girolando, Guzerá e Holandês

### Takeaway
Os sumários brasileiros publicam PTAs de leite, gordura, proteína e sólidos totais, com confiabilidade em percentual. O Girolando publica PTA genômica desde 2019, índice de longevidade desde 2021 e, em versão recente, características de tolerância térmica. O índice composto e os pesos de Gir, Guzerá e Holandês não foram obtidos nesta busca.

### Cited Findings
- **Gir Leiteiro (PNMGL): estrutura do sumário.** Cada touro tem registro, genealogia, PTAs de leite (PTAL), gordura (PTAG), proteína (PTAP) e sólidos totais (PTAST), além de PTAs em percentual. Cada PTA vem com sua confiabilidade entre parênteses — [Embrapa/ABCGIL, Sumário 2019 (DOC 235)](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1108520/1/DOC235SumarioGir2019.pdf).
- **Gir Leiteiro, sumário 2020.** PTAs de produção de leite em 305 dias e de percentual de gordura, além de pico e persistência e de 22 outras características de conformação e manejo — citado em resumo; fonte exata não obtida.
- **Genótipos.** As edições recentes publicam genótipos de kappa-caseína, beta-lactoglobulina e beta-caseína. O resumo associa BB a mais gordura e proteína (indicado para queijo) e AA a venda in natura — [Embrapa, Sumário genômico de touros Gir Leiteiro (fevereiro de 2026)](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1184675/1/Programa-Nacional-de-Melhoramento-do-Gir-Leiteiro-2-sumario-genomico-de-touros.pdf). A recomendação BB/AA não tem fonte identificada no resumo; não usar sem conferir.
- **Sumário genômico de fevereiro de 2026.** Os grupos 37 e 38 entram no teste de progênie em 2026 — mesmo documento.
- **Girolando (PMGG), histórico.** O teste de progênie começou em 1997, em parceria entre Embrapa Gado de Leite e Girolando. O PMGG foi implantado em 2007. As avaliações anuais de vacas e touros são conjuntas e usam dados do teste de progênie — [Embrapa/Girolando, Sumário de Touros 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1132959/1/DOC-255-Sumario-Touros-Girolando-2021.pdf).
- **Girolando, base genética.** "Valor genético médio das vacas nascidas em um determinado ano" — mesmo documento.
- **Girolando, genômica.** Confiabilidades de predição genômica em animais jovens de cerca de 50% a 67% para leite, fertilidade e longevidade — [Embrapa, Programa de Melhoramento Genético da Raça Girolando (fêmeas), junho de 2026](https://ainfo.cnptia.embrapa.br/digital/bitstream/doc/1187257/1/Programa-de-Melhoramento-Genetico-da-Raca-Girolando-femeas-junho-2026.pdf) (conferir o contexto).
- **Girolando, marcos.** A PTA genômica (PTAG) foi publicada em 2019 e entrou no índice de classificação final para pré-seleção de touros jovens. O índice de longevidade estreou em 2021 — mesmo documento de 2021.
- **Girolando, versão mais recente (sem data).** O sumário incorporou 15 características novas, incluindo um índice de tolerância ao estresse térmico (índice de eficiência tropical) — [Embrapa, notícia sobre o Sumário de Touros Girolando](https://www.embrapa.br/en/busca-de-noticias/-/noticia/71806796/sumario-de-touros-girolando-incorpora-15-novas-caracteristicas-ao-melhoramento-genetico-da-raca) (sem data no resultado; a conferir).
- **Sumário Girolando 2022.** Disponível em [Girolando, Sumário de Touros 2022](https://www.girolando.com.br/ckfinder/userfiles/files/imagens%202/megaleite%202022/Sumario_Touros_Girolando_2022_DOC266.pdf).
- **PTA leite de 903 kg (touro Edank TE Jabaquara).** Divulgação comercial, sem data nem fonte oficial. Não usar como referência.

### Inferences
- **Unidades.** PTAs de leite do PNMGL e do Girolando estão em quilogramas de leite, em 305 dias. Para comparar com PTAs do USDA em libras, converter (1 lb = 0,4536 kg) e alinhar a base. Inferência a partir das unidades citadas em resumo.
- **Confiabilidade tipo DE.** A lógica de DE do USDA (VanRaden & Wiggans, 1991) provavelmente se aplica à confiabilidade do PNMGL e do Girolando, mas não encontrei documento que confirme a fórmula.
- **Índice de classificação final (Girolando).** Documentos citam um índice de classificação final que inclui a PTAG. A fórmula não foi obtida.

### Gaps
- Índice composto do Gir Leiteiro (IPP, idade ao primeiro parto, tipo) e do Girolando: fórmula e pesos não obtidos.
- Guzerá (PNMGuL): não pesquisado.
- Holandês no Brasil (ABCBRH): não pesquisado. Não foi verificado se há avaliação ou índice.
- Percentis: não encontrei como são publicados nos sumários.
- Tendências genéticas de Gir e Girolando: não pesquisadas.
- PDFs dos sumários de 2025 e 2026 com PTAs de touros: não obtidos. Os PTAs citados são de exemplos antigos ou de terceiros.

## Q6. Teoria de índice de seleção e uso de GFI no acasalamento

### Takeaway
Os pesos econômicos do NM$, do BW e do BPI derivam de modelos bioeconômicos de lucro (preço, custo e produção). O GFI (genomic future inbreeding) é publicado por touro e serve de complemento ao índice na escolha de acasalamentos. Não encontrei a forma exata como o GFI entra na decisão.

### Cited Findings
- **Definição do GFI.** É a versão genômica do EFI (endogamia futura esperada, que é a endogamia média esperada quando um touro é acasalado com amostra aleatória de vacas). Usa a relação genômica do touro com uma coorte de fêmeas genotipadas nascidas nos últimos 48 meses. É recalculado a cada avaliação e na mudança de base, é calculado dentro de raça e não é específico do rebanho — [ColeJohn, Pros and cons of hitchhiking: the truth about inbreeding, Holstein USA (2019)](https://www.holsteinusa.com/pdf/genetics_conference_2019/ColeJohn_Pros%20and%20cons%20of%20hitchhiking%20-%20the%20truth%20about%20inbreeding.pdf).
- **Motivação.** A seleção intensa fechou linhagens em várias raças leiteiras, e a homozigose acumulada se associou a queda de desempenho reprodutivo — [revisão em PMC, "Genomic Analysis, Progress and Future Perspectives in Dairy Cattle Selection: A Review"](https://pmc.ncbi.nlm.nih.gov/articles/PMC7996307) (autores não capturados).
- **Peso econômico e confiabilidade.** O peso econômico do feed saved no BPI foi reduzido pela metade por baixa confiabilidade — ver Q4 (Austrália).
- **Modelo econômico do NTM.** Os valores econômicos foram derivados de modelo bioeconômico — ver Q4 (JDS 2014).

### Inferences
- **Uso conjunto.** Um critério de acasalamento típico maximiza o índice sujeito a um limite de GFI (ou penaliza o GFI). Esse formato é uma convenção de fundo, não uma prática confirmada nas fontes desta busca [não verificado].
- **GFI não substitui a relação com a vaca específica.** Como o GFI é por touro e não por par, o analista deve checar a relação direta antes do acasalamento. Inferência a partir da definição.
- **Ganhos desejados.** Índices de ganhos desejados (desired gains) ponderam as características pelo ganho que se quer obter, e não pelo valor econômico. A origem é Hazel (1943) [não verificado; fonte não obtida].

### Gaps
- Como o GFI entra formalmente em um índice ou em alocação de touros: não encontrado.
- Fórmulas de EFI e de endogamia genômica: não obtidas.
- Teoria clássica de índices (Smith, 1936; Hazel, 1943) e sua aplicação a bovinos leiteiros: não verificadas em fonte primária.

## Q7. Resposta esperada (ΔG) e tendências genéticas

### Takeaway
A resposta anual pelas quatro vias (touro para touro, touro para vaca, vaca para touro e vaca para vaca) é ΔG = Σ_k(i_k·r_k·σ_A) / Σ_k L_k, reconstruída a partir de exemplo de 1991. Esse exemplo dá cerca de 34,9 kg/ano. Não encontrei tendências atuais publicadas para o Holandês dos EUA nem para Gir e Girolando.

### Cited Findings
- **Quatro vias (Rendel & Robertson, 1950).** O resumo atribui às vias contribuições aproximadas de 43%, 18%, 33% e 6%. A fonte primária não foi lida, e a atribuição a Rendel & Robertson precisa de conferência — [documento de litígio que contém van der Weft (2017)](https://www.docketalarm.com/cases/PTAB/PGR2022-00019/Select_Sires_Inc/01-13-2022-Petitioner/Exhibit-1016-15-EX_1016___van_der_Weft_2017) (não lido; citado como localizador).
- **Fórmula, em palavras.** O progresso anual é a soma das diferenciais de seleção das vias dividida pela soma dos intervalos de geração das vias. Cada diferencial depende do número de animais escolhidos, da acurácia de classificação e da variação genética. Símbolos não obtidos — mesmas fontes (resumo).
- **Exemplo de 1991.** Diferenciais médias de todos os anos: 405, 395, 239 e 42 kg. Intervalos de geração: 10,2, 6,4, 9,3 e 5,1 anos. Tendência reportada de 34,9 kg/ano e teto teórico de 96 kg/ano — [USDA-AIPL, J. Dairy Sci. 1991, vol. 74, p. 1078](https://www.aipl.arsusda.gov/publish/jds/1991/74_1078.pdf) (autoria não verificada no resultado de busca).
- **Conflito sobre o teto de ganho.** Uma revisão cita até 2% da média por ano. Uma memória biográfica cita cerca de 1% por ano com seleção só em vacas, e 1,1% com teste de progênie em rebanho pequeno. Um resumo de 1950 cita cerca de 1% do rendimento médio em seleção direta de rebanho fechado. Não resolvido. Essas fontes não têm URL verificada.
- **Genômica e vias.** Um estudo de 2011 sobre esquemas de quatro vias com seleção genômica diz que a genotipagem de baixa densidade é mais útil na seleção das mães de touros, e que a seleção de pais de touros continua a principal fonte de ganho. Citado em resumo, sem URL verificada.

### Inferences
- **Forma da equação (reconstruída).** ΔG/ano = Σ_k(i_k·r_k·σ_A) / Σ_k L_k, com k = SS, SD, DS, DD. É equivalente a ΔG = Σ(i·r·σ) / (4·L̄), com L̄ = ΣL_k/4. Símbolos e versão exata do artigo não verificados.
- **Conta do exemplo de 1991 (verificada).** Soma das diferenciais: 405 + 395 + 239 + 42 = 1.081 kg. Soma dos intervalos: 10,2 + 6,4 + 9,3 + 5,1 = 31,0 anos. 1.081 / 31,0 = 34,87 kg/ano, consistente com os 34,9 reportados.
- **Teórico versus realizado.** O teto teórico de 96 kg/ano é 2,75 vezes o realizado (96 / 34,9 = 2,75, cálculo próprio). O resumo atribui a diferença a gerações longas demais e a pressão de seleção abaixo do ideal.
- **Ganho em % da média.** Para comparar com os tetos citados (1% ou 2% da média), é preciso a média do rebanho, que não foi obtida. Não converter sem ela.

### Gaps
- Símbolos e a forma exata da equação de quatro vias, incluindo correções de variância entre vias: não obtidos.
- Tendência genética atual do Holandês dos EUA (PTA por ano de nascimento): não pesquisada em fonte primária.
- Tendência genética de Gir e Girolando (ΔG anual): não pesquisada.
- O estudo de 2011 sobre quatro vias com genômica não foi localizado com URL.
