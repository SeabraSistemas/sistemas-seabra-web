# Modelos de produção de leite em caprinos leiteiros: registro, padronização e avaliação genética

Escopo: notas específicas de caprinos (registro de leite, padronização de lactação, curva de lactação, modelos de avaliação genética, células somáticas, herdabilidades e correlações, Brasil e programas internacionais). Não repete a teoria geral de modelo animal, MME e regressão aleatória já coberta no relatório de bovinos leiteiros.

## Estado da verificação (leia antes de usar)

| Fonte | Acesso nesta sessão | Situação |
|---|---|---|
| Arnal et al. 2019, Genet Sel Evol ([doi](https://doi.org/10.1186/s12711-019-0485-3)) | Texto completo via Europe PMC (PMC6693143) | Lido: dados, métodos, equações, resultados e conclusões |
| Valencia-Posadas et al. 2022, Anim Biosci ([doi](https://doi.org/10.5713/ab.21.0143)) | Texto completo via PMC (PMC8902223) | Lido: dados, modelo (descrição), resultados |
| Lôbo & Silva 2005, Ciência Agronômica 36(1):104-110 | PDF Embrapa Alice | Lido: resumo, material e métodos, resultados e discussão (parcial) |
| Embrapa Caprinos e Ovinos 2015, "Avaliação de modelos..." | PDF Embrapa Alice | Apenas o resumo foi examinado; corpo do texto não lido |
| ICAR Seção 16 "Dairy Sheep and Goats" ([wiki](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)) | Página wiki (oldid=5107) | Lido: parte de cabras (registro e métodos); anexos são de ovinos |
| Astruc et al. 2022, ICAR ([PDF](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)) | Apresentação em texto extraído | Lido; tabelas de métodos e de lactação com layout ambíguo |
| Arnal et al. 2020 e 2023, JDS | Só metadados (Crossref) e snippets de busca | Não lidos; HAL bloqueou o acesso por verificação anti-bot |
| Rupp et al. 2011, JDS | Metadados (Crossref) | Não lido |
| Menéndez-Buxadera et al. 2010, JDS | Metadados (Crossref) e resumo via busca | Não lido na íntegra |
| Barillet 2007, Small Ruminant Research | Metadados (Crossref) | Não lido |
| UFC 2014, dissertação sobre curva de lactação em Saanen | PDF não baixado (conexão reinicializada) | Apenas snippet |
| SciELO ABMVZ, artigo SrPbYHkZNHJjFg8yYRJg5Wh | HTTP 403 | Identificado, não lido |
| ICAR Goat 2015 (old.icar.org/.../Goat.pdf) | Erro de certificado (nome não confere) | Não lido |
| USDA AIPL e ADGA (produção e avaliação) | Snippets de busca | Não lidos integralmente |
| NSG (Noruega), catálogos de sêmen | Snippets de busca; PDFs com extração ruim | Não lidos integralmente |
| AssoNaPa (Itália) | Sem fonte primária lida | Não verificado |
| OpenAlex | HTTP 429 persistente em duas tentativas | Não usado; DOIs e títulos verificados via Crossref |

Convenções: "[não verificado]" marca afirmações sem fonte lida nesta sessão. Os "snippets" são trechos de resultados de busca, não o texto do artigo. As equações transcritas vieram de texto extraído de XML/PDF, onde subscritos e símbolos ficam achatados. Antes de citar uma equação literalmente, confira no PDF original.

---

## 1. Registro de leite em caprinos e padronização da lactação

### Takeaway
A Seção 16 do ICAR não fixa um comprimento de lactação padrão para cabras. Recomenda que a organização aprovada defina, por raça e categoria, uma produção de referência, e que o comprimento padrão escolhido seja declarado na publicação. Os países divergem muito (TMY, TMM, TSMM; referências entre 150 e 274 dias, conforme país e raça), o que o próprio ICAR aponta como obstáculo à comparação entre países. Na França, a avaliação usa registros de teste-dia entre 7 e 270 dias em leite, com lactações de 180 a 350 dias. Nos EUA, o ADGA/USDA considera apenas os primeiros 305 dias.

### Cited Findings

**Regras gerais do ICAR (cabras)**
- Padrão de lactação: "it is impossible to define a standard lactation length or a standard milking length (of the milking-only period): we therefore recommend that the approved organisation define, for each breed and category of goats (age or lactation number), a reference production per lactation or a reference production for the milking-only period, according to the breeding system. The chosen standard length (in days) must be declared in the publication of the results." — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Ordenha durante a fase de amamentação: a produção de cabras amamentando, ou amamentadas e parcialmente ordenhadas, "must not be included". Só entram registros feitos quando a cabra está "definitively separated from its kid(s)", ou seja, quando é ordenhada exclusivamente. — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Todas as cabras ordenhadas no dia do controle devem ser controladas. — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Número mínimo de controles mensais válidos por cabra: "is not set"; deve ser descrito para cada raça e categoria (primeira lactação, segunda e mais). — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Interrupção do cálculo: "If the interval between two tests (i) and (i+1) is greater [limite não extraído], the lactation calculation for the goat being tested (i) is stopped." — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Primeiro controle do rebanho: "takes place 4 to 15 days after the beginning of mechanical/by hand milking only in the flock." — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Método D: "simplified non-official recording based on 2 to 4 recordings per flock and per year in the aim to get 2 to 3 test-days per goat in the middle of the lactation"; "method D does not meet the requirements for the ICAR Certificate of Quality." — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Método E: método oficial flexível, aplicado quando o objetivo é manter registros de um subconjunto de animais ("only designated goats or designated lactations are recorded"). A definição completa não foi extraída. — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)
- Dados brutos publicados sem ajuste por fatores de variação ("raw milk results should be provided with no adjustment for factors of variations"). — [ICAR Seção 16](https://wiki.icar.org/index.php/Dairy_Sheep_and_Goats)

**Cobertura e métodos por país (apresentação ICAR 2022)**
- Em 2020-2021, "877,896 sheep & 457,324 goats" estavam em controle leiteiro oficial nos países ICAR; "86% and 88% (respectively in sheep and goats) in 3 countries (France, Spain and Italy)". Cobertura: "8.5% of sheep and 9.6% of goats are recorded". — [Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)
- Registro qualitativo: "Qualitative recording is globally generalised in goats". — [Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)
- Métodos de caprinos (leitura do slide 8; o layout da tabela é ambíguo e deve ser confirmado): Itália "AT"; França "A4, AY, AZ, CY, CZ" (com o método B usado em rebanhos comerciais); Espanha "A4 - AT - AC"; Portugal "A4 (most) - AT"; Eslovênia "AT"; Croácia "AT (most) - A4"; Sérvia "AT"; República Tcheca "AC - E"; Eslováquia "AC"; Letônia "A4". — [Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)
- Cálculo da lactação (slide 11): "TMY = Total Milk Yield", "TMM = Total Milked Milk", "TSMM = Total Suckled + Milked Milk". Exemplos para caprinos: Eslováquia TMM, referência TMM (240); França TMY; Espanha TMM, TMY e TSMM com referências variadas (TMM (150), TMM (254), TMY (210), TMY (274), TSMM (210)). O slide afirma "Great variety of computation in Spain according to the breed" e "Comparisons of yield from different countries / breeds very difficult". Referência francesa para caprinos não legível. — [Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)

**França (dados de Arnal et al. 2019)**
- Registros: "193,226 milk TD records from 30,186 first-lactation Saanen goats (234 herds) and 205,841 milk TD records from 32,256 first-lactation Alpine goats (198 herds) from northwestern France, collected between 1995 and 2015." Pedigree: 66,716 (Saanen) e 67,159 (Alpine). — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Critérios: "Each lactation included at least four TD between the 7th and 270th day in milk (DIM). Lactation had to last between 180 and 350 days." Ordenha duas vezes ao dia, com produção diária somada. Mais de quatro animais por combinação rebanho × data de controle. Pais com pelo menos 20 progênies (379 e 324 reprodutores nas raças Alpine e Saanen). Mães conhecidas. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Frequência: "TD recording (on average every 28 or 35 days)". — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Comparação com lactação de 250 dias: o modelo de regressão aleatória foi comparado com "a lactation model with total milk yield calculated over 250 days". — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Snippet, não lido: uma apresentação Idele ao ICAR listaria 250 dias como período de referência, e lactações acima de 450 dias seriam frequentes em uma parte das primeiras lactações. Fonte exata não confirmada. — [Piacere, apresentação ICAR (old.icar.org)](https://old.icar.org/wp-content/uploads/2015/09/5-Agnes-Piacere.pdf) [não verificado]

**EUA (snippets do USDA/ADGA; não lidos integralmente)**
- Apenas os primeiros 305 dias da lactação são considerados; registros mais curtos são projetados para 305 dias. Registros finalizados precisam de pelo menos 15 DEL; registros em andamento, de pelo menos 40 DEL. — [ADGA, Production testing](https://adga.org/performance-programs/production-testing/); [USDA AIPL, goat fact sheet](https://aipl.arsusda.gov/reference/goat/goatsfs.html)
- Ajuste por idade e época de parto, padronizando para cabras de 3 anos que parem de dezembro a março. — [USDA AIPL, goat fact sheet](https://aipl.arsusda.gov/reference/goat/goatsfs.html)
- Exclusões frequentes: sem reprodutor registrado; mais de um rebanho na lactação; registro em andamento com menos de 40 DEL. — [ADGA, Production testing](https://adga.org/performance-programs/production-testing/)

**Brasil**
- Avaliação de PL305 e duração da lactação (DL) em Saanen (Embrapa, 2015): "produção de leite até 305 dias (PL305) e duração da lactação (DL)". — [Embrapa 2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)
- Estudo Embrapa anterior (Lôbo & Silva 2005) usou produção total de leite (PL), sem padronização de 305 dias. — [Lôbo & Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)

### Inferences
- Como cada organização define sua própria referência, cabras do mesmo animal podem ter valores de referência diferentes entre países. Qualquer exemplo trabalhado deve declarar explicitamente a regra (TMY, TMM ou TSMM e o comprimento). — [inferência a partir de ICAR 2022 e ICAR Seção 16]
- As regras de inclusão (França: 180 a 350 dias; ADGA: mínimo de 15 ou 40 DEL) truncam a distribuição dos comprimentos de lactação. Isso afeta o que se mede como "lactação prolongada". [inferência, não testada]

### Gaps
- Definições operacionais de A4, AT, AC, AY, AZ, CY, CZ e B. A sigla "AT4" citada no enunciado não aparece nas fontes lidas. Obter a Seção 16 completa (definições de métodos e de TMY, TMM, TSMM).
- Limiar de intervalo entre controles no ICAR (texto truncado) e a definição de TSMM, TMM e TMY para caprinos.
- Comprimento padrão oficial francês para cabras: só há snippet (250 dias) e não há documento oficial lido.
- Tratamento oficial de lactações acima de 350 dias em cada programa. França as exclui pela regra de Arnal et al. 2019. Os demais [não verificado].
- Método de controle usado no Capragene e regra de cálculo da PL305 brasileira: não encontrados nas fontes lidas.

---

## 2. Curvas de lactação em caprinos

### Takeaway
As fontes encontradas (todas lidas só por snippet) usam a função de Wood como ajuste padrão. O pico ocorre tipicamente entre a 2ª e a 8ª semana pós-parto, conforme grupo genético e ordem de parto. Multíparas produzem mais. A época de parto afeta a velocidade de subida, o declínio e a persistência. Nenhuma fonte lida mede fotoperíodo diretamente, então o efeito fotoperiódico não foi isolado. Não há equação de Wood extraída de fonte lida nesta sessão.

### Cited Findings

- Equação de Wood: não extraída de fonte lida. A forma usual é y = a t^b e^(-ct), citada à origem em Wood (1967, Nature) [não verificado nesta sessão].
- Cabras Damascus na Jordânia: no ajuste de Wood, pico por volta da semana 4, com cerca de 1,29 kg. Fonte exata não identificada no resultado de busca. [não verificado]
- Cabras Alpine no Quênia (sistemas de pequenos produtores): o pico variou de cerca de 2 a 8 semanas conforme o grupo genético; a paridade afetou a taxa de subida ao pico, a taxa de declínio e a persistência; o mês de parto afetou a subida ao pico e a persistência (paráfrase do resultado de busca, não citação direta). — [Characteristics of lactation curves of the Kenya Alpine dairy goats in smallholder farms](https://ir.jooust.ac.ke/items/095c413c-f322-441a-bf48-8a34678bf171) (snippet)
- Estudo tropical semi-intensivo (Costa Rica): paridade significativa para produção de leite; multíparas produziram mais. Diferenças sazonais atribuídas em parte à qualidade da forragem na estação chuvosa. — [Genetic and environmental effects on production of dairy goats under semi-intensive tropical conditions](https://revistas.ucr.ac.cr/index.php/ragromeso/article/view/62) (snippet)
- Murciano-Granadina, partos de verão-outono: cerca de 14% mais leite que partos de inverno-primavera; pico mais cedo nos partos de verão; persistência melhor nos partos de outono. Fonte não identificada no resultado de busca. [não verificado]
- Tamanho de ninhada: pico com cerca de +0,3 kg por cabrito adicional, e cabras com um cabrito mais persistentes. Fonte não identificada. [não verificado]
- Persistência no modelo francês (Arnal et al. 2019): definida como "the cumulative deviation in genetic contribution to yield from the DIM 40 to DIM 240 relative to an average animal having the same yield at DIM 40". — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Fotoperíodo: nenhuma fonte lida mede dias de luz. Os estudos usam "season" ou "month of kidding", que confundem fotoperíodo com chuva, forragem e temperatura. — [Costa Rica](https://revistas.ucr.ac.cr/index.php/ragromeso/article/view/62) (snippet) e [Kenya](https://ir.jooust.ac.ke/items/095c413c-f322-441a-bf48-8a34678bf171) (snippet)

### Inferences
- A modelagem por regressão aleatória com DEL de 7 a 270 cobre a fase de pico e a persistência. Os picos de 2 a 8 semanas reportados por estudos de Wood estão dentro desse intervalo. [inferência]
- Efeitos de época e de manejo devem entrar como grupos contemporâneos ou efeitos fixos de época (mês ou estação de parto), não como fotoperíodo. [inferência]

### Gaps
- Equação de Wood e parâmetros típicos (a, b, c) em caprinos, a partir de fonte lida.
- Efeito do fotoperíodo ou da melatonina na produção leiteira de cabras. Requer busca dedicada.
- Efeito de tamanho de ninhada em modelos de avaliação genética: não encontrado (ver seção 3).

---

## 3. Modelos de avaliação genética

### Takeaway
- **França**: regressão aleatória por teste-dia (RRM) com polinômios de Legendre de ordem 4, para cabras Saanen e Alpine de primeira lactação (Arnal et al. 2019). Os resultados foram validados contra um modelo de lactação de 250 dias. Extensões: ssGBLUP em Saanen (Arnal et al. 2023) e RRM com SCS nas três primeiras lactações em Alpine (Arnal et al. 2020).
- **Espanha (Murciano-Granadina)**: comparação entre RRM e modelo de repetibilidade por teste-dia, em primeira e segunda lactação (Menéndez-Buxadera et al. 2010).
- **EUA**: avaliação de lactação de 305 dias com modelo animal desde 1987 (USDA, snippet).
- **Brasil**: modelos animais uni e bicaracterísticos com DFREML (Embrapa), e PL305 no Capragene.
- **Noruega**: NSG publica valores de criação por característica; o modelo não foi identificado.
- **Itália**: AssoNaPa fornece EBVs aos criadores; o modelo não foi identificado.

### Cited Findings

**3.1 França: Arnal, Larroque, Leclerc, Ducrocq (2019), Genet Sel Evol, [doi](https://doi.org/10.1186/s12711-019-0485-3)**

Modelo RRM (texto extraído do XML; a fonte o escreve em notação escalar, sem forma matricial). Os subscritos estão achatados e devem ser conferidos no PDF:

```
y_tijkldgn = HTD_ti + A_tjk + M_tjl
           + Σ_{r=1..6} θ_tkr N_{r,d} + Σ_{r=1..6} τ_tlr N_{r,d}
           + Σ_{s=1..4} γ_ts M_{s,g}
           + Σ_{o=0..q} a_tno φ_{o,d} + Σ_{o=0..q} p_tno φ_{o,d}
           + e_tijkldgn
```

Termos conforme a fonte:
- y: observação do traço t (produção de leite, gordura, proteína, teor de gordura, teor de proteína) no dia em leite d (7 a 270) da cabra n, que estava prenhe há g dias (g = 0 se não prenhe), no ano de produção j, na classe de idade ao parto k (7 classes em meses: 9-11, 12, 13, 14, 15, 16, 17 ou mais), na classe de período de parto l (8 classes: janeiro, fevereiro, março, abril-maio-junho, julho-agosto-setembro, outubro, novembro, dezembro) e na combinação rebanho × data de controle i.
- HTD_ti: efeito fixo de rebanho × data de controle.
- A_tjk: efeito fixo de ano × idade ao parto.
- M_tjl: efeito fixo de ano × período de parto.
- θ_tkr, τ_tlr e γ_ts: coeficientes fixos de regressão para idade ao parto, período de parto e estágio de gestação.
- N_{r,d}: covariáveis de spline cúbico natural para idade e período de parto, com seis nós em d = 7, 20, 50, 110, 190, 270.
- M_{s,g}: spline cúbico natural para a gestação, com quatro nós em d = 31, 53, 76, 100 (g entre 0 e 30 dias, coeficientes iguais a zero; efeito constante após g = 100).
- a_tno e p_tno: coeficientes aleatórios genéticos e de ambiente permanente, com polinômio de Legendre de ordem q. Var(a_to) ~ N(0, σ²_{a_to}) e Var(p_to) ~ N(0, σ²_{p_to}).
- φ_{o,d}: o-ésimo termo do polinômio de Legendre no dia d.
- e: resíduo normal, com variância residual heterogênea dentro de nove classes de DEL (7-36, 37-66, 67-96, 97-126, 127-156, 157-186, 187-216, 217-246, 247-270), sem correlação entre classes.

Redução de posto (rank reduction): a matriz de covariância genética e de ambiente permanente foi decomposta por autovalores, mantendo z = 2 ou 3 autofunções χ_{o,d}:

```
y = ... + Σ_{o=1..z} b_tno χ_{o,d} + Σ_{o=1..z} c_tno χ_{o,d} + e
```
Com b_tno ~ N(0, σ²_b) e c_tno ~ N(0, σ²_c). O sinal dos autovetores foi fixado para que o segundo seja negativo no início da lactação. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)

Modelo multitraço (MT) de comparação, com seis períodos: [7, 45], [46, 90], [91, 135], [136, 180], [181, 225], [226, 270]. Equação (truncada no texto extraído): `y_tijklnro = π_tir + δ_tjr + γ_tkr + HY_tlr + a_tnr + e_tijklnro`, com π para idade ao parto, δ para mês de parto, e os demais termos não descritos completamente. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)

Herdabilidades e correlações:
- Herdabilidade do dia de controle: diagonal de G_264 dividida pela diagonal de P_264, com P = G + W + resíduo. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Herdabilidade de toda a lactação: h²_wl = g_wl / p_wl, com g_wl calculado por um vetor-soma de 1s de comprimento 264. A forma quadrática exata não foi extraída. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Herdabilidade dos coeficientes de regressão: h_b, segundo Schaeffer. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Software: WOMBAT. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)

Resultados principais:
- "Models with fourth-order Legendre polynomials led to the best fit of the data." Redução para posto 2: "the first two principal components correctly summarized the genetic variability of milk yield level and persistency, with a correlation close to 0 between them." — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Conclusão: o modelo foi implantado na França para avaliar "yield traits and persistency, which are independent i.e. no genetic correlation between them, in first lactation." — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Herdabilidade de toda a lactação "close to 0.3 for milk yield in both breeds". Para teor de gordura na Alpine: 0,65 no modelo de lactação e 0,75 no RRM com Legendre de ordem 4. — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Tabela 2 (h_b por componente principal; atribuição de colunas inferida pela ordem, portanto [a confirmar no PDF]):
  - PC1 (nível): Saanen MY 0,28, FY 0,31, PY 0,29, teor gordura 0,50, teor proteína 0,56; Alpine 0,27, 0,24, 0,25, 0,54, 0,62.
  - PC2 (persistência): Saanen 0,13, 0,12, 0,11, 0,07, 0,18; Alpine 0,14, 0,10, 0,09, 0,10, 0,19.
  - — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)
- Validação: "Genetic parameters were consistent between models" (RRM, lactação de 250 dias e modelo MT). — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)

**3.2 Extensões francesas (metadados e snippets; não lidas)**
- Arnal, Larroque, Leclerc, Ducrocq (2020), JDS 103:4517-4531, [doi](https://doi.org/10.3168/jds.2019-17465): parâmetros genéticos de características de leite e de SCS nas três primeiras lactações de cabras Alpine, com RRM por teste-dia. O snippet cita "49,849 first lactation Alpine goats during their first 3 lactations". Número de animais versus registros é ambíguo. Valores não extraídos.
- Arnal, Robert-Granié, Ducrocq, Larroque (2023), JDS 106:4813-4824, [doi](https://doi.org/10.3168/jds.2022-22550): título "Validation of single-step genomic BLUP random regression test-day models and SNP effects analysis on milk yield in French Saanen goats". Snippet: dados de 2000 a 2017; o ssGBLUP com RRM melhora a correlação entre deviações das filhas e valores genéticos de machos candidatos; o RRM reduz valores genéticos inflados em relação ao modelo de lactação. Valores não extraídos.

**3.3 Espanha: Menéndez-Buxadera, Molina, Arrebola, Gil (2010), JDS 93:2718-2726, [doi](https://doi.org/10.3168/jds.2009-2571)**
- Título: "Random regression analysis of milk yield and milk composition in the first and second lactations of Murciano-Granadina goats". Resumo via busca: 49.696 registros mensais de MY, PY, FY e DMY de 5.163 cabras em 20 rebanhos (primeira e segunda lactação). — [Menéndez-Buxadera et al. 2010](https://doi.org/10.3168/jds.2009-2571)
- Comparação entre RRM e modelo de repetibilidade por teste-dia (RTDM): no meio da lactação, herdabilidades de MY, DMY e FY foram maiores com RTDM; PY foi maior com RRM. As herdabilidades de MY, FY e PY foram estáveis ao longo da lactação, enquanto a de DMY diminuiu. — [Menéndez-Buxadera et al. 2010](https://doi.org/10.3168/jds.2009-2571) (resumo via busca)
- Programa oficial espanhol: capítulo de livro sobre a raça Murciano-Granadina, com objetivos de seleção e a última avaliação genética. Autoria e data não identificadas. [não verificado]
- ICAR 2022: Murciano-Granadina e Malagueña são registradas em dois países. — [Astruc et al. 2022](https://www.hapih.hr/cs/aplikacije/vrednovanje/web/goat/pub/IC_2022_Astruc_et_al_ppt.pdf)
- Murciano-Granadina fora da Espanha (snippets): [Mokhtari et al. 2025](https://doi.org/10.1007/s11250-025-04575-5), RRM para leite, gordura e proteína; identificado e não lido, local do estudo não confirmado. Também um estudo de Kerman (Irã) usou RRM com polinômios de Legendre para SCS, ordens 3 (genético) e 2 (ambiente permanente) como melhores, com herdabilidades baixas. — [Iran SCS RRM](https://lst.uk.ac.ir/article_4719.html) (snippet)

**3.4 EUA: ADGA e USDA (snippets)**
- Avaliações de produção desde 1983 para machos e 1984 para fêmeas. Modelo de animal substituiu o modelo de touro para produção em 1987. — [USDA AIPL](https://aipl.arsusda.gov/reference/goat/goatsfs.html); [artigo USDA de 1997, JDS 80:594](https://www.aipl.arsusda.gov/publish/jds/1997/80_594.pdf) (snippet, não lido)
- USDA calcula avaliações anuais a partir de dados de produção do National Cooperative DHI Program e de tipo e pedigree fornecidos pelo ADGA. — [USDA AIPL](https://aipl.arsusda.gov/reference/goat/goatsfs.html)
- Índices produção-tipo: um pesa produção sobre tipo em 2:1, outro tipo sobre produção em 1:2. — [ADGA](https://adga.org/performance-programs/production-testing/) (snippet)
- SCS: nenhuma avaliação de SCS do ADGA ou CDCB foi encontrada nesta busca. [não verificado]

**3.5 Brasil: Embrapa/Capragene (detalhes na seção 6)**
- Lôbo & Silva (2005): modelo animal bicaracterístico (IPP com IDP; PL com DL), DFREML. Efeitos fixos: para IPP, mês e ano de nascimento; para IDP, PL e DL, mês e ano de parto, além de ordem de lactação para PL e DL. Efeitos aleatórios: genético direto e erro; ambiente permanente para IDP, PL e DL. — [Lôbo & Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)
- Forma matricial no texto extraído (símbolos perdidos; reconstruído, conferir no PDF): E(y) = Xβ; V(y) = V = ZGZ' + R; y = Xβ + Z1a + Z2p + e. — [Lôbo & Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)
- Embrapa 2015: comparação entre modelos uni e bicaracterístico, DFREML, modelo animal, matriz de parentesco de 1.548 animais, 643 lactações de 261 cabras Saanen. — [Embrapa 2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)

**3.6 Noruega: NSG (snippets dos catálogos de sêmen; modelo não identificado)**
- Os catálogos listam, por bode, o valor de criação junto com leite, gordura e proteína diários, teores de gordura e proteína, lactose, ácidos graxos livres, contagem de células somáticas, conformação do úbere, velocidade de ordenha e número de filhas. — [NSG, catálogo 2020](https://www.semin.nsg.no/files/katalog_bukk/2020/Seminkatalog_bukker_2020.pdf) (snippet)
- Os pesos de cada traço no objetivo de seleção mudaram em janeiro de 2019. — [NSG, catálogo](https://www.semin.nsg.no/files/katalog_bukk/2020/Seminkatalog_bukker_2020.pdf) (snippet)
- Valores de criação de bodes importados no catálogo 2020-2021 variaram de cerca de 128 a 156. — [NSG, catálogo 2021-2022](https://www.semin.nsg.no/files/katalog_bukk/2021/Seminkatalog_bukker_2021-2022.pdf) (snippet)

**3.7 Itália: AssoNaPa (sem fonte primária)**
- A AssoNaPa administra programas genéticos de caprinos e ovinos, mantém os livros genealógicos de Saanen e Camosciata delle Alpi, e fornece EBVs aos criadores; o monitoramento genômico está sendo introduzido gradualmente. [não verificado; a fonte de busca não foi confirmada]
- Modelo de avaliação italiano: não identificado. [não verificado]

**3.8 Efeitos de idade, época, rebanho e tamanho de ninhada nos modelos**
- Idade ao parto: 7 classes (França); IPP como característica (Brasil).
- Época: período de parto em 8 classes (França); mês e ano de parto (Brasil).
- Rebanho: efeito fixo de rebanho × data de controle (França), com exigência de mais de quatro animais por combinação. Rebanhos pequenos: nenhuma fonte lida trata do efeito.
- Número de crias (tamanho de ninhada): não aparece no modelo de Arnal et al. 2019 nem nos modelos brasileiros lidos.
- Estágio de gestação: spline com quatro nós (França).

### Inferences
- No modelo francês, o efeito fixo de rebanho × data de controle absorve o ambiente de rebanho e de data. Isso exige rebanhos com muitos animais em cada data. Rebanhos pequenos ficam fora ou pouco informativos. [inferência, não testada]
- Modelos de lactação de 305 dias (EUA, Capragene), modelos bicaracterísticos com PL total (Embrapa 2005) e RRM por teste-dia (França) definem o fenótipo de forma diferente. Comparações de valores genéticos entre programas exigem reconciliação. [inferência]
- Para exemplos trabalhados, a ordem de polinômio de Legendre (4 na França) e a redução de posto (2 ou 3) são decisões de modelagem, não parâmetros universais. [inferência]

### Gaps
- Forma matricial completa do modelo RRM francês (y = Xb + Zu + e). O texto extraído não preserva matrizes; obter o PDF ou o suplemento do GSE.
- Modelos de avaliação oficial de Espanha (Murciano-Granadina), Itália, Noruega e do Capragene (EBV oficial).
- Efeito de rebanho pequeno e de tamanho de ninhada sobre a avaliação genética em caprinos: não encontrado em fonte lida.
- Efeitos de tamanho de ninhada e de idade ao parto em modelos de avaliação de outros países.

---

## 4. Células somáticas (CCS/SCS) em caprinos

### Takeaway
Nas fontes lidas com texto completo (Valencia-Posadas et al. 2022, população norte-americana de Nigerian Dwarf), a SCS é modelada em escala log2. A herdabilidade (0,32) é maior que a do leite (0,16), e a correlação genética com leite é positiva e baixa (0,25). Os demais valores vêm de snippets, com herdabilidades de SCS entre 0,02 e 0,32, de acordo com população e modelo. A explicação fisiológica para CCS mais alta em cabras (secreção apócrina, fatores não infecciosos) e o uso de SCS como indicador de mastite não foram verificados em fonte lida.

### Cited Findings

**Nigerian Dwarf (EUA), Valencia-Posadas et al. 2022, Anim Biosci, [doi](https://doi.org/10.5713/ab.21.0143)**
- Dados: 1.041 cabras Nigerian Dwarf, partos em 95 rebanhos. Modelo: "18-trait mixed linear animal model" para SCS média de lactação (log2), leite, gordura, proteína e 14 traços de tipo. Algoritmo FA1 no ASReml. — [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/)
- Médias: SCS 2,85 ± 1,29 log2; leite 314 ± 110,6 kg; gordura 20,9 ± 7,4 kg; proteína 14 ± 4,9 kg. — [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/)
- Herdabilidades: SCS 0,32; leite 0,16; gordura 0,16; proteína 0,10. — [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/)
- Correlações genéticas de SCS: com leite 0,25; com gordura 0,18; com proteína 0,23. Entre leite, gordura e proteína: "high and positive (≥0.66)". — [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/)
- Correlações genéticas com traços de tipo: "generally low or no different from zero". — [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/)

**Irã, Murciano-Granadina (snippets)**
- Dissertação/artigo de 2025 (J Agric Sci, análise bayesiana): herdabilidades de DMY 0,244; DMFY 0,133; DMPY 0,188; SCS 0,023. Correlação genética DMY–SCS 0,42. — [J Agric Sci 2025](https://resolve.cambridge.org/core/journals/journal-of-agricultural-science/article/bayesian-approach-to-estimate-variance-components-and-genetic-parameters-of-dairy-traits-and-somatic-cell-score-in-murcianogranadina-goats/DC0EC813D8A59C79AB6CCEE8C584D85B) (snippet)
- RRM com polinômios de Legendre para SCS em teste-dia: melhor modelo RRM-LEG32 (ordem 3 genético, ordem 2 ambiente permanente); herdabilidades baixas. — [Iran SCS RRM](https://lst.uk.ac.ir/article_4719.html) (snippet)

**Outras fontes (snippets; não lidas)**
- Cabras leiteiras da Nova Zelândia (mais de 64.000 lactações): herdabilidade de SCS 0,21; leite 0,25; gordura 0,24; proteína 0,24. Fonte com autoria e periódico não confirmados. [não verificado] — [infona](https://www.infona.pl/resource/bwmeta1.element.wiley-asj-v-91-i-1-asj13310)
- Rebanho único (282 cabras, 11 anos): herdabilidade de SCS 0,21; correlação genética leite–SCS 0,59; leite–lactose -0,46. Fonte não identificada. [não verificado]
- Faixa de correlações genéticas leite–SCS citada por artigo MDPI (Animals, 2021): de -0,16 a 0,43, com erro padrão grande. Fonte e ano não confirmados. [não verificado]

**França (metadados; valores não lidos)**
- Rupp, Clément, Piacere, Robert-Granié (2011), JDS 94:3629-3634, [doi](https://doi.org/10.3168/jds.2010-3694). Título verificado no Crossref: "Genetic parameters for milk somatic cell score and relationship with production and udder type traits in dairy Alpine and Saanen primiparous goats". Valores não extraídos. [não verificado]
- Arnal et al. 2020, JDS (ver 3.2): SCS nas três primeiras lactações de cabras Alpine. Valores não extraídos.

**Revisões**
- Barillet (2007), Small Ruminant Research 70:60-75, [doi](https://doi.org/10.1016/j.smallrumres.2007.01.004). Título verificado: "Genetic improvement for dairy production in sheep and goats". Conteúdo não lido.
- Uma publicação de 2013 em Small Ruminant Research sobre perdas de leite, gordura e proteína em diferentes níveis de CCS aparece em listas de referências. Não foi recuperada. [não verificado]

### Inferences
- A diferença entre herdabilidades (0,02 e 0,32) pode vir da transformação (log2 ou linear), da estrutura dos dados (rebanho único ou multirrebanho), do modelo (animal ou regressão aleatória) e do tamanho da amostra. Não há teste direto nas fontes lidas. [inferência]
- Correlações genéticas positivas entre SCS e produção sugerem que selecionar só para produção pode elevar SCS. A magnitude é baixa na Nigerian Dwarf (0,18 a 0,25) e maior em outras amostras (até 0,59 em rebanho único, snippet). [inferência]

### Gaps
- Explicação fisiológica (secreção apócrina, fatores não infecciosos) para CCS mais alta em cabras. Não verificada. Recomenda-se localizar uma revisão primária sobre CCS caprina.
- Fórmula da transformação log2 da SCS e os limiares de CCS para caprinos. Não extraídos das fontes lidas.
- Valores numéricos de Rupp et al. 2011 e Arnal et al. 2020 (SCS na França).
- Uso de SCS como indicador de mastite em caprinos: nenhuma fonte lida. [não verificado]

---

## 5. Herdabilidades e correlações genéticas

### Takeaway
Os valores lidos com texto completo são: Saanen (Brasil) herdabilidade de produção de leite 0,12 (ver tabela); Alpine (França) cerca de 0,3 para leite em lactação inteira; Nigerian Dwarf (EUA) 0,16 para leite e 0,32 para SCS. As estimativas de SCS e de persistência variam bastante. Como os modelos, as bases e as unidades diferem entre estudos, os valores não são diretamente comparáveis.

### Cited Findings

| População | Característica | Herdabilidade (h²) | Correlação genética (rg) | Fonte | Status |
|---|---|---|---|---|---|
| Saanen (Embrapa, 1988-2002) | IPP / IDP / PL / DL | 0,21 ± 0,01 / 0,06 ± 0,01 / 0,12 ± 0,05 / 0,03 ± 0,01 | IPP-IDP 0,64 ± 0,01; PL-DL 0,66 ± 0,30 | [Lôbo & Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf) | Lido |
| Anglo-nubiana (Embrapa) | IPP / IDP / PL / DL | 0,49 ± 0,04 / 0,01 ± 0,00 / 0,10 ± 0,03 / 0,07 ± 0,02 | IPP-IDP -0,71 ± 0,27; PL-DL 0,86 ± 0,40 | [Lôbo & Silva 2005](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf) | Lido |
| Saanen (Embrapa, 643 lactações) | PL305, DL (uni e bicaracterístico) | Valores não extraídos | Valores não extraídos | [Embrapa 2015](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf) | Só resumo |
| Saanen e Alpine (França) | Leite, lactação inteira | Cerca de 0,3 | Não extraído | [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) | Lido |
| Alpine (França) | Teor de gordura | 0,65 (LACT); 0,75 (RRM, Legendre 4) | Não extraído | [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) | Lido |
| Saanen e Alpine (França) | Componente 1 (nível), leite | 0,28 (Saanen); 0,27 (Alpine) | PC1-PC2 ≈ 0 | [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) | Lido; coluna inferida |
| Saanen e Alpine (França) | Componente 2 (persistência), leite | 0,13 (Saanen); 0,14 (Alpine) | Ver acima | [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) | Lido; coluna inferida |
| Saanen e Alpine (França) | Componente 2 (persistência), teor de proteína | 0,18 (Saanen); 0,19 (Alpine) | Ver acima | [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) | Lido; coluna inferida |
| Nigerian Dwarf (EUA) | SCS / leite / gordura / proteína | 0,32 / 0,16 / 0,16 / 0,10 | SCS-leite 0,25; SCS-gordura 0,18; SCS-proteína 0,23 | [Valencia-Posadas et al. 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8902223/) | Lido |
| Murciano-Granadina (Irã) | DMY / DMFY / DMPY / SCS | 0,244 / 0,133 / 0,188 / 0,023 | DMY-SCS 0,42 | [J Agric Sci 2025](https://resolve.cambridge.org/core/journals/journal-of-agricultural-science/article/bayesian-approach-to-estimate-variance-components-and-genetic-parameters-of-dairy-traits-and-somatic-cell-score-in-murcianogranadina-goats/DC0EC813D8A59C79AB6CCEE8C584D85B) | Snippet |
| Nova Zelândia (mais de 64.000 lactações) | MY / FY / PY / SCS | 0,25 / 0,24 / 0,24 / 0,21 | Não extraído | [infona](https://www.infona.pl/resource/bwmeta1.element.wiley-asj-v-91-i-1-asj13310) | Snippet, [não verificado] |
| Murciano-Granadina (Espanha) | MY, PY, FY, DMY (RRM) | Descrição qualitativa; valores não extraídos | Não extraído | [Menéndez-Buxadera et al. 2010](https://doi.org/10.3168/jds.2009-2571) | Resumo |

Notas sobre a tabela:
- Os erros-padrão de Lôbo & Silva (2005) são grandes para as correlações (rg PL-DL 0,66 ± 0,30 em Saanen; 0,86 ± 0,40 em Anglo-nubiana).
- Lôbo & Silva citam, via fonte secundária, herdabilidades de IPP de outros trabalhos: 0,37 (Gonçalves et al. 1997a, várias raças) e 0,10 (Soares Filho et al. 2001, Saanen). [citado em Lôbo & Silva 2005, não lido na fonte original]

**Persistência**
- Na França, a herdabilidade da persistência (componente 2) é em geral próxima de 0,10, exceto para teor de proteína (cerca de 0,18). — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3) (tabela)
- Persistência ajustada no modelo francês é independente do nível de produção (correlação genética próxima de zero entre PC1 e PC2). — [Arnal et al. 2019](https://doi.org/10.1186/s12711-019-0485-3)

### Inferences
- As herdabilidades de leite caprino lidas ficam em torno de 0,10 a 0,30. As de gordura e proteína em teor são mais altas (0,50 a 0,75 na França), o que é consistente com a literatura de bovinos. [inferência]
- Pelo tamanho da amostra brasileira (643 lactações) e pelos erros-padrão, as estimativas brasileiras de correlação genética têm incerteza alta. [inferência]

### Gaps
- Toggenburg, Parda Alpina e Alpine no Brasil: valores não extraídos (Lôbo & Silva 2005 citam dados de Toggenburg e Parda Alpina apenas por fonte secundária).
- Herdabilidades e correlações da Murciano-Granadina (Espanha) e de Italia e Noruega: não extraídas.
- Herdabilidades de persistência em Saanen, Anglo-nubiana e nas populações brasileiras: não encontradas.
- Valores de Rupp et al. 2011 e Arnal et al. 2020 e 2023: não lidos.

---

## 6. Brasil: avaliação genética de leite caprino

### Takeaway
Nesta sessão, a literatura brasileira com texto completo acessível é pequena. Os trabalhos principais são da Embrapa Caprinos e Ovinos (Sobral, CE): estimativas de Saanen e Anglo-nubiana com dados de 1988 a 2002 (Lôbo & Silva 2005) e uma comparação de modelos uni e bicaracterísticos com 643 lactações de 261 cabras Saanen (Embrapa 2015, somente resumo lido). O Capragene (desde 2005) implantou o controle leiteiro oficial e publica sumários de avaliação; o snippet indica sumários de 2014 e 2020. Não encontrei trabalhos da UFV, da Revista Brasileira de Zootecnia ou da Pesquisa Agropecuária Brasileira sobre avaliação genética de leite caprino. A busca por "Facó Lôbo" retornou artigos não relacionados (Santa Inês e caprinos no semiárido).

### Cited Findings

**Lôbo & Silva (2005), Ciência Agronômica 36(1):104-110, [PDF Embrapa](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/531180/1/APIParametrosgeneticosparaCaracteristicasdeinteresseeconomicoem.pdf)**
- Título: "Parâmetros genéticos para características de interesse econômico em cabras das raças Saanen e Anglo-nubiana". Autores: Raimundo Nonato Braga Lôbo e Francisco Luiz Ribeiro da Silva.
- Dados: partos de 1988 a 2002 no Setor Leiteiro da Fazenda Três Lagoas, Embrapa Caprinos, Sobral (CE). Sistema semi-intensivo de janeiro a junho e intensivo de julho a dezembro. Médias de IPP: 634,15 ± 303,85 dias (Saanen) e 667,76 ± 269,92 dias (Anglo-nubiana).
- Características: IPP, IDP, PL e DL. Método: DFREML sob modelo animal.
- Resultados e herdabilidades: tabela da seção 5.
- Tendência genética: observada somente para PL na Saanen. Para a Anglo-nubiana, observada em todas as características.
- Conclusão reportada no resumo: "A seleção massal pode ser eficiente para promover o melhoramento genético na IPP desta população Anglo-nubiana."

**Embrapa Caprinos e Ovinos (2015), "Avaliação de modelos...", [PDF Embrapa Alice](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1034779/1/CNPC2015Avaliacaodemodelos.pdf)**
- "Foram utilizadas 643 lactações de 261 cabras da raça Saanen para avaliar a eficiência dos modelos unicaracterística e bicaracterística em estimar parâmetros genéticos para as características produção de leite até 305 dias (PL305) e duração da lactação (DL)."
- Estimação: DFREML sob modelo animal; matriz de parentesco com 1.548 animais.
- Resultado: estimativas "similares para os modelos avaliados", mas "o modelo bicaracterística permitiu melhor utilização das informações disponíveis". Valores numéricos não extraídos.
- Autoria e tipo de publicação: o resultado de busca indica Congresso Brasileiro de Zootecnia (2015). [não verificado]

**Capragene (snippets; fonte exata não identificada)**
- Criado em 2005. Implantou o Controle Leiteiro Oficial e criou o Arquivo Zootécnico Nacional. — [registros Embrapa Infoteca/Alice, candidatos: https://www.infoteca.cnptia.embrapa.br/handle/doc/1128273 e https://www.alice.cnptia.embrapa.br/alice/handle/doc/530282] [não verificado quanto à fonte exata]
- Primeiro sumário (2014, Saanen): métodos e resultados para PL até 305 dias, de machos e fêmeas. [não verificado]
- Terceiro sumário (2020): base com 32,5% mais lactações analisadas e confiabilidade média das previsões genômicas cerca de 6% maior. Tendência de aumento do valor genético médio para produção de leite. [não verificado]

**Dissertação UFC (2014), [PDF](https://www.repositorio.ufc.br/bitstream/riufc/19004/1/2014_dis_tnmsantos.pdf)**
- Snippet: curva de lactação de 305 dias em Saanen, com 11.018 controles leiteiros de 950 lactações de rebanhos do Capragene, comparando 18 modelos de regressão aleatória. O PDF não foi baixado (conexão reinicializada). Resultados não lidos.

**Artigo SciELO ABMVZ (identificado, não lido)**
- Identificador SrPbYHkZNHJjFg8yYRJg5Wh. Acesso negado (HTTP 403). Título e conteúdo não confirmados. [não verificado]

**Outras publicações brasileiras encontradas (não lidas)**
- Embrapa Infoteca/Alice: registros com handles doc/1128273, doc/1000132, doc/1088252 e doc/530282 (títulos não confirmados).
- Mesmo grupo de autores (Lôbo e Silva) em outros trabalhos com caprinos: não verificado nesta sessão.

### Inferences
- Os tamanhos de amostra brasileiros (643 lactações; 261 cabras) são pequenos em comparação com o conjunto francês (cerca de 30 mil primeiras lactações por raça). Isso limita a precisão das herdabilidades e das correlações. [inferência]
- O modelo bicaracterístico é apontado como melhor uso da informação quando a amostra é pequena. Essa é a recomendação do próprio estudo. [inferência com base em Embrapa 2015]
- A França e o Brasil diferem nas definições de lactação (PL total versus PL305, teste-dia versus lactação). Qualquer comparação de herdabilidades entre países precisa dessa ressalva. [inferência]

### Gaps
- Artigos brasileiros publicados em Revista Brasileira de Zootecnia, Pesquisa Agropecuária Brasileira ou Arquivo Brasileiro de Medicina Veterinária e Zootecnia sobre avaliação genética de leite caprino: nenhum lido.
- Sumários do Capragene (2014 e 2020): não localizados em PDF.
- UFV: nenhum trabalho identificado nesta sessão.
- Valores numéricos da Embrapa 2015 e da dissertação UFC 2014.
- Sugestão de buscas para a próxima etapa: "Capragene sumário avaliação genética Saanen"; "controle leiteiro oficial caprinos Brasil PL305"; "random regression Saanen Capragene dissertação"; "Lôbo Saanen produção de leite Revista Brasileira de Zootecnia".

---

## Registro de fontes com DOI verificado no Crossref

- Arnal et al. 2019, Genet Sel Evol: [10.1186/s12711-019-0485-3](https://doi.org/10.1186/s12711-019-0485-3). Título: "Genetic parameters for first lactation dairy traits in the Alpine and Saanen goat breeds using a random regression test-day model".
- Arnal et al. 2020, JDS 103:4517-4531: [10.3168/jds.2019-17465](https://doi.org/10.3168/jds.2019-17465). Título: "Estimation of genetic parameters for dairy traits and somatic cell score in the first 3 parities using a random regression test-day model in French Alpine goats".
- Arnal et al. 2023, JDS 106:4813-4824: [10.3168/jds.2022-22550](https://doi.org/10.3168/jds.2022-22550). Título: "Validation of single-step genomic BLUP random regression test-day models and SNP effects analysis on milk yield in French Saanen goats".
- Rupp et al. 2011, JDS 94:3629-3634: [10.3168/jds.2010-3694](https://doi.org/10.3168/jds.2010-3694).
- Menéndez-Buxadera et al. 2010, JDS 93:2718-2726: [10.3168/jds.2009-2571](https://doi.org/10.3168/jds.2009-2571). Título: "Random regression analysis of milk yield and milk composition in the first and second lactations of Murciano-Granadina goats".
- Barillet 2007, Small Ruminant Research 70:60-75: [10.1016/j.smallrumres.2007.01.004](https://doi.org/10.1016/j.smallrumres.2007.01.004).
- Valencia-Posadas et al. 2022, Anim Biosci: [10.5713/ab.21.0143](https://doi.org/10.5713/ab.21.0143).
- Mokhtari et al. 2025, Trop Anim Health Prod: [10.1007/s11250-025-04575-5](https://doi.org/10.1007/s11250-025-04575-5). Título: "Random regression models for genetic analysis of milk, fat, and protein yields in the Murciano-Granadina goats". Identificado, não lido.
