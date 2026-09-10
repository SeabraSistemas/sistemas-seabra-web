'use client';

import { CalendarDays } from 'lucide-react';
import { useParamsAdm } from '@/components/adm/AdmFilters';
import { formatarInteiro, formatarLitros } from '@/lib/adm/format';

/**
 * O seletor do dia de controle. Mesmo desenho de <SeletorPropriedade>: a escolha
 * mora na URL (`?data=`), nunca em estado local — é a URL que o Server Component
 * leu para montar os cards, e um `useState` aqui criaria uma segunda verdade
 * (seletor mostrando 09/03 com os números de 07/08).
 *
 * Cada opção já traz animais e média, porque a pergunta seguinte à escolha da
 * data é sempre "esse controle foi grande?" — e sem isso o operador precisa
 * escolher às cegas, clicar, e voltar.
 */
export interface OpcaoControle {
  chave: string;
  rotulo: string;
  animais: number;
  mediaComLeite: number | null;
  /** Mais de um dia costurado (o lançamento atrasado do dia seguinte). */
  dias: number;
}

export function SeletorControle({ opcoes, atual }: { opcoes: OpcaoControle[]; atual: string }) {
  const { aplicar } = useParamsAdm();

  if (opcoes.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <CalendarDays size={15} strokeWidth={1.8} className="shrink-0 text-muted-foreground" aria-hidden />
      <select
        aria-label="Dia do controle leiteiro"
        value={atual}
        onChange={(e) => aplicar({ data: e.target.value })}
        className="max-w-[24rem] rounded-full border border-input bg-secondary px-3 py-1 text-sm text-foreground outline-none"
      >
        {opcoes.map((opcao) => (
          <option key={opcao.chave} value={opcao.chave}>
            {opcao.rotulo}
            {opcao.dias > 1 ? ` (+${opcao.dias - 1}d)` : ''} · {formatarInteiro(opcao.animais)} animais
            {opcao.mediaComLeite === null ? '' : ` · ${formatarLitros(opcao.mediaComLeite, 2)}/cab`}
          </option>
        ))}
      </select>
    </div>
  );
}
