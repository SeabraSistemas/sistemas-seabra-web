/**
 * CONSOLIDAÇÃO DAS ÁREAS — o teste do bug de espalhamento.
 *
 * Sete áreas (reprodução, sanidade, crescimento, avaliações, financeiro,
 * estrutura, equipe) têm a MESMA função e a MESMA regra, escrita sete vezes:
 *
 *     contagem SOMA · média ANULA · nada sai valendo o valor de uma fazenda só.
 *
 * A revisão da Fase 1 pegou `{...visoes[0], ...somas}` na consolidação: o campo
 * que ninguém somou herdava o valor da PRIMEIRA propriedade e era exibido como
 * consolidado. É um bug que não quebra nada, não aparece no `tsc` e não parece
 * errado na tela — o número existe, é plausível, e é da fazenda errada. Sete
 * cópias da mesma função são sete chances de ele voltar.
 *
 * POR ISSO O TESTE É PARAMETRIZADO E A TABELA É UMA ESPECIFICAÇÃO, NÃO UMA CÓPIA
 * DA IMPLEMENTAÇÃO. Para cada área, duas fazendas que DISCORDAM EM TODO CAMPO e
 * uma regra declarada por campo. A trava que importa é a última asserção de cada
 * varredura: o consolidado não pode ser igual ao valor de nenhuma das duas.
 * Como as duas discordam em tudo (e isso também é testado), qualquer campo que
 * escape para a saída sem passar por soma, anulação ou recálculo é pego.
 *
 * A tabela também é fechada nos dois sentidos: campo do resultado sem regra
 * declarada FALHA. Uma coluna nova na interface obriga alguém a decidir, no
 * teste, se ela soma ou anula — em vez de vazar para a tela por descuido.
 *
 * Tudo aqui é entrada → saída: nenhuma destas funções lê banco, rede ou relógio.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { consolidarReproducao } from '@/lib/adm/areas/reproducao';
import { consolidarSanidade } from '@/lib/adm/areas/sanidade';
import { consolidarCrescimento } from '@/lib/adm/areas/crescimento';
import { consolidarAvaliacoes } from '@/lib/adm/areas/avaliacoes';
import { consolidarFinanceiro, type FinanceiroProdutor } from '@/lib/adm/areas/financeiro';
import { consolidarEstruturas, type EstruturaFisica } from '@/lib/adm/areas/estrutura';
import { consolidarEquipes, type Equipe, type PessoaEquipe } from '@/lib/adm/areas/equipe';
import type {
  LinhaAvaliacoes,
  LinhaCrescimento,
  LinhaReproducao,
  LinhaSanidade,
} from '@/lib/adm/areas/contrato';

// ─────────────────────────────────────────────────────────────────────────────
// A gramática da especificação
// ─────────────────────────────────────────────────────────────────────────────

type Regra =
  /** Contagem: o consolidado é a soma das duas. */
  | { tipo: 'soma' }
  /** Média, taxa ou parâmetro que não se funde: o consolidado é `null`. */
  | { tipo: 'nulo' }
  /** Recálculo sobre os totais, lista fundida, ou constante do consolidado. */
  | { tipo: 'valor'; esperado: unknown }
  /**
   * Bandeira booleana. Fica FORA da trava de espalhamento porque um booleano só
   * tem dois valores: coincidir com o de uma das fazendas é inevitável, não é
   * sintoma. Cada bandeira tem teste próprio mais abaixo.
   */
  | { tipo: 'bandeira'; esperado: boolean };

type Registro = Record<string, unknown>;

interface AreaSobTeste {
  nome: string;
  a: Registro;
  b: Registro;
  consolidado: Registro;
  vazio: Registro;
  umaSo: Registro;
  campos: Record<string, Regra>;
  /**
   * Cópia de `a` e `b` tirada ANTES de qualquer consolidação rodar. Sem elas o
   * teste de imutabilidade é vacuidade: comparar `a` com um clone de `a` feito
   * depois é verdade sempre, e o resto do arquivo estaria comparando contra
   * fixtures já corrompidos sem ninguém notar.
   */
  antesA: Registro;
  antesB: Registro;
}

function area<L extends object>(definicao: {
  nome: string;
  consolidar: (linhas: L[]) => L;
  a: L;
  b: L;
  campos: Record<keyof L & string, Regra>;
}): AreaSobTeste {
  const cru = (valor: L) => valor as unknown as Registro;
  // O retrato vem PRIMEIRO — antes de `consolidar` ter a chance de mexer.
  const antesA = structuredClone(cru(definicao.a));
  const antesB = structuredClone(cru(definicao.b));
  return {
    nome: definicao.nome,
    a: cru(definicao.a),
    b: cru(definicao.b),
    antesA,
    antesB,
    consolidado: cru(definicao.consolidar([definicao.a, definicao.b])),
    vazio: cru(definicao.consolidar([])),
    umaSo: cru(definicao.consolidar([definicao.a])),
    campos: definicao.campos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// As sete áreas
// ─────────────────────────────────────────────────────────────────────────────

const reproducaoA: LinhaReproducao = {
  propriedade_id: 11,
  coberturas_12m: 10,
  inseminacoes_12m: 4,
  montas_12m: 6,
  te_12m: 1,
  diagnosticos_12m: 8,
  diagnosticos_positivos_12m: 2,
  taxa_prenhez: 0.25,
  partos_12m: 7,
  abortos_12m: 1,
  idade_primeiro_parto_dias: 400,
  prolificidade_media: 1.4,
  intervalo_partos_dias: 300,
  femeas_ativas: 30,
  gestantes: 5,
  serie_mensal: [{ serie: 'coberturas', periodo: '2026-01', valor: 10 }],
  funil: [
    { rotulo: 'Coberturas', valor: 10 },
    { rotulo: 'Partos', valor: 7 },
  ],
  dg_pendentes: [
    {
      numero_animal: 'A1',
      nome_animal: null,
      baia: 'G1',
      data_ultima_cobertura: '2026-01-01',
      dias_desde_cobertura: 60,
      tipo_cobertura: 'Monta livre',
    },
  ],
};

const reproducaoB: LinhaReproducao = {
  propriedade_id: 22,
  coberturas_12m: 3,
  inseminacoes_12m: 9,
  montas_12m: 2,
  te_12m: 5,
  diagnosticos_12m: 12,
  diagnosticos_positivos_12m: 9,
  taxa_prenhez: 0.75,
  partos_12m: 9,
  abortos_12m: 4,
  idade_primeiro_parto_dias: 500,
  prolificidade_media: 1.9,
  intervalo_partos_dias: 250,
  femeas_ativas: 45,
  gestantes: 11,
  serie_mensal: [
    { serie: 'coberturas', periodo: '2026-01', valor: 3 },
    { serie: 'partos', periodo: '2026-02', valor: 9 },
  ],
  funil: [
    { rotulo: 'Coberturas', valor: 3 },
    { rotulo: 'Partos', valor: 9 },
  ],
  dg_pendentes: [
    {
      numero_animal: 'B1',
      nome_animal: 'Bela',
      baia: 'G2',
      data_ultima_cobertura: '2026-02-01',
      dias_desde_cobertura: 90,
      tipo_cobertura: 'Inseminação',
    },
  ],
};

const sanidadeA: LinhaSanidade = {
  propriedade_id: 11,
  casos_12m: 20,
  animais_tratados_12m: 12,
  obitos_12m: 4,
  taxa_mortalidade: 0.02,
  famacha_medio: 1.2,
  escore_corporal_medio: 3.1,
  manejos_12m: 9,
  sessoes_coletivas_12m: 2,
  obitos_mensais: [{ periodo: '2026-01', valor: 4 }],
  distribuicao_famacha: [
    { rotulo: '1', valor: 9 },
    { rotulo: '3', valor: 1 },
  ],
  principais_suspeitas: [
    { rotulo: 'Verminose', valor: 9 },
    { rotulo: 'Mastite', valor: 2 },
  ],
};

const sanidadeB: LinhaSanidade = {
  propriedade_id: 22,
  casos_12m: 5,
  animais_tratados_12m: 3,
  obitos_12m: 7,
  taxa_mortalidade: 0.05,
  famacha_medio: 4.25,
  escore_corporal_medio: 2.4,
  manejos_12m: 14,
  sessoes_coletivas_12m: 3,
  obitos_mensais: [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-03', valor: 6 },
  ],
  distribuicao_famacha: [
    { rotulo: '5', valor: 10 },
    { rotulo: '4', valor: 30 },
  ],
  principais_suspeitas: [
    { rotulo: 'Mastite', valor: 7 },
    { rotulo: 'Pododermatite', valor: 1 },
  ],
};

const crescimentoA: LinhaCrescimento = {
  propriedade_id: 11,
  pesagens_12m: 40,
  animais_pesados_12m: 20,
  gmd_medio: 0.18,
  peso_medio_desmame: 14,
  abaixo_da_meta: 5,
  peso_ideal_desmame: 15,
  idade_desmame: 60,
  peso_ideal_entrada_reproducao: 30,
  nuvem_peso_idade: [{ idade_dias: 70, peso_kg: 12, sexo: 'F' }],
  piores_gmd: [{ numero_animal: 'A1', nome_animal: 'Bela', gmd: 0.05 }],
};

const crescimentoB: LinhaCrescimento = {
  propriedade_id: 22,
  pesagens_12m: 15,
  animais_pesados_12m: 9,
  gmd_medio: 0.25,
  peso_medio_desmame: 19,
  abaixo_da_meta: 8,
  peso_ideal_desmame: 18,
  idade_desmame: 90,
  peso_ideal_entrada_reproducao: 35,
  nuvem_peso_idade: [{ idade_dias: 100, peso_kg: 22, sexo: null }],
  piores_gmd: [{ numero_animal: 'B1', nome_animal: null, gmd: 0.01 }],
};

const avaliacoesA: LinhaAvaliacoes = {
  propriedade_id: 11,
  amls_total: 12,
  amls_12m: 4,
  medidas_total: 190,
  pontuacao_media: 71.5,
  aml_corte_total: 2,
  pontuacao_mensal: [{ periodo: '2026-01', valor: 71.5 }],
  media_por_ponto: [{ rotulo: 'ponto_1', valor: 7 }],
};

const avaliacoesB: LinhaAvaliacoes = {
  propriedade_id: 22,
  amls_total: 5,
  amls_12m: 3,
  medidas_total: 80,
  pontuacao_media: 63.2,
  aml_corte_total: 6,
  pontuacao_mensal: [{ periodo: '2026-02', valor: 63.2 }],
  media_por_ponto: [{ rotulo: 'ponto_1', valor: 5 }],
};

const financeiroA: FinanceiroProdutor = {
  receita12m: 10000,
  despesa12m: 7000,
  margem12m: 3000,
  lancamentos12m: 40,
  custoLitro: 2.1,
  lucroLactanteMes: 30,
  dataSnapshot: '2026-08-01',
  semEstimativa: false,
  custoLitroSerie: [{ periodo: '2026-01', valor: 2.1 }],
  despesaPorSetor: [
    { rotulo: 'Nutrição', valor: 5000 },
    { rotulo: 'Sanidade', valor: 2000 },
  ],
  consolidado: false,
};

const financeiroB: FinanceiroProdutor = {
  receita12m: 4000,
  despesa12m: 2500,
  margem12m: 1500,
  lancamentos12m: 11,
  custoLitro: 3.4,
  lucroLactanteMes: 12,
  dataSnapshot: '2026-07-01',
  semEstimativa: true,
  custoLitroSerie: [{ periodo: '2026-02', valor: 3.4 }],
  despesaPorSetor: [
    { rotulo: 'Nutrição', valor: 1000 },
    { rotulo: 'Reprodução', valor: 500 },
  ],
  consolidado: false,
};

const estruturaA: EstruturaFisica = {
  setores: 4,
  baias: 12,
  lotes: 7,
  movimentacoes12m: 90,
  animaisSemLocalizacao: 3,
  porLote: [{ rotulo: 'Lote 1', valor: 40 }],
  porSetor: [{ rotulo: 'Curral', valor: 40 }],
  consolidado: false,
};

const estruturaB: EstruturaFisica = {
  setores: 2,
  baias: 5,
  lotes: 3,
  movimentacoes12m: 21,
  animaisSemLocalizacao: 8,
  porLote: [{ rotulo: 'Lote A', valor: 20 }],
  porSetor: [{ rotulo: 'Piquete', valor: 20 }],
  consolidado: false,
};

const ana: PessoaEquipe = {
  usuarioId: 101,
  nome: 'Ana',
  papel: 'colaborador',
  ativo: true,
  vinculo: 'consultoria',
  permissoes: ['rebanho'],
  ultimoLancamentoEm: '2026-08-01T10:00:00Z',
  propriedades: 1,
};

const bruno: PessoaEquipe = {
  usuarioId: 202,
  nome: 'Bruno',
  papel: 'tecnico',
  ativo: true,
  vinculo: 'dono',
  permissoes: null,
  ultimoLancamentoEm: '2026-07-01T10:00:00Z',
  propriedades: 1,
};

const equipeA: Equipe = {
  colaboradores: 5,
  colaboradoresAtivos: 4,
  tecnicosVinculados: 2,
  visitas12m: 9,
  pessoas: [ana],
};

const equipeB: Equipe = {
  colaboradores: 3,
  colaboradoresAtivos: 1,
  tecnicosVinculados: 1,
  visitas12m: 4,
  pessoas: [bruno],
};

const AREAS: AreaSobTeste[] = [
  area<LinhaReproducao>({
    nome: 'reprodução',
    consolidar: consolidarReproducao,
    a: reproducaoA,
    b: reproducaoB,
    campos: {
      // Zero, e não o id da primeira fazenda: um objeto que soma N propriedades
      // não é de nenhuma delas.
      propriedade_id: { tipo: 'valor', esperado: 0 },
      coberturas_12m: { tipo: 'soma' },
      inseminacoes_12m: { tipo: 'soma' },
      montas_12m: { tipo: 'soma' },
      te_12m: { tipo: 'soma' },
      diagnosticos_12m: { tipo: 'soma' },
      diagnosticos_positivos_12m: { tipo: 'soma' },
      // Exceção declarada: numerador E denominador estão no contrato, então a
      // taxa é recalculada sobre os totais — 11 positivos / 20 diagnósticos.
      taxa_prenhez: { tipo: 'valor', esperado: 11 / 20 },
      partos_12m: { tipo: 'soma' },
      abortos_12m: { tipo: 'soma' },
      idade_primeiro_parto_dias: { tipo: 'nulo' },
      prolificidade_media: { tipo: 'nulo' },
      intervalo_partos_dias: { tipo: 'nulo' },
      femeas_ativas: { tipo: 'soma' },
      gestantes: { tipo: 'soma' },
      serie_mensal: {
        tipo: 'valor',
        esperado: [
          { serie: 'coberturas', periodo: '2026-01', valor: 13 },
          { serie: 'partos', periodo: '2026-02', valor: 9 },
        ],
      },
      funil: {
        tipo: 'valor',
        esperado: [
          { rotulo: 'Coberturas', valor: 13 },
          { rotulo: 'Partos', valor: 16 },
        ],
      },
      // Concatenado e reordenado pelo mais atrasado (dias_desde_cobertura desc) —
      // igual a `piores_gmd` em crescimento.ts, nunca média nem soma: cada item é
      // um animal, e a união de duas fazendas é o conjunto dos dois.
      dg_pendentes: {
        tipo: 'valor',
        esperado: [
          {
            numero_animal: 'B1',
            nome_animal: 'Bela',
            baia: 'G2',
            data_ultima_cobertura: '2026-02-01',
            dias_desde_cobertura: 90,
            tipo_cobertura: 'Inseminação',
          },
          {
            numero_animal: 'A1',
            nome_animal: null,
            baia: 'G1',
            data_ultima_cobertura: '2026-01-01',
            dias_desde_cobertura: 60,
            tipo_cobertura: 'Monta livre',
          },
        ],
      },
    },
  }),

  area<LinhaSanidade>({
    nome: 'sanidade',
    consolidar: consolidarSanidade,
    a: sanidadeA,
    b: sanidadeB,
    campos: {
      propriedade_id: { tipo: 'valor', esperado: 0 },
      casos_12m: { tipo: 'soma' },
      animais_tratados_12m: { tipo: 'soma' },
      obitos_12m: { tipo: 'soma' },
      // Sem o efetivo vivo no contrato não há denominador: recuperá-lo por
      // óbitos ÷ taxa deixaria de fora justamente a fazenda com zero óbito.
      taxa_mortalidade: { tipo: 'nulo' },
      // Exceção declarada: o histograma cobre a mesma população da média, então
      // Σ(grau × medições) ÷ Σmedições é a média verdadeira do conjunto.
      famacha_medio: { tipo: 'valor', esperado: 182 / 50 },
      escore_corporal_medio: { tipo: 'nulo' },
      manejos_12m: { tipo: 'soma' },
      sessoes_coletivas_12m: { tipo: 'soma' },
      obitos_mensais: {
        tipo: 'valor',
        esperado: [
          { periodo: '2026-01', valor: 5 },
          { periodo: '2026-03', valor: 6 },
        ],
      },
      distribuicao_famacha: {
        tipo: 'valor',
        esperado: [
          { rotulo: '1', valor: 9 },
          { rotulo: '3', valor: 1 },
          { rotulo: '5', valor: 10 },
          { rotulo: '4', valor: 30 },
        ],
      },
      principais_suspeitas: {
        tipo: 'valor',
        esperado: [
          { rotulo: 'Mastite', valor: 9 },
          { rotulo: 'Verminose', valor: 9 },
          { rotulo: 'Pododermatite', valor: 1 },
        ],
      },
    },
  }),

  area<LinhaCrescimento>({
    nome: 'crescimento',
    consolidar: consolidarCrescimento,
    a: crescimentoA,
    b: crescimentoB,
    campos: {
      propriedade_id: { tipo: 'valor', esperado: 0 },
      pesagens_12m: { tipo: 'soma' },
      animais_pesados_12m: { tipo: 'soma' },
      gmd_medio: { tipo: 'nulo' },
      peso_medio_desmame: { tipo: 'nulo' },
      abaixo_da_meta: { tipo: 'soma' },
      // Parâmetro de manejo de cada fazenda: com valores diferentes, some.
      peso_ideal_desmame: { tipo: 'nulo' },
      idade_desmame: { tipo: 'nulo' },
      peso_ideal_entrada_reproducao: { tipo: 'nulo' },
      // Cada ponto é um animal: a união de dois rebanhos é exata, não aproximada.
      nuvem_peso_idade: {
        tipo: 'valor',
        esperado: [
          { idade_dias: 70, peso_kg: 12, sexo: 'F' },
          { idade_dias: 100, peso_kg: 22, sexo: null },
        ],
      },
      // Concatena e REORDENA pelo pior: a lista de ação é do conjunto.
      piores_gmd: {
        tipo: 'valor',
        esperado: [
          { numero_animal: 'B1', nome_animal: null, gmd: 0.01 },
          { numero_animal: 'A1', nome_animal: 'Bela', gmd: 0.05 },
        ],
      },
    },
  }),

  area<LinhaAvaliacoes>({
    nome: 'avaliações',
    consolidar: consolidarAvaliacoes,
    a: avaliacoesA,
    b: avaliacoesB,
    campos: {
      propriedade_id: { tipo: 'valor', esperado: 0 },
      amls_total: { tipo: 'soma' },
      amls_12m: { tipo: 'soma' },
      medidas_total: { tipo: 'soma' },
      pontuacao_media: { tipo: 'nulo' },
      aml_corte_total: { tipo: 'soma' },
      pontuacao_mensal: { tipo: 'nulo' },
      // O radar exigiria ponderar por AML completa; AML interrompida é comum, e
      // o erro entraria calado numa peça que vai ao cliente.
      media_por_ponto: { tipo: 'nulo' },
    },
  }),

  area<FinanceiroProdutor>({
    nome: 'financeiro',
    consolidar: consolidarFinanceiro,
    a: financeiroA,
    b: financeiroB,
    campos: {
      receita12m: { tipo: 'soma' },
      despesa12m: { tipo: 'soma' },
      margem12m: { tipo: 'soma' },
      lancamentos12m: { tipo: 'soma' },
      // Razão não soma e não vira média de médias.
      custoLitro: { tipo: 'nulo' },
      lucroLactanteMes: { tipo: 'nulo' },
      dataSnapshot: { tipo: 'nulo' },
      semEstimativa: { tipo: 'bandeira', esperado: false },
      custoLitroSerie: { tipo: 'valor', esperado: [] },
      despesaPorSetor: {
        tipo: 'valor',
        esperado: [
          { rotulo: 'Nutrição', valor: 6000 },
          { rotulo: 'Sanidade', valor: 2000 },
          { rotulo: 'Reprodução', valor: 500 },
        ],
      },
      consolidado: { tipo: 'bandeira', esperado: true },
    },
  }),

  area<EstruturaFisica>({
    nome: 'estrutura',
    consolidar: consolidarEstruturas,
    a: estruturaA,
    b: estruturaB,
    campos: {
      setores: { tipo: 'soma' },
      baias: { tipo: 'soma' },
      lotes: { tipo: 'soma' },
      movimentacoes12m: { tipo: 'soma' },
      animaisSemLocalizacao: { tipo: 'soma' },
      // Nomes de lote e setor são locais de cada fazenda: fundir por rótulo
      // juntaria dois "Lote 1" que não têm nada a ver um com o outro.
      porLote: { tipo: 'valor', esperado: [] },
      porSetor: { tipo: 'valor', esperado: [] },
      consolidado: { tipo: 'bandeira', esperado: true },
    },
  }),

  area<Equipe>({
    nome: 'equipe',
    consolidar: consolidarEquipes,
    a: equipeA,
    b: equipeB,
    campos: {
      colaboradores: { tipo: 'soma' },
      colaboradoresAtivos: { tipo: 'soma' },
      // Conta VÍNCULOS: o mesmo consultor em três fazendas conta três vezes.
      tecnicosVinculados: { tipo: 'soma' },
      visitas12m: { tipo: 'soma' },
      // Pessoas, ao contrário, são gente: deduplicadas e reordenadas pelo vínculo.
      pessoas: { tipo: 'valor', esperado: [{ ...bruno }, { ...ana }] },
    },
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// A varredura
// ─────────────────────────────────────────────────────────────────────────────

function regraDe(area: AreaSobTeste, campo: string): Regra {
  const regra = area.campos[campo];
  if (!regra) assert.fail(`${area.nome}: campo "${campo}" sem regra de consolidação declarada no teste`);
  return regra;
}

for (const area of AREAS) {
  test(`${area.nome}: as duas fazendas do teste discordam em todo campo — senão a trava do espalhamento não trava nada`, () => {
    for (const campo of Object.keys(area.campos)) {
      if (regraDe(area, campo).tipo === 'bandeira') continue;
      assert.notDeepEqual(
        area.a[campo],
        area.b[campo],
        `${campo}: as duas fazendas do fixture têm o mesmo valor, então o campo não prova nada`,
      );
    }
  });

  test(`${area.nome}: todo campo do consolidado tem regra declarada — coluna nova obriga uma decisão`, () => {
    assert.deepEqual(
      Object.keys(area.consolidado).sort(),
      Object.keys(area.campos).sort(),
      'a tabela do teste e o objeto consolidado precisam cobrir exatamente os mesmos campos',
    );
  });

  test(`${area.nome}: contagem soma, média anula — e nenhum campo sai valendo o de uma fazenda só`, () => {
    for (const [campo, regra] of Object.entries(area.campos)) {
      const obtido = area.consolidado[campo];

      switch (regra.tipo) {
        case 'soma': {
          const a = area.a[campo];
          const b = area.b[campo];
          assert.equal(typeof a, 'number', `${campo}: fixture de soma precisa de número`);
          assert.equal(typeof b, 'number', `${campo}: fixture de soma precisa de número`);
          assert.equal(obtido, (a as number) + (b as number), `${campo} deveria ser a soma das duas fazendas`);
          break;
        }
        case 'nulo':
          assert.equal(obtido, null, `${campo} deveria ficar em branco, não virar média de médias`);
          break;
        case 'valor':
          assert.deepEqual(obtido, regra.esperado, `${campo} fora do recálculo declarado`);
          break;
        case 'bandeira':
          assert.equal(obtido, regra.esperado, `${campo}`);
          break;
      }

      // A TRAVA. Vale para todo campo que não seja bandeira booleana: o
      // consolidado nunca pode ser, campo a campo, o valor de uma das fazendas.
      // É exatamente o que `{...visoes[0], ...somas}` produzia.
      if (regra.tipo !== 'bandeira') {
        assert.notDeepEqual(obtido, area.a[campo], `${campo} saiu valendo o da PRIMEIRA fazenda`);
        assert.notDeepEqual(obtido, area.b[campo], `${campo} saiu valendo o da SEGUNDA fazenda`);
      }
    }
  });

  test(`${area.nome}: uma fazenda só não é consolidação — a linha volta inteira, com o id dela`, () => {
    assert.deepEqual(area.umaSo, area.a);
  });

  test(`${area.nome}: escopo vazio devolve o objeto vazio da área, sem número herdado de ninguém`, () => {
    for (const [campo, valor] of Object.entries(area.vazio)) {
      const aceitavel =
        valor === null ||
        valor === 0 ||
        typeof valor === 'boolean' ||
        (Array.isArray(valor) && valor.length === 0);
      assert.ok(aceitavel, `${campo}: vazio deveria ser 0, null, [] ou booleano — veio ${JSON.stringify(valor)}`);
    }
  });

  test(`${area.nome}: consolidar não mexe nas linhas que recebeu`, () => {
    // Contra o retrato tirado ANTES de consolidar rodar. A versão anterior
    // clonava aqui e comparava com o original — `deepEqual(x, clone(x))` é
    // verdade sempre, e passaria até para um `consolidar` que destruísse as
    // entradas. Mutação silenciosa importa porque as páginas consolidam a MESMA
    // lista mais de uma vez (cards e gráfico), e a segunda chamada veria lixo.
    assert.deepEqual(area.a, area.antesA);
    assert.deepEqual(area.b, area.antesB);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// As duas exceções, ditas pelo nome
// ─────────────────────────────────────────────────────────────────────────────

test('taxa de prenhez do conjunto é recalculada sobre os totais, não é a média das duas taxas', () => {
  const consolidado = consolidarReproducao([reproducaoA, reproducaoB]);
  const mediaDasMedias = ((reproducaoA.taxa_prenhez ?? 0) + (reproducaoB.taxa_prenhez ?? 0)) / 2;

  assert.equal(consolidado.taxa_prenhez, 0.55, '11 positivos em 20 diagnósticos');
  assert.notEqual(consolidado.taxa_prenhez, mediaDasMedias, 'média de médias daria 0,50 e não é a taxa de ninguém');
});

test('taxa de prenhez sem nenhum diagnóstico fica em branco, e não 0% — que seria acusar o cliente de não emprenhar', () => {
  const semDiagnostico = (id: number): LinhaReproducao => ({
    ...reproducaoA,
    propriedade_id: id,
    diagnosticos_12m: 0,
    diagnosticos_positivos_12m: 0,
    taxa_prenhez: null,
  });

  assert.equal(consolidarReproducao([semDiagnostico(11), semDiagnostico(22)]).taxa_prenhez, null);
});

test('FAMACHA médio do conjunto é ponderado pelo histograma, não é a média das médias', () => {
  const consolidado = consolidarSanidade([sanidadeA, sanidadeB]);
  const mediaDasMedias = ((sanidadeA.famacha_medio ?? 0) + (sanidadeB.famacha_medio ?? 0)) / 2;

  assert.equal(consolidado.famacha_medio, 3.64, '182 pontos em 50 medições');
  assert.notEqual(consolidado.famacha_medio, mediaDasMedias, 'a fazenda de 40 medições pesa mais que a de 10');
});

// ─────────────────────────────────────────────────────────────────────────────
// Série temporal: mês sem lançamento não é mês de zero
// ─────────────────────────────────────────────────────────────────────────────

test('mês em que só uma fazenda lançou não ganha um zero pela outra — zero desenharia uma queda que não houve', () => {
  const serie = consolidarReproducao([reproducaoA, reproducaoB]).serie_mensal ?? [];

  assert.deepEqual(serie, [
    { serie: 'coberturas', periodo: '2026-01', valor: 13 },
    { serie: 'partos', periodo: '2026-02', valor: 9 },
  ]);
  assert.ok(
    !serie.some((p) => p.valor === 0),
    'nenhum ponto de valor zero foi inventado para completar o eixo',
  );
  assert.ok(
    !serie.some((p) => p.serie === 'coberturas' && p.periodo === '2026-02'),
    'fevereiro sem cobertura continua ausente da curva de coberturas',
  );
});

test('óbitos mensais somam por mês e mantêm ausente o mês em que ninguém registrou óbito', () => {
  const serie = consolidarSanidade([sanidadeA, sanidadeB]).obitos_mensais ?? [];

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 5 },
    { periodo: '2026-03', valor: 6 },
  ]);
  assert.ok(!serie.some((p) => p.periodo === '2026-02'), 'fevereiro sem óbito não vira "0 óbitos em fevereiro"');
});

// ─────────────────────────────────────────────────────────────────────────────
// Parâmetro de meta, bandeiras e pessoas
// ─────────────────────────────────────────────────────────────────────────────

test('parâmetro de meta só sobrevive quando TODAS as fazendas declaram o mesmo valor', () => {
  const comMeta = (id: number, pesoIdeal: number | null): LinhaCrescimento => ({
    ...crescimentoA,
    propriedade_id: id,
    peso_ideal_desmame: pesoIdeal,
  });

  assert.equal(
    consolidarCrescimento([comMeta(11, 15), comMeta(22, 15)]).peso_ideal_desmame,
    15,
    'duas fazendas na mesma meta continuam com a meta',
  );
  assert.equal(
    consolidarCrescimento([comMeta(11, 15), comMeta(22, 18)]).peso_ideal_desmame,
    null,
    'metas diferentes não viram média nem herdam a da primeira',
  );
  assert.equal(
    consolidarCrescimento([comMeta(11, 15), comMeta(22, null)]).peso_ideal_desmame,
    null,
    'quem deixou o parâmetro em branco não aceitou tacitamente o da vizinha',
  );
});

test('dinheiro preserva o "não sei": todas em branco continua em branco, uma conhecida soma as outras como zero', () => {
  const semReceita: FinanceiroProdutor = { ...financeiroA, receita12m: null };
  const outraSemReceita: FinanceiroProdutor = { ...financeiroB, receita12m: null };

  assert.equal(consolidarFinanceiro([semReceita, outraSemReceita]).receita12m, null);
  assert.equal(
    consolidarFinanceiro([semReceita, financeiroB]).receita12m,
    4000,
    'a fazenda sem lançamento entra como zero quando ALGUÉM tem o número',
  );
});

test('"sem estimativa de custo" só vale quando NENHUMA fazenda tem estimativa', () => {
  const semEstimativa: FinanceiroProdutor = { ...financeiroA, semEstimativa: true };

  assert.equal(consolidarFinanceiro([semEstimativa, financeiroB]).semEstimativa, true);
  assert.equal(
    consolidarFinanceiro([financeiroA, financeiroB]).semEstimativa,
    false,
    'uma fazenda com estimativa já desmente a frase — mas isso não autoriza mostrar custo consolidado',
  );
  assert.equal(
    consolidarFinanceiro([financeiroA, financeiroB]).custoLitro,
    null,
    'e o custo por litro continua em branco de qualquer forma',
  );
});

test('a mesma pessoa em duas fazendas é uma linha só, com o vínculo mais forte e a data mais recente', () => {
  const anaConsultora: PessoaEquipe = { ...ana, vinculo: 'consultoria', ultimoLancamentoEm: '2026-05-01T10:00:00Z' };
  const anaDona: PessoaEquipe = { ...ana, vinculo: 'dono', ultimoLancamentoEm: '2026-08-20T10:00:00Z' };

  const consolidado = consolidarEquipes([
    { ...equipeA, pessoas: [anaConsultora] },
    { ...equipeB, pessoas: [anaDona] },
  ]);

  assert.equal(consolidado.pessoas.length, 1, 'listar três vezes responderia "quantos vínculos", não "quem mexe"');
  assert.equal(consolidado.pessoas[0].usuarioId, ana.usuarioId);
  assert.equal(consolidado.pessoas[0].propriedades, 2);
  assert.equal(consolidado.pessoas[0].vinculo, 'dono');
  assert.equal(consolidado.pessoas[0].ultimoLancamentoEm, '2026-08-20T10:00:00Z');
  assert.equal(consolidado.tecnicosVinculados, 3, 'vínculo continua somando: são fatos por fazenda');
});

test('recência da pessoa não regride: fazenda sem lançamento atribuído não apaga a data que a outra tem', () => {
  const comData: PessoaEquipe = { ...ana, ultimoLancamentoEm: '2026-08-20T10:00:00Z' };
  const semData: PessoaEquipe = { ...ana, ultimoLancamentoEm: null };

  const consolidado = consolidarEquipes([
    { ...equipeA, pessoas: [comData] },
    { ...equipeB, pessoas: [semData] },
  ]);

  assert.equal(consolidado.pessoas[0].ultimoLancamentoEm, '2026-08-20T10:00:00Z');
});
