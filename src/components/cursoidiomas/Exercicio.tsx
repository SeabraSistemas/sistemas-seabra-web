'use client';

import { Check, RotateCcw, Volume2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Questao } from '@/data/cursoidiomas/types';
import { respostaCorreta } from '@/lib/cursoidiomas/normalizar';
import { useProgresso } from '@/lib/cursoidiomas/progresso';
import { falar, useVozDisponivel } from '@/lib/cursoidiomas/voz';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Estado = 'aberta' | 'certa' | 'errada' | 'aceita';

/** Embaralhamento determinístico (o componente também renderiza no servidor). */
function embaralhar<T>(itens: T[], semente: string): T[] {
  let h = 2166136261;
  for (const c of semente) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const arr = [...itens];
  for (let i = arr.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = (h >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Garantir que não saiu na ordem original (frustra o exercício).
  if (arr.length > 2 && arr.every((x, i) => x === itens[i])) arr.push(arr.shift()!);
  return arr;
}

const inputClasse = 'h-9 max-w-md';

function Feedback({ estado, correta, explicacao }: { estado: Estado; correta?: string; explicacao?: string }) {
  if (estado === 'aberta') return null;
  const certa = estado === 'certa' || estado === 'aceita';
  return (
    <div
      className={cn(
        'mt-2 flex flex-col gap-1 rounded-md border px-3 py-2 text-sm',
        certa ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10',
      )}
    >
      <span className="flex items-center gap-1.5 font-medium">
        {certa ? <Check className="size-4" /> : <X className="size-4" />}
        {estado === 'certa' ? 'Certo.' : estado === 'aceita' ? 'Aceita como certa.' : 'Não é isso.'}
      </span>
      {correta && estado !== 'certa' && (
        <span className="text-muted-foreground">
          Resposta esperada: <span className="text-foreground">{correta}</span>
        </span>
      )}
      {explicacao && <span className="text-muted-foreground">{explicacao}</span>}
    </div>
  );
}

function QuestaoItem({
  q,
  numero,
  lang,
  estado,
  onResultado,
}: {
  q: Questao;
  numero: number;
  lang: string;
  estado: Estado;
  onResultado: (e: Estado) => void;
}) {
  const [texto, setTexto] = useState('');
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<number[]>([]);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const temVoz = useVozDisponivel();

  const palavras = useMemo(
    () => (q.tipo === 'ordenar' ? embaralhar(q.resposta.split(/\s+/), q.resposta) : []),
    [q],
  );

  const bloqueada = estado !== 'aberta';

  function conferir() {
    if (bloqueada) return;
    if (q.tipo === 'escolha') {
      if (escolhida === null) return;
      onResultado(escolhida === q.correta ? 'certa' : 'errada');
      return;
    }
    if (q.tipo === 'ordenar') {
      const montada = ordem.map((i) => palavras[i]).join(' ');
      if (!montada) return;
      onResultado(respostaCorreta(montada, q.resposta) ? 'certa' : 'errada');
      return;
    }
    if (!texto.trim()) return;
    const esperado = q.tipo === 'ditado' ? q.texto : q.resposta;
    onResultado(respostaCorreta(texto, esperado) ? 'certa' : 'errada');
  }

  const esperadaTexto =
    q.tipo === 'escolha'
      ? q.opcoes[q.correta]
      : q.tipo === 'ditado'
        ? q.texto
        : q.tipo === 'ordenar'
          ? q.resposta
          : [q.resposta].flat()[0];

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      conferir();
    }
  };

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs text-muted-foreground">
          {numero}
        </span>
        <div className="min-w-0 flex-1">
          {q.tipo === 'escolha' && (
            <>
              <p className="text-sm">{q.pergunta}</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {q.opcoes.map((op, i) => {
                  const selecionada = escolhida === i;
                  const marcarCerta = bloqueada && i === q.correta;
                  const marcarErrada = bloqueada && selecionada && i !== q.correta;
                  return (
                    <button
                      key={op}
                      type="button"
                      disabled={bloqueada}
                      onClick={() => setEscolhida(i)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                        selecionada && !bloqueada ? 'border-ring bg-accent' : 'border-border hover:bg-accent/60',
                        marcarCerta && 'border-primary bg-primary/10',
                        marcarErrada && 'border-destructive bg-destructive/10',
                        bloqueada && 'cursor-default',
                      )}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {q.tipo === 'lacuna' && (
            <>
              {(() => {
                const [antes, ...resto] = q.frase.split('___');
                return (
                  <p className="text-base leading-8">
                    {antes}
                    <Input
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={aoTeclar}
                      disabled={bloqueada}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      lang={lang}
                      className="mx-1 inline-block h-8 w-36 align-baseline"
                    />
                    {resto.join('___')}
                  </p>
                );
              })()}
              {q.traducao && <p className="mt-1 text-sm text-muted-foreground">{q.traducao}</p>}
              {q.dica && <p className="mt-1 text-xs text-muted-foreground">Dica: {q.dica}</p>}
            </>
          )}

          {q.tipo === 'traducao' && (
            <>
              <p className="text-sm">
                Como se diz: <span className="text-foreground">“{q.origem}”</span>
              </p>
              {q.dica && <p className="mt-1 text-xs text-muted-foreground">Dica: {q.dica}</p>}
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={aoTeclar}
                disabled={bloqueada}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                lang={lang}
                className={cn(inputClasse, 'mt-3')}
              />
            </>
          )}

          {q.tipo === 'ditado' && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {temVoz !== false ? (
                  <Button type="button" variant="secondary" size="sm" onClick={() => falar(q.texto, lang)}>
                    <Volume2 /> Ouvir
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Sem síntese de voz neste navegador.</span>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarTexto((v) => !v)}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  {mostrarTexto ? 'Esconder texto' : 'Mostrar texto'}
                </button>
              </div>
              {mostrarTexto && <p className="mt-2 text-sm" lang={lang}>{q.texto}</p>}
              <p className="mt-2 text-sm text-muted-foreground">Escreva o que ouviu.</p>
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={aoTeclar}
                disabled={bloqueada}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                lang={lang}
                className={cn(inputClasse, 'mt-2')}
              />
            </>
          )}

          {q.tipo === 'ordenar' && (
            <>
              <p className="text-sm text-muted-foreground">
                Monte a frase{q.traducao ? `: “${q.traducao}”` : ''}
              </p>
              <div className="mt-3 flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-dashed border-input px-2 py-1.5">
                {ordem.length === 0 && <span className="text-xs text-muted-foreground">Toque nas palavras abaixo.</span>}
                {ordem.map((i, pos) => (
                  <button
                    key={`${i}-${pos}`}
                    type="button"
                    disabled={bloqueada}
                    onClick={() => setOrdem((o) => o.filter((_, p) => p !== pos))}
                    className="rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground"
                    lang={lang}
                  >
                    {palavras[i]}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {palavras.map((p, i) => {
                  const usada = ordem.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={bloqueada || usada}
                      onClick={() => setOrdem((o) => [...o, i])}
                      className={cn(
                        'rounded-md border border-border px-2.5 py-1 text-sm transition-colors hover:bg-accent',
                        usada && 'opacity-30',
                      )}
                      lang={lang}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <Feedback
            estado={estado}
            correta={esperadaTexto}
            explicacao={q.tipo === 'escolha' ? q.explicacao : q.tipo === 'ditado' ? q.traducao : undefined}
          />

          <div className="mt-3 flex items-center gap-3">
            {!bloqueada && (
              <Button type="button" size="sm" onClick={conferir}>
                Conferir
              </Button>
            )}
            {estado === 'errada' && q.tipo !== 'escolha' && (
              <button
                type="button"
                onClick={() => onResultado('aceita')}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Minha resposta também vale
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function Exercicio({
  questoes,
  lang,
  chave,
  titulo,
}: {
  questoes: Questao[];
  lang: string;
  chave: string;
  titulo?: string;
}) {
  const [estados, setEstados] = useState<Estado[]>(() => questoes.map(() => 'aberta'));
  const [rodada, setRodada] = useState(0);
  const { progresso, marcar } = useProgresso();
  const registro = progresso.concluidas[chave];

  const respondidas = estados.filter((e) => e !== 'aberta').length;
  const acertos = estados.filter((e) => e === 'certa' || e === 'aceita').length;
  const terminou = respondidas === questoes.length;

  function reiniciar() {
    setEstados(questoes.map(() => 'aberta'));
    setRodada((r) => r + 1);
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">{titulo ?? 'Exercícios'}</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {respondidas}/{questoes.length}
        </span>
      </div>
      <ol className="flex flex-col gap-3">
        {questoes.map((q, i) => (
          <QuestaoItem
            key={`${rodada}-${i}`}
            q={q}
            numero={i + 1}
            lang={lang}
            estado={estados[i]}
            onResultado={(e) => setEstados((atual) => atual.map((x, j) => (j === i ? e : x)))}
          />
        ))}
      </ol>

      {terminou && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm">
            Resultado: <span className="font-medium">{acertos}</span> de {questoes.length}
            {registro?.total != null && (
              <span className="text-muted-foreground">
                {' '}· anterior {registro.acertos}/{registro.total}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={reiniciar}>
              <RotateCcw /> Refazer
            </Button>
            <Button type="button" size="sm" onClick={() => marcar(chave, { acertos, total: questoes.length })}>
              <Check /> {registro ? 'Salvar resultado' : 'Concluir lição'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
