#!/usr/bin/env node
/**
 * Converte os CSVs de docs/nutricao_dados (repositório do app) nos módulos
 * TypeScript de src/data/nutricao/. Uso:
 *
 *   node scripts/nutricao-gerar-dados.mjs /caminho/para/seabra-app-main/docs/nutricao_dados
 *
 * Transformações (únicas, todas aqui para serem auditáveis):
 *  - alimentos: células vazias viram null; ids = nome sem acento/caixa; o
 *    nome é passado para caixa de frase; `grupo` é classificação nossa (a
 *    planilha não tem); `aviso` do CSV vira `avisoFonte`.
 *  - exigências do formulador: só as 12 categorias de caprino.
 *  - NRC 2007: o CSV traz o peso reconvertido de libras (59,9 kg = 132 lb);
 *    aqui volta ao peso nominal da tabela (60 kg), 20–90 kg de 10 em 10 para
 *    cabras e 50–150 kg de 25 em 25 para bodes, com a checagem de que nenhum
 *    peso se afasta mais de 0,35 kg do nominal. Consumo, NDT, PB, Ca e P ficam
 *    como vieram. As linhas viram séries (fase + nível), com o rótulo em
 *    português e, em ordenha, a faixa de leite do rótulo em lb/dia.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pasta = process.argv[2];
if (!pasta) {
  console.error('Uso: node scripts/nutricao-gerar-dados.mjs <pasta-com-os-csv>');
  process.exit(1);
}
const saida = new URL('../src/data/nutricao/', import.meta.url);

function lerCsv(arquivo) {
  const texto = readFileSync(join(pasta, arquivo), 'utf8').replace(/\r/g, '');
  const linhas = [];
  let campo = '';
  let linha = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas;
  return resto.filter((l) => l.length > 1).map((l) => Object.fromEntries(cab.map((h, i) => [h, l[i] ?? ''])));
}

const num = (v) => (v === '' || v == null ? null : Number(v));
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = (s) => semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── alimentos ──────────────────────────────────────────────────────────────
const NOMES = {
  'MINERAL (SAL MINAS)': 'Mineral (Sal Minas)',
  'NÚCLEO (SAL MINAS)': 'Núcleo (Sal Minas)',
  'Milho, palha e sabugo (MDPS)': 'Milho, palha e sabugo (MDPS)',
  'MILHO MOÍDO (FUBÁ)': 'Milho moído (fubá)',
  'MINERAL 2': 'Mineral 2 (vazio)',
  'MINERAL 3': 'Mineral 3 (vazio)',
  'NÚCLEO 2': 'Núcleo 2 (vazio)',
  'NÚCLEO 3': 'Núcleo 3 (vazio)',
};
const frase = (s) => NOMES[s] ?? s.charAt(0) + s.slice(1).toLowerCase();

const GRUPOS = {
  pastagem: ['PASTAGEM RUIM', 'PASTAGEM MÉDIA', 'PASTAGEM BOA'],
  volumoso: ['ALFAFA VERDE', 'CANA DE AÇÚCAR', 'FENO NAPIER', 'FENO TIFTON', 'NAPIER VERDE PICADO', 'SILAGEM DE CAPIAÇU', 'SILAGEM DE CAPIM ELEFANTE', 'SILAGEM DE MILHO', 'SILAGEM DE SORGO'],
  concentrado: ['CAROÇO DE ALGODÃO', 'CASCA DE CAFÉ', 'CASCA DE SOJA', 'FARELO DE ARROZ INTEGRAL', 'FARELO DE GLÚTEN DE MILHO', 'FARELO DE SOJA', 'FARELO DE TRIGO', 'MILHO MOÍDO (FUBÁ)', 'Milho, palha e sabugo (MDPS)', 'POLPA CÍTRICA', 'SORGO MOÍDO'],
  suplemento: ['CALCÁRIO CALCÍTICO', 'MINERAL (SAL MINAS)', 'MINERAL 2', 'MINERAL 3', 'NÚCLEO (SAL MINAS)', 'NÚCLEO 2', 'NÚCLEO 3', 'ÓLEO DE COZINHA', 'PROMIL', 'PROTEINADO', 'RUMENSIN', 'SAL BRANCO', 'URÉIA'],
};
const grupoDe = (nome) => {
  const g = Object.keys(GRUPOS).find((k) => GRUPOS[k].includes(nome));
  if (!g) throw new Error(`alimento sem grupo: ${nome}`);
  return g;
};

const alimentos = lerCsv('alimentos_formulador.csv').map((l) => ({
  id: slug(l.alimento),
  nome: frase(l.alimento),
  grupo: grupoDe(l.alimento),
  ms: num(l.ms),
  pb: num(l.pb_frac_ms),
  ndt: num(l.ndt_frac_ms),
  fdn: num(l.fdn_frac_ms),
  ca: num(l.ca_frac_ms),
  p: num(l.p_frac_ms),
  ee: num(l.ee_frac_ms),
  mm: num(l.mm_frac_ms),
  cnf: num(l.cnf_frac_ms),
  amido: num(l.amido_frac_ms),
  preco: num(l.preco_rs_kg_mn),
  precoOrigem: l.preco_origem === '' ? null : l.preco_origem,
  avisoFonte: l.aviso === '' ? null : l.aviso,
}));
if (new Set(alimentos.map((a) => a.id)).size !== alimentos.length) throw new Error('ids de alimento repetidos');

const linhaObj = (o) => '  ' + JSON.stringify(o) + ',';
writeFileSync(
  new URL('alimentos.ts', saida),
  `// GERADO por scripts/nutricao-gerar-dados.mjs — não editar à mão.
// Fonte: Formulador de Dietas v1.0 (Silas Greca), banco de alimentos; uso autorizado pelo autor em 30/10/2026.
// Frações da matéria seca (0,16 = 16%), exceto \`ms\` (fração da matéria natural). \`preco\` em R$/kg de matéria natural.
// null = a planilha não tem o dado (não é zero).
import type { Alimento } from '@/lib/nutricao/tipos';

export const ALIMENTOS_FORMULADOR: Alimento[] = [
${alimentos.map(linhaObj).join('\n')}
];
`,
);

// ── exigências fixas do formulador ─────────────────────────────────────────
const categorias = lerCsv('exigencias_categoria.csv')
  .filter((l) => l.especie === 'caprino')
  .map((l) => ({
    id: slug(l.categoria),
    nome: frase(l.categoria),
    ndt: num(l.ndt_frac_ms),
    pb: num(l.pb_frac_ms),
    ca: num(l.ca_frac_ms),
    p: num(l.p_frac_ms),
    cmsKg: num(l.cms_kg_dia),
  }));
writeFileSync(
  new URL('exigencias-formulador.ts', saida),
  `// GERADO por scripts/nutricao-gerar-dados.mjs — não editar à mão.
// Fonte: tabela de exigências do Formulador de Dietas v1.0 (Silas Greca), 12 categorias de caprino.
// Valores FIXOS por categoria: não variam com peso nem produção (defeito 5 do documento de engenharia reversa).
// NDT, PB, Ca e P em fração da matéria seca; consumo de MS em kg/dia.
import type { CategoriaFormulador } from '@/lib/nutricao/tipos';

export const CATEGORIAS_FORMULADOR: CategoriaFormulador[] = [
${categorias.map(linhaObj).join('\n')}
];
`,
);

// ── NRC 2007 (Maryland) ────────────────────────────────────────────────────
const SECAO_FINAL = 'Nutrient Requirements for mature does during late gestation, lb/d';
const CRIAS = { Single: '1 cria', Twins: '2 crias', 'Triplets or more': '3 ou mais crias' };
const NIVEL_ORDENHA = { Low: 'Baixa produção', Medium: 'Média produção', High: 'Alta produção' };
const FASES = {
  mantenca: 'Mantença e cobertura',
  'gestacao-inicial': 'Gestação — início',
  'gestacao-final': 'Gestação — final',
  'lactacao-amamentando': 'Lactação — cabra amamentando',
  'ordenha-inicio': 'Ordenha — início da lactação',
  'ordenha-meio': 'Ordenha — meio da lactação',
  'ordenha-fim': 'Ordenha — fim da lactação',
  bodes: 'Bodes',
};

function classificar(l) {
  const { aba, secao, rotulo } = l;
  if (aba === 'Maintenance') return { fase: 'mantenca', nivel: rotulo === 'Breeding' ? 'Cobertura' : 'Mantença' };
  if (aba === 'Gestation') return { fase: secao === SECAO_FINAL ? 'gestacao-final' : 'gestacao-inicial', nivel: CRIAS[rotulo] };
  if (aba === 'Lactation') return { fase: 'lactacao-amamentando', nivel: CRIAS[rotulo] };
  if (aba === 'Bucks') return { fase: 'bodes', nivel: rotulo === 'Maintenance' ? 'Mantença' : 'Pré-cobertura' };
  if (aba === 'Parlor') {
    const fase = secao.startsWith('EARLY') ? 'ordenha-inicio' : secao.startsWith('MID') ? 'ordenha-meio' : 'ordenha-fim';
    const [nome, faixa] = rotulo.split(' yield / ');
    const [lo, hi] = faixa.replace(' lb/d', '').split('-').map(Number);
    return { fase, nivel: NIVEL_ORDENHA[nome], leiteLb: [lo, hi] };
  }
  throw new Error(`aba desconhecida: ${aba}`);
}

const series = new Map();
for (const l of lerCsv('nrc2007_cabra_leiteira.csv')) {
  const c = classificar(l);
  if (!c.nivel) throw new Error(`nível sem rótulo: ${JSON.stringify(l)}`);
  const id = `${c.fase}/${slug(c.nivel)}`;
  if (!series.has(id)) series.set(id, { id, fase: c.fase, faseNome: FASES[c.fase], nivel: c.nivel, ...(c.leiteLb ? { leiteLbDia: c.leiteLb } : {}), linhas: [] });
  const passo = c.fase === 'bodes' ? 25 : 10;
  const bruto = Number(l.peso_kg);
  const peso = Math.round(bruto / passo) * passo;
  if (Math.abs(peso - bruto) > 0.35) throw new Error(`peso fora do nominal: ${bruto}`);
  series.get(id).linhas.push({
    pesoKg: peso,
    cmsKg: Number(l.cms_kg),
    ndtKg: Number(l.ndt_kg),
    pbG: Number(l.pb_g),
    caG: Number(l.ca_g),
    pG: Number(l.p_g),
    ndtFrac: Number(l.ndt_frac_ms),
    pbFrac: Number(l.pb_frac_ms),
  });
}
const blocos = [...series.values()].map((s) => {
  s.linhas.sort((a, b) => a.pesoKg - b.pesoKg);
  const cab = { ...s, linhas: undefined };
  delete cab.linhas;
  return `  {\n    ...${JSON.stringify(cab)},\n    linhas: [\n${s.linhas.map((x) => '      ' + JSON.stringify(x) + ',').join('\n')}\n    ],\n  },`;
});
writeFileSync(
  new URL('nrc2007.ts', saida),
  `// GERADO por scripts/nutricao-gerar-dados.mjs — não editar à mão.
// Fonte: NRC 2007 (Nutrient Requirements of Small Ruminants) pelo Maryland Dairy Goat Ration Evaluator
// (Susan Schoenian, 2015), convertido de libras para kg. Pesos no valor nominal da tabela (60 kg, não 59,9).
// Exigência diária por animal: consumo de MS (kg), NDT (kg), PB, Ca e P (g); ndtFrac/pbFrac = concentração na MS.
// O NRC trabalha em degraus de NDT da dieta (≈53%, 66% e 80%): ver degrauNdt() em src/lib/nutricao/nrc.ts.
// Fora do arquivo: aba Kids (cabritos), de outro formato.
import type { SerieNrc } from '@/lib/nutricao/tipos';

export const FASES_NRC: Record<string, string> = ${JSON.stringify(FASES, null, 2)};

export const SERIES_NRC: SerieNrc[] = [
${blocos.join('\n')}
];
`,
);
console.log(`ok: ${alimentos.length} alimentos, ${categorias.length} categorias, ${series.size} séries NRC`);
