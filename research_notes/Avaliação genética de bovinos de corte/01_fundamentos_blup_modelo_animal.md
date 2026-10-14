# Fundamentos estatísticos do BLUP modelo animal para DEPs/EPDs de bovinos de corte

**Escopo e status das fontes.** Notas para o redator técnico sobre a maquinaria de modelos mistos por trás das DEPs (Brasil) e EPDs (EUA, Austrália, Europa).

- A pesquisa foi feita só com WebSearch (WebFetch e HTTP estavam indisponíveis). Foram lidos títulos, metadados e trechos de busca, **não textos integrais**. Os graus de confirmação aparecem entre parênteses: "registro bibliográfico", "trecho de busca, não lido", "fonte secundária".
- Equações e regras de cálculo que não aparecem em fonte lida estão marcadas **[não verificado]** e vieram do conhecimento de fundo do redator. Antes de usar em documento, conferir em Henderson (1975, 1976), Quaas (1976) e Mrode (2014).
- Notação: o enunciado pede y = Xb + Za + e. Muitas fontes usam y = Xb + Zu + e, com u = a no modelo animal simples **[não verificado]**.
- O limite de ~15 buscas foi atingido. Os itens não pesquisados estão em "Gaps" de cada seção.

**Discrepâncias que o redator precisa resolver:**
- Quaas & Pollak: a maioria das listas dá 1980 (J Anim Sci 51:1277–1287). Uma lista de referências traz o DOI 10.2527/jas1981.5161277x, com "1981" no DOI.
- O DOI 10.2307/2529339 aparece associado a Henderson 1976 (Biometrics 32:69–83). Quaas 1976 (Biometrics 32:949–953) não tem DOI confirmado; um resultado de busca atribuiu o mesmo DOI aos dois artigos.
- Westell, Quaas & Van Vleck 1988: volume e páginas (J Dairy Sci 71:1310–1318) vêm de repositório. Autoria e título não foram confirmados. O título "Genetic groups in an animal model" é lembrança do redator **[não verificado]**. O título pedido pelo coordenador ("Estimation of genetic groups") não apareceu em nenhum resultado.
- Gilmour, Thompson & Cullis (1995): uma referência secundária dá "2015, 51, 1440", erro evidente de digitação.
- Primeira DEP genômica do programa Nelore: 2011 na página do programa; 2014 na linha do tempo da ANCP.
- Mrode (2014): catálogos dão 343 páginas e outros 360 (Goodreads). Um resultado cita 13 capítulos para a 2ª edição (2005), mas o texto não é claro.
- Strandén & Garrick (2009): o registro bibliográfico descreve "equivalent computing algorithms" para predições genômicas e confiabilidades. Não há indício de que trate de PCG, como o coordenador supôs.

**Tabela de estado das fontes**

| Fonte | Confirmação | Uso |
|---|---|---|
| Quaas & Pollak (1980), J Anim Sci 51:1277–1287 | Título e volume; ano divergente; URL não identificada | Aplicação do BLUP em corte |
| Henderson (1975), Biometrics 31:423–447 | Registro secundário (Wikipedia) | Modelo animal sob seleção |
| Henderson (1976), Biometrics 32:69–83 | Registro secundário | Regras para A⁻¹ |
| Quaas (1976), Biometrics 32:949–953 | Registro AGRIS | A⁻¹ e F para grandes pedigrees |
| Meuwissen & Luo (1992), GSE 24:305–313 | DOI na URL de busca | Algoritmo de F |
| Westell, Quaas & Van Vleck (1988), J Dairy Sci 71:1310–1318 | Volume e páginas; autoria não confirmada | Grupos genéticos |
| Gilmour, Thompson & Cullis (1995), Biometrics 51:1440–1450 | Registro bibliográfico (ed.ac.uk) | AI-REML |
| Mrode (2014), CABI, 3ª ed. | Registro de biblioteca | Referência-texto |
| Vandenplas et al. (2020), GSE | Trecho de PMC | PCG para ssSNPBLUP |
| INIA (2024) sobre BLUPF90 | Trecho de busca | Estado atual dos programas |

---

## 1. Modelo animal, pressupostos de (co)variância e Equações de Modelo Misto (MME)

### Takeaway
O modelo animal trata o valor genético aditivo de cada animal como efeito aleatório com covariância proporcional à matriz de parentesco A. A solução conjunta pelas MME de Henderson, com λ = σ²e/σ²a, dá BLUE para os efeitos fixos e BLUP para os valores genéticos. As fontes lidas confirmam a aplicação histórica em bovinos de corte, mas não a derivação formal.

### Cited Findings
- Quaas & Pollak, "Mixed model methodology for farm and ranch beef cattle testing programs", J Anim Sci 51:1277–1287 (1980; ano divergente, ver preâmbulo). Trecho de busca, não lido: aplicaram BLUP a dezenas de milhares de registros de bovinos de corte de fazendas e ranchos da América do Norte, com peso ao nascer, peso à desmama, peso de carcaça e facilidade de parto. URL do artigo não identificada nos resultados.
- Henderson, C. R. (1975), "Best linear unbiased estimation and prediction under a selection model", Biometrics 31(2):423–447. DOI 10.2307/2529430 e PMID 1174616 segundo referência secundária: [Source](https://en.wikipedia.org/wiki/Best_linear_unbiased_prediction) (fonte de baixa confiabilidade, usada só para metadados). Trecho de busca de Schaeffer & Henderson (fonte não identificada): o trabalho trata predição de efeitos aleatórios em modelos lineares gerais e no caso de seleção.
- Mrode, R. A. (2014), *Linear Models for the Prediction of Animal Breeding Values*, 3ª ed., CABI, Wallingford (UK). ISBN 9781845939816 (brochura) e 9781780643915 (capa dura). Cap. 15 de Robin Thompson. Registro de biblioteca: [Source](https://ebook.library.uitm.edu.my/Record/22148). Sumário: [Source](https://ebook.library.uitm.edu.my/Record/22148/TOC). Trecho: 17 capítulos sobre modelos multicaracterísticos, seleção genômica, efeitos não aditivos, análise de sobrevivência e amostragem de Gibbs. Goodreads marca a brochura como esgotada (OP) ([Source](https://www.goodreads.com/work/editions/918392-linear-models-for-the-prediction-of-animal-breeding-values-cabi-publish?page=1)).
- Notas de curso de Van der Werf (UNE): capítulo 12, "The numerator relationship matrix" ([Source](https://jvanderw.une.edu.au/Chapter12.pdf)), e capítulo 14, "Genetic groups" ([Source](https://jvanderw.une.edu.au/Chapter14.pdf)). Títulos confirmados; conteúdo não lido.

Forma matricial (**[não verificado]**; ver "Gaps" para a conferência com Henderson 1975 e Mrode 2014):

```
Modelo animal (forma pedida):
  y = X b + Z a + e
  E[a] = 0 ; E[e] = 0 ; cov(a, e) = 0
  var(a) = A σ²a          (A = matriz de parentesco aditivo)
  var(e) = I σ²e
  var(y) = Z A Z' σ²a + I σ²e        (sem efeitos maternos nem ambiente permanente)

Razão de variâncias:
  λ = σ²e / σ²a          h² = σ²a / (σ²a + σ²e)   =>   λ = (1 − h²) / h²

Equações de Modelo Misto de Henderson (MME):
  [ X'X      X'Z        ] [ b̂ ]   [ X'y ]
  [ Z'X   Z'Z + λ A⁻¹   ] [ â ] = [ Z'y ]
```

Observação: o termo λA⁻¹ é o mesmo que σ²e·G⁻¹ com G = Aσ²a e R = Iσ²e. Em MME gerais, a matriz de coeficientes é X'R⁻¹X, X'R⁻¹Z, Z'R⁻¹Z + G⁻¹ **[não verificado]**.

### Inferences
- A forma MME evita inverter A: basta A⁻¹ (ver seção 2). A dimensão do sistema é o número de animais no pedigree mais os efeitos fixos, e não o número de registros.
- λ define o grau de encolhimento (shrinkage) dos valores genéticos em direção à média. Com h² baixa, λ é grande e o encolhimento é forte.
- Para a versão multicaracterística com efeitos maternos, G e R viram matrizes em blocos (Kronecker). Isso precisa de fonte própria (Mrode 2014) **[não verificado]**.

### Gaps
- Derivação formal das MME a partir da densidade conjunta (Henderson 1973, 1975, 1984) não foi lida. O livro de Henderson de 1984, "Applications of linear models in animal breeding" (Univ. Guelph), não foi pesquisado **[não verificado]**.
- Notas de Schaeffer (Guelph) e de Kennedy não foram pesquisadas.
- Efeitos maternos e ambiente permanente, que as DEPs de corte usam em Nelore e em outras raças, não foram pesquisados.

---

## 2. Matriz de parentesco aditivo A: construção tabular, A⁻¹ direto (Henderson 1976; Quaas 1976) e F (Meuwissen & Luo 1992)

### Takeaway
A⁻¹ pode ser montada diretamente do pedigree, sem formar A, por regras de Henderson (1976), com a generalização de Quaas (1976) para endogamia. Meuwissen & Luo (1992) dão um algoritmo para os coeficientes de endogamia em grandes pedigrees. Os detalhes das regras vêm de fontes secundárias e precisam ser conferidos nos artigos originais.

### Cited Findings
- Henderson, C. R. (1976), Biometrics 32:69–83, DOI 10.2307/2529339 (registro de busca secundária; título não confirmado). Um artigo de 2021 diz que Henderson (1976) e Quaas (1976) apresentaram métodos para derivar A⁻¹ diretamente do pedigree, sem formar A, e que Henderson desenvolveu regras para montar A⁻¹ diretamente: [Source](https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2021.655638/full) (fonte secundária; DOI 10.3389/fgene.2021.655638 extraído da URL).
- Quaas, R. L. (1976), "Computing the diagonal elements and inverse of a large numerator relationship matrix", Biometrics 32(4):949–953 (registro AGRIS, [Source](https://agris.fao.org/search/en/records/647359b008fd68d54601dd34)). O subtítulo no registro trata de coeficientes de endogamia para número muito grande de animais. Um resultado de busca diz que Quaas (1976) generalizou as regras para pedigrees grandes e com endogamia (fonte da afirmação não identificada).
- Meuwissen, T. H. E. & Luo, Z. (1992), "Computing inbreeding coefficients in large populations", Genetics Selection Evolution 24:305–313. DOI 10.1186/1297-9686-24-4-305 ([Source](https://doi.org/10.1186/1297-9686-24-4-305); registro de busca, resumo e método não lidos).
- O programa CoeFR (Satoh, Tohoku) baseia o cálculo de endogamia no algoritmo de Meuwissen & Luo (1992): [Source](https://www.agri.tohoku.ac.jp/animalbreeding/program/CoeFR/CoeFR_English_Manual.pdf) (manual; trecho de busca).
- Documento do INRAE (HAL, hal-02833573) citado em resultado de busca como uso de Meuwissen & Luo no programa PEDIG (Boichard). O trecho diz que o algoritmo é muito rápido para pedigrees com menos de 15 gerações. Vínculo entre o documento e o PEDIG não confirmado: [Source](https://hal.inrae.fr/hal-02833573/document).
- Sargolzaei et al. (2005), "Comparison of four direct algorithms for computing inbreeding coefficients", Animal Science Journal, DOI 10.1111/j.1740-0929.2005.00282.x ([Source](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1740-0929.2005.00282.x)). Só o título foi visto.
- Artigo de 2022 em ScienceDirect, "A new computational approach to Henderson's method of computing the inverse of a numerator relationship matrix" ([Source](https://www.sciencedirect.com/science/article/pii/S1871141322000282)). Revista não identificada; só o título foi visto.
- O pacote AGHmatrix (R) monta A pelo método recursivo de Mrode (2014) descrito em Henderson (1976): [Source](https://cran.r-project.org/web/packages/AGHmatrix/vignettes/Tutorial_AGHmatrix.html). Útil para conferir exemplos numéricos.
- Um resultado de busca diz que Henderson foi o método mais rápido em pedigrees de 20.000 animais, com cerca de 32 a 42 s por pedigree. Fonte primária não identificada: **[não verificado]**.

Regras (**[não verificado]**: conhecimento de fundo, a conferir em Henderson 1976 e Mrode 2014):

```
Definição tabular (Wright): A_ii = 1 + F_i ; A_ij = ½ (A_is + A_id) para j anterior a i
  F_i = ½ · A_sd     (s = pai, d = mãe)

Regras diretas para A⁻¹ (acumulação animal a animal):
  A⁻¹ = Σ_i  t_i · D_i⁻¹ · t_i'
  t_i = [1, −½, −½]' sobre (i, s, d) se ambos os pais são conhecidos
  t_i = [1, −½]'     sobre (i, p)    se só um pai é conhecido
  t_i = [1]          se nenhum pai é conhecido

  D_i⁻¹ (ambos os pais conhecidos) = 1 / (0,5 − 0,25·(F_s + F_d))   ; com F = 0 → 2
  D_i⁻¹ (um pai conhecido)         = 1 / (0,75 − 0,25·F_p)         ; com F = 0 → 4/3   [forma com F a conferir]
  D_i⁻¹ (nenhum pai conhecido)     = 1                             ; com F = 0 → 1

Efeito com F = 0 (ambos conhecidos): (i,i) += 2 ; (i,s) e (i,d) += −1 ; (s,s), (d,d) += 0,5 ; (s,d) += 0,5
Efeito com F = 0 (um conhecido):     (i,i) += 4/3 ; (i,p) += −2/3 ; (p,p) += 1/3
Efeito com F = 0 (nenhum):           (i,i) += 1
```

Relação usada: D_i = σ²m/σ²a, em que σ²m é a variância do desvio mendeliano do animal i. Logo D_i⁻¹ = 1/(σ²m/σ²a) **[não verificado]**.

### Inferences
- A forma tabular é a mais simples para pedigrees pequenos e serve para exemplos didáticos: calcula-se A por recursão e depois inverte-se, para comparar com A⁻¹ direto.
- Para pedigrees de dezenas de milhares de animais, o cálculo de F (Meuwissen & Luo; Quaas) e de A⁻¹ direto é o que torna o modelo animal viável. O caminho usual é ler o pedigree já ordenado do ancestral para o descendente **[não verificado]**.
- O redator pode montar um exemplo com pedigree de 5 a 7 animais, calcular A pelo método tabular e A⁻¹ pelas regras, e conferir os dois. Isso é uma sugestão de método, não uma fonte.

### Gaps
- Não foi lido o texto integral de nenhum dos artigos clássicos (Henderson 1976, Quaas 1976, Meuwissen & Luo 1992). As regras acima são de memória e não foram conferidas.
- A forma exata de D_i⁻¹ com endogamia (um pai conhecido) não foi confirmada.
- O artigo sobre "genetically identical animals" em GSE (GSE 41:25, [Source](https://gsejournal.biomedcentral.com/counter/pdf/10.1186/1297-9686-41-25.pdf)) apareceu nos resultados. Não foi lido.
- Um tópico em aberto para o redator é a relação A⁻¹ com genotipados (A22, H). Um technical note do INIA, "Avoiding direct inversion of numerator relationship matrix for genotyped animals" ([Source](https://inia.uy/technical-note-avoiding-direct-inversion-numerator-relationship-matrix-genotyped-animals-single)), apareceu, mas não foi lido. Autoria não capturada.

---

## 3. Grupos genéticos desconhecidos (phantom parent groups)

### Takeaway
Pais desconhecidos ou importados de outra população violam a suposição de animais-base não relacionados com a mesma média. Os grupos genéticos recebem efeitos fixos para absorver essas diferenças de média, sem enviesar os valores genéticos dos animais selecionados. Westell, Quaas & Van Vleck (1988) é a referência para os coeficientes desses termos nas MME.

### Cited Findings
- Westell, R. A., Quaas, R. L. & Van Vleck, L. D. (1988), J Dairy Sci 71:1310–1318. Volume e páginas de repositório da Univ. de Nebraska ([Source](https://digitalcommons.unl.edu/animalscifacpub/index.11.html); listagem geral, não o item). Trecho de busca do resumo: o artigo descreve um método para definir coeficientes nos termos de grupo genético das MME, de modo que touros e vacas possam ser resolvidos pelo valor genético total num modelo animal. Incluir todas as relações conhecidas parece reduzir a necessidade de termos de grupo para seleção e tendência genética. Grupos são necessários quando animais entram na população vindos de fora ou quando pais sem registro são escolhidos. Autoria e título não confirmados (ver preâmbulo).
- Van der Werf, notas de curso (UNE), capítulo 14, "Genetic groups" ([Source](https://jvanderw.une.edu.au/Chapter14.pdf)). Título confirmado; conteúdo não lido.
- Quaas & Pollak (1980/1981) são associados à transformação Q-P, que simplifica as MME quando há grupos genéticos. Trecho de busca, sem confirmação de que esteja no artigo de 1980 **[não verificado]**.

Estrutura (**[não verificado]**, conhecimento de fundo):

```
y = X b + Z a + W g + e
  g = efeitos fixos de grupo genético (um por grupo: origem, época, país)
  a = valores genéticos dos animais com pedigree (incluindo pais desconhecidos representados como "animais fantasma")
  Cada pai desconhecido recebe o grupo g_k; sua relação com os demais animais segue a proporção do grupo
  A⁻¹ modificado incorpora os coeficientes de grupo (Westell et al. 1988; Quaas 1988, não pesquisado)
```

### Inferences
- A justificativa para grupos é a mesma para as DEPs de corte: quando as médias genéticas dos grupos fundadores diferem (por importação, mudança de raça, uso de animais de fora), a suposição de base comum falha. Sem grupos, a tendência genética e as DEPs de animais selecionados podem vir enviesadas.
- O redator deve explicar com cuidado a diferença entre "pai desconhecido" (phantom) e "grupo genético" (efeito fixo), já que as fontes lidas não as separam explicitamente.

### Gaps
- Quaas (1988), citado pelo coordenador, não foi pesquisado.
- Não foi lido o texto de Westell et al. (1988). Os coeficientes exatos e o método de modificação de A⁻¹ não foram confirmados.
- Não há fonte lida sobre grupos genéticos em bovinos de corte brasileiros (Nelore). Esse é um ponto a pesquisar.

---

## 4. Grupos de contemporâneos, conectividade e ajustes (BIF e prática brasileira)

### Takeaway
Pelas regras BIF, um grupo de contemporâneos reúne animais de mesmo sexo, idade próxima e manejo comum, e deve separar diferenças ambientais das genéticas. As regras de tamanho mínimo, conectividade e ajustes (205 dias, 365 dias, 550 dias, idade da mãe) não foram encontradas nas buscas. No Brasil, a ANCP usa grupos de contemporâneos como efeito fixo em modelo animal desde os anos 1990, mas os detalhes ainda precisam ser lidos nas teses e na documentação oficial.

### Cited Findings
- BIF, página "Contemporary Groups": grupos formados por sexo, idade semelhante e manejo comum ([Source](https://guidelines.beefimprovement.org/index.php/Contemporary_Groups); trecho de busca).
- BIF, Glossário: sexo igual, idade próxima, manejo igual no mesmo local, alimentação, pasto e época ([Source](https://guidelines.beefimprovement.org/index.php/Glossary); trecho de busca).
- BIF, "Weaning Weight": na definição de grupo de desmama, os bezerros devem ser desmamados e pesados no mesmo dia ([Source](https://guidelines.beefimprovement.org/index.php/Weaning_Weight); trecho de busca).
- BIF, "Calving Difficulty": usa os mesmos grupos do peso ao nascer ([Source](https://guidelines.beefimprovement.org/index.php/Calving_Difficulty); trecho de busca).
- Janela de nascimento: a página BIF de marmoreio dá 90 dias como ideal ([Source](https://guidelines.beefimprovement.org/index.php/Marbling_score)). O ICAR recomenda 60 dias ([Source](https://www.icar.org/Guidelines/03-Beef-Cattle-Recording.pdf)). As duas fontes divergem.
- Regras de divisão e fusão: grupos podem encolher após a estação de parição, mas não crescer. Grupos divididos não podem ser reunidos de novo. Animais com tratamento diferente (teste de ganho, animais de exposição) formam grupo próprio ([Source](https://guidelines.beefimprovement.org/index.php/Contemporary_Groups); trecho de busca).
- Edição 9 do BIF Guidelines (2010), PDF hospedado por associação de raça: lista rebanho, estação e faixa etária dentro do grupo, além da composição racial ([Source](https://www.senepolcattle.com/images/Forms/Beef_Bible-BIF-Guidelines_9th_Edition-12-17-2010.pdf); trecho de busca). Não há 10ª edição confirmada.
- Relatório do BIF 2016 (comitê de consumo alimentar): passou a usar um único grupo de desmama, sem subdivisão posterior ([Source](https://www.bifconference.com/bif2016/summaries/BIF2016-Weaber-Feed-Intake.htm); resumo de conferência).
- ANCP, história do Programa Nelore: começou em 1988 com dados de rebanhos cedidos à USP de Ribeirão Preto; mudou o nome para Programa Nelore Brasil em 2003. Um trecho de busca diz que o programa foi pioneiro no modelo animal, com DEPs diretas e maternas desde 1993 ([Source](https://www.ancp.org.br/ancp/historia/); trecho, não lido).
- Página do programa Nelore da ANCP: DEP combina desempenho individual, pedigree e progênie, e sua precisão cresce com mais informação ([Source](https://www.ancp.org.br/programas/nelore/); trecho, não lido). Uma notícia sobre o índice MGTe diz que ele é usado desde 2016 e cobre 33 características ([Source](https://www.semadesc.ms.gov.br/ancp-anuncia-indice-bio-economico-para-programa-nelore-brasil/); trecho, não lido). Um material mais antigo cita 28 características e mais de 300 rebanhos, então está defasado.
- DFRAME (DEP de estrutura) foi lançada em 2020 segundo trecho de busca sem fonte identificada **[não verificado]**.
- Modelo usado em análise de Nelore (fonte não identificada entre as teses): grupo de contemporâneos como efeito fixo, e efeitos genéticos aditivos direto, materno e residual como aleatórios **[não verificado]**. Outro trecho diz que uma tese adotou a fazenda como critério de grupo para precocidade sexual (fonte não identificada).
- Teses e dissertações a ler (não lidas): UESB, "Estrutura populacional e progresso genético em rebanhos da raça Nelore" ([Source](https://www2.uesb.br/ppg/ppz/wp-content/uploads/2018/09/TESE_NELORE_9.05.2018_final.pdf)); Embrapa, interação genótipo-ambiente em rebanhos Nelore ([Source](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/83175/1/CA-Amanda-de-Sousa-Matos.pdf)); Embrapa, "Parâmetros genéticos, tendências e resposta à seleção" ([Source](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/172796/1/Dissertacao-ParametrosGeneticosTendencias.pdf)); tese de Vozzi, depositada na ANCP ([Source](https://ancp.org.br/up_artigos/Vozzi_tese.pdf)). Esta última aparece com cabeçalho de Faculdade de Medicina de Ribeirão Preto, o que precisa ser checado.

### Inferences
- Para o redator, o conceito de grupo de contemporâneos em bovinos de corte é um arranjo de sexo, idade, manejo, rebanho e época, com regras de divisão que dependem do protocolo de cada programa. Não há uma definição única.
- A diferença entre a janela de nascimento de 60 dias (ICAR) e a de 90 dias (BIF) precisa ser explicada no texto, porque afeta o tamanho e a composição dos grupos.
- A prática brasileira costuma usar fazenda-ano-estação como base do grupo de contemporâneos. Isso não foi confirmado nas fontes lidas e fica como hipótese para checar nas teses.

### Gaps
- **Tamanho mínimo de grupo**: nenhuma fonte encontrada. Não há valor de referência confirmado; não se deve inventar um.
- **Conectividade**: nenhuma fonte encontrada. A conectividade entre rebanhos (via touros comuns e grupos de referência) não foi pesquisada.
- **Ajustes de peso (205 dias, 365 dias, 550 dias, fator de idade da mãe)**: não foram encontrados nas buscas. Conhecimento de fundo: ajustes de peso à desmama e de idade da mãe segundo tabelas BIF **[não verificado]**. O redator precisa das fórmulas e tabelas do BIF Guidelines (edição vigente) e da ANCP.
- **Documentação técnica oficial da ANCP** (modelo, GC e parâmetros) não foi lida. Os trechos de busca são de página institucional e de teses, sem fórmula de modelo.
- **Australia (BREEDPLAN/ABRI) e Europa (ICAR)**: não pesquisados. A diretriz ICAR de registro de corte, seção 3, foi citada acima, mas só o trecho sobre janela de nascimento foi visto.

---

## 5. Estimação de componentes de variância e software

### Takeaway
REML é o padrão para estimar σ²a e σ²e. A AI-REML (Gilmour, Thompson & Cullis 1995) é a versão mais usada em programas comerciais por ser eficiente. A família BLUPF90 (Misztal et al.) oferece REML (AIREMLF90) e Gibbs (GIBBSF90) para modelos animais. ASReml, WOMBAT, DMU, MTDFREML e MiX99 não foram pesquisados; seus papéis abaixo são conhecimento de fundo.

### Cited Findings
- Gilmour, A. R., Thompson, R. & Cullis, B. R. (1995), "Average information REML: an efficient algorithm for variance parameter estimation in linear mixed models", Biometrics 51(4):1440–1450 (registro bibliográfico: [Source](https://archives.collections.ed.ac.uk/repositories/2/archival_objects/52870) e [Source](https://www.research.ed.ac.uk/en/publications/average-information-reml-an-efficient-algorithm-for-variance-para/)). O algoritmo usa a média entre informação observada e esperada e foi motivado por dados de experimentos de trigo em Nova Gales do Sul (1.071 experimentos, 10 anos, 60 locais), segundo resumo de busca.
- Referência secundária de 2019 (autor e revista não identificados) diz que o algoritmo foi generalizado para modelos mistos gerais e implementado em vários pacotes REML, incluindo o ASReml. Não é fonte primária.
- ASReml: a afirmação de que o uso de AI e de métodos esparsos explica sua eficiência vem de um espelho da Wikipédia em IPFS (baixa confiabilidade): [Source](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/ASReml.html). Não usar sem confirmação.
- Newton-type methods for REML em genética quantitativa, arXiv 0711.2619 ([Source](https://arxiv.org/pdf/0711.2619)). Só o título foi visto.
- BLUPF90 family: o INIA (2024) relata que o `blupf90plus` reúne `blupf90`, `remlf90` e `airemlf90`. O `gibbsf90plus` reúne `gibbs2f90`, `gibbs3f90`, `thrgibbs1f90` e `thrgibbs3f90` ([Source](https://www.inia.uy/sites/default/files/publications/2024-10/36-012.pdf); documento de 2024, trecho de busca).
- Outra listagem de software (HPC universitário) traz as versões `blupf90+` e `gibbsf90+` ([Source](https://docs.ern.ufs.ac.za/software/ern/blupf/1.0_f3ef900.html)).
- Referência do manual BLUPF90 (Misztal, Tsuruta, Lourenço, Aguilar, Legarra & Vitezica, 2014), PDF no wiki da UGA ([Source](http://nce.ads.uga.edu/wiki/lib/exe/fetch.php?media=blupf90_all1.pdf)). Citada por outra fonte; não aberta. Lista de programas: [Source](http://nce.ads.uga.edu/html/projects/programs/).
- Licença: os programas BLUPF90 são gratuitos para pesquisa, com exigência de citação (trecho de busca; fonte não identificada).
- Manual antigo do PigPAK avisa que o AIREMLF90 pode não suportar alguns modelos e estruturas de dados ([Source](https://ag2.kku.ac.th/monchai/blup/prog/PigPAK_Manual.pdf); manual antigo, usar com cautela).
- Um estudo brasileiro de inferência bayesiana com modelos unicaracterísticos usou GIBBS3F90 e THRGIBBS1F90 (estudo não identificado; trecho de busca). Não se deve atribuir esse uso à ANCP sem confirmação.
- REML derivative-free (Meyer, DFREML) e sua relação com o algoritmo de média informação: não pesquisados.

Fórmulas (**[não verificado]**, conhecimento de fundo; conferir em Patterson & Thompson 1971, Gilmour et al. 1995 e Mrode 2014):

```
Log-verossimilhança restrita (REML), com V = Z G Z' + R:
  ℓ_R = −½ [ log|V| + log|X'V⁻¹X| + y'Py ] + const
  P = V⁻¹ − V⁻¹X (X'V⁻¹X)⁻¹ X'V⁻¹

Atualização de Average Information (AI):
  θ_(k+1) = θ_k + AI⁻¹ · s
  AI_ij = ½ · y'P (∂V/∂θ_i) P (∂V/∂θ_j) P y
  s_i = ∂ℓ_R/∂θ_i

Atualização EM-REML para σ²a (q = número de animais com pedigree):
  σ²a(novo) = [ â'A⁻¹â + tr(C^{22} A⁻¹) σ²e ] / q
```

Métodos Bayesianos: amostragem de Gibbs a partir das condicionais completas. As DEPs seriam as médias a posteriori dos valores genéticos; a variância a posteriori das estimativas fornece a precisão **[não verificado]**.

### Inferences
- AI-REML é a base de vários programas comerciais (ASReml e outros). Isso é inferência a partir de fontes secundárias, não confirmada pela documentação de cada programa.
- A escolha REML × Gibbs depende do objetivo: REML estima variâncias pontuais rapidamente; Gibbs dá distribuições a posteriori e permite inferir sobre parâmetros e mais de uma característica com modelos complicados. Afirmação de fundo **[não verificado]**.

### Gaps
- Não foram pesquisados DFREML (Meyer, 1989-1991), WOMBAT (Meyer, 2007), MTDFREML (Boldman et al., 1995), DMU (Madsen & Jensen) e MiX99 (Strandén & Mäntysaari). Os usos atribuídos a eles abaixo são de memória **[não verificado]**:
  - DFREML/MTDFREML: REML sem derivadas, multicaracterística.
  - WOMBAT: REML multicaracterística com AI e cálculo de PEV.
  - DMU: REML multicaracterística, com modelos complexos.
  - MiX99: REML e BLUP para dados de bovinos e suínos.
  - ASReml: REML com AI, para modelos gerais e análises de campo.
- Os artigos originais sobre EM-REML (Henderson 1984 e Misztal) não foram pesquisados.
- O documento de Misztal e a comparação entre os softwares não foram lidos. Não há dado de desempenho confirmado.

---

## 6. Solução de sistemas grandes e prediction error variance (PEV)

### Takeaway
Para sistemas grandes, a solução iterativa com pré-condicionamento (PCG) ou Gauss-Seidel sobre os dados substitui a inversão direta. A PEV é a parte da inversa da matriz de coeficientes das MME que corresponde aos efeitos aleatórios, multiplicada por σ²e. Os artigos de PCG lidos são de aplicação, não de derivação.

### Cited Findings
- Tsuruta, S., Misztal, I. & Strandén, I. (2001), "Use of preconditioned conjugate gradient algorithm as a generic solver for mixed-model in animal breeding applications". Periódico não identificado **[não verificado]**: [Source](https://jukuri.luke.fi/items/6bbbd5ec-6bd9-471f-a6f0-b24a88242ae4/full). Trecho de busca, não lido.
- Strandén & Lidauer (1999) e Lidauer et al. (1999), pioneiros do PCG para equações de modelo de dados de controle leiteiro. Citação secundária **[não verificado]**.
- Vandenplas et al. (2020), Genetics Selection Evolution, "Computational strategies for the preconditioned conjugate gradient method applied to ssSNPBLUP, with an application to a multivariate maternal model" ([Source](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7222437/); PMC, trecho de busca). Aplicação a modelo multicaracterístico com efeitos maternos, relevante para corte.
- Strandén, I. & Garrick, D. J. (2009), "Derivation of equivalent computing algorithms for genomic predictions and reliabilities of animal merit", J Dairy Sci (periódico não confirmado, 2971–2975) ([Source](https://jukuri.luke.fi/items/7ff5f6de-d8a9-4204-bd41-1d208e485272/full)). O registro trata de predições genômicas e confiabilidades. Não é fonte sobre PCG.
- PEV e confiabilidade (conhecimento de fundo, **[não verificado]**): PEV(â) = C^{22}·σ²e, em que C = M⁻¹ e M é a matriz de coeficientes das MME, com o bloco C^{22} correspondente aos efeitos de animal. Confiabilidade r² = 1 − PEV/σ²a = 1 − λ·C^{22}_ii.

### Inferences
- Gauss-Seidel sobre os dados (iteração sobre os dados, como no BLUPF90) evita montar a matriz de coeficientes explicitamente. A PCG acelera a convergência com um pré-condicionador. Ambos são aplicações de fundo, não confirmadas por fonte lida.
- A PEV exige a inversa de M, parte da qual é calculada por métodos de inversão parcial ou por aproximações. Esse ponto é relevante para a confiabilidade das DEPs e precisa de fonte própria.

### Gaps
- Gauss-Seidel: nenhuma fonte lida. Não foram pesquisados Misztal (sobre iteração sobre os dados) nem os livros de Mrode.
- Não há fonte lida sobre métodos de cálculo de PEV ou de confiabilidade para grandes sistemas.
- Não há fonte lida sobre como a ANCP calcula e divulga a acurácia das DEPs.

---

## 7. Modelo de touro, modelo animal e modelo animal reduzido

### Takeaway
O modelo animal substituiu o modelo de touro porque usa todas as relações de pedigree e registros de todos os animais. Há indícios de uso do modelo animal nos EUA a partir de 1980 (Quaas & Pollak) e no Brasil a partir de 1993 (ANCP, trecho de busca). O modelo animal reduzido não foi pesquisado.

### Cited Findings
- Henderson (1975), BLUP sob modelo de seleção, Biometrics 31(2):423–447 (ver seção 1). Trecho de busca (Schaeffer & Henderson, não identificado): os resultados de 1975 se estendem ao modelo de seleção.
- Quaas & Pollak (1980/1981): aplicação do modelo animal BLUP a dados de rebanhos de corte nos Estados Unidos e Canadá (ver seção 1).
- ANCP: DEPs diretas e maternas pelo modelo animal desde 1993, segundo trecho de busca ([Source](https://www.ancp.org.br/ancp/historia/); não lido).
- Revisão de 1990 sobre programas nacionais de melhoramento de corte nos EUA diz que a teoria dos modelos lineares mistos já tinha ampla aplicação na indústria americana. Autor e ano da revisão não confirmados ([Source](https://www.sasas.co.za/?p=2612); trecho de busca).

Modelo de touro (conhecimento de fundo, **[não verificado]**): o valor genético do touro é estimado pelas progênies, usando apenas a relação pai-filho, sem registros das mães nem dos próprios animais e sem a matriz A completa. O modelo animal reduzido, citado no enunciado, reduz o número de equações mantendo só os animais com registros e seus ancestrais; a fonte não foi pesquisada **[não verificado]**.

### Inferences
- A transição de touro para animal é uma mudança do modelo, não do algoritmo. Os mesmos conceitos de MME e BLUP se aplicam; o que muda é a matriz de relação e o número de equações.
- Para o texto técnico, a data exata de adoção do modelo animal em cada programa precisa de fonte primária (documentos dos programas ou teses). As datas acima são de trechos de busca e devem ser confirmadas.

### Gaps
- Modelo de touro: a referência clássica de Harvey (LSMLMW e programas de touro) não foi pesquisada **[não verificado]**.
- Modelo animal reduzido: não foi pesquisado.
- Australia (BREEDPLAN) e Europa (programas de corte) não foram pesquisados.
- Não há fonte lida sobre o uso de modelo animal em programas brasileiros além da ANCP (por exemplo, Embrapa e programas de outras raças).
- Os periódicos brasileiros (Revista Brasileira de Zootecnia, Arquivo Brasileiro de Medicina Veterinária e Zootecnia) e o Journal of Animal Breeding and Genetics não foram pesquisados diretamente.

### Síntese transversal (todas as seções)

1. A base teórica (modelo, MME, λ, PEV) é padrão, mas nenhuma derivação foi lida. O redator deve citar Henderson (1975) e Mrode (2014) para a forma e conferir os exemplos numéricos contra o cálculo direto.
2. Para A⁻¹ e F, os artigos de Henderson (1976), Quaas (1976) e Meuwissen & Luo (1992) são os primários. As regras de A⁻¹ desta nota são de memória e precisam de conferência.
3. Grupos de contemporâneos e ajustes são o ponto em que Brasil e EUA mais diferem na prática. As regras BIF são acessíveis; as brasileiras ainda dependem das teses e da documentação da ANCP, que não foram lidas.
4. Software: BLUPF90 (REML e Gibbs), ASReml (AI-REML) e os demais (WOMBAT, DMU, MiX99, DFREML) precisam de confirmação de versão e de uso antes de serem citados como fato.
5. Para exemplos numéricos, a sugestão é usar um pedigree de 5 a 7 animais, comparar A e A⁻¹ pelo método tabular e pelas regras, e resolver a MME para λ = 2 ou 4 com um registro por animal. Isso é método do redator, não fonte.
