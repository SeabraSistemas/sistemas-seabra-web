"""Testes de melhoramento.rebanho: o pipeline de exemplo com o CSV fictício do rebanho caprino."""

import io
import math
import unittest
from contextlib import redirect_stdout

import numpy as np

from apoio import TesteRelatorio  # também põe a pasta laboratorio/ no caminho de importação
from melhoramento import indices, lactacao, parentesco, rebanho, taxas


class TestPipelineRebanho(TesteRelatorio):
    @classmethod
    def setUpClass(cls):
        cls.res = rebanho.executar(rebanho.CAMINHO_EXEMPLO)
        cls.lac = {(lc["animal"], lc["ano"]): lc for lc in cls.res["lactacoes"]}

    def test_csv_marcado_como_ficticio(self):
        with open(rebanho.CAMINHO_EXEMPLO, encoding="utf-8") as arquivo:
            self.assertIn("DADOS FICTÍCIOS", arquivo.readline())
        self.assertIn("DADOS FICTÍCIOS", rebanho.relatorio_texto(self.res))

    def test_cabra_do_exemplo_1(self):
        # A lactação de 2023 da C01 repete os controles do Exemplo 1 do relatório de caprinos:
        # TIM até a secagem (dia 290) = 675,9 kg; gordura 22,51 kg; proteína 20,38 kg; e as 6 contagens de
        # células do texto (420 a 3.100 mil) → média geométrica de 1.135 mil.
        c01 = self.lac[("C01", 2023)]
        self.assertTrue(c01["valida"])
        self.assertEqual(c01["tipo"], "TMY")
        self.assertPublicado(c01["pl"], 675.9, 1)
        self.assertPublicado(c01["gordura_kg"], 22.51, 2)
        self.assertPublicado(c01["proteina_kg"], 20.38, 2)
        self.assertPublicado(c01["ccs_geometrica_mil"], 1135, 0)

    def test_regras_de_validacao(self):
        # C06/2023 perdeu dois controles (hiato de 90 dias): lactação incompleta, fora da comparação.
        self.assertFalse(self.lac[("C06", 2023)]["valida"])
        self.assertTrue(any("hiato" in a for a in self.lac[("C06", 2023)]["avisos"]))
        # D10/2024 secou com 2 controles: abaixo do mínimo de 3.
        self.assertFalse(self.lac[("D10", 2024)]["valida"])
        # D02/2024 é TMM: os controles da mamada são descartados (ICAR).
        d02 = self.lac[("D02", 2024)]
        self.assertEqual(d02["tipo"], "TMM")
        self.assertTrue(any("mamada" in a for a in d02["avisos"]))
        # C16/2024 sem secagem: fim pela regra da ICAR (último controle + 15 dias).
        self.assertTrue(any("sem data de secagem" in a for a in self.lac[("C16", 2024)]["avisos"]))

    def test_desvios_somam_zero_no_grupo(self):
        # Desvio = PL305 − média das contemporâneas: a soma dos desvios de cada grupo é zero, e TMM e TMY
        # ficam em grupos diferentes.
        for grupo, (n, media) in self.res["grupos"].items():
            desvios = [lc["desvio"] for lc in self.res["lactacoes"] if lc.get("grupo") == grupo]
            self.assertEqual(len(desvios), n)
            if n > 1:
                self.assertAlmostEqual(sum(desvios), 0.0, places=9)
        self.assertIn("2024-adulta-TMM", self.res["grupos"])

    def test_mppa_e_ebv_usam_as_formulas_do_pacote(self):
        p = self.res["parametros"]
        animais = self.res["dados"]["animais"]
        for fm in self.res["femeas"]:
            desvios = [lc["desvio"] for lc in self.res["lactacoes"]
                       if lc["animal"] == fm["animal"] and lc.get("desvio") is not None]
            self.assertEqual(fm["n"], len(desvios))
            self.assertAlmostEqual(fm["mppa"], indices.mppa(np.mean(desvios), len(desvios), p["repetibilidade"]))
            pai = animais[fm["animal"]]["pai"]
            pta = animais[pai]["pta"] if pai else None
            rel = (animais[pai]["rel"] or 0.0) if pai else 0.0
            esperado = indices.indice_femea(desvios, p["h2"], p["repetibilidade"], p["sigma_p"], pta, rel)
            self.assertAlmostEqual(fm["ebv"], esperado.ebv)
            self.assertAlmostEqual(fm["pta"], esperado.ebv / 2)
        ordem = [fm["ebv"] for fm in self.res["femeas"]]
        self.assertEqual(ordem, sorted(ordem, reverse=True))

    def test_taxas_reprodutivas(self):
        # Estação de monta de 2023: 26 paridas em 30 expostas, como no Exemplo 7 do relatório de caprinos
        # → 86,7% com exato de 69,3% a 96,2%.
        tx = self.res["taxas"]
        par = tx["paricao"]
        self.assertEqual((par["x"], par["n"]), (26, 30))
        self.assertPublicado(100 * par["taxa"], 86.7, 1)
        self.assertPublicados([100 * v for v in par["exato"]], [69.3, 96.2], 1)
        self.assertEqual((tx["aborto"]["x"], tx["aborto"]["n"]), (3, 29))
        pr = tx["prolificidade"]
        self.assertEqual(pr["partos"], 26)
        self.assertAlmostEqual(pr["media"], pr["crias"] / pr["partos"])
        self.assertEqual(tx["ccs_alta"]["exato"], taxas.ic_exato(tx["ccs_alta"]["x"], tx["ccs_alta"]["n"]))

    def test_endogamia_e_acasalamentos(self):
        # C20 é filha de B04 (B01 × D01) com D05 (filha de B01): meios-irmãos paternos → F = 12,5%.
        self.assertEqual(self.res["endogamia"], {"C20": 0.125})
        ac = {(a["femea"], a["reprodutor"]): a for a in self.res["acasalamentos"]}
        self.assertEqual(ac[("D01", "B04")]["F"], 0.25)          # mãe × filho
        self.assertEqual(ac[("C01", "B04")]["F"], 0.125)         # meios-irmãos pela mãe D01
        self.assertEqual(ac[("C02", "B02")]["F"], 0.25)          # pai × filha
        self.assertFalse(ac[("C13", "B04")]["acima_do_limite"])
        for item in self.res["acasalamentos"]:
            if item["acima_do_limite"]:
                self.assertLessEqual(item["F_sugestao"], self.res["parametros"]["limite_F"])
        ped = rebanho.pedigree(self.res["dados"])
        self.assertEqual(parentesco.F_acasalamento(ped, "B04", "D01"), 0.25)

    def test_executa_pela_linha_de_comando(self):
        saida = io.StringIO()
        with redirect_stdout(saida):
            self.assertEqual(rebanho.main([str(rebanho.CAMINHO_EXEMPLO)]), 0)
        texto = saida.getvalue()
        for trecho in ("Lactações padronizadas", "MPPA", "Parição", "Acasalamentos planejados"):
            self.assertIn(trecho, texto)

    def test_lactacao_padronizada_bate_com_o_modulo(self):
        # A PL305 do pipeline é a do módulo lactacao com os mesmos controles.
        dados = self.res["dados"]
        parto = next(p for p in dados["partos"] if p["animal"] == "C07" and p["data"].year == 2024)
        ctrl = [c for c in dados["controles"]["C07"] if parto["data"] < c["data"] <= parto["secagem"]]
        dias = [(c["data"] - parto["data"]).days for c in ctrl]
        r = lactacao.lactacao_pequenos_ruminantes(dias, [c["leite"] for c in ctrl], "caprino",
                                                  secagem=(parto["secagem"] - parto["data"]).days,
                                                  comprimento=305)
        self.assertAlmostEqual(self.lac[("C07", 2024)]["pl"], r.total)
        self.assertFalse(math.isnan(r.total))


if __name__ == "__main__":
    unittest.main()
