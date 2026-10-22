"""Lactação: dos controles leiteiros ao total padronizado, curvas, sólidos e células somáticas.

Conteúdo:
* fleischmann: método dos intervalos (TIM, método 2 da ICAR) com início no parto (TMY) ou na
  separação das crias (TMM), corte num dia-fim e regra de parada por intervalo longo;
* tim: o TIM de vacas (ICAR Procedure 2), até 305 dias;
* lactacao_pequenos_ruminantes: as regras da Seção 16 da ICAR para cabras e ovelhas (separação
  do aleitamento, janelas do 1º controle, intervalo máximo, mínimo de controles); por padrão só
  avisa quando uma regra é violada, e com estrito_norma=True aplica a norma (sem cálculo com o 1º
  controle fora da janela; hiato máximo e meio intervalo conforme o método de controle);
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

# Seção 16 da ICAR, tabela de intervalos entre controles (caprinos 2.5.1; ovinos 1.2.4.1): intervalo
# médio do rebanho por método. O dígito é o intervalo em semanas (4, 5, 6 e, só em caprinos, 7); T, C,
# Z e Y (uma ordenha medida ou amostrada) têm 30 dias, como o A4. O 2º caractere do método vem depois da
# letra de quem mede (A, B, C ou E).
INTERVALO_MEDIO_METODO = {"4": 30.0, "5": 36.0, "6": 42.0, "7": 49.0,
                          "T": 30.0, "C": 30.0, "Z": 30.0, "Y": 30.0}
SEGUNDO_CARACTERE_VALIDO = {"caprino": "4567TCZY", "ovino": "456TC"}
# Ovinos, 1.2.4.2: hiato máximo entre dois controles não nulos = 70 dias (2 × 35), qualquer método.
HIATO_MAXIMO_OVINO = 70.0

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


def intervalo_medio_do_metodo(metodo: str, especie: str) -> float:
    """Intervalo médio entre controles do método (Seção 16 da ICAR): A4/B4/C4/E4 = 30 dias; 5 = 36;
    6 = 42; 7 = 49 (só caprinos); AT, AC, AZ e AY = 30. O hiato máximo de caprinos é o dobro
    (60, 72, 84 e 98 dias para A4, A5, A6 e A7; ICAR 2.5.2). O método D não é oficial e não entra."""
    if especie not in SEGUNDO_CARACTERE_VALIDO:
        raise ValueError("especie deve ser 'caprino' ou 'ovino'")
    m = str(metodo).strip().upper()
    if len(m) != 2 or m[0] not in "ABCE" or m[1] not in SEGUNDO_CARACTERE_VALIDO[especie]:
        raise ValueError(f"método {metodo!r} inválido para {especie} (use, por exemplo, A4, A5, A6"
                         f"{', A7' if especie == 'caprino' else ''}, AT ou AC; o D não é oficial)")
    return INTERVALO_MEDIO_METODO[m[1]]


def lactacao_pequenos_ruminantes(dias, producoes, especie: str, secagem: float | None = None,
                                 separacao_crias: float | None = None,
                                 comprimento: float | None = None,
                                 intervalo_medio: float | None = None,
                                 minimo_controles: int = 3,
                                 producao_minima: float = 0.2,
                                 estrito_norma: bool = False,
                                 metodo: str | None = None,
                                 limite_primeiro_controle: float | None = None) -> Lactacao:
    """Lactação de cabra ou ovelha pelas regras da Seção 16 da ICAR.

    * TMY (sem separacao_crias): ordenha desde o parto; o Fleischmann começa no parto.
    * TMM (com separacao_crias = dia da separação definitiva das crias): só a ordenha exclusiva
      entra; controles até esse dia são descartados e o Fleischmann começa nele. TMM e TMY não
      se misturam no mesmo grupo de contemporâneas.
    * 1º controle: caprino ordenhado desde o parto, entre o 6º e o 80º dia; com mamada (e ovinos),
      até a duração da mamada + 52 dias (35 dias com tolerância de 17). A norma manda não calcular
      a lactação quando o 1º controle passa do limite (caprinos 2.4.2.1 e 2.4.2.2; ovinos 1.2.3.2).
    * Intervalo máximo entre controles não nulos: caprinos, 2 × o intervalo médio do método
      (60, 72, 84 e 98 dias em A4, A5, A6 e A7; 2.5.2); ovinos, 70 dias (1.2.4.2). Acima disso o
      cálculo para no controle anterior. O padrão deste motor é o do método A4 (caprino 2 × 30 = 60;
      ovino 2 × 35 = 70); para A5, A6 e A7 informe `intervalo_medio` (36, 42, 49) ou use `metodo`.
    * Mínimo de controles: 3 (exigência do Fleischmann na ICAR para cabras, 2.7.3 e 2.7.4; o
      parágrafo 2.5.2 diz "não fixado", e para ovelhas a norma também não fixa; o estudo grego de
      ovinos exigiu 3); produção mínima medida de 200 g (avisa, não descarta).
    * Fim: secagem real ou, sem ela, último controle + ½ intervalo; limitado ao comprimento-padrão
      (ex.: 305 dias na PL305 do Capragene). A regra do meio intervalo (2.7.5) está escrita só para
      cabras; para ovelhas a norma deixa a data de secagem calculada a cargo da organização.
    * A Seção 16 (2.8.2, caprinos) também permite estimar controles faltantes, num hiato de até 100
      dias, pela média dos vizinhos. Esta função não faz isso: para no controle anterior (2.5.2). As
      duas cláusulas coexistem no texto da norma e não se conciliam.

    Por padrão (estrito_norma = False) os problemas viram `avisos` e a conta segue, como nas versões
    anteriores: nenhum número existente muda. Com `estrito_norma = True` a função aplica a norma:

    * 1º controle depois do limite → sem cálculo (total e ate_dia NaN, completa = False, aviso). O
      limite vem de `limite_primeiro_controle` (dia a partir do parto) quando informado; a norma só
      admite essa exceção para cabras ("se a sociedade da raça justificar limite maior"), e a função
      levanta ValueError para ovinos. Um 1º controle de cabra antes do 6º dia só gera aviso, porque
      a norma escreve "não calcular" para o limite superior;
    * hiato máximo e meio intervalo conforme o método de controle (`metodo`: A4, B5, AT, AC, AZ...):
      cabras, 2 × e ½ × o intervalo médio do método; ovelhas, hiato fixo de 70 dias, e o meio
      intervalo do fim, sem secagem, de 15 dias no A4 (36 e 42 dias de intervalo médio no A5 e A6),
      por analogia com a cabra, o que a função avisa. Sem `metodo`, vale `intervalo_medio` e, na falta
      dele, 30 dias (A4, o método-padrão da ICAR); no estrito o padrão de ovinos deixa de ser 35.

    Os problemas viram `avisos`; a lactação com hiato longo volta com completa = False.
    """
    if especie not in ("caprino", "ovino"):
        raise ValueError("especie deve ser 'caprino' ou 'ovino'")
    if estrito_norma and especie == "ovino" and limite_primeiro_controle is not None:
        raise ValueError("a Seção 16 só admite limite maior do 1º controle para cabras (2.4.2)")
    avisos: list[str] = []
    if estrito_norma:
        if metodo is not None:
            intervalo_medio = intervalo_medio_do_metodo(metodo, especie)
        elif intervalo_medio is None:
            intervalo_medio = 30.0
        hiato_maximo = HIATO_MAXIMO_OVINO if especie == "ovino" else 2.0 * intervalo_medio
    else:
        if metodo is not None:
            avisos.append("método informado ignorado: só vale com estrito_norma = True")
        if intervalo_medio is None:
            intervalo_medio = 30.0 if especie == "caprino" else 35.0
        hiato_maximo = 2.0 * intervalo_medio
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
    if limite_primeiro_controle is not None:
        limite_1o = float(limite_primeiro_controle)
    else:
        limite_1o = inicio + 52.0 if (tipo == "TMM" or especie == "ovino") else 80.0
    if t[0] > limite_1o:
        aviso_1o = f"1º controle no dia {t[0]:.0f}, depois do limite de {limite_1o:.0f} (ICAR)"
        if estrito_norma:
            avisos.append(aviso_1o + ": sem cálculo de lactação (Seção 16: \"there should be no "
                          "lactation calculation\")")
            return Lactacao(float("nan"), float("nan"), False, tipo, len(t), avisos)
        avisos.append(aviso_1o)
    if tipo == "TMY" and especie == "caprino" and t[0] < 6.0:
        avisos.append(f"1º controle no dia {t[0]:.0f}, antes do 6º dia (ICAR)")
    if any(p < producao_minima for p in m):
        avisos.append(f"controle abaixo da produção mínima medível de {producao_minima} kg")
    fim = fim_icar(t, comprimento, secagem, intervalo_medio / 2.0)
    if secagem is None:
        avisos.append(f"sem data de secagem: fim calculado no dia {fim:.0f} (último + ½ intervalo)")
        if estrito_norma and especie == "ovino":
            avisos.append("ovelha: a Seção 16 não escreve a regra do meio intervalo (2.7.5 é de cabras); "
                          "aplicada por analogia com a cabra")
    resultado = fleischmann(t, m, fim, inicio, intervalo_maximo=hiato_maximo)
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

    Forma usual, não verificada. A Seção 16 da ICAR não escreve a fórmula do AC: o Anexo 1 só o
    define (nota 1: teste mensal corrigido para as diferenças manhã/tarde, pelo volume de leite que o
    rebanho todo produziu nas duas ordenhas, o tanque), e o texto de ovinos (1.2.5 e a garantia de
    qualidade do AC, 1.2.6) descreve o coeficiente sem dar a conta; para cabras (2.5.1) a norma
    remete aos métodos da Procedure 1 da Seção 02, a critério de cada membro da ICAR. Relatório de
    ovinos, Exemplo 1: 1,05 L de manhã, tanque de 132 L de manhã e 88 L à tarde → 1,75 L/dia,
    contra 2,10 do AT.
    """
    return ordenha_medida * tanque_total / tanque_da_ordenha_medida
