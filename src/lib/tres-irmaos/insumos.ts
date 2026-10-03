/**
 * Pedido de insumos da ração — quanto comprar para um período de dias.
 *
 * É a conta que o Lucas faz à mão antes de ligar para o fornecedor: cabeças
 * de cada categoria × o que cada cabeça come por dia × os dias do pedido,
 * aberto insumo por insumo. As três entradas vêm do SeabraApp, que é a fonte
 * de verdade do produto: o efetivo por categoria (rebanho ativo), o consumo
 * diário por categoria (`consumo_categoria` — kg de concentrado, volumoso e
 * sal mineral por cabeça) e a formulação (`formulacao_categoria` — a
 * proporção de cada insumo DENTRO do seu grupo).
 *
 * Puro, sem rede: a página lê o app e passa tudo pronto, então o painel
 * recalcula na hora quando a pessoa muda os dias ou o nº de cabeças.
 *
 * As proporções do app não fecham 100% sempre — em 03/10/2026 o concentrado
 * da lactante somava 98% e o da recriada 200% (o sal mineral da recria está
 * cadastrado lá como concentrado). O rateio proporcional é a saída: o total
 * por dia continua sendo o que o app declara em `consumo_categoria`, que é o
 * número que o produtor confere, e a formulação só decide como ele se divide.
 * Toda diferença vira aviso na tela — nunca um número silenciosamente errado.
 */

/** Uma semana é o menor pedido que faz sentido; um ano, o maior (o Felipe, 03/10/2026). */
export const DIAS_MIN = 7;
export const DIAS_MAX = 365;
export const DIAS_PADRAO = 30;
/** Atalhos de período na tela. */
export const DIAS_ATALHOS = [7, 15, 30, 60, 90, 180, 365];

/**
 * Os três grupos de alimento do app: cada um tem um kg/cabeça/dia em
 * `consumo_categoria` e os insumos do mesmo `tipo` na formulação. O quarto
 * tipo de insumo do app ('ordenha', em ml) é produto de limpeza, não dieta.
 */
export const GRUPOS = [
  { chave: 'concentrado', nome: 'Concentrado', coluna: 'kg_concentrado_dia' },
  { chave: 'volumoso', nome: 'Volumoso', coluna: 'kg_volumoso_dia' },
  { chave: 'sal_mineral', nome: 'Sal mineral', coluna: 'kg_sal_dia' },
] as const;

export type ChaveGrupo = (typeof GRUPOS)[number]['chave'];

export const CHAVES_GRUPO: ChaveGrupo[] = GRUPOS.map((g) => g.chave);

export function nomeGrupo(chave: ChaveGrupo): string {
  return GRUPOS.find((g) => g.chave === chave)?.nome ?? chave;
}

export interface InsumoApp {
  id: number;
  nome: string;
  grupo: ChaveGrupo;
  /** Unidade do cadastro — kg em todo insumo de dieta. */
  unidade: string;
  /** R$ por unidade. O app guarda 0 para "não informado"; aqui isso é null. */
  valorUnitario: number | null;
  ativo: boolean;
}

export interface ItemFormulacao {
  insumoId: number;
  /** Fração do grupo (0,4 = 40% do concentrado), crua do app. */
  proporcao: number;
}

export interface DietaCategoria {
  /** Nome da categoria do app: "lactante", "seca", "pre-parto"… */
  categoria: string;
  /** Cabeças ativas hoje, ou o que a pessoa digitou no painel. */
  animais: number;
  /** kg por cabeça por dia de cada grupo, como está no app. */
  porCabeca: Record<ChaveGrupo, number>;
  formulacao: ItemFormulacao[];
  /** A categoria não tem linha em `consumo_categoria` (nada cadastrado no app). */
  semDieta: boolean;
}

/** Consumo e formulação de uma categoria, como estão cadastrados no app. */
export interface DietaCadastrada {
  categoria: string;
  porCabeca: Record<ChaveGrupo, number>;
  formulacao: ItemFormulacao[];
}

/** Categorias do app que não são animal em cocho — não entram no pedido nem nos avisos. */
export const CATEGORIAS_SEM_DIETA = ['semen', 'embriao', 'obito', 'venda', 'descartado', 'historico'];

export interface EntradaPedido {
  dias: number;
  categorias: DietaCategoria[];
  insumos: InsumoApp[];
}

export interface ParteDeCategoria {
  categoria: string;
  kgDia: number;
}

export interface ItemPedido {
  insumoId: number;
  nome: string;
  grupo: ChaveGrupo;
  unidade: string;
  kgDia: number;
  kgPeriodo: number;
  valorUnitario: number | null;
  /** null quando o insumo está sem preço no app. */
  custoPeriodo: number | null;
  ativo: boolean;
  /** Quanto cada categoria puxa deste insumo, da maior para a menor. */
  porCategoria: ParteDeCategoria[];
}

export interface LinhaCategoria {
  categoria: string;
  animais: number;
  porCabeca: Record<ChaveGrupo, number>;
  /** kg/dia de cada grupo somando as cabeças da categoria. */
  porGrupo: Record<ChaveGrupo, number>;
  kgCabecaDia: number;
  kgDia: number;
  kgPeriodo: number;
  /** R$/dia do que tem preço no app. */
  custoDia: number;
  /** Algum insumo da categoria está sem preço: o custo é parcial. */
  custoParcial: boolean;
  semDieta: boolean;
}

export interface LinhaGrupo {
  grupo: ChaveGrupo;
  nome: string;
  kgDia: number;
  kgPeriodo: number;
  custoPeriodo: number;
  custoParcial: boolean;
  /** kg/dia que o app manda dar mas nenhum insumo da formulação cobre. */
  semInsumoKgDia: number;
}

export interface Pedido {
  dias: number;
  animais: number;
  /** kg/dia que o pedido cobre (só o que a formulação atribui a um insumo). */
  kgDia: number;
  kgPeriodo: number;
  /** kg/dia que o app manda dar, atribuído ou não — "o total que come por dia". */
  kgDiaConsumo: number;
  kgPeriodoConsumo: number;
  custoDia: number;
  custoPeriodo: number;
  /** Tem insumo sem preço no app: o custo mostrado é só uma parte. */
  custoParcial: boolean;
  itens: ItemPedido[];
  categorias: LinhaCategoria[];
  grupos: LinhaGrupo[];
  /** Conferências para a tela: formulação que não fecha, kg sem insumo, preço faltando. */
  avisos: string[];
}

/**
 * Junta a dieta do app com o efetivo por categoria: cada categoria que tem
 * animais OU dieta cadastrada vira uma linha do pedido. Categoria com animais
 * e sem dieta entra marcada (`semDieta`) para a tela cobrar o cadastro no app;
 * categoria com dieta e sem animal fica na lista com zero, para dar para
 * simular ("se eu puser 20 na recria, quanto muda o pedido?").
 */
export function montarCategorias(dietas: DietaCadastrada[], efetivo: Record<string, number>): DietaCategoria[] {
  const porNome = new Map(dietas.map((d) => [d.categoria, d]));
  const nomes = [...new Set([...dietas.map((d) => d.categoria), ...Object.keys(efetivo)])].filter((n) => !CATEGORIAS_SEM_DIETA.includes(n));
  return nomes
    .map((categoria) => {
      const dieta = porNome.get(categoria);
      return {
        categoria,
        animais: Math.max(0, Math.round(positivo(efetivo[categoria]))),
        porCabeca: dieta?.porCabeca ?? { concentrado: 0, volumoso: 0, sal_mineral: 0 },
        formulacao: dieta?.formulacao ?? [],
        semDieta: !dieta,
      };
    })
    .sort((a, b) => b.animais - a.animais || a.categoria.localeCompare(b.categoria, 'pt-BR'));
}

/** Diferença de até 0,5 ponto percentual na soma do grupo não vira aviso (arredondamento do app). */
const TOLERANCIA = 0.005;

function positivo(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function limitarDias(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DIAS_PADRAO;
  return Math.min(DIAS_MAX, Math.max(DIAS_MIN, v));
}

/** "1,2" · "0,75" · "12" — número curto para dentro de um aviso. */
function num(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function pct(fracao: number): string {
  return `${num(fracao * 100)}%`;
}

export function vazio(dias = DIAS_PADRAO): Pedido {
  return {
    dias: limitarDias(dias),
    animais: 0,
    kgDia: 0,
    kgPeriodo: 0,
    kgDiaConsumo: 0,
    kgPeriodoConsumo: 0,
    custoDia: 0,
    custoPeriodo: 0,
    custoParcial: false,
    itens: [],
    categorias: [],
    grupos: GRUPOS.map((g) => ({ grupo: g.chave, nome: g.nome, kgDia: 0, kgPeriodo: 0, custoPeriodo: 0, custoParcial: false, semInsumoKgDia: 0 })),
    avisos: [],
  };
}

/**
 * O pedido fechado. Cada categoria gasta, por grupo, `animais × kg/cabeça/dia`
 * e esse total se divide entre os insumos daquele grupo na proporção do app
 * (rateada pela soma, ver o cabeçalho). Insumo que a formulação cita mas que
 * não está no catálogo é ignorado — a proporção dele não rateia nada e o
 * aviso diz quanto ficou de fora.
 */
export function calcularPedido({ dias, categorias, insumos }: EntradaPedido): Pedido {
  const d = limitarDias(dias);
  const catalogo = new Map(insumos.map((i) => [i.id, i]));
  const avisos: string[] = [];
  const acumulado = new Map<number, { kgDia: number; porCategoria: Map<string, number> }>();
  const semInsumo = new Map<ChaveGrupo, number>();
  const linhasCategoria: LinhaCategoria[] = [];
  const semPreco = new Set<string>();
  const inativos = new Set<string>();

  for (const c of categorias) {
    const animais = Math.max(0, Math.round(positivo(c.animais)));
    const porGrupo = {} as Record<ChaveGrupo, number>;
    const porCabeca = {} as Record<ChaveGrupo, number>;
    let kgDia = 0;
    let custoDia = 0;
    let custoParcial = false;

    for (const g of GRUPOS) {
      const cabeca = positivo(c.porCabeca?.[g.chave]);
      const total = cabeca * animais;
      porCabeca[g.chave] = cabeca;
      porGrupo[g.chave] = total;
      kgDia += total;
      if (total === 0) continue;

      // Só os insumos do grupo que existem no catálogo e pesam algo.
      const doGrupo = c.formulacao
        .map((f) => ({ proporcao: positivo(f.proporcao), insumo: catalogo.get(f.insumoId) }))
        .filter((x): x is { proporcao: number; insumo: InsumoApp } => !!x.insumo && x.insumo.grupo === g.chave && x.proporcao > 0);
      const soma = doGrupo.reduce((t, x) => t + x.proporcao, 0);

      if (soma === 0) {
        semInsumo.set(g.chave, (semInsumo.get(g.chave) ?? 0) + total);
        avisos.push(
          `${c.categoria}: o app manda ${num(cabeca)} kg/cab/dia de ${g.nome.toLowerCase()} mas não tem insumo desse grupo na formulação — ${num(total)} kg/dia ficaram fora do pedido.`,
        );
        continue;
      }
      if (Math.abs(soma - 1) > TOLERANCIA) {
        avisos.push(
          `${c.categoria}: as proporções de ${g.nome.toLowerCase()} somam ${pct(soma)} no app (deviam somar 100%) — rateei os ${num(cabeca)} kg/cab/dia entre os ${doGrupo.length} insumos na mesma proporção.`,
        );
      }

      for (const { proporcao, insumo } of doGrupo) {
        const parte = total * (proporcao / soma);
        const alvo = acumulado.get(insumo.id) ?? { kgDia: 0, porCategoria: new Map<string, number>() };
        alvo.kgDia += parte;
        alvo.porCategoria.set(c.categoria, (alvo.porCategoria.get(c.categoria) ?? 0) + parte);
        acumulado.set(insumo.id, alvo);
        if (insumo.valorUnitario == null) {
          semPreco.add(insumo.nome);
          custoParcial = true;
        } else {
          custoDia += parte * insumo.valorUnitario;
        }
        if (!insumo.ativo) inativos.add(insumo.nome);
      }
    }

    if (c.semDieta && animais > 0) {
      avisos.push(`${c.categoria}: ${animais} ${animais === 1 ? 'animal' : 'animais'} sem dieta cadastrada no app — ficaram fora do pedido.`);
    }

    linhasCategoria.push({
      categoria: c.categoria,
      animais,
      porCabeca,
      porGrupo,
      kgCabecaDia: CHAVES_GRUPO.reduce((t, k) => t + porCabeca[k], 0),
      kgDia,
      kgPeriodo: kgDia * d,
      custoDia,
      custoParcial,
      semDieta: !!c.semDieta,
    });
  }

  const itens: ItemPedido[] = [...acumulado.entries()]
    .map(([id, { kgDia, porCategoria }]) => {
      const insumo = catalogo.get(id)!;
      return {
        insumoId: id,
        nome: insumo.nome,
        grupo: insumo.grupo,
        unidade: insumo.unidade,
        kgDia,
        kgPeriodo: kgDia * d,
        valorUnitario: insumo.valorUnitario,
        custoPeriodo: insumo.valorUnitario == null ? null : kgDia * d * insumo.valorUnitario,
        ativo: insumo.ativo,
        porCategoria: [...porCategoria.entries()]
          .map(([categoria, kg]) => ({ categoria, kgDia: kg }))
          .sort((a, b) => b.kgDia - a.kgDia),
      };
    })
    // Grupo na ordem do pedido (concentrado primeiro: é o que pesa no bolso), maior volume antes.
    .sort((a, b) => CHAVES_GRUPO.indexOf(a.grupo) - CHAVES_GRUPO.indexOf(b.grupo) || b.kgPeriodo - a.kgPeriodo || a.nome.localeCompare(b.nome, 'pt-BR'));

  const grupos: LinhaGrupo[] = GRUPOS.map((g) => {
    const doGrupo = itens.filter((i) => i.grupo === g.chave);
    return {
      grupo: g.chave,
      nome: g.nome,
      kgDia: doGrupo.reduce((t, i) => t + i.kgDia, 0),
      kgPeriodo: doGrupo.reduce((t, i) => t + i.kgPeriodo, 0),
      custoPeriodo: doGrupo.reduce((t, i) => t + (i.custoPeriodo ?? 0), 0),
      custoParcial: doGrupo.some((i) => i.custoPeriodo == null),
      semInsumoKgDia: semInsumo.get(g.chave) ?? 0,
    };
  });

  if (semPreco.size > 0) {
    avisos.push(`Sem preço no app: ${[...semPreco].sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', ')}. ${semPreco.size === 1 ? 'Ele entra' : 'Eles entram'} no pedido em kg, mas fora do custo.`);
  }
  if (inativos.size > 0) {
    avisos.push(`Marcado${inativos.size === 1 ? '' : 's'} como inativo no app, mas ainda na formulação: ${[...inativos].sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', ')}.`);
  }

  const kgDia = itens.reduce((t, i) => t + i.kgDia, 0);
  const kgDiaConsumo = linhasCategoria.reduce((t, c) => t + c.kgDia, 0);
  const custoDia = linhasCategoria.reduce((t, c) => t + c.custoDia, 0);

  return {
    dias: d,
    animais: linhasCategoria.reduce((t, c) => t + c.animais, 0),
    kgDia,
    kgPeriodo: kgDia * d,
    kgDiaConsumo,
    kgPeriodoConsumo: kgDiaConsumo * d,
    custoDia,
    custoPeriodo: custoDia * d,
    custoParcial: itens.some((i) => i.custoPeriodo == null),
    itens,
    categorias: linhasCategoria.sort((a, b) => b.kgDia - a.kgDia || a.categoria.localeCompare(b.categoria, 'pt-BR')),
    grupos,
    avisos,
  };
}
