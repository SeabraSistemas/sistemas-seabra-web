# Modelos estatísticos por característica e parâmetros genéticos típicos em bovinos de corte

> **Escopo e limitações.** Notas para o redator. Cobrem modelos de avaliação por característica (crescimento com efeitos maternos, multicaracterísticas, limiar para facilidade de parto, prenhez de novilhas, permanência e longevidade, perímetro escrotal, carcaça e ultrassom, eficiência alimentar, curvas de crescimento e regressão aleatória, composição racial e temperamento) e parâmetros típicos em Nelore/zebu e em taurinos (Angus, Hereford). Genômica (GBLUP, ssGBLUP, métodos bayesianos) e implementação de programas nacionais ficam fora do escopo; estudos genômicos aparecem só como fonte de valores de referência.
>
> **Limitação de método.** Só a busca web estava disponível. Nenhuma fonte foi lida em texto integral; os dados vêm de resumos e trechos de busca. Por isso as equações marcadas como forma padrão não foram extraídas de fonte.
>
> **Marcadores usados.** **[indireta]** = o achado aparece em outro trabalho que cita o original, e o original não foi lido. **[atribuição a confirmar]** = o valor apareceu em trecho cujo vínculo com o artigo listado não ficou inequívoco. **[não verificado]** = conhecimento de fundo, sem fonte localizada. DOIs listados vieram de páginas encontradas na busca; nenhum foi criado.

## 1. Crescimento com efeitos diretos e maternos (modelo animal direto-materno)

### Takeaway
Pesos de crescimento (nascimento, desmama, sobreano) são analisados com modelo animal direto-materno (Willham 1972) com covariância genética direta-materna. Em Nelore, h² direta à desmama fica perto de 0,13–0,20 e a materna perto de 0,07–0,11; a covariância σam é o parâmetro menos estável, e o seu sinal depende da estrutura dos dados.

### Cited Findings
- Modelo: o fenótipo é decomposto em efeitos direto e materno não observados, cada um com parte genotípica e ambiental; estimam-se σ²a, σ²m, σam, σ²pe (materna) e σ²e. Willham (1972), J Anim Sci 35:1288–1293 [indireta] — [Direct and maternal genetic parameters for growth traits in Jersey crossbred cattle, J Agric Sci 2024](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/E634983EF106695E72C27BA1EE5CEDA1/S0021859624000285a.pdf/direct-and-maternal-genetic-parameters-for-growth-traits-in-jersey-crossbred-cattle.pdf)
- Nelore, peso à desmama, Maternal phenotypic records shape the genetic parameter estimates in Nelore beef cattle, Animal (2024): h²d estável entre estruturas de dados; h²m e a correlação direta-materna mudam. A rdm vai de −0,20 a +0,31 conforme aumenta a proporção de vacas com registro próprio. Os autores suspeitam que os sinais negativos de estudos anteriores tenham origem em modelo ou estrutura de dados — [ScienceDirect, Animal 2024](https://www.sciencedirect.com/science/article/abs/pii/S1871141324000301)
- Nelore, peso à desmama com escore de úbere, análise bayesiana bivariada, Animal (2021): h²d = 0,13 e h²m = 0,11 para peso à desmama — [ScienceDirect, Animal 2021](https://www.sciencedirect.com/science/article/abs/pii/S1871141321000081)
- Nelore, componentes de variância diretos e maternos em pesos de crescimento, PubMed 8586581: valores de 205 d (h²d ≈ 0,17; h²m ≈ 0,09) [atribuição a confirmar] — [PubMed 8586581](https://pubmed.ncbi.nlm.nih.gov/8586581)
- Nelore, peso ao nascer (estimação de covariâncias com critérios alternativos de edição de dados): h²d = 0,27; h²m = 0,07; rdm = −0,07. Página com texto parcialmente corrompido [atribuição a confirmar] — [ResearchGate](https://www.researchgate.net/publication/343224911_Estimation_of_covariance_components_for_birth_weight_in_Nellore_cattle_using_alternative_data_editing_criteria)
- Angus australiano, pesos de campo: h²d = 0,35 (nascimento), 0,20 (desmama), 0,24 (sobreano), 0,25 (600 d); h²m = 0,08, 0,09, 0,06 e 0,04, respectivamente. Livestock Production Science (1995, ano pelo PII) — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/0301622695000836)
- Angus, Estimation of Genetic Parameters and Prediction for Body Weight of Angus Cattle, Agriculture (2025): h²m cai com a idade, de cerca de 0,44 a 0,02; correlações genéticas positivas entre pesos de idades diferentes (0,061 a 0,828) — [DOI 10.3390/agriculture15111216](https://doi.org/10.3390/agriculture15111216)
- Hereford polled (sem chifres), Glaze & Schalles (1995, Kansas Agric. Exp. Stn. Res. Rep.): h² do leite = 0,19; h² do peso materno à desmama = 0,18; h² direta do peso à desmama = 0,14. rg(PD direto, PD materno) = −0,10; rg(PD, leite) = 0; rg(PD materno, leite) ≈ 0,99 — [Relationships between weaning weight, maternal weaning weight, and milk production in polled Hereford cattle](https://newprairiepress.org/kaesrr/vol0/iss1/639/)
- Hereford, efeitos direto, materno e avô materno para peso ao nascer e à desmama, J Anim Sci 76:2521 (1998). Resumo lido; valores não extraídos — [Parameter estimates for direct, maternal, and grandmaternal genetic effects for birth weight and weaning weight in Hereford cattle](https://academic.oup.com/jas/article-abstract/76/10/2521/4643265)
- Pesos do Pantanal (Nelore, 2024; ver seção 9): h²d = 0,35–0,75 e h²m = 0,03–0,08 ao longo das idades — [MDPI Animals 2024](https://www.mdpi.com/2306-7381/11/7/318)

### Inferences
- A h²m de Nelore (≈0,07–0,11) é da mesma ordem da de Angus e Hereford (≈0,04–0,09 em peso à desmama), mas a rdm é mais instável no zebu. Antes de comparar EPD entre bases, verificar se σam foi estimado ou fixado.
- A fórmula do total maternal (leite + ½ PD direto) é padrão em programas de corte [não verificado — definição não lida em fonte BIF]. A rg de ≈0,99 entre PD materno e leite (Hereford, 1995) sugere que o componente leite carrega quase toda a informação materna à desmama.

### Forma padrão do modelo (não verificada na fonte)
```
y = Xb + Z1a + Z2m + Z3pe + e
var([a; m]) = G0 ⊗ A,  G0 = [σ²a  σam; σam  σ²m]
var(pe) = σ²pe (sobre as mães com registros);  var(e) = Iσ²e
h²d = σ²a / σ²P;  h²m = σ²m / σ²P
σ²P = σ²a + σ²m + 2σam + σ²pe + σ²e          [não verificado]
```

### Gaps
- Equações e estrutura de variância exatas das fontes Nelore não foram lidas (só resumos).
- Koch (1972), "Maternal effects in beef cattle", J Anim Sci 35:1316–1323, e Meyer (1992), Livest Prod Sci 31:179–204, aparecem só como citação em fonte secundária; sem URL localizado.
- Estimativas específicas para 205/210/240 d, 365/450/550 d e a relação entre elas não foram localizadas.
- Um estudo REML com 27.549 bezerros de 57 rebanhos (efeitos maternos modestos ao nascimento e à desmama, presentes ao sobreano) apareceu em trecho sem fonte identificada.

## 2. Modelos multicaracterísticas: seleção e viés

### Takeaway
Quando um registro (ex.: sobreano) é coletado após seleção baseada em outro registro (ex.: desmama), a avaliação univariada que ignora os registros de animais descartados fica viesada. Modelos multicaracterísticas que incluem todos os registros evitam esse viés. Base: Quaas & Pollak (1980), Pollak & Quaas (1981), Pollak, van der Werf & Quaas (1984).

### Cited Findings
- Pollak, van der Werf & Quaas (1984), J Dairy Sci, "Selection Bias and Multiple Trait Evaluation": exemplo em corte com peso ao sobreano. Compara avaliação só por sobreano, que ignora desmama de animais descartados, com análise multicaracterística de desmama e pós-desmama — [DOI 10.3168/jds.S0022-0302(84)81481-2](https://doi.org/10.3168/jds.S0022-0302(84)81481-2)
- Pollak & Quaas (1981), "Monte Carlo study of genetic evaluations using sequentially selected records", J Anim Sci 52:257. Citado em Pollak et al. (1984); conteúdo não lido [indireta] — [DOI 10.3168/jds.S0022-0302(84)81481-2](https://doi.org/10.3168/jds.S0022-0302(84)81481-2)
- Quaas & Pollak (1980), "Mixed model methodology for farm and ranch beef cattle testing programs", J Anim Sci 51:1277–1287. Citado como base de BLUP com modelo animal em estudo Hereford [indireta] — [Selection for postweaning growth in inbred Hereford cattle, Fort Keogh](https://www.researchgate.net/publication/21591726_Selection_for_postweaning_growth_in_inbred_Hereford_cattle_the_Fort_Keogh_Montana_line_1_example)
- Viés por relato seletivo de peso à desmama em corte: título localizado, conteúdo não lido — [ResearchGate](https://www.researchgate.net/publication/15534515_The_effect_of_selective_reporting_on_estimates_of_weaning_weight_parameters_in_beef-cattle)

### Forma padrão (não verificada na fonte)
```
y_i = X_i b_i + Z_i u_i + e_i ,  i = 1..t
var(u) = G ⊗ A ;  var(e) = R ⊗ I                  [não verificado]
```

### Gaps
- Henderson & Quaas (1976), citado no pedido, não foi localizado. Referência de fundo [não verificado].
- Magnitude do viés em estimativas de Nelore não foi localizada.

## 3. Características categóricas: modelo de limiar para facilidade de parto (direta e materna)

### Takeaway
Facilidade de parto (CE) é um escore ordinal analisado por modelo de limiar (variável latente, probit ou logit). O modelo sire-maternal grandsire (sire-MGS) separa o efeito direto do touro do efeito materno (avô materno). Em Nelore, h²d fica perto de 0,11–0,27 e h²m perto de 0,07–0,39, muito dependente do modelo. Em registros antigos de Angus, a correlação direta-materna é forte e negativa (−0,22 a −0,93).

### Cited Findings
- Gianola & Foulley (1983), "Sire evaluation for ordered categorical data with a threshold model", Genet Sel Evol 15. Citado em listas de referências; artigo não lido; páginas não verificadas [indireta; não verificado] — [Estimation of calving difficulty covariance components of Iranian Holstein heifers using a sire-maternal grandsire threshold model](https://www.cambridge.org/core/journals/proceedings-of-the-british-society-of-animal-science/article/abs/estimation-of-calving-difficulty-covariance-components-of-iranian-holstein-heifers-using-a-sirematernal-grandsire-threshold-model/8963B1691AD1417CFE6380AA7EDB5EFE)
- Modelo sire threshold (Djemali et al., 1987) usado na avaliação dos EUA a partir de 1988. O sire-MGS entrou em 2003 (Van Tassell et al., 2003; Wiggans et al., 2003). Motivação: antagonismo entre efeitos direto e materno, e acurácia de touros de serviço [indireta] — [JDS 2003 abstract, USDA-AIPL](https://aipl.arsusda.gov/publish/jds/2003/abs86_1845.html)
- Correlação genética para efeito de filha ou de avô materno: 0,74 a 0,91, abaixo da correlação para efeito de touro (próxima de 1) [atribuição a confirmar] — [8WC Wiggans, USDA-AIPL 2006](https://aipl.arsusda.gov/publish/other/2006/8WC_Wiggans_01-92.pdf)
- Nelore, novilhas primíparas, modelo sire-MGS threshold (Animal 2020, título localizado): h²d = 0,18 e h²m = 0,39, com covariância direta-materna fixada em zero. A revisão citada no mesmo artigo traz h²d de 0,072–0,13 e h²m de 0,007–0,07 para modelos sire ou sire-MGS — [ScienceDirect, Animal 2020](https://sciencedirect.com/science/article/abs/pii/S1871141320302249?via=ihub%3D)
- Nelore, dois traços, modelo animal threshold-linear, primíparas (JBG 2024) [atribuição a confirmar]: h²d = 0,27 e h²m = 0,19 — [Wiley, JBG 2024](https://onlinelibrary.wiley.com/doi/abs/10.1111/jbg.12851)
- Nelore, ANCP, 39.664 registros de novilhas nascidas em 2010–2017: h²d = 0,11 a 0,24; h²m = 0,09 a 0,11, conforme modelo. Os autores consideram o caráter adequado à seleção direta — [PubMed 40035329](https://pubmed.ncbi.nlm.nih.gov/40035329/)
- Leiteiro: threshold deu h²d de 12% contra 8% no modelo linear, e h²m de 4% contra 2% — [Genetic parameters of calving ease in dairy cattle using threshold and linear models, 2018](https://www.tandfonline.com/doi/full/10.1080/1828051X.2018.1482801)
- Angus, registros antigos de rebanhos (PubMed 3989079): h²m = 0,27 e 0,20; h²d = 0,21 e 0,07; rdm = −0,93 e −0,80 [atribuição a confirmar] — [PubMed 3989079](https://pubmed.ncbi.nlm.nih.gov/3989079/)
- Faixa de rdm entre raças (incluindo Angus) de −0,93 a −0,22 em revisão citada [atribuição a confirmar] — [J Dairy Sci 2025, beef-on-dairy](https://www.sciencedirect.com/science/article/pii/S0022030225007945)
- Angus: peso ao nascimento direto e facilidade de parto direta altamente correlacionados; rg peso ao nascer × escore de parto = 0,76; rg CED × CEM = 0,42 — [Angus CED/CEM document](https://www.angus.org/Nce/Documents/CedCemEpd.pdf); [ISU ASL-1628](https://www.extension.iastate.edu/Pages/ansci/beefreports/asl-1628.pdf)

### Forma padrão (não verificada na fonte)
```
Latente:    l_i = x_i'b + z_i'u + e_i ;  y_i = k  se  τ(k-1) < l_i ≤ τ(k)
Probit:     e ~ N(0,1) (variância residual fixada em 1)
h² latente: σ²a / (σ²a + 1)                                  [não verificado]
Sire-MGS:   u contém efeito de touro (s), de avô materno (g) e
            covariância entre eles na forma G0 ⊗ A           [não verificado]
Escala observada: transformação de Dempster & Lerner (1950)  [não verificado]
```

### Inferences
- Fixar a covariância direta-materna em zero, como no estudo Nelore de 2020, pode inflar h²m. Comparações de h²m exigem a mesma estrutura de covariância.
- Nos dados leiteiros, o modelo de limiar dá h² maiores que o linear. Para comparar com a literatura de corte, a escala precisa estar declarada.

### Gaps
- Gianola & Foulley (1983) não foi lido; DOI não localizado.
- Definição de calving ease nas diretrizes BIF não foi localizada.
- Modelo sire-MGS com rdm estimada em Nelore não foi localizado.

## 4. Probabilidade de prenhez de novilhas (HP, prenhez aos ~14 meses)

### Takeaway
A prenhez de novilhas aos ~14 meses (HP; 1 = prenhe, 0 = vazia, verificada cerca de 60 dias após o fim da estação de monta) é avaliada por modelo de limiar ou modelo linear. Em Nelore a h² varia de 0,18 a 0,57 conforme modelo e base de dados. A correlação genética com idade ao primeiro parto é fortemente negativa (≈ −0,85); com crescimento é fraca (|r| 0,02–0,30). Há interação com calor: a h² cai de 0,17 (THI 82,5) para 0,01 (THI 88).

### Cited Findings
- Definição: novilhas expostas a touro aos ~14 meses; prenhez verificada cerca de 60 dias após a estação; tratada como característica categórica [atribuição a confirmar] — [PubMed 12002332](https://pubmed.ncbi.nlm.nih.gov/12002332/)
- Eler et al. (2002), "Genetic evaluation of the probability of pregnancy at 14 months for Nellore heifers": 11.487 animais; h² = 0,57 (EP 0,01) pelo Método R. Método R não é estimativa de limiar; a escala não é declarada no resumo — [PubMed 12002332](https://pubmed.ncbi.nlm.nih.gov/12002332/)
- Modelo bayesiano linear-limiar multicaracterística, 121.086 animais: h²HP = 0,50; HH = 0,36; PRE = 0,26; MUS = 0,26; BONE = 0,26 [atribuição a confirmar] — [CorrDB 25023297](https://www.animalgenome.org/CorrDB/references/25023297.pdf)
- Modelo animal de seis traços (2014) [atribuição a confirmar, mesma fonte]: h²HP = 0,37; AFC = 0,18; STAY = 0,19; PRODAM = 0,16; PWG = 0,21; HH = 0,37
- Correlações reprodutivas: rg HP × AFC = −0,85; correlações entre reprodutivos e crescimento de 0,02 a 0,30 em valor absoluto [atribuição a confirmar] — [CorrDB 25023297](https://www.animalgenome.org/CorrDB/references/25023297.pdf)
- Prenhez precoce com modelo threshold univariado: h² = 0,18, abaixo dos 0,47–0,73 citados na literatura Nelore. Os autores atribuem a diferença a dados e modelo — [ScienceDirect, Animal 2024](https://www.sciencedirect.com/science/article/abs/pii/S1871141324001884)
- Calor (reação de norma de limiar): h² = 0,17 em THI 82,5 e 0,01 em THI 88; rg entre os extremos = −0,47 (EP 0,10) — [ScienceDirect, Animal 2018](https://www.sciencedirect.com/science/article/abs/pii/S1871141318305778)
- Peso maduro e crescimento inicial × HP; altura do anca e escores de conformação × PP14. Títulos localizados, valores não extraídos — [Animal 2018](https://www.sciencedirect.com/science/article/pii/S1871141318300647); [Animal 2013](https://www.sciencedirect.com/science/article/abs/pii/S1871141313001108)

### Inferences
- A faixa 0,18–0,57 provavelmente reflete escala (liability ou observada, linear ou Método R), modelo e base de dados. Não agregar sem checar a escala.
- HP e AFC são quase o mesmo caráter geneticamente (rg ≈ −0,85). Pesar ambos num índice é redundante [inferência].

### Gaps
- Modelo de HP dos programas brasileiros (efeitos aleatórios, função de ligação) não foi recuperado.
- Valores de HP ou PP14 em Angus ou Hereford não foram localizados nesta busca.

## 5. Permanência (stayability), sobrevivência e longevidade; "3 partos"

### Takeaway
Permanência tem h² baixa em taurinos e zebuínos (≈0,09–0,17 na escala original). O modelo threshold (animal ou sire) é o padrão. Modelos de sobrevivência Weibull de riscos proporcionais, com fragilidade, são usados para idade à última cria e longevidade, com h² ≈ 0,09–0,25 conforme escala e censura. O termo "3P/D3P" não foi confirmado nesta busca.

### Cited Findings
- Snelling et al. (1995), J Anim Sci 73:993–1001: modelos mistos não lineares para dados binários de permanência de fêmeas (duas populações, BSF e BIC). h² de S(5|1) = 0,11 (BSF) e 0,14 (BIC). Os autores sugerem S(5|1) como candidato à avaliação nacional — [ARS PDF](https://ars.usda.gov/arsuserfiles/30300000/Publications/JAS73-993-1001Snelling.pdf)
- Hudson & Van Vleck (1981): definição de permanência como probabilidade condicional de atingir uma idade, dado que a fêmea chegou a ela. Artigo original não lido [indireta; detalhes não verificados] — [BIF 2006, Brigham](https://www.bifconference.com/bif2006/pdfs/Brigham.pdf)
- Hereford, modelo threshold sire aninhado, probit, 1.868 vacas (2003): h² na escala original = 0,09 a 0,17; rg entre idades baixa a moderada [atribuição a confirmar] — [Agricultural Statistics Conference 2003](https://newprairiepress.org/agstatconference/2003/proceedings/21/)
- STAY6 em avaliação genética de corte nos EUA (ASA): probabilidade de as filhas entrarem e permanecerem no rebanho até 6 anos. Slides BIF citam h² = 0,12, mas não deixam claro a qual característica se refere [atribuição a confirmar] — [BIF 2015, Speidel](https://www.bifconference.com/bif2015/documents/2015BIF-JointSession-Speidel.pdf)
- Nelore, permanência por threshold: h² STAY5 = 0,117 ± 0,003; STAY6 = 0,122 ± 0,004; STAY7 = 0,171 ± 0,005. Definição: parir a uma idade dado que pariu antes — [ScienceDirect, Livestock Production Science (ano pelo PII ≈ 2002)](https://www.sciencedirect.com/science/article/abs/pii/S0301622602001495)
- Nelore, idade à primeira concepção, Weibull misto de sobrevivência: h² = 0,51 (escala log) e 0,76 (escala original). Pereira (2006), J Anim Breed Genet, DOI 10.1111/j.1439-0388.2006.00567.x — [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/j.1439-0388.2006.00567.x)
- Nelore, Weibull de riscos proporcionais para descarte, 22.313 vacas: h² = 0,1020 (censura 16 m), 0,1002 (26 m) e 0,0871 (36 m) [atribuição a confirmar; fonte não localizada]
- Idade à última cria, Weibull de riscos proporcionais (estudo de 2016 com título localizado): h² ≈ 0,25 [atribuição a confirmar] — [Springer 2016](https://link.springer.com/article/10.1007/s13353-016-0353-6)
- Leiteiro (Jersey), comparação Weibull PH × linear: h² na escala log = 4,7%; na escala original = 18,0%. Riscos proporcionais dão 0,15–0,20 contra 0,05–0,10 do modelo linear — [J Dairy Sci 2004](https://www.sciencedirect.com/science/article/pii/S0022030204732981)
- Survival Kit: programa em Fortran 90 para modelos de riscos proporcionais e extensões de fragilidade, com efeitos aleatórios possivelmente correlacionados. Mészáros, Sölkner & Ducrocq (2013), conforme descrição em AGRIS — [AGRIS](https://agris.fao.org/search/fr/records/669e83b900eb85b7d72c0ca4)
- Ducrocq et al. (1988), J Dairy Sci: justificativa do modelo Weibull para vida produtiva. Citado em estudo de raça de corte, original não lido [indireta; páginas não verificadas] — [Cambridge, Bruna dels Pirineus](https://www.cambridge.org/core/journals/animal-science/article/factors-influencing-length-of-productive-life-and-replacement-rates-in-the-bruna-dels-pirineus-beef-breed/6D5239731B162D8CAF34B904746566A6)
- Nelore, rg de permanência entre o 2º e o 8º parto: 0,57 (Nelore), 0,77 (Guzerá), 0,79 (Tabapuã) — Animal (2018) [atribuição a confirmar] — [DOAJ, Animal 2018](https://doaj.org/article/25f2d8d7bcd5448dad7e88bca2ca255d)
- Nelore, probabilidade de parir até 39 meses (PC39) e permanência em 64 e 76 meses, ≈2,3 milhões de registros Geneplus. Os autores descrevem os resultados como insatisfatórios, porque 65% dos bezerros vinham de vacas com mais de 3,3 anos. rg PC39 × SC550 = 0,25 — [LRRD 30(5), 2018](https://www.lrrd.org/lrrd30/5/sabri30082.html)
- Definição de permanência usada em avaliação bayesiana (uso só da definição; método fora de escopo): vaca com ≥ 3 partos até 76 meses; 51,7% de sucesso. Probabilidade de parto precoce: 29% — [ScienceDirect, Animal 2018](https://www.sciencedirect.com/science/article/abs/pii/S187114131830297X)
- Nelore fêmeas, avaliação bayesiana 2025: permanência de baixa h², com efeitos ambientais relevantes — [PMC12501739](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12501739/)
- Nelore, permanência por número de parto: regiões genômicas específicas do terceiro parto (só evidência de que existe STAY por parto) — [BMC Genomics 2024](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-024-10020-y)

### Inferences
- "3P/D3P" não tem definição localizada. Pelos estudos acima, deve referir-se à permanência até o terceiro parto (STAY3 ou PS3) [não verificado].
- A escala altera muito a h² de modelos Weibull: no mesmo estudo Nelore, 0,51 contra 0,76; no Jersey, 4,7% contra 18%. Comparar só valores da mesma escala.

### Gaps
- Hudson & Van Vleck (1981) não lido. Definição exata de STAY nas diretrizes BIF não recuperada.
- Definição de "3 parições" nos programas brasileiros não confirmada. Questões de implementação ficaram fora do escopo.

## 6. Perímetro escrotal (PE365/SC365, PE450) e relação com idade ao primeiro parto

### Takeaway
Em Nelore, SC365 tem h² moderada (≈0,29 em análise bayesiana), enquanto AFC e permanência são baixas (≈0,08–0,09). A rg SC–AFC é pequena e, na maioria dos estudos recentes, negativa (−0,05 a −0,14). Medidas aos 12 meses chegam a −0,42. Há um relato antigo de sinal positivo, o que exige checar a convenção de sinal.

### Cited Findings
- Análise bayesiana de traços reprodutivos Nelore (2020): h² SC365 = 0,29; AFC = 0,08; STAY = 0,09 [atribuição a confirmar pelo título] — [PubMed 32087916](https://pubmed.ncbi.nlm.nih.gov/32087916/)
- Santana et al. (2023): rg SC–AFC negativa, entre −0,05 e −0,14, conforme o ambiente pré-natal em população grande de Nelore. Fonte não localizada nesta busca [não localizado]
- SC aos 12 e 15 meses: rg SC–AFC = −0,42 (SC12) e −0,25 (SC15); rg SC–HP = +0,43 e +0,26 [atribuição a confirmar] — [ScienceDirect, Theriogenology 2015](https://www.sciencedirect.com/science/article/abs/pii/S0093691X1500076X)
- Rebanho antigo de Nelore: rg SC–AFC positiva (0,23 a 0,29), descrita pelos autores como favorável. Fonte não identificada [conflito a checar]
- SC em condições de ambiente: h² = 0,30–0,33 em condições ruins e 0,60–0,63 em condições favoráveis (2026) — [Animal Genetics 2026](https://onlinelibrary.wiley.com/doi/10.1002/age.70105)
- Meta-análise de Nelore (Oliveira et al., 2018): h²d de SC em várias idades acima de 0,40; AFC ≈ 0,15 (a menor); peso a 450 d acima de 0,40; rg positivas, exceto AFC — [Animal Production Science 2018](https://www.publish.csiro.au/an/AN16712)

### Inferences
- SC e AFC são em grande parte independentes geneticamente. O sinal pode ser lido como "fraco e negativo" na maior parte dos dados, mas a idade de medição muda o resultado. Use só os parâmetros do mesmo conjunto de dados.

### Gaps
- Valores de SC e de PE450 em taurinos (Angus, Hereford) não foram localizados.
- Modelo típico (animal bivariado ou regressão aleatória) para SC não foi confirmado em fonte. O estudo de 2015 usa regressão aleatória bivariada.

## 7. Características de carcaça e ultrassom (AOL/REA, gordura, marmoreio)

### Takeaway
Em Nelore, h² de área de olho de lombo (AOL/REA) e de espessuras de gordura por ultrassom fica entre ≈0,20 e 0,51, com grande amplitude entre estudos. Em medidas repetidas, AOL tem h² ≈0,33–0,46. Em Angus sul-africano, REA = 0,32, gordura = 0,33–0,34 e IMF = 0,38. As gorduras são fortemente correlacionadas geneticamente entre si, e a gordura intramuscular tem antagonismo genético com a subcutânea.

### Cited Findings
- Nelore, medidas repetidas (10–26 meses): h²AOL = 0,33–0,46; h²gordura subcutânea = 0,20–0,26; h²gordura de garupa = 0,26–0,29; repetibilidade = 0,42–0,73 — [PubMed 22179966](https://pubmed.ncbi.nlm.nih.gov/22179966)
- Nelore, medidas por ultrassom com peso aos 120 d como covariável [atribuição a confirmar]: h² AOL = 0,35; gordura subcutânea = 0,51; gordura de garupa = 0,39 — [ScienceDirect, Animal 2007](https://www.sciencedirect.com/science/article/abs/pii/S1871141307005604)
- Nelore, faixa da h² de AOL na literatura: 0,18 a 0,66. Outro conjunto citado: AOL = 0,32; gordura subcutânea = 0,19; gordura de garupa = 0,28. Fontes não localizadas [não localizado]
- Nelore, ssGBLUP (2018), usado só como referência: rg crescimento × AOL = 0,30 a 0,66; crescimento × SC; gorduras × crescimento = −0,07 a 0,20 — [ScienceDirect, Animal 2018](https://www.sciencedirect.com/science/article/abs/pii/S187114131830297X)
- Meta-análise de Nelore (Oliveira et al., 2018): h²d de carcaça entre 0,20 e 0,40 para a maior parte dos traços — [Animal Production Science 2018](https://www.publish.csiro.au/an/AN16712)
- Meta-análise aleatória de parâmetros de carcaça e qualidade de carne em corte. Valores não extraídos — [Springer 2021](https://link.springer.com/article/10.1007/s11250-021-02862-5)
- Angus sul-africano, ultrassom ao vivo: h² SCW = 0,38 ± 0,08; gordura P8 = 0,34 ± 0,06; gordura RB = 0,33 ± 0,05; REA = 0,32 ± 0,06; IMF = 0,38 ± 0,06. rg peso ao escaneamento × REA = 0,79 ± 0,07; gorduras entre si com rg = 0,71 a 0,99; antagonismo entre IMF e gordura subcutânea — [SASAS](https://www.sasas.co.za/?p=4581)
- Angus (Iowa, Hassen, Wilson & Rouse): h² do UPFAT subiu de 0,36 (37 semanas) para 0,54 (54 semanas). Trecho cortado antes do valor de REA [atribuição a confirmar] — [ISU Digital Press](https://iastatedigitalpress.com/air/article/7449/galley/7278/download)
- Angus (Iowa, Wilson, Rouse & Hays): escaneamentos em novilhas com h² moderadas (> 0,40), acima das estimativas só com touros [atribuição a confirmar] — [ISU Digital Press](https://iastatedigitalpress.com/air/article/6448/galley/6313/download)
- Angus tcheco: forte rg entre gordura intramuscular e subcutânea, desfavorável para o programa — [VÚZV](https://vuzv.cz/publikace/genetic-parameters-for-live-animal-ultrasound-measures-in-czech-aberdeen-angus)
- Angus Association, tabela de herdabilidades e correlações (2026): inclui REA e ultrassom, mas a tabela não foi legível no trecho — [Angus Association](https://cd.angus.org/tools-resources/national-cattle-evaluation/heritabilities-and-genetic-correlations)
- Nelore, parâmetros de carcaça e reprodutivos (Theriogenology 2016, título localizado; valores não extraídos) — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0093691X16304885)

### Inferences
- A gordura de medidas repetidas (0,20–0,26) é menor que a de um escaneamento único aos ~120 d (0,51). Idade e peso no escaneamento alteram a estimativa, por isso um valor de h² precisa vir com a idade de medição.

### Gaps
- Marmoreio em Nelore: um estudo com 614.395 animais e modelo de limiar foi mencionado, mas a fonte não foi localizada.
- Modelos de carcaça com covariáveis de idade e peso em Nelore não foram localizados.

## 8. Eficiência alimentar: RFI e CAR

### Takeaway
RFI é o resíduo da regressão do consumo de matéria seca sobre o ganho médio diário (GMD) e o peso metabólico (PM^0,75), conforme Koch et al. (1963) [não verificado]. Em Nelore, a h² do RFI numa população experimental é ≈0,18, abaixo da do consumo (0,47). Uma GWAS de Nelore implica h² ≈0,38, o que diverge. Em Angus, a h² do RFI fica entre ≈0,26 e 0,43 na literatura citada. A rg RFI × GMD é próxima de zero em Angus australiano.

### Cited Findings
- RFI em Nelore (lucratividade em confinamento): consumo observado menos consumo predito a partir de peso metabólico e GMD, citando Koch et al. (1963) — [PMC13054126](https://pmc.ncbi.nlm.nih.gov/articles/PMC13054126/)
- RFI dentro de grupo de contemporâneos = resíduo de regressão múltipla de CMS sobre GMD e PM^0,75. Sainz et al. (2024, JBG): rg de NEmR com área de olho de lombo = −0,128 e com SC365 = 0,128 — [Wiley, JBG 2024](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12870)
- População experimental de Nelore: h² GMD = 0,43; CMS = 0,47; RFI = 0,18 [atribuição a confirmar] — [PLOS ONE, Nelore experimental population](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0164390)
- GWAS de Nelore (BMC Genetics 2014): variância aditiva CMS = 0,29 e RFI = 0,20; variância residual CMS = 0,42 e RFI = 0,33. A h² implícita é ≈0,41 para CMS e ≈0,38 para RFI. Cálculo meu a partir das variâncias, não reportado pelo artigo no trecho — [Springer BMC Genetics 2014](https://link.springer.com/article/10.1186/1471-2156-15-21)
- Angus, tese com resumo de literatura: h² do RFI = 0,39–0,43 (Arthur et al., 2001) e 0,26–0,30 (Crews et al., 2003) — [Ohio State thesis](https://etd.ohiolink.edu/acprod/odb_etd/ws/send_file/send?accession=osu1229619401&disposition=inline)
- Angus, estudo com variâncias e covariâncias: h² direta de peso a 200 d = 0,17 e a 400 d = 0,27; rg RFI × peso 200 d = −0,45; RFI × peso 400 d = −0,26; RFI × GMD = −0,04 [atribuição a confirmar] — [ResearchGate](https://www.researchgate.net/publication/11589949_Genetic_and_phenotypic_variance_and_covariance_components_for_feed_intake_feed_efficiency_and_other_postweaning_traits_in_Angus_cattle)
- Angus australiano: rg RFI × GMD e × espessura de gordura ≈ 0 — [ResearchGate](https://www.researchgate.net/publication/327026824_Genetic_and_phenotypic_associations_of_feed_efficiency_with_growth_and_carcass_traits_in_Australian_Angus_cattle)
- Herd & Arthur (2009), "Physiological basis for residual feed intake", J Anim Sci 87(14 Suppl):E64–71. Citado, não lido — [DOI 10.2527/jas.2008-1345](https://doi.org/10.2527/jas.2008-1345)
- Modelo longitudinal de RFI: coeficientes variáveis no tempo sobre GMD e peso metabólico. Raça não confirmada no trecho — [GSE 2021](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-021-00641-2)
- Revisão citada: h² do RFI de até 42% em bovinos de corte em crescimento; rg entre consumo e medidas de crescimento de 0,25 a 0,79. Fonte não localizada [não localizado]

### Forma padrão (não verificada na fonte)
```
CMS = β0 + β1·GMD + β2·PM^0,75 + RFI          (RFI = resíduo)     [Koch et al. 1963, não verificado]
Modelo animal univariado: RFI = Xb + Za + e;  h² = σ²a / (σ²a + σ²e)
```

### Inferences
- A divergência de h² do RFI (0,18 contra ≈0,38) pode vir da escala, de covariáveis incluídas (GMD e PM fixos ou aleatórios), da população ou da data. Não combinar sem checar.
- RFI correlaciona-se pouco com GMD, ao contrário do CMS. Por isso o RFI pode ser selecionado sem grande mudança no crescimento [inferência a partir de Angus e Nelore].

### Gaps
- Koch et al. (1963) não lido; detalhes da citação [não verificados].
- CAR (ganho residual) não localizado.
- Modelo genético multicaracterístico completo (CMS, GMD, PM) de programas brasileiros não localizado.

## 9. Curvas de crescimento não lineares e regressão aleatória (Legendre)

### Takeaway
Em Nelore, Brody tende a ser o melhor ajuste entre as curvas não lineares, com Gompertz e von Bertalanffy também adequadas. Os parâmetros A (peso assintótico), B e K têm h² baixa a moderada (Polled Nellore: A ≈ 0,11; B ≈ 0,16; K ≈ 0,30). Para pesos longitudinais, a regressão aleatória com polinômios de Legendre (ordens 3 a 6) dá EBV mais acurados que multicaracterística (Boligon et al., 2011). No Pantanal (2024), h²d foi de 0,35 a 0,75 e h²m de 0,03 a 0,08.

### Cited Findings
- Comparação de funções não lineares em Nelore: PubMed 18708609 (título). Resultado: Brody, von Bertalanffy e Gompertz adequadas para padrão médio e predição de peso adulto de fêmeas [atribuição a confirmar] — [PubMed 18708609](https://pubmed.ncbi.nlm.nih.gov/18708609/)
- Nelore, modelos mistos não lineares (ambos os sexos): Brody teve melhor ajuste. Tornar A e K aleatórios reduziu a variância residual em 79% nos machos e 83% nas fêmeas — [PMC9817709](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9817709/)
- Polled Nellore, Brody: h² de A ≈ 0,11; B ≈ 0,16; K ≈ 0,30. Mesmo com h² baixa para A, houve ganho genético no peso assintótico — [ResearchGate](https://www.researchgate.net/publication/360854328_Fit_and_genetic_parameters_of_the_growth_curve_of_Polled_Nellore_cattle)
- Nelore fêmeas, REML com modelo animal: valores de A ≈ 0,39–0,42 e de K ≈ 0,39–0,44 entre modelos. Não rotulados como h² no trecho; natureza do valor não confirmada — [ResearchGate](https://www.researchgate.net/publication/237451645_Genetic_trends_in_the_expected_progeny_difference_of_the_asymptotic_weight_of_Nelore_females)
- Nelore, regressão aleatória com Legendre cúbico (Mato Grosso do Sul; ~234.000 pesagens de ~47.500 animais; 0–650 d; seleção por AIC/BIC). h² ao nascimento = 0,36 e 0,28 (duas regiões); h² aos 650 d = 0,47 e 0,65 [atribuição a confirmar] — [Semina (UEL)](https://ojs.uel.br/revistas/uel/index.php/semagrarias/article/view/33658)
- Nelore, funções de covariância de 0 a 630 d (ordens 3 a 6; até 77 parâmetros): h²m com pico em ≈110–120 d; correlações diretas moderadas a altas — [PubMed 11768105](https://pubmed.ncbi.nlm.nih.gov/11768105/) (2001)
- Boligon et al. (2011): 87.712 pesagens de 8.144 fêmeas. Ordens: 4 para efeito direto, 6 para ambiente permanente, 3 para materno. Regressão aleatória deu EBV mais acurados que multicaracterística — [PubMed 21732287](https://pubmed.ncbi.nlm.nih.gov/21732287)
- Pantanal (Animals 2024, 11(7):318): 6.974 bezerros e 53.233 pesagens; h²d = 0,35–0,75; h²m = 0,03–0,08. Os autores alertam que Legendre gera problemas quando a variância cresce nas extremidades da idade — [MDPI](https://www.mdpi.com/2306-7381/11/7/318)
- B-splines quadráticas ajustam melhor que Legendre com o mesmo número de parâmetros, segundo resumo de fonte secundária — [science.gov](https://www.science.gov/topicpages/p/polynomial+regression+model.html)

### Formas padrão (não verificadas na fonte)
```
Brody:        W(t) = A (1 − B e^(−Kt))
Gompertz:     W(t) = A exp(−B e^(−Kt))
von Bertalanffy: W(t) = A (1 − B e^(−Kt))^3
Logística:    W(t) = A / (1 + B e^(−Kt))          [parametrizações variam; verificar]
RRM:          y = Xb + Φ(t)·a_i + Φ(t)·m_i + ... ;  G = Φ K Φ'   (Φ: Legendre em [−1, 1])   [não verificado]
```

### Inferences
- Para EPD em pontos de peso, Brody ou Gompertz permitem comparar A e K. Para RRM, a ordem é escolhida por AIC/BIC, e ordens altas tendem a instabilizar as extremidades.

### Gaps
- Correlações genéticas entre A, B, K e peso em Nelore não localizadas.
- Forma exata do modelo de regressão aleatória do Boligon (2011) não foi lida.

## 10. Heterose, composição racial e modelos multiraciais

### Takeaway
A população Montana Tropical (composta, com pelo menos três raças) tem, por pedigree, ≈21% de zebu; a ancestralidade genômica dá ≈24%. A heterose se mantém alta com endogamia baixa. Recombinação tem efeito oposto à heterose em carcaça e crescimento. Modelos recentes incluem composição racial, heterose e recombinação.

### Cited Findings
- Origem: 1994, Brasil. Quatro tipos biológicos: zebu (sobretudo Nelore), taurinos tropicais adaptados (Senepol e Romosinuano), britânicos (Angus) e continentais (Charolês, Simental, Limousin) — [PMC12887133](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887133/)
- Composição média por pedigree: zebu 20,8%; taurino tropical adaptado 50,5%; britânico 21,1%; continental 7,6%. Zebu genômico ≈24% (DP 5,41) — [PMC12887133](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887133/)
- Regras de composição por tipo biológico (mínimos e máximos) — [PMC7057717](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7057717/) [fonte a confirmar]
- Recombinação com efeito oposto à heterose em carcaça (≈12.000 animais) e em crescimento (≈400.000 animais), estatisticamente significativo [atribuição a confirmar] — [ResearchGate](https://www.researchgate.net/publication/356924309_Efeitos_da_heterose_e_recombinacao_sobre_caracteristicas_de_carcaca_medidas_por_ultrassonografia_de_bovinos_compostos_Montana_Tropical)
- Componentes de variância de crescimento com composição racial, heterose e recombinação: "mais robustos" nos modelos que incluem essas fontes (Genes 2026) — [DOI 10.3390/genes17020173](https://doi.org/10.3390/genes17020173)
- Efeitos diretos e maternos em crescimento na Montana Tropical (GWAS). Valores não extraídos — [ScienceDirect, Animal 2019](https://www.sciencedirect.com/science/article/abs/pii/S1871141319303932)

### Forma padrão (não verificada na fonte)
```
y = Xb + Zu + Σ_k (covariável de composição racial k) + δ·H + e
H = proporção de heterozigose esperada (indivíduo)  [não verificado]
```

### Gaps
- Equações de modelo multiracial com covariáveis de composição e heterose não localizadas nas fontes lidas.
- Angus × Nelore (Brangus, 5/8 × 3/8) apareceu na busca, mas não foi recuperado para parâmetros.

## 11. Temperamento e docilidade

### Takeaway
Temperamento em Nelore tem h² ≈ 0,21 pelo modelo linear e ≈ 0,26 pelo modelo de limiar (Lucena et al., 2015). A correlação genética com peso à desmama é moderada e negativa (≈ −0,33). Em população maior, a velocidade de fuga tem h² mais alta que os escores.

### Cited Findings
- Lucena et al. (2015), Animal, Genetic analysis of the temperament of Nellore cattle using linear and threshold models: h² = 0,21 ± 0,003 (linear) e 0,26 (limiar; IC 95% 0,21–0,32). rg com peso à desmama = −0,33 a −0,34. Correlação entre valores genéticos dos dois modelos > 0,92 — [Cambridge, Animal 2015](https://resolve.cambridge.org/core/journals/animal/article/genetic-analysis-of-the-temperament-of-nellore-cattle-using-linear-and-threshold-models/EA08D7A42C0B4A9C5F79E8E8A7F4C933); [DOAJ](https://doaj.org/article/8a3427b23f8846989d53122c7ea7e792)
- Estudo brasileiro com ≈23.420 Nelore e escores aos 550 d: h² velocidade de fuga = 0,35; escore de temperamento = 0,15; escore de brete = 0,19; movimento = 0,18. Os autores sugerem a velocidade de fuga, por ganho esperado maior e registro eletrônico. Fonte não confirmada [candidato, atribuição a confirmar] — [UNESP](https://acervodigital.unesp.br/handle/11449/92569)

### Inferences
- Para docilidade, os ranqueamentos dos modelos linear e de limiar são quase iguais (correlação > 0,92). A escolha de modelo afeta pouco a seleção.

### Gaps
- h² de temperamento em Angus ou Hereford não localizadas.

## 12. Herdabilidades e correlações típicas: síntese Nelore e taurinos

### Takeaway
A meta-análise de Oliveira et al. (2018, Nelore) é a referência quantitativa mais útil encontrada. A h² direta fica entre 0,20 e 0,40 para a maioria dos traços, inclusive carcaça; é ≈0,15 para idade ao primeiro parto; acima de 0,40 para SC e peso a 450 d; a h² materna de crescimento fica entre 0,06 e 0,11. Os taurinos recuperados (Angus australiano e sul-africano, Hereford) batem nas mesmas faixas. Os valores de Koots et al. (1994) não foram recuperados.

### Cited Findings
- Oliveira et al. (2018), Animal Production Science 58(9):1575–1583: 197 h² e 107 rg de 62 publicações. Para a maior parte dos traços (gestação, pesos, peso maduro e carcaça), h²d ≈ 0,20–0,40. AFC ≈ 0,15. SC e peso a 450 d > 0,40. h²m de crescimento 0,06–0,11. rg majoritariamente positivas, exceto AFC. Mesma característica em idades diferentes: rg > 0,85 — [Animal Production Science 2018](https://www.publish.csiro.au/an/AN16712)
- Koots et al. (1994), análise de estimativas publicadas de herdabilidade em produção de corte. [não verificado — referência de fundo]. Valores não recuperados. Um perfil de autor cita o trabalho com ≈319 citações — [rankless](https://www.rankless.org/authors/kr-koots)
- Meta-análise zebuína de 2005 (atribuição a confirmar, provavelmente Giannotti et al.): h²d pooled = 0,30 (peso ao nascer), 0,23 (desmama), 0,27 (365 d) e 0,31 (550 d) — [Nottingham bibliography](https://vetsrev.nottingham.ac.uk/bibliography/giannotti_meta-analysis_2005.html)
- Meta-análise bayesiana de crescimento em corte, Pesquisa Agropecuária Brasileira. Valores não extraídos — [PAB](https://apct.sede.embrapa.br/pab/article/view/7100). Meta-análise com agrupamento, Revista Brasileira de Zootecnia. Valores não extraídos — [RBZ](https://rbz.org.br/article/cluster-analysis-for-meta-analysis-implementation-for-heritability-of-estimates-growth-traits-in-beef-cattle/)

### Comparação resumida (faixas da literatura lida; escala e modelo variam)

| Característica | Nelore/zebu | Taurinos (Angus, Hereford) | Seções |
|---|---|---|---|
| PN direto | 0,27 [atrib. a confirmar] | 0,35 (Angus AU) | 1 |
| PD direto | 0,13–0,23 | 0,14–0,20 | 1 |
| PD materno | 0,07–0,11 | 0,04–0,18 | 1 |
| Leite | não localizado | 0,19 (Hereford, 1995) | 1 |
| CE direta | 0,11–0,27 | 0,07–0,21 (antigo) | 3 |
| CE materna | 0,09–0,39 | 0,20–0,27 (antigo) | 3 |
| HP (prenhez de novilha) | 0,18–0,57 | não localizado | 4 |
| Permanência | 0,12–0,17 | 0,09–0,17 (Hereford) | 5 |
| SC365 | 0,29 (bayes) a >0,40 (meta) | não localizado | 6 |
| AFC | 0,08 (bayes) a ≈0,15 (meta) | não localizado | 6 |
| AOL/REA | 0,33–0,46 (repetida); 0,18–0,66 (faixa) | 0,32 (Angus SA) | 7 |
| Gordura subcutânea | 0,20–0,51 | 0,33–0,34 | 7 |
| IMF | não localizado | 0,38 (Angus SA) | 7 |
| RFI | 0,18 (exp.); ≈0,38 (implícito) | 0,26–0,43 | 8 |
| Temperamento | 0,15–0,35 | não localizado | 11 |
| A, B, K (Brody) | não localizado (Polled Nellore: 0,11; 0,16; 0,30) | não localizado | 9 |

Correlações úteis: rg HP × AFC ≈ −0,85 (Nelore); rg SC × AFC ≈ −0,05 a −0,14 (Nelore, maior medida aos 12 meses); rg RFI × GMD ≈ 0 (Angus AU); rg PD direto × PD materno ≈ −0,10 (Hereford); rg intra-característica entre idades > 0,85 (meta, Nelore).

### Inferences
- Nelore e taurinos têm h² de crescimento e carcaça na mesma faixa; a maior diferença aparece em características de adaptação e categóricas (HP, CE), onde a base taurina recuperada é menor.

### Gaps
- Valores de Koots et al. (1994) não recuperados.
- Diretrizes BIF (guidelines e proceedings) e WCGALP/AAABG não foram lidas diretamente, exceto um trabalho do 8WC (2006) e slides BIF (2006, 2014, 2015). Não houve acesso a teses FZEA, UNESP, UFV, UFMG nem a publicações da Embrapa Gado de Corte com texto integral.
- PE450 em Nelore e taurinos não localizado. Valores de 365, 450 e 550 d por modelo não foram extraídos.
- Modelo genético formal (equações) da maior parte das características não foi lido em fonte. As formas padrão deste arquivo são de conhecimento de fundo e estão marcadas.
