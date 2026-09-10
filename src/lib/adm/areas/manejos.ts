import 'server-only';

import { VIEWS_MANEJO, type LinhaManejo } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * MANEJO — a leitura de `adm.manejo_detalhe` e as regras da tela.
 *
 * ⚠️ A LINHA NÃO É O MANEJO. A view faz `unnest` de `tipo_manejo`, então uma ida
 * ao curral que registrou FAMACHA, escore e casco vira TRÊS linhas. Toda
 * contagem de "manejos" aqui usa `manejo_id` distinto — contar linhas
 * multiplicaria o trabalho da fazenda pelo número de coisas medidas de uma vez.
 *
 * É esse desmembramento que permite a tela filtrar por tipo de lançamento, que é
 * como o operador pensa ("quero ver só os FAMACHA").
 */

const SQL_MANEJO = 'supabase/adm/adm_21_manejo.sql';

const PROJECAO = {
  propriedade_id: true,
  manejo_id: true,
  tipo: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  categoria: true,
  data_manejo: true,
  famacha: true,
  escore_corporal: true,
  casco_status: true,
  protocolo_sanitario: true,
  diagnostico_gestacao: true,
  dias_gestacao: true,
  observacao: true,
  cmt_me: true,
  cmt_md: true,
  sessao_coletivo_id: true,
} satisfies Record<keyof LinhaManejo, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Os tipos de lançamento
// ─────────────────────────────────────────────────────────────────────────────

export interface TipoManejo {
  chave: string;
  rotulo: string;
  detalhe: string;
}

/** Os dez tipos da base, do mais lançado para o menos. */
export const TIPOS_MANEJO: TipoManejo[] = [
  { chave: 'famacha', rotulo: 'FAMACHA', detalhe: 'grau de anemia pela mucosa ocular' },
  { chave: 'peso', rotulo: 'Peso', detalhe: 'pesagem feita dentro do manejo' },
  {
    chave: 'escore_condicao_corporal',
    rotulo: 'Escore corporal',
    detalhe: 'gordura de cobertura, de 1 a 5',
  },
  { chave: 'casco', rotulo: 'Casco', detalhe: 'casqueamento — feito ou a fazer' },
  { chave: 'protocolo_sanitario', rotulo: 'Protocolo sanitário', detalhe: 'vacina, vermífugo, carrapaticida' },
  { chave: 'diagnostico_gestacao', rotulo: 'Diagnóstico de gestação', detalhe: 'DG lançado no curral' },
  { chave: 'observacao', rotulo: 'Observação', detalhe: 'texto livre do manejo' },
  { chave: 'descarte', rotulo: 'Descarte', detalhe: 'baixa do animal — não tem tabela própria' },
  { chave: 'ubere', rotulo: 'Úbere', detalhe: 'avaliação de úbere' },
  { chave: 'cmt', rotulo: 'CMT', detalhe: 'California Mastitis Test, por metade do úbere' },
];

const ROTULOS = new Map(TIPOS_MANEJO.map((t) => [t.chave, t.rotulo]));

export function rotuloDoTipo(chave: string): string {
  return ROTULOS.get(chave) ?? chave;
}

/** `?tipo=` é texto de fora: só vira filtro se estiver na lista. */
export function lerTipo(bruto: string | string[] | undefined): string | null {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  if (!valor) return null;
  return TIPOS_MANEJO.some((t) => t.chave === valor) ? valor : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarManejos(
  propriedadeId: number,
  tipo: string | null,
): Promise<Resultado<LinhaManejo[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_MANEJO.detalhe;
  const res = await paginarView(view, SQL_MANEJO, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = tipo === null ? base : base.eq('tipo', tipo);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: a mesma sessão de curral tem dezenas de linhas no mesmo dia,
      // e o mesmo manejo aparece uma vez por tipo — por isso id E tipo.
      .order('data_manejo', { ascending: false })
      .order('manejo_id', { ascending: false })
      .order('tipo', { ascending: true })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraManejo));
}

function paraManejo(l: Linha): LinhaManejo {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    manejo_id: Math.round(numeroDe(l.manejo_id) ?? 0),
    tipo: textoDe(l.tipo) ?? '',
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    categoria: textoDe(l.categoria),
    data_manejo: textoDe(l.data_manejo) ?? '',
    famacha: numeroDe(l.famacha),
    escore_corporal: numeroDe(l.escore_corporal),
    casco_status: textoDe(l.casco_status),
    protocolo_sanitario: textoDe(l.protocolo_sanitario),
    diagnostico_gestacao: textoDe(l.diagnostico_gestacao),
    dias_gestacao: numeroDe(l.dias_gestacao),
    observacao: textoDe(l.observacao),
    cmt_me: textoDe(l.cmt_me),
    cmt_md: textoDe(l.cmt_md),
    sessao_coletivo_id: textoDe(l.sessao_coletivo_id),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contagem por tipo — o desmembramento
// ─────────────────────────────────────────────────────────────────────────────

export interface ContagemTipo {
  chave: string;
  rotulo: string;
  detalhe: string;
  /** Manejos DISTINTOS que registraram este tipo. */
  manejos: number;
  animais: number;
  fracao: number | null;
}

/**
 * Quantos manejos registraram cada tipo.
 *
 * A soma das linhas passa do total de manejos, e isso é correto: um manejo que
 * mediu FAMACHA e escore conta nos dois. A fração é sobre os manejos DISTINTOS
 * do recorte — é "em quantas idas ao curral esse tipo foi medido".
 */
export function contarPorTipo(manejos: LinhaManejo[]): ContagemTipo[] {
  const totalManejos = new Set(manejos.map((m) => m.manejo_id)).size;

  return TIPOS_MANEJO.map((tipo) => {
    const doTipo = manejos.filter((m) => m.tipo === tipo.chave);
    const distintos = new Set(doTipo.map((m) => m.manejo_id)).size;
    return {
      chave: tipo.chave,
      rotulo: tipo.rotulo,
      detalhe: tipo.detalhe,
      manejos: distintos,
      animais: new Set(doTipo.map((m) => m.animal_id)).size,
      fracao: totalManejos > 0 ? distintos / totalManejos : null,
    };
  }).filter((t) => t.manejos > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoManejos {
  /** DISTINTOS — nunca a contagem de linhas. */
  manejos: number;
  linhas: number;
  animais: number;
  dias: number;
  tipos: number;
  /** Manejos que mediram mais de uma coisa de uma vez. */
  multiTipo: number;
  primeira: string | null;
  ultima: string | null;
}

export function resumoManejos(manejos: LinhaManejo[]): ResumoManejos {
  const porManejo = new Map<number, number>();
  for (const linha of manejos) porManejo.set(linha.manejo_id, (porManejo.get(linha.manejo_id) ?? 0) + 1);

  const datas = manejos.map((m) => m.data_manejo).filter((d) => d !== '').sort();

  return {
    manejos: porManejo.size,
    linhas: manejos.length,
    animais: new Set(manejos.map((m) => m.animal_id)).size,
    dias: new Set(datas).size,
    tipos: new Set(manejos.map((m) => m.tipo)).size,
    multiTipo: [...porManejo.values()].filter((n) => n > 1).length,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A dedução que toda medição precisa fazer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma linha por manejo — obrigatório antes de contar QUALQUER medição.
 *
 * ⚠️ FOI UM BUG REAL, pego conferindo com o banco: `escalaFamacha` contava
 * linhas, e a escala da fazenda 258 somou 1.009 medições de FAMACHA em 600
 * manejos. O motivo é o `unnest` da view — o manejo que mediu FAMACHA, peso e
 * escore vira TRÊS linhas, e as três carregam o mesmo valor de `famacha`. Contar
 * linhas multiplica a medição pelo número de coisas medidas na mesma ida ao
 * curral, e infla justamente o cliente mais caprichoso.
 *
 * `valoresDeCasco` e `serieManejos` já faziam isso por dentro (com Set de ids);
 * esta função existe para que nenhuma medição futura esqueça.
 */
function umaLinhaPorManejo(manejos: LinhaManejo[]): LinhaManejo[] {
  const vistos = new Set<number>();
  const unicos: LinhaManejo[] = [];
  for (const manejo of manejos) {
    if (vistos.has(manejo.manejo_id)) continue;
    vistos.add(manejo.manejo_id);
    unicos.push(manejo);
  }
  return unicos;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAMACHA — a escala invertida
// ─────────────────────────────────────────────────────────────────────────────

export const GRAUS_FAMACHA = [1, 2, 3, 4, 5] as const;
/** A partir de 4 o protocolo manda tratar — mesma constante de areas/sanidade.ts. */
export const FAMACHA_CRITICO = 4;

export interface GrauFamacha {
  grau: number;
  medicoes: number;
  fracao: number | null;
  critico: boolean;
}

/**
 * A escala FAMACHA, sempre com os cinco graus e NA ORDEM DA ESCALA.
 *
 * ⚠️ A ESCALA É INVERTIDA: 1 é o animal saudável e 5 o anêmico grave (o cartão
 * mede a coloração da mucosa ocular na verminose). Média subindo é notícia ruim,
 * e ordenar por volume — o que um gráfico de ranking faria — destruiria a
 * leitura, que é "onde o rebanho se concentra na escala".
 */
export function escalaFamacha(manejos: LinhaManejo[]): GrauFamacha[] {
  const medicoes = umaLinhaPorManejo(manejos).filter(
    (m) => m.famacha !== null && m.famacha >= 1 && m.famacha <= 5,
  );
  const total = medicoes.length;

  return GRAUS_FAMACHA.map((grau) => {
    const quantas = medicoes.filter((m) => Math.round(m.famacha ?? 0) === grau).length;
    return {
      grau,
      medicoes: quantas,
      fracao: total > 0 ? quantas / total : null,
      critico: grau >= FAMACHA_CRITICO,
    };
  });
}

/** Medições em grau 4 ou 5 — os animais que o protocolo manda tratar. */
export function medicoesCriticas(escala: GrauFamacha[]): number {
  return escala.filter((g) => g.critico).reduce((acc, g) => acc + g.medicoes, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Escore corporal
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaEscore {
  rotulo: string;
  medicoes: number;
  fracao: number | null;
  alerta: boolean;
}

/**
 * Escore corporal em faixas de meio ponto.
 *
 * Abaixo de 2,5 é animal magro (alerta) e acima de 4 é obeso — os dois extremos
 * custam: o magro não emprenha, o gordo tem parto difícil. Por isso as duas
 * pontas são marcadas, e não só a de baixo.
 */
export function faixasDeEscore(manejos: LinhaManejo[]): FaixaEscore[] {
  const medicoes = umaLinhaPorManejo(manejos).filter(
    (m) => m.escore_corporal !== null && m.escore_corporal > 0,
  );
  const total = medicoes.length;

  const faixas: { rotulo: string; de: number; ate: number; alerta: boolean }[] = [
    { rotulo: 'até 2,0', de: 0, ate: 2, alerta: true },
    { rotulo: '2,5', de: 2, ate: 2.5, alerta: true },
    { rotulo: '3,0', de: 2.5, ate: 3, alerta: false },
    { rotulo: '3,5', de: 3, ate: 3.5, alerta: false },
    { rotulo: '4,0', de: 3.5, ate: 4, alerta: false },
    { rotulo: 'acima de 4,0', de: 4, ate: Infinity, alerta: true },
  ];

  return faixas.map((faixa) => {
    const quantas = medicoes.filter((m) => {
      const escore = m.escore_corporal ?? 0;
      return escore > faixa.de && escore <= faixa.ate;
    }).length;
    return {
      rotulo: faixa.rotulo,
      medicoes: quantas,
      fracao: total > 0 ? quantas / total : null,
      alerta: faixa.alerta,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Casco — a coluna que mistura duas perguntas
// ─────────────────────────────────────────────────────────────────────────────

export interface ValorCasco {
  valor: string;
  manejos: number;
  /** Valor que não é nem 'Feito' nem 'A fazer' — inclui o booleano vazado. */
  suspeito: boolean;
}

/**
 * Os valores de `casco_status` como estão, com a contagem de cada um.
 *
 * NÃO NORMALIZA, e a recusa é o ponto: a coluna mistura DUAS perguntas — "o
 * casqueamento foi feito?" ('Feito', 'A fazer') e "como está o casco?"
 * ('saudavel', 'trincado', 'Bom') — e ainda tem 29 linhas com o texto 'False',
 * que é um booleano que vazou para uma coluna de texto.
 *
 * Traduzir 'False' para "a fazer" seria adivinhar: pode ser "não foi feito" ou
 * "casco não está bom". A tela mostra os valores crus com a contagem, e marca
 * como suspeito o que não cabe em nenhuma das duas respostas esperadas — quem
 * decide o que fazer é quem conhece o cliente.
 */
export function valoresDeCasco(manejos: LinhaManejo[]): ValorCasco[] {
  const esperados = new Set(['feito', 'a fazer']);
  const contagem = new Map<string, Set<number>>();

  for (const manejo of manejos) {
    const valor = manejo.casco_status?.trim();
    if (!valor) continue;
    const atual = contagem.get(valor) ?? new Set<number>();
    atual.add(manejo.manejo_id);
    contagem.set(valor, atual);
  }

  return [...contagem.entries()]
    .map(([valor, ids]) => ({
      valor,
      manejos: ids.size,
      suspeito: !esperados.has(valor.toLowerCase()),
    }))
    .sort((a, b) => b.manejos - a.manejos || a.valor.localeCompare(b.valor, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Série
// ─────────────────────────────────────────────────────────────────────────────

/** Manejos DISTINTOS por mês — não linhas, senão o mês com manejo multi-tipo
 *  apareceria como pico de trabalho que não houve. */
export function serieManejos(manejos: LinhaManejo[]): PontoSerie[] {
  const porMes = new Map<string, Set<number>>();
  for (const manejo of manejos) {
    if (manejo.data_manejo === '') continue;
    const mes = manejo.data_manejo.slice(0, 7);
    const atual = porMes.get(mes) ?? new Set<number>();
    atual.add(manejo.manejo_id);
    porMes.set(mes, atual);
  }
  return [...porMes.entries()]
    .map(([periodo, ids]) => ({ periodo, valor: ids.size }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
