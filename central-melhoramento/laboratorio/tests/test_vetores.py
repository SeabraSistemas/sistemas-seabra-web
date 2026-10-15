"""Confere que vetores_teste.json continua igual ao que o pacote calcula.

Se uma função mudar de propósito, rode `python3 gerar_vetores_teste.py` e revise a diferença do JSON
antes de publicar: as calculadoras em JavaScript e Dart são validadas contra esse arquivo.
"""

import json
import math
import unittest

from apoio import RAIZ, TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
import gerar_vetores_teste as gerador


class TestVetores(TesteRelatorio):
    def _compara(self, calculado, gravado, caminho):
        if isinstance(gravado, dict):
            self.assertIsInstance(calculado, dict, caminho)
            self.assertEqual(set(calculado), set(gravado), caminho)
            for k in gravado:
                self._compara(calculado[k], gravado[k], f"{caminho}.{k}")
        elif isinstance(gravado, list):
            self.assertIsInstance(calculado, list, caminho)
            self.assertEqual(len(calculado), len(gravado), caminho)
            for i, (c, g) in enumerate(zip(calculado, gravado)):
                self._compara(c, g, f"{caminho}[{i}]")
        elif isinstance(gravado, float) or isinstance(calculado, float):
            tol = gerador.TOLERANCIA_RELATIVA * max(1.0, abs(gravado))
            self.assertTrue(math.isclose(calculado, gravado, rel_tol=0, abs_tol=tol),
                            f"{caminho}: {calculado} != {gravado}")
        else:
            self.assertEqual(calculado, gravado, caminho)

    def test_arquivo_em_dia_com_o_pacote(self):
        with open(f"{RAIZ}/vetores_teste.json", encoding="utf-8") as arquivo:
            gravado = json.load(arquivo)
        calculado = gerador.calcular_vetores()
        self.assertEqual([v["id"] for v in calculado["vetores"]], [v["id"] for v in gravado["vetores"]])
        for c, g in zip(calculado["vetores"], gravado["vetores"]):
            self.assertEqual(c["entrada"], g["entrada"], g["id"])
            self._compara(c["saida"], g["saida"], g["id"])

    def test_todos_os_modulos_tem_vetores(self):
        with open(f"{RAIZ}/vetores_teste.json", encoding="utf-8") as arquivo:
            modulos = {v["funcao"].split(".")[0] for v in json.load(arquivo)["vetores"]}
        self.assertEqual(modulos, {"parentesco", "blup", "lactacao", "confiabilidade", "indices", "taxas", "ganho"})

    def test_ids_unicos_e_fontes_preenchidas(self):
        vetores = gerador.calcular_vetores()["vetores"]
        ids = [v["id"] for v in vetores]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(all(v["fonte"] for v in vetores))


if __name__ == "__main__":
    unittest.main()
