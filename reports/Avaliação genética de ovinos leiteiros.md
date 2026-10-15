# Ovelhas leiteiras ganham EBVs importando conexão genética

Na ovinocultura leiteira, os valores genéticos (EBV, publicados na França como índices e resumidos no ISOL) saem do mesmo **BLUP de modelo animal** usado em bovinos e caprinos, mas três escolhas próprias da ovelha mudam o cálculo. A primeira é a **medida**: como os cordeiros mamam no início e o pico da curva cai nessa fase, a ICAR só aceita o leite da **ordenha exclusiva** (TMM, ou TMY quando a ordenha começa no parto), calculado pelo método de Fleischmann, não fixa uma lactação padrão e admite controles de uma só ordenha (AT e AC), que já cobrem **98% das ovelhas controladas**. A segunda é o **modelo**: a avaliação francesa da Lacaune e das raças pirenaicas é um modelo animal de repetibilidade, característica por característica, com grupos de pais desconhecidos e **variâncias heterogêneas por rebanho × ano × ordem de parto desde 2002**, e passou ao **ssGBLUP em 2015**; hoje a referência tem mais de 10 mil carneiros de IA. Herdabilidades de 0,24 a 0,30 para o leite, repetibilidades de 0,41 a 0,50 e herdabilidade de 0,13 a 0,15 para o escore de células somáticas sustentam o ISOL, que dá **50% do peso a células e úbere desde 2005**. A terceira é a **escala**: a genômica rende na Lacaune (acurácia de validação do leite de 0,32 para 0,47), quase nada na Latxa com 429 carneiros genotipados (0,47 para 0,50), e o gene SOCS2 mostra que um mesmo alelo eleva as células e o leite. O Brasil não tem avaliação genética de ovinos leiteiros: eram cerca de **6.900 matrizes e 840 mil litros por ano em 2015**, Lacaune em 96% dos rebanhos e um registro genealógico (ARCO) sem dados de leite. Para rebanhos de 20 a 1.000 ovelhas, os exemplos deste relatório mostram que a precisão vem de **conectar**, não de modelar mais. Dez filhas de um carneiro num só rebanho dão confiabilidade de 0,22 a 0,28, e quarenta filhas em cinco a dez rebanhos dão 0,68 a 0,70. Um rebanho fechado com três carneiros para 100 ovelhas acumula **4,3% de endogamia por geração**. E, se o rebanho brasileiro estiver de 46 a 65 L atrás dos carneiros franceses atuais, já descontada a interação genótipo × ambiente (hipótese de 14 anos sem renovação genética), cada filha de sêmen importado ganha **de 23 a 33 L por lactação** já na primeira geração.

**Grau de confirmação.** As notas desta rodada leram o texto integral de parte das fontes ovinas (ICAR, Astruc et al. 2016 e 2023, Vouraki et al. 2025, Zhelyazkova et al. 2023, Oget et al. 2019, Rupp et al. 2015, Riggio et al. 2010, Ticiani et al. 2013, IN 76/2018 e RIISPOA, entre outras), mas muitas afirmações vêm só de resumo, de slide ou de trecho de busca, porque os PDFs do MAPA espanhol, do Idele, da HAL e do *Journal of Dairy Science* ficaram bloqueados. Os marcadores são os mesmos do relatório de caprinos. **[não verificado]** indica afirmação sem fonte primária lida. **[trecho de busca]** indica número visto só no resultado de busca. **[resumo]** indica que só o resumo foi lido. **[leitura de imagem]** indica valor lido em figura ou tabela renderizada. **[conferido numericamente]** indica conta refeita pelo script do Apêndice A, o que prova consistência interna, não autoria. **[inferência]** e **[proposta deste relatório]** marcam conclusões e metas que nenhuma fonte fixa. Seis cuidados vêm dos pesquisadores e valem para todo o texto. Rupp et al. (2011) e os "21 traços de conformação" que aparecem em buscas são de **cabras**, não de ovelhas. Um estudo de ordenhabilidade atribuído à raça Sarda (acurácia de 0,29 contra 0,40) é de **bovinos Simmental** e foi descartado. Baloche et al. (2014) é *J. Dairy Sci.* 97:1107, e não *Genetics Selection Evolution*. O gene FecL foi descrito na **linha de carne** da Lacaune (Ovi-Test), e não na leiteira. A fórmula e os pesos oficiais do ISOL **não foram verificados**. Vários slides de congresso da pasta de fontes não tinham URL de origem registrada; o texto cita o endereço público quando outra nota conferiu o arquivo por checksum ou leitura, e diz isso quando não há endereço. Os conflitos de números apontados pelos pesquisadores (ganho genético da Lacaune e da Latxa, data da genômica na ROLP, quantidade mínima de leite na ICAR, equações de Ticiani et al., limites regulatórios europeus) são apresentados lado a lado onde aparecem, sem escolher um valor quando as fontes não permitem.

Este é o quarto e último relatório da série, e não repete a teoria geral. O modelo animal, a matriz A e sua inversa, as equações de modelos mistos (MME), a acurácia pela variância do erro de predição, o REML, o ssGBLUP, o APY e a "Possible Change" estão no [relatório de bovinos de corte](Avaliação%20genética%20de%20bovinos%20de%20corte.md). A lactação padronizada, o modelo de dia de controle, as filhas-equivalentes com **k_d = (4 − 2h²)/h²** e os índices econômicos estão no [relatório de bovinos leiteiros](Avaliação%20genética%20de%20bovinos%20leiteiros.md). As regras da ICAR para pequenos ruminantes, o método de Fleischmann, as ferramentas para rebanhos pequenos, as metas por categoria e os dados para o app estão no [relatório de caprinos leiteiros](Avaliação%20genética%20de%20caprinos%20leiteiros.md). Ovelhas e cabras compartilham a Seção 16 da ICAR, e a tabela abaixo resume onde elas se separam.

| Aspecto | Cabras (relatório anterior) | Ovelhas (este relatório) |
|---|---|---|
| Fase registrada | TMY quando a cabra é ordenhada desde o parto; TMM após a mamada | Quase sempre TMM: o pico cai na fase de mamada e só a fase descendente é medida |
| Conversão peso–volume | 1,032 | 1,036 |
| Menor produção medida | 200 g | 200 g numa seção e 150 g em outra, conflito interno da ICAR |
| Lactação de referência | 210, 250 ou 305 dias | ordenha exclusiva da safra (165 a 173 dias na Lacaune); 180 ou 150 dias na Assaf; 130 dias na Nova Zelândia |
| Controle dominante | métodos com as duas ordenhas e o método D | AT e AC de uma ordenha, com amostragem parcial da composição (98% das ovelhas) |
| Modelo francês de produção | animal multicaracterística, rebanho × ano × ordem de parto | animal de repetibilidade por característica, grupos de pais desconhecidos e variância heterogênea |
| Genômica francesa | ssGBLUP multirraça Alpina + Saanen, referência de centenas de bodes (2017) | ssGBLUP dentro da Lacaune, referência de mais de 10 mil carneiros (2015) |
| Gene de grande efeito | αs1-caseína (cerca de 40% da variância genética do teor de proteína) | SOCS2 (12% da variância genética das células, com efeito favorável no leite) |
| Índice francês | ICC: produção, tipo, células e sucesso da IA | ISOL: 50% produção (sólidos) e 50% funcional (células e úbere) desde 2005 |
| Conformação | 11 notas lineares de 1 a 9 | 3 notas na Lacaune; sem recomendação da ICAR para ovinos |
| Características exclusivas | — | resistência genética ao scrapie (PRNP); carneiros resistentes a verminose indexados na França |
| Brasil | Capragene: avaliação e teste de progênie desde 2005 | nenhuma avaliação genética; registro genealógico sem leite |

## A ovelha entra no BLUP pela ordenha exclusiva, não pela lactação inteira

### A ICAR só mede depois do desmame e não fixa lactação padrão

A Seção 16 da ICAR separa três períodos. A **duração da mamada** é o tempo em que os cordeiros mamam, ou mamam e a ovelha é ordenhada em parte; se só há fase colostral, ela vale zero. A **duração da ordenha exclusiva** vai do desmame à secagem. A **duração da lactação** é a soma das duas. Daí saem três produções: a **TMY** (do parto à secagem, sem mamada), a **TMM** (só a ordenha exclusiva, depois de uma mamada) e a **TSMM** (leite mamado mais TMM). Só a ordenha exclusiva entra no controle leiteiro, porque "it is impossible to measure the individual milk yield of suckled ewes ... accurately", e o controle só vale quando a ovelha está "definitively separated from its lamb(s)". Na situação de ordenha após a mamada, o pico cai dentro da mamada e só a fase descendente da curva é registrada. A ICAR também se recusa a fixar um padrão: é "impossible to define a standard lactation length or a standard milking length", e cada organização define, por raça e categoria de ovelha, uma produção de referência por lactação ou por período de ordenha exclusiva e declara o comprimento adotado; quando a ordenha começa no parto, o comprimento deve ficar "close to the average lactation length of the considered breed" ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

As regras por ovelha seguem a mesma lógica. O primeiro controle deve ocorrer até **35 dias depois da separação completa dos cordeiros, com tolerância de 17 dias**, de modo que o intervalo do parto ao primeiro controle fica abaixo da duração média da mamada da raça mais 52 dias: com mamada de 0, 25 ou 45 dias, o limite é de 52, 77 ou 97 dias. Dois controles não nulos da mesma ovelha não podem distar mais de **70 dias** (2 × 35); acima disso, o cálculo da lactação para no controle anterior. O número mínimo de controles válidos por ovelha "is not set" e deve ser descrito por raça e categoria. A única medida obrigatória é a quantidade de leite; gordura e proteína são opcionais. A densidade de conversão de peso para volume é de **1,036 g/mL**, e o erro-padrão aceito na medida é de 40 g. A menor quantidade testada aparece como **200 g** no texto sobre frequência e como **150 g** no Anexo 1 da mesma página, e as notas não descobriram qual vale. A lactação é calculada pelo método de Fleischmann, "or another method, if proved to be of equivalent accuracy", e as datas de desmame e de secagem podem ser reais ou calculadas a partir de uma mamada-padrão. O Anexo 3, sobre ordenha após mamada, veio vazio na extração ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

Os métodos de controle são os da cabra, com um peso muito maior das formas simplificadas. O **A4** mede as duas ordenhas a cada 30 dias (28 a 34), e A5 e A6 alongam o intervalo para 36 e 42 dias. O **AT** mede uma ordenha por controle, alternando manhã e tarde a cada mês. O **AC** mede uma ordenha e corrige a diferença entre manhã e tarde pelo volume do tanque do rebanho nas duas ordenhas. A ICAR lista dois vícios do AC: rebanhos em que só parte das ovelhas é controlada mas o tanque é o do rebanho inteiro, e rebanhos em que parte das ovelhas é ordenhada uma vez e parte duas vezes por dia; o procedimento proposto em Cork (2012) faz um controle por rebanho-ano com as duas ordenhas para checar o coeficiente do AC. O **método E** é flexível e permite retirar os cordeiros 12 horas antes do controle. O **método D**, não oficial, faz 2 a 4 controles por rebanho e ano para obter 2 ou 3 controles por ovelha no meio da lactação; serve para ranquear ovelhas dentro do rebanho, e "lactation calculation is not recommended" ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

A adoção desses métodos explica muito da genética ovina. Em 2021, cerca de **890 mil ovelhas** estavam em controle oficial nos países da ICAR: 334.685 na França (mais 553.836 no método D, não oficial), 256.480 na Espanha, 161.711 na Itália, 18.052 em Portugal e números menores na Croácia, na Eslováquia, na Eslovênia e na República Tcheca. A França usa AC e D; a Itália, AT e AC; a Espanha, AT e AC na Latxa; Portugal, sobretudo A4. "Simplified designs concern 98% of the recorded dairy sheep", e a composição é amostrada só no meio da lactação, a parte "most heritable and the most highly correlated with the whole lactation". O exemplo dos autores mostra o motivo: 100 ovelhas no A4 geram 1.200 amostras por ano (6 controles × 2 ordenhas), e o desenho simplificado com AC, três controles e amostragem só das primíparas (35% das ovelhas) gera 105, **91% menos**. O custo aparece na genética: a herdabilidade do teor de gordura caiu "from 0.50 to 0.35 in the case of France", atribuída ao menor número de medidas por animal (2 a 6 na vida). O leite de ovelha tem 70 a 75 g/L de gordura, com pico de 130 a 140 g/L no fim da lactação, e 50 a 55 g/L de proteína, com pico de 100 a 110 g/L; cada ordenha rende de 500 a 4.000 mL. Por isso a ICAR aceita viés de medida de produção 1,5 vez o do bovino e, para a gordura, viés 2 vezes e desvio-padrão 3 vezes os do bovino. Os medidores certificados são o MM25SG (DeLaval), o Lactocorder (WMB) e as jarras ARGI (ELCABE), mas a maioria dos rebanhos usa jarras aprovadas antes de 1995 ([Astruc et al. 2023, ICAR Technical Series 27](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2023_Astruc_et_al.pdf)).

Cada programa escolheu a sua lactação de referência, e os números só se comparam com a regra escrita ao lado.

| População | Lactação de referência | Valor publicado | Fonte |
|---|---|---|---|
| Lacaune, França | produção da ordenha exclusiva (TMM) por Fleischmann | 288 L em 165 dias (2010); 272 L em 164 dias (2009); 330 L em 173 dias (373 rebanhos selecionadores, referência de 2019) | [Larroque 2011, p. 10](https://docs.eaap.org/2011/S49_Larroque.pdf); [Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) (cabeçalho da tabela embaralhado na extração); [UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf) |
| Manech tête rousse / tête noire / Basco-Béarnaise / Corse | TMM | 194 L em 155 d / 142 L em 140 d / 167 L em 143 d / 144 L em 186 d (2010) | [Larroque 2011, p. 10](https://docs.eaap.org/2011/S49_Larroque.pdf) |
| Lacaune, Grécia e França (2019–2022) | produção da ordenha exclusiva, mínimo de 3 controles válidos acima de 0,2 kg | 168,7 dias de ordenha na Grécia e 168,8 na França | [Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194) |
| Assaf, Espanha | leite padronizado a 180 dias (MY180) em estudo; 150 dias (L150, G150, P150) nas avaliações genômicas da associação | 356 L em 150 dias **[trecho de busca; data não identificada]** | [Gutiérrez et al. 2007](https://doi.org/10.1016/j.smallrumres.2006.03.009) (título); [Oviespaña](https://www.oviespana.com/Articulos/293540-Entrega-valoraciones-geneticas-socios-Assaf-Espana-incorporan-caracteres-seleccion-ubres.html) **[trecho de busca]** |
| Latxa, Espanha | "leite padronizado", comprimento não confirmado | — | [Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) **[não verificado]** |
| Sarda, Itália | ajuste por comprimento da ordenha e por idade × ordem × mês de parto | — | [Carta, Sanna e Rosati 1996](https://doi.org/10.1163/9789004684249_052) (só título) |
| Rebanho comercial, Nova Zelândia | 130 dias de ordenha (dias 35 a 164), mamada exclusiva de cerca de 35 dias | 86,1 kg de leite | [Marshall et al. 2023](https://doi.org/10.3390/ani13030349) |
| White Maritza, Bulgária | sem lactação: modelo de dia de controle (AC), mamada de 30 a 150 dias | 764 mL por controle | [Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023) |

### Exemplo 1: TMM por Fleischmann com seis, três e dois controles

O exemplo usa uma ovelha Lacaune fictícia cuja produção diária verdadeira segue a curva de Wood com a = 1,20, b = 0,25 e c = 0,0095. O pico ocorre no **dia 26,3, com 2,12 L/dia**, os cordeiros mamam até o dia 30 e a secagem é no dia 200. A ovelha produz 58,4 L durante a mamada, que ninguém mede, e **230,0 L de TMM verdadeira** do dia 31 ao 200; a TMY que ela teria se fosse ordenhada desde o parto seria de 288,4 L, e a TMM é 79,8% dela. Os controles mensais caem nos dias 40, 70, 100, 130, 160 e 190 (o primeiro bem dentro do limite da ICAR, que aqui é o dia 82), com erro de medida de −4% a +4%, e estimam 2,15; 1,73; 1,50; 1,13; 0,96 e 0,72 L/dia **[conferido numericamente]**. O cálculo é o de Fleischmann, com o primeiro intervalo contado do desmame:

```
TMM = I₀·M₁ + Σ_{i=1..n−1} I_i·(M_i + M_{i+1})/2 + I_n·M_n
  I₀  dias do desmame (separação definitiva dos cordeiros) ao 1º controle
  I_i dias entre controles consecutivos;  I_n dias do último controle à secagem
  M_i leite do dia do controle (L/d)
  Regras ICAR: 1º controle até (mamada média + 52) dias do parto; controles não nulos a mais de 70 dias
  ⇒ o cálculo para no controle anterior
TMY: a mesma soma com I₀ contado do parto. TSMM = leite mamado + TMM (o leite mamado não é medido)
AT:  M = 2 × ordenha medida (manhã num mês, tarde no seguinte)
AC:  M = ordenha medida × (tanque das duas ordenhas / tanque da ordenha medida)   [forma usual; o Anexo 1
     da ICAR não foi transcrito nas notas]
Produção média diária da ordenha = TMM / dias de ordenha exclusiva;   kg = L × 1,036
```

| Controles usados | TMM por Fleischmann | Erro | O cálculo vai até | TMM por declínio exponencial | Erro |
|---|---|---|---|---|---|
| 6 mensais (dias 40 a 190) | 231,3 L | +0,6% | secagem (dia 200) | 230,1 L | 0,0% |
| 3 (dias 40, 100 e 160) | 243,2 L | +5,7% | secagem | 235,6 L | +2,4% |
| 2 no meio da lactação (dias 70 e 100, como no método D) | 267,6 L | +16,3% | secagem | 243,4 L | +5,8% |
| 4, com o controle parado no dia 130 | 246,7 L | +7,2% | secagem | 231,0 L | +0,4% |
| 4, sem os controles dos dias 100 e 130 (hiato de 90 dias) | 79,7 L | −65,4% | dia 70 (regra dos 70 dias) | 227,7 L | −1,0% |

A tabela tem quatro lições **[conferido numericamente]**. Com controles mensais até perto da secagem, o Fleischmann erra menos de 1% e basta. Com poucos controles, ele superestima, sobretudo porque o último valor medido é carregado, constante, até a secagem, enquanto a produção verdadeira continua caindo, e porque depois do dia 79 (ponto de inflexão da curva, (b + √b)/c) a curva é convexa e o trapézio fica acima dela; dois controles no meio da lactação superestimam em 16%, o que justifica o aviso da ICAR de que o método D não deve calcular lactação. Quando o controle para no meio e a secagem acontece meses depois, o último valor é carregado até a secagem e a lactação sai 7% acima. E um hiato acima de 70 dias corta a lactação pela regra da ICAR, o que dá 79,7 L para uma ovelha que produziu 230 L; o app deve marcar essa lactação como incompleta, e não publicá-la. A última coluna ajusta ln M = ln a − k·t aos mesmos controles, por mínimos quadrados, e soma a curva do desmame à secagem. Essa alternativa erra no máximo 6%, mas é **[proposta deste relatório]**: funciona aqui porque a curva verdadeira é lisa e a fase descendente da Wood é quase exponencial. Na Latxa, entre seis modelos empíricos comparados em 14.699 controles de 2.711 ovelhas, o de "variable decay" teve o menor erro ([Ruiz et al. 2000](https://doi.org/10.3168/jds.s0022-0302(00)75165-4)) **[trecho de busca]**. A produção média diária do período de ordenha é de 231,3/170 = **1,36 L/dia**, ou 239,7 kg. O controle simplificado também pesa: se a ovelha deu 1,05 L na ordenha da manhã e o tanque do rebanho teve 132 L de manhã e 88 L à tarde, o AT estima 2,10 L/dia e o AC, **1,75 L/dia**; no mês seguinte o AT mede a tarde e o erro se compensa em parte, mas só o AC corrige o dia **[conferido numericamente]**.

### Curvas e fatores de ajuste: mamada, número de cordeiros e ordenha diária

As curvas de ovelhas são ajustadas com modelos empíricos e mecanísticos. Em ovelhas F1 de East Friesian no México, Guevara et al. compararam Wood, Wilmink (com k fixado em 0,033), Dijkstra e uma versão reduzida de Pollott, ajustados por mínimos quadrados não lineares, com falhas de convergência em parte das lactações. O intervalo entre controles não afetou a produção total (TMY pelo método de Fleischmann, na forma de Sargent, que multiplica o último controle por 7 dias), mas afetou o pico e o dia do pico, mais bem estimados com controles semanais ou quinzenais. As fórmulas de AIC e BIC impressas no artigo (n × LL + 2p, com LL = log do erro quadrático médio) não são as convencionais e não devem ser copiadas sem conferência ([Guevara et al. 2025](https://doi.org/10.1007/s11250-025-04365-z)). Na Nova Zelândia, com 169 ovelhas e 622 controles, polinômios de Legendre de ordem 4 (leite e lactose) e 5 (gordura e proteína) descreveram a curva entre os dias 35 e 164, e a **persistência** foi definida como a produção dos dias 101 a 164 dividida pela dos dias 35 a 100, entre 52,3% e 72,7%. A idade e os dias de ordenha duas vezes ao dia afetaram todas as produções; o número de cordeiros afetou a persistência da proteína; a ordenha duas vezes ao dia afetou fortemente a persistência da gordura (F = 10,96) ([Marshall et al. 2023](https://doi.org/10.3390/ani13030349)). Na Bulgária, a mamada durou de 30 a 150 dias, com média de 62,5 a 67,5 dias nas raças nativas, e entrou no modelo como covariável quadrática ([Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023)). O conjunto aponta os efeitos que um app de ovinos precisa registrar e que pesam muito mais na ovelha do que na vaca: **duração da mamada, intervalo do parto ao primeiro controle, número de cordeiros e ordenha uma ou duas vezes ao dia**. "Persistência" e "pico" têm definições diferentes em cada fonte e não são intercambiáveis.

O único ensaio brasileiro com texto lido mostra por que a regra escrita importa. Ticiani et al. acompanharam 46 Lacaune e 21 East Friesian multíparas, já desmamadas, com 44 ± 7,2 dias em lactação no início, em pasto de *Panicum maximum* cv. Aruana com 1 kg de concentrado, em Guatambu (SC), de agosto a novembro de 2010, pesando o leite a cada 4 dias por 92 dias. As Lacaune produziram **1,67 contra 1,35 kg/dia** (P < 0,001), 153,64 contra 124,20 kg no período, gordura de 6,86% contra 7,31% e proteína de 4,93% contra 5,18%; as ovelhas foram escolhidas num rebanho maior "de acordo com o peso e a produção prévia de leite", o que é viés de seleção ([Ticiani et al. 2013](https://doi.org/10.1590/s0103-84782013000900018); [PDF](https://www.redalyc.org/pdf/331/33127850018.pdf)). As equações de declínio diferem entre o resumo e o corpo: o resumo traz PL = 2,03 − 0,08·DEL (Lacaune) e PL = 1,42 − 0,02·DEL (East Friesian, r² = 0,20), e o corpo traz 2,03 − 0,008·DEL e 1,42 − 0,002·DEL (r² = 0,02). A conta resolve o conflito. Com a inclinação do corpo, a média prevista nos 92 dias é de **1,658 e 1,327 kg/dia** e o total, de 152,5 e 122,1 kg, praticamente os valores relatados; com a do resumo, a produção das Lacaune chegaria a zero no **dia 25,4** **[conferido numericamente]**. A conta indica erro de digitação no resumo, e a variável "DEL" das equações se comporta como dia do experimento (1 a 92), e não como dia em lactação **[inferência a partir da conta]**. Mesmo assim, o declínio de 8 g/dia contra 2 g/dia vale só para esse período, essas ovelhas e esse pasto. Um capítulo de livro com 367 Lacaune de um rebanho do Sul do Brasil mostrou que pôr o índice de temperatura e umidade (ITU) como covariável melhorou o ajuste da curva e elevou a herdabilidade do parâmetro de queda pós-pico ([Atena Editora 2020](https://atenaeditora.com.br/catalogo/post/inclusao-do-indice-de-temperatura-e-umidade-itu-na-avaliacao-genetica-de-ovinos-leiteiros)) **[resumo]**.

### Células somáticas: escalas que não se comparam e um limiar que não existe

A escala de células somáticas tem pelo menos duas versões em ovinos. Em ovelhas Manchega, o escore é SCS = log₂(CCS/10⁵) + 3, em que cada unidade a mais dobra a contagem, e cinco classes separam as ovelhas em menos de 55 mil, 55 a 110 mil, 110 a 235 mil, 235 a 795 mil e mais de 795 mil células/mL ([Heddi et al. 2026](https://doi.org/10.3390/foods15091527)); é a mesma escala de Riggio et al., que escrevem log₂(CCS/100) + 3 com a contagem em milhares ([Riggio et al. 2010](https://doi.org/10.1186/1297-9686-42-30)). Na Nova Zelândia, o escore foi log₂(CCS), sem o ajuste ([Marshall et al. 2023](https://doi.org/10.3390/ani13030349)). As duas escalas diferem por uma constante de **13,61** (log₂ 10⁵ − 3): 250 mil células/mL dão 4,32 numa e 17,93 na outra. Os limites das classes de Heddi, recalculados, dão 2,14; 3,14; 4,23 e 5,99, e a fonte imprime 3,15 e 4,24 nos dois do meio, diferença de arredondamento **[conferido numericamente]**. Em Valle del Belice, a média geométrica foi de **253 mil células/mL em glândulas sadias e 1.082 mil em infectadas** (SCS 4,34 e 6,44), com infecção definida por mais de 5 UFC em 10 µL de uma espécie bacteriana ([Riggio et al. 2010](https://doi.org/10.1186/1297-9686-42-30)). Nenhuma fonte lida fixa um **limiar individual validado de mastite subclínica** em ovelhas; o valor de 1 milhão de células/mL que circula na literatura de ovinocultura não foi encontrado em fonte primária **[não verificado]**. O mais próximo é o estudo de longevidade de Valle del Belice, que agrupou as ovelhas pela maior contagem de um dia de controle (até 500 mil, 500 mil a 1 milhão e 1 milhão ou mais) e achou risco de descarte 20% maior na classe mais alta ([Riggio et al. 2009](https://doi.org/10.3168/jds.2008-1316)) **[resumo]**. Para o manejo, a média geométrica é a medida certa: uma ovelha com controles de 180, 240, 410 e 1.350 mil células/mL tem SCS médio de 4,98, que corresponde a uma **média geométrica de 393 mil**, contra 545 mil da média aritmética, puxada pela contagem alta **[conferido numericamente]**.

A regulação brasileira não tem regra própria para o leite de ovelha. O RIISPOA diz que a inspeção de leite "é aplicável ao leite de vaca e, no que couber, às demais espécies produtoras de leite, respeitadas suas particularidades" (art. 234), que "leite, sem outra especificação" é o de vaca, e que "o leite de outros animais deve denominar-se segundo a espécie de que proceda" (art. 235) ([Decreto nº 9.013/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9013.htm)). A **IN 76/2018** aprova os regulamentos de leite cru refrigerado sem qualificar a espécie e fixa, como médias geométricas trimestrais por tanque, **contagem padrão em placas de até 300 mil UFC/mL e CCS de até 500 mil células/mL**, com pelo menos uma amostra por mês; os mínimos de composição do art. 5º (gordura 3,0 g/100 g, proteína 2,9, lactose 4,3, sólidos não gordurosos 8,4, sólidos totais 11,4, densidade de 1,028 a 1,034 e crioscopia de −0,530 a −0,555 °H) foram definidos para leite de vaca ([IN 76/2018](https://wikisda.agricultura.gov.br/dipoa_baselegal/in_76-2018_rtiq_leite.pdf)). O leite de ovelha atende com folga aos mínimos de gordura e proteína, mas densidade, crioscopia e lactose foram calibradas para outra espécie **[inferência]**. A aplicação da IN 76 ao leite de ovelha é a leitura provável do "no que couber", a confirmar com o serviço de inspeção **[inferência]**. Uma proposta do MAPA de 2016 para leite de cabra e de ovelha **[trecho de busca]** e o status da IN 62/2011 **[não verificado]** ficaram sem confirmação. Para tanques que oscilam perto do limite, a média geométrica faz diferença: três meses de 520, 600 e 380 mil células/mL têm média aritmética de 500 mil e geométrica de **491 mil**, dentro da regra **[conferido numericamente]**. No plano internacional, o Regulamento (CE) 853/2004 traria, para leite cru de outras espécies, contagem em placas de até 1,5 milhão de UFC/mL (500 mil para produtos de leite cru) e nenhum limite de CCS, mas o texto oficial não foi aberto e esses valores vêm de fontes secundárias **[não verificado]**. Há um conflito: um estudo de 83 rebanhos de ovinos e caprinos do noroeste da Grécia cita um limite da UE de 1.500 × 10³ **células**/mL, ultrapassado por 26,2% dos tanques, cuja média foi de 1.123 mil células/mL; só 10% dos rebanhos ficaram na categoria "saudável", de até 200 mil ([Animals 2026](https://doi.org/10.3390/ani16132030)). As duas leituras do regulamento não podem estar ambas certas, e nenhuma foi conferida no texto legal.

## O modelo francês soma repetibilidade, pais desconhecidos e variância heterogênea

### Equação, pressupostos e solução

A avaliação nacional francesa de leite das raças ovinas é descrita nos slides do Idele e do INRA como "BLUP single trait", "repeatability animal model" e "unknown parents genetic groups", "assuming (not LSCS): heterogeneous residual variances; known constant variance ratios". As variâncias residuais seguem um "log-linear model ... fixed effect of year*parity*area; random effect of herd*year*parity (without autocorrelation)" ([Larroque 2011, pp. 19–20](https://docs.eaap.org/2011/S49_Larroque.pdf)). O artigo de síntese da genômica francesa detalha a cronologia: desde 2002 o BLUP dos caracteres leiteiros (leite, quantidades de matéria e teores) leva em conta a heterogeneidade de variância com um modelo próximo ao dos bovinos leiteiros franceses, em que "les variances (génétiques, résiduelles et d'environnement permanent) varient en fonction du troupeau, de l'année et de la parité"; os grupos de pais desconhecidos entraram no fim de 2013, com 22 grupos definidos pelo ano de nascimento, e essa foi a mudança de maior efeito sobre o progresso genético estimado; e o ssGBLUP recebeu o mesmo tratamento da variância no fim de 2014, no programa blupf90iod2 ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). Nenhuma fonte lida escreve a equação em notação matricial. A forma abaixo é a tradução deste relatório das descrições, com os efeitos fixos lidos na tabela de Larroque (2011, p. 21) e a forma genômica escrita por Oget et al. (2019) para a Lacaune **[forma reconstruída; efeitos conforme as fontes]**:

```
y = X b + Z_a a + Z_p p + e        uma linha por lactação; uma característica por vez (leite da ordenha
                                    exclusiva, quantidades de gordura e de proteína, teores, ou LSCS)
b (fixos)                                                                       características
  rebanho × ano × ordem de parto (grupo de contemporâneas) ..................... todas
  idade ao parto e época de parto, dentro de ano × ordem ........................ todas
  intervalo do parto ao 1º controle, dentro de ano × ordem ..................... leite e LSCS
  número e momentos das amostragens no AC ...................................... gordura, proteína, teores
  duração do período seco ...................................................... todas
  ordem de parto (Corse e Pirineus ocidentais) ................................. leite
a   valor genético aditivo; pais desconhecidos em 22 grupos por ano de nascimento
p   ambiente permanente da ovelha (comum às suas lactações)
var(a) = A σ²a (com os grupos)    var(p) = I σ²p    var(e) = R = diag(σ²e,k), k = rebanho × ano × ordem
log σ²e,k = w_k'β + v_k'u     β: ano × ordem × área (fixo);  u ~ N(0, I σ²u): rebanho × ano × ordem
razões conhecidas e constantes:  σ²a,k = λa·σ²e,k  e  σ²p,k = λp·σ²e,k  em todo estrato k
  ⇒ y_k = X_k b + (σ_k/σ₀)·(Z_a a + Z_p p)_k + e_k   ⇔   y*_k = (σ₀/σ_k)·y_k, analisado com as variâncias de base
h² = σ²a/(σ²a + σ²p + σ²e)          repetibilidade r = (σ²a + σ²p)/(σ²a + σ²p + σ²e)

MME (os grupos de pais desconhecidos entram pela transformação de Quaas e Pollak, não repetida aqui):
[ X'R⁻¹X     X'R⁻¹Z_a                X'R⁻¹Z_p           ] [b̂]   [ X'R⁻¹y   ]
[ Z_a'R⁻¹X   Z_a'R⁻¹Z_a + A⁻¹/σ²a     Z_a'R⁻¹Z_p         ] [â] = [ Z_a'R⁻¹y ]
[ Z_p'R⁻¹X   Z_p'R⁻¹Z_a              Z_p'R⁻¹Z_p + I/σ²p  ] [p̂]   [ Z_p'R⁻¹y ]

Genômico (Oget et al. 2019):  y = Xβ + Zg + Wp + ε,  g ~ N(0, H σ²g),  p ~ N(0, I σ²p),  ε ~ N(0, I σ²ε)
  A⁻¹ dá lugar a H⁻¹ (relatório de corte); as três notas de úbere, com um registro por ovelha, ficam sem p
```

Os pressupostos são os do modelo animal, mais quatro próprios deste desenho. O modelo de repetibilidade supõe **correlação genética igual a 1 entre lactações**; as fontes ovinas lidas não estimam essa correlação para o leite, e a única correlação entre lactações encontrada é a das notas de úbere da Latxa, de 0,85 a 0,95 ([Legarra e Ugarte 2005](https://doi.org/10.3168/jds.s0022-0302(05)72899-x)) **[resumo]**. As **razões de variância constantes** significam que a herdabilidade é a mesma em todos os rebanhos, o que difere do ajuste americano descrito no relatório de leite, em que a herdabilidade do grupo varia com o desvio-padrão. O modelo log-linear encolhe a variância de cada rebanho-ano-ordem para a de ano × ordem × área, porque o efeito de rebanho-ano-ordem é aleatório. E a LSCS fica fora da heterogeneidade ("not LSCS"), embora a tabela de efeitos inclua rebanho × ano × ordem para ela; as notas não conseguiram saber o que se supõe para as células. A solução segue o relatório de corte: as variâncias e as razões são estimadas antes e tratadas como conhecidas, as MME são resolvidas por iteração no blupf90iod2, o pré-processamento genômico usa o pregsf90 e a confiabilidade é aproximada pelo accf90 ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)); o algoritmo que estima os parâmetros β e u do modelo de variâncias não foi descrito nas fontes lidas **[não verificado]**. A escala é grande: a avaliação da Lacaune usava 4.278.634 registros de leite e 1.392.483 animais no pedigree, com base móvel ("rolling base") ([Larroque 2011, pp. 23–25](https://docs.eaap.org/2011/S49_Larroque.pdf)).

A variância heterogênea pesa mais na ovelha do que parece, porque os rebanhos vão do confinamento ao pasto extensivo e a maior parte da diferença entre eles não é genética. Na Manech tête rousse, o nível genético de leite subiu cerca de 140 L em 35 a 40 anos e o efeito de rebanho cerca de 80 L, e só **10% a 15% das diferenças de leite entre rebanhos são genéticas** ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)). Num rebanho intensivo, a mesma diferença genética aparece em litros maiores do que num rebanho a pasto, e sem o ajuste os carneiros com filhas nos rebanhos de alta variância sobem ou descem demais.

### Exemplo 2: a variância do rebanho muda a ordem dos carneiros

O exemplo usa um modelo de touro, mais simples que o modelo animal, com a forma multiplicativa acima: y = rebanho + (σ_k/σ₀)·s + e, que equivale a multiplicar cada desvio por σ₀/σ_k e analisar com as variâncias de base. A base é a da Lacaune, com h² = 0,30 e σ₀ = 64,5 L (valor derivado adiante, na tabela de herdabilidades), o que dá λ = (4 − h²)/h² = 12,33 nas equações de touro, e o EBV do carneiro é o dobro da solução **[conferido numericamente; dados fictícios]**. O carneiro X é de IA e tem quatro filhas em cada rebanho; Y é o carneiro local do rebanho A (intensivo, desvio-padrão fenotípico de 95 L) e Z, o do rebanho B (pasto, 40 L).

| Rebanho (σ_P) | Filhas de X (desvios de TMM, L) | Filhas do carneiro local (L) | Fator σ₀/σ_k | Peso relativo de cada registro (1/σ²e) |
|---|---|---|---|---|
| A, intensivo (95 L) | +30, −40, +50, −40 (média 0) | Y: +90, +20, +110, +20 (média +60) | 0,679 | 0,46 |
| B, pasto (40 L) | −10, +15, −5, 0 (média 0) | Z: +40, +25, +50, +25 (média +35) | 1,613 | 2,60 |

| Análise | EBV de X | EBV de Y | EBV de Z | Ordem |
|---|---|---|---|---|
| Sem ajuste (variância homogênea) | −20,7 L | **+13,9 L** | +6,9 L | Y > Z > X |
| Com ajuste (y* = y × 64,5/σ_k) | −21,2 L | +8,4 L | **+12,8 L** | Z > Y > X |

Sem ajuste, Y parece melhor que Z porque as filhas de Y superam as de X em 60 L num rebanho em que tudo varia muito. Com o ajuste, os 60 L de A valem 40,7 L na escala de base e os 35 L de B valem 56,4 L, e Z passa à frente. Os pesos da última coluna da primeira tabela mostram o mesmo efeito por outro lado: um registro do rebanho a pasto pesa 5,6 vezes um do rebanho intensivo nas MME. O exemplo é favorável ao ajuste porque o modelo verdadeiro é multiplicativo; num rebanho real, a variância de cada rebanho-ano-ordem é estimada com erro e precisa ser encolhida, que é o papel do efeito aleatório no modelo log-linear.

### Grécia e França: o modelo de lactação mais simples que um rebanho pequeno pode copiar

O estudo de interação genótipo × ambiente da Lacaune escreveu o modelo de cada país em forma escalar: **y_ijklm = μ + F_i + Y_j + P_k + b₁·M + b₂·A + b₃·D + L_l + A_m + e_ijklm**, com rebanho (4 níveis na Grécia e 186 na França), ano (2 e 4), ordem de parto (2 e 7), regressões no comprimento da ordenha M em dias, na idade ao parto A em meses e nos dias do parto ao primeiro controle D, número de cordeiros L (2 níveis) e valor genético aditivo; a França acrescenta o ambiente permanente, e os teores recebem um efeito fixo para a combinação de controles usada na média ponderada (11 níveis). As variâncias foram estimadas por REML no ASReml 4.2, com pedigree de 26.547 animais, sobre 1.658 ovelhas em 4 fazendas intensivas gregas e 7.166 registros de 4.859 ovelhas em 186 fazendas semiextensivas francesas ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194); [Vouraki et al. 2024, slides](https://docs.eaap.org/2024/m221/S02T11.pdf)). É o modelo de lactação mais fácil de levar a um rebanho pequeno: poucas classes, covariáveis no lugar de classes vazias, e as três variáveis de manejo ovino (comprimento da ordenha, intervalo do parto ao primeiro controle e número de cordeiros) explícitas. A regressão no comprimento da ordenha padroniza, na prática, a TMM para um comprimento comum, sem fixá-lo por fórmula.

### Dia de controle: na Bulgária, a repetibilidade bastou

O único estudo ovino lido em texto integral que comparou modelos de dia de controle usou 8.768 controles de 987 ovelhas White Maritza em 18 rebanhos, de 1992 a 2015, pelo método AC, com pelo menos três controles por ovelha ([Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023)). Os modelos, transcritos do artigo e escritos aqui em forma matricial **[notação deste relatório]**, foram:

```
REP1 (repetibilidade):  y = YS + DIM3 + PAR + LS + b₁·idade² + b₂·mamada² + fytd + a + pe + e
  forma matricial:      y = X b + Z_f f + Z_a a + Z_p p + e
  b: ano × estação de parto (67 classes); estágio da lactação em classes de 3 dias a partir do dia 30;
     ordem de parto (7); tamanho da ninhada (2); idade ao parto e duração da mamada (quadráticas)
  f: rebanho × ano × dia de controle, ALEATÓRIO          var(f) = I σ²f
  var(a) = A σ²a ;  var(p) = I σ²p ;  var(e) = I σ²e (resíduo homogêneo)
REP3 (Ali e Schaeffer fixo):  troca DIM3 por b₃(d/314) + b₄(d/314)² + b₅ ln(314/d) + b₆ ln²(314/d)
RRM e ASRM (regressão aleatória, Legendre de ordem 1 a 3):
  ... + Σ_{o=0..3} a_o·φ_o(d) + Σ_{o=0..3} pe_o·φ_o(d) ;  var(a) = K_a ⊗ A ;  var(pe) = K_p ⊗ I
  σ²a(d) = φ(d)'K_a φ(d) ;  σ²pe(d) = φ(d)'K_p φ(d) ;  h²(d) = σ²a(d) / [σ²a(d) + σ²pe(d) + σ²e]
Estimação das variâncias: REML no VCE 5.1.2
```

As variâncias do REP1, expressas como proporção da variância fenotípica, foram de 0,355 para o efeito genético, 0,029 para o ambiente permanente, 0,289 para o rebanho-ano-dia de controle e 0,327 para o resíduo; elas somam 1,000 e dão **h² = 0,355 e repetibilidade de 0,384** **[conferido numericamente]**. O erro-padrão da repetibilidade é de 0,045 na tabela e de 0,065 no resumo, e a repetibilidade do REP3 é 0,379 na tabela e 0,378 no resumo. Pelo AIC e pelo BIC, o REP1 foi melhor que os modelos de regressão aleatória. O modelo de Ali e Schaeffer com regressão aleatória (ASRM3) deu h² de **0,528 no início e 0,190 no fim da lactação**, e os autores atribuem parte dessa queda a um fator de manejo: o primeiro controle, às vezes o segundo, ocorre no confinamento, e os demais no pasto, o que confunde dieta com genética. O rebanho-ano-dia de controle entrou como aleatório porque cada criador ficou em média 4,99 anos no controle ([Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023)). Duas lições valem para o app. Com algumas centenas de ovelhas e poucos controles por lactação, a regressão aleatória não paga os parâmetros que exige, e o modelo de repetibilidade, de dia de controle ou de lactação, basta. E o grupo de dia de controle aleatório, e não fixo, é a escolha coerente com rebanhos pequenos, a mesma que Schaeffer recomenda hoje para vacas (relatórios de leite e de caprinos). Nenhuma avaliação oficial de ovinos com regressão aleatória foi encontrada nas fontes lidas.

### Herdabilidades de 0,10 a 0,37 para o leite e repetibilidades de 0,41 a 0,50

A tabela reúne as estimativas com fonte. As diferenças entre linhas vêm de dados, definição da lactação e modelo, e não de mudança genética.

| População (fonte) | Leite | Gordura e proteína | Células (SCS) |
|---|---|---|---|
| Lacaune, França, avaliação nacional ([Larroque 2011, p. 14](https://docs.eaap.org/2011/S49_Larroque.pdf)) **[leitura de imagem]** | 0,30 (r 0,50) | quantidades 0,30 (r 0,50); teor de gordura 0,35 (r 0,60); teor de proteína 0,45 (r 0,70) | LSCS 0,13 (r 0,31) |
| Lacaune, França, ordenha de 2019–2022 ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194)) | 0,24 ± 0,05 (r 0,41) | teor de gordura 0,34; teor de proteína 0,52 (r 0,40 e 0,52) | — |
| Lacaune, Grécia, 2021–2022 (mesma fonte) | 0,19 ± 0,09 | teor de gordura 0,30; teor de proteína 0,19 (não significativo) | — |
| Lacaune, França, com chip 54K ([Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4)) | 0,37 | quantidades 0,37 e 0,39; teor de gordura 0,50; teor de proteína 0,61 a 0,62 | 0,17 a 0,18 |
| Lacaune, França, 416.670 lactações ([David et al. 2008](https://doi.org/10.3168/jds.2008-1113)) **[resumo]** | leite padronizado 0,27 | — | — |
| Lacaune, França, 1ª lactação ([Barillet et al. 2001](https://doi.org/10.1186/1297-9686-33-4-397); [Rupp et al. 2003](https://doi.org/10.3168/jds.s0022-0302(03)73732-1)) **[resumo]** | — | — | 0,15 e cerca de 0,13 na lactação; 0,04 a 0,13 por dia de controle |
| Lacaune, Suíça, 15 rebanhos ([Werne et al. 2023](https://doi.org/10.1016/j.animal.2023.100772)) **[resumo]** | 0,34 | — | — |
| White Maritza, Bulgária, dia de controle ([Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023)) | 0,355 (r 0,384); de 0,53 a 0,19 ao longo da lactação | — | — |
| Churra, Espanha, 1.111 ovelhas ([Othmane et al. 2002](https://doi.org/10.1186/1297-9686-34-5-581)) **[resumo]** | 0,26 | gordura 0,10; proteína 0,31; caseína 0,30 | 0,11 |
| Assaf, Espanha, leite a 180 dias ([Gutiérrez et al. 2007](https://doi.org/10.1016/j.smallrumres.2006.03.009)) **[trecho de busca]** | 0,13 a 0,18; ambiente permanente do dia de controle 0,27 a 0,28 | — | — |
| Improved Awassi, Israel, rebanho de pesquisa ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0301622601002391)) **[trecho de busca]** | 0,10 (r 0,46) | — | — |
| Valle del Belice, Itália, glândulas sadias ([Riggio et al. 2010](https://doi.org/10.1186/1297-9686-42-30)) | — | — | 0,10 |

Na Lacaune, as correlações genéticas lidas na figura nacional são de 0,8 a 0,9 entre leite e quantidades de gordura e proteína, de cerca de −0,2 entre leite e teor de gordura, de cerca de −0,4 entre leite e teor de proteína, de 0,7 entre os dois teores, de 0,15 entre LSCS e leite e de −0,32 entre LSCS e profundidade do úbere ([Larroque 2011, p. 16](https://docs.eaap.org/2011/S49_Larroque.pdf)) **[leitura de imagem]**. A herdabilidade do teor de gordura aparece como 0,35 (2011) e 0,50 (2019), o que é coerente com a observação de que a amostragem parcial a reduziu de 0,50 para 0,35 na França ([Astruc et al. 2023](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2023_Astruc_et_al.pdf)). A estimativa da Sarda (cerca de 0,30 para leite, 0,48 para gordura e 0,55 para proteína) circula sem fonte identificada **[não verificado]**. Duas contas fixam a escala usada nos exemplos. A tendência de +5,3 L/ano equivale a 0,15 desvio genético por ano ([Larroque 2011](https://docs.eaap.org/2011/S49_Larroque.pdf)), e a modelagem de Barillet (2007) traduz 61 L em 1,9 desvio genético e 39 L em 1,2 ([Barillet et al. 2016](https://productions-animales.org/article/download/2514/7656)): as três razões dão **σa de 32 a 35 L de leite** na Lacaune francesa, e com h² = 0,30 o desvio-padrão fenotípico fica perto de 64,5 L **[conferido numericamente]**. Diferente do relatório de caprinos, que não encontrou repetibilidade da lactação, aqui há duas estimativas com fonte (0,41 e 0,50), usadas no Exemplo 5.

## Úbere, ordenha, células, reprodução, verminose e scrapie pedem modelos próprios

### Úbere: três a cinco notas lineares e nenhuma recomendação da ICAR

A ovelha leiteira é pontuada com menos notas que a cabra. A Lacaune francesa usa três: **ângulo dos tetos, fissura do úbere e profundidade do úbere**. Em 82.019 primíparas de 352 rebanhos, pontuadas por 12 classificadores de 2000 a 2003, o modelo animal multicaracterística estimado por REML deu herdabilidades de 0,19 (profundidade), 0,26 (fissura) e 0,33 (ângulo dos tetos), correlações genéticas favoráveis de 0,14 a 0,49 entre as notas, correlações fracas entre os valores genéticos de tipo e de leite, e correlações fracas e favoráveis (0,1 a 0,2) entre tipo e células; a tendência genética dos cinco anos anteriores era de piora, sobretudo da profundidade ([Marie-Etancelin et al. 2005](https://doi.org/10.1016/j.livprodsci.2005.04.005)) **[resumo]**. Os efeitos fixos da avaliação nacional para o úbere da Lacaune são rebanho, ano, classificador, tempo entre a ordenha e a pontuação, idade ao parto, estágio da lactação e tamanho da ninhada ([Larroque 2011, p. 22](https://docs.eaap.org/2011/S49_Larroque.pdf)), e, como cada ovelha tem um registro, o modelo genômico das notas de úbere dispensa o ambiente permanente ([Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4)):

```
y = X b + Z a + e            um registro por primípara; t notas analisadas juntas
var(a) = G₀ ⊗ A  (G₀: t × t, entre ângulo dos tetos, fissura e profundidade)      var(e) = R₀ ⊗ I
b (Lacaune): rebanho, ano, classificador, tempo entre ordenha e pontuação, idade ao parto, estágio, ninhada
Solução: MME multicaracterística, com A⁻¹ ⊗ G₀⁻¹ no bloco genético (H⁻¹ ⊗ G₀⁻¹ no ssGBLUP)
```

Na Churra, 5.265 registros de 2.015 ovelhas deram herdabilidades de 0,16 (profundidade), 0,17 (inserção), 0,24 (posição dos tetos), 0,18 (tamanho dos tetos) e 0,24 (forma do úbere), com correlação genética de 0,62 entre posição e tamanho dos tetos; as correlações com leite e proteína foram pequenas, exceto as da profundidade e da posição dos tetos, que "predizem piora da morfologia" se a seleção for só para produção ([Fernández et al. 1997](https://doi.org/10.3168/jds.s0022-0302(97)75976-9)) **[resumo]**. Na Latxa, as quatro notas (profundidade, inserção, posição e tamanho dos tetos) tiveram correlações genéticas com o leite de 0,43, 0,10, −0,25 e −0,10, e com o escore de células de 0,10, −0,27, −0,01 e 0,29; úberes de boa forma são menos propensos à mastite subclínica ([Legarra e Ugarte 2005](https://doi.org/10.3168/jds.s0022-0302(05)72899-x)) **[resumo]**. As âncoras da escala linear de 1996, de onde vêm as notas espanholas, não foram lidas ([de la Fuente et al. 1996](https://doi.org/10.1016/0301-6226(96)00003-6)) **[não verificado]**, e um resumo de 2026 informa que **não há recomendação da ICAR para registro de conformação em ovinos**, com escala e modelos ainda em desenvolvimento ([Spehar, ICAR 2026](https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Spehar.pdf)) **[trecho de busca]**. As 11 notas de Rupp et al. (2011) e os "21 traços" de conformação que aparecem em buscas são de cabras e não valem para ovelhas. A mensagem comum às três raças é que a **profundidade do úbere piora quando se seleciona só leite**, e é por isso que os índices franceses e espanhóis dão peso ao úbere.

### Ordenhabilidade: fluxo e latência com herdabilidade acima de 0,5

A única análise genética de ordenhabilidade ovina lida vem de um experimento francês com linhas divergentes para sólidos do leite: 34.616 registros de 1.204 ovelhas, com modelo animal multicaracterística em 751 primíparas. As herdabilidades anuais foram de **0,54 para o fluxo máximo e 0,55 para a latência**, 0,30 para o fluxo médio, 0,42 para o tempo até o fluxo máximo, 0,43 e 0,16 para as fases de fluxo crescente e decrescente e 0,07 para o platô de fluxo alto; as correlações genéticas com o leite foram de +0,46 (fluxo máximo) e −0,22 (latência), e a seleção indireta elevou o fluxo máximo em 17% e reduziu a latência em 10%, com 25% a mais de leite. A conclusão é que a "seleção atual baseada em sólidos do leite não é antagônica à ordenhabilidade" ([Marie-Etancelin et al. 2006](https://doi.org/10.1186/1297-9686-38-2-183)) **[resumo]**. Um resumo de busca atribuiu à raça Sarda um estudo de ordenhabilidade com acurácias de 0,29 e 0,40; o artigo correspondente trata de bovinos Simmental italianos e foi descartado. A proporção de leite na cisterna e a duração da ordenha em minutos não têm estimativas genéticas nas fontes lidas.

### Mastite: herdabilidade baixa, mas a seleção divergente funcionou

A herdabilidade do escore de células é baixa e a sua relação com o leite muda ao longo da lactação. Em primíparas Lacaune, Barillet et al. estimaram **0,15 na média da lactação** e 0,04 a 0,12 do primeiro ao quinto controle, com correlação genética com o leite de +0,15 na lactação, mas de **−0,48 (favorável) a +0,27 (antagônica)** ao longo dela; no rebanho experimental, o descarte por mastite clínica (5%) foi menor que a mastite subclínica prevista pelas células (10%), e os autores concluíram que a seleção contra mastite pode começar pela subclínica, via células ([Barillet et al. 2001](https://doi.org/10.1186/1297-9686-33-4-397)) **[resumo]**. Com 94.445 primíparas e 45.499 secundíparas, Rupp et al. acharam herdabilidade perto de 0,13 nas duas lactações, correlações genéticas entre controles acima de 0,91 na maioria dos casos (0,64 a 0,88 entre o primeiro controle e os demais), correlação com o leite de 0,18 e antagonismo crescente, de 0,05 a 0,23, ao longo da primeira lactação ([Rupp et al. 2003](https://doi.org/10.3168/jds.s0022-0302(03)73732-1)) **[resumo]**. O teste decisivo foi um experimento de seleção divergente, com linhas separadas por cerca de 3 desvios genéticos: entre 84 primíparas, os **5 casos clínicos ocorreram todos na linha de células alta**, os abscessos crônicos foram 21 contra 1, e a probabilidade prevista de infecção foi de 37% contra 16% (razão de chances de 3,1) ([Rupp et al. 2009](https://doi.org/10.3168/jds.2008-1435)) **[resumo]**. Na Churra, com herdabilidade de 0,11, os autores preferiram melhorar o manejo a selecionar ([Othmane et al. 2002](https://doi.org/10.1186/1297-9686-34-5-581)) **[resumo]**.

O estudo mais detalhado em modelo separou glândulas sadias e infectadas em 8.843 controles de 1.120 ovelhas Valle del Belice, com pedigree de 1.603 animais, e mostrou que as duas coisas são geneticamente distintas ([Riggio et al. 2010](https://doi.org/10.1186/1297-9686-42-30)):

```
SCS (repetibilidade):  y = μ + FTD + YPS + P + LS + b₁·DIM + b₂·e^(−0,05·DIM) + A + PE + PE_parto + e
  FTD rebanho × dia de controle (91 níveis); YPS ano × estação de parto (6); P ordem de parto (3);
  LS tamanho da ninhada (2); A ~ N(0, A σ²a); PE entre lactações e PE_parto dentro da ordem ~ N(0, I σ²)
Infecção (0/1), modelo de limiar:  l = X b + Z a + e,  e ~ N(0, 1);  infectada quando l > 0 (probit)
  correlação entre SCS e infecção: limiar bayesiano por Gibbs (100.000 iterações, 30.000 descartadas, 1 em 10)
```

A herdabilidade foi de **0,10 para o SCS de glândulas sadias, 0,03 para o de infectadas e 0,09 para a infecção** (esta na escala de liabilidade); a correlação genética entre os dois SCS foi de 0,62 e a do SCS de glândulas sadias com a infecção, de 0,51; supor diagnóstico perfeito (sensibilidade e especificidade iguais a 1) subestimou a diferença entre os dois SCS ([Riggio et al. 2010](https://doi.org/10.1186/1297-9686-42-30)). Para o índice, isso tem duas consequências. O escore de células é um bom indicador, mas não é a resistência à mastite. E como a correlação com o leite muda de sinal dentro da lactação, a média de lactação esconde o antagonismo do fim; a França trata as células como LSCS, média de lactação com amostragem parcial (partes 1 e 2, média de três controles), e não tem dado de células na raça Corse ([Larroque 2011, p. 9](https://docs.eaap.org/2011/S49_Larroque.pdf)).

### Reprodução: fertilidade com herdabilidade de 0,04 e peso econômico alto

Na Lacaune, com 416.670 lactações de 189.101 ovelhas e 3.603 pais, num modelo linear multicaracterística de touro, a herdabilidade foi de 0,27 para o leite padronizado, **0,04 para a fertilidade das borregas e 0,05 para a das adultas**; a correlação genética entre as duas fertilidades foi de 0,55, a do leite com a fertilidade das borregas não diferiu de zero, e a do leite com a fertilidade das adultas foi de **−0,23** ([David et al. 2008](https://doi.org/10.3168/jds.2008-1113)) **[resumo; definição exata da fertilidade não lida]**. A herdabilidade baixa não tira a fertilidade do índice, porque o valor econômico é alto. Numa função de lucro de 41 rebanhos Latxa e 12 Manchega, as medianas dos pesos econômicos foram de €138,60 e €137,66 por parto (fertilidade), €40,00 e €34,17 por cordeiro (prolificidade), €1,18 e €0,73 por litro de leite e €1,66 e €2,16 por ano de vida produtiva; os autores concluem que a seleção só para leite reduz a fertilidade por resposta correlacionada e reduz muito o lucro ([Legarra et al. 2007](https://doi.org/10.1017/s1751731107657814)) **[resumo]**. Em litros, **um parto a mais vale tanto quanto 117 L de leite na Latxa e 189 L na Manchega** **[conferido numericamente]**.

A prolificidade é um contador com herdabilidade baixa e variância que depende da média. Em Suffolk e Texel, raças de carne, a herdabilidade do tamanho da ninhada foi de 0,06 a 0,13 por REML linear, de 0,12 a 0,17 na escala subjacente e de 0,05 a 0,18 no modelo de limiar bayesiano, e a correlação entre ninhadas de cio natural e induzido foi de 0,40 a 0,81 conforme a raça e o modelo; os autores recomendam o **modelo bivariado de limiar** e tratar cio natural e induzido como características distintas ([Janssens et al. 2004](https://doi.org/10.1186/1297-9686-36-5-543)) **[resumo]**. Na Lacaune, um modelo com genes que controlam a média e a variabilidade ambiental, com a prolificidade como característica de limiar, indicou herdabilidade "grande" para a média e uma ovelha economicamente ótima que pare gêmeos, o que abre espaço para seleção canalizante ([SanCristobal-Gaudy et al. 2001](https://doi.org/10.1186/1297-9686-33-3-249)) **[resumo; valores não lidos]**. A sincronização para IA aumentaria a prolificidade e a sua variância em 15% a 30%, o que pode distorcer a comparação entre progênies ([Réussir](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances)) **[trecho de busca]**. As fórmulas dos modelos linear, de Poisson e de limiar estão no relatório de caprinos.

O gene de grande efeito da prolificidade da Lacaune, o **FecL**, foi descrito na **linha de carne** da raça, e não na leiteira. O mapeamento fino o pôs numa região de 194,6 kb do cromossomo 11 com dois genes, IGF2BP1 e B4GALNT2, e os autores propõem o B4GALNT2, expresso de forma ectópica nos folículos das portadoras; cada cópia do alelo mutante eleva a taxa de ovulação em cerca de 1,5 óvulo ([Drouilhet et al. 2013](https://doi.org/10.1371/journal.pgen.1003809)). Na população de carne da Ovi-Test, com 5.775 ovelhas e 1.025 machos genotipados, as frequências foram de 71% ++, 27% L+ e 2% LL; cada cópia somou em média **0,5 cordeiro por parto**, a fertilidade após IA foi maior nas L+ e os cordeiros de mães ++ pesaram 300 g a mais. O programa mantém o FecL em heterozigose e retirou o FecXL (BMP15) da população, e o artigo mostra que "ignoring the existence of this major gene in genetic evaluation of prolificacy can lead to a large overestimation of polygenic breeding values" ([Martin, Raoul e Bodin 2014](https://doi.org/10.1186/1297-9686-46-48)). A presença do FecL na linha leiteira não foi documentada, e o resultado não deve ser transferido sem genotipagem. No Brasil, um painel de 48 marcadores em 15 raças associou uma mutação do GDF9 a mais cordeiros na Blackbelly, na Santa Inês e na Morada Nova, raças que não são leiteiras ([Rodrigues et al. 2026](https://doi.org/10.3390/ani16132008)) **[resumo]**.

As referências de manejo reprodutivo são de outros sistemas e servem de contexto. Com sêmen fresco e cio sincronizado, a IA dá de 60% a 70% de prenhez na Argentina, e com sêmen congelado por laparoscopia, 65% após detecção de cio contra 50% em tempo fixo ([Gibbons et al. 2019](https://doi.org/10.21451/1984-3143-ar2018-0129)). Em primíparas cruzadas, predominantemente Lacaune, sincronizadas na contraestação, a nova cobertura aos 90 dias pós-parto em vez de 75 deu taxa de parto de 80,0% contra 64,1% (P = 0,11) e 1,50 contra 1,05 cordeiro por ovelha tratada (P = 0,06), com 39 e 40 ovelhas, ou seja, tendências e não efeitos confirmados ([Goulet e Castonguay 2002](https://doi.org/10.4141/a01-098)). Numa fazenda espanhola com média de 3.746 Lacaune por ano, os sistemas de 5 e 10 lotes de parto por ano deram 1,42 e 1,30 parto por ovelha por ano, intervalo entre partos de 283 e 302 dias e descarte de 42,5% e 35,4%, com a ordem dos pares a conferir na tabela original ([Pesantez-Pacheco et al. 2018](https://doi.org/10.1017/s175173111700369x)) **[resumo]**. Nenhuma fonte lida estimou herdabilidade de intervalo entre partos, idade ao primeiro parto ou reprodução fora de estação em ovelhas leiteiras.

### Cordeiros e longevidade: as maiores lacunas

Nenhuma fonte lida estimou herdabilidade de peso ao nascer, sobrevivência ou crescimento até o desmame em raças ovinas leiteiras, nem efeitos maternos nelas. O estudo mais próximo é de Romanov, raça prolífica de carne, com modelos animais de repetibilidade para a prolificidade ([Murphy et al. 2020](https://doi.org/10.1093/jas/skaa283)) **[resumo]**. Em rebanhos leiteiros com cordeiros criados no balde, o modelo direto-materno do relatório de corte é o ponto de partida, mas sem parâmetros ovinos leiteiros **[inferência]**. Para a longevidade, a referência é Valle del Belice: com 4.880 lactações de 2.190 ovelhas em 11 rebanhos e análise de sobrevivência, a herdabilidade da longevidade funcional foi de **0,07 na escala logarítmica e 0,11 na escala original**, o efeito de rebanho-ano-estação respondeu por 19% e 27%, e a classe de células mais alta teve risco de descarte 20% maior ([Riggio et al. 2009](https://doi.org/10.3168/jds.2008-1316)) **[resumo; modelo de sobrevivência não lido]**. Em Katahdin, raça de carne americana, indicadores de longevidade analisados em modelos animais univariados, com o grupo de contemporâneas fixo (h² = σ²a/(σ²a + σ²e)) ou aleatório (h² = σ²a/(σ²a + σ²cg + σ²e)), tiveram herdabilidade de 0,06 a 0,15 ([Pinto et al. 2025](https://doi.org/10.1093/jas/skaf125)). Um índice francês de longevidade aparece só em trecho de busca **[não verificado]**.

### Verminose: a França já indexa carneiros resistentes

A resistência a nematoides é a característica funcional em que a ovelha leiteira está à frente da cabra. Na Lacaune suíça, com cerca de 1.150 ovelhas naturalmente infectadas em 15 rebanhos comerciais e 43% de *Haemonchus* entre os nematoides, um modelo animal multicaracterística deu herdabilidades de **0,33 para o OPG, 0,30 para o FAMACHA, 0,36 para o hematócrito e 0,34 para o leite**; as correlações genéticas do OPG com o FAMACHA (0,03) e com o hematócrito (0,01) ficaram perto de zero, o que os autores atribuem ao desafio parasitário baixo; 38%, 14% e 2% das observações caíram nos graus 3, 4 e 5 do FAMACHA ([Werne et al. 2023](https://doi.org/10.1016/j.animal.2023.100772)) **[resumo]**. Uma revisão cita meta-análises com herdabilidade do OPG de 0,14 em ovelhas leiteiras e 0,29 em ovelhas de corte, correlação de 0,70 entre OPG e FAMACHA e correlação genética do OPG com o leite de 0,17 ± 0,35, não significativa ([Cunha et al. 2024](https://doi.org/10.3390/ani14040613)). Na França, a Manech tête rousse e a Basco-Béarnaise fenotipam desde 2008, na plataforma Phenopasto, os carneiros candidatos à IA (1.700 MTR e 500 BB): cada carneiro recebe duas infecções com larvas L3 de *H. contortus*, separadas por 15 dias, e o OPG é contado um mês depois de cada uma. A indexação pelo fenótipo existe desde 2017, a genômica desde 2023, e a entrada da resistência no ISOL estava em discussão em 2023 ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)). Na validação de campo de 2018, as filhas de carneiros resistentes teriam cerca de 50% menos ovos nas fezes ([Astruc, ICAR 2024](https://old.icar.org/Documents/Bled-2024/PPTs/S7_2_Astruc_ICAR2024_Bled_Session7_PARASITES.pdf)) **[trecho de busca]**. No Brasil, a Embrapa padronizou o FAMACHA com graus de hematócrito (F1 ≥ 28%, F2 23–27%, F3 18–22%, F4 13–17%, F5 ≤ 12%), aplicável quando *H. contortus* responde por pelo menos 60% da carga, com exame a cada 10 dias na época chuvosa e a cada 20 a 30 na seca, e recomenda separar como reprodutores os animais que ficam um ano em F1 e descartar os que precisam de vermífugo com frequência; o acerto mensal da leitura variou de 38% a 93% ([Embrapa, Circular Técnica 52](https://www.infoteca.cnptia.embrapa.br/bitstream/doc/37734/1/Circular52.pdf)). Uma meta-análise em trabalho de conclusão de curso, sem revisão por pares, combinou herdabilidades de 0,20 para o FAMACHA e 0,17 para o OPG ([UFU](https://repositorio.ufu.br/handle/123456789/39621)). Nenhuma estimativa em ovelhas leiteiras brasileiras foi encontrada. O desenho do modelo é o de medidas repetidas do relatório de caprinos, com o OPG transformado e a data da última vermifugação como covariável.

### Scrapie: o PRNP entra como restrição, não como herdabilidade

A resistência ao scrapie clássico depende sobretudo dos códons 136, 154 e 171 do gene PRNP, no cromossomo 20: o alelo **ARR é resistente e o VRQ é o mais suscetível**, e esses polimorfismos têm "the highest level of evidence, reproducibility, and practical MAS application in sheep" ([Ghaderi-Zefrehei et al. 2026](https://doi.org/10.3389/fgene.2026.1865980); [Hagenaars et al. 2018](https://doi.org/10.1371/journal.pone.0195009)). Uma revisão traz duas formulações que não coincidem: numa, heterozigotos com ARR ou AHQ têm menor risco; noutra, ARR e AHQ dão resistência "só em homozigose". A mesma revisão associa ARR e AHQ a **maior suscetibilidade ao scrapie atípico**, junto com a homozigose para fenilalanina no códon 141 ([Acín et al. 2021](https://doi.org/10.3390/ani11030691)). Na Lacaune, todos os carneiros são ARR/ARR desde 2003 e 98% das matrizes têm pelo menos um alelo ARR ([UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf)); as cinco raças leiteiras francesas selecionam pelo PrP há pelo menos 15 anos ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)), cerca de 160 mil genotipagens foram financiadas até 2009 ([Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf)) e o catálogo da Latxa traz o genótipo de cada carneiro, como "ARR/ARQ" ([Lasarte 2018](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf)). Na Itália, o plano nacional genotipa machos desde 2005, e a proporção de machos suscetíveis caiu cerca de 3% ao ano de 2005 a 2022 (razão de prevalência de 0,97; IC95% de 0,96 a 0,98) ([Desiato et al. 2025](https://doi.org/10.1186/s13567-025-01677-8)) **[resumo]**. O PRNP não tem herdabilidade no sentido quantitativo: é um genótipo que entra no esquema como restrição (só carneiros ARR/ARR) ou como critério binário. Nenhuma fonte lida estimou o efeito do PRNP sobre o leite ou as células, nem a frequência de ARR em Assaf, Churra, Manchega, Sarda ou raças gregas. Para o Brasil, a consequência prática é que o sêmen de Lacaune francesa traz o ARR por construção, e que a decisão de genotipar o rebanho depende da situação sanitária local, não avaliada nas fontes lidas.

Metano e eficiência alimentar não têm estimativas em ovelhas leiteiras. Numa população materna neozelandesa, a herdabilidade do metano em câmara portátil foi de 0,32 ([Johnson et al. 2022](https://doi.org/10.3389/fgene.2022.911639)), valor de raças de carne que não deve ser transferido.

## A genômica funciona na Lacaune e rende pouco nas populações pequenas

### ssGBLUP oficial desde 2015, com mais de 10 mil carneiros na referência

A Lacaune chegou ao single-step em etapas. Com 1.886 carneiros de treino nascidos de 1998 a 2006 e 681 de validação nascidos em 2007–2008, as primeiras predições (BLUP, Bayes Cπ, PLS) deram acurácias de 0,4 a 0,6 e ganhos de 18% a 25% sobre o pedigree para carneiros jovens ([Duchemin et al. 2012](https://doi.org/10.3168/jds.2011-4980)) **[resumo]**. Um ensaio com 2.567 carneiros genotipados e 43.929 SNPs retidos mostrou correlações com a DYD de 0,39 (média dos pais) contra 0,45 (genômica) no leite, cerca de 15% a mais, e de 0,49 contra 0,57 (gordura), 0,53 contra 0,59 (proteína) e 0,41 contra 0,45 (células); retirar os animais não genotipados derrubou a correlação do leite em 9%, retirar os carneiros nascidos antes de 2003 em 11% e retirar os parentes próximos dos carneiros de validação em 27% ([Baloche et al. 2011](https://docs.eaap.org/2011/S49_Baloche.pdf)). Com 2.892 carneiros com teste de progênie, o ssGBLUP "regular" superou as variantes de pseudo-BLUP e ganhou de 0,10 a 0,20 de acurácia sobre a média dos pais; o tamanho efetivo foi estimado em 370 e o desequilíbrio de ligação médio, r² = 0,11 para marcadores a menos de 0,1 cM, ficou abaixo do bovino; a conclusão foi que a transição "is possible but costs need to be carefully evaluated" ([Baloche et al. 2014, J. Dairy Sci. 97:1107](https://doi.org/10.3168/jds.2013-7135)) **[resumo]**. Na validação de 2010, com 592 carneiros, a acurácia do leite passou de 0,32 (pseudo-BLUP) para 0,43 (pseudo-ssGBLUP) e **0,47 (ssGBLUP)**; a do teor de gordura, de 0,58 para 0,71; a do teor de proteína, de 0,54 para 0,70; a das células, de 0,49 para 0,59; e as das notas de úbere, de 0,47–0,48 para 0,61–0,67 ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). O ssGBLUP entrou na avaliação oficial em **2015**, escolhido por ter menos viés que o pseudo-ssGBLUP e por usar o desempenho de fêmeas genotipadas ou não ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515); [Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4); [Machefert et al. 2025](https://doi.org/10.3168/jdsc.2024-0714)).

A infraestrutura é a que o relatório de corte descreve, com escala ovina. O chip é o Illumina OvineSNP50, com 54.241 SNPs, validado em 2.819 animais da diversidade mundial ([Kijas et al. 2012](https://doi.org/10.1371/journal.pbio.1001258)); a avaliação de 2015 usava 39.216 SNPs, depois de eliminar call rate abaixo de 97%, incompatibilidade de parentesco, MAF abaixo de 1% e desvio de Hardy-Weinberg com P < 10⁻⁵, e imputava com o Beagle. Um biobanco guarda o sangue de cerca de 14.500 carneiros nascidos depois de 1990 (9.612 Lacaune). Em 2015 havia 8.305 carneiros Lacaune genotipados, 4.716 com filhas, contra 490 na Corse, 1.422 na Manech tête rousse, 330 na tête noire e 562 na Basco-Béarnaise ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). Os cordeiros que entram nos centros de IA são genotipados com um painel de **1.500 SNPs (ISGC), que inclui a mutação do SOCS2**, e imputados para 54K na rotina ([Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4)). Em 2026, a referência tinha **mais de 10 mil carneiros de IA** nascidos desde o início dos anos 2000, e a acurácia para produção ainda ficava abaixo da das grandes raças leiteiras bovinas ([De Laet e Raoul 2026](https://doi.org/10.3168/jds.2025-27638)) **[resumo]**. O número de grupos de pais desconhecidos varia entre as fontes (22 na avaliação descrita em 2016, 24 no estudo do SOCS2 e 25 num estudo de 2022), o que reflete períodos e desenhos diferentes, e não erro.

O esquema mudou junto. Desde 2015, todo cordeiro que entra no centro de IA é genotipado ([UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf)); a primeira IA pode ser feita em cordeiros de 6 meses ou em antenais de 1,5 ano; o índice genômico do carneiro aprovado só é divulgado a partir do segundo ano de uso; e os carneiros passam de "améliorateurs" (sem filhas) a "confirmés", com índice de progênie a partir de 2,5 anos ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). O teste real da pré-seleção genômica, com um terço dos candidatos escolhido pelo genoma, comparou 262 carneiros genômicos com 389 clássicos: a média do ISOL com ssGBLUP foi de **284 contra 119**, superioridade de 0,62 desvio-padrão do índice, e 28% contra 46% dos carneiros ficaram abaixo de 100 pontos ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). Esses números implicam um desvio-padrão do ISOL dos carneiros de cerca de 266 pontos **[conferido numericamente; inferência]**. Um trecho de busca do trabalho de congresso sobre o mesmo experimento traz 0,52 desvio-padrão e eliminação de 24% contra 48% ([HAL hal-02742682](https://hal.inrae.fr/hal-02742682/file/2014_Baloche_10WCGALP_Vancouver_1.pdf)) **[trecho de busca]**; o relatório usa a versão publicada. A modelagem determinística previu ganhos anuais de 0,28 desvio genético no esquema clássico da Lacaune, 0,33 (+19%) com carneiros genômicos de 6 meses e 0,32 (+16%) no esquema misto, e de +20% na Manech tête rousse, +33% na tête noire e +17% na Basco-Béarnaise, com 45% e 25% menos carneiros de IA na Lacaune e na tête rousse ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)); um slide espanhol fala em 20% a 40% menos carneiros ([Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf)), e a brochura da raça declara 30% a mais de eficiência ([UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf)). Nenhuma fonte lida mediu o ganho realizado atribuível à genômica.

Duas perguntas abertas na França interessam a quem pensa em genotipar fêmeas. Um modelo determinístico de fluxo gênico concluiu que genotipar fêmeas só se paga em 20 anos com **ganho de confiabilidade de +0,20 ou custo de €4 por amostra**, e que genotipar borregas "does not appear to be a viable option" com os custos atuais ([De Laet e Raoul 2026](https://doi.org/10.3168/jds.2025-27638)) **[resumo]**. E os espectros de infravermelho do leite (MIR), já medidos no controle leiteiro, predisseram melhor que os marcadores os fenótipos de leite e de saúde do úbere, mas não os de forma do úbere, e juntar os dois não melhorou ([Machefert et al. 2025](https://doi.org/10.3168/jdsc.2024-0714)) **[resumo]**.

### Metafundadores: a Lacaune dividida em duas empresas

A Lacaune é, na prática, duas populações. Desde 1972 a seleção é feita por duas empresas (Confédération Générale de Roquefort e Ovi-Test), com pouca troca de animais; com cerca de 6 milhões de fenótipos de leite, 2 milhões de animais no pedigree e mais de 29 mil genotipados, incluindo 3.434 e 2.868 carneiros de IA de cada empresa, os grupos genéticos foram definidos pela teoria dos **metafundadores**, e a predição continua conjunta ([Wicki, Raoul e Legarra 2023](https://doi.org/10.3168/jds.2022-23114)) **[resumo]**. Uma simulação com divisão 90/10 e 5.400 fêmeas mostrou o custo de separar: a avaliação separada deixa a população menor com acurácia mínima de 0,53 e perda máxima de 16,6%, e mesmo a avaliação conjunta deixa perda de ganho de 14,3% na menor; a causa estudada foram fazendas orgânicas, em que a proibição de hormônios limita a IA ([Wicki, Legarra e Raoul 2025](https://doi.org/10.1111/jbg.12946)) **[resumo; o resumo não diz se os 16,6% são de acurácia ou de ganho]**. Com 40 anos de dados, 7 características, cerca de 1,9 milhão de animais e 5.900 carneiros de IA genotipados, BLUP e ssGBLUP foram comparados com 25 grupos fixos ou com metafundadores; o γ estimado pela tendência de endogamia deu aumento de endogamia mais rápido que o do pedigree ([Macedo et al. 2022](https://doi.org/10.3168/jds.2021-20860)) **[resumo]**. O estimador de Γ foi testado em 29.138 Lacaune genotipadas: com genótipos em todas as gerações, os estimadores GLS e pseudo-EM(+ΔF) são acurados; com genótipos só nas gerações recentes, o GLS fica viesado e o pseudo-EM(+ΔF) é melhor ([Legarra et al. 2024](https://doi.org/10.1186/s12711-024-00892-9)). As equações abaixo vêm do relatório de corte e de uma transcrição linear desse artigo **[a forma de Γ precisa de conferência no PDF]**:

```
H^Γ⁻¹ = A^Γ⁻¹ + [ 0  0 ; 0  G⁻¹ − A₂₂^Γ⁻¹ ]          (relatório de corte, eq. 56)
Γ_{b,b'} = (2/k)·(2p_b − 1)'(2p_b' − 1)              p_b: frequências alélicas da base b em k SNPs
log L(Γ) = constante − (k/2)·log|A₂₂^Γ| − (k/2)·tr[(A₂₂^Γ)⁻¹ G]
Um metafundador: o estimador de máxima verossimilhança é raiz real de uma cúbica e₃γ³ + e₂γ² + e₁γ + e₀ = 0
```

A forma transcrita de Γ passa num teste algébrico simples: com p = 0,5 em todos os SNPs, Γ = 0 (base não endogâmica); com todos os SNPs fixados, Γ = 2; e com frequências de média 0,5, Γ coincide com 8 vezes a variância das frequências (0,665 nos dois cálculos com frequências uniformes simuladas) **[conferido numericamente]**. Isso não substitui a leitura do PDF.

### SOCS2: um alelo que eleva as células e também o leite

O SOCS2 é o gene de grande efeito mais bem caracterizado da ovelha leiteira, e o seu papel difere do da αs1-caseína da cabra: em vez de concentrar a variância de uma característica de qualidade do leite, ele liga um efeito desfavorável (mais células) a efeitos favoráveis (mais leite e mais peso). Um estudo de associação em 1.009 ovelhas de 33 famílias de meios-irmãos localizou um QTL de células no cromossomo 3 e, por sequenciamento, a substituição **p.R96C** no domínio SH2 do SOCS2. Entre 468 carneiros, as frequências genotípicas foram de 58,5% C/C, 40% C/T e 1,5% T/T, com o alelo T a 21,7%; o genótipo explicou 12% da variância das células, as filhas de carneiros C/T produziram significativamente mais leite que as de C/C, e as portadoras do T ficaram "very much higher" em peso a partir dos 17 meses. Os autores sugerem que o efeito favorável sobre leite e crescimento explica a frequência alta de um alelo deletério para a mastite ([Rupp et al. 2015](https://doi.org/10.1371/journal.pgen.1005629)). Em Hardy-Weinberg, a frequência de 21,7% daria 4,7% de T/T, contra 1,5% observado **[conferido numericamente]**; como os carneiros são selecionados, o desvio não é teste de nada. Na avaliação genômica com 1,5 milhão de fenótipos, a região do SOCS2 explicou **12,00% da variância genética das células**, 4,91% da quantidade de proteína, 3,94% do leite, 2,57% do teor de gordura e 1,84% da fissura do úbere ([Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4)).

O mesmo estudo comparou quatro formas de usar o gene **[equações transcritas do texto; conferir no PDF]**:

```
1) SNP causal dentro do ssGBLUP:                         +0,26% de acurácia média; +1,06% nas células
2) WssGBLUP (pesos por SNP):  â = D M'(M D M')⁻¹ ĝ_gen ;  σ²a,i = â_i²·2p_i(1 − p_i) ;  D = diag(σ²a,i)
   (D = I no ssGBLUP; melhor após duas iterações)       +3,99% sobre o ssGBLUP
3) Conteúdo gênico (Gene Content, Legarra e Vitezica 2015):
   y_T = μ_T + Z_T g_T + ε_T       y_T = cópias do alelo T (0, 1, 2), só nos genotipados para o SOCS2
   var(g_T) = A σ²gT,  σ²gT = 2 f_T (1 − f_T)          (A de pedigree, para não duplicar o chip)
   analisado com a característica num modelo bicaracterística:  [g; g_T] ~ N(0, G₀ ⊗ A)
   EBV_poligênico = ĝ − α̂·ĝ_T ,  α̂ = côv(g, g_T)/σ̂²gT ;  variância explicada = α̂²·σ̂²gT/σ̂²g
                                                         +6,25% sobre o BLUP de pedigree
4) Efeito fixo do genótipo (Martin et al. 2014, FecL): retira o gene do EBV poligênico
Referência: ssGBLUP sobre BLUP de pedigree               +14,03% de acurácia média
```

Com f_T = 0,217, a variância do conteúdo gênico é 2 × 0,217 × 0,783 = **0,340** **[conferido numericamente]**. Os números contam uma história clara: o salto vem do ssGBLUP (+14%); o gene, já capturado pelo chip, acrescenta pouco dentro do ssGBLUP (+0,26%); e o conteúdo gênico vale onde não há chip, porque recupera a informação do gene com genótipo parcial (+6,25% sobre o pedigree). A conclusão dos autores é que mutações causais de efeito moderado a forte "can be captured with conventional SNP chips by applying appropriate genomic evaluation methods", e que o conteúdo gênico serve a populações sem genotipagem ampla ([Oget et al. 2019](https://doi.org/10.1186/s12864-019-6068-4)). Na Chios grega, um painel de 960 SNPs em regiões de QTL de mastite, aplicado a 609 ovelhas, apontou o SOCS2 entre os genes candidatos e concluiu que a arquitetura conservada entre raças torna viável a seleção entre raças ([Banos et al. 2017](https://doi.org/10.1186/s12864-017-3982-1)) **[resumo]**. Para o índice, o SOCS2 é o exemplo de que um alelo que aumenta leite e peso pode ser selecionado sem querer se o índice não pesar as células ([Ghaderi-Zefrehei et al. 2026](https://doi.org/10.3389/fgene.2026.1865980)). A frequência atual do alelo na Lacaune e o efeito da seleção sobre ela depois de 2015 não foram encontrados.

Outros recessivos já são monitorados. Em 19.102 Lacaune com o chip de 50K faseado, 11 haplótipos tiveram deficiência de homozigotos de 79% a 100%, com 3,7% a 12,1% de portadoras, e sete deles se associaram a menor sucesso de IA ou a mais natimortos, o que permite evitar acasalamentos de risco ([Ben Braiek et al. 2021](https://doi.org/10.1186/s12711-021-00634-1)) **[resumo]**; na Manech tête rousse, um estudo semelhante achou uma variante sem sentido no gene MMUT que afeta a viabilidade do cordeiro ([Ben Braiek et al. 2024](https://doi.org/10.1186/s12711-024-00886-7)) **[só título]**.

### Manech, Basco-Béarnaise e Latxa: referência de centenas de carneiros

As raças do oeste dos Pireneus mostram o limite da genômica em populações de algumas centenas de carneiros. Com 100 a 1.300 machos genotipados por raça (em geral os dez últimos grupos com teste de progênie), seis populações de Latxa, Manech e Basco-Béarnaise ganharam de 0,05 a 0,30 de acurácia absoluta sobre o pedigree em cinco delas, com acurácias "comparable with other breeds of dairy sheep or small breeds of dairy cattle"; juntar populações acrescentou pouco, e a Basco-Béarnaise e a Lacaune apareceram isoladas ([Legarra et al. 2014](https://doi.org/10.3168/jds.2013-7745)) **[resumo]**. Um slide espanhol, citando esse trabalho, dá ganhos de 0,11 na tête noire, 0,16 na tête rousse e 0,06 na Basco-Béarnaise ([Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf)). A correlação genética para o leite entre os dois lados da fronteira foi de **0,7** dentro de cada cor (Manech tête rousse com Latxa Cara Rubia; tête noire com Latxa Cara Negra de Navarra), mas juntar os dados por cor não elevou a acurácia genômica ([Garcia-Baccino et al. 2022](https://doi.org/10.3168/jdsc.2021-0195)). A ROLP (Manech e Basco-Béarnaise) lançou a seleção genômica em **2017**, depois do projeto GENOMIA, com 4.700 carneiros genotipados e progênie conhecida ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)), data que o slide espanhol confirma; um perfil de raça encontrado em busca diz **2008** **[trecho de busca; não verificado]**. O conflito pode vir de 2008 ser o ano em que a ROLP começou a fenotipar resistência a parasitas **[inferência]**, mas o relatório adota 2017.

Na Latxa Cara Rubia (face loira, "Red Faced" nas fontes em inglês), com 133.230 ovelhas, 325 rebanhos, 1.835 machos e **429 machos genotipados** (39.593 SNPs), a genômica quase não saiu do lugar. O slide de 2018 traz a acurácia de pedigree contra a genômica como 0,41 contra 0,44 num quadro e 0,47 contra 0,50 noutro, com 7,6% de ganho relativo nos dois, e, na Latxa Cara Negra, 0,59 contra 0,43, isto é, perda ([Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf)); um estudo anterior chegou a "hardly understandable results" e acurácia negativa ([Legarra et al. 2014](https://doi.org/10.3168/jds.2013-7745)). O artigo de 2020 concluiu que pedigree e genômica têm a mesma acurácia com os dados disponíveis e que o ssGBLUP com metafundadores dá predições quase sem viés, mas não mais precisas, "provavelmente por causa do pequeno número de irmãos genotipados" ([Granado-Tajada, Legarra e Ugarte 2020](https://doi.org/10.3168/jds.2019-18033)) **[resumo]**. Uma simulação com a estrutura da Latxa recomendou genotipar machos conectados e com filhas registradas, e mostrou que genotipar fêmeas com lactação própria aumenta a acurácia ([Granado-Tajada, Varona e Ugarte 2021](https://doi.org/10.3168/jds.2020-19978)) **[resumo]**. Com 40 anos de dados das três populações, a acurácia dos candidatos jovens pelo ssGBLUP ficou entre **0,54 e 0,69**, e descartar dados históricos rendeu só 2,5% a 2,7% ([Granado-Tajada e Ugarte 2024](https://doi.org/10.1016/j.animal.2024.101245)) **[resumo]**. Um trecho de busca do programa oficial Latxa–Carranzana, do ministério espanhol, diz que todos os machos reprodutores estão genotipados **[trecho de busca; PDF bloqueado por certificado]**, e o projeto ARDI concluiu uma indexação multipaís Latxa × Manech, com a avaliação conjunta ainda em curso em 2023 ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)).

### Fora da França e da Latxa, a genômica é rotina só na Assaf e na Manchega

Na Espanha, a Assaf publicou a primeira avaliação genômica em setembro de 2018 e, em julho de 2022, incluiu valores genômicos de leite, gordura e proteína em lactação de 150 dias e de resistência à mamite; carneiros sem filhas recebem um valor genômico direto ([Oviespaña](https://www.oviespana.com/Articulos/293540-Entrega-valoraciones-geneticas-socios-Assaf-Espana-incorporan-caracteres-seleccion-ubres.html)) **[trecho de busca]**. Segundo o relatório do MAPA e do INIA, a Assaf é a única raça com índices genômicos combinados, Assaf e Manchega fazem avaliação genômica de rotina e abandonaram a clássica, Churra e Latxa estão em fase inicial, e as correlações entre valores genômicos e tradicionais passam de 0,90 **[trecho de busca; PDF bloqueado por certificado]**. Um estudo com 1.039 Assaf e 981 Churra, com chips de 50K e de baixa densidade, comparou BLUP, GBLUP, SNP-BLUP e ssGBLUP para leite, composição e rendimento queijeiro ([Marina et al. 2022](https://doi.org/10.3168/jds.2021-21601)) **[resumo]**. Na Itália, a Sarda tem estudos com o OvineSNP50 em 3.731 ovelhas de 161 famílias ([Usai et al. 2019](https://doi.org/10.1186/s12711-019-0508-0)) **[resumo]**, mas os índices genômicos anunciados em 2020 como meta do AGRIS ([AGI 2020](https://www.agi.it/cronaca/news/2020-12-11/pecora-sarda-ariete-garibaldi-10641644/)) **[trecho de busca]** não foram confirmados em produção. Na Grécia, há painéis de pesquisa (Chios) e estudos de estrutura, sem avaliação genômica. No Brasil, nenhum estudo genômico de ovinos leiteiros foi encontrado; os estudos nacionais com genômica em ovinos tratam de Santa Inês, Morada Nova e Blackbelly, como a avaliação de resistência a nematoides e tamanho corporal da Santa Inês com matrizes de parentesco genômicas ([Torres et al. 2021](https://doi.org/10.5713/ajas.19.0816)) **[resumo]**. A consequência é que, por muitos anos, a genômica chegará ao rebanho brasileiro **embutida no EBV dos carneiros importados**, e não por genotipagem própria.

## Índices, carneiros e conectividade transformam EBVs em decisão

### ISOL: metade funcional desde 2005, com fórmula oficial não verificada

O índice da Lacaune é o **ISOL** ("Index Synthétique des Ovins Laitiers"), expresso em "équivalent dl", com limiar habitual de **100 pontos** para escolher reprodutores; os caracteres funcionais entraram em 2005 com 50% do peso, e o ganho do ISOL de 2005 a 2015 foi de 0,23 desvio genético por ano ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515); [Barillet et al. 2016](https://productions-animales.org/article/download/2514/7656)). A história dos pesos, em desvios-padrão genéticos e com a quantidade de proteína (QMP) igual a 1, foi lida como imagem na Tabela 3 de Barillet et al. **[leitura de imagem]**:

| Raça e ano | Leite (QL) | Gordura (QMG) | Proteína (QMP) | Teor de gordura (TB) | Teor de proteína (TP) | Células (CCS) | Morfologia do úbere |
|---|---|---|---|---|---|---|---|
| Lacaune 1965 | 1 | — | — | — | — | — | — |
| Lacaune 1987 | — | 0,72 | 1 | — | — | — | — |
| Lacaune 1992 | — | 0,74 | 1 | — | 0,58 | — | — |
| **Lacaune 2005 (ISOL)** | — | 0,74 | 1 | 0,22 | 0,22 | 1,09 | 1,09 |
| Corse 1995 | 1 | — | — | — | — | — | — |
| Manech tête rousse 2016 | — | 0,68 | 1 | 0,34 | 0,42 | 0,18 | — |
| Manech tête noire 2016 | — | 0,67 | 1 | 0,26 | 0,30 | 0,09 | — |
| Basco-Béarnaise 2016 | — | 0,74 | 1 | 0,31 | 0,36 | 0,15 | — |

Os pesos da Lacaune de 2005 fecham uma conta exata: a soma da produção (0,74 + 1 + 0,22 + 0,22 = 2,18) é igual à dos funcionais (1,09 + 1,09 = 2,18), o que dá **50% e 50%** **[conferido numericamente]** e coincide com o critério que Astruc et al. descreveram na ICAR, "1/2 (FY+PY+F%+P%) + 1/2 (SCC+U)", cuja nota diz que os valores econômicos "are not described" ([Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf)). Nenhuma dessas duas versões inclui a quantidade de leite. As outras fontes discordam. A brochura da raça foi lida por duas notas desta pesquisa de formas diferentes: numa leitura, metade do índice é "qualidade" (quantidade de leite, TB e TP) e metade é morfologia e funcionais (células e úbere); na outra, metade é qualidade do leite (gordura, proteína e células) e metade é funcional (úbere e outros) ([UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf)). Blogs comerciais franceses dizem que a metade produtiva tem quantidade de leite, TB e TP ([Gambin](https://gambin.co/blog/schema-insemination-ovins/)) **[trecho de busca]**. E um trecho de busca atribui a um documento do Idele o índice de produção da Lacaune como **1,2 × (leite + 26 × gordura + 56 × proteína)**, que inclui o leite e tem unidades desconhecidas **[trecho de busca; não verificado; não usado nos exemplos]**. Barillet et al. registram que os coeficientes de gordura e de proteína dependem de como as queijarias pagam o leite ([Barillet et al. 2016](https://productions-animales.org/article/download/2514/7656)). A leitura mais segura é a dos pesos em desvios genéticos da tabela, que é a que o exemplo usa, sabendo que a fórmula vigente em pontos de ISOL não foi lida. Nas raças pirenaicas, gordura e proteína entraram no critério em 2001 e um novo critério em 2009 ([Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf)); pela nota da tabela de Barillet, as células entraram em 2016 e a morfologia em 2018–2019.

O preço da metade funcional foi calculado pelos próprios franceses: em 10 anos, o ganho de leite cairia de **61 L (1,9 desvio genético) com o índice de 1992 para 39 L (1,2) com o ISOL de 2005** (modelagem de Barillet 2007, em [Barillet et al. 2016](https://productions-animales.org/article/download/2514/7656)). A implicação para o Brasil é direta. O ISOL não seleciona volume de leite, e sim sólidos, células e úbere; um produtor brasileiro pago por litro que compra o sêmen dos carneiros de ISOL mais alto importa um objetivo de seleção feito para o queijo de Roquefort **[inferência]**.

### Exemplo 3: o mesmo par de carneiros sob três índices

Os EBVs abaixo são fictícios, em desvios-padrão genéticos e com o sinal ajustado para que positivo seja sempre favorável (células positivas significam menos células). O índice é a soma ponderada I = Σ wₖ·zₖ, com os pesos da tabela anterior **[conferido numericamente; pesos lidos em imagem]**.

| Carneiro | QMG | QMP | TB | TP | CCS | Úbere | Lacaune 1992 | **ISOL 2005** | Manech tête rousse 2016 |
|---|---|---|---|---|---|---|---|---|---|
| A (produção alta; células e úbere fracos) | +1,6 | +1,8 | −0,4 | −0,2 | −0,8 | −0,5 | **2,868** | 1,435 | **2,524** |
| B (produção média; funcionais bons) | +0,8 | +0,9 | +0,5 | +0,6 | +0,7 | +0,9 | 1,840 | **3,478** | 1,992 |

O passo a passo do ISOL de 2005 é I_A = 0,74 × 1,6 + 1 × 1,8 + 0,22 × (−0,4) + 0,22 × (−0,2) + 1,09 × (−0,8) + 1,09 × (−0,5) = 1,184 + 1,800 − 0,088 − 0,044 − 0,872 − 0,545 = **1,435**, e I_B = 0,592 + 0,900 + 0,110 + 0,132 + 0,763 + 0,981 = **3,478**. Divididos pela soma dos pesos (4,36), dão médias ponderadas de +0,33 e +0,80 desvio genético. Pelo índice de 1992 e pelo da Manech tête rousse, que dá só 6,9% do peso às células e nada ao úbere, o carneiro A vence; pelo ISOL, B vence com mais que o dobro. A ordem dos carneiros depende mais do índice do que dos EBVs, e por isso o app deve mostrar os EBVs por característica e deixar o índice como uma escolha declarada, ligada à forma de pagamento do leite.

### Equivalentes na Espanha, na Itália e na Alemanha

Os outros programas publicam índices menos documentados. A **Latxa** tem índice combinado desde 2008, depois de uma sequência que começou com o controle leiteiro em 1982, a IA em 1985, o primeiro ranking de carneiros em 1988, o livro genealógico em 1990, os acasalamentos dirigidos em 1993 e a avaliação de composição e úbere em 2005; o índice junta leite, composição e úbere (inserção e verticalidade dos tetos), e a ficha de um carneiro mostra valor genético de +51 para leite, "repetibility" de 74%, 8 filhas em 8 lactações e 5 rebanhos, +0,062 no teor de gordura, +0,122 no de proteína e índice combinado de 3.365, sem unidades declaradas ([Lasarte 2018](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf)). O catálogo de 2025 da Latxa Cara Negra de Navarra daria 50% à quantidade de leite, 25% à qualidade e 25% ao úbere, e os de 2022 e 2023, 47%, 34% e 27%, que somam **108%** ([ASLANA, catálogo 2025](https://intiasa.es/web/sites/default/files/assets/images/LCN-NA%20-%20Cat%C3%A1logo%202025%20ARDI.pdf)) **[trecho de busca; PDF com certificado expirado]**. A **Assaf** usaria um índice de produção ICOP = ½·G_gordura/O_gordura + ½·G_proteína/O_proteína, sem definição de O no trecho, e um índice de úbere com 40% de inserção, 30% de profundidade, 30% de verticalidade e 0% de tamanho dos tetos, segundo o site da associação **[trecho de busca; fórmula não conferida na página]**. Para a **Manchega**, os pesos econômicos de gordura e de proteína derivados da função de lucro (receita do leite vendido para queijo menos o custo de energia) são parecidos, com a proteína um pouco acima, e pouco sensíveis a preços, exceto ao do leite ([Ramón et al. 2010](https://doi.org/10.3168/jds.2009-2787)) **[resumo; valores não lidos]**. A **Churra** combinaria leite, proteína e úbere **[trecho de busca]**, e a **Sarda** declara como objetivos quantidade e qualidade do leite, úbere e prolificidade, sem fórmula encontrada. No outro extremo, o programa do Ostfriesisches Milchschaf da Baixa Saxônia (685 ovelhas e 18 carneiros em 11 rebanhos em 2021) calcula um valor genético total com 30% de tamanho da ninhada, 45% de exterior e 25% de ganho diário, **sem o leite**, que entra só como controle obrigatório das mães dos carneiros ([LSV Niedersachsen 2025](https://www.schafzucht-niedersachsen.de/Schafzucht-Verbaende-Niedersachsen/images/Inhalte/Schaf-Rassen/Milchschafe/250212_ZP-OMS-2025-LSV-NDS.pdf)). Quem importa East Friesian alemã, portanto, não importa seleção para leite.

### Esquema de carneiros: pirâmide, 30 a 40 filhas e pré-seleção genômica

Os esquemas franceses são pirâmides em que os carneiros de IA nascem no núcleo e são testados em progênie. Em 2009, a Lacaune tinha 900 mil ovelhas, 173.568 no núcleo (19%), **85% de IA no núcleo e 445 carneiros testados por ano**; a Manech tête rousse, 270 mil, 26%, 50% e 151; a tête noire, 100 mil, 15%, 45% e 36; a Basco-Béarnaise, 80 mil, 27%, 50% e 52; e a Corse, 95 mil, 23%, 30% e 31 ([Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf)). Os números de 2014 são parecidos (890 mil ovelhas, 172.462 no núcleo, 440 carneiros por ano e 1.400 nos centros de IA) ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). Cada carneiro em teste recebe **100 a 140 IA, que rendem 30 a 40 filhas em primeira lactação** (contra 80 a 100 em bovinos), 50% a 60% das IA dos rebanhos de seleção usam carneiros testados (contra 10% a 20% em bovinos antes da genômica), e o intervalo de gerações é de 4 anos (contra 8) ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)). A regra prática da ROLP é que "un bélier testé sur 40 filles réparties dans 5 à 10 élevages a un index robuste", numa pirâmide "strictement respectée", com controle de uma das duas ordenhas e três amostras de composição por campanha ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)). O ganho do núcleo chega aos rebanhos comerciais por IA ou por carneiros de monta natural nascidos no núcleo ([Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf)). Na monta natural, a paternidade só é atribuível se houver pelo menos 10 dias entre dois carneiros no mesmo lote ([Réussir](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances)) **[trecho de busca]**. Na Grécia, o núcleo da Chios, com 500 ovelhas e acasalamento rotacional desde 1980, usa cada carneiro uma vez e seleciona por um índice de mérito total com leite, tamanho e peso da ninhada ao desmame ([Georgoudis e Ligda, ICAR](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-3-Bella/Georgoudis.pdf)).

### Exemplo 4: confiabilidade de um carneiro com filhas em poucos rebanhos

O exemplo calcula a confiabilidade exata do carneiro X pela variância do erro de predição num modelo de touro com grupo de contemporâneas fixo por rebanho, y = GC + s + e, com h² = 0,30 (σ²s = 0,075; σ²e = 0,925; k = 12,33), carneiros não aparentados e a informação externa entrando como filhas-equivalentes no diagonal das MME; Z é um carneiro importado com REL de 0,90 vinda da avaliação de origem, e Y é um carneiro local de monta natural. A mesma conta foi refeita com h² = 0,24, a estimativa francesa mais recente **[conferido numericamente; desenho fictício]**.

| Situação do carneiro X | Filhas de X | Rebanhos | REL (h² 0,30) | REL (h² 0,24) |
|---|---|---|---|---|
| Sozinho no grupo: todas as ovelhas do lote são filhas de X | 20 | 1 | 0,00 | 0,00 |
| Ao lado de 10 filhas de outro carneiro local | 10 | 1 | 0,22 | 0,20 |
| Ao lado de 10 filhas de um carneiro importado (Z) | 10 | 1 | 0,28 | 0,24 |
| Troca entre 3 rebanhos: 4 filhas em cada, ao lado de 10 de um carneiro local diferente | 12 | 3 | 0,36 | 0,32 |
| Troca entre 3 rebanhos: 4 filhas em cada, ao lado de 10 de Z | 12 | 3 | 0,39 | 0,34 |
| Como a ficha da Latxa: 8 filhas em 5 rebanhos (2, 2, 2, 1, 1), ao lado de 10 de Z | 8 | 5 | 0,34 | 0,29 |
| 40 filhas num só rebanho, ao lado de 40 de Z | 40 | 1 | 0,58 | 0,53 |
| Regra da ROLP: 40 filhas em 5 rebanhos (8 em cada), ao lado de 40 de Z | 40 | 5 | 0,68 | 0,64 |
| 40 filhas em 10 rebanhos (4 em cada), ao lado de 40 de Z | 40 | 10 | 0,70 | 0,65 |
| Fórmula DE ≈ n: n/(n + k) com 12 e 40 filhas | 12 / 40 | — | 0,49 / 0,76 | 0,43 / 0,72 |

As mensagens são as do relatório de caprinos, com números ovinos. Um carneiro cujas filhas não têm contemporâneas de outro pai não tem avaliação nenhuma. As mesmas filhas valem mais espalhadas que concentradas, e a troca de carneiros entre três rebanhos já leva 12 filhas a 0,36–0,39, contra 0,22–0,28 de 10 filhas num rebanho. A regra francesa de 40 filhas em 5 a 10 rebanhos dá **0,68 a 0,70**, e a fórmula DE ≈ n (0,76) é um teto que só se atinge com muitas contemporâneas por grupo. Com h² = 0,30, k_d = 11,33, e são precisas 11,3 filhas-equivalentes para REL de 0,50, 26,4 para 0,70 e 45,3 para 0,80 **[conferido numericamente]**. A conta também ajuda a ler catálogos: a "repetibilidade" de 74% da ficha da Latxa, com 8 filhas em 5 rebanhos, não pode ser confiabilidade só das filhas, porque chegar a 0,74 com 8 filhas exigiria h² de 0,83; o número deve usar outra definição ou incluir outra informação **[conferido numericamente; inferência]**.

### Ganho genético: os números da Lacaune e da Latxa dependem do período

Os valores de progresso genético das fontes não batem entre si, e o relatório os apresenta com o período ao lado.

| Raça | Ganho anual de leite | Período e unidade | Fonte |
|---|---|---|---|
| Lacaune | +5,3 L (0,15 σg); teor de gordura +0,19 g/L; teor de proteína +0,16 g/L | 1990–2008, por ano de nascimento dos machos | [Larroque 2011](https://docs.eaap.org/2011/S49_Larroque.pdf) |
| Lacaune | 6,4 L | carneiros, 1995–2007 (cabeçalho da tabela ambíguo) | [Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) |
| Lacaune | **3,8 L (machos) e 4,0 L (fêmeas)**; TB +0,20 a 0,21 g/L; TP +0,16 g/L; ISOL 0,23 σg | 2005–2015 | [Barillet et al. 2016, Tab. 4](https://productions-animales.org/article/download/2514/7656) **[leitura de imagem]** |
| Lacaune | 5,4 L; gordura +0,25 g/L; proteína +0,19 g/L | "últimos 10 anos" (brochura de 2022, referência de 2019) | [UPRA Lacaune 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf) |
| Lacaune | 6 kg | citado de Barillet (2007) | [Figueira et al. 2018](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1093280/1/CNPC2018Producao.pdf) **[não confirmado no original]** |
| Manech tête rousse / tête noire / Basco-Béarnaise / Corse | 3,2–3,5 / 2,6 / 3,1–3,2 / 1,3–1,5 L (índice: 0,17 / 0,11 / 0,16 / 0,10 σg) | 2000–2015 (Corse 1995–2015) | [Barillet et al. 2016, Tab. 4](https://productions-animales.org/article/download/2514/7656) **[leitura de imagem]** |
| As mesmas quatro | 3,8 / 1,2 / 2,9 / 0,7 L | carneiros, 1995–2007 | [Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf) |
| Latxa | 3,5% a 4% ao ano; 4 L por lactação e ano | citando Ugarte (2017); slide de 2018 | [Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf); [Lasarte 2018](https://www.races-montagnes.com/fr/colloque-seram/documents/atelier1/at1-3-lasarte-colloque-seram2-2018.pdf) |
| Latxa | 2,5% a 3% ao ano; 0,8% a 1,2% ao ano | programa do MAPA; estudo do CIHEAM de 1995 | **[trechos de busca]**; [CIHEAM](https://ressources.ciheam.org/ressources/om/pdf/a55/03600074.pdf) |
| Manchega | cerca de +4 kg | não identificado | **[trecho de busca]** |

A diferença entre 3,8–4,0 L e 5,3–6,4 L na Lacaune tem pelo menos três causas documentadas. Os períodos diferem, e a entrada dos funcionais em 2005 reduziu o ganho de leite esperado em cerca de um terço (61 para 39 L em 10 anos). Os grupos de pais desconhecidos, incluídos no fim de 2013, foram a mudança de maior efeito sobre o progresso estimado ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515)), de modo que estimativas anteriores e posteriores não se comparam. E machos, fêmeas e unidades (litros, desvios genéticos) não são a mesma medida. Na Latxa, os quatro números vêm de fontes, métodos e unidades diferentes (percentual e litros), e nenhum foi conferido na fonte primária. Na Manech tête rousse, o nível genético subiu cerca de 140 L em 35 a 40 anos ([CDEO/SMARTER 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)). Para o Exemplo 8, o relatório usa a faixa de **3,8 a 5,4 L/ano** como tendência francesa recente.

### Conectividade: o valor de ter pais em comum

A conectividade tem uma medida natural nos ovinos: quantos carneiros as populações compartilham. Entre a Lacaune grega (14 pais) e a francesa (64 pais), havia só **6 pais e 11 avós em comum**, reflexo do pouco uso de IA na Grécia, e ainda assim a correlação genética entre os países foi de **0,86 para leite e 0,88 para teor de proteína**, sem interação genótipo × ambiente relevante, e de 0,59 para teor de gordura, com algum reordenamento de pais; os autores concluem que a avaliação conjunta é viável e que a seleção entre países aumentaria o ganho ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194)). O slide de 2024 traz 0,57 para a gordura e erro-padrão de 0,13 (contra 0,12) para a proteína; vale o artigo. Na simulação determinística ΔG = i·r·σA, escolhendo os 10 melhores pais, o ganho dentro da França foi de 53,18 kg e entre países de 53,24 kg, e o da Grécia passou de **37,62 kg para 82,80 kg (+120%)** com acesso aos pais franceses ([Vouraki et al. 2024, slides](https://docs.eaap.org/2024/m221/S02T11.pdf)) **[conferido numericamente]**; outra leitura dos mesmos slides fala em +68% na Grécia e +0,16% na França, provavelmente para outro cenário, e o conflito fica registrado. O caso grego é o espelho do brasileiro: uma população pequena, com poucos carneiros testados, ganha mais ao se conectar a uma população grande do que a qualquer refinamento de modelo. Na Latxa Cara Rubia, a endogamia não subiu, o que um trecho de busca atribuído a um artigo de 2020 sobre a Latxa credita à importação de sêmen de Manech tête rousse **[trecho de busca; DOI não verificado]**. A métrica francesa de conectividade de rebanhos (CACO) está descrita no relatório de caprinos; nenhuma aplicação ovina foi encontrada.

### Endogamia nas populações: Ne de 370 na Lacaune e abaixo de 200 nas raças pirenaicas

O tamanho efetivo da Lacaune foi estimado em 370 ([Baloche et al. 2014](https://doi.org/10.3168/jds.2013-7135)), e, com 8.700 genotipados e pedigree de 72.803 animais, ficou acima de 200 nas duas subpopulações de Lacaune e abaixo de 200 na Basco-Béarnaise e nas duas Manech, com estimativas por pedigree, SNP a SNP e corridas de homozigose (ROH) sem diferença significativa ([Rodríguez-Ramilo et al. 2019](https://doi.org/10.3168/jds.2018-15405)) **[resumo]**; uma versão de congresso dá de 59 a 114 na Basco-Béarnaise e de 81 a 179 na tête noire **[trecho de busca]**, e a Latxa teria Ne de 64 a 103 **[trecho de busca]**. Pela relação ΔF = 1/(2Ne), Ne de 370 equivale a 0,14% de endogamia por geração, 200 a 0,25%, 103 a 0,49% e 64 a 0,78% **[conferido numericamente]**. Nas três raças pirenaicas, 99,1% dos coeficientes parciais de endogamia ficaram abaixo de 0,01, menos de 5% dos ancestrais geraram endogamia, e as contribuições vêm de ancestrais de 5 a 7 gerações atrás; a carga de endogamia sobre o leite variou entre animais (variância de 11.804 e 9.435 L² por descendente totalmente endogâmico na tête noire e na tête rousse), mas não o bastante para selecionar por ela ([Antonios et al. 2025](https://doi.org/10.1186/s12711-024-00945-z)) **[resumo]**. Uma ilha de ROH no cromossomo 6 (30 a 40 Mb, perto de NCAPG e LCORL) é sinal de seleção, e não de endogamia recente ([Rodríguez-Ramilo et al. 2021](https://doi.org/10.3168/jdsc.2020-0011)) **[resumo]**. O núcleo da Chios, com acasalamento rotacional, tinha taxa de endogamia de 0,013 por geração ([Georgoudis e Ligda, ICAR](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-3-Bella/Georgoudis.pdf)), o que equivale a Ne de 38,5 **[conferido numericamente]**. No Brasil, a introdução de East Friesian foi motivada, segundo Ticiani et al., "devido ao aumento do coeficiente de endogamia" da Lacaune ([Ticiani et al. 2013](https://doi.org/10.1590/s0103-84782013000900018)), o que é coerente com uma base fundada em poucos animais importados.

## Os programas de N grande convergem no método; o Brasil não tem programa

"N grande", em ovinos leiteiros, é a França com 334.685 ovelhas em controle oficial e mais 553.836 no método D, a Espanha com 256.480 e a Itália com 161.711 (2020–2021) ([Astruc et al. 2023](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2023_Astruc_et_al.pdf)). O Brasil inteiro tinha cerca de 6.900 matrizes leiteiras em 2015, menos de 4% do núcleo da Lacaune de 2009 **[conferido numericamente]**. O quadro resume o que cada programa usa, com o grau de confirmação de cada célula.

| Programa (quem seleciona e avalia) | Escala documentada | Fenótipo de produção | Modelo de avaliação | Genômica | Índice e publicação |
|---|---|---|---|---|---|
| **Lacaune, França** (UPRA Lacaune; Confédération Générale de Roquefort e Ovi-Test; avaliação Idele–INRAE) | 890 mil ovelhas e núcleo de 172 mil (2014); 185.168 ovelhas em 373 rebanhos selecionadores (referência de 2019); cerca de 6 milhões de fenótipos e 2 milhões de animais no pedigree ([Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515); [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf); [Wicki et al. 2023](https://doi.org/10.3168/jds.2022-23114)) | TMM por Fleischmann; AC e método D; composição e células em amostragem parcial; 330 L em 173 dias | Modelo animal de repetibilidade por característica, 22 grupos de pais desconhecidos, variância heterogênea log-linear desde 2002; úbere por modelo multicaracterística; família BLUPf90 | ssGBLUP oficial desde 2015; todos os cordeiros de IA genotipados (1.500 SNPs imputados para 54K); mais de 10 mil carneiros na referência (2026); metafundadores em pesquisa | ISOL (50% sólidos, 50% células e úbere); limiar de 100 pontos; carneiros ARR/ARR; fertilidade de 94,9%, prolificidade de 1,56, IA em 86,6% das ovelhas |
| **ROLP: Manech tête rousse, tête noire e Basco-Béarnaise** (OS ROLP e CDEO, Ordiarp) | 274 mil, 80 mil e 80 mil ovelhas; 150, 30 e 50 carneiros em teste por ano (2014) | TMM; controle de uma das duas ordenhas; 3 amostras de composição por campanha | Mesmo sistema nacional francês | ssGBLUP desde 2017 (4.700 carneiros genotipados); indexação multipaís Latxa × Manech concluída e avaliação conjunta em curso (2023) | Pesos de 2016 com células (0,09 a 0,18 σg) e úbere desde 2018–2019; resistência a *H. contortus* indexada pelo fenótipo (2017) e pelo genoma (2023) |
| **Corse** | 83 mil ovelhas; 30 carneiros por ano | TMM | Mesmo sistema | Carneiros genotipados, sem avaliação genômica documentada | Só leite; 0,10 σg por ano de 1995 a 2015 |
| **Latxa, Espanha** (CONFELAC, ASLANA, INTIA, Neiker) | cerca de 431 mil ovelhas em três populações (2018, soma das notas); 392.295 registros e 325 rebanhos na Cara Rubia ([Granado-Tajada e Ugarte 2018](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf)) | "Leite padronizado" (comprimento não confirmado); AT e AC | BLUP de modelo animal | Pesquisa: ssGBLUP com metafundadores tão acurado quanto o pedigree com 429 carneiros (2020); 0,54 a 0,69 nos candidatos (2024) | Índice combinado desde 2008; 50% leite, 25% qualidade, 25% úbere no catálogo de 2025 **[trecho de busca]** |
| **Assaf, Espanha** (ASSAF.E) | 465.811 registros de úbere no catálogo de 2025 **[trecho de busca]** | Lactação de 150 dias nas avaliações genômicas; 180 dias em estudo | BLUPF90, com imputação entre dois chips **[trecho de busca]** | Desde setembro de 2018; valor genômico direto para jovens; mamite desde 2022 **[trecho de busca]** | ICOP (gordura e proteína) e índice de úbere **[trecho de busca]** |
| **Churra e Manchega, Espanha** (ANCHE; AGRAMA) | Churra: 43 rebanhos colaboradores de leite (2021) **[trecho de busca]**; Manchega: programa desde 1988 | Manchega: composição opcional, só em parte dos rebanhos **[trecho de busca]** | BLUP **[trecho de busca]** | Churra: fase inicial; Manchega: genômica de rotina, sem avaliação clássica **[trecho de busca do relatório MAPA–INIA]** | Churra: leite, proteína e úbere; Manchega: proteína com peso econômico um pouco acima da gordura ([Ramón et al. 2010](https://doi.org/10.3168/jds.2009-2787)) |
| **Sarda e Comisana, Itália** (Asso.Na.Pa., AGRIS, AARS) | 161.711 ovelhas em controle oficial no país (2020–2021) | AT e AC; ajuste por comprimento da ordenha e por idade × ordem × mês de parto (Sarda, só título) | Sarda: avaliação nacional divulgada em novembro de 2025, modelo não publicado ([Asso.Na.Pa.](https://www.assonapa.it/news)); Comisana: núcleos fechados em Asciano, avaliação de rotina para leite ([Cortellari et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9597836)) | Sarda: índices genômicos anunciados em 2020 como meta, não confirmados **[trecho de busca]** | Sarda: leite, qualidade, úbere e prolificidade como objetivos; fórmula não encontrada |
| **Grécia** (Karagouniko, Chios, Lacaune) | 56.798 ovinos em controle em 1999; Karagouniko com 15.467 controladas em 278 rebanhos; Chios pura com menos de 7 mil animais ([Georgoudis e Ligda](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-3-Bella/Georgoudis.pdf)) | Lacaune: ordenha exclusiva com pelo menos 3 controles | Chios: índice de mérito total (1999); Lacaune: modelo de lactação por REML em estudo conjunto com a França | Pesquisa (Chios, painel de 960 SNPs) | Avaliação conjunta Lacaune Grécia–França viável (r_g de 0,86 no leite) ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194)) |
| **Brasil** | cerca de 6.900 matrizes, 28 produtores e 840 mil L/ano (2015) | Nenhuma regra oficial | Nenhuma avaliação | Nenhuma | Registro genealógico da ARCO, sem leite |

Quatro escolhas separam esses programas. A primeira é a **lactação de referência**: a França usa a TMM da safra, a Assaf 150 dias nas avaliações genômicas, e a Latxa um leite padronizado de comprimento não confirmado. A segunda é o **modelo**: a França documenta repetibilidade com variância heterogênea e grupos de pais desconhecidos, os demais citam "BLUP" sem detalhe, e o dia de controle com regressão aleatória ficou na pesquisa. A terceira é a **genômica**: rotina na Lacaune (2015), na ROLP (2017), na Assaf (2018) e na Manchega; pesquisa na Latxa, na Churra e na Sarda; ausente na Grécia. A quarta é o **índice**: o ISOL dá metade do peso a células e úbere, a ROLP pesa pouco as células, a Latxa daria metade ao volume de leite, e o programa alemão do East Friesian não pesa o leite. Fora desse grupo, não foi encontrado programa nacional em Israel, onde a Improved Awassi de um rebanho de pesquisa teve herdabilidade de 0,10 para a lactação ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0301622601002391)) **[trecho de busca]**; nos EUA, nenhuma organização mantinha pedigree ou avaliação de ovinos leiteiros em 2017, e o Canadá começava com a GenOvis ([ADSA 2017](https://m.adsa.org/2017/abs/t/69816)) **[trecho de busca]**; e a Nova Zelândia tem avaliações de rebanho, sem programa nacional ([Marshall et al. 2023](https://doi.org/10.3390/ani13030349)).

### Brasil: genética de poucas importações, sem controle oficial e sem avaliação

A base genética brasileira vem de poucas importações. Em 1984, uma pequena importação de Lacaune para Minas Gerais não se expandiu. Em **1992**, a Cabanha Dedo Verde, de Viamão (RS), importou sêmen e animais Lacaune da França, e "até o ano de 2007 o estabelecimento detinha 100% da genética ovina selecionada para produção leiteira no Brasil", enquanto a entrada de material genético europeu ficou impedida por quase vinte anos por razões sanitárias. Vieram depois embriões de East Friesian da Austrália (2007), animais de East Friesian do Uruguai (2008), sêmen de East Friesian da Nova Zelândia (2010) e, em **2012**, sêmen de Lacaune da França em quantidade significativa ([Rossi, Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/983050/1/CNPC2009Producao.pdf); [Bianchi et al., Embrapa 2016](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1073171/1/CNPC2016Caracterizacaodossistemas.pdf)). O arquivo da Embrapa de Rossi traz "2009" no nome, mas cita fatos de 2012, e a data de redação é posterior.

O levantamento de 2015, com visitas a todos os estados com produção comercial, contou **28 produtores, 6.900 matrizes, 24 laticínios e 840 mil litros por ano**: 2.000 matrizes e 270 mil L no RS, 2.400 e 315 mil L em SC (maior efetivo estadual, com dois produtores acima de 600 matrizes), 500 e 15 mil L no PR, 600 e 60 mil L em SP, 350 e 45 mil L no RJ, 950 e 130 mil L em MG e 100 e 5 mil L no DF. Mais de 60% das propriedades tinham menos de 10 ha, o rebanho médio era de até 120 matrizes e a produção típica de 15 mil L/ano; 27 propriedades criavam Lacaune (21 só Lacaune e 6 com East Friesian), e a atividade era descrita como "incipiente" ([Bianchi et al., Embrapa 2016](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1073171/1/CNPC2016Caracterizacaodossistemas.pdf); [Figueira et al. 2018](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1093280/1/CNPC2018Producao.pdf)). A média de 840.000/6.900 = **121,7 L por matriz por ano** mistura matrizes secas e em lactação e serve só como ordem de grandeza **[conferido numericamente]**. Não há dado mais recente com fonte.

As instituições existem, mas nenhuma avalia leite de ovelha. A ARCO mantém o registro genealógico da Lacaune e da East Friesian, com livro aberto para a Lacaune nas variedades naturalmente coloridas, e o regulamento trata de registro (PO, PS, PC), sem controle leiteiro nem avaliação genética ([ARCO, Regulamento do Registro Genealógico](https://www.arcoovinos.com.br/ArquivosIndividuais/GetPDF/20)). A Associação Brasileira de Criadores de Ovinos Leiteiros (ABCOL) aparece como parceira do levantamento de 2015, sem programa de controle encontrado. O MAPA autoriza provas zootécnicas de controle leiteiro e de avaliação genética ([gov.br](https://www.gov.br/pt-br/servicos/autorizar-registro-de-provas-zootecnicas)), mas nenhuma prova de ovinos leiteiros foi encontrada. O programa de controle leiteiro da ABCZ é de bovinos, o GENECOC da Embrapa é de caprinos e ovinos de corte, e o Capragene é de cabras. Uma notícia da Embrapa sobre a Câmara Setorial diz que importar genética leiteira tem procedimentos complicados e cita a intenção de uma futura equação de predição genômica ([Embrapa](https://www.embrapa.br/en/busca-de-noticias/-/noticia/102901006/camara-setorial-debate-desafios-para-melhoramento-genetico-de-caprinos-e-ovinos)) **[trecho de busca]**. A pesquisa acadêmica soma o ensaio de Ticiani et al., o estudo com ITU em 367 Lacaune, uma dissertação da UFLA sobre curvas e uma tese da UFRGS sobre mastite subclínica com 315 amostras **[trechos de busca]**; o estudo com ITU estimou herdabilidades de parâmetros da curva, mas nenhuma fonte lida publica herdabilidade da produção de leite de ovelhas brasileiras. Com essa base, uma avaliação nos moldes franceses não é possível hoje, e o caminho realista é a combinação, nos rebanhos, de registros completos no padrão da ICAR, sêmen de carneiros com EBV publicado e troca de carneiros entre rebanhos, até que haja dados para uma avaliação conjunta com a população de origem, como a que a Grécia testou com a França **[proposta deste relatório]**.

## Indicadores e metas por categoria: a França dá referências, não metas brasileiras

### Os indicadores do rebanho e como calculá-los

As definições abaixo seguem a ICAR quando ela define (lactação, produção média diária), o Penn State Extension para prolificidade e taxa de cordeiros ([Penn State](https://extension.psu.edu/review-your-sheep-records)) e a IN 76 para o tanque; o restante são definições operacionais de uso corrente, adotadas aqui porque nenhuma norma brasileira as fixa para ovinos **[proposta deste relatório]**. O app deve mostrar sempre o numerador e o denominador, para permitir o intervalo de confiança.

```
Produção
  TMM (Fleischmann, do desmame à secagem) ou TMY (do parto à secagem): declarar qual e o comprimento
  Leite por dia de ordenha = TMM / dias de ordenha exclusiva                kg = L × 1,036
  Leite por ovelha presente por dia = leite do período / (ovelhas presentes × dias do período)
  Gordura e proteína (kg) = Fleischmann aplicado a leite × teor de cada controle
  Persistência = leite dos dias 101–164 / leite dos dias 35–100 (definição neozelandesa; declarar)
  Desvio da ovelha = TMM − média das contemporâneas (mesma ordem de parto, estação e sistema de mamada)
Células
  SCS do controle = log₂(CCS/100.000) + 3;  média geométrica da ovelha = 100.000 × 2^(SCS médio − 3)
  Classes de Heddi et al.: < 55 mil; 55–110 mil; 110–235 mil; 235–795 mil; > 795 mil células/mL
  Tanque (IN 76): média geométrica trimestral; CCS ≤ 500 mil/mL e contagem padrão em placas ≤ 300 mil UFC/mL
Reprodução
  Fertilidade = ovelhas paridas / ovelhas expostas (cobertas ou inseminadas)
  Prolificidade = cordeiros nascidos / ovelhas paridas
  Taxa de cordeiros = cordeiros nascidos / ovelhas expostas (mistura fertilidade e prolificidade)
  Sucesso da IA = ovelhas que pariram na data compatível com a IA / ovelhas inseminadas
  Intervalo entre partos = data do parto n+1 − data do parto n
  Partos por ovelha por ano: declarar se é 365/IEP médio ou a média de 365/IEP de cada ovelha
  Mortalidade até o desmame = (nascidos vivos − desmamados) / nascidos vivos
  Cordeiros desmamados por ovelha exposta = fertilidade × prolificidade × (1 − mortalidade)
Saúde e rebanho
  % de ovelhas em FAMACHA 4 ou 5 por coleta; OPG transformado; mastite clínica por 100 ovelhas-ano em ordenha
  Descarte = saídas no ano / ovelhas em produção (média);  reposição = fêmeas incorporadas / ovelhas em produção
  Vida produtiva = idade ao descarte − idade ao 1º parto
Desenvolvimento
  % do peso adulto na cobertura = peso da borrega / peso médio das adultas do próprio rebanho
  Idade ao 1º parto (meses) = (data do 1º parto − nascimento) / 30,4
```

Duas definições mudam o número sem mudar o rebanho. A taxa de cordeiros mistura fertilidade e prolificidade e esconde a causa de uma queda. E "partos por ovelha por ano" depende da conta: na fazenda espanhola de Pesantez-Pacheco et al., 365 dividido pelo intervalo médio dá 1,29 e 1,21, enquanto os valores publicados são 1,42 e 1,30 ([Pesantez-Pacheco et al. 2018](https://doi.org/10.1017/s175173111700369x)) **[conferido numericamente]**; com desvio-padrão de 50 dias nos intervalos, a média de 365/IEP de cada ovelha fica acima de 365 dividido pelo intervalo médio, pela desigualdade de Jensen **[inferência]**. Para a composição, o indicador de decisão é quilograma de sólidos e não o teor: no ensaio catarinense, a Lacaune teve teores menores e mais gordura e proteína por dia que a East Friesian ([Ticiani et al. 2013](https://doi.org/10.1590/s0103-84782013000900018)). Os teores sobem ao longo da lactação (na Lacaune, de 6,05% de gordura e 4,91% de proteína entre os dias 48 e 55 para 8,33% e 6,21% entre os dias 174 e 192), e o rendimento de queijo caiu de 16,03% para 15,09% com o aumento das células num estudo de Wisconsin ([Wendorff, slides](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/MILK-COMPOSITION-AND-CHEESE-YIELD-13twv28.pdf)), o que torna o controle de células também um controle de rendimento. Em amostras neozelandesas, o leite de ovelha teve em média 18,1% de sólidos, 6,7% de gordura e 6,2% de proteína ([AgResearch](https://www.agresearch.co.nz/assets/Uploads/NZ_Sheep_Milk_Nutritional_Composition.pdf)).

### Metas por categoria: o que tem fonte e o que é proposta

As referências francesas e espanholas vêm de rebanhos selecionadores e de sistemas intensivos, e servem de teto, não de média brasileira. Onde não há referência com fonte, a meta é **relativa**: desvio em relação às contemporâneas, tendência com intervalo de confiança ou comparação com o próprio histórico.

| Categoria | Indicador | Meta ou referência | Origem |
|---|---|---|---|
| Borregas | Peso à cobertura | 60% a 65% do peso médio das adultas medido no próprio rebanho; com Lacaune adulta de 70 a 80 kg, cerca de 42 a 52 kg | 60%: [AHDB](https://ahdb.org.uk/knowledge-library/selecting-ewe-lambs-for-breeding) **[trecho de busca]**; peso adulto: [Figueira et al. 2018](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1093280/1/CNPC2018Producao.pdf); faixa: **proposta** |
| Borregas | Peso à cobertura (evidência de fertilidade) | Borregas cobertas com cerca de 47,9 kg tiveram fertilidade 28% maior e taxa de cordeiros 59% maior que as cobertas com 44,9 kg; os autores sugerem 50 a 55 kg | estudo neozelandês sem fonte primária identificada **[trecho de busca]**; raças de corte |
| Borregas | Idade à cobertura e ao 1º parto | Sem referência verificada para Lacaune ou East Friesian; registrar e alertar quando o 1º parto passar de 18 meses | cobertura aos 7 a 10 meses em merino e cruzadas ([MLA](https://www.mla.com.au/globalassets/mla-corporate/research-and-development/final-reports/2014/e.pds.1415-final-report.pdf)) **[trecho de busca]**; alerta: **proposta** |
| Borregas | Fertilidade | Acompanhar separada da das adultas: h² de 0,04 e correlação genética de só 0,55 com a fertilidade adulta | [David et al. 2008](https://doi.org/10.3168/jds.2008-1113) **[resumo]** |
| Borregas | Mérito genético | Média dos EBVs dos pais acima da média do rebanho; reposição preferencial de filhas de carneiros importados ou trocados com EBV | **proposta**, pela lógica do Exemplo 5 |
| Borregas | Mortalidade até o desmame | Queda ano a ano julgada com intervalo exato | **proposta**; nenhuma referência ovina leiteira com fonte |
| Primíparas | TMM | Desvio em relação às contemporâneas ≥ 0; referências francesas de 272 a 288 L em 164 a 165 dias (média do controle oficial da Lacaune, 2009–2010) e 330 L em 173 dias (rebanhos selecionadores, todas as ordens) | desvio: **proposta**; [Astruc et al. 2010](https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-14-Riga/Astruc.pdf); [Larroque 2011](https://docs.eaap.org/2011/S49_Larroque.pdf); [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf) |
| Primíparas | Células | Média geométrica e fração de controles nas classes acima de 235 mil em queda; a classe de pico acima de 1 milhão teve risco de descarte 20% maior | classes: [Heddi et al. 2026](https://doi.org/10.3390/foods15091527); risco: [Riggio et al. 2009](https://doi.org/10.3168/jds.2008-1316); meta: **proposta** |
| Primíparas | Úbere | Pontuar profundidade, fissura e ângulo dos tetos; evitar reposição de filhas de carneiros que aprofundam o úbere | notas: [Marie-Etancelin et al. 2005](https://doi.org/10.1016/j.livprodsci.2005.04.005); regra: **proposta** |
| Primíparas | Nova cobertura na contraestação | Cobertura aos 90 dias pós-parto teve tendência de melhor parição que aos 75 (80,0% contra 64,1%) | [Goulet e Castonguay 2002](https://doi.org/10.4141/a01-098) (P = 0,11) |
| Adultas | Fertilidade, prolificidade e IA | Referências: 94,9% de fertilidade, 1,56 cordeiro por parto e IA em 86,6% das ovelhas (rebanhos selecionadores Lacaune) | [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf) |
| Adultas | Ritmo de partos | 283 a 302 dias entre partos e 1,30 a 1,42 parto por ano em sistemas acelerados; uma lactação de 180 dias por ano no sistema tradicional | [Pesantez-Pacheco et al. 2018](https://doi.org/10.1017/s175173111700369x); [Kochendoerfer e Thonney 2017](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/Kochendoerfer-CNC2017-2j84o4i.pdf) |
| Adultas | Composição | 75 g/L de gordura e 56 g/L de proteína (referência de 2019) | [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf) |
| Adultas | Descarte e reposição | Renovação de 28% na Lacaune francesa; 35% a 43% de descarte em sistema espanhol de alta exigência | [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf); [Pesantez-Pacheco et al. 2018](https://doi.org/10.1017/s175173111700369x) |
| Adultas | Produção ao longo da vida | Descartar pela MPPA (Exemplo 5), não pela idade | **proposta** |
| Adultas | Verminose | Fração em FAMACHA 4 ou 5 por coleta em queda; separar como matrizes as que ficam um ano em F1 e descartar as que exigem vermífugo frequente | [Embrapa, Circular 52](https://www.infoteca.cnptia.embrapa.br/bitstream/doc/37734/1/Circular52.pdf); meta: **proposta** |
| Adultas | Tanque | CCS até 500 mil/mL e contagem padrão em placas até 300 mil UFC/mL, em média geométrica trimestral | [IN 76/2018](https://wikisda.agricultura.gov.br/dipoa_baselegal/in_76-2018_rtiq_leite.pdf), aplicada "no que couber" |
| Carneiros | Scrapie | ARR/ARR para carneiros de reposição e de IA, como na Lacaune desde 2003, ponderando o risco de scrapie atípico | [UPRA 2022](https://www.race-lacaune.fr/uploads/2022/01/La-race-Lacaune-Lait-ANGLAIS.pdf); [Acín et al. 2021](https://doi.org/10.3390/ani11030691) |
| Carneiros | Mérito do sêmen importado | ISOL de pelo menos 100 pontos, o limiar francês para reprodutores; preferir EBVs por característica alinhados ao pagamento do leite | [Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515); alinhamento: **proposta** |
| Carneiros | Confiabilidade para uso intenso | Carneiros "confirmés" (progênie a partir de 2,5 anos) ou com cerca de 40 filhas em 5 a 10 rebanhos (REL de 0,68 a 0,70 no Exemplo 4); carneiros locais com filhas em pelo menos 3 rebanhos parceiros | [Astruc et al. 2016](https://doi.org/10.20870/productions-animales.2016.29.1.2515); [CDEO 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf); 3 rebanhos: **proposta** |
| Carneiros | Endogamia | F de cada acasalamento planejado até 6,25%; ΔF do rebanho até 1% por geração (Ne ≥ 50) | 6,25%: **proposta**; 1%: recomendação atribuída à FAO por fontes secundárias (relatório de caprinos) |
| Carneiros | Paternidade na monta natural | Pelo menos 10 dias entre dois carneiros no mesmo lote, ou teste de DNA | [Réussir](https://www.reussir.fr/patre/les-trois-formules-du-controle-de-performances) **[trecho de busca]** |
| Carneiros | Verminose | Registrar OPG e FAMACHA dos carneiros jovens; preferir sêmen de carneiros indexados para resistência quando houver | indexação na ROLP ([CDEO 2023](https://smarterproject.eu/wp-content/uploads/2023/08/CDEO_23_06_30_SMARTER_MS22_Definition-of-efficiency-and-resilience-traits-resul.pdf)); regra: **proposta** |

Nenhuma fonte lida fixa metas de fertilidade ou de qualidade de sêmen de carneiros, número de ovelhas por carneiro na monta natural, idade ao primeiro parto de Lacaune ou East Friesian, mortalidade de cordeiros em sistemas leiteiros ou metas de células por categoria. Esses indicadores devem aparecer no app como medidos e sem meta até que o histórico do rebanho forneça a referência.

## Rebanhos de 20 a 1.000 ovelhas ganham precisão comparando, encolhendo e conectando

### Não estimar parâmetros e comparar com contemporâneas

A primeira regra é a dos relatórios anteriores: usar parâmetros da literatura, e não estimá-los com os dados do rebanho. As seções acima dão os valores com fonte para a ovelha: TMM com h² de 0,24 a 0,30 e σa de 32 a 35 L na escala francesa, repetibilidade da lactação de 0,41 a 0,50, teor de gordura de 0,34 a 0,50, teor de proteína de 0,45 a 0,62, escore de células de 0,13 a 0,15, fertilidade de 0,04 a 0,05, notas de úbere de 0,16 a 0,33, fluxo de leite de 0,54, OPG de 0,14 a 0,33 e longevidade de 0,07 a 0,11. Todo número calculado pelo app deve vir com o parâmetro usado e, quando a fonte deixa dúvida, com dois valores.

A segunda regra é comparar cada ovelha com as **contemporâneas**. Os modelos lidos convergem nos efeitos que definem um grupo justo: ano e estação de parto, ordem de parto, sistema de mamada (TMM e TMY não se misturam), duração da mamada, intervalo do parto ao primeiro controle, comprimento da ordenha, número de cordeiros e ordenha uma ou duas vezes ao dia ([Larroque 2011](https://docs.eaap.org/2011/S49_Larroque.pdf); [Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194); [Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023); [Marshall et al. 2023](https://doi.org/10.3390/ani13030349)). Num rebanho de 20 a 100 ovelhas, rebanho × ano × ordem de parto deixa grupos de poucas ovelhas, e a saída é juntar as ordens 2 em diante, agrupar a estação por trimestre e usar as covariáveis no lugar de classes; quando o rebanho roda um modelo, o grupo entra como aleatório, como o Capragene fez com as cabras Alpinas **[proposta deste relatório]**. A ICAR não fixa número mínimo de controles, mas o estudo grego exigiu pelo menos três controles válidos acima de 0,2 kg ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194)), regra simples que o app pode adotar e declarar. O passo a passo que leva do registro ao indicador é o seguinte **[proposta deste relatório]**:

```
1. Registrar: parto (data, ordem, nº e sexo dos cordeiros), separação definitiva dos cordeiros (data),
   controles (data, ordenha medida, método AT ou AC, tanque das duas ordenhas), secagem (data e causa),
   pai e mãe, carneiro do lote na monta natural
2. Validar: 1º controle até (mamada + 52) dias do parto; controles a no máximo 70 dias; leite ≥ 200 g
   (150 g no Anexo 1 da ICAR); pelo menos 3 controles válidos; marcar lactações incompletas
3. Calcular a TMM por Fleischmann (Exemplo 1), gordura e proteína em kg, SCS e média geométrica das células
4. Calcular o desvio de cada ovelha em relação às contemporâneas (ano e estação, 1ª ou 2ª+ ordem, mesmo
   sistema de mamada), ou rodar o modelo de lactação com covariáveis nos rebanhos maiores
5. MPPA para decidir descarte; EBV por índice com o EBV do pai para decidir reposição (Exemplo 5)
6. Índice declarado e coerente com o pagamento do leite (Exemplo 3)
7. Taxas reprodutivas e sanitárias com intervalo de confiança, em janela móvel de 12 meses (Exemplo 6)
8. Acasalamentos pelo F de cada par e Ne do rebanho (Exemplo 7); ganho genético pela tendência dos EBVs
   por ano de nascimento e pelo uso de carneiros importados ou trocados (Exemplo 8)
```

### Exemplo 5: MPPA e índice de ovelhas com o EBV do pai

Como nos relatórios anteriores, duas contas respondem a duas perguntas. A **MPPA** prevê a próxima lactação, inclui o ambiente permanente e serve para descarte; o **EBV por índice de seleção** combina os registros da ovelha com o EBV do pai e serve para escolher de quem guardar filhas. Os programas ovinos publicam o EBV do carneiro (e não a PTA, metade dele), e o índice abaixo usa essa forma **[fórmulas padrão de índice de seleção; conferidas numericamente]**:

```
MPPA = μ + [n·r / (1 + (n − 1)·r)]·(ȳ − μ)             n lactações, repetibilidade r
Índice:  x₁ = ȳ − μ (desvio médio das n TMM em relação às contemporâneas);  x₂ = EBV do pai, confiabilidade REL
  P = [ σ²P·(r + (1 − r)/n)    REL·σ²a/2 ]      g = [ σ²a       ]      b = P⁻¹ g
      [ REL·σ²a/2              REL·σ²a   ]          [ REL·σ²a/2 ]
  EBV da ovelha = b'x ;   REL da ovelha = b'g / σ²a
  Pai sem avaliação: b = n·h² / [1 + (n − 1)·r]  (só registros próprios)
Pressupostos: o EBV do pai não contém os registros desta ovelha; a mãe não entra; e o EBV do pai está na base e
na escala do rebanho (um EBV francês precisa ser expresso em relação à média dos carneiros usados no rebanho e
multiplicado pela correlação genética entre os ambientes)
```

O exemplo usa seis ovelhas com desvios de TMM fictícios, h² = 0,30, σP = 60 L (σa = 32,9 L, próximo da escala francesa) e as duas repetibilidades com fonte, 0,41 e 0,50. O1 e O4 são filhas de carneiros importados com REL alta, O3 é filha de um carneiro trocado com outro rebanho, O2 é filha de um carneiro local sem avaliação **[conferido numericamente; dados fictícios]**.

| Ovelha | Desvios de TMM (L) | n | MPPA (r 0,41 / 0,50) | EBV do pai (REL) | Pesos b, r = 0,41 (ovelha; pai) | EBV da ovelha (r 0,41 / 0,50) | REL (r 0,41) |
|---|---|---|---|---|---|---|---|
| O1 | +40 | 1 | +16,4 / +20,0 | +30 (0,90), importado | 0,249; 0,375 | **+21,2 / +21,2** | 0,42 |
| O2 | +25, +15, +20 | 3 | +13,5 / +15,0 | sem EBV, local | 0,495 | +9,9 / +9,0 | 0,50 |
| O3 | +55, +5 | 2 | +17,4 / +20,0 | +10 (0,40), trocado | 0,400; 0,300 | +15,0 / +14,4 | 0,46 |
| O4 | −20 | 1 | −8,2 / −10,0 | +40 (0,85), importado | 0,252; 0,374 | **+9,9 / +9,9** | 0,41 |
| O5 | −30, −15, −25, −20 | 4 | −16,5 / −18,0 | +5 (0,40) | 0,512; 0,244 | −10,3 / −8,8 | 0,56 |
| O6 | +30, +35 | 2 | **+18,9 / +21,7** | −20 (0,60) | 0,386; 0,307 | +6,4 / +5,4 | 0,48 |

As duas ordens divergem, e ambas estão certas para o seu uso. Pela MPPA, O6 lidera e deve continuar no rebanho; pelo EBV, ela cai para o quinto lugar, porque o pai tem EBV de −20 L, e as filhas dela não são a melhor reposição. A **O4, com uma única lactação 20 L abaixo das contemporâneas, empata com a O2 (r = 0,41) ou passa à frente dela (r = 0,50)**, porque com uma lactação o índice dá peso de 0,25 ao desvio da ovelha e de 0,37 ao EBV do pai, enquanto a O2, com três boas lactações, não tem pai avaliado. A repetibilidade mexe pouco no EBV e mais na MPPA: com r = 0,50, O1 e O3 empatam na MPPA (+20,0). As confiabilidades de 0,41 a 0,56 lembram que mesmo uma ovelha com quatro lactações é mal conhecida. A regra prática é descartar pela MPPA e guardar filhas pelo EBV, e é aqui que o carneiro importado ou trocado com EBV muda o rebanho: ele dá às filhas uma informação que nenhuma lactação isolada dá.

### Exemplo 6: taxas com 40 ovelhas precisam de intervalo exato

Num rebanho de 40 ovelhas, cada ovelha vale 2,5 pontos percentuais em qualquer taxa. O intervalo de Wald falha com n pequeno ou taxa extrema; os de Wilson e exato (Clopper-Pearson) são os indicados ([Wilson 1927](https://doi.org/10.1080/01621459.1927.10502953)), e a recomendação de Brown, Cai e DasGupta contra o Wald foi conferida só pela referência ([Brown et al. 2001](https://doi.org/10.1214/ss/1009213286)) **[fórmulas padrão; conferidas numericamente]**.

| Caso | x/n | Taxa | Wald 95% | Wilson 95% | Exato 95% |
|---|---|---|---|---|---|
| Fertilidade: paridas sobre expostas | 36/40 | 90,0% | 80,7% a 99,3% | 76,9% a 96,0% | 76,3% a 97,2% |
| Prenhez à IA com sêmen importado | 13/25 | 52,0% | 32,4% a 71,6% | 33,5% a 70,0% | 31,3% a 72,2% |
| Mortalidade de cordeiros até o desmame | 5/50 | 10,0% | 1,7% a 18,3% | 4,3% a 21,4% | 3,3% a 21,8% |
| Ovelhas com algum controle acima de 1 milhão de células/mL | 7/40 | 17,5% | 5,7% a 29,3% | 8,7% a 31,9% | 7,3% a 32,8% |
| FAMACHA 4 ou 5 numa coleta | 5/40 | 12,5% | 2,3% a 22,7% | 5,5% a 26,1% | 4,2% a 26,8% |
| Descarte no ano | 11/40 | 27,5% | 13,7% a 41,3% | 16,1% a 42,8% | 14,6% a 43,9% |
| Abortos | 0/40 | 0,0% | 0 a 0 (impossível) | 0 a 8,8% | 0 a 8,8% |

O intervalo de Wilson para a mortalidade reproduz a conta das notas (4,3% a 21,4%, contra 1,7% a 18,3% do Wald). A fertilidade de 90% tem intervalo de 76% a 97%, que contém os 94,9% da Lacaune francesa: o rebanho não pode ser declarado pior. A prenhez de 52% à IA tem intervalo de 31% a 72%, que contém os 65% de referência: uma estação ruim de IA não prova que o sêmen ou o protocolo falharam. Comparar anos exige mais dados do que o rebanho tem. Para detectar, com 80% de poder e 5% de significância, uma fertilidade de 90% contra 95% são precisas **435 ovelhas por ano** (poder de 13% com 40); mortalidade de 10% contra 20% exige 199 cordeiros por ano (poder de 29% com 50); prenhez à IA de 52% contra 65% exige 225 ovelhas (poder de 15% com 25); e só uma queda grande, de 25% para 10% de ovelhas com células altas, chega a 42% de poder com 40 ovelhas (seriam precisas 100) **[conferido numericamente]**. A prolificidade, que é uma média, se comporta melhor: 36 partos com 18 simples, 16 duplos e 2 triplos dão **1,56 cordeiro por parto** (desvio-padrão de 0,61; intervalo de 1,35 a 1,76), e, com 90% de fertilidade e 10% de mortalidade, **1,26 cordeiro desmamado por ovelha exposta**, contra 1,48 nascidos por ovelha exposta na referência francesa, que não desconta mortalidade **[conferido numericamente]**. Cordeiros da mesma ninhada não são independentes, e o intervalo calculado por cordeiro fica estreito demais. Para enxergar tendência com poucos dados, valem as janelas móveis de 12 meses e o CUSUM descritos no relatório de caprinos; cartas de controle para células de tanque foram aplicadas em 275 rebanhos bovinos ([Lukas et al. 2005](https://doi.org/10.3168/jds.s0022-0302(05)73080-0)) **[trecho de busca]**, e nenhuma aplicação ovina foi encontrada.

### Exemplo 7: endogamia e Ne com poucos carneiros

O coeficiente de endogamia do cordeiro é metade do parentesco entre os pais, calculado pela matriz A (método tabular no relatório de corte). O rebanho fictício começa com o carneiro R1 e três ovelhas fundadoras (E1, E2, E3). R1 deixa o filho R2 e a filha F1 com E1, e as filhas F2 com E2 e F3 com E3; F4 é filha de R2 com F2 e nasceu com F = 12,5%. R3 é um carneiro comprado ou de sêmen importado, sem parentesco **[conferido numericamente]**.

| Carneiro | × E1 | × F1 | × F2 | × F3 | × F4 |
|---|---|---|---|---|---|
| R1 (fundador) | 0 | 25,00% | 25,00% | 25,00% | 25,00% |
| R2 (filho de R1 e E1) | 25,00% | 25,00% | 12,50% | 12,50% | 31,25% |
| R3 (externo) | 0 | 0 | 0 | 0 | 0 |

Ficar com o filho do carneiro da casa como substituto é a decisão que mais custa: R2 cruzado com a mãe ou com a irmã completa dá 25%, com as meias-irmãs 12,5% e com a filha endogâmica 31,25%. A mesma conta, feita para o rebanho inteiro, usa a fórmula clássica Ne = 4·Nm·Nf/(Nm + Nf) e ΔF = 1/(2·Ne) **[forma padrão, a mesma do relatório de caprinos; conferida numericamente; acasalamento ao acaso e intervalo de gerações de 4 anos como hipótese]**:

| Carneiros por geração | Ovelhas | Ne | ΔF por geração | F após 5 gerações | F após 12 anos |
|---|---|---|---|---|---|
| 1 | 30 | 3,9 | 12,9% | 49,9% | 34,0% |
| 2 | 60 | 7,7 | 6,5% | 28,4% | 18,2% |
| 3 | 100 | 11,7 | 4,3% | 19,7% | 12,3% |
| 4 | 50 | 14,8 | 3,4% | 15,8% | 9,8% |
| 5 | 200 | 19,5 | 2,6% | 12,2% | 7,5% |
| 10 | 500 | 39,2 | 1,3% | 6,2% | 3,8% |
| 13 | 1.000 | 51,3 | 0,97% | 4,8% | 2,9% |

A linha de 4 carneiros e 50 ovelhas reproduz a conta das notas (Ne de 14,8 e ΔF de 3,4%). O número de ovelhas quase não importa; o de carneiros, sim, e um rebanho de 1.000 ovelhas fechado precisaria de 13 carneiros não aparentados por geração para ficar em 1%. Duas variações mostram o que fazer. Se os 4 carneiros de um rebanho de 50 ovelhas forem usados de forma desigual (55%, 25%, 15% e 5% dos cordeiros), o número efetivo de pais cai para 1/Σp² = 2,56, o Ne para 9,8 e o ΔF sobe para **5,1%** **[forma padrão; conferido numericamente]**. E a conexão resolve o problema: um rebanho fechado com 3 carneiros e 100 ovelhas tem ΔF de 4,3%; três rebanhos desse porte trocando carneiros entre si, tratados como uma população de 9 carneiros e 300 ovelhas, ficam em **1,4%**; e um rebanho de 100 ovelhas que usa 4 carneiros locais e sêmen de 10 carneiros importados diferentes fica em **1,0%** **[conferido numericamente]**. Os carneiros importados são parentes entre si (a Lacaune tem Ne de cerca de 370), e a conta é otimista, mas a ordem de grandeza se mantém **[inferência]**. O software ENDOG calcula endogamia, parentesco médio e Ne a partir do pedigree, inclusive pelo incremento individual de endogamia ([Gutiérrez et al. 2008](https://doi.org/10.1051/gse:2008008)).

### Exemplo 8: ganho genético com sêmen importado e troca de carneiros

O exemplo compara três formas de escolher carneiros num rebanho comercial brasileiro, com σa = 33 L (escala francesa), h² = 0,30 e repetibilidade de 0,50. Para os caminhos dentro do rebanho, usa a resposta de Rendel e Robertson com dois caminhos ([Rendel e Robertson 1950](https://doi.org/10.1007/bf02986789)), na forma conferida nos relatórios anteriores; para o sêmen importado, usa a tendência realizada na França, descontada pela correlação genética de 0,86 entre a Grécia e a França, a única medida entre ambientes encontrada ([Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194)) **[conferido numericamente; hipóteses marcadas]**:

```
Dois caminhos:     ΔG/ano = (i_m·r_m + i_f·r_f)·σa / (L_m + L_f)
Carneiro escolhido: superioridade = i·r·σa ;  as filhas recebem metade
Sêmen importado contínuo:  ΔG_rebanho ≈ r_g × tendência da população de origem (σa igual nos dois ambientes)
Salto inicial:  filhas = ½ × r_g × (nível dos carneiros importados − nível dos carneiros locais)
Absorção:  G_{t+1} = G_t + ½·(R_t − G_t) ;  R_{t+1} = R_t + T·L ;  distância de equilíbrio = 2·T·L
Hipóteses: i(20%) = 1,400; i(10%) = 1,755; i(80%) = 0,350; acurácia do filho só pela mãe com 2 lactações
= ½ × 0,632 = 0,316; média dos pais com REL 0,40 cada = 0,447; L_m = 3 e L_f = 4 anos
```

| Cenário | Superioridade do carneiro | Filhas | ΔG por ano | Ganho em 15 anos |
|---|---|---|---|---|
| Rebanho fechado: carneiro filho das 20% melhores ovelhas (r = 0,316) | 14,6 L | +7,3 L | 2,58 L (teórico) | 38,7 L |
| Troca entre 3 rebanhos com BLUP conjunto: carneiro entre os 10% melhores (r = 0,447) | 25,9 L | +12,9 L | 4,28 L (teórico) | 64,1 L |
| Sêmen importado contínuo, carneiros 55 L acima dos locais (hipótese já descontada pela correlação, dentro dos 46 a 65 L calculados abaixo) | 55 L | **+27,5 L** | 3,27 a 4,64 L (tendência francesa de 3,8 a 5,4 L × 0,86) | **81,0 L** |

O salto inicial do sêmen importado depende do atraso genético do rebanho, que não foi medido no Brasil. Se o rebanho não renovou genética desde a importação de 2012 e a França ganhou de 3,8 a 5,4 L por ano, o atraso em 2026 é de 53 a 76 L, ou de **46 a 65 L** depois de descontar a correlação de 0,86, e cada filha do carneiro importado ganha **de 23 a 33 L por lactação** em relação às do carneiro local **[conferido numericamente; inferência a partir de hipóteses]**. Com uso contínuo, o rebanho absorve a distância por gerações e depois acompanha a tendência de origem; partindo de 55 L de distância e com a tendência de 3,70 L/ano (4,3 L/ano, valor dentro da faixa francesa, × 0,86), o rebanho ganha 27,5, 48,2, 65,5 e 81,0 L nas quatro primeiras gerações de 3,75 anos, e a distância para os carneiros importados se estabiliza em 2·T·L = 27,7 L, que é a defasagem normal entre ovelhas e os carneiros que as cobrem **[conferido numericamente]**.

Três ressalvas pesam na leitura. Os números do rebanho fechado e da troca são tetos teóricos: Rendel e Robertson ignoram endogamia, poucos candidatos e erros de registro, e o relatório de caprinos mostrou que o realizado no Brasil ficou muito abaixo do teórico; o número do sêmen importado, ao contrário, vem de uma tendência realizada. A escala é francesa: se o desvio genético no Brasil for proporcional a uma produção média menor, todos os litros caem na mesma proporção, e com metade da escala o ganho anual seria de 1,85 L e o salto das filhas de 13,8 L **[conferido numericamente]**. E a tendência importada é a de um objetivo que dá metade do peso a células e úbere e não seleciona volume diretamente, de modo que o produtor importa também melhoria funcional, e não só litros. O caso grego mostra a mesma lógica com dados reais de pais: com acesso aos 10 melhores pais franceses, o ganho previsto para a Lacaune grega passou de 37,62 para 82,80 kg por rodada de seleção ([Vouraki et al. 2024, slides](https://docs.eaap.org/2024/m221/S02T11.pdf)). A melhor estratégia doméstica combina as duas fontes: sêmen importado para o salto e a âncora de comparação, e troca de carneiros entre rebanhos para dar avaliação aos carneiros locais (Exemplo 4) e conter a endogamia (Exemplo 7).

### BLUP e genômica dentro do rebanho: úteis para ranquear, limitados para comparar

Num rebanho de 100 a 1.000 ovelhas com controle mensal, o modelo de lactação do estudo greco-francês, com variâncias da literatura, grupo de contemporâneas aleatório e as covariáveis ovinas, entrega EBVs que ordenam as ovelhas da casa usando todo o pedigree. O Exemplo 4 mostrou o limite: sem carneiros em comum com outros rebanhos, esses EBVs só se comparam entre si, e carneiros de monta natural sem filhas fora do rebanho ficam com confiabilidade baixa. O que ancora o rebanho são os carneiros importados com EBV publicado, cujas filhas servem de contemporâneas de referência, e a troca de carneiros com rebanhos que registram da mesma forma. O ajuste de variância heterogênea do Exemplo 2 só passa a importar quando rebanhos de manejo diferente são analisados juntos, como num grupo de troca; aí, padronizar os desvios pelo desvio-padrão de cada rebanho é o mínimo **[proposta deste relatório]**. O modelo de dia de controle com regressão aleatória não se justifica nesse porte (Bulgária).

A genômica dentro do rebanho não se paga hoje. Nem a França, com referência de mais de 10 mil carneiros, acha lucrativo genotipar fêmeas aos custos atuais ([De Laet e Raoul 2026](https://doi.org/10.3168/jds.2025-27638)), e no Brasil não há população de referência de ovinos leiteiros. O uso mais barato do DNA é verificar a paternidade quando há mais de um carneiro no lote, porque todo o resto depende do pedigree, e genotipar o PRNP dos carneiros de reposição. A genômica chega ao rebanho brasileiro pelo EBV genômico dos carneiros importados; um chip próprio só fará sentido quando houver uma referência conectada, por exemplo numa avaliação conjunta com a população de origem **[proposta deste relatório]**.

## Conclusão

A avaliação genética de ovelhas leiteiras mais avançada do mundo não foi construída sobre registros mais densos, e sim sobre registros mais baratos. A França controla uma ordenha por visita, amostra a composição só no meio da lactação, deixa mais da metade das ovelhas no método D e compensa o ruído no modelo, com repetibilidade, variâncias heterogêneas e grupos de pais desconhecidos, e depois com o ssGBLUP. O que ela não abre mão é da completude (todas as ovelhas ordenhadas, todas as datas de desmame e secagem) e da conexão (85% de IA no núcleo, 40 filhas em 5 a 10 rebanhos por carneiro). Para o Brasil, isso inverte a pergunta habitual: o gargalo não é o modelo nem o custo do controle, e sim uma base genética de poucas importações, menos de 7 mil matrizes em 2015 e nenhum programa que espalhe as filhas de um carneiro por vários rebanhos. Os exemplos mostram que a mesma decisão (trazer sêmen de carneiros avaliados e trocar carneiros entre rebanhos) resolve três problemas de uma vez: dá o maior ganho genético disponível, cria a âncora que torna comparáveis as ovelhas de rebanhos diferentes e segura a endogamia abaixo de 1,5% por geração em rebanhos que, fechados, passariam de 4%.

Duas ressalvas mudam a forma de usar essa conexão. O sêmen francês traz o objetivo francês: o ISOL dá metade do peso a células e úbere e não seleciona volume, e o SOCS2 mostra que, sem esse contrapeso, a seleção por leite eleva as células sem que ninguém perceba. Um app que mostre só um índice pronto esconde essa escolha; ele deve mostrar EBVs por característica e deixar o índice ligado à forma como o laticínio paga. E a correlação de 0,86 entre Grécia e França é o melhor palpite disponível para o desconto ambiental, não uma medida brasileira. O caso grego, porém, indica o próximo passo: com só seis pais em comum, a avaliação conjunta com a França foi viável. Rebanhos brasileiros que registrarem lactações pela regra da ICAR, com a data de separação dos cordeiros, o carneiro de cada parto e o EBV de origem de cada sêmen, formarão em poucos anos exatamente os dados que uma avaliação conjunta com a população de origem exigiria, e que hoje não existem.

## O que o rebanho ovino leiteiro precisa registrar no SeabraApp

Quatro regras valem para todos os dados. A primeira, da ICAR, é controlar **todas as ovelhas ordenhadas** em cada controle, para evitar viés de amostragem. A segunda é registrar **datas**, e não idades ou dias em lactação calculados, para que o app derive a duração da mamada, os dias do parto ao primeiro controle, o intervalo entre partos e a idade ao parto. A terceira é guardar, para cada carneiro importado, o **EBV de origem com a data, a base e a confiabilidade**, porque é ele que ancora o rebanho. A quarta é exportar no formato da ICAR, porque é por ele que um rebanho entra numa avaliação conjunta futura.

| Dado | Para que serve | Mínimo necessário |
|---|---|---|
| Identificação | ligar controles, pedigree, partos e genótipos | brinco ou RFID, raça (Lacaune, East Friesian ou cruza com composição), sexo, data e tipo de nascimento, origem (nascida, comprada, de embrião importado) |
| Pedigree | matriz A, EBV do pai no índice, F por acasalamento, Ne | pai (código do carneiro ou do sêmen, com país e registro de origem; na monta natural, carneiro de cada lote com datas de entrada e saída, com pelo menos 10 dias entre carneiros), mãe; resultado de teste de paternidade |
| Carneiros importados e trocados | âncora de comparação, índice, conectividade | EBVs por característica, índice (ISOL ou outro), confiabilidade, data e base da avaliação, genótipo PRNP; rebanho de origem e período de uso em cada rebanho do grupo de troca |
| Parto | ordem de parto, número de cordeiros, prolificidade, aborto | data, ordem, cordeiros vivos e mortos, sexo e identificação de cada cordeiro, aborto e natimorto com data |
| Mamada | separar TMM de TMY (ICAR) e ajustar pela duração da mamada | sistema (ordenha desde o parto, mamada, mamada com ordenha parcial, separação noturna) e data da separação definitiva dos cordeiros |
| Controle leiteiro | TMM por Fleischmann, MPPA, EBV, curva | data; método (A4, AT, AC ou D); ordenha medida (manhã ou tarde); volume ou peso; no AC, volume do tanque nas duas ordenhas; ordenha uma ou duas vezes ao dia; amostras de gordura, proteína e CCS com o laboratório |
| Secagem | fechar a lactação e filtrar as anormais | data e causa |
| Reprodução | fertilidade, sucesso da IA, intervalo entre partos | cada cobertura ou IA com data e carneiro; sêmen fresco, refrigerado ou congelado; via cervical ou laparoscópica; sincronização (progestágeno, eCG); diagnóstico de gestação com data e resultado |
| Úbere e ordenha | índice de úbere, profundidade, ordenhabilidade | em 1ª lactação: profundidade, fissura ou inserção, ângulo ou posição e tamanho dos tetos, com escala e avaliador; tetos supranumerários; tempo ou fluxo de ordenha quando houver medidor |
| Saúde do úbere | SCS, média geométrica, mastite | CCS por controle; mastite clínica com data, metade do úbere e tratamento; CMT quando usado |
| Tanque | conformidade com a IN 76, tendência | CCS e contagem padrão em placas mensais do laticínio |
| Verminose | FAMACHA, OPG, tratamento seletivo, seleção de carneiros | data da coleta, OPG, grau FAMACHA, hematócrito; data e produto da última vermifugação; lote |
| Cordeiros | mortalidade, crescimento, efeito materno | peso ao nascer e ao desmame com datas; aleitamento natural ou artificial; morte com data e causa |
| Recria | metas de cobertura de borregas | peso e escore corporal à cobertura e ao parto; peso das adultas do rebanho para a porcentagem do peso adulto |
| Saídas | descarte, vida produtiva, longevidade | data, destino (venda, descarte, morte) e motivo codificado |
| Manejo | grupo de contemporâneas, interação com ambiente | lote, regime (pasto, semiconfinamento, confinamento), localização; ITU ou temperatura quando houver |
| Genótipo | paternidade, PRNP, genes de efeito maior | painel e laboratório; genótipo PRNP (códons 136, 154 e 171); SOCS2 quando disponível no painel |

## Estratégia por porte de rebanho no Brasil

A tabela traduz as evidências e os exemplos em recomendações para um país sem avaliação nacional, em que a conexão vem do sêmen importado com EBV e da troca de carneiros entre rebanhos **[proposta deste relatório, baseada nas fontes e nos exemplos acima]**.

| Porte | Registro e controle | Carneiros e conexão | Ferramentas no próprio rebanho | DNA e genômica |
|---|---|---|---|---|
| 20 a 50 ovelhas | Partos com cordeiros e data de separação; controle de uma ordenha (AT) mensal, ou pelo menos três controles espalhados (por exemplo, 40, 100 e 160 dias) com a data de secagem; células do tanque mensais | Sêmen importado com EBV em parte das ovelhas a cada estação, como âncora; carneiro de monta natural trocado com outro rebanho a cada geração; nunca usar o filho do carneiro da casa nas parentes (Exemplo 7) | TMM por Fleischmann (Exemplo 1); desvio das contemporâneas da mesma estação e ordem; MPPA e EBV com o pai (Exemplo 5); taxas com intervalo exato em janela de 12 meses (Exemplo 6); F por acasalamento | Paternidade só se houver mais de um carneiro no lote; PRNP dos carneiros |
| 50 a 200 ovelhas | Controle mensal AT ou AC, com composição no meio da lactação (amostragem parcial, como na França) e células individuais; notas de úbere das primíparas; FAMACHA por coleta | Dois ou três carneiros por estação, pelo menos um de IA ou importado; grupo de troca com pelo menos três rebanhos que registrem da mesma forma, para dar filhas em vários rebanhos aos carneiros locais (Exemplo 4) | Modelo de lactação com grupo aleatório e parâmetros da literatura; índice declarado e ligado ao pagamento; CUSUM das células do tanque; padronização por desvio-padrão do rebanho quando o grupo de troca for analisado junto (Exemplo 2) | Paternidade e PRNP; genotipagem ampla não se paga |
| 200 a 1.000 ovelhas | Controle mensal no padrão A4 ou AC, com o teste anual das duas ordenhas para checar o AC; composição parcial e células individuais; úbere, OPG e, se houver medidor, fluxo de ordenha; exportação no formato ICAR | IA estruturada com sêmen importado; carneiros jovens filhos das melhores ovelhas com pais importados, testados com filhas em rebanhos parceiros; se quiser autonomia, pelo menos 13 carneiros não aparentados por geração (Exemplo 7) | Modelo de lactação multicaracterística (leite, gordura, proteína, SCS) com grupo aleatório e covariáveis ovinas; modelo de dia de controle de repetibilidade, não de regressão aleatória; validação dos rankings com as lactações seguintes | Paternidade, PRNP e SOCS2 dos carneiros; chip só com referência conectada, como numa futura avaliação conjunta com a população de origem |

## Apêndice A: script que reproduz os exemplos

O script usa só numpy e a biblioteca padrão do Python, roda em menos de um segundo e reproduz todos os números marcados como **[conferido numericamente]**: a TMM pelo método de Fleischmann com a mamada separada, a regra dos 70 dias e o declínio exponencial, e o AT contra o AC (Exemplo 1); as conferências de fontes (equações de Ticiani et al., conversão de quilogramas em litros, desvio genético da Lacaune, pesos do ISOL, partos por ano, variâncias búlgaras); as escalas de células e as médias geométricas; a variância heterogênea no modelo de touro (Exemplo 2); a confiabilidade exata de carneiros pela PEV (Exemplo 4); o índice de dois carneiros sob três pesos (Exemplo 3); a MPPA e o índice com o EBV do pai (Exemplo 5); os intervalos de Wald, Wilson e exato e o poder (Exemplo 6); a endogamia por acasalamento, o Ne e o uso desigual de carneiros (Exemplo 7); o ganho genético e a absorção por sêmen importado (Exemplo 8); e as conferências genômicas (variância do conteúdo gênico do SOCS2 e forma de Γ). Todos os dados são fictícios, exceto onde o comentário indica a fonte. Uso: `python3 apendice_ovinos.py`.

```python
# Reproduz os exemplos do relatorio de ovinos leiteiros (somente numpy e math).
# Uso: python3 apendice_ovinos.py      (dados ficticios, exceto onde indicado)
import math
import numpy as np
np.set_printoptions(precision=4, suppress=True, linewidth=120)

def Phi(z): return 0.5 * (1 + math.erf(z / math.sqrt(2)))
def dens(z): return math.exp(-z * z / 2) / math.sqrt(2 * math.pi)
def qnorm(p):                                   # quantil da normal por bissecao
    lo, hi = -12.0, 12.0
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if Phi(mid) < p else (lo, mid)
    return (lo + hi) / 2
def intensidade(p):                             # intensidade de selecao por truncamento
    return dens(qnorm(1 - p)) / p

def matriz_A(ped):                              # metodo tabular; ped[i] = (pai, mae), 0 = desconhecido
    m = len(ped); A = np.zeros((m, m))
    for i in range(1, m + 1):
        s, d = ped[i]
        for j in range(1, i):
            A[i-1, j-1] = A[j-1, i-1] = 0.5 * ((A[j-1, s-1] if s else 0) + (A[j-1, d-1] if d else 0))
        A[i-1, i-1] = 1 + (0.5 * A[s-1, d-1] if s and d else 0)
    return A

L = "=" * 100
print(L)
# ---------------------------------------------------------------------------------------------
# 1. Lactacao de ordenha (TMM) pelo metodo de Fleischmann, separando o aleitamento
# ---------------------------------------------------------------------------------------------
wood = lambda t, a, b, c: a * np.power(t, b) * np.exp(-c * t)
A0, B0, C0 = 1.20, 0.25, 0.0095            # curva "verdadeira" ficticia (L/dia)
DESM, SECA = 30, 200                        # cordeiros mamam do parto ao dia 30; secagem no dia 200
d = np.arange(1, SECA + 1)
verd = wood(d, A0, B0, C0)
TMY_v = verd.sum()                          # se fosse ordenhada desde o parto (nao medivel aqui)
TMM_v = verd[DESM:].sum()                   # dias 31 a 200: ordenha exclusiva
print(f"1. Curva verdadeira: pico no dia {B0/C0:.1f} com {wood(B0/C0, A0, B0, C0):.2f} L/d | "
      f"leite dos dias 1-30 (mamado) {verd[:DESM].sum():.1f} L | TMM verdadeira (31-200) {TMM_v:.1f} L | "
      f"TMY hipotetica {TMY_v:.1f} L | TMM/TMY = {100*TMM_v/TMY_v:.1f}%")
print(f"   Regra ICAR do 1o controle: ate {DESM} + 52 = {DESM+52} dias apos o parto")
print(f"   Pontos de inflexao da Wood: (b +- raiz(b))/c = {(B0+math.sqrt(B0))/C0:.1f} d (o outro e negativo)")
tc = np.array([40, 70, 100, 130, 160, 190.])
ruido = np.array([0.04, -0.03, 0.02, -0.04, 0.03, -0.02])
mc = np.round(wood(tc, A0, B0, C0) * (1 + ruido), 2)      # L/dia estimados no controle (AT ou AC)
print("   controles (dia, L/d):", [(int(x), float(y)) for x, y in zip(tc, mc)])

def fleischmann_tmm(t, m, inicio, fim, max_int=70):
    """TMM: I0*M1 (do desmame ao 1o controle) + soma dos trapezios + (secagem - ultimo)*Mn.
    Regra ICAR: se dois controles nao nulos distam mais de 70 d, o calculo para no controle anterior."""
    t, m = list(t), list(m)
    tot = (t[0] - inicio) * m[0]
    ult = 0
    for i in range(len(t) - 1):
        if t[i+1] - t[i] > max_int:
            return tot, t[i], True                     # para no controle i (sem extrapolar)
        tot += (t[i+1] - t[i]) * (m[i] + m[i+1]) / 2
        ult = i + 1
    tot += (fim - t[ult]) * m[ult]
    return tot, fim, False

def ajusta_wood(t, m):                                   # ln y = ln a + b ln t - c t (MQO)
    X = np.column_stack([np.ones(len(t)), np.log(t), -np.asarray(t)])
    co, *_ = np.linalg.lstsq(X, np.log(m), rcond=None)
    return math.exp(co[0]), co[1], co[2]

def ajusta_exp(t, m):                                    # declinio exponencial: ln y = ln a - k t
    X = np.column_stack([np.ones(len(t)), -np.asarray(t)])
    co, *_ = np.linalg.lstsq(X, np.log(m), rcond=None)
    return math.exp(co[0]), co[1]

cen = {"6 mensais (40 a 190)": [0, 1, 2, 3, 4, 5],
       "3 controles (40, 100, 160)": [0, 2, 4],
       "metodo D: 2 no meio (70, 100)": [1, 2],
       "controle parou no dia 130 (40-130)": [0, 1, 2, 3],
       "falta o de 100 e o de 130 (40, 70, 160, 190)": [0, 1, 4, 5]}
print(f"   {'controles':44s} {'Fleischmann':>11s} {'erro':>7s} {'ate o dia':>9s} | {'exp. fim':>8s} {'erro':>7s}")
for nome, idx in cen.items():
    t, m = tc[idx], mc[idx]
    F, ate, parou = fleischmann_tmm(t, m, DESM, SECA)
    a, k = ajusta_exp(t, m)
    E = sum(a * math.exp(-k * x) for x in range(DESM + 1, SECA + 1))
    print(f"   {nome:44s} {F:11.1f} {100*(F/TMM_v-1):+6.1f}% {ate:9.0f}{' (para)' if parou else ''} | "
          f"{E:8.1f} {100*(E/TMM_v-1):+6.1f}%")
# producao media diaria do periodo de ordenha e conversoes
F6, _, _ = fleischmann_tmm(tc, mc, DESM, SECA)
print(f"   TMM (6 controles) / duracao da ordenha = {F6:.1f}/{SECA-DESM} = {F6/(SECA-DESM):.2f} L/dia; "
      f"em kg (x1,036) = {F6*1.036:.1f} kg")
# AT x AC num controle: uma ordenha medida (manha), tanque do rebanho nas duas ordenhas
manha, tq_m, tq_t = 1.05, 132.0, 88.0
print(f"   AT (x2): {2*manha:.2f} L/d | AC (x tanque total / tanque da manha): {manha*(tq_m+tq_t)/tq_m:.2f} L/d")

print(L)
# ---------------------------------------------------------------------------------------------
# 1b. Conferencias de fontes: Ticiani et al. (2013), conversao kg-L, sigma_g da Lacaune, pesos do ISOL
# ---------------------------------------------------------------------------------------------
for raca, a0, b_corpo, b_resumo, med, tot in (("Lacaune", 2.03, 0.008, 0.08, 1.67, 153.64),
                                            ("East Friesian", 1.42, 0.002, 0.02, 1.35, 124.20)):
    mc_corpo = a0 - b_corpo * 46.5; mc_res = a0 - b_resumo * 46.5         # media dos dias 1 a 92
    zero = a0 / b_resumo
    print(f"1b. {raca}: media prevista (corpo, b={b_corpo}) {mc_corpo:.3f} kg/d e total {mc_corpo*92:.1f} kg | "
          f"(resumo, b={b_resumo}) {mc_res:.3f} kg/d, chega a zero no dia {zero:.1f} | relatado {med} kg/d, {tot} kg")
print(f"    Ticiani 153,64 kg = {153.64/1.036:.1f} L; UPRA 330 L = {330*1.036:.1f} kg")
print(f"    sigma_g leite Lacaune: 5,3/0,15 = {5.3/0.15:.1f} L; 61/1,9 = {61/1.9:.1f} L; 39/1,2 = {39/1.2:.1f} L; "
      f"sigma_P com h2 0,30 = {(5.3/0.15)/math.sqrt(0.30):.1f} L")
w05 = dict(QMG=0.74, QMP=1.0, TB=0.22, TP=0.22, CCS=1.09, MO=1.09)
prod = w05["QMG"] + w05["QMP"] + w05["TB"] + w05["TP"]; func = w05["CCS"] + w05["MO"]
print(f"    ISOL Lacaune 2005 (Barillet 2016, Tab. 3, sigma_g): producao {prod:.2f} x funcionais {func:.2f} "
      f"-> {100*prod/(prod+func):.1f}% / {100*func/(prod+func):.1f}%")
wmtr = dict(QMG=0.68, QMP=1.0, TB=0.34, TP=0.42, CCS=0.18)
print(f"    MTR 2016: CCS = {100*0.18/sum(wmtr.values()):.1f}% do total; Latxa 2022/23: 47+34+27 = {47+34+27}%")
print(f"    Brasil 2015: 840.000 L / 6.900 matrizes = {840000/6900:.1f} L/matriz/ano")
print(f"    Brasil 2015 / nucleo Lacaune 2009: 6.900/173.568 = {100*6900/173568:.2f}%")
print(f"    Legarra 2007: 1 parto = 138,60/1,18 = {138.60/1.18:.0f} L (Latxa); 137,66/0,73 = {137.66/0.73:.0f} L (Manchega)")
print(f"    Vouraki 2024 (top 10): Grecia {82.80/37.62:.3f}x ({100*(82.80/37.62-1):+.0f}%), Franca {100*(53.24/53.18-1):+.2f}%")
print(f"    Pesantez: 365/283 = {365/283:.2f}; 365/302 = {365/302:.2f} partos/ano")
print(f"    Kuchtik: 10^5,31 = {10**5.31:,.0f} celulas/mL (se log10)")
print(f"    Peso a cobertura: 49-50 kg / 70-80 kg = {100*49/80:.0f}% a {100*50/70:.0f}%; 60% de 70-80 kg = {0.6*70:.0f} a {0.6*80:.0f} kg")
v = np.array([0.355, 0.029, 0.289, 0.327])
print(f"    Bulgaria REP1: soma das proporcoes = {v.sum():.3f}; r = (a+pe)/total = {(v[0]+v[1])/v.sum():.3f}")

print(L)
# ---------------------------------------------------------------------------------------------
# 2. Celulas somaticas: escalas, classes e media geometrica de tanque (IN 76)
# ---------------------------------------------------------------------------------------------
scs = lambda ccs: math.log2(ccs / 1e5) + 3                                 # ccs em celulas/mL
for c in (55e3, 110e3, 235e3, 795e3, 250e3, 1e6, 253e3, 1082e3):
    print(f"2. CCS {c:>11,.0f}: SCS (log2(CCS/10^5)+3) = {scs(c):.3f} | log2(CCS) = {math.log2(c):.2f}")
print(f"   Diferenca constante entre as escalas: log2(10^5) - 3 = {math.log2(1e5)-3:.3f}")
ovelha = np.array([180e3, 240e3, 410e3, 1350e3])                            # 4 controles de uma ovelha
s = np.array([scs(x) for x in ovelha])
print(f"   Ovelha: SCS {s.round(2)} | media {s.mean():.2f} -> geometrica {1e5*2**(s.mean()-3):,.0f}; aritmetica {ovelha.mean():,.0f}")
tanque = np.array([520e3, 600e3, 380e3])
print(f"   Tanque trimestral: geometrica {np.exp(np.log(tanque).mean()):,.0f} | aritmetica {tanque.mean():,.0f}")

print(L)
# ---------------------------------------------------------------------------------------------
# 3. Variancia heterogenea com razoes constantes: modelo de touro, 2 rebanhos, 3 carneiros
#    y = rebanho + (sigma_k/sigma_0) s + e  <=>  y* = sigma_0/sigma_k (y - media) com variancias de base
# ---------------------------------------------------------------------------------------------
h2 = 0.30; s0 = 64.5                                                       # sigma_P de base (L)
lam = (4 - h2) / h2
dados = {  # rebanho: (sigma_P do rebanho, {carneiro: desvios de TMM das filhas em L})
    "A (intensivo)": (95.0, {"X": [30, -40, 50, -40], "Y": [90, 20, 110, 20]}),
    "B (pasto)": (40.0, {"X": [-10, 15, -5, 0], "Z": [40, 25, 50, 25]})}
def resolve(padroniza):
    carn = ["X", "Y", "Z"]; reb = list(dados)
    nG, nS = len(reb), len(carn)
    C = np.zeros((nG + nS, nG + nS)); r = np.zeros(nG + nS)
    for g, rb in enumerate(reb):
        sk, fil = dados[rb]
        f = s0 / sk if padroniza else 1.0
        for c, ys in fil.items():
            j = nG + carn.index(c)
            for y in ys:
                y = y * f
                C[g, g] += 1; C[j, j] += 1; C[g, j] += 1; C[j, g] += 1
                r[g] += y; r[j] += y
    for j in range(nS): C[nG + j, nG + j] += lam
    sol = np.linalg.solve(C, r)
    return {c: 2 * sol[nG + i] for i, c in enumerate(carn)}
for nome, p in (("sem ajuste (variancia homogenea)", False), ("com ajuste (y* = y x 64,5/sigma_k)", True)):
    e = resolve(p)
    print(f"3. {nome:40s} EBV: " + "  ".join(f"{c} {v:+6.1f} L" for c, v in e.items()))
for rb, (sk, _) in dados.items():
    print(f"   rebanho {rb}: fator {s0/sk:.3f}; peso relativo no MME (1/sigma_e^2) = {(s0/sk)**2:.2f}; "
          f"desvio de +60 L vale {60*s0/sk:+.1f} L; de +35 L vale {35*s0/sk:+.1f} L")

print(L)
# ---------------------------------------------------------------------------------------------
# 4. Confiabilidade de um carneiro com poucas filhas em poucos rebanhos: PEV exata do modelo de touro
#    y = GC + s + e ; s ~ N(0, I s2s) ; s2s = h2/4 ; s2e = 1 - h2/4 ; k = (4 - h2)/h2
# ---------------------------------------------------------------------------------------------
def rel_carneiro(rebanhos, h2=0.30, ext=None, alvo="X"):
    ext = ext or {}
    carn = sorted({c for r in rebanhos for c in r} | {alvo})
    s2s, s2e = h2 / 4, 1 - h2 / 4; lamb = s2e / s2s
    nG, nC = len(rebanhos), len(carn)
    C = np.zeros((nG + nC, nG + nC))
    for g, r in enumerate(rebanhos):
        for c, n in r.items():
            j = nG + carn.index(c)
            C[g, g] += n; C[j, j] += n; C[g, j] += n; C[j, g] += n
    for j, c in enumerate(carn):
        R = ext.get(c, 0.0); C[nG + j, nG + j] += lamb + lamb * R / (1 - R)   # DE externa = k R/(1-R)
    Ci = np.linalg.pinv(C)
    pev = Ci[nG + carn.index(alvo), nG + carn.index(alvo)] * s2e
    return max(0.0, 1 - pev / s2s)                      # max: elimina o -0,000 de arredondamento
cenarios = [
    ("1 rebanho: X 20 filhas sozinho no GC", [{"X": 20}], {}),
    ("1 rebanho: X 10 + local Y 10", [{"X": 10, "Y": 10}], {}),
    ("1 rebanho: X 10 + importado Z 10 (REL 0,90)", [{"X": 10, "Z": 10}], {"Z": 0.90}),
    ("3 rebanhos (troca): X 4 + local diferente 10 em cada", [{"X": 4, f"Y{i}": 10} for i in range(3)], {}),
    ("3 rebanhos (troca): X 4 + importado Z 10 em cada", [{"X": 4, "Z": 10}] * 3, {"Z": 0.90}),
    ("Lasarte: 8 filhas em 5 rebanhos (2,2,2,1,1) + Z 10", [{"X": n, "Z": 10} for n in (2, 2, 2, 1, 1)], {"Z": 0.90}),
    ("40 filhas num rebanho + 40 de Z", [{"X": 40, "Z": 40}], {"Z": 0.90}),
    ("CDEO: 40 filhas em 5 rebanhos (8) + Z 40", [{"X": 8, "Z": 40}] * 5, {"Z": 0.90}),
    ("CDEO: 40 filhas em 10 rebanhos (4) + Z 40", [{"X": 4, "Z": 40}] * 10, {"Z": 0.90}),
]
for h2c in (0.30, 0.24):
    k_t = (4 - h2c) / h2c; k_d = (4 - 2*h2c) / h2c
    print(f"4. h2 = {h2c}: k (modelo de touro) = {k_t:.2f}; k_d = {k_d:.2f}")
    for nome, reb, ext in cenarios:
        print(f"   {nome:56s} REL = {rel_carneiro(reb, h2c, ext):.3f}")
    for n in (8, 12, 40):
        print(f"   formula n/(n+k): n={n:3d} -> {n/(n+k_t):.3f} (k) | {n/(n+k_d):.3f} (k_d)")
print(f"   Para REL 0,74 com 8 filhas: k = 8(1-0,74)/0,74 = {8*0.26/0.74:.2f} -> h2 = 4/(k+2) = {4/(8*0.26/0.74+2):.2f}")
for R in (0.50, 0.70, 0.80):
    print(f"   REL {R:.2f} exige DE = k_d R/(1-R) = {((4-0.6)/0.3)*R/(1-R):.1f} (h2 0,30)")

print(L)
# ---------------------------------------------------------------------------------------------
# 5. Indice de dois carneiros com os pesos relativos lidos na Tabela 3 de Barillet et al. (2016)
#    (EBVs ficticios em desvios-padrao geneticos, sinal positivo = favoravel)
# ---------------------------------------------------------------------------------------------
pesos = {"Lacaune 1992": dict(QMG=0.74, QMP=1.0, TP=0.58),
         "Lacaune 2005 (ISOL)": dict(QMG=0.74, QMP=1.0, TB=0.22, TP=0.22, CCS=1.09, MO=1.09),
         "MTR 2016": dict(QMG=0.68, QMP=1.0, TB=0.34, TP=0.42, CCS=0.18)}
carneiros = {"A (producao alta, ubere e celulas fracos)": dict(QMG=1.6, QMP=1.8, TB=-0.4, TP=-0.2, CCS=-0.8, MO=-0.5),
             "B (producao media, funcionais bons)":       dict(QMG=0.8, QMP=0.9, TB=0.5, TP=0.6, CCS=0.7, MO=0.9)}
for pn, w in pesos.items():
    tot = sum(w.values())
    linha = []
    for cn, z in carneiros.items():
        I = sum(w[k] * z.get(k, 0) for k in w)
        linha.append(f"{cn[:1]}: soma {I:5.3f} (media ponderada {I/tot:+.3f} sigma_g)")
    print(f"5. {pn:22s} (soma dos pesos {tot:.2f}) " + " | ".join(linha))
print("   Assaf, indice de ubere (trecho de busca): 0,4 x insercao + 0,3 x profundidade + 0,3 x verticalidade")

print(L)
# ---------------------------------------------------------------------------------------------
# 6. Ovelhas do rebanho: MPPA e indice com o EBV do pai (desvios de TMM em relacao as contemporaneas)
# ---------------------------------------------------------------------------------------------
sP, h2o = 60.0, 0.30; s2P = sP**2; s2a = h2o * s2P
print(f"6. sigma_P = {sP:.0f} L, h2 = {h2o}, sigma_a = {math.sqrt(s2a):.1f} L")
ovelhas = [("O1", [40], 30, 0.90), ("O2", [25, 15, 20], None, 0.0), ("O3", [55, 5], 10, 0.40),
           ("O4", [-20], 40, 0.85), ("O5", [-30, -15, -25, -20], 5, 0.40), ("O6", [30, 35], -20, 0.60)]
def indice(ys, ebv_pai, R, r):
    n = len(ys); x1 = np.mean(ys)
    v11 = s2P * (r + (1 - r) / n)
    if ebv_pai is None or R == 0:
        b = np.array([s2a / v11]); g = np.array([s2a]); x = np.array([x1])
    else:   # x2 = EBV do pai: var = R s2a ; cov(x1, x2) = cov(a, x2) = R s2a / 2
        Pm = np.array([[v11, R*s2a/2], [R*s2a/2, R*s2a]]); g = np.array([s2a, R*s2a/2])
        b = np.linalg.solve(Pm, g); x = np.array([x1, ebv_pai])
    return b @ x, (b @ g) / s2a, b
for r in (0.41, 0.50):
    print(f"   repetibilidade r = {r}")
    for nome, ys, ebv, R in ovelhas:
        n = len(ys); mppa = n*r/(1 + (n-1)*r) * np.mean(ys)
        e, rel, b = indice(ys, ebv, R, r)
        pai = "sem EBV" if ebv is None else f"{ebv:+d} (REL {R:.2f})"
        print(f"     {nome}: media {np.mean(ys):6.1f} n={n} | MPPA {mppa:6.1f} | pai {pai:16s} | "
              f"EBV {e:6.1f} REL {rel:.3f} | b = {b.round(3)}")

print(L)
# ---------------------------------------------------------------------------------------------
# 7. Intervalos de confianca de taxas com 40 ovelhas e poder para comparar dois anos
# ---------------------------------------------------------------------------------------------
def binom_cdf(x, n, p): return sum(math.comb(n, k) * p**k * (1-p)**(n-k) for k in range(0, x + 1))
def exato(x, n, a=0.05):
    def raiz(f):
        lo, hi = 0.0, 1.0
        for _ in range(200):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if f(mid) > 0 else (lo, mid)
        return (lo + hi) / 2
    li = 0.0 if x == 0 else raiz(lambda p: 1 if (1 - binom_cdf(x - 1, n, p)) < a/2 else -1)
    ls = 1.0 if x == n else raiz(lambda p: 1 if binom_cdf(x, n, p) > a/2 else -1)
    return li, ls
def wilson(x, n, z=1.959964):
    p = x / n; c = (p + z*z/(2*n)) / (1 + z*z/n); h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / (1 + z*z/n)
    return c - h, c + h
def wald(x, n, z=1.959964):
    p = x / n; h = z*math.sqrt(p*(1-p)/n); return p - h, p + h
casos = [("Fertilidade (paridas/expostas)", 36, 40), ("Prenhez a IA com semen importado", 13, 25),
         ("Mortalidade de cordeiros ate o desmame", 5, 50), ("Ovelhas com algum controle >= 1 milhao", 7, 40),
         ("FAMACHA 4 ou 5 numa coleta", 5, 40), ("Descarte no ano", 11, 40), ("Abortos", 0, 40)]
print("7.", f"{'caso':42s} {'x/n':>7s} {'taxa':>6s} {'Wald':>13s} {'Wilson':>13s} {'Exato':>13s}")
for nome, x, n in casos:
    f = lambda t: f"{100*t[0]:5.1f}-{100*t[1]:5.1f}"
    print(f"   {nome:42s} {x:3d}/{n:<3d} {100*x/n:5.1f}% {f(wald(x, n)):>13s} {f(wilson(x, n)):>13s} {f(exato(x, n)):>13s}")
def n_por_grupo(p1, p2, za=1.959964, zb=0.841621):
    pb = (p1 + p2) / 2
    return (za*math.sqrt(2*pb*(1-pb)) + zb*math.sqrt(p1*(1-p1) + p2*(1-p2)))**2 / (p1 - p2)**2
def poder(p1, p2, n, za=1.959964):
    pb = (p1 + p2) / 2; se0 = math.sqrt(2*pb*(1-pb)/n); se1 = math.sqrt((p1*(1-p1) + p2*(1-p2))/n)
    return Phi((abs(p1 - p2) - za*se0) / se1)
for p1, p2, n in ((0.90, 0.95, 40), (0.10, 0.20, 50), (0.52, 0.65, 25), (0.25, 0.10, 40)):
    print(f"   {p1:.2f} vs {p2:.2f}: n por grupo (80% de poder, 5%) = {math.ceil(n_por_grupo(p1, p2))}; poder com {n} = {poder(p1, p2, n):.2f}")
ninh = np.array([1]*18 + [2]*16 + [3]*2)                                    # 36 partos
m, sd = ninh.mean(), ninh.std(ddof=1); tq = 2.030                           # t(35; 0,975)
print(f"   Prolificidade: {ninh.sum()} cordeiros/{len(ninh)} partos = {m:.2f}; DP {sd:.3f}; IC95% {m-tq*sd/math.sqrt(36):.2f} a {m+tq*sd/math.sqrt(36):.2f}")
print(f"   Cordeiros desmamados por ovelha exposta = 0,90 x 1,56 x (1 - 0,10) = {0.90*1.56*0.90:.2f}; "
      f"UPRA (sem mortalidade) 0,949 x 1,56 = {0.949*1.56:.2f}")

print(L)
# ---------------------------------------------------------------------------------------------
# 8. Endogamia: F por acasalamento, Ne de rebanho pequeno, uso desigual de carneiros e troca entre rebanhos
# ---------------------------------------------------------------------------------------------
nomes = ["R1", "E1", "E2", "E3", "R2", "F1", "F2", "F3", "R3", "F4"]
ped = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (0, 0), 5: (1, 2), 6: (1, 2), 7: (1, 3), 8: (1, 4),
       9: (0, 0), 10: (5, 7)}
A = matriz_A(ped); ix = {n: i for i, n in enumerate(nomes)}
print("8. F dos animais:", {n: round(A[i, i] - 1, 4) for n, i in ix.items() if A[i, i] > 1})
for c in ("R1", "R2", "R3"):
    print(f"   {c}: " + "  ".join(f"x{f} {100*0.5*A[ix[c], ix[f]]:5.2f}%" for f in ("E1", "F1", "F2", "F3", "F4")))
print(f"   {'Nm':>4s} {'Nf':>5s} {'Ne':>7s} {'dF/ger':>8s} {'F 5 ger':>8s} {'F 12 anos (L=4)':>16s}")
for Nm, Nf in ((1, 30), (2, 60), (3, 100), (4, 50), (5, 200), (10, 500), (13, 1000)):
    Ne = 4*Nm*Nf/(Nm + Nf); dF = 1/(2*Ne)
    print(f"   {Nm:4d} {Nf:5d} {Ne:7.2f} {100*dF:7.2f}% {100*(1-(1-dF)**5):7.2f}% {100*(1-(1-dF)**3):15.2f}%")
p = np.array([0.55, 0.25, 0.15, 0.05]); Nm_ef = 1/np.sum(p**2)
Ne = 4*Nm_ef*50/(Nm_ef + 50)
print(f"   Uso desigual de 4 carneiros (55/25/15/5%): Nm efetivo = 1/sum(p^2) = {Nm_ef:.2f}; Ne = {Ne:.2f}; dF = {100/(2*Ne):.2f}%")
for rot, Nm, Nf in (("1 rebanho fechado, 3 carneiros, 100 ovelhas", 3, 100),
                    ("3 rebanhos trocando carneiros (9 x 300)", 9, 300),
                    ("1 rebanho: 4 locais + 10 importados (IA), 100 ovelhas", 14, 100)):
    Ne = 4*Nm*Nf/(Nm + Nf); print(f"   {rot:56s} Ne = {Ne:6.2f}; dF = {100/(2*Ne):.2f}%")
for Ne in (370, 200, 103, 64, 50):
    print(f"   Ne {Ne}: dF = {100/(2*Ne):.3f}%", end=";")
print(f"\n   Chios: dF 0,013 -> Ne = {1/(2*0.013):.1f}")

print(L)
# ---------------------------------------------------------------------------------------------
# 9. Ganho genetico: rebanho fechado, troca de carneiros e semen importado (sigma_a = 33 L, escala francesa)
# ---------------------------------------------------------------------------------------------
sa = 33.0
for q in (0.05, 0.10, 0.15, 0.20, 0.80):
    print(f"9. intensidade para fracao selecionada {q:.2f}: i = {intensidade(q):.3f}")
def dg(caminhos): return sum(i*r for i, r, L in caminhos) * sa / sum(L for i, r, L in caminhos)
r_mae = math.sqrt(2*0.30/(1 + 0.50))                                      # 2 lactacoes, h2 0,30, r 0,50
print(f"   acuracia do VG da mae com 2 lactacoes = {r_mae:.3f}; do filho so pela mae = {0.5*r_mae:.3f}; "
      f"media dos pais com REL 0,40 cada = {math.sqrt((0.40+0.40)/4):.3f}")
cen9 = {"Fechado: carneiro filho das melhores ovelhas (top 20%)":
            [(intensidade(0.20), 0.5*r_mae, 3.0), (intensidade(0.80), 0.30, 4.0)],
        "Troca entre 3 rebanhos com BLUP conjunto (top 10%)":
            [(intensidade(0.10), 0.447, 3.0), (intensidade(0.80), 0.35, 4.0)]}
for nome, cam in cen9.items():
    i, r, Lm = cam[0]
    print(f"   {nome:58s} dG = {dg(cam):5.2f} L/ano (teorico) | superioridade do carneiro i r sa = {i*r*sa:5.1f} L "
          f"-> filhas +{i*r*sa/2:4.1f} L  [(i, r, L) = {[(round(i,3), round(r,3), L) for i, r, L in cam]}]")
rg = 0.86
for T in (3.8, 4.0, 5.3, 5.4):
    print(f"   Semen importado continuo: tendencia francesa {T} L/ano x rg {rg} = {T*rg:.2f} L/ano")
anos = 2026 - 2012
for T in (3.8, 5.4):
    gap = T * anos
    print(f"   Atraso de {anos} anos x {T} = {gap:.0f} L; x rg = {gap*rg:.1f} L; filhas do importado: +{gap*rg/2:.1f} L/lactacao")
gap0, T, Lg = 55.0, 4.3*rg, 3.75                                           # hipoteses do exemplo (ja com rg)
G, Rm = 0.0, gap0
print(f"   Absorcao (carneiros importados {gap0:.0f} L acima do rebanho; tendencia {T:.2f} L/ano ja com rg; L = {Lg} anos):")
for g in range(1, 5):
    G = G + 0.5 * (Rm - G); Rm = Rm + T * Lg
    print(f"     geracao {g} (~{g*Lg:.1f} anos): rebanho {G:6.1f} L | carneiros {Rm:6.1f} L | distancia {Rm-G:5.1f} L")
for nome, cam in cen9.items():
    print(f"   Comparacao em 15 anos: {nome[:40]:40s} {dg(cam)*15:5.1f} L (teorico)")
print(f"   Distancia de equilibrio = 2 T L = {2*T*Lg:.1f} L")
print(f"   Pre-selecao genomica Lacaune: (284 - 119)/0,62 = {(284-119)/0.62:.0f} pontos de ISOL por desvio-padrao")
print(f"   Carneiro importado {gap0:.0f} L acima do rebanho -> filhas +{gap0/2:.1f} L (1a geracao)")
print(f"   Se sigma_a no Brasil for metade (producao media metade): ganhos /2, ex. {T/2:.2f} L/ano e filhas +{gap0/4:.1f} L")
print(L)
# ---------------------------------------------------------------------------------------------
# 10. Genomica: variancia do conteudo genico do SOCS2 e conferencia algebrica de Gamma (metafundador)
# ---------------------------------------------------------------------------------------------
f = 0.217
print(f"10. SOCS2: sigma2_gT = 2 f (1 - f) = {2*f*(1-f):.3f}; Hardy-Weinberg esperado CC/CT/TT = "
      f"{100*(1-f)**2:.1f}/{100*2*f*(1-f):.1f}/{100*f*f:.1f}% (observado nos carneiros: 58,5/40/1,5%)")
rng = np.random.default_rng(1)
k = 40000
for nome, pb in (("p = 0,5 em todos os SNPs", np.full(k, 0.5)), ("todos os SNPs fixados (p = 1)", np.ones(k)),
                 ("p ~ Uniforme(0,1)", rng.uniform(0, 1, k))):
    gam = (2 / k) * np.sum((2*pb - 1)**2)
    print(f"    Gamma = (2/k) sum (2p - 1)^2, {nome:30s} = {gam:.3f} | 8 var(p) = {8*pb.var():.3f}")
print(L)
```
