#!/usr/bin/env bash
# Roda os 24 scripts oficiais de Mrode et al. (2023) com o shim de pedigreemm/nadiv, numa CÓPIA de
# trabalho (nunca na pasta de origem), e grava em <trabalho>/saidas:
#   <script>.txt   stdout + stderr do Rscript (a saída impressa do exemplo)
#   <script>.json  objetos numéricos do script, com 17 algarismos (despejar.R)
#   resumo.tsv     código de saída de cada script
# Depois roda a variante do modelo de touro com A_s = I (variante_touro_sem_parentesco.R).
#
# Uso: rodar_scripts.sh <pasta Examples_R> <pasta de trabalho>
#   git clone https://github.com/MrodesBook/Examples_R   (a pasta Content/ tem os scripts)
# Requer R com Matrix, MASS, tidyverse e orthopolynom (Ubuntu: r-base-core r-cran-tidyverse
# r-cran-mass r-cran-orthopolynom r-cran-matrix). Leia os scripts antes de rodá-los.
set -uo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
ORIGEM="$(cd "${1:?uso: rodar_scripts.sh <Examples_R> <trabalho>}" && pwd)"
TRAB="$(mkdir -p "${2:?uso: rodar_scripts.sh <Examples_R> <trabalho>}" && cd "$2" && pwd)"
rm -rf "$TRAB/scripts" "$TRAB/saidas" "$TRAB/lib"
mkdir -p "$TRAB/scripts" "$TRAB/saidas"
# os scripts podem estar na raiz ou em Content/Chapter_XX/
find "$ORIGEM" -type f \( -name 'Chapter_*.R' -o -name '*_fja.R' -o -name 'ped_snp.txt' \) -exec cp {} "$TRAB/scripts/" \;
bash "$AQUI/instalar_shim.sh" "$TRAB/lib"
export R_LIBS="$TRAB/lib"
SAIDAS="$TRAB/saidas"
printf 'script\tcodigo_rscript\tcodigo_despejo\n' > "$SAIDAS/resumo.tsv"
cd "$TRAB/scripts"
for s in Chapter_*.R; do
  nome="${s%.R}"
  Rscript "$s" > "$SAIDAS/$nome.txt" 2>&1
  c1=$?
  Rscript "$AQUI/despejar.R" "$s" "$SAIDAS/$nome.json" > "$SAIDAS/$nome.despejo.log" 2>&1
  c2=$?
  printf '%s\t%s\t%s\n' "$nome" "$c1" "$c2" >> "$SAIDAS/resumo.tsv"
done
Rscript "$AQUI/variante_touro_sem_parentesco.R" "$SAIDAS/variante_touro_sem_parentesco.json" \
  > "$SAIDAS/variante_touro_sem_parentesco.txt" 2>&1
cat "$SAIDAS/resumo.tsv"
