"""Parentesco, endogamia e tamanho efetivo.

Conteúdo:
* matriz de parentesco aditivo A pelo método tabular;
* coeficientes de endogamia F;
* A⁻¹ montada direto do pedigree pelas regras de Henderson (1976), com a correção de
  Quaas (1976) para pais endogâmicos;
* A* com grupos de pais desconhecidos (Quaas 1988), para o modelo animal com grupos;
* parentesco entre dois animais e F de um acasalamento planejado (F = ½·a_pai,mãe);
* escolha, para cada fêmea, do reprodutor de menor F (ou o preferido abaixo de um limite);
* tamanho efetivo de Wright, ΔF = 1/(2Ne), F acumulado após t gerações e número efetivo
  de pais com uso desigual.

Formato do pedigree: dicionário {animal: (pai, mãe)}. Os identificadores podem ser números
ou textos. Pai ou mãe desconhecidos são indicados por qualquer valor de DESCONHECIDO
(None, 0, "0", "", "-" ou "NA"). Pais citados que não têm linha própria entram como
fundadores. A ordem de entrada não precisa ter os pais antes dos filhos: a função
ordenar_pedigree reordena (e mantém a ordem original quando ela já é válida).

Fontes: relatório de corte, "Passo 1: do pedigree a A, F e A⁻¹" e "Endogamia e tamanho
efetivo"; relatório de leite, "Endogamia: decidir por par, não por touro"; relatório de
caprinos, Exemplo 8; relatório de ovinos, Exemplo 7. Henderson (1976, Biometrics 32:69);
Quaas (1976, Biometrics 32:949); Quaas (1988, J. Dairy Sci. 71:1338); Nilforooshan, Garrick e
Harris (2021, Front. Genet. 12:655638); Wright (1931, Genetics 16:97); FAO (1998, Secondary
Guidelines, §4.1); Mrode, Pocrnić, Gorjanc e Thompson (2023, 4ª ed., CABI), Exemplo 4.4.
A, A⁻¹, F e A* conferem com os scripts oficiais do livro (tests/test_mrode.py).
"""

from __future__ import annotations

import numpy as np

DESCONHECIDO = (None, 0, "0", "", "-", "NA")


def conhecido(animal) -> bool:
    """True se o identificador aponta para um animal (e não para pai/mãe desconhecido)."""
    return not any(animal is m or animal == m for m in DESCONHECIDO)


def ordenar_pedigree(ped: dict) -> tuple[list, dict]:
    """Ordena o pedigree com os pais antes dos filhos (ordenação topológica estável).

    Devolve (ids, pedigree_completo): ids é a lista ordenada; pedigree_completo inclui como
    fundadores os pais citados sem linha própria. Levanta ValueError se houver ciclo
    (um animal ancestral de si mesmo). A ordem original é mantida quando já é válida.
    """
    completo = {animal: tuple(pais) for animal, pais in ped.items()}
    for pais in list(completo.values()):
        for p in pais:
            if conhecido(p) and p not in completo:
                completo[p] = (None, None)

    ordem: list = []
    feito: set = set()
    em_visita: set = set()
    for raiz in completo:
        if raiz in feito:
            continue
        pilha = [(raiz, False)]
        while pilha:
            animal, pais_prontos = pilha.pop()
            if animal in feito:
                continue
            if pais_prontos:
                em_visita.discard(animal)
                feito.add(animal)
                ordem.append(animal)
                continue
            if animal in em_visita:
                raise ValueError(f"pedigree circular: {animal!r} é ancestral de si mesmo")
            em_visita.add(animal)
            pilha.append((animal, True))
            for p in reversed(completo[animal]):        # o pai é visitado antes da mãe
                if conhecido(p) and p not in feito:
                    pilha.append((p, False))
    return ordem, completo


def _indices_dos_pais(ids: list, completo: dict) -> list[tuple[int, int]]:
    """Para cada animal (na ordem de ids), a posição do pai e da mãe (−1 se desconhecido)."""
    pos = {a: i for i, a in enumerate(ids)}
    saida = []
    for a in ids:
        pai, mae = completo[a]
        saida.append((pos[pai] if conhecido(pai) else -1, pos[mae] if conhecido(mae) else -1))
    return saida


def matriz_A(ped: dict) -> tuple[np.ndarray, list]:
    """Matriz de parentesco aditivo A pelo método tabular (relatório de corte, Passo 1; Nilforooshan,
    Garrick e Harris 2021).

    Com os pais antes dos filhos (s = pai, d = mãe do animal i):

        A_ij = ½·(A_j,s + A_j,d)          para j < i  (termo omitido se o pai é desconhecido)
        A_ii = 1 + F_i,   F_i = ½·A_s,d   (F_i = 0 se um dos pais é desconhecido)

    Devolve (A, ids), com as linhas e colunas na ordem de ids. Custo O(n²) em memória, adequado
    a rebanhos de até alguns milhares de animais; avaliações grandes usam Meuwissen e Luo (1992).
    Exemplo: pedigree de 8 animais do relatório de corte (Passo 1), F₆ = ½·A₄₅ = 0,125.
    """
    ids, completo = ordenar_pedigree(ped)
    pais = _indices_dos_pais(ids, completo)
    n = len(ids)
    A = np.zeros((n, n))
    for i, (s, d) in enumerate(pais):
        if i > 0:
            linha = np.zeros(i)
            if s >= 0:
                linha += 0.5 * A[s, :i]
            if d >= 0:
                linha += 0.5 * A[d, :i]
            A[i, :i] = linha
            A[:i, i] = linha
        A[i, i] = 1.0 + (0.5 * A[s, d] if s >= 0 and d >= 0 else 0.0)
    return A, ids


def coeficientes_F(ped: dict) -> dict:
    """Coeficiente de endogamia de Wright de cada animal, F_i = A_ii − 1."""
    A, ids = matriz_A(ped)
    return {a: float(A[i, i] - 1.0) for i, a in enumerate(ids)}


def inversa_A(ped: dict, F: dict | None = None,
              considerar_endogamia: bool = True) -> tuple[np.ndarray, list]:
    """A⁻¹ montada direto do pedigree (regras de Henderson 1976 com a correção de Quaas 1976).

    Cada animal i soma à matriz α_i·t_i·t_i', em que t_i vale 1 na posição de i e −½ na
    posição de cada pai conhecido, e α_i = 1/d_i com

        ambos os pais conhecidos:  d_i = ½ − ¼·(F_pai + F_mãe)
        um pai conhecido:          d_i = ¾ − ¼·F_pai
        nenhum pai conhecido:      d_i = 1

    (relatório de corte, Passo 1; Nilforooshan et al. 2021: D_jj = (2 − F_s − F_d)/4 e (3 − F_s)/4).

    F: dicionário opcional {animal: F}; se omitido, é calculado por matriz_A. Com
    considerar_endogamia=False os F dos pais são tratados como zero (regra de Henderson pura),
    o que só é exato quando nenhum pai é endogâmico; no pedigree estendido do relatório de corte
    o erro chega a 0,133. Devolve (A⁻¹, ids).
    """
    ids, completo = ordenar_pedigree(ped)
    pais = _indices_dos_pais(ids, completo)
    if not considerar_endogamia:
        Fv = np.zeros(len(ids))
    elif F is None:
        A, _ = matriz_A(ped)
        Fv = np.diag(A) - 1.0
    else:
        Fv = np.array([float(F.get(a, 0.0)) for a in ids])
    n = len(ids)
    Ainv = np.zeros((n, n))
    for i, (s, d) in enumerate(pais):
        conhecidos = [p for p in (s, d) if p >= 0]
        if len(conhecidos) == 2:
            di = 0.5 - 0.25 * (Fv[s] + Fv[d])
        elif len(conhecidos) == 1:
            di = 0.75 - 0.25 * Fv[conhecidos[0]]
        else:
            di = 1.0
        alfa = 1.0 / di
        posicoes = [i] + conhecidos
        coef = [1.0] + [-0.5] * len(conhecidos)
        for p, cp in zip(posicoes, coef):
            for q, cq in zip(posicoes, coef):
                Ainv[p, q] += alfa * cp * cq
    return Ainv, ids


def pedigree_sem_grupos(ped: dict, grupos) -> dict:
    """Cópia do pedigree com cada rótulo de grupo de pais desconhecidos trocado por None."""
    gs = set(grupos)
    return {a: tuple(None if p in gs else p for p in pais) for a, pais in ped.items() if a not in gs}


def inversa_A_grupos(ped: dict, grupos: list) -> tuple[np.ndarray, list, list]:
    """A⁻¹ com grupos de pais desconhecidos: a matriz A* de Quaas (1988).

    No pedigree, cada pai ou mãe desconhecido é trocado pelo rótulo do seu grupo (origem, raça,
    época de nascimento dos pais desconhecidos); `grupos` lista esses rótulos. Cada animal soma
    α_i·t_i·t_i', com t_i = 1 na posição de i e −½ na de cada pai OU grupo, e o mesmo α_i de
    inversa_A: o grupo conta como pai desconhecido. O resultado é

        A* = [  A⁻¹     −A⁻¹Q  ]      Q = fração dos genes de cada animal vinda de cada grupo
             [ −Q'A⁻¹   Q'A⁻¹Q ]

    e, nas MME, o bloco λ·A* sobre [animais; grupos] dá â* = Qĝ + â, o valor genético que já
    inclui o efeito do grupo (transformação QP de Quaas e Pollak 1981).

    Devolve (A*, ids, grupos): os animais na ordem de ids e os grupos no fim, na ordem dada.
    Exemplo: Mrode et al. (2023), 4ª ed., Exemplo 4.4 (script Chapter_04_3.R), pedigree do
    Exemplo 4.1 com os pais desconhecidos no grupo 9 e as mães no grupo 10: bloco dos grupos
    [[0,750; 0,750]; [0,750; 1,083]].
    """
    grupos = list(grupos)
    sem = pedigree_sem_grupos(ped, grupos)
    A, ids = matriz_A(sem)
    F = np.diag(A) - 1.0
    n = len(ids)
    pos = {a: i for i, a in enumerate(ids)}
    pos.update({g: n + j for j, g in enumerate(grupos)})
    Ast = np.zeros((n + len(grupos), n + len(grupos)))
    for a in ids:
        posicoes, coef, di = [pos[a]], [1.0], 1.0
        for p in ped.get(a, (None, None)):
            if not conhecido(p):
                continue
            posicoes.append(pos[p])
            coef.append(-0.5)
            if pos[p] < n:                                # pai conhecido; grupo não muda d_i
                di -= 0.25 * (1.0 + F[pos[p]])
        alfa = 1.0 / di
        for p, cp in zip(posicoes, coef):
            for q, cq in zip(posicoes, coef):
                Ast[p, q] += alfa * cp * cq
    return Ast, ids, grupos


def parentesco(ped: dict, x, y) -> float:
    """Parentesco aditivo a_xy entre dois animais (elemento de A). a_xx = 1 + F_x."""
    A, ids = matriz_A(ped)
    pos = {a: i for i, a in enumerate(ids)}
    return float(A[pos[x], pos[y]])


def F_acasalamento(ped: dict, pai, mae) -> float:
    """Endogamia esperada do filho de um acasalamento planejado: F = ½·a_pai,mãe (Wright).

    "The relationship between two individuals is twice the inbreeding coefficient of their
    progeny" (Nilforooshan et al. 2021, citado no relatório de corte). Exemplo: filho de
    meios-irmãos (a = 0,25) nasce com F = 12,5%.
    """
    return 0.5 * parentesco(ped, pai, mae)


def tabela_F_acasalamentos(ped: dict, machos: list, femeas: list) -> dict:
    """F esperado de todos os pares macho × fêmea: {macho: {fêmea: F}}.

    Relatório de leite (tabela B1 a B4 × vacas) e relatório de caprinos (Exemplo 8).
    """
    A, ids = matriz_A(ped)
    pos = {a: i for i, a in enumerate(ids)}
    return {m: {f: float(0.5 * A[pos[m], pos[f]]) for f in femeas} for m in machos}


def escolher_reprodutor(ped: dict, femea, machos: list,
                        limite_F: float | None = None) -> tuple:
    """Escolhe o reprodutor de uma fêmea pelo F esperado do filho.

    * Sem limite_F: o macho de menor F; empates ficam com o primeiro da lista.
    * Com limite_F: a lista é lida como ordem de preferência (por exemplo, por mérito), e o
      escolhido é o primeiro macho com F ≤ limite_F. Se nenhum respeitar o limite, fica o de
      menor F.

    Devolve (macho, F, respeita_limite). É a regra "decidir por par, não por touro" do
    relatório de leite: com a lista [B1, B2, B3, B4] e sem limite, a alocação é B1 em V12,
    B2 em V13 e B4 em C. No Exemplo 8 de caprinos, com a preferência [B2, B4, B5] e limite
    de 6,25%, a alocação é B5 em D1, C1 e C5, B4 em C2 e C3 e B2 em C4.
    """
    return escolher_reprodutores(ped, [femea], machos, limite_F)[femea]


def escolher_reprodutores(ped: dict, femeas: list, machos: list,
                          limite_F: float | None = None) -> dict:
    """escolher_reprodutor aplicado a cada fêmea: {fêmea: (macho, F, respeita_limite)}.

    A matriz A é calculada uma vez só. Não limita o número de fêmeas por macho; para isso,
    divida as fêmeas em lotes ou retire o macho da lista quando ele atingir a sua cota.
    """
    tabela = tabela_F_acasalamentos(ped, machos, femeas)
    tolerancia = 1e-12                                   # evita que 0,0625 − 1e-17 vire "acima"
    escolhas = {}
    for f in femeas:
        valores = [(m, tabela[m][f]) for m in machos]
        escolhido = None
        if limite_F is not None:
            escolhido = next(((m, v, True) for m, v in valores if v <= limite_F + tolerancia), None)
        if escolhido is None:
            m, v = min(valores, key=lambda mv: mv[1])  # min mantém o primeiro em empate
            escolhido = (m, v, limite_F is None or v <= limite_F + tolerancia)
        escolhas[f] = escolhido
    return escolhas


# ---------------------------------------------------------------------------------------
# Tamanho efetivo e taxa de endogamia
# ---------------------------------------------------------------------------------------
def ne_wright(n_machos: float, n_femeas: float) -> float:
    """Tamanho efetivo de Wright com sexos desiguais: Ne = 4·Nm·Nf/(Nm + Nf).

    Supõe acasalamento ao acaso e distribuição de Poisson do número de filhos (Wang, Santiago e
    Caballero 2016). Exemplo: 3 carneiros e 100 ovelhas → Ne = 11,65 (ovinos, Exemplo 7).
    """
    return 4.0 * n_machos * n_femeas / (n_machos + n_femeas)


def n_machos_para_ne(ne_alvo: float, n_femeas: float) -> float:
    """Machos (não aparentados) por geração para atingir um Ne alvo com Nf fêmeas, invertendo
    Ne = 4·Nm·Nf/(Nm + Nf):  Nm = Ne·Nf/(4·Nf − Ne).

    Ne de 50 (ΔF de 1% por geração) com 1.000 cabras exige 12,7 bodes, isto é, pelo menos 13
    (relatório de caprinos, Exemplo 8).
    """
    if ne_alvo >= 4.0 * n_femeas:
        raise ValueError("Ne alvo inatingível com esse número de fêmeas")
    return ne_alvo * n_femeas / (4.0 * n_femeas - ne_alvo)


def delta_F(ne: float) -> float:
    """Aumento de endogamia por geração, ΔF = 1/(2Ne). Equivale a 1/(8Nm) + 1/(8Nf) da FAO (1998).

    Com seleção, o ΔF real é maior: a FAO adverte que a fórmula "only holds when selection is at
    random" (relatório de caprinos, Exemplo 8), por isso o valor é um limite inferior.
    """
    return 1.0 / (2.0 * ne)


def ne_de_delta_F(df: float) -> float:
    """Ne implícito numa taxa de endogamia: Ne = 1/(2ΔF) (ex.: ΔF de 1% ↔ Ne = 50, FAO 1998)."""
    return 1.0 / (2.0 * df)


def F_acumulado(df: float, geracoes: float, F0: float = 0.0) -> float:
    """F após t gerações com ΔF constante: F_t = 1 − (1 − F₀)·(1 − ΔF)^t.

    t pode ser fracionário: 10 anos com intervalo de gerações de 3 anos dão t = 10/3
    (relatório de caprinos, Exemplo 8: 1 bode e 20 cabras → 50,5% em 5 gerações, 37,4% em 10 anos).
    """
    return 1.0 - (1.0 - F0) * (1.0 - df) ** geracoes


def numero_efetivo_pais(proporcoes) -> float:
    """Número efetivo de pais com uso desigual: N_ef = 1/Σp², p = fração dos filhos de cada pai.

    Exemplo: 4 carneiros com 55%, 25%, 15% e 5% dos cordeiros → 2,56 (ovinos, Exemplo 7),
    que entra em ne_wright no lugar de Nm.
    """
    p = np.asarray(proporcoes, dtype=float)
    p = p / p.sum()
    return float(1.0 / np.sum(p ** 2))
