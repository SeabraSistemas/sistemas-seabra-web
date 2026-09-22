/**
 * "Dias sem manejo" (21/09/2026) — motor puro por trás da página
 * `/FI_FCG/monitorar` (animais ativos há muitos dias sem nenhum evento
 * registrado).
 *
 * A RebanhoProd tem colunas prontas (`ultimo_manejo`/`ultimo_manejo_dias`),
 * mas achadas ao vivo (21/09/2026) com dois problemas: cobertura baixa (só
 * 2.354 dos 5.477 vivos têm `ultimo_manejo`, 1.693 têm o campo de dias) e
 * congeladas — um animal com manejo em 03/11/2025 marcava "15 dias" quando
 * já eram ~322 (o AppSheet parou de recalcular essa coluna). Em vez de usar
 * essas colunas, este módulo deriva o último manejo diretamente dos eventos
 * que o dashboard já lê, sempre recalculado contra `hoje`, nunca congelado.
 *
 * Fontes (22/09/2026, revisão de todas as abas de lançamento do AppSheet
 * junto com o Felipe — ver `FontesManejo`): Pesagem, Toque, IATF
 * (Reproduçao), Parto (como MÃE, via `ID Mãe`), Manejo (log sanitário),
 * D8 e Protocolo (checkpoints reprodutivos), Transferir, Engorda (entrada
 * no programa), Clínica, Aborto, Embarque. Ficaram de fora: Baixa/Venda
 * (animal não-ativo não entra no monitoramento, ver `CATEGORIAS_ATIVAS`),
 * Botijão (estoque de sêmen, não é evento de animal), Lotes (só nomes),
 * Apartação/Apartação FI (0 linhas de dado ainda) e Indução (só 4 linhas,
 * todas com ID animal "teste" — dado de teste, não produção).
 */
import { diasEntre } from '@/lib/painel/format';
import type {
  DiaCompacto,
  RegAborto,
  RegClinica,
  RegD8,
  RegEmbarque,
  RegEngordaEvento,
  RegIatf,
  RegManejoSanitario,
  RegParto,
  RegPesagem,
  RegProtocolo,
  RegRebanho,
  RegToque,
  RegTransferir,
} from './types';

function maisRecentePorId<T>(
  linhas: T[],
  idDe: (r: T) => string | null,
  dataDe: (r: T) => DiaCompacto | null,
): Map<string, DiaCompacto> {
  const mapa = new Map<string, DiaCompacto>();
  for (const linha of linhas) {
    const id = idDe(linha);
    const dia = dataDe(linha);
    if (!id || dia == null) continue;
    const atual = mapa.get(id);
    if (atual == null || dia > atual) mapa.set(id, dia);
  }
  return mapa;
}

function combinar(mapas: Map<string, DiaCompacto>[]): Map<string, DiaCompacto> {
  const resultado = new Map<string, DiaCompacto>();
  for (const mapa of mapas) {
    for (const [id, dia] of mapa) {
      const atual = resultado.get(id);
      if (atual == null || dia > atual) resultado.set(id, dia);
    }
  }
  return resultado;
}

/**
 * Resolve um ID bruto (como foi lançado numa aba) pro "ID animal" canônico
 * da RebanhoProd. Nem todo lançamento grava o mesmo campo: animal "da era
 * do chip" nasce com "ID animal" = "ID eletrônica" (mesmo número de 15
 * dígitos); quando o chip é trocado, só um dos dois lados acompanha, e o
 * lançamento (que grava o que foi escaneado no brinco) pode citar
 * qualquer um dos dois. Achado ao vivo, 22/09/2026, investigando com o
 * Felipe: pra Manejo e Engorda, ~100% dos ID que não batiam com nenhum
 * "ID animal" atual batiam com a "ID eletrônica" de algum animal — não é
 * dado perdido, é só o campo errado. Sem bater com nenhum dos dois: volta
 * o bruto sem mudar (mesmo comportamento de antes — vira órfão de novo).
 */
export function resolverIdCanonico(rebanho: RegRebanho[]): (idBruto: string | null) => string | null {
  const porEletronica = new Map<string, string>();
  const idsConhecidos = new Set<string>();
  for (const a of rebanho) {
    idsConhecidos.add(a.id);
    if (a.eletronica) porEletronica.set(a.eletronica, a.id);
  }
  return (idBruto) => {
    if (!idBruto || idsConhecidos.has(idBruto)) return idBruto;
    return porEletronica.get(idBruto) ?? idBruto;
  };
}

/** As 12 fontes de evento que contam como "manejo" — ver o comentário no topo do arquivo pro porquê de cada uma (e do que ficou de fora). */
export interface FontesManejo {
  pesagem: RegPesagem[];
  toque: RegToque[];
  iatf: RegIatf[];
  partos: RegParto[];
  manejoSanitario: RegManejoSanitario[];
  d8: RegD8[];
  protocolo: RegProtocolo[];
  transferir: RegTransferir[];
  engordaEventos: RegEngordaEvento[];
  clinica: RegClinica[];
  abortos: RegAborto[];
  embarque: RegEmbarque[];
}

/** Data do último manejo conhecido de cada animal — o mais recente entre todas as `FontesManejo` (Parto conta pra MÃE, via `idMae`/nascimento do bezerro; o resto conta pro próprio `idAnimal`/`id`). Todo ID passa por `resolverIdCanonico` antes de juntar. */
export function ultimoManejoPorAnimal(rebanho: RegRebanho[], fontes: FontesManejo): Map<string, DiaCompacto> {
  const resolver = resolverIdCanonico(rebanho);
  return combinar([
    maisRecentePorId(fontes.pesagem, (r) => resolver(r.id), (r) => r.data),
    maisRecentePorId(fontes.toque, (r) => resolver(r.id), (r) => r.data),
    maisRecentePorId(fontes.iatf, (r) => resolver(r.id), (r) => r.data),
    maisRecentePorId(fontes.partos, (r) => resolver(r.idMae), (r) => r.nascimento),
    maisRecentePorId(fontes.manejoSanitario, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.d8, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.protocolo, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.transferir, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.engordaEventos, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.clinica, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.abortos, (r) => resolver(r.idAnimal), (r) => r.data),
    maisRecentePorId(fontes.embarque, (r) => resolver(r.idAnimal), (r) => r.data),
  ]);
}

/**
 * As categorias de animal ATIVO no rebanho — as 8 do funil de corte (fórmula
 * de `Categoria` na RebanhoProd, corrigida ao vivo em 21/09/2026 —
 * Bezerro/Garrote/Boi/Touro macho, Bezerra/Recria/Novilha/Vaca fêmea) mais
 * Leiteira (gado de leite, fora do funil de corte mas igualmente vivo).
 * Fonte única — RebanhoView.tsx (Total de animais vivos) importa daqui em
 * vez de duplicar, depois de um desalinhamento real (22/09/2026: Rebanho
 * mudou pra esse critério, Monitorar ficou pra trás com o `vivo()` antigo
 * — categoria != Venda/Baixa — e os dois passaram a mostrar totais
 * diferentes pro mesmo rebanho). O resto (Venda, Baixa, Histórico, Sêmen,
 * IDs de teste/legado tipo "vaca problema") não é estágio de vida do
 * rebanho vivo.
 */
export const CATEGORIAS_ATIVAS = new Set([
  'Bezerro',
  'Bezerra',
  'Garrote',
  'Recria',
  'Boi',
  'Novilha',
  'Touro',
  'Vaca',
  'Leiteira',
]);

function ativo(a: RegRebanho): boolean {
  return a.categoria != null && CATEGORIAS_ATIVAS.has(a.categoria);
}

export interface AnimalMonitorado {
  id: string;
  fazenda: string | null;
  categoria: string | null;
  sexo: string | null;
  /** Data de nascimento (RebanhoProd) — pra idade exata em anos/meses/dias, ver idadeQuebrada em lib/painel/format.ts. */
  nascimento: DiaCompacto | null;
  /** null = nenhum evento conhecido em nenhuma FontesManejo — "sem dado", nunca "0 dias". */
  diasSemManejo: number | null;
  /** Data do último evento em si (pra mostrar "Último manejo: dd/mm/aaaa" ao lado dos dias). */
  ultimoManejo: DiaCompacto | null;
}

/** Só os animais ATIVOS (ver `ativo`/`CATEGORIAS_ATIVAS`), um por linha, pronto pra empacotar e mandar pro cliente da página Monitorar. */
export function animaisMonitorados(
  rebanho: RegRebanho[],
  fontes: FontesManejo,
  hoje: DiaCompacto,
): AnimalMonitorado[] {
  const ultimoManejo = ultimoManejoPorAnimal(rebanho, fontes);
  return rebanho.filter(ativo).map((a) => {
    const ultimo = ultimoManejo.get(a.id) ?? null;
    return {
      id: a.id,
      fazenda: a.fazenda,
      categoria: a.categoria,
      sexo: a.sexo,
      nascimento: a.nascimento,
      diasSemManejo: diasEntre(ultimo, hoje),
      ultimoManejo: ultimo,
    };
  });
}
