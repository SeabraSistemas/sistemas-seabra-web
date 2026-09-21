/**
 * Projeção de rebanho (16/09/2026) — partos previstos + mudança de
 * categoria por idade, num horizonte de DIAS escolhido pelo usuário (não
 * meses — trocado no mesmo dia após o Felipe comparar com a ferramenta
 * "Projeção/Estoque" de outro sistema do ecossistema: lá o produtor escolhe
 * a data exata, dia a dia, não um número redondo de meses). O filtro de
 * inclusão (parto/transição cai dentro de [hoje, hoje+horizonteDias]) agora
 * é por DIA exato — antes era por mês inteiro, o que incluía datas do mês
 * corrente mesmo se já tivessem passado. O agrupamento em `meses:
 * MesProjetado[]` continua existindo só pra alimentar o gráfico mensal
 * (SerieMensal) — a granularidade de EXIBIÇÃO é mensal, a de CÁLCULO é
 * diária.
 *
 * Investigado ao vivo no seabra-app-main antes de escrever isto: não existe
 * pronto (nem no backlog) — o motor daqui é novo, só inspirado na
 * arquitetura de lá (loop mês a mês). A vantagem do bovino: já temos dado
 * real de cobertura (IATF) e diagnóstico (Toque/Reprodução), sem precisar
 * de "Monta livre" (aba vazia nesta planilha, cliente não usa).
 *
 * Parto previsto: Data IATF mais recente do animal + `DIAS_GESTACAO_BOVINO`.
 * Achado ao vivo (16/09/2026, investigação junto com o Felipe): pra 97 das
 * ~2.000 vacas "Prenha" hoje, a Data IATF mais recente é ANTIGA (>373 dias -
 * ver `IATF_MAX_DIAS`) mas existe um Toque BEM recente confirmando Prenha.
 * Isso é repasse com touro solto (monta natural) depois do IATF, que o
 * AppSheet não registra numa aba própria — a vaca provavelmente já pariu
 * daquele ciclo do IATF antigo e prenhou de novo. Usar o IATF velho previa
 * um parto no passado e a vaca sumia da projeção em silêncio. Decisão do
 * Felipe: quando o IATF passar de `IATF_MAX_DIAS`, cair pro Toque mais
 * recente com Diagnóstico de prenhez como âncora, e só aceitar esse Toque se
 * ele também não for velho demais (`TOQUE_MAX_DIAS`, o próprio limite da
 * gestação: toque é sempre DEPOIS da cobertura, então acima de 283 dias o
 * parto já estaria vencido mesmo no melhor caso). Sem nenhuma âncora
 * utilizável, vira `partosSemDataConhecida` — nunca inventamos uma data.
 *
 * Quando cai pro Toque (21/09/2026, pedido do Felipe): NÃO soma mais
 * `DIAS_GESTACAO_BOVINO` a partir da data do Toque (isso tratava o Toque
 * como se fosse o dia da cobertura, o que ele nunca é — ele é sempre
 * posterior). Em vez disso usa o próprio estágio do Diagnóstico do Toque
 * (Adiantada/Regular/Tardia) pra estimar quanto falta AQUELE dia até o
 * parto, direto — ver `DIAS_PARA_PARTO_POR_DIAGNOSTICO`. É uma estimativa
 * (o Diagnóstico é um estágio, não um dia exato de gestação), mas mais
 * precisa que somar a gestação inteira a partir de um toque que já pode ter
 * sido feito meses depois da cobertura real.
 *
 * Mudança de categoria: idade atual (nascimento -> hoje) cruza a idade do
 * marco (aba "Idades por Marco") -> muda de categoria naquele mês. Novilha
 * vira Vaca no 1º PARTO (não na cobertura — decisão do Felipe, 16/09/2026:
 * biologicamente ela só "é" Vaca depois de parir). Touro fica de fora (é
 * seleção manual do produtor, não idade — decisão do Felipe).
 *
 * `filtroIdade` (opcional, 16/09/2026) — inspirado na ferramenta
 * "Projeção/Estoque" de outro sistema do ecossistema (idade mínima/máxima
 * em dias, filtrando quem entra na contagem): aqui só filtra a MUDANÇA DE
 * CATEGORIA, calculado pela idade que o animal VAI TER em `dataFinal`
 * (hoje + horizonte) — fora da faixa, o animal simplesmente não aparece
 * em nenhuma migração. Partos previstos NÃO são afetados (calculado à
 * parte, mesma separação da ferramenta de referência: idade da mãe não
 * decide se ela pare ou não).
 */
import { mesDe, proximoMes } from '@/lib/fi-fcg/custos';
import { diasEntre, somarDias } from '@/lib/painel/format';
import type { DiaCompacto, MarcoIdade, RegIatf, RegRebanho, RegToque } from './types';

export const DIAS_GESTACAO_BOVINO = 283;

/** Cobertura (IATF) + até 90 dias de repasse com touro solto não lançado — acima disso o IATF é velho demais pra ser a origem da gestação atual. */
export const IATF_MAX_DIAS = DIAS_GESTACAO_BOVINO + 90;
/** Toque é sempre feito DEPOIS da cobertura (nunca no dia 0) — acima da gestação inteira o parto já estaria vencido mesmo no melhor caso. */
export const TOQUE_MAX_DIAS = DIAS_GESTACAO_BOVINO;

/**
 * Meses-até-o-parto por estágio do Diagnóstico do Toque, convertidos pra
 * dias (×30, mesma unidade do resto do motor) — pedido do Felipe
 * (21/09/2026): Adiantada = gestação avançada (perto do parto), Regular =
 * meio da gestação, Tardia = gestação recém-confirmada (ainda falta quase
 * tudo). Só usado quando não há Cobertura (IATF) utilizável, ver `usaToque`.
 */
export const DIAS_PARA_PARTO_POR_DIAGNOSTICO: Record<string, number> = {
  Adiantada: 2 * 30,
  Regular: 5 * 30,
  Tardia: 8 * 30,
};

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

interface ToquePrenha {
  data: DiaCompacto;
  diagnostico: string;
}

/** Toque mais recente por animal, só entre os que CONFIRMARAM prenhez (Diagnóstico != Vazia/vazio) — data + o próprio Diagnóstico (Adiantada/Regular/Tardia), usado como estimativa de quanto falta pro parto (ver DIAS_PARA_PARTO_POR_DIAGNOSTICO). */
function ultimoTequePrenhaPorAnimal(toque: RegToque[]): Map<string, ToquePrenha> {
  const mapa = new Map<string, ToquePrenha>();
  for (const t of toque) {
    if (t.data == null || t.diagnostico == null || t.diagnostico === 'Vazia') continue;
    const atual = mapa.get(t.id);
    if (atual == null || t.data > atual.data) mapa.set(t.id, { data: t.data, diagnostico: t.diagnostico });
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

export interface PartoEstimadoViaToque {
  id: string;
  fazenda: string | null;
  dataToque: DiaCompacto;
  /** Adiantada/Regular/Tardia — o estágio usado pra estimar `partoPrevisto` (ver DIAS_PARA_PARTO_POR_DIAGNOSTICO). */
  diagnostico: string;
  partoPrevisto: DiaCompacto;
}

export interface PrenhaSemDataConhecida {
  id: string;
  fazenda: string | null;
  /** Data do IATF ou do Toque mais recente, quando existir — só velha demais pra usar como âncora (ver IATF_MAX_DIAS/TOQUE_MAX_DIAS). Ambos null = nenhum registro. */
  ultimaIatf: DiaCompacto | null;
  ultimoToque: DiaCompacto | null;
}

export interface ProjecaoRebanho {
  meses: MesProjetado[];
  /** Vacas "Prenha" sem nenhuma âncora de gestação utilizável (nem IATF recente, nem Toque recente confirmando prenhez) — não entram em nenhum mês, não inventamos data. */
  partosSemDataConhecida: number;
  /** Das que entraram em algum mês, quantas usaram o Toque como âncora (IATF velho demais ou inexistente) — estimativa, não a data exata de cobertura. */
  partosEstimadosViaToque: number;
  /** Detalhe animal a animal de `partosEstimadosViaToque`, pro usuário conferir quem são e quando foi o Toque. */
  animaisEstimadosViaToque: PartoEstimadoViaToque[];
  /** Detalhe animal a animal de `partosSemDataConhecida`. */
  animaisSemDataConhecida: PrenhaSemDataConhecida[];
  efetivoPorCategoriaHoje: Record<string, number>;
  /** Efetivo ao final do horizonte, só com as migrações por idade — nascimentos NÃO entram aqui (sexo do bezerro é desconhecido antes de nascer), ver `partosPrevistos` à parte. */
  efetivoPorCategoriaFinal: Record<string, number>;
}

export interface FiltroIdadeProjecao {
  /** Idade mínima em dias, na data final do horizonte, pra um animal entrar na mudança de categoria. */
  minDias: number;
  /** Idade máxima em dias, na data final do horizonte. */
  maxDias: number;
}

/**
 * @param horizonteDias mínimo 1 — dias corridos a partir de `hoje`, inclusive (hoje + horizonteDias é o último dia considerado).
 */
export function projetarRebanho(
  rebanho: RegRebanho[],
  iatf: RegIatf[],
  toque: RegToque[],
  marcosIdade: MarcoIdade[],
  fazenda: string | null,
  horizonteDias: number,
  hoje: DiaCompacto,
  filtroIdade?: FiltroIdadeProjecao | null,
): ProjecaoRebanho {
  const horizonte = Math.max(1, Math.round(horizonteDias));
  const dataFinal = somarDias(hoje, horizonte) as DiaCompacto;
  const relevantes = rebanho.filter((a) => vivo(a) && (fazenda == null || a.fazenda === fazenda));

  const mesesDoHorizonte: string[] = [];
  const mesFinal = mesDe(dataFinal);
  let mesAtual = mesDe(hoje);
  while (true) {
    mesesDoHorizonte.push(mesAtual);
    if (mesAtual === mesFinal) break;
    mesAtual = proximoMes(mesAtual);
  }

  const partosPorMes = new Map<string, number>(mesesDoHorizonte.map((m) => [m, 0]));
  let partosSemDataConhecida = 0;
  let partosEstimadosViaToque = 0;
  const animaisEstimadosViaToque: PartoEstimadoViaToque[] = [];
  const animaisSemDataConhecida: PrenhaSemDataConhecida[] = [];
  const ultimaIatf = ultimaDataIatfPorAnimal(iatf);
  const ultimoToque = ultimoTequePrenhaPorAnimal(toque);
  for (const a of relevantes) {
    if (a.reproducao !== 'Prenha') continue;
    const dataIatfRecente = ultimaIatf.get(a.id) ?? null;
    const diasIatf = dataIatfRecente != null ? diasEntre(dataIatfRecente, hoje) : null;
    const usaIatf = dataIatfRecente != null && diasIatf != null && diasIatf <= IATF_MAX_DIAS;

    const toqueRecente = ultimoToque.get(a.id) ?? null;
    const dataToqueRecente = toqueRecente?.data ?? null;
    const diasToque = dataToqueRecente != null ? diasEntre(dataToqueRecente, hoje) : null;
    // Diagnóstico sem mapeamento conhecido (nunca deveria acontecer com os 3
    // valores reais — Adiantada/Regular/Tardia — mas defensivo: sem estimativa
    // de dias, o Toque não serve de âncora, igual a não ter Toque nenhum).
    const diasParaPartoToque = toqueRecente != null ? (DIAS_PARA_PARTO_POR_DIAGNOSTICO[toqueRecente.diagnostico] ?? null) : null;
    const usaToque =
      !usaIatf && toqueRecente != null && diasToque != null && diasToque <= TOQUE_MAX_DIAS && diasParaPartoToque != null;

    if (!usaIatf && !usaToque) {
      partosSemDataConhecida++;
      animaisSemDataConhecida.push({ id: a.id, fazenda: a.fazenda, ultimaIatf: dataIatfRecente, ultimoToque: dataToqueRecente });
      continue;
    }

    // IATF é a Cobertura real => soma a gestação inteira a partir dela. Toque
    // NUNCA é o dia da cobertura (é sempre posterior) — em vez de somar a
    // gestação inteira a partir dele, usa o próprio Diagnóstico (estágio da
    // gestação naquele dia) pra estimar quanto falta (ver comentário no topo
    // do arquivo e DIAS_PARA_PARTO_POR_DIAGNOSTICO).
    const partoPrevisto = usaIatf
      ? somarDias(dataIatfRecente, DIAS_GESTACAO_BOVINO)
      : somarDias(dataToqueRecente, diasParaPartoToque!);
    if (partoPrevisto == null) continue;
    if (partoPrevisto >= hoje && partoPrevisto <= dataFinal) {
      const mesParto = mesDe(partoPrevisto);
      partosPorMes.set(mesParto, (partosPorMes.get(mesParto) ?? 0) + 1);
      if (usaToque) {
        partosEstimadosViaToque++;
        animaisEstimadosViaToque.push({
          id: a.id,
          fazenda: a.fazenda,
          dataToque: dataToqueRecente!,
          diagnostico: toqueRecente!.diagnostico,
          partoPrevisto,
        });
      }
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
      if (filtroIdade != null) {
        const idadeNaDataFinal = diasEntre(a.nascimento, dataFinal);
        if (idadeNaDataFinal == null || idadeNaDataFinal < filtroIdade.minDias || idadeNaDataFinal > filtroIdade.maxDias) continue;
      }
      const diasAteTransicao = Math.max(0, idadeAlvo - idadeAtual); // já vencido => transiciona já no dia 0 do horizonte
      const dataTransicao = somarDias(hoje, diasAteTransicao);
      if (dataTransicao == null || dataTransicao < hoje || dataTransicao > dataFinal) continue;
      const mesTransicao = mesDe(dataTransicao);
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

  return {
    meses,
    partosSemDataConhecida,
    partosEstimadosViaToque,
    animaisEstimadosViaToque,
    animaisSemDataConhecida,
    efetivoPorCategoriaHoje,
    efetivoPorCategoriaFinal,
  };
}
