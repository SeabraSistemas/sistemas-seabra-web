"""Lactação: dos controles leiteiros ao total padronizado, curvas, sólidos e células somáticas.

Conteúdo:
* fleischmann: método dos intervalos (TIM, método 2 da ICAR) com início no parto (TMY) ou na
  separação das crias (TMM), corte num dia-fim e regra de parada por intervalo longo;
* tim: o TIM de vacas (ICAR Procedure 2), até 305 dias;
* lactacao_pequenos_ruminantes: as regras da Seção 16 da ICAR para cabras e ovelhas (separação
  do aleitamento, janelas do 1º controle, intervalo máximo, mínimo de controles);
* curvas de Wood (log-linear e Gauss-Newton), Wilmink e declínio exponencial;
* FCM 4% (Gaines), ECM (Sjaunja et al. 1990, com o divisor declarado), ECS/SCS e média geométrica
  da contagem de células; controles AT e AC.

Fontes: relatório de leite, "Do controle ao total", "Curvas de lactação" e "Sólidos, energia e
células somáticas"; relatório de caprinos, "Pela ICAR, só o leite da ordenha exclusiva entra na
conta" e Exemplo 1; relatório de ovinos, "A ICAR só mede depois do desmame" e Exemplo 1.
ICAR Procedure 2 (jan. 2020); ICAR Seção 16 (Dairy Sheep and Goats); Wood (1967, Nature 216:164);
Wilmink (1987, Livest. Prod. Sci. 16:335); Schaeffer (2016, Random Regression Models, Tab. 4.1).

Unidade de tempo: dias. Os dias dos controles são contados a partir do parto (DEL).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

# Densidade para converter litros em quilos (ICAR Seção 16).
DENSIDADE_LEITE_OVELHA = 1.036   # g/mL
DENSIDADE_LEITE_CABRA = 1.032    # g/mL (fator de peso para volume citado para cabras)

# ECM de Sjaunja et al. (1990): divisor 3,140, na forma citada por três artigos abertos (relatório
# de leite), e a variante 3,1138, que é o numerador com 4,0% de gordura e 3,3% de proteína e faz a
# ECM igualar o leite com essa composição.
ECM_DIVISOR_SJAUNJA = 3.140
ECM_DIVISOR_4G_3_3P = 3.1138


# ---------------------------------------------------------------------------------------
# Método dos intervalos (Fleischmann / TIM)
# ---------------------------------------------------------------------------------------
@dataclass
class Lactacao:
    """Resultado do cálculo de uma lactação."""

    total: float                 # produção acumulada (kg ou L, a unidade dos controles)
    ate_dia: float               # último dia incluído no cálculo
    completa: bool               # False se o cálculo parou num hiato acima do intervalo máximo
    tipo: str = "TMY"            # "TMY" (desde o parto) ou "TMM" (só a ordenha exclusiva)
    n_controles: int = 0
    avisos: list = field(default_factory=list)


def fleischmann(dias, producoes, fim: float, inicio: float = 0.0,
                intervalo_maximo: float | None = None) -> Lactacao:
    """Método de Fleischmann (TIM; método 2 da ICAR, "centrado"):

        total = I₀·M₁ + Σ_{i=1..n−1} I_i·(M_i + M_{i+1})/2 + I_n·M_n

        I₀  = dias do início (parto na TMY; separação das crias na TMM) ao 1º controle
        I_i = dias entre controles consecutivos ;  I_n = dias do último controle ao fim
        M_i = produção do dia do controle i

    fim = último dia da lactação (secagem real, comprimento-padrão ou o menor dos dois). Se o fim
    cai entre dois controles, o trecho é cortado com interpolação linear. Se intervalo_maximo é
    dado e dois controles distam mais que ele, o cálculo para no controle anterior, sem
    extrapolar, e a lactação é marcada como incompleta (regra da ICAR para pequenos ruminantes).

    Exemplos: vaca do relatório de leite, 10 controles e fim 305 → 7.469,4 kg; cabra do Exemplo 1
    de caprinos, 10 controles e secagem no dia 290 → 675,9 kg; ovelha do Exemplo 1 de ovinos,
    desmame no dia 30 e secagem no dia 200 → 231,3 L de TMM.
    """
    t = [float(x) for x in dias]
    m = [float(x) for x in producoes]
    if len(t) != len(m) or not t:
        raise ValueError("dias e producoes precisam ter o mesmo tamanho (pelo menos 1 controle)")
    if any(b <= a for a, b in zip(t, t[1:])):
        raise ValueError("os dias dos controles precisam ser crescentes")
    if t[0] < inicio:
        raise ValueError("há controle antes do início da lactação considerada")
    total = (min(t[0], fim) - inicio) * m[0]
    for i in range(len(t) - 1):
        if t[i] >= fim:
            return Lactacao(total, fim, True, n_controles=len(t))
        if intervalo_maximo is not None and t[i + 1] - t[i] > intervalo_maximo:
            return Lactacao(total, t[i], False, n_controles=len(t),
                            avisos=[f"hiato de {t[i + 1] - t[i]:.0f} dias entre controles: o "
                                    f"cálculo para no dia {t[i]:.0f} (lactação incompleta)"])
        t2 = min(t[i + 1], fim)
        m2 = m[i] + (m[i + 1] - m[i]) * (t2 - t[i]) / (t[i + 1] - t[i])   # interpola se cortar
        total += (t2 - t[i]) * (m[i] + m2) / 2.0
    if t[-1] < fim:
        total += (fim - t[-1]) * m[-1]
    return Lactacao(total, fim, True, n_controles=len(t))


def tim(dias, producoes, fim: float = 305.0) -> float:
    """TIM da ICAR Procedure 2 para vacas: do parto até o dia `fim` (305 por convenção do relatório
    de leite). Vaca do relatório de leite: 7.469,4 kg com 10 controles; 7.267,1 kg (−2,7%) só com
    os controles 1, 4, 7 e 10."""
    return fleischmann(dias, producoes, fim).total


def producao_componente(dias, leite, teor_pct, fim: float, inicio: float = 0.0,
                        intervalo_maximo: float | None = None) -> float:
    """Gordura ou proteína em kg: o mesmo Fleischmann aplicado a leite × teor/100 de cada controle.

    Vaca do relatório de leite: 277,5 kg de gordura (3,72%) e 240,3 kg de proteína (3,22%);
    cabra do Exemplo 1 de caprinos: 22,51 kg de gordura e 20,38 kg de proteína.
    """
    diario = [lt * tr / 100.0 for lt, tr in zip(leite, teor_pct)]
    return fleischmann(dias, diario, fim, inicio, intervalo_maximo).total


def fim_icar(dias, comprimento: float | None = None, secagem: float | None = None,
             meio_intervalo: float = 15.0) -> float:
    """Dia-fim da lactação pela regra da ICAR para pequenos ruminantes.

    Com secagem conhecida: o menor entre a secagem e o comprimento-padrão. Sem secagem: último
    controle + metade do intervalo entre controles (15 dias com controle mensal), limitado ao
    comprimento-padrão. Cabra do Exemplo 1 de caprinos, sem secagem: 280 + 15 = dia 295.
    """
    ultimo = float(dias[-1])
    fim = float(secagem) if secagem is not None else ultimo + meio_intervalo
    return min(fim, comprimento) if comprimento is not None else fim


def lactacao_pequenos_ruminantes(dias, producoes, especie: str, secagem: float | None = None,
                                 separacao_crias: float | None = None,
                                 comprimento: float | None = None,
                                 intervalo_medio: float | None = None,
                                 minimo_controles: int = 3,
                                 producao_minima: float = 0.2) -> Lactacao:
    """Lactação de cabra ou ovelha pelas regras da Seção 16 da ICAR.

    * TMY (sem separacao_crias): ordenha desde o parto; o Fleischmann começa no parto.
    * TMM (com separacao_crias = dia da separação definitiva das crias): só a ordenha exclusiva
      entra; controles até esse dia são descartados e o Fleischmann começa nele. TMM e TMY não
      se misturam no mesmo grupo de contemporâneas.
    * 1º controle: caprino ordenhado desde o parto, entre o 6º e o 80º dia; com mamada (e ovinos),
      até a duração da mamada + 52 dias (35 dias com tolerância de 17).
    * Intervalo máximo entre controles não nulos = 2 × intervalo médio (caprino 2 × 30 = 60 dias;
      ovino 2 × 35 = 70 dias); acima disso o cálculo para no controle anterior.
    * Mínimo de controles: 3 (exigência do Fleischmann na ICAR para cabras; o estudo grego de
      ovinos exigiu o mesmo); produção mínima medida de 200 g (avisa, não descarta).
    * Fim: secagem real ou, sem ela, último controle + ½ intervalo; limitado ao comprimento-padrão
      (ex.: 305 dias na PL305 do Capragene).

    Os problemas viram `avisos`; a lactação com hiato longo volta com completa = False.
    """
    if especie not in ("caprino", "ovino"):
        raise ValueError("especie deve ser 'caprino' ou 'ovino'")
    if intervalo_medio is None:
        intervalo_medio = 30.0 if especie == "caprino" else 35.0
    avisos: list[str] = []
    t = [float(x) for x in dias]
    m = [float(x) for x in producoes]
    tipo = "TMY"
    inicio = 0.0
    if separacao_crias is not None:
        tipo = "TMM"
        inicio = float(separacao_crias)
        mantidos = [(d, p) for d, p in zip(t, m) if d > inicio]
        if len(mantidos) < len(t):
            avisos.append(f"{len(t) - len(mantidos)} controle(s) durante a mamada descartado(s) (ICAR)")
        t = [d for d, _ in mantidos]
        m = [p for _, p in mantidos]
    if len(t) < minimo_controles:
        avisos.append(f"só {len(t)} controle(s) válido(s); o mínimo é {minimo_controles}")
        return Lactacao(float("nan"), float("nan"), False, tipo, len(t), avisos)
    limite_1o = inicio + 52.0 if (tipo == "TMM" or especie == "ovino") else 80.0
    if t[0] > limite_1o:
        avisos.append(f"1º controle no dia {t[0]:.0f}, depois do limite de {limite_1o:.0f} (ICAR)")
    if tipo == "TMY" and especie == "caprino" and t[0] < 6.0:
        avisos.append(f"1º controle no dia {t[0]:.0f}, antes do 6º dia (ICAR)")
    if any(p < producao_minima for p in m):
        avisos.append(f"controle abaixo da produção mínima medível de {producao_minima} kg")
    fim = fim_icar(t, comprimento, secagem, intervalo_medio / 2.0)
    if secagem is None:
        avisos.append(f"sem data de secagem: fim calculado no dia {fim:.0f} (último + ½ intervalo)")
    resultado = fleischmann(t, m, fim, inicio, intervalo_maximo=2.0 * intervalo_medio)
    resultado.tipo = tipo
    resultado.avisos = avisos + resultado.avisos
    return resultado


# ---------------------------------------------------------------------------------------
# Curvas de lactação
# ---------------------------------------------------------------------------------------
def wood(t, a: float, b: float, c: float):
    """Curva de Wood (gama incompleta): y(t) = a·t^b·e^(−c·t)."""
    t = np.asarray(t, dtype=float)
    return a * np.power(t, b) * np.exp(-c * t)


def pico_wood(a: float, b: float, c: float) -> tuple[float, float]:
    """Pico da Wood: dy/dt = 0 → t_pico = b/c ;  y_pico = a·(b/c)^b·e^(−b)."""
    tp = b / c
    return tp, a * tp ** b * math.exp(-b)


def inflexao_wood(b: float, c: float) -> float:
    """Ponto de inflexão da fase descendente da Wood: (b + √b)/c (o outro é negativo para b < 1).

    Depois dele a curva é convexa e o trapézio do Fleischmann fica acima dela (ovinos, Exemplo 1:
    dia 78,9 com b = 0,25 e c = 0,0095).
    """
    return (b + math.sqrt(b)) / c


def ajustar_wood_loglinear(dias, producoes) -> tuple[float, float, float]:
    """Wood linearizada por mínimos quadrados ordinários: ln y = ln a + b·ln t − c·t.

    Pondera erros relativos (em log), não absolutos; serve de valor inicial para o Gauss-Newton.
    Vaca do relatório de leite: a = 13,356; b = 0,2572; c = 0,00413.
    """
    t = np.asarray(dias, dtype=float)
    X = np.column_stack([np.ones(len(t)), np.log(t), -t])
    coef, *_ = np.linalg.lstsq(X, np.log(np.asarray(producoes, dtype=float)), rcond=None)
    return float(math.exp(coef[0])), float(coef[1]), float(coef[2])


def ajustar_wood_gauss_newton(dias, producoes, inicial: tuple | None = None,
                              max_iter: int = 50,
                              tolerancia: float = 1e-12) -> tuple[float, float, float, int]:
    """Wood por mínimos quadrados não lineares (Gauss-Newton), minimizando desvios em kg.

    Jacobiano: ∂y/∂a = y/a ; ∂y/∂b = y·ln t ; ∂y/∂c = −y·t. Passo: (J'J)⁻¹J'(m − y).
    Começa no ajuste log-linear (ou em `inicial`) e para quando o maior passo fica abaixo da
    tolerância. Devolve (a, b, c, iterações). Vaca do relatório de leite: a = 13,336; b = 0,2582;
    c = 0,00415 em 6 iterações; pico no dia 62,2 com 29,93 kg; L305 = 7.440,9 kg.
    Levanta ArithmeticError se não convergir.
    """
    t = np.asarray(dias, dtype=float)
    m = np.asarray(producoes, dtype=float)
    theta = np.array(inicial if inicial is not None else ajustar_wood_loglinear(t, m), dtype=float)
    for iteracao in range(1, max_iter + 1):
        y = wood(t, *theta)
        J = np.column_stack([y / theta[0], y * np.log(t), -y * t])
        passo = np.linalg.solve(J.T @ J, J.T @ (m - y))
        theta = theta + passo
        if np.abs(passo).max() < tolerancia:
            return float(theta[0]), float(theta[1]), float(theta[2]), iteracao
    raise ArithmeticError("Gauss-Newton da curva de Wood não convergiu")


def wilmink(t, a: float, b: float, c: float, k: float = 0.05):
    """Curva de Wilmink: y(t) = a + b·e^(−k·t) + c·t (k fixo, em geral 0,05)."""
    t = np.asarray(t, dtype=float)
    return a + b * np.exp(-k * t) + c * t


def ajustar_wilmink(dias, producoes, k: float = 0.05) -> tuple[float, float, float]:
    """Wilmink por mínimos quadrados (linear em a, b, c com k fixo).
    Vaca do relatório de leite: a = 34,787; b = −18,527; c = −0,05985."""
    t = np.asarray(dias, dtype=float)
    X = np.column_stack([np.ones(len(t)), np.exp(-k * t), t])
    coef, *_ = np.linalg.lstsq(X, np.asarray(producoes, dtype=float), rcond=None)
    return float(coef[0]), float(coef[1]), float(coef[2])


def pico_wilmink(a: float, b: float, c: float, k: float = 0.05) -> tuple[float, float]:
    """Pico da Wilmink: t_pico = ln(k·b/c)/k (b e c negativos). Leite: dia 54,8 com 30,31 kg."""
    tp = math.log(k * b / c) / k
    return tp, float(wilmink(tp, a, b, c, k))


def ajustar_exponencial(dias, producoes) -> tuple[float, float]:
    """Declínio exponencial ln y = ln a − k·t por mínimos quadrados; devolve (a, k).

    Alternativa ao Fleischmann com poucos controles na fase descendente (proposta do relatório de
    ovinos, Exemplo 1: erro máximo de 6% contra 16% do Fleischmann com dois controles).
    """
    t = np.asarray(dias, dtype=float)
    X = np.column_stack([np.ones(len(t)), -t])
    coef, *_ = np.linalg.lstsq(X, np.log(np.asarray(producoes, dtype=float)), rcond=None)
    return float(math.exp(coef[0])), float(coef[1])


def total_pela_curva(curva, ate_dia: int, inicio: int = 1, secagem: int | None = None) -> float:
    """Soma diária de uma curva ajustada: Σ_{t = inicio..min(ate_dia, secagem)} y(t).

    `curva` é uma função de t (ex.: lambda t: wood(t, a, b, c)). Exemplo 1 de caprinos:
    PL_L (Wood) = Σ_{t=1..min(L, secagem)} y(t).
    """
    fim = ate_dia if secagem is None else min(ate_dia, secagem)
    dias = np.arange(inicio, fim + 1, dtype=float)
    return float(np.sum(curva(dias)))


def rmse(observado, previsto) -> float:
    """Raiz do erro quadrático médio entre controles e curva."""
    o, p = np.asarray(observado, dtype=float), np.asarray(previsto, dtype=float)
    return float(np.sqrt(np.mean((o - p) ** 2)))


# ---------------------------------------------------------------------------------------
# Sólidos, energia e células somáticas
# ---------------------------------------------------------------------------------------
def fcm4(leite_kg: float, gordura_kg: float) -> float:
    """Leite corrigido para 4% de gordura (Gaines 1928): FCM = 0,4·leite + 15·gordura (kg).
    Vaca do relatório de leite: 7.150,5 kg."""
    return 0.4 * leite_kg + 15.0 * gordura_kg


def ecm(leite_kg: float, gordura_pct: float, proteina_pct: float,
        divisor: float = ECM_DIVISOR_SJAUNJA) -> float:
    """Leite corrigido para energia, versão de Sjaunja et al. (1990, ICAR):

        ECM = leite × (0,383·G% + 0,242·P% + 0,7832) / divisor

    Divisor padrão 3,140 (ECM_DIVISOR_SJAUNJA); a variante 3,1138 (ECM_DIVISOR_4G_3_3P) faz a ECM
    igualar o leite com 4,0% de gordura e 3,3% de proteína. As duas não são equivalentes: o
    relatório técnico deve declarar a versão. Vaca do relatório de leite: 7.100,4 kg com 3,140 e
    7.160,2 kg com 3,1138.
    """
    return leite_kg * (0.383 * gordura_pct + 0.242 * proteina_pct + 0.7832) / divisor


def ecs(ccs_mil_por_ml):
    """Escore de células somáticas (Shook 1982; Da et al. 1992):  ECS = log₂(CCS/100) + 3,
    com CCS em MIL células/mL. 50, 100, 200, 400 e 800 mil → 2, 3, 4, 5 e 6. Aceita número ou
    sequência (devolve array)."""
    if isinstance(ccs_mil_por_ml, (int, float)):
        return math.log2(ccs_mil_por_ml / 100.0) + 3.0
    return np.log2(np.asarray(ccs_mil_por_ml, dtype=float) / 100.0) + 3.0


def ccs_de_ecs(escore: float) -> float:
    """Inversa do ECS: CCS (mil células/mL) = 100·2^(ECS − 3)."""
    return 100.0 * 2.0 ** (escore - 3.0)


def ccs_media_geometrica(ccs_mil_por_ml) -> float:
    """Média geométrica das contagens = 100·2^(ECS médio − 3), em mil células/mL.

    É a medida certa para o manejo; a aritmética é puxada pelas contagens altas. Cabra do
    relatório de caprinos (420 a 3.100 mil): ECS médio 6,50 → 1.135 mil, contra 1.418 mil.
    """
    return ccs_de_ecs(float(np.mean(ecs(ccs_mil_por_ml))))


def controle_at(ordenha_medida: float) -> float:
    """Controle AT: uma ordenha alternada (manhã num mês, tarde no outro) × 2 (ICAR Seção 16)."""
    return 2.0 * ordenha_medida


def controle_ac(ordenha_medida: float, tanque_total: float, tanque_da_ordenha_medida: float) -> float:
    """Controle AC: ordenha medida × (tanque das duas ordenhas / tanque da ordenha medida).

    Forma usual; o Anexo 1 da ICAR não foi transcrito nas notas (relatório de ovinos, Exemplo 1:
    1,05 L de manhã, tanque de 132 L de manhã e 88 L à tarde → 1,75 L/dia, contra 2,10 do AT).
    """
    return ordenha_medida * tanque_total / tanque_da_ordenha_medida
