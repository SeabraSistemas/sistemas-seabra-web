import type { CSSProperties } from 'react';
import { Cabecalho, ListaTopicos } from '../partes';
import type { SlideCiclo } from '../tipos';

const TAM = 820;
const C = TAM / 2;
const R = 290;
const ESPESSURA = 64;
/** 2 px de fundo entre fases vizinhas (vão de superfície). */
const VAO = 2 / R;
/** Fases sem destaque: cinzas próximos, separados pelo vão. */
const CINZAS = ['#4a4a4a', '#333333', '#5c5c5c', '#3d3d3d'];

/** Animação: cada fase desenha depois da anterior; marcos no fim. */
const INICIO_MS = 250;
const PASSO_MS = 500;
const atraso = (ms: number) => ({ '--atraso': `${ms}ms` }) as CSSProperties;

function ponto(angulo: number, raio: number) {
  return { x: C + raio * Math.cos(angulo), y: C + raio * Math.sin(angulo) };
}

/**
 * Ciclo estral em roda: cada fase é um arco proporcional aos dias, o estro em
 * ocre (é a janela que importa). Dia 0 no topo, sentido horário.
 */
export function Ciclo({ slide, secao }: { slide: SlideCiclo; secao?: string }) {
  const angulo = (dia: number) => -Math.PI / 2 + (dia / slide.dias) * 2 * Math.PI;
  const fimDasFases = INICIO_MS + slide.fases.length * PASSO_MS;
  let cinza = 0;

  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_940px]">
      <div className="flex h-full flex-col px-[120px] pb-[110px] pt-[100px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
        {slide.itens && (
          <div className="mt-[48px] flex flex-1 flex-col justify-center">
            <ListaTopicos itens={slide.itens.map((texto) => ({ texto }))} estilo="lista" tamanho="medio" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: TAM, height: TAM }}>
          <svg aria-hidden width={TAM} height={TAM} viewBox={`0 0 ${TAM} ${TAM}`} className="absolute inset-0">
            {/* Um traço por dia, por fora do anel */}
            <g className="anim-aparecer">
              {Array.from({ length: slide.dias }, (_, d) => {
                const a = angulo(d);
                const p1 = ponto(a, R + ESPESSURA / 2 + 10);
                const p2 = ponto(a, R + ESPESSURA / 2 + 22);
                return <line key={d} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#555" strokeWidth={2} />;
              })}
            </g>

            {slide.fases.map((fase, i) => {
              const a1 = angulo(fase.inicio) + VAO;
              const a2 = angulo(fase.fim) - VAO;
              const p1 = ponto(a1, R);
              const p2 = ponto(a2, R);
              const grande = a2 - a1 > Math.PI ? 1 : 0;
              const cor = fase.destaque ? 'var(--ocre)' : CINZAS[cinza++ % CINZAS.length];
              return (
                <path
                  key={fase.nome}
                  d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 ${grande} 1 ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={cor}
                  strokeWidth={ESPESSURA}
                  pathLength={100}
                  className="anim-desenhar"
                  style={atraso(INICIO_MS + i * PASSO_MS)}
                />
              );
            })}

            {slide.marcos.map((marco) => {
              const p = ponto(angulo(marco.dia), R);
              return (
                <circle
                  key={marco.rotulo}
                  cx={p.x}
                  cy={p.y}
                  r={9}
                  fill="#f5f5f5"
                  stroke="#000"
                  strokeWidth={3}
                  className="anim-pop"
                  style={atraso(fimDasFases + 150)}
                />
              );
            })}
          </svg>

          {/* Centro */}
          <div className="anim-aparecer absolute inset-0 flex flex-col items-center justify-center pt-[56px]">
            <p className="deck-titulo text-[176px] leading-none text-foreground">{slide.dias}</p>
            <p className="mt-[6px] text-[34px] text-foreground/70">dias</p>
          </div>

          {/* Nome e dias de cada fase, por fora do anel */}
          {slide.fases.map((fase, i) => {
            const meio = angulo((fase.inicio + fase.fim) / 2);
            const p = ponto(meio, R + ESPESSURA / 2 + 58);
            const cos = Math.cos(meio);
            const lado = cos > 0.25 ? 'esq' : cos < -0.25 ? 'dir' : 'meio';
            return (
              <div
                key={fase.nome}
                className="anim-aparecer absolute w-[240px]"
                style={{
                  ...atraso(INICIO_MS + i * PASSO_MS + 400),
                  left: p.x,
                  top: p.y,
                  transform:
                    lado === 'esq'
                      ? 'translate(0, -50%)'
                      : lado === 'dir'
                        ? 'translate(-100%, -50%)'
                        : `translate(-50%, ${Math.sin(meio) < 0 ? '-100%' : '0'})`,
                  textAlign: lado === 'esq' ? 'left' : lado === 'dir' ? 'right' : 'center',
                }}
              >
                <p className={fase.destaque ? 'text-[32px] font-semibold text-primary' : 'text-[30px] font-semibold text-foreground'}>
                  {fase.nome}
                </p>
                <p className="text-[22px] text-muted-foreground">
                  {fase.fim - fase.inicio < 2
                    ? `dia ${fase.inicio.toLocaleString('pt-BR')}–${fase.fim.toLocaleString('pt-BR')}`
                    : `dias ${Math.round(fase.inicio)}–${Math.round(fase.fim)}`}
                </p>
              </div>
            );
          })}

          {/* Marcos, por dentro do anel */}
          {slide.marcos.map((marco) => {
            const a = angulo(marco.dia);
            const p = ponto(a, R - ESPESSURA / 2 - 20);
            const cos = Math.cos(a);
            return (
              <p
                key={marco.rotulo}
                className="anim-aparecer absolute w-[220px] text-[22px] leading-tight text-foreground/85"
                style={{
                  ...atraso(fimDasFases + 250),
                  left: p.x,
                  top: p.y,
                  transform: cos >= 0 ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                  textAlign: cos >= 0 ? 'right' : 'left',
                }}
              >
                {marco.rotulo}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
