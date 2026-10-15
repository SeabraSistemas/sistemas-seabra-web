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

---

## Lacuna 2. Ajustes de idade da vaca e idade-padrão (P205, P365, P550)

### 2.1 BIF: fórmulas e fatores (fonte primária, 9ª edição)

**Fonte.** *Guidelines for Uniform Beef Improvement Programs*, 9ª edição (BIF, 2016), PDF `https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf`. As páginas citadas são as **impressas**, no rodapé "BIF Guidelines n". O texto foi lido por extração de PDF, e a página 73 foi conferida visualmente.

**Fórmulas, p. 21 a 23 (seção "Rate and Efficiency of Gain"):**

```
Adj. Birth Wt. = Birth Wt. + Age of dam Adj.                                   (p. 21)

Adj. 205-Day Wean Wt. = [(Wean Wt. – Birth Wt.) / Weaning Age] × 205 + Birth Wt + Age of dam Adj.   (p. 22)

Adj. 365-day Yrlg. Wt. = [(Final Wt – Weaning Wt) / No. of Days Between Wts.] × 160 + 205-day Adj. Weaning Wt.   (p. 23)
Adj. 452-day Yrlg. Wt. = [(Final Wt – Weaning Wt) / No. of Days Between Wts.] × 247 + 205-day Adj. Weaning Wt.
Adj. 550-day Yrlg. Wt. = [(Final Wt – Weaning Wt) / No. of Days Between Wts.] × 345 + 205-day Adj. Weaning Wt.
Razão:  Adj. 205-Day Weaning Wt. Ratio = (Individual Adj. 205-day Weaning Wt. / Group Average Adj. 205-day Weaning Wt.) × 100
```

Os multiplicadores 160, 247 e 345 são 365−205, 452−205 e 550−205 [conferido por aritmética]. Condições do texto original:
- Peso à desmama entre **160 e 250 dias** de idade, com o grupo médio perto de 205. Fora dessa faixa, "should be given a special management code and handled as a separate management group. They should not be adjusted for age of dam, because appropriate correction factors are not available."
- Peso de 365 dias: pesagem final entre 320 e 410 dias, pelo menos 70 dias depois da desmama, com o número de dias entre pesagens igual para todo o GC.
- Peso de 452 dias: animais com pelo menos 400 dias na pesagem final e GC com média de pelo menos 452. Peso de 550 dias: pelo menos 500 dias e média de pelo menos 550.
- Se o peso ao nascer real não existe, "the appropriate standard birth weight designated by the respective breed association ... may be used". Os pesos-padrão do BIF são **75 lb para machos e 70 lb para fêmeas** (Apêndice 3.1, nota 1).
- "BIF recommends the use of additive rather than multiplicative age of dam adjustment factors for weaning weight, because research indicates that they are more appropriate." E: "Birth and weaning weight adjustments for age of dam can differ from one breed to another. Some breed associations have developed adjustments using their own data. These should be substituted for the BIF standard whenever possible."
- O Glossário do BIF (verbete "Multiplicative adjustment factors") define o fator multiplicativo e avisa que ele "affects variability in the trait after adjustment, inflating it when the multiplicative factor is greater than 1.0".

**Classes de idade da vaca do BIF** (p. 21):

| Idade da vaca ao parto (dias) | Classe (anos) |
|---|---|
| menos de 1.004 | 2 |
| 1.004 a 1.369 | 3 |
| 1.370 a 1.734 | 4 |
| 1.735 a 3.560 | 5 a 9 |
| 3.561 a 3.925 | 10 |
| 3.926 a 4.291 | 11 |
| 4.292 a 4.656 | 12 |
| mais de 4.656 | 13 |

**Fatores aditivos padrão do BIF** (Apêndice 3.1, p. 135 impressa; PDF p. 137), em libras como no original. A coluna em kg é minha conversão (× 0,45359):

| Idade da vaca | Peso ao nascer (lb, kg) | Desmama, machos (lb, kg) | Desmama, fêmeas (lb, kg) |
|---|---|---|---|
| 2 anos | +8 (3,6) | +60 (27,2) | +54 (24,5) |
| 3 anos | +5 (2,3) | +40 (18,1) | +36 (16,3) |
| 4 anos | +2 (0,9) | +20 (9,1) | +18 (8,2) |
| 5 a 10 anos | 0 | 0 | 0 |
| 11 anos ou mais | +3 (1,4) | +20 (9,1) | +18 (8,2) |

Nota 2 do apêndice: "Breed specific adjustment factors have been developed by individual breed associations from breed data... Contact the respective breed association."

**Exemplo numérico** (uso das fórmulas acima; o bezerro é fictício): macho com 32 kg ao nascer, 190 kg aos 190 dias e mãe de 2 anos. GMD = (190 − 32)/190 = 0,8316 kg/dia; P205 bruto = 0,8316 × 205 + 32 = 202,5 kg; ajustado = 202,5 + 27,2 = 229,7 kg.

**Versão online (BIF Guidelines Wiki, atualizada em 2021)** confirma o essencial:
- `.../index.php/Weaning_Weight`: "The standard age for adjustment is 205 days... To calculate this adjusted weight, the ADG from birth to weaning is multiplied by 205, and then birth weight is added." E: "These adjustments are typically different for each breed and may change over time as genetic progress is made in growth to weaning." A faixa recomendada é de 160 a 250 dias, e o GC "weaned and weighed on the same day".
- `.../index.php/Yearling_Weight`: "Adj 365-day Wt = (Yearling Wt − Weaning Wt)/(Number of days between weights) × 160 + Adj 205-day Wt", com pesagem entre 320 e 410 dias e intervalo sugerido de 160 dias desde a desmama.
- `.../index.php/Birth_Weight`: "Both sex of calf and age of dam influence birth weight... BIF recommends the use of additive rather than multiplicative age of dam adjustment factors". A wiki recomenda ainda "that birth weights be adjusted for sex by age-of-dam and these factors not be fit in the genetic evaluation" por causa de pesos ao nascer estimados e não pesados.
- **A wiki não traz tabela numérica de fatores.** A tabela do Apêndice 3.1 é a única do BIF, e é de raças taurinas americanas.

**Perímetro escrotal** (p. 31–32 do BIF 9): "Adj. 365-Day Yearling Scrotal Circumference = YSC + [(365 – Age) × Age Adj. Factor]". Os fatores são por raça (Angus 0,0374; Brangus 0,0708; Hereford 0,0425...). Fonte: Geske et al. (1995), Kansas State Rep. of Progress 727:99. **Não há fator para zebuínos** nessa tabela.

### 2.2 Idade-padrão e fórmulas no Brasil

**ABCZ, Regulamento do CDP 2023** (`https://www.abcz.org.br/common/uploads/secao/a66183db97120042234f2b57a42cdb7a.pdf`, PDF p. 4 a 6, Art. 20 a 25). As idades-padrão são **210, 365 e 450 dias**, não 205 e 550:
- Faixas: 210 dias com "pesagens entre 150 e 270 dias"; 365 dias com "pesagens entre 305 e 425 dias"; 450 dias com "pesagens entre 390 e 510 dias". "Para o ajuste de peso a qualquer uma das idades padrão, é necessário que pelo menos uma das pesagens esteja dentro das faixas."
- Fórmulas copiadas:

```
§ 1º  Peso aos 210 dias:  PC = PN + (G × N)
      PC = peso calculado para a idade-padrão; PN = peso ao nascimento;
      G = ganho médio diário entre o nascimento e a pesagem mais próxima da idade-padrão (dentro da faixa do Art. 20);
      N = idade-padrão considerada
§ 2º  PC365 = PC210 + [G1 × (ID210 − 210)] + [G2 × (365 − ID210)]
§ 3º  PC450 = PC210 + [G1 × (ID210 − 210)] + [G2 × (450 − ID210)]
      G1 = GMD entre o nascimento e a pesagem usada no PC210; G2 = GMD entre a pesagem usada no PC210 e a pesagem mais próxima de 365 (ou 450) dias;
      ID210 = idade do animal na pesagem usada para o PC210
Art. 24  GMD = (PC2 − PC1) / n      Art. 25  GPD = (PC − PN) / D
```

- O §4º diz apenas: "Todos os pesos calculados serão corrigidos para efeitos sistemáticos não genéticos." **Os fatores de correção não estão no regulamento.** Sem peso ao nascer, o Art. 5º manda usar "o peso médio da raça, obtido pelo CDP, considerando-se também o sexo". O peso ao nascer deve ser tomado "nas primeiras 24 horas".

**ABCZ em 2002 e PMGRN** (as duas fórmulas históricas, em Lôbo & Martins Filho 2002, *R. Bras. Zootec.* 31(4):1695–1706, DOI 10.1590/S1516-35982002000700012, PDF aberto em Embrapa Alice `https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/529428/1/APIAvaliacaodemetodosdepadronizacaodospesoscorporais.pdf`, p. 1696 a 1697):

```
MET1 (ABCZ, 2002):  GMDd = (peso à desmama − peso ao nascer) / idade na pesagem de desmama
   "realizam-se quatro ajustes: ajusta-se o GMDd para a época do ano da desmama, a idade do bezerro na pesagem, a idade da mãe e o sexo do animal"
   P205 = [GMDd ajustado × 205 dias] + peso ao nascer
   GMDp = (pesagem atual − P205) / (idade na pesagem pós-desmama − 205);   GMDpa = média de GMDd e GMDp
   P365 = P205 + (GMDpa × 160 dias);   P550 = P205 + (GMDpa × 345 dias)
MET5 (PMGRN, depois ANCP; Lôbo 1992):  Pp = Pa + GMD × da, quando da < ds;   Pp = Ps − GMD × ds, quando da > ds
   Pa = peso anterior à idade-padrão; Ps = peso seguinte; da = dias entre a pesagem anterior e a idade-padrão; ds = dias entre a pesagem posterior e a idade-padrão
   GMD = (Ps − Pa) / dias entre as duas pesagens  (interpolação linear entre as duas pesagens vizinhas)
```

Resultados do estudo (34.558 informações de Nelore do Nordeste, 18.196 animais com todos os métodos, 10.751 após a edição): as médias de P205 diferiram em até cerca de 7% entre métodos (MET1 163,92 kg; MET5 164,69 kg; Richards 162,33 kg), as de P365 em até 4% e as de P550 em menos de 4%; as correlações de Pearson entre métodos foram de 0,89 a 0,99 (Tabela 2); "apenas os métodos em execução no Brasil (MET1 e MET5) conseguem aproximar-se da estimativa considerada mais adequada" no P550. O artigo conclui que, "apesar das altas correlações genéticas e de classificação dos animais por seus valores genéticos, as diferenças nesta classificação podem influenciar o processo de seleção". O mesmo artigo assumiu "A covariância entre os efeitos genéticos direto e materno... igual a zero, segundo recomendação de Schaeffer (1996)", que é a origem provável da hipótese que a ANCP mantém hoje.

**ANCP** (sumário 2026, PDF p. 101–102): não publica fórmula de padronização, só as janelas (ver lacuna 1.1): 120 dias (70 a 165), 210 dias (165 a 255), 365 dias (320 a 410) e 450 dias (405 a 495). Nome das características: P120, P210, P365, P450. O glossário do sumário usa "Número de Filhos e Rebanhos com Peso padronizado aos 210 dias de idade" (NF210, PDF p. 110), o que confirma que o peso é padronizado antes da análise.

**Geneplus**: a tese Senepol (UFMS 2024) relata "P120, PD e PS foram ajustados, dentro do grupo de contemporâneos, para as idades padrão de 120, 240 e 540 dias". É Senepol, mas é a única descrição recente de idade-padrão da equipe Embrapa-Geneplus. Para Nelore, o documento ABCZ–Embrapa fala em PD aos 210 dias, PA aos 365 e PS aos 450.

**Quadro de idades-padrão em uso (cada programa usa um conjunto próprio; não misturar):**

| Fonte | Desmama | Ano | Sobreano | Pesagens aceitas |
|---|---|---|---|---|
| BIF (EUA) | 205 | 365 | 452 ou 550 | 160 a 250; 320 a 410; ≥ 400 / ≥ 500 |
| ABCZ, CDP 2023 | 210 | 365 | 450 | 150 a 270; 305 a 425; 390 a 510 |
| ABCZ, 2002 (histórico) | 205 | 365 | 550 | pesagens trimestrais |
| ANCP, 2026 | 210 (e 120) | 365 | 450 | 165 a 255; 320 a 410; 405 a 495 |
| Geneplus, Senepol (tese 2024) | 240 (e 120) | não citado | 540 | não citado |

### 2.3 Ajuste de idade da vaca em zebuínos: o que há publicado

**Os programas brasileiros não publicam tabelas.** A ABCZ (PDF p. 2) trata a idade da vaca como **efeito fixo dentro do modelo** ("efeitos fixos de grupo contemporâneo e de idade da vaca/sexo do produto"). A GenSys pré-ajusta o fenótipo por "idade do produto, idade da vaca e época do nascimento do produto" sem publicar fatores. A ANCP não descreve o tratamento da idade da vaca. **[NÃO ENCONTRADO]** tabela de fatores de idade da vaca de ANCP, ABCZ ou Geneplus.

**Estudos científicos em Nelore (abertos):**
1. **Paz CCP, Albuquerque LG, Fries LA (1999).** *R. Bras. Zootec.* 28(1):65–73, DOI 10.1590/S1516-35981999000100009 (SciELO: `https://www.scielo.br/j/rbz/a/txz7TZYq5CjkXj9K7j4yy5x/`). Dados: 18.772 bezerros Nelore de 1984 a 1994, filhos de 7.619 vacas e 109 touros, da Granja Rezende S.A. (Uberlândia, MG), com registros da GenSys. Modelo animal por REML com GC fixo, idade da vaca, idade do bezerro e data juliana como covariáveis. Mães com menos de 4 e mais de 15 anos foram excluídas (as de 3 anos foram retiradas por manejo diferenciado não codificado). **Fatores multiplicativos** para o GMD do nascimento à desmama, calculados como "FCX = gmd base / gmd X", com **base na vaca de 8 anos**. Os autores justificam: "No presente estudo o ganho médio diário de peso pré-desmame apresentou grande variação (variou de 0,2690 a 1,3840 kg/dia). Assim, neste estudo foram preferidos os fatores de correção multiplicativos." A Tabela 2 (p. 70), copiada:

| Idade da vaca (anos) | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fator, bezerros machos | 1,00367 | 0,99570 | 0,99246 | 0,99389 | 1,00000 | 1,00926 | 1,02008 | 1,03256 | 1,04680 | 1,06296 | 1,08117 | 1,10164 |
| Fator, bezerros fêmeas | 1,00002 | 0,99882 | 0,99842 | 0,99881 | 1,00000 | 1,00322 | 1,00974 | 1,01970 | 1,03329 | 1,05081 | 1,07264 | 1,09928 |

O texto resume: "Os fatores de correção para o efeito da idade da vaca sobre o ganho médio diário de peso pré-desmame variaram de 0,99246 a 1,10164, para machos, e de 0,99842 a 1,09928, para fêmeas." O resumo diz que "as vacas atingiram a maturidade entre o 5º e 7º ano de idade". O GMD predito é máximo na vaca de 6 anos (0,72476 kg/dia nos machos e 0,64101 nas fêmeas). **Atenção:** é um fator sobre o GMD e não sobre o peso, vale para uma fazenda, e a variação entre classes de 4 a 8 anos é inferior a 1%. O artigo diz que o BIF recomendava fatores aditivos "para as condições dos Estados Unidos, em que a variação dos registros de produção é pequena".
2. **Bocchi AL, Teixeira RA, Albuquerque LG (2004).** *Acta Scientiarum. Animal Sciences* 26(4):475–482, DOI 10.4025/actascianimsci.v26i4.1724 (`https://periodicos.uem.br/ojs/index.php/ActaSciAnimSci/article/download/1724/1161`). Dados: 333.259 Nelore da ABCZ, mínimos quadrados, por região e sexo. A idade da vaca ao parto (IDV, em anos) entra como regressão quadrática no P205 predito (kg). Equações copiadas (p. 479 impressa, PDF p. 5):

| Região | Machos | Fêmeas |
|---|---|---|
| Centro-Oeste | 165,94 + 4,2851344·IDV − 0,2483338·IDV² | 165,94 + 3,3046839·IDV − 0,1935391·IDV² |
| Sudeste | 162,46 + 3,8290361·IDV − 0,2264371·IDV² | 162,46 + 3,2362733·IDV − 0,1870361·IDV² |
| Sul | 167,99 + 5,2697710·IDV − 0,3033255·IDV² | 157,08 + 4,5140056·IDV − 0,2636961·IDV² |
| Nordeste | 162,04 + 3,4821773·IDV − 0,2232814·IDV² | 162,04 + 3,1308286·IDV − 0,2004256·IDV² |

   O texto: "Vacas a partir de certa idade começaram a parir bezerros mais leves que as novilhas (16 anos de IDV para as regiões CO, S e SE; e 14 anos de IDV para a região NE). Esses resultados mostram a necessidade do descarte de vacas mais velhas anualmente". Recomenda "o cálculo de fatores de correção" específicos por região, porque o efeito difere significativamente entre elas. **Cálculo meu a partir dessas equações [INFERÊNCIA]:** o máximo ocorre em IDV = −b1/(2·b2), que dá 8,6 anos (Centro-Oeste, machos), 8,5 (CO, fêmeas), 8,7 (Sul, machos), 8,5 (Sudeste, machos) e 7,8 (Nordeste). No Centro-Oeste, a diferença entre uma vaca de 3 anos e o máximo é de **−7,8 kg para machos e −5,9 kg para fêmeas** (−5,3 e −3,9 aos 4 anos; −1,7 e −1,2 aos 6 anos; −7,1 e −5,4 aos 14 anos; −13,5 e −10,7 aos 16 anos). Compare com os +27,2 kg (machos) e +24,5 kg (fêmeas) que o BIF soma para a vaca de 2 anos: **a tabela do BIF não é transferível ao Nelore**, em que a primeira parição é aos 3 anos ou mais e o efeito de idade tem outra escala.
3. **Outros trabalhos localizados e não lidos:** Bocchi & Albuquerque (2005), *Arq. Bras. Med. Vet. Zootec.* 57:524–532, DOI 10.1590/s0102-09352005000400014 (idade da vaca e data juliana sobre o GMD pré-desmame, também em Nelore); Toral et al. (2009), *R. Bras. Zootec.* 38:1229–1237, DOI 10.1590/s1516-35982009000700011 (modelagem do efeito de idade da vaca em Charolês-Zebu); Souza, Ramos & Silva (2000), *Ciência Rural* 30:881–885, DOI 10.1590/s0103-84782000000500024.

**Aditivo contra multiplicativo (referências clássicas, pagas):** Cundiff, Willham & Pratt (1966), *J. Anim. Sci.* 25:983–987, DOI 10.2527/jas1966.254983x; Nelsen & Kress (1981), *J. Anim. Sci.* 53:1217–1224, DOI 10.2527/jas1981.5351217x; Northcutt, Wilson & Hoekstra (1994), *J. Anim. Sci.* 72:828–832, DOI 10.2527/1994.724828x. Não consegui baixar nenhum deles (OUP responde 403), e por isso não citei números.

### 2.4 O que continua em aberto
- Tabela de fatores de idade da vaca **atual** de qualquer programa brasileiro.
- Se a ANCP pré-ajusta ou usa efeito fixo de idade da vaca e como forma as classes.
- Fator aditivo ou multiplicativo recomendado para Nelore e para taurinos em condição tropical (os dois estudos acima são de 1999 e 2004).

### 2.5 Sugestão de texto para o relatório (substitui a frase "As tabelas de fatores de idade da mãe do BIF e da ANCP não foram encontradas pelas notas")

> O BIF padroniza o peso à desmama em 205 dias e a idade da vaca com fatores aditivos: Adj. 205 = [(PD − PN)/idade] × 205 + PN + ajuste de idade da vaca, e, para o sobreano, Adj. 365 = [(Peso final − PD)/dias] × 160 + Adj. 205, com 247 para 452 dias e 345 para 550 dias. A única tabela do BIF (Apêndice 3.1, 9ª ed.) soma, na desmama, +60 lb (machos) e +54 lb (fêmeas) para vacas de 2 anos, +40 e +36 para 3 anos, +20 e +18 para 4 anos e +20 e +18 para 11 anos ou mais (0 entre 5 e 10 anos); para o peso ao nascer, +8, +5, +2 e +3 lb; e o próprio BIF manda substituir esses fatores pelos da raça sempre que existirem. Os programas brasileiros adotam outras idades-padrão (ABCZ: 210, 365 e 450 dias no CDP de 2023, com interpolação entre pesagens; ANCP: 120, 210, 365 e 450 dias, com janelas de ±45 a 90 dias) e tratam a idade da vaca como efeito fixo no modelo, sem publicar fatores. Em Nelore, os fatores publicados (Paz et al., 1999, multiplicativos, base de 8 anos; Bocchi et al., 2004, regressões quadráticas por região) mostram máximo entre 6 e 9 anos e queda após os 12, com diferenças de cerca de 5 a 8 kg entre a vaca de 3 anos e o máximo, bem menores que os 27 kg do BIF para vacas de 2 anos.

---

## Lacuna 3. Possible Change (BIF): fórmula exata e tabela por característica

### 3.1 Fórmula oficial e escala de acurácia

**Fontes:** BIF Guidelines 9ª ed., p. 73 (impressa; PDF p. 75, conferida visualmente) e BIF Guidelines Wiki, página "Possible Change" (`https://guidelines.beefimprovement.org/index.php/Possible_Change`, editada em 12/04/2021 por Bruce L. Golden, a partir de trabalho de Matt Spangler). **O relatório v1 diz que a fórmula "aparece corrompida" nessa página. Ela é recuperável do código LaTeX da página e confere com o livro.**

```
BIF Accuracy  = 1 − √( Prediction error variance / Additive genetic variance )            (BIF 9, p. 73)
r(EPD,BV)     = √( (Additive genetic variance − Prediction error variance) / Additive genetic variance )
r(EPD,BV)     = √( 1 − (1 − BIF)² )          BIF = 1 − √( 1 − r² )

Confidence range:  CR = EPD ± t (1 − accuracy) σA / 2                                      (BIF 9, p. 73)
Wiki:              PC = t · (1 − a_BIF) · σu / 2
```

- σA (ou σu) é "the standard deviation of breeding values for the trait" (desvio-padrão aditivo genético), e t é 1 ou 2. O livro: "For most applications t is 1.0 so that the confidence range is equal to the EPD plus and minus the standard error of prediction. This range provides a 68% chance of including the true progeny difference."
- A wiki: "One standard prediction error means the true value should fall within the range of plus or minus one possible change from the EPD 68% of the time... [with t = 2] 95% of the time." E: "When calculating the possible change table values, inbreeding is assumed to be zero."
- O livro: "Using accuracy as defined by BIF, the standard error of prediction is linear with respect to the accuracy value", e "Possible change values are different for each trait, reflecting the units of measurement and amount of genetic variation associated with each trait (the σA)". A wiki recomenda "that possible change tables should be clearly labelled as representing 68% or 95% confidence ranges".
- A divisão por 2 existe porque a DEP é metade do valor genético. Como PC = t·(1−a)·σA/2, a tabela é linear na acurácia BIF, e o valor em acurácia zero é σA/2.
- **Não existe tabela unificada do BIF.** A wiki diz que "Organizations involved in producing EPDs will often provide a table of 'possible change' values", e cada organização usa seus σA.

### 3.2 Tabela por característica de fonte oficial: Red Angus Association (EUA)

Fonte: `https://redangus.org/genetics/epd-possible-change/` (lida em 15/10/2026). O texto diz que "the true genetic value of each genetic prediction would be expected to fall within (plus or minus) one standard deviation 2/3 of the time". Exemplo da própria página: "a 60 lb yearling weight EPD had an accuracy of .30... between 42 and 78 lbs two-thirds of the time (60 lb YW EPD +/- possible change of 18)". Linhas copiadas (unidades em libras para pesos; STAY em %; MARB, YG e BF em unidades próprias):

| ACC | CED | BW | WW | YW | MILK | STAY | CW | REA |
|---|---|---|---|---|---|---|---|---|
| 0,0 | 7,8 | 3 | 16,3 | 25,9 | 11,9 | 11,7 | 20,5 | 0,36 |
| 0,3 | 5,5 | 2,1 | 11,4 | 18,1 | 8,3 | 8,2 | 14,3 | 0,25 |
| 0,5 | 3,9 | 1,5 | 8,1 | 12,9 | 6 | 5,8 | 10,2 | 0,18 |
| 0,7 | 2,4 | 0,9 | 4,9 | 7,8 | 3,6 | 3,5 | 6,1 | 0,11 |
| 0,9 | 0,8 | 0,3 | 1,6 | 2,6 | 1,2 | 1,2 | 2,0 | 0,04 |

**Verificação numérica minha:** todas as colunas contínuas seguem PC(a) = (1 − a)·PC(0), com erro máximo de 0,3 a 0,5 só nas colunas de valores inteiros arredondados (ME, HPG). Logo, a tabela é BIF e linear. Para YW, 25,9 × 0,7 = 18,1 e 25,9 × 0,2 = 5,2. Os σA implícitos são o dobro da linha 0,0: WW 32,6 lb, YW 51,8 lb, BW 6,0 lb e MILK 23,8 lb.

A página da American Angus Association (`angus.org/.../accuracy-and-possible-change`) respondeu 403 para a rotina de coleta. A cópia salva numa tentativa anterior só tinha o menu do site, sem a tabela.

### 3.3 Tabela da ANCP (sumário 2026, PDF p. 105): é a única brasileira, e usa outra escala

- O texto da ANCP: "A possível mudança é uma forma simples de expressar o intervalo de confiança da DEP para uma dada probabilidade... A possível mudança depende diretamente da acurácia e da variância genética de uma determinada característica." Nível "de 68% de probabilidade". Colunas: DIPP (meses), MP120, MP210, DP365, DP450 (kg), DPE365 (cm) e DAOL (cm²).
- Linhas copiadas:

| Acurácia (%) | DIPP | MP120 | MP210 | DP365 | DP450 | DPE365 | DAOL |
|---|---|---|---|---|---|---|---|
| 5 | ±0,32 | ±1,00 | ±3,02 | ±5,18 | ±8,23 | ±0,539 | ±1,47 |
| 30 | ±0,28 | ±0,95 | ±2,88 | ±4,95 | ±7,86 | ±0,515 | ±1,40 |
| 50 | ±0,26 | ±0,87 | ±2,62 | ±4,50 | ±7,14 | ±0,47 | ±1,27 |
| 70 | ±0,22 | ±0,71 | ±2,16 | ±3,71 | ±5,88 | ±0,39 | ±1,05 |
| 90 | ±0,13 | ±0,44 | ±1,32 | ±2,26 | ±3,59 | ±0,24 | ±0,64 |
| 99 | ±0,04 | ±0,14 | ±0,43 | ±0,73 | ±1,16 | ±0,08 | ±0,21 |

- **Teste numérico (meu):** as sete colunas reproduzem **PC = σ·√(1 − a²)** (a escala "r"), com σ = 0,32 (DIPP), 1,00 (MP120), 3,02 (MP210), 5,19 (DP365), 8,24 (DP450), 0,54 (DPE365) e 1,47 (DAOL); erro máximo de 0,005 (0,026 no DIPP, por arredondamento). Já a fórmula BIF, com os mesmos σ, daria PC = (1 − a)·σ, ou seja, 4,12 para DP450 a 50% e 0,08 a 99%. Se a "Acurácia" do sumário for a BIF, como a própria ANCP declara, a tabela de possível mudança **subestima a incerteza de animais de acurácia alta e superestima a de acurácia média**. **[INFERÊNCIA]** Não sei qual das duas está errada (o texto ou a tabela), e isso precisa ser perguntado à ANCP.
- A ANCP não publica a tabela para as demais DEPs (STAY, 3P, PE450, ACAB etc.). A ABCZ não publica possível mudança. A GenSys usa classes A, B e C de acurácia. A Geneplus não publica.
- Observação sobre texto da ANCP: "o cálculo é o recomendado pela BIF, que varia linearmente de acordo com o número de filhos avaliados". O que é linear na escala BIF é o erro-padrão de predição em função da acurácia (BIF 9, p. 73), e não a acurácia em função do número de filhos.

### 3.4 O que continua em aberto
- Escala efetiva da acurácia nos sumários da ANCP, da ABCZ/Embrapa, da Geneplus e da GenSys (BIF ou r), e o tratamento do fator (1 + F).
- σA por característica de Nelore publicados por programa, para montar uma tabela brasileira em escala BIF (a ANCP só publica a tabela pronta; os σA implícitos da tabela dela estão acima).
- Acurácia de animais genotipados no ssGBLUP: a ANCP diz que ela mede "capacidade preditiva" e que "não é diretamente comparável" à tradicional, de modo que a fórmula de PC pode não valer para eles.

### 3.5 Sugestão de texto para o relatório (substitui o trecho "A fórmula de PC do BIF aparece corrompida...")

> A "Possible Change" do BIF é PC = t·(1 − a_BIF)·σA/2, em que σA é o desvio-padrão aditivo genético da característica, a_BIF = 1 − √(PEV/σ²A) e t vale 1 (intervalo de 68%) ou 2 (95%); a conversão para a correlação é r = √(1 − (1 − a_BIF)²) (BIF Guidelines, 9ª ed., p. 73). Como a_BIF entra linearmente, a tabela de cada raça é uma reta em (1 − a). Não há tabela única do BIF: cada associação publica a sua, como a Red Angus (YW: ±25,9 lb em acurácia 0, ±12,9 em 0,5 e ±2,6 em 0,9). No Brasil, só a ANCP publica a tabela (DP450: ±8,23 kg em 5% e ±1,16 kg em 99%), e os números dela seguem σ·√(1 − a²), não a fórmula BIF, o que exige confirmar com a ANCP qual é a escala da coluna "Acurácia". Para um produto, o cálculo deve ser feito pela fórmula, com a escala declarada na tela.

---

## Lacuna 4. Repetibilidade do peso à desmama em vacas de corte (MPPA)

**Resultado principal:** a literatura aberta que consegui ler dá valores **entre 0,22 e 0,52**, acima da faixa de 0,15 a 0,35 que o relatório usa no MPPA. Há uma única estimativa direta para Nelore (0,33). Para taurinos, os números diretos vêm de artigos pagos, e eu só obtive um (NZ, 0,51). Para cada estimativa, indico se é **direta** (feita pelo autor) ou **derivada** (calculada por mim a partir de componentes de variância).

### 4.1 Estimativas

| Rebanho | Estimativa | Tipo e fonte |
|---|---|---|
| Nelore, a pasto, Fazenda Tapirus (SP), 899 bezerros, peso ajustado a 270 dias | **0,33 ± 0,04** (PD); 0,31 ± 0,04 (GMD nascimento-desmama); 0,19 ± 0,03 (PN) | **Direta.** Souza JC, Brulé AO, Ferraz Filho PB, Oliveira JAL, Alencar MM (1994). *R. Bras. Zootec.* 23(1):133–139 (Embrapa Infoteca, `https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/40526/1/Repetibilidade.pdf`; sem DOI no Crossref). Método: correlação intraclasse de meios-irmãos maternos, com ano, época, sexo e ordem de parto como efeitos fixos. "Resultados muito semelhantes foram obtidos com os dois métodos de ajustamento para peso aos 270 dias" |
| Teste de progênie comercial da Beef + Lamb New Zealand Genetics, cinco fazendas de morro, 6.978 pesos à desmama (só vacas que pariram todo ano ficaram nos dados) | **0,51 ± 0,03** (peso à desmama), com h²d = 0,14 ± 0,02 e h²m = 0,20 ± 0,07 | **Direta.** Weik F et al. (2021), *Animals* 11(9):2509, DOI 10.3390/ani11092509, Tabela 4 (PMC8467944). Modelo animal com efeitos direto, materno, ambiente permanente e covariância; ASReml. Componentes: σ²a 84,37, σ²m 122,38, σam −53,77, σ²me 187,87, σ²e 235,03. O texto: "The permanent environmental effect of the dam on WWT was high (0.51)" e cita Meyer et al., para Hereford australiano, com 0,20 |
| Composto tropical Montana (Brasil), peso à desmama, modelos M1 a M10 | **0,22 a 0,24** (bezerros de touros diferentes) e **0,27 a 0,30** (mesmo touro) | **Derivada** (cálculo meu) dos componentes da Tabela 4 de Medeiros et al. (2026), *Genes* 17(2):173, DOI 10.3390/genes17020173 (PMC12940800). Por exemplo, M1: σ²a 181,73, σ²m 107,21, σam −63,57, σ²mpe 100,76, σ²e 468,08, soma 794,2, e r = (0,25 × 181,73 + 107,21 − 63,57 + 100,76)/794,2 = 0,239. M10: 0,222 |
| Exemplo do próprio relatório v1 (σ²a 100, σ²m 40, σam −15, σ²p 30, σ²e 230) | 0,21 (touros diferentes) a 0,23 (mesmo touro) | **Derivada** (cálculo meu). Mostra que o conjunto de parâmetros do exemplo implica repetibilidade de cerca de 0,2 |
| Hereford e Angus americanos | 0,42 (Hereford), 0,52 (Angus), 0,42 (conjunto) | **Não verificada.** Vem de um trecho de busca do resumo de Minyard JA & Dinkel CA (1965), *J. Anim. Sci.* 24:1072–1074, DOI 10.2527/jas1965.2441072x (866 bezerros de 378 vacas). O site da OUP bloqueou o acesso (403). Listada nos pagos |

**Fórmula usada nas estimativas derivadas [INFERÊNCIA, álgebra padrão de modelo direto-materno]:** a covariância entre os pesos à desmama de dois bezerros da mesma vaca é 0,25·σ²a (meios-irmãos, touros diferentes; 0,5·σ²a se for o mesmo touro) + σ²m + σam + σ²pe, porque cov(a do bezerro, m da vaca) = 0,5·σam e aparece duas vezes. A variância fenotípica é σ²P = σ²a + σ²m + σam + σ²pe + σ²e. A repetibilidade é essa covariância dividida por σ²P.

**Observação importante.** A repetibilidade depende de quanto a estrutura de dados separa "efeito da vaca" de "efeito de bezerro": no Composto Montana, o próprio artigo alerta que a média de bezerros por vaca (1,77) limita a separação entre σ²m e σ²pe, e por isso os componentes mudam de 107 para 69 entre modelos. A repetibilidade derivada varia menos (0,22 a 0,24) do que os componentes, e esse é um argumento a favor de usá-la direto no MPPA.

### 4.2 Resultado para o MPPA (cálculo com a fórmula do relatório, MPPA = fator × desvio, com fator = n·r/(1 + (n−1)·r))

| r | 1 cria | 2 crias | 3 crias | 4 crias | 6 crias |
|---|---|---|---|---|---|
| 0,20 | 0,200 | 0,333 | 0,429 | 0,500 | 0,600 |
| 0,30 | 0,300 | 0,462 | 0,562 | 0,632 | 0,720 |
| 0,40 | 0,400 | 0,571 | 0,667 | 0,727 | 0,800 |
| 0,50 | 0,500 | 0,667 | 0,750 | 0,800 | 0,857 |

Os números mostram que passar de r = 0,25 para r = 0,33 (Souza et al., 1994) eleva o fator de uma cria de 0,25 para 0,33, e o de quatro crias de 0,57 para 0,66. O ranking das vacas muda pouco, mas o valor de MPPA esperado muda.

### 4.3 O que continua em aberto
- Estimativas **diretas** recentes (últimos 20 anos) de repetibilidade do peso à desmama em Nelore e em taurinos tropicais: não achei nenhuma em acesso aberto além das acima.
- O BIF 9 define MPPA no glossário ("An estimate of a cow's future superiority or inferiority for a repeatable trait (such as progeny weaning weight) based upon the cow's past production in comparison to her contemporaries, her number of past records, and the repeatability of the trait") mas **não dá fórmula nem valor de repetibilidade**.
- Artigos de Kress & Burfening (1972), *J. Anim. Sci.* 35:327–335 (DOI 10.2527/jas1972.352327x, MPPA em vacas Hereford) e Vanmiddlesworth, Brown & Johnson (1977), *J. Anim. Sci.* 45:1247–1253 (DOI 10.2527/jas1977.4561247x, repetibilidade do peso do bezerro em Hereford e Angus) são os mais úteis para taurinos e estão pagos. Também Kilkenny (1968), *Animal Science* 10:483–486, DOI 10.1017/s0003356100026507 (Cambridge exige acesso).
- ANCP publica **PAC (kg de bezerro desmamado por vaca por ano)** com média de 174,04 kg para Nelore (sumário 2026, PDF p. 106), que é uma medida de produtividade da vaca, mas o sumário não publica a repetibilidade dela.

### 4.4 Sugestão de texto para o relatório (substitui "As notas não encontraram a repetibilidade do peso à desmama para vacas de corte")

> A repetibilidade do peso à desmama de bezerros da mesma vaca é, em Nelore, de 0,33 ± 0,04 (Souza et al., 1994, 899 bezerros a pasto, peso a 270 dias). Em bovinos comerciais da Nova Zelândia, ficou em 0,51 ± 0,03 (Weik et al., 2021), e componentes de variância do composto tropical Montana implicam 0,22 a 0,30, conforme os bezerros sejam de touros diferentes ou do mesmo. Como o MPPA depende de r, o relatório deve rodar r = 0,2; 0,3 e 0,5, em vez de 0,15 a 0,35, e usar 0,3 como valor central para Nelore até haver estimativa da própria população.

---

## Lacuna 5. Prioris informativas e parâmetros externos em rebanhos pequenos

**Resultado principal:** **não encontrei nenhum artigo que compare, em população pequena de corte ou multirracial, o BLUP com variâncias fixadas pela literatura contra a estimação própria, nem que use prioris informativas de variância em bovinos de corte.** O que existe é indireto e está abaixo, separado por tipo de evidência. Os pontos 5.1 e 5.2 sustentam a recomendação do relatório de "fixar as variâncias pela literatura"; os pontos 5.3 a 5.5 mostram os limites.

### 5.1 Parâmetros externos prontos para uso: meta-análise bayesiana hierárquica em zebuínos

**Giannotti JDG (2004).** *Meta-análise de parâmetros genéticos de características de crescimento em bovinos de corte sob enfoques clássico e bayesiano.* Tese de doutorado, ESALQ/USP, orientador I. U. Packer, 86 p. (`https://teses.usp.br/teses/disponiveis/11/11139/tde-22112004-153644/publico/juliana.pdf`, aberta). Dados: "em 186 artigos publicados, 869 estimativas de herdabilidade de efeito direto, 186 estimativas de herdabilidade de efeito materno e 123 estimativas do coeficiente de correlação genética entre os efeitos direto e materno" para PN, PD, P365 e P550 "em bovinos de corte de origem indiana". Modelo hierárquico bayesiano com Gibbs no WinBUGS. **Tabela 9 (p. 57), copiada:**

| Característica | h² direta (média a posteriori; IC 95%) | h² materna | Correlação direto-materna |
|---|---|---|---|
| Peso ao nascer | 0,31 (0,29; 0,33) | 0,09 (0,08; 0,11) | −0,16 (−0,22; −0,10) |
| Peso à desmama | 0,24 (0,23; 0,25) | 0,13 (0,11; 0,14) | −0,16 (−0,20; −0,12) |
| Peso aos 365 dias | 0,28 (0,26; 0,30) | 0,12 (0,09; 0,15) | −0,20 (−0,28; −0,12) |
| Peso aos 550 dias | 0,33 (0,30; 0,35) | 0,05 (0,04; 0,06) | −0,16 (−0,26; −0,07) |

**Tabela 8 (p. 56): variância entre estudos (τ²)**, que mede o quanto uma população nova pode se afastar da média: direta 0,013 (PN), 0,009 (PD), 0,010 (P365), 0,017 (P550); materna 0,003, 0,003, 0,007 e 0,0006; correlação 0,027, 0,029, 0,038 e 0,041. **Cálculo meu a partir dessas variâncias:** os desvios entre estudos (τ) são de 0,10 (PD) para a h² direta, 0,06 para a materna e 0,17 para a correlação. O ponto importante para uma priori é que **o intervalo de 95% da média (0,23 a 0,25 no PD) é muito mais estreito que a dispersão esperada entre populações (0,24 ± 0,19)**. Uma priori para um rebanho novo deve ter variância da ordem de τ², não do erro-padrão da média.

A autora discute por que os valores de h² materna e da correlação são difíceis de estimar: "Para obter boas estimativas são necessárias várias gerações de dados, com boas ligações entre elas... Frequentemente há insuficientes ligações entre as gerações e isto tem sido a causa de muitas estimativas publicadas de coeficientes de correlação entre os efeitos diretos e maternos serem viesadas (Schaeffer, 1999). Em muitos casos as h²d e h²m são subestimadas, enquanto os efeitos de ambiente permanente materno são superestimados." E que correlações de −0,5 ou mais negativas "tem sido vistas com justificado ceticismo (Meyer, 1997)" (p. 58–59). A literatura é de 1999 em diante até 2003; não inclui estimativas genômicas.

**Rojas de Oliveira et al. (2018)**, meta-análise de 197 herdabilidades de Nelore, *Anim. Prod. Sci.* 58:1575–1583, DOI 10.1071/AN16712: está na lista de artigos pagos do projeto e não foi lida aqui.

### 5.2 O que dizem os métodos: prioris informativas quase não são usadas

- **Meyer K (2011),** *Genet. Sel. Evol.* 43:39, DOI 10.1186/1297-9686-43-39 (aberto, PMC3331854), seção Introduction: "we have accumulated a substantial body of knowledge about genetic parameters for various traits. However, typically this is not used. While the Bayesian paradigm directly provides the means to incorporate such prior information, applications in estimating covariance components often assume flat or uninformative priors, i.e. do not fully exploit its advantages." O artigo propõe a máxima verossimilhança penalizada (equivalente a uma priori que "empresta força" da covariância fenotípica) e mostra por simulação que ela dá "substantial reductions in loss for estimates of genetic covariance... for small to moderate sample sizes". Conclusão do resumo: "Penalized maximum likelihood estimation provides the means to 'make the most' of limited and precious data". Os dados simulados não são de bovinos de corte.
- **Magaña-Valencia et al. (2026),** *Animals* 16(14):2192, DOI 10.3390/ani16142192 (aberto, PMC13406007), coelhos, 956 registros, com 40% a 48% das fêmeas com um só registro: o AI-REML "caused convergence problems" ao incluir o ambiente permanente, e o Gibbs do BLUPF90 "yielded non-zero estimates". Mas a priori foi a padrão ("The default GIBBSF90 prior specification was used, with degrees of freedom equal to −2"), e os autores avisam que as estimativas bayesianas maiores "do not necessarily imply greater accuracy". É evidência de que **mesmo em 2026 os estudos de dados limitados usam prioris não informativas**, e é de outra espécie.
- **Programas grandes** usam priori padrão: os artigos da ANCP de 2026 declaram "the default prior for random and systematic effects (i.e., Gaussian prior for random effects and flat for systematic)" no GIBBSF90+ (300.000 iterações, 100.000 de descarte, amostragem a cada 100; PMC13054113 e PMC13054110). Eles têm dezenas de milhares de registros, então a priori pouco importa.
- **O Interbeef fixa variâncias.** Bonifazi (2022, tese WUR, DOI 10.18174/572085, PDF p. 34): "For each country, genetic and environmental variances in the international model were fixed at the national estimates... Covariances among countries are assumed to be null for all random effects... except for the direct genetic and the maternal genetic covariances between countries, which were estimated in a previous study". As herdabilidades usadas variam "from 0.11 to 0.36 for the direct, and 0.05 to 0.15 for the maternal effect". É a única avaliação em produção, que eu li, que declara variâncias fixadas por origem externa.
- **Misztal, Lourenco & Legarra (2020),** *J. Anim. Sci.* 98(4):skaa101, DOI 10.1093/jas/skaa101 (PMC7183352), seção "Genetic parameters under genomic selection": "animal breeders tend to use either once-in-a-while estimates or to use pedigree-based estimates for genomic evaluation purposes". E, sobre o risco de parâmetro errado em ssGBLUP: "bias for U.S. dairy genomic evaluations decreased when heritability was reduced to about 70%–50% of the original value (Wiggans et al., 2012; Misztal et al., 2017), which is an indicator of overestimated heritability". Sob seleção forte, "the estimates ignoring the genomic information are biased (Gao et al., 2019; Hidalgo et al., 2020)".

### 5.3 O que atrapalha a estimação própria em rebanho pequeno (evidência direta, em corte)

- **Medeiros et al. (2026),** *Genes* 17(2):173, DOI 10.3390/genes17020173 (composto Montana, PMC12940800): com média de 1,77 ± 1,73 bezerros por vaca, os autores apontam "the classic identifiability problem: when cows produce few recorded progeny the ability to separate maternal genetic variance from persistent environmental effects per dam is weak, and standard errors are large". E: "The relatively low average number of progeny per dam (1.77 ± 1.73) restricts the ability to distinguish σ²_am from σ²_mpe, leading to confounding between these components" (os autores escrevem σ²_am, mas o contexto é a variância genética materna). Na Tabela 4 (peso à desmama), σ²m varia de 107,21 (M1) a 68,71 (M10) e σam de −63,57 a −44,17 conforme o modelo, enquanto σ²e quase não muda. O artigo conclui que "differences in model specification mainly reallocate variance among direct and maternal components rather than altering the estimated environmental noise".
- **Londoño-Gil et al. (2025),** ver 5.4: os componentes foram estimados por AI-REML no BLUPF90+ para cada raça e para o conjunto, com "Direct and maternal genetic effects were not correlated" (σam = 0), a mesma convenção da ANCP.

### 5.4 Populações pequenas e multirraciais (zebuínos)

- **Londoño-Gil M, López-Correa R, Aguilar I, Magnabosco CU, Hidalgo J, Bussiman F, Baldi F, Lourenco D (2025).** "Strategies for genomic predictions of an indicine multi-breed population using single-step GBLUP." *J. Anim. Breed. Genet.* 142(1):43–56, DOI 10.1111/jbg.12882 (aberto, PMC11629074). Dados da ANCP: pedigree de 4.207.516 animais, 328.748 fenótipos e 63.492 genótipos (Nelore, Brahman, Guzerá e Tabapuã); peso a 210 e 450 dias e PE365. O modelo declara efeitos fixos de "contemporary group and age of dam classes"; os GCs de peso são "breed, farm, year and season of birth, sex and management group", com GCs de menos de 5 registros removidos e desvios de ±3 DP. Resultado: "In general, when the breeds were evaluated in the single-breed approach, the accuracy was lower, and the dispersion was worse... especially for the Guzerat and Tabapua breeds, which have less data. In the multi-breed approach, merging all breeds increased the accuracy for most breeds and scenarios", mas "the improvement was inversely proportional to the number of genotypes and phenotypes within a breed". Com metafundadores, a acurácia (método LR) foi de 0,54 (Tabapuã) a 0,77 (Nelore) para W210, de 0,59 (Tabapuã) a 0,71 (Nelore) para W450 e de 0,39 (Guzerá) a 0,82 (Nelore) para PE365. Houve viés com metafundadores em W450 (Brahman e Guzerá) e em PE365 (todas as raças), que os autores atribuem a "insufficient genotyped animals with phenotypes connected with MF". **Isso confirma o uso de metafundadores na ANCP e mostra o limite em raças com poucos genótipos.**
- **Leguizamón SM & Cantet RJ (2010),** *Genet. Sel. Evol.* 42:20, DOI 10.1186/1297-9686-42-20 (aberto, PMC2909157): modelo animal multirracial com efeitos maternos formulado como análise bayesiana hierárquica; em Angus × Hereford de peso à desmama, "Angus and Hereford breeds contributed with 50.26% and 41.73% of the total direct additive variance, and with 23.59% and 59.65% of the total maternal additive variance". É a base teórica para tratar raças como estratos de um modelo hierárquico, que empresta força entre elas.
- **Mrode et al. (2018),** *Front. Genet.* 9:694, DOI 10.3389/fgene.2018.00694 (aberto, PMC6334160), revisão sobre populações de referência pequenas em países em desenvolvimento (leite e corte indígena e cruzado). Parcialmente lida; recomenda pooling entre programas. Não tem equações.

### 5.5 O que continua em aberto
- Teste empírico de BLUP com variâncias fixas (da literatura) contra variâncias estimadas, em rebanho de corte com 100 a 5.000 vacas.
- Prioris informativas para σ²a, σ²m, σam e σ²pe de peso à desmama em Nelore ou composto tropical, de qualquer fonte.
- Se as variâncias estimadas na população grande (ANCP) valem para rebanhos fora dela (a ANCP não publica seus componentes).
- Nardone & Valentini (1989), *Ann. Zootech.* 38:315–319, DOI 10.1051/animres:19890309, "Effect of errors in genetic and environmental variances on the BLUP estimates of sire breeding values", e Maniatis & Pollott (2003), *J. Anim. Sci.* 81:101–108, DOI 10.2527/2003.811101x (efeito da estrutura de dados nos componentes com efeito materno, em ovinos), são os trabalhos mais próximos do tema; não consegui lê-los (OUP e EDP bloqueados). Gianola, Foulley & Fernando (1986), *Genet. Sel. Evol.* 18:485, DOI 10.1186/1297-9686-18-4-485, tratam a predição com variâncias desconhecidas e são abertos, mas o servidor da Springer bloqueou o acesso nesta sessão.

### 5.6 Recomendação para o relatório (conclusão minha, não de uma fonte)

Dado que a literatura fecha poucas lacunas, a recomendação do relatório (fixar as variâncias com a literatura e testar sensibilidade) fica melhor se dita assim: (1) usar como ponto central a meta-análise (h²d 0,24, h²m 0,13 no peso à desmama de zebuínos) ou o valor do programa de referência quando disponível; (2) fixar σam = 0, como a ANCP, o que também evita o viés de estimativa da correlação negativa descrito na tese de Giannotti; (3) rodar a avaliação com h² nos extremos de ± 1 τ (para o PD, 0,14 e 0,34) e verificar se o ranking das vacas e touros do próprio rebanho muda; (4) como a Misztal et al. mostram que h² superestimada infla vieses em ssGBLUP, preferir o limite inferior quando houver genótipos.

### 5.7 Sugestão de texto para o relatório (substitui a frase "Isso equivale a um BLUP bayesiano com prioris informativas; um trabalho leiteiro parte justamente...")

> Fixar as variâncias pela literatura equivale a uma priori degenerada, e não há, até onde pude verificar, estudo que compare essa prática com a estimação própria em rebanhos pequenos de corte. O que existe é a meta-análise bayesiana de Giannotti (2004), com 186 artigos de zebuínos, que dá h² direta de 0,24 e materna de 0,13 para o peso à desmama, com desvio entre estudos de cerca de 0,10 e 0,06; as avaliações em produção (ANCP, ABCZ/Embrapa, Interbeef) fixam ou assumem zero a covariância direto-materna e usam variâncias estimadas fora do rebanho. A ANCP, com dados de populações pequenas multirraciais, mostra que juntar raças com metafundadores eleva a acurácia das menores (0,54 em Tabapuã para o peso a 210 dias), à custa de algum viés quando faltam genotipados. Para uma fazenda, vale rodar a avaliação com a h² central e com ± 1 desvio entre estudos e conferir se o ranking muda.

---

## Lacuna 6. Benchmarks brasileiros atuais de cria e recria, com metodologia publicada

**Resultado principal:** há números recentes (2023 a 2026) de **cinco fontes**, mas nenhum é uma média nacional com amostragem probabilística. A única série oficial longa é a do IMEA (Mato Grosso, desde 2006), e as demais são de fazendas que já fazem gestão. **Inttegra, Scot Consultoria, Rehagro e Embrapa não têm, que eu tenha achado, relatório público atual de cria com metodologia.** Cada número abaixo vai com a definição que a fonte dá e com o viés da amostra.

### 6.1 Cria: reprodução e desmama

| Fonte (período) | Indicador e valor | Amostra e definição publicada | Viés ou limite |
|---|---|---|---|
| **IMEA, Mato Grosso** (bezerros da estação de monta de 2023; divulgado em 27/10/2025, via Agrolink de 28/10/2025) | **Índice bruto de desmama: 65,58%** | "O indicador mede a proporção de animais desmamados em relação às vacas expostas à reprodução." Série desde 2006. Estimativa estadual do instituto | Estado único. A notícia diz "aumento de 1,22 ponto percentual em relação a 2024", mas a notícia de 02/12/2024 deu **67,65%** para 2024 (estação de monta de 2022, "quarta maior queda na série", −4,83 p.p.). 67,65 + 1,22 não dá 65,58, e o número do ano anterior pode ter sido revisado. Conferir no boletim do IMEA |
| **Senar-MS ATeG, benchmarking do ano pecuário 2023/2024** (CNA, 2026) | Fazendas com margem bruta positiva: **taxa de desmama 67,36%, estação de monta média de 7,67 meses e 139,76 kg de bezerro por matriz exposta**. Fazendas com margem negativa: 57,99%, 114,73 kg por matriz. Margem bruta de R$ 901,36 contra R$ 459,98 por hectare ao ano | "Uma base que reúne mais de 580 mil hectares de pastagens e 740 mil cabeças", propriedades assistidas pela ATeG de MS. A página não dá as fórmulas | Só fazendas assistidas. Grupos definidos pelo resultado econômico, então há causalidade invertida (quem lucra mede melhor) |
| **iRancho, Radar da Cria 25/26** (02/10/2026) | **Taxa de prenhez final 65,54%** (85.990 prenhes de 131.204 matrizes) e **mortalidade pré-desmame 4,93%**; concepção na IATF de **55,25% com ECC 2,75** contra **47,50% com ECC 2,50** (diferença de 7,75 p.p.) | 3.150 fazendas e mais de 1,3 milhão de registros da plataforma, safra 2025/2026, "do início ao fim da estação de monta". 62,55% dos protocolos de IATF em outubro a dezembro; só 19,20% das novilhas desafiadas de julho a setembro | A própria fonte diz que são "propriedades que usam tecnologia" e que o índice não é média do país, e cita 50% a 60% como faixa histórica nacional sem fonte. O relatório completo está atrás de formulário |
| **Instituto Inttegra, benchmarking da safra 2020/2021** (publicado pelo programa Cria Saudável da Elanco) | Fazendas "top 30% rentáveis": **fertilidade 82,2%** (potencial 87,1%), perda pré-parto 8,2% (3,1%), mortalidade de bezerros 3,0% (1,5%), **taxa de desmama 74,8%** (78,3%), **162 kg desmamados por vaca exposta** (181), aproveitamento de fêmeas 103,5% (120,3%) e 181 kg desmamados por hectare (193) | Definições no texto: fertilidade é a relação entre fêmeas em cobertura e as prenhes; perda pré-parto, "perdas entre o toque positivo e os nascimentos"; mortalidade, "entre o nascimento e o desmame"; taxa de desmame, "o total de animais desmamados em relação às vacas expostas em reprodução"; aproveitamento, "proporção de fêmeas acima de 18 meses exposta à monta". "Ao longo dos últimos 9 anos de estudo, os maiores resultados econômicos da cria foram conquistados quando a taxa de desmama foi próxima a 75%." Meta de "superar 160 kg de bezerros desmamados por matriz" | Safra de 2020/2021, sem tamanho de amostra na página, só o grupo lucrativo. É a série mais bem definida, mas está desatualizada e hospedada por um patrocinador. Não achei relatório público do Inttegra posterior |
| **ANCP, Sumário 2026, "ANCP em números"** (PDF p. 106) | Nelore: **PAC 174,04 kg de bezerro desmamado por vaca por ano** (220.829 obs.); IPP 35 meses (846.425); STAY 30% (798.805); período de gestação 295 dias; facilidade de parto de primíparas 96% (45.951); P210 201,03 kg. Guzerá: PAC 138,07 (3.647), IPP 37, STAY 18. Brahman: PAC 135,33 (9.108), IPP 37, STAY 32 | Programa de seleção com pesagens e fêmeas registradas. STAY: "Porcentagem de fêmeas que permaneceram até 76 meses de idade no rebanho, parindo pelo menos 3 vezes". FPP: "primíparas que apresentaram partos normais (sem auxílio humano)". PAC: "produtividade da vaca, em kg de bezerros desmamados por vaca por ano" (página de características da ANCP, sem fórmula) | Fazendas de seleção, com mais controle que a média |
| **Nogueira et al. (2026)**, *J. Anim. Sci.*, DOI 10.1093/jas/skag176, Nelore sob IATF | **Perda de gestação: 6,64% em multíparas, 8,28% em primíparas, 9,13% em novilhas convencionais e 12,35% em novilhas precoces**; 7,35% em vacas não lactantes (Tabela 3) | 305.325 serviços de IATF, 667 touros, 271 fazendas em 11 estados, 2015 a 2022. Modelo de limiar bayesiano no BLUPF90+. A introdução cita "more than 20% of reproductive-age females inseminated in 2022 and expected pregnancy rates near 50%" (SBTE 2025) | Fazendas com IATF |
| **Scot Consultoria**, artigo de 01/04/2025 | 26,9% das fêmeas inseminadas em 2023 e 28,5% em 2024 (estimativa Scot, com base em vendas de sêmen da ASBIA); fêmeas foram 41,8% do abate em 2023 | A "Tabela 1" (IA × monta natural: prenhez 61,9% × 54,0%; peso médio de fêmeas à desmama 250,5 × 186,0 kg, de machos 256,0 × 204,0 kg) cita "ARAUJO et al., 2012 e Souza et al., 2013", ou seja, **não é dado atual da Scot** | Os números de inseminação são de mercado; a tabela de desempenho é de estudos de 2012 e 2013 |

**Observações:**
1. As definições dos denominadores coincidem nas fontes (IMEA, Inttegra): taxa de desmama = desmamados ÷ vacas expostas. A Embrapa (Documentos 237, abril de 2018, Tabela 5, p. 21) usa "Bezerros(as)/matrizes/ano" para natalidade e desmama, "% matrizes expostas a touro e/ou inseminação/ano" para prenhez e "kg PV/ano/matrizes" para o peso vivo de bezerros desmamados por vaca. **O app deve calcular e rotular o denominador** (vacas expostas ou vacas paridas), porque o 65% do IMEA e o 74,8% do Inttegra só se comparam se o denominador for o mesmo.
2. Os números sustentam **faixas**, não uma meta única: taxa de desmama de 58% a 67% (Senar-MS) e 65,6% (IMEA) como realidade de MT; 75% (Inttegra) como referência dos mais lucrativos; 140 kg a 162 kg por matriz exposta como referência dos lucrativos; 114,7 kg nos de margem negativa; 174 kg por vaca por ano (ANCP, que mede por ano de vida produtiva e não por vaca exposta, então não é comparável diretamente).
3. Para fêmeas, **a perda de gestação cai com a idade** (12,35% a 6,64%), o que dá uma meta por categoria.

**IEP.** **[NÃO ENCONTRADO]** benchmark atual com metodologia. O IEP citado no relatório (392 dias em primíparas do Cerrado, 510 no Pará) vem de estudos de 2001 a 2012. A ANCP publica o período de gestação (295 dias para Nelore) e o IPP, não o IEP.

### 6.2 Recria: GMD

| Fonte | Valor | Observação |
|---|---|---|
| **ABCZ/Embrapa, página do sumário Nelore de 2016** (`abczstat.com.br/.../Sumario-racas-NEL.htm`, atualizada em 2022; 8.456.473 registros válidos, 5.423.812 de crescimento) | **GPD pós-desmama (g/dia): a pasto 345,94 ± 152,10; semi-estabulado 563,21 ± 212,39; estabulado 748,59 ± 229,49**; fêmeas a pasto 308,67 e machos 386,21 | "RA1= Regime alimentar a pasto; RA2=Regime alimentar semi-estabulado; RA3=Regime estabulado". O GPD é a diferença entre pesos padronizados; dados até 2016 |
| **Tambara AAC et al. (2021)**, *R. Bras. Zootec.* 50:e20210020, DOI 10.37496/rbz5020210020, meta-análise de bovinos em pasto tropical | **GMD 0,81 kg/dia nas águas e 0,56 kg/dia na seca**; "the ADG of beef cattle increased by 0.308 kg for each 1% of supplement intake" | 132 estudos de 1999 a 2010 e 6.275 animais, idade inicial média de 480 ± 188 dias, 83,8% machos. Revisados por pares, mas de experimentos |
| **ANCP, sumário 2026, "ANCP em números"** | Pesos médios do Nelore: P210 201,03 kg, P365 270,17 kg, P450 319,58 kg. **GMD implícito: 0,446 kg/dia de 210 a 365 dias e 0,581 kg/dia de 365 a 450 dias; 0,494 kg/dia de 210 a 450** (cálculo meu) | **[INFERÊNCIA]** misturam animais, regimes e sexos, de modo que servem só de ordem de grandeza |

**Observações:** não encontrei levantamento de GMD de recria de Inttegra, Embrapa, Agroconsult ou IMEA com amostra e método publicados. Os números de GMD de 1,0 a 1,6 kg/dia que circulam em reportagens (Giro do Boi, Compre Rural, Portal DBO) são casos de fazenda, e não os usei. O guia de uso: GMD a pasto das águas na ordem de 0,6 a 0,8 kg/dia e da seca perto de 0,5 kg/dia, com suplementação elevando cerca de 0,3 kg para cada 1% do peso vivo.

### 6.3 O que continua em aberto
- Relatório público atual (2023 em diante) de **Inttegra, Rehagro, Agroconsult ou Scot** com amostra, período e fórmulas. O Radar da Cria da iRancho tem amostra grande mas está gated.
- Boletim do IMEA com a série completa e a metodologia (o IMEA não estava acessível; só li notícias).
- IEP, IPP e idade ao abate **por programa e com N**: a ANCP publica IPP médio, mas não IEP.

### 6.4 Sugestão de texto para o relatório (substitui "As notas não encontraram benchmark brasileiro atual e nacional para os indicadores de cria...")

> Os números brasileiros recentes de cria vêm de levantamentos de fazendas que já fazem gestão, e não de amostras nacionais. O IMEA (MT) mede o índice bruto de desmama, desmamados ÷ vacas expostas, em 65,58% para a estação de monta de 2023 (série desde 2006). O benchmarking do Senar-MS de 2023/2024 deu taxa de desmama de 67,4% e 140 kg por matriz exposta nas fazendas de margem positiva, contra 58,0% e 115 kg nas de margem negativa. O Inttegra publicou, para as 30% mais rentáveis da safra 2020/2021, fertilidade de 82,2%, desmama de 74,8% e 162 kg por vaca exposta. A iRancho (3.150 fazendas, safra 2025/2026) mediu prenhez final de 65,5% e mortalidade pré-desmame de 4,9%. Em IATF de Nelore (305 mil serviços, 2015–2022), a perda de gestação foi de 6,6% em multíparas e de 12,4% em novilhas precoces. Na recria, o GMD a pasto fica entre 0,56 kg/dia na seca e 0,81 kg/dia nas águas (meta-análise de 132 estudos). Como cada fonte usa amostra e denominador diferentes, o app deve exibir o indicador com a fórmula e o denominador, e a comparação mais informativa é a do rebanho com a sua própria série e com o grupo de contemporâneos.

---

## Lacuna 7. Revisões abertas sobre avaliação genética de corte e genômica em zebuínos e Nelore

**Resultado principal:** li **quatro revisões abertas** (2020 a 2026) e uma quinta parcialmente. **Nenhuma revisão aberta que eu tenha achado trata especificamente de avaliação genética de Nelore com equações.** As duas revisões mais úteis para o projeto são de ssGBLUP e descrevem exatamente o software que a ANCP usa (BLUPF90+). A revisão específica de Nelore (Fernandes Júnior et al. 2022, *Livestock Science*) é paga e entra na lista final. As equações abaixo foram extraídas do XML das fontes (MathML) e **linearizadas por mim**: os símbolos são os da fonte, mas a grafia de subscritos (`_`) e sobrescritos (`^`) é do meu conversor. O XML foi lido via Europe PMC.

### 7.1 Lourenco D, Legarra A, Tsuruta S, Masuda Y, Aguilar I, Misztal I (2020). *Single-Step Genomic Evaluations from Theory to Practice: Using SNP Chips and Sequence Data in BLUPF90.* **Genes** 11(7):790. DOI 10.3390/genes11070790 (PMC7397237, aberto)

**Modelos descritos e equações copiadas** (numeração da fonte entre parênteses):

```
(1)   Z = M − 2p′                                   M: matriz de genótipos 0/1/2; p: frequências alélicas
(11)  G = ZZ′ / ( 2 Σ_{i=1..SNP} p_i (1 − p_i) )                    (12) Var(u) = G σ²u
(13)  G = αG + (1 − α) A22      "the blending parameter α is usually 95% but can vary from 99 to 80%, or even to 50%"
(14)  y = Xb + Wu + e
(15)  [ X′X   X′W ; W′X   W′W + G⁻¹ σ²e/σ²u ] [ b̂ ; û ] = [ X′y ; W′y ]                   (GBLUP)
(30)  H = [ Var(u1)  Cov(u1,u2) ; Cov(u2,u1)  Var(u2) ] = [ A11 + A12 A22⁻¹ (G − A22) A22⁻¹ A21   A12 A22⁻¹ G ; G A22⁻¹ A21   G ]
(33)  H⁻¹ = A⁻¹ + [ 0  0 ; 0  G⁻¹ − A22⁻¹ ]
(35)  [ X′X   X′W ; W′X   W′W + H⁻¹ σ²e/σ²u ] [ b̂ ; û ] = [ X′y ; W′y ]                 (ssGBLUP)
(37)  ρ = (1/n²) ( Σ_i Σ_j A22_{i,j} − Σ_i Σ_j G_{i,j} )          (38) G* = (1 − ρ/2) G + 11′ ρ
(39)  H⁻¹ = A⁻¹ + [ 0  0 ; 0  τ G⁻¹ − ω A22⁻¹ ]
(53)  G_APY⁻¹ = [ G_cc⁻¹  0 ; 0  0 ] + [ −G_cc⁻¹ G_cn ; I ] M_nn⁻¹ [ −G_nc G_cc⁻¹   I ],   m_nn,ii = g_ii − g_ic G_cc⁻¹ g_ci
(54)  A22⁻¹ = A^{22} − A^{21} (A^{11})⁻¹ A^{12}
(55)  H^{−1*} = A^{−1*} + [ 0 0 0 ; 0  G⁻¹ − A22⁻¹  −(G⁻¹ − A22⁻¹) Q2 ; 0  −Q2′ (G⁻¹ − A22⁻¹)  Q2′ (G⁻¹ − A22⁻¹) Q2 ]      (grupos de pais desconhecidos, UPG)
(56)  H^{Γ−1} = A^{Γ−1} + [ 0 0 ; 0  G⁻¹ − A22^{Γ−1} ]          (metafundadores; Γ = relações entre metafundadores)
```

**Pontos de implementação relevantes ao Programa Nelore Brasil** (seções 2.5, 2.6, 2.10, 2.11):
- "By default, in the blupf90 the blending parameter α is set to 0.95, which makes 1−α (or β) equal to 0.05." Opção `OPTION AlphaBeta 0.90 0.10`.
- Escala de G: "the default in the genomic library is to adjust G as proposed in Chen et al. [57]: G*=φG+δ, where φ=[diag(A22)‾ − offdiag(A22)‾]/[diag(G)‾ − offdiag(G)‾] and δ=diag(A22)‾ − diag(G)‾·φ", e `OPTION tunedG 4` seleciona a forma da Eq. (38) (Vitezica et al.). "A total of four different adjustments are implemented... types 2 and 4 are more frequently used."
- "The default in blupf90 is ω = τ = 1." Antes de 2016, "The ω parameter was usually set to 0.7 for beef and dairy cattle ssGBLUP evaluations", e, depois de considerar a endogamia em A⁻¹ (`INBREEDING pedigree`), "the need for ω lower than 1 was reduced".
- APY: "Pocrnic et al. [85] and [86] found that the ideal number of core animals depends on the dimensionality of genomic information." Em bovinos, o posto de G fica em cerca de 15 mil (ver Misztal et al.). Aviso: "Unfortunately, the subroutines to create G_APY⁻¹ and efficient A22⁻¹ are not implemented in the free distribution of BLUPF90 family of programs." **Isso é relevante para o laboratório do projeto**: o APY da ANCP usa uma versão que não está no pacote gratuito.
- UPG e metafundadores: "Legarra et al. [99] proposed the idea of metafounders, which are 'inbred and related' UPG." Com `OPTION exact_upg` os UPG entram em H⁻¹ inteiro; `OPTION TauOmegaQ2 0.0 1.0` tira UPG de G⁻¹.

**Observação para o relatório v1** (pequena; para o verificador): o relatório monta G* igualando a média da diagonal e a média geral às de A22 (G* = α + β·G), enquanto o padrão do BLUPF90 é o de Chen et al., que iguala a média da diagonal e a média dos elementos fora da diagonal. Os dois ajustes usam dois momentos e dão resultados parecidos, mas **não são o mesmo ajuste**. A mistura G_w = 0,95·G* + 0,05·A22 do relatório coincide com o padrão (α = 0,95).

### 7.2 Misztal I, Lourenco D, Legarra A (2020). *Current status of genomic evaluation.* **J. Anim. Sci.** 98(4):skaa101. DOI 10.1093/jas/skaa101 (PMC7183352, aberto)

**Modelos descritos e equações copiadas:**

```
Multietapas (VanRaden et al. 2009):   GEBV = w1·PA + w2·DGV − w3·PI        PA: média dos pais; DGV: valor genômico direto; PI: índice dos pais (tira dupla contagem)
ssGBLUP, H (Legarra et al. 2009; Christensen & Lund 2010):
   H = [ var(u1)  cov(u1,u2) ; cov(u2,u1)  var(u2) ] = [ A11 + A12 A22⁻¹ (G − A22) A22⁻¹ A21   A12 A22⁻¹ G ; G A22⁻¹ A21   G ]
   H⁻¹ = A⁻¹ + [ 0  0 ; 0  G⁻¹ − A22⁻¹ ]            (Aguilar et al. 2010; Christensen & Lund 2010)
   H⁻¹ = A⁻¹ + [ 0  0 ; 0  G⁻¹ − ω A22⁻¹ ]           (Tsuruta et al. 2011; "The parameter ω compensates for incomplete pedigree and incomplete accounting of inbreeding")
UPG nas matrizes completas:  H* = A* + [ 0 0 0 ; 0  G⁻¹ − A22⁻¹  −(G⁻¹ − A22⁻¹) Q2 ; 0  −Q2′ (G⁻¹ − A22⁻¹)  Q2′ (G⁻¹ − A22⁻¹) Q2 ]
APY:   G_APY⁻¹ = [ G_cc⁻¹  0 ; 0  0 ] + [ −G_cc⁻¹ G_cn ; I ] M⁻¹ [ −G_nc G_cc⁻¹   I ],   m_i = g_ii − g_ic G_cc⁻¹ g_ci
Acurácia aproximada:   PEV_i σ²e ≈ 1 / ( σ²e/σ²a + d_i^r + d_i^p + d_i^g )     d: contribuições de pedigree (r), fenótipo (p) e genômica (g)
```

**Frases que valem citar:**
- "G has a rank of about 5k for pigs and chicken to about 15k for beef and dairy (Pocrnic et al., 2016b)... the inverse of G can be obtained by recursion on a number of 'core' animals equal to the rank of G."
- "The concept of metafounders provides a convenient solution to ssGBLUP applied to purebreds and crossbreds... the relationship across breeds represent a distance from a common genetic origin."
- "When the base populations are heterogeneous with missing pedigrees across generations, as is typical in ruminants, ssGBLUP may diverge or become biased."
- "Genomic evaluations are validated by realized accuracies... Legarra and Reverter (2018) in a method called LR... The advantage of method LR is the ability to support any model and any data structure."
- "In genomic evaluations, all genotyped animals are connected through G. It means that information on new genotyped animals affects all the other genotyped animals, causing fluctuations." (sobre a instabilidade dos GEBV, que combina com o aviso da ANCP de que a acurácia genômica "não é diretamente comparável").
- "Genetic parameters under genomic selection": ver lacuna 5.

### 7.3 Zhang L et al. (2026). *From linear models to deep learning: statistical advances in genomic selection for animal breeding.* **J. Anim. Sci. Biotechnol.** 17. DOI 10.1186/s40104-026-01477-w (PMC13449407, aberto)

Revisão geral (não é de corte nem de zebuínos) sobre BLUP, GBLUP, ssGBLUP, RR-BLUP, família Bayes, aprendizado de máquina e redes profundas. **Equações copiadas (numeração da fonte):**

```
(1)  y = Xb + Za + e
(2)  [ X′R⁻¹X   X′R⁻¹Z ; Z′R⁻¹X   Z′R⁻¹Z + G⁻¹ ] [ b̂ ; â ] = [ X′R⁻¹y ; Z′R⁻¹y ]       com R = I σ²e e G = A σ²a
(3)  [ X′X   X′Z ; Z′X   Z′Z + A⁻¹ k ] [ b̂ ; â ] = [ X′y ; Z′y ],   k = σ²e/σ²a
(4)  y = Xg + Za + e     (GBLUP, como impresso; o texto chama de "g" os efeitos fixos)
(5)  [ X′X   X′Z ; Z′X   Z′Z + G⁻¹ k ] [ ĝ ; â ] = [ X′y ; Z′y ],   k = σ²e/σ²a
(7)  H = [ A11 − A12 A22⁻¹ A21 + A12 A22 G A22⁻¹ A21   A12 A22⁻¹ G ; G A22⁻¹ A21   G ]          ← como impresso
(8)  [ X′X   X′Z ; Z′X   Z′Z + H⁻¹ k ] [ b̂ ; â ] = [ X′y ; Z′y ],   k = σ²e/σ²a
(9)  y = Xb + Σ_{j=1..M} Z_j α_j + e                           (Bayes)
(10) σ²_{g_i} = 0 com probabilidade π     (11) σ²_{g_i} ~ χ⁻²(ν, S) com probabilidade (1 − π)      (BayesB)
(12) σ̃̃²_a = σ̃̃²_s / ( (1 − π) Σ_{k=1..K} 2 p_k (1 − p_k) )
```

**Erro na fonte, que deve ser registrado:** a Eq. (7) da revisão aparece, no XML (código LaTeX), como `A_{12}A_{22}G A_{22}^{-1}A_{21}` no bloco H11, com o **A22 sem inverso** antes do G. A forma correta é a de Misztal et al. (2020) e Lourenco et al. (2020), acima. Não usar a Eq. (7) da revisão de Zhang. A Eq. (4) também usa "g" para o vetor de efeitos fixos, o que conflita com o uso de g genômico na Eq. (5). Outros pontos úteis: BayesB com "ν, S e π de 4,2339, 0,0429 e 0,947" nos parâmetros originais de Meuwissen et al.; "The performance of BayesCπ is highly sensitive to factors such as heritability and marker density"; e, citando Goddard et al., "a blended matrix incorporating pedigree information... enhances the stability of variance component estimation, particularly in populations with limited sample sizes or weak genetic connections".

### 7.4 Ogunbawo AR, Mulim HA, Campos GS, Schinckel AP, Oliveira HR (2024). *Tailoring Genomic Selection for Bos taurus indicus: A Comprehensive Review of SNP Arrays and Reference Genomes.* **Genes** 15(12):1495. DOI 10.3390/genes15121495 (PMC11675768, aberto)

**É a revisão aberta específica de zebuínos**, mas trata de marcadores e genomas de referência e **não traz equações nem modelos de avaliação**. Pontos úteis (seção 6):
- "Genotyping B. t. indicus cattle using SNP arrays designed for B. t. taurus often resulted in artificially high levels of genome homozygosity" e "The widely used Illumina Bovine SNP50 array was insufficient for accurate genomic predictions and selection in Bos indicus cattle".
- Painéis para zebuínos: Clarifide Nellore 2.0, de cerca de 12.000 SNPs; Clarifide Nellore 3.1, com mais de 29.001; GGP Indicus 75K (GGP-75Ki), de cerca de 74.677; Super GGP Indicus (SGGP-20Ki), de cerca de 18.860. "This panel is typically used for reference animals, while selection candidates are genotyped using a lower-density panel followed by imputation to higher densities."
- "using a B. t. taurus reference genome to genotype indicine cattle can lead to biases"; há um assembly haplotipo-resolvido de Brahman, e o Bovine Pangenome Consortium busca incluir mais raças zebuínas.
- Perspectivas: painéis específicos, sequenciamento de baixa cobertura e redução do viés de seleção de SNPs.

### 7.5 Mrode R, Ojango JMK, Okeyo AM, Mwacharo JM (2018). *Genomic selection and use of molecular tools in breeding programs for indigenous and crossbred cattle in developing countries: current status and future prospects.* **Front. Genet.** 9:694. DOI 10.3389/fgene.2018.00694 (PMC6334160, aberto), lida em parte

Sem equações. Tema: populações de referência pequenas e formadas sobretudo por fêmeas, uso de fenótipos corrigidos de vacas genotipadas como variável resposta e necessidade de reunir dados entre programas ("The small reference populations indicate the need for across regional genomic prediction systems"). É mais de leite e de países africanos, e por isso entra só como contexto de população pequena.

### 7.6 O que continua em aberto
- **Fernandes Júnior GA, Peripolli E, Schmidt PI, Campos GS, Mota LFM, Mercadante MEZ et al. (2022).** *Current applications and perspectives of genomic selection in Bos indicus (Nellore) cattle.* *Livestock Science* 263:105001, DOI 10.1016/j.livsci.2022.105001. É a revisão de Nelore mais citável e **não tem acesso aberto**; entra na lista de pagos.
- Montaldo et al. (2012), *Animal Frontiers* 2(1):23–29, DOI 10.2527/af.2011-0029, sobre seleção genômica em corte na América Latina; OUP bloqueou o acesso.
- Garrick & Golden (2009), *J. Anim. Sci.* 87(suppl_14):E11–E18, DOI 10.2527/jas.2008-1431, que descreve a avaliação nacional de corte dos EUA; também pago.
- Nenhuma revisão aberta de **modelos de efeitos maternos, de limiar para STAY ou de sobrevivência para IVUP** em zebuínos.

### 7.7 Sugestão de texto para o relatório (adição ao capítulo de genômica)

> As revisões de referência para o ssGBLUP que a ANCP usa são Misztal et al. (2020, J. Anim. Sci. 98:skaa101) e Lourenco et al. (2020, Genes 11:790). O BLUPF90 mistura G com A22 por padrão em α = 0,95 e β = 0,05 e escala G pelo método de Chen et al. (média da diagonal e dos elementos fora da diagonal); o parâmetro ω de H⁻¹ = A⁻¹ + [0 0; 0 τG⁻¹ − ωA22⁻¹] tem padrão 1 e foi usado em 0,7 em avaliações de corte e leite antes de a endogamia entrar em A⁻¹; a inversa de G pelo APY, em bovinos, usa um núcleo da ordem do posto de G, cerca de 15 mil animais, e essa rotina não vem no pacote gratuito. Para zebuínos, a revisão de Ogunbawo et al. (2024) mostra que painéis de taurinos geram homozigose artificial e que há painéis específicos (de 12 mil a 75 mil SNPs) usados com imputação. A revisão de Nelore (Fernandes Júnior et al. 2022) não é aberta.

