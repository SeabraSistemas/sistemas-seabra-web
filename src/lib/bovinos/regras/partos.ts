import { U, formatSerial, nk } from '@/lib/bovinos/texto';
import type { Modelo, RegParto, RegRebanho } from '@/lib/bovinos/modelo';
import { acharBezerro, iatfsDaMae, type Indices } from '@/lib/bovinos/identidade';
import { paiEsperado, type IatfG } from '@/lib/bovinos/regras/pai';
import type { Problema, TrocaCelula } from '@/lib/bovinos/tipos';

/** Gap (dias) entre dois bezerros da mesma mãe que já indica mãe errada. Até 2 dias = gêmeos. */
const IRMAOS = { min: 3, max: 249 } as const;
/** Parto recente cujo previsto veio de IATF posterior = a fórmula do AppSheet ainda está sem correção. */
const RECENTE_DIAS = 90;
const GESTACAO_PREVISTO = 293;

const TESTE = /\btestes?\b/i;

function chaveLinha(rb: RegRebanho): string {
  return rb.A || (rb.id ? `animal:${U(rb.id)}` : `L${rb.linha}`);
}

function descIatf(x: IatfG): string {
  return `IATF ${x.iatf.dataTxt} ${x.iatf.semen} (${x.g} dias antes; Reproduçao L${x.iatf.linha}, por ${x.iatf.via.join(' + ')})`;
}

/**
 * ID P (chave do registro do sêmen no Rebanho) para um pai: a do próprio
 * parto quando ele já aponta esse sêmen; senão o registro único do Rebanho
 * com esse nome; senão vazio — chave velha apontando outro touro é pior que
 * nenhuma.
 */
export function resolverIdP(para: string, p: RegParto, ind: Indices, rebanho: RegRebanho[]): string {
  if (!para) return '';
  if (nk(p.pai) === nk(para) && ind.porA.has(p.idP)) return p.idP;
  const alvo = nk(para);
  const regs = rebanho.filter((r) => r.A && nk(r.id) === alvo);
  return regs.length === 1 ? regs[0].A : '';
}

export interface ContextoPartos {
  modelo: Modelo;
  ind: Indices;
  /** Colunas que o RebanhoProd tem (ID P e ID M são opcionais). */
  colunasRebanho: Set<string>;
  hoje: number;
}

export function regrasPartos(ctx: ContextoPartos): Problema[] {
  const { modelo, ind, colunasRebanho, hoje } = ctx;
  const out: Problema[] = [];
  const temIdP = colunasRebanho.has('ID P');
  const temIdM = colunasRebanho.has('ID M');

  // 1) Liga cada parto ao bezerro no Rebanho e separa testes / sem animal.
  type Ligado = { p: RegParto; rb: RegRebanho; recadastrado: boolean };
  const ligados: Ligado[] = [];
  let antigosPrevisto = 0;
  for (const p of modelo.partos) {
    if (TESTE.test(p.id) || TESTE.test(p.mae)) {
      out.push({
        id: `linha-teste|${p.aba}|L${p.linha}`,
        regra: 'linha-teste',
        severidade: 'info',
        aba: p.aba,
        linha: p.linha,
        animal: p.id || p.mae,
        resumo: `Parto de teste (${p.id || '—'}, mãe ${p.mae || '—'}).`,
        prova: [],
        bloqueios: [],
        correcao: null,
      });
      continue;
    }
    if (p.previsto != null && p.nasc != null && p.previsto - GESTACAO_PREVISTO >= p.nasc) {
      if (hoje - p.nasc <= RECENTE_DIAS) {
        out.push({
          id: `previsto-iatf-posterior|${p.aba}|L${p.linha}`,
          regra: 'previsto-iatf-posterior',
          severidade: 'info',
          aba: p.aba,
          linha: p.linha,
          animal: p.id,
          resumo: `Parto de ${p.nascTxt}: previsto ${formatSerial(p.previsto)} veio de uma IATF feita depois do nascimento.`,
          prova: ['A fórmula do Parto no AppSheet ainda pega a IATF mais recente da mãe, sem limitar à data do nascimento.'],
          bloqueios: [],
          correcao: null,
        });
      } else antigosPrevisto++;
    }
    const achado = acharBezerro(ind, p);
    if (!achado) {
      out.push({
        id: `parto-sem-animal|${p.aba}|L${p.linha}`,
        regra: 'parto-sem-animal',
        severidade: 'manual',
        aba: p.aba,
        linha: p.linha,
        animal: p.id,
        resumo: `Bezerro ${p.id || '—'} (mãe ${p.mae || '—'}, nasc ${p.nascTxt || '—'}) não está no Rebanho.`,
        prova: [p.tag ? `Brinco no parto: ${p.tag}` : 'Parto sem brinco — não dá para achar o recadastro sozinho.'],
        bloqueios: [],
        correcao: null,
      });
      continue;
    }
    ligados.push({ p, ...achado });
  }
  if (antigosPrevisto > 0) {
    out.push({
      id: 'previsto-iatf-posterior|antigos',
      regra: 'previsto-iatf-posterior',
      severidade: 'info',
      aba: 'Parto',
      linha: null,
      animal: '',
      resumo: `${antigosPrevisto} partos antigos (mais de ${RECENTE_DIAS} dias) com previsto de IATF posterior ao nascimento.`,
      prova: ['Histórico — o pai deles no Rebanho é conferido pelas regras de pai, não por esta coluna.'],
      bloqueios: [],
      correcao: null,
    });
  }

  // 2) Mesmo bezerro em mais de um parto.
  const porBezerro = new Map<string, Ligado[]>();
  for (const l of ligados) {
    const k = l.rb.A || `L${l.rb.linha}`;
    const lista = porBezerro.get(k) ?? [];
    lista.push(l);
    porBezerro.set(k, lista);
  }
  const unicos: Ligado[] = [];
  for (const [k, lista] of porBezerro) {
    if (lista.length === 1) {
      unicos.push(lista[0]);
      continue;
    }
    const maes = new Set(lista.map((l) => U(l.p.mae)));
    const desc = lista.map((l) => `${l.p.aba} L${l.p.linha} (mãe ${l.p.mae || '—'}, pai ${l.p.pai || '—'}, nasc ${l.p.nascTxt})`);
    if (maes.size === 1) {
      out.push({
        id: `parto-duplicado|${k}`,
        regra: 'parto-duplicado',
        severidade: 'info',
        aba: lista[0].p.aba,
        linha: lista[0].p.linha,
        animal: lista[0].rb.id,
        resumo: `${lista[0].rb.id} lançado ${lista.length} vezes, mesma mãe ${lista[0].p.mae}.`,
        prova: desc,
        bloqueios: [],
        correcao: null,
      });
      unicos.push(lista[0]);
    } else {
      out.push({
        id: `bezerro-em-partos-de-maes-diferentes|${k}`,
        regra: 'bezerro-em-partos-de-maes-diferentes',
        severidade: 'manual',
        aba: lista[0].p.aba,
        linha: lista[0].p.linha,
        animal: lista[0].rb.id,
        resumo: `${lista[0].rb.id} está em ${lista.length} partos com mães diferentes: ${[...new Set(lista.map((l) => l.p.mae))].join(', ')}.`,
        prova: desc,
        bloqueios: [],
        correcao: null,
      });
    }
  }

  // 3) Mãe com dois bezerros distintos a menos de 250 dias (qualquer parto, ligado ou não).
  const conflitoIrmao = new Map<string, string>(); // chave do bezerro → descrição do outro
  const porMae = new Map<string, { k: string; id: string; nasc: number; nascTxt: string; aba: string; linha: number }[]>();
  for (const p of modelo.partos) {
    if (!p.mae || p.nasc == null || TESTE.test(p.mae)) continue;
    const ach = acharBezerro(ind, p);
    const k = ach ? ach.rb.A || `L${ach.rb.linha}` : `P:${p.aba}:${p.linha}`;
    const lista = porMae.get(U(p.mae)) ?? [];
    if (!lista.some((x) => x.k === k)) lista.push({ k, id: ach ? ach.rb.id : p.id, nasc: p.nasc, nascTxt: p.nascTxt, aba: p.aba, linha: p.linha });
    porMae.set(U(p.mae), lista);
  }
  for (const [mae, lista] of porMae) {
    lista.sort((a, b) => a.nasc - b.nasc);
    for (let i = 1; i < lista.length; i++) {
      const a = lista[i - 1];
      const b = lista[i];
      const gap = b.nasc - a.nasc;
      if (gap < IRMAOS.min || gap > IRMAOS.max) continue;
      conflitoIrmao.set(a.k, `${b.id} (${b.nascTxt})`);
      conflitoIrmao.set(b.k, `${a.id} (${a.nascTxt})`);
      out.push({
        id: `mae-dois-bezerros|${mae}|${a.k}|${b.k}`,
        regra: 'mae-dois-bezerros',
        severidade: 'manual',
        aba: b.aba,
        linha: b.linha,
        animal: mae,
        resumo: `Mãe ${mae}: ${a.id} (${a.nascTxt}) e ${b.id} (${b.nascTxt}) — ${gap} dias.`,
        prova: [`${a.aba} L${a.linha}`, `${b.aba} L${b.linha}`, 'Uma vaca não pare duas vezes nesse intervalo: num dos partos a mãe está errada (gêmeos: corrigir a data).'],
        bloqueios: [],
        correcao: null,
      });
    }
  }

  // 4) Pai e mãe de cada bezerro, contra o Rebanho.
  for (const { p, rb, recadastrado } of unicos) {
    if (p.nasc == null) continue;
    const kb = chaveLinha(rb);
    const guarda = { idA: rb.A, idAnimal: rb.id };

    // Bloqueios de identidade: nenhuma correção para este bezerro.
    const bloqId: string[] = [];
    if (p.sexo && rb.sexo && U(p.sexo) !== U(rb.sexo)) bloqId.push(`Sexo diferente: parto ${p.sexo}, Rebanho ${rb.sexo}.`);
    const iatfsDoBezerro = [...(ind.iatfPorA.get(rb.A) ?? []), ...(rb.tag ? (ind.iatfPorTag.get(rb.tag) ?? []) : [])];
    if (iatfsDoBezerro.some((x) => x.data != null && x.data < p.nasc!)) bloqId.push('O bezerro tem IATF registrada antes de nascer — o cadastro pode ser de outro animal.');
    if (recadastrado && rb.tag && (ind.rebPorTag.get(rb.tag)?.length ?? 0) > 1) bloqId.push(`Brinco ${rb.tag} repetido no Rebanho.`);

    // Bloqueios de mãe: pai calculado a partir de uma mãe duvidosa não é confiável.
    const bloqMae: string[] = [];
    if (rb.mae && p.mae && U(rb.mae) !== U(p.mae)) {
      bloqMae.push(`Mãe no Rebanho (${rb.mae}) diferente da do parto (${p.mae}).`);
      out.push({
        id: `mae-diferente|${kb}`,
        regra: 'mae-diferente',
        severidade: 'manual',
        aba: 'RebanhoProd',
        linha: rb.linha,
        animal: rb.id,
        resumo: `${rb.id}: mãe ${rb.mae} no Rebanho, ${p.mae} no parto (${p.aba} L${p.linha}).`,
        prova: [],
        bloqueios: [],
        atual: rb.mae,
        sugerido: p.mae,
        correcao: null,
      });
    }
    const irmao = conflitoIrmao.get(rb.A || `L${rb.linha}`);
    if (irmao) bloqMae.push(`A mãe ${p.mae} tem outro bezerro a menos de 250 dias: ${irmao}.`);

    // --- Mãe
    if (p.mae && !rb.mae) {
      const set: TrocaCelula[] = [{ col: 'ID Mãe', de: '', para: p.mae }];
      const bloq = [...bloqId];
      if (temIdM && !rb.idM && p.idM) {
        const alvo = ind.porA.get(p.idM);
        if (alvo && U(alvo.id) === U(p.mae)) set.push({ col: 'ID M', de: '', para: p.idM });
        else if (alvo) bloq.push(`O ID M do parto aponta para ${alvo.id}, não para ${p.mae}.`);
      }
      out.push({
        id: `mae-preencher|${kb}`,
        regra: 'mae-preencher',
        severidade: bloq.length ? 'manual' : 'corrigivel',
        aba: 'RebanhoProd',
        linha: rb.linha,
        animal: rb.id,
        resumo: `${rb.id}${recadastrado ? ' (recadastrado)' : ''}: sem mãe no Rebanho; o parto diz ${p.mae}.`,
        prova: [`${p.aba} L${p.linha}, nasc ${p.nascTxt}`],
        bloqueios: bloq,
        atual: '',
        sugerido: p.mae,
        correcao: bloq.length ? null : { tipo: 'celulas', aba: 'RebanhoProd', linha: rb.linha, guarda, set },
      });
    }

    // --- Pai
    const { lista, conflito } = iatfsDaMae(ind, p.idM, p.mae);
    if (conflito) {
      // Parto incoerente: não dá para saber de qual vaca buscar a IATF.
      out.push({
        id: `mae-diferente|parto|${kb}`,
        regra: 'mae-diferente',
        severidade: 'manual',
        aba: p.aba,
        linha: p.linha,
        animal: rb.id,
        resumo: `${rb.id}: ${conflito}`,
        prova: [`${p.aba} L${p.linha}, nasc ${p.nascTxt}. O pai não foi conferido até a mãe ser confirmada.`],
        bloqueios: [],
        atual: rb.pai,
        correcao: null,
      });
      continue;
    }
    const v = paiEsperado(p.nasc, lista);
    const P = rb.pai;
    const baseProva = [`Nascimento ${p.nascTxt} (${p.aba} L${p.linha}), mãe ${p.mae || '—'}.`];

    if (v.tipo === 'curto') {
      out.push({
        id: `gestacao-curta|${kb}`,
        regra: 'gestacao-curta',
        severidade: 'info',
        aba: 'RebanhoProd',
        linha: rb.linha,
        animal: rb.id,
        resumo: `${rb.id}: nasceu ${v.ultima.g} dias depois da IATF (${v.ultima.iatf.semen}). Hoje: ${P || 'sem pai'}.`,
        prova: [...baseProva, descIatf(v.ultima)],
        bloqueios: [],
        atual: P,
        sugerido: v.ultima.iatf.semen,
        correcao: null,
      });
      continue;
    }
    if (v.tipo === 'ambiguo') {
      if (v.sugerido && nk(P) === nk(v.sugerido)) continue;
      out.push({
        id: `pai-ambiguo|${kb}`,
        regra: 'pai-ambiguo',
        severidade: 'manual',
        aba: 'RebanhoProd',
        linha: rb.linha,
        animal: rb.id,
        resumo: `${rb.id}: ${v.motivo === 'dois-semens' ? 'duas IATFs batem com o nascimento' : 'houve outra IATF depois da que bate'}. Hoje: ${P || 'sem pai'}.`,
        prova: [...baseProva, ...v.candidatos.map(descIatf)],
        bloqueios: [],
        atual: P,
        sugerido: v.sugerido ?? '',
        correcao: null,
      });
      continue;
    }

    let regra: 'pai-preencher' | 'pai-trocar' | 'pai-tirar' | null = null;
    let para = '';
    const prova = [...baseProva];
    if (v.tipo === 'iatf') {
      para = v.semen;
      prova.push(`Bate: ${descIatf(v.escolhida)}`);
      for (const ig of v.ignoradas) prova.push(`Ignorada (cedo demais para ser desta): ${descIatf(ig)}`);
      if (!P) regra = 'pai-preencher';
      else if (nk(P) !== nk(para)) regra = 'pai-trocar';
    } else {
      if (P) regra = 'pai-tirar';
      if (v.motivo === 'sem-iatf') prova.push('A mãe não tem IATF antes do nascimento.');
      else if (v.ultima) prova.push(`${v.motivo === 'longo' ? 'Acima do limite (314–330 dias)' : 'Fora da janela'}: ${descIatf(v.ultima)}`);
      const posterior = lista.find((x) => x.data != null && x.data >= p.nasc! && nk(x.semen) === nk(P));
      if (P && posterior) prova.push(`O sêmen atual (${P}) é de uma IATF feita DEPOIS do nascimento (${posterior.dataTxt}).`);
    }
    if (!regra) continue;

    const bloq = [...bloqId, ...bloqMae];
    const set: TrocaCelula[] = [{ col: 'ID Pai', de: P, para }];
    if (temIdP) {
      const idP = resolverIdP(para, p, ind, modelo.rebanho);
      if (idP !== rb.idP) set.push({ col: 'ID P', de: rb.idP, para: idP });
    }
    out.push({
      id: `${regra}|${kb}`,
      regra,
      severidade: bloq.length ? 'manual' : 'corrigivel',
      aba: 'RebanhoProd',
      linha: rb.linha,
      animal: rb.id,
      resumo:
        regra === 'pai-preencher'
          ? `${rb.id}: sem pai; a IATF indica ${para}.`
          : regra === 'pai-trocar'
            ? `${rb.id}: está ${P}, a IATF indica ${para}.`
            : `${rb.id}: está ${P}, mas é monta livre.`,
      prova,
      bloqueios: bloq,
      atual: P,
      sugerido: para,
      correcao: bloq.length ? null : { tipo: 'celulas', aba: 'RebanhoProd', linha: rb.linha, guarda, set },
    });
  }

  return out;
}
