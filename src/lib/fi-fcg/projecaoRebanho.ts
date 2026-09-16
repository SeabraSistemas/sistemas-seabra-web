/**
 * Projeção de rebanho (16/09/2026) — partos previstos + mudança de
 * categoria por idade, num horizonte de meses escolhido pelo usuário.
 *
 * Investigado ao vivo no seabra-app-main antes de escrever isto: não existe
 * pronto (nem no backlog) — o motor daqui é novo, só inspirado na
 * arquitetura de lá (loop mês a mês). A vantagem do bovino: já temos dado
 * real de cobertura (IATF) e diagnóstico (Toque/Reprodução), sem precisar
 * de "Monta livre" (aba vazia nesta planilha, cliente não usa).
 *
 * Parto previsto: Data IATF mais recente do animal + `DIAS_GESTACAO_BOVINO`
 * — confirmado ao vivo (16/09/2026): cobre 1.922 das 2.027 vacas "Prenha"
 * hoje (95%). O resto vira `partosSemDataConhecida` — nunca inventamos uma
 * data.
 *
 * Mudança de categoria: idade atual (nascimento -> hoje) cruza a idade do
 * marco (aba "Idades por Marco") -> muda de categoria naquele mês. Novilha
 * vira Vaca no 1º PARTO (não na cobertura — decisão do Felipe, 16/09/2026:
 * biologicamente ela só "é" Vaca depois de parir). Touro fica de fora (é
 * seleção manual do produtor, não idade — decisão do Felipe).
 */
import { mesDe, proximoMes } from '@/lib/fi-fcg/custos';
import { diasEntre, somarDias } from '@/lib/painel/format';
import type { DiaCompacto, MarcoIdade, RegIatf, RegRebanho } from './types';

export const DIAS_GESTACAO_BOVINO = 283;

interface Transicao {
  de: string;
  para: string;
  marco: string;
}

/** Touro fica de fora (ver comentário no topo) — só as 4 transições por idade. */
export const TRANSICOES_CATEGORIA: Transicao[] = [
  { de: 'Bezerro', para: 'Garrote', marco: 'Bezerro -> Garrote' },
  { de: 'Garrote', para: 'Boi', marco: 'Garrote -> Boi' },
  { de: 'Bezerra', para: 'Novilha', marco: 'Bezerra -> Novilha' },
  { de: 'Novilha', para: 'Vaca', marco: 'Novilha -> Vaca (1o parto)' },
];

function vivo(a: RegRebanho): boolean {
  return a.categoria !== 'Venda' && a.categoria !== 'Baixa';
}

/** Data IATF mais recente por animal (qualquer Método — a mesma aba cobre IATF e monta natural aqui). */
function ultimaDataIatfPorAnimal(iatf: RegIatf[]): Map<string, DiaCompacto> {
  const mapa = new Map<string, DiaCompacto>();
  for (const r of iatf) {
    if (r.data == null) continue;
    const atual = mapa.get(r.id);
    if (atual == null || r.data > atual) mapa.set(r.id, r.data);
  }
  return mapa;
}

export interface Migracao {
  de: string;
  para: string;
  quantidade: number;
}

export interface MesProjetado {
  mes: string; // "aaaamm"
  partosPrevistos: number;
  migracoes: Migracao[];
}

export interface ProjecaoRebanho {
  meses: MesProjetado[];
  /** Vacas "Prenha" sem nenhuma Data IATF registrada — não entram em nenhum mês, não inventamos data. */
  partosSemDataConhecida: number;
  efetivoPorCategoriaHoje: Record<string, number>;
  /** Efetivo ao final do horizonte, só com as migrações por idade — nascimentos NÃO entram aqui (sexo do bezerro é desconhecido antes de nascer), ver `partosPrevistos` à parte. */
  efetivoPorCategoriaFinal: Record<string, number>;
}

/**
 * @param horizonteMeses mínimo 1 — meses corridos a partir do mês de `hoje`, inclusive.
 */
export function projetarRebanho(
  rebanho: RegRebanho[],
  iatf: RegIatf[],
  marcosIdade: MarcoIdade[],
  fazenda: string | null,
  horizonteMeses: number,
  hoje: DiaCompacto,
): ProjecaoRebanho {
  const horizonte = Math.max(1, Math.round(horizonteMeses));
  const relevantes = rebanho.filter((a) => vivo(a) && (fazenda == null || a.fazenda === fazenda));

  const mesesDoHorizonte: string[] = [];
  let mesAtual = mesDe(hoje);
  for (let i = 0; i < horizonte; i++) {
    mesesDoHorizonte.push(mesAtual);
    mesAtual = proximoMes(mesAtual);
  }
  const ultimoMes = mesesDoHorizonte[mesesDoHorizonte.length - 1];

  const partosPorMes = new Map<string, number>(mesesDoHorizonte.map((m) => [m, 0]));
  let partosSemDataConhecida = 0;
  const ultimaIatf = ultimaDataIatfPorAnimal(iatf);
  for (const a of relevantes) {
    if (a.reproducao !== 'Prenha') continue;
    const dataCobertura = ultimaIatf.get(a.id);
    if (dataCobertura == null) {
      partosSemDataConhecida++;
      continue;
    }
    const partoPrevisto = somarDias(dataCobertura, DIAS_GESTACAO_BOVINO);
    if (partoPrevisto == null) continue;
    const mesParto = mesDe(partoPrevisto);
    if (mesParto >= mesesDoHorizonte[0] && mesParto <= ultimoMes) {
      partosPorMes.set(mesParto, (partosPorMes.get(mesParto) ?? 0) + 1);
    }
  }

  const idadePorMarco = new Map<string, number>();
  for (const m of marcosIdade) if (m.marco != null && m.idadeDias != null) idadePorMarco.set(m.marco, m.idadeDias);

  const migracoesPorMes = new Map<string, Map<string, number>>(mesesDoHorizonte.map((m) => [m, new Map<string, number>()]));
  for (const t of TRANSICOES_CATEGORIA) {
    const idadeAlvo = idadePorMarco.get(t.marco);
    if (idadeAlvo == null) continue;
    for (const a of relevantes) {
      if (a.categoria !== t.de || a.nascimento == null) continue;
      const idadeAtual = diasEntre(a.nascimento, hoje);
      if (idadeAtual == null) continue;
      const diasAteTransicao = Math.max(0, idadeAlvo - idadeAtual); // já vencido => transiciona já no 1º mês
      const dataTransicao = somarDias(hoje, diasAteTransicao);
      if (dataTransicao == null) continue;
      const mesTransicao = mesDe(dataTransicao);
      if (mesTransicao < mesesDoHorizonte[0] || mesTransicao > ultimoMes) continue;
      const porTransicao = migracoesPorMes.get(mesTransicao)!;
      const chave = `${t.de}|${t.para}`;
      porTransicao.set(chave, (porTransicao.get(chave) ?? 0) + 1);
    }
  }

  const meses: MesProjetado[] = mesesDoHorizonte.map((mes) => ({
    mes,
    partosPrevistos: partosPorMes.get(mes) ?? 0,
    migracoes: Array.from(migracoesPorMes.get(mes)!.entries(), ([chave, quantidade]) => {
      const [de, para] = chave.split('|');
      return { de, para, quantidade };
    }),
  }));

  const efetivoPorCategoriaHoje: Record<string, number> = {};
  for (const a of relevantes) {
    if (!a.categoria) continue;
    efetivoPorCategoriaHoje[a.categoria] = (efetivoPorCategoriaHoje[a.categoria] ?? 0) + 1;
  }

  const efetivoPorCategoriaFinal: Record<string, number> = { ...efetivoPorCategoriaHoje };
  for (const mesProjetado of meses) {
    for (const mig of mesProjetado.migracoes) {
      efetivoPorCategoriaFinal[mig.de] = (efetivoPorCategoriaFinal[mig.de] ?? 0) - mig.quantidade;
      efetivoPorCategoriaFinal[mig.para] = (efetivoPorCategoriaFinal[mig.para] ?? 0) + mig.quantidade;
    }
  }

  return { meses, partosSemDataConhecida, efetivoPorCategoriaHoje, efetivoPorCategoriaFinal };
}
