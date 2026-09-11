/**
 * SITUAÇÃO REPRODUTIVA — a regra que transforma três eventos (cobertura, DG,
 * aborto) num estado, avaliado numa DATA DE REFERÊNCIA.
 *
 * É função pura e vive sozinha porque duas telas usam a mesma regra em datas
 * diferentes: o controle leiteiro pergunta "como estava a cabra NO DIA do
 * controle", o balanço reprodutivo pergunta "como está HOJE". Uma regra só,
 * um teste só — e nenhuma das duas lê os caches de `rebanho` (`reproducao`,
 * `ultima_cobertura`, `data_dg`), que são o estado de hoje gravado por trigger
 * e não valem para o passado nem, às vezes, para o presente (na 244, 38 das 55
 * "gestantes" do cache já tinham parido).
 *
 * A ÂNCORA É O ÚLTIMO PARTO: quem monta os eventos (as views adm_28 e adm_29)
 * só traz cobertura, DG e aborto POSTERIORES ao parto. Cobertura anterior é a
 * que gerou a lactação — já deu no que deu.
 */

/** Os eventos desde o último parto até a data de referência — o que a view
 *  entrega e a regra consome. `LinhaContextoControle` e `LinhaFemea` cabem aqui. */
export interface EventosReprodutivos {
  servico_data: string | null;
  servico_metodo: string | null;
  servico_reprodutor: string | null;
  dg_data: string | null;
  /** 'gestante' | 'vazia' | 'aguardando' */
  dg_resultado: string | null;
  aborto_data: string | null;
  /** Idade do feto no DG (ultrassom), em dias. Quando existe, é ela que ancora
   *  a gestação — não a cobertura registrada, que pode ser a que falhou. */
  dg_dias_gestacao?: number | null;
}

export type EstadoReprodutivo =
  | 'gestante'
  | 'coberta'
  | 'vazia'
  | 'abortou'
  | 'nao_coberta'
  | 'sem_informacao';

/** Gestação caprina: ~150 dias. É o que projeta o parto a partir da cobertura. */
export const GESTACAO_DIAS = 150;
/** A cabra gestante deveria estar SECA daqui em diante — 60 dias antes do parto. */
export const SECAR_AOS_DIAS_DE_GESTACAO = GESTACAO_DIAS - 60;
/** Cobertura sem DG depois disso é DG atrasado: com 45 dias o ultrassom já vê. */
export const DG_ATRASADO_APOS = 45;
/** Cobertura mais velha que isso sem DG nem parto não é "coberta" — é evento
 *  perdido. Mesma janela de gestação de areas/servicos.ts. */
export const COBERTURA_VALIDA_ATE = 170;
/** Não coberta com mais de 60 dias de lactação já pode voltar ao bode. */
export const PRONTA_PARA_COBRIR_APOS = 60;

export interface SituacaoReprodutiva {
  estado: EstadoReprodutivo;
  /** O texto da célula — curto, sem data (as datas vão nos campos). */
  rotulo: string;
  dataCobertura: string | null;
  metodo: string | null;
  reprodutor: string | null;
  dataDg: string | null;
  /** Dias entre a cobertura e o controle, quando há cobertura válida. */
  diasDesdeCobertura: number | null;
  /** Só para gestante: a data em que emprenhou — pelo feto (DG − idade do feto)
   *  quando o ultrassom mediu, senão a cobertura registrada. */
  concepcao: string | null;
  /** 'feto' | 'cobertura' — de onde veio `concepcao`. */
  origemGestacao: 'feto' | 'cobertura' | null;
  /** Dias de gestação na data de referência, a partir de `concepcao`. */
  diasDeGestacao: number | null;
  /** Só para gestante com concepção conhecida: concepção + 150 dias. */
  partoPrevisto: string | null;
  /** Gestante com mais de 90 dias de gestação e ainda no controle — devia estar seca. */
  aSecar: boolean;
  /** Coberta há mais de 45 dias e sem DG. */
  dgAtrasado: boolean;
  /** Gestante por DG sem nenhuma cobertura lançada — o funil invertido, por animal. */
  semCoberturaLancada: boolean;
  /** O feto diz que emprenhou longe da cobertura registrada: a cobertura
   *  lançada falhou e o bode do piquete fez o serviço sem lançamento. */
  coberturaDivergente: boolean;
}

/** Feto mais de 3 semanas fora da cobertura registrada é outro cio — a
 *  cobertura lançada não foi a que emprenhou. */
export const DIVERGENCIA_COBERTURA_DIAS = 21;

const UM_DIA = 86_400_000;

/** 'YYYY-MM-DD' → epoch em UTC, para o fuso não mover o dia. */
function diaEmUtc(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return Date.UTC(ano, (mes ?? 1) - 1, dia ?? 1);
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((diaEmUtc(ate) - diaEmUtc(de)) / UM_DIA);
}

export function somarDias(iso: string, dias: number): string {
  return new Date(diaEmUtc(iso) + dias * UM_DIA).toISOString().slice(0, 10);
}

/**
 * O estado reprodutivo do animal NO DIA do controle, a partir dos eventos desde
 * o início da lactação — nunca dos caches de `rebanho`.
 *
 * A ordem é a do evento mais conclusivo, como em areas/servicos.ts: aborto >
 * diagnóstico > cobertura. Um DG anterior à última cobertura é de outro cio e
 * não vale; uma cobertura mais velha que `COBERTURA_VALIDA_ATE` sem DG nem
 * parto é evento perdido, não "coberta".
 */
export function situacaoReprodutiva(
  contexto: EventosReprodutivos | null,
  dataControle: string,
): SituacaoReprodutiva {
  const base: SituacaoReprodutiva = {
    estado: 'sem_informacao',
    rotulo: 'Sem informação',
    dataCobertura: null,
    metodo: null,
    reprodutor: null,
    dataDg: null,
    diasDesdeCobertura: null,
    concepcao: null,
    origemGestacao: null,
    diasDeGestacao: null,
    partoPrevisto: null,
    aSecar: false,
    dgAtrasado: false,
    semCoberturaLancada: false,
    coberturaDivergente: false,
  };
  if (!contexto || dataControle === '') return base;

  const servico = contexto.servico_data;
  const dg = contexto.dg_data;
  const aborto = contexto.aborto_data;
  const comServico = {
    dataCobertura: servico,
    metodo: contexto.servico_metodo,
    reprodutor: contexto.servico_reprodutor,
    diasDesdeCobertura: servico ? diasEntre(servico, dataControle) : null,
  };

  if (aborto && (!servico || aborto >= servico)) {
    return { ...base, ...comServico, estado: 'abortou', rotulo: 'Abortou', dataDg: dg };
  }

  if (dg && (!servico || dg >= servico)) {
    if (contexto.dg_resultado === 'gestante') {
      // A idade do feto vence a cobertura: na 244, cabra coberta em 01/03 deu
      // DG vazio em 07/05 e DG gestante em 29/05 com 30 dias — emprenhou por
      // volta de 29/04, do bode do piquete, sem lançamento. Pela cobertura o
      // parto seria 29/07 (e "vencido"); pelo feto, fim de setembro.
      const idadeFeto = contexto.dg_dias_gestacao ?? null;
      const pelaFeto = idadeFeto !== null && idadeFeto > 0;
      const concepcao = pelaFeto ? somarDias(dg, -idadeFeto) : servico;
      const diasDeGestacao = concepcao ? diasEntre(concepcao, dataControle) : null;
      return {
        ...base,
        ...comServico,
        estado: 'gestante',
        rotulo: 'Gestante',
        dataDg: dg,
        concepcao,
        origemGestacao: concepcao ? (pelaFeto ? 'feto' : 'cobertura') : null,
        diasDeGestacao,
        partoPrevisto: concepcao ? somarDias(concepcao, GESTACAO_DIAS) : null,
        aSecar: diasDeGestacao !== null && diasDeGestacao >= SECAR_AOS_DIAS_DE_GESTACAO,
        semCoberturaLancada: !servico,
        coberturaDivergente:
          pelaFeto &&
          servico !== null &&
          concepcao !== null &&
          Math.abs(diasEntre(servico, concepcao)) > DIVERGENCIA_COBERTURA_DIAS,
      };
    }
    if (contexto.dg_resultado === 'vazia') {
      return { ...base, ...comServico, estado: 'vazia', rotulo: 'Vazia (DG negativo)', dataDg: dg };
    }
    // 'aguardando': o DG foi feito e não concluiu — continua coberta, sem resposta.
    if (servico) {
      return { ...base, ...comServico, estado: 'coberta', rotulo: 'Coberta, DG inconclusivo', dataDg: dg };
    }
  }

  if (servico) {
    const dias = comServico.diasDesdeCobertura ?? 0;
    if (dias <= COBERTURA_VALIDA_ATE) {
      return {
        ...base,
        ...comServico,
        estado: 'coberta',
        rotulo: 'Coberta, sem DG',
        dgAtrasado: dias > DG_ATRASADO_APOS,
      };
    }
    // Cobertura velha demais sem desfecho: não dá para chamar de coberta.
    return { ...base, ...comServico, estado: 'nao_coberta', rotulo: 'Cobertura antiga, sem desfecho' };
  }

  return { ...base, estado: 'nao_coberta', rotulo: 'Não coberta desde o parto' };
}
