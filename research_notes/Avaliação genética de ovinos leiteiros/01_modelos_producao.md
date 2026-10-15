# Modelos de produção de leite em ovinos leiteiros: registro, padronização e avaliação genética

Escopo: notas específicas de ovinos leiteiros (registro de leite, padronização da lactação, curvas de lactação, modelos de avaliação genética, células somáticas, herdabilidades e correlações, Brasil e programas internacionais). Não repete a teoria geral de modelo animal, MME, teste-dia e regressão aleatória já coberta no relatório de bovinos leiteiros, nem o padrão ICAR de caprinos já coberto em `research_notes/Avaliação genética de caprinos leiteiros/`.

Data da pesquisa: 15/10/2026. Arquivos baixados e textos extraídos ficam em `/tmp/claude-0/-home-user-sistemas-seabra-web/2f601efb-0b7e-558e-b507-febc0682ae9c/scratchpad/fontes/ovinos/` (lista de URLs em `fontes.txt` na mesma pasta).

## Estado da verificação (leia antes de usar)

| Fonte | Acesso nesta sessão | Situação |
|---|---|---|
| ICAR Seção 16, "Dairy Sheep and Goats" ([wiki](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats), oldid=5107) | Página aberta, extraída em texto | LIDO: terminologia, métodos, cálculo de lactação, Anexos 1 a 3, Método D |
| Astruc et al. 2023, ICAR Technical Series no. 27, pp. 201-205 ([PDF](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2023_Astruc_et_al.pdf)) | PDF aberto | LIDO: estado da arte da coleta e amostragem em ovinos e caprinos |
| Larroque et al. 2011, EAAP Stavanger, S49 ([PDF](https://docs.eaap.org/2011/S49_Larroque.pdf)) | PDF aberto; checksum idêntico ao da URL | LIDO: slides de avaliação nacional francesa. Tabelas de h², rg e efeitos lidas em imagem (pp. 14, 16, 21) |
| Vouraki et al. 2024, EAAP Florence ([PDF](https://docs.eaap.org/2024/m221/S02T11.pdf)) | PDF aberto | LIDO: slides. Gráfico de h² lido em imagem (p. 10) |
| Vouraki et al. 2025, Vet. Sci. 12:194 ([PMC11946213](https://pmc.ncbi.nlm.nih.gov/articles/PMC11946213/); [DOI](https://doi.org/10.3390/vetsci12030194)) | Texto completo, CC BY | LIDO: modelo (1), Tabela 3, desenho de dados |
| Zhelyazkova, Dimov & Andonov 2023, Arch. Anim. Breed. 66:253 ([PMC10654608](https://pmc.ncbi.nlm.nih.gov/articles/PMC10654608/); [DOI](https://doi.org/10.5194/aab-66-253-2023)) | Texto completo | LIDO: modelos REP, RRM e ASR com equações (1) a (11) |
| Marshall et al. 2023, Animals 13:349 ([PMC9913856](https://pmc.ncbi.nlm.nih.gov/articles/PMC9913856/); [DOI](https://doi.org/10.3390/ani13030349)) | Texto completo, CC BY | LIDO: curvas de lactação em Legendre, fatores fixos, persistência |
| Guevara et al. 2025, Trop. Anim. Health Prod. ([PMC11906548](https://pmc.ncbi.nlm.nih.gov/articles/PMC11906548/); [DOI](https://doi.org/10.1007/s11250-025-04365-z)) | Texto completo | LIDO: equações de Wood, Wilmink, Dijkstra e Pollott; TMY pelo Fleischmann |
| Kuchtík et al. 2025, Arch. Anim. Breed. 68:691 ([PMC13524230](https://pmc.ncbi.nlm.nih.gov/articles/PMC13524230/); [DOI](https://doi.org/10.5194/aab-68-691-2025)) | Texto completo | LIDO: CCS em rebanhos tchecos (sem parâmetros genéticos) |
| Heddi et al. 2026, Foods 15:1527 ([PMC13164286](https://pmc.ncbi.nlm.nih.gov/articles/PMC13164286/); [DOI](https://doi.org/10.3390/foods15091527)) | Texto completo | LIDO: definição SCS = log2(SCC/10^5)+3, classes SCS1 a SCS5, modelo fenotípico |
| Astruc, Baloche & Buisson 2016, Prod. Anim. 29(1):41-56 ([DOI](https://doi.org/10.20870/productions-animales.2016.29.1.2515)) | PDF aberto (productions-animales.org) | LIDO: BLUP francês com heterogeneidade de variância, ISOL, ssGBLUP |
| Granado-Tajada & Ugarte 2018, EAAP S26 ([PDF](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf)) | PDF aberto; checksum idêntico | LIDO: slides do programa Latxa (apenas contexto e base de dados) |
| Baloche et al. 2011, EAAP S49 ([PDF](https://docs.eaap.org/2011/S49_Baloche.pdf)) | PDF aberto; checksum idêntico | LIDO: conclusões sobre grupos contemporâneos em GBLUP |
| Barillet et al. 2001, Genet. Sel. Evol. 33:397 ([DOI](https://doi.org/10.1186/1297-9686-33-4-397)) | Apenas resumo (Europe PMC, PMC2705413). O texto completo está atrás de página com JavaScript, que não foi lida | Resumo LIDO. Texto completo não obtido |
| Ticiani et al. 2013, Ciência Rural 43:1650 ([DOI](https://doi.org/10.1590/s0103-84782013000900018)) | Resumo via Crossref. O PDF no SciELO retorna HTTP 403 para robôs | Resumo LIDO. Texto completo não obtido |
| Gutiérrez et al. 2007, Small Rumin. Res. 70:233 ([DOI](https://doi.org/10.1016/j.smallrumres.2006.03.009)) | Só metadados (Crossref) e trechos de busca | [SNIPPET] |
| Ruiz et al. 2000, J. Dairy Sci. 83:2709 ([DOI](https://doi.org/10.3168/jds.s0022-0302(00)75165-4)) | Metadados (Crossref) e trecho de busca | [SNIPPET] |
| Rupp et al. 2003, J. Dairy Sci. ([DOI](https://doi.org/10.3168/jds.s0022-0302(03)73732-1)) | Metadados (Crossref). Texto bloqueado por robô (JDS) | [SNIPPET] |
| Documentos MAPA/INIA (Espanha) e IDELE (França) listados pelo outro processo da pasta | Erro de certificado TLS (MAPA; cadeia não aceita pelo CA bundle do proxy, não contornado) e HTML de bloqueio (IDELE) | Não lidos. Ver Lacunas |
| HAL/INRAE (várias versões de Barillet, Rupp, Baloche) e JDS | HTTP "Making sure you're not a bot" ou Cloudflare | Não lidos |

Convenções deste arquivo:
- **[LIDO]**: o número, a frase ou a equação foi lido na fonte (texto extraído, XML ou imagem renderizada). "p." é a página do PDF.
- **[SNIPPET]**: trecho de resultado de busca, sem leitura da fonte. Use apenas como pista para conferir.
- **[INFERÊNCIA]**: conclusão minha a partir de fontes lidas, não escrita na fonte.
- **[NÃO VERIFICADO]**: afirmação sem fonte aberta lida. Aparece também como lacuna.
- Equações foram copiadas do XML (`tex-math`) ou do texto do PDF, com a forma da fonte. Quando a extração veio truncada, isso está dito.

### Resumo executivo

1. **Registro (ICAR Seção 16).** O ICAR não fixa comprimento de lactação padrão para ovelhas. Pede que a organização aprovada defina, por raça e categoria, uma produção de referência, e que o comprimento padrão seja declarado. Só entram as ordenhas exclusivas, depois do desmame. Quantidade é a única medida obrigatória; gordura e proteína são opcionais.
2. **Métodos.** A4 mede as duas ordenhas. AT e AC medem uma ordenha por dia, alternando (AT) ou com correção pelo tanque de rebanho (AC). Na prática, mais de 90% dos rebanhos oficiais usam AT ou AC (Astruc et al. 2023). A amostragem de composição é cada vez mais parcial, concentrada no meio da lactação.
3. **Cálculo da lactação.** Usa-se o método de Fleischmann para TMY (quando ordenha desde o parto) ou TMM (quando ordenha só após a amamentação). Com amamentação, a produção do período de amamentação não é medida.
4. **Lactação no Brasil e no mundo.** Não há padrão único. Os exemplos lidos usam 130 dias após o desmame (Nova Zelândia), 180 dias (Assaf espanhol, via título e trecho), período de ordenha exclusiva da safra (Grécia e França, média de 165 a 169 dias) e teste-dia com ajuste de Ali & Schaeffer (Bulgária).
5. **Avaliação francesa (Lacaune).** BLUP de caráter único, modelo animal com repetibilidade, grupos de pais desconhecidos e variâncias residuais heterogêneas (log-linear em rebanho x ano x parto). Desde 2002 o BLUP clássico leva em conta a heterogeneidade de variância. A adaptação ao ssGBLUP recebeu o mesmo tratamento no fim de 2014. A seleção inclui caracteres funcionais com peso de 50% desde 2005 (Astruc et al. 2016, pp. 2 e 5).
6. **Teste-dia na Bulgária (White Maritza).** Repetibilidade (h² = 0,344 a 0,355), regressão aleatória com polinômios de Legendre (não melhorou o ajuste) e Ali & Schaeffer (h² de 0,528 no início a 0,190 no fim da lactação, para ASRM3). Pelo AIC e BIC, o modelo de repetibilidade REP1 ficou melhor que os modelos de regressão aleatória.
7. **Células somáticas.** Lacaune: h² do escore de células somáticas (SCS) na lactação de 0,15 (Barillet et al. 2001, resumo). Correlação genética com leite de +0,15 na média, mas de -0,48 a +0,27 ao longo da lactação. Na avaliação nacional francesa, h² = 0,13. Não encontrei limiar individual de mastite em ovelhas em fonte aberta lida.
8. **Brasil.** O único estudo de lactação de Lacaune e East Friesian com resumo lido é de Ticiani et al. (2013), em pasto, com 92 dias de medição. Não encontrei avaliação genética de ovinos leiteiros publicada no Brasil nas fontes acessíveis.

---

## 1. Registro de leite em ovinos leiteiros (ICAR Seção 16)

### Takeaway
O ICAR Seção 16 define os métodos oficiais A (A4, A5, A6, AT, AC), B, C e E, mais o Método D, não oficial e reservado a rebanhos comerciais. Por causa do custo, o ICAR recomenda explicitamente métodos simplificados (AT e AC) e amostragem parcial da composição. A lactação é calculada pelo método de Fleischmann, sobre a produção da ordenha exclusiva (TMM) ou sobre a lactação inteira (TMY) quando a ordenha começa no parto.

### Cited Findings

**Terminologia e situações de ordenha** ([ICAR Seção 16, "Terminology and Traits"](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- Comprimento de amamentação ("suckling length") é o período em que os cordeiros mamam, ou mamam e são ordenhados em parte. Se só há fase colostral, o comprimento é zero.
- Comprimento de ordenha exclusiva ("milking-only length") vai do desmame até a secagem.
- Comprimento de lactação é a soma dos dois, ou seja, a diferença entre a data do parto e a da secagem.
- TMY é a produção do parto à secagem, sem amamentação. TMM é a produção só da ordenha exclusiva, com amamentação prévia. TSMM é a soma da produção amamentada (ou amamentada e ordenhada) com o TMM.
- "Milk recorded yield": só a ordenha exclusiva pode entrar no controle leiteiro. Com amamentação, o que se registra é o TMM.
- Situação 1, "milking from lambing": o comprimento de lactação e o da ordenha são iguais; a produção da ordenha exclusiva é o TMY.
- Situação 2, "milking after a suckling period": o pico cai no período de amamentação e só a fase descendente da curva é registrada. Isso ocorre quase sempre.

**Padrão de lactação** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- Texto literal: "impossible to define a standard lactation length or a standard milking length (of the milking-only period). We therefore recommend that the approved organisation defines, for each breed and category of ewes (by age or lactation number), a reference production per lactation, or a reference production for the milking-only period, according to the breeding system. The chosen standard length (in days) must be declared in the publication of the results."
- Anexo 2 (ordenha desde o parto): recomenda produção de referência por lactação, "with a standard lactation length close to the average lactation length of the considered breed".

**Método A4, AT e AC** ([ICAR Seção 16, Anexo 1](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- A4: medida nas duas ordenhas diárias.
- AT (alternating monthly test): mede só uma das duas ordenhas, alternando a cada teste mensal.
- AC (corrected monthly test): mede só uma ordenha e corrige pela diferença manhã/noite, usando o volume total do tanque do rebanho nas duas ordenhas.
- Na seção de frequência, o ICAR diz que AT e AC têm intervalo mensal de 30 dias, "as for the A4 method (considered as the standard method)".
- Intervalo médio: 30 dias (faixa de 28 a 34) para A4, B4, C4 e E4. Para A5, B5 e C5, 36 dias. Para A6, B6 e C6, 42 dias.
- Não há número mínimo fixo de controles mensais por rebanho e período, e cada organização define.

**Regras de cada ovelha** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- Primeiro controle: até 35 dias após a separação completa dos cordeiros, com tolerância de 17 dias. Na prática, a diferença entre o parto e o primeiro controle deve ser menor que "the average suckling length of the breed + 52 days". Exemplos do texto: com amamentação de 0, 25 ou 45 dias, o primeiro controle deve ocorrer em menos de 52, 77 ou 97 dias após o parto.
- Intervalo máximo entre dois controles não nulos da mesma ovelha: 70 dias (2 x 35). Se for maior, o cálculo da lactação para no controle anterior.
- Número mínimo de controles válidos por ovelha: "is not set" e deve ser descrito por raça e categoria (primeira lactação, segunda e demais).
- Ovelhas amamentando, ou amamentadas e ordenhadas em parte, não entram no controle quantitativo: "it is impossible to measure the individual milk yield of suckled ewes ... accurately". Só conta o controle feito quando a ovelha está "definitively separated from its lamb(s)".

**Quantidade, composição e equipamento** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- A única medida obrigatória é a quantidade de leite. Gordura e proteína são opcionais.
- Conversão de peso para volume: 1,036 g/mL, a densidade normal do leite de ovelha.
- Quantidade mínima de leite testada: o texto de "Frequency" diz 200 g ou ml. O Anexo 1 diz 150 g ou ml. Ver Conflitos.
- Erro (desvio-padrão): 40 g ou ml.
- Medidores aprovados pelo ICAR para ovelhas desde 1995. Antes disso, valem os aparelhos aprovados pela organização antes de 1º de janeiro de 1995.

**Cálculo do TMY e do TMM** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- Usa-se o método de Fleischmann, "or another method, if proved to be of equivalent accuracy". Pode haver ou não número mínimo de controles antes de aplicar o método.
- Datas de desmame e de secagem podem ser reais ou calculadas a partir de comprimento-padrão de amamentação.

**Garantia de qualidade do AC** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- Problemas que tornam o AC enviesado: (i) rebanho em que só parte das ovelhas é registrada, mas o tanque é o do rebanho inteiro; (ii) parte das ovelhas ordenhada uma vez ao dia e parte duas vezes.
- O procedimento proposto em Cork (2012) faz um controle mensal nas duas ordenhas por ano-rebanho, para checar o coeficiente AC.

**Método E e Método D** ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats) [LIDO])
- E: método flexível para manter raça sem produção de leite, ou quando só parte das ovelhas é registrada. Os cordeiros podem ser retirados 12 horas antes do teste.
- D: "simplified, non-official recording", com 2 a 4 registros por rebanho e ano, visando 2 a 3 testes por ovelha no meio da lactação. Serve para ranqueamento dentro do rebanho. O texto diz que "lactation calculation is not recommended" nesse método.

**Adoção dos métodos** ([Astruc et al. 2023, ICAR TS 27, pp. 201-203](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2023_Astruc_et_al.pdf) [LIDO])
- Cerca de 890.000 ovelhas em controle oficial em 2021, segundo a pesquisa anual do ICAR (resumo, p. 201).
- Tabela 1 (2020 e 2021). França: 334.685 ovelhas em controle oficial, mais 553.836 pelo Método D (não oficial). Espanha: 256.480. Itália: 161.711. Portugal: 18.052. Croácia: 7.235. Eslováquia: 6.643. Eslovênia: 4.624. República Tcheca: 1.494.
- Métodos por país (ovelhas): França, AC e D. Itália, AT e AC (Sarda). Espanha, AT e AC (parte Latxa). Portugal, A4 (maioria) e AT. Croácia, AT (maioria) e B4. Eslováquia, AC. Eslovênia, AT. República Tcheca, AT.
- "Simplified designs concern 98% of the recorded dairy sheep" (p. 202).
- Amostragem parcial (part-lactation sampling): só a parte central da lactação, "the most heritable and the most highly correlated with the whole lactation". Usada na França, Itália e Espanha (p. 203).
- Exemplo do texto (p. 203): A4 usa 1.200 amostras para 100 ovelhas (100 x 6 testes x 2 ordenhas). Método simplificado (AC, 3 testes, só 1ª parição em 35%) usa 105 amostras. Redução de 91%.
- Efeito no herdabilidade da gordura: "from 0.50 to 0.35 in the case of France" (p. 203). A redução é atribuída ao menor número de medidas por animal (entre 2 e 6 na vida).
- Leite de ovelha: gordura média de 70 a 75 g/L, com pico de 130 a 140 g/L no fim da lactação. Proteína de 50 a 55 g/L, com pico de 100 a 110 g/L (p. 204). Quantidade por ordenha de 500 a 4.000 mL.
- Limites de erro relaxados: para produção, o viés pode ser 1,5 vez o do bovino. Para gordura, o viés é 2 vezes e o desvio-padrão, 3 vezes (ovinos) ou 2 vezes (caprinos) o do bovino (p. 204).
- Medidores certificados pelo ICAR: MM25SG (DeLaval), Lactocorder (WMB) e jarras ARGI (ELCABE). A maioria dos rebanhos usa jarras aprovadas antes de 1995 (p. 204-205).

**Rebanhos franceses no controle oficial** ([Larroque et al. 2011, slides p. 10](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO])
- Tabela com % de controle oficial e produção de referência por raça. Lacaune: 870 mil ovelhas, 20% no controle oficial, 288 L em 165 dias (média de lactação). Manech vermelho: 194 L em 155 dias. Manech preto: 142 L em 140 dias. Basco-béarnaise: 167 L em 143 dias. Corsa: 144 L em 186 dias. A fonte é o Institut de l'Élevage (2010). São médias observadas de comprimento de lactação, não um padrão.

### Inferences
- A recomendação do ICAR é que o comprimento-padrão de lactação seja escolhido pela organização e declarado. Por isso, dois números de "lactação de 150 dias" de países diferentes não são comparáveis sem a regra de cálculo escrita.
- Com amamentação e ordenha exclusiva, a variável geneticamente útil é a produção da ordenha exclusiva (TMM) ou a da lactação inteira (TMY ou TSMM). A escolha depende do sistema (Anexos 2 e 3), e não da raça.
- A combinação AT ou AC com amostragem parcial da composição é o desenho dominante. Isso limita a herdabilidade estimada da gordura, como o próprio Astruc et al. (2023) relatam.

### Gaps
- Anexo 3 (ordenha após amamentação) está presente no texto do wiki, mas o conteúdo está vazio na versão extraída. Não consegui o texto integral dessa regra.
- O texto do ICAR não traz o Método Fleischmann em forma de fórmula. A fórmula aparece em Guevara et al. (2025), que a cita como "Sargent 1968" (ver seção 3).
- A recomendação de número mínimo de controles por ovelha não é fixa no ICAR. Os valores usados por cada país não foram coletados nesta pesquisa.

---

## 2. Padronização da lactação e convenções por país e raça

### Takeaway
Não há um padrão de lactação ovina comparável entre países. Os exemplos lidos usam: a ordenha exclusiva da safra (França e Grécia), a produção padronizada em 130 dias após o desmame (Nova Zelândia), o padrão de 180 dias (Assaf espanhol, por título) e o teste-dia com ajuste de Ali & Schaeffer (Bulgária). O Latxa usa "leche estandarizada", mas o comprimento não foi confirmado em fonte lida.

### Cited Findings

| População | Convenção de produção | Fonte | Situação |
|---|---|---|---|
| Lacaune, França | Produção da ordenha exclusiva (TMM) com Fleischmann. Média de comprimento de lactação de 165 dias (2010) | [Larroque 2011, p. 10](https://docs.eaap.org/2011/S49_Larroque.pdf); [Astruc et al. 2016, Prod. Anim., p. 1-5](https://doi.org/10.20870/productions-animales.2016.29.1.2515) | LIDO |
| Lacaune, Grécia | Produção da ordenha exclusiva (Fleischmann), mínimo de 3 controles válidos (>0,2 kg). Duração média da ordenha de 168,7 dias (DP 17,7) | [Vouraki et al. 2025, seção 2.2](https://doi.org/10.3390/vetsci12030194) | LIDO |
| Lacaune, França (dados 2019-2022) | Mesmo sistema. Média de 168,8 dias (DP 38,9), com 7.166 registros | [Vouraki et al. 2025, Tabela 1](https://doi.org/10.3390/vetsci12030194) | LIDO |
| White Maritza, Bulgária | Teste-dia pelo método AC. Duração de amamentação de 30 a 150 dias. Sem padrão de lactação; o modelo usa o dia da lactação | [Zhelyazkova et al. 2023, Materials and methods](https://doi.org/10.5194/aab-66-253-2023) | LIDO |
| Rebanho comercial de ovelhas leiteiras, Nova Zelândia (Masterton; "Dairymeade sheep" no texto, sem especificação de raça pura) | Produção padronizada em 130 dias de ordenha (do dia 35 ao 164 após o parto). Amamentação exclusiva de cerca de 35 dias | [Marshall et al. 2023, seções 2 e 2.4](https://doi.org/10.3390/ani13030349) | LIDO |
| F1 (East Friesian x Pelibuey/Suffolk/Black Belly), México | TMY pelo Fleischmann (centering date), a partir de controle semanal. Duração da lactação de 70 a 517 dias | [Guevara et al. 2025, seção 2](https://doi.org/10.1007/s11250-025-04365-z) | LIDO |
| Assaf, Espanha | "180-days standardised milk yield" (MY180), TD e comprimento de lactação | [Gutiérrez et al. 2007, título](https://doi.org/10.1016/j.smallrumres.2006.03.009) | Título LIDO; resultados [SNIPPET] |
| Latxa, Espanha (País Basco e Navarra) | "Standardised milk yield" (leche estandarizada) como variável de evolução genética. Comprimento-padrão não confirmado | [Granado-Tajada & Ugarte 2018, slides](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) | Título e gráfico LIDO; comprimento [NÃO VERIFICADO] |
| Sarda, Itália | Ajuste da produção pelo comprimento da ordenha e pela interação idade x parição x mês de parto ("age-parity-month of lambing interaction") | [Carta, Sanna & Rosati 1996, título](https://doi.org/10.1163/9789004684249_052) | Título LIDO; conteúdo não lido |
| Churra, Espanha | Não encontrei convenção de lactação padrão em fonte lida | — | [NÃO VERIFICADO] |
| Manech, França | Não encontrei convenção específica separada da Lacaune nas fontes lidas | — | [NÃO VERIFICADO] |

### Cited Findings (complementares)
- Em Lacaune francesa, o índice ISOL é expresso em equivalente de decilitros ("exprimés en équivalent dl"), segundo Astruc et al. (2016, p. 7-8).
- O slide de introdução de Granado-Tajada & Ugarte (2018) traz o gráfico "GENETIC EVOLUTION OF STANDARISED MILK YIELD" para três populações (LRF, LBF_CAPV e LBF_NA), com eixo de -120 a 60 litros. Os valores plotados não são legíveis na extração, por isso não cito números.

### Inferences
- Para comparar rebanhos, é preciso o comprimento da lactação e a regra de extrapolação. O comprimento padronizado de 130 dias (NZ) e a ordenha exclusiva (França) dão números incomparáveis sem conversão.
- Como os sistemas franceses, gregos e bulgaros coletam ordenha exclusiva, o TMM e a produção da ordenha exclusiva são a variável mais comum. Isso é consistente com a recomendação do ICAR.

### Gaps
- Não foi possível confirmar o comprimento-padrão do Latxa e do Churra, nem a forma exata da padronização do Sarda.
- Assaf (180 dias) e Nova Zelândia (130 dias) são os únicos padrões numéricos explícitos encontrados. Não verifiquei se o Assaf usa 150 dias em outro estudo.

---

## 3. Curvas de lactação em ovelhas e fatores de variação

### Takeaway
As curvas de lactação de ovelhas são ajustadas com modelos empíricos (Wood, Wilmink, Ali & Schaeffer, Legendre em regressão aleatória) e com modelos mecanísticos (Dijkstra, Pollott). Os fatores que aparecem de forma consistente são: número de cordeiros (litter size), idade ou número da parição, época ou mês de parição, duração da amamentação e dia do primeiro controle, e ordenha uma ou duas vezes ao dia após o desmame. A forma da curva depende muito de a amostragem começar cedo ou tarde na lactação.

### Cited Findings

**Modelos empíricos e mecanísticos (México, F1)** ([Guevara et al. 2025, seção 2.3](https://doi.org/10.1007/s11250-025-04365-z) [LIDO])
- Wood (1967): y_t = a t^b exp(-c t). Texto: "a is the milk yield at the beginning of lactation and b and c are the parameters of the increasing and decreasing slopes". Curva típica quando b > 0 e c < 0.
- Wilmink (1987): y_t = a + b exp(-k t) + c t. O parâmetro k foi fixado em 0,033, a partir de análise preliminar.
- Dijkstra et al. (1997): y_t = a exp((b/c)(1 - exp(-c t)) - d t). Texto: "a is the theoretical initial milk yield, b is the specific rate of secretory cell proliferation at parturition, c is the decay parameter and d is the specific rate of secretory cell death".
- Pollott (2000), versão reduzida: y_t = (a / (1 + ((1 - 0,9999999)/0,9999999) exp(-b (t - 150)))) x (2 - exp(c t)).
- Ajuste por mínimos quadrados não lineares (nlsLM, R 4.0.2). Houve falha de convergência em parte das lactações (seção "Lack of convergence").
- Resultado principal (resumo): "the estimation of TMY was not affected by the sampling interval", mas PY e TPY (pico e dia do pico) foram afetados (P < 0,05), com melhores estimativas com controle semanal e quinzenal. Os modelos falharam em curvas atípicas.
- Intervalo de 28 dias corresponde ao método A4 do ICAR, descrito pelo artigo como "the standard method" (seção 2.1).

**Critérios de ajuste (México)** ([Guevara et al. 2025, seção 2.4](https://doi.org/10.1007/s11250-025-04365-z) [LIDO, com ressalva])
- Texto impresso: AIC = n x LL + 2 x p, BIC = n x LL + p x log(n), com LL = log do MSPE. Essa forma não é a convencional (AIC = -2 LL + 2p; BIC = -2 LL + p log n). Não reproduzi as fórmulas no projeto. Conferir antes de usar.
- Erro de previsão: MSPE e RMSPE = sqrt(MSPE). Correlação entre TMY real e previsto (Fleischmann).

**Produção total pelo Fleischmann (México)** ([Guevara et al. 2025, seção 2.1](https://doi.org/10.1007/s11250-025-04365-z) [LIDO])
- Texto: TMY = y1 x t1 + Σ_i ((y_i + y_{i+1})/2) x D_i + y_{k+1} x 7, onde y_1 é a produção no primeiro controle, t_1 é o intervalo entre o parto e o primeiro controle, D_i é o intervalo entre os controles i e i+1, e 7 é o intervalo entre o último controle e a secagem (atribuída a Sargent 1968, "centering date method").

**Regressão aleatória com polinômios de Legendre (Nova Zelândia)** ([Marshall et al. 2023, seção 2.4](https://doi.org/10.3390/ani13030349) [LIDO])
- Dados: 169 ovelhas, 622 controles, safra de 2021-2022 (outubro a janeiro). Dia 1 do modelo = dia 35 de lactação. Tempo t de 1 a 130.
- Modelo, forma do texto: y_ti = (β0 P0 + β1 P1 + β2 P2 + ... + βn Pn) + (α0i P0 + α1i P1 + α2i P2 + ... + αni Pn) + e_ti.
- β: coeficientes de regressão da população. α_i: coeficientes aleatórios do animal i. P_n: polinômios de Legendre ortogonais de ordem n. e_ti: resíduo.
- Escala do tempo: o texto extraído diz "x = -1 + 2, and t - tmin / tmax - tmin, with tmin = 1 and tmax = 130", o que sugere x = -1 + 2(t - t_min)/(t_max - t_min). Forma reconstruída, conferir no PDF.
- Ordem: polinômios de ordem 2 a 5 testados. Escolhidos por AIC e BIC: ordem 4 para leite e lactose; ordem 5 para gordura e proteína.
- Estrutura residual: "diagonal-constant matrix (Toep..." (extração cortada). [Não verificado, conferir no PDF.]
- Software: SAS 9.4, procedimento MIXED, com COVTEST.
- CCS: a fonte diz que "SCS = log2(SCC)" por controle e que a curva não tem padrão, por isso usou-se a média por lactação (seção 2.3). Ver seção 5 sobre a convenção de SCS.
- Persistência: "the estimated yield produced from day 101 to 164 divided by the estimated yield produced from day 35 to day 100", em %.
- Produção padronizada: soma diária dos polinômios de dia 35 a 164 (130 dias).

**Efeitos fixos sobre a lactação padronizada (Nova Zelândia)** ([Marshall et al. 2023, seção 2.4 e Tabela 4](https://doi.org/10.3390/ani13030349) [LIDO])
- Modelo de ANOVA para totais: y_ijkl = μ + coat colour_i + litter size_j + age_k + β1 days in TAD_ijkl + e_ijkl. Texto: "the explanatory variables ... are included as fixed (e.g., breed and parity number) or random (e.g., herd and animal)".
- Resultados: idade (número da parição) e dias em ordenha duas vezes ao dia (TAD) foram significativos para todas as produções. Idade afetou a persistência do leite e da lactose. Número de cordeiros afetou a persistência da proteína. Ordenha duas vezes ao dia afetou fortemente a persistência da gordura (F = 10,96).
- Médias da safra: leite 86,1 kg, gordura 5,1 kg, proteína 4,5 kg, lactose 4,1 kg em 130 dias. CV entre 27 e 31%. Persistência entre 52,3 e 72,7% (resumo).

**Curvas de lactação em Latxa, Ruiz et al. (2000)** ([DOI](https://doi.org/10.3168/jds.s0022-0302(00)75165-4) [SNIPPET])
- Trecho de busca: 14.699 controles de 2.711 ovelhas do programa basco, seis modelos empíricos comparados. O modelo não linear de "variable decay" teve menor erro de previsão e menor autocorrelação residual. Rebanho, mês de parição, parição e número de cordeiros foram significativos (P < 0,01) para os parâmetros e para a produção total. Fonte de trecho secundário (CGSpace ILRI). Texto completo não lido.

**Regressão aleatória em Churra da Terra Quente (Portugal)** ([SNIPPET; repositório IPB, vínculo não confirmado como o mesmo documento](https://bibliotecadigital.ipb.pt/handle/10198/11303))
- Trecho: modelos de regressão fixa e aleatória, com polinômios de Legendre de ordem 3. A herdabilidade atingiu o máximo por volta do dia 60. Não é Churra espanhola. Não encontrei o DOI: uma consulta ao Crossref devolveu erro 429 e a outra não trouxe o artigo.

**Teste-dia e Ali & Schaeffer (Bulgária, White Maritza)** ([Zhelyazkova et al. 2023, Materials and methods e Results](https://doi.org/10.5194/aab-66-253-2023) [LIDO])
- Base: 8.768 controles de 987 ovelhas, 18 rebanhos, 1992 a 2015, método AC. Amamentação de 30 a 150 dias. Pelo menos 3 controles por ovelha. Produção média 764,47 mL por controle, CV 56%.
- Primeiro controle com maior produção: 1.074,34 mL. A produção cai ao longo da lactação.
- Duração média da amamentação das raças nativas (texto da introdução): 67,5 dias (White Maritza), 63,5 dias (sintética), 62,5 dias (Patch-faced Maritza).
- Termos fixos do modelo REP1: ano x estação de parição (YS_i, 67 classes), intervalo de 3 dias de lactação a partir do dia 30 (DIM3_j), parição (PAR_k, 7 classes), tamanho da ninhada (LS_l, 2 classes), idade ao parto (quadrática) e duração da amamentação (quadrática).
- Estações de parição (texto): agosto a novembro; dezembro a fevereiro; março a junho.

### Inferences
- Como a primeira ordenha é feita em momentos diferentes, o "dia da lactação" não é o mesmo tempo para todas as ovelhas. Os modelos de teste-dia precisam de um efeito fixo para o intervalo entre parto e primeiro controle. Larroque et al. (2011, p. 21) usam essa variável para produção de leite e células somáticas.
- A "persistência" da NZ (dias 101-164 sobre dias 35-100) e o "pico" de Wood/Wilmink são definições diferentes. Não são intercambiáveis.
- Para o SeabraApp, os dados de controle de ovelhas devem guardar: data do parto, data do desmame (real ou calculada), data da secagem, número de cordeiros, intervalo parto-primeiro controle e modo de ordenha (uma ou duas vezes). Esses campos aparecem nas fontes como efeitos fixos.

### Gaps
- Efeitos quantitativos (kg ou %) de número de cordeiros, época de parição e parição sobre a lactação de ovelhas leiteiras europeias não foram extraídos dos textos completos. Só há efeitos qualitativos (significativo ou não) nas fontes lidas.
- Churra e Latxa: os trechos citados são de busca, não de leitura. Não tenho os parâmetros.
- Não encontrei curva de lactação de Lacaune com dados brasileiros além de Ticiani et al. (2013), que usa só 92 dias em pasto (seção 7).

---

## 4. Modelos de avaliação genética

### Takeaway
Na França (Lacaune e raças pirenaicas), a avaliação oficial usa BLUP de caráter único com modelo animal de repetibilidade e variâncias residuais heterogêneas, e modelo multicaracterística para morfologia do úbere. Na Grécia e na Bulgária, os trabalhos publicados usam modelos de rebanho fixo ou de teste-dia, com efeitos de rebanho-ano e, no caso búlgaro, com regressão aleatória e Ali & Schaeffer. Na Espanha, a avaliação do Latxa é BLUP com dados de programa de teste de progênie e ssGBLUP em estudo. Não encontrei uma avaliação oficial de teste-dia com regressão aleatória em ovinos leiteiros, em fonte aberta lida. Ver seção 4.3 para os modelos de pesquisa.

### 4.1 França: avaliação nacional (Lacaune e raças pirenaicas)

#### Cited Findings

Modelo de produção, em forma de texto ([Larroque et al. 2011, p. 19](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO]):
- "BLUP single trait"; "repeatability animal model"; "unknown parents genetic groups"; "Assuming (not LSCS): heterogeneous residual variances; known constant variance ratios".

Modelo de variância residual ([Larroque et al. 2011, p. 20](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO]):
- "Log-linear model for residual variances: fixed effect of year*parity*area; random effect of herd*year*parity (without autocorrelation)".

Efeitos ambientais ([Larroque et al. 2011, p. 21](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO, lido em imagem]):

| Efeito | MY | FY, PY, F%, P% | LSCS |
|---|---|---|---|
| Rebanho x ano x parição (herd*year*parity) | x | x | x |
| Idade ao parto (+) | x | x | x |
| Época de parição (+) | x | x | x |
| Intervalo parto-primeiro controle (+) | x | — | x |
| Número e tempos de amostragem, AC | — | x | — |
| Parição (corsa / pirenaica ocidental) | x | — | — |
| Duração do período seco (+) | x | x | x |

"+" = dentro de ano x parição. Na legenda do slide, a cor indica se o efeito é definido por área (ovinos) ou em quatro áreas (caprinos). Os itens "intervalo" e "amostragem" aparecem como específicos de ovinos.

Modelo multicaracterística para úbere ([Larroque et al. 2011, p. 22](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO]):
- "BLUP multiple-trait animal model". Efeitos fixos para Lacaune: rebanho, ano, classificador, tempo entre ordenha e escore, idade ao parto, estádio da lactação, tamanho da ninhada.

Escala da avaliação ([Larroque et al. 2011, pp. 23-25](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO]):
- Lacaune: 4.278.634 registros de produção de leite, 1.392.483 animais no pedigree. "Rolling base". Confiabilidade publicada: 0,30.
- Manech vermelho: avaliações em 3 momentos de primavera e 1 em setembro. Manech preto: 2.088.443 registros e 618.663 animais. Corsa: 368.331 registros e 117.583 animais.
- Ganho anual observado da Lacaune (1990-2008): produção de leite +5,3 L por ano (0,15 desvio genético por ano). Gordura +0,19 g/L (0,05 σg). Proteína +0,16 g/L (0,07 σg).

Parâmetros genéticos (Lacaune, em vermelho na figura; [Larroque et al. 2011, p. 14 e 16](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO, lido em imagem]):
- h² e repetibilidade: MY 0,30 e 0,50; PY 0,30 e 0,50; FY 0,30 e 0,50; P% 0,45 e 0,70; F% 0,35 e 0,60; LSCS 0,13 e 0,31.
- Correlações genéticas (Lacaune): FY-PY 0,9; FY-MY 0,8; PY-MY 0,9; MY-F% ≈ -0,2; MY-P% ≈ -0,4; F%-P% 0,7; FY-F% 0,2; PY-P% ≈ 0,1; LSCS-MY 0,15; LSCS-P% 0,08; LSCS-F% 0,07; LSCS-udder depth -0,32.

Histórico (Astruc et al. 2016, Prod. Anim., pp. 2 e 5, [DOI](https://doi.org/10.20870/productions-animales.2016.29.1.2515) [LIDO]):
- "Depuis 2002, l'évaluation BLUP classique des caractères laitiers (lait, quantité de matière et taux) prend en compte les hétérogénéités de variance, en utilisant un modèle proche de celui utilisé en bovins laitiers en France (Robert-Granié et al 1999) : les variances (génétiques, résiduelles et d'environnement permanent) varient en fonction du troupeau, de l'année et de la parité."
- "L'adaptation des programmes du ssGBLUP pour prendre en compte les hétérogénéités de variance a été réalisée fin 2014 et incluse dans le logiciel blupf90iod2."
- Grupos de pais desconhecidos foram incluídos "fin 2013". Na Lacaune, todos os machos têm pai e mãe conhecidos. As fêmeas têm mãe conhecida em 99% e pai conhecido em 95%. O texto diz que a sensibilidade a esse efeito é "forte" para o progresso genético estimado (p. 5).
- Testagem: "100 à 140 IA selon les races, soit 30 à 40 filles en première lactation (contre 80-100 filles en bovins)" (p. 2). Intervalo de geração de 4 anos na Lacaune, contra 8 nos bovinos antes da genômica (p. 2).

ISOL, índice nacional (Astruc et al. 2016, pp. 2, 7 e 8, [DOI](https://doi.org/10.20870/productions-animales.2016.29.1.2515) [LIDO]):
- "Index Synthétique des Ovins Laitiers (ISOL)", expresso em "équivalent dl". Caracteres funcionais entram na seleção desde 2005 com peso de 50% no critério. O texto diz que a seleção de funcionais deu ganho de 0,23 desvio genético por ano sobre o ISOL (p. 2). Limiar habitual de 100 pontos ISOL para escolher reprodutores (p. 7).

#### Inferences
- O modelo francês de Lacaune é, em estrutura, o mesmo de repetibilidade com variância heterogênea que o usado em bovinos leiteiros franceses (Robert-Granié et al. 1999, citado em Astruc et al. 2016). A diferença está nos efeitos específicos de ovinos (intervalo parto-primeiro controle e amostragem AC) e no tratamento do SCS (LSCS), que o slide 19 separa com "(not LSCS)".
- A forma matricial do modelo não aparece em nenhuma fonte lida. Forma padrão [INFERÊNCIA, não escrita na fonte]: y = Xb + Z_a a + Z_p p + e, com Var(a) = A σ²_a, Var(p) = I σ²_p e Var(e) = R, sendo R diagonal com variâncias por rebanho x ano x parição.

#### Gaps
- Nenhuma equação explícita do modelo francês de Lacaune aparece nas fontes lidas. A descrição vem de tópicos de slide e de texto. Não há equação de ssGBLUP nas fontes lidas (Baloche et al. 2011 e Astruc et al. 2016 dão só resultados e descrição).
- Para LSCS, a tabela de efeitos inclui rebanho x ano x parição, mas o slide 19 separa a suposição de variância heterogênea com "(not LSCS)". Não consegui saber quais suposições valem para LSCS.
- Os valores de precisão dos índices genômicos de Lacaune (Baloche et al. 2011 e Astruc et al. 2016) estão em tabelas não extraídas de forma confiável.

### 4.2 Grécia e França: estudo de interação GxE na Lacaune (Vouraki et al.)

#### Cited Findings

Modelo univariado de cada país ([Vouraki et al. 2025, seção 2.4.1, equação 1](https://doi.org/10.3390/vetsci12030194) [LIDO]):
- Texto literal da equação: "Yijklm=μ+Fi+Yj+Pk+b1 ×M+b2 ×A+b3 ×D+Ll+Am+eijklm".
- Legenda do texto: Y_ijklm = produção do animal m; μ = média; F_i = rebanho (4 níveis na Grécia, 186 na França); Y_j = ano (2 níveis na Grécia, 4 na França); P_k = parição (2 na Grécia, 7 na França); b1 = regressão no comprimento da ordenha M (dias); b2 = regressão na idade ao parto A (meses); b3 = regressão nos dias entre parto e primeiro controle D; L_l = número de cordeiros (2 níveis); A_m = efeito genético aditivo aleatório; e = resíduo.
- Na França, o efeito de ambiente permanente também entra no modelo (texto da seção 2.4.1).
- Para composição (gordura e proteína), o mesmo modelo recebe um efeito fixo para a combinação de controles mensais usada na média ponderada (11 níveis).
- Software: ASReml 4.2 (REML, análise univariada). Pedigree com 26.547 animais (slides EAAP 2024, p. 7).
- Dados: Grécia, 1.658 ovelhas (2021-2022), 4 fazendas intensivas. França, 7.166 registros de ordenha de 4.859 ovelhas (2019-2022), 186 fazendas semiextensivas.

Correlações genéticas aproximadas entre países ([Vouraki et al. 2025, seção 2.4.2, equações 2 a 5](https://doi.org/10.3390/vetsci12030194) [LIDO]):
- Rel = 1 - PEV / σ²_A (equação 2).
- r_g = [Σ_i ρ_i,EBV × Σ_i ρ_i,EBV' / Σ_i (ρ_i,EBV × ρ_i,EBV')] × r_EBV,EBV' (equação 3). Forma reconstruída do texto extraído, em que as frações aparecem empilhadas; conferir no PDF. O texto diz que as correlações foram estimadas com EBVs de pais e avós comuns, segundo Calo et al. (citado pela fonte).
- SE(r_g) = sqrt((1 - r_g²)/(n - 2)) (equação 4, Onyiro et al.), com n = número de pais comuns.
- Cov_{1,2} = r_g x (sd_1 x sd_2) (equação 5).

Resposta à seleção ([Vouraki et al. 2025, seção 2.4.3, equação 6](https://doi.org/10.3390/vetsci12030194) [LIDO]):
- ΔG = i x r x σ_A (equação 6), em que i é a intensidade de seleção, r a acurácia (raiz da confiabilidade do pai, mínimo 0,30) e σ_A o desvio genético aditivo.
- Candidatos: 30 machos na Grécia, 600 na França. Top 10 e top 15 pais dentro de cada país e entre países.

Herdabilidades e correlações (Tabela 3, [Vouraki et al. 2025](https://doi.org/10.3390/vetsci12030194) [LIDO]):

| Caráter | País | h² (EP) | r (EP) | rg GR-FR (EP) |
|---|---|---|---|---|
| Produção de leite (kg/ovelha/período de ordenha) | Grécia | 0,19 (0,09) * | — | 0,86 (0,13) * |
| | França | 0,24 (0,05) * | 0,41 (0,02) * | |
| Gordura (%) | Grécia | 0,30 (0,13) * | — | 0,59 (0,21) * |
| | França | 0,34 (0,05) * | 0,40 (0,02) * | |
| Proteína (%) | Grécia | 0,19 (0,10) | — | 0,88 (0,12) * |
| | França | 0,52 (0,02) * | 0,52 (0,02) * | |
| Lactose (%) | Grécia | 0,10 (0,05) * | — | — |
| SNF (%) | Grécia | 0,14 (0,07) * | — | — |

\* = significativo (P < 0,05). A fonte deixa claro que a estimativa de proteína na Grécia não é significativa.

Resultados de resposta à seleção (EAAP 2024 slides, [Vouraki et al. 2024, pp. 8-15](https://docs.eaap.org/2024/m221/S02T11.pdf) [LIDO, pelos números da tabela de slides]): para leite, top 10 pais, ΔG dentro da França = 53,18 kg, entre países (França) = 53,24 kg; dentro da Grécia = 37,62 kg, entre países (Grécia) = 82,80 kg. Os valores são de simulação determinística com as σ_A e acurácias informadas.

Método de referência (EAAP 2024, [slides pp. 5-7](https://docs.eaap.org/2024/m221/S02T11.pdf) [LIDO]): Fleischmann para produção do período de ordenha. Para composição, média ponderada dos controles mensais. Efeitos fixos nos modelos mistos: fazenda, ano, parição, comprimento do período de ordenha, dias do parto ao primeiro controle e combinação de controles (p. 7).

#### Inferences
- A correlação genética GR-FR para leite (0,86) e proteína (0,88) é alta. Para gordura (0,59), é moderada. A fonte interpreta que há interação GxE moderada para gordura.
- A ligação entre países é fraca: 6 pais e 11 avós em comum (seção Discussão). Isso reflete pouco uso de IA na Grécia.
- O ganho de seleção "entre países" aumenta muito na Grécia, o que mostra o valor de conectividade, mas é resultado de simulação, não de avaliação conjunta real.

#### Gaps
- A forma da equação (3) não foi extraída com segurança do XML.
- O erro padrão da correlação em proteína é 0,12 no artigo e 0,13 no slide (diferença pequena, não corrigida).
- A correlação de gordura é 0,59 no artigo e 0,57 no slide do EAAP 2024. Conferir qual é a versão final.

### 4.3 Teste-dia: repetibilidade, regressão aleatória e Ali & Schaeffer (Bulgária, White Maritza)

#### Cited Findings

Modelos de repetibilidade ([Zhelyazkova et al. 2023, seção "Repeatability models", equações 1 a 3](https://doi.org/10.5194/aab-66-253-2023) [LIDO]):
- Modelo 1 (texto literal): "1yijklmn=YSi+DIM3j+PARk+LSl+b1(age)2+b2(sp)2+fytdm+an+pen+eijklmn".
- Modelo 2: "2yiklmn=YSi+PARk+LSl+b1(age)2+b2(sp)2+b3(DIM)+fytdm+an+pen+eiklmn".
- Modelo 3: "3yiklmn=YSi+PARk+LSl+b1(age)2+b2(sp)2+b3DIM/314+b4DIM/3142+b5ln 314/DIM+b6ln 314/DIM2+fytdm+an+pen+eiklmn".
- Notação: YS_i = ano x estação de parição (67 classes); DIM3_j = estágio da lactação em intervalos de 3 dias (a partir do dia 30); PAR_k = parição (7 classes); LS_l = tamanho da ninhada (2 classes); age = idade ao parto; sp = duração da amamentação; fytd_m = rebanho x ano x dia do teste (aleatório); a_n = efeito genético aditivo da ovelha (aleatório); pe_n = ambiente permanente (aleatório); e = resíduo.
- Modelo 2 substitui DIM3 por regressão linear em DIM dentro da parição. Modelo 3 usa a forma de Ali & Schaeffer (1987) em DIM/314.

Modelos de regressão aleatória ([Zhelyazkova et al. 2023, equações 4 a 7](https://doi.org/10.5194/aab-66-253-2023) [LIDO]):
- Equação 4 (texto literal): "4yiklmn=YSi+DIM3j+PARk+LSl+b1(age)2+b2(sp)2+fytdm+∑o=03aonZon+∑o=03peonZon+eiklmn,"
- Z_on = polinômio de ordem o avaliado em DIM n (o = 0 a 3). a_on = coeficiente aleatório genético; pe_on = coeficiente aleatório de ambiente permanente.
- Equação 5 (texto literal): "σao2=zo′Gzo". Equação 6: "σpeo2=zo′Pzo". Equação 7: "ho2=σao2/(σao2+σpeo2+σe2)".
- z_o = vetor de polinômios para DIM n; G = matriz de (co)variância dos coeficientes aleatórios genéticos; P = matriz de (co)variância dos coeficientes de ambiente permanente; σ²_e = variância residual. O texto diz que o modelo 1 é equivalente à regressão de ordem 0.
- Modelo RRM1, RRM2, RRM3: ordens 1, 2 e 3 de Legendre.

Modelos Ali & Schaeffer com regressão aleatória ([Zhelyazkova et al. 2023, equação 8](https://doi.org/10.5194/aab-66-253-2023) [LIDO]):
- "8yiklmn=YSi+PARk+LSl+b1(age)2+b2(sp)2+b3DIM/314+b4DIM/3142+b5ln 314/DIM+b6ln 314/DIM2+fytdm+∑o=03aonZon+∑o=03peonZon+eiklmn".
- b3 a b6: coeficientes fixos de ASR (Ali & Schaeffer 1987). DIM de 33 a 314.

Comparação de modelos ([Zhelyazkova et al. 2023, equações 9 a 11](https://doi.org/10.5194/aab-66-253-2023) [LIDO, com ressalva]):
- AIC = 2 ln(L(i)/L(0)) - (v_i - v_0); BIC = 2 ln(L(i)/L(0)) - (v_i - v_0) x ln n - r(X) (o texto impresso tem essa forma, conferir); -2LogL = n log 2π + log(SSE/n) + 1 (extração ilegível em parte).

Estrutura de variâncias ([Zhelyazkova et al. 2023, seção "Repeatability models"](https://doi.org/10.5194/aab-66-253-2023) [LIDO]):
- "homogeneous residual variances were assumed"; "The random animal genetic effects were assumed to have (co)variance structures proportional to the additive relationship matrix, whereas the repeated animal effects were unstructured."
- Estimação em VCE 5.1.2 (Groeneveld et al. 2008), modelo univariado de repetibilidade.

Resultados de herdabilidade e repetibilidade (Tabela 6, [Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023) [LIDO]):

| Modelo | σ²_a | σ²_pe | σ²_fytd | σ²_e | h² (EP) | r (EP) |
|---|---|---|---|---|---|---|
| REP1 | 0,355 ± 0,060 | 0,029 ± 0,048 | 0,289 ± 0,021 | 0,327 ± 0,012 | 0,355 ± 0,060 | 0,384 ± 0,045 |
| REP2 | 0,344 ± 0,047 | 0,032 ± 0,042 | 0,278 ± 0,019 | 0,346 ± 0,012 | 0,344 ± 0,047 | 0,376 ± 0,051 |
| REP3 | 0,347 ± 0,060 | 0,031 ± 0,049 | 0,298 ± 0,020 | 0,324 ± 0,011 | 0,347 ± 0,060 | 0,379 ± 0,065 |

Variâncias "calculated as a ratio between the general phenotypic variance", ou seja, expressas em proporção da variância fenotípica. Diferença de erro-padrão entre resumo e tabela para a repetibilidade de REP1 (0,065 no resumo; 0,045 na tabela): ver Conflitos.

- Trajetórias de h² ao longo da lactação (Figura 1 e 2, lidas no texto): ASRM3 tem h² de 0,528 no início e 0,190 no fim. Na RRM3, h² é maior até o dia 165, depois fica abaixo da linha do REP1.
- Explicação dos autores: a primeira e às vezes a segunda ordenha de teste ocorrem no período de confinamento. As demais ocorrem em pastejo. Assim, a variância ambiental de dieta e manejo pode ser confundida com a genética.

Comparação de autores com outras raças citadas no artigo (cited within [Zhelyazkova et al. 2023](https://doi.org/10.5194/aab-66-253-2023), não lido nas fontes originais):
- Komprej et al. (2011): h² de 0,10 a 0,23 para Bovec, Bovec melhorado e Pramenka da Ístria, por mês de lactação.
- Oravcová & Peskovicová (2008): h² de 0,19 (Tsigai), 0,10 (Valachian melhorado) e 0,15 (Lacaune).
- Jawasreh & Khasawneh (2007): Awassi, h² de 0,26 a 0,27 e repetibilidade de 0,27 a 0,34.
- Cappio-Borlino et al. (1997): repetibilidade de 0,45 para Valle del Belice.

#### Inferences
- A repetibilidade simples (REP1) é tão boa ou melhor que a regressão aleatória em ovelhas búlgaras, com este número de registros (8.768). A regressão aleatória exige mais dados por ovelha e tem mais parâmetros.
- O padrão de h² alto no início e baixo no fim da lactação, observado por ASRM3, é esperado quando a produção inicial é mais influenciada pela genética. Os autores atribuem parte dessa variação ao manejo de confinamento e pastejo, e não ao modelo.

#### Gaps
- Não está escrito se o desvio-padrão do resumo (0,065) ou da tabela (0,045) é o correto.
- A equação 11 (-2 LogL) está ilegível na extração.
- Não encontrei avaliação genética oficial de teste-dia com regressão aleatória em ovinos leiteiros, por país, em fonte aberta lida.

### 4.4 Regressão aleatória: o que foi estimado

Os dois estudos lidos que usam regressão aleatória são a curva da Nova Zelândia (seção 3) e a White Maritza (seção 4.3). Os resultados de herdabilidade dessas duas curvas são de populações pequenas e não comparáveis entre si:
- NZ (169 ovelhas, 622 controles): não reportou herdabilidade. Os coeficientes α_i são de animal, mas o texto não os trata como genéticos.
- White Maritza (987 ovelhas): h² de 0,528 a 0,190 pela curva ASR. É a única série de h² por dia da lactação em ovinos que li em texto completo.

Trecho de busca de Latxa ou Assaf com regressão aleatória não encontrado.

### 4.5 Espanha: Latxa, Assaf, Churra e Manchega

#### Cited Findings

Latxa, programa de melhoramento ([Granado-Tajada & Ugarte 2018, slides 2-4](https://docs.eaap.org/2018/Session26/S26_09_Granado.pdf) [LIDO]):
- Programa iniciado em 1984. Raça Latxa de face vermelha (LRF) e de face preta (LBF) do País Basco e de Navarra. Seleção dentro de raça para produção de leite, gordura e proteína e morfologia do úbere.
- Tamanho: LRF, 209.981 ovelhas em 4.226 rebanhos. LBF do País Basco, 120.792 ovelhas em 3.742 rebanhos. LBF de Navarra, 100.088 ovelhas em 985 rebanhos.
- Ganho genético anual de 3,5 a 4% na produção de leite, citando Ugarte (2017).
- Dados da LRF (1984-2017): 150.164 registros genealógicos, 392.295 registros fenotípicos, 133.230 ovelhas, 325 rebanhos, 1.835 machos, 429 machos genotipados, 39.593 SNP.
- Avaliação: "BLUP genetic evaluation" de referência (slide de metodologia). Validação de ssGBLUP em machos com e sem genótipo: validação com 93 machos (2012-2014), treino com 184 genotipados (1984-2011). Resultado do modelo rotulado "CS" no slide: slope 0,60 e R 0,41 (rótulo do slide; restante da tabela não extraído).
- Legarra et al. (2014), citado: "Hardly understandable results" e "Negative accuracy for CS" para os Latxa. O texto atribui isso à estrutura dos dados (fraca relação entre grupos de treino e validação e poucos machos genotipados).
- Lasarte (2018) é um plano de sustentabilidade do Latxa, sem equações. Não usei.

Assaf espanhol ([Gutiérrez et al. 2007, título e trecho de busca](https://doi.org/10.1016/j.smallrumres.2006.03.009) [SNIPPET]):
- Título: "Genetic parameters affecting 180-days standardised milk yield, test-day milk yield and lactation length in Spanish Assaf (Assaf.E) dairy sheep".
- Trecho: 42.197 registros de teste-dia, 7.654 lactações, 3.854 animais. h² de MY180 de 0,131 a 0,177 nos modelos. c² de ambiente permanente para teste-dia de 0,27 a 0,28. Os autores dizem que as h² estão "on the lower limit of those usually reported".

Sarda, Itália (dados de pesquisa):
- Carta, Sanna & Rosati (1996, [DOI](https://doi.org/10.1163/9789004684249_052)) [título]: ajustes de produção para comprimento da ordenha e interação idade x parição x mês de parição.
- Bittante, Cipolat-Gotet & Pazzola (2017, [DOI](https://doi.org/10.3168/jds.2016-11212)) [SNIPPET]: 1.121 ovelhas Sarda de 23 rebanhos. Herdabilidades para coagulação e firmeza da coalhada. Produção de leite com relação genética desfavorável à maioria das medidas de firmeza.
- Modelo bivariado de composição (sem ano nem DOI verificado) [SNIPPET, não verificado]: h² de cerca de 0,30 (leite), 0,48 (gordura) e 0,55 (proteína).

Churra, Espanha ([SNIPPET, fonte não identificada]): trecho de 2002 com 1.111 ovelhas e herdabilidades 0,31 (proteína), 0,30 (caseína), 0,22 (proteína do soro), 0,09 (LILCY), 0,26 (leite) e 0,11 (CCS). São médias de lactação, não padronizadas a 150 ou 180 dias. Fonte não identificada [NÃO VERIFICADO]. Estudo de 2021 em JDS com 1.049 ovelhas Churra (caracteres de queijaria): h² de 0,08 a 0,42. Sem h² de leite no trecho.

Manchega (Heddi et al. 2026): sem parâmetros genéticos. Estudo fenotípico (seção 5).

Legarra & Ugarte (2005, [DOI](https://doi.org/10.3168/jds.s0022-0302(05)72899-x)): parâmetros genéticos de caracteres de úbere, CCS e produção em Latxa. Só metadados lidos.

#### Inferences
- A avaliação do Latxa depende de programas de teste de progênie e de muitos rebanhos pequenos (média de 410 ovelhas por rebanho na LRF). A conectividade é o gargalo, como o próprio Granado-Tajada & Ugarte (2018) mostram em slides de conectividade (título da sessão 26).
- A escolha de 180 dias no Assaf espanhol mostra que o padrão de lactação varia entre raças espanholas, e não é o de 150 dias do texto francês.

#### Gaps
- Não consegui o texto integral de Gutiérrez et al. (2007), Ruiz et al. (2000), Legarra & Ugarte (2005) ou Bittante et al. (2017). Os números acima são de trecho de busca.
- O método de avaliação oficial do Latxa, do Assaf e da Churra (modelo, efeitos fixos, padrão de lactação) não foi lido em fonte espanhola oficial. Os documentos do MAPA estão bloqueados por certificado TLS (ver Lacunas).
- Não encontrei avaliação genética oficial de Manchega em fonte lida.

### 4.6 Grupos contemporâneos e rebanhos pequenos

#### Cited Findings
- França, Lacaune: grupo contemporâneo = rebanho x ano x parição (MY, Larroque et al. 2011, p. 21).
- Bulgária, White Maritza: o efeito aleatório de rebanho x ano x dia de teste (fytd) foi usado porque os registros de cada criador duram em média 4,99 anos. Quatro rebanhos tiveram mais de 7 anos de controle (Zhelyazkova et al. 2023, Materials and methods).
- Grécia, Lacaune: rebanho como efeito fixo (4 fazendas). Conectividade baixa: 6 pais e 11 avós em comum com a França (Vouraki et al. 2025, seção 4).
- Espanha, Latxa: 325 rebanhos para 133.230 ovelhas da LRF (1984-2017). Média de cerca de 410 ovelhas por rebanho (Granado-Tajada & Ugarte 2018).
- ICAR: rebanhos de 200 a 500 fêmeas (Astruc et al. 2023, resumo).
- Baloche et al. (2011, pp. 9-11): ao discutir ganhos menores da GBLUP em ovinos do que em bovinos, os autores listam como hipótese "size of contemporary groups and lack of preferential treatment in sheep ?". A fonte marca como pergunta, não como resultado.

#### Inferences
- [INFERÊNCIA] Com rebanho x ano x parição como grupo contemporâneo, a comparação ocorre dentro de cada rebanho. Rebanhos pequenos, com poucas ovelhas por ano, têm pouca informação por nível, e a comparação entre rebanhos depende de pais em comum.
- O problema de rebanhos pequenos é mais de conectividade entre rebanhos do que de tamanho do grupo contemporâneo. Essa é a leitura mais coerente com Vouraki et al. (2025) e com Granado-Tajada & Ugarte (2018).

#### Gaps
- Não encontrei comparação quantitativa, em fonte lida, de viés ou acurácia por tamanho de rebanho em ovinos leiteiros.

### 4.7 Múltiplas lactações e modelos multicaracterística

#### Cited Findings
- França, úbere: modelo multicaracterística animal com rebanho, ano, classificador, tempo, idade, estádio e tamanho da ninhada (Larroque et al. 2011, p. 22).
- França, produção: parição é efeito fixo (7 classes para a França e 2 para a Grécia em Vouraki et al. 2025). Não há modelo multicaracterística entre lactações nas fontes lidas.
- Bulgária, White Maritza: parição é efeito fixo, com 7 classes.
- Rupp et al. (2003, [DOI](https://doi.org/10.3168/jds.s0022-0302(03)73732-1)) [SNIPPET]: "multitrait sire models" com 94.445 registros de primeira lactação e 45.499 de segunda. Herdabilidade de SCS na média de lactação de cerca de 0,13, semelhante nas duas paridades. Não li o texto.

#### Inferences
- A maior parte dos modelos lidos trata parição como efeito fixo e não como caráter separado. A correlação entre lactações não aparece nas fontes lidas. Não há base aberta para dizer se ovelhas de 1ª e 2ª lactação devem ser tratadas como caracteres diferentes.

#### Gaps
- Falta a correlação genética entre lactações (ou entre primeira e segunda lactação) para leite e SCS em ovinos. Pede leitura de Rupp et al. (2003) e de outros trabalhos europeus.

---

## 5. Células somáticas em ovelhas (CCS e SCS)

### Takeaway
A contagem de células somáticas (SCC) é transformada em escore (SCS = log2(SCC/10^5) + 3) para análise genética. No Lacaune francês, a avaliação usa o escore na média de lactação (LSCS), com herdabilidade de cerca de 0,13 a 0,15 e correlação genética com a produção de leite próxima de zero na média, mas com sinal que muda ao longo da lactação. Não achei, em fonte aberta lida, um limiar individual validado de mastite para ovelhas. Os valores de rebanho da Grécia (1,1 milhão de células por mL em média) são de tanque, e as faixas usadas lá são de rebanho, não de ovelha.

### Cited Findings

**Definição e faixas (Heddi et al. 2026)** ([DOI](https://doi.org/10.3390/foods15091527) [LIDO])
- Fórmula impressa: SCS = log2(SCC/10^5) + 3. O texto diz que a transformação "was originally proposed to standardise SCC data" e que "each unit increase in SCS corresponds to a doubling of SCC".
- Classes (Manchega, 752 amostras individuais):

| Classe | SCS (log2) | SCC (células/mL) | n |
|---|---|---|---|
| SCS1 | < 2,14 | < 55.000 | 146 |
| SCS2 | 2,14 a 3,15 | 55.000 a 110.000 | 158 |
| SCS3 | 3,15 a 4,24 | 110.000 a 235.000 | 149 |
| SCS4 | 4,24 a 5,99 | 235.000 a 795.000 | 149 |
| SCS5 | > 5,99 | > 795.000 | 150 |

- Modelo fenotípico: y_ijklm = μ + DIM_i + Parity_j + Birth type_k + SCS_l + Flock-date_m + e_ijklm. As classes usam o escore como efeito fixo (texto literal da equação).

**Convenção diferente (Marshall et al. 2023)** ([DOI](https://doi.org/10.3390/ani13030349) [LIDO])
- "The somatic cell score (SCS) was calculated for each test-day record as SCS = log2(SCC)." Não há ajuste de 10^5 nem de +3. A média de SCS por lactação foi usada como medida, porque não havia padrão ao longo da lactação.

**Rebanho tcheco, sem genética (Kuchtík et al. 2025)** ([DOI](https://doi.org/10.5194/aab-68-691-2025) [LIDO])
- Quatro rebanhos tchecos. Média de SCC de 5,31 "log cells mL-1" e contagem total de micro-organismos de 5,24 "log cfu mL-1". Escreve em log sem indicar a base. Se for log10, equivale a cerca de 204.000 células/mL (cálculo meu, não consta na fonte).
- Os autores dizem que ovelhas com sinais de mastite eram retiradas da produção durante o estudo.
- Efeito de rebanho significativo (p ≤ 0,05). Estágio de lactação, sistema de ordenha e tamanho do rebanho têm tabelas próprias, cujos valores não extraí.

**Tanque de rebanho, Grécia (Animals 2026)** ([DOI](https://doi.org/10.3390/ani16132030); [PMC13359843](https://pmc.ncbi.nlm.nih.gov/articles/PMC13359843/) [LIDO])
- 83 rebanhos de ovinos e caprinos (Epiro, noroeste da Grécia). Média do tanque de 1.123 x 10^3 células/mL (DP 913; mediana 883; faixa 21 a 5.467).
- Categorias de tanque (adaptadas de referências citadas pelo artigo, não verificadas): saudável, ≤ 200 x 10^3; subclínico ("traces"), 201 a 400 x 10^3; grave estágio 1, 401 a 1.200 x 10^3; grave estágio 2, 1.201 a 5.000 x 10^3; grave estágio 3, > 5.000 x 10^3.
- Apenas 10% dos rebanhos ficaram na categoria saudável. O artigo cita um limite regulatório da UE de 1.500 x 10^3 células/mL, ultrapassado por 26,2% dos rebanhos. Não verifiquei o regulamento.

**Mastite subclínica e genética do SCC na Lacaune (Barillet et al. 2001, resumo)** ([DOI](https://doi.org/10.1186/1297-9686-33-4-397) [LIDO, resumo])
- Dois conjuntos: (i) 957 ovelhas de primeira lactação de um rebanho experimental do INRA, com duas linhas divergentes para produção de leite; (ii) 5.272 ovelhas de primeira lactação de 38 rebanhos, com modelo animal.
- No rebanho experimental: descarte por mastite clínica (5%) foi menor que o de mastite subclínica "predicted from SCC" (10%). A mastite subclínica predita se associou desfavoravelmente ao nível de leite. Isso não foi visto para a clínica.
- Herdabilidade do SCC: 0,15 na média de lactação; de 0,04 a 0,12 do primeiro ao quinto teste-dia.
- Correlação genética SCC-leite: 0,15 na lactação; ao longo da lactação, de -0,48 (favorável) a 0,27 (antagonista).
- Conclusão do resumo: "selection for mastitis resistance could be limited in a first approach to selection against subclinical mastitis using SCC."

**Escore na avaliação nacional francesa (Larroque et al. 2011)** ([p. 9, 14, 16 e 21](https://docs.eaap.org/2011/S49_Larroque.pdf) [LIDO])
- LSCS (Lacaune): h² 0,13 e repetibilidade 0,31 (p. 14).
- Correlações genéticas do LSCS (Lacaune, figura p. 16): com MY 0,15; com P% 0,08; com F% 0,07; com profundidade do úbere -0,32.
- Amostragem parcial da lactação para composição e CCS, em partes 1 e 2, com média de 3 controles (p. 9). O CCS "not available in corsican".
- Efeitos fixos de LSCS: rebanho x ano x parição; idade ao parto; época de parição; intervalo parto-primeiro controle; duração do período seco (p. 21).

**Trechos de busca (não lidos)**
- Rupp et al. (2003): herdabilidade do escore na média de lactação perto de 0,13, parecida na primeira e na segunda parição (texto de busca).
- Rebanho de ovelhas Lacaune e East Friesian na Áustria (resumo de congresso, fonte não identificada): herdabilidade do SCS abaixo de 0,10.
- Ovelhas Valle del Belice (Itália), teste-dia com repetibilidade: h² de SCS de 0,14; correlações com produção de leite de 0,16 a 0,31 (fonte não identificada).

### Inferences
- O uso do escore como caráter de lactação, com amostragem de 2 a 6 medidas por vida, dá herdabilidade baixa. Isso combina com a queda de precisão descrita por Astruc et al. (2023) para gordura.
- A antagonia de SCC com leite no fim da lactação e a favorável no início (Barillet et al. 2001) sugere que a escolha de momento de amostragem influencia a interpretação genética. Não há valor de correção definido nas fontes lidas.
- Um limiar individual de mastite para ovelhas não pode ser fixado a partir das fontes lidas. O escore de SCS (classes da seção 5, acima) é a escala de referência.

### Gaps
- Limiar individual de SCC que define mastite subclínica em ovelhas (por exemplo, 1 milhão de células/mL, citado em literatura de ovinocultura) [NÃO VERIFICADO]. Não o encontrei em fonte lida.
- Herdabilidade de mastite clínica (binária) em ovelhas: não encontrei em fonte lida.
- Texto completo de Barillet et al. (2001) e de Rupp et al. (2003): a leitura dependeria do acesso ao texto integral pelo usuário (ver lista de artigos a obter).

---

## 6. Herdabilidades e correlações genéticas (ovinos)

### Takeaway
Os valores mais confiáveis de herdabilidade do leite e da composição em ovinos vêm da Lacaune francesa (Larroque et al. 2011, em slide) e da Lacaune francesa e grega (Vouraki et al. 2025, com erro padrão). Eles ficam entre 0,19 e 0,52, conforme caráter e país. Para SCS, a herdabilidade de lactação é de 0,13 a 0,15. Estimativas de outras raças são de resumos e trechos de busca e devem ser conferidas antes do uso.

### Cited Findings

| Raça / população | Caráter | h² | Repetibilidade ou c² | rg (com outro caráter) | Fonte | Situação |
|---|---|---|---|---|---|---|
| Lacaune, França (2011, avaliação nacional) | Leite (MY) | 0,30 | 0,50 | — | [Larroque 2011, p. 14](https://docs.eaap.org/2011/S49_Larroque.pdf) | LIDO |
| Lacaune, França | Proteína (PY) / Gordura (FY) | 0,30 / 0,30 | 0,50 / 0,50 | — | idem | LIDO |
| Lacaune, França | P% / F% | 0,45 / 0,35 | 0,70 / 0,60 | — | idem | LIDO |
| Lacaune, França | LSCS | 0,13 | 0,31 | com MY 0,15 | idem | LIDO |
| Lacaune, França (2019-2022, produção do período de ordenha) | Leite (kg) | 0,24 (0,05) | 0,41 (0,02) | — | [Vouraki et al. 2025, Tabela 3](https://doi.org/10.3390/vetsci12030194) | LIDO |
| Lacaune, França (2019-2022) | F% / P% | 0,34 (0,05) / 0,52 (0,02) | 0,40 / 0,52 | — | idem | LIDO |
| Lacaune, Grécia (2021-2022) | Leite / F% / P% | 0,19 (0,09) / 0,30 (0,13) / 0,19 (0,10) | — | GR-FR: 0,86 / 0,59 / 0,88 | idem | LIDO |
| Lacaune, França | Leite (MY), gordura (F%) | — | — | MY-F% ≈ -0,2; MY-P% ≈ -0,4; F%-P% 0,7; FY-MY 0,8; PY-MY 0,9 | [Larroque 2011, p. 16](https://docs.eaap.org/2011/S49_Larroque.pdf) | LIDO (lido em figura) |
| Lacaune, França (SCS, GSE 2001) | Escore de SCC, lactação | 0,15 | — | com MY 0,15 | [Barillet et al. 2001](https://doi.org/10.1186/1297-9686-33-4-397) | LIDO, resumo |
| Lacaune, França (SCS, teste-dia) | Escore de SCC, teste 1 a 5 | 0,04 a 0,12 | — | com MY: -0,48 a 0,27 | idem | LIDO, resumo |
| White Maritza, Bulgária | Leite, teste-dia (REP1) | 0,355 ± 0,060 | 0,384 | — | [Zhelyazkova et al. 2023, Tabela 6](https://doi.org/10.5194/aab-66-253-2023) | LIDO |
| White Maritza, Bulgária | Leite, teste-dia (ASRM3) | 0,528 no início a 0,190 no fim | — | — | idem, Figura 2 | LIDO (lido no texto) |
| Assaf espanhol (Assaf.E) | Leite padronizado a 180 dias (MY180) | 0,131 a 0,177 | c² teste-dia 0,27 a 0,28 | — | [Gutiérrez et al. 2007](https://doi.org/10.1016/j.smallrumres.2006.03.009) | SNIPPET |
| Sarda, Itália | Leite | ≈ 0,30 | — | — | [SNIPPET, sem fonte verificada] | NÃO VERIFICADO |
| Sarda, Itália | Gordura / proteína | ≈ 0,48 / ≈ 0,55 | — | — | idem | NÃO VERIFICADO |
| Churra, Espanha (2002, médias de lactação) | Leite / P% / caseína / LILCY / CCS | 0,26 / 0,31 / 0,30 / 0,09 / 0,11 | — | — | [SNIPPET, sem fonte verificada] | NÃO VERIFICADO |
| Latxa, Espanha | Úbere, CCS e leite | não extraído | — | — | [Legarra & Ugarte 2005](https://doi.org/10.3168/jds.s0022-0302(05)72899-x) | Só metadados |
| Churra da Terra Quente, Portugal | Leite (regressão aleatória) | pico ≈ 0,34 por volta do dia 60 | — | — | [SNIPPET](https://bibliotecadigital.ipb.pt/handle/10198/11303) | SNIPPET |

Outras estimativas citadas em Zhelyazkova et al. (2023) e não lidas nas fontes originais: Komprej et al. (2011), h² de 0,10 a 0,23 por mês de lactação (Bovec e Pramenka da Ístria); Oravcová & Peskovicová (2008), h² de 0,19 (Tsigai), 0,10 (Valachian melhorado) e 0,15 (Lacaune), por teste-dia; Jawasreh & Khasawneh (2007), h² de 0,26 a 0,27 (Awassi).

### Inferences
- A diferença de herdabilidade do leite entre a França de 2011 (0,30) e a França de 2019-2022 (0,24) pode vir de mudança de dados (produção de ordenha em vez de lactação), de modelo (teste-dia ou lactação) e de amostragem. As fontes não permitem separar esses fatores.
- A herdabilidade da proteína é a mais alta nas duas fontes francesas (0,45 e 0,52 de composição). Isso é coerente com o padrão de composição de ovelha, de 50 a 55 g/L, com menor variação ambiental relativa do que a da quantidade.
- Fora da França, as herdabilidades de leite das raças espanholas e búlgaras estão no mesmo intervalo (0,13 a 0,36). Para comparar com bovinos, o intervalo de ovinos parece menor, mas não há base para afirmar isso com as fontes lidas.

### Gaps
- Herdabilidade de leite da Latxa e da Churra em fonte lida: não encontrei.
- Correlação genética entre caracteres de produção e de SCS em raças espanholas e italianas: só há trechos de busca.
- Sarda: não há fonte verificada de herdabilidade para leite, gordura e proteína.

---

## 7. Brasil: leite de ovelhas e avaliação genética

### Takeaway
A literatura brasileira sobre ovelhas leiteiras é de produção e composição, com pequenas amostras, em pasto ou confinamento, e com raças mistas (Santa Inês, Lacaune e East Friesian). Não encontrei estudo brasileiro publicado de avaliação genética ou de controle leiteiro oficial de ovinos. O programa de caprinos (Capragene, Embrapa) é o mais próximo de um modelo institucional; não cobre ovinos.

### Cited Findings

**Persistência de lactação em East Friesian e Lacaune (Ticiani et al. 2013)** ([DOI](https://doi.org/10.1590/s0103-84782013000900018), resumo via Crossref [LIDO, resumo])
- Objetivo: avaliar persistência de lactação e composição do leite em ovelhas East Friesian e Lacaune.
- Animais: 21 East Friesian e 46 Lacaune, com 44 ± 7,2 dias em lactação no início. Pasto de Panicum maximum cv. Aruana, em pastejo rotacionado.
- Produção medida a cada 4 dias ao longo de 92 dias. Amostras de leite aos dias 17, 25, 50, 75 e 92.
- Equações do resumo: East Friesian, PL = 1,42 - 0,02 x DEL (r² = 0,20); Lacaune, PL = 2,03 - 0,08 x DEL (r² = 0,22).
- Resultado: no início, a produção das Lacaune foi 30% maior. As Lacaune tiveram menor persistência, maior produção de leite (1,67 contra 1,35 kg/dia, P < 0,001) e de gordura (114,80 contra 102,85 g/dia, P < 0,001). O resumo é truncado antes do resultado de proteína.

**Produção e composição de Santa Inês e cruzas com Lacaune (Ferreira et al. 2011)** ([DOI](https://doi.org/10.1590/s0102-09352011000200040) [SNIPPET, só metadados])
- Título: "Produção e composição do leite de ovelhas Santa Inês e mestiças Lacaune e Santa Inês e desenvolvimento de seus cordeiros". Arquivo Brasileiro de Medicina Veterinária e Zootecnia. Conteúdo não lido.

**Queijo de Lacaune (Fava et al. 2014, Ciência Rural)** ([DOI](https://doi.org/10.1590/s0103-84782014000500028) [SNIPPET, só metadados])
- Título: rendimento de coalhada de leite fresco, resfriado e congelado de ovelhas Lacaune. Conteúdo não lido.

**Introdução de Lacaune no Brasil** (trecho de busca de documento Embrapa; fonte não aberta) [SNIPPET]
- Em 1984, houve pequena importação de material genético de Lacaune para Minas Gerais, sem expansão da atividade. Não verifiquei o documento original.

**Programa de caprinos como referência (Capragene, Embrapa Caprinos e Ovinos)** [SNIPPET, notícia de busca]
- Programa de melhoramento de caprinos leiteiros com controle leiteiro próprio, e primeiro teste de progênie de reprodutores caprinos em 2005. Objetivo de estimar a estrutura genética das raças e de criar um arquivo zootécnico nacional de caprinos leiteiros. É caprino, não ovino.

**Teses e dissertações (metadados Crossref)**
- Santa Inês em lactação com óleo de canola ou soja, e produção de leite de ovelhas Santa Inês e F1 com Lacaune (USP, ESALQ/FMVZ). Só títulos e DOIs de teses. Não lidas.

### Inferences
- A pesquisa brasileira sobre ovelhas leiteiras usa rebanhos pequenos e não cria dados de rebanho para avaliação genética. O resultado mais útil para um modelo é o de Ticiani et al. (2013): mostra que a curva de lactação em pasto tem perda rápida de produção e que a Lacaune produz mais, com menor persistência.
- Com o tamanho típico de rebanho brasileiro, o modelo de rebanho x ano x parição (França) ou de rebanho x ano x dia de teste (Bulgária) não se sustenta sem conectividade entre rebanhos. A recomendação de Vouraki et al. (2025) sobre conectividade vale aqui.

### Gaps
- Nenhum estudo brasileiro de herdabilidade de leite de ovelhas foi lido em texto completo.
- Não consultei Embrapa Alice ou Infoteca além de trechos de busca. Não consultei Revista Brasileira de Zootecnia nem Pesquisa Agropecuária Brasileira na SciELO, porque o SciELO respondeu HTTP 403 para robôs.
- Não encontrei controle leiteiro oficial de ovinos no Brasil nas fontes acessíveis.

---

## 8. Inferências para a central de melhoramento (SeabraApp)

1. **Campos mínimos do controle.** Para usar qualquer modelo acima, cada ovelha precisa de: data do parto, data do desmame (real ou calculada), data da secagem, número de cordeiros, parição, data do primeiro controle e modo de ordenha (uma ou duas vezes ao dia). São os efeitos fixos das fontes lidas.
2. **Escolha da lactação de referência.** Declarar o critério é obrigatório pelo ICAR. Recomendo registrar os três números em paralelo: produção da ordenha exclusiva (TMM), total da lactação (TMY pelo Fleischmann) e produção padronizada (por exemplo, 130 dias, como na NZ, ou 180 dias, como no Assaf), mais o número de controles usados.
3. **Método de controle.** AT e AC são o padrão europeu. Um rebanho brasileiro que controle uma vez por dia em AT precisa de conferência de viés do tanque (AC), porque o ICAR tem regra própria para essa correção.
4. **Células somáticas.** Usar o escore de SCS como nas classes de Heddi et al. (2026). Não usar o limiar de mastite sem fonte: não há um validado nas fontes lidas.
5. **Pequenos rebanhos.** A conectividade (pais e avós em comum) é o limite de qualquer avaliação entre rebanhos. Antes de propor um índice intra-rebanho, verificar a conectividade.
6. **Fórmulas com conflito.** Ver seção 9 antes de publicar qualquer fórmula de AIC/BIC ou de correção de acurácia.

---

## 9. Conflitos e erros encontrados nas fontes

1. **Quantidade mínima de leite testada no ICAR.** O mesmo wiki traz 200 g ou ml no texto de frequência e 150 g ou ml no Anexo 1 ([ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)). Não sei qual é a versão vigente. Conferir no documento oficial.
2. **Correlação genética GR-FR da gordura.** 0,59 (0,21) no artigo de 2025 ([Vouraki et al. 2025, Tabela 3](https://doi.org/10.3390/vetsci12030194)) e 0,57 (0,21) no slide de 2024 ([Vouraki et al. 2024](https://docs.eaap.org/2024/m221/S02T11.pdf)). A versão final do artigo é a que vale.
3. **Erro padrão da correlação de proteína.** 0,12 no artigo e 0,13 no slide. Diferença pequena, sem efeito prático.
4. **Repetibilidade de REP1 em Zhelyazkova et al. (2023).** Erro padrão de 0,065 no resumo e 0,045 na Tabela 6. A repetibilidade de REP3 é 0,378 no resumo e 0,379 na tabela.
5. **Fórmulas de AIC e BIC.** A fonte de Guevara et al. (2025) imprime AIC = n x LL + 2p e BIC = n x LL + p x log(n), com LL = log do MSPE. Essa forma difere da convencional (-2 log-verossimilhança + 2p). Não usar sem conferência.
6. **Fórmula de Zhelyazkova et al. (2023), equação 9.** O texto impresso tem uma forma pouco legível. Conferir no PDF antes de citar.
7. **Escore de células somáticas.** Marshall et al. (2023) usam SCS = log2(SCC). Heddi et al. (2026) usam SCS = log2(SCC/10^5) + 3. O primeiro não tem o ajuste de escala, por isso os números não são comparáveis sem conversão.
8. **Constante k em Granado-Tajada & Ugarte (2018).** O slide escreve k = (4 - h²)/h² e atribui a Mäntysaari et al. (2010), em contexto de validação. A verificação do relatório de bovinos leiteiros (`research_notes/Verificação de fontes/verificacao_leite.md`) afirma que a forma de desregressão é (4 - 2h²)/h². São contextos diferentes e não verifiquei Mäntysaari et al. (2010) [NÃO VERIFICADO].
9. **Pesos da seleção francesa (ISOL).** Astruc et al. (2016) falam de 50% para caracteres funcionais desde 2005. O texto não traz os pesos individuais do índice. Não reproduzir como fórmula.
10. **Herdabilidade do leite na França.** 0,30 (Larroque et al. 2011, slide) e 0,24 (Vouraki et al. 2025). Dados e modelos diferentes; não tratar como mudança genética.

---

## 10. Lacunas consolidadas

1. **Matriz do modelo.** Nenhuma fonte lida escreve o modelo de ovinos leiteiros em notação matricial y = Xb + Zu + e. A única expressão matricial é a variância z'Gz e z'Pz em Zhelyazkova et al. (2023, equações 5 e 6). A forma padrão acima é inferência minha.
2. **Padrão de lactação de Latxa, Churra e Manech.** Não confirmado em fonte lida.
3. **Limiar de mastite em ovelhas.** Não há fonte aberta lida com valor validado.
4. **Herdabilidade e correlação de leite e gordura para Sarda, Churra e Latxa.** Só trechos de busca.
5. **Correlações genéticas entre lactações.** Não encontradas em fonte lida.
6. **Avaliação oficial espanhola e italiana.** Documentos do MAPA e da AIA não lidos por erro de certificado TLS, que não foi contornado. Os documentos do IDELE recebidos pelo outro processo da pasta eram HTML de bloqueio.
7. **Texto completo de Barillet et al. (2001), Rupp et al. (2003), Gutiérrez et al. (2007), Ruiz et al. (2000), Legarra & Ugarte (2005), Bittante et al. (2017), Ticiani et al. (2013) e Ferreira et al. (2011).** Ver lista de artigos a obter.
8. **Brasil.** Nenhuma avaliação genética de ovinos leiteiros encontrada.
9. **Forma das equações (3) e (11)** em Vouraki et al. (2025) e Zhelyazkova et al. (2023), respectivamente, ilegíveis na extração. Conferir no PDF.

---

## Registro de fontes com DOI verificado no Crossref

| Referência | DOI | Verificação |
|---|---|---|
| Barillet F., Rupp R., Mignon-Grasteau S., Astruc J.M. (2001). Genetic analysis for mastitis resistance and milk somatic cell score in French Lacaune dairy sheep. *Genet. Sel. Evol.* 33:397 | [10.1186/1297-9686-33-4-397](https://doi.org/10.1186/1297-9686-33-4-397) | Crossref (título, autores, volume). Resumo lido em Europe PMC (PMC2705413) |
| Vouraki S., Astruc J.M., Lagriffoul G., Rupp R., Banos G., Arsenos G., Ciotola F. (2025). Genotype-by-environment interactions and response to selection for milk production traits in Lacaune sheep from Greece and France. *Vet. Sci.* 12:194 | [10.3390/vetsci12030194](https://doi.org/10.3390/vetsci12030194) | Texto completo (PMC11946213) |
| Zhelyazkova P., Dimov D., Andonov S. (2023). Genetic-parameter estimation of milk yield in White Maritza sheep breed using different test day models. *Arch. Anim. Breed.* 66:253 | [10.5194/aab-66-253-2023](https://doi.org/10.5194/aab-66-253-2023) | Texto completo (PMC10654608) |
| Marshall A.C., Lopez-Villalobos N., Loveday S.M., Ellis A., McNabb W. (2023). Modelling lactation curves for dairy sheep in a New Zealand flock. *Animals* 13:349 | [10.3390/ani13030349](https://doi.org/10.3390/ani13030349) | Texto completo (PMC9913856) |
| Guevara L., Lopez-Villalobos N., Pollott G.E., Albarrán-Portillo B., Fernandes A.M., Salinas-Martínez J.A., Angeles-Hernandez J.C. (2025). Evaluation of empirical and mechanistic models and sampling intervals to model the lactation curves of F1 dairy sheep. *Trop. Anim. Health Prod.* | [10.1007/s11250-025-04365-z](https://doi.org/10.1007/s11250-025-04365-z) | Texto completo (PMC11906548) |
| Kuchtík J., Kalhotka L., Šustová K., Kopec T. (2025). The evaluation of somatic cell count, microbiological quality and basic composition of sheep milk. *Arch. Anim. Breed.* 68:691 | [10.5194/aab-68-691-2025](https://doi.org/10.5194/aab-68-691-2025) | Texto completo (PMC13524230) |
| Heddi I., Caballero-Villalobos J., Amalfitano N., Martínez F., Cantarero-Aparicio M.Á., Cecchinato A., Ramón M., Garzón A., Arias R., Moatsou G. (2026). Effect of somatic cell count on milk production... Manchega dairy sheep. *Foods* 15:1527 | [10.3390/foods15091527](https://doi.org/10.3390/foods15091527) | Texto completo (PMC13164286) |
| Astruc J.M., Baloche G., Buisson D. et al. (2016). La sélection génomique des ovins laitiers en France. *INRA Prod. Anim.* 29(1):41-56 | [10.20870/productions-animales.2016.29.1.2515](https://doi.org/10.20870/productions-animales.2016.29.1.2515) | Texto completo do PDF aberto (productions-animales.org/article/download/2515/7657). Autores parciais conferidos no Crossref |
| Ticiani R.? Sandri, Souza, Batistel, Oliveira (2013). Persistência da lactação e composição do leite em ovelhas leiteiras das raças Lacaune e East Friesian. *Ciência Rural* 43(9):1650-1653 | [10.1590/s0103-84782013000900018](https://doi.org/10.1590/s0103-84782013000900018) | Crossref (título, autores, abstract). Resumo lido |
| Ruiz F.A., Oregui L.M., Herrero M. (2000). Comparison of models for describing the lactation curve of Latxa sheep and an analysis of factors affecting milk yield. *J. Dairy Sci.* 83:2709-2719 | [10.3168/jds.s0022-0302(00)75165-4](https://doi.org/10.3168/jds.s0022-0302(00)75165-4) | Crossref (metadados). Resumo via trecho de busca |
| Gutiérrez J.P., Legaz E., Goyache F. (2007). Genetic parameters affecting 180-days standardised milk yield, test-day milk yield and lactation length in Spanish Assaf (Assaf.E) dairy sheep. *Small Rumin. Res.* 70:233-238 | [10.1016/j.smallrumres.2006.03.009](https://doi.org/10.1016/j.smallrumres.2006.03.009) | Crossref (título, metadados). Resultados via trecho |
| Legarra A., Ugarte E. (2005). Genetic parameters of udder traits, somatic cell score, and milk yield in Latxa sheep. *J. Dairy Sci.* | [10.3168/jds.s0022-0302(05)72899-x](https://doi.org/10.3168/jds.s0022-0302(05)72899-x) | Crossref (metadados) |
| Bittante G., Cipolat-Gotet C., Pazzola M. (2017). Genetic analysis of coagulation properties, curd firming modeling, milk yield, composition, and acidity in Sarda dairy sheep. *J. Dairy Sci.* | [10.3168/jds.2016-11212](https://doi.org/10.3168/jds.2016-11212) | Crossref (metadados). Resultados via trecho |
| Carta A., Sanna S., Rosati A. (1996). Milk yield adjustments for milking length and age-parity-month of lambing interaction in the Sarda dairy sheep breed. *Performance Recording of Animals* | [10.1163/9789004684249_052](https://doi.org/10.1163/9789004684249_052) | Crossref (título) |
| Rupp R. et al. (2003). Genetic parameters for milk somatic cell scores and relationships with production traits in French Lacaune dairy sheep. *J. Dairy Sci.* | [10.3168/jds.s0022-0302(03)73732-1](https://doi.org/10.3168/jds.s0022-0302(03)73732-1) | Crossref (título, ano). Conteúdo por trecho de busca |
| Ferreira et al. (2011). Produção e composição do leite de ovelhas Santa Inês e mestiças Lacaune... *Arq. Bras. Med. Vet. Zootec.* | [10.1590/s0102-09352011000200040](https://doi.org/10.1590/s0102-09352011000200040) | Crossref (título). Não lido |
| Fava et al. (2014). Rendimento de coalhada obtida a partir de leite fresco, resfriado e congelado de ovelhas da raça Lacaune... *Ciência Rural* | [10.1590/s0103-84782014000500028](https://doi.org/10.1590/s0103-84782014000500028) | Crossref (título). Não lido |

Outras referências com DOI verificado no Crossref e não lidas (leads): Gutiérrez? não; Lacaune e fertilidade (Carta? autoria a confirmar), [10.3168/jds.2008-1113](https://doi.org/10.3168/jds.2008-1113); MIR em Lacaune francesa, [10.3168/jds.2024-25127](https://doi.org/10.3168/jds.2024-25127); persistência em Boutsico, [10.5713/ajas.2002.315](https://doi.org/10.5713/ajas.2002.315).

## Artigos pagos ou sem texto aberto para obter pelo acesso institucional

| Referência | DOI | Por que importa |
|---|---|---|
| Rupp et al. (2003), J. Dairy Sci. | [10.3168/jds.s0022-0302(03)73732-1](https://doi.org/10.3168/jds.s0022-0302(03)73732-1) | Parâmetros genéticos do SCS em Lacaune, com 1ª e 2ª lactação. Base para a seção 5 e a seção 4.7 |
| Gutiérrez et al. (2007), Small Rumin. Res. | [10.1016/j.smallrumres.2006.03.009](https://doi.org/10.1016/j.smallrumres.2006.03.009) | Assaf espanhol, MY180 e teste-dia. Único padrão de 180 dias com dados |
| Ruiz et al. (2000), J. Dairy Sci. | [10.3168/jds.s0022-0302(00)75165-4](https://doi.org/10.3168/jds.s0022-0302(00)75165-4) | Curvas de lactação do Latxa e fatores, com 14.699 controles |
| Legarra & Ugarte (2005), J. Dairy Sci. | [10.3168/jds.s0022-0302(05)72899-x](https://doi.org/10.3168/jds.s0022-0302(05)72899-x) | Latxa: parâmetros de úbere, SCS e leite |
| Bittante et al. (2017), J. Dairy Sci. | [10.3168/jds.2016-11212](https://doi.org/10.3168/jds.2016-11212) | Sarda: coagulação e leite, 1.121 ovelhas |
| Carta et al. (1996), Performance Recording of Animals | [10.1163/9789004684249_052](https://doi.org/10.1163/9789004684249_052) | Sarda: ajuste de comprimento de ordenha |

Abertos mas não obtidos nesta sessão (para o usuário conferir): Barillet et al. (2001), GSE, [10.1186/1297-9686-33-4-397](https://doi.org/10.1186/1297-9686-33-4-397) (open access; o site bloqueou a leitura por robô); Ticiani et al. (2013), Ciência Rural, [10.1590/s0103-84782013000900018](https://doi.org/10.1590/s0103-84782013000900018) (open access; o SciELO bloqueou a leitura por robô).

---

*Fim do arquivo. Fontes e URLs de cada arquivo baixado: `fontes/ovinos/fontes.txt`.*
