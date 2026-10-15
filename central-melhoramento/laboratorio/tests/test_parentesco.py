"""Testes de melhoramento.parentesco: cada teste reproduz um número publicado nos relatórios."""

import random
import unittest

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import parentesco as P

# Relatório de corte, "Passo 1: do pedigree a A, F e A⁻¹": 8 animais, 6 = filho de meios-irmãos.
PED_CORTE = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (1, 2), 5: (1, 3), 6: (4, 5), 7: (4, 3), 8: (4, 0)}

# Relatório de caprinos, Exemplo 8 (nomes do texto; B3 é bode externo, B5 comprado).
PED_CAPRINOS = {"B1": (None, None), "D1": (None, None), "D2": (None, None), "D3": (None, None),
                "B2": ("B1", "D1"), "C1": ("B1", "D1"), "C2": ("B1", "D2"), "C3": ("B1", "D3"),
                "B3": (None, None), "C4": ("B3", "D2"), "C5": ("B2", "C2"), "B4": ("B3", "C1"),
                "B5": (None, None)}


class TestMatrizA(TesteRelatorio):
    def test_matriz_A_pedigree_de_8_animais(self):
        # Relatório de corte, Passo 1: a matriz A impressa no texto.
        publicada = np.array([
            [1, 0, 0, 0.5, 0.5, 0.5, 0.25, 0.25],
            [0, 1, 0, 0.5, 0, 0.25, 0.25, 0.25],
            [0, 0, 1, 0, 0.5, 0.25, 0.5, 0],
            [0.5, 0.5, 0, 1, 0.25, 0.625, 0.5, 0.5],
            [0.5, 0, 0.5, 0.25, 1, 0.625, 0.375, 0.125],
            [0.5, 0.25, 0.25, 0.625, 0.625, 1.125, 0.4375, 0.3125],
            [0.25, 0.25, 0.5, 0.5, 0.375, 0.4375, 1, 0.25],
            [0.25, 0.25, 0, 0.5, 0.125, 0.3125, 0.25, 1]])
        A, ids = P.matriz_A(PED_CORTE)
        self.assertEqual(ids, list(range(1, 9)))
        np.testing.assert_allclose(A, publicada, atol=0)

    def test_F6_filho_de_meios_irmaos(self):
        # Relatório de corte, Passo 1: F₆ = ½ × A₄₅ = ½ × 0,25 = 0,125.
        F = P.coeficientes_F(PED_CORTE)
        self.assertAlmostEqual(F[6], 0.125)
        self.assertEqual(sum(1 for f in F.values() if f > 0), 1)

    def test_ordem_de_entrada_nao_importa(self):
        # Consistência: embaralhar o pedigree estendido não muda nenhum parentesco.
        pedx = {**PED_CORTE, 9: (6, 3), 10: (6, 0), 11: (6, 7)}
        A, ids = P.matriz_A(pedx)
        itens = list(pedx.items())
        random.Random(3).shuffle(itens)
        A2, ids2 = P.matriz_A(dict(itens))
        pos, pos2 = {a: i for i, a in enumerate(ids)}, {a: i for i, a in enumerate(ids2)}
        for a in pedx:
            for b in pedx:
                self.assertEqual(A[pos[a], pos[b]], A2[pos2[a], pos2[b]])

    def test_pais_sem_linha_viram_fundadores_e_ciclo_e_erro(self):
        A, ids = P.matriz_A({"X": ("S", "D")})
        self.assertEqual(ids, ["S", "D", "X"])
        with self.assertRaises(ValueError):
            P.matriz_A({"A": ("B", None), "B": ("A", None)})


class TestInversaA(TesteRelatorio):
    def test_inversa_pelas_regras_de_henderson(self):
        # Relatório de corte, Passo 1: A⁻¹ impressa (α = 1 nos fundadores, 2 nos animais 4 a 7 e
        # 4/3 no animal 8) e "idêntica à inversa numérica de A (diferença máxima 0)".
        publicada = np.array([
            [2, 0.5, 0.5, -1, -1, 0, 0, 0],
            [0.5, 1.5, 0, -1, 0, 0, 0, 0],
            [0.5, 0, 2, 0.5, -1, 0, -1, 0],
            [-1, -1, 0.5, 10 / 3, 0.5, -1, -1, -2 / 3],
            [-1, 0, -1, 0.5, 2.5, -1, 0, 0],
            [0, 0, 0, -1, -1, 2, 0, 0],
            [0, 0, -1, -1, 0, 0, 2, 0],
            [0, 0, 0, -2 / 3, 0, 0, 0, 4 / 3]])
        Ainv, _ = P.inversa_A(PED_CORTE)
        np.testing.assert_allclose(Ainv, publicada, atol=1e-12)
        A, _ = P.matriz_A(PED_CORTE)
        self.assertLess(np.abs(Ainv - np.linalg.inv(A)).max(), 1e-12)

    def test_correcao_de_quaas_com_pai_endogamico(self):
        # Relatório de corte, Passo 1: filhos 9 (6 × 3), 10 (6 × desconhecida) e 11 (6 × 7);
        # com F a diferença é de 4 × 10⁻¹⁶; ignorando F, o erro chega a 0,133.
        pedx = {**PED_CORTE, 9: (6, 3), 10: (6, 0), 11: (6, 7)}
        A, _ = P.matriz_A(pedx)
        com_F, _ = P.inversa_A(pedx)
        sem_F, _ = P.inversa_A(pedx, considerar_endogamia=False)
        self.assertLess(np.abs(com_F - np.linalg.inv(A)).max(), 1e-12)
        self.assertPublicado(np.abs(sem_F - np.linalg.inv(A)).max(), 0.1333, 4)


class TestAcasalamentos(TesteRelatorio):
    def test_leite_decidir_por_par(self):
        # Relatório de leite, "Endogamia: decidir por par, não por touro": P = 1, Q = 2, S = 5 (filho
        # de P), vaca C = 8 (P × filha de Q), V12 = 12, V13 = 13, V14 = 14; touros B1 = 7, B2 = 9,
        # B3 = 10, B4 = 11. Todos os touros aparentados têm média de 4,69% no rebanho.
        ped = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (2, 0), 5: (1, 0), 6: (0, 0), 7: (1, 3),
               8: (1, 4), 9: (2, 6), 10: (5, 6), 11: (0, 0), 12: (2, 0), 13: (5, 0), 14: (0, 0)}
        vacas = [8, 12, 13, 14]
        tabela = P.tabela_F_acasalamentos(ped, [7, 9, 10, 11], vacas)
        esperado = {7: [0.125, 0, 0.0625, 0], 9: [0.0625, 0.125, 0, 0], 10: [0.0625, 0, 0.125, 0],
                    11: [0, 0, 0, 0]}
        for touro, valores in esperado.items():
            self.assertEqual([tabela[touro][v] for v in vacas], valores)
        for touro in (7, 9, 10):
            self.assertAlmostEqual(np.mean([tabela[touro][v] for v in vacas]), 0.046875)
        # "A alocação certa (B1 em V12, B2 em V13, B4 em C) zera a endogamia de todos."
        escolha = P.escolher_reprodutores(ped, vacas, [7, 9, 10, 11])
        self.assertEqual(escolha[12][0], 7)
        self.assertEqual(escolha[13][0], 9)
        self.assertEqual(escolha[8][0], 11)
        self.assertTrue(all(f == 0 for _, f, _ in escolha.values()))

    def test_caprinos_exemplo_8(self):
        # Relatório de caprinos, Exemplo 8: tabela de F por par e médias de 17,71% e 11,98%.
        femeas = ["D1", "C1", "C2", "C3", "C4", "C5"]
        tabela = P.tabela_F_acasalamentos(PED_CAPRINOS, ["B2", "B4", "B5"], femeas)
        self.assertEqual([tabela["B2"][f] for f in femeas], [0.25, 0.25, 0.125, 0.125, 0, 0.3125])
        self.assertEqual([tabela["B4"][f] for f in femeas], [0.125, 0.25, 0.0625, 0.0625, 0.125, 0.09375])
        self.assertEqual([tabela["B5"][f] for f in femeas], [0] * 6)
        self.assertPublicado(100 * np.mean([tabela["B2"][f] for f in femeas]), 17.71, 2)
        self.assertPublicado(100 * np.mean([tabela["B4"][f] for f in femeas]), 11.98, 2)
        self.assertAlmostEqual(P.coeficientes_F(PED_CAPRINOS)["C5"], 0.125)

    def test_caprinos_exemplo_8_alocacao_com_limite(self):
        # Relatório de caprinos, Exemplo 8: "usa o B5 em D1, C1 e C5, o B4 em C2 e C3 (6,25%) e o B2
        # em C4 (zero)" = preferência B2 > B4 > B5 com limite de 6,25%.
        femeas = ["D1", "C1", "C2", "C3", "C4", "C5"]
        escolha = P.escolher_reprodutores(PED_CAPRINOS, femeas, ["B2", "B4", "B5"], limite_F=0.0625)
        self.assertEqual({f: escolha[f][0] for f in femeas},
                         {"D1": "B5", "C1": "B5", "C2": "B4", "C3": "B4", "C4": "B2", "C5": "B5"})

    def test_ovinos_exemplo_7(self):
        # Relatório de ovinos, Exemplo 7: R2 com E1 25%, F1 25%, F2 e F3 12,5%, F4 31,25%.
        ped = {"R1": (0, 0), "E1": (0, 0), "E2": (0, 0), "E3": (0, 0), "R2": ("R1", "E1"),
               "F1": ("R1", "E1"), "F2": ("R1", "E2"), "F3": ("R1", "E3"), "R3": (0, 0),
               "F4": ("R2", "F2")}
        self.assertAlmostEqual(P.coeficientes_F(ped)["F4"], 0.125)
        f = P.tabela_F_acasalamentos(ped, ["R1", "R2", "R3"], ["E1", "F1", "F2", "F3", "F4"])
        self.assertEqual(list(f["R1"].values()), [0, 0.25, 0.25, 0.25, 0.25])
        self.assertEqual(list(f["R2"].values()), [0.25, 0.25, 0.125, 0.125, 0.3125])
        self.assertEqual(list(f["R3"].values()), [0, 0, 0, 0, 0])
        self.assertEqual(P.F_acasalamento(ped, "R2", "F4"), 0.3125)


class TestTamanhoEfetivo(TesteRelatorio):
    def test_ne_3_carneiros_100_ovelhas(self):
        # Relatório de ovinos, Exemplo 7 (e caprinos, Exemplo 8): Ne = 11,65 e ΔF = 4,29%.
        ne = P.ne_wright(3, 100)
        self.assertPublicado(ne, 11.65, 2)
        self.assertPublicado(100 * P.delta_F(ne), 4.29, 2)

    def test_tabela_do_relatorio_de_corte(self):
        # Relatório de corte, "Endogamia e tamanho efetivo": Ne, ΔF por geração e por ano (L = 5).
        for nm, nf, ne, df, df_ano in ((5, 100, 19.0, 2.62, 0.53), (10, 100, 36.4, 1.37, 0.27),
                                       (20, 100, 66.7, 0.75, 0.15), (40, 1000, 153.8, 0.33, 0.07),
                                       (80, 2000, 307.7, 0.16, 0.03)):
            n = P.ne_wright(nm, nf)
            self.assertPublicado(n, ne, 1)
            self.assertPublicado(100 * P.delta_F(n), df, 2)
            self.assertPublicado(100 * P.delta_F(n) / 5, df_ano, 2)

    def test_F_acumulado_caprinos(self):
        # Relatório de caprinos, Exemplo 8 (L = 3 anos): 1 bode e 20 cabras → ΔF 13,12%, F após
        # 5 gerações 50,51%, após 10 anos 37,44%; 3 × 100 → 19,69% e 13,60%.
        df = P.delta_F(P.ne_wright(1, 20))
        self.assertPublicado(100 * df, 13.12, 2)
        self.assertPublicado(100 * P.F_acumulado(df, 5), 50.51, 2)
        self.assertPublicado(100 * P.F_acumulado(df, 10 / 3), 37.44, 2)
        df3 = P.delta_F(P.ne_wright(3, 100))
        self.assertPublicado(100 * P.F_acumulado(df3, 5), 19.69, 2)
        self.assertPublicado(100 * P.F_acumulado(df3, 10 / 3), 13.60, 2)
        # Relatório de ovinos, Exemplo 7 (L = 4): 12 anos = 3 gerações → 12,33%.
        self.assertPublicado(100 * P.F_acumulado(df3, 3), 12.33, 2)
        # Forma da FAO (1998): 1/(8Nm) + 1/(8Nf) = 1/(2Ne).
        self.assertAlmostEqual(df, 1 / 8 + 1 / 160)

    def test_machos_para_ne_50(self):
        # Relatório de caprinos, Exemplo 8: Ne de 50 com 1.000 cabras exige 12,7 bodes.
        self.assertPublicado(P.n_machos_para_ne(50, 1000), 12.7, 1)

    def test_uso_desigual_e_troca_entre_rebanhos(self):
        # Relatório de ovinos, Exemplo 7: 55/25/15/5% → 2,56 pais efetivos, Ne 9,76, ΔF 5,13%;
        # 3 rebanhos trocando (9 × 300) → Ne 34,95 e ΔF 1,43%; 14 × 100 → 49,12 e 1,02%.
        nef = P.numero_efetivo_pais([0.55, 0.25, 0.15, 0.05])
        self.assertPublicado(nef, 2.56, 2)
        ne = P.ne_wright(nef, 50)
        self.assertPublicado(ne, 9.76, 2)
        self.assertPublicado(100 * P.delta_F(ne), 5.13, 2)
        self.assertPublicado(P.ne_wright(9, 300), 34.95, 2)
        self.assertPublicado(100 * P.delta_F(P.ne_wright(14, 100)), 1.02, 2)

    def test_ne_de_delta_F(self):
        # Ovinos: Chios com ΔF 0,013 → Ne 38,5. Caprinos: Ne 129 → 0,39%; 149 → 0,34%; 39,69 → 1,26%.
        self.assertPublicado(P.ne_de_delta_F(0.013), 38.5, 1)
        self.assertPublicado(100 * P.delta_F(129), 0.39, 2)
        self.assertPublicado(100 * P.delta_F(149), 0.34, 2)
        self.assertPublicado(100 * P.delta_F(39.69), 1.26, 2)


if __name__ == "__main__":
    unittest.main()
