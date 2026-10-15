# Como pesagens e pedigree viram DEPs confiáveis

As DEPs (diferenças esperadas na progênie, as EPDs dos programas de língua inglesa) de bovinos de corte são metade do valor genético predito pelo **BLUP de modelo animal**: um único sistema de equações de modelos mistos (MME, de Henderson) que combina, numa só solução, os registros ajustados por **grupo de contemporâneos (efeito fixo)**, o pedigree inteiro por meio da **inversa da matriz de parentesco (A⁻¹)** e as variâncias estimadas por REML. Sobre esse núcleo, cada característica ganha um modelo próprio: **direto-materno** para pesos até a desmama, **multicaracterística** para corrigir o viés da seleção sequencial, **limiar** para escores e prenhez, **limiar ou sobrevivência** para permanência (STAY) e **regressão aleatória** para pesagens seriadas. A genômica entra trocando A⁻¹ por **H⁻¹ (ssGBLUP)**, com o algoritmo APY quando há centenas de milhares de genotipados. É assim que operam os programas de N muito grande. A ANCP usa modelo animal com DEPs diretas e maternas desde 1993 e ssGBLUP com APY no BLUPF90+ em todas as DEPs genômicas desde 2019. A ABCZ e a Embrapa-Geneplus fazem avaliação conjunta single-step desde 2018. A Angus Genetics roda single-step semanal desde 2017, e a Hereford americana usa o BOLT desde dezembro do mesmo ano. A BREEDPLAN adota o single-step raça a raça desde outubro de 2017, e o IBOVAL o tinha previsto para 2025. Há duas exceções documentadas: a GenSys (Conexão Delta G e Aliança Nelore) obtém a DEP genômica em duas etapas, e o Interbeef não usava genômica até janeiro de 2026. A acurácia vem da variância do erro de predição (PEV), com a escala BIF mais conservadora que a correlação, e os índices (MGTe, iABCZ, IQGg, $Values) somam DEPs ponderadas por valores econômicos ou percentuais. Para fazendas de 100 a 5.000 vacas, a precisão não vem de rodar sozinho um modelo sofisticado: nos exemplos deste relatório, 100 registros de 5 touros estimam a herdabilidade com desvio-padrão de 0,30, e um bezerro num grupo de contemporâneos de 2 animais perde cerca de 30% da acurácia possível. O caminho é fixar parâmetros pela literatura (por exemplo, h² de 0,24 direta e de 0,13 materna para o peso à desmama de zebuínos, segundo meta-análise), formar grupos de contemporâneos grandes, conectar o rebanho por inseminação a touros avaliados e inscrevê-lo, com genotipagem, numa avaliação nacional. Razão BIF, MPPA e BLUP intra-rebanho ficam como ferramentas de manejo. Todos os números dos exemplos foram conferidos em Python/numpy, e as regras de A⁻¹ e as fórmulas de H, H⁻¹ e APY foram, nesta versão, conferidas também nas fontes.

**Grau de confirmação.** A versão 1 foi compilada por busca na web, quase sempre a partir de resumos e trechos. Esta versão 2 incorpora a verificação de fontes de 15/10/2026, que confrontou 135 itens (equações, números, datas e referências) com o texto das fontes: **78 confirmados, 26 a corrigir, 24 não confirmados e 7 de acesso pago**. As 26 correções foram aplicadas. A versão incorpora também um aprofundamento feito no mesmo dia com texto completo: sumários da ANCP de 2023 a 2026, o documento metodológico ABCZ–Embrapa, os sumários da GenSys, as diretrizes do BIF, os documentos do Interbull e as revisões abertas de ssGBLUP. Seis marcadores aparecem ao longo do texto:
- **[conferido na fonte]**: forma ou número lido no texto da fonte citada, com página ou seção quando a fonte as tem.
- **[conferido numericamente]**: relação algébrica que este relatório verificou por computação. Isso prova a consistência interna, mas não confirma a autoria nem a notação do original.
- **[não verificado]**: fórmula ou afirmação sem fonte primária lida, porque a fonte estava bloqueada, não trazia o dado ou não foi localizada.
- **[acesso pago; aguardando PDF]**: fonte primária paga. Os metadados (autores, periódico, volume, páginas, DOI) foram conferidos no Crossref, mas o texto não foi lido.
- **"atribuição a confirmar"**: número vindo de trecho de busca cujo vínculo com a fonte não ficou inequívoco.
- **[inferência]**: conclusão deste relatório a partir do que foi lido.

Os DOIs aparecem só quando conferidos, e os exemplos numéricos usam dados fictícios, reproduzíveis pelo script do Apêndice A.

## O modelo animal resolve ambiente, pedigree e genética num único sistema

### Equação, pressupostos e efeitos

O modelo animal unicaracterística, que serve de base a todos os outros, é escrito assim (Henderson 1975, *Biometrics* 31:423–447, [DOI 10.2307/2529430](https://doi.org/10.2307/2529430); Mrode 2014, *Linear Models for the Prediction of Animal Breeding Values*, 3ª ed., CABI, [DOI 10.1079/9781780643915.0000](https://doi.org/10.1079/9781780643915.0000)) **[acesso pago; aguardando PDF]**. A mesma forma, inclusive as MME com R⁻¹ e G⁻¹, está nas Eqs. 1 a 3 da revisão aberta de Zhang et al. (2026, *J. Anim. Sci. Biotechnol.* 17, [DOI 10.1186/s40104-026-01477-w](https://doi.org/10.1186/s40104-026-01477-w)) e nas Eqs. 14 e 15 de Lourenco et al. (2020, *Genes* 11:790, [DOI 10.3390/genes11070790](https://doi.org/10.3390/genes11070790)) **[conferido na fonte]**:

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

Três pressupostos sustentam o método. O primeiro é que as variâncias são **conhecidas**: na prática, são estimadas antes por REML e tratadas como verdadeiras. O segundo é que a população-base, formada pelos animais de pais desconhecidos, é **não aparentada, não endogâmica e de média genética comum**. Quando isso falha, porque há animais importados ou touros sem registro, entram os **grupos genéticos** (pais fantasmas agrupados por origem e época). Westell, Quaas e Van Vleck (1988, *J. Dairy Sci.* 71:1310–1318, [DOI 10.3168/jds.S0022-0302(88)79688-5](https://doi.org/10.3168/jds.S0022-0302(88)79688-5)) definiram os coeficientes desses grupos nas MME; o resumo diz que eles são necessários quando entram animais de fora ou quando pais sem registro são escolhidos ([UNL](https://digitalcommons.unl.edu/animalscifacpub/index.11.html)) **[conferido na fonte: metadados no Crossref e resumo]**. O terceiro é que o efeito fixo de GC **absorve todo o ambiente comum** aos contemporâneos. Pelas diretrizes do BIF, o GC reúne animais da mesma composição racial e do mesmo sexo, de idade semelhante e criados sob o mesmo manejo ([BIF Guidelines, 9ª ed., pp. 15–17](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf); [BIF, Contemporary Groups](https://guidelines.beefimprovement.org/index.php/Contemporary_Groups)), desmamados e pesados no mesmo dia ([BIF, Weaning Weight](https://guidelines.beefimprovement.org/index.php/Weaning_Weight)) **[conferido na fonte]**. Depois da estação de parição, os GCs podem encolher, mas não crescer, e um grupo dividido não volta a ser reunido. As janelas de idade dependem da característica. O BIF indica 90 dias de diferença de nascimento para grupos de carcaça ([BIF, Marbling](https://guidelines.beefimprovement.org/index.php/Marbling_score)) e manda usar mais de uma data de pesagem quando a diferença de idade dos bezerros passa de 90 dias (9ª ed., p. 20). O ICAR recomenda 60 dias para grupos de ultrassom na fazenda de origem e 60 a 90 dias para testes em estação ([ICAR, Beef Recording, §3.8.2](https://www.icar.org/Guidelines/03-Beef-Cattle-Recording.pdf)) **[conferido na fonte]**. No Brasil, a ANCP forma o GC por rebanho, sexo, ano e estação de nascimento e grupo de manejo ([Sumário ANCP 2026, PDF p. 89](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf); Pereira et al. 2026, *J. Anim. Breed. Genet.*, [PMC13054113](https://pmc.ncbi.nlm.nih.gov/articles/PMC13054113/), com a estação seca de abril a setembro). A ABCZ–Embrapa o forma por animais da mesma raça e do mesmo sexo, nascidos ou medidos na mesma data, na mesma fazenda e sob manejo semelhante ([apresentação geral do sumário ABCZ–Embrapa, PDF p. 2–3](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf)) **[conferido na fonte]**. Tratar o GC como fixo, e não aleatório, evita viés quando rebanhos diferem em nível genético médio **[não verificado]**. O efeito genético é aleatório porque se quer predizê-lo com encolhimento: λ grande, isto é, h² baixa, puxa as predições para a média.

A transição do modelo de touro para o modelo animal mudou o modelo, não o algoritmo. O modelo de touro usa apenas a relação pai-filho; o modelo animal usa todos os parentescos e os registros de todos os animais **[não verificado]**. Quaas e Pollak (1980, *J. Anim. Sci.* 51:1277–1287, [DOI 10.2527/jas1981.5161277x](https://doi.org/10.2527/jas1981.5161277x)) formalizaram a metodologia de modelos mistos para testes de desempenho em fazendas de corte **[acesso pago; aguardando PDF]**. No Brasil, a ANCP usa DEPs diretas e maternas por modelo animal desde 1993 ([ANCP, História](https://www.ancp.org.br/ancp/historia/)) **[conferido na fonte]**. A ABCZ começou em 1984 com um modelo de efeitos fixos, passou ao modelo touro três anos depois e adotou o modelo animal a partir de 1996 ([apresentação geral ABCZ–Embrapa, PDF p. 1](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf)) **[conferido na fonte]**.

### Antes do modelo: padronizar idades e formar os grupos

O registro que entra em y quase nunca é o peso bruto. Cada programa padroniza a idade com um conjunto próprio de idades-padrão, e esses conjuntos não devem ser misturados **[conferido na fonte]**:

| Fonte | Desmama | Ano | Sobreano | Pesagens aceitas (dias) |
|---|---|---|---|---|
| BIF (EUA), [9ª ed., pp. 21–23](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf) | 205 | 365 | 452 ou 550 | 160–250; 320–410; ≥ 400 ou ≥ 500 |
| ABCZ, [CDP 2023, arts. 20–25](https://www.abcz.org.br/common/uploads/secao/a66183db97120042234f2b57a42cdb7a.pdf) | 210 | 365 | 450 | 150–270; 305–425; 390–510 |
| ANCP, [sumário 2026, PDF p. 101–102](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf) | 210 (e 120) | 365 | 450 | 165–255 (70–165 para 120); 320–410; 405–495 |
| Embrapa-Geneplus, Senepol (tese de doutorado de Pereira, UFMS, 2024) | 240 (e 120) | não citado | 540 | não citado |

Nas outras fontes da v1, três itens seguem sem confirmação. A Angus americana publica a EPD de desmama a 205 dias; a faixa de 120 a 280 dias por animal vem das notas ([Angus, definições](https://www.angus.org/Nce/Definitions)) **[não verificado: página bloqueada]**. A BREEDPLAN publica EBVs de peso aos 200, 400 e 600 dias ([Charolais UK](https://www.charolais.co.uk/wp-content/uploads/2021/07/Understanding-Weight-EBVs.pdf)) **[conferido na fonte]**, mas as janelas de 80 a 300 e de 301 a 500 dias e a correção por idade da mãe não apareceram no texto lido **[não verificado]**. Um trabalho da UFMS citava o sobreano do Geneplus a 550 dias ([UFMS](https://sigpos.ufms.br/portal/trabalho-arquivos/download/4934)) **[não verificado]**; para Nelore, o documento ABCZ–Embrapa usa PD aos 210, PA aos 365 e PS aos 450 dias. O CDP da ABCZ faz pesagens trimestrais de 0 a 510 dias e só admite animais com até 210 dias na primeira pesagem. Sem peso ao nascer tomado nas primeiras 24 horas, usa o peso médio da raça, por sexo ([Regulamento do CDP, arts. 5º a 7º](https://www.abcz.org.br/common/uploads/secao/a66183db97120042234f2b57a42cdb7a.pdf)) **[conferido na fonte]**.

As fórmulas de padronização são lineares. As do BIF (9ª ed., pp. 21–23) e as do CDP da ABCZ (art. 22) são **[conferido na fonte]**:

```
BIF:   P205 ajustado = [(PD − PN) / idade à desmama] × 205 + PN + ajuste de idade da vaca
       P365 ajustado = [(peso final − PD) / dias entre pesagens] × 160 + P205 ajustado     (247 para 452 dias; 345 para 550)
       razão = P205 ajustado do animal / média do GC × 100

ABCZ:  PC210 = PN + G × 210          G = GMD do nascimento à pesagem mais próxima de 210 dias, dentro da faixa
       PC365 = PC210 + G1 × (ID210 − 210) + G2 × (365 − ID210)        (PC450: troca-se 365 por 450)
       G1 = GMD usado no PC210 ;  G2 = GMD entre essa pesagem e a mais próxima de 365 (ou 450) dias ;  ID210 = idade nessa pesagem
```

O regulamento da ABCZ diz apenas que "todos os pesos calculados serão corrigidos para efeitos sistemáticos não genéticos", sem publicar os fatores. A ANCP não publica a fórmula, só as janelas, e o glossário do sumário fala em peso "padronizado aos 210 dias".

Para a idade da vaca, o BIF recomenda fatores **aditivos**, e não multiplicativos, e manda substituí-los pelos da raça sempre que existirem (9ª ed., pp. 21–22). A única tabela do BIF (Apêndice 3.1, p. 135 impressa), feita para raças taurinas americanas, soma os seguintes valores **[conferido na fonte; conversão para kg deste relatório]**:

| Idade da vaca | Peso ao nascer | Desmama, machos | Desmama, fêmeas |
|---|---|---|---|
| 2 anos | +8 lb (3,6 kg) | +60 lb (27,2 kg) | +54 lb (24,5 kg) |
| 3 anos | +5 lb (2,3 kg) | +40 lb (18,1 kg) | +36 lb (16,3 kg) |
| 4 anos | +2 lb (0,9 kg) | +20 lb (9,1 kg) | +18 lb (8,2 kg) |
| 5 a 10 anos | 0 | 0 | 0 |
| 11 anos ou mais | +3 lb (1,4 kg) | +20 lb (9,1 kg) | +18 lb (8,2 kg) |

Considere um bezerro macho com 32 kg ao nascer e 190 kg aos 190 dias, filho de vaca de 2 anos. Pelo BIF, o GMD é (190 − 32)/190 = 0,832 kg/dia, o P205 é 0,832 × 205 + 32 = 202,5 kg e, com o ajuste de +27,2 kg, **o P205 ajustado é 229,7 kg**. Pela ABCZ, o mesmo bezerro tem **PC210 = 32 + 0,832 × 210 = 206,6 kg**. Suponha que ele pesou 300 kg aos 380 dias. Então G2 = (300 − 190)/(380 − 190) = 0,579 kg/dia, e o peso aos 365 dias é **291,3 kg pela ABCZ**, contra **322,3 kg pela fórmula do BIF** (295,1 kg sem o ajuste de idade da vaca) **[conferido numericamente]**. Quase toda a diferença vem do ajuste de idade da vaca e da idade-padrão, e é por isso que pesos padronizados de programas diferentes não se comparam.

Os programas brasileiros não publicam tabela de idade da vaca. A ABCZ–Embrapa usa idade da vaca/sexo do produto como efeito fixo no modelo, a GenSys pré-ajusta o fenótipo sem publicar fatores, e a ANCP não descreve o tratamento. Os fatores publicados para Nelore vêm de dois estudos **[conferido na fonte]**:
- **Paz, Albuquerque e Fries (1999)** ([RBZ 28:65–73, DOI 10.1590/S1516-35981999000100009](https://www.scielo.br/j/rbz/a/txz7TZYq5CjkXj9K7j4yy5x/)): fatores **multiplicativos** sobre o GMD pré-desmama, com base na vaca de 8 anos. Vão de 0,99246 a 1,10164 em machos e de 0,99842 a 1,09928 em fêmeas, e as vacas atingem a maturidade entre o 5º e o 7º ano. Os dados são de uma única fazenda (18.772 bezerros).
- **Bocchi, Teixeira e Albuquerque (2004)** ([Acta Sci. Anim. Sci. 26:475–482, DOI 10.4025/actascianimsci.v26i4.1724](https://periodicos.uem.br/ojs/index.php/ActaSciAnimSci/article/download/1724/1161)): regressões quadráticas do P205 na idade da vaca, por região e sexo, com 333.259 Nelores da ABCZ. Pelas equações do artigo, o máximo ocorre por volta dos 8,5 anos (7,8 no Nordeste). No Centro-Oeste, a vaca de 3 anos desmama bezerros 7,9 kg (machos) e 5,9 kg (fêmeas) mais leves que a vaca no máximo, e a de 16 anos, 13,5 e 10,8 kg mais leves **[conferido numericamente a partir das equações da fonte]**.

A tabela do BIF, com +27 kg para a vaca de 2 anos, não se transfere ao Nelore, que pare pela primeira vez aos 3 anos ou mais e tem efeito de idade da vaca em outra escala **[inferência]**.

O desenho do GC define quanta informação sobra para a genética. Um GC de um só animal não traz informação para a avaliação ([eBEEF, Sire Selection Manual 2021](https://ebeef.ucdavis.edu/sites/g/files/dgvnsk7331/files/inline-files/NBCEC%20SireSelectionManual2021_0.pdf)). O BIF recomenda progênie de pelo menos dois touros por GC, exigência que dispensa quando se usa modelo animal ([BIF Guidelines, 9ª ed., p. 20](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf)), e o ICAR pede ao menos dois touros por GC **[conferido na fonte]**. Não há tamanho mínimo oficial de GC nos programas brasileiros, mas há regras práticas. A GenSys exige no mínimo 10 laços genéticos diretos por GC e elimina da análise os GCs desconectados ([sumário Conexão Delta G 2026, PDF p. 18](https://gensys.com.br/wp-content/uploads/2026/09/Sumario-de-Touros-CDG-2026.pdf)). Estudos com dados da ANCP e da avaliação Senepol do Embrapa-Geneplus descartam GCs com menos de 5 registros (Londoño-Gil et al. 2025, [DOI 10.1111/jbg.12882](https://doi.org/10.1111/jbg.12882); tese de Pereira, UFMS, 2024) **[conferido na fonte]**. O efeito do tamanho, porém, é fácil de calcular: com h² = 0,25 e um registro por animal não aparentado, a acurácia máxima é √h² = 0,50, mas o próprio animal "gasta" informação ao estimar a média do grupo. **[conferido numericamente]**

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

O **método tabular** monta A com os pais sempre antes dos filhos. A regra é A_ij = ½(A_j,pai(i) + A_j,mãe(i)) fora da diagonal e A_ii = 1 + F_i na diagonal, com F_i = ½ A_pai,mãe (Wright). A mesma regra aparece como T_ij = (T_si + T_di)/2 e "the relationship between two individuals is twice the inbreeding coefficient of their progeny" em Nilforooshan, Garrick e Harris (2021, [Front. Genet. 12:655638](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2021.655638/full)) **[conferido na fonte; conferido numericamente contra a inversa]**. O resultado dá **F₆ = ½ × A₄₅ = ½ × 0,25 = 0,125**:

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

Inverter A é inviável com milhões de animais, mas A⁻¹ pode ser montada diretamente do pedigree pelas regras de Henderson (1976, *Biometrics* 32:69–83, [DOI 10.2307/2529339](https://doi.org/10.2307/2529339)), generalizadas por Quaas (1976, *Biometrics* 32:949–953, [DOI 10.2307/2529279](https://doi.org/10.2307/2529279)) para endogamia **[acesso pago; aguardando PDF]**. As regras estão reproduzidas em três fontes abertas: Nilforooshan et al. (2021), com D_jj = (2 − F_s − F_d)/4 para ambos os pais conhecidos e (3 − F_s)/4 para um só; Misztal, Legarra e Aguilar (2014, *J. Dairy Sci.* 97:3943, p. 3944); e Legarra, Aguilar e Misztal (2009, *J. Dairy Sci.* 92:4656, p. 4658) **[conferido na fonte]**. Cada animal i soma à matriz a contribuição α_i · t_i t_i', em que t_i vale 1 na posição do animal e −½ na posição de cada pai conhecido:

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

A matriz é **idêntica à inversa numérica de A (diferença máxima 0)**. Como nenhum pai do exemplo é endogâmico, a correção de Quaas ainda não aparece. Por isso o pedigree foi estendido com os filhos 9 (6 × 3), 10 (6 × desconhecida) e 11 (6 × 7), que têm pai endogâmico. Com F nas fórmulas de d_i, a inversa por regras volta a coincidir com a numérica (diferença de 4 × 10⁻¹⁶). Ignorando F, o erro chega a 0,133. Isso confirma também a forma d_i = 0,75 − 0,25 F_pai para um pai conhecido, que é a (3 − F_s)/4 de Nilforooshan et al. **[conferido numericamente]**. Em pedigrees grandes, os coeficientes F vêm de algoritmos rápidos como o de Meuwissen e Luo (1992, *Genet. Sel. Evol.* 24:305–313, [DOI 10.1186/1297-9686-24-4-305](https://doi.org/10.1186/1297-9686-24-4-305)), citado como padrão por Nilforooshan et al. (2021) e usado em programas como o CoeFR ([manual](https://www.agri.tohoku.ac.jp/animalbreeding/program/CoeFR/CoeFR_English_Manual.pdf)) **[não verificado: conteúdo do algoritmo; metadados conferidos]**.

### Passo 2: montar e resolver as MME

Com σ²a = 100 kg² e σ²e = 300 kg², tem-se h² = 0,25, valor dentro da faixa do peso à desmama em Nelore discutida adiante e próximo da média de 0,24 da meta-análise de Giannotti (2004). Então λ = 3. Os efeitos fixos são os dois GCs (safras 2022 e 2024). As colunas de X'X contam os registros por GC, Z'Z põe 1 na diagonal dos animais com registro, e o bloco de animais recebe λA⁻¹:

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

Com milhões de equações, ninguém inverte a matriz. Os programas usam métodos iterativos: Gauss-Seidel com iteração sobre os dados, que dispensa montar a matriz, e gradiente conjugado pré-condicionado (PCG). O PCG como resolvedor genérico das MME é o tema de Tsuruta, Misztal e Strandén (2001, *J. Anim. Sci.* 79:1166, [registro](https://jukuri.luke.fi/items/6bbbd5ec-6bd9-471f-a6f0-b24a88242ae4/full)). Vandenplas et al. (2020, [GSE 52:24](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7222437/)) o aplicam ao ssSNPBLUP com um modelo materno multicaracterística **[conferido na fonte: títulos e metadados; detalhes dos algoritmos não verificados]**. O Interbeef resolve o seu modelo com PCG no MiX99 (Bonifazi 2022, tese WUR, PDF p. 35). O sistema tem uma equação por animal do pedigree mais uma por nível de efeito fixo, independentemente do número de registros.

### Passo 3: da PEV à acurácia e à DEP

A inversa da matriz de coeficientes, C, dá a variância do erro de predição: **PEV_i = c^ii · σ²e**, que coincidiu com a fórmula direta var(a − â) = G − GZ'PZG **[conferido numericamente]**. Dela saem três medidas de precisão, todas nas diretrizes do BIF ([BIF, Accuracy](https://guidelines.beefimprovement.org/index.php/Accuracy)) e, a confiabilidade com (1 + F), também em Legarra e Reverter (2018, [GSE 50:53](https://link.springer.com/content/pdf/10.1186/s12711-018-0426-6.pdf), Métodos) **[conferido na fonte]**:

```
confiabilidade      r² = 1 − PEV / [(1 + F) σ²a]
acurácia            r  = √r²            (correlação entre valor predito e verdadeiro)
acurácia BIF        a_BIF = 1 − √{ PEV / [(1 + F) σ²a] } = 1 − √(1 − r²)      e, ao contrário, r = √[1 − (1 − a_BIF)²]
DEP = EBV / 2       erro-padrão da DEP (SEP) = √PEV / 2
```

O erro-padrão de predição como √[(1 − acc²)·Vg] aparece em Van Vleck ([BIF 2016](https://www.bifconference.com/bif2016/documents/GGP-BIF16-Van-Vleck.pdf)) **[conferido na fonte]**.

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

A tabela é a lição mais importante para um rebanho pequeno. **Com um registro por animal e GCs de 2 e 3 bezerros, nenhum animal passa de r = 0,33**, e o erro-padrão das DEPs (cerca de 4,8 kg) é maior que a amplitude das próprias DEPs (−0,73 a +1,80 kg). Na escala BIF, as acurácias nem chegam a 0,06. A escala BIF é deliberadamente conservadora: r = 0,50 equivale a a_BIF = 0,134. A extensão da Universidade do Missouri usa a mesma conversão: "true accuracy is 0.5 (equal to a BIF accuracy of 0.13)" ([Missouri G02013, p. 2](https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/ansci/g02013.pdf)) **[conferido na fonte]**. A tabela da Oklahoma State citada na v1 não pôde ser lida. A tabela de conversão completa, calculada aqui, é: **r 0,50 → 0,134; 0,60 → 0,200; 0,80 → 0,400; 0,90 → 0,564; 0,98 → 0,801**. Antes de comparar a "acurácia" de dois sumários, é preciso saber qual escala cada um publica. A ANCP declara usar a acurácia BIF ([ANCP, Acurácia](https://www.ancp.org.br/programas/conceitos-basicos/acuracia/)), e a ABCZ–Embrapa também, citando Bertrand et al. 2002 ([apresentação geral, PDF p. 3–4](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf)) **[conferido na fonte]**. A Geneplus e a GenSys não declaram a escala. A GenSys usa classes A (acima de 0,90 e touros usados em mais de um rebanho), B (0,80 a 0,90) e C (abaixo de 0,80). Para animais genotipados, a ANCP avisa que a acurácia mede a "capacidade preditiva" da DEP e que as acurácias "tradicional e genômica não são diretamente comparáveis" ([sumário 2025, PDF p. 134](https://www.ancp.org.br/app/assets/sumario-ANCP-2025-v2.pdf)).

A "Possible Change" (PC) traduz a acurácia em amplitude. O BIF a define assim ([BIF Guidelines, 9ª ed., p. 73](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf); [BIF, Possible Change](https://guidelines.beefimprovement.org/index.php/Possible_Change)) **[conferido na fonte]**:

```
PC = t · (1 − a_BIF) · σA / 2        σA = desvio-padrão genético aditivo da característica ; endogamia suposta zero
t = 1 → DEP ± PC contém o valor verdadeiro em 68% dos casos ;  t = 2 → em 95%
```

A fórmula que a v1 dava por "corrompida" é recuperável do código da página e confere com o livro. Com t = 1 e F = 0, PC = √PEV/2, que é o erro-padrão da DEP. No exemplo, o animal 4 (a_BIF = 0,040, σA = 10 kg) tem PC = 0,96 × 10/2 = 4,80 kg, igual ao SEP da tabela. Como a_BIF entra linearmente, cada tabela de PC é uma reta em (1 − a_BIF), e o BIF não tem tabela única. Cada associação publica a sua, com os seus σA, e o BIF pede que a tabela diga se é de 68% ou de 95%. A da Red Angus americana dá, para o peso ao sobreano, ±25,9 lb em acurácia 0, ±12,9 lb em 0,5 e ±2,6 lb em 0,9 ([Red Angus](https://redangus.org/genetics/epd-possible-change/)) **[conferido na fonte; linearidade conferida numericamente]**.

**Exemplo.** Um touro tem DEP de P450 de +12 kg, σA = 16,5 kg (σA/2 = 8,24 kg) e acurácia BIF de 0,70. A 68%, PC = 0,30 × 8,24 = **2,47 kg**, e o intervalo vai de 9,5 a 14,5 kg. A 95%, PC = **4,94 kg**, e o intervalo vai de 7,1 a 16,9 kg **[conferido numericamente]**.

No Brasil, só a ANCP publica tabela de possível mudança ([sumário 2026, PDF p. 105](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf), nível de 68%, sete DEPs), e os números dela seguem **PC = σ·√(1 − a²)**. Ou seja, a tabela trata a coluna "Acurácia" como a correlação r. Para DP450, com σ = 8,24 kg, essa conta reproduz 8,23 (acurácia de 5%), 7,14 (50%), 5,88 (70%) e 1,16 kg (99%). A fórmula BIF daria 7,83, 4,12, 2,47 e 0,08 kg **[conferido numericamente; inferência]**. Para o touro do exemplo, "70%" vale ±2,47 kg se for acurácia BIF e ±5,88 kg se for r. Como a ANCP declara usar a acurácia BIF, a escala da coluna precisa ser confirmada com a associação antes de usar a tabela num produto. Num software, o PC deve ser calculado pela fórmula, com a escala declarada na tela. Em avaliações grandes, a PEV exata é inviável, e as aproximações usadas podem superestimar a acurácia, sobretudo em animais jovens ([BIF, Accuracy](https://guidelines.beefimprovement.org/index.php/Accuracy)) **[conferido na fonte]**.

### Variâncias: REML, AI-REML e Gibbs

As variâncias que alimentam λ são estimadas por máxima verossimilhança restrita (REML). As fórmulas abaixo são de conhecimento de fundo **[não verificado]**:

```
ℓ_R = −½ [ log|V| + log|X'V⁻¹X| + y'Py ] + constante,   P = V⁻¹ − V⁻¹X(X'V⁻¹X)⁻¹X'V⁻¹

AI-REML:   θ(k+1) = θ(k) + AI⁻¹ s,   AI_ij = ½ y'P(∂V/∂θ_i)P(∂V/∂θ_j)Py,   s_i = ∂ℓ_R/∂θ_i
EM-REML:   σ²a(novo) = [ â'A⁻¹â + tr(C^aa A⁻¹) σ²e ] / q
Bayes:     amostragem de Gibbs das condicionais completas; variância a posteriori dá a precisão
```

O algoritmo de informação média (AI-REML) é de Gilmour, Thompson e Cullis (1995, *Biometrics* 51:1440–1450, [DOI 10.2307/2533274](https://doi.org/10.2307/2533274)) **[acesso pago; aguardando PDF]**. A família BLUPF90 junta BLUP, REML e AI-REML no `blupf90+` e os amostradores de Gibbs no `gibbsf90+`; essa descrição vem de um documento do INIA de 2024 ([INIA](https://www.inia.uy/sites/default/files/publications/2024-10/36-012.pdf)) **[não verificado: página bloqueada]**. Os nomes conferem com os documentos dos programas. A ANCP estima componentes com BLUPF90+ e GIBBSF90+ e prediz DEPs e acurácias com blupf90+90iod3, cBLUPF90+90iod2OMP1 (modelos de limiar) e accf90GS2 ([sumário 2026, PDF p. 104](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)). A ABCZ–Embrapa usa BLUP90IOD2, CBLUP90IOD e ACCF90GS3 ([apresentação geral, PDF p. 2](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf)) **[conferido na fonte]**. A Embrapa mantém o Intergen 3.0, em Fortran, com BLUP e inferência bayesiana por MCMC ([Embrapa](https://www.embrapa.br/en/busca-de-solucoes-tecnologicas/-/produto-servico/8404/intergen-30---software-para-avaliacao-genetica-de-bovinos-de-corte)) **[conferido na fonte]**, mas nenhuma fonte liga esse software às avaliações oficiais do Geneplus. Entre os outros programas, o Interbeef usa o MiX99 (Bonifazi 2022), e o estudo neozelandês de repetibilidade citado adiante usou o ASReml (Weik et al. 2021). O papel de WOMBAT e DMU em avaliações de corte não foi verificado.

## Cada característica exige um modelo próprio

### Pesos até a desmama: modelo direto-materno

O peso à desmama depende dos genes do bezerro e da habilidade materna da mãe (leite, cuidado), que também é herdável. O modelo de Willham (1972, *J. Anim. Sci.* 35:1288–1293, [DOI 10.2527/jas1972.3561288x](https://doi.org/10.2527/jas1972.3561288x)) separa os dois efeitos **[acesso pago; aguardando PDF]**. A v1 o citava via [J Agric Sci 2024](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/E634983EF106695E72C27BA1EE5CEDA1/S0021859624000285a.pdf/direct-and-maternal-genetic-parameters-for-growth-traits-in-jersey-crossbred-cattle.pdf). A forma matricial abaixo é a mesma da Eq. 1 de Phocas, Donoghue e Graser (2005, *Genet. Sel. Evol.* 37:361–380, [DOI 10.1186/1297-9686-37-5-361](https://doi.org/10.1186/1297-9686-37-5-361)), base do modelo do Interbeef **[conferido na fonte; conferido numericamente]**:

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

A fórmula da variância fenotípica merece atenção. As notas traziam **2σam**, mas a diagonal de V do exemplo mostra que, para um bezerro não endogâmico, o termo correto é **σam**, porque a covariância entre o efeito direto do bezerro e o materno da mãe é 0,5 × σam, e ela entra duas vezes **[conferido numericamente: var(y) = 385 pela matriz V e pela fórmula; derivação refeita na verificação de fontes]**.

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

A vaca 5 mostra como o modelo reparte a informação. O filho dela, o animal 6, pesou cerca de 17 kg acima da média do GC. O modelo atribui parte disso aos genes do bezerro (DEP direta de 6 = 1,75), parte à habilidade materna herdável da vaca (DEP materna = 0,64) e parte ao ambiente permanente, que não passa às filhas (p̂ = +1,50; para as vacas 2 e 3, p̂ = +0,64 e −0,95). O **total materno** (TMD), calculado como DEP materna + ½ DEP direta, é a convenção do BIF: "Total Maternal Weaning EPD = ½ Weaning Direct EPD + Milk EPD" ([BIF, Weaning Weight](https://guidelines.beefimprovement.org/index.php/Weaning_Weight)) **[conferido na fonte]**. A DEP materna do modelo direto-materno corresponde ao "leite" do BIF. Entre os índices brasileiros, o TMD entra no IQGg da Geneplus, e o iABCZ atual usa a DEP materna (PM-EM), sem TMD.

A covariância direto-materna é o parâmetro mais frágil do modelo, e os programas a tratam de modos opostos. A ANCP declara que "as covariâncias entre o efeito maternal e direto foram assumidas como zero" ([sumário 2026, PDF p. 104](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)). O American Angus zera a covariância depois de estimar os componentes, "to reduce computing costs" (Lourenco et al., *Proc. BIF* 2015, p. 86–87; Jang, Lourenco e Miller 2022, *J. Anim. Sci.* 100:skac057, [DOI 10.1093/jas/skac057](https://doi.org/10.1093/jas/skac057)). O Interbeef mantém covariâncias diferentes de zero **[conferido na fonte]**. Jang et al. (2022) mostram por que a escolha importa. No peso à desmama do Angus americano, incluir a interação touro × rebanho reduziu muito as variâncias direta e materna e trocou a correlação direto-materna de −0,38 para +0,12 (Tabela 2, REML) **[conferido na fonte]**. A correlação negativa da literatura pode ser, em parte, variância de touro × rebanho não modelada, e **fixar σam = 0 é uma simplificação operacional, não um achado biológico**. No exemplo, refeito com σam = 0 e as demais variâncias iguais, as DEPs mudam até 0,25 kg (direta) e 0,29 kg (materna). A maior mudança é a DEP materna do animal 6, que sobe de 0,28 para 0,57 kg: com covariância negativa, o desvio direto alto do animal puxava para baixo a predição do seu valor materno **[conferido numericamente]**. Os parâmetros do exemplo implicam ainda uma repetibilidade do peso à desmama de 0,21 entre filhos da mesma vaca com pais diferentes e de 0,27 entre irmãos completos, pela covariância A_ij·σ²a + σ²m + σam + σ²p dividida por σ²P **[conferido numericamente]**. Esse valor é retomado no MPPA.

Os parâmetros reais têm faixa estreita para o efeito direto e larga para a covariância. Para zebuínos, a meta-análise bayesiana de Giannotti (2004, [tese ESALQ/USP](https://teses.usp.br/teses/disponiveis/11/11139/tde-22112004-153644/publico/juliana.pdf)), com 186 artigos, dá para o peso à desmama h²d = 0,24, h²m = 0,13 e correlação direto-materna de −0,16 (Tabela 9, p. 57). Em Nelore, uma análise bayesiana bicaracterística com o escore de úbere, com 186.151 animais, estimou h²d = 0,13 e h²m = 0,11 (de Oliveira et al. 2021, *Livestock Science* 244:104400, [DOI 10.1016/j.livsci.2021.104400](https://www.sciencedirect.com/science/article/abs/pii/S1871141321000081)) **[conferido na fonte]**. A ABCZ publicou em 2016 h²d de 0,25 e h²m de 0,10 para o PD (página "Sumario-racas-NEL" do sumário Nelore de 2016, no portal abczstat.com.br, atualizada em 2022) **[conferido na fonte]**. Outro estudo mostrou que **r_am vai de −0,20 a +0,31** à medida que a proporção de mães com registro próprio sobe de 0% para 70%, e que os sinais negativos da literatura antiga podem vir da estrutura dos dados (Bignardi et al. 2024, *Livestock Science* 281:105425, [DOI 10.1016/j.livsci.2024.105425](https://www.sciencedirect.com/science/article/abs/pii/S1871141324000301)) **[conferido na fonte]**. Em bovinos comerciais da Nova Zelândia, h²d = 0,14 e h²m = 0,20 (Weik et al. 2021, *Animals* 11:2509, [DOI 10.3390/ani11092509](https://doi.org/10.3390/ani11092509)), e nos países do Interbeef as h² do peso à desmama vão de 0,11 a 0,36 (direta) e de 0,05 a 0,15 (materna) (Bonifazi 2022, [tese WUR, DOI 10.18174/572085](https://doi.org/10.18174/572085), PDF p. 34) **[conferido na fonte]**. No Angus australiano, a v1 trazia h²d de 0,35, 0,20, 0,24 e 0,25 (nascimento, desmama, sobreano e 600 dias) e h²m de 0,08, 0,09, 0,06 e 0,04 ([Livestock Production Science](https://www.sciencedirect.com/science/article/abs/pii/0301622695000836)) **[não verificado: resumo inacessível]**. Em Hereford mocho, a correlação genética entre peso materno à desmama e leite seria de cerca de 0,99 ([Kansas State, 1995](https://newprairiepress.org/kaesrr/vol0/iss1/639/)) **[não verificado: a URL devolve outro volume]**.

### Pesos depois da desmama: multicaracterística contra o viés de seleção

Quando só os animais bons à desmama chegam ao sobreano, uma análise univariada do sobreano ignora por que os outros saíram e fica viesada. A análise multicaracterística, que inclui os registros de desmama dos descartados, corrige o problema. Esse resultado é atribuído a Pollak, van der Werf e Quaas (1984, *J. Dairy Sci.* 67:1590–1595, [DOI 10.3168/jds.S0022-0302(84)81481-2](https://doi.org/10.3168/jds.S0022-0302(84)81481-2)) **[não verificado: conteúdo; texto bloqueado, metadados conferidos]**. A forma geral das MME com R⁻¹ e G⁻¹ está em Zhang et al. (2026, Eq. 2) **[conferido na fonte]**, e a versão multicaracterística abaixo foi **[conferida numericamente]**:

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

O animal 8 resume o argumento. A análise só com PS não sabe que ele foi descartado por ser leve; vê apenas que é filho do touro 4, que tem bom sobreano, e lhe dá EBV positivo. A análise bicaracterística usa o peso à desmama dele e a correlação genética de 0,70 e o coloca no negativo. Todas as acurácias sobem. A ANCP usa exatamente essa estrutura: DEPs de modelos uni e bicaracterística, "sendo que o peso aos 120 dias de idade foi a característica âncora" ([sumário 2026, PDF p. 104](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)) **[conferido na fonte]**.

### Escores e prenhez: modelo de limiar

Facilidade de parto, prenhez de novilha e escores de temperamento são categóricos. O modelo de limiar supõe uma variável latente contínua (liability) que só é observada pela categoria em que cai. A forma é a de Gianola e Foulley (1983, *Genet. Sel. Evol.* 15:201–224, eqs. 5 a 10, [DOI 10.1186/1297-9686-15-2-201](https://doi.org/10.1186/1297-9686-15-2-201)), que trabalharam com modelo de touro e moda a posteriori; o modelo animal é extensão posterior **[conferido na fonte]**:

```
l = X b + Z a + e,   e ~ N(0, 1)   (resíduo fixado em 1: "σ is not identifiable, it is taken as the unit of measurement")
y_i = k  se  τ(k−1) < l_i ≤ τ(k)
binário (y = 1 abaixo do limiar τ; y = 2 acima):
   P(y_i = 1) = Φ(τ − x_i'b − z_i'a)          P(y_i = 2) = 1 − Φ(τ − x_i'b − z_i'a) = Φ(x_i'b + z_i'a − τ)
h² latente = σ²a / (σ²a + 1)
h² na escala observada (Robertson, no apêndice de Dempster e Lerner 1950):  h²obs = h²lat · z² / [p(1 − p)]
   p = proporção de sucesso ; z = densidade normal no limiar
```

A v1 escrevia P(y_i = 1) = Φ(x_i'b + z_i'a − τ), o que, com as categorias definidas acima, troca o sinal: essa expressão é a probabilidade da categoria superior. A fórmula da mudança de escala está em Lynch e Walsh (1998, *Genetics and Analysis of Quantitative Traits*, cap. 25, eq. 25.8b), que a atribuem a Robertson, no apêndice de Dempster e Lerner (1950, *Genetics* 35:212–236) **[conferido na fonte secundária; o original não foi lido]**. A solução usa amostragem de Gibbs ou MME não lineares iteradas, que dão a moda a posteriori (Gianola e Foulley 1983) **[conferido na fonte]**. Na ANCP, as DEPs de facilidade de parto, mocho, 3P e STAY "utilizam modelo de limiar, e a interpretação dessas DEPs representa probabilidade de sucesso"; saem do cBLUPF90+90iod2OMP1 ([sumário 2026, PDF p. 104](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)) **[conferido na fonte]**.

A mudança de escala explica boa parte da dispersão da literatura. Com h² latente de 0,50, a h² observada cai para **0,318 quando a prenhez é de 50%** e para **0,288 quando é de 30%** **[conferido numericamente; números refeitos na verificação]**. Isso ajuda a entender a distância entre duas estimativas para a prenhez de novilhas Nelore aos 14 meses. Eler et al. (2002, *J. Anim. Sci.* 80:951–954, [PubMed 12002332](https://pubmed.ncbi.nlm.nih.gov/12002332/)) obtiveram h² de 0,57 pelo Método R, na escala binária observada, com 11.487 novilhas **[conferido na fonte]**. Peripolli et al. (2024, *Livestock Science* 289:105582, [DOI 10.1016/j.livsci.2024.105582](https://www.sciencedirect.com/science/article/abs/pii/S1871141324001884)) teriam obtido 0,18 por limiar univariado em outro conjunto **[não verificado: o valor não pôde ser lido]**. O ambiente também pesa: a h² da prenhez cai de 0,17 com índice de temperatura e umidade de 82,5 para 0,01 com 88 (Santana et al. 2018, *Livestock Science* 218:101–107, [DOI 10.1016/j.livsci.2018.10.015](https://www.sciencedirect.com/science/article/abs/pii/S1871141318305778)) **[conferido na fonte]**. A correlação genética entre prenhez precoce e idade ao primeiro parto é de cerca de −0,85 (atribuição a confirmar, [CorrDB](https://www.animalgenome.org/CorrDB/references/25023297.pdf)), de modo que as duas medem quase a mesma coisa.

Para facilidade de parto, o modelo pai–avô materno (sire-MGS) separa o efeito direto do touro do efeito materno vindo pelo avô materno. O USDA o implantou em leite em 2003 (Van Tassell, Wiggans e Misztal 2003, *J. Dairy Sci.* 86:3366–3373; componentes em Wiggans, Misztal e Van Tassell 2003, *J. Dairy Sci.* 86:1845–1848, [USDA-AIPL](https://aipl.arsusda.gov/publish/jds/2003/abs86_1845.html)) **[conferido na fonte: títulos e metadados]**. Em 39.664 novilhas Nelore da ANCP, a h² direta ficou entre 0,11 e 0,24 e a materna entre 0,09 e 0,11, conforme o modelo (da Silva Oliveira et al. 2025, *J. Anim. Breed. Genet.* 142:643–651, [PubMed 40035329](https://pubmed.ncbi.nlm.nih.gov/40035329/)) **[conferido na fonte]**. Outro estudo, com só 1.277 registros e modelo de limiar pai–avô materno, fixou a covariância direta-materna em zero e obteve h² direta de 0,18 e materna de 0,39 (Silva et al. 2020, *Livestock Science* 240:104183, [DOI 10.1016/j.livsci.2020.104183](https://sciencedirect.com/science/article/abs/pii/S1871141320302249?via=ihub%3D)) **[conferido na fonte]**. A estrutura imposta e a amostra pequena podem inflar o componente materno **[inferência]**. No temperamento de Nelore, os modelos linear e de limiar deram h² de 0,21 e 0,26 e valores genéticos com correlação acima de 0,92 (Lucena et al. 2015, *Animal* 9:388–394, [DOI 10.1017/S1751731114002572](https://doaj.org/article/8a3427b23f8846989d53122c7ea7e792)) **[conferido na fonte]**: para ranquear, o modelo linear quase basta.

### Permanência e longevidade: limiar binário ou modelo de sobrevivência

A ANCP define a STAY como a "porcentagem de fêmeas que permaneceram até 76 meses de idade no rebanho, parindo pelo menos 3 vezes" ([sumário 2026, PDF p. 106](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)). A mesma definição é usada por Costa et al. (2020, *Anim. Reprod. Sci.* 214:106305, [PubMed 32087916](https://pubmed.ncbi.nlm.nih.gov/32087916/)), e a ABCZ fala em três crias viáveis até 76 meses **[conferido na fonte]**. Tratada como binária, a STAY entra num modelo de limiar como o anterior, e é assim na ANCP e na ABCZ, que usa limiar unicaracterístico. Em Nelore, Costa et al. (2020) estimaram h² de 0,09 com modelo limiar-linear **[conferido na fonte]**. A v1 trazia ainda 0,117 (STAY5), 0,122 (STAY6) e 0,171 (STAY7) (Silva et al. 2003, *Livest. Prod. Sci.* 79:97–101, [DOI 10.1016/S0301-6226(02)00149-5](https://www.sciencedirect.com/science/article/abs/pii/S0301622602001495)) **[não verificado: resumo inacessível]**. Em duas populações americanas, Snelling, Golden e Bourdon (1995) obtiveram 0,11 e 0,14 para S(5|1) com modelos mistos não lineares. Conforme a definição, de S(2|1) a S(11|1), as estimativas vão de 0,02 a 0,20 ([USDA-ARS](https://ars.usda.gov/arsuserfiles/30300000/Publications/JAS73-993-1001Snelling.pdf)) **[conferido na fonte]**. A alternativa é modelar o tempo até o descarte, aproveitando vacas ainda vivas como registros censurados, com um modelo de riscos proporcionais de Weibull **[não verificado na fonte]**:

```
h(t | x, u) = h₀(t) · exp(x'β + z'u),    h₀(t) = λ ρ (λ t)^(ρ − 1)
u ~ N(0, A σ²u)  (fragilidade genética) ; vaca viva entra com o tempo até a última observação (censura)
```

O programa Survival Kit implementa esses modelos com efeitos aleatórios correlacionados ([AGRIS](https://agris.fao.org/search/fr/records/669e83b900eb85b7d72c0ca4)). A escala volta a importar: para idade à primeira concepção em Nelore, um modelo Weibull deu h² de 0,51 na escala logarítmica e de 0,76 na original (Pereira et al. 2006, *J. Anim. Breed. Genet.* 123:64–71, [DOI 10.1111/j.1439-0388.2006.00567.x](https://onlinelibrary.wiley.com/doi/10.1111/j.1439-0388.2006.00567.x)) **[conferido na fonte]**. A ANCP estuda uma característica de longevidade por análise de sobrevivência, ainda fora do sumário, e relata que critérios mais consistentes de GC elevam a herdabilidade estimada ([sumário 2026, PDF p. 87](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)).

### Pesagens seriadas: regressão aleatória e curvas de crescimento

A regressão aleatória (RR) modela a trajetória genética de cada animal como uma função contínua da idade, em vez de tratar cada peso-padrão como característica separada. A referência clássica é Schaeffer (2004, *Livest. Prod. Sci.* 86:35–45, [DOI 10.1016/S0301-6226(03)00151-9](https://doi.org/10.1016/S0301-6226(03)00151-9)) **[acesso pago; aguardando PDF; forma conferida numericamente]**:

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

A correlação genética implícita entre 210 e 450 dias é de 0,81. Em Nelore, com 87.712 pesagens de 8.144 fêmeas, Boligon et al. (2011, *Genet. Mol. Res.* 10:1227–1236, [PubMed 21732287](https://pubmed.ncbi.nlm.nih.gov/21732287)) usaram ordens 4 (direto), 6 (ambiente permanente) e 3 (materno) e obtiveram valores genéticos mais acurados que os do modelo multicaracterística **[conferido na fonte]**. No Pantanal, os autores alertam que os polinômios de Legendre se comportam mal nas idades extremas ([Animals 2024](https://www.mdpi.com/2306-7381/11/7/318)). As curvas não lineares, como Brody W(t) = A(1 − Be^(−Kt)), Gompertz e von Bertalanffy, descrevem o animal por peso adulto (A) e taxa de maturidade (K). A Brody teve o melhor ajuste em Nelore ([PMC9817709](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9817709/)), e em Nelore Mocho a h² foi de cerca de 0,11 para A e 0,30 para K ([ResearchGate](https://www.researchgate.net/publication/360854328_Fit_and_genetic_parameters_of_the_growth_curve_of_Polled_Nellore_cattle)).

### Eficiência, carcaça, cruzamentos: o que muda no modelo

O consumo alimentar residual (RFI) é o resíduo, dentro do GC, da regressão do consumo de matéria seca sobre o ganho médio diário e o peso metabólico, CMS = β₀ + β₁·GMD + β₂·PM^0,75 + RFI. Essa é a definição clássica atribuída a Koch et al. (1963), mas a especificação usada por Sainz et al. (2024, *J. Anim. Breed. Genet.* 141:643–655, [JBG](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12870)) não foi lida **[não verificado]**. Nesse estudo, com 4.381 Nelores de 41 provas, a h² do RFI foi de 0,19, e Olivieri et al. (2016, [PLoS ONE 11:e0164390](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0164390)) obtiveram 0,18 ± 0,05 **[conferido na fonte]**. O RFI entra depois num modelo animal comum. Em Angus australiano, sua correlação genética com o ganho é próxima de zero ([ResearchGate](https://www.researchgate.net/publication/327026824_Genetic_and_phenotypic_associations_of_feed_efficiency_with_growth_and_carcass_traits_in_Australian_Angus_cattle)), o que permite selecionar eficiência sem frear o crescimento. As medidas de carcaça por ultrassom usam o modelo animal com idade ou peso ao escaneamento como covariável. Em Nelore com medidas repetidas, a h² da AOL foi de 0,33 a 0,46 (Pinheiro et al. 2011, *Genet. Mol. Res.* 10:2944–2952, [PubMed 22179966](https://pubmed.ncbi.nlm.nih.gov/22179966)) **[conferido na fonte]**. O Montana Tropical tem, por pedigree, 20,8% de zebu, 50,5% de taurino adaptado, 21,1% de britânico e 7,6% de continental; a ancestralidade genômica estimada foi de 24% zebu e 62% taurina (dos Santos et al. 2026, *J. Anim. Breed. Genet.* 143:273–282, [PMC12887133](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887133/)) **[conferido na fonte]**. Em compostos assim, o modelo acrescenta covariáveis de composição racial, heterozigose e recombinação, y = Xb + Za + Σ c_k·f_k + δH + e **[não verificado]**. Os modelos genômicos que incluem essas fontes deram os componentes de variância mais robustos; a heterose melhorou o ajuste, e a recombinação teve efeito mínimo nas variâncias (Medeiros et al. 2026, [Genes 17:173](https://doi.org/10.3390/genes17020173)) **[conferido na fonte]**.

A tabela reúne as herdabilidades conferidas nas fontes, com o que ficou sem confirmação marcado. As faixas misturam escalas e modelos, então servem como ordem de grandeza e como valores iniciais, não como constantes.

| Característica | Nelore/zebu | Taurinos | Fontes principais |
|---|---|---|---|
| Peso à desmama, direto | 0,13–0,25 (meta-análise: 0,24) | 0,11–0,36 | de Oliveira et al. 2021 (*Livest. Sci.*); ABCZ 2016; Giannotti 2004; Bonifazi 2022 (Interbeef); Weik et al. 2021 (0,14) |
| Peso à desmama, materno | 0,10–0,13 | 0,05–0,20 | de Oliveira et al. 2021 (0,11); ABCZ 2016 (0,10); Giannotti 2004 (0,13); Bonifazi 2022 (0,05–0,15); Weik et al. 2021 (0,20) |
| Pesos de 365 a 550 dias | 0,28–0,33 (0,53–0,58 em amostra pequena) | 0,24–0,25 **[não verificado]** | Giannotti 2004 (0,28 e 0,33); ABCZ 2016 (PA 0,31; PS 0,33); D Suze et al. 2026 ([PMC13469195](https://pmc.ncbi.nlm.nih.gov/articles/PMC13469195/), centenas de registros); [LPS](https://www.sciencedirect.com/science/article/abs/pii/0301622695000836) (taurinos) |
| Facilidade de parto direta / materna | 0,11–0,24 / 0,09–0,39 | não localizado em corte | da Silva Oliveira et al. 2025; Silva et al. 2020 (0,39 com covariância fixada em zero) |
| Prenhez de novilha | 0,18 **[não verificado]** a 0,57 (escala observada) | não localizado | Eler et al. 2002; Peripolli et al. 2024 (*Livest. Sci.*) |
| Permanência (STAY) | 0,09–0,13 (0,12–0,17 **[não verificado]**) | 0,02–0,20, conforme a definição (0,11–0,14 para S(5\|1)) | Costa et al. 2020; ABCZ 2016; Silva et al. 2003; Snelling et al. 1995 |
| Perímetro escrotal | 0,29–0,41 | não localizado | Costa et al. 2020 (PE365, 0,29); ABCZ 2016 (PE365 0,41; PE450 0,39) |
| Idade ao primeiro parto | 0,08–0,15 (0,00–0,36 conforme o conjunto de dados) | não localizado | Costa et al. 2020 (0,08); ABCZ 2016 (0,11); Rojas de Oliveira et al. 2018 (0,15; acesso pago); Dias et al. 2004 |
| AOL / gordura subcutânea | 0,33–0,46 / 0,20–0,51 **[não verificado]** | 0,32 / 0,33–0,34 **[não verificado]** | Pinheiro et al. 2011; [SASAS](https://www.sasas.co.za/?p=4581) |
| RFI | 0,18–0,19 | não localizado (o 0,43 do resumo de Olivieri é h² do ganho) | Olivieri et al. 2016; Sainz et al. 2024 |
| Temperamento | 0,21–0,26 (faixa de 0,15–0,35 **[não verificado]**) | não localizado | Lucena et al. 2015; [UNESP](https://acervodigital.unesp.br/handle/11449/92569) |

A meta-análise de Rojas de Oliveira et al. (2018, *Anim. Prod. Sci.* 58:1575–1583, publicada online em 2017, [DOI 10.1071/AN16712](https://www.publish.csiro.au/an/AN16712)), com 197 herdabilidades de 62 publicações de Nelore, resume o padrão segundo o resumo lido na v1. Os valores são h² direta de 0,20 a 0,40 para a maior parte das características, inclusive carcaça; cerca de 0,15 para idade ao primeiro parto; acima de 0,40 para perímetro escrotal e peso aos 450 dias; e h² materna de crescimento entre 0,06 e 0,11 **[acesso pago; aguardando PDF]**. A meta-análise aberta de Giannotti (2004) cobre só crescimento em zebuínos e é a fonte usada adiante para fixar parâmetros.

## A genômica entra trocando a matriz de parentesco

### GBLUP e SNP-BLUP são o mesmo modelo

Com genótipos de SNPs, o parentesco esperado pelo pedigree é substituído pelo parentesco realizado. A forma é a de VanRaden (2008, *J. Dairy Sci.* 91:4414–4423), cujo texto original não pôde ser lido. Ela foi conferida em três artigos abertos que a reproduzem: Aguilar et al. (2010, *J. Dairy Sci.* 93:743, p. 745, [DOI 10.3168/jds.2009-2730](https://doi.org/10.3168/jds.2009-2730)), Legarra, Aguilar e Misztal (2009, *J. Dairy Sci.* 92:4656, p. 4657, [DOI 10.3168/jds.2009-2061](https://doi.org/10.3168/jds.2009-2061)) e Lourenco et al. (2020, Eqs. 1 e 11) **[conferido na fonte; equivalência conferida numericamente]**:

```
M   matriz n×m de genótipos (0, 1, 2 cópias do alelo contado) ;  p_j = frequência do alelo
Z = M − 2p'   (centrado por coluna)
G = Z Z' / [2 Σj p_j (1 − p_j)]

GBLUP:     y = Xb + Wg + e,  var(g) = G σ²a        → MME com G⁻¹ no lugar de A⁻¹
SNP-BLUP:  y = Xb + WZα + e, var(α) = I σ²α,  σ²α = σ²a / [2 Σ p(1 − p)]    → ĝ = Zα̂
```

Nos quatro genotipados com registro do exemplo (animais 4 a 7), as duas formas deram os mesmos valores genômicos (+1,78; −1,90; +1,25; −1,84), com diferença de 2 × 10⁻¹⁵ **[conferido numericamente]**. Isso explica a escolha computacional: "SNP-BLUP ... and GBLUP are equivalent models (VanRaden 2008) but they differ in computing cost" (Misztal 2016, *Genetics* 202:401) **[conferido na fonte]**. O GBLUP resolve uma equação por animal genotipado, e o SNP-BLUP, uma por marcador. A acurácia, porém, depende de como a variância é distribuída entre marcadores. Na simulação de Meuwissen, Hayes e Goddard (2001, *Genetics* 157:1819–1829, [DOI 10.1093/genetics/157.4.1819](https://doi.org/10.1093/genetics/157.4.1819)), a acurácia em descendentes foi de **0,73 com BLUP de variância igual por segmento de 1 cM, 0,85 com métodos bayesianos que dão a cada segmento uma variância com distribuição a priori** e só 0,32 com mínimos quadrados **[conferido na fonte: resumo]**.

### Métodos bayesianos: quando vale pagar o custo

Os métodos bayesianos dão a cada marcador uma variância própria ou uma probabilidade de efeito nulo. Habier et al. (2011, [BMC Bioinformatics 12:186](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-12-186)) descrevem a família **[conferido na fonte]**:
- **BayesA**: π = 0, de modo que todos os SNPs têm efeito, cada um com variância própria (priori t).
- **BayesB**: mistura em que uma fração π fixada pelo analista tem efeito zero (π = 0,99 no artigo).
- **BayesCπ**: estima π, com priori uniforme(0,1), e os SNPs com efeito compartilham uma variância comum.

O BayesR usa uma mistura de normais com um componente de variância zero **[não verificado]**. Em Jersey, a acurácia passou de 0,43 para 0,52 ao combinar o BayesR com uma referência multirracial e um painel de 58.532 SNPs (Erbe et al. 2012, [J. Dairy Sci. 95:4114](https://www.journalofdairyscience.org/article/S0022-0302(12)00391-8/pdf)); só a troca do GBLUP pelo BayesR rendeu cerca de 0,05 **[conferido na fonte]**. O custo é alto, e a versão emBayesR é até 8 vezes mais rápida com acurácia cerca de 0,5% menor (Wang et al. 2015, GSE 47:34, [PubMed 25926276](https://pubmed.ncbi.nlm.nih.gov/25926276)) **[conferido na fonte]**. As fontes não mostram vantagem consistente dos métodos bayesianos em predição dentro de raça com N muito grande em corte. Em Nelore, a ponderação de SNPs (ssGBLUP ponderado) trouxe ganhos limitados para AOL (Silva Neto et al. 2023, *Anim. Genet.* 54:271–283, [Wiley](https://onlinelibrary.wiley.com/doi/abs/10.1111/age.13310)) **[conferido na fonte]** e não melhorou a acurácia de lucratividade ([PMC12887148](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12887148/)). Na American Hereford Association, o BOLT permite que alguns marcadores tenham efeitos maiores ([UNL](https://newsroom.unl.edu/announce/beef/7498/43074)) **[conferido na fonte]**.

### ssGBLUP: um só sistema para genotipados e não genotipados

O multi-step antigo usava DEPs "deregressadas" como pseudofenótipos. Garrick, Taylor e Fernando (2009, [GSE 41:55](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-41-55)) propuseram desregredir por EBV/r², com o EBV sem a informação dos pais, e ponderar cada registro por w_i = (1 − h²)/{[c + (1 − r²_i)/r²_i]·h²}, em que c é a fração da variância genética não explicada pelos marcadores (Eq. 10) **[conferido na fonte]**. Os resultados foram mistos. Foi o pior método num estudo de leite ([ResearchGate](https://www.researchgate.net/publication/323417802_Comparing_deregression_methods_for_genomic_prediction_of_test-day_traits_in_dairy_cattle)). Em suínos, deu confiabilidades de 18% a 39% maiores que as obtidas com o EBV como variável resposta (Ostersen et al. 2011, GSE 43:38, [PubMed 22070746](https://pubmed.ncbi.nlm.nih.gov/22070746/)) **[conferido na fonte]**. O single-step substituiu esse caminho. Ele põe na mesma matriz H o pedigree de todos e o genoma dos genotipados, e H⁻¹ tem forma esparsa simples. A H explícita é de Legarra, Aguilar e Misztal (2009, Eq. 4), que não deram a inversa. A inversa simples é de Aguilar et al. (2010, p. 745 e Apêndice A), obtida de forma independente por Christensen e Lund (2010, *Genet. Sel. Evol.* 42:2, [DOI 10.1186/1297-9686-42-2](https://doi.org/10.1186/1297-9686-42-2)) **[conferido na fonte; forma conferida numericamente]**:

```
H⁻¹ = A⁻¹ + [ 0        0          ]
            [ 0   G_w⁻¹ − A₂₂⁻¹   ]       (bloco inferior = animais genotipados)

H (forma explícita):
H₁₁ = A₁₁ + A₁₂A₂₂⁻¹(G_w − A₂₂)A₂₂⁻¹A₂₁ ;  H₁₂ = A₁₂A₂₂⁻¹G_w ;  H₂₂ = G_w

ajustes usuais:
  G* = α + βG        α e β igualam a média da diagonal e a média geral de G às de A₂₂
                     (Christensen et al. 2012; Gao et al. 2012; VanRaden 2008 sugeriu mínimos quadrados)
  G_w = 0,95 G* + 0,05 A₂₂     mistura atribuída a VanRaden (2008) por Aguilar et al. (2010);
                     forma geral G_w = (1 − w)G + wA₂₂, com w pequeno fixo ou estimado (Christensen e Lund 2010)
```

As autorias dos ajustes vêm das próprias fontes **[conferido na fonte]**. Aguilar et al. (2010) usaram "a weighted G as proposed by VanRaden (2008): G = 0.95Gb + 0.05A22", e acrescentaram que os pesos "were not critical". Christensen e Lund (2010) escrevem G_w = (1 − w)G + wA (com os genotipados no bloco 1) e usaram w = 0,01 na simulação. Christensen (2012, GSE 44:37) atribui a forma α + βG a VanRaden (2008), por mínimos quadrados, e a Christensen et al. (2012) e Gao et al. (2012), igualando médias. A ordem usada no exemplo, escalar e depois misturar, é escolha de implementação. Os 0,95 e 0,05 são prática do BLUPF90, não valor teórico.

As duas revisões abertas que descrevem o ssGBLUP como a ANCP o roda são Lourenco et al. (2020, *Genes* 11:790) e Misztal, Lourenco e Legarra (2020, *J. Anim. Sci.* 98:skaa101, [DOI 10.1093/jas/skaa101](https://doi.org/10.1093/jas/skaa101)). Delas vêm quatro detalhes que o exemplo não mostra. As equações abaixo seguem a numeração de Lourenco et al. (2020) **[conferido na fonte]**:

```
(13)  G = αG + (1 − α)A22             α = 0,95 por padrão no BLUPF90 ("can vary from 99 to 80%, or even to 50%")
(37)  ρ = (1/n²) ( Σ_i Σ_j A22_ij − Σ_i Σ_j G_ij )
(38)  G* = (1 − ρ/2) G + 11′ρ          ajuste de Vitezica et al. (opção tunedG 4 do BLUPF90)
(39)  H⁻¹ = A⁻¹ + [ 0  0 ; 0  τG⁻¹ − ωA22⁻¹ ]          padrão τ = ω = 1
(55)  H^{−1*} = A^{−1*} + [ 0  0  0 ; 0  G⁻¹ − A22⁻¹  −(G⁻¹ − A22⁻¹)Q2 ; 0  −Q2′(G⁻¹ − A22⁻¹)  Q2′(G⁻¹ − A22⁻¹)Q2 ]
                                        grupos de pais desconhecidos (UPG) dentro de H⁻¹; Q2 = contribuições dos UPG aos genotipados
(56)  H^{Γ−1} = A^{Γ−1} + [ 0  0 ; 0  G⁻¹ − A22^{Γ−1} ]      metafundadores; Γ = relações entre metafundadores
```

- **Escala de G.** O padrão do BLUPF90 é o de Chen et al. (2011, *J. Anim. Sci.* 89:2673): G* = φG + δ, com φ e δ que igualam a média da diagonal e a dos elementos fora da diagonal de G às de A₂₂; dos quatro ajustes implementados, os tipos 2 e 4 são os mais usados. Igualar a média da diagonal e a média geral equivale a igualar a média da diagonal e a dos elementos fora dela. Por isso a forma de Chen et al. e a de Christensen et al. e Gao et al. dão o mesmo α e β, e no exemplo ambas dão 0,57 e 0,83 **[conferido numericamente]**. Qual dos ajustes a ANCP usa não está no sumário.
- **ω e τ.** O ω "compensates for incomplete pedigree and incomplete accounting of inbreeding" (Misztal et al. 2020). Foi usado em 0,7 nas avaliações de corte e leite até cerca de 2016 e deixou de ser tão necessário quando a endogamia passou a entrar em A⁻¹ (Lourenco et al. 2020).
- **UPG e metafundadores.** Lourenco et al. (2020) descrevem os metafundadores de Legarra et al. (2015, *Genetics* 200:455–468, [DOI 10.1534/genetics.115.177014](https://doi.org/10.1534/genetics.115.177014), só resumo lido) como UPG "inbred and related". Segundo o resumo de Legarra et al., eles tornam G e A compatíveis, e Misztal et al. (2020) os apresentam como solução para ssGBLUP em raças puras e cruzadas. A ANCP os usa, um por raça, na avaliação multirracial de Guzerá, Brahman e Tabapuã ([sumário 2026, PDF p. 104](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)).
- **Erro numa revisão recente.** A revisão de Zhang et al. (2026, [PMC13449407](https://pmc.ncbi.nlm.nih.gov/articles/PMC13449407/)) imprime a Eq. 7 com A₂₂ sem inverso antes de G no bloco H₁₁ (A₁₂A₂₂GA₂₂⁻¹A₂₁). A forma correta é a de Legarra et al. (2009), Lourenco et al. (2020, Eq. 30) e Misztal et al. (2020), e a Eq. 7 de Zhang não deve ser copiada. A Eq. 4 da mesma revisão usa "g" para os efeitos fixos, o que conflita com o g genômico da Eq. 5.

O passo a passo do exemplo genotipa os animais 1, 4, 5, 6 e 7 em 31 SNPs polimórficos:

```
animal 1: 1112211011110212210111202111201
animal 4: 1112111000010112111122202110110
animal 5: 0111211112101111201100111121200
animal 6: 1002111011111101211111101121100
animal 7: 0202112001101101201112112110100
```

O primeiro passo calcula p por SNP e monta G. Como p veio dos próprios genotipados, G tem média geral 0 e é singular (posto 4 para 5 animais), enquanto A₂₂ tem média 0,57, porque esses animais são parentes. Essa incompatibilidade de escala é o problema que o ajuste de G a A₂₂ e os metafundadores resolvem (Legarra et al. 2015) **[conferido na fonte: resumo]**. O segundo passo ajusta G* = 0,57 + 0,83·G para igualar médias da diagonal e do total às de A₂₂. O terceiro mistura G_w = 0,95G* + 0,05A₂₂, o que torna a matriz inversível. O quarto monta H⁻¹ pela fórmula esparsa. Ela coincide com a inversa da H explícita, com diferença de 1 × 10⁻¹⁵, como prevê o Apêndice A de Aguilar et al. (2010), em que H⁻¹H = I. O quinto resolve as mesmas MME do Passo 2 com λH⁻¹ no lugar de λA⁻¹. O genoma revela a amostragem mendeliana: os meios-irmãos 4 e 5, com parentesco esperado de 0,25, têm parentesco realizado de 0,15.

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

O exemplo mostra a mecânica, não o ganho. Com 31 SNPs, G é quase só ruído, e a acurácia de alguns animais até cai. Os painéis reais vão de cerca de 30 mil SNPs (ZL5, usado pela ANCP) a 777 mil (BovineHD) ([Seminário ANCP 2018](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil)), e o Angus GS usa 40 mil ([Angus GS FAQ](https://www.angus.org/pub/adv/AngusGS-FAQ.pdf)) **[não verificado: fontes bloqueadas]**. Para zebuínos, há painéis próprios **[conferido na fonte]**: Clarifide Nellore 2.0 (cerca de 12 mil SNPs), Clarifide Nellore 3.1 (mais de 29 mil), GGP Indicus 75K (cerca de 74,7 mil) e Super GGP Indicus 20K (cerca de 18,9 mil). Em geral, a referência usa o painel denso e os candidatos um painel menor, com imputação. Painéis desenhados para taurinos geram homozigose artificial em zebuínos, e o Bovine SNP50 foi insuficiente para predição acurada em Bos indicus (Ogunbawo et al. 2024, *Genes* 15:1495, [DOI 10.3390/genes15121495](https://doi.org/10.3390/genes15121495)). O ssGBLUP também gera, como subproduto, o ssGWAS. Os efeitos de SNP são retrocalculados e testados SNP a SNP, com p-valores calculados a partir das variâncias do erro de predição (Aguilar et al. 2019, [GSE 51:28](https://gsejournal.biomedcentral.com/articles/10.1186/s12711-019-0469-3), peso ao nascer na Angus americana) **[conferido na fonte]**. O mesmo artigo critica a escolha de "janelas" de SNPs adjacentes, arbitrária e sem consenso na literatura; a v1 atribuía a ele, por engano, janelas de 20 SNPs.

### APY: como inverter G com um milhão de genotipados

Inverter G custa o cubo do número de genotipados. O APY divide os genotipados em núcleo (c) e não núcleo (n) e supõe que os não núcleo dependem só do núcleo. O nome (algorithm for proven and young) e a primeira forma, com animais provados e jovens, são de Misztal, Legarra e Aguilar (2014, *J. Dairy Sci.* 97:3943, [DOI 10.3168/jds.2013-7752](https://doi.org/10.3168/jds.2013-7752)). A notação núcleo/não núcleo e a teoria vêm de Misztal (2016, *Genetics* 202:401, [DOI 10.1534/genetics.115.182089](https://doi.org/10.1534/genetics.115.182089)), e a forma abaixo é a Eq. 53 de Lourenco et al. (2020) **[conferido na fonte; conferido numericamente nos casos abaixo]**:

```
G_APY⁻¹ = [ G_cc⁻¹  0 ]  +  [ −G_cc⁻¹ G_cn ] M_nn⁻¹ [ −G_nc G_cc⁻¹   I ]
          [ 0       0 ]     [       I      ]
M_nn = diag{ g_ii − g_ic G_cc⁻¹ g_ci }      (custo: inverter só G_cc e uma diagonal)
```

Com um só animal fora do núcleo, a fórmula reproduz a inversa exata (diferença de 3 × 10⁻¹⁶). Com núcleo de 2 e 3 animais fora, a diferença chega a 0,745, porque um núcleo minúsculo não captura a dimensão de G. Daí a regra prática: o núcleo deve ter tantos animais quanto os autovalores que explicam cerca de 98% da variância de G. O critério empírico de 98% é de Pocrnic et al. (2016, GSE 48:82, [PMC5088690](https://pmc.ncbi.nlm.nih.gov/articles/PMC5088690/)); Misztal (2016) fala em 98% a 99%. Em Angus, isso dá **cerca de 10,6 mil animais** com 81 mil genotipados e 38 mil SNPs (Pocrnic et al. 2016, Tabela 1) e **13 mil** numa base de cerca de 509 mil genotipados (Misztal, Tsuruta, Pocrnic e Lourenco 2020, *J. Anim. Sci.* 98:skaa374, [PMC7739885](https://pmc.ncbi.nlm.nih.gov/articles/PMC7739885)). Em todas as espécies estudadas por Pocrnic et al., o APY precisou de menos de 15 mil animais de núcleo, e núcleos maiores elevam o custo sem ganho de acurácia **[conferido na fonte]**. A rotina do American Angus usa 19.019 animais de núcleo (Jang et al. 2022) **[conferido na fonte]**. Para quem pensa em rodar o APY por conta própria, há um aviso prático: as sub-rotinas que montam G_APY⁻¹ e uma A₂₂⁻¹ eficiente "are not implemented in the free distribution of BLUPF90 family of programs" (Lourenco et al. 2020) **[conferido na fonte]**. Lourenco et al. (2015, *J. Anim. Sci.* 93:2653–2662, [PubMed 26115253](https://pubmed.ncbi.nlm.nih.gov/26115253)) testaram o ssGBLUP na Angus americana com mais de 6 milhões de registros e até 51.883 genotipados **[conferido na fonte]**. Foi um estudo de validação; a avaliação de produção começou em 2017.

### Validação e tamanho da população de referência

O método LR (Legarra e Reverter 2018, [GSE 50:53](https://link.springer.com/content/pdf/10.1186/s12711-018-0426-6.pdf), com errata em GSE 51:69, 2019) compara predições feitas com dados parciais e completos para estimar viés, dispersão e acurácia **[conferido na fonte]**. O método LR supõe que o modelo ajustado esteja correto. Já a validação cruzada clássica não se aplica a modelos complexos, como regressão aleatória e efeitos maternos, nem a características indiretas ou de h² baixa, e o LR foi proposto justamente para esses casos. Yu, Fernando e Dekkers (2024, [Front. Genet. 15:1380643](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2024.1380643/full)), um artigo de pesquisa, provaram a validade do LR também para preditores não lineares **[conferido na fonte]**. A v1 invertia essa limitação e chamava o artigo de revisão. Misztal et al. (2020) resumem: "The advantage of method LR is the ability to support any model and any data structure". Numa aplicação a produção de leite e tolerância ao calor em Holandês na Tailândia, estudo de gado de leite, o viés e a dispersão foram de 0,44 e 0,84 no BLUP e de −0,04 e 1,06 no ssGBLUP (Sungkhapreecha et al. 2021, [PMC8829417](https://pmc.ncbi.nlm.nih.gov/articles/PMC8829417/)) **[conferido na fonte]**.

O tamanho da referência explica por que uma fazenda não monta sozinha uma predição genômica. Daetwyler, Villanueva e Woolliams (2008, *PLoS ONE* 3:e3395, Eq. 1, [DOI 10.1371/journal.pone.0003395](https://doi.org/10.1371/journal.pone.0003395)) derivaram a acurácia r (correlação entre valor genético verdadeiro e predito) como r = √[N h²/(N h² + n_G)] **[conferido na fonte]**. Nessa fórmula, n_G é o número de locos, interpretável como número de segmentos cromossômicos independentes, que é o M_e da notação de Daetwyler et al. (2010). O resultado é um limite superior de acurácia. Com h² = 0,30 e M_e = 5.000 (valor ilustrativo), seriam precisos **pelo menos cerca de 5.600 animais com fenótipo e genótipo para r = 0,50 e 16 mil para r = 0,70** **[conferido numericamente]**.

Os resultados brasileiros publicados vão na mesma direção. Com dados da ANCP de quatro raças zebuínas, a acurácia LR do ssGBLUP multirracial com metafundadores foi de 0,54 (Tabapuã) a 0,77 (Nelore) no peso aos 210 dias. Juntar as raças elevou a acurácia das menores, com algum viés quando faltavam genotipados com fenótipo (Londoño-Gil et al. 2025, *J. Anim. Breed. Genet.* 142:43–56, [DOI 10.1111/jbg.12882](https://doi.org/10.1111/jbg.12882)) **[conferido na fonte]**. A ANCP informa "capacidade preditiva do genótipo" acima de 0,90 para AOL e acabamento, acima de 0,80 para crescimento e reprodução e acima de 0,60 para eficiência alimentar ([sumário 2025, PDF p. 134](https://www.ancp.org.br/app/assets/sumario-ANCP-2025-v2.pdf)). A ANCP obteve acurácias perto de 0,4 para IPP e MP120 na validação de 2018 ([Seminário 2018](https://www.slideshare.net/ANCP/seminrio-ancp-2018-calibrao-e-validao-de-deps-genmicas-clarified-nelore-v31-e-resultados-preliminares-da-implementao-do-mtodo-de-passo-nico-blup-genmico-no-programa-nelore-brasil)). Em rebanhos comerciais, a acurácia de IPP subiu de cerca de 0,28 com dados só comerciais para cerca de 0,41 com animais registrados na referência ([Seminário 2019](https://www.slideshare.net/slideshow/seminrio-ancp-2019-avaliao-genmica-em-rebanhos-comerciais-avanos-lies-e-oportunidades/145292320)) **[não verificado: slides não legíveis]**. Em Nelore, o ssGBLUP, comparado ao BLUP, elevou a acurácia de marmoreio de 0,09 para 0,63 com 7.769 genotipados (Silva Neto et al. 2023) **[conferido na fonte]**. Na Conexão Delta G, a acurácia de touros jovens sem progênie teria subido de cerca de 50% para cerca de 70% com genômica ([CompreRural](https://www.comprerural.com/conexao-delta-g-amplia-acuracia-de-animais-em-catalogo)) **[não verificado]**. Ali a DEP genômica vem de GBLUP em duas etapas, e não do single-step. Nos EUA, um painel genômico equivale a 25 ou mais progênies para peso à desmama na tabela da American Salers ([ASA](https://www.salersusa.org/tools-and-resources/national-cattle-evaluation/genomically-enhanced-epds/)) e a 27 na da American Angus Association, reproduzida pela Penn State ([Penn State](https://extension.psu.edu/understanding-epds-and-genomic-testing-in-beef-cattle)) **[conferido na fonte]**. São equivalentes por característica e por raça, não valores universais.

## Tendência, resposta e índices transformam DEPs em decisão

### Tendência genética: regressão da DEP média no ano de nascimento

A tendência genética é a inclinação da média das DEPs (ou EBVs) por ano de nascimento. A ANCP a obtém "por regressão linear das DEPs padronizadas em função do ano de nascimento" ([sumário 2026, PDF p. 90](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)) **[conferido na fonte]**. A tendência fenotípica é a inclinação da média dos registros por safra, e a diferença entre elas estima a tendência de ambiente e manejo **[não verificado como método publicado]**. Num rebanho fictício com DEP média de PD210 de 1,8; 2,3; 2,9; 3,2; 3,9 e 4,4 kg para as safras de 2020 a 2025, e P205 médio de 196, 199, 195, 203, 206 e 204 kg, as regressões dão:

| Tendência | Cálculo | Resultado |
|---|---|---|
| Genética (DEP) | inclinação da DEP média | 0,517 kg/ano |
| Genética (valor genético) | 2 × 0,517 | 1,03 kg/ano |
| Fenotípica | inclinação do P205 médio | 1,97 kg/ano |
| Ambiental | 1,97 − 1,03 | 0,94 kg/ano |

O resultado separa o que veio da genética do que veio de pasto, sanidade e manejo. Ele só vale se as DEPs vierem de uma avaliação com o rebanho bem conectado; com DEPs de baixa acurácia, a inclinação é ruído.

### Resposta à seleção: a equação do criador

O ganho genético anual segue **ΔG = r·σg·i/L** ([Missouri Extension G02013](https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/ansci/g02013.pdf)) **[conferido na fonte]**, em que L é a idade média dos pais ao nascimento da progênie ([extension.org](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/)). No exemplo de Missouri, com 3.570 animais Angus, 2,8 lb/ano de ganho, σg = 26,3 lb e L = 5 anos, o produto r·i vale 2,8 × 5/26,3 = 0,53. Machos e fêmeas têm acurácias, intensidades e intervalos diferentes, e a forma em duas vias soma as contribuições, ΔG = (r_m·i_m + r_f·i_f)·σa/(L_m + L_f) **[não verificado; forma atribuída a Rendel e Robertson 1950]**, com i = φ(z)/p para seleção por truncamento.

Um cenário ilustrativo combina touros jovens com DEP genômica e novilhas escolhidas pelo próprio peso. Os touros têm r = 0,70, são comprados entre os 10% melhores (i = 1,755) e têm L = 3,5 anos. As novilhas têm r = √0,25 = 0,50, com 70% retidas (i = 0,497) e L = 6 anos. Com σa = 10 kg, o ganho é de **1,55 kg/ano** de valor genético. Trocando os touros por touros escolhidos por fenótipo (r = 0,40, L = 5), o ganho cai para **0,86 kg/ano** **[conferido numericamente]**. O touro responde pela maior parte do progresso, e é nele que acurácia e intensidade valem mais.

### Índice de seleção: Smith-Hazel e a soma ponderada de DEPs

Hazel (1943, [Genetics 28:476–490, PMC1209225](https://pmc.ncbi.nlm.nih.gov/articles/PMC1209225)) apresentou a construção do índice e três índices para suínos. A demonstração de que o índice supera a seleção por uma característica de cada vez ou por níveis independentes de descarte é citada por ele como de Hazel e Lush (1943), e ele cita também Smith (1937). O objetivo é H = v'a, a soma dos valores genéticos ponderados pelos valores econômicos v, e o índice é I = b'x. Hazel escreve o sistema em correlações e coeficientes de caminho (eqs. 1 a 4); a forma matricial abaixo, Pb = Gv, é a notação moderna do mesmo sistema **[conferido na fonte]**:

```
b = P⁻¹ G v          P = var(fenótipos) ;  G = cov(fenótipos, valores genéticos) ;  v = R$ por unidade
r_IH = √( b'P b / v'G v )         resposta no objetivo = i · √(b'Pb)
resposta por característica = i · G b / √(b'Pb)
com DEPs/EBVs multicaracterística do mesmo conjunto de características: I = Σ v_k · EBV_k (ou 2·Σ v_k · DEP_k)
```

Com as variâncias do exemplo bicaracterística (P = [400 205; 205 625], G = [100 105; 105 225]) e v = (R$ 2/kg de PD; R$ 4/kg de PS), valores hipotéticos, os pesos ótimos sobre os fenótipos próprios são **b = (0,77; 1,52)** e a acurácia do índice é **r_IH = 0,62**. Por desvio-padrão de seleção, a resposta é de 5,1 kg em PD, 9,1 kg em PS e R$ 46,6 no objetivo.

Nos sumários, o índice é aplicado a DEPs já calculadas, como soma ponderada; é assim no $Index da BREEDPLAN ([UNE](https://breedplan.une.edu.au/media/dtqpdm34/using-and-understanding-breedplan-ebvs.pdf)), cujos pesos vêm do BreedObject a partir de custos e receitas ([MLA](https://mbfp.mla.com.au/cattle-genetics/1-use-breedobject/)). No MGTe, os valores econômicos vêm de um modelo bioeconômico de uma fazenda de ciclo completo no Brasil Central e entram nos ponderadores junto com herdabilidades e correlações genéticas ([sumário ANCP 2025, p. 136 impressa](https://www.ancp.org.br/app/assets/sumario-ANCP-2025-v2.pdf)) **[conferido na fonte]**. O exemplo de dois touros usa valores econômicos hipotéticos por unidade de DEP: R$ 10/kg de PD210, R$ 6/kg de PS450, −R$ 40 por mês de IPP, R$ 15 por ponto de STAY, R$ 8/cm de PE365 e R$ 5/cm² de AOL.

| DEP | Touro A | Touro B | Valor (R$/unidade) | Contribuição A | Contribuição B |
|---|---|---|---|---|---|
| PD210 (kg) | +12,0 | +6,0 | 10 | 120,0 | 60,0 |
| PS450 (kg) | +20,0 | +10,0 | 6 | 120,0 | 60,0 |
| IPP (meses) | +0,5 | −1,2 | −40 | −20,0 | 48,0 |
| STAY (%) | −2,0 | +4,0 | 15 | −30,0 | 60,0 |
| PE365 (cm) | +0,8 | +1,2 | 8 | 6,4 | 9,6 |
| AOL (cm²) | +1,5 | +2,0 | 5 | 7,5 | 10,0 |
| **Índice econômico** | | | | **203,9** | **247,6** |

O touro B vence o índice de ciclo completo pela fertilidade, embora cresça menos. Num índice terminal, só com PD, PS e AOL, a ordem se inverte (A = 247,5; B = 130,0), o que ilustra o alerta de que um índice terminal pode trabalhar contra quem produz as próprias matrizes ([UNL](https://beef.unl.edu/sites/unl.edu.ianr.beef/files/media/file/Economic%20Indexes%20for%20Beef%20Sire%20Selectiong1847.pdf)). É também a lógica das variantes do MGTe de 2026: o MGTe_CR, de cria, dá 30% à STAY e 24% à 3P, e o MGTe_RE, de recria e engorda a pasto, só pesa P450, AOL e acabamento. A acurácia muda a leitura. Suponha que A é provado (r = 0,90), que B é jovem (r = 0,45), que os desvios-padrão genéticos das DEPs são hipotéticos e que os erros entre DEPs são independentes. O desvio-padrão do erro do índice é de R$ 47,5 para A e de R$ 97,4 para B. A diferença de R$ 43,7 a favor de B dá só **66% de probabilidade de B ser de fato melhor**. Na versão de pesos percentuais sobre DEPs padronizadas pelo desvio-padrão genético, B também vence (1,12 contra 0,87, com pesos percentuais hipotéticos de 15% PD210, 20% PS450, 15% IPP, 30% STAY, 10% PE365 e 10% AOL). A padronização foi atribuída ao MGTe num seminário da ANCP de 2016 ([Seminário ANCP 2016](https://www.slideshare.net/slideshow/04-fernando-seminario/62118028)) **[não verificado]**; o sumário atual não diz se os percentuais incidem sobre DEPs padronizadas. Pesos percentuais sobre DEPs brutas, como no IQGg, dependem das unidades de cada DEP e não equivalem a pesos econômicos.

## Os programas de N muito grande convergiram para o single-step

Todos os grandes programas partem do mesmo núcleo, o modelo animal BLUP com GCs fixos, e quase todos já trocaram A⁻¹ por H⁻¹. A tabela resume o que as fontes confirmaram, com as divergências entre elas. Os documentos brasileiros citados são o [sumário ANCP 2026](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf), a [apresentação geral ABCZ–Embrapa](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf) e o [sumário Conexão Delta G 2026](https://gensys.com.br/wp-content/uploads/2026/09/Sumario-de-Touros-CDG-2026.pdf), todos lidos em texto completo **[conferido na fonte, salvo marcação na célula]**.

| Programa | Escopo e escala | Modelo e genômica | Índices e publicação |
|---|---|---|---|
| ANCP, Programa Nelore Brasil | Nelore, Guzerá, Brahman, Tabapuã e Sindi; mais de 5 milhões de animais, mais de 600 mil genotipados e mais de 700 fazendas; 34 características (sumário 2026, PDF p. 90). Em 2011, 1,7 milhão de Nelores na matriz de parentesco e 559 rebanhos ([Cultivar](https://revistacultivar.com.br/noticias/sumario-de-touros-da-ancp-analisa-mais-de-1-7-milhao-de-animais)) | Modelo animal uni e bicaracterística, com P120 como âncora; direto, materno e ambiente permanente materno em P210 e MP120; **σam = 0**; limiar para 3P, STAY, facilidade de parto e mocho; ssGBLUP com APY no BLUPF90+, com metafundadores (um por raça) na avaliação multirracial (PDF p. 90 e 104). Cronologia ([ANCP, História](https://www.ancp.org.br/ancp/historia/)): modelo animal direto-materno em 1993; DEPs auxiliadas por marcadores em 2011; primeiras DEPs genômicas de Nelore em 2014; ssGBLUP em maciez, ingestão e CAR em 2017 e em todas as características em 2019 | MGTe (Nelore: 3P 17%, STAY 21%, PE365 4%, MP120 9%, P210 19%, P450 15%, AOL 12%, ACAB 3%) e quatro índices específicos (CR, RE, CO, F1); seis avaliações por ano desde 2023; sumário anual em agosto; acurácia declarada BIF; tabela de possível mudança na escala r |
| ABCZ, PMGZ | Todas as raças zebuínas; cerca de 3.400 rebanhos; CDP desde 1968; mais de 18,2 milhões de animais avaliados, com 350.101 novos em 2025 ([ABCZ, Apresentação](https://www.abcz.org.br/pmgz/apresentacao)) | Modelo touro a partir de 1987 e modelo animal desde 1996. Desde 2018, avaliação única com o Embrapa-Geneplus: modelo animal multicaracterística com efeitos direto, materno e de ambiente permanente materno; GC e idade da vaca/sexo do produto como fixos; data de nascimento aninhada no GC; single-step em Guzerá, Nelore e Tabapuã; BLUP90IOD2, CBLUP90IOD e ACCF90GS3 (apresentação geral, PDF p. 1–2). O documento não diz se σam é zero | iABCZ por raça desde julho de 2024; DECA (DECA 1 = 10% melhores); CSG; acurácia BIF (Bertrand et al. 2002) |
| Embrapa-Geneplus | App com 336 rebanhos e 2,3 milhões de animais ([Embrapa](https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/4275/app-sumario-nelore---aplicativo-movel-do-sumario-de-touros-nelore-do-programa-embrapa-geneplus-)); cerca de 600 fazendas em 2026 ([Canal Rural](https://www.canalrural.com.br/pecuaria/geneplus-celebra-30-anos-na-expogenetica-2026-com-foco-em-avanco-genetico-da-pecuaria)) **[não verificado]** | Parte genética pelas mesmas rotinas da avaliação conjunta com a ABCZ; provas PAD e ATJ com consumo individual; DEPs de Senepol desde 2010 | IQGg com classes por percentil; base genética móvel ("animais nascidos na safra 2024", nos certificados lidos); escala da acurácia não declarada |
| CRV PAINT; GenSys (Conexão Delta G, Aliança Nelore) | PAINT consolida sumários de Nelore; cerca de 35 mil reprodutores em 2010 ([Agrolink](https://www.agrolink.com.br/noticias/sumario-paint-2010-e-lancado-com-a-avaliacao-de-35-mil-reprodutores_117245.html)). Delta G 2026: 95 rebanhos, 14.828 GCs e 467.661 produtos no ganho até a desmama (PDF p. 16); num sumário anterior, 294 touros Hereford e Braford e 27 características ([CompreRural](https://comprerural.com/sumario-da-conexao-delta-g-reune-294-touros-avaliados-em-27-caracteristicas/)) | PAINT: DEPs relativas a uma média genética móvel ([Cultivar](https://www.revistacultivar.com.br/noticias/crv-lagoa-lanca-a-edicao-2009-do-sumario-paint-consolidado)); sem documento metodológico aberto. GenSys: modelo animal multivariado com direto, materno e ambiente permanente, fenótipo pré-ajustado, ponderação robusta contra heterogeneidade de variância e GC com no mínimo 10 laços genéticos diretos; **DEP genômica por GBLUP de pseudofenótipos no SNP1101, em duas etapas, e não single-step** (PDF p. 18) | IPAINT, HGP e IDesm sem fórmula publicada. Delta G: quatro índices em base 10 sobre DEPs harmônicas padronizadas; acurácia de 0 a 1, escala não declarada; classes A, B e C |
| PampaPlus, Promebo, Senepol, Montana | Hereford e Braford (ABHB, desde 2008); Senepol com 69.299 animais com registro e 82.100 no parentesco em 2016 ([Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1066876/1/Suma769rioSenepol2016.pdf)) | DEPs de ultrassom; Senepol com DEPs genômicas; Montana comparou três modelos BLUPF90 com rankings muito parecidos ([USP](https://teses.usp.br/teses/disponiveis/74/74131/tde-02032023-104048/?lang=en)) | Montana: entrada com CEIP ou percentil mínimo ([MAPA](https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/registro-genealogico/CritriosAZMontana1.pdf)) |
| American Angus (AGI) | Até 1,8 milhão de animais genotipados no verão de 2025 ([Angus](https://cd.angus.org/-/media/acf83a7d2ec2470fa91fb62142c948ae.ashx)) **[não verificado: página bloqueada]** | Single-step semanal para todas as EPDs e $Values desde 7 de julho de 2017 ([Angus](https://angus.org/pub/newsroom/releases/062717-single-step.html)); peso à desmama pré-ajustado por idade da vaca e do bezerro, σam zerada depois da estimação e APY com 19.019 animais de núcleo (Jang et al. 2022) | $M, $W, $F, $G, $B, $C; premissas da CattleFax com média móvel de 7 anos ([Angus Journal 2025](https://www.angus.org/angus-media/angus-journal/2025/07/by-the-numbers)) |
| American Hereford (AHA) | GE-EPDs há 10 anos em 2022 ([Hereford](https://hereford.org/ge-epds-a-10-year-milestone/)) | EPDs pelo BOLT desde 4 de dezembro de 2017, com acurácias calculadas diretamente ([Hereford](https://hereford.org/american-hereford-association-releases-bolt-genetic-evaluation/)); o comunicado não usa o termo single-step, que vem da [UNL](https://newsroom.unl.edu/announce/beef/7498/43074) | Índices não pesquisados |
| IGS (Simmental, Red Angus e parceiros) | De 13 a 20 associações e de 19 a mais de 22 milhões de animais, segundo a fonte ([Simmental](https://simmental.org/site/index.php/simmental-cattle-breeder-resource/igs-multi-breed-genetic-evaluation)) **[não verificado: a página lida não traz os totais]** | Avaliação multirracial com EPDs comparáveis entre raças; plano de single-step semanal no BOLT ([Canadian Cattlemen](https://www.canadiancattlemen.ca/tag/simmental/feed/)). O FAQ da IGS descreve marcadores ponderados e acurácia por amostragem, mas é texto do fornecedor, sem artigo revisado | Subíndice $Gain e EPD de consumo em fase de pesquisa |
| BREEDPLAN (ABRI/AGBU) | Dados da ABRI para mais de 70 associações e 66 milhões de animais registrados no mundo ([BREEDPLAN, notícias, 2025](https://breedplan.une.edu.au/news/)); os 15 milhões de animais e 1 milhão de perfis de DNA da v1 não foram confirmados | Single-step multicaracterística desde outubro de 2017, com a Hereford ([Herefords Australia](https://www.herefordsaustralia.com.au/2017/10/implementation-of-single-step-genetic-evaluation/)), ampliado raça a raça: Droughtmaster em outubro de 2023 ([BREEDPLAN](https://breedplan.une.edu.au/news/droughtmaster-australia-implement-single-step-breedplan/)), Brangus em novembro de 2023 ([BREEDPLAN](https://breedplan.une.edu.au/news/australian-brangus-cattle-association-implement-single-step-breedplan-evaluation/)), Charolais Trans-Tasman em janeiro de 2024 ([BREEDPLAN](https://breedplan.une.edu.au/news/single-step-breedplan-implemented-for-trans-tasman-charolais-evaluation/)), Aberdeen-Angus do Reino Unido em fevereiro de 2024, Murray Grey em abril de 2025 e Angus europeu em maio de 2025; o Limousin já tinha análise single-step em julho de 2025. No Angus australiano: 35 características, fenótipos pré-corrigidos e interação touro × rebanho aleatória (Boerner e Johnston 2019, [GSE 51:57](https://doi.org/10.1186/s12711-019-0499-x)) | $Index (BreedObject); EBVs de 200, 400 e 600 dias |
| IBOVAL (França), ICBF (Irlanda), Interbeef | IBOVAL com nove raças; ICBF com mais de 15 milhões de animais ([Teagasc](https://teagasc.ie/news--events/daily-archive/icbf-breeding-for-more-sustainable-beef-production/)). Interbeef com cinco raças (Aberdeen-Angus, Charolais, Hereford, Limousin e Simmental) e 14 países em dezembro de 2020 ([ICAR](https://www.icar.org/interbeef-at-a-glance/)), 15 na tese de Bonifazi (2022) e cinco na rodada de janeiro de 2026: Estônia, Grã-Bretanha, Irlanda, Letônia e Noruega (Interbull, *Executive Summary* 2026-1, PDF p. 4). Não há participação brasileira documentada | IBOVAL: genômica desde 2015 **[não verificado]**; single-step "déployé ... courant 2025" para as raças de corte ([Réussir, 27/09/2024](https://www.reussir.fr/articles/evaluation-genetique-quels-seront-les-benefices-tirer-du-single-step-pour-les-races)); a data de janeiro de 2025 da v1 não foi confirmada. Interbeef: modelo AMACI (Phocas et al. 2005), em que o mesmo caráter em cada país é um caráter diferente, com dados brutos e pedigree; variâncias fixadas nas estimativas nacionais, σam diferente de zero e correlações genéticas entre países de 0,62 a 0,94 no efeito direto do peso à desmama; MiX99 (Bonifazi 2022). **Sem genômica até janeiro de 2026**; a primeira avaliação genômica de rotina está prevista para 2027 | €uro-Star (cinco estrelas = 20% melhores); Interbeef com publicações oficiais em março e outubro e publicação do efeito direto com confiabilidade ≥ 0,5 e ≥ 25 progênies |

Três conclusões saem da tabela.
1. **A convergência metodológica é quase completa, com exceções documentadas.** Angus americano, Hereford americano e BREEDPLAN (pela Hereford australiana) chegaram ao single-step em 2017. A ANCP fechou a transição em 2019, depois de três características em 2017, e a avaliação ABCZ–Embrapa a adotou em 2018 nas três raças com genótipos. A BREEDPLAN continuou a migrar raças até 2025. As exceções são a GenSys, que combina GBLUP de pseudofenótipos com a DEP tradicional, e o Interbeef, que não usava genômica até janeiro de 2026.
2. **As DEPs não são comparáveis entre programas**, nem dentro da mesma raça. Cada avaliação tem base, dados, escala de acurácia e convenções próprias, como σam zero na ANCP e livre no Interbeef. Os fatores entre raças do USMARC existem justamente para comparar EPDs de 18 raças em escala Angus. No exemplo da folha de 2024, um touro Red Angus com EPD de peso de carcaça de +20,0 lb e um Hereford com +75,0 lb passam a 14,6 lb e 8,6 lb com os fatores de −5,4 e −66,4 lb, e a ordem se inverte ([USDA-ARS 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf)) **[conferido na fonte]**. O texto da folha chama esses fatores de "yearling weight", mas os valores são os da coluna de peso de carcaça da Tabela 1. O exemplo de 2023 da v1 (90,0 e 92,0 lb passando a 65,2 e 52,7 lb) foi removido, porque não pôde ser reproduzido com as fontes legíveis e os fatores mudaram em 2024.
3. **No Brasil, ANCP, ABCZ–Embrapa e GenSys documentam o método nos sumários, e o PAINT não tem documento aberto.** A ANCP faz seis avaliações por ano desde 2023, com fechamentos em 15/02, 15/04, 15/06, 15/08, 15/10 e 30/11 (cronograma do sumário 2026, PDF p. 103) **[conferido na fonte]**. O mesmo sumário fala em cinco avaliações na p. 90, e o cronograma prevalece. As quatro avaliações anuais do Geneplus vêm de fonte comercial ([Ponta Agro](https://pontaagro.com/programas-de-melhoramento-genetico/)) **[não verificado]**.

## Indicadores e metas: o que existe de referência publicada

### DEPs e índices publicados no Brasil

A ANCP publica DEPs de 34 características, entre elas ([ANCP, Características](https://www.ancp.org.br/programas/conceitos-basicos/caracteristicas-avaliadas/); [ANCP, ultrassonografia](https://www.ancp.org.br/servicos/ultrassonografia-de-carcaca/); [ANCP, frame e MGTe](https://www.ancp.org.br/wp/wp-content/uploads/2022/07/ancp_frame_mgte.pdf); [sumário 2026](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf)):
- pesos aos 120 e 210 dias (pré-desmama) e aos 365 e 450 dias;
- efeitos maternos aos 120 e 210 dias (MP120, MP210);
- reprodução e permanência: 3P, STAY, IPP, idade à puberdade de machos (IPM, valores negativos desejáveis) e PAC (kg de bezerro desmamado por vaca por ano);
- perímetro escrotal aos 365 e 450 dias;
- carcaça e qualidade: AOL, acabamento, marmoreio, peso de carcaça quente, porção comestível e maciez;
- eficiência: CAR e ingestão de matéria seca;
- facilidade de parto, frame e mocho;
- desde 2025, GPR, STAY54, LAC e LPA.

Nos sumários, o prefixo D indica a DEP da característica (DIPP, D3P, DSTAY, DPAC, DACAB, DMOCHO) **[conferido na fonte]**. Os pesos dos índices vêm dos documentos oficiais de 2024 a 2026.

| Índice | Composição publicada | Escala | Fonte |
|---|---|---|---|
| iABCZ (desde julho de 2024) | Nelore e Tabapuã: 30% STAY; 13% PD-ED; 13% PS-ED; 10% PM-EM; 10% IPP; 8% PA-ED; 6% AOL; 5% PE365; 5% ACAB. Brahman, Gir e Guzerá: 30% STAY; 15% PD-ED; 15% PS-ED; 15% IPP; 10% PM-EM; 10% PA-ED; 5% PE365. Indubrasil e Sindi: 30% PM-EM; 15% PD-ED; 15% PA-ED; 15% PS-ED; 15% IPP; 10% PE365 | Classes DECA (DECA 1 = 10% melhores) | [Apresentação geral ABCZ–Embrapa, PDF p. 2–4](https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf) |
| IQGg (Geneplus) | 20% TMD; 20% GPD; 15% PS; 15% PES; 10% PD; 10% AOL; 5% IPP; 5% EGS | Elite até o percentil 16; Superior de 16 a 50; Regular de 50 a 84; Inferior acima de 84 | [Geneplus, certificados CEIP de 2025 e 2026](https://geneplus.com.br/certificadosCeip/download/73) |
| MGTe (ANCP), Nelore, 2023 a 2025 | 21% STAY; 19% P210; 17% 3P; 15% P450; 12% AOL; 9% MP120; 4% PE365; 3% ACAB (fertilidade e precocidade 42%, habilidade materna 9%, crescimento 34%, carcaça 15%) | Bioeconômico (fazenda de ciclo completo no Brasil Central) | [Sumário ANCP 2025, p. 136 impressa](https://www.ancp.org.br/app/assets/sumario-ANCP-2025-v2.pdf) |
| MGTe_CR, _RE, _CO e _F1 (ANCP, Nelore, 2026) | CR, sistemas de cria: 30% STAY, 27% P210, 24% 3P, 13% MP120, 6% PE365. RE, recria e engorda a pasto: 50% P450, 40% AOL, 10% ACAB. CO, recria e engorda em confinamento: 34% AOL, 22% ACAB, 20% CAR, 14% P450, 10% MAR. F1, cruzados filhos de vacas Nelore em confinamento: 30% ACAB, 25% AOL, 17% CAR, 14% P450, 14% MAR | Bioeconômicos por sistema de produção, sem substituir o MGTe | [Sumário ANCP 2026, PDF p. 97–99](https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf) |

Os pesos somam 100 em todos os casos **[conferido numericamente]**, e a composição foi lida nos documentos citados **[conferido na fonte]**. Quatro observações sobre a tabela:
- **MGTe.** Os pesos da v1 (24% DP450, 22% DSTAY, 16% DP210 e outros, de fontes do setor) eram de uma versão anterior à atualização de 2023 e foram substituídos. Para Guzerá, Brahman e Tabapuã, o MGTe de 2023 a 2025 troca a 3P por IPP (7%) e pesa STAY 23% e PE365 12%. O sumário de 2026 não reimprime o MGTe tradicional, de modo que a vigência dos pesos de 2025 em 2026 é **[inferência]**.
- **iABCZ.** A notícia de lançamento de 2024 ([ABCZ](https://www.abcz.org.br/noticias/noticia/29326/3---encontro-nacional-de-criadores-do-pmgz-resulta-em-novas-estrategias-para-aprimoramento-do-programa-e-novo-iabcz)) listava "5% PM-EM + 5% TMD"; o documento metodológico atual traz 10% de PM-EM e nenhum TMD separado, e prevalece.
- **Ponderação.** O iABCZ e o IQGg aplicam os percentuais diretamente às DEPs, sem padronização explícita no texto. Os ponderadores do MGTe vêm de valores econômicos combinados com herdabilidades e correlações genéticas. Em nenhum dos três o percentual equivale a um valor econômico por unidade de DEP, e pesos iguais em percentual não significam a mesma ênfase econômica.
- **IQG.** A fórmula lida é a do IQGg, a versão genômica; o IQG não genômico pode ter outros pesos.

### Metas genéticas: certificação e percentis

As metas genéticas publicadas são, na prática, cortes de percentil e de acurácia. O CSG da ABCZ vai para os 20% melhores da safra; em Nelore e Nelore Mocho, exige acurácia mínima de 20% em peso à desmama e DECA até 4 nas características do iABCZ ([Rural Pecuária](https://ruralpecuaria.com.br/tecnologia-e-manejo/bovinocultura-de-corte/abcz-certificado-especial-de-producao-e-substituido-pelo-certificado-de-superioridade-genetica.html)) **[não verificado: página inacessível]**. Uma fonte comercial cita 30% para o CEIP, mas em outro programa ([DeltaGen](https://www.deltagen.com.br/noticia.php?noticia=0171)), e o CEIP é chancelado pelo MAPA ([eRural](https://www.erural.net/conteudo/o-que-significa-a-sigla-ceip)). O ATJ do Geneplus exige "IQG até 3% e positivo (abaixo de 50%) para as características que compõem o IQG" ([Geneplus](https://geneplus.com.br/atjplus-nelore-criterios)) **[conferido na fonte]**. O Programa Montana aceita animais acima de 31 meses com CEIP e percentil igual ou melhor que 40% em pelo menos duas de quatro características: peso à desmama, peso ao sobreano, ganho da desmama aos 14 meses e probabilidade de prenhez aos 14 meses ([MAPA](https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios/insumos-pecuarios/registro-genealogico/CritriosAZMontana1.pdf)) **[conferido na fonte]**. Para vacas, o prêmio Maternal Merit da Brahman americana exigiria MPPA de pelo menos 101, e o nível superior, 105 com quatro crias desmamadas ([Brahman](https://brahman.org/genetics/genetic-merit-awards/)) **[não verificado: página bloqueada]**.

### Indicadores zootécnicos do rebanho

Os indicadores de desempenho do rebanho são razões simples, mas o denominador muda o número. As fórmulas abaixo são definições de trabalho, coincidentes com as do IMEA e do Inttegra quando estes as publicam, e os valores de referência estão citados.

| Indicador | Fórmula | Referência publicada |
|---|---|---|
| Taxa de prenhez | prenhes ao diagnóstico ÷ fêmeas expostas | Nelore no Cerrado: 69% em primíparas e 90% entre a 5ª e a 8ª cria ([RBZ](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt)) **[conferido na fonte]**; prenhez final de 65,54% em 3.150 fazendas (iRancho 2025/2026); EUA: 94,3% ([CHAPS](https://ndsu.edu/chaps/benchmarks)) **[não verificado]** |
| Intervalo entre partos (IEP) | média dos intervalos entre partos consecutivos | 392 dias em primíparas e 365 dias entre a 5ª e a 9ª cria, no Cerrado ([RBZ](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt)) **[conferido na fonte]**; 510 dias num rebanho do Pará ([UFRPE](https://www.journals.ufrpe.br/index.php/medicinaveterinaria/article/view/2618)) **[não verificado]** |
| Concepção na IATF; perda de gestação | concebidas ÷ inseminadas; perdas entre o diagnóstico positivo e o parto ÷ prenhes | Concepção de 55,25% com ECC 2,75 e de 47,50% com ECC 2,50 (iRancho); perda de gestação após IATF de 6,64% em multíparas, 8,28% em primíparas, 9,13% em novilhas convencionais e 12,35% em novilhas precoces (Nogueira et al. 2026) |
| Taxa de desmama | desmamados ÷ vacas expostas | 65,58% em MT (IMEA); 57,99% a 67,36% (Senar-MS); 74,8% nas 30% mais rentáveis (Inttegra); EUA: 91,4% ([CHAPS](https://ndsu.edu/chaps/benchmarks)) e meta mínima de 85% em Iowa ([Iowa Cattleman](https://lsc-pagepro.mydigitalpublication.com/article/Vet%E2%80%99s+View/4351552/762601/article.html)) **[não verificado]** |
| Mortalidade de bezerros | mortos ÷ vacas expostas ou ÷ nascidos | Pré-desmama de 4,93% (iRancho) e de 3,0% nas fazendas mais rentáveis (Inttegra). No Canadá, metas do quartil superior abaixo de 1% até 24 h e, da 24 h à desmama, abaixo de 2% em vacas e de 1% em novilhas (Waldner et al. 2019, [PMC6662034](https://pmc.ncbi.nlm.nih.gov/articles/PMC6662034)) **[conferido na fonte]**. EUA: 3,2% e 3,4% ([CHAPS](https://ndsu.edu/chaps/benchmarks)) **[não verificado]** |
| Kg desmamados por vaca exposta | Σ pesos à desmama ÷ vacas expostas | 114,73 kg (margem negativa) e 139,76 kg (margem positiva) no Senar-MS; 162 kg nas 30% mais rentáveis (Inttegra); PAC de 174,04 kg por vaca por ano no Nelore da ANCP, com outro denominador; 80 a 90 kg observados e metas de 200 a 210 kg no RS ([CompreRural](https://comprerural.com/criadores-do-rs-buscam-aumento-de-120-em-kg-de-terneiros-desmamados-por-vaca/)) **[não verificado]** |
| Eficiência materna | peso do bezerro ÷ (peso da vaca)^0,75 | h² da razão bezerro/vaca de 0,31 em Nelore, com 4.242 pares; o próprio estudo aponta problemas da razão como critério fenotípico e vê viabilidade em índices com ponderadores econômicos ([UFV](https://locus.ufv.br//handle/123456789/27156)) **[conferido na fonte]** |
| Idade ao primeiro parto | data do 1º parto − nascimento | 35 meses em 846.425 Nelores da ANCP (sumário 2026, PDF p. 106) **[conferido na fonte]**; cerca de 38,8 meses em 8.348 novilhas de MS ([UNESP](https://repositorio.unesp.br/handle/11449/4697)) **[não verificado]** |
| GMD e ganho por área | (peso final − inicial) ÷ dias; GMD × dias × animais ÷ ha | Meta-análise de 132 estudos em pasto tropical: 0,81 kg/dia nas águas e 0,56 kg/dia na seca, com +0,308 kg para cada 1% de suplemento (Tambara et al. 2021, [RBZ 50:e20210020](https://doi.org/10.37496/rbz5020210020)); GPD pós-desmama do Nelore da ABCZ, até 2016: 346 g/dia a pasto, 563 semi-estabulado e 749 estabulado; Xaraés com 30 cm: 760 g/dia, 2,8 UA/ha e 1.170 kg/ha ([SEMADESC-MS](https://www.semadesc.ms.gov.br/?p=16979)) **[conferido na fonte]** |

A v1 trazia como "meta da Embrapa" um IEP de até 365 dias, concepção até 90 dias pós-parto, concepção acima de 60% na primeira IA e aborto abaixo de 3% ([Embrapa Rondônia](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf)). Essas metas vêm de um capítulo sobre **bovinocultura de leite** ("Principais parâmetros reprodutivos utilizados em bovinocultura de leite", Tabela 1) e foram retiradas da tabela de corte. Para cria, os valores de corte acima as substituem.

Os benchmarks brasileiros recentes de cria vêm de levantamentos de fazendas que já fazem gestão, e não de amostras nacionais. A tabela dá a definição e o limite de cada um.

| Fonte (período) | Definição e amostra publicadas | Limite ou inconsistência |
|---|---|---|
| IMEA, Mato Grosso, estação de monta de 2023 ([Agrolink, 2025](https://www.agrolink.com.br/noticias/mt-registra-alta-no-indice-de-desmama-em-2025_507457.html)) | Índice bruto de desmama: "proporção de animais desmamados em relação às vacas expostas à reprodução"; estimativa estadual, série desde 2006 | Um só estado. A notícia fala em alta de 1,22 ponto sobre o ano anterior, mas o valor divulgado em 2024 foi 67,65% (queda de 4,83 pontos): 67,65 + 1,22 não dá 65,58, e o número anterior pode ter sido revisado. Só notícias foram lidas, não o boletim |
| Senar-MS, ATeG, ano pecuário 2023/2024 ([CNA](https://cnabrasil.org.br/noticias/produtores-que-adotam-gestao-tecnica-atravessam-ciclo-pecuario-com-maior-margem)) | Fazendas assistidas, com mais de 580 mil hectares e 740 mil cabeças, divididas em margem bruta positiva e negativa; estação de monta média de 7,67 meses no grupo positivo | Fórmulas não publicadas; só fazendas assistidas; grupos definidos pelo resultado econômico, o que mistura causa e efeito |
| iRancho, Radar da Cria 25/26 ([iRancho](https://www.irancho.com.br/radar-da-cria-o-que-os-numeros-revelam-sobre-a-cria-brasileira/)) | 3.150 fazendas e mais de 1,3 milhão de registros da plataforma; prenhez final = 85.990 prenhes ÷ 131.204 matrizes; 62,55% dos protocolos de IATF entre outubro e dezembro | Usuários de software de gestão; a fonte diz que não é média do país; relatório completo sob cadastro |
| Inttegra, safra 2020/2021, publicado no programa Cria Saudável da Elanco ([Elanco](https://agropecuaria.elanco.com/br/criasaudavel/gestao/zootecnico)) | Fertilidade = prenhes ÷ fêmeas em cobertura; perda pré-parto entre o toque positivo e o nascimento (8,2%); desmama = desmamados ÷ vacas expostas; aproveitamento de fêmeas acima de 18 meses expostas à monta (103,5%); "os maiores resultados econômicos da cria foram conquistados quando a taxa de desmama foi próxima a 75%" | Só o grupo dos 30% mais rentáveis, sem tamanho de amostra, de 2020/2021 e hospedado por patrocinador; não há relatório público posterior |
| ANCP, "ANCP em números" (sumário 2026, PDF p. 106) | PAC = "produtividade da vaca, em kg de bezerros desmamados por vaca por ano" (220.829 observações em Nelore; 138,07 kg em Guzerá e 135,33 kg em Brahman); STAY de 30% e facilidade de parto de primíparas de 96% em Nelore | Fazendas de seleção, com mais controle que a média; o PAC é por ano de vida da vaca, não por vaca exposta, e não se compara direto aos kg do Senar-MS e do Inttegra; fórmula não publicada |
| Nogueira et al. 2026, *J. Anim. Sci.*, [DOI 10.1093/jas/skag176](https://doi.org/10.1093/jas/skag176) | 305.325 serviços de IATF de 667 touros em 271 fazendas de 11 estados, de 2015 a 2022; modelo de limiar no BLUPF90+ | Só fazendas com IATF |

Os números sustentam **faixas**, não uma meta única. A taxa de desmama vai de 58% a 67% no Senar-MS, fica em 65,6% no IMEA e chega a cerca de 75% no grupo lucrativo do Inttegra. Os kg desmamados por vaca exposta vão de 115 kg a 162 kg entre o grupo de margem negativa do Senar-MS e o grupo lucrativo do Inttegra. A perda de gestação cai com a idade da fêmea, o que dá uma meta por categoria. As definições coincidem onde foram publicadas (desmamados ÷ vacas expostas, no IMEA e no Inttegra). Mesmo assim, o software deve calcular e rotular o denominador (vacas expostas ou vacas paridas, por estação ou por ano), porque o 65% do IMEA e o 74,8% do Inttegra só se comparam com o mesmo denominador. Não foi localizado benchmark atual de IEP com metodologia publicada. A ANCP publica o período de gestação (295 dias em Nelore) e a IPP, não o IEP.

Exemplo de cálculo: 100 vacas expostas que desmamam 80 bezerros com P205 médio de 195 kg produzem **156 kg desmamados por vaca exposta**, acima dos 139,76 kg das fazendas de margem positiva do Senar-MS e perto dos 162 kg do grupo lucrativo do Inttegra; a taxa de desmama de 80% supera os 74,8% desse grupo. Se a vaca média pesa 450 kg, a eficiência materna é 195/450^0,75 = 195/97,7 = **2,0 kg por kg metabólico**. Para fixar metas, a referência mais informativa continua sendo a série histórica do próprio rebanho, reportada com intervalo de confiança, ao lado das faixas acima.

### Metas individuais: uma proposta para o acompanhamento animal a animal

Juntando os cortes publicados, este relatório propõe uma estrutura de metas por categoria **[proposta deste relatório, não norma de programa]**:
- **Bezerro:** razão BIF de desmama dentro do GC, com a reposição escolhida acima de 100.
- **Novilha:** prenhez na primeira estação e IPP abaixo da média do rebanho, mais a DEP de IPP ou de 3P, quando houver. A perda de gestação esperada é maior que a das vacas, de cerca de 9% a 12% após IATF segundo Nogueira et al. (2026).
- **Vaca:** MPPA de pelo menos 100 a 101 (o corte atribuído à Brahman, não verificado), IEP perto de 365 dias (valor observado em vacas Nelore de 5ª a 9ª cria no Cerrado) e kg desmamados por ano.
- **Touro de reposição:** índice no quartil ou no quintil superior do programa (os 20% do CSG), com acurácia mínima declarada e na escala declarada. A exigência de acurácia deve ser maior para touros de monta que cobrem muitas vacas.
- **Rebanho:** tendência genética positiva no índice escolhido e ΔF abaixo de um teto definido pela gestão.

## Rebanhos médios e grandes ganham precisão conectando-se, não isolando-se

### Estimar parâmetros dentro da fazenda é quase sempre ruído

A tentação de uma fazenda de 1.000 vacas é estimar a própria herdabilidade. A simulação deste relatório (5.000 repetições, delineamento de meios-irmãos paternos com h² verdadeira de 0,30 e estimativa por análise de variância) mostra o problema **[conferido numericamente]**:

| Touros × filhos por touro | N | Desvio-padrão da h² estimada | Estimativas negativas |
|---|---|---|---|
| 5 × 20 | 100 | 0,301 | 17,5% |
| 20 × 25 | 500 | 0,135 | 0,3% |
| 50 × 20 | 1.000 | 0,094 | 0% |
| 100 × 30 | 3.000 | 0,057 | 0% |

Com 100 registros, só 47% das estimativas caem entre 0,10 e 0,50. Além do ruído, há viés de definição. Num estudo brasileiro de Nelore, a h² da **idade ao primeiro parto** foi de 0,00 quando só havia novilhas expostas aos 24 meses, de 0,11 com todas as fêmeas que tinham a medida, de 0,20 com exposição antecipada (cerca de 18 meses) e de 0,36 com todos os registros (Dias, El Faro e Albuquerque 2004, *Arq. Bras. Med. Vet. Zootec.* 56:370–373, [DOI 10.1590/S0102-09352004000300013](https://doaj.org/article/f1cb4673faee49749947a88d163094ca)) **[conferido na fonte: resumo]**. A v1 atribuía esses números, por engano, à prenhez. A prática recomendada é **fixar as variâncias pela literatura** e testar a sensibilidade, como detalhado a seguir.

### Parâmetros externos e prioris informativas

Fixar as variâncias pela literatura equivale a usar uma priori degenerada, concentrada num só valor. A base teórica é a do BLUP clássico, que supõe variâncias conhecidas. As fontes lidas dizem quatro coisas **[conferido na fonte]**:
- **Gianola, Foulley e Fernando (1986, [GSE 18:485](https://doi.org/10.1186/1297-9686-18-4-485)).** Com conhecimento prévio vago, o melhor preditor é aproximado pelas MME com as variâncias trocadas por estimativas REML, o que dá preditores "empirical Bayes". Os autores declaram que a especificação de prioris informativas para as variâncias "not dealt with here". Lembram ainda que, com prioris planas e grupos de progênie pequenos, a variância estimada do efeito aleatório pode ir a zero.
- **Meyer (2011, [GSE 43:39](https://doi.org/10.1186/1297-9686-43-39)).** O conhecimento acumulado sobre parâmetros genéticos "typically ... is not used", e as aplicações bayesianas costumam usar prioris planas ou não informativas. A máxima verossimilhança penalizada que ela propõe reduz bastante a perda nas covariâncias genéticas em amostras pequenas e moderadas, numa simulação que não é de corte.
- **Misztal, Lourenco e Legarra (2020).** Os grandes programas usam estimativas "once-in-a-while" ou de pedigree. Nas avaliações genômicas de leite dos EUA, o viés caiu quando a h² foi reduzida para 50% a 70% do valor original, sinal de h² superestimada.
- **Bonifazi (2022).** O Interbeef fixa as variâncias de cada país nas estimativas nacionais.

Não foi localizado estudo que compare, em rebanhos de corte de 100 a 5.000 vacas, o BLUP com variâncias da literatura e a estimação própria. Também não se achou estudo que use prioris informativas de variância em corte.

A fonte aberta de parâmetros externos para zebuínos é a meta-análise bayesiana hierárquica de Giannotti (2004, [tese ESALQ/USP](https://teses.usp.br/teses/disponiveis/11/11139/tde-22112004-153644/publico/juliana.pdf)), com 869 herdabilidades diretas, 186 maternas e 123 correlações direto-maternas de 186 artigos **[conferido na fonte]**:

| Característica | h² direta (IC 95%) | h² materna | Correlação direto-materna |
|---|---|---|---|
| Peso ao nascer | 0,31 (0,29; 0,33) | 0,09 (0,08; 0,11) | −0,16 (−0,22; −0,10) |
| Peso à desmama | 0,24 (0,23; 0,25) | 0,13 (0,11; 0,14) | −0,16 (−0,20; −0,12) |
| Peso aos 365 dias | 0,28 (0,26; 0,30) | 0,12 (0,09; 0,15) | −0,20 (−0,28; −0,12) |
| Peso aos 550 dias | 0,33 (0,30; 0,35) | 0,05 (0,04; 0,06) | −0,16 (−0,26; −0,07) |

A variância entre estudos (Tabela 8, p. 56: τ² = 0,009 para a h² direta do peso à desmama) importa mais que o intervalo da média. Com τ ≈ 0,095, uma população nova pode estar em qualquer ponto de cerca de 0,15 a 0,33 (±1τ) **[conferido numericamente]**. Uma priori para um rebanho novo deve ter variância da ordem de τ², não do erro-padrão da média. A autora lembra também que correlações direto-maternas muito negativas "têm sido vistas com justificado ceticismo" e que a falta de ligação entre gerações vicia essas estimativas. A meta-análise de Nelore de Rojas de Oliveira et al. (2018) segue **[acesso pago; aguardando PDF]**.

A recomendação deste relatório fica assim **[recomendação deste relatório, apoiada nas fontes citadas]**:
1. Usar como ponto central a meta-análise (h² direta de 0,24 e materna de 0,13 no peso à desmama de zebuínos) ou o valor do programa de referência, quando ele publicar os seus.
2. Fixar σam = 0, como a ANCP e o American Angus, sabendo que é **simplificação operacional, não achado biológico**. A correlação negativa pode ser, em parte, interação touro × rebanho não modelada (Jang et al. 2022), e o Interbeef a mantém diferente de zero.
3. Rodar a avaliação também com h² nos limites de ±1τ (0,15 e 0,33 para o peso à desmama) e conferir se o ranking de vacas e touros do rebanho muda.
4. Com genótipos, preferir o limite inferior, porque h² superestimada aumenta o viés do ssGBLUP (Misztal et al. 2020).

Para populações pequenas, juntar raças num ssGBLUP multirracial com metafundadores elevou a acurácia das raças com menos dados, como já citado para os dados da ANCP (Londoño-Gil et al. 2025).

### Ferramentas que funcionam com N pequeno: razão BIF e MPPA

A razão BIF é o registro dividido pela média do GC, vezes 100. É calculada separadamente para machos, bois e fêmeas, dentro de grupos de contemporâneos da mesma composição racial e de idade semelhante, a partir do peso ajustado a 205 dias e pela idade da mãe ([BIF Glossary](https://guidelines.beefimprovement.org/index.php/Glossary); [BIF, 9ª ed., p. 22](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf)) **[conferido na fonte]**. A v1 dizia "ajustar sexo", mas o BIF separa por sexo. Um bezerro de 230 kg num GC com média de 210 kg tem razão de **109,5**. Se só a metade superior dos bezerros for reportada, a média sobe e a razão do melhor cai: no exemplo do próprio BIF, de 119 para 110 (9ª ed., pp. 16–17) **[conferido na fonte]**. Por isso todos os bezerros do GC precisam ser pesados.

O MPPA (habilidade mais provável de produção) prevê o desempenho futuro de uma vaca a partir das crias que ela já desmamou, encolhendo o desvio dela em direção à média conforme o número de crias e a repetibilidade r. O BIF o define no glossário, sem fórmula; a fórmula vem da calculadora da CattleMax ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa)), que escreve o denominador sem parênteses **[conferido na fonte]**:

```
MPPA = média do rebanho + [n·r / (1 + (n − 1)·r)] × (média da vaca − média do rebanho)
```

A repetibilidade do peso à desmama, que a v1 não tinha encontrado, foi medida em dois rebanhos **[conferido na fonte]**:
- **Nelore a pasto:** 0,33 ± 0,04, com 899 bezerros e peso ajustado a 270 dias (Souza et al. 1994, *R. Bras. Zootec.* 23:133–139, [Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/40526/1/Repetibilidade.pdf)).
- **Bovinos comerciais da Nova Zelândia:** 0,51 ± 0,03 (Weik et al. 2021, Tabela 4).

Há também valores derivados de componentes de variância. Os do composto Montana implicam 0,22 a 0,30 (cálculo do aprofundamento a partir de Medeiros et al. 2026) **[inferência]**, e os do exemplo direto-materno deste relatório, 0,21 a 0,27 **[conferido numericamente]**. Uma vaca com 4 crias de média 230 kg, num rebanho de média 200 kg, com r = 0,33, tem fator 4 × 0,33/(1 + 3 × 0,33) = 0,663 e **MPPA = 200 + 0,663 × 30 = 219,9 kg**. Em razão BIF, uma vaca com crias de razão média 115 tem MPPA de **[conferido numericamente]**:

| Repetibilidade | 1 cria | 2 crias | 4 crias |
|---|---|---|---|
| 0,20 (limite inferior de sensibilidade) | 103,00 | 105,00 | 107,50 |
| 0,33 (Nelore, Souza et al. 1994) | 104,95 | 107,44 | 109,95 |
| 0,51 (Nova Zelândia, Weik et al. 2021) | 107,65 | 110,13 | 112,09 |

Como os valores publicados vão de cerca de 0,2 a 0,5, o MPPA deve ser rodado com as três hipóteses, verificando se as vacas do topo mudam, e 0,33 é o valor central para Nelore até haver estimativa da própria população. Com uma cria, a vaca de razão 115 fica em 104,95 com r = 0,33, no limite do corte de 105 atribuído à Brahman, e passa com r = 0,51. Com duas crias, atinge o corte já com r = 0,20, e com quatro passa em todas as hipóteses. Os artigos clássicos de repetibilidade e MPPA em Hereford e Angus (Minyard e Dinkel 1965; Kress e Burfening 1972; Vanmiddlesworth et al. 1977) estão pagos **[acesso pago; aguardando PDF]**.

### BLUP intra-rebanho: útil para ranquear, limitado para comparar

Rodar o modelo animal do primeiro capítulo com o pedigree da fazenda e variâncias fixadas pela literatura é viável e ranqueia melhor que o fenótipo, porque usa parentes e corrige pelo GC. Os exemplos mostram os limites. Com GCs pequenos, a acurácia de um animal jovem fica em 0,3, abaixo do teto de √h². Em monta natural com touros próprios, sem inseminação, o rebanho tende a ficar desconectado de qualquer referência externa **[inferência das notas]**. Nesse caso, as DEPs internas servem para ordenar animais da fazenda, mas não para comparar com touros de sumário. A conectividade nasce do parentesco entre unidades e aumenta com a proporção de indivíduos que as ligam (Yu, Spangler, Lewis e Morota 2018, [J. Anim. Sci. 96:4490–4500](https://academic.oup.com/jas/article/96/11/4490/5085211)) **[conferido na fonte]**. A referência clássica é Kennedy e Trus (1993, *J. Anim. Sci.* 71:2341–2352, [DOI 10.2527/1993.7192341x](https://doi.org/10.2527/1993.7192341x)) **[acesso pago; aguardando PDF]**. O critério CACO é o método de referência do IBOVAL, desde 2002, para avaliar a conectividade entre rebanhos; rebanhos desconectados são identificados por CACO baixo, e o CACO depende mais do tipo de serviço dos touros (IA ou monta) do que do tamanho do rebanho (Fouilloux, Clément e Laloë 2008, [GSE 40:145](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-40-2-145)) **[conferido na fonte]**. O mesmo artigo registra que o método é usado na avaliação genética de caprinos na França desde 2007, o que interessa ao SeabraApp. A GenSys aplica uma regra direta: GC com menos de 10 laços genéticos diretos ou desconectado sai da análise. Em Nelore, a conectividade calculada só por pedigree pode estar subestimada por causa da monta múltipla, como observa a introdução de Amorim et al. (2020, [J. Anim. Sci. 98:skaa289](https://academic.oup.com/jas/article/98/11/skaa289/5900679)) **[conferido na fonte]**. A BREEDPLAN admite mais de um par de pais por animal justamente por causa da monta com lotes de touros (Boerner e Johnston 2019).

### Informação externa: DEPs de touros e genômica com cautela

A DEP publicada do touro funciona como informação externa de acurácia conhecida e liga o rebanho à população de referência. Os testes genômicos comerciais exigem cautela fora da população em que foram treinados. Basiel, Felix e Dechow (2025, *J. Anim. Sci.* 103:skaf053, [DOI 10.1093/jas/skaf053](https://academic.oup.com/jas/article/doi/10.1093/jas/skaf053/8040885)) avaliaram 259 novilhos beef × Holandês filhos de 8 raças de corte **[conferido na fonte: resumo]**:
- o valor genético molecular (MBV) do teste Igenity para ganho de peso não se associou ao ganho observado, enquanto a DEP do touro ajustada por raça, sim;
- o MBV de consumo alimentar residual não previu o consumo residual nem a conversão;
- ambos previram marmoreio e peso de carcaça, e nenhum previu AOL nem espessura de gordura;
- o MBV de maciez previu a maciez.

No conjunto, a DEP do touro ajustada por raça "performed similarly" ao teste na previsão de crescimento, carcaça e lucro. O estudo não sustenta que a DEP do touro foi melhor em tudo, como dizia a v1. Sustenta que, nesse cruzamento, o teste não acrescentou informação sobre ganho e eficiência. A genotipagem rende mais quando entra no ssGBLUP de um programa com referência grande. A ANCP relatou ter elevado a acurácia de IPP em rebanhos comerciais de 0,28 para 0,41 ([Seminário 2019](https://www.slideshare.net/slideshow/seminrio-ancp-2019-avaliao-genmica-em-rebanhos-comerciais-avanos-lies-e-oportunidades/145292320)) **[não verificado]**.

### Endogamia e tamanho efetivo: o risco escondido do rebanho fechado

O tamanho efetivo de Wright, **Ne = 4·Nm·Nf/(Nm + Nf)**, é a equação clássica de Wright para distribuição de Poisson do número de filhos (Wang, Santiago e Caballero 2016, [Heredity 117:193–206](https://www.nature.com/articles/hdy201643)) **[conferido na fonte]**. O aumento de endogamia por geração, **ΔF ≈ 1/(2Ne)**, também é clássico, mas não foi lido literalmente numa fonte aberta **[não verificado]**. A fonte citada na v1, Weigel (2001, [J. Dairy Sci. 84(E suppl.):E177–E184](https://www.journalofdairyscience.org/article/S0022-0302(01)70213-5/pdf)), só teve o resumo lido, e ele não traz a fórmula. Os dois dão a medida do risco. A taxa anual é ΔF dividido pelo intervalo de gerações, aqui suposto de 5 anos.

| Touros | Vacas | Ne | ΔF por geração | ΔF por ano (L = 5) |
|---|---|---|---|---|
| 5 | 100 | 19,0 | 2,62% | 0,53% |
| 10 | 100 | 36,4 | 1,37% | 0,27% |
| 20 | 100 | 66,7 | 0,75% | 0,15% |
| 40 | 1.000 | 153,8 | 0,33% | 0,07% |
| 80 | 2.000 | 307,7 | 0,16% | 0,03% |

A fórmula supõe acasalamento ao acaso e famílias de tamanho igual, premissas que muitas vezes falham em rebanhos de produção. Concentrar a inseminação em poucos touros reduz o Ne real abaixo dos números da tabela. Para comparação, o Ne estimado por desequilíbrio de ligação foi de cerca de 207 no Angus e 285 no Charolês canadenses, para cerca de 10 gerações atrás (Lu et al. 2012, [Front. Genet. 3:152](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3418579/)). Na Angus americana, pelos autovalores de G, foi de 113 (Pocrnic et al. 2016) **[conferido na fonte]**. Os números dependem do método e do horizonte de tempo. No pedigree do exemplo, um único acasalamento entre meios-irmãos já gerou F = 12,5%. As notas não encontraram benchmark de ΔF para rebanhos de corte; um teto de cerca de 1% por geração é decisão de gestão, não norma.

### Indicadores precisam de intervalo de confiança

O erro binomial de uma taxa de prenhez de 85% é de 3,6 pontos com 100 vacas (intervalo de 95% de ±7,0 pontos), de 1,6 ponto com 500 (±3,1) e de 0,8 ponto com 2.000 (±1,6) **[conferido numericamente]**. Num rebanho de 100 vacas, uma queda de 5 pontos de um ano para o outro não se distingue do acaso; com 2.000, sim. Os sistemas tradicionais de detecção de cio (buçal marcador e observação visual) "são eficazes em apenas 55% a 60% dos animais em cio" ([Embrapa, CT 97](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/888399/1/CT97.pdf)) **[conferido na fonte]**. Por isso o método de diagnóstico e de detecção deve ser registrado junto com o indicador, assim como o denominador.

### Estratégia por porte de rebanho

A tabela traduz as evidências numa recomendação por porte **[proposta deste relatório, baseada nas fontes e nos exemplos acima]**.

| Porte | Avaliação genética | Ferramentas no próprio rebanho | Genômica |
|---|---|---|---|
| 100 a 500 vacas | Inscrever o rebanho num programa nacional (ANCP, PMGZ, Geneplus) ou comprar touros por índice e acurácia, com a escala da acurácia declarada; usar IA para conectar | Razão BIF, MPPA com três repetibilidades (0,20; 0,33; 0,51), indicadores com denominador e intervalo de confiança, controle de F | Só via programa, priorizando touros de reposição |
| 500 a 2.000 vacas | O mesmo, com GCs grandes e IA estruturada (vários touros por GC, touros de referência repetidos entre safras) | BLUP intra-rebanho com variâncias da meta-análise, σam = 0 e teste de sensibilidade de ±1τ, para ranking interno; tendência genética dentro do programa | Novilhas e touros de reposição genotipados no ssGBLUP do programa |
| 2.000 a 5.000 vacas ou mais | Avaliação própria multicaracterística possível, desde que conectada e com parâmetros externos; estimar parâmetros só com estrutura da ordem de 50 touros × 20 filhos | Modelos direto-materno e de limiar com as variâncias fixadas; validação com safras futuras pelo método LR | Genotipagem ampla, com o programa como referência |

## Conclusão

A avaliação genética de corte parece um campo de muitos modelos, mas é uma única máquina, as MME, alimentada com matrizes diferentes. O pedigree entra por A⁻¹, o genoma por H⁻¹, o efeito materno por G₀ ⊗ A⁻¹, as características correlacionadas por R₀⁻¹ e G₀⁻¹, e a idade por funções de covariância. Os grandes programas diferem menos no método do que na escala dos dados e nas escolhas de base, padronização, convenção (como σam = 0), escala de acurácia e índice, e por isso suas DEPs não se comparam entre si. Para uma fazenda, a variável que decide a precisão não é a sofisticação do modelo, mas a quantidade de informação que chega a cada animal: o tamanho e a conectividade dos GCs, o número de parentes avaliados e a presença de touros de referência e de genótipos dentro de uma população grande.

Daí a implicação prática para um software de gestão. O valor está menos em embutir um BLUP sofisticado e mais em garantir que cada pesagem, parto, diagnóstico e paternidade seja registrado de forma que um programa nacional, ou um BLUP intra-rebanho com parâmetros da literatura, possa usá-lo sem perda. As ferramentas simples (razão BIF, MPPA, indicadores com denominador e intervalo de confiança, possível mudança calculada pela fórmula, F e Ne) dão ao produtor leitura imediata. A DEP certa vem da conexão do rebanho com a avaliação nacional, e as duas coisas dependem do mesmo cadastro bem feito.

## O que o rebanho precisa registrar para viabilizar essas análises

Todas as análises acima dependem de poucos dados, desde que completos e consistentes. Três regras valem para todos eles. A primeira é registrar todos os animais do GC, inclusive os descartados e mortos, porque omitir os piores enviesa razões e DEPs. A segunda é registrar datas, não idades, para que o sistema calcule idades-padrão nas janelas de cada programa. A terceira é exportar em formato aceito pelos programas de avaliação.

| Dado | Para que serve | Mínimo necessário |
|---|---|---|
| Identificação única e permanente | Ligar registros, pedigree e genótipo | Brinco ou RFID, raça e composição racial, sexo, data de nascimento |
| Pai e mãe | A⁻¹, efeito materno, idade da vaca, MPPA, F e Ne | Pai individual (ou lote de touros na monta múltipla), mãe com data de nascimento, receptora em TE/FIV |
| Chaves do grupo de contemporâneos | Efeito fixo do modelo | Fazenda, lote de manejo, estação de nascimento, regime alimentar, tratamento diferenciado |
| Pesagens com data | P205/210, PS365/450/550, GMD, regressão aleatória | Peso ao nascer nas primeiras 24 horas, desmama (todo o GC no mesmo dia), sobreano, dentro das janelas do programa; pesagens seriadas quando houver |
| Eventos reprodutivos | Prenhez, IPP, IEP, STAY, perda de gestação, DEPs reprodutivas | Exposição (IATF, IA, monta e touro), diagnóstico com data e método, ECC na estação de monta, parto com escore de facilidade, aborto |
| Saída do rebanho | STAY, sobrevivência, correção do viés de seleção | Data e motivo de descarte, venda ou morte |
| Medidas morfológicas e de carcaça | PE, ultrassom, escores visuais | Perímetro escrotal com data; AOL, EGS, EGP8 e marmoreio com técnico certificado; EPMURAS; temperamento; condição corporal |
| Genótipo | ssGBLUP, confirmação de paternidade | Painel, laboratório e código da amostra |

## Histórico de revisões

- **v1, 14/10/2026.** Compilada por busca na web, quase sempre a partir de resumos e trechos, sem leitura do texto integral.
- **v2, 15/10/2026.** Verificação de 135 itens contra as fontes (78 confirmados, 26 a corrigir, 24 não confirmados, 7 de acesso pago) e aprofundamento com texto completo. Principais mudanças:
  - **Cronologia do single-step.** BREEDPLAN desde outubro de 2017, ampliado raça a raça; IBOVAL previsto para 2025; GenSys com GBLUP de pseudofenótipos em duas etapas; Interbeef com modelo AMACI, sem genômica até janeiro de 2026 e com 14 países em 2020 e cinco na rodada de 2026.
  - **Programas brasileiros.** Método da ANCP (âncora no P120, σam = 0, limiar para 3P, STAY, facilidade de parto e mocho, ssGBLUP com APY e metafundadores no BLUPF90+) e pesos atuais do MGTe, com as quatro variantes de 2026. Avaliação conjunta ABCZ–Embrapa, iABCZ corrigido (10% de PM-EM, sem TMD) e 18,2 milhões de animais na ABCZ.
  - **Equações e autorias.** Sinal da probabilidade no limiar; limitação do método LR, que é da validação cruzada clássica; fórmula de Daetwyler (r, n_G, limite superior); autorias de H, H⁻¹ e dos ajustes de G; núcleo do APY de 10,6 mil a 13 mil animais; ssGWAS SNP a SNP; equações de ω e τ, UPG e metafundadores das revisões, com o erro da Eq. 7 de Zhang et al. (2026).
  - **Conteúdo novo.** Possible Change pela fórmula do BIF, com a observação de que a tabela da ANCP segue a escala r; idade-padrão e idade da vaca (BIF, ABCZ, Nelore); repetibilidade do peso à desmama; prioris e parâmetros externos; benchmarks de cria e recria com definições e limites.
  - **Referências.** Cinco artigos citados como *Animal* são da *Livestock Science*; Rojas de Oliveira et al. (2018); Dias et al. (2004) trata de idade ao primeiro parto; metas de gado de leite retiradas da tabela de corte; conclusão do teste Igenity reduzida ao que o estudo sustenta; exemplo do USMARC de 2023 trocado pelo de 2024; tabela de herdabilidades revista contra as fontes.
  - **Números que mudaram.** ΔF anual com 5 touros e 100 vacas, de 0,52% para 0,53%; ganho genético do cenário de touros genômicos, de 1,56 para 1,55 kg/ano (intensidades sem arredondamento); MPPA do exemplo, de 217,1 kg (r = 0,25) para 219,9 kg (r = 0,33); tabela de MPPA com r de 0,20, 0,33 e 0,51; faixa de sensibilidade da h² do peso à desmama, de 0,20–0,35 para 0,15–0,33.
  - **Marcadores.** Entram [conferido na fonte], [acesso pago; aguardando PDF] e [inferência].

## Apêndice A: script que reproduz os exemplos

O script usa apenas numpy e a biblioteca padrão do Python (math e statistics), roda em poucos segundos e reproduz todos os números dos exemplos. A versão 2 acrescenta:
- as acurácias da análise bicaracterística, a repetibilidade implícita e a análise com σam = 0 (seções 3 e 4);
- a equivalência dos ajustes de G de Chen et al. e de Christensen et al., o GBLUP contra o SNP-BLUP e o APY (seção 5);
- o MPPA com r = 0,20, 0,33 e 0,51 e a tabela de Ne e ΔF (seção 7);
- a possível mudança (seção 10), a idade-padrão e a idade da vaca (seção 11) e os demais números do texto, que a v1 deixava como "aplicações diretas" (seção 12).

A simulação de Monte Carlo usa semente fixa; com outra semente, os desvios-padrão variam na terceira casa decimal. O script foi rodado com python3 e numpy em 15/10/2026, e cada número do texto confere com a saída. As exceções são as conversões de libras para quilos da tabela de idade da vaca (× 0,45359) e os valores copiados das fontes.

```python
# Reproduz os exemplos do relatorio, versao 2 (somente numpy e a biblioteca padrao). python3 apendice.py
import math
from statistics import NormalDist
import numpy as np
np.set_printoptions(precision=4, suppress=True, linewidth=120)
N01 = NormalDist()

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
print("r -> aBIF:", {r: round(1 - math.sqrt(1 - r * r), 3) for r in (.5, .6, .8, .9, .98)})

# 3. Modelo direto-materno com ambiente permanente materno
mae = {4: 2, 5: 3, 6: 5, 7: 3, 8: 0}; maes = [2, 3, 5]
Z2 = np.array([np.eye(n)[mae[r]-1] if mae[r] else np.zeros(n) for r in reg])
W = np.array([np.eye(3)[maes.index(mae[r])] if mae[r] else np.zeros(3) for r in reg])
s2p, s2e2 = 30., 230.

def direto_materno(G0):
    T = np.hstack([X, Z, Z2, W]); L = T.T @ T / s2e2
    L[2:2+2*n, 2:2+2*n] += np.kron(np.linalg.inv(G0), Ainv); L[2+2*n:, 2+2*n:] += np.eye(3) / s2p
    u = np.linalg.solve(L, T.T @ y / s2e2)
    return u[2:2+n], u[2+n:2+2*n], u[2+2*n:]

G0 = np.array([[100., -15.], [-15., 40.]])
ad, am, pe = direto_materno(G0); s2P = G0[0, 0] + G0[1, 1] + G0[0, 1] + s2p + s2e2
print("s2P =", s2P, "| pe maes 2,3,5 =", pe)
for i in range(n):
    print(f"animal {i+1}: DEPd={ad[i]/2:5.2f} DEPm={am[i]/2:5.2f} TMD={am[i]/2 + ad[i]/4:5.2f}")
# repetibilidade implicita: cov(dois bezerros da mesma vaca) = A_ij*s2a + s2m + sam + s2p
print("repetibilidade implicita: meios-irmaos =", round((.25 * G0[0, 0] + G0[1, 1] + G0[0, 1] + s2p) / s2P, 3),
      "| irmaos completos =", round((.5 * G0[0, 0] + G0[1, 1] + G0[0, 1] + s2p) / s2P, 3))
ad0, am0, _ = direto_materno(np.array([[100., 0.], [0., 40.]]))   # mesma analise com sam = 0 (convencao da ANCP)
print("sam = 0: DEPd =", ad0 / 2, "\n         DEPm =", am0 / 2,
      "\n         maior mudanca: DEPd", round(np.abs(ad0 - ad).max() / 2, 2), "DEPm", round(np.abs(am0 - am).max() / 2, 2))

# 4. Bicaracteristica PD + PS450 (animal 8 vendido na desmama: sem PS)
ps = {4: 305., 5: 290., 6: 330., 7: 300.}
G0m, R0 = np.array([[100., 105.], [105., 225.]]), np.array([[300., 100.], [100., 400.]])
rows = [(0, k, a, y[k]) for k, a in enumerate(reg)] + [(1, reg.index(a), a, v) for a, v in ps.items()]
Xm = np.array([np.eye(4)[2 * t + gc[k]] for t, k, a, v in rows])
Zm = np.array([np.eye(2 * n)[t * n + a - 1] for t, k, a, v in rows]); ym = np.array([r[3] for r in rows])
Rm = np.array([[R0[t1, t2] if a1 == a2 else 0 for t2, _, a2, _ in rows] for t1, _, a1, _ in rows])
Tm = np.hstack([Xm, Zm]); Lm = Tm.T @ np.linalg.inv(Rm) @ Tm; Lm[4:, 4:] += np.kron(np.linalg.inv(G0m), Ainv)
um = np.linalg.solve(Lm, Tm.T @ np.linalg.inv(Rm) @ ym); Cm = np.linalg.inv(Lm)
s1, C1 = mme(np.eye(2)[[gc[reg.index(a)] for a in ps]], np.eye(n)[[a - 1 for a in ps]],
             np.array(list(ps.values())), Ainv, R0[1, 1] / G0m[1, 1])
r_bi = np.sqrt(1 - np.diag(Cm)[4+n:] / ((1 + F) * G0m[1, 1]))
r_uni = np.sqrt(1 - np.diag(C1)[2:] * R0[1, 1] / ((1 + F) * G0m[1, 1]))
print("EBV_PS bicaracteristica:", um[4+n:], "\nEBV_PS unicaracteristica:", s1[2:])
print("r PS bicaracteristica:", r_bi, "\nr PS unicaracteristica:", r_uni)

# 5. ssGBLUP: genotipos (31 SNPs) dos animais 1, 4, 5, 6, 7
gen = [1, 4, 5, 6, 7]
M = np.array([[int(c) for c in s] for s in (
    "1112211011110212210111202111201", "1112111000010112111122202110110", "0111211112101111201100111121200",
    "1002111011111101211111101121100", "0202112001101101201112112110100")])
p = M.mean(0) / 2; Zg = M - 2 * p; k2 = 2 * np.sum(p * (1 - p)); G = Zg @ Zg.T / k2
i2 = [g - 1 for g in gen]; i1 = [i for i in range(n) if i not in i2]; A22 = A[np.ix_(i2, i2)]
md, mg = lambda Q: np.diag(Q).mean(), lambda Q: Q.mean()
mo = lambda Q: (Q.sum() - np.trace(Q)) / (len(Q) * (len(Q) - 1))   # media fora da diagonal
print("media de G =", G.mean(), "| posto de G =", np.linalg.matrix_rank(G), "| media de A22 =", round(mg(A22), 2))
beta = (md(A22) - mg(A22)) / (md(G) - mg(G)); alpha = md(A22) - beta * md(G)
phi_c = (md(A22) - mo(A22)) / (md(G) - mo(G)); delta_c = md(A22) - phi_c * md(G)   # forma de Chen et al.
print("alfa, beta =", round(alpha, 3), round(beta, 3), "| Chen (diagonal e fora da diagonal):", round(delta_c, 3), round(phi_c, 3),
      "| diferenca:", abs(alpha - delta_c) + abs(beta - phi_c))
Gw = 0.95 * (alpha + beta * G) + 0.05 * A22
Hinv = Ainv.copy(); Hinv[np.ix_(i2, i2)] += np.linalg.inv(Gw) - np.linalg.inv(A22)
Q = np.linalg.inv(A22); H = np.zeros((n, n))
H[np.ix_(i1, i1)] = A[np.ix_(i1, i1)] + A[np.ix_(i1, i2)] @ Q @ (Gw - A22) @ Q @ A[np.ix_(i2, i1)]
H[np.ix_(i1, i2)] = A[np.ix_(i1, i2)] @ Q @ Gw; H[np.ix_(i2, i1)] = H[np.ix_(i1, i2)].T; H[np.ix_(i2, i2)] = Gw
solH, CH = mme(X, Z, y, Hinv, lam)
print("erro H^-1 vs inv(H):", np.abs(Hinv - np.linalg.inv(H)).max(), "| parentesco 4-5: A =", A[3, 4], "G_w =", round(Gw[1, 2], 2))
print("EBV ssGBLUP:", solH[2:], "\nr ssGBLUP:", np.sqrt(1 - np.diag(CH)[2:] * s2e / (np.diag(H) * s2a)))
# GBLUP x SNP-BLUP nos 4 genotipados com registro (4 a 7), G sem ajuste
Zs, Xg, yg = Zg[1:], X[:4], y[:4]
Gs = Zs @ Zs.T / k2; Vg = s2a * Gs + s2e * np.eye(4); Vgi = np.linalg.inv(Vg)
bg = np.linalg.solve(Xg.T @ Vgi @ Xg, Xg.T @ Vgi @ yg); g_gblup = s2a * Gs @ Vgi @ (yg - Xg @ bg)
ss, _ = mme(Xg, Zs, yg, np.eye(Zs.shape[1]), s2e / (s2a / k2))
print("GBLUP:", g_gblup, "| SNP-BLUP:", Zs @ ss[2:], "| diferenca:", np.abs(g_gblup - Zs @ ss[2:]).max())
# APY: nucleo = 4 primeiros genotipados (1 fora) e 2 primeiros (3 fora)
def apy_inv(Gm, core):
    nc = [i for i in range(len(Gm)) if i not in core]; Gcci = np.linalg.inv(Gm[np.ix_(core, core)])
    Gcn = Gm[np.ix_(core, nc)]; m = np.diag(Gm)[nc] - np.einsum('ij,jk,ki->i', Gcn.T, Gcci, Gcn)
    T = np.zeros((len(Gm), len(nc))); T[np.ix_(core, range(len(nc)))] = -Gcci @ Gcn; T[nc, range(len(nc))] = 1
    out = np.zeros_like(Gm); out[np.ix_(core, core)] = Gcci
    return out + T @ np.diag(1 / m) @ T.T
for core in ([0, 1, 2, 3], [0, 1]):
    print(f"APY nucleo {[gen[c] for c in core]}: diferenca para inv(G_w) =", np.abs(apy_inv(Gw, core) - np.linalg.inv(Gw)).max())

# 6. Indices: Smith-Hazel (PD, PS) e indice economico de dois touros
P = G0m + R0; v = np.array([2., 4.]); bsh = np.linalg.solve(P, G0m @ v); sI = math.sqrt(bsh @ P @ bsh)
print("b =", bsh, "| r_IH =", math.sqrt(bsh @ P @ bsh / (v @ G0m @ v)), "| resposta (i = 1):", G0m @ bsh / sI, "R$", sI)
w = np.array([10., 6., -40., 15., 8., 5.])            # R$/unidade: PD210, PS450, IPP, STAY, PE365, AOL
tA, tB = np.array([12., 20., .5, -2., .8, 1.5]), np.array([6., 10., -1.2, 4., 1.2, 2.])
sdg = np.array([5., 7.5, 1., 5., .8, 2.])            # DP genetico das DEPs (hipotetico)
eA, eB = [math.sqrt(np.sum(w**2 * (1 - r**2) * sdg**2)) for r in (0.90, 0.45)]
d = w @ tB - w @ tA
print("I_A =", w @ tA, "I_B =", w @ tB, "| DP erro:", round(eA, 1), round(eB, 1),
      "| P(B>A) =", round(N01.cdf(d / math.hypot(eA, eB)), 2))
pct, sinal, term = np.array([.15, .20, .15, .30, .10, .10]), np.array([1, 1, -1, 1, 1, 1]), np.array([1, 1, 0, 0, 0, 1])
print("padronizado: A =", round(np.sum(pct * sinal * tA / sdg), 3), "B =", round(np.sum(pct * sinal * tB / sdg), 3),
      "| terminal: A =", w * term @ tA, "B =", w * term @ tB)

# 7. Rebanho: MPPA (repetibilidade 0,20 / 0,33 / 0,51), Ne e dF, erro binomial
f = lambda k, r: k * r / (1 + (k - 1) * r)
print("MPPA (4 crias de 230 kg, rebanho 200 kg, r = 0,33): fator =", round(f(4, .33), 3), "MPPA =", round(200 + f(4, .33) * 30, 1))
for r in (.20, .33, .51):
    print(f"MPPA razao 115, r = {r}:", [round(100 + 15 * f(k, r), 2) for k in (1, 2, 4)])
for nm, nf in ((5, 100), (10, 100), (20, 100), (40, 1000), (80, 2000)):
    ne = 4 * nm * nf / (nm + nf)
    print(f"Ne({nm} touros, {nf} vacas) = {ne:.1f} | dF/geracao = {100/(2*ne):.2f}% | dF/ano (L=5) = {100/(2*ne)/5:.2f}%")
for N in (100, 500, 2000):
    ep = math.sqrt(.85 * .15 / N); print(f"prenhez 85%, N={N}: EP = {100*ep:.1f} p.p., IC95 = +-{196*ep:.1f} p.p.")

# 8. Regressao aleatoria (Legendre normalizado de ordem 2, idades 100-550 d)
leg = lambda t: (lambda x: np.array([math.sqrt(.5), math.sqrt(1.5) * x, math.sqrt(2.5) * (3 * x * x - 1) / 2]))(-1 + 2 * (t - 100) / 450)
K, c = np.array([[300., 90., 10.], [90., 60., 5.], [10., 5., 8.]]), np.array([4., 1.5, .2])
print({t: (leg(t).round(3), round(leg(t) @ K @ leg(t), 1), round(leg(t) @ c / 2, 2)) for t in (120, 210, 365, 450)})
f1, f2 = leg(210), leg(450)
print("DEP de ganho 210-450 =", round((f2 - f1) @ c / 2, 2), "| r_g(210,450) =", round(f1 @ K @ f2 / math.sqrt((f1 @ K @ f1) * (f2 @ K @ f2)), 2))

# 9. Monte Carlo: erro-padrao de h2 (meios-irmaos paternos, h2 = 0,30)
rng = np.random.default_rng(7)
for s, k in ((5, 20), (20, 25), (50, 20), (100, 30)):
    est = []
    for _ in range(5000):
        yv = rng.normal(0, math.sqrt(.3 / 4), (s, 1)) + rng.normal(0, math.sqrt(1 - .3 / 4), (s, k))
        msb = k * yv.mean(1).var(ddof=1); msw = ((yv - yv.mean(1, keepdims=True))**2).sum() / (s * (k - 1))
        s2s = (msb - msw) / k; est.append(4 * s2s / (s2s + msw))
    est = np.array(est)
    print(f"{s}x{k}: DP(h2) = {est.std():.3f}  P(h2<0) = {np.mean(est < 0):.3f}  P(0,10<h2<0,50) = {np.mean((est > .1) & (est < .5)):.2f}")

# 10. Possible Change (BIF 9a ed., p. 73): PC = t (1 - aBIF) sigmaA / 2
pc = lambda a_bif, sA, t=1: t * (1 - a_bif) * sA / 2
print("PC 68% do animal 4 (sigmaA = 10 kg):", round(pc(1 - math.sqrt(PEV[3] / s2a), 10.), 2))
sA = 2 * 8.24            # DP450: PC em acuracia zero = sigmaA/2 = 8,24 kg (implicito na tabela da ANCP)
print("DEP P450 = +12, aBIF = 0,70: PC68 =", round(pc(.70, sA), 2), "PC95 =", round(pc(.70, sA, 2), 2),
      "| se 0,70 for r: aBIF =", round(1 - math.sqrt(1 - .49), 3), "PC68 =", round(pc(1 - math.sqrt(1 - .49), sA), 2))
print("tabela ANCP DP450 refeita como 8,24*sqrt(1-a^2):", [round(8.24 * math.sqrt(1 - a * a), 2) for a in (.05, .3, .5, .7, .9, .99)],
      "| pela formula BIF:", [round(8.24 * (1 - a), 2) for a in (.05, .3, .5, .7, .9, .99)])
print("Red Angus YW (PC em 0 = 25,9 lb):", [round(25.9 * (1 - a), 1) for a in (0, .3, .5, .7, .9)], "| sigmaA implicito =", 2 * 25.9)

# 11. Idade-padrao e idade da vaca
pn, pd, idd = 32., 190., 190.                         # bezerro macho, mae de 2 anos
g1 = (pd - pn) / idd; p205 = g1 * 205 + pn; aj = 60 * 0.45359  # BIF, Apendice 3.1: +60 lb (macho, vaca de 2 anos)
print(f"GMD = {g1:.4f} | P205 BIF = {p205:.1f} | com ajuste de idade da vaca (+{aj:.1f} kg) = {p205 + aj:.1f}")
pc210 = pn + g1 * 210                                  # ABCZ, CDP 2023: PC = PN + G x N
g2 = (300. - pd) / (380. - idd)                         # segunda pesagem: 300 kg aos 380 dias
pc365 = pc210 + g1 * (idd - 210) + g2 * (365 - idd)
print(f"ABCZ: PC210 = {pc210:.1f} | G2 = {g2:.4f} | PC365 = {pc365:.1f} | BIF 365 = {g2 * 160 + p205 + aj:.1f} (sem ajuste de idade da vaca: {g2 * 160 + p205:.1f})")
bocchi = {"CO machos": (4.2851344, -0.2483338), "CO femeas": (3.3046839, -0.1935391), "S machos": (5.2697710, -0.3033255),
          "SE machos": (3.8290361, -0.2264371), "NE machos": (3.4821773, -0.2232814)}
for nome, (b1, b2) in bocchi.items():
    imax = -b1 / (2 * b2); fq = lambda t: b1 * t + b2 * t * t
    print(f"Bocchi 2004, {nome}: maximo em {imax:.1f} anos; diferenca para o maximo:",
          {t: round(fq(t) - fq(imax), 1) for t in (3, 4, 6, 14, 16)})

# 12. Demais numeros do texto
print("Missouri: r*i =", round(2.8 * 5 / 26.3, 2))
i_sel = lambda prop: N01.pdf(N01.inv_cdf(1 - prop)) / prop
im, if_ = i_sel(.10), i_sel(.70)
print(f"i(10%) = {im:.3f} i(70%) = {if_:.3f} | dG = {(0.70*im + 0.50*if_)*10/9.5:.2f} e {(0.40*im + 0.50*if_)*10/11:.2f} kg/ano")
for prev in (.5, .3):
    z = N01.pdf(N01.inv_cdf(prev)); print(f"Dempster-Lerner/Robertson: p = {prev}: h2_obs = {0.5 * z * z / (prev * (1 - prev)):.3f}")
anos = np.arange(2020, 2026); tg = np.polyfit(anos, [1.8, 2.3, 2.9, 3.2, 3.9, 4.4], 1)[0]; tf = np.polyfit(anos, [196., 199., 195., 203., 206., 204.], 1)[0]
print(f"tendencia: DEP {tg:.3f}, EBV {2*tg:.2f}, fenotipica {tf:.2f}, ambiental {tf - 2*tg:.2f} kg/ano")
for r in (.5, .7):
    print(f"Daetwyler 2008 (h2 = 0,30, n_G = M_e = 5.000): N para r = {r}:", round(r * r * 5000 / (.3 * (1 - r * r))))
print("Giannotti 2004, PD: h2 = 0,24 +- tau =", round(math.sqrt(.009), 3), "->", round(.24 - math.sqrt(.009), 2), "a", round(.24 + math.sqrt(.009), 2))
print("USMARC 2024 (peso de carcaca, lb): Red Angus 20,0 - 5,4 =", round(20 - 5.4, 1), "| Hereford 75,0 - 66,4 =", round(75 - 66.4, 1))
print("kg desmamados/vaca exposta =", 0.80 * 195, "| eficiencia materna =", round(195 / 450**.75, 2), "| razao BIF =", round(230 / 210 * 100, 1))
```
