# Variante MINHA (não oficial) do Exemplo 4.2 de Mrode et al. (2023), script Chapter_04_1.R:
# o mesmo modelo de touro, mas com touros NÃO aparentados (A_s = I no lugar de A_s⁻¹), que é a
# suposição de blup.modelo_touro. Isola a causa da diferença entre o motor e o script oficial.
# Roda o script oficial (na cópia de trabalho, diretório corrente) e reaproveita as matrizes dele.
# Uso (chamado por rodar_scripts.sh): Rscript variante_touro_sem_parentesco.R <saida.json>
args <- commandArgs(trailingOnly = TRUE)
amb <- new.env()
sink(tempfile()); sys.source("Chapter_04_1.R", envir = amb, toplevel.env = amb); sink()
with(amb, {
  LHS_I <- rbind(cbind(XpX, XpZ), cbind(ZpX, ZpZ + diag(ncol(ZpZ)) * alpha))
  sol_I <- solve(LHS_I, rbind(Xpy, Zpy))
  CI <- solve(LHS_I)
  print(round(sol_I, 3))
  v <- function(x) paste(sprintf("%.17g", as.numeric(x)), collapse = ",")
  writeLines(sprintf('{"solucoes": [%s], "diag_C_touros": [%s], "alpha": %.17g}',
                     v(sol_I), v(diag(CI)[3:5]), alpha), args[1])
})
