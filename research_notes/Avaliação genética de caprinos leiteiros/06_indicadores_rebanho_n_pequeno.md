# Indicadores zootécnicos e métodos estatísticos para rebanhos caprinos leiteiros pequenos (cerca de 20 a 1.000 cabras)

Notas de pesquisa para o segmento "Caprinos leiteiros" da central de melhoramento (SeabraApp). Data de referência: 15/10/2026. Idioma: português; títulos de artigos, nomes de normas e fórmulas mantidos no original.

**Como ler estas notas.** Cada dado tem link para a fonte. Quando a fonte foi lida só por trecho de busca, o texto diz "(snippet de busca; não aberto)". O que não foi confirmado está marcado "[não verificado]". Fórmulas marcadas "definição operacional" são definições deste relatório, sem fonte própria, e servem de base para a análise posterior. O status de leitura de cada fonte está no fim da Questão 5.

**Limitações da coleta.**
- OpenAlex devolveu HTTP 429 sem chave ("cota diária gratuita esgotada"). A busca usou Crossref, Europe PMC, PubMed e os repositórios Embrapa (Infoteca e Alice).
- O texto oficial da IN 37/2000 não foi aberto. O PDF da FranceAgriMer tem certificado expirado (erro 60 do curl), o site da Defesa Agropecuária paulista tem cadeia de certificados não reconhecida mesmo com o bundle da proxy, e o old.icar.org tem certificado com nome diferente do host. Não usei `-k` e não desativei a verificação TLS.
- vetres.org (artigo de FAMACHA) devolve um desafio de JavaScript. O texto integral não foi lido.

---

## Questão 1. KPIs de produção e padrões legais do leite de cabra (IN 37/2000)

### Takeaway
O único padrão legal brasileiro para leite de cabra cru encontrado é a IN MAPA 37/2000. Ela fixa contagem padrão em placas (CPP) de no máximo 500.000 UFC/mL e não fixa limite de contagem de células somáticas (CCS). Não há padrão nacional publicado de produção por cabra ou de lactação padronizada. As referências de produção vêm de estudos e comunicados de sistemas, com grande variação regional e de manejo.

### Cited Findings

**Legislação (IN 37/2000)**
- A IN 37/2000 "aprova o Regulamento Técnico de Identidade e Qualidade de Leite de Cabra" e define leite de cabra como produto da ordenha completa e ininterrupta de cabras sadias, bem alimentadas e descansadas. Fonte: [Chapaval & Magalhães (2009), Capril Virtual/Embrapa](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/579283/1/CNPC-Qualidade-Leite.pdf) (texto lido integralmente).
- Limites da IN 37 como listados por Magalhães (UFV, Viçosa): contagem padrão em placas ≤ 500.000 UFC/mL; acidez titulável 0,13–0,18 °Dornic; densidade relativa 1,028–1,034; índice crioscópico 0,550–0,585; alizarol "não é indicado"; contagem de células somáticas "limite não definido". Fonte: [Magalhães, "Obtenção higiênica e parâmetros de qualidade do leite de cabra", UFV](https://www.dti.ufv.br/dzo/caprinos/artigos_tec/hig_quali.pdf) (texto lido).
- Mesma faixa de CPP no resumo da Defesa Agropecuária de SP: leite cru com limite de 500 mil UFC/mL; acidez de 0,11–0,18% para leite cru congelado. Fonte: [IN SDA 37 de 31/10/2000, Defesa Agropecuária SP](https://www.defesa.agricultura.sp.gov.br/legislacoes/instrucao-normativa-sda-37-de-31-10-2000,663.html) (snippet de busca; não aberto).
- A Embrapa (Souza et al., 2022, Comunicado Técnico 208) reproduz a Tabela 1 da IN 37 como "Requisitos físico-químicos do leite de cabra". Fonte: [Souza et al. (2022), CNPC-2022 Contagem de células somáticas e composição do leite de cabra cru](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf) (texto lido integralmente). Valores mínimos: gordura 3,0 g/100 g; proteína total 2,8 g/100 g; lactose 4,3 g/100 g; sólidos não gordurosos 8,2 g/100 g; extrato seco total 11,2 g/100 g. Índice crioscópico máximo −0,550 a −0,585 ºH.
- [Conflito a resolver] Um estudo citado em resultado de busca (URL não identificada com segurança) cita gordura de 2,9% como exigência; o texto de Chapaval & Magalhães (2009) lido não traz valores numéricos. O resumo SP descreve categorias: integral sem ajuste; padronizado 3,0%; semidesnatado 0,6–2,9%; desnatado até 0,5%. O limite de gordura de 3,0 g/100 g da Embrapa (2022) pode ser o padronizado, e não o mínimo do leite cru. Confirmar no texto oficial.
- Atualização: não encontrei norma posterior que substitua a IN 37/2000. Um resultado de busca cita a IN 51/2002 como regulamento do leite de cabra, o que conflita com as demais fontes [não verificado]. Outro resultado de busca diz que o MAPA consultou a Câmara Setorial de Caprinos e Ovinos sobre ajustes à IN 37, e que alguns parâmetros derivam de dados de condições diferentes das brasileiras [fonte não identificada com segurança; não verificado]. A página de legislação do MAPA lista a norma: [MAPA, legislação de produtos de origem animal](https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/legislacao) (não aberta).
- Contagem de células somáticas (CCS): a Embrapa afirma que "não existirem padrões estabelecidos pela Instrução Normativa nº 37" e que contagens a partir de 1.000.000 CS/mL "têm sido utilizadas como base para detectar leite de animais com mastite subclínica (Paes et al., 2003)". Fonte: [Souza et al. (2022), CNPC-2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf). Paes et al. (2003), Arquivo Brasileiro de Medicina Veterinária e Zootecnia 55(1):15–20, [DOI 10.1590/S0102-09352003000100003](https://doi.org/10.1590/S0102-09352003000100003) (citado; não aberto).
- Referência internacional de CCS (contraditória): Paape et al. (2007) escreve que o limite legal dos EUA para leite de cabra era de 1.000.000 mL⁻¹ naquela época [PDF USDA-ARS](https://aipl.arsusda.gov/publish/other/2007/srr_68_114.pdf) (snippet). Um documento da UVM (cerca de 2010) cita 1.500.000 células/mL para cabras [UVM, SCC goats](https://www.uvm.edu/d10-files/documents/2024-10/SCCgoats2010.pdf) (snippet). O limite atual dos EUA [não verificado].

**Composição e CCS do leite de cabra no Brasil (dados de rebanho, Cariri Paraibano e Sertão Pernambucano, 2020–2021)**
- Foram analisadas 532 amostras de latão (tanque comunitário ou plataforma), coletadas entre novembro de 2020 e dezembro de 2021, em usinas de Cabaceiras, Sumé, Zabelê (PB) e Sertânia (PE), e em sete tanques comunitários da PB e PE. Fonte: [Souza et al. (2022), CNPC-2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf) (texto lido).
- Médias: gordura 3,24 ± 0,61 g/100 g (CV 18,78%); proteína 3,10 ± 0,28 (CV 9,04%); lactose 4,11 ± 0,28 (CV 6,83%); sólidos não gordurosos 8,22 ± 0,49; extrato seco total 11,46 ± 0,91. Lactose média abaixo do mínimo de 4,3 da IN 37. Fonte: mesma.
- Índice crioscópico: média −0,555 ºH (n = 260; CV 7,16%); 179 amostras (68,3%) dentro de −0,550 a −0,585 ºH; 68 (26%) acima de −0,550 (possível adição de água). O DP impresso (39,71) é erro evidente; o CV de 7,16% indica DP perto de 0,04 [não verificado]. Fonte: mesma.
- CCS: média de 778.000 CS/mL; 314 propriedades (59%) abaixo de 1.000.000 CS/mL e 218 (41%) acima. Staphylococcus spp. são os patógenos mais prevalentes citados. Fonte: mesma.
- Nota: o próprio documento diz que os resultados "sugerem a importância da revisão dos limites estabelecidos pela legislação vigente, visto que não representam as características da produção leiteira dos rebanhos nacionais" (Souza et al., 2022).

**Produção por cabra (CAPRAGENE, Embrapa)**
- Santos et al. (2011), trabalho apresentado no XIII Encontro de Iniciação Científica (UVA/Embrapa Caprinos e Ovinos). Dados de 865 registros de Anglo-Nubiana e 1.549 de Saanen, de rebanhos do programa CAPRAGENE. Fonte: [RACProducaoecomposicao.pdf](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/916648/1/RACProducaoecomposicao.pdf) (texto lido integralmente). Média ± DP:

| Característica | Saanen (n = 1.549) | Anglo-Nubiana (n = 865) |
|---|---|---|
| DL, dias em lactação | 251,08 ± 98,87 | 168,98 ± 67,80 |
| PL, produção total (kg) | 591,58 ± 399,69 | 192,20 ± 126,14 |
| PL305 (kg) | 547,12 ± 322,63 | 188,97 ± 113,03 |
| ML, produção média diária (kg/dia) | 2,26 ± 0,95 | 1,15 ± 0,50 |
| PGor305, gordura até 305 d (kg) | 23,13 ± 12,60 | 32,06 ± 14,08 |
| PProt305, proteína até 305 d (kg) | 23,06 ± 9,54 | 29,69 ± 4,38 |
| PExtseco305 (kg) | 93,20 ± 39,32 | 102,80 ± 29,17 |
| PLactose305 (kg) | 34,51 ± 14,04 | 34,13 ± 10,08 |

- A unidade de SOM (contagem somática média por lactação) aparece como "células" com valores de 1.328,91 ± 1.068,56 (Saanen) e 2.331,00 ± 2.462,15 (Anglo-Nubiana). A unidade é ambígua, provavelmente milhares de células/mL [não verificado]. Fonte: mesma.
- Limite do estudo: resumo de iniciação científica, com rebanhos de programa de melhoramento, não de amostra representativa.

**Modelo econômico de rebanho familiar (RN)**
- Holanda Júnior et al. (2006), Comunicado Técnico 74 (Embrapa Caprinos e Ovinos). Modelo padrão de 33 cabeças (1 reprodutor, 26 matrizes, 6 fêmeas jovens) no Rio Grande do Norte. Indicadores: produção anual 5.150,15 L; produção diária por propriedade 14,11 L; produção diária por cabra em lactação 1,35 L; duração da lactação 148 dias (nota de rodapé do documento; o banco do Nordeste usa 200 dias); cabras paridas/cabras totais 90%; taxa de reposição de matrizes 22%; cabras em lactação/cabras do rebanho 60%. Fonte: [cot74.pdf](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/534563/1/cot74.pdf) (trechos lidos). Modelo de simulação com dados de 2006, não observação de rebanho.

**Produção média nacional e regional (IBGE, via Embrapa)**
- Perdigão et al. (2016), capítulo "Sistemas de Produção de Caprinos Leiteiros" (Anais de workshop de caprinos e ovinos; ano inferido pela data de acesso citada na referência). Tabela 1, litros por cabra ordenhada por dia: Brasil 0,633; Nordeste 0,556; Sudeste 1,179. Fonte: [CNPC2016 Sistemas de produção](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (trechos lidos). A tabela usa IBGE 2006, e o texto cita IBGE 2012 para a mesma série. Os dois anos aparecem no mesmo capítulo.
- Participação regional (Embrapa 2022, citando IBGE 2019): o Nordeste tem 83% dos estabelecimentos produtores de leite de cabra e 18,245 milhões L/ano, 69,9% da produção nacional. Fonte: [Souza et al. (2022)](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf).

**Sistema intensivo (Balde Cheio, Embrapa)**
- Programa Balde Cheio, apresentado no 15º Workshop sobre Produção de Caprinos na Região da Mata Atlântica. Dados de sistema intensivo: 25,8 cabras em lactação/ha; produção média de 2,3 L/dia por cabra em lactação (Gonçalves et al., 2008); receita de caprinocultura leiteira de R$ 2,00/L, com 21.659 L/ha/ano (coerente com 25,8 × 2,3 × 365). Preços de janeiro de 2018. Fonte: [ProgramaBaldeCheio.pdf](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1099498/1/ProgramaBaldeCheio.pdf) (trechos lidos).
- Forma da curva: "a curva de lactação das cabras é semelhante [à da vaca], porém, com um pico menos proeminente e com uma maior persistência de produção" (FAO, 2012, citado no Balde Cheio). Mesma fonte.

**Fórmulas (definições operacionais, salvo onde indicado)**

```
Leite por cabra em lactação/dia (kg)  = PL_lactação / DL                        (definição)
Leite por cabra presente/dia (kg)     = Produção_período / (cabras_presentes x dias_período)   (definição)

PL, método dos trapézios sobre controles (forma usual do ICAR; eq. 3 do artigo MDPI não extraída):
   PL = Soma_n [ (P_n + P_(n-1)) / 2 x d_n ]
   P = produção no controle; d = dias entre controles. Antes do 1º controle, usar regra definida.

PL305 = produção até 305 DL, por interpolação ou projeção.                         (definição; CAPRAGENE usa PL305)

FCM 3,5% (gordura corrigida para 3,5%), fórmula usual:
   FCM = M x (0,4324 + 0,1622 x G%)   ->  equivalente a 0,4324·M + 16,216·F (F em kg)
   [não verificado nesta sessão; artigo MDPI usa padronização para 35 g de gordura/kg, eq. 1 não extraída]

Wood (1967):  y(t) = a · t^b · e^(-c·t)   ->  pico em t = b/c;  y_pico = a·(b/c)^b·e^(-b)   (dedução)
Persistência operacional = y(t_pico + 60) / y_pico                                   (definição)
```

### Inferences
- A CAPRAGENE mostra desvio-padrão de cerca de 60% da média em PL305 de Saanen (547 ± 323 kg). Em um rebanho de 20 a 50 cabras, a média de produção tem erro grande, então deve-se reportar mediana e intervalo, e não só a média.
- A produção diária por cabra varia de 0,556 (Nordeste, IBGE) a 2,3 L/dia (sistema intensivo). Metas para o SeabraApp devem ser por sistema e por região, e não um valor único.
- Os comprimentos de lactação usados nas fontes são diferentes: 148 dias (duração observada no modelo do RN), 200 dias (parâmetro do Banco do Nordeste, citado em Holanda Júnior et al.), 250 dias (duração média observada em Sobral), 210 dias (estudo italiano) e 305 dias (CAPRAGENE, PL305). Qualquer comparação de kg por lactação exige declarar a regra usada.
- A gordura média dos latões (3,24%) fica acima do mínimo de 3,0 g/100 g citado pela Embrapa para leite cru, mas a comparação com o limite de gordura depende de resolver o conflito de 2,9% contra 3,0% com o texto oficial da IN 37.

### Gaps
- Texto oficial da IN 37/2000 não aberto. Os limites de CPP, acidez e crioscopia vêm de fontes secundárias concordantes (UFV, Embrapa 2022, resumo SP), mas o limite de gordura está em conflito (3,0 contra 2,9).
- Não encontrei valor de referência nacional para persistência, para pico de lactação ou para lactação padronizada de cabras brasileiras.
- Equações FCM e trapézio: confirmar no texto do ICAR (Section Goat) e no artigo MDPI, eqs. 1 e 3. A página ICAR não abriu (certificado).
- A unidade de SOM na CAPRAGENE está ambígua.

---

## Questão 2. KPIs reprodutivos

### Takeaway
Os dados brasileiros de reprodução são escassos e pouco registrados. Embrapa (2016) afirma que a maioria dos produtores não anota nascimentos, então não se sabe o intervalo entre partos. Como referências de planejamento, a Embrapa cita para sistemas intensivos com Saanen e Alpina lactação de até 10 meses e intervalo entre partos de 12 meses; para Anglo-Nubiana, 8 meses e 10 meses. Não encontrei valores brasileiros verificados para prolificidade, mortalidade até o desmame ou taxa de desmame. Para aborto, a referência quantitativa encontrada é espanhola (16%).

### Cited Findings

**Registros e planejamento reprodutivo**
- "A grande maioria dos produtores não anota o nascimento dos filhotes e, por consequência, não se sabe o intervalo entre partos ou mesmo a duração das lactações" (citando Riet-Correa et al., 2013). Fonte: [Perdigão et al. (2016), CNPC2016 Sistemas de produção](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (lido).
- Padrão intensivo, Saanen e Alpina: "período de lactação de até 10 meses e intervalo entre partos de 12 meses"; Anglo-Nubiana: "8 meses de lactação e 10 meses de intervalo entre partos" (Nascimento et al., 2011). Fonte: mesma, trecho lido.
- Estação de monta: no Sudeste, o fotoperíodo artificial com efeito macho permite que "cerca de 70 a 80% das fêmeas tratadas apresentem cios férteis durante a primavera e parições durante o outono" (Cordeiro, 1991, citado). No semiárido não há estacionalidade fotoperiódica, mas a maioria mantém os reprodutores com as matrizes o ano todo, concentrando coberturas na estação chuvosa (Perdigão et al., 2016, lido).
- Idade ao início da produção: no rebanho da Embrapa Caprinos em Sobral (CE), a primeira lactação começa aos 18 meses (Araújo et al., estudo de longevidade). Fonte: [RACLongevidadeemcabras.pdf](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf) (lido).
- Referência de reposição: 22% ao ano no modelo de Holanda Júnior et al. (2006). Fonte: [cot74.pdf](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/534563/1/cot74.pdf).

**Aborto e perda gestacional (estrangeiro)**
- Rebanho de Murciano-Granadina (Espanha, 9.591 registros de partos, inferência bayesiana com modelo limiar multivariado): incidência de aborto de 15% (1ª ordem de parto), 18% (2ª) e 15% (3ª); média de 16%. Herdabilidades: 0,25 ± 0,10 (aborto 1), 0,11 ± 0,04 (aborto 2), 0,19 ± 0,07 (aborto 3). Fatores de risco: ano, estação e idade ao aborto. Fonte: [Murciano-Granadina, Veterinary and Animal Science (2026)](https://doi.org/10.1016/j.vas.2026.100673) (lido por trechos; PMC13193773). O artigo não define aborto de forma idêntica à de rebanhos brasileiros [não verificado].
- No Brasil, Perdigão et al. (2016) dizem que o aborto "é uma ocorrência frequente" e tem causas principalmente nutricionais, infecciosas, plantas tóxicas e traumas, sem taxa quantitativa. Fonte: mesma (lido).

**Mortalidade e perda de crias**
- "A verminose continua sendo uma das principais causas de mortalidade" (Perdigão et al., 2016). O mesmo capítulo descreve baixa eficiência e elevada mortalidade em sistemas extensivos do Nordeste, sem percentual. Fonte: mesma (lido).

**Estrutura de fêmeas e cabras paridas**
- Em Holanda Júnior et al. (2006), 90% das cabras totais pariram, e 60% estavam em lactação. Fonte: [cot74.pdf](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/534563/1/cot74.pdf) (modelo, não observação).

**Fórmulas (definições operacionais)**

```
Intervalo entre partos (IEP, dias)       = data_parto_(n+1) - data_parto_n
Idade ao 1º parto (IPP, meses)           = (data_1o_parto - data_nascimento) / 30,4
Taxa de concepção (%)                    = cabras com prenhez diagnosticada / cabras cobertas x 100
Taxa de parição (%)                      = cabras paridas / cabras expostas (ou cobertas) x 100
Prolificidade (crias por parto)          = crias nascidas / cabras paridas
Fecundidade (crias por cabra exposta)    = crias nascidas / cabras expostas
Taxa de aborto (%)                       = abortos / gestações diagnosticadas x 100
Mortalidade até desmame (%)              = crias mortas até desmame / crias nascidas x 100
Taxa de desmame (%)                      = crias desmamadas / crias nascidas x 100
Crias desmamadas por cabra/ano           = prolificidade x (1 - mortalidade_desmame) x (365 / IEP)
                                           (derivação; supõe IEP constante)
Partos fora de estação (%)               = partos fora da época de monta / partos totais x 100
```

### Inferences
- Como a maioria dos rebanhos não registra nascimentos, o primeiro KPI reprodutivo a implementar é o registro individual de data de parto, de ordem de parto e de cria. Sem isso, IEP e taxa de desmame não podem ser calculados.
- Em rebanhos de 20 a 50 cabras, a diferença de uma cabra na taxa de parição muda o indicador em 2 a 5 pontos percentuais. A comparação ano a ano só é útil com intervalo de confiança (ver Questão 6).
- O aborto espanhol (16%) é benchmark estrangeiro. Não deve ser usado como meta brasileira sem definição igual de caso.

### Gaps
- Valores brasileiros verificados de prolificidade, taxa de parição, mortalidade até desmame e taxa de desmame: não encontrados nas fontes lidas.
- Percentual de partos fora de estação em rebanhos brasileiros: sem quantificação.
- Taxa de concepção de cabras brasileiras em monta natural ou IA: não encontrada.
- Buscas adicionais em UFRPE, UFPB, UFC e UFMG não foram feitas nesta rodada.

---

## Questão 3. Saúde, mastite, CAE, linfadenite caseosa, verminose, descarte e reposição

### Takeaway
A mastite é o indicador de saúde com dado quantitativo brasileiro mais forte: 41% das amostras de latão do Cariri Paraibano e Sertão Pernambucano (2020–2021) tinham CCS acima de 1.000.000 CS/mL. Para CAE, a prevalência varia muito (1% no Ceará em 2001, com 11,1% na região metropolitana de Fortaleza; 43% em SP em 2002, por snippet). Para linfadenite caseosa e verminose, os capítulos Embrapa afirmam que são frequentes, mas não há prevalência verificada. Para descarte, o único dado brasileiro com idade e vida produtiva é o estudo do rebanho de Sobral (31% de descarte; idade média de 43,7 meses).

### Cited Findings

**Mastite e CCS**
- Bulk tank: 41% dos 532 latões com CCS acima de 1.000.000 CS/mL (Souza et al., 2022; ver Questão 1). Fonte: [CNPC-2022](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/255189/1/CNPC-2022-Contagem-de-celulas-somaticas.pdf) (lido).
- Recomendações da Embrapa (2022): ordenha de animais sadios primeiro, pré e pós-dipping com iodo a 0,5%, teste da caneca de fundo escuro, refrigeração em até 2 horas a 4 ºC, e tratamento de vaca seca na secagem (taxa de cura maior). Fonte: mesma (lido).
- Mastite clínica e subclínica: o capítulo de Perdigão et al. (2016) diz que "o grande desafio" para o combate à mastite é identificá-la nos estágios iniciais, porque costuma ser subclínica. Fonte: [CNPC2016](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (lido).
- Genética da CCS (revisão 2026): CCS tem componente herdável de baixa a moderada, sem herdabilidade numérica no trecho lido; marcadores em lactoferrina, GHR e TLR2 associam-se a CCS, mas os efeitos não são consistentes entre raças e sistemas. Fonte: [revisão CCS em leite de cabra (2026)](https://doi.org/10.1186/s13028-026-00880-7) (lido por busca no texto; PMC13632073).

**CAE (artrite-encefalite caprina)**
- Ceará, 2001 (Pinheiro, Gouveia e Alves, Ciência Rural 31(3):449–454): 40 positivos em 4.019 animais (1%). Maior prevalência, 11,1%, na região metropolitana de Fortaleza. Um terço dos municípios (10 de 30) teve pelo menos um positivo. Raças puras 5,02% contra mestiços 0,12%. Método: AGID. Fonte: [Pinheiro et al. (2001)](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/515385/1/APIPrevalenciadainfeccaopelo.pdf) (lido).
- Baixo Médio São Francisco (BA), Lima et al. (ano [não verificado]): 2 positivos em 693 amostras (0,29%; IC 0,03–0,55); 1 em 46 propriedades (2,17%). Método: IDGA. Fonte: [Lima et al., inquérito soroepidemiológico](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/970078/1/apiInqueritosoroepidemiologico.pdf) (lido). Em Curaçá, 1 de 8 propriedades (12,5%) positivas.
- São Paulo, 2002 (UNESP): 43,01% de positivos em 1.030 cabras de 17 propriedades leiteiras intensivas. Fonte: [repositório UNESP, soroprevalência CAE em SP](https://repositorio.unesp.br/handle/11449/99385) (snippet de busca; não aberto).
- Sisal (BA), 2024: 2,99% (21/702) das amostras e 17,86% (5/28) das propriedades positivas. Fonte: resultado de busca, ufrb.edu.br (snippet; não aberto).

**Verminose e FAMACHA**
- Van Wyk & Bath (2002), "The FAMACHA© system for managing haemonchosis in sheep and goats by clinically identifying individual animals for treatment", Veterinary Research 33:509–529, [DOI 10.1051/vetres:2002036](https://doi.org/10.1051/vetres:2002036); [PubMed 12387487](https://pubmed.ncbi.nlm.nih.gov/12387487/). Resumo de busca: só o FAMACHA é testado para uso em campo; a revisão cita herdabilidade de 0,55 para FAMACHA em Merino; para cabras, a aplicabilidade é menos estabelecida. O texto integral não foi lido.
- Embrapa (Perdigão et al., 2016): o método mais recomendado atualmente é o FAMACHA, tratamento seletivo de animais com anemia, "adaptada para caprinos (Chagas et al., 2007)". Fonte: mesma (lido).
- Estudo comparativo FAMACHA em caprinos e ovinos no Sertão Baiano (revistas.ufg.br). Caprinos: graus FAMACHA predominantes 3 (63,3%), 2 (26,7%) e 4 (10%). Hematócrito por grau em caprinos: 27 ± 2,20% (grau 2), 25 ± 2,49% (grau 3), 21 ± 3,55% (grau 4). Haemonchus em 41,0% dos caprinos; Trichostrongylus em 56%. Correlação FAMACHA × volume globular em caprinos: r = −0,47; em ovinos, r = −0,55. Fonte: [ESTUDO COMPARATIVO DO SISTEMA FAMACHA ENTRE CAPRINOS E OVINOS](https://revistas.ufg.br/vet/article/download/7885/5722?inline=1) (lido). O ano não foi confirmado, e a tabela de EPG parece ter valores repetidos para os graus 3 e 4 [não verificado].

**Linfadenite caseosa (CLA)**
- A Embrapa diz que a linfadenite é de alta ocorrência em rebanhos caprinos, com Corynebacterium pseudotuberculosis capaz de sobreviver no ambiente por longo período (Perdigão et al., 2016; citando Alves et al., 2007). Fonte: mesma (lido). Sem prevalência numérica.

**Descarte e vida produtiva**
- Araújo et al. (Embrapa Caprinos, Sobral, CE), rebanho com Anglo-Nubiana, Saanen e Pardo Alpina. 31% de descarte no período, sendo 9% voluntário por baixa produção. Idade média ao descarte de 43,7 meses; vida produtiva de 25,7 meses, a partir da primeira lactação aos 18 meses. Proporção de cabras descartadas antes de terminar a primeira lactação: 46%. Descarte voluntário na primeira lactação: 18%. Idade média do rebanho: 38 meses; 37% dos animais em primeira lactação. Número máximo de lactações observado: 7. Fonte: [RACLongevidadeemcabras.pdf](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/532730/1/RACLongevidadeemcabras.pdf) (lido).
- O mesmo estudo afirma que as cabras são mais produtivas após a 3ª lactação, que a produtividade cai após a 6ª, e que o pico de produção está entre 4 e 8 anos de idade. Fonte: mesma (lido).
- Reposição de 22% ao ano no modelo RN de 2006 (Holanda Júnior et al.). Fonte: [cot74.pdf](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/534563/1/cot74.pdf).

**Fórmulas (definições operacionais)**

```
CCS: média geométrica (CS/mL); análise em log10(CCS)
% amostras acima do limiar = n(CCS > 1.000.000 CS/mL) / n_amostras x 100
Incidência de mastite clínica (por 100 cabras-lactação) = casos clínicos / cabras-lactação x 100
Prevalência CAE (%) = soropositivos (AGID/IDGA) / testados x 100
Descarte (%) = descartes no ano / matrizes médias x 100
Reposição (%) = fêmeas incorporadas / matrizes médias x 100
Vida produtiva (meses) = idade_descarte - idade_1ª_lactação
```

### Inferences
- Em 30 amostras (latões ou cabras), 10 acima do limiar dão IC de 95% de Wilson de cerca de 19% a 51%, o que impede decisão de manejo em um único ponto. O monitoramento deve ser contínuo (CUSUM, Questão 6).
- Para CAE, a prevalência regional varia de 0% a 43% nas fontes. O teste de rebanho deve ser feito com amostra da própria população, e não com benchmark regional.
- A longevidade de Sobral (vida produtiva de 25,7 meses) é curta comparada com a faixa de pico de 4 a 8 anos. O descarte precoce de primíparas é o ponto de maior perda, o que aponta para o manejo de recria e de primeira lactação antes do descarte de vacas velhas.

### Gaps
- Incidência de mastite clínica em rebanhos caprinos brasileiros: não encontrada.
- Prevalência de CLA e de verminose em rebanhos leiteiros brasileiros: sem número verificado.
- Ano e DOI do estudo de Lima et al. (BA) e do Ceará (Pinheiro et al., 2001): não confirmados. O DOI do artigo de FAMACHA de Van Wyk & Bath foi confirmado via Europe PMC.
- Texto integral de FAMACHA (Van Wyk & Bath 2002) não aberto; escala de graus (1–5) não lida no original.

---

## Questão 4. Metas de crescimento e idade da recria (cabritas de reposição)

### Takeaway
Não há valor brasileiro verificado para a meta "70% do peso adulto" na cobertura de cabritas Saanen, Alpina ou Anglo-Nubiana. A única referência nacional encontrada é um peso mínimo de 25 kg para a primeira cobertura, em manual Embrapa com OCR de baixa qualidade. A regra dos 70% aparece em fórum de veterinário (Engormix), que não é fonte técnica. Estudos fora do Brasil indicam cobertura a cerca de 59% do peso adulto (Turquia, cálculo a partir de snippet) e a 23–25 kg em cabritas de 8–10 meses (México, snippet).

### Cited Findings
- Embrapa, "Manejo de caprinos" (Infoteca doc. 70543): monta controlada de 60 dias, com início em março/abril; "o peso recomendado para a primeira cobertura é de, no mínimo, 25 kg" (texto OCR, sem separação por raça). Fonte: [Manejodecaprinos0001.pdf](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/70543/1/Manejodecaprinos0001.pdf) (trecho OCR lido).
- Fórum Engormix: sugere cobrir ao atingir 70% do peso adulto, cerca de 30 a 35 kg, e puberdade entre 6 e 14 meses. Fonte: [Engormix, cabras](https://www.engormix.com/ovinos/miscellaneous/crecimiento-cabras_f11081/) (snippet). Opinião de fórum: não usar como benchmark.
- Estudo turco de Saanen: 1ª cobertura aos 7,7 meses, com 28,9 kg; fêmeas adultas com 49,0 kg. Relação calculada pelo agente: 59%. Fonte: resultado de busca em openaccess.marmara.edu.tr (snippet; artigo [não verificado]).
- Estudo mexicano de Alpina e Saanen: cobertura de cabritas de 8–10 meses sem suplementação; peso na concepção de 23,5 kg (Alpina) e 24,8 kg (Saanen), sem diferença entre raças (p > 0,05). Peso adulto não reportado no trecho (snippet; artigo [não verificado]).
- Embrapa (ficha da raça Alpina, snippet): fêmeas adultas acima de 40 kg. Se aplicarmos 70%, o peso de cobertura seria cerca de 28 kg. Cálculo do agente; não consta na fonte [não verificado].
- Nordeste (Embrapa, puberdade de cabritos, Anglo-Nubiana e Saanen): 45–51% do peso adulto na puberdade (snippet). É puberdade em cabritos, não cobertura de cabritas; referência indireta.
- Idade ao início da produção no rebanho de Sobral: 18 meses (Araújo et al.; ver Questão 3).

**Fórmula (definição operacional)**
```
% peso adulto na cobertura = peso_vivo_na_cobertura / peso_médio_matrizes_adultas_do_rebanho x 100
Meta 70% (hipótese a validar): peso_cobertura >= 0,70 x peso_médio_matrizes_adultas_medido
```

### Inferences
- Com os dados disponíveis, a meta de 25 kg (Embrapa) e a de 70% do peso adulto coincidem quando a fêmea adulta pesa cerca de 36 kg. A meta de 70% deve ser testada com o peso adulto medido no próprio rebanho, e não com tabela de raça.
- A relação do estudo turco (59%) é a menor das referências encontradas. Se o SeabraApp adotar 70% como alerta, o alerta vai disparar para parte relevante dos animais; isso deve ser comunicado como hipótese de trabalho.
- O SeabraApp pode registrar peso na cobertura e peso de matrizes adultas para calcular a própria relação, e assim construir a referência do rebanho com o tempo.

### Gaps
- Metas de peso e idade por raça (Saanen, Alpina, Anglo-Nubiana, SRD) com fonte verificável: não encontradas.
- Pesos adultos de referência de cabras brasileiras (matrizes adultas): não verificados.
- Peso ao desmame e ganho diário de cabritas em sistemas brasileiros: não encontrados com fonte verificável.
- Metas por categoria para machos (bodes de reprodução e de recria): não localizadas.

---

## Questão 5. Benchmarks e referências: Embrapa, universidades, programas estaduais e federais, ICAR, IDELE e Espanha

### Takeaway
As fontes brasileiras mais úteis e acessíveis são a Embrapa Caprinos e Ovinos (Comunicados 74 de 2006 e 208 de 2022; capítulo de sistemas de 2016; Balde Cheio), o estudo CAPRAGENE de 2011 e o trabalho da UFV sobre higiene e qualidade. Programas de compra (PAA e programas estaduais de leite no Nordeste) moldam os sistemas. Internacionalmente: ICAR fixa intervalo médio de 30 dias entre controles (28–34), IDELE/Capgenes estrutura o núcleo francês de cerca de 600 criadores, e a Espanha tem controle leiteiro oficial para Murciano-Granadina. Não encontrei índices de fertilidade do IDELE, nem o protocolo de controle leiteiro espanhol.

### Cited Findings

**Brasil: Embrapa, universidades e programas**
- Embrapa Caprinos e Ovinos: Comunicado 74 (2006, modelo RN); Comunicado 208 (2022, CCS e composição, PB e PE); capítulo "Sistemas de Produção de Caprinos Leiteiros" (2016); Balde Cheio. Fontes lidas na Questão 1–4.
- Programa de Melhoramento Genético de Caprinos Leiteiros (CAPRAGENE), lançado em 2005 pela Embrapa Caprinos e Ovinos: "estruturação do arquivo zootécnico com implantação de um Serviço de Controle Leiteiro Oficial e pela realização de testes de progênie de reprodutores de raças leiteiras (Saanen) sob as condições de produção do Brasil". Fonte: [Perdigão et al. (2016)](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (lido).
- Programa de Aquisição de Alimentos (PAA), com incentivo estadual de PB e PE; a cota de R$ 4.500 por semestre (13 a 15 L/dia) e atraso de pagamento são citados. Fonte: [Perdigão et al. (2016)](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (lido). Em 2014, 2.450 produtores e 29.518 L/dia beneficiados nos cinco estados do Nordeste (PB 1.039; PE 834; RN 231; BA 206; CE 140). Mesma fonte, Tabela 4.
- Programa do Leite (RN): citado em Holanda Júnior et al. (2006) como programa estadual de leite de cabra. Nome do programa "Programa do Leite de Cabra" em outros estados [não verificado].
- UFV: Magalhães (higiene e qualidade do leite de cabra; IN 37; lido). Universidade Federal de Campina Grande (UFCG), co-autoria de Araújo no estudo de composição (Souza et al., 2022). UFRPE, UFPB, UFC, UFMG: sem buscas específicas nesta rodada.
- Estudo de composição de 4 raças exóticas no Brasil (Lôbo et al., 2017), citado em Souza et al. (2022): [DOI 10.1016/j.smallrumres.2017.05.005](https://doi.org/10.1016/j.smallrumres.2017.05.005). Não aberto.
- No mesmo estudo (citado), lactose média de 4,07% em amostras de Alpina, Saanen e Toggenburg (não aberto).

**Internacional: ICAR**
- ICAR (intervalo entre controles em caprinos, duas ordenhas por dia; paráfrase): o intervalo médio entre dois controles consecutivos de um rebanho é de 30 dias, com faixa de 28 a 34 dias. Fonte: [Evaluation of Different Test-Day Milk Recording Protocols by Wood's Model (Animals 2021; PMC8069443)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8069443) (lido, citando ICAR). O documento ICAR de caprinos (old.icar.org/wp-content/uploads/2015/09/Goat.pdf) não abriu por certificado; a informação vem do artigo MDPI.
- Resultado de busca: uma apresentação em francês cita 250 dias como período de referência para Alpina e Saanen e intervalos "normais" de 30 a 41 dias, com máximo de 75 dias [não verificado; origem não identificada].

**Internacional: IDELE / Capgenes (França)**
- Cerca de 1.500 explorações na seleção genética caprina (FranceAgriMer, 2025; snippet). Fonte: [GENETIQUE CAPRINS 2025](https://www.franceagrimer.fr/content/download/76617/document/GENETIQUE_CAPRINS_2025.pdf) (snippet; não aberto).
- Núcleo de seleção de cerca de 600 criadores e 175.000 fêmeas (Alpina e Saanen), citando revisão INRAE de 2022 (snippet). Fonte: [academie-agriculture.fr, 2025](https://www.academie-agriculture.fr/system/files_force/academiciens_ecrivent/2025/20250212thesegafsinicolas.pdf?download=1) (snippet).
- Testagem de progênie: cerca de 80 bodes por ano somando as duas raças; uso de IA de 34% no núcleo (Capgenes, snippet). Índices genômicos para jovens bodes distribuídos aos criadores (magazine Capgenes 2019, snippet).
- Índices de fertilidade ou de prolificidade do IDELE: não encontrados.

**Internacional: Espanha**
- Programa oficial de melhoramento de Murciano-Granadina, com dados de controle leiteiro oficial e classificação linear (capítulo de livro, snippet). Fonte: resultado de busca (snippet).
- Herdabilidades de 0,09 a 0,43 para características lineares e zoométricas (Animals, 2023). Fonte: [PMC10044043](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10044043/) (snippet).
- Análise de 315.663 registros de 122.883 animais (1990–2014) para pico e persistência, com REML multicaracterística (snippet; artigo [não verificado]).

**Itália (estudo de controle leiteiro)**
- Protocolos de controle para Wood: ver Questão 6.

**Status das fontes**
| Fonte | Status de leitura |
|---|---|
| Chapaval & Magalhães (2009) | Texto integral |
| Magalhães, UFV (hig_quali) | Texto integral |
| Souza et al. (2022), Comunicado 208 | Texto integral |
| Santos et al. (2011), CAPRAGENE | Texto integral |
| Holanda Júnior et al. (2006), Comunicado 74 | Trechos (tabela do modelo) |
| Perdigão et al. (2016), Sistemas de produção | Trechos (cerca de 400 linhas) |
| Balde Cheio (Embrapa) | Trechos |
| Araújo et al., longevidade Sobral | Texto (curto, com OCR) |
| Manejo de caprinos (Embrapa) | Trecho OCR |
| Pinheiro et al. (2001), CAE Ceará | Trechos |
| Lima et al., CAE Bahia | Trechos |
| FAMACHA comparativo (UFG) | Texto (HTML) |
| Van Wyk & Bath (2002) | Resumo (PubMed/Europe PMC); texto integral não aberto |
| MDPI Animals 2021 (Wood, test-day) | Texto integral |
| Saanen sérvio (Animals 2025) | Trechos (herdabilidades) |
| Murciano-Granadina, aborto (2026) | Trechos |
| Revisão CCS em cabras (2026) | Busca no texto |
| IN 37/2000 (texto oficial) | Não aberto (certificado) |
| ICAR goat guidelines | Não aberto (certificado) |
| UFPR, IN 37 | Não aberto (tempo esgotado) |

### Inferences
- A base brasileira de produção é amostral e de programas específicos (CAPRAGENE, PAA). Não há um censo de rebanhos com KPIs individuais publicado. Para o SeabraApp, a comparação com benchmarks deve ser feita com a média do programa e com a distribuição, e não com um valor fixo.
- O ICAR define controle a cada 30 dias como padrão. Um rebanho pequeno pode usar 4 controles por lactação, conforme a Questão 6.

### Gaps
- Protocolo ICAR de caprinos (versão atual) não aberto.
- Índices de fertilidade e prolificidade do IDELE: não encontrados.
- Protocolo espanhol de controle leiteiro caprino e papel do ICAR: não encontrados.
- Universidades UFRPE, UFPB, UFC e UFMG: sem busca específica.
- Índices zootécnicos da Embrapa (p. 75 do Anais) não estão no texto extraído.

---

## Questão 6. Ferramentas estatísticas para rebanho pequeno (N 20 a 1.000)

### Takeaway
Para rebanhos pequenos, as ferramentas de melhor relação custo-confiança são: (1) padronizar a lactação com Wood e poucos controles (quatro controles, nos meses 1, 2, 4 e 6, dão produção total de leite sem diferença significativa em relação aos 14 controles, em seis raças italianas); (2) comparar cada cabra com contemporâneas (estação de parto e ordem de parto); (3) usar intervalo de Wilson ou Agresti–Coull para taxas, e não o intervalo normal de Wald; (4) monitorar proporções com CUSUM; (5) estimar valores genéticos por modelo animal (BLUP) com herdabilidades fixadas da literatura e análise de sensibilidade. Em amostra pequena, o modelo de touro superestima a herdabilidade em comparação com o modelo animal (rebanho sérvio). Fórmulas de MPPA/ERPA para cabras não foram localizadas.

### Cited Findings

**Padronização da lactação (Wood e controles reduzidos)**
- Wood (1967): modelo gama incompleto para curva de lactação de vacas, com boa adequação; mais usado em várias espécies, incluindo cabras. [Wood (1967), Nature 216:164–165, DOI 10.1038/216164a0](https://doi.org/10.1038/216164a0) (DOI da lista de artigos da equipe; não re-checado nesta sessão).
- Estudo italiano (465 cabras, 6 raças, 210 dias, controles a cada 15 dias, 14 controles): R² do modelo de Wood para produção de leite de 0,92 a 0,96 no protocolo A (14 controles). Para Saanen, R² = 0,9605 (A), 0,9904 (B), 0,9467 (C). Fonte: [Animals 2021, 11(4):1058, PMC8069443](https://pmc.ncbi.nlm.nih.gov/articles/PMC8069443) (lido).
- Protocolos: A = 14 controles; B = controles nos meses 1, 2, 3 e 4; C = controles nos meses 1, 2, 4 e 6. Produção total de leite em 210 dias (kg), Saanen: A 572,73; ICAR 598,47 (n.s.); B 701,48 (p < 0,01); C 610,29 (n.s.); EPM 19,28. Red Mediterranean: A 208,12; ICAR 220,88 (n.s.); B 134,82 (p < 0,01); C 215,08 (n.s.). Fonte: mesma (lido, Tabela 3).
- Conclusão do artigo: para produção total de leite, o protocolo C e o método do ICAR não diferem do modelo com 14 controles; para FCM, gordura e proteína há diferenças em algumas raças (Tabela 3). O protocolo B superestima ou subestima conforme a raça. Fonte: mesma (lido).
- Intervalo entre controles do ICAR: 30 dias (28–34) para rebanhos com duas ordenhas. Fonte: mesma (lido, na introdução).
- Escalas: o Wood do artigo é ajustado a médias de raça e a animais individuais. Eq. 2 do artigo (forma do modelo) não extraída; forma padrão acima.

**Efeitos fixos e comparação com contemporâneas**
- Serbia (Saanen, 670 cabras, 2.155 lactações, 2010–2021, uma fazenda): a estação de parto não teve efeito significativo sobre o teor de gordura e de proteína do leite, o que o artigo atribui ao manejo intensivo controlado (paráfrase). Fonte: [Genetic Evaluation of Milk Production Traits in the Serbian Saanen Goat Population, Animals 2025, DOI 10.3390/ani15203008](https://doi.org/10.3390/ani15203008) (trechos lidos; PMC12560933).
- Modelo de herdabilidade do estudo sérvio incluiu efeitos como estação de parto, ano, ordem de parto e idade (trechos). Detalhes dos efeitos não extraídos completamente [não verificado].
- A definição de contemporâneas (estação × ordem × ano) é a prática usual; tamanho mínimo de grupo contemporâneo não encontrado nas fontes lidas [não verificado].

**Herdabilidades e BLUP em rebanho único (valores de literatura)**
- Serbia, Saanen (2.155 lactações), modelo animal: herdabilidade de produção total de leite 0,2216; gordura 0,2564; proteína 0,2556; teor de gordura 0,3977; teor de proteína 0,2864. Modelo de touro: 0,2742 (produção total), 0,3256 (gordura), 0,3855 (proteína). O artigo atribui a diferença a viés do modelo de touro, que o modelo animal reduz por controlar melhor os efeitos fixos e aleatórios (paráfrase). Revisão citada no artigo: produção total 0,13, gordura 0,19, proteína 0,14, teor de gordura 0,36, teor de proteína 0,33; um estudo chegou a 0,64 para teor de proteína. Fonte: [Animals 2025](https://doi.org/10.3390/ani15203008) (trechos lidos).
- Abortos (Murciano-Granadina): herdabilidades 0,25, 0,11 e 0,19 por ordem de parto, modelo bayesiano com limiar. Fonte: [Vet. Anim. Sci. 2026](https://doi.org/10.1016/j.vas.2026.100673) (trechos lidos).
- CCS: componente genético baixo a moderado (revisão 2026, sem número no trecho lido). Fonte: [DOI 10.1186/s13028-026-00880-7](https://doi.org/10.1186/s13028-026-00880-7).
- Equações de modelo misto (Henderson, 1975), [DOI 10.2307/2529430](https://doi.org/10.2307/2529430); Quaas & Pollak (1980), [DOI 10.2527/jas1981.5161277x](https://doi.org/10.2527/jas1981.5161277x) (lista da equipe; não re-checados).
- Conectividade entre rebanhos sob modelo animal: Kennedy & Trus (1993), [DOI 10.2527/1993.7192341x](https://doi.org/10.2527/1993.7192341x) (lista da equipe; não re-checado).

**Intervalo de confiança para taxas com poucos animais**
- Wilson (1927): [DOI 10.1080/01621459.1927.10502953](https://doi.org/10.1080/01621459.1927.10502953) (Crossref verificado nesta sessão).
- Newcombe (1998), "Two-sided confidence intervals for the single proportion: comparison of seven methods", Statistics in Medicine: [DOI 10.1002/(SICI)1097-0258(19980430)17:8<857::AID-SIM777>3.0.CO;2-E](https://doi.org/10.1002/(SICI)1097-0258(19980430)17:8%3C857::AID-SIM777%3E3.0.CO;2-E) (Crossref verificado; título e metadados lidos, conclusões não lidas).
- Agresti & Coull (1998), "Approximate Is Better than 'Exact' for Interval Estimation of Binomial Proportions", The American Statistician: [DOI 10.2307/2685469](https://doi.org/10.2307/2685469) (Crossref verificado).

Fórmulas (definições e fórmulas padrão):
```
Wald:             p +- z x sqrt( p(1-p) / n )                       (não recomendado para n pequeno)
Wilson:           centro = (p + z^2/(2n)) / (1 + z^2/n)
                  meia_largura = z x sqrt( p(1-p)/n + z^2/(4n^2) ) / (1 + z^2/n)
Agresti-Coull:    p~ = (x + z^2/2) / (n + z^2);  IC = p~ +- z x sqrt( p~(1-p~) / (n + z^2) )
z = 1,96 (95%)
```

Exemplos calculados nesta sessão (z = 1,96; contas conferidas com Python):

| x / n | p | Wald (normal) | Wilson | Agresti–Coull |
|---|---|---|---|---|
| 6 / 30 | 20,0% | 5,7–34,3% | 9,5–37,3% | 9,1–37,7% |
| 3 / 30 | 10,0% | −0,7–20,7% | 3,5–25,6% | 2,7–26,4% |
| 2 / 10 | 20,0% | −4,8–44,8% | 5,7–51,0% | 4,6–52,1% |
| 0 / 20 | 0,0% | 0,0–0,0% | 0,0–16,1% | −2,9–19,0% (cortado em 0) |
| 40 / 4.019 | 1,0% | 0,7–1,3% | 0,7–1,4% | 0,7–1,4% |
| 218 / 532 | 41,0% | 36,8–45,2% | 36,9–45,2% | 36,9–45,2% |

**Controle estatístico (CUSUM)**
- Page (1954), "Continuous Inspection Schemes", Biometrika: [DOI 10.2307/2333009](https://doi.org/10.2307/2333009) (Crossref verificado).
- Forma de CUSUM para proporção ou média: S_t = max(0; S_(t-1) + (x_t − μ0 − k)); sinal quando S_t > h. Com k = metade da mudança-alvo e h de 4 a 5 desvios-padrão (usado pela equipe em notas de bovinos; origem e valores específicos para cabras não encontrados). [não verificado para cabras]
- Gráfico p para proporção: LC/LSC = p̄ ± 3·sqrt( p̄(1−p̄)/n ) (padrão de controle de qualidade; livro de Montgomery, não aberto) [não verificado nesta sessão].

**Índice combinado (própria produção e EBV do pai)**
- Fórmula de índice (definição operacional): I = b1·Ŷ_própria + b2·(EBV_pai/2), com pesos b derivados do BLUP ou da teoria do índice de seleção de Hazel (1943; PMC1209225, referência da equipe; não aberto nesta sessão).
- Uso do EBV de touro com confiabilidade baixa: o peso deve refletir a confiabilidade; fórmula específica para cabras não encontrada.

**MPPA e ERPA (produção esperada do animal)**
- Não localizei fórmula de MPPA ou ERPA para cabras de leite. A equipe também não encontrou fórmula para leite de bovinos (ver nota da sessão de bovinos). [não verificado]
- Repetibilidade e confiabilidade de média de n registros (fórmula clássica, Falconer & Mackay; livro, sem DOI verificado): rel = n·r / (1 + (n−1)·r), em que r é a repetibilidade. [não verificado nesta sessão]

**Metas por categoria**
- Recria: peso de cobertura (ver Questão 4); idade ao primeiro parto de 18 meses (Sobral).
- Primíparas e adultas: produção no pico em 4 a 8 anos; declínio após a 6ª lactação (Araújo et al., Sobral).
- Reprodutores: sem metas verificadas.

### Inferences
- A combinação mais estável para rebanho de 20 a 100 cabras é: controles nos meses 1, 2, 4 e 6 (protocolo C), ajuste de Wood, comparação com contemporâneas de estação e ordem, e intervalo de Wilson para taxas.
- Para herdabilidades fixas, o SeabraApp deve usar uma faixa (por exemplo, 0,13 a 0,27 para produção de leite) e reportar o valor genético com a sensibilidade a essa faixa, porque os valores lidos variam de 0,13 a 0,27. Não encontrei estimativa para rebanho brasileiro pequeno.
- O CUSUM é mais adequado que o gráfico de Shewhart para proporções de baixa frequência (mastite, aborto), mas os limiares precisam ser calibrados com dados do próprio rebanho.
- Um rebanho de 30 cabras gera poucos registros por ano. Estimativas de BLUP em rebanho único com esse tamanho são instáveis; a mesma base deve ser combinada com dados de outros rebanhos (programa de controle leiteiro oficial).

### Gaps
- Fórmulas de MPPA/ERPA para cabras: não encontradas.
- Repetibilidade de produção de leite de cabra: sem valor verificado.
- Tamanho mínimo de grupo contemporâneo para cabras: não encontrado.
- Limiares de CUSUM para CCS ou mastite em cabras: não encontrados.
- Conclusões de Newcombe (1998) e texto de Agresti & Coull (1998) não lidos.
- Texto de Montgomery e de Falconer & Mackay não abertos (livros).

---

## Questão 7. Conexão do rebanho pequeno com a avaliação genética nacional e controle de consanguinidade

### Takeaway
No Brasil, o programa nacional de melhoramento de caprinos leiteiros é o CAPRAGENE (Embrapa, 2005), com controle leiteiro oficial e teste de progênie de reprodutores Saanen. Rebanho pequeno entra por controle leiteiro e por IA ou uso de reprodutor testado. Na França, a seleção envolve cerca de 1.500 explorações e um núcleo de cerca de 600 criadores; a Espanha tem controle leiteiro oficial para Murciano-Granadina. Para consanguinidade em rebanho fechado, as fórmulas são padrão (Ne, ΔF e matriz A), mas não encontrei estimativas de F em rebanhos caprinos brasileiros.

### Cited Findings
- CAPRAGENE (Embrapa, 2005): "Serviço de Controle Leiteiro Oficial" e "testes de progênie de reprodutores de raças leiteiras (Saanen)". Fonte: [Perdigão et al. (2016)](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1064921/1/CNPC2016Sistemasdeproducao.pdf) (lido).
- Dificuldade de "compartilhamento de recursos genéticos, que retardam o desenvolvimento da cadeia nas duas regiões" (Nordeste e Sudeste). Fonte: mesma (lido).
- Facó, Lôbo & Gouveia (2011), "Breeding plan for commercial dairy goat production systems in southern Brazil", Small Ruminant Research 98:164–169: [DOI 10.1016/j.smallrumres.2011.03.034](https://doi.org/10.1016/j.smallrumres.2011.03.034) (Crossref verificado; conteúdo não lido). Relevante para sistemas comerciais.
- Consanguinidade (definições): Ne = 4·Nm·Nf / (Nm + Nf); ΔF = 1/(2·Ne). Fórmulas padrão de Falconer & Mackay (livro, sem DOI verificado) [não verificado nesta sessão].
- A⁻¹ com endogamia (Quaas, 1976): d_i = 0,5 − 0,25·(F_pai + F_mãe). [DOI 10.2307/2529279](https://doi.org/10.2307/2529279) (lista da equipe; não re-checado).
- Matriz de parentesco e A⁻¹ (Henderson, 1976): [DOI 10.2307/2529339](https://doi.org/10.2307/2529339) (lista da equipe; não re-checado).
- França: cerca de 1.500 explorações (FranceAgriMer, 2025, snippet); núcleo de cerca de 600 criadores e 175.000 fêmeas; testagem de progênie de 80 bodes por ano somando as duas raças; IA de 34% no núcleo (Capgenes, snippet). Índices genômicos para jovens bodes (Capgenes 2019, snippet).
- Espanha: controle leiteiro oficial e classificação linear para Murciano-Granadina; herdabilidades 0,09–0,43 para características lineares (Animals, 2023; PMC10044043, snippet).
- Itália: em rebanho de conservação, o mesmo modelo de Wood foi aplicado a 6 raças com 465 cabras (ver Questão 6).
- Uso de IA e de bodes entre rebanhos: sem regra verificada no Brasil nas fontes lidas.

### Inferences
- Para um rebanho de 20 a 100 cabras, a conexão mais direta com a avaliação nacional é entrar no controle leiteiro oficial. Sem registro de produção individual não há EBV próprio, e a escolha de reprodutores fica sem informação genética.
- Em rebanho fechado, o controle de consanguinidade precisa de genealogia completa. Com N pequeno, Ne fica baixo (por exemplo, 4 × 2 × 20 / (2 + 20) ≈ 7,3 para 2 bodes e 20 matrizes, usando a fórmula acima), e ΔF por geração é grande. A rotação de bodes ou o uso de reprodutores de outros rebanhos reduz ΔF, mas o efeito quantitativo precisa de simulação com o pedigree do rebanho.
- Para o SeabraApp, a matriz A e o coeficiente de endogamia são calculáveis a partir do pedigree disponível; a precisão depende da completude da genealogia.

### Gaps
- Regras de intercâmbio de bodes entre rebanhos e de IA no Brasil (CAPRAGENE ou associação): não encontradas.
- Estimativas de consanguinidade (F) e de Ne em rebanhos caprinos brasileiros: não encontradas.
- Protocolo ICAR de caprinos: não aberto.
- Texto de Facó et al. (2011): não lido.
- Metas de reprodutores (bodes): não encontradas.

---

## Lacunas gerais e próximos passos sugeridos
- Abrir o texto oficial da IN 37/2000 por outra via (Diário Oficial da União ou gov.br) e confirmar limites de gordura e CBT.
- Abrir o protocolo ICAR de caprinos (controle leiteiro) em outro host, se disponível.
- Buscar UFRPE, UFPB, UFC e UFMG (sistemas, reprodução, CAE e mastite) e os índices zootécnicos da Embrapa (p. 75 do Anais).
- Buscar fórmulas de MPPA/ERPA e repetibilidade para cabras.
- Coletar pedidos de dados de rebanhos (N pequeno) para calibrar herdabilidades e limiares de CUSUM.
