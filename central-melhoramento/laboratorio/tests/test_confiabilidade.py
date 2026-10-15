"""Testes de melhoramento.confiabilidade: REL, filhas-equivalentes, Daetwyler e conversões."""

import math
import unittest

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import confiabilidade as C


class TestFilhasEquivalentes(TesteRelatorio):
    def test_k_d_14_e_k_15(self):
        # Relatório de leite, "Filhas-equivalentes": h² 0,25 → k_d = 14 (USDA) e k = 15;
        # REL de 100 filhas 0,877 com k_d e 0,870 com k.
        self.assertEqual(C.k_d(0.25), 14.0)
        self.assertEqual(C.k_touro(0.25), 15.0)
        self.assertPublicado(C.rel_filhas(100, 0.25), 0.877, 3)
        self.assertPublicado(C.rel_filhas(100, 0.25, merito_companheiras_conhecido=False), 0.870, 3)

    def test_tabela_rel_com_k_d_14_e_98(self):
        # Relatório de leite: tabela de REL por número de filhas em rebanhos diferentes, sem e com média
        # dos pais de REL 0,30, para leite (h² 0,25; k_d = 14) e DPR (h² 0,04; k_d = 98).
        filhas = [10, 50, 100, 200, 500]
        leite = [0.417, 0.781, 0.877, 0.935, 0.973]
        leite_pa = [0.533, 0.800, 0.883, 0.936, 0.973]
        dpr = [0.093, 0.338, 0.505, 0.671, 0.836]
        dpr_pa = [0.347, 0.484, 0.592, 0.712, 0.847]
        for h2, sem, com in ((0.25, leite, leite_pa), (0.04, dpr, dpr_pa)):
            de_pa = C.de_de_rel(0.30, C.k_d(h2))
            self.assertPublicados([C.rel_filhas(n, h2) for n in filhas], sem, 3)
            self.assertPublicados([C.rel_total(h2, de_media_pais=de_pa, de_progenie=n) for n in filhas], com, 3)
        self.assertAlmostEqual(C.k_d(0.04), 98.0)

    def test_filhas_no_mesmo_rebanho(self):
        # VanRaden e Wiggans (1991, Tabela 2), no relatório de leite: 1, 2, 5, 10, 25, 50 e 100 filhas
        # no mesmo rebanho → 1,0; 1,7; 3,0; 4,1; 5,2; 5,7; 5,9 DE.
        self.assertPublicados([C.de_filhas_mesmo_rebanho(d) for d in (1, 2, 5, 10, 25, 50, 100)],
                              [1.0, 1.7, 3.0, 4.1, 5.2, 5.7, 5.9], 1)

    def test_tabela_1_de_vanraden_e_wiggans(self):
        # Relatório de leite (h² 0,25; r 0,55): registro próprio com 1, 3 e 5 lactações → 4,7; 7,8 e
        # 9,0 DE; filha com 1, 3 e 5 lactações → 1,0; 1,52 e 1,70 DE; média dos pais (0,70 e 0,30) → 4,7.
        self.assertPublicados([C.de_registros_proprios(m, 0.25, 0.55) for m in (1, 3, 5)], [4.7, 7.8, 9.0], 1)
        self.assertPublicados([C.de_filha_com_lactacoes(m, 0.25, 0.55) for m in (1, 3, 5)], [1.0, 1.52, 1.70], 2)
        rel_pa = C.rel_media_pais(0.70, 0.30)
        self.assertEqual(rel_pa, 0.25)
        self.assertPublicado(C.de_de_rel(rel_pa, C.k_d(0.25)), 4.7, 1)

    def test_fertilidade_e_genomica_em_filhas(self):
        # Relatório de leite: k_d de 284 (h² 1,4%) para 136 (h² 2,9%); acurácia com h² 0,03 de 0,27
        # (10 filhas) e 0,66 (100); REL genômica de 0,70 equivale a 32,7 filhas para leite e 228,7 para DPR.
        self.assertPublicado(C.k_d(0.014), 283.7, 1)
        self.assertPublicado(C.k_d(0.029), 135.9, 1)
        self.assertPublicados([C.r_de_rel(C.rel_filhas(n, 0.03)) for n in (10, 100)], [0.27, 0.66], 2)
        self.assertPublicado(C.de_de_rel(0.70, C.k_d(0.25)), 32.7, 1)
        self.assertPublicado(C.de_de_rel(0.70, C.k_d(0.04)), 228.7, 1)

    def test_caprinos_e_ovinos(self):
        # Relatório de caprinos ("PTA, base e confiabilidade"), h² 0,20: k = 19, k_d = 18; REL 0,50 e 0,70
        # exigem 18 e 42 DE; 10 filhas → 0,345 (k) e 0,357 (k_d); 30 → 0,612 e 0,625; 100 → 0,840 e 0,847.
        self.assertAlmostEqual(C.k_touro(0.20), 19.0)
        self.assertAlmostEqual(C.k_d(0.20), 18.0)
        self.assertPublicado(C.de_de_rel(0.50, C.k_d(0.20)), 18.0, 1)
        self.assertPublicado(C.de_de_rel(0.70, C.k_d(0.20)), 42.0, 1)
        for n, rk, rkd in ((10, 0.345, 0.357), (30, 0.612, 0.625), (50, 0.725, 0.735), (100, 0.840, 0.847)):
            self.assertPublicado(C.rel_filhas(n, 0.20, merito_companheiras_conhecido=False), rk, 3)
            self.assertPublicado(C.rel_filhas(n, 0.20), rkd, 3)
        # Relatório de ovinos, Exemplo 4 (h² 0,30): k = 12,33, k_d = 11,33; REL 0,50, 0,70 e 0,80 exigem
        # 11,3, 26,4 e 45,3 DE; n/(n + k) com 12 e 40 filhas → 0,49 e 0,76.
        self.assertPublicado(C.k_touro(0.30), 12.33, 2)
        self.assertPublicados([C.de_de_rel(r, C.k_d(0.30)) for r in (0.5, 0.7, 0.8)], [11.3, 26.4, 45.3], 1)
        self.assertPublicados([C.rel_filhas(n, 0.30, False) for n in (12, 40)], [0.49, 0.76], 2)
        # "chegar a 0,74 com 8 filhas exigiria h² de 0,83": REL = n/(n + k) → k = 8·0,26/0,74 = 2,81;
        # invertendo k_d = (4 − 2h²)/h² → h² = 4/(k + 2).
        k = 8 * (1 - 0.74) / 0.74
        self.assertPublicado(k, 2.81, 2)
        self.assertPublicado(4 / (k + 2), 0.83, 2)
        self.assertAlmostEqual(C.k_d(4 / (k + 2)), k)


class TestConversoes(TesteRelatorio):
    def test_r_para_acuracia_bif(self):
        # Relatório de corte, Passo 3: r 0,50 → 0,134; 0,60 → 0,200; 0,80 → 0,400; 0,90 → 0,564;
        # 0,98 → 0,801.
        self.assertPublicados([C.bif_de_r(r) for r in (0.5, 0.6, 0.8, 0.9, 0.98)],
                              [0.134, 0.200, 0.400, 0.564, 0.801], 3)

    def test_ida_e_volta(self):
        for r in (0.1, 0.5, 0.9, 0.99):
            self.assertAlmostEqual(C.r_de_bif(C.bif_de_r(r)), r)
            self.assertAlmostEqual(C.r_de_rel(C.rel_de_r(r)), r)
            self.assertAlmostEqual(C.rel_de_bif(C.bif_de_rel(r)), r)
        # Corte, Possible Change: "se 0,70 for r: aBIF = 0,286".
        self.assertPublicado(C.bif_de_r(0.70), 0.286, 3)

    def test_rel_de_pev_com_endogamia(self):
        # Relatório de corte, Passo 3: animal 6 (F = 0,125), PEV 102,1 e σ²a 100 → r = 0,304.
        self.assertPublicado(math.sqrt(C.rel_de_pev(102.0984, 100.0, 0.125)), 0.304, 3)

    def test_szzv_cd_igual_a_rel(self):
        # Relatório de caprinos: meias-amplitudes 700/126 = 5,56 ≈ √(1 − 0,38)/√(1 − 0,98) = 5,57.
        self.assertPublicado(math.sqrt(1 - 0.38) / math.sqrt(1 - 0.98), 5.57, 2)


class TestDaetwyler(TesteRelatorio):
    def test_leite(self):
        # Relatório de leite, "Confiabilidade genômica" (Me = 5.000): REL 0,50 e 0,70 exigem 16.667 e
        # 38.889 animais com h² 0,30 e 125.000 e 291.667 com h² 0,04; touros com 100 filhas (REL 0,877):
        # 1.000, 5.000 e 20.000 → REL 0,149; 0,467; 0,778 e r 0,39; 0,68; 0,88.
        self.assertPublicado(C.daetwyler_n_para_rel(0.5, 0.30, 5000), 16667, 0)
        self.assertPublicado(C.daetwyler_n_para_rel(0.7, 0.30, 5000), 38889, 0)
        self.assertPublicado(C.daetwyler_n_para_rel(0.5, 0.04, 5000), 125000, 0)
        self.assertPublicado(C.daetwyler_n_para_rel(0.7, 0.04, 5000), 291667, 0)
        rel_drp = C.rel_filhas(100, 0.25)
        self.assertPublicados([C.daetwyler_rel(n, rel_drp, 5000) for n in (1000, 5000, 20000)],
                              [0.149, 0.467, 0.778], 3)
        self.assertPublicados([C.daetwyler_r(n, rel_drp, 5000) for n in (1000, 5000, 20000)],
                              [0.39, 0.68, 0.88], 2)

    def test_corte_e_caprinos(self):
        # Relatório de corte: N para r = 0,5 e 0,7 com h² 0,30 e Me 5.000 → 5.556 e 16.013.
        self.assertPublicado(C.daetwyler_n_para_rel(0.25, 0.30, 5000), 5556, 0)
        self.assertPublicado(C.daetwyler_n_para_rel(0.49, 0.30, 5000), 16013, 0)
        # Relatório de caprinos (Apêndice A, bloco 10): fêmeas com h² 0,25, N = 388, Me 1.000 → r 0,297
        # (REL 0,088); bodes com DYD (REL 0,80), N = 2.955, Me 3.000 → r 0,664 (REL 0,441).
        self.assertPublicado(C.daetwyler_r(388, 0.25, 1000), 0.297, 3)
        self.assertPublicado(C.daetwyler_rel(388, 0.25, 1000), 0.088, 3)
        self.assertPublicado(C.daetwyler_r(2955, 0.80, 3000), 0.664, 3)
        self.assertPublicado(C.daetwyler_rel(2955, 0.80, 3000), 0.441, 3)


if __name__ == "__main__":
    unittest.main()
