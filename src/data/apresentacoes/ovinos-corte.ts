import type { Apresentacao, Logo } from '@/components/apresentacao/tipos';

/**
 * Palestra de Geraldo Jonas da Silva (M.Sc.) sobre manejo na ovinocultura de
 * corte, com o Sistema Seabra entrando como ferramenta no fim de cada bloco.
 * Rotas: /ppt_geraldo (projeção) e /ppt_geraldo/apresentador (notas e
 * cronômetro). noindex, fora do [locale], só pt. 1 hora.
 *
 * FOTOS
 * Coloque o arquivo em public/images/apresentacao-ovinos/ com o nome exato do
 * `src`. Enquanto ele não existir, o slide mostra o `briefing` no lugar — não
 * precisa editar nada aqui para a foto aparecer. O número no nome é só para
 * organizar (posição do slide quando a foto foi pedida).
 *
 * SEÇÕES
 * Cada `divisor` abre uma seção: o número (01, 02…), o rótulo dos slides
 * seguintes e a agenda saem daí. Reordenar é mover o bloco inteiro.
 *
 * "NO SISTEMA"
 * Telas com dados fictícios. As que usam recurso que o app publicado ainda não
 * tem estão com `emDesenvolvimento: true` (conferido no seabra-app-main em
 * 24/09/2026, versão publicada 1.20.7).
 */

const PASTA = '/images/apresentacao-ovinos';

const BRIMUS: Logo = {
  src: `${PASTA}/logo-brimus.png`,
  alt: "Brimu's Consultoria Técnica e Projetos",
  largura: 242,
  altura: 114,
};

const SEABRA: Logo = {
  src: `${PASTA}/logo-seabra-gerenciamento.png`,
  alt: 'Seabra — Sistemas de Gerenciamento',
  largura: 1400,
  altura: 321,
};

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const ovinosCorte: Apresentacao = {
  titulo: 'Produção contínua e tecnificada de ovinos de corte',
  slides: [
    /* ── Abertura ─────────────────────────────────────────────────────── */
    {
      id: 'capa',
      tipo: 'capa',
      titulo: 'Produção contínua e tecnificada de ovinos de corte',
      apresentador: 'M.Sc. Geraldo Jonas da Silva',
      cargo: 'Médico-veterinário',
      logo: BRIMUS,
      foto: {
        src: `${PASTA}/01-capa.jpg`,
        alt: 'Rebanho de ovinos de corte em pasto ao fim da tarde',
        briefing:
          'Rebanho de ovinos de corte (Dorper ou Santa Inês) em pasto, luz baixa de fim de tarde. Horizontal, sem gente em primeiro plano.',
      },
      notas:
        'Agradecer o convite e a presença.\n\nEm uma frase: hoje o assunto é como produzir cordeiro o ano inteiro, no padrão que o frigorífico precisa, e quais ferramentas tornam isso gerenciável no dia a dia.',
    },
    {
      id: 'bio',
      tipo: 'bio',
      rotulo: 'Formação',
      nome: 'M.Sc. Geraldo Jonas da Silva',
      itens: [
        { texto: 'Medicina Veterinária', instituicao: 'UFMG' },
        { texto: 'Mestrado em Microbiologia/Micologia', instituicao: 'ICB · UFMG' },
        { texto: 'Inspetor técnico', instituicao: 'ABCC' },
        { texto: 'Inspetor técnico', instituicao: 'ARCO' },
        { texto: 'Exportação e importação de animais' },
        { texto: 'Responsável técnico', instituicao: 'Ovinocultura Cara Preta' },
      ],
      logos: [
        { src: `${PASTA}/02-logo-ufmg.png`, alt: 'UFMG', largura: 250, altura: 79 },
        { src: `${PASTA}/02-logo-arco.png`, alt: 'ARCO — Associação Brasileira de Criadores de Ovinos', largura: 396, altura: 127 },
        { src: `${PASTA}/02-logo-abcc.png`, alt: 'ABCC — Associação Brasileira dos Criadores de Caprinos', largura: 243, altura: 246 },
        { src: `${PASTA}/02-logo-cara-preta.png`, alt: 'Ovinocultura Cara Preta', largura: 275, altura: 271 },
        BRIMUS,
      ],
      foto: {
        src: `${PASTA}/02-geraldo.jpg`,
        alt: 'Geraldo Jonas da Silva',
        briefing:
          'Retrato de Geraldo no curral ou no campo, meio corpo, olhando para a câmera. Vertical funciona.',
        posicao: '50% 25%',
      },
      notas:
        'Trajetória em 30 segundos: formação na UFMG, inspeção técnica na ABCC e na ARCO, exportação e importação de animais, e a responsabilidade técnica na Ovinocultura Cara Preta.\n\nPonte para o assunto: o que vou mostrar vem dessa vivência de campo.',
    },
    {
      id: 'agenda',
      tipo: 'agenda',
      titulo: 'O que vamos ver',
      notas:
        'Sete blocos, do mercado à plataforma. Em cada um, primeiro o manejo; no fim, como o sistema ajuda a executar.',
    },

    /* ── 01 · Mercado ─────────────────────────────────────────────────── */
    {
      id: 'div-mercado',
      tipo: 'divisor',
      titulo: 'O mercado e o gargalo',
      subtitulo: 'O que o frigorífico precisa, e por que falta cordeiro em parte do ano.',
      notas:
        'Começar pelo cliente final: o frigorífico. Tudo o que vem depois (reprodução, lotes, identificação) existe para atender essa regra.',
    },
    {
      id: 'oferta-365-dias',
      tipo: 'foto-cheia',
      titulo: '365 dias por ano',
      legenda: 'O frigorífico compra regularidade: o mesmo padrão de carcaça, todo mês.',
      foto: {
        src: `${PASTA}/05-frigorifico.jpg`,
        alt: 'Carcaças de cordeiro padronizadas na câmara fria do frigorífico',
        briefing:
          'Carcaças de cordeiro padronizadas na câmara fria do frigorífico, ou lote uniforme de cordeiros terminados no confinamento.',
      },
      notas:
        'O frigorífico não compra cordeiro, compra regularidade: escala de abate cheia toda semana e carcaça no mesmo padrão.\n\nQuem entrega isso negocia melhor. A pergunta que guia a palestra: como sair da safra concentrada para a oferta contínua?',
    },
    {
      id: 'picos-e-vazios',
      tipo: 'grafico',
      titulo: 'Safra e entressafra',
      lead: 'O mesmo total de cordeiros no ano, entregue de dois jeitos.',
      unidade: 'cordeiros/mês',
      rotulos: MESES,
      paineis: [
        { titulo: 'Hoje: monta livre', valores: [980, 910, 700, 420, 210, 120, 90, 160, 380, 620, 820, 990] },
        {
          titulo: 'Com calendário escalonado',
          valores: [535, 530, 535, 535, 530, 535, 530, 535, 535, 530, 535, 535],
        },
      ],
      referencia: { valor: 530, rotulo: 'Demanda do frigorífico' },
      ilustrativo: true,
      notas:
        'Os dois gráficos somam o mesmo número de cordeiros no ano. À esquerda, a monta livre concentra os nascimentos: sobra cordeiro no verão e falta no inverno. Frigorífico ocioso, preço oscilando.\n\nÀ direita, o mesmo rebanho com cobertura escalonada: oferta colada na demanda o ano inteiro. Números ilustrativos.',
    },
    {
      id: 'governanca',
      tipo: 'fluxo',
      titulo: 'Quem define o calendário',
      lead: 'A reprodução deixa de seguir cada propriedade e passa a seguir a demanda.',
      passos: [
        { titulo: 'Demanda do frigorífico', detalhe: 'kg de carcaça por mês', icone: 'frigorifico' },
        { titulo: 'Meta do grupo', detalhe: 'cordeiros por mês', icone: 'grupo' },
        { titulo: 'Calendário por propriedade', detalhe: 'quantas matrizes cobrir, e quando', icone: 'calendario' },
        { titulo: 'Entrega contínua', detalhe: 'o mesmo padrão, todo mês', icone: 'caminhao' },
      ],
      notas:
        'A virada de chave: o calendário reprodutivo deixa de ser decisão isolada de cada propriedade e passa a ser planejado a partir da demanda.\n\nO frigorífico diz quantos quilos precisa por mês; o grupo transforma isso em meta de cordeiros e distribui entre as propriedades.',
    },
    {
      id: 'sistema-planejamento',
      tipo: 'sistema',
      titulo: 'Meta mensal do grupo',
      itens: [
        'Demanda vira meta de cordeiros',
        'Meta dividida entre as propriedades',
        'Cada uma sabe quantas matrizes cobrir',
      ],
      tela: {
        titulo: 'Planejamento · Grupo Oeste',
        blocos: [
          {
            tipo: 'metricas',
            itens: [
              { rotulo: 'Demanda do frigorífico', valor: '8.500 kg', detalhe: 'de carcaça por mês' },
              { rotulo: 'Carcaça média', valor: '16 kg' },
              { rotulo: 'Meta', valor: '530', detalhe: 'cordeiros por mês' },
              { rotulo: 'Propriedades', valor: '6' },
            ],
          },
          {
            tipo: 'tabela',
            colunas: ['Propriedade', 'Matrizes', 'Cobrir em out.', 'Cordeiros previstos'],
            linhas: [
              ['Faz. Boa Vista', '620', '58', '70'],
              ['Sítio São José', '410', '38', '46'],
              ['Faz. Santa Luzia', '880', '82', '98'],
              ['Faz. Três Irmãos', '350', '33', '40'],
            ],
          },
          {
            tipo: 'alertas',
            itens: [
              { nivel: 'info', texto: 'Faz. Três Irmãos: cobrir 33 matrizes até 15/10 para o abate de ago/27' },
            ],
          },
        ],
      },
      ilustrativo: true,
      emDesenvolvimento: true,
      notas:
        'Aqui o sistema faz a conta: demanda em quilos, carcaça média, meta de cordeiros e quantas matrizes cada propriedade precisa cobrir no mês.\n\nEste planejamento em grupo está em desenvolvimento no sistema.',
    },

    /* ── 02 · Fisiologia ──────────────────────────────────────────────── */
    {
      id: 'div-fisiologia',
      tipo: 'divisor',
      titulo: 'Fisiologia e estacionalidade',
      subtitulo: 'Por que a ovelha não cicla o ano inteiro, e como mudar isso.',
      notas:
        'Antes da tecnologia, a biologia: o que controla o cio da ovelha e o que dá para fazer para mudar o calendário natural.',
    },
    {
      id: 'ciclo-estral',
      tipo: 'ciclo',
      titulo: 'Ciclo estral',
      lead: 'Em média 17 dias. A janela fértil é curta.',
      dias: 17,
      fases: [
        { nome: 'Estro', inicio: 0, fim: 1.5, destaque: true },
        { nome: 'Metaestro', inicio: 1.5, fim: 4 },
        { nome: 'Diestro', inicio: 4, fim: 14 },
        { nome: 'Proestro', inicio: 14, fim: 17 },
      ],
      marcos: [
        { dia: 1.2, rotulo: 'Ovulação' },
        { dia: 14, rotulo: 'Luteólise (PGF2α)' },
      ],
      itens: [
        'Estro: 24 a 36 horas',
        'Ovulação no fim do estro',
        '3 a 4 ondas foliculares por ciclo',
        'IA: 12 a 18 h após o início do estro',
      ],
      notas:
        'Ciclo de 17 dias em média (14 a 19). Estro curto, de 24 a 36 horas, com ovulação perto do fim. No diestro o corpo lúteo mantém a progesterona alta; por volta do dia 14 a prostaglandina do útero faz a luteólise e o ciclo recomeça.\n\nPor isso o momento da cobertura ou da IA pesa tanto: a janela é curta.',
    },
    {
      id: 'fotoperiodo',
      tipo: 'topicos',
      titulo: 'Fotoperíodo',
      lead: 'Ovelha é reprodutora de dias curtos. Quanto mais longe do Equador, mais forte o efeito.',
      estilo: 'passos',
      itens: [
        { texto: 'Noites mais longas', detalhe: 'outono e inverno' },
        { texto: 'Mais melatonina', detalhe: 'a pineal secreta no escuro' },
        { texto: 'Mais pulsos de GnRH', detalhe: 'hipotálamo' },
        { texto: 'LH e FSH', detalhe: 'hipófise' },
        { texto: 'Estro e ovulação', detalhe: 'ovário' },
      ],
      foto: {
        src: `${PASTA}/11-entardecer.jpg`,
        alt: 'Ovelhas no pasto ao entardecer',
        briefing: 'Lote de ovelhas no pasto ao entardecer, céu alaranjado. Pode ser silhueta.',
      },
      notas:
        'A ovelha é reprodutora de dias curtos. Noites mais longas aumentam o tempo de secreção de melatonina pela pineal, o que aumenta a frequência de pulsos de GnRH e, com isso, LH e FSH.\n\nPerto do Equador a variação de luz é pequena e muitas raças ciclam o ano todo; no Sul a estacionalidade pesa bem mais.',
    },
    {
      id: 'racas',
      tipo: 'colunas',
      titulo: 'Raça muda o calendário',
      colunas: [
        {
          titulo: 'Poliéstricas anuais',
          subtitulo: 'Santa Inês · Morada Nova',
          itens: ['Ciclam o ano todo em baixa latitude'],
          foto: {
            src: `${PASTA}/12-santa-ines.jpg`,
            alt: 'Ovelhas Santa Inês no pasto',
            briefing: 'Ovelhas Santa Inês (ou Morada Nova) no pasto.',
          },
        },
        {
          titulo: 'Estacionais',
          subtitulo: 'Texel · Suffolk · Corriedale',
          itens: ['Estro concentrado nos dias curtos (outono e inverno)'],
          foto: {
            src: `${PASTA}/12-texel.jpg`,
            alt: 'Ovelhas Texel',
            briefing: 'Ovelhas Texel, Suffolk ou Corriedale (raças lanadas).',
          },
        },
        {
          titulo: 'Adaptadas',
          subtitulo: 'Dorper · White Dorper',
          itens: ['Pouca estacionalidade e boa rusticidade'],
          foto: {
            src: `${PASTA}/12-dorper.jpg`,
            alt: 'Ovelhas Dorper com cordeiros',
            briefing: 'Dorper ou White Dorper, de preferência com cordeiros.',
          },
        },
      ],
      notas:
        'Santa Inês e Morada Nova, deslanadas, ciclam o ano inteiro nas nossas latitudes. As lanadas de origem europeia (Texel, Suffolk, Corriedale) concentram o estro no outono e inverno. Dorper e White Dorper têm estacionalidade fraca e boa adaptação.\n\nA escolha da raça já define quanto esforço será preciso para produzir o ano todo.',
    },
    {
      id: 'efeito-macho',
      tipo: 'topicos',
      titulo: 'Efeito macho e flushing',
      estilo: 'lista',
      itens: [
        { texto: 'Carneiros longe por 30 dias', detalhe: 'sem ver, ouvir ou cheirar as ovelhas' },
        { texto: 'Reintrodução de uma vez', detalhe: 'ovulação em 2 a 4 dias' },
        { texto: 'Rufião vasectomizado', detalhe: 'estimula sem cobrir; o fértil já cobre' },
        { texto: 'Flushing', detalhe: 'mais energia 2 a 3 semanas antes e durante a monta' },
      ],
      foto: {
        src: `${PASTA}/13-rufiao.jpg`,
        alt: 'Carneiro rufião com buçal marcador no lote de ovelhas',
        briefing: 'Carneiro com buçal ou tinta marcadora no meio do lote de ovelhas.',
      },
      notas:
        'Carneiros afastados por pelo menos um mês, sem contato visual, sonoro ou de cheiro. Na reintrodução, o estímulo do macho induz ovulação em 2 a 4 dias; a primeira costuma ser silenciosa, e os cios se concentram cerca de 17 a 24 dias depois.\n\nO rufião vasectomizado estimula sem cobrir. O flushing (mais energia 2 a 3 semanas antes e durante a monta) aumenta a taxa de ovulação.',
    },
    {
      id: 'protocolo',
      tipo: 'timeline',
      titulo: 'Sincronização hormonal',
      lead: 'Exemplo de protocolo curto com progesterona.',
      etapas: [
        { marco: 'D0', titulo: 'Dispositivo de P4', detalhe: 'esponja ou implante intravaginal' },
        { marco: 'D6–D7', titulo: 'Retirada', detalhe: 'com eCG e PGF2α' },
        { marco: '+24–48 h', titulo: 'Estro', detalhe: 'o rufião marca quem entrou' },
        { marco: '+48–56 h', titulo: 'IATF', detalhe: 'ou monta controlada' },
      ],
      faixa: { de: 0, ate: 1, rotulo: 'progesterona' },
      destaque: 3,
      nota: 'Doses e horários: definidos pelo veterinário para cada lote.',
      notas:
        'Exemplo de protocolo curto: dispositivo de progesterona no D0; no D6 ou D7, retirada com eCG e prostaglandina. O estro aparece entre 24 e 48 horas depois, e a IATF é feita por volta de 48 a 56 horas após a retirada, ou os carneiros entram para a monta controlada.\n\nDoses e horários variam com o produto e a categoria: definição do veterinário.',
    },
    {
      id: 'iatf-ou-monta',
      tipo: 'tabela',
      titulo: 'IATF ou monta controlada',
      colunas: ['', 'IATF', 'Monta controlada'],
      linhas: [
        ['Genética', 'Sêmen de reprodutores provados', 'Carneiros da propriedade'],
        ['Estrutura', 'Equipe técnica, sêmen e equipamento', 'Carneiros aptos, em proporção maior'],
        ['Partos', 'Concentrados ao máximo', 'Concentrados na janela do estro'],
        ['Custo por matriz', 'Maior', 'Menor'],
      ],
      nota: 'Nos dois casos, é a sincronização que dá previsibilidade.',
      notas:
        'IATF traz genética de reprodutores provados e concentra os partos ao máximo, mas exige equipe técnica, sêmen e equipamento. A monta controlada é mais barata e usa os carneiros da propriedade, com partos também concentrados graças à sincronização.',
    },
    {
      id: 'sistema-reproducao',
      tipo: 'sistema',
      titulo: 'Protocolo registrado, etapa lembrada',
      itens: ['IA com protocolo, sêmen e inseminador', 'Diagnóstico: gestante ou vazia', 'Lembretes na agenda e no WhatsApp'],
      tela: {
        titulo: 'Reprodução · Lote 07',
        blocos: [
          {
            tipo: 'tabela',
            colunas: ['Fêmea', 'Protocolo', 'Sêmen', 'Data'],
            linhas: [
              ['1102', 'Progesterona + Prostaglandina', 'TX-0415 · congelado', '12/03'],
              ['1107', 'Progesterona + Prostaglandina', 'TX-0415 · congelado', '12/03'],
              ['1115', 'Progesterona + Prostaglandina', 'DP-0208 · congelado', '12/03'],
              ['1121', 'Progesterona + Prostaglandina', 'DP-0208 · congelado', '12/03'],
            ],
          },
          {
            tipo: 'alertas',
            itens: [
              { nivel: 'info', texto: 'Evento hoje: retirar o dispositivo do Lote 07 às 8h' },
              { nivel: 'alerta', texto: 'Diagnóstico de gestação do Lote 07 em 30 dias (42 fêmeas)' },
            ],
          },
        ],
      },
      ilustrativo: true,
      notas:
        'Cada inseminação é registrada com o protocolo usado, o sêmen e o inseminador. O diagnóstico de gestação entra como gestante ou vazia, com os dias de gestação.\n\nOs lembretes, como a retirada do dispositivo e o diagnóstico, chegam pela agenda do app e pelo WhatsApp.',
    },

    /* ── 03 · Lotes ───────────────────────────────────────────────────── */
    {
      id: 'div-lotes',
      tipo: 'divisor',
      titulo: 'Lotes e calendário escalonado',
      subtitulo: 'Da monta livre à produção programada.',
      notas:
        'Com a biologia sob controle, a próxima ferramenta é a organização do rebanho em lotes com data marcada.',
    },
    {
      id: 'monta-livre-blocos',
      tipo: 'colunas',
      titulo: 'Da monta livre aos blocos',
      colunas: [
        {
          titulo: 'Monta livre',
          itens: ['Partos o ano inteiro, sem controle', 'Lotes desiguais', 'Oferta imprevisível'],
          foto: {
            src: `${PASTA}/18-monta-livre.jpg`,
            alt: 'Carneiro solto no rebanho com ovelhas e cordeiros de idades diferentes',
            briefing: 'Rebanho misturado: carneiro solto com ovelhas e cordeiros de idades diferentes.',
          },
        },
        {
          titulo: 'Estações em blocos',
          itens: ['Cobertura por lote, em data marcada', 'Cordeiros da mesma idade', 'Oferta prevista mês a mês'],
          foto: {
            src: `${PASTA}/18-lote-uniforme.jpg`,
            alt: 'Lote uniforme de cordeiros da mesma idade',
            briefing: 'Lote uniforme de cordeiros da mesma idade, no confinamento ou no piquete.',
          },
        },
      ],
      notas:
        'Na monta livre o carneiro fica no rebanho e os partos se espalham: lotes desiguais, manejo difícil e oferta imprevisível.\n\nCom estações em blocos, cada lote é coberto numa data marcada: cordeiros da mesma idade, manejo em grupo e data de abate conhecida desde a cobertura.',
    },
    {
      id: 'calendario-escalonado',
      tipo: 'calendario',
      titulo: 'Calendário escalonado',
      lead: 'Um lote coberto por mês: cordeiro pronto todo mês.',
      meses: MESES,
      gestacao: 5,
      terminacao: 5,
      ilustrativo: true,
      notas:
        'Cada linha é um lote de matrizes. Coberto num mês, o lote pare cinco meses depois; o cordeiro termina em mais cinco e vai ao abate. Deslocando cada lote em um mês, todo mês há um lote pronto: é a oferta contínua da linha de baixo.\n\nCom intervalo de partos de 8 meses (três partos em dois anos), o mesmo resultado sai com menos matrizes.',
    },
    {
      id: 'arquitetura-regional',
      tipo: 'rede',
      titulo: 'Arquitetura regional',
      lead: 'Cada propriedade cobre a sua parte do calendário.',
      centro: { nome: 'Frigorífico', detalhe: '530 cordeiros/mês' },
      nos: [
        { nome: 'Faz. Boa Vista', detalhe: 'jan · jul' },
        { nome: 'Sítio São José', detalhe: 'fev · ago' },
        { nome: 'Faz. Santa Luzia', detalhe: 'mar · set' },
        { nome: 'Faz. Três Irmãos', detalhe: 'abr · out' },
        { nome: 'Sítio Esperança', detalhe: 'mai · nov' },
        { nome: 'Faz. Ouro Verde', detalhe: 'jun · dez' },
      ],
      notas:
        'Nenhuma propriedade sozinha entrega todo mês. Em grupo, cada uma assume dois lotes por ano, em meses diferentes, e o frigorífico recebe o ano inteiro.\n\nO calendário é do grupo; a execução é de cada fazenda.',
    },
    {
      id: 'sistema-estacao',
      tipo: 'sistema',
      titulo: 'Estação de monta por lote',
      itens: ['Lote, carneiro e datas da estação', 'Cobertura lançada fêmea a fêmea', 'Gestantes, vazias e partos previstos'],
      tela: {
        titulo: 'Estação de Monta · Lote 07',
        blocos: [
          {
            tipo: 'metricas',
            itens: [
              { rotulo: 'Fêmeas', valor: '42' },
              { rotulo: 'Cobertas', valor: '40' },
              { rotulo: 'Gestantes', valor: '36' },
              { rotulo: 'Vazias', valor: '2' },
            ],
          },
          {
            tipo: 'tabela',
            colunas: ['Fêmea', 'Status', 'Cobertura', 'Parto previsto'],
            linhas: [
              ['1102', 'Coberta', '03/10', '02/03'],
              ['1107', 'Coberta', '04/10', '03/03'],
              ['1111', 'Pendente', '—', '—'],
            ],
            estados: [null, null, 'alerta'],
          },
          {
            tipo: 'alertas',
            itens: [{ nivel: 'alerta', texto: 'Aguardando diagnóstico de gestação: 2 fêmeas' }],
          },
        ],
      },
      ilustrativo: true,
      emDesenvolvimento: true,
      notas:
        'A estação de monta junta o lote, o carneiro e as datas. Cada cobertura é lançada, e o painel mostra cobertas, gestantes, vazias e os partos previstos.\n\nA estação de monta está em desenvolvimento no app.',
    },

    /* ── 04 · Identificação ───────────────────────────────────────────── */
    {
      id: 'div-identificacao',
      tipo: 'divisor',
      titulo: 'Identificação eletrônica',
      subtitulo: 'O dado certo, do animal certo, sem digitar.',
      notas:
        'Nada disso funciona com anotação em caderno. A identificação eletrônica é o que liga cada dado ao animal certo.',
    },
    {
      id: 'botton-ou-microchip',
      tipo: 'colunas',
      titulo: 'Botton ou microchip',
      colunas: [
        {
          titulo: 'Brinco botton',
          subtitulo: 'reutilizável',
          itens: ['Sai no abate, é higienizado e volta', 'Compatível com o sistema'],
          foto: {
            src: `${PASTA}/23-botton.jpg`,
            alt: 'Brinco botton eletrônico na orelha de um cordeiro',
            briefing: 'Brinco botton eletrônico na orelha de um cordeiro, em close.',
          },
        },
        {
          titulo: 'Microchip injetável',
          subtitulo: 'padrão ICAR · FDX-B',
          itens: ['Aplicado com seringa, dura a vida toda', 'Ideal para matrizes e reprodutores'],
          foto: {
            src: '/images/produtos/transparent/microchip.png',
            alt: 'Microchip com seringa aplicadora',
            briefing: 'Microchip com seringa aplicadora.',
            ajuste: 'conter',
          },
        },
      ],
      notas:
        'Duas opções. O botton eletrônico vai na orelha, é lido no curral e, no abate, sai, é higienizado e volta para o próximo lote: custo baixo por cordeiro. O microchip injetável, padrão ICAR, é aplicado com seringa e fica a vida toda; faz sentido para matrizes e reprodutores.\n\nNo padrão FDX-B, os dois são lidos pelo mesmo leitor e entram no sistema.',
    },
    {
      id: 'ciclo-do-botton',
      tipo: 'fluxo',
      forma: 'ciclo',
      titulo: 'O ciclo do botton',
      centro: 'Reutilizável',
      passos: [
        { titulo: 'Aplicação', detalhe: 'no nascimento', icone: 'brinco' },
        { titulo: 'Curral', detalhe: 'leitura em cada manejo', icone: 'leitura' },
        { titulo: 'Abate', detalhe: 'liga o cordeiro à carcaça', icone: 'abate' },
        { titulo: 'Higienização', icone: 'higienizacao' },
        { titulo: 'Reutilização', detalhe: 'no próximo lote', icone: 'reutilizacao' },
      ],
      notas:
        'O ciclo do botton: aplicado no nascimento, lido em cada manejo no curral, retirado no abate (onde também liga o cordeiro ao dado de carcaça), higienizado e reaplicado no lote seguinte.',
    },
    {
      id: 'leitor',
      tipo: 'texto-foto',
      titulo: 'Leitor de baixo custo',
      lead: 'Lê botton e microchip FDX-B e envia ao celular por Bluetooth.',
      estilo: 'lista',
      itens: [
        { texto: 'Captura automática no curral' },
        { texto: 'Sem erro de digitação' },
        { texto: 'Peso e manejo no animal certo' },
      ],
      foto: {
        src: '/images/produtos/transparent/leitor-portatil.png',
        alt: 'Leitor RFID portátil com Bluetooth',
        briefing: 'Leitor RFID portátil com Bluetooth.',
        ajuste: 'conter',
      },
      notas:
        'O leitor que a Seabra fornece lê o botton e o microchip e manda o número para o celular por Bluetooth. Acaba o erro de digitação no curral: o peso ou o manejo cai no animal certo.\n\nPreço e detalhes na página de vendas do site.',
    },
    {
      id: 'sistema-leitura',
      tipo: 'sistema',
      titulo: 'Leu, achou, pesou',
      itens: ['Busca por chip, número ou nome', 'Pesagem em sequência, sem digitar', 'GMD calculado na hora'],
      tela: {
        titulo: 'Modo Desempenho · Pesagem · Lote 07',
        blocos: [
          { tipo: 'alertas', itens: [{ nivel: 'info', texto: 'Chip 982 000 412 345 678 → cordeiro 1043' }] },
          {
            tipo: 'metricas',
            itens: [
              { rotulo: 'Peso agora', valor: '31,6 kg' },
              { rotulo: 'Pesagem anterior', valor: '27,6 kg', detalhe: 'há 14 dias' },
              { rotulo: 'GMD', valor: '283 g/dia', detalhe: 'desde a entrada' },
              { rotulo: 'Dias de engorda', valor: '48' },
            ],
          },
          {
            tipo: 'tabela',
            colunas: ['Animal', 'Chip', 'Peso', 'GMD'],
            linhas: [
              ['1041', '…412 345 671', '30,8 kg', '267 g/dia'],
              ['1042', '…412 345 672', '33,1 kg', '315 g/dia'],
              ['1043', '…412 345 678', '31,6 kg', '283 g/dia'],
            ],
          },
        ],
      },
      ilustrativo: true,
      notas:
        'No curral: aproxima o leitor, o app encontra o animal pelo chip e abre a pesagem. No Modo Desempenho é um laço contínuo: lê, pesa, próximo, sem digitar número.\n\nO GMD é calculado na hora, desde o início da engorda.',
    },

    /* ── 05 · Desempenho ──────────────────────────────────────────────── */
    {
      id: 'div-desempenho',
      tipo: 'divisor',
      titulo: 'Desempenho e carcaça',
      subtitulo: 'Medir para vender melhor.',
      notas:
        'Com cada animal identificado, dá para medir desempenho e, no fim, qualidade de carcaça, que é o que o frigorífico paga.',
    },
    {
      id: 'metas-desempenho',
      tipo: 'numeros',
      titulo: 'Metas do confinamento',
      lead: 'Referências para cordeiros em terminação intensiva.',
      numeros: [
        { rotulo: 'Ganho médio diário', valor: '280', unidade: 'g/dia' },
        { rotulo: 'Conversão alimentar', valor: '4,5', unidade: ': 1' },
        { rotulo: 'Idade ao abate', valor: '150', unidade: 'dias' },
        { rotulo: 'Peso ao abate', valor: '38', unidade: 'kg' },
      ],
      ilustrativo: true,
      notas:
        'Referências de terminação intensiva para cordeiros cruzados: ganho perto de 280 g por dia, conversão de 4,5 kg de matéria seca por kg de ganho, abate por volta dos 150 dias com 38 kg.\n\nSão metas ilustrativas: cada sistema e cada raça definem as suas.',
    },
    {
      id: 'ultrassom',
      tipo: 'texto-foto',
      titulo: 'Ultrassom in vivo',
      lead: 'Mede a carcaça antes do abate.',
      estilo: 'lista',
      itens: [
        { texto: 'AOL', detalhe: 'área de olho de lombo: quanto músculo' },
        { texto: 'EGS', detalhe: 'espessura de gordura subcutânea: acabamento' },
        { texto: 'Entre a 12ª e a 13ª costela' },
        { texto: 'Ponto de abate e seleção de matrizes' },
      ],
      foto: {
        src: `${PASTA}/29-ultrassom.jpg`,
        alt: 'Ultrassom de carcaça no lombo de um cordeiro',
        briefing:
          'Técnico fazendo ultrassom no lombo de um cordeiro no tronco de contenção, com a tela do aparelho visível.',
      },
      notas:
        'O ultrassom in vivo mede, entre a 12ª e a 13ª costela, a área de olho de lombo (quanto músculo) e a espessura de gordura subcutânea (o acabamento).\n\nServe para decidir o ponto de abate e para selecionar matrizes e reprodutores pela carcaça, sem esperar o abate.',
    },
    {
      id: 'retorno-frigorifico',
      tipo: 'fluxo',
      titulo: 'O frigorífico devolve o dado',
      lead: 'Rendimento de carcaça individual, pelo brinco.',
      passos: [
        { titulo: 'Leitura no abate', icone: 'leitura' },
        { titulo: 'Peso e rendimento de carcaça', detalhe: 'de cada cordeiro', icone: 'balanca' },
        { titulo: 'Volta para a ficha', detalhe: 'do cordeiro, da mãe e do pai', icone: 'ficha' },
        { titulo: 'Bonificação e seleção', detalhe: 'nutrição e genética que pagam', icone: 'selo' },
      ],
      notas:
        'Com o botton lido no abate, o frigorífico devolve peso e rendimento de carcaça de cada cordeiro. Esse dado volta para a ficha do animal, da mãe e do pai: dá para saber qual nutrição e qual genética geram bonificação.\n\nA integração com o frigorífico faz parte da proposta da plataforma.',
    },
    {
      id: 'sistema-desempenho',
      tipo: 'sistema',
      titulo: 'Desempenho por lote',
      itens: ['Peso médio e GMD por lote', 'Curva de peso a cada pesagem', 'Ranking de lotes por GMD'],
      tela: {
        titulo: 'Painel · Ovinos Corte · Lote 07',
        blocos: [
          {
            tipo: 'metricas',
            itens: [
              { rotulo: 'Total pesados', valor: '42' },
              { rotulo: 'Peso médio', valor: '37,9 kg' },
              { rotulo: 'GMD médio', valor: '284 g/dia' },
              { rotulo: 'Dias de engorda', valor: '70' },
            ],
          },
          {
            tipo: 'grafico',
            forma: 'linha',
            titulo: 'Peso médio do lote (kg)',
            rotulos: ['entrada', '14 d', '28 d', '42 d', '56 d', '70 d'],
            valores: [18, 21.7, 25.8, 29.9, 33.8, 37.9],
            unidade: 'kg',
          },
          {
            tipo: 'tabela',
            colunas: ['Top lotes por GMD', 'GMD médio', 'Peso médio'],
            linhas: [
              ['Lote 07', '284 g/dia', '37,9 kg'],
              ['Lote 05', '271 g/dia', '36,2 kg'],
            ],
          },
        ],
      },
      ilustrativo: true,
      notas:
        'O painel de pesagem mostra peso médio, GMD médio e dias de engorda por lote, e a curva de peso do lote a cada pesagem.\n\nO ranking de lotes por GMD aponta onde o manejo ou a dieta estão rendendo mais.',
    },

    /* ── 06 · Sanidade ────────────────────────────────────────────────── */
    {
      id: 'div-sanidade',
      tipo: 'divisor',
      titulo: 'Sanidade',
      subtitulo: 'Registrar simples, decidir rápido.',
      notas:
        'Sanidade é onde o registro simples faz mais diferença: se é difícil anotar, ninguém anota.',
    },
    {
      id: 'casos-clinicos',
      tipo: 'colunas',
      titulo: 'Casos clínicos',
      lead: 'Registro simples, no animal, com o protocolo da propriedade.',
      colunas: [
        {
          titulo: 'Pododermatite',
          subtitulo: 'casco',
          itens: ['Exame, casqueamento e tratamento'],
          foto: {
            src: `${PASTA}/33-casco.jpg`,
            alt: 'Exame de casco em ovino',
            briefing: 'Exame ou casqueamento de casco de ovino, sem sangue aparente.',
          },
        },
        {
          titulo: 'FAMACHA',
          subtitulo: 'verminose',
          itens: ['Grau 1 a 5: vermifugar só quem precisa'],
          foto: {
            src: `${PASTA}/33-famacha.jpg`,
            alt: 'Avaliação FAMACHA da mucosa ocular',
            briefing: 'Avaliação da mucosa ocular com o cartão FAMACHA ao lado.',
          },
        },
        {
          titulo: 'Mastite',
          subtitulo: 'úbere',
          itens: ['CMT, lado afetado e tratamento'],
          foto: {
            src: `${PASTA}/33-mastite.jpg`,
            alt: 'Exame do úbere de uma ovelha',
            briefing: 'Exame do úbere de uma ovelha (palpação ou CMT), sem lesão exposta.',
          },
        },
      ],
      notas:
        'Três problemas que pesam na ovinocultura de corte. Pododermatite: exame e casqueamento. Verminose: o FAMACHA, de 1 a 5 pela cor da mucosa, permite vermifugar só quem precisa e retardar a resistência. Mastite: exame do úbere, com impacto direto no cordeiro.\n\nCada propriedade tem os seus protocolos, e o registro segue o protocolo local.',
    },
    {
      id: 'carencia',
      tipo: 'timeline',
      titulo: 'Carência até o embarque',
      lead: 'Animal tratado só embarca depois de cumprir a carência.',
      etapas: [
        { marco: 'D0', titulo: 'Tratamento', detalhe: 'produto, dose e animal' },
        { marco: 'D28', titulo: 'Fim da carência', detalhe: 'prazo da bula (exemplo)' },
        { marco: 'D29', titulo: 'Liberado', detalhe: 'volta para a lista de embarque' },
        { marco: 'Embarque', titulo: 'Com histórico', detalhe: 'rastreável até o frigorífico' },
      ],
      faixa: { de: 0, ate: 1, rotulo: 'carência: não embarca', tom: 'bloqueio' },
      destaque: 3,
      nota: 'A carência vem da bula de cada produto.',
      notas:
        'Todo tratamento tem carência: o prazo da bula até o animal poder ir para o abate. O animal tratado sai da lista de embarque até cumprir esse prazo, e o histórico vai junto.\n\nIsso é rastreabilidade: o frigorífico recebe só animal liberado. O alerta automático de carência está em desenvolvimento no sistema.',
    },
    {
      id: 'sistema-sanidade',
      tipo: 'sistema',
      titulo: 'Caso registrado no animal',
      itens: ['FAMACHA, casco e CMT no manejo', 'CMT positivo abre caso de mastite', 'Sinais, tratamento e foto no caso'],
      tela: {
        titulo: 'Sanidade · Faz. Boa Vista',
        blocos: [
          {
            tipo: 'tabela',
            colunas: ['Animal', 'Caso clínico', 'Tratamento', 'Data'],
            linhas: [
              ['1043', 'Verminose', 'Vermífugo (protocolo A)', '14/09'],
              ['0412', 'Mastite Subclínica', 'Intramamário', '16/09'],
              ['0977', 'Locomotor', 'Casqueamento', '18/09'],
            ],
          },
          {
            tipo: 'alertas',
            itens: [
              { nivel: 'critico', texto: 'CMT positivo na ovelha 0412 (MD ++): caso de Mastite Subclínica aberto' },
              { nivel: 'alerta', texto: 'FAMACHA 4 e 5: 6 animais do Lote 07' },
            ],
          },
        ],
      },
      ilustrativo: true,
      notas:
        'No manejo, FAMACHA, casco e CMT entram na mesma tela. CMT positivo já abre um caso de mastite subclínica.\n\nO caso clínico guarda sinais, tratamento e foto no próprio animal.',
    },

    /* ── 07 · Plataforma ──────────────────────────────────────────────── */
    {
      id: 'div-plataforma',
      tipo: 'divisor',
      titulo: 'Plataforma integrada',
      subtitulo: 'Campo, grupo e frigorífico na mesma informação.',
      notas:
        'Para fechar, como tudo isso conversa: campo, grupo e frigorífico usando a mesma informação.',
    },
    {
      id: 'whatsapp',
      tipo: 'whatsapp',
      titulo: 'O campo no WhatsApp',
      lead: 'Avisos automáticos e registro por mensagem.',
      itens: ['Manejo do dia', 'Lembretes da agenda: protocolos, vacinas', 'Pesagens e resumo da semana', 'Registro por mensagem'],
      contato: 'Seabra',
      mensagens: [
        {
          de: 'sistema',
          hora: '06:30',
          texto:
            'Manejo do dia · Faz. Boa Vista\nDiagnóstico de gestação: 12 ovelhas (Lote 06)\nParto previsto hoje: 3 ovelhas (Lote 02)',
        },
        { de: 'sistema', hora: '07:00', texto: 'Evento hoje: retirar o dispositivo do Lote 07, às 8h.' },
        { de: 'produtor', hora: '10:12', texto: 'Registra 31,6 kg de peso do cordeiro 1043' },
        { de: 'sistema', hora: '10:12', texto: 'Pesagem registrada: cordeiro 1043, 31,6 kg.' },
        {
          de: 'sistema',
          hora: '18:00',
          texto: 'Resumo da semana: 42 cordeiros pesados no Lote 07, GMD médio de 284 g/dia.',
        },
      ],
      ilustrativo: true,
      notas:
        'O produtor não precisa abrir o app para saber o que fazer: o manejo do dia chega no WhatsApp de manhã, junto com os lembretes da agenda. E dá para registrar por mensagem, como um peso ou uma troca de lote.\n\nConversa ilustrativa.',
    },
    {
      id: 'painel-frigorifico',
      tipo: 'sistema',
      titulo: 'Painel do frigorífico',
      itens: ['Oferta prevista pelos lotes já cobertos', '3, 6 e 12 meses à frente', 'Queda aparece com meses de antecedência'],
      tela: {
        titulo: 'Painel · Frigorífico · Grupo Oeste',
        blocos: [
          {
            tipo: 'metricas',
            itens: [
              { rotulo: 'Próximos 3 meses', valor: '25,7 t' },
              { rotulo: 'Próximos 6 meses', valor: '48,9 t' },
              { rotulo: 'Próximos 12 meses', valor: '100,4 t', detalhe: 'abaixo da meta em fev e mar' },
            ],
          },
          {
            tipo: 'grafico',
            forma: 'colunas',
            titulo: 'Carcaça prevista por mês (t)',
            rotulos: ['out', 'nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set'],
            valores: [8.6, 8.5, 8.6, 8.7, 7.1, 7.4, 8.6, 8.7, 8.5, 8.6, 8.5, 8.6],
            unidade: 't',
            referencia: { valor: 8.5, rotulo: 'meta' },
            altura: 520,
          },
        ],
      },
      ilustrativo: true,
      emDesenvolvimento: true,
      notas:
        'Com os lotes cobertos no sistema, a oferta dos próximos meses já é conhecida: 3, 6 e 12 meses à frente. Aqui aparece uma queda em fevereiro e março, com tempo de cobrir mais matrizes e corrigir.\n\nEste painel do grupo e do frigorífico está em desenvolvimento.',
    },
    {
      id: 'arquitetura',
      tipo: 'arquitetura',
      titulo: 'Arquitetura do sistema',
      lead: 'Proposta de integração entre campo, grupo e frigorífico.',
      etapas: ['Entrada', 'Processamento', 'Saída'],
      modulos: [
        {
          nome: 'Planejamento',
          entrada: 'Demanda do frigorífico (kg/mês)',
          processamento: 'Algoritmo de escalonamento reprodutivo',
          saida: 'Calendário de monta por propriedade',
        },
        {
          nome: 'Campo (IoT)',
          entrada: 'Leitura de microchip + pesagem',
          processamento: 'Identificação individual e GMD',
          saida: 'Histórico de desenvolvimento do cordeiro',
        },
        {
          nome: 'Ultrassom/Abate',
          entrada: 'Medição de AOL + peso de carcaça',
          processamento: 'Rendimento e composição da carcaça',
          saida: 'Bonificação e seleção de matrizes top',
        },
        {
          nome: 'Sanidade',
          entrada: 'Sintomas e tratamentos',
          processamento: 'Matriz de risco epidemiológico e carência',
          saida: 'Alertas de carência e protocolos locais',
        },
        {
          nome: 'Comunicação',
          entrada: 'Status dos eventos reprodutivos',
          processamento: 'Motor de regras de manejo',
          saida: 'Tarefas diárias via WhatsApp',
        },
      ],
      notas:
        'A plataforma em cinco módulos. Cada um recebe um dado do campo ou do frigorífico, processa e devolve uma decisão: calendário de monta, histórico do cordeiro, bonificação, alerta de carência, tarefa do dia.\n\nParte disso já roda no app (lotes, pesagem, sanidade, WhatsApp); o planejamento em grupo e a integração com o frigorífico estão em desenvolvimento.',
    },

    /* ── Fechamento ───────────────────────────────────────────────────── */
    {
      id: 'fechamento',
      tipo: 'fechamento',
      titulo: 'Obrigado',
      subtitulo: 'Perguntas?',
      apresentador: 'M.Sc. Geraldo Jonas da Silva',
      logoApresentador: BRIMUS,
      site: 'sistemaseabra.com.br',
      qr: `${PASTA}/qr-site.svg`,
      whatsapp: true,
      logoSistema: SEABRA,
      notas:
        'Agradecer. Deixar este slide na tela durante as perguntas: o QR code leva ao site da Seabra, e o WhatsApp está logo abaixo.',
    },
  ],
};
