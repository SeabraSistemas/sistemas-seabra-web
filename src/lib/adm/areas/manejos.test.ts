/**
 * MANEJO — o desmembramento por tipo, e a contagem que não pode inflar.
 *
 * A regra que este arquivo existe para proteger: A LINHA NÃO É O MANEJO. A view
 * faz unnest de `tipo_manejo`, então uma ida ao curral que mediu FAMACHA, escore
 * e casco vira três linhas. Contar linhas multiplicaria o trabalho da fazenda
 * pelo número de coisas medidas de uma vez — e faria um cliente organizado, que
 * mede tudo numa passada, parecer três vezes mais ativo que outro.
 *
 * E uma regra sobre o que NÃO se faz: `casco_status` não é normalizado. Ela
 * mistura "o casqueamento foi feito?" com "como está o casco?", e tem 29 linhas
 * com o texto 'False' — um booleano vazado. Traduzir isso seria adivinhar.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FAMACHA_CRITICO,
  contarPorTipo,
  escalaFamacha,
  faixasDeEscore,
  lerTipo,
  medicoesCriticas,
  resumoManejos,
  rotuloDoTipo,
  serieManejos,
  valoresDeCasco,
} from '@/lib/adm/areas/manejos';
import type { LinhaManejo } from '@/lib/adm/areas/contrato';

function manejo(parcial: Partial<LinhaManejo> & { manejo_id: number; tipo: string }): LinhaManejo {
  return {
    propriedade_id: 1,
    animal_id: parcial.manejo_id,
    numero_animal: String(parcial.manejo_id),
    nome_animal: null,
    categoria: 'Lactante',
    data_manejo: '2026-07-10',
    famacha: null,
    escore_corporal: null,
    casco_status: null,
    protocolo_sanitario: null,
    diagnostico_gestacao: null,
    dias_gestacao: null,
    observacao: null,
    cmt_me: null,
    cmt_md: null,
    sessao_coletivo_id: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A contagem que não pode inflar
// ─────────────────────────────────────────────────────────────────────────────

test('resumoManejos: conta MANEJOS distintos, não linhas', () => {
  // Uma ida ao curral que mediu três coisas.
  const resumo = resumoManejos([
    manejo({ manejo_id: 1, tipo: 'famacha', animal_id: 10 }),
    manejo({ manejo_id: 1, tipo: 'peso', animal_id: 10 }),
    manejo({ manejo_id: 1, tipo: 'casco', animal_id: 10 }),
  ]);

  assert.equal(resumo.manejos, 1, 'uma ida ao curral, não três');
  assert.equal(resumo.linhas, 3);
  assert.equal(resumo.animais, 1);
  assert.equal(resumo.tipos, 3);
  assert.equal(resumo.multiTipo, 1);
});

test('resumoManejos: manejo de um tipo só não conta como multi-tipo', () => {
  const resumo = resumoManejos([
    manejo({ manejo_id: 1, tipo: 'famacha' }),
    manejo({ manejo_id: 2, tipo: 'famacha' }),
  ]);

  assert.equal(resumo.manejos, 2);
  assert.equal(resumo.multiTipo, 0);
});

test('resumoManejos: dias de curral são datas distintas', () => {
  const resumo = resumoManejos([
    manejo({ manejo_id: 1, tipo: 'famacha', data_manejo: '2026-07-10' }),
    manejo({ manejo_id: 2, tipo: 'famacha', data_manejo: '2026-07-10' }),
    manejo({ manejo_id: 3, tipo: 'famacha', data_manejo: '2026-01-05' }),
  ]);

  assert.equal(resumo.dias, 2);
  assert.equal(resumo.primeira, '2026-01-05');
  assert.equal(resumo.ultima, '2026-07-10');
});

test('resumoManejos: sem manejo nenhum não vira NaN', () => {
  const resumo = resumoManejos([]);
  assert.equal(resumo.manejos, 0);
  assert.equal(resumo.ultima, null);
});

test('contarPorTipo: a fração é sobre manejos DISTINTOS, e a soma pode passar de 100%', () => {
  const tipos = contarPorTipo([
    manejo({ manejo_id: 1, tipo: 'famacha' }),
    manejo({ manejo_id: 1, tipo: 'peso' }),
    manejo({ manejo_id: 2, tipo: 'famacha' }),
  ]);

  const famacha = tipos.find((t) => t.chave === 'famacha');
  const peso = tipos.find((t) => t.chave === 'peso');
  assert.equal(famacha?.manejos, 2);
  assert.equal(famacha?.fracao, 1, 'FAMACHA foi medido nas duas idas ao curral');
  assert.equal(peso?.fracao, 0.5);
});

test('contarPorTipo: tipo sem nenhum manejo não aparece na lista', () => {
  const tipos = contarPorTipo([manejo({ manejo_id: 1, tipo: 'famacha' })]);
  assert.equal(tipos.length, 1);
  assert.equal(tipos[0].chave, 'famacha');
});

test('lerTipo e rotuloDoTipo: só tipo conhecido vira filtro; o rótulo cai no cru se for novo', () => {
  assert.equal(lerTipo('famacha'), 'famacha');
  assert.equal(lerTipo('inventado'), null);
  assert.equal(lerTipo(undefined), null);
  assert.equal(rotuloDoTipo('famacha'), 'FAMACHA');
  assert.equal(rotuloDoTipo('tipo_novo_do_app'), 'tipo_novo_do_app');
});

// ─────────────────────────────────────────────────────────────────────────────
// FAMACHA — escala invertida
// ─────────────────────────────────────────────────────────────────────────────

test('escalaFamacha: os cinco graus saem sempre, na ORDEM DA ESCALA', () => {
  const escala = escalaFamacha([manejo({ manejo_id: 1, tipo: 'famacha', famacha: 5 })]);

  assert.deepEqual(
    escala.map((g) => g.grau),
    [1, 2, 3, 4, 5],
    'nunca ordenada por volume — é escala, não ranking',
  );
  assert.equal(escala[4].medicoes, 1);
});

test('escalaFamacha: manejo multi-tipo conta a medição UMA vez, não uma por linha', () => {
  // Regressão pega no dado real: a escala da fazenda 258 somava 1.009 medições
  // de FAMACHA em 600 manejos, porque o unnest repete o valor em cada linha de
  // tipo do mesmo manejo.
  const escala = escalaFamacha([
    manejo({ manejo_id: 1, tipo: 'famacha', famacha: 2 }),
    manejo({ manejo_id: 1, tipo: 'peso', famacha: 2 }),
    manejo({ manejo_id: 1, tipo: 'escore_condicao_corporal', famacha: 2 }),
  ]);

  assert.equal(escala[1].medicoes, 1, 'uma ida ao curral, uma medição de FAMACHA');
  assert.equal(escala[1].fracao, 1);
});

test('faixasDeEscore: mesma regra — manejo multi-tipo não multiplica a medição', () => {
  const faixas = faixasDeEscore([
    manejo({ manejo_id: 1, tipo: 'famacha', escore_corporal: 3 }),
    manejo({ manejo_id: 1, tipo: 'escore_condicao_corporal', escore_corporal: 3 }),
  ]);

  assert.equal(faixas.find((f) => f.rotulo === '3,0')?.medicoes, 1);
});

test('escalaFamacha: grau 4 e 5 são os críticos — o corte do protocolo', () => {
  const escala = escalaFamacha([
    manejo({ manejo_id: 1, tipo: 'famacha', famacha: 3 }),
    manejo({ manejo_id: 2, tipo: 'famacha', famacha: 4 }),
    manejo({ manejo_id: 3, tipo: 'famacha', famacha: 5 }),
  ]);

  assert.equal(medicoesCriticas(escala), 2);
  assert.equal(FAMACHA_CRITICO, 4);
});

test('escalaFamacha: valor fora de 1..5 não entra no denominador', () => {
  const escala = escalaFamacha([
    manejo({ manejo_id: 1, tipo: 'famacha', famacha: 3 }),
    manejo({ manejo_id: 2, tipo: 'famacha', famacha: 9 }),
    manejo({ manejo_id: 3, tipo: 'famacha', famacha: null }),
  ]);

  assert.equal(escala[2].fracao, 1, 'o grau 3 é 100% das medições válidas');
});

test('escalaFamacha: sem medição nenhuma a fração é null, e não 0%', () => {
  const escala = escalaFamacha([manejo({ manejo_id: 1, tipo: 'peso' })]);
  assert.ok(escala.every((g) => g.medicoes === 0 && g.fracao === null));
});

// ─────────────────────────────────────────────────────────────────────────────
// Escore corporal
// ─────────────────────────────────────────────────────────────────────────────

test('faixasDeEscore: os DOIS extremos são alerta — magro não emprenha, gordo tem parto difícil', () => {
  const faixas = faixasDeEscore([manejo({ manejo_id: 1, tipo: 'escore_condicao_corporal', escore_corporal: 3 })]);

  assert.equal(faixas[0].alerta, true, 'até 2,0');
  assert.equal(faixas[1].alerta, true, '2,5');
  assert.equal(faixas[2].alerta, false, '3,0');
  assert.equal(faixas[faixas.length - 1].alerta, true, 'acima de 4,0');
});

test('faixasDeEscore: valor quebrado cai na faixa de cima — 2,75 vira "3,0"', () => {
  const faixas = faixasDeEscore([
    manejo({ manejo_id: 1, tipo: 'escore_condicao_corporal', escore_corporal: 2.75 }),
  ]);

  assert.equal(faixas.find((f) => f.rotulo === '3,0')?.medicoes, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Casco — a coluna que NÃO se normaliza
// ─────────────────────────────────────────────────────────────────────────────

test('valoresDeCasco: entrega os valores CRUS, marcando o que não é Feito nem A fazer', () => {
  const valores = valoresDeCasco([
    manejo({ manejo_id: 1, tipo: 'casco', casco_status: 'Feito' }),
    manejo({ manejo_id: 2, tipo: 'casco', casco_status: 'False' }),
    manejo({ manejo_id: 3, tipo: 'casco', casco_status: 'A fazer' }),
    manejo({ manejo_id: 4, tipo: 'casco', casco_status: 'trincado' }),
  ]);

  const porValor = new Map(valores.map((v) => [v.valor, v]));
  assert.equal(porValor.get('Feito')?.suspeito, false);
  assert.equal(porValor.get('A fazer')?.suspeito, false);
  assert.equal(porValor.get('False')?.suspeito, true, 'booleano vazado para coluna de texto');
  assert.equal(porValor.get('trincado')?.suspeito, true, 'responde outra pergunta');
});

test('valoresDeCasco: conta manejos distintos e ordena do mais frequente', () => {
  const valores = valoresDeCasco([
    manejo({ manejo_id: 1, tipo: 'casco', casco_status: 'Feito' }),
    manejo({ manejo_id: 1, tipo: 'famacha', casco_status: 'Feito' }),
    manejo({ manejo_id: 2, tipo: 'casco', casco_status: 'Feito' }),
    manejo({ manejo_id: 3, tipo: 'casco', casco_status: 'A fazer' }),
  ]);

  assert.equal(valores[0].valor, 'Feito');
  assert.equal(valores[0].manejos, 2, 'o manejo 1 aparece em duas linhas e conta uma vez');
});

// ─────────────────────────────────────────────────────────────────────────────
// Série
// ─────────────────────────────────────────────────────────────────────────────

test('serieManejos: conta manejos distintos por mês — multi-tipo não vira pico de trabalho', () => {
  const serie = serieManejos([
    manejo({ manejo_id: 1, tipo: 'famacha', data_manejo: '2026-07-10' }),
    manejo({ manejo_id: 1, tipo: 'peso', data_manejo: '2026-07-10' }),
    manejo({ manejo_id: 2, tipo: 'famacha', data_manejo: '2026-01-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-07', valor: 1 },
  ]);
});
