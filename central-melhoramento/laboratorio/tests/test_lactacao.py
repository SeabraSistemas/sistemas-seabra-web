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


class TestEstritoNorma(TesteRelatorio):
    """Regras da Seção 16 da ICAR aplicadas com estrito_norma=True. Por padrão (False) o motor só
    avisa e calcula, como antes; os testes abaixo também travam esse padrão."""

    @staticmethod
    def _cabra(dias, secagem=250, **kw):
        return L.lactacao_pequenos_ruminantes(dias, [2.0] * len(dias), "caprino", secagem=secagem, **kw)

    def test_tabela_de_intervalos_por_metodo(self):
        # Seção 16, caprinos 2.5.1: A4/B4/C4/E4 = 30 dias; A5 = 36; A6 = 42; A7 = 49; AT, AC, AZ e AY = 30.
        # Hiato máximo (2.5.2) = 2 × o intervalo médio: 60, 72, 84 e 98 dias.
        medios = [L.intervalo_medio_do_metodo(m, "caprino") for m in ("A4", "B5", "c6", "E7", "AT", "AC", "AZ", "AY")]
        self.assertEqual(medios, [30.0, 36.0, 42.0, 49.0, 30.0, 30.0, 30.0, 30.0])
        self.assertEqual([2 * L.intervalo_medio_do_metodo(m, "caprino") for m in ("A4", "A5", "A6", "A7")],
                         [60.0, 72.0, 84.0, 98.0])
        # Ovinos, 1.2.4.1: 30 dias no A4, 36 no A5 e 42 no A6 (AT e AC: 30); não existe A7, AZ nem AY.
        self.assertEqual([L.intervalo_medio_do_metodo(m, "ovino") for m in ("A4", "A5", "A6", "AT", "AC")],
                         [30.0, 36.0, 42.0, 30.0, 30.0])
        for invalido, especie in (("A7", "ovino"), ("AZ", "ovino"), ("D4", "caprino"), ("A8", "caprino"), ("A", "caprino")):
            with self.assertRaises(ValueError):
                L.intervalo_medio_do_metodo(invalido, especie)

    def test_cabra_1o_controle_fora_da_janela_nao_calcula(self):
        # 2.4.2.1: 1º controle entre o 6º e o 80º dia; "there should be no lactation calculation".
        for dia, calcula in ((6, True), (80, True), (81, False), (95, False)):
            padrao = self._cabra([dia, dia + 30, dia + 60])
            estrito = self._cabra([dia, dia + 30, dia + 60], estrito_norma=True)
            self.assertFalse(math.isnan(padrao.total), "o padrão continua calculando, só avisa")
            self.assertEqual(math.isnan(estrito.total), not calcula, dia)
            self.assertEqual(estrito.completa, calcula, dia)
            self.assertEqual(any("sem cálculo" in a for a in estrito.avisos), not calcula, dia)
            if calcula:
                self.assertEqual(estrito.total, padrao.total)
        self.assertTrue(any("limite de 80" in a for a in self._cabra([95, 125, 155]).avisos))

    def test_cabra_antes_do_6o_dia_so_avisa(self):
        # 2.4.2.1 diz "no lactation calculation" só para a diferença maior que o limite superior; o
        # 1º controle antes do 6º dia continua sendo aviso, também no modo estrito.
        r = self._cabra([4, 34, 64], estrito_norma=True)
        self.assertFalse(math.isnan(r.total))
        self.assertTrue(any("antes do 6º dia" in a for a in r.avisos))

    def test_cabra_limite_maior_justificado_pela_raca(self):
        # 2.4.2.1: "save if the breed society justifies for its breed that the threshold should be higher".
        sem = self._cabra([95, 125, 155], estrito_norma=True)
        com = self._cabra([95, 125, 155], estrito_norma=True, limite_primeiro_controle=100)
        self.assertTrue(math.isnan(sem.total))
        self.assertFalse(math.isnan(com.total))
        self.assertEqual(com.total, self._cabra([95, 125, 155]).total)

    def test_mamada_media_mais_52_dias_exemplos_da_norma(self):
        # 1.2.3.2 (ovelhas) e 2.4.2.2 (cabras): parto → 1º controle ≤ mamada média + 52 dias; mamada de 0,
        # 25 e 45 dias dão 52, 77 e 97 dias. O motor usa o dia de separação da própria fêmea.
        for especie in ("ovino", "caprino"):
            for mamada, limite in ((0, 52), (25, 77), (45, 97)):
                for dia, calcula in ((limite, True), (limite + 1, False)):
                    r = L.lactacao_pequenos_ruminantes([dia, dia + 30, dia + 60], [2.0, 1.9, 1.8], especie,
                                                       secagem=250, separacao_crias=mamada, estrito_norma=True)
                    self.assertEqual(math.isnan(r.total), not calcula, (especie, mamada, dia))
                    self.assertEqual(r.tipo, "TMM")
                    padrao = L.lactacao_pequenos_ruminantes([dia, dia + 30, dia + 60], [2.0, 1.9, 1.8], especie,
                                                            secagem=250, separacao_crias=mamada)
                    self.assertFalse(math.isnan(padrao.total))

    def test_ovelha_sem_mamada_tambem_limita_em_52_dias(self):
        # Mamada de 0 dia (só fase colostral): 1º controle em até 52 dias do parto (1.2.3.2).
        ok = L.lactacao_pequenos_ruminantes([52, 82, 112], [2.0, 1.9, 1.8], "ovino", secagem=200, estrito_norma=True)
        no = L.lactacao_pequenos_ruminantes([53, 83, 113], [2.0, 1.9, 1.8], "ovino", secagem=200, estrito_norma=True)
        self.assertFalse(math.isnan(ok.total))
        self.assertTrue(math.isnan(no.total))
        with self.assertRaises(ValueError):    # a exceção da raça só existe para cabras
            L.lactacao_pequenos_ruminantes([53, 83, 113], [2.0] * 3, "ovino", secagem=200,
                                           estrito_norma=True, limite_primeiro_controle=100)

    def test_hiato_maximo_por_metodo_em_cabras(self):
        # 2.5.2: hiato máximo = 2 × intervalo médio do método = 60, 72, 84 e 98 dias (A4, A5, A6, A7); no
        # hiato maior o cálculo "is stopped" no controle (i); no igual, segue.
        for metodo, maximo in (("A4", 60), ("A5", 72), ("A6", 84), ("A7", 98), ("AT", 60), ("AC", 60)):
            dias_ok = [20, 20 + maximo, 20 + maximo + 20]
            dias_no = [20, 21 + maximo, 21 + maximo + 20]
            ok = self._cabra(dias_ok, secagem=300, estrito_norma=True, metodo=metodo)
            no = self._cabra(dias_no, secagem=300, estrito_norma=True, metodo=metodo)
            self.assertTrue(ok.completa, metodo)
            self.assertEqual(ok.ate_dia, 300, metodo)
            self.assertFalse(no.completa, metodo)
            self.assertEqual(no.ate_dia, 20, metodo)
            self.assertTrue(any("hiato" in a for a in no.avisos), metodo)

    def test_hiato_padrao_continua_60_em_cabras_sem_metodo(self):
        # O padrão do motor (A4) não muda: sem `metodo`, o hiato de 61 a 72 dias para a lactação mesmo
        # que o A5 o permita; quem usa A5 passa metodo="A5" (estrito) ou intervalo_medio=36 (padrão).
        dias = [20, 85, 105]                                   # hiato de 65 dias
        self.assertFalse(self._cabra(dias).completa)
        self.assertFalse(self._cabra(dias, estrito_norma=True).completa)
        self.assertTrue(self._cabra(dias, estrito_norma=True, metodo="A5").completa)
        self.assertTrue(self._cabra(dias, intervalo_medio=36.0).completa)

    def test_hiato_de_ovelhas_e_70_dias_em_qualquer_metodo(self):
        # 1.2.4.2: 70 dias (2 × 35) para ovelhas, mesmo nos métodos de 36 e 42 dias de intervalo médio.
        for metodo in (None, "A4", "A5", "A6", "AC"):
            ok = L.lactacao_pequenos_ruminantes([40, 110, 140], [2.0, 1.8, 1.7], "ovino", secagem=200,
                                                estrito_norma=True, metodo=metodo)
            no = L.lactacao_pequenos_ruminantes([40, 111, 141], [2.0, 1.8, 1.7], "ovino", secagem=200,
                                                estrito_norma=True, metodo=metodo)
            self.assertTrue(ok.completa, metodo)
            self.assertFalse(no.completa, metodo)
            self.assertEqual(no.ate_dia, 40, metodo)

    def test_ovelha_sem_secagem_termina_em_ultimo_mais_15(self):
        # Padrão (inalterado): 35/2 = 17,5 dias. Estrito: A4 tem 30 dias de intervalo médio (1.2.4.1), a regra
        # do meio intervalo é a de cabras (2.7.5) e vale por analogia, com aviso: 190 + 15 = dia 205.
        padrao = L.lactacao_pequenos_ruminantes(DIAS_OVELHA, LEITE_OVELHA, "ovino", separacao_crias=30)
        estrito = L.lactacao_pequenos_ruminantes(DIAS_OVELHA, LEITE_OVELHA, "ovino", separacao_crias=30,
                                                 estrito_norma=True)
        a5 = L.lactacao_pequenos_ruminantes(DIAS_OVELHA, LEITE_OVELHA, "ovino", separacao_crias=30,
                                            estrito_norma=True, metodo="A5")
        self.assertEqual(padrao.ate_dia, 207.5)
        self.assertEqual(estrito.ate_dia, 205.0)
        self.assertEqual(a5.ate_dia, 208.0)                    # 36/2 = 18 dias
        self.assertTrue(any("por analogia" in a for a in estrito.avisos))
        self.assertFalse(any("por analogia" in a for a in padrao.avisos))
        # Com secagem real o fim é o mesmo nos dois modos.
        com = L.lactacao_pequenos_ruminantes(DIAS_OVELHA, LEITE_OVELHA, "ovino", separacao_crias=30,
                                             secagem=200, estrito_norma=True)
        self.assertEqual(com.ate_dia, 200)

    def test_cabra_sem_secagem_meio_intervalo_do_metodo(self):
        # 2.7.5: último controle + metade do intervalo escolhido. A4: 280 + 15 = 295 (683,4 kg, Exemplo 1 de
        # caprinos); A5: 280 + 18 = 298; A6: 280 + 21; A7: 280 + 24,5.
        r4 = L.lactacao_pequenos_ruminantes(DIAS_CABRA, LEITE_CABRA, "caprino", comprimento=305,
                                            estrito_norma=True, metodo="A4")
        self.assertPublicado(r4.total, 683.4, 1)
        self.assertEqual(r4.ate_dia, 295)
        for metodo, fim in (("A5", 298.0), ("A6", 301.0), ("A7", 304.5)):
            r = L.lactacao_pequenos_ruminantes(DIAS_CABRA, LEITE_CABRA, "caprino", comprimento=305,
                                               estrito_norma=True, metodo=metodo)
            self.assertEqual(r.ate_dia, fim, metodo)

    def test_exemplos_oficiais_dos_relatorios_nao_mudam_no_modo_estrito(self):
        # Exemplo 1 de caprinos (675,9 kg) e de ovinos (231,3 L; hiato de 90 dias → 79,7 L no dia 70).
        c = L.lactacao_pequenos_ruminantes(DIAS_CABRA, LEITE_CABRA, "caprino", secagem=290, comprimento=305,
                                           estrito_norma=True, metodo="A4")
        self.assertPublicado(c.total, 675.9, 1)
        self.assertTrue(c.completa)
        for idx, tmm, ate, completa in (([0, 1, 2, 3, 4, 5], 231.3, 200, True), ([0, 1, 4, 5], 79.7, 70, False)):
            r = L.lactacao_pequenos_ruminantes(DIAS_OVELHA[idx], LEITE_OVELHA[idx], "ovino", secagem=200,
                                               separacao_crias=30, estrito_norma=True)
            self.assertPublicado(r.total, tmm, 1)
            self.assertEqual((r.ate_dia, r.completa), (ate, completa))

    def test_metodo_fora_do_modo_estrito_e_ignorado_com_aviso(self):
        base = self._cabra([20, 85, 105])
        com = self._cabra([20, 85, 105], metodo="A5")
        self.assertEqual((com.total, com.ate_dia, com.completa), (base.total, base.ate_dia, base.completa))
        self.assertTrue(any("ignorado" in a for a in com.avisos))
        with self.assertRaises(ValueError):
            self._cabra([20, 50, 80], estrito_norma=True, metodo="D4")

    def test_controle_ac_comentario_nao_cita_anexo_nao_transcrito(self):
        # O Anexo 1 da Seção 16 não traz a fórmula do AC (só a definição, nota 1); o texto do motor deve dizer isso.
        self.assertNotIn("não foi transcrito", L.controle_ac.__doc__)
        self.assertIn("não escreve a fórmula", L.controle_ac.__doc__)


if __name__ == "__main__":
    unittest.main()
