import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { desempacotar, empacotar } from '@/lib/painel/pacote';

type Registro = { id: string; peso: number | null; fazenda: string };

const ITENS: Registro[] = [
  { id: 'A1', peso: 420, fazenda: 'Inhumas' },
  { id: 'A2', peso: null, fazenda: 'Campina grande' },
];

describe('empacotar / desempacotar', () => {
  test('round-trip preserva os itens', () => {
    const pacote = empacotar(ITENS, ['id', 'peso', 'fazenda']);
    assert.deepEqual(desempacotar(pacote), ITENS);
  });

  test('so manda os campos escolhidos, na mesma ordem', () => {
    const pacote = empacotar(ITENS, ['id', 'fazenda']);
    assert.deepEqual(pacote.campos, ['id', 'fazenda']);
    assert.deepEqual(pacote.linhas[0], ['A1', 'Inhumas']);
  });

  test('lista vazia empacota e desempacota vazio', () => {
    const pacote = empacotar<Registro>([], ['id', 'peso', 'fazenda']);
    assert.deepEqual(desempacotar(pacote), []);
  });
});
