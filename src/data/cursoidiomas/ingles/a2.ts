import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ──────────────────────── Conversação cotidiana ───────────────────────── */

const conversacaoCotidiana: Licao[] = [
  {
    id: 'compras-reclamar',
    titulo: 'Na loja: escolher, comparar, devolver',
    resumo: 'Comparativos (-er, more), superlativos, e como pedir troca ou reembolso com calma.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Comparativo**: adjetivo curto ganha **-er** (*cheap → cheaper*), longo ganha **more** (*expensive → more expensive*). "Do que" é **than**: *This shirt is cheaper than that one.* **Superlativo**: *-est* ou *the most*: *the cheapest, the most expensive*. Igualdade: **as … as** (*as good as*).

Irregulares que você usa todo dia: *good → better → the best*, *bad → worse → the worst*, *far → farther/further*.

Devolver: **I'd like to return this** (devolver), **Can I exchange it?** (trocar), **I'd like a refund** (reembolso). Nos EUA, a política de devolução (*return policy*) costuma ser generosa: 30 dias, com o recibo.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'store / shop', traducao: 'loja (EUA / Reino Unido)' },
          { termo: 'mall', traducao: 'shopping center' },
          { termo: 'size', traducao: 'tamanho', exemplo: 'What size are you?', exemploTraducao: 'Que tamanho você usa?' },
          { termo: 'to try on', traducao: 'provar (roupa)', exemplo: 'Can I try this on?', exemploTraducao: 'Posso provar?' },
          { termo: 'fitting room', traducao: 'provador', nota: 'dressing room nos EUA também' },
          { termo: 'to fit', traducao: 'servir (tamanho)', exemplo: 'It doesn’t fit.', exemploTraducao: 'Não serve.' },
          { termo: 'to suit / look good on', traducao: 'ficar bem em', exemplo: 'That color looks good on you.', exemploTraducao: 'Essa cor fica bem em você.' },
          { termo: 'too big / too small / too tight', traducao: 'grande demais / pequeno demais / apertado' },
          { termo: 'shirt / pants / jacket / shoes', traducao: 'camisa / calça / jaqueta / sapatos', nota: 'pants = calça nos EUA; no Reino Unido é trousers (pants lá é cueca)' },
          { termo: 'to return', traducao: 'devolver' },
          { termo: 'to exchange', traducao: 'trocar' },
          { termo: 'refund', traducao: 'reembolso' },
          { termo: 'receipt', traducao: 'recibo, cupom' },
          { termo: 'broken / damaged / defective', traducao: 'quebrado / danificado / com defeito' },
          { termo: 'sale / discount', traducao: 'liquidação / desconto' },
          { termo: 'warranty', traducao: 'garantia' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Devolvendo um produto',
        falas: [
          { quem: 'Customer', texto: 'Hi. I bought this lamp yesterday, but it doesn’t work.', traducao: 'Oi. Comprei esta luminária ontem, mas ela não funciona.' },
          { quem: 'Clerk', texto: 'Oh, I’m sorry about that. Do you have the receipt?', traducao: 'Ah, sinto muito. Você tem o recibo?' },
          { quem: 'Customer', texto: 'Yes, here it is. I’d like to exchange it or get a refund.', traducao: 'Sim, aqui está. Queria trocar ou receber o dinheiro de volta.' },
          { quem: 'Clerk', texto: 'No problem. Would you like the same model or a different one?', traducao: 'Sem problema. Quer o mesmo modelo ou outro?' },
          { quem: 'Customer', texto: 'The same one. Is this one cheaper than the other?', traducao: 'O mesmo. Este aqui é mais barato que o outro?' },
          { quem: 'Clerk', texto: 'Yes, it’s on sale — ten percent off.', traducao: 'É, está em promoção: dez por cento de desconto.' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Comparativos e superlativos',
        cabecalho: ['Adjetivo', 'Comparativo', 'Superlativo'],
        linhas: [
          ['cheap (barato)', 'cheaper', 'the cheapest'],
          ['big (grande)', 'bigger', 'the biggest'],
          ['easy (fácil)', 'easier', 'the easiest'],
          ['expensive (caro)', 'more expensive', 'the most expensive'],
          ['good (bom)', 'better', 'the best'],
          ['bad (ruim)', 'worse', 'the worst'],
          ['far (longe)', 'farther / further', 'the farthest / the furthest'],
        ],
        nota: 'Uma sílaba terminada em consoante-vogal-consoante dobra a consoante: big → bigger. Terminada em -y vira -ier: easy → easier.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'This shirt is ___ than that jacket. (cheap)', resposta: 'cheaper' },
          { tipo: 'lacuna', frase: 'This cheese is ___ than the other one. (good)', resposta: 'better' },
          { tipo: 'lacuna', frase: 'It’s the ___ hotel in town. (expensive)', resposta: 'most expensive' },
          { tipo: 'escolha', pergunta: '"It doesn’t fit" significa…', opcoes: ['Não combina', 'Não serve (tamanho)', 'Não está à venda'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Para devolver um produto você diz:', opcoes: ['I’d like to return this.', 'I’d like to try this on.', 'I’d like to pay for this.'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Nos EUA, "pants" é…', opcoes: ['cueca', 'calça'], correta: 1 },
          { tipo: 'traducao', origem: 'Posso provar?', resposta: ['Can I try it on?', 'Can I try this on?', 'May I try it on?', 'Could I try it on?'] },
          { tipo: 'ditado', texto: 'Do you have this in a bigger size?', traducao: 'Tem isso num tamanho maior?' },
        ],
      },
    ],
  },
  {
    id: 'medico-saude',
    titulo: 'No médico: corpo e saúde',
    resumo: 'Sintomas com "I have a…", "my back hurts", conselhos com "should", e o sistema de saúde americano.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Sintomas em inglês usam **have** com artigo: *I have **a** headache, **a** cold, **a** fever, **a** sore throat*. Dor num lugar específico: *My back **hurts**. My knee hurts.* Várias dores compostas: *headache, backache, stomachache, toothache*.

Conselho: **should / shouldn't** + verbo: *You should rest. You shouldn't drink alcohol.*

Nos EUA não há sistema público universal: vale o **health insurance** (plano) e a consulta costuma exigir **appointment**. Pequenas urgências: **urgent care**; emergência: **ER** (*emergency room*) ou o **911**. No Reino Unido, o **NHS** é público: o clínico é o **GP**, e a emergência é o **999**.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'O corpo',
        itens: [
          { termo: 'head / headache', traducao: 'cabeça / dor de cabeça', exemplo: 'I have a headache.', exemploTraducao: 'Estou com dor de cabeça.' },
          { termo: 'throat / sore throat', traducao: 'garganta / dor de garganta' },
          { termo: 'stomach / stomachache', traducao: 'estômago, barriga / dor de barriga', nota: 'STÂ-mâk' },
          { termo: 'back / backache', traducao: 'costas / dor nas costas' },
          { termo: 'arm / leg', traducao: 'braço / perna' },
          { termo: 'hand / foot (feet)', traducao: 'mão / pé (pés)' },
          { termo: 'eye / ear', traducao: 'olho / orelha, ouvido' },
          { termo: 'tooth (teeth) / toothache', traducao: 'dente (dentes) / dor de dente' },
          { termo: 'heart / chest', traducao: 'coração / peito' },
          { termo: 'knee / shoulder', traducao: 'joelho / ombro' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Sintomas e consulta',
        itens: [
          { termo: 'sick / ill', traducao: 'doente', nota: 'sick nos EUA; ill no Reino Unido' },
          { termo: 'to hurt', traducao: 'doer', exemplo: 'My leg hurts.', exemploTraducao: 'Minha perna dói.' },
          { termo: 'fever', traducao: 'febre' },
          { termo: 'a cold / the flu', traducao: 'um resfriado / a gripe' },
          { termo: 'cough', traducao: 'tosse', nota: '"cóf"' },
          { termo: 'runny nose', traducao: 'nariz escorrendo' },
          { termo: 'allergic to', traducao: 'alérgico a', exemplo: 'I’m allergic to nuts.', exemploTraducao: 'Sou alérgico a nozes.' },
          { termo: 'appointment', traducao: 'consulta marcada', exemplo: 'I’d like to make an appointment.', exemploTraducao: 'Quero marcar uma consulta.' },
          { termo: 'health insurance', traducao: 'plano de saúde' },
          { termo: 'prescription', traducao: 'receita médica', nota: 'a receita de cozinha é "recipe"' },
          { termo: 'medicine / pill', traducao: 'remédio / comprimido' },
          { termo: 'sick note / doctor’s note', traducao: 'atestado' },
          { termo: 'to rest', traducao: 'descansar' },
          { termo: 'should / shouldn’t', traducao: 'deveria / não deveria' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na consulta',
        falas: [
          { quem: 'Doctor', texto: 'Hi, Mr. Seabra. What seems to be the problem?', traducao: 'Olá, senhor Seabra. Qual parece ser o problema?' },
          { quem: 'Felipe', texto: 'I’ve had a sore throat and a cough for three days. And I feel really tired.', traducao: 'Estou com dor de garganta e tosse há três dias. E me sinto muito cansado.' },
          { quem: 'Doctor', texto: 'Do you have a fever?', traducao: 'Está com febre?' },
          { quem: 'Felipe', texto: 'Yes, it was a hundred and one last night.', traducao: 'Sim, estava em 101 ontem à noite.', },
          { quem: 'Doctor', texto: 'Open your mouth, please… OK, it’s a cold, not the flu.', traducao: 'Abra a boca, por favor… Certo, é um resfriado, não gripe.' },
          { quem: 'Doctor', texto: 'You should rest and drink lots of fluids. I’ll give you a note for work.', traducao: 'O senhor deve descansar e beber muito líquido. Vou lhe dar um atestado.' },
          { quem: 'Felipe', texto: 'Do I need any medicine?', traducao: 'Preciso de algum remédio?' },
          { quem: 'Doctor', texto: 'Just for the fever: one pill, up to three times a day.', traducao: 'Só para a febre: um comprimido, até três vezes ao dia.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'A febre americana é em Fahrenheit: 101 °F é cerca de 38,3 °C. 98,6 °F é a temperatura normal do corpo.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I have ___ headache.', resposta: 'a' },
          { tipo: 'lacuna', frase: 'My back ___. (dói)', resposta: 'hurts' },
          { tipo: 'lacuna', frase: 'You ___ see a doctor. (deveria)', resposta: 'should' },
          { tipo: 'escolha', pergunta: '"What seems to be the problem?" é…', opcoes: ['uma pergunta agressiva', 'o jeito padrão do médico perguntar o que você tem', 'uma pergunta sobre o pagamento'], correta: 1 },
          { tipo: 'escolha', pergunta: '"prescription" é…', opcoes: ['a receita de cozinha', 'a receita médica', 'a prescrição de um crime'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Emergência nos EUA:', opcoes: ['190', '911', '999'], correta: 1 },
          { tipo: 'traducao', origem: 'Quero marcar uma consulta.', resposta: ['I’d like to make an appointment.', 'I would like to make an appointment.', 'I want to make an appointment.'] },
          { tipo: 'ditado', texto: 'I’ve had a fever for two days.', traducao: 'Estou com febre há dois dias.' },
        ],
      },
    ],
  },
  {
    id: 'viagem-hotel',
    titulo: 'Aeroporto, trem e hotel',
    resumo: 'Check-in, gate, delayed, customs; passagem de ida e volta; e resolver um problema no quarto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `No aeroporto: **check in**, **boarding pass** (cartão de embarque), **gate** (portão), **delayed** (atrasado), **cancelled** (cancelado), **baggage claim** (esteira de bagagem), **customs** (alfândega). Na imigração vão perguntar **What's the purpose of your visit?** — responda curto: *Business* ou *Tourism*.

Passagem de trem: **one-way / round-trip** nos EUA, **single / return** no Reino Unido. Plataforma é **track** (EUA) ou **platform** (Reino Unido).

Chegar: **arrive in** + cidade ou país (*arrive in Boston*), **arrive at** + lugar menor (*arrive at the airport*). Nunca "arrive to".`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'No aeroporto e na estação',
        itens: [
          { termo: 'flight', traducao: 'voo' },
          { termo: 'to check in', traducao: 'fazer check-in' },
          { termo: 'boarding pass', traducao: 'cartão de embarque' },
          { termo: 'gate', traducao: 'portão de embarque', exemplo: 'Gate B12', exemploTraducao: 'portão B12' },
          { termo: 'aisle seat / window seat', traducao: 'assento no corredor / na janela', nota: 'aisle: "ail", o S é mudo' },
          { termo: 'delayed / cancelled', traducao: 'atrasado / cancelado' },
          { termo: 'layover / connection', traducao: 'escala / conexão' },
          { termo: 'baggage claim', traducao: 'restituição de bagagem' },
          { termo: 'carry-on / checked bag', traducao: 'bagagem de mão / bagagem despachada' },
          { termo: 'customs / immigration', traducao: 'alfândega / imigração' },
          { termo: 'one-way / round-trip ticket', traducao: 'passagem só de ida / ida e volta (EUA)', nota: 'single / return no Reino Unido' },
          { termo: 'track / platform', traducao: 'plataforma (EUA / Reino Unido)' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'No hotel',
        itens: [
          { termo: 'single room / double room', traducao: 'quarto de solteiro / de casal' },
          { termo: 'reservation / booking', traducao: 'reserva' },
          { termo: 'front desk / reception', traducao: 'recepção' },
          { termo: 'to check in / to check out', traducao: 'fazer check-in / check-out' },
          { termo: 'key card', traducao: 'cartão-chave' },
          { termo: 'elevator / lift', traducao: 'elevador (EUA / Reino Unido)' },
          { termo: 'floor', traducao: 'andar', nota: 'nos EUA o térreo é o "first floor"; no Reino Unido é o "ground floor"' },
          { termo: 'Wi-Fi password', traducao: 'senha do Wi-Fi' },
          { termo: 'heating / air conditioning (AC)', traducao: 'aquecimento / ar-condicionado' },
          { termo: 'towel', traducao: 'toalha' },
          { termo: 'noisy / quiet', traducao: 'barulhento / silencioso' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Problema no quarto',
        falas: [
          { quem: 'Guest', texto: 'Hi, I’m in room 214. The heating isn’t working and it’s really cold.', traducao: 'Oi, estou no quarto 214. O aquecimento não está funcionando e está muito frio.' },
          { quem: 'Front desk', texto: 'I’m so sorry. I’ll send someone up right away.', traducao: 'Sinto muito. Vou mandar alguém subir agora mesmo.' },
          { quem: 'Guest', texto: 'Thanks. And could I get an extra towel, please?', traducao: 'Obrigado. E poderia ter uma toalha extra, por favor?' },
          { quem: 'Front desk', texto: 'Of course. Anything else?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Guest', texto: 'Yes — what time is the first train to New York tomorrow?', traducao: 'Sim: a que horas sai o primeiro trem para Nova York amanhã?' },
          { quem: 'Front desk', texto: 'At 6:12, from track 3. You’ll need to change in Philadelphia.', traducao: 'Às 6h12, da plataforma 3. O senhor vai precisar trocar de trem na Filadélfia.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'We arrived ___ Boston at night.', resposta: 'in' },
          { tipo: 'lacuna', frase: 'We arrived ___ the airport at six.', resposta: 'at' },
          { tipo: 'lacuna', frase: 'My flight is ___. (atrasado)', resposta: 'delayed' },
          { tipo: 'escolha', pergunta: '"round-trip ticket" é…', opcoes: ['passagem só de ida', 'passagem de ida e volta', 'passagem de trem circular'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Nos EUA, o "first floor" é…', opcoes: ['o primeiro andar acima do térreo', 'o térreo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"What’s the purpose of your visit?" — resposta adequada:', opcoes: ['Business.', 'I don’t know.', 'Why do you ask?'], correta: 0 },
          { tipo: 'traducao', origem: 'O aquecimento não está funcionando.', resposta: ['The heating isn’t working.', 'The heating is not working.', 'The heating doesn’t work.'] },
          { tipo: 'ditado', texto: 'Where is the baggage claim, please?', traducao: 'Onde fica a esteira de bagagem, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'trabalho-profissoes',
    titulo: 'No trabalho',
    resumo: 'Vocabulário de escritório e de campo, falar do próprio trabalho e ligar ideias com "because" e "so".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Falar de trabalho pede três preposições: **work for** + empresa (*I work for a software company*), **work at** + lugar (*I work at a bank*), **work in** + área (*I work in agriculture*). E **work as** + função: *I work as a consultant*.

Ligar ideias: **because** (porque, causa) e **so** (então, consequência). *I'm learning English **because** I have American clients. I have American clients, **so** I'm learning English.* A ordem das palavras não muda — o inglês não tem a regra do verbo no fim do alemão.

Férias: **vacation** nos EUA, **holiday** no Reino Unido. Dia de folga: **day off**.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'job / work', traducao: 'emprego / trabalho', nota: 'job é contável (a job); work não' },
          { termo: 'position', traducao: 'cargo, vaga' },
          { termo: 'boss / manager', traducao: 'chefe / gerente' },
          { termo: 'coworker / colleague', traducao: 'colega de trabalho' },
          { termo: 'employee / staff', traducao: 'funcionário / equipe' },
          { termo: 'customer / client', traducao: 'cliente (de loja / de serviço)' },
          { termo: 'office', traducao: 'escritório' },
          { termo: 'meeting', traducao: 'reunião' },
          { termo: 'salary / wage', traducao: 'salário (mensal, anual) / salário por hora' },
          { termo: 'vacation / holiday', traducao: 'férias (EUA / Reino Unido)' },
          { termo: 'day off', traducao: 'dia de folga' },
          { termo: 'overtime', traducao: 'hora extra' },
          { termo: 'full-time / part-time', traducao: 'tempo integral / meio período' },
          { termo: 'self-employed', traducao: 'autônomo' },
          { termo: 'to hire / to fire / to quit', traducao: 'contratar / demitir / pedir demissão' },
          { termo: 'barn', traducao: 'estábulo, galpão' },
          { termo: 'herd', traducao: 'rebanho' },
          { termo: 'pasture', traducao: 'pasto' },
          { termo: 'feed', traducao: 'ração, alimento dos animais' },
          { termo: 'milking machine', traducao: 'ordenhadeira' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I work for a software company.', traducao: 'Trabalho numa empresa de software.' },
          { texto: 'I work as a consultant.', traducao: 'Trabalho como consultor.' },
          { texto: 'I’m in charge of sales.', traducao: 'Sou responsável pelas vendas.' },
          { texto: 'We have a farm with 300 goats.', traducao: 'Temos uma fazenda com 300 cabras.' },
          { texto: 'I’m learning English because I have clients in the US.', traducao: 'Estou aprendendo inglês porque tenho clientes nos EUA.' },
          { texto: 'I have a meeting tomorrow, so I can’t come.', traducao: 'Tenho reunião amanhã, então não posso vir.' },
          { texto: 'I’m taking the day off on Friday.', traducao: 'Vou tirar folga na sexta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I work ___ a big company. (para)', resposta: 'for' },
          { tipo: 'lacuna', frase: 'She works ___ a nurse. (como)', resposta: 'as' },
          { tipo: 'lacuna', frase: 'It’s raining, ___ we’re staying in the barn. (então)', resposta: 'so' },
          { tipo: 'lacuna', frase: 'I’m tired ___ I worked all night. (porque)', resposta: 'because' },
          { tipo: 'escolha', pergunta: '"to quit" =', opcoes: ['demitir alguém', 'pedir demissão', 'tirar férias'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I’m in charge of the herd" =', opcoes: ['Estou cobrando o rebanho', 'Sou responsável pelo rebanho', 'Estou vendendo o rebanho'], correta: 1 },
          { tipo: 'traducao', origem: 'Estou de férias.', resposta: ['I’m on vacation.', 'I’m on holiday.', 'I am on vacation.', 'I am on holiday.'] },
          { tipo: 'ditado', texto: 'I can’t come because I have to work.', traducao: 'Não posso vir porque tenho que trabalhar.' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Tempos verbais fundamentais ──────────────────── */

const temposVerbais: Licao[] = [
  {
    id: 'presente-simples-continuo',
    titulo: 'Present simple × present continuous',
    resumo: 'Hábito ou agora? E os verbos que nunca vão para o -ing.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês separa com rigor dois presentes:

- **Present simple** — hábitos, fatos, rotina: *I work in agriculture. Goats eat grass.*
- **Present continuous** (*am/is/are + -ing*) — o que está acontecendo **agora** ou **neste período**: *I'm working from home this week. Look, it's raining!*

O português usa as duas formas com mais liberdade ("trabalho em casa esta semana"). Em inglês, *I work from home this week* soa estranho: é temporário, pede *-ing*.

**Verbos de estado** não vão para o contínuo, mesmo "agora": *know, understand, believe, like, love, want, need, own, belong, seem*. *I **know** the answer* — nunca "I'm knowing". *I **need** help now.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os dois presentes',
        cabecalho: ['', 'Present simple', 'Present continuous'],
        linhas: [
          ['Afirmativa', 'She works on the farm.', 'She’s working on the farm (now).'],
          ['Negativa', 'She doesn’t work on Sundays.', 'She isn’t working today.'],
          ['Pergunta', 'Does she work here?', 'Is she working right now?'],
          ['Marcadores', 'always, usually, every day, on Mondays', 'now, right now, at the moment, this week, today'],
        ],
        nota: 'Grafia do -ing: make → making (tira o e), run → running (dobra), lie → lying (ie vira y).',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I usually drive to work, but today I’m taking the bus.', traducao: 'Geralmente vou de carro, mas hoje estou indo de ônibus.' },
          { texto: 'What are you doing? — I’m feeding the goats.', traducao: 'O que você está fazendo? — Estou alimentando as cabras.' },
          { texto: 'What do you do? — I’m a farmer.', traducao: 'O que você faz? — Sou produtor rural.', nota: 'profissão: present simple' },
          { texto: 'We’re building a new barn this year.', traducao: 'Estamos construindo um estábulo novo este ano.' },
          { texto: 'I don’t understand what you mean.', traducao: 'Não entendo o que você quer dizer.', nota: 'verbo de estado: nunca "I’m not understanding"' },
          { texto: 'Prices are going up.', traducao: 'Os preços estão subindo.', nota: 'tendência em curso' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Look! It ___. (rain, agora)', resposta: ['’s raining', 'is raining'] },
          { tipo: 'lacuna', frase: 'She ___ to work every day. (drive)', resposta: 'drives' },
          { tipo: 'lacuna', frase: 'I ___ from home this week. (work)', resposta: ['’m working', 'am working'] },
          { tipo: 'lacuna', frase: 'What ___ you doing right now?', resposta: 'are' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I’m knowing him for years.', 'I know him.', 'I am know him.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Estou precisando de ajuda" =', opcoes: ['I’m needing help.', 'I need help.'], correta: 1, explicacao: 'need é verbo de estado.' },
          { tipo: 'ordenar', resposta: 'We are building a new barn this year', traducao: 'Estamos construindo um estábulo novo este ano' },
          { tipo: 'ditado', texto: 'I usually drive, but today I’m taking the bus.', traducao: 'Geralmente vou de carro, mas hoje estou indo de ônibus.' },
        ],
      },
    ],
  },
  {
    id: 'past-simple',
    titulo: 'O passado: past simple',
    resumo: '-ed nos regulares, a lista dos irregulares que importam, e o "did" nas perguntas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **past simple** conta ações terminadas num momento definido: *yesterday, last week, in 2019, two days ago*.

- **Regulares**: + **-ed** (*work → worked, live → lived, stop → stopped, study → studied*). Lembre-se da pronúncia: *worked* é uma sílaba só.
- **Irregulares**: forma própria, a decorar. São poucos, mas são os mais usados.
- **Pergunta e negativa** com **did** + verbo no infinitivo: *Did you go? I didn't go.* Nunca "Did you went?".
- **To be** tem passado próprio: **was** (I, he, she, it) e **were** (you, we, they).

**Ago** = "atrás", depois do tempo: *two years ago* (há dois anos).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Irregulares essenciais',
        cabecalho: ['Infinitivo', 'Passado', 'Tradução'],
        linhas: [
          ['be', 'was / were', 'ser, estar'],
          ['have', 'had', 'ter'],
          ['do', 'did', 'fazer'],
          ['go', 'went', 'ir'],
          ['come', 'came', 'vir'],
          ['see', 'saw', 'ver'],
          ['get', 'got', 'conseguir, receber, chegar'],
          ['make', 'made', 'fazer (fabricar)'],
          ['take', 'took', 'pegar, levar'],
          ['give', 'gave', 'dar'],
          ['buy', 'bought', 'comprar'],
          ['think', 'thought', 'pensar'],
          ['say / tell', 'said / told', 'dizer / contar'],
          ['know', 'knew', 'saber, conhecer'],
          ['find', 'found', 'achar'],
          ['leave', 'left', 'partir, deixar'],
          ['meet', 'met', 'conhecer, encontrar'],
          ['pay', 'paid', 'pagar'],
          ['send', 'sent', 'enviar'],
          ['speak', 'spoke', 'falar'],
          ['write', 'wrote', 'escrever'],
          ['eat / drink', 'ate / drank', 'comer / beber'],
          ['feel', 'felt', 'sentir'],
          ['bring', 'brought', 'trazer'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'What did you do last weekend?', traducao: 'O que você fez no fim de semana passado?' },
          { texto: 'I worked on Saturday and then I met some friends.', traducao: 'Trabalhei no sábado e depois encontrei uns amigos.' },
          { texto: 'We went to Chicago two years ago.', traducao: 'Fomos a Chicago há dois anos.' },
          { texto: 'I didn’t understand the question.', traducao: 'Não entendi a pergunta.' },
          { texto: 'Where were you yesterday? — I was at home.', traducao: 'Onde você estava ontem? — Em casa.' },
          { texto: 'Did you get my email? — Yes, I did.', traducao: 'Recebeu meu e-mail? — Recebi.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ a new car last month. (buy)', resposta: 'bought' },
          { tipo: 'lacuna', frase: 'We ___ to the beach yesterday. (go)', resposta: 'went' },
          { tipo: 'lacuna', frase: 'She ___ me a message. (send)', resposta: 'sent' },
          { tipo: 'lacuna', frase: '___ you see the game?', resposta: 'Did' },
          { tipo: 'lacuna', frase: 'They ___ at the office yesterday. (be)', resposta: 'were' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Did you went?', 'Did you go?', 'Do you went?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Há três anos" =', opcoes: ['three years ago', 'ago three years', 'since three years'], correta: 0 },
          { tipo: 'ordenar', resposta: 'I met my wife ten years ago', traducao: 'Conheci minha esposa há dez anos' },
          { tipo: 'ditado', texto: 'What did you do last weekend?', traducao: 'O que você fez no fim de semana passado?' },
        ],
      },
    ],
  },
  {
    id: 'present-perfect',
    titulo: 'Present perfect: o tempo que o português não tem',
    resumo: 'have + particípio para experiências, períodos abertos e "desde". O erro nº 1: "I live here since 2020".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **present perfect** (*have/has + particípio*) liga o passado ao presente. Não existe equivalente exato em português, por isso é o tempo que mais separa o brasileiro do inglês natural. Quatro usos:

1. **Experiência de vida, sem data**: *I've been to London. Have you ever tried goat cheese?*
2. **Período que ainda não acabou**: *I've drunk three coffees today. We've sold 200 kids this year.*
3. **Novidade, com just / already / yet**: *I've just arrived. She's already left. Have you finished yet?*
4. **Duração até agora, com for / since**: *I've lived here **for** five years / **since** 2020.*

O quarto é o erro nº 1: em português dizemos "moro aqui desde 2020" no presente. Em inglês, com *for/since*, é **present perfect**: *I have lived here since 2020*. "I live here since 2020" está errado.

A regra de ouro: **com data ou momento terminado, past simple**. *I went to London **in 2019*** (nunca "I've been to London in 2019").`,
      },
      {
        tipo: 'tabela',
        titulo: 'Particípios que você precisa',
        cabecalho: ['Infinitivo', 'Passado', 'Particípio'],
        linhas: [
          ['be', 'was / were', 'been'],
          ['have', 'had', 'had'],
          ['do', 'did', 'done'],
          ['go', 'went', 'gone / been'],
          ['see', 'saw', 'seen'],
          ['eat', 'ate', 'eaten'],
          ['write', 'wrote', 'written'],
          ['take', 'took', 'taken'],
          ['make', 'made', 'made'],
          ['know', 'knew', 'known'],
          ['speak', 'spoke', 'spoken'],
          ['buy', 'bought', 'bought'],
          ['work (regular)', 'worked', 'worked'],
        ],
        nota: '"been to" = foi e voltou (experiência); "gone to" = foi e ainda está lá. She’s been to Paris (já foi) × She’s gone to Paris (está em Paris agora).',
      },
      {
        tipo: 'tabela',
        titulo: 'for × since',
        cabecalho: ['for + duração', 'since + ponto de início'],
        linhas: [
          ['for two years', 'since 2024'],
          ['for three days', 'since Monday'],
          ['for a long time', 'since I was a child'],
          ['for six months', 'since last summer'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Have you ever been to the United States? — Yes, twice.', traducao: 'Você já foi aos Estados Unidos? — Sim, duas vezes.' },
          { texto: 'I’ve never tried haggis.', traducao: 'Nunca provei haggis.' },
          { texto: 'We’ve had this farm for fifteen years.', traducao: 'Temos esta fazenda há quinze anos.' },
          { texto: 'I’ve worked here since 2011.', traducao: 'Trabalho aqui desde 2011.' },
          { texto: 'I’ve just sent you the report.', traducao: 'Acabei de te mandar o relatório.' },
          { texto: 'Have you finished yet? — Not yet.', traducao: 'Já terminou? — Ainda não.' },
          { texto: 'I went to London in 2019.', traducao: 'Fui a Londres em 2019.', nota: 'data definida: past simple' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ lived here since 2020.', resposta: 'have' },
          { tipo: 'lacuna', frase: 'She has ___ to Japan twice. (be)', resposta: 'been' },
          { tipo: 'lacuna', frase: 'We’ve known each other ___ ten years.', resposta: 'for' },
          { tipo: 'lacuna', frase: 'I’ve worked here ___ January.', resposta: 'since' },
          { tipo: 'lacuna', frase: 'Have you ___ eaten goat cheese? (alguma vez)', resposta: 'ever' },
          { tipo: 'escolha', pergunta: '"Moro aqui há cinco anos" =', opcoes: ['I live here for five years.', 'I’ve lived here for five years.', 'I lived here since five years.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I’ve been to London in 2019.', 'I went to London in 2019.'], correta: 1, explicacao: 'Com data terminada, past simple.' },
          { tipo: 'escolha', pergunta: '"She’s gone to Paris" significa…', opcoes: ['ela já foi a Paris alguma vez', 'ela foi para Paris e está lá'], correta: 1 },
          { tipo: 'ditado', texto: 'Have you ever been to the United States?', traducao: 'Você já foi aos Estados Unidos?' },
        ],
      },
    ],
  },
  {
    id: 'futuro-modais',
    titulo: 'Futuro e modais',
    resumo: 'will × going to × presente contínuo, e can, must, have to, should — com a armadilha do "don’t have to".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Três futuros, cada um com seu uso:

- **going to** — plano já decidido, ou previsão com evidência: *I'm going to buy a new tractor. Look at those clouds — it's going to rain.*
- **will** — decisão tomada na hora, promessa, previsão genérica: *I'll call you later. Don't worry, I'll help you. I think it will be fine.*
- **present continuous** — compromisso marcado: *I'm meeting the vet on Friday.*

**Modais** vêm antes do verbo no infinitivo sem *to* e não mudam na terceira pessoa: *she can*, nunca "she cans".

A armadilha, igual à do alemão: **mustn't** = proibido; **don't have to** = não precisa. *You mustn't smoke here* (é proibido) × *You don't have to come* (não é obrigatório).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Modais essenciais',
        cabecalho: ['Modal', 'Uso', 'Exemplo'],
        linhas: [
          ['can / can’t', 'habilidade, permissão, possibilidade', 'Can you help me? I can’t swim.'],
          ['could', 'pedido educado, habilidade no passado', 'Could you repeat that? I could read at five.'],
          ['must / mustn’t', 'obrigação forte / proibição', 'You must wear a helmet. You mustn’t park here.'],
          ['have to / don’t have to', 'obrigação externa / não precisa', 'I have to work tomorrow. You don’t have to pay.'],
          ['should / shouldn’t', 'conselho', 'You should rest.'],
          ['may / might', 'possibilidade', 'It might rain. I may be late.'],
          ['will / won’t', 'futuro, promessa', 'I won’t tell anyone.'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I’m going to visit a farm in Wisconsin next month.', traducao: 'Vou visitar uma fazenda em Wisconsin no mês que vem.' },
          { texto: 'The phone’s ringing. — I’ll get it!', traducao: 'O telefone está tocando. — Eu atendo!', nota: 'decisão na hora: will' },
          { texto: 'I’m meeting the client at ten tomorrow.', traducao: 'Vou encontrar o cliente às dez amanhã.' },
          { texto: 'You don’t have to bring anything.', traducao: 'Você não precisa trazer nada.' },
          { texto: 'You mustn’t feed the animals.', traducao: 'É proibido alimentar os animais.' },
          { texto: 'It might snow tonight.', traducao: 'Pode nevar esta noite.' },
          { texto: 'Could you send me the invoice?', traducao: 'Poderia me mandar a fatura?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I’m ___ to buy a new tractor next year. (plano)', resposta: 'going' },
          { tipo: 'lacuna', frase: 'Don’t worry, I ___ help you. (promessa)', resposta: ['’ll', 'will'] },
          { tipo: 'lacuna', frase: 'You ___ rest. (conselho)', resposta: 'should' },
          { tipo: 'lacuna', frase: 'She ___ speak three languages. (sabe)', resposta: 'can' },
          { tipo: 'escolha', pergunta: '"You don’t have to come" =', opcoes: ['Você está proibido de vir', 'Você não precisa vir'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O telefone toca e você decide atender:', opcoes: ['I’m going to answer it.', 'I’ll get it!'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['She cans drive.', 'She can drive.', 'She can to drive.'], correta: 1 },
          { tipo: 'ditado', texto: 'It might rain tomorrow, so bring an umbrella.', traducao: 'Pode chover amanhã, então traga um guarda-chuva.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Compreensão oral ─────────────────────────── */

const compreensaoOral: Licao[] = [
  {
    id: 'recados-anuncios',
    titulo: 'Recados e anúncios',
    resumo: 'Aeroporto, trem, secretária eletrônica: pegar o essencial de primeira. Ditados curtos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Nas lições de compreensão oral, o navegador lê o texto e você escreve o que ouviu. Método: ouça **uma vez inteira** sem escrever, só para pegar o sentido; ouça de novo e escreva; confira. O **Áudio lento** existe, mas tente primeiro na velocidade normal.

O inglês falado encurta tudo: *I'm, you're, it's, don't, we'll*. Escreva as contrações como ouvir — o corretor aceita as duas formas quando elas estão nas respostas.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas que você vai ouvir',
        itens: [
          { texto: 'Attention, please. Flight 482 to Chicago is now boarding at gate 12.', traducao: 'Atenção. O voo 482 para Chicago está embarcando no portão 12.' },
          { texto: 'We regret to announce that the 10:15 train to Boston has been cancelled.', traducao: 'Lamentamos informar que o trem das 10h15 para Boston foi cancelado.' },
          { texto: 'The next stop is Union Station. Doors open on the left.', traducao: 'Próxima parada: Union Station. As portas abrem à esquerda.' },
          { texto: 'Hi, you’ve reached Sarah Walker. Please leave a message after the beep.', traducao: 'Oi, aqui é a Sarah Walker. Deixe um recado após o sinal.' },
          { texto: 'Hey Felipe, it’s Jake. Call me back when you get a chance. It’s important.', traducao: 'E aí, Felipe, é o Jake. Me liga quando puder. É importante.' },
          { texto: 'Our office hours are Monday through Friday, nine to five.', traducao: 'Nosso horário é de segunda a sexta, das nove às cinco.', nota: '"through" = até, inclusive (EUA)' },
          { texto: 'The meeting has been moved to Thursday.', traducao: 'A reunião foi transferida para quinta.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'Flight 482 to Chicago is now boarding at gate 12.', traducao: 'O voo 482 para Chicago está embarcando no portão 12.' },
          { tipo: 'ditado', texto: 'Please leave a message after the beep.', traducao: 'Deixe um recado após o sinal.' },
          { tipo: 'ditado', texto: 'Hi, it’s Anna. Call me back, please.', traducao: 'Oi, é a Anna. Me liga de volta, por favor.' },
          { tipo: 'ditado', texto: 'We’re open from nine to five, Monday through Friday.', traducao: 'Abrimos das nove às cinco, de segunda a sexta.' },
          { tipo: 'ditado', texto: 'The meeting is tomorrow at ten in the office.', traducao: 'A reunião é amanhã às dez, no escritório.' },
          { tipo: 'escolha', pergunta: 'Ouça de novo o quinto ditado. Quando é a reunião?', opcoes: ['Hoje às 10', 'Amanhã às 10', 'Amanhã às 9'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'dialogos-cotidiano',
    titulo: 'Diálogos do cotidiano de ouvido',
    resumo: 'Cafeteria, vizinho, telefone: escreva o que ouviu e responda sobre o conteúdo.',
    blocos: [
      {
        tipo: 'dialogo',
        titulo: 'Ouça primeiro sem ler (use o botão do título)',
        falas: [
          { quem: 'Barista', texto: 'Hi! What can I get started for you?', traducao: 'Oi! O que vai querer?' },
          { quem: 'Customer', texto: 'A medium latte and a blueberry muffin, please.', traducao: 'Um latte médio e um muffin de mirtilo, por favor.' },
          { quem: 'Barista', texto: 'Can I get a name for the order? — Felipe. — That’ll be seven twenty.', traducao: 'Um nome para o pedido? — Felipe. — Dá sete e vinte.' },
          { quem: 'Neighbor', texto: 'Hi there! Are you new in the building?', traducao: 'Olá! Você é novo no prédio?' },
          { quem: 'Felipe', texto: 'Yeah, I moved in last week. I’m on the third floor.', traducao: 'Sou, me mudei semana passada. Estou no terceiro andar.' },
          { quem: 'Neighbor', texto: 'Welcome! If you need anything, just knock.', traducao: 'Bem-vindo! Se precisar de algo, é só bater.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados e compreensão',
        questoes: [
          { tipo: 'ditado', texto: 'A medium latte and a blueberry muffin, please.', traducao: 'Um latte médio e um muffin de mirtilo.' },
          { tipo: 'ditado', texto: 'Are you new in the building?', traducao: 'Você é novo no prédio?' },
          { tipo: 'ditado', texto: 'I moved in last week. I’m on the third floor.', traducao: 'Me mudei semana passada. Estou no terceiro andar.' },
          { tipo: 'ditado', texto: 'If you need anything, just knock.', traducao: 'Se precisar de algo, é só bater.' },
          { tipo: 'escolha', pergunta: 'Quanto custou o pedido na cafeteria?', opcoes: ['$7.20', '$2.70', '$7.02'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Em que andar mora o Felipe?', opcoes: ['segundo', 'terceiro', 'quarto'], correta: 1 },
          { tipo: 'ditado', texto: 'Sorry, I didn’t catch that. Could you say it again?', traducao: 'Desculpe, não peguei. Pode repetir?' },
        ],
      },
    ],
  },
  {
    id: 'numeros-datas-ouvido',
    titulo: 'Números, datas e horas de ouvido',
    resumo: 'O que mais se perde ao telefone: -teen × -ty, preços, datas no formato americano e telefones.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Números de ouvido são o teste mais honesto: não há contexto para adivinhar. As armadilhas: **-teen × -ty** (*fifteen* 15 × *fifty* 50 — escute onde cai o acento), preços ditos sem "dollars" (*twelve ninety-nine*) e telefones com *oh* e *double*.

**Datas** com ordinal: *first, second, third, fourth, fifth… twentieth, twenty-first*. Nos EUA diz-se *May third*; no Reino Unido, *the third of May*. E a escrita inverte: **05/03** é 3 de maio nos EUA e 5 de março no Reino Unido.

Escreva os números em algarismos ou por extenso nos ditados abaixo — o corretor compara o texto; na dúvida, use a opção "minha resposta também vale".`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ditado', texto: 'That comes to fourteen ninety.', traducao: 'Dá 14,90.' },
          { tipo: 'ditado', texto: 'Your appointment is on May third at ten thirty.', traducao: 'Sua consulta é em 3 de maio às 10h30.' },
          { tipo: 'ditado', texto: 'My number is five five five, oh one double seven.', traducao: 'Meu número é 555 0177.' },
          { tipo: 'ditado', texto: 'The train leaves at four forty-five.', traducao: 'O trem sai às 16h45.' },
          { tipo: 'ditado', texto: 'I was born on August twentieth.', traducao: 'Nasci em 20 de agosto.' },
          { tipo: 'escolha', pergunta: 'Ouça: "fifteen". É…', opcoes: ['15', '50'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Num formulário americano, "05/03/2026" é…', opcoes: ['5 de março', '3 de maio'], correta: 1 },
          { tipo: 'escolha', pergunta: '"the twenty-first" é o dia…', opcoes: ['12', '21', '20'], correta: 1 },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Escrita simples ──────────────────────────── */

const escritaSimples: Licao[] = [
  {
    id: 'email-informal',
    titulo: 'E-mail e mensagem informal',
    resumo: 'Abertura, fechamento, abreviações de mensagem e um modelo para um amigo ou colega próximo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura de um e-mail informal:

1. **Saudação**: *Hi Jake,* / *Hey Anna,* / *Dear Anna,* (afetuoso, não formal entre amigos).
2. **Abertura**: *How are you? Hope you're doing well.*
3. **Corpo**: uma ideia por parágrafo; past simple para o que aconteceu.
4. **Fechamento**: *Best,* / *Cheers,* (britânico) / *Take care,* / *Talk soon,* / *Love,* (família).
5. **Nome**.

Mensagens de celular usam abreviações: *btw* (by the way, aliás), *asap* (o quanto antes), *tbh* (to be honest), *idk* (I don't know), *thx* (thanks), *lol* (risada). Use com quem já usa com você.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> Hi Jake,
>
> How are you? I've been in Madison since Monday and the dairy expo was amazing. I met a lot of farmers and even gave a short demo of the app — in English!
>
> I'm flying back to Curitiba on Saturday. Are you free on Sunday? We could have lunch together.
>
> Talk soon,
> Felipe

Oi Jake, tudo bem? Estou em Madison desde segunda e a feira de leite foi incrível. Conheci muitos produtores e até fiz uma demonstração curta do app, em inglês! Volto para Curitiba no sábado. Você está livre no domingo? Poderíamos almoçar juntos. Até logo, Felipe.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Fórmulas',
        itens: [
          { termo: 'Hi Jake, / Hey Anna,', traducao: 'Oi Jake, / E aí, Anna,' },
          { termo: 'Hi everyone, / Hi all,', traducao: 'Olá a todos,' },
          { termo: 'Hope you’re doing well.', traducao: 'Espero que esteja bem.' },
          { termo: 'Thanks for your message.', traducao: 'Obrigado pela mensagem.' },
          { termo: 'Just wanted to let you know that…', traducao: 'Só queria te avisar que…' },
          { termo: 'Are you free on…?', traducao: 'Você está livre no/na…?' },
          { termo: 'Let me know!', traducao: 'Me avisa!' },
          { termo: 'Talk soon, / Take care,', traducao: 'Até logo, / Se cuida,' },
          { termo: 'Best, / Cheers,', traducao: 'Abraço, (neutro / britânico)' },
          { termo: 'btw / asap / tbh', traducao: 'aliás / o quanto antes / sinceramente' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Fecho informal para um colega próximo:', opcoes: ['Yours faithfully,', 'Talk soon,', 'Respectfully submitted,'], correta: 1 },
          { tipo: 'escolha', pergunta: '"asap" numa mensagem significa…', opcoes: ['as soon as possible', 'always say a prayer', 'at some point'], correta: 0 },
          { tipo: 'lacuna', frase: '___ you’re doing well. (espero que)', resposta: 'Hope' },
          { tipo: 'traducao', origem: 'Obrigado pela mensagem.', resposta: ['Thanks for your message.', 'Thank you for your message.', 'Thanks for the message.'] },
          { tipo: 'traducao', origem: 'Você está livre no domingo?', resposta: ['Are you free on Sunday?', 'Are you free Sunday?'] },
          { tipo: 'ordenar', resposta: 'I met a lot of farmers', traducao: 'Conheci muitos produtores' },
        ],
      },
    ],
  },
  {
    id: 'formularios-dados',
    titulo: 'Formulários e dados pessoais',
    resumo: 'First name, last name, a data de nascimento invertida dos EUA e o endereço com o número na frente.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Formulários em inglês são padronizados, mas têm três armadilhas para o brasileiro:

1. **Data**: nos EUA é **MM/DD/YYYY** (mês antes do dia). 03/05/1986 é 5 de março. No Reino Unido é como no Brasil.
2. **Nome**: *First name* é o primeiro nome; *Last name* (ou *Surname*) é o sobrenome; *Middle name/initial* é o nome do meio. Brasileiros com vários sobrenomes costumam pôr o último em *Last name*.
3. **Endereço**: número **antes** da rua (*123 Main Street*), depois cidade, estado e **ZIP code** (CEP americano) ou **postcode** (britânico).

*N/A* (not applicable) é o "não se aplica". *Please print* pede letra de forma.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'first name / last name', traducao: 'nome / sobrenome' },
          { termo: 'middle name / middle initial', traducao: 'nome do meio / inicial do nome do meio' },
          { termo: 'date of birth (DOB)', traducao: 'data de nascimento', nota: 'EUA: MM/DD/YYYY' },
          { termo: 'place of birth', traducao: 'local de nascimento' },
          { termo: 'nationality / citizenship', traducao: 'nacionalidade / cidadania' },
          { termo: 'address', traducao: 'endereço' },
          { termo: 'street / apartment (Apt.)', traducao: 'rua / apartamento' },
          { termo: 'ZIP code / postcode', traducao: 'CEP (EUA / Reino Unido)' },
          { termo: 'state / country', traducao: 'estado / país' },
          { termo: 'phone number / cell', traducao: 'telefone / celular' },
          { termo: 'email address', traducao: 'e-mail' },
          { termo: 'marital status', traducao: 'estado civil', nota: 'single, married, divorced, widowed' },
          { termo: 'occupation', traducao: 'profissão' },
          { termo: 'signature / to sign', traducao: 'assinatura / assinar' },
          { termo: 'passport / ID', traducao: 'passaporte / documento de identidade' },
          { termo: 'to fill out / fill in', traducao: 'preencher (EUA / Reino Unido)' },
          { termo: 'please print', traducao: 'use letra de forma' },
          { termo: 'check the box', traducao: 'marque a caixa', nota: 'tick the box no Reino Unido' },
          { termo: 'N/A', traducao: 'não se aplica' },
          { termo: 'required field', traducao: 'campo obrigatório' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'What’s your last name? — Seabra. S-E-A-B-R-A.', traducao: 'Qual é o seu sobrenome? — Seabra.' },
          { texto: 'What’s your date of birth? — August 20th, 1986.', traducao: 'Qual sua data de nascimento? — 20 de agosto de 1986.' },
          { texto: 'What’s your address? — 123 Main Street, Apartment 4B.', traducao: 'Qual seu endereço? — Rua Main, 123, apartamento 4B.' },
          { texto: 'Please sign here.', traducao: 'Assine aqui, por favor.' },
          { texto: 'Can I see some ID?', traducao: 'Posso ver um documento?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No campo "First name" você escreve…', opcoes: ['Seabra', 'Felipe'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num formulário americano, "DOB: 11/05/1990" é…', opcoes: ['11 de maio de 1990', '5 de novembro de 1990'], correta: 1 },
          { tipo: 'escolha', pergunta: '"ZIP code" é…', opcoes: ['o CEP', 'a senha', 'o código do país'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Marital status: single" =', opcoes: ['casado', 'solteiro', 'viúvo'], correta: 1 },
          { tipo: 'lacuna', frase: 'Please ___ here. (assinar)', resposta: 'sign' },
          { tipo: 'traducao', origem: 'Qual é o seu sobrenome?', resposta: ['What’s your last name?', 'What is your last name?', 'What’s your surname?', 'What is your surname?'] },
          { tipo: 'ditado', texto: 'Could you fill out this form, please?', traducao: 'Poderia preencher este formulário, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'descrever-pessoa-lugar',
    titulo: 'Descrever uma pessoa e um lugar',
    resumo: 'Aparência e personalidade, "look like" × "be like", e um parágrafo descritivo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Duas perguntas que parecem iguais e não são:

- **What does she look like?** — aparência: *She's tall, with short dark hair.*
- **What is she like?** — personalidade: *She's funny and very outgoing.*

Adjetivos vêm antes do substantivo e não mudam: *a tall man, tall women*. Com vários, a ordem natural é opinião → tamanho → idade → cor: *a beautiful big old red barn*.

Para lugares: **there is / there are** e adjetivos. Sobre peso, o inglês é cuidadoso: *overweight* ou *a bit heavy* é o educado; *fat* é ofensivo quando dito de alguém.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pessoas',
        itens: [
          { termo: 'tall / short', traducao: 'alto / baixo' },
          { termo: 'slim / thin / overweight', traducao: 'magro / magro (pode soar negativo) / acima do peso' },
          { termo: 'young / old / middle-aged', traducao: 'jovem / velho / de meia-idade' },
          { termo: 'hair', traducao: 'cabelo', nota: 'incontável: her hair IS long' },
          { termo: 'long / short / curly / straight', traducao: 'longo / curto / cacheado / liso' },
          { termo: 'blond / dark / gray', traducao: 'loiro / escuro / grisalho' },
          { termo: 'blue eyes / brown eyes', traducao: 'olhos azuis / olhos castanhos' },
          { termo: 'glasses / beard / mustache', traducao: 'óculos / barba / bigode' },
          { termo: 'friendly / nice', traducao: 'simpático, amigável' },
          { termo: 'funny / serious', traducao: 'engraçado / sério' },
          { termo: 'shy / outgoing', traducao: 'tímido / extrovertido' },
          { termo: 'hardworking / lazy', traducao: 'trabalhador / preguiçoso' },
          { termo: 'smart / clever', traducao: 'inteligente' },
          { termo: 'easygoing', traducao: 'tranquilo, de boa' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Lugares',
        itens: [
          { termo: 'beautiful / ugly', traducao: 'bonito / feio' },
          { termo: 'quiet / noisy', traducao: 'tranquilo / barulhento' },
          { termo: 'crowded', traducao: 'lotado, cheio de gente' },
          { termo: 'clean / dirty', traducao: 'limpo / sujo' },
          { termo: 'cozy', traducao: 'aconchegante', nota: 'cosy no Reino Unido' },
          { termo: 'modern / old / historic', traducao: 'moderno / antigo / histórico' },
          { termo: 'nearby', traducao: 'perto, nos arredores' },
          { termo: 'countryside', traducao: 'o campo, zona rural' },
          { termo: 'hill / lake / river / forest', traducao: 'morro / lago / rio / floresta' },
          { termo: 'field', traducao: 'campo, lavoura' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> My sister's name is Carla. She's 35, tall and slim, with short dark hair and brown eyes. She's really funny and outgoing, but sometimes a little loud. She's a doctor and lives in Florianópolis.
>
> Our farm is in the south of Brazil. It isn't big, but it's beautiful. There's a barn, a small house and lots of pasture. There's a river and a forest nearby. It's very quiet here.

Minha irmã se chama Carla. Tem 35 anos, é alta e magra, com cabelo curto e escuro e olhos castanhos. É muito engraçada e extrovertida, mas às vezes um pouco barulhenta. É médica e mora em Florianópolis. Nossa fazenda fica no sul do Brasil. Não é grande, mas é linda. Há um estábulo, uma casa pequena e muito pasto. Há um rio e uma floresta perto. É muito tranquilo aqui.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"What is she like?" pergunta sobre…', opcoes: ['a aparência', 'a personalidade', 'o que ela gosta'], correta: 1 },
          { tipo: 'escolha', pergunta: '"What does he look like?" pergunta sobre…', opcoes: ['a aparência', 'a personalidade', 'o que ele procura'], correta: 0 },
          { tipo: 'lacuna', frase: 'He ___ blue eyes.', resposta: 'has' },
          { tipo: 'lacuna', frase: 'Her hair ___ long and curly.', resposta: 'is' },
          { tipo: 'lacuna', frase: 'There ___ a river nearby.', resposta: 'is' },
          { tipo: 'escolha', pergunta: '"cozy" =', opcoes: ['aconchegante', 'barulhento', 'moderno'], correta: 0 },
          { tipo: 'traducao', origem: 'Ela usa óculos.', resposta: ['She wears glasses.', 'She has glasses.'] },
          { tipo: 'traducao', origem: 'Aqui é muito tranquilo.', resposta: ['It’s very quiet here.', 'It is very quiet here.'] },
        ],
      },
    ],
  },
];

export const a2: ConteudoNivel<'a2'> = {
  'conversacao-cotidiana': conversacaoCotidiana,
  'tempos-verbais': temposVerbais,
  'compreensao-oral': compreensaoOral,
  'escrita-simples': escritaSimples,
};
