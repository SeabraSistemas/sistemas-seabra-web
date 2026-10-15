"""Testes de melhoramento.indices: Smith-Hazel, índices econômicos, MPPA e índice da fêmea."""

import unittest

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import indices as I


class TestSmithHazel(TesteRelatorio):
    def test_corte_pd_ps(self):
        # Relatório de corte, "Índice de seleção": P = [400 205; 205 625], G = [100 105; 105 225],
        # v = (2; 4) → b = (0,77; 1,52), r_IH = 0,62; com i = 1: 5,1 kg de PD, 9,1 kg de PS, R$ 46,6.
        r = I.smith_hazel([[400, 205], [205, 625]], [[100, 105], [105, 225]], [2, 4])
        self.assertPublicados(r.b, [0.77, 1.52], 2)
        self.assertPublicado(r.r_IH, 0.62, 2)
        self.assertPublicados(r.resposta_caracteristicas, [5.1, 9.1], 1)
        self.assertPublicado(r.dp_indice, 46.6, 1)


class TestIndiceEconomico(TesteRelatorio):
    def test_dois_touros_de_corte(self):
        # Relatório de corte: índice de ciclo completo A = 203,9 e B = 247,6; terminal A = 247,5 e
        # B = 130,0; DP do erro R$ 47,5 (r 0,90) e R$ 97,4 (r 0,45); P(B > A) = 66%; versão padronizada
        # A = 0,87 e B = 1,12.
        v = [10, 6, -40, 15, 8, 5]
        a = [12, 20, 0.5, -2, 0.8, 1.5]
        b = [6, 10, -1.2, 4, 1.2, 2]
        dp = [5, 7.5, 1, 5, 0.8, 2]
        ia, ib = I.indice_economico(v, a), I.indice_economico(v, b)
        self.assertPublicados([ia, ib], [203.9, 247.6], 1)
        terminal = [10, 6, 0, 0, 0, 5]
        self.assertPublicados([I.indice_economico(terminal, a), I.indice_economico(terminal, b)], [247.5, 130.0], 1)
        ea, eb = I.dp_erro_indice(v, 0.90 ** 2, dp), I.dp_erro_indice(v, 0.45 ** 2, dp)
        self.assertPublicados([ea, eb], [47.5, 97.4], 1)
        self.assertPublicado(I.prob_superar(ib, ia, eb, ea), 0.66, 2)
        sinais = [1, 1, -1, 1, 1, 1]
        pesos = [0.15, 0.20, 0.15, 0.30, 0.10, 0.10]
        self.assertPublicado(I.indice_padronizado(pesos, a, dp, sinais), 0.873, 3)
        self.assertPublicado(I.indice_padronizado(pesos, b, dp, sinais), 1.117, 3)

    def test_dois_touros_de_leite(self):
        # Relatório de leite, "Índices econômicos": A = 1.494,0 e B = 1.373,0; ênfases 1,9/31,0/30,4/
        # 20,9/11,2/4,6%; DP do erro 71,7 e 189,8; P(A > B) = 72,5%. Cenário 2 (leite −R$ 0,02 e DPR
        # R$ 120): B vence (1.458,6 contra 1.348,0) com 69,4%, e a ênfase da DPR sobe para 20,3%.
        v = [0.05, 20, 28, 90, 60, -250]
        a = [800, 40, 27, 0.2, -1.5, 0.12]
        b = [320, 27, 18, 2.0, 1.8, -0.10]
        dp = [250, 10, 7, 1.5, 1.2, 0.12]
        ia, ib = I.indice_economico(v, a), I.indice_economico(v, b)
        self.assertPublicados([ia, ib], [1494.0, 1373.0], 1)
        self.assertPublicados(100 * I.enfase_relativa(v, dp), [1.9, 31.0, 30.4, 20.9, 11.2, 4.6], 1)
        ea, eb = I.dp_erro_indice(v, 0.95, dp), I.dp_erro_indice(v, 0.65, dp)
        self.assertPublicados([ea, eb], [71.7, 189.8], 1)
        self.assertPublicado(100 * I.prob_superar(ia, ib, ea, eb), 72.5, 1)
        v2 = [-0.02, 20, 28, 90, 120, -250]
        ia2, ib2 = I.indice_economico(v2, a), I.indice_economico(v2, b)
        self.assertPublicados([ia2, ib2], [1348.0, 1458.6], 1)
        p_b = I.prob_superar(ib2, ia2, I.dp_erro_indice(v2, 0.65, dp), I.dp_erro_indice(v2, 0.95, dp))
        self.assertPublicado(100 * p_b, 69.4, 1)
        self.assertPublicado(100 * I.enfase_relativa(v2, dp)[4], 20.3, 1)
        # NM$ 2025, parcela de 4 características: A = 705,3 e B = 584,2 (US$).
        nm = [0.022, 5.01, 3.33, 30]
        self.assertPublicados([I.indice_economico(nm, [1800, 90, 60, 0.5]),
                               I.indice_economico(nm, [700, 60, 40, 4.5])], [705.3, 584.2], 1)

    def test_caprinos_exemplo_4(self):
        # Relatório de caprinos, Exemplo 4: IPC = MP + 0,4·TP + 0,2·MG + 0,1·TB; ICC Alpina = IPC + 0,5·IMC
        # e Saanen = IPC + 0,6·IMC; bode A 2,28/1,98/1,92 e B 1,74/2,34/2,46; MFP$ C = 13,75 e D = 18,77.
        bodes = {"A": [1.8, 0.4, 1.5, 0.2, -0.6], "B": [1.0, 1.2, 0.8, 1.0, 1.2]}
        esperado = {"A": [2.28, 1.98, 1.92], "B": [1.74, 2.34, 2.46]}
        for nome, ptas in bodes.items():
            ipc = I.indice_economico([1, 0.4, 0.2, 0.1, 0], ptas)
            alpina = I.indice_economico([1, 0.4, 0.2, 0.1, 0.5], ptas)
            saanen = I.indice_economico([1, 0.4, 0.2, 0.1, 0.6], ptas)
            self.assertPublicados([ipc, alpina, saanen], esperado[nome], 2)
        mfp = [0.01, 1.15, 2.55]
        self.assertPublicado(I.indice_economico(mfp, [150, 4, 3]), 13.75, 2)
        self.assertPublicado(I.indice_economico(mfp, [40, 6, 4.5]), 18.77, 2)

    def test_ovinos_exemplo_3(self):
        # Relatório de ovinos, Exemplo 3: o mesmo par de carneiros sob três índices (Barillet et al. 2016).
        a = {"QMG": 1.6, "QMP": 1.8, "TB": -0.4, "TP": -0.2, "CCS": -0.8, "MO": -0.5}
        b = {"QMG": 0.8, "QMP": 0.9, "TB": 0.5, "TP": 0.6, "CCS": 0.7, "MO": 0.9}
        pesos = {"Lacaune 1992": ({"QMG": 0.74, "QMP": 1.0, "TP": 0.58}, 2.868, 1.840),
                 "ISOL 2005": ({"QMG": 0.74, "QMP": 1.0, "TB": 0.22, "TP": 0.22, "CCS": 1.09, "MO": 1.09},
                               1.435, 3.478),
                 "MTR 2016": ({"QMG": 0.68, "QMP": 1.0, "TB": 0.34, "TP": 0.42, "CCS": 0.18}, 2.524, 1.992)}
        for nome, (w, ia, ib) in pesos.items():
            chaves = list(w)
            self.assertPublicado(I.indice_economico([w[k] for k in chaves], [a[k] for k in chaves]), ia, 3)
            self.assertPublicado(I.indice_economico([w[k] for k in chaves], [b[k] for k in chaves]), ib, 3)

    def test_probabilidade_pela_pta(self):
        # Consistência (fórmula da docstring): PTAs iguais → 50%; diferença de 1 DP do erro → Φ(1).
        self.assertAlmostEqual(I.prob_superar_pta(10, 0.5, 10, 0.9, 80), 0.5)
        sigma_a, rel = 80.0, 0.6
        dp_erro = np.sqrt(2 * (1 - rel) * sigma_a ** 2 / 4)
        self.assertAlmostEqual(I.prob_superar_pta(dp_erro, rel, 0, rel, sigma_a), 0.8413447460685429)


class TestMPPA(TesteRelatorio):
    def test_corte(self):
        # Relatório de corte, "razão BIF e MPPA": 4 crias de 230 kg, rebanho de 200 kg, r 0,33 → fator
        # 0,663 e MPPA 219,9 kg; razão 115 com r 0,20/0,33/0,51 e 1, 2 e 4 crias.
        self.assertPublicado(I.fator_mppa(4, 0.33), 0.663, 3)
        self.assertPublicado(I.mppa(230, 4, 0.33, 200), 219.9, 1)
        tabela = {0.20: [103.00, 105.00, 107.50], 0.33: [104.95, 107.44, 109.95], 0.51: [107.65, 110.13, 112.09]}
        for r, valores in tabela.items():
            self.assertPublicados([I.mppa(115, n, r, 100) for n in (1, 2, 4)], valores, 2)


class TestIndiceFemea(TesteRelatorio):
    def test_vacas_do_relatorio_de_leite(self):
        # Relatório de leite, "Comparar com contemporâneas": h² 0,25, r 0,50, σP 1.600 kg.
        vacas = {"V1": ([1200], 200, 0.95, 600.0, 402.7, 0.392),
                 "V2": ([900, 700, 800], 500, 0.99, 600.0, 593.3, 0.482),
                 "V3": ([1000, 400], 100, 0.60, 466.7, 278.9, 0.404),
                 "V4": ([600, 500, 700, 600], 0, 0.90, 480.0, 204.4, 0.489),
                 "V5": ([-300], 600, 0.95, -150.0, 417.6, 0.392),
                 "V6": ([-500, -100], -100, 0.80, -200.0, -157.1, 0.429)}
        for nome, (desvios, pta, rel, mppa, ebv, rel_vaca) in vacas.items():
            res = I.indice_femea(desvios, 0.25, 0.50, 1600, pta, rel)
            self.assertPublicado(I.mppa(np.mean(desvios), len(desvios), 0.50), mppa, 1)
            self.assertPublicado(res.ebv, ebv, 1)
            self.assertPublicado(res.confiabilidade, rel_vaca, 3)
        # V5: "o índice dá coeficiente de 0,20 ao desvio da vaca e de 0,80 à PTA do pai".
        self.assertPublicados(I.indice_femea([-300], 0.25, 0.5, 1600, 600, 0.95).pesos, [0.20, 0.80], 2)
        # A repetibilidade mexe na MPPA: com r 0,40, V2 passa V1 (533 contra 480); com 0,60, V1 lidera
        # (720 contra 655).
        self.assertPublicados([I.mppa(800, 3, 0.4), I.mppa(1200, 1, 0.4)], [533, 480], 0)
        self.assertPublicados([I.mppa(1200, 1, 0.6), I.mppa(800, 3, 0.6)], [720, 655], 0)

    def test_caprinos_exemplo_6_r_036(self):
        # Relatório de caprinos, Exemplo 6: h² 0,20, σP 200 kg, repetibilidade 0,36.
        cabras = {"C1": ([150], 40, 0.60, 54.0, (0.175, 0.825), 59.3, 29.6, 0.30),
                  "C2": ([120, 90, 100], 10, 0.80, 64.9, (0.300, 0.700), 38.0, 19.0, 0.44),
                  "C3": ([200, 40], None, 0.0, 63.5, (0.294,), 35.3, 17.6, 0.29),
                  "C4": ([-60], 60, 0.70, -21.6, (0.171, 0.829), 39.5, 19.7, 0.32),
                  "C5": ([-80, -40, -100, -50], 20, 0.50, -46.7, (0.354, 0.646), -10.9, -5.5, 0.43),
                  "C6": ([60, 80], -30, 0.60, 37.1, (0.262, 0.738), -3.8, -1.9, 0.37)}
        for nome, (desvios, pta, rel, mppa, pesos, ebv, pta_cabra, rel_cabra) in cabras.items():
            res = I.indice_femea(desvios, 0.20, 0.36, 200, pta, rel)
            self.assertPublicado(I.mppa(np.mean(desvios), len(desvios), 0.36), mppa, 1)
            self.assertPublicados(res.pesos, pesos, 3)
            self.assertPublicado(res.ebv, ebv, 1)
            self.assertPublicado(res.pta, pta_cabra, 1)
            self.assertPublicado(res.confiabilidade, rel_cabra, 2)

    def test_caprinos_exemplo_6_sensibilidade(self):
        # Mesmo exemplo: r 0,44 → MPPA de C3, C2, C1 = 73,3; 72,6; 66,0; r 0,50 → 80,0; 77,5; 75,0;
        # extremo inferior (h² 0,12; r 0,14) → 33,9 (C2); 29,5 (C3); 21,0 (C1), e peso de 0,90 na PTA do
        # pai de C1 e C4.
        self.assertPublicados([I.mppa(120, 2, 0.44), I.mppa(103.333333, 3, 0.44), I.mppa(150, 1, 0.44)],
                              [73.3, 72.6, 66.0], 1)
        self.assertPublicados([I.mppa(120, 2, 0.50), I.mppa(103.333333, 3, 0.50), I.mppa(150, 1, 0.50)],
                              [80.0, 77.5, 75.0], 1)
        self.assertPublicados([I.mppa(103.333333, 3, 0.14), I.mppa(120, 2, 0.14), I.mppa(150, 1, 0.14)],
                              [33.9, 29.5, 21.0], 1)
        self.assertPublicado(I.indice_femea([150], 0.12, 0.14, 200, 40, 0.60).pesos[1], 0.90, 2)
        self.assertPublicado(I.indice_femea([-60], 0.12, 0.14, 200, 60, 0.70).pesos[1], 0.90, 2)

    def test_ovinos_exemplo_5_ebv_do_pai(self):
        # Relatório de ovinos, Exemplo 5: h² 0,30, σP 60 L, EBV (não PTA) do pai. A REL (r 0,41) é
        # conferida com a saída do Apêndice A (3 casas); ver a discrepância de O2 no fim do teste.
        ovelhas = {"O1": ([40], 30, 0.90, (16.4, 20.0), (0.249, 0.375), (21.2, 21.2), 0.418),
                   "O2": ([25, 15, 20], None, 0.0, (13.5, 15.0), (0.495,), (9.9, 9.0), 0.495),
                   "O3": ([55, 5], 10, 0.40, (17.4, 20.0), (0.400, 0.300), (15.0, 14.4), 0.460),
                   "O4": ([-20], 40, 0.85, (-8.2, -10.0), (0.252, 0.374), (9.9, 9.9), 0.411),
                   "O5": ([-30, -15, -25, -20], 5, 0.40, (-16.5, -18.0), (0.512, 0.244), (-10.3, -8.8), 0.561),
                   "O6": ([30, 35], -20, 0.60, (18.9, 21.7), (0.386, 0.307), (6.4, 5.4), 0.478)}
        for nome, (desvios, ebv_pai, rel, mppas, pesos, ebvs, rel41) in ovelhas.items():
            r41 = I.indice_femea(desvios, 0.30, 0.41, 60, ebv_pai, rel, escala_pai="EBV")
            r50 = I.indice_femea(desvios, 0.30, 0.50, 60, ebv_pai, rel, escala_pai="EBV")
            n, media = len(desvios), np.mean(desvios)
            self.assertPublicados([I.mppa(media, n, 0.41), I.mppa(media, n, 0.50)], mppas, 1)
            self.assertPublicados(r41.pesos, pesos, 3)
            self.assertPublicados([r41.ebv, r50.ebv], ebvs, 1)
            self.assertPublicado(r41.confiabilidade, rel41, 3)
        # DISCREPÂNCIA: a tabela mostra REL 0,50 para O2 (r 0,41), mas o valor exato é 0,4945, isto é,
        # 0,49 (o apêndice imprime 0,495 e a tabela arredondou de novo).
        self.assertPublicado(I.indice_femea([25, 15, 20], 0.30, 0.41, 60).confiabilidade, 0.49, 2)

    def test_escala_do_pai_nao_muda_o_ebv(self):
        # Consistência: EBV do pai = 2 × PTA dá o mesmo EBV e a mesma REL da fêmea.
        pta = I.indice_femea([40, 10], 0.3, 0.45, 60, 15, 0.8, escala_pai="PTA")
        ebv = I.indice_femea([40, 10], 0.3, 0.45, 60, 30, 0.8, escala_pai="EBV")
        self.assertAlmostEqual(pta.ebv, ebv.ebv)
        self.assertAlmostEqual(pta.confiabilidade, ebv.confiabilidade)
        self.assertAlmostEqual(pta.pesos[1], 2 * ebv.pesos[1])
        # Sem pai: b = n·h²/[1 + (n − 1)·r] e EBV = b·ȳ (registros próprios).
        so = I.indice_femea([25, 15, 20], 0.3, 0.41, 60)
        self.assertAlmostEqual(so.ebv, I.ebv_registros_proprios(20, 3, 0.3, 0.41))


if __name__ == "__main__":
    unittest.main()
