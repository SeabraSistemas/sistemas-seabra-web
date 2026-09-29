import { hojeISO, type Item } from '@/lib/orcamentos/valores';

/*
 * O rascunho fica no localStorage deste navegador — ferramenta de uma pessoa,
 * e o PDF é o que sai daqui. Sem localStorage (aba privada), vale só a sessão.
 */

export type Orcamento = {
  /** sequência do próximo número (2026-001, 2026-002…) — sobrevive ao "Novo". */
  seq: number;
  numero: string;
  data: string;
  validadeDias: string;
  cliente: string;
  documento: string;
  endereco: string;
  contato: string;
  itens: Item[];
  desconto: string;
  pagamento: string;
  prazo: string;
  observacoes: string;
};

const CHAVE = 'seabra:orcamentos:v1';

const numeroDe = (seq: number, data: string) => `${data.slice(0, 4)}-${String(seq).padStart(3, '0')}`;

export function novoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function inicial(): Orcamento {
  const data = hojeISO();
  return {
    seq: 1,
    numero: numeroDe(1, data),
    data,
    validadeDias: '15',
    cliente: '',
    documento: '',
    endereco: '',
    contato: '',
    itens: [],
    desconto: '',
    pagamento: 'Pix ou transferência bancária',
    prazo: '',
    observacoes: '',
  };
}

/** Próximo orçamento: limpa cliente e itens, mantém condições e validade. */
export function proximo(o: Orcamento): Orcamento {
  const seq = o.seq + 1;
  const data = hojeISO();
  return {
    ...inicial(),
    seq,
    numero: numeroDe(seq, data),
    validadeDias: o.validadeDias,
    pagamento: o.pagamento,
    prazo: o.prazo,
  };
}

export function carregar(): Orcamento {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return inicial();
    // Mescla com o inicial: campo novo numa versão futura não chega `undefined`.
    const o = { ...inicial(), ...(JSON.parse(bruto) as Partial<Orcamento>) };
    return Array.isArray(o.itens) ? o : { ...o, itens: [] };
  } catch {
    return inicial();
  }
}

export function salvar(o: Orcamento) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(o));
  } catch {
    // Sem armazenamento: fica só nesta aba.
  }
}
