// Confere lab/calculadoras.js contra o motor Python (laboratorio/vetores_teste.json).
//
// Uso:  node lab/testar_calculadoras.mjs        (a partir de central-melhoramento/)
//
// 1. Carrega calculadoras.js como módulo do Node (require) e como script de navegador (vm, sem
//    `module`), e confere que os dois expõem as mesmas funções.
// 2. Roda cada vetor de vetores_teste.json: chama a função com os argumentos nomeados, na ordem de
//    LabSeabra.ASSINATURAS, e compara com a saída do Python com a tolerância do próprio arquivo
//    (erro absoluto de até tolerancia_relativa × max(1, |valor|), a regra de tests/test_vetores.py).
//    Vetores de funções que esta porta não traz (BLUP matricial, ajuste de curvas) são listados
//    como "não coberto".
// 3. Confere os exemplos com que as calculadoras abrem contra os números impressos nos relatórios,
//    com tolerância de meia unidade na última casa impressa.
// Sai com código 1 se algum vetor aplicável ou algum exemplo falhar.

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const arquivoJs = path.join(aqui, "calculadoras.js");
const arquivoVetores = path.join(aqui, "..", "laboratorio", "vetores_teste.json");

// Funções do motor Python que não fazem parte de nenhuma calculadora e não foram portadas.
const MOTIVO_NAO_COBERTO = {
  "blup.modelo_animal": "MME do modelo animal (matricial; fica para a Edge Function)",
  "blup.modelo_direto_materno": "MME direto-materno (matricial; fica para a Edge Function)",
  "blup.modelo_multicaracteristica": "MME multicaracterística (matricial; fica para a Edge Function)",
  "blup.ajuste_hva": "variância heterogênea do USDA (nenhuma calculadora usa)",
  "lactacao.ajustar_wood_loglinear": "ajuste de curva de Wood (nenhuma calculadora usa)",
  "lactacao.ajustar_wood_gauss_newton": "ajuste de curva de Wood (nenhuma calculadora usa)",
  "lactacao.ajustar_wilmink": "ajuste de curva de Wilmink (nenhuma calculadora usa)",
  "indices.smith_hazel": "índice de Smith-Hazel com P e G (nenhuma calculadora usa)",
};

// ---------------------------------------------------------------------------------------
// 1. Carregar nos dois modos
// ---------------------------------------------------------------------------------------
const L = require(arquivoJs);
const contexto = vm.createContext({});
vm.runInContext(readFileSync(arquivoJs, "utf8"), contexto, { filename: "calculadoras.js" });
const Lnavegador = contexto.LabSeabra;

const falhas = [];

function listaFuncoes(api) {
  return Object.keys(api).filter((m) => typeof api[m] === "object" && m !== "ASSINATURAS")
    .flatMap((m) => Object.keys(api[m]).filter((f) => typeof api[m][f] === "function").map((f) => `${m}.${f}`))
    .sort();
}
if (!Lnavegador) {
  falhas.push("carregado como script de navegador, calculadoras.js não definiu LabSeabra");
} else if (listaFuncoes(L).join() !== listaFuncoes(Lnavegador).join()) {
  falhas.push("as funções expostas pelo require e pelo script de navegador diferem");
}
for (const nome of Object.keys(L.ASSINATURAS)) {
  const [m, f] = nome.split(".");
  if (typeof L[m]?.[f] !== "function") falhas.push(`ASSINATURAS cita ${nome}, que não existe`);
}

// ---------------------------------------------------------------------------------------
// 2. Vetores de teste
// ---------------------------------------------------------------------------------------
const dados = JSON.parse(readFileSync(arquivoVetores, "utf8"));
const TOL = dados.tolerancia_relativa;

function compara(calc, grav, caminho, erros) {
  if (grav === null) {
    if (!(calc === null || (typeof calc === "number" && Number.isNaN(calc)))) erros.push(`${caminho}: esperado null/NaN, veio ${calc}`);
    return;
  }
  if (Array.isArray(grav)) {
    if (!Array.isArray(calc)) return void erros.push(`${caminho}: esperado lista, veio ${typeof calc}`);
    if (calc.length !== grav.length) return void erros.push(`${caminho}: tamanho ${calc.length} != ${grav.length}`);
    grav.forEach((g, i) => compara(calc[i], g, `${caminho}[${i}]`, erros));
    return;
  }
  if (typeof grav === "object") {
    if (calc === null || typeof calc !== "object" || Array.isArray(calc)) return void erros.push(`${caminho}: esperado objeto`);
    const kc = Object.keys(calc).sort().join("|");
    const kg = Object.keys(grav).sort().join("|");
    if (kc !== kg) return void erros.push(`${caminho}: chaves {${kc}} != {${kg}}`);
    for (const k of Object.keys(grav)) compara(calc[k], grav[k], `${caminho}.${k}`, erros);
    return;
  }
  if (typeof grav === "number") {
    if (typeof calc !== "number" || !(Math.abs(calc - grav) <= TOL * Math.max(1, Math.abs(grav)))) {
      erros.push(`${caminho}: ${calc} != ${grav}`);
    }
    return;
  }
  if (calc !== grav) erros.push(`${caminho}: ${JSON.stringify(calc)} != ${JSON.stringify(grav)}`);
}

let passaram = 0;
const naoCobertos = [];
const porModulo = {};
for (const v of dados.vetores) {
  const [modulo, nome] = v.funcao.split(".");
  porModulo[modulo] ??= { passaram: 0, total: 0, nao: 0 };
  porModulo[modulo].total += 1;
  const fn = L[modulo]?.[nome];
  const params = L.ASSINATURAS[v.funcao];
  if (typeof fn !== "function" || !params) {
    naoCobertos.push(v);
    porModulo[modulo].nao += 1;
    continue;
  }
  const extras = Object.keys(v.entrada).filter((k) => !params.includes(k));
  if (extras.length) {
    falhas.push(`${v.id}: argumentos sem lugar na assinatura de ${v.funcao}: ${extras.join(", ")}`);
    continue;
  }
  let saida;
  try {
    saida = fn(...params.map((p) => v.entrada[p]));
  } catch (e) {
    falhas.push(`${v.id}: erro ${e.message}`);
    continue;
  }
  const erros = [];
  compara(saida, v.saida, v.id, erros);
  if (erros.length) falhas.push(...erros.slice(0, 5));
  else {
    passaram += 1;
    porModulo[modulo].passaram += 1;
  }
}

// ---------------------------------------------------------------------------------------
// 3. Exemplos das calculadoras contra os números impressos nos relatórios
// ---------------------------------------------------------------------------------------
let exemplosOk = 0;
let exemplosTotal = 0;
function impresso(descricao, calculado, valor, casas) {
  exemplosTotal += 1;
  const tol = 0.5 * Math.pow(10, -casas) + 1e-9;
  if (Number.isFinite(calculado) && Math.abs(calculado - valor) <= tol) exemplosOk += 1;
  else falhas.push(`exemplo "${descricao}": calculado ${calculado}, impresso ${valor}`);
}
function igual(descricao, calculado, esperado) {
  exemplosTotal += 1;
  if (JSON.stringify(calculado) === JSON.stringify(esperado)) exemplosOk += 1;
  else falhas.push(`exemplo "${descricao}": ${JSON.stringify(calculado)} != ${JSON.stringify(esperado)}`);
}

const { taxas, confiabilidade: cf, indices, parentesco: pa, blup, lactacao: la, ganho } = L;

// Caprinos, Exemplo 6: MPPA com r = 0,36 e 0,44 (desvios de PL305; h² 0,20; σP 200).
const cabras = { C1: [150], C2: [120, 90, 100], C3: [200, 40], C4: [-60], C5: [-80, -40, -100, -50], C6: [60, 80] };
const mppaDe = (d, r) => indices.mppa(d.reduce((a, b) => a + b, 0) / d.length, d.length, r, 0);
[["C1", 54.0], ["C2", 64.9], ["C3", 63.5], ["C4", -21.6], ["C5", -46.7], ["C6", 37.1]]
  .forEach(([c, v]) => impresso(`Caprinos Ex. 6, MPPA de ${c}`, mppaDe(cabras[c], 0.36), v, 1));
[["C3", 73.3], ["C2", 72.6], ["C1", 66.0]]
  .forEach(([c, v]) => impresso(`Caprinos Ex. 6, MPPA de ${c} com r = 0,44`, mppaDe(cabras[c], 0.44), v, 1));

// Caprinos, "PTA, base e confiabilidade" e Exemplo 3 (h² 0,20).
impresso("Caprinos, DE para REL 0,50 (k_d = 18)", cf.de_de_rel(0.5, cf.k_d(0.2)), 18, 0);
impresso("Caprinos, DE para REL 0,70 (k_d = 18)", cf.de_de_rel(0.7, cf.k_d(0.2)), 42, 0);
[[10, 0.36], [30, 0.63], [100, 0.85]].forEach(([n, v]) => impresso(`Caprinos, ${n} filhas com k_d = 18`, cf.rel_filhas(n, 0.2), v, 2));
const rebanhos = (qtd, filhasX, outras, nomeOutro = () => "Z") =>
  Array.from({ length: qtd }, (_, i) => ({ X: filhasX, [nomeOutro(i)]: outras }));
const relX = (rebs, ext) => blup.rel_exata_modelo_touro(rebs, 0.2, ext).X;
impresso("Caprinos Ex. 3, X sozinho no grupo", relX([{ X: 10 }]), 0.0, 2);
impresso("Caprinos Ex. 3, ao lado de 10 filhas de Y", relX([{ X: 10, Y: 10 }]), 0.17, 2);
impresso("Caprinos Ex. 3, ao lado de 10 filhas de Z (IA)", relX([{ X: 10, Z: 10 }], { Z: 0.9 }), 0.20, 2);
impresso("Caprinos Ex. 3, 5 filhas em 2 rebanhos", relX(rebanhos(2, 5, 10), { Z: 0.9 }), 0.25, 2);
impresso("Caprinos Ex. 3, 2 filhas em 5 rebanhos", relX(rebanhos(5, 2, 10), { Z: 0.9 }), 0.30, 2);
impresso("Caprinos Ex. 3, 2 filhas em 5 rebanhos, bodes locais", relX(rebanhos(5, 2, 10, (i) => `L${i}`)), 0.29, 2);
impresso("Caprinos Ex. 3, 1 filha em 10 rebanhos", relX(rebanhos(10, 1, 10), { Z: 0.9 }), 0.31, 2);
impresso("Caprinos Ex. 3, fórmula 10/(10 + 19)", cf.rel_filhas(10, 0.2, false), 0.34, 2);
impresso("Caprinos Ex. 3, 30 filhas num grupo", relX([{ X: 30, Z: 30 }], { Z: 0.9 }), 0.42, 2);
impresso("Caprinos Ex. 3, 2 filhas em 15 rebanhos", relX(rebanhos(15, 2, 10), { Z: 0.9 }), 0.54, 2);
impresso("Caprinos Ex. 3, 2 filhas em 15 rebanhos, 40 de Z", relX(rebanhos(15, 2, 40), { Z: 0.9 }), 0.57, 2);
impresso("Caprinos Ex. 3, fórmula 30/(30 + 19)", cf.rel_filhas(30, 0.2, false), 0.61, 2);

// Leite, "Filhas-equivalentes": 10 filhas + média dos pais de REL 0,30 (h² 0,25) e 100 filhas no mesmo rebanho.
impresso("Leite, 10 filhas + PA de REL 0,30", cf.rel_total(0.25, cf.de_de_rel(0.3, cf.k_d(0.25)), 0, 10), 0.533, 3);
impresso("Leite, 100 filhas num rebanho", cf.de_filhas_mesmo_rebanho(100), 5.9, 1);
impresso("Leite, 10 filhas num rebanho", cf.de_filhas_mesmo_rebanho(10), 4.1, 1);

// Corte, Passo 3: conversões e o animal 4 (PEV 92,08 com σ²a = 100).
[[0.5, 0.134], [0.6, 0.200], [0.8, 0.400], [0.9, 0.564], [0.98, 0.801]]
  .forEach(([r, v]) => impresso(`Corte, r ${r} → a_BIF`, cf.bif_de_r(r), v, 3));
const rel4 = cf.rel_de_pev(92.08393485804014, 100, 0);
impresso("Corte, animal 4: r", Math.sqrt(rel4), 0.281, 3);
impresso("Corte, animal 4: a_BIF", cf.bif_de_rel(rel4), 0.040, 3);
impresso("Corte, animal 4: SEP = PC", blup.possible_change(cf.bif_de_rel(rel4), 10), 4.80, 2);
impresso("Corte, animal 6 (F = 0,125): r", Math.sqrt(cf.rel_de_pev(102.09837145100421, 100, 0.125)), 0.304, 3);
impresso("Corte, PC68 do touro P450", blup.possible_change(0.7, 16.48), 2.47, 2);
impresso("Corte, PC95 do touro P450", blup.possible_change(0.7, 16.48, 2), 4.94, 2);
impresso("Corte, 0,70 lido como r (ANCP)", blup.possible_change_de_r(0.7, 16.48), 5.88, 2);

// Caprinos, Exemplo 8: média de F por bode e alocação com preferência [B2, B4, B5] e limite 6,25%.
const PED8 = [["B1", "0", "0"], ["D1", "0", "0"], ["D2", "0", "0"], ["D3", "0", "0"], ["B2", "B1", "D1"],
  ["C1", "B1", "D1"], ["C2", "B1", "D2"], ["C3", "B1", "D3"], ["B3", "0", "0"], ["C4", "B3", "D2"],
  ["C5", "B2", "C2"], ["B4", "B3", "C1"], ["B5", "0", "0"]];
const femeas8 = ["D1", "C1", "C2", "C3", "C4", "C5"];
const tabela8 = pa.tabela_F_acasalamentos(PED8, ["B2", "B4", "B5"], femeas8);
const mediaF = (m) => 100 * femeas8.reduce((s, f) => s + tabela8[m][f], 0) / femeas8.length;
impresso("Caprinos Ex. 8, média de F com B2 (%)", mediaF("B2"), 17.71, 2);
impresso("Caprinos Ex. 8, média de F com B4 (%)", mediaF("B4"), 11.98, 2);
impresso("Caprinos Ex. 8, F de C5", pa.coeficientes_F(PED8).C5, 0.125, 3);
const escolha8 = pa.escolher_reprodutores(PED8, femeas8, ["B2", "B4", "B5"], 0.0625);
igual("Caprinos Ex. 8, alocação", femeas8.map((f) => escolha8[f][0]), ["B5", "B5", "B4", "B4", "B2", "B5"]);
// Tabela de Ne do Exemplo 8 (intervalo de gerações de 3 anos).
[[1, 20, 3.8, 13.1, 50.5, 37.4], [1, 50, 3.9, 12.7, 49.4, 36.5], [2, 50, 7.7, 6.5, 28.5, 20.1],
  [3, 100, 11.7, 4.3, 19.7, 13.6], [5, 200, 19.5, 2.6, 12.2, 8.3], [10, 500, 39.2, 1.3, 6.2, 4.2],
  [13, 1000, 51.3, 0.97, 4.8, 3.2]].forEach(([nm, nf, ne, df, f5, f10]) => {
  const n = pa.ne_wright(nm, nf);
  const d = pa.delta_F(n);
  impresso(`Caprinos Ex. 8, Ne com ${nm} × ${nf}`, n, ne, 1);
  impresso(`Caprinos Ex. 8, ΔF com ${nm} × ${nf} (%)`, 100 * d, df, df < 1 ? 2 : 1);
  impresso(`Caprinos Ex. 8, F em 5 gerações com ${nm} × ${nf} (%)`, 100 * pa.F_acumulado(d, 5), f5, 1);
  impresso(`Caprinos Ex. 8, F em 10 anos com ${nm} × ${nf} (%)`, 100 * pa.F_acumulado(d, 10 / 3), f10, 1);
});
impresso("Caprinos Ex. 8, bodes para Ne 50 com 1.000 cabras", pa.n_machos_para_ne(50, 1000), 12.7, 1);

// Taxas: leite ("Toda taxa precisa de intervalo") e caprinos, Exemplo 7.
const pct = (ic) => ic.map((x) => 100 * x);
[["Wald", taxas.ic_wald, [-0.7, 20.7]], ["Wilson", taxas.ic_wilson, [3.5, 25.6]], ["exato", taxas.ic_exato, [2.1, 26.5]]]
  .forEach(([nome, f, [lo, hi]]) => {
    const [a, b] = pct(f(3, 30));
    impresso(`Caprinos Ex. 7, aborto 3/30, ${nome} inferior`, a, lo, 1);
    impresso(`Caprinos Ex. 7, aborto 3/30, ${nome} superior`, b, hi, 1);
  });
impresso("Leite, 6/30 exato inferior (%)", 100 * taxas.ic_exato(6, 30)[0], 7.7, 1);
impresso("Leite, 6/30 exato superior (%)", 100 * taxas.ic_exato(6, 30)[1], 38.6, 1);
impresso("Caprinos Ex. 7, n para 10% × 20%", taxas.n_por_grupo(0.1, 0.2), 199, 0);
impresso("Caprinos Ex. 7, poder com 30 (10% × 20%)", 100 * taxas.poder_duas_proporcoes(0.1, 0.2, 30), 19, 0);
impresso("Caprinos Ex. 7, n para 30% × 15%", taxas.n_por_grupo(0.3, 0.15), 121, 0);
impresso("Caprinos Ex. 7, poder com 30 (30% × 15%)", 100 * taxas.poder_duas_proporcoes(0.3, 0.15, 30), 28, 0);
impresso("Caprinos Ex. 7, n para 10% × 30%", taxas.n_por_grupo(0.1, 0.3), 62, 0);
impresso("Caprinos Ex. 7, poder com 30 (10% × 30%)", 100 * taxas.poder_duas_proporcoes(0.1, 0.3, 30), 49, 0);
impresso("Leite, n para 20% × 35% (separada)", taxas.n_por_grupo(0.2, 0.35, 0.05, 0.8, "separada"), 136, 0);
impresso("Leite, n para 35% × 45% (separada)", taxas.n_por_grupo(0.35, 0.45, 0.05, 0.8, "separada"), 373, 0);

// Leite, "Índices econômicos": touros A e B nos dois cenários.
const ve = [0.05, 20, 28, 90, 60, -250];
const dpPta = [250, 10, 7, 1.5, 1.2, 0.12];
const ptaA = [800, 40, 27, 0.2, -1.5, 0.12];
const ptaB = [320, 27, 18, 2.0, 1.8, -0.10];
const cenario = (v) => {
  const iA = indices.indice_economico(v, ptaA);
  const iB = indices.indice_economico(v, ptaB);
  const p = indices.prob_superar(iA, iB, indices.dp_erro_indice(v, 0.95, dpPta), indices.dp_erro_indice(v, 0.65, dpPta));
  return { iA, iB, p, enfase: indices.enfase_relativa(v, dpPta) };
};
const base = cenario(ve);
impresso("Leite, índice do touro A", base.iA, 1494.0, 1);
impresso("Leite, índice do touro B", base.iB, 1373.0, 1);
impresso("Leite, DP do erro de B", indices.dp_erro_indice(ve, 0.65, dpPta), 189.8, 1);
impresso("Leite, P(A > B) (%)", 100 * base.p, 72.5, 1);
const solidos = cenario([-0.02, 20, 28, 90, 120, -250]);
impresso("Leite, sólidos: índice de A", solidos.iA, 1348.0, 1);
impresso("Leite, sólidos: índice de B", solidos.iB, 1458.6, 1);
impresso("Leite, sólidos: P(B > A) (%)", 100 * (1 - solidos.p), 69.4, 1);
impresso("Leite, sólidos: ênfase da DPR (%)", 100 * solidos.enfase[4], 20.3, 1);

// Lactação: caprinos Ex. 1, ovinos Ex. 1, vaca do relatório de leite.
const diasCabra = [10, 40, 70, 100, 130, 160, 190, 220, 250, 280];
const leiteCabra = [2.63, 2.9, 3.0, 2.66, 2.62, 2.31, 2.04, 1.94, 1.61, 1.51];
impresso("Caprinos Ex. 1, 10 controles", la.lactacao_pequenos_ruminantes(diasCabra, leiteCabra, "caprino", 290, null, 305).total, 675.9, 1);
impresso("Caprinos Ex. 1, sem secagem", la.lactacao_pequenos_ruminantes(diasCabra, leiteCabra, "caprino", null, null, 305).total, 683.4, 1);
impresso("Caprinos Ex. 1, 5 bimestrais", la.lactacao_pequenos_ruminantes([40, 100, 160, 220, 280], [2.9, 2.66, 2.31, 1.94, 1.51], "caprino", 290, null, 305, 60).total, 678.0, 1);
impresso("Ovinos Ex. 1, TMM com 6 controles", la.lactacao_pequenos_ruminantes([40, 70, 100, 130, 160, 190], [2.15, 1.73, 1.5, 1.13, 0.96, 0.72], "ovino", 200, 30).total, 231.3, 1);
const diasVaca = [12, 42, 73, 101, 133, 162, 194, 224, 255, 286];
const leiteVaca = [24.0, 29.5, 30.2, 28.6, 27.1, 25.0, 23.4, 21.2, 19.5, 17.6];
impresso("Leite, TIM da vaca", la.tim(diasVaca, leiteVaca), 7469.4, 1);
impresso("Leite, TIM com os controles 1, 4, 7 e 10", la.tim([12, 101, 194, 286], [24.0, 28.6, 23.4, 17.6]), 7267.1, 1);
const trechos = la.fleischmann(diasVaca, leiteVaca, 305).trechos;
impresso("Leite, TIM: soma dos trechos", trechos.reduce((s, t) => s + t.kg, 0), 7469.4, 1);
impresso("Leite, TIM: 1º trecho (12 × 24,0)", trechos[0].kg, 288, 1);

// Ganho: caprinos, Exemplo 5 (σa = √(0,20 × 200²) = 89,44 kg, como no Apêndice A) e corte (σa = 10 kg).
const i = (p) => ganho.intensidade_selecao(p);
const sa5 = Math.sqrt(0.2 * 200 * 200);
impresso("Caprinos Ex. 5, teste de progênie", ganho.ganho_vias([[i(0.2), 0.79, 5.5], [i(0.2), 0.79, 5.5], [i(0.05), 0.6, 4], [i(0.8), 0.55, 4]], sa5), 17.1, 1);
impresso("Caprinos Ex. 5, bodes jovens genômicos", ganho.ganho_vias([[i(0.05), 0.65, 2], [i(0.15), 0.65, 2.5], [i(0.1), 0.65, 3.5], [i(0.8), 0.55, 4]], sa5), 27.5, 1);
impresso("Caprinos Ex. 5, rebanho comercial", ganho.ganho_vias([[i(0.15), 0.775, 4], [i(0.8), 0.55, 4]], sa5), 15.6, 1);
impresso("Caprinos Ex. 5, bodes pela produção da mãe", ganho.ganho_vias([[i(0.15), 0.224, 3], [i(0.8), 0.447, 4]], sa5), 6.4, 1);
impresso("Corte, touros genômicos e novilhas", ganho.ganho_vias([[i(0.1), 0.7, 3.5], [i(0.7), 0.5, 6]], 10), 1.55, 2);
impresso("Corte, touros por fenótipo", ganho.ganho_vias([[i(0.1), 0.4, 5], [i(0.7), 0.5, 6]], 10), 0.86, 2);

// ---------------------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------------------
const total = dados.vetores.length;
const aplicaveis = total - naoCobertos.length;
console.log(`calculadoras.js ${L.VERSAO} contra vetores_teste.json (pacote ${dados.versao_pacote}, tolerância ${TOL})`);
console.log("");
console.log("Vetores por módulo (passaram / aplicáveis; não cobertos):");
for (const [m, c] of Object.entries(porModulo)) {
  console.log(`  ${m.padEnd(15)} ${String(c.passaram).padStart(3)} / ${String(c.total - c.nao).padEnd(3)}  ${c.nao ? `${c.nao} não coberto(s)` : ""}`);
}
console.log("");
console.log(`Vetores: ${passaram} de ${aplicaveis} aplicáveis passaram; ${naoCobertos.length} não cobertos (de ${total}).`);
if (naoCobertos.length) {
  console.log("Não cobertos:");
  for (const v of naoCobertos) console.log(`  - ${v.id} (${v.funcao}): ${MOTIVO_NAO_COBERTO[v.funcao] ?? "função não portada"}`);
}
console.log(`Exemplos das calculadoras contra os números impressos nos relatórios: ${exemplosOk} de ${exemplosTotal}.`);
console.log(`Script de navegador: ${Lnavegador ? "window.LabSeabra definido, mesmas funções do módulo" : "FALHOU"}.`);

if (falhas.length) {
  console.log("");
  console.log(`FALHAS (${falhas.length}):`);
  for (const f of falhas) console.log(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log("");
  console.log("Tudo certo.");
}
