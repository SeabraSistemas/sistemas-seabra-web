/**
 * CLÍNICA — a letalidade por suspeita, e o limite do que ela afirma.
 *
 * A regra central: a morte só conta como desfecho do caso se veio DENTRO da
 * janela. Um animal que teve diarreia em 2021 e morreu em 2026 não é letalidade
 * de diarreia — sem o corte, seria contado como se fosse.
 *
 * E a regra de leitura que o teste também protege: o ranking ordena por VOLUME
 * de casos, não por letalidade. Suspeita com dois casos e duas mortes dá 100% e
 * não é o problema da fazenda.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  JANELA_DESFECHO,
  MINIMO_PARA_LETALIDADE,
  SEM_SUSPEITA,
  morreuAposCaso,
  porSuspeita,
  reincidentes,
  resumoClinica,
  serieCasos,
} from '@/lib/adm/areas/clinica';
import type { LinhaCaso } from '@/lib/adm/areas/contrato';

function caso(parcial: Partial<LinhaCaso> & { caso_id: number }): LinhaCaso {
  return {
    propriedade_id: 1,
    animal_id: parcial.caso_id,
    numero_animal: String(parcial.caso_id),
    nome_animal: null,
    sexo: 'fêmea',
    categoria: 'Lactante',
    data_do_caso: '2026-05-10',
    suspeita: 'Pneumonia',
    suspeita_tipo: 'sistema',
    sinais: 'tosse',
    tratamento: null,
    data_obito: null,
    dias_ate_obito: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A janela — sequência, não causa
// ─────────────────────────────────────────────────────────────────────────────

test('morreuAposCaso: só conta a morte dentro da janela', () => {
  assert.equal(morreuAposCaso(caso({ caso_id: 1, dias_ate_obito: 3 })), true);
  assert.equal(morreuAposCaso(caso({ caso_id: 2, dias_ate_obito: JANELA_DESFECHO })), true);
  assert.equal(
    morreuAposCaso(caso({ caso_id: 3, dias_ate_obito: 1800 })),
    false,
    'morreu cinco anos depois — não é desfecho daquele caso',
  );
  assert.equal(morreuAposCaso(caso({ caso_id: 4, dias_ate_obito: null })), false);
});

test('morreuAposCaso: o mesmo dia conta — doença hiperaguda mata em horas', () => {
  assert.equal(morreuAposCaso(caso({ caso_id: 1, dias_ate_obito: 0 })), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Letalidade por suspeita
// ─────────────────────────────────────────────────────────────────────────────

test('porSuspeita: a letalidade é sobre os casos DAQUELA suspeita', () => {
  const suspeitas = porSuspeita([
    caso({ caso_id: 1, suspeita: 'Clostridiose', dias_ate_obito: 2 }),
    caso({ caso_id: 2, suspeita: 'Clostridiose', dias_ate_obito: 1 }),
    caso({ caso_id: 3, suspeita: 'Clostridiose' }),
    caso({ caso_id: 4, suspeita: 'Mastite subclínica' }),
  ]);

  const clostridiose = suspeitas.find((s) => s.suspeita === 'Clostridiose');
  const mastite = suspeitas.find((s) => s.suspeita === 'Mastite subclínica');

  assert.equal(clostridiose?.casos, 3);
  assert.equal(clostridiose?.mortes, 2);
  assert.ok(Math.abs((clostridiose?.letalidade ?? 0) - 2 / 3) < 1e-9);
  assert.equal(mastite?.letalidade, 0, 'zero morte é uma afirmação, e é boa notícia');
});

test('porSuspeita: ordena por VOLUME, não por letalidade', () => {
  const suspeitas = porSuspeita([
    // 100% de letalidade, mas dois casos.
    caso({ caso_id: 1, suspeita: 'Rara', dias_ate_obito: 1 }),
    caso({ caso_id: 2, suspeita: 'Rara', dias_ate_obito: 1 }),
    caso({ caso_id: 3, suspeita: 'Comum' }),
    caso({ caso_id: 4, suspeita: 'Comum' }),
    caso({ caso_id: 5, suspeita: 'Comum' }),
  ]);

  assert.equal(suspeitas[0].suspeita, 'Comum', 'o problema da fazenda é o volume, não o percentual');
  assert.ok(suspeitas[1].letalidade > suspeitas[0].letalidade);
});

test('porSuspeita: morte fora da janela NÃO entra na letalidade', () => {
  const suspeitas = porSuspeita([
    caso({ caso_id: 1, suspeita: 'Diarréia', dias_ate_obito: 1800 }),
    caso({ caso_id: 2, suspeita: 'Diarréia' }),
  ]);

  assert.equal(suspeitas[0].mortes, 0);
  assert.equal(suspeitas[0].letalidade, 0);
});

test('porSuspeita: caso sem suspeita cai num rótulo próprio, e não some', () => {
  const suspeitas = porSuspeita([caso({ caso_id: 1, suspeita: null })]);
  assert.equal(suspeitas[0].suspeita, SEM_SUSPEITA);
});

test('porSuspeita: preserva o tipo — suspeita criada pelo criador é vocabulário dele', () => {
  const suspeitas = porSuspeita([
    caso({ caso_id: 1, suspeita: 'Mastite clínica', suspeita_tipo: 'propriedade' }),
  ]);
  assert.equal(suspeitas[0].tipo, 'propriedade');
});

test('porSuspeita: conta ANIMAIS distintos além de casos — o mesmo animal pode voltar', () => {
  const suspeitas = porSuspeita([
    caso({ caso_id: 1, animal_id: 10, suspeita: 'Diarréia' }),
    caso({ caso_id: 2, animal_id: 10, suspeita: 'Diarréia' }),
  ]);

  assert.equal(suspeitas[0].casos, 2);
  assert.equal(suspeitas[0].animais, 1);
});

test('MINIMO_PARA_LETALIDADE existe para a tela não publicar percentual sobre três casos', () => {
  assert.equal(MINIMO_PARA_LETALIDADE, 5);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e reincidência
// ─────────────────────────────────────────────────────────────────────────────

test('resumoClinica: conta animais distintos, reincidentes e os denominadores de sinais e tratamento', () => {
  const resumo = resumoClinica([
    caso({ caso_id: 1, animal_id: 10, sinais: 'tosse', tratamento: 'antibiótico' }),
    caso({ caso_id: 2, animal_id: 10, sinais: null, tratamento: null }),
    caso({ caso_id: 3, animal_id: 20, sinais: '  ', tratamento: null }),
  ]);

  assert.equal(resumo.casos, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.reincidentes, 1);
  assert.equal(resumo.comSinais, 1, 'string em branco não conta como sinal descrito');
  assert.equal(resumo.comTratamento, 1);
});

test('resumoClinica: a letalidade geral usa a mesma janela', () => {
  const resumo = resumoClinica([
    caso({ caso_id: 1, dias_ate_obito: 5 }),
    caso({ caso_id: 2, dias_ate_obito: 900 }),
    caso({ caso_id: 3 }),
  ]);

  assert.equal(resumo.mortes, 1);
  assert.ok(Math.abs((resumo.letalidade ?? 0) - 1 / 3) < 1e-9);
});

test('resumoClinica: fazenda sem caso não vira NaN', () => {
  const resumo = resumoClinica([]);
  assert.equal(resumo.casos, 0);
  assert.equal(resumo.letalidade, null);
  assert.equal(resumo.ultimo, null);
});

test('reincidentes: só quem tem mais de um caso, com as suspeitas sem repetir', () => {
  const lista = reincidentes([
    caso({ caso_id: 1, animal_id: 10, suspeita: 'Diarréia' }),
    caso({ caso_id: 2, animal_id: 10, suspeita: 'Diarréia' }),
    caso({ caso_id: 3, animal_id: 10, suspeita: 'Pneumonia' }),
    caso({ caso_id: 4, animal_id: 20, suspeita: 'Diarréia' }),
  ]);

  assert.equal(lista.length, 1);
  assert.equal(lista[0].casos, 3);
  assert.deepEqual(lista[0].suspeitas, ['Diarréia', 'Pneumonia']);
});

test('reincidentes: marca quem morreu, mesmo que fora da janela — aqui é histórico do animal', () => {
  const lista = reincidentes([
    caso({ caso_id: 1, animal_id: 10, data_obito: '2026-12-01', dias_ate_obito: 900 }),
    caso({ caso_id: 2, animal_id: 10 }),
  ]);

  assert.equal(lista[0].morreu, true);
});

test('serieCasos: agrupa por mês, em ordem cronológica', () => {
  const serie = serieCasos([
    caso({ caso_id: 1, data_do_caso: '2026-05-10' }),
    caso({ caso_id: 2, data_do_caso: '2026-05-20' }),
    caso({ caso_id: 3, data_do_caso: '2026-01-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-05', valor: 2 },
  ]);
});
