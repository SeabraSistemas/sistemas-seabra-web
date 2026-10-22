# Guia de aplicação por demanda

**Central de Melhoramento Seabra.** Versão 1, 15/10/2026. Documento interno das equipes comercial e técnica.

Este guia liga a demanda de um cliente ao modelo, aos dados e aos indicadores. Parte dos quatro relatórios de pesquisa da série e do motor do Laboratório de Modelos. Para cada demanda, diz o que oferecer, que dados pedir, que modelo rodar e com qual função do motor, que indicadores e metas entregar, o que não prometer e o que é preciso no SeabraApp.

> **Dados fictícios.** Todos os rebanhos, animais e números dos exemplos são inventados. Nenhum representa um cliente real.

| Marcador | Significado |
|---|---|
| **Corte**, **Leite**, **Caprinos**, **Ovinos** | os quatro relatórios em `reports/` (*Avaliação genética de bovinos de corte*, *de bovinos leiteiros*, *de caprinos leiteiros*, *de ovinos leiteiros*); entre aspas, o título da seção; "Ex. n", o exemplo numérico n |
| **Verif. ovinos** | `research_notes/Verificação de fontes/verificacao_ovinos.md`. O relatório de ovinos v2 (15/10/2026) já incorpora a verificação; "correção n" e "conflito" remetem às seções dela |
| `módulo.função` | função do pacote `melhoramento`, em `central-melhoramento/laboratorio/` (128 testes, 18 deles contra os exemplos oficiais de Mrode et al. 2023) |
| **README** | `central-melhoramento/laboratorio/README.md` |
| **[proposta]** | meta ou regra proposta pelo relatório citado, sem fonte primária que a fixe |
| **[equipe]** | recomendação da equipe Seabra feita neste guia, sem fonte nos relatórios |
| **[a definir]** | falta decisão ou dado; lista completa na seção 9 |
| **[não verificado]** | item que o relatório de origem não confirmou na fonte primária |

---

## 1. Como usar este guia

O cliente chega com uma frase: "quero saber que cabras descartar", "quero escolher o touro", "quero vender reprodutores", "quero um sumário da raça". A triagem (seção 2) define o nível, de 0 a 3. A seção 3 diz o que cada nível entrega e onde ele para. A seção 4 traz, por espécie, parâmetros, metas e programas. As seções 5 e 6 tratam dos dados e do caminho do modelo até o app. A seção 7 dá frases-modelo para o produtor. A seção 8 mostra quatro atendimentos fictícios com números do motor.

Três regras valem para tudo, porque os quatro relatórios chegam a elas por caminhos independentes:

1. **Não estimar parâmetros com os dados do rebanho.** Cem registros de 5 touros estimam a herdabilidade com desvio-padrão de 0,30, e 17,5% das estimativas saem negativas (Corte, "Estimar parâmetros dentro da fazenda é quase sempre ruído"). Herdabilidade, repetibilidade e variâncias vêm da literatura (seção 4), com análise de sensibilidade.
2. **A precisão vem de conectar, não de modelar mais.** Dez filhas de um bode num só rebanho dão confiabilidade de 0,17 a 0,20; as mesmas dez filhas em dez rebanhos dão 0,31. Um reprodutor cujas filhas não têm contemporâneas de outro pai não tem avaliação nenhuma (Caprinos, Ex. 3; Ovinos, Ex. 4).
3. **Todo número sai com a sua incerteza.** Taxa com intervalo de confiança (Caprinos, Ex. 7); valor genético com confiabilidade e escala declaradas (Corte, "Passo 3: da PEV à acurácia e à DEP"); o parâmetro usado ao lado (README, "Roteiro para portar ao SeabraApp").

**Fluxograma de triagem**

```
DEMANDA
  │
  ├─ O cliente é associação, núcleo ou programa de raça (vários rebanhos; quer sumário ou índice)?
  │     └─ sim ─► NÍVEL 3: programa ............................................ seção 3.4
  │
  └─ O cliente é produtor (um rebanho ou poucos)
        │
        ├─ Tem pai e mãe registrados e controle leiteiro ou pesagens com data?
        │     ├─ não ─► NÍVEL 0: rebanho em números + plano para subir de nível .. seção 3.1
        │     └─ sim ─► NÍVEL 1: genética dentro de casa ........................ seção 3.2
        │
        └─ Está em controle oficial ou programa, usa IA com reprodutores avaliados
           ou quer vender reprodutores?
              └─ sim ─► NÍVEL 2: rebanho conectado (soma-se ao 0 ou ao 1) ....... seção 3.3

Em todos os casos: espécie (seção 4) ─► dados (seção 5) ─► onde roda (seção 6) ─► mensagem (seção 7)
```

**Demanda, porte, espécie e pacote**

| Demanda típica | Porte | Espécie | Pacote | Exemplo |
|---|---|---|---|---|
| "Que fêmeas descartar e que metas perseguir?" | qualquer; comum em 20 a 200 matrizes | todas | Nível 0 | 8.1 |
| "Qual reprodutor usar sem errar na endogamia?" | com pedigree | todas | Níveis 1 e 2 | 8.2 |
| "Quero vender reprodutores." | médio e grande | corte, leite, caprinos | Nível 2 obrigatório, com o 1 dentro de casa | 8.4 |
| "Quero um sumário ou um índice da raça." | associação | todas | Nível 3 | 8.3 |
| "Quero genotipar." | qualquer | todas | Nível 2, só por programa com referência | 4.1 a 4.4 |
| "Quero importar sêmen." | qualquer | sobretudo ovinos | Nível 2, com desconto entre ambientes | 4.4 |
| "Quero reduzir células e mastite." | com controle | leite, caprinos, ovinos | Níveis 0 e 1 | 4.2 a 4.4 |

---

## 2. Triagem da demanda

### 2.1 Perguntas de entrada

| # | Pergunta | Aonde a resposta leva |
|---|---|---|
| 1 | Quem é o cliente: produtor, grupo de produtores ou associação? | produtor: níveis 0 a 2; grupo que troca reprodutores: nível 1 com análise conjunta (2.2); associação: nível 3 |
| 2 | Espécie e raça; pura, mestiça ou composta? | seção 4 da espécie; ver se a raça tem programa no Brasil |
| 3 | Quantas matrizes? | ferramentas por porte (2.3) |
| 4 | Há pai e mãe registrados? Na monta natural, o reprodutor de cada lote? Código do sêmen? | sem pai nem mãe: nível 0; com pai e mãe da maioria das fêmeas: nível 1 (limiar exato [a definir]) |
| 5 | Há controle leiteiro ou pesagens com data? Oficial ou do produtor? | sem medida: o pacote começa por implantar o registro; com medida: níveis 0 e 1 |
| 6 | O rebanho está em associação, controle oficial ou programa? | sim, ou quer entrar: nível 2 |
| 7 | Usa IA com reprodutores de PTA ou DEP publicada? Em que fração das fêmeas? | sim: há âncora de comparação (3.3); não: recomendar como primeiro passo |
| 8 | Há genotipagem? | só rende dentro de programa com referência (3.3 e 3.4) |
| 9 | Objetivo: vender reprodutor, produzir mais, reduzir descarte, certificar, controlar endogamia? | vender ou certificar: nível 2 obrigatório; produzir mais: níveis 0 e 1 e compra de reprodutor avaliado; descarte: MPPA e taxas; endogamia: F por par |
| 10 | Como o produto é pago: volume, sólidos, queijo, arroba, genética? | define o índice econômico (Leite, "Índices econômicos"; Caprinos, Ex. 4; Ovinos, Ex. 3) |
| 11 | Onde estão os registros: papel, planilha, outro software? | importação e limpeza (formato [a definir]) |

### 2.2 Como decidir o nível

O nível é o mais alto cujas condições mínimas o cliente cumpre, e os níveis se somam: quem está no 2 recebe também o 0 e o 1. **Nível 0:** sem pedigree, ou com pedigree incompleto demais para montar a matriz de parentesco. **Nível 1:** pai e mãe registrados e medidas com data (controle pelas regras da ICAR ou pesagens nas janelas do programa). **Nível 2:** usa reprodutores avaliados, está em controle oficial ou programa, ou quer vender reprodutores com avaliação. **Nível 3:** associação ou programa que quer avaliar a população. Três ou mais rebanhos que registram da mesma forma e trocam reprodutores podem ser analisados juntos, como população conectada (Ovinos, "Estratégia por porte de rebanho no Brasil" [proposta]): na prática, um nível 1 com vários rebanhos.

### 2.3 Porte

Cada relatório propõe faixas de porte [proposta]: corte, 100 a 500, 500 a 2.000 e mais de 2.000 vacas; leite, 30 a 200, 200 a 1.000 e mais de 1.000 vacas; caprinos e ovinos, 20 a 50, 50 a 200 e 200 a 1.000 matrizes (seções "Estratégia por porte" dos quatro relatórios). Nas faixas menores, o essencial é comprar reprodutores avaliados e usar as ferramentas de fórmula fechada. Nas médias, entra o modelo animal com parâmetros externos. Nas maiores, a avaliação multicaracterística conectada à nacional e a genotipagem via programa. As frases do cliente que pedem cuidado ("quero estimar a herdabilidade do meu rebanho", "quero comparar meu bode com o sumário", "a acurácia do meu touro é 70%") têm resposta na seção 7.4.

---

## 3. Pacotes por nível

Cada pacote traz público, entregas, dados mínimos, modelo, limites e funções do motor. O quadro 3.5 liga cada análise à função que a executa.

### 3.1 Nível 0: rebanho em números

**Para quem.** Produtor sem pedigree, ou com pedigree incompleto. Comum em cabras e ovelhas de 20 a 200 matrizes e em gado de corte com monta natural em lotes de touros.

**Entrega**

1. **Produção padronizada.** Cabras e ovelhas: lactação de Fleischmann pelas regras da Seção 16 da ICAR, declarando TMY (ordenha desde o parto) ou TMM (só a ordenha exclusiva, depois da separação das crias) e o comprimento de referência (Caprinos, "Pela ICAR, só o leite da ordenha exclusiva entra na conta"; Ovinos, "A ICAR só mede depois do desmame"). Vacas: TIM até 305 dias (Leite, "Do controle ao total"). Se o controle parou no meio da lactação, o TIM superestima 8% a 9%, e a curva de Wood ajustada a quatro controles bem posicionados erra 0,5% (Caprinos, Ex. 1). Corte: peso na idade-padrão do programa (Corte, "Antes do modelo: padronizar idades e formar os grupos").
2. **Desvio das contemporâneas:** mesma ordem de parto (primípara ou adulta), estação e ano, e mesmo sistema de aleitamento (Caprinos, "Não estimar parâmetros dentro do rebanho"). Em corte, a razão BIF: registro sobre a média do GC, vezes 100, por sexo (Corte, "Ferramentas que funcionam com N pequeno").
3. **MPPA para descarte**, com três repetibilidades (Corte, "Ferramentas que funcionam com N pequeno"; Caprinos, Ex. 6).
4. **Indicadores** com numerador, denominador e intervalo de confiança; poder para comparar anos; janelas móveis de 12 meses e CUSUM (Caprinos, Ex. 7; Leite, "Toda taxa precisa de intervalo de confiança").
5. **Células** pelo escore logarítmico e pela média geométrica, nunca pela aritmética, e fração de controles acima do limiar (Caprinos, "Curva, componentes e células").
6. **Metas por categoria** (seção 4), relativas onde não há referência brasileira.
7. **Plano de reprodutores:** Ne e ΔF do esquema atual e ganho esperado de cada opção de compra (Caprinos, Ex. 5 e 8).
8. **Plano de registro para subir de nível** (seção 5).

**Dados mínimos.** Identificação, sexo e nascimento das fêmeas; partos com data, ordem e crias; em cabras e ovelhas, data da separação das crias; controles com data (pelo menos três) e secagem; exposição à reprodução por lote, diagnóstico de gestação e saídas com motivo. Em corte, pesagens com data, lote e sexo.

**Modelo.** Sem BLUP. As repetibilidades estão na seção 4.

```
MPPA = μ + [n·r / (1 + (n − 1)·r)]·(ȳ − μ)          n registros, repetibilidade r; com desvios, μ = 0
EBV só com registros próprios = [n·h² / (1 + (n − 1)·r)]·(ȳ − μ)
```

(Corte, "Ferramentas que funcionam com N pequeno"; Leite, "Comparar com contemporâneas e ranquear com repetibilidade"; Caprinos, Ex. 6.)

**O que o nível 0 não permite concluir**

- **Valor genético.** A MPPA soma genética e ambiente permanente: serve para descartar, não para escolher de quem guardar filhas (Caprinos, Ex. 6).
- **Endogamia por par.** Sem pedigree, só valem as regras gerais: trocar o reprodutor a cada geração e nunca usar o filho do reprodutor da casa nas parentes (Caprinos, Ex. 8; Ovinos, Ex. 7).
- **Mudança de um ano para outro.** Ver o aborto passar de 10% para 20% com 80% de poder exige 199 gestações por ano; com 30, o poder é de 19% (Caprinos, Ex. 7).
- **Comparação fora do grupo.** O desvio só compara dentro do GC; o Capragene eliminava grupos com menos de três cabras (Caprinos, "Modelo de lactação").
- **Média do rebanho como referência.** O desvio-padrão da PL305 vai de 36% a 60% da média; em 20 a 50 cabras, mostrar mediana e intervalo (Caprinos, "Os indicadores do rebanho e como calculá-los").
- **Lactação certificada com o método D.** Em cabras, 2 a 4 controles por ano ranqueiam sem certificado ICAR (Caprinos, "Pela ICAR"); em ovelhas, dois controles no meio da lactação superestimam a TMM em 16% (Ovinos, Ex. 1).

**Funções do motor.** Linhas de nível 0 do quadro 3.5. A razão BIF, o peso padronizado de corte e os intervalos entre datas (IEP, idade ao primeiro parto) não têm função no motor [a definir].

### 3.2 Nível 1: genética dentro de casa

**Para quem.** Produtor com pai e mãe registrados e controle ou pesagens com data, que quer escolher reprodutor, decidir reposição e controlar endogamia.

**Entrega**

1. Tudo do nível 0.
2. **EBV da fêmea por índice de seleção**, com os registros dela e a PTA (ou o EBV) do pai: a lista de reposição, sempre ao lado da MPPA, a lista de descarte (Caprinos, Ex. 6; Ovinos, Ex. 5; Leite, "Comparar com contemporâneas").
3. **BLUP intra-rebanho:** modelo animal com grupo de contemporâneos, inversa da matriz de parentesco e, nas características repetidas, ambiente permanente. Saem EBV, PTA ou DEP (EBV/2), PEV, confiabilidade com (1 + F), acurácia, acurácia BIF e erro-padrão (Corte, Passos 2 e 3). Em corte, direto-materno até a desmama e multicaracterística depois (Corte, "Pesos até a desmama" e "Pesos depois da desmama").
4. **Endogamia:** F de cada animal e de cada acasalamento planejado (metade do parentesco entre os pais) e escolha do reprodutor por par (Leite, "Endogamia: decidir por par, não por touro"; Caprinos, Ex. 8). O alerta de 6,25% é [proposta] do relatório de caprinos, em revisão no Reino Unido (Leite, mesma seção): é alerta, não regra.
5. **Confiabilidade dos reprodutores pela estrutura dos dados**, para decidir quantas fêmeas cada um cobre (Caprinos, Ex. 3; Ovinos, Ex. 4).
6. **Sensibilidade:** h² e repetibilidade nas pontas da faixa publicada, conferindo se o topo do ranking muda (Corte, "Parâmetros externos e prioris informativas").

**Dados mínimos.** Os do nível 0, mais pai e mãe (na monta natural, o reprodutor de cada lote com datas de entrada e saída), cada cobertura ou IA com o reprodutor, e a avaliação publicada dos reprodutores externos com confiabilidade, escala, base e data (Ovinos, "O que o rebanho ovino leiteiro precisa registrar no SeabraApp").

**Modelo**

```
y = Xb + Za + Wp + e        a ~ N(0, A·σ²a)   p ~ N(0, I·σ²pe)   e ~ N(0, I·σ²e)
REL = 1 − PEV/[(1 + F)·σ²a] ;  PTA (DEP) = EBV/2
Índice da fêmea: x₁ = ȳ − μ (n desvios) ; x₂ = PTA do pai com confiabilidade REL
  P = [[σ²P·(r + (1 − r)/n), REL·σ²a/4], [REL·σ²a/4, REL·σ²a/4]] ;  g = [σ²a ; REL·σ²a/4] ;  b = P⁻¹g
```

(Corte, "Passo 2" e "Passo 3"; Caprinos, Ex. 6.) Em ovinos, os programas publicam o EBV do carneiro, e o índice usa essa forma (Ovinos, Ex. 5; `indices.indice_femea` com `escala_pai="EBV"`). O motor trata o GC como fixo. O Capragene passou a tratá-lo como aleatório em 2020 e ganhou 6% de confiabilidade média (Caprinos, "Modelo de lactação"); o GC aleatório não está no motor [a definir].

**Quando a confiabilidade é baixa demais**

- **Fêmeas:** 0,29 a 0,44 em cabras com uma a quatro lactações (Caprinos, Ex. 6) e 0,41 a 0,56 em ovelhas (Ovinos, Ex. 5; a REL da ovelha O2 é 0,4945 pelo motor, não 0,50: README, "Discrepâncias encontradas"). São valores normais: a primeira lactação é triagem, não sentença (Leite, "Metas por categoria").
- **Reprodutores locais:** sem filhas de outro pai no mesmo grupo, REL zero; com 10 filhas ao lado de 10 de outro bode local, 0,17 (Caprinos, Ex. 3). Um bode de IA comum aos rebanhos muda isso (seção 8.3, C3).
- **Grupos pequenos:** com h² de 0,25, um GC de 2 animais limita a acurácia a 0,354, contra o teto de 0,50 (Corte, "Antes do modelo"; seção 8.4, D1).
- **Limiares dos programas:** o Capragene publica bodes Alpinos com REL de pelo menos 0,50, GPTAs da Saanen com 0,70 e cabras candidatas a mãe de bode com 0,40 (Caprinos, "Metas por categoria"); o Interbeef publica o efeito direto com confiabilidade de pelo menos 0,5 e 25 progênies (Corte, "Os programas de N muito grande").
- **Rótulos na tela [equipe; a validar]:** REL abaixo de 0,30, "baixa: só triagem"; de 0,30 a 0,50, "moderada: poucas fêmeas"; 0,50 ou mais, "pode orientar uso intenso". O corte de 0,50 segue o mínimo do Capragene para bodes; o de 0,30 é escolha da equipe.

**Limites.** Os EBVs internos só se comparam entre si, nunca com PTAs de sumário (README, "Limites"; Caprinos, "BLUP e genômica dentro do rebanho"). Reprodutores de monta natural sem filhas fora ficam com confiabilidade baixa, por melhor que seja o modelo (Caprinos, Ex. 3). O resultado só é tão bom quanto o pedigree; na monta múltipla, a paternidade pede DNA ou lotes de um reprodutor (Corte, "BLUP intra-rebanho"). As variâncias entram como parâmetros, e o motor monta as matrizes por inteiro, o que serve até alguns milhares de animais (README, "Limites").

**Funções do motor.** Linhas de nível 1 do quadro 3.5; no pipeline caprino, `rebanho.avaliar_femeas` e `rebanho.avaliar_acasalamentos`.

### 3.3 Nível 2: rebanho conectado a programa

**Para quem.** Produtor em controle oficial ou programa (ou que quer entrar), que usa IA com reprodutores avaliados ou que quer vender reprodutores com avaliação.

**Entrega**

1. **Plano de conexão.** Reprodutores avaliados como âncora: as filhas deles são as contemporâneas de referência que dão avaliação aos reprodutores locais (Caprinos, "Conectividade"; Ovinos, "BLUP e genômica dentro do rebanho"). Em corte, vários touros por GC e touros de referência repetidos entre safras (Corte, "Estratégia por porte de rebanho").
2. **Escolha de reprodutor com incerteza:** probabilidade de superar, índice econômico ligado ao pagamento e Possible Change na escala declarada (Corte, "Passo 3" e "Índice de seleção"; Leite, "Índices econômicos").
3. **Envio de dados** no formato do controle oficial ou do programa, com as regras da seção 5.5 (formato de cada programa [a definir]).
4. **Retorno dos resultados oficiais** para o app, separados dos internos, com base e data [equipe].
5. **Genotipagem via programa** onde há referência: zebuínas de corte (ANCP; ABCZ com Embrapa-Geneplus), Gir e Girolando (Embrapa), Saanen (Capragene). Em ovinos não há referência no Brasil; o DNA serve para paternidade e PRNP (Ovinos, "BLUP e genômica dentro do rebanho").
6. **Genética importada:** desconto da correlação entre ambientes e absorção por gerações (Ovinos, Ex. 8).
7. **Ganho esperado** de cada plano de compra (Caprinos, Ex. 5; Corte, "Resposta à seleção").

**Dados mínimos.** Os do nível 1, mais a identificação dos reprodutores externos no padrão do programa e a avaliação de origem com data, base, confiabilidade e escala.

**Como medir a conexão.** Reprodutores em comum e fração de filhas de IA; a França propôs o CACO, com média de 0,34 (Caprinos, "Conectividade"), que não está no motor [a definir]. Regras práticas: GC com pelo menos 10 laços genéticos diretos na GenSys (Corte, "Antes do modelo"); bode com filhas em pelo menos 15 rebanhos e 30 filhas indexadas na França (Caprinos, "PTA, base e confiabilidade"); carneiro com 40 filhas em 5 a 10 rebanhos na ROLP (Ovinos, "Esquema de carneiros"), o que dá REL de 0,68 a 0,69 pelo motor (seção 4.4). Correlação entre ambientes: 0,86 para leite entre Lacaune grega e francesa, 0,70 entre Latxa e Manech (Verif. ovinos, "Hipóteses do Exemplo 8"); 0,22 a 0,45 para leite de cabra entre França e Itália (Caprinos, "Conectividade").

**Limites.** A base de muitas avaliações é móvel (Caprinos, "PTA, base e confiabilidade"; Leite, "Base genética: o zero é móvel"). DEPs de programas diferentes não se comparam, nem dentro da raça (Corte, "Os programas de N muito grande"). A escala muda o sentido: r = 0,50 equivale a acurácia BIF de 0,134 (Corte, "Passo 3"). O índice importado traz o objetivo de quem o fez: o ISOL dá metade do peso a células e úbere e não seleciona volume (Verif. ovinos, conflito "Composição do ISOL"); a MFP$ americana pesa a proteína 255 vezes mais que o leite por unidade (Caprinos, Ex. 4). Teste genômico comercial fora da população de treino pode não acrescentar informação (Corte, "Informação externa").

**Funções do motor.** Linhas de nível 2 do quadro 3.5, mais `confiabilidade.rel_media_pais` e `ganho.resposta_selecao`.

### 3.4 Nível 3: associação ou programa de raça

**Para quem.** Associação, núcleo ou programa que quer avaliar a população: sumário, índice, esquema de seleção e, se houver, genômica.

**Entrega**

1. **Diagnóstico da base:** rebanhos, reprodutores em comum, fêmeas por GC, completude do pedigree e conformidade dos controles com a ICAR (seção 5.5).
2. **Especificação do modelo:** animal uni ou multicaracterística com ambiente permanente; GC fixo ou aleatório; direto-materno onde couber; grupos de pais desconhecidos ou metafundadores quando há origens desconhecidas ou várias raças (Corte, "Equação, pressupostos e efeitos"; Ovinos, "O modelo francês"); variância heterogênea entre rebanhos (Ovinos, Ex. 2; Leite, "Modelo de lactação").
3. **Variâncias** da população por REML ou Gibbs (Corte, "Variâncias: REML, AI-REML e Gibbs"), fora do motor.
4. **Sumário:** PTA ou DEP com confiabilidade e base declaradas, critério de publicação e Possible Change (Corte, "Passo 3"; Caprinos, "PTA, base e confiabilidade").
5. **Índices econômicos** ligados ao sistema de produção, com ênfase relativa declarada (Corte, "Índice de seleção"; Leite, "Índices econômicos").
6. **Esquema de seleção e ganho esperado,** com o tamanho efetivo da população (Caprinos, Ex. 5 e "Endogamia na população").
7. **Genômica, se houver genotipagem:** ssGBLUP (fora do motor) e expectativa de acurácia pela fórmula de Daetwyler (Caprinos, "Uma referência de centenas de animais rende acurácia de 0,3 a 0,6").
8. **Validação** dos rankings com dados futuros pelo método LR (Corte, "Validação e tamanho da população de referência"), fora do motor.

**Limites.** O motor resolve as MME por matriz densa; avaliações grandes usam métodos iterativos e PEV aproximada, e REML, Gibbs, ssGBLUP, regressão aleatória, limiar e sobrevivência estão fora dele (README, "Limites"); grupos de pais desconhecidos e Gauss-Seidel entraram na validação contra Mrode et al. (2023); para eles, a Central precisa de software de terceiros ou de parceiro [a definir]. Referência genômica pequena rende pouco (seção 8.3, C6). Em raças com programa nacional, uma avaliação paralela gera PTAs incompatíveis com as oficiais: a recomendação é reforçar a conexão e o fluxo de dados para o programa existente [equipe].

**Funções do motor.** Linhas de nível 3 do quadro 3.5, mais `blup.modelo_touro`, `blup.repetibilidade_direto_materno` e `parentesco.ne_de_delta_F`.

### 3.5 Quadro-resumo: análise, função do motor e nível

| Análise | Função do motor | Nível | Fonte da forma |
|---|---|---|---|
| Lactação de cabra ou ovelha (TMY/TMM, regras ICAR) | `lactacao.lactacao_pequenos_ruminantes`; `lactacao.fim_icar` | 0 | Caprinos, Ex. 1; Ovinos, Ex. 1 |
| Lactação de vaca até 305 dias e sólidos | `lactacao.tim`; `lactacao.producao_componente` | 0 | Leite, "Do controle ao total" |
| Curva de Wood, pico e total pela curva | `lactacao.ajustar_wood_loglinear`; `lactacao.ajustar_wood_gauss_newton`; `lactacao.pico_wood`; `lactacao.total_pela_curva` | 0 | Leite; Caprinos, Ex. 1 |
| Controle de uma ordenha (AT, AC) | `lactacao.controle_at`; `lactacao.controle_ac` | 0 | Ovinos, Ex. 1 |
| Escore e média geométrica de células | `lactacao.ecs`; `lactacao.ccs_media_geometrica` | 0 | Leite, "Sólidos, energia e células" |
| FCM e ECM (declarar o divisor) | `lactacao.fcm4`; `lactacao.ecm` | 0 | idem |
| Lactações e desvios das contemporâneas (pipeline caprino) | `rebanho.padronizar_lactacoes`; `rebanho.desvios_contemporaneas` (generalizar [a definir]) | 0 | Caprinos, "Não estimar parâmetros" |
| MPPA | `indices.mppa`; `indices.fator_mppa`; `indices.ebv_registros_proprios` | 0 | Corte; Caprinos, Ex. 6 |
| Taxa com intervalo | `taxas.ic_wald`; `taxas.ic_wilson`; `taxas.ic_exato`; `taxas.ic_media_t` | 0 | Caprinos, Ex. 7 |
| Tamanho amostral e poder | `taxas.n_por_grupo`; `taxas.tamanho_amostral_duas_proporcoes`; `taxas.poder_duas_proporcoes` | 0 | Caprinos, Ex. 7; Leite |
| Taxa encolhida e CUSUM | `taxas.taxa_encolhida` [proposta do relatório de leite]; `taxas.cusum` | 0 | Leite; Caprinos, Ex. 7 |
| Ne, ΔF, F acumulado, machos para um Ne | `parentesco.ne_wright`; `parentesco.delta_F`; `parentesco.F_acumulado`; `parentesco.n_machos_para_ne`; `parentesco.numero_efetivo_pais` | 0 | Caprinos, Ex. 8; Ovinos, Ex. 7 |
| DPR a partir de dias abertos | `ganho.dpr_aipl`; `ganho.dpr_linear` | 0 | Leite, "Fertilidade" |
| Matriz A, F e A⁻¹ | `parentesco.matriz_A`; `parentesco.coeficientes_F`; `parentesco.inversa_A` | 1 | Corte, "Passo 1" |
| F de acasalamento e escolha por par | `parentesco.F_acasalamento`; `parentesco.tabela_F_acasalamentos`; `parentesco.escolher_reprodutor`; `parentesco.escolher_reprodutores` | 1 | Leite; Caprinos, Ex. 8 |
| EBV da fêmea com a PTA ou o EBV do pai | `indices.indice_femea` | 1 | Caprinos, Ex. 6; Ovinos, Ex. 5 |
| Modelo animal (EBV, PEV, REL, r, a_BIF, DEP) | `blup.modelo_animal`; `blup.dep_de_ebv`; `confiabilidade.rel_de_pev` | 1 | Corte, Passos 2 e 3 |
| Direto-materno e multicaracterística | `blup.modelo_direto_materno`; `blup.modelo_multicaracteristica` | 1 | Corte |
| Confiabilidade exata de reprodutor pelo desenho | `blup.rel_exata_modelo_touro` | 1 e 2 | Caprinos, Ex. 3; Ovinos, Ex. 4 |
| Filhas-equivalentes | `confiabilidade.k_d`; `confiabilidade.k_touro`; `confiabilidade.rel_filhas`; `confiabilidade.de_de_rel`; `confiabilidade.rel_de_de`; `confiabilidade.de_filhas_mesmo_rebanho`; `confiabilidade.rel_total` | 1 a 3 | Leite, "Filhas-equivalentes" |
| Conversão entre r, REL e acurácia BIF | `confiabilidade.bif_de_r`; `confiabilidade.r_de_bif`; `confiabilidade.rel_de_bif`; `confiabilidade.bif_de_rel`; `confiabilidade.r_de_rel`; `confiabilidade.rel_de_r` | 2 | Corte, "Passo 3" |
| Possible Change | `blup.possible_change`; `blup.possible_change_de_r` | 2 | Corte, "Passo 3" |
| Probabilidade de superar | `indices.prob_superar_pta`; `indices.prob_superar`; `indices.dp_erro_indice` | 2 | Corte; Leite |
| Índice econômico e ênfase | `indices.indice_economico`; `indices.enfase_relativa`; `indices.indice_padronizado` | 2 e 3 | Leite, "Índices econômicos" |
| Ganho genético, tendência e absorção | `ganho.intensidade_selecao`; `ganho.ganho_vias`; `ganho.tendencia`; `ganho.absorcao` | 0 a 3 | Caprinos, Ex. 5; Ovinos, Ex. 8 |
| Smith-Hazel | `indices.smith_hazel` | 3 | Corte, "Índice de seleção" |
| Variância heterogênea | `blup.padronizar_variancia`; `blup.ajuste_hva` | 3 | Ovinos, Ex. 2; Leite |
| Acurácia genômica esperada | `confiabilidade.daetwyler_r`; `confiabilidade.daetwyler_rel`; `confiabilidade.daetwyler_n_para_rel` | 3 | Caprinos; Corte |
| Ganho por diferenciais das quatro vias | `ganho.ganho_diferenciais` | 3 | Leite, "Resposta à seleção pelas quatro vias" |
| Pipeline completo de um rebanho caprino | `rebanho.executar` (`python3 -m melhoramento.rebanho`) | 0 e 1 | README, "O pipeline do rebanho" |

---

## 4. Por espécie

Os parâmetros abaixo são **valores de entrada**, para usar quando o N não permite estimar, sempre com a fonte e a faixa de sensibilidade ao lado.

### 4.1 Bovinos de corte

**Características e modelos** (Corte, "Cada característica exige um modelo próprio"). Pesos até a desmama: direto-materno com ambiente permanente materno. Pesos depois: multicaracterística, contra o viés dos animais vendidos antes. Escores, prenhez e facilidade de parto: limiar. Permanência (STAY): limiar ou sobrevivência. Pesagens seriadas: regressão aleatória. Carcaça e RFI: modelo animal com as covariáveis da medida.

**Parâmetros de referência (zebuínos)**

| Característica | Valor | Fonte |
|---|---|---|
| Peso à desmama, h² direta | 0,24; sensibilidade de 0,15 a 0,33 (±1τ entre estudos) | Corte, "Parâmetros externos e prioris informativas" (meta-análise de Giannotti 2004) |
| Peso à desmama, h² materna | 0,13 (0,10 a 0,13 em Nelore) | idem; tabela de herdabilidades de "Eficiência, carcaça, cruzamentos" |
| Correlação direto-materna | fixar em 0, simplificação operacional da ANCP e do Angus (meta-análise: −0,16) | Corte, "Pesos até a desmama" |
| Peso ao nascer; aos 365 dias; aos 550 dias | 0,31; 0,28; 0,33 | Corte, "Parâmetros externos" |
| Repetibilidade do peso à desmama | 0,33 (Nelore a pasto); sensibilidade em 0,20 e 0,51 | Corte, "Ferramentas que funcionam com N pequeno" |
| Perímetro escrotal; idade ao primeiro parto; STAY | 0,29 a 0,41; 0,08 a 0,15; 0,09 a 0,13 | Corte, tabela de herdabilidades |
| Prenhez de novilha (escala observada) | 0,18 [não verificado] a 0,57 | idem; "Escores e prenhez" |
| AOL; RFI; temperamento | 0,33 a 0,46; 0,18 a 0,19; 0,21 a 0,26 | idem |
| σA do P450 | σA/2 = 8,24 kg (tabela da ANCP) | Corte, "Passo 3" |

**Indicadores e metas**

| Indicador | Referência publicada | Fonte |
|---|---|---|
| Prenhez (prenhes ÷ expostas) | 69% em primíparas e 90% da 5ª à 8ª cria (Nelore, Cerrado); 65,54% em 3.150 fazendas (iRancho) | Corte, "Indicadores zootécnicos do rebanho" |
| Intervalo entre partos | 392 dias em primíparas; 365 dias da 5ª à 9ª cria | idem |
| Desmama (desmamados ÷ vacas expostas) | 58% a 67% (Senar-MS); 65,6% (IMEA); cerca de 75% no grupo lucrativo (Inttegra) | idem |
| Kg desmamados por vaca exposta | 115 a 162 kg | idem |
| Perda de gestação após IATF | 6,64% (multíparas) a 12,35% (novilhas precoces) | idem |
| Idade ao primeiro parto | 35 meses (Nelore da ANCP) | idem |

Metas individuais [proposta do relatório de corte, "Metas individuais"]: bezerro de reposição com razão BIF acima de 100; novilha prenhe na primeira estação; vaca com MPPA de pelo menos 100 a 101 (corte atribuído à Brahman americana [não verificado]) e IEP perto de 365 dias; touro de reposição no quintil superior do índice, com acurácia mínima na escala declarada; rebanho com tendência genética positiva e ΔF abaixo de um teto da gestão (cerca de 1% por geração é decisão de gestão, não norma: Corte, "Endogamia e tamanho efetivo"). O app rotula o denominador de cada taxa: o 65% do IMEA e o 74,8% do Inttegra só se comparam com o mesmo denominador.

**Programas** (Corte, "Os programas de N muito grande convergiram para o single-step"). **ANCP**, Programa Nelore Brasil: Nelore, Guzerá, Brahman, Tabapuã e Sindi; mais de 5 milhões de animais e 600 mil genotipados; ssGBLUP com APY no BLUPF90+ desde 2019; σam = 0; MGTe; seis avaliações por ano; acurácia na escala BIF. **ABCZ (PMGZ) com Embrapa-Geneplus:** avaliação conjunta single-step desde 2018 em Guzerá, Nelore e Tabapuã; iABCZ; classes DECA; CSG. **Embrapa-Geneplus:** IQGg, CEIP, ATJ. **GenSys** (Conexão Delta G, Aliança Nelore): DEP genômica por GBLUP em duas etapas; GC com pelo menos 10 laços genéticos. **PampaPlus** para Hereford e Braford; **CRV PAINT** sem documento metodológico aberto. Fora: American Angus, American Hereford, IGS, BREEDPLAN, IBOVAL, ICBF e Interbeef.

**Com quem conectar.** Zebuínas: ANCP, ABCZ com Embrapa-Geneplus, ou GenSys. Hereford e Braford: PampaPlus ou Conexão Delta G. A escolha depende da raça, do mercado e do selo que o comprador reconhece [equipe]. Regras de CEIP, CSG e ATJ: confirmar com o programa antes de prometer [a definir].

**Cuidados.** Pesos padronizados de programas diferentes não se misturam: as janelas de idade da ABCZ e da ANCP diferem (Corte, "Antes do modelo"). A tabela de idade da vaca do BIF não serve para Nelore. A tabela de Possible Change da ANCP segue a escala r, embora a ANCP declare a acurácia BIF; confirmar a escala antes de usá-la num produto (Corte, "Passo 3").

### 4.2 Bovinos leiteiros

**Características e modelos** (Leite). Leite, gordura e proteína em 305 dias pelo TIM ou pela melhor predição, em repetibilidade ou multicaracterística; dia de controle com regressão aleatória, com grupos aleatórios de ordem de parto, rebanho, ano e estação no lugar do HTD (Schaeffer 2016); fertilidade como DPR, CCR e HCR; facilidade de parto em limiar touro–avô materno; longevidade por sobrevivência; saúde por ocorrências; tipo linear; tolerância ao calor sobre o THI.

**Parâmetros de referência**

| Característica | Valor | Fonte |
|---|---|---|
| Leite 305 dias, h² | 0,25 (base americana); Girolando 0,20 a 0,28 | Leite, "Filhas-equivalentes" e "Fertilidade" (Canaza-Cayo et al. 2017) |
| Repetibilidade | 0,55 (base americana); Gir e Girolando sem estimativa: rodar 0,40, 0,50 e 0,60 | Leite, "Filhas-equivalentes" e "Comparar com contemporâneas" |
| σP da lactação | 1.600 kg nos exemplos, valor **hipotético**; o real da raça é [a definir] | Leite, "Comparar com contemporâneas" |
| ECS; DPR | 0,03 a 0,18; 0,029 (CDCB, 2026) ou cerca de 0,04 (VanRaden et al. 2004) | Leite, "Sólidos, energia e células" e "Fertilidade" |
| Girolando: idade ao 1º parto; IEP; período seco; longevidade | 0,20; 0,00 a 0,08; 0,07 a 0,14; 0,06 a 0,31 | Leite, "Fertilidade" e "Longevidade" |
| Facilidade de parto, direta e materna (USDA) | 0,086 e 0,048 | Leite, "Facilidade de parto" |

Com h² de 0,25, k_d = 14: cem filhas, cada uma num rebanho, dão 0,877 de confiabilidade para leite e cerca de 0,50 para DPR; cem filhas num só rebanho valem 5,9 filhas-equivalentes (Leite, "Filhas-equivalentes").

**Indicadores e metas**

| Indicador | Meta ou referência | Fonte |
|---|---|---|
| CCS e CBT do tanque | IN 76/2018: CCS até 500 mil células/mL e CBT até 300 mil UFC/mL, média geométrica trimestral; a norma é de tanque, não de vaca | Leite, "Indicadores zootécnicos do rebanho" |
| CCS individual | % de vacas acima de 200 mil (corte convencional [não verificado]) | idem |
| Reprodução | IEP de 365 dias; idade ao primeiro parto de 24 meses; 1,6 serviço por concepção (Embrapa, atribuição a confirmar); taxa de serviço acima de 35% | idem |
| Novilhas (Holandês) | 55% do peso adulto e 90% da estatura à cobertura; 85% do peso adulto ao parto; sem referência de peso adulto para Gir e Girolando | Leite, "Metas por categoria" |
| Primíparas e adultas | primeira lactação como triagem; descarte por MPPA e saúde, reposição por EBV | idem [proposta] |
| Touros | percentil superior do índice com REL mínima declarada; vários touros quando a REL é baixa; parentesco checado com cada vaca | idem |

**Programas** (Leite, "Brasil: testes de progênie com a Embrapa e genômica como camada"). **PMGG**, Girolando (ABCG e Embrapa): GC aleatório com a composição racial e heterozigosidade como efeito fixo desde 2022; ssGBLUP para vacas desde 2017 e touros desde 2019; IPG; Clarifide Girolando. **PNMGL**, Gir (ABCGIL e Embrapa): ssGBLUP desde 2019; IPGL. **PNMGuL**, Guzerá (CBMG² e Embrapa). **Holandesa** (ABCBRH com a Embrapa): ISG. Fora: CDCB, Lactanet, NAV, vit, ICBF, DataGene, LIC; Interbull com MACE de produção em 33 países.

**Com quem conectar.** O produtor entra pelo controle leiteiro oficial da raça, que alimenta a avaliação nacional; sêmen nacional com prova da Embrapa; sêmen importado lido pelo MACE na escala brasileira; genotipagem de novilhas pelo programa (Leite, "BLUP e regressão aleatória dentro do rebanho" e "MACE e GMACE").

**Cuidados.** PTAs americanas em libras não se comparam com as brasileiras em kg sem converter unidade e base (Leite, "Base genética"). O ECM pede o divisor declarado (`lactacao.ecm`). Não há medida publicada da confiabilidade genômica de novilhas Girolando; os sumários repetem, sem referência, 50% a 67% contra 34% da avaliação tradicional (Leite, "Genotipar novilhas").

### 4.3 Caprinos leiteiros

**Características e modelos** (Caprinos). PL305 (210 ou 250 dias em outros países), TMY ou TMM, em modelo animal multicaracterística com ambiente permanente; dia de controle com regressão aleatória (França, rotina atual não confirmada); 11 notas lineares de úbere de 1 a 9; prolificidade (linear basta para ordenar bodes); sucesso da IA; aborto em limiar; cabritos em direto-materno com efeito do cromossomo X; longevidade por sobrevivência; verminose com OPG em raiz cúbica, FAMACHA e hematócrito; αs1-caseína como gene de grande efeito.

**Parâmetros de referência**

| Característica | Valor | Fonte |
|---|---|---|
| PL305, h² | 0,20; sensibilidade de 0,15 a 0,30 (publicadas: 0,10 a 0,41) | Caprinos, "Não estimar parâmetros dentro do rebanho" e "Herdabilidades de produção" |
| Repetibilidade da PL305 | 0,36 (Saanen brasileira); 0,44 e 0,50 na sensibilidade; extremo inferior em par h² 0,12 e r 0,14 | Caprinos, Ex. 6 |
| σP da PL305 dentro do GC | 200 kg (σa = 89,4 kg), escolha do relatório [não verificado]; DP total da Alpina: 277,6 kg | Caprinos, "Herdabilidades de produção" |
| Teores; CCS | 0,60; 0,15 a 0,25 | Caprinos, "Não estimar parâmetros" |
| Notas de úbere | 0,20 a 0,50 (até 0,57) | Caprinos, "Úbere e tipo" |
| Prolificidade; sucesso da IA | 0,02 a 0,05; 0,045 a 0,052 | Caprinos, "Reprodução" |
| Idade ao primeiro parto; IEP (Saanen, Sobral) | 0,21; 0,06 | idem |
| OPG; FAMACHA; hematócrito | 0,07; 0,22; 0,22 | Caprinos, "Verminose" |
| Vida produtiva | 0,58 em modelo de Cox, escala não comparável | Caprinos, "Longevidade" |

Com h² de 0,20, k_d = 18: REL de 0,50 pede 18 filhas-equivalentes, e 0,70 pede 42 (Caprinos, "PTA, base e confiabilidade").

**Indicadores e metas** (Caprinos, "Os indicadores do rebanho" e "Metas por categoria")

| Categoria | Meta ou referência | Origem |
|---|---|---|
| Cabritas | Peso à cobertura de pelo menos 25 kg e de 60% a 70% do peso das adultas do rebanho; 1º parto aos 18 meses, alerta acima de 21 | 25 kg: Embrapa; 18 meses: premissa de Sobral (observado: 20,9); faixa e alerta: [proposta] |
| Cabritas | Mortalidade até o desmame em queda, julgada com intervalo exato | [proposta] |
| Primíparas | Desvio da PL305 em relação ao GC ≥ 0; referência nacional de 727 kg (Saanen, Capragene 2020) | desvio: [proposta] |
| Primíparas | Média geométrica de CCS abaixo de 1 milhão/mL e fração de controles acima disso em queda; nenhum defeito isolado de úbere na pontagem | Embrapa; grade da Capgènes (2012); forma: [proposta] |
| Adultas | IEP de 12 meses (Saanen e Alpina intensivas) e 10 (Anglo-Nubiana); descarte pela MPPA, não pela idade; FAMACHA 4 ou 5 em queda | Embrapa (expectativas); [proposta] |
| Bodes | PTA de PL305 acima da média + 1 DP; REL ≥ 0,50 para uso intenso (≥ 0,70 nas GPTAs da Saanen); bodes jovens sem prova em até 10% a 15% dos acasalamentos | Capragene; Lôbo et al. (2014) |
| Bodes | F por acasalamento até 6,25% como alerta; ΔF do rebanho até 1% por geração (Ne ≥ 50) | 6,25%: [proposta]; 1%: FAO (1998) |

Referências brasileiras: 0,633 L por cabra ordenhada por dia na média nacional (Censo de 2006); PL305 de 727,4 kg na Saanen e 764,6 kg na Alpina do Capragene; IN 37/2000 sem limite de CCS; Embrapa usa 1 milhão de células/mL para mastite subclínica (Caprinos, "Os indicadores do rebanho"). Fertilidade de bodes em monta natural e crescimento de cabritas não têm meta com fonte e aparecem no app como medidos, sem meta.

**Programas** (Caprinos, "Os programas de N grande"). **Capragene** (Embrapa Caprinos e Ovinos, ACCOMIG/Caprileite, MAPA, ABCC): PL305 com pelo menos 60 dias, 3 controles e 1º controle até o 75º dia; modelo animal multicaracterística com ambiente permanente; GC aleatório desde a Saanen de 2020; ssGBLUP por Gibbs só na Saanen (Axiom OviCap); sem índice composto; teste de progênie desde 2005. **Controle leiteiro oficial:** ACCOMIG/Caprileite, executado pela Caprileite com a ACGHMG desde 2021, pela Portaria SNAP nº 45/1986. Fora: França (Capgènes, Idele e INRAE; ssGBLUP multirraça; ICC), Itália, Espanha, Noruega e EUA.

**Com quem conectar.** Produtor: controle leiteiro oficial (ACCOMIG/Caprileite), que põe o rebanho no Capragene; bodes ou sêmen com PTA publicada; verificação de paternidade pelo painel de 16 microssatélites do Capragene (Caprinos, "BLUP e genômica dentro do rebanho"). Associação de Saanen, Alpina ou Anglo-Nubiana: Capragene, antes de qualquer avaliação paralela [equipe].

**Cuidados.** TMY e TMM não se misturam no mesmo GC, e a data de separação dos cabritos é obrigatória para seguir a ICAR (Caprinos, "Pela ICAR"). Cabras sem infecção podem ter de 270 mil a 2 milhões de células/mL (Caprinos, "Curva, componentes e células"). Ligar a referência genômica brasileira à francesa exigiria imputação entre chips, sem teste em caprinos (Caprinos, "Chips").

### 4.4 Ovinos leiteiros

Esta subseção segue o relatório de ovinos v2, que já incorpora a verificação de fontes; as remissões à verificação indicam onde está o detalhe de cada correção.

**Características e modelos** (Ovinos). TMM por Fleischmann, com controles de uma ordenha (AT e AC), que cobrem 98% das ovelhas controladas; modelo animal de repetibilidade por característica, com grupos de pais desconhecidos e variância heterogênea (França); três notas de úbere na Lacaune; ordenhabilidade; células; fertilidade e prolificidade; verminose; PRNP como restrição (ARR/ARR), não como herdabilidade; SOCS2 como gene de grande efeito.

**Parâmetros de referência**

| Característica | Valor | Fonte |
|---|---|---|
| Leite (TMM), h² | 0,30 central (avaliação nacional de 2011); 0,24 a 0,37 na Lacaune | Verif. ovinos, correção 13 |
| Repetibilidade | 0,41 e 0,50 | Ovinos, Ex. 5 |
| σa do leite | 32 a 35 L (Lacaune francesa); 36,5 L em comunicação do Idele; σP de 60 L no Ex. 5 | Ovinos, "Herdabilidades"; Verif. ovinos, correção 33 |
| Teor de gordura; de proteína | 0,34 a 0,50; 0,45 a 0,62 | Ovinos, "Não estimar parâmetros" |
| Escore de células | 0,13 a 0,18 | Verif. ovinos, correção 14 |
| Fertilidade de borregas; de adultas | 0,04; 0,05 | Ovinos, "Reprodução" |
| Úbere; fluxo máximo | 0,16 a 0,33; 0,54 | Ovinos, "Úbere" e "Ordenhabilidade" |
| OPG; longevidade funcional | 0,14 a 0,33; 0,07 (log) a 0,11 (original) | Ovinos, "Verminose" e "Cordeiros e longevidade" |

Com h² de 0,30, k_d = 11,33: REL de 0,50 pede 11,3 filhas-equivalentes, e 0,70 pede 26,4 (Ovinos, Ex. 4). Pelo motor, um carneiro com 10 filhas ao lado de 10 de outro carneiro local tem REL de 0,1948 com h² de 0,24 (0,19 no relatório v2), e 40 filhas em 5 ou 10 rebanhos, ao lado de filhas de um importado, dão 0,6803 e 0,6948 com h² de 0,30 (0,68 a 0,69 no relatório v2; a v1 imprimia 0,20 e 0,70 por arredondar duas vezes) (README, "Discrepâncias encontradas"; Apêndice A, bloco E).

**Indicadores e metas**

| Categoria | Meta ou referência | Origem |
|---|---|---|
| Borregas | Peso à cobertura de 60% a 65% do peso das adultas do rebanho; fertilidade acompanhada à parte (h² 0,04; correlação de 0,55 com a adulta) | 60%: AHDB [trecho de busca]; faixa: [proposta]; Ovinos, "Metas por categoria" |
| Primíparas | Desvio da TMM em relação às contemporâneas ≥ 0; referências francesas de 272 a 288 L em 164 a 165 dias (controle oficial da Lacaune, 2009–2010) e 330 L em 173 dias (selecionadores) | desvio: [proposta] |
| Primíparas | Células: média geométrica e fração acima de faixas definidas pelo próprio rebanho; as classes de Heddi et al. são quintis de 752 amostras, não limiares de mastite | Verif. ovinos, correção 15; [proposta] |
| Adultas | Fertilidade de 94,9%, 1,56 cordeiro por parto e IA em 86,6% (selecionadores Lacaune); 75 g/L de gordura e 56 g/L de proteína; renovação de 28% | Ovinos, "Metas por categoria" (UPRA 2022) |
| Tanque | IN 76/2018 "no que couber"; a aplicação ao leite de ovelha é leitura provável, a confirmar com a inspeção | Ovinos, "Células somáticas"; Verif. ovinos, correção 18 |
| Carneiros | ARR/ARR para reposição e IA; F por acasalamento até 6,25% [proposta]; ΔF até 1% por geração (FAO 1998); na monta natural, 10 dias entre carneiros no lote ou DNA [trecho de busca] | Ovinos, "Metas por categoria"; Verif. ovinos, correção 30 |

O Regulamento (CE) 853/2004 fixa só contagem em placas (1,5 milhão de UFC/mL para leite cru de outras espécies) e nenhum limite de CCS para ovinos (Verif. ovinos, conflito "Limites da UE"). Nenhuma fonte fixa limiar individual validado de mastite subclínica em ovelhas (Ovinos, "Células somáticas").

**Programas.** **Brasil:** nenhuma avaliação genética nem controle oficial; cerca de 6.900 matrizes, 28 produtores e 840 mil L/ano em 2015; registro genealógico da ARCO, sem leite (Ovinos, "Brasil: genética de poucas importações"). **Lacaune, França:** ssGBLUP oficial desde 2015; mais de 10 mil carneiros na referência; ISOL com 50% de sólidos e 50% de células e úbere desde 2005; ganho de leite de 3,8 L/ano (machos) e 4,0 L/ano (fêmeas) em 2005–2015 e de 4,1 L/ano (machos) em 2008–2015, menor que antes pela mudança de período e de objetivo, e não pelos grupos de pais desconhecidos (Verif. ovinos, conflitos "Ganho de leite da Lacaune" e "Composição do ISOL"). **ROLP** (Manech e Basco-Béarnaise): seleção genômica desde 2017 (Verif. ovinos, conflito "Data da seleção genômica na ROLP"). **Latxa:** ganho de 3% ao ano (Verif. ovinos, correção 6). **Grécia:** avaliação conjunta da Lacaune com a França viável (Ovinos, "Conectividade").

**Com quem conectar.** Sem programa brasileiro, a conexão vem de sêmen importado com o EBV de origem registrado (valor, confiabilidade, data e base), da troca de carneiros entre pelo menos três rebanhos que registrem da mesma forma e do registro genealógico na ARCO (Ovinos, "Estratégia por porte de rebanho no Brasil" [proposta]). A meta de médio prazo é uma avaliação conjunta com a população de origem, como a Grécia testou com a França (Ovinos, "Conclusão" [proposta]).

**Cuidados**

- **ICAR:** 1º controle até a mamada média mais 52 dias (passou disso, a norma manda não calcular a lactação); controles não nulos a no máximo 70 dias; menor produção medida de 200 g, apesar do 150 g do Anexo 1 (Verif. ovinos, conflito "Menor quantidade testada").
- **Ne da Lacaune:** 188 por pedigree e 370 por desequilíbrio de ligação; diferem por método e período (Verif. ovinos, correção 7).
- **ISOL** seleciona sólidos, células e úbere, não volume (Ovinos, "ISOL").
- **SOCS2:** o alelo T caiu de 0,21 em 2005 para 0,09 em 2017 entre carneiros de IA (Verif. ovinos, correção 4).
- **Sêmen importado:** com tendência francesa de 3,8 a 4,1 L/ano, correlação entre ambientes de 0,86 e 14 anos sem renovação (hipótese), o atraso é de 45,8 a 49,4 L, e as filhas do primeiro sêmen ganham de 22,9 a 24,7 L por lactação; com a correlação de 0,70 (Latxa e Manech), a mesma conta dá de 18,6 a 20,1 L (Verif. ovinos, "Hipóteses do Exemplo 8"; Apêndice A, bloco E). Incluindo os 5,4 L/ano da brochura da Lacaune, ainda sem confirmação, o relatório v2 dá a faixa completa: atraso de 37 a 65 L e ganho de 19 a 33 L nas filhas (Ovinos, Ex. 8). É ordem de grandeza condicional, não previsão.
- **Grécia:** com acesso aos pais franceses, o ganho previsto passou de 37,62 para 82,20 kg (+118%), por simulação (Verif. ovinos, correção 8).

---

## 5. Dados mínimos para o SeabraApp

A base é a tabela de dados de Caprinos ("O que o rebanho caprino precisa registrar no SeabraApp"), generalizada com as de Corte, Leite e Ovinos. As colunas do CSV de exemplo do motor (`animal`, `parto`, `controle`, `cobertura`, `acasalamento_planejado`, lidas por `rebanho.ler_csv`) são o mínimo que as contas pedem e servem de checklist para as tabelas do Supabase (README, "Roteiro").

### 5.1 Quatro regras

1. **Registrar todos os animais do grupo**, inclusive os que serão descartados ou morrerão: omitir os piores enviesa razões e DEPs (Corte); na ICAR, todas as fêmeas ordenhadas no dia do controle entram (Caprinos; Ovinos).
2. **Registrar datas**, não idades nem dias em lactação: o app deriva DEL, IEP, idade ao parto, duração da mamada e dias abertos (as quatro tabelas de dados).
3. **Usar códigos padronizados** para tipo de parto, causa de secagem, motivo de saída e doença (Caprinos; Leite).
4. **Exportar no formato do controle oficial ou do programa**, porque é por ele que o rebanho entra na avaliação nacional (Caprinos; Leite; Corte). Formatos [a definir].

### 5.2 Campos por animal

| Campo | Para que serve |
|---|---|
| Identificação única e permanente (brinco ou RFID) | ligar registros, pedigree e genótipo |
| Espécie, raça e composição racial (frações; Holandês/Gir no Girolando) | GC, heterozigose, índice da raça |
| Sexo, data e tipo de nascimento (simples, duplo, triplo) | idade-padrão, categoria, efeitos fixos |
| Origem (nascido, comprado, embrião, importado) | base genética, grupos de pais desconhecidos |
| Pai (código do animal ou do sêmen, com país e registro); mãe; receptora; avô materno em leite | matriz A, PTA do pai, efeito materno, F, conectividade |
| Reprodutor do lote na monta natural, com datas de entrada e saída; resultado de teste de paternidade | paternidade e correção do pedigree |
| Avaliação externa do reprodutor: valor por característica, confiabilidade, escala (REL, r ou acurácia BIF), base, programa e data | âncora, índice, comparação |
| Genótipo: painel, laboratório, amostra; PRNP (ovinos); αs1-caseína (caprinos) | genômica, paternidade, restrições |
| Situação (ativo, vendido, morto) | denominadores e saídas |

### 5.3 Campos por evento

| Evento | Campos mínimos | Fonte |
|---|---|---|
| Parto | data; ordem; crias vivas e mortas; sexo e identificação de cada cria; aborto e natimorto; facilidade de parto (1 a 5) em bovinos | Caprinos; Leite; Corte |
| Aleitamento | sistema (ordenha desde o parto, mamada, mamada com ordenha parcial, separação noturna) e data da separação definitiva das crias | Caprinos; Ovinos |
| Controle leiteiro | data; leite de cada ordenha medida, ou ordenha única com o método (AT ou AC) e, no AC, o tanque das duas ordenhas; ordenhas por dia; tipo de ordenha; gordura, proteína, lactose e CCS com o laboratório | Caprinos; Ovinos; Leite |
| Secagem | data e causa (normal ou não) | Caprinos; Leite |
| Pesagem | data, peso, lote, escore corporal; na desmama, todo o GC no mesmo dia; peso ao nascer nas primeiras 24 horas | Corte (BIF; CDP da ABCZ) |
| Cobertura ou IA | data; reprodutor ou lote; sêmen fresco, refrigerado ou congelado; via em ovinos; protocolo ou sincronização | Caprinos; Ovinos; Leite |
| Diagnóstico de gestação | data, método e resultado | Corte; Leite; Caprinos |
| Saúde | data, código, quarto ou metade do úbere, tratamento; mastite clínica; CAE; claudicação; doenças de bezerras | Leite; Caprinos |
| Verminose | data, OPG, FAMACHA, hematócrito; data e produto da última vermifugação; lote | Caprinos; Ovinos |
| Tipo e conformação | notas lineares com escala, data e avaliador; tetos supranumerários | Caprinos; Ovinos; Leite |
| Carcaça | perímetro escrotal; AOL, gordura e marmoreio com técnico certificado | Corte |
| Saída | data, destino (venda, descarte, morte) e motivo codificado | todas |

### 5.4 Campos por rebanho e lote

Lote de manejo e regime (pasto, semiconfinamento, confinamento), para o GC; localização da propriedade, para ligar o THI ou ITU diário (Leite, "Tolerância ao calor"; Ovinos, "Curvas e fatores de ajuste"); estação de monta e de parição, para o GC de corte (a ANCP usa rebanho, sexo, ano e estação de nascimento e grupo de manejo); período de espera voluntário adotado (Leite, "Fertilidade"); método de controle leiteiro (A4, AT, AC, B, D) e quem o executa; programa ou associação a que o rebanho pertence; CCS e contagem em placas mensais do tanque.

### 5.5 Regras de qualidade que o app aplica

| Regra | Valor | Fonte | Onde está |
|---|---|---|---|
| Mínimo de controles por lactação | 3 | Caprinos (Fleischmann na ICAR); Ovinos (Vouraki et al.) | `lactacao.lactacao_pequenos_ruminantes` |
| Duração mínima da lactação (PL305 do Capragene) | 60 dias | Caprinos, "Pela ICAR" | `rebanho.padronizar_lactacoes` |
| 1º controle de cabra ordenhada desde o parto | 6º ao 80º dia; depois do 80º, a norma manda não calcular a lactação (salvo limite maior justificado pela raça); Capragene: até o 75º. O motor só avisa por padrão; com `estrito_norma=True` não calcula | Caprinos, "Pela ICAR" | idem e `lactacao.lactacao_pequenos_ruminantes` |
| 1º controle com mamada, e em ovelhas | até a mamada + 52 dias; depois, a norma manda não calcular (motor: aviso no padrão, sem cálculo em `estrito_norma=True`) | Caprinos; Ovinos | `lactacao.lactacao_pequenos_ruminantes` |
| Intervalo máximo entre controles não nulos | cabras: 2 × o intervalo médio do método (60 dias no A4, AT e AC; 72, 84 e 98 nos métodos 5, 6 e 7); ovelhas: 70 dias; acima, o cálculo para e a lactação fica incompleta. O padrão do motor é 60 e 70; `metodo="A5"` etc. em `estrito_norma=True` | Caprinos; Ovinos | idem |
| Menor produção medida | 200 g (aviso) | Verif. ovinos, conflito "Menor quantidade testada" | idem |
| Sem data de secagem | último controle + ½ intervalo, com aviso; a regra está escrita só para cabras (em ovelhas, por analogia: o padrão do motor usa 17,5 dias e `estrito_norma=True`, 15 no A4) | Caprinos, Ex. 1 | `lactacao.fim_icar` |
| TMY e TMM no mesmo GC | proibido | Caprinos, Ex. 1 | `rebanho.grupo_contemporaneas` |
| Tamanho mínimo do GC | 3 animais (Capragene); estudos com dados da ANCP e da Geneplus descartam GCs com menos de 5 | Caprinos, "Modelo de lactação"; Corte, "Antes do modelo" | `rebanho.desvios_contemporaneas` (avisa abaixo de 3) |
| Reprodutores por GC | pelo menos 2 (BIF e ICAR); 10 laços genéticos na GenSys | Corte, "Antes do modelo" | [a definir] |
| Janelas de idade de pesagem | ABCZ: 150–270, 305–425 e 390–510 dias; ANCP: 165–255, 320–410 e 405–495 | Corte, "Antes do modelo" | [a definir] |
| Células | média geométrica, nunca aritmética | Caprinos; Leite | `lactacao.ccs_media_geometrica` |
| Taxas | numerador, denominador e intervalo | Caprinos, "Os indicadores do rebanho" | `taxas.ic_exato`; `taxas.ic_wilson` |
| Resultados genéticos | gravados com parâmetros, data e escala | README, "Roteiro" | seção 6.4 |

---

## 6. Do laboratório ao app

### 6.1 O caminho de um modelo

```
relatório (fórmula com fonte e exemplo numérico conferido)
   ▼
motor Python (função com docstring e referência; só numpy e biblioteca padrão)
   │   tests/: o teste reproduz os números impressos no relatório
   ▼
gerar_vetores_teste.py ──► vetores_teste.json (entrada → saída; tolerância relativa de 1 × 10⁻⁹)
   │                       tests/test_vetores.py confere que o arquivo continua igual ao pacote
   ▼
porta em Dart (app) ou TypeScript (Edge Function do Supabase); o teste da porta lê vetores_teste.json
   ▼
produção: resultado gravado com parâmetros, data e escala; tela com REL, escala e intervalo
```

O motor foi escrito para ser traduzido: funções curtas, sem dependências além de numpy e da biblioteca padrão, e rotinas numéricas próprias, porque Dart e TypeScript não trazem scipy (README). Para levar um modelo novo ao app [equipe, a partir do README]: (1) implementar a função no motor, com a fórmula e a seção do relatório na docstring; (2) escrever o teste que reproduz os números publicados; (3) acrescentar o caso em `gerar_vetores_teste.py` e regravar `vetores_teste.json`; (4) portar e validar a porta contra o arquivo; (5) liberar no app.

### 6.2 Os vetores de teste

`vetores_teste.json` tem 133 vetores: 39 de `taxas`, 18 de `parentesco`, 17 de `lactacao`, 15 de `confiabilidade`, 15 de `indices`, 15 de `ganho` e 14 de `blup`. Cada um traz `id`, `funcao`, `entrada`, `saida` e `fonte`, e a porta precisa reproduzir `saida` com erro relativo de até 1 × 10⁻⁹. As convenções do arquivo valem também para as tabelas do app: taxas, confiabilidades, acurácias e F em fração, não em porcentagem; pedigree como {animal: [pai, mãe]}, com "0" para desconhecido; PTA e DEP iguais a EBV/2; CCS em mil células/mL; dias contados do parto (cabeçalho de `vetores_teste.json`).

### 6.3 O que roda no app e o que roda no servidor

| Camada | O que roda | Por quê |
|---|---|---|
| **App (Dart), offline** | `taxas` (intervalos, tamanho amostral, poder, CUSUM), `confiabilidade`, `ganho`; `lactacao.fleischmann` e `lactacao.lactacao_pequenos_ruminantes`, `lactacao.ecs`, `lactacao.ccs_media_geometrica`, `lactacao.ecm`, `lactacao.fcm4`; `indices.mppa` e `indices.indice_femea`; F de um par | fórmulas fechadas, sem álgebra linear além de 2 × 2 (README, camada 1) |
| **Núcleo numérico (Dart e TypeScript)** | `taxas.log_gama`, `taxas.erfc`, `taxas.norm_cdf`, `taxas.norm_ppf`, `taxas.beta_incompleta_regularizada`, `taxas.beta_quantil`, `taxas.t_quantil` | Dart e JavaScript não têm `erf` nem `lgamma` nativos; tradução linha a linha (README) |
| **F de um par no celular** | a_xy = ½(a_x,pai(y) + a_x,mãe(y)), com y o mais novo, recursiva, só sobre os ancestrais dos dois, com memoização; validada contra os vetores de `parentesco.F_acasalamento` | evita montar A inteira (README) |
| **Servidor (Edge Function em TypeScript, ou worker Python)** | `parentesco.matriz_A`, `parentesco.inversa_A`, `blup.modelo_animal`, `blup.modelo_direto_materno`, `blup.modelo_multicaracteristica`, `blup.rel_exata_modelo_touro`; `parentesco.inversa_A_grupos` e `blup.gauss_seidel` (grupos de pais desconhecidos e solução iterativa, validados contra Mrode et al. 2023) | MME simétricas e positivas definidas: Cholesky, e a diagonal de C, para a PEV, sai da mesma fatoração; por rebanho, sob demanda ou em lote noturno (README, camada 2) |
| **Fora do motor** | REML, Gibbs, ssGBLUP, GBLUP, APY, regressão aleatória, limiar, sobrevivência, melhor predição da lactação, CACO, GC aleatório | descritos nos relatórios, não implementados (README, "Limites") |

**Rebanho grande.** Matrizes densas servem até alguns milhares de animais; acima disso, Gauss-Seidel ou PCG e PEV aproximada (README, "Limites"). O porte em que a Edge Function deixa de bastar deve ser medido com rebanhos de teste de 500, 1.000 e 5.000 animais [equipe; a definir].

### 6.4 O que se grava a cada cálculo

Cada resultado genético vai para uma tabela própria com EBV, REL, data do cálculo e parâmetros usados (README, camada 2). Para reproduzir o número depois, o registro traz também [equipe]: a versão do motor (`__version__`, hoje 0.1.0), a fonte dos parâmetros, a escala da confiabilidade, o tipo de lactação e o comprimento, o GC e, para dados oficiais, o programa, a base e a data. Nomes e estrutura das tabelas no Supabase: [a definir] com o time do app.

### 6.5 Ordem de porte

Do mais simples ao mais pesado (README, "Passos sugeridos"): (1) `taxas`, `confiabilidade` e `ganho` em Dart, com teste que lê `vetores_teste.json`; (2) Fleischmann com as regras da ICAR, o que exige registrar a separação das crias e a secagem; (3) MPPA e índice da fêmea, com as duas ordens e a REL ao lado; (4) F por par e alerta de 6,25% no planejamento de acasalamentos; (5) BLUP na Edge Function, validado com os vetores de `blup.*`. O pipeline `python3 -m melhoramento.rebanho` mostra o resultado esperado de ponta a ponta para 30 cabras fictícias (README, "O pipeline do rebanho").

### 6.6 As calculadoras da central

Antes da porta em Dart, a aba Laboratório da central já roda oito calculadoras em JavaScript (`central-melhoramento/lab/calculadoras.js`): MPPA e índice da fêmea, confiabilidade, acurácia BIF e Possible Change, parentesco e endogamia, taxas, índice econômico, lactação ICAR e ganho genético. Elas são a primeira porta do motor: `node lab/testar_calculadoras.mjs` confere 125 dos 137 vetores (os 12 restantes são funções que nenhuma calculadora usa: BLUP matricial, grupos de pais desconhecidos, Gauss-Seidel, variância heterogênea, ajustes de Wood e Wilmink e Smith-Hazel) e 112 números impressos nos relatórios (`central-melhoramento/lab/README.md`). Servem para demonstrar uma análise na triagem, com os números do próprio cliente, e como referência de tela para o app. Os exemplos que vêm preenchidos são fictícios.

---

## 7. Mensagens ao cliente

### 7.1 Três números, sempre juntos

Todo valor genético sai com o valor (PTA, DEP ou EBV, na unidade da característica), a confiabilidade com a escala escrita e a faixa de incerteza (README). A confiabilidade "não deve ser utilizada como critério de seleção", e sim para "decidir a intensidade de utilização de um reprodutor" (Caprinos, "PTA, base e confiabilidade", citando o Capragene). Siglas para o produtor: **PTA** e **DEP**, metade do valor genético: o desempenho esperado da progênie em relação à média dos animais do mesmo rebanho, ano e época (definição do Capragene); **EBV**, o valor genético inteiro, publicado nos carneiros (Ovinos, Ex. 5); **REL** (ou CD), de 0 a 1, cresce com filhas, parentes e contemporâneas; **r**, a raiz da REL; **acurácia BIF**, escala mais conservadora, em que r = 0,50 vale 0,134 (Corte, "Passo 3").

### 7.2 Frases-modelo

| Situação | Frase | Fonte |
|---|---|---|
| Explicar uma PTA | "O bode X tem PTA de +60 kg. Em média, as filhas dele devem produzir 60 kg a mais por lactação que as de um bode de PTA zero, no mesmo rebanho. Não é a produção da filha." | Caprinos, "PTA, base e confiabilidade" |
| Comparar reprodutores | "Entre um bode de +70 kg e outro de −50 kg, a diferença esperada entre as filhas é de 120 kg." | idem |
| Confiabilidade baixa | "A confiabilidade é de 0,40. A PTA ainda pode mudar bastante com mais filhas. Use este reprodutor em poucas fêmeas." | Caprinos, "Metas por categoria" |
| Faixa de incerteza | "A DEP é de +12 kg. Em 68% dos casos, o valor verdadeiro fica entre 9,5 e 14,5 kg; em 95%, entre 7,1 e 16,9 kg." | Corte, "Passo 3" |
| Escala da acurácia | "Nesta DEP de peso aos 450 dias, acurácia de 70% dá ±2,47 kg se for a escala BIF e ±5,88 kg se for a correlação. Antes de comparar, precisamos saber a escala." | Corte, "Passo 3"; seção 8.4, D4 |
| Probabilidade de superar | "O touro Y tem DEP maior, mas a chance de ele ser de fato melhor que o X é de 68%." | seção 8.4, D4 |
| Descarte e reposição | "A primeira lista diz quem deve produzir mais na próxima lactação: serve para descartar. A segunda diz de quem vale guardar filhas. As listas diferem, e isso é esperado." | Caprinos, Ex. 6; Ovinos, Ex. 5 |
| Taxa com poucas fêmeas | "Com 30 cabras, a parição de 86,7% pode estar entre 69% e 96%. A diferença de um ano para o outro, com esse número, quase nunca prova mudança." | Caprinos, Ex. 7 |
| Endogamia | "O bode da casa nas filhas dele dá cabritos com 25% de endogamia. Na Saanen brasileira, cada ponto de endogamia custou cerca de 2,31 kg de leite em 305 dias." | Caprinos, Ex. 8 (Paiva et al. 2020, resumo) |
| PTA interna | "Esta PTA compara as cabras do seu rebanho entre si. Para comparar com o sumário da raça, o rebanho precisa entrar no controle oficial." | README, "Limites" |
| Comprar reprodutor avaliado | "Comprar bodes avaliados rende mais que o dobro de escolher bodes pela produção da mãe: 15,6 contra 6,4 kg de leite por ano." | Caprinos, Ex. 5 |
| Células | "A média aritmética das contagens desta cabra é de 1,4 milhão, mas a que conta para o manejo é a geométrica: 1,1 milhão." | Caprinos, "Curva, componentes e células" |

### 7.3 Como mostrar na tela

PTA, DEP ou EBV com a REL ao lado e a escala escrita (README). As duas listas, MPPA e EBV, lado a lado (Caprinos, Ex. 6). Toda taxa com numerador, denominador e intervalo exato ou de Wilson, nunca de Wald com n pequeno (Caprinos, Ex. 7). Lactação com o tipo (TMY ou TMM) e o comprimento (Caprinos, "Pela ICAR"). Resultados oficiais e internos em blocos separados, com data e base [equipe]. Os parâmetros usados e, quando a fonte deixa dúvida, o resultado com dois valores (Ovinos, "Não estimar parâmetros").

### 7.4 O que nunca prometer

| Nunca prometer | Por quê | Fonte |
|---|---|---|
| "Avaliação oficial" feita só com os dados do rebanho | EBVs internos não se comparam com os do programa | README, "Limites" |
| A herdabilidade "do seu rebanho" | 100 registros estimam h² com desvio-padrão de 0,30 | Corte, "Estimar parâmetros" |
| Comparar o reprodutor da casa com o sumário | só com conexão ou dentro da avaliação nacional | Caprinos, "BLUP e genômica dentro do rebanho" |
| Ganho garantido em kg por ano | o realizado ficou bem abaixo do teórico: 6,34 contra mais de 13 kg/ano na Saanen | Caprinos, Ex. 5 |
| Avaliação de reprodutor com filhas sozinhas no grupo | a confiabilidade é zero | Caprinos, Ex. 3 |
| Genômica de alta acurácia sem referência | com 600 fêmeas de uma lactação, r de 0,22 a 0,36 | seção 8.3, C6 |
| Certificação (CEIP, CSG, ATJ, ICAR) | depende do programa; o método D não dá certificado ICAR | Corte, "Metas genéticas"; Caprinos, "Pela ICAR" |
| Que um índice estrangeiro serve ao pagamento local | o índice carrega o objetivo de quem o fez | Caprinos, Ex. 4; Ovinos, "ISOL" |
| Acurácia sem escala | 0,70 BIF e 0,70 de correlação são coisas diferentes | Corte, "Passo 3" |
| Que a queda de uma taxa num ano veio do manejo | com 30 a 60 fêmeas, o poder para diferenças plausíveis ficou entre 17% e 32% nos exemplos | Caprinos, Ex. 7; seção 8.1 |
| Litros exatos com sêmen importado | depende da tendência de origem, da correlação entre ambientes e do atraso, todos hipóteses | Verif. ovinos, "Hipóteses do Exemplo 8" |
| Endogamia zero | com seleção, o ΔF real é maior que o da fórmula, que é limite inferior | Caprinos, Ex. 8 (FAO) |

---

## 8. Exemplos de atendimento (fictícios)

Os quatro casos são **fictícios**. Os números saem do motor (`central-melhoramento/laboratorio/`, Python 3 e numpy) pelo script do Apêndice A; as saídas abaixo são as reais, coladas sem edição, com ponto decimal. Entradas sem fonte estão marcadas como fictícias ou hipotéticas.

### 8.1 Cabriteira com 60 cabras, sem pedigree

**Triagem.** Saanen e mestiças, 60 cabras. Só a mãe de parte das cabritas é conhecida; dois bodes da casa soltos no lote, sem registro de cobertura. O produtor pesa o leite de cada cabra uma vez por mês em parte do ano; parte das cabras amamenta até cerca de 45 dias. Sem associação. Quer produzir mais e decidir descarte. → **Nível 0**, com plano para o 1.

**Pacote e dados.** Lactação pela ICAR, desvio das contemporâneas, MPPA com três repetibilidades, taxas com intervalo exato, plano de bodes e de registro. Pedir: data de cada parto, ordem e crias, separação dos cabritos, controles e secagem, coberturas por lote com o bode e as datas, diagnóstico, saídas e CCS em parte dos controles.

**Modelo.** Sem BLUP. h² de 0,20, σP de 200 kg, repetibilidade de 0,36 com 0,44 e 0,50 (Caprinos, Ex. 6); grupos de ano × primípara ou adulta × TMY ou TMM (`rebanho.grupo_contemporaneas`).

Números (motor):

```
A1 cabra A07, mamada ate o dia 45: TMM = 413.0 kg ate o dia 250; completa = True; avisos: ['1 controle(s) durante a mamada descartado(s) (ICAR)']
   cabra A12, controles nos dias 30, 60, 120 e 180, sem secagem: TMY = 501.0 kg ate o dia 195; avisos: ['sem data de secagem: fim calculado no dia 195 (último + ½ intervalo)']
   mesma cabra pela curva de Wood (a = 1.049; b = 0.348; c = 0.0065) ate o dia 195: 488.1 kg
A2 cabra  n  desvio medio  MPPA r=0,36 / 0,44 / 0,50   EBV(registros)  REL
   A11  1    +210.0        +75.6 /   +92.4 /  +105.0        +42.0     0.20
   A03  3    +120.0        +75.3 /   +84.3 /   +90.0        +41.9     0.35
   A31  2     +40.0        +21.2 /   +24.4 /   +26.7        +11.8     0.29
   A19  2     -50.0        -26.5 /   -30.6 /   -33.3        -14.7     0.29
   A42  1    -180.0        -64.8 /   -79.2 /   -90.0        -36.0     0.20
   A24  3    -125.0        -78.5 /   -87.8 /   -93.8        -43.6     0.35
A3 taxa                                   x/n     taxa    Wilson 95%         exato 95%
   paricao (paridas/expostas)              51/60   85.0%  73.9% a 91.9%      73.4% a 92.9%
   aborto (abortos/gestacoes)               4/55    7.3%  2.9% a 17.3%       2.0% a 17.6%
   CCS > 1 milhao (cabras/controladas)     14/52   26.9%  16.8% a 40.3%      15.6% a 41.0%
   mortalidade de cabritos                  9/87   10.3%  5.5% a 18.5%       4.8% a 18.7%
   FAMACHA 4 ou 5 numa coleta               7/60   11.7%  5.8% a 22.2%       4.8% a 22.6%
   prolificidade: 51 partos, 87 crias, 1.71 cabrito/parto (DP 0.64; IC 95% 1.53 a 1.89)
   cabritos desmamados por cabra por ano (IEP 365 d) = 1.706 x (1 - 0.103) = 1.53
   aborto 10% -> 5%: n por grupo = 435; poder com 55 gestacoes = 0.17
   CCS alta 27% -> 15%: n por grupo = 180; poder com 52 cabras = 0.32
A4 1 bode(s) da casa por geracao x 60 cabras: Ne = 3.9; dF = 12.71%/geracao; F apos 10 anos (L = 3) = 36.4%
A4 2 bode(s) da casa por geracao x 60 cabras: Ne = 7.7; dF = 6.46%/geracao; F apos 10 anos (L = 3) = 20.0%
A4 4 bode(s) da casa por geracao x 60 cabras: Ne = 15.0; dF = 3.33%/geracao; F apos 10 anos (L = 3) = 10.7%
   bodes para Ne 50 com 60 cabras: 15.8
   F do filho de BX com a filha F1: 25.00%; do irmao FX com a meia-irma F2: 12.50%
A5 i(15%) = 1.554; i(80%) = 0.350; bode pela producao da mae: 6.4 kg/ano; bode avaliado (REL 0,60): 15.6 kg/ano
```

**Entregáveis e leitura**

1. **Lactações.** A cabra A07 entra como TMM (413,0 kg da separação à secagem); o controle feito durante a mamada sai do cálculo, como manda a ICAR. A A12 não tem data de secagem: o fim foi calculado no dia 195, com aviso. Com quatro controles, Fleischmann (501,0 kg) e Wood (488,1 kg) diferem 2,6%, e sem o valor verdadeiro não se sabe qual acertou; no Exemplo 1 de caprinos, com a curva verdadeira conhecida, o Wood com quatro controles errou 0,5%. Recomendação: registrar a secagem e controlar até perto dela.
2. **Descarte.** Pela MPPA, A24 e A42 são as candidatas. No topo, A11 (uma lactação) e A03 (três) empatam com r = 0,36 e se separam com 0,44 e 0,50: a lista mostra as três colunas. O EBV só com registros próprios tem REL de 0,20 a 0,35.
3. **Taxas.** A parição de 85,0% tem intervalo exato de 73,4% a 92,9%. Provar que o aborto caiu de 10% para 5% exigiria 435 gestações por ano; com 55, o poder é de 17%. Taxas em janela móvel de 12 meses; CUSUM só quando houver histórico para calibrar o limite (Caprinos, Ex. 7).
4. **Células.** 26,9% das cabras controladas passaram de 1 milhão de células/mL (limiar da Embrapa). A meta é a fração em queda, julgada com intervalo [proposta].
5. **Bodes.** Com dois bodes da casa, o rebanho fechado acumula 6,46% de endogamia por geração e 20,0% em 10 anos (intervalo de gerações de 3 anos, hipótese do Exemplo 8 de caprinos). Ne de 50 exigiria 15,8 bodes não aparentados por geração: o rebanho não pode se fechar. Plano: comprar bode ou sêmen com PTA publicada e trocar o bode a cada geração. Argumento comercial: 15,6 contra 6,4 kg/ano (Caprinos, Ex. 5).
6. **Para subir ao nível 1:** registrar o bode de cada cobertura (um bode por lote, com datas), a mãe de cada cabrita e a data de separação dos cabritos. Em um ano, as filhas do bode comprado terão a PTA do pai no índice.

### 8.2 Produtor de Girolando com 300 vacas e controle oficial

**Triagem.** Girolando, 300 vacas. Pai (sêmen de touros com prova) conhecido em boa parte das vacas e mãe em todas; controle oficial mensal com componentes e CCS; IA e um touro de repasse. Quer escolher touros, decidir descarte e reposição, metas de reprodução e avaliar genotipagem de novilhas. → **Níveis 1 e 2**, porte de 200 a 1.000 vacas.

**Pacote e dados.** Lactação e sólidos do controle oficial; MPPA e EBV com a PTA do pai; confiabilidade do touro de repasse; probabilidade de superar entre touros de IA; F por par; reprodução com intervalo; genotipagem via programa. Pedir: exportação do controle oficial, partos com ordem e facilidade, IA com touro e protocolo, diagnóstico, PEV adotado, saídas e PTAs dos touros (sumário do PMGG) com confiabilidade e base.

**Modelo.** h² de 0,25, dentro da faixa do Girolando (0,20 a 0,28); σP de 1.600 kg, **hipotético** do relatório de leite; repetibilidade em 0,40, 0,50 e 0,60, porque não há estimativa para o Girolando (Leite, "Comparar com contemporâneas"). PTAs dos touros: fictícias.

Números (motor):

```
B1 vaca G118: leite 305 d (TIM) = 4547.5 kg; gordura 172.8 kg (3.80%); proteina 148.3 kg (3.26%)
   Wood: a = 7.847; b = 0.2943; c = 0.00514; pico no dia 57.2 com 19.24 kg; ECS medio 4.10; CCS geometrica 214 mil (aritmetica 237 mil); FCM 4% = 4410.6 kg
B2 vaca  n  desvio  MPPA r=0,40/0,50/0,60      PTA pai (REL)   pesos b       EBV     REL
   G021  1  +900.0  +360.0/+450.0/+540.0    +400 (0.90)   0.205; 0.795  +502.6   0.384
   G088  1  -350.0  -140.0/-175.0/-210.0    +700 (0.85)   0.208; 0.792  +481.7   0.376
   G047  3  +523.3  +348.9/+392.5/+428.2    +150 (0.95)   0.314; 0.686  +267.2   0.477
   G102  2  +200.0  +114.3/+133.3/+150.0   sem PTA         0.333          +66.7   0.333
   G133  3  -583.3  -388.9/-437.5/-477.3    -100 (0.80)   0.324; 0.676  -256.8   0.459
   ordem por MPPA (r = 0,50): G021, G047, G102, G088, G133
B3 touro de repasse R: 24 filhas em 3 GCs (8 por GC) ao lado de 20 filhas de touro de IA (REL 0,95) por GC: REL de R = 0.519
   teto DE = n com k = 15 (modelo de touro): 0.615; 24 filhas no mesmo rebanho valem 5.13 DE (USDA) -> REL 0.268
B4 sigma_a = 800 kg; P(touro B +1.100 kg, REL 0,60, superar touro A +900 kg, REL 0,95) = 0.772
B5 F esperado (%)   V1     V2     V3     V4
   T1            12.50   0.00   6.25   0.00
   T2             0.00  12.50   0.00   0.00
   T3             0.00   0.00   0.00   0.00
   escolha (preferencia T1 > T2 > T3, limite 6,25%): V1 <- T2 (0.00%); V2 <- T1 (0.00%); V3 <- T1 (6.25%); V4 <- T1 (0.00%)
B6 prenhez de 21 dias, 12 meses: 38/190 = 20.0%; exato 14.6% a 26.4%; Wilson 14.9% a 26.3%; encolhida Beta(10, 40) = 20.0%
B6 prenhez de 21 dias, 1 mes: 9/48 = 18.8%; exato 8.9% a 32.6%; Wilson 10.2% a 31.9%; encolhida Beta(10, 40) = 19.4%
   PR com 145 dias abertos e PEV de 60 d = 21.9%; forma linear 22.0%
   detectar 20% -> 25% de prenhez de 21 dias: 1091 oportunidades por grupo (forma separada); poder com 190 = 0.21
```

**Entregáveis e leitura**

1. **Lactação e células.** A vaca G118 tem 4.547,5 kg em 305 dias pelo TIM, com pico no dia 57 pela curva de Wood. A CCS da tela é a geométrica (214 mil), não a aritmética (237 mil). O limite de 500 mil da IN 76 é de tanque, não de vaca (Leite, "Indicadores zootécnicos").
2. **Duas listas.** Pela MPPA (descarte), G133 e G088 são as candidatas. Pelo EBV (reposição), G088 sobe para o segundo lugar: com uma lactação, o índice dá peso de 0,21 à vaca e de 0,79 ao pai de +700 kg, o padrão da vaca V5 do relatório de leite. G088 pode sair por produção, mas as filhas dela são boas candidatas a reposição.
3. **Touro de repasse.** Com 24 filhas em 3 grupos, ao lado de filhas de um touro de IA, o modelo de touro sem interação rebanho × touro dá REL de 0,52. Pela regra do USDA, que inclui essa interação, 24 filhas no mesmo rebanho valem 5,1 filhas-equivalentes, ou REL de 0,27 (Leite, "Filhas-equivalentes"). A confiabilidade real fica nessa faixa e não se compara à de um touro provado: ele serve de repasse, não de pai de reposição em larga escala.
4. **Touros de IA.** O touro B (+1.100 kg, REL 0,60) supera o A (+900 kg, REL 0,95) com probabilidade de 0,77. Usar B, mas não em todas as vacas: com REL menor, mais touros e menos acasalamentos por touro (Leite, "Metas por categoria").
5. **Acasalamentos.** O T1, preferido pelo índice, é filho do touro popular P e daria 12,5% de F com a V1, filha de P. A alocação por par troca o T1 pelo T2 só na V1, com no máximo 6,25% nas demais, sem descartar touro (Leite, "Endogamia: decidir por par").
6. **Reprodução.** A prenhez de 21 dias de 20,0% em 12 meses vai de 14,6% a 26,4%; a de um mês (18,8%), de 8,9% a 32,6%. A taxa encolhida com Beta(10, 40) [proposta do relatório de leite] quase não muda o número com 190 oportunidades. Provar uma melhora de 20% para 25% exigiria 1.091 oportunidades por grupo; com 190, o poder é de 21%. A DPR para 145 dias abertos e PEV de 60 dias (21,9%) usa a fórmula do USDA para Holandês e serve só como indicador.
7. **Genotipagem de novilhas.** Pelo programa da raça (PMGG, Clarifide). Em Holandês canadense, a confiabilidade do pai médio subiu de 30% a 39% para 69% a 73%, mas não há medida publicada para novilhas Girolando (Leite, "Genotipar novilhas"). Prometer reordenação da reposição, não um número de confiabilidade.
8. **Próximo modelo.** Nesse porte, o relatório de leite propõe dia de controle com regressão aleatória, que está fora do motor (seção 6.3) [a definir].

### 8.3 Associação de raça caprina

**Triagem.** Associação regional de criadores de Saanen e Alpina: 25 rebanhos, 3.000 cabras, 9 rebanhos no controle oficial; pedigree em livro, monta natural na maioria e IA em poucos. Quer sumário de bodes, índice e saber se vale genotipar. → **Nível 3**. As duas raças já são avaliadas pelo Capragene.

**Pacote e dados.** Diagnóstico de conexão, especificação do modelo, plano de teste de bodes, tamanho efetivo, cenários de ganho, expectativa genômica e índice a definir com a associação. Como Saanen e Alpina têm avaliação nacional, o pacote prioriza levar os 16 rebanhos de fora para o controle oficial e aumentar a conexão, sem criar PTAs paralelas [equipe]. Pedir: pedigree de todos os rebanhos, controles no padrão da ICAR com a separação dos cabritos, coberturas com o bode, uso de cada bode por rebanho e ano, genótipos existentes.

**Modelo.** Modelo animal multicaracterística com ambiente permanente e GC aleatório, como no Capragene desde 2020 (Caprinos, "Modelo de lactação"); variâncias por REML ou Gibbs, fora do motor. Na demonstração, o motor usa GC fixo, h² de 0,20 e σP de 200 kg, com dados fictícios.

Números (motor):

```
C1 k_d(h2 0,20) = 18.0; DE para REL 0,50 = 18.0; para REL 0,70 = 42.0
C2 30 filhas num rebanho, sem outro bode: REL de X = 0.000
C2 30 filhas em 3 rebanhos (10 + 10 de IA em cada): REL de X = 0.423
C2 30 filhas em 15 rebanhos (2 + 10 de IA em cada): REL de X = 0.538
C3 modelo animal, 3 rebanhos ligados pelo bode IA1 (24 cabras):
   IA1: PTA  +10.3 kg; REL 0.222; acuracia BIF 0.118
   L1: PTA   -5.9 kg; REL 0.088; acuracia BIF 0.045
   L2: PTA   -3.8 kg; REL 0.088; acuracia BIF 0.045
   L3: PTA   -0.6 kg; REL 0.088; acuracia BIF 0.045
   os mesmos rebanhos sem filhas de IA1 (cada rebanho com um so bode):
   L1: PTA   +0.0 kg; REL 0.000
   L2: PTA   -0.0 kg; REL 0.000
   L3: PTA   -0.0 kg; REL 0.000
C4 24 bodes x 3.000 cabras, uso igual: Ne = 95.2; dF = 0.52%
   uso desigual (4 bodes com 15% cada e 20 com 2%): N efetivo de pais = 10.20; Ne = 40.7; dF = 1.23%
C5 ganho esperado: teste de progenie 17.14 kg/ano; bodes jovens genomicos 27.46 kg/ano
C6 Daetwyler: N = 600, h2/REL = 0.25, Me = 1000: r = 0.36
C6 Daetwyler: N = 600, h2/REL = 0.25, Me = 3000: r = 0.22
C6 Daetwyler: N = 677, h2/REL = 0.8, Me = 1000: r = 0.59
C6 Daetwyler: N = 677, h2/REL = 0.8, Me = 3000: r = 0.39
   N para r = 0,50 (REL 0,25) com h2 0,25 e Me 1.000: 1333
C7 bode A: IPC = 2.28; ICC Alpina = 1.98; ICC Saanen = 1.92
C7 bode B: IPC = 1.74; ICC Alpina = 2.34; ICC Saanen = 2.46
```

**Entregáveis e leitura**

1. **Meta de confiabilidade.** Publicar um bode com REL de 0,50, o mínimo do Capragene para Alpinos, exige 18 filhas-equivalentes; 0,70 exige 42 (C1).
2. **Teste de bodes.** As mesmas 30 filhas valem REL de 0 num rebanho sem outro bode, 0,42 em 3 rebanhos e 0,54 em 15, ao lado de filhas de um bode de IA (C2). Regra a propor: a francesa, com filhas em pelo menos 15 rebanhos e 30 filhas indexadas (Caprinos, "PTA, base e confiabilidade").
3. **Conexão.** Com um bode de IA comum aos três rebanhos, os bodes locais ganham alguma avaliação (REL de 0,088 com 4 filhas cada); sem ele, a REL é zero (C3). A IA com bodes comuns é a primeira decisão da associação.
4. **Tamanho efetivo.** Vinte e quatro bodes usados por igual dão Ne de 95 e ΔF de 0,52% por geração. Se quatro bodes fizerem 60% dos cabritos, o Ne cai para 41 e o ΔF sobe para 1,23%, acima do limite de 1% da FAO (C4). Limitar o uso de cada bode, como a NSG faz com as doses (Caprinos, "Esquemas de seleção de bodes").
5. **Ganho.** Teste de progênie: 17,1 kg/ano; bodes jovens genômicos: 27,5 kg/ano (27,46 com σa = √8000 = 89,44 kg, como no Exemplo 5 de caprinos). São tetos: o Capragene realizou 6,34 kg/ano na Saanen e 4,05 na Alpina (Caprinos, Ex. 5).
6. **Genômica.** Com 600 fêmeas genotipadas de uma lactação, a acurácia esperada fica entre 0,22 e 0,36, conforme o M_e, não estimado para caprinos; r de 0,50 exigiria 1.333 fêmeas com M_e de 1.000 (C6). Não montar referência própria: genotipar pelo Capragene (chip Axiom OviCap na Saanen) e priorizar a verificação de paternidade (Caprinos, "Uma referência de centenas de animais").
7. **Índice.** O Capragene não publica índice composto (Caprinos, "Índices"). Um índice da associação precisa de valores econômicos brasileiros, ausentes nas fontes [a definir]. A conta C7 reproduz o ICC francês do Exemplo 4 só como ilustração: o bode A, melhor em produção, perde para o B pelo úbere.

### 8.4 Criador de Nelore que quer vender touros

**Triagem.** Nelore, 1.200 vacas. IATF com sêmen de touros avaliados em parte das vacas e repasse com lotes de touros (paternidade múltipla). Pesa os bezerros na desmama, em mais de um dia; não pesa ao sobreano nem mede perímetro escrotal ou carcaça. Fora de programa. Quer vender touros com avaliação. → **Nível 2 obrigatório**, com o 1 dentro de casa; porte de 500 a 2.000 vacas.

**Pacote e dados.** Inscrição num programa (ANCP, ABCZ com Embrapa-Geneplus ou GenSys, conforme o mercado); reorganização dos GCs e das pesagens; paternidade; ferramentas internas; material de venda; genotipagem pelo programa. Pedir: nascimentos com data e mãe, touro ou lote de cada exposição com datas, pesagens com data, diagnóstico, saídas, e DEPs e acurácias dos touros de IA.

**Modelo.** No programa, o modelo do programa (na ANCP, ssGBLUP com APY). Dentro de casa: h² direta de 0,24 e materna de 0,13 no peso à desmama, σam = 0 e sensibilidade de 0,15 a 0,33 (Corte, "Parâmetros externos"); repetibilidade de 0,33 com 0,20 e 0,51 (Corte, "Ferramentas que funcionam com N pequeno"). Nas contas de ganho, σa de 10 kg e as acurácias são as hipotéticas do relatório (Corte, "Resposta à seleção").

Números (motor):

```
D1 tamanho do GC x acuracia (h2 0,25, um registro, nao aparentados):
   GC de   2: r = 0.354; REL = 0.125; a_BIF = 0.065
   GC de   3: r = 0.408; REL = 0.167; a_BIF = 0.087
   GC de   5: r = 0.447; REL = 0.200; a_BIF = 0.106
   GC de  10: r = 0.474; REL = 0.225; a_BIF = 0.120
   GC de  20: r = 0.487; REL = 0.237; a_BIF = 0.127
   GC de 100: r = 0.497; REL = 0.247; a_BIF = 0.133
D2 razao BIF de um bezerro de 230 kg num GC de media 210 kg = 109.5
D3 MPPA (razao BIF) de vaca com 3 crias de razao media 112: r 0.20 -> 105.14; r 0.33 -> 107.16; r 0.51 -> 109.09
D4 Possible Change, DEP P450 com sigma_A/2 = 8,24 kg e acuracia 0,70: BIF 68% = 2.47 kg; BIF 95% = 4.94 kg; se 0,70 for r (tabela ANCP) = 5.88 kg
   r -> a_BIF: 0.50 -> 0.134; 0.60 -> 0.200; 0.80 -> 0.400; 0.90 -> 0.564; 0.98 -> 0.801
   P(touro Y, DEP +15 kg, a_BIF 0,30 [REL 0.51], superar X, +12 kg, a_BIF 0,70 [REL 0.91]) = 0.684
D5 i(10%) = 1.755; i(70%) = 0.497; touros com DEP genomica: 1.55 kg/ano; touros por fenotipo: 0.86 kg/ano (sigma_a = 10 kg)
D6 40 touros x 1.200 vacas, uso igual: Ne = 154.8; dF = 0.32%/geracao (0.06%/ano com L = 5)
   60% dos bezerros de 3 touros de IA e 40% de 37 touros de repasse: N ef = 8.04; Ne = 32.0; dF = 1.56%/geracao (0.31%/ano)
D7 prenhez 1020/1200 = 85.0%: exato 82.9% a 87.0%; Wilson 82.9% a 86.9%
D7 prenhez 85/100 = 85.0%: exato 76.5% a 91.4%; Wilson 76.7% a 90.7%
   detectar queda de 85% para 80%: 906 vacas por ano; poder com 100 = 0.15; com 1.200 = 0.90
```

A razão BIF (D2) é conta direta, sem função no motor.

**Entregáveis e leitura**

1. **Grupos de contemporâneos.** O motor reproduz a tabela do relatório de corte: com h² de 0,25, um GC de 2 bezerros limita a acurácia a 0,354, cerca de 30% abaixo do teto de 0,50; com 20, chega a 0,487 (D1). Entregável: estação de monta concentrada, todo o GC pesado no mesmo dia, na janela de idade do programa, e pelo menos dois touros por GC (Corte, "Antes do modelo").
2. **Paternidade.** Na monta múltipla, só DNA ou lotes de um touro resolvem a paternidade; sem isso, a conexão por pedigree fica subestimada (Corte, "BLUP intra-rebanho"). Entregável: plano de lotes e de exames de paternidade dos candidatos à venda [equipe].
3. **Ferramentas internas.** Razão BIF por sexo dentro do GC (D2) e MPPA das vacas com três repetibilidades (D3): uma vaca com três crias de razão média 112 fica entre 105,1 e 109,1. Servem para manejo, não para o catálogo.
4. **Material de venda.** DEP oficial com a acurácia na escala do programa. Uma DEP de P450 com acurácia BIF de 0,70 tem Possible Change de ±2,47 kg a 68% e ±4,94 kg a 95%; se o 0,70 for correlação, como sugere a tabela da ANCP, ±5,88 kg. Um touro jovem de +15 kg e acurácia BIF de 0,30 supera um provado de +12 kg e 0,70 com probabilidade de 0,68 (D4). Essas informações vão ao comprador com a DEP [equipe].
5. **IA com touros avaliados.** No exemplo de corte, touros com DEP genômica (r = 0,70, entre os 10% melhores) rendem 1,55 kg/ano de valor genético, contra 0,86 kg/ano com touros escolhidos por fenótipo (D5; Corte, "Resposta à seleção").
6. **Endogamia.** Quarenta touros usados por igual dão ΔF de 0,32% por geração; se três touros de IA fizerem 60% dos bezerros, o número efetivo de pais cai para 8,0 e o ΔF sobe para 1,56% (D6). Limitar o uso de cada touro de IA e conferir F por par.
7. **Taxas.** Com 1.200 vacas, a prenhez de 85% vai de 82,9% a 87,0%; num lote de 100, de 76,5% a 91,4%. Uma queda de 85% para 80% é detectável no rebanho inteiro (poder de 0,90), não num lote (0,15) (D7).
8. **Certificação.** CEIP, CSG e ATJ dependem do programa; o ATJ do Geneplus exige IQG até 3% e positivo nas características do índice (Corte, "Metas genéticas: certificação e percentis"). Confirmar as regras do programa escolhido antes de prometer [a definir].
9. **Genotipagem.** Touros à venda e novilhas de reposição no ssGBLUP do programa (Corte, "Estratégia por porte de rebanho"); testes comerciais fora do programa não substituem a DEP genômica oficial (Corte, "Informação externa").

---

## 9. Limites e próximos passos

### 9.1 Limites

- **Faltam parâmetros brasileiros:** repetibilidade de lactação de Gir e Girolando, σP dentro do GC em caprinos, h² de leite de ovelhas brasileiras, parâmetros de verminose, longevidade e tipo em cabras brasileiras (seções de parâmetros de Leite, Caprinos e Ovinos). O guia usa valores estrangeiros ou hipotéticos e manda rodar sensibilidade.
- **O motor não faz tudo:** REML, Gibbs, ssGBLUP, regressão aleatória, limiar, sobrevivência e GC aleatório estão fora (README, "Limites").
- **Ovinos:** a seção 4.4 foi reconferida com o relatório v2 em 15/10/2026; os conflitos que seguem abertos (Ne de 370 contra 188, os 5,4 L/ano da brochura, 0,62 contra 0,51 desvio do ISOL) aparecem lado a lado.
- **Metas são, em boa parte, propostas:** o guia separa referência com fonte de [proposta] e de [equipe].
- **Dados fictícios:** os exemplos ilustram contas e decisões; não são benchmarks.

### 9.2 Pontos a definir

| # | Ponto | Seção |
|---|---|---|
| 1 | Limiar de completude do pedigree entre os níveis 0 e 1 | 2.1 |
| 2 | Rótulos de confiabilidade na tela (0,30 e 0,50), propostos pela equipe | 3.2 |
| 3 | No motor: GC aleatório, CACO, razão BIF, pesos padronizados de corte, intervalos entre datas, heterozigose; generalizar `rebanho.desvios_contemporaneas` | 3.1 a 3.5, 5.5 |
| 4 | σP real por raça e repetibilidade de Gir e Girolando | 4.2, 4.3 |
| 5 | Formatos de exportação e de retorno de cada programa (ACCOMIG/Caprileite, ABCG e Embrapa, ANCP, ABCZ, Geneplus, GenSys) | 3.3, 5.1 |
| 6 | Regras de CEIP, CSG e ATJ do programa escolhido por cada cliente de corte | 4.1, 8.4 |
| 7 | Valores econômicos brasileiros para índices de cabras e ovelhas | 8.3 |
| 8 | Limites de CUSUM, calibrados com o histórico de cada rebanho | 3.1, 8.1 |
| 9 | Metas de fertilidade de bodes e carneiros em monta e de mortalidade de cabritos e cordeiros | 4.3, 4.4 |
| 10 | Porte em que a Edge Function deixa de bastar para o BLUP | 6.3 |
| 11 | Tabelas de resultados no Supabase | 6.4 |
| 12 | Software ou parceiro para REML, ssGBLUP e regressão aleatória | 3.4, 6.3 |
| 13 | Aplicação da IN 76 ao leite de ovelha, com o serviço de inspeção | 4.4 |

### 9.3 Próximos passos

1. Portar para Dart as camadas de fórmula fechada, na ordem da seção 6.5, com teste contra `vetores_teste.json`.
2. Testar o motor com dados anonimizados do SeabraApp, como prevê o estado da pesquisa (`research_notes/ESTADO_DA_PESQUISA.md`, "Próximos passos", item 4), começando por `rebanho.executar`.
3. Implementar no motor os itens do ponto 3 acima, com teste e vetores.
4. Abrir conversa com os programas sobre os formatos de dados, começando pelo controle leiteiro caprino, onde está o produto principal.
5. Reconferir a seção 4.4 quando o relatório de ovinos corrigido sair.
6. Transformar as seções 2 e 7 em roteiro de atendimento e material de venda da equipe comercial [equipe].

---

## Apêndice A: script dos exemplos

O script gera todos os números da seção 8 e o bloco E (conferências de ovinos da seção 4.4). Salve-o como `central-melhoramento/laboratorio/casos_guia.py` e rode `python3 casos_guia.py` nessa pasta; ele usa só o pacote `melhoramento`, numpy e a biblioteca padrão. Conferido em 15/10/2026 com o motor na versão 0.1.0 (128 testes passando, inclusive a validação contra Mrode et al. 2023).

```python
# Casos FICTICIOS do Guia de aplicacao por demanda (Central de Melhoramento Seabra).
# Salve como central-melhoramento/laboratorio/casos_guia.py e rode ali:  python3 casos_guia.py
# (ou, de outra pasta: PYTHONPATH=central-melhoramento/laboratorio python3 casos_guia.py)
# Nenhum animal, rebanho ou criador e real. Parametros: ver o guia (secao 8).
import math
from melhoramento import blup, confiabilidade as conf, ganho, indices, lactacao, parentesco, taxas
SIGMA_A_CAP = math.sqrt(8000)  # h2 0,20 x sigmaP 200 kg (Caprinos, Exemplo 5): 89,44 kg


def pct(x, c=1):
    return f"{100 * x:.{c}f}%"


def ic(par, c=1):
    return f"{pct(par[0], c)} a {pct(par[1], c)}"


print("=" * 78)
print("CASO A (ficticio): cabriteira com 60 cabras, sem pedigree")
print("=" * 78)
# A1. Lactacao de duas cabras pelas regras da ICAR (Secao 16)
dias = [20, 50, 80, 110, 140, 170, 200, 230]
leite = [2.10, 2.60, 2.50, 2.30, 2.10, 1.90, 1.60, 1.40]
tmm = lactacao.lactacao_pequenos_ruminantes(dias, leite, "caprino", secagem=250,
                                            separacao_crias=45, comprimento=305)
print(f"A1 cabra A07, mamada ate o dia 45: {tmm.tipo} = {tmm.total:.1f} kg ate o dia "
      f"{tmm.ate_dia:.0f}; completa = {tmm.completa}; avisos: {tmm.avisos}")
d2, l2 = [30, 60, 120, 180], [2.80, 3.00, 2.50, 2.00]
tmy = lactacao.lactacao_pequenos_ruminantes(d2, l2, "caprino", comprimento=305)
a, b, cc = lactacao.ajustar_wood_loglinear(d2, l2)
wood_fim = lactacao.total_pela_curva(lambda t: lactacao.wood(t, a, b, cc), 305, secagem=int(tmy.ate_dia))
print(f"   cabra A12, controles nos dias 30, 60, 120 e 180, sem secagem: {tmy.tipo} = {tmy.total:.1f} kg "
      f"ate o dia {tmy.ate_dia:.0f}; avisos: {tmy.avisos}")
print(f"   mesma cabra pela curva de Wood (a = {a:.3f}; b = {b:.3f}; c = {cc:.4f}) ate o dia "
      f"{tmy.ate_dia:.0f}: {wood_fim:.1f} kg")

# A2. Desvios das contemporaneas, MPPA (descarte) e EBV so com registros proprios
h2, sp = 0.20, 200.0
cabras = {"A03": [150, 120, 90], "A11": [210], "A19": [-40, -60], "A24": [-130, -95, -150],
          "A31": [60, 20], "A42": [-180]}
print("A2 cabra  n  desvio medio  MPPA r=0,36 / 0,44 / 0,50   EBV(registros)  REL")
linhas = []
for k, dv in cabras.items():
    n, m = len(dv), sum(dv) / len(dv)
    mp = [indices.mppa(m, n, r) for r in (0.36, 0.44, 0.50)]
    idx = indices.indice_femea(dv, h2, 0.36, sp)
    linhas.append((k, n, m, mp, idx))
for k, n, m, mp, idx in sorted(linhas, key=lambda x: -x[3][0]):
    print(f"   {k}  {n}  {m:+8.1f}      {mp[0]:+7.1f} / {mp[1]:+7.1f} / {mp[2]:+7.1f}"
          f"      {idx.ebv:+7.1f}     {idx.confiabilidade:.2f}")

# A3. Taxas da estacao com intervalo de confianca
casos = [("paricao (paridas/expostas)", 51, 60), ("aborto (abortos/gestacoes)", 4, 55),
         ("CCS > 1 milhao (cabras/controladas)", 14, 52), ("mortalidade de cabritos", 9, 87),
         ("FAMACHA 4 ou 5 numa coleta", 7, 60)]
print("A3 taxa                                   x/n     taxa    Wilson 95%         exato 95%")
for nome, x, n in casos:
    print(f"   {nome:38s} {x:3d}/{n:<3d} {pct(x / n):>6s}  {ic(taxas.ic_wilson(x, n)):18s} "
          f"{ic(taxas.ic_exato(x, n))}")
crias = [1] * 20 + [2] * 26 + [3] * 5
med, dp, li, ls = taxas.ic_media_t(crias)
print(f"   prolificidade: {len(crias)} partos, {sum(crias)} crias, {med:.2f} cabrito/parto "
      f"(DP {dp:.2f}; IC 95% {li:.2f} a {ls:.2f})")
mort = 9 / 87
print(f"   cabritos desmamados por cabra por ano (IEP 365 d) = {med:.3f} x (1 - {mort:.3f}) = "
      f"{med * (1 - mort):.2f}")
print(f"   aborto 10% -> 5%: n por grupo = {taxas.n_por_grupo(0.10, 0.05)}; poder com 55 gestacoes = "
      f"{taxas.poder_duas_proporcoes(0.10, 0.05, 55):.2f}")
print(f"   CCS alta 27% -> 15%: n por grupo = {taxas.n_por_grupo(0.27, 0.15)}; poder com 52 cabras = "
      f"{taxas.poder_duas_proporcoes(0.27, 0.15, 52):.2f}")

# A4. Endogamia de rebanho fechado
for nm in (1, 2, 4):
    ne = parentesco.ne_wright(nm, 60)
    df = parentesco.delta_F(ne)
    print(f"A4 {nm} bode(s) da casa por geracao x 60 cabras: Ne = {ne:.1f}; dF = {pct(df, 2)}/geracao; "
          f"F apos 10 anos (L = 3) = {pct(parentesco.F_acumulado(df, 10 / 3))}")
try:
    print(f"   bodes para Ne 50 com 60 cabras: {parentesco.n_machos_para_ne(50, 60):.1f}")
except ValueError as e:
    print("   bodes para Ne 50 com 60 cabras:", e)
ped_a = {"BX": (None, None), "M1": (None, None), "F1": ("BX", "M1"), "M2": (None, None),
         "F2": ("BX", "M2"), "FX": ("BX", "M1")}
print(f"   F do filho de BX com a filha F1: {pct(parentesco.F_acasalamento(ped_a, 'BX', 'F1'), 2)}; "
      f"do irmao FX com a meia-irma F2: {pct(parentesco.F_acasalamento(ped_a, 'FX', 'F2'), 2)}")

# A5. Ganho esperado: bode pela producao da mae x bode avaliado (Caprinos, Exemplo 5)
i15 = ganho.intensidade_selecao(0.15)
i80 = ganho.intensidade_selecao(0.80)
g_mae = ganho.ganho_vias([(i15, 0.224, 3), (i80, 0.447, 4)], SIGMA_A_CAP)
g_aval = ganho.ganho_vias([(i15, 0.775, 4), (i80, 0.55, 4)], SIGMA_A_CAP)
print(f"A5 i(15%) = {i15:.3f}; i(80%) = {i80:.3f}; bode pela producao da mae: {g_mae:.1f} kg/ano; "
      f"bode avaliado (REL 0,60): {g_aval:.1f} kg/ano")

print()
print("=" * 78)
print("CASO B (ficticio): Girolando, 300 vacas, controle leiteiro oficial")
print("=" * 78)
del_b = [15, 45, 75, 105, 135, 165, 195, 225, 255, 285]
lt_b = [16.0, 19.5, 19.0, 17.8, 16.4, 15.1, 13.6, 12.2, 10.9, 9.5]
gd_b = [4.0, 3.6, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2]
pt_b = [3.2, 3.1, 3.1, 3.2, 3.2, 3.3, 3.4, 3.4, 3.5, 3.5]
ccs_b = [90, 150, 120, 210, 260, 180, 320, 410, 280, 350]
l305 = lactacao.tim(del_b, lt_b, 305)
g305 = lactacao.producao_componente(del_b, lt_b, gd_b, 305)
p305 = lactacao.producao_componente(del_b, lt_b, pt_b, 305)
aw, bw, cw = lactacao.ajustar_wood_loglinear(del_b, lt_b)
tp, yp = lactacao.pico_wood(aw, bw, cw)
ecs_m = sum(lactacao.ecs(ccs_b)) / len(ccs_b)
print(f"B1 vaca G118: leite 305 d (TIM) = {l305:.1f} kg; gordura {g305:.1f} kg ({100 * g305 / l305:.2f}%); "
      f"proteina {p305:.1f} kg ({100 * p305 / l305:.2f}%)")
print(f"   Wood: a = {aw:.3f}; b = {bw:.4f}; c = {cw:.5f}; pico no dia {tp:.1f} com {yp:.2f} kg; "
      f"ECS medio {ecs_m:.2f}; CCS geometrica {lactacao.ccs_media_geometrica(ccs_b):.0f} mil "
      f"(aritmetica {sum(ccs_b) / len(ccs_b):.0f} mil); FCM 4% = {lactacao.fcm4(l305, g305):.1f} kg")

h2b, spb = 0.25, 1600.0
vacas = {"G021": ([900], 400, 0.90), "G047": ([500, 650, 420], 150, 0.95),
         "G088": ([-350], 700, 0.85), "G102": ([300, 100], None, 0.0),
         "G133": ([-600, -450, -700], -100, 0.80)}
print("B2 vaca  n  desvio  MPPA r=0,40/0,50/0,60      PTA pai (REL)   pesos b       EBV     REL")
res_b = []
for k, (dv, pta, rel) in vacas.items():
    n, m = len(dv), sum(dv) / len(dv)
    mp = [indices.mppa(m, n, r) for r in (0.40, 0.50, 0.60)]
    idx = indices.indice_femea(dv, h2b, 0.50, spb, pta_pai=pta, rel_pai=rel)
    res_b.append((k, n, m, mp, pta, rel, idx))
for k, n, m, mp, pta, rel, idx in sorted(res_b, key=lambda x: -x[6].ebv):
    pai = f"{pta:+5.0f} ({rel:.2f})" if pta is not None else "sem PTA      "
    pesos = "; ".join(f"{x:.3f}" for x in idx.pesos)
    print(f"   {k}  {n} {m:+7.1f}  {mp[0]:+6.1f}/{mp[1]:+6.1f}/{mp[2]:+6.1f}   {pai}   {pesos:12s} "
          f"{idx.ebv:+7.1f}   {idx.confiabilidade:.3f}")
print("   ordem por MPPA (r = 0,50): " + ", ".join(k for k, *_ in sorted(res_b, key=lambda x: -x[3][1])))

rel_r = blup.rel_exata_modelo_touro([{"R": 8, "T": 20}] * 3, 0.25, {"T": 0.95})
de24 = conf.de_filhas_mesmo_rebanho(24)
print(f"B3 touro de repasse R: 24 filhas em 3 GCs (8 por GC) ao lado de 20 filhas de touro de IA "
      f"(REL 0,95) por GC: REL de R = {rel_r['R']:.3f}")
print(f"   teto DE = n com k = 15 (modelo de touro): {conf.rel_filhas(24, 0.25, False):.3f}; "
      f"24 filhas no mesmo rebanho valem {de24:.2f} DE (USDA) -> REL {conf.rel_de_de(de24, conf.k_d(0.25)):.3f}")
sa = math.sqrt(h2b) * spb
print(f"B4 sigma_a = {sa:.0f} kg; P(touro B +1.100 kg, REL 0,60, superar touro A +900 kg, REL 0,95) = "
      f"{indices.prob_superar_pta(1100, 0.60, 900, 0.95, sa):.3f}")
ped_b = {"P": (None, None), "Q": (None, None), "M1": ("P", None), "V1": ("P", None), "V2": ("Q", None),
         "V3": (None, "M1"), "V4": (None, None), "T1": ("P", None), "T2": ("Q", None), "T3": (None, None)}
tab = parentesco.tabela_F_acasalamentos(ped_b, ["T1", "T2", "T3"], ["V1", "V2", "V3", "V4"])
print("B5 F esperado (%)   V1     V2     V3     V4")
for t, linha in tab.items():
    print(f"   {t}            " + "  ".join(f"{100 * v:5.2f}" for v in linha.values()))
esc = parentesco.escolher_reprodutores(ped_b, ["V1", "V2", "V3", "V4"], ["T1", "T2", "T3"], 0.0625)
print("   escolha (preferencia T1 > T2 > T3, limite 6,25%): " +
      "; ".join(f"{v} <- {m} ({pct(f, 2)})" for v, (m, f, ok) in esc.items()))
for nome, x, n in (("prenhez de 21 dias, 12 meses", 38, 190), ("prenhez de 21 dias, 1 mes", 9, 48)):
    print(f"B6 {nome}: {x}/{n} = {pct(x / n)}; exato {ic(taxas.ic_exato(x, n))}; Wilson "
          f"{ic(taxas.ic_wilson(x, n))}; encolhida Beta(10, 40) = {pct(taxas.taxa_encolhida(x, n, 10, 40))}")
print(f"   PR com 145 dias abertos e PEV de 60 d = {ganho.dpr_aipl(145, 60):.1f}%; forma linear "
      f"{ganho.dpr_linear(145):.1f}%")
print(f"   detectar 20% -> 25% de prenhez de 21 dias: {taxas.n_por_grupo(0.20, 0.25, variancia='separada')} "
      f"oportunidades por grupo (forma separada); poder com 190 = "
      f"{taxas.poder_duas_proporcoes(0.20, 0.25, 190):.2f}")

print()
print("=" * 78)
print("CASO C (ficticio): associacao de raca caprina")
print("=" * 78)
kd = conf.k_d(0.20)
print(f"C1 k_d(h2 0,20) = {kd:.1f}; DE para REL 0,50 = {conf.de_de_rel(0.50, kd):.1f}; "
      f"para REL 0,70 = {conf.de_de_rel(0.70, kd):.1f}")
cen = {"30 filhas num rebanho, sem outro bode": [{"X": 30}],
       "30 filhas em 3 rebanhos (10 + 10 de IA em cada)": [{"X": 10, "IA": 10}] * 3,
       "30 filhas em 15 rebanhos (2 + 10 de IA em cada)": [{"X": 2, "IA": 10}] * 15}
for nome, des in cen.items():
    print(f"C2 {nome}: REL de X = {blup.rel_exata_modelo_touro(des, 0.20, {'IA': 0.90})['X']:.3f}")

ped_c, anim_c, y_c, gc_c = {}, [], [], []
dados_c = {"R1": {"IA1": [760, 720, 790, 740], "L1": [680, 650, 700, 690]},
           "R2": {"IA1": [650, 630, 690, 660], "L2": [600, 640, 580, 610]},
           "R3": {"IA1": [840, 870, 820, 860], "L3": [830, 850, 800, 845]}}
for b_ in ("IA1", "L1", "L2", "L3"):
    ped_c[b_] = (None, None)
k_ = 0
for reb, bodes in dados_c.items():
    for bode, vals in bodes.items():
        for v in vals:
            k_ += 1
            cab = f"{reb}-{k_:02d}"
            ped_c[cab] = (bode, None)
            anim_c.append(cab)
            y_c.append(v)
            gc_c.append(reb)
s2a, s2e = 0.20 * 200 ** 2, 0.80 * 200 ** 2
res_c = blup.modelo_animal(ped_c, anim_c, y_c, gc_c, s2a, s2e)
print("C3 modelo animal, 3 rebanhos ligados pelo bode IA1 (24 cabras):")
for b_ in ("IA1", "L1", "L2", "L3"):
    r_ = res_c.animal(b_)
    print(f"   {b_}: PTA {r_['dep']:+6.1f} kg; REL {r_['confiabilidade']:.3f}; acuracia BIF {r_['acuracia_bif']:.3f}")
ped_d = {k: v for k, v in ped_c.items() if v[0] != "IA1" and k != "IA1"}
sel = [i for i, a_ in enumerate(anim_c) if ped_c[a_][0] != "IA1"]
res_d = blup.modelo_animal(ped_d, [anim_c[i] for i in sel], [y_c[i] for i in sel],
                           [gc_c[i] for i in sel], s2a, s2e)
print("   os mesmos rebanhos sem filhas de IA1 (cada rebanho com um so bode):")
for b_ in ("L1", "L2", "L3"):
    r_ = res_d.animal(b_)
    print(f"   {b_}: PTA {r_['dep']:+6.1f} kg; REL {r_['confiabilidade']:.3f}")

prop = [0.15] * 4 + [0.02] * 20
nef = parentesco.numero_efetivo_pais(prop)
ne_des = parentesco.ne_wright(nef, 3000)
ne_ig = parentesco.ne_wright(24, 3000)
print(f"C4 24 bodes x 3.000 cabras, uso igual: Ne = {ne_ig:.1f}; dF = {pct(parentesco.delta_F(ne_ig), 2)}")
print(f"   uso desigual (4 bodes com 15% cada e 20 com 2%): N efetivo de pais = {nef:.2f}; Ne = {ne_des:.1f}; "
      f"dF = {pct(parentesco.delta_F(ne_des), 2)}")
i5, i10, i15, i20, i80 = (ganho.intensidade_selecao(p) for p in (0.05, 0.10, 0.15, 0.20, 0.80))
tp_ = ganho.ganho_vias([(i20, 0.79, 5.5), (i20, 0.79, 5.5), (i5, 0.60, 4), (i80, 0.55, 4)], SIGMA_A_CAP)
gen_ = ganho.ganho_vias([(i5, 0.65, 2), (i15, 0.65, 2.5), (i10, 0.65, 3.5), (i80, 0.55, 4)], SIGMA_A_CAP)
print(f"C5 ganho esperado: teste de progenie {tp_:.2f} kg/ano; bodes jovens genomicos {gen_:.2f} kg/ano")
for N, h2r, me in ((600, 0.25, 1000), (600, 0.25, 3000), (677, 0.80, 1000), (677, 0.80, 3000)):
    print(f"C6 Daetwyler: N = {N}, h2/REL = {h2r}, Me = {me}: r = {conf.daetwyler_r(N, h2r, me):.2f}")
print(f"   N para r = 0,50 (REL 0,25) com h2 0,25 e Me 1.000: {conf.daetwyler_n_para_rel(0.25, 0.25, 1000):.0f}")
ipc = lambda mp, tp, mg, tb: indices.indice_economico([1, 0.4, 0.2, 0.1], [mp, tp, mg, tb])
for nome, (mp, tp, mg, tb, imc) in {"A": (1.8, 0.4, 1.5, 0.2, -0.6), "B": (1.0, 1.2, 0.8, 1.0, 1.2)}.items():
    v = ipc(mp, tp, mg, tb)
    print(f"C7 bode {nome}: IPC = {v:.2f}; ICC Alpina = {v + 0.5 * imc:.2f}; ICC Saanen = {v + 0.6 * imc:.2f}")

print()
print("=" * 78)
print("CASO D (ficticio): Nelore, 1.200 vacas, quer vender touros")
print("=" * 78)
print("D1 tamanho do GC x acuracia (h2 0,25, um registro, nao aparentados):")
for n in (2, 3, 5, 10, 20, 100):
    pd = {f"a{i}": (None, None) for i in range(n)}
    r = blup.modelo_animal(pd, list(pd), [0.0] * n, ["G"] * n, 25.0, 75.0)
    print(f"   GC de {n:3d}: r = {r.acuracia[0]:.3f}; REL = {r.confiabilidade[0]:.3f}; "
          f"a_BIF = {r.acuracia_bif[0]:.3f}")
print(f"D2 razao BIF de um bezerro de 230 kg num GC de media 210 kg = {230 / 210 * 100:.1f}")
print("D3 MPPA (razao BIF) de vaca com 3 crias de razao media 112: " +
      "; ".join(f"r {r:.2f} -> {indices.mppa(112, 3, r, 100):.2f}" for r in (0.20, 0.33, 0.51)))
sA = 2 * 8.24   # sigma_A/2 = 8,24 kg (Corte, Passo 3)
print(f"D4 Possible Change, DEP P450 com sigma_A/2 = 8,24 kg e acuracia 0,70: BIF 68% = "
      f"{blup.possible_change(0.70, sA):.2f} kg; BIF 95% = {blup.possible_change(0.70, sA, 2):.2f} kg; "
      f"se 0,70 for r (tabela ANCP) = {blup.possible_change_de_r(0.70, sA):.2f} kg")
print("   r -> a_BIF: " + "; ".join(f"{r:.2f} -> {conf.bif_de_r(r):.3f}" for r in (0.50, 0.60, 0.80, 0.90, 0.98)))
rx, ry = conf.rel_de_bif(0.70), conf.rel_de_bif(0.30)
print(f"   P(touro Y, DEP +15 kg, a_BIF 0,30 [REL {ry:.2f}], superar X, +12 kg, a_BIF 0,70 [REL {rx:.2f}]) = "
      f"{indices.prob_superar_pta(15, ry, 12, rx, sA):.3f}")
i10c, i70c = ganho.intensidade_selecao(0.10), ganho.intensidade_selecao(0.70)
g_gen = ganho.ganho_vias([(i10c, 0.70, 3.5), (i70c, 0.50, 6)], 10)
g_fen = ganho.ganho_vias([(i10c, 0.40, 5), (i70c, 0.50, 6)], 10)
print(f"D5 i(10%) = {i10c:.3f}; i(70%) = {i70c:.3f}; touros com DEP genomica: {g_gen:.2f} kg/ano; "
      f"touros por fenotipo: {g_fen:.2f} kg/ano (sigma_a = 10 kg)")
ne_eq = parentesco.ne_wright(40, 1200)
prop_d = [0.20] * 3 + [0.40 / 37] * 37
nef_d = parentesco.numero_efetivo_pais(prop_d)
ne_d = parentesco.ne_wright(nef_d, 1200)
print(f"D6 40 touros x 1.200 vacas, uso igual: Ne = {ne_eq:.1f}; dF = {pct(parentesco.delta_F(ne_eq), 2)}"
      f"/geracao ({pct(parentesco.delta_F(ne_eq) / 5, 2)}/ano com L = 5)")
print(f"   60% dos bezerros de 3 touros de IA e 40% de 37 touros de repasse: N ef = {nef_d:.2f}; Ne = {ne_d:.1f}; "
      f"dF = {pct(parentesco.delta_F(ne_d), 2)}/geracao ({pct(parentesco.delta_F(ne_d) / 5, 2)}/ano)")
for x, n in ((1020, 1200), (85, 100)):
    print(f"D7 prenhez {x}/{n} = {pct(x / n)}: exato {ic(taxas.ic_exato(x, n))}; Wilson {ic(taxas.ic_wilson(x, n))}")
print(f"   detectar queda de 85% para 80%: {taxas.n_por_grupo(0.85, 0.80)} vacas por ano; poder com 100 = "
      f"{taxas.poder_duas_proporcoes(0.85, 0.80, 100):.2f}; com 1.200 = {taxas.poder_duas_proporcoes(0.85, 0.80, 1200):.2f}")

print()
print("=" * 78)
print("E. Conferencias de ovinos (numeros da verificacao, recalculados no motor)")
print("=" * 78)
print(f"E1 carneiro com 10 filhas ao lado de 10 de outro carneiro local, h2 0,24: REL = "
      f"{blup.rel_exata_modelo_touro([{'X': 10, 'Y': 10}], 0.24)['X']:.4f}")
for nreb, nf in ((5, 8), (10, 4)):
    r_ = blup.rel_exata_modelo_touro([{"X": nf, "Z": 40}] * nreb, 0.30, {"Z": 0.90})["X"]
    print(f"E2 40 filhas em {nreb} rebanhos ({nf} em cada) ao lado de 40 de importado (REL 0,90), h2 0,30: REL = {r_:.4f}")
o2 = indices.indice_femea([25, 15, 20], 0.30, 0.41, 60.0)
print(f"E3 ovelha O2 (3 lactacoes, pai sem EBV, h2 0,30, r 0,41, sigma_P 60 L): EBV = {o2.ebv:+.2f} L; REL = {o2.confiabilidade:.4f}")
print(f"E4 Ne 3 carneiros x 100 ovelhas = {parentesco.ne_wright(3, 100):.2f}; N ef (55/25/15/5%) = "
      f"{parentesco.numero_efetivo_pais([0.55, 0.25, 0.15, 0.05]):.2f}; fertilidade 90% x 95%: "
      f"{taxas.tamanho_amostral_duas_proporcoes(0.90, 0.95):.1f} -> {taxas.n_por_grupo(0.90, 0.95)} ovelhas/ano")
for T in (3.8, 4.1):
    atraso = 14 * T * 0.86
    ab = ganho.absorcao(atraso, T * 0.86, 3.75, 4)
    print(f"E5 tendencia {T} L/ano x r_g 0,86, 14 anos: atraso {atraso:.1f} L; filhas +{atraso / 2:.1f} L; absorcao: "
          + "; ".join(f"ger. {g['geracao']} {g['rebanho']:.1f} L" for g in ab))
```

Saída do bloco E (os blocos A a D estão na seção 8, sem edição):

```
==============================================================================
E. Conferencias de ovinos (numeros da verificacao, recalculados no motor)
==============================================================================
E1 carneiro com 10 filhas ao lado de 10 de outro carneiro local, h2 0,24: REL = 0.1948
E2 40 filhas em 5 rebanhos (8 em cada) ao lado de 40 de importado (REL 0,90), h2 0,30: REL = 0.6803
E2 40 filhas em 10 rebanhos (4 em cada) ao lado de 40 de importado (REL 0,90), h2 0,30: REL = 0.6948
E3 ovelha O2 (3 lactacoes, pai sem EBV, h2 0,30, r 0,41, sigma_P 60 L): EBV = +9.89 L; REL = 0.4945
E4 Ne 3 carneiros x 100 ovelhas = 11.65; N ef (55/25/15/5%) = 2.56; fertilidade 90% x 95%: 434.4 -> 435 ovelhas/ano
E5 tendencia 3.8 L/ano x r_g 0,86, 14 anos: atraso 45.8 L; filhas +22.9 L; absorcao: ger. 1 22.9 L; ger. 2 40.4 L; ger. 3 55.4 L; ger. 4 68.9 L
E5 tendencia 4.1 L/ano x r_g 0,86, 14 anos: atraso 49.4 L; filhas +24.7 L; absorcao: ger. 1 24.7 L; ger. 2 43.6 L; ger. 3 59.7 L; ger. 4 74.4 L
```
