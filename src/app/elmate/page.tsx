'use client';

import { useCallback, useEffect, useState } from 'react';
import { deckCss } from './deck.css';

/** Ato de cada ecrã, por índice. 0 = capa (sem ato). */
const ACT_OF = [0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
const ACT_NAMES = ['Capa', 'Ato I · O modelo', 'Ato II · A fronteira', 'Ato III · O contrato'];
const TOTAL = ACT_OF.length;

/** Tempo médio entre pedido e entrega, só dos chamados abertos pela Elmate. */
const MESES = [
  { mes: 'Jun · 8 pedidos', largura: '100%', valor: '147 h', rapido: false },
  { mes: 'Jul · 7 pedidos', largura: '56%', valor: '83 h', rapido: false },
  { mes: 'Ago · 2 pedidos', largura: '2.2%', valor: '3,2 h', rapido: true },
  { mes: 'Set · 1 pedido', largura: '1.6%', valor: '2,3 h', rapido: true },
];

export default function ElmateDeck() {
  const [i, setI] = useState(0);

  const go = useCallback((n: number) => {
    setI(Math.max(0, Math.min(TOTAL - 1, n)));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setI((v) => Math.min(TOTAL - 1, v + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setI((v) => Math.max(0, v - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setI(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setI(TOTAL - 1);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [i]);

  const slide = (n: number, extra = '') =>
    `slide ${extra} ${n === i ? 'is-active' : ''}`.replace(/\s+/g, ' ').trim();

  // agrupa os ticks por ato, preservando a ordem dos ecrãs
  const groups: { act: number; from: number; count: number }[] = [];
  ACT_OF.forEach((a, n) => {
    const last = groups[groups.length - 1];
    if (last && last.act === a) last.count += 1;
    else groups.push({ act: a, from: n, count: 1 });
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: deckCss }} />
      <div className="warp" />

      <div className="deck">
        {/* 1 — capa */}
        <section className={slide(0, 'cover')}>
          <p className="cover-parties">
            ELMATE <span className="x">×</span> SEABRA SOLUTIONS
          </p>
          <div>
            <h1>Como funciona o contrato</h1>
            <p className="lede" style={{ marginTop: '1.5rem' }}>
              Sistema de gestão modular em regime de subscrição. O que se paga, o que nunca se paga,
              e o que ainda falta escrever.
            </p>
          </div>
          <div className="cover-foot">
            <span>Reunião de 4 de setembro de 2026</span>
            <span>Minuta versão 2 · 09/07/2026</span>
            <span>Confidencial</span>
          </div>
        </section>

        {/* 2 — a pergunta */}
        <section className={slide(1)}>
          <p className="eyebrow">
            <span className="act">Ato I · O modelo</span>
            <span className="sep">/</span>
            <span>A pergunta</span>
          </p>
          <div className="body-row">
            <p className="question">«A Elmate vai ser cobrada pelo desenvolvimento?»</p>
            <p className="answer">Não.</p>
            <p className="thesis-note">
              Nem hoje, nem quando pedirem um setor novo. O que a Seabra constrói, a Seabra paga. O
              que se segue mostra onde isso está escrito no contrato — e onde ainda falta escrever.
            </p>
          </div>
        </section>

        {/* 3 — tese */}
        <section className={slide(2)}>
          <p className="eyebrow">
            <span className="act">Ato I · O modelo</span>
            <span className="sep">/</span>
            <span>Numa frase</span>
          </p>
          <div className="body-row">
            <p className="thesis">
              <span className="b">A Elmate aluga.</span>
              <span className="b">A Seabra constrói.</span>
            </p>
            <p className="thesis-note">
              O investimento em desenvolvimento é do Prestador, por sua conta e risco. A Elmate paga a
              utilização, mês a mês, apenas dos módulos que tem ligados — e nada mais.
            </p>
          </div>
        </section>

        {/* 4 — a vida de um módulo */}
        <section className={slide(3)}>
          <p className="eyebrow">
            <span className="act">Ato I · O modelo</span>
            <span className="sep">/</span>
            <span>A vida de um módulo</span>
          </p>
          <div className="body-row">
            <h2>Sete passos. A conta começa no sexto.</h2>
            <div className="rail">
              <div className="step">
                <span className="step-n">01</span>
                <h3 className="step-t">Pedido</h3>
                <p className="step-d">A Elmate pede um setor novo.</p>
                <span className="chip chip-free">0 €</span>
              </div>
              <div className="step">
                <span className="step-n">02</span>
                <h3 className="step-t">Orçamento da mensalidade</h3>
                <p className="step-d">
                  A Seabra diz quanto passa a custar por mês. Nunca quanto custa construir.
                </p>
                <span className="chip chip-free">0 €</span>
              </div>
              <div className="step">
                <span className="step-n">03</span>
                <h3 className="step-t">Aprovação escrita</h3>
                <p className="step-d">A Elmate aprova a mensalidade. Sem aprovação, nada avança.</p>
                <span className="chip chip-free">0 €</span>
              </div>
              <div className="step">
                <span className="step-n">04</span>
                <h3 className="step-t">Construção</h3>
                <p className="step-d">A Seabra desenvolve por sua conta e risco.</p>
                <span className="chip chip-free">0 €</span>
              </div>
              <div className="step">
                <span className="step-n">05</span>
                <h3 className="step-t">30 dias de teste</h3>
                <p className="step-d">
                  Em produção, a usar a sério. Tudo o que for preciso afinar entra sem custo.
                </p>
                <span className="chip chip-free">0 €</span>
              </div>
              <div className="step is-pay">
                <span className="step-n">06</span>
                <h3 className="step-t">Dia 31</h3>
                <p className="step-d">O módulo fica validado e começa a mensalidade.</p>
                <span className="chip chip-pay">mensalidade</span>
              </div>
              <div className="step">
                <span className="step-n">07</span>
                <h3 className="step-t">Utilização</h3>
                <p className="step-d">Correções, suporte e formação, sem prazo de validade.</p>
                <span className="chip chip-free">incluído</span>
              </div>
            </div>
            <p className="rail-legend">
              <span>
                Cinco passos antes de existir qualquer valor a pagar.{' '}
                <strong>O custo de construir o módulo é sempre da Seabra</strong> — em nenhum ponto
                deste percurso a Elmate paga desenvolvimento.
              </span>
            </p>
          </div>
        </section>

        {/* 5 — a fronteira */}
        <section className={slide(4)}>
          <p className="eyebrow">
            <span className="act">Ato II · A fronteira</span>
            <span className="sep">/</span>
            <span>Correção ou evolução</span>
          </p>
          <div className="body-row">
            <h2>Só existe uma fronteira</h2>
            <div className="split">
              <div className="col col-moss">
                <span className="col-tag">Correção · incluída para sempre</span>
                <h3>Algo que devia funcionar e não funciona</h3>
                <p className="col-def">
                  Nunca se paga, não tem prazo, não depende de orçamento. Enquanto o módulo estiver
                  ligado, a correção é obrigação da Seabra.
                </p>
                <ul>
                  <li>A OF não aparece no filtro de pesquisa</li>
                  <li>A exportação para Excel falha</li>
                  <li>Uma contagem aparece a zero</li>
                  <li>Um lançamento não grava</li>
                </ul>
                <p className="col-rule">Correção nunca se paga.</p>
              </div>
              <div className="col col-indigo">
                <span className="col-tag">Evolução · orçada antes</span>
                <h3>Algo novo, que nunca existiu</h3>
                <p className="col-def">
                  Pedido depois de o módulo estar validado, que acrescenta ao que foi entregue. Leva
                  orçamento primeiro e só avança com aprovação escrita da Elmate.
                </p>
                <ul>
                  <li>Uma coluna nova na Ordem de Fabrico</li>
                  <li>Um relatório que não existia</li>
                  <li>Um campo com uma regra de negócio nova</li>
                  <li>Ligação a outro sistema</li>
                </ul>
                <p className="col-rule">Evolução nunca se faz sem a vossa aprovação escrita.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 — já está no sistema */}
        <section className={slide(5)}>
          <p className="eyebrow">
            <span className="act">Ato II · A fronteira</span>
            <span className="sep">/</span>
            <span>Já está no vosso sistema</span>
          </p>
          <div className="body-row">
            <h2>Isto não é um conceito novo do contrato</h2>
            <div className="two-up">
              <div>
                <p className="lede">
                  A Central de Chamados classifica cada pedido desde 30 de maio. É um campo que a
                  Rafaela já preenche quando abre uma solicitação — e fica registado, com data e
                  autor, no histórico do chamado.
                </p>
                <div className="chain">
                  <b>Pedido</b>
                  <span className="arr">→</span>
                  <b>Chamado</b>
                  <span className="arr">→</span>
                  <b>Commit</b>
                  <span className="arr">→</span>
                  <b>Publicado</b>
                </div>
                <p className="lede" style={{ marginTop: '1.1rem', fontSize: '1rem' }}>
                  Doze das quarenta e uma alterações publicadas desde maio trazem o número do chamado
                  no registo. Qualquer pedido vosso pode ser seguido até à linha que o resolveu.
                </p>
              </div>
              <div className="mock">
                <p className="mock-head">Central de Chamados · novo pedido</p>
                <p className="mock-label">Tipo</p>
                <div className="radios">
                  <span className="radio on">
                    <span className="dot" />
                    Correção
                  </span>
                  <span className="radio">
                    <span className="dot" />
                    Evolução
                  </span>
                </div>
                <p className="mock-label" style={{ marginTop: '1.4rem' }}>
                  Prioridade
                </p>
                <div className="radios">
                  <span className="radio">
                    <span className="dot" />
                    Baixa
                  </span>
                  <span className="radio on">
                    <span className="dot" />
                    Média
                  </span>
                  <span className="radio">
                    <span className="dot" />
                    Alta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 — números */}
        <section className={slide(6)}>
          <p className="eyebrow">
            <span className="act">Ato II · A fronteira</span>
            <span className="sep">/</span>
            <span>O que já aconteceu</span>
          </p>
          <div className="body-row">
            <h2>Vocês pediram. Foi feito.</h2>
            <div className="metrics">
              <div className="metric">
                <span className="n">18</span>
                <span className="l">
                  pedidos abertos pela Elmate
                  <br />
                  desde 29 de maio
                </span>
              </div>
              <div className="metric good">
                <span className="n">18</span>
                <span className="l">atendidos</span>
              </div>
              <div className="metric good">
                <span className="n">0</span>
                <span className="l">por atender</span>
              </div>
              <div className="metric good">
                <span className="n">0 €</span>
                <span className="l">cobrados por qualquer um deles</span>
              </div>
            </div>
            <div className="curve">
              <p className="curve-title">Tempo médio entre o pedido e a entrega</p>
              <div className="bars">
                {MESES.map(({ mes, largura, valor, rapido }) => (
                  <div className={`bar-row ${rapido ? 'fast' : ''}`.trim()} key={mes}>
                    <span className="when">{mes}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: largura }} />
                    </span>
                    <span className="val">{valor}</span>
                  </div>
                ))}
              </div>
              <p className="lede" style={{ marginTop: '1.1rem', fontSize: '1rem' }}>
                De seis dias para o próprio dia, à medida que o sistema estabilizou.
              </p>
            </div>
          </div>
        </section>

        {/* 8 — pediram / ficou escrito */}
        <section className={slide(7)}>
          <p className="eyebrow">
            <span className="act">Ato III · O contrato</span>
            <span className="sep">/</span>
            <span>Versão 2</span>
          </p>
          <div className="body-row">
            <h2>Vocês pediram. Ficou escrito.</h2>
            <div className="ledger">
              {[
                [
                  'Sigilo estrito sobre tudo o que é vosso',
                  'Texto aceite como foi proposto, com as ressalvas normais de qualquer acordo de confidencialidade',
                  '13.5',
                ],
                [
                  'Definição de Informação Confidencial',
                  'A vossa definição integral, palavra por palavra',
                  '13.6',
                ],
                [
                  'Confidencialidade sobrevive ao fim do contrato',
                  'Cinco anos, e sem limite de tempo para segredos comerciais',
                  '13.7',
                ],
                [
                  '«Em que formato nos devolvem os dados?»',
                  'CSV e XLSX organizados por tabela, e JSON ou base de dados completa se pedirem',
                  '13.4.1',
                ],
                [
                  '«Porquê trinta dias para a entrega?»',
                  'Passou a 15 dias úteis, com o objetivo de 5 — e a entrega deixou de depender de pedido',
                  '13.4.2',
                ],
                [
                  'Os dados são vossos, a qualquer momento',
                  'Cópia completa duas vezes por ano, durante a vigência, sem custo',
                  '13.4.3',
                ],
              ].map(([ask, got, cl]) => (
                <div className="ledger-row" key={cl}>
                  <span className="ledger-ask">{ask}</span>
                  <span className="ledger-got">{got}</span>
                  <span className="ledger-cl">{cl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9 — se correr mal */}
        <section className={slide(8)}>
          <p className="eyebrow">
            <span className="act">Ato III · O contrato</span>
            <span className="sep">/</span>
            <span>Saída</span>
          </p>
          <div className="body-row">
            <h2>Se correr mal</h2>
            <div className="exit-cols">
              <div className="exit hero">
                <span className="cl">Cláusula 15.4</span>
                <h3>Se a Seabra falhar</h3>
                <p>
                  A Elmate sai de imediato, <strong>sem qualquer multa</strong>. Paga só o que
                  utilizou até à data e recebe a exportação integral dos dados, sem custo.
                </p>
              </div>
              <div className="exit">
                <span className="cl">Cláusula 15.2</span>
                <h3>Se a Elmate sair por opção</h3>
                <p>
                  Aviso de 60 dias e uma compensação que diminui com o tempo: 3 mensalidades no
                  primeiro ano, 2 no segundo, 1 no terceiro. Não é pagamento de desenvolvimento — é o
                  que permite não existir custo de desenvolvimento.
                </p>
              </div>
              <div className="exit">
                <span className="cl">Cláusulas 13.3 e 13.4</span>
                <h3>Em qualquer cenário</h3>
                <p>
                  Os dados são propriedade exclusiva da Elmate. Entregues em CSV e XLSX, organizados
                  por tabela, em 15 dias úteis. Nunca ficam retidos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10 — o que falta */}
        <section className={slide(9)}>
          <p className="eyebrow">
            <span className="act">Ato III · O contrato</span>
            <span className="sep">/</span>
            <span>O que falta</span>
          </p>
          <div className="body-row">
            <h2>Falta escrever o que acabámos de ver</h2>
            <p className="lede">
              A versão 2 respondeu ao que perguntaram em junho — confidencialidade e saída. O modelo
              de aluguer nunca chegou a ser escrito. Proponho fechá-lo assim:
            </p>
            <div className="clauses">
              <div className="clause">
                <span className="num">2.3</span>
                <p className="what">
                  O desenvolvimento é <b>integralmente suportado pela Seabra</b>. A única
                  contrapartida da Elmate é a mensalidade dos módulos ativos.
                </p>
              </div>
              <div className="clause">
                <span className="num">3.f–3.h</span>
                <p className="what">
                  Define-se <b>correção</b>, <b>evolução</b> e <b>orçamento de módulo</b> — que fixa a
                  mensalidade e nunca inclui valor de desenvolvimento.
                </p>
              </div>
              <div className="clause">
                <span className="num">6.4</span>
                <p className="what">
                  Nos 30 dias de teste, os ajustes estão <b>incluídos</b>. No fim, fica fixado o que
                  foi validado.
                </p>
              </div>
              <div className="clause">
                <span className="num">9.1–9.3</span>
                <p className="what">
                  Módulo novo segue a subscrição. Evolução leva orçamento.{' '}
                  <b>Correção nunca é faturável, sem limite de tempo.</b>
                </p>
              </div>
              <div className="clause">
                <span className="num">9.4</span>
                <p className="what">
                  A classificação é feita ao abrir o chamado.{' '}
                  <b>Nada é reclassificado depois de feito, nem faturado sem aprovação escrita.</b>
                </p>
              </div>
              <div className="clause">
                <span className="num">Anexo B</span>
                <p className="what">
                  Fica escrito o critério dos níveis, para a mensalidade de{' '}
                  <b>qualquer setor futuro ser previsível</b>.
                </p>
              </div>
            </div>
            <div className="close-line">
              <span className="big">Assinar antes de 30 de setembro.</span>
              <span className="why">
                A primeira fatura semestral é emitida logo a seguir. Faz sentido que saia já com o
                contrato em vigor e com esta parte escrita.
              </span>
            </div>
          </div>
        </section>
      </div>

      <nav className="rail-nav" aria-label="Navegação da apresentação">
        <div className="acts">
          {groups.map((g) => (
            <div className="act-group" key={g.from}>
              <span className="act-name">{ACT_NAMES[g.act]}</span>
              <div className="ticks">
                {Array.from({ length: g.count }, (_, k) => {
                  const n = g.from + k;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`tick ${n === i ? 'now' : ''} ${n < i ? 'done' : ''}`.trim()}
                      aria-label={`Ecrã ${n + 1}`}
                      aria-current={n === i ? 'true' : undefined}
                      onClick={() => go(n)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <span className="counter">
          {String(i + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </span>
        <div className="arrows">
          <button type="button" aria-label="Anterior" disabled={i === 0} onClick={() => go(i - 1)}>
            ←
          </button>
          <button
            type="button"
            aria-label="Seguinte"
            disabled={i === TOTAL - 1}
            onClick={() => go(i + 1)}
          >
            →
          </button>
        </div>
      </nav>
    </>
  );
}
