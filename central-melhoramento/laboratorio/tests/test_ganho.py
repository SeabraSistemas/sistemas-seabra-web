"""Testes de melhoramento.ganho: intensidade, resposta à seleção, vias, tendência e DPR."""

import math
import unittest

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import ganho as G

i = G.intensidade_selecao


class TestIntensidade(TesteRelatorio):
    def test_tabela_de_intensidades(self):
        # Relatórios de caprinos (Exemplo 5) e de corte: 5% → 2,063; 10% → 1,755; 15% → 1,554;
        # 20% → 1,400; 50% → 0,798; 70% → 0,497; 80% → 0,350.
        self.assertPublicados([i(p) for p in (0.05, 0.10, 0.15, 0.20, 0.50, 0.70, 0.80)],
                              [2.063, 1.755, 1.554, 1.400, 0.798, 0.497, 0.350], 3)

    def test_equacao_do_criador(self):
        # Relatório de corte: Missouri, 2,8 lb/ano com σg = 26,3 lb e L = 5 → r·i = 0,53.
        self.assertPublicado(2.8 * 5 / 26.3, 0.53, 2)
        self.assertAlmostEqual(G.resposta_selecao(0.532, 1.0, 26.3, 5), 0.532 * 26.3 / 5)


class TestVias(TesteRelatorio):
    def test_corte_duas_vias(self):
        # Relatório de corte, "Resposta à seleção": touros genômicos (r 0,70; 10%; L 3,5) e novilhas
        # (r 0,50; 70%; L 6) com σa = 10 → 1,55 kg/ano; touros por fenótipo (r 0,40; L 5) → 0,86.
        self.assertPublicado(G.ganho_vias([(i(0.10), 0.70, 3.5), (i(0.70), 0.50, 6)], 10), 1.55, 2)
        self.assertPublicado(G.ganho_vias([(i(0.10), 0.40, 5), (i(0.70), 0.50, 6)], 10), 0.86, 2)

    def test_caprinos_exemplo_5(self):
        # Relatório de caprinos, Exemplo 5 (σa = 89,4 kg de PL305): 17,1; 27,5; 15,6 e 6,4 kg/ano.
        sa = math.sqrt(0.20 * 200 ** 2)
        self.assertPublicado(sa, 89.4, 1)
        cenarios = [([(i(0.20), 0.79, 5.5), (i(0.20), 0.79, 5.5), (i(0.05), 0.60, 4), (i(0.80), 0.55, 4)], 17.1),
                    ([(i(0.05), 0.65, 2), (i(0.15), 0.65, 2.5), (i(0.10), 0.65, 3.5), (i(0.80), 0.55, 4)], 27.5),
                    ([(i(0.15), math.sqrt(0.60), 4), (i(0.80), 0.55, 4)], 15.6),
                    ([(i(0.15), 0.5 * math.sqrt(0.20), 3), (i(0.80), math.sqrt(0.20), 4)], 6.4)]
        for vias, dg in cenarios:
            self.assertPublicado(G.ganho_vias(vias, sa), dg, 1)

    def test_ovinos_exemplo_8(self):
        # Relatório de ovinos, Exemplo 8 (σa = 33 L): rebanho fechado (top 20%, r = ½ × 0,632) → 2,58 L/ano
        # e carneiro 14,6 L acima (filhas +7,3); troca entre 3 rebanhos (top 10%, r 0,447) → 4,28 L/ano e
        # 25,9 L (filhas +12,9); em 15 anos, 38,7 e 64,1 L.
        r_mae = math.sqrt(2 * 0.30 / (1 + 0.50))
        self.assertPublicado(r_mae, 0.632, 3)
        fechado = [(i(0.20), 0.5 * r_mae, 3), (i(0.80), 0.30, 4)]
        troca = [(i(0.10), 0.447, 3), (i(0.80), 0.35, 4)]
        self.assertPublicado(G.ganho_vias(fechado, 33), 2.58, 2)
        self.assertPublicado(G.ganho_vias(troca, 33), 4.28, 2)
        self.assertPublicado(G.resposta_selecao(i(0.20), 0.5 * r_mae, 33), 14.6, 1)
        self.assertPublicado(G.resposta_selecao(i(0.10), 0.447, 33) / 2, 12.9, 1)
        self.assertPublicado(15 * G.ganho_vias(fechado, 33), 38.7, 1)
        self.assertPublicado(15 * G.ganho_vias(troca, 33), 64.1, 1)

    def test_absorcao_semen_importado(self):
        # Relatório de ovinos, Exemplo 8: 55 L, tendência 4,3 × 0,86 = 3,70 L/ano, L = 3,75 → rebanho
        # 27,5; 48,2; 65,5 e 81,0 L; distância de equilíbrio 2·T·L = 27,7 L.
        geracoes = G.absorcao(55, 4.3 * 0.86, 3.75, 4)
        self.assertPublicados([g["rebanho"] for g in geracoes], [27.5, 48.2, 65.5, 81.0], 1)
        self.assertPublicados([g["distancia"] for g in geracoes], [41.4, 34.6, 31.1, 29.4], 1)
        self.assertPublicado(2 * 4.3 * 0.86 * 3.75, 27.7, 1)

    def test_leite_quatro_vias(self):
        # Relatório de leite: Van Tassell e Van Vleck (1991), 405, 395, 239 e 42 kg com 10,2; 6,4; 9,3 e
        # 5,1 anos → 34,87 kg/ano.
        self.assertPublicado(G.ganho_diferenciais([405, 395, 239, 42], [10.2, 6.4, 9.3, 5.1]), 34.87, 2)


class TestTendencia(TesteRelatorio):
    def test_corte(self):
        # Relatório de corte, "Tendência genética": DEP 0,517 kg/ano, EBV 1,03, fenotípica 1,97 e
        # ambiental 0,94.
        anos = range(2020, 2026)
        dep = G.tendencia(anos, [1.8, 2.3, 2.9, 3.2, 3.9, 4.4])
        fen = G.tendencia(anos, [196, 199, 195, 203, 206, 204])
        self.assertPublicado(dep, 0.517, 3)
        self.assertPublicado(2 * dep, 1.03, 2)
        self.assertPublicado(fen, 1.97, 2)
        self.assertPublicado(fen - 2 * dep, 0.94, 2)


class TestDPR(TesteRelatorio):
    def test_tabela_dias_abertos(self):
        # Relatório de leite, "Fertilidade": PR = 21/(DO − 60 + 11) e DPR = 0,25·(233 − DO).
        tabela = [(90, 51.2, 35.8), (100, 41.2, 33.3), (120, 29.6, 28.3), (133, 25.0, 25.0),
                  (150, 20.8, 20.8), (180, 16.0, 13.3), (233, 11.4, 0.0)]
        for do, pr, linear in tabela:
            self.assertPublicado(G.dpr_aipl(do), pr, 1)
            self.assertPublicado(G.dpr_linear(do), linear, 1)
        # Rebanhos com 154 e 133 dias abertos: 20% e 25% (VanRaden et al. 2004).
        self.assertPublicados([G.dpr_aipl(154), G.dpr_aipl(133)], [20.0, 25.0], 1)
        # IEP de 413,45 dias → DO 133,4 → PR 24,9%.
        self.assertPublicado(G.dpr_aipl(413.45 - 280), 24.9, 1)
        # Limites da forma linear (DO entre 50 e 250).
        self.assertEqual(G.dpr_linear(20), G.dpr_linear(50))
        self.assertEqual(G.dpr_linear(400), G.dpr_linear(250))


if __name__ == "__main__":
    unittest.main()
