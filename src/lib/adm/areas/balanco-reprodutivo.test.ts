/**
 * BALANÇO REPRODUTIVO — o grupo de manejo de cada fêmea hoje.
 *
 * As regras que este arquivo protege:
 *
 *   · O GRUPO cruza o estado reprodutivo (regra compartilhada) com parto,
 *     idade e lactação — "não coberta" só vira "pronta" com 60+ dias de parto
 *     ou 240+ dias de idade.
 *   · "A SECAR" exige lactação aberta: gestante já seca está certa.
 *   · PARTO VENCIDO é o previsto que passou há mais de 10 dias sem nada
 *     lançado — cria não cadastrada ou aborto não lançado.
 *
 * `hoje` é injetado em tudo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  APTA_A_PARTIR_DE_DIAS,
  APTA_PESO_MINIMO_KG,
  DEL_ALERTA_DIAS,
  PARTO_PROXIMO_DIAS,
  PARTO_VENCIDO_APOS,
  SEM_BAIA,
  alertasDel,
  aplicarFiltro,
  auditoriaCoberturas,
  avaliarFemeas,
  lerFiltro,
  lerGrupo,
  ordenarPorGrupo,
  porBaia,
  prontasParaCobrir,
  proximosPartos,
  resumoBalanco,
} from '@/lib/adm/areas/balanco-reprodutivo';
import type { LinhaFemea } from '@/lib/adm/areas/contrato';

const HOJE = new Date('2026-09-11T00:00:00Z');

function femea(parcial: Partial<LinhaFemea> & { animal_id: number }): LinhaFemea {
  return {
    propriedade_id: 1,
    numero_animal: String(parcial.animal_id),
    nome_animal: null,
    categoria: 'Matriz',
    baia: null,
    setor: null,
    data_de_nascimento: '2023-01-01',
    idade_dias: 1349,
    ordem_parto: 2,
    ultimo_parto: null,
    dias_desde_parto: null,
    em_lactacao: false,
    seca_em: null,
    peso_atual: null,
    ultima_pesagem: null,
    servico_data: null,
    servico_metodo: null,
    servico_reprodutor: null,
    dg_data: null,
    dg_resultado: null,
    aborto_data: null,
    dg_dias_gestacao: null,
    dg_negativo_data: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Grupos
// ─────────────────────────────────────────────────────────────────────────────

test('avaliarFemeas: gestante, coberta e vazia seguem o estado reprodutivo', () => {
  const [g, c, v, a] = avaliarFemeas(
    [
      femea({ animal_id: 1, servico_data: '2026-06-01', dg_data: '2026-07-15', dg_resultado: 'gestante' }),
      femea({ animal_id: 2, servico_data: '2026-08-20' }),
      femea({ animal_id: 3, servico_data: '2026-06-01', dg_data: '2026-07-15', dg_resultado: 'vazia' }),
      femea({ animal_id: 4, servico_data: '2026-06-01', aborto_data: '2026-08-01' }),
    ],
    HOJE,
  );
  assert.equal(g.grupo, 'gestante');
  assert.equal(c.grupo, 'coberta');
  assert.equal(v.grupo, 'vazia');
  assert.equal(a.grupo, 'vazia', 'aborto conta como vazia — precisa voltar ao bode');
});

test('avaliarFemeas: parida sem nova cobertura é "pronta" com 60+ dias, "parida há pouco" antes', () => {
  const [pronta, recente] = avaliarFemeas(
    [
      femea({ animal_id: 1, ultimo_parto: '2026-06-01', dias_desde_parto: 102 }),
      femea({ animal_id: 2, ultimo_parto: '2026-08-20', dias_desde_parto: 22 }),
    ],
    HOJE,
  );
  assert.equal(pronta.grupo, 'pronta');
  assert.equal(recente.grupo, 'parida_recente');
});

test('avaliarFemeas: cabrita nunca coberta é "pronta" com 240+ dias, "jovem" antes, "sem informação" sem nascimento', () => {
  const [apta, nova, semData] = avaliarFemeas(
    [
      femea({ animal_id: 1, idade_dias: APTA_A_PARTIR_DE_DIAS }),
      femea({ animal_id: 2, idade_dias: 100 }),
      femea({ animal_id: 3, idade_dias: null, data_de_nascimento: null }),
    ],
    HOJE,
  );
  assert.equal(apta.grupo, 'pronta');
  assert.equal(nova.grupo, 'jovem');
  assert.equal(semData.grupo, 'sem_informacao');
});

test('avaliarFemeas: cobertura antiga sem desfecho não segura a fêmea em "coberta" — cai no grupo por parto/idade', () => {
  const [a] = avaliarFemeas(
    [femea({ animal_id: 1, servico_data: '2025-12-01', ultimo_parto: '2025-06-01', dias_desde_parto: 467 })],
    HOJE,
  );
  assert.equal(a.grupo, 'pronta');
});

// ─────────────────────────────────────────────────────────────────────────────
// A secar, partos próximos e vencidos
// ─────────────────────────────────────────────────────────────────────────────

test('avaliarFemeas: "a secar" exige gestação de 90+ dias E lactação aberta', () => {
  const [ordenhando, jaSeca] = avaliarFemeas(
    [
      femea({ animal_id: 1, servico_data: '2026-05-20', dg_data: '2026-07-01', dg_resultado: 'gestante', em_lactacao: true }),
      femea({ animal_id: 2, servico_data: '2026-05-20', dg_data: '2026-07-01', dg_resultado: 'gestante', em_lactacao: false, seca_em: '2026-08-20' }),
    ],
    HOJE,
  );
  assert.equal(ordenhando.situacao.aSecar, true);
  assert.equal(ordenhando.aSecar, true);
  assert.equal(jaSeca.aSecar, false, 'gestante já seca está certa');
});

test('avaliarFemeas: parto previsto dentro de 30 dias é próximo; passado há mais de 10 dias é vencido', () => {
  // Cobertura + 150 = parto previsto.
  const [proximo, vencido, distante] = avaliarFemeas(
    [
      femea({ animal_id: 1, servico_data: '2026-04-20', dg_data: '2026-06-01', dg_resultado: 'gestante' }), // parto 17/09
      femea({ animal_id: 2, servico_data: '2026-03-01', dg_data: '2026-04-15', dg_resultado: 'gestante' }), // parto 29/07
      femea({ animal_id: 3, servico_data: '2026-07-01', dg_data: '2026-08-15', dg_resultado: 'gestante' }), // parto 28/11
    ],
    HOJE,
  );
  assert.equal(proximo.diasParaParto, 6);
  assert.equal(proximo.partoProximo, true);
  assert.equal(proximo.partoVencido, false);

  assert.equal(vencido.diasParaParto, -44);
  assert.equal(vencido.partoVencido, true, `passou de ${PARTO_VENCIDO_APOS} dias — cria não cadastrada ou aborto não lançado`);
  assert.equal(vencido.partoProximo, false);

  assert.equal(distante.partoProximo, false, `mais de ${PARTO_PROXIMO_DIAS} dias`);
});

test('avaliarFemeas: gestante por DG sem cobertura não tem parto previsto', () => {
  const [a] = avaliarFemeas([femea({ animal_id: 1, dg_data: '2026-08-01', dg_resultado: 'gestante' })], HOJE);
  assert.equal(a.grupo, 'gestante');
  assert.equal(a.diasParaParto, null);
  assert.equal(a.situacao.semCoberturaLancada, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e listas
// ─────────────────────────────────────────────────────────────────────────────

test('resumoBalanco: conta por grupo e separa prontas paridas de cabritas', () => {
  const resumo = resumoBalanco(
    avaliarFemeas(
      [
        femea({ animal_id: 1, servico_data: '2026-06-01', dg_data: '2026-07-15', dg_resultado: 'gestante', em_lactacao: true }),
        femea({ animal_id: 2, ultimo_parto: '2026-06-01', dias_desde_parto: 102 }),
        femea({ animal_id: 3, idade_dias: 300 }),
        femea({ animal_id: 4, idade_dias: 100 }),
      ],
      HOJE,
    ),
  );
  assert.equal(resumo.femeas, 4);
  assert.equal(resumo.porGrupo.gestante, 1);
  assert.equal(resumo.porGrupo.pronta, 2);
  assert.equal(resumo.prontasParidas, 1);
  assert.equal(resumo.prontasCabritas, 1);
  assert.equal(resumo.porGrupo.jovem, 1);
  assert.equal(resumo.aSecar, 1, '102 dias de gestação e ordenhando');
  assert.equal(resumo.comAlgumEvento, true);
});

test('resumoBalanco: fazenda sem evento nenhum é dita como tal', () => {
  const resumo = resumoBalanco(avaliarFemeas([femea({ animal_id: 1, idade_dias: 300 })], HOJE));
  assert.equal(resumo.comAlgumEvento, false);
});

test('proximosPartos: só gestantes com parto previsto, da mais vencida para a mais distante', () => {
  const lista = proximosPartos(
    avaliarFemeas(
      [
        femea({ animal_id: 1, servico_data: '2026-07-01', dg_data: '2026-08-15', dg_resultado: 'gestante' }),
        femea({ animal_id: 2, servico_data: '2026-03-01', dg_data: '2026-04-15', dg_resultado: 'gestante' }),
        femea({ animal_id: 3, dg_data: '2026-08-01', dg_resultado: 'gestante' }),
        femea({ animal_id: 4, servico_data: '2026-08-20' }),
      ],
      HOJE,
    ),
  );
  assert.deepEqual(
    lista.map((a) => a.femea.animal_id),
    [2, 1],
    'a 3 é gestante sem cobertura (sem data), a 4 não é gestante',
  );
});

test('prontasParaCobrir: paridas primeiro (quem espera há mais tempo), depois cabritas pela idade', () => {
  const lista = prontasParaCobrir(
    avaliarFemeas(
      [
        femea({ animal_id: 1, idade_dias: 300 }),
        femea({ animal_id: 2, ultimo_parto: '2026-05-01', dias_desde_parto: 133 }),
        femea({ animal_id: 3, ultimo_parto: '2026-06-01', dias_desde_parto: 102 }),
        femea({ animal_id: 4, idade_dias: 400 }),
      ],
      HOJE,
    ),
  );
  assert.deepEqual(
    lista.map((a) => a.femea.animal_id),
    [2, 3, 4, 1],
  );
});

test('ordenarPorGrupo: na ordem do ciclo, e por número dentro do grupo', () => {
  const lista = ordenarPorGrupo(
    avaliarFemeas(
      [
        femea({ animal_id: 9, idade_dias: 100 }),
        femea({ animal_id: 2, servico_data: '2026-08-20' }),
        femea({ animal_id: 1, servico_data: '2026-08-20' }),
      ],
      HOJE,
    ),
  );
  assert.deepEqual(
    lista.map((a) => `${a.grupo}:${a.femea.animal_id}`),
    ['coberta:1', 'coberta:2', 'jovem:9'],
  );
});

test('lerGrupo: só aceita chave da lista', () => {
  assert.equal(lerGrupo('pronta'), 'pronta');
  assert.equal(lerGrupo('qualquer'), null);
  assert.equal(lerGrupo(undefined), null);
});

test('avaliarFemeas: o feto só desloca o parto quando um DG negativo refutou a cobertura', () => {
  const [pelaCobertura, refutada] = avaliarFemeas(
    [
      femea({ animal_id: 1, servico_data: '2026-03-01', dg_data: '2026-05-29', dg_resultado: 'gestante', dg_dias_gestacao: 30 }),
      femea({ animal_id: 2, servico_data: '2026-03-01', dg_negativo_data: '2026-05-07', dg_data: '2026-05-29', dg_resultado: 'gestante', dg_dias_gestacao: 30 }),
    ],
    HOJE,
  );
  assert.equal(pelaCobertura.situacao.partoPrevisto, '2026-07-29', 'o "30 dias" é padrão digitado — a cobertura vale');
  assert.equal(pelaCobertura.partoVencido, true);
  assert.equal(pelaCobertura.situacao.dgDiasSuspeito, true);

  assert.equal(refutada.situacao.partoPrevisto, '2026-09-26');
  assert.equal(refutada.partoVencido, false);
  assert.equal(refutada.partoProximo, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Aptas por peso, alerta de DEL, auditoria e baias
// ─────────────────────────────────────────────────────────────────────────────

test('avaliarFemeas: cabrita com idade mas abaixo de 35 kg ainda é "jovem"; sem peso vale a idade e fica marcada', () => {
  const [leve, pesada, semPeso] = avaliarFemeas(
    [
      femea({ animal_id: 1, idade_dias: 300, peso_atual: 28 }),
      femea({ animal_id: 2, idade_dias: 300, peso_atual: APTA_PESO_MINIMO_KG }),
      femea({ animal_id: 3, idade_dias: 300, peso_atual: null }),
    ],
    HOJE,
  );
  assert.equal(leve.grupo, 'jovem');
  assert.equal(pesada.grupo, 'pronta');
  assert.equal(semPeso.grupo, 'pronta');
  assert.equal(semPeso.aptaSemPeso, true);
  assert.equal(pesada.aptaSemPeso, false);
});

test('avaliarFemeas: alerta de DEL é lactação aberta há mais de 210 dias sem gestação', () => {
  const [alerta, gestante, seca, recente] = avaliarFemeas(
    [
      femea({ animal_id: 1, ultimo_parto: '2026-01-01', dias_desde_parto: 253, em_lactacao: true }),
      femea({ animal_id: 2, ultimo_parto: '2026-01-01', dias_desde_parto: 253, em_lactacao: true, servico_data: '2026-04-01', dg_data: '2026-05-15', dg_resultado: 'gestante' }),
      femea({ animal_id: 3, ultimo_parto: '2026-01-01', dias_desde_parto: 253, em_lactacao: false }),
      femea({ animal_id: 4, ultimo_parto: '2026-06-01', dias_desde_parto: 102, em_lactacao: true }),
    ],
    HOJE,
  );
  assert.equal(DEL_ALERTA_DIAS, 210);
  assert.equal(alerta.alertaDel, true);
  assert.equal(gestante.alertaDel, false, 'gestante com DEL alto é caso de secar, não de cobrir');
  assert.equal(seca.alertaDel, false);
  assert.equal(recente.alertaDel, false);
  assert.deepEqual(alertasDel([alerta, gestante, seca, recente]).map((a) => a.femea.animal_id), [1]);
});

test('auditoriaCoberturas: lista o DG com idade do feto suspeita e a cobertura refutada, por data do DG', () => {
  const lista = auditoriaCoberturas(
    avaliarFemeas(
      [
        femea({ animal_id: 1, servico_data: '2026-02-16', dg_data: '2026-05-28', dg_resultado: 'gestante', dg_dias_gestacao: 30 }),
        femea({ animal_id: 2, servico_data: '2026-03-01', dg_negativo_data: '2026-05-07', dg_data: '2026-05-20', dg_resultado: 'gestante', dg_dias_gestacao: 30 }),
        femea({ animal_id: 3, servico_data: '2026-04-01', dg_data: '2026-05-15', dg_resultado: 'gestante', dg_dias_gestacao: 44 }),
      ],
      HOJE,
    ),
  );
  assert.deepEqual(lista.map((a) => a.femea.animal_id), [2, 1], 'a 3 bate com a cobertura e não entra');
});

test('porBaia: barra por baia, DEL médio só das lactantes, ordem natural e "Sem baia" por último', () => {
  const baias = porBaia(
    avaliarFemeas(
      [
        femea({ animal_id: 1, baia: 'G1-10', ultimo_parto: '2026-06-01', dias_desde_parto: 102, em_lactacao: true }),
        femea({ animal_id: 2, baia: 'G1-2', servico_data: '2026-08-20' }),
        femea({ animal_id: 3, baia: 'G1-2', ultimo_parto: '2026-05-01', dias_desde_parto: 133, em_lactacao: true }),
        femea({ animal_id: 4, baia: 'G1-2', servico_data: '2026-04-01', dg_data: '2026-05-15', dg_resultado: 'gestante', em_lactacao: false }),
        femea({ animal_id: 5, baia: null, idade_dias: 100 }),
      ],
      HOJE,
    ),
  );
  assert.deepEqual(
    baias.map((b) => b.baia),
    ['G1-2', 'G1-10', SEM_BAIA],
  );
  const g12 = baias[0];
  assert.equal(g12.animais, 3);
  assert.equal(g12.gestantes, 1);
  assert.equal(g12.cobertas, 1);
  assert.equal(g12.outras, 1);
  assert.equal(g12.aptas, 1);
  assert.equal(g12.delMedio, 133, 'só a lactante entra no DEL');
});

test('lerFiltro e aplicarFiltro: alerta de DEL e aptas', () => {
  const avaliadas = avaliarFemeas(
    [
      femea({ animal_id: 1, ultimo_parto: '2026-01-01', dias_desde_parto: 253, em_lactacao: true }),
      femea({ animal_id: 2, idade_dias: 300 }),
    ],
    HOJE,
  );
  assert.equal(lerFiltro('del'), 'del');
  assert.equal(lerFiltro('x'), null);
  assert.deepEqual(aplicarFiltro(avaliadas, 'del').map((a) => a.femea.animal_id), [1]);
  assert.deepEqual(aplicarFiltro(avaliadas, 'aptas').map((a) => a.femea.animal_id), [1, 2], 'a 1 pariu há 253 dias e também está pronta');
  assert.equal(aplicarFiltro(avaliadas, null).length, 2);
});
