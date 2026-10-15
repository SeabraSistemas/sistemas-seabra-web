"""Taxas do rebanho: intervalos de confiança, tamanho amostral, CUSUM e o núcleo numérico.

O ambiente do laboratório não tem scipy, e o SeabraApp (Dart) e as Edge Functions
(TypeScript) também não têm funções estatísticas prontas. Por isso este módulo
implementa, só com a biblioteca padrão, as rotinas numéricas de que o pacote precisa:

* log-gama de Lanczos (g = 7, 9 coeficientes);
* função erro complementar pela gama incompleta regularizada (série e fração continuada);
* CDF da normal e inversa da normal (algoritmo de Acklam com um passo de Halley);
* beta incompleta regularizada por fração continuada (Lentz modificado) e quantil por bisseção;
* CDF e quantil da t de Student pela beta incompleta.

Cada rotina é curta e determinística, para ser traduzida linha a linha. Os testes conferem
cada uma contra a biblioteca padrão do Python (math.lgamma, math.erfc, NormalDist).

Fontes dos modelos de taxa:
* Relatório de bovinos leiteiros, seção "Toda taxa precisa de intervalo de confiança"
  (Wald, Wilson, exato; n por grupo; posteriori Beta; CUSUM).
* Relatório de caprinos leiteiros, Exemplo 7 (30 cabras) e relatório de ovinos leiteiros,
  Exemplo 6 (40 ovelhas): intervalos, n por grupo com variância agrupada e poder.
* Wilson (1927, JASA 22:209); Clopper e Pearson (1934, Biometrika 26:404);
  Fleiss, Levin e Paik (2003, Statistical Methods for Rates and Proportions, cap. 4);
  Page (1954, Biometrika 41:100) para o CUSUM.
"""

from __future__ import annotations

import math

# ---------------------------------------------------------------------------------------
# Constantes numéricas
# ---------------------------------------------------------------------------------------
EPS = 1e-15            # tolerância relativa das frações continuadas e séries
FPMIN = 1e-300         # menor número usado para evitar divisão por zero (Lentz modificado)
MAX_ITER = 10_000      # limite de iterações das frações continuadas
RAIZ_2PI = math.sqrt(2.0 * math.pi)

# Coeficientes da aproximação de Lanczos com g = 7 e 9 termos (Godfrey; precisão ~1e-15).
_LANCZOS_G = 7.0
_LANCZOS_COEF = (
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
)


# ---------------------------------------------------------------------------------------
# Funções especiais
# ---------------------------------------------------------------------------------------
def log_gama(x: float) -> float:
    """Logaritmo natural da função gama, ln Γ(x), para x > 0.

    Aproximação de Lanczos (1964, SIAM J. Numer. Anal. B 1:86) com g = 7 e os 9 coeficientes
    de P. Godfrey:

        Γ(z + 1) = √(2π) · (z + g + ½)^(z + ½) · e^−(z + g + ½) · A_g(z)
        A_g(z)   = c₀ + Σ_{k=1..8} c_k / (z + k)

    Para x < ½ usa a reflexão Γ(x)Γ(1 − x) = π / sen(πx). Erro relativo da ordem de 1e-15.
    Substitui math.lgamma para que a mesma conta possa ser portada para Dart e TypeScript.
    """
    if x <= 0.0:
        raise ValueError("log_gama exige x > 0")
    if x < 0.5:
        return math.log(math.pi / math.sin(math.pi * x)) - log_gama(1.0 - x)
    z = x - 1.0
    soma = _LANCZOS_COEF[0]
    for k in range(1, len(_LANCZOS_COEF)):
        soma += _LANCZOS_COEF[k] / (z + k)
    t = z + _LANCZOS_G + 0.5
    return 0.5 * math.log(2.0 * math.pi) + (z + 0.5) * math.log(t) - t + math.log(soma)


def _gama_inc_serie(a: float, x: float) -> float:
    """P(a, x) pela série  P = e^−x x^a / Γ(a) · Σ_n x^n / [a(a+1)…(a+n)]  (use com x < a + 1)."""
    ap = a
    termo = 1.0 / a
    soma = termo
    for _ in range(MAX_ITER):
        ap += 1.0
        termo *= x / ap
        soma += termo
        if abs(termo) < abs(soma) * EPS:
            break
    return soma * math.exp(-x + a * math.log(x) - log_gama(a))


def _gama_inc_fracao(a: float, x: float) -> float:
    """Q(a, x) = 1 − P(a, x) pela fração continuada de Legendre, avaliada pelo método de
    Lentz modificado (Press et al., Numerical Recipes, 3ª ed., §6.2). Use com x ≥ a + 1."""
    b = x + 1.0 - a
    c = 1.0 / FPMIN
    d = 1.0 / b
    h = d
    for i in range(1, MAX_ITER):
        an = -i * (i - a)
        b += 2.0
        d = an * d + b
        if abs(d) < FPMIN:
            d = FPMIN
        c = b + an / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < EPS:
            break
    return math.exp(-x + a * math.log(x) - log_gama(a)) * h


def gama_incompleta_regularizada_q(a: float, x: float) -> float:
    """Q(a, x) = Γ(a, x)/Γ(a), a gama incompleta superior regularizada (a > 0, x ≥ 0)."""
    if x < 0.0 or a <= 0.0:
        raise ValueError("gama incompleta exige a > 0 e x >= 0")
    if x == 0.0:
        return 1.0
    if x < a + 1.0:
        return 1.0 - _gama_inc_serie(a, x)
    return _gama_inc_fracao(a, x)


def erfc(x: float) -> float:
    """Função erro complementar, erfc(x) = 1 − erf(x).

    Usa a identidade erfc(x) = Q(½, x²) para x ≥ 0 e erfc(−x) = 2 − erfc(x) (Press et al.,
    Numerical Recipes, 3ª ed., §6.2). Precisão relativa ~1e-15, também nas caudas.
    """
    if x < 0.0:
        return 2.0 - erfc(-x)
    if x == 0.0:
        return 1.0
    return gama_incompleta_regularizada_q(0.5, x * x)


def norm_pdf(z: float) -> float:
    """Densidade da normal padrão, φ(z) = e^(−z²/2) / √(2π)."""
    return math.exp(-0.5 * z * z) / RAIZ_2PI


def norm_cdf(z: float) -> float:
    """Distribuição acumulada da normal padrão, Φ(z) = ½·erfc(−z/√2)."""
    return 0.5 * erfc(-z / math.sqrt(2.0))


# Coeficientes do algoritmo de Peter J. Acklam (2003) para a inversa da normal.
_ACK_A = (-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
          1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00)
_ACK_B = (-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
          6.680131188771972e+01, -1.328068155288572e+01)
_ACK_C = (-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
          -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00)
_ACK_D = (7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
          3.754408661907416e+00)
_ACK_P_BAIXO = 0.02425


def norm_ppf(p: float) -> float:
    """Inversa da normal padrão (quantil), z tal que Φ(z) = p, para 0 < p < 1.

    Algoritmo de Acklam (2003): aproximação racional na região central (|p − ½| ≤ 0,47575)
    e nas caudas, com erro relativo máximo de 1,15e-9; depois, um passo de Halley

        e = Φ(x) − p ;  u = e·√(2π)·e^(x²/2) ;  x ← x − u / (1 + x·u/2)

    leva o erro à precisão da máquina (~1e-15), conferido nos testes contra
    statistics.NormalDist().inv_cdf (algoritmo AS241 de Wichura).

    Para p > ½ usa a simetria Φ⁻¹(p) = −Φ⁻¹(1 − p): 1 − p é exato em ponto flutuante nessa
    faixa, e o refinamento roda sempre na cauda inferior, onde Φ(x) − p não sofre cancelamento.
    """
    if not 0.0 < p < 1.0:
        raise ValueError("norm_ppf exige 0 < p < 1")
    if p > 0.5:
        return -norm_ppf(1.0 - p)
    a, b, c, d = _ACK_A, _ACK_B, _ACK_C, _ACK_D
    if p < _ACK_P_BAIXO:
        q = math.sqrt(-2.0 * math.log(p))
        x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / \
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0)
    else:
        q = p - 0.5
        r = q * q
        x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / \
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0)
    # Refinamento de Halley (um passo basta; o segundo não muda o resultado em dupla precisão).
    e = norm_cdf(x) - p
    u = e * RAIZ_2PI * math.exp(0.5 * x * x)
    return x - u / (1.0 + 0.5 * x * u)


def _fracao_continuada_beta(x: float, a: float, b: float) -> float:
    """Fração continuada da beta incompleta (Press et al., Numerical Recipes, 3ª ed., §6.4),
    avaliada pelo método de Lentz modificado. Converge rápido para x < (a + 1)/(a + b + 2)."""
    qab = a + b
    qap = a + 1.0
    qam = a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < FPMIN:
        d = FPMIN
    d = 1.0 / d
    h = d
    for m in range(1, MAX_ITER):
        m2 = 2 * m
        # termo par: d_{2m} = m(b − m)x / [(a + 2m − 1)(a + 2m)]
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        h *= d * c
        # termo ímpar: d_{2m+1} = −(a + m)(a + b + m)x / [(a + 2m)(a + 2m + 1)]
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < EPS:
            return h
    raise ArithmeticError("fração continuada da beta não convergiu")


def beta_incompleta_regularizada(x: float, a: float, b: float) -> float:
    """I_x(a, b) = B(x; a, b)/B(a, b), a beta incompleta regularizada (a, b > 0; 0 ≤ x ≤ 1).

        I_x(a, b) = x^a (1 − x)^b / [a·B(a, b)] · FC(x; a, b)          se x < (a + 1)/(a + b + 2)
        I_x(a, b) = 1 − I_{1−x}(b, a)                                  caso contrário

    em que FC é a fração continuada clássica (Press et al., Numerical Recipes, 3ª ed., §6.4). É a
    base do intervalo exato de Clopper-Pearson e da CDF da t.
    """
    if a <= 0.0 or b <= 0.0:
        raise ValueError("beta incompleta exige a > 0 e b > 0")
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    ln_frente = (log_gama(a + b) - log_gama(a) - log_gama(b)
                 + a * math.log(x) + b * math.log1p(-x))
    if x < (a + 1.0) / (a + b + 2.0):
        return math.exp(ln_frente) * _fracao_continuada_beta(x, a, b) / a
    return 1.0 - math.exp(ln_frente) * _fracao_continuada_beta(1.0 - x, b, a) / b


def beta_quantil(p: float, a: float, b: float, tolerancia: float = 1e-14) -> float:
    """Quantil da distribuição Beta(a, b): x tal que I_x(a, b) = p, por bisseção em [0, 1].

    A bisseção é lenta (cerca de 50 iterações), mas sempre converge, porque I_x é monótona.
    """
    if not 0.0 <= p <= 1.0:
        raise ValueError("beta_quantil exige 0 <= p <= 1")
    lo, hi = 0.0, 1.0
    for _ in range(200):
        meio = 0.5 * (lo + hi)
        if beta_incompleta_regularizada(meio, a, b) < p:
            lo = meio
        else:
            hi = meio
        if hi - lo < tolerancia:
            break
    return 0.5 * (lo + hi)


def t_cdf(t: float, gl: float) -> float:
    """CDF da t de Student com gl graus de liberdade:
    F(t) = 1 − ½·I_{gl/(gl + t²)}(gl/2, ½) para t ≥ 0, e F(−t) = 1 − F(t)."""
    cauda = 0.5 * beta_incompleta_regularizada(gl / (gl + t * t), 0.5 * gl, 0.5)
    return 1.0 - cauda if t >= 0.0 else cauda


def t_quantil(p: float, gl: float) -> float:
    """Quantil da t de Student por bisseção (ex.: t_quantil(0,975; 29) = 2,0452)."""
    if not 0.0 < p < 1.0:
        raise ValueError("t_quantil exige 0 < p < 1")
    if p < 0.5:
        return -t_quantil(1.0 - p, gl)
    lo, hi = 0.0, 1.0
    while t_cdf(hi, gl) < p:          # amplia o intervalo até conter o quantil
        hi *= 2.0
    for _ in range(200):
        meio = 0.5 * (lo + hi)
        if t_cdf(meio, gl) < p:
            lo = meio
        else:
            hi = meio
        if hi - lo < 1e-13:
            break
    return 0.5 * (lo + hi)


def _z_bicaudal(confianca: float) -> float:
    """z tal que P(|Z| < z) = confiança (1,959964 para 95%)."""
    return norm_ppf(1.0 - (1.0 - confianca) / 2.0)


# ---------------------------------------------------------------------------------------
# Intervalos de confiança de uma proporção
# ---------------------------------------------------------------------------------------
def ic_wald(x: int, n: int, confianca: float = 0.95) -> tuple[float, float]:
    """Intervalo de Wald: p ± z·√[p(1 − p)/n], com p = x/n.

    Não é truncado em 0 e 1, de propósito: os relatórios mostram os limites negativos
    (aborto de 1 em 20 dá −4,6%) e o intervalo 0 a 0 de x = 0 para ilustrar por que o Wald
    falha com n pequeno ou taxa extrema (relatório de leite, "Toda taxa precisa de intervalo").
    """
    _checa_xn(x, n)
    p = x / n
    meia = _z_bicaudal(confianca) * math.sqrt(p * (1.0 - p) / n)
    return p - meia, p + meia


def ic_wilson(x: int, n: int, confianca: float = 0.95) -> tuple[float, float]:
    """Intervalo de Wilson (1927), o escore invertido:

        centro = [p + z²/(2n)] / (1 + z²/n)
        meia   = z·√[p(1 − p)/n + z²/(4n²)] / (1 + z²/n)
    """
    _checa_xn(x, n)
    p = x / n
    z = _z_bicaudal(confianca)
    den = 1.0 + z * z / n
    centro = (p + z * z / (2.0 * n)) / den
    meia = z * math.sqrt(p * (1.0 - p) / n + z * z / (4.0 * n * n)) / den
    return max(0.0, centro - meia), min(1.0, centro + meia)


def ic_exato(x: int, n: int, confianca: float = 0.95) -> tuple[float, float]:
    """Intervalo exato de Clopper e Pearson (1934), pelos quantis da Beta:

        limite inferior = B⁻¹(α/2; x, n − x + 1)          (0 se x = 0)
        limite superior = B⁻¹(1 − α/2; x + 1, n − x)      (1 se x = n)

    com α = 1 − confiança. Equivale a achar p com P(X ≥ x | p) = α/2 e P(X ≤ x | p) = α/2.
    Exemplo do relatório de leite: 6 prenhezes em 30 elegíveis dão 7,7% a 38,6%.
    """
    _checa_xn(x, n)
    alfa = 1.0 - confianca
    inferior = 0.0 if x == 0 else beta_quantil(alfa / 2.0, x, n - x + 1)
    superior = 1.0 if x == n else beta_quantil(1.0 - alfa / 2.0, x + 1, n - x)
    return inferior, superior


def ic_exato_por_binomial(x: int, n: int, confianca: float = 0.95) -> tuple[float, float]:
    """O mesmo intervalo de Clopper-Pearson, por bisseção sobre a soma binomial (o método dos
    scripts dos relatórios). Lento para n grande; existe só para conferir ic_exato nos testes."""
    _checa_xn(x, n)
    alfa = 1.0 - confianca

    def cdf(k: int, p: float) -> float:
        return sum(math.comb(n, j) * p ** j * (1.0 - p) ** (n - j) for j in range(0, k + 1))

    def bissecao(cond) -> float:
        lo, hi = 0.0, 1.0
        for _ in range(200):
            meio = 0.5 * (lo + hi)
            if cond(meio):
                lo = meio
            else:
                hi = meio
        return 0.5 * (lo + hi)

    inferior = 0.0 if x == 0 else bissecao(lambda p: 1.0 - cdf(x - 1, p) < alfa / 2.0)
    superior = 1.0 if x == n else bissecao(lambda p: cdf(x, p) > alfa / 2.0)
    return inferior, superior


def _checa_xn(x: int, n: int) -> None:
    if n <= 0 or x < 0 or x > n:
        raise ValueError(f"taxa inválida: x = {x}, n = {n}")


def taxa_encolhida(x: int, n: int, a: float, b: float) -> float:
    """Média a posteriori com priori Beta(a, b): (x + a)/(n + a + b).

    Proposta do relatório de leite ("Toda taxa precisa de intervalo de confiança"): com
    Beta(10, 40), centrada em 20% e com peso de 50 oportunidades, 2 prenhezes em 30 viram 15%
    em vez de 6,7%, e 12 em 30 viram 27,5% em vez de 40%.
    """
    _checa_xn(x, n)
    return (x + a) / (n + a + b)


def ic_media_t(valores, confianca: float = 0.95) -> tuple[float, float, float, float]:
    """Média, desvio-padrão amostral e intervalo t: ȳ ± t_{gl}·s/√n, gl = n − 1.

    Usado para a prolificidade (crias por parto), que é média e não proporção: 30 partos com
    12 simples, 15 duplos e 3 triplos dão 1,70 (1,46 a 1,94) (relatório de caprinos, Exemplo 7).
    Devolve (média, desvio-padrão, limite inferior, limite superior).
    """
    v = [float(x) for x in valores]
    n = len(v)
    if n < 2:
        raise ValueError("ic_media_t exige pelo menos 2 valores")
    media = sum(v) / n
    dp = math.sqrt(sum((x - media) ** 2 for x in v) / (n - 1))
    meia = t_quantil(1.0 - (1.0 - confianca) / 2.0, n - 1) * dp / math.sqrt(n)
    return media, dp, media - meia, media + meia


# ---------------------------------------------------------------------------------------
# Comparação de duas proporções
# ---------------------------------------------------------------------------------------
def tamanho_amostral_duas_proporcoes(p1: float, p2: float, alfa: float = 0.05,
                                     poder: float = 0.80,
                                     variancia: str = "agrupada") -> float:
    """Número de observações por grupo para detectar p1 ≠ p2 (teste bilateral), sem arredondar.

    variancia = "agrupada" (forma de Fleiss sem correção de continuidade; relatórios de
    caprinos, Exemplo 7, e de ovinos, Exemplo 6):

        n = [z_{α/2}·√(2·p̄·q̄) + z_β·√(p₁q₁ + p₂q₂)]² / (p₁ − p₂)²,   p̄ = (p₁ + p₂)/2

    variancia = "separada" (forma simples usada no relatório de leite):

        n = (z_{α/2} + z_β)²·(p₁q₁ + p₂q₂) / (p₁ − p₂)²

    Arredonde para cima (math.ceil) para obter o número de animais. Exemplos publicados:
    90% contra 95% de fertilidade → 434,4 → 435 ovelhas por ano (ovinos, Exemplo 6);
    20% contra 30% de prenhez → 290,1 → 291 oportunidades (leite, forma separada).
    """
    if p1 == p2:
        raise ValueError("p1 e p2 precisam ser diferentes")
    z_a = norm_ppf(1.0 - alfa / 2.0)
    z_b = norm_ppf(poder)
    var_alt = p1 * (1.0 - p1) + p2 * (1.0 - p2)
    if variancia == "agrupada":
        pm = 0.5 * (p1 + p2)
        numerador = (z_a * math.sqrt(2.0 * pm * (1.0 - pm)) + z_b * math.sqrt(var_alt)) ** 2
    elif variancia == "separada":
        numerador = (z_a + z_b) ** 2 * var_alt
    else:
        raise ValueError("variancia deve ser 'agrupada' ou 'separada'")
    return numerador / (p1 - p2) ** 2


def n_por_grupo(p1: float, p2: float, alfa: float = 0.05, poder: float = 0.80,
                variancia: str = "agrupada") -> int:
    """tamanho_amostral_duas_proporcoes arredondado para cima (animais inteiros)."""
    return math.ceil(tamanho_amostral_duas_proporcoes(p1, p2, alfa, poder, variancia) - 1e-9)


def poder_duas_proporcoes(p1: float, p2: float, n: int, alfa: float = 0.05) -> float:
    """Poder do teste bilateral de duas proporções com n por grupo (aproximação normal):

        poder = Φ[(|p₁ − p₂| − z_{α/2}·EP₀) / EP₁],
        EP₀ = √(2·p̄·q̄/n) (sob H₀) ;  EP₁ = √[(p₁q₁ + p₂q₂)/n] (sob H₁)

    Exemplo: 10% contra 20% de aborto com 30 gestações por ano tem poder de 0,19
    (relatório de caprinos, Exemplo 7).
    """
    z_a = norm_ppf(1.0 - alfa / 2.0)
    pm = 0.5 * (p1 + p2)
    ep0 = math.sqrt(2.0 * pm * (1.0 - pm) / n)
    ep1 = math.sqrt((p1 * (1.0 - p1) + p2 * (1.0 - p2)) / n)
    return norm_cdf((abs(p1 - p2) - z_a * ep0) / ep1)


# ---------------------------------------------------------------------------------------
# CUSUM
# ---------------------------------------------------------------------------------------
def cusum(valores, alvo: float, folga: float, limite: float | None = None,
          lado: str = "superior") -> tuple[list[float], int | None]:
    """CUSUM unilateral de Page (1954), na forma dos relatórios de leite e de caprinos:

        superior (detecta aumento):  S_t = máx(0; S_{t−1} + x_t − μ₀ − k)
        inferior (detecta queda):    S_t = máx(0; S_{t−1} + μ₀ − k − x_t)

    com S_0 = 0, μ₀ = alvo e k = folga. Devolve a trajetória S_1..S_T e o índice (base 0) do
    primeiro período com S_t > limite (None se não houver alarme ou limite não for dado).
    Os limites para mastite ou aborto em pequenos ruminantes não foram encontrados nas fontes e
    precisam ser calibrados com o histórico do rebanho (relatório de caprinos, Exemplo 7).
    """
    if lado not in ("superior", "inferior"):
        raise ValueError("lado deve ser 'superior' ou 'inferior'")
    s = 0.0
    trajetoria: list[float] = []
    alarme = None
    for t, x in enumerate(valores):
        if lado == "superior":
            s = max(0.0, s + x - alvo - folga)
        else:
            s = max(0.0, s + alvo - folga - x)
        trajetoria.append(s)
        if limite is not None and alarme is None and s > limite:
            alarme = t
    return trajetoria, alarme
