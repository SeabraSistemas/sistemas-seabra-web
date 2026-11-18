/**
 * Campos que o Sérgio preenche na aba Meta (tabela painel_parametro_bovino).
 * Cada campo diz o que é, para que serve e como preencher (o "i"). Campo vazio
 * não vira número inventado: o bloco que depende dele mostra "faltam estes dados".
 */

export type TipoCampo = 'numero' | 'texto' | 'opcao';
export type Escopo = 'fazenda' | 'grupo';

export interface Campo {
  chave: string;
  rotulo: string;
  grupo: GrupoCampo;
  tipo: TipoCampo;
  escopo: Escopo;
  unidade?: string;
  min?: number;
  max?: number;
  opcoes?: { valor: string; rotulo: string }[];
  /** Pergunta do questionário que o campo responde. */
  pergunta?: number;
  info: { oQue: string; ajuda: string; como: string };
}

export type GrupoCampo = 'pasto' | 'reproducao' | 'rebanho' | 'metas' | 'economia';

export const GRUPOS: { id: GrupoCampo; titulo: string }[] = [
  { id: 'pasto', titulo: 'Pasto e área' },
  { id: 'reproducao', titulo: 'Estação de monta e descarte' },
  { id: 'rebanho', titulo: 'Rebanho e venda' },
  { id: 'metas', titulo: 'Metas' },
  { id: 'economia', titulo: 'Custos e preços' },
];

const ha = (chave: string, rotulo: string, oQue: string, pergunta: number): Campo => ({
  chave,
  rotulo,
  grupo: 'pasto',
  tipo: 'numero',
  escopo: 'fazenda',
  unidade: 'ha',
  min: 0,
  max: 500000,
  pergunta,
  info: { oQue, ajuda: 'Entra na conta da capacidade de suporte e da lotação.', como: 'Hectares, sem APP e sem reserva legal. Deixe em branco se não souber.' },
});

const custo = (chave: string, rotulo: string): Campo => ({
  chave: `custo.${chave}`,
  rotulo,
  grupo: 'economia',
  tipo: 'numero',
  escopo: 'grupo',
  unidade: 'R$/ano',
  min: 0,
  max: 1e9,
  pergunta: 53,
  info: { oQue: `Quanto você gasta por ano com ${rotulo.toLowerCase()}, nas duas fazendas.`, ajuda: 'Entra no custo total, na margem e no custo por bezerro.', como: 'Valor do último ano, em reais. Deixe em branco o que não se aplica.' },
});

const meta = (chave: string, rotulo: string, unidade: string, max: number): Campo => ({
  chave: `meta.${chave}`,
  rotulo,
  grupo: 'metas',
  tipo: 'numero',
  escopo: 'grupo',
  unidade,
  min: 0,
  max,
  pergunta: 60,
  info: { oQue: `A sua meta de ${rotulo.toLowerCase()}.`, ajuda: 'Troca a meta sugerida pela literatura. O painel passa a comparar com a sua.', como: 'Deixe em branco para usar a meta sugerida, que aparece marcada como aguardando sua aprovação.' },
});

export const CAMPOS: Campo[] = [
  ha('area_util_ha', 'Área de pasto útil', 'A área que o gado de fato pasteja.', 41),
  ha('area_campo_limpo_ha', 'Campo limpo e baixadas', 'Pasto nativo de campo limpo, borda de baía e vazante.', 43),
  ha('area_caronal_ha', 'Caronal', 'Pasto nativo de capim-carona.', 43),
  ha('area_cerrado_ha', 'Campo cerrado', 'Pasto nativo de campo cerrado.', 43),
  ha('area_cultivada_ha', 'Pasto cultivado', 'Braquiária humidícola ou outro capim plantado.', 43),
  { chave: 'capins', rotulo: 'Capins plantados', grupo: 'pasto', tipo: 'texto', escopo: 'fazenda', pergunta: 43, info: { oQue: 'Os capins do pasto cultivado.', ajuda: 'A capacidade do pasto cultivado depende do capim.', como: 'Ex.: humidícola, brizanta. Se souber, a área de cada um.' } },
  ha('area_alaga_ha', 'Área que alaga na cheia', 'A parte do pasto que fica embaixo d’água na cheia.', 45),
  { chave: 'meses_cheia', rotulo: 'Meses de cheia', grupo: 'pasto', tipo: 'texto', escopo: 'fazenda', pergunta: 44, info: { oQue: 'Quando a área acima fica alagada.', ajuda: 'Define a estação mais apertada do ano.', como: 'Ex.: fevereiro a maio.' } },
  { chave: 'reserva_pasto_pct', rotulo: 'Reserva de pasto', grupo: 'pasto', tipo: 'numero', escopo: 'grupo', unidade: '%', min: 0, max: 80, pergunta: 48, info: { oQue: 'A folga de pasto que você quer guardar contra seca e cheia.', ajuda: 'A lotação limite vira a capacidade menos essa reserva.', como: 'Percentual. Não achei na literatura um valor publicado; a decisão é sua.' } },
  { chave: 'municipio', rotulo: 'Município', grupo: 'pasto', tipo: 'texto', escopo: 'fazenda', info: { oQue: 'Onde fica a fazenda.', ajuda: 'A capacidade de referência só foi medida na Nhecolândia; o painel avisa se a fazenda está em outra região.', como: 'Nome do município.' } },

  { chave: 'estacao_vacas', rotulo: 'Estação de monta das vacas', grupo: 'reproducao', tipo: 'texto', escopo: 'grupo', pergunta: 17, info: { oQue: 'Início e fim da estação das vacas.', ajuda: 'Fixa a janela dos índices de reprodução.', como: 'Ex.: 1/12 a 30/4.' } },
  { chave: 'estacao_novilhas', rotulo: 'Estação de monta das novilhas', grupo: 'reproducao', tipo: 'texto', escopo: 'grupo', pergunta: 17, info: { oQue: 'Início e fim da estação das novilhas, se for diferente.', ajuda: 'Separa a prenhez das novilhas.', como: 'Ex.: 1/11 a 15/12. Em branco = igual à das vacas.' } },
  {
    chave: 'vazia_regra',
    rotulo: 'Vaca vazia',
    grupo: 'reproducao',
    tipo: 'opcao',
    escopo: 'grupo',
    pergunta: 22,
    opcoes: [
      { valor: 'primeira', rotulo: 'Descarta na 1ª vez' },
      { valor: 'segunda', rotulo: 'Descarta na 2ª vez seguida' },
      { valor: 'velha', rotulo: 'Só se também estiver velha' },
      { valor: 'categoria', rotulo: 'Depende da categoria' },
    ],
    info: { oQue: 'O que fazer com a vaca que não emprenha.', ajuda: 'É a decisão que mais mexe na reposição.', como: 'Escolha uma. A Embrapa Pantanal sugere descartar a vazia em dois trabalhos seguidos [R5 p.11–12].' },
  },
  { chave: 'falhas_novilha', rotulo: 'Falhas aceitas: novilha', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', unidade: 'estações', min: 0, max: 5, pergunta: 30, info: { oQue: 'Quantas estações vazia a novilha pode ficar antes do descarte.', ajuda: 'Entra na lista de descarte.', como: 'Número inteiro.' } },
  { chave: 'falhas_primipara', rotulo: 'Falhas aceitas: primípara', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', unidade: 'estações', min: 0, max: 5, pergunta: 30, info: { oQue: 'O mesmo, para a vaca de primeira cria.', ajuda: 'Entra na lista de descarte.', como: 'Número inteiro.' } },
  { chave: 'falhas_vaca', rotulo: 'Falhas aceitas: vaca adulta', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', unidade: 'estações', min: 0, max: 5, pergunta: 30, info: { oQue: 'O mesmo, para a vaca adulta.', ajuda: 'Entra na lista de descarte.', como: 'Número inteiro.' } },
  { chave: 'idade_limite', rotulo: 'Idade-limite da vaca', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', unidade: 'anos', min: 6, max: 20, pergunta: 29, info: { oQue: 'A idade em que a vaca entra no alerta de descarte.', ajuda: 'Conta as vacas do descarte por idade e a reposição.', como: 'Na ligação de 17/11 você disse 12 a 13 anos; uso 12 até você gravar.' } },
  { chave: 'femeas_repasse_pct', rotulo: 'Fêmeas que vão ao repasse', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', unidade: '%', min: 0, max: 100, pergunta: 24, info: { oQue: 'Das fêmeas expostas, quantas ficam para o touro depois da IATF.', ajuda: 'Dimensiona os touros.', como: 'Percentual.' } },
  { chave: 'femeas_por_touro', rotulo: 'Fêmeas por touro no repasse', grupo: 'reproducao', tipo: 'numero', escopo: 'grupo', min: 5, max: 100, pergunta: 24, info: { oQue: 'Quantas fêmeas cada touro cobre no repasse.', ajuda: 'Dimensiona os touros.', como: 'Os painéis de custo do Pantanal usam 1:25 [R2 p.4; R3 p.3].' } },

  { chave: 'meta_matrizes', rotulo: 'Meta de matrizes', grupo: 'rebanho', tipo: 'numero', escopo: 'fazenda', unidade: 'vacas', min: 0, max: 100000, pergunta: 5, info: { oQue: 'Quantas vacas você quer ter na fazenda.', ajuda: 'O rebanho-meta e a reposição partem desse número.', como: 'Em branco, o painel usa as vacas de hoje como referência.' } },
  { chave: 'peso_alvo_macho', rotulo: 'Peso-alvo à desmama, macho', grupo: 'rebanho', tipo: 'numero', escopo: 'grupo', unidade: 'kg', min: 50, max: 400, pergunta: 36, info: { oQue: 'O peso que você quer no bezerro macho na desmama.', ajuda: 'Compara com o peso real.', como: 'A fazenda típica de 2023 do Pantanal desmamou com 180 kg aos 8 meses [R2 p.5].' } },
  { chave: 'peso_alvo_femea', rotulo: 'Peso-alvo à desmama, fêmea', grupo: 'rebanho', tipo: 'numero', escopo: 'grupo', unidade: 'kg', min: 50, max: 400, pergunta: 36, info: { oQue: 'O mesmo, para a bezerra.', ajuda: 'Compara com o peso real.', como: 'Referência: 165 kg aos 8 meses [R2 p.5].' } },
  { chave: 'ordem_venda', rotulo: 'Ordem de venda quando falta pasto', grupo: 'rebanho', tipo: 'texto', escopo: 'grupo', pergunta: 32, info: { oQue: 'Quais categorias saem primeiro se o pasto faltar.', ajuda: 'Entra no alerta de falta de pasto.', como: 'Ex.: vaca vazia, vaca velha, novilha que sobra.' } },

  meta('prenhez', 'Prenhez', '%', 100),
  meta('nascidos', 'Nascidos vivos', '%', 100),
  meta('desmama', 'Desmama', '%', 100),
  meta('mortalidade', 'Mortalidade pré-desmama', '%', 100),
  meta('kg_matriz', 'Kg desmamados por matriz', 'kg', 400),
  meta('kg_ha', 'Kg desmamados por hectare', 'kg/ha', 1000),
  meta('descarte', 'Descarte de vacas', '%', 100),

  { chave: 'preco_bezerro_kg', rotulo: 'Preço do bezerro', grupo: 'economia', tipo: 'numero', escopo: 'grupo', unidade: 'R$/kg', min: 0, max: 100, pergunta: 56, info: { oQue: 'Preço de venda do bezerro desmamado.', ajuda: 'Estima a receita.', como: 'Reais por kg vivo, no último leilão.' } },
  { chave: 'preco_bezerra_kg', rotulo: 'Preço da bezerra', grupo: 'economia', tipo: 'numero', escopo: 'grupo', unidade: 'R$/kg', min: 0, max: 100, pergunta: 56, info: { oQue: 'Preço de venda da bezerra que sobra.', ajuda: 'Estima a receita.', como: 'Reais por kg vivo.' } },
  { chave: 'preco_vaca_kg', rotulo: 'Preço da vaca de descarte', grupo: 'economia', tipo: 'numero', escopo: 'grupo', unidade: 'R$/kg', min: 0, max: 100, pergunta: 56, info: { oQue: 'Preço da vaca vendida ao frigorífico.', ajuda: 'Estima a receita.', como: 'Reais por kg vivo.' } },
  custo('sal', 'Sal e suplementos'),
  custo('sanidade_iatf', 'Sanidade e IATF'),
  custo('pessoal', 'Funcionários'),
  custo('combustivel_energia', 'Combustível e energia'),
  custo('pastagem', 'Pastagem e adubação'),
  custo('cercas_agua', 'Cercas e água'),
  custo('maquinas', 'Máquinas e manutenção'),
  custo('tributos', 'Tributos'),
  custo('arrendamento', 'Arrendamento'),
  custo('administracao', 'Administração'),
  custo('outros', 'Outros custos'),
];

export const CAMPO_POR_CHAVE = new Map(CAMPOS.map((c) => [c.chave, c]));

/** Valida um valor digitado. Devolve o valor normalizado, null para "apagar", ou um erro. */
export function validarValor(campo: Campo, bruto: unknown): { ok: true; valor: number | string | null } | { ok: false; erro: string } {
  if (bruto === null || bruto === undefined || (typeof bruto === 'string' && bruto.trim() === '')) return { ok: true, valor: null };
  if (campo.tipo === 'numero') {
    const t = String(bruto).trim();
    const n = typeof bruto === 'number' ? bruto : Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
    if (!Number.isFinite(n)) return { ok: false, erro: `${campo.rotulo}: número inválido` };
    if (campo.min != null && n < campo.min) return { ok: false, erro: `${campo.rotulo}: mínimo ${campo.min}` };
    if (campo.max != null && n > campo.max) return { ok: false, erro: `${campo.rotulo}: máximo ${campo.max}` };
    return { ok: true, valor: n };
  }
  const s = String(bruto).trim();
  if (s.length > 300) return { ok: false, erro: `${campo.rotulo}: texto longo demais` };
  if (campo.tipo === 'opcao' && !campo.opcoes?.some((o) => o.valor === s)) return { ok: false, erro: `${campo.rotulo}: opção inválida` };
  return { ok: true, valor: s };
}
