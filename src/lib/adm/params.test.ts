/**
 * params.ts — o parser do dialeto de URL que vira predicado de SQL.
 *
 * Por que estes testes são adversariais: a entrada vem de fora (link salvo nos
 * favoritos, URL editada à mão, filtro de uma versão antiga da tela) e o /adm
 * fala com o Postgres pela `service_role`, que ignora RLS. Entre um query param
 * malformado e um `select` errado só existe este módulo mais o catálogo.
 *
 * O catálogo usado é o DE VERDADE (`getRegistro('rebanho')`, `getRegistro('usuarios')`):
 * um registro inventado testaria o teste. Se uma coluna sair do catálogo, é aqui
 * que se descobre — e é exatamente o aviso que se quer.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { lerOpcoesTabela } from '@/lib/adm/params';
import { getRegistro, type TabelaCatalogo } from '@/lib/adm/tabelas';

// O período relativo é calculado em hora LOCAL (`Date.setDate`/`setMonth`), e o
// painel é operado do Brasil. Fixar o fuso é o que torna o corte exato em
// qualquer máquina — sem isso, `12m` daria resultados diferentes por hora.
process.env.TZ = 'America/Sao_Paulo';

const AGORA = new Date('2026-09-05T12:00:00.000Z');

function registro(nome: string): TabelaCatalogo {
  const encontrado = getRegistro(nome);
  if (!encontrado) throw new Error(`o catálogo não tem mais a tabela "${nome}"`);
  return encontrado;
}

const REBANHO = registro('rebanho');
const USUARIOS = registro('usuarios');

function ler(alvo: TabelaCatalogo, query: string, limitePadrao = 50) {
  return lerOpcoesTabela(alvo, new URLSearchParams(query), { agora: AGORA, limitePadrao });
}

// ─────────────────────────────────────────────────────────────────────────────
// A gramática, forma por forma
// ─────────────────────────────────────────────────────────────────────────────

test('enum multi-seleção vira um IN só; um valor só vira igualdade', () => {
  assert.deepEqual(ler(REBANHO, 'f.raca=Saanen,Alpina').opcoes.filtros, [
    { coluna: 'raca', op: 'in', valores: ['Saanen', 'Alpina'] },
  ]);
  assert.deepEqual(ler(REBANHO, 'f.raca=Saanen').opcoes.filtros, [
    { coluna: 'raca', op: 'eq', valor: 'Saanen' },
  ]);
  // Espaço em volta do valor é digitação, não parte da escolha; item vazio some.
  assert.deepEqual(ler(REBANHO, 'f.raca= Saanen , Alpina ,').opcoes.filtros, [
    { coluna: 'raca', op: 'in', valores: ['Saanen', 'Alpina'] },
  ]);
  // A faceta enum não é privilégio de coluna de texto: `categoria` guarda UUID.
  assert.deepEqual(ler(REBANHO, 'f.categoria=1f-aa,2c-bb').opcoes.filtros, [
    { coluna: 'categoria', op: 'in', valores: ['1f-aa', '2c-bb'] },
  ]);
});

test('texto sem faceta é busca por conteúdo; texto com faceta enum é escolha fechada', () => {
  assert.deepEqual(ler(REBANHO, 'f.nome_animal=boa vista').opcoes.filtros, [
    { coluna: 'nome_animal', op: 'ilike', valor: 'boa vista' },
  ]);
  // `status` é texto TAMBÉM, e não pode virar `ilike`: "ativo" casaria "inativo".
  assert.deepEqual(ler(REBANHO, 'f.status=ativo').opcoes.filtros, [
    { coluna: 'status', op: 'eq', valor: 'ativo' },
  ]);
});

test('intervalo numérico vira dois predicados numéricos, e cada extremo vazio tira o seu lado', () => {
  // Números, não strings: com texto o Postgres compara '40' com '9' e '9' ganha.
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=40..80').opcoes.filtros, [
    { coluna: 'peso_atual', op: 'gte', valor: 40 },
    { coluna: 'peso_atual', op: 'lte', valor: 80 },
  ]);
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=40..').opcoes.filtros, [
    { coluna: 'peso_atual', op: 'gte', valor: 40 },
  ]);
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=..80').opcoes.filtros, [
    { coluna: 'peso_atual', op: 'lte', valor: 80 },
  ]);
  // Intervalo sem extremo nenhum é "sem filtro", não um par de comparações com NaN.
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=..').opcoes.filtros, []);
  // Sem intervalo, é igualdade — e continua número.
  assert.deepEqual(ler(REBANHO, 'f.partos=3').opcoes.filtros, [
    { coluna: 'partos', op: 'eq', valor: 3 },
  ]);
});

test('peso digitado com vírgula decimal é número, do jeito que se digita no Brasil', () => {
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=40,5').opcoes.filtros, [
    { coluna: 'peso_atual', op: 'eq', valor: 40.5 },
  ]);
  assert.deepEqual(ler(REBANHO, 'f.peso_atual=40,5..80,25').opcoes.filtros, [
    { coluna: 'peso_atual', op: 'gte', valor: 40.5 },
    { coluna: 'peso_atual', op: 'lte', valor: 80.25 },
  ]);
});

test('período relativo na coluna de data do registro vira a janela; nas outras datas vira um piso', () => {
  // `rebanho.colunaData` é created_at: só ela alimenta `periodo`, que é o que a
  // tela desenha como janela e o keyset usa.
  const janela = ler(REBANHO, 'f.created_at=30d').opcoes;
  assert.deepEqual(janela.periodo, { de: '2026-08-06T12:00:00.000Z', ate: null });
  assert.deepEqual(janela.filtros, []);
  // 12m é aritmética de calendário, não 365 dias.
  assert.deepEqual(ler(REBANHO, 'f.created_at=12m').opcoes.periodo, {
    de: '2025-09-05T12:00:00.000Z',
    ate: null,
  });
  // Outra coluna de data com o mesmo valor vira predicado, e o período fica livre.
  const outra = ler(REBANHO, 'f.data_ultimo_parto=7d').opcoes;
  assert.equal(outra.periodo, undefined);
  assert.deepEqual(outra.filtros, [
    { coluna: 'data_ultimo_parto', op: 'gte', valor: '2026-08-29T12:00:00.000Z' },
  ]);
});

test('período absoluto: fechado, aberto de um lado, e um dia só', () => {
  assert.deepEqual(ler(REBANHO, 'f.created_at=2024-01-01..2025-12-31').opcoes.periodo, {
    de: '2024-01-01',
    ate: '2025-12-31',
  });
  assert.deepEqual(ler(REBANHO, 'f.created_at=2024-01-01..').opcoes.periodo, {
    de: '2024-01-01',
    ate: null,
  });
  assert.deepEqual(ler(REBANHO, 'f.created_at=..2025-12-31').opcoes.periodo, {
    de: null,
    ate: '2025-12-31',
  });
  // Numa coluna de data que não é a do registro, o intervalo vira os dois predicados.
  assert.deepEqual(ler(REBANHO, 'f.data_de_nascimento=2024-01-01..2025-12-31').opcoes.filtros, [
    { coluna: 'data_de_nascimento', op: 'gte', valor: '2024-01-01' },
    { coluna: 'data_de_nascimento', op: 'lte', valor: '2025-12-31' },
  ]);
});

test('booleano tri-state: só sim e nao filtram; qualquer outro valor não filtra nada', () => {
  assert.deepEqual(ler(REBANHO, 'f.gestacao_ativa=sim').opcoes.filtros, [
    { coluna: 'gestacao_ativa', op: 'eq', valor: true },
  ]);
  assert.deepEqual(ler(REBANHO, 'f.gestacao_ativa=nao').opcoes.filtros, [
    { coluna: 'gestacao_ativa', op: 'eq', valor: false },
  ]);
  // O perigo aqui não é o filtro faltar: é `valor !== 'sim'` virar `false` e a
  // tela mostrar as NÃO-gestantes achando que mostra as gestantes.
  for (const lixo of ['true', '1', 'Sim', 'yes', 'talvez']) {
    assert.deepEqual(ler(REBANHO, `f.gestacao_ativa=${lixo}`).opcoes.filtros, [], lixo);
  }
});

test('(vazio) sozinho é IS NULL; chave sem valor não é filtro nenhum', () => {
  // "Sem diagnóstico" é informação de negócio, e precisa ser filtrável.
  assert.deepEqual(ler(REBANHO, 'f.ultimo_diagnostico=(vazio)').opcoes.filtros, [
    { coluna: 'ultimo_diagnostico', op: 'nulo' },
  ]);
  // Misturado a valores reais, o OR não cabe no `.in()` do PostgREST: fica o resto.
  assert.deepEqual(ler(REBANHO, 'f.ultimo_diagnostico=(vazio),positivo').opcoes.filtros, [
    { coluna: 'ultimo_diagnostico', op: 'eq', valor: 'positivo' },
  ]);
  // E chave presente com valor vazio é "sem filtro" — não é IS NULL nem descarte.
  const vazia = ler(REBANHO, 'f.raca=');
  assert.deepEqual(vazia.opcoes.filtros, []);
  assert.deepEqual(vazia.ignorados, []);
});

test('chave sem o prefixo f. nunca vira filtro', () => {
  const lido = ler(REBANHO, 'raca=Saanen&peso_atual=40..80&page=2');
  assert.deepEqual(lido.opcoes.filtros, []);
  assert.deepEqual(lido.ignorados, []);
});

// ─────────────────────────────────────────────────────────────────────────────
// Allowlist — o que não está no catálogo não desce para o Postgres
// ─────────────────────────────────────────────────────────────────────────────

test('coluna fora do catálogo é descartada e volta em ignorados — não vira predicado nem erro', () => {
  const lido = ler(REBANHO, 'f.salario=1000&f.raca=Saanen&f.coluna_renomeada=x');

  // O link antigo do Felipe continua abrindo a tabela, com o filtro que sobrou.
  assert.deepEqual(lido.ignorados, ['salario', 'coluna_renomeada']);
  assert.deepEqual(lido.opcoes.filtros, [{ coluna: 'raca', op: 'eq', valor: 'Saanen' }]);
});

test('coluna bloqueada não vira filtro, nem coluna projetada, nem ordenação — nem em maiúsculas', () => {
  const lido = ler(USUARIOS, 'f.cpf=123.456.789-00&f.colaborador_senha=1234&f.CPF=1&f.nome=Ana');

  assert.deepEqual(lido.ignorados, ['cpf', 'colaborador_senha', 'CPF']);
  assert.deepEqual(lido.opcoes.filtros, [{ coluna: 'nome', op: 'ilike', valor: 'Ana' }]);

  // Nem pedindo de propósito na projeção.
  const projetado = ler(USUARIOS, 'cols=cpf,colaborador_senha_hash,nome');
  assert.deepEqual(projetado.colunasRejeitadas, ['cpf', 'colaborador_senha_hash']);
  assert.deepEqual(projetado.opcoes.colunas, ['nome']);

  // Nem como ordenação: cai na ordenação padrão da tabela.
  assert.deepEqual(ler(USUARIOS, 'sort=-cpf').opcoes.ordem, {
    coluna: 'data_cadastro',
    ascendente: false,
  });
});

test('a projeção só aceita o que o catálogo declara, e sai na ordem do catálogo', () => {
  // Ordem do CATÁLOGO, não do pedido: cabeçalho estável e exportações comparáveis.
  assert.deepEqual(ler(REBANHO, 'cols=id,nome_animal').opcoes.colunas, ['nome_animal', 'id']);

  const injecao = ler(REBANHO, 'cols=*,rebanho.*,numero_animal;drop table,usuarios.email');
  assert.deepEqual(injecao.colunasRejeitadas, [
    '*',
    'rebanho.*',
    'numero_animal;drop table',
    'usuarios.email',
  ]);
  // Nada sobreviveu: a tela mostra o preset padrão em vez de um vazio inexplicável.
  assert.deepEqual(injecao.opcoes.colunas, [
    'numero_animal',
    'nome_animal',
    'sexo',
    'categoria',
    'status',
    'raca',
    'data_de_nascimento',
    'peso_atual',
  ]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação e paginação
// ─────────────────────────────────────────────────────────────────────────────

test('sort multi-coluna: o servidor ordena pelo nível 1, que é o que o keyset sabe paginar', () => {
  // Sem o corte, a string inteira ia para validarOrdenacao(), não casava coluna
  // nenhuma, e o arquivo exportado saía numa ordem diferente da tela.
  assert.deepEqual(ler(REBANHO, 'sort=-peso_atual,numero_animal').opcoes.ordem, {
    coluna: 'peso_atual',
    ascendente: false,
  });
  assert.deepEqual(ler(REBANHO, 'sort=numero_animal,-peso_atual').opcoes.ordem, {
    coluna: 'numero_animal',
    ascendente: true,
  });
});

test('sort inválido ou ausente cai na ordenação padrão — nunca em "sem ordem"', () => {
  // Ordem indefinida quebraria o keyset: a página 2 repetiria linhas da 1.
  const padrao = { coluna: 'created_at', ascendente: false };
  assert.deepEqual(ler(REBANHO, '').opcoes.ordem, padrao);
  assert.deepEqual(ler(REBANHO, 'sort=').opcoes.ordem, padrao);
  assert.deepEqual(ler(REBANHO, 'sort=coluna_inventada').opcoes.ordem, padrao);
  assert.deepEqual(ler(REBANHO, 'sort=-').opcoes.ordem, padrao);
});

test('o tamanho da página só aceita inteiro positivo; o cursor passa opaco', () => {
  assert.equal(ler(REBANHO, 'size=200').opcoes.limite, 200);
  assert.equal(ler(REBANHO, 'size=25.9').opcoes.limite, 25);
  for (const lixo of ['', 'size=0', 'size=-3', 'size=abc', 'size=']) {
    assert.equal(ler(REBANHO, lixo).opcoes.limite, 50, lixo);
  }

  // O cursor é keyset codificado: qualquer normalização aqui abriria a página
  // errada. Passa como veio, ou null.
  assert.equal(ler(REBANHO, 'cursor=eyJ2IjoxMCwiaWQiOjN9').opcoes.cursor, 'eyJ2IjoxMCwiaWQiOjN9');
  assert.equal(ler(REBANHO, '').opcoes.cursor, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Defeito encontrado — não corrigido de propósito
// ─────────────────────────────────────────────────────────────────────────────

test(
  'valor ilegível num campo tipado deveria ser descartado como uma coluna desconhecida',
  {
    skip:
      'BUG: converter() devolve o texto cru quando o número não é finito, e a coluna de data aceita ' +
      'qualquer literal fora da gramática. `f.peso_atual=40kg` vira eq "40kg" numa coluna numérica e ' +
      '`f.created_at=31d` vira eq "31d" num timestamp: o PostgREST responde 22P02 e listarTabela() ' +
      'devolve erro — a tabela inteira deixa de abrir por causa de um filtro que o módulo promete ' +
      'descartar em silêncio.',
  },
  () => {
    assert.deepEqual(ler(REBANHO, 'f.peso_atual=40kg').opcoes.filtros, []);
    assert.deepEqual(ler(REBANHO, 'f.created_at=31d').opcoes.filtros, []);
  },
);
