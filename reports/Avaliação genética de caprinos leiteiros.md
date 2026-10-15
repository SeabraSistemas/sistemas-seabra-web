# Cabras leiteiras ganham PTAs conectando rebanhos pequenos

As PTAs (capacidades previstas de transmissão) de cabras leiteiras saem do mesmo **BLUP de modelo animal** usado em bovinos, mas três particularidades caprinas mudam o resultado. A primeira é a **medida**: pela ICAR, só conta o leite da ordenha exclusiva, cada país escolhe a própria lactação de referência (**210 dias** na Espanha e na Itália, **250** na França, **305** no Brasil e nos EUA) e o total sai do método de Fleischmann com no mínimo três controles. A segunda é o **tamanho**: a referência genômica francesa, a maior do mundo, tinha **677 bodes provados** em 2014 e 905 em 2018, e o Capragene avaliou a Alpina com **1.072 lactações em 153 grupos de contemporâneas**. Por isso a França adotou o **ssGBLUP multirraça** (oficial desde 2017, segundo o artigo de 2018; o relatório da Capgènes de 2022–2023 ainda descreve um teste de "HSSGBLUP") e trata a **αs1-caseína**, que explica cerca de 40% da variação genética do teor de proteína, como gene de grande efeito. O Capragene usa modelo animal multicaracterística com ambiente permanente, grupo de contemporâneas aleatório (Alpina, 2021) e ssGBLUP por amostragem de Gibbs na Saanen, sem índice composto. A terceira é a **funcionalidade**: o ICC francês pondera produção, úbere, células somáticas e, desde 2023, sucesso da IA (53/21/10/16% na Alpina), enquanto prolificidade (h² 0,02 a 0,05), verminose (h² do OPG 0,07 a 0,17) e longevidade (sem herdabilidade publicada lida) seguem difíceis. Para rebanhos de 20 a 1.000 cabras, o caminho não é estimar parâmetros próprios: é padronizar a lactação com quatro a dez controles, comparar cada cabra com as contemporâneas, combinar registros próprios com a PTA do pai, pôr intervalo de confiança em toda taxa e decidir a endogamia acasalamento por acasalamento. Os exemplos mostram por que **conectar** importa mais que modelar: dez filhas de um bode num só rebanho dão confiabilidade de 0,17 a 0,20, as mesmas dez filhas espalhadas em dez rebanhos dão 0,31, e um rebanho fechado com um bode por geração acumula 13% de endogamia por geração.

**Grau de confirmação.** As notas desta rodada leram o texto integral de boa parte das fontes caprinas (ICAR, sumários do Capragene, Arnal et al. 2019, Rupp et al. 2011, Carillier et al. 2014, Teissier et al. 2018 e outras), mas várias afirmações vêm só de resumo, de trecho de busca ou de leitura de gráfico. Cinco marcadores aparecem no texto. **[não verificado]** indica afirmação sem fonte primária lida. **[trecho de busca]** indica número visto só no resultado de busca. **[leitura de gráfico]** indica valor lido em figura. **[conferido numericamente]** indica conta refeita pelo script do Apêndice A, o que prova consistência interna, não autoria. **[proposta deste relatório]** indica meta ou regra derivada pelas notas ou por este relatório, sem fonte que a fixe. Os exemplos usam dados fictícios e parâmetros escolhidos dentro das faixas publicadas para caprinos; quando um parâmetro não tem fonte caprina (a repetibilidade da lactação, por exemplo), o exemplo roda com três valores. Alguns PDFs da pasta compartilhada de fontes não têm URL de origem registrada; quando a fonte primária tem endereço conhecido, o texto cita esse endereço, e quando não tem, diz isso.

Este é o terceiro relatório da série. A teoria geral está nos dois anteriores e não é repetida: o modelo animal, a matriz A e sua inversa, as equações de modelos mistos (MME), a acurácia pela variância do erro de predição, o REML e o ssGBLUP com APY estão no [relatório de bovinos de corte](Avaliação%20genética%20de%20bovinos%20de%20corte.md) (seções "O modelo animal resolve ambiente, pedigree e genética num único sistema" e "A genômica entra trocando a matriz de parentesco"); a lactação padronizada, o modelo de dia de controle com regressão aleatória, as filhas-equivalentes e os índices estão no [relatório de bovinos leiteiros](Avaliação%20genética%20de%20bovinos%20leiteiros.md). A versão 1 do relatório de leite tem erros já identificados na verificação de fontes, e este relatório usa as formas corrigidas. A constante da confiabilidade é **k_d = (4 − 2h²)/h²** quando o mérito da mãe (ou das companheiras) é conhecido, e **(4 − h²)/h²** só no modelo de touro com mães desconhecidas ([VanRaden e Wiggans 1991](https://queries.uscdcb.com/publish/jds/1991/74_2737.pdf)). A aproximação DE ≈ n (n filhas valem n filhas-equivalentes) só vale com cada filha em um rebanho diferente: com os parâmetros bovinos do USDA, cem filhas num único rebanho valem 5,9 DE. A fórmula de Daetwyler et al. dá a **acurácia r**, e a confiabilidade é r² ([Daetwyler et al. 2008](https://doi.org/10.1371/journal.pone.0003395)). O divisor da ECM de Sjaunja citado em artigos abertos é 3,140, e não 3,1138; como essa ECM foi calibrada para leite de vaca, ela não é usada aqui. E o próprio autor do modelo de dia de controle desaconselha hoje o grupo rebanho-dia-de-controle (HTD) e recomenda grupos aleatórios de ordem de parto-rebanho-ano-estação ([Schaeffer 2016, seções 4.3.5 e 4.3.6](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf)), o que pesa ainda mais em rebanhos caprinos pequenos.

## A cabra roda o mesmo BLUP, mas a lactação começa em outra regra

### Pela ICAR, só o leite da ordenha exclusiva entra na conta

A Seção 16 da ICAR distingue duas situações que não existem na vaca. Quando a cabra é ordenhada desde o parto, passada a fase colostral, mede-se a **produção total da lactação (TMY)**. Quando os cabritos mamam antes, ou mamam e a cabra é ordenhada em parte, só se mede o **leite da fase de ordenha exclusiva (TMM)**; a soma do leite mamado com o ordenhado (TSMM) não é medida no controle. A regra é taxativa: cabras amamentando, ou amamentando e parcialmente ordenhadas, "must not be included", e só entra o registro feito quando a cabra está "definitively separated from its kid(s)". Todas as cabras ordenhadas no dia do controle devem ser controladas, para evitar viés de amostragem ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

O mesmo texto fixa as janelas. O primeiro controle do rebanho ocorre **4 a 15 dias depois do início da ordenha exclusiva**. O primeiro controle de cada cabra ordenhada desde o parto deve cair **entre o 6º e o 80º dia pós-parto**; se houve mamada, deve cair até 35 dias depois da separação dos cabritos, com tolerância de 17, de modo que o limite é a duração média da mamada da raça mais 52 dias. O intervalo médio entre controles é de **30 dias (28 a 34)** nos métodos com as duas ordenhas medidas (A4, B4, C4, E4), e pode chegar a 36, 42 e 49 dias nos métodos 5, 6 e 7. A primeira letra diz quem mede: **A**, o controlador oficial; **B**, o criador; **C**, os dois; **E**, método oficial flexível em que só cabras ou lactações designadas são controladas. A segunda diz como: **T** mede uma ordenha alternada (manhã num mês, tarde no outro, multiplicada por 2); **C** mede uma ordenha qualquer e corrige pela produção total do rebanho; **Z** mede o leite nas duas ordenhas e amostra em ordenhas alternadas; **Y** mede o leite nas duas e amostra uma, com correção dos teores. O intervalo máximo entre dois controles não nulos da mesma cabra é o dobro do intervalo médio, ou seja, tolera-se a perda de um controle; acima disso, o cálculo da lactação para no controle anterior. O número mínimo de controles por cabra não é fixado pela ICAR, mas o método de Fleischmann exige **pelo menos três**. A menor produção diária medida é de 200 g, o erro-padrão aceito é de 40 g, e o fator de conversão de volume para peso do leite de cabra é 1,032. Existe ainda o **método D**, não oficial, com 2 a 4 controles por rebanho por ano para obter 2 ou 3 controles por cabra no meio da lactação; ele serve para ranquear cabras dentro do rebanho e decidir reposição e descarte, mas não dá o certificado ICAR ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

O cálculo da ICAR para cabras tem duas variantes. No método 1, cada controle é multiplicado pelo número de dias do intervalo que o antecede. No método 2, o preferido por ser "centrado", a média de dois controles consecutivos é multiplicada pelos dias entre eles, que é o método dos intervalos (TIM) descrito para vacas na Procedure 2 da ICAR. Do último controle até a secagem, a ICAR manda multiplicar a última produção pela **metade do intervalo** escolhido, quando a data de secagem não é real. Gordura e proteína saem pelo mesmo cálculo aplicado ao rendimento de cada componente. Um controle faltante, num hiato de até 100 dias, pode ser estimado pela média dos vizinhos ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)).

O ponto mais consequente é que a ICAR **não fixa uma lactação padrão** para cabras: "it is impossible to define a standard lactation length", e cada organização define, por raça e categoria, uma produção de referência e declara o comprimento ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)). O levantamento da ICAR de 2022 mostra o efeito: a Eslováquia usa TMM de 240 dias, a França usa TMY, e a Espanha usa, conforme a raça, TMM de 150 ou 254 dias, TMY de 210 ou 274 dias e TSMM de 210 dias; a apresentação conclui que comparar produções entre países e raças é "very difficult". Em 2020–2021 havia **457.324 cabras** em controle leiteiro oficial nos países ICAR, 88% delas na França, na Espanha e na Itália, e cerca de 9,6% das cabras desses países eram controladas ([Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)).

As regras dos programas seguem essa liberdade. A avaliação nacional francesa ajusta a produção para uma lactação de referência de **250 dias**, com média de 872,5 kg na Alpina e 874,7 kg na Saanen ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)); o estudo francês de dia de controle usou controles entre o 7º e o 270º dia, com pelo menos quatro por lactação e lactações de 180 a 350 dias ([Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)). A Itália usa **210 dias** e pré-ajusta a lactação por ordem de parto, idade e número de crias ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389); [Asso.Na.Pa., CHEESR](https://www.assonapa.it/public/cheesr/4.2_A_SviluppoValutazionessGBLUP.pdf)), e a Caprigran espanhola também padroniza para 210 dias ([Interempresas 2022](https://www.interempresas.net/caprino/409455-Las-razas-exhiben-sus-mejores-sementales.html)) **[trecho de busca]**. Os EUA consideram só os primeiros **305 dias**, projetam registros curtos, exigem pelo menos 15 dias em lactação nos registros encerrados e 40 nos em andamento, e padronizam para cabras de 3 anos paridas de dezembro a março ([ADGA](https://adga.org/performance-programs/production-testing/); [AIPL, ficha de caprinos](https://aipl.arsusda.gov/reference/goat/goatsfs.html)) **[trecho de busca]**. O Capragene usa a **produção até 305 dias (PL305)**, só com lactações de pelo menos 60 dias, pelo menos três controles e primeiro controle até o 75º dia; na Saanen, exigia também secagem por causa normal, produção total de pelo menos 150 kg e grupos de contemporâneas com pelo menos três cabras. O controle leiteiro oficial brasileiro, coordenado pela ACCOMIG/Caprileite, segue as normas para bovídeos da Portaria SNAP nº 45, de 1986 ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf); [Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)). Um app que calcule lactações de cabras precisa, portanto, registrar a data de separação dos cabritos e declarar, em cada relatório, se o número é TMY ou TMM e qual o comprimento de referência.

### Exemplo 1: de quatro a dez controles até a lactação padronizada

O exemplo usa uma cabra Saanen fictícia ordenhada desde o parto, cuja produção diária verdadeira segue a curva de Wood com a = 1,55, b = 0,23 e c = 0,0048, com pico no **dia 47,9 e 3,00 kg** e secagem no dia 290. A produção verdadeira é de **673,5 kg** até a secagem (que, por ela secar antes do dia 305, é também a PL305), 612,1 kg até 250 dias e 540,4 kg até 210 dias. Os controles mensais caem nos dias 10, 40, 70, ..., 280, com erro de medida de −4% a +5%, e medem 2,63; 2,90; 3,00; 2,66; 2,62; 2,31; 2,04; 1,94; 1,61 e 1,51 kg/dia. A tabela compara o Fleischmann (TIM, método 2 da ICAR, com o primeiro intervalo I₀·M₁ e a secagem real no dia 290) com a curva de Wood ajustada aos mesmos controles pela forma linearizada ln y = ln a + b·ln t − c·t, cuja forma está conferida em fonte aberta ([Schaeffer 2016, Tab. 4.1](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf)) **[conferido numericamente]**.

```
TIM (Fleischmann, método 2):  PL = I₀·M₁ + Σ_i I_i·(M_i + M_{i+1})/2 + I_n·M_n
   I₀ = dias do parto (ou do fim da mamada, na TMM) ao 1º controle; I_i = dias entre controles;
   I_n = dias do último controle à secagem real, ou metade do intervalo se a secagem for calculada (ICAR)
Wood:  y(t) = a·t^b·e^(−c·t)    pico em t = b/c    y_pico = a·(b/c)^b·e^(−b)
PL_L (Wood) = Σ_{t=1..min(L, secagem)} y(t)
```

| Controles usados | TIM até a secagem (= PL305) | Erro | Wood PL250 | Erro | Wood PL305 | Erro | Pico estimado |
|---|---|---|---|---|---|---|---|
| 10 mensais (dias 10 a 280) | 675,9 kg | +0,4% | 612,7 kg | +0,1% | 674,9 kg | +0,2% | dia 44, 3,00 kg |
| 6 (meses 1 a 6; controle parou no dia 160) | 736,1 kg | +9,3% | 619,0 kg | +1,1% | 685,1 kg | +1,7% | dia 44, 2,97 kg |
| 5 bimestrais (dias 40 a 280) | 678,0 kg | +0,7% | 603,5 kg | −1,4% | 667,0 kg | −1,0% | dia 50, 2,90 kg |
| 4 (meses 1, 2, 4 e 6) | 725,5 kg | +7,7% | 609,6 kg | −0,4% | 676,8 kg | +0,5% | dia 41, 2,89 kg |

Três lições saem da tabela. Com controles até perto da secagem, mensais ou bimestrais, o TIM erra menos de 1% e dispensa curva. Quando o controle para no meio da lactação, o que é comum em rebanho pequeno, o TIM carrega a última produção, de forma constante, até a secagem e superestima a lactação em **8% a 9%**; a curva de Wood ajustada a só **quatro controles bem posicionados** recupera o total com erro de 0,5%. E sem data de secagem, a regra da ICAR (último controle mais 15 dias) daria 683,4 kg até o dia 295. O exemplo é favorável à curva, porque a curva verdadeira é exatamente uma Wood; em dados reais, gestação, estação e doença distorcem a forma e o erro cresce. A evidência empírica caprina vai na mesma direção. Num estudo italiano com 465 cabras de seis raças, 210 dias e 14 controles quinzenais, o protocolo com controles nos **meses 1, 2, 4 e 6** não diferiu do de 14 controles para a produção total, enquanto o protocolo com os meses 1 a 4 errou de forma significativa: na Saanen, 572,7 kg com 14 controles, 598,5 kg pelo método da ICAR (não significativo), 610,3 kg com os meses 1, 2, 4 e 6 (não significativo) e 701,5 kg com os meses 1 a 4 (p < 0,01). Para gordura e proteína houve diferenças em algumas raças ([Animals 2021, PMC8069443](https://pmc.ncbi.nlm.nih.gov/articles/PMC8069443)).

A mamada muda o número, e não só a forma. Se os cabritos da mesma cabra mamassem até o dia 45, a TMM verdadeira (dias 46 a 290) seria de **551,5 kg, 81,9% da TMY**, e o pico, no dia 48, cairia dentro da fase de mamada, como a própria ICAR adverte ao dizer que na TMM "only the downward phase of the lactation curve is recorded in almost all cases" ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)) **[conferido numericamente]**. TMM e TMY não podem ser misturadas no mesmo grupo de contemporâneas sem um efeito para o sistema de aleitamento. Os componentes seguem o mesmo cálculo: com teores mensais de 3,1% a 3,8% de gordura e 2,8% a 3,4% de proteína, o TIM dá **22,51 kg de gordura (3,33%) e 20,38 kg de proteína (3,01%)**. O ajuste de Wood aos dez controles (a = 1,727; b = 0,198; c = 0,0045) dá uma persistência operacional, definida aqui como y(240)/y(40), de 0,580, contra 0,578 da curva verdadeira **[proposta deste relatório: definição operacional]**.

### Curva, componentes e células: o que muda na cabra

A curva caprina tem, segundo a FAO citada pela Embrapa, "um pico menos proeminente e com uma maior persistência de produção" que a da vaca ([Embrapa, Balde Cheio](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1099498/1/ProgramaBaldeCheio.pdf)). Em Alpinas de pequenos produtores no Quênia, o pico variou de cerca de 2 a 8 semanas conforme o grupo genético, e a ordem de parto e o mês de parto afetaram a subida, o declínio e a persistência ([Kenya Alpine](https://ir.jooust.ac.ke/items/095c413c-f322-441a-bf48-8a34678bf171)) **[trecho de busca]**. Nenhuma fonte lida mediu o fotoperíodo diretamente; os estudos usam estação ou mês de parto, que confundem luz com chuva, forragem e temperatura. O modelo francês inclui um efeito que não aparece nos modelos de vaca: um **spline do estágio de gestação**, nulo até 30 dias de prenhez e constante depois de 100 dias, porque a cabra pode emprenhar durante a lactação ([Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)).

As células somáticas exigem cuidado redobrado. A escala usual em bovinos, SCS = log₂(CCS/100) + 3 com CCS em mil células/mL, vem de Shook (1982) e foi adotada pelo controle leiteiro americano ([Da et al. 1992](https://queries.uscdcb.com/publish/jds/1992/75_2265.pdf)). Em cabras, os estudos usam variantes: a França calcula a **LSCS**, média ponderada das SCS dos controles ajustadas pelos dias em lactação, com cerca de seis contagens mensais por lactação e transformação logarítmica de Ali e Shook (1980) ([Rupp et al. 2011](https://doi.org/10.3168/jds.2010-3694)); a Nova Zelândia usa a média de log₂(CCS/1.000) ([Jaques et al. 2023](https://doi.org/10.3390/ani13081374)); o Capragene publicou a CCS305 da Saanen em log₁₀ ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)). O problema não é a escala, e sim os limiares. Cabras sem infecção intramamária podem ter de **270 mil a 2 milhões de células/mL**, e os limites regulatórios de CCS para leite de cabra variam de 500 mil a 1 milhão conforme o país, com 1 milhão nos EUA ([Einorytė et al. 2026](https://doi.org/10.1186/s13028-026-00880-7)). Os estudos franceses citados por Rupp et al. usam 500 mil células/mL para separar metades de úbere infectadas, ou dois limiares de 750 mil e 1,75 milhão com várias medidas por lactação, com sensibilidade de 61% a 83% e especificidade de 61% a 80%; a mastite clínica é "very low" em cabras ([Rupp et al. 2011](https://doi.org/10.3168/jds.2010-3694)). No Brasil, a IN 37/2000 não fixa limite de CCS, e a Embrapa usa **1 milhão de células/mL** como base para detectar leite de cabras com mastite subclínica ([Souza et al. 2022, Embrapa](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf)).

Um exemplo mostra por que a média aritmética engana. Uma cabra com seis controles de **420, 610, 950, 1.380, 2.050 e 3.100 mil células/mL** tem SCS de 5,07 a 7,95 e SCS médio de 6,50, que corresponde a uma **média geométrica de 1.135 mil**; a média aritmética é de 1.418 mil, puxada pelas contagens altas **[conferido numericamente]**. A mesma assimetria aparece nos sumários brasileiros: a CCS305 da Saanen teve média de 6,01 em log₁₀, que equivale a uma média geométrica de cerca de **1,02 milhão de células/mL** ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)), enquanto a média aritmética da CCS305 da Alpina foi de 1.505,8 mil, com desvio-padrão de 1.170,2 mil ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)). Na escala log₂, 200 mil células/mL, limiar comum em vacas, dão SCS 4,00; 750 mil dão 5,91; 1 milhão dá 6,32; e 1,75 milhão dá 7,13 **[conferido numericamente]**. Para a avaliação genética, a escala logarítmica resolve; para o manejo, o app deve mostrar a média geométrica e a fração de controles acima de 1 milhão, e não a média aritmética.

## Dois modelos de produção disputam a cabra: lactação inteira e dia de controle

### Modelo de lactação: repetibilidade, várias características e contemporâneas aleatórias

Todos os programas com avaliação oficial documentada analisam a lactação inteira, padronizada, como um registro por cabra e por parto. A forma geral, que inclui os casos francês, italiano, americano e brasileiro, é a seguinte **[forma padrão; os efeitos de cada programa vêm das fontes citadas abaixo]**:

```
y = X b + Z_a a + Z_p p + Z_c c + e

y   lactação padronizada (PL305 no Brasil, MYI de 250 d na França, 210 d na Itália e na Espanha), uma linha por parto
b   efeitos fixos (Capragene): tipo de parto × sexo das crias; idade ao parto (classes, ou covariável linear e
    quadrática); tipo de ordenha (manual ou mecânica); grupo de contemporâneas, quando tratado como fixo
a   valor genético aditivo, um por animal do pedigree            var(a) = A σ²a
p   ambiente permanente da cabra (comum às suas lactações)        var(p) = I σ²p
c   grupo de contemporâneas (rebanho-ano-estação-manejo), quando aleatório      var(c) = I σ²c
e   resíduo                                                        var(e) = I σ²e
h² = σ²a/σ²P      repetibilidade r = (σ²a + σ²p)/σ²P      PTA = â/2

MME (α_x = σ²e/σ²x):
[ X'X     X'Z_a               X'Z_p             X'Z_c            ] [b̂]   [X'y  ]
[ Z_a'X   Z_a'Z_a + A⁻¹·α_a    Z_a'Z_p           Z_a'Z_c          ] [â]   [Z_a'y]
[ Z_p'X   Z_p'Z_a             Z_p'Z_p + I·α_p    Z_p'Z_c          ] [p̂] = [Z_p'y]
[ Z_c'X   Z_c'Z_a             Z_c'Z_p           Z_c'Z_c + I·α_c   ] [ĉ]   [Z_c'y]

Multicaracterística (t características):  var(a) = G₀ ⊗ A,  var(p) = P₀ ⊗ I,  var(e) = R₀ ⊗ I,
com as linhas e colunas das características que faltam em cada lactação removidas de R₀
```

Os pressupostos são os do modelo animal descritos no relatório de corte, mais dois próprios da lactação. O modelo de repetibilidade supõe **correlação genética igual a 1 entre lactações**, ou seja, que a primeira e a quinta lactação medem a mesma característica, e supõe variâncias iguais em todos os rebanhos e ordens de parto. Quando o grupo de contemporâneas entra como aleatório, acrescenta-se o pressuposto de que o nível genético médio não difere entre grupos, que só se sustenta se os rebanhos compartilham bodes. As variâncias são estimadas antes, por REML ou por amostragem de Gibbs, e tratadas como conhecidas na solução das MME, exatamente como no relatório de corte (seções "Passo 2: montar e resolver as MME" e "Variâncias: REML, AI-REML e Gibbs").

O Capragene documenta dois desenhos. No sumário genômico da Saanen de 2017, o modelo multivariado de oito características (DL, PL305, produção diária, gordura, proteína, extrato seco, lactose e CCS até 305 dias) tinha efeitos aleatórios aditivo e de ambiente permanente, e efeitos fixos de **grupo de contemporâneas** (cabras paridas no mesmo ano e estação, sob o mesmo manejo), da interação **tipo de parto × sexo das crias** (seis classes), da **classe de idade da cabra** (sete níveis, de 2 a 8 ou mais anos) e do **tipo de ordenha** (manual ou mecânica), com grupos de menos de três cabras eliminados; as PTAs genômicas saíram por ssGBLUP com inferência bayesiana por amostragem de Gibbs no BLUPF90 ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)). No primeiro sumário da Alpina, de 2021, o grupo de contemporâneas (cabras paridas no mesmo rebanho, ano e estação, sob o mesmo manejo) passou a **efeito aleatório**, a idade ao parto entrou como covariável linear e quadrática, o tipo de parto × sexo das crias ganhou oito classes (aborto, duas fêmeas, uma fêmea, macho e fêmea, dois machos, um macho, natimorto e mais de duas crias), e as características foram analisadas em **modelos de três características, com PL305 e duração da lactação como âncoras**, sobre 1.072 lactações de 654 cabras em 14 rebanhos, distribuídas em **153 grupos de contemporâneas**, com pedigree de 2.159 animais ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)).

A escolha do grupo aleatório é a resposta caprina ao tamanho. Com 1.072 lactações em 153 grupos, cada grupo tem em média **7,0 lactações** **[conferido numericamente]**. Como efeito fixo, um grupo de sete cabras "gasta" parte da informação de cada registro na estimativa da própria média, como mostra a tabela de tamanho de grupo do relatório de corte; como efeito aleatório, a média do grupo é encolhida em direção à média geral e sobra mais informação para a genética. O custo é o pressuposto de que grupos não diferem em nível genético, que só é razoável quando os rebanhos estão conectados por bodes em comum. É a mesma lógica dos grupos aleatórios de ordem de parto-rebanho-ano-estação que Schaeffer propõe hoje para o modelo de dia de controle ([Schaeffer 2016](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf)).

Os outros programas variam esse núcleo. Nos EUA, o modelo de avaliação é **y = hys + hs + pe + a + e**, com rebanho-ano-estação, interação rebanho-bode (efeito comum às filhas do mesmo bode dentro do rebanho), ambiente permanente e valor genético, e a PTA é metade do valor genético predito ([Wiggans, CDCB](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf)). A interação rebanho-bode é o termo que penaliza filhas concentradas num só rebanho, tema do Exemplo 3. Na Itália, o projeto CHEESR aplicou **y = m + HYS + animal + e**, com rebanho-ano-estação fixo, a lactações de 210 dias pré-corrigidas ([Asso.Na.Pa., CHEESR](https://www.assonapa.it/public/cheesr/4.2_A_SviluppoValutazionessGBLUP.pdf)). Na França, a avaliação nacional é descrita como modelo animal multicaracterística com efeito fixo de rebanho × ano × ordem de parto ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)), e a produção de leite é avaliada rotineiramente da 1ª à 10ª lactação ([Arnal et al. 2026](https://doi.org/10.3168/jds.2025-27676)). Os estudos brasileiros mais antigos usaram modelos animais uni e bicaracterística por DFREML: com 643 lactações de 261 cabras Saanen e pedigree de 1.548 animais, os dois deram estimativas semelhantes, mas o bicaracterístico "permitiu melhor utilização das informações disponíveis" ([Embrapa 2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)).

Os modelos multicaracterística pequenos pedem uma ressalva. No sumário da Alpina, as correlações genéticas da PL305 com proteína, lactose e extrato seco foram de **1,000, 0,999 e 0,996**, e com a gordura de 0,898 ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)). Correlações iguais a 1 indicam que o modelo não conseguiu separar as características, o que é compatível com superparametrização (só 737 das 1.072 lactações tinham proteína, em 153 grupos) ou com definições sobrepostas dos componentes **[inferência]**. Esses valores não devem ser usados como parâmetros biológicos. Na Saanen de 2017, com mais dados, as correlações foram altas mas menores que 1 (0,95 com proteína, 0,97 com extrato seco e 0,99 com lactose), e a da CCS305 com a PL305 foi de 0,24 ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).

### Modelo de dia de controle: a França estudou regressão aleatória com redução de posto

O modelo de dia de controle mais detalhado para cabras é o de Arnal et al. (2019), com 193.226 controles de 30.186 primíparas Saanen em 234 rebanhos e 205.841 controles de 32.256 primíparas Alpinas em 198 rebanhos, de 1995 a 2015, com controles a cada 28 ou 35 dias, pais com pelo menos 20 progênies e mais de quatro cabras por rebanho-dia-de-controle ([Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)). A fonte escreve o modelo em forma escalar; a forma matricial abaixo é a tradução deste relatório **[subscritos achatados na extração; conferir no PDF original]**:

```
y_n(d) = HTD_i + AY_jk + PY_jl + Σ_{r=1..6} θ_kr N_r(d) + Σ_{r=1..6} τ_lr N_r(d) + Σ_{s=1..4} γ_s M_s(g)
         + Σ_{o=0..4} a_no φ_o(d) + Σ_{o=0..4} p_no φ_o(d) + e_n(d)

d    dia em lactação (7 a 270); g = dias de gestação no controle (0 se vazia)
HTD  rebanho × dia de controle (fixo)        AY  ano × classe de idade ao parto (7 classes, 9–11 a ≥17 meses)
PY   ano × período de parto (8 classes)     N_r(d) spline cúbico natural com nós em 7, 20, 50, 110, 190, 270 d,
     com coeficientes θ por classe de idade e τ por período de parto
M_s(g) spline da gestação, nós em 31, 53, 76 e 100 d (efeito nulo até 30 d, constante depois de 100 d)
φ_o(d) polinômio de Legendre de ordem o (até 4) no dia d

Forma matricial:   y = X b + Φ_a a + Φ_p p + e
var(a) = K_a ⊗ A   (K_a 5×5)     var(p) = K_p ⊗ I     var(e) = R = diag(σ²_e,c), c = 9 classes de DEL de 30 d
Redução de posto:  K_a = V Λ V'; mantêm-se z = 2 ou 3 autovetores, a_n = V_z b_n, b ~ N(0, Λ_z ⊗ A)
                   g_n(d) = φ(d)'V_z b_n = Σ_{o=1..z} χ_o(d)·b_no      (χ₁ ≈ nível; χ₂ ≈ persistência)
PTA de L dias:     EBV_L = Σ_{d=7..L} φ(d)'â_n = q_L'â_n ,  PTA_L = EBV_L/2
Persistência:      desvio acumulado da contribuição genética do DEL 40 ao 240 em relação a um animal médio com
                   a mesma produção no DEL 40; leitura deste relatório: P_n = Σ_{d=40..240} [g_n(d) − g_n(40)]
h²(d) = φ(d)'K_aφ(d) / [φ(d)'K_aφ(d) + φ(d)'K_pφ(d) + σ²_e(d)]
```

Os resultados respondem às perguntas práticas. Os polinômios de **ordem 4** deram o melhor ajuste; reduzida a posto 2, a matriz genética foi resumida por dois componentes, nível e persistência, "with a correlation close to 0 between them". A herdabilidade da lactação inteira foi de cerca de **0,3 para leite** nas duas raças; a do componente de nível foi de 0,28 (Saanen) e 0,27 (Alpina) para leite, e a do componente de persistência de 0,13 e 0,14, chegando a 0,18 e 0,19 no teor de proteína; o teor de gordura da Alpina teve h² de 0,65 no modelo de lactação e 0,75 no de regressão aleatória. Os parâmetros foram coerentes com os de um modelo de lactação de 250 dias e com os de um modelo multicaracterística de seis períodos da lactação, e as variâncias foram estimadas no WOMBAT. Os autores escrevem que o modelo foi implantado na França para avaliar produção e persistência, independentes entre si, na primeira lactação ([Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)). As fontes posteriores lidas, porém, descrevem a avaliação nacional como modelo de lactação ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)), e o uso rotineiro do modelo de dia de controle em 2026 **não foi confirmado**. A extensão para as três primeiras lactações com escore de células somáticas ([Arnal et al. 2020](https://doi.org/10.3168/jds.2019-17465)) e a validação do ssGBLUP com regressão aleatória na Saanen, com 7,9 milhões de controles e 1,3 milhão de lactações de 2000 a 2017, em que a regressão aleatória reduziu a inflação dos valores genéticos em relação ao modelo de lactação ([Arnal et al. 2023](https://doi.org/10.3168/jds.2022-22550)), foram lidas só por metadados e trechos **[trecho de busca]**.

Na Espanha, com 49.696 controles mensais de 5.163 cabras Murciano-Granadinas em 20 rebanhos, o modelo de regressão aleatória foi comparado ao modelo de repetibilidade de dia de controle: no meio da lactação, as herdabilidades de leite, matéria seca e gordura foram maiores no modelo de repetibilidade e a de proteína no de regressão aleatória, e as herdabilidades foram estáveis ao longo da lactação, exceto a da matéria seca ([Menéndez-Buxadera et al. 2010](https://doi.org/10.3168/jds.2009-2571)) **[resumo]**. Um estudo posterior, com controles de 2008 a 2018 de Florida, Malagueña e Murciano-Granadina fornecidos pelas associações de raça, ajustou regressão aleatória sobre o índice de temperatura e umidade (THI) no ASReml ([Menéndez-Buxadera et al. 2021](https://doi.org/10.3390/ani11030736)).

Para rebanhos pequenos, o ponto fraco do modelo francês é o HTD fixo, que exige muitas cabras controladas no mesmo dia e na mesma situação; a própria seleção de dados de Arnal et al. pediu mais de quatro cabras por HTD. Num rebanho de 20 a 50 cabras com partos espalhados, cada dia de controle reúne poucas primíparas, e o HTD absorve quase toda a informação. A alternativa coerente com a verificação de fontes é a de Schaeffer: **grupos aleatórios de ordem de parto-rebanho-ano-estação**, cada um com a sua curva ([Schaeffer 2016](https://animalbiosciences.uoguelph.ca/~lrs/BOOKS/rrmbook.pdf)). Há ainda um obstáculo de dados: as notas não extraíram as matrizes K_a e K_p publicadas, só as herdabilidades dos componentes, e sem elas o app não pode rodar a regressão aleatória francesa com parâmetros externos.

### Exemplo 2: do vetor de coeficientes à PTA de 250 dias e à persistência

O exemplo mostra como uma avaliação de regressão aleatória vira os dois números que o criador lê. Com Legendre normalizados no intervalo de 7 a 270 dias, φ(40) = (0,7071; −0,9174; 0,5401; 0,1364; −0,7462) e φ(240) = (0,7071; 0,9453; 0,6224; −0,0153; −0,6497). Somando φ(d) do dia 7 ao 250, o vetor que transforma coeficientes em produção de 250 dias é **q₂₅₀ = (172,53; −22,73; −23,52; −23,13; −15,87)** **[conferido numericamente]**. Como o intervalo de 7 a 250 não é simétrico dentro do intervalo de 7 a 270, todos os coeficientes entram na PTA de 250 dias, e não só o primeiro, ao contrário do caso simétrico de 305 dias do relatório de leite.

| Cabra (coeficientes fictícios) | â | EBV250 | Contribuição genética no DEL 40 | No DEL 240 | Persistência P |
|---|---|---|---|---|---|
| A | (0,200; 0; 0; 0; 0) | 34,51 kg | 0,141 kg/d | 0,141 kg/d | 0,00 kg |
| B | (0,207; 0,050; 0; 0; 0) | 34,51 kg | 0,100 kg/d | 0,193 kg/d | 9,36 kg |

As duas cabras têm a mesma EBV250 (PTA de 17,3 kg), mas a cabra B começa abaixo e termina acima: pela leitura da definição francesa adotada aqui, acumula **9,36 kg** de contribuição genética a mais entre os dias 40 e 240 do que teria se mantivesse a do dia 40 **[conferido numericamente; a fórmula da persistência é interpretação deste relatório]**. No modelo francês com redução de posto, essa separação vem pronta, porque o segundo componente principal já é a persistência e tem correlação genética próxima de zero com o nível.

### Herdabilidades de produção e células somáticas variam de 0,10 a 0,34

A tabela reúne as estimativas lidas. Os valores não são diretamente comparáveis, porque mudam a definição da lactação, o modelo e a escala.

| População (fonte) | Leite | Gordura e proteína | Células somáticas | Outras |
|---|---|---|---|---|
| Alpina / Saanen, França, primíparas ([Rupp et al. 2011](https://doi.org/10.3168/jds.2010-3694)) | 0,30 / 0,34 | teor de gordura 0,62 / 0,61; teor de proteína 0,67 / 0,60 | LSCS 0,20 / 0,24; r_g com leite 0,00 / 0,12 | r_g LSCS com teor de gordura −0,18 / −0,20 |
| Alpina e Saanen, França ([Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)) | ≈ 0,3 (lactação inteira) | teor de gordura 0,75 (RRM) e 0,65 (lactação), Alpina | — | persistência ≈ 0,10 a 0,14 |
| França, bivariada com genômica ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)) | ≈ 0,22 (0,30 na avaliação nacional) | — | — | — |
| Saanen, Capragene 2017 ([sumário](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)) | PL305 0,22; diária 0,25 | 0,19 / 0,18 (kg) | CCS305 0,11 | DL 0,07; extrato seco e lactose 0,18 |
| Alpina, Capragene 2021 ([sumário](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)) | PL305 0,18 | 0,20 / 0,18 (kg) | CCS305 0,19; r_g com PL305 0,091 | DL 0,03; extrato seco 0,16; lactose 0,14 |
| Saanen, Embrapa ([2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)) | PL305 0,27 (uni) / 0,26 (bi) | — | — | DL 0,00 / 0,03; r_g PL305–DL 0,85 |
| Saanen / Anglo-Nubiana, Sobral, 1988–2002 ([Lôbo e Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)) | PL total 0,12 / 0,10 | — | — | DL 0,03 / 0,07 |
| Saanen, Sérvia, uma fazenda, 2.155 lactações ([Animals 2025](https://doi.org/10.3390/ani15203008)) | 0,22 (modelo animal); 0,27 (modelo de touro) | 0,26 / 0,26 (kg); teores 0,40 / 0,29 | — | — |
| Nigerian Dwarf, EUA, 1.041 cabras ([Valencia-Posadas et al. 2022](https://doi.org/10.5713/ab.21.0143)) | 0,16 | 0,16 / 0,10 (kg) | SCS (log₂) 0,32; r_g com leite 0,25 | 18 características num só modelo |

Três padrões são robustos. A herdabilidade da produção de leite em kg fica entre **0,10 e 0,34**, com os valores brasileiros (0,12 a 0,27) abaixo dos franceses (0,30 a 0,34), diferença que pode vir de estrutura de dados e de modelo, sem teste nas fontes. Os teores de gordura e proteína são muito mais herdáveis (0,60 a 0,75). E a CCS tem herdabilidade moderada (0,11 a 0,32) com **correlação genética fraca com o leite** (0,00 a 0,25 nas fontes lidas em texto integral), o que significa que selecionar para leite pouco piora as células e que selecionar contra células custa pouco leite. O estudo sérvio, num único rebanho, mostra ainda que o modelo de touro superestimou as herdabilidades em relação ao modelo animal, efeito que os autores atribuem ao viés do modelo de touro ([Animals 2025](https://doi.org/10.3390/ani15203008)). Para os exemplos deste relatório, a PL305 brasileira usa **h² = 0,20** e desvio-padrão fenotípico dentro do grupo de 200 kg (σa = 89,4 kg), valores escolhidos dentro das faixas acima; a PTA com desvio-padrão de 34 kg publicada para os bodes Alpinos implica, com esses parâmetros, confiabilidade média de 0,58, o que é plausível **[conferido numericamente]**.

## Úbere, prolificidade, cabritos, longevidade e verminose pedem escalas e modelos próprios

### Úbere e tipo: onze notas lineares de 1 a 9 com herdabilidade de 0,20 a 0,50

A França classifica primíparas Alpinas e Saanen em **11 características lineares de úbere e tetos, em escala de 1 a 9**, tratadas como contínuas e medidas uma vez por animal: ligamento anterior, perfil do úbere, posição do piso, comprimento, largura e forma dos tetos, ângulo, implantação e orientação dos tetos, úbere posterior e inserção posterior. O modelo é animal multicaracterística, estimado por REML, com efeitos fixos de rebanho × ano × ordem de parto (que absorve o classificador), idade à classificação × ano e estágio da lactação × ano ([Rupp et al. 2011](https://doi.org/10.3168/jds.2010-3694)). As herdabilidades vão de 0,20 (ângulo dos tetos, Saanen) a 0,50 (comprimento dos tetos, Alpina), e as correlações genéticas com o escore de células somáticas são pequenas, com uma exceção útil: tetos mais compridos e mais largos têm correlação positiva com a LSCS na Alpina (0,29 e 0,34), e a posição do piso do úbere tem correlação negativa (−0,24 e −0,19) ([Rupp et al. 2011, Tabela 4](https://doi.org/10.3168/jds.2010-3694)). A França seleciona tipo e produção em conjunto porque a posição do piso do úbere foi associada geneticamente a menor produção em estudos anteriores citados pelos mesmos autores. Em 2023, 11 classificadores pontuaram **37.837 primíparas em 553 rebanhos** ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)).

| Característica (Alpina / Saanen) | h² | r_g com LSCS |
|---|---|---|
| Ligamento anterior | 0,30 / 0,25 | −0,16 / −0,01 |
| Úbere posterior | 0,29 / 0,24 | −0,16 / −0,08 |
| Posição do piso do úbere | 0,34 / 0,37 | −0,24 / −0,19 |
| Perfil do úbere | 0,40 / 0,28 | 0,11 / −0,11 |
| Inserção posterior | 0,23 / 0,29 | −0,10 / −0,10 |
| Comprimento dos tetos | 0,50 / 0,46 | 0,29 / 0,15 |
| Largura dos tetos | 0,41 / 0,45 | 0,34 / 0,11 |
| Forma dos tetos | 0,27 / 0,26 | −0,27 / −0,07 |
| Implantação dos tetos | 0,38 / 0,30 | 0,15 / −0,00 |
| Ângulo dos tetos | 0,22 / 0,20 | 0,04 / −0,08 |
| Orientação dos tetos | 0,35 / 0,32 | 0,13 / 0,06 |

Fonte: [Rupp et al. 2011](https://doi.org/10.3168/jds.2010-3694), Tabela 4.

O tipo é a característica caprina que melhor viaja entre países. No projeto SMARTER, a correlação genética da inserção posterior do úbere entre países foi de 0,75 a 0,92 na Alpina e de 0,78 a 0,95 na Saanen, com médias da escala de 5,60 (Canadá), 5,75 (Itália) e 4,63 (França) ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)). Nos EUA, a ADGA coleta caracteres lineares desde 1988, e o CDCB avalia 13 caracteres lineares mais o escore final por modelo animal multicaracterística desde 1995 ([CDCB](https://uscdcb.com/dairy-goats/)); a escala da ADGA vai de 0 a 50 ([ADGA](https://adga.org/seeing-a-dairy-goat-by-the-numbers)) **[trecho de busca]**. No Brasil, o sumário da Alpina de 2021 ainda "espera" o início da coleta de avaliação linear de tipo ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)), e não há parâmetros genéticos de tipo de cabras brasileiras nas fontes lidas. Num rebanho chinês de 635 Saanen, as h² genômicas de úbere ficaram entre 0,13 e 0,32 ([Yao et al. 2025](https://doi.org/10.3390/ani15020261)).

### Reprodução: o modelo muda a variância, mas quase não muda a ordem dos bodes

A prolificidade é um contador (1, 2, 3 ou mais cabritos por parto) de herdabilidade muito baixa. Em 3.439 partos de cabras Markhoz no Irã, ao longo de 21 anos, três modelos foram comparados **[forma das equações conforme a fonte; notação deste relatório]**:

```
Linear:   y = X b + Z a + W p + e                              (escala observada)
Poisson:  y ~ Poisson(λ),  log λ = X b + Z a + W p (+ e)        (escala logarítmica)
Probit:   l = X b + Z a + e,  e ~ N(0, 1);  y = 1 se l > t       (escala latente; usado para mortalidade 0/1)
var(a) = A σ²a ;  var(p) = I σ²p ;  covariância direto-materna fixada em zero
```

A h² do tamanho da ninhada ao nascer e ao desmame foi de **0,02 a 0,05**. A variância aditiva no Poisson (0,013) foi três vezes a do linear (0,004), mas a correlação de Spearman entre os valores genéticos dos dois modelos foi de **0,98**; para a mortalidade, linear e probit concordaram menos (0,84), e só o probit detectou efeitos genéticos maternos e de ninhada. Os autores alertam que a base tinha 180 reprodutores, um só rebanho e uma só raça ([Teymouri et al. 2026](https://doi.org/10.1016/j.vas.2026.100757)). No Capragene, com 4.574 cabras Saanen e pedigree de 5.829 animais nascidos de 1989 a 2020, a h² do número de crias ao longo da vida foi de 0,03 a 0,17, a da idade ao primeiro parto de 0,04, e o modelo de Poisson teve o melhor ajuste ([Trop. Anim. Health Prod. 2026](https://doi.org/10.1007/s11250-026-04980-4)). A lição para o app é que a escala da h² precisa ser declarada junto com o número, e que, para ordenar bodes, o modelo linear basta.

A fertilidade entrou na seleção francesa por um caminho caprino: o **sucesso da IA**, definido como 1 quando uma única inseminação coincide com o parto registrado (no diagrama do slide, a IA cai entre 160 e 140 dias antes do parto) e 0 quando a IA não tem parto correspondente. A h² é de 0,052 na Saanen e 0,045 na Alpina, mas o desvio-padrão genético é de 9 e 11 pontos percentuais, o que justifica a seleção. As correlações entre valores genéticos foram de −0,12 com o leite na Saanen e 0,01 na Alpina, e de 0,11 e 0,12 com a CCS. Uma região do cromossomo 19 explicou 4,7% da variância na Saanen, e a avaliação é genômica, no BLUPF90 ([Clément, Piacère e Chassier 2023](https://docs.eaap.org/2023/S79T07.pdf)). O índice de fertilidade só é calculado para IA com sêmen congelado ([Réussir/Pleinchamp 2022](https://www.pleinchamp.com/actualite/fertilite-a-l-ia-et-cellules-integreront-l-index-combine-caprin-debut-2023)). A taxa de sucesso na campanha de 2022 foi de 58,6% e 53,8%; a atribuição desses valores a Alpina e Saanen não está explícita no texto extraído do slide.

O aborto é frequente o bastante para ter avaliação. Em Murciano-Granadinas, com incidência de 14,3%, 17,0% e 14,6% na 1ª, 2ª e 3ª ordem de parto, o modelo de limiar multivariado (y = Xb + Za + e na escala latente, com a ~ N(0, Aσ²a), Gibbs no THRGIBBS1F90) deu h² de **0,25, 0,11 e 0,19** e correlações genéticas entre ordens de 0,23 a 0,48 ([Takalu et al. 2026](https://doi.org/10.1016/j.vas.2026.100673)), o que trata o aborto como característica parcialmente repetida. A idade ao primeiro parto e o intervalo de partos têm estimativas brasileiras antigas: no rebanho da Embrapa em Sobral, com partos de 1988 a 2002, a h² da idade ao primeiro parto foi de 0,21 na Saanen e 0,49 na Anglo-Nubiana, e a do intervalo de partos de 0,06 e 0,01, por modelo animal bicaracterística com DFREML; a idade média ao primeiro parto foi de **634 dias na Saanen e 668 na Anglo-Nubiana** ([Lôbo e Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)). Na França, a "maturidade" (ganho de produção entre lactações) tem h² de cerca de 0,10 e repetibilidade de 0,55, é independente da produção na primeira lactação e tem correlação positiva com longevidade funcional, com um QTL próximo do gene CSN1S1 ([Arnal et al. 2026](https://doi.org/10.3168/jds.2025-27676)).

### Cabritos: efeito materno e cromossomo X mudam a herdabilidade direta

O peso do cabrito depende da mãe, e ignorar isso infla a herdabilidade. O modelo direto-materno é o do relatório de corte (seção "Pesos até a desmama: modelo direto-materno"), e o estudo caprino mais completo acrescentou um efeito ligado ao cromossomo X **[notação deste relatório]**:

```
y = X b + Z a + W m + Z x + e
[a; m] ~ N(0, G₀ ⊗ A),  G₀ = [σ²a  σam; σam  σ²m]      x ~ N(0, A_X σ²x)  (parentesco do cromossomo X)
Fixos (estudo iraniano): ano e mês de nascimento, sexo, tipo de parto (1 a 3), idade da mãe (1 a ≥7), ordem de parto
```

Em 19.582 cabritos Murciano-Granadinos no Irã, de 460 bodes e 5.382 cabras, a h² materna foi de **0,13 no peso ao nascer** e 0,04 no peso ao desmame; tirar o efeito materno piorou o ajuste (ΔAIC = +47,7) e inflou a h² direta, e a variância ligada ao X respondeu por 8% a 40% da variância aditiva ([Ehsaninia et al. 2026](https://doi.org/10.1016/j.vas.2025.100553)). Em cabras cashmere escocesas, o peso aos 5 meses teve h² de 0,22 com efeito materno (que respondeu por 0,28 da variância fenotípica) e de 0,50 sem ele ([Vagenas et al. 2002](https://doi.org/10.1017/s135772980005236x)). Para a mortalidade até o desmame, binária, o probit é o modelo indicado, e machos morrem mais ([Teymouri et al. 2026](https://doi.org/10.1016/j.vas.2026.100757)).

### Longevidade: nenhuma herdabilidade publicada foi lida

Não há avaliação genética de longevidade em cabras leiteiras com parâmetros lidos em texto integral. Os sumários brasileiros e franceses avaliam lactação, CCS e sucesso da IA. A França produziu, por "hyper-selection" sobre longevidade funcional, duas linhas de cabras com vida produtiva diferente, usadas para estudar resposta inflamatória ([Ithurbide et al. 2026](https://doi.org/10.1371/journal.pone.0356779)), e um estudo britânico estimou h² de 0,08 a 0,46 para medidas de longevidade ([ILRI](https://dspace7test.ilri.org/items/6d10ba8c-9006-42f1-aafa-035da1b32e60/full)) **[trecho de busca]**. Os modelos de sobrevivência (Weibull com riscos proporcionais) e de vida produtiva do relatório de leite valem em tese, mas nenhuma aplicação caprina foi encontrada. O dado descritivo brasileiro mais útil é o do rebanho da Embrapa em Sobral: **31% de descarte, idade média ao descarte de 43,7 meses, vida produtiva de 25,7 meses** a partir da primeira lactação aos 18 meses, e 46% das cabras descartadas antes de terminar a primeira lactação ([Araújo et al., Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf)). Inserção do úbere e aprumos são candidatos naturais a preditores, mas isso é inferência, não resultado.

### Verminose: OPG transformado, FAMACHA e hematócrito

A contagem de ovos nas fezes (OPG) é assimétrica e precisa ser transformada. Em 830 cabras cruzadas cashmere, a transformação de Box-Cox indicou λ = 0,33, ou seja, **raiz cúbica de (OPG + 1)**, melhor que o logaritmo e a raiz quadrada. Com 4 a 11 contagens por animal, a h² de uma contagem foi de 0,17 (0,11 com ambiente permanente), a repetibilidade de 0,17, e a h² da média das contagens de 0,32; uma linha selecionada para OPG baixo teve OPG menor em 4 de 5 anos ([Vagenas et al. 2002](https://doi.org/10.1017/s135772980005236x)). Em 1.303 cabras Alpinas e Saanen de 20 rebanhos suíços, medidas duas vezes por ano com vermifugação entre as coletas, o modelo animal multicaracterística deu h² de **0,07 para o OPG, 0,22 para o FAMACHA e 0,22 para o hematócrito**, correlação genética de −0,41 entre OPG e hematócrito e de **0,49 entre OPG e leite**, desfavorável; foram excluídos OPG acima de 10.000, FAMACHA fora de 1 a 5 e hematócrito fora de 14% a 50% ([Heckendorn et al. 2017](https://doi.org/10.1051/parasite/2017033)). A forma do modelo, para o app, é a de medidas repetidas:

```
y* = (OPG + 1)^(1/3)          y* = X b + Z a + W p + e      (p: ambiente permanente; repetição por coleta)
Multicaracterística com FAMACHA, hematócrito e leite:  var(a) = G₀ ⊗ A
Registro mínimo: data da coleta, data da última vermifugação, lote de manejo, espécie dominante se houver coprocultura
```

No Brasil não foram encontradas h² de OPG ou FAMACHA em texto integral. No Sertão Baiano, o FAMACHA teve correlação de −0,47 com o volume globular em caprinos, com hematócrito médio de 27%, 25% e 21% nos graus 2, 3 e 4 ([UFG, estudo comparativo](https://revistas.ufg.br/vet/article/download/7885/5722?inline=1)), e a Embrapa recomenda o FAMACHA adaptado para caprinos como critério de tratamento seletivo ([Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf)). Como a correlação suíça entre OPG e leite é desfavorável, selecionar só para leite num ambiente com verminose pode piorar a resistência; o sinal muda entre populações, e o erro-padrão do 0,49 não foi extraído.

Duas características ficam como lacuna. A claudicação, em três rebanhos neozelandeses, teve h² de 0,07 a 0,13 e as doenças de casco de 0,02 a 0,23, em modelos animais bivariados com ocorrência binária ([Jaques et al. 2023](https://doi.org/10.3390/ani13081374)). Tolerância ao calor e eficiência alimentar não têm parâmetros genéticos caprinos nas fontes lidas; devem ser tratadas como desconhecidas, e não como herdabilidade zero.

## A genômica caprina vive de referência pequena, multirraça e de um gene maior

### Chips: GoatSNP50 no mundo, Axiom OviCap no Capragene

O painel de referência mundial é o **GoatSNP50**, com 53.347 SNPs, desenvolvido pelo consórcio internacional (IGGC) com a Illumina e descrito em 2014 ([Tosser-Klopp et al. 2014](https://doi.org/10.1371/journal.pone.0086227)); uma revisão de 2026 o chama de "the most broadly validated platform" ([Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954)). Na França, 46.959 SNPs passaram no controle de qualidade (frequência do alelo menor acima de 1% e call rate acima de 98%), e genótipos ausentes não foram imputados ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)). O desequilíbrio de ligação é curto: r² médio de 0,14 a 50 kb, com persistência de fase entre Saanen e Alpina de 0,56 ([Carillier et al. 2013](https://doi.org/10.3168/jds.2013-6789)) **[resumo]**. A imputação do 50K para sequência completa, com o painel do projeto VarGoats, teve concordância alélica de 0,86 e concordância de genótipos de 0,75 (Alpina) e 0,73 (Saanen) ([Talouarn et al. 2020](https://doi.org/10.1186/s12863-020-0826-9)). Não foram encontradas acurácias de imputação de painéis de 5 mil a 15 mil SNPs para 50 mil em cabras leiteiras, embora a revisão de 2026 descreva essa estratégia ([Kang et al. 2026](https://doi.org/10.3389/fvets.2026.1820954)). O Capragene genotipou a Saanen com outro chip, o **Axiom_OviCap (Caprine), da Affymetrix, com 62.557 SNPs**: em 2017, 768 amostras resultaram em 672 animais e 47.056 SNPs após o controle de qualidade ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)); em 2020, eram 988 Saanen genotipadas, 947 com genótipos válidos ([Capragene, Saanen 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf)). O único estudo genômico brasileiro fora do Capragene encontrado usou o GoatSNP50 em 192 cabras Marota e Anglo-Nubianas de três rebanhos para descrever corridas de homozigose e endogamia, não para avaliação ([Diniz Sobrinho et al. 2026](https://doi.org/10.31083/fbs43536)). Como chips diferentes compartilham só parte dos SNPs, ligar a referência brasileira à francesa exigiria imputação entre painéis, que nenhuma fonte lida testou em caprinos **[inferência]**.

### ssGBLUP multirraça: a França juntou Alpina e Saanen numa só referência

A genômica francesa começou em duas etapas (DYD seguida de GBLUP) e não superou o pai médio para os candidatos; o passo único elevou a acurácia dos candidatos em **22% a 37%** nas duas raças em relação ao método de duas etapas ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)). O modelo e as matrizes, na notação das fontes, são **[equações transcritas das fontes; H⁻¹ como no relatório de corte]**:

```
y = X β + Z u + W p + e            var(u) = H σ²u     (p: ambiente permanente)
H⁻¹ = A⁻¹ + [ 0   0 ; 0   G_w⁻¹ − A₂₂⁻¹ ]
G   = M M' / (2 Σ_j p_j (1 − p_j))      M: genótipos centrados (animais × SNPs)   (Carillier et al. 2014, eq. 3,
                                         com correção de Christensen para as frequências da população-base)
G_w = 0,95·G + 0,05·A₂₂                 (Carillier-Jacquin et al. 2016; Teissier et al. 2018)

Três desenhos comparados por Carillier et al. (2014):
  multirraça        uma característica, referência Alpina + Saanen numa só avaliação
  dentro de raça    uma avaliação por raça
  multicaracterística   leite-Alpina e leite-Saanen como características distintas com correlação genética ρ
                        (ρ = 0, ρ = 0,99 ou ρ estimada)
```

A referência era de **677 machos com teste de progênie e 148 candidatos** (86 Alpinos e 62 Saanen), num total de 825 genotipados, e os autores chamam a população francesa genotipada de "the largest worldwide", com cerca de 900 machos ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)). Nos 252 machos de validação, a correlação entre DYD e GEBV no modelo multirraça foi de **0,43 para leite**, 0,44 para gordura, 0,33 para proteína, 0,61 e 0,70 para os teores, 0,47 para SCS e 0,59 a 0,64 para tipo de úbere. O multirraça deu as melhores acurácias para leite; o multicaracterística com ρ = 0,99 foi melhor para SCS e úbere; o dentro de raça perdeu pela "small size of the reference population of each breed". A correlação genética entre Alpina e Saanen foi de 0,45 (leite) a 0,76 (posição do úbere), e a regressão da DYD sobre o GEBV ficou abaixo de 1, sinal de superdispersão. A conclusão: "the most convenient model for genomic evaluation in French dairy goats would be the multi-breed model using a single-step approach". Há um conflito interno no artigo: a figura de acurácias de modelo dos candidatos vai de 0,54 a 0,74, com os teores no topo, mas o texto fala em médias de 0,5 e 0,56 para teor de gordura e de proteína ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)). Os números de acurácia desse artigo devem ser citados com essa ressalva. Uma revisão de 2024 afirma que Carillier usou "20,705 bucks and 1946 does" em diferentes tamanhos de referência ([Zhang et al. 2024](https://doi.org/10.3390/ani14182659)), o que contradiz os artigos originais: o estudo de 2013 variou a referência de 67 a 677 machos, com ou sem 1.985 fêmeas ([Carillier et al. 2013](https://doi.org/10.3168/jds.2013-6789)), e o de 2014 tinha 677 machos de referência. O número da revisão não deve ser repetido.

### A data do single-step oficial francês tem duas versões

As fontes não concordam sobre o estado do single-step na França. O artigo de Teissier et al. (2018) afirma que "ssGBLUP was implemented in 2017 in the official genetic evaluations for the two main French dairy goats", e usou dados da avaliação oficial com 2.955 animais genotipados, 7.202 genotipados no locus da αs1-caseína e 6.767.490 fêmeas com fenótipo ([Teissier et al. 2018](https://doi.org/10.1186/s12711-018-0400-3)). Já o relatório de atividades da Capgènes de 2022–2023 lista, entre os desenvolvimentos do período, um "Test sur l'utilisation de HSSGBLUP pour le calcul des index en single step génomique", ao lado do desenvolvimento da indexação genômica da maturidade em rotina, e informa que bodes jovens genômicos foram usados em **60% dos pais de bodes e 40% dos acasalamentos programados** em 2023, com precisão dos índices desses bodes "+15 points en 3 ans" ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). Em 2018, a Capgènes informava que a confiabilidade (CD) de bodes genotipados ao nascer subia cerca de 10 pontos ([Capgènes, magazine nº 2](https://www.capgenes.com/wp-content/uploads/2018/07/magazine_capgenes_n2_web.pdf)), e em 2022 que todos os bodes de IA são genotipados e indexados desde a entrada no catálogo ([Réussir/Pleinchamp 2022](https://www.pleinchamp.com/actualite/fertilite-a-l-ia-et-cellules-integreront-l-index-combine-caprin-debut-2023)). A afirmação de **"single-step desde 2018" não aparece em nenhuma fonte lida**. A conciliação possível é que o "HSSGBLUP" testado em 2022–2023 seja uma variante do single-step, e não a sua introdução; a equipe francesa testou, por exemplo, single-step com haplótipos como pseudo-SNPs ([Teissier et al. 2020](https://doi.org/10.3168/jds.2020-18662)). O significado da sigla, porém, não foi encontrado, e essa leitura é **[inferência]**. A formulação defensável é: genômica de bodes jovens operacional, ssGBLUP declarado oficial em 2017 por artigo revisado por pares, e variantes do single-step em teste em 2022–2023.

### αs1-caseína: o gene que o ssGBLUP padrão não enxerga

O locus CSN1S1 é o gene de grande efeito da cabra leiteira. Ele explica **cerca de 40% da variação genética do teor de proteína** ([Teissier et al. 2018](https://doi.org/10.1186/s12711-018-0400-3)) e, em variância fenotípica, 24,4% (Saanen) e 38,2% (Alpina) do teor de proteína, 8,7% e 18,2% do teor de gordura e só 3,3% e 6,1% da produção de leite. Os genótipos se agrupam em fortes (AA, AB, AC, BB, BC), com efeito de até 1,5 g/kg, intermediários (AE, AF, BE, BF, CE, CF), de 0,5 a 1,5 g/kg, e fracos (EE, EF), de até 0,5 g/kg; na Saanen, o efeito estimado foi de +3,7 g/kg (BC) a −0,9 g/kg (EF) ([Carillier-Jacquin et al. 2016](https://doi.org/10.1186/s12711-016-0233-x)). As raças diferem muito: AA tem frequência de 49% na Alpina e 7% na Saanen, EE de 3% e 32%, e o alelo C é raro ([Teissier et al. 2018](https://doi.org/10.1186/s12711-018-0400-3)). A França já seleciona pelo genótipo αs1 de machos e de mães de bodes, sem que as fontes lidas descrevam a regra ([Carillier-Jacquin et al. 2016](https://doi.org/10.1186/s12711-016-0233-x)).

O ssGBLUP supõe que todos os SNPs explicam a mesma variância, o que falha quando um gene domina ([Teissier et al. 2019](https://doi.org/10.3168/jds.2018-15650)). As fontes testaram três correções **[equações transcritas; parênteses reconstruídos onde a extração truncou]**:

```
1) Efeito fixo do genótipo αs1 (machos genotipados):   DYD = Xβ + Zu + Ts + e
2) Conteúdo gênico multialélico (alelos A, B, C, E, F, O):
   para cada alelo i:  y_i = μ_i + Z_i u_i + e_i ,  var(u_i) = H σ²_ui ,  σ²_ui = 2 p_i (1 − p_i)
   (prediz o número de cópias do alelo nos não genotipados) e depois
   y = Xβ + z_A α_A + z_B α_B + z_C α_C + z_E α_E + z_F α_F + z_O α_O + Z u + W p + e
3) ssGBLUP ponderado (WssGBLUP):
   â = D M'(M D M')⁻¹ û_g ;  σ²_ui = 2 â_i² p_i (1 − p_i) ;  D = diag(σ²_ui)
   G* = 0,95·M D M' / (2 Σ p_i (1 − p_i)) + 0,05·A₂₂     (iterado)
```

No teor de proteína, com 351 bodes de validação nascidos de 2008 a 2012, a correlação entre GEBV e DYD foi de **0,72 no BLUP de pedigree, 0,77 no ssGBLUP, 0,76 no conteúdo gênico e 0,79 no WssGBLUP** (avaliação multirraça; Alpina 0,71, 0,76, 0,76 e 0,78; Saanen 0,66, 0,73, 0,72 e 0,77). Os SNPs de maior peso ficaram no cromossomo 6, entre 71 e 86 Mb, região do locus da αs1-caseína, e tirar os SNPs desse cromossomo derrubou o ssGBLUP para 0,70 e o WssGBLUP para 0,66 ([Teissier et al. 2018](https://doi.org/10.1186/s12711-018-0400-3)). Para características sem QTL conhecido, o WssGBLUP foi igual ou pior que o ssGBLUP; para características com QTL presente só na Saanen, foi de 2% a 14% melhor ([Teissier et al. 2019](https://doi.org/10.3168/jds.2018-15650)) **[resumo]**. No estudo anterior, o efeito fixo do genótipo em machos genotipados elevou as acurácias de 6% a 27% e o conteúdo gênico de 1% a 14%, com ganho limitado porque **menos de 1% das fêmeas fenotipadas** tinha genótipo αs1 e porque a imputação por peeling errou as frequências (AA com 32% observado e 83% predito na Alpina) ([Carillier-Jacquin et al. 2016](https://doi.org/10.1186/s12711-016-0233-x)). Há conflito nas próprias fontes: a introdução de Teissier et al. resume o conteúdo gênico como 8% a 14% melhor que o ssGBLUP, enquanto os resultados do mesmo artigo o mostram praticamente igual.

Na Noruega, 575 cabras genotipadas para 38 SNPs dos quatro genes de caseína mostraram efeitos aditivos de SNPs de CSN1S1 e CSN3 sobre teores, produção e sabor do leite, e uma deleção no éxon 12 de CSN1S1 com frequência de 0,73, descrita só em cabras norueguesas, com efeitos de dominância e sobredominância ([Dagnachew et al. 2011](https://doi.org/10.1186/1297-9686-43-31)). Um alerta de fonte: o artigo de Oget et al. (2019) sobre mutação causal, que aparece em buscas sobre o tema, trata de ovinos leiteiros (gene SOCS2) e não serve de evidência caprina. O efeito da αs1-caseína sobre o rendimento de queijo não foi encontrado nas fontes lidas; o estudo italiano de rendimento queijeiro de cabras mostrou que coagulação mais rápida dá mais queijo e sugeriu pagamento por propriedades de coagulação, sem que as notas confirmem se ele trata do genótipo ([Vacca et al. 2020](https://doi.org/10.3168/jds.2019-16424)).

### Uma referência de centenas de animais rende acurácia de 0,3 a 0,6

A fórmula de Daetwyler et al. (2008) dá a acurácia esperada de um preditor genômico treinado em N registros não aparentados, **r = √[λh²/(λh² + 1)], com λ = N/M_e**, em que h² é a confiabilidade do fenótipo de referência e M_e o número de segmentos cromossômicos independentes; a confiabilidade é r² ([Daetwyler et al. 2008](https://doi.org/10.1371/journal.pone.0003395)). As fontes caprinas não estimam M_e, e a tabela usa dois valores hipotéticos para mostrar a ordem de grandeza **[conferido numericamente; M_e hipotético]**.

| Referência | N | r (M_e = 1.000) | r (M_e = 3.000) |
|---|---|---|---|
| Fêmeas com uma lactação (h² = 0,25), um rebanho | 388 | 0,30 | 0,18 |
| Bodes com DYD (confiabilidade 0,80), França 2014 | 677 | 0,59 | 0,39 |
| Fêmeas com uma lactação, ordem de grandeza da Saanen do Capragene | 947 | 0,44 | 0,27 |
| Bodes com DYD | 2.955 | 0,84 | 0,66 |
| Fêmeas com uma lactação | 10.000 | 0,85 | 0,67 |

A conta explica a advertência dos próprios franceses de que, "considering the relatively small sample size and the genetic structure of this population, the prediction accuracy of GEBV is not expected to be as high in these populations as in dairy cattle", lembrando que o número efetivo de fundadores era de 191 na Alpina e 124 na Saanen ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)). A fórmula supõe candidatos não aparentados à referência e por isso subestima o que se obtém dentro de um rebanho, onde os parentes estão na referência. O caso mais próximo do porte que interessa ao SeabraApp confirma isso: num único rebanho neozelandês de **839 cabras, 388 genotipadas**, o single-step BayesC elevou a acurácia dos valores genéticos de lactação de **0,20–0,22 (pedigree) para 0,34–0,43 (genômico)**, até 103% a mais ([Scholtens et al. 2021](https://doi.org/10.3390/ani11010024)). Com 388 fenótipos e M_e = 1.000, a fórmula daria 0,30; o excesso observado vem do parentesco dentro do rebanho. A revisão de 2024 acrescenta que a acurácia cresce com o tamanho da referência e que a proporção de machos e fêmeas tem um ponto ótimo, mas reconhece que a pesquisa em caprinos "is not yet complete" ([Zhang et al. 2024](https://doi.org/10.3390/ani14182659)).

### Fora da França, a genômica caprina é recente ou experimental

No **Brasil**, o Capragene publica PTAs genômicas da Saanen por ssGBLUP com Gibbs no BLUPF90 desde o sumário de 2017; no de 2020, a mudança de modelo elevou em **6% a confiabilidade média** das GPTAs ([Capragene, Saanen 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf)). Um banco de DNA com 1.148 animais, 84% Saanen, e um painel de 16 microssatélites com poder de exclusão de 99,99% servem à verificação de paternidade ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)). Não foi localizada avaliação genômica da Alpina nem da Anglo-Nubiana. Na **Noruega**, a NSG publicou índices genômicos pela primeira vez em abril de 2021: o cabrito é genotipado logo após o nascimento, entra no índice aos 4 a 6 meses, o bode entra na IA com 1,5 ano em vez de 2,5, e o intervalo de gerações pai-filho cai de 3 para 2 anos ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)); o modelo estatístico não foi identificado. Na **Itália**, o projeto CHEESR desenvolveu ssGBLUP para Camosciata delle Alpi e Saanen, com 5.509 e 2.840 animais no nível de efeito animal do ssGBLUP e 863 e 334 grupos rebanho-ano-estação ([Asso.Na.Pa., CHEESR](https://www.assonapa.it/public/cheesr/4.2_A_SviluppoValutazionessGBLUP.pdf)); a rotina não foi confirmada. Na **Espanha**, a Caprigran estaria "dando os primeiros passos" na genômica em 2022 ([Interempresas](https://www.interempresas.net/caprino/385893-Tecnificacion-y-genomica.html)) **[trecho de busca]**, e os estudos lidos são de variação no número de cópias e de SNPs de caseína. Nos **EUA**, nenhuma avaliação genômica caprina foi encontrada. No plano internacional, o projeto SMARTER reuniu 9.855 genotipados de França, Itália, Suíça e Canadá, 51% franceses, com pedigree de 6,4 milhões de animais ([Teissier et al. 2022](https://doi.org/10.3389/fgene.2022.862838)); a correlação genética entre países foi alta para tipo (0,75 a 0,95) e baixa para leite (0,45 entre França e Itália na Alpina; 0,22 a 0,26 na Saanen) ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)), e a Capgènes resume que a conexão é boa mas a correlação "insuffisante sur le lait" ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). A consequência para o Brasil é direta: importar uma referência genômica estrangeira para o leite das cabras brasileiras não é garantia de acurácia, porque até entre países europeus o leite mal se correlaciona.

## Confiabilidade, índices e esquemas de bodes transformam PTAs em decisão

### PTA, base e confiabilidade: três escalas que não se comparam

O Capragene define a PTA como o desempenho esperado das filhas "em relação à média dos animais que produziram em um mesmo rebanho participante, um mesmo ano e em uma mesma época", na unidade da característica, e calcula a base como a média das PTAs de todos os animais avaliados, ou seja, uma **base móvel**. A leitura é comparativa: um bode com PTA de +70 kg e outro com −50 kg, usados ao acaso num rebanho de nível genético igual ao da população avaliada, darão filhas com diferença média de **120 kg** de PL305. A confiabilidade depende dos registros do animal, das filhas e dos parentes, da distribuição deles entre rebanhos e ambientes, do número de contemporâneas e da herdabilidade, e o sumário é explícito: ela "não deve ser utilizada como critério de seleção", e sim para "decidir a intensidade de utilização de um reprodutor" ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)). Nos EUA, a PTA é metade do valor genético, a base é fixa (a média das cabras nascidas em 2010 é forçada a zero e atualizada a cada cinco anos), e a confiabilidade "increases as daughters are added (at a decreasing rate)", depende das contemporâneas, e bodes com filhas no mesmo rebanho-ano-estação "can be compared directly" ([Wiggans, CDCB](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf)). Na França e na Suíça, a confiabilidade é o **CD** (coeficiente de determinação). O herd-book suíço publica valores em escala relativa (menos de 80, medíocre; 90 a 110, média; mais de 120, muito bom) e dá dois exemplos: um valor de 400 kg com CD de 98% tem faixa de 274 a 526 kg, e com CD de 38%, de −300 a +1.100 kg ([SZZV](https://www.szzv.ch/fileadmin/01_szzv/06_Publikationen/Zuchtwertschaetzung/Erlaeuterungen_zu_Zuechterlisten_Zuchtwertschaetzung__F_.pdf)). As meias-amplitudes (126 e 700 kg) estão na razão de √(1 − 0,98) para √(1 − 0,38), o que indica variância de predição σ²a(1 − CD), isto é, CD igual à confiabilidade REL **[conferido numericamente; inferência]**. Na Noruega, os índices são números como 129 ou 157, que podem subir ou descer mais de 10 pontos, sem base declarada no catálogo ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)). Comparar bodes entre países exige, portanto, conversão, e comparar PTAs brasileiras de sumários diferentes exige lembrar que a base se move.

A confiabilidade a partir de filhas segue a forma corrigida na verificação do relatório de leite ([VanRaden e Wiggans 1991](https://queries.uscdcb.com/publish/jds/1991/74_2737.pdf)):

```
REL = DE / (DE + k)
k_d = (4 − 2h²)/h²   quando o mérito da mãe (das companheiras) é conhecido   (h² = 0,20 → 18; h² = 0,30 → 11,3)
k   = (4 − h²)/h²    modelo de touro com mães desconhecidas                  (h² = 0,20 → 19)
DE_total = DE_pais + DE_próprio + Σ DE_progênie ;  DE necessárias para uma REL alvo = k_d·REL/(1 − REL)
DE ≈ n (número de filhas) só quando cada filha está num rebanho diferente, com muitas contemporâneas
```

Com h² = 0,20, a PL305 precisa de **18 filhas-equivalentes para REL de 0,50** (o mínimo para publicar bodes Alpinos no Capragene) e de **42 para 0,70** (o mínimo para os bodes genômicos da Saanen em 2017) **[conferido numericamente]**. Dez filhas em rebanhos diferentes dariam 0,36; trinta, 0,63; cem, 0,85. A França traduz essa lógica numa regra de qualificação que não fala em confiabilidade: um bode só é "très diffusé" e com valor "bien estimée" quando tem filhas indexadas em **pelo menos 15 rebanhos (NE ≥ 15) e pelo menos 30 filhas indexadas (NF ≥ 30)** ([Capgènes, grade de 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf)). O Exemplo 3 mostra por que o número de rebanhos entra na regra.

### Exemplo 3: confiabilidade de um bode com poucas filhas em poucos rebanhos

O exemplo calcula a confiabilidade exata de um bode X pela variância do erro de predição num modelo de touro com grupo de contemporâneas fixo por rebanho, y = GC + s + e, com h² = 0,20 (σ²s = 0,05; σ²e = 0,95; k = 19), bodes não aparentados e informação externa entrando como filhas-equivalentes no diagonal das MME. Z é um bode de IA com REL de 0,90 vinda de outros rebanhos, e Y é um bode de monta natural que só tem filhas naquele rebanho **[conferido numericamente; desenho fictício]**.

| Situação do bode X | Filhas de X | Rebanhos | REL de X |
|---|---|---|---|
| Sozinho no grupo: todas as cabras do lote são filhas de X | 10 | 1 | 0,00 |
| Ao lado de 10 filhas de outro bode local (Y) | 10 | 1 | 0,17 |
| Ao lado de 10 filhas de um bode de IA provado (Z) | 10 | 1 | 0,20 |
| 5 filhas em cada um de 2 rebanhos, cada um com 10 filhas de Z | 10 | 2 | 0,25 |
| 2 filhas em cada um de 5 rebanhos, cada um com 10 filhas de Z | 10 | 5 | 0,30 |
| 2 filhas em cada um de 5 rebanhos, cada um com 10 filhas de um bode local diferente | 10 | 5 | 0,29 |
| 1 filha em cada um de 10 rebanhos, cada um com 10 filhas de Z | 10 | 10 | 0,31 |
| Fórmula DE ≈ n: 10/(10 + 19) | 10 | — | 0,34 |
| 30 filhas no mesmo grupo, ao lado de 30 filhas de Z | 30 | 1 | 0,42 |
| 2 filhas em cada um de 15 rebanhos, cada um com 10 filhas de Z | 30 | 15 | 0,54 |
| O mesmo, com 40 filhas de Z por rebanho | 30 | 15 | 0,57 |
| Fórmula DE ≈ n: 30/(30 + 19) | 30 | — | 0,61 |

A tabela tem três mensagens. Um bode cujas filhas não têm contemporâneas de outro pai **não tem avaliação nenhuma**: o grupo de contemporâneas absorve tudo, e a confiabilidade fica na da informação de pedigree (zero, no exemplo). Dez filhas num só rebanho valem cerca de metade de dez filhas espalhadas, porque cada filha é comparada só com as companheiras do mesmo grupo; o mesmo vale para trinta filhas (0,42 contra 0,54). E a fórmula DE ≈ n é um teto, alcançado só com muitas contemporâneas por grupo. É por isso que a regra francesa exige 15 rebanhos e não só 30 filhas, que o teste de progênie do Capragene exigiu, em 2005, no mínimo 30 matrizes por criador para inseminação com os bodes em teste ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)), e que o modelo americano tem um efeito de rebanho-bode. O exemplo usa modelo de touro sem parentesco; no modelo animal, a informação das mães e das avós eleva um pouco esses números, mas não muda a ordem.

### Índices: do ICC francês à ausência de índice no Capragene

A França usa o **índice combinado caprino (ICC)** como "critère de sélection économique retenu par l'ensemble de la filière caprine". Na versão de 2012, ele soma o índice de produção (IPC) e o índice morfológico (IMC), com peso diferente por raça ([Capgènes, grade de 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf)):

```
ICC (Alpina) = IPC + 0,5·IMC          ICC (Saanen) = IPC + 0,6·IMC
IPC = MP + 0,4·TP + 0,2·MG + 0,1·TB   (MP, MG: quantidade de proteína e de gordura; TP, TB: teores)
IMC = ligamento anterior + perfil + piso do úbere + orientação dos tetos + largura da inserção posterior
```

A grade diz que o ICC usa quantidades e teores de proteína e gordura "depuis 1999" e integrou a morfologia em 2012; uma reportagem de 2022 diz que o ICC foi difundido pela primeira vez em 1996 e que a morfologia entrou cerca de dez anos antes ([Réussir/Pleinchamp 2022](https://www.pleinchamp.com/actualite/fertilite-a-l-ia-et-cellules-integreront-l-index-combine-caprin-debut-2023)); o conflito de datas fica registrado. A mesma reportagem anuncia que a CCS (calculada e divulgada desde 2016) e a fertilidade à IA entrariam no ICC no início de 2023, com peso relativamente grande por estarem ligadas à longevidade. A apresentação do Idele de 2023 mostra a composição do ICC em gráficos de pizza: produção **62% (Alpina) e 55% (Saanen)**, tipo **25% e 28%**, CCS **13% e 17%**; com a entrada do sucesso da IA, a Alpina passa a **53% de produção, 21% de tipo, 10% de CCS e 16% de sucesso da IA**, e a Saanen recebe 15% para a IA ([Clément, Piacère e Chassier 2023](https://docs.eaap.org/2023/S79T07.pdf)) **[leitura de gráfico, conferida na imagem do slide]**. Os slides não dizem se as porcentagens são pesos econômicos ou contribuições à resposta, e os coeficientes da fórmula de 2023 não foram encontrados. Uma leitura alternativa do mesmo slide, que trocava as fatias de produção e de tipo, não se confirma na imagem: a produção é a maior fatia. O IMC do slide de 2023 lista ligamento anterior, perfil, profundidade do úbere, inserção posterior e implantação dos tetos, composição que difere da fórmula de 2012.

A grade de 2012 converte o ICC em qualificações. Para bodes Alpinos "très diffusés" (NE ≥ 15 e NF ≥ 30) com IMC conhecido, a qualificação é **A com ICC ≥ +2,5 e B com ICC ≥ +2,0**; sem IMC, vale o IPC (B com 125 ou mais); bodes pouco difundidos recebem no máximo E ou F; bodes com nota de conformação 2 não são qualificados. Para cabras, os limiares são fixados para que, no país, 20% sejam A ou P, 15% B, 50% C, 10% sem qualificação e 5% X (com defeito); uma cabra com **ICC acima de 3,4** e sem problema de corpo, aprumos e tetos é "A (mère à boucs)", e a grade recomenda acasalamentos pai A × mãe A ou B e desaconselha guardar reposição de pais não qualificados ([Capgènes, grade de 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf)). Em 2023, o potencial de mãe de bode era uma fêmea em 2ª lactação com IPC acima de 121 ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). Os limiares de IPC (120 a 134) e os de ICC (−1,0 a 3,4) não podem estar na mesma escala da fórmula ICC = IPC + k·IMC, e os documentos lidos não declaram a escala nem a base; por isso o Exemplo 4 usa valores na unidade dos limiares do ICC, sem converter.

Os outros países publicam fórmulas mais simples. Na Itália, a Asso.Na.Pa. calcula valores genéticos para leite, gordura e proteína (kg e %), o índice agregado de qualidade **IAQ = IPG + 4 × IPP** (índices de gordura e de proteína) e o **índice global = 70% IAQ + 30% morfologia**, com cinco caracteres de úbere ([Asso.Na.Pa., normas técnicas](https://www.assonapa.it/public/NormeTecniche-ProgrammiGenetici-Caprini.pdf)). Nos EUA, a produção é resumida em dólares: **MFP$ = 0,01·PTA_leite + 1,15·PTA_gordura + 2,55·PTA_proteína** ([Wiggans, CDCB](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf)), sem unidade declarada; o CDCB publica hoje os índices Net Merit e Fluid Merit, cujas fórmulas não foram verificadas ([CDCB](https://uscdcb.com/dairy-goats/)), e a ADGA combina produção e tipo nas razões 2:1 e 1:2 ([ADGA](https://adga.org/performance-programs/production-testing/)) **[trecho de busca]**. Na Espanha, um estudo da raça Florida construiu índices para quatro cenários econômicos (leite; leite e queijo; queijo; leite, sólidos e venda de reprodutores), com pesos fornecidos pela associação Acriflor e caracteres que vão de leite e gordura mais proteína a caseína, CCS, morfologia e duração da lactação; no cenário de leite, o índice 3 dá peso 40 ao leite, 30 à duração da lactação, 10 ao úbere, 5 a corpo e reprodução e −10 à CCS. A conclusão é a regra geral dos índices: incluir caracteres secundários dá resposta correlacionada positiva neles, "but a reduction of the responses in the primary criteria" ([Ziadi et al. 2023](https://doi.org/10.3390/dairy4040042)). Na Noruega, os bodes do ano precisavam de índice total ("samlet avlsverdi") de pelo menos 130, sem fórmula publicada no catálogo ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)).

O **Capragene não publica índice composto**: os sumários de 2017, 2020 e 2021 apresentam PTAs separadas para PL305, gordura, proteína, extrato seco, lactose, CCS e duração da lactação, e a seleção é pela PTA de PL305 ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)). A única proposta brasileira de objetivo de seleção encontrada é a simulação de Lôbo et al. (2014), que pôs leite, duração da lactação, idade ao primeiro parto, intervalo de partos, CCS e teores no objetivo e concluiu que o leite responde por 95% do lucro genético no esquema tradicional e 60% no teste de progênie, com a CCS em segundo lugar ([Lôbo et al. 2014](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1010026/1/cnpc2014EvaluationofBrazilian.pdf)). A Tabela 2 desse trabalho, com os valores econômicos, parece mal transcrita (traz, por exemplo, duração média de lactação de 676 dias), e por isso seus valores não são usados aqui.

### Exemplo 4: ICC e MFP$ de dois bodes

Os índices elementares abaixo são fictícios, na unidade dos limiares do ICC da grade de 2012 **[conferido numericamente]**.

| Bode | MP | TP | MG | TB | IMC | IPC | ICC Alpina | ICC Saanen | Qualificação Alpina (NE ≥ 15, NF ≥ 30) |
|---|---|---|---|---|---|---|---|---|---|
| A (produção alta, úbere fraco) | +1,8 | +0,4 | +1,5 | +0,2 | −0,6 | 2,28 | **1,98** | 1,92 | sem qualificação (< 2,0) |
| B (produção média, úbere bom) | +1,0 | +1,2 | +0,8 | +1,0 | +1,2 | 1,74 | **2,34** | 2,46 | B (≥ 2,0 e < 2,5) |

O passo a passo é: IPC_A = 1,8 + 0,4 × 0,4 + 0,2 × 1,5 + 0,1 × 0,2 = 2,28; ICC_A (Alpina) = 2,28 + 0,5 × (−0,6) = 1,98; IPC_B = 1,0 + 0,48 + 0,16 + 0,10 = 1,74; ICC_B = 1,74 + 0,5 × 1,2 = 2,34. O bode A é melhor em produção, mas o úbere o tira da qualificação; na Saanen, com peso 0,6 no IMC, a distância aumenta. Com a composição de 2023 lida no slide, aplicada a valores padronizados fictícios (A: produção +1,5, tipo −0,8, CCS −0,5 e IA −0,3 desvios-padrão; B: +0,9, +1,0, +0,6 e +0,4), o índice vale 0,53 para A e 0,81 para B; com a composição anterior (62/25/13), 0,67 e 0,89. A inclusão da fertilidade amplia a vantagem de B, porque A é pior também nas características novas **[conferido numericamente; pesos lidos em gráfico]**.

Na MFP$, um bode C com PTAs de +150 de leite, +4 de gordura e +3 de proteína vale 0,01 × 150 + 1,15 × 4 + 2,55 × 3 = **13,75**, e um bode D com +40, +6 e +4,5 vale **18,77**: D ganha com 110 unidades a menos de leite, porque cada unidade de proteína vale 2,2 vezes uma de gordura e 255 vezes uma de leite **[conferido numericamente]**. O exemplo deixa claro por que um produtor brasileiro que vende leite por volume e um que faz queijo deveriam escolher bodes diferentes, e por que um índice só faz sentido com a fórmula de pagamento ao lado, como nos cenários da Florida.

### Esquemas de seleção de bodes: pirâmide francesa, genômica norueguesa e teste de progênie brasileiro

O esquema francês é uma pirâmide: **núcleo de 150 mil cabras em 600 rebanhos, controle leiteiro oficial de 330 mil cabras em 1.500 rebanhos e população de 1 milhão de cabras em 7.500 rebanhos**, com IA em todas as camadas ([Clément, Piacère e Chassier 2023](https://docs.eaap.org/2023/S79T07.pdf)); o relatório da Capgènes confirma as 330 mil cabras controladas, mas o seu infográfico traz 900 rebanhos em controle oficial e 4.500 na população **[leitura de gráfico]**, conflito não resolvido ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). Em 2018, a taxa de IA nos rebanhos do núcleo era de 40%, cerca de metade dos bodes jovens era eliminada antes do teste de progênie, sobretudo por produção de sêmen, os bodes eram testados individualmente aos 7 a 8 meses e produziam sêmen aos 14 meses com tratamento fotoperiódico, e a base tinha 2.086 bodes e 254 mil coletas de 1995 a 2016 ([Clément, Charton e Larroque 2018](https://docs.eaap.org/2018/Session26/S26_11_Clement.pdf)). Na campanha de 2022–2023, 318 bodes produziram 220.391 doses, 140 machos foram comprados entre 400 genotipados e 115 entraram no catálogo de 2023 (67 Alpinos e 48 Saanen), e os acasalamentos programados passaram a considerar o parentesco genômico e o índice de fertilidade ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). Um trecho de busca atribui à Capgènes o teste de progênie de cerca de 80 bodes por ano somando as duas raças, com 34% de IA no núcleo **[trecho de busca]**.

A Noruega mostra o esquema de uma população pequena: cabrito genotipado ao nascer, índice aos 4 a 6 meses, IA com 1,5 ano, intervalo pai-filho de 2 anos, compra de sêmen "fra mange bukker" como seguro contra mudanças de índice e importação de sêmen de Alpina francesa a cada dois anos para limitar a consanguinidade ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)). No Brasil, o teste de progênie do Capragene começou em 2005 com 15 criadores (12 de Saanen, 2 de Anglo-Nubiana e 1 de Alpina) e grupos de bodes em 2005, 2009, 2011 e 2015, escolhidos primeiro pela produção da mãe e depois pelo valor genético predito; a progênie ficou abaixo do esperado por causa de poucos rebanhos colaboradores e baixa difusão da IA, e o ganho foi de 4,54 kg/ano de PL305 depois da implantação do programa ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)). A simulação econômica de Lôbo et al. (2014), com 600 mil cabras e núcleo de 40 mil, deu valor presente líquido negativo (−US$ 2,28) ao esquema tradicional de núcleo fechado e retorno de 20% ao teste de progênie; o tradicional só se pagaria com 60% dos bodes comerciais vindos do núcleo, "no practical feasibility due the low use of artificial insemination in Brazil", e o uso de bodes jovens deveria ficar em até 15% ([Lôbo et al. 2014](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1010026/1/cnpc2014EvaluationofBrazilian.pdf)). O mesmo trabalho observa que não há definição clara de rebanhos multiplicadores no Brasil.

### Exemplo 5: ganho genético esperado

A resposta anual à seleção pelos quatro caminhos é ΔG = (Σ iₖ·rₖ)·σa / Σ Lₖ, com i a intensidade, r a acurácia e L o intervalo de gerações de cada caminho (pai de bode, pai de cabra, mãe de bode, mãe de cabra), na forma de Rendel e Robertson ([Rendel e Robertson 1950](https://doi.org/10.1007/bf02986789)), conferida na verificação do relatório de leite. O exemplo usa σa = 89,4 kg de PL305 e intensidades da normal truncada (5% selecionados: i = 2,063; 10%: 1,755; 15%: 1,554; 20%: 1,400; 80%: 0,350). O intervalo de 5,5 anos do caminho pai-filho com teste de progênie vem da França ([Carillier et al. 2014](https://doi.org/10.1186/s12711-014-0067-3)), o de 2 anos com genômica vem da Noruega ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)); as demais acurácias e intervalos são hipóteses **[conferido numericamente; entradas marcadas como hipóteses]**.

| Cenário | Caminhos (i; r; L) | ΔG (kg de PL305/ano) |
|---|---|---|
| Teste de progênie (bodes com cerca de 30 filhas, REL 0,62) | pais de bodes e de cabras (1,400; 0,79; 5,5); mães de bodes (2,063; 0,60; 4); mães de cabras (0,350; 0,55; 4) | **17,1** |
| Bodes jovens genômicos (r = 0,65) | pais de bodes (2,063; 0,65; 2); pais de cabras (1,554; 0,65; 2,5); mães de bodes (1,755; 0,65; 3,5); mães de cabras (0,350; 0,55; 4) | **27,5** |
| Rebanho comercial que compra bodes entre os 15% melhores, REL 0,60 (dois caminhos) | bodes (1,554; 0,775; 4); cabras (0,350; 0,55; 4) | **15,6** |
| Rebanho que compra bodes pela produção da mãe (dois caminhos) | bodes (1,554; 0,224; 3); cabras (0,350; 0,447; 4) | **6,4** |

Os números teóricos ficam muito acima do que se realizou. A Saanen do Capragene ganhou **6,34 kg/ano** de PL305 (R² = 0,73), e o próprio sumário cita Rendel e Robertson para um potencial de até 1,8% da média ao ano, o que daria mais de 13,1 kg/ano sobre a média de 727,44 kg ([Capragene, Saanen 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf)); a Alpina teve inclinação de 4,05 kg/ano na figura de tendência, com períodos de estagnação e queda ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)) **[leitura de gráfico]**. A simulação de Lôbo et al. previa 39,9 a 55,0 kg/ano para o leite, de 6 a 9 vezes o realizado, e citava dados de campo brasileiros de −0,81 a 1,05 kg/ano ([Lôbo et al. 2014](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1010026/1/cnpc2014EvaluationofBrazilian.pdf)). A diferença entre o teórico e o realizado tem as mesmas causas nos dois países: poucos bodes testados, intensidade efetiva baixa porque a IA é pouca e a monta natural espalha bodes não avaliados, e confiabilidade baixa por filhas concentradas em poucos rebanhos. O último cenário da tabela é o mais comum em rebanhos brasileiros e rende 6,4 kg/ano, menos da metade do cenário em que o mesmo rebanho compra bodes avaliados.

### Conectividade: o CD entre rebanhos e a correlação entre países

Comparar rebanhos só é possível se eles compartilham genética. A França usava um critério simples (o rebanho é conectado se as porcentagens de paternidade conhecida e de filhas de IA superam um limiar por ordem de lactação) e propôs o **CACO**, o CD do contraste entre o rebanho e o conjunto conectado. Na média, o CACO foi de 0,34 (desvio-padrão de 0,26), teve correlação de 0,76 com a porcentagem de netas de IA e de 0,92 entre 2003 e 2004, e 8% dos rebanhos mudaram muito de um ano para o outro ([Bluet et al. 2006](https://temp.journees3r.fr/wp-content/uploads/2007/12/2006_7_genetique_11_Bluet-2af.pdf)). A base teórica é a variância do erro de predição da diferença entre efeitos de unidades de manejo ([Kennedy e Trus 1993](https://doi.org/10.2527/1993.7192341x)) **[só referência]**. Entre países, a avaliação conjunta trata cada país como uma característica: no SMARTER, as correlações para leite foram baixas (0,22 a 0,45) e as de tipo altas (0,75 a 0,95), com fluxo de genética sobretudo da França para os outros ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)). Para um rebanho pequeno, a conectividade se compra de duas formas: inseminação com bodes avaliados, que põe filhas de um pai comum em vários rebanhos, ou bodes vindos de rebanhos já conectados.

### Endogamia na população: Ne de 129 a 149 na França e possivelmente 40 na Saanen brasileira

Em 2012, a França tinha **Ne de 129 na Saanen e 149 na Alpina** (76 na Angorá), com 51 e 46 ancestrais efetivos, e os autores registram que a variabilidade "has narrowed as an effect of 30 years of efficient selection" ([Danchin-Burge et al. 2012](https://doi.org/10.1016/j.smallrumres.2012.03.016)) **[resumo]**. Pela relação Ne = 1/(2ΔF), esses valores equivalem a ΔF de 0,34% a 0,39% por geração **[conferido numericamente]**. A Capgènes emite um relatório individual de variabilidade genética (RAGEMO) com consanguinidade, parentesco e genes de interesse ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)). Para a Saanen brasileira, um estudo de 2020 relatou F médio de 0,78%, parentesco médio de 1,48%, Ne baixo (39,69 no resumo truncado) e perda de **2,31 kg de PL305 por 1% de endogamia** ([Small Rumin. Res. 2020](https://doi.org/10.1016/j.smallrumres.2020.106194)) **[trecho de busca]**; se o Ne de cerca de 40 se confirmar, o ΔF implícito é de cerca de 1,26% por geração, acima do limite de 1% atribuído à FAO. Nos EUA, sete de oito raças leiteiras estavam dentro dos limites sustentáveis, com ΔF < 0,5% (Ne 100) como meta preferida e ΔF < 1% (Ne 50) como mínimo ([IGA](https://iga-goatworld.com/blog/status-of-genetic-diversity-of-u-s-dairy-goat-breeds)). O limite de 1% por geração é citado por fontes secundárias como recomendação da FAO, e o texto original não foi lido.

## Os programas de N grande escolheram modelos diferentes para o mesmo problema

O quadro resume o que cada programa com avaliação oficial documentada usa. "N grande", em caprinos, é relativo: a maior base, a francesa, controla 330 mil cabras, e a Caprigran espanhola teria certificado cerca de 213 mil lactações em 2022 **[trecho de busca]**, enquanto o sumário Saanen do Capragene de 2020 usou 6.941 lactações, uma diferença de cerca de 30 vezes em relação à Espanha.

| Programa (quem avalia) | Escala documentada | Fenótipo de produção | Modelo de avaliação | Genômica | Índice e publicação |
|---|---|---|---|---|---|
| **França** (Capgènes seleciona; Idele-GenEval avalia, com o INRAE) | 330 mil cabras controladas (2022–23); 37.837 primíparas pontuadas (2023) ([Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf)) | Lactação de referência de 250 d (MYI); dia de controle de 7 a 270 d estudado ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389); [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)) | Modelo animal multicaracterística, rebanho × ano × ordem de parto fixo; leite da 1ª à 10ª lactação; regressão aleatória com Legendre de ordem 4 e posto 2 descrita como implantada para persistência em primíparas (status atual não confirmado) | ssGBLUP multirraça Alpina + Saanen, oficial em 2017 segundo [Teissier et al. 2018](https://doi.org/10.1186/s12711-018-0400-3); "HSSGBLUP" em teste em 2022–23; αs1 por WssGBLUP e conteúdo gênico em pesquisa | ICC = IPC + 0,5 ou 0,6·IMC (2012); CCS e sucesso da IA desde 2023 (Alpina 53/21/10/16%); qualificações A a F; CD |
| **Espanha** (Caprigran, Murciano-Granadina; Acriflor, Florida; Caprama, Malagueña) | Caprigran 2020: 134.975 lactações, pedigree de 50.483 animais em 119 rebanhos ([Interempresas 2020](https://www.interempresas.net/caprino/317863-Caprigran-publica-su-Catalogo-de-Sementales-2020-con-aumento-de-exportacion-de-genetica.html)); 212.928 lactações certificadas em 2022 **[trecho de busca]** | 210 d (Caprigran) **[trecho de busca]** | BLUP, avaliação semestral (2020); regressão aleatória e THI em pesquisa ([Menéndez-Buxadera et al. 2021](https://doi.org/10.3390/ani11030736)) | "Primeiros passos" em 2022 **[trecho de busca]** | Índices por cenário econômico na Florida ([Ziadi et al. 2023](https://doi.org/10.3390/dairy4040042)); catálogos de reprodutores |
| **Itália** (Asso.Na.Pa.) | Alpina 170.932 e Saanen 189.395 fenótipos no estudo SMARTER ([Teissier et al. 2024](https://doi.org/10.3168/jdsc.2023-0389)) | 210 d pré-ajustada por ordem, idade e número de crias | y = m + HYS + animal + e, HYS fixo ([CHEESR](https://www.assonapa.it/public/cheesr/4.2_A_SviluppoValutazionessGBLUP.pdf)) | ssGBLUP no projeto CHEESR; rotina não confirmada | IAQ = IPG + 4·IPP; índice global 70% IAQ + 30% morfologia ([normas técnicas](https://www.assonapa.it/public/NormeTecniche-ProgrammiGenetici-Caprini.pdf)) |
| **Noruega** (NSG) | Índices genômicos de bodes de 50 rebanhos de elite (2021) | Leite, gordura, proteína, lactose, ácidos graxos livres, CCS, úbere e velocidade de ordenha | Não identificado | Índices genômicos desde abril de 2021; intervalo pai-filho de 3 para 2 anos ([NSG](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)) | Índice total de pelo menos 130 para os bodes do ano; fórmula não publicada |
| **EUA** (CDCB avalia; ADGA fornece tipo e pedigree) | 589 rebanhos e 17.381 cabras em 1º/1/2016; nove raças ([Wiggans](https://blogs.cornell.edu/smallruminantdairy/files/2017/09/IMPLEMENTATION-OF-GENETIC-EVALUATION-1bu3qk0.pdf); [CDCB](https://uscdcb.com/dairy-goats/)) | 305 d, registros curtos projetados | y = hys + hs + pe + a + e; tipo por modelo animal multicaracterística desde 1995; produção em agosto e dezembro | Não encontrada | MFP$ (c. 2016); Net Merit e Fluid Merit; base: cabras nascidas em 2010 |
| **Brasil** (Capragene: Embrapa Caprinos e Ovinos, ACCOMIG/Caprileite, MAPA, ABCC) | Saanen 2020: 6.941 lactações, 3.949 cabras, 34 rebanhos; Alpina 2021: 1.072 lactações, 654 cabras, 14 rebanhos; mais de 77 mil controles ([2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf); [2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)) | PL305 (≥ 60 d, ≥ 3 controles, 1º controle até 75 d) e mais seis características | Modelo animal multicaracterística com ambiente permanente; GC fixo (Saanen 2017) ou aleatório (Alpina 2021); tipo de parto × sexo das crias; idade; tipo de ordenha | ssGBLUP por Gibbs no BLUPF90, só Saanen (947 genotipadas, Axiom OviCap) | Sem índice composto; PTA por característica; publica bodes com REL ≥ 0,50 e PTA acima da média + 1 DP |

Quatro escolhas separam os programas. A primeira é a **lactação de referência**, que muda o próprio fenótipo (210, 250 ou 305 dias; TMY ou TMM). A segunda é o **tratamento das contemporâneas**: fixo onde há muitos animais por grupo (França, Itália), aleatório onde há poucos (Alpina brasileira), com interação rebanho-bode onde o desenho do teste de progênie concentra filhas (EUA). A terceira é a **genômica**: o single-step multirraça é a escolha de quem tem referência de centenas de animais e duas raças aparentadas (França) e foi adotado também pelo Capragene na Saanen, enquanto a Noruega publica índices genômicos sem modelo documentado e os EUA não têm genômica caprina. A quarta é o **índice**: a França pondera produção, úbere, células e fertilidade; a Itália mantém uma fórmula transparente de qualidade e morfologia; os EUA convertem produção em dólares; o Brasil publica características separadas. Fora desse grupo, o Canadá participa de estudos internacionais com produção de 305 dias por regressão aleatória e ssGBLUP para estudos de associação com 833 Alpinas e 874 Saanen genotipadas ([J. Dairy Sci. 2023](https://doi.org/10.3168/jds.2022-22223)); a Suíça publica valores genéticos só de produção de leite para Saanen, Toggenburg e Chamoisée, com cabras de lactação de pelo menos 100 dias e bodes publicados a partir de 8 filhas ([SZZV](https://www.szzv.ch/fileadmin/01_szzv/06_Publikationen/Zuchtwertschaetzung/Erlaeuterungen_zu_Zuechterlisten_Zuchtwertschaetzung__F_.pdf)); e Grécia, Reino Unido, Países Baixos e México não têm programa oficial de avaliação de caprinos leiteiros documentado para 2020–2026 nas fontes consultadas.

## Indicadores e metas por categoria têm pouca referência brasileira com fonte

### Os indicadores do rebanho e como calculá-los

Os indicadores zootécnicos abaixo são definições operacionais de uso corrente, adotadas aqui porque nenhuma norma brasileira as fixa para caprinos. O app deve calculá-las sempre com numerador e denominador visíveis, para permitir o intervalo de confiança.

```
Produção
  Leite por cabra em lactação por dia = PL da lactação / duração da lactação
  Leite por cabra presente por dia    = leite do período / (cabras presentes × dias do período)
  PL305, PL250, PL210                  = Fleischmann (TIM) ou Wood, conforme o Exemplo 1 (declarar TMY ou TMM)
  Pico = b/c dias e a·(b/c)^b·e^(−b) kg (Wood); persistência operacional = y(240)/y(40)
  CCS da cabra = média geométrica = 100·2^(SCS médio − 3) mil células/mL; % de controles acima de 1.000 mil
Reprodução
  Intervalo entre partos (dias) = data do parto n+1 − data do parto n
  Idade ao primeiro parto (meses) = (data do 1º parto − nascimento)/30,4
  Taxa de concepção = prenhezes diagnosticadas / cabras cobertas ou inseminadas
  Taxa de parição = cabras paridas / cabras expostas        Prolificidade = cabritos nascidos / cabras paridas
  Taxa de aborto = abortos / gestações diagnosticadas         Mortalidade até o desmame = mortos / nascidos
  Cabritos desmamados por cabra por ano = prolificidade × (1 − mortalidade) × 365/IEP
Saúde e rebanho
  % FAMACHA 4 ou 5 por coleta; OPG médio na escala (OPG + 1)^(1/3); prevalência de CAE = positivas/testadas
  Descarte = saídas no ano / matrizes médias        Reposição = fêmeas incorporadas / matrizes médias
  Vida produtiva = idade ao descarte − idade ao 1º parto
  % do peso adulto na cobertura = peso na 1ª cobertura / peso médio das adultas do próprio rebanho
```

As referências numéricas brasileiras com fonte são poucas e heterogêneas. A produção média nacional era de **0,633 L por cabra ordenhada por dia** (0,556 no Nordeste e 1,179 no Sudeste), com base no IBGE de 2006 ([Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf)); sistemas intensivos acompanhados pelo Balde Cheio chegam a 2,3 L por cabra em lactação por dia ([Embrapa, Balde Cheio](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1099498/1/ProgramaBaldeCheio.pdf)); o modelo de rebanho familiar do Rio Grande do Norte usa 1,35 L por cabra em lactação, lactação de 148 dias, 90% de cabras paridas e reposição de 22% ao ano ([Holanda Júnior et al. 2006](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/534563/1/cot74.pdf)). Nos rebanhos do Capragene, a PL305 média foi de 727,4 kg em 300 dias na Saanen (2020) e de 764,6 kg em 297 dias na Alpina (2021); num levantamento anterior, foi de 547 ± 323 kg na Saanen e 189 ± 113 kg na Anglo-Nubiana, com 2,26 e 1,15 kg por dia ([Santos et al. 2011](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/916648/1/RACProducaoecomposicao.pdf)). O desvio-padrão de cerca de 60% da média significa que, num rebanho de 20 a 50 cabras, a média do rebanho tem erro grande e deve vir com mediana e intervalo. Para a qualidade do leite, a IN 37/2000, conforme fontes secundárias, fixa contagem padrão em placas de até 500 mil UFC/mL e mínimos de 2,8% de proteína, 4,3% de lactose, 8,2% de sólidos não gordurosos e 11,2% de extrato seco, sem limite de CCS; o mínimo de gordura aparece como 3,0 g/100 g na Embrapa e como 2,9% em outra fonte, conflito não resolvido sem o texto oficial ([Magalhães, UFV](https://www.dti.ufv.br/dzo/caprinos/artigos_tec/hig_quali.pdf); [Souza et al. 2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf)). Em 532 amostras de latão do Cariri Paraibano e do Sertão Pernambucano, a CCS média foi de 778 mil células/mL, **41% das amostras passaram de 1 milhão** e a lactose média (4,11%) ficou abaixo do mínimo da IN 37 ([Souza et al. 2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf)). Na reprodução, a Embrapa adverte que "a grande maioria dos produtores não anota o nascimento dos filhotes" e, por isso, não conhece o intervalo entre partos ([Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf)). A soroprevalência de CAE variou de 1% no Ceará em 2001 (11,1% na região metropolitana de Fortaleza; 5,0% em raças puras contra 0,1% em mestiços) ([Pinheiro et al. 2001](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/515385/1/APIPrevalenciadainfeccaopelo.pdf)) a 43% em rebanhos leiteiros intensivos de São Paulo ([UNESP](https://repositorio.unesp.br/handle/11449/99385)) **[trecho de busca]**, e por isso o rebanho deve se comparar com o próprio histórico, não com uma média regional.

### Metas por categoria: o que tem fonte e o que é proposta

A tabela separa referências com fonte de propostas deste relatório. Onde não há referência brasileira, a meta é **relativa**: desvio em relação às contemporâneas, posição no rebanho ou tendência com intervalo de confiança, e não um número absoluto copiado de outro sistema de produção.

| Categoria | Indicador | Meta ou referência | Origem |
|---|---|---|---|
| Cabritas | Peso à primeira cobertura | Pelo menos 25 kg e 60% a 70% do peso médio das adultas medido no próprio rebanho | 25 kg: [Embrapa, Manejo de caprinos](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/70543/1/Manejodecaprinos0001.pdf) (texto com OCR, sem distinção de raça); faixa de 60% a 70%: **proposta**, entre os 59% de Saanen turcas **[trecho de busca]** e os 70% que só aparecem em fórum |
| Cabritas | Idade ao primeiro parto | Referência de 18 meses; alerta acima de 21 meses | 18 meses: rebanho de Sobral ([Araújo et al.](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf)); média histórica de 634 dias na Saanen ([Lôbo e Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)); alerta: **proposta** |
| Cabritas | Mortalidade até o desmame | Queda ano a ano, julgada com intervalo exato | **Proposta**; sem referência brasileira com fonte |
| Cabritas | Mérito genético | Média das PTAs dos pais acima da média do rebanho; não guardar filhas de pais não qualificados | Média dos pais como expectativa do cabrito ([NSG](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)); recomendação de acasalamento ([Capgènes 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf)) |
| Primíparas | PL305 (ou PL250) | Desvio em relação ao grupo de contemporâneas ≥ 0; referência nacional de 727 kg (Saanen, todas as ordens) | Desvio: **proposta**; média: [Capragene 2020](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1128273/1/CNPC-2020-Art31.pdf) |
| Primíparas | Duração da lactação | Próxima de 10 meses, com IEP de 12, em Saanen e Alpina em sistema intensivo; 8 meses na Anglo-Nubiana | [Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf), citando Nascimento et al. 2011 |
| Primíparas | Células somáticas | Média geométrica abaixo de 1 milhão de células/mL e fração de controles acima disso em queda | Limiar de detecção da Embrapa ([Souza et al. 2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf)); forma da meta: **proposta** |
| Primíparas | Úbere | Nenhuma nota 2 por defeito isolado na pontagem (ligamento anterior, perfil ou piso abaixo de 3; orientação dos tetos abaixo de 3 ou acima de 7) | Grade de qualificação ([Capgènes 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf)) |
| Primíparas | Permanência | Descarte antes do fim da 1ª lactação bem abaixo dos 46% de Sobral | Referência: [Araújo et al.](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf); meta: **proposta** |
| Adultas | Intervalo entre partos | 12 meses (Saanen e Alpina intensivas); 10 meses (Anglo-Nubiana) | [Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) |
| Adultas | Produção ao longo da vida | Descartar pela MPPA, não pela idade: cabras são mais produtivas depois da 3ª lactação, com pico entre 4 e 8 anos e queda depois da 6ª lactação | [Araújo et al.](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf); regra: **proposta** |
| Adultas | Vida produtiva | Acima dos 25,7 meses de Sobral | Referência: [Araújo et al.](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf); meta: **proposta** |
| Adultas | Aborto e prolificidade | Acompanhar com intervalo exato; 14% a 17% de aborto por ordem de parto em Murciano-Granadina é referência estrangeira, não meta | [Takalu et al. 2026](https://doi.org/10.1016/j.vas.2026.100673) |
| Adultas | Verminose | Fração de cabras com FAMACHA 4 ou 5 por coleta em queda; OPG na escala de raiz cúbica | FAMACHA como critério de tratamento ([Perdigão et al. 2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf)); meta: **proposta** |
| Adultas | Mãe de bode | PTA de PL305 entre os 15% melhores com REL ≥ 0,40 (Capragene publica cabras assim); na França, ICC acima de 3,4 ou IPC acima de 121 na 2ª lactação | [Capragene 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf); [Capgènes 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf); [Capgènes 2024](https://www.capgenes.com/wp-content/uploads/2024/07/Capgenes-DocumentAG-2024_V3_WEB.pdf) |
| Bodes | Mérito | PTA de PL305 acima da média + 1 DP (34 kg na Alpina em 2021) | [Capragene 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf) |
| Bodes | Confiabilidade para uso intenso | REL ≥ 0,50 (≥ 0,70 para PTA genômica na Saanen de 2017); com REL menor, mais bodes e menos acasalamentos por bode | [Capragene 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf); [Capragene 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf) |
| Bodes | Difusão das filhas | Filhas em pelo menos 15 rebanhos e pelo menos 30 filhas indexadas | [Capgènes 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf) |
| Bodes | Índice (França) | ICC ≥ +2,0 para B e ≥ +2,5 para A (Alpina, bodes difundidos com IMC conhecido) | [Capgènes 2012](https://www.capgenes.com/wp-content/uploads/2017/11/GrilleQualif_Final_nov2012.pdf) |
| Bodes | Endogamia | F de cada acasalamento planejado até 6,25% como alerta; ΔF do rebanho até 1% por geração (Ne ≥ 50) | 6,25%: **proposta**; 1%: recomendação atribuída à FAO por fontes secundárias ([IGA](https://iga-goatworld.com/blog/status-of-genetic-diversity-of-u-s-dairy-goat-breeds)) |
| Bodes | Bodes jovens sem prova | Até 10% a 15% dos acasalamentos | [Lôbo et al. 2014](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1010026/1/cnpc2014EvaluationofBrazilian.pdf) |
| Bodes | Idade de entrada em reprodução | Teste individual aos 7 a 8 meses e sêmen aos 14 meses (França); IA a partir de 1,5 ano com índice genômico (Noruega) | [Clément et al. 2018](https://docs.eaap.org/2018/Session26/S26_11_Clement.pdf); [NSG](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf) |

Nenhuma fonte lida fixa metas de fertilidade de bodes em monta natural (taxa de prenhez por bode, número de cabras por bode na estação) nem metas de crescimento de cabritas por raça brasileira; essas lacunas devem aparecer no app como indicadores medidos, sem meta, até que o próprio histórico do rebanho forneça a referência.

## Rebanhos de 20 a 1.000 cabras ganham precisão comparando, encolhendo e conectando

### Não estimar parâmetros dentro do rebanho

A primeira regra para o rebanho pequeno é usar herdabilidades e repetibilidades da literatura, e não estimá-las com os próprios dados. A simulação do relatório de corte mostrou que 100 registros de 5 touros estimam a herdabilidade com desvio-padrão de 0,30. As fontes caprinas mostram o mesmo problema em escala real: com 643 lactações, a h² da duração da lactação saiu 0,00 num modelo e 0,03 no outro ([Embrapa 2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)); no rebanho de Sobral, as correlações genéticas entre produção e duração da lactação tiveram erros-padrão de 0,30 e 0,40 ([Lôbo e Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)); e num único rebanho sérvio, o modelo de touro inflou a herdabilidade do leite de 0,22 para 0,27 ([Animals 2025](https://doi.org/10.3390/ani15203008)). As faixas da seção de produção servem de parâmetros externos (PL305 com h² de 0,20 e sensibilidade de 0,15 a 0,30; teores, 0,60; CCS, 0,15 a 0,25), e todo resultado do app deve vir com a hipótese usada.

A segunda regra é comparar cada cabra com as **contemporâneas**: mesma ordem de parto (primípara ou adulta), mesma estação e ano de parto e mesmo sistema de aleitamento (TMY ou TMM). O Capragene eliminava grupos com menos de três cabras quando o grupo era fixo e passou a tratá-lo como aleatório na Alpina, e a ICAR prevê, para rebanhos comerciais, o método D, com 2 a 4 controles por ano, só para ranquear cabras dentro do rebanho ([ICAR, Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)). O desvio da cabra em relação ao seu grupo, calculado sobre a lactação padronizada do Exemplo 1, é a matéria-prima dos dois exemplos seguintes.

### Exemplo 6: MPPA e índice de cabras com a PTA do pai

Duas contas respondem a duas perguntas diferentes, como no relatório de leite. A **MPPA** (habilidade mais provável de produção) prevê a próxima lactação da cabra, inclui o ambiente permanente e serve para descarte; o **EBV por índice de seleção** combina os registros próprios com a PTA do pai e serve para escolher de quem guardar filhas e bodes **[fórmulas padrão de índice de seleção; conferidas numericamente]**:

```
MPPA = μ + [n·r / (1 + (n − 1)·r)]·(ȳ − μ)            n lactações, repetibilidade r
Índice:  x₁ = ȳ − μ (desvio médio das n lactações em relação às contemporâneas) ;  x₂ = PTA do pai, confiabilidade REL
  P = [ σ²P·(r + (1 − r)/n)    REL·σ²a/4 ]      g = [ σ²a      ]      b = P⁻¹ g
      [ REL·σ²a/4              REL·σ²a/4 ]          [ REL·σ²a/4 ]
  EBV = b'x ;  REL da cabra = b'g/σ²a ;  PTA da cabra = EBV/2
  Pai sem avaliação: b = n·h² / [1 + (n − 1)·r]  (só registros próprios)
Pressupostos: a PTA do pai não contém os registros desta cabra; a informação da mãe não entra
```

O exemplo usa seis cabras com PL305 expressa como desvio das contemporâneas, h² = 0,20, σP = 200 kg (σa = 89,4 kg) e repetibilidade de 0,45. Nenhuma fonte lida estimou a repetibilidade da lactação de cabras brasileiras, e por isso o cálculo foi refeito com 0,35 e 0,55 **[conferido numericamente; dados fictícios]**.

| Cabra | Desvios de PL305 (kg) | n | MPPA (desvio, kg) | PTA do pai (REL) | Pesos b (cabra; pai) | EBV (kg) | PTA da cabra | REL da cabra |
|---|---|---|---|---|---|---|---|---|
| C1 | +150 | 1 | +67,5 | +40 (0,60) | 0,175; 0,825 | **+59,3** | +29,6 | 0,30 |
| C2 | +120, +90, +100 | 3 | +73,4 | +10 (0,80) | 0,270; 0,730 | +35,2 | +17,6 | 0,42 |
| C3 | +200, +40 | 2 | **+74,5** | sem avaliação | 0,276 | +33,1 | +16,6 | 0,28 |
| C4 | −60 | 1 | −27,0 | +60 (0,70) | 0,171; 0,829 | +39,5 | +19,7 | 0,32 |
| C5 | −80, −40, −100, −50 | 4 | −51,7 | +20 (0,50) | 0,311; 0,689 | −7,2 | −3,6 | 0,40 |
| C6 | +60, +80 | 2 | +43,4 | −30 (0,60) | 0,245; 0,755 | −5,5 | −2,8 | 0,36 |

As duas ordens divergem, e as duas estão certas para o seu uso. Pela MPPA, C3, C2 e C1 lideram e C5 é a candidata ao descarte. Pelo EBV, C1 lidera e **C4, com uma única lactação 60 kg abaixo das contemporâneas, sobe para o segundo lugar**, porque o pai tem PTA de +60 kg com REL de 0,70 e, com uma lactação e h² de 0,20, o índice dá peso de 0,17 ao desvio da cabra e de 0,83 à PTA do pai; C6, com duas boas lactações, cai para perto de zero por causa do pai negativo. A repetibilidade mexe na MPPA: com r = 0,35 a ordem do topo é C2, C3 e C1 (63,8; 62,2; 52,5), e com r = 0,55 é C3, C1 e C2 (85,2; 82,5; 81,2). No EBV, os quatro primeiros mantêm a ordem nas três hipóteses, e só as duas últimas trocam de lugar. A regra prática que sai do exemplo é guardar filhas e bodes pelo EBV e descartar pela MPPA, e mostrar as duas no app com a confiabilidade ao lado; as confiabilidades de 0,28 a 0,42 lembram que mesmo uma cabra com quatro lactações é mal conhecida sem filhas.

### Exemplo 7: taxas com 30 cabras precisam de intervalo exato

Num rebanho de 30 cabras, cada cabra vale mais de três pontos percentuais em qualquer taxa. A aproximação de Wald falha com n pequeno ou taxa extrema e chega a dar limites negativos; os intervalos de Wilson e exato (Clopper-Pearson) são os indicados ([Wilson 1927](https://doi.org/10.1080/01621459.1927.10502953); [Agresti e Coull 1998](https://doi.org/10.2307/2685469)) **[fórmulas padrão; conferidas numericamente]**.

| Caso (30 cabras ou 30 gestações) | Taxa | Wald 95% | Wilson 95% | Exato 95% |
|---|---|---|---|---|
| Parição: 26 paridas de 30 expostas | 86,7% | 74,5% a 98,8% | 70,3% a 94,7% | 69,3% a 96,2% |
| Aborto: 3 de 30 gestações | 10,0% | −0,7% a 20,7% (impossível) | 3,5% a 25,6% | 2,1% a 26,5% |
| CCS acima de 1 milhão: 9 de 30 cabras | 30,0% | 13,6% a 46,4% | 16,7% a 47,9% | 14,7% a 49,4% |
| FAMACHA 4 ou 5: 4 de 30 cabras | 13,3% | 1,2% a 25,5% | 5,3% a 29,7% | 3,8% a 30,7% |
| Primíparas descartadas antes do fim da 1ª lactação: 14 de 30 | 46,7% | 28,8% a 64,5% | 30,2% a 63,9% | 28,3% a 65,7% |
| Mortalidade de cabritos: 0 de 30 | 0,0% | 0 a 0 (impossível) | 0 a 11,4% | 0 a 11,6% |

Comparar dois anos exige muito mais dados que um rebanho pequeno tem. Para detectar, com 80% de poder e 5% de significância, uma mudança de 10% para 20% de aborto, são precisas **199 gestações por ano**; com 30 por ano, o poder é de só 19%. Uma queda de 30% para 15% de cabras com CCS acima de 1 milhão exige 121 cabras por grupo (poder de 28% com 30), e só uma diferença enorme, de 10% para 30%, chega perto de ser detectada com 30 (poder de 49%; seriam precisas 62) **[conferido numericamente]**. A prolificidade, que é uma média e não uma taxa, se comporta melhor: 30 partos com 12 simples, 15 duplos e 3 triplos dão **1,70 cabrito por parto**, com desvio-padrão de 0,65 e intervalo de 1,46 a 1,94. Com 10% de mortalidade até o desmame e intervalo de partos de 365 dias, isso dá 1,70 × 0,90 = **1,53 cabrito desmamado por cabra por ano**, e 1,40 se o intervalo for de 400 dias **[conferido numericamente]**. Mortalidade de cabritos deve ser analisada por cabrito, mas cabritos da mesma ninhada não são independentes, e o intervalo calculado por cabrito fica estreito demais. Duas ferramentas ajudam a enxergar tendência com poucos dados: agregar em janelas móveis de 12 meses e acumular desvios por CUSUM, S_t = máx(0; S_{t−1} + x_t − μ₀ − k), que soma desvios até cruzar um limite ([Page 1954](https://doi.org/10.2307/2333009)); os limites de CUSUM para mastite ou aborto em cabras não foram encontrados e precisam ser calibrados com o histórico do rebanho.

### Exemplo 8: endogamia por acasalamento e Ne de um rebanho fechado

O coeficiente de endogamia do cabrito é metade do parentesco entre os pais, F = ½·a_pai,mãe, calculado pela matriz A (método tabular no relatório de corte). O rebanho fictício começa com o bode B1 e três cabras fundadoras (D1, D2, D3). B1 deixa o filho B2 e a filha C1 com D1, e as filhas C2 com D2 e C3 com D3. Um bode externo, B3, deixa C4 com D2 e o candidato B4 com C1. C5 é filha de B2 com C2 e já nasceu com F = 12,5%. B5 é um bode comprado, sem parentesco **[conferido numericamente]**.

| Bode | × D1 | × C1 | × C2 | × C3 | × C4 | × C5 | Média |
|---|---|---|---|---|---|---|---|
| B2 (filho de B1 e D1) | 25,00% | 25,00% | 12,50% | 12,50% | 0 | 31,25% | 17,71% |
| B4 (filho de B3 e C1) | 12,50% | 25,00% | 6,25% | 6,25% | 12,50% | 9,38% | 11,98% |
| B5 (externo) | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

O bode da casa, B2, é perigoso para quase todo o rebanho, mas não para C4, meia-irmã materna de C2 por parte de D2, que não tem nenhum ancestral em comum com B2. O B4, meio externo, parece seguro pela média (12%), mas daria 25% com a própria mãe e 12,5% com a irmã paterna C4. A alocação correta usa o B5 em D1, C1 e C5, o B4 em C2 e C3 (6,25%) e o B2 em C4 (zero), e por isso a decisão deve ser tomada **por par**, e não por bode. A mesma conta, feita para o rebanho inteiro, mostra o custo de fechar o rebanho. Com a fórmula clássica Ne = 4·Nm·Nf/(Nm + Nf) **[forma padrão; texto de Falconer e Mackay não lido nesta rodada]** e ΔF = 1/(2·Ne) ([IGA](https://iga-goatworld.com/blog/status-of-genetic-diversity-of-u-s-dairy-goat-breeds)), um rebanho fechado que repõe os bodes com filhos próprios acumula endogamia assim **[conferido numericamente; acasalamento ao acaso, intervalo de gerações de 3 anos como hipótese]**:

| Bodes por geração | Cabras | Ne | ΔF por geração | F após 5 gerações | F após 10 anos |
|---|---|---|---|---|---|
| 1 | 20 | 3,8 | 13,1% | 50,5% | 37,4% |
| 1 | 50 | 3,9 | 12,7% | 49,4% | 36,5% |
| 2 | 50 | 7,7 | 6,5% | 28,5% | 20,1% |
| 3 | 100 | 11,7 | 4,3% | 19,7% | 13,6% |
| 5 | 200 | 19,5 | 2,6% | 12,2% | 8,3% |
| 10 | 500 | 39,2 | 1,3% | 6,2% | 4,2% |
| 13 | 1.000 | 51,3 | 0,97% | 4,8% | 3,2% |

O número de cabras quase não importa; o de bodes, sim. Para ficar dentro de ΔF de 1% por geração (Ne de 50), um rebanho de 1.000 cabras precisaria de **pelo menos 13 bodes não aparentados por geração**, e um rebanho de 50 cabras não tem como chegar lá fechado. A conclusão para qualquer porte de 20 a 1.000 cabras é que o rebanho não pode se fechar: precisa comprar bodes ou sêmen de fora a cada geração, e a perda de produção estimada para a Saanen brasileira, de 2,31 kg de PL305 por ponto de endogamia **[trecho de busca]**, dá a ordem de grandeza do custo. É a mesma lógica da NSG, que importa sêmen de Alpina francesa a cada dois anos ([NSG 2021–2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf)), e do Capragene, que recomenda muitos bodes com poucos acasalamentos cada para controlar a endogamia ([Capragene, Alpina 2021](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1137509/1/CNPC-2021-Art103.pdf)).

### BLUP e genômica dentro do rebanho: úteis para ranquear, limitados para comparar

O modelo animal de lactação da seção de produção roda num rebanho de 100 a 1.000 cabras com variâncias da literatura e grupo de contemporâneas aleatório, e entrega PTAs que ordenam as cabras da casa usando todo o pedigree. O Exemplo 3 mostrou o limite: sem bodes em comum com outros rebanhos, essas PTAs só se comparam entre si, e bodes de monta natural sem filhas fora do rebanho ficam com confiabilidade baixa. O que ancora o rebanho na população são os **bodes de IA com PTA publicada**, cujas filhas servem de contemporâneas de referência, e a inscrição no controle leiteiro oficial, que põe o rebanho dentro da avaliação nacional. O modelo de dia de controle com regressão aleatória faz sentido em rebanhos de várias centenas de cabras com controle mensal, desde que use grupos aleatórios em vez do HTD e matrizes de covariância externas, que as fontes lidas não publicam para caprinos.

A genômica dentro do rebanho tem um exemplo de porte comparável: num rebanho neozelandês de 839 cabras, genotipar 388 elevou a acurácia de 0,20–0,22 para 0,34–0,43 ([Scholtens et al. 2021](https://doi.org/10.3390/ani11010024)). É um ganho real para rebanhos de 500 a 1.000 cabras que já têm controle leiteiro e pedigree completos, mas três condições pesam no Brasil: a referência precisa ter fenótipos no próprio rebanho ou numa população conectada; o chip do Capragene (Axiom OviCap) não é o GoatSNP50 usado na maior parte do mundo; e o custo por genótipo não foi encontrado nas fontes. Antes disso, o uso mais barato do DNA é a verificação de paternidade, que corrige o pedigree em que todo o resto se apoia: o Capragene mantém um painel de 16 microssatélites com poder de exclusão de 99,99% ([Capragene, Saanen 2017](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1088252/1/CNPC2017SumarioCapragene2.pdf)).

## Conclusão

A avaliação genética de cabras leiteiras não sofre de falta de método; sofre de falta de conexão. Os modelos são os mesmos do bovino, e os programas de N grande já resolveram as particularidades caprinas com soluções conhecidas: lactação declarada por regra da ICAR, single-step multirraça para compensar referências de centenas de bodes, peso explícito para um gene maior e índices que somam úbere, células e fertilidade à produção. O que separa a França (330 mil cabras controladas, 40% de IA no núcleo, bodes genômicos em 60% dos pais de bodes) do Brasil (6.941 lactações Saanen, 6,34 kg/ano realizados contra mais de 13 kg/ano possíveis) não é o BLUP, e sim a proporção de cabras inseminadas com bodes comuns a vários rebanhos. Os exemplos tornam isso concreto: dez filhas num rebanho valem metade de dez filhas espalhadas, um bode sem contemporâneas de outro pai não tem avaliação, e comprar bodes avaliados rende mais que o dobro de escolher bodes pela produção da mãe. O próprio Capragene já se adaptou ao tamanho com grupos de contemporâneas aleatórios e modelos de três características, mas as correlações genéticas iguais a 1 entre leite e componentes mostram o limite desse caminho com pouco dado.

Para o SeabraApp, a implicação é que o maior valor de um app no segmento caprino está em produzir dados que a avaliação nacional consiga usar e que o produtor consiga interpretar. Isso significa registrar o que é próprio da cabra e que quase nenhum produtor anota hoje (a data em que os cabritos deixam de mamar, o tipo de parto com o sexo das crias, o tipo de ordenha, cada cobertura com o bode identificado), calcular a lactação pela regra da ICAR com a referência declarada, e devolver ferramentas honestas: desvio das contemporâneas, MPPA e EBV com a PTA do pai, intervalo exato em toda taxa e endogamia por acasalamento. Há também uma oportunidade que vai além do rebanho: o Brasil não tem índice com células, fertilidade ou úbere para cabras, e nenhuma fonte lida estimou parâmetros de verminose, longevidade ou tipo em cabras brasileiras. Rebanhos que registrarem esses dados de forma padronizada formarão, em poucos anos, a base que falta para essas avaliações.

## O que o rebanho caprino precisa registrar no SeabraApp

Quatro regras valem para todos os dados. A primeira, da ICAR, é controlar **todas as cabras ordenhadas** em cada dia de controle, inclusive as que serão descartadas ou morrerão, para evitar viés de amostragem. A segunda é registrar **datas**, e não idades ou dias em lactação já calculados, para que o app derive DEL, IEP, idade ao parto e duração da mamada. A terceira é usar códigos padronizados para tipo de parto, causas de secagem, saídas e doenças. A quarta é exportar no formato do controle leiteiro oficial, porque é por ele que o rebanho entra no Capragene.

| Dado | Para que serve | Mínimo necessário |
|---|---|---|
| Identificação | ligar controles, pedigree, partos e genótipo | brinco ou RFID, raça, sexo, data de nascimento, tipo de nascimento (simples, duplo, triplo), origem (nascida no rebanho ou comprada) |
| Pedigree | matriz A, PTA do pai no índice, F por acasalamento, conectividade | pai (código do bode ou do sêmen; em monta natural, o bode de cada lote com datas de entrada e saída), mãe; pais dos animais comprados; resultado de verificação de paternidade |
| Parto | início da lactação, ordem de parto, efeito de tipo de parto × sexo das crias do Capragene, prolificidade, aborto | data, ordem de parto, número de crias vivas e mortas, sexo e identificação de cada cria, aborto e natimorto com data |
| Aleitamento | separar TMY de TMM (ICAR) | sistema (ordenha desde o parto, mamada, mamada com ordenha parcial) e data da separação definitiva dos cabritos |
| Controle leiteiro | lactação padronizada (210, 250 ou 305 d), curva, dia de controle, MPPA, PTAs | data do controle; leite de cada ordenha medida, ou ordenha única com método declarado (AT ou AC); número de ordenhas; tipo de ordenha (manual ou mecânica); amostra para gordura, proteína, lactose e CCS com laboratório |
| Secagem | encerrar a lactação e filtrar lactações anormais | data e causa (normal ou não) |
| Reprodução | IEP, concepção, sucesso da IA, estação de monta | cada cobertura ou IA com data e bode; tipo de sêmen (fresco, refrigerado, congelado); indução de cio ou fotoperíodo; diagnóstico de gestação com data, método e resultado |
| Úbere e tipo | índice morfológico, qualificação, defeitos | em 1ª ou 2ª lactação: notas lineares de 1 a 9 (ligamento anterior, perfil, piso, comprimento, largura, forma, implantação e orientação dos tetos, úbere e inserção posteriores), data e avaliador; tetos supranumerários |
| Saúde do úbere | CCS, mastite, tratamento na secagem | CCS por controle; mastite clínica com data, metade do úbere e tratamento; teste da caneca ou CMT quando usado |
| Verminose | OPG transformado, FAMACHA, hematócrito, tratamento seletivo | data da coleta, OPG, grau FAMACHA, hematócrito; data e produto da última vermifugação; lote |
| Doenças infecciosas | descarte e decisões de reposição | sorologia de CAE (AGID ou IDGA) com data e resultado; abscessos de linfadenite; claudicação |
| Cabritos | efeito materno, mortalidade, crescimento | peso ao nascer e ao desmame com datas; tipo de aleitamento; morte com data e causa |
| Recria | metas de cobertura de cabritas | peso e escore corporal à cobertura e ao parto; peso das adultas do rebanho para calcular a porcentagem do peso adulto |
| Saídas | vida produtiva, descarte precoce, longevidade | data, destino (venda, descarte, morte) e motivo codificado |
| Grupo de manejo | grupo de contemporâneas | lote, regime (pasto, semiconfinamento, confinamento), localização da propriedade |
| Genótipo | ssGBLUP, paternidade, αs1-caseína | painel (GoatSNP50 ou Axiom OviCap), laboratório, código da amostra; genótipo αs1 quando testado |

## Estratégia por porte de rebanho

A tabela traduz as evidências e os exemplos em recomendações **[proposta deste relatório, baseada nas fontes e nos exemplos acima]**.

| Porte | Registro e controle | Bodes e avaliação genética | Ferramentas no próprio rebanho | Genômica |
|---|---|---|---|---|
| 20 a 50 cabras | Partos com tipo e sexo das crias e data de separação dos cabritos; controle mensal, ou pelo menos nos meses 1, 2, 4 e 6 da lactação (método D da ICAR quando não houver controle oficial); CCS em parte dos controles | Comprar bodes ou sêmen com PTA e confiabilidade publicadas, ou de rebanhos conectados; trocar o bode a cada geração; nunca fechar o rebanho (Exemplo 8) | Lactação por TIM ou por Wood com quatro controles (Exemplo 1); desvio de cada cabra em relação às da mesma estação e ordem de parto; MPPA com três repetibilidades e EBV com a PTA do pai (Exemplo 6); taxas com intervalo exato em janela de 12 meses (Exemplo 7); F por acasalamento | Não; DNA só para confirmar paternidade |
| 50 a 200 cabras | Controle mensal (oficial A4 ou AT onde houver controle leiteiro oficial), com componentes e CCS; pontagem linear do úbere das primíparas | Dois ou três bodes por estação, com pelo menos um de IA ou avaliado como âncora de comparação (Exemplo 3); acasalamentos planejados com F ≤ 6,25% | Modelo animal de lactação com grupo de contemporâneas aleatório e parâmetros externos; EBV e MPPA; CUSUM para CCS e aborto; prolificidade e mortalidade com intervalo | Genotipar só bodes de reposição de uso intenso ou para venda, se houver referência compatível |
| 200 a 1.000 cabras | Controle mensal oficial com amostras; FAMACHA e OPG por coleta; tipo linear; integração ao Capragene | IA estruturada; bodes jovens testados com filhas espalhadas por lotes, estações e rebanhos parceiros (Exemplo 3); se quiser autonomia, pelo menos 13 bodes não aparentados por geração (Exemplo 8) | Modelo animal multicaracterística (leite, componentes, CCS) com grupo aleatório; dia de controle com grupos aleatórios só com parâmetros externos; índice econômico ligado à forma de pagamento do leite; validação dos rankings com as lactações seguintes | Genotipagem de cabritas e bodes candidatos, como no rebanho neozelandês (acurácia de 0,20 para 0,34–0,43), com chip compatível com a referência; genótipo αs1 para quem vende leite para queijo, se a frequência na raça for conhecida |

## Apêndice A: script que reproduz os exemplos

O script usa só numpy e a biblioteca padrão do Python e reproduz todos os números marcados como **[conferido numericamente]**: lactação pelo método de Fleischmann e pela curva de Wood (Exemplo 1), escore de células somáticas, vetor q e persistência na regressão aleatória (Exemplo 2), confiabilidade exata de bodes pela PEV (Exemplo 3), ICC, composição de 2023 e MFP$ (Exemplo 4), MPPA e índice com a PTA do pai (Exemplo 6), intervalos de Wald, Wilson e exato e poder (Exemplo 7), endogamia por acasalamento e Ne (Exemplo 8), ganho genético pelos quatro caminhos (Exemplo 5) e a fórmula de Daetwyler. Uso: `python3 apendice_caprinos.py`.

```python
# Reproduz os exemplos do relatorio de caprinos leiteiros (somente numpy e math).
# Uso: python3 apendice_caprinos.py      (todos os dados sao ficticios, exceto onde indicado)
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

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 1. Lactacao padronizada a partir de 4 a 10 controles (Fleischmann/TIM da ICAR e Wood)
# ---------------------------------------------------------------------------------------------
wood = lambda t, a, b, c: a * np.power(t, b) * np.exp(-c * t)
A0, B0, C0, SECA = 1.55, 0.23, 0.0048, 290          # curva "verdadeira" ficticia; secagem no dia 290
d = np.arange(1, 306)
verd = wood(d, A0, B0, C0) * (d <= SECA)             # producao diaria verdadeira (zero apos a secagem)
V = {L: verd[:L].sum() for L in (210, 250, 305)}; V["seca"] = verd.sum()
print(f"1. Curva verdadeira: pico no dia {B0/C0:.1f} com {A0*(B0/C0)**B0*math.exp(-B0):.2f} kg | "
      f"total ate a secagem {V['seca']:.1f} | PL210 {V[210]:.1f} | PL250 {V[250]:.1f} | PL305 {V[305]:.1f}")
tc = np.array([10, 40, 70, 100, 130, 160, 190, 220, 250, 280.])           # 10 controles mensais
ruido = np.array([0.05, -0.03, 0.02, -0.04, 0.03, 0.00, -0.02, 0.04, -0.03, 0.02])
mc = np.round(wood(tc, A0, B0, C0) * (1 + ruido), 2)                         # kg/dia medidos (2 ordenhas)
gord = np.array([3.6, 3.2, 3.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8])         # % gordura
prot = np.array([3.2, 2.9, 2.8, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4])         # % proteina
print("   controles (dia, kg):", [(int(x), float(y)) for x, y in zip(tc, mc)])

def fleischmann(t, m, fim, seca=None, meio_intervalo=15):
    """Metodo 2 da ICAR (media de dois controles x dias entre eles), com I0*M1 no inicio.
    Fim: ate a secagem real (se conhecida) ou ultimo controle x metade do intervalo (regra ICAR caprinos)."""
    t, m = list(t), list(m)
    fim_real = min(fim, seca) if seca else min(fim, t[-1] + meio_intervalo)
    tot = min(t[0], fim_real) * m[0]
    for i in range(len(t) - 1):
        if t[i] >= fim_real: break
        t2 = min(t[i+1], fim_real)
        m2 = m[i] + (m[i+1] - m[i]) * (t2 - t[i]) / (t[i+1] - t[i])        # interpola se cortar no meio
        tot += (t2 - t[i]) * (m[i] + m2) / 2
    if t[-1] < fim_real: tot += (fim_real - t[-1]) * m[-1]
    return tot

def ajusta_wood(t, m):                                   # ln y = ln a + b ln t - c t (MQO)
    X = np.column_stack([np.ones(len(t)), np.log(t), -np.asarray(t)])
    co, *_ = np.linalg.lstsq(X, np.log(m), rcond=None)
    return math.exp(co[0]), co[1], co[2]

subconj = {"10 mensais": list(range(10)), "6 (meses 1 a 6)": list(range(6)),
           "5 bimestrais": [1, 3, 5, 7, 9], "4 (meses 1, 2, 4 e 6)": [0, 1, 3, 5]}
print(f"   {'controles':24s} {'TIM305':>8s} {'erro':>6s} {'TIM250':>8s} {'erro':>6s} | {'Wood250':>8s} {'erro':>6s} {'Wood305':>8s} {'erro':>6s} {'pico(d)':>7s} {'pico(kg)':>8s}")
for nome, idx in subconj.items():
    t, m = tc[idx], mc[idx]
    a, b, c = ajusta_wood(t, m)
    w = wood(d, a, b, c) * (d <= SECA)
    T305, T250, W250, W305 = fleischmann(t, m, 305, SECA), fleischmann(t, m, 250, SECA), w[:250].sum(), w.sum()
    e = lambda x, ref: f"{100*(x/ref-1):+5.1f}%"
    print(f"   {nome:24s} {T305:8.1f} {e(T305, V[305])} {T250:8.1f} {e(T250, V[250])} | {W250:8.1f} {e(W250, V[250])} "
          f"{W305:8.1f} {e(W305, V[305])} {b/c:7.1f} {a*(b/c)**b*math.exp(-b):8.2f}")
print(f"   ICAR sem data de secagem (ultimo controle x 15 d): {fleischmann(tc, mc, 305):.1f} kg ate o dia {tc[-1]+15:.0f}")
print(f"   Se os cabritos mamam ate o dia 45: TMM verdadeira (dias 46 a {SECA}) = {verd[45:].sum():.1f} kg "
      f"({100*verd[45:].sum()/V['seca']:.1f}% da TMY); pico (dia {B0/C0:.0f}) fica dentro da fase de mamada")
G = fleischmann(tc, mc * gord / 100, 305, SECA); P = fleischmann(tc, mc * prot / 100, 305, SECA)
L10 = fleischmann(tc, mc, 305, SECA)
print(f"   Componentes (10 controles): gordura {G:.2f} kg ({100*G/L10:.2f}%), proteina {P:.2f} kg ({100*P/L10:.2f}%)")
a, b, c = ajusta_wood(tc, mc); w = wood(d, a, b, c)
print(f"   Wood (10 controles): a={a:.3f} b={b:.4f} c={c:.5f}; persistencia y(240)/y(40) = {w[239]/w[39]:.3f} "
      f"(verdadeira {wood(240,A0,B0,C0)/wood(40,A0,B0,C0):.3f})")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 2. Celulas somaticas: escore log2, media geometrica e aritmetica
# ---------------------------------------------------------------------------------------------
ccs = np.array([420, 610, 950, 1380, 2050, 3100.])                         # mil celulas/mL, 6 controles
scs = np.log2(ccs / 100) + 3
print("2. SCS por controle:", scs.round(2), f"| SCS medio {scs.mean():.2f} -> CCS geometrica "
      f"{100*2**(scs.mean()-3):.0f} mil; aritmetica {ccs.mean():.0f} mil; log10 medio {np.log10(ccs*1000).mean():.3f}")
print(f"   Capragene Saanen 2017: log10 medio 6,01 -> {10**6.01:,.0f} cel/mL (geometrica)")
for lim in (200, 750, 1000, 1750):
    print(f"   SCS de {lim} mil = {math.log2(lim/100)+3:.2f}", end=";")
print()
print(f"   Conferencia Rupp et al. 2011: 0,30/(0,30+0,93) = {0.30/1.23:.3f}; 0,31/(0,31+1,26) = {0.31/1.57:.3f}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 3. Regressao aleatoria: covariaveis de Legendre (DEL 7 a 270, ordem 4), vetor q e persistencia
# ---------------------------------------------------------------------------------------------
def leg(dd, ordem=4, tmin=7, tmax=270):
    x = -1 + 2 * (dd - tmin) / (tmax - tmin)
    P = [1.0, x, (3*x**2 - 1)/2, (5*x**3 - 3*x)/2, (35*x**4 - 30*x**2 + 3)/8]
    return np.array([math.sqrt((2*k + 1)/2) * P[k] for k in range(ordem + 1)])
q250 = sum(leg(t) for t in range(7, 251))
print("3. q (soma de phi(d), d = 7..250):", q250.round(3))
for dd in (7, 40, 140, 240, 270):
    print(f"   phi({dd}) =", leg(dd).round(4))
def persist(ahat): return sum((leg(t) - leg(40)) @ ahat for t in range(40, 241))
aA = np.array([0.20, 0.0, 0.0, 0.0, 0.0])                                   # cabra A: curva genetica plana
aB = np.array([0.0, 0.05, 0.0, 0.0, 0.0])                                  # cabra B: inclinacao positiva
aB[0] = (q250 @ aA - q250[1:] @ aB[1:]) / q250[0]                            # mesma EBV250 que A
for nome, ah in (("A", aA), ("B", aB)):
    print(f"   cabra {nome}: a = {ah.round(4)} | EBV250 = {q250 @ ah:.2f} kg | "
          f"g(40) = {leg(40) @ ah:.3f}, g(240) = {leg(240) @ ah:.3f} kg/d | persistencia = {persist(ah):.2f} kg")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 4. Confiabilidade de bode com poucas filhas em poucos rebanhos: PEV exata do modelo de touro
#    y = GC + s + e ; s ~ N(0, I s2s) ; s2s = h2/4 ; s2e = 1 - h2/4 ; lambda = (4 - h2)/h2
# ---------------------------------------------------------------------------------------------
def rel_bode(rebanhos, h2=0.20, ext=None, alvo="X"):
    """rebanhos: lista de dicts {bode: n_filhas} (um GC por rebanho); ext: {bode: REL externa}."""
    ext = ext or {}
    bodes = sorted({b for r in rebanhos for b in r} | {alvo})
    s2s, s2e = h2 / 4, 1 - h2 / 4; lam = s2e / s2s
    nG, nB = len(rebanhos), len(bodes)
    C = np.zeros((nG + nB, nG + nB))
    for g, r in enumerate(rebanhos):
        for b, n in r.items():
            j = nG + bodes.index(b)
            C[g, g] += n; C[j, j] += n; C[g, j] += n; C[j, g] += n
    for j, b in enumerate(bodes):
        R = ext.get(b, 0.0); C[nG + j, nG + j] += lam + lam * R / (1 - R)   # DE externa = k R/(1-R)
    Ci = np.linalg.pinv(C)
    pev = Ci[nG + bodes.index(alvo), nG + bodes.index(alvo)] * s2e
    return 1 - pev / s2s
h2 = 0.20; k_touro = (4 - h2) / h2; k_d = (4 - 2*h2) / h2
cen = [
    ("1 rebanho: X 10 filhas + Y 10 (Y sem outra informacao)", [{"X": 10, "Y": 10}], {}),
    ("1 rebanho: X 10 + Z 10 (Z bode de IA, REL 0,90)", [{"X": 10, "Z": 10}], {"Z": 0.90}),
    ("1 rebanho: X 10 sozinho no GC", [{"X": 10}], {}),
    ("2 rebanhos: X 5 + Z 10 em cada", [{"X": 5, "Z": 10}] * 2, {"Z": 0.90}),
    ("5 rebanhos: X 2 + Z 10 em cada", [{"X": 2, "Z": 10}] * 5, {"Z": 0.90}),
    ("10 rebanhos: X 1 + Z 10 em cada", [{"X": 1, "Z": 10}] * 10, {"Z": 0.90}),
    ("5 rebanhos: X 2 + bode local proprio (10) em cada, sem IA", [{"X": 2, f"Y{i}": 10} for i in range(5)], {}),
    ("15 rebanhos: X 2 + Z 10 em cada (30 filhas)", [{"X": 2, "Z": 10}] * 15, {"Z": 0.90}),
    ("15 rebanhos: X 2 + Z 40 em cada (30 filhas, GC grandes)", [{"X": 2, "Z": 40}] * 15, {"Z": 0.90}),
    ("1 rebanho: X 30 + Z 30 (30 filhas no mesmo GC)", [{"X": 30, "Z": 30}], {"Z": 0.90}),
]
print(f"4. h2 = {h2}: k (modelo de touro, maes desconhecidas) = {k_touro:.0f}; k_d (merito da mae conhecido) = {k_d:.0f}")
for nome, reb, ext in cen:
    print(f"   {nome:62s} REL = {rel_bode(reb, h2, ext):.3f}")
for n in (10, 30, 50, 100):
    print(f"   formula n/(n+k): n={n:3d} -> {n/(n+k_touro):.3f} (k=19) | {n/(n+k_d):.3f} (k_d=18) | h2=0,30: {n/(n+(4-0.6)/0.3):.3f} (k_d=11,33)")
for R in (0.50, 0.70):
    print(f"   REL {R:.2f} exige DE = k_d R/(1-R) = {k_d*R/(1-R):.1f} filhas-equivalentes (h2 0,20)")
print(f"   SZZV: meias-amplitudes 700/126 = {700/126:.2f}; sqrt(1-0,38)/sqrt(1-0,98) = {math.sqrt(0.62)/math.sqrt(0.02):.2f}")
print(f"   Media de lactacoes por GC na Alpina 2021: 1.072/153 = {1072/153:.2f}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 5. Indices: ICC frances (grade Capgenes 2012), versao 2023 (pesos lidos em slide) e MFP$ (EUA)
# ---------------------------------------------------------------------------------------------
bodes = {"A": dict(MP=1.8, TP=0.4, MG=1.5, TB=0.2, IMC=-0.6), "B": dict(MP=1.0, TP=1.2, MG=0.8, TB=1.0, IMC=1.2)}
for nome, v in bodes.items():
    ipc = v["MP"] + 0.4*v["TP"] + 0.2*v["MG"] + 0.1*v["TB"]
    print(f"5. bode {nome}: IPC = {ipc:.2f} | ICC Alpina = {ipc + 0.5*v['IMC']:.2f} | ICC Saanen = {ipc + 0.6*v['IMC']:.2f}")
z = {"A": dict(prod=1.5, tipo=-0.8, ccs=-0.5, ia=-0.3), "B": dict(prod=0.9, tipo=1.0, ccs=0.6, ia=0.4)}
pesos = dict(prod=0.53, tipo=0.21, ccs=0.10, ia=0.16)                      # leitura de grafico (Alpina, 2023)
for nome, v in z.items():
    print(f"   bode {nome}: indice com pesos 2023 (z) = {sum(pesos[t]*v[t] for t in pesos):.3f}; "
          f"so producao+tipo 62/25 (2012-2022, leitura de grafico) = {0.62*v['prod']+0.25*v['tipo']+0.13*v['ccs']:.3f}")
mfp = lambda leite, gord, prot: 0.01*leite + 1.15*gord + 2.55*prot
print(f"   MFP$ bode C (leite +150, gord +4, prot +3) = {mfp(150, 4, 3):.2f}; bode D (+40, +6, +4,5) = {mfp(40, 6, 4.5):.2f}")
print(f"   Razoes MFP$: proteina/gordura = {2.55/1.15:.2f}; gordura/leite = {1.15/0.01:.0f}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 6. Cabras do rebanho: MPPA e indice com a PTA do pai (desvios de PL305 em relacao ao GC)
# ---------------------------------------------------------------------------------------------
sP, h2c = 200.0, 0.20; s2P = sP**2; s2a = h2c * s2P
print(f"6. sigma_P = {sP:.0f} kg, h2 = {h2c}, sigma_a = {math.sqrt(s2a):.1f} kg; "
      f"PTA com DP 34 kg implica REL media {(34/(0.5*math.sqrt(s2a)))**2:.3f}")
cabras = [("C1", [150], 40, 0.60), ("C2", [120, 90, 100], 10, 0.80), ("C3", [200, 40], 0, 0.0),
          ("C4", [-60], 60, 0.70), ("C5", [-80, -40, -100, -50], 20, 0.50), ("C6", [60, 80], -30, 0.60)]
def indice(ys, pta, R, r):
    n = len(ys); x1 = np.mean(ys)
    v11 = s2P * (r + (1 - r) / n)
    if R == 0:
        b = np.array([s2a / v11]); g = np.array([s2a]); x = np.array([x1])
    else:
        Pm = np.array([[v11, R*s2a/4], [R*s2a/4, R*s2a/4]]); g = np.array([s2a, R*s2a/4])
        b = np.linalg.solve(Pm, g); x = np.array([x1, pta])
    return b @ x, (b @ g) / s2a, b
for r in (0.35, 0.45, 0.55):
    print(f"   repetibilidade r = {r}")
    for nome, ys, pta, R in cabras:
        n = len(ys); mppa = n*r/(1 + (n-1)*r) * np.mean(ys)
        ebv, rel, b = indice(ys, pta, R, r)
        print(f"     {nome}: media {np.mean(ys):7.1f} n={n} | MPPA {mppa:7.1f} | pai PTA {pta:+4d} (REL {R:.2f}) | "
              f"EBV {ebv:7.1f} PTA {ebv/2:6.1f} REL {rel:.3f} | b = {b.round(3)}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 7. Intervalos de confianca de taxas com 30 cabras e poder para comparar dois anos
# ---------------------------------------------------------------------------------------------
def binom_cdf(x, n, p): return sum(math.comb(n, k) * p**k * (1-p)**(n-k) for k in range(0, x + 1))
def exato(x, n, a=0.05):
    def raiz(f):
        lo, hi = 0.0, 1.0
        for _ in range(200):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if f(mid) > 0 else (lo, mid)
        return (lo + hi) / 2
    li = 0.0 if x == 0 else raiz(lambda p: (1 - binom_cdf(x - 1, n, p)) - a/2 < 0 and 1 or -1)
    ls = 1.0 if x == n else raiz(lambda p: binom_cdf(x, n, p) - a/2 > 0 and 1 or -1)
    return li, ls
def wilson(x, n, z=1.959964):
    p = x / n; c = (p + z*z/(2*n)) / (1 + z*z/n); h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / (1 + z*z/n)
    return c - h, c + h
def wald(x, n, z=1.959964):
    p = x / n; h = z*math.sqrt(p*(1-p)/n); return p - h, p + h
casos = [("Paricao (cabras paridas/expostas)", 26, 30), ("Aborto (abortos/gestacoes)", 3, 30),
         ("CCS > 1.000.000 cel/mL (cabras)", 9, 30), ("FAMACHA 4 ou 5 (cabras)", 4, 30),
         ("Descarte de primiparas antes do fim da 1a lactacao", 14, 30), ("Mortalidade de cabritos ate desmame", 0, 30)]
print("7.", f"{'caso':52s} {'taxa':>6s} {'Wald':>15s} {'Wilson':>15s} {'Exato':>15s}")
for nome, x, n in casos:
    f = lambda t: f"{100*t[0]:5.1f}-{100*t[1]:5.1f}"
    print(f"   {nome:52s} {100*x/n:5.1f}% {f(wald(x, n)):>15s} {f(wilson(x, n)):>15s} {f(exato(x, n)):>15s}")
def n_por_grupo(p1, p2, za=1.959964, zb=0.841621):
    pb = (p1 + p2) / 2
    return (za*math.sqrt(2*pb*(1-pb)) + zb*math.sqrt(p1*(1-p1) + p2*(1-p2)))**2 / (p1 - p2)**2
def poder(p1, p2, n, za=1.959964):
    pb = (p1 + p2) / 2; se0 = math.sqrt(2*pb*(1-pb)/n); se1 = math.sqrt((p1*(1-p1) + p2*(1-p2))/n)
    return Phi((abs(p1 - p2) - za*se0) / se1)
for p1, p2 in ((0.10, 0.20), (0.10, 0.30), (0.80, 0.90), (0.30, 0.15)):
    print(f"   {p1:.2f} vs {p2:.2f}: n por grupo (80% poder, 5%) = {math.ceil(n_por_grupo(p1, p2))}; poder com 30 por grupo = {poder(p1, p2, 30):.2f}")
ninh = np.array([1]*12 + [2]*15 + [3]*3)                                    # 30 partos, 51 cabritos
m, s = ninh.mean(), ninh.std(ddof=1)
print(f"   Prolificidade: {ninh.sum()} cabritos/{len(ninh)} partos = {m:.2f}; DP {s:.3f}; IC95% t(29)=2,045: "
      f"{m-2.045*s/math.sqrt(30):.2f} a {m+2.045*s/math.sqrt(30):.2f}")
print(f"   Cabritos desmamados por cabra por ano = 1,70 x (1 - 0,10) x 365/365 = {1.70*0.90*365/365:.2f}; com IEP de 400 d = {1.70*0.90*365/400:.2f}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 8. Endogamia por acasalamento (F do filho = metade do parentesco dos pais) e Ne de rebanho fechado
# ---------------------------------------------------------------------------------------------
nomes = ["B1", "D1", "D2", "D3", "B2", "C1", "C2", "C3", "B3", "C4", "C5", "B4", "B5"]
ped = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (0, 0), 5: (1, 2), 6: (1, 2), 7: (1, 3), 8: (1, 4),
       9: (0, 0), 10: (9, 3), 11: (5, 7), 12: (9, 6), 13: (0, 0)}
A = matriz_A(ped); ix = {n: i for i, n in enumerate(nomes)}
print("8. F dos animais do pedigree:", {n: round(A[i, i] - 1, 4) for n, i in ix.items() if A[i, i] > 1})
femeas = ["D1", "C1", "C2", "C3", "C4", "C5"]
print(f"   {'bode':6s}" + "".join(f"{f:>9s}" for f in femeas) + f"{'media':>9s}")
for b in ("B2", "B4", "B5"):
    Fs = [0.5 * A[ix[b], ix[f]] for f in femeas]
    print(f"   {b:6s}" + "".join(f"{100*x:8.2f}%" for x in Fs) + f"{100*np.mean(Fs):8.2f}%")
print(f"   {'Nm':>4s} {'Nf':>5s} {'Ne':>7s} {'dF/ger':>8s} {'F 5 ger':>8s} {'F 10 anos (L=3)':>16s}")
for Nm, Nf in ((1, 20), (1, 50), (2, 50), (3, 100), (5, 200), (10, 500), (13, 1000)):
    Ne = 4*Nm*Nf/(Nm + Nf); dF = 1/(2*Ne)
    print(f"   {Nm:4d} {Nf:5d} {Ne:7.2f} {100*dF:7.2f}% {100*(1-(1-dF)**5):7.2f}% {100*(1-(1-dF)**(10/3)):15.2f}%")
print(f"   Ne = 50 (dF = 1%) exige Nm >= {50*1000/(4*1000-50):.1f} bodes por geracao com 1.000 cabras")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 9. Ganho genetico esperado (quatro caminhos e dois caminhos), PL305 com sigma_a = 89,4 kg
# ---------------------------------------------------------------------------------------------
sa = math.sqrt(s2a)
def dg(caminhos):  # lista de (i, r, L)
    return sum(i*r for i, r, L in caminhos) * sa / sum(L for i, r, L in caminhos)
for p in (0.05, 0.10, 0.15, 0.20, 0.50, 0.80):
    print(f"9. intensidade para fracao selecionada {p:.2f}: i = {intensidade(p):.3f}")
cenarios = {
    "Teste de progenie (bodes com ~30 filhas, REL 0,62)":
        [(intensidade(0.20), 0.79, 5.5), (intensidade(0.20), 0.79, 5.5), (intensidade(0.05), 0.60, 4.0), (intensidade(0.80), 0.55, 4.0)],
    "Bodes jovens genomicos (r = 0,65)":
        [(intensidade(0.05), 0.65, 2.0), (intensidade(0.15), 0.65, 2.5), (intensidade(0.10), 0.65, 3.5), (intensidade(0.80), 0.55, 4.0)],
    "Rebanho que compra bodes top 15% (REL 0,60), 2 caminhos":
        [(intensidade(0.15), math.sqrt(0.60), 4.0), (intensidade(0.80), 0.55, 4.0)],
    "Rebanho que compra bodes pela producao da mae, 2 caminhos":
        [(intensidade(0.15), 0.5 * math.sqrt(h2c), 3.0), (intensidade(0.80), math.sqrt(h2c), 4.0)],
}
for nome, cam in cenarios.items():
    print(f"   {nome:60s} dG = {dg(cam):5.2f} kg/ano  [(i, r, L) = {[(round(i,3), round(r,3), L) for i, r, L in cam]}]")
print(f"   Capragene: 1,8% x 727,44 = {0.018*727.44:.2f} kg/ano; realizado 6,34 kg/ano = {100*6.34/727.44:.2f}% da media")
print(f"   Lotes Capragene 2020/2017: 6.941/5.612 = {6941/5612:.3f}; 6.941/6.509 = {6941/6509:.3f}")

print("=" * 100)
# ---------------------------------------------------------------------------------------------
# 10. Acuracia genomica esperada (Daetwyler et al. 2008): r = sqrt(lam h2 / (lam h2 + 1)), lam = N/Me
# ---------------------------------------------------------------------------------------------
for h2r, rot in ((0.25, "femeas, 1 lactacao"), (0.80, "bodes com DYD (REL 0,80)")):
    for N in (388, 677, 947, 2955, 10000):
        print(f"10. {rot:26s} N={N:6d}: " + " | ".join(
            f"Me={Me}: r={math.sqrt((N/Me)*h2r/((N/Me)*h2r+1)):.3f} (REL {((N/Me)*h2r/((N/Me)*h2r+1)):.3f})" for Me in (1000, 3000)))
print("=" * 100)
```
