"""Testes de melhoramento.lactacao: TIM/Fleischmann, curvas, sólidos e células somáticas."""

import math
import unittest

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import lactacao as L

# Relatório de leite, "Do controle ao total": vaca fictícia com 10 controles.
DEL = np.array([12, 42, 73, 101, 133, 162, 194, 224, 255, 286.0])
LEITE = np.array([24.0, 29.5, 30.2, 28.6, 27.1, 25.0, 23.4, 21.2, 19.5, 17.6])
GORD = np.array([3.9, 3.5, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2])
PROT = np.array([3.1, 3.0, 3.0, 3.1, 3.2, 3.3, 3.3, 3.4, 3.5, 3.5])
CCS = np.array([80, 120, 95, 150, 210, 180, 260, 140, 300, 220.0])

# Relatório de caprinos, Exemplo 1: Wood "verdadeira" (1,55; 0,23; 0,0048), secagem no dia 290,
# controles nos dias 10 a 280 com erro de −4% a +5%.
WOOD_CABRA = (1.55, 0.23, 0.0048)
DIAS_CABRA = np.array([10, 40, 70, 100, 130, 160, 190, 220, 250, 280.0])
RUIDO_CABRA = np.array([0.05, -0.03, 0.02, -0.04, 0.03, 0.00, -0.02, 0.04, -0.03, 0.02])
LEITE_CABRA = np.round(L.wood(DIAS_CABRA, *WOOD_CABRA) * (1 + RUIDO_CABRA), 2)

# Relatório de ovinos, Exemplo 1: Wood (1,20; 0,25; 0,0095), mamada até o dia 30, secagem no 200.
WOOD_OVELHA = (1.20, 0.25, 0.0095)
DIAS_OVELHA = np.array([40, 70, 100, 130, 160, 190.0])
LEITE_OVELHA = np.round(L.wood(DIAS_OVELHA, *WOOD_OVELHA) *
                        (1 + np.array([0.04, -0.03, 0.02, -0.04, 0.03, -0.02])), 2)


class TestTIMVaca(TesteRelatorio):
    def test_tim_10_controles(self):
        # Relatório de leite: "A soma dá 7.469,4 kg de leite"; 277,5 kg de gordura (3,72%) e
        # 240,3 kg de proteína (3,22%); trimestral (controles 1, 4, 7, 10) 7.267,1 kg, 2,7% abaixo.
        leite = L.tim(DEL, LEITE)
        gord = L.producao_componente(DEL, LEITE, GORD, 305)
        prot = L.producao_componente(DEL, LEITE, PROT, 305)
        self.assertPublicado(leite, 7469.4, 1)
        self.assertPublicado(gord, 277.5, 1)
        self.assertPublicado(prot, 240.3, 1)
        self.assertPublicado(100 * gord / leite, 3.72, 2)
        self.assertPublicado(100 * prot / leite, 3.22, 2)
        trimestral = L.tim(DEL[[0, 3, 6, 9]], LEITE[[0, 3, 6, 9]])
        self.assertPublicado(trimestral, 7267.1, 1)
        self.assertPublicado(100 * (trimestral / leite - 1), -2.7, 1)

    def test_fcm_ecm(self):
        # Relatório de leite: FCM = 7.150,5 kg; ECM = 7.100,4 kg (divisor 3,140) e 7.160,2 kg (3,1138).
        leite = L.tim(DEL, LEITE)
        gord = L.producao_componente(DEL, LEITE, GORD, 305)
        prot = L.producao_componente(DEL, LEITE, PROT, 305)
        self.assertPublicado(L.fcm4(leite, gord), 7150.5, 1)
        g_pct, p_pct = 100 * gord / leite, 100 * prot / leite
        self.assertPublicado(L.ecm(leite, g_pct, p_pct), 7100.4, 1)
        self.assertPublicado(L.ecm(leite, g_pct, p_pct, L.ECM_DIVISOR_4G_3_3P), 7160.2, 1)
        # O divisor 3,1138 é o numerador com 4,0% e 3,3%; com 3,140 esse leite vale 0,992.
        self.assertPublicado(L.ecm(1.0, 4.0, 3.3, 1.0), 3.1138, 4)
        self.assertPublicado(L.ecm(1.0, 4.0, 3.3), 0.992, 3)

    def test_ecs(self):
        # Relatório de leite: ECS por controle e média geométrica de 162 mil contra aritmética de 176 mil.
        self.assertPublicados(L.ecs(CCS), [2.68, 3.26, 2.93, 3.58, 4.07, 3.85, 4.38, 3.49, 4.58, 4.14], 2)
        self.assertPublicado(float(np.mean(L.ecs(CCS))), 3.70, 2)
        self.assertPublicado(L.ccs_media_geometrica(CCS), 162, 0)
        self.assertPublicado(float(np.mean(CCS)), 176, 0)
        # 50, 100, 200, 400 e 800 mil → 2, 3, 4, 5 e 6.
        self.assertEqual([L.ecs(c) for c in (50, 100, 200, 400, 800)], [2.0, 3.0, 4.0, 5.0, 6.0])


class TestCurvas(TesteRelatorio):
    def test_wood_log_linear(self):
        # Relatório de leite, "Curvas de lactação": a = 13,356; b = 0,2572; c = 0,00413; pico no dia
        # 62,3 com 29,89 kg; L305 7.441,1 kg; RMSE 0,203.
        a, b, c = L.ajustar_wood_loglinear(DEL, LEITE)
        self.assertPublicado(a, 13.356, 3)
        self.assertPublicado(b, 0.2572, 4)
        self.assertPublicado(c, 0.00413, 5)
        tp, yp = L.pico_wood(a, b, c)
        self.assertPublicado(tp, 62.3, 1)
        self.assertPublicado(yp, 29.89, 2)
        self.assertPublicado(L.total_pela_curva(lambda t: L.wood(t, a, b, c), 305), 7441.1, 1)
        self.assertPublicado(L.rmse(LEITE, L.wood(DEL, a, b, c)), 0.203, 3)

    def test_wood_gauss_newton(self):
        # Relatório de leite: 6 iterações; a = 13,336; b = 0,2582; c = 0,00415; pico 62,2 d e 29,93 kg;
        # L305 7.440,9; RMSE 0,201; y(60, 100, 200, 300) = 29,92; 28,92; 22,84; 16,75; y300/y100 0,579.
        a, b, c, it = L.ajustar_wood_gauss_newton(DEL, LEITE)
        self.assertEqual(it, 6)
        self.assertPublicado(a, 13.336, 3)
        self.assertPublicado(b, 0.2582, 4)
        self.assertPublicado(c, 0.00415, 5)
        tp, yp = L.pico_wood(a, b, c)
        self.assertPublicado(tp, 62.2, 1)
        self.assertPublicado(yp, 29.93, 2)
        self.assertPublicado(L.total_pela_curva(lambda t: L.wood(t, a, b, c), 305), 7440.9, 1)
        self.assertPublicado(L.rmse(LEITE, L.wood(DEL, a, b, c)), 0.201, 3)
        self.assertPublicados(L.wood([60, 100, 200, 300], a, b, c), [29.92, 28.92, 22.84, 16.75], 2)
        self.assertPublicado(L.wood(300, a, b, c) / L.wood(100, a, b, c), 0.579, 3)

    def test_wilmink(self):
        # Relatório de leite: a = 34,787; b = −18,527; c = −0,05985; pico 54,8 d, 30,31 kg; L305 7.455,6;
        # RMSE 0,228; diferença para o TIM: Wood −0,38%, Wilmink −0,18%.
        a, b, c = L.ajustar_wilmink(DEL, LEITE)
        self.assertPublicados([a, b], [34.787, -18.527], 3)
        self.assertPublicado(c, -0.05985, 5)
        tp, yp = L.pico_wilmink(a, b, c)
        self.assertPublicado(tp, 54.8, 1)
        self.assertPublicado(yp, 30.31, 2)
        total = L.total_pela_curva(lambda t: L.wilmink(t, a, b, c), 305)
        self.assertPublicado(total, 7455.6, 1)
        self.assertPublicado(L.rmse(LEITE, L.wilmink(DEL, a, b, c)), 0.228, 3)
        self.assertPublicado(100 * (total / L.tim(DEL, LEITE) - 1), -0.18, 2)


class TestCaprinosExemplo1(TesteRelatorio):
    def test_curva_verdadeira(self):
        # Pico no dia 47,9 com 3,00 kg; 673,5 kg até a secagem; 612,1 kg até 250 d; 540,4 kg até 210 d.
        tp, yp = L.pico_wood(*WOOD_CABRA)
        self.assertPublicado(tp, 47.9, 1)
        self.assertPublicado(yp, 3.00, 2)
        curva = lambda t: L.wood(t, *WOOD_CABRA)  # noqa: E731
        self.assertPublicado(L.total_pela_curva(curva, 305, secagem=290), 673.5, 1)
        self.assertPublicado(L.total_pela_curva(curva, 250), 612.1, 1)
        self.assertPublicado(L.total_pela_curva(curva, 210), 540.4, 1)
        self.assertPublicados(LEITE_CABRA, [2.63, 2.90, 3.00, 2.66, 2.62, 2.31, 2.04, 1.94, 1.61, 1.51], 2)

    def test_tabela_tim_e_wood(self):
        # Tabela do Exemplo 1: TIM até a secagem (= PL305), TIM250, Wood PL250, Wood PL305 e pico.
        linhas = [(list(range(10)), 675.9, 614.0, 612.7, 674.9, 44.1, 3.00),
                  (list(range(6)), 736.1, 643.7, 619.0, 685.1, 44.0, 2.97),
                  ([1, 3, 5, 7, 9], 678.0, 614.4, 603.5, 667.0, 49.5, 2.90),
                  ([0, 1, 3, 5], 725.5, 633.1, 609.6, 676.8, 40.8, 2.89)]
        for idx, t305, t250, w250, w305, tp_pub, yp_pub in linhas:
            d, m = DIAS_CABRA[idx], LEITE_CABRA[idx]
            r305 = L.lactacao_pequenos_ruminantes(d, m, "caprino", secagem=290, comprimento=305)
            r250 = L.lactacao_pequenos_ruminantes(d, m, "caprino", secagem=290, comprimento=250)
            self.assertTrue(r305.completa)
            self.assertEqual(r305.tipo, "TMY")
            self.assertPublicado(r305.total, t305, 1)
            self.assertPublicado(r250.total, t250, 1)
            a, b, c = L.ajustar_wood_loglinear(d, m)
            curva = lambda t: L.wood(t, a, b, c)  # noqa: E731
            self.assertPublicado(L.total_pela_curva(curva, 250, secagem=290), w250, 1)
            self.assertPublicado(L.total_pela_curva(curva, 305, secagem=290), w305, 1)
            tp, yp = L.pico_wood(a, b, c)
            self.assertPublicado(tp, tp_pub, 1)
            self.assertPublicado(yp, yp_pub, 2)

    def test_sem_secagem_regra_icar(self):
        # "Sem data de secagem ... último controle mais metade do intervalo, 15 dias, daria 683,4 kg até
        # o dia 295."
        r = L.lactacao_pequenos_ruminantes(DIAS_CABRA, LEITE_CABRA, "caprino", comprimento=305)
        self.assertPublicado(r.total, 683.4, 1)
        self.assertEqual(r.ate_dia, 295)
        self.assertTrue(any("sem data de secagem" in a for a in r.avisos))

    def test_mamada_e_componentes(self):
        # TMM verdadeira (dias 46 a 290) = 551,5 kg, 81,9% da TMY; componentes 22,51 kg (3,33%) e
        # 20,38 kg (3,01%); Wood aos 10 controles a = 1,727, b = 0,198, c = 0,0045; persistência
        # y(240)/y(40) = 0,580 (verdadeira 0,578).
        curva = lambda t: L.wood(t, *WOOD_CABRA)  # noqa: E731
        tmm = L.total_pela_curva(curva, 290, inicio=46)
        self.assertPublicado(tmm, 551.5, 1)
        self.assertPublicado(100 * tmm / L.total_pela_curva(curva, 290), 81.9, 1)
        gord = L.producao_componente(DIAS_CABRA, LEITE_CABRA, [3.6, 3.2, 3.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8], 290)
        prot = L.producao_componente(DIAS_CABRA, LEITE_CABRA, [3.2, 2.9, 2.8, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4], 290)
        total = L.tim(DIAS_CABRA, LEITE_CABRA, 290)
        self.assertPublicados([gord, prot], [22.51, 20.38], 2)
        self.assertPublicados([100 * gord / total, 100 * prot / total], [3.33, 3.01], 2)
        a, b, c = L.ajustar_wood_loglinear(DIAS_CABRA, LEITE_CABRA)
        self.assertPublicados([a, b], [1.727, 0.198], 3)
        self.assertPublicado(c, 0.0045, 4)
        self.assertPublicado(L.wood(240, a, b, c) / L.wood(40, a, b, c), 0.580, 3)
        self.assertPublicado(L.wood(240, *WOOD_CABRA) / L.wood(40, *WOOD_CABRA), 0.578, 3)

    def test_celulas_somaticas(self):
        # Relatório de caprinos: 420 a 3.100 mil → SCS de 5,07 a 7,95, média 6,50, geométrica 1.135 mil,
        # aritmética 1.418 mil; limiares 200, 750, 1.000 e 1.750 mil → 4,00; 5,91; 6,32; 7,13.
        ccs = [420, 610, 950, 1380, 2050, 3100]
        self.assertPublicados(L.ecs(ccs), [5.07, 5.61, 6.25, 6.79, 7.36, 7.95], 2)
        self.assertPublicado(float(np.mean(L.ecs(ccs))), 6.50, 2)
        self.assertPublicado(L.ccs_media_geometrica(ccs), 1135, 0)
        self.assertPublicado(float(np.mean(ccs)), 1418, 0)
        self.assertPublicados([L.ecs(x) for x in (200, 750, 1000, 1750)], [4.00, 5.91, 6.32, 7.13], 2)


class TestOvinosExemplo1(TesteRelatorio):
    def test_curva_verdadeira(self):
        # Pico no dia 26,3 com 2,12 L/d; 58,4 L mamados; TMM verdadeira (31 a 200) 230,0 L; TMY 288,4 L;
        # TMM/TMY = 79,8%; inflexão em 78,9 d; controles 2,15; 1,73; 1,50; 1,13; 0,96; 0,72.
        tp, yp = L.pico_wood(*WOOD_OVELHA)
        self.assertPublicados([tp, yp], [26.3, 2.12], 1)
        self.assertPublicado(yp, 2.12, 2)
        curva = lambda t: L.wood(t, *WOOD_OVELHA)  # noqa: E731
        self.assertPublicado(L.total_pela_curva(curva, 30), 58.4, 1)
        self.assertPublicado(L.total_pela_curva(curva, 200, inicio=31), 230.0, 1)
        self.assertPublicado(L.total_pela_curva(curva, 200), 288.4, 1)
        self.assertPublicado(L.inflexao_wood(0.25, 0.0095), 78.9, 1)
        self.assertPublicados(LEITE_OVELHA, [2.15, 1.73, 1.50, 1.13, 0.96, 0.72], 2)

    def test_tabela_fleischmann_e_exponencial(self):
        # Tabela do Exemplo 1 (TMM com desmame no dia 30 e secagem no dia 200).
        linhas = [([0, 1, 2, 3, 4, 5], 231.3, 200, True, 230.1),
                  ([0, 2, 4], 243.2, 200, True, 235.6),
                  ([1, 2], 267.6, 200, True, 243.4),          # método D: 2 controles no meio
                  ([0, 1, 2, 3], 246.7, 200, True, 231.0),
                  ([0, 1, 4, 5], 79.7, 70, False, 227.7)]     # hiato de 90 dias: para no dia 70
        for idx, tmm, ate, completa, exp_pub in linhas:
            d, m = DIAS_OVELHA[idx], LEITE_OVELHA[idx]
            r = L.lactacao_pequenos_ruminantes(d, m, "ovino", secagem=200, separacao_crias=30,
                                               minimo_controles=2)
            self.assertEqual(r.tipo, "TMM")
            self.assertPublicado(r.total, tmm, 1)
            self.assertEqual(r.ate_dia, ate)
            self.assertEqual(r.completa, completa)
            a, k = L.ajustar_exponencial(d, m)
            self.assertPublicado(L.total_pela_curva(lambda t: a * np.exp(-k * t), 200, inicio=31), exp_pub, 1)

    def test_media_diaria_e_controles_at_ac(self):
        # 231,3/170 = 1,36 L/dia, ou 239,7 kg (× 1,036); AT 2,10 L/d e AC 1,75 L/d.
        tmm = L.fleischmann(DIAS_OVELHA, LEITE_OVELHA, fim=200, inicio=30).total
        self.assertPublicado(tmm / 170, 1.36, 2)
        self.assertPublicado(tmm * L.DENSIDADE_LEITE_OVELHA, 239.7, 1)
        self.assertPublicado(L.controle_at(1.05), 2.10, 2)
        self.assertPublicado(L.controle_ac(1.05, 132 + 88, 132), 1.75, 2)

    def test_escalas_de_celulas(self):
        # Relatório de ovinos: classes de Heddi (55, 110, 235, 795 mil) → 2,14; 3,14; 4,23; 5,99;
        # 250 mil → 4,32 numa escala e 17,93 na outra (diferença constante de 13,61); ovelha com 180, 240,
        # 410 e 1.350 mil → SCS médio 4,98, geométrica 393 mil, aritmética 545 mil; tanque 520, 600 e 380
        # mil → geométrica 491 mil.
        self.assertPublicados([L.ecs(c) for c in (55, 110, 235, 795)], [2.14, 3.14, 4.23, 5.99], 2)
        self.assertPublicado(L.ecs(250), 4.32, 2)
        self.assertPublicado(math.log2(250e3), 17.93, 2)
        self.assertPublicado(math.log2(1e5) - 3, 13.61, 2)
        ovelha = [180, 240, 410, 1350]
        self.assertPublicado(float(np.mean(L.ecs(ovelha))), 4.98, 2)
        self.assertPublicado(L.ccs_media_geometrica(ovelha), 393, 0)
        self.assertPublicado(L.ccs_media_geometrica([520, 600, 380]), 491, 0)


class TestRegrasICAR(TesteRelatorio):
    def test_validacoes(self):
        # Regras da Seção 16 da ICAR resumidas nos relatórios de caprinos e de ovinos.
        poucos = L.lactacao_pequenos_ruminantes([30, 60], [2.0, 1.8], "caprino", secagem=200)
        self.assertTrue(math.isnan(poucos.total))
        self.assertTrue(any("mínimo é 3" in a for a in poucos.avisos))
        tarde = L.lactacao_pequenos_ruminantes([90, 120, 150], [2.0, 1.8, 1.6], "caprino", secagem=200)
        self.assertTrue(any("limite de 80" in a for a in tarde.avisos))
        mamada = L.lactacao_pequenos_ruminantes([20, 50, 80, 110], [2.0, 1.9, 1.8, 1.6], "caprino",
                                                secagem=200, separacao_crias=45)
        self.assertEqual(mamada.tipo, "TMM")
        self.assertEqual(mamada.n_controles, 3)
        self.assertTrue(any("mamada" in a for a in mamada.avisos))
        with self.assertRaises(ValueError):
            L.fleischmann([30, 20], [1.0, 1.0], fim=100)


if __name__ == "__main__":
    unittest.main()
