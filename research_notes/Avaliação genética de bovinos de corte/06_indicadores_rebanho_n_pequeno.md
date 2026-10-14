# Indicadores zootécnicos e métodos estatísticos para rebanhos de corte de pequeno e médio porte (100 a 5.000 vacas)

**Escopo e status das fontes.** Notas para um analista que vai escrever exemplos trabalhados para uma única fazenda. Cobrem (a) KPIs de cria, recria e terminação com fórmulas e benchmarks, e (b) métodos estatísticos que dão conclusões genéticas e de desempenho confiáveis com N pequeno.

- A pesquisa foi feita só com WebSearch. WebFetch e HTTP estavam indisponíveis, então **nenhum texto integral foi lido**. Tudo que está aqui vem de títulos, metadados e trechos de busca. Os graus de confirmação aparecem entre parênteses: "trecho de busca, não lido", "fonte secundária", "registro bibliográfico".
- Quando o trecho de busca não permitiu confirmar a URL exata de uma afirmação, a URL aparece como **[URL candidata]** e a atribuição como "a confirmar". Quando nenhuma URL foi identificada, aparece **[URL não identificada]**.
- Fórmulas marcadas **[def.]** são definições de trabalho do redator, sem fonte consultada. Conhecimento de fundo sem fonte aparece como **[não verificado]**.
- Os benchmarks brasileiros encontrados são em geral antigos (2001 a 2012) e regionais. Não encontrei benchmark nacional atual publicado.
- A busca usou 18 consultas, acima do limite de cerca de 15 do protocolo, por causa do escopo amplo. Os itens não cobertos estão em "Gaps" de cada seção.

---

## 1. KPIs de cria, recria e terminação: fórmulas e benchmarks

### Takeaway
Não há benchmark nacional brasileiro atual e publicado para os KPIs de cria. As referências utilizáveis são as metas de manejo reprodutivo da Embrapa (IEP até 365 dias, concepção até 90 dias pós-parto), estudos regionais de Nelore em pasto (prenhez de 70,7% no rebanho do oeste do Pará; 69% em primíparas e cerca de 90% em vacas de 5ª a 8ª ordem no Cerrado, ou seja, variação grande por ordem de parto) e benchmarks norte-americanos e canadenses, que refletem sistemas e registros diferentes. Para um rebanho de 100 a 5.000 vacas, a comparação mais informativa é a série histórica do próprio rebanho.

### Cited Findings

#### 1.1 Fórmulas (definições de trabalho)
- Taxa de prenhez (%) = fêmeas prenhes ao diagnóstico ÷ fêmeas expostas × 100 **[def.]**.
- Taxa de natalidade ou parição (%) = bezerros nascidos ÷ fêmeas expostas × 100 **[def.]**. Há variantes de denominador; o analista deve declarar qual usa.
- Taxa de desmama (%) = bezerros desmamados ÷ matrizes expostas à reprodução × 100. Um texto comercial separa desmama de prenhez e usa esta definição em simulações, com percentuais de 65% a 90% que são premissas de comparação, não médias nacionais ([Compre Rural, simulação de fazenda de cria com 1.000 matrizes](https://comprerural.com/quanto-ganha-uma-fazenda-de-cria-com-1-000-matrizes-nelore/); trecho de busca, não lido).
- Mortalidade de bezerros: o CHAPS usa dois denominadores, vacas expostas (3,2%) e bezerros nascidos (3,4%) ([NDSU, CHAPS Benchmarks](https://ndsu.edu/chaps/benchmarks); resumo de busca). O analista deve declarar qual usa.
- IEP (dias) = média dos intervalos entre partos consecutivos **[def.]**. Um trecho de busca diz que o IEP tende a superestimar a eficiência reprodutiva, porque só entram vacas com pelo menos dois partos ([fonte do trecho não identificada]). Confirmar antes de usar.
- Período de serviço (PS, dias) = parto à nova concepção **[def.]**.
- Kg de bezerro desmamado por vaca exposta = soma dos pesos à desmama ÷ vacas expostas **[def.]**. Kg desmamados por hectare = kg desmamados totais ÷ hectares de pasto de cria **[def.]**.
- P205 = peso ajustado a 205 dias, com correção por idade do bezerro, sexo e idade da mãe **[def.; ver BIF em 2.1]**.
- GMD (kg/dia) = (peso final − peso inicial) ÷ dias **[def.]**.
- Ganho por hectare = GMD × dias × animais ÷ hectares **[def.]**. UA = 450 kg de peso vivo, então UA/ha = soma de (PV ÷ 450) ÷ hectares **[def.]**. A equivalência de 450 kg aparece em uma revisão citada em busca ([URL não identificada]).
- Eficiência materna = peso do bezerro à desmama ÷ (peso da vaca)^0,75 **[def., fórmula do enunciado]**. A dissertação da UFV usou exatamente peso metabólico = PV^0,75, por ser mais associado à eficiência que o peso vivo ([UFV, Winkler, dissertação sobre peso do bezerro e peso metabólico da vaca em Nelore](https://locus.ufv.br//handle/123456789/27156); trecho de busca, não lido).
- Rendimento de carcaça (%) = peso de carcaça quente ÷ peso vivo ao abate × 100 **[def.]**.

#### 1.2 Benchmarks reprodutivos e de desmame

| Indicador | Valor(es) encontrado(s) | Contexto | Fonte |
|---|---|---|---|
| IEP (meta) | máximo de 365 dias; exige concepção até 90 dias pós-parto | Manejo reprodutivo, capítulo da Embrapa; contexto corte ou leite não confirmado | [Embrapa, Manejo reprodutivo, cap. 12](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf) |
| Concepção pós-parto | janela de 80 a 85 dias citada em revisão; 90 dias na meta da Embrapa | Revisão não identificada | [Embrapa, cap. 12](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf); revisão [URL não identificada] |
| Taxa de concepção na 1ª IA (meta) | acima de 60% | Mesmo capítulo | [Embrapa, cap. 12](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf) |
| Aborto (meta) | abaixo de 3% | Mesmo capítulo | [Embrapa, cap. 12](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1126179/1/cpafro-18465.pdf) |
| IEP observado, Nelore em pasto, Cerrado | 392 dias em primíparas (o maior IEP do estudo) | 468 fêmeas Nelore em *Brachiaria decumbens*; ano do estudo não confirmado | [RBZ, Fatores determinantes do desempenho reprodutivo de vacas Nelore no Brasil Central](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt) |
| Prenhez, Nelore em pasto, Cerrado | 69% em primíparas; cerca de 90% entre a 5ª e a 8ª ordem de parto | Mesmo estudo | [RBZ, mesmo link](https://www.scielo.br/j/rbz/a/9hwHMbJctNpgjpQBT5tZ84G/?lang=pt) |
| Rebanho Nelore PO, oeste do Pará | IEP 510 dias; PS 224 dias; prenhez 70,7% | Os autores dizem que IEP e PS foram maiores que os relatados para Nelore na Amazônia | [Eficiência reprodutiva e enfermidades reprodutivas em rebanho Nelore PO, oeste do Pará](https://www.journals.ufrpe.br/index.php/medicinaveterinaria/article/view/2618) |
| Prenhez de primíparas | 25% (primíparas) contra 62% (multíparas) em uma propriedade; outro trabalho cita 45,5% em primíparas Nelore | Propriedade única; outro trabalho [URL não identificada] | [URL candidata: repositório Univar](https://repositorio.univar.edu.br/wp-content/uploads/tainacan-items/3353/15039/1826612004574386_ROANNY-.pdf); trecho de busca, não lido |
| Prenhez em IATF, touros | um touro com 28,6% de prenhez contra 41% a 45% dos demais | Cartilha de IATF em Nelore no Pantanal, 2011 (ano segundo o resumo) | [Embrapa, CT 97, IATF em Nelore no Pantanal de MS](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/888399/1/CT97.pdf) |
| Detecção de cio (visual e buçal) | eficácia de 55% a 60% dos animais em cio | Mesma cartilha | [Embrapa, CT 97](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/888399/1/CT97.pdf) |
| Idade ao primeiro parto (IPP), novilhas | cerca de 38,8 meses (desvio 5,5); herdabilidade 0,42 | 8.348 novilhas nascidas entre 1975 e 2003, Mato Grosso do Sul | [URL candidata: repositório UNESP](https://repositorio.unesp.br/handle/11449/4697) (SBZ, 2011, segundo o resumo) |
| IPP, novilhas | cerca de 40 meses (1.234 dias); herdabilidade 0,35 | Rebanho controlado de 1964 a 1984, Rio de Janeiro | [URL candidata: RBCV, UFF](https://periodicos.uff.br/rbcv/article/download/7338/5622) (ano de 1995 segundo o resumo) |
| Desmama por vaca exposta, RS | 80 a 90 kg; metas de 200 a 210 kg | Relato de veterinário de consultoria (Tortuga DSM) | [URL candidata: Compre Rural, criadores do RS](https://comprerural.com/criadores-do-rs-buscam-aumento-de-120-em-kg-de-terneiros-desmamados-por-vaca/); trecho de busca, não lido |
| Desmama por vaca exposta, meta | cerca de 160 kg | Artigo técnico, data não confirmada | [Compre Rural, URL não identificada] |
| Razão bezerro/vaca (kg por kg × 1000), Nelore selecionado | 249,0 a 255,8 aos 120 dias; 362,9 a 374,6 aos 210 dias | Rebanhos Nelore selecionados para peso pós-desmama, UNESP Sertãozinho; o resumo não diz se a vaca foi convertida para peso metabólico | [URL candidata: repositório UNESP](https://acervodigital.unesp.br/handle/11449/4711); trecho de busca, não lido |
| Desmama, EUA (CHAPS 2022, 52.313 vacas expostas entre 2017 e 2021) | prenhez 94,3%; perda de gestação 0,77%; mortalidade de bezerros 3,2% das vacas expostas (3,4% dos nascidos); desmama 91,4% | Rebanhos norte-americanos | [NDSU, CHAPS Benchmarks](https://ndsu.edu/chaps/benchmarks); [PDF de 2022, candidato](https://workspaces.ndsu.edu/fileadmin/chaps/Benchmarks2022-ltr.pdf) |
| Desmama, EUA, referência histórica (1994, NCA-IRM-SPA) | mortalidade de bezerros 3,1%; desmama 90,5% | Dado antigo, útil só como contexto | [NDSU, NCA-IRM-SPA 1994](https://www.ag.ndsu.edu/dickinsonrec/archive/annual-reports-1/1994-annual-report/nca-irm-spa-cow-calf-enterprise-summary-of-reprodu.pdf) |
| Perda de bezerros, Canadá (médias de vários anos) | nascimento a 24 h: 2,1% (vacas), 3,6% (novilhas); 24 h a desmama: 2,5% (vacas), 2,9% (novilhas) | Rebanho com registros de vários anos | [Producer, benchmark de perdas de bezerros](https://www.producer.com/livestock/benchmark-data-helps-producers-manage-calf-losses); [PMC6662034](https://pmc.ncbi.nlm.nih.gov/articles/PMC6662034) |
| Metas do 25º percentil, Canadá | não prenhez abaixo de 5%; perda nascimento a 24 h abaixo de 1%; perda 24 h a desmama abaixo de 2% (vacas) ou 1% (novilhas) | Mesmo estudo | [PMC6662034](https://pmc.ncbi.nlm.nih.gov/articles/PMC6662034) |
| Desmama (meta mínima) | 85% ou mais | Extensão de Iowa (2022) | [Iowa Cattleman, out. 2022](https://lsc-pagepro.mydigitalpublication.com/article/Vet%E2%80%99s+View/4351552/762601/article.html) |
| Mortalidade de bezerros (ideal) | abaixo de 3% ao ano | Artigo de divulgação | [Farms.com](https://www.farms.com/news/how-to-evaluate-animal-performance-in-the-cow-calf-herd-186433.aspx) |
| Mortalidade de bezerros (regional) | 5% | Calculadora de indicadores (Canadá) | [BeefResearch.ca](https://www.beefresearch.ca/tools/cow-calf-production-indicators-calculator/) |

#### 1.3 Peso, eficiência e lotação

| Indicador | Valor(es) encontrado(s) | Contexto | Fonte |
|---|---|---|---|
| Razão peso do bezerro / peso da vaca | herdabilidade da razão 0,31 (EP 0,03), a partir de 4.242 pares à desmama | Dissertação UFV (2019, segundo o resumo); Nelore a pasto | [UFV, handle 123456789/27156](https://locus.ufv.br//handle/123456789/27156) |
| Pasto Xaraés, altura de 30 cm | GMD 760 g/dia em 370 dias; 2,8 UA/ha; 1.170 kg/ha | Atribuído à Embrapa Gado de Corte; a página é do governo de Mato Grosso do Sul, não o relatório original | [SEMADESC-MS](https://www.semadesc.ms.gov.br/?p=16979); trecho de busca, não lido |
| Pasto Xaraés, altura de 15 cm | GMD 450 g/dia; 3,4 UA/ha; 1.030 kg/ha | Mesma fonte | [SEMADESC-MS](https://www.semadesc.ms.gov.br/?p=16979) |
| Braquiária consorciada com estilosantes, Cerrado | 435, 371 e 308 g/animal/dia com 0,8, 1,2 e 1,6 UA/ha; ganho por área sem diferença significativa; faixa adequada de 1,25 a 1,30 UA/ha | Atribuição à Embrapa Gado de Corte a confirmar; o link é de repositório da UFV | [URL candidata: UFV, locus](https://locus.ufv.br/items/95b9c824-c89a-4775-8c40-80736a792c14/full); trecho de busca, não lido |
| Brachiaria brizantha, Cerrado, recria e engorda | lotação de 1,02 a 1,55 cab/ha; Xaraés com 221 kg PV/ha | Ensaio da Embrapa Cerrados; ano e fonte exata não identificados | [URL não identificada] |
| Marandu com novilhas e suplementação | oferta de 5 kg MS/100 kg PV dá maior ganho por hectare (3,35 UA/ha); 10 kg dá melhor desempenho animal | Ensaio com suplementação | [URL não identificada] |
| Produtividade média nacional de cria e recria | cerca de 120 kg de PV/ha/ano; manejo adequado com forrageiras tropicais costuma passar de 1 UA/ha | Afirmação de revisão | [URL não identificada] |

#### 1.4 Cuidados de interpretação
- Um estudo antigo (Embrapa Pantanal, 2001) relatou natalidade de 81,5% em desmama antecipada com suplementação, contra 13,1% sem suplementação e desmama tardia. A diferença é tão grande que o estudo não serve de benchmark. Fonte: [URL candidata, Pesquisa Agropecuária Brasileira, a confirmar](https://seer.sct.embrapa.br/index.php/pab/article/download/5531/2722); trecho de busca, não lido.
- Um estudo de Nelore de 2012 da UFU avaliou taxas de fertilidade, natalidade, mortalidade e desmama em 2003 a 2006, mas os valores não aparecem no trecho recuperado ([UFU, rebanho Nelore de cria, URL não identificada]).
- O artigo "Uma fazenda de cria com 1.000 matrizes" usa premissas de simulação; não é dado observado.
- Um resultado de busca atribuiu à Scot Consultoria uma medida de "kg de bezerro desmamado por vaca exposta". Não encontrei essa medida em fonte pública. As menções à Scot tratam de preço do bezerro, como R$ 2.000 para bezerro desmamado de 6@ em São Paulo ([URL não identificada]).

### Inferences
- Com 100 vacas, o erro-padrão binomial de uma taxa de prenhez de 85% é de cerca de 3,6 pontos percentuais, e o IC de 95% fica em torno de ±7 pontos (cálculo do redator: √(0,85 × 0,15 / 100)). Uma queda de 5 pontos de um ano para o outro não é detectável com segurança num rebanho desse tamanho. Use três a cinco safras antes de tirar conclusões (ver seção 6).
- A taxa de prenhez de um rebanho mistura desempenho reprodutivo e eficiência de detecção de cio. Como a detecção visual acerta só 55% a 60% dos animais em cio, o método de detecção precisa ser registrado junto com o KPI.
- Primíparas e multíparas devem ser reportadas separadamente, porque a diferença de prenhez (por exemplo, 25% contra 62% num rebanho) pode esconder o desempenho do restante do rebanho.
- Os benchmarks norte-americanos e canadenses não são diretamente comparáveis com o Brasil, por causa de época de estação de monta, idade de desmama e tipo de vaca. Para o Brasil, use faixas regionais como referência e o histórico do próprio rebanho como meta.
- A definição de "desmama" (sobre vacas expostas ou sobre bezerros nascidos) muda o valor em vários pontos. Qualquer comparação exige a mesma definição.

### Gaps
- GMD pré-desmama e pós-desmama em benchmarks brasileiros: não pesquisado nesta rodada.
- Escore de condição corporal (escala e metas para vaca de cria no Brasil): não pesquisado. O único dado é que a condição corporal à desmama se associa à prenhez (estudo do Cerrado, acima).
- P205, P210 e P240 em quilos, com benchmarks brasileiros: não encontrados. Só há herdabilidades (seção 2).
- Rendimento de carcaça e idade ao abate, em benchmarks brasileiros e internacionais: não pesquisado.
- Benchmarks de mortalidade de bezerros no Brasil (nacional ou por região): não encontrados.
- Benchmarks de Inttegra, Rehagro e outras consultorias brasileiras: não encontrados.
- Metas atuais da Embrapa Gado de Corte (publicações pós-2015): não encontradas. A busca retornou material antigo.
- Há um PDF da Embrapa sobre taxa de lotação ([Embrapa, Taxa de lotação](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/570325/1/Taxa-de-lotacao.pdf)), que apareceu na busca mas não foi lido. A unidade da Embrapa responsável não foi confirmada.

---

## 2. Ferramentas genéticas intra-rebanho (razão BIF, MPPA, repetibilidade, BLUP intra-rebanho) e conectividade

### Takeaway
A razão BIF (registro ÷ média do grupo contemporâneo × 100) e o MPPA (média do rebanho + [n·r / (1 + (n−1)·r)] × (média da vaca − média do rebanho)) são ferramentas de ranking dentro do rebanho que funcionam com N pequeno, desde que o grupo contemporâneo seja bem definido e a repetibilidade seja fixada por literatura. Para o Nelore, a literatura dá herdabilidade direta do peso à desmama em torno de 0,2 a 0,35 e um efeito materno importante. Conectividade é o critério para comparar rebanhos entre si: um rebanho que usa só touros próprios pode ficar isolado.

### Cited Findings

#### 2.1 Razão BIF e desvios
- Desvio = registro individual − média do grupo contemporâneo; os desvios somam zero dentro de cada grupo. A razão é expressa em relação à média do grupo, com 100 como média ([BIF Guidelines Wiki, Glossary](https://guidelines.beefimprovement.org/index.php/Glossary); trecho de busca, não lido).
- A razão ajustada ao peso à desmama mostra o desvio percentual de cada animal em relação à média dos contemporâneos e serve para ranquear animais dentro de cada sexo ([BIF Guidelines, 9ª ed., 2016](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf); seção 2-9, trecho de busca).
- Grupos contemporâneos: mesma composição racial e sexo, idades semelhantes e mesmo manejo (BIF 9ª ed., seção 2-6). Razões só devem ser calculadas dentro de grupos da mesma raça e idade semelhante (seção 4-23). Efeitos não genéticos, como idade da mãe e sexo do bezerro, devem ser ajustados antes do cálculo (seções 5-8 e 5-9). O grupo deve ter tantos animais quanto possível para permitir comparação precisa (seção 1-4).
- Efeito de seleção: se só a metade superior dos bezerros é reportada, a média do grupo sobe e a razão do bezerro mais pesado cai para 110 (exemplo da BIF 9ª ed., seções 4-5 e 4-7).
- Bezerros devem ser desmamados e pesados no mesmo dia ([BIF Guidelines Wiki, Weaning Weight](https://guidelines.beefimprovement.org/index.php/Weaning_Weight); trecho de busca). Se a faixa de idade passa de 90 dias, usar duas ou mais datas de pesagem (BIF 9ª ed.; trecho de busca).
- Exemplo do redator: bezerro de 230 kg num grupo com média de 210 kg tem razão de 230 ÷ 210 × 100 = 109,5 **[cálculo do redator]**.

#### 2.2 MPPA (Most Probable Producing Ability)
- Definição: estimativa da superioridade futura de uma vaca para uma característica repetível, como o peso de progênies à desmama. Serve para ranquear vacas dentro do rebanho levando em conta o número de crias ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa); fonte comercial, trecho de busca; a definição é atribuída à BIF no resumo, não lido).
- Fórmula: MPPA = média do rebanho + [n·r / (1 + (n−1)·r)] × (média da vaca − média do rebanho). Mesma forma do enunciado ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa); trecho de busca). A origem é atribuída a Lush (1945) por fonte secundária **[não verificado]**.
- O fator de encolhimento (shrinkage) puxa a estimativa para a média do rebanho quando o número de crias é pequeno ou a repetibilidade é baixa ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa); trecho de busca).
- O MPPA inclui efeitos genéticos e de ambiente permanente. Usar registros de vários partos reduz o efeito de ambiente temporário ([CattleMax, MPPA](https://help.cattlemax.com/article/537-mppa); trecho de busca).
- Um estudo com vacas Bali mostrou que as dez melhores matrizes mudam conforme a característica: peso à desmama, peso ao sobreano e intervalo entre partos dão rankings diferentes ([ResearchGate, MPPA de vacas Bali, URL candidata](https://www.researchgate.net/publication/322396142_Most_Probable_Producing_Ability_of_Bali_Cows_for_Calving_Interval_and_Calf_Growth_Performance); trecho de busca, não lido).
- Exemplo do redator: média do rebanho 200 kg, média da vaca 230 kg, n = 4 crias, r = 0,25. Fator = (4 × 0,25) / (1 + 3 × 0,25) = 1 / 1,75 = 0,571. MPPA = 200 + 0,571 × 30 = 217,1 kg **[cálculo do redator]**.
- Uso em associação: o Brahman Maternal Merit exige MPPA de 101 ou mais, e o nível superior exige MPPA de 105 com quatro crias desmamadas ([Brahman Association, Genetic Merit Awards](https://brahman.org/genetics/genetic-merit-awards/); critério de uma associação, trecho de busca).

#### 2.3 Repetibilidade e variâncias de referência (Nelore e Brasil)
- Peso à desmama em Nelore, Norte do Brasil: herdabilidades de 0,22 (uni) e 0,31 (multi) aos 120 dias; 0,20 e 0,34 aos 210 dias; 0,51 aos 365 dias; 0,49 aos 450 dias ([academia.edu, Genetic parameters and trends of growth traits in Nelore cattle raised in the Northern region of Brazil](https://www.academia.edu/146738725/Genetic_parameters_and_trends_of_growth_traits_in_Nelore_cattle_raised_in_the_Northern_region_of_Brazil); trecho de busca, não lido).
- Análise bayesiana com cerca de 134 mil animais Nelore nascidos entre 1995 e 2019: herdabilidade de 0,33 aos 205 dias, 0,51 aos 365 dias e 0,41 aos 550 dias ([URL candidata: PMC13469195, Genetic evaluation of growth and reproductive traits in Nelore cattle under humid tropical conditions](https://pmc.ncbi.nlm.nih.gov/articles/PMC13469195/); atribuição do número de animais a confirmar).
- O efeito materno permanente é mais relevante para o peso à desmama e praticamente desaparece depois da desmama ([URL candidata: PMC13469195](https://pmc.ncbi.nlm.nih.gov/articles/PMC13469195/); atribuição a confirmar).
- Um resumo de busca cita Sarmento et al. (2003) com efeito materno de cerca de 45% da variância fenotípica até a desmama em Nelore. A citação é secundária e não foi verificada **[não verificado; fonte original não identificada]**.
- Composto Purunã (população composta brasileira): herdabilidade direta do peso à desmama de 0,21 ± 0,03 e materna de 0,11 ± 0,02 ([SciELO, RBZ, Estimation of genetic parameters for weaning and yearling weights in a composite population used to form the Purunã breed](https://www.scielo.br/j/rbz/a/8TbHh8S6zrKYVMty4qWwDNt/); trecho de busca, não lido).
- Revisão geral entre raças: herdabilidade do peso à desmama entre 0,13 e 0,30 ([URL não identificada]; resumo de busca).
- Repetibilidade do peso à desmama de vacas de corte: não encontrada nesta busca (ver Gaps).

#### 2.4 Variâncias fixadas pela literatura e priors em rebanhos pequenos
- Um método bayesiano simples para variâncias fenotípicas heterogêneas dentro de rebanhos foi proposto em revista de leite. Parte da premissa de que os registros de um único rebanho raramente bastam para estimar as próprias variâncias ([ScienceDirect, S0022030293774767, A Computationally Simple Bayesian Method for Estimation of Heterogeneous Within-Herd Phenotypic Variances](https://www.sciencedirect.com/science/article/pii/S0022030293774767); trecho de busca, não lido; ano [não verificado], provavelmente início dos anos 1990).
- Em fazendas leiteiras pequenas (cruzados, sistema de agricultura familiar), simulações mostraram que um modelo bayesiano com efeito de fazenda separa componentes genéticos e não genéticos com cerca de duas vacas por fazenda. O erro-padrão cresce quando a herdabilidade é baixa, e a acurácia melhora até cerca de cinco vacas por fazenda ([PMC10772325, Developing flexible models for genetic evaluations in smallholder crossbred dairy farms](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10772325); trecho de busca, não lido; é leite, não corte).
- Em um estudo de bovinos de corte multirraça, valores iniciais de variância foram obtidos como média ponderada de análises GBLUP dentro de cada raça. Valores iniciais não informados superestimaram a herdabilidade e subestimaram a acurácia realizada ([URL candidata: PMC4433095, Comparison of Bayesian models to estimate direct genomic values in multi-breed commercial beef cattle](https://pmc.ncbi.nlm.nih.gov/articles/PMC4433095); atribuição do trecho a confirmar; trecho de busca).
- Estudos bayesianos com Nelore usam modelo animal com grupos contemporâneos "rebanho-ano-estação de nascimento" e sexo do bezerro como efeitos fixos ([URL não identificada]; trecho de busca).

#### 2.5 Grupos contemporâneos: tamanho e número de touros
- BIF 9ª ed.: recomenda pelo menos dois touros por grupo contemporâneo, mas diz que isso não é necessário quando se usa modelo animal ([BIF Guidelines, 9ª ed.](https://beefimprovement.org/wp-content/uploads/2013/07/BIFGuidelinesFinal_updated0916.pdf); trecho de busca).
- eBEEF, Beef Sire Selection Manual 2021: um grupo com um único animal não traz informação útil para a avaliação genética. Os bezerros devem ter idade entre 160 e 250 dias, ou ser separados em grupos diferentes; a pesagem ideal é perto dos 205 dias ([eBEEF, Sire Selection Manual 2021](https://ebeef.ucdavis.edu/sites/g/files/dgvnsk7331/files/inline-files/NBCEC%20SireSelectionManual2021_0.pdf); trecho de busca).
- Angus, Structured Sire Evaluation: meta de 15 a 20 progênies por touro em cada grupo contemporâneo ([American Angus Association, SSE](https://www.angus.org/ahir/data-initiatives/structured-sire-evaluation); trecho de busca).
- Angus, dados de carcaça: as orientações se contradizem. Uma seção pede pelo menos 5 animais de 2 touros; outra pede pelo menos 2 bezerros do mesmo sexo, abatidos na mesma data, de pelo menos 2 touros. A meta é de cerca de 25 novilhos ou novilhas por grupo ([American Angus Association, Carcass Data Collection](https://www.angus.org/ahir/how-to-collect/carcass-data); trecho de busca).
- Não encontrei número mínimo oficial de animais por grupo contemporâneo nas fontes BIF consultadas.

#### 2.6 Conectividade genética entre rebanhos
- Kennedy e Trus (1993), "Considerations on genetic connectedness between management units under an animal model", J. Anim. Sci. 71(9):2341–2352 (registro bibliográfico confirmado em trecho de busca; texto não lido, conteúdo conhecido só por citações de outros trabalhos).
- Segundo trabalhos que citam Kennedy e Trus, a conectividade aumenta com a relação genética entre unidades e diminui com a relação genética dentro das unidades ([Yu et al., JAS, Do stronger measures of genomic connectedness enhance prediction accuracies across management units?](https://academic.oup.com/jas/article/96/11/4490/5085211); autoria e ano a confirmar; trecho de busca).
- Trabalhos posteriores usam como medida de conectividade o erro de predição da diferença entre EBVs de dois animais (PEV das diferenças) e citam Kennedy e Trus como origem. O pacote GCA atribui a eles a aproximação da PEV média dentro de uma unidade pela variância dos efeitos de unidade ([GCA, pacote R para análise de conectividade, BMC Genomics 2021](https://link.springer.com/article/10.1186/s12864-021-07414-7); atribuição feita pelo próprio pacote, trecho de busca; a atribuição exata a Kennedy e Trus não foi conferida no texto original).
- Laloë propôs o coeficiente de determinação (CD) como medida de conectividade. Um trabalho anterior a 1996 define desconexão pela "não predizibilidade" de contrastes (CD nulo). Datas e títulos desses trabalhos não foram confirmados. Uma comparação de 1996 concluiu que o CD é a melhor medida de precisão da avaliação, mas é difícil de calcular em rotina por armazenamento e tempo de processamento ([GSE 2008, Fouilloux, Clément e Laloë, citado no resumo](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-40-2-145); título e autoria exata não confirmados; a comparação de 1996 tem URL não identificada).
- Fouilloux, Clément e Laloë (2008, Genetics Selection Evolution): método em duas etapas. Primeiro calcula CD entre rebanhos; depois agrupa os rebanhos conectados. Um critério de admissão, o CACO, reflete o nível de conectividade de cada rebanho. Rebanhos desconectados são identificados por CACO baixo. O CACO depende mais do tipo de serviço dos touros (IA ou monta) do que do tamanho do rebanho e é muito sensível à porcentagem de touros sem informação. O método é usado desde 2002 na avaliação de rebanhos de corte na França (IBOVAL) ([GSE 2008](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-40-2-145); trecho de busca, não lido).
- Conectividade entre rebanhos de corte em monta natural, usando CACO como critério de admissão a grupos conectados ([Genetics Selection Evolution 42:6, 2010, "Connectedness among herds of beef cattle bred under natural service"](https://gsejournal.biomedcentral.com/articles/10.1186/1297-9686-42-6); ano inferido pelo volume; trecho de busca).
- Pegolo et al. (2012, referência confirmada em lista de referências de Amorim et al., 2020) aplicou CACO a rebanhos Nelore brasileiros. O resumo de busca relata CACO acima de 0,4 na maioria dos rebanhos, e a porcentagem de rebanhos com CACO abaixo de 0,7 caiu de 27,5% para 16,2% entre dois períodos. Título, periódico e URL não confirmados; atribuição a confirmar ([URL não identificada]).
- Amorim et al. (2020, J. Anim. Sci., conectividade genômica em Nelore): conectividade calculada por pedigree pode ser subestimada em sistemas de corte, com registros fracos e monta múltipla. Entre os kernels paramétricos, a inclusão de dominância e epistasia aditiva-aditiva deu as maiores estimativas ([Amorim et al., 2020, JAS skaa289](https://academic.oup.com/jas/article/98/11/skaa289/5900679); trecho de busca, não lido).
- Estudo de rebanhos suínos comerciais na Coreia: CACO baixo identifica bem os rebanhos desconectados, e o CACO depende mais do serviço do que do tamanho do rebanho ([PubMed 38628682, Connectedness rating among commercial pig breeding herds in Korea](https://pubmed.ncbi.nlm.nih.gov/38628682); ano não confirmado; trecho de busca).

### Inferences
- Num rebanho único, comparações dentro do próprio rebanho (razão BIF, MPPA) não exigem conectividade. Já comparar EBVs com outros rebanhos ou com touros de referência exige conectividade. Um rebanho que usa só touros próprios e nunca usa IA nem touros de fora está provavelmente desconectado **[inferência a partir das fontes de conectividade]**.
- Em vacas com uma a duas crias, o MPPA encolhe quase todo o desvio para a média do rebanho. Isso é o comportamento desejado, porque evita classificar vacas com poucos dados como extremas **[inferência]**.
- A repetibilidade usada no MPPA precisa vir da literatura, porque não há como estimá-la com confiabilidade em um rebanho pequeno. Recomenda-se testar sensibilidade, por exemplo com r = 0,15, 0,25 e 0,35, e mostrar se o ranking das vacas do topo muda **[inferência]**.
- Um BLUP intra-rebanho com a genealogia do próprio rebanho e componentes de variância fixados pela literatura é viável com N pequeno. O EBV é sensível à herdabilidade direta e ao efeito materno escolhidos, então é preciso apresentar uma faixa de valores, por exemplo h² direta de 0,20 a 0,35 **[inferência a partir de 2.3]**.
- Um grupo contemporâneo com menos de três animais ou com um único touro tem pouco peso na avaliação. Deve ser juntado a outro grupo ou tratado com cautela **[inferência a partir de 2.5; o limite de três não foi encontrado em fonte]**.
- Comparações de razões BIF entre safras só fazem sentido quando as idades de desmama e os ajustes são os mesmos **[inferência a partir de 2.1]**.

### Gaps
- Repetibilidade do peso à desmama de vacas de corte, no Brasil ou no exterior: não encontrada.
- Priors informativos (distribuições) para componentes de variância em rebanhos pequenos de corte: não encontrados. Os trechos encontrados são de leite e de multirraça.
- Número mínimo oficial de animais por grupo contemporâneo: não encontrado nas fontes BIF consultadas.
- Fórmula e recomendações de implementação do BLUP intra-rebanho com efeito materno: não pesquisado.
- Título e autoria exata do artigo de Pegolo et al. (2012): não confirmados.
- Os números da comparação de Laloë de 1996 e do CACO de Pegolo (2012) vieram de resumos de busca. Antes de usar, conferir no artigo original.

---

## 3. Combinando informação externa: DEPs de touros, programas e testes genômicos comerciais

### Takeaway
As DEPs de touros publicadas pelas associações são a forma mais barata de conectar o rebanho à população de referência. Testes genômicos comerciais têm evidência fraca de validade fora da população de referência e em cruzados: um estudo de 2025 com machos beef × Holstein mostrou que o Igenity não ranqueou corretamente o ganho de peso nem a eficiência alimentar, e a DEP do touro para ganho de peso previu melhor o desempenho. Não encontrei dados de acurácia de testes comerciais em Nelore puro.

### Cited Findings
- O Igenity não ranqueou corretamente o ganho médio diário (GMD) nem a eficiência alimentar (RFI) de machos beef × Holstein. A DEP derivada do touro para GMD previu bem o GMD e o consumo de matéria seca em confinamento ([JAS 2025, Predictive ability of a commercial mixed-breed genomic test for feedlot performance and carcass traits of beef × Holstein steers, DOI 10.1093/jas/skaf053](https://academic.oup.com/jas/article/doi/10.1093/jas/skaf053/8040885); trecho de busca, não lido; versão em [PMC11971631](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971631/)).
- A correlação entre a DEP do touro e o valor genômico variou por característica: r = 0,33 para peso de carcaça quente, e cerca de 0,8 para espessura de gordura e marmoreio (mesmo estudo; trecho de busca).
- Os testes comerciais não foram validados para cruzamento terminal beef × leite, e a população de referência e os marcadores do Igenity não são públicos (mesmo estudo; trecho de busca).
- Afirmação de empresa: o Igenity Beef teria base de dados de mais de 18 milhões de animais. O número não foi verificado e vem de artigo de imprensa setorial ([URL não identificada]).
- Predição entre populações: em um estudo com gado chinês, uma referência de 400 animais de um grupo previu mal o outro grupo. Incluir 200 animais do grupo-alvo na referência elevou a acurácia para cerca de 60% da acurácia do grupo de referência ([URL candidata: PMC11594128, Accuracy of Genomic Predictions Cross Populations with Different Linkage Disequilibrium Patterns](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11594128/); atribuição a confirmar; trecho de busca).
- Para gado de corte multirraça sem genealogia disponível, há trabalho sobre avaliação genômica em gado tropical ([PMC10578004, Multi-breed genomic evaluation for tropical beef cattle when no pedigree information is available](https://pmc.ncbi.nlm.nih.gov/articles/PMC10578004/); título apenas, conteúdo não lido).

### Inferences
- A DEP publicada do touro é um prior externo com acurácia conhecida. Para um rebanho de 100 a 5.000 vacas, a combinação razoável é usar a DEP como prior e conexão, e as observações do próprio rebanho para calibrar **[inferência]**.
- Um teste genômico comercial só deve ser usado para triagem depois de validado no próprio rebanho, por exemplo pela correlação com as DEPs de touros conhecidos. Não deve ser usado sozinho em raça ou cruzamento fora da população de referência **[inferência a partir de 3.1 e 3.2]**.
- Para rebanho Nelore puro, a acurácia de um teste comercial depende de a população de referência incluir Nelore brasileiro. Não verificado.

### Gaps
- Acurácias de testes comerciais da Zoetis (Inherit, HD50K) e de testes brasileiros em Nelore: não encontradas. A busca não retornou nada sobre Zoetis.
- Uso das DEPs publicadas por associações como informação conhecida: não aprofundado, por escopo (catálogos de programas são tarefa de outros pesquisadores).
- Acurácia de DEPs de touros em rebanhos pequenos: não encontrada.

---

## 4. Tamanho amostral mínimo para estimar herdabilidade com erro-padrão aceitável

### Takeaway
Não consegui confirmar a fórmula de Robertson (1959) para o erro-padrão da herdabilidade em meios-irmãos paternos. As fontes encontradas só citam a referência. A orientação prática é que a precisão depende do número de touros e de progênies por touro, e que estimativas feitas com cerca de 100 registros em poucos touros têm erro-padrão grande em relação às herdabilidades típicas de 0,2 a 0,35. Por isso, o caminho prático é fixar a herdabilidade pela literatura.

### Cited Findings
- Robertson (1959), artigo da revista Biometrics sobre delineamento experimental para parâmetros genéticos. Título, volume e páginas não confirmados; a referência de um artigo do Springer traz páginas com erro ([Springer, Reliable confidence intervals in quantitative genetics: narrow-sense heritability](https://link.springer.com/article/10.1007/s00122-007-0619-9); trecho de busca).
- Osborne e Paterson (1952) é citado como referência clássica sobre a variância amostral de herdabilidades estimadas por análise de variância ([URL não identificada]; citação secundária).
- Notas de curso sobre delineamento de meios-irmãos (material ovino, não bovino) indicam tamanhos de família de cerca de 20 a 40 progênies por touro, e remetem a Falconer e Mackay, cap. 10, para erros-padrão aproximados ([GENE 422/522, notas de curso](https://www.woolwise.com/wp-content/uploads/2017/07/GENE-422-522-11-T-07.pdf); trecho de busca).
- Uma estrutura geral de 2015 (Genetics 199:223) dá a variância assintótica da herdabilidade em delineamentos balanceados de meios-irmãos, em função do número de famílias e de progênies por família ([PMC4286686, A General Unified Framework to Assess the Sampling Variance of Heritability Estimates Using Pedigree or Marker-Based Relationships](https://pmc.ncbi.nlm.nih.gov/articles/PMC4286686/); trecho de busca, não lido).
- Estudo com exposição de novilhas à reprodução em diferentes idades: quando as novilhas entraram na estação normal, aos 24 meses, a estimativa de herdabilidade foi zero. Com monta antecipada, aos cerca de 18 meses, subiu para 0,20. Com o conjunto completo de fêmeas, chegou a 0,36 ([Dias et al., 2004, Arquivo Brasileiro de Medicina Veterinária e Zootecnia; URL candidata, atribuição a confirmar](https://doaj.org/article/f1cb4673faee49749947a88d163094ca); trecho de busca).
- Outro trabalho de referência sobre erro-padrão de herdabilidade e tamanho amostral: "Heritability and genetic correlation: standard errors of estimates and sample size" ([Springer, BF01070218](https://link.springer.com/content/pdf/10.1007/BF01070218.pdf); título apenas, conteúdo não lido).

### Inferences
- Com 5 touros e 20 progênies por touro (100 registros), o erro-padrão da herdabilidade estimada por meios-irmãos tende a ser grande em relação a valores de 0,2 a 0,35. Não foi calculado; é uma inferência a confirmar com a fórmula de Falconer e Mackay ou com simulação **[inferência]**.
- Recomenda-se simular o erro-padrão para o delineamento real do rebanho (número de touros, progênies por touro, idade de exposição) por Monte Carlo antes de estimar a herdabilidade localmente **[inferência]**.
- Como a idade de exposição muda a estimativa de herdabilidade (Dias et al., 2004), estimativas feitas em rebanhos com monta antecipada ou com novilhas misturadas não são comparáveis entre si **[inferência a partir da fonte]**.
- Uma heurística de ANOVA sugerida em um resumo de busca indica que a variância da herdabilidade cai com o número de touros e com progênies por touro, com retornos decrescentes para progênies. A fórmula não foi verificada. Não usar sem conferir Falconer e Mackay **[não verificado]**.

### Gaps
- Fórmula exata do erro-padrão de h² para meios-irmãos paternos (Robertson, 1959; Falconer e Mackay, cap. 10): não confirmada.
- Potência estatística para detectar diferença de herdabilidade entre rebanhos: não encontrada.
- Herdabilidade do peso à desmama em rebanhos pequenos, com erro-padrão reportado: não encontrada.

---

## 5. Monitoramento de progresso genético e endogamia num rebanho: tendência, F, ΔF, Ne, intervalo de gerações

### Takeaway
A fórmula de Ne de Wright (Ne = 4NmNf / (Nm + Nf)) combinada com ΔF ≈ 1 / (2Ne) mostra o risco de endogamia num rebanho pequeno. Com 5 touros e 100 vacas, Ne ≈ 19 e ΔF ≈ 2,6% por geração, o que é alto. Não encontrei benchmarks de Ne ou ΔF para rebanhos de corte brasileiros; as referências encontradas são de bovinos em geral e de leite.

### Cited Findings
- Ne de Wright para o sistema touro-vaca: Ne = 4NmNf / (Nm + Nf), onde Nm e Nf são os números de machos e fêmeas reprodutores. A fórmula exige premissas que muitas vezes não são atendidas em animais de produção ([Nature Heredity, Prediction and estimation of effective population size, 2016](https://www.nature.com/articles/hdy201643); a notação Nm/Nf aparece no trabalho; trecho de busca). A premissa de que a fórmula requer hipóteses nem sempre atendidas vem de [JDS 2001, Controlling Inbreeding in Modern Breeding Programs](https://www.journalofdairyscience.org/article/S0022-0302(01)70213-5/pdf) (atribuição a confirmar).
- ΔF = 1 / (2Ne) para o aumento de endogamia por geração **[def.]**, com a relação entre Ne e taxa de endogamia descrita no mesmo trabalho de leite ([JDS 2001](https://www.journalofdairyscience.org/article/S0022-0302(01)70213-5/pdf); atribuição a confirmar).
- Estimativas de Ne em bovinos, ovinos, equinos, suínos e caprinos a partir de dados de censo e de livro genealógico ([PubMed 27160794, Effective population sizes in cattle, sheep, horses, pigs and goats estimated from census and herdbook data, 2016](https://pubmed.ncbi.nlm.nih.gov/27160794/); valores para bovinos não extraídos; trecho de busca).
- Ne por desequilíbrio de ligação em gado de corte: 207 para Angus e 285 para Charolês, dez gerações atrás ([PMC3418579, Linkage disequilibrium in Angus, Charolais, and Crossbred beef cattle](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3418579/); trecho de busca).
- Métodos de Ne a partir de pedigree (exemplos em cães, ovinos, bovinos e equinos). Métodos baseados no número de machos e fêmeas reprodutores e na variância do tamanho das progênies dão valores maiores que os métodos por identidade por descendência. Métodos que consideram a evolução da endogamia dão valores menores que os baseados em coancestria ([PMC3599586, Methods to estimate effective population size using pedigree data](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3599586/); atribuição a confirmar; trecho de busca).
- Exemplo em leite (África do Sul): taxa de endogamia de 0,183% ± 0,020% ao ano e Ne de 38,83, com intervalo de geração de 6 anos ([ResearchGate, Rate of inbreeding and effective population size in four major South African dairy cattle breeds, URL candidata](https://www.researchgate.net/publication/266471031_Rate_of_inbreeding_and_effective_population_size_in_four_major_South_African_dairy_cattle_breeds); trecho de busca, não lido).
- Uma análise de Nelore relata tendência genética crescente para o peso à desmama, de cerca de 0,85 kg por ano. A fonte não foi identificada e o valor não deve ser usado sem conferência ([URL não identificada]).

### Inferences
- Rebanho de 100 vacas com 5 touros: Ne = 4 × 5 × 100 / 105 ≈ 19,0 e ΔF ≈ 1 / (2 × 19,0) ≈ 2,6% por geração **[cálculo do redator]**.
- Com 10 touros, Ne ≈ 36 e ΔF ≈ 1,4% por geração. Com 20 touros, Ne ≈ 67 e ΔF ≈ 0,75% por geração **[cálculo do redator]**. A mudança de touros ou o uso de IA é a alavanca mais direta para elevar Ne num rebanho pequeno.
- O intervalo de geração de vacas de corte precisa ser declarado. O exemplo de leite usou 6 anos, mas o valor para corte no Brasil não foi encontrado **[não verificado]**.
- A taxa de endogamia por ano é ΔF dividido pelo intervalo de geração. A meta de ΔF por geração (por exemplo, abaixo de 1%) é uma decisão de gestão. Não encontrei benchmark publicado para rebanhos de corte **[inferência]**.
- A resposta esperada à seleção segue a equação do criador, R = i × h² × σp por geração, e a resposta anual é R / L, com L o intervalo de geração **[não verificado; equação padrão, a confirmar em Falconer e Mackay]**.

### Gaps
- Benchmarks de Ne e de ΔF em rebanhos de corte brasileiros: não encontrados.
- Valores de Ne para bovinos no artigo de 2016 (PubMed 27160794): não extraídos.
- Método para tendência genética (média de EBV por ano de nascimento) em rebanho pequeno: não pesquisado.
- Metas de melhoramento para o rebanho (diferencial de seleção, objetivos de seleção): não pesquisado.

---

## 6. Ferramentas fenotípicas: modelos mistos, curvas de crescimento, descarte, outliers e controle estatístico de processo

### Takeaway
Nesta rodada não pesquisei modelos mistos com efeitos de rebanho, ano e estação, curvas de crescimento não lineares, regras de descarte, detecção de outliers nem cartas de controle. Há indicações parciais de que em Nelore o grupo contemporâneo "rebanho-ano-estação" entra como efeito fixo em modelos animais. A seção fica como lacuna explícita.

### Cited Findings
- Estudos bayesianos com Nelore usam modelo animal com efeitos fixos de grupo contemporâneo "rebanho-ano-estação de nascimento" e sexo do bezerro, com estimativas por Gibbs ([URL não identificada]; trecho de busca).
- Um estudo de limiar em Nelore usou cerca de 5.400 animais à desmama. O resultado diz pouco sobre rebanhos pequenos ([URL não identificada]; trecho de busca).
- Os itens não pesquisados são: curvas de crescimento de Brody, von Bertalanffy e Gompertz por animal; cartas de Shewhart e CUSUM para KPIs; regras de descarte por IEP, PS e prenhez; detecção de outliers por resíduos.

### Inferences
- Um modelo misto de referência para o peso à desmama em rebanho pequeno, a ser confirmado por fonte **[não verificado; formulação padrão de modelo animal]**: y = µ + GC (rebanho × ano × estação) + sexo + idade da mãe + idade do bezerro (covariável) + animal (aleatório) + efeito materno permanente (aleatório, se houver) + erro. Com N pequeno, o efeito de GC precisa de pelo menos alguns animais por nível para ser estimado.
- Para KPIs de série curta (três a cinco safras), gráficos de controle com limites baseados na variância histórica são mais informativos que comparar com benchmarks externos **[inferência]**.
- Cada KPI de cria deve vir com seu erro-padrão ou IC, pelo motivo dado na seção 1 (erro binomial de cerca de 3,6 pontos com 100 vacas) **[inferência]**.

### Gaps
- Modelos mistos com efeitos de rebanho, ano e estação em rebanhos pequenos: não pesquisado.
- Curvas de crescimento não lineares (Brody, von Bertalanffy, Gompertz) para vacas e bezerros: não pesquisado.
- Regras de descarte e de substituição de vacas: não pesquisado.
- Detecção de outliers e cartas de controle estatístico de processo para KPIs de rebanho: não pesquisado.

**Próxima rodada de busca sugerida (para completar as lacunas):**
1. "Brody von Bertalanffy Gompertz growth curve beef cows" (curvas de crescimento).
2. "statistical process control herd performance indicators livestock" (cartas de controle).
3. "GMD desmama Nelore benchmark ganho médio diário pré-desmama" (benchmarks de GMD).
4. "escore de condição corporal vaca de cria Embrapa" (ECC).
5. "Fouilloux Clément Laloë 2008 connectedness title" (confirmar título e DOI).
6. "Pegolo Laloë de Oliveira Lôbo Fouilloux 2012 connectedness Nellore" (confirmar o artigo de 2012).
7. "Robertson 1959 Biometrics experimental design heritability" (confirmar a fórmula).
8. "repeatability weaning weight beef cows Nelore" (repetibilidade).
9. "IRM SPA benchmark calf losses 2023" (benchmarks americanos atualizados).
10. "Zoetis Inherit HD50K accuracy commercial beef" (acurácia de testes comerciais).
