# Aprofundamento: avaliação genética de bovinos de corte (lacunas do relatório v1)

Pesquisa feita em 15/10/2026 com texto completo das fontes. O objetivo é trazer o que faltava no relatório `reports/Avaliação genética de bovinos de corte.md`, que foi escrito só com resumos de busca. A verificação das equações e das referências já presentes no relatório é feita por outro pesquisador e não está aqui.

**Convenções deste arquivo.**
- **[LIDO]**: a frase ou o número foi lido no documento original, e a página ou seção vem indicada. As citações literais ficam entre aspas, com quebras de linha e hifenização removidas.
- **[INFERÊNCIA]**: conclusão minha a partir do que foi lido. Não está escrita na fonte.
- **[NÃO ENCONTRADO]**: procurei e não localizei em fonte aberta.
- "PDF p." é a página do arquivo PDF. A numeração impressa pode diferir e, quando difere, está dita.
- Os PDFs e páginas lidos ficam em `/tmp/claude-0/-home-user-sistemas-seabra-web/2f601efb-0b7e-558e-b507-febc0682ae9c/scratchpad/fontes/aprofundamento/`.

**Nota sobre o acesso ao site da ANCP.** O `www.ancp.org.br` falhava com "unable to get local issuer certificate", e não era timeout. O servidor envia só o certificado da folha (Let's Encrypt, emissor "YE2") e omite o intermediário. Não desliguei a verificação TLS. Baixei o intermediário `int-ye2` e o `root-ye-by-x2` no site oficial da Let's Encrypt (`letsencrypt.org/certs/gen-y/`) e confirmei com `openssl verify` que a cadeia folha → YE2 → Root YE → ISRG Root X2 fecha contra o repositório de CAs que já existia na máquina (resultado "OK"). Usei esse conjunto só para chamadas ao domínio da ANCP. Com isso foi possível ler os sumários originais de 2023, 2024, 2025 e 2026. A Wayback Machine e o OpenAlex não funcionaram nesta sessão: o primeiro derrubou a conexão, e o segundo respondeu que o orçamento diário gratuito do IP estava esgotado. Usei Crossref, Europe PMC, SciELO e os sites oficiais.

---

## Lacuna 1. Metodologia oficial dos programas brasileiros (2023 a 2026)

### 1.1 ANCP, Programa Nelore Brasil (documento mais completo e mais recente)

**Fontes lidas** (todas da própria ANCP, baixadas de `ancp.org.br`):
- Sumário de Touros, edição agosto de 2026 (114 páginas, 30º Seminário, 14/08/2026): `https://www.ancp.org.br/wp/wp-content/uploads/2026/08/ANCP-Sumário-de-Touros-2026-20082615h-20.pdf`
- Sumário de Touros, edição 2025 (160 páginas): `https://www.ancp.org.br/app/assets/sumario-ANCP-2025-v2.pdf`
- Sumários de agosto de 2024 (132 páginas) e de agosto de 2023 (116 páginas), mesmos diretórios `wp-content/uploads/`.
- Páginas institucionais: `/programas/conceitos-basicos/acuracia/`, `/mgte-merito-genetico-total-economico/`, `/ancp/historia/`.

**Modelo.** Seção "Análise dos Dados", PDF p. 104 do sumário 2026 (o texto é idêntico em 2023, 2024 e 2025):
- "As avaliações genômicas das raças Nelore, Guzerá, Brahman, Tabapuã e Sindi são realizadas por meio da metodologia dos modelos mistos, sob modelo animal."
- "As DEPs foram preditas sob modelo animal completo uni-característica e bi-característica, sendo que o peso aos 120 dias de idade foi a característica âncora. As covariâncias entre o efeito maternal e direto foram assumidas como zero."
- "Para todas as raças é utilizado o método do passo único genômico BLUPF90+ (ssGBLUPF90+ – single-step genomic BLUPF90+), utilizando o algoritmo APY (Algorithm for Proven and Young)."
- "Para a avaliação genômica multirracial nas raças Guzerá, Brahman e Tabapuã foi implementada a metodologia de metafundadores com um metafundador por raça."
- "As DEPs para Facilidade de Parto (DFPP), Caráter Mocho (DMOCHO), 3P e Stayability utilizam modelo de limiar, e a interpretação dessas DEPs representa probabilidade de sucesso."
- "A DACAB, predita sob modelo animal bi-característica, é resultado da análise em conjunto das características de Espessura de Gordura na Garupa (EGP8) e Espessura de Gordura entre a 12ª e a 13ª costelas (EG)."
- Para CAR, IMS, IPM e SAM, "foram publicadas DEPs somente dos animais genotipados ou fenotipados para as mesmas, ou daqueles que possuem o mínimo de 10 progênies genotipadas ou fenotipadas".

**Efeitos aleatórios e fixos.** O texto "Contextualização e metodologia" da nota técnica dos 30 anos (PDF p. 90, sumário 2026) diz que "Os modelos estatísticos incluíram os efeitos fixos de grupo de contemporâneos e efeitos aleatórios genéticos aditivos, incluindo efeito genético materno e de ambiente permanente materno para P210 e MP120". A nota informa também que as tendências foram obtidas "por regressão linear das DEPs padronizadas em função do ano de nascimento" e que o ssGBLUP rodou "com o software BLUPF90+F90 (Lourenço et al., 2022)". O sumário não lista os demais efeitos fixos (idade da vaca, sexo, covariáveis de idade). Esse detalhe continua em aberto para a ANCP. **Ponto de atenção:** o relatório v1 usa σam = −15 no exemplo direto-materno, e a ANCP declara covariância direto-materna igual a zero em todas as avaliações.

**Grupo de contemporâneos.** A ANCP não publica uma definição formal no sumário. Há duas fontes:
- Texto assinado pelo Prof. Ricardo da Fonseca (UNESP), PDF p. 89, sumário 2026: "Vários grupos de contemporâneos são formados utilizando os dados de rebanho, sexo, ano, estação de nascimento e grupo de manejo". Antes, o texto diz que as datas de nascimento servem para "determinação do ano e estação de nascimento" e que o grupo de manejo "permite a definição das diferenças de manejo nutricional, de pastos".
- Artigos científicos escritos por analistas da ANCP, com dados do Programa Nelore Brasil: "Contemporary groups (CG) were defined as the combination of farm, management group, year and birth season (dry season from April to September and the rainy season from October to March)" (Pereira et al. 2026, J. Anim. Breed. Genet., DOI 10.1111/jbg.70033, seção 2.3, PMC13054113). O outro artigo da série, DOI 10.1111/jbg.70026 (PMC13054110), define o GC como "farm, year and season of birth and animal management group".
- O sumário 2026 diz, na fala do CEO, que a ANCP "revisitou todas as etapas da avaliação genética, do recebimento e da validação dos dados das propriedades à formação dos grupos contemporâneos" (nota de imprensa de 20/08/2026). Os critérios novos de formação não foram publicados.
- A nota da Profa. Sabrina Caetano (PDF p. 87) afirma que "critérios mais consistentes na formação dos grupos de contemporâneos proporcionam estimativas de herdabilidade superiores e reduzem o ruído ambiental" (estudo sobre IVUP, característica de longevidade por análise de sobrevivência, ainda não incluída no sumário).
- O seminário ANCP 2019 (slides) lista como atualização técnica "Componentes de variância – Grupo de contemporâneos – Definição 3P e Stay" e mostra mudanças de DEP e acurácia do P455 "em GC < 3". Não li o slide completo, apenas o texto indexado.

**Janelas de pesagem aceitas** (PDF p. 101–102): o programa tem três cronogramas com quatro pesagens por ano. No 3º cronograma, as idades aceitas são: 120 dias (intervalo de 70 a 165), 210 dias (165 a 255), 365 dias (320 a 410) e 450 dias (405 a 495). "Para o 3º Cronograma as mensurações fora do intervalo permitido não serão utilizadas para o cálculo das DEPs." Para o gado comercial (PMGC), a 1ª pesagem fica entre 90 e 150 dias, a desmama entre 180 e 240 dias e a pesagem do sobreano entre 405 e 495 dias. Ultrassom entre 330 e 640 dias. Avaliação morfológica entre 365 e 610 dias. A ANCP recomenda ainda pesar a vaca adulta uma vez por ano na desmama e registrar o peso ao nascer real.

**Software.** PDF p. 104: "Para a predição dos valores genéticos e acurácias foram utilizados os programas computacionais BLUPF90+90iod3, cBLUPF90+90iod2OMP1 e accf90GS2 (Misztal et al., 2002, 2013)". Componentes de variância: "BLUFP90+ e GIBBSF90+" (grafia do documento). No sumário 2023 (PDF p. 102) a lista era "BLUP90IOD2, CBLUPIOD e ACCF90GS"; no de 2025 (PDF p. 142) já aparece "accf90GS2". Os artigos de 2026 citam "CBLUP90IOD2OMP1 (v. 3.38) for threshold models and BLUP90IOD3 (v. 3.138) for linear models", com Gibbs sampling no GIBBSF90+ (300.000 iterações, 100.000 de descarte, amostragem a cada 100).

**Escala de acurácia.** Página oficial `/programas/conceitos-basicos/acuracia/`: "O cálculo da acurácia utilizado é o recomendado pela Beef Improvement Federation, conhecida por Acurácia BIF, que varia linearmente de acordo com o número de filhos avaliados." E, para animais genotipados: "A acurácia genômica está ligada à capacidade preditiva da DEP (Habilidade Preditiva)... Ambas acurácias, tradicional e genômica, não são diretamente comparáveis." O sumário 2025 (PDF p. 134) explica que "o cálculo da acurácia em animais genotipados e em não genotipados envolve abordagens distintas" e que "a capacidade preditiva do genótipo ... é maior que 0,90 para características de carcaça (AOL e Acabamento), acima de 0,80 para características de crescimento e reprodutivas e acima de 0,60 para características relacionadas com eficiência alimentar". Para animais jovens genotipados, "as acurácias genômicas variam pouco, isto é, discriminam pouco os indivíduos".

**Observação sobre a tabela de "Possível Mudança" da ANCP** (PDF p. 105, sumário 2026; nível de 68%, acurácia de 5 a 99%). Testei numericamente a tabela de sete características (DIPP, MP120, MP210, DP365, DP450, DPE365, DAOL). Todas seguem **PC = σ·√(1 − a²)**, com a coluna "Acurácia" tratada como correlação r. Para DP450, σ = 8,24 e a conta reproduz 8,23 (a = 5%), 7,14 (50%) e 1,16 (99%), com erro máximo de 0,005. Já a fórmula do BIF, PC = (1 − a_BIF)·σ_u/2, daria cerca de 4,1 em 50% e 0,09 em 99%. **[INFERÊNCIA]** A tabela da ANCP foi construída na escala r, embora o texto diga que a acurácia é a "BIF". Antes de usar essa tabela num produto, é preciso perguntar à ANCP qual escala é a da coluna "Acurácia" do sumário.

**Índice MGTe e variantes** (PDF p. 97–99, sumário 2026; PDF p. 138 do sumário 2025):

| Índice | Característica (peso) |
|---|---|
| MGTe Nelore, versão 2023 a 2025 (lida em 2023, 2024 e 2025) | 3P 17%, STAY 21%, PE365 4% (fertilidade e precocidade sexual: 42%); MP120 9%; P210 19%, P450 15% (crescimento: 34%); AOL 12%, ACAB 3% (carcaça: 15%). Soma 100% |
| MGTe Guzerá, Brahman e Tabapuã, 2023 a 2025 | IPP 7%, STAY 23%, PE365 12% (42%); MP120 9%; P210 19%, P450 15%; AOL 12%, ACAB 3%. Soma 100% |
| MGTe_CR Nelore, 2026 | 3P 24%, STAY 30%, PE365 6%, MP120 13%, P210 27% |
| MGTe_RE Nelore, 2026 | P450 50%, AOL 40%, ACAB 10% |
| MGTe_CO Nelore, 2026 | P450 14%, AOL 34%, ACAB 22%, MAR 10%, CAR 20% |
| MGTe_F1 Nelore, 2026 | P450 14%, AOL 25%, ACAB 30%, MAR 14%, CAR 17% |
| MGTe_CR Guzerá, Brahman, Tabapuã e Sindi, 2026 | IPP 10%, STAY 33%, PE365 17%, MP120 13%, P210 27% |
| MGTe_RE Guzerá, Brahman, Tabapuã e Sindi, 2026 | P450 49%, AOL 41%, ACAB 10% |

Todas as somas conferem 100%. Texto oficial: o MGTe é "um índice de seleção bioeconômico desenvolvido pela ANCP" que usa "indicadores econômicos e produtivos de uma propriedade de pecuária de corte comercial de ciclo completo (cria, recria e engorda), localizada no Brasil Central". Os pesos dependem dos valores econômicos e "também a informação de herdabilidade e correlações genéticas" (sumário 2025). Os quatro índices específicos nasceram em 2022 (CR, RE, CO, F1) e o MGTe foi atualizado em 2023 (cronologia em `/ancp/historia/`). **Correção ao relatório v1:** os pesos que o relatório atribuiu ao MGTe (24% DP450, 22% DSTAY, 16% DP210 etc., de Segs e Zancaner) são de uma versão anterior a 2023, e a ANCP publica hoje os da tabela acima. No sumário 2026 a tabela do MGTe "tradicional" não é reimpressa. **[INFERÊNCIA]** Os pesos de 2025 continuam valendo para o MGTe geral, mas isso não está dito no PDF de 2026.

**Quando a ANCP passou a usar ssGBLUP** (cronologia em `/ancp/historia/`):
- 1993: modelo animal com DEP direta e materna.
- 2011: DEPs-AG (auxiliadas pela genômica) com marcadores Clarifide.
- 2014: primeiras DEPs genômicas da raça Nelore.
- **2017: DEPs genômicas de maciez, ingestão de matéria seca e consumo alimentar residual "estimadas utilizando a metodologia de passo único genômico BLUP (ssGBLUP)"**.
- **2019: "Utilização do método do passo único genômico (ssGBLUP) na análise genômica para predição da DEP genômica de todas as características ANCP."**
- 2022: DEPG Interim e os quatro índices específicos.
- 2023: seis avaliações por ano, DEP genômica para mocho, MGTe atualizado e início do programa Sindi.
- 2025: GPR, STAY54, LAC e LPA; o sumário passa a incluir Sindi.
- A nota dos 30 anos (PDF p. 91) cita "ssGBLUPF90+ (2017/2019)" e a marca de 2014 como "divisor de águas".

**Escala e calendário.** "Publicando anualmente cinco avaliações genéticas com DEPs para 34 características" (PDF p. 90), mais de 5 milhões de animais, "mais de 600 mil genotipados" e mais de 700 fazendas. A página de histórico diz seis avaliações a partir de 2023, e o cronograma do PDF p. 103 lista seis fechamentos: 15/02, 15/04, 15/06, 15/08, 15/10 e 30/11, com liberação dois meses depois. O número "cinco" do PDF p. 90 conflita com os demais, e o cronograma prevalece. A matriz da análise de tendência tinha 3.825.953 animais de 450 fazendas.

**Pesos de referência em 2026** (PDF p. 106, "ANCP em números", Nelore): P210 média 201,03 kg (2.186.036 obs.); P450 319,58 kg; PN 34,50 kg; PE365 21,84 cm; IPP 35 meses; STAY 30%; e **PAC (kg de bezerro desmamado por vaca por ano) 174,04 kg (220.829 obs.)**. Esse último é um benchmark real de kg desmamados e será usado na lacuna 6.

**O que continua em aberto (ANCP):** efeitos fixos além do GC (idade da vaca, sexo, covariáveis), valores de herdabilidade e de componentes de variância (o sumário não publica), o critério novo de formação de GC de 2026 e o tamanho mínimo de GC.

### 1.2 ABCZ (PMGZ) e Embrapa-Geneplus: avaliação conjunta desde 2018

**Fonte principal.** Documento "Apresentação geral" do sumário ABCZ–Embrapa, PDF de 8 páginas hospedado em `https://www.abczstat.com.br/comunicacoes/sumario/apresentacao/apresentacao_geral.pdf`. Os metadados do PDF indicam criação em 03/07/2026, e ele traz o iABCZ de 2024. É a descrição mais atual de modelo, software e pesos. Páginas citadas são do PDF.

**Histórico e escala** (PDF p. 1): "Em 1984... foi utilizado um modelo simples de efeitos fixos, mas, três anos mais tarde, a metodologia de Modelos Mistos já seria adotada, com a utilização do Modelo Touro. A partir de 1996... as avaliações genéticas incorporaram o Modelo Animal com a inclusão de matriz de parentesco." E: "Em 2018, ... o PMGZ e o Geneplus somam suas competências técnicas e seus acervos de dados para produzir uma única e conjunta avaliação genética das raças zebuínas. Entre os avanços que essa união propiciou é relevante destacar que foram produzidas avaliações genéticas genômicas, via 'single step' de todas as características para as raças Guzerá, Nelore e Tabapuã." "PMGZ e Geneplus ... seguem operando de forma independente no mercado."

**Modelo, efeitos fixos e software** (PDF p. 2, seção "Metodologia"):
- "Os dados de genealogia e desempenho zootécnico foram submetidos à análise crítica com o uso de rotinas escritas em ambiente SAS para Windows versão 9.4 (2013)". Os dados genômicos passaram por controle de qualidade no PreGSF90 (Aguilar et al. 2014).
- "As análises genéticas foram conduzidas utilizando-se a Metodologia de Modelos Mistos (Henderson, 1953) com o modelo animal, considerando múltiplas características."
- "Para predição dos valores genéticos, valores genéticos sob modelo de limiar e acurácias foram utilizados os programas computacionais BLUP90IOD2 (Misztal et al., 2002), CBLUP90IOD (Misztal et al., 2002) e ACCF90GS3 (Misztal et al., 2002)".
- "Para as raças Guzerá, Nelore e Tabapuã foram incluídas informações de marcadores moleculares (SNPs) com a utilização da metodologia 'Single Step', proposta por Misztal et al. (2009), Legarra et al. (2009) e Aguilar et al. (2010)."
- "Foi utilizado nestas análises o modelo animal completo, considerando-se a matriz de parentesco entre os animais e incluindo-se os efeitos genéticos aditivos diretos, aditivo materno e de ambiente permanente materno e os efeitos fixos de grupo contemporâneo e de idade da vaca/sexo do produto. Considerou-se ainda, como covariável, a data de nascimento do animal, aninhada no grupo contemporâneo."
- O texto não diz se a covariância direto-materna é livre ou zero.
- Pela página histórica da ABCZ (sumário Nelore de 2016, `Sumario-racas-NEL.htm`, atualizada em 2022): "efeitos fixos de grupo de contemporâneos e de classe de idade da mãe/sexo do produto, e a covariavel idade do animal no dia da obtenção do registro zootécnico (efeitos linear e quadrático)"; stayability em "modelo de limiar unicaracterístico" com GC fixo e efeito genético direto. A herdabilidade publicada em 2016 foi h²d de 0,25 e h²m de 0,10 para o peso à desmama (PD), 0,20 e 0,11 para o peso à fase materna (PM), 0,31 para PA, 0,33 para PS, 0,11 para IPP, 0,13 para STAY e 0,41 e 0,39 para PE365 e PE450. Valor de 2016, não de 2026.

**Grupo de contemporâneos** (PDF p. 2–3): "É o conjunto formado por animais da raça, do mesmo sexo, nascidos ou medidos na mesma data, manejados, na mesma fazenda, de forma semelhante até a mensuração da característica." Não há tamanho mínimo publicado.

**Escala de acurácia** (PDF p. 3–4): "A expressão matemática utilizada para o cálculo da acurácia é a recomendada para gado de corte pelo Beef Improvement Federation (Bertrand et al., 2002)". Faixas: "valores de acurácias entre 70% e 99% indicam que a DEP não deve variar drasticamente... valores de 0 a 30% indicam que consideráveis mudanças podem ocorrer", variando de 0 a 99%. DECA: "animais deca 1 estão entre os 10% melhores".

**iABCZ** (PDF p. 2; vigente desde a avaliação de julho de 2024). Fórmulas copiadas:
- Nelore e Tabapuã: iABCZ = 10% PM-EM + 13% PD-ED + 8% PA-ED + 13% PS-ED + 5% PE365 + 10% IPP + 30% STAY + 6% AOL + 5% ACAB.
- Brahman, Gir e Guzerá: iABCZ = 10% PM-EM + 15% PD-ED + 10% PA-ED + 15% PS-ED + 5% PE365 + 15% IPP + 30% STAY.
- Indubrasil e Sindi: iABCZ = 30% PM-EM + 15% PD-ED + 15% PA-ED + 15% PS-ED + 10% PE365 + 15% IPP.
- Todas as somas dão 100%. **Correção ao relatório v1:** a tabela do relatório lista "5% PM-EM" e "5% TMD" como itens separados na linha do iABCZ, e a fórmula oficial só tem **10% PM-EM**, sem TMD. O iABCZ pondera as DEPs diretamente (sem padronização explícita no texto) e tem fórmula diferente por raça.
- As DEPs da ABCZ cobrem PN-ED, PD-ED (210 dias), PA-ED (365), PS-ED (450), PM-EM (fase materna, 120 dias), IPP, STAY (três crias viáveis até 76 meses), PSN (parto até 30 meses), PE365, três escores morfológicos, AOL, ACAB e MAR.

**Idade-padrão no CDP:** ver lacuna 2.

**Geneplus e o IQGg.** A Geneplus divulga o índice nos certificados CEIP. Fórmula impressa nos certificados emitidos em 24/06/2025 e em 17/07/2026: **"IQGg = 10%*PD + 20%*TMD + 15%*PS + 20%*GPD + 15%*PES + 5%*IPP + 10%*AOL + 5%*EGS"** (`https://geneplus.com.br/certificadosCeip/download/73` e `/download/83`). Classes: "Elite (E), até 16%; Superior (S), acima de 16% até 50%; Regular (R), acima de 50% até 84%; e Inferior (I), acima de 84%". Os pesos confirmam os do relatório v1. A DEP vem com a "Base Genética: Animais nascidos na safra 2024" (base móvel). Os certificados mostram "AC" (acurácia) como número inteiro, mas não dizem a escala. O Geneplus usa as mesmas rotinas do documento ABCZ–Embrapa para a parte genética. O que a Geneplus publica sobre modelo e software próprios não foi localizado fora desse documento.

Um indício indireto sobre as práticas do grupo Geneplus: a tese de doutorado de Pereira (UFMS, 2024, coorientador da Embrapa Gado de Corte, dados da avaliação Senepol do programa Embrapa-Geneplus) descreve o GC como "sexo, ano e época do nascimento..., a fazenda em que foi criada, o regime alimentar, o grupo de manejo, a data da medição, o grupo genético do produto e se o animal é um produto de FIV ou TE", exclui GC com menos de 5 animais e GC desconectados (programa MC, Roso et al. 2004), usa a interação idade da vaca × sexo do produto e idade (linear e quadrática) como covariáveis e roda tudo no BLUPF90+. **Isso é Senepol, não Nelore**, e só serve como indício de prática (`informacoes_genomicas_2024.pdf`, p. 46 e 63 da tese).

### 1.3 CRV PAINT

**[NÃO ENCONTRADO]** documento oficial recente com modelo, software, efeitos fixos, escala de acurácia ou pesos do IPAINT. O que há são notícias antigas: o Sumário PAINT Consolidado reúne as DEPs internas do PAINT e as de outros sumários de Nelore, "expressas em relação a uma média genética móvel", e calcula DEPs "H" (DEPhs), "um modelo baseado na média harmônica, cujo objetivo final é identificar reprodutores que possuam maior uniformidade em sua progênie" (Cultivar, 24/08/2011; a edição de 2020 é a 25ª). O site `crvlagoa.com.br` hoje só redireciona para `crv4all.com.br`, e o site da Associação PAINT não respondeu. O IPAINT, o HGP e o IDesm aparecem em notícias sem fórmula.

### 1.4 GenSys: Conexão Delta G (Hereford e Braford) e Aliança Nelore

**Fontes lidas.** `Sumario-de-Touros-CDG-2026.pdf` (76 páginas, criado em 25/08/2026) e `SumarioAliancaNelore2026-2027.pdf` (144 páginas, 29/07/2026), ambos em `gensys.com.br/wp-content/uploads/2026/`. Há também o `Sumario_Natura_2026.pdf`.

**Resultado importante para o relatório: a GenSys não usa ssGBLUP.** Seção "Análise genômica" (Delta G, PDF p. 18; Aliança, PDF p. 21):
- "O método utilizado foi o BLUP genômico (GBLUP)... y é o vetor de pseudo-fenótipos... g é o vetor de valores genômicos diretos (DGV)... G* é uma matriz combinada de parentesco e R uma matriz diagonal, cujos elementos são definidos de modo a contemplar as diferenças de acurácia dos pseudo-fenótipos".
- Software: "software SNP1101 (Versão 1.0, licenciado pela HiggsGene Solutions Inc.)" mais software próprio da GenSys para edição e controle de qualidade. A DEP genômica "combina predição calculada com base na informação dos marcadores com a DEP tradicional".
- **[INFERÊNCIA]** Isso é um procedimento em duas etapas, com pseudo-fenótipos, e não single-step. O relatório v1 junta Delta G aos programas que "convergiram para o single-step" e precisa separar.

**Modelo tradicional** (Delta G, PDF p. 18): "y(ijkl) = [µ + gc(i) + a(j) + m(k) + pe(k) + e(ijkl)]·λm", em que y é a observação "pré-ajustada para os efeitos ambientais conhecidos (idade do produto, idade da vaca e época do nascimento do produto) e efeitos genéticos fixos (raça, dominância, perdas epistáticas, complementariedade e suas interações com latitude)"; gc é fixo; a, m e pe são aleatórios; "λm é o fator de ajustamento para o nível m da variância residual do grupo contemporâneo". Componentes por REML. Procedimento robusto: "observações 'normais' têm influência plena... observações pertencentes a grupos contemporâneos com maior variação e resíduos 'grandes' têm poder de influência reduzido".

**Conectabilidade como regra de dados** (PDF p. 18): "o grupo contemporâneo deve ter um mínimo de 10 laços genéticos diretos. Todos os produtos pertencentes a grupos contemporâneos desconectados são eliminados da análise genética." Essa é a regra de tamanho/conexão mais explícita que encontrei em sumário brasileiro.

**DEPh, base e acurácia** (PDF p. 19): DEP harmônica, que penaliza a DEP de touros com progênie menos uniforme; base genética móvel ("em relação à média genética de toda a população analisada"); "Os valores de acurácia podem variar de 0 a 1"; classes A (acurácia > 0,90 e touros usados em mais de um rebanho na desmama e no sobreano), B (0,80 a 0,90) e C (< 0,80). O texto não diz se a escala é r ou BIF. **Aliança Nelore** (PDF p. 21): "ao comparar resultados entre avaliações, é importante considerar a base genética adotada", porque os rebanhos fazem forte seleção e a base exige mais.

**Índices (Delta G, PDF p. 20), "expressos numa base igual a 10" e aplicados sobre DEPhs padronizadas:**
- Adaptação: ECTO 50, Pm DESM 10, Pm SOBR 10, PIG OCULAR 20, U SOBR 10.
- Desmama: GND 52, C DESM 10, P DESM 19, M DESM 19.
- Carcaça: GND 10, GDS 20, C SOBR 4, P SOBR 8, M SOBR 8, AOL 20, EGS 10, EP8 10, Gordura Intramuscular 10.
- Final: GND 25, GDS 25, C DESM 4, P DESM 8, M DESM 8, C SOBR 4, P SOBR 8, M SOBR 8, PEi 5, PEip 5.
- Cada um dos quatro índices soma 100% (verificado).
- Estrutura de dados (PDF p. 16): 95 rebanhos, 14.828 GCs e 467.661 produtos para o ganho do nascimento à desmama.

### 1.5 Quadro comparativo

| Item | ANCP | ABCZ/Embrapa (PMGZ e Geneplus) | GenSys (Delta G, Aliança) | PAINT |
|---|---|---|---|---|
| Modelo | Animal uni e bicaracterística (âncora P120); direto, materno e PE materno em P210 e MP120; **covariância direto-materna = 0**; limiar para 3P, STAY, FPP e mocho | Animal multicaracterística; direto, materno e PE materno; GC fixo e idade da vaca/sexo do produto; data de nascimento aninhada no GC; limiar para STAY | Animal multivariado com direto, materno e PE; observações pré-ajustadas; ponderação robusta contra heterogeneidade de variância; limiar para parto e umbigo | Não encontrado |
| GC | Rebanho, sexo, ano, estação de nascimento e grupo de manejo (texto da UNESP e artigos); critério novo em 2026 não publicado | Mesma raça, mesmo sexo, mesma data de nascimento ou medida, mesma fazenda, mesmo manejo | GC fixo; mínimo de 10 laços genéticos diretos; desconectados eliminados | Não encontrado |
| Software | BLUPF90+ (blupf90+90iod3, cBLUPF90+90iod2OMP1, accf90GS2, GIBBSF90+) | SAS 9.4, PreGSF90, BLUP90IOD2, CBLUP90IOD, ACCF90GS3 | Software próprio (GenSys) e SNP1101 para a parte genômica | Não encontrado |
| Acurácia | BIF (texto); tabela de PC na escala r | BIF (Bertrand et al. 2002) | 0 a 1, escala não declarada; classes A, B e C | Não encontrado |
| Índice | MGTe e quatro variantes; pesos acima | iABCZ (por raça) e IQGg (Geneplus) | Quatro índices em base 10 | IPAINT, HGP, IDesm sem fórmula |
| Genômica | ssGBLUP + APY; metafundadores multirracial | Single-step em Guzerá, Nelore e Tabapuã, desde 2018 | GBLUP de pseudo-fenótipos (duas etapas) | Não encontrado |
| Desde quando ssGBLUP | 2017 (três características) e 2019 (todas) | 2018 (avaliação conjunta) | Não usa | Não encontrado |

### 1.6 Sugestão de texto para o relatório (substitui a linha de "ANCP", "ABCZ" e "GenSys" da tabela de programas)

> Os três sumários brasileiros que publicam a metodologia usam modelo animal BLUP com GC fixo e a família BLUPF90, mas diferem em pontos que importam. A ANCP roda modelos uni e bicaracterísticos com o peso aos 120 dias como âncora, declara covariância direto-materna igual a zero, usa limiar para 3P, STAY, facilidade de parto e mocho, e aplica ssGBLUP com APY e metafundadores (um por raça) desde 2019 em todas as DEPs genômicas (2017 nas três primeiras). A ABCZ e a Embrapa-Geneplus avaliam em conjunto desde 2018, com modelo multicaracterística de efeitos direto, materno e de ambiente permanente materno, GC fixo e idade da vaca/sexo do produto, e single-step para Guzerá, Nelore e Tabapuã. A GenSys (Conexão Delta G e Aliança Nelore) usa um modelo multivariado com ponderação robusta e exige 10 laços genéticos por GC, e obtém a DEP genômica por GBLUP de pseudo-fenótipos (SNP1101), ou seja, **não é single-step**. A ANCP e a ABCZ declaram a acurácia BIF; a GenSys não declara a escala. Os índices atuais são: MGTe da ANCP (Nelore: 3P 17%, STAY 21%, PE365 4%, MP120 9%, P210 19%, P450 15%, AOL 12%, ACAB 3%); iABCZ (Nelore e Tabapuã: 10% PM-EM, 13% PD-ED, 8% PA-ED, 13% PS-ED, 5% PE365, 10% IPP, 30% STAY, 6% AOL, 5% ACAB); e IQGg da Geneplus (10% PD, 20% TMD, 15% PS, 20% GPD, 15% PES, 5% IPP, 10% AOL, 5% EGS).

**O que continua em aberto na lacuna 1:** documentação oficial do PAINT; efeitos fixos adicionais, componentes de variância e critério de GC de 2026 da ANCP; escala da acurácia da GenSys, da Geneplus e do PAINT; e se a covariância direto-materna da ABCZ/Embrapa é zero ou livre.

