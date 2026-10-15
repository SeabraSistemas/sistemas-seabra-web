"""Compara o motor (pacote melhoramento) com a saída dos scripts R oficiais de Mrode et al. (2023).

Uso:  python3 -B comparar.py <trabalho>/saidas      (os .json gravados por rodar_scripts.sh)

Para cada exemplo com função equivalente no motor, roda o motor com os mesmos dados e parâmetros
e tabula: exemplo, função, número de valores comparados, maior diferença absoluta e OK/divergente.
OK quando |motor − R| ≤ 1e-9·máx(1, |R|) em todos os valores (a regra de vetores_teste.json).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

LAB = Path(__file__).resolve().parent.parent          # central-melhoramento/laboratorio
SAIDAS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("saidas")
sys.path.insert(0, str(LAB))
from melhoramento import blup as B          # noqa: E402
from melhoramento import parentesco as P    # noqa: E402

TOL = 1e-9
_cache: dict = {}


def R(script: str, nome: str) -> np.ndarray:
    """Objeto numérico do script R (matriz por linhas ou vetor)."""
    if script not in _cache:
        _cache[script] = json.loads((SAIDAS / f"{script}.json").read_text())
    o = _cache[script][nome]
    v = np.array([np.nan if x is None else x for x in o["valores"]], dtype=float)
    return v.reshape(o["dim"]) if len(o["dim"]) == 2 else v


def Rnomes(script: str, nome: str) -> list:
    o = _cache[script][nome]
    return o.get("linhas") or o.get("nomes")


linhas: list[dict] = []


def registrar(exemplo, funcao, motor, r, nota=""):
    motor, r = np.ravel(np.asarray(motor, float)), np.ravel(np.asarray(r, float))
    assert motor.shape == r.shape, (exemplo, motor.shape, r.shape)
    dif = np.abs(motor - r)
    ok = bool(np.all(dif <= TOL * np.maximum(1.0, np.abs(r))))
    linhas.append({"exemplo": exemplo, "funcao": funcao, "n": int(r.size),
                   "max_dif": float(dif.max()), "status": "OK" if ok else "DIVERGENTE", "nota": nota})


def ped_de(script, nome="ped"):
    """Pedigree {animal: (pai, mãe)} a partir do data.frame (a, s, d) do script."""
    M = R(script, nome)
    return {int(a): (0 if np.isnan(s) else int(s), 0 if np.isnan(d) else int(d)) for a, s, d in M[:, :3]}


def reordenar(M, ids, rotulos):
    pos = {str(a): i for i, a in enumerate(ids)}
    idx = [pos[str(r)] for r in rotulos]
    return M[np.ix_(idx, idx)]


# ------------------------------------------------------------------------------------------
# 1. Parentesco: A, A⁻¹ e F
# ------------------------------------------------------------------------------------------
PEDIGREES = [  # (exemplo, script, objeto de A⁻¹ no script, pedigree)
    ("Ex. 4.1 (8 animais; também 4.2, 6, 17, 18, 19)", "Chapter_04_1", "Ainv", None),
    ("Ex. 5.1 (8 animais, F₈ = 0,125; também 10)", "Chapter_05_1", "Ainv", None),
    ("Ex. 5.2 (15 animais)", "Chapter_05_2", "Ainv", None),
    ("Ex. 8.1 (14 animais, endogamia)", "Chapter_08", "Ainv", None),
    ("Ex. 9.1 (15 animais)", "Chapter_09_1", "Ainv", None),
    ("Ex. 11.6 (26 animais; também 12.1)", "Chapter_11_1", "Ainv", None),
    ("Ex. 13.1 (12 animais, nadiv::makeAinv)", "Chapter_13_1", "Ainv", None),
]
for exemplo, script, obj, _ in PEDIGREES:
    if script == "Chapter_11_1":
        a, s, d = R(script, "a_full"), R(script, "s_full"), R(script, "d_full")
        ped = {int(x): (0 if np.isnan(y) else int(y), 0 if np.isnan(z) else int(z)) for x, y, z in zip(a, s, d)}
        rot = [str(int(x)) for x in a]
    else:
        ped = ped_de(script)
        rot = [str(k) for k in ped]
    Ainv_m, ids = P.inversa_A(ped)
    Ainv_r = R(script, obj)
    registrar(exemplo, "parentesco.inversa_A", reordenar(Ainv_m, ids, rot), Ainv_r)
    F_m = P.coeficientes_F(ped)
    F_r = np.diag(np.linalg.inv(Ainv_r)) - 1.0             # F = diag((A⁻¹)⁻¹) − 1, conta minha
    registrar(exemplo, "parentesco.coeficientes_F (F de diag(A_R⁻¹ inv) − 1)",
              [F_m[int(r)] for r in rot], F_r)

# Ex. 4.2: A⁻¹ dos touros (1, 3 e 4; 4 é filho de 1)
ped_s = ped_de("Chapter_04_1", "pedsires")
Asi_m, ids = P.inversa_A(ped_s)
registrar("Ex. 4.2 (touros 1, 3, 4)", "parentesco.inversa_A", reordenar(Asi_m, ids, ["1", "3", "4"]),
          R("Chapter_04_1", "Asinv"))
# Ex. 15.1: touros 1 a 4 (só pais)
ped15 = {int(a): (0 if np.isnan(s) else int(s), 0) for a, s in R("Chapter_15_1", "ped")[:, :2]}
A15, ids = P.inversa_A(ped15)
registrar("Ex. 15.1 (4 touros)", "parentesco.inversa_A", reordenar(A15, ids, ["1", "2", "3", "4"]),
          R("Chapter_15_1", "Ainv"))
# A pelo método tabular (getA): Cap. 12.1 (26 animais) e Cap. 17 (8 animais)
for exemplo, script, ped in (("Ex. 12.1 (26 animais)", "Chapter_12_1", None), ("Ex. 17.7 (8 animais)", "Chapter_17", None)):
    if script == "Chapter_12_1":                            # data$a virou fator; a = 1..26
        s_, d_ = R(script, "s"), R(script, "d")
        ped = {i + 1: (0 if np.isnan(s) else int(s), 0 if np.isnan(d) else int(d)) for i, (s, d) in enumerate(zip(s_, d_))}
    else:
        ped = ped_de(script)
    A_m, ids = P.matriz_A(ped)
    rot = [str(k) for k in ped]
    registrar(exemplo, "parentesco.matriz_A", reordenar(A_m, ids, rot), R(script, "A"))
    F_m = P.coeficientes_F(ped)
    registrar(exemplo, "parentesco.coeficientes_F (diag(A_R) − 1)", [F_m[int(r)] for r in rot],
              np.diag(R(script, "A")) - 1.0)

# Ex. 4.4: A* com grupos de pais desconhecidos (9 = pais, 10 = mães)
ped44 = {int(a): (int(s), int(d)) for a, s, d in R("Chapter_04_3", "pedEx") if not np.isnan(s)}
Ast, ids, gr = P.inversa_A_grupos(ped44, [9, 10])
pos = {str(a): i for i, a in enumerate(ids)}
idx = [pos[str(i)] for i in range(1, 9)] + [len(ids), len(ids) + 1]
Ast = Ast[np.ix_(idx, idx)]
Rst = np.block([[R("Chapter_04_3", "Ann"), R("Chapter_04_3", "Anp")],
                [R("Chapter_04_3", "Apn"), R("Chapter_04_3", "App")]])
registrar("Ex. 4.4 (grupos 9 e 10)", "parentesco.inversa_A_grupos (A* de Quaas)", Ast, Rst)

# ------------------------------------------------------------------------------------------
# 2. Modelo animal e acurácia (Ex. 4.1; Ex. 17.7; Ex. 18.1)
# ------------------------------------------------------------------------------------------
PED4 = ped_de("Chapter_04_1")
ANIM4 = [4, 5, 6, 7, 8]
SEXO4 = ["Male", "Female", "Female", "Male", "Male"]
WWG4 = [4.5, 2.9, 3.9, 3.5, 5.0]
r41 = B.modelo_animal(PED4, ANIM4, WWG4, SEXO4, sigma2_a=20.0, sigma2_e=40.0)
sol41 = np.concatenate([[r41.efeitos_fixos["GC=Male"], r41.efeitos_fixos["GC=Female"]], r41.ebv])
registrar("Ex. 4.1", "blup.modelo_animal (sexo + 8 EBV)", sol41, R("Chapter_04_1", "solutions"))
registrar("Ex. 4.1", "PEV/σ²e = c^ii (diagCM)", r41.pev / 40.0, R("Chapter_04_1", "diagCM"))
registrar("Ex. 4.1", "confiabilidade (r_square; F = 0)", r41.confiabilidade, R("Chapter_04_1", "r_square"))
registrar("Ex. 4.1", "acuracia (r)", r41.acuracia, R("Chapter_04_1", "r"))
registrar("Ex. 4.1", "√PEV (SEP do EBV; o motor dá sep_dep = √PEV/2)", np.sqrt(r41.pev), R("Chapter_04_1", "SEP"))
registrar("Ex. 18.1 (BLUP de partida do Gibbs)", "blup.modelo_animal", sol41, R("Chapter_18", "solutions"))

r177 = B.modelo_animal(PED4, ANIM4, [2.6, 0.1, 1.0, 3.0, 1.0], SEXO4, sigma2_a=0.2, sigma2_e=0.4)
sol177 = np.concatenate([[r177.efeitos_fixos["GC=Male"], r177.efeitos_fixos["GC=Female"]], r177.ebv])
registrar("Ex. 17.7 (dados do REML)", "blup.modelo_animal", sol177, R("Chapter_17", "solutions"))
fix = [r177.efeitos_fixos[f"GC={s}"] for s in SEXO4]
res = np.array([2.6, 0.1, 1.0, 3.0, 1.0]) - fix - r177.ebv[[3, 4, 5, 6, 7]]
registrar("Ex. 17.7 (dados do REML)", "resíduos y − Xb − Za", res, R("Chapter_17", "res"))
registrar("Ex. 17.7 (dados do REML)", "PEV/σ²e = diag(C22)", r177.pev / 0.4, np.diag(R("Chapter_17", "C22")))

# Ex. 4.2 (modelo animal reduzido): pais 1–6 pelo RAM e 7, 8 recuperados = modelo animal completo
ram = np.concatenate([R("Chapter_04_2", "solutions"), R("Chapter_04_2", "a_n")])
registrar("Ex. 4.3 (modelo animal reduzido)", "blup.modelo_animal (mesmas soluções do completo)", sol41, ram,
          "RAM não está no motor; as soluções do RAM coincidem com as do modelo completo")

# ------------------------------------------------------------------------------------------
# 3. Modelo de touro (Ex. 4.2)
# ------------------------------------------------------------------------------------------
sires = [1, 3, 1, 4, 3]
rt = B.modelo_touro([(sx, s, v) for sx, s, v in zip(SEXO4, sires, WWG4)], h2=4 * 5.0 / 60.0)
sol_t = np.array([rt.efeitos_grupo["Male"], rt.efeitos_grupo["Female"]] + [rt.ebv[s] / 2 for s in (1, 3, 4)])
registrar("Ex. 4.2 (touros 1, 3, 4; 4 filho de 1)", "blup.modelo_touro (ŝ = EBV/2)", sol_t,
          R("Chapter_04_1", "solutions_sire"),
          "o motor supõe touros não aparentados (A_s = I); o script usa A_s⁻¹")
var = json.loads((SAIDAS / "variante_touro_sem_parentesco.json").read_text())
registrar("Ex. 4.2, variante com A_s = I (R)", "blup.modelo_touro (ŝ = EBV/2)", sol_t, var["solucoes"],
          "mesma conta no R com touros não aparentados")
registrar("Ex. 4.2, variante com A_s = I (R)", "blup.modelo_touro (REL = 1 − λc^jj)",
          [rt.confiabilidade[s] for s in (1, 3, 4)], 1 - var["alpha"] * np.array(var["diag_C_touros"]))

# ------------------------------------------------------------------------------------------
# 4. Repetibilidade e ambiente comum (Ex. 5.1, 5.2, 9.2)
# ------------------------------------------------------------------------------------------
PED5 = ped_de("Chapter_05_1")
cow = [int(c) for c in R("Chapter_05_1", "cow")]
fy = R("Chapter_05_1", "fy")
hys = [str(int(h)) for h in R("Chapter_05_1", "hys")]
r51 = B.modelo_animal(PED5, cow, fy, hys, sigma2_a=20.0, sigma2_e=28.0, sigma2_pe=12.0)
s51 = R("Chapter_05_1", "solutions")
registrar("Ex. 5.1 (repetibilidade)", "blup.modelo_animal + ambiente permanente: EBV", r51.ebv, s51[4:12])
registrar("Ex. 5.1 (repetibilidade)", "ambiente permanente p̂ (vacas 4–8)",
          [r51.ambiente_permanente[c] for c in (4, 5, 6, 7, 8)], s51[12:17])
registrar("Ex. 5.1 (repetibilidade)", "parte fixa Xb de cada registro (estimável)",
          [r51.efeitos_fixos[f"GC={h}"] for h in hys], R("Chapter_05_1", "X") @ s51[:4],
          "paridade está aninhada em HYS: o motor ajusta só HYS (mesmo espaço de colunas)")

PED52 = ped_de("Chapter_05_2")
sexo52 = ["Male", "Female", "Female", "Female", "Male", "Female", "Female", "Male", "Female", "Male"]
fam = [str(int(f)) for f in R("Chapter_05_2", "fsfamily")]
s52 = R("Chapter_05_2", "solutions")
PED9 = ped_de("Chapter_09_2")
sexo9 = ["Male", "Female", "Female", "Male", "Female", "Female", "Male", "Female", "Male"]
s92 = R("Chapter_09_2", "solutions")
r52 = B.modelo_animal(PED52, list(range(6, 16)), R("Chapter_05_2", "ww"), sexo52, 20.0, 65.0,
                      sigma2_pe=15.0, rotulos_pe=fam)
m52 = np.concatenate([[r52.efeitos_fixos["GC=Male"], r52.efeitos_fixos["GC=Female"]], r52.ebv,
                      [r52.ambiente_permanente[f] for f in ("1", "2", "3")]])
registrar("Ex. 5.2 (ambiente comum de irmãos)", "blup.modelo_animal(rotulos_pe=família)", m52, s52)
r92 = B.modelo_animal(PED9, list(range(7, 16)), R("Chapter_09_2", "gr"),
                      [str(int(p)) for p in R("Chapter_09_2", "pen")], 25.7, 40.6 + 2 * 10.0,
                      sigma2_pe=12.5, rotulos_pe=[str(int(x)) for x in R("Chapter_09_2", "litter")],
                      outros_fatores={"sexo": sexo9})
m92 = np.concatenate([[r92.efeitos_fixos[k] for k in ("GC=1", "GC=2", "GC=3", "sexo=Female")], r92.ebv,
                      [r92.ambiente_permanente[f] for f in ("1", "2", "3")]])
registrar("Ex. 9.1 sem efeito associativo (leitegada)", "blup.modelo_animal(rotulos_pe=leitegada)", m92, s92)

# ------------------------------------------------------------------------------------------
# 5. Multicaracterística (Ex. 6.1) e materno (Ex. 8.1)
# ------------------------------------------------------------------------------------------
Y6 = np.column_stack([WWG4, R("Chapter_06", "pwg")])
r6 = B.modelo_multicaracteristica(PED4, ANIM4, Y6, SEXO4, G0=R("Chapter_06", "G_0"), R0=R("Chapter_06", "R_0"))
m6 = np.concatenate([[r6.efeitos_fixos[(c, s)] for c in ("c1", "c2") for s in ("Male", "Female")],
                     r6.ebv[:, 0], r6.ebv[:, 1]])
registrar("Ex. 6.1 (WWG e PWG)", "blup.modelo_multicaracteristica", m6, R("Chapter_06", "solutions"))

PED8 = ped_de("Chapter_08")
pen = [str(int(p)) for p in R("Chapter_08", "pen")]
herd = [str(int(h)) for h in R("Chapter_08", "herds")]
dam8 = [int(d) for d in R("Chapter_08", "dam")]
G8 = R("Chapter_08", "G")
r8 = B.modelo_direto_materno(PED8, list(range(5, 15)), dam8, R("Chapter_08", "bw"), pen, G0=G8,
                             sigma2_pe=40.0, sigma2_e=350.0, outros_fatores={"rebanho": herd})
m8 = np.concatenate([list(r8.efeitos_fixos.values()), r8.ebv_direto, r8.ebv_materno,
                     [r8.ambiente_permanente[m] for m in (2, 5, 6, 7)]])
registrar("Ex. 8.1 (peso ao nascer)", "blup.modelo_direto_materno", m8, R("Chapter_08", "solutions"))

# ------------------------------------------------------------------------------------------
# 6. Grupos de pais desconhecidos (Ex. 4.4) e Gauss-Seidel (Ex. 19.2)
# ------------------------------------------------------------------------------------------
rg = B.modelo_animal(ped44, ANIM4, WWG4, SEXO4, 20.0, 40.0, grupos_geneticos=[9, 10])
mg = np.concatenate([[rg.efeitos_fixos["GC=Male"], rg.efeitos_fixos["GC=Female"]], rg.ebv,
                     [rg.grupos_geneticos[10]]])
registrar("Ex. 4.4 (grupos; transformação QP)", "blup.modelo_animal(grupos_geneticos)", mg,
          R("Chapter_04_3", "solutions_QP"), "grupo 9 fixado em zero, como no script")

X, _ = B.montar_X(SEXO4)
Ainv4, ids4 = P.inversa_A(PED4)
Z, _ = B.incidencia(ANIM4, ids4)
LHS, RHS = B.montar_mme(X, Z, np.array(WWG4), Ainv4, 2.0)
registrar("Ex. 19.2", "blup.montar_mme (LHS 10×10 e RHS)", np.concatenate([LHS.ravel(), RHS]),
          np.concatenate([R("Chapter_19", "LHS").ravel(), R("Chapter_19", "RHS").ravel()]))
todos = R("Chapter_19", "solutions_all")              # 11 × 21: partida + 20 voltas; linha 11 = convergência
gs = B.gauss_seidel(LHS, RHS, x0=todos[:10, 0], iteracoes_max=20, tolerancia=0.0, guardar_historico=True)
registrar("Ex. 19.2 (20 voltas)", "blup.gauss_seidel: solução de cada volta",
          np.array(gs.historico).T, todos[:10, 1:])
registrar("Ex. 19.2 (20 voltas)", "blup.gauss_seidel: critério Σ(Δx)²/Σx²", gs.convergencia, todos[10, 1:])

# ------------------------------------------------------------------------------------------
# Tabela
# ------------------------------------------------------------------------------------------
print(f"{'exemplo':48} {'função':58} {'n':>5} {'máx |dif|':>10}  status")
for l in linhas:
    print(f"{l['exemplo'][:48]:48} {l['funcao'][:58]:58} {l['n']:5d} {l['max_dif']:10.1e}  {l['status']}"
          + (f"  ({l['nota']})" if l["nota"] else ""))
tot = sum(l["n"] for l in linhas if l["status"] == "OK")
print(f"\n{sum(l['status'] == 'OK' for l in linhas)} casos OK ({tot} valores), "
      f"{sum(l['status'] == 'DIVERGENTE' for l in linhas)} divergentes")
(SAIDAS / "comparacao.json").write_text(json.dumps(linhas, ensure_ascii=False, indent=1))
