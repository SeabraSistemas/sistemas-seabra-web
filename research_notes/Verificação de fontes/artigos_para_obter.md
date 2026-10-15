# Artigos pagos para obter pelo acesso institucional

Esta lista reúne as fontes primárias dos quatro relatórios que **não têm acesso livre** (pagas, para o acesso da UFF) e, no fim, os **documentos bloqueados para robôs**, que abrem no navegador sem acesso institucional. O status foi conferido no OpenAlex em 15/10/2026, e os metadados (ano, periódico, volume e páginas) no Crossref.

Todas as outras referências centrais dos dois relatórios estão abertas e serão lidas diretamente. Entre elas: VanRaden 2008, Legarra et al. 2009, Aguilar et al. 2010, Christensen & Lund 2010, Misztal et al. 2014, Gianola & Foulley 1983, Meuwissen & Luo 1992, Meuwissen et al. 2001, Daetwyler et al. 2008, Garrick et al. 2009, Legarra & Reverter 2018, Jamrozik & Schaeffer 1997, Swalve 2000, VanRaden 1997, VanRaden et al. 2004 e 2009, Schaeffer 1994 (MACE), Ravagnolo & Misztal 2000, Van Tassell et al. 2003, Hazel 1943 (PMC1209225) e Dempster & Lerner 1950 (PMC1209482).

## Essenciais (sustentam as equações centrais)

| # | Referência | DOI | Por que importa | Onde entra |
|---|---|---|---|---|
| 1 | Henderson CR (1975). Best linear unbiased estimation and prediction under a selection model. *Biometrics* 31:423–447 | 10.2307/2529430 | Fundamenta o BLUP e as equações de modelos mistos sob seleção | Corte e leite: modelo animal e MME |
| 2 | Henderson CR (1976). A simple method for computing the inverse of a numerator relationship matrix used in prediction of breeding values. *Biometrics* 32:69–83 | 10.2307/2529339 | Regras para montar A⁻¹ direto do pedigree | Corte: passo 1 do exemplo |
| 3 | Quaas RL (1976). Computing the diagonal elements and inverse of a large numerator relationship matrix. *Biometrics* 32:949–953 | 10.2307/2529279 | A⁻¹ com endogamia (d_i = 0,5 − 0,25(F_pai + F_mãe)) | Corte: regras de A⁻¹ |
| 4 | Gilmour AR, Thompson R, Cullis BR (1995). Average information REML: an efficient algorithm for variance parameter estimation in linear mixed models. *Biometrics* 51:1440–1450 | 10.2307/2533274 | AI-REML, o algoritmo usado para estimar herdabilidades | Corte e leite: estimação de variâncias |
| 5 | Willham RL (1972). The role of maternal effects in animal breeding: III. Biometrical aspects of maternal effects in animals. *J. Anim. Sci.* 35:1288–1293 | 10.2527/jas1972.3561288x | Modelo direto-materno: a base da DEP materna e do TMD | Corte: pesos até a desmama |
| 6 | Quaas RL, Pollak EJ (1980). Mixed model methodology for farm and ranch beef cattle testing programs. *J. Anim. Sci.* 51:1277–1287 | 10.2527/jas1981.5161277x | BLUP aplicado à avaliação de bovinos de corte | Corte: modelo animal |
| 7 | Kennedy BW, Trus D (1993). Considerations on genetic connectedness between management units under an animal model. *J. Anim. Sci.* 71:2341–2352 | 10.2527/1993.7192341x | Conectividade entre rebanhos, decisiva para produtores com N pequeno | Corte e leite: rebanhos com N menor |
| 8 | Wood PDP (1967). Algebraic model of the lactation curve in cattle. *Nature* 216:164–165 | 10.1038/216164a0 | Curva de lactação de Wood | Leite: curvas e pico |
| 9 | Wilmink JBM (1987). Adjustment of test-day milk, fat and protein yield for age, season and stage of lactation. *Livest. Prod. Sci.* 16:335–348 | 10.1016/0301-6226(87)90003-0 | Curva de Wilmink e ajustes do dia de controle | Leite: curvas e dia de controle |
| 10 | Ali TE, Schaeffer LR (1987). Accounting for covariances among test day milk yields in dairy cows. *Can. J. Anim. Sci.* 67:637–644 | 10.4141/cjas87-067 | Curva de Ali-Schaeffer, usada dentro dos modelos de dia de controle | Leite: curvas e regressão fixa |
| 11 | Ptak E, Schaeffer LR (1993). Use of test day yields for genetic evaluation of dairy sires and cows. *Livest. Prod. Sci.* 34:23–34 | 10.1016/0301-6226(93)90033-E | Primeiro modelo de dia de controle com rebanho-dia-de-controle (HTD) | Leite: modelo de dia de controle |
| 12 | Schaeffer LR (2004). Application of random regression models in animal breeding. *Livest. Prod. Sci.* 86:35–45 | 10.1016/S0301-6226(03)00151-9 | Revisão de referência sobre regressão aleatória (Legendre) | Leite e corte: regressão aleatória |
| 13 | Rojas de Oliveira H, Ventura HT, Costa EV et al. (2018). Meta-analysis of genetic-parameter estimates for reproduction, growth and carcass traits of Nellore cattle. *Anim. Prod. Sci.* 58:1575–1583 (online em 2017) | 10.1071/AN16712 | Herdabilidades de referência do Nelore, usadas como parâmetros para rebanhos pequenos | Corte: tabela de herdabilidades |

## Complementares

| Referência | DOI | Observação |
|---|---|---|
| Mrode RA (2014). *Linear Models for the Prediction of Animal Breeding Values*, 3ª ed. CABI | 10.1079/9781780643915.0000 | Livro-texto de referência, com exemplos resolvidos de todos os modelos. Vale checar a biblioteca da UFF |
| Mrode R, Pocrnić I, Gorjanc G, Thompson R (2023). *Linear Models for the Prediction of the Genetic Merit of Animals*, 4ª ed. CABI (ISBN 9781800620483) | 10.1079/9781800620506.0000 | **Edição atual, que substitui a 3ª.** Título novo; cada capítulo tem DOI próprio (…0003 parentesco, …0005 efeitos ambientais aleatórios, …0006 multicaracterística, …0016 sobrevivência). Código oficial dos exemplos, aberto: github.com/MrodesBook (Examples_R e Examples_BLUPF90). Registros de capítulos no CGSpace (repositório do ILRI), a conferir no navegador |
| Koots KR et al. (1994). Analyses of published genetic parameter estimates for beef production traits. 1. Heritability. *Animal Breeding Abstracts* 62:309–338 | sem DOI | Meta-análise clássica de herdabilidades em corte |
| Snelling WM, Golden BL, Bourdon RM (1995). Within-herd genetic analyses of stayability of beef females. *J. Anim. Sci.* 73:993–1001 | 10.2527/1995.734993x | Fechado na editora, mas há PDF público no site do USDA-ARS, já citado no relatório. Não precisa obter |

## Segunda prioridade (encontrados no aprofundamento de corte, 15/10/2026)

DOIs conferidos no Crossref. O conteúdo destes artigos não foi lido.

| Referência | DOI | Para quê |
|---|---|---|
| Fernandes Júnior GA et al. (2022). Current applications and perspectives of genomic selection in Bos indicus (Nellore) cattle. *Livest. Sci.* 263:105001 | 10.1016/j.livsci.2022.105001 | Única revisão de seleção genômica em Nelore |
| Garrick DJ, Golden BL (2009). Producing and using genetic evaluations in the United States beef industry of today. *J. Anim. Sci.* 87(suppl_14):E11–E18 | 10.2527/jas.2008-1431 | Fluxo da avaliação nacional de corte dos EUA |
| Montaldo HH et al. (2012). Opportunities and challenges from the use of genomic selection for beef cattle breeding in Latin America. *Animal Frontiers* 2(1):23–29 | 10.2527/af.2011-0029 | Panorama latino-americano |
| Cundiff LV, Willham RL, Pratt CA (1966). Additive versus multiplicative correction factors for weaning weight in beef cattle. *J. Anim. Sci.* 25(4):983–987 | 10.2527/jas1966.254983x | Fatores de idade da vaca: aditivos ou multiplicativos |
| Nelsen TC, Kress DD (1981). Additive and multiplicative correction factors for sex and age of dam in beef cattle weaning weight. *J. Anim. Sci.* 53(5):1217–1224 | 10.2527/jas1981.5351217x | Mesma questão |
| Northcutt SL, Wilson DE, Hoekstra JW (1994). Effect of positive genetic trend for mature size on age-of-dam adjustment factors for weaning weight. *J. Anim. Sci.* 72(4):828–832 | 10.2527/1994.724828x | Por que os fatores de idade da vaca envelhecem |
| Minyard JA, Dinkel CA (1965). Heritability and repeatability of weaning weight in beef cattle. *J. Anim. Sci.* 24(4):1072–1074 | 10.2527/jas1965.2441072x | Repetibilidade do peso à desmama (MPPA) |
| Kress DD, Burfening PJ (1972). Weaning weight related to subsequent most probable producing ability in Hereford cows. *J. Anim. Sci.* 35(2):327–335 | 10.2527/jas1972.352327x | MPPA |
| Vanmiddlesworth LL, Brown CJ, Johnson ZB (1977). Repeatability of calf weight and ratio of calf weight to cow weight in Hereford and Angus. *J. Anim. Sci.* 45(6):1247–1253 | 10.2527/jas1977.4561247x | Repetibilidade |
| Kilkenny JB (1968). A note on estimates of the repeatability of weaning weight in beef cattle. *Animal Science* 10(4):483–486 | 10.1017/s0003356100026507 | Repetibilidade |
| Nardone A, Valentini A (1989). Effect of errors in genetic and environmental variances on the BLUP estimates of sire breeding values. *Ann. Zootech.* 38(4):315–319 | 10.1051/animres:19890309 | Efeito de usar variâncias erradas no BLUP (rebanhos pequenos) |
| Maniatis N, Pollott GE (2003). The impact of data structure on genetic (co)variance components of early growth in sheep, estimated using an animal model with maternal effects. *J. Anim. Sci.* 81(1):101–108 | 10.2527/2003.811101x | Estrutura de dados e efeito materno (útil também para ovinos) |

## Ovinos leiteiros: abertos, mas bloqueados para robôs (opcional)

Segundo o OpenAlex (15/10/2026), estes artigos são de **acesso livre**. O texto completo não foi baixado porque o site das revistas bloqueia acesso automatizado. Não precisa do acesso da UFF: basta baixar no navegador e anexar, se quiser que as equações sejam conferidas no original.

| Referência | DOI |
|---|---|
| Duchemin et al. (2012). Genomic selection in the French Lacaune dairy sheep breed. *J. Dairy Sci.* | 10.3168/jds.2011-4980 |
| Baloche et al. (2014). Assessment of accuracy of genomic prediction for French Lacaune dairy sheep. *J. Dairy Sci.* 97:1107 | 10.3168/jds.2013-7135 |
| Legarra et al. (2014). Within- and across-breed genomic predictions and genomic relationships (Western Pyrenees dairy sheep). *J. Dairy Sci.* | 10.3168/jds.2013-7745 |
| Macedo et al. (2022). Removing data and using metafounders alleviates biases (Lacaune). *J. Dairy Sci.* | 10.3168/jds.2021-20860 |
| Wicki et al. (2023). Effect of subdivision of the Lacaune dairy sheep breed. *J. Dairy Sci.* | 10.3168/jds.2022-23114 |
| De Laet & Raoul (2026). Benefit of including female genotypes in the Lacaune evaluation. *J. Dairy Sci.* | 10.3168/jds.2025-27638 |
| Rodríguez-Ramilo et al. (2019). Inbreeding and effective population size in French dairy sheep. *J. Dairy Sci.* | 10.3168/jds.2018-15405 |
| Cesarani et al. (2019). Genomic selection of milk fatty acid composition in Sarda dairy sheep. *J. Dairy Sci.* | 10.3168/jds.2018-15333 |
| Granado-Tajada & Ugarte (2024). Impact of truncating historical data on prediction ability (Latxa). *Animal* | 10.1016/j.animal.2024.101245 |

## Ovinos leiteiros: pagos (acesso UFF)

Segundo a verificação de ovinos (15/10/2026), DOIs conferidos no Crossref.

| Referência | DOI | Para quê |
|---|---|---|
| Gutiérrez JP et al. (2007). *Small Rumin. Res.* 70(2-3):233–238 | 10.1016/j.smallrumres.2006.03.009 | Herdabilidades da Assaf |
| de la Fuente LF et al. (1996). *Livest. Prod. Sci.* 45(2-3):171–178 | 10.1016/0301-6226(96)00003-6 | Escala linear de úbere em ovelhas |
| Rendel JM, Robertson A (1950). *J. Genet.* 50(1):1–8 | 10.1007/bf02986789 | Ganho genético por vias de seleção |
| Wilson EB (1927). *J. Am. Stat. Assoc.* 22(158):209–212 | 10.1080/01621459.1927.10502953 | Intervalo de Wilson para taxas |
| Brown LD, Cai TT, DasGupta A (2001). *Stat. Sci.* 16(2):101–133 | 10.1214/ss/1009213286 | Comparação de intervalos para proporções (Project Euclid bloqueou robôs; pode estar aberto no navegador) |
| Falconer DS, Mackay TFC. *Introduction to Quantitative Genetics* (livro) | sem DOI | Índice de seleção; checar a biblioteca da UFF |

Barillet (2007, *Small Rumin. Res.*, DOI 10.1016/j.smallrumres.2007.01.004) e Ramón et al. (2010, *J. Dairy Sci.* 93:3303) aparecem nas notas de ovinos como pagos ou sem versão aberta encontrada.

## Documentos bloqueados para robôs (baixar no navegador, sem acesso UFF)

Os servidores destes documentos recusaram o acesso automatizado (certificado inválido, desafio anti-robô ou página de bloqueio). Nada foi contornado. Abertos no navegador, devem baixar normalmente.

| Documento | Onde | Para quê |
|---|---|---|
| Fórmula oficial do ISOL em pontos (Lacaune) | Idele (idele.fr), dossiês da avaliação genética e da genômica ovina | Confirmar a fórmula do índice; hoje só há um trecho de busca, não usado nos exemplos |
| Programa de melhoramento Latxa-Carranzana | MAPA da Espanha (mapa.gob.es), página dos programas de raças ovinas | Ganho de 2,5% a 3% ao ano e genotipagem dos machos |
| Relatório MAPA/INIA sobre avaliação genética de ovinos de leite | MAPA da Espanha (mapa.gob.es) | Genômica da Assaf e da Manchega |
| Catálogo 2025 da Latxa Cara Negra (ASLANA/INTIA) | https://intiasa.es/web/sites/default/files/assets/images/LCN-NA%20-%20Cat%C3%A1logo%202025%20ARDI.pdf | Pesos do índice da Latxa |
| Astruc et al., ICAR Bled 2024 (slides) | https://old.icar.org/Documents/Bled-2024/PPTs/S7_2_Astruc_ICAR2024_Bled_Session7_PARASITES.pdf | Resistência a parasitas na Lacaune |
| Baloche et al., WCGALP 2014 (HAL) | https://hal.inrae.fr/hal-02742682/file/2014_Baloche_10WCGALP_Vancouver_1.pdf | Genômica da Lacaune |
| Regulamento (CE) 853/2004, versão consolidada | EUR-Lex | Conferir a versão vigente (a verificação usou o texto original de 2004) |

## Como enviar
Baixe os PDFs pelo acesso da UFF (Portal de Periódicos CAPES via CAFe) e anexe-os na conversa da sessão "Modelos estatísticos". Eles são lidos para conferir as equações e não são salvos no repositório.
