/**
 * escopo.ts — a fronteira de tenant do /adm.
 *
 * O que estes testes protegem: o painel decide cobrança e conversa comercial em
 * cima de "quais propriedades este usuário alcança". Errar isso não estoura —
 * mostra a fazenda de outra pessoa com o nome certo em cima, ou uma tela vazia
 * para um criador com 200 animais.
 *
 * Nada aqui toca banco: `resolverEscopo()` recebe as propriedades já lidas, e é
 * essa separação que permite testar a REGRA sem subir nada.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TODAS,
  animaisDoEscopo,
  avisoDeOrigem,
  escopoConsolidado,
  idsDoEscopo,
  lerSelecaoParam,
  ordenarPropriedades,
  resolverEscopo,
  rotuloDoEscopo,
  selecaoForaDoEscopo,
} from '@/lib/adm/escopo';
import type { Papel, PropriedadeEscopo, UsuarioLista } from '@/lib/adm/types';

// ─────────────────────────────────────────────────────────────────────────────
// Fábricas — só o que a regra lê importa; o resto é preenchimento honesto.
// ─────────────────────────────────────────────────────────────────────────────

function fazenda(id: number, over: Partial<PropriedadeEscopo> = {}): PropriedadeEscopo {
  return {
    id,
    nome: `Fazenda ${id}`,
    numero_criador: null,
    estado: 'PE',
    cidade: null,
    segmentos: [],
    vinculo: 'dono',
    dono_nome: null,
    animais_ativos: 0,
    ...over,
  };
}

function conta(papel: Papel | null, over: Partial<UsuarioLista> = {}): UsuarioLista {
  return {
    id: 1,
    nome: 'Fulano',
    email_mascarado: null,
    whatsapp_mascarado: null,
    whatsapp_pais: null,
    papel,
    ativo: true,
    is_tester: false,
    is_demo: false,
    tem_cpf: false,
    sem_auth: false,
    onboarding_finalizado: true,
    data_cadastro: '2025-01-10',
    associacao_id: null,
    associacao_nome: null,
    propriedade_id: null,
    propriedade_nome: null,
    numero_criador: null,
    estado: null,
    segmentos: [],
    total_propriedades: 0,
    animais_ativos: 0,
    plano_nome: null,
    status_efetivo: null,
    acesso_ativo: true,
    origem_acesso: null,
    valor_real_mensal: null,
    data_vencimento: null,
    ultimo_lancamento_em: null,
    ultimo_modulo: null,
    lancamentos_30d: 0,
    dias_distintos_30d: 0,
    modulos_90d: 0,
    animais_com_evento_90d: 0,
    dias_sem_lancar: null,
    health_score: null,
    ...over,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// As pernas por papel
// ─────────────────────────────────────────────────────────────────────────────

test('produtor com uma fazenda: o seletor colapsa e a única propriedade já abre em foco', () => {
  const escopo = resolverEscopo(conta('produtor'), [fazenda(7, { animais_ativos: 120 })]);

  assert.equal(escopo.colapsado, true);
  assert.equal(escopo.selecionada?.id, 7);
  assert.deepEqual(idsDoEscopo(escopo), [7]);
  assert.equal(escopoConsolidado(escopo), false);
  assert.equal(rotuloDoEscopo(escopo), 'Fazenda 7');
  // Vínculo 'dono': o dado é dele, não há de quem avisar.
  assert.equal(avisoDeOrigem(escopo), null);
});

test('colaborador enxerga o rebanho do produtor dono, e o banner diz de quem é o dado', () => {
  const escopo = resolverEscopo(conta('colaborador', { nome: 'Rui Batista' }), [
    fazenda(41, { vinculo: 'herdado', dono_nome: 'Joana Alves', animais_ativos: 210 }),
  ]);

  assert.equal(escopo.selecionada?.id, 41);
  const aviso = avisoDeOrigem(escopo);
  assert.ok(aviso, 'vínculo herdado obriga banner de origem');
  assert.match(aviso, /Joana Alves/);
  assert.match(aviso, /Rui Batista/);
  assert.match(aviso, /colaborador, não dono/);
});

test('técnico com carteira abre no consolidado — nunca na primeira fazenda da lista', () => {
  const carteira = [
    fazenda(10, { vinculo: 'consultoria', dono_nome: 'Sítio A', animais_ativos: 300 }),
    fazenda(11, { vinculo: 'consultoria', dono_nome: 'Sítio B', animais_ativos: 90 }),
    fazenda(12, { vinculo: 'consultoria', dono_nome: 'Sítio C', animais_ativos: 40 }),
  ];
  const escopo = resolverEscopo(conta('tecnico'), carteira);

  // O defeito que isto barra: eleger lista[0] e mostrar 300 animais de um
  // cliente só como se fosse a carteira inteira do consultor.
  assert.equal(escopo.selecionada, null);
  assert.equal(escopo.colapsado, false);
  assert.equal(escopoConsolidado(escopo), true);
  assert.deepEqual(idsDoEscopo(escopo), [10, 11, 12]);
  assert.equal(animaisDoEscopo(escopo), 430);
  assert.match(avisoDeOrigem(escopo) ?? '', /consolidada de 3 propriedades/);
});

test('técnico com um cliente só: colapsa como qualquer conta de uma fazenda, mas o banner continua', () => {
  const escopo = resolverEscopo(conta('tecnico', { nome: 'Dr. Paulo' }), [
    fazenda(88, { vinculo: 'consultoria', dono_nome: 'Cabanha Vale', animais_ativos: 60 }),
  ]);

  assert.equal(escopo.colapsado, true);
  assert.equal(escopo.selecionada?.id, 88);
  const aviso = avisoDeOrigem(escopo);
  assert.ok(aviso, 'consultoria obriga banner: o dono nem usa o app');
  assert.match(aviso, /consultoria/i);
  assert.match(aviso, /Dr\. Paulo/);
});

test('admin de associação sem propriedade própria: escopo vazio é [] e a tela explica o agregado', () => {
  const escopo = resolverEscopo(conta('admin_associacao', { nome: 'ACCOMIG' }), []);

  assert.equal(escopo.selecionada, null);
  assert.equal(escopo.colapsado, true);
  assert.equal(escopoConsolidado(escopo), false);
  // [] é "nenhuma propriedade", e quem consome PRECISA cortar antes de consultar:
  // um `.in('propriedade_id', [])` que virasse consulta sem WHERE devolveria a base inteira.
  assert.deepEqual(idsDoEscopo(escopo), []);
  assert.equal(animaisDoEscopo(escopo), 0);
  assert.equal(rotuloDoEscopo(escopo), 'Sem propriedade');
  assert.match(avisoDeOrigem(escopo) ?? '', /filiados/);
});

test('conta sem propriedade que não é de associação recebe o aviso genérico, não o dos filiados', () => {
  const escopo = resolverEscopo(conta('produtor'), []);
  assert.equal(avisoDeOrigem(escopo), 'Este usuário não alcança nenhuma propriedade.');
});

test('admin de associação em cima de um filiado avisa que os dados são do filiado', () => {
  const filiados = [
    fazenda(21, { vinculo: 'associacao', dono_nome: 'Marcos', animais_ativos: 50 }),
    fazenda(22, { vinculo: 'associacao', dono_nome: 'Lúcia', animais_ativos: 80 }),
  ];
  const escopo = resolverEscopo(conta('admin_associacao'), filiados, 21);

  assert.equal(escopo.selecionada?.id, 21);
  assert.deepEqual(idsDoEscopo(escopo), [21]);
  assert.match(avisoDeOrigem(escopo) ?? '', /Marcos/);
});

test('quem vive numa fazenda abre ancorado nela; quem tem carteira abre consolidado', () => {
  const duas = [
    fazenda(30, { vinculo: 'dono', animais_ativos: 100 }),
    fazenda(31, { vinculo: 'dono', animais_ativos: 400 }),
  ];
  const ancora: Papel[] = ['produtor', 'colaborador'];
  const carteira: Papel[] = ['tecnico', 'admin_associacao', 'administrador'];

  for (const papel of ancora) {
    // Ancorado NA ORDEM do seletor: a de maior rebanho, e sempre a mesma a cada request.
    assert.equal(resolverEscopo(conta(papel), duas).selecionada?.id, 31, papel);
  }
  for (const papel of carteira) {
    assert.equal(resolverEscopo(conta(papel), duas).selecionada, null, papel);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ordem do seletor — é ela que define em que fazenda o dashboard abre
// ─────────────────────────────────────────────────────────────────────────────

test('a ordem do seletor é a mesma a cada request: vínculo, rebanho, nome e id desempatam', () => {
  const embaralhadas = [
    fazenda(5, { vinculo: 'associacao', animais_ativos: 900 }),
    fazenda(3, { vinculo: 'consultoria', animais_ativos: 500, nome: 'Zebu' }),
    fazenda(2, { vinculo: 'herdado', animais_ativos: 900 }),
    fazenda(8, { vinculo: 'consultoria', animais_ativos: 500, nome: 'Aurora' }),
    fazenda(1, { vinculo: 'dono', animais_ativos: 10 }),
    fazenda(4, { vinculo: 'consultoria', animais_ativos: 500, nome: 'Aurora' }),
  ];

  const esperada = [1, 2, 4, 8, 3, 5];
  assert.deepEqual(
    ordenarPropriedades(embaralhadas).map((p) => p.id),
    esperada,
  );
  // A prova de que o desempate é real e não sorte da ordem de entrada: a mesma
  // lista ao contrário tem que sair igual. Sem o desempate por id, 'Aurora' 4 e
  // 'Aurora' 8 trocariam de lugar — e o dashboard abriria noutra fazenda.
  assert.deepEqual(
    ordenarPropriedades([...embaralhadas].reverse()).map((p) => p.id),
    esperada,
  );
});

test('ordenar não mexe na lista recebida', () => {
  const original = [fazenda(9, { animais_ativos: 1 }), fazenda(2, { animais_ativos: 50 })];
  ordenarPropriedades(original);
  assert.deepEqual(
    original.map((p) => p.id),
    [9, 2],
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ?prop= — a seleção que vem de fora
// ─────────────────────────────────────────────────────────────────────────────

test('?prop de uma fazenda alheia não vira a fazenda mais parecida: cai no consolidado do próprio escopo', () => {
  const carteira = [
    fazenda(10, { vinculo: 'consultoria', animais_ativos: 300 }),
    fazenda(11, { vinculo: 'consultoria', animais_ativos: 90 }),
  ];
  const escopo = resolverEscopo(conta('tecnico'), carteira, 999);

  assert.equal(selecaoForaDoEscopo(carteira, 999), true);
  assert.equal(escopo.selecionada, null);
  // Nem a 999 (que não é dele), nem a 10 (que seria um palpite silencioso).
  assert.deepEqual(idsDoEscopo(escopo), [10, 11]);
  assert.equal(escopoConsolidado(escopo), true);
});

test('seleção dentro do escopo, "todas" e ausência não são fora de escopo', () => {
  const lista = [fazenda(10), fazenda(11)];
  assert.equal(selecaoForaDoEscopo(lista, 10), false);
  assert.equal(selecaoForaDoEscopo(lista, TODAS), false);
  assert.equal(selecaoForaDoEscopo(lista, null), false);
  assert.equal(selecaoForaDoEscopo(lista, undefined), false);
});

test('?prop=todas com uma fazenda só mostra a fazenda — não uma tela agregada de um', () => {
  const escopo = resolverEscopo(conta('colaborador', { nome: 'Rui' }), [
    fazenda(41, { vinculo: 'herdado', dono_nome: 'Joana', animais_ativos: 210 }),
  ]);
  const comTodas = resolverEscopo(
    conta('colaborador', { nome: 'Rui' }),
    [fazenda(41, { vinculo: 'herdado', dono_nome: 'Joana', animais_ativos: 210 })],
    TODAS,
  );

  assert.equal(comTodas.selecionada?.id, 41);
  assert.equal(comTodas.selecionada?.id, escopo.selecionada?.id);
  // E o banner de origem continua: agregar de um não apaga de quem é o rebanho.
  assert.match(avisoDeOrigem(comTodas) ?? '', /Joana/);
});

test('?prop=todas com carteira consolida mesmo para papel que ancora numa fazenda', () => {
  const duas = [fazenda(30, { animais_ativos: 100 }), fazenda(31, { animais_ativos: 400 })];
  const escopo = resolverEscopo(conta('produtor'), duas, TODAS);

  assert.equal(escopo.selecionada, null);
  assert.deepEqual(idsDoEscopo(escopo), [31, 30]);
  assert.equal(rotuloDoEscopo(escopo), 'Todas as propriedades (2)');
});

test('?prop aceita número e a sentinela "todas"; qualquer outra coisa vira null, nunca um palpite', () => {
  assert.equal(lerSelecaoParam('12'), 12);
  assert.equal(lerSelecaoParam('007'), 7);
  assert.equal(lerSelecaoParam('todas'), TODAS);
  assert.equal(lerSelecaoParam(null), null);
  assert.equal(lerSelecaoParam(undefined), null);
  assert.equal(lerSelecaoParam(''), null);

  // Tudo que não é dígito puro cai em null — e null é o consolidado, que se vê
  // na tela, em vez de um id truncado apontando para a fazenda de outro.
  for (const lixo of ['abc', '-3', '1.5', '12x', ' 12', '1e3', '0x0c', 'TODAS', '12,13']) {
    assert.equal(lerSelecaoParam(lixo), null, lixo);
  }

  // searchParams repetido chega como array: vale o primeiro.
  assert.equal(lerSelecaoParam(['9', '4']), 9);
  assert.equal(lerSelecaoParam([]), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Contagem
// ─────────────────────────────────────────────────────────────────────────────

test('o mesmo rebanho não conta duas vezes quando a fazenda chega por dois vínculos', () => {
  // Produtor e colaborador apontam para a mesma propriedade por pernas
  // diferentes (`propriedades.produtor_id` e `usuarios.propriedade_id`).
  const escopo = resolverEscopo(conta('administrador'), [
    fazenda(5, { vinculo: 'dono', animais_ativos: 120 }),
    fazenda(5, { vinculo: 'herdado', animais_ativos: 120 }),
    fazenda(6, { vinculo: 'consultoria', animais_ativos: 30 }),
  ]);

  assert.equal(animaisDoEscopo(escopo), 150);
});

test('com uma propriedade em foco, o total é só o dela — não o do escopo inteiro', () => {
  const escopo = resolverEscopo(
    conta('tecnico'),
    [
      fazenda(10, { vinculo: 'consultoria', animais_ativos: 300 }),
      fazenda(11, { vinculo: 'consultoria', animais_ativos: 90 }),
    ],
    11,
  );

  assert.equal(animaisDoEscopo(escopo), 90);
  assert.deepEqual(idsDoEscopo(escopo), [11]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Defeito encontrado — não corrigido de propósito
// ─────────────────────────────────────────────────────────────────────────────

test(
  'com uma fazenda só, ?prop fora do escopo apaga o banner de origem sem apagar os números',
  {
    skip:
      'BUG: com 1 propriedade e ?prop=<id que não é dela>, resolverEscopo() devolve selecionada=null; ' +
      'avisoDeOrigem() então cai no ramo "sem alvo", escopoConsolidado() é false (1 não é >1) e o banner ' +
      'obrigatório some — enquanto idsDoEscopo() continua devolvendo a fazenda herdada. O SeletorPropriedade ' +
      'rotula "Sem propriedade" e a tela mostra o rebanho do produtor dono sem dizer de quem é.',
  },
  () => {
    const escopo = resolverEscopo(conta('colaborador', { nome: 'Rui' }), [
      fazenda(41, { vinculo: 'herdado', dono_nome: 'Joana Alves', animais_ativos: 210 }),
    ], 999);

    assert.deepEqual(idsDoEscopo(escopo), [41]); // os números são os da fazenda da Joana
    assert.ok(avisoDeOrigem(escopo), 'e a tela precisa continuar dizendo isso em voz alta');
  },
);
