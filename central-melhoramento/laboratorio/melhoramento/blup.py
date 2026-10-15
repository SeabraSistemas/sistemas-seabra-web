"""BLUP: equações de modelo misto (MME) do modelo animal e variantes.

Modelos implementados, todos com variâncias FORNECIDAS pelo usuário (da literatura), nunca
estimadas com os dados do rebanho (relatório de corte, "Estimar parâmetros dentro da fazenda é
quase sempre ruído"):

* modelo_animal: y = Xb + Za + Wp + e, com grupos de contemporâneos e covariáveis fixos,
  efeito animal aleatório com A⁻¹ e, opcionalmente, ambiente permanente p (repetibilidade);
* modelo_direto_materno: y = Xb + Z₁a + Z₂m + Wp + e (Willham 1972), com G₀ ⊗ A;
* modelo_multicaracteristica: duas ou mais características com G₀ ⊗ A e R₀ por animal,
  tolerando característica ausente (animal vendido antes da pesagem);
* modelo_touro: y = GC + s + e, usado para a confiabilidade exata de reprodutores com poucas
  filhas e para o ajuste de variância heterogênea.

E as medidas derivadas: PEV, confiabilidade com (1 + F), acurácia, acurácia BIF, DEP/PTA = EBV/2,
erro-padrão da DEP e Possible Change (BIF).

Fontes: relatório de corte, "Passo 2: montar e resolver as MME", "Passo 3: da PEV à acurácia e à
DEP", "Pesos até a desmama: modelo direto-materno" e "Pesos depois da desmama: multicaracterística";
relatório de caprinos, Exemplo 3; relatório de ovinos, Exemplos 2 e 4; relatório de leite, ajuste
de variância heterogênea (HVA). Henderson (1975, Biometrics 31:423); Phocas, Donoghue e Graser
(2005, GSE 37:361, eq. 1); BIF Guidelines, 9ª ed., p. 73.

As matrizes são densas e invertidas por inteiro: o objetivo é ranquear dentro de um rebanho de
até alguns milhares de animais e mostrar as contas. Avaliações nacionais usam métodos iterativos
(Gauss-Seidel, PCG) e PEV aproximada.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .confiabilidade import bif_de_rel, k_touro, rel_de_pev
from .parentesco import conhecido, inversa_A, matriz_A


# ---------------------------------------------------------------------------------------
# Montagem das matrizes de incidência
# ---------------------------------------------------------------------------------------
def incidencia(rotulos, niveis: list | None = None) -> tuple[np.ndarray, list]:
    """Matriz de incidência: uma linha por registro, uma coluna por nível, 1 onde o registro cai.

    Se niveis não for dado, os níveis aparecem na ordem do primeiro registro de cada um.
    """
    rotulos = list(rotulos)
    if niveis is None:
        niveis = list(dict.fromkeys(rotulos))
    pos = {nivel: j for j, nivel in enumerate(niveis)}
    M = np.zeros((len(rotulos), len(niveis)))
    for i, r in enumerate(rotulos):
        M[i, pos[r]] = 1.0
    return M, list(niveis)


def montar_X(grupos, outros_fatores: dict | None = None,
             covariaveis: dict | None = None) -> tuple[np.ndarray, list[str]]:
    """Matriz X dos efeitos fixos e o nome de cada coluna.

    * grupos: grupo de contemporâneos de cada registro (todas as colunas; faz o papel da média);
    * outros_fatores: {nome: rótulos por registro}; o primeiro nível de cada fator é retirado
      (restrição "primeiro nível = 0") para que X tenha posto completo;
    * covariaveis: {nome: valores por registro}, entram como colunas de regressão (ex.: idade ao
      parto, dias do parto ao 1º controle). Centralize-as se quiser ler o GC na média da covariável.
    """
    X, niveis = incidencia(grupos)
    nomes = [f"GC={g}" for g in niveis]
    for nome, rotulos in (outros_fatores or {}).items():
        M, nv = incidencia(rotulos)
        X = np.hstack([X, M[:, 1:]])
        nomes += [f"{nome}={v}" for v in nv[1:]]
    for nome, valores in (covariaveis or {}).items():
        X = np.hstack([X, np.asarray(valores, dtype=float).reshape(-1, 1)])
        nomes.append(nome)
    return X, nomes


def _pedigree_com_registros(ped: dict, *listas) -> dict:
    """Copia o pedigree e acrescenta como fundadores os animais com registro que não estão nele."""
    completo = dict(ped)
    for lista in listas:
        for a in lista:
            if conhecido(a) and a not in completo:
                completo[a] = (None, None)
    return completo


def resolver_mme(X: np.ndarray, Z: np.ndarray, y: np.ndarray, Ainv: np.ndarray,
                 lambda_a: float, W: np.ndarray | None = None,
                 lambda_pe: float | None = None) -> tuple[np.ndarray, np.ndarray]:
    """Monta e resolve as MME de Henderson do modelo animal (com ambiente permanente opcional):

        [ X'X   X'Z             X'W            ] [b̂]   [X'y]
        [ Z'X   Z'Z + λa·A⁻¹    Z'W            ] [â] = [Z'y]       λa = σ²e/σ²a
        [ W'X   W'Z             W'W + λpe·I    ] [p̂]   [W'y]       λpe = σ²e/σ²pe

    Devolve (solução, C), com C = inversa da matriz de coeficientes; a PEV de cada efeito
    aleatório é c^ii·σ²e. A ordem da solução é [b, a, p].
    """
    blocos = [X, Z] if W is None else [X, Z, W]
    T = np.hstack(blocos)
    LHS = T.T @ T
    nx, nz = X.shape[1], Z.shape[1]
    LHS[nx:nx + nz, nx:nx + nz] += lambda_a * Ainv
    if W is not None:
        nw = W.shape[1]
        LHS[nx + nz:, nx + nz:] += lambda_pe * np.eye(nw)
    RHS = T.T @ np.asarray(y, dtype=float)
    solucao = np.linalg.solve(LHS, RHS)
    C = np.linalg.inv(LHS)
    return solucao, C


def blup_gls(X: np.ndarray, Z: np.ndarray, y: np.ndarray, A: np.ndarray,
             sigma2_a: float, sigma2_e: float) -> tuple[np.ndarray, np.ndarray]:
    """Forma clássica do BLUP por mínimos quadrados generalizados, para conferir as MME:

        V = σ²a·ZAZ' + σ²e·I ;  b̂ = (X'V⁻¹X)⁻¹X'V⁻¹y ;  â = σ²a·A·Z'V⁻¹(y − Xb̂)

    No exemplo do relatório de corte, a diferença para as MME é de 2 × 10⁻¹⁴.
    """
    y = np.asarray(y, dtype=float)
    V = sigma2_a * Z @ A @ Z.T + sigma2_e * np.eye(len(y))
    Vi = np.linalg.inv(V)
    b = np.linalg.solve(X.T @ Vi @ X, X.T @ Vi @ y)
    a = sigma2_a * A @ Z.T @ Vi @ (y - X @ b)
    return b, a


# ---------------------------------------------------------------------------------------
# Medidas derivadas
# ---------------------------------------------------------------------------------------
def dep_de_ebv(ebv):
    """DEP (corte) ou PTA (leite, caprinos) = EBV/2: metade do valor genético vai para cada filho.

    Aceita número ou array numpy."""
    return ebv / 2.0


def possible_change(acuracia_bif: float, sigma_a: float, t: float = 1.0) -> float:
    """Possible Change do BIF (Guidelines, 9ª ed., p. 73):  PC = t·(1 − a_BIF)·σA/2.

    σA = desvio-padrão genético aditivo da característica; t = 1 → DEP ± PC contém o valor
    verdadeiro em 68% dos casos; t = 2 → 95%. Supõe F = 0. Exemplo do relatório de corte: DEP de
    P450 com σA = 16,48 kg e a_BIF = 0,70 → PC68 = 2,47 kg e PC95 = 4,94 kg.
    """
    return t * (1.0 - acuracia_bif) * sigma_a / 2.0


def possible_change_de_r(r: float, sigma_a: float, t: float = 1.0) -> float:
    """Amplitude quando a coluna "acurácia" é r (correlação), e não a_BIF:  t·(σA/2)·√(1 − r²).

    É a conta que reproduz a tabela de possível mudança da ANCP (relatório de corte): com
    σA/2 = 8,24 kg, r = 0,70 → 5,88 kg (a fórmula BIF daria 2,47 kg). Declare a escala na tela.
    """
    return t * (sigma_a / 2.0) * (1.0 - r * r) ** 0.5


# ---------------------------------------------------------------------------------------
# Modelo animal
# ---------------------------------------------------------------------------------------
@dataclass
class ResultadoModeloAnimal:
    """Soluções do modelo animal. Os arrays seguem a ordem de `ids` (todos os animais do pedigree)."""

    ids: list
    efeitos_fixos: dict            # nome da coluna de X → solução
    ebv: np.ndarray                # valor genético predito (EBV)
    pev: np.ndarray                # variância do erro de predição
    F: np.ndarray                  # endogamia de cada animal
    confiabilidade: np.ndarray     # REL = 1 − PEV/[(1 + F)σ²a]
    acuracia: np.ndarray           # r = √REL
    acuracia_bif: np.ndarray       # 1 − √(1 − REL)
    dep: np.ndarray                # DEP/PTA = EBV/2
    sep_dep: np.ndarray            # erro-padrão da DEP = √PEV/2
    ambiente_permanente: dict | None = None   # animal → p̂ (só com sigma2_pe)

    def animal(self, identificador) -> dict:
        """Resultados de um animal como dicionário (útil para relatórios e para JSON)."""
        i = self.ids.index(identificador)
        return {"animal": identificador, "ebv": float(self.ebv[i]), "dep": float(self.dep[i]),
                "pev": float(self.pev[i]), "F": float(self.F[i]),
                "confiabilidade": float(self.confiabilidade[i]), "acuracia": float(self.acuracia[i]),
                "acuracia_bif": float(self.acuracia_bif[i]), "sep_dep": float(self.sep_dep[i])}


def modelo_animal(ped: dict, animais: list, y, grupos: list, sigma2_a: float, sigma2_e: float,
                  sigma2_pe: float | None = None, covariaveis: dict | None = None,
                  outros_fatores: dict | None = None) -> ResultadoModeloAnimal:
    """Modelo animal unicaracterística (relatório de corte, Passos 2 e 3):

        y = Xb + Za + Wp + e ;  a ~ N(0, A·σ²a) ;  p ~ N(0, I·σ²pe) ;  e ~ N(0, I·σ²e)

    ped: {animal: (pai, mãe)}; animais, y e grupos: um elemento por registro (o mesmo animal pode
    repetir se houver ambiente permanente). Animais com registro fora do pedigree entram como
    fundadores. Com sigma2_pe = None, o modelo não tem p e supõe um registro por animal.

    Exemplo do relatório de corte: 8 animais, P205 de 5 bezerros em 2 GCs, σ²a = 100 e σ²e = 300
    (λ = 3) → GC 2022 = 203,71 kg; GC 2024 = 207,56 kg; EBV do animal 6 = +3,59 kg (r = 0,304).
    """
    ped_c = _pedigree_com_registros(ped, animais)
    Ainv, ids = inversa_A(ped_c)
    A, _ = matriz_A(ped_c)
    F = np.diag(A) - 1.0
    y = np.asarray(y, dtype=float)
    X, nomes_fixos = montar_X(grupos, outros_fatores, covariaveis)
    Z, _ = incidencia(animais, ids)
    W = None
    lambda_pe = None
    niveis_pe: list = []
    if sigma2_pe is not None:
        W, niveis_pe = incidencia(animais)
        lambda_pe = sigma2_e / sigma2_pe
    sol, C = resolver_mme(X, Z, y, Ainv, sigma2_e / sigma2_a, W, lambda_pe)
    nx, n = X.shape[1], len(ids)
    ebv = sol[nx:nx + n]
    pev = np.diag(C)[nx:nx + n] * sigma2_e
    rel = np.clip(rel_de_pev(pev, sigma2_a, F), 0.0, 1.0)   # corta o −0,000 de arredondamento
    pe = None
    if W is not None:
        pe = {a: float(v) for a, v in zip(niveis_pe, sol[nx + n:])}
    return ResultadoModeloAnimal(
        ids=ids, efeitos_fixos=dict(zip(nomes_fixos, map(float, sol[:nx]))), ebv=ebv, pev=pev, F=F,
        confiabilidade=rel, acuracia=np.sqrt(rel), acuracia_bif=bif_de_rel(rel), dep=ebv / 2.0,
        sep_dep=np.sqrt(pev) / 2.0, ambiente_permanente=pe)


# ---------------------------------------------------------------------------------------
# Modelo direto-materno
# ---------------------------------------------------------------------------------------
@dataclass
class ResultadoDiretoMaterno:
    """Soluções do modelo direto-materno, na ordem de `ids`."""

    ids: list
    efeitos_fixos: dict
    ebv_direto: np.ndarray
    ebv_materno: np.ndarray
    dep_direta: np.ndarray
    dep_materna: np.ndarray
    total_materno: np.ndarray          # TMD = DEP materna + ½·DEP direta (BIF)
    ambiente_permanente: dict          # mãe → p̂
    rel_direto: np.ndarray
    rel_materno: np.ndarray
    variancia_fenotipica: float        # σ²P = σ²a + σ²m + σam + σ²pe + σ²e
    h2_direta: float
    h2_materna: float
    correlacao_am: float


def modelo_direto_materno(ped: dict, animais: list, maes: list, y, grupos: list,
                          G0, sigma2_pe: float, sigma2_e: float,
                          covariaveis: dict | None = None) -> ResultadoDiretoMaterno:
    """Modelo direto-materno com ambiente permanente materno (Willham 1972; Phocas et al. 2005):

        y = Xb + Z₁a + Z₂m + Wp + e
        var[a; m] = G₀ ⊗ A,  G₀ = [[σ²a, σam], [σam, σ²m]] ;  var(p) = I·σ²pe ;  var(e) = I·σ²e
        MME: bloco (a, m) recebe G₀⁻¹ ⊗ A⁻¹ ; bloco p recebe I/σ²pe ; resíduo entra como 1/σ²e

    Z₁ liga o registro ao bezerro; Z₂ e W ligam o registro à MÃE (linha nula se a mãe é
    desconhecida). σ²P = σ²a + σ²m + σam + σ²pe + σ²e para bezerro não endogâmico: a covariância
    entre o direto do bezerro e o materno da mãe é ½σam e entra duas vezes (relatório de corte).

    Exemplo do relatório de corte: G₀ = [[100, −15], [−15, 40]], σ²pe = 30, σ²e = 230 →
    σ²P = 385; animal 6 com DEP direta 1,75, materna 0,28 e TMD 1,16.
    """
    ped_c = _pedigree_com_registros(ped, animais, maes)
    Ainv, ids = inversa_A(ped_c)
    A, _ = matriz_A(ped_c)
    F = np.diag(A) - 1.0
    G0 = np.asarray(G0, dtype=float)
    y = np.asarray(y, dtype=float)
    n = len(ids)
    pos = {a: i for i, a in enumerate(ids)}
    X, nomes_fixos = montar_X(grupos, covariaveis=covariaveis)
    Z1, _ = incidencia(animais, ids)
    Z2 = np.zeros((len(y), n))
    niveis_pe = [a for a in ids if any(conhecido(m) and m == a for m in maes)]
    pos_pe = {m: j for j, m in enumerate(niveis_pe)}
    W = np.zeros((len(y), len(niveis_pe)))
    for i, m in enumerate(maes):
        if conhecido(m):
            Z2[i, pos[m]] = 1.0
            W[i, pos_pe[m]] = 1.0
    T = np.hstack([X, Z1, Z2, W])
    L = T.T @ T / sigma2_e
    nx = X.shape[1]
    L[nx:nx + 2 * n, nx:nx + 2 * n] += np.kron(np.linalg.inv(G0), Ainv)
    L[nx + 2 * n:, nx + 2 * n:] += np.eye(len(niveis_pe)) / sigma2_pe
    sol = np.linalg.solve(L, T.T @ y / sigma2_e)
    C = np.linalg.inv(L)
    ad, am = sol[nx:nx + n], sol[nx + n:nx + 2 * n]
    pev_d, pev_m = np.diag(C)[nx:nx + n], np.diag(C)[nx + n:nx + 2 * n]
    s2a, s2m, sam = G0[0, 0], G0[1, 1], G0[0, 1]
    s2P = s2a + s2m + sam + sigma2_pe + sigma2_e
    return ResultadoDiretoMaterno(
        ids=ids, efeitos_fixos=dict(zip(nomes_fixos, map(float, sol[:nx]))),
        ebv_direto=ad, ebv_materno=am, dep_direta=ad / 2.0, dep_materna=am / 2.0,
        total_materno=am / 2.0 + ad / 4.0,
        ambiente_permanente={m: float(v) for m, v in zip(niveis_pe, sol[nx + 2 * n:])},
        rel_direto=np.clip(rel_de_pev(pev_d, s2a, F), 0.0, 1.0),
        rel_materno=np.clip(rel_de_pev(pev_m, s2m, F), 0.0, 1.0),
        variancia_fenotipica=float(s2P), h2_direta=float(s2a / s2P), h2_materna=float(s2m / s2P),
        correlacao_am=float(sam / np.sqrt(s2a * s2m)))


def repetibilidade_direto_materno(G0, sigma2_pe: float, sigma2_e: float, a_irmaos: float) -> float:
    """Repetibilidade implícita entre dois filhos da mesma vaca no modelo direto-materno:

        r = (a_ij·σ²a + σ²m + σam + σ²pe) / σ²P

    a_ij = 0,25 para meios-irmãos maternos (pais diferentes) e 0,5 para irmãos completos.
    Exemplo do relatório de corte: 0,208 e 0,273 (retomados na MPPA como 0,21 a 0,27).
    """
    G0 = np.asarray(G0, dtype=float)
    s2P = G0[0, 0] + G0[1, 1] + G0[0, 1] + sigma2_pe + sigma2_e
    return float((a_irmaos * G0[0, 0] + G0[1, 1] + G0[0, 1] + sigma2_pe) / s2P)


# ---------------------------------------------------------------------------------------
# Modelo multicaracterística
# ---------------------------------------------------------------------------------------
@dataclass
class ResultadoMulticaracteristica:
    """Soluções multicaracterística: ebv, pev e confiabilidade são (n_animais × n_características)."""

    ids: list
    caracteristicas: list
    efeitos_fixos: dict          # (característica, grupo) → solução
    ebv: np.ndarray
    pev: np.ndarray
    confiabilidade: np.ndarray
    acuracia: np.ndarray


def modelo_multicaracteristica(ped: dict, animais: list, Y, grupos: list, G0, R0,
                               caracteristicas: list | None = None) -> ResultadoMulticaracteristica:
    """Modelo animal multicaracterística com característica ausente (relatório de corte,
    "Pesos depois da desmama: multicaracterística contra o viés de seleção"):

        [y₁; y₂] = [X₁ 0; 0 X₂][b₁; b₂] + [Z₁ 0; 0 Z₂][a₁; a₂] + [e₁; e₂]
        var[a₁; a₂] = G₀ ⊗ A ;  var(e) = R, com bloco R₀ por animal (só as características medidas)

        MME: [ X'R⁻¹X   X'R⁻¹Z             ] [b̂]   [X'R⁻¹y]
             [ Z'R⁻¹X   Z'R⁻¹Z + G₀⁻¹ ⊗ A⁻¹ ] [â] = [Z'R⁻¹y]

    Y: matriz (registros × características) com NaN onde a característica não foi medida; um
    registro por animal. Os grupos de contemporâneos são específicos de cada característica.

    Exemplo do relatório de corte (PD + PS450, animal 8 vendido na desmama): EBV de PS do animal
    8 = −0,66 na análise bicaracterística, contra +1,57 só com PS; todas as acurácias sobem.
    """
    ped_c = _pedigree_com_registros(ped, animais)
    Ainv, ids = inversa_A(ped_c)
    A, _ = matriz_A(ped_c)
    F = np.diag(A) - 1.0
    Y = np.asarray(Y, dtype=float)
    G0, R0 = np.asarray(G0, dtype=float), np.asarray(R0, dtype=float)
    n_reg, t = Y.shape
    if len(set(animais)) != len(animais):
        raise ValueError("modelo_multicaracteristica aceita um registro por animal")
    caracteristicas = caracteristicas or [f"c{k + 1}" for k in range(t)]
    n = len(ids)
    pos = {a: i for i, a in enumerate(ids)}
    # níveis fixos: (característica, grupo) com pelo menos uma observação
    niveis = []
    for k in range(t):
        for r in range(n_reg):
            if not np.isnan(Y[r, k]) and (k, grupos[r]) not in niveis:
                niveis.append((k, grupos[r]))
    pos_fixo = {nv: j for j, nv in enumerate(niveis)}
    nf = len(niveis)
    XtRX = np.zeros((nf, nf))
    XtRZ = np.zeros((nf, t * n))
    ZtRZ = np.zeros((t * n, t * n))
    XtRy = np.zeros(nf)
    ZtRy = np.zeros(t * n)
    for r in range(n_reg):
        obs = [k for k in range(t) if not np.isnan(Y[r, k])]
        if not obs:
            continue
        Rinv = np.linalg.inv(R0[np.ix_(obs, obs)])
        cols_x = [pos_fixo[(k, grupos[r])] for k in obs]
        cols_z = [k * n + pos[animais[r]] for k in obs]
        yr = Y[r, obs]
        XtRX[np.ix_(cols_x, cols_x)] += Rinv
        XtRZ[np.ix_(cols_x, cols_z)] += Rinv
        ZtRZ[np.ix_(cols_z, cols_z)] += Rinv
        XtRy[cols_x] += Rinv @ yr
        ZtRy[cols_z] += Rinv @ yr
    LHS = np.block([[XtRX, XtRZ], [XtRZ.T, ZtRZ + np.kron(np.linalg.inv(G0), Ainv)]])
    RHS = np.concatenate([XtRy, ZtRy])
    sol = np.linalg.solve(LHS, RHS)
    C = np.linalg.inv(LHS)
    ebv = sol[nf:].reshape(t, n).T
    pev = np.diag(C)[nf:].reshape(t, n).T
    rel = np.clip(1.0 - pev / ((1.0 + F)[:, None] * np.diag(G0)[None, :]), 0.0, 1.0)
    fixos = {(caracteristicas[k], g): float(sol[j]) for j, (k, g) in enumerate(niveis)}
    return ResultadoMulticaracteristica(ids=ids, caracteristicas=caracteristicas,
                                        efeitos_fixos=fixos, ebv=ebv, pev=pev,
                                        confiabilidade=rel, acuracia=np.sqrt(rel))


# ---------------------------------------------------------------------------------------
# Modelo de touro: confiabilidade exata e variância heterogênea
# ---------------------------------------------------------------------------------------
@dataclass
class ResultadoModeloTouro:
    touros: list
    ebv: dict              # touro → EBV = 2·ŝ (na escala dos dados, já padronizados se houver fator)
    confiabilidade: dict   # touro → REL = 1 − PEV/σ²s
    efeitos_grupo: dict    # grupo → solução do GC


def modelo_touro(registros: list, h2: float, prova_externa: dict | None = None,
                 fator_escala: dict | None = None) -> ResultadoModeloTouro:
    """Modelo de touro com grupo de contemporâneos fixo e touros não aparentados:

        y_ij = GC_i + s_j + e_ij ;  s ~ N(0, I·σ²s) ;  σ²s = h²σ²P/4 ;  σ²e = (1 − h²/4)σ²P
        λ = σ²e/σ²s = (4 − h²)/h²  (o k do modelo de touro) ;  EBV do touro = 2·ŝ

    registros: lista de (grupo, touro, valor), um por filha.
    prova_externa: {touro: (ebv_externo, rel_externa)}; a prova de outra avaliação entra como
      DE = λ·REL/(1 − REL) filhas-equivalentes na diagonal e DE·ebv/2 no lado direito.
    fator_escala: {grupo: σ₀/σ_k}; multiplica os valores do grupo, o que equivale ao modelo
      multiplicativo y = GC + (σ_k/σ₀)·s + e com variâncias de base (relatório de ovinos, Exemplo 2).

    REL = 1 − PEV/σ²s = 1 − λ·c^jj, não depende dos valores, só do desenho.
    """
    prova_externa = prova_externa or {}
    fator_escala = fator_escala or {}
    grupos = list(dict.fromkeys(g for g, _, _ in registros))
    touros = list(dict.fromkeys([t for _, t, _ in registros] + list(prova_externa)))
    ng, nt = len(grupos), len(touros)
    pg = {g: i for i, g in enumerate(grupos)}
    pt = {t: ng + j for j, t in enumerate(touros)}
    lam = k_touro(h2)
    C = np.zeros((ng + nt, ng + nt))
    rhs = np.zeros(ng + nt)
    for g, t, valor in registros:
        v = float(valor) * fator_escala.get(g, 1.0)
        i, j = pg[g], pt[t]
        C[i, i] += 1.0
        C[j, j] += 1.0
        C[i, j] += 1.0
        C[j, i] += 1.0
        rhs[i] += v
        rhs[j] += v
    for t in touros:
        j = pt[t]
        C[j, j] += lam
        if t in prova_externa:
            ebv_ext, rel_ext = prova_externa[t]
            de = lam * rel_ext / (1.0 - rel_ext)
            C[j, j] += de
            rhs[j] += de * ebv_ext / 2.0
    sol = np.linalg.solve(C, rhs)
    Ci = np.linalg.inv(C)
    return ResultadoModeloTouro(
        touros=touros,
        ebv={t: float(2.0 * sol[pt[t]]) for t in touros},
        confiabilidade={t: float(max(0.0, 1.0 - lam * Ci[pt[t], pt[t]])) for t in touros},
        efeitos_grupo={g: float(sol[pg[g]]) for g in grupos})


def rel_exata_modelo_touro(rebanhos: list, h2: float, rel_externa: dict | None = None) -> dict:
    """Confiabilidade exata de cada reprodutor pela PEV do modelo de touro, a partir só do desenho.

    rebanhos: lista de dicionários {touro: número de filhas}, um por grupo de contemporâneas;
    rel_externa: {touro: REL vinda de outros rebanhos} (bode de IA, carneiro importado).

    Mostra que filhas sem contemporâneas de outro pai não avaliam o pai, e que as mesmas filhas
    valem mais espalhadas. Relatório de caprinos, Exemplo 3 (h² 0,20): 10 filhas ao lado de 10 de
    um bode local → 0,172; ao lado de 10 de um bode de IA com REL 0,90 → 0,204; 2 filhas em cada um
    de 15 rebanhos com 10 de IA → 0,538. Relatório de ovinos, Exemplo 4 (h² 0,30).
    """
    registros = [(g, t, 0.0) for g, reb in enumerate(rebanhos) for t, n in reb.items()
                 for _ in range(int(n))]
    externa = {t: (0.0, r) for t, r in (rel_externa or {}).items()}
    return modelo_touro(registros, h2, prova_externa=externa).confiabilidade


def padronizar_variancia(desvio: float, sigma_rebanho: float, sigma_base: float) -> float:
    """Variância heterogênea com razões constantes (modelo francês de ovinos):  y* = y·σ₀/σ_k.

    Equivale a y = GC + (σ_k/σ₀)·(Za)… + e com variâncias de base, e supõe a mesma h² em todos os
    rebanhos. Exemplo do relatório de ovinos (Exemplo 2): desvio de +60 L num rebanho com σ_P de
    95 L vale +40,7 L na base de 64,5 L; +35 L num rebanho de 40 L valem +56,4 L.
    """
    return desvio * sigma_base / sigma_rebanho


def ajuste_hva(desvio: float, dp_rebanho: float, dp_base: float,
               h2_minima: float = 0.2, h2_maxima: float = 0.3) -> dict:
    """Ajuste de variância heterogênea do USDA (Wiggans e VanRaden 1991, J. Dairy Sci. 74:4350):

        h²_grupo = 0,05 + 0,2·(DP regredido/DP base), limitado a [0,2; 0,3]
        σg = √h²·DP ;  desvio ajustado = desvio·σg,base/σg,rebanho
        peso de erro do rebanho = 0,45/[(0,25/h²_grupo) − 0,55]

    dp_rebanho deve ser o DP já regredido para o da região (passo 1 do método, não feito aqui).
    Exemplo do relatório de leite: +900 kg com DP de 1.800 kg (base 1.500 kg) → h² 0,29 e 0,25,
    σg 969 e 750 kg, desvio ajustado +696,4 kg e peso de erro 1,44.
    """
    def h2_do(dp: float) -> float:
        return min(h2_maxima, max(h2_minima, 0.05 + 0.2 * dp / dp_base))

    h2_reb, h2_base = h2_do(dp_rebanho), h2_do(dp_base)
    sg_reb, sg_base = h2_reb ** 0.5 * dp_rebanho, h2_base ** 0.5 * dp_base
    return {"h2_rebanho": h2_reb, "h2_base": h2_base, "dp_genetico_rebanho": sg_reb,
            "dp_genetico_base": sg_base, "fator": sg_base / sg_reb,
            "desvio_ajustado": desvio * sg_base / sg_reb,
            "peso_erro": 0.45 / ((0.25 / h2_reb) - 0.55)}
