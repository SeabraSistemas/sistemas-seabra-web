import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────── Conversação independente ─────────────────────── */

const conversacaoIndependente: Licao[] = [
  {
    id: 'experiencias',
    titulo: 'Falar de experiências',
    resumo: '"Have you ever…?" seguido do past simple, "used to" e "get used to", e o falso amigo "eventually".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Conversa sobre experiências tem um padrão fixo em inglês: abre-se com **present perfect** (sem data) e, quando a data aparece, passa-se ao **past simple**.

*Have you ever been to Wisconsin? — Yes, I have. — When did you go? — I went in 2018. — What was it like? — It was amazing.*

Hábitos que acabaram: **used to** + verbo — *I used to work in a bank* (eu trabalhava num banco, não trabalho mais). Não confunda com **be used to / get used to** + substantivo ou -ing, que é "estar / ficar acostumado": *I'm used to the cold. I got used to waking up early.*

Falso amigo clássico: **eventually** = "no fim, finalmente". "Eventualmente" em português é *occasionally*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'experience', traducao: 'experiência', exemplo: 'I have a lot of experience with goats.', exemploTraducao: 'Tenho muita experiência com cabras.' },
          { termo: 'ever / never', traducao: 'alguma vez / nunca' },
          { termo: 'back then', traducao: 'naquela época' },
          { termo: 'recently / the other day', traducao: 'recentemente / outro dia' },
          { termo: 'unforgettable', traducao: 'inesquecível' },
          { termo: 'exhausting', traducao: 'exaustivo' },
          { termo: 'disappointing / disappointed', traducao: 'decepcionante / decepcionado', nota: '-ing descreve a coisa, -ed descreve a pessoa' },
          { termo: 'impressive', traducao: 'impressionante' },
          { termo: 'trip', traducao: 'viagem', nota: 'travel é o verbo; trip e journey são substantivos' },
          { termo: 'abroad', traducao: 'no exterior', exemplo: 'Have you ever worked abroad?', exemploTraducao: 'Você já trabalhou no exterior?' },
          { termo: 'to set up / to start (a company)', traducao: 'abrir, fundar (empresa)', exemplo: 'I started my company in 2011.', exemploTraducao: 'Abri minha empresa em 2011.' },
          { termo: 'used to', traducao: 'costumava (e não faz mais)' },
          { termo: 'to get used to', traducao: 'acostumar-se com' },
          { termo: 'eventually', traducao: 'no fim, finalmente', nota: 'falso amigo: eventualmente = occasionally' },
          { termo: 'to learn from', traducao: 'aprender com', exemplo: 'I learned a lot from that mistake.', exemploTraducao: 'Aprendi muito com aquele erro.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira de laticínios',
        falas: [
          { quem: 'Dr. Walker', texto: 'Have you ever been to the World Dairy Expo before?', traducao: 'Você já tinha vindo à World Dairy Expo?' },
          { quem: 'Felipe', texto: 'Yes, twice. The first time was in 2018 — it was impressive, but exhausting.', traducao: 'Sim, duas vezes. A primeira foi em 2018: foi impressionante, mas exaustivo.' },
          { quem: 'Dr. Walker', texto: 'Why exhausting?', traducao: 'Por que exaustivo?' },
          { quem: 'Felipe', texto: 'Back then I could barely speak English. At first I just listened, and eventually I started talking.', traducao: 'Naquela época eu mal falava inglês. No começo só escutei e, no fim, comecei a falar.' },
          { quem: 'Dr. Walker', texto: 'And what did you learn from that?', traducao: 'E o que você aprendeu com aquilo?' },
          { quem: 'Felipe', texto: 'That you have to learn the language first. That’s why I’m here now!', traducao: 'Que é preciso aprender a língua antes. É por isso que estou aqui agora!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Have you ___ worked abroad? (alguma vez)', resposta: 'ever' },
          { tipo: 'lacuna', frase: 'Yes, I have. I ___ to Canada in 2019. (go)', resposta: 'went' },
          { tipo: 'lacuna', frase: 'I ___ to work in a bank, but now I have a farm.', resposta: 'used' },
          { tipo: 'lacuna', frase: 'I’m finally getting used to ___ up early. (wake)', resposta: 'waking' },
          { tipo: 'escolha', pergunta: '"Eventually he agreed" =', opcoes: ['Eventualmente ele concordou', 'No fim, ele concordou'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I’m used to the cold" =', opcoes: ['Eu costumava sentir frio', 'Estou acostumado com o frio'], correta: 1 },
          { tipo: 'traducao', origem: 'Nunca vivi isso.', resposta: ['I’ve never experienced that.', 'I have never experienced that.', 'I’ve never experienced this.'] },
          { tipo: 'ditado', texto: 'Have you ever been to Brazil?', traducao: 'Você já foi ao Brasil?' },
        ],
      },
    ],
  },
  {
    id: 'planos-futuro',
    titulo: 'Planos, intenções e condições',
    resumo: 'Graus de certeza, o first conditional e o erro "when I will arrive".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Escala de certeza para planos: **I'm going to…** (decidido) → **I'm planning to…** → **I'm thinking of + -ing** (estou pensando em) → **I might…** (talvez) → **I'm not sure whether…** (não sei se).

**First conditional**: **if + presente, will + verbo**: *If the weather is good, we'll go hiking.* O presente vem depois de *if*, nunca *will*.

A mesma regra vale para **when, as soon as, before, after, until** falando do futuro — o erro nº 1 do brasileiro, que pensa em "quando eu chegar" e traduz com *will*: ***When I arrive**, I'll call you* (nunca "When I will arrive").

Finalidade: **to** + verbo (*I'm learning English **to** talk to clients*); mais formal, **in order to**; com outro sujeito, **so that**.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to plan / plan', traducao: 'planejar / plano' },
          { termo: 'goal', traducao: 'objetivo, meta' },
          { termo: 'to be thinking of + -ing', traducao: 'estar pensando em', exemplo: 'I’m thinking of expanding the barn.', exemploTraducao: 'Estou pensando em ampliar o estábulo.' },
          { termo: 'to intend to', traducao: 'pretender', nota: 'formal; "pretend" é fingir!' },
          { termo: 'might / may', traducao: 'talvez, pode ser que' },
          { termo: 'probably / definitely', traducao: 'provavelmente / com certeza', nota: 'posição: I’ll probably come. I probably won’t come.' },
          { termo: 'to decide / to make up one’s mind', traducao: 'decidir / decidir-se' },
          { termo: 'to prepare', traducao: 'preparar' },
          { termo: 'to achieve / to reach', traducao: 'atingir, alcançar', exemplo: 'to achieve a goal', exemploTraducao: 'atingir uma meta' },
          { termo: 'in the future / soon', traducao: 'no futuro / em breve' },
          { termo: 'as soon as', traducao: 'assim que' },
          { termo: 'unless', traducao: 'a menos que (= if not)' },
          { termo: 'whether', traducao: 'se (entre alternativas)' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I’m planning to take the Cambridge exam next year.', traducao: 'Estou planejando fazer a prova de Cambridge ano que vem.' },
          { texto: 'If the weather is good, we’ll go hiking.', traducao: 'Se o tempo estiver bom, vamos fazer trilha.' },
          { texto: 'If we have enough money, we’ll buy a new milking machine.', traducao: 'Se tivermos dinheiro suficiente, compraremos uma ordenhadeira nova.' },
          { texto: 'When I get to the hotel, I’ll call you.', traducao: 'Quando eu chegar ao hotel, te ligo.' },
          { texto: 'I’m learning English to talk to clients in the US.', traducao: 'Estou aprendendo inglês para falar com clientes nos EUA.' },
          { texto: 'I’m not sure whether I’ll go to Canada this summer.', traducao: 'Não sei se vou ao Canadá neste verão.' },
          { texto: 'We won’t make it unless we leave now.', traducao: 'Não vamos conseguir a menos que a gente saia agora.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'If it ___ tomorrow, we’ll stay home. (rain)', resposta: 'rains' },
          { tipo: 'lacuna', frase: 'When I ___ in Boston, I’ll send you a message. (arrive)', resposta: 'arrive' },
          { tipo: 'lacuna', frase: 'I’m thinking of ___ a new barn. (build)', resposta: 'building' },
          { tipo: 'lacuna', frase: 'We won’t finish ___ we work on Saturday. (a menos que)', resposta: 'unless' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['When I will arrive, I call you.', 'When I arrive, I’ll call you.', 'When I arrive, I call you tomorrow.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I intend to expand" =', opcoes: ['Finjo que vou expandir', 'Pretendo expandir'], correta: 1 },
          { tipo: 'traducao', origem: 'Assim que eu chegar, te ligo.', resposta: ['As soon as I arrive, I’ll call you.', 'As soon as I get there, I’ll call you.', 'As soon as I arrive, I will call you.'] },
          { tipo: 'ditado', texto: 'I’ll probably stay in Chicago for two weeks.', traducao: 'Provavelmente vou ficar duas semanas em Chicago.' },
        ],
      },
    ],
  },
  {
    id: 'resolver-problemas',
    titulo: 'Resolver um problema com educação',
    resumo: 'Da escala "Can you…?" a "I was wondering if…", reclamar sem soar rude e a armadilha do "Would you mind…?".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês tem uma escada de cortesia. Quanto maior o pedido ou mais formal a relação, mais alto se sobe:

1. *Can you send it today?*
2. *Could you send it today?*
3. *Would you mind sending it today?*
4. *I was wondering if you could send it today.*

Armadilha: **Would you mind…?** significa "você se importaria?". A resposta "sim, faço" é ***No, not at all*** — "não me importo". Responder "Yes" quer dizer que você se importa.

Reclamar com eficácia: (1) o fato — *I ordered… on March 3rd*; (2) o problema, suavizado com **I'm afraid** — *I'm afraid it hasn't arrived yet*; (3) o pedido — *Could you…?*; (4) o prazo — *by Friday*. **I'm afraid** aqui não é medo: é o "infelizmente" educado.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to complain (about)', traducao: 'reclamar (de)' },
          { termo: 'complaint', traducao: 'reclamação' },
          { termo: 'to sort out / to fix', traducao: 'resolver / consertar', exemplo: 'Can you sort it out?', exemploTraducao: 'Consegue resolver?' },
          { termo: 'order', traducao: 'pedido (compra)', exemplo: 'My order hasn’t arrived.', exemploTraducao: 'Meu pedido não chegou.' },
          { termo: 'delivery / shipping', traducao: 'entrega / envio, frete' },
          { termo: 'invoice / bill', traducao: 'fatura / conta' },
          { termo: 'mistake / error', traducao: 'erro' },
          { termo: 'deadline', traducao: 'prazo final' },
          { termo: 'refund / replacement', traducao: 'reembolso / substituição' },
          { termo: 'to apologize', traducao: 'pedir desculpas', exemplo: 'We apologize for the inconvenience.', exemploTraducao: 'Pedimos desculpas pelo transtorno.' },
          { termo: 'to look into', traducao: 'verificar, investigar', exemplo: 'I’ll look into it.', exemploTraducao: 'Vou verificar.' },
          { termo: 'I’m afraid…', traducao: 'infelizmente… (cortesia)' },
          { termo: 'I’d appreciate it if…', traducao: 'eu agradeceria se…' },
          { termo: 'customer service', traducao: 'atendimento ao cliente' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Ao telefone com o fornecedor',
        falas: [
          { quem: 'Felipe', texto: 'Hi, this is Felipe Seabra. I’m calling about my order from March 3rd.', traducao: 'Olá, aqui é Felipe Seabra. Estou ligando sobre meu pedido de 3 de março.' },
          { quem: 'Agent', texto: 'Let me pull that up… Yes, the milking machine, order number 4471.', traducao: 'Deixe-me abrir aqui… Sim, a ordenhadeira, pedido 4471.' },
          { quem: 'Felipe', texto: 'That’s right. It was supposed to arrive last week, but I’m afraid it still hasn’t.', traducao: 'Isso. Era para ter chegado semana passada, mas infelizmente ainda não chegou.' },
          { quem: 'Agent', texto: 'I’m so sorry. I can see there was a problem with the shipment.', traducao: 'Sinto muito. Vejo que houve um problema no envio.' },
          { quem: 'Felipe', texto: 'I understand, but I really need it. Would you mind checking if it can arrive by Friday?', traducao: 'Entendo, mas preciso muito dela. Você se importaria de verificar se pode chegar até sexta?' },
          { quem: 'Agent', texto: 'Not at all. I’ll look into it right now and email you a confirmation today.', traducao: 'De forma alguma. Vou verificar agora e mando uma confirmação por e-mail hoje.' },
          { quem: 'Felipe', texto: 'Great. And I’d appreciate it if you could refund the shipping cost.', traducao: 'Ótimo. E eu agradeceria se vocês pudessem reembolsar o frete.' },
          { quem: 'Agent', texto: 'Of course. We apologize for the inconvenience.', traducao: 'Claro. Pedimos desculpas pelo transtorno.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ you help me, please? (poderia)', resposta: 'Could' },
          { tipo: 'lacuna', frase: 'Would you mind ___ the door? (open)', resposta: 'opening' },
          { tipo: 'lacuna', frase: 'I’m ___ your order hasn’t shipped yet. (infelizmente)', resposta: 'afraid' },
          { tipo: 'lacuna', frase: 'I’ll look ___ it. (verificar)', resposta: 'into' },
          { tipo: 'escolha', pergunta: '"Would you mind closing the window?" — você fecha com prazer. Responde:', opcoes: ['Yes, I would.', 'No, not at all.', 'Yes, I mind.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A abertura mais eficaz de uma reclamação:', opcoes: ['This is unacceptable!', 'I ordered a lamp on Monday, and I’m afraid…', 'You made a mistake.'], correta: 1 },
          { tipo: 'traducao', origem: 'Meu pedido não chegou.', resposta: ['My order hasn’t arrived.', 'My order has not arrived.', 'My order didn’t arrive.', 'My order hasn’t arrived yet.'] },
          { tipo: 'ditado', texto: 'I was wondering if you could send it by Friday.', traducao: 'Gostaria de saber se vocês poderiam enviar até sexta.' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Narrativas ─────────────────────────────── */

const narrativas: Licao[] = [
  {
    id: 'contar-passado',
    titulo: 'Contar uma história: past simple, continuous e perfect',
    resumo: 'O que aconteceu, o que estava acontecendo e o que já tinha acontecido — os três passados de uma narrativa.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma história em inglês usa três passados:

- **Past simple** — os eventos, na ordem: *I arrived, I met him, we talked.*
- **Past continuous** (*was/were + -ing*) — o pano de fundo, a ação em andamento quando outra aconteceu: *I **was driving** when the phone **rang**.*
- **Past perfect** (*had + particípio*) — o que tinha acontecido **antes** de outro ponto do passado: *When I got to the station, the train **had** already **left**.*

O past continuous é o equivalente do "estava fazendo"; o past perfect, do "tinha feito". O brasileiro costuma usar só o past simple — entende-se, mas a história perde a profundidade.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os três passados',
        cabecalho: ['Tempo', 'Forma', 'Exemplo'],
        linhas: [
          ['past simple', 'verbo + -ed / irregular', 'We met at the expo.'],
          ['past continuous', 'was / were + -ing', 'It was raining when we arrived.'],
          ['past perfect', 'had + particípio', 'I had never seen so many goats before.'],
          ['past perfect continuous', 'had been + -ing', 'We had been waiting for an hour when he called.'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um relato',
        markdown: `> In October 2018 I **flew** to Madison for the first time. I **didn't know** anyone and I **could** barely speak English. On the first day I **was walking** around the expo alone when a farmer from Vermont **started** talking to me. He **had spent** a year in Brazil and **spoke** a little Portuguese. We **talked** about goats for two hours. By the time I **got back** to the hotel, I **had** already **decided** to learn English.

Em outubro de 2018 voei a Madison pela primeira vez. Não conhecia ninguém e mal falava inglês. No primeiro dia eu estava andando sozinho pela feira quando um produtor de Vermont começou a conversar comigo. Ele tinha passado um ano no Brasil e falava um pouco de português. Conversamos sobre cabras por duas horas. Quando voltei ao hotel, já tinha decidido aprender inglês.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ dinner when you called. (have, past continuous)', resposta: 'was having' },
          { tipo: 'lacuna', frase: 'When I arrived, the meeting ___ already started.', resposta: 'had' },
          { tipo: 'lacuna', frase: 'We ___ for two hours. (talk, past simple)', resposta: 'talked' },
          { tipo: 'lacuna', frase: 'They ___ playing soccer when it started to rain.', resposta: 'were' },
          { tipo: 'escolha', pergunta: '"I was driving when the phone rang" — o que estava em andamento?', opcoes: ['o telefone', 'dirigir'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O past perfect marca…', opcoes: ['o futuro', 'o que aconteceu antes de outro ponto do passado', 'hábitos'], correta: 1 },
          { tipo: 'ordenar', resposta: 'When I got home it was already dark', traducao: 'Quando cheguei em casa já estava escuro' },
          { tipo: 'ditado', texto: 'I was walking around the expo when he started talking to me.', traducao: 'Eu estava andando pela feira quando ele começou a falar comigo.' },
        ],
      },
    ],
  },
  {
    id: 'conectores-temporais',
    titulo: 'Conectores de tempo: when, while, until, by the time',
    resumo: 'Ordenar os acontecimentos, "during" × "for", e "finally" × "eventually".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `- **when** — quando: *When I was a kid, we had cows.*
- **while** — enquanto (ações simultâneas, em andamento): *While I was cooking, the kids were playing.*
- **as soon as** — assim que: *As soon as she arrived, we started.*
- **before / after** + oração ou **-ing**: *After milking the goats, we had breakfast.*
- **until** — até (que): *We waited until the rain stopped.*
- **by the time** — quando (e já): *By the time we got there, the store had closed.*
- **since** — desde que: *Since I started learning English, I understand my clients better.*

**during** × **for**: *during* + nome de evento ou período (*during the meeting*); *for* + duração (*for two hours*). "During two hours" está errado.

**finally** / **at last** = finalmente, depois de espera; **eventually** = no fim das contas (depois de um processo); **in the end** = no final.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'When I was a kid, we had cows.', traducao: 'Quando eu era criança, tínhamos vacas.' },
          { texto: 'While I was milking, my wife was making cheese.', traducao: 'Enquanto eu ordenhava, minha esposa fazia queijo.' },
          { texto: 'After milking the goats, we had breakfast.', traducao: 'Depois de ordenhar as cabras, tomamos café.' },
          { texto: 'Before you leave, please lock the door.', traducao: 'Antes de sair, tranque a porta, por favor.' },
          { texto: 'We waited until the rain stopped.', traducao: 'Esperamos até a chuva parar.' },
          { texto: 'By the time we got there, the store had closed.', traducao: 'Quando chegamos, a loja já tinha fechado.' },
          { texto: 'I fell asleep during the movie.', traducao: 'Dormi durante o filme.' },
          { texto: 'We finally found a solution.', traducao: 'Finalmente encontramos uma solução.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ I was cooking, the phone rang. (enquanto)', resposta: 'While' },
          { tipo: 'lacuna', frase: 'We waited ___ the bus came. (até)', resposta: 'until' },
          { tipo: 'lacuna', frase: 'I lived there ___ two years.', resposta: 'for' },
          { tipo: 'lacuna', frase: 'She called me ___ the meeting.', resposta: 'during' },
          { tipo: 'lacuna', frase: 'After ___ breakfast, we went to the barn. (have)', resposta: 'having' },
          { tipo: 'escolha', pergunta: '"By the time I arrived, they had left" =', opcoes: ['Na hora em que eu cheguei, eles saíram', 'Quando cheguei, eles já tinham saído'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Dormi durante duas horas" =', opcoes: ['I slept during two hours.', 'I slept for two hours.'], correta: 1 },
          { tipo: 'ordenar', resposta: 'As soon as she arrived we started the meeting', traducao: 'Assim que ela chegou, começamos a reunião' },
        ],
      },
    ],
  },
  {
    id: 'discurso-indireto',
    titulo: 'Relatar o que alguém disse',
    resumo: 'say × tell, o recuo dos tempos e as perguntas indiretas sem inversão.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Say** × **tell**: *tell* exige a pessoa depois (*He told **me** that…*); *say* não (*He said that…*, ou *He said **to me**…*). "He said me" é o erro clássico.

**Recuo dos tempos**: com o verbo de relato no passado, a fala recua um tempo: presente → passado (*"I'm tired" → He said he **was** tired*), passado → past perfect (*"I finished" → She said she **had finished***), *will* → *would* (*"I'll call" → He said he **would** call*). Na fala do dia a dia, se o fato ainda vale, o recuo é opcional.

**Perguntas indiretas** não têm inversão nem *do/did*: *"Where do you live?" → She asked where I **lived**.* Sim/não usa **if** ou **whether**: *He asked **if** I had time.* Pedidos e ordens: **ask/tell someone to**: *She asked me **to** call her.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Da fala direta à indireta',
        cabecalho: ['Direta', 'Indireta'],
        linhas: [
          ['“I’m tired.”', 'He said (that) he was tired.'],
          ['“I finished the report.”', 'She told me she had finished the report.'],
          ['“I’ll call you tomorrow.”', 'He said he would call me the next day.'],
          ['“Do you have time?”', 'She asked if I had time.'],
          ['“Where do you live?”', 'He asked where I lived.'],
          ['“Please send the invoice.”', 'They asked me to send the invoice.'],
          ['“Don’t be late.”', 'She told us not to be late.'],
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to say (said)', traducao: 'dizer', exemplo: 'He said he was busy.', exemploTraducao: 'Ele disse que estava ocupado.' },
          { termo: 'to tell (told) someone', traducao: 'dizer a alguém, contar', exemplo: 'She told me the news.', exemploTraducao: 'Ela me contou a novidade.' },
          { termo: 'to ask', traducao: 'perguntar, pedir' },
          { termo: 'to explain', traducao: 'explicar', nota: 'explain TO someone: "explain me" está errado' },
          { termo: 'to promise', traducao: 'prometer' },
          { termo: 'to mention', traducao: 'mencionar' },
          { termo: 'to claim', traducao: 'alegar, afirmar' },
          { termo: 'to wonder', traducao: 'perguntar-se', exemplo: 'I wonder if he knows.', exemploTraducao: 'Será que ele sabe?' },
          { termo: 'the next day / the day before', traducao: 'no dia seguinte / na véspera' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'She ___ me she was tired. (disse)', resposta: 'told' },
          { tipo: 'lacuna', frase: 'He ___ that he would come. (disse)', resposta: 'said' },
          { tipo: 'lacuna', frase: 'She asked ___ I had time. (se)', resposta: ['if', 'whether'] },
          { tipo: 'lacuna', frase: 'They asked me ___ send the invoice.', resposta: 'to' },
          { tipo: 'escolha', pergunta: '“Where do you work?” → He asked…', opcoes: ['where do I work.', 'where I worked.', 'where did I work.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Can you explain me this?', 'Can you explain this to me?'], correta: 1 },
          { tipo: 'traducao', origem: 'Ela perguntou onde eu morava.', resposta: ['She asked where I lived.', 'She asked me where I lived.'] },
          { tipo: 'ditado', texto: 'He asked if we had time tomorrow.', traducao: 'Ele perguntou se tínhamos tempo amanhã.' },
        ],
      },
    ],
  },
];

/* ──────────────────────────────── Opiniões ──────────────────────────────── */

const opinioes: Licao[] = [
  {
    id: 'opinar-concordar',
    titulo: 'Dar opinião, concordar e discordar',
    resumo: 'I think, in my opinion, "I agree" (nunca "I am agree"), e o código britânico de discordar sem dizer não.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Opinar: **I think (that)…**, **In my opinion,…**, **If you ask me,…**, **As far as I'm concerned,…**, **I believe…**. Para suavizar: **I'd say…**, **It seems to me that…**.

**Agree** é verbo: ***I agree.*** Nunca "I am agree" — o erro mais comum do brasileiro nesse assunto. Negativa: *I don't agree* ou *I disagree*.

O inglês, sobretudo o britânico, discorda de forma indireta. *I'm not sure that's the best idea* ou *That's an interesting point, but…* muitas vezes significam "discordo totalmente". O americano é um pouco mais direto, mas também prefere amortecer: *I see your point, but…*`,
      },
      {
        tipo: 'frases',
        titulo: 'Opinar',
        itens: [
          { texto: 'I think it’s a great idea.', traducao: 'Acho uma ótima ideia.' },
          { texto: 'In my opinion, it’s too expensive.', traducao: 'Na minha opinião, é caro demais.' },
          { texto: 'If you ask me, we should wait.', traducao: 'Se quer saber, deveríamos esperar.' },
          { texto: 'I don’t think it will work.', traducao: 'Acho que não vai funcionar.', nota: 'o inglês nega o "think", não o verbo seguinte' },
          { texto: 'I’m not sure about that.', traducao: 'Não tenho certeza disso.' },
          { texto: 'It depends.', traducao: 'Depende.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concordar e discordar',
        itens: [
          { texto: 'I agree with you.', traducao: 'Concordo com você.' },
          { texto: 'Exactly! / Absolutely! / I couldn’t agree more.', traducao: 'Exatamente! / Com certeza! / Concordo plenamente.' },
          { texto: 'That’s a good point.', traducao: 'Bem lembrado.' },
          { texto: 'That’s true, but…', traducao: 'É verdade, mas…' },
          { texto: 'I see your point, but I’m not sure I agree.', traducao: 'Entendo seu ponto, mas não sei se concordo.' },
          { texto: 'I see it differently.', traducao: 'Vejo de outro jeito.' },
          { texto: 'I’m afraid I disagree.', traducao: 'Infelizmente discordo.' },
          { texto: 'On the one hand yes, but on the other hand…', traducao: 'Por um lado sim, mas por outro…' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'opinion / point of view', traducao: 'opinião / ponto de vista' },
          { termo: 'to agree / to disagree', traducao: 'concordar / discordar', nota: 'verbo: I agree' },
          { termo: 'to be right / to be wrong', traducao: 'ter razão / estar errado' },
          { termo: 'point', traducao: 'argumento, ponto', exemplo: 'You have a point.', exemploTraducao: 'Você tem razão nisso.' },
          { termo: 'convinced', traducao: 'convencido' },
          { termo: 'to doubt', traducao: 'duvidar', exemplo: 'I doubt it.', exemploTraducao: 'Duvido.' },
          { termo: 'reasonable / unreasonable', traducao: 'razoável / absurdo' },
          { termo: 'to make sense', traducao: 'fazer sentido', nota: 'MAKE sense, nunca "have sense"' },
          { termo: 'it depends on', traducao: 'depende de' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'In my ___, it’s a good idea.', resposta: 'opinion' },
          { tipo: 'lacuna', frase: 'I ___ with you. (concordo)', resposta: 'agree' },
          { tipo: 'lacuna', frase: 'That doesn’t ___ sense.', resposta: 'make' },
          { tipo: 'lacuna', frase: 'It depends ___ the price.', resposta: 'on' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I am agree.', 'I agree.', 'I’m agreeing with you.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Acho que não vai chover" — o natural é…', opcoes: ['I think it won’t rain.', 'I don’t think it will rain.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz "That’s an interesting idea…" num tom hesitante. Provavelmente quer dizer…', opcoes: ['que adorou', 'que discorda'], correta: 1 },
          { tipo: 'traducao', origem: 'Você tem razão.', resposta: ['You’re right.', 'You are right.', 'You have a point.'] },
        ],
      },
    ],
  },
  {
    id: 'justificar',
    titulo: 'Justificar: because, so, although, however, despite',
    resumo: 'Causa, consequência e concessão — e a pontuação que cada conector pede.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Causa**: **because** + oração (*because it's raining*); **because of** + substantivo (*because of the rain*); **since / as** (já que, causa conhecida).

**Consequência**: **so** (então), **therefore** (portanto, formal), **that's why** (é por isso que).

**Concessão**:
- **although / even though / though** + oração: *Although it was cold, we went out.*
- **despite / in spite of** + substantivo ou **-ing**: *Despite the cold, we went out. Despite being tired, he kept working.* Nunca "despite of".
- **however** liga duas frases, com pontuação: *It was cold. **However,** we went out.*

A ordem das palavras não muda com nenhum deles — o inglês não tem o verbo-no-fim do alemão.`,
      },
      {
        tipo: 'tabela',
        titulo: 'A mesma ideia, estruturas diferentes',
        cabecalho: ['Conector', 'Exemplo'],
        linhas: [
          ['because', 'We postponed the delivery because the road was closed.'],
          ['because of', 'We postponed the delivery because of the storm.'],
          ['so', 'The road was closed, so we postponed the delivery.'],
          ['therefore', 'Prices have risen. Therefore, we need to cut costs.'],
          ['although', 'Although he was sick, he came to work.'],
          ['despite', 'Despite being sick, he came to work.'],
          ['however', 'He was sick. However, he came to work.'],
          ['so that', 'I write everything down so that I don’t forget.'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Since prices have gone up, we need to save.', traducao: 'Já que os preços subiram, precisamos economizar.' },
          { texto: 'Milk has become more expensive. That’s why people are buying less.', traducao: 'O leite ficou mais caro. É por isso que as pessoas estão comprando menos.' },
          { texto: 'Even though it was raining, the goats were out in the pasture.', traducao: 'Embora estivesse chovendo, as cabras estavam no pasto.' },
          { texto: 'In spite of the delay, the client was happy.', traducao: 'Apesar do atraso, o cliente ficou satisfeito.' },
          { texto: 'The course is good. Besides, it’s cheap.', traducao: 'O curso é bom. Além disso, é barato.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'We stayed home ___ of the rain.', resposta: 'because' },
          { tipo: 'lacuna', frase: '___ it was late, we kept working. (embora)', resposta: ['Although', 'Even though', 'Though'] },
          { tipo: 'lacuna', frase: '___ being tired, he finished the report. (apesar de)', resposta: ['Despite', 'In spite of'] },
          { tipo: 'lacuna', frase: 'It was expensive. ___, we bought it. (no entanto)', resposta: ['However', 'Nevertheless'] },
          { tipo: 'lacuna', frase: 'The road was closed, ___ we took another route. (então)', resposta: 'so' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Despite of the rain, we went.', 'Despite the rain, we went.', 'Despite it rained, we went.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"because of" é seguido de…', opcoes: ['oração completa', 'substantivo'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Although it was cold the goats were outside', traducao: 'Embora estivesse frio, as cabras estavam fora' },
        ],
      },
    ],
  },
  {
    id: 'vantagens-desvantagens',
    titulo: 'Vantagens e desvantagens',
    resumo: 'Pesar prós e contras com "on the one hand", "whereas", "in the long run" e fechar o balanço.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estruturas de contraste:
- **On the one hand… On the other hand…** (por um lado… por outro).
- **whereas / while** (enquanto que): *Paper is cheap, whereas software saves time.*
- **The main advantage / drawback is that…** (a principal vantagem / desvantagem é que).
- **Compared to / Compared with** (em comparação com).
- Fechar: **All in all**, **Overall**, **On balance**, **At the end of the day** (no fim das contas).

**Worth** + -ing ou substantivo: *It's worth it. It's worth trying.* (Vale a pena.)`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'advantage / disadvantage', traducao: 'vantagem / desvantagem' },
          { termo: 'drawback / downside', traducao: 'inconveniente, lado ruim' },
          { termo: 'pros and cons', traducao: 'prós e contras' },
          { termo: 'to weigh (up)', traducao: 'pesar, ponderar' },
          { termo: 'cost-effective', traducao: 'econômico, que compensa o custo' },
          { termo: 'time-saving / time-consuming', traducao: 'que economiza tempo / que consome tempo' },
          { termo: 'reliable', traducao: 'confiável' },
          { termo: 'user-friendly', traducao: 'fácil de usar' },
          { termo: 'to be worth it', traducao: 'valer a pena' },
          { termo: 'in the long run', traducao: 'a longo prazo' },
          { termo: 'compared to', traducao: 'em comparação com' },
          { termo: 'whereas', traducao: 'enquanto que' },
          { termo: 'on balance / all in all', traducao: 'no balanço / no geral' },
          { termo: 'to outweigh', traducao: 'superar, pesar mais', exemplo: 'The benefits outweigh the costs.', exemploTraducao: 'Os benefícios superam os custos.' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: software de gestão na fazenda',
        markdown: `> On the one hand, software costs money and your staff have to learn how to use it. On the other hand, it saves a lot of time: entering the data is time-consuming at first, but after that you have everything on your phone. The main advantage is that you spot problems in the barn much earlier. Compared to paper records, it's far more reliable. All in all, it's worth it — the benefits clearly outweigh the costs.

Por um lado, um software custa dinheiro e a equipe precisa aprender a usá-lo. Por outro, economiza muito tempo: lançar os dados toma tempo no começo, mas depois tem-se tudo no celular. A principal vantagem é que você identifica problemas no estábulo muito antes. Em comparação com registros em papel, é muito mais confiável. No geral, vale a pena: os benefícios superam claramente os custos.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'On the one hand it’s expensive; on the other ___, it saves time.', resposta: 'hand' },
          { tipo: 'lacuna', frase: 'The main ___ is that it costs a lot. (desvantagem)', resposta: ['drawback', 'disadvantage', 'downside'] },
          { tipo: 'lacuna', frase: 'It’s definitely ___ it. (vale a pena)', resposta: 'worth' },
          { tipo: 'lacuna', frase: 'Paper is cheap, ___ software saves time. (enquanto que)', resposta: ['whereas', 'while'] },
          { tipo: 'escolha', pergunta: '"time-consuming" =', opcoes: ['que economiza tempo', 'que consome tempo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"The benefits outweigh the costs" =', opcoes: ['Os custos são maiores', 'Os benefícios superam os custos'], correta: 1 },
          { tipo: 'ordenar', resposta: 'The main advantage is that it saves time', traducao: 'A principal vantagem é que economiza tempo' },
          { tipo: 'ditado', texto: 'All in all, the benefits outweigh the costs.', traducao: 'No geral, os benefícios superam os custos.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Situações reais ──────────────────────────── */

const situacoesReais: Licao[] = [
  {
    id: 'moradia',
    titulo: 'Alugar um apartamento',
    resumo: 'Anúncio, visita, lease, security deposit, utilities e a checagem de crédito americana.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Ler um anúncio americano: **1BR/1BA, 650 sq ft, W/D in unit, pets OK, $1,450/mo + utilities, 12-month lease**. Traduzindo: 1 quarto e 1 banheiro, cerca de 60 m², lavadora e secadora no apartamento, aceita animais, US$ 1.450 por mês mais contas, contrato de 12 meses.

**Rent** é o aluguel; **utilities** são as contas (luz, gás, água, lixo), quase sempre por fora. O **security deposit** (caução) costuma ser um mês. O locador (*landlord*) faz uma **credit check** — o histórico de crédito americano, que o estrangeiro recém-chegado não tem. Alternativas: depósito maior, fiador (*guarantor*) ou pagar alguns meses adiantados.

No Reino Unido: *flat*, *letting agent* (imobiliária), *council tax* (imposto municipal pago pelo inquilino).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to rent / to rent out', traducao: 'alugar (como inquilino) / alugar (como dono)' },
          { termo: 'tenant / landlord', traducao: 'inquilino / locador' },
          { termo: 'rent', traducao: 'aluguel' },
          { termo: 'utilities', traducao: 'contas de consumo (luz, gás, água)' },
          { termo: 'security deposit', traducao: 'caução' },
          { termo: 'lease', traducao: 'contrato de aluguel', exemplo: 'to sign a lease', exemploTraducao: 'assinar o contrato' },
          { termo: 'viewing / showing', traducao: 'visita ao imóvel (Reino Unido / EUA)' },
          { termo: 'furnished / unfurnished', traducao: 'mobiliado / sem móveis' },
          { termo: 'studio / one-bedroom', traducao: 'quitinete / um quarto' },
          { termo: 'washer and dryer (W/D)', traducao: 'lavadora e secadora' },
          { termo: 'square feet (sq ft)', traducao: 'pés quadrados', nota: '100 sq ft ≈ 9,3 m²' },
          { termo: 'credit check / credit score', traducao: 'análise de crédito / pontuação de crédito' },
          { termo: 'guarantor / co-signer', traducao: 'fiador' },
          { termo: 'to move in / to move out', traducao: 'mudar-se para / sair do imóvel' },
          { termo: 'maintenance', traducao: 'manutenção' },
          { termo: 'neighbor', traducao: 'vizinho', nota: 'neighbour no Reino Unido' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na visita',
        falas: [
          { quem: 'Landlord', texto: 'So this is the unit: one bedroom, a full kitchen, and a washer and dryer.', traducao: 'Então, esta é a unidade: um quarto, cozinha completa e lavadora e secadora.' },
          { quem: 'Felipe', texto: 'It’s nice and bright. What are the utilities like?', traducao: 'É bem iluminado. Como são as contas?' },
          { quem: 'Landlord', texto: 'Water and trash are included. Electricity and internet are on you.', traducao: 'Água e lixo estão incluídos. Luz e internet ficam por sua conta.' },
          { quem: 'Felipe', texto: 'And the security deposit?', traducao: 'E a caução?' },
          { quem: 'Landlord', texto: 'One month’s rent. I’ll also need to run a credit check.', traducao: 'Um mês de aluguel. Também vou precisar fazer uma análise de crédito.' },
          { quem: 'Felipe', texto: 'I just moved here, so I don’t have a US credit history yet. Could I pay a larger deposit instead?', traducao: 'Acabei de me mudar, então ainda não tenho histórico de crédito nos EUA. Poderia pagar uma caução maior no lugar?' },
          { quem: 'Landlord', texto: 'That could work. When would you like to move in?', traducao: 'Pode funcionar. Quando você gostaria de se mudar?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"$1,450/mo + utilities" — as contas de luz e gás…', opcoes: ['estão incluídas', 'são pagas à parte'], correta: 1 },
          { tipo: 'escolha', pergunta: '"1BR/1BA" é…', opcoes: ['um quarto e um banheiro', 'primeiro andar, bloco A', 'um quarto e uma varanda'], correta: 0 },
          { tipo: 'escolha', pergunta: '"landlord" é…', opcoes: ['o inquilino', 'o locador', 'o corretor'], correta: 1 },
          { tipo: 'lacuna', frase: 'I’d like to ___ this apartment. (alugar)', resposta: 'rent' },
          { tipo: 'lacuna', frase: 'The security ___ is one month’s rent.', resposta: 'deposit' },
          { tipo: 'lacuna', frase: 'When can I move ___?', resposta: 'in' },
          { tipo: 'traducao', origem: 'A partir de quando o apartamento está disponível?', resposta: ['When is the apartment available?', 'When is it available?', 'When will the apartment be available?'] },
          { tipo: 'ditado', texto: 'Are utilities included in the rent?', traducao: 'As contas estão incluídas no aluguel?' },
        ],
      },
    ],
  },
  {
    id: 'burocracia-banco',
    titulo: 'Banco, documentos e burocracia',
    resumo: 'Checking × savings, wire transfer, SSN, DMV — o vocabulário para abrir conta e resolver papelada.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Burocracia em inglês gira em torno de **ID** (documento com foto), **proof of address** (comprovante de endereço), **appointment** (hora marcada) e **forms** (formulários).

Banco americano: **checking account** (conta corrente) e **savings account** (poupança); **debit card**; **direct deposit** (salário que cai direto); **wire transfer** (transferência, cara nos EUA); apps como Zelle para transferências rápidas. No Reino Unido, *current account* e *cash machine* (caixa eletrônico; *ATM* nos EUA).

Números que abrem portas: nos EUA, o **SSN** (*Social Security Number*); no Reino Unido, o **National Insurance number**. Carteira de motorista nos EUA sai no **DMV**.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'ID / photo ID', traducao: 'documento de identidade (com foto)' },
          { termo: 'proof of address', traducao: 'comprovante de endereço' },
          { termo: 'to apply for', traducao: 'solicitar, candidatar-se a', exemplo: 'to apply for a visa', exemploTraducao: 'solicitar um visto' },
          { termo: 'application', traducao: 'requerimento, inscrição' },
          { termo: 'form', traducao: 'formulário' },
          { termo: 'deadline', traducao: 'prazo' },
          { termo: 'Social Security Number (SSN)', traducao: 'número de seguridade social (EUA)' },
          { termo: 'DMV', traducao: 'departamento de trânsito (EUA)' },
          { termo: 'to open an account', traducao: 'abrir uma conta' },
          { termo: 'checking / savings account', traducao: 'conta corrente / poupança' },
          { termo: 'wire transfer / bank transfer', traducao: 'transferência bancária' },
          { termo: 'direct deposit', traducao: 'depósito direto (salário)' },
          { termo: 'to withdraw / to deposit', traducao: 'sacar / depositar' },
          { termo: 'ATM / cash machine', traducao: 'caixa eletrônico (EUA / Reino Unido)' },
          { termo: 'statement', traducao: 'extrato' },
          { termo: 'fee', traducao: 'tarifa, taxa' },
          { termo: 'overdraft', traducao: 'saldo negativo, cheque especial' },
          { termo: 'insurance', traducao: 'seguro' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'No banco',
        falas: [
          { quem: 'Felipe', texto: 'Hi, I’d like to open a checking account.', traducao: 'Olá, gostaria de abrir uma conta corrente.' },
          { quem: 'Banker', texto: 'Sure. Do you have a photo ID and proof of address?', traducao: 'Claro. O senhor tem documento com foto e comprovante de endereço?' },
          { quem: 'Felipe', texto: 'Here’s my passport and my lease. Are there any monthly fees?', traducao: 'Aqui está meu passaporte e meu contrato de aluguel. Há tarifa mensal?' },
          { quem: 'Banker', texto: 'It’s twelve dollars a month, but it’s waived if you set up direct deposit.', traducao: 'São doze dólares por mês, mas é isento se o senhor configurar o depósito direto.' },
          { quem: 'Felipe', texto: 'Great. And how do I send money to Brazil?', traducao: 'Ótimo. E como envio dinheiro para o Brasil?' },
          { quem: 'Banker', texto: 'You can do an international wire transfer in the app. There’s a fee of thirty-five dollars.', traducao: 'O senhor pode fazer uma transferência internacional no app. Há uma taxa de trinta e cinco dólares.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I’d like to ___ an account.', resposta: 'open' },
          { tipo: 'lacuna', frase: 'I need to apply ___ a visa.', resposta: 'for' },
          { tipo: 'lacuna', frase: 'I want to ___ some cash. (sacar)', resposta: 'withdraw' },
          { tipo: 'escolha', pergunta: '"checking account" é…', opcoes: ['conta corrente', 'conta de verificação', 'poupança'], correta: 0 },
          { tipo: 'escolha', pergunta: '"The fee is waived" =', opcoes: ['A taxa aumentou', 'A taxa é isenta'], correta: 1 },
          { tipo: 'escolha', pergunta: '"proof of address" é…', opcoes: ['comprovante de endereço', 'prova de identidade', 'endereço de entrega'], correta: 0 },
          { tipo: 'traducao', origem: 'Há tarifas?', resposta: ['Are there any fees?', 'Are there fees?', 'Is there a fee?', 'Is there any fee?'] },
          { tipo: 'ditado', texto: 'Do you have a photo ID and proof of address?', traducao: 'O senhor tem documento com foto e comprovante de endereço?' },
        ],
      },
    ],
  },
  {
    id: 'entrevista-emprego',
    titulo: 'Entrevista de emprego e currículo',
    resumo: 'Résumé × CV, o que NÃO pôr no currículo americano, as perguntas clássicas e como falar de fraquezas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Nos EUA, o currículo é o **résumé**: uma página, cronologia inversa, **sem foto, idade, estado civil ou nacionalidade** — as leis antidiscriminação fazem o recrutador preferir não ver. No Reino Unido chama-se **CV**, com as mesmas regras. Acompanha uma **cover letter** curta.

Perguntas certas: *Tell me about yourself. Why do you want to work here? What are your strengths and weaknesses? Where do you see yourself in five years? Do you have any questions for us?*

Tom: confiante, concreto, com números. O americano espera que você **se venda** mais do que o brasileiro está acostumado — modéstia excessiva lê como falta de competência. A resposta sobre fraquezas deve mostrar o que você faz para melhorar.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to apply for a job', traducao: 'candidatar-se a uma vaga' },
          { termo: 'application', traducao: 'candidatura' },
          { termo: 'résumé / CV', traducao: 'currículo (EUA / Reino Unido)' },
          { termo: 'cover letter', traducao: 'carta de apresentação' },
          { termo: 'job interview', traducao: 'entrevista de emprego' },
          { termo: 'strengths / weaknesses', traducao: 'pontos fortes / pontos fracos' },
          { termo: 'work experience', traducao: 'experiência profissional' },
          { termo: 'degree', traducao: 'diploma de faculdade', exemplo: 'a degree in agronomy', exemploTraducao: 'formação em agronomia' },
          { termo: 'skills', traducao: 'habilidades' },
          { termo: 'fluent in', traducao: 'fluente em' },
          { termo: 'team player', traducao: 'que trabalha bem em equipe' },
          { termo: 'reliable / proactive', traducao: 'confiável / proativo' },
          { termo: 'to handle pressure', traducao: 'lidar com pressão' },
          { termo: 'salary expectations', traducao: 'pretensão salarial' },
          { termo: 'references', traducao: 'referências (pessoas que recomendam você)' },
          { termo: 'to hire / to be hired', traducao: 'contratar / ser contratado' },
          { termo: 'job offer / rejection', traducao: 'oferta de emprego / recusa' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Trechos de entrevista',
        falas: [
          { quem: 'Interviewer', texto: 'Tell me a little about yourself.', traducao: 'Fale um pouco sobre você.' },
          { quem: 'Candidate', texto: 'I’m an agronomist with ten years of experience in dairy goat farming. Since 2011 I’ve run a company that builds software for farmers.', traducao: 'Sou agrônomo com dez anos de experiência em caprinocultura leiteira. Desde 2011 dirijo uma empresa que desenvolve software para produtores.' },
          { quem: 'Interviewer', texto: 'Why do you want to work with us?', traducao: 'Por que quer trabalhar conosco?' },
          { quem: 'Candidate', texto: 'Because your company combines agriculture and technology — exactly what I’ve been building for years.', traducao: 'Porque sua empresa une agricultura e tecnologia, exatamente o que venho construindo há anos.' },
          { quem: 'Interviewer', texto: 'What would you say is your biggest weakness?', traducao: 'Qual diria que é seu maior ponto fraco?' },
          { quem: 'Candidate', texto: 'My English isn’t perfect yet, so I study every day — and I already understand almost all the technical vocabulary.', traducao: 'Meu inglês ainda não é perfeito, então estudo todo dia, e já entendo quase todo o vocabulário técnico.' },
          { quem: 'Interviewer', texto: 'Do you have any questions for us?', traducao: 'Tem alguma pergunta para nós?' },
          { quem: 'Candidate', texto: 'Yes — what does a typical day look like in this role?', traducao: 'Sim: como é um dia típico nessa função?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I’m applying ___ the position of consultant.', resposta: 'for' },
          { tipo: 'lacuna', frase: 'My biggest ___ is impatience. (ponto fraco)', resposta: 'weakness' },
          { tipo: 'lacuna', frase: 'I have ten years of work ___.', resposta: 'experience' },
          { tipo: 'escolha', pergunta: 'Num résumé americano você deve…', opcoes: ['pôr foto e idade', 'omitir foto, idade e estado civil', 'pôr o CPF'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quando perguntam "Do you have any questions for us?", o esperado é…', opcoes: ['dizer que não, por educação', 'fazer uma ou duas perguntas concretas'], correta: 1 },
          { tipo: 'escolha', pergunta: '"a degree in agronomy" é…', opcoes: ['um grau de temperatura', 'uma formação superior em agronomia'], correta: 1 },
          { tipo: 'traducao', origem: 'Por que você quer trabalhar aqui?', resposta: ['Why do you want to work here?', 'Why do you want to work with us?'] },
          { tipo: 'ditado', texto: 'Where do you see yourself in five years?', traducao: 'Onde você se vê em cinco anos?' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Maior precisão gramatical ────────────────────── */

const precisaoGramatical: Licao[] = [
  {
    id: 'artigos-contaveis',
    titulo: 'Artigos e substantivos incontáveis',
    resumo: 'Quando usar the, quando não usar nada, e por que "informations" e "advices" não existem.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Sem artigo** para falar de algo em geral: *Goats are smart. Milk is healthy. I love music.* O português diria "as cabras", "o leite". Também sem artigo: refeições (*have lunch*), a maioria dos países e cidades (*in Brazil, in Boston*) e expressões como *go to bed, go to work, at home, by car*.

**The** para algo específico ou já conhecido, coisas únicas e alguns nomes: *the sun, the internet, the United States, the UK, the Amazon* (rios e oceanos).

**Incontáveis** não têm plural nem *a/an*: *information, advice, news, feedback, research, equipment, furniture, software, luggage, money, milk, work*. Para contar, usa-se uma unidade: *a piece of advice, two pieces of equipment*. "Informations", "advices" e "softwares" são erros clássicos do brasileiro.

Quantidade: **many / a few** com contáveis (*many goats, a few questions*); **much / a little** com incontáveis (*much time, a little milk*); **a lot of** com os dois.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Incontáveis que enganam',
        cabecalho: ['Errado', 'Certo', 'Como contar'],
        linhas: [
          ['informations', 'information', 'a piece of information'],
          ['advices', 'advice', 'a piece of advice, some advice'],
          ['news are', 'the news is', 'a piece of news'],
          ['softwares', 'software', 'software programs, apps'],
          ['equipments', 'equipment', 'a piece of equipment'],
          ['furnitures', 'furniture', 'a piece of furniture'],
          ['feedbacks', 'feedback', 'some feedback'],
          ['a work', 'work / a job', 'a job, a task'],
          ['luggages', 'luggage', 'a bag, a suitcase'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Goats are very curious animals.', traducao: 'As cabras são animais muito curiosos.', nota: 'em geral: sem artigo' },
          { texto: 'The goats in the barn are pregnant.', traducao: 'As cabras do estábulo estão prenhes.', nota: 'específicas: the' },
          { texto: 'Can you give me some information about the price?', traducao: 'Pode me dar informações sobre o preço?' },
          { texto: 'Let me give you a piece of advice.', traducao: 'Deixa eu te dar um conselho.' },
          { texto: 'We don’t have much time, but we have a lot of work.', traducao: 'Não temos muito tempo, mas temos muito trabalho.' },
          { texto: 'She lives in the United States, but she was born in Mexico.', traducao: 'Ela mora nos Estados Unidos, mas nasceu no México.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I need some informations.', 'I need some information.', 'I need an information.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"O leite de cabra é saudável" (em geral) =', opcoes: ['The goat milk is healthy.', 'Goat milk is healthy.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['The news are bad.', 'The news is bad.'], correta: 1 },
          { tipo: 'lacuna', frase: 'How ___ goats do you have? (quantas)', resposta: 'many' },
          { tipo: 'lacuna', frase: 'How ___ milk do they produce? (quanto)', resposta: 'much' },
          { tipo: 'lacuna', frase: 'Let me give you a piece of ___. (conselho)', resposta: 'advice' },
          { tipo: 'lacuna', frase: 'She lives in ___ United States.', resposta: 'the' },
          { tipo: 'traducao', origem: 'Preciso de alguns conselhos.', resposta: ['I need some advice.', 'I need advice.'] },
        ],
      },
    ],
  },
  {
    id: 'preposicoes',
    titulo: 'Preposições: in, on, at e as que andam com verbos',
    resumo: 'O sistema in/on/at para tempo e lugar, e as preposições fixas que o português traduz errado.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Tempo**: **at** para horas e momentos (*at 5 o'clock, at night, at the weekend*), **on** para dias e datas (*on Monday, on May 3rd*), **in** para períodos maiores (*in May, in 2026, in the morning, in summer*).

**Lugar**: **at** para um ponto (*at the office, at the station, at home*), **on** para superfície e linha (*on the table, on the farm, on the second floor, on Main Street*), **in** para dentro de espaço fechado ou área (*in the barn, in Brazil, in the car*). *On the bus / on the train / on the plane*, mas *in the car / in a taxi*.

**Preposições fixas** depois de verbos e adjetivos são o maior foco de erro, porque o português usa outras: *depend **on*** (não "of"), *interested **in***, *good **at***, *married **to***, *listen **to***, *wait **for***, *pay **for***, *responsible **for***, *different **from***, *afraid **of***, *worried **about***, *look forward **to** + -ing*.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbo/adjetivo + preposição',
        cabecalho: ['Inglês', 'Português', 'Erro típico'],
        linhas: [
          ['depend on', 'depender de', 'depend of'],
          ['interested in', 'interessado em', 'interested on'],
          ['good at', 'bom em', 'good in'],
          ['married to', 'casado com', 'married with'],
          ['listen to', 'ouvir, escutar', 'listen music'],
          ['wait for', 'esperar (por)', 'wait someone'],
          ['pay for', 'pagar (algo)', 'pay the dinner (ok) / pay for the dinner'],
          ['arrive in / at', 'chegar a, em', 'arrive to'],
          ['think about / of', 'pensar em', 'think in'],
          ['dream about / of', 'sonhar com', 'dream with'],
          ['look forward to + -ing', 'aguardar com expectativa', 'look forward to see'],
          ['responsible for', 'responsável por', 'responsible of'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I usually work at night, but on Fridays I finish at five.', traducao: 'Geralmente trabalho à noite, mas às sextas termino às cinco.' },
          { texto: 'The goats are in the barn and the tractor is on the farm road.', traducao: 'As cabras estão no estábulo e o trator está na estrada da fazenda.' },
          { texto: 'It depends on the weather.', traducao: 'Depende do tempo.' },
          { texto: 'She’s married to a veterinarian.', traducao: 'Ela é casada com um veterinário.' },
          { texto: 'I’m looking forward to meeting you.', traducao: 'Estou ansioso para conhecê-lo.' },
          { texto: 'Who is responsible for the herd?', traducao: 'Quem é responsável pelo rebanho?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'The meeting is ___ Monday.', resposta: 'on' },
          { tipo: 'lacuna', frase: 'We started the company ___ 2011.', resposta: 'in' },
          { tipo: 'lacuna', frase: 'It depends ___ the price.', resposta: 'on' },
          { tipo: 'lacuna', frase: 'She’s very good ___ math.', resposta: 'at' },
          { tipo: 'lacuna', frase: 'I’m married ___ a Brazilian.', resposta: 'to' },
          { tipo: 'lacuna', frase: 'I’m looking forward to ___ you. (see)', resposta: 'seeing' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I’m waiting you.', 'I’m waiting for you.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"no ônibus" =', opcoes: ['in the bus', 'on the bus'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'gerund-infinitivo',
    titulo: 'Gerúndio ou infinitivo: enjoy doing, want to do',
    resumo: 'Quais verbos pedem -ing, quais pedem "to", e os que mudam de sentido: stop, remember, try.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Depois de certos verbos, o segundo verbo vai para **-ing**; depois de outros, para **to + infinitivo**. Não há lógica infalível: aprende-se em grupos.

- **+ -ing**: *enjoy, finish, avoid, mind, suggest, keep, consider, can't stand, miss, practice, recommend*. *I enjoy working with animals.*
- **+ to**: *want, need, decide, plan, hope, promise, agree, refuse, would like, expect, manage, afford*. *We decided to expand.*
- **Depois de preposição, sempre -ing**: *interested in learning, good at cooking, before leaving, thank you for coming, look forward to seeing you*.

Mudam de sentido:
- **stop** *doing* (parar de fazer) × *stop to do* (parar para fazer): *I stopped smoking* × *I stopped to smoke*.
- **remember / forget** *doing* (lembrar de ter feito) × *to do* (lembrar de fazer): *Remember to lock the door.*
- **try** *doing* (experimentar) × *to do* (tentar, com esforço).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Grupos',
        cabecalho: ['+ -ing', '+ to', 'muda o sentido'],
        linhas: [
          ['enjoy', 'want', 'stop'],
          ['finish', 'need', 'remember'],
          ['avoid', 'decide', 'forget'],
          ['mind', 'plan', 'try'],
          ['suggest', 'hope', 'regret'],
          ['keep', 'promise', ''],
          ['consider', 'agree / refuse', ''],
          ['can’t stand', 'would like', ''],
        ],
        nota: 'like, love, hate e start aceitam os dois com pouca diferença: I like cooking / I like to cook.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I enjoy working with animals.', traducao: 'Gosto de trabalhar com animais.' },
          { texto: 'We’ve decided to build a new barn.', traducao: 'Decidimos construir um estábulo novo.' },
          { texto: 'Would you mind waiting a moment?', traducao: 'Você se importa de esperar um momento?' },
          { texto: 'Thank you for coming.', traducao: 'Obrigado por ter vindo.' },
          { texto: 'Remember to feed the kids before you leave.', traducao: 'Lembre-se de alimentar os cabritos antes de sair.' },
          { texto: 'I’ll never forget seeing the farm for the first time.', traducao: 'Nunca vou esquecer de ter visto a fazenda pela primeira vez.' },
          { texto: 'He stopped to check the fence.', traducao: 'Ele parou para verificar a cerca.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I enjoy ___ with animals. (work)', resposta: 'working' },
          { tipo: 'lacuna', frase: 'We decided ___ a new barn. (build)', resposta: 'to build' },
          { tipo: 'lacuna', frase: 'Thank you for ___. (come)', resposta: 'coming' },
          { tipo: 'lacuna', frase: 'I’m interested in ___ more. (learn)', resposta: 'learning' },
          { tipo: 'lacuna', frase: 'Please remember ___ the door. (lock — lembrar de fazer)', resposta: 'to lock' },
          { tipo: 'escolha', pergunta: '"I stopped smoking" =', opcoes: ['Parei para fumar', 'Parei de fumar'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I look forward to hear from you.', 'I look forward to hearing from you.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['She suggested to go.', 'She suggested going.'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'condicionais',
    titulo: 'Condicionais: if, would, wish',
    resumo: 'Os quatro condicionais, "If I were you", o arrependimento com "I wish I had" e o "unless".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Quatro estruturas com **if**:

- **Zero** — verdades gerais: *If you heat milk, it boils.* (presente + presente)
- **First** — futuro possível: *If it rains, we'll stay inside.* (presente + will)
- **Second** — hipótese irreal no presente: *If I had more time, I would travel.* (passado + would). Com *to be*, usa-se **were** para todos: ***If I were you**, I'd accept.*
- **Third** — hipótese irreal no passado, arrependimento: *If I had known, I would have come.* (had + particípio + would have + particípio)

Nunca *would* do lado do *if*: "If I would have time" é o erro clássico.

**Wish** para desejos irreais: *I wish I **had** more time* (presente); *I wish I **had studied** more* (passado). **Unless** = *if not*: *We'll go unless it rains.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os condicionais',
        cabecalho: ['Tipo', 'Estrutura', 'Exemplo'],
        linhas: [
          ['zero', 'if + presente, presente', 'If goats get wet, they get cold.'],
          ['first', 'if + presente, will', 'If you call me, I’ll come.'],
          ['second', 'if + passado, would', 'If I lived closer, I would visit more often.'],
          ['third', 'if + had + particípio, would have + particípio', 'If we had known, we would have helped.'],
          ['wish (presente)', 'wish + passado', 'I wish I spoke better English.'],
          ['wish (passado)', 'wish + had + particípio', 'I wish I had started earlier.'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'If I had more time, I would study every day.', traducao: 'Se eu tivesse mais tempo, estudaria todo dia.' },
          { texto: 'If I were you, I’d accept the offer.', traducao: 'Se eu fosse você, aceitaria a oferta.' },
          { texto: 'If we had checked the fence, the goats wouldn’t have escaped.', traducao: 'Se tivéssemos verificado a cerca, as cabras não teriam fugido.' },
          { texto: 'You should see a doctor if the fever doesn’t go down.', traducao: 'Você deveria ir ao médico se a febre não baixar.' },
          { texto: 'I wish I had learned English as a kid.', traducao: 'Queria ter aprendido inglês quando criança.' },
          { texto: 'We can’t deliver on Friday unless you pay today.', traducao: 'Não podemos entregar na sexta a menos que vocês paguem hoje.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'If I ___ more money, I would buy a tractor. (have)', resposta: 'had' },
          { tipo: 'lacuna', frase: 'If I ___ you, I’d wait. (be)', resposta: 'were' },
          { tipo: 'lacuna', frase: 'If it rains, we ___ stay inside.', resposta: ['’ll', 'will'] },
          { tipo: 'lacuna', frase: 'If I had known, I would ___ come.', resposta: 'have' },
          { tipo: 'lacuna', frase: 'I wish I ___ more time. (have, presente)', resposta: 'had' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['If I would have time, I would go.', 'If I had time, I would go.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"unless" =', opcoes: ['a menos que', 'desde que', 'embora'], correta: 0 },
          { tipo: 'ordenar', resposta: 'If I were you I would accept the offer', traducao: 'Se eu fosse você, aceitaria a oferta' },
          { tipo: 'ditado', texto: 'I wish I had started learning English earlier.', traducao: 'Queria ter começado a aprender inglês antes.' },
        ],
      },
    ],
  },
];

export const b1: ConteudoNivel<'b1'> = {
  'conversacao-independente': conversacaoIndependente,
  narrativas,
  opinioes,
  'situacoes-reais': situacoesReais,
  'precisao-gramatical': precisaoGramatical,
};
