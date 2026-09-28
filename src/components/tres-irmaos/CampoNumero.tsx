'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Número digitado em pt-BR: aceita "2,77" e "2.77". type="text" com
 * inputMode="decimal" em vez de type="number" — o input numérico do
 * navegador rejeita a vírgula conforme o idioma do aparelho, e foi uma
 * vírgula decimal que quebrou o parser de raça do app (12/09).
 * Guarda o texto enquanto a pessoa digita ("2," ainda não é número).
 */
export function CampoNumero({
  id,
  valor,
  aoMudar,
  sufixo,
  min = 0,
  max,
  className,
}: {
  id: string;
  valor: number;
  aoMudar: (n: number) => void;
  sufixo?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  const [texto, setTexto] = useState(() => formatar(valor));
  useEffect(() => {
    if (lerNumero(texto) !== valor) setTexto(formatar(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao valor de fora (ex.: "voltar ao salvo")
  }, [valor]);

  return (
    <div className={`relative ${className ?? ''}`}>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          const n = lerNumero(e.target.value);
          if (n != null && n >= min && (max == null || n <= max)) aoMudar(n);
        }}
        onBlur={() => setTexto(formatar(valor))}
        className={sufixo ? 'pr-10 tabular-nums' : 'tabular-nums'}
      />
      {sufixo && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">{sufixo}</span>}
    </div>
  );
}

function formatar(n: number): string {
  return Number.isFinite(n) ? String(n).replace('.', ',') : '';
}

function lerNumero(t: string): number | null {
  const limpo = t.trim().replace(/\s/g, '').replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
