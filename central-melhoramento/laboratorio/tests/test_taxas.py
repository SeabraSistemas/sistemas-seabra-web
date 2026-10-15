"""Testes de melhoramento.taxas: núcleo numérico, intervalos de confiança, tamanho amostral e CUSUM."""

import math
import random
import unittest
from statistics import NormalDist

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import taxas as T


def _pct(par):
    return [100 * par[0], 100 * par[1]]


class TestNucleoNumerico(TesteRelatorio):
    """Conferência das rotinas que substituem o scipy contra a biblioteca padrão do Python."""

    def test_log_gama_lanczos(self):
        for x in (0.01, 0.1, 0.5, 1, 1.5, 2, 3.7, 10, 30.5, 100, 1000, 1e5):
            self.assertLess(abs(T.log_gama(x) - math.lgamma(x)), 1e-13 * max(1.0, abs(math.lgamma(x))))

    def test_erfc_pela_gama_incompleta(self):
        for i in range(-60, 90):
            x = i / 10
            self.assertLess(abs(T.erfc(x) - math.erfc(x)), 1e-13 * math.erfc(x))

    def test_inversa_da_normal_acklam_com_refinamento(self):
        nd = NormalDist()
        pontos = [1e-300, 1e-100, 1e-12, 1e-4, 0.02425, 0.1, 0.5, 0.9, 0.975, 0.999999, 1 - 1e-12]
        rng = random.Random(1)
        pontos += [rng.random() for _ in range(2000)]
        for p in pontos:
            self.assertLess(abs(T.norm_ppf(p) - nd.inv_cdf(p)), 1e-12 * max(1.0, abs(nd.inv_cdf(p))))
        self.assertAlmostEqual(T.norm_ppf(0.975), 1.959963984540054, places=14)

    def test_beta_incompleta_e_t(self):
        # I_x(1, 1) = x; I_x(a, b) = 1 − I_{1−x}(b, a); quantis da t usados nos relatórios.
        self.assertAlmostEqual(T.beta_incompleta_regularizada(0.3, 1, 1), 0.3)
        self.assertAlmostEqual(T.beta_incompleta_regularizada(0.2, 2.5, 7),
                               1 - T.beta_incompleta_regularizada(0.8, 7, 2.5))
        # I_x(a, 1) = x^a
        self.assertAlmostEqual(T.beta_incompleta_regularizada(0.6, 4, 1), 0.6 ** 4)
        self.assertAlmostEqual(T.beta_quantil(T.beta_incompleta_regularizada(0.37, 6, 25), 6, 25), 0.37, places=12)
        # t(29; 0,975) = 2,045 (caprinos, Exemplo 7) e t(35; 0,975) = 2,030 (ovinos, Exemplo 6).
        self.assertPublicado(T.t_quantil(0.975, 29), 2.045, 3)
        self.assertPublicado(T.t_quantil(0.975, 35), 2.030, 3)
        self.assertAlmostEqual(T.t_cdf(0.0, 7), 0.5)
        # Com muitos graus de liberdade, a t vira normal.
        self.assertAlmostEqual(T.t_quantil(0.975, 1e7), T.norm_ppf(0.975), places=5)

    def test_exato_pela_beta_igual_ao_da_soma_binomial(self):
        # O intervalo de Clopper-Pearson pela beta incompleta coincide com a bisseção na soma binomial
        # (o método dos scripts dos relatórios).
        for x, n in ((0, 10), (1, 20), (6, 30), (13, 25), (36, 40), (50, 50), (3, 120)):
            a, b = T.ic_exato(x, n), T.ic_exato_por_binomial(x, n)
            self.assertAlmostEqual(a[0], b[0], places=10)
            self.assertAlmostEqual(a[1], b[1], places=10)


class TestIntervalos(TesteRelatorio):
    def test_leite_tabela_de_taxas(self):
        # Relatório de leite, "Toda taxa precisa de intervalo de confiança": Wald, Wilson e exato.
        # Destaque: prenhez de 6 em 30 elegíveis → exato de 7,7% a 38,6%.
        casos = [(6, 30, (5.7, 34.3), (9.5, 37.3), (7.7, 38.6)),
                 (20, 100, (12.2, 27.8), (13.3, 28.9), (12.7, 29.2)),
                 (14, 35, (23.8, 56.2), (25.6, 56.4), (23.9, 57.9)),
                 (1, 20, (-4.6, 14.6), (0.9, 23.6), (0.1, 24.9)),
                 (0, 25, (0.0, 0.0), (0.0, 13.3), (0.0, 13.7))]
        for x, n, wald, wilson, exato in casos:
            self.assertPublicados(_pct(T.ic_wald(x, n)), wald, 1)
            self.assertPublicados(_pct(T.ic_wilson(x, n)), wilson, 1)
            self.assertPublicados(_pct(T.ic_exato(x, n)), exato, 1)

    def test_caprinos_exemplo_7(self):
        # Relatório de caprinos, Exemplo 7: taxas com 30 cabras.
        casos = [(26, 30, (74.5, 98.8), (70.3, 94.7), (69.3, 96.2)),
                 (3, 30, (-0.7, 20.7), (3.5, 25.6), (2.1, 26.5)),
                 (9, 30, (13.6, 46.4), (16.7, 47.9), (14.7, 49.4)),
                 (4, 30, (1.2, 25.5), (5.3, 29.7), (3.8, 30.7)),
                 (14, 30, (28.8, 64.5), (30.2, 63.9), (28.3, 65.7)),
                 (0, 30, (0.0, 0.0), (0.0, 11.4), (0.0, 11.6))]
        for x, n, wald, wilson, exato in casos:
            self.assertPublicados(_pct(T.ic_wald(x, n)), wald, 1)
            self.assertPublicados(_pct(T.ic_wilson(x, n)), wilson, 1)
            self.assertPublicados(_pct(T.ic_exato(x, n)), exato, 1)

    def test_ovinos_exemplo_6(self):
        # Relatório de ovinos, Exemplo 6: taxas com 40 ovelhas.
        casos = [(36, 40, (80.7, 99.3), (76.9, 96.0), (76.3, 97.2)),
                 (13, 25, (32.4, 71.6), (33.5, 70.0), (31.3, 72.2)),
                 (5, 50, (1.7, 18.3), (4.3, 21.4), (3.3, 21.8)),
                 (7, 40, (5.7, 29.3), (8.7, 31.9), (7.3, 32.8)),
                 (5, 40, (2.3, 22.7), (5.5, 26.1), (4.2, 26.8)),
                 (11, 40, (13.7, 41.3), (16.1, 42.8), (14.6, 43.9)),
                 (0, 40, (0.0, 0.0), (0.0, 8.8), (0.0, 8.8))]
        for x, n, wald, wilson, exato in casos:
            self.assertPublicados(_pct(T.ic_wald(x, n)), wald, 1)
            self.assertPublicados(_pct(T.ic_wilson(x, n)), wilson, 1)
            self.assertPublicados(_pct(T.ic_exato(x, n)), exato, 1)

    def test_erro_binomial_corte(self):
        # Relatório de corte, "Indicadores precisam de intervalo de confiança": prenhez de 85% com 100,
        # 500 e 2.000 vacas → EP de 3,6; 1,6 e 0,8 pontos e IC95 de ±7,0; ±3,1 e ±1,6.
        for n, ep, meia in ((100, 3.6, 7.0), (500, 1.6, 3.1), (2000, 0.8, 1.6)):
            li, ls = T.ic_wald(int(0.85 * n), n)
            self.assertPublicado(100 * math.sqrt(0.85 * 0.15 / n), ep, 1)
            self.assertPublicado(100 * (ls - li) / 2, meia, 1)

    def test_prolificidade(self):
        # Caprinos, Exemplo 7: 12 simples, 15 duplos e 3 triplos → 1,70 (DP 0,65; IC 1,46 a 1,94).
        # Ovinos, Exemplo 6: 18 simples, 16 duplos e 2 triplos → 1,56 (DP 0,61; IC 1,35 a 1,76).
        m, dp, li, ls = T.ic_media_t([1] * 12 + [2] * 15 + [3] * 3)
        self.assertPublicados([m, dp, li, ls], [1.70, 0.65, 1.46, 1.94], 2)
        m, dp, li, ls = T.ic_media_t([1] * 18 + [2] * 16 + [3] * 2)
        self.assertPublicados([m, dp, li, ls], [1.56, 0.61, 1.35, 1.76], 2)

    def test_taxa_encolhida_beta(self):
        # Relatório de leite: priori Beta(10, 40); 6, 2 e 12 prenhezes em 30 → 20%, 15% e 27,5%.
        self.assertPublicados([T.taxa_encolhida(x, 30, 10, 40) for x in (6, 2, 12)], [0.20, 0.15, 0.275], 3)


class TestTamanhoAmostral(TesteRelatorio):
    def test_ovinos_434_435(self):
        # Relatório de ovinos, Exemplo 6: fertilidade de 90% contra 95% com 80% de poder e 5% → o valor
        # bruto é 434,4, e o relatório publica 435 ovelhas por ano (arredondado para cima); poder de 13%
        # com 40. Os demais: 10 × 20% → 199 (29% com 50); 52 × 65% → 225 (15% com 25); 25 × 10% → 100
        # (42% com 40).
        self.assertPublicado(T.tamanho_amostral_duas_proporcoes(0.90, 0.95), 434.4, 1)
        self.assertEqual(T.n_por_grupo(0.90, 0.95), 435)
        self.assertPublicado(T.poder_duas_proporcoes(0.90, 0.95, 40), 0.13, 2)
        for p1, p2, n, n_pub, poder in ((0.10, 0.20, 50, 199, 0.29), (0.52, 0.65, 25, 225, 0.15),
                                        (0.25, 0.10, 40, 100, 0.42)):
            self.assertEqual(T.n_por_grupo(p1, p2), n_pub)
            self.assertPublicado(T.poder_duas_proporcoes(p1, p2, n), poder, 2)

    def test_caprinos_exemplo_7(self):
        # Relatório de caprinos, Exemplo 7: 10 × 20% → 199 (poder 0,19 com 30); 10 × 30% → 62 (0,49);
        # 80 × 90% → 199 (0,19); 30 × 15% → 121 (0,28).
        for p1, p2, n_pub, poder in ((0.10, 0.20, 199, 0.19), (0.10, 0.30, 62, 0.49),
                                     (0.80, 0.90, 199, 0.19), (0.30, 0.15, 121, 0.28)):
            self.assertEqual(T.n_por_grupo(p1, p2), n_pub)
            self.assertPublicado(T.poder_duas_proporcoes(p1, p2, 30), poder, 2)

    def test_leite_variancia_separada(self):
        # Relatório de leite: 20 × 30% → 291 oportunidades por grupo; 20 × 35% → 136; 35 × 45% → 373.
        for p1, p2, n_pub in ((0.20, 0.30, 291), (0.20, 0.35, 136), (0.35, 0.45, 373)):
            self.assertEqual(T.n_por_grupo(p1, p2, variancia="separada"), n_pub)


class TestCUSUM(TesteRelatorio):
    def test_cusum_superior_e_inferior(self):
        # Exemplo construído (a forma S_t = máx(0; S_{t−1} + x_t − μ₀ − k) está nos relatórios de leite
        # e de caprinos; não há série numérica publicada). Abortos por mês com alvo 1 e folga 0,5.
        trajetoria, alarme = T.cusum([1, 0, 2, 3, 2, 1, 3], alvo=1.0, folga=0.5, limite=2.0)
        self.assertEqual(trajetoria, [0.0, 0.0, 0.5, 2.0, 2.5, 2.0, 3.5])
        self.assertEqual(alarme, 4)
        # Queda da taxa de prenhez (lado inferior), alvo 0,25 e folga 0,05.
        trajetoria, alarme = T.cusum([0.30, 0.18, 0.15, 0.12], alvo=0.25, folga=0.05, limite=0.12,
                                     lado="inferior")
        self.assertEqual([round(s, 2) for s in trajetoria], [0.0, 0.02, 0.07, 0.15])
        self.assertEqual(alarme, 3)
        self.assertIsNone(T.cusum([1, 1, 1], alvo=1.0, folga=0.5, limite=2.0)[1])


if __name__ == "__main__":
    unittest.main()
