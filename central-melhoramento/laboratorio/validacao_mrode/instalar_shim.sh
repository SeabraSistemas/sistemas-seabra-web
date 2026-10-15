#!/usr/bin/env bash
# Instala o shim (shim_pedigreemm_nadiv.R) como dois pacotes mínimos, "pedigreemm" e "nadiv",
# numa biblioteca própria. NÃO são os pacotes do CRAN: substituem só o que os scripts de
# github.com/MrodesBook/Examples_R usam. Uso: instalar_shim.sh <pasta da biblioteca>
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
LIB="${1:?uso: instalar_shim.sh <pasta da biblioteca>}"
CONSTR="$(mktemp -d)"
mkdir -p "$LIB"

criar() {  # $1 = nome, $2 = NAMESPACE, $3 = Depends extra
  local p="$CONSTR/$1"
  mkdir -p "$p/R"
  cp "$AQUI/shim_pedigreemm_nadiv.R" "$p/R/shim.R"
  cat > "$p/DESCRIPTION" <<EOF
Package: $1
Version: 0.0.0.9000
Title: Shim of $1 for the Mrode et al. (2023) R examples (NOT the CRAN package)
Description: Implements only pedigree/getA/getAInv (pedigreemm) and makeAinv/ggcontrib/makeD
    (nadiv) as used by github.com/MrodesBook/Examples_R. See shim_pedigreemm_nadiv.R.
License: file LICENSE
Depends: R (>= 4.0)$3
Imports: Matrix, methods
EOF
  echo "Shim local, sem distribuição." > "$p/LICENSE"
  printf '%s\n' "$2" > "$p/NAMESPACE"
  R CMD INSTALL --no-test-load --library="$LIB" "$p" >/dev/null
}

# O pedigreemm original anexa o Matrix (Depends), e os scripts contam com isso.
criar pedigreemm 'importFrom(methods, new, is, setClass, representation, as)
exportClasses(pedigree)
export(pedigree, getA, getAInv)' ', Matrix'
criar nadiv 'importFrom(methods, new, is, setClass, representation, as)
export(makeAinv, ggcontrib, makeD)' ''
rm -rf "$CONSTR"
echo "shim instalado em $LIB"
