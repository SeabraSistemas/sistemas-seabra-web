# Como pesagens e pedigree viram DEPs confiáveis

As DEPs (diferenças esperadas na progênie, as EPDs dos programas de língua inglesa) de bovinos de corte são metade do valor genético predito pelo **BLUP de modelo animal**: um único sistema de equações de modelos mistos (MME, de Henderson) que combina, numa só solução, os registros ajustados por **grupo de contemporâneos (efeito fixo)**, o pedigree inteiro por meio da **inversa da matriz de parentesco (A⁻¹)** e as variâncias estimadas por REML. Sobre esse núcleo, cada característica ganha um modelo próprio: **direto-materno** para pesos até a desmama, **multicaracterística** para corrigir o viés da seleção sequencial, **limiar** para escores e prenhez, **limiar ou sobrevivência** para permanência (STAY) e **regressão aleatória** para pesagens seriadas. A genômica entra trocando A⁻¹ por **H⁻¹ (ssGBLUP)**, com o algoritmo APY quando há centenas de milhares de genotipados. É assim que operam os programas de N muito grande: a ANCP usa modelo animal direto-materno desde 1993 e ssGBLUP em todas as DEPs genômicas desde 2019, a Angus Genetics roda single-step semanal desde 2017, a Hereford americana usa o BOLT, e a BREEDPLAN e o IBOVAL migraram para single-step entre 2024 e 2025. A acurácia vem da variância do erro de predição (PEV), com a escala BIF mais conservadora que a correlação, e os índices (MGTe, iABCZ, IQG, $Values) somam DEPs ponderadas por valores econômicos ou percentuais. Para fazendas de 100 a 5.000 vacas, a precisão não vem de rodar sozinho um modelo sofisticado: nos exemplos deste relatório, 100 registros de 5 touros estimam a herdabilidade com desvio-padrão de 0,30, e um bezerro num grupo de contemporâneos de 2 animais perde cerca de 30% da acurácia possível. O caminho é fixar parâmetros pela literatura, formar grupos de contemporâneos grandes, conectar o rebanho por inseminação a touros avaliados e inscrevê-lo, com genotipagem, numa avaliação nacional, usando razão BIF, MPPA e BLUP intra-rebanho como ferramentas de manejo. Todos os números foram conferidos em Python/numpy, inclusive as regras de A⁻¹ e a fórmula de H⁻¹, que as notas de pesquisa não haviam conferido nas fontes primárias.

**Grau de confirmação.** As notas que sustentam este relatório foram compiladas por busca na web, quase sempre a partir de resumos e trechos, sem leitura do texto integral. Três marcadores aparecem ao longo do texto. **[não verificado]** indica fórmula ou afirmação de conhecimento de fundo, sem fonte primária lida. **[conferido numericamente]** indica relação algébrica que este relatório verificou por computação: isso prova a consistência interna da fórmula, mas não confirma a autoria nem a notação do artigo original. **"Atribuição a confirmar"** indica número vindo de trecho de busca cujo vínculo com a fonte não ficou inequívoco. Os DOIs aparecem só quando já constavam nas notas, e os exemplos numéricos usam dados fictícios, reproduzíveis pelo script do Apêndice A.

## O modelo animal resolve ambiente, pedigree e genética num único sistema

### Equação, pressupostos e efeitos

O modelo animal unicaracterística, que serve de base a todos os outros, é escrito assim **[não verificado na fonte primária; forma padrão de Henderson e Mrode]** ([Mrode 2014, registro de biblioteca](https://ebook.library.uitm.edu.my/Record/22148); [Henderson 1975, metadados](https://en.wikipedia.org/wiki/Best_linear_unbiased_prediction)):

```
y = X b + Z a + e

y  vetor n×1 de registros (ex.: P205 ajustado, em kg)
b  efeitos fixos: grupos de contemporâneos (GC), covariáveis (idade da mãe, idade à pesagem)
a  valores genéticos aditivos (aleatórios), um por animal do pedigree (q×1), inclusive sem registro
X, Z  matrizes de incidência (0/1) que ligam cada registro ao seu GC e ao seu animal

E[a] = 0    E[e] = 0    cov(a, e') = 0
var(a) = A σ²a      var(e) = I σ²e      var(y) = V = Z A Z' σ²a + I σ²e
h² = σ²a / (σ²a + σ²e)        λ = σ²e / σ²a = (1 − h²) / h²
```

As equações de modelos mistos (MME) que dão, ao mesmo tempo, o BLUE dos efeitos fixos e o BLUP dos valores genéticos são:

```
[ X'X       X'Z        ] [ b̂ ]   [ X'y ]
[ Z'X    Z'Z + λ A⁻¹   ] [ â ] = [ Z'y ]

Forma geral (vários efeitos aleatórios, resíduos correlacionados):
[ X'R⁻¹X    X'R⁻¹Z        ] [ b̂ ]   [ X'R⁻¹y ]
[ Z'R⁻¹X    Z'R⁻¹Z + G⁻¹  ] [ â ] = [ Z'R⁻¹y ]      com G = var(a), R = var(e)
```

Três pressupostos sustentam o método. O primeiro é que as variâncias são **conhecidas**: na prática, são estimadas antes por REML e tratadas como verdadeiras. O segundo é que a população-base, formada pelos animais de pais desconhecidos, é **não aparentada, não endogâmica e de média genética comum**. Quando isso falha, porque há animais importados ou touros sem registro, entram os **grupos genéticos** (pais fantasmas agrupados por origem e época). Westell, Quaas e Van Vleck (1988) definiram os coeficientes desses grupos nas MME; o resumo diz que eles são necessários quando entram animais de fora ou quando pais sem registro são escolhidos (volume e páginas de repositório, autoria não confirmada: [UNL](https://digitalcommons.unl.edu/animalscifacpub/index.11.html)). O terceiro é que o efeito fixo de GC **absorve todo o ambiente comum** aos contemporâneos. Pelas diretrizes do BIF, o GC reúne animais do mesmo sexo, de idade semelhante e de manejo comum no mesmo local ([BIF, Contemporary Groups](https://guidelines.beefimprovement.org/index.php/Contemporary_Groups)), desmamados e pesados no mesmo dia ([BIF, Weaning Weight](https://guidelines.beefimprovement.org/index.php/Weaning_Weight)). GCs podem encolher depois da estação de parição, mas não crescer, e um grupo dividido não volta a ser reunido. A janela de nascimento é de 90 dias no BIF ([BIF, Marbling](https://guidelines.beefimprovement.org/index.php/Marbling_score)) e de 60 dias no ICAR ([ICAR, Beef Recording](https://www.icar.org/Guidelines/03-Beef-Cattle-Recording.pdf)). No Brasil, a combinação rebanho-ano-estação de nascimento-sexo é a base usual do GC **[não verificado: aparece em trechos de estudos de Nelore sem fonte identificada]**. Tratar o GC como fixo, e não aleatório, evita viés quando rebanhos diferem em nível genético médio **[não verificado]**. O efeito genético é aleatório porque se quer predizê-lo com encolhimento: λ grande, isto é, h² baixa, puxa as predições para a média.

A transição do modelo de touro para o modelo animal mudou o modelo, não o algoritmo. O modelo de touro usa apenas a relação pai-filho; o modelo animal usa todos os parentescos e os registros de todos os animais **[não verificado]**. Quaas e Pollak (1980) formalizaram a metodologia de modelos mistos para testes de desempenho em fazendas de corte (citado como base do BLUP de modelo animal em [estudo Hereford de Fort Keogh](https://www.researchgate.net/publication/21591726_Selection_for_postweaning_growth_in_inbred_Hereford_cattle_the_Fort_Keogh_Montana_line_1_example)). No Brasil, a ANCP usa DEPs diretas e maternas por modelo animal desde 1993 ([ANCP, História](https://www.ancp.org.br/ancp/historia/)).

### Antes do modelo: padronizar idades e formar os grupos

O registro que entra em y quase nunca é o peso bruto. Cada programa padroniza a idade. A Angus americana publica a EPD de desmama ajustada a 205 dias, com o GC centrado em 205 dias e cada animal entre 120 e 280 dias ([Angus, definições](https://www.angus.org/Nce/Definitions)). A BREEDPLAN ajusta a 200 dias, com pesagens de 80 a 300 dias, e a 400 dias, com pesagens de 301 a 500 dias, corrigindo pela idade da mãe ([Charolais UK](https://www.charolais.co.uk/wp-content/uploads/2021/07/Understanding-Weight-EBVs.pdf)). O CDP da ABCZ faz pesagens trimestrais de 0 a 510 dias e, sem peso ao nascer, usa a média racial ([Regulamento do CDP](https://www.abcz.org.br/common/uploads/secao/a66183db97120042234f2b57a42cdb7a.pdf)). O Geneplus ajusta o sobreano a 550 dias ([UFMS](https://sigpos.ufms.br/portal/trabalho-arquivos/download/4934)), e a ANCP publica pesos aos 120, 210, 365 e 450 dias ([Terra Brava, reproduzindo as definições da ANCP](https://terrabrava.com.br/touro/1771-fiv-terra-brava/)). A forma linear de ajuste usada pela Canadian Angus é peso ajustado = GMD pré-desmama × 205 + peso ao nascer, com correção por idade da mãe ([Canadian Angus](https://www.cdnangus.ca/support/)). Um bezerro com 32 kg ao nascer e 190 kg aos 190 dias tem GMD = (190 − 32)/190 = 0,832 kg/dia e **P205 = 0,832 × 205 + 32 = 202,5 kg**. As tabelas de fatores de idade da mãe do BIF e da ANCP não foram encontradas pelas notas.

O desenho do GC define quanta informação sobra para a genética. Um GC de um só animal não traz informação para a avaliação ([eBEEF, Sire Selection Manual 2021](https://ebeef.ucdavis.edu/sites/g/files/dgvnsk7331/files/inline-files/NBCEC%20SireSelectionManual2021_0.pdf)), e o BIF recomenda ao menos dois touros por GC, exigência que dispensa quando se usa modelo animal ([BIF Guidelines, 9ª ed.](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf)). As notas não encontraram tamanho mínimo oficial de GC. O efeito do tamanho, porém, é fácil de calcular: com h² = 0,25 e um registro por animal não aparentado, a acurácia máxima é √h² = 0,50, mas o próprio animal "gasta" informação ao estimar a média do grupo. **[conferido numericamente]**

| Animais no GC | 2 | 5 | 20 | 100 |
|---|---|---|---|---|
| Acurácia (r) do valor genético | 0,354 | 0,447 | 0,487 | 0,497 |

### Passo 1: do pedigree a A, F e A⁻¹

O exemplo usa oito animais. Os animais 1, 2 e 3 são a base, sem pais conhecidos. O touro 4 é filho de 1 × 2, e a fêmea 5 é filha de 1 × 3, de modo que 4 e 5 são meios-irmãos paternos. O macho 6 nasceu do acasalamento de 4 × 5, entre meios-irmãos, e por isso é endogâmico. A fêmea 7 é filha de 4 × 3, e o macho 8 é filho de 4 com mãe desconhecida. Os registros são P205 ajustados para idade, sexo e idade da mãe.

| Animal | Pai | Mãe | Safra (GC) | P205 (kg) |
|---|---|---|---|---|
| 1, 2, 3 | – | – | base | – |
| 4 | 1 | 2 | 2022 | 212 |
| 5 | 1 | 3 | 2022 | 198 |
| 6 | 4 | 5 | 2024 | 225 |
| 7 | 4 | 3 | 2024 | 204 |
| 8 | 4 | desconhecida | 2024 | 196 |

O **método tabular** monta A com os pais sempre antes dos filhos. A regra é A_ij = ½(A_j,pai(i) + A_j,mãe(i)) fora da diagonal e A_ii = 1 + F_i na diagonal, com F_i = ½ A_pai,mãe (Wright) **[não verificado na fonte; conferido numericamente contra a inversa]**. O resultado dá **F₆ = ½ × A₄₅ = ½ × 0,25 = 0,125**:

```
        1      2      3      4      5      6       7       8
1     1      0      0      0,5    0,5    0,5     0,25    0,25
2     0      1      0      0,5    0      0,25    0,25    0,25
3     0      0      1      0      0,5    0,25    0,5     0
4     0,5    0,5    0      1      0,25   0,625   0,5     0,5
5     0,5    0      0,5    0,25   1      0,625   0,375   0,125
6     0,5    0,25   0,25   0,625  0,625  1,125   0,4375  0,3125
7     0,25   0,25   0,5    0,5    0,375  0,4375  1       0,25
8     0,25   0,25   0      0,5    0,125  0,3125  0,25    1
```

Inverter A é inviável com milhões de animais, mas A⁻¹ pode ser montada diretamente do pedigree pelas regras de Henderson (1976), generalizadas por Quaas (1976) para endogamia ([Frontiers in Genetics 2021, descrevendo os dois métodos](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2021.655638/full); [Quaas 1976, registro AGRIS](https://agris.fao.org/search/en/records/647359b008fd68d54601dd34)). Cada animal i soma à matriz a contribuição α_i · t_i t_i', em que t_i vale 1 na posição do animal e −½ na posição de cada pai conhecido:

```
ambos os pais conhecidos:   d_i = 0,5 − 0,25 (F_pai + F_mãe)
um pai conhecido:           d_i = 0,75 − 0,25 F_pai
nenhum pai conhecido:       d_i = 1                        α_i = 1 / d_i

contribuições (ambos conhecidos):  (i,i) += α ; (i,pai), (i,mãe) += −α/2 ; (pai,pai), (mãe,mãe), (pai,mãe) += α/4
```

No exemplo, os animais 1, 2 e 3 contribuem α = 1; os animais 4 a 7 contribuem α = 2; o animal 8, com um só pai conhecido, contribui α = 4/3. A soma é:

```
        1     2     3     4      5     6     7     8
1     2     0,5   0,5   −1     −1    0     0     0
2     0,5   1,5   0     −1     0     0     0     0
3     0,5   0     2     0,5    −1    0     −1    0
4     −1    −1    0,5   3,333  0,5   −1    −1    −0,667
5     −1    0     −1    0,5    2,5   −1    0     0
6     0     0     0     −1     −1    2     0     0
7     0     0     −1    −1     0     0     2     0
8     0     0     0     −0,667 0     0     0     1,333
```

A matriz é **idêntica à inversa numérica de A (diferença máxima 0)**. Como nenhum pai do exemplo é endogâmico, a correção de Quaas ainda não aparece. Por isso o pedigree foi estendido com os filhos 9 (6 × 3), 10 (6 × desconhecida) e 11 (6 × 7), que têm pai endogâmico. Com F nas fórmulas de d_i, a inversa por regras volta a coincidir com a numérica (diferença de 4 × 10⁻¹⁶). Ignorando F, o erro chega a 0,133. Isso confirma inclusive a forma d_i = 0,75 − 0,25 F_pai para um pai conhecido, que as notas marcavam como "a conferir" **[conferido numericamente]**. Em pedigrees grandes, os coeficientes F vêm do algoritmo de Meuwissen e Luo (1992) ([GSE, DOI 10.1186/1297-9686-24-4-305](https://doi.org/10.1186/1297-9686-24-4-305)), usado em programas como o CoeFR ([manual](https://www.agri.tohoku.ac.jp/animalbreeding/program/CoeFR/CoeFR_English_Manual.pdf)).

### Passo 2: montar e resolver as MME

Com σ²a = 100 kg² e σ²e = 300 kg² (h² = 0,25, valor dentro da faixa do peso à desmama em Nelore discutida adiante), λ = 3. Os efeitos fixos são os dois GCs (safras 2022 e 2024). As colunas de X'X contam os registros por GC, Z'Z põe 1 na diagonal dos animais com registro, e o bloco de animais recebe λA⁻¹:

```
           GC22  GC24   a1    a2    a3    a4    a5    a6    a7    a8   |  RHS
GC22    [   2     0     0     0     0     1     1     0     0     0  ] |  410
GC24    [   0     3     0     0     0     0     0     1     1     1  ] |  625
a1      [   0     0     6    1,5   1,5   −3    −3     0     0     0  ] |    0
a2      [   0     0    1,5   4,5    0    −3     0     0     0     0  ] |    0
a3      [   0     0    1,5    0     6    1,5   −3     0    −3     0  ] |    0
a4      [   1     0    −3    −3    1,5   11    1,5   −3    −3    −2  ] |  212
a5      [   1     0    −3     0    −3    1,5   8,5   −3     0     0  ] |  198
a6      [   0     1     0     0     0    −3    −3     7     0     0  ] |  225
a7      [   0     1     0     0    −3    −3     0     0     7     0  ] |  204
a8      [   0     1     0     0     0    −2     0     0     0     5  ] |  196
```

A solução dá **GC 2022 = 203,71 kg** e **GC 2024 = 207,56 kg**, e os valores genéticos estão na tabela do passo seguinte. Ela coincide com a forma clássica de BLUP por mínimos quadrados generalizados, b̂ = (X'V⁻¹X)⁻¹X'V⁻¹y e â = σ²a A Z'V⁻¹(y − Xb̂), com diferença de 2 × 10⁻¹⁴ **[conferido numericamente]**. A leitura é intuitiva. O macho 6 tem o maior valor (+3,59 kg) porque pesou 17,4 kg acima do seu GC e é filho dos animais 4 (+2,12) e 5 (+0,45), mas o encolhimento reduz o desvio bruto a uma fração. O animal 1, sem registro, recebe +1,15 kg só pelos descendentes. O macho 8 ficou 11,6 kg abaixo do GC, mas o pai 4 o puxa para −1,46.

Com milhões de equações, ninguém inverte a matriz. Os programas usam métodos iterativos: Gauss-Seidel com iteração sobre os dados, que dispensa montar a matriz, e gradiente conjugado pré-condicionado (PCG) **[não verificado quanto aos detalhes]** ([Tsuruta, Misztal e Strandén 2001](https://jukuri.luke.fi/items/6bbbd5ec-6bd9-471f-a6f0-b24a88242ae4/full); [Vandenplas et al. 2020, modelo materno multicaracterística](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7222437/)). O sistema tem uma equação por animal do pedigree mais uma por nível de efeito fixo, independentemente do número de registros.

### Passo 3: da PEV à acurácia e à DEP

A inversa da matriz de coeficientes, C, dá a variância do erro de predição: **PEV_i = c^ii · σ²e**, que coincidiu com a fórmula direta var(a − â) = G − GZ'PZG **[conferido numericamente]**. Dela saem três medidas de precisão **[não verificado na fonte primária, exceto a fórmula BIF]**:

```
confiabilidade      r² = 1 − PEV / [(1 + F) σ²a]
acurácia            r  = √r²            (correlação entre valor predito e verdadeiro)
acurácia BIF        a_BIF = 1 − √{ PEV / [(1 + F) σ²a] } = 1 − √(1 − r²)
DEP = EBV / 2       erro-padrão da DEP (SEP) = √PEV / 2
```

A forma BIF, inclusive o fator (1 + F), está nas diretrizes ([BIF, Accuracy](https://guidelines.beefimprovement.org/index.php/Accuracy)), e o erro-padrão de predição como √[(1 − acc²)·Vg] aparece em Van Vleck ([BIF 2016](https://www.bifconference.com/bif2016/documents/GGP-BIF16-Van-Vleck.pdf)).

| Animal | F | EBV (kg) | DEP (kg) | PEV | r | r² | a_BIF | SEP da DEP (kg) |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 1,15 | 0,58 | 98,9 | 0,107 | 0,011 | 0,006 | 4,97 |
| 2 | 0 | 1,03 | 0,51 | 96,7 | 0,183 | 0,033 | 0,017 | 4,92 |
| 3 | 0 | −0,50 | −0,25 | 93,5 | 0,254 | 0,065 | 0,033 | 4,84 |
| 4 | 0 | 2,12 | 1,06 | 92,1 | 0,281 | 0,079 | 0,040 | 4,80 |
| 5 | 0 | 0,45 | 0,23 | 89,6 | 0,322 | 0,104 | 0,053 | 4,73 |
| 6 | 0,125 | 3,59 | 1,80 | 102,1 | 0,304 | 0,092 | 0,047 | 5,05 |
| 7 | 0 | 0,19 | 0,09 | 91,5 | 0,291 | 0,085 | 0,043 | 4,78 |
| 8 | 0 | −1,46 | −0,73 | 89,3 | 0,326 | 0,107 | 0,055 | 4,73 |

A tabela é a lição mais importante para um rebanho pequeno. **Com um registro por animal e GCs de 2 e 3 bezerros, nenhum animal passa de r = 0,33**, e o erro-padrão das DEPs (cerca de 4,8 kg) é maior que a amplitude das próprias DEPs (−0,73 a +1,80 kg). Na escala BIF, as acurácias nem chegam a 0,06. A escala BIF é deliberadamente conservadora: r = 0,50 equivale a a_BIF = 0,134, conversão que confere com a tabela da Oklahoma State ([OSU](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html)). A tabela de conversão completa, calculada aqui, é: **r 0,50 → 0,134; 0,60 → 0,200; 0,80 → 0,400; 0,90 → 0,564; 0,98 → 0,801**. Antes de comparar a "acurácia" de dois sumários, é preciso saber qual escala cada um publica; as notas não encontraram a escala usada por ANCP, ABCZ e Geneplus.

A "Possible Change" (PC) traduz a acurácia em amplitude: o intervalo EPD ± PC contém o valor verdadeiro com cerca de 2/3 de probabilidade ([Angus, Accuracy and Possible Change](https://www.angus.org/tools-resources/national-cattle-evaluation/accuracy-and-possible-change)). Para uma distribuição normal, o intervalo de 68% é DEP ± SEP. A fórmula de PC do BIF aparece corrompida na página das diretrizes ([BIF, Possible Change](https://guidelines.beefimprovement.org/index.php/Possible_Change)), e duas cópias da tabela Angus divergem em algumas células, por isso o relatório não reproduz valores de PC. Em avaliações grandes, a PEV exata é inviável, e as aproximações usadas podem superestimar a acurácia, sobretudo em animais jovens ([BIF, Accuracy](https://guidelines.beefimprovement.org/index.php/Accuracy)).

### Variâncias: REML, AI-REML e Gibbs

As variâncias que alimentam λ são estimadas por máxima verossimilhança restrita (REML). As fórmulas abaixo são de conhecimento de fundo **[não verificado]**:

```
ℓ_R = −½ [ log|V| + log|X'V⁻¹X| + y'Py ] + constante,   P = V⁻¹ − V⁻¹X(X'V⁻¹X)⁻¹X'V⁻¹

AI-REML:   θ(k+1) = θ(k) + AI⁻¹ s,   AI_ij = ½ y'P(∂V/∂θ_i)P(∂V/∂θ_j)Py,   s_i = ∂ℓ_R/∂θ_i
EM-REML:   σ²a(novo) = [ â'A⁻¹â + tr(C^aa A⁻¹) σ²e ] / q
Bayes:     amostragem de Gibbs das condicionais completas; variância a posteriori dá a precisão
```

O algoritmo de informação média (AI-REML) é de Gilmour, Thompson e Cullis (1995) ([Univ. de Edimburgo](https://www.research.ed.ac.uk/en/publications/average-information-reml-an-efficient-algorithm-for-variance-para/)). A família BLUPF90 junta BLUP, REML e AI-REML no `blupf90+` e os amostradores de Gibbs, inclusive os de limiar, no `gibbsf90+` ([INIA 2024](https://www.inia.uy/sites/default/files/publications/2024-10/36-012.pdf)). A Embrapa mantém o Intergen 3.0, em Fortran, com BLUP e inferência bayesiana por MCMC ([Embrapa](https://www.embrapa.br/en/busca-de-solucoes-tecnologicas/-/produto-servico/8404/intergen-30---software-para-avaliacao-genetica-de-bovinos-de-corte)), mas nenhuma fonte liga esse software às avaliações oficiais do Geneplus. Os papéis de ASReml, WOMBAT, DMU e MiX99 não foram confirmados pelas notas.

## Cada característica exige um modelo próprio

### Pesos até a desmama: modelo direto-materno

O peso à desmama depende dos genes do bezerro e da habilidade materna da mãe (leite, cuidado), que também é herdável. O modelo de Willham (1972) separa os dois efeitos (citado em [J Agric Sci 2024](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/E634983EF106695E72C27BA1EE5CEDA1/S0021859624000285a.pdf/direct-and-maternal-genetic-parameters-for-growth-traits-in-jersey-crossbred-cattle.pdf)). A forma matricial **[não verificado na fonte; conferido numericamente]** é:

```
y = X b + Z₁ a + Z₂ m + W p + e

a   efeito genético direto do bezerro (Z₁ liga o registro ao bezerro)
m   efeito genético materno (Z₂ liga o registro do bezerro à MÃE)
p   ambiente permanente materno: um nível por vaca, repetido em todos os partos (não herdável)

var [a; m] = G₀ ⊗ A,    G₀ = [ σ²a   σam ]
                             [ σam   σ²m ]
var(p) = I σ²p ;  var(e) = I σ²e

MME: bloco (a, m) recebe G₀⁻¹ ⊗ A⁻¹ ; bloco p recebe I/σ²p ; resíduo entra como 1/σ²e
σ²P = σ²a + σ²m + σam + σ²p + σ²e          (bezerro e mãe têm parentesco 0,5)
h²d = σ²a/σ²P ;   h²m = σ²m/σ²P ;   r_am = σam/(σa σm)
```

A fórmula da variância fenotípica merece atenção. As notas traziam **2σam**, mas a diagonal de V do exemplo mostra que, para um bezerro não endogâmico, o termo correto é **σam**, porque a covariância entre o efeito direto do bezerro e o materno da mãe é 0,5 × σam, e ela entra duas vezes **[conferido numericamente: var(y) = 385 pela matriz V e pela fórmula]**.

No exemplo, as mães dos bezerros com registro são 2 (do animal 4), 3 (dos animais 5 e 7) e 5 (do animal 6); a do animal 8 é desconhecida. Com σ²a = 100, σ²m = 40, σam = −15, σ²p = 30 e σ²e = 230, tem-se σ²P = 385, h²d = 0,26, h²m = 0,10 e r_am = −0,24. A solução coincide com a forma GLS (diferença de 2 × 10⁻¹⁴):

| Animal | DEP direta (kg) | DEP materna (kg) | Total materno (kg) |
|---|---|---|---|
| 1 | 0,44 | 0,41 | 0,63 |
| 2 (mãe de 4) | 0,37 | 0,35 | 0,53 |
| 3 (mãe de 5 e 7) | −0,11 | −0,11 | −0,16 |
| 4 | 0,94 | 0,30 | 0,76 |
| 5 (mãe de 6) | 0,07 | 0,64 | 0,67 |
| 6 | 1,75 | 0,28 | 1,16 |
| 7 | 0,16 | 0,13 | 0,21 |
| 8 | −1,02 | 0,37 | −0,14 |

A vaca 5 mostra como o modelo reparte a informação. O filho dela, o animal 6, pesou cerca de 17 kg acima da média do GC. O modelo atribui parte disso aos genes do bezerro (DEP direta de 6 = 1,75), parte à habilidade materna herdável da vaca (DEP materna = 0,64) e parte ao ambiente permanente, que não passa às filhas (p̂ = +1,50; para as vacas 2 e 3, p̂ = +0,64 e −0,95). O **total materno** (TMD), aqui calculado como DEP materna + ½ DEP direta, é a convenção de "leite + ½ desmama" **[não verificado em fonte BIF]**. Ele aparece com esse nome nos índices brasileiros (TMD no iABCZ e no IQG).

Os parâmetros reais têm faixa estreita para o efeito direto e larga para a covariância. Em Nelore, um estudo bayesiano estimou h²d = 0,13 e h²m = 0,11 para peso à desmama ([Animal 2021](https://www.sciencedirect.com/science/article/abs/pii/S1871141321000081)). Outro mostrou que **r_am vai de −0,20 a +0,31** conforme aumenta a proporção de vacas com registro próprio, e que os sinais negativos da literatura antiga podem vir da estrutura dos dados ([Animal 2024](https://www.sciencedirect.com/science/article/abs/pii/S1871141324000301)). No Angus australiano, h²d foi de 0,35, 0,20, 0,24 e 0,25 (nascimento, desmama, sobreano e 600 dias) e h²m de 0,08, 0,09, 0,06 e 0,04 ([Livestock Production Science](https://www.sciencedirect.com/science/article/abs/pii/0301622695000836)). Em Hereford mocho, a correlação genética entre peso materno à desmama e leite foi de cerca de 0,99 ([Kansas State, 1995](https://newprairiepress.org/kaesrr/vol0/iss1/639/)), o que mostra que o componente "leite" carrega quase toda a informação materna.

### Pesos depois da desmama: multicaracterística contra o viés de seleção

Quando só os animais bons à desmama chegam ao sobreano, uma análise univariada do sobreano ignora por que os outros saíram e fica viesada. A análise multicaracterística, que inclui os registros de desmama dos descartados, corrige o problema, como mostraram Pollak, van der Werf e Quaas com o peso ao sobreano em corte ([J Dairy Sci 1984, DOI 10.3168/jds.S0022-0302(84)81481-2](https://doi.org/10.3168/jds.S0022-0302(84)81481-2)). A forma **[não verificado na fonte; conferido numericamente]** é:

```
[y₁]   [X₁  0 ] [b₁]   [Z₁  0 ] [a₁]   [e₁]
[y₂] = [ 0  X₂] [b₂] + [ 0  Z₂] [a₂] + [e₂]

var [a₁; a₂] = G₀ ⊗ A ;   var(e) = R, com bloco R₀ por animal
(animal sem uma das características: usa-se só a submatriz de R₀ das características medidas)

MME: [ X'R⁻¹X    X'R⁻¹Z             ] [ b̂ ]   [ X'R⁻¹y ]
     [ Z'R⁻¹X    Z'R⁻¹Z + G₀⁻¹ ⊗ A⁻¹ ] [ â ] = [ Z'R⁻¹y ]
```

O exemplo acrescenta o peso aos 450 dias (PS450) para os animais 4 (305 kg), 5 (290), 6 (330) e 7 (300). O macho 8, o mais leve da safra 2024 na desmama, foi vendido e não tem PS. Os parâmetros são G₀ = [100 105; 105 225] (correlação genética de 0,70 e h² do PS de 0,36) e R₀ = [300 100; 100 400].

| Animal | EBV PS, bicaracterística | EBV PS, só PS | r, bicaracterística | r, só PS |
|---|---|---|---|---|
| 4 | 4,04 | 3,13 | 0,349 | 0,340 |
| 5 | 0,16 | −0,76 | 0,369 | 0,350 |
| 6 | 6,51 | 4,35 | 0,329 | 0,296 |
| 7 | −1,80 | −3,17 | 0,301 | 0,261 |
| 8 (vendido) | **−0,66** | **+1,57** | 0,267 | 0,170 |

O animal 8 resume o argumento. A análise só com PS não sabe que ele foi descartado por ser leve; vê apenas que é filho do touro 4, que tem bom sobreano, e lhe dá EBV positivo. A análise bicaracterística usa o peso à desmama dele e a correlação genética de 0,70 e o coloca no negativo. Todas as acurácias sobem.

### Escores e prenhez: modelo de limiar

Facilidade de parto, prenhez de novilha e escores de temperamento são categóricos. O modelo de limiar supõe uma variável latente contínua (liability) que só é observada pela categoria em que cai (Gianola e Foulley 1983, citado em [Cambridge](https://www.cambridge.org/core/journals/proceedings-of-the-british-society-of-animal-science/article/abs/estimation-of-calving-difficulty-covariance-components-of-iranian-holstein-heifers-using-a-sirematernal-grandsire-threshold-model/8963B1691AD1417CFE6380AA7EDB5EFE)). A forma é **[não verificado na fonte]**:

```
l = X b + Z a + e,   e ~ N(0, 1)   (variância residual fixada em 1 no probit)
y_i = k  se  τ(k−1) < l_i ≤ τ(k)          P(y_i = 1) = Φ(x_i'b + z_i'a − τ)
h² latente = σ²a / (σ²a + 1)
h² na escala observada (Dempster e Lerner):  h²obs = h²lat · z² / [p(1 − p)]
   p = proporção de sucesso ; z = densidade normal no limiar
```

A solução usa Gibbs (por exemplo, `thrgibbs` na família BLUPF90) ou MME não lineares iteradas. A mudança de escala explica boa parte da dispersão da literatura. Com h² latente de 0,50, a h² observada cai para **0,318 quando a prenhez é de 50%** e para **0,288 quando é de 30%** (cálculo deste relatório, fórmula **[não verificado]**). Isso ajuda a entender por que a prenhez de novilhas Nelore aos 14 meses tem h² de 0,57 pelo Método R ([Eler et al. 2002](https://pubmed.ncbi.nlm.nih.gov/12002332/)) e de 0,18 por limiar univariado em outro conjunto ([Animal 2024](https://www.sciencedirect.com/science/article/abs/pii/S1871141324001884)). O ambiente também pesa: a h² da prenhez cai de 0,17 com índice de temperatura e umidade de 82,5 para 0,01 com 88 ([Animal 2018](https://www.sciencedirect.com/science/article/abs/pii/S1871141318305778)). A correlação genética entre prenhez precoce e idade ao primeiro parto é de cerca de −0,85 (atribuição a confirmar, [CorrDB](https://www.animalgenome.org/CorrDB/references/25023297.pdf)), de modo que as duas medem quase a mesma coisa.

Para facilidade de parto, o modelo pai–avô materno (sire-MGS) separa o efeito direto do touro do efeito materno vindo pelo avô materno; o USDA o adotou em leite em 2003 ([USDA-AIPL](https://aipl.arsusda.gov/publish/jds/2003/abs86_1845.html)). Em 39.664 novilhas Nelore da ANCP, a h² direta ficou entre 0,11 e 0,24 e a materna entre 0,09 e 0,11, conforme o modelo ([PubMed 40035329](https://pubmed.ncbi.nlm.nih.gov/40035329/)). Um estudo que fixou a covariância direta-materna em zero obteve h²m = 0,39 ([Animal 2020](https://sciencedirect.com/science/article/abs/pii/S1871141320302249?via=ihub%3D)), o que mostra como a estrutura imposta infla o componente materno. No temperamento de Nelore, os modelos linear e de limiar deram h² de 0,21 e 0,26 e valores genéticos com correlação acima de 0,92 ([Lucena et al. 2015](https://doaj.org/article/8a3427b23f8846989d53122c7ea7e792)): para ranquear, o modelo linear quase basta.

### Permanência e longevidade: limiar binário ou modelo de sobrevivência

A ANCP define a STAY como a probabilidade de a fêmea permanecer no rebanho até 76 meses com pelo menos três partos (resumo de busca de [ANCP, Características avaliadas](https://www.ancp.org.br/programas/conceitos-basicos/caracteristicas-avaliadas/)). Tratada como binária, a STAY entra num modelo de limiar como o anterior. Em Nelore, a h² foi de 0,117 (STAY5), 0,122 (STAY6) e 0,171 (STAY7) ([Livestock Production Science](https://www.sciencedirect.com/science/article/abs/pii/S0301622602001495)); em duas populações americanas, Snelling et al. (1995) obtiveram 0,11 e 0,14 para S(5|1) com modelos mistos não lineares ([USDA-ARS](https://ars.usda.gov/arsuserfiles/30300000/Publications/JAS73-993-1001Snelling.pdf)). A alternativa é modelar o tempo até o descarte, aproveitando vacas ainda vivas como registros censurados, com um modelo de riscos proporcionais de Weibull **[não verificado na fonte]**:

```
h(t | x, u) = h₀(t) · exp(x'β + z'u),    h₀(t) = λ ρ (λ t)^(ρ − 1)
u ~ N(0, A σ²u)  (fragilidade genética) ; vaca viva entra com o tempo até a última observação (censura)
```

O programa Survival Kit implementa esses modelos com efeitos aleatórios correlacionados ([AGRIS](https://agris.fao.org/search/fr/records/669e83b900eb85b7d72c0ca4)). A escala volta a importar: para idade à primeira concepção em Nelore, um modelo Weibull deu h² de 0,51 na escala logarítmica e de 0,76 na original ([Pereira 2006, JABG](https://onlinelibrary.wiley.com/doi/10.1111/j.1439-0388.2006.00567.x)).

### Pesagens seriadas: regressão aleatória e curvas de crescimento

A regressão aleatória (RR) modela a trajetória genética de cada animal como uma função contínua da idade, em vez de tratar cada peso-padrão como característica separada **[não verificado na fonte; conferido numericamente]**:

```
y_ij = F_ij b + Σk φk(t_ij) βk + Σk φk(t_ij) a_ik + Σk φk(t_ij) p_ik + e_ij
φk = polinômios de Legendre normalizados, com idade padronizada em x ∈ [−1, 1]
var(coeficientes genéticos) = K_a ⊗ A ;  var(p) = K_p ⊗ I
variância genética na idade t:  σ²a(t) = φ(t)' K_a φ(t)
EBV na idade t: φ(t)' â_i           DEP de ganho entre t₁ e t₂: [φ(t₂) − φ(t₁)]' â_i / 2
```

No exemplo, com idades de 100 a 550 dias, Legendre de ordem 2 (três coeficientes), K_a = [300 90 10; 90 60 5; 10 5 8] e coeficientes de um animal â = (4,0; 1,5; 0,2), a variância genética e a DEP mudam com a idade. O animal tem DEP de 0,70 kg aos 120 dias, 0,93 kg aos 210, 1,51 kg aos 365 e 1,92 kg aos 450 dias, com DEP de ganho de 0,99 kg entre 210 e 450 dias:

| Idade (dias) | φ(t) | σ²a(t) | DEP do animal (kg) |
|---|---|---|---|
| 120 | (0,707; −1,116; 1,178) | 97,3 | 0,70 |
| 210 | (0,707; −0,626; −0,171) | 92,7 | 0,93 |
| 365 | (0,707; 0,218; −0,716) | 173,0 | 1,51 |
| 450 | (0,707; 0,680; −0,059) | 263,2 | 1,92 |

A correlação genética implícita entre 210 e 450 dias é de 0,81. Em Nelore, com 87.712 pesagens de 8.144 fêmeas, Boligon et al. (2011) usaram ordens 4 (direto), 6 (ambiente permanente) e 3 (materno) e obtiveram valores genéticos mais acurados que os do modelo multicaracterística ([PubMed 21732287](https://pubmed.ncbi.nlm.nih.gov/21732287)). No Pantanal, os autores alertam que os polinômios de Legendre se comportam mal nas idades extremas ([Animals 2024](https://www.mdpi.com/2306-7381/11/7/318)). As curvas não lineares, como Brody W(t) = A(1 − Be^(−Kt)), Gompertz e von Bertalanffy, descrevem o animal por peso adulto (A) e taxa de maturidade (K). A Brody teve o melhor ajuste em Nelore ([PMC9817709](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9817709/)), e em Nelore Mocho a h² foi de cerca de 0,11 para A e 0,30 para K ([ResearchGate](https://www.researchgate.net/publication/360854328_Fit_and_genetic_parameters_of_the_growth_curve_of_Polled_Nellore_cattle)).

### Eficiência, carcaça, cruzamentos: o que muda no modelo

O consumo alimentar residual (RFI) é o resíduo, dentro do GC, da regressão do consumo de matéria seca sobre o ganho médio diário e o peso metabólico, CMS = β₀ + β₁·GMD + β₂·PM^0,75 + RFI ([Sainz et al. 2024, JBG](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12870)). O RFI entra depois num modelo animal comum. Em Angus australiano, sua correlação genética com o ganho é próxima de zero ([ResearchGate](https://www.researchgate.net/publication/327026824_Genetic_and_phenotypic_associations_of_feed_efficiency_with_growth_and_carcass_traits_in_Australian_Angus_cattle)), o que permite selecionar eficiência sem frear o crescimento. As medidas de carcaça por ultrassom usam o modelo animal com idade ou peso ao escaneamento como covariável. Em Nelore com medidas repetidas, a h² da AOL foi de 0,33 a 0,46 ([PubMed 22179966](https://pubmed.ncbi.nlm.nih.gov/22179966)). Em compostos como o Montana Tropical, que tem por pedigree 20,8% de zebu, 50,5% de taurino adaptado, 21,1% de britânico e 7,6% de continental ([PMC12887133](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887133/)), o modelo acrescenta covariáveis de composição racial, heterozigose e recombinação, y = Xb + Za + Σ c_k·f_k + δH + e **[não verificado]**. Modelos que incluem essas fontes deram componentes de variância "mais robustos" ([Genes 2026](https://doi.org/10.3390/genes17020173)).

A tabela reúne as herdabilidades mais citadas nas notas. As faixas misturam escalas e modelos, então servem como ordem de grandeza e como valores iniciais, não como constantes.

| Característica | Nelore/zebu | Taurinos | Fontes principais |
|---|---|---|---|
| Peso à desmama, direto | 0,13–0,34 | 0,14–0,20 | [Animal 2021](https://www.sciencedirect.com/science/article/abs/pii/S1871141321000081); [academia.edu, Norte do Brasil](https://www.academia.edu/146738725/Genetic_parameters_and_trends_of_growth_traits_in_Nelore_cattle_raised_in_the_Northern_region_of_Brazil) |
| Peso à desmama, materno | 0,07–0,11 | 0,04–0,18 | [Animal 2021](https://www.sciencedirect.com/science/article/abs/pii/S1871141321000081); [Kansas State](https://newprairiepress.org/kaesrr/vol0/iss1/639/) |
| Pesos de 365 a 550 dias | 0,41–0,51 | 0,24–0,25 | [PMC13469195](https://pmc.ncbi.nlm.nih.gov/articles/PMC13469195/) (atribuição a confirmar) |
| Facilidade de parto direta / materna | 0,11–0,27 / 0,09–0,39 | 0,07–0,21 / 0,20–0,27 | [PubMed 40035329](https://pubmed.ncbi.nlm.nih.gov/40035329/); [PubMed 3989079](https://pubmed.ncbi.nlm.nih.gov/3989079/) (atribuição a confirmar) |
| Prenhez de novilha | 0,18–0,57 | não localizado | [Eler 2002](https://pubmed.ncbi.nlm.nih.gov/12002332/) |
| Permanência (STAY) | 0,12–0,17 | 0,09–0,17 | [LPS](https://www.sciencedirect.com/science/article/abs/pii/S0301622602001495) |
| Perímetro escrotal | 0,29 a >0,40 | não localizado | [PubMed 32087916](https://pubmed.ncbi.nlm.nih.gov/32087916/); [Oliveira et al. 2018](https://www.publish.csiro.au/an/AN16712) |
| Idade ao primeiro parto | 0,08–0,15 | não localizado | [Oliveira et al. 2018](https://www.publish.csiro.au/an/AN16712) |
| AOL / gordura subcutânea | 0,33–0,46 / 0,20–0,51 | 0,32 / 0,33–0,34 | [PubMed 22179966](https://pubmed.ncbi.nlm.nih.gov/22179966); [SASAS](https://www.sasas.co.za/?p=4581) |
| RFI | 0,18 | 0,26–0,43 | [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0164390) (atribuição a confirmar) |
| Temperamento | 0,15–0,35 | não localizado | [Lucena 2015](https://doaj.org/article/8a3427b23f8846989d53122c7ea7e792); [UNESP](https://acervodigital.unesp.br/handle/11449/92569) (atribuição a confirmar) |

A meta-análise de Oliveira et al. (2018), com 197 herdabilidades de 62 publicações de Nelore, resume o padrão: h² direta de 0,20 a 0,40 para a maior parte das características, inclusive carcaça; cerca de 0,15 para idade ao primeiro parto; acima de 0,40 para perímetro escrotal e peso aos 450 dias; e h² materna de crescimento entre 0,06 e 0,11 ([Animal Production Science](https://www.publish.csiro.au/an/AN16712)).

## A genômica entra trocando a matriz de parentesco

### GBLUP e SNP-BLUP são o mesmo modelo

Com genótipos de SNPs, o parentesco esperado pelo pedigree é substituído pelo parentesco realizado. A forma de VanRaden (2008) **[não verificado no artigo original; equivalência conferida numericamente]** é:

```
M   matriz n×m de genótipos (0, 1, 2 cópias do alelo contado) ;  p_j = frequência do alelo
Z = M − 2p'   (centrado por coluna)
G = Z Z' / [2 Σj p_j (1 − p_j)]

GBLUP:     y = Xb + Wg + e,  var(g) = G σ²a        → MME com G⁻¹ no lugar de A⁻¹
SNP-BLUP:  y = Xb + WZα + e, var(α) = I σ²α,  σ²α = σ²a / [2 Σ p(1 − p)]    → ĝ = Zα̂
```

Nos quatro genotipados com registro do exemplo (animais 4 a 7), as duas formas deram os mesmos valores genômicos (+1,78; −1,90; +1,25; −1,84), com diferença de 2 × 10⁻¹⁵ **[conferido numericamente]**. Isso explica a escolha computacional: GBLUP resolve uma equação por animal genotipado, e SNP-BLUP, uma por marcador. A acurácia, porém, depende de como a variância é distribuída entre marcadores. Na simulação de Meuwissen, Hayes e Goddard (2001), a acurácia em descendentes foi de **0,73 com variância igual por segmento (BLUP) e de 0,85 com variância específica por segmento** ([Univ. de Edimburgo](https://www.research.ed.ac.uk/en/publications/prediction-of-total-genetic-value-using-genome-wide-dense-marker-/)).

### Métodos bayesianos: quando vale pagar o custo

Os métodos bayesianos dão a cada marcador uma variância própria **[não verificado quanto às formas]**. O BayesA usa uma priori t; o BayesB é uma mistura em que a maioria dos marcadores tem efeito zero; o BayesCπ estima a proporção π de marcadores nulos ([Habier et al. 2011](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-12-186)); o BayesR usa uma mistura de normais com um componente de variância zero. Em Jersey, com referência multirracial, o BayesR elevou a acurácia de 0,43 para 0,52 ([Erbe et al. 2012](https://www.journalofdairyscience.org/article/S0022-0302(12)00391-8/pdf)), mas o custo é alto, e a versão emBayesR é até 8 vezes mais rápida com acurácia cerca de 0,5% menor ([PubMed 25926276](https://pubmed.ncbi.nlm.nih.gov/25926276)). As notas não encontraram vantagem consistente dos métodos bayesianos em predição dentro de raça com N muito grande em corte. Em Nelore, a ponderação de SNPs (ssGBLUP ponderado) trouxe ganhos limitados para AOL ([Silva Neto et al. 2023](https://onlinelibrary.wiley.com/doi/abs/10.1111/age.13310)) e não melhorou a acurácia de lucratividade ([PMC12887148](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887148/)). Na American Hereford Association, o BOLT permite que alguns marcadores tenham efeitos maiores ([UNL](https://newsroom.unl.edu/announce/beef/7498/43074)).

### ssGBLUP: um só sistema para genotipados e não genotipados

O multi-step antigo usava DEPs "deregressadas" como pseudofenótipos (Garrick, Taylor e Fernando 2009, [GSE](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-41-55)), com resultados mistos: foi o pior método num estudo de leite ([ResearchGate](https://www.researchgate.net/publication/323417802_Comparing_deregression_methods_for_genomic_prediction_of_test-day_traits_in_dairy_cattle)) e deu confiabilidades de 18% a 39% maiores que os EBVs em suínos ([PubMed 22070746](https://pubmed.ncbi.nlm.nih.gov/22070746/), atribuição a confirmar). O single-step substituiu esse caminho: põe na mesma matriz H o pedigree de todos e o genoma dos genotipados, e H⁻¹ tem forma esparsa simples (Aguilar et al. 2010, descrito em [revisão JDS 2022](https://www.journalofdairyscience.org/article/S0022-0302(22)00752-4/fulltext)) **[forma conferida numericamente]**:

```
H⁻¹ = A⁻¹ + [ 0        0          ]
            [ 0   G_w⁻¹ − A₂₂⁻¹   ]       (bloco inferior = animais genotipados)

H (forma explícita):
H₁₁ = A₁₁ + A₁₂A₂₂⁻¹(G_w − A₂₂)A₂₂⁻¹A₂₁ ;  H₁₂ = A₁₂A₂₂⁻¹G_w ;  H₂₂ = G_w

ajustes usuais [não verificado]:  G* = α + βG  (iguala médias de G e A₂₂) ;  G_w = 0,95 G* + 0,05 A₂₂
```

O passo a passo do exemplo genotipa os animais 1, 4, 5, 6 e 7 em 31 SNPs polimórficos:

```
animal 1: 1112211011110212210111202111201
animal 4: 1112111000010112111122202110110
animal 5: 0111211112101111201100111121200
animal 6: 1002111011111101211111101121100
animal 7: 0202112001101101201112112110100
```

O primeiro passo calcula p por SNP e monta G. Como p veio dos próprios genotipados, G tem média geral 0 e é singular (posto 4 para 5 animais), enquanto A₂₂ tem média 0,57, porque esses animais são parentes. Essa incompatibilidade de escala é o problema que o ajuste de G a A₂₂ e os metafounders resolvem ([Legarra et al. 2015, DOI 10.1534/genetics.115.177014](https://doi.org/10.1534/genetics.115.177014)). O segundo passo ajusta G* = 0,57 + 0,83·G para igualar médias da diagonal e do total às de A₂₂. O terceiro mistura G_w = 0,95G* + 0,05A₂₂, o que torna a matriz inversível. O quarto monta H⁻¹ pela fórmula esparsa. Ela coincide com a inversa da H explícita, com diferença de 1 × 10⁻¹⁵. O quinto resolve as mesmas MME do Passo 2 com λH⁻¹ no lugar de λA⁻¹. O genoma revela a amostragem mendeliana: os meios-irmãos 4 e 5, com parentesco esperado de 0,25, têm parentesco realizado de 0,15.

| Animal | EBV BLUP | EBV ssGBLUP | r BLUP | r ssGBLUP |
|---|---|---|---|---|
| 1 | 1,15 | 1,02 | 0,107 | 0,084 |
| 2 | 1,03 | 0,72 | 0,183 | 0,218 |
| 3 | −0,50 | −0,76 | 0,254 | 0,313 |
| 4 | 2,12 | 1,58 | 0,281 | 0,324 |
| 5 | 0,45 | −0,29 | 0,322 | 0,366 |
| 6 | 3,59 | 2,63 | 0,304 | 0,260 |
| 7 | 0,19 | 0,07 | 0,291 | 0,284 |
| 8 | −1,46 | −1,77 | 0,326 | 0,352 |

O exemplo mostra a mecânica, não o ganho. Com 31 SNPs, G é quase só ruído, e a acurácia de alguns animais até cai. Os painéis reais têm de cerca de 30 mil (ZL5, usado pela ANCP) a 777 mil SNPs (BovineHD) ([Seminário ANCP 2018](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil)), e o Angus GS usa 40 mil ([Angus GS FAQ](https://www.angus.org/pub/adv/AngusGS-FAQ.pdf)). O ssGBLUP também gera, como subproduto, o ssGWAS: efeitos de SNP retrocalculados e testados em janelas, por exemplo de 20 SNPs ([GSE 2019, Angus](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-019-0469-3)).

### APY: como inverter G com um milhão de genotipados

Inverter G custa o cubo do número de genotipados. O APY divide os genotipados em núcleo (c) e não núcleo (n) e supõe que os não núcleo dependem só do núcleo **[forma não extraída pelas notas; conferida numericamente nos casos abaixo]**:

```
G_APY⁻¹ = [ G_cc⁻¹  0 ]  +  [ −G_cc⁻¹ G_cn ] M_nn⁻¹ [ −G_nc G_cc⁻¹   I ]
          [ 0       0 ]     [       I      ]
M_nn = diag{ g_ii − g_ic G_cc⁻¹ g_ci }      (custo: inverter só G_cc e uma diagonal)
```

Com um só animal fora do núcleo, a fórmula reproduz a inversa exata (diferença de 3 × 10⁻¹⁶). Com núcleo de 2 e 3 animais fora, a diferença chega a 0,745, porque um núcleo minúsculo não captura a dimensão de G. Daí a regra prática: o núcleo deve ter tantos animais quanto os autovalores que explicam cerca de 98% da variância de G, o que dá **cerca de 13 mil animais em bovinos de corte**, e núcleos maiores elevam o custo sem ganho de acurácia ([PMC5088690](https://pmc.ncbi.nlm.nih.gov/articles/PMC5088690/); [PMC7739885](https://pmc.ncbi.nlm.nih.gov/articles/PMC7739885)). Foi com ssGBLUP que a Angus americana analisou mais de 6 milhões de registros ([Lourenco et al. 2015](https://pubmed.ncbi.nlm.nih.gov/26115253)).

### Validação e tamanho da população de referência

O método LR (Legarra e Reverter 2018) compara predições feitas com dados parciais e completos para estimar viés, dispersão e acurácia ([GSE](https://link.springer.com/content/pdf/10.1186/s12711-018-0426-6.pdf)). Numa aplicação em Holandês tailandês, o viés e a dispersão foram de 0,44 e 0,84 no BLUP e de −0,04 e 1,06 no ssGBLUP ([PMC8829417](https://pmc.ncbi.nlm.nih.gov/articles/PMC8829417/)). O método supõe modelo correto, e uma revisão de 2024 diz que ele não se aplica a regressão aleatória e a efeitos maternos ([Frontiers 2024](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2024.1380643/full)).

O tamanho da referência explica por que uma fazenda não monta sozinha uma predição genômica. A aproximação de Daetwyler et al. (2008), r = √[h²N/(h²N + M_e)] ([registro](https://www.research.ed.ac.uk/en/publications/accuracy-of-predicting-the-genetic-risk-of-disease-using-a-genome/)), foi lida pelas notas num fragmento ilegível **[não verificado]**. Com h² = 0,30 e um número efetivo de segmentos M_e = 5.000 (valor ilustrativo), seriam precisos **cerca de 5.600 animais com fenótipo e genótipo para r = 0,50 e 16 mil para r = 0,70**. Os resultados brasileiros publicados vão na mesma direção. A ANCP obteve acurácias perto de 0,4 para IPP e MP120 na validação de 2018 ([Seminário 2018](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil)). Em rebanhos comerciais, a acurácia de IPP subiu de cerca de 0,28 com dados só comerciais para cerca de 0,41 com animais registrados na referência ([Seminário 2019](https://www.slideshare.net/slideshow/seminrio-ancp-2019-avaliao-genmica-em-rebanhos-comerciais-avanos-lies-e-oportunidades/145292320)). Em Nelore, o ssGBLUP elevou a acurácia de marmoreio de 0,09 para 0,63 ([Silva Neto et al. 2023](https://onlinelibrary.wiley.com/doi/abs/10.1111/age.13310)). Na Conexão Delta G, a acurácia de touros jovens sem progênie subiu de cerca de 50% para cerca de 70% com genômica ([CompreRural](https://www.comprerural.com/conexao-delta-g-amplia-acuracia-de-animais-em-catalogo)). Nos EUA, um painel genômico equivale a 25 ou mais progênies para peso à desmama segundo a American Salers ([ASA](https://www.salersusa.org/tools-and-resources/national-cattle-evaluation/genomically-enhanced-epds/)) e a 27 segundo a Penn State ([Penn State](https://extension.psu.edu/understanding-epds-and-genomic-testing-in-beef-cattle)).

## Tendência, resposta e índices transformam DEPs em decisão

### Tendência genética: regressão da DEP média no ano de nascimento

A tendência genética é a inclinação da média das DEPs (ou EBVs) por ano de nascimento. A tendência fenotípica é a inclinação da média dos registros por safra, e a diferença entre elas estima a tendência de ambiente e manejo **[não verificado como método publicado; as notas não encontraram o procedimento das associações]**. Num rebanho fictício com DEP média de PD210 de 1,8; 2,3; 2,9; 3,2; 3,9 e 4,4 kg para as safras de 2020 a 2025, e P205 médio de 196, 199, 195, 203, 206 e 204 kg, as regressões dão:

| Tendência | Cálculo | Resultado |
|---|---|---|
| Genética (DEP) | inclinação da DEP média | 0,517 kg/ano |
| Genética (valor genético) | 2 × 0,517 | 1,03 kg/ano |
| Fenotípica | inclinação do P205 médio | 1,97 kg/ano |
| Ambiental | 1,97 − 1,03 | 0,94 kg/ano |

O resultado separa o que veio da genética do que veio de pasto, sanidade e manejo. Ele só vale se as DEPs vierem de uma avaliação com o rebanho bem conectado; com DEPs de baixa acurácia, a inclinação é ruído.

### Resposta à seleção: a equação do criador

O ganho genético anual segue **ΔG = r·σg·i/L** ([Missouri Extension G02013](https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/ansci/g02013.pdf)), em que L é a idade média dos pais ao nascimento da progênie ([extension.org](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/)). No exemplo de Missouri, com 2,8 lb/ano de ganho, σg = 26,3 lb e L = 5 anos, o produto r·i vale 2,8 × 5/26,3 = 0,53. Machos e fêmeas têm acurácias, intensidades e intervalos diferentes, e a forma em duas vias soma as contribuições, ΔG = (r_m·i_m + r_f·i_f)·σa/(L_m + L_f) **[não verificado; forma de Rendel e Robertson]**, com i = φ(z)/p para seleção por truncamento. Um cenário ilustrativo considera touros jovens com DEP genômica (r = 0,70), comprados entre os 10% melhores (i = 1,755) e com L = 3,5 anos, e novilhas escolhidas pelo próprio peso (r = √0,25 = 0,50), retendo 70% (i = 0,497) com L = 6 anos. Com σa = 10 kg, o ganho é de **1,56 kg/ano** de valor genético. Trocando os touros por touros escolhidos por fenótipo (r = 0,40, L = 5), o ganho cai para **0,86 kg/ano**. O touro responde pela maior parte do progresso, e é nele que acurácia e intensidade valem mais.

### Índice de seleção: Smith-Hazel e a soma ponderada de DEPs

Hazel (1943) mostrou que um índice com pesos adequados supera a seleção por uma característica de cada vez ([Genetics, PMC1209225](https://pmc.ncbi.nlm.nih.gov/articles/PMC1209225)). O objetivo é H = v'a, a soma dos valores genéticos ponderados pelos valores econômicos v, e o índice é I = b'x **[não verificado na fonte primária]**:

```
b = P⁻¹ G v          P = var(fenótipos) ;  G = cov(fenótipos, valores genéticos) ;  v = R$ por unidade
r_IH = √( b'P b / v'G v )         resposta no objetivo = i · √(b'Pb)
resposta por característica = i · G b / √(b'Pb)
com DEPs/EBVs multicaracterística do mesmo conjunto de características: I = Σ v_k · EBV_k (ou 2·Σ v_k · DEP_k)
```

Com as variâncias do exemplo bicaracterística (P = [400 205; 205 625], G = [100 105; 105 225]) e v = (R$ 2/kg de PD; R$ 4/kg de PS), valores hipotéticos, os pesos ótimos sobre os fenótipos próprios são **b = (0,77; 1,52)** e a acurácia do índice é **r_IH = 0,62**. Por desvio-padrão de seleção, a resposta é de 5,1 kg em PD, 9,1 kg em PS e R$ 46,6 no objetivo.

Nos sumários, o índice é aplicado a DEPs já calculadas, como soma ponderada; é assim no $Index da BREEDPLAN ([UNE](https://breedplan.une.edu.au/media/dtqpdm34/using-and-understanding-breedplan-ebvs.pdf)), cujos pesos vêm do BreedObject a partir de custos e receitas ([MLA](https://mbfp.mla.com.au/cattle-genetics/1-use-breedobject/)). O exemplo de dois touros usa valores econômicos hipotéticos por unidade de DEP: R$ 10/kg de PD210, R$ 6/kg de PS450, −R$ 40 por mês de IPP, R$ 15 por ponto de STAY, R$ 8/cm de PE365 e R$ 5/cm² de AOL.

| DEP | Touro A | Touro B | Valor (R$/unidade) | Contribuição A | Contribuição B |
|---|---|---|---|---|---|
| PD210 (kg) | +12,0 | +6,0 | 10 | 120,0 | 60,0 |
| PS450 (kg) | +20,0 | +10,0 | 6 | 120,0 | 60,0 |
| IPP (meses) | +0,5 | −1,2 | −40 | −20,0 | 48,0 |
| STAY (%) | −2,0 | +4,0 | 15 | −30,0 | 60,0 |
| PE365 (cm) | +0,8 | +1,2 | 8 | 6,4 | 9,6 |
| AOL (cm²) | +1,5 | +2,0 | 5 | 7,5 | 10,0 |
| **Índice econômico** | | | | **203,9** | **247,6** |

O touro B vence o índice de ciclo completo pela fertilidade, embora cresça menos. Num índice terminal, só com PD, PS e AOL, a ordem se inverte (A = 247,5; B = 130,0), o que ilustra o alerta de que um índice terminal pode trabalhar contra quem produz as próprias matrizes ([UNL](https://beef.unl.edu/sites/unl.edu.ianr.beef/files/media/file/Economic%20Indexes%20for%20Beef%20Sire%20Selectiong1847.pdf)). A acurácia muda a leitura. Supondo que A é provado (r = 0,90), que B é jovem (r = 0,45), que os desvios-padrão genéticos das DEPs são hipotéticos e que os erros entre DEPs são independentes, o desvio-padrão do erro do índice é de R$ 47,5 para A e de R$ 97,4 para B. A diferença de R$ 43,7 a favor de B dá só **66% de probabilidade de B ser de fato melhor**. Na versão de pesos percentuais sobre DEPs padronizadas pelo desvio-padrão genético, como no MGTe ([Seminário ANCP 2016](https://www.slideshare.net/slideshow/04-fernando-seminario/62118028), atribuição a confirmar), B também vence (1,12 contra 0,87, com pesos percentuais hipotéticos de 15% PD210, 20% PS450, 15% IPP, 30% STAY, 10% PE365 e 10% AOL). Pesos percentuais sobre DEPs brutas, como no IQG (DEP × grau de importância), dependem das unidades de cada DEP e não equivalem a pesos econômicos.

## Os programas de N muito grande convergiram para o single-step

Todos os grandes programas partem do mesmo núcleo, o modelo animal BLUP com GCs fixos, e quase todos já trocaram A⁻¹ por H⁻¹. A tabela resume o que as notas confirmaram, com as divergências entre fontes.

| Programa | Escopo e escala | Modelo e genômica | Índices e publicação |
|---|---|---|---|
| ANCP, Programa Nelore Brasil | Nelore, Guzerá, Brahman e Tabapuã; cerca de 1,7 milhão de animais no parentesco e 559 rebanhos em 2011 ([Cultivar](https://revistacultivar.com.br/noticias/sumario-de-touros-da-ancp-analisa-mais-de-1-7-milhao-de-animais)) | Modelo animal direto-materno desde 1993; marcadores desde 2011; DEP genômica em 2014 (outra página diz 2011); ssGBLUP em todas as DEPs genômicas desde 2019 ([ANCP, História](https://www.ancp.org.br/ancp/historia/)) | 33 características e MGTe desde 2016, com variantes de cria e recria; sumários em maio de 2020, maio de 2021 e agosto de 2025 ([ANCP](https://www.ancp.org.br/sumariosancp/)) |
| ABCZ, PMGZ | Todas as raças zebuínas, cerca de 3.400 rebanhos, CDP desde 1968 ([ABCZ](https://www.abcz.org.br/pmgz/apresentacao)); 14 a 16,3 milhões de animais na avaliação conjunta com a Embrapa ([CompreRural](https://comprerural.com/sumario-de-touros-abcz-embrapa-e-lancado-com-dados-de-avaliacao-genomica/); [Contexto Ganadero](https://www.contextoganadero.com/ganaderia-sostenible/brasil-cuenta-con-el-fenotipo-de-20-millones-de-animales-de-raza-cebu), atribuição a confirmar) | Avaliação semestral, baseada no CDP ([Regulamento](https://www.abcz.org.br/common/uploads/secao/a66183db97120042234f2b57a42cdb7a.pdf)); sumário genômico conjunto com a Embrapa; modelo e software não localizados | iABCZ revisto em 2024; DECA; CSG |
| Embrapa-Geneplus | Cerca de 600 fazendas em 2026 ([Canal Rural](https://www.canalrural.com.br/pecuaria/geneplus-celebra-30-anos-na-expogenetica-2026-com-foco-em-avanco-genetico-da-pecuaria)); app com 336 rebanhos e cerca de 2,3 milhões de animais ([Embrapa](https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/4275/app-sumario-nelore---aplicativo-movel-do-sumario-de-touros-nelore-do-programa-embrapa-geneplus-)) | IQG e IQGg (genômico); provas PAD e ATJ com consumo individual; DEPs de Senepol desde 2010; modelo não localizado | IQG com classes por percentil |
| CRV PAINT; GenSys (Conexão Delta G, Aliança Nelore) | PAINT consolida sumários de Nelore; cerca de 35 mil reprodutores em 2010 ([Agrolink](https://www.agrolink.com.br/noticias/sumario-paint-2010-e-lancado-com-a-avaliacao-de-35-mil-reprodutores_117245.html)); Delta G com 294 touros Hereford e Braford, 27 características e mais de 15 mil genotipados ([CompreRural](https://comprerural.com/sumario-da-conexao-delta-g-reune-294-touros-avaliados-em-27-caracteristicas/)) | PAINT: DEPs relativas a uma média genética móvel ([Cultivar](https://www.revistacultivar.com.br/noticias/crv-lagoa-lanca-a-edicao-2009-do-sumario-paint-consolidado)); Delta G: todas as DEPs genômicas desde 2020 | IPAINT, HGP, IDesm; Delta G com quatro índices |
| PampaPlus, Promebo, Senepol, Montana | Hereford e Braford (ABHB, desde 2008); Senepol com 69.299 animais e 82.100 no parentesco em 2016 ([Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1066876/1/Suma769rioSenepol2016.pdf)) | DEPs de ultrassom; Senepol com DEPs genômicas; Montana comparou três modelos BLUPF90 com rankings muito parecidos ([USP](https://teses.usp.br/teses/disponiveis/74/74131/tde-02032023-104048/?lang=en)) | Montana: entrada com CEIP ou percentil mínimo ([MAPA](https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/registro-genealogico/CritriosAZMontana1.pdf)) |
| American Angus (AGI) | Até 1,8 milhão de animais genotipados no verão de 2025 ([Angus](https://cd.angus.org/-/media/acf83a7d2ec2470fa91fb62142c948ae.ashx)) | Single-step semanal para todas as EPDs e $Values desde 7 de julho de 2017 ([Angus](https://www.angus.org/pub/newsroom/releases/062717-single-step.html)) | $M, $W, $F, $G, $B, $C; premissas da CattleFax com média móvel de 7 anos ([Angus Journal 2025](https://www.angus.org/angus-media/angus-journal/2025/07/by-the-numbers)) |
| American Hereford (AHA) | GE-EPDs há 10 anos em 2022 ([Hereford](https://hereford.org/ge-epds-a-10-year-milestone/)) | Single-step no BOLT desde dezembro de 2017, com acurácias estimadas diretamente ([Hereford](https://hereford.org/american-hereford-association-releases-bolt-genetic-evaluation/)) | Índices não pesquisados |
| IGS (Simmental, Red Angus e parceiros) | De 13 a 20 associações e de 19 a mais de 22 milhões de animais, segundo a fonte ([Simmental](https://simmental.org/site/index.php/simmental-cattle-breeder-resource/igs-multi-breed-genetic-evaluation)) | Avaliação multirracial com EPDs comparáveis entre raças; plano de single-step semanal no BOLT ([Canadian Cattlemen](https://www.canadiancattlemen.ca/tag/simmental/feed/)) | Subíndice $Gain e EPD de consumo em fase de pesquisa |
| BREEDPLAN (ABRI/AGBU) | Mais de 15 milhões de animais e mais de 1 milhão de perfis de DNA ([BREEDPLAN](https://breedplan.une.edu.au/news/)) | Single-step multicaracterística por raça: Charolais Trans-Tasman em janeiro de 2024, Murray Grey em abril de 2025, Angus europeu em maio de 2025, Limousin em julho de 2025 ([BREEDPLAN](https://breedplan.une.edu.au/news/single-step-breedplan-implemented-for-trans-tasman-charolais-evaluation/)) | $Index (BreedObject); EBVs de 200 e 400 dias |
| IBOVAL (França), ICBF (Irlanda), Interbeef | IBOVAL com nove raças; ICBF com mais de 15 milhões de animais ([Teagasc](https://teagasc.ie/news--events/daily-archive/icbf-breeding-for-more-sustainable-beef-production/)); Interbeef com 12 países e cinco raças ([ICBF](https://www.icbf.com/international-beef-evaluation-interbeef/)) | IBOVAL: genômica desde 2015 e single-step por raça desde janeiro de 2025 ([IDELE](https://idele.fr/detail-article/ajustement-de-variabilite-dindex-iboval-en-race-limousine-incidence-de-la-refonte-des-evaluations-genetiques)); Interbeef: modelo multicaracterística multipaís, em que cada país é uma característica ([ICAR](https://www.icar.org/interbeef-at-a-glance/)) | €uro-Star (cinco estrelas = 20% melhores); Interbeef em março e outubro |

Três conclusões saem da tabela. A primeira é que a convergência metodológica é quase completa: depois de Angus e Hereford em 2017, Austrália e França migraram entre 2024 e 2025, e a ANCP fechou a transição em 2019. A segunda é que **as DEPs não são comparáveis entre programas**, nem dentro da mesma raça, porque cada avaliação tem base, dados e escala próprias. Os fatores entre raças do USMARC existem justamente para comparar EPDs de 18 raças em escala Angus, como no exemplo de 2023 em que touros Red Angus e Hereford de EPD 90,0 e 92,0 lb passam a 65,2 e 52,7 lb ([USDA-ARS 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf); [Angus 2023](https://www.angus.org/Pub/2023-ABEPD-pressreleaseandfactsheet.pdf)). A terceira é que, no Brasil, só a ANCP documenta publicamente o método. Modelo e software do PMGZ e do Geneplus não foram localizados, e o calendário de 6 avaliações por ano da ANCP e 4 do Geneplus vem de fonte comercial **[não verificado]** ([Ponta Agro](https://pontaagro.com/programas-de-melhoramento-genetico/)).

## Indicadores e metas: o que existe de referência publicada

### DEPs e índices publicados no Brasil

A ANCP publica DEPs de peso aos 120 e 210 dias (pré-desmama) e aos 365 e 450 dias, efeitos maternos aos 120 e 210 dias (MP120, MP210), STAY, IPP e idade à puberdade de machos (IPM, valores negativos desejáveis), perímetro escrotal aos 365 e 450 dias, AOL, acabamento, marmoreio, peso de carcaça quente, porção comestível, maciez, frame e mocho ([ANCP, Características](https://www.ancp.org.br/programas/conceitos-basicos/caracteristicas-avaliadas/); [ANCP, ultrassonografia](https://www.ancp.org.br/servicos/ultrassonografia-de-carcaca/); [ANCP, frame e MGTe](https://www.ancp.org.br/wp/wp-content/uploads/2022/07/ancp_frame_mgte.pdf)). Siglas que circulam no setor, como DMP120, DIPP, D3P, DEGS e DPN, não apareceram nas fontes consultadas. Os pesos dos três índices nacionais estão na tabela; os do MGTe vêm de fontes do setor e não foram confirmados na página da ANCP.

| Índice | Composição publicada | Escala | Fonte |
|---|---|---|---|
| iABCZ (desde julho de 2024) | 30% STAY; 13% PD-ED; 13% PS-ED; 10% IPP; 8% PA-ED; 6% AOL; 5% PM-EM; 5% TMD; 5% PE365; 5% ACAB | Classes DECA (DECA 1 = 10% melhores) | [ABCZ](https://www.abcz.org.br/noticias/noticia/29326/3---encontro-nacional-de-criadores-do-pmgz-resulta-em-novas-estrategias-para-aprimoramento-do-programa-e-novo-iabcz) (atribuição a confirmar) |
| IQG / IQGg (Geneplus) | 20% TMD; 20% GPD; 15% PS; 15% PES; 10% PD; 10% AOL; 5% IPP; 5% EGS | Elite até o percentil 16; Superior de 16 a 50; Regular de 50 a 84; Inferior acima de 84 | [Geneplus, certificado CEIP](https://geneplus.com.br/certificadosCeip/download/73) |
| MGTe (ANCP) | 24% DP450; 22% DSTAY; 16% DP210; 9% precocidade; 9% DAOL; 6% IPP; 5% MP210; 3% MP120; 3% DPE365; 3% DPE450, sobre DEPs padronizadas | Bioeconômico (fazenda de ciclo completo no Brasil Central) | [Segs](https://www.segs.com.br/mais/agro/233132-alta-conquista-lideranca-do-sumario-ancp); [Zancaner](https://zancaner.com.br/site/conteudo/205583-merito-genetico-total-economico.html) (não confirmados pela ANCP) |

Os pesos somam 100 em todos os casos (verificado). A comparação entre programas exige cuidado: o iABCZ e o IQG ponderam DEPs brutas, enquanto o MGTe pondera DEPs padronizadas, de modo que pesos iguais em percentual não significam a mesma ênfase econômica.

### Metas genéticas: certificação e percentis

As metas genéticas publicadas são, na prática, cortes de percentil e de acurácia. O CSG da ABCZ vai para os 20% melhores da safra; em Nelore e Nelore Mocho, exige acurácia mínima de 20% em peso à desmama e DECA até 4 nas características do iABCZ ([Rural Pecuária](https://ruralpecuaria.com.br/tecnologia-e-manejo/bovinocultura-de-corte/abcz-certificado-especial-de-producao-e-substituido-pelo-certificado-de-superioridade-genetica.html)). Uma fonte comercial cita 30% para o CEIP, mas em outro programa ([DeltaGen](https://www.deltagen.com.br/noticia.php?noticia=0171)), e o CEIP é chancelado pelo MAPA ([eRural](https://www.erural.net/conteudo/o-que-significa-a-sigla-ceip)). O ATJ do Geneplus exige IQG até o percentil 3 e componentes positivos, abaixo do percentil 50 na convenção em que percentil menor é melhor ([Geneplus](https://geneplus.com.br/atjplus-nelore-criterios)). O Programa Montana aceita animais acima de 31 meses com avaliação no mínimo no percentil 40 em pelo menos duas de quatro características ([MAPA](https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/registro-genealogico/CritriosAZMontana1.pdf)). Para vacas, o prêmio Maternal Merit da Brahman americana exige MPPA de pelo menos 101, e o nível superior exige 105 com quatro crias desmamadas ([Brahman](https://brahman.org/genetics/genetic-merit-awards/)).

### Indicadores zootécnicos do rebanho

Os indicadores de desempenho do rebanho são razões simples, mas o denominador muda o número. As fórmulas abaixo são definições de trabalho das notas, e os valores de referência estão citados.

| Indicador | Fórmula | Referência publicada |
|---|---|---|
| Taxa de prenhez | prenhes ao diagnóstico ÷ fêmeas expostas | Nelore no Cerrado: 69% em primíparas e cerca de 90% entre a 5ª e a 8ª cria ([RBZ](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt)); EUA: 94,3% ([CHAPS](https://ndsu.edu/chaps/benchmarks)) |
| Intervalo entre partos (IEP) | média dos intervalos entre partos consecutivos | Meta da Embrapa: até 365 dias, com concepção até 90 dias pós-parto ([Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf)); observado: 392 dias em primíparas no Cerrado ([RBZ](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt)); 510 dias num rebanho do Pará ([UFRPE](https://www.journals.ufrpe.br/index.php/medicinaveterinaria/article/view/2618)) |
| Concepção na 1ª IA; aborto | concebidas ÷ inseminadas; abortos ÷ prenhes | Metas acima de 60% e abaixo de 3% ([Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf)) |
| Taxa de desmama | desmamados ÷ vacas expostas | EUA: 91,4% ([CHAPS](https://ndsu.edu/chaps/benchmarks)); meta mínima de 85% em Iowa ([Iowa Cattleman](https://lsc-pagepro.mydigitalpublication.com/article/Vet%E2%80%99s+View/4351552/762601/article.html)) |
| Mortalidade de bezerros | mortos ÷ vacas expostas ou ÷ nascidos | 3,2% e 3,4% nos EUA ([CHAPS](https://ndsu.edu/chaps/benchmarks)); metas do quartil superior no Canadá abaixo de 1% até 24 h e de 2% até a desmama ([PMC6662034](https://pmc.ncbi.nlm.nih.gov/articles/PMC6662034)) |
| Kg desmamados por vaca exposta | Σ pesos à desmama ÷ vacas expostas | 80 a 90 kg observados e metas de 200 a 210 kg no RS ([CompreRural](https://comprerural.com/criadores-do-rs-buscam-aumento-de-120-em-kg-de-terneiros-desmamados-por-vaca/), atribuição a confirmar) |
| Eficiência materna | peso do bezerro ÷ (peso da vaca)^0,75 | h² da razão bezerro/vaca de 0,31 em Nelore ([UFV](https://locus.ufv.br//handle/123456789/27156)) |
| Idade ao primeiro parto | data do 1º parto − nascimento | Cerca de 38,8 meses em 8.348 novilhas de MS ([UNESP](https://repositorio.unesp.br/handle/11449/4697), atribuição a confirmar) |
| GMD e ganho por área | (peso final − inicial) ÷ dias; GMD × dias × animais ÷ ha | Xaraés com 30 cm: 760 g/dia, 2,8 UA/ha e 1.170 kg/ha ([SEMADESC-MS](https://www.semadesc.ms.gov.br/?p=16979)) |

Exemplo de cálculo: 100 vacas expostas que desmamam 80 bezerros com P205 médio de 195 kg produzem **156 kg desmamados por vaca exposta**. Se a vaca média pesa 450 kg, a eficiência materna é 195/450^0,75 = 195/97,7 = **2,0 kg por kg metabólico**. As notas não encontraram benchmark brasileiro atual e nacional para os indicadores de cria; os números brasileiros são regionais e, em geral, de 2001 a 2012. Os benchmarks norte-americanos refletem outro sistema. Para fixar metas, a referência mais informativa é a série histórica do próprio rebanho, reportada com intervalo de confiança.

### Metas individuais: uma proposta para o acompanhamento animal a animal

Juntando os cortes publicados, este relatório propõe uma estrutura de metas por categoria **[proposta deste relatório, não norma de programa]**. Para o bezerro, a meta é a razão BIF de desmama dentro do GC, com a reposição escolhida acima de 100. Para a novilha, as metas são prenhez na primeira estação e IPP abaixo da média do rebanho, mais a DEP de IPP ou de prenhez, quando houver. Para a vaca, as metas são MPPA de pelo menos 100 a 101 (o corte da Brahman), IEP perto de 365 dias e kg desmamados por ano. Para o touro de reposição, a meta é índice no quartil ou no quintil superior do programa (os 20% do CSG), com acurácia mínima declarada, maior para touros de monta que cobrem muitas vacas. Para o rebanho, as metas são tendência genética positiva no índice escolhido e ΔF abaixo de um teto definido pela gestão.

## Rebanhos médios e grandes ganham precisão conectando-se, não isolando-se

### Estimar parâmetros dentro da fazenda é quase sempre ruído

A tentação de uma fazenda de 1.000 vacas é estimar a própria herdabilidade. A simulação deste relatório (5.000 repetições, delineamento de meios-irmãos paternos com h² verdadeira de 0,30 e estimativa por análise de variância) mostra o problema **[conferido numericamente]**:

| Touros × filhos por touro | N | Desvio-padrão da h² estimada | Estimativas negativas |
|---|---|---|---|
| 5 × 20 | 100 | 0,301 | 17,5% |
| 20 × 25 | 500 | 0,135 | 0,3% |
| 50 × 20 | 1.000 | 0,094 | 0% |
| 100 × 30 | 3.000 | 0,057 | 0% |

Com 100 registros, só 47% das estimativas caem entre 0,10 e 0,50. Além do ruído, há viés de definição: num estudo brasileiro, a h² de prenhez foi zero quando as novilhas entraram em monta aos 24 meses, 0,20 com monta antecipada aos cerca de 18 meses e 0,36 com o conjunto completo de fêmeas ([Dias et al. 2004](https://doaj.org/article/f1cb4673faee49749947a88d163094ca), atribuição a confirmar). A prática recomendada é **fixar as variâncias pela literatura** (tabela de herdabilidades acima) e testar a sensibilidade, por exemplo com h² de 0,20 a 0,35 para peso à desmama **[recomendação deste relatório]**. Isso equivale a um BLUP bayesiano com prioris informativas; um trabalho leiteiro parte justamente da premissa de que os registros de um único rebanho raramente bastam para estimar as próprias variâncias ([J Dairy Sci](https://www.sciencedirect.com/science/article/pii/S0022030293774767)).

### Ferramentas que funcionam com N pequeno: razão BIF e MPPA

A razão BIF é o registro dividido pela média do GC, vezes 100, calculada só dentro de grupos da mesma raça e de idade semelhante e depois de ajustar idade da mãe e sexo ([BIF Glossary](https://guidelines.beefimprovement.org/index.php/Glossary); [BIF, 9ª ed.](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf)). Um bezerro de 230 kg num GC com média de 210 kg tem razão de **109,5**. Se só a metade superior dos bezerros for reportada, a média sobe e a razão do melhor cai, como no exemplo do próprio BIF; por isso todos os bezerros do GC precisam ser pesados.

O MPPA (habilidade mais provável de produção) prevê o desempenho futuro de uma vaca a partir das crias que ela já desmamou, encolhendo o desvio dela em direção à média conforme o número de crias e a repetibilidade r ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa)):

```
MPPA = média do rebanho + [n·r / (1 + (n − 1)·r)] × (média da vaca − média do rebanho)
```

Uma vaca com 4 crias de média 230 kg, num rebanho de média 200 kg e com r = 0,25, tem fator 1/1,75 = 0,571 e **MPPA = 200 + 0,571 × 30 = 217,1 kg**. Em razão BIF, uma vaca com crias de razão média 115 tem MPPA de:

| Repetibilidade | 1 cria | 2 crias | 4 crias |
|---|---|---|---|
| 0,15 | 102,2 | 103,9 | 106,2 |
| 0,25 | 103,8 | 106,0 | 108,6 |
| 0,35 | 105,2 | 107,8 | 110,2 |

As notas não encontraram a repetibilidade do peso à desmama para vacas de corte. Por isso o MPPA deve ser rodado com as três hipóteses, verificando se as vacas do topo mudam. Na prática, com uma cria, nenhuma vaca de razão 115 passa do corte de 105 da Brahman com r = 0,25; com quatro crias, passa.

### BLUP intra-rebanho: útil para ranquear, limitado para comparar

Rodar o modelo animal do primeiro capítulo com o pedigree da fazenda e variâncias fixadas pela literatura é viável e ranqueia melhor que o fenótipo, porque usa parentes e corrige pelo GC. Os exemplos mostram os limites. Com GCs pequenos, a acurácia de um animal jovem fica em 0,3, abaixo do teto de √h²; em monta natural com touros próprios, sem inseminação, o rebanho tende a ficar desconectado de qualquer referência externa **[inferência das notas]**. Nesse caso, as DEPs internas servem para ordenar animais da fazenda, mas não para comparar com touros de sumário. A conectividade aumenta com o parentesco entre unidades (Kennedy e Trus 1993, citado em [Yu et al., JAS](https://academic.oup.com/jas/article/96/11/4490/5085211)). O IBOVAL usa desde 2002 o critério CACO para admitir apenas rebanhos conectados, e o CACO depende mais do tipo de serviço dos touros (IA ou monta) do que do tamanho do rebanho ([Fouilloux, Clément e Laloë 2008](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-40-2-145)). Em Nelore, a conectividade calculada só por pedigree pode estar subestimada por causa da monta múltipla ([Amorim et al. 2020](https://academic.oup.com/jas/article/98/11/skaa289/5900679)).

### Informação externa: DEPs de touros e genômica com cautela

A DEP publicada do touro funciona como informação externa de acurácia conhecida e liga o rebanho à população de referência. Os testes genômicos comerciais exigem cautela fora da população em que foram treinados. Em novilhos beef × Holandês, o teste comercial Igenity não ranqueou corretamente ganho de peso nem eficiência, e a DEP do touro previu melhor o desempenho em confinamento ([JAS 2025, DOI 10.1093/jas/skaf053](https://academic.oup.com/jas/article/doi/10.1093/jas/skaf053/8040885)). A genotipagem rende mais quando entra no ssGBLUP de um programa com referência grande, como mostrou a ANCP ao elevar a acurácia de IPP em rebanhos comerciais de 0,28 para 0,41 ([Seminário 2019](https://www.slideshare.net/slideshow/seminrio-ancp-2019-avaliao-genmica-em-rebanhos-comerciais-avanos-lies-e-oportunidades/145292320)).

### Endogamia e tamanho efetivo: o risco escondido do rebanho fechado

O tamanho efetivo de Wright, **Ne = 4·Nm·Nf/(Nm + Nf)** ([Nature Heredity 2016](https://www.nature.com/articles/hdy201643)), e o aumento de endogamia por geração, **ΔF ≈ 1/(2Ne)** ([JDS 2001](https://www.journalofdairyscience.org/article/S0022-0302(01)70213-5/pdf), atribuição a confirmar), dão a medida do risco. A taxa anual é ΔF dividido pelo intervalo de gerações, aqui suposto de 5 anos.

| Touros | Vacas | Ne | ΔF por geração | ΔF por ano (L = 5) |
|---|---|---|---|---|
| 5 | 100 | 19,0 | 2,62% | 0,52% |
| 10 | 100 | 36,4 | 1,37% | 0,27% |
| 20 | 100 | 66,7 | 0,75% | 0,15% |
| 40 | 1.000 | 153,8 | 0,33% | 0,07% |
| 80 | 2.000 | 307,7 | 0,16% | 0,03% |

A fórmula supõe acasalamento ao acaso e famílias de tamanho igual, premissas que muitas vezes falham em rebanhos de produção. Concentrar a inseminação em poucos touros reduz o Ne real abaixo dos números da tabela. Para comparação, o Ne estimado por desequilíbrio de ligação foi de 207 no Angus e de 285 no Charolês ([PMC3418579](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3418579/)). No pedigree do exemplo, um único acasalamento entre meios-irmãos já gerou F = 12,5%. As notas não encontraram benchmark de ΔF para rebanhos de corte; um teto de cerca de 1% por geração é decisão de gestão, não norma.

### Indicadores precisam de intervalo de confiança

O erro binomial de uma taxa de prenhez de 85% é de 3,6 pontos com 100 vacas (intervalo de 95% de ±7,0 pontos), de 1,6 ponto com 500 (±3,1) e de 0,8 ponto com 2.000 (±1,6). Num rebanho de 100 vacas, uma queda de 5 pontos de um ano para o outro não se distingue do acaso; com 2.000, sim. Detecção de cio visual acerta só de 55% a 60% das vacas em cio ([Embrapa, CT 97](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/888399/1/CT97.pdf)), e por isso o método de diagnóstico e de detecção deve ser registrado junto com o indicador.

### Estratégia por porte de rebanho

A tabela traduz as evidências numa recomendação por porte **[proposta deste relatório, baseada nas fontes e nos exemplos acima]**.

| Porte | Avaliação genética | Ferramentas no próprio rebanho | Genômica |
|---|---|---|---|
| 100 a 500 vacas | Inscrever o rebanho num programa nacional (ANCP, PMGZ, Geneplus) ou comprar touros por índice e acurácia; usar IA para conectar | Razão BIF, MPPA com três repetibilidades, indicadores com intervalo de confiança, controle de F | Só via programa, priorizando touros de reposição |
| 500 a 2.000 vacas | O mesmo, com GCs grandes e IA estruturada (vários touros por GC, touros de referência repetidos entre safras) | BLUP intra-rebanho com variâncias da literatura, para ranking interno, e tendência genética dentro do programa | Novilhas e touros de reposição genotipados no ssGBLUP do programa |
| 2.000 a 5.000 vacas ou mais | Avaliação própria multicaracterística possível, desde que conectada e com parâmetros externos; estimar parâmetros só com estrutura da ordem de 50 touros × 20 filhos | Modelos direto-materno e de limiar com as variâncias fixadas; validação com safras futuras | Genotipagem ampla, com o programa como referência |

## Conclusão

A avaliação genética de corte parece um campo de muitos modelos, mas é uma única máquina, as MME, alimentada com matrizes diferentes. O pedigree entra por A⁻¹, o genoma por H⁻¹, o efeito materno por G₀ ⊗ A⁻¹, as características correlacionadas por R₀⁻¹ e G₀⁻¹, e a idade por funções de covariância. Os grandes programas diferem menos no método do que na escala dos dados e nas escolhas de base, ajuste e índice, e por isso suas DEPs não se comparam entre si. Para uma fazenda, a variável que decide a precisão não é a sofisticação do modelo, mas a quantidade de informação que chega a cada animal: o tamanho e a conectividade dos GCs, o número de parentes avaliados e a presença de touros de referência e de genótipos dentro de uma população grande.

Daí a implicação prática para um software de gestão. O valor está menos em embutir um BLUP sofisticado e mais em garantir que cada pesagem, parto, diagnóstico e paternidade seja registrado de forma que um programa nacional, ou um BLUP intra-rebanho com parâmetros da literatura, possa usá-lo sem perda. As ferramentas simples (razão BIF, MPPA, indicadores com intervalo de confiança, F e Ne) dão ao produtor leitura imediata. A DEP certa vem da conexão do rebanho com a avaliação nacional, e as duas coisas dependem do mesmo cadastro bem feito.

## O que o rebanho precisa registrar para viabilizar essas análises

Todas as análises acima dependem de poucos dados, desde que completos e consistentes. Três regras valem para todos eles: registrar todos os animais do GC, inclusive os descartados e mortos, porque omitir os piores enviesa razões e DEPs; registrar datas, não idades, para que o sistema calcule idades-padrão; e exportar em formato aceito pelos programas de avaliação.

| Dado | Para que serve | Mínimo necessário |
|---|---|---|
| Identificação única e permanente | Ligar registros, pedigree e genótipo | Brinco ou RFID, raça e composição racial, sexo, data de nascimento |
| Pai e mãe | A⁻¹, efeito materno, MPPA, F e Ne | Pai individual (ou lote de touros na monta múltipla), mãe, receptora em TE/FIV |
| Chaves do grupo de contemporâneos | Efeito fixo do modelo | Fazenda, lote de manejo, estação de nascimento, regime alimentar, tratamento diferenciado |
| Pesagens com data | P205/210, PS365/450/550, GMD, regressão aleatória | Peso ao nascer, desmama (todo o GC no mesmo dia), sobreano; pesagens seriadas quando houver |
| Eventos reprodutivos | Prenhez, IPP, IEP, STAY, DEPs reprodutivas | Exposição (IATF, IA, monta e touro), diagnóstico com data e método, parto com escore de facilidade, aborto |
| Saída do rebanho | STAY, sobrevivência, correção do viés de seleção | Data e motivo de descarte, venda ou morte |
| Medidas morfológicas e de carcaça | PE, ultrassom, escores visuais | Perímetro escrotal com data; AOL, EGS, EGP8 e marmoreio com técnico certificado; EPMURAS; temperamento; condição corporal |
| Genótipo | ssGBLUP, confirmação de paternidade | Painel, laboratório e código da amostra |

## Apêndice A: script que reproduz os exemplos

O script usa apenas numpy, roda em menos de um minuto e reproduz todos os números das tabelas. A simulação de Monte Carlo usa semente fixa; com outra semente, os desvios-padrão variam na terceira casa decimal.

```python
# Reproduz os exemplos do relatorio (somente numpy). python3 apendice.py
import math
import numpy as np
np.set_printoptions(precision=4, suppress=True, linewidth=120)

# 1. Pedigree, A (metodo tabular), F e A^-1 (regras de Henderson + Quaas)
ped = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (1, 2), 5: (1, 3), 6: (4, 5), 7: (4, 3), 8: (4, 0)}
n = len(ped)

def matriz_A(ped):
    m = len(ped); A = np.zeros((m, m))
    for i in range(1, m + 1):
        s, d = ped[i]
        for j in range(1, i):
            A[i-1, j-1] = A[j-1, i-1] = 0.5 * ((A[j-1, s-1] if s else 0) + (A[j-1, d-1] if d else 0))
        A[i-1, i-1] = 1 + (0.5 * A[s-1, d-1] if s and d else 0)
    return A

def inversa_A(ped, F):
    m = len(ped); Ai = np.zeros((m, m))
    for i in range(1, m + 1):
        s, d = ped[i]; pais = [x for x in (s, d) if x]
        dii = {2: 0.5 - 0.25 * sum(F[x-1] for x in pais), 1: 0.75 - 0.25 * sum(F[x-1] for x in pais), 0: 1.0}[len(pais)]
        idx, c = [i] + pais, [1.0] + [-0.5] * len(pais)
        for a, ca in zip(idx, c):
            for b, cb in zip(idx, c):
                Ai[a-1, b-1] += ca * cb / dii
    return Ai

A = matriz_A(ped); F = np.diag(A) - 1; Ainv = inversa_A(ped, F)
print("F =", F, "| erro A^-1 regras vs inv(A):", np.abs(Ainv - np.linalg.inv(A)).max())
pedx = {**ped, 9: (6, 3), 10: (6, 0), 11: (6, 7)}; Ax = matriz_A(pedx); Fx = np.diag(Ax) - 1
print("pedigree estendido: erro com F =", np.abs(inversa_A(pedx, Fx) - np.linalg.inv(Ax)).max(),
      "| ignorando F =", np.abs(inversa_A(pedx, 0 * Fx) - np.linalg.inv(Ax)).max())

# 2. MME do modelo animal unicaracteristica (P205 ajustado; GC = safra 2022 / 2024)
reg, y, gc = [4, 5, 6, 7, 8], np.array([212., 198., 225., 204., 196.]), [0, 0, 1, 1, 1]
X = np.eye(2)[gc]; Z = np.eye(n)[[a - 1 for a in reg]]
s2a, s2e = 100., 300.; lam = s2e / s2a

def mme(X, Z, y, Kinv, lam):
    L = np.block([[X.T @ X, X.T @ Z], [Z.T @ X, Z.T @ Z + lam * Kinv]])
    return np.linalg.solve(L, np.concatenate([X.T @ y, Z.T @ y])), np.linalg.inv(L)

sol, C = mme(X, Z, y, Ainv, lam); a = sol[2:]; PEV = np.diag(C)[2:] * s2e
V = s2a * Z @ A @ Z.T + s2e * np.eye(5); Vi = np.linalg.inv(V)
b = np.linalg.solve(X.T @ Vi @ X, X.T @ Vi @ y)
print("b =", sol[:2], "| erro MME vs GLS:", np.abs(a - s2a * A @ Z.T @ Vi @ (y - X @ b)).max())
vara = (1 + F) * s2a
for i in range(n):
    print(f"animal {i+1}: EBV={a[i]:6.2f} DEP={a[i]/2:5.2f} PEV={PEV[i]:6.1f} r={math.sqrt(1-PEV[i]/vara[i]):.3f}"
          f" aBIF={1-math.sqrt(PEV[i]/vara[i]):.3f} SEP_DEP={math.sqrt(PEV[i])/2:.2f}")
for k in (2, 5, 20, 100):   # tamanho do GC x acuracia (1 registro, animais nao aparentados)
    _, Ck = mme(np.ones((k, 1)), np.eye(k), np.zeros(k), np.eye(k), lam)
    print(f"GC de {k}: r = {math.sqrt(1 - Ck[1, 1] * s2e / s2a):.3f}")

# 3. Modelo direto-materno com ambiente permanente materno
mae = {4: 2, 5: 3, 6: 5, 7: 3, 8: 0}; maes = [2, 3, 5]
Z2 = np.array([np.eye(n)[mae[r]-1] if mae[r] else np.zeros(n) for r in reg])
W = np.array([np.eye(3)[maes.index(mae[r])] if mae[r] else np.zeros(3) for r in reg])
G0, s2p, s2e2 = np.array([[100., -15.], [-15., 40.]]), 30., 230.
T = np.hstack([X, Z, Z2, W]); L = T.T @ T / s2e2
L[2:2+2*n, 2:2+2*n] += np.kron(np.linalg.inv(G0), Ainv); L[2+2*n:, 2+2*n:] += np.eye(3) / s2p
u = np.linalg.solve(L, T.T @ y / s2e2); ad, am, pe = u[2:2+n], u[2+n:2+2*n], u[2+2*n:]
print("s2P =", G0[0, 0] + G0[1, 1] + G0[0, 1] + s2p + s2e2, "| pe maes 2,3,5 =", pe)
for i in range(n):
    print(f"animal {i+1}: DEPd={ad[i]/2:5.2f} DEPm={am[i]/2:5.2f} TMD={am[i]/2 + ad[i]/4:5.2f}")

# 4. Bicaracteristica PD + PS450 (animal 8 vendido na desmama: sem PS)
ps = {4: 305., 5: 290., 6: 330., 7: 300.}
G0m, R0 = np.array([[100., 105.], [105., 225.]]), np.array([[300., 100.], [100., 400.]])
rows = [(0, k, a, y[k]) for k, a in enumerate(reg)] + [(1, reg.index(a), a, v) for a, v in ps.items()]
Xm = np.array([np.eye(4)[2 * t + gc[k]] for t, k, a, v in rows])
Zm = np.array([np.eye(2 * n)[t * n + a - 1] for t, k, a, v in rows]); ym = np.array([r[3] for r in rows])
Rm = np.array([[R0[t1, t2] if a1 == a2 else 0 for t2, _, a2, _ in rows] for t1, _, a1, _ in rows])
Tm = np.hstack([Xm, Zm]); Lm = Tm.T @ np.linalg.inv(Rm) @ Tm; Lm[4:, 4:] += np.kron(np.linalg.inv(G0m), Ainv)
um = np.linalg.solve(Lm, Tm.T @ np.linalg.inv(Rm) @ ym)
s1, _ = mme(np.eye(2)[[gc[reg.index(a)] for a in ps]], np.eye(n)[[a - 1 for a in ps]],
            np.array(list(ps.values())), Ainv, R0[1, 1] / G0m[1, 1])
print("EBV_PS bicaracteristica:", um[4+n:], "\nEBV_PS unicaracteristica:", s1[2:])

# 5. ssGBLUP: genotipos (31 SNPs) dos animais 1, 4, 5, 6, 7
gen = [1, 4, 5, 6, 7]
M = np.array([[int(c) for c in s] for s in (
    "1112211011110212210111202111201", "1112111000010112111122202110110", "0111211112101111201100111121200",
    "1002111011111101211111101121100", "0202112001101101201112112110100")])
p = M.mean(0) / 2; Zg = M - 2 * p; G = Zg @ Zg.T / (2 * np.sum(p * (1 - p)))
i2 = [g - 1 for g in gen]; i1 = [i for i in range(n) if i not in i2]; A22 = A[np.ix_(i2, i2)]
md, mg = lambda Q: np.diag(Q).mean(), lambda Q: Q.mean()
beta = (md(A22) - mg(A22)) / (md(G) - mg(G)); alpha = md(A22) - beta * md(G)
Gw = 0.95 * (alpha + beta * G) + 0.05 * A22
Hinv = Ainv.copy(); Hinv[np.ix_(i2, i2)] += np.linalg.inv(Gw) - np.linalg.inv(A22)
Q = np.linalg.inv(A22); H = np.zeros((n, n))
H[np.ix_(i1, i1)] = A[np.ix_(i1, i1)] + A[np.ix_(i1, i2)] @ Q @ (Gw - A22) @ Q @ A[np.ix_(i2, i1)]
H[np.ix_(i1, i2)] = A[np.ix_(i1, i2)] @ Q @ Gw; H[np.ix_(i2, i1)] = H[np.ix_(i1, i2)].T; H[np.ix_(i2, i2)] = Gw
solH, CH = mme(X, Z, y, Hinv, lam)
print("alfa, beta =", round(alpha, 3), round(beta, 3), "| erro H^-1 vs inv(H):", np.abs(Hinv - np.linalg.inv(H)).max())
print("EBV ssGBLUP:", solH[2:], "\nr ssGBLUP:", np.sqrt(1 - np.diag(CH)[2:] * s2e / (np.diag(H) * s2a)))

# 6. Indices: Smith-Hazel (PD, PS) e indice economico de dois touros
P = G0m + R0; v = np.array([2., 4.]); bsh = np.linalg.solve(P, G0m @ v)
print("b =", bsh, "| r_IH =", math.sqrt(bsh @ P @ bsh / (v @ G0m @ v)))
w = np.array([10., 6., -40., 15., 8., 5.])            # R$/unidade: PD210, PS450, IPP, STAY, PE365, AOL
tA, tB = np.array([12., 20., .5, -2., .8, 1.5]), np.array([6., 10., -1.2, 4., 1.2, 2.])
sdg = np.array([5., 7.5, 1., 5., .8, 2.])            # DP genetico das DEPs (hipotetico)
eA, eB = [math.sqrt(np.sum(w**2 * (1 - r**2) * sdg**2)) for r in (0.90, 0.45)]
d = w @ tB - w @ tA
print("I_A =", w @ tA, "I_B =", w @ tB, "| DP erro:", round(eA, 1), round(eB, 1),
      "| P(B>A) =", round(0.5 * (1 + math.erf(d / math.hypot(eA, eB) / math.sqrt(2))), 2))
pct, sinal, term = np.array([.15, .20, .15, .30, .10, .10]), np.array([1, 1, -1, 1, 1, 1]), np.array([1, 1, 0, 0, 0, 1])
print("padronizado: A =", round(np.sum(pct * sinal * tA / sdg), 3), "B =", round(np.sum(pct * sinal * tB / sdg), 3),
      "| terminal: A =", w * term @ tA, "B =", w * term @ tB)

# 7. Rebanho: MPPA, Ne/dF, erro binomial
f = lambda k, r: k * r / (1 + (k - 1) * r)
print("MPPA =", 200 + f(4, .25) * 30, "| Ne(5 touros, 100 vacas) =", 4 * 5 * 100 / 105, "| EP prenhez N=100:", math.sqrt(.85 * .15 / 100))

# 8. Regressao aleatoria (Legendre normalizado de ordem 2, idades 100-550 d)
leg = lambda t: (lambda x: np.array([math.sqrt(.5), math.sqrt(1.5) * x, math.sqrt(2.5) * (3 * x * x - 1) / 2]))(-1 + 2 * (t - 100) / 450)
K, c = np.array([[300., 90., 10.], [90., 60., 5.], [10., 5., 8.]]), np.array([4., 1.5, .2])
print({t: (round(leg(t) @ K @ leg(t), 1), round(leg(t) @ c / 2, 2)) for t in (120, 210, 365, 450)})

# 9. Monte Carlo: erro-padrao de h2 (meios-irmaos paternos, h2 = 0,30)
rng = np.random.default_rng(7)
for s, k in ((5, 20), (20, 25), (50, 20), (100, 30)):
    est = []
    for _ in range(5000):
        yv = rng.normal(0, math.sqrt(.3 / 4), (s, 1)) + rng.normal(0, math.sqrt(1 - .3 / 4), (s, k))
        msb = k * yv.mean(1).var(ddof=1); msw = ((yv - yv.mean(1, keepdims=True))**2).sum() / (s * (k - 1))
        s2s = (msb - msw) / k; est.append(4 * s2s / (s2s + msw))
    print(f"{s}x{k}: DP(h2) = {np.std(est):.3f}  P(h2<0) = {np.mean(np.array(est) < 0):.3f}")
```

Os demais números do texto (conversão r → a_BIF, intensidades de seleção, tendência, Dempster e Lerner, APY, GBLUP contra SNP-BLUP, Daetwyler) são aplicações diretas das fórmulas mostradas em cada seção e foram calculados com o mesmo ambiente.
