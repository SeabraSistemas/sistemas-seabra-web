/**
 * Questionário do Sérgio (Fazenda Inhumas), as 86 perguntas na ordem do
 * original, com o que eu já levantei. Nenhum número sem fonte: o do banco
 * diz a data da leitura; o da literatura diz a referência (ver referencias.ts).
 *
 * Dados do banco lidos só com contagem dentro do banco (count/avg), sem puxar
 * linhas — o teto de 1000 linhas do PostgREST não se aplica.
 */

export type Estado = 'banco' | 'literatura' | 'felipe' | 'sistema' | 'sergio';

export interface Citacao {
  ref: string;
  pagina?: string;
}

export interface Indicacao {
  texto: string;
  fontes: Citacao[];
}

export interface DadoLido {
  texto: string;
  lidoEm: string;
  origem: 'banco' | 'planilha';
}

export interface Pergunta {
  n: number;
  texto: string;
  opcoes?: string;
  estado: Estado;
  /** Para "banco", "literatura" e "felipe": a resposta. */
  resposta?: string;
  /** Números lidos no banco ou na planilha, com a data. */
  dados?: DadoLido[];
  /** O que a literatura indica, para ele confrontar. */
  literatura?: Indicacao[];
  /** Para "sergio": o que falta ele dizer. */
  falta?: string;
}

export interface Secao {
  numero: string;
  titulo: string;
  perguntas: Pergunta[];
}

const D17 = '17/11/2026';
const D18 = '18/11/2026';

const b = (texto: string, lidoEm = D18): DadoLido => ({ texto, lidoEm, origem: 'banco' });
const pl = (texto: string, lidoEm = D17): DadoLido => ({ texto, lidoEm, origem: 'planilha' });
const r = (ref: string, pagina?: string): Citacao => ({ ref, pagina });

export const SECOES: Secao[] = [
  {
    numero: '01',
    titulo: 'Objetivo do projeto e limites do sistema',
    perguntas: [
      {
        n: 1,
        texto: 'O sistema será implantado inicialmente em qual operação?',
        opcoes: 'Apenas Fazenda Inhumas · Inhumas e Campina · Outra',
        estado: 'sergio',
        falta: 'Escolher a operação.',
        dados: [
          b('As duas fazendas já estão no banco. Fêmeas jovens (bezerra, 1–2 anos e novilha) por vaca: 0,34 na Inhumas, 1,50 na Campina Grande e 0,89 nas duas juntas. As novilhas que faltam numa sobram na outra.', D17),
        ],
      },
      {
        n: 2,
        texto: 'Qual produto gera a receita principal da cria?',
        opcoes: 'Bezerro macho à desmama · Machos e fêmeas à desmama · Outra combinação',
        estado: 'banco',
        resposta: 'Bezerro desmamado vendido em leilão, e vaca de descarte vendida ao frigorífico. Confirme se as bezerras que sobram também vão para o leilão.',
        dados: [
          pl('2025: 1.072 cabeças em leilão, com 233 kg de média, e 446 ao frigorífico, com 486–504 kg. 2026: 501 em leilão (227–258 kg) e 325 ao frigorífico (542–558 kg).'),
        ],
      },
      {
        n: 3,
        texto: 'Além da cria, há categorias mantidas para recria ou engorda comercial? Quais?',
        estado: 'banco',
        resposta: 'Não encontrei engorda: os machos saem na desmama. No banco, parte dos desmamados vendidos aparece como "Garrote" ou "Boi" porque a categoria muda pela idade, mas pelo peso de venda são desmamados. Confirme.',
        dados: [
          b('Machos depois da desmama: 3,5% do rebanho na Inhumas e 5,4% na Campina Grande.', D17),
          pl('Peso médio dos machos vendidos em leilão: 227–258 kg.'),
        ],
      },
      { n: 4, texto: 'Ordene suas três maiores prioridades (1, 2, 3): lucro líquido, margem por hectare, bezerros desmamados por matriz exposta, kg desmamados por hectare, redução de risco na seca, outra.', estado: 'sergio', falta: 'Ordenar as três prioridades.' },
      { n: 5, texto: 'Você autoriza o modelo a recomendar aumentar OU reduzir o número de matrizes se os dados indicarem ganho econômico?', opcoes: 'Sim · Não · Só após minha aprovação', estado: 'sergio', falta: 'Escolher. O painel nunca muda o rebanho sozinho (pergunta 71).' },
      { n: 6, texto: 'Quais restrições nunca podem ser desrespeitadas nas recomendações? (Ex.: mínimo de matrizes, limite de lotação, caixa, bem-estar, áreas vedadas.)', estado: 'sergio', falta: 'Listar as restrições.' },
      { n: 7, texto: 'A principal decisão que você quer tomar com o painel é qual?', opcoes: 'Reposição/descarte · Composição de categorias · Lotação/pasto · Rentabilidade · Todas', estado: 'sergio', falta: 'Escolher. Na ligação de 17/11 você pediu reposição, composição das categorias e lotação.' },
      { n: 8, texto: 'Quando considera que o projeto terá dado certo? Cite até três resultados concretos que deseja enxergar.', estado: 'sergio', falta: 'Citar até três resultados.' },
    ],
  },
  {
    numero: '02',
    titulo: 'Cadastro, lotes e estrutura do rebanho',
    perguntas: [
      {
        n: 9,
        texto: 'Quais categorias devem aparecer separadas no painel? Marque todas as necessárias.',
        opcoes: 'Bezerro(a) ao pé · Desmamado(a) · Novilha pré-cobertura · Novilha em reprodução · Primípara · Multípara · Vaca vazia · Vaca prenha · Touro · Outros',
        estado: 'sergio',
        falta: 'Marcar as categorias. O sistema já separa todas da lista: primípara e multípara saem do número de partos de cada vaca; vazia e prenha, do último toque.',
      },
      {
        n: 10,
        texto: 'A localização principal do animal deverá ser informada por:',
        opcoes: 'Fazenda · Invernada/piquete · Lote de manejo · Todos',
        estado: 'sergio',
        falta: 'Escolher. Para usar invernada, os pastos precisam ser cadastrados.',
        dados: [b('Hoje: fazenda e lote. 2.643 dos 5.886 animais ativos (45%) têm lote; nenhum tem pasto ou piquete.')],
      },
      { n: 11, texto: 'Uma vaca pode mudar de lote várias vezes durante o ano? Você quer consultar o histórico dessas movimentações?', opcoes: 'Sim / Sim · Sim / Não · Não · Consultar Felipe', estado: 'felipe', resposta: 'Pode, e o histórico já fica guardado: cada mudança de lote tem data e quem fez.', dados: [b('260 mudanças de lote registradas nas duas fazendas.')] },
      {
        n: 12,
        texto: 'Como prefere que as categorias sejam definidas?',
        opcoes: 'Por idade · Por condição reprodutiva · Por ambas · Regras configuráveis',
        estado: 'sergio',
        falta: 'Escolher. Hoje o sistema define a categoria pela idade e pelo sexo, e a condição reprodutiva vem do último toque e do último parto.',
      },
      { n: 13, texto: 'O bezerro ao pé deve aparecer individualmente no inventário e também vinculado à mãe, sem dupla contagem no total de cabeças?', opcoes: 'Sim · Não · Já existe no banco — confirmar com Felipe', estado: 'felipe', resposta: 'Já existe: cada cria fica ligada à mãe no parto e conta uma vez só no total.', dados: [b('4.676 crias ligadas a 4.685 partos.')] },
      { n: 14, texto: 'Animais vendidos, mortos e descartados devem permanecer no histórico para análise de resultados?', opcoes: 'Sim · Não', estado: 'felipe', resposta: 'Sim, e já é assim: o animal baixado continua no histórico, com a causa e a data.', dados: [b('2.628 animais baixados no histórico; 96% com a causa (venda, morte ou matula).')] },
      {
        n: 15,
        texto: 'Existem entradas e saídas de animais entre fazendas que precisam ser rastreadas? Como devem ser tratadas nos relatórios?',
        estado: 'banco',
        resposta: 'O banco não tem nenhuma transferência entre a Inhumas e a Campina Grande. Se você leva animais de uma para a outra, isso não está sendo lançado: me diga quanto e como quer ver nos relatórios.',
        dados: [b('0 transferências registradas entre as duas fazendas.')],
      },
    ],
  },
  {
    numero: '03',
    titulo: 'Estação de monta e indicadores reprodutivos',
    perguntas: [
      {
        n: 16,
        texto: 'Quais métodos reprodutivos são usados?',
        opcoes: 'IATF · Monta natural · Repasse com touros · Outros',
        estado: 'banco',
        resposta: 'IATF e repasse com touro.',
        dados: [b('8.759 inseminações (8.747 com a partida do sêmen), 5.926 protocolos aplicados e 26 touros ativos (16 na Inhumas e 10 na Campina Grande).', D17)],
      },
      {
        n: 17,
        texto: 'Quais são as datas habituais de início e fim da estação de monta? Mudam por categoria?',
        estado: 'banco',
        resposta: 'IATF de dezembro a abril, toque final em junho e julho, partos de setembro a fevereiro, com pico de novembro a janeiro. A estação não está cadastrada: deduzi as datas das inseminações e dos partos. Confirme e diga se muda para novilha.',
        dados: [b('Estação de janeiro a abril de 2025: 1.806 inseminações na Inhumas e 1.472 na Campina Grande.', D17)],
        literatura: [{ texto: 'Para novilhas, estação de até 45 dias, começando 30 dias antes das vacas; para vacas, 60–90 dias.', fontes: [r('R21', 'p.12, 14–15')] }],
      },
      {
        n: 18,
        texto: 'Como define a elegibilidade de novilhas para primeira cobertura? (Idade mínima, peso, desenvolvimento, condição corporal.)',
        estado: 'sergio',
        falta: 'Dizer a idade e o peso mínimos de entoure. Explicar o lote de novilhas inseminado aos 14–22 meses: foi uma tentativa de antecipar a primeira cria?',
        dados: [
          b('Primeiro parto aos 39 meses na Inhumas e aos 38 na Campina Grande. Novilhas de 2–3 anos pesam 364–369 kg.', D17),
          b('232 novilhas da Campina Grande nascidas em 2024, 131 delas com IATF aos 14–22 meses, tiveram 5% de prenhez no toque de junho de 2026.', D17),
        ],
        literatura: [
          { texto: 'Entoure aos 24–30 meses levou ao primeiro parto aos 37,5 meses no Pantanal.', fontes: [r('R20', 'p.7')] },
          { texto: 'Com tecnologia, primeiro parto aos 36–40 meses.', fontes: [r('R4', 'p.24')] },
        ],
      },
      {
        n: 19,
        texto: 'Como define a entrada das vacas adultas na estação de monta? Há critérios de escore corporal, pós-parto ou sanidade?',
        estado: 'sergio',
        falta: 'Dizer os critérios de entrada.',
        dados: [b('2.181 animais têm escore corporal registrado; não há regra de entrada cadastrada.')],
      },
      { n: 20, texto: 'Quantas inseminações/protocolos e repasses são permitidos antes do diagnóstico final? Isso varia entre novilhas e vacas?', estado: 'sergio', falta: 'Dizer o número de IATF e de repasses, para vaca e para novilha.' },
      {
        n: 21,
        texto: 'Como e quando é feito o diagnóstico de gestação? Quer resultados por IATF, lote, categoria e estação?',
        estado: 'banco',
        resposta: 'Toque depois de cada IATF, entre fevereiro e abril, e toque final em junho e julho. Os resultados por IATF, lote, categoria e estação já saem do banco. Confirme quais quer ver.',
        dados: [b('10.827 toques desde junho de 2024: 1.914 em 2024, 4.780 em 2025 e 4.133 em 2026.')],
      },
      {
        n: 22,
        texto: 'Como o sistema deve tratar uma matriz que não emprenha em uma estação?',
        opcoes: 'Descarte recomendado · Segunda oportunidade · Decisão depende de categoria/idade · A definir',
        estado: 'sergio',
        falta: 'Escolher a regra. É a decisão que mais mexe na reposição.',
        literatura: [
          { texto: 'Embrapa Pantanal: descartar a vaca vazia em dois trabalhos seguidos, com toque negativo.', fontes: [r('R5', 'p.11–12'), r('R6', 'p.22'), r('R16', 'p.2')] },
          { texto: 'Referência nacional: descartar a vaca vazia no toque feito 45–60 dias depois da estação.', fontes: [r('R21', 'p.12')] },
        ],
      },
      {
        n: 23,
        texto: 'Quer acompanhar também abortos, natimortos, perdas até a desmama e intervalos entre partos?',
        opcoes: 'Sim, todos · Apenas alguns · Não',
        estado: 'sergio',
        falta: 'Escolher. E dizer se a morte de bezerro novo e o natimorto são anotados no campo: o banco indica que não.',
        dados: [
          b('151 abortos registrados. Nenhum natimorto. Mortes de bezerro até 300 dias (crias de 2025): 1,4% na Inhumas e 1,8% na Campina Grande. Intervalo entre partos: 12,2 e 12,8 meses (mediana).', D17),
        ],
        literatura: [{ texto: 'Mortalidade do nascimento à desmama de 5–10% no Pantanal com tecnologia, e 7% na fazenda típica de 2023. Os números registrados estão abaixo disso.', fontes: [r('R4', 'p.24'), r('R2', 'p.4')] }],
      },
      {
        n: 24,
        texto: 'Se houver touros, quais regras o modelo deve usar para dimensionar e avaliar reprodutores? (Relação touro:vaca, aptidão, idade, exames.)',
        estado: 'literatura',
        resposta: '1 touro para 25 fêmeas no repasse, com exame andrológico antes da estação, e troca de 12,5% dos touros por ano (vida útil de 8 anos). Confirme ou troque.',
        dados: [b('26 touros para cerca de 3.100 fêmeas expostas (1 para 120): só fecha porque a IATF cobre a maior parte.', D17)],
        literatura: [
          { texto: 'Fêmeas por touro: 1:25 nos painéis de custo do Pantanal; meta de 1:20–1:30.', fontes: [r('R2', 'p.4'), r('R3', 'p.3'), r('R4', 'p.24')] },
          { texto: 'Em 1:40 a prenhez não caiu, com exame andrológico anual.', fontes: [r('R9', 'p.1813–14')] },
          { texto: '15% dos touros descartados no primeiro exame andrológico.', fontes: [r('R5', 'p.12')] },
          { texto: 'Troca de 12,5% dos touros ao ano na fazenda típica de 2023.', fontes: [r('R2', 'p.4')] },
        ],
      },
    ],
  },
  {
    numero: '04',
    titulo: 'Reposição, seleção e descarte de matrizes',
    perguntas: [
      {
        n: 25,
        texto: 'A reposição de fêmeas é predominantemente:',
        opcoes: 'Própria (bezerras nascidas na fazenda) · Comprada · Mista',
        estado: 'banco',
        resposta: 'Própria. Nenhuma fêmea comprada no banco.',
        dados: [b('4.696 animais nascidos nas fazendas e 35 comprados, todos machos.')],
      },
      {
        n: 26,
        texto: 'Você quer uma taxa de reposição fixa ou calculada a cada ano conforme necessidade real?',
        opcoes: 'Fixa · Calculada pelo modelo · Ambas, com comparação',
        estado: 'sergio',
        falta: 'Escolher.',
        literatura: [{ texto: 'Descarte de matrizes de 11% (2009) e 14% (2023) ao ano nos painéis de custo do Pantanal.', fontes: [r('R3', 'p.3'), r('R2', 'p.4')] }],
        dados: [b('Descarte de vacas (venda, morte e matula) em 2025: 13% na Inhumas e 30% na Campina Grande.', D17)],
      },
      { n: 27, texto: 'Em que momento as fêmeas candidatas à reposição devem ser selecionadas?', opcoes: 'Nascimento · Desmama · Sobreano · Pré-cobertura · Mais de uma etapa', estado: 'sergio', falta: 'Escolher o momento.' },
      { n: 28, texto: 'Quais critérios têm prioridade na escolha das novilhas? Ordene os cinco principais.', opcoes: 'Peso · Idade · Genealogia · Histórico da mãe · Desenvolvimento · Fertilidade · Sanidade · Outro', estado: 'sergio', falta: 'Ordenar os cinco critérios.' },
      {
        n: 29,
        texto: 'Qual idade-limite deve gerar ALERTA para avaliação das vacas? A conversa citou 12–13 anos; confirme ou altere. Descarte automático?',
        estado: 'banco',
        resposta: 'O seu rebanho confirma 12 anos: a partir dessa idade a prenhez cai muito. Falta você dizer se o painel só sugere ou se descarta por regra.',
        dados: [
          b('Prenhez na Inhumas: 82–87% das vacas de 4 a 11 anos, contra 65% (2025) e 54% (2026) das de 12 anos ou mais.', D17),
          b('341 vacas com 11 anos ou mais na Inhumas (26% das vacas), 161 delas com 13 ou mais.', D17),
        ],
        literatura: [
          { texto: 'Idade da vaca ao sair: 12,1 a 13,5 anos nos painéis do Pantanal.', fontes: [r('R2', 'p.4'), r('R3', 'p.3'), r('R19', 'p.18')] },
          { texto: 'A Embrapa Pantanal recomenda descarte por idade aos 14–15 anos.', fontes: [r('R16', 'p.2'), r('R5', 'p.12')] },
        ],
      },
      {
        n: 30,
        texto: 'Quantas falhas reprodutivas são aceitáveis antes de recomendar descarte? Distinga novilhas, primíparas e vacas adultas.',
        estado: 'sergio',
        falta: 'Dizer o número de falhas para novilha, primípara e vaca adulta.',
        literatura: [{ texto: 'Embrapa Pantanal: vazia em dois trabalhos seguidos.', fontes: [r('R5', 'p.11–12'), r('R16', 'p.2')] }],
      },
      {
        n: 31,
        texto: 'Quais outros motivos devem produzir recomendação de descarte? (Ex.: abortos repetidos, defeito funcional, bezerro fraco, doença, comportamento.)',
        estado: 'sergio',
        falta: 'Listar os motivos.',
        dados: [b('O banco já tem aborto, peso do bezerro e casos clínicos por animal, que podem virar motivo.')],
        literatura: [
          { texto: 'Defeito de teta e má criadeira.', fontes: [r('R5', 'p.11–12'), r('R6', 'p.22')] },
          { texto: 'Parição no fim da estação, bezerro leve (pouca habilidade materna) e doença reprodutiva.', fontes: [r('R21', 'p.29–30, 41')] },
        ],
      },
      {
        n: 32,
        texto: 'Em caso de falta de pasto, qual deve ser a ordem de prioridade no descarte ou venda das categorias?',
        estado: 'sergio',
        falta: 'Ordenar as categorias.',
        literatura: [{ texto: 'Em cheia longa ou seca extrema: suplementar e vedar; se não der, transferir ou vender animais.', fontes: [r('R25', 'p.27')] }],
      },
      { n: 33, texto: 'Deseja que o sistema recomende quantas bezerras reter para garantir o número futuro de matrizes considerando perdas e descarte? Deverá pedir minha aprovação?', opcoes: 'Sim · Não', estado: 'felipe', resposta: 'Sim: é o centro do painel. O número de bezerras a reter sai da conta de reposição (descarte e mortes de vacas, divididos pela sobrevivência até o primeiro parto), e nada muda no rebanho sem você aprovar.' },
    ],
  },
  {
    numero: '05',
    titulo: 'Nascimento, desmama, vendas e destino dos animais',
    perguntas: [
      {
        n: 34,
        texto: 'Qual é a época normal de nascimentos e de desmama? Há mais de uma safra por ano?',
        estado: 'banco',
        resposta: 'Uma safra por ano: partos de setembro a fevereiro, com pico de novembro a janeiro. A desmama não é lançada; pela pesagem, os bezerros saem com cerca de 8 meses. Confirme o mês da desmama.',
        dados: [b('Só 31 animais com data de desmama no banco.')],
      },
      {
        n: 35,
        texto: 'A desmama é definida por:',
        opcoes: 'Idade · Peso · Calendário · Condição do pasto/mãe · Combinação',
        estado: 'sergio',
        falta: 'Escolher.',
        literatura: [
          { texto: 'Desmama aos 6–8 meses; 8 meses na fazenda típica de 2023.', fontes: [r('R21', 'p.32'), r('R2', 'p.5')] },
          { texto: 'Desmama aos 6–8 meses rende 16% a mais de natalidade no ano seguinte.', fontes: [r('R6', 'p.13')] },
        ],
      },
      {
        n: 36,
        texto: 'Quais metas de peso à desmama deseja acompanhar para machos e fêmeas?',
        opcoes: 'Machos: ___ kg · Fêmeas: ___ kg · Definir tecnicamente',
        estado: 'sergio',
        falta: 'Dizer a meta de peso do macho e da fêmea.',
        dados: [b('Peso real aos ~245 dias: machos 211–229 kg e fêmeas 180–229 kg.', D17)],
        literatura: [
          { texto: '180 kg no macho e 165 kg na fêmea aos 8 meses na fazenda típica de 2023.', fontes: [r('R2', 'p.5')] },
          { texto: 'Nelore de IATF no Pantanal: 184–195 kg ajustado a 300 dias.', fontes: [r('R14', 'p.8')] },
        ],
      },
      {
        n: 37,
        texto: 'Quais animais são vendidos normalmente na desmama e quais permanecem na propriedade?',
        estado: 'banco',
        resposta: 'Os machos e as fêmeas que sobram vão a leilão; as bezerras de reposição ficam. Falta a regra de quantas bezerras ficam.',
        dados: [pl('Vendas em leilão: 1.072 cabeças em 2025 e 501 em 2026, com 227–258 kg.')],
      },
      { n: 38, texto: 'A decisão de venda deve considerar quais critérios?', opcoes: 'Idade · Peso · Sexo · Preço de mercado · Necessidade de caixa · Oferta de pasto · Outros', estado: 'sergio', falta: 'Marcar os critérios.' },
      { n: 39, texto: 'Deseja que o painel projete cabeças, peso total, arrobas (quando pertinente), receita e mês provável de venda?', opcoes: 'Sim · Não', estado: 'sergio', falta: 'Escolher e dizer o detalhe desejado.' },
      { n: 40, texto: 'Como devem ser tratadas receitas e custos de vacas de descarte, touros e outras vendas não relacionadas a bezerros?', estado: 'sergio', falta: 'Dizer como tratar.', literatura: [{ texto: 'Novilhas que sobram e vacas de descarte somam cerca de 50% da receita da cria no Pantanal.', fontes: [r('R16', 'p.2')] }] },
    ],
  },
  {
    numero: '06',
    titulo: 'Área útil, pastagens e restrições sazonais',
    perguntas: [
      { n: 41, texto: 'Confirme a regra de área do sistema: considerar exclusivamente hectares de pasto efetivamente utilizáveis, excluindo APP e áreas não pastejáveis?', opcoes: 'Sim · Não, explicar', estado: 'sergio', falta: 'Confirmar. O painel já foi desenhado assim: área útil, sem APP e sem reserva legal.' },
      {
        n: 42,
        texto: 'O cadastro das áreas será feito por:',
        opcoes: 'Fazenda · Invernada · Piquete · Área homogênea de capim · Combinação',
        estado: 'sergio',
        falta: 'Escolher e informar as áreas.',
        dados: [b('Nenhuma área, pasto ou piquete cadastrado nas duas fazendas.')],
      },
      {
        n: 43,
        texto: 'Quais capins existem além da humidícola? Informe, se souber, as áreas aproximadas de cada um.',
        estado: 'sergio',
        falta: 'Dizer os capins e a área de cada um.',
        literatura: [
          { texto: 'Braquiária humidícola: 0,8 UA/ha no ano, até 1,0 UA/ha nas águas; cerca de 5.000 kg de matéria seca por hectare no ano.', fontes: [r('R29', 'p.141'), r('R33', 'p.5'), r('R34', 'p.21')] },
          { texto: 'Pasto nativo da Nhecolândia: campo limpo com baixadas 3.000 kg MS/ha/ano; caronal 4.500; campo cerrado 2.200.', fontes: [r('R25', 'p.20')] },
        ],
      },
      {
        n: 44,
        texto: 'Em quais meses costuma ocorrer maior crescimento da pastagem e em quais meses há escassez?',
        estado: 'literatura',
        resposta: 'No Pantanal, os dois apertos do ano são de fevereiro a maio (cheia) e de agosto a setembro (fim da seca). Confira se nas suas fazendas é igual.',
        literatura: [
          { texto: 'Apertos de fevereiro a maio e de agosto a setembro.', fontes: [r('R36', 'p.7')] },
          { texto: 'A quantidade de pasto cai no fim da seca e na cheia; a qualidade cai em abril–junho.', fontes: [r('R25', 'p.28')] },
          { texto: 'Proteína da dieta do gado: 8,6–8,9% em abril–junho e 10% ou mais de outubro a março.', fontes: [r('R38', 'p.1663, 1666')] },
        ],
      },
      {
        n: 45,
        texto: 'Existem invernadas que perdem acesso por cheia, alagamento, seca, estradas ou falta de água? Quais?',
        estado: 'sergio',
        falta: 'Dizer quais invernadas e em que meses.',
        literatura: [
          { texto: 'Na Nhecolândia, cerca de 30% da superfície alaga por 3 a 4 meses.', fontes: [r('R41', 'p.104')] },
          { texto: 'Na cheia, a invernada estudada perdeu 27% da capacidade, com as baixadas submersas.', fontes: [r('R25', 'p.20–21')] },
        ],
      },
      { n: 46, texto: 'Quais dados de produção de forragem estão disponíveis hoje?', opcoes: 'Amostragens de matéria seca · Altura de pasto · Avaliação visual · Histórico de lotação · Nenhum · Não sei', estado: 'sergio', falta: 'Marcar.', dados: [b('O banco não tem nenhum dado de forragem nem de chuva das duas fazendas.')] },
      {
        n: 47,
        texto: 'Como quer que a capacidade de suporte seja determinada?',
        opcoes: 'Por produção de matéria seca · Pelo histórico da fazenda · Pela combinação de dados · Definir com técnico',
        estado: 'literatura',
        resposta: 'Pela produção de matéria seca, com o método da Embrapa Pantanal: matéria seca do ano × área × fator de uso, dividido pelo consumo do rebanho (2% do peso vivo). Uso o peso real dos seus animais, porque suas vacas (490–500 kg) são bem mais pesadas que a vaca de 350 kg da referência.',
        literatura: [
          { texto: 'Capacidade = Σ (matéria seca × área × fator de uso) ÷ (consumo diário × 365).', fontes: [r('R25', 'p.16, 20'), r('R28', 'p.10–12')] },
          { texto: 'Consumo de 2% do peso vivo no Pantanal.', fontes: [r('R25', 'p.16'), r('R29', 'p.107')] },
        ],
        dados: [b('Peso médio das vacas na última pesagem: 490 kg na Inhumas e 500 kg na Campina Grande.', D17)],
      },
      {
        n: 48,
        texto: 'Qual margem de segurança deseja reservar contra seca e variações climáticas?',
        opcoes: '___ % de reserva · Calcular tecnicamente · Variável por época',
        estado: 'sergio',
        falta: 'Dizer a reserva. Não achei na literatura um percentual de reserva publicado.',
        literatura: [
          { texto: 'O método já deixa folga: usa só 48–50% do campo limpo e 24% do caronal.', fontes: [r('R25', 'p.20')] },
          { texto: 'Até 10% da fazenda em pasto cultivado como reserva para a cheia.', fontes: [r('R37', 'p.36')] },
        ],
      },
      { n: 49, texto: 'A suplementação (sal mineral, proteinado, ração etc.) deverá entrar no cálculo de custo e de suporte nutricional?', opcoes: 'Sim · Apenas custo · Não', estado: 'sergio', falta: 'Escolher e dizer produtos e doses.', dados: [b('Sal mineral cadastrado como insumo, sem consumo lançado.')] },
      {
        n: 50,
        texto: 'Quais medidas são consideradas quando o pasto falta?',
        opcoes: 'Venda antecipada · Redução de lotação · Suplementação · Transferência de animais · Arrendamento · Outras',
        estado: 'sergio',
        falta: 'Marcar as medidas.',
        literatura: [{ texto: 'Suplementar e vedar; se não der, transferir ou vender animais.', fontes: [r('R25', 'p.27')] }],
      },
      { n: 51, texto: 'Existem limites de água, cochos, manejo ou infraestrutura que impeçam usar toda a capacidade teórica de pasto?', estado: 'sergio', falta: 'Listar os limites.', literatura: [{ texto: 'Observado no Pantanal: o gado usa só cerca de 25% da área da invernada.', fontes: [r('R29', 'p.106')] }] },
    ],
  },
  {
    numero: '07',
    titulo: 'Custos, receitas e resultado econômico',
    perguntas: [
      { n: 52, texto: 'Qual resultado financeiro deve aparecer em destaque?', opcoes: 'Margem bruta · Resultado operacional · Lucro após todos os custos · Fluxo de caixa · Todos, separados', estado: 'sergio', falta: 'Escolher.' },
      { n: 53, texto: 'Quais custos operacionais devem ser incluídos? Marque os que se aplicam.', opcoes: 'Sal/suplementos · Veterinários/IATF · Funcionários · Combustível · Energia · Pastagens/adubação · Cercas/água · Máquinas/manutenção · Tributos · Arrendamento · Administração · Outros', estado: 'sergio', falta: 'Marcar os custos.' },
      {
        n: 54,
        texto: 'Onde os custos estão registrados hoje?',
        opcoes: 'Sistema pecuário · Planilhas · Sistema financeiro · Notas/contabilidade · Vários locais',
        estado: 'banco',
        resposta: 'No sistema só há venda e perda de animal. Os custos de operação estão na aba de custos da sua planilha. Diga se há outro lugar (contabilidade, outro sistema).',
        dados: [b('477 lançamentos financeiros, todos de venda, morte, matula ou aborto. Só 90 das 2.529 baixas têm valor.')],
      },
      { n: 55, texto: 'Os custos devem ser distribuídos entre categorias/lotes por qual critério?', opcoes: 'Por cabeça · Por UA · Por dias de permanência · Por consumo real · Critério técnico por tipo de custo', estado: 'sergio', falta: 'Escolher. Hoje o sistema rateia por UA.' },
      { n: 56, texto: 'Como deseja atualizar preços de venda e compra de animais?', opcoes: 'Manual · Valor médio histórico · Fonte externa verificável · Combinação', estado: 'sergio', falta: 'Escolher.' },
      { n: 57, texto: 'O cálculo econômico deve incluir depreciação, investimento, custo do capital e valor da terra, distinguindo-os dos desembolsos?', opcoes: 'Sim, em demonstrativo separado · Não · Definir posteriormente', estado: 'sergio', falta: 'Escolher.' },
      { n: 58, texto: 'Quais indicadores econômicos quer ver obrigatoriamente?', opcoes: 'R$/ha/ano · R$/matriz exposta · R$/bezerro desmamado · R$/kg produzido · Margem total · Outros', estado: 'sergio', falta: 'Marcar.' },
    ],
  },
  {
    numero: '08',
    titulo: 'Metas, indicadores e sinais de alerta',
    perguntas: [
      { n: 59, texto: 'Quais CINCO indicadores devem aparecer no topo do painel?', opcoes: 'Prenhez · Parida/nascidos vivos · Desmama · Mortalidade · Kg desmamados/matriz · Kg desmamados/ha · Taxa de reposição · Lotação UA/ha · Custo/bezerro · Resultado/ha · Outros', estado: 'sergio', falta: 'Escolher cinco.' },
      {
        n: 60,
        texto: 'As metas serão:',
        opcoes: 'Definidas por mim · Sugeridas pela literatura e depois aprovadas · Calculadas pelo histórico · Combinação',
        estado: 'sergio',
        falta: 'Escolher. Se escolher a literatura, os valores de referência estão abaixo.',
        literatura: [
          { texto: 'Pantanal melhorado: natalidade 65–70%, desmama 60–68%, mortalidade até a desmama 5–10%, primeiro parto aos 36–40 meses, 1:20–30 fêmeas por touro, vida útil da vaca de 12 anos.', fontes: [r('R39', 'p.12'), r('R45')] },
          { texto: 'Prenhez de 91–97% ao fim de uma estação de 120 dias com IATF e repasse, em experimento.', fontes: [r('R13', 'p.13')] },
        ],
      },
      { n: 61, texto: 'Como prefere comparar os indicadores?', opcoes: 'Estação atual × anterior · Média dos últimos 3 anos · Meta definida · Por categoria/lote/invernada · Todos', estado: 'sergio', falta: 'Escolher.', dados: [b('O banco tem toques de 2024, 2025 e 2026: a média de 3 anos já é possível.')] },
      { n: 62, texto: 'Quais situações exigem um alerta de prioridade alta?', opcoes: 'Falha de prenhez · Excesso de lotação · Risco de falta de pasto · Falta de novilhas · Descarte represado · Alta mortalidade · Custo acima da meta', estado: 'sergio', falta: 'Escolher ou descrever.' },
      { n: 63, texto: 'Quando um indicador ficar fora da meta, o sistema deve:', opcoes: 'Só exibir · Explicar possíveis causas · Sugerir ações · Calcular impacto e exigir aprovação', estado: 'sergio', falta: 'Escolher.' },
      { n: 64, texto: 'Com qual frequência deseja receber atualização e alertas?', opcoes: 'Diário · Semanal · Mensal · Após manejo/evento · Quando ultrapassar limite', estado: 'sergio', falta: 'Escolher. Hoje o sistema recebe a sua planilha quando é pedido; para atualizar todo dia, eu ligo a cópia diária.' },
      { n: 65, texto: 'É importante indicar "dados insuficientes/desatualizados" em vez de emitir conclusões sem base?', opcoes: 'Sim, obrigatório · Não', estado: 'felipe', resposta: 'Sim, e o painel já foi desenhado assim: resultado feito com valor de referência aparece como estimado, com o nome do dado que falta.' },
    ],
  },
  {
    numero: '09',
    titulo: 'Simulações e decisões recomendadas',
    perguntas: [
      { n: 66, texto: 'Para quantos anos no futuro deseja projetar o rebanho?', opcoes: '1 ano · 3 anos · 5 anos · Outro', estado: 'sergio', falta: 'Escolher.' },
      { n: 67, texto: 'Quais cenários deseja comparar?', opcoes: 'Normal · Seca severa · Melhora da prenhez · Queda de preço do bezerro · Redução de área · Aumento de lotação · Outros', estado: 'sergio', falta: 'Marcar.' },
      { n: 68, texto: 'Quais variáveis devem poder ser alteradas em uma simulação?', opcoes: 'Nº de matrizes · Prenhez · Mortalidade · Reposição · Descarte · Área útil · Matéria seca · Suplementação · Preços · Custos', estado: 'sergio', falta: 'Marcar.' },
      { n: 69, texto: 'Deseja que o modelo recomende o melhor tamanho do rebanho conforme o objetivo econômico e a capacidade de suporte, em vez de apenas calcular o tamanho máximo?', opcoes: 'Sim · Não', estado: 'sergio', falta: 'Escolher e dizer as restrições.' },
      { n: 70, texto: 'Toda simulação precisa apresentar premissas, unidade, período, fonte do dado e grau de incerteza?', opcoes: 'Sim · Não', estado: 'felipe', resposta: 'Sim, e já está no desenho: cada número do painel leva a fonte, a unidade e o período, e o que é estimado aparece marcado.' },
      { n: 71, texto: 'O sistema poderá executar alguma alteração real (venda, descarte, mudança de lote) sem confirmação humana?', opcoes: 'Nunca · Só tarefas pré-autorizadas', estado: 'felipe', resposta: 'Nunca. O painel só lê o rebanho; não grava nada nos animais.' },
    ],
  },
  {
    numero: '10',
    titulo: 'Interface, relatórios e rotina de uso',
    perguntas: [
      { n: 72, texto: 'Quem utilizará o sistema e com qual nível de permissão?', opcoes: 'Proprietário · Gerente · Veterinário/zootecnista · Escritório · Peões · Programador', estado: 'sergio', falta: 'Marcar e dizer o nível de cada um.' },
      { n: 73, texto: 'Onde o painel será consultado? Necessita funcionar sem internet?', opcoes: 'Celular · Computador · Tablet · Sem internet: Sim / Não', estado: 'felipe', resposta: 'No celular e no computador, por este site. Precisa de internet. O lançamento de campo sem internet continua no aplicativo.' },
      { n: 74, texto: 'Prefere visualização por:', opcoes: 'Visão geral da fazenda · Invernada · Categoria · Animal individual · Comparativo entre safras · Todas', estado: 'sergio', falta: 'Escolher.' },
      { n: 75, texto: 'Quais relatórios deseja gerar para reuniões e decisões?', opcoes: 'Resumo executivo · Rebanho por categoria · Reprodução · Reposição/descarte · Pasto/lotação · Econômico · Projeções', estado: 'sergio', falta: 'Marcar.' },
      { n: 76, texto: 'Quais formatos de exportação são indispensáveis?', opcoes: 'PDF · Excel · CSV · Impressão · Compartilhamento por link', estado: 'sergio', falta: 'Marcar.' },
      { n: 77, texto: 'As metas e regras de cálculo deverão ficar bloqueadas, com alteração apenas por usuário autorizado e registro de quem mudou?', opcoes: 'Sim · Não', estado: 'felipe', resposta: 'Sim, e já está no desenho: as fórmulas ficam travadas, e cada dado que você grava fica com a data e com quem gravou, sem apagar a versão anterior.' },
      { n: 78, texto: 'Qual será a periodicidade normal de revisão das metas e das premissas?', opcoes: 'Mensal · Trimestral · Por estação de monta · Anual · Quando necessário', estado: 'sergio', falta: 'Escolher.' },
    ],
  },
  {
    numero: '11',
    titulo: 'Fonte de dados, validação e implantação',
    perguntas: [
      { n: 79, texto: 'Qual é o nome do software/banco atualmente usado para registrar os animais?', estado: 'felipe', resposta: 'Você lança no AppSheet, na planilha "Produção - Benoni". O Sistema Seabra recebe uma cópia dessa planilha sem alterá-la; hoje a cópia é feita quando é pedida.' },
      { n: 80, texto: 'Quais registros são confiáveis e completos hoje, segundo sua avaliação?', opcoes: 'Identificação · Nascimento/idade · Categoria · Mãe/filho · Cobertura/IATF · Prenhez · Parto · Peso · Morte · Venda · Custos · Não sei', estado: 'banco', resposta: 'Pelo banco: identificação, nascimento, IATF, toque, parto e peso estão completos; mãe e pai, parciais; desmama, natimorto, morte de bezerro, valor de venda e custos, fracos ou ausentes. Detalhe no Anexo A. A sua avaliação continua valendo.' },
      { n: 81, texto: 'A partir de qual ano os dados históricos podem ser considerados razoavelmente completos?', estado: 'banco', resposta: 'A partir de meados de 2024.', dados: [b('Toques desde junho de 2024, partos desde agosto de 2024, baixas desde setembro de 2024, pesagens desde janeiro de 2025. Inseminações desde janeiro de 2023.')] },
      { n: 82, texto: 'Quem será responsável por corrigir informações ausentes, inconsistentes ou duplicadas?', opcoes: 'Equipe da fazenda · Felipe · Escritório · Responsável técnico · Conforme tipo de erro', estado: 'sergio', falta: 'Escolher. A correção tem de ser feita na planilha: eu não altero nada nela.' },
      { n: 83, texto: 'Quer que o painel indique a data da última atualização dos dados e a origem de cada cálculo?', opcoes: 'Sim, obrigatório · Não', estado: 'felipe', resposta: 'Sim, e já está no desenho: o cabeçalho mostra a data dos dados, e cada cálculo, de onde veio.' },
      { n: 84, texto: 'Qual é sua prioridade de entrega?', opcoes: 'Primeiro inventário/categorias · Primeiro reprodução · Primeiro lotação/pasto · Primeiro economia · Pacote mínimo integrado', estado: 'sergio', falta: 'Escolher.' },
      { n: 85, texto: 'Quais três telas/relatórios precisam funcionar para você considerar a primeira versão utilizável?', estado: 'sergio', falta: 'Citar três.' },
      { n: 86, texto: 'Quem aprovará as regras zootécnicas, financeiras e as mudanças futuras?', opcoes: 'Responsável zootécnico · Financeiro · Aprovação final', estado: 'sergio', falta: 'Dizer os nomes.' },
    ],
  },
];

/**
 * O sistema propõe, o proprietário confirma (correção do Felipe em 18/11/2026):
 * perguntas cuja resposta o sistema ou o desenho do painel já define.
 */
export const RESPOSTAS_DO_SISTEMA: Record<number, string> = {
  1: 'As duas, Inhumas e Campina Grande: o sistema já tem as duas fazendas, e o painel mostra cada uma e as duas juntas.',
  7: 'Reposição e descarte, composição das categorias e lotação: foi o que você pediu na ligação de 17/11.',
  9: 'As categorias do sistema, que o painel já separa: Vaca (2.489 hoje), Novilha (613), Recria (607), Bezerra (1.001), Bezerro (832), Garrote (184), Boi (91), Touro (26) e Leiteira (8). Prenha e vazia saem do último toque; primípara e multípara, do número de partos.',
  10: 'Por fazenda e por lote, que já existem no sistema (45% dos animais ativos têm lote). Pasto e invernada ainda não estão cadastrados: posso cadastrar os pastos se você quiser.',
  12: 'Por idade e sexo, como o sistema já faz. A condição reprodutiva (prenha, vazia, primípara) vem do último toque e dos partos.',
  26: 'Calculada pelo painel e comparada com a real: a reposição necessária sai das saídas de vacas do ano, ao lado da que aconteceu (20,7% das vacas em 2025, nas duas fazendas).',
  39: 'O painel projeta cabeças e desmamados por ano. Peso, arrobas, receita e mês de venda entram quando você preencher os preços.',
  41: 'Sim: área útil, sem APP e sem reserva legal, é a regra do painel.',
  42: 'Por fazenda e por tipo de pasto, no painel. Invernada e piquete posso cadastrar no sistema se você quiser; hoje não há nenhum.',
  55: 'Por UA, como o sistema já rateia os custos.',
  59: 'O painel já mostra no topo os 8 que você marcou na lista: prenhez, nascidos vivos, desmama, mortalidade, kg desmamados por matriz e por hectare, reposição e descarte, e lotação.',
  60: 'Sugeridas pela literatura e aprovadas por você: cada meta aparece com a fonte e a marca "aguardando sua aprovação" até você gravar a sua.',
  61: 'Todos: o painel compara a estação atual, a anterior, a média de 3 anos e a meta.',
  62: 'O painel já alerta: prenhez abaixo da meta, mortalidade acima, descarte represado, falta de novilhas, lotação acima do limite e custo acima da meta (os dois últimos quando houver área e custo).',
  63: 'Exibe o alerta com a conta e o que falta. Nada muda no rebanho sem você.',
  64: 'Diário, assim que a cópia automática da planilha estiver ligada. Hoje a cópia para o sistema é feita quando é pedida.',
  66: '1, 3 e 5 anos: é o horizonte da projeção do painel.',
  67: 'Os 7: como estou, com as metas, melhora da prenhez, seca severa, queda do preço do bezerro, redução de área e aumento de lotação. Os quatro últimos dependem da área e dos preços.',
  72: 'Hoje entram no painel 4 e-mails: o seu, mais dois da fazenda, e o meu. Todos veem e podem gravar os dados do painel. Diga quem mais deve entrar.',
  74: 'As duas fazendas juntas, cada fazenda e cada categoria. O animal individual e a comparação de safras ficam no app.',
  76: 'No app, as listas e os painéis do rebanho exportam para Excel e PDF. Este painel pode ser impresso ou salvo em PDF pelo navegador.',
  78: 'Por estação de monta: depois do toque final, em julho.',
};

export const TODAS: Pergunta[] = SECOES.flatMap((s) => s.perguntas).map((p) =>
  RESPOSTAS_DO_SISTEMA[p.n] ? { ...p, estado: 'sistema' as Estado, resposta: RESPOSTAS_DO_SISTEMA[p.n], falta: undefined } : p,
);

for (const s of SECOES) s.perguntas = s.perguntas.map((p) => TODAS.find((t) => t.n === p.n)!);

/** Pergunta que o proprietário responde ou confirma no próprio painel. */
export function temCampoDeResposta(p: Pergunta): boolean {
  return p.estado === 'sergio' || p.estado === 'sistema';
}

export function contagem(): Record<Estado, number> {
  const c: Record<Estado, number> = { banco: 0, literatura: 0, felipe: 0, sistema: 0, sergio: 0 };
  for (const p of TODAS) c[p.estado] += 1;
  return c;
}

/** Chave da resposta do proprietário em painel_parametro_bovino. */
export function chaveResposta(n: number): string {
  return `questionario.p${String(n).padStart(2, '0')}`;
}
