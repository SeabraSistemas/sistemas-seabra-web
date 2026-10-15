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

