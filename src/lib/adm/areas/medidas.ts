import 'server-only';

import { normalizarTipo } from '@/lib/adm/areas/aml';
import { VIEWS_MEDIDA, type LinhaMedida } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * MEDIDAS — a leitura de `adm.medida_detalhe` e as regras da tela da fita
 * métrica.
 *
 * Irmã da AML: mesmo técnico, mesma visita, mesmo animal. A AML dá a NOTA (1 a
 * 9, descritiva); a medida dá o CENTÍMETRO — que é comparável entre animais e
 * entre anos sem depender de tabela de ideal nenhuma. Por isso aqui a média vale
 * a pena e lá não valia.
 *
 * `normalizarTipo` VEM IMPORTADA DA AML, e não copiada: é a MESMA coluna suja
 * ('fêmea' e 'femea'), preenchida pelo MESMO fluxo do app. Duas versões da mesma
 * regra é exatamente como nasceu o bug do `mesmaOrigem` — a cópia do logout ficou
 * sem a correção que a do login recebeu, e o "Sair" passou a devolver 403.
 */

const SQL_MEDIDAS = 'supabase/adm/adm_17_medidas.sql';

const PROJECAO = {
  propriedade_id: true,
  medida_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  data_medida: true,
  tecnico_id: true,
  tipo: true,
  perimetro_toracico: true,
  altura: true,
  altura_garupa: true,
  largura_peito: true,
  largura_garupa: true,
  ligamento_posterior: true,
  ligamento_suspensorio: true,
  volume_ubere: true,
  diametro_tetos: true,
  circunferencia_escrotal: true,
} satisfies Record<keyof LinhaMedida, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// As medidas, com rótulo e grupo
// ─────────────────────────────────────────────────────────────────────────────

export type GrupoMedida = 'corpo' | 'ubere' | 'macho';

export interface DefinicaoMedida {
  chave: keyof LinhaMedida;
  rotulo: string;
  grupo: GrupoMedida;
}

export const MEDIDAS: DefinicaoMedida[] = [
  { chave: 'perimetro_toracico', rotulo: 'Perímetro torácico', grupo: 'corpo' },
  { chave: 'altura', rotulo: 'Altura', grupo: 'corpo' },
  { chave: 'altura_garupa', rotulo: 'Altura de garupa', grupo: 'corpo' },
  { chave: 'largura_peito', rotulo: 'Largura de peito', grupo: 'corpo' },
  { chave: 'largura_garupa', rotulo: 'Largura de garupa', grupo: 'corpo' },
  { chave: 'ligamento_posterior', rotulo: 'Ligamento posterior de úbere', grupo: 'ubere' },
  { chave: 'ligamento_suspensorio', rotulo: 'Ligamento suspensório médio', grupo: 'ubere' },
  { chave: 'volume_ubere', rotulo: 'Volume de úbere', grupo: 'ubere' },
  { chave: 'diametro_tetos', rotulo: 'Diâmetro de tetos', grupo: 'ubere' },
  { chave: 'circunferencia_escrotal', rotulo: 'Circunferência escrotal', grupo: 'macho' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarMedidas(propriedadeId: number): Promise<Resultado<LinhaMedida[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_MEDIDA.detalhe;
  const res = await paginarView(view, SQL_MEDIDAS, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: a visita mede dezenas de animais no mesmo dia — o id desempata.
      .order('data_medida', { ascending: false })
      .order('medida_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraMedida));
}

function paraMedida(l: Linha): LinhaMedida {
  const cm = (chave: string) => numeroDe(l[chave]);
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    medida_id: Math.round(numeroDe(l.medida_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    data_medida: textoDe(l.data_medida) ?? '',
    tecnico_id: numeroDe(l.tecnico_id),
    tipo: textoDe(l.tipo),
    perimetro_toracico: cm('perimetro_toracico'),
    altura: cm('altura'),
    altura_garupa: cm('altura_garupa'),
    largura_peito: cm('largura_peito'),
    largura_garupa: cm('largura_garupa'),
    ligamento_posterior: cm('ligamento_posterior'),
    ligamento_suspensorio: cm('ligamento_suspensorio'),
    volume_ubere: cm('volume_ubere'),
    diametro_tetos: cm('diametro_tetos'),
    circunferencia_escrotal: cm('circunferencia_escrotal'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Medição implausível — o campo trocado
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Piso do perímetro torácico, em centímetros.
 *
 * 30 cm é o menor perímetro que um caprino vivo pode ter (cabrito recém-nascido
 * fica na casa dos 35 a 40). O piso existe só para ESTA medida porque é a única
 * com um chão biológico que eu possa defender sem inventar tabela — e é
 * justamente a que tem o problema no dado.
 */
export const PERIMETRO_MINIMO_CM = 30;

export interface SeparacaoMedidas {
  validas: LinhaMedida[];
  implausiveis: LinhaMedida[];
}

/**
 * Separa as medições cujo perímetro torácico é impossível.
 *
 * O QUE ISSO PEGA, no dado real: seis medições do MESMO DIA na mesma fazenda com
 * perímetro entre 19 e 29 cm — em animais de 70 a 78 cm de altura. Um caprino
 * dessa altura tem uns 90 cm de perímetro; o número anotado bate com a LARGURA
 * de peito da mesma linha (17 a 22 cm). Alguém preencheu o campo errado o dia
 * inteiro. Mais uma linha com 12,00 em todos os campos, que é placeholder.
 *
 * Elas saem das médias e vão para a tela COM A DATA: o padrão (mesmo dia, mesmo
 * técnico) é o que permite pedir a remedição a quem mediu.
 */
export function separarImplausiveis(medidas: LinhaMedida[]): SeparacaoMedidas {
  const impossivel = (m: LinhaMedida) =>
    m.perimetro_toracico !== null && m.perimetro_toracico < PERIMETRO_MINIMO_CM;

  return {
    validas: medidas.filter((m) => !impossivel(m)),
    implausiveis: medidas.filter(impossivel),
  };
}

/** Os dias em que houve medição implausível, com quantas em cada — é a lista que
 *  vira o pedido de remedição. */
export function diasComProblema(implausiveis: LinhaMedida[]): { data: string; medicoes: number }[] {
  const contagem = new Map<string, number>();
  for (const medida of implausiveis) {
    if (medida.data_medida === '') continue;
    contagem.set(medida.data_medida, (contagem.get(medida.data_medida) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([data, medicoes]) => ({ data, medicoes }))
    .sort((a, b) => b.data.localeCompare(a.data));
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfil
// ─────────────────────────────────────────────────────────────────────────────

export interface PerfilMedida {
  chave: keyof LinhaMedida;
  rotulo: string;
  grupo: GrupoMedida;
  media: number | null;
  minimo: number | null;
  maximo: number | null;
  /** Cada medida tem o SEU denominador: úbere só em fêmea, escrotal só em macho. */
  medicoes: number;
}

/**
 * Média, mínimo e máximo de cada medida, cada uma com o seu denominador.
 *
 * Aqui a média é legítima (centímetro é grandeza contínua e comparável), ao
 * contrário do escore linear da AML — mas o denominador continua sendo metade da
 * informação: "volume de úbere 10,3 cm" sobre 134 medições é uma afirmação;
 * sobre 4, é uma anedota.
 */
export function perfilDasMedidas(medidas: LinhaMedida[]): PerfilMedida[] {
  return MEDIDAS.map((definicao) => {
    const valores = medidas
      .map((m) => m[definicao.chave])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

    if (valores.length === 0) {
      return { ...definicao, media: null, minimo: null, maximo: null, medicoes: 0 };
    }

    return {
      ...definicao,
      media: valores.reduce((acc, v) => acc + v, 0) / valores.length,
      minimo: Math.min(...valores),
      maximo: Math.max(...valores),
      medicoes: valores.length,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e comparação por sexo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoMedidas {
  medicoes: number;
  animais: number;
  femeas: number;
  machos: number;
  remedidos: number;
  primeira: string | null;
  ultima: string | null;
  perimetroMedio: number | null;
  alturaMedia: number | null;
}

export function resumoMedidas(medidas: LinhaMedida[]): ResumoMedidas {
  const porAnimal = new Map<number, number>();
  for (const medida of medidas) porAnimal.set(medida.animal_id, (porAnimal.get(medida.animal_id) ?? 0) + 1);

  const datas = medidas.map((m) => m.data_medida).filter((d) => d !== '').sort();
  const media = (chave: keyof LinhaMedida) => {
    const valores = medidas
      .map((m) => m[chave])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    return valores.length > 0 ? valores.reduce((acc, v) => acc + v, 0) / valores.length : null;
  };

  return {
    medicoes: medidas.length,
    animais: porAnimal.size,
    femeas: medidas.filter((m) => normalizarTipo(m.tipo) === 'fêmea').length,
    machos: medidas.filter((m) => normalizarTipo(m.tipo) === 'macho').length,
    remedidos: [...porAnimal.values()].filter((n) => n > 1).length,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
    perimetroMedio: media('perimetro_toracico'),
    alturaMedia: media('altura'),
  };
}

/** Medições por mês — mostra se a fita métrica é rotina ou evento isolado. */
export function serieMedicoes(medidas: LinhaMedida[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const medida of medidas) {
    if (medida.data_medida === '') continue;
    const mes = medida.data_medida.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
