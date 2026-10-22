"""Gera vetores_teste.json: pares de entrada e saída calculados por este pacote, para validar as
futuras calculadoras em JavaScript/TypeScript (Edge Functions) e Dart (SeabraApp).

Uso:  python3 gerar_vetores_teste.py        (reescreve vetores_teste.json nesta pasta)

Cada vetor tem:
    id        identificador estável
    funcao    "modulo.funcao" do pacote melhoramento
    entrada   argumentos nomeados, só com tipos JSON (listas no lugar de tuplas, null no lugar de NaN)
    saida     resultado do pacote, convertido para JSON (dataclass → objeto; tupla → lista)
    fonte     relatório e exemplo de onde vem o caso
A porta deve reproduzir `saida` com erro relativo de até `tolerancia_relativa`. O teste
tests/test_vetores.py confere que o arquivo continua igual ao que o pacote calcula.
"""

from __future__ import annotations

import dataclasses
import importlib
import json
import math
from datetime import date
from pathlib import Path

import numpy as np

import melhoramento
from melhoramento import blup, parentesco
from melhoramento.ganho import intensidade_selecao

ARQUIVO = Path(__file__).resolve().parent / "vetores_teste.json"
TOLERANCIA_RELATIVA = 1e-9

CORTE, LEITE = "relatório de bovinos de corte", "relatório de bovinos leiteiros"
CAPRINOS, OVINOS = "relatório de caprinos leiteiros", "relatório de ovinos leiteiros"
ICAR16 = "ICAR Seção 16 (wiki, conferida em 22/10/2026)"
MRODE = "Mrode et al. (2023), 4ª ed., script oficial"

# Pedigrees com identificadores em texto e "0" para pai ou mãe desconhecidos.
PED_CORTE = {"1": ["0", "0"], "2": ["0", "0"], "3": ["0", "0"], "4": ["1", "2"], "5": ["1", "3"],
             "6": ["4", "5"], "7": ["4", "3"], "8": ["4", "0"]}
PED_CORTE_ESTENDIDO = {**PED_CORTE, "9": ["6", "3"], "10": ["6", "0"], "11": ["6", "7"]}
PED_CAPRINOS = {"B1": ["0", "0"], "D1": ["0", "0"], "D2": ["0", "0"], "D3": ["0", "0"],
                "B2": ["B1", "D1"], "C1": ["B1", "D1"], "C2": ["B1", "D2"], "C3": ["B1", "D3"],
                "B3": ["0", "0"], "C4": ["B3", "D2"], "C5": ["B2", "C2"], "B4": ["B3", "C1"],
                "B5": ["0", "0"]}
DEL_VACA = [12, 42, 73, 101, 133, 162, 194, 224, 255, 286]
LEITE_VACA = [24.0, 29.5, 30.2, 28.6, 27.1, 25.0, 23.4, 21.2, 19.5, 17.6]
GORD_VACA = [3.9, 3.5, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2]
DIAS_CABRA = [10, 40, 70, 100, 130, 160, 190, 220, 250, 280]
LEITE_CABRA = [2.63, 2.9, 3.0, 2.66, 2.62, 2.31, 2.04, 1.94, 1.61, 1.51]
DIAS_OVELHA = [40, 70, 100, 130, 160, 190]
LEITE_OVELHA = [2.15, 1.73, 1.5, 1.13, 0.96, 0.72]


def casos() -> list[dict]:
    """Lista de casos (sem a saída). A ordem e os ids são estáveis."""
    c: list[dict] = []

    def caso(id_, funcao, fonte, **entrada):
        c.append({"id": id_, "funcao": funcao, "entrada": entrada, "fonte": fonte})

    # --- parentesco
    caso("parentesco.A_corte", "parentesco.matriz_A", f"{CORTE}, Passo 1", ped=PED_CORTE)
    caso("parentesco.Ainv_corte", "parentesco.inversa_A", f"{CORTE}, Passo 1", ped=PED_CORTE)
    caso("parentesco.Ainv_quaas", "parentesco.inversa_A", f"{CORTE}, Passo 1 (pedigree estendido)",
         ped=PED_CORTE_ESTENDIDO)
    caso("parentesco.F_corte_estendido", "parentesco.coeficientes_F", f"{CORTE}, Passo 1",
         ped=PED_CORTE_ESTENDIDO)
    caso("parentesco.F_B2xC5", "parentesco.F_acasalamento", f"{CAPRINOS}, Exemplo 8",
         ped=PED_CAPRINOS, pai="B2", mae="C5")
    caso("parentesco.tabela_caprinos", "parentesco.tabela_F_acasalamentos", f"{CAPRINOS}, Exemplo 8",
         ped=PED_CAPRINOS, machos=["B2", "B4", "B5"], femeas=["D1", "C1", "C2", "C3", "C4", "C5"])
    caso("parentesco.escolha_caprinos", "parentesco.escolher_reprodutores", f"{CAPRINOS}, Exemplo 8",
         ped=PED_CAPRINOS, femeas=["D1", "C1", "C2", "C3", "C4", "C5"], machos=["B2", "B4", "B5"],
         limite_F=0.0625)
    for nm, nf in ((3, 100), (1, 20), (5, 100), (13, 1000)):
        caso(f"parentesco.ne_{nm}x{nf}", "parentesco.ne_wright", f"{OVINOS}, Exemplo 7; {CAPRINOS}, Exemplo 8",
             n_machos=nm, n_femeas=nf)
    caso("parentesco.dF_ne_11_65", "parentesco.delta_F", f"{OVINOS}, Exemplo 7", ne=4 * 3 * 100 / 103)
    caso("parentesco.F_5_geracoes", "parentesco.F_acumulado", f"{CAPRINOS}, Exemplo 8",
         df=1 / 8 + 1 / 160, geracoes=5)
    caso("parentesco.F_10_anos", "parentesco.F_acumulado", f"{CAPRINOS}, Exemplo 8",
         df=1 / 8 + 1 / 160, geracoes=10 / 3)
    caso("parentesco.pais_efetivos", "parentesco.numero_efetivo_pais", f"{OVINOS}, Exemplo 7",
         proporcoes=[0.55, 0.25, 0.15, 0.05])
    caso("parentesco.machos_ne_50", "parentesco.n_machos_para_ne", f"{CAPRINOS}, Exemplo 8",
         ne_alvo=50, n_femeas=1000)

    # --- blup
    animais, y, gc = ["4", "5", "6", "7", "8"], [212.0, 198.0, 225.0, 204.0, 196.0], ["2022", "2022", "2024", "2024", "2024"]
    caso("blup.modelo_animal_corte", "blup.modelo_animal", f"{CORTE}, Passos 2 e 3",
         ped=PED_CORTE, animais=animais, y=y, grupos=gc, sigma2_a=100.0, sigma2_e=300.0)
    caso("blup.direto_materno_corte", "blup.modelo_direto_materno", f"{CORTE}, modelo direto-materno",
         ped=PED_CORTE, animais=animais, maes=["2", "3", "5", "3", "0"], y=y, grupos=gc,
         G0=[[100.0, -15.0], [-15.0, 40.0]], sigma2_pe=30.0, sigma2_e=230.0)
    caso("blup.bicaracteristica_corte", "blup.modelo_multicaracteristica", f"{CORTE}, multicaracterística",
         ped=PED_CORTE, animais=animais, Y=[[212, 305], [198, 290], [225, 330], [204, 300], [196, None]],
         grupos=gc, G0=[[100, 105], [105, 225]], R0=[[300, 100], [100, 400]], caracteristicas=["PD", "PS"])
    caso("blup.rel_bode_IA", "blup.rel_exata_modelo_touro", f"{CAPRINOS}, Exemplo 3",
         rebanhos=[{"X": 2, "Z": 10}] * 15, h2=0.20, rel_externa={"Z": 0.90})
    caso("blup.rel_carneiro_local", "blup.rel_exata_modelo_touro", f"{OVINOS}, Exemplo 4",
         rebanhos=[{"X": 10, "Y": 10}], h2=0.30)
    dados = [["A", "X", v] for v in (30, -40, 50, -40)] + [["A", "Y", v] for v in (90, 20, 110, 20)] + \
            [["B", "X", v] for v in (-10, 15, -5, 0)] + [["B", "Z", v] for v in (40, 25, 50, 25)]
    caso("blup.touro_sem_ajuste", "blup.modelo_touro", f"{OVINOS}, Exemplo 2", registros=dados, h2=0.30)
    caso("blup.touro_com_ajuste", "blup.modelo_touro", f"{OVINOS}, Exemplo 2", registros=dados, h2=0.30,
         fator_escala={"A": 64.5 / 95.0, "B": 64.5 / 40.0})
    caso("blup.pc_68", "blup.possible_change", f"{CORTE}, Possible Change", acuracia_bif=0.70, sigma_a=16.48)
    caso("blup.pc_95", "blup.possible_change", f"{CORTE}, Possible Change", acuracia_bif=0.70, sigma_a=16.48, t=2)
    caso("blup.pc_r", "blup.possible_change_de_r", f"{CORTE}, tabela da ANCP", r=0.70, sigma_a=16.48)
    caso("blup.hva", "blup.ajuste_hva", f"{LEITE}, ajuste de variância heterogênea",
         desvio=900, dp_rebanho=1800, dp_base=1500)

    # --- Mrode et al. (2023): casos conferidos contra os scripts R oficiais (tests/test_mrode.py)
    ped4 = {"1": ["0", "0"], "2": ["0", "0"], "3": ["0", "0"], "4": ["1", "0"], "5": ["3", "2"],
            "6": ["1", "2"], "7": ["4", "5"], "8": ["3", "6"]}
    ped4_grupos = {**ped4, "1": ["G9", "G10"], "2": ["G9", "G10"], "3": ["G9", "G10"], "4": ["1", "G10"]}
    ped5 = {"1": ["0", "0"], "2": ["0", "0"], "3": ["0", "0"], "4": ["1", "2"], "5": ["3", "2"],
            "6": ["1", "5"], "7": ["3", "4"], "8": ["1", "7"]}
    ped52 = {**{str(i): ["0", "0"] for i in range(1, 6)},
             **{str(i): ["1", "2"] for i in (6, 7, 8)}, **{str(i): ["3", "4"] for i in (9, 10, 11, 12)},
             **{str(i): ["1", "5"] for i in (13, 14, 15)}}
    animais4, sexo4, wwg4 = ["4", "5", "6", "7", "8"], ["M", "F", "F", "M", "M"], [4.5, 2.9, 3.9, 3.5, 5.0]
    caso("parentesco.Ainv_mrode_5_1", "parentesco.inversa_A", f"{MRODE}, Exemplo 5.1 (Chapter_05_1.R)",
         ped=ped5)
    caso("parentesco.Ainv_grupos_mrode_4_4", "parentesco.inversa_A_grupos",
         f"{MRODE}, Exemplo 4.4 (Chapter_04_3.R)", ped=ped4_grupos, grupos=["G9", "G10"])
    caso("blup.modelo_animal_grupos_mrode_4_4", "blup.modelo_animal", f"{MRODE}, Exemplo 4.4 (Chapter_04_3.R)",
         ped=ped4_grupos, animais=animais4, y=wwg4, grupos=sexo4, sigma2_a=20.0, sigma2_e=40.0,
         grupos_geneticos=["G9", "G10"])
    caso("blup.modelo_animal_familia_mrode_5_2", "blup.modelo_animal", f"{MRODE}, Exemplo 5.2 (Chapter_05_2.R)",
         ped=ped52, animais=[str(i) for i in range(6, 16)], y=[90, 70, 65, 98, 106, 60, 80, 100, 85, 68],
         grupos=["M", "F", "F", "F", "M", "F", "F", "M", "F", "M"], sigma2_a=20.0, sigma2_e=65.0,
         sigma2_pe=15.0, rotulos_pe=["1", "1", "1", "2", "2", "2", "2", "3", "3", "3"])
    X4, _ = blup.montar_X(sexo4)
    Ainv4, ids4 = parentesco.inversa_A(ped4)
    Z4, _ = blup.incidencia(animais4, ids4)
    LHS4, RHS4 = blup.montar_mme(X4, Z4, np.array(wwg4), Ainv4, 2.0)
    caso("blup.gauss_seidel_mrode_19_2", "blup.gauss_seidel", f"{MRODE}, Exemplo 19.2 (Chapter_19.R)",
         LHS=LHS4.tolist(), RHS=RHS4.tolist(),
         x0=[4.333, 3.400, 0.0, 0.0, 0.0, 0.167, -0.500, 0.500, -0.833, 0.667],
         iteracoes_max=20, tolerancia=0.0, guardar_historico=True)

    # --- lactacao
    caso("lactacao.tim_vaca", "lactacao.tim", f"{LEITE}, TIM", dias=DEL_VACA, producoes=LEITE_VACA)
    caso("lactacao.gordura_vaca", "lactacao.producao_componente", f"{LEITE}, TIM",
         dias=DEL_VACA, leite=LEITE_VACA, teor_pct=GORD_VACA, fim=305)
    caso("lactacao.fleischmann_cabra", "lactacao.lactacao_pequenos_ruminantes", f"{CAPRINOS}, Exemplo 1",
         dias=DIAS_CABRA, producoes=LEITE_CABRA, especie="caprino", secagem=290, comprimento=305)
    caso("lactacao.fleischmann_cabra_6", "lactacao.lactacao_pequenos_ruminantes", f"{CAPRINOS}, Exemplo 1",
         dias=DIAS_CABRA[:6], producoes=LEITE_CABRA[:6], especie="caprino", secagem=290, comprimento=305)
    caso("lactacao.fleischmann_cabra_sem_secagem", "lactacao.lactacao_pequenos_ruminantes",
         f"{CAPRINOS}, Exemplo 1", dias=DIAS_CABRA, producoes=LEITE_CABRA, especie="caprino", comprimento=305)
    caso("lactacao.tmm_ovelha", "lactacao.lactacao_pequenos_ruminantes", f"{OVINOS}, Exemplo 1",
         dias=DIAS_OVELHA, producoes=LEITE_OVELHA, especie="ovino", secagem=200, separacao_crias=30)
    caso("lactacao.tmm_ovelha_hiato", "lactacao.lactacao_pequenos_ruminantes", f"{OVINOS}, Exemplo 1",
         dias=[40, 70, 160, 190], producoes=[2.15, 1.73, 0.96, 0.72], especie="ovino", secagem=200,
         separacao_crias=30)
    # Regras da Seção 16 da ICAR com estrito_norma=True (o padrão, sem a opção, não mudou).
    caso("lactacao.intervalo_metodo_a7", "lactacao.intervalo_medio_do_metodo", ICAR16 + ", 2.5.1",
         metodo="A7", especie="caprino")
    caso("lactacao.cabra_estrito_1o_controle_tardio", "lactacao.lactacao_pequenos_ruminantes", ICAR16 + ", 2.4.2.1",
         dias=[95, 125, 155, 185], producoes=[2.4, 2.2, 2.0, 1.8], especie="caprino", secagem=200,
         estrito_norma=True)
    caso("lactacao.cabra_estrito_hiato_a5", "lactacao.lactacao_pequenos_ruminantes", ICAR16 + ", 2.5.2",
         dias=[20, 85, 105], producoes=[2.8, 2.5, 2.3], especie="caprino", secagem=250,
         estrito_norma=True, metodo="A5")
    caso("lactacao.ovelha_estrito_sem_secagem", "lactacao.lactacao_pequenos_ruminantes",
         ICAR16 + ", 1.2.6.2 e 2.7.5 (por analogia)", dias=DIAS_OVELHA, producoes=LEITE_OVELHA, especie="ovino",
         separacao_crias=30, estrito_norma=True)
    caso("lactacao.wood_loglinear", "lactacao.ajustar_wood_loglinear", f"{LEITE}, curvas",
         dias=DEL_VACA, producoes=LEITE_VACA)
    caso("lactacao.wood_gauss_newton", "lactacao.ajustar_wood_gauss_newton", f"{LEITE}, curvas",
         dias=DEL_VACA, producoes=LEITE_VACA)
    caso("lactacao.wilmink", "lactacao.ajustar_wilmink", f"{LEITE}, curvas", dias=DEL_VACA, producoes=LEITE_VACA)
    caso("lactacao.pico_wood", "lactacao.pico_wood", f"{CAPRINOS}, Exemplo 1", a=1.55, b=0.23, c=0.0048)
    caso("lactacao.fcm4", "lactacao.fcm4", f"{LEITE}, sólidos", leite_kg=7469.4, gordura_kg=277.51715)
    caso("lactacao.ecm_3140", "lactacao.ecm", f"{LEITE}, sólidos (divisor 3,140)",
         leite_kg=7469.4, gordura_pct=3.7153874474522723, proteina_pct=3.217791254987014)
    caso("lactacao.ecm_31138", "lactacao.ecm", f"{LEITE}, sólidos (divisor 3,1138)",
         leite_kg=7469.4, gordura_pct=3.7153874474522723, proteina_pct=3.217791254987014, divisor=3.1138)
    caso("lactacao.ecs", "lactacao.ecs", f"{CAPRINOS}, células", ccs_mil_por_ml=[420, 610, 950, 1380, 2050, 3100])
    caso("lactacao.ccs_geometrica", "lactacao.ccs_media_geometrica", f"{CAPRINOS}, células",
         ccs_mil_por_ml=[420, 610, 950, 1380, 2050, 3100])
    caso("lactacao.controle_ac", "lactacao.controle_ac", f"{OVINOS}, Exemplo 1",
         ordenha_medida=1.05, tanque_total=220.0, tanque_da_ordenha_medida=132.0)

    # --- confiabilidade
    caso("confiabilidade.k_d_025", "confiabilidade.k_d", f"{LEITE}, filhas-equivalentes", h2=0.25)
    caso("confiabilidade.k_touro_020", "confiabilidade.k_touro", f"{CAPRINOS}, confiabilidade", h2=0.20)
    for n in (10, 100, 500):
        caso(f"confiabilidade.rel_{n}_filhas", "confiabilidade.rel_filhas", f"{LEITE}, filhas-equivalentes",
             n_filhas=n, h2=0.25)
    caso("confiabilidade.de_rel_070", "confiabilidade.de_de_rel", f"{CAPRINOS}, confiabilidade", rel=0.70, k=18.0)
    caso("confiabilidade.mesmo_rebanho", "confiabilidade.de_filhas_mesmo_rebanho", f"{LEITE}, Tabela 2", d=100)
    caso("confiabilidade.de_proprio_3", "confiabilidade.de_registros_proprios", f"{LEITE}, Tabela 1",
         m=3, h2=0.25, r=0.55)
    caso("confiabilidade.de_filha_5", "confiabilidade.de_filha_com_lactacoes", f"{LEITE}, Tabela 1",
         m=5, h2=0.25, r=0.55)
    caso("confiabilidade.rel_total_pa", "confiabilidade.rel_total", f"{LEITE}, tabela de REL",
         h2=0.04, de_media_pais=42.0, de_progenie=10)
    for r in (0.5, 0.9):
        caso(f"confiabilidade.bif_r_{r}", "confiabilidade.bif_de_r", f"{CORTE}, Passo 3", r=r)
    caso("confiabilidade.r_bif", "confiabilidade.r_de_bif", f"{CORTE}, Passo 3", a_bif=0.70)
    caso("confiabilidade.daetwyler", "confiabilidade.daetwyler_rel", f"{LEITE}, confiabilidade genômica",
         n_referencia=5000, h2=100 / 114, me=5000)
    caso("confiabilidade.daetwyler_n", "confiabilidade.daetwyler_n_para_rel", f"{LEITE}, confiabilidade genômica",
         rel=0.5, h2=0.04, me=5000)

    # --- indices
    caso("indices.smith_hazel", "indices.smith_hazel", f"{CORTE}, índice de seleção",
         P=[[400, 205], [205, 625]], G=[[100, 105], [105, 225]], v=[2, 4])
    v_leite = [0.05, 20, 28, 90, 60, -250]
    sd_leite = [250, 10, 7, 1.5, 1.2, 0.12]
    caso("indices.indice_A_leite", "indices.indice_economico", f"{LEITE}, índices econômicos",
         valores=v_leite, ptas=[800, 40, 27, 0.2, -1.5, 0.12])
    caso("indices.enfase_leite", "indices.enfase_relativa", f"{LEITE}, índices econômicos",
         valores=v_leite, dp_ptas=sd_leite)
    caso("indices.dp_erro_A", "indices.dp_erro_indice", f"{LEITE}, índices econômicos",
         valores=v_leite, confiabilidades=0.95, dp_ptas=sd_leite)
    caso("indices.prob_A_B", "indices.prob_superar", f"{LEITE}, índices econômicos",
         indice_a=1494.0, indice_b=1373.0, dp_erro_a=71.72212001886172, dp_erro_b=189.75889307223522)
    caso("indices.prob_pta", "indices.prob_superar_pta", "fórmula da docstring (caso construído)",
         pta_a=70, rel_a=0.6, pta_b=50, rel_b=0.9, sigma_a=89.4)
    caso("indices.mppa_corte", "indices.mppa", f"{CORTE}, MPPA", media_femea=230, n=4, r=0.33, media_rebanho=200)
    cabras = {"C1": ([150], 40, 0.60), "C2": ([120, 90, 100], 10, 0.80), "C3": ([200, 40], None, 0.0),
              "C4": ([-60], 60, 0.70), "C5": ([-80, -40, -100, -50], 20, 0.50), "C6": ([60, 80], -30, 0.60)}
    for nome, (d, pta, rel) in cabras.items():
        caso(f"indices.indice_{nome}", "indices.indice_femea", f"{CAPRINOS}, Exemplo 6",
             desvios=d, h2=0.20, r=0.36, sigma_p=200.0, pta_pai=pta, rel_pai=rel)
    caso("indices.indice_O1", "indices.indice_femea", f"{OVINOS}, Exemplo 5",
         desvios=[40], h2=0.30, r=0.41, sigma_p=60.0, pta_pai=30, rel_pai=0.90, escala_pai="EBV")
    caso("indices.indice_V5", "indices.indice_femea", f"{LEITE}, vacas do rebanho",
         desvios=[-300], h2=0.25, r=0.50, sigma_p=1600.0, pta_pai=600, rel_pai=0.95)

    # --- taxas
    for x, n in ((6, 30), (26, 30), (0, 30), (1, 20), (36, 40), (5, 50)):
        for f in ("ic_wald", "ic_wilson", "ic_exato"):
            caso(f"taxas.{f}_{x}_{n}", f"taxas.{f}", f"{LEITE}, {CAPRINOS} (Ex. 7), {OVINOS} (Ex. 6)", x=x, n=n)
    caso("taxas.n_bruto_90_95", "taxas.tamanho_amostral_duas_proporcoes", f"{OVINOS}, Exemplo 6", p1=0.90, p2=0.95)
    caso("taxas.n_90_95", "taxas.n_por_grupo", f"{OVINOS}, Exemplo 6", p1=0.90, p2=0.95)
    caso("taxas.n_20_30_separada", "taxas.n_por_grupo", f"{LEITE}, taxas", p1=0.20, p2=0.30, variancia="separada")
    caso("taxas.poder_10_20", "taxas.poder_duas_proporcoes", f"{CAPRINOS}, Exemplo 7", p1=0.10, p2=0.20, n=30)
    caso("taxas.prolificidade", "taxas.ic_media_t", f"{CAPRINOS}, Exemplo 7", valores=[1] * 12 + [2] * 15 + [3] * 3)
    caso("taxas.encolhida", "taxas.taxa_encolhida", f"{LEITE}, taxas", x=2, n=30, a=10, b=40)
    for p in (1e-10, 0.025, 0.5, 0.8, 0.975):
        caso(f"taxas.norm_ppf_{p}", "taxas.norm_ppf", "Acklam + Halley", p=p)
    for z in (-6.0, -1.959963984540054, 0.0, 1.0, 3.5):
        caso(f"taxas.norm_cdf_{z}", "taxas.norm_cdf", "Φ(z) = ½·erfc(−z/√2)", z=z)
    caso("taxas.beta_inc", "taxas.beta_incompleta_regularizada", "fração continuada", x=0.2, a=6, b=25)
    caso("taxas.beta_quantil", "taxas.beta_quantil", "Clopper-Pearson de 6/30", p=0.025, a=6, b=25)
    caso("taxas.t_29", "taxas.t_quantil", f"{CAPRINOS}, Exemplo 7", p=0.975, gl=29)
    caso("taxas.log_gama", "taxas.log_gama", "Lanczos (g = 7)", x=30.5)
    caso("taxas.cusum", "taxas.cusum", "Page (1954), caso construído",
         valores=[1, 0, 2, 3, 2, 1, 3], alvo=1.0, folga=0.5, limite=2.0)

    # --- ganho
    for p in (0.05, 0.10, 0.20, 0.70, 0.80):
        caso(f"ganho.intensidade_{p}", "ganho.intensidade_selecao", f"{CAPRINOS}, Exemplo 5; {CORTE}",
             proporcao_selecionada=p)
    caso("ganho.vias_teste_progenie", "ganho.ganho_vias", f"{CAPRINOS}, Exemplo 5",
         vias=[[intensidade_selecao(0.20), 0.79, 5.5], [intensidade_selecao(0.20), 0.79, 5.5],
               [intensidade_selecao(0.05), 0.60, 4.0], [intensidade_selecao(0.80), 0.55, 4.0]],
         sigma_a=math.sqrt(0.2 * 200 ** 2))
    caso("ganho.quatro_vias", "ganho.ganho_diferenciais", f"{LEITE}, quatro vias",
         diferenciais=[405, 395, 239, 42], intervalos=[10.2, 6.4, 9.3, 5.1])
    caso("ganho.tendencia", "ganho.tendencia", f"{CORTE}, tendência genética",
         anos=[2020, 2021, 2022, 2023, 2024, 2025], valores=[1.8, 2.3, 2.9, 3.2, 3.9, 4.4])
    caso("ganho.absorcao", "ganho.absorcao", f"{OVINOS}, Exemplo 8",
         distancia_inicial=55.0, tendencia_anual=4.3 * 0.86, intervalo_geracao=3.75, geracoes=4)
    for do in (90, 133, 180):
        caso(f"ganho.dpr_aipl_{do}", "ganho.dpr_aipl", f"{LEITE}, fertilidade", dias_abertos=do)
        caso(f"ganho.dpr_linear_{do}", "ganho.dpr_linear", f"{LEITE}, fertilidade", dias_abertos=do)
    return c


def para_json(obj):
    """Converte o resultado de uma função do pacote para tipos JSON."""
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return {f.name: para_json(getattr(obj, f.name)) for f in dataclasses.fields(obj)}
    if isinstance(obj, dict):
        return {("|".join(map(str, k)) if isinstance(k, tuple) else str(k)): para_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [para_json(v) for v in obj]
    if isinstance(obj, np.ndarray):
        return para_json(obj.tolist())
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        return None if math.isnan(obj) else float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    return obj


def executar_caso(caso: dict):
    """Chama melhoramento.<modulo>.<funcao>(**entrada) e devolve a saída em JSON."""
    modulo, nome = caso["funcao"].split(".")
    funcao = getattr(importlib.import_module(f"melhoramento.{modulo}"), nome)
    return para_json(funcao(**caso["entrada"]))


def calcular_vetores() -> dict:
    """Documento completo de vetores (o mesmo conteúdo gravado em vetores_teste.json)."""
    vetores = [{**caso, "saida": executar_caso(caso)} for caso in casos()]
    return {
        "descricao": ("Vetores de teste do Laboratório de Modelos da Central de Melhoramento Seabra: "
                      "entradas e saídas do pacote Python melhoramento, para validar as calculadoras "
                      "em JavaScript/TypeScript e Dart."),
        "versao_pacote": melhoramento.__version__,
        "gerado_por": "python3 gerar_vetores_teste.py",
        "tolerancia_relativa": TOLERANCIA_RELATIVA,
        "convencoes": [
            "Taxas, confiabilidades, acurácias e F em fração (0 a 1), não em porcentagem.",
            "Pedigree: {animal: [pai, mãe]}; '0' (ou null, '' ou '-') indica pai ou mãe desconhecido.",
            "PTA/DEP = EBV/2. CCS em mil células/mL. Dias contados do parto (DEL).",
            "Dataclasses viram objetos com os mesmos nomes de campo; tuplas viram listas; NaN vira null.",
            "Chaves compostas (característica, grupo) viram 'característica|grupo'.",
            "Matrizes (A, A⁻¹) seguem a ordem de 'ids' devolvida junto.",
        ],
        "vetores": vetores,
    }


def escrever(documento: dict, caminho: Path = ARQUIVO) -> None:
    """Grava o documento com o cabeçalho indentado e um vetor por linha (fácil de ler e comparar)."""
    cabecalho = {k: v for k, v in documento.items() if k != "vetores"}
    linhas = [json.dumps(v, ensure_ascii=False) for v in documento["vetores"]]
    texto = json.dumps(cabecalho, ensure_ascii=False, indent=2)[:-2]
    texto += ',\n  "vetores": [\n    ' + ",\n    ".join(linhas) + "\n  ]\n}\n"
    json.loads(texto)                                   # garante que o arquivo é JSON válido
    caminho.write_text(texto, encoding="utf-8")


def main() -> None:
    documento = calcular_vetores()
    escrever(documento)
    print(f"{len(documento['vetores'])} vetores gravados em {ARQUIVO.name}")


if __name__ == "__main__":
    main()
