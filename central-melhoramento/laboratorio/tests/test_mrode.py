"""Validação contra os exemplos resolvidos de Mrode, Pocrnić, Gorjanc e Thompson (2023), *Linear
Models for the Prediction of the Genetic Merit of Animals*, 4ª ed., CABI, DOI
10.1079/9781800620506.0000.

Os valores esperados são a saída dos scripts R oficiais do livro (github.com/MrodesBook/Examples_R),
rodados com R 4.3.3 em 15/10/2026. O nome do script e o número do exemplo estão em cada teste.
Como pedigreemm e nadiv não estavam instaláveis, A, A⁻¹ e A* vieram de um shim em R que implementa só
pedigree, getA, getAInv, makeAinv, ggcontrib e makeD, conferido por A⁻¹·A = I. Todo o resto
(montagem e solução das MME) é o código oficial, sem alteração. Detalhes e a tabela completa da
comparação (3.146 valores, diferença máxima abaixo de 1e-13) estão no README, seção "Validação
contra Mrode et al. (2023)".

Tolerâncias: as soluções que os scripts imprimem com round(x, 3) ou round(x, 4) são conferidas com
meia unidade da última casa (assertPublicados), como os números dos relatórios. Matrizes e as
soluções do Exemplo 4.1 também são conferidas com 10 a 12 algarismos e tolerância de 1e-9.
"""

import unittest

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import blup as B
from melhoramento import parentesco as P

# Pedigree dos Exemplos 4.1 a 4.4, 6.1, 17.7, 18.1 e 19.2 (0 = desconhecido).
PED4 = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (1, 0), 5: (3, 2), 6: (1, 2), 7: (4, 5), 8: (3, 6)}
ANIM4 = [4, 5, 6, 7, 8]
SEXO4 = ["Male", "Female", "Female", "Male", "Male"]
WWG4 = [4.5, 2.9, 3.9, 3.5, 5.0]
# Pedigree dos Exemplos 5.1 e 10.1: a vaca 8 é filha de 1 com a sua neta 7 (F₈ = ½·a₁₇ = ½·¼).
PED5 = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (1, 2), 5: (3, 2), 6: (1, 5), 7: (3, 4), 8: (1, 7)}
# Exemplo 8.1 (14 animais).
PED8 = {1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (0, 0), 5: (1, 2), 6: (3, 2), 7: (4, 6), 8: (3, 5),
        9: (1, 6), 10: (3, 2), 11: (3, 7), 12: (8, 7), 13: (9, 2), 14: (3, 6)}
# Exemplos 9.1 (15 animais).
PED9 = {**{i: (0, 0) for i in range(1, 7)}, 7: (1, 4), 8: (1, 4), 9: (2, 5), 10: (1, 4), 11: (2, 5),
        12: (3, 6), 13: (2, 5), 14: (3, 6), 15: (3, 6)}
# Exemplo 5.2 (15 animais).
PED52 = {**{i: (0, 0) for i in range(1, 6)}, 6: (1, 2), 7: (1, 2), 8: (1, 2), 9: (3, 4), 10: (3, 4),
         11: (3, 4), 12: (3, 4), 13: (1, 5), 14: (1, 5), 15: (1, 5)}


def _fixos(res, nomes):
    return [res.efeitos_fixos[n] for n in nomes]


class TestParentescoMrode(TesteRelatorio):
    def test_Ainv_exemplo_4_1(self):
        # Chapter_04_1.R, Exemplo 4.1: getAInv(pedX).
        esperado = np.array([
            [1.8333333333, 0.5, 0.0, -0.6666666667, 0.0, -1.0, 0.0, 0.0],
            [0.5, 2.0, 0.5, 0.0, -1.0, -1.0, 0.0, 0.0],
            [0.0, 0.5, 2.0, 0.0, -1.0, 0.5, 0.0, -1.0],
            [-0.6666666667, 0.0, 0.0, 1.8333333333, 0.5, 0.0, -1.0, 0.0],
            [0.0, -1.0, -1.0, 0.5, 2.5, 0.0, -1.0, 0.0],
            [-1.0, -1.0, 0.5, 0.0, 0.0, 2.5, 0.0, -1.0],
            [0.0, 0.0, 0.0, -1.0, -1.0, 0.0, 2.0, 0.0],
            [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 2.0]])
        Ainv, ids = P.inversa_A(PED4)
        self.assertEqual(ids, list(range(1, 9)))
        np.testing.assert_allclose(Ainv, esperado, rtol=0, atol=1e-9)

    def test_matriz_A_exemplo_17_7(self):
        # Chapter_17.R, Exemplo 17.7: getA(pedX), o mesmo pedigree do Exemplo 4.1.
        esperado = np.array([
            [1, 0, 0, 0.5, 0, 0.5, 0.25, 0.25],
            [0, 1, 0, 0, 0.5, 0.5, 0.25, 0.25],
            [0, 0, 1, 0, 0.5, 0, 0.25, 0.5],
            [0.5, 0, 0, 1, 0, 0.25, 0.5, 0.125],
            [0, 0.5, 0.5, 0, 1, 0.25, 0.5, 0.375],
            [0.5, 0.5, 0, 0.25, 0.25, 1, 0.25, 0.5],
            [0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 1, 0.25],
            [0.25, 0.25, 0.5, 0.125, 0.375, 0.5, 0.25, 1]])
        A, _ = P.matriz_A(PED4)
        np.testing.assert_allclose(A, esperado, rtol=0, atol=1e-12)

    def test_Ainv_exemplo_5_1_com_endogamia(self):
        # Chapter_05_1.R, Exemplo 5.1: getAInv(pedX); a vaca 8 tem F = 0,125.
        esperado = np.array([
            [2.5, 0.5, 0.0, -1.0, 0.5, -1.0, 0.5, -1.0],
            [0.5, 2.0, 0.5, -1.0, -1.0, 0.0, 0.0, 0.0],
            [0.0, 0.5, 2.0, 0.5, -1.0, 0.0, -1.0, 0.0],
            [-1.0, -1.0, 0.5, 2.5, 0.0, 0.0, -1.0, 0.0],
            [0.5, -1.0, -1.0, 0.0, 2.5, -1.0, 0.0, 0.0],
            [-1.0, 0.0, 0.0, 0.0, -1.0, 2.0, 0.0, 0.0],
            [0.5, 0.0, -1.0, -1.0, 0.0, 0.0, 2.5, -1.0],
            [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 2.0]])
        Ainv, _ = P.inversa_A(PED5)
        np.testing.assert_allclose(Ainv, esperado, rtol=0, atol=1e-9)
        self.assertAlmostEqual(P.coeficientes_F(PED5)[8], 0.125, places=12)

    def test_diagonal_de_Ainv_exemplo_8_1(self):
        # Chapter_08.R, Exemplo 8.1: diagonal de getAInv(pedX) (14 animais, 11 a 14 endogâmicos).
        Ainv, _ = P.inversa_A(PED8)
        self.assertPublicados(np.diag(Ainv), [2.0, 3.0, 3.5, 1.5, 2.5, 3.5, 3.0, 2.5, 2.5, 2.0,
                                              2.0, 2.0, 2.0, 2.0], 9)

    def test_A_estrela_com_grupos_exemplo_4_4(self):
        # Chapter_04_3.R, Exemplo 4.4: nadiv::makeAinv(pedEx, ggroups = 2); pais desconhecidos no
        # grupo 9 e mães desconhecidas no grupo 10. Blocos App (grupos) e Anp (animais × grupos).
        ped = {1: (9, 10), 2: (9, 10), 3: (9, 10), 4: (1, 10), 5: (3, 2), 6: (1, 2), 7: (4, 5), 8: (3, 6)}
        Ast, ids, grupos = P.inversa_A_grupos(ped, [9, 10])
        self.assertEqual((ids, grupos), (list(range(1, 9)), [9, 10]))
        np.testing.assert_allclose(Ast[8:, 8:], [[0.75, 0.75], [0.75, 1.0833333333]], rtol=0, atol=1e-9)
        np.testing.assert_allclose(Ast[:8, 8:], [[-0.5, -0.1666666667], [-0.5, -0.5], [-0.5, -0.5],
                                                 [0.0, -0.6666666667], [0, 0], [0, 0], [0, 0], [0, 0]],
                                   rtol=0, atol=1e-9)
        # O bloco dos animais é a própria A⁻¹ (Ann do script = Ainv do Exemplo 4.1).
        np.testing.assert_allclose(Ast[:8, :8], P.inversa_A(PED4)[0], rtol=0, atol=1e-12)


class TestModeloAnimalMrode(TesteRelatorio):
    @classmethod
    def setUpClass(cls):
        cls.r = B.modelo_animal(PED4, ANIM4, WWG4, SEXO4, sigma2_a=20.0, sigma2_e=40.0)

    def test_solucoes_exemplo_4_1(self):
        # Chapter_04_1.R, Exemplo 4.1: round(solutions, 3) = sexo (macho, fêmea) e animais 1 a 8.
        sol = _fixos(self.r, ["GC=Male", "GC=Female"]) + list(self.r.ebv)
        self.assertPublicados(sol, [4.359, 3.404, 0.098, -0.019, -0.041, -0.009, -0.186, 0.177,
                                    -0.249, 0.183], 3)
        # As mesmas soluções com 12 algarismos (objeto solutions do script).
        np.testing.assert_allclose(sol, [4.35850232985, 3.40443000591, 0.0984445757039,
                                         -0.0187700991009, -0.0410842029271, -0.00866312266194,
                                         -0.185732099495, 0.176872087681, -0.249458554834,
                                         0.182614687931], rtol=0, atol=1e-9)

    def test_acuracia_exemplo_4_1(self):
        # Chapter_04_1.R, "Accuracy of evaluations": data.frame accuracy, arredondado a 3 casas.
        # diagCM = c^ii; r_square = 1 − c^ii·α; r; SEP = √(c^ii·σ²e). Sem endogamia, então
        # r_square é a confiabilidade do motor; SEP é o erro do EBV (o motor dá sep_dep = SEP/2).
        self.assertPublicados(self.r.pev / 40.0, [0.471, 0.492, 0.456, 0.428, 0.428, 0.442, 0.442, 0.422], 3)
        self.assertPublicados(self.r.confiabilidade, [0.058, 0.016, 0.087, 0.145, 0.144, 0.115, 0.116, 0.155], 3)
        self.assertPublicados(self.r.acuracia, [0.240, 0.126, 0.295, 0.380, 0.379, 0.340, 0.341, 0.394], 3)
        self.assertPublicados(np.sqrt(self.r.pev), [4.341, 4.437, 4.273, 4.136, 4.138, 4.206, 4.204, 4.110], 3)
        self.assertPublicados(2 * self.r.sep_dep, [4.341, 4.437, 4.273, 4.136, 4.138, 4.206, 4.204, 4.110], 3)

    def test_modelo_animal_reduzido_exemplo_4_3(self):
        # Chapter_04_2.R, Exemplo 4.3: o modelo animal reduzido resolve só os pais (1 a 6) e recupera
        # os não pais (7 e 8) depois; as soluções são as do modelo completo, que o motor resolve.
        sol = _fixos(self.r, ["GC=Male", "GC=Female"]) + list(self.r.ebv)
        self.assertPublicados(sol[:8], [4.359, 3.404, 0.098, -0.019, -0.041, -0.009, -0.186, 0.177], 3)
        self.assertPublicados(sol[8:], [-0.249, 0.183], 3)

    def test_exemplo_17_7(self):
        # Chapter_17.R, Exemplo 17.7 (dados do REML; σ²a = 0,2 e σ²e = 0,4): round(solutions, 3)
        # e round(res, 4), res = y − Xb − Za.
        y = [2.6, 0.1, 1.0, 3.0, 1.0]
        r = B.modelo_animal(PED4, ANIM4, y, SEXO4, sigma2_a=0.2, sigma2_e=0.4)
        self.assertPublicados(_fixos(r, ["GC=Male", "GC=Female"]) + list(r.ebv),
                              [2.144, 0.602, 0.117, -0.025, -0.222, 0.254, -0.135, 0.032, 0.219, -0.305], 3)
        res = np.array(y) - _fixos(r, [f"GC={s}" for s in SEXO4]) - r.ebv[3:]
        self.assertPublicados(res, [0.2022, -0.3661, 0.3661, 0.6374, -0.8395], 4)


class TestRepetibilidadeEAmbienteComumMrode(TesteRelatorio):
    def test_repetibilidade_exemplo_5_1(self):
        # Chapter_05_1.R, Exemplo 5.1: σ²a = 20, σ²pe = 12, σ²e = 28. A paridade está aninhada no
        # HYS (HYS 1 e 2 só têm 1ª lactação; 3 e 4, só 2ª), então o motor ajusta só HYS, que gera o
        # mesmo espaço de colunas; EBV e p̂ não mudam com a parametrização.
        cow = [4, 4, 5, 5, 6, 6, 7, 7, 8, 8]
        fy = [201, 280, 150, 200, 160, 190, 180, 250, 285, 300]
        hys = ["1", "3", "1", "4", "2", "3", "1", "3", "2", "4"]
        r = B.modelo_animal(PED5, cow, fy, hys, sigma2_a=20.0, sigma2_e=28.0, sigma2_pe=12.0)
        self.assertPublicados(r.ebv, [10.148, -3.084, -7.063, 13.581, -18.207, -18.387, 9.328, 24.194], 3)
        self.assertPublicados([r.ambiente_permanente[c] for c in (4, 5, 6, 7, 8)],
                              [8.417, -7.146, -17.228, -1.390, 17.347], 3)
        # Funções estimáveis dos fixos, a partir das soluções impressas (paridade1 = 175,472;
        # paridade2 = 241,893; hys2 = 44,065; hys4 = 0,013): HYS1 = p1; HYS2 = p1 + hys2; HYS3 = p2;
        # HYS4 = p2 + hys4. Soma de dois números de 3 casas: tolerância de 0,001.
        for nivel, esperado in (("1", 175.472), ("2", 175.472 + 44.065), ("3", 241.893), ("4", 241.893 + 0.013)):
            self.assertLessEqual(abs(r.efeitos_fixos[f"GC={nivel}"] - esperado), 1e-3)

    def test_ambiente_comum_exemplo_5_2(self):
        # Chapter_05_2.R, Exemplo 5.2: leitões com efeito de família de irmãos completos
        # (σ²a = 20, σ²c = 15, σ²e = 65), via rotulos_pe.
        sexo = ["Male", "Female", "Female", "Female", "Male", "Female", "Female", "Male", "Female", "Male"]
        ww = [90, 70, 65, 98, 106, 60, 80, 100, 85, 68]
        familia = ["1", "1", "1", "2", "2", "2", "2", "3", "3", "3"]
        r = B.modelo_animal(PED52, list(range(6, 16)), ww, sexo, 20.0, 65.0, sigma2_pe=15.0, rotulos_pe=familia)
        self.assertPublicados(_fixos(r, ["GC=Male", "GC=Female"]), [91.493, 75.764], 3)
        self.assertPublicados(r.ebv, [-1.441, -1.175, 1.441, 1.441, -0.266, -1.098, -1.667, -2.334, 3.925,
                                      2.895, -1.141, 1.525, 0.448, 0.545, -3.819], 3)
        self.assertPublicados([r.ambiente_permanente[f] for f in ("1", "2", "3")], [-1.762, 2.161, -0.399], 3)

    def test_leitegada_exemplo_9_1_sem_efeito_associativo(self):
        # Chapter_09_2.R, Exemplo 9.1 sem efeitos associativos: baia e sexo fixos, leitegada
        # aleatória (σ²a = 25,7, σ²c = 12,5, σ²e = 40,6 + 2·10 = 60,6).
        gr = [5.50, 9.80, 4.90, 8.23, 7.50, 10.0, 4.50, 8.40, 6.40]
        sexo = ["Male", "Female", "Female", "Male", "Female", "Female", "Male", "Female", "Male"]
        baia = ["1", "1", "1", "2", "2", "2", "3", "3", "3"]
        leitegada = ["1", "1", "2", "1", "2", "3", "2", "3", "3"]
        r = B.modelo_animal(PED9, list(range(7, 16)), gr, baia, 25.7, 40.6 + 2 * 10.0, sigma2_pe=12.5,
                            rotulos_pe=leitegada, outros_fatores={"sexo": sexo})
        self.assertPublicados(_fixos(r, ["GC=1", "GC=2", "GC=3", "sexo=Female"]), [5.160, 7.131, 5.838, 2.169], 3)
        self.assertPublicados(r.ebv, [0.336, -0.478, 0.142, 0.336, -0.478, 0.142, 0.280, 0.652, -0.738,
                                      0.412, -0.628, 0.216, -0.547, 0.162, 0.192], 3)
        self.assertPublicados([r.ambiente_permanente[f] for f in ("1", "2", "3")], [0.327, -0.465, 0.138], 3)

    def test_rotulos_pe_exige_variancia(self):
        with self.assertRaises(ValueError):
            B.modelo_animal(PED4, ANIM4, WWG4, SEXO4, 20.0, 40.0, rotulos_pe=["a"] * 5)


class TestMulticaracteristicaEMaternoMrode(TesteRelatorio):
    def test_multicaracteristica_exemplo_6_1(self):
        # Chapter_06.R, Exemplo 6.1: WWG e PWG, G₀ = [[20, 18], [18, 40]], R₀ = [[40, 11], [11, 30]].
        Y = np.column_stack([WWG4, [6.8, 5.0, 6.8, 6.0, 7.5]])
        r = B.modelo_multicaracteristica(PED4, ANIM4, Y, SEXO4, G0=[[20, 18], [18, 40]], R0=[[40, 11], [11, 30]])
        fixos = [r.efeitos_fixos[(c, s)] for c in ("c1", "c2") for s in ("Male", "Female")]
        self.assertPublicados(fixos, [4.361, 3.397, 6.800, 5.880], 3)
        self.assertPublicados(r.ebv[:, 0], [0.151, -0.015, -0.078, -0.010, -0.270, 0.276, -0.316, 0.244], 3)
        self.assertPublicados(r.ebv[:, 1], [0.280, -0.008, -0.170, -0.013, -0.478, 0.517, -0.479, 0.392], 3)

    def test_direto_materno_exemplo_8_1(self):
        # Chapter_08.R, Exemplo 8.1: peso ao nascer, baia e rebanho fixos, G = [[150, −40], [−40, 90]],
        # σ²pe = 40 (ambiente permanente materno), σ²e = 350.
        bw = [35.0, 20.0, 25.0, 40.0, 42.0, 22.0, 35.0, 34.0, 20.0, 40.0]
        baia = ["1", "2", "2", "1", "1", "2", "2", "2", "1", "2"]
        rebanho = ["1", "1", "1", "1", "2", "2", "2", "3", "3", "3"]
        maes = [2, 2, 6, 5, 6, 2, 7, 7, 2, 6]
        r = B.modelo_direto_materno(PED8, list(range(5, 15)), maes, bw, baia, G0=[[150, -40], [-40, 90]],
                                    sigma2_pe=40.0, sigma2_e=350.0, outros_fatores={"rebanho": rebanho})
        self.assertPublicados(list(r.efeitos_fixos.values()), [34.540, 27.691, 3.386, 1.434], 3)
        self.assertPublicados(r.ebv_direto, [0.564, -1.244, 1.165, -0.484, 0.630, -0.859, -1.156, 1.917,
                                             -0.553, -1.055, 0.385, 0.863, -2.980, 1.751], 3)
        self.assertPublicados(r.ebv_materno, [0.262, -1.583, 0.736, 0.586, -0.507, 0.841, 1.299, -0.158,
                                              0.660, -0.153, 0.916, 0.442, 0.093, 0.362], 3)
        self.assertPublicados([r.ambiente_permanente[m] for m in (2, 5, 6, 7)], [-1.701, 0.415, 0.825, 0.461], 3)


class TestGruposEGaussSeidelMrode(TesteRelatorio):
    def test_grupos_de_pais_desconhecidos_exemplo_4_4(self):
        # Chapter_04_3.R, Exemplo 4.4: round(solutions_QP, 3), com o grupo 9 fixado em zero. Os
        # EBVs já incluem o efeito do grupo (â* = Qĝ + â).
        ped = {1: (9, 10), 2: (9, 10), 3: (9, 10), 4: (1, 10), 5: (3, 2), 6: (1, 2), 7: (4, 5), 8: (3, 6)}
        r = B.modelo_animal(ped, ANIM4, WWG4, SEXO4, 20.0, 40.0, grupos_geneticos=[9, 10])
        self.assertPublicados(_fixos(r, ["GC=Male", "GC=Female"]), [5.458, 4.313], 3)
        self.assertPublicados(r.ebv, [-0.767, -0.923, -0.963, -1.268, -1.099, -0.728, -1.338, -0.768], 3)
        self.assertEqual(r.grupos_geneticos[9], 0.0)
        self.assertPublicado(r.grupos_geneticos[10], -1.769, 3)

    def test_grupos_exigem_grupo_para_todo_pai_desconhecido(self):
        ped = {1: (9, 10), 2: (9, 10), 3: (9, 10), 4: (1, 0), 5: (3, 2), 6: (1, 2), 7: (4, 5), 8: (3, 6)}
        with self.assertRaises(ValueError):
            B.modelo_animal(ped, ANIM4, WWG4, SEXO4, 20.0, 40.0, grupos_geneticos=[9, 10])

    def test_gauss_seidel_exemplo_19_2(self):
        # Chapter_19.R, Exemplo 19.2: as MME do Exemplo 4.1 por Gauss-Seidel, com a partida do livro
        # e 20 voltas. round(solutions_all, 3): colunas das voltas 1, 2 e 20 (a última linha é o
        # critério Σ(Δx)²/Σx²).
        X, _ = B.montar_X(SEXO4)
        Ainv, ids = P.inversa_A(PED4)
        Z, _ = B.incidencia(ANIM4, ids)
        LHS, RHS = B.montar_mme(X, Z, np.array(WWG4), Ainv, 40.0 / 20.0)
        partida = [4.333, 3.400, 0.000, 0.000, 0.000, 0.167, -0.500, 0.500, -0.833, 0.667]
        gs = B.gauss_seidel(LHS, RHS, x0=partida, iteracoes_max=20, tolerancia=0.0, guardar_historico=True)
        self.assertEqual(gs.iteracoes, 20)
        self.assertPublicados(list(gs.historico[0]) + [gs.convergencia[0]],
                              [4.333, 3.400, 0.333, -0.083, -0.021, -0.119, -0.376, 0.392, -0.364, 0.282, 0.019], 3)
        self.assertPublicados(list(gs.historico[1]) + [gs.convergencia[1]],
                              [4.400, 3.392, 0.194, -0.035, -0.136, 0.001, -0.261, 0.254, -0.284, 0.167, 0.003], 3)
        self.assertPublicados(list(gs.historico[19]) + [gs.convergencia[19]],
                              [4.359, 3.405, 0.098, -0.019, -0.041, -0.009, -0.186, 0.177, -0.250, 0.183, 0.000], 3)
        # Critério nas três primeiras voltas (objeto solutions_all, 3 algarismos significativos).
        np.testing.assert_allclose(gs.convergencia[:3], [1.920e-02, 3.410e-03, 3.084e-04], rtol=1e-3)
        # Sem limite de voltas, converge para a solução direta (Exemplo 4.1).
        direto = np.linalg.solve(LHS, RHS)
        self.assertLess(np.abs(B.gauss_seidel(LHS, RHS).solucao - direto).max(), 1e-5)


if __name__ == "__main__":
    unittest.main()
