# BLUPF90: guia de tradução dos arquivos `.par` (e dos exemplos de Mrode) para o motor do laboratório

Data do estudo: 22/10/2026. Estudo por leitura: não há binários do BLUPF90 neste ambiente, e nada foi rodado com eles. Nenhum arquivo existente foi alterado; este é o único arquivo novo.

Convenção de citação. "man." é `manual_blupf90_all.pdf` (Misztal et al., edição de 5/8/2026), com a **página impressa**. "tut." é `manual_tutorial_blupf90.pdf` (Masuda, v1.1.0, abril/2025), com a página impressa. "legado" é `manual_blupf90_legacy.pdf`, "REMLF90" é `manual_remlf90.pdf`, "genômico" é `manual_example_genomic.pdf`, "Misztal 1999" é `CCB99_bul20_5.pdf`, "Misztal 2008" é `reliable_computing_variance_components.pdf` (J. Anim. Breed. Genet. 125:363–370) e "Legarra et al." é `single_step_8.pdf`. Quando a informação não está nos documentos fornecidos, o texto diz "não encontrei".

---

## 0. O que foi lido, o que foi conferido por conta própria e o que ficou de fora

### 0.1 Material lido

A pasta `blupf90` do Drive (id `1bpLGnb1WbnbguvcuHnqcmg1spP9Kra78`) tem 16 arquivos em 2 páginas de listagem.

| Arquivo | Situação |
|---|---|
| `manual_blupf90_all.pdf` | Lido, da introdução (p.4) às referências. A extração perdeu os glifos matemáticos (fórmulas saem como "ð", "Þ" etc.). Só usei fórmula quando o texto ao redor, o tutorial ou o log do `manual_example_genomic.pdf` confirmam. |
| `manual_tutorial_blupf90.pdf` | O conector truncou o texto em §6.20 (p.139). Baixei o PDF (1.131.768 bytes, o mesmo tamanho do metadado do Drive) e extraí com `pdftotext`. **Li**: §1.3, §4.2, §4.5, §5.1, §5.2.2–5.2.5, §6.1–6.11, §6.21–6.23, §7.1–7.4 (início), §8.3, §8.4.1–8.4.2. **Não li**: cap. 3; §4.1, 4.3, 4.4, 4.6; §5.2.6–5.4; §6.12–6.20 (interação social, regressão fixa e aleatória, QTL, efeitos de SNP, GBLUP com arquivo); §6.24–6.25 (limiar); §8.1–8.2 e §8.4.3–8.5. |
| `manual_remlf90.pdf`, `manual_blupf90_legacy.pdf`, `manual_example_genomic.pdf`, `BGF90_WCGALP_28-07.pdf`, `reliable_computing_variance_components.pdf`, `manual_fspak.pdf`, `manual_sparse90.pdf`, `manual_denseop.pdf` | Lidos por inteiro. O fim do `manual_example_genomic.pdf` ("Estimates of variance components") veio sem conteúdo. |
| `manual_imisztal_philosophy.pdf` e `CCB99_bul20_5.pdf` | Lidos. **O texto dos dois é idêntico** (Misztal 1999, Interbull Bull. 20:33–42). |
| `single_step_8.pdf` | Lido por inteiro, mas **sem nenhuma equação**: a extração só trouxe o texto. As fórmulas de H⁻¹ vêm do manual, do tutorial e do log do `manual_example_genomic.pdf`. |
| `condition_of_use.txt`, `wiki_condition_of_use.html`, `wiki_start.html` | Lidos. O `.txt` foi baixado em bytes (369 B, igual ao metadado) e está transcrito na §4. |

Exemplos do livro (`/home/user/mrodesbook/examples_blupf90/`): li os `.par` dos capítulos 4, 5, 6, 8, 12 e 13 (todos os que existem), o começo dos `.dat`/`.ped`/`.gen`/`.xrf` e o `README.md`. Em `Chapter_06` há `mr65.dat` e `mr65.ped` **sem `.par`**. Scripts R (`examples_r/Content/`): li `Chapter_04_1/2/3`, `Chapter_05_1/2`, `Chapter_06`, `Chapter_08`, `Chapter_12_1/2`, `APY_fja`, `Chapter_13_1/2`, `Chapter_17` (trecho) e `Chapter_18` (trecho). Motor: README, `blup.py` inteiro, `parentesco.py` (A, A⁻¹, A*), cabeçalho e lista de testes de `tests/test_mrode.py`.

### 0.2 Conferências próprias (reprodutíveis)

Todas são scripts descartáveis na pasta de rascunho `/tmp/claude-0/-home-user-sistemas-seabra-web/2f601efb-0b7e-558e-b507-febc0682ae9c/scratchpad/chk/` (`parinterp.py`, `chkpar_run.py`, `chk44.py`, `chk13.py`). Não estão no repositório. Rodei também uma linha de R minha (`set.seed(12345); sample(1:14, 4)`) e a suíte de testes do motor.

| Conferência | Resultado |
|---|---|
| Interpretador mínimo de `.par` univariado (semântica do man. p.8–15 e tut. p.100) que monta as MME a partir de `.par`+`.dat`+`.ped` e compara com a transcrição numpy do script R do mesmo exemplo | `mr41`, `mr41a`, `mr43`, `mr43a`, `mr51`, `mr52`, `mr81` e `mr131` montam **as mesmas MME** que o script R (diferença máxima de 2×10⁻¹³ nos sete primeiros; 9×10⁻⁹ em `mr131`, limitada pelos 8 algarismos do arquivo `.dom`). Ver §2.3. |
| Modelo de touro (`mr42a.par`) com A_s entre os touros | Reproduz os 8 algarismos do `solutions` impresso no tut. p.99 (Listagem 6.6): sexo 4,33567107 e 3,3819857; touros 1, 3 e 4 = 0,0220022, 0,0140264 e −0,0430418. |
| Grupos de pais desconhecidos (`mr44.par`, grupo 9 zerado) | Reproduz a Listagem 6.11 do tut. p.104 (sexo 5,45807 e 4,31342; grupo 10 = −1,76875) e coincide com `modelo_animal(grupos_geneticos=[9,10])` do motor. |
| `D⁻¹` e matrizes lidas de arquivo (cap. 13) | `mr131.dom` = D⁻¹ de Cockerham (diferença 5×10⁻⁹); `mr132.apd` = (90A + 80D)⁻¹ (5×10⁻¹⁰); `mr133.Di` = (D_genômica + 0,01I)⁻¹ (5×10⁻⁸); `mr135.Gaai` = (G_AA + 0,01I)⁻¹ (5×10⁻¹⁰). `mr133/4/5.gen` são idênticos entre si e a `ped_snp.txt` do script R. |
| Motor contra o `solutions` e o s.e. impressos no tutorial | Ex. 4.1: EBV e efeitos de sexo iguais aos da Listagem 6.2 (tut. p.96) nas 3 casas que comparei; PEV do animal 1 = 18,84 e REL = 0,058, como no tut. p.98. Ex. 6.1: √PEV do animal 1 = 4,31332061 e 5,9918099, iguais aos 4,313320612 e 5,991809902 do tut. p.109. |
| Suíte do motor (`python3 -B -m unittest discover -s tests`) | 142 testes, todos passam. O README fala em 128: a diferença vem dos testes de `test_lactacao.py` que já estavam modificados e não commitados antes deste estudo. |

Um deslize meu: rodei `git status --short` uma vez, antes de reler a instrução de não rodar git. É só leitura e mostrou `lactacao.py` e `test_lactacao.py` modificados, mudanças que não são minhas.

### 0.3 O que ficou de fora

APY, metafundadores, as opções `apy`, `no_tunedG_first` e `saveGInverseOrig`, e o algoritmo de A_s⁻¹ do `add_sire` **não estão descritos** em nenhum documento fornecido (ver §6). A página "undocumented options" do wiki, citada em `wiki_start.html`, não está no Drive.

---

## 1. Anatomia de um arquivo `.par`

### 1.1 Dois arquivos de parâmetros, com sintaxes diferentes

O man. p.8 e p.16 avisa: o `.par` dos programas de aplicação (BLUPF90+, GIBBSF90+, POSTGSF90 etc.) **não** é o do RENUMF90.

- **RENUMF90** lê dados e pedigree com identificadores livres (alfanuméricos), renumera tudo de 1 a n, poda o pedigree e **gera** `renf90.par`, `renf90.dat` e `renaddNN.ped` (man. p.20).
- **BLUPF90+** lê o `renf90.par` (ou um `.par` escrito à mão, como os de Mrode, que já trazem os arquivos numerados).

### 1.2 Os blocos do `.par` de aplicação e o que cada um define em y = Xb + Zu + e

| Bloco | O que se escreve | O que define no modelo | Fonte |
|---|---|---|---|
| `DATAFILE` | nome do arquivo de dados, formato livre, campos separados por espaço | Cada linha é um registro. Sem cabeçalho, sem TAB, e `#` não pode aparecer nos dados. **0 é valor ausente** em todos os efeitos e covariáveis. | man. p.8, 9, 15 |
| `NUMBER_OF_TRAITS` | t | y tem t características por animal. As equações são ordenadas por animal (as t características do mesmo animal ficam juntas). | man. p.8; tut. p.108 |
| `NUMBER_OF_EFFECTS` | nº de linhas em `EFFECTS`, "except for residual" | Conta todos os blocos de colunas de X e de Z. | man. p.8 |
| `OBSERVATION(S)` | uma posição por característica | O vetor y. | man. p.8 |
| `WEIGHT(S)` | posição do peso (pode ficar em branco) | A variância residual do registro vira R/peso, isto é, o programa multiplica R⁻¹ pelo peso (tut. p.100). Os pesos 0,8 do modelo animal reduzido (Ex. 4.3) mostram o uso. A frase do man. p.8 ("blank means that the weight is in column 2") é ambígua na extração; o exemplo do próprio manual usa `WEIGHTS 2`, e `mr43.par` usa `WEIGHT(S) 8`. O legado diz "blank if all weights equal". | man. p.8; legado; tut. p.100 |
| `EFFECTS:` | uma linha por efeito: `posições  níveis  tipo  [aninhado]` | Cada linha é um **bloco de colunas**, de X (efeito fixo) ou de Z (se o efeito entra em um `RANDOM_GROUP`). Detalhes abaixo. | man. p.9–10 |
| `RANDOM_RESIDUAL VALUES` | R (matriz t×t cheia; escalar se t = 1) | var(e) = I ⊗ R. Com característica ausente, o programa usa o sub-bloco de R das características medidas (tut. §6.8.1, p.109). | man. p.8; legado |
| `RANDOM_GROUP` | números dos efeitos (na ordem de `EFFECTS`) que formam **um** grupo; correlacionados têm de ser consecutivos | Diz quais blocos de colunas são aleatórios e, entre eles, correlacionados (direto e materno; coeficientes de regressão aleatória). | man. p.11–12; legado |
| `RANDOM_TYPE` | `diagonal`, `add_animal`, `add_sire`, `add_an_upg`, `add_an_upginb`, `user_file`, `user_file_inv`, `par_domin`, `add_an_self` | A estrutura M de var(u) = G ⊗ M (§1.3). | man. p.8, 11, 13–14 |
| `FILE` | arquivo de pedigree ou matriz; **linha em branco** se não há (`diagonal`) | A fonte de M. | man. p.11 |
| `(CO)VARIANCES` | G (cheia; escalar se um efeito e uma característica) | σ²u, ou G₀ no caso de efeitos correlacionados ou várias características. | man. p.11–12 |
| `OPTION ...` | no fim do arquivo | Escolhe solver, genômica, acurácia, estimação de variâncias etc. (§1.7). | man. p.26–58 |

**Linha de `EFFECTS:`, campo a campo** (man. p.9–10; tut. p.100–101, 110–112):

- **posições**: t posições, uma por característica. `0` significa que o efeito **não existe** na característica. Duas posições diferentes na mesma linha (`4 5 2 cross`) definem fatores diferentes por característica; o nº de níveis é o máximo entre eles.
- **níveis**: inteiros consecutivos a partir de 1; para `cross`, o valor do dado é o nível, e **nível 0 = registro fora do efeito** (a linha de X fica zerada para o efeito).
- **`cross`**: efeito classificatório, uma coluna de X por nível, com 1 onde o registro cai.
- **`cov`**: covariável real. Sem aninhamento tem 1 nível (uma regressão, "6 1 cov"). Com aninhamento (`6 50 cov 1`), o coeficiente é **por nível** do efeito na posição 1 (inclinação dentro de nível).
- **Truque de bloco** (tut. §6.3.2, p.100–101): `cov` com 0 níveis e aninhada somam o seu valor na **mesma** coluna do próximo efeito que tem níveis. É assim que Mrode escreve o modelo animal reduzido (W com 0,5 e 0,5 para pai e mãe) e a regressão aleatória.
- **Efeito repetido**: o mesmo número de coluna pode aparecer em dois efeitos (animal aditivo e ambiente permanente), cada um com a sua covariância (tut. §6.5.2, p.105).

### 1.3 Tipos de efeito aleatório e arquivos de pedigree

| `RANDOM_TYPE` | Arquivo (`FILE`) | M em var(u) = G ⊗ M | Fonte |
|---|---|---|---|
| `diagonal` | nenhum | M = I (ambiente permanente, ambiente comum, rebanho×touro) | man. p.11 |
| `add_animal` | `animal sire dam`, 0 = desconhecido | M = A | man. p.13 |
| `add_sire` | `sire  sire's sire  sire's MGS` | A entre touros, pelo pedigree do modelo de touro | man. p.13; tut. p.98 |
| `add_an_upg` | `animal sire/grupo dam/grupo código`, código = 3 − nº de pais conhecidos (1, 2 ou 3); o código de grupo tem de ser maior que o último ID real | A* de Quaas (grupos de pais desconhecidos) | man. p.13; tut. p.102–103 |
| `add_an_upginb` | igual, com código = 4000 / [(1+m_s)(1−F_s) + (1+m_d)(1−F_d)] (m = 0 se o pai é conhecido, 1 se não) | A* **com endogamia**. Valores do tutorial: 1000, 1333, 2000 e 2133. | man. p.13; tut. p.65 |
| `user_file` | `linha coluna valor`, triangular | M⁻¹ é o **arquivo**: ele deve conter a **inversa** da matriz (G⁻¹ para genômica) | man. p.13 |
| `user_file_inv` (no legado: `user_file_i`) | idem | o programa inverte o arquivo | man. p.14; legado |
| `par_domin` | 10 colunas de subclasses parentais, código 0–255 | só calcula F⁻¹ das subclasses (não dá a D⁻¹ individual) | man. p.14; tut. p.143–144 |
| `add_an_self` | animal, pai, mãe e nº de gerações de autofecundação | (plantas) | man. p.14 |

Duas observações minhas (derivação conferida contra os valores impressos no tutorial):

- O código do `add_an_upginb` é **1000/dᵢ**, onde dᵢ é o fator de Quaas já usado pelo motor (½ − ¼(F_s+F_d); ¾ − ¼F_pai; 1). Com pais não endogâmicos dá 2000, 1333 e 1000; com um pai de F = 0,125 dá 2133 (tut. p.65). Ou seja, `inversa_A` do motor = A⁻¹ do `add_an_upginb`.
- Nomes divergentes entre documentos: o man. p.8 lista `par_domin` e o exemplo da p.78 escreve `par_dom`; o legado usa `user_file_i`, o manual atual `user_file_inv`. O legado (Apêndice A) rotula o pedigree do `add_an_upg` como "animal/dam/sire/code", enquanto o texto do mesmo documento e o manual dizem `animal, sire, dam`. Seguir o manual.

### 1.4 O sistema que o BLUPF90 monta

Para um modelo com efeitos fixos e aleatórios independentes ou correlacionados (tut. §6.4.2 p.102; §6.7.1 p.108):

```
[ X'R⁻¹X   X'R⁻¹Z             ] [ b̂ ]   [ X'R⁻¹y ]
[ Z'R⁻¹X   Z'R⁻¹Z + G⁻¹ ⊗ M⁻¹ ] [ û ] = [ Z'R⁻¹y ]        R = I ⊗ R₀ ;  R_i = R₀/peso_i
```

O Apêndice H do legado mostra o núcleo do programa: para cada registro, lê a linha, descobre os endereços das equações, calcula R⁻¹ (com a característica ausente tratada) e soma `peso·R⁻¹` na posição (i,j) de uma matriz esparsa (hash); depois soma, por tipo (`g_diag`, `g_A`, `g_A_UPG`, `g_A_UPG_INB`, `g_As`, `g_PD`), a contribuição dos efeitos aleatórios, e só então resolve. É exatamente o que `blup.montar_mme` faz em versão densa.

Como o sistema costuma ter posto deficiente (média + sexo, GC + paridade, grupos), o programa **detecta a dependência linear e impõe restrição sozinho**, escolhendo uma coluna qualquer (tut. §6.4.4 p.104; §6.5.3 p.106). As soluções individuais, portanto, não são únicas: o tutorial manda comparar **contrastes** (por exemplo u₁ − u₂ = 0,156 no Ex. 4.4). Para impor a restrição de propósito, troque o código do nível por 0 no arquivo de dados (tut. §6.5.4 p.106). É o que os arquivos de Mrode fazem em `mr51.dat` (HYS 1 e 3 = 0), `mr81.dat` (rebanho 1 = 0) e `mr44.ped` (grupo 9 = 0).

### 1.5 Armadilhas de leitura e de escrita do `.par`

- Palavras-chave **exatas**, até 20 caracteres (man. p.9). Erro de grafia pode não parar o programa, e arquivo com nome errado que já existe **também não para** (man. p.15). "Um bom resultado não significa que o `.par` está certo" (man. p.15).
- Separador é espaço (sem TAB); falta de uma linha vazia no fim pode dar problema (man. p.15); arquivos do Windows precisam de `dos2unix` (man. p.15).
- `(CO)VARIANCES` omitido no RENUMF90 vale **1,0** em silêncio (tut. p.47, nota de rodapé).
- `OPTION sol se` **muda o solver para FSPAK** (man. p.26). O `s.e.` que sai no `solutions` é √(diag C) com as variâncias **explícitas**, ou seja, √PEV (o SEP do livro, tut. §6.1.3 p.96). Com a forma de razão (`mr41a.par`, resíduo 1,0 e σ²a = 0,5), é √dᵢ e precisa ser multiplicado por σ²e (tut. p.97–98).
- Com `add_an_upg`, o `s.e.` do `solutions` **não é um PEV utilizável** (é a combinação BLUE+BLUP, tut. p.104). Para o PEV do EBV, rode o modelo sem grupos.
- `RANDOM_GROUP` do modelo animal reduzido lista só o efeito do último bloco (`RANDOM_GROUP 4` em `mr43.par`), apesar de haver 4 efeitos; os efeitos `cov` de 0 níveis pertencem ao bloco (tut. p.100).
- Os `.par` de Mrode usam a grafia `RANDOM_RESIDUAL VALUES` (com espaço), a mesma do `renf90.par` que o RENUMF90 gera (man. p.24).

### 1.6 O `.par` do RENUMF90 (o que ele acrescenta ao modelo)

Ordem obrigatória (man. p.16–17; tut. §4.5.6 p.65–66): os 7 primeiros são `DATAFILE`, `TRAITS`, `FIELDS_PASSED TO OUTPUT`, `WEIGHT(S)`, `RESIDUAL_VARIANCE`, `EFFECT`; os demais são opcionais e só valem na ordem `NESTED`, `RANDOM`, `OPTIONAL`, `FILE`, `FILE_POS`, `SNP_FILE`, `PED_DEPTH`, `GEN_INT`, `REC_SEX`, `UPG_TYPE`, `INBREEDING`, `RANDOM_REGRESSION`, `RR_POSITION`, `(CO)VARIANCES`, `(CO)VARIANCES_PE`, `(CO)VARIANCES_MPE`, `OPTION`.

| Palavra-chave | O que faz | Fonte |
|---|---|---|
| `TRAITS`, `WEIGHT(S)`, `RESIDUAL_VARIANCE` | posições (nos dados brutos) das observações e do peso; matriz R | man. p.16 |
| `FIELDS_PASSED TO OUTPUT` | colunas que passam sem renumerar (ex.: ID original) | man. p.16 |
| `EFFECT e1 ... tipo forma` | tipo `cross` ou `cov`; forma `alpha` (texto) ou `numer` (só para `cross`). `NESTED` indica a covariável aninhada. | man. p.16–17 |
| `RANDOM` | `diagonal`, `sire` ou `animal`. `OPTIONAL pe mat mpe` acrescenta ambiente permanente, genético materno e ambiente permanente materno; cada um exige a sua matriz em `(CO)VARIANCES`, `_PE` e `_MPE`. | man. p.17; tut. §4.5.3 p.61–62 |
| `FILE`, `FILE_POS` | pedigree bruto; posições de animal, pai, mãe, mãe alternativa (receptora) e ano de nascimento (padrão `1 2 3 0 0`) | man. p.17 |
| `PED_DEPTH p` | gerações de ancestrais mantidas a partir dos animais com dado ou genótipo. **Padrão 3**; 0 mantém todos. | man. p.17; tut. §4.5.2 p.61 |
| `GEN_INT min med max` | intervalo de gerações; mínimo e máximo servem de checagem do pedigree, a média prevê o ano de nascimento de pai ausente | man. p.17 |
| `REC_SEX` | sexo que tem registros (checagem do pedigree) | man. p.17 |
| `UPG_TYPE` | `yob` (por ano de nascimento), `in_pedigrees` (ID negativo = grupo), `group`, `group_unisex`, `internal` | man. p.17; tut. §4.5.4 p.62–63 |
| `INBREEDING` | `pedigree` (Meuwissen e Luo 1992), `file`, `self x`, `no-inbreeding`. O man. p.18 diz que, a partir da versão 1.157, **a endogamia é calculada por padrão**; o tut. §4.5.5 p.64 (de abril/2025) diz que o padrão gera A⁻¹ **sem** endogamia e que é preciso usar `INBREEDING`. **Os dois textos se contradizem**; para casar com o motor, use `add_an_upginb`. | man. p.18; tut. p.64 |
| `COMBINE` | cria interação juntando campos (deve ser a 1ª palavra) | man. p.18 |
| Saídas | `renf90.par`, `renf90.dat`, `renaddNN.ped` (10 colunas: animal, pai/UPG, mãe/UPG, código 3−nº de pais ou código de endogamia, ano, nº de pais conhecidos, nº de registros, nº de filhos como pai e como mãe, ID original), `renf90.inb`, `renf90.tables`, `renf90.fields`, `*_XrefID` | man. p.20 |
| Ordem da renumeração | animais com registro recebem os números menores; os que só aparecem no pedigree, os maiores. Não há ordenação cronológica. | tut. p.51 |

### 1.7 Opções que importam para o motor (BLUPF90+ e família)

| Opção | Efeito (padrão) | Fonte |
|---|---|---|
| `solv_method FSPAK`, `SOR` ou `PCG` | PCG é o padrão e costuma ser o mais rápido; SOR gasta menos memória e converge mais devagar; FSPAK é o mais exato e o que mais gasta memória | man. p.26 |
| `conv_crit` (1e-12), `maxrounds` (5000), `r_factor` (SOR, padrão 1,4, faixa [0,2]) | convergência dos solvers iterativos | man. p.26 |
| `blksize n` (1) | bloco do pré-condicionador; "extremamente importante" em multicaracterística (use o nº de características) | man. p.26 |
| `sol se` | grava solução e erro-padrão; força FSPAK | man. p.26 |
| `store_accuracy eff [orig]` | grava a **confiabilidade** em `acc_bf90`: 1 − PEV/[σ²u(1+F)], com F vindo de A⁻¹ ou H⁻¹ por padrão (texto do manual cita Aguilar et al. 2020) | man. p.28 |
| `acctype 1.0` ou `0.5` | 1,0 = confiabilidade; 0,5 = "BIF accuracy" (texto do manual). O tut. §7.3.3 p.159 define o resultado como (R²)ˣ, logo √REL (a correlação), **não** a acurácia BIF. Ver §3.5. | man. p.28; tut. p.159 |
| `missing -999` | valor ausente (padrão 0) | man. p.26 |
| `method VCE`, `EM-REML n`, `EM-REML AI`, `no_accelerate_EM`, `constant_var`, `set_eig`, `se_covar_function` | estimação de variâncias (§3.2) | man. p.36–39 |
| `hetres_int col n`, `hetres_var`, `hetres_pos`, `hetres_pol` | variância residual heterogênea por classe ou por covariável | man. p.27, 38 |
| `SNP_file`, `AlphaBeta`, `GammaDelta`, `TauOmega`, `tunedG`, `whichG`, `omit_ainv` etc. | genômica (§3.4) | man. p.27, 49–58 |

### 1.8 Um `.par` lido linha a linha

`mr51.par` (Ex. 5.1, repetibilidade) e o modelo que ele define:

```
OBSERVATION(S) 6                   y = produção de gordura (coluna 6)
EFFECTS:
5 4 cross                          HYS (coluna 5; níveis 1..4; níveis 1 e 3 vieram codificados 0 nos dados)
4 2 cross                          paridade (coluna 4; 2 níveis)
1 8 cross                          animal, efeito aditivo (coluna 1, 8 níveis)
1 8 cross                          animal, ambiente permanente (a MESMA coluna, outro efeito)
RANDOM_RESIDUAL VALUES 28.0        σ²e = 28
RANDOM_GROUP 3  / add_animal / mr51.ped / (CO)VARIANCES 20.0     a ~ N(0, A·20)
RANDOM_GROUP 4  / diagonal  /  (sem arquivo) / (CO)VARIANCES 12.0    p ~ N(0, I·12)
```

Ou seja, y = HYS + paridade + a + p + e, com b = (HYS, paridade), u = (a, p), G⁻¹ ⊗ M⁻¹ = diag(A⁻¹/20, I/12) e R⁻¹ = I/28.

---

## 2. Tabela de tradução: exemplos de Mrode (cap. 4, 5, 6, 8, 12 e 13)

Numeração do livro (4ª ed.) inferida do nome do arquivo (`mrNM`) e dos comentários dos scripts R. Sempre que digo "par ≡ R", é a conferência da §0.2 (as mesmas MME) ou, quando indicado, só a conferência por leitura.

### 2.1 Resumo

| Exemplo | `.par` | Script R | Modelo | Função do motor | par ≡ R? |
|---|---|---|---|---|---|
| 4.1 modelo animal | `mr41`, `mr41a` | `Chapter_04_1.R` | y = sexo + a + e | `blup.modelo_animal` | **sim** (numérico) |
| 4.2 modelo de touro | `mr42`, `mr42a` | `Chapter_04_1.R` (parte 2) | y = sexo + s + e* | `modelo_touro` **só com A_s = I** | sim por leitura; A_s conferido contra o tutorial |
| 4.3 animal reduzido | `mr43`, `mr43a` | `Chapter_04_2.R` | y = Xb + W·a_pais + e*, pesos | não existe (o modelo completo dá as mesmas soluções) | **sim** (numérico) |
| 4.4 grupos de pais desconhecidos | `mr44`, `mr44a` | `Chapter_04_3.R` | y = Xb + ZQg + Za + e | `modelo_animal(grupos_geneticos=...)` | sim (contra o tutorial e o motor); **inconsistência de código em `mr44.ped`** |
| 5.1 repetibilidade | `mr51` | `Chapter_05_1.R` | y = HYS + paridade + a + p + e | `modelo_animal(sigma2_pe=...)` | **sim** (numérico) |
| 5.2 ambiente comum | `mr52` | `Chapter_05_2.R` | y = sexo + a + c(mãe) + e | `modelo_animal(rotulos_pe=...)` | **sim** (numérico) |
| 6.1 multicaracterística | `mr61`, `mr61uni` | `Chapter_06.R` | 2 características, G₀ ⊗ A, R₀ | `modelo_multicaracteristica` | sim por leitura; motor confere com o tutorial |
| 6.2 registros ausentes | `mr62`, `mr62uni` | **não há** | idem, com y₂ ausente | `modelo_multicaracteristica` (aceita `NaN`) | sem script R |
| 6.3 efeitos diferentes por característica | `mr63`, `mr63a`, `mr63uni` | **não há** | HYS₁ para y₁, HYS₂ para y₂ | **não existe** (um único fator de GC por registro) | sem script R |
| 6.4 sem covariância residual | `mr64` | **não há** | R₀ diagonal, uma característica por animal | `modelo_multicaracteristica` com R₀ diagonal | sem script R |
| 8.1 materno | `mr81` | `Chapter_08.R` | y = herd + pen + a + m + p_m + e | `modelo_direto_materno` | **sim** (numérico) |
| 8.2 materno reduzido | `mr82` | **não há** | RAM com efeito materno | não existe | sem script R |
| 12.1 ssGBLUP | `mr121` | `Chapter_12_1.R` | y(DYD) = μ + u + e, u ~ N(0, Hσ²u) | **não existe** (sem G, sem H⁻¹) | sim por leitura; opção `no_tunedG_first` não documentada |
| 12.2 APY | `mr122` | `Chapter_12_2.R` | ssGBLUP+APY (par) contra GBLUP+APY (R) | **não existe** | **não: modelo e dados diferem** |
| 13.1 dominância | `mr131` | `Chapter_13_1.R` | y = pen + a + d + e | **não existe** (sem D) | **sim** (numérico) |
| 13.2 a + d como um efeito | `mr132` | **não há** | y = Xb + g + e, var(g) ∝ 90A + 80D | **não existe** | sem script R |
| 13.3 genômico a + d | `mr133` | `Chapter_13_2.R` (Ex. 13.3) | G e D genômicas | **não existe** | sim por leitura |
| 13.4 + endogamia genômica | `mr134` | **não há** | + covariável de homozigose | **não existe** | sem script R |
| 13.5 + epistasia AA | `mr135` | `Chapter_13_2.R` (Ex. 13.5) | + G_AA | **não existe** | sim por leitura |

### 2.2 Notas por exemplo

**Ex. 4.1, `mr41.par` e `mr41a.par`.**
- Modelo: **y = Xb + Za + e**, a ~ N(0, Aσ²a), σ²a = 20, σ²e = 40. X: sexo (`2 2 cross`, coluna 2, 2 níveis, sem intercepto); Z: animal (`1 8 cross`, 8 animais, 5 registros: animais 4 a 8).
- `mr41a.par` escreve o mesmo modelo na forma de razão (resíduo 1,0 e σ²a = 0,5, α = 2); o tutorial chama isso de "tricky (not recommended)" (p.97).
- `OPTION store_accuracy 2` grava a REL do efeito 2 (animal): 1 − PEV/[(1+F)σ²a]. O script R calcula r² = 1 − c^ii·α, **sem** (1+F); coincidem porque nenhum animal é endogâmico.
- Motor: `modelo_animal(ped, [4,5,6,7,8], y, grupos=["M","F","F","M","M"], 20.0, 40.0)` devolve EBV (0,098; −0,019; −0,041; −0,009; −0,186; 0,177; −0,249; 0,183), PEV do animal 1 de 18,84 e REL de 0,058: **os números do `solutions` do BLUPF90 impressos no tutorial** (p.96–98).
- Par ≡ R: mesmo X, mesmo Z, mesmo A⁻¹ (sem endogamia), mesmos σ². Diferença máxima 9×10⁻¹⁶.

**Ex. 4.2, `mr42.par` e `mr42a.par`.**
- Modelo: **y = Xb + Zs + e\***, s ~ N(0, A_s σ²s). σ²s = ¼σ²a = 5 e σ²e\* = σ²e + ¾σ²a = 55 (conferem com o script: `varS = 0.25*20`, `varE = 60 - 5`).
- `RANDOM_TYPE add_sire`; pedigree `sire, pai do touro, avô materno do touro`. `mr42.par` renumera os touros 1, 3, 4 para 1, 2, 3, e o touro 3 (antigo 4) é filho do touro 1; `mr42a.par` mantém os IDs 1, 3, 4 (4 níveis).
- Motor: `modelo_touro` **supõe touros não aparentados (A_s = I)** e devolve EBV = 2ŝ; o BLUPF90 e o script usam A_s com a_{1,4} = ½. **Conferência minha**: A_s⁻¹ montada por `parentesco.inversa_A({1:(0,0), 3:(0,0), 4:(1,0)})` reproduz os 8 algarismos da Listagem 6.6 do tutorial (p.99). Esses números são um vetor de teste pronto para estender `modelo_touro` (próximo passo já anotado no README do motor).
- Não encontrei, em nenhum documento, a regra que o BLUPF90 usa para montar A_s a partir de `sire, sire's sire, MGS`; a conferência acima mostra só que, neste caso, ela coincide com a A_s do pedigree de touros.

**Ex. 4.3, `mr43.par` e `mr43a.par`.**
- Modelo: **y = Xb + W·a_p + e\***, em que a_p são só os 6 animais com filhos. Para filho sem progênie, W tem 0,5 e 0,5 nas posições de pai e mãe; var(e\*) = σ²e (pais) ou σ²e + ½σ²a (não pais, ambos os pais conhecidos). Daí os pesos: 40/50 = 0,8.
- Escrita no `.par` (tut. §6.3.2, p.100–101): `WEIGHT(S)` na coluna 8 (`mr43`) ou 10 (`mr43a`); `6 0 cov 3` e `6 0 cov 4` somam 0,5 nas colunas do pai e da mãe; `7 6 cov 9` soma 1,0 na coluna do próprio animal (animais com progênie). `RANDOM_GROUP 4` só.
- O BLUPF90 devolve só os 6 pais. O EBV dos não pais sai de uma conta posterior (no R: `a_n = W_n a_p + K(y_n − X_n b − W_n a_p)`); **não encontrei, na documentação, como o BLUPF90 devolve os não pais**.
- Motor: **não existe**; o modelo animal completo dá as mesmas soluções (teste 4.3 do motor) e o RAM só poupa memória.
- Par ≡ R: diferença 3,5×10⁻¹⁶ em b e a_p (conferência da §0.2).

**Ex. 4.4, `mr44.par` e `mr44a.par`.**
- Modelo: **y = Xb + ZQg + Za + e**, transformação de Quaas e Pollak: as MME ficam com A* sobre [animais; grupos] e â* = Qĝ + â. Grupo 9 = pai desconhecido, grupo 10 = mãe desconhecida.
- `mr44a.par` mantém os dois grupos (`1 10 cross`, 10 níveis) e `mr44.ped` escreve **0** no lugar do grupo 9, o que é a restrição "grupo 9 = 0" do script R (`LHS[,-c(11)]`) e do tutorial (p.104).
- **Inconsistência em `mr44.ped`**: a linha do animal 4 (`4 1 10 3`) tem pai conhecido (animal 1) e mãe em grupo, então o código deveria ser **2** (3 − 1 pai conhecido, man. p.13), como em `mr44a.ped` (`4 1 10 2`). **Conferência minha** (reconstrução independente da regra do manual): com código 3 ou 2 as soluções coincidem (diferença 3×10⁻¹⁴), então não há efeito numérico aqui, mas a matriz A* difere (0,33 em uma entrada). Em outro pedigree o erro de código mudaria as soluções.
- Motor: `modelo_animal(..., grupos_geneticos=[9, 10])`, com o 1º grupo fixado em 0. **Diferença de PEV**: o PEV do motor inclui o erro do contraste com o 1º grupo; o `s.e.` do BLUPF90 com UPG "não tem sentido" (tut. p.104).
- BLUPF90 e motor podem dar soluções individuais diferentes por uma constante (cada um escolhe a coluna que zera). Comparar contrastes.

**Ex. 5.1, `mr51.par`.** Modelo da §1.8. σ²a = 20, σ²p = 12, σ²e = 28.
- Os dados trazem HYS 1 e 3 codificados 0 (restrições do livro). O script R usa o HYS 1 como referência e tira a coluna do HYS 3 (`X[,-4]`): **as mesmas restrições**.
- Motor: `modelo_animal(..., sigma2_pe=12.0)`. Atenção: a paridade está aninhada no HYS (HYS 1 e 2 só têm 1ª lactação; 3 e 4, só a 2ª). Passar paridade e HYS juntos a `montar_X` dá `LinAlgError: Singular matrix`; **conferi aqui**. A saída é usar só o HYS (mesmo espaço de colunas), como o README do motor já faz.
- O animal 8 é endogâmico (F = 0,125), mas não tem filhos; por isso `add_animal` (sem F) e o motor (com F) dão o mesmo A⁻¹.
- Par ≡ R: 2×10⁻¹³.

**Ex. 5.2, `mr52.par`.** y = sexo + a + c + e, com c o ambiente comum da **mãe** (`3 5 cross`, coluna 3 = mãe, níveis 2, 4, 5 usados), `diagonal`, σ²c = 15, σ²a = 20, σ²e = 65. Motor: `modelo_animal(rotulos_pe=<mãe>, sigma2_pe=15.0)`. O script R também define `varP = 100` e `varY = 100`, que não entram nas MME. Par ≡ R: 1×10⁻¹⁴.

**Ex. 6.1, `mr61.par`.** Modelo: **[y₁;y₂] = Xb + Za + e**, var(a) = G₀ ⊗ A com G₀ = [[20,18],[18,40]], var(e) = I ⊗ R₀ com R₀ = [[40,11],[11,30]]. `EFFECTS: 2 2 2 cross / 1 1 8 cross` (mesmas colunas para as duas características). `mr61uni.par` zera as covariâncias (duas análises univariadas, para comparação). Motor: `modelo_multicaracteristica(ped, animais, Y, grupos=sexo, G0, R0)`. Os mesmos valores do script R (G₀, R₀, sexo). Não montei um interpretador multicaracterística; a equivalência é por leitura. O motor reproduz o √PEV impresso no tutorial (p.109), 4,31332061 e 5,9918099.

**Ex. 6.2 a 6.4, `mr62`, `mr63`, `mr64`.**
- `mr62` tem os animais 4 e 9 sem y₂ (0 = ausente). O BLUPF90 usa o sub-bloco de R₀ das características medidas (tut. p.109), que é o que `modelo_multicaracteristica` faz com `NaN`.
- `mr63` e `mr63a` dão um fator de GC **por característica** (`4 5 2 cross`: coluna 4 para y₁, coluna 5 para y₂; ou duas linhas com `0` em uma das características). O motor aceita um só rótulo de GC por registro, igual para todas as características; **não existe**.
- `mr64`: nenhum animal tem as duas características, então R₀ é diagonal (77 e 70); o tutorial (p.113) avisa que as soluções do BLUPF90 aqui **diferem** das do livro. O motor atende com R₀ diagonal.
- Não há script R para 6.2–6.4: o motor não tem referência R nestes casos.

**Ex. 8.1, `mr81.par`.**
- Modelo: **y = Xb + Z₁a + Z₂m + Sp + e**, var[a;m] = G₀ ⊗ A com G₀ = [[150,−40],[−40,90]], var(p) = I·40, σ²e = 350. No `.par`: `4 3 cross` (rebanho; nível 1 = 0), `5 2 cross` (baia), `1 14 cross` (direto), `3 14 cross` (materno, coluna 3 = mãe), `3 7 cross` (ambiente permanente materno, `diagonal`). `RANDOM_GROUP 3 4` liga direto e materno.
- Motor: `modelo_direto_materno(ped, animais, maes, y, grupos, G0, sigma2_pe=40, sigma2_e=350, outros_fatores={...})`.
- Vários animais são endogâmicos (11, 12, 13, 14), mas nenhum tem filhos; `add_animal` e o motor coincidem. Par ≡ R: 3×10⁻¹⁴.

**Ex. 8.2, `mr82.par`.** Modelo animal reduzido com efeito materno: `8 0 cov 2`, `8 0 cov 3`, `9 9 cov 7`, `3 9 cross`, `3 7 cross`, `RANDOM_GROUP 5 6`. Peso 0,8235 = 350/(350 + ½·150) = 350/425. O `.dat` tem 4 linhas de fundadores com y = 0 (ausente) e peso 1. Sem script R e sem equivalente no motor.

**Ex. 12.1, `mr121.par`.**
- Modelo: **y = μ + u + e**, y = DYD de 8 animais (13 a 20), u ~ N(0, **H**σ²u), com **H⁻¹ = A⁻¹ + [[0,0],[0, G⁻¹ − A₂₂⁻¹]]**, σ²u = 35,241, σ²e = 245 (alfa = 245/35,241 nos dois). `4 1 cross` é a média (coluna 4 = 1) e `1 26 cross` o animal.
- G: VanRaden com frequência atual (`whichfreq 2`, padrão), escala 2Σp(1−p) (`whichScale 1`, padrão); mistura 0,95G + 0,05A₂₂ (`AlphaBeta`, padrão) e depois **ajuste (tuning)** (`tunedG 2`, padrão), que é a ordem do script R (mistura e então ajuste) e a ordem listada no tut. p.172–173 (`Gini` → `G_Alpha_Beta` → `G_gamma` → `G_delta` → `G_suggest`). `no_quality_control` desliga o controle de qualidade, que o R não faz (man. p.50–51: MAF 0,05, taxa de chamada 0,90 etc.). Os genótipos do `mr121.gen` são idênticos aos do script (conferido nos 14 animais), e os 8 DYD também.
- `OPTION no_tunedG_first` **não aparece em nenhum documento fornecido**: não sei se muda a ordem mistura/ajuste; por isso o "sim" é só por leitura. `#OPTION thrStopCorAG 0.10` está comentada; o tut. p.141 avisa que o programa pode parar por correlação baixa entre as diagonais de G e A₂₂ em dados pequenos (`thrStopCorAG` padrão 0,3, man. p.54), e que essa opção evita a parada.
- Motor: **não existe** (sem G, sem A₂₂ a partir de genótipos, sem H⁻¹). Já há `matriz_A` (A₂₂ é um bloco) e `inversa_A`.

**Ex. 12.2, `mr122.par`.** O `.par` e o script R **não especificam o mesmo modelo nem os mesmos dados**.
- R (`Chapter_12_2.R`): GBLUP com APY **só nos 14 genotipados**, sem pedigree, DYD de 8 animais (13 a 20), G sem mistura nem ajuste, 4 animais do núcleo sorteados com `set.seed(12345)`.
- `.par`: ssGBLUP (`mr122.ped` com 26 animais) com `OPTION apy 1 3 core.eq.1`, `AlphaBeta 1.00 0.00`, `tunedG 0`; `mr122.dat` tem **14 registros** (animais 13 a 26, com DYD de 7,6; 8,8; 9,8; 9,2; 11,5 e 13,3 para os animais 21 a 26), **contra 8 no R**.
- Conferência minha: `set.seed(12345); sample(1:14, 4)` dá as posições 14, 3, 10, 8, isto é, os animais 26, 15, 22, 20. É o mesmo conjunto que `mr122.xrf` marca com 1 na terceira coluna (15, 20, 22, 26); a ordem do sorteio não importa para o conjunto. Portanto a 3ª coluna do `.xrf` é a marca de núcleo do APY (inferência; nenhum documento fornecido descreve isso).
- Não encontrei: o significado dos argumentos de `apy 1 3 core.eq.1`. Há ainda um erro de digitação no arquivo (`OPRION save Ascii`), e `saveGInverseOrig` não consta da lista de opções do man. p.56.
- Motor: **não existe**.

**Ex. 13.1, `mr131.par`.** Modelo: **y = Xb + Za + Wd + e**, a ~ N(0, Aσ²a), d ~ N(0, Dσ²d), σ²a = 90, σ²d = 80, σ²e = 120. `1 12 cross` duas vezes (aditivo e dominância) e `user_file mr131.dom` (a **inversa** D⁻¹; o BLUPF90 **não calcula D⁻¹**, tut. p.142, e o `par_domin` só dá F⁻¹ das subclasses, p.144). Conferi que `mr131.dom` é a D⁻¹ de Cockerham (5×10⁻⁹) para este pedigree sem endogamia. Motor: **não existe**. Par ≡ R: 9×10⁻⁹ (limite dos 8 algarismos do arquivo).

**Ex. 13.2, `mr132.par`.** Um só efeito aleatório g (`user_file mr132.apd`), resíduo 1 e `(CO)VARIANCES 0.008333` = 1/120. Conferi que `mr132.apd` = (90A + 80D)⁻¹, de modo que var(g) = 0,008333·(90A + 80D) = 0,75A + 0,667D com resíduo 1, isto é, o modelo de g = a + d com resíduo 120 reescalado. As soluções fixas coincidem com as do Ex. 13.1, e ĝ = â + d̂ do 13.1 (5×10⁻⁵, limite dos 7 algarismos do arquivo). Não há script R; **a explicação do arquivo é minha**.

**Ex. 13.3, 13.4, 13.5 (`mr133`, `mr134`, `mr135`).**
- `mr133`: pedigree fictício (`mr133.ped`, 15 animais sem pais) e `SNP_file`. Com todos genotipados e pedigree vazio, A⁻¹ = A₂₂⁻¹ = I e H⁻¹ = G⁻¹ (tut. §8.4.2, p.174: é o método do "dummy pedigree"). `AlphaBeta 1 0`, `GammaDelta 0.01 0`, `tunedG 0` dão G + 0,01I sem ajuste, como o R (`GG + diag(0.01)`). D⁻¹ vem do arquivo `mr133.Di` = (D_g + 0,01I)⁻¹ (conferido), com D_g montada como no script (Md₂ por genótipo).
- `mr134`: acrescenta `6 1 cov` (coluna 6). Conferi que a coluna 6 é a **proporção de locos homozigotos** (0,55 a 0,85, igual a 1 − fração de heterozigotos nos 11 animais); é a regressão sobre endogamia genômica (dominância direcional). Interpretação minha. Sem script R.
- `mr135`: acrescenta a epistasia aditiva×aditiva por `user_file mr135.Gaai` = (G_AA + 0,01I)⁻¹, com G_AA = (G∘G)/k, k = tr(G∘G)/15, σ²AA = 6 (conferido, 5×10⁻¹⁰). A coluna 6 do `mr135.dat` existe, mas o `.par` não a usa.
- `mr133` e `mr135` têm script R (`Chapter_13_2.R`); `mr134` não. Motor: **não existe**.

### 2.3 Resultado numérico das conferências `.par` ≡ script R

| `.par` | Comparação | Maior diferença |
|---|---|---|
| `mr41.par` | b e â (10 incógnitas) | 8,9×10⁻¹⁶ |
| `mr41a.par` | idem (forma de razão) | 0 |
| `mr43.par` | b e â dos 6 pais (RAM) | 3,5×10⁻¹⁶ |
| `mr43a.par` | idem (outra colunagem) | 3,5×10⁻¹⁶ |
| `mr51.par` | paridade, HYS 2 e 4, â, p̂ | 2,3×10⁻¹³ |
| `mr52.par` | sexo, â, ĉ | 1,4×10⁻¹⁴ |
| `mr81.par` | baia, rebanho 2 e 3, â, m̂, p̂ | 3,2×10⁻¹⁴ |
| `mr131.par` | b, â, d̂ | 8,9×10⁻⁹ (arquivo com 8 algarismos) |
| `mr132.par` | ĝ contra â + d̂ do 13.1 | 5,1×10⁻⁵ (arquivo com 7 algarismos) |

A interpretação do `.par` que usei (níveis, `cov` aninhada, blocos de 0 níveis, pesos, `diagonal`, `add_animal` sem endogamia, `add_an_upg`, `user_file` como inversa) é a documentada no man. p.8–15 e no tut. p.100–106. Isso mostra que **as MME dos arquivos de Mrode são as dos scripts R**; não mostra que o binário do BLUPF90 as monta assim (não rodei o binário).

### 2.4 Pontos de atenção da tradução

1. **Endogamia.** `add_animal` ignora F nas regras de A⁻¹ (ver §1.6 e a contradição entre man. p.18 e tut. p.64); o motor sempre usa a correção de Quaas. Em rebanho de caprinos, com F > 0 em pais, a equivalência exige `add_an_upginb`. Nos exemplos de Mrode os pais não são endogâmicos, então não difere.
2. **Zeros como restrição.** Nível 0 em `cross` tira o registro do efeito. Os `.par` de Mrode usam isso para fixar a base; o motor usa "1º nível = 0" em `outros_fatores`.
3. **Soluções não únicas.** Comparar contrastes ou EBV depois de somar o efeito de grupo; nunca nível a nível.
4. **PEV.** O `s.e.` do `solutions` é √PEV do EBV (SEP do livro) apenas com variâncias explícitas e sem UPG. O `sep_dep` do motor é √PEV/2 (erro da DEP).
5. **Modelo de touro.** `add_sire` usa A_s; o motor supõe I.
6. **Dados de ssGBLUP.** `mr121` e `mr133` exigem `OPTION no_quality_control` porque os scripts R não fazem controle de qualidade (man. p.50–51).

---

## 3. Algoritmos: o que o BLUPF90 faz e o que o motor reproduz

### 3.1 Resolver as MME

- **Em memória, três solvers** (man. p.26): PCG (padrão), SOR e FSPAK. As MME ficam em matriz esparsa em formato hash e, para FSPAK, IJA (legado, "Computing details"; manual_sparse90). O legado estima cerca de 15 bytes por elemento não nulo e 12 por equação (87 bytes por equação com 10 não nulos por linha), "milhões de equações".
- **Gradiente conjugado pré-condicionado (PCG)** (tut. §7.2.1, p.155). Resolve C x = b com pré-condicionador M = diag(C) (padrão) e M em blocos com `blksize`. O critério é ε = ‖b − Cx̂‖²/‖b‖² (na extração os expoentes saem como "2"), padrão 10⁻¹². O tutorial avisa que outros programas, como o MiX99, definem o critério de outro modo (a extração mostra uma raiz de ε nessa frase). É compatível com "iteração com dados": o estado fica em 4 vetores e, a cada volta, as equações são montadas aos poucos ao ler dados e pedigree, sem guardar C. Uma volta é uma leitura do arquivo (tut. p.154). Esse modo (BLUP90IOD2/IOD3) só é fornecido **sob acordo de pesquisa** (man. p.5–6, 29). Misztal 1999 (§7–8) diz que o PCG por iteração com dados do grupo avaliava cerca de 2,5 milhões de bovinos de corte com 3 características em meio dia.
- **Gauss-Seidel.** O nome não aparece nos manuais do BLUPF90. O `manual_sparse90.pdf` diz que `solve_iterm` resolve **por SOR** e que o fator de relaxação padrão é **1,0** (convergência 10⁻¹⁰, máximo de 1000 voltas), ou seja, Gauss-Seidel é o SOR com ω = 1. No BLUPF90+, `r_factor` padrão é 1,4 (man. p.26).
- **Direto, FSPAK** (manual_fspak; tut. §7.4.1, p.160): ordenação por grau mínimo, fatoração simbólica e numérica de Cholesky (U′DU), que **aceita matriz de posto deficiente** e devolve o posto; solução densa ou esparsa; determinante; e **inversa esparsa de Takahashi** (os elementos da inversa que são não nulos na fatoração, mais a diagonal). A versão otimizada para velocidade pede 250 a 400% mais memória que a fatoração, e a versão para memória, 20 a 80% a mais. A diagonal da inversa dá o PEV; o log-determinante e os traços dão o REML. `YAMS` (fatoração supernodal, BLAS e LAPACK) substitui o FSPAK (`use_yams`, man. p.27; tut. p.160).

**Motor:** `resolver_mme` usa `np.linalg.solve` e `np.linalg.inv` (denso); `gauss_seidel` (ω = 1, critério Σ(Δx)²/Σx² de Mrode, Cap. 19) resolve as MME já montadas. **Não há** PCG, iteração com dados, matriz esparsa, nem fatoração com posto deficiente. O critério do `gauss_seidel` **não** é o do PCG do BLUPF90.

### 3.2 Estimação de variâncias

- **EM-REML** (REMLF90; man. p.36–37): é o mais confiável, pode levar centenas de rodadas e **não dá erro-padrão**. Usa aceleração de Aitken (`no_accelerate_EM` a desliga). Em regressão aleatória, valores iniciais **maiores** que os verdadeiros ajudam; iniciais muito menores dão convergência lenta ou a estimativas erradas (REMLF90, problemas 2 e 3; Misztal 2008, p.364). Variâncias iguais a 0 na partida ficam em 0 (REMLF90; tut. §5.1.6, p.75). Matrizes não positivas definidas são corrigidas aumentando os menores autovalores (REMLF90; `pos_def` do DENSEOP).
- **AI-REML** (man. p.36; tut. §5.1, p.69–75): é o padrão com `OPTION method VCE`; converge em poucas rodadas, mas pode divergir. Dá erro-padrão pela inversa da matriz de informação média. Quando uma estimativa sai do espaço paramétrico, **mistura** a matriz AI com a do EM, I = (1−w)·I_AI + w·I_EM, aumentando w até 5 tentativas (tut. p.74, citando Jensen et al. 1996). `EM-REML n` roda n voltas de EM e então AI (man. p.36–37). Critérios (tut. p.72): C = Σ(θ−θ*)²/Σθ² e C_Δ = Σ|θ−θ*|/n; para quando C < ε ou C_Δ < √ε, com ε = 10⁻¹² por padrão (man. p.37). As soluções gravadas vêm das variâncias de uma rodada **antes** da convergência (tut. p.73).
- **Funções de componentes** (h², correlações): `se_covar_function` por amostragem da normal assintótica, ou delta (tut. p.73; man. p.38).
- **Gibbs** (GIBBSF90+; man. p.39–46; tut. §5.2): os efeitos entram por Gauss-Seidel com ruído e as variâncias vêm de qui-quadrado inverso escalado ou Wishart inversa (Misztal 2008, p.365; Misztal 1999, módulo GIBBS). `OPTION prior` dá graus de crença; POSTGIBBSF90 calcula média, DP, erro de Monte Carlo, tamanho efetivo da amostra (>10, melhor >30) e Geweke (man. p.43–46). Misztal 2008 (p.366) recomenda, para qualquer estudo, começar por AI univariado, passar a multicaracterística, usar EM se o AI oscila, e Gibbs quando há muitas características ou dados muito grandes; o Gibbs com priors informativos ajuda a convergir.

**Motor:** **não reproduz nada disso**; as variâncias são entradas (README, "Limites"). O mais próximo em material de referência são `Chapter_17.R` (uma rodada de EM e de AI) e `Chapter_18.R` (uma rodada de Gibbs, com o erro de sinal já anotado no README). O `manual_remlf90.pdf` traz um exemplo completo de duas características (30 registros, com o log até a parada na rodada 92), que serve de vetor de teste.

### 3.3 A⁻¹, endogamia e grupos de pais desconhecidos

- A⁻¹ por regras de Henderson dentro do programa, com o fator de Quaas dᵢ quando há endogamia (`add_an_upginb`) e **sem** F no `add_animal` (§1.3). O pedigree é podado por `PED_DEPTH` (padrão 3). F por **Meuwissen e Luo (1992)** (método 1, padrão em `inbreeding_method`); as opções 2 a 7 são Meuwissen e Luo modificado por Sargolzaei e Iwaisaki (2004), Colleau modificado por Sargolzaei et al. (2005), tabular recursivo, Tier (1990), Meuwissen e Luo em versão paralela e tabular recursivo com autofecundação (man. p.19). A₂₂ vem do método de Colleau (log do `manual_example_genomic.pdf`, "Calculating A22 Matrix by Colleau"; Legarra et al. §4.6: tempo quadrático pela decomposição de Henderson).
- UPG: `add_an_upg` (A*), grupos fixos por padrão; `random_upg` só no BLUP90IOD3 (man. p.30). Grupos por ano: `UPG_TYPE yob` com `GEN_INT`. No ssGBLUP os UPG exigem termos extras com Q₂ (`exact_upg`, `TauOmegaQ2`; man. p.30–31); Legarra et al. §4.8 diz que as equações do ssGBLUP não acomodam bem os UPG, que a versão exata é complexa e que as saídas práticas são ignorar o termo ou usar o modelo de Westell-Robinson com UPG como covariáveis.

**Motor:** `matriz_A` e `inversa_A` (regras de Henderson com a correção de Quaas, idênticas ao `add_an_upginb`), `inversa_A_grupos` (A* de Quaas, validada contra o Ex. 4.4). **Não tem**: Meuwissen e Luo (A é tabular, O(n²) de memória), poda por gerações, UPG por ano de nascimento, nem ssGBLUP com UPG.

### 3.4 ssGBLUP: H⁻¹, τ, ω, APY e metafundadores

- **H⁻¹ = A⁻¹ + [[0, 0], [0, τG⁻¹ − ωA₂₂⁻¹]]**, com G ← αG + βA₂₂ + γI + δ11′ (tut. §8.3.2 e §8.3.4, p.171–172; man. p.54; log de `manual_example_genomic.pdf`: "tau inv(alpha G + beta A22 + gamma I + delta) − omega inv(A22)"). **Padrões**: α = 0,95, β = 0,05, γ = 0, δ = 0, τ = 1, ω = 1 (man. p.54). O manual recomenda **não** usar `TauOmega` hoje, porque a endogamia já entra em A⁻¹ (man. p.54, 58). Mistura e ajuste são passos separados; `tunedG` 0 a 4, padrão 2 (média da diagonal e da fora-da-diagonal de G iguais às de A₂₂; Christensen et al. 2012). Com `readGInverse` e `readA22Inverse`, τ e ω são aplicados **de novo** sobre a matriz lida (tut. p.173).
- G (man. p.49–51): `whichG 1` = ZZ′/k de VanRaden (padrão), `whichfreq 2` (frequência atual), `whichScale 1` (2Σp(1−p)); controle de qualidade com MAF 0,05, taxa de chamada 0,90 por SNP e por animal, monomórficos e conflitos de Mendel; correlação G×A₂₂ (`thrWarnCorAG` 0,5; `thrStopCorAG` 0,3). A versão gratuita para pesquisa tem o limite de 30.000 genotipados (man. p.5).
- **Teoria** (Legarra et al., §3.1–3.4): a derivação por "imputação" (Christensen e Lund) e por atualização bayesiana (Legarra et al.) leva à mesma H; §4.5 trata da compatibilidade entre G e A (regressão de VanRaden; ajuste da média; ajuste por Vitezica et al. e Christensen et al.; e o ajuste de Christensen 2012, que dá aos fundadores do pedigree uma matriz de relacionamento com 2 parâmetros e é o mais completo, mas sem teste com dados reais); §4.6 trata de computação (PCG com H⁻¹; sistema não simétrico com BiCGStab para evitar inverter G; custo cúbico, inviável acima de cerca de 100.000 genotipados, §6.3).
- **APY: não encontrei** em nenhum documento fornecido (a palavra `apy` aparece só no `mr122.par`; o tutorial lido não a cita). O que existe é a **função de Mrode** `APY_fja.R`: separa G em núcleo (c) e não núcleo (n), calcula M⁻¹ₙₙ diagonal com mᵢᵢ = gᵢᵢ − gᵢc G_cc⁻¹ g_ci e monta G⁻¹_APY = [[G_cc⁻¹ + G_cc⁻¹G_cn M⁻¹ G_nc G_cc⁻¹, −G_cc⁻¹G_cn M⁻¹], [−M⁻¹G_nc G_cc⁻¹, M⁻¹]]. É uma leitura do script, não da documentação.
- **Metafundadores: não encontrei** em nenhum documento. A palavra não aparece; o precursor que Legarra et al. §4.5 descreve é o ajuste de Christensen (2012), com uma matriz de relacionamento entre fundadores e dois parâmetros estimados por máxima verossimilhança.

**Motor:** nada de genômica (README, "Limites": "ssGBLUP, GBLUP e APY" fora do escopo).

### 3.5 Acurácia

- **Exata**: REL = 1 − PEV/[σ²u(1+F)], com PEV = diag(C) (`store_accuracy`, man. p.28), obtida com FSPAK/YAMS. Para as correlacionadas, `store_pev_pec` (man. p.26). `correct_accuracy_by_inbreeding` e a variante `..._direct 0` (man. p.28) ligam e desligam a correção por F.
- **Aproximada**, para modelos grandes: ACCF90 (iterativo; efetivamente "número de registros" por animal; Strabel et al. 2001, Sánchez et al. 2008), ACCF90GS (ssGBLUP, usa G⁻¹ e A₂₂⁻¹; Misztal et al. 2013a) e ACCF90GS2 (inversão esparsa em blocos). Opções `cg`, `anim`, `pe`, `mat`, `hs`, `acc_maxrounds` (padrão 10) e `conv_crit` (padrão 1e-8) (tut. §7.3.3, p.159). Só sob acordo de pesquisa (man. p.5). Legarra et al. §4.9 diz que a aproximação de Misztal et al. (2013a) e a testada em ovinos Manech leiteiros tiveram correlação de 0,95 com a acurácia exata.
- **`acctype`:** o man. p.28 chama 0,5 de "BIF accuracy"; o tut. p.159 define o resultado como (R²)ˣ, logo √REL, a correlação; e o RRMEBVF90 (man. p.35) tem três tipos distintos: confiabilidade, acurácia e acurácia BIF. **O texto não resolve**: antes de comparar com a acurácia BIF do motor (1 − √(1−r²)), rode o binário e confira o valor.
- **Motor**: PEV exato (c^ii·σ²e, matriz densa), REL com (1+F), r = √REL, acurácia BIF, DEP, SEP e Possible Change (`blup.py`, `confiabilidade.py`). **Sem aproximação**, sem REL para ssGBLUP e sem o caso UPG do BLUPF90 (ver §2.2, Ex. 4.4).

### 3.6 Quadro-resumo

| Tema | BLUPF90 | Motor |
|---|---|---|
| MME densas, Cholesky/solve | FSPAK (esparso) | sim (denso) |
| Posto deficiente, restrições automáticas | sim | **não** ("Singular matrix") |
| Gauss-Seidel / SOR | SOR (`r_factor` 1,4) | sim, só ω = 1 |
| PCG, iteração com dados | sim (IOD sob acordo) | não |
| EM-REML, AI-REML, Gibbs | sim | não |
| A⁻¹ com endogamia, A* com UPG | sim | sim |
| F de Meuwissen e Luo, poda, UPG por ano | sim | não |
| Pesos por registro | sim | não |
| Covariável aninhada, efeito diferente por característica | sim | não |
| Variância residual heterogênea | sim | só HVA e padronização, ad hoc |
| Regressão aleatória | sim | não |
| Animal reduzido | via truque | não |
| Efeito materno, repetibilidade, ambiente comum, multicaracterística | sim | sim (validado) |
| Touro com A_s | sim | só A_s = I |
| ssGBLUP, G, H⁻¹, APY | sim (APY sem doc. aqui) | não |
| Dominância, epistasia | arquivo externo | não |
| Acurácia exata, aproximada | ambas | só a exata |

---

## 4. Licença: o que o texto diz

### 4.1 Transcrição do `condition_of_use.txt` (Drive, 369 bytes)

```
Fonte: https://nce.ads.uga.edu/wiki/doku.php?id=condition_of_use
Capturado em: 2026-10-22

Conditions of use

The programs are free for research, but their use should be acknowledged in
publications.

For commercial use, please contact Ignacy Misztal (ignacy@uga.edu) or
Daniela Lourenco (danilino@uga.edu). Provide your name, company, and
purpose of use in the email.
```

O `wiki_condition_of_use.html` traz os mesmos dois parágrafos e, no rodapé, "condition_of_use.txt · Last modified: 2024/08/09 12:08 by dani".

### 4.2 Resumo do que o texto diz, sem ir além dele

- **Permite**: usar os programas **de graça para pesquisa**.
- **Exige**: que o uso seja **reconhecido nas publicações**.
- **Uso comercial**: pede contato com Ignacy Misztal ou Daniela Lourenco, informando **nome, empresa e finalidade de uso** no e-mail.

### 4.3 Outras menções nos documentos (reproduzidas, sem interpretar)

- man. p.5: a lista de programas separa os "disponíveis para pesquisa (gratuitos com restrições: número de animais genotipados = 30.000)" e os "disponíveis só sob acordo de pesquisa" (BLUP90IOD3, CBLUP90IOD2, CBLUP90MBE, ACCF90, ACCF90GS, ACCF90GS2, BLUP90MBE, BLUPF90ADJ). Os "legados" não são mais atualizados.
- tut. §1.3.1 (p.4): "free for research use, but publications should acknowledge the use of the programs". O §1.3.3 (p.5) dá as referências que os usuários costumam citar: Misztal et al. 2014, *Manual for BLUPF90 family programs* (a referência padrão); Masuda 2018 (o tutorial); Lourenco et al. 2022 (WCGALP) e 2020 (*Genes* 11:790) para recursos novos; Aguilar et al. 2018, 2014; Misztal et al. 2002 (BGF90, hoje "considerada ultrapassada").
- tut. p.iv: o **texto do tutorial** é CC BY-NC-ND 4.0; os **arquivos numéricos de exemplo** do tutorial estão em domínio público.
- Textos antigos: BGF90 (2002) diz "free to use for noncommercial applications" (todos, menos os de iteração com dados); Misztal 1999 diz "free for research use"; `manual_fspak.pdf` diz "free to use for noncommercial applications". Nenhum desses substitui o texto atual.
- Não achei arquivo de licença no clone dos exemplos de Mrode (`examples_blupf90` e `examples_r`); o `README.md` só diz quem iniciou e finalizou a contribuição (Y. Masuda; E. Carrara e F. de Oliveira Bussiman).

### 4.4 Ressalvas

**Isto é uma leitura do texto, não um parecer jurídico.** O texto é curto e **não define** "pesquisa" nem "uso comercial", e **não diz** se um aplicativo ou serviço que rode o BLUPF90 para terceiros é comercial; se pode redistribuir binários; se vale para reimplementações de métodos publicados (o texto trata de "the programs"); nem se vale para o uso dos manuais e dos exemplos como material de teste. **O uso comercial deve ser confirmado com os autores**, pelo e-mail indicado, com nome, empresa e finalidade. Antes de copiar arquivos de Mrode para o nosso repositório, falta confirmar a licença deles.

---

## 5. Lacunas do motor para o SeabraApp (caprinos leiteiros, rebanho pequeno)

### 5.1 O que o BLUPF90 faz e o motor não, em ordem de utilidade

O critério é o que trava ou degrada uma avaliação de verdade com dados de produtor (rebanhos de dezenas a poucas centenas de animais; lactações repetidas por cabra; pedigree incompleto; poucos reprodutores por rebanho).

| # | Lacuna | Por que vem nesta posição | Referência |
|---|---|---|---|
| 1 | **Posto deficiente e restrições automáticas** | Todo dado real tem GC, paridade e grupos confundidos; hoje o motor para com `LinAlgError: Singular matrix` (conferido no Ex. 5.1). | tut. §6.4.4 p.103–104, §6.5.3–6.5.4 p.106; manual_fspak ("FSPAK allows the factorization of non-full rank matrices"); manual_denseop (`denseop_tol`, inversa generalizada) |
| 2 | **Preparação de pedigree e dados** (renumeração, poda, checagens, UPG por ano) | O app recebe pedigree de planilha: faltam checagens (filho mais novo que o pai, sexo do pai, ciclos) e grupos por ano de nascimento. | man. p.16–25; tut. §4.2.2 p.47–52, §4.5.2–4.5.4 p.61–63 |
| 3 | **Pesos por registro** | Lactações com nº diferente de controles ou de dias; base do modelo animal reduzido e de pseudofenótipos. | man. p.8; tut. §6.3.2 p.100; §8.4.1 p.174 |
| 4 | **Estimação de variâncias por REML** (EM, depois AI, com erro-padrão e h²) | Só faz sentido com dados agrupados de muitos rebanhos, mas é o que tira o app de depender de parâmetros da literatura. Não serve para um rebanho isolado (README do motor). | man. p.36–39; tut. §5.1 p.69–76; REMLF90; Misztal 2008 p.363–367 |
| 5 | **Efeitos fixos gerais**: covariável aninhada (idade ao parto dentro de paridade, dias em lactação), fator diferente por característica | Generaliza o `montar_X` atual (um fator por registro) e fecha o Ex. 6.3. | man. p.9–10; legado ("Different models per trait") |
| 6 | Variância residual heterogênea por classe | Rebanhos com dispersões diferentes; hoje só a padronização e o HVA, ad hoc. | man. p.27, 38; tut. §5.3.1 (não li) |
| 7 | Endogamia e A⁻¹ escaláveis (Meuwissen e Luo, A⁻¹ esparsa) e solver PCG com pré-condicionador diagonal | Só importa quando a avaliação juntar milhares de animais (a matriz densa de 5.000 animais já pesa cerca de 200 MB). | man. p.19; tut. §7.2 p.155; Legarra et al. §4.6 |
| 8 | Regressão aleatória (dia de controle) | Aproveita todos os controles, mas é modelo pesado e exige parâmetros que o app não terá; o total de 305 dias com repetibilidade cobre o começo. | man. p.12; legado (Apêndices C e E); tut. §6.14 (não li) |
| 9 | ssGBLUP (G, A₂₂, H⁻¹, controle de qualidade e ajuste) | Genotipagem em caprinos ainda é rara; a montagem de H⁻¹ é pequena sobre o que já existe (A⁻¹, A). | man. p.47–58; Legarra et al.; tut. §8.3 |
| 10 | Gibbs com priors informativos | Útil em rebanho pequeno, onde o REML é só ruído; custo alto de implementar e de ensinar o usuário. | man. p.39–46; Misztal 2008 p.365–366 |
| 11 | Modelo animal reduzido | Só economiza memória. | tut. §6.3 |
| 12 | Modelos de limiar, validação cruzada, dominância, APY, metafundadores | Pouca demanda para o caso; APY e metafundadores não estão documentados no material. | VALIDATIONF90 (man. p.32–34); cap. 13 |

### 5.2 As 5 primeiras funções a implementar

Sugestões de nome e de assinatura; o alvo de teste é o que o material já traz.

| # | Função sugerida | O que faz | Referência | Alvo de teste |
|---|---|---|---|---|
| 1 | `resolver_mme_posto_deficiente(LHS, RHS, tol)` | Cholesky ou LDL com pivô nulo: marca as colunas dependentes, impõe solução 0 nelas e devolve posto e a lista de restrições; `modelo_animal` passa a usá-la e a reportar "coluna X foi restringida". | tut. §6.4.4 p.104 e §6.5.3–6.5.4 p.106; manual_fspak (posto, IRANK); manual_denseop (`denseop_tol` 10⁻¹⁰, inversa generalizada) | Ex. 5.1 com paridade **e** HYS (hoje erro); Listagem 6.11 do tut. p.104 (já confere) e contraste u₁ − u₂ = 0,156 (Listagem 6.10) |
| 2 | `preparar_pedigree(pedigree_bruto, nascimentos, sexos, profundidade=3, upg='ano')` | Renumera, poda por gerações, checa (pai mais novo que o filho, sexo, duplicata, ciclo) e atribui UPG por ano com a regra de `GEN_INT`; devolve pedigree com código de UPG e de endogamia. | man. p.16–21 (`PED_DEPTH`, `GEN_INT`, `REC_SEX`, `UPG_TYPE yob`), exemplo com saída nas p.21–25; tut. §4.2.2 p.47–52, §4.5.2–4.5.5 p.61–65 | Exemplo do man. p.21–25 (dados `aa bb cc ...`, pedigree com ano, saída com 9 animais e códigos 1000, 1333, 2000) e a listagem 4.7/4.20 do tutorial; comparar a estrutura, não a numeração (a numeração do RENUMF90 é imprevisível, tut. p.51) |
| 3 | Parâmetro `pesos` em `modelo_animal`, `montar_mme` e `modelo_multicaracteristica` | R_i = σ²e/wᵢ: soma `w/σ²e` em X′R⁻¹X e em X′R⁻¹y. | man. p.8; tut. §6.3.2 p.100; §8.4.1 p.174 | Ex. 4.3: o RAM com pesos 0,8 nos não pais e W de 0,5 dá as soluções dos pais do modelo completo (README do motor, teste 4.3); o `mr43.par` coincide com o RAM do script R em 3,5×10⁻¹⁶ (minha conferência). Serve de teste de um futuro `modelo_animal_reduzido` |
| 4 | `reml_em(...)` e `reml_ai(...)` (univariado com ambiente permanente; depois multicaracterística), com erro-padrão e h² | EM com aceleração de Aitken, AI com mistura EM quando sai do espaço paramétrico, critério C < ε ou C_Δ < √ε, variância 0 na partida fica em 0. | man. p.36–38; tut. §5.1 p.69–76 (convergência p.72, SE p.73, mistura p.74, restrições p.75); REMLF90; Misztal 2008 p.363–366; `Chapter_17.R` (uma rodada) | O exemplo completo do REMLF90 (30 registros de duas características, com observações ausentes, convergência na rodada 92; o log da rodada 91 imprime R = [[100,92; 81,188]; [81,188; 114,86]] e G = [[35,260; 32,518]; [32,518; 30,143]]); a fórmula da matriz AI não está nos documentos fornecidos (só a referência a Jensen et al.) |
| 5 | `montar_X_efeitos(especificacao)` | Gera X a partir de uma lista no estilo `EFFECTS`: `cross`, `cov`, `cov` aninhada, 0 = ausente na característica e fator por característica. | man. p.9–10; legado ("Different models per trait") | Ex. 6.3 (`mr63`: HYS por característica); regressão aninhada do exemplo do man. p.10; os testes atuais continuam passando com a especificação antiga |

O motor já valida, contra os números do tutorial, os modelos animal, de touro com A_s (por reconstrução) e multicaracterístico; o item 1 fecha o único erro que um produtor veria de imediato.

---

## 6. O que não encontrei e outras pendências

- **APY** (definição, escolha do núcleo, argumentos de `OPTION apy 1 3 core.eq.1`) e **metafundadores**: ausentes de todo o material. A página "undocumented options" do wiki (`wiki_start.html`) pode ter as opções `apy`, `no_tunedG_first` e `saveGInverseOrig`; ela não está no Drive.
- **Regra de A_s⁻¹ do `add_sire`**: não está descrita; só confere para o pedigree de 3 touros do Ex. 4.2.
- **Como o BLUPF90 devolve o EBV dos animais sem progênie** no modelo animal reduzido, e **como escolhe a coluna que restringe**: não encontrei.
- **Fórmulas**: o `manual_blupf90_all.pdf` e o `single_step_8.pdf` chegaram sem os símbolos matemáticos. As fórmulas de H⁻¹, G e da confiabilidade vêm do tutorial, de `manual_example_genomic.pdf` e do código de Mrode.
- **Tutorial**: seções não lidas listadas na §0.1.
- **Versões**: o manual é de agosto/2026; o tutorial, de abril/2025 (v1.1.0); o legado, de 2012; o `manual_remlf90.pdf`, de 1998–2002; o genômico, de 2011 (BLUPF90 1.42, biblioteca genômica 1.76, enquanto o manual atual mostra a 1.308 na p.67). Onde há conflito entre eles, listei na §1.6 (endogamia por padrão) e na §3.5 (`acctype`); a mesma contradição entre `pos_def` de Misztal 1999 (autovalores negativos viram 0,0001 do maior) e do DENSEOP de 2006 (mínimo relativo de 10⁻⁵ por padrão) também é de versão.
- **Nada disso foi rodado com o binário.** Toda afirmação "par ≡ R" é sobre as MME que os arquivos descrevem, lidas segundo a documentação.
