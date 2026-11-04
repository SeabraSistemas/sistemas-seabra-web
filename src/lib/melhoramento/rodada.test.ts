/**
 * O SCRIPT DE RODADAS com um CLIENTE FALSO do supabase-js, em memória:
 * leitura paginada, filtros eq/in, gravação nas views de escrita, status
 * 'rodando' → 'concluida', o pai de outra fazenda (corte) buscado por id e o
 * caminho de erro. Dados simulados — nenhum dado de produtor.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  agruparExecucoes,
  compararComAtual,
  executarRodada,
  pacotesLeite,
  type PortaBanco,
} from '@/lib/melhoramento/rodada';
import { portaSupabase, type ClienteMinimo, type ConsultaMinima } from '@/lib/melhoramento/rodada-supabase';
import { paraRodada, paraResultadoGravado, paraValidacaoGravada, type Linha } from '@/lib/melhoramento/traducao';
import { analisarFazenda } from '@/lib/melhoramento/analise';
import { paraAnimal, paraLactacao } from '@/lib/melhoramento/traducao';

// ── Cliente falso ───────────────────────────────────────────────────────────

/** As views de escrita gravam na mesma "tabela" que a view de leitura lê. */
const TABELA: Record<string, string> = {
  melhoramento_grava_rodada: 'rodada',
  melhoramento_rodada: 'rodada',
  melhoramento_grava_resultado: 'resultado',
  melhoramento_resultado: 'resultado',
  melhoramento_grava_validacao: 'validacao',
  melhoramento_validacao: 'validacao',
  melhoramento_grava_diagnostico: 'diagnostico',
  melhoramento_diagnostico: 'diagnostico',
};

class BancoFalso {
  readonly tabelas = new Map<string, Linha[]>();
  private proximoId = 1;
  leituras = 0;
  falharEm: string | null = null;
  tabela(view: string): Linha[] {
    const t = TABELA[view] ?? view;
    if (!this.tabelas.has(t)) this.tabelas.set(t, []);
    return this.tabelas.get(t)!;
  }
  novoId(): number {
    return this.proximoId++;
  }
}

type RespostaFalsa = { data: unknown[] | null; error: { message: string; code?: string } | null };

class Consulta implements ConsultaMinima {
  private filtros: ((l: Linha) => boolean)[] = [];
  private ordens: string[] = [];
  private faixa: [number, number] | null = null;
  private retorno: string | null = null;
  private readonly banco: BancoFalso;
  private readonly view: string;
  private readonly op: 'select' | 'insert' | 'update';
  private readonly carga: Linha[] | Linha | null;
  constructor(banco: BancoFalso, view: string, op: 'select' | 'insert' | 'update', carga: Linha[] | Linha | null) {
    this.banco = banco;
    this.view = view;
    this.op = op;
    this.carga = carga;
  }
  eq(c: string, v: unknown) {
    this.filtros.push((l) => l[c] === v);
    return this;
  }
  in(c: string, vs: readonly unknown[]) {
    this.filtros.push((l) => vs.includes(l[c]));
    return this;
  }
  order(c: string) {
    this.ordens.push(c);
    return this;
  }
  range(de: number, ate: number) {
    this.faixa = [de, ate];
    return this;
  }
  select(colunas?: string) {
    this.retorno = colunas ?? '*';
    return this;
  }
  then<A = RespostaFalsa, B = never>(
    ok?: ((r: RespostaFalsa) => A | PromiseLike<A>) | null,
    erro?: ((e: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(this.executar()).then(ok, erro);
  }
  private executar(): RespostaFalsa {
    const t = this.banco.tabela(this.view);
    if (this.banco.falharEm === this.view) return { data: null, error: { message: 'falha simulada' } };
    if (this.op === 'select') {
      this.banco.leituras += 1;
      let linhas = t.filter((l) => this.filtros.every((f) => f(l)));
      for (const c of [...this.ordens].reverse()) linhas = [...linhas].sort((a, b) => Number(a[c]) - Number(b[c]));
      if (this.faixa) linhas = linhas.slice(this.faixa[0], this.faixa[1] + 1);
      return { data: linhas.map((l) => ({ ...l })), error: null };
    }
    if (this.op === 'insert') {
      const novas = (this.carga as Linha[]).map((l) => {
        const n: Linha = { ...l };
        if (this.view === 'melhoramento_grava_rodada' || this.view === 'melhoramento_grava_diagnostico') {
          n.id = this.banco.novoId();
          n.criada_em = new Date(Date.UTC(2026, 10, 4, 12, 0, Number(n.id))).toISOString();
        }
        return n;
      });
      t.push(...novas);
      return { data: this.retorno ? novas.map((l) => ({ ...l })) : null, error: null };
    }
    for (const l of t) if (this.filtros.every((f) => f(l))) Object.assign(l, this.carga);
    return { data: null, error: null };
  }
}

function clienteFalso(banco: BancoFalso): ClienteMinimo {
  return {
    from: (view) => ({
      select: (colunas) => new Consulta(banco, view, 'select', null).select(colunas),
      insert: (linhas) => new Consulta(banco, view, 'insert', [...linhas]),
      update: (valores) => new Consulta(banco, view, 'update', valores),
    }),
  };
}

// ── Dados simulados, no formato das views ───────────────────────────────────

function prng(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ESTACOES = ['verao', 'outono', 'inverno', 'primavera'];

function povoar(banco: BancoFalso): void {
  const r = prng(9);
  const faz = banco.tabela('melhoramento_fazenda');
  faz.push({ propriedade_id: 1, especie: 'caprino', nome: 'Fazenda simulada', produtor_id: 10, teste: false, animais: 0, lactacoes: 1, lactacoes_encerradas: 1, lactacoes_sinteticas: 0 });
  faz.push({ propriedade_id: 2, especie: 'caprino', nome: 'Fazenda de teste', produtor_id: 11, teste: true, animais: 0, lactacoes: 1, lactacoes_encerradas: 1, lactacoes_sinteticas: 0 });
  const ped = banco.tabela('melhoramento_pedigree');
  const lact = banco.tabela('melhoramento_lactacao');
  let lid = 1;
  for (let b = 1; b <= 4; b++) ped.push({ animal_id: b, propriedade_id: 1, especie: 'caprino', numero_animal: `B${b}`, nome_animal: null, sexo: 'macho', data_de_nascimento: '2015-01-01', pai_id: null, mae_id: null, raca: null, status: null });
  const ebvBode = [0.3, -0.2, 0.1, 0];
  for (let c = 0; c < 160; c++) {
    const id = 100 + c;
    const pai = 1 + (c % 4);
    ped.push({ animal_id: id, propriedade_id: 1, especie: 'caprino', numero_animal: `C${id}`, nome_animal: null, sexo: 'fêmea', data_de_nascimento: '2018-01-01', pai_id: pai, mae_id: null, raca: null, status: null });
    const pe = (r() - 0.5) * 0.4;
    const nl = 1 + Math.floor(r() * 3);
    for (let k = 0; k < nl; k++) {
      const ano = 2020 + k;
      const est = ESTACOES[Math.floor(r() * 2)];
      const y = 2 + 0.5 * ebvBode[pai - 1] + pe + (r() - 0.5) * 0.8 - (k === 0 ? 0.3 : 0);
      lact.push({
        propriedade_id: 1, especie: 'caprino', lactacao_id: lid++, animal_id: id, raca: null, ordem_lactacao: k + 1,
        lactacoes_do_animal: nl, ordem_parto_cadastro: nl, data_inicio: `${ano}-0${est === 'verao' ? 1 : 4}-10`, ano_parto: ano,
        mes_parto: 1, estacao_parto: est, ano_estacao: ano, idade_parto_dias: 700 + 365 * k, data_encerramento: '2021-01-01',
        encerrada: true, duracao_dias: 200, dias_registrados: 200, total_leite: y * 200, media_leite: y,
        metodo_inferencia: 'DEFINITIVO', confianca_inferencia: null, sintetica: false, pai_id: pai, mae_id: null,
      });
    }
  }
  // Corte: uma fazenda, 5 touros, 80 vacas, 3 safras; a vaca 5000 mora na fazenda 9 (só pedigree).
  const bfaz = banco.tabela('melhoramento_bovino_fazenda');
  bfaz.push({ propriedade_id: 3, nome: 'Corte simulada', produtor_id: 12, teste: false, animais: 0, com_nascimento: 0, com_pai: 0, com_mae: 0, apenas_genealogia: 0, pesagens: 0, pesagens_sem_nascimento: 0, pesagens_janela: 1, animais_janela: 1 });
  const ban = banco.tabela('melhoramento_bovino_animal');
  const bpe = banco.tabela('melhoramento_bovino_pesagem');
  const animalCorte = (id: number, faz: number, sexo: string, nasc: string, pai: number | null, mae: number | null) => ({
    animal_id: id, propriedade_id: faz, sexo, data_de_nascimento: nasc, pai_id: pai, mae_id: mae, receptora_id: null,
    numero: `X${id}`, nome: null, apenas_genealogia: false, status: 'ativo', peso_ao_nascer: null, peso_nascer_parto: null,
    origem_prenhez: 'monta', pais_candidatos: 0,
  });
  for (let t = 1; t <= 5; t++) ban.push(animalCorte(3000 + t, 3, 'macho', '2015-01-01', null, null));
  ban.push(animalCorte(5000, 9, 'femea', '2014-01-01', null, null));
  for (let v = 0; v < 80; v++) ban.push(animalCorte(4000 + v, 3, 'femea', '2016-01-01', null, v === 0 ? 5000 : null));
  let bid = 6000;
  let pid = 1;
  for (let safra = 0; safra < 3; safra++) {
    for (let v = 0; v < 80; v++) {
      bid += 1;
      const sexo = r() < 0.5 ? 'macho' : 'femea';
      const nasc = `${2021 + safra}-10-10`;
      ban.push(animalCorte(bid, 3, sexo, nasc, r() < 0.3 ? 3001 + (v % 5) : null, 4000 + v));
      const p = 190 + (sexo === 'macho' ? 15 : 0) + (r() - 0.5) * 60;
      bpe.push({ pesagem_id: pid++, animal_id: bid, propriedade_id: 3, propriedade_pesagem: 3, data_pesagem: nasc, peso_kg: p - 20, idade_dias: 185, lote_id: 1, condicao_criacao: null });
      bpe.push({ pesagem_id: pid++, animal_id: bid, propriedade_id: 3, propriedade_pesagem: 3, data_pesagem: nasc, peso_kg: p + 24, idade_dias: 240, lote_id: 1, condicao_criacao: null });
    }
  }
}

// ── Testes ──────────────────────────────────────────────────────────────────

test('executarRodada (cliente falso): lê, grava e fecha cada rodada; teste fica de fora; pai de outra fazenda entra', async () => {
  const banco = new BancoFalso();
  povoar(banco);
  const porta = portaSupabase(clienteFalso(banco));
  const resumo = await executarRodada(porta, { especies: ['caprino', 'bovino_corte'], execucao: 'exec-1' });
  assert.deepEqual(resumo.erros, []);
  assert.equal(resumo.fazendas, 2, 'a fazenda de teste não roda');
  const rodadas = banco.tabela('melhoramento_rodada');
  assert.equal(rodadas.length, resumo.rodadas);
  assert.ok(rodadas.every((r) => r.status === 'concluida'));
  assert.ok(rodadas.every((r) => (r.parametros as { execucao: string }).execucao === 'exec-1'));
  assert.ok(rodadas.some((r) => r.especie === 'caprino' && r.modelo === 'blup_h20.2_r0.36' && r.caracteristica === 'media_diaria'));
  assert.ok(rodadas.some((r) => r.especie === 'bovino_corte' && r.modelo === 'blup_h20.24_c0.27' && r.caracteristica === 'p210'));
  // Cada rodada com os resultados de TODOS os animais do ranking (sem o teto de 30).
  const resultados = banco.tabela('melhoramento_resultado');
  assert.equal(resultados.length, resumo.resultados);
  for (const r of rodadas) {
    assert.equal(resultados.filter((x) => x.rodada_id === r.id).length, r.n_animais);
  }
  const femeasBlup = resultados.filter((x) => x.rodada_id === rodadas.find((r) => r.modelo === 'blup_h20.2_r0.36')!.id);
  assert.ok(femeasBlup.filter((x) => (x.extra as { tipo: string }).tipo === 'femea').length > 30);
  // Validação: três métricas por modelo que rodou na validação.
  const val = banco.tabela('melhoramento_validacao');
  assert.ok(val.some((v) => v.metrica === 'correlacao_proxima' && typeof v.valor === 'number'));
  // Diagnóstico: um por fazenda, com a execução.
  const diag = banco.tabela('melhoramento_diagnostico');
  assert.equal(diag.length, 2);
  assert.ok(diag.every((d) => (d.metricas as { execucao: string }).execucao === 'exec-1'));
  // A vaca 5000 (fazenda 9) foi buscada por id para o pedigree.
  const dCorte = diag.find((d) => d.especie === 'bovino_corte')!.metricas as { diagnostico: { pedigree: { externos: number } } };
  assert.equal(dCorte.diagnostico.pedigree.externos, 1);
});

test('executarRodada: falha na gravação marca a rodada como erro e segue para a próxima fazenda', async () => {
  const banco = new BancoFalso();
  povoar(banco);
  banco.falharEm = 'melhoramento_grava_validacao';
  const resumo = await executarRodada(portaSupabase(clienteFalso(banco)), { especies: ['caprino'], execucao: 'exec-erro' });
  assert.equal(resumo.erros.length, 1);
  assert.match(resumo.erros[0].erro, /falha simulada/);
  const rodadas = banco.tabela('melhoramento_rodada');
  assert.equal(rodadas.length, 1);
  assert.equal(rodadas[0].status, 'erro');
  assert.match(String(rodadas[0].observacao), /falha simulada/);
  // A tela só mostra concluídas: a execução quebrada não aparece.
  assert.deepEqual(agruparExecucoes(rodadas.map(paraRodada)), []);
});

test('portaSupabase.ler: pagina de 1.000 em 1.000 com ordem total e respeita o filtro in', async () => {
  const banco = new BancoFalso();
  const t = banco.tabela('v');
  for (let i = 0; i < 2500; i++) t.push({ id: 2500 - i, grupo: i % 3 });
  const porta: PortaBanco = portaSupabase(clienteFalso(banco));
  const linhas = await porta.ler('v', 'id,grupo', { grupo: [0, 2] }, ['id']);
  assert.equal(linhas.length, t.filter((l) => l.grupo !== 1).length);
  assert.ok(linhas.every((l, i) => i === 0 || Number(linhas[i - 1].id) < Number(l.id)), 'ordem total');
  assert.equal(banco.leituras, 2);
});

test('compararComAtual: correlação gravada × atual e o topo que se repete', async () => {
  const banco = new BancoFalso();
  povoar(banco);
  await executarRodada(portaSupabase(clienteFalso(banco)), { especies: ['caprino'], execucao: 'exec-a' });
  const execucoes = agruparExecucoes(banco.tabela('melhoramento_rodada').map(paraRodada));
  assert.equal(execucoes.length, 1);
  const atual = analisarFazenda(
    {
      propriedadeId: 1,
      especie: 'caprino',
      lactacoes: banco.tabela('melhoramento_lactacao').map(paraLactacao),
      animais: banco.tabela('melhoramento_pedigree').map(paraAnimal),
    },
    { ranking: true },
  );
  const comp = compararComAtual(
    execucoes[0],
    banco.tabela('melhoramento_validacao').map(paraValidacaoGravada),
    banco.tabela('melhoramento_resultado').map(paraResultadoGravado),
    atual.caracteristicas.map((c) => ({ caracteristica: c.caracteristica, validacao: c.validacao, ranking: c.rankingFemeas })),
  );
  const blup = comp.find((c) => c.modelo === 'blup_h20.2_r0.36' && c.caracteristica === 'media_diaria')!;
  // Mesmos dados, mesmo motor: a rodada gravada e a de agora coincidem.
  assert.equal(blup.gravada!.correlacao, blup.atual!.correlacao);
  assert.equal(blup.emComumNoTopo, blup.topo);
  assert.equal(blup.topo, 10);
  // pacotesLeite é determinístico: a mesma análise dá as mesmas linhas.
  assert.deepEqual(pacotesLeite(atual, 'x').length, pacotesLeite(atual, 'x').length);
});
