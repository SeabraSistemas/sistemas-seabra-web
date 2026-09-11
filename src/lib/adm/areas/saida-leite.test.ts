/**
 * SAÍDA DE LEITE — o destino e o balanço contra a produção.
 *
 * As regras que este arquivo protege:
 *
 *   · O BALANÇO É POR MÊS: o laticínio coleta o tanque de dois dias, e o dia
 *     da coleta mostra o dobro do que foi produzido nele.
 *   · SÓ ENTRAM OS MESES COM SAÍDA LANÇADA: mês sem saída é módulo sem uso,
 *     não leite parado no tanque.
 *   · DESTINO É AGRUPADO SEM ACENTO E SEM CAIXA, mas exibido na grafia da fazenda.
 *   · SAÍDA COM DATA NO FUTURO SAI DE TODA CONTA.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FOLGA_BALANCO,
  SEM_DESTINO,
  balanco,
  balancoMensal,
  chaveDestino,
  porDestino,
  resumoSaidas,
  separarSaidasFuturas,
} from '@/lib/adm/areas/saida-leite';
import type { LinhaProducaoDia, LinhaSaidaLeite } from '@/lib/adm/areas/contrato';

const HOJE = new Date('2026-09-10T00:00:00Z');

function saida(data: string, litros: number, destino: string | null = 'Laticínio'): LinhaSaidaLeite {
  return { propriedade_id: 1, saida_id: 0, data, litros, destino, observacao: null };
}

function dia(data: string, litros: number): LinhaProducaoDia {
  return {
    propriedade_id: 1,
    data,
    litros,
    litros_1_ordenha: null,
    litros_2_ordenha: null,
    lactantes: 10,
    litros_por_lactante: litros / 10,
    modo: 'duas_ordenhas',
    observacao: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Futuro e destinos
// ─────────────────────────────────────────────────────────────────────────────

test('separarSaidasFuturas: saída datada depois de hoje sai de toda conta', () => {
  const { validas, futuras } = separarSaidasFuturas(
    [saida('2026-09-10', 100), saida('2039-02-09', 100)],
    HOJE,
  );
  assert.equal(validas.length, 1, 'hoje ainda vale');
  assert.equal(futuras.length, 1);
});

test('chaveDestino: acento, caixa e espaço não separam o mesmo destino', () => {
  assert.equal(chaveDestino(' Laticínio '), chaveDestino('laticinio'));
  assert.equal(chaveDestino('Leite   Rose'), 'leite rose');
});

test('porDestino: agrupa grafias, exibe a mais usada e reparte por LITROS', () => {
  const destinos = porDestino([
    saida('2026-08-01', 300, 'Laticínio'),
    saida('2026-08-03', 300, 'Laticínio'),
    saida('2026-08-05', 200, 'laticinio'),
    saida('2026-08-05', 200, 'Cria/cabrito'),
  ]);

  assert.equal(destinos.length, 2);
  assert.equal(destinos[0].destino, 'Laticínio', 'a grafia que a fazenda mais usa');
  assert.equal(destinos[0].litros, 800);
  assert.equal(destinos[0].saidas, 3);
  assert.equal(destinos[0].fracao, 0.8);
  assert.equal(destinos[1].fracao, 0.2);
});

test('porDestino: saída sem destino vira uma linha própria, não some', () => {
  const [unico] = porDestino([saida('2026-08-01', 50, null)]);
  assert.equal(unico.destino, SEM_DESTINO);
  assert.equal(unico.litros, 50);
});

test('resumoSaidas: dias distintos, média por saída, e zero sem NaN', () => {
  const resumo = resumoSaidas([
    saida('2026-08-01', 300),
    saida('2026-08-01', 100, 'Venda'),
    saida('2026-08-03', 200),
  ]);
  assert.equal(resumo.saidas, 3);
  assert.equal(resumo.litros, 600);
  assert.equal(resumo.diasComSaida, 2);
  assert.equal(resumo.mediaPorSaida, 200);
  assert.equal(resumo.primeira, '2026-08-01');
  assert.equal(resumo.ultima, '2026-08-03');

  const vazio = resumoSaidas([]);
  assert.equal(vazio.mediaPorSaida, null);
  assert.equal(vazio.primeira, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Balanço
// ─────────────────────────────────────────────────────────────────────────────

test('balancoMensal: coleta a cada dois dias fecha no MÊS, embora dê 200% no dia', () => {
  // Produção de 100 L todo dia; o laticínio leva 200 L a cada dois dias.
  const dias = [dia('2026-08-01', 100), dia('2026-08-02', 100), dia('2026-08-03', 100), dia('2026-08-04', 100)];
  const saidas = [saida('2026-08-02', 200), saida('2026-08-04', 200)];

  const [agosto] = balancoMensal(saidas, dias);
  assert.equal(agosto.mes, '2026-08');
  assert.equal(agosto.produzido, 400);
  assert.equal(agosto.saiu, 400);
  assert.equal(agosto.razao, 1);
  assert.equal(agosto.diasProducao, 4);
});

test('balancoMensal: mês sem saída lançada NÃO entra — seria módulo sem uso lido como leite parado', () => {
  const meses = balancoMensal(
    [saida('2026-08-10', 500)],
    [dia('2026-07-10', 1000), dia('2026-08-10', 500)],
  );
  assert.deepEqual(
    meses.map((m) => m.mes),
    ['2026-08'],
  );
});

test('balancoMensal: mês com saída e sem produção lançada tem razão null, não infinito', () => {
  const [mes] = balancoMensal([saida('2026-08-10', 500)], []);
  assert.equal(mes.produzido, 0);
  assert.equal(mes.diasProducao, 0);
  assert.equal(mes.razao, null);
});

test('balancoMensal: do mês mais recente para o mais antigo', () => {
  const meses = balancoMensal([saida('2026-06-10', 1), saida('2026-08-10', 1)], []);
  assert.deepEqual(
    meses.map((m) => m.mes),
    ['2026-08', '2026-06'],
  );
});

test('balanco: soma só os meses com saída e conta os que não fecham', () => {
  assert.equal(FOLGA_BALANCO, 1.05);
  const resultado = balanco(
    [saida('2026-07-10', 1000), saida('2026-08-10', 500)],
    [
      // Julho: saiu o dobro do lançado — produção sub-lançada.
      dia('2026-07-10', 500),
      dia('2026-08-10', 500),
      // Junho tem produção e nenhuma saída: fica fora.
      dia('2026-06-10', 9000),
    ],
  );

  assert.equal(resultado.meses, 2);
  assert.equal(resultado.produzido, 1000, 'junho fora do recorte');
  assert.equal(resultado.saiu, 1500);
  assert.equal(resultado.razao, 1.5);
  assert.equal(resultado.mesesSemFechar, 1);
});
