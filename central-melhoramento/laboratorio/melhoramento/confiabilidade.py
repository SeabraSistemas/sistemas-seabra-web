"""Confiabilidade (REL), filhas-equivalentes (DE), acurácia e as conversões entre escalas.

Três escalas convivem nos sumários e não se comparam sem conversão (relatório de corte,
"Passo 3: da PEV à acurácia e à DEP"):

    confiabilidade   REL = r² = 1 − PEV / [(1 + F)·σ²a]
    acurácia         r   = √REL                       (correlação entre predito e verdadeiro)
    acurácia BIF     a_BIF = 1 − √(1 − REL)           (escala do BIF, adotada pela ANCP e ABCZ)

Filhas-equivalentes (VanRaden e Wiggans 1991, J. Dairy Sci. 74:2737, pp. 2741-2742; relatório de
leite, "Filhas-equivalentes: a régua comum de toda informação"):

    REL = DE/(DE + k) ⇔ DE = k·REL/(1 − REL)
    k_d = (4 − 2h²)/h²   mérito das companheiras (mães) conhecido e descontado (USDA: 14 com h² 0,25)
    k   = (4 − h²)/h²    companheiras desconhecidas, modelo de touro (15 com h² 0,25)

Confiabilidade genômica esperada (Daetwyler, Villanueva e Woolliams 2008, PLoS ONE 3:e3395, eq. 1;
relatório de leite, "Confiabilidade genômica"): REL = N·h²/(N·h² + Me), r = √REL.
"""

from __future__ import annotations

import math


# ---------------------------------------------------------------------------------------
# Conversões entre escalas
# ---------------------------------------------------------------------------------------
def rel_de_pev(pev, sigma2_a: float, F=0.0):
    """Confiabilidade a partir da variância do erro de predição: REL = 1 − PEV/[(1 + F)·σ²a].

    O fator (1 + F) usa a variância genética do próprio animal, que cresce com a endogamia
    (BIF, Accuracy; Legarra e Reverter 2018, GSE 50:53). Aceita números ou arrays numpy.
    """
    return 1.0 - pev / ((1.0 + F) * sigma2_a)


def r_de_rel(rel):
    """Acurácia r = √REL (aceita número ou array numpy)."""
    return rel ** 0.5


def rel_de_r(r):
    """Confiabilidade REL = r²."""
    return r * r


def bif_de_rel(rel):
    """Acurácia BIF a partir da confiabilidade: a_BIF = 1 − √(1 − REL)."""
    return 1.0 - (1.0 - rel) ** 0.5


def rel_de_bif(a_bif):
    """Confiabilidade a partir da acurácia BIF: REL = 1 − (1 − a_BIF)²."""
    return 1.0 - (1.0 - a_bif) ** 2


def bif_de_r(r):
    """Acurácia BIF a partir de r: a_BIF = 1 − √(1 − r²).

    Tabela do relatório de corte: r 0,50 → 0,134; 0,60 → 0,200; 0,80 → 0,400; 0,90 → 0,564;
    0,98 → 0,801. A extensão de Missouri usa a mesma conversão ("true accuracy is 0.5 (equal
    to a BIF accuracy of 0.13)").
    """
    return bif_de_rel(r * r)


def r_de_bif(a_bif):
    """r a partir da acurácia BIF: r = √[1 − (1 − a_BIF)²]."""
    return rel_de_bif(a_bif) ** 0.5


# ---------------------------------------------------------------------------------------
# Filhas-equivalentes
# ---------------------------------------------------------------------------------------
def k_d(h2: float) -> float:
    """k_d = (4 − 2h²)/h²: razão entre variância de erro e de touro com o mérito da mãe
    (das companheiras) conhecido e descontado. h² 0,25 → 14 (USDA); 0,20 → 18; 0,30 → 11,33."""
    return (4.0 - 2.0 * h2) / h2


def k_touro(h2: float) -> float:
    """k = (4 − h²)/h²: modelo de touro com mães desconhecidas. h² 0,25 → 15; 0,20 → 19;
    0,30 → 12,33. É também o λ das equações de modelo de touro (blup.modelo_touro)."""
    return (4.0 - h2) / h2


def rel_de_de(de: float, k: float) -> float:
    """REL = DE/(DE + k)."""
    return de / (de + k)


def de_de_rel(rel: float, k: float) -> float:
    """DE = k·REL/(1 − REL): filhas-equivalentes necessárias para uma confiabilidade.

    Ex.: REL 0,50 e 0,70 com h² 0,20 (k_d = 18) exigem 18 e 42 filhas-equivalentes
    (caprinos, "PTA, base e confiabilidade"); REL genômica de 0,70 equivale a 32,7 filhas para
    leite (k_d = 14) e 228,7 para DPR (k_d = 98) (leite, "Filhas-equivalentes").
    """
    return k * rel / (1.0 - rel)


def rel_filhas(n_filhas: float, h2: float, merito_companheiras_conhecido: bool = True) -> float:
    """REL de um reprodutor com n filhas, cada uma num rebanho diferente: REL = n/(n + k).

    Com merito_companheiras_conhecido=True usa k_d = (4 − 2h²)/h²; com False, k = (4 − h²)/h².
    Com h² 0,25 e 100 filhas: 0,877 (k_d = 14) e 0,870 (k = 15). DE ≈ n só vale com muitas
    contemporâneas por filha; filhas concentradas num rebanho valem menos (de_filhas_mesmo_rebanho
    e blup.rel_exata_modelo_touro).
    """
    k = k_d(h2) if merito_companheiras_conhecido else k_touro(h2)
    return rel_de_de(n_filhas, k)


def de_filhas_mesmo_rebanho(d: float) -> float:
    """DE de d filhas do mesmo touro no mesmo rebanho (USDA, com interação rebanho × touro):

        DE = 1 / (0,16 + 0,84/d)        (VanRaden e Wiggans 1991, Tabela 2)

    10 filhas → 4,1 DE; 100 filhas → 5,9 DE: a informação satura dentro de um rebanho.
    """
    return 1.0 / (0.16 + 0.84 / d)


def h2_media_repetida(m: int, h2: float, r: float) -> float:
    """Herdabilidade da média de m registros com repetibilidade r: h²_m = m·h²/[1 + (m − 1)·r]."""
    return m * h2 / (1.0 + (m - 1) * r)


def de_registros_proprios(m: int, h2: float, r: float) -> float:
    """DE do registro próprio com m lactações: DE = k_d·h²_m/(1 − h²_m), com k_d da h² base.

    Com h² 0,25 e r 0,55 (base americana): 4,7; 7,8 e 9,0 DE com 1, 3 e 5 lactações
    (VanRaden e Wiggans 1991, Tabela 1; relatório de leite).
    """
    h2m = h2_media_repetida(m, h2, r)
    return k_d(h2) * h2m / (1.0 - h2m)


def de_filha_com_lactacoes(m: int, h2: float, r: float) -> float:
    """DE que uma filha com m lactações dá ao pai: DE = k_d/k_m, k_m = (4 − 2h²_m)/h²_m.

    Derivação do relatório de leite que reproduz a Tabela 1 de VanRaden e Wiggans (1991):
    1, 3 e 5 lactações valem 1,0; 1,52 e 1,70 filhas-equivalentes (h² 0,25; r 0,55).
    """
    return k_d(h2) / k_d(h2_media_repetida(m, h2, r))


def rel_media_pais(rel_pai: float, rel_mae: float) -> float:
    """Confiabilidade da média dos pais: REL_PA = (REL_pai + REL_mãe)/4.

    Use as REL dos pais sem a informação que o próprio animal lhes deu, para não contá-la
    duas vezes. Pai 0,70 e mãe 0,30 → REL_PA 0,25 → 4,7 DE com k_d = 14.
    """
    return 0.25 * (rel_pai + rel_mae)


def rel_total(h2: float, de_media_pais: float = 0.0, de_proprio: float = 0.0,
              de_progenie: float = 0.0) -> float:
    """REL combinando as fontes: DE = DE_PA + DE_próprio + Σ DE_progênie; REL = DE/(DE + k_d).

    Tabela do relatório de leite: 10 filhas + PA de REL 0,30 com h² 0,25 → 0,533.
    """
    de = de_media_pais + de_proprio + de_progenie
    return rel_de_de(de, k_d(h2))


# ---------------------------------------------------------------------------------------
# Genômica: Daetwyler et al. (2008)
# ---------------------------------------------------------------------------------------
def daetwyler_rel(n_referencia: float, h2: float, me: float) -> float:
    """Confiabilidade genômica esperada: REL = N·h²/(N·h² + Me).

    N = tamanho da referência; h² = herdabilidade (ou REL) do pseudofenótipo; Me = número efetivo
    de segmentos cromossômicos independentes. Com touros de 100 filhas (REL 0,877) e Me 5.000:
    1.000, 5.000 e 20.000 touros → 0,149; 0,467 e 0,778 (relatório de leite).
    """
    return n_referencia * h2 / (n_referencia * h2 + me)


def daetwyler_r(n_referencia: float, h2: float, me: float) -> float:
    """Acurácia genômica esperada: r = √[λh²/(λh² + 1)], λ = N/Me (Daetwyler et al. 2008, eq. 1)."""
    return math.sqrt(daetwyler_rel(n_referencia, h2, me))


def daetwyler_n_para_rel(rel: float, h2: float, me: float) -> float:
    """Tamanho da referência para uma REL alvo: N = Me·REL / [h²·(1 − REL)].

    Me 5.000: REL 0,50 exige 16.667 animais com h² 0,30 e 125.000 com h² 0,04 (leite); r 0,50
    (REL 0,25) com h² 0,30 exige 5.556 (corte).
    """
    return me * rel / (h2 * (1.0 - rel))
