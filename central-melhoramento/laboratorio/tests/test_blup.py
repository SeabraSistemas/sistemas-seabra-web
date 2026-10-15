"""Testes de melhoramento.blup: MME, PEV, confiabilidade, DEP, Possible Change e variantes do modelo."""

import unittest

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import blup as B
from melhoramento import parentesco as P

# Relatório de corte, Passos 1 a 3: pedigree de 8 animais, P205 ajustado de 5 bezerros em 2 GCs.
PED = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (1, 2), 5: (1, 3), 6: (4, 5), 7: (4, 3), 8: (4, 0)}
ANIMAIS = [4, 5, 6, 7, 8]
P205 = [212.0, 198.0, 225.0, 204.0, 196.0]
GC = ["2022", "2022", "2024", "2024", "2024"]


class TestModeloAnimalCorte(TesteRelatorio):
    @classmethod
    def setUpClass(cls):
        cls.r = B.modelo_animal(PED, ANIMAIS, P205, GC, sigma2_a=100.0, sigma2_e=300.0)

    def test_grupos_de_contemporaneos(self):
        # Relatório de corte, Passo 2: "GC 2022 = 203,71 kg e GC 2024 = 207,56 kg".
        self.assertPublicado(self.r.efeitos_fixos["GC=2022"], 203.71, 2)
        self.assertPublicado(self.r.efeitos_fixos["GC=2024"], 207.56, 2)

    def test_tabela_do_passo_3(self):
        # Relatório de corte, Passo 3: EBV, DEP, PEV, r, r², a_BIF e SEP da DEP dos 8 animais.
        self.assertPublicados(self.r.ebv, [1.15, 1.03, -0.50, 2.12, 0.45, 3.59, 0.19, -1.46], 2)
        self.assertPublicados(self.r.dep, [0.58, 0.51, -0.25, 1.06, 0.23, 1.80, 0.09, -0.73], 2)
        self.assertPublicados(self.r.pev, [98.9, 96.7, 93.5, 92.1, 89.6, 102.1, 91.5, 89.3], 1)
        self.assertPublicados(self.r.acuracia, [0.107, 0.183, 0.254, 0.281, 0.322, 0.304, 0.291, 0.326], 3)
        self.assertPublicados(self.r.confiabilidade, [0.011, 0.033, 0.065, 0.079, 0.104, 0.092, 0.085, 0.107], 3)
        self.assertPublicados(self.r.acuracia_bif, [0.006, 0.017, 0.033, 0.040, 0.053, 0.047, 0.043, 0.055], 3)
        self.assertPublicados(self.r.sep_dep, [4.97, 4.92, 4.84, 4.80, 4.73, 5.05, 4.78, 4.73], 2)
        self.assertPublicado(self.r.F[5], 0.125, 3)

    def test_mme_igual_a_gls(self):
        # Relatório de corte, Passo 2: MME e forma GLS coincidem (diferença de 2 × 10⁻¹⁴).
        A, ids = P.matriz_A(PED)
        X, _ = B.montar_X(GC)
        Z, _ = B.incidencia(ANIMAIS, ids)
        b, a = B.blup_gls(X, Z, np.array(P205), A, 100.0, 300.0)
        self.assertLess(np.abs(a - self.r.ebv).max(), 1e-10)
        self.assertLess(abs(b[0] - self.r.efeitos_fixos["GC=2022"]), 1e-10)

    def test_acuracia_e_tamanho_do_GC(self):
        # Relatório de corte, "Antes do modelo": h² 0,25, 1 registro, animais não aparentados:
        # GC de 2, 5, 20 e 100 → r = 0,354; 0,447; 0,487; 0,497.
        for k, r in ((2, 0.354), (5, 0.447), (20, 0.487), (100, 0.497)):
            res = B.modelo_animal({i: (0, 0) for i in range(1, k + 1)}, list(range(1, k + 1)),
                                  [0.0] * k, ["g"] * k, 100.0, 300.0)
            self.assertPublicado(res.acuracia[0], r, 3)

    def test_possible_change(self):
        # Relatório de corte, Passo 3: animal 4 (σA = 10 kg) → PC68 = 4,80 kg = SEP da DEP;
        # touro de P450 com σA/2 = 8,24 kg e a_BIF 0,70 → PC68 2,47 kg e PC95 4,94 kg;
        # se 0,70 for r (tabela da ANCP) → 5,88 kg.
        self.assertPublicado(B.possible_change(self.r.acuracia_bif[3], 10.0), 4.80, 2)
        self.assertPublicado(B.possible_change(0.70, 2 * 8.24), 2.47, 2)
        self.assertPublicado(B.possible_change(0.70, 2 * 8.24, t=2), 4.94, 2)
        self.assertPublicado(B.possible_change_de_r(0.70, 2 * 8.24), 5.88, 2)
        # Red Angus (PC em acurácia 0 = 25,9 lb): 12,9 lb em 0,5 e 2,6 lb em 0,9.
        self.assertPublicado(B.possible_change(0.5, 51.8), 12.9, 1)
        self.assertPublicado(B.possible_change(0.9, 51.8), 2.6, 1)

    def test_dep_e_metade_do_ebv(self):
        self.assertEqual(B.dep_de_ebv(3.0), 1.5)
        np.testing.assert_allclose(B.dep_de_ebv(self.r.ebv), self.r.dep)


class TestModeloAnimalComAmbientePermanente(TesteRelatorio):
    def test_repetibilidade_igual_a_gls(self):
        # Consistência interna (não vem de relatório): com registros repetidos e ambiente permanente,
        # as MME coincidem com V = σ²a·ZAZ' + σ²pe·WW' + σ²e·I.
        animais = [4, 4, 5, 6, 6, 6, 7, 8]
        y = np.array([212.0, 220.0, 198.0, 225.0, 230.0, 219.0, 204.0, 196.0])
        grupos = ["a", "b", "a", "b", "c", "c", "b", "c"]
        res = B.modelo_animal(PED, animais, y, grupos, 100.0, 300.0, sigma2_pe=50.0)
        A, ids = P.matriz_A(PED)
        X, _ = B.montar_X(grupos)
        Z, _ = B.incidencia(animais, ids)
        W, _ = B.incidencia(animais)
        V = 100.0 * Z @ A @ Z.T + 50.0 * W @ W.T + 300.0 * np.eye(len(y))
        Vi = np.linalg.inv(V)
        b = np.linalg.solve(X.T @ Vi @ X, X.T @ Vi @ y)
        a = 100.0 * A @ Z.T @ Vi @ (y - X @ b)
        self.assertLess(np.abs(a - res.ebv).max(), 1e-9)
        self.assertEqual(set(res.ambiente_permanente), {4, 5, 6, 7, 8})

    def test_covariavel_e_segundo_fator(self):
        # Consistência: X com GC, um fator extra (primeiro nível retirado) e uma covariável tem posto
        # completo e o modelo resolve.
        X, nomes = B.montar_X(["a", "a", "b", "b"], {"ordem": [1, 2, 1, 2]}, {"idade": [24, 36, 25, 40]})
        self.assertEqual(nomes, ["GC=a", "GC=b", "ordem=2", "idade"])
        self.assertEqual(np.linalg.matrix_rank(X), 4)


class TestDiretoMaterno(TesteRelatorio):
    @classmethod
    def setUpClass(cls):
        # Relatório de corte, "Pesos até a desmama": mães 2 (de 4), 3 (de 5 e 7) e 5 (de 6).
        cls.maes = [2, 3, 5, 3, 0]
        cls.r = B.modelo_direto_materno(PED, ANIMAIS, cls.maes, P205, GC,
                                        G0=[[100, -15], [-15, 40]], sigma2_pe=30.0, sigma2_e=230.0)

    def test_parametros(self):
        # σ²P = 385, h²d = 0,26, h²m = 0,10 e r_am = −0,24.
        self.assertEqual(self.r.variancia_fenotipica, 385.0)
        self.assertPublicado(self.r.h2_direta, 0.26, 2)
        self.assertPublicado(self.r.h2_materna, 0.10, 2)
        self.assertPublicado(self.r.correlacao_am, -0.24, 2)

    def test_tabela_de_deps(self):
        # Tabela de DEP direta, materna e total materno (TMD = DEP materna + ½ DEP direta).
        self.assertPublicados(self.r.dep_direta, [0.44, 0.37, -0.11, 0.94, 0.07, 1.75, 0.16, -1.02], 2)
        self.assertPublicados(self.r.dep_materna, [0.41, 0.35, -0.11, 0.30, 0.64, 0.28, 0.13, 0.37], 2)
        self.assertPublicados(self.r.total_materno, [0.63, 0.53, -0.16, 0.76, 0.67, 1.16, 0.21, -0.14], 2)
        # Ambiente permanente: p̂ = +0,64 (vaca 2), −0,95 (vaca 3) e +1,50 (vaca 5).
        self.assertPublicados([self.r.ambiente_permanente[m] for m in (2, 3, 5)], [0.64, -0.95, 1.50], 2)

    def test_covariancia_zero(self):
        # Com σam = 0: DEPs mudam até 0,25 kg (direta) e 0,29 kg (materna); DEP materna do animal 6
        # sobe de 0,28 para 0,57 kg.
        r0 = B.modelo_direto_materno(PED, ANIMAIS, self.maes, P205, GC, [[100, 0], [0, 40]], 30.0, 230.0)
        self.assertPublicado(np.abs(r0.dep_direta - self.r.dep_direta).max(), 0.25, 2)
        self.assertPublicado(np.abs(r0.dep_materna - self.r.dep_materna).max(), 0.29, 2)
        self.assertPublicado(r0.dep_materna[5], 0.57, 2)

    def test_repetibilidade_implicita(self):
        # "Repetibilidade de 0,21 entre filhos ... com pais diferentes e de 0,27 entre irmãos completos".
        G0 = [[100, -15], [-15, 40]]
        self.assertPublicado(B.repetibilidade_direto_materno(G0, 30, 230, 0.25), 0.208, 3)
        self.assertPublicado(B.repetibilidade_direto_materno(G0, 30, 230, 0.5), 0.273, 3)


class TestMulticaracteristica(TesteRelatorio):
    def test_bicaracteristica_pd_ps450(self):
        # Relatório de corte, "Pesos depois da desmama": animal 8 vendido na desmama (sem PS);
        # G₀ = [100 105; 105 225], R₀ = [300 100; 100 400].
        Y = [[212, 305], [198, 290], [225, 330], [204, 300], [196, None]]
        bi = B.modelo_multicaracteristica(PED, ANIMAIS, Y, GC, [[100, 105], [105, 225]],
                                          [[300, 100], [100, 400]], ["PD", "PS"])
        self.assertPublicados(bi.ebv[3:, 1], [4.04, 0.16, 6.51, -1.80, -0.66], 2)
        self.assertPublicados(bi.acuracia[3:, 1], [0.349, 0.369, 0.329, 0.301, 0.267], 3)
        # Mesma característica analisada sozinha (λ = 400/225): o animal 8 fica com +1,57.
        uni = B.modelo_animal(PED, [4, 5, 6, 7], [305.0, 290.0, 330.0, 300.0], GC[:4], 225.0, 400.0)
        self.assertPublicados(uni.ebv[3:], [3.13, -0.76, 4.35, -3.17, 1.57], 2)
        self.assertPublicados(uni.acuracia[3:], [0.340, 0.350, 0.296, 0.261, 0.170], 3)
        self.assertTrue(np.all(bi.acuracia[:, 1] > uni.acuracia))   # "Todas as acurácias sobem."


class TestModeloTouro(TesteRelatorio):
    def test_caprinos_exemplo_3(self):
        # Relatório de caprinos, Exemplo 3 (h² 0,20; Z = bode de IA com REL 0,90).
        z = {"Z": 0.90}
        casos = [([{"X": 10}], {}, 0.00), ([{"X": 10, "Y": 10}], {}, 0.17),
                 ([{"X": 10, "Z": 10}], z, 0.20), ([{"X": 5, "Z": 10}] * 2, z, 0.25),
                 ([{"X": 2, "Z": 10}] * 5, z, 0.30),
                 ([{"X": 2, f"Y{i}": 10} for i in range(5)], {}, 0.29),
                 ([{"X": 1, "Z": 10}] * 10, z, 0.31), ([{"X": 30, "Z": 30}], z, 0.42),
                 ([{"X": 2, "Z": 10}] * 15, z, 0.54), ([{"X": 2, "Z": 40}] * 15, z, 0.57)]
        for rebanhos, externa, rel in casos:
            self.assertPublicado(B.rel_exata_modelo_touro(rebanhos, 0.20, externa)["X"], rel, 2)

    def test_ovinos_exemplo_4(self):
        # Relatório de ovinos, Exemplo 4: REL de X com h² 0,30 e 0,24, conferida com a saída do
        # Apêndice A (3 casas). A tabela do texto arredonda essa saída de novo, e duas células
        # ficam erradas na segunda casa (DISCREPÂNCIAS, conferidas no fim do teste).
        z = {"Z": 0.90}
        casos = [([{"X": 20}], {}, 0.000, 0.000), ([{"X": 10, "Y": 10}], {}, 0.224, 0.195),
                 ([{"X": 10, "Z": 10}], z, 0.280, 0.236),
                 ([{"X": 4, f"Y{i}": 10} for i in range(3)], {}, 0.361, 0.316),
                 ([{"X": 4, "Z": 10}] * 3, z, 0.394, 0.342),
                 ([{"X": n, "Z": 10} for n in (2, 2, 2, 1, 1)], z, 0.344, 0.294),
                 ([{"X": 40, "Z": 40}], z, 0.583, 0.531), ([{"X": 8, "Z": 40}] * 5, z, 0.680, 0.637),
                 ([{"X": 4, "Z": 40}] * 10, z, 0.695, 0.653)]
        for rebanhos, externa, rel30, rel24 in casos:
            self.assertPublicado(B.rel_exata_modelo_touro(rebanhos, 0.30, externa)["X"], rel30, 3)
            self.assertPublicado(B.rel_exata_modelo_touro(rebanhos, 0.24, externa)["X"], rel24, 3)
        # DISCREPÂNCIA 1: "ao lado de 10 filhas de outro carneiro local", h² 0,24: a tabela mostra 0,20;
        # o valor exato é 0,1948, isto é, 0,19.
        self.assertPublicado(B.rel_exata_modelo_touro([{"X": 10, "Y": 10}], 0.24)["X"], 0.19, 2)
        # DISCREPÂNCIA 2: "40 filhas em 10 rebanhos (4 em cada), ao lado de 40 de Z", h² 0,30: a tabela
        # (e o texto, "0,68 a 0,70") mostra 0,70; o valor exato é 0,6948, isto é, 0,69.
        self.assertPublicado(B.rel_exata_modelo_touro([{"X": 4, "Z": 40}] * 10, 0.30, z)["X"], 0.69, 2)

    def test_ovinos_exemplo_2_variancia_heterogenea(self):
        # Relatório de ovinos, Exemplo 2: sem ajuste X −20,7, Y +13,9, Z +6,9 (Y > Z > X);
        # com y* = y × 64,5/σ_k: X −21,2, Y +8,4, Z +12,8 (Z > Y > X).
        dados = {"A": (95.0, {"X": [30, -40, 50, -40], "Y": [90, 20, 110, 20]}),
                 "B": (40.0, {"X": [-10, 15, -5, 0], "Z": [40, 25, 50, 25]})}
        registros = [(g, t, v) for g, (_, filhas) in dados.items() for t, vs in filhas.items() for v in vs]
        sem = B.modelo_touro(registros, 0.30).ebv
        com = B.modelo_touro(registros, 0.30, fator_escala={g: 64.5 / s for g, (s, _) in dados.items()}).ebv
        self.assertPublicados([sem["X"], sem["Y"], sem["Z"]], [-20.7, 13.9, 6.9], 1)
        self.assertPublicados([com["X"], com["Y"], com["Z"]], [-21.2, 8.4, 12.8], 1)
        # +60 L no rebanho A valem +40,7 L na base; +35 L no B valem +56,4 L.
        self.assertPublicado(B.padronizar_variancia(60, 95, 64.5), 40.7, 1)
        self.assertPublicado(B.padronizar_variancia(35, 40, 64.5), 56.4, 1)

    def test_prova_externa_entra_como_filhas_equivalentes(self):
        # Consistência: sem filhas, o touro fica com a REL e o EBV da prova externa.
        r = B.modelo_touro([("g", "Y", 10.0), ("g", "Y", -10.0)], 0.25, prova_externa={"Z": (40.0, 0.8)})
        self.assertAlmostEqual(r.confiabilidade["Z"], 0.8)
        self.assertAlmostEqual(r.ebv["Z"], 40.0 * 0.8)   # EBV encolhido: REL × prova externa


class TestHVA(TesteRelatorio):
    def test_wiggans_vanraden_1991(self):
        # Relatório de leite, ajuste de variância heterogênea: +900 kg, DP 1.800 kg, base 1.500 kg →
        # h² 0,29 e 0,25; DP genético 969 e 750 kg; fator 0,774; +696,4 kg; peso de erro 1,44.
        r = B.ajuste_hva(900, 1800, 1500)
        self.assertPublicado(r["h2_rebanho"], 0.29, 2)
        self.assertPublicado(r["h2_base"], 0.25, 2)
        self.assertPublicado(r["dp_genetico_rebanho"], 969, 0)
        self.assertPublicado(r["dp_genetico_base"], 750, 0)
        self.assertPublicado(r["fator"], 0.774, 3)
        self.assertPublicado(r["desvio_ajustado"], 696.4, 1)
        self.assertPublicado(r["peso_erro"], 1.44, 2)


if __name__ == "__main__":
    unittest.main()
