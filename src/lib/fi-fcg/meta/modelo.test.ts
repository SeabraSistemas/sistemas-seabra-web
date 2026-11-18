import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  alertas,
  capacidade,
  completudePrenhez,
  indicadores,
  projetar,
  reposicaoProximoAno,
  uaAtual,
  type Contexto,
  type DadosFazenda,
} from '@/lib/fi-fcg/meta/modelo';
import { CAMPOS, validarValor } from '@/lib/fi-fcg/meta/campos';

// Fazenda Inhumas (739), números lidos no banco em 18/11/2026 (faixas abreviadas).
const INHUMAS: DadosFazenda = {
  propriedade_id: 739,
  lido_em: '2026-11-18T15:00:00Z',
  estacoes: [
    { y: 2024, tocadas: 1290, prenhes: 1196, primeiro_toque: '2024-06-25', ultimo_toque: '2024-08-09', nascidos_vivos: 1051, natimortos: 0, vivos_210_elegiveis: 1051, mortos_antes_210: 29, pesados_desmama: 901, kg_desmama: 190849 },
    { y: 2025, tocadas: 1570, prenhes: 1281, primeiro_toque: '2025-01-06', ultimo_toque: '2025-07-30', nascidos_vivos: 1202, natimortos: 0, vivos_210_elegiveis: 1202, mortos_antes_210: 12, pesados_desmama: 1066, kg_desmama: 236799 },
    { y: 2026, tocadas: 1458, prenhes: 1164, primeiro_toque: '2026-02-11', ultimo_toque: '2026-07-31', nascidos_vivos: 341, natimortos: 0, vivos_210_elegiveis: 0, mortos_antes_210: 8, pesados_desmama: 0, kg_desmama: 0 },
  ],
  anual: [
    { y: 2024, vacas_inicio: 1285, vacas_baixa: 38, vacas_morte: 1, novilhas_entraram: 3 },
    { y: 2025, vacas_inicio: 1250, vacas_baixa: 71, vacas_morte: 13, novilhas_entraram: 300 },
    { y: 2026, vacas_inicio: 1479, vacas_baixa: 179, vacas_morte: 19, novilhas_entraram: 7 },
  ],
  faixas: [
    { sexo: 'femea', faixa: '0', n: 223, com_peso: 45, soma_peso: 7356 },
    { sexo: 'femea', faixa: '1', n: 42, com_peso: 20, soma_peso: 5554 },
    { sexo: 'femea', faixa: '2', n: 179, com_peso: 174, soma_peso: 63404 },
    { sexo: 'femea', faixa: '4', n: 283, com_peso: 283, soma_peso: 130438 },
    { sexo: 'femea', faixa: '10', n: 192, com_peso: 185, soma_peso: 92516 },
    { sexo: 'femea', faixa: '12', n: 90, com_peso: 85, soma_peso: 43916 },
    { sexo: 'femea', faixa: '13', n: 86, com_peso: 83, soma_peso: 40304 },
    { sexo: 'macho', faixa: 'touro', n: 16, com_peso: 14, soma_peso: 5300 },
    { sexo: 'macho', faixa: '0', n: 319, com_peso: 123, soma_peso: 23180 },
  ],
  vazias_ultimo_toque: 256,
  ultimos_lancamentos: { toque: '2026-10-19', parto: '2026-11-13', pesagem: '2026-10-27', baixa: '2026-11-13' },
};

const HOJE = new Date('2026-11-18T12:00:00Z');
const ctx = (p: Contexto['parametros'] = {}, area: number | null = null): Contexto => ({ hoje: HOJE, fazendas: [INHUMAS], parametros: p, areaUtil: area });
const by = (c: Contexto, k: string) => indicadores(c).find((i) => i.chave === k)!;

describe('estações', () => {
  test('2024 é parcial (o histórico começa em jun/2024); 2025 e 2026 completas para prenhez', () => {
    assert.equal(completudePrenhez(INHUMAS.estacoes[0], HOJE), 'parcial');
    assert.equal(completudePrenhez(INHUMAS.estacoes[1], HOJE), 'completa');
    assert.equal(completudePrenhez(INHUMAS.estacoes[2], HOJE), 'completa');
  });
});

describe('indicadores', () => {
  test('prenhez: atual 2026 (1164/1458), anterior 2025, média de 2 estações', () => {
    const i = by(ctx(), 'prenhez');
    assert.equal(i.atual?.y, 2026);
    assert.ok(Math.abs((i.atual?.valor ?? 0) - 1164 / 1458) < 1e-9);
    assert.equal(i.anterior?.y, 2025);
    assert.equal(i.media.n, 2);
    assert.equal(i.meta.origem, 'sugerida');
    assert.ok(i.meta.fontes.length > 0, 'meta sugerida sempre com fonte');
  });

  test('nascidos vivos: 2026 em andamento, atual é 2025', () => {
    const i = by(ctx(), 'nascidos');
    assert.equal(i.atual?.y, 2025);
    assert.equal(i.pontos.find((p) => p.y === 2026)?.completude, 'andamento');
  });

  test('desmama e mortalidade pela cria viva aos 210 dias', () => {
    assert.ok(Math.abs((by(ctx(), 'desmama').atual?.valor ?? 0) - (1202 - 12) / 1570) < 1e-9);
    assert.ok(Math.abs((by(ctx(), 'mortalidade').atual?.valor ?? 0) - 12 / 1202) < 1e-9);
  });

  test('mortalidade abaixo de 2% gera aviso de subnotificação', () => {
    assert.ok(by(ctx(), 'mortalidade').avisos.some((a) => a.includes('2%')));
  });

  test('kg por matriz: 236.799 kg ÷ 1.570 tocadas', () => {
    assert.ok(Math.abs((by(ctx(), 'kg_matriz').atual?.valor ?? 0) - 236799 / 1570) < 1e-9);
  });

  test('sem área: kg/ha e lotação não mostram número, dizem o que falta', () => {
    for (const k of ['kg_ha', 'lotacao']) {
      const i = by(ctx(), k);
      assert.deepEqual(i.faltam, ['Área de pasto útil']);
      assert.ok(i.pontos.every((p) => p.valor == null));
    }
  });

  test('com área: lotação = UA ÷ área', () => {
    const i = by(ctx({}, 10000), 'lotacao');
    assert.ok(Math.abs((i.pontos[0].valor ?? 0) - uaAtual([INHUMAS]).ua / 10000) < 1e-9);
  });

  test('meta gravada por ele substitui a sugerida (em %)', () => {
    const i = by(ctx({ 'meta.prenhez': 85 }), 'prenhez');
    assert.equal(i.meta.origem, 'sergio');
    assert.equal(i.meta.valor, 0.85);
  });

  test('kg/ha não tem meta inventada', () => {
    assert.equal(by(ctx(), 'kg_ha').meta.valor, null);
  });

  test('toda ficha diz fórmula, denominador, janela, unidade e fonte', () => {
    for (const i of indicadores(ctx())) for (const k of ['formula', 'numerador', 'denominador', 'janela', 'unidade', 'fonte'] as const) assert.ok(i.ficha[k], `${i.chave}.${k}`);
  });
});

describe('capacidade', () => {
  test('sem área por tipo: nenhum número, lista o que falta', () => {
    const c = capacidade({}, [{ limpo: null, caronal: null, cerrado: null, cultivada: null, alaga: null }]);
    assert.equal(c.uaCapacidade, null);
    assert.ok(c.faltam.length >= 2);
  });

  test('método da Embrapa Pantanal: 1.000 ha de campo limpo = 1.000×3000×0,48 ÷ (9×365)', () => {
    const c = capacidade({ reserva_pasto_pct: 10 }, [{ limpo: 1000, caronal: 0, cerrado: 0, cultivada: 0, alaga: 0 }]);
    assert.ok(Math.abs((c.uaCapacidade ?? 0) - (1000 * 3000 * 0.48) / (9 * 365)) < 1e-9);
    assert.ok(Math.abs((c.limite ?? 0) - (c.uaCheia ?? 0) * 0.9) < 1e-9);
  });

  test('sem reserva: mostra capacidade, mas não o limite', () => {
    const c = capacidade({}, [{ limpo: 1000, caronal: 0, cerrado: 0, cultivada: 100, alaga: 200 }]);
    assert.ok(c.uaCapacidade != null);
    assert.equal(c.limite, null);
    assert.ok(c.faltam.includes('Reserva de pasto'));
  });
});

describe('reposição, projeção e alertas', () => {
  test('reposição: vacas de 11+ (limite 12) saem; novilhas de 2 anos chegam', () => {
    const r = reposicaoProximoAno(ctx())!;
    assert.equal(r.porIdade, 90 + 86); // 12 e 13 anos no recorte do teste
    assert.equal(r.disponiveis, Math.round(179 * 0.99));
  });

  test('projeção só roda nos cenários que não dependem de área ou preço', () => {
    assert.ok(projetar(ctx(), 'como_estou')?.length === 5);
    assert.equal(projetar(ctx(), 'seca'), null);
    assert.equal(projetar(ctx(), 'preco'), null);
  });

  test('projeção mantém as vacas no número de hoje enquanto há novilha', () => {
    const p = projetar(ctx(), 'como_estou')!;
    assert.ok(p.every((a) => a.vacas > 0 && a.desmamados > 0));
  });

  test('descarte represado aparece; sem área e sem custo, diz que não consegue avaliar', () => {
    const c = ctx();
    const a = alertas(c, indicadores(c), capacidade({}, [{ limpo: null, caronal: null, cerrado: null, cultivada: null, alaga: null }]), false);
    assert.ok(a.alertas.some((x) => x.texto.startsWith('Descarte represado')));
    assert.equal(a.semDados.length, 2);
  });
});

describe('campos', () => {
  test('número com vírgula e com ponto', () => {
    const c = CAMPOS.find((x) => x.chave === 'preco_bezerro_kg')!;
    assert.deepEqual(validarValor(c, '12,5'), { ok: true, valor: 12.5 });
    assert.deepEqual(validarValor(c, '12.5'), { ok: true, valor: 12.5 });
    assert.deepEqual(validarValor(c, ''), { ok: true, valor: null });
    assert.equal(validarValor(c, '999').ok, false);
  });

  test('opção fora da lista é recusada', () => {
    const c = CAMPOS.find((x) => x.chave === 'vazia_regra')!;
    assert.equal(validarValor(c, 'qualquer').ok, false);
    assert.deepEqual(validarValor(c, 'segunda'), { ok: true, valor: 'segunda' });
  });

  test('chaves únicas e no formato da tabela', () => {
    const ks = CAMPOS.map((c) => c.chave);
    assert.equal(new Set(ks).size, ks.length);
    for (const k of ks) assert.match(k, /^[a-z0-9_.]{1,80}$/);
  });
});
