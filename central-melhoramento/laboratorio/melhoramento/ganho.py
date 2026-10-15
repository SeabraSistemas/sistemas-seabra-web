"""Ganho genético, intensidade de seleção, tendência e conversão de dias abertos em DPR.

Conteúdo:
* intensidade_selecao: i = φ(z)/p para seleção por truncamento;
* resposta_selecao: equação do criador, ΔG = i·r·σa/L;
* ganho_vias: resposta em duas ou quatro vias, ΔG = Σ(i·r)·σa/ΣL (Rendel e Robertson 1950);
* ganho_diferenciais: ΔG = Σ ΔG_k/Σ L_k a partir dos diferenciais de cada via;
* tendencia: inclinação da média por ano (tendência genética ou fenotípica);
* absorcao: aproximação do rebanho a reprodutores externos por gerações;
* dpr_aipl e dpr_linear: dias abertos → taxa de prenhez das filhas (VanRaden et al. 2004, AIPL/USDA).

Fontes: relatório de corte, "Resposta à seleção: a equação do criador" e "Tendência genética";
relatório de leite, "Resposta à seleção pelas quatro vias" e "Fertilidade: dias abertos viram taxa
de prenhez"; relatório de caprinos, Exemplo 5; relatório de ovinos, Exemplo 8. Rendel e Robertson
(1950, J. Genet. 50:1); Van Tassell e Van Vleck (1991, J. Dairy Sci. 74:1078); VanRaden et al.
(2004, J. Dairy Sci. 87:2285).
"""

from __future__ import annotations

import numpy as np

from .taxas import norm_pdf, norm_ppf


def intensidade_selecao(proporcao_selecionada: float) -> float:
    """Intensidade de seleção por truncamento numa normal: i = φ(z)/p, com z = Φ⁻¹(1 − p).

    p = fração selecionada. 5% → 2,063; 10% → 1,755; 15% → 1,554; 20% → 1,400; 50% → 0,798;
    70% → 0,497; 80% → 0,350 (relatórios de corte e de caprinos). Supõe população grande.
    """
    p = proporcao_selecionada
    if not 0.0 < p < 1.0:
        raise ValueError("a proporção selecionada deve estar entre 0 e 1")
    return norm_pdf(norm_ppf(1.0 - p)) / p


def resposta_selecao(i: float, r: float, sigma_a: float, intervalo_geracao: float = 1.0) -> float:
    """Equação do criador: ΔG = i·r·σa/L (por ano se L em anos; por geração com L = 1).

    i = intensidade; r = acurácia da seleção; σa = desvio-padrão genético aditivo; L = intervalo
    de gerações (Missouri Extension G02013, relatório de corte).
    """
    return i * r * sigma_a / intervalo_geracao


def ganho_vias(vias, sigma_a: float) -> float:
    """Resposta anual somando vias de seleção (Rendel e Robertson 1950):

        ΔG = Σ_k (i_k·r_k)·σa / Σ_k L_k

    vias: lista de (i, r, L). Duas vias (machos e fêmeas) ou quatro (pai de touro, pai de vaca,
    mãe de touro, mãe de vaca). Caprinos, Exemplo 5, teste de progênie com σa = 89,4 kg:
    [(1,400; 0,79; 5,5), (1,400; 0,79; 5,5), (2,063; 0,60; 4), (0,350; 0,55; 4)] → 17,1 kg/ano.
    Corte: touros (1,755; 0,70; 3,5) e novilhas (0,497; 0,50; 6) com σa = 10 → 1,55 kg/ano.
    """
    soma_ir = sum(i * r for i, r, _ in vias)
    soma_L = sum(L for _, _, L in vias)
    return soma_ir * sigma_a / soma_L


def ganho_diferenciais(diferenciais, intervalos) -> float:
    """ΔG = Σ ΔG_k / Σ L_k, com ΔG_k = i_k·r_k·σa já calculado (diferencial genético de cada via).

    Van Tassell e Van Vleck (1991): 405, 395, 239 e 42 kg com 10,2; 6,4; 9,3 e 5,1 anos → 34,87
    kg/ano (relatório de leite).
    """
    return float(np.sum(diferenciais) / np.sum(intervalos))


def tendencia(anos, valores) -> float:
    """Inclinação da regressão linear dos valores no ano (mínimos quadrados).

    Com DEPs médias por ano de nascimento dá a tendência genética da DEP (o dobro é a do valor
    genético); com médias fenotípicas, a fenotípica; a diferença estima a ambiental. Relatório de
    corte: DEPs 1,8 a 4,4 de 2020 a 2025 → 0,517 kg/ano; P205 → 1,97 kg/ano.
    """
    x = np.asarray(anos, float)
    y = np.asarray(valores, float)
    xc = x - x.mean()
    return float(np.sum(xc * (y - y.mean())) / np.sum(xc * xc))


def absorcao(distancia_inicial: float, tendencia_anual: float, intervalo_geracao: float,
             geracoes: int) -> list[dict]:
    """Rebanho que usa sempre reprodutores externos (sêmen importado) de nível R:

        G_{t+1} = G_t + ½·(R_t − G_t) ;  R_{t+1} = R_t + T·L ;  distância de equilíbrio = 2·T·L

    G₀ = 0, R₀ = distância inicial (já descontada pela correlação genética entre ambientes);
    T = tendência anual da população de origem; L = intervalo de gerações. Relatório de ovinos,
    Exemplo 8: 55 L, T = 4,3 × 0,86 L/ano e L = 3,75 → 27,5; 48,2; 65,5 e 81,0 L.
    """
    G, R = 0.0, float(distancia_inicial)
    saida = []
    for g in range(1, geracoes + 1):
        G = G + 0.5 * (R - G)
        R = R + tendencia_anual * intervalo_geracao
        saida.append({"geracao": g, "anos": g * intervalo_geracao, "rebanho": G,
                      "reprodutores": R, "distancia": R - G})
    return saida


def dpr_aipl(dias_abertos: float, periodo_espera: float = 60.0) -> float:
    """Taxa de prenhez (%) a partir dos dias abertos, forma hiperbólica de VanRaden et al. (2004):

        PR = 21/(DO − PEV + 11) × 100

    PEV = período de espera voluntário. O denominador conta, em ciclos de 21 dias, quanto a vaca
    levou para conceber depois do PEV; o +11 centra a medida no ciclo. Com PEV de 60 dias: 154 dias
    abertos → 20%; 133 → 25%; 90 → 51,2% (relatório de leite).
    """
    return 100.0 * 21.0 / (dias_abertos - periodo_espera + 11.0)


def dpr_linear(dias_abertos: float) -> float:
    """DPR linear de VanRaden et al. (2004): DPR = 0,25·(233 − DO), com DO limitado a [50, 250].

    Cada ponto de DPR equivale a 4 dias abertos. É uma secante da forma hiperbólica: coincide com
    ela entre 133 e 150 dias e diverge nos extremos (90 dias: 35,8% contra 51,2%).
    """
    do = min(250.0, max(50.0, dias_abertos))
    return 0.25 * (233.0 - do)
