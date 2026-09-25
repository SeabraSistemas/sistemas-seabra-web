import { formatDia, formatNumber } from '@/lib/painel/format';
import type { Animal, Estacao, Indicadores, Situacao } from '@/lib/sanri/monta';
import { cn } from '@/lib/utils';

/** Peças comuns da Reprodução → Monta livre (lista, formar, detalhe). */

export const SITUACAO: Record<Situacao, { rotulo: string; classe: string }> = {
  pariu: { rotulo: 'Pariu', classe: 'bg-sage-100 text-sage' },
  gestante: { rotulo: 'Gestante', classe: 'bg-sage-100 text-sage' },
  vazia: { rotulo: 'Vazia', classe: 'bg-erro-fundo text-erro' },
  confirmar: { rotulo: 'Reconfirmar', classe: 'bg-aviso-fundo text-aviso' },
  'us-atrasado': { rotulo: 'US atrasado', classe: 'bg-aviso-fundo text-aviso' },
  'aguardando-us': { rotulo: 'Aguardando US', classe: 'bg-paper-2 text-ink-1' },
  'sem-cobertura': { rotulo: 'Sem cobertura no app', classe: 'bg-erro-fundo text-erro' },
};

export function Selo({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn('inline-block whitespace-nowrap rounded-pill px-2.5 py-0.5 text-xs font-semibold', className)}>{children}</span>;
}

export function SeloSituacao({ situacao }: { situacao: Situacao }) {
  const s = SITUACAO[situacao];
  return <Selo className={s.classe}>{s.rotulo}</Selo>;
}

export function SeloEstacao({ ativa }: { ativa: boolean }) {
  return <Selo className={ativa ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-1'}>{ativa ? 'Ativa' : 'Encerrada'}</Selo>;
}

/** Nome em cima, número embaixo — como o curral chama o animal. */
export function NomeAnimal({ animal, chave }: { animal: Animal | undefined; chave: string }) {
  const numero = animal?.numero ?? chave.replace(/^[nc]:/, '');
  return (
    <span className="flex flex-col leading-tight">
      <span className="font-semibold text-ink">{animal?.nome ?? numero}</span>
      {animal?.nome && <span className="text-xs text-ink-2">{numero}</span>}
    </span>
  );
}

export function tituloEstacao(e: Pick<Estacao, 'reprodutorNome' | 'reprodutorNumero'>): string {
  return e.reprodutorNome ?? e.reprodutorNumero ?? 'Reprodutor';
}

export function periodoEstacao(e: Pick<Estacao, 'inicio' | 'fim' | 'finalizadaEm'>): string {
  const fim = e.finalizadaEm != null && e.finalizadaEm < e.fim ? `${formatDia(e.finalizadaEm)} (finalizada)` : formatDia(e.fim);
  return `${formatDia(e.inicio)} a ${fim}`;
}

export function pct(n: number | null): string {
  return n == null ? '—' : `${formatNumber(n)}%`;
}

/** Números curtos da estação — usados no cartão da lista e na prévia do formulário. */
export function ResumoCurto({ i }: { i: Indicadores }) {
  const itens = [
    { rotulo: 'Fêmeas', valor: String(i.femeas) },
    { rotulo: 'Prenhez', valor: pct(i.taxaPrenhez) },
    { rotulo: 'Aguardando US', valor: i.usAtrasado > 0 ? `${i.aguardandoDg} (${i.usAtrasado} atras.)` : String(i.aguardandoDg) },
    { rotulo: 'Vazias', valor: String(i.vazias) },
    { rotulo: 'Paridas', valor: String(i.paridas) },
    { rotulo: 'Próx. parto', valor: i.proximoParto ? formatDia(i.proximoParto).slice(0, 5) : '—' },
  ];
  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
      {itens.map((x) => (
        <div key={x.rotulo} className="min-w-0">
          <dt className="truncate text-xs text-ink-2">{x.rotulo}</dt>
          <dd className="truncate text-sm font-semibold text-ink">{x.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
