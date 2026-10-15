# Avaliação genética de ovinos leiteiros: expressão das EBVs, índices de seleção e esquemas de seleção

**Escopo.** Expressão das EBVs, composição e pesos dos índices, desenho dos esquemas (pirâmide, núcleo, IA, progênie, pré-seleção genômica), conectividade, endogamia e uso prático por rebanhos pequenos. Modelos de produção, funcionais e genômicos internos ficam com outros pesquisadores.

**Legenda de status das fontes.**
- **[lido]**: texto completo do PDF lido (arquivos em `/tmp/claude-0/-home-user-sistemas-seabra-web/2f601efb-0b7e-558e-b507-febc0682ae9c/scratchpad/fontes/ovinos/`).
- **[resumo]**: resumo lido via Crossref ou Europe PMC.
- **[snippet]**: trecho de resultado de busca, sem abertura do documento. Usar só com confirmação.
- **[não verificado]**: não encontrei fonte confiável.

**Bloqueios de acesso.** Todos os PDFs da HAL (hal.inrae.fr e hal.science) devolveram a página de desafio anti-bot ("Making sure you're not a bot!"). Por isso não consegui ler Ramón et al. 2010, Baloche et al. 2014 (WCGALP), Barillet et al. 2001 (GSE), Legarra et al. 2014 (citado por Granado; não localizado) nem a apresentação 3R de 2014 sobre a Lacaune aos 25 anos. Os catálogos de sementais da ASLANA (intiasa.es) falharam por certificado TLS expirado. Não desativei a verificação TLS nem contornei o desafio. Barillet 2007 é pago (Elsevier).

---

## Pergunta-chave 1: Como as EBVs são expressas nos programas de ovinos leiteiros

### Takeaway
Os programas lidos expressam EBVs em unidades do caractere: litros de leite e g/L de gordura e de proteína. Também usam um índice de síntese por ovelha ou carneiro. A base genética, a fórmula da confiabilidade do CD e a unidade do índice não aparecem nas fontes abertas que consegui ler, então ficam como lacuna.

### Achados citados
- Na França, Larroque (2011) reporta tendências anuais de EBV por ano de nascimento dos machos, Lacaune 1990–2008: MY +5,3 litros/ano (0,15 σg); F% +0,19 g/L (0,05 σg); P% +0,16 g/L (0,07 σg). Por conversão própria, 0,19 g/L equivale a 0,019 ponto percentual. [Larroque H. (2011), EAAP Stavanger, "National genetic evaluations in dairy sheep and goats in France" [lido]](https://docs.eaap.org/2011/S49_Larroque.pdf)
- No mesmo documento, o modelo de produção é "BLUP single trait, repeatability animal model, unknown parents genetic groups". Os traços de úbere usam "BLUP multiple-trait animal model". Os efeitos ambientais incluem herd×year×parity, idade ao parto, período de parto e intervalo parto–primeiro controle. [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido]
- Na mesma apresentação aparece "Reliability: 0.30" na seção de traços de úbere. O contexto não ficou claro no texto extraído, então não uso o número como definição. [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido, layout corrompido]
- Baloche et al. (2011) usam como referência a "DYD" (desvio de produção das filhas, derivado de BLUP). A acurácia é medida como correlação entre o valor genômico ou de pedigree e a DYD na população de validação. Não é a acurácia teórica. [Baloche G. et al. (2011), EAAP S49, "Work in progress on genomic evaluation using GBLUP in French Lacaune dairy sheep breed"](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Lasarte (2018), ASLANA, Navarra: a ficha de carneiro mostra "Genetic value: +51" (leite), "Repetibility: 74 %", "Daugthers: 8 / Lactations: 8 / Flocks: 5", "Fat % genetic value: +0,062", "Protein % genetic value: +0,122" e "Combined index: 3.365". As unidades dos valores de gordura e proteína não estão indicadas no slide. O que aparece é repetibilidade, não confiabilidade. [Lasarte (2018), SERAM, Atelier 1](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Confiabilidade de carneiros com filhas em poucos rebanhos. O exemplo de Lasarte (8 filhas, 5 rebanhos) ilustra o problema, sem fórmula. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Tamanho da amostra de filhas: Baloche et al. (2011) usam amostras de "40 daughters" por carneiro. A população de validação tem média de 37 filhas, com amplitude de 10 a 79. Os carneiros de referência têm média de 89 filhas, com amplitude de 25 a 1.683. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Para carneiros de referência, o slide de Granado-Tajada e Ugarte (2018) mostra EDC médio (sigla não expandida no slide) de 79,76 no grupo de treino (nascidos 1984–2011) e 40,26 no grupo de validação (nascidos 2012–2014). [Granado-Tajada I., Ugarte E. (2018), EAAP S26, "Genomic selection on Latxa dairy sheep"](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido]
- Filiação para reduzir erro de atribuição de paternidade: pelo menos 10 dias entre dois carneiros colocados com o mesmo lote de ovelhas. [Réussir, artigo sobre registro do pai dos cordeiros; URL de origem não confirmada entre os resultados de busca](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances) [snippet]
- Monta natural e IA na França. Mais de 80% das Lacaune e cerca de 50% das Manech Tête Rousse no controle leiteiro oficial são inseminadas. [Réussir (URL não confirmada)](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances) [snippet]. A taxa de IA dentro do núcleo está na Tabela 1 de Astruc (ver Pergunta 3).
- Sincronização para IA aumenta a prolificidade e a variância em 15 a 30%, o que pode viesar comparações entre descendências. [Réussir (URL não confirmada)](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances) [snippet]
- Carneiros de rebanhos comerciais recebem ganho genético dos núcleos por monta natural ou IA com carneiros nascidos nos rebanhos núcleo. [Astruc, ICAR Technical Series no. 14 (Riga), "Use of genomic data in French dairy sheep breeding programs: results and prospects"](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido; ano não confirmado, citando Barillet 1997]
- Baloche et al. (2011) observam que a relação entre correlações e ganho relativo é menor na ovelha do que no bovino. Uma explicação proposta é a falta de tratamento preferencial e grupos contemporâneos maiores. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido, hipótese dos autores]

### Inferências
- Como as EBVs dos carneiros se baseiam em filhas de rebanhos núcleo, a comparação entre um carneiro de IA e um de monta natural depende de quantos rebanhos e de quantas filhas o carneiro tem. A ficha de Lasarte é um exemplo concreto.
- A "acurácia" usada nas validações francesas e espanholas é uma correlação com a DYD, não a raiz da confiabilidade do modelo. Um analista que escrever exemplos numéricos precisa deixar essa diferença explícita.

### Lacunas
- Fórmula do CD (contrôle de descendance) e da confiabilidade associada. Nenhuma fonte lida define a fórmula, e não achei percentuais de confiabilidade para CD. [não verificado]
- Base genética de referência (ano-base, média = 100 ou zero, sexo). [não verificado]
- Unidade do índice combinado da ASLANA (3,365, por exemplo). [não verificado]
- Fórmula de confiabilidade para machos com poucas fazendas no contexto francês. [não verificado]
- Ministério da Agricultura francês (documento de testagem): séries de testagem de no mínimo 10 carneiros por raça. [snippet; URL: https://info.agriculture.gouv.fr/boagri/document_administratif-1f5548eb-1291-43e5-a53e-b45c0939b8ac/telechargement]

---

## Pergunta-chave 2: Composição e pesos dos índices de seleção

### 2.1 Lacaune (ISOL)

### Takeaway
Duas fontes apontam a mesma estrutura: metade do índice vem de produção e metade de caracteres funcionais. Mas os nomes dos componentes não batem entre elas, e a fórmula com pesos do ISOL não foi lida em fonte primária.

### Achados citados
- Astruc (ICAR): critério de seleção Lacaune = "1/2 (FY+PY+F%+P%) + 1/2 (SCC+U)". Nota da tabela: "Economic values for each trait included in the subindex for milk production (MY, or FY, PY, F%, P%) and in the subindex for functional traits (SCC, U) are not described". MY = quantidade de leite; FY e PY = quantidades de gordura e proteína; F% e P% = teores; SCC = contagem de células somáticas; U = morfologia de úbere. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- Pelo texto de Astruc, o critério de produção da Lacaune é FY+PY+F%+P%, sem MY. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- O programa Lacaune inclui caracteres funcionais com 50% de peso desde 2005. [Astruc (ICAR Riga), citando Barillet et al. 2006 e Barillet 2007](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- A seleção Lacaune usa leite e teores, CCS e morfologia de úbere, além do genótipo PrP para scrapie. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Larroque (2011) menciona "Udder merit index" e "New total merit index" (projeto OSIRIS, "A computing tool of weights"). O slide não traz valores. [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido, só títulos]
- O ISOL é o "index synthétique global ovin lait". Metade dele são caracteres de produção: quantidade de leite, TB e TP. Carneiros recebem ISOL calculado a partir das filhas. [Gambin, blog (URL: https://gambin.co/blog/schema-insemination-ovins/)](https://gambin.co/blog/schema-insemination-ovins/) [snippet, blog comercial]. Mesma afirmação em Réussir, sobre o ISOL. [Réussir (URL não confirmada)](https://www.reussir.fr/grace-la-selection-je-gagne-pres-de-sept-litres-de-plus-par-et-par-brebis) [snippet]
- Segundo Réussir, apenas a UPRA Lacaune pode acrescentar um critério ao ISOL. A seleção genômica entrou no esquema Lacaune Lait em 2015. [Réussir (URL não confirmada)](https://www.reussir.fr/grace-la-selection-je-gagne-pres-de-sept-litres-de-plus-par-et-par-brebis) [snippet]
- Ganho genético da Lacaune em leite: 6,4 litros na tabela de Astruc. O cabeçalho da coluna está ambíguo ("Annual Genetic gain in MY for rams 2009 in liters (1995-2007)"). [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- Ganho anual de MY +5,3 litros (1990–2008) por Larroque (ver Pergunta 1). [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido]
- Trade-off entre leite e úbere (observação de ICAR). Um apresentação ICAR de 2010 sugere que a seleção só para leite erodiria a saúde do úbere. Sem URL confirmada. [snippet, origem não confirmada]

### Inferências
- O ISOL parece ser um índice de síntese com dois subíndices de peso igual (produção e funcional), como Astruc descreve. Mas Astruc não diz se o subíndice de produção inclui MY. Blogs dizem que sim. Esse conflito precisa ser resolvido com a UPRA Lacaune ou com o Idele antes de escrever exemplos.
- Os pesos dentro de cada subíndice, e os valores econômicos, não estão nas fontes lidas. Qualquer exemplo numérico do ISOL é "[não verificado]".

### Lacunas
- Fórmula, pesos e unidades do ISOL. [não verificado]
- Versão atual do índice, e se o nome "ISOL" é o atual ou se houve renomeação (a pergunta cita isso). [não verificado]
- Pesos econômicos da Lacaune. Astruc diz que não estão descritos. [não verificado]

### 2.2 Manech e Basco-Béarnaise

### Takeaway
Pela tabela de Astruc, o critério dos Manech e do Basco-Béarnaise é só produção (FY+PY+F%+P%). Não encontrei pesos nem fórmula dos índices Manech ou Basco em fontes lidas.

### Achados citados
- Critério de seleção: Manech Tête Rousse FY+PY+F%+P%, ganho anual de 3,8 litros. Manech Tête Noire FY+PY+F%+P%, ganho de 1,2 litro. Basco-Béarnaise FY+PY+F%+P%, ganho de 2,9 litros. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido; mesma ressalva de cabeçalho]
- As raças pirenaicas incluem gordura e proteína desde 2001. Em 2009 entrou um novo critério para aumentar as produções e os teores. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- Genômica para Manech e Basco: implantada em 2017. Ganho de acurácia em população de raça única: MTN 0,11; MTR 0,16; BB 0,06. Predições multirraça não aumentaram a acurácia. [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido, citando Legarra et al. 2014]
- Tamanho dos programas (2009): Manech Tête Rousse 270.000 ovelhas, 151 carneiros de IA testados. Manech Tête Noire 100.000 ovelhas, 36 carneiros. Basco-Béarnaise 80.000 ovelhas, 52 carneiros. [Astruc (ICAR Riga), Tabela 1](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- Um estudo antigo de Manech sugere que a oposição genética entre leite e TP é maior que entre leite e TB. O documento não foi lido por completo e a referência é sem data. [snippet, origem não confirmada]

### Inferências
- Como o critério dos Manech é só produção, a seleção para úbere e CCS nessas raças depende de outros programas ou de outro índice. Não tenho fonte que confirme isso.

### Lacunas
- Fórmula e pesos do índice Manech Tête Rousse, Manech Tête Noire e Basco-Béarnaise. [não verificado]
- Nome do índice atual de cada raça. [não verificado]

### 2.3 Latxa

### Takeaway
A Latxa tem um índice combinado desde 2008. Ele junta leite, composição (gordura e proteína) e morfologia de úbere. Os pesos vêm de catálogos da ASLANA e não consegui abri-los. Além disso, os pesos dos catálogos de 2022/2023 somam 108%, então precisam ser checados.

### Achados citados
- Cronologia: 1984 programa de seleção; 1985 IA; 1988 primeiro ranking de carneiros; 1993 acasalamentos dirigidos na IA; 2005 avaliação genética de composição e úbere; 2008 índice combinado. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- O índice combinado da ASLANA junta leite, composição e morfologia de úbere. Morfologia inclui inserção e verticalidade dos tetos. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Objetivos da Latxa: produção de leite, gordura e proteína, morfologia de úbere. Melhoria anual de 3,5–4% em leite (Ugarte, 2017, citado em Granado). [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido]
- Melhoria de 4 litros por lactação e por ano. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Ganho genético de 0,8–1,2% ao ano em estudo de 1995 do CIHEAM. [snippet; URL: https://ressources.ciheam.org/ressources/om/pdf/a55/03600074.pdf, não lido]
- Catálogo da ASLANA 2025 (Latxa Cara Negra, Navarra): 50% quantidade de leite, 25% qualidade do leite, 25% morfologia de úbere. Catálogos de 2022 e 2023: 47% / 34% / 27%, que somam 108%. [snippet dos resultados de busca; PDFs não lidos: https://intiasa.es/web/sites/default/files/assets/images/LCN-NA%20-%20Cat%C3%A1logo%202025%20ARDI.pdf e https://intiasa.es/web/sites/default/files/assets/files/ganaderia/Cat%C3%A1logo%20Selecci%C3%B3n%20ASLANA%202023.pdf]
- Participação: cerca de 18–20% dos rebanhos Latxa no programa. [snippet; URL: https://neiker.eus/?p=6807]

### Inferências
- A combinação 50/25/25 do catálogo de 2025 é uma leitura possível do índice atual, mas não é fonte primária. Os pesos de 2022/2023 não fecham em 100%. O analista precisa ler o PDF de 2025 pelo acesso do usuário.
- A escala "Latxa" Navarra (ASLANA, 30.000 ovelhas, 72 rebanhos) é diferente da escala da raça inteira (Granado: 209.981 ovelhas Latxa Red Faced em 4.226 rebanhos). Não são conflitantes, são escopos diferentes.

### Lacunas
- Fórmula e unidades do índice combinado Latxa. [não verificado]
- Pesos oficiais do índice, a partir do documento primário. [não verificado]

### 2.4 Churra (ANCHE)

### Takeaway
ANCHE opera dois esquemas, um para leite e outro para carne. Não encontrei fórmula ou pesos.

### Achados citados
- Dois esquemas (leite e cordeiro), com identificação eletrônica de cada ovelha. Documento do MAPA de 2021: 82 rebanhos colaboradores (43 em leite e 39 em carne). [snippet; URL: https://servicio.mapama.gob.es/ca/ganaderia/temas/zootecnia/pcchurraactualizado22-11-2021_tcm34-581198.pdf, não lido]
- Estudo genômico da Universidade de León com cerca de 1.700 ovelhas do núcleo ANCHE identificou cinco regiões genômicas ligadas à conformação de úbere. Artigo citado no Journal of Dairy Science, sem DOI confirmado. [snippet; origem não confirmada]

### Lacunas
- Índice da Churra, pesos e unidades. [não verificado]
- Documento completo do MAPA de 2021 (URL acima). [não lido]

### 2.5 Assaf (ASSAF.E)

### Takeaway
Não encontrei índice nacional oficial de seleção para o Assaf na Espanha. Há estudos genéticos com herdabilidades, mas não com pesos.

### Achados citados
- A raça chegou à Espanha em 1977. A ASSAF.E gerencia o livro genealógico desde 2005. [snippet; URL: https://eprints.ucm.es/42858/, documento de origem não confirmado]
- Herdabilidade de produção de leite padronizada em 180 dias: cerca de 0,13 a 0,18 (estudo de 2007, 42.197 registros de controle diário e 7.654 lactações). [snippet, origem não confirmada]
- Parâmetros genéticos de traços de queijaria em Assaf espanhol (Sánchez-Mayor et al., Livestock Science, 2019). [snippet; sem DOI verificado]

### Lacunas
- Índice ou pesos da ASSAF.E. [não verificado]

### 2.6 Manchega

### Takeaway
Ramón et al. (2010) estimam pesos econômicos para gordura e proteína na Manchega. A proteína tem peso um pouco maior que a gordura, e o carreador tem peso próximo de zero ou negativo. Os valores numéricos não consegui ler, porque o texto completo está em HAL e a página de download está bloqueada.

### Achados citados
- Referência verificada: Ramón J., Legarra A., Ugarte E., Garde J.J., Pérez-Guzmán M.D. (2010), "Economic weights for major milk constituents of Manchega dairy ewes", *J. Dairy Sci.* 93:3303–3309. DOI 10.3168/jds.2009-2787 (verificado no Crossref). PMID 20630246. [Crossref](https://api.crossref.org/works/10.3168/jds.2009-2787) para o DOI, [Europe PMC](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2009-2787%22&format=json&resultType=core) para o resumo. Cópia HAL: https://hal.inrae.fr/hal-02666463/file/2010_Ramon_Journal_of_Dairy_Science_1.pdf (bloqueada). [resumo]
- Método: o lucro é a diferença entre receitas e custos. A receita vem da venda de leite para a indústria de queijo a um preço de referência. O custo é energia, com preço da unidade de alimento por leite-forragem. O valor econômico é a derivada parcial do lucro em relação a cada característica. [Ramón et al. (2010), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2009-2787%22&format=json&resultType=core) [resumo]
- Pesos de gordura e de proteína são semelhantes, com proteína um pouco maior em todos os casos. [Ramón et al. (2010), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2009-2787%22&format=json&resultType=core) [resumo]
- Padronizados pelo desvio genético, o valor da proteína sobe e o da gordura cai. Os pesos são pouco sensíveis a níveis de produção e preços de mercado, exceto ao preço do leite. [Ramón et al. (2010), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2009-2787%22&format=json&resultType=core) [resumo]

### Inferências
- "Carreador" no resumo provavelmente é a produção de leite sem alteração de gordura e proteína. Essa leitura é inferência minha e não está no resumo. [não verificado]

### Lacunas
- Valores numéricos dos pesos econômicos de Ramón et al. (2010). [não verificado, texto bloqueado]

### 2.7 Sarda

### Takeaway
A Sarda é uma raça leiteira. Os objetivos da AssoNaPa incluem quantidade e qualidade do leite, úbere e prolificidade. Não encontrei fórmula de índice nem pesos.

### Achados citados
- Objetivos: aumentar quantidade e qualidade do leite, melhorar a conformação de úbere e aumentar a prolificidade. Teores médios do leite: 6% de gordura e 5,3% de proteína. [AssoNaPa, ficha da Sarda, URL: https://www.assonapa.it/public/schede-ovini/SARDA.pdf](https://www.assonapa.it/public/schede-ovini/SARDA.pdf) [snippet, não lido]
- Um índice BLUP de modelo animal aparece na ficha de caprinos da Sarda, não na de ovinos. Não está claro se a Sarda ovina usa o mesmo índice. [snippet; URL: https://www.assonapa.it/public/schede-caprini/SARDA.pdf]
- Genômica de Sarda/AGRIS: valores genéticos para proteína do leite, resistência a parasitos gastrointestinais e conformação de úbere. Coleta de DNA para resistência a Visna-Maedi. [snippet; URL: https://www.assonapa.it/public/cheesr/4.4_B_Relazione_CHEESR_AGRIS.pdf, não lido]

### Lacunas
- Fórmula ou pesos do índice Sarda. [não verificado]

### 2.8 Como os valores econômicos são derivados (leite pago por sólidos e rendimento de queijo; Roquefort)

### Takeaway
A derivação mais citada é a da derivada parcial do lucro em relação a cada característica (Ramón et al. 2010). A fórmula de pagamento do leite de Roquefort não foi encontrada.

### Achados citados
- Derivação: valor econômico é a derivada parcial da função lucro, com receita de venda de leite e custos com energia. [Ramón et al. (2010), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2009-2787%22&format=json&resultType=core) [resumo]
- Roquefort usa apenas leite de Lacaune, normalmente cru. [snippet; Wikipedia, https://en.wikipedia.org/wiki/Lacaune_sheep, fonte fraca]
- Rendimento de queijo em ovinos: cerca de 25,8% para leite de ovelha em geral e cerca de 20% para a Manchega. A previsão depende de gordura, proteína e lactose. Fórmulas de gordura e proteína são bem estudadas em bovinos, mas podem servir mal para ovinos. [snippet; fonte não lida: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9854559/]
- Estudo de 25 anos da Lacaune na região de Roquefort (HAL hal-02740846, 2014): melhoria genética e apoio técnico aumentaram a margem sobre custo alimentar por ovelha em 17% e 18%. [Título verificado via HAL API; resumo via snippet; https://hal.inrae.fr/hal-02740846/document]

### Inferências
- A forma de pagamento que combina proteína, gordura e rendimento de queijo é uma hipótese para Roquefort, não uma fato verificado. [não verificado]

### Lacunas
- Grade de pagamento do leite de Roquefort (CGPLBR ou equivalente), fórmula e pesos. [não verificado]
- Valores econômicos de Lacaune e de outras raças derivados de rendimento de queijo. [não verificado]

---

## Pergunta-chave 3: Estrutura dos esquemas de seleção (pirâmide, núcleo, IA, progênie, pré-seleção genômica)

### Takeaway
Os programas franceses e espanhóis lidos têm pirâmide com rebanhos núcleo controlados. Os machos de IA nascem nos núcleos e são testados em progênie. Lacaune testa de 420 a 445 machos por ano, com cerca de 85% de IA dentro do núcleo. A genômica começou em 2015 na Lacaune e em 2017 em Manech e Basco, com ganho de acurácia de 0,15 para leite. Granado reporta redução de 20 a 40% nos machos de IA com GS.

### Achados citados
- Tabela 1, Astruc (ano-base 2009): população, rebanhos núcleo e IA.

| Raça | População total | Ovelhas em núcleo (%) | Ovelhas inseminadas no núcleo (taxa IA) | Carneiros IA testados em progênie |
|---|---|---|---|---|
| Lacaune | 900.000 | 173.568 (19%) | 395.800 (85%) | 445 |
| Manech Tête Rousse | 270.000 | 70.712 (26%) | 56.800 (50%) | 151 |
| Manech Tête Noire | 100.000 | 14.509 (15%) | 7.900 (45%) | 36 |
| Basco-Béarnaise | 80.000 | 21.984 (27%) | 14.100 (50%) | 52 |
| Corsican | 95.000 | 21.050 (23%) | 6.300 (30%) | 31 |

[Astruc (ICAR Riga), Tabela 1](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]

- Larroque (2011) dá 870.000 ovelhas Lacaune (região de Roquefort) e cerca de 480.000 ovelhas nas raças do Pirineu ocidental. [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido; diferença de 900.000 de Astruc é de outro ano/fonte]
- Lacaune: 420 carneiros de IA testados por ano, com amostras de cerca de 40 filhas, e 174.000 ovelhas registradas nos núcleos em 2010. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Larroque (2011): cerca de 700 machos de IA por ano para ovinos e 70 para caprinos. Os acasalamentos são "assortative matings" com machos testados. [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido]
- Latxa (ASLANA): acasalamento dirigido na IA desde 1993. A seleção testa os melhores carneiros em progênie, e há testagem das melhores ovelhas. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Ministério francês: carneiros jovens são escolhidos após controle individual, comprados em séries de no mínimo 10 por raça, inseminados em estação ou em rebanhos de apoio, e as filhas são controladas na fazenda. [snippet; URL: https://info.agriculture.gouv.fr/boagri/document_administratif-1f5548eb-1291-43e5-a53e-b45c0939b8ac/telechargement]
- Genômica para Lacaune: ganho de acurácia sobre a média dos pais de 0,15 em leite e de 0,10 a 0,20 nos demais caracteres. Redução de 20 a 40% nos machos de IA. Implantada em 2015. [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido, citando Baloche et al. 2014 e Barillet et al. 2014]
- Experimento de pré-seleção genômica na Lacaune (Baloche et al. 2014, WCGALP; título verificado no HAL hal-02742682): cerca de um terço dos candidatos foi pré-selecionado. Os números a seguir são de snippet, não do PDF: 46 pais, 200 filhos no grupo clássico e 128 no grupo genômico; vantagem de 0,52 DP no índice total, por GBLUP de passo único; eliminação de 24% dos carneiros genômicos e de 48% dos clássicos. [snippet; https://hal.inrae.fr/hal-02742682/file/2014_Baloche_10WCGALP_Vancouver_1.pdf]
- Validação na Lacaune (Baloche 2011): correlação com a DYD para leite, Rb (média dos pais) = 0,39 e Rg (genômica) = 0,45, ganho relativo de cerca de 15%. Para gordura, Rb 0,49 e Rg 0,57. Para proteína, Rb 0,53 e Rg 0,59. Para CCS, Rb 0,41 e Rg 0,45. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Sensibilidade ao tamanho da população de referência (Baloche 2011): remover animais não genotipados reduz a correlação de leite em 9%; remover carneiros nascidos antes de 2003 reduz 11%; remover parentes próximos dos carneiros de validação reduz 27%. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- População de referência Lacaune: 2.567 carneiros genotipados (nascidos 1998–2008), chip Ovine SNP50 (43.929 SNPs retidos). [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Custo de genotipagem: 115 € (2012) e 70 € (2017), chip Ovine SNP50. [snippet; origem não confirmada]
- Latxa, validação de 2018 (Granado-Tajada e Ugarte): raça Latxa Red Faced, dados de 1984–2017, 133.230 ovelhas, 325 rebanhos, 1.835 carneiros, 429 genotipados. Acurácia por pedigree = 0,47; genômica = 0,50 (aumento de 7,6%). Para Latxa Black Faced, pedigree = 0,59 e genômica = 0,43, diferença negativa (o slide traz o valor "26,7" como percentual sem sinal claro). [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido]
- Ganho genético por ano: Lacaune leite +5,3 litros (Larroque, 1990–2008); Latxa 3,5–4% ao ano (Granado, citando Ugarte 2017). [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf); [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido]
- Intervalo de geração: Baloche (2011) diz que o ganho potencial no intervalo de geração é "smaller in sheep / cattle", sem número. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido, qualitativo]. Um snippet sobre "limited decrease of generation interval; 1 year of lay-off" aparece em resultados de busca, sem fonte confirmada. [snippet]
- Um snippet diz que a IA de sêmen fresco leva algumas semanas e exige muitos machos vivos, e que os carneiros são julgados com 30 a 40 filhas. [snippet; origem não confirmada]

### Inferências
- Com 420 a 445 machos testados por ano e amostras de cerca de 40 filhas, a precisão de cada macho depende do número de filhas. Não achei fonte lida que quantifique o trade-off entre número de machos testados e número de filhas por macho.
- Os ganhos de acurácia não são comparáveis diretamente. Na Lacaune, o ganho é de 0,15 em leite (medido de outra forma, sobre a média dos pais). Na Latxa Red Faced, a acurácia vai de 0,47 para 0,50, ou seja +0,03 absoluto e 7,6% relativo. Os métodos e os conjuntos de dados são diferentes, então é preciso ler com cautela.
- Redução de 20–40% de machos de IA com GS é o que a apresentação reporta. Não é um cálculo meu.

### Lacunas
- Número de matrizes (ovelhas) que geram machos, e critérios de seleção dessas mães. Achei só acasalamentos dirigidos e "testing the best ewes" na Latxa. [não verificado]
- Intervalo de geração em anos, para a via macho-filho e para outras vias. [não verificado]
- Ganho genético anual em unidade padronizada e intervalo de geração combinados (R = i·r·σg/L). Não tenho fonte para aplicar a fórmula. [não verificado]
- Número atual de machos testados por ano (os dados são de 2009 e 2010). [não verificado]

---

## Pergunta-chave 4: Conectividade genética entre rebanhos (IA, pequenos rebanhos)

### Takeaway
Granado-Tajada e Ugarte (2018) têm como título "Connectedness and application of breeding schemes for sheep & goats", mas o texto lido não desenvolve métricas de conectividade. Os mecanismos que aparecem nas fontes são: carneiros de IA com filhas em muitos rebanhos, sêmen importado de outra raça e amostra de filhas por rebanho.

### Achados citados
- Um carneiro da ASLANA (Navarra, Latxa) tem 8 filhas em 5 rebanhos (ficha de catálogo mostrada no slide). [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Baloche (2011) mostra que remover carneiros parentes próximos da validação derruba a correlação de leite em 27%. Isso indica que o parentesco entre carneiros de referência e de validação importa para a precisão. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- Na Latxa Cara Rubia, a taxa de endogamia não sobe, atribuída pelos autores à importação de sêmen de Manech Tête Rousse. [snippet; Granado-Tajada et al., J. Dairy Sci. 2020, DOI não verificado]
- Registro de paternidade para conectar o rebanho à base de seleção (ver Pergunta 1). [snippet]

### Inferências
- Um rebanho pequeno que usa só carneiros da própria linhagem ou de monta natural tem menos conexão com a base. A comparação de EBVs entre rebanhos pode então ficar pouco confiável. É uma inferência, sem fonte que quantifique.
- A IA com sêmen de carneiros de rebanhos núcleo liga rebanhos. Quanto mais rebanhos com filhas de um mesmo carneiro, mais conexão.

### Lacunas
- Métricas de conectividade (por exemplo, o coeficiente de conectividade de Fikse e Banos), e valores para as raças. [não verificado]
- Texto completo de Granado-Tajada e Ugarte (2018) sobre conectividade. Os slides lidos não desenvolvem o tema. [não verificado]
- Legarra et al. (2014), citado para os resultados de Manech e Latxa. Não lido. [não verificado]

---

## Pergunta-chave 5: Endogamia e tamanho efetivo da população (Ne) nas raças de leite

### Takeaway
Rodríguez-Ramilo, Elsen e Legarra (2019) estimam Ne acima de 200 nas duas subpopulações Lacaune e abaixo de 200 em Basco-Béarnaise, Manech Tête Noire e Manech Tête Rousse. Pedigree e genômica dão resultados sem diferença significativa. Ne da Latxa, de acordo com um resumo de busca, fica entre 64 e 103.

### Achados citados
- Rodríguez-Ramilo S.T., Elsen J.-M., Legarra A. (2019), "Inbreeding and effective population size in French dairy sheep: Comparison between genomic and pedigree estimates", *J. Dairy Sci.* 102:4227–4237. DOI 10.3168/jds.2018-15405 (verificado no Crossref). PMID 30827541. Resumo lido via Europe PMC. [Crossref](https://api.crossref.org/works/10.3168/jds.2018-15405), [Europe PMC](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2018-15405%22&format=json&resultType=core) [resumo]
- Dados: 8.700 animais genotipados (SNP OvineSNP50, 38.287 SNPs autossômicos), pedigree com 72.803 animais. Subpopulações: Lacaune Confédération, Lacaune Ovitest, Basco-Béarnaise, Manech Tête Noire, Manech Tête Rousse. [Rodríguez-Ramilo et al. (2019), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2018-15405%22&format=json&resultType=core) [resumo]
- Ne por pedigree, SNP-a-SNP e ROH não diferem significativamente. Ne acima de 200 nas duas Lacaune e abaixo de 200 nas demais. A definição de ROH (comprimento mínimo, número mínimo de SNP, densidade e distância máxima) muda a taxa de endogamia. [Rodríguez-Ramilo et al. (2019), resumo](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3168/jds.2018-15405%22&format=json&resultType=core) [resumo]
- Versão de congresso (snippet, não verificada no original): Lacaune Ovitest cerca de 357; Lacaune Confédération 227–313; Manech Tête Rousse 109–200; Manech Tête Noire 81–179; Basco-Béarnaise 59–114. [snippet; origem não confirmada]
- Latxa (Granado-Tajada et al., J. Dairy Sci. 2020; DOI não verificado): 972 carneiros de IA genotipados, genealogia de 4.484 animais, Ne entre 64 e 103 conforme o método. Ne por SNP de 282 (LCNEUS) e 153 (LCNNAF). [snippet; não lido]
- Endogamia por pedigree é subestimada em ovinos: muitos pedigrees incompletos por monta natural e pouca paternidade testada. A endogamia genômica foi maior que a de pedigree nas raças francesas. [snippet; origem não confirmada, provavelmente o congresso de Rodríguez-Ramilo]
- Baloche (2011) conclui que é preciso manter o registro de desempenho para atualizar a população de referência. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]

### Inferências
- Os valores de Ne abaixo de 200 nas raças pequenas sugerem risco de endogamia maior, mas não quantificam a taxa. Não consigo transformar Ne em taxa de endogamia sem a fórmula e a geração de referência, e a fórmula não está nas fontes lidas.

### Lacunas
- Recomendações de manejo para controlar endogamia (contribuições ótimas, limite de parentesco, rotação de carneiros). Nenhuma fonte lida traz recomendação. [não verificado]
- Fórmula e base de cálculo da taxa de endogamia por geração. [não verificado]

---

## Pergunta-chave 6: Uso prático das EBVs por rebanho pequeno (compra de carneiros, IA com sêmen importado, compartilhamento de carneiros)

### Takeaway
As fontes lidas tratam de programas de núcleo. Não encontrei fonte que descreva como um rebanho pequeno compra carneiros, usa sêmen importado ou divide carneiros. Os pontos com fonte são o catálogo de carneiros e a verificação do genótipo PrP.

### Achados citados
- O catálogo de carneiros da ASLANA mostra o valor genético, a repetibilidade, o número de filhas, de lactações e de rebanhos, além do índice combinado. Isso permite comparar carneiros com diferentes quantidades de filhas. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]
- Genótipo PrP (resistência a scrapie) é mostrado no catálogo. Exemplo: "Prp Gen: ARR/ARQ". Na França, cerca de 160.000 genotipagens PrP foram financiadas até 2009. [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]; [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]
- Carneiros da IA são estocados (DNA e sangue) desde meados dos anos 1990 na Lacaune. Isso permite genotipar carneiros antigos. [Baloche (2011)](https://docs.eaap.org/2011/S49_Baloche.pdf) [lido]
- O ganho com a IA chega a rebanhos comerciais por monta natural ou IA com carneiros do núcleo. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido]

### Inferências
- Para um rebanho pequeno, o índice combinado de um carneiro só é comparável ao de outro carneiro dentro da mesma raça e com a mesma base. Quantidade de filhas e de rebanhos mostra a confiabilidade. Esta é a leitura prática, sem fonte de manejo.
- Compartilhamento de carneiros e importação de sêmen dependem de regras sanitárias e de registro. Não há fonte lida sobre isso. [não verificado]

### Lacunas
- Preços e regras de compra de carneiros em programas franceses e espanhóis. [não verificado]
- Regras sanitárias e de importação de sêmen (por exemplo, brucelose, visna-maedi). [não verificado]
- Modelo de compartilhamento de carneiros entre rebanhos pequenos. [não verificado]

---

## Pergunta-chave 7: Ganho genético e tendências (leituras de referência)

### Takeaway
As tendências lidas estão em unidades diferentes e em períodos diferentes. Por isso não dá para comparar diretamente Lacaune, Latxa e as raças pirenaicas.

### Achados citados
- Lacaune, leite: +5,3 L/ano (1990–2008), 0,15 σg. Gordura: +0,19 g/L/ano (0,05 σg). Proteína: +0,16 g/L/ano (0,07 σg). [Larroque (2011)](https://docs.eaap.org/2011/S49_Larroque.pdf) [lido]
- Ganho de leite por raça na tabela de Astruc: Lacaune 6,4 L; Manech Tête Rousse 3,8 L; Manech Tête Noire 1,2 L; Basco-Béarnaise 2,9 L; Corsican 0,7 L. [Astruc (ICAR Riga)](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) [lido; cabeçalho ambíguo]
- Latxa: 3,5–4% ao ano em leite (Ugarte 2017, citado em Granado). Também 4 L por lactação e por ano (Lasarte). Estudo do CIHEAM de 1995 cita 0,8–1,2% ao ano. [Granado-Tajada e Ugarte (2018)](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [lido]; [Lasarte (2018)](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) [lido]; [CIHEAM 1995, snippet](https://ressources.ciheam.org/ressources/om/pdf/a55/03600074.pdf)
- Gordura e proteína de leite de ovelha caíram ao longo das décadas, segundo um snippet de Réussir (cerca de -6,31 g/L de gordura e -3,47 g/L de proteína, 1984–2016). Origem não confirmada. [snippet]

### Inferências
- As tendências de EBV da Lacaune (leite e teores) são positivas no período de Larroque. As tendências de fenótipo de teores (snippet, com perda de gordura e proteína) são de outra fonte, outro período e outra métrica. Não é possível conciliar as duas sem a fonte primária, então não tiro conclusão disso.

### Lacunas
- Tendência de caracteres funcionais (CCS, úbere) em unidades padronizadas. O slide de Larroque tem gráficos, mas o texto extraído saiu corrompido. [não verificado]

---

## Registro de fontes e status de verificação

| ID | Fonte | URL ou DOI | Status |
|---|---|---|---|
| F1 | Astruc (ICAR Technical Series no. 14, Riga), "Use of genomic data in French dairy sheep breeding programs: results and prospects" | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf | [lido] (ano não confirmado) |
| F2 | Larroque H. (2011), EAAP Stavanger, "National genetic evaluations in dairy sheep and goats in France" | https://docs.eaap.org/2011/S49_Larroque.pdf | [lido] |
| F3 | Baloche G. et al. (2011), EAAP, "Work in progress on genomic evaluation using GBLUP in French Lacaune dairy sheep breed" | https://docs.eaap.org/2011/S49_Baloche.pdf | [lido] |
| F4 | Granado-Tajada I., Ugarte E. (2018), EAAP Session 26, "Genomic selection on Latxa dairy sheep" | https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf | [lido] |
| F5 | Lasarte (2018), SERAM Atelier 1 (ASLANA, Latxa Navarra) | https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf | [lido] |
| F6 | Ramón J. et al. (2010), J. Dairy Sci. 93:3303–3309, "Economic weights for major milk constituents of Manchega dairy ewes" | DOI 10.3168/jds.2009-2787; PMID 20630246 | [resumo] (Crossref e Europe PMC). Texto completo bloqueado em HAL |
| F7 | Rodríguez-Ramilo S.T., Elsen J.-M., Legarra A. (2019), J. Dairy Sci. 102:4227–4237, "Inbreeding and effective population size in French dairy sheep" | DOI 10.3168/jds.2018-15405; PMID 30827541 | [resumo] (Crossref e Europe PMC) |
| F8 | Barillet F. (2007), Small Ruminant Research 70(1):60–75, "Genetic improvement for dairy production in sheep and goats" | DOI 10.1016/j.smallrumres.2007.01.004 | [Crossref verificado]; **pago** (Elsevier); HAL hal-02659607 sem arquivo |
| F9 | Baloche G. et al. (2014), WCGALP, "Genomic selection experiment in Lacaune dairy sheep: Progeny test results..." | HAL hal-02742682 (título via API da HAL); PDF em https://hal.inrae.fr/hal-02742682/file/2014_Baloche_10WCGALP_Vancouver_1.pdf | Título verificado; PDF bloqueado; números de snippet |
| F10 | Barillet F. et al. (2001), Genetics Selection Evolution, "Genetic analysis for mastitis resistance and milk somatic cell score in French Lacaune dairy sheep" | HAL hal-02676259 | Só metadados; PDF bloqueado |
| F11 | Legarra A. et al. (2014), citado em Granado | não localizado | [não verificado] |
| F12 | Granado-Tajada I. et al. (2020), J. Dairy Sci., Latxa Ne e conectividade | DOI não verificado | [snippet] |
| F13 | Réussir e Gambin (snippets sobre ISOL e filiação) | https://gambin.co/blog/schema-insemination-ovins/ ; https://www.reussir.fr/grace-la-selection-je-gagne-pres-de-sept-litres-de-plus-par-et-par-brebis | [snippet, blogs comerciais; devem ser substituídos por fonte primária] |
| F14 | ASLANA, catálogos de sementais Latxa Cara Negra 2023 e 2025 | https://intiasa.es/web/sites/default/files/assets/images/LCN-NA%20-%20Cat%C3%A1logo%202025%20ARDI.pdf ; https://intiasa.es/web/sites/default/files/assets/files/ganaderia/Cat%C3%A1logo%20Selecci%C3%B3n%20ASLANA%202023.pdf | [snippet]. TLS expirado, não lidos. Não contornado |
| F15 | MAPA, documento do programa Churra (2021) | https://servicio.mapama.gob.es/ca/ganaderia/temas/zootecnia/pcchurraactualizado22-11-2021_tcm34-581198.pdf | [snippet, não lido] |
| F16 | AssoNaPa, fichas da Sarda (ovina e caprina) | https://www.assonapa.it/public/schede-ovini/SARDA.pdf ; https://www.assonapa.it/public/schede-caprini/SARDA.pdf | [snippet, não lido] |
| F17 | Ministério da Agricultura francês, documento de testagem de carneiros | https://info.agriculture.gouv.fr/boagri/document_administratif-1f5548eb-1291-43e5-a53e-b45c0939b8ac/telechargement | [snippet, não lido] |
| F18 | Neiker, programa Latxa | https://neiker.eus/?p=6807 ; https://neiker.eus/en/news/four-decades-of-work-aimed-at-the-genetic-improvement-of-the-latxa-sheep-in-the-basque-country/ | [snippet, não lido] |

### Fontes na pasta de scratchpad sem proveniência confirmada (não usadas)
Na pasta `/tmp/claude-0/-home-user-sistemas-seabra-web/2f601efb-0b7e-558e-b507-febc0682ae9c/scratchpad/fontes/ovinos/` há arquivos que eu não baixei e cuja origem não consegui confirmar: `eaap2024_m221_S02T11.pdf` (Vouraki et al., EAAP 2024, GxE e resposta à seleção na Lacaune, relevante para ganho genético), `icar2023_astruc_sheep.pdf` (Astruc et al., ICAR 2023, estado da arte do controle leiteiro em ovinos e caprinos), e `jds_2026_lacaune_abstract.pdf`, `hal02682817_rupp2003_scs.pdf`, `hal02676259_v1.pdf`, `crosbi_795872_landing.html`, `icar_sec16_wiki.html`. Não usei nenhum desses nas conclusões. Um analista pode checar a origem e ler.

### Pendências para o usuário (acesso institucional, sem contornar bloqueios)
1. Barillet 2007, Small Ruminant Research (DOI 10.1016/j.smallrumres.2007.01.004): fonte central para índices e esquemas. Pagar ou obter pelo acesso UFF/CAPES.
2. Ramón et al. 2010 (DOI 10.3168/jds.2009-2787): para ter os valores numéricos dos pesos econômicos da Manchega.
3. PDFs abertos na HAL, que o desafio anti-bot bloqueou. Podem ser baixados no navegador e anexados: hal-02742682 (Baloche 2014), hal-02742056 (genomic breeding programs, 2014), hal-02740846 (Lacaune 25 anos, 2014), hal-02676259 (Barillet 2001, GSE).
4. Catálogos ASLANA 2023 e 2025 (intiasa.es), para confirmar os pesos do índice Latxa. O certificado do site está expirado, então o download precisa ser feito pelo navegador.
5. Documento oficial do ISOL e do índice Manech/Basco (UPRA Lacaune, Idele, Ovitest). Não encontrado nas fontes abertas.
