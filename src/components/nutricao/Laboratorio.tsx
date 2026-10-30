'use client';

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { aplicarEdicoes } from '@/lib/nutricao/alimentos';
import { calcularExigencias } from '@/lib/nutricao/exigencias';
import { AbaBanco } from '@/components/nutricao/AbaBanco';
import { AbaComparador } from '@/components/nutricao/AbaComparador';
import { AbaDieta } from '@/components/nutricao/AbaDieta';
import { AbaExigencia } from '@/components/nutricao/AbaExigencia';
import { carregarEstado, estadoPadrao, salvarEstado, type Aba, type EstadoAnimal, type EstadoLab, type Rascunho } from '@/components/nutricao/estado';
import { cn } from '@/lib/utils';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'exigencia', rotulo: 'Exigência' },
  { id: 'dieta', rotulo: 'Dieta' },
  { id: 'comparador', rotulo: 'Comparador' },
  { id: 'banco', rotulo: 'Banco' },
];

const TIPOS_SEM_AVANCO = new Set(['checkbox', 'radio', 'button', 'submit', 'file']);

/**
 * Laboratório de nutrição: exigência lado a lado (formulador × NRC 2007 ×
 * Rodrigues), balanço de dieta e comparador de insumos. Estado inteiro no
 * navegador (localStorage) — nada vai para o servidor nem para o Supabase.
 * O motor de cálculo é TypeScript puro em src/lib/nutricao (sem React).
 */
export function Laboratorio({ email }: { email: string }) {
  const [estado, setEstado] = useState<EstadoLab>(estadoPadrao);
  const [pronto, setPronto] = useState(false);

  // O estado salvo só existe no navegador: lê depois da montagem (o servidor renderiza o padrão).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage na montagem
    setEstado(carregarEstado());
    setPronto(true);
  }, []);
  useEffect(() => {
    if (pronto) salvarEstado(estado);
  }, [estado, pronto]);

  const banco = useMemo(() => aplicarEdicoes(estado.edicoes), [estado.edicoes]);
  const ex = useMemo(() => calcularExigencias(estado.animal), [estado.animal]);

  const mudarAnimal = useCallback((parcial: Partial<EstadoAnimal>) => setEstado((e) => ({ ...e, animal: { ...e.animal, ...parcial } })), []);
  const irPara = useCallback((aba: Aba) => {
    setEstado((e) => ({ ...e, aba }));
    window.scrollTo({ top: 0 });
  }, []);

  const salvarRascunho = (nome: string) =>
    setEstado((e) => {
      const novo: Rascunho = { id: `r${Date.now().toString(36)}`, nome, salvoEm: new Date().toISOString(), animal: e.animal, dieta: e.dieta };
      return { ...e, rascunhos: [novo, ...e.rascunhos] };
    });
  const abrirRascunho = (id: string) =>
    setEstado((e) => {
      const r = e.rascunhos.find((x) => x.id === id);
      return r ? { ...e, animal: r.animal, dieta: r.dieta } : e;
    });
  const excluirRascunho = (id: string) => setEstado((e) => ({ ...e, rascunhos: e.rascunhos.filter((x) => x.id !== id) }));

  // Enter avança de campo em campo (celular: "próximo"); no último, fecha o teclado.
  const aoTeclar = (ev: KeyboardEvent<HTMLElement>) => {
    if (ev.key !== 'Enter' || ev.nativeEvent.isComposing) return;
    const alvo = ev.target;
    const ehInput = alvo instanceof HTMLInputElement && !TIPOS_SEM_AVANCO.has(alvo.type);
    if (!ehInput && !(alvo instanceof HTMLSelectElement)) return;
    ev.preventDefault();
    const campos = Array.from(ev.currentTarget.querySelectorAll<HTMLElement>('input, select')).filter(
      (el) => !(el as HTMLInputElement).disabled && el.offsetParent !== null && !(el instanceof HTMLInputElement && (TIPOS_SEM_AVANCO.has(el.type) || el.type === 'hidden')),
    );
    const prox = campos[campos.indexOf(alvo as HTMLElement) + 1];
    if (prox) {
      prox.focus();
      if (prox instanceof HTMLInputElement) prox.select();
    } else (alvo as HTMLElement).blur();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-3 sm:px-6">
      <header className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <h1 className="text-xl leading-tight sm:text-2xl">Laboratório de nutrição</h1>
          <p className="truncate text-xs text-muted-foreground">{email} · cabra leiteira · protótipo</p>
        </div>
        <form action="/nutricao/api/logout" method="POST">
          <button type="submit" className="min-h-11 rounded-lg px-3 text-sm underline underline-offset-2 active:bg-secondary">
            Sair
          </button>
        </form>
      </header>

      <main onKeyDown={aoTeclar} className="flex-1 pb-28" data-pronto={pronto}>
        {estado.aba === 'exigencia' && <AbaExigencia animal={estado.animal} mudar={mudarAnimal} ex={ex} />}
        {estado.aba === 'dieta' && (
          <AbaDieta
            dieta={estado.dieta}
            mudarDieta={(dieta) => setEstado((e) => ({ ...e, dieta }))}
            banco={banco}
            ex={ex}
            animal={estado.animal}
            tolerancia={estado.tolerancia}
            mudarTolerancia={(tolerancia) => setEstado((e) => ({ ...e, tolerancia }))}
            mostrarQuantidade={estado.mostrarQuantidade}
            mudarMostrarQuantidade={(mostrarQuantidade) => setEstado((e) => ({ ...e, mostrarQuantidade }))}
            rascunhos={estado.rascunhos}
            salvarRascunho={salvarRascunho}
            abrirRascunho={abrirRascunho}
            excluirRascunho={excluirRascunho}
            irParaExigencia={() => irPara('exigencia')}
          />
        )}
        {estado.aba === 'comparador' && <AbaComparador comparador={estado.comparador} mudar={(comparador) => setEstado((e) => ({ ...e, comparador }))} banco={banco} />}
        {estado.aba === 'banco' && <AbaBanco banco={banco} edicoes={estado.edicoes} mudar={(edicoes) => setEstado((e) => ({ ...e, edicoes }))} />}
      </main>

      <nav aria-label="Seções" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div role="tablist" className="mx-auto grid max-w-5xl grid-cols-4 gap-1 p-1.5">
          {ABAS.map((a) => {
            const ativa = estado.aba === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => irPara(a.id)}
                className={cn('min-h-12 rounded-lg px-1 text-sm font-medium transition-colors', ativa ? 'bg-ok font-semibold text-ok-foreground' : 'text-foreground active:bg-secondary')}
              >
                {a.rotulo}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
