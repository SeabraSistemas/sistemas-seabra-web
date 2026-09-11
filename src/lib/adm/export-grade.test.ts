/**
 * EXPORTAÇÃO DA GRADE — o que faz o arquivo bater com a tela.
 *
 * As regras que este arquivo protege:
 *
 *   · O FILTRO DO ARQUIVO É O DA GRADE: rótulo da FK, texto sem acento e
 *     "(vazio)" — rodando a mesma `filtrarLinhas` sobre as mesmas facetas.
 *   · O PRÉ-FILTRO DE SERVIDOR só existe para datas e é SUPERCONJUNTO (um dia
 *     de folga). Enum e texto nunca vão ao banco.
 *   · "SÓ A PÁGINA ATUAL" é pelas chaves da tela, na ordem da tela.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_IDS_PAGINA,
  lerIds,
  naOrdemDosIds,
  preFiltroServidor,
  projecaoParaExport,
} from '@/lib/adm/export-grade';
import { filtrarLinhas, lerFiltros, type FacetaDef } from '@/lib/adm/facetas';
import { facetasDoRegistro, SUFIXO_ROTULO } from '@/lib/adm/facetas-catalogo';
import { ordenarLinhas, lerOrdens } from '@/lib/adm/ordenacao';
import { getRegistro } from '@/lib/adm/tabelas';

const AGORA = new Date('2026-09-11T12:00:00Z');

function rebanho() {
  const registro = getRegistro('rebanho');
  assert.ok(registro, 'o catálogo tem rebanho');
  return registro;
}

test('o filtro de FK compara o RÓTULO resolvido — o uuid nunca casaria com "Lactante"', () => {
  const registro = rebanho();
  const facetas = facetasDoRegistro(registro);
  assert.ok(facetas.some((f) => f.chave === 'categoria'), 'categoria é faceta do rebanho');

  const linhas = [
    { id: 1, categoria: '3f2a-uuid-1', [`categoria${SUFIXO_ROTULO}`]: 'Lactante' },
    { id: 2, categoria: '3f2a-uuid-2', [`categoria${SUFIXO_ROTULO}`]: 'Seca' },
    { id: 3, categoria: null },
  ];
  const filtros = lerFiltros(facetas, new URLSearchParams('f.categoria=Lactante'), AGORA);
  assert.deepEqual(
    filtrarLinhas(linhas, facetas, filtros).map((l) => l.id),
    [1],
  );
  const vazios = lerFiltros(facetas, new URLSearchParams('f.categoria=(vazio)'), AGORA);
  assert.deepEqual(
    filtrarLinhas(linhas, facetas, vazios).map((l) => l.id),
    [3],
    '"(vazio)" é um valor de negócio, não ausência de filtro',
  );
});

test('o filtro de texto ignora acento e caixa, como a tela — o ilike do banco não ignorava', () => {
  // Nenhum registro do catálogo declara faceta de texto hoje; a regra vale para
  // qualquer faceta que venha a declarar, então o teste monta a sua.
  const facetas: FacetaDef<{ id: number; nome: string }>[] = [
    { chave: 'nome', rotulo: 'Nome', tipo: 'texto', valor: (l) => l.nome },
  ];
  const linhas = [
    { id: 1, nome: 'São João' },
    { id: 2, nome: 'Boa Vista' },
  ];
  const filtros = lerFiltros(facetas, new URLSearchParams('f.nome=sao joao'), AGORA);
  assert.deepEqual(
    filtrarLinhas(linhas, facetas, filtros).map((l) => l.id),
    [1],
  );
});

test('projecaoParaExport: a chave, as colunas do arquivo e as que o filtro e a ordem leem — sem repetir', () => {
  const projecao = projecaoParaExport(
    'id',
    ['numero_animal', 'nome_animal'],
    { categoria: { tipo: 'enum', valores: ['Lactante'] } },
    [{ coluna: 'peso_atual', ascendente: false }, { coluna: 'numero_animal', ascendente: true }],
  );
  assert.deepEqual(projecao, ['id', 'numero_animal', 'nome_animal', 'categoria', 'peso_atual']);
});

test('preFiltroServidor: só data vai ao banco, com um dia de folga de cada lado', () => {
  // `venda` tem a própria coluna de data facetada (data_venda): é o caso em
  // que o pré-filtro vira a janela `periodo` do registro.
  const registro = getRegistro('venda');
  assert.ok(registro, 'o catálogo tem venda');
  const facetas = facetasDoRegistro(registro);
  assert.equal(registro.colunaData, 'data_venda');
  assert.ok(facetas.some((f) => f.chave === 'data_venda' && f.tipo === 'data'));

  const enumFaceta = facetas.find((f) => f.tipo === 'enum');
  const query = `f.data_venda=2026-03-01..2026-03-31${enumFaceta ? `&f.${enumFaceta.chave}=x` : ''}`;
  const filtros = lerFiltros(facetas, new URLSearchParams(query), AGORA);
  const pre = preFiltroServidor(registro, facetas, filtros);
  assert.deepEqual(pre.periodo, { de: '2026-02-28', ate: '2026-04-01' }, 'superconjunto: nunca corta o que a tela mostra');
  assert.deepEqual(pre.filtros, [], 'o enum NÃO vai ao banco — a grade compara o rótulo, o banco tem o valor cru');
});

test('preFiltroServidor: preset relativo vira piso com folga; data que não é a do registro vira gte', () => {
  // rebanho: colunaData é created_at, mas a faceta de data é data_de_nascimento.
  const registro = rebanho();
  const facetas = facetasDoRegistro(registro);
  const filtros = lerFiltros(facetas, new URLSearchParams('f.data_de_nascimento=30d'), AGORA);
  const pre = preFiltroServidor(registro, facetas, filtros);
  assert.equal(pre.periodo, undefined, 'não é a coluna de data do registro');
  assert.deepEqual(
    pre.filtros,
    [{ coluna: 'data_de_nascimento', op: 'gte', valor: '2026-08-11' }],
    '30 dias antes de 11/09 é 12/08; com a folga de um dia, 11/08',
  );
});

test('lerIds: chaves únicas, sem vazio, até o teto; naOrdemDosIds devolve na ordem da tela e ignora o que sumiu', () => {
  assert.deepEqual(lerIds(' 7, 3,,3, 9 '), ['7', '3', '9']);
  assert.equal(lerIds(null).length, 0);
  const muitos = Array.from({ length: MAX_IDS_PAGINA + 20 }, (_, i) => String(i)).join(',');
  assert.equal(lerIds(muitos).length, MAX_IDS_PAGINA);

  const linhas = [{ id: 3, n: 'c' }, { id: 9, n: 'a' }, { id: 7, n: 'b' }];
  assert.deepEqual(
    naOrdemDosIds(linhas, 'id', ['7', '3', '42', '9']).map((l) => l.n),
    ['b', 'c', 'a'],
  );
});

test('o XLSX é ordenado como a grade: multi-nível e nulo por último nos dois sentidos', () => {
  const ordens = lerOrdens('-peso,numero', new Set(['peso', 'numero']));
  const linhas = [
    { numero: '2', peso: 40 },
    { numero: '1', peso: null },
    { numero: '3', peso: 50 },
    { numero: '4', peso: 40 },
  ];
  assert.deepEqual(
    ordenarLinhas(linhas, ordens, [{ chave: 'peso' }, { chave: 'numero' }]).map((l) => l.numero),
    ['3', '2', '4', '1'],
  );
});
