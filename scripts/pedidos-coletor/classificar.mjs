/*
 * Classifica o texto de um pedido da AliExpress em três trilhas:
 *
 *   pagamento  ok | pendente | problema | desconhecido
 *   aduana     nao_se_aplica | aguardando | em_andamento | imposto_pendente | concluida | problema | desconhecido
 *   entrega    a_caminho | entregue | problema | cancelado | desconhecido
 *
 * É função pura (texto entra, rótulos saem) para dar para testar sem abrir
 * navegador — o texto da AliExpress muda, e é aqui que se ajusta.
 *
 * `eventos` vem do MAIS ANTIGO para o mais novo; `statusTexto` é tratado como o
 * mais novo de todos. Em cada trilha o último evento que casa vence: "retida na
 * alfândega" seguida de "liberada" termina em `concluida`, não em `problema`.
 */

const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/* Cada regra: [valor, regex]. Regex roda sobre o texto SEM acento e em minúsculas. */

const PAGAMENTO = [
  ['problema', /(falha|erro|problema|recus\w+|negad\w+|nao (foi )?(aprovad|conclu)\w+|expirou|declin\w+)[^.\n]{0,40}pagamento|pagamento[^.\n]{0,40}(falh\w+|recus\w+|negad\w+|nao (foi )?(aprovad|conclu)\w+|expirou|declin\w+|problema)|payment[^.\n]{0,30}(fail\w*|declin\w*|refus\w*|problem|error)|(fail\w*|declin\w*|problem|error)[^.\n]{0,30}payment|pago no pago/],
  ['pendente', /esperando (o )?pagamento|a ser pago|aguardando (o )?pagamento|pagamento pendente|finalizar (o )?pagamento|awaiting payment|payment pending|pending payment|esperando pago|pendiente de pago/],
  ['ok', /^(processando|processing)$|pagamento (confirmado|aprovado|efetuado|recebido|concluido|realizado)|pedido pago|payment (confirmed|approved|received|successful|complete)|order paid|pago confirmado|pago aprobado/],
];

const ADUANA = [
  ['problema', /(retid\w+|retencao|retido|bloquead\w+|apreendid\w+|devolvid\w+|recusad\w+|irregular\w*|pendencia|problema)[^.\n]{0,50}(alfandeg\w+|aduan\w+|fiscaliza\w+|receita federal|customs)|(alfandeg\w+|aduan\w+|customs|receita federal)[^.\n]{0,50}(retid\w+|retencao|retido|bloquead\w+|apreendid\w+|recusad\w+|irregular\w*|pendencia|problema|held|delay\w*|seized)|customs (hold|held|delay|issue|problem)|held (by|at|in) customs|fiscalizacao/],
  ['imposto_pendente', /(imposto|tributo|taxa|icms)[^.\n]{0,40}(pendente|aguardando|a pagar|nao pago|em aberto)|(aguardando|pendente|falta|pagar)[^.\n]{0,30}(imposto|tributo|icms|taxa alfandegaria|taxa aduaneira)|(duty|tax(es)?)[^.\n]{0,30}(due|unpaid|pending)/],
  ['concluida', /(desembaraco|liberacao|liberad\w+|despacho|dispensad\w+)[^.\n]{0,40}(aduan\w+|alfandeg\w+|customs|importacao)[^.\n]{0,40}(conclu\w+|finaliz\w+|liberad\w+|aprovad\w+|ok|realizad\w+)|(aduan\w+|alfandeg\w+)[^.\n]{0,40}(conclu\w+|finaliz\w+|liberad\w+|aprovad\w+|realizad\w+)|(desembaraco|liberacao) (conclu\w+|finaliz\w+)|desembaracad\w+|customs (clearance )?(complete\w*|cleared|released|finished)|cleared customs|(clearance|import) (complete\w*|finished)|despacho de importacao (conclu|finaliz)|objeto (liberado|entregue) (pela|na|a) (fiscalizacao|aduana|alfandega)/],
  ['em_andamento', /(em|aguardando|sob|inicio de|processo de|chegou (a|na|ao))[^.\n]{0,25}(desembaraco|alfandeg\w+|aduan\w+|fiscalizacao|customs)|(desembaraco|alfandeg\w+|aduan\w+|customs)[^.\n]{0,30}(em andamento|em curso|iniciad\w+|em processo|processing|in progress)|customs (clearance )?(in progress|processing|started)|arrived at (destination )?customs|importacao (iniciada|em andamento)|despacho (aduaneiro )?em andamento/],
];

const ENTREGA = [
  ['cancelado', /^(cancelad\w*|closed|cancell?ed)$|pedido cancelad\w+|order (was )?cancel\w+|cancelad\w+ (pelo|por) (vendedor|comprador|sistema)|transacao (fechada|encerrada)|pedido fechado|order closed|reembolso (concluido|aprovado|efetuado)|refund (complete\w*|approved|issued)/],
  ['problema', /(falha|tentativa (de entrega )?(malsucedida|fracassada)|nao foi possivel entregar|endereco (incorreto|invalido|nao localizado|insuficiente)|destinatario ausente|extraviad\w+|extravio|perdid\w+|danificad\w+|avariad\w+|devolvid\w+ ao (remetente|vendedor)|retornand\w+ ao remetente|entrega (falhou|atrasada|nao realizada)|delivery (failed|attempt failed|exception)|undeliverable|returned to sender|lost in transit|address (issue|problem|incorrect)|em disputa|disputa (aberta|em andamento)|devolucao solicitada|pacote nao localizado)/],
  ['entregue', /^(concluido|completed)$|\bentregue\b|objeto entregue|entrega (realizada|concluida|efetuada)|pedido (foi )?entregue|\bdelivered\b|delivery (complete\w*|successful)|pacote (foi )?entregue|recebido pelo destinatario|retirado (pelo|na) (destinatario|agencia)/],
  ['a_caminho', /(^processando$|awaiting (delivery|shipment)|aguardando (a )?(entrega|envio|postagem)|sendo preparado|em transito|a caminho|enviado|despachado|postado|coletado|saiu para entrega|saiu do|chegou (a|ao|na)|in transit|shipped|out for delivery|dispatched|picked up|departed|arrived|aguardando retirada|pronto para retirada|aguardando envio|preparando|em preparacao|awaiting shipment|processing)/],
];

const ORDEM_ENTREGA = ['entregue', 'problema', 'cancelado', 'a_caminho'];

/** Último evento (do mais novo para o mais velho) que casa com alguma regra da trilha. */
function ultimo(regras, textos, ordem) {
  for (let i = textos.length - 1; i >= 0; i--) {
    const t = textos[i];
    if (!t) continue;
    const casadas = regras.filter(([, re]) => re.test(t)).map(([v]) => v);
    if (!casadas.length) continue;
    if (ordem) return ordem.find((v) => casadas.includes(v)) ?? casadas[0];
    // Dentro do mesmo texto, a ordem da lista é a prioridade (problema > pendente > ok).
    return casadas[0];
  }
  return null;
}

/*
 * "Desembaraço aduaneiro concluído" no rastreio da AliExpress significa que o pacote está liberado
 * no Brasil (confirmado pelo Felipe em 20/10/2026) — pode vir ANTES de o pacote sair da China, porque
 * a liberação é feita por declaração eletrônica. Só uma frase que diga "exportação" explicitamente
 * (aduana do país de partida) fica de fora de "concluída"/"em andamento".
 * "Retido/problema" e "imposto pendente" valem onde estiverem: são ruins em qualquer lado.
 */
const E_EXPORTACAO = /exportacao|\bexport\b|exportation/;

/** Último evento de aduana do Brasil (ou problema/imposto), do mais antigo ao mais novo. */
function aduanaDoBrasil(textos) {
  let aduana = null;
  for (const t of textos) {
    if (!t) continue;
    const v = ADUANA.find(([, re]) => re.test(t))?.[0];
    if (!v) continue;
    if ((v === 'concluida' || v === 'em_andamento') && E_EXPORTACAO.test(t)) continue;
    aduana = v;
  }
  return aduana;
}

/**
 * @param {{ statusTexto?: string, eventos?: Array<{ texto: string }> }} pedido
 * @returns {{ pagamento: string, aduana: string, entrega: string, alertas: Array<{ tipo: string, texto: string }> }}
 */
export function classificar({ statusTexto = '', eventos = [] }) {
  const textos = [...eventos.map((e) => norm(e.texto)), norm(statusTexto)];

  const pagamento = ultimo(PAGAMENTO, textos) ?? 'desconhecido';
  let aduana = aduanaDoBrasil(textos) ?? 'desconhecido';
  let entrega = ultimo(ENTREGA, textos, ORDEM_ENTREGA) ?? 'desconhecido';

  // Pedido entregue já passou pela aduana e pelo pagamento, mesmo que o texto não diga.
  if (aduana === 'desconhecido' && entrega === 'entregue') aduana = 'concluida';
  // A caminho, com rastreio lido, mas sem nenhum evento de aduana ainda: está esperando ser liberado.
  if (aduana === 'desconhecido' && entrega === 'a_caminho' && eventos.length > 0) aduana = 'aguardando';
  const pagamentoFinal = pagamento === 'desconhecido' && ['entregue', 'a_caminho'].includes(entrega) ? 'ok' : pagamento;
  if (entrega === 'a_caminho' && pagamentoFinal === 'pendente') entrega = 'desconhecido';

  const alertas = [];
  const porTrilha = (trilha, valor, rotulo) => {
    const todas = [...eventos.map((e) => e.texto), statusTexto];
    const regras = trilha === 'pagamento' ? PAGAMENTO : trilha === 'aduana' ? ADUANA : ENTREGA;
    const re = regras.find(([v]) => v === valor)?.[1];
    const achado = [...todas].reverse().find((t) => t && re?.test(norm(t)));
    alertas.push({ tipo: trilha, texto: achado?.trim() || rotulo });
  };
  if (pagamentoFinal === 'problema') porTrilha('pagamento', 'problema', 'Problema com o pagamento');
  if (aduana === 'problema') porTrilha('aduana', 'problema', 'Problema na aduana');
  if (aduana === 'imposto_pendente') porTrilha('aduana', 'imposto_pendente', 'Imposto de importação pendente');
  if (entrega === 'problema') porTrilha('entrega', 'problema', 'Problema na entrega');

  return { pagamento: pagamentoFinal, aduana, entrega, alertas };
}

/** O que o selo de cada trilha diz, em português — usado também na descrição das mudanças. */
export const ROTULOS = {
  pagamento: { ok: 'Pagamento aprovado', pendente: 'Aguardando pagamento', problema: 'Problema no pagamento', desconhecido: 'Pagamento: sem informação' },
  aduana: {
    nao_se_aplica: 'Sem aduana',
    em_andamento: 'Na aduana',
    imposto_pendente: 'Imposto pendente',
    aguardando: 'Aduana: aguardando',
    concluida: 'Desembaraço concluído',
    problema: 'Problema na aduana',
    desconhecido: 'Aduana: sem informação',
  },
  entrega: { a_caminho: 'A caminho', entregue: 'Entregue', problema: 'Problema na entrega', cancelado: 'Cancelado', desconhecido: 'Entrega: sem informação' },
};
