"""Apoio aos testes: põe a pasta laboratorio/ no caminho de importação e compara com números
publicados, que nos relatórios aparecem arredondados."""

import os
import sys
import unittest

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if RAIZ not in sys.path:
    sys.path.insert(0, RAIZ)


class TesteRelatorio(unittest.TestCase):
    """TestCase com comparação "arredonda para o número impresso"."""

    def assertPublicado(self, valor, publicado, casas):
        """O valor calculado, com `casas` decimais, é o número impresso no relatório.

        Tolerância de meia unidade da última casa (aceita 13,125 impresso como 13,12 ou 13,13).
        """
        tolerancia = 0.5 * 10 ** (-casas) + 1e-9
        self.assertLessEqual(abs(float(valor) - publicado), tolerancia,
                             f"{valor!r} não arredonda para {publicado} com {casas} casas")

    def assertPublicados(self, valores, publicados, casas):
        """assertPublicado elemento a elemento."""
        valores = list(valores)
        self.assertEqual(len(valores), len(publicados))
        for v, p in zip(valores, publicados):
            self.assertPublicado(v, p, casas)
