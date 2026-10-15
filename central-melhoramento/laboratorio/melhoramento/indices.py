"""Índices de seleção, comparação de reprodutores e ferramentas da fêmea (MPPA e índice com o pai).

Conteúdo:
* smith_hazel: b = P⁻¹Gv, acurácia r_IH e resposta esperada;
* indice_economico (Σ v·PTA), enfase_relativa e indice_padronizado;
* dp_erro_indice, prob_superar e prob_superar_pta: a chance de um reprodutor ser de fato melhor
  que outro, dadas as PTAs e as confiabilidades;
* mppa (habilidade mais provável de produção) e indice_femea (registros próprios + PTA ou EBV do
  pai, as duas fontes de informação).

Fontes: relatório de corte, "Índice de seleção: Smith-Hazel e a soma ponderada de DEPs" e
"Ferramentas que funcionam com N pequeno: razão BIF e MPPA"; relatório de leite, "Índices
econômicos" e "Comparar com contemporâneas e ranquear com repetibilidade"; relatório de caprinos,
Exemplos 4 e 6; relatório de ovinos, Exemplos 3 e 5. Hazel (1943, Genetics 28:476); CattleMax
(fórmula da MPPA); BIF Guidelines (glossário).
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .taxas import norm_cdf


# ---------------------------------------------------------------------------------------
# Smith-Hazel
# ---------------------------------------------------------------------------------------
@dataclass
class ResultadoSmithHazel:
    b: np.ndarray                    # pesos do índice sobre os fenótipos
    r_IH: float                      # acurácia do índice (correlação com o objetivo H)
    dp_indice: float                 # √(b'Pb) = resposta no objetivo com i = 1
    resposta_caracteristicas: np.ndarray   # G·b/√(b'Pb) com i = 1


def smith_hazel(P, G, v) -> ResultadoSmithHazel:
    """Índice de Smith-Hazel (Hazel 1943, na notação matricial moderna):

        b = P⁻¹·G·v        P = var(fenótipos) ; G = cov(fenótipos, valores genéticos) ; v = valores
        r_IH = √(b'Pb / v'Gv)       resposta no objetivo = i·√(b'Pb)
        resposta por característica = i·G·b/√(b'Pb)

    Exemplo do relatório de corte: P = [[400, 205], [205, 625]], G = [[100, 105], [105, 225]],
    v = (2; 4) → b = (0,77; 1,52), r_IH = 0,62 e, com i = 1, 5,1 kg de PD, 9,1 kg de PS e R$ 46,6.
    """
    P, G, v = np.asarray(P, float), np.asarray(G, float), np.asarray(v, float)
    b = np.linalg.solve(P, G @ v)
    var_i = float(b @ P @ b)
    return ResultadoSmithHazel(b=b, r_IH=float(np.sqrt(var_i / (v @ G @ v))),
                               dp_indice=float(np.sqrt(var_i)),
                               resposta_caracteristicas=G @ b / np.sqrt(var_i))


# ---------------------------------------------------------------------------------------
# Índice econômico e comparação de reprodutores
# ---------------------------------------------------------------------------------------
def indice_economico(valores, ptas) -> float:
    """I = Σ v_k·PTA_k (ou Σ v_k·DEP_k): soma de PTAs ponderadas por valores econômicos.

    Touros do relatório de corte: A = 203,9 e B = 247,6 (R$); do relatório de leite: A = 1.494,0 e
    B = 1.373,0; bodes do relatório de caprinos com o MFP$: C = 13,75 e D = 18,77.
    """
    return float(np.dot(np.asarray(valores, float), np.asarray(ptas, float)))


def enfase_relativa(valores, dp_ptas) -> np.ndarray:
    """Ênfase relativa de cada característica: |v_k|·σ_k / Σ|v_j|·σ_j, com σ = DP das PTAs.

    Os "percentuais" publicados dos índices são ênfases, não pesos brutos (relatório de leite:
    1,9%; 31,0%; 30,4%; 20,9%; 11,2% e 4,6%).
    """
    w = np.abs(np.asarray(valores, float)) * np.asarray(dp_ptas, float)
    return w / w.sum()


def indice_padronizado(pesos, ptas, dp_ptas, sinais=None) -> float:
    """Índice com pesos percentuais sobre PTAs padronizadas: Σ peso_k·sinal_k·PTA_k/σ_k.

    sinal = −1 onde menor é melhor (ex.: idade ao primeiro parto). Relatório de corte, pesos 15/20/
    15/30/10/10%: A = 0,873 e B = 1,117.
    """
    pesos, ptas, dp = (np.asarray(x, float) for x in (pesos, ptas, dp_ptas))
    s = np.ones_like(pesos) if sinais is None else np.asarray(sinais, float)
    return float(np.sum(pesos * s * ptas / dp))


def dp_erro_indice(valores, confiabilidades, dp_ptas) -> float:
    """Desvio-padrão do erro de um índice, supondo erros independentes entre PTAs:

        DP = √[Σ v_k²·(1 − REL_k)·σ_k²]

    σ_k = DP da PTA verdadeira. Se a fonte dá a acurácia r, use REL = r² (o relatório de corte usa
    r = 0,90 e 0,45, isto é, REL = 0,81 e 0,2025; o de leite usa REL 0,95 e 0,65).
    """
    v, rel, dp = (np.asarray(x, float) for x in (valores, confiabilidades, dp_ptas))
    if rel.ndim == 0:
        rel = np.full_like(v, float(rel))
    return float(np.sqrt(np.sum(v ** 2 * (1.0 - rel) * dp ** 2)))


def prob_superar(indice_a: float, indice_b: float, dp_erro_a: float, dp_erro_b: float) -> float:
    """P(A ser de fato melhor que B) = Φ[(I_A − I_B)/√(DP_A² + DP_B²)], erros independentes.

    Leite: A vence por R$ 121 com DP de erro 71,7 e 189,8 → 0,725. Corte: B vence por R$ 43,7 com
    DP 47,5 e 97,4 → P(B > A) = 0,66.
    """
    return norm_cdf((indice_a - indice_b) / (dp_erro_a ** 2 + dp_erro_b ** 2) ** 0.5)


def prob_superar_pta(pta_a: float, rel_a: float, pta_b: float, rel_b: float,
                     sigma_a: float) -> float:
    """P(A transmitir mais que B) para uma característica, dadas as PTAs e as confiabilidades:

        var(erro da PTA) = (1 − REL)·σ²a/4 ;  P = Φ[(PTA_A − PTA_B)/√(var_A + var_B)]

    σa = desvio-padrão genético aditivo (a PTA é metade do valor genético). Para DEP de corte use a
    acurácia convertida para REL (confiabilidade.rel_de_bif ou rel_de_r).
    """
    var_a = (1.0 - rel_a) * sigma_a ** 2 / 4.0
    var_b = (1.0 - rel_b) * sigma_a ** 2 / 4.0
    return norm_cdf((pta_a - pta_b) / (var_a + var_b) ** 0.5)


# ---------------------------------------------------------------------------------------
# Ferramentas da fêmea: MPPA e índice com o pai
# ---------------------------------------------------------------------------------------
def fator_mppa(n: int, r: float) -> float:
    """Fator de encolhimento da MPPA: n·r/[1 + (n − 1)·r] (4 crias e r 0,33 → 0,663)."""
    return n * r / (1.0 + (n - 1) * r)


def mppa(media_femea: float, n: int, r: float, media_rebanho: float = 0.0) -> float:
    """Habilidade mais provável de produção (CattleMax; BIF, glossário):

        MPPA = μ + [n·r/(1 + (n − 1)·r)]·(ȳ − μ)

    n registros (crias, lactações), repetibilidade r. Prevê o próximo registro da fêmea, inclui o
    ambiente permanente e serve para DESCARTE. Com desvios das contemporâneas, use μ = 0.
    Corte: 4 crias de 230 kg num rebanho de 200 kg, r = 0,33 → 219,9 kg. Caprinos, Exemplo 6
    (r = 0,36): C2 com desvios +120, +90 e +100 → +64,9 kg.
    """
    return media_rebanho + fator_mppa(n, r) * (media_femea - media_rebanho)


def ebv_registros_proprios(desvio_medio: float, n: int, h2: float, r: float) -> float:
    """EBV só com registros próprios: [n·h²/(1 + (n − 1)·r)]·(ȳ − μ) (pai sem avaliação)."""
    return n * h2 / (1.0 + (n - 1) * r) * desvio_medio


@dataclass
class ResultadoIndiceFemea:
    ebv: float              # valor genético predito da fêmea
    pta: float              # EBV/2
    confiabilidade: float   # b'g/σ²a
    pesos: np.ndarray       # b: [peso do desvio próprio, peso da PTA/EBV do pai (se houver)]


def indice_femea(desvios, h2: float, r: float, sigma_p: float, pta_pai: float | None = None,
                 rel_pai: float = 0.0, escala_pai: str = "PTA") -> ResultadoIndiceFemea:
    """EBV da fêmea por índice de seleção com duas fontes: os próprios registros e o pai.

        x₁ = ȳ − μ (média de n desvios das contemporâneas) ;  x₂ = PTA do pai, confiabilidade REL
        P = [[σ²P·(r + (1 − r)/n),  REL·σ²a/4],      g = [σ²a ; REL·σ²a/4] ;  b = P⁻¹g
             [REL·σ²a/4,            REL·σ²a/4]]
        EBV = b'x ;  REL da fêmea = b'g/σ²a ;  PTA = EBV/2 ;  σ²a = h²·σ²P

    Com escala_pai = "EBV", x₂ é o EBV do pai (forma dos programas ovinos, relatório de ovinos,
    Exemplo 5), e os termos do pai passam a REL·σ²a (variância) e REL·σ²a/2 (covariâncias). O EBV
    e a REL da fêmea são os mesmos nas duas escalas; só o peso b₂ muda (fica pela metade).
    Sem pai avaliado (pta_pai None ou REL 0): b = σ²a/var(x₁) = n·h²/[1 + (n − 1)·r].

    Pressupostos: a PTA do pai não contém os registros desta fêmea; a mãe não entra; o pai está na
    base e na escala do rebanho. Serve para escolher de quem guardar FILHAS (a MPPA, para descarte).
    Leite: V5 (−300 kg, pai +600 com REL 0,95) → EBV +417,6 com pesos 0,20 e 0,80.
    Caprinos, Exemplo 6: C4 (−60 kg, pai +60 com REL 0,70) → EBV +39,5.
    """
    if escala_pai not in ("PTA", "EBV"):
        raise ValueError("escala_pai deve ser 'PTA' ou 'EBV'")
    y = np.asarray(desvios, dtype=float)
    n = len(y)
    s2p = sigma_p ** 2
    s2a = h2 * s2p
    var_x1 = s2p * (r + (1.0 - r) / n)          # variância da média de n registros
    if pta_pai is None or rel_pai <= 0.0:
        P = np.array([[var_x1]])
        g = np.array([s2a])
        x = np.array([y.mean()])
    else:
        if escala_pai == "PTA":
            var_x2, cov_x2 = rel_pai * s2a / 4.0, rel_pai * s2a / 4.0
        else:
            var_x2, cov_x2 = rel_pai * s2a, rel_pai * s2a / 2.0
        # cov(x₁, x₂) = cov(a, x₂): o desvio da fêmea só se liga ao pai pela genética dela
        P = np.array([[var_x1, cov_x2], [cov_x2, var_x2]])
        g = np.array([s2a, cov_x2])
        x = np.array([y.mean(), pta_pai])
    b = np.linalg.solve(P, g)
    ebv = float(b @ x)
    return ResultadoIndiceFemea(ebv=ebv, pta=ebv / 2.0, confiabilidade=float(b @ g / s2a), pesos=b)
