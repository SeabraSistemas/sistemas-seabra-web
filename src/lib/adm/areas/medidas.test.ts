/**
 * MEDIDAS — a fita métrica, e o campo trocado.
 *
 * A regra que este arquivo protege é a separação do implausível: o dado real tem
 * seis medições do MESMO dia com perímetro torácico de 19 a 29 cm em animais de
 * 70 a 78 cm de altura. Não é ruído aleatório — é a largura de peito preenchida
 * no campo do perímetro, o dia inteiro. Deixá-las entrar puxa a média do rebanho
 * para baixo e some com o sinal de que houve erro de coleta.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MEDIDAS,
  PERIMETRO_MINIMO_CM,
  diasComProblema,
  perfilDasMedidas,
  resumoMedidas,
  separarImplausiveis,
  serieMedicoes,
} from '@/lib/adm/areas/medidas';
import type { LinhaMedida } from '@/lib/adm/areas/contrato';

function medida(parcial: Partial<LinhaMedida> & { medida_id: number }): LinhaMedida {
  return {
    propriedade_id: 1,
    animal_id: parcial.medida_id,
    numero_animal: String(parcial.medida_id),
    nome_animal: null,
    sexo: 'fêmea',
    data_medida: '2026-08-08',
    tecnico_id: 9,
    tipo: 'fêmea',
    perimetro_toracico: 90,
    altura: 78,
    altura_garupa: 76,
    largura_peito: 22,
    largura_garupa: 20,
    ligamento_posterior: 7,
    ligamento_suspensorio: 4,
    volume_ubere: 10,
    diametro_tetos: 4,
    circunferencia_escrotal: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Implausível
// ─────────────────────────────────────────────────────────────────────────────

test('separarImplausiveis: perímetro abaixo do piso sai das médias', () => {
  const { validas, implausiveis } = separarImplausiveis([
    medida({ medida_id: 1, perimetro_toracico: 90 }),
    // O caso real: perímetro de 22 cm com altura de 78 cm — é a largura de peito.
    medida({ medida_id: 2, perimetro_toracico: 22, altura: 78 }),
  ]);

  assert.deepEqual(
    validas.map((m) => m.medida_id),
    [1],
  );
  assert.equal(implausiveis.length, 1);
});

test('separarImplausiveis: o piso é inclusivo pelo lado de cima — 30 cm passa', () => {
  const { validas } = separarImplausiveis([
    medida({ medida_id: 1, perimetro_toracico: PERIMETRO_MINIMO_CM }),
  ]);
  assert.equal(validas.length, 1);
});

test('separarImplausiveis: medição SEM perímetro não é implausível — é medição incompleta', () => {
  const { validas, implausiveis } = separarImplausiveis([
    medida({ medida_id: 1, perimetro_toracico: null }),
  ]);

  assert.equal(validas.length, 1);
  assert.equal(implausiveis.length, 0);
});

test('diasComProblema: agrupa por data, do mais recente para o mais antigo', () => {
  const { implausiveis } = separarImplausiveis([
    medida({ medida_id: 1, perimetro_toracico: 22, data_medida: '2025-07-26' }),
    medida({ medida_id: 2, perimetro_toracico: 19, data_medida: '2025-07-26' }),
    medida({ medida_id: 3, perimetro_toracico: 12, data_medida: '2026-08-11' }),
  ]);

  assert.deepEqual(diasComProblema(implausiveis), [
    { data: '2026-08-11', medicoes: 1 },
    { data: '2025-07-26', medicoes: 2 },
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Perfil
// ─────────────────────────────────────────────────────────────────────────────

test('perfilDasMedidas: as dez medidas saem sempre, na ordem da ficha', () => {
  const perfil = perfilDasMedidas([medida({ medida_id: 1 })]);
  assert.equal(perfil.length, MEDIDAS.length);
  assert.equal(perfil[0].chave, 'perimetro_toracico');
});

test('perfilDasMedidas: cada medida tem o SEU denominador — escrotal só conta macho', () => {
  const perfil = perfilDasMedidas([
    medida({ medida_id: 1, circunferencia_escrotal: null }),
    medida({ medida_id: 2, tipo: 'macho', circunferencia_escrotal: 30, volume_ubere: null }),
  ]);

  const escrotal = perfil.find((p) => p.chave === 'circunferencia_escrotal');
  assert.equal(escrotal?.medicoes, 1);
  assert.equal(escrotal?.media, 30);

  const ubere = perfil.find((p) => p.chave === 'volume_ubere');
  assert.equal(ubere?.medicoes, 1, 'o macho não tem úbere para medir');
});

test('perfilDasMedidas: medida sem nenhuma medição devolve média null, não zero', () => {
  const perfil = perfilDasMedidas([medida({ medida_id: 1, circunferencia_escrotal: null })]);
  const escrotal = perfil.find((p) => p.chave === 'circunferencia_escrotal');
  assert.equal(escrotal?.media, null);
  assert.equal(escrotal?.minimo, null);
});

test('perfilDasMedidas: mínimo e máximo saem junto da média — é o que denuncia outlier', () => {
  const perfil = perfilDasMedidas([
    medida({ medida_id: 1, perimetro_toracico: 80 }),
    medida({ medida_id: 2, perimetro_toracico: 100 }),
  ]);

  const perimetro = perfil.find((p) => p.chave === 'perimetro_toracico');
  assert.equal(perimetro?.media, 90);
  assert.equal(perimetro?.minimo, 80);
  assert.equal(perimetro?.maximo, 100);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoMedidas: conta animais distintos e quantos foram remedidos', () => {
  const resumo = resumoMedidas([
    medida({ medida_id: 1, animal_id: 10 }),
    medida({ medida_id: 2, animal_id: 10, data_medida: '2025-01-10' }),
    medida({ medida_id: 3, animal_id: 20 }),
  ]);

  assert.equal(resumo.medicoes, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.remedidos, 1);
});

test('resumoMedidas: junta as duas grafias de fêmea — a mesma regra da AML, importada', () => {
  const resumo = resumoMedidas([
    medida({ medida_id: 1, tipo: 'fêmea' }),
    medida({ medida_id: 2, tipo: 'femea' }),
    medida({ medida_id: 3, tipo: 'macho' }),
  ]);

  assert.equal(resumo.femeas, 2);
  assert.equal(resumo.machos, 1);
});

test('resumoMedidas: fazenda sem medição não vira NaN', () => {
  const resumo = resumoMedidas([]);
  assert.equal(resumo.medicoes, 0);
  assert.equal(resumo.perimetroMedio, null);
  assert.equal(resumo.primeira, null);
});

test('serieMedicoes: agrupa por mês, em ordem cronológica', () => {
  const serie = serieMedicoes([
    medida({ medida_id: 1, data_medida: '2026-08-08' }),
    medida({ medida_id: 2, data_medida: '2026-08-26' }),
    medida({ medida_id: 3, data_medida: '2024-01-20' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2024-01', valor: 1 },
    { periodo: '2026-08', valor: 2 },
  ]);
});
