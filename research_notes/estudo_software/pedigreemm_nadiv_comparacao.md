# pedigreemm, nadiv e AGHmatrix comparados com o motor de parentesco do laboratório

Data do estudo: 22/10/2026. Só leitura: nenhum código baixado foi executado e nenhum arquivo existente foi alterado.

## 0. O que foi lido e o que não foi

| Item | Situação |
|---|---|
| Código-fonte | Os três clones (`github.com/cran/<pacote>`, `--depth 1`) deram certo, em `/home/user/estudo_cran/{pedigreemm,nadiv,AGHmatrix}`. Versões: pedigreemm 0.3-5, nadiv 2.18.0, AGHmatrix 3.0.3. |
| Manuais em PDF (Google Drive) | **Não li.** O código-fonte bastou e deixei os PDFs de lado. Todas as afirmações abaixo vêm do código e dos comentários roxygen do próprio repositório. |
| pedigreemm | Li `R/pedigree.R`, `R/AllClass.R`, `src/pedigree.c` e o `ChangeLog`. Não li `man/` nem `data/`. |
| nadiv | Li `R/makeAinv.R`, `R/ggcontrib.R`, `R/numPed.R`, `R/prepPed.R`, `R/genAssign.R`, `R/makeA.R`, `R/makeD.R`, `src/ainv.cc`, `src/diif.cc`, `src/ga.cc` e o início de `src/dij.cc`. De `makeS`, `makeDomEpi`, `makeAA`, `makeM`, `makeDsim`, `prunePed`, `makeDufam` e `makeGGAinv` li só o texto de documentação e o cabeçalho. O corpo do código ficou sem leitura. O pacote não traz pasta de testes. |
| AGHmatrix | Li `R/Gmatrix.R`, `R/Hmatrix.R`, `R/Amatrix.R`, parte de `R/datatreat.R` (`verifyped`) e, em `src/`, `gmatrix_vanraden.cpp`, `gmatrix_su.cpp`, `gmatrix_vitezica.cpp`, `diploid_p0p2_TwoPQ.cpp`, `hmatrix_martini.cpp` e `amatrix_ploidy2.cpp`. Não li Slater, Kerr, Endelman, `Mcheck.R` (imputação) nem o método de Muñoz em C++. |
| Nosso motor | Li `parentesco.py` inteiro, o shim `shim_pedigreemm_nadiv.R` inteiro e só os trechos de `blup.py` e `tests/test_mrode.py` que chamam o parentesco. |

## 1. pedigreemm 0.3-5

Autores e manutenção: Douglas Bates, Ana Vazquez e Paulino Pérez (campo `Author` do DESCRIPTION e `ChangeLog`).

- **`pedigree(sire, dam, label)`** (`R/pedigree.R`).
  - Guarda a **posição** do pai e da mãe em `label`, como inteiros. `NA` e `0` viram `NA` (`labelex <- c(label, NA, 0)`).
  - Pai ou mãe que não esteja em `label` aborta no `stopifnot`. Não há criação automática de fundadores nessa função.
  - A classe S4 (`R/AllClass.R`, `validity`) exige que "the sire and dam must precede the offspring". A ordenação fica por conta do usuário.
  - **`editPed(sire, dam, label)`** acrescenta como fundadores os pais citados sem linha própria. Depois ordena por "número de gerações de ancestrais", calculado por recursão em `getGenAncestors`. Não vi detecção de ciclo: um ciclo recursaria sem fim.
- **`inbreeding(ped)`** → `pedigree_inbreeding` em `src/pedigree.c`.
  - Implementa Sargolzaei e Iwaisaki (2005, Animal Science Journal 76:401), "modified version of the code published in an appendix".
  - Calcula o maior caminho ancestral (LAP) de cada animal, agrupa os ancestrais por LAP e acumula F_i = Σ L_j²·B_j, com B_j = ½ − ¼(F_s + F_d).
  - Usa memória O(n) e **não monta A**.
  - Atalho: se o animal tem os mesmos pais do anterior (`S == sire[i-2] && D == dam[i-2]`), copia o F dele.
  - Pai desconhecido entra com F = −1 (`F[0] = -1`), o truque que faz as fórmulas de D valerem sem casos especiais.
- **`Dmat(ped)`** (`R/pedigree.R`): `1 - 0.25 * (2 + Fsire + Fdam)`, com F = −1 para desconhecido. Isso reproduz as três regras: ambos conhecidos ½ − ¼(F_s+F_d); um conhecido ¾ − ¼F; nenhum 1. É a regra de Henderson com a correção de Quaas para pais endogâmicos.
- **`as(ped, "sparseMatrix")`**: T⁻¹ como `dtCMatrix` triangular unitária inferior, com −½ na coluna de cada pai conhecido (`setAs("pedigree","sparseMatrix")`).
- **`getAInv(ped)`**: `t(T_Inv) %*% diag(1/Dmat(ped)) %*% T_Inv`, ou seja A⁻¹ = T⁻ᵀ D⁻¹ T⁻¹. O código chama `diag()` do R base, que devolve matriz **densa** n×n. Pelo código, a esparsidade se perde no produto (não executei para confirmar).
- **`relfactor(ped, labs)`** e **`getA`**:
  - `relfactor(ped)` (sem `labs`) = `Diagonal(sqrt(Dmat)) %*% solve(t(T_Inv))`, que é D^½ T′ esparso, com A = R′R.
  - Com `labs`, ele monta `crossprod(rect)` (isto é, A completa), recorta para `labs` e chama `chol()` nesse recorte.
  - `getA` = `crossprod(relfactor(ped))`.
  - O fator de Cholesky de A sai de graça da decomposição A = T D T′, sem fatorar nada.
- **`pedigreemm()`**: chama `lmer`/`glmer` e depois, para cada termo aleatório ligado a um pedigree, faz `Zt[rowsi,] <- relfac %*% Zt[rowsi,]`. Com isso o efeito aleatório vira iid N(0, σ²) no espaço transformado, e o otimizador do lme4 (`optimizer="Nelder_Mead"`) estima as variâncias. Em `ranef`, ele devolve os valores genéticos multiplicando de volta pelo fator (`rf[[nm]] %*% dm`). Não resolve as MME de Henderson: usa a reparametrização por Cholesky.
- Observação: `chol,pedigree` (`pedigree_chol`) deixa F como `NA_REAL` para animais sem progênie ("skip if no progeny"). Quem quiser F de todos deve usar `inbreeding()`.

## 2. nadiv 2.18.0

- **Convenção de colunas: `ID, Dam, Sire`** (mãe antes do pai), ao contrário do pedigreemm. Pai desconhecido: `NA`, `0` ou `"*"`.
- **`numPed`** (`R/numPed.R`) valida o pedigree:
  - erro se aparecer mãe ou pai ausente das linhas ("first use the 'prepPed' function");
  - erro para ID duplicado;
  - erro para filho antes dos pais;
  - erro para animal que é seu próprio pai ou mãe;
  - aviso "Dams appearing as Sires - assumed selfing" quando o mesmo ID aparece nas duas colunas;
  - erro se todos os pais forem ausentes.
- **`prepPed`** (`R/prepPed.R`) acrescenta fundadores e ordena por geração, usando `gaUnsort` e `ga` em C++. Detecta laço infinito: "Problem: infinite pedigree loop involving individual …". Aceita o argumento `gender`.
- **`makeAinv(pedigree, f, ggroups, fuzz, gOnTop, det)`** (`R/makeAinv.R`, `src/ainv.cc`, `src/diif.cc`):
  - Calcula F e d_ii com o algoritmo de **Meuwissen e Luo (1992)**, `ml()` em `src/diif.cc`. Tem o atalho de irmãos completos consecutivos e memória O(n).
  - Monta T⁻¹ esparsa, usa `crossprod` só para obter o padrão de não zeros de A⁻¹ e preenche os valores em C++ (`ainvml`), com busca binária (`lower_bound`) nas colunas esparsas.
  - Retorna `Ainv`, `listAinv` (formato linha-coluna-valor), `f`, `logDet` e `dii`.
  - **Grupos de pais desconhecidos** (Quaas 1988):
    - `ggroups` numérico (tipo "A") indica quantas linhas do topo são grupos.
    - Um vetor de nomes únicos (tipo "D") faz o pacote criar as linhas dos grupos.
    - Os grupos entram com f = −1, logo 1+f = 0 e não alteram d_ii; é a mesma regra do nosso `inversa_A_grupos`.
    - Há caso especial quando os dois pais fantasmas são o mesmo grupo (`sj == dj && sj < g`).
    - `gOnTop = FALSE` (padrão) coloca os grupos no fim.
    - Exige que todo pai desconhecido de animal observado tenha grupo.
  - **Grupos difusos** (`makeAinv.fuzzy`, argumento `fuzz`): pais fantasmas com matriz de classificação Q_b (linhas somam 1), H = [−P_b Q_b : T⁻¹], A* = H′D⁻¹H.
  - **`ggcontrib`** devolve Q: a contribuição genética de cada grupo a cada animal (tipos A, D, "R" por vetor de grupo por animal, e "F" difuso).
  - **Metafundadores:** busquei "metafound" e "gamma" no pacote e não encontrei implementação (os "gamma" achados são de REML/ASReml). Não vi metafundadores no nadiv 2.18.0. A NEWS 2.18.0 diz que `makeDiiF()` aceita F de fundadores e cita "phantom parent to all founders to specify an average coefficient of inbreeding", mas isso não é metafundador completo (Legarra 2015).
- **`makeA`** = tcrossprod(solve(D^½ T⁻¹)), usando `dii` de `makeAinv`: sai de A⁻¹, e não o contrário.
- **`makeD(pedigree, parallel, invertD, returnA, det)`** (`R/makeD.R`, `src/dij.cc`):
  - Cada elemento fora da diagonal é o coeficiente de fraternidade d_ij = r_mm′·r_ff′ + r_mf′·r_fm′, com r = A/2 (`xAP = A@x/2`) e pais conhecidos nos dois animais. O cálculo só passa pelos pares com A_ij ≠ 0.
  - **A diagonal é `2 - diag(A)`, isto é, 1 − F_i** (`diag(D) <- 2 - dA`). A documentação diz que a diagonal é corrigida pela endogamia.
  - Os coeficientes de fraternidade seguem sendo aproximações que supõem ausência de endogamia, embora os coancestrais usados já venham de A com endogamia.
  - Há opção de paralelismo com `parallel::pvec`.
- **Demais funções (só documentação lida):**
  - `makeS` / `makeSd`: cromossomos sexuais (Fernando e Grossman 1990), com modelos de compensação de dose.
  - `makeAA`, `makeDomEpi`: epistasia A×A, A×D e D×D por produto de Hadamard.
  - `makeM` / `makeMinv`: matriz de efeitos mutacionais.
  - `makeDsim`: D por simulação iterativa.
  - `makeGGAinv`: A⁻¹ com grupos genéticos.
  - `prunePed`: remove animais não informativos.
  - `geneDrop`: simulação.
  - `founderLine`: linha materna ou paterna.
  - `simPed`: pedigree de meios-irmãos.

## 3. AGHmatrix 3.0.3

Entrada de pedigree: três colunas `ID, sire, dire` (variáveis `sire` e `dire` em `Amatrix.R`; "0" = desconhecido). O foco são diploides e autopoliploides.

- **`Amatrix`**:
  - Diploide: tabular denso em C++ (`buildA_ploidy2_cpp`, `src/amatrix_ploidy2.cpp`). A_ii = 1 + ½·A(d,s) com os dois pais conhecidos e 1 caso contrário; A_ji = ½(A_j,s + A_j,d). É o mesmo algoritmo do nosso `matriz_A`.
  - Poliploide: Kerr et al. (2012) e Slater et al. (2014), com dupla redução `w`.
  - `dominance = TRUE` (só 2x) gera a matriz de dominância `buildDominanceMatrix_cpp`.
  - `verify = TRUE` roda `verifyped`: acusa ID repetido, animal igual ao próprio pai e pai ausente.
  - Tenta ordenar rápido (`datatreat`) e, se falhar, ordena na força bruta (`sortped`); falhando de novo, aborta com "Check for … duplicate IDs, or circular references".
  - Nada de esparsidade: devolve `matrix` densa.
- **`Gmatrix(SNPmatrix, method, missingValue, maf, thresh.missing, ploidy, weights, …)`**:
  - **VanRaden** (`gmatrix_vanraden.cpp`): Z = M − 2p (NA vira 0, isto é, imputação pela média); G = ZZ′ / (2Σp_jq_j). O denominador é `TwoPQ = 2 * dot(p0, p2)` em `diploid_p0p2_TwoPQ.cpp`. Aceita pesos por marcador (`Z W Z′/denom`).
  - **Yang** (`R/Gmatrix.R`): Z = (M − 2p)/√(2pq), G = ZZ′/m, com a diagonal substituída por 1 + Σ(x² − (1+2p)x + 2p²)/(2pq)/m.
  - **Su** e **Vitezica** (`gmatrix_su.cpp`, `gmatrix_vitezica.cpp`): matrizes de dominância; a de Vitezica usa X codificado com −2p², 2pq, −2q², dividido por Σ(2pq)².
  - **Slater**, **Endelman** (poliploides) e `MarkersMatrix`, que conta marcadores válidos por par, usada pelo Muñoz.
  - Filtros: MAF, fração de faltantes (`thresh.missing`), monomórficos, heterozigosidade. Também `verify.posdef` e `ASV` (escala por semivariância média, Feldmann et al. 2022).
- **`Hmatrix(A, G, markers, method, tau, omega, c)`** (`R/Hmatrix.R`, `src/hmatrix_martini.cpp`):
  - **Martini** (Legarra et al. 2009, com τ e ω de Martini 2018): H22 = (τ·G22⁻¹ + (1−ω)·A22⁻¹)⁻¹. Depois soma as correções em blocos: H12 = A12·A22⁻¹·(H22−A22), H11 = A12·A22⁻¹·(H22−A22)·A22⁻¹·A21.
  - **Muñoz**: encolhe G em direção a A por classe de parentesco, com β = 1 − (c + 1/N_marcadores/var_classe).
  - **AGHmatrix devolve H, e não H⁻¹.** Para ssGBLUP, o H⁻¹ costuma ser A⁻¹ mais [[0,0],[0, τG⁻¹ − ωA22⁻¹]]; o pacote não monta isso (não li nenhuma função que o faça).

## 4. Comparação com o nosso motor

Convenções do nosso motor: pedigree `{animal: (pai, mãe)}`, desconhecido = `None, 0, "0", "", "-", "NA"`, F_i = A_ii − 1, A e A⁻¹ **densas** em `numpy`.

| Função nossa | Equivalente | Mesmo algoritmo? | Diferenças de convenção |
|---|---|---|---|
| `ordenar_pedigree` | pedigreemm `editPed`; nadiv `prepPed`/`ga`; AGHmatrix `datatreat`/`sortped` | Não. Nós fazemos busca em profundidade iterativa (ordenação topológica estável, mantém a ordem válida e levanta `ValueError` em ciclo). Os outros ordenam por número de geração. | Os três exigem ou criam o pedigree com pais antes dos filhos. O `editPed` recursa sem proteção contra ciclo, e o nosso é mais seguro. O nadiv entrega a geração de cada animal, o que não devolvemos. |
| `matriz_A` | pedigreemm `getA`; nadiv `makeA`; AGHmatrix `Amatrix` | Mesma regra tabular (AGHmatrix). pedigreemm e nadiv obtêm A de T e D, com A = TDT′, esparsos. | Ordem das colunas de pai e mãe: pedigreemm `sire, dam`; nadiv `ID, Dam, Sire`; AGHmatrix `ID, sire, dire`; nós `(pai, mãe)`. A conta é simétrica, então não muda número algum. |
| `coeficientes_F` | pedigreemm `inbreeding`; nadiv `ml()` (campo `f`) | **Não.** Calculamos F = diag(A) − 1 com a A completa. Eles usam Sargolzaei-Iwaisaki / Meuwissen-Luo, O(n) de memória. | Mesma definição (F = a_ii − 1). Um pai só conhecido dá F = 0 nos quatro. |
| `inversa_A` | pedigreemm `getAInv`; nadiv `makeAinv` | Mesma regra: soma de α_i t_i t_i′ com d_i = ½ − ¼(F_s+F_d), ¾ − ¼F ou 1. O pedigreemm escreve isso como T⁻ᵀD⁻¹T⁻¹ e o nadiv preenche as posições esparsas em C++. | Nosso `inversa_A` chama `matriz_A` só para obter F, ou seja, paga memória O(n²) numa conta que o `ml()` faz em O(n). A saída é densa. pedigreemm devolve `Matrix`; nadiv, `dgCMatrix` com `Dimnames`. |
| `inversa_A_grupos` | nadiv `makeAinv(ggroups=)` e `ggcontrib` | Mesmo A* de Quaas (1988): grupos tratados como pai com 1+F = 0. | nadiv aceita grupos por nome ou por linha, tem `gOnTop` e também grupos difusos (`fuzz`). Nós temos só o grupo rígido, colocado no fim, que é o padrão do nadiv. |
| `parentesco`, `F_acasalamento`, `tabela_F_acasalamentos`, `escolher_reprodutores` | Nenhum dos três pacotes traz equivalente | – | Eles não têm planejamento de acasalamento. Ao menos nos arquivos que li, não existe. |
| `ne_wright`, `delta_F`, `F_acumulado`, `numero_efetivo_pais` | Não encontrei equivalente nos arquivos lidos | – | `geneDrop` e `simPed` (nadiv) simulam pedigrees, mas não li o código. |
| (não temos) matriz de dominância | nadiv `makeD`; AGHmatrix `Amatrix(dominance=TRUE)` | – | Ver o achado do shim abaixo. |
| (não temos) G e H | AGHmatrix `Gmatrix`, `Hmatrix` | – | Ver seção 5. |

### Achado sobre o shim (`shim_pedigreemm_nadiv.R`)

1. **`makeD` do shim usa d_ii = 1.** O nadiv real usa **1 − F_i** (`diag(D) <- 2 - dA` em `R/makeD.R`). Os termos fora da diagonal coincidem: ¼(a_ss′·a_dd′ + a_sd′·a_ds′) é o mesmo que r_mm′·r_ff′ + r_mf′·r_fm′ com r = A/2. Em pedigree sem endogamia a diferença é zero. Em pedigree endogâmico o `Dinv` do shim **não** é o do nadiv. O comentário do shim ("a aproximação sem endogamia que o nadiv documenta") descreve só os termos fora da diagonal. Não verifiquei se algum script de Mrode que usa `makeD` tem pedigree endogâmico; vale conferir antes de citar o shim como equivalente do nadiv nesse ponto.
2. O resto do shim confere com o código lido: A⁻¹ = T⁻ᵀD⁻¹T⁻¹ com d_i = 1 − ¼Σ(1+F_p) é exatamente `Dmat` + `getAInv` do pedigreemm; grupos com 1+F = 0 é o `f = -1` do nadiv; `gOnTop = FALSE` é o padrão do nadiv.
3. O shim usa `diag(1/td$d, n)` (matriz densa), como o pedigreemm. Não há problema para os exemplos pequenos de Mrode.

## 5. Melhorias possíveis, da mais para a menos útil num rebanho de 100 a 5.000 animais

1. **Calcular F sem montar A (memória O(n)).** Hoje `inversa_A` chama `matriz_A` só para pegar `diag(A) − 1`. Com 5.000 animais, A densa tem 5.000² × 8 B = 200 MB por cópia. Base: `ml()` em nadiv `src/diif.cc` (Meuwissen e Luo 1992: sobe pelos ancestrais acumulando L_j²·d_jj, com o atalho "mesmos pais do animal anterior") ou `pedigree_inbreeding` em pedigreemm `src/pedigree.c` (Sargolzaei e Iwaisaki 2005). Reimplementar a partir dos artigos, com palavras e estrutura próprias.
2. **Validação de entrada mais completa.** Hoje, pai citado sem linha vira fundador em silêncio, ciclo dá `ValueError` e ID repetido some quando o dicionário é montado (a última linha vence). Sugestões, com base em nadiv `numPed`, `prepPed` e AGHmatrix `verifyped`: (a) devolver a lista de fundadores criados automaticamente; (b) acusar ID duplicado no leitor, antes de virar dicionário; (c) avisar quando o mesmo ID aparece como pai e como mãe ("Dams appearing as Sires", em `numPed`); (d) tratar animal igual ao próprio pai com mensagem própria (hoje cai na mensagem de ciclo); (e) opcionalmente, checar sexo se o cadastro tiver.
3. **A⁻¹ esparsa.** O laço de `inversa_A` já é O(n); o custo é guardar n² números. Montar T⁻¹ (−½ por pai conhecido) e D⁻¹ esparsos, como em pedigreemm `setAs("pedigree","sparseMatrix")` + `Dmat` + `getAInv` ou nadiv `makeAinv`, exige `scipy.sparse`. Atenção: `blup.py` usa `np.linalg.inv(LHS)` para a matriz de covariância dos erros de predição, e a inversa de uma esparsa costuma ser densa. O ganho é maior em resolver as MME (`spsolve`, Cholesky) do que em obter a acurácia de todos. Conferir se `scipy` é dependência aceitável do projeto antes (não verifiquei).
4. **Podar o pedigree antes de montar A⁻¹** (nadiv `prunePed`, `R/prunePed.R`: remove animais que não têm fenótipo nem descendente com fenótipo). Li só a descrição ("often mixed effect models run much faster when extraneous information is removed"), e não o código. Reduz n quando o cadastro guarda muitas gerações antigas. Cuidado: a poda altera F e A⁻¹ se não preservar os ancestrais que ligam os animais com dado, então é preciso manter o fechamento ancestral dos informativos.
5. **Corrigir o shim: diagonal de D = 1 − F** (nadiv `makeD`, `diag(D) <- 2 - dA`). Não é melhoria do motor, mas é divergência comprovada, e vale se um dia o motor ganhar dominância.
6. **Matriz G e H (genômica).** AGHmatrix: `Gmatrix` VanRaden (`gmatrix_vanraden.cpp`: Z = M − 2p, G = ZZ′/Σ2pq) e `Hmatrix` Martini (`hmatrix_martini.cpp`: H22 = (τG22⁻¹ + (1−ω)A22⁻¹)⁻¹). Para 100 a 5.000 genotipados, G densa é viável. Só valeria se o produto passar a receber genótipos. Se for implementar, o que serve ao BLUP é **H⁻¹**, que o AGHmatrix não calcula.
7. **Grupos difusos e pais fantasmas** (nadiv `makeAinv.fuzzy`, `makeAstarMult`, `R/makeAinv.R`). Úteis quando a origem do animal comprado é incerta (por exemplo, 70% de um grupo e 30% de outro). Hoje só aceitamos grupo rígido. Baixa prioridade para rebanho pequeno.
8. **Número de geração de cada animal e fator de A esparso** (nadiv `genAssign`/`ga`; pedigreemm `relfactor`). O primeiro rende um relatório de profundidade do pedigree (um bom indicador de qualidade do cadastro). O segundo, T·D^½, permite simular valores genéticos ou reparametrizar um modelo com efeito aleatório iid, como o `pedigreemm()` faz com `Zt <- relfac %*% Zt`. Útil só se o motor passar a estimar componentes de variância; hoje `blup.py` recebe σ² como dado.

Não incluí metafundadores: não achei nos três pacotes.

## 6. Licença

| Pacote | Campo `License` (DESCRIPTION) |
|---|---|
| pedigreemm | GPL (>= 2) |
| nadiv | GPL (>= 2) |
| AGHmatrix | GPL-3 |

Os três são GPL (copyleft). Ler os algoritmos e reimplementá-los a partir dos artigos (Henderson 1976, Quaas 1976 e 1988, Meuwissen e Luo 1992, Sargolzaei e Iwaisaki 2005, VanRaden 2008, Legarra 2009), com código e palavras próprias, não obriga a abrir o nosso código, mas **copiar trechos de código GPL para dentro do SeabraApp, sim**. Isto não é conselho jurídico: confirmar com quem entende de licenças antes de decidir.
