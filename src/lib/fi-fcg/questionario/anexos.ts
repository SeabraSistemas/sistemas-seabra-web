/** Anexos do questionário. A: preenchido por mim com o que o banco tem (lido em 18/11/2026). B e C: como vieram no questionário. */

export type Situacao = 'Disponível' | 'Parcial' | 'Ausente' | 'Não confiável';

export interface ItemAnexoA {
  dominio: string;
  exigido: string;
  situacao: Situacao;
  encontrei: string;
}

export const ANEXO_A_LIDO_EM = '18/11/2026';

export const ANEXO_A: ItemAnexoA[] = [
  {
    dominio: 'Dados-mestre e histórico animal',
    exigido: 'Identificação individual; data de nascimento ou idade estimada; sexo; raça/grupo; origem; mãe; pai quando disponível; categoria vigente e histórico; fazenda; lote/invernada; datas de entrada/saída; peso e data; morte, venda e motivo de descarte.',
    situacao: 'Parcial',
    encontrei: '8.514 animais nas duas fazendas, 5.886 ativos. Nascimento em 99,6%, sexo em 100%, raça em 94%, origem em 55%, mãe em 55%, pai em 38%. Lote em 45% dos ativos; pasto em nenhum. Peso atual em 80% dos ativos. 2.628 baixas, 96% com a causa. Data de entrada e valor de compra vazios. Para conferir: quase não há fêmeas de 3–4 anos, e cerca de 220 vacas da Campina Grande estão sem toque e sem parto desde 2024.',
  },
  {
    dominio: 'Reprodução',
    exigido: 'Exposição à reprodução; método; lote; data de IATF/cobertura; protocolo; touro/sêmen; diagnóstico e data; resultado; prenhez por estação; parição; aborto; natimorto; vínculo mãe-cria; desmama; identificação de primíparas.',
    situacao: 'Parcial',
    encontrei: '8.759 inseminações (8.747 com a partida do sêmen), 5.926 protocolos, 10.827 toques, 4.685 partos com 4.676 crias ligadas à mãe, 151 abortos. Primípara sai do número de partos. Faltam: estação de monta cadastrada, natimorto (nenhum lançado) e desmama (só 31 animais com data).',
  },
  {
    dominio: 'Terras e forragens',
    exigido: 'Cadastro de fazenda/invernadas; área bruta; APP e exclusões; área útil pastejável; capim predominante; períodos de acesso; estimativa/aferição de matéria seca; condição de pasto; água; suplementação; histórico de carga animal.',
    situacao: 'Ausente',
    encontrei: 'Nenhuma área, pasto, piquete, chuva ou medida de forragem. Sal mineral cadastrado, sem consumo. Esses dados viram campos que você preenche no painel.',
  },
  {
    dominio: 'Movimentação e contagem',
    exigido: 'Foto do estoque por data; histórico de entradas/saídas; transferências entre lotes/fazendas; movimentos de categorias; prevenção de dupla contagem; critério de UA por categoria/peso e período.',
    situacao: 'Parcial',
    encontrei: '260 mudanças de lote com data. Nenhuma transferência entre as fazendas. A foto do estoque foi guardada uma vez só por fazenda: o estoque de datas passadas é reconstruído pelos lançamentos. A cria conta uma vez só. A UA sai do peso da última pesagem de cada animal.',
  },
  {
    dominio: 'Custos e receitas',
    exigido: 'Plano de contas; competência e pagamento; receitas por lote/categoria; preço/kg/cabeça; custos diretos e indiretos; rateio documentado; sal/suplementação; equipe; manutenção; pastagem; reprodução; tributos; investimentos e depreciação separados.',
    situacao: 'Parcial',
    encontrei: '477 lançamentos, todos de venda e perda de animal. Só 90 das 2.529 baixas têm valor. Nenhum custo de operação no sistema: os custos estão na aba de custos da planilha. O rateio por UA já existe.',
  },
  {
    dominio: 'Regras e qualidade',
    exigido: 'Dicionário de dados; regras de classificação; períodos de safra e estação; unidades; histórico de alterações; qualidade e completude; reconciliação estoque inicial + entradas − saídas = estoque final; rastreabilidade das fórmulas.',
    situacao: 'Parcial',
    encontrei: 'Categorias por idade e sexo, com as regras escritas. Cada lançamento guarda quem gravou e quando, e o que é apagado vai para um arquivo. Falta a conferência estoque inicial + entradas − saídas = estoque final, por data.',
  },
  {
    dominio: 'Governança e tecnologia',
    exigido: 'Origem e acesso ao banco; rotina de sincronização; backup; permissões; registro de mudanças; controle de versões de metas e fórmulas; exportação; privacidade; testes automatizados e aceitação pelo proprietário.',
    situacao: 'Parcial',
    encontrei: 'A planilha do AppSheet é a fonte e não é alterada. O sistema recebe uma cópia quando é pedido, com o ponto de partida guardado e os conflitos registrados. Acesso por dono e por colaborador. Faltam a cópia diária automática e a versão das metas.',
  },
];

export const ANEXO_B: { indicador: string; definicao: string }[] = [
  { indicador: 'Taxa de prenhez', definicao: 'Nº de fêmeas prenhes / nº de fêmeas expostas, conforme janela e categoria aprovadas.' },
  { indicador: 'Taxa de nascimento', definicao: 'Nascimentos (definir vivos ou totais) / base de matrizes aprovada; discriminar perdas gestacionais.' },
  { indicador: 'Taxa de desmama', definicao: 'Bezerros desmamados / matrizes expostas, por safra; definir tratamento de matrizes transferidas.' },
  { indicador: 'Mortalidade pré-desmama', definicao: 'Mortes entre nascidos vivos / nascidos vivos, no período de referência.' },
  { indicador: 'Reposição e descarte', definicao: 'Entradas de novilhas no plantel e saídas de matrizes / denominadores padronizados; apresentar motivos.' },
  { indicador: 'Lotação e suporte', definicao: 'UA média no período / hectares úteis; comparar com suporte sazonal estimado e segurança definida.' },
  { indicador: 'Produtividade', definicao: 'Kg de bezerros efetivamente desmamados / matrizes expostas e / hectares úteis, com período explícito.' },
  { indicador: 'Economia', definicao: 'Receita, custo, margem e caixa reconciliados; resultados por fazenda, ha, matriz e bezerro sem misturar custos de capital.' },
];

export const ANEXO_C: string[] = [
  'O estoque por data e categoria reconcilia com os movimentos documentados, sem dupla contagem de animais.',
  'Toda recomendação identifica dados utilizados, regras, período, unidade e versão das premissas.',
  'Quando falta dado crítico, o sistema sinaliza a limitação e não apresenta estimativas como fatos.',
  'Há separação entre situação observada, meta aprovada, hipótese de simulação e recomendação.',
  'As taxas reprodutivas são reprodutíveis a partir da base, com denominadores aprovados.',
  'Lotação e suporte são avaliados por área efetiva e por período sazonal; APP não entra como pastagem.',
  'Resultado econômico discrimina custeio, investimento, depreciação e convenções de rateio.',
  'Um usuário autorizado aprova mudanças de parâmetros; alterações ficam registradas.',
  'Exportação dos relatórios essenciais funciona; backup e recuperação são testados.',
  'Um caso real de safra passada é reconstruído e conferido com o responsável técnico e o proprietário.',
];
