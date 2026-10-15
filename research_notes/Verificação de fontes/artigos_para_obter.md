# Artigos pagos para obter pelo acesso institucional

Esta lista reúne as fontes primárias dos relatórios de **corte** e **leite** que **não têm acesso livre**. O status foi conferido no OpenAlex em 15/10/2026, e os metadados (ano, periódico, volume e páginas) no Crossref.

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
| Koots KR et al. (1994). Analyses of published genetic parameter estimates for beef production traits. 1. Heritability. *Animal Breeding Abstracts* 62:309–338 | sem DOI | Meta-análise clássica de herdabilidades em corte |
| Snelling WM, Golden BL, Bourdon RM (1995). Within-herd genetic analyses of stayability of beef females. *J. Anim. Sci.* 73:993–1001 | 10.2527/1995.734993x | Fechado na editora, mas há PDF público no site do USDA-ARS, já citado no relatório. Não precisa obter |

## Como enviar
Baixe os PDFs pelo acesso da UFF (Portal de Periódicos CAPES via CAFe) e anexe-os na conversa da sessão "Modelos estatísticos". Eles são lidos para conferir as equações e não são salvos no repositório.
