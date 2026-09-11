/**
 * SERVIÇOS REPRODUTIVOS — o desfecho e o denominador da concepção.
 *
 * As regras que este arquivo protege:
 *
 *   · O DESFECHO SEGUE PRIORIDADE: parto > aborto > DG+ > DG− > retorno ao cio.
 *   · ABORTO É CONCEPÇÃO: a fêmea emprenhou; o que falhou foi a gestação, e isso
 *     é sanidade — não fertilidade do reprodutor.
 *   · SERVIÇO SEM DESFECHO CONHECIDO NÃO ENTRA NA TAXA, nem como sucesso nem
 *     como falha. O serviço deste mês ainda está gestando.
 *   · PATERNIDADE AMBÍGUA NÃO É CREDITADA a nenhum reprodutor.
 *
 * `hoje` é injetado em tudo que depende de data.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  JANELA_GESTACAO,
  RETORNO_CIO,
  TERMO_GESTACAO,
  concebeu,
  desfechoDe,
  distribuicaoDesfechos,
  listaDeAbortos,
  porMetodo,
  porOrdemParto,
  porReprodutor,
  resumoServicos,
  serieServicos,
} from '@/lib/adm/areas/servicos';
import type { LinhaServico } from '@/lib/adm/areas/contrato';

const HOJE = new Date('2026-09-10T00:00:00Z');

function servico(parcial: Partial<LinhaServico> & { animal_id: number }): LinhaServico {
  return {
    propriedade_id: 1,
    numero_animal: String(parcial.animal_id),
    nome_animal: null,
    ordem_parto: 2,
    data_servico: '2025-10-01',
    metodo: 'Monta controlada',
    reprodutor: 'Bode A',
    reprodutores_no_servico: 1,
    coberturas: 1,
    proximo_servico: null,
    dias_ate_proximo_servico: null,
    data_dg: null,
    resultado_dg: null,
    dias_ate_dg: null,
    data_parto: null,
    data_aborto: null,
    categoria_pos_aborto: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Desfecho
// ─────────────────────────────────────────────────────────────────────────────

test('desfechoDe: parto vence tudo, mesmo com DG negativo registrado', () => {
  assert.equal(
    desfechoDe(servico({ animal_id: 1, data_parto: '2026-02-28', resultado_dg: 'vazia' }), HOJE),
    'pariu',
    'o DG errou; o parto é o fato',
  );
});

test('desfechoDe: aborto vence DG positivo', () => {
  assert.equal(
    desfechoDe(servico({ animal_id: 1, data_aborto: '2026-01-10', resultado_dg: 'gestante' }), HOJE),
    'abortou',
  );
});

test('desfechoDe: DG decide quando não há parto nem aborto', () => {
  assert.equal(desfechoDe(servico({ animal_id: 1, resultado_dg: 'gestante' }), HOJE), 'gestante');
  assert.equal(desfechoDe(servico({ animal_id: 2, resultado_dg: 'vazia' }), HOJE), 'vazia');
});

test('desfechoDe: novo serviço entre 18 e 25 dias sem DG é retorno ao cio', () => {
  assert.equal(
    desfechoDe(servico({ animal_id: 1, dias_ate_proximo_servico: 21 }), HOJE),
    'retornou_cio',
  );
  assert.equal(RETORNO_CIO.de, 18);
  assert.equal(RETORNO_CIO.ate, 25);
});

test('desfechoDe: novo serviço fora da janela do cio NÃO é retorno — pode ser outra estação', () => {
  assert.equal(
    desfechoDe(servico({ animal_id: 1, dias_ate_proximo_servico: 200 }), HOJE),
    'sem_informacao',
  );
});

test('desfechoDe: serviço recente sem nada é "aguardando", não falha', () => {
  const recente = new Date(HOJE.getTime() - 40 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(desfechoDe(servico({ animal_id: 1, data_servico: recente }), HOJE), 'aguardando');
});

test('desfechoDe: serviço antigo sem nada é "sem informação" — o desfecho aconteceu e ninguém lançou', () => {
  const antigo = new Date(HOJE.getTime() - (JANELA_GESTACAO + 30) * 86_400_000).toISOString().slice(0, 10);
  assert.equal(desfechoDe(servico({ animal_id: 1, data_servico: antigo }), HOJE), 'sem_informacao');
});

test('concebeu: aborto é concepção — a falha foi da gestação, não da cobertura', () => {
  assert.equal(concebeu('pariu'), true);
  assert.equal(concebeu('abortou'), true);
  assert.equal(concebeu('gestante'), true);
  assert.equal(concebeu('vazia'), false);
  assert.equal(concebeu('retornou_cio'), false);
  assert.equal(concebeu('aguardando'), null);
  assert.equal(concebeu('sem_informacao'), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e denominador
// ─────────────────────────────────────────────────────────────────────────────

test('resumoServicos: a taxa divide só pelos serviços com desfecho CONHECIDO', () => {
  const recente = new Date(HOJE.getTime() - 20 * 86_400_000).toISOString().slice(0, 10);
  const resumo = resumoServicos(
    [
      servico({ animal_id: 1, data_parto: '2026-03-01' }),
      servico({ animal_id: 2, resultado_dg: 'vazia' }),
      // Recente: fora do denominador.
      servico({ animal_id: 3, data_servico: recente }),
      // Antigo sem nada: fora do denominador.
      servico({ animal_id: 4, data_servico: '2024-01-01' }),
    ],
    HOJE,
  );

  assert.equal(resumo.servicos, 4);
  assert.equal(resumo.comDesfecho, 2);
  assert.equal(resumo.concebeu, 1);
  assert.equal(resumo.taxa, 0.5, 'e não 25%, que puniria o serviço deste mês');
  assert.equal(resumo.aguardando, 1);
  assert.equal(resumo.semInformacao, 1);
});

test('resumoServicos: serviços por concepção e taxa de aborto sobre as concepções', () => {
  const resumo = resumoServicos(
    [
      servico({ animal_id: 1, data_parto: '2026-03-01' }),
      servico({ animal_id: 2, data_aborto: '2026-01-01' }),
      servico({ animal_id: 3, resultado_dg: 'vazia' }),
      servico({ animal_id: 4, resultado_dg: 'vazia' }),
    ],
    HOJE,
  );

  assert.equal(resumo.concebeu, 2);
  assert.equal(resumo.servicosPorConcepcao, 2, '4 serviços com desfecho para 2 prenhezes');
  assert.equal(resumo.abortos, 1);
  assert.equal(resumo.taxaAborto, 0.5, 'um aborto em duas concepções');
});

test('resumoServicos: soma coberturas e conta os serviços de dupla cobertura', () => {
  const resumo = resumoServicos(
    [servico({ animal_id: 1, coberturas: 2 }), servico({ animal_id: 2, coberturas: 1 })],
    HOJE,
  );

  assert.equal(resumo.coberturas, 3);
  assert.equal(resumo.servicosMultiplos, 1);
});

test('resumoServicos: fazenda sem serviço não vira NaN', () => {
  const resumo = resumoServicos([], HOJE);
  assert.equal(resumo.servicos, 0);
  assert.equal(resumo.taxa, null);
  assert.equal(resumo.servicosPorConcepcao, null);
  assert.equal(resumo.taxaAborto, null);
});

test('distribuicaoDesfechos: os sete desfechos saem sempre, na ordem de prioridade', () => {
  const lista = distribuicaoDesfechos([servico({ animal_id: 1, data_parto: '2026-03-01' })], HOJE);
  assert.equal(lista.length, 7);
  assert.equal(lista[0].desfecho, 'pariu');
  assert.equal(lista[0].servicos, 1);
  assert.equal(lista[0].concebeu, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Por reprodutor — a entrega central
// ─────────────────────────────────────────────────────────────────────────────

test('porReprodutor: taxa por bode, com o denominador próprio de cada um', () => {
  const lista = porReprodutor(
    [
      servico({ animal_id: 1, reprodutor: 'Bode A', data_parto: '2026-03-01' }),
      servico({ animal_id: 2, reprodutor: 'Bode A', resultado_dg: 'vazia' }),
      servico({ animal_id: 3, reprodutor: 'Bode B', data_parto: '2026-03-01' }),
    ],
    HOJE,
  );

  const a = lista.find((r) => r.reprodutor === 'Bode A');
  assert.equal(a?.servicos, 2);
  assert.equal(a?.taxa, 0.5);
});

test('porReprodutor: paternidade ambígua NÃO é creditada a ninguém', () => {
  const lista = porReprodutor(
    [servico({ animal_id: 1, reprodutor: 'Bode A', reprodutores_no_servico: 2, data_parto: '2026-03-01' })],
    HOJE,
  );
  assert.deepEqual(lista, []);
});

test('porReprodutor: ordena por VOLUME, não pela taxa — o de 100% com 1 serviço não é o melhor', () => {
  const lista = porReprodutor(
    [
      servico({ animal_id: 1, reprodutor: 'Raro', data_parto: '2026-03-01' }),
      servico({ animal_id: 2, reprodutor: 'Trabalhador', resultado_dg: 'vazia' }),
      servico({ animal_id: 3, reprodutor: 'Trabalhador', data_parto: '2026-03-01' }),
      servico({ animal_id: 4, reprodutor: 'Trabalhador', data_parto: '2026-03-01' }),
    ],
    HOJE,
  );

  assert.equal(lista[0].reprodutor, 'Trabalhador');
});

test('porReprodutor: serviço sem reprodutor identificado fica fora', () => {
  assert.deepEqual(porReprodutor([servico({ animal_id: 1, reprodutor: null })], HOJE), []);
});

// ─────────────────────────────────────────────────────────────────────────────
// Por método, ordem de parto, série e abortos
// ─────────────────────────────────────────────────────────────────────────────

test('porMetodo: agrupa por método com a taxa de cada um', () => {
  const grupos = porMetodo(
    [
      servico({ animal_id: 1, metodo: 'Inseminação', data_parto: '2026-03-01' }),
      servico({ animal_id: 2, metodo: 'Inseminação', resultado_dg: 'vazia' }),
      servico({ animal_id: 3, metodo: 'Monta controlada', data_parto: '2026-03-01' }),
    ],
    HOJE,
  );

  assert.equal(grupos.find((g) => g.rotulo === 'Inseminação')?.taxa, 0.5);
  assert.equal(grupos.find((g) => g.rotulo === 'Monta controlada')?.taxa, 1);
});

test('porOrdemParto: separa nulípara (0) de primípara e multípara, e some com faixa vazia', () => {
  const grupos = porOrdemParto(
    [
      servico({ animal_id: 1, ordem_parto: 0, data_parto: '2026-03-01' }),
      servico({ animal_id: 2, ordem_parto: 5, resultado_dg: 'vazia' }),
    ],
    HOJE,
  );

  assert.deepEqual(
    grupos.map((g) => g.rotulo),
    ['Nulípara (1ª cobertura)', '4ª cria ou mais'],
  );
});

test('serieServicos: agrupa por mês, em ordem cronológica', () => {
  const serie = serieServicos([
    servico({ animal_id: 1, data_servico: '2025-10-01' }),
    servico({ animal_id: 2, data_servico: '2025-10-20' }),
    servico({ animal_id: 3, data_servico: '2025-04-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2025-04', valor: 1 },
    { periodo: '2025-10', valor: 2 },
  ]);
});

test('listaDeAbortos: calcula o dia da gestação em que o aborto aconteceu', () => {
  const lista = listaDeAbortos([
    servico({ animal_id: 1, data_servico: '2025-10-01', data_aborto: '2026-01-19' }),
    servico({ animal_id: 2 }),
  ]);

  assert.equal(lista.length, 1);
  assert.equal(lista[0].diasGestacao, 110, 'terço final — aponta causa infecciosa');
  assert.equal(lista[0].aTermo, false);
});

test('listaDeAbortos: "aborto" com 145+ dias é parto a termo, marcado à parte', () => {
  // Regressão: metade dos abortos da base foi lançada com 145 a 159 dias — cria
  // morta ao nascer registrada como aborto.
  assert.equal(TERMO_GESTACAO, 145);
  const [aborto] = listaDeAbortos([
    servico({ animal_id: 1, data_servico: '2025-10-01', data_aborto: '2026-03-01' }),
  ]);
  assert.equal(aborto.diasGestacao, 151);
  assert.equal(aborto.aTermo, true);
});

test('listaDeAbortos: serviço com parto registrado sai — é a mesma população do desfecho', () => {
  const lista = listaDeAbortos([
    servico({ animal_id: 1, data_aborto: '2026-01-10', data_parto: '2026-02-28' }),
  ]);
  assert.deepEqual(lista, []);
});

test('resumoServicos: aborto a termo fica fora da taxa de aborto, mas continua sendo concepção', () => {
  const resumo = resumoServicos(
    [
      // Antes do termo: aborto de verdade.
      servico({ animal_id: 1, data_servico: '2025-10-01', data_aborto: '2026-01-19' }),
      // A termo (151 d): natimorto lançado como aborto.
      servico({ animal_id: 2, data_servico: '2025-10-01', data_aborto: '2026-03-01' }),
      servico({ animal_id: 3, data_parto: '2026-03-01' }),
      servico({ animal_id: 4, data_parto: '2026-03-01' }),
    ],
    HOJE,
  );

  assert.equal(resumo.concebeu, 4, 'os dois abortos contam como concepção');
  assert.equal(resumo.abortos, 2);
  assert.equal(resumo.abortosATermo, 1);
  assert.equal(resumo.taxaAborto, 0.25, 'um aborto de verdade em quatro concepções — não 50%');
});
