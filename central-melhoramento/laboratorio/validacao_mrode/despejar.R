# Executa um script de Mrode et al. (2023) num ambiente próprio e grava os objetos numéricos
# (vetores, matrizes base e Matrix) num JSON com 17 algarismos significativos, para a comparação
# com o motor Python. Uso: Rscript despejar.R <script.R> <saida.json>
args <- commandArgs(trailingOnly = TRUE)
script <- args[1]
destino <- args[2]
amb <- new.env(parent = globalenv())
sink(tempfile())                                   # a saída impressa já está em <script>.txt
res <- try(sys.source(script, envir = amb, toplevel.env = amb), silent = TRUE)
sink()
if (inherits(res, "try-error")) cat("ERRO no script:", conditionMessage(attr(res, "condition")), "\n")

num <- function(v) {
  v <- as.numeric(v)
  ifelse(is.na(v), "null", sprintf("%.17g", v))
}
txt <- function(v) if (is.null(v)) "null" else paste0("[", paste0('"', gsub('"', "", v), '"', collapse = ","), "]")

partes <- character(0)
for (nome in sort(ls(amb))) {
  x <- get(nome, envir = amb)
  if (methods::is(x, "Matrix")) x <- as.matrix(x)
  if (is.data.frame(x)) {
    numericas <- vapply(x, is.numeric, logical(1))
    if (!any(numericas)) next
    x <- as.matrix(x[, numericas, drop = FALSE])
  }
  if (!(is.numeric(x) || is.logical(x)) || is.factor(x) || length(x) == 0 || length(x) > 5000) next
  if (is.matrix(x)) {
    item <- sprintf('"%s": {"dim": [%d, %d], "linhas": %s, "colunas": %s, "valores": [%s]}',
                    nome, nrow(x), ncol(x), txt(rownames(x)), txt(colnames(x)),
                    paste(num(t(x)), collapse = ","))   # valores por linha
  } else {
    item <- sprintf('"%s": {"dim": [%d], "nomes": %s, "valores": [%s]}',
                    nome, length(x), txt(names(x)), paste(num(x), collapse = ","))
  }
  partes <- c(partes, item)
}
writeLines(paste0("{\n", paste(partes, collapse = ",\n"), "\n}"), destino)
cat("objetos gravados:", length(partes), "\n")
