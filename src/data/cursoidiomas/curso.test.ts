import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { CURSOS, IDIOMA_IDS, contarLicoes, getLicao, licoesDoNivel } from '@/data/cursoidiomas';
import type { Questao } from '@/data/cursoidiomas';
import { normalizarResposta, respostaCorreta } from '@/lib/cursoidiomas/normalizar';

/**
 * Validação estrutural do conteúdo: o TypeScript garante que todo módulo tem
 * uma lista de lições; aqui garantimos que a lista não está vazia, que os ids
 * viram URLs válidas e únicas, e que cada questão é respondível.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validarQuestao(q: Questao, onde: string) {
  switch (q.tipo) {
    case 'escolha':
      assert.ok(q.opcoes.length >= 2, `${onde}: escolha precisa de 2+ opções`);
      assert.ok(q.correta >= 0 && q.correta < q.opcoes.length, `${onde}: índice da correta fora das opções`);
      assert.equal(new Set(q.opcoes).size, q.opcoes.length, `${onde}: opções repetidas`);
      break;
    case 'lacuna':
      assert.equal(q.frase.split('___').length, 2, `${onde}: lacuna precisa de exatamente um ___`);
      for (const r of [q.resposta].flat()) assert.ok(normalizarResposta(r), `${onde}: resposta vira vazio ao normalizar`);
      break;
    case 'traducao':
      for (const r of [q.resposta].flat()) assert.ok(normalizarResposta(r), `${onde}: resposta vira vazio ao normalizar`);
      break;
    case 'ditado':
      assert.ok(normalizarResposta(q.texto), `${onde}: ditado vazio`);
      break;
    case 'ordenar':
      assert.ok(q.resposta.trim().split(/\s+/).length >= 3, `${onde}: ordenar precisa de 3+ palavras`);
      assert.ok(respostaCorreta(q.resposta, q.resposta), `${onde}: ordenar não confere consigo mesmo`);
      break;
  }
}

describe('conteúdo do curso', () => {
  for (const idioma of IDIOMA_IDS) {
    const curso = CURSOS[idioma];

    test(`${idioma}: seis níveis, todo módulo com lição, ids únicos e válidos`, () => {
      assert.equal(curso.niveis.length, 6);
      for (const nivel of curso.niveis) {
        const ids = new Set<string>();
        for (const modulo of nivel.modulos) {
          assert.ok(modulo.licoes.length > 0, `${idioma}/${nivel.id}/${modulo.id} sem lições`);
          for (const licao of modulo.licoes) {
            const onde = `${idioma}/${nivel.id}/${licao.id}`;
            assert.match(licao.id, SLUG, `${onde}: id não é slug`);
            assert.ok(!ids.has(licao.id), `${onde}: id repetido no nível`);
            ids.add(licao.id);
            assert.ok(licao.titulo.trim() && licao.resumo.trim(), `${onde}: sem título/resumo`);
            assert.ok(licao.blocos.length > 0, `${onde}: sem blocos`);
            assert.ok(licao.blocos.some((b) => b.tipo === 'exercicio'), `${onde}: sem exercício`);
            for (const bloco of licao.blocos) {
              if (bloco.tipo === 'exercicio') {
                assert.ok(bloco.questoes.length > 0, `${onde}: exercício vazio`);
                bloco.questoes.forEach((q, i) => validarQuestao(q, `${onde} q${i + 1}`));
              }
              if (bloco.tipo === 'tabela') {
                for (const linha of bloco.linhas) {
                  assert.equal(linha.length, bloco.cabecalho.length, `${onde}: linha de tabela com colunas a mais/menos`);
                }
              }
              if (bloco.tipo === 'vocabulario') {
                assert.ok(bloco.itens.length > 0, `${onde}: vocabulário vazio`);
                const termos = bloco.itens.map((i) => i.termo);
                assert.equal(new Set(termos).size, termos.length, `${onde}: termo repetido no mesmo bloco (chave React)`);
              }
              if (bloco.tipo === 'frases') {
                assert.ok(bloco.itens.length > 0, `${onde}: frases vazias`);
                const textos = bloco.itens.map((i) => i.texto);
                assert.equal(new Set(textos).size, textos.length, `${onde}: frase repetida no mesmo bloco (chave React)`);
              }
              if (bloco.tipo === 'dialogo') assert.ok(bloco.falas.length > 1, `${onde}: diálogo com uma fala só`);
            }
          }
        }
      }
    });

    test(`${idioma}: navegação anterior/próxima é consistente`, () => {
      for (const nivel of curso.niveis) {
        const lista = licoesDoNivel(nivel);
        lista.forEach(({ licao }, i) => {
          const loc = getLicao(idioma, nivel.id, licao.id);
          assert.ok(loc);
          assert.equal(loc.indice, i + 1);
          assert.equal(loc.total, lista.length);
          assert.equal(loc.anterior?.licao.id ?? null, i > 0 ? lista[i - 1].licao.id : null);
          assert.equal(loc.proxima?.licao.id ?? null, i < lista.length - 1 ? lista[i + 1].licao.id : null);
        });
      }
      assert.equal(getLicao(idioma, 'a1', 'nao-existe'), null);
      assert.ok(contarLicoes(curso) > 0);
    });
  }
});

describe('normalização de respostas', () => {
  test('ignora caixa, pontuação final, espaços e ß/œ', () => {
    assert.equal(normalizarResposta('  Ich heiße   Anna! '), 'ich heisse anna');
    assert.equal(normalizarResposta("Le cœur, c'est ça."), "le coeur c'est ça");
    assert.equal(normalizarResposta('l’ avion'), "l'avion");
  });
  test('aceita qualquer uma das alternativas', () => {
    assert.equal(respostaCorreta('Wie geht’s?', ["Wie geht's", 'Wie geht es dir?']), true);
    assert.equal(respostaCorreta('wie gehts', ["Wie geht's"]), true);
    assert.equal(respostaCorreta('Wie heißt du', ["Wie geht's"]), false);
  });
});
