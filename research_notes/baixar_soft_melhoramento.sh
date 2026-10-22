#!/bin/bash
# baixar_soft_melhoramento.sh
# Baixa direto pelo Terminal (curl) os documentos e fontes da lista, em
#   ~/Downloads/soft melhoramento/{blupf90,cran,icar}
# Só sites oficiais (nce.ads.uga.edu, cran.r-project.org, icar.org, wiki.icar.org).
# Nunca apaga nada. Nunca desliga a verificação de certificado.
#
# Uso:
#   chmod +x baixar_soft_melhoramento.sh
#   ./baixar_soft_melhoramento.sh              # essenciais (cerca de 100 MB)
#   ./baixar_soft_melhoramento.sh completo     # + todos os anais ICAR (centenas de MB)
#   ./baixar_soft_melhoramento.sh binarios     # + programas BLUPF90 para macOS e Linux
# Pode misturar: ./baixar_soft_melhoramento.sh completo binarios
#
# Licença do BLUPF90 (resumo do que a wiki informa; confirme em
# https://nce.ads.uga.edu/wiki/doku.php?id=condition_of_use): grátis para pesquisa,
# com citação; uso comercial exige contato com os autores (UGA).

set -u
BASE="$HOME/Downloads/soft melhoramento"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
OK=(); FALHOU=()
COMPLETO=0; BINARIOS=0
for a in "$@"; do
  [ "$a" = "completo" ] && COMPLETO=1
  [ "$a" = "binarios" ] && BINARIOS=1
done
mkdir -p "$BASE/blupf90" "$BASE/cran" "$BASE/icar"

# baixa <subpasta> <nome_do_arquivo> <url>
baixa() {
  local sub="$1" nome="$2" url="$3" dest="$BASE/$1/$2"
  if [ -s "$dest" ]; then OK+=("$sub/$nome (já existia)"); return; fi
  if curl -fL --retry 2 --connect-timeout 20 --max-time 600 -A "$UA" -sS -o "$dest.parcial" "$url"; then
    mv "$dest.parcial" "$dest"
    local tam; tam=$(wc -c < "$dest" | tr -d ' ')
    if [ "$tam" -lt 1500 ]; then
      FALHOU+=("$sub/$nome: arquivo com só $tam bytes (provável página de erro) <- $url")
    else
      OK+=("$sub/$nome ($tam bytes)")
    fi
  else
    rm -f "$dest.parcial"
    FALHOU+=("$sub/$nome <- $url")
  fi
}

U=https://nce.ads.uga.edu/wiki/lib/exe/fetch.php?media
echo "== BLUPF90 (documentos)"
baixa blupf90 CCB99_bul20_5.pdf                    "$U=bul20_5.pdf"
baixa blupf90 BGF90_WCGALP_28-07.pdf               "$U=28-07.pdf"
baixa blupf90 reliable_computing_variance_components.pdf "$U=reliable_computing.pdf"
baixa blupf90 single_step_8.pdf                    "$U=single_step_8.pdf"
baixa blupf90 manual_blupf90_all.pdf               "$U=blupf90_all.pdf"
baixa blupf90 manual_imisztal_philosophy.pdf       "$U=imisztal.pdf"
baixa blupf90 manual_tutorial_blupf90.pdf          "$U=tutorial_blupf90.pdf"
baixa blupf90 manual_blupf90_legacy.pdf            "$U=blupf90.pdf"
baixa blupf90 manual_remlf90.pdf                   "$U=remlf90.pdf"
baixa blupf90 manual_example_genomic.pdf           "$U=example_genomic.pdf"
baixa blupf90 manual_denseop.pdf                   "$U=denseop.pdf"
baixa blupf90 manual_sparse90.pdf                  "$U=sparse90.pdf"
baixa blupf90 manual_fspak.pdf                     "$U=fspak.pdf"
baixa blupf90 course11_fortran95_notes.pdf         "http://nce.ads.uga.edu/~ignacy/course11.pdf"
baixa blupf90 wiki_condition_of_use.html           "https://nce.ads.uga.edu/wiki/doku.php?id=condition_of_use"
baixa blupf90 wiki_start.html                      "https://nce.ads.uga.edu/wiki/doku.php?id=start"

if [ "$BINARIOS" = 1 ]; then
  echo "== BLUPF90 (programas)"
  PROGS="blupf90+ gibbsf90+ idsolf90 inbupgf90 postgibbsf90 postGSf90 predf90 predictf90 preGSf90 qcf90 renumf90 rrmebvf90 seekparentf90 validationf90"
  for p in $PROGS; do
    baixa blupf90 "linux64_$p" "https://nce.ads.uga.edu/html/projects/programs/Linux/64bit/$p"
    baixa blupf90 "macos64_$p" "https://nce.ads.uga.edu/html/projects/programs/Mac_OSX/64bit/$p"
  done
  baixa blupf90 linux64_gammaf90 "https://nce.ads.uga.edu/html/projects/programs/Linux/64bit/gammaf90"
fi

echo "== CRAN (fontes e manuais)"
C=https://cran.r-project.org
baixa cran pedigreemm_0.3-5.tar.gz  "$C/src/contrib/pedigreemm_0.3-5.tar.gz"
baixa cran pedigreemm_manual.pdf    "$C/web/packages/pedigreemm/pedigreemm.pdf"
baixa cran nadiv_2.18.0.tar.gz      "$C/src/contrib/nadiv_2.18.0.tar.gz"
baixa cran nadiv_manual.pdf         "$C/web/packages/nadiv/nadiv.pdf"
baixa cran AGHmatrix_3.0.3.tar.gz   "$C/src/contrib/AGHmatrix_3.0.3.tar.gz"
baixa cran AGHmatrix_manual.pdf     "$C/web/packages/AGHmatrix/AGHmatrix.pdf"
baixa cran sommer_4.4.87.tar.gz     "$C/src/contrib/sommer_4.4.87.tar.gz"
baixa cran sommer_manual.pdf        "$C/web/packages/sommer/sommer.pdf"
baixa cran MCMCglmm_2.36.tar.gz     "$C/src/contrib/MCMCglmm_2.36.tar.gz"
baixa cran MCMCglmm_manual.pdf      "$C/web/packages/MCMCglmm/MCMCglmm.pdf"

echo "== ICAR (normas, planilhas, congressos)"
W=https://wiki.icar.org/index.php
baixa icar section16_dairy_sheep_and_goats.html   "$W/Section_16_%E2%80%93_Dairy_Sheep_and_Goats"
baixa icar section02_cattle_milk_recording.html   "$W/Section_02_%E2%80%93_Cattle_Milk_Recording"
baixa icar section05_conformation_recording.html  "$W/Section_05_%E2%80%93_Conformation_Recording"
baixa icar section15_data_exchange.html           "$W/Section_15_%E2%80%93_Data_Exchange"
baixa icar section09_dairy_genetic_evaluation.html "$W/Section_09_%E2%80%93_Dairy_Cattle_Genetic_Evaluation"
baixa icar section17_buffalo_milk_recording.html  "$W/Section_17_%E2%80%93_Buffalo_Milk_Recording"
G=https://www.icar.org/Guidelines
baixa icar section16_legado.pdf                   "$G/16-Dairy-Sheep-and-Goats.pdf"
baixa icar section21_legado.pdf                   "$G/21-Meat-reproduction-and-maternal-traits-in-sheep-and-goats.pdf"
baixa icar section15_legado.pdf                   "$G/15-Data-Exchange.pdf"
baixa icar section02_procedure1_24h_yield.pdf     "$G/02-Procedure-1-Computing-24-Hour-Yield.pdf"
baixa icar section02_procedure2_lactation_yield.pdf "$G/02-Procedure-2-Computing-Lactation-Yield.pdf"
baixa icar ata_interlaken_2002_metodo_E.pdf       "$G/Minutes_28_5_2002-Interlaken-Method-E.pdf"
baixa icar planilha_Jenko_amostra_unica.xlsx      "$G/Calculation-daily-yield-from-single-sample-by-Jenko.xlsx"
baixa icar planilha_Gerke_gordura.xlsx            "$G/Calculation-daily-fat-percentage-from-single-sample-by-Gerke.xlsx"
D=https://www.icar.org/wp-content/uploads/documents
baixa icar planilha_DeLorenzo_2x.xlsx             "$D/Open_DeLorenzo-APP-2x-milking-english.xlsx"
baixa icar planilha_DeLorenzo_3x.xlsx             "$D/Open_DeLorenzo-APP-3x-milking-english.xlsx"
baixa icar planilha_Liu_AT.xlsx                   "$D/Open_AT-calculation-Liu.xlsx"
V=https://www.icar.org/Documents/Verona-2026
baixa icar verona2026_BWYPEX_resumo.pdf           "$V/Abstracts/TS12_van%20Leerdam.pdf"
baixa icar verona2026_BWYPEX_slides.pdf           "$V/Presentations/TS12_02_van_Leerdam.pdf"
baixa icar verona2026_MilkBot_slides.pdf          "$V/Presentations/TS12_05_Trapanese.pdf"
baixa icar verona2026_Lagarde_slides.pdf          "$V/Presentations/TS12_01_Lagarde.pdf"
baixa icar verona2026_conformacao_ovinos_resumo.pdf "$V/Abstracts/TS07_Spehar.pdf"
baixa icar verona2026_conformacao_ovinos_slides.pdf "$V/Presentations/TS07_02_Spehar.pdf"
baixa icar verona2026_ICAR_ADE_caprinos_resumo.pdf "$V/Abstracts/TS07_Ammerlaan-Sieperda.pdf"
baixa icar verona2026_genomica_Salaris_resumo.pdf "$V/Abstracts/TS07_Salaris.pdf"
baixa icar verona2026_multinacional_ovinos_Aldridge_resumo.pdf "$V/Abstracts/TS07_Aldridge.pdf"
baixa icar verona2026_livro_de_resumos.pdf        "$D/Book-of-abstracts-2026.pdf"
T=https://www.icar.org/Documents/technical_series
baixa icar bled2024_Herold_conformacao_cabras.pdf "$T/ICAR-Technical-Series-no-28-Bled/Herold.pdf"
baixa icar bled2024_Spehar_genomica_ovinos.pdf    "$T/ICAR-Technical-Series-no-28-Bled/Spehar.pdf"
baixa icar bled2024_Astruc_nematodeos.pdf         "$T/ICAR-Technical-Series-no-28-Bled/Astruc.pdf"
baixa icar bled2024_FuerstWaltl_longevidade.pdf   "$T/ICAR-Technical-Series-no-28-Bled/Fuerst-Waltl.pdf"
baixa icar bled2024_Sen_prolificidade.pdf         "$T/ICAR-Technical-Series-no-28-Bled/Sen.pdf"
baixa icar auckland2018_Monteiro_identificacao_Brasil.pdf "$T/ICAR-Technical-Series-no-23-Auckland/Monteiro.pdf"
baixa icar auckland2018_Salaris_Sarda.pdf         "$T/ICAR-Technical-Series-no-23-Auckland/Salaris.pdf"
baixa icar auckland2018_Cesarani_acidos_graxos.pdf "$T/ICAR-Technical-Series-no-23-Auckland/Cesarani.pdf"
baixa icar technical_series_28_Bled2024.pdf       "$D/ICAR-Technical-Series-28-Bled-2024-Proceedings.pdf"
baixa icar technical_series_23_Auckland2018.pdf   "$D/ICAR-Technical-Series-23-Auckland-2018-Proceedings.pdf"
baixa icar pesquisa_registro_leite_2024_2025.pdf  "$D/Survey-on-milk-recording-systems-in-cows-sheep-and-goats-2024-and-2025.pdf"
baixa icar pesquisa_ovinos_caprinos_2026.pdf      "$D/Dairy-Sheep-Goat-Survey-2026.pdf"
baixa icar pesquisa_caprinos_2012_2013.pdf        "$D/Goat-Survey-2012-2013.pdf"
baixa icar pesquisa_ovinos_2012_2013.pdf          "$D/Sheep-Survey-2012-2013.pdf"
baixa icar chave_saude_Claw_Health_Key_2018.xls   "$D/ICAR-Claw-Health-Key-coding-20180921.xls"
baixa icar chave_saude_Central_Health_Key_2018.xls "$D/ICAR-Central-Health-Key-2018-addinfo-20180921.xls"
baixa icar diretrizes_parentesco_SNP_2025.pdf     "$D/Guidelines-for-Parentage-Verification-and-Parentage-Discovery-Based-on-SNP-Genotypes-October-2025.pdf"

if [ "$COMPLETO" = 1 ]; then
  echo "== ICAR (todos os anais)"
  for par in "29:ICAR-Technical-Series-no-29-Anand.pdf" "27:ICAR-Technical-Series-27-Toledo-2023-Proceedings.pdf" \
    "26:ICAR-Technical-Series-26-Montreal-2022-Proceedings.pdf" "25:ICAR-Technical-Series-25-virtual-meeting-2021-Proceedings.pdf" \
    "24:ICAR-Technical-Series-24-Prague-2019-Proceedings.pdf" "22:ICAR-Technical-Series-22-Edinburgh-2018-Proceedings.pdf" \
    "21:ICAR-Technical-Series-21-Puerto-Varas-2017-Proceedings.pdf" "19:ICAR-Technical-Series-19-Krakow-2015-Proceedings.pdf" \
    "18:ICAR_Claw_Health_Atlas.pdf" "17:tec_series_17_Aarhus.pdf" "16:tec_series_16_Cork.pdf" \
    "15:tec_series_15_Santiago_Chile.pdf" "14:tec_series_14_Riga.pdf" "13:tec_series_13_Niagara.pdf" \
    "12:tec_series_12_kuopio.pdf" "11:tec_series_11_sousse.pdf" "10:tec_series_10_nitra.pdf" "09:tec_series_09_sousse.pdf" \
    "08:tec_series_08_interlaken.pdf" "07:tec_series_07_nitra.pdf" "06:tec_series_06.pdf" "05:tec_series_05_bled_breeders.pdf" \
    "04:tec_series_04_bled_buffalo.pdf" "03:tec_series_03_bella.pdf" "02:tec_series_02_warsaw.pdf" "01:tec_series_01_anand.pdf"; do
    baixa icar "technical_series_${par%%:*}.pdf" "$D/${par#*:}"
  done
fi

echo
echo "================ RESUMO ================"
echo "Baixados ou já existentes: ${#OK[@]}"
echo "Falharam: ${#FALHOU[@]}"
for f in "${FALHOU[@]:-}"; do [ -n "$f" ] && echo "  - $f"; done
{
  echo "# Inventário do que foi baixado em $(date +%Y-%m-%d)"
  echo; echo "## Baixados"; for o in "${OK[@]:-}"; do [ -n "$o" ] && echo "- $o"; done
  echo; echo "## Falharam"; for f in "${FALHOU[@]:-}"; do [ -n "$f" ] && echo "- $f"; done
} > "$BASE/INVENTARIO_DOWNLOAD.md"
echo "Pasta: $BASE"
echo "Lista salva em: $BASE/INVENTARIO_DOWNLOAD.md"
