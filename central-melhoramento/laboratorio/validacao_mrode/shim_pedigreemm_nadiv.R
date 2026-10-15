# =====================================================================================
# SHIM MÍNIMO QUE SUBSTITUI OS PACOTES pedigreemm E nadiv
# =====================================================================================
#
# Para que serve
#   Rodar os scripts oficiais dos exemplos de Mrode, Pocrnić, Gorjanc e Thompson (2023),
#   "Linear Models for the Prediction of the Genetic Merit of Animals", 4ª ed., CABI
#   (github.com/MrodesBook/Examples_R), num ambiente onde o CRAN está bloqueado e os pacotes
#   pedigreemm e nadiv não existem no apt do Ubuntu.
#
# O que NÃO é
#   Não é o pedigreemm nem o nadiv. Implementa só o que os 24 scripts chamam, com as mesmas
#   assinaturas e a mesma forma de saída que os scripts usam:
#
#   pedigreemm (Vazquez et al. 2010)
#     pedigree(sire, dam, label)   objeto S4 "pedigree"; slots sire e dam guardam a POSIÇÃO do
#                                  pai e da mãe em label (NA se desconhecido), label é texto.
#                                  Os scripts usam pedX@label e unique(pedX@sire).
#     getA(ped)                    A (Matrix esparsa simétrica, dimnames = label)
#     getAInv(ped)                 A⁻¹ (Matrix esparsa, dimnames = label), COM endogamia.
#                                  Os scripts usam Ainv@Dimnames (Cap. 11), por isso a saída é
#                                  um objeto do pacote Matrix, como no original.
#
#   nadiv (Wolak 2012)
#     makeAinv(pedigree, ggroups = NULL)$Ainv
#                                  A⁻¹ com endogamia; com ggroups = k, as k primeiras linhas do
#                                  pedigree são grupos genéticos (pais desconhecidos), e a matriz
#                                  A* de Quaas (1988) sai com os grupos no fim (gOnTop = FALSE,
#                                  o padrão do nadiv), como o Cap. 4.3 supõe (Ainv[1:8, 9:10]).
#     ggcontrib(pedigree)          Q: fração dos genes de cada animal vinda de cada grupo
#                                  (linhas = animais, sem os grupos; colunas = grupos). Sem
#                                  ggroups, grupos são as linhas sem pai nem mãe. Não estava na
#                                  lista inicial, mas o Cap. 4.3 a chama.
#     makeD(pedigree)$Dinv         inversa da matriz de dominância D, com d_ii = 1 e
#                                  d_ij = ¼(a_ss'·a_dd' + a_sd'·a_ds') (pais desconhecidos dão 0),
#                                  a aproximação sem endogamia que o nadiv documenta.
#
#   O nadiv lê o pedigree como (ID, Dam, Sire) e o pedigreemm como (sire, dam). Todas as contas
#   acima são simétricas nos dois pais, então a ordem das colunas não muda nenhum número.
#
# Como as contas são feitas (de propósito, por caminhos diferentes dos do motor Python)
#   A: método tabular. A⁻¹ = T⁻ᵀ·D⁻¹·T⁻¹ (decomposição A = TDT', a mesma ideia do pedigreemm),
#   com T⁻¹ = I − P (P tem ½ na coluna de cada pai conhecido) e
#   d_i = 1 − ¼·Σ_{pais conhecidos p}(1 + F_p)   (Henderson 1976 com a correção de Quaas 1976).
#   Grupos genéticos entram em T* como "pais" com 1 + F = 0, logo não mudam d_i (Quaas 1988).
#   Cada função confere a si mesma: A⁻¹·A = I; com grupos, A*_nn = A⁻¹ e A*_ng = −A⁻¹·Q.
#
# Uso: instalar_shim.sh <lib> copia este arquivo para dois pacotes mínimos (pedigreemm e nadiv)
#      na biblioteca <lib>; os scripts rodam sem alteração com R_LIBS=<lib>. rodar_scripts.sh
#      faz tudo (instala o shim, roda os 24 scripts numa cópia de trabalho e grava as saídas).
# =====================================================================================

# ---- núcleo (comum aos dois "pacotes") -----------------------------------------------

.shim_posicoes <- function(pais, ids) {
  # posição de cada pai em ids; NA, 0 e "0" viram NA (desconhecido)
  p <- match(as.character(pais), as.character(ids))
  p[is.na(pais)] <- NA_integer_
  as.integer(p)
}

.shim_A_tabular <- function(s, d) {
  # A pelo método tabular; exige pais antes dos filhos
  n <- length(s)
  for (i in seq_len(n)) {
    if ((!is.na(s[i]) && s[i] >= i) || (!is.na(d[i]) && d[i] >= i))
      stop("shim: o pedigree precisa ter os pais antes dos filhos (animal na posição ", i, ")")
  }
  A <- matrix(0, n, n)
  for (i in seq_len(n)) {
    if (i > 1) {
      for (j in seq_len(i - 1)) {
        v <- 0
        if (!is.na(s[i])) v <- v + 0.5 * A[j, s[i]]
        if (!is.na(d[i])) v <- v + 0.5 * A[j, d[i]]
        A[i, j] <- v
        A[j, i] <- v
      }
    }
    A[i, i] <- 1 + if (!is.na(s[i]) && !is.na(d[i])) 0.5 * A[s[i], d[i]] else 0
  }
  A
}

.shim_T_D <- function(s, d, F, n_colunas = length(s)) {
  # T⁻¹ (n × n_colunas) e o vetor d_i; s e d podem apontar para colunas além de n (grupos,
  # cujo 1 + F vale 0)
  n <- length(s)
  Ti <- matrix(0, n, n_colunas)
  dd <- numeric(n)
  um_mais_F <- function(p) if (p <= n) 1 + F[p] else 0
  for (i in seq_len(n)) {
    Ti[i, i] <- 1
    dd[i] <- 1
    for (p in c(s[i], d[i])) {
      if (!is.na(p)) {
        Ti[i, p] <- Ti[i, p] - 0.5
        dd[i] <- dd[i] - 0.25 * um_mais_F(p)
      }
    }
  }
  list(Ti = Ti, d = dd)
}

.shim_Ainv <- function(s, d) {
  A <- .shim_A_tabular(s, d)
  F <- diag(A) - 1
  td <- .shim_T_D(s, d, F)
  Ainv <- t(td$Ti) %*% diag(1 / td$d, length(td$d)) %*% td$Ti
  erro <- max(abs(Ainv %*% A - diag(nrow(A))))
  if (erro > 1e-9) stop("shim: A⁻¹·A difere de I em ", erro)
  list(A = A, Ainv = Ainv, F = F)
}

.shim_esparsa <- function(M, nomes, simetrica = FALSE) {
  dimnames(M) <- list(nomes, nomes)
  X <- Matrix::Matrix(M, sparse = TRUE)
  if (!simetrica) X <- methods::as(X, "generalMatrix")
  X
}

# ---- pedigreemm ----------------------------------------------------------------------

methods::setClass("pedigree", methods::representation(sire = "integer", dam = "integer",
                                                      label = "character"))

pedigree <- function(sire, dam, label) {
  n <- length(label)
  stopifnot(length(sire) == n, length(dam) == n)
  sire[!is.na(sire) & sire == 0] <- NA
  dam[!is.na(dam) & dam == 0] <- NA
  if (!all(is.na(sire) | sire %in% label) || !all(is.na(dam) | dam %in% label))
    stop("shim: pai ou mãe fora de label")
  methods::new("pedigree", sire = .shim_posicoes(sire, label), dam = .shim_posicoes(dam, label),
               label = as.character(label))
}

getA <- function(ped) {
  stopifnot(methods::is(ped, "pedigree"))
  .shim_esparsa(.shim_A_tabular(ped@sire, ped@dam), ped@label, simetrica = TRUE)
}

getAInv <- function(ped) {
  stopifnot(methods::is(ped, "pedigree"))
  .shim_esparsa(.shim_Ainv(ped@sire, ped@dam)$Ainv, ped@label)
}

# ---- nadiv ---------------------------------------------------------------------------

.shim_ler_ped_nadiv <- function(pedigree) {
  ped <- as.data.frame(pedigree)
  ids <- as.character(ped[[1]])
  p1 <- ped[[2]]
  p2 <- ped[[3]]
  p1[!is.na(p1) & p1 == 0] <- NA
  p2[!is.na(p2) & p2 == 0] <- NA
  list(ids = ids, p1 = p1, p2 = p2)
}

makeAinv <- function(pedigree, f = NULL, ggroups = NULL, fuzz = NULL, gOnTop = FALSE,
                     det = TRUE, ...) {
  if (!is.null(f) || !is.null(fuzz) || isTRUE(gOnTop))
    stop("shim: makeAinv só aceita f = NULL, fuzz = NULL e gOnTop = FALSE")
  P <- .shim_ler_ped_nadiv(pedigree)
  if (is.null(ggroups)) {
    s <- .shim_posicoes(P$p1, P$ids)
    d <- .shim_posicoes(P$p2, P$ids)
    r <- .shim_Ainv(s, d)
    return(list(Ainv = .shim_esparsa(r$Ainv, P$ids), f = r$F))
  }
  if (length(ggroups) != 1) stop("shim: ggroups deve ser o número de grupos (linhas do topo)")
  k <- as.integer(ggroups)
  grupos <- P$ids[seq_len(k)]
  animais <- P$ids[-seq_len(k)]
  ordem <- c(animais, grupos)                       # gOnTop = FALSE: grupos no fim
  p1 <- P$p1[-seq_len(k)]
  p2 <- P$p2[-seq_len(k)]
  s <- .shim_posicoes(p1, ordem)
  d <- .shim_posicoes(p2, ordem)
  n <- length(animais)
  # A e F só entre animais (grupo = pai desconhecido)
  s_a <- ifelse(!is.na(s) & s <= n, s, NA)
  d_a <- ifelse(!is.na(d) & d <= n, d, NA)
  base <- .shim_Ainv(s_a, d_a)
  td <- .shim_T_D(s, d, base$F, n_colunas = n + k)
  Astar <- t(td$Ti) %*% diag(1 / td$d, n) %*% td$Ti
  Q <- ggcontrib(pedigree)
  erro <- max(abs(Astar[1:n, 1:n] - base$Ainv), abs(Astar[1:n, n + 1:k] + base$Ainv %*% Q))
  if (erro > 1e-9) stop("shim: A* de grupos não confere com A⁻¹ e Q (", erro, ")")
  list(Ainv = .shim_esparsa(Astar, ordem), f = base$F)
}

ggcontrib <- function(pedigree, ggroups = NULL, fuzz = NULL, output = "matrix") {
  if (!is.null(ggroups) || !is.null(fuzz)) stop("shim: ggcontrib só aceita ggroups = NULL")
  P <- .shim_ler_ped_nadiv(pedigree)
  e_grupo <- is.na(P$p1) & is.na(P$p2)
  grupos <- P$ids[e_grupo]
  Q <- matrix(0, length(P$ids), length(grupos), dimnames = list(P$ids, grupos))
  for (i in seq_along(P$ids)) {
    if (e_grupo[i]) {
      Q[i, P$ids[i]] <- 1
      next
    }
    for (p in c(P$p1[i], P$p2[i])) {
      if (is.na(p)) stop("shim: com grupos, todo animal precisa de pai e mãe (ou grupo)")
      j <- match(as.character(p), P$ids)
      if (is.na(j) || j >= i) stop("shim: pais antes dos filhos")
      Q[i, ] <- Q[i, ] + 0.5 * Q[j, ]
    }
  }
  Q[!e_grupo, , drop = FALSE]
}

makeD <- function(pedigree, parallel = FALSE, ncores = 1, invertD = TRUE, returnA = FALSE,
                  det = TRUE, verbose = TRUE) {
  P <- .shim_ler_ped_nadiv(pedigree)
  s <- .shim_posicoes(P$p1, P$ids)
  d <- .shim_posicoes(P$p2, P$ids)
  A <- .shim_A_tabular(s, d)
  n <- length(P$ids)
  a <- function(i, j) if (is.na(i) || is.na(j)) 0 else A[i, j]
  D <- diag(n)
  for (i in seq_len(n)) for (j in seq_len(n)) if (i != j) {
    D[i, j] <- 0.25 * (a(s[i], s[j]) * a(d[i], d[j]) + a(s[i], d[j]) * a(d[i], s[j]))
  }
  out <- list(D = .shim_esparsa(D, P$ids, simetrica = TRUE))
  if (invertD) out$Dinv <- .shim_esparsa(solve(D), P$ids)
  if (returnA) out$A <- .shim_esparsa(A, P$ids, simetrica = TRUE)
  out
}
