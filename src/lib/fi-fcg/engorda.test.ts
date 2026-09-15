import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { montarLotesEngorda } from '@/lib/fi-fcg/engorda';
import type { RegRebanho } from '@/lib/fi-fcg/types';

function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, entradaEngorda: null, diasEngordaAtual: null,
    pesoEntradaEngorda: null, gmdAtual: null, ...p,
  };
}

describe('montarLotesEngorda', () => {
  test('sem entradaEngorda ou sem fazenda: fica de fora (nunca entrou no programa / dado incompleto)', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: null, fazenda: 'Inhumas' }),
        animal({ id: 'a2', entradaEngorda: 20250101, fazenda: null }),
      ],
      20260101,
    );
    assert.deepEqual(lotes, []);
  });

  test('agrupa por Fazenda + Entrada engorda; ordena do cohort mais recente pro mais antigo', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20250501, fazenda: 'Inhumas', status: 'Engorda', gmdAtual: 1, pesoEntradaEngorda: 200 }),
        animal({ id: 'a2', entradaEngorda: 20250801, fazenda: 'Inhumas', status: 'Engorda', gmdAtual: 1, pesoEntradaEngorda: 200 }),
      ],
      20260101,
    );
    assert.deepEqual(lotes.map((l) => l.entrada), [20250801, 20250501]);
  });

  test('mesma fazenda e mesma data viram 1 cohort só; fazendas diferentes na mesma data viram cohorts separados', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20250801, fazenda: 'Inhumas', categoria: 'Bezerra' }),
        animal({ id: 'a2', entradaEngorda: 20250801, fazenda: 'Inhumas', categoria: 'Venda' }),
        animal({ id: 'a3', entradaEngorda: 20250801, fazenda: 'Campina grande', categoria: 'Bezerra' }),
      ],
      20260101,
    );
    assert.equal(lotes.length, 2);
    const inhumas = lotes.find((l) => l.fazenda === 'Inhumas')!;
    assert.equal(inhumas.total, 2);
    assert.equal(inhumas.ativos, 1); // só a1 continua no rebanho (a2 já foi vendido)
  });

  test('ativos usa Categoria, nao Status: Status "Engorda" desatualizado nao conta como saida, e Status != "Engorda" nao conta como saida', () => {
    const lotes = montarLotesEngorda(
      [
        // ja foi vendido de verdade (Categoria manda), mesmo com Status ainda "Engorda" (congelado)
        animal({ id: 'a1', entradaEngorda: 20250801, fazenda: 'Inhumas', categoria: 'Venda', status: 'Engorda' }),
        // continua no rebanho (Categoria normal), so o Status mudou de estagio de vida
        animal({ id: 'a2', entradaEngorda: 20250801, fazenda: 'Inhumas', categoria: 'Bezerra', status: 'Desmamada' }),
      ],
      20260101,
    );
    assert.equal(lotes[0].ativos, 1); // so a2
  });

  test('gmdMedio/comGmd ignoram null e <=0 (repesagem desatualizada nao conta como "com GMD")', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20250801, fazenda: 'Inhumas', gmdAtual: 1.2 }),
        animal({ id: 'a2', entradaEngorda: 20250801, fazenda: 'Inhumas', gmdAtual: 0.8 }),
        animal({ id: 'a3', entradaEngorda: 20250801, fazenda: 'Inhumas', gmdAtual: 0 }),
        animal({ id: 'a4', entradaEngorda: 20250801, fazenda: 'Inhumas', gmdAtual: null }),
      ],
      20260101,
    );
    assert.equal(lotes.length, 1);
    assert.equal(lotes[0].total, 4);
    assert.equal(lotes[0].comGmd, 2);
    assert.equal(lotes[0].gmdMedio, 1); // (1.2 + 0.8) / 2
  });

  test('pesoEntradaMedio ignora quem nao tem o campo preenchido', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20250801, fazenda: 'Inhumas', pesoEntradaEngorda: 200 }),
        animal({ id: 'a2', entradaEngorda: 20250801, fazenda: 'Inhumas', pesoEntradaEngorda: 300 }),
        animal({ id: 'a3', entradaEngorda: 20250801, fazenda: 'Inhumas', pesoEntradaEngorda: null }),
      ],
      20260101,
    );
    assert.equal(lotes[0].pesoEntradaMedio, 250);
  });

  test('diasDesdeEntrada = diasEntre(entrada, hoje)', () => {
    const lotes = montarLotesEngorda([animal({ id: 'a1', entradaEngorda: 20260101, fazenda: 'Inhumas' })], 20260111);
    assert.equal(lotes[0].diasDesdeEntrada, 10);
  });

  test('nome: sem "lote" preenchido em ninguem do grupo, gera "Lote GMD d.m.aa" pela data de entrada', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: null }),
        animal({ id: 'a2', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: null }),
      ],
      20260101,
    );
    assert.equal(lotes[0].nome, 'Lote GMD 23.4.26');
  });

  test('nome: todo mundo do grupo concorda no "lote" real, usa ele', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: 'Curral 3' }),
        animal({ id: 'a2', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: 'Curral 3' }),
      ],
      20260101,
    );
    assert.equal(lotes[0].nome, 'Curral 3');
  });

  test('nome: "lote" real divergente entre os animais do grupo (ou só parte preenchido) cai no nome gerado', () => {
    const lotes = montarLotesEngorda(
      [
        animal({ id: 'a1', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: 'Curral 3' }),
        animal({ id: 'a2', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: 'Curral 4' }),
        animal({ id: 'a3', entradaEngorda: 20260423, fazenda: 'Inhumas', lote: null }),
      ],
      20260101,
    );
    assert.equal(lotes[0].nome, 'Lote GMD 23.4.26');
  });
});
