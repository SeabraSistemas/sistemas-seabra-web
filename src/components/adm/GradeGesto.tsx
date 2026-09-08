'use client';

/**
 * A grade 3x3 do login por gesto — substitui os campos de usuário/senha/TOTP.
 *
 * ÚNICO PEDAÇO DE JS NA TELA DE LOGIN. O form continua um POST puro pra
 * /adm/api/login (nenhum fetch, nenhum estado de submit) — só que "desenhar"
 * um traço com o dedo/mouse não tem como ser um `<input>` nativo, então este
 * componente é client só para capturar o gesto e preencher um
 * `<input type="hidden">` com a sequência antes do submit normal do form.
 *
 * A SEQUÊNCIA é a mesma "linguagem" de src/lib/adm/gesto.ts: os números da
 * grade (teclado numérico: 7 8 9 / 4 5 6 / 1 2 3), na ordem visitada, sem
 * repetir ponto. O servidor normaliza e hasheia — este componente nunca sabe
 * se o gesto está certo, só o transporta.
 */

import { useRef, useState } from 'react';

/** Índice 0..8 (esquerda→direita, cima→baixo) → número mostrado na grade. */
const PONTOS_GRADE = [7, 8, 9, 4, 5, 6, 1, 2, 3] as const;

const TAMANHO = 240;
const MARGEM = 44;
const RAIO_PONTO = 11;
/** Maior que o raio visual de propósito: tolerância de toque em tela pequena. */
const RAIO_TOQUE = 28;

function centroDoIndice(indice: number): { x: number; y: number } {
  const coluna = indice % 3;
  const linha = Math.floor(indice / 3);
  const passo = (TAMANHO - 2 * MARGEM) / 2;
  return { x: MARGEM + coluna * passo, y: MARGEM + linha * passo };
}

export function GradeGesto({ name = 'gesto', disabled = false }: { name?: string; disabled?: boolean }) {
  const [visitados, setVisitados] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrastandoRef = useRef(false);

  function pontoDoEvento(e: { clientX: number; clientY: number }): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * TAMANHO,
      y: ((e.clientY - rect.top) / rect.height) * TAMANHO,
    };
  }

  function indiceMaisProximo(ponto: { x: number; y: number }): number | null {
    for (let i = 0; i < 9; i++) {
      const centro = centroDoIndice(i);
      if (Math.hypot(centro.x - ponto.x, centro.y - ponto.y) <= RAIO_TOQUE) return i;
    }
    return null;
  }

  function adicionar(indice: number) {
    setVisitados((atual) => (atual.includes(indice) ? atual : [...atual, indice]));
  }

  function aoApontar(e: React.PointerEvent<SVGSVGElement>) {
    const ponto = pontoDoEvento(e);
    if (!ponto) return;
    const indice = indiceMaisProximo(ponto);
    if (indice !== null) adicionar(indice);
  }

  function aoIniciar(e: React.PointerEvent<SVGSVGElement>) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastandoRef.current = true;
    setVisitados([]);
    aoApontar(e);
  }

  function aoMover(e: React.PointerEvent<SVGSVGElement>) {
    if (!arrastandoRef.current || disabled) return;
    aoApontar(e);
  }

  function aoSoltar() {
    arrastandoRef.current = false;
  }

  function limpar() {
    setVisitados([]);
  }

  const sequencia = visitados.map((i) => PONTOS_GRADE[i]).join('');

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${TAMANHO} ${TAMANHO}`}
        className="touch-none select-none rounded-xl border border-border bg-secondary/30"
        style={{ width: 220, height: 220, opacity: disabled ? 0.5 : 1 }}
        onPointerDown={aoIniciar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onPointerLeave={aoSoltar}
        aria-label="Desenhe o padrão de acesso"
        role="img"
      >
        {visitados.slice(1).map((indiceAtual, i) => {
          const de = centroDoIndice(visitados[i]);
          const para = centroDoIndice(indiceAtual);
          return (
            <line
              key={`${visitados[i]}-${indiceAtual}`}
              x1={de.x}
              y1={de.y}
              x2={para.x}
              y2={para.y}
              className="stroke-primary"
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
        })}
        {PONTOS_GRADE.map((_numero, indice) => {
          const centro = centroDoIndice(indice);
          const tocado = visitados.includes(indice);
          return (
            <circle
              key={indice}
              cx={centro.x}
              cy={centro.y}
              r={RAIO_PONTO}
              className={tocado ? 'fill-primary' : 'fill-muted-foreground/30'}
            />
          );
        })}
      </svg>

      {/* O que o servidor de fato lê. Sequência vazia é formato inválido lá
          (menos que o mínimo de pontos) — não precisa de validação aqui. */}
      <input type="hidden" name={name} value={sequencia} />

      <button
        type="button"
        onClick={limpar}
        disabled={disabled || visitados.length === 0}
        className="text-xs text-muted-foreground underline underline-offset-4 disabled:opacity-40"
      >
        Limpar traço
      </button>
    </div>
  );
}
