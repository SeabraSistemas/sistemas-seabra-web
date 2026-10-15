"""Pipeline de exemplo para um rebanho pequeno de cabras leiteiras.

Do CSV exportado (animais, partos, controles, coberturas e acasalamentos planejados) até os números
que o produtor usa, na ordem proposta nos relatórios de caprinos e de ovinos ("Rebanhos de 20 a
1.000 cabras ganham precisão comparando, encolhendo e conectando"):

1. padroniza cada lactação (PL305 pelo Fleischmann da ICAR, TMY ou TMM, com as regras de validação);
2. calcula o desvio de cada cabra em relação às contemporâneas (ano de parto × primípara/adulta ×
   sistema de aleitamento);
3. calcula a MPPA (para descarte) e o EBV por índice com a PTA do pai (para reposição), com análise
   de sensibilidade da repetibilidade;
4. calcula as taxas reprodutivas e sanitárias com os intervalos de Wald, Wilson e exato;
5. calcula o F de cada acasalamento planejado e sugere o reprodutor de menor F quando o plano
   passa do limite.

Parâmetros padrão (relatório de caprinos, Exemplo 6): h² = 0,20, σP = 200 kg de PL305, repetibilidade
0,36 (Saanen brasileira) com sensibilidade 0,44 e 0,50. Todos vêm da literatura; nada é estimado
com os dados do rebanho.

Formato do CSV (linhas começadas por "#" são comentários). Colunas:
    tipo, animal, pai, mae, sexo, data, ordem_parto, crias, data_separacao, data_secagem,
    leite_kg, gordura_pct, proteina_pct, ccs_mil, situacao, pta_leite_kg, rel_pta
Tipos de linha e colunas usadas:
    animal                   animal, pai, mae, sexo, data (nascimento), situacao, pta_leite_kg, rel_pta
    parto                    animal, data, ordem_parto, crias, data_separacao (vazia = ordenha
                             desde o parto, TMY), data_secagem (vazia = ainda em lactação)
    controle                 animal, data, leite_kg, gordura_pct, proteina_pct, ccs_mil
    cobertura                animal (fêmea), pai (reprodutor), data, situacao (parida, abortou, vazia)
    acasalamento_planejado   animal (fêmea), pai (reprodutor planejado), data

Uso:  python3 -m melhoramento.rebanho [caminho.csv]
"""

from __future__ import annotations

import csv
import math
import sys
from datetime import date
from pathlib import Path

import numpy as np

from . import indices, lactacao, parentesco, taxas

CAMINHO_EXEMPLO = Path(__file__).resolve().parent.parent / "exemplos" / "rebanho_caprino_exemplo.csv"

PARAMETROS_PADRAO = {
    "h2": 0.20,                          # PL305, relatório de caprinos (faixa 0,15 a 0,30)
    "sigma_p": 200.0,                    # kg de PL305 (escolha do relatório de caprinos, Exemplo 6)
    "repetibilidade": 0.36,              # Saanen brasileira (Embrapa 2015; Lôbo et al. 2014)
    "repetibilidades_sensibilidade": (0.36, 0.44, 0.50),
    "comprimento": 305,                  # PL305 do Capragene
    "minimo_controles": 3,               # Fleischmann na ICAR
    "minimo_dias_lactacao": 60,          # Capragene: lactações de pelo menos 60 dias
    "limite_1o_controle": 75,            # Capragene: 1º controle até o 75º dia
    "intervalo_medio": 30,               # dias entre controles (ICAR, A4/AT/AC: 28 a 34); máximo = 2×
    "minimo_grupo": 3,                   # Capragene eliminava grupos com menos de 3 cabras
    "limite_F": 0.0625,                  # alerta de endogamia por acasalamento (6,25%)
    "ccs_limite_mil": 1000.0,            # base da Embrapa para mastite subclínica em cabras
    "confianca": 0.95,
}


# ---------------------------------------------------------------------------------------
# Leitura
# ---------------------------------------------------------------------------------------
def _num(texto: str) -> float | None:
    texto = (texto or "").strip()
    return float(texto.replace(",", ".")) if texto else None


def _data(texto: str) -> date | None:
    texto = (texto or "").strip()
    return date.fromisoformat(texto) if texto else None


def _id(texto: str):
    texto = (texto or "").strip()
    return texto if parentesco.conhecido(texto) else None


def ler_csv(caminho: str | Path) -> dict:
    """Lê o CSV do rebanho e devolve um dicionário com animais, partos, controles, coberturas e
    planos. Linhas começadas por "#" são comentários (o aviso de dados fictícios, por exemplo)."""
    with open(caminho, encoding="utf-8", newline="") as arquivo:
        linhas = [ln for ln in arquivo if ln.strip() and not ln.lstrip().startswith("#")]
    dados = {"animais": {}, "partos": [], "controles": {}, "coberturas": [], "planos": []}
    for linha in csv.DictReader(linhas):
        tipo = linha["tipo"].strip()
        animal = _id(linha["animal"])
        if tipo == "animal":
            dados["animais"][animal] = {
                "pai": _id(linha["pai"]), "mae": _id(linha["mae"]), "sexo": linha["sexo"].strip(),
                "nascimento": _data(linha["data"]), "situacao": linha["situacao"].strip(),
                "pta": _num(linha["pta_leite_kg"]), "rel": _num(linha["rel_pta"])}
        elif tipo == "parto":
            dados["partos"].append({
                "animal": animal, "data": _data(linha["data"]), "ordem": int(linha["ordem_parto"]),
                "crias": int(linha["crias"]), "separacao": _data(linha["data_separacao"]),
                "secagem": _data(linha["data_secagem"])})
        elif tipo == "controle":
            dados["controles"].setdefault(animal, []).append({
                "data": _data(linha["data"]), "leite": _num(linha["leite_kg"]),
                "gordura": _num(linha["gordura_pct"]), "proteina": _num(linha["proteina_pct"]),
                "ccs": _num(linha["ccs_mil"])})
        elif tipo == "cobertura":
            dados["coberturas"].append({"animal": animal, "pai": _id(linha["pai"]),
                                        "data": _data(linha["data"]),
                                        "situacao": linha["situacao"].strip()})
        elif tipo == "acasalamento_planejado":
            dados["planos"].append({"animal": animal, "pai": _id(linha["pai"]),
                                    "data": _data(linha["data"])})
        else:
            raise ValueError(f"tipo de linha desconhecido: {tipo!r}")
    for lista in dados["controles"].values():
        lista.sort(key=lambda c: c["data"])
    return dados


def pedigree(dados: dict) -> dict:
    """Pedigree {animal: (pai, mãe)} para o módulo parentesco."""
    return {a: (info["pai"], info["mae"]) for a, info in dados["animais"].items()}


# ---------------------------------------------------------------------------------------
# 1. Lactações padronizadas
# ---------------------------------------------------------------------------------------
def padronizar_lactacoes(dados: dict, parametros: dict | None = None) -> list[dict]:
    """Uma lactação por parto: PL305 (kg), gordura e proteína (kg), ECS médio, CCS geométrica,
    tipo (TMY/TMM), validade e avisos. Os controles de um parto são os feitos entre o parto e a
    secagem (ou o parto seguinte)."""
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    partos = sorted(dados["partos"], key=lambda x: (x["animal"], x["data"]))
    saida = []
    for k, pt in enumerate(partos):
        proximo = next((q["data"] for q in partos[k + 1:] if q["animal"] == pt["animal"]), None)
        limite = pt["secagem"] or proximo or date.max
        ctrl = [c for c in dados["controles"].get(pt["animal"], [])
                if pt["data"] < c["data"] <= limite and c["leite"] is not None]
        dias = [(c["data"] - pt["data"]).days for c in ctrl]
        secagem = (pt["secagem"] - pt["data"]).days if pt["secagem"] else None
        separacao = (pt["separacao"] - pt["data"]).days if pt["separacao"] else None
        reg = {"animal": pt["animal"], "parto": pt["data"], "ano": pt["data"].year,
               "ordem": pt["ordem"], "crias": pt["crias"], "secagem_del": secagem,
               "n_controles": len(ctrl), "valida": False, "avisos": []}
        if not ctrl:
            reg.update(tipo="TMM" if separacao is not None else "TMY", pl=float("nan"))
            reg["avisos"].append("sem controles")
            saida.append(reg)
            continue
        lac = lactacao.lactacao_pequenos_ruminantes(
            dias, [c["leite"] for c in ctrl], "caprino", secagem=secagem,
            separacao_crias=separacao, comprimento=p["comprimento"],
            intervalo_medio=p["intervalo_medio"], minimo_controles=p["minimo_controles"])
        reg.update(tipo=lac.tipo, pl=lac.total, ate_dia=lac.ate_dia, avisos=list(lac.avisos))
        validos = [(d, c) for d, c in zip(dias, ctrl) if separacao is None or d > separacao]
        if validos and validos[0][0] > p["limite_1o_controle"]:
            reg["avisos"].append(f"1º controle depois do dia {p['limite_1o_controle']} (Capragene)")
        duracao = secagem if secagem is not None else (validos[-1][0] if validos else 0)
        if duracao < p["minimo_dias_lactacao"]:
            reg["avisos"].append(f"lactação de {duracao} dias, abaixo de {p['minimo_dias_lactacao']}")
        reg["valida"] = (not math.isnan(lac.total) and lac.completa
                         and duracao >= p["minimo_dias_lactacao"])
        if not math.isnan(lac.total):
            d_ok = [d for d, _ in validos]
            for nome, chave in (("gordura_kg", "gordura"), ("proteina_kg", "proteina")):
                teores = [c[chave] for _, c in validos]
                if all(t is not None for t in teores):
                    reg[nome] = lactacao.producao_componente(
                        d_ok, [c["leite"] for _, c in validos], teores, fim=lac.ate_dia,
                        inicio=float(separacao or 0), intervalo_maximo=2.0 * p["intervalo_medio"])
        contagens = [c["ccs"] for _, c in validos if c["ccs"] is not None]
        if contagens:
            reg["ecs_medio"] = float(np.mean(lactacao.ecs(contagens)))
            reg["ccs_geometrica_mil"] = lactacao.ccs_media_geometrica(contagens)
            reg["ccs_maxima_mil"] = max(contagens)
        saida.append(reg)
    return saida


# ---------------------------------------------------------------------------------------
# 2. Desvios das contemporâneas
# ---------------------------------------------------------------------------------------
def grupo_contemporaneas(lac: dict) -> str:
    """Ano de parto × categoria (primípara/adulta) × sistema de aleitamento (TMY/TMM)."""
    categoria = "primípara" if lac["ordem"] == 1 else "adulta"
    return f"{lac['ano']}-{categoria}-{lac['tipo']}"


def desvios_contemporaneas(lactacoes: list[dict], parametros: dict | None = None) -> dict:
    """Acrescenta a cada lactação válida o grupo, o tamanho do grupo, a média e o desvio
    (PL305 − média do grupo). Grupos com uma só cabra não dão desvio; grupos abaixo do mínimo
    recebem aviso. Devolve {grupo: (n, média)}."""
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    grupos: dict[str, list[dict]] = {}
    for lac in lactacoes:
        if lac["valida"]:
            lac["grupo"] = grupo_contemporaneas(lac)
            grupos.setdefault(lac["grupo"], []).append(lac)
    resumo = {}
    for g, membros in grupos.items():
        media = float(np.mean([m["pl"] for m in membros]))
        resumo[g] = (len(membros), media)
        for m in membros:
            m["n_grupo"] = len(membros)
            m["media_grupo"] = media
            m["desvio"] = m["pl"] - media if len(membros) > 1 else None
            if len(membros) < p["minimo_grupo"]:
                m["avisos"].append(f"grupo {g} com {len(membros)} cabra(s), abaixo de {p['minimo_grupo']}")
    return resumo


# ---------------------------------------------------------------------------------------
# 3. MPPA e EBV com a PTA do pai
# ---------------------------------------------------------------------------------------
def avaliar_femeas(dados: dict, lactacoes: list[dict], parametros: dict | None = None) -> list[dict]:
    """MPPA e EBV por índice (registros próprios + PTA do pai) de cada cabra com desvio.

    MPPA = [n·r/(1 + (n − 1)·r)]·ȳ e o índice de indices.indice_femea, com h², σP e r dos
    parâmetros; a MPPA também com cada repetibilidade de sensibilidade.
    """
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    por_cabra: dict = {}
    for lac in lactacoes:
        if lac.get("desvio") is not None:
            por_cabra.setdefault(lac["animal"], []).append(lac["desvio"])
    saida = []
    for cabra, desvios in por_cabra.items():
        pai = dados["animais"].get(cabra, {}).get("pai")
        info_pai = dados["animais"].get(pai, {}) if pai else {}
        pta, rel = info_pai.get("pta"), info_pai.get("rel") or 0.0
        n = len(desvios)
        media = float(np.mean(desvios))
        idx = indices.indice_femea(desvios, p["h2"], p["repetibilidade"], p["sigma_p"],
                                   pta_pai=pta, rel_pai=rel)
        saida.append({
            "animal": cabra, "n": n, "desvio_medio": media, "pai": pai, "pta_pai": pta,
            "rel_pai": rel if pta is not None else None,
            "mppa": indices.mppa(media, n, p["repetibilidade"]),
            "mppa_sensibilidade": {r: indices.mppa(media, n, r)
                                   for r in p["repetibilidades_sensibilidade"]},
            "ebv": idx.ebv, "pta": idx.pta, "rel": idx.confiabilidade,
            "pesos": [float(b) for b in idx.pesos]})
    for chave, rotulo in (("mppa", "ordem_mppa"), ("ebv", "ordem_ebv")):
        for posicao, item in enumerate(sorted(saida, key=lambda x: -x[chave]), start=1):
            item[rotulo] = posicao
    return sorted(saida, key=lambda x: x["ordem_ebv"])


# ---------------------------------------------------------------------------------------
# 4. Taxas com intervalo de confiança
# ---------------------------------------------------------------------------------------
def _taxa(x: int, n: int, confianca: float) -> dict:
    return {"x": x, "n": n, "taxa": x / n if n else float("nan"),
            "wald": taxas.ic_wald(x, n, confianca) if n else None,
            "wilson": taxas.ic_wilson(x, n, confianca) if n else None,
            "exato": taxas.ic_exato(x, n, confianca) if n else None}


def taxas_reprodutivas(dados: dict, lactacoes: list[dict], parametros: dict | None = None) -> dict:
    """Parição (paridas/expostas), aborto (abortos/gestações), prolificidade (crias por parto, com
    intervalo t) e cabras com algum controle acima do limite de CCS, na última estação."""
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    conf = p["confianca"]
    saida: dict = {}
    if dados["coberturas"]:
        estacao = max(c["data"].year for c in dados["coberturas"])
        cob = [c for c in dados["coberturas"] if c["data"].year == estacao]
        paridas = sum(c["situacao"] == "parida" for c in cob)
        abortos = sum(c["situacao"] == "abortou" for c in cob)
        saida["estacao_monta"] = estacao
        saida["paricao"] = _taxa(paridas, len(cob), conf)
        saida["aborto"] = _taxa(abortos, paridas + abortos, conf)
    ano = max(pt["data"].year for pt in dados["partos"])
    crias = [pt["crias"] for pt in dados["partos"] if pt["data"].year == ano]
    if len(crias) >= 2:
        media, dp, li, ls = taxas.ic_media_t(crias, conf)
        saida["prolificidade"] = {"ano": ano, "partos": len(crias), "crias": sum(crias),
                                  "media": media, "dp": dp, "ic": (li, ls)}
    lac_ano = [lc for lc in lactacoes if lc["ano"] == ano and "ccs_maxima_mil" in lc]
    altas = sum(lc["ccs_maxima_mil"] > p["ccs_limite_mil"] for lc in lac_ano)
    saida["ccs_alta"] = {**_taxa(altas, len(lac_ano), conf), "ano": ano,
                         "limite_mil": p["ccs_limite_mil"]}
    return saida


# ---------------------------------------------------------------------------------------
# 5. Acasalamentos planejados
# ---------------------------------------------------------------------------------------
def avaliar_acasalamentos(dados: dict, parametros: dict | None = None) -> list[dict]:
    """F esperado de cada acasalamento planejado (½·a_pai,mãe) e, quando passa do limite, o
    reprodutor sugerido entre os machos ativos (preferência na ordem em que aparecem no plano, depois
    os demais), pela regra de parentesco.escolher_reprodutor."""
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    ped = pedigree(dados)
    planejados = list(dict.fromkeys(pl["pai"] for pl in dados["planos"]))
    ativos = [a for a, info in dados["animais"].items()
              if info["sexo"] == "M" and info["situacao"] == "ativo"]
    machos = planejados + [m for m in ativos if m not in planejados]
    femeas = [pl["animal"] for pl in dados["planos"]]
    tabela = parentesco.tabela_F_acasalamentos(ped, machos, femeas)
    sugestoes = parentesco.escolher_reprodutores(ped, femeas, machos, p["limite_F"])
    saida = []
    for pl in dados["planos"]:
        F = tabela[pl["pai"]][pl["animal"]]
        item = {"femea": pl["animal"], "reprodutor": pl["pai"], "F": F,
                "acima_do_limite": F > p["limite_F"] + 1e-12}
        if item["acima_do_limite"]:
            m, f, ok = sugestoes[pl["animal"]]
            item.update(sugestao=m, F_sugestao=f)
        saida.append(item)
    return saida


# ---------------------------------------------------------------------------------------
# Execução e relatório
# ---------------------------------------------------------------------------------------
def executar(caminho: str | Path = CAMINHO_EXEMPLO, parametros: dict | None = None) -> dict:
    """Roda as cinco etapas e devolve todos os resultados num dicionário."""
    p = {**PARAMETROS_PADRAO, **(parametros or {})}
    dados = ler_csv(caminho)
    lactacoes = padronizar_lactacoes(dados, p)
    grupos = desvios_contemporaneas(lactacoes, p)
    return {"parametros": p, "dados": dados,
            "endogamia": {a: f for a, f in parentesco.coeficientes_F(pedigree(dados)).items() if f > 0},
            "lactacoes": lactacoes, "grupos": grupos,
            "femeas": avaliar_femeas(dados, lactacoes, p),
            "taxas": taxas_reprodutivas(dados, lactacoes, p),
            "acasalamentos": avaliar_acasalamentos(dados, p)}


def _pct(x: float, casas: int = 1) -> str:
    return f"{100 * x:.{casas}f}%"


def _intervalo(par: tuple) -> str:
    return f"{_pct(par[0])} a {_pct(par[1])}"


def relatorio_texto(res: dict) -> str:
    """Relatório em texto simples do resultado de executar()."""
    p = res["parametros"]
    L = []
    L.append("LABORATÓRIO DE MODELOS - rebanho caprino de exemplo (DADOS FICTÍCIOS)")
    L.append(f"Parâmetros da literatura: h² = {p['h2']}, σP = {p['sigma_p']:.0f} kg, "
             f"repetibilidade = {p['repetibilidade']} (sensibilidade {p['repetibilidades_sensibilidade']}), "
             f"PL{p['comprimento']}")
    L.append("")
    L.append("1. Endogamia no pedigree: " + (", ".join(f"{a} F = {_pct(f, 2)}"
                                                       for a, f in res["endogamia"].items()) or "nenhum animal endogâmico"))
    L.append("")
    L.append("2. Lactações padronizadas (Fleischmann/ICAR)")
    L.append(f"   {'cabra':6s} {'parto':10s} {'ord':>3s} {'tipo':4s} {'ctrl':>4s} {'PL305 kg':>9s} "
             f"{'gord kg':>8s} {'prot kg':>8s} {'CCS geo':>8s} {'desvio':>8s}  avisos")
    for lc in res["lactacoes"]:
        def f(chave, fmt):
            v = lc.get(chave)
            return format(v, fmt) if v is not None and not (isinstance(v, float) and math.isnan(v)) else "-"
        desvio = f"{lc['desvio']:+8.1f}" if lc.get("desvio") is not None else f"{'-':>8s}"
        situ = "" if lc["valida"] else "[INVÁLIDA] "
        L.append(f"   {lc['animal']:6s} {lc['parto'].isoformat():10s} {lc['ordem']:3d} {lc['tipo']:4s} "
                 f"{lc['n_controles']:4d} {f('pl', '9.1f'):>9s} {f('gordura_kg', '8.2f'):>8s} "
                 f"{f('proteina_kg', '8.2f'):>8s} {f('ccs_geometrica_mil', '8.0f'):>8s} {desvio}  "
                 f"{situ}{'; '.join(lc['avisos'])}")
    L.append("   Grupos de contemporâneas (n, média PL305): " +
             "; ".join(f"{g}: {n}, {m:.1f} kg" for g, (n, m) in res["grupos"].items()))
    L.append("")
    L.append("3. MPPA (descarte) e EBV com a PTA do pai (reposição), desvios em kg de PL305")
    L.append(f"   {'cabra':6s} {'n':>2s} {'desvio':>7s} {'MPPA':>7s} {'pai':5s} {'PTA pai (REL)':>12s} "
             f"{'EBV':>7s} {'PTA':>7s} {'REL':>5s} {'#EBV':>4s} {'#MPPA':>5s}  MPPA r = "
             + "/".join(str(r) for r in p["repetibilidades_sensibilidade"]))
    for fm in res["femeas"]:
        pta_pai = (f"{fm['pta_pai']:+.0f} ({fm['rel_pai']:.2f})" if fm["pta_pai"] is not None else "sem PTA")
        sens = "/".join(f"{v:+.1f}" for v in fm["mppa_sensibilidade"].values())
        L.append(f"   {fm['animal']:6s} {fm['n']:2d} {fm['desvio_medio']:+7.1f} {fm['mppa']:+7.1f} "
                 f"{fm['pai'] or '-':5s} {pta_pai:>12s} {fm['ebv']:+7.1f} {fm['pta']:+7.1f} {fm['rel']:5.2f} "
                 f"{fm['ordem_ebv']:4d} {fm['ordem_mppa']:5d}  {sens}")
    L.append("")
    tx = res["taxas"]
    L.append(f"4. Taxas com intervalo de {100 * p['confianca']:.0f}% (Wald / Wilson / exato)")
    for nome, rot in (("paricao", "Parição (paridas/expostas)"), ("aborto", "Aborto (abortos/gestações)"),
                      ("ccs_alta", f"Cabras com controle > {p['ccs_limite_mil']:.0f} mil cél/mL")):
        if nome in tx and tx[nome]["n"]:
            t = tx[nome]
            L.append(f"   {rot:42s} {t['x']:3d}/{t['n']:<3d} {_pct(t['taxa']):>6s} | Wald {_intervalo(t['wald'])} | "
                     f"Wilson {_intervalo(t['wilson'])} | exato {_intervalo(t['exato'])}")
    if "prolificidade" in tx:
        pr = tx["prolificidade"]
        L.append(f"   Prolificidade {pr['ano']}: {pr['crias']} crias/{pr['partos']} partos = {pr['media']:.2f} "
                 f"(DP {pr['dp']:.2f}; IC t {pr['ic'][0]:.2f} a {pr['ic'][1]:.2f})")
    L.append("")
    L.append(f"5. Acasalamentos planejados (alerta acima de F = {_pct(p['limite_F'], 2)})")
    for ac in res["acasalamentos"]:
        linha = f"   {ac['femea']:6s} x {ac['reprodutor']:5s} F = {_pct(ac['F'], 2):>6s}"
        if ac["acima_do_limite"]:
            linha += f"  ALERTA -> sugestão: {ac['sugestao']} (F = {_pct(ac['F_sugestao'], 2)})"
        L.append(linha)
    return "\n".join(L)


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    caminho = Path(argv[0]) if argv else CAMINHO_EXEMPLO
    print(relatorio_texto(executar(caminho)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
