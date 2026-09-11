import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência funcional ───────────────────────── */

const fluenciaFuncional: Licao[] = [
  {
    id: 'reunioes-negociacao',
    titulo: 'Reuniões e negociação',
    resumo: 'Conduzir e participar de uma reunião, tomar a palavra, propor, ceder e fechar um acordo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Reuniões em inglês têm **agenda** (pauta), terminam com **action items** (tarefas, com responsável e prazo) e às vezes com **minutes** (ata). O americano valoriza objetividade e horário: começa-se no minuto marcado, e *Let's take this offline* (vamos tratar disso fora da reunião) é o jeito educado de cortar uma discussão que foge do tema.

Negociar: nos EUA, direto e com números cedo; no Reino Unido, mais indireto. Duas fórmulas-chave: a condicional de troca (*If you…, we could…*) e o adiamento sem compromisso (*I'll need to run this by my team*). Um **deal-breaker** é o ponto sem o qual não há acordo.`,
      },
      {
        tipo: 'frases',
        titulo: 'Conduzir a reunião',
        itens: [
          { texto: 'Thanks for joining, everyone. Let’s get started.', traducao: 'Obrigado por participarem. Vamos começar.' },
          { texto: 'We have three items on the agenda today.', traducao: 'Temos três itens na pauta hoje.' },
          { texto: 'Let’s move on to the next point.', traducao: 'Vamos passar ao próximo ponto.' },
          { texto: 'Can I jump in here for a second?', traducao: 'Posso entrar aqui um segundo?' },
          { texto: 'Sorry, could I just finish my point?', traducao: 'Desculpe, posso só terminar meu raciocínio?' },
          { texto: 'Let’s take this offline.', traducao: 'Vamos tratar disso fora da reunião.' },
          { texto: 'To sum up: …', traducao: 'Resumindo: …' },
          { texto: 'Who’s going to take care of this, and by when?', traducao: 'Quem vai cuidar disso, e até quando?' },
          { texto: 'Let’s circle back to this next week.', traducao: 'Vamos retomar isso semana que vem.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Negociar',
        itens: [
          { texto: 'What would be your best offer?', traducao: 'Qual seria sua melhor oferta?' },
          { texto: 'Would you be willing to come down on the price?', traducao: 'Estariam dispostos a baixar o preço?' },
          { texto: 'If you can shorten the delivery time, we could increase the order.', traducao: 'Se vocês reduzirem o prazo de entrega, poderíamos aumentar o pedido.' },
          { texto: 'I’m afraid that’s a deal-breaker for us.', traducao: 'Infelizmente isso inviabiliza o acordo para nós.' },
          { texto: 'Let’s meet halfway.', traducao: 'Vamos dividir a diferença.' },
          { texto: 'I think we can live with that.', traducao: 'Acho que dá para aceitar isso.' },
          { texto: 'I’ll need to run this by my team and get back to you by Friday.', traducao: 'Preciso consultar minha equipe e retorno até sexta.' },
          { texto: 'Could we put that in writing?', traducao: 'Podemos formalizar isso por escrito?' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'agenda', traducao: 'pauta', nota: 'falso amigo: agenda pessoal é "planner" ou "calendar"' },
          { termo: 'minutes', traducao: 'ata', exemplo: 'Who’s taking the minutes?', exemploTraducao: 'Quem está fazendo a ata?' },
          { termo: 'action items', traducao: 'tarefas definidas na reunião' },
          { termo: 'to reach an agreement', traducao: 'chegar a um acordo' },
          { termo: 'deal', traducao: 'acordo, negócio', exemplo: 'It’s a deal!', exemploTraducao: 'Fechado!' },
          { termo: 'to negotiate / negotiation', traducao: 'negociar / negociação' },
          { termo: 'offer / counteroffer', traducao: 'oferta / contraproposta' },
          { termo: 'to compromise', traducao: 'ceder, chegar a um meio-termo', nota: 'falso amigo parcial: "comprometer-se" é "commit"' },
          { termo: 'terms and conditions', traducao: 'termos e condições' },
          { termo: 'leeway', traducao: 'margem de manobra' },
          { termo: 'binding / non-binding', traducao: 'vinculante / sem compromisso' },
          { termo: 'to postpone / to cancel', traducao: 'adiar / cancelar' },
          { termo: 'to be in charge of', traducao: 'ser responsável por' },
          { termo: 'to get back to someone', traducao: 'dar retorno a alguém' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'We have three items on the ___. (pauta)', resposta: 'agenda' },
          { tipo: 'lacuna', frase: 'Would you be ___ to come down on the price?', resposta: 'willing' },
          { tipo: 'lacuna', frase: 'I’ll get ___ to you by Friday.', resposta: 'back' },
          { tipo: 'lacuna', frase: 'Let’s meet ___. (dividir a diferença)', resposta: 'halfway' },
          { tipo: 'escolha', pergunta: '"Let’s take this offline" =', opcoes: ['Vamos desligar a internet', 'Vamos tratar disso fora da reunião', 'Vamos cancelar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"That’s a deal-breaker" =', opcoes: ['Isso fecha o negócio', 'Isso inviabiliza o acordo', 'Isso é uma pechincha'], correta: 1 },
          { tipo: 'escolha', pergunta: '"agenda" numa reunião é…', opcoes: ['o caderno pessoal', 'a pauta'], correta: 1 },
          { tipo: 'ditado', texto: 'I’ll need to run this by my team and get back to you.', traducao: 'Preciso consultar minha equipe e te dou retorno.' },
        ],
      },
    ],
  },
  {
    id: 'processos-passiva',
    titulo: 'Explicar processos: a voz passiva',
    resumo: 'be + particípio em todos os tempos, "have something done" e o "it is said that".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **passiva** (*be + particípio*) descreve o que acontece com algo quando quem faz não importa. É a língua dos processos, relatórios e manuais: *The milk **is cooled** to 4 °C. The goats **were weighed** yesterday. The data **will be analyzed** next week.* O agente, quando aparece, vem com **by**.

Três variações úteis:
- **get** + particípio, coloquial: *He got fired. The package got lost.*
- **have / get something done** — mandar fazer: *We **had** the barn **painted**. I need to **get** my car **fixed**.*
- **Passiva impessoal**, típica de imprensa: *It is said that…, It is believed that…, He is thought to be…*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Passiva nos tempos',
        cabecalho: ['Tempo', 'Exemplo', 'Tradução'],
        linhas: [
          ['present simple', 'The goats are milked twice a day.', 'As cabras são ordenhadas duas vezes ao dia.'],
          ['present continuous', 'The barn is being cleaned.', 'O estábulo está sendo limpo.'],
          ['past simple', 'The goats were milked at five.', 'As cabras foram ordenhadas às cinco.'],
          ['present perfect', 'The order has been shipped.', 'O pedido foi enviado.'],
          ['future', 'The results will be sent tomorrow.', 'Os resultados serão enviados amanhã.'],
          ['modal', 'The data must be entered daily.', 'Os dados devem ser lançados diariamente.'],
          ['have something done', 'We had the fence repaired.', 'Mandamos consertar a cerca.'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um processo descrito',
        markdown: `> The goats **are milked** every morning and evening. The milk **is** immediately **cooled** to four degrees and **stored** in the bulk tank. Every other day it **is picked up by** the creamery. Each goat's yield **is recorded** in the app, so that problems **can be spotted** early. Once a month the animals **are weighed** and **checked** by the vet.

As cabras são ordenhadas toda manhã e toda noite. O leite é resfriado imediatamente a quatro graus e armazenado no tanque. Dia sim, dia não, é recolhido pelo laticínio. A produção de cada cabra é registrada no app, para que os problemas possam ser identificados cedo. Uma vez por mês os animais são pesados e examinados pelo veterinário.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'process / procedure', traducao: 'processo / procedimento' },
          { termo: 'step / stage', traducao: 'passo / etapa' },
          { termo: 'to produce / to process', traducao: 'produzir / processar, beneficiar' },
          { termo: 'to record / to log', traducao: 'registrar' },
          { termo: 'to store', traducao: 'armazenar' },
          { termo: 'to check / to inspect', traducao: 'verificar / inspecionar' },
          { termo: 'to carry out', traducao: 'realizar, executar' },
          { termo: 'bulk tank', traducao: 'tanque de resfriamento' },
          { termo: 'creamery / dairy plant', traducao: 'laticínio' },
          { termo: 'first / then / after that / finally', traducao: 'primeiro / depois / em seguida / por fim' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'The milk ___ cooled every day.', resposta: 'is' },
          { tipo: 'lacuna', frase: 'The order has ___ shipped.', resposta: 'been' },
          { tipo: 'lacuna', frase: 'The data must be ___ daily. (enter)', resposta: 'entered' },
          { tipo: 'lacuna', frase: 'The barn is ___ cleaned right now.', resposta: 'being' },
          { tipo: 'lacuna', frase: 'We had the fence ___. (repair)', resposta: 'repaired' },
          { tipo: 'escolha', pergunta: '"I need to get my car fixed" =', opcoes: ['Preciso consertar meu carro eu mesmo', 'Preciso mandar consertar meu carro'], correta: 1 },
          { tipo: 'escolha', pergunta: '"It is believed that prices will rise" é típico de…', opcoes: ['conversa informal', 'imprensa e relatórios'], correta: 1 },
          { tipo: 'ordenar', resposta: 'The goats are milked twice a day', traducao: 'As cabras são ordenhadas duas vezes ao dia' },
        ],
      },
    ],
  },
  {
    id: 'certeza-duvida',
    titulo: 'Certeza, dúvida e dedução',
    resumo: 'must, can’t, might + have + particípio, "bound to", "likely", e o vocabulário da suposição.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Modais de **dedução** dizem quanto você acredita numa afirmação:

- **must** — quase certo: *He **must** be tired, he worked all night.*
- **can't** — impossível: *That **can't** be right, I checked twice.* (Não se usa *mustn't* aqui.)
- **might / may / could** — possível: *It **might** rain later.*

No passado: modal + **have + particípio**: *He **must have forgotten**. She **can't have seen** it. They **might have left** already.*

Outras formas de graduar: *be **bound to*** (é certo que), *be **likely / unlikely to*** (é provável / improvável que), ***There's a good chance** that…*, ***I bet**…* (aposto que, informal), ***I doubt**…* (duvido). E a distância da fonte: ***apparently*** (pelo que dizem), ***supposedly*** (supostamente), ***seem / appear to***.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'That must be a mistake.', traducao: 'Isso deve ser um erro.' },
          { texto: 'The delivery should arrive tomorrow.', traducao: 'A entrega deve chegar amanhã.', nota: 'should = expectativa razoável' },
          { texto: 'That can’t be true — I checked it twice.', traducao: 'Não pode ser verdade: conferi duas vezes.' },
          { texto: 'He must have forgotten the meeting.', traducao: 'Ele deve ter esquecido a reunião.' },
          { texto: 'Prices are likely to go up next year.', traducao: 'É provável que os preços subam ano que vem.' },
          { texto: 'It’s bound to rain — look at those clouds.', traducao: 'Com certeza vai chover: olha essas nuvens.' },
          { texto: 'Apparently, the new manager is very strict.', traducao: 'Pelo que dizem, o novo gerente é muito rígido.' },
          { texto: 'The company seems to be having problems.', traducao: 'A empresa parece estar com problemas.' },
          { texto: 'I doubt they’ll accept the offer.', traducao: 'Duvido que aceitem a oferta.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'likely / unlikely', traducao: 'provável / improvável' },
          { termo: 'probability / chance', traducao: 'probabilidade / chance' },
          { termo: 'to assume', traducao: 'supor, presumir', nota: 'falso amigo: "assumir" responsabilidade é "take responsibility"' },
          { termo: 'to guess', traducao: 'adivinhar, achar (informal)', exemplo: 'I guess so.', exemploTraducao: 'Acho que sim.' },
          { termo: 'to doubt', traducao: 'duvidar' },
          { termo: 'to rule out', traducao: 'descartar (uma possibilidade)' },
          { termo: 'apparently', traducao: 'pelo que dizem, aparentemente' },
          { termo: 'supposedly / allegedly', traducao: 'supostamente / alegadamente' },
          { termo: 'hardly', traducao: 'mal, dificilmente', exemplo: 'That’s hardly possible.', exemploTraducao: 'Isso é pouco provável.' },
          { termo: 'definitely / by no means', traducao: 'com certeza / de modo algum' },
          { termo: 'to be due to', traducao: 'dever-se a', exemplo: 'It’s due to the weather.', exemploTraducao: 'É por causa do tempo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Maior grau de certeza:', opcoes: ['He might be sick.', 'He must be sick.', 'He could be sick.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Não pode ser verdade" =', opcoes: ['It mustn’t be true.', 'It can’t be true.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I assume you’re coming" =', opcoes: ['Assumo que você vem (responsabilidade)', 'Suponho que você vem'], correta: 1 },
          { tipo: 'lacuna', frase: 'He must ___ forgotten. (deve ter)', resposta: 'have' },
          { tipo: 'lacuna', frase: 'Prices are ___ to rise. (provável)', resposta: 'likely' },
          { tipo: 'lacuna', frase: 'It’s ___ to happen sooner or later. (é certo que)', resposta: 'bound' },
          { tipo: 'lacuna', frase: 'We can’t rule ___ that possibility.', resposta: 'out' },
          { tipo: 'traducao', origem: 'Pode ser.', resposta: ['Maybe.', 'It could be.', 'It might be.', 'Could be.', 'Possibly.'] },
        ],
      },
    ],
  },
];

/* ───────────────────────────────── Debates ──────────────────────────────── */

const debates: Licao[] = [
  {
    id: 'estrutura-debate',
    titulo: 'A estrutura de um debate',
    resumo: 'Abrir, argumentar, refutar, ceder e concluir: o kit de frases para discutir ao vivo em inglês.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Num debate você precisa de cinco movimentos: **tese** (*My position is that…*), **argumento com apoio** (*This is supported by…*), **refutação** (*That may be true, but…*), **concessão** (*Admittedly,… Even so,…*) e **conclusão** (*This leads me to conclude that…*).

O tom anglo-saxão valoriza **evidência** e **concisão**: um dado vale mais que um adjetivo. Atacar a pessoa, e não o argumento, derruba sua credibilidade na hora. Interromper é aceitável se breve: *Sorry to interrupt, but…*`,
      },
      {
        tipo: 'frases',
        titulo: 'Tese e argumento',
        itens: [
          { texto: 'My position is that…', traducao: 'Minha posição é que…' },
          { texto: 'The main reason for this is that…', traducao: 'A principal razão para isso é que…' },
          { texto: 'Take, for example, …', traducao: 'Veja, por exemplo, …' },
          { texto: 'Research shows that…', traducao: 'Pesquisas mostram que…' },
          { texto: 'On top of that, …', traducao: 'Além disso, …' },
          { texto: 'It’s also worth mentioning that…', traducao: 'Vale mencionar também que…' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Refutar e ceder',
        itens: [
          { texto: 'That may be true, but…', traducao: 'Isso pode ser verdade, mas…' },
          { texto: 'I only partly agree with that.', traducao: 'Só concordo em parte com isso.' },
          { texto: 'That argument doesn’t hold up.', traducao: 'Esse argumento não se sustenta.' },
          { texto: 'Actually, the opposite is true.', traducao: 'Na verdade, é o contrário.' },
          { texto: 'Admittedly, it’s a problem. Even so, …', traducao: 'É verdade que é um problema. Mesmo assim, …' },
          { texto: 'You’re right to the extent that…', traducao: 'Você tem razão na medida em que…' },
          { texto: 'It’s a matter of perspective.', traducao: 'É uma questão de perspectiva.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concluir',
        itens: [
          { texto: 'This leads me to conclude that…', traducao: 'Isso me leva a concluir que…' },
          { texto: 'At the end of the day, …', traducao: 'No fim das contas, …' },
          { texto: 'That’s why I’m in favor of…', traducao: 'É por isso que sou a favor de…' },
          { texto: 'To wrap up, I’d like to stress that…', traducao: 'Para encerrar, gostaria de frisar que…' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'argument / counterargument', traducao: 'argumento / contra-argumento', nota: '"argument" também é briga, discussão' },
          { termo: 'claim', traducao: 'afirmação, alegação' },
          { termo: 'evidence', traducao: 'evidência, provas', nota: 'incontável: some evidence' },
          { termo: 'to back up / to support', traducao: 'sustentar, embasar' },
          { termo: 'to refute / to rebut', traducao: 'refutar' },
          { termo: 'to concede / admittedly', traducao: 'conceder / é verdade que' },
          { termo: 'to hold up', traducao: 'sustentar-se (argumento)' },
          { termo: 'biased / unbiased', traducao: 'parcial, tendencioso / imparcial' },
          { termo: 'convincing / compelling', traducao: 'convincente / muito convincente' },
          { termo: 'stance / position', traducao: 'posição, postura' },
          { termo: 'to be in favor of / against', traducao: 'ser a favor de / contra' },
          { termo: 'conclusion', traducao: 'conclusão' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'That may be ___, but the costs are too high.', resposta: 'true' },
          { tipo: 'lacuna', frase: 'That argument doesn’t hold ___.', resposta: 'up' },
          { tipo: 'lacuna', frase: '___, it’s a problem. Even so, we should try. (é verdade que)', resposta: 'Admittedly' },
          { tipo: 'lacuna', frase: 'This leads me to ___ that we must act.', resposta: 'conclude' },
          { tipo: 'escolha', pergunta: '"biased" descreve alguém…', opcoes: ['imparcial', 'tendencioso', 'inteligente'], correta: 1 },
          { tipo: 'escolha', pergunta: '"evidence" é…', opcoes: ['contável: an evidence', 'incontável: some evidence'], correta: 1 },
          { tipo: 'escolha', pergunta: '"They had an argument" mais provavelmente significa…', opcoes: ['Eles tinham um argumento', 'Eles discutiram / brigaram'], correta: 1 },
          { tipo: 'ditado', texto: 'I only partly agree with that.', traducao: 'Só concordo em parte com isso.' },
        ],
      },
    ],
  },
  {
    id: 'tema-tecnologia-trabalho',
    titulo: 'Tema: tecnologia e trabalho',
    resumo: 'Automação, trabalho remoto, inteligência artificial: vocabulário e argumentos dos dois lados.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Tema frequente em provas e em conversa de negócios. Argumentos típicos:

**A favor**: *processes become more efficient; repetitive tasks disappear; data leads to better decisions; people can work from anywhere.*

**Contra / riscos**: *jobs are lost; over-reliance on technology; data privacy; always-on culture and burnout; older workers get left behind.*

A agricultura é um ótimo terreno: sensores no estábulo, apps de gestão, drones — e o produtor que prefere o caderno.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'digital transformation', traducao: 'transformação digital' },
          { termo: 'artificial intelligence (AI)', traducao: 'inteligência artificial (IA)' },
          { termo: 'automation', traducao: 'automação' },
          { termo: 'job / workforce', traducao: 'emprego / força de trabalho' },
          { termo: 'to replace', traducao: 'substituir' },
          { termo: 'to be phased out', traducao: 'ser eliminado aos poucos' },
          { termo: 'to emerge', traducao: 'surgir', exemplo: 'New jobs are emerging.', exemploTraducao: 'Novas profissões estão surgindo.' },
          { termo: 'efficiency / efficient', traducao: 'eficiência / eficiente' },
          { termo: 'productivity', traducao: 'produtividade' },
          { termo: 'remote work / working from home', traducao: 'trabalho remoto' },
          { termo: 'always-on culture', traducao: 'cultura de estar sempre disponível' },
          { termo: 'burnout', traducao: 'esgotamento' },
          { termo: 'work-life balance', traducao: 'equilíbrio vida-trabalho' },
          { termo: 'data privacy', traducao: 'privacidade de dados' },
          { termo: 'over-reliance on', traducao: 'dependência excessiva de' },
          { termo: 'to upskill / reskill', traducao: 'capacitar-se / requalificar-se' },
          { termo: 'labor shortage', traducao: 'falta de mão de obra' },
          { termo: 'to be left behind', traducao: 'ficar para trás' },
          { termo: 'precision agriculture', traducao: 'agricultura de precisão' },
          { termo: 'sensor', traducao: 'sensor' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Dois argumentos prontos',
        markdown: `> **For:** Digital tools on the farm aren't a threat — they're an opportunity. A farmer who records each goat's daily yield can spot an illness days before the naked eye can. On top of that, rural labor shortages can only be tackled with more efficient processes.

> **Against:** Admittedly, sensors provide valuable data. Even so, that argument doesn't fully hold up: small farms often can't afford the technology, and depending on a single supplier is a real risk. It's also worth remembering that experience can't be measured in data.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Many repetitive jobs are being ___ out. (eliminados aos poucos)', resposta: 'phased' },
          { tipo: 'lacuna', frase: 'At the same time, new jobs are ___. (surgindo)', resposta: 'emerging' },
          { tipo: 'lacuna', frase: 'Small farms can’t ___ the technology. (arcar com)', resposta: 'afford' },
          { tipo: 'escolha', pergunta: '"labor shortage" =', opcoes: ['excesso de trabalhadores', 'falta de mão de obra', 'greve'], correta: 1 },
          { tipo: 'escolha', pergunta: '"always-on culture" é apresentada normalmente como…', opcoes: ['vantagem', 'risco'], correta: 1 },
          { tipo: 'traducao', origem: 'Novas profissões estão surgindo.', resposta: ['New jobs are emerging.', 'New professions are emerging.', 'New jobs are appearing.'] },
          { tipo: 'ordenar', resposta: 'Experience cannot be measured in data', traducao: 'A experiência não pode ser medida em dados' },
          { tipo: 'ditado', texto: 'Digital tools are not a threat, they are an opportunity.', traducao: 'As ferramentas digitais não são uma ameaça, são uma oportunidade.' },
        ],
      },
    ],
  },
  {
    id: 'tema-agricultura-ambiente',
    titulo: 'Tema: agricultura e meio ambiente',
    resumo: 'Bem-estar animal, orgânico, pegada de carbono, rastreabilidade: o debate que o produtor enfrenta lá fora.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Nos mercados de língua inglesa, o comprador pergunta como o animal é criado. Palavras que aparecem: **animal welfare** (bem-estar animal), **organic**, **pasture-raised** (criado a pasto), **sustainability**, **carbon footprint** (pegada de carbono), **regenerative agriculture**, **traceability** (rastreabilidade), **factory farming** (termo crítico para pecuária intensiva).

Argumentar aqui pede equilíbrio: *It's about striking a balance between… and…* (trata-se de equilibrar…) e *There's a trade-off between… and…* (há um custo-benefício entre…).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'sustainability / sustainable', traducao: 'sustentabilidade / sustentável' },
          { termo: 'animal welfare', traducao: 'bem-estar animal' },
          { termo: 'pasture-raised / free-range', traducao: 'criado a pasto / criado solto' },
          { termo: 'factory farming', traducao: 'pecuária industrial (termo crítico)' },
          { termo: 'organic / conventional', traducao: 'orgânico / convencional' },
          { termo: 'climate change', traducao: 'mudança climática' },
          { termo: 'greenhouse gases / emissions', traducao: 'gases de efeito estufa / emissões' },
          { termo: 'carbon footprint', traducao: 'pegada de carbono' },
          { termo: 'fertilizer / pesticide', traducao: 'fertilizante / pesticida' },
          { termo: 'groundwater', traducao: 'lençol freático' },
          { termo: 'biodiversity', traducao: 'biodiversidade' },
          { termo: 'subsidy', traducao: 'subsídio', nota: 'nos EUA, o Farm Bill' },
          { termo: 'consumer', traducao: 'consumidor' },
          { termo: 'traceability', traducao: 'rastreabilidade' },
          { termo: 'yield', traducao: 'rendimento, produção' },
          { termo: 'to strike a balance', traducao: 'encontrar um equilíbrio' },
          { termo: 'trade-off', traducao: 'custo-benefício, concessão mútua' },
          { termo: 'antibiotic-free', traducao: 'sem antibióticos' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Com uma compradora americana',
        falas: [
          { quem: 'Buyer', texto: 'Our customers keep asking how the animals are raised. What does that look like on your farm?', traducao: 'Nossos clientes vivem perguntando como os animais são criados. Como é isso na sua fazenda?' },
          { quem: 'Felipe', texto: 'Our goats are out on pasture during the day, and in the barn they have a lot more space than the standard requires.', traducao: 'Nossas cabras ficam no pasto durante o dia, e no estábulo têm muito mais espaço do que a norma exige.' },
          { quem: 'Buyer', texto: 'And antibiotics?', traducao: 'E antibióticos?' },
          { quem: 'Felipe', texto: 'Only when an animal is sick, never preventively. Every treatment is logged in the app, so we can prove it at any time.', traducao: 'Só quando um animal está doente, nunca preventivamente. Todo tratamento é registrado no app, então podemos comprovar a qualquer momento.' },
          { quem: 'Buyer', texto: 'That’s exactly the kind of traceability the market is asking for.', traducao: 'É exatamente o tipo de rastreabilidade que o mercado está pedindo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'It’s about striking a ___ between yield and animal welfare.', resposta: 'balance' },
          { tipo: 'lacuna', frase: 'Antibiotics only when needed, never ___. (preventivamente)', resposta: 'preventively' },
          { tipo: 'lacuna', frase: 'Every treatment is ___ in the app. (registrado)', resposta: ['logged', 'recorded'] },
          { tipo: 'escolha', pergunta: '"factory farming" é um termo…', opcoes: ['neutro', 'crítico, negativo', 'técnico oficial'], correta: 1 },
          { tipo: 'escolha', pergunta: '"carbon footprint" =', opcoes: ['pegada de carbono', 'impressão digital', 'depósito de carvão'], correta: 0 },
          { tipo: 'escolha', pergunta: '"trade-off" =', opcoes: ['uma troca comercial', 'um custo-benefício entre objetivos', 'um acordo de exportação'], correta: 1 },
          { tipo: 'traducao', origem: 'Todo tratamento é registrado.', resposta: ['Every treatment is recorded.', 'Every treatment is logged.', 'Each treatment is recorded.'] },
          { tipo: 'ditado', texto: 'That’s exactly the kind of traceability the market is asking for.', traducao: 'É exatamente o tipo de rastreabilidade que o mercado está pedindo.' },
        ],
      },
    ],
  },
];

/* ────────────────────────── Linguagem profissional ──────────────────────── */

const profissional: Licao[] = [
  {
    id: 'email-formal',
    titulo: 'E-mail formal e carta comercial',
    resumo: 'Dear Ms. Walker, "I am writing to…", "Please find attached" e a regra de Yours sincerely × faithfully.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Anatomia do e-mail formal:

1. **Subject**: curto e específico — *Quote request: MT-200 milking system*.
2. **Saudação**: *Dear Ms. Walker,* / *Dear Mr. Davis,* / sem nome: *Dear Sir or Madam,* ou *To whom it may concern,*. Use **Ms.** para mulheres, sempre, a menos que ela prefira outro.
3. **Abertura**: *I am writing to…* / *Further to our conversation,…* / *Thank you for your quote of March 3rd.*
4. **Corpo**: um pedido por parágrafo. *Could you please send…? / I would be grateful if you could…*
5. **Fecho**: *Please do not hesitate to contact me if you have any questions.* / *I look forward to hearing from you.*
6. **Despedida**: nos EUA, *Sincerely,* ou *Best regards,*; no Reino Unido, **Yours sincerely** quando você sabe o nome e **Yours faithfully** quando começou com *Dear Sir or Madam*. *Kind regards* serve para quase tudo.

O e-mail de negócios americano é mais curto e menos cerimonioso do que o brasileiro. Três parágrafos curtos é o ideal.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> **Subject:** Quote request – MT-200 milking system
>
> Dear Ms. Walker,
>
> Thank you for taking the time to meet with me at the World Dairy Expo. As discussed, we are interested in the MT-200 milking system for a farm with 300 dairy goats.
>
> Could you please send us a quote including delivery time to Brazil and your payment terms? We would also be grateful if you could share references from farms of a similar size.
>
> Please do not hesitate to contact me if you need any further information.
>
> Best regards,
> Felipe Seabra
> CEO, Sistema Seabra`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'subject line', traducao: 'assunto do e-mail' },
          { termo: 'inquiry', traducao: 'consulta, pedido de informação', nota: 'enquiry no Reino Unido' },
          { termo: 'quote / quotation', traducao: 'orçamento, cotação' },
          { termo: 'purchase order (PO)', traducao: 'pedido de compra' },
          { termo: 'confirmation', traducao: 'confirmação' },
          { termo: 'attached / please find attached', traducao: 'anexo / segue em anexo' },
          { termo: 'further to', traducao: 'em continuidade a, com referência a' },
          { termo: 'as discussed / as agreed', traducao: 'conforme conversado / combinado' },
          { termo: 'to be grateful', traducao: 'ser grato', exemplo: 'I would be grateful if…', exemploTraducao: 'Eu agradeceria se…' },
          { termo: 'to follow up', traducao: 'fazer acompanhamento, retomar' },
          { termo: 'payment terms', traducao: 'condições de pagamento' },
          { termo: 'lead time / delivery date', traducao: 'prazo de entrega / data de entrega' },
          { termo: 'reminder', traducao: 'lembrete, cobrança' },
          { termo: 'Best regards / Kind regards', traducao: 'Atenciosamente (neutro)' },
          { termo: 'Yours sincerely / Yours faithfully', traducao: 'Atenciosamente (Reino Unido: com nome / sem nome)' },
          { termo: 'CC / BCC', traducao: 'com cópia / com cópia oculta' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Dear Sir or ___,', resposta: 'Madam' },
          { tipo: 'lacuna', frase: 'Please find ___ our quote.', resposta: 'attached' },
          { tipo: 'lacuna', frase: 'I look forward to ___ from you. (hear)', resposta: 'hearing' },
          { tipo: 'lacuna', frase: 'I would be ___ if you could send the invoice. (grato)', resposta: 'grateful' },
          { tipo: 'escolha', pergunta: 'Começou com "Dear Sir or Madam". No Reino Unido, fecha com…', opcoes: ['Yours sincerely', 'Yours faithfully', 'Cheers'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Tratamento padrão para uma mulher no e-mail profissional:', opcoes: ['Mrs.', 'Miss', 'Ms.'], correta: 2 },
          { tipo: 'escolha', pergunta: '"quote" × "purchase order":', opcoes: ['quote é o pedido firme; PO é o orçamento', 'quote é o orçamento; PO é o pedido firme'], correta: 1 },
          { tipo: 'traducao', origem: 'Conforme combinado, segue em anexo o orçamento.', resposta: ['As agreed, please find attached the quote.', 'As agreed, please find the quote attached.', 'As agreed, I have attached the quote.', 'As discussed, please find attached the quote.'] },
        ],
      },
    ],
  },
  {
    id: 'vocabulario-negocios',
    titulo: 'Vocabulário de negócios e de pecuária leiteira',
    resumo: 'Empresa, finanças, contratos, e a terminologia da caprinocultura em inglês: doe, buck, kidding, dry-off.',
    blocos: [
      {
        tipo: 'vocabulario',
        titulo: 'Empresa e finanças',
        itens: [
          { termo: 'company / business / firm', traducao: 'empresa' },
          { termo: 'LLC / Ltd.', traducao: 'sociedade limitada (EUA / Reino Unido)' },
          { termo: 'CEO / managing director', traducao: 'diretor-executivo (EUA / Reino Unido)' },
          { termo: 'revenue / turnover', traducao: 'faturamento (EUA / Reino Unido)' },
          { termo: 'profit / loss', traducao: 'lucro / prejuízo' },
          { termo: 'margin', traducao: 'margem' },
          { termo: 'costs / overhead', traducao: 'custos / custos fixos' },
          { termo: 'investment / to invest', traducao: 'investimento / investir' },
          { termo: 'loan', traducao: 'empréstimo' },
          { termo: 'tax / sales tax / VAT', traducao: 'imposto / imposto sobre vendas (EUA) / IVA (Reino Unido)' },
          { termo: 'invoice / to invoice', traducao: 'fatura / faturar' },
          { termo: 'contract / to sign / to terminate', traducao: 'contrato / assinar / rescindir' },
          { termo: 'liability', traducao: 'responsabilidade legal' },
          { termo: 'supplier / vendor', traducao: 'fornecedor' },
          { termo: 'competitor / competition', traducao: 'concorrente / concorrência' },
          { termo: 'market share', traducao: 'participação de mercado' },
          { termo: 'supply and demand', traducao: 'oferta e demanda' },
          { termo: 'subscription', traducao: 'assinatura (recorrente)' },
          { termo: 'KPI / metrics', traducao: 'indicador / métricas' },
          { termo: 'break even', traducao: 'atingir o ponto de equilíbrio' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Caprinocultura e pecuária',
        itens: [
          { termo: 'dairy goat farming', traducao: 'caprinocultura leiteira' },
          { termo: 'doe / buck / kid', traducao: 'cabra / bode / cabrito' },
          { termo: 'wether', traducao: 'bode castrado' },
          { termo: 'ewe / ram / lamb', traducao: 'ovelha / carneiro / cordeiro' },
          { termo: 'cow / bull / calf / heifer', traducao: 'vaca / touro / bezerro / novilha' },
          { termo: 'breed', traducao: 'raça', nota: 'Saanen, Alpine, Nubian, LaMancha' },
          { termo: 'lactation', traducao: 'lactação' },
          { termo: 'milk yield', traducao: 'produção de leite', exemplo: 'yield per doe per lactation', exemploTraducao: 'produção por cabra por lactação' },
          { termo: 'breeding / to breed', traducao: 'reprodução, melhoramento / cruzar, criar' },
          { termo: 'artificial insemination (AI)', traducao: 'inseminação artificial', nota: 'cuidado: AI também é inteligência artificial' },
          { termo: 'bred / pregnant', traducao: 'coberta / prenhe' },
          { termo: 'kidding', traducao: 'parto (de cabras)', nota: 'lambing para ovelhas, calving para vacas' },
          { termo: 'to dry off / dry period', traducao: 'secar / período seco' },
          { termo: 'feed / concentrate / forage', traducao: 'alimentação / concentrado / volumoso' },
          { termo: 'weighing / body weight', traducao: 'pesagem / peso vivo' },
          { termo: 'ear tag', traducao: 'brinco de identificação' },
          { termo: 'somatic cell count (SCC)', traducao: 'contagem de células somáticas (CCS)' },
          { termo: 'deworming / vaccination', traducao: 'vermifugação / vacinação' },
          { termo: 'mastitis', traducao: 'mastite' },
          { termo: 'herd management', traducao: 'gestão de rebanho' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Our company develops herd management software.', traducao: 'Nossa empresa desenvolve software de gestão de rebanho.' },
          { texto: 'Revenue grew by 20 percent last year.', traducao: 'O faturamento cresceu 20% no ano passado.' },
          { texto: 'Average yield is around 800 liters per doe per lactation.', traducao: 'A produção média é de cerca de 800 litros por cabra por lactação.' },
          { texto: 'Most of our does kid in the spring.', traducao: 'A maioria das nossas cabras pare na primavera.' },
          { texto: 'We offer the software as a monthly subscription.', traducao: 'Oferecemos o software por assinatura mensal.' },
          { texto: 'All prices are exclusive of sales tax.', traducao: 'Todos os preços não incluem o imposto sobre vendas.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"revenue" =', opcoes: ['lucro', 'faturamento', 'custo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"doe" é…', opcoes: ['o bode', 'a cabra', 'o cabrito'], correta: 1 },
          { tipo: 'escolha', pergunta: '"kidding season" é…', opcoes: ['temporada de brincadeiras', 'época de parição das cabras'], correta: 1 },
          { tipo: 'escolha', pergunta: '"to dry off a doe" =', opcoes: ['secar a cabra', 'dar banho na cabra', 'vender a cabra'], correta: 0 },
          { tipo: 'lacuna', frase: 'We signed a ___ with the supplier. (contrato)', resposta: 'contract' },
          { tipo: 'lacuna', frase: 'Milk ___ went up by ten percent. (produção)', resposta: 'yield' },
          { tipo: 'lacuna', frase: 'Every animal has an ear ___.', resposta: 'tag' },
          { tipo: 'traducao', origem: 'Oferecemos o software por assinatura.', resposta: ['We offer the software as a subscription.', 'We offer the software on a subscription basis.', 'We offer the software by subscription.'] },
        ],
      },
    ],
  },
  {
    id: 'apresentar-produto',
    titulo: 'Apresentar um produto',
    resumo: 'O pitch em inglês: problema, solução, benefício, prova e chamada — com o SeabraApp como caso.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura que funciona: **problem → solution → benefit → proof → call to action**. Fale de **benefits** (o que o cliente ganha), não só de **features** (funções). Verbos úteis: *help, save, cut, boost, streamline, prevent*. Números concretos convencem mais que adjetivos.

O público americano gosta de entusiasmo contido e de histórias curtas; o britânico desconfia de exagero — *quite good* lá é elogio moderado. Perguntas que virão: *How much does it cost? How long does onboarding take? Where is the data stored? What happens if I cancel? Do you have customers in the US?*`,
      },
      {
        tipo: 'texto',
        titulo: 'Pitch de 90 segundos',
        markdown: `> A lot of goat farmers still manage their herds with a notebook and a spreadsheet. That takes time — and key information gets lost: when was this doe bred? Which one is giving less milk than last week?
>
> SeabraApp is a herd management app for dairy goats. Farmers record kiddings, milk yields, weights and treatments right in the barn, on their phone — even with no signal.
>
> The benefit: you spot problems days earlier, you save hours of paperwork every week, and you have every record at hand for the creamery and the vet.
>
> More than 200 farms in Brazil already use it. I'd love to show you a 20-minute demo — when would work for you?`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'benefit / feature', traducao: 'benefício / funcionalidade' },
          { termo: 'to help / to enable', traducao: 'ajudar / possibilitar' },
          { termo: 'to save (time, money)', traducao: 'economizar' },
          { termo: 'to cut / to reduce', traducao: 'cortar / reduzir' },
          { termo: 'to boost', traducao: 'aumentar, impulsionar' },
          { termo: 'to streamline', traducao: 'simplificar, otimizar (processos)' },
          { termo: 'to prevent', traducao: 'evitar, prevenir' },
          { termo: 'onboarding', traducao: 'implantação, integração inicial' },
          { termo: 'training', traducao: 'treinamento' },
          { termo: 'demo', traducao: 'demonstração' },
          { termo: 'case study / testimonial', traducao: 'estudo de caso / depoimento' },
          { termo: 'value proposition', traducao: 'proposta de valor' },
          { termo: 'user-friendly', traducao: 'fácil de usar' },
          { termo: 'offline', traducao: 'sem conexão' },
          { termo: 'data security', traducao: 'segurança dos dados' },
          { termo: 'at hand', traducao: 'à mão' },
          { termo: 'When would work for you?', traducao: 'Quando fica bom para você?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'The app ___ you to record data offline. (possibilita)', resposta: 'enables' },
          { tipo: 'lacuna', frase: 'You ___ hours of paperwork every week. (economiza)', resposta: 'save' },
          { tipo: 'lacuna', frase: 'I’d love to show you a 20-minute ___.', resposta: 'demo' },
          { tipo: 'escolha', pergunta: 'A ordem recomendada do pitch:', opcoes: ['Features → price → company', 'Problem → solution → benefit → proof → call to action', 'Company history → features → price'], correta: 1 },
          { tipo: 'escolha', pergunta: '"feature" × "benefit":', opcoes: ['feature é o que o cliente ganha; benefit é o que o produto faz', 'feature é o que o produto faz; benefit é o que o cliente ganha'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz que seu produto é "quite good". Ele quis dizer…', opcoes: ['excelente', 'razoável, bom com ressalvas'], correta: 1 },
          { tipo: 'traducao', origem: 'Quando fica bom para você?', resposta: ['When would work for you?', 'When works for you?', 'When is good for you?', 'When would suit you?'] },
          { tipo: 'ditado', texto: 'More than two hundred farms already use it.', traducao: 'Mais de duzentas fazendas já o utilizam.' },
        ],
      },
    ],
  },
];

/* ─────────────────── Compreensão de conteúdos autênticos ────────────────── */

const autenticos: Licao[] = [
  {
    id: 'noticias-manchetes',
    titulo: 'Notícias e manchetes',
    resumo: 'O "headlinese" (presente para o passado, infinitivo para o futuro), o vocabulário do noticiário e "reportedly".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Manchetes inglesas têm gramática própria, o **headlinese**:
- **presente simples para o passado**: *Farmer Wins Award* (= ganhou);
- **infinitivo para o futuro**: *Governor to Visit Farm* (= vai visitar);
- **particípio para a passiva**: *Three Injured in Crash* (= foram feridos);
- **sem artigos nem "to be"**, e palavras curtas e fortes: *soar* (disparar), *slump* (despencar), *slash* (cortar), *hike* (aumento), *bid* (tentativa), *vow* (prometer), *probe* (investigação), *row* (briga, no Reino Unido).

No texto da notícia, a distância da fonte aparece em **according to**, **reportedly** (segundo informações), **allegedly** (supostamente, para acusações) e **said / told reporters**.`,
      },
      {
        tipo: 'texto',
        titulo: 'Uma notícia (texto próprio, no estilo da imprensa)',
        markdown: `> **Goat Milk Demand Soars as Farm Numbers Slump**
>
> Demand for goat milk products **rose** by about 8 percent last year, **according to** an industry group. At the same time, the number of dairy goat farms **continued to fall**, with many small operations **reportedly** struggling to find workers. Several processors **have been forced** to import milk to meet demand, the group **said** on Tuesday. A spokesperson **called for** more support for new farmers. The Department of Agriculture **said** it **would review** a program aimed at small farms.

A demanda por produtos de leite de cabra cresceu cerca de 8% no ano passado, segundo uma associação do setor. Ao mesmo tempo, o número de fazendas continuou caindo, com muitas propriedades pequenas, segundo informações, com dificuldade para encontrar trabalhadores. Vários processadores foram obrigados a importar leite, disse a associação na terça. Um porta-voz pediu mais apoio a novos produtores. O Departamento de Agricultura disse que revisaria um programa voltado a pequenas propriedades.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'headline', traducao: 'manchete' },
          { termo: 'according to', traducao: 'segundo, de acordo com' },
          { termo: 'reportedly', traducao: 'segundo informações' },
          { termo: 'allegedly', traducao: 'supostamente (acusação)' },
          { termo: 'spokesperson', traducao: 'porta-voz' },
          { termo: 'to call for', traducao: 'pedir, exigir' },
          { termo: 'to announce', traducao: 'anunciar' },
          { termo: 'to warn', traducao: 'alertar' },
          { termo: 'to soar / to slump', traducao: 'disparar / despencar' },
          { termo: 'to rise / to fall', traducao: 'subir / cair', nota: 'by 8% = em 8%; to 20% = para 20%' },
          { termo: 'hike', traducao: 'aumento (de preço, taxa)' },
          { termo: 'to struggle', traducao: 'ter dificuldade' },
          { termo: 'to be forced to', traducao: 'ser obrigado a' },
          { termo: 'processor', traducao: 'processador, indústria de beneficiamento' },
          { termo: 'poll / survey', traducao: 'pesquisa de opinião / levantamento' },
          { termo: 'probe', traducao: 'investigação' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Manchete "Farmer Wins National Award" significa que o produtor…', opcoes: ['está ganhando agora', 'ganhou', 'vai ganhar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Governor to Visit Local Farm" significa que o governador…', opcoes: ['visitou', 'vai visitar', 'visita sempre'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Demand rose by 8 percent" =', opcoes: ['A demanda subiu para 8%', 'A demanda subiu 8%'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quem pediu mais apoio aos novos produtores?', opcoes: ['o Departamento de Agricultura', 'um porta-voz da associação', 'os processadores'], correta: 1 },
          { tipo: 'lacuna', frase: '___ to the report, prices will rise. (segundo)', resposta: 'According' },
          { tipo: 'lacuna', frase: 'Prices ___ last year. (soar, passado)', resposta: 'soared' },
          { tipo: 'traducao', origem: 'O ministério alerta para um aumento de preços.', resposta: ['The ministry warns of a price increase.', 'The ministry warns of rising prices.', 'The ministry is warning of a price increase.', 'The ministry warns of a price hike.'] },
          { tipo: 'ditado', texto: 'Demand rose by about eight percent last year.', traducao: 'A demanda cresceu cerca de 8% no ano passado.' },
        ],
      },
    ],
  },
  {
    id: 'entrevistas-ditado',
    titulo: 'Entrevistas e fala espontânea',
    resumo: 'gonna, wanna, kinda, y’know: a fala real, com ditados longos e marcas de oralidade.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês falado funde palavras: **gonna** (going to), **wanna** (want to), **gotta** (got to / have to), **kinda** (kind of), **lemme** (let me), **dunno** (don't know), **y'know**, **'cause** (because). E enche as frases com **like**, **I mean**, **sort of**, **you know**, **basically**, **actually**. Entender o essencial apesar do ruído é a habilidade do B2.

Estratégia: ouça buscando verbos e substantivos; os preenchedores são tempero. Nos ditados abaixo, escreva a forma que ouvir — se escrever *going to* onde se ouviu *gonna*, use "minha resposta também vale".`,
      },
      {
        tipo: 'frases',
        titulo: 'Marcas de oralidade',
        itens: [
          { texto: 'So, basically, what we did was, like, start small.', traducao: 'Então, basicamente, o que a gente fez foi começar pequeno.' },
          { texto: 'I dunno, it’s kinda hard to explain.', traducao: 'Sei lá, é meio difícil de explicar.' },
          { texto: 'We’re gonna need a bigger barn.', traducao: 'Vamos precisar de um estábulo maior.' },
          { texto: 'I mean, it wasn’t easy, y’know?', traducao: 'Quer dizer, não foi fácil, sabe?' },
          { texto: 'Lemme think about it.', traducao: 'Deixa eu pensar.' },
          { texto: 'I gotta go, talk to you later.', traducao: 'Tenho que ir, falo com você depois.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'So we started about ten years ago with thirty goats, really small.', traducao: 'Então começamos há uns dez anos com trinta cabras, bem pequeno.' },
          { tipo: 'ditado', texto: 'Honestly, it was pretty tough at the beginning, I have to say.', traducao: 'Sinceramente, foi bem difícil no começo, tenho que dizer.' },
          { tipo: 'ditado', texto: 'Now we have over three hundred animals, and without the app I wouldn’t know who’s who.', traducao: 'Agora temos mais de trezentos animais, e sem o app eu não saberia quem é quem.' },
          { tipo: 'ditado', texto: 'The creamery just doesn’t pay as much as it used to.', traducao: 'O laticínio simplesmente não paga mais o quanto pagava.' },
          { tipo: 'escolha', pergunta: 'Ouça o terceiro ditado. Quantos animais a produtora tem hoje?', opcoes: ['30', 'mais de 300', '3.000'], correta: 1 },
          { tipo: 'escolha', pergunta: '"We’re gonna need a bigger barn" — "gonna" é…', opcoes: ['going to', 'got to', 'want to'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'textos-tecnicos',
    titulo: 'Textos técnicos e instruções',
    resumo: 'Manuais, fichas técnicas e contratos: imperativo, "shall", "prior to" e "failure to comply".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Textos técnicos em inglês são diretos. Três chaves:

1. **Instruções** no imperativo: *Clean the unit after each use. Do not exceed 60 °C.* Rótulos de risco em escala: **Note** (observação), **Caution** (cuidado, risco ao equipamento), **Warning** (risco a pessoas), **Danger** (risco grave).
2. **Obrigação** em especificações e contratos: **must** (é obrigatório), **should** (recomendado), **shall** (obrigação contratual, jurídico), **may** (permitido).
3. **Vocabulário formal**: *prior to* (antes de), *in accordance with* (conforme), *ensure* (garantir), *refer to* (consultar), *failure to comply* (o descumprimento), *void* (anular).`,
      },
      {
        tipo: 'texto',
        titulo: 'Trecho de manual (texto próprio)',
        markdown: `> **4.3 Cleaning the Milking System**
>
> After each milking, rinse the system with the supplied cleaning solution. Water temperature must not exceed 60 °C (140 °F). Inspect the teat cups weekly for wear and replace them if necessary (see Section 6.1).
>
> **WARNING:** Disconnect the unit from the power supply prior to any maintenance. Failure to comply will void the warranty.

4.3 Limpeza do sistema de ordenha. Após cada ordenha, enxágue o sistema com a solução de limpeza fornecida. A temperatura da água não deve exceder 60 °C (140 °F). Inspecione as teteiras semanalmente quanto a desgaste e substitua-as se necessário (ver seção 6.1). ADVERTÊNCIA: desconecte a unidade da rede elétrica antes de qualquer manutenção. O descumprimento anulará a garantia.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'user manual / instructions', traducao: 'manual do usuário / instruções' },
          { termo: 'data sheet / spec sheet', traducao: 'ficha técnica' },
          { termo: 'regulation / standard', traducao: 'regulamento / norma' },
          { termo: 'in accordance with', traducao: 'conforme, de acordo com' },
          { termo: 'maintenance', traducao: 'manutenção' },
          { termo: 'setup / installation', traducao: 'configuração / instalação' },
          { termo: 'note / caution / warning', traducao: 'observação / cuidado / advertência' },
          { termo: 'to exceed', traducao: 'exceder' },
          { termo: 'to replace', traducao: 'substituir' },
          { termo: 'wear / damage', traducao: 'desgaste / dano' },
          { termo: 'if necessary / as needed', traducao: 'se necessário / conforme a necessidade' },
          { termo: 'prior to', traducao: 'antes de' },
          { termo: 'failure to comply', traducao: 'descumprimento' },
          { termo: 'to void (a warranty)', traducao: 'anular (a garantia)' },
          { termo: 'to unplug / to disconnect', traducao: 'desligar da tomada / desconectar' },
          { termo: 'section', traducao: 'seção' },
          { termo: 'requirements', traducao: 'requisitos' },
          { termo: 'shall', traducao: 'deverá (obrigação contratual)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Num contrato, "The supplier shall deliver within 30 days" expressa…', opcoes: ['uma sugestão', 'uma obrigação contratual', 'uma previsão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Failure to comply will void the warranty" =', opcoes: ['Falhas serão cobertas pela garantia', 'O descumprimento anulará a garantia'], correta: 1 },
          { tipo: 'escolha', pergunta: 'No manual, o que anula a garantia?', opcoes: ['água a 60 °C', 'não desconectar antes da manutenção', 'trocar as teteiras'], correta: 1 },
          { tipo: 'lacuna', frase: 'Water temperature must not ___ 60 °C.', resposta: 'exceed' },
          { tipo: 'lacuna', frase: 'Replace the parts if ___.', resposta: 'necessary' },
          { tipo: 'lacuna', frase: 'Disconnect the unit ___ to any maintenance. (antes de)', resposta: 'prior' },
          { tipo: 'traducao', origem: 'De acordo com a norma', resposta: ['in accordance with the standard', 'according to the standard', 'in accordance with the regulation', 'In accordance with the standard'] },
          { tipo: 'ditado', texto: 'Disconnect the unit from the power supply before any maintenance.', traducao: 'Desconecte a unidade da rede elétrica antes de qualquer manutenção.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Escrita avançada ─────────────────────────── */

const escritaAvancada: Licao[] = [
  {
    id: 'texto-argumentativo',
    titulo: 'O texto argumentativo (essay)',
    resumo: 'Thesis statement, topic sentences, parágrafo de contra-argumento e conclusão: o formato de prova e de artigo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **argumentative essay** em inglês tem forma rígida, e o leitor espera por ela:

1. **Introduction**: um gancho (*hook*), o contexto e a **thesis statement** — uma frase que diz exatamente o que você vai defender. *While digital herd management requires an upfront investment, it pays off even for small farms.*
2. **Body paragraphs**: cada um começa com uma **topic sentence** (a ideia do parágrafo), seguida de explicação e exemplo.
3. **Counterargument paragraph**: apresenta a objeção mais forte e a responde.
4. **Conclusion**: retoma a tese com outras palavras e fecha — sem argumento novo.

O ensaio anglo-saxão diz a tese **no começo**. O texto brasileiro, que chega à conclusão no fim, soa sem rumo para um leitor americano.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo compacto (~200 palavras)',
        markdown: `> **Digital Herd Management: Worth It for Small Farms?**
>
> More and more dairy goat farms are tracking their herds with apps. While large operations rarely question the value of this shift, small farms face a real dilemma. This essay argues that, despite the upfront cost, digital herd management pays off even for small farms.
>
> First, early detection saves money. When each doe's daily yield is visible on a phone, a drop in production — often the first sign of illness — is noticed within a day rather than a week.
>
> Second, buyers increasingly demand full traceability. Keeping complete treatment records by hand is time-consuming and error-prone; software makes it routine.
>
> Critics point out that subscription fees weigh more heavily on a thirty-goat farm than on a three-hundred-goat operation. This is true. However, on a small farm a single person does everything, so each hour saved on paperwork goes straight back into caring for the animals.
>
> In short, the investment is justified for farms of any size, provided the tool is simple to use and works offline.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'essay', traducao: 'dissertação, ensaio' },
          { termo: 'hook', traducao: 'gancho (abertura)' },
          { termo: 'thesis statement', traducao: 'frase-tese' },
          { termo: 'topic sentence', traducao: 'frase-tópico (abre o parágrafo)' },
          { termo: 'body paragraph', traducao: 'parágrafo de desenvolvimento' },
          { termo: 'this essay argues that', traducao: 'este texto defende que' },
          { termo: 'first / second / finally', traducao: 'primeiro / segundo / por fim' },
          { termo: 'critics point out that', traducao: 'os críticos apontam que' },
          { termo: 'upfront cost', traducao: 'custo inicial' },
          { termo: 'to pay off', traducao: 'compensar, valer o investimento' },
          { termo: 'error-prone', traducao: 'sujeito a erros' },
          { termo: 'provided (that)', traducao: 'desde que' },
          { termo: 'in short / to sum up', traducao: 'em suma / resumindo' },
          { termo: 'to weigh heavily on', traducao: 'pesar muito sobre' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No essay em inglês, a tese aparece…', opcoes: ['só na conclusão', 'na introdução, numa frase clara', 'em nenhum lugar explícito'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A "topic sentence" fica…', opcoes: ['no fim do texto', 'no início de cada parágrafo', 'no título'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A conclusão…', opcoes: ['traz um argumento novo', 'retoma a tese e fecha', 'repete a introdução palavra por palavra'], correta: 1 },
          { tipo: 'lacuna', frase: 'This essay ___ that the investment pays off. (defende)', resposta: 'argues' },
          { tipo: 'lacuna', frase: 'It is justified, ___ the tool is simple to use. (desde que)', resposta: ['provided', 'provided that', 'as long as'] },
          { tipo: 'lacuna', frase: 'Critics point ___ that the costs are high.', resposta: 'out' },
          { tipo: 'ordenar', resposta: 'However the benefits clearly outweigh the costs', traducao: 'No entanto, os benefícios superam claramente os custos' },
          { tipo: 'traducao', origem: 'Em suma, o investimento vale a pena.', resposta: ['In short, the investment is worth it.', 'In short, the investment pays off.', 'To sum up, the investment is worth it.', 'In short, the investment is worthwhile.'] },
        ],
      },
    ],
  },
  {
    id: 'resumo-relatorio',
    titulo: 'Resumo e relatório',
    resumo: 'Summary em presente e com paráfrase; report com títulos: purpose, findings, recommendations.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Summary** (resumo de texto): presente, terceira pessoa, neutro, **com suas palavras** — copiar frases é plágio. Abre com a fonte: *In "…", published in…, the author argues that…* Verbos: *argue, explain, point out, highlight, conclude*. Um quarto do tamanho original.

**Report** (relatório): objetivo, com **títulos**, frases curtas e passado para o que aconteceu. Estrutura clássica: **Purpose** → **Background** → **Findings** → **Recommendations** / **Next steps**. Em relatório americano, *bullet points* são bem-vindos.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo de relatório de visita',
        markdown: `> **Site Visit Report – Walker Farm, Vermont – 09/12/2026**
>
> **Purpose:** To present the herd management app at Dr. Walker's invitation.
>
> **Findings:**
> - The farm has 280 dairy goats (Alpine and Saanen), milked twice a day.
> - The app was demonstrated with three use cases: recording milk yield, logging a treatment and reading the lactation curve.
> - Dr. Walker was interested but pointed out that cell coverage in the barn is poor.
> - Offline mode was described as essential.
>
> **Next steps:**
> - Set up a trial account by 09/19.
> - Video training session on 09/22.
> - Feedback expected by 10/15.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'summary / to summarize', traducao: 'resumo / resumir' },
          { termo: 'report', traducao: 'relatório' },
          { termo: 'to paraphrase', traducao: 'parafrasear' },
          { termo: 'plagiarism', traducao: 'plágio' },
          { termo: 'to highlight / to point out', traducao: 'destacar / apontar' },
          { termo: 'to conclude that', traducao: 'concluir que' },
          { termo: 'purpose', traducao: 'objetivo, propósito' },
          { termo: 'background', traducao: 'contexto' },
          { termo: 'findings', traducao: 'constatações, resultados' },
          { termo: 'recommendations', traducao: 'recomendações' },
          { termo: 'next steps / action items', traducao: 'próximos passos' },
          { termo: 'site visit', traducao: 'visita técnica' },
          { termo: 'trial account', traducao: 'conta de teste' },
          { termo: 'feedback', traducao: 'retorno, avaliação', nota: 'incontável' },
          { termo: 'bullet point', traducao: 'marcador de lista' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Tempo verbal do summary:', opcoes: ['past simple', 'present simple', 'future'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num summary, copiar frases do original é…', opcoes: ['recomendado', 'plágio: é preciso parafrasear'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Findings" num relatório são…', opcoes: ['as recomendações', 'as constatações', 'as fontes'], correta: 1 },
          { tipo: 'lacuna', frase: 'The author ___ that animal welfare matters. (argue, presente)', resposta: 'argues' },
          { tipo: 'lacuna', frase: 'Dr. Walker pointed ___ that coverage is poor.', resposta: 'out' },
          { tipo: 'lacuna', frase: 'Offline mode was described ___ essential.', resposta: 'as' },
          { tipo: 'traducao', origem: 'A visita começou às 9 horas.', resposta: ['The visit started at 9 a.m.', 'The visit began at 9 a.m.', 'The visit started at nine.', 'The visit began at nine o’clock.', 'The visit started at 9.'] },
          { tipo: 'ditado', texto: 'Offline mode was described as essential.', traducao: 'O modo offline foi descrito como essencial.' },
        ],
      },
    ],
  },
  {
    id: 'conectores-coesao',
    titulo: 'Conectores avançados e coesão',
    resumo: 'not only… but also, the more… the more, "which" retomando a frase inteira, e os conectores formais.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Coesão é o que transforma uma lista de frases num texto.

**Pares**: *not only… but also* (não só… mas também), *both… and* (tanto… quanto), *either… or* (ou… ou), *neither… nor* (nem… nem), *the more… the more / the better* (quanto mais… mais).

**Retomada**: **which** pode retomar uma oração inteira: *Prices went up, **which** worried farmers.* (o que preocupou). *This*, *that*, *the former / the latter* (o primeiro / o último) evitam repetir.

**Conectores formais**: *moreover, furthermore, in addition* (além disso); *consequently, as a result, therefore* (por consequência); *nevertheless, nonetheless* (ainda assim); *whereas* (enquanto que); *otherwise* (senão); *provided that, as long as* (desde que); *by + -ing* (por meio de): *We save time **by recording** data on site.*`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'The earlier you spot a problem, the cheaper the treatment.', traducao: 'Quanto antes você identifica um problema, mais barato é o tratamento.' },
          { texto: 'The app is not only simple but also available offline.', traducao: 'O app não só é simples como também funciona offline.' },
          { texto: 'We supply both small and large farms.', traducao: 'Fornecemos tanto para fazendas pequenas quanto grandes.' },
          { texto: 'Neither the manager nor the staff knew about it.', traducao: 'Nem o gerente nem a equipe sabiam disso.' },
          { texto: 'Feed prices went up, which forced many farms to cut costs.', traducao: 'O preço da ração subiu, o que obrigou muitas fazendas a cortar custos.' },
          { texto: 'We save time by recording the data right in the barn.', traducao: 'Economizamos tempo registrando os dados direto no estábulo.' },
          { texto: 'The software is expensive. Nevertheless, it pays off within a year.', traducao: 'O software é caro. Ainda assim, se paga em um ano.' },
          { texto: 'You need to register by Friday; otherwise, you’ll miss the discount.', traducao: 'Você precisa se inscrever até sexta; senão, perde o desconto.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'The ___ you practice, the better you get.', resposta: 'more' },
          { tipo: 'lacuna', frase: 'Not only cheap, ___ also reliable.', resposta: 'but' },
          { tipo: 'lacuna', frase: 'Neither the manager ___ the staff was informed.', resposta: 'nor' },
          { tipo: 'lacuna', frase: 'Prices rose, ___ worried the farmers. (o que)', resposta: 'which' },
          { tipo: 'lacuna', frase: 'We save time ___ recording data on site. (por meio de)', resposta: 'by' },
          { tipo: 'lacuna', frase: 'Hurry up; ___, we’ll miss the train. (senão)', resposta: 'otherwise' },
          { tipo: 'escolha', pergunta: '"Nevertheless" =', opcoes: ['nunca mais', 'ainda assim', 'além disso'], correta: 1 },
          { tipo: 'ordenar', resposta: 'The more data we have the better we decide', traducao: 'Quanto mais dados temos, melhor decidimos' },
        ],
      },
    ],
  },
];

export const b2: ConteudoNivel<'b2'> = {
  'fluencia-funcional': fluenciaFuncional,
  debates,
  profissional,
  autenticos,
  'escrita-avancada': escritaAvancada,
};
