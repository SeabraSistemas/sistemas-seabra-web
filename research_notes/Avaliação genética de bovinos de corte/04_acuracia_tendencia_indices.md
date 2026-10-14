# Acurácia, tendência genética e índices econômicos de EPDs/DEPs (bovinos de corte)

> **Data da pesquisa:** 2026-10-14. **Método:** somente WebSearch (WebFetch e HTTP externo indisponíveis). Os fatos vêm de trechos e resumos de resultados de busca, não da leitura integral das páginas. Números-chave (pesos, tabelas, fórmulas) devem ser conferidos na fonte antes de qualquer publicação. Itens marcados **[não verificado]** são conhecimento de fundo sem fonte localizada nesta pesquisa. Quando a associação de uma afirmação a uma URL específica é provisória, está indicado "(atribuição provisória)".
>
> **Notação:** EBV = valor genético (breeding value); EPD/DEP = ½ EBV; r = acurácia (correlação entre EBV e valor genético verdadeiro); r² = confiabilidade (reliability); a_BIF = acurácia BIF; PEV = variância do erro de predição; σ²a = variância genética aditiva; PC = Possible Change; SEP = erro-padrão de predição.

## Pergunta-chave 1: Definições, fórmulas de acurácia e Possible Change

### Takeaway
A acurácia BIF, a_BIF = 1 − √(PEV/σ²a), é menor que a correlação r = √(1 − PEV/σ²a) para o mesmo animal. A conversão é a_BIF = 1 − √(1 − r²). Possible Change (PC) é a semi-amplitude ao redor do EPD que contém o valor verdadeiro com cerca de 2/3 de probabilidade. A fórmula de PC citada pelo BIF é PC = t·(1 − a_BIF)·σ_u/2, com t = 1 ou 2, mas o texto da página está corrompido e deve ser conferido. A escala em que cada associação publica a acurácia (r ou a_BIF) altera o PC de forma relevante.

### Cited Findings
- **Fórmula BIF:** a_BIF = 1 − √(PEV / σ²a). Na página BIF, a variância aditiva do denominador é multiplicada por (1 + F) do animal. Fonte: [BIF Guidelines, "Accuracy"](https://guidelines.beefimprovement.org/index.php/Accuracy). Snapshot com cerca de 2 anos, segundo o próprio resultado de busca.
- **Relação com a correlação verdadeira:** a_BIF = 1 − √(1 − r²) e r = √(1 − (1 − a_BIF)²). Fonte: [BIF, "Accuracy"](https://guidelines.beefimprovement.org/index.php/Accuracy).
- **Ponto de checagem:** r = 0,50 corresponde a a_BIF ≈ 0,13. Fonte: [OSU, "Understanding EPD Accuracies"](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html) (atribuição provisória, tabela de conversão).
- **Nomes para a mesma grandeza:** "accuracy (r)", "reliability (r²)" e "BIF accuracy". Fonte: [OSU](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html) (atribuição provisória).
- **Conservadorismo:** para EPDs, o BIF usa um cálculo que dá estimativas de acurácia mais conservadoras que a definição estrita de correlação. Fonte: [BIF, "Accuracy"](https://guidelines.beefimprovement.org/index.php/Accuracy).
- **Aproximações de PEV:** a inversa exata da matriz de coeficientes do modelo misto é grande demais, então usam-se aproximações que podem superestimar a acurácia, sobretudo em animais jovens e na contribuição de características correlacionadas. Alternativa: variância a posteriori de amostrador MCMC. Fonte: [BIF, "Accuracy"](https://guidelines.beefimprovement.org/index.php/Accuracy). Lead não lido sobre métodos de PEV para BLUP restrito: Satoh (2025), *Journal of Animal Breeding and Genetics*, DOI 10.1111/jbg.12910, [link](https://onlinelibrary.wiley.com/doi/10.1111/jbg.12910).
- **Possible Change (BIF):** PC = t·((1 − a_BIF)·σ_u)/2, com t = 1 ou 2. Fonte: [BIF, "Possible Change"](https://guidelines.beefimprovement.org/index.php/Possible_Change). A renderização da fonte está corrompida; a forma acima é a leitura do resumo, não da página original.
- **SEP (BIF 2016):** SEP = √[Var(PE)] = √[(1 − acc²)·Vg]. Fonte: Van Vleck, "GGP BIF16", [BIF 2016](https://www.bifconference.com/bif2016/documents/GGP-BIF16-Van-Vleck.pdf).
- **Interpretação de PC:** o intervalo EPD ± PC contém a diferença verdadeira com cerca de 2/3 de probabilidade, e pode falhar, sobretudo em animais jovens e sem progênie. Fonte: [Angus, "Accuracy and Associated Possible Change"](https://www.angus.org/tools-resources/national-cattle-evaluation/accuracy-and-possible-change).
- **PC decresce com a acurácia.** Mesma fonte.
- **Exemplo publicado (atribuição provisória, página Angus):** dois touros Charolês com EPD de peso ao ano +30 lb. Acurácia 0,40 → PC 23 lb. Acurácia 0,80 → PC 8,5 lb.
- **Versões divergentes da tabela Angus:** as cópias [cd.angus.org](https://cd.angus.org/tools-resources/national-cattle-evaluation/accuracy-and-possible-change) e [aimsdata.angus.org](https://aimsdata.angus.org/tools-resources/national-cattle-evaluation/accuracy-and-possible-change) divergem em algumas células (por exemplo, 5,1 numa e 6,9 na outra).
- **Outras raças têm tabelas próprias.** Exemplo: North American South Devon, [tabela 2020](https://southdevon.com/documents/pdf/2020/EPD-Accuracy-Values-Possible-Change.pdf).
- **Acurácia só com registro próprio:** √h². Trecho de resultado de busca (atribuição provisória: [Purdue NSIF-7](https://www.extension.purdue.edu/extmedia/NSIF/NSIF-7/NSIF-FS7.pdf), texto truncado).
- **Registros repetidos:** n·h² / [1 + (n − 1)·r], com r = repetibilidade. Mesma fonte; [verificar, texto truncado].
- **Progênie e acurácia:** touros com muitas progênies têm, em geral, acurácias altas (atribuição provisória, [Purdue NSIF-7](https://www.extension.purdue.edu/extmedia/NSIF/NSIF-7/NSIF-FS7.pdf)). A acurácia depende do número e da distribuição das progênies por touro e da profundidade da genealogia (atribuição provisória, [OSU](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html)).
- **Escala:** acurácia de 0 a 1; algumas fichas imprimem ×100 (0,15 vira 15). Animais jovens sem progênie têm, em geral, acurácia abaixo de 0,20. Algumas associações usam letras no lugar do número (ex.: "PE", "I") para touros com pouca informação (atribuição provisória, [OSU](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html)).
- **Exemplo UF/IFAS (atribuição provisória, [EDIS 4H332](https://edis.ifas.ufl.edu/publication/4H332)):** EPD de peso ao nascer = 2,0. Com acurácia 0,20, o intervalo é de cerca de −0,1 a +4,1. Com acurácia 0,95, é de cerca de 1,9 a 2,1.
- **Fêmeas:** é mais difícil elevar a acurácia de EPDs de fêmeas que de machos, porque touros geram muito mais progênie (atribuição provisória, [OSU](https://extension.okstate.edu/fact-sheets/understanding-epd-accuracies.html)).

### Inferences
- **Conversão recalculada** a partir da fórmula BIF acima (cálculo próprio):
  - r = 0,50 → a_BIF = 1 − √0,75 = 0,134 (confere com a tabela OSU).
  - r = 0,60 → a_BIF = 1 − √0,64 = 0,20.
  - r = 0,80 → a_BIF = 1 − √0,36 = 0,40.
  - r ≈ 0,98 → a_BIF = 0,80.
- **Exemplo pronto para uso:** PEV = 0,75·σ²a → a_BIF = 1 − √0,75 = 0,134 → r = √(1 − 0,75) = 0,50.
- **Escala do PC (hipótese):** o exemplo UF é compatível com PC ∝ (1 − a_BIF). Cálculo: (0,05 / 0,80) × 2,1 = 0,13, compatível com o ±0,1 arredondado. Se a escala fosse r, PC ∝ √(1 − r²) daria cerca de 0,67, incompatível. Logo, os intervalos UF parecem usar acurácia na escala a_BIF. Não confirmado; conferir a convenção de cada fonte.
- **Exemplo Angus não reproduzível com um único σ:** PC(0,40)/PC(0,80) = 23/8,5 = 2,71. Na escala a_BIF, a razão seria 0,6/0,2 = 3,0. Na escala r, seria 0,9165/0,6 = 1,53. Nenhuma reproduz o exemplo. Não usar como validação sem a tabela oficial.

### Gaps
- Tabela oficial atual de Possible Change (Angus, 2025–2026) não localizada; as duas cópias encontradas divergem.
- Texto da fórmula de PC do BIF corrompido; confirmar t e o fator /2 no PDF das Guidelines.
- Escala de acurácia (r ou a_BIF) publicada por ANCP, ABCZ e Geneplus: não localizada.
- Tabela 2 do OSU (progênies necessárias por acurácia e h²): células cortadas no resultado; não lida.
- Fórmula de acurácia por progênie, r² = n/(n + k) com k = (4 − h²)/h²: [não verificado]. O único resultado com a fórmula (Purdue NSIF-7) estava ilegível.

## Pergunta-chave 2: Acurácia por progênie e informação genômica

### Takeaway
A informação genômica eleva a acurácia sem mudar a leitura do EPD. O ganho é expresso como "progeny equivalents" (número de progênies cujo efeito equivale ao ganho de acurácia). Os valores variam entre fontes (peso ao desmame: 27 na Penn State, 25 ou mais na ASA). Não foi localizada fonte primária com a fórmula de equivalência.

### Cited Findings
- GE-EPD eleva a acurácia sem mudar a interpretação; o benefício é maior para animais jovens. Fontes: [ASA, GE-EPDs](https://www.salersusa.org/tools-and-resources/national-cattle-evaluation/genomically-enhanced-epds/); [Penn State Extension](https://extension.psu.edu/understanding-epds-and-genomic-testing-in-beef-cattle) (atribuição provisória para o benefício em jovens).
- **Definição de progeny equivalent (ASA):** número de progênies que o animal precisaria ter, medidas e reportadas, para receber o mesmo ganho de acurácia de um painel genômico.
- **Tabela ASA:** 25 ou mais para facilidade de parto direta, peso ao desmame e peso ao ano; 22 para peso ao nascer; 19 para leite; carcaça de cerca de 5 a 8 (peso de carcaça 5, marmoreio 8, área de olho de lombo 6, espessura de gordura 8). Fonte: [ASA](https://www.salersusa.org/tools-and-resources/national-cattle-evaluation/genomically-enhanced-epds/).
- **Penn State:** facilidade de parto direta 26; peso ao nascer 23; peso ao desmame 27; peso ao ano 23. Um GE-EPD de touro jovem equivale a 10–36 bezerros, conforme a característica. Fonte: [Penn State Extension](https://extension.psu.edu/understanding-epds-and-genomic-testing-in-beef-cattle).
- **UF/IFAS:** 7 a 23 progênies adicionais, conforme a característica (atribuição provisória, [UF/IFAS](https://nwdistrict.ifas.ufl.edu/phag/?p=62641)).
- **Beef Magazine:** informação genômica equivale a 8 a 33 bezerros, conforme a característica (atribuição provisória, [Beef Magazine](https://www.beefmagazine.com/cattle-genetics/the-power-of-genomics-in-registered-herds)).
- **Divergência:** as fontes não concordam. Raça, dados de referência e ano de avaliação são causas prováveis, não confirmadas.
- **Leads não lidos:** Mateescu & Pearce (UF), [PDF](https://animal.ifas.ufl.edu/beef_extension/bcsc/2016/proceedings/mateescu.pdf); precisão de DGV em Limousin e Simmental nos EUA, [PMC3536607](https://pmc.ncbi.nlm.nih.gov/articles/PMC3536607/).

### Inferences
- Se o ganho genômico equivale a n_eq progênies, uma aproximação é trocar n por (n + n_eq) na expressão de acurácia por progênie. Isso é inferência; depende da fórmula não verificada na Pergunta 1.

### Gaps
- Tabela de equivalência atual (2024–2026) por raça: não localizada. A data das tabelas da ASA não foi identificada; as da Penn State e da UF não têm data.
- Fórmula de acurácia genômica ou de equivalência: não localizada.

## Pergunta-chave 3: Convenções brasileiras (DEP, acurácia, percentis, MGTe, iABCZ, IQG/IF, CEIP)

### Takeaway
Três sistemas de índice aparecem. (i) iABCZ (ABCZ/PMGZ): soma ponderada de 10 características com pesos que somam 100; vigente desde a 3ª avaliação genética (julho de 2024, segundo fonte da ABCZ). (ii) MGTe (ANCP): índice bioeconômico lançado em 2016, com DEPs padronizadas pelo desvio-padrão genético. (iii) IQG (Geneplus): soma de DEP × grau de importância (%). O "Índice Final (IF)" da Geneplus não foi localizado. Para o CSG da ABCZ, o critério é acurácia mínima de 20% em peso à desmama (Nelore), além de classes DECA. O CEIP é chancelado pelo MAPA.

### Cited Findings
- **iABCZ, composição vigente (3ª avaliação, julho de 2024):** iABCZ = 5% PM-EM + 5% TMD + 30% STAY + 10% IPP + 5% PE365 + 13% PD-ED + 8% PA-ED + 13% PS-ED + 6% AOL + 5% ACAB. Fontes: [ABCZ, 3º Encontro Nacional de Criadores do PMGZ](https://www.abcz.org.br/noticias/noticia/29326/3---encontro-nacional-de-criadores-do-pmgz-resulta-em-novas-estrategias-para-aprimoramento-do-programa-e-novo-iabcz); [ABCZ, "Novo índice ABCZ (iABCZ)"](https://www.abcz.org.br/noticias/noticia/26367/novo-indice-abcz--iabcz--quer-aumentar-o-lucro-do-pecuarista); [OPresenteRural, "ABCZ vai adotar novo índice... em 2024"](https://opresenterural.com.br/abcz-vai-adotar-novo-indice-para-criterio-de-selecao-dos-animais-em-2024/). Atribuição provisória: conferir na fonte da ABCZ.
- **Siglas (conforme resumo; expansões a confirmar):** PM-EM peso à fase materna; TMD total materno à desmama; STAY stayability (longevidade reprodutiva); IPP idade ao primeiro parto; PE365 perímetro escrotal ao ano; PD-ED peso à desmama, efeito direto; PA-ED peso ao ano, efeito direto; PS-ED peso ao sobreano, efeito direto; AOL área de olho de lombo; ACAB acabamento de carcaça.
- **Versão anterior (data não confirmada):** iABCZ = 10% PM-EM + 15% PD-ED + 20% TMD + 15% GPD + 15% PS-ED + 15% IPP + 10% PE450 (GPD = ganho pós-desmame). Fonte: [ABCZ, "Novo índice ABCZ"](https://www.abcz.org.br/noticias/noticia/26367/novo-indice-abcz--iabcz--quer-aumentar-o-lucro-do-pecuarista) (atribuição provisória).
- **Conflito de datas:** outra fonte diz que STAY tinha peso de 35% em 2018. Essa composição não inclui STAY, então as duas informações não podem ser da mesma versão. Ambas foram mantidas como relatadas.
- **Pesos por raça:** Nelore e Tabapuã têm pesos próprios; Brahman, Gir e Guzerá têm outros; em Indubrasil e Sindi, STAY não entra na fórmula (atribuição provisória, fontes ABCZ).
- **Percentis e DECA:** DECA 1 = 10% melhores; DECA 10 = 10% piores; num percentil, menor valor = melhor classificação. Fonte: [vocepergunta, "O que é o índice ABCZ?"](https://vocepergunta.com/library/artigo/read/432348-o-que-e-o-indice-abcz) (atribuição provisória).
- **MGTe (ANCP):** lançado em 2016. Calculado a partir de um modelo de fazenda comercial de ciclo completo no Brasil Central, com custos, receitas e lucros. O peso de cada característica é o efeito de uma unidade sobre o lucro. Forma: combinação linear b1·DEP1 + b2·DEP2 + ..., com DEPs divididas pelo desvio-padrão genético. Fonte: [Seminário ANCP 2016, slides](https://www.slideshare.net/slideshow/04-fernando-seminario/62118028) (atribuição provisória).
- **MGTe revisado:** a ANCP atualizou o índice e excluiu características redundantes ou muito correlacionadas. Fonte: [ANCP, atualização do MGTe](https://www.ancp.org.br/ancp-faz-atualizacao-do-indice-bioeconomico-mgte/). Novos índices: o MGTe_CR é voltado a sistemas de cria. Fonte: [ANCP, novos índices bioeconômicos](https://www.ancp.org.br/ancp-novos-indices-bioeconomicos/).
- **MGT antigo (PMGRN, sumário de 2000):** pesos diferentes para machos e fêmeas; para fêmeas, a habilidade maternal tinha peso 0,30. Fonte: [PMGRN, cálculo do MGT](http://sol.fmrp.usp.br/gemac/pmgrn/sumario/ano2000/calc_merito_gen_tot.html) (atribuição provisória; versão antiga).
- **IQG (Geneplus):** IQG = Σ DEP × grau de importância (%). O Sumário Nelore mostra DEP, acurácia, percentil e IQG básico. Fontes: [Geneplus, critérios Nelore](https://geneplus.com.br/atjplus-nelore-criterios); [Embrapa, App Sumário Nelore](https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/4275/app-sumario-nelore---aplicativo-movel-do-sumario-de-touros-nelore-do-programa-embrapa-geneplus-).
- **Teste de desempenho PADN (Geneplus, 2020):** o ranking final dá maior ênfase à eficiência alimentar. Características: eficiência alimentar, ganho médio diário, peso final, perímetro escrotal, área de olho de lombo e gordura subcutânea. Fonte: [Portal DBO, 2020](https://portaldbo.com.br/programa-embrapa-geneplus-inicia-a-prova-de-avaliacao-de-desempenho-do-nelore-de-2020/). Data antiga; pode estar desatualizado.
- **CEIP:** Certificado Especial de Identificação e Produção, chancelado pelo MAPA para animais avaliados em programas de melhoramento registrados. A ANCP concede o CEIP dentro do próprio programa. Fontes: [ERural](https://www.erural.net/conteudo/o-que-significa-a-sigla-ceip); [Agron, 2014](https://agron.com.br/publicacoes/noticias/agricultura-e-pecuaria/2014/09/04/040847/ceip-marca-criada-pela-ancp).
- **CSG (ABCZ, substituto do certificado especial de produção):** os melhores 20% da safra recebem o CSG. Para Nelore e Nelore Mocha, acurácia mínima de 20% em peso à desmama e DECA até 4 nas características do iABCZ. Para Brahman, Guzerá, Sindi e Tabapuã, acurácia mínima de 20% em PD e DECA até 5. Fontes: [Rural Pecuária](https://ruralpecuaria.com.br/tecnologia-e-manejo/bovinocultura-de-corte/abcz-certificado-especial-de-producao-e-substituido-pelo-certificado-de-superioridade-genetica.html); [ABCZ, CSG](https://www.abcz.org.br/pmgz/pmgz-corte/csg-certificado-de-superioridade-genetica/apresentacao).
- **Conflito de limiar:** a DeltaGen (fonte comercial) afirma que só os 30% melhores de cada safra podem receber a chancela CEIP. Fonte: [DeltaGen](https://www.deltagen.com.br/noticia.php?noticia=0171). Diverge dos 20% do CSG da ABCZ. São regras de programas diferentes; não tratar como a mesma regra.
- **Certificado CEIP Geneplus:** lista, por característica, DEP, acurácia (AC), percentil e classe. Fonte: [Geneplus, certificado CEIP](https://geneplus.com.br/certificadosCeip/download/4).

### Inferences
- **Aritmética dos pesos:** iABCZ atual: 5 + 5 + 30 + 10 + 5 + 13 + 8 + 13 + 6 + 5 = 100. Versão anterior: 10 + 15 + 20 + 15 + 15 + 15 + 10 = 100.
- **Limitação do IQG:** DEP × % opera nas unidades brutas das DEPs. Se as DEPs não são padronizadas, o peso percentual não equivale a peso econômico por unidade. O MGTe padroniza para evitar isso (inferência metodológica).
- **Comparabilidade:** pesos do iABCZ (sobre DEP bruta) e do MGTe (sobre DEP padronizada) não são comparáveis diretamente.

### Gaps
- Índice Final (IF) da Geneplus: fórmula e pesos não localizados. A busca retornou só o IQG e o PADN.
- Pesos atuais do MGTe (ANCP): não localizados. Um quadro de terceiro foi citado sem números confirmados.
- Método de cálculo de percentis e "Top %": não localizado. O equivalente de decis na ABCZ é o DECA. "Top %" e decis de outras associações não foram pesquisados [não verificado].
- Composição do iABCZ em 2026: não verificada; as fontes vão até 2024.
- Ano e fonte da versão anterior do iABCZ: não confirmados; conflito de datas sobre STAY em 2018.
- Critérios CEIP vigentes (MAPA e ANCP): não localizados. Conflito entre 20% (CSG/ABCZ) e 30% (DeltaGen).

## Pergunta-chave 4: Tendência genética e teoria de resposta à seleção

### Takeaway
ΔG = r·σg·i / L (equação do melhorista). Reduzir o intervalo de gerações (L) aumenta o ganho anual. No exemplo do Missouri (ΔG = 2,8 lb/ano, σg = 26,3 lb, L = 5 anos), o produto r·i ≈ 0,53. Não foram localizados o método de regressão da média de EBV/DEP sobre o ano de nascimento nem os relatórios de tendência das associações.

### Cited Findings
- **Equação do melhorista:** ΔG = r·σg·i / L, com r = acurácia da seleção, σg = desvio-padrão genético, i = intensidade de seleção e L = intervalo de gerações. Fontes: [University of Missouri Extension, G02013](https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/ansci/g02013.pdf); [Beef Cattle Extension (extension.org)](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/).
- **L:** idade média dos pais no nascimento da progênie. Fonte: [extension.org](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/) (atribuição provisória).
- **Glossário BIF:** com os demais fatores constantes, o intervalo de gerações é inversamente relacionado à taxa de resposta. Fonte: [BIF Glossary](https://guidelines.beefimprovement.org/index.php/Glossary).
- **Exemplo trabalhado:** ganho genético de peso ao desmame de 2,8 lb/ano; desvio-padrão genético de 26,3 lb; L = 5 anos. Fonte: [Missouri G02013](https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/ansci/g02013.pdf).
- **Seleção por EPD vs. fenótipo:** a acurácia da seleção por EPD é sempre maior que a acurácia pela medida observada. Fonte: [extension.org](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/) (atribuição provisória).
- **Encurtar L:** usar touros e matrizes mais jovens; o teste genômico é uma via. Fontes: [extension.org](https://beef-cattle.extension.org/decreasing-generation-interval-to-increase-genetic-progress/); [Beef Magazine](https://www.beefmagazine.com/cattle-genetics/the-power-of-genomics-in-registered-herds).
- **Evidência de leite:** a seleção genômica eleva a acurácia e reduz L, acelerando as mudanças genéticas. Fonte: [Changes in genetic trends in US dairy cattle since the implementation of genomic selection, ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0022030222007093). Periódico identificado pelo prefixo ISSN do PII, [não verificado]. Dado de leite; a transferência para corte não está confirmada.
- **Lead brasileiro não lido:** documento Embrapa sobre tendência genética de peso (1998), [PDF](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/44179/1/Tendencia-Genetica-Peso.pdf).

### Inferences
- **Inversão do exemplo:** r·i = ΔG·L/σg = 2,8 × 5 / 26,3 = 0,532. Para separar r e i, é preciso informar um dos dois.
- **Tendência fenotípica vs. genética:** a fenotípica (média do fenótipo por ano) mistura efeitos ambientais e de manejo; a genética (média de EBV/DEP por ano de nascimento) depende da avaliação genética. Conceito de fundo [não verificado].

### Gaps
- Metodologia de regressão da média de EBV/DEP sobre o ano de nascimento e a forma como associações reportam tendências (ANCP, ABCZ, Angus, BREEDPLAN): não localizada.
- Valores atuais de tendência genética em Nelore ou Angus: não localizados.
- Intensidade de seleção (i) e intervalo de gerações (L) para touros de corte: sem fonte. Conceito de fundo: i a partir da proporção selecionada [não verificado].

## Pergunta-chave 5: Teoria de índices de seleção e valores econômicos

### Takeaway
Índice de Smith–Hazel: b = P⁻¹Gv, com v = pesos econômicos e P e G as covariâncias fenotípica e genética (forma padrão [não verificado na fonte primária]). Hazel (1943) mostrou que um índice com pesos adequados supera a seleção em uma característica por vez. Os valores econômicos (v) são derivados de modelos bioeconômicos de lucro da propriedade.

### Cited Findings
- **Hazel (1943):** *The genetic basis for constructing selection indexes*, Genetics 28: 476–490 (novembro de 1943). Fontes: [PMC1209225](https://pmc.ncbi.nlm.nih.gov/articles/PMC1209225); cópia em [Gwern](https://www.Gwern.net/doc/genetics/selection/artificial/index-selection/1943-hazel-2.pdf). Tese de Iowa State de 1941, segundo o registro em [Open Library](https://openlibrary.org/books/OL186297M).
- **Dados do artigo:** índices construídos com dados de rebanho suíno da Iowa Station (outono de 1937 a primavera de 1940) e comparados em eficiência. Fonte: [Gwern PDF](https://www.Gwern.net/doc/genetics/selection/artificial/index-selection/1943-hazel-2.pdf) (resumo).
- **Requisitos:** resolver o índice exige valores econômicos relativos, desvios-padrão fenotípicos e correlações, herdabilidades e correlações genéticas. Fonte: [Gwern PDF](https://www.Gwern.net/doc/genetics/selection/artificial/index-selection/1943-hazel-2.pdf) (resumo).
- **Eficiência:** o índice com pesos adequados supera a seleção em uma característica por vez. O resumo atribui essa comparação a Hazel e Lush e indica o ano de 1943; a referência clássica de Hazel & Lush é de 1942 [não verificado].
- **Smith (1936):** função discriminante, base do índice de Smith–Hazel. Fonte: [metan, Smith_Hazel](https://search.r-project.org/CRAN/refmans/metan/html/Smith_Hazel.html) (atribuição provisória).
- **Formulação computacional:** coeficientes a partir das matrizes P e G e dos pesos econômicos. Fonte: [metan, Smith_Hazel](https://search.r-project.org/CRAN/refmans/metan/html/Smith_Hazel.html). A notação da documentação é inconsistente.
- **FAO:** Hazel (1943) em índices de seleção para melhoramento de plantas. Fonte: [FAO](https://www.fao.org/4/y5843e/y5843e08.htm).
- **Índice como soma ponderada (BREEDPLAN):** o $Index é soma ponderada de EBVs. Animais com o mesmo índice podem diferir em características individuais. Exemplo da UNE: dois touros com $63 diferindo em crescimento e facilidade de parto. Fonte: [UNE, BREEDPLAN guide](https://breedplan.une.edu.au/media/dtqpdm34/using-and-understanding-breedplan-ebvs.pdf).
- **Origem dos pesos (BREEDPLAN/BreedObject):** software do AGBU/UNE. Pesos ligados a custos de produção e retornos de produto, via ligações genéticas entre EBVs e lucro. Fontes: [FutureBeef](https://futurebeef.com.au/resources/breedplan-ebvs/); [MLA, BreedObject](https://mbfp.mla.com.au/cattle-genetics/1-use-breedobject/).
- **Exemplo MLA (valores de referência, possivelmente desatualizados):** peso vivo de venda direta ~ $0,614/kg (valor relativo 14,7); rendimento de carcaça ~ $9,57 por ponto percentual (VR 9,9); carne vendável ~ $7,81 por ponto percentual (VR 11,6). Fonte: [MLA, BreedObject](https://mbfp.mla.com.au/cattle-genetics/1-use-breedobject/).
- **Índice terminal:** pode trabalhar contra rebanhos que mantêm as próprias matrizes de reposição. Fonte: [UNL, Economic Indexes for Beef Sire Selection](https://beef.unl.edu/sites/unl.edu.ianr.beef/files/media/file/Economic%20Indexes%20for%20Beef%20Sire%20Selectiong1847.pdf).
- **MGTe:** pesos derivados do efeito de cada característica no lucro, em combinação linear de DEPs padronizadas. Fonte: [Seminário ANCP 2016](https://www.slideshare.net/slideshow/04-fernando-seminario/62118028) (atribuição provisória).
- **Leads de revisão, não lidos:** "Development of breeding objectives for beef cattle breeding: derivation of economic values", [ResearchGate](https://www.researchgate.net/publication/228730090_Development_of_breeding_objectives_for_beef_cattle_breeding_derivation_of_economic_values_review_article); "Selection indexes for bulls of beef cattle", [ResearchGate](https://www.researchgate.net/publication/238777259_Selection_indexes_for_bulls_of_beef_cattle).
- **Citações do escopo não localizadas:** Harris (1970) e Ponzoni & Newman (1989). Smith (1936) aparece só como origem do índice, sem fonte primária. Detalhes bibliográficos [não verificados].

### Inferences
- Como o índice é combinação linear, I = Σ wᵢ·EPDᵢ. Multiplicar todos os pesos por uma constante não muda a ordem dos animais.
- Acurácia do índice (forma padrão de fundo): r_IH = √(b'Pb / v'Gv) [não verificado; sem fonte localizada].
- Pesos sobre DEP bruta (Geneplus IQG) e pesos sobre DEP padronizada (MGTe) não são diretamente comparáveis (inferência, ver Pergunta 3).

### Gaps
- Fontes primárias de Harris (1970) e Ponzoni & Newman (1989): não localizadas.
- Derivação atual de valores econômicos para corte (preço, custo, sistema de produção): não localizada além do exemplo MLA.
- Índices de Hereford (BMI$, CHB$, BII$), IGS ($CHB, $API, $TI), CRV, Paint e Conexão Delta G: não pesquisados nesta rodada.

## Pergunta-chave 6: Índices comerciais e pesos publicados

### Takeaway
Os $Values da Angus têm seis índices (M, W, F, G, B, C), com definições verificadas, mas sem os pesos numéricos. São atualizados anualmente com premissas de mercado da CattleFax; segundo a fonte, usam média móvel de 7 anos. Os pesos numéricos mais completos desta pesquisa são os do iABCZ (2024). Os pesos do BREEDPLAN $Index não foram recuperados.

### Cited Findings
- **$M:** valor em dólares por cabeça; cobre o lucro da concepção à desmama numa fazenda autorrenovável, com reposição de 25% das matrizes na 1ª geração e 20% nas seguintes. Fonte: [Angus, $Value Indexes](https://www.angus.org/tools-resources/national-cattle-evaluation/epd-value-definitions/value-indexes).
- **$W:** valor em dólares por cabeça; desempenho pré-desmama (peso ao nascer, peso à desmama, leite materno, tamanho adulto da vaca). Mesma fonte.
- **$F:** desempenho pós-desmama em confinamento; valor em dólares por carcaça. Fonte: [Angus, $Value Indexes](https://www.angus.org/Nce/ValueIndexes) (atribuição provisória).
- **$G:** mérito de carcaça em grade (qualidade e rendimento), assumindo comercialização por grade. Fonte: [Angus, $Value Indexes](https://www.angus.org/Nce/ValueIndexes) (atribuição provisória).
- **$B:** não é a soma simples de $F e $G; há ajustes para evitar dupla contagem de peso entre confinamento e carcaça. Fonte: [Angus, $Value Indexes](https://www.angus.org/Nce/ValueIndexes) (atribuição provisória).
- **$C:** combina os índices maternal e terminal. Mesma fonte.
- **Atualização:** Angus Genetics Inc., American Angus Association e Certified Angus Beef atualizam as premissas com a CattleFax anualmente, a partir de uma média móvel de 7 anos de tendência de mercado. A diretoria aprovou a atualização em julho, e não no período tradicional de dezembro. Fonte: [Angus Journal, julho de 2025, "Selection Based on $Values"](https://www.angus.org/angus-media/angus-journal/2025/07/by-the-numbers) (atribuição provisória, resumo do resultado).
- **Novos traços:** quando um traço entra no índice, os pesos econômicos são realocados entre os EPDs existentes e os novos. Fonte: [Angus Journal, maio de 2025](https://www.angus.org/angus-media/angus-journal/2025/05/new-maternal-epds-expand-selection-tools-for-users-of-angus-genetics) (atribuição provisória).
- **Premissa de exemplo:** preço de novilho de $185/cwt, em página Angus sem data. Pode estar desatualizada.
- **iABCZ e MGTe:** ver Pergunta-chave 3.

### Inferences
- O $Value de um touro tem a forma geral Σ (valor econômico por unidade de EPD × EPD). Os coeficientes exigem a tabela oficial [não verificado para os pesos Angus].
- Índices de programas diferentes não são comparáveis sem as mesmas premissas econômicas.

### Gaps
- Pesos numéricos atuais de $M, $W, $F, $G, $B e $C: não recuperados. Próxima busca sugerida: a metodologia de $Value publicada pela Angus (PDF da página de definições).
- Pesos atuais do BREEDPLAN $Index: não recuperados.
- Hereford (BMI$, CHB$, BII$), IGS ($CHB, $API, $TI), CRV, Paint e Conexão Delta G: não pesquisados.

## Pergunta-chave 7: Fatores de ajuste entre raças (AB-EPD, USMARC)

### Takeaway
AB-EPD = EPD da raça + fator da raça. Os fatores são diferenças entre raças medidas no Germplasm Evaluation Program do USMARC, ajustadas pelos EPDs dos touros amostrados. A referência é a base Angus, escolhida arbitrariamente. Cobrem 18 raças (documento de 2024). Exemplo de 2023: 90,0 − 24,8 = 65,2; 92,0 − 39,3 = 52,7.

### Cited Findings
- **Objetivo:** as associações usam bases diferentes, então EPDs de raças distintas não são comparáveis diretamente. Os fatores colocam touros de 18 raças numa escala única somando o fator ao EPD. Fonte: [USDA-ARS, ABEPD 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf).
- **Método:** diferenças de raça medidas no Germplasm Evaluation Program, ajustadas pelos EPDs dos touros amostrados. Fontes: [Angus, ABEPD 2023](https://www.angus.org/Pub/2023-ABEPD-pressreleaseandfactsheet.pdf); [BIF, 2023](https://beefimprovement.org/23acrossbreedepd/).
- **Características:** peso ao nascer, peso à desmama, peso ao ano, leite materno, marmoreio, área de olho de lombo, espessura de gordura e peso de carcaça. Fonte: [USDA-ARS, 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf).
- **Base:** Angus, escolhida arbitrariamente. Fonte: [USDA-ARS, 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf).
- **Exemplo:** fatores de −24,8 lb (Red Angus) e −39,3 lb (Hereford) sobre EPDs de peso ao ano de 90,0 e 92,0 lb, resultando em AB-EPDs de 65,2 e 52,7 lb. Fonte: [Angus, ABEPD 2023](https://www.angus.org/Pub/2023-ABEPD-pressreleaseandfactsheet.pdf).
- **Datas de início conflitantes:** fatores de carcaça desde 2008 (tabela de 2010) ou 2009 (documento de 2024); peso de carcaça acrescentado em 2015. Fontes: [USDA, tabela 2010](https://digitalcommons.unl.edu/usdaarsfacpub/799/); [USDA-ARS, 2024](https://www.ars.usda.gov/ARSUserFiles/30400505/GPE/2024%20ABEPD%20press%20release%20and%20fact%20sheet.pdf).
- **Atualização anual:** a tabela de 2026 foi divulgada. Fonte: [Drovers, 2026](https://www.drovers.com/news/beef-production/accurately-comparing-bulls-2026-adjustment-factors-released). Os fatores de 2023 refletem animais nascidos em 2021 (atribuição provisória, [BIF, 2023](https://beefimprovement.org/23acrossbreedepd/)).
- **Uso restrito:** os fatores servem apenas para comparar EPDs entre raças. Fonte: [Western Livestock Journal](https://www.wlj.net/top_headlines/updated-across-breed-epd-adjustment-factors-released/article_435cf97e-2005-11e9-9a09-7f7ba210bc23.html).

### Inferences
- Diferença de AB-EPD entre um touro da raça A e outro da raça B = (EPD_A − EPD_B) + (fator_A − fator_B). Dentro da mesma raça, o fator se cancela.
- Como o fator é aditivo, o AB-EPD tem a mesma acurácia do EPD de origem. Inferência; a acurácia dos fatores não foi localizada.

### Gaps
- Valores dos fatores de 2026: não recuperados.
- Equações de estimação dos fatores: não localizadas; apenas o princípio.
- Sinal dos fatores: o exemplo de 2023 soma fatores negativos. Confirmar a convenção de sinal na tabela vigente.
