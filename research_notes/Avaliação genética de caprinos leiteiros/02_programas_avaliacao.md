# Programas de avaliação genética e melhoramento de caprinos leiteiros (Brasil e exterior)

**Data da consulta:** 15/10/2026. **Escopo:** caprinos leiteiros (Alpina, Saanen, Anglo-Nubiana, Toggenburg, raças ibéricas e mediterrâneas). **Status:** notas de pesquisa para o relatório de síntese, não relatório final.

**Método e limitações (resumo):**
- OpenAlex respondeu HTTP 429 em todas as tentativas (retries de 8 s, sem sucesso). A busca bibliográfica foi feita por Europe PMC e os DOIs foram conferidos no Crossref. Os DOIs marcados como "Crossref verificado" foram consultados no Crossref; os demais, apenas no Europe PMC.
- WebFetch não foi usado (falha de DNS). Downloads feitos com curl e Python.
- Parte dos textos lidos vem de arquivos já baixados no diretório compartilhado de fontes (`scratchpad/fontes/caprinos/`). Cada afirmação indica a URL ou DOI de origem.
- Downloads incompletos ou não lidos: Capgènes "Plaquette Génomique" 2019 (1,5 MB de 3,05 MB, não lida); Ata Fagrådet NSG 2023 (download falhou); PDF do programa Malagueña no MAPA (arquivo vazio); PDF de Massender et al. 2022 no repositório da UniBE (retornou HTML). Trechos de busca estão marcados como "(trecho de busca, não lido)".
- Pesos e números lidos de gráficos ou infográficos estão marcados como "leitura de gráfico" ou "leitura de infográfico".

---

## Visão geral, método e limitações

### Takeaway
Os programas com avaliação genética oficial, sumários públicos e alguma genômica operacional encontrados são: **França** (Capgènes, Idele-GenEval, INRAE; índice combinado ICC; genômica de jovens bodes), **Espanha** (Caprigran, Acriflor, Caprama; avaliações semestrais em 2020), **Itália** (Asso.Na.Pa.; ssGBLUP em projeto CHEESR), **Noruega** (NSG; índices genômicos publicados desde abril de 2021) e **Brasil** (Capragene/Embrapa; sumários de 2014, 2017, 2020 e 2021; genômica desde 2017). Os **EUA** (CDCB/ADGA) têm avaliação oficial de produção e tipo, sem genômica encontrada. **Grécia, Reino Unido, Países Baixos, Canadá** (sem nome de programa) e **México** não têm programa oficial de avaliação de caprinos leiteiros documentado para 2020–2026 nas fontes consultadas.

Três premissas da solicitação não se confirmaram:
1. "Single-step desde cerca de 2018" na França: a fonte francesa mais recente lida (relatório 2022–2023) ainda trata o HSSGBLUP para cálculo de índices como teste. Data de início não confirmada.
2. "ANAPRI" como avaliadora italiana: a busca não a encontrou como entidade de livro genealógico caprino. A entidade caprina documentada é a **Asso.Na.Pa.** (Associazione Nazionale della Pastorizia).
3. "TYR" na Noruega: é organização de bovinos de corte (anúncio de emprego). Não se aplica a caprinos.

### Cited Findings

**Quadro-resumo** (detalhes e fontes em cada seção por país)

| Programa | Quem avalia | Raças | Escala documentada (data) | Modelo / frequência | Genômica |
|---|---|---|---|---|---|
| França | Capgènes (seleção) + Idele-GenEval (avaliação); INRAE-GenPhySE | Alpina, Saanen | 330.000 cabras controladas (campanha 2022–23); 37.837 primíparas pontuadas (2023) [Capgènes AG 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf) | Modelo de lactação (250 d) e multitraço animal; índice ICC; frequência não localizada | Índices genômicos de jovens bodes desde 2023 (uso em 60% dos pais de bodes); single-step em teste |
| Espanha | Caprigran (MG), Acriflor (Florida), Caprama (Malagueña) | Murciano-Granadina, Florida, Malagueña; Payoya (sem dados); Majorera (não localizada) | Caprigran 2020: 50.483 animais, 119 rebanhos na matriz [Interempresas](https://www.interempresas.net/caprino/317863-Caprigran-publica-su-Catalogo-de-Sementales-2020-con-aumento-de-exportacion-de-genetica.html) | Caprigran: avaliações semestrais (2020); Acriflor: BLUP | Caprigran: "primeiros passos" (imprensa 2022); sem rotina confirmada |
| Itália | Asso.Na.Pa. | Camosciata delle Alpi, Saanen | ssGBLUP (CHEESR): 5.509 Camosciata e 2.840 Saanen (trecho de busca, não lido) | 5 caracteres de produção, IAQ, morfologia; índice global 70% qualidade / 30% morfologia | ssGBLUP em projeto; rotina não confirmada |
| Noruega | NSG (Norsk Sau og Geit) | Norwegian Dairy Goat (composta), com importações de Saanen e Alpina francesa | Índices genômicos calculados para bodes de 50 rebanhos de elite (maio/2021) [NSG Seminkatalog 2021–22](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf) | Índices tradicionais e genômicos; frequência não localizada | Índices genômicos publicados desde abril de 2021 |
| EUA | CDCB (avaliação) + ADGA (tipo e pedigree) | Alpine, Experimental, LaMancha, Nigerian Dwarf, Nubian, Oberhasli, Saanen, Sable, Toggenburg [CDCB](https://uscdcb.com/dairy-goats/) | 589 rebanhos e 17.381 cabras em controle leiteiro (1º/1/2016) [Wiggans, CDCB](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf) | Produção em agosto e dezembro; tipo em dezembro; Net Merit e Fluid Merit | Não localizada |
| Canadá | Não identificado [não verificado] | Alpina, Saanen | Dados para estudo internacional: Alpina 7.414 fenótipos de MYI; Saanen 3.947 [Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389) | Regressão aleatória de teste-dia para 305 dias (estudo) | Estudos de ssGBLUP/GWAS (pesquisa), 833 e 874 genotipados [JDS 2023](https://doi.org/10.3168/jds.2022-22223) |
| México | Não localizado | Saanen (estudo 2010) | 10 rebanhos de Guanajuato, 2000–2006 (trecho de busca) | Modelo animal (estudo) | Não localizada |
| Brasil (Capragene) | Embrapa Caprinos e Ovinos, ACCOMIG/Caprileite, MAPA; ABCC (registro) | Saanen, Alpina (sumário 2021); Anglo-Nubiana (dados) | Saanen 2020: 6.941 lactações, 3.949 cabras; Alpina 2021: 1.072 lactações, 14 rebanhos [Embrapa 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf); [Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf) | Modelo animal multitraço; ssGBLUP (BLUPF90, Gibbs) para Saanen | Saanen: 988 genotipados (947 válidos), 62.557 SNPs (2020) |

### Cited Findings (método: fontes e verificações)
- **DOIs verificados no Crossref:** [10.3168/jds.2025-27676](https://doi.org/10.3168/jds.2025-27676) (Arnal et al., JDS 2026); [10.3168/jdsc.2023-0389](https://doi.org/10.3168/jdsc.2023-0389) (Teissier et al., JDS Communications 2024); [10.3168/jds.2022-22223](https://doi.org/10.3168/jds.2022-22223) (JDS 2023, GWAS canadense); [10.3389/fgene.2022.862838](https://doi.org/10.3389/fgene.2022.862838) (Teissier et al., Frontiers 2022); [10.3390/ani11030736](https://doi.org/10.3390/ani11030736) (Menéndez-Buxadera et al., Animals 2021); [10.1186/s12711-019-0485-3](https://doi.org/10.1186/s12711-019-0485-3) (Arnal et al., Genetics Selection Evolution 2019); [10.1007/s11250-026-04980-4](https://doi.org/10.1007/s11250-026-04980-4) (Trop Anim Health Prod 2026, Capragene); [10.3390/ani14182659](https://doi.org/10.3390/ani14182659) (Zhang et al., Animals 2024, revisão de GS em caprinos e ovinos).
- **DOIs de Europe PMC sem conferência no Crossref:** 10.1016/j.vas.2025.100553 (Murciano-Granadina, Vet Anim Sci 2026); 10.1111/jbg.12940 (Murciano-Granadina, JABG 2025).
- **Premissa sobre genômica na França:** não confirmada (ver seção França).

### Inferences
- A comparação mostra três modelos de organização: (a) **França e Itália** com avaliação por entidade técnica (Idele-GenEval; Asso.Na.Pa.) e seleção por progênie com IA; (b) **Espanha** com associações de raça que avaliam os próprios rebanhos com escala grande e sumários de sementais; (c) **Brasil e EUA** com programas centralizados de baixa intensidade de IA, onde a genômica brasileira avança mais rápido que a norte-americana (esta sem genômica encontrada).
- Pela ordem de grandeza, os dados espanhóis (cerca de 212 mil lactações certificadas em 2022, ver Espanha) são cerca de 30 vezes os brasileiros (6.941 lactações Saanen em 2020). Essa é uma diferença de base de dados, não de qualidade de avaliação.

### Gaps
- OpenAlex indisponível durante a sessão; a cobertura bibliográfica depende de Europe PMC e Crossref.
- Plaquette Génomique 2019 da Capgènes e Ata Fagrådet NSG 2023 não lidas integralmente.
- Não encontrei nenhuma fonte primária atual (2024–2026) sobre programas do Canadá, México, Grécia, Reino Unido e Países Baixos.

---

## França (Capgènes, Idele-GenEval, INRAE-GenPhySE): Alpina e Saanen

### Takeaway
É o maior programa de caprinos leiteiros documentado. A seleção é feita pela Capgènes; a avaliação genética é de responsabilidade do Idele-GenEval, com INRAE-GenPhySE (conforme agradecimentos de [Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)). O índice combinado ICC inclui produção, morfologia, células somáticas e, desde 2023, fertilidade à IA. A avaliação oficial documentada é de lactação, não de teste-dia, com produção ajustada para 250 dias. Não encontrei os pesos publicados do ICC, o tamanho oficial da população de referência genômica nem a data de início do single-step.

### Cited Findings

**Estrutura e escala**
- Capgènes: 592 "éleveurs créateurs et engagés" e cerca de 4.000 "contributeurs" (leitura do infográfico), relatório de atividades 2022–2023 [Capgènes AG 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf).
- Cabras em controle leiteiro oficial: 330.000 "pour la quantité et la qualité du lait" (2022–2023) [Capgènes AG 2024].
- Apresentação EAAP–WAAP–Interbull 2023 (Clément, Piacère, Chassier): núcleo de seleção de 150.000 cabras em 600 rebanhos; controle leiteiro oficial de 330.000 cabras em 1.500 rebanhos; população de queijo de 1.000.000 cabras em 7.500 rebanhos [slides EAAP 2023, sem URL direta; apresentações em idele.fr].
- Discrepância: o relatório Capgènes 2024 traz 900 rebanhos em controle leiteiro oficial e 4.500 na população. Não resolvida; citar as duas fontes com data.
- Pontuação morfológica (2023): 11 pontuadores, 553 rebanhos, 61 departamentos, 37.837 primíparas [Capgènes AG 2024].

**Teste de progênie e IA**
- Clément, Charton & Larroque (EAAP 2018, abstract 29504, sem URL verificada): 40% de IA nos rebanhos núcleo; cerca de 50% dos bodes eliminados antes do teste de progênie, principalmente por produção de sêmen; 2.086 bodes com coletas de 1995 a 2016 (254.000 coletas). Avaliação de sêmen por Wombat e Gibbsf90 (SNP50), implementação por Genekit.
- Capgènes 2024 (infográfico, campanha 2022–23): 318 bodes produziram 220.391 doses; 14.166 doses exportadas; 1.027 doses sexadas (leitura do infográfico) [Capgènes AG 2024].
- Antes da quarentena em 2023, 140 machos foram comprados de 400 genotipados [Capgènes AG 2024].
- Taxas de sucesso de IA na campanha 2022: 58,6% e 53,8% (a atribuição a Alpina e Saanen não é explícita no texto extraído do slide) [Clément et al. 2023, slides].
- Sucesso de IA como caráter: herdabilidade 0,052 (Saanen) e 0,045 (Alpina); desvio genético 0,09 e 0,11 (Clément et al. 2023, slides, Blupf90). Correlação genética leve desfavorável com produção de leite na Saanen (-0,12) e com CCS (0,11 na Saanen, 0,12 na Alpina).

**Modelo oficial (lactação ou teste-dia)**
- [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3): modelo de lactação "close to that routinely used for official genetic evaluations in France", com rendimentos totais de leite, gordura e proteína. Dados: 193.226 registros de teste-dia de 30.186 primíparas Saanen (234 rebanhos) e 205.841 de 32.256 primíparas Alpina (198 rebanhos), noroeste da França. Parâmetros estimados em WOMBAT. Modelo de regressão aleatória de teste-dia foi estudado; o artigo afirma que um RRM "foi implementado na França" para persistência, mas o status atual não foi confirmado.
- [Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389): avaliação nacional francesa em modelo animal multitraço, com efeitos fixos de rebanho×ano×ordem de parto. A produção de leite (MYI) é ajustada para lactação de referência de 250 dias (média de 872,53 kg na Alpina e 874,66 kg na Saanen). Caracteres: produção (MYI), teor de gordura (FCO) e inserção posterior do úbere (RUA).
- [Arnal et al. 2026](https://doi.org/10.3168/jds.2025-27676): a produção de leite é "routinely evaluated (parity 1 to 10)" na França.
- Softwares citados: WOMBAT ([Arnal 2019](https://doi.org/10.1186/s12711-019-0485-3)); gibbs1f90 ([Teissier 2024](https://doi.org/10.3168/jdsc.2023-0389)); BLUPF90 para GEBV de sucesso de IA ([Clément et al. 2023, slides](#)); Genekit para implementação de avaliação de sêmen ([Clément 2018](#)).
- Periodicidade de avaliação: não localizada.

**Índice combinado caprino (ICC)**
- Criado em 1996 com componentes de produção (TP e MP, depois TB e MG); morfologia incluída há cerca de dez anos; CCS calculada e divulgada desde 2016; fertilidade à IA incorporada em 2023 [Réussir / Pleinchamp, 07/09/2022](https://www.pleinchamp.com/actualite/fertilite-a-l-ia-et-cellules-integreront-l-index-combine-caprin-debut-2023).
- O ICC é composto por IPC (índice de produção), IMC (índice morfológico), CCS e fertilidade à IA. A fertilidade é calculada apenas para IA com sêmen congelado. Todos os bodes de IA são genotipados e têm seus índices desde a entrada no catálogo (Réussir, 2022).
- Caracteres menos herdáveis (CCS, fertilidade) recebem peso relativamente grande, por estarem ligados à longevidade (Réussir, 2022).
- Pesos numéricos: não publicados no texto lido. Leitura do slide 4 de Clément et al. 2023 (sem legenda textual clara): para Alpina/Saanen, aproximadamente CCS 13%/17%, produção 25%/28% e morfologia 62%/55% [leitura de gráfico, não verificado]. Slide 11 do mesmo trabalho indica peso de 16% (Alpina) e 15% (Saanen) para sucesso de IA [leitura de gráfico, não verificado].
- Clément et al. 2023: "17 traits and one total merit index" (ICC).

**Genômica**
- Capgènes 2024 (desenvolvimento 2022–2023): "Développement d'une indexation génomique maturité en routine" e "Test sur l'utilisation de HSSGBLUP pour le calcul des index en single step génomique" [Capgènes AG 2024].
- Uso de jovens bodes genômicos em 60% dos pais de bodes e 40% dos acasalamentos programados (política 2023) [Capgènes AG 2024].
- Precisão dos índices de jovens bodes genômicos: +15 pontos em três anos [Capgènes AG 2024].
- Genotipagem de mães de bodes no centro de seleção; objetivo de genotipagem em fazenda [Capgènes AG 2024].
- Conjunto genotipado no estudo internacional SMARTER (não é a referência oficial): 2.968 Alpina e 2.009 Saanen da França (tabela 1 de [Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)). Total de 9.855 genotipados nos quatro países, 51% franceses ([Teissier et al. 2022](https://doi.org/10.3389/fgene.2022.862838)).
- Maturidade (novo caráter): herdabilidade cerca de 0,10, repetibilidade cerca de 0,55; independente da produção de leite na primeira lactação e positivamente correlacionada com produção nas lactações 2 a 6 e com longevidade funcional; QTL com coincidência posicional ao gene CSN1S1 ([Arnal et al. 2026](https://doi.org/10.3168/jds.2025-27676)).
- Conectividade internacional (SMARTER, 2018–2023): "bonne connexion génétique" entre rebanhos franceses, suíços, canadenses e italianos; correlação genética satisfatória para morfologia e taxas, insuficiente para leite [Capgènes AG 2024]. Pedigree de 6.435.189 animais nos quatro países; exportações de genética sobretudo da França para os outros três ([Teissier et al. 2022](https://doi.org/10.3389/fgene.2022.862838)).

### Inferences
- A França opera seleção por progênie com IA em escala, e desde 2023 um índice combinado com fertilidade. A genômica de jovens bodes é o principal encurtador de intervalo de gerações (40% dos acasalamentos programados).
- Como o relatório 2022–2023 ainda descreve o HSSGBLUP como teste, a afirmação "single-step desde 2018" deve ser tratada como **não verificada**. A afirmação defensável é: genômica operacional para bodes jovens em 2023, com índices single-step em desenvolvimento.
- Os pesos do ICC devem ser obtidos diretamente da Capgènes ou do Idele antes de qualquer uso numérico. As leituras de gráfico acima servem só como ordem de grandeza.

### Gaps
- Pesos oficiais do ICC após 2023 e pesos de cada caráter: não encontrados.
- Tamanho oficial da população de referência genômica e data de início do single-step: não encontrados.
- Periodicidade e software da avaliação oficial atual: não encontrados.
- Capgènes "Plaquette Génomique" 2019 não lida (download incompleto).
- Dados por raça em 2023–2025 não separados no relatório 2022–2023.

---

## Espanha (Caprigran, Acriflor, Caprama): Murciano-Granadina, Florida, Malagueña, Payoya, Majorera

### Takeaway
Espanha tem a maior base de avaliação de raças caprinas leiteiras fora da França. Caprigran (Murciano-Granadina) publicou avaliações semestrais em 2020 e um catálogo com 212 mil lactações certificadas em 2022. Acriflor (Florida) e Caprama (Malagueña) publicam catálogos de sementais com BLUP. A genômica é tema de pesquisa, sem rotina confirmada. Payoya tem catálogo (sem números no que foi lido) e Majorera não foi localizada.

### Cited Findings
- **Caprigran, catálogo 2020** (notícia Interempresas): avaliação semestral. Na última avaliação do ano, 50.483 animais de 119 rebanhos na matriz de parentesco (4.260 machos e 41.963 fêmeas); 134.975 lactações; média de 3,10 lactações por animal em 43.471 cabras com informação própria [Interempresas 317863](https://www.interempresas.net/caprino/317863-Caprigran-publica-su-Catalogo-de-Sementales-2020-con-aumento-de-exportacion-de-genetica.html).
- **Caprigran, 2021** (imprensa): 189.036 lactações em 2021, frente a 159.067 em 2020 [Interempresas 386389](https://www.interempresas.net/caprino/386389-Imparable-internacionalizacion-de-Caprigran.html) (trecho de busca, não lido).
- **Caprigran, catálogo 2022** (imprensa): 212.928 lactações certificadas padronizadas para 210 dias; matriz de parentesco com 82.156 animais com pais conhecidos [Interempresas 409455](https://www.interempresas.net/caprino/409455-Las-razas-exhiben-sus-mejores-sementales.html) (trecho de busca, não lido).
- **Caprigran, genômica** (imprensa, 2022): a associação estaria "dando os primeiros passos" para avaliar genômica; cerca de 52 machos reprodutores e mais de 12.000 doses [Interempresas 385893](https://www.interempresas.net/caprino/385893-Tecnificacion-y-genomica.html) (trecho de busca, não lido).
- **Menéndez-Buxadera et al. 2021** ([DOI verificado](https://doi.org/10.3390/ani11030736)): MG, Florida e Malagueña somam 90% do censo espanhol de caprinos leiteiros; MG com cerca de 200.000 cabras reprodutoras; Malagueña e Florida cerca de 100.000 cada. Dados de teste-dia (gordura + proteína, 2008–2018) de controle leiteiro regional, fornecidos por Acriflor, Acrimur e Caprama. Os dois primeiros conjuntos somam 11.244 animais e 126.825 registros, e 12.215 animais e 141.856 registros (associação raça-número não confirmada no texto extraído). Modelo de regressão aleatória com temperatura e umidade (THI), ASReml 3.
- **Programa Malagueña**: aprovado por Resolución de 5 de maio de 2020 (Real Decreto 45/2019); versão consolidada de 9 de outubro de 2025 (trecho de busca do MAPA; o PDF não foi baixado, arquivo vazio).
- **Caprama (Malagueña)**: catálogo 2022, 13ª edição, com 46 animais "elite, mejorante e de prueba"; 14º catálogo com 29 sementais (9 elite e 16 em prova) (imprensa, trecho de busca, sem URL individual confirmada).
- **Acriflor (Florida)**: catálogos periódicos com BLUP para produção e tipo; morfologia por pontuação linear contínua; 14º catálogo com "novo método" (trecho de busca, não datado); catálogo de 2018 com 21 sementais melhoradores [Interempresas 270391](https://www.interempresas.net/caprino/270391-La-raza-Florida-cuenta-con-21-mejorantes-en-su-ultimo-Catalogo-de-Sementales.html); XII catálogo anunciado [Interempresas 404157](https://www.interempresas.net/caprino/404157-Acriflor-prepara-la-publicacion-inminente-de-su-XII-Catalogo-de-Sementales-de-Raza-Florida.html).
- **Payoya**: catálogo de sementais de 2022 citado em imprensa, sem números no trecho lido. **Majorera**: nada encontrado.

### Inferences
- Caprigran combina avaliação de produção em escala com seleção de sementais e exportação de genética (EUA, Rússia, Itália, França, Brasil, México, Chile e Irã, segundo o catálogo 2020). Exporta material genético para vários países, incluindo o Brasil (catálogo 2020).
- A genômica espanhola ainda é pesquisa. A escala de dados tornaria o salto para ssGBLUP viável, mas nenhuma fonte confirma rotina.

### Gaps
- Catálogos 2023–2025 de Caprigran e Acriflor: PDFs não localizados.
- Fórmula do índice de seleção de Caprigran, Acriflor e Caprama: não encontrada.
- Programas Payoya e Majorera: não localizados.
- Periodicidade atual de avaliação (imprensa de 2022 diz "contínua"; catálogo de 2020 diz "semestral"): não resolvida.

---

## Itália (Asso.Na.Pa.; Camosciata delle Alpi e Saanen)

### Takeaway
A avaliação genética de caprinos leiteiros na Itália é feita pela **Asso.Na.Pa.**, com índices de produção (cinco caracteres), índice de qualidade e índice global (70% qualidade, 30% morfologia). O projeto CHEESR desenvolveu ssGBLUP para Camosciata delle Alpi e Saanen. A rotina não foi confirmada. ANAPRI não aparece como avaliadora caprina.

### Cited Findings
- **Normas técnicas Asso.Na.Pa.** (PDF de 2 páginas, data não identificada): estimativas de valor genético para cinco caracteres (leite em kg, gordura %, gordura kg, proteína %, proteína kg); **IAQ = IPG + 4 × IPP** (índice agregado de qualidade); morfologia com cinco caracteres (perfil da úbere, posição e orientação dos tetos, inserção posterior da úbere, distância entre jarretes); **índice agregado global = 70% IAQ + 30% morfologia**. [Asso.Na.Pa., Norme tecniche](https://www.assonapa.it/public/NormeTecniche-ProgrammiGenetici-Caprini.pdf).
- **CHEESR, Atividade 4.2** (trecho de busca, PDF não lido): ssGBLUP para Camosciata delle Alpi e Saanen; lactações padronizadas em 210 dias de animais genotipados com pedigree oficial; efeito fixo rebanho-ano-estação e efeito aleatório animal. Níveis de dados: ssGBLUP 5.509 Camosciata e 2.840 Saanen; GBLUP 2.128 e 937 [Asso.Na.Pa., CHEESR](https://www.assonapa.it/public/cheesr/4.2_A_SviluppoValutazionessGBLUP.pdf).
- **Dados de estudo internacional** ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389), tabela 1): Itália, Alpina, MYI: 71.276 de pedigree, 1.061 genotipados, 170.932 fenótipos. Saanen: 85.633, 338 e 189.395. Lactação de referência de 210 dias e pré-ajuste por paridade, idade e número de crias, como no método italiano.
- **Contagem ICAR** (apresentação ICAR 2022): 457.324 cabras em controle leiteiro oficial entre países ICAR, com 88% em França, Espanha e Itália [ICAR 2022 (Astruc et al.)](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al.pdf). Ano de referência não identificado no slide.
- **Universidade de Milão** (Frontiers in Animal Science, [DOI 10.3389/fanim.2025.1664380](https://www.frontiersin.org/journals/animal-science/articles/10.3389/fanim.2025.1664380/full), trecho de busca, não lido): 1.283 cabras genotipadas na Lombardia (977 Camosciata, 306 Saanen), painel de 70K SNPs.
- **Contexto suíço** (não é Asso.Na.Pa.): a FSAC faz avaliação BLUP animal para Saanen, Camosciata e Toggenburg, com perfil de DNA de bodes jovens no primeiro exame morfológico a partir de 2025 (trecho de busca, [regulamento SZZV 2025](https://www.szzv.ch/fileadmin/01_szzv/07_Download/01_Reglemente/Italienisch/Zuchtprogramm_SZZV_V03_2025_ITA_Definitiv_22.08.2024.pdf)).
- **ANAPRI**: a busca encontrou ANAPRI ligada a uma raça bovina (Pezzata Rossa Italiana) e não como entidade de livro genealógico caprino. A entidade caprina em registros italianos é a Asso.Na.Pa. [não verificado: possível confusão entre siglas].

### Inferences
- A base genotipada italiana (1.061 Alpina, 338 Saanen) é menor que a francesa. Isso explica por que a Itália participa de avaliações internacionais em vez de rodar avaliação genômica isolada.
- O índice italiano é o mais transparente dos lidos (fórmula IAQ explícita, pesos de morfologia e índice global definidos).

### Gaps
- Confirmação de rotina do ssGBLUP na Asso.Na.Pa. e cronograma de publicação dos índices: não encontrados.
- Número de rebanhos e animais controlados por raça na Itália: não localizado na Asso.Na.Pa.
- Papel da ANAPRI: não encontrado.

---

## Noruega (NSG, Norsk Sau og Geit; TYR não se aplica)

### Takeaway
A NSG publicou índices genômicos para caprinos leiteiros pela primeira vez em abril de 2021, calculados para bodes de 50 rebanhos de elite. Cabritos genotipados entram no índice aos 4 a 6 meses. Os bodes entram na IA aos 1,5 ano, em vez de 2,5. TYR é organização de bovinos de corte e não se aplica.

### Cited Findings
- "I starten av april 2021 publiserte vi for første gang genomiske indekser" (início de abril de 2021, primeira publicação de índices genômicos) [NSG Seminkatalog 2021–22](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf).
- Índice genômico usa o resultado da genotipagem do bode como fonte de informação, junto com o desempenho das filhas: leite, gordura, proteína, lactose, ácidos graxos livres, CCS, conformação de úbere e velocidade de ordenha [NSG Seminkatalog 2021–22].
- Confiabilidade: aumento relativo na confiabilidade dos índices com a passagem de avaliação tradicional para genômica, calculado em maio de 2021 para bodes de 50 rebanhos de elite (gráfico no catálogo; valores exatos não extraídos) [NSG Seminkatalog 2021–22].
- Cabritos genotipados ao nascer entram no cálculo do índice aos 4–6 meses [NSG Seminkatalog 2021–22].
- Bodes entram na IA aos 1,5 ano (antes: 2,5), reduzindo o intervalo de gerações [NSG Seminkatalog 2021–22].
- Importação de sêmen de Alpina francesa a cada dois anos, para limitar consanguinidade e comparar com o programa francês. A NSG descreve o controle do estado de caseína como muito bom [NSG Seminkatalog 2021–22].
- Raça: "Norwegian Dairy Goat", composta, com livro aberto e importações de Saanen e de Alpina francesa; frequência do exon 9 de 0,08 (Blichfeldt, Boman & Kvamsås, EAAP 2011, [docs.eaap.org/2011/S38_Blichfeldt.pdf](https://docs.eaap.org/2011/S38_Blichfeldt.pdf), trecho de busca).
- Ata do Fagrådet NSG (6/12/2023) menciona a confiabilidade dos valores genômicos; download falhou, conteúdo não lido ([URL na busca](https://www.nsg.no/getfile.php/13192295-1711850762/_NSG-PDF-filer/Geit/M%C3%B8tereferat%20Fagr%C3%A5det%20for%20geit/2023/Fagr%C3%A5det_2023-12-06_referat.pdf)).
- TYR: "implementation phase of single step genomic selection" em bovinos de corte (anúncio de emprego, [finn.no](https://www.finn.no/job/ad/323559486)). Não se aplica a caprinos.

### Inferences
- A genômica norueguesa é de escala pequena (50 rebanhos de elite) mas com efeito de encurtamento de gerações. É um bom modelo para programas de raça pequena.

### Gaps
- Número de caprinos registrados na NSG, de bodes avaliados por ano, modelo estatístico, software e periodicidade: não encontrados.
- Ata do Fagrådet 2023: não lida.

---

## Grécia, Reino Unido e Países Baixos

### Takeaway
Nenhum dos três tem programa oficial de avaliação genética de caprinos leiteiros documentado para 2020–2026 nas fontes consultadas. Há registros históricos na Grécia e pesquisa de longevidade no Reino Unido. Nos Países Baixos há valores genéticos de uma cooperativa (GIC) de data não identificada.

### Cited Findings
- **Grécia**: registro leiteiro desde 1952 (Ministério da Agricultura), sistemático desde 1978, com programas por raça [Cambridge, Animal Genetic Resources, estudo de caso (trecho de busca)](https://resolve.cambridge.org/core/journals/animal-genetic-resources-resources-genetiques-animales-recursos-geneticos-animales/article/development-and-maintenance-of-animal-recording-systems-in-greece-a-case-study/15B8C46ADFA8B020F50FFAEC199D3433). Cobertura de caprinos citada como 3.296 cabras em 36 rebanhos (dado sem data, trecho de busca). Raças locais: cerca de 4,5 milhões de animais em 200.000 rebanhos (estudo de caso ICAR, sem data no trecho, [icar.org](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-3-Bella/Georgoudis.pdf)). Genotipagem de Eghoria e Skopelos com Goat SNP50 e 48.841 SNPs após controle de qualidade (PLoS ONE 2019, [PMC6907847](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6907847/), trecho de busca). ICAR 2022 indica que Grécia e países balcânicos não aparecem na pesquisa de controle leiteiro ([ICAR 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al.pdf)).
- **Reino Unido**: estimativas de parâmetros genéticos de longevidade em caprinos leiteiros britânicos, herdabilidades de 0,08 a 0,46 (2018, [ILRI](https://dspace7test.ilri.org/items/6d10ba8c-9006-42f1-aafa-035da1b32e60/full), trecho de busca). Projeto liderado pela Yorkshire Dairy Goats, financiado pelo UKRI, prevê novo programa de melhoramento para qualidade do leite, caracteres funcionais, consumo e saúde, com padronização internacional de registros ([UKRI GtR](https://gtr.ukri.org/project/81766C7D-AEAA-4817-B7A3-DB2788EF4108), trecho de busca). Não há avaliação nacional documentada.
- **Países Baixos**: artigo da imprensa agrícola (sem data legível no trecho) sobre novos valores genéticos da GIC para caprinos, combinando dados da Holanda, Bélgica, Canadá e Eslovênia, com valores para ureia no leite e para CCS ([Stal & Akker](https://www.stal-en-akker.nl/artikel/816008-nieuwe-fokwaarden-voor-geitenhouderij), trecho de busca). Relatório CGN/Wageningen de maio de 2025 sobre programas de cinco raças (Boer, Bonte, Nubiana, Toggenburg, White) com controle de endogamia pelo NOG ([edepot.wur.nl/692497](https://edepot.wur.nl/692497), trecho de busca, não lido).

### Inferences
- Grécia e Balcãs são lacuna em dados de controle leiteiro na Europa, o que limita entrada em avaliação internacional.
- Nos Países Baixos, a avaliação mais concreta é de valores de cooperativa (GIC), e não de programa nacional.

### Gaps
- Grécia: programa atual (ELGO-DIMITRA, modelo, caracteres, rebanhos): não encontrado; buscas em grego não feitas.
- Reino Unido: avaliação nacional e genômica: não encontradas.
- Países Baixos: data e metodologia dos valores GIC: não verificadas.

---

## Estados Unidos (ADGA e CDCB)

### Takeaway
A avaliação genética oficial de caprinos leiteiros nos EUA é publicada pelo CDCB, com dados de controle leiteiro (DHI) e de tipo e pedigree fornecidos pelo ADGA. Os índices publicados são Net Merit e Fluid Merit; as avaliações de produção saem em agosto e dezembro, e as de tipo em dezembro. Não encontrei genômica para caprinos nem números atuais de rebanhos.

### Cited Findings
- **Raças avaliadas** (9): Alpine, Experimental, LaMancha, Nigerian Dwarf, Nubian, Oberhasli, Saanen, Sable e Toggenburg, além de mestiços dessas raças. Só animais com pai registrado são avaliados [CDCB](https://uscdcb.com/dairy-goats/).
- **Traits**: leite, gordura e proteína (agosto e dezembro); 13 caracteres lineares de tipo mais escore final (dezembro) [CDCB](https://uscdcb.com/dairy-goats/).
- **Índices**: Net Merit (leite, gordura e proteína) e Fluid Merit (leite e gordura) [CDCB](https://uscdcb.com/dairy-goats/). Fórmula histórica MFP$ = 0,01 PTA leite + 1,15 PTA gordura + 2,55 PTA proteína (documento de c. 2016–2017, [Wiggans](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf)).
- **Modelo histórico** (Wiggans, c. 2016–2017): y = HYS + HS + PE + A + e (rebanho-ano-estação, rebanho-touro, ambiente permanente, animal). A base é a média das cabras nascidas em 2010 forçada a zero, atualizada a cada cinco anos. PTA = metade do valor genético. Não consegui confirmar se o modelo atual é o mesmo.
- **Dados**: DHI para produção e pedigree; ADGA para tipo e pedigree. Em 1º/1/2016: 589 rebanhos e 17.381 cabras em controle leiteiro (Wiggans, c. 2016–2017). Dados de 2024–2025 não encontrados para caprinos.
- **Marcos** ([CDCB](https://uscdcb.com/dairy-goats/)): primeiras avaliações de leite, gordura e proteína para bodes em 1983; para fêmeas em 1984; modelo animal para produção em 1987; coleta de caracteres lineares pelo ADGA em 1988; avaliações de tipo em 1989; modelo animal multitraço para tipo em 1995; avaliações para Nigerian Dwarf em 2010.
- **Elite e PTA**: o ADGA publica listas de elite por percentil de PTA da rodada de dezembro de 2024 (trecho de busca, [ADGA](https://adga.org/adga-genetics-website/)).
- **Inseminação**: "A.I. enables widespread use of superior bucks and enables progeny-test bucks to be used across herds" [CDCB](https://uscdcb.com/dairy-goats/).

### Inferences
- O sistema americano é de avaliação tradicional de produção e tipo por modelo animal (com base em Wiggans), sem genômica publicada para caprinos nas fontes lidas. A escala de rebanhos parece pequena comparada à França, mas os dados de 2016 podem estar desatualizados.

### Gaps
- Número atual de rebanhos e cabras em controle leiteiro (ADGA/CDCB): não encontrado.
- Modelo e software atuais (CDCB): não encontrados na página lida.
- Genômica para caprinos nos EUA: não encontrada.

---

## Canadá e México

### Takeaway
Canadá não tem programa com nome documentado nas fontes lidas (CanGEN não foi encontrado). Há dados de avaliação de Alpina e Saanen participando do projeto SMARTER, avaliação de 305 dias por regressão aleatória e estudos de GWAS e ssGBLUP para conformação. México tem estudos de pesquisa, sem programa nacional documentado.

### Cited Findings
- **Canadá, dados do estudo internacional** ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389), tabela 1): Alpina, MYI, 8.007 de pedigree, 793 genotipados, 7.414 fenótipos. Saanen: 4.238, 903 e 3.947. Fenótipos de 1978 a 2018. Produção em 305 dias obtida por modelo de regressão aleatória de teste-dia (texto do estudo).
- **GWAS canadense com ssGBLUP** ([JDS 2023](https://doi.org/10.3168/jds.2022-22223)): 305 dias de primeira lactação: 6.409 Alpina e 3.434 Saanen; lactações posteriores: 5.827 e 2.632; conformação linear (8 caracteres): 5.158 Alpina e 2.342 Saanen; genotipados: 833 Alpina e 874 Saanen; modelos animal uni-característico com análise de GWAS de raça única e multiraça.
- **Conformação e ssGBLUP** (Massender et al., JDS 2022): citado em busca, com resultado de precisão maior para Saanen em modelo multiraça. DOI e autores não verificados (PDF da UniBE retornou HTML).
- **Canadá e SMARTER**: a população canadense é geneticamente mais distante das europeias (franceses e italianos são mais próximos entre si) ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)).
- **México, estudo de Saanen (2010)** (trecho de busca, [INIFAP](https://cienciaspecuarias.inifap.gob.mx/index.php/Pecuarias/article/download/1499/1494/1519)): dez rebanhos em Guanajuato, registros de 2000 a 2006, valores genéticos por modelo animal uni-característico com grupos de pais fantasmas; tendências por regressão no ano de nascimento.
- **México, contexto** (2003, trecho de busca): a seleção só por leite pode prejudicar a úbere; caracteres de conformação "se conoce poco" no México.

### Inferences
- O Canadá é um parceiro de dados e pesquisa, sem nome de programa nas fontes lidas. A genética canadense é mais distante das europeias, segundo [Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389).
- No México, os estudos são pontuais e não permitem caracterizar um programa.

### Gaps
- Entidade e modelo da avaliação oficial canadense (CanGEN ou equivalente): não encontrados.
- Número de rebanhos e cabras em controle leiteiro canadense: não encontrado.
- Programa nacional mexicano de avaliação de caprinos leiteiros: não encontrado.

---

## Brasil

### 9.1 Capragene (Embrapa Caprinos e Ovinos, ACCOMIG/Caprileite, MAPA)

#### Takeaway
O Capragene é o único programa brasileiro com sumários públicos de avaliação genética de caprinos leiteiros. Tem teste de progênie desde 2005, sumários em 2014, 2017 (primeira avaliação genômica), 2020 (terceiro sumário Saanen) e 2021 (primeiro sumário Alpina). Usa modelo animal multitraço e, para a Saanen, ssGBLUP em BLUPF90. Não encontrei sumário de 2023 nem o número de bodes testados por ano.

#### Cited Findings
- **História**: em 2005, a ABCC indicou os primeiros bodes; a associação de criadores (Caprileite/ACCOMIG) e a Embrapa organizaram o teste de progênie, com 15 criadores inscritos (12 Saanen, 2 Anglo-Nubiana, 1 Alpina). Exigência: no mínimo 30 matrizes por criador para inseminação com os bodes testados [Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf).
- **Grupos de bodes de teste**: 2005 (sem informação de produção), 2009 (produção das mães), 2011 e 2015 (valor genético predito para leite) [Embrapa 2017]; grupo de 2021 citado no sumário Alpina [Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf).
- **Desempenho**: ganho genético de 4,54 kg/ano em PL305 após a implantação do Capragene, revertendo a tendência de perda ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).
- **Sumário Saanen 2017** (2ª ed.; 1º genômico): 6.509 lactações disponíveis, 5.612 usadas após filtros; 3.094 animais com registros; pedigree de 9.541 animais. 768 amostras genotipadas com Axiom_OviCap (62.557 SNPs), resultando em 672 animais e 47.056 SNPs após controle de qualidade. Modelo multivariado com grupo de contemporâneas, interação tipo de parto × sexo das crias, classe de idade e tipo de ordenha. ssGBLUP com inferência bayesiana por amostragem de Gibbs (BLUPF90, Misztal 1999). PTAg e confiabilidade ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).
- **Sumário Saanen 2020** (3º sumário; 2º genômico) ([Embrapa 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf)): 6.941 lactações (o texto diz "aumento de 32,5%" sem base explícita; a razão com 2017 é de cerca de 1,24), 3.949 cabras, 34 rebanhos Saanen; PL305 média de 727,44 kg e duração de 300,01 dias. Sete caracteres em modelo multivariado. 988 Saanen genotipados com Axiom_OviCap (62.557 SNPs); 947 com genótipos válidos; pedigree de 14,144 animais (613 pais e 4.731 mães). ssGBLUP com Gibbs, BLUPF90. Melhoria no modelo: aumento de 6% na confiabilidade média das GPTA. Mais de 77 mil controles leiteiros individuais registrados até então.
- **Sumário Alpina 2021** (1º sumário; Documentos 147) ([Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)): 1.072 lactações, 153 grupos de contemporâneas, 654 cabras, 14 rebanhos; PL305 média de 764,64 kg; duração média de 297,14 dias. Herdabilidades: PL305 0,18; PGOR305 0,20; PPRO305 0,18; PEXT305 0,16; PLAC305 0,14; CCS305 0,19; duração 0,03. Modelo animal, sem genômica no trecho lido.
- **Estudo de 2026 sobre dados Capragene** ([DOI verificado](https://doi.org/10.1007/s11250-026-04980-4)): 4.574 cabras Saanen, pedigree de 5.829 animais nascidos de 1989 a 2020. Herdabilidade de número de crias ao longo da vida de 0,03 a 0,17 e de idade ao primeiro parto de 0,04; modelo de Poisson com melhor ajuste.
- **Avaliação econômica** (Lôbo et al., Proceedings do 10º WCGALP, 2014; sem URL no arquivo local): população de 600.000 cabras leiteiras, núcleo de 40.000; esquema tradicional com VPL negativo (US$ -2,28); esquema com teste de progênie positivo, com retorno de 20%; uso de bodes jovens até 15%; softwares ZPLAN.
- **Contexto** (Lôbo et al., Proceedings do WCGALP 2014): o Brasil é 15º produtor de leite caprino, com cerca de 158 mil toneladas/ano.

#### Inferences
- A avaliação Saanen é a mais madura do Capragene, com base de cerca de 6.900 lactações e genômica desde 2017. A Alpina tem sumário mas, até o que foi lido, sem genômica, e é uma base de 1.072 lactações.
- O número de bodes testados por ano é o principal dado que falta para avaliar a eficiência do teste de progênie. O sumário de 2017 indica que a progênie ficou abaixo do esperado por causa de poucos rebanhos colaboradores e baixa difusão da IA.
- Os parceiros nos sumários lidos são Embrapa Caprinos e Ovinos, Embrapa Gado de Leite (Juiz de Fora), Embrapa Recursos Genéticos e Biotecnologia, FZEA/USP (Pirassununga), ACCOMIG/Caprileite, ABCC e MAPA. A UFV, citada na pergunta, não aparece nos trechos lidos.

#### Gaps
- Número de bodes testados por ano (grupos de 2005, 2009, 2011, 2015 e 2021): não encontrado.
- Sumário 2023 ou 2024–2026: não encontrado; último sumário publicado localizado é o Alpina de 2021.
- Primeiro sumário Saanen de 2014 (Facó et al.): não lido.
- Número de caprinos com registro no programa em 2025–2026: não encontrado.
- Relação entre o 32,5% declarado no sumário de 2020 e o número de lactações de 2017: base não explicitada.

### 9.2 Controle leiteiro oficial (CLO) e registro

#### Takeaway
O controle leiteiro oficial de caprinos é coordenado pela ACCOMIG/Caprileite, com recursos do MAPA e dados armazenados no sistema SGR do Capragene, cuja guarda é da Embrapa. Não encontrei "Capritec" nem ligação da ABCC à execução do CLO. A ABCC aparece como registro genealógico e indicadora de bodes.

#### Cited Findings
- **Coordenação e execução**: ACCOMIG/Caprileite coordena. A execução foi feita pela ACGHMG (conforme as normas para bovídeos, Portaria SNAP nº 45, de 10/10/1986) até março de 2021; desde abril de 2021 a Caprileite executa em parceria com a ACGHMG. Dados inseridos no SGR (software em rede de Lôbo, 2013), hospedado em servidor da Embrapa ([Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)).
- **Início**: convênio MAPA–ACCOMIG/Caprileite em fins de 2006, com a Embrapa como depositária dos dados do teste de progênie ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).
- **Escala**: mais de 60 mil controles leiteiros individuais e 6.509 lactações Saanen disponíveis (12/12/2017) ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)); mais de 77 mil controles individuais e mais de 10 mil lactações válidas (Saanen, Alpina e Anglo-Nubiana) em 2020–2021 ([Embrapa 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf)).
- **Qualidade do leite** no controle leiteiro e nas avaliações desde 2009 ([Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)).
- **ABCC**: indicou os primeiros bodes do teste de progênie, apoia o registro genealógico e mantém sigilo dos códigos dos animais em teste ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf); [Embrapa 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)).
- **Dados de 2009 (trecho de busca)**: estudo de 2009 com registros mensais de 16 rebanhos em MG, RJ, SP e ES, com ficha padronizada de escrituração zootécnica ([Embrapa, artigo de 2009, trecho de busca](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/576241/1/AACControleLeiteiroOficialemCaprinosResultadosPreliminares.pdf)).

#### Inferences
- O CLO é o núcleo de dados do Capragene, com dados vindos de rebanhos de Minas Gerais e região Sudeste. O Nordeste, com 91% do rebanho caprino nacional (IBGE 2012, trecho de busca), não está coberto pelo CLO, o que limita a representatividade nacional.

#### Gaps
- Escala atual do CLO (2024–2026), número de rebanhos e de cabras controladas: não encontrada.
- "Capritec": não encontrado em nenhuma fonte.
- Papel operacional da ABCC no controle leiteiro: não encontrado.

### 9.3 Raças brasileiras e programas locais

#### Takeaway
Moxotó e Canindé foram objeto de programa da Embrapa Caprinos e Ovinos desde 1980, com foco em caracterização e conservação. Não encontrei programa de avaliação genética para elas nem para a Graúna.

#### Cited Findings
- Programa de melhoramento de caprinos da Embrapa Caprinos e Ovinos (Sobral, CE), iniciado em 1980, com objetivo de caracterizar e preservar raças naturalizadas (Moxotó, Canindé, Repartida, Marota, SRD) e exóticas (Anglo-Nubiana, Bhuj, Pardo Alemã, Mambrina, Saanen, Toggenburg). "Os objetivos somente foram atingidos parcialmente" ([Embrapa, documento de busca](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/939270/1/AACEvolucaodomelhoramento.pdf), trecho de busca).
- Moxotó: núcleo de conservação de 78 animais em Sobral (inventário de 2016; número de trecho de busca, sem URL confirmada).
- Comparação de cabritos Moxotó e Canindé: peso ao nascer maior na Moxotó, possivelmente por maior pressão de seleção no rebanho base (trecho de busca, [Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/879460/1/AACDesempenhodoscaprinospertencentesaosnucleos.pdf)).
- Graúna: nenhum resultado relevante na busca.

#### Gaps
- Avaliação genética oficial de Moxotó, Canindé e Graúna em 2020–2026: não encontrada.
- Números atuais dos núcleos de conservação: não verificados.

### 9.4 Genômica no Brasil

#### Takeaway
A genômica brasileira está no Capragene (Saanen, desde 2017) e em projeto de seleção genômica da Embrapa. Não encontrei iniciativa genômica nacional fora do Capragene.

#### Cited Findings
- Projeto "Seleção genômica em caprinos leiteiros", financiado pelo Macroprograma 1 da Embrapa, citado como base do 1º sumário genômico ([Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).
- Banco de DNA (FTA) com 1.148 animais de vários rebanhos do Capragene, 84% Saanen; painel de 16 microssatélites com poder de exclusão de 99,99% para testes de parentesco (Silva et al., 2014, citado em [Embrapa 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).
- Genômica do Capragene (Saanen): ver 9.1. Estudo de 2026 com dados Capragene e modelos Bayesianos de características reprodutivas ([DOI](https://doi.org/10.1007/s11250-026-04980-4)).

#### Gaps
- Avaliação genômica da Alpina e da Anglo-Nubiana: não localizada.
- Custos e volume de genotipagem anual: não encontrados.

---

## Lista de programas com dados ou documentos não encontrados (consolidado)
- Grécia (programa atual), Reino Unido (avaliação nacional), Países Baixos (método GIC), Canadá (nome e avaliação oficial), México (programa nacional), Capritec, Graúna e ANAPRI: sem fonte primária confiável nas buscas.
- França: pesos do ICC após 2023, tamanho da referência genômica e data de início do single-step.
- Espanha: catálogos 2023–2025 de Caprigran e Acriflor; PDF do programa Malagueña (download vazio).
- Itália: rotina do ssGBLUP e cronograma de publicação da Asso.Na.Pa.
- Noruega: número de caprinos, modelo e frequência da NSG; ata do Fagrådet 2023 (não lida).
- EUA: números atuais de rebanhos e genômica.
- Brasil: sumário Capragene 2023–2026, bodes testados por ano, escala atual do CLO.
