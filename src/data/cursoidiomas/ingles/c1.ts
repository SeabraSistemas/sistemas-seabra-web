import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência avançada ────────────────────────── */

const fluenciaAvancada: Licao[] = [
  {
    id: 'registros',
    titulo: 'Registros: formal, neutro, informal',
    resumo: 'Latinismos × phrasal verbs: por que "investigate" e "look into" dizem o mesmo em tons diferentes.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês tem duas camadas de vocabulário: a **latina/francesa** (formal: *investigate, postpone, obtain, commence*) e a **germânica**, cheia de **phrasal verbs** (neutra ou informal: *look into, put off, get, start*). O brasileiro, cuja língua vem do latim, tende a escolher a primeira e soa rígido na conversa: *"I will postpone the meeting"* num almoço soa como um memorando. O nativo diria *I'll push the meeting back*.

Marcadores de registro:
- **Formal**: palavra latina, passiva, sem contrações, frases completas (*We regret to inform you that…*).
- **Neutro**: contrações, phrasal verbs comuns (*We're sorry to let you know that…*).
- **Informal**: gíria, elipse, *gonna*, *stuff* (*Bad news, guys…*).

Regra de campo: e-mail a desconhecido = formal-neutro; reunião = neutro; conversa de corredor = informal.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Formal × neutro',
        cabecalho: ['Formal (latino)', 'Neutro (phrasal / germânico)', 'Português'],
        linhas: [
          ['investigate', 'look into', 'investigar'],
          ['postpone', 'put off / push back', 'adiar'],
          ['tolerate', 'put up with', 'tolerar'],
          ['discover', 'find out', 'descobrir'],
          ['continue', 'carry on / keep going', 'continuar'],
          ['request', 'ask for', 'pedir'],
          ['obtain', 'get', 'obter'],
          ['assist', 'help (out)', 'ajudar'],
          ['purchase', 'buy', 'comprar'],
          ['commence', 'start / kick off', 'começar'],
          ['inform', 'let know', 'informar'],
          ['cancel', 'call off', 'cancelar'],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Uma ideia, três registros',
        cabecalho: ['Formal', 'Neutro', 'Informal'],
        linhas: [
          ['We regret to inform you that the project has been discontinued.', 'I’m sorry to let you know we’ve stopped the project.', 'The project’s dead, man.'],
          ['Please do not hesitate to contact us.', 'Feel free to get in touch.', 'Just ping me.'],
          ['We have received the merchandise.', 'We got the goods.', 'We got the stuff.'],
          ['Would you be able to assist me?', 'Could you help me out?', 'Can you give me a hand?'],
          ['I would like to draw your attention to…', 'I just wanted to point out…', 'Heads up: …'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Num almoço com colegas, o mais natural:', opcoes: ['We need to postpone the meeting.', 'We need to push the meeting back.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num e-mail formal a um cliente novo:', opcoes: ['We got your stuff.', 'We have received your documents.', 'Got your docs, thx.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Heads up" é…', opcoes: ['formal', 'informal: um aviso rápido'], correta: 1 },
          { tipo: 'lacuna', frase: 'Neutro de "investigate": look ___', resposta: 'into' },
          { tipo: 'lacuna', frase: 'Neutro de "discover": find ___', resposta: 'out' },
          { tipo: 'lacuna', frase: 'Neutro de "cancel": call ___', resposta: 'off' },
          { tipo: 'lacuna', frase: 'Neutro de "tolerate": put up ___', resposta: 'with' },
          { tipo: 'traducao', origem: 'Formal: Lamentamos informar que o projeto foi encerrado.', resposta: ['We regret to inform you that the project has been discontinued.', 'We regret to inform you that the project has been cancelled.', 'We regret to inform you that the project has been terminated.'] },
        ],
      },
    ],
  },
  {
    id: 'espontaneidade-reformulacao',
    titulo: 'Fala espontânea: ganhar tempo e reformular',
    resumo: 'Os preenchedores do nativo, a autocorreção elegante e as saídas quando a palavra some.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Fluência é **pausar como um nativo**. O brasileiro que diz "éééé" soa estrangeiro; quem diz *well…, let me think…, how can I put this…* soa natural. Estratégias:

- **Ganhar tempo**: *Well…, Let me see…, That's a good question., How can I put this…, The thing is…*
- **Reformular**: *I mean…, In other words…, What I'm trying to say is…, To put it simply…, Let me rephrase that.*
- **Autocorreção**: *…sorry, I meant…, …or rather…, Let me correct myself.*
- **Palavra que some**: *It's on the tip of my tongue…, What's the word…, It's the thing you use to…* (parafrasear).
- **Manter a vez**: *…and another thing…, …on top of that…, Just to add to that…*
- **Checar**: *Does that make sense? Are you with me?*

Cuidado com o *like* a cada três palavras: é marca de fala jovem e informal e, em reunião, tira credibilidade.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Well, how can I put this… it’s complicated.', traducao: 'Bom, como dizer… é complicado.' },
          { texto: 'That’s a good question. Let me think for a second.', traducao: 'Boa pergunta. Deixe-me pensar um segundo.' },
          { texto: 'In other words, we need more time.', traducao: 'Em outras palavras, precisamos de mais tempo.' },
          { texto: 'To put it simply, it doesn’t pay off.', traducao: 'Simplificando: não compensa.' },
          { texto: 'We had two hundred — sorry, I meant three hundred — goats.', traducao: 'Tínhamos duzentas — desculpe, trezentas — cabras.' },
          { texto: 'It’s on the tip of my tongue… the machine that cools the milk.', traducao: 'Está na ponta da língua… a máquina que resfria o leite.' },
          { texto: 'The thing is, nobody reads the reports.', traducao: 'O problema é que ninguém lê os relatórios.' },
          { texto: 'Does that make sense so far?', traducao: 'Até aqui faz sentido?' },
          { texto: 'Where was I? Oh, right.', traducao: 'Onde eu estava? Ah, sim.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Grave-se falando dois minutos sobre o seu trabalho. Conte quantas vezes disse "ééé" ou ficou em silêncio. Depois repita, trocando cada pausa por um preenchedor em inglês. É o exercício com maior retorno por minuto no C1.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Para ganhar tempo antes de responder:', opcoes: ['Ehhhh…', 'That’s a good question — let me think.', 'I don’t know.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"The thing is…" introduz…', opcoes: ['um objeto', 'o ponto central, muitas vezes o problema', 'uma despedida'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Você esqueceu "bulk tank". Melhor estratégia:', opcoes: ['parar de falar', 'dizer em português', 'parafrasear: "the big tank where the milk is cooled"'], correta: 2 },
          { tipo: 'lacuna', frase: 'To put it ___: it doesn’t pay off.', resposta: 'simply' },
          { tipo: 'lacuna', frase: 'It’s on the tip of my ___.', resposta: 'tongue' },
          { tipo: 'lacuna', frase: 'In other ___, we need more time.', resposta: 'words' },
          { tipo: 'ditado', texto: 'Well, how can I put this, it’s a bit complicated.', traducao: 'Bom, como dizer, é um pouco complicado.' },
        ],
      },
    ],
  },
];

/* ──────────────────────────────── Nuances ───────────────────────────────── */

const nuances: Licao[] = [
  {
    id: 'phrasal-verbs',
    titulo: 'Phrasal verbs: o coração do inglês natural',
    resumo: 'Separáveis e inseparáveis, a posição do pronome e os vinte que aparecem em toda reunião.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Phrasal verb** é verbo + partícula (*up, out, off, into…*) com sentido próprio, muitas vezes impossível de deduzir: *give up* não é "dar para cima", é **desistir**. O nativo usa phrasal verbs o tempo todo; quem não os domina entende as palavras e perde a frase.

Duas regras de posição:
- **Separáveis** aceitam o objeto no meio ou depois: *turn off the light / turn the light off*. Com **pronome**, o meio é obrigatório: *turn **it** off* — nunca "turn off it".
- **Inseparáveis** não se dividem: *look into the problem*, *look into it*; *run into an old friend*.

Muitos têm vários sentidos: *work out* é "dar certo", "calcular" e "malhar"; *pick up* é "buscar", "pegar" e "aprender de ouvido". O contexto decide.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Os vinte essenciais',
        itens: [
          { termo: 'bring up', traducao: 'mencionar, levantar (um assunto)', exemplo: 'She brought up the budget.', exemploTraducao: 'Ela levantou a questão do orçamento.' },
          { termo: 'carry out', traducao: 'realizar, executar', exemplo: 'We carried out a survey.', exemploTraducao: 'Realizamos uma pesquisa.' },
          { termo: 'come across', traducao: 'deparar-se com; parecer', exemplo: 'He comes across as arrogant.', exemploTraducao: 'Ele passa uma imagem de arrogante.' },
          { termo: 'come up with', traducao: 'propor, ter (uma ideia)', exemplo: 'We came up with a solution.', exemploTraducao: 'Chegamos a uma solução.' },
          { termo: 'figure out', traducao: 'entender, descobrir como', exemplo: 'I can’t figure out the problem.', exemploTraducao: 'Não consigo entender o problema.' },
          { termo: 'find out', traducao: 'descobrir (uma informação)' },
          { termo: 'get over', traducao: 'superar' },
          { termo: 'give up', traducao: 'desistir' },
          { termo: 'go on', traducao: 'continuar; acontecer', exemplo: 'What’s going on?', exemploTraducao: 'O que está acontecendo?' },
          { termo: 'look into', traducao: 'investigar, verificar' },
          { termo: 'look forward to', traducao: 'aguardar com expectativa', nota: '+ -ing' },
          { termo: 'put off', traducao: 'adiar' },
          { termo: 'run into', traducao: 'encontrar por acaso; esbarrar em (problema)' },
          { termo: 'run out of', traducao: 'ficar sem', exemplo: 'We ran out of feed.', exemploTraducao: 'Acabou a ração.' },
          { termo: 'set up', traducao: 'montar, configurar, criar' },
          { termo: 'turn down', traducao: 'recusar; abaixar (volume)' },
          { termo: 'work out', traducao: 'dar certo; calcular; malhar' },
          { termo: 'call off', traducao: 'cancelar' },
          { termo: 'keep up with', traducao: 'acompanhar (o ritmo)' },
          { termo: 'catch up', traducao: 'pôr o assunto em dia; alcançar', exemplo: 'Let’s catch up next week.', exemploTraducao: 'Vamos pôr a conversa em dia semana que vem.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Can you turn it off, please?', traducao: 'Pode desligar isso, por favor?', nota: 'pronome no meio' },
          { texto: 'We had to put the meeting off until Monday.', traducao: 'Tivemos que adiar a reunião para segunda.' },
          { texto: 'I ran into Sarah at the expo.', traducao: 'Encontrei a Sarah por acaso na feira.' },
          { texto: 'They turned down our offer.', traducao: 'Eles recusaram nossa oferta.' },
          { texto: 'It took us a while to figure out how the system works.', traducao: 'Levamos um tempo para entender como o sistema funciona.' },
          { texto: 'Don’t give up — it’ll work out.', traducao: 'Não desista, vai dar certo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'We ran ___ of feed on Sunday. (ficar sem)', resposta: 'out' },
          { tipo: 'lacuna', frase: 'They turned ___ our offer. (recusar)', resposta: 'down' },
          { tipo: 'lacuna', frase: 'We came up ___ a great idea.', resposta: 'with' },
          { tipo: 'lacuna', frase: 'Let’s put the meeting ___ until Friday. (adiar)', resposta: 'off' },
          { tipo: 'lacuna', frase: 'I’ll look ___ the problem. (verificar)', resposta: 'into' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Turn off it.', 'Turn it off.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"He comes across as arrogant" =', opcoes: ['Ele encontrou um arrogante', 'Ele passa a impressão de ser arrogante'], correta: 1 },
          { tipo: 'escolha', pergunta: '"It didn’t work out" =', opcoes: ['Não funcionou / não deu certo', 'Não malhou'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'collocations-sinonimos',
    titulo: 'Collocations e sinônimos precisos',
    resumo: 'make × do, heavy rain, strong coffee, e a escolha certa entre quase-sinônimos: borrow/lend, remind/remember.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Collocations** são combinações que soam naturais. Errar não impede a compreensão, mas marca o não nativo na hora.

**Make** (criar, produzir) × **do** (executar, atividade): *make a decision, a mistake, money, progress, an effort, a phone call, an offer* × *do business, research, a favor, your best, the dishes, damage*.

**Take / have**: *take a break, take a photo, take a risk* × *have a look, have a meeting, have lunch*.

Adjetivos que "combinam": *strong coffee* (não "heavy"), *heavy rain, heavy traffic*, *high price* (não "expensive price"), *fast food*, *quick shower*.`,
      },
      {
        tipo: 'tabela',
        titulo: 'make × do',
        cabecalho: ['make', 'do'],
        linhas: [
          ['make a decision', 'do business'],
          ['make a mistake', 'do research'],
          ['make money', 'do someone a favor'],
          ['make progress', 'do your best'],
          ['make an effort', 'do the dishes'],
          ['make a phone call', 'do damage'],
          ['make an offer', 'do a good job'],
          ['make sense', 'do without (dispensar)'],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Quase-sinônimos que confundem',
        cabecalho: ['Par', 'Diferença', 'Exemplo'],
        linhas: [
          ['borrow / lend', 'pegar emprestado / emprestar', 'Can I borrow your pen? Can you lend me your pen?'],
          ['remember / remind', 'lembrar-se / lembrar alguém', 'Remind me to call him.'],
          ['bring / take', 'trazer (para cá) / levar (para lá)', 'Bring it here. Take it to the barn.'],
          ['rob / steal', 'roubar (pessoa, lugar) / roubar (objeto)', 'They robbed the bank. They stole the money.'],
          ['fun / funny', 'divertido / engraçado', 'The trip was fun. The joke was funny.'],
          ['economic / economical', 'da economia / econômico (que poupa)', 'economic crisis, an economical car'],
          ['sensible / sensitive', 'sensato / sensível', 'a sensible decision, sensitive skin'],
          ['job / work / career', 'emprego / trabalho / carreira', 'I found a job. I have a lot of work.'],
          ['say / tell / speak / talk', 'dizer / contar a alguém / falar (língua, formal) / conversar', 'Tell me. Speak English. Let’s talk.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'We need to ___ a decision today.', resposta: 'make' },
          { tipo: 'lacuna', frase: 'Could you ___ me a favor?', resposta: 'do' },
          { tipo: 'lacuna', frase: 'Let’s ___ a break. (take / have)', resposta: ['take', 'have'] },
          { tipo: 'lacuna', frase: 'There was ___ rain last night. (forte)', resposta: 'heavy' },
          { tipo: 'lacuna', frase: 'Can I ___ your car tomorrow? (pegar emprestado)', resposta: 'borrow' },
          { tipo: 'lacuna', frase: 'Please ___ me to send the invoice. (lembrar alguém)', resposta: 'remind' },
          { tipo: 'escolha', pergunta: '"a sensible decision" =', opcoes: ['uma decisão sensível', 'uma decisão sensata'], correta: 1 },
          { tipo: 'escolha', pergunta: '"an economical car" =', opcoes: ['um carro da economia nacional', 'um carro econômico'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'inversao-hedging',
    titulo: 'Inversão formal, subjuntivo e "hedging"',
    resumo: '"Not only did we…", "Should you need…", "I suggest that he be" — e as palavras que suavizam uma afirmação.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Inversão** depois de expressões negativas ou restritivas, no início da frase, dá ênfase formal: ***Never have I** seen such a herd. **Not only did we** meet the deadline, but we also cut costs. **Rarely do** farmers get that support.* Também em condicionais formais sem *if*: ***Should you need** anything, call me* (= if you need); ***Had I known**, I would have come*; ***Were it not for** the app, we'd be lost*.

**Subjuntivo** (forma base do verbo, sem -s) depois de verbos e expressões de exigência, sobretudo no inglês americano: *I suggest that he **be** present. It is essential that each doe **receive** a check-up.*

**Hedging** é suavizar afirmações — essencial em texto profissional e acadêmico: *tend to, arguably, to some extent, it would seem that, may well, somewhat, largely*. Compare: *This app solves the problem* × *This app **largely** addresses the problem.*`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Not only did the app save time, but it also reduced losses.', traducao: 'O app não só economizou tempo como também reduziu perdas.' },
          { texto: 'Never have we had such a productive season.', traducao: 'Nunca tivemos uma temporada tão produtiva.' },
          { texto: 'Should you have any questions, please contact me.', traducao: 'Caso tenha alguma dúvida, entre em contato.' },
          { texto: 'Had we checked the fence, the goats wouldn’t have escaped.', traducao: 'Se tivéssemos verificado a cerca, as cabras não teriam fugido.' },
          { texto: 'It is essential that every animal be tagged.', traducao: 'É essencial que todo animal seja identificado.' },
          { texto: 'Small farms tend to benefit the most.', traducao: 'As pequenas propriedades tendem a se beneficiar mais.' },
          { texto: 'This is arguably the best breed for hot climates.', traducao: 'Esta é, possivelmente, a melhor raça para climas quentes.' },
          { texto: 'Prices may well rise next year.', traducao: 'É bem possível que os preços subam ano que vem.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Never ___ I seen such a large herd.', resposta: 'have' },
          { tipo: 'lacuna', frase: 'Not only ___ we finish on time, but we also saved money.', resposta: 'did' },
          { tipo: 'lacuna', frase: '___ you need anything, just call. (caso)', resposta: 'Should' },
          { tipo: 'lacuna', frase: '___ I known, I would have come. (se eu soubesse)', resposta: 'Had' },
          { tipo: 'lacuna', frase: 'I suggest that he ___ present. (be, subjuntivo)', resposta: 'be' },
          { tipo: 'escolha', pergunta: 'Versão mais cautelosa (hedged):', opcoes: ['This solves the problem.', 'This largely addresses the problem.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"arguably" =', opcoes: ['discutivelmente, pode-se dizer que', 'com raiva', 'sem dúvida alguma'], correta: 0 },
          { tipo: 'ordenar', resposta: 'Should you have any questions please contact me', traducao: 'Caso tenha dúvidas, entre em contato' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Argumentação ───────────────────────────── */

const argumentacao: Licao[] = [
  {
    id: 'tese-contra-argumento',
    titulo: 'Construir uma tese e antecipar a objeção',
    resumo: 'A estrutura claim → objection → rebuttal e a linguagem para conceder sem perder terreno.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Um argumento de C1 antecipa a objeção antes que o outro a levante: **claim → objection → rebuttal → conclusion**.

- Antecipar: *It could be argued that… / Critics might point out that… / One might object that…*
- Conceder em parte: *This objection has some merit insofar as… / It is true that…, but… / Granted,…*
- Neutralizar: *However, this overlooks the fact that… / On closer inspection, … / That said,… / Be that as it may,…*
- Fechar: *It follows that… / In light of this,… / On balance,…*

O condicional (*it **could** be argued*) mantém a objeção hipotética: você a levanta para responder.`,
      },
      {
        tipo: 'texto',
        titulo: 'Exemplo',
        markdown: `> **Claim:** Small dairy goat farms should invest in digital herd management.
>
> **Objection:** It could be argued that, with only thirty goats, the investment will never pay for itself.
>
> **Rebuttal:** This objection has some merit insofar as the subscription fee is the same regardless of herd size. However, it overlooks the fact that on a small farm one person does everything — so every hour saved on paperwork goes directly back into animal care. On closer inspection, a single case of mastitis caught early saves more than the software costs in a year.
>
> **Conclusion:** It follows that herd size is not a convincing argument against the investment.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'claim', traducao: 'afirmação, tese' },
          { termo: 'objection / to object', traducao: 'objeção / objetar' },
          { termo: 'rebuttal / to rebut', traducao: 'refutação / refutar' },
          { termo: 'to have merit', traducao: 'ter fundamento' },
          { termo: 'insofar as', traducao: 'na medida em que' },
          { termo: 'granted', traducao: 'é verdade que, admito que' },
          { termo: 'to overlook', traducao: 'ignorar, deixar passar', nota: 'falso amigo parcial: não é "olhar por cima"' },
          { termo: 'on closer inspection', traducao: 'examinando mais de perto' },
          { termo: 'that said / be that as it may', traducao: 'dito isso / seja como for' },
          { termo: 'regardless of', traducao: 'independentemente de' },
          { termo: 'to pay for itself', traducao: 'pagar-se' },
          { termo: 'it follows that', traducao: 'segue-se que' },
          { termo: 'in light of', traducao: 'à luz de' },
          { termo: 'sound / flawed', traducao: 'sólido / falho (argumento)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'It could be ___ that the costs are too high.', resposta: 'argued' },
          { tipo: 'lacuna', frase: 'This objection has some ___. (fundamento)', resposta: 'merit' },
          { tipo: 'lacuna', frase: 'However, this ___ the fact that… (ignora)', resposta: 'overlooks' },
          { tipo: 'lacuna', frase: 'On closer ___, the numbers tell a different story.', resposta: 'inspection' },
          { tipo: 'lacuna', frase: 'It ___ that we must act now. (segue-se)', resposta: 'follows' },
          { tipo: 'escolha', pergunta: 'Por que "It could be argued" usa "could"?', opcoes: ['por educação apenas', 'para manter a objeção hipotética: você a levanta para responder', 'porque é passado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"a flawed argument" =', opcoes: ['um argumento sólido', 'um argumento falho'], correta: 1 },
          { tipo: 'ordenar', resposta: 'That said the benefits clearly outweigh the risks', traducao: 'Dito isso, os benefícios superam claramente os riscos' },
        ],
      },
    ],
  },
  {
    id: 'retorica-falacias',
    titulo: 'Retórica: figuras e falácias',
    resumo: 'Rule of three, understatement britânico e as falácias que você precisa reconhecer e nomear.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Figuras** eficazes em inglês:
- **Rule of three**: *simple, fast, reliable* — o ritmo favorito do discurso anglo-saxão (*government of the people, by the people, for the people*).
- **Rhetorical question**: *Who here hasn't lost a record at some point?*
- **Anaphora**: *We need data. We need transparency. We need courage.*
- **Antithesis**: *Less paperwork, more time with the animals.*
- **Understatement** (muito britânico): *It's not ideal* (= é um desastre); *a bit of a problem* (= um problemão).

**Falácias** a reconhecer:
- **Straw man** (espantalho): distorcer a posição do outro.
- **Ad hominem**: atacar a pessoa.
- **False dilemma**: só duas opções.
- **Slippery slope**: "se A, inevitavelmente Z".
- **Circular reasoning**: a conclusão está na premissa.
- **Hasty generalization**: de um caso a uma regra.
- **Appeal to authority**: "é verdade porque X disse".
- **Red herring**: desviar para outro assunto.
- **Whataboutism**: "e vocês?" para fugir da pergunta.`,
      },
      {
        tipo: 'frases',
        titulo: 'Nomear a falácia com elegância',
        itens: [
          { texto: 'That’s a bit of a straw man — nobody said every farm has to go digital.', traducao: 'Isso é meio espantalho: ninguém disse que toda fazenda precisa digitalizar.' },
          { texto: 'Let’s focus on the argument, not the person.', traducao: 'Vamos focar no argumento, não na pessoa.' },
          { texto: 'That’s a false choice — there are other options.', traducao: 'É uma falsa escolha: há outras opções.' },
          { texto: 'One example doesn’t make it a rule.', traducao: 'Um exemplo não faz disso uma regra.' },
          { texto: 'Just because an expert said it doesn’t make it true.', traducao: 'Um especialista ter dito não torna verdade.' },
          { texto: 'With respect, that doesn’t answer my question.', traducao: 'Com todo respeito, isso não responde à minha pergunta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"If we start using apps, soon nobody will even touch the animals" é…', opcoes: ['straw man', 'slippery slope', 'circular reasoning'], correta: 1 },
          { tipo: 'escolha', pergunta: '"You’re not even a farmer, what do you know?" é…', opcoes: ['ad hominem', 'false dilemma', 'appeal to authority'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Either we go organic or we destroy the planet" é…', opcoes: ['anaphora', 'false dilemma', 'understatement'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz que a enchente na fazenda "is not ideal". Ele quer dizer…', opcoes: ['que é um pequeno incômodo', 'que é um desastre (understatement)'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Mudar de assunto para fugir de uma pergunta difícil é…', opcoes: ['red herring', 'rule of three', 'antithesis'], correta: 0 },
          { tipo: 'lacuna', frase: 'One example doesn’t ___ it a rule.', resposta: 'make' },
          { tipo: 'traducao', origem: 'Isso não responde à minha pergunta.', resposta: ['That doesn’t answer my question.', 'That does not answer my question.', 'This doesn’t answer my question.'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Apresentações ──────────────────────────── */

const apresentacoes: Licao[] = [
  {
    id: 'estrutura-abertura',
    titulo: 'Estrutura e abertura de impacto',
    resumo: '"Tell them what you’ll tell them", signposting, e três aberturas que funcionam com público americano.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A regra anglo-saxã: ***Tell them what you're going to tell them, tell them, then tell them what you told them.*** O público quer, nos primeiros 60 segundos, **o tema, por que importa e quanto tempo vai durar**.

**Signposting** (placas de sinalização) é o que torna uma apresentação fácil de seguir: *Today I'll walk you through three things. First… Moving on to… That brings me to my last point…*

Três aberturas de impacto:
1. **Número surpreendente**: *One in five dairy goats is never weighed. One in five.*
2. **Pergunta ao público**: *Quick show of hands: who knows which animal gave the least milk yesterday?*
3. **Cena concreta**: *Five a.m. The barn is dark, and Sarah is flipping through a binder with a flashlight, looking for tag 4471.*

Evite: pedir desculpas pelo inglês (*sorry for my English* — nunca), ler os slides, começar pela história da empresa.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas por etapa',
        itens: [
          { texto: 'Good morning, everyone. Thanks for having me.', traducao: 'Bom dia a todos. Obrigado pelo convite.' },
          { texto: 'I’m Felipe Seabra, and I run Sistema Seabra.', traducao: 'Sou Felipe Seabra e dirijo a Sistema Seabra.' },
          { texto: 'Over the next twenty minutes, I’ll show you how…', traducao: 'Nos próximos vinte minutos, vou mostrar como…' },
          { texto: 'I’ve divided my talk into three parts.', traducao: 'Dividi minha fala em três partes.' },
          { texto: 'Feel free to jump in with questions, or save them for the end.', traducao: 'Fiquem à vontade para interromper com perguntas, ou deixem para o final.' },
          { texto: 'Let me start with a quick story.', traducao: 'Deixem-me começar com uma história rápida.' },
          { texto: 'Let me illustrate that with an example.', traducao: 'Deixem-me ilustrar com um exemplo.' },
          { texto: 'So, to recap: …', traducao: 'Então, recapitulando: …' },
          { texto: 'Thank you for your attention. I’m happy to take any questions.', traducao: 'Obrigado pela atenção. Fico feliz em responder perguntas.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'talk / presentation / keynote', traducao: 'palestra / apresentação / palestra principal' },
          { termo: 'outline', traducao: 'roteiro, estrutura' },
          { termo: 'signposting', traducao: 'sinalização do roteiro' },
          { termo: 'opening / hook', traducao: 'abertura / gancho' },
          { termo: 'takeaway / key message', traducao: 'mensagem principal' },
          { termo: 'slide / deck', traducao: 'slide / conjunto de slides' },
          { termo: 'audience', traducao: 'público' },
          { termo: 'to walk someone through', traducao: 'explicar passo a passo' },
          { termo: 'to recap', traducao: 'recapitular' },
          { termo: 'to get to the point', traducao: 'ir direto ao ponto' },
          { termo: 'to go off on a tangent', traducao: 'fugir do assunto' },
          { termo: 'show of hands', traducao: 'levantada de mãos' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'O público quer saber nos primeiros 60 segundos…', opcoes: ['sua biografia completa', 'tema, relevância e duração', 'uma piada'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual abertura é a MENOS recomendada?', opcoes: ['Um número surpreendente', '“Sorry for my English”', 'Uma cena concreta'], correta: 1 },
          { tipo: 'lacuna', frase: 'I’ll walk you ___ three things today.', resposta: 'through' },
          { tipo: 'lacuna', frase: 'I’ve ___ my talk into three parts.', resposta: 'divided' },
          { tipo: 'lacuna', frase: 'Let me ___ that with an example.', resposta: 'illustrate' },
          { tipo: 'lacuna', frase: 'The key ___ is simple: measure everything. (mensagem principal)', resposta: ['takeaway', 'message'] },
          { tipo: 'ditado', texto: 'Thank you for your attention, I’m happy to take any questions.', traducao: 'Obrigado pela atenção, fico feliz em responder perguntas.' },
        ],
      },
    ],
  },
  {
    id: 'dados-transicoes-perguntas',
    titulo: 'Dados, transições e perguntas difíceis',
    resumo: 'Descrever um gráfico (rise, peak, plummet), ligar as partes e sobreviver ao Q&A.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Descrever dados**: tendência (*rise, increase, climb, soar* / *fall, decrease, drop, plummet* / *level off, stabilize, fluctuate, peak*), intensidade (*slightly, steadily, sharply, dramatically*), comparação (*by 12%* = em 12%; *to 806* = para 806; *compared to last year*), leitura (*This chart shows… / On the x-axis… / What stands out is…*).

**Transições**: *That brings me to… / Moving on to… / Let's now turn to… / With that in mind,…*

**Perguntas difíceis**: agradecer (*That's a great question.*), esclarecer (*If I understand you correctly, you're asking…?*), admitir limite (*I don't have that figure on hand — let me follow up with you after the session.*), reconduzir (*That's a bit outside the scope of today's talk, but happy to discuss it afterwards.*), ceticismo (*I understand the skepticism. Let me share two numbers.*).`,
      },
      {
        tipo: 'frases',
        titulo: 'Dados',
        itens: [
          { texto: 'This chart shows milk yield per doe from 2020 to 2025.', traducao: 'Este gráfico mostra a produção por cabra de 2020 a 2025.' },
          { texto: 'Yield rose by twelve percent, from 720 to 806 liters.', traducao: 'A produção subiu 12%, de 720 para 806 litros.' },
          { texto: 'What stands out is the sharp increase in 2023.', traducao: 'O que chama atenção é o aumento acentuado em 2023.' },
          { texto: 'Compared to last year, the number of farms has leveled off.', traducao: 'Em relação ao ano passado, o número de fazendas se estabilizou.' },
          { texto: 'The curve fluctuates seasonally, which is linked to kidding.', traducao: 'A curva oscila por estação, o que está ligado à parição.' },
          { texto: 'The share stands at just under a third.', traducao: 'A participação está em pouco menos de um terço.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas',
        itens: [
          { texto: 'Thanks for the question — that’s an important point.', traducao: 'Obrigado pela pergunta, é um ponto importante.' },
          { texto: 'If I understand you correctly, you’re asking about the cost?', traducao: 'Se entendi bem, você pergunta sobre o custo?' },
          { texto: 'I don’t have that figure on hand. Let me follow up with you after the session.', traducao: 'Não tenho esse número à mão. Deixe-me retornar depois da sessão.' },
          { texto: 'That’s a bit outside the scope of today’s talk, but I’m happy to discuss it afterwards.', traducao: 'Isso foge um pouco do escopo de hoje, mas posso conversar depois.' },
          { texto: 'I understand the skepticism. Let me share two numbers.', traducao: 'Entendo o ceticismo. Deixe-me mostrar dois números.' },
          { texto: 'Does that answer your question?', traducao: 'Isso responde à sua pergunta?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Yield rose ___ twelve percent. (em)', resposta: 'by' },
          { tipo: 'lacuna', frase: 'It rose from 720 ___ 806 liters. (para)', resposta: 'to' },
          { tipo: 'lacuna', frase: 'What stands ___ is the increase in 2023.', resposta: 'out' },
          { tipo: 'lacuna', frase: 'The number of farms has ___ off. (estabilizou)', resposta: 'leveled' },
          { tipo: 'escolha', pergunta: '"plummet" descreve uma queda…', opcoes: ['leve', 'gradual', 'brusca e grande'], correta: 2 },
          { tipo: 'escolha', pergunta: 'Você não sabe a resposta. Melhor reação:', opcoes: ['inventar um número', 'I don’t have that figure on hand — let me follow up with you.', 'ignorar a pergunta'], correta: 1 },
          { tipo: 'traducao', origem: 'Isso responde à sua pergunta?', resposta: ['Does that answer your question?', 'Does this answer your question?', 'Did that answer your question?'] },
          { tipo: 'ditado', texto: 'Compared to last year, the number of farms has leveled off.', traducao: 'Em relação ao ano passado, o número de fazendas se estabilizou.' },
        ],
      },
    ],
  },
];

/* ─────────────────── Linguagem acadêmica / profissional ─────────────────── */

const academica: Licao[] = [
  {
    id: 'estilo-nominal',
    titulo: 'Estilo acadêmico: nominalização e impessoalidade',
    resumo: 'Transformar verbos em substantivos, as construções impessoais e o vocabulário que marca um texto acadêmico.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O texto acadêmico e técnico em inglês **nominaliza**: transforma ações em substantivos para condensar. *Because prices rose, farms cut costs* → ***Due to the rise in prices**, farms cut costs.* *After the system was installed, workload fell* → ***Following the installation of the system**, workload fell.*

Outras marcas:
- **Impessoal**: *It is widely accepted that… / It has been shown that… / There is evidence that…*
- **Passiva** quando o agente não importa.
- **Vocabulário acadêmico**: *analyze, assess, establish, indicate, significant, substantial, subsequent, prior to, whereby, thereby*.

Mas o inglês moderno (sobretudo o americano) valoriza a **clareza**: nominalização em excesso vira jargão. Guias de estilo pedem voz ativa sempre que possível. Use o estilo nominal em resumos, títulos e seções de método; o verbal para explicar.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbal ↔ nominal',
        cabecalho: ['Verbal', 'Nominal'],
        linhas: [
          ['Because prices rose, farms cut costs.', 'Due to the rise in prices, farms cut costs.'],
          ['Although it rained, the fair went ahead.', 'Despite the rain, the fair went ahead.'],
          ['If you record data daily, you spot problems earlier.', 'Daily data recording enables earlier problem detection.'],
          ['After the system was installed, workload fell.', 'Following the installation of the system, workload fell.'],
          ['We train staff so that they can use the app.', 'Staff receive training in the use of the app.'],
          ['We save time by automating processes.', 'Process automation results in time savings.'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Vocabulário acadêmico',
        itens: [
          { termo: 'due to / owing to', traducao: 'devido a' },
          { termo: 'despite / notwithstanding', traducao: 'apesar de / não obstante' },
          { termo: 'following / prior to', traducao: 'após / antes de' },
          { termo: 'with regard to / regarding', traducao: 'no que se refere a' },
          { termo: 'in terms of', traducao: 'em termos de' },
          { termo: 'whereby', traducao: 'pelo qual, por meio do qual' },
          { termo: 'thereby', traducao: 'com isso, dessa forma' },
          { termo: 'to assess / assessment', traducao: 'avaliar / avaliação' },
          { termo: 'to establish', traducao: 'estabelecer, determinar' },
          { termo: 'to indicate', traducao: 'indicar' },
          { termo: 'significant / substantial', traducao: 'significativo / substancial' },
          { termo: 'subsequent / subsequently', traducao: 'subsequente / posteriormente' },
          { termo: 'implementation', traducao: 'implementação' },
          { termo: 'data (plural) / datum', traducao: 'dados', nota: 'formal: "the data are"; no uso comum, "the data is" é aceito' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ the rain, the fair went ahead. (apesar de)', resposta: ['Despite', 'Notwithstanding'] },
          { tipo: 'lacuna', frase: '___ to the high costs, the project was stopped. (devido a)', resposta: ['Due', 'Owing'] },
          { tipo: 'lacuna', frase: 'Following the ___ of the system, workload fell. (install → subst.)', resposta: 'installation' },
          { tipo: 'lacuna', frase: 'It is widely ___ that early detection saves money.', resposta: 'accepted' },
          { tipo: 'escolha', pergunta: 'Versão nominal de "if you record data daily":', opcoes: ['daily data recording', 'despite data recording', 'owing to recording'], correta: 0 },
          { tipo: 'escolha', pergunta: 'O estilo nominal é mais adequado para…', opcoes: ['explicar algo a um leigo', 'um resumo ou seção de método', 'uma conversa'], correta: 1 },
          { tipo: 'escolha', pergunta: '"thereby" =', opcoes: ['ali perto', 'com isso, dessa forma', 'portanto não'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'citar-fontes',
    titulo: 'Citar fontes e verbos de relato',
    resumo: 'argue × claim × suggest, o formato APA, e.g. × i.e., et al. — e a paráfrase que evita plágio.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Texto acadêmico em inglês é **hedgeado** (*suggests, indicates, appears to*) e referenciado a cada afirmação não trivial.

**Verbos de relato** carregam posição: ***argue*** (defende, com argumentos), ***claim*** (afirma, e você não necessariamente concorda), ***contend*** (sustenta), ***suggest*** (sugere, cauteloso), ***note / point out*** (observa), ***acknowledge*** (reconhece), ***demonstrate / show*** (demonstra — você aceita), ***find*** (constata, em pesquisa empírica), ***conclude***.

**Formato APA** (o mais comum em ciências agrárias): *(Smith, 2023)* ou *Smith (2023) found that…*; página em citação direta: *(Smith, 2023, p. 45)*; três ou mais autores: *Smith et al. (2023)*.

Abreviações: ***e.g.*** = por exemplo (*exempli gratia*); ***i.e.*** = isto é (*id est*) — trocá-las é erro comum; ***cf.*** = compare; ***et al.*** = e outros; ***ibid.*** = mesma fonte (estilo Chicago).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pesquisa',
        itens: [
          { termo: 'study / research', traducao: 'estudo / pesquisa', nota: 'research é incontável' },
          { termo: 'researcher', traducao: 'pesquisador' },
          { termo: 'hypothesis / assumption', traducao: 'hipótese / pressuposto' },
          { termo: 'method / methodology', traducao: 'método / metodologia' },
          { termo: 'sample / sample size', traducao: 'amostra / tamanho da amostra' },
          { termo: 'data collection / data analysis', traducao: 'coleta de dados / análise de dados' },
          { termo: 'findings / results', traducao: 'achados / resultados' },
          { termo: 'significant', traducao: 'significativo (estatisticamente)' },
          { termo: 'correlation / causation', traducao: 'correlação / causalidade' },
          { termo: 'to suggest / to indicate', traducao: 'sugerir / indicar' },
          { termo: 'the present study', traducao: 'o presente estudo' },
          { termo: 'control group / trial', traducao: 'grupo controle / ensaio' },
          { termo: 'feed intake', traducao: 'ingestão de alimento' },
          { termo: 'fertility / kidding rate', traducao: 'fertilidade / taxa de parição' },
          { termo: 'animal health', traducao: 'saúde animal' },
          { termo: 'further research', traducao: 'mais pesquisas' },
          { termo: 'peer-reviewed', traducao: 'revisado por pares' },
          { termo: 'to paraphrase / plagiarism', traducao: 'parafrasear / plágio' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'The present study examines the relationship between feed intake and milk yield.', traducao: 'O presente estudo examina a relação entre ingestão de alimento e produção de leite.' },
          { texto: 'Smith (2023) found that daily recording significantly improves early detection.', traducao: 'Smith (2023) constatou que o registro diário melhora significativamente a detecção precoce.' },
          { texto: 'According to Jones et al. (2021), the effect is stronger in small herds.', traducao: 'Segundo Jones e outros (2021), o efeito é mais forte em rebanhos pequenos.' },
          { texto: 'These findings suggest that… However, further research is needed.', traducao: 'Esses achados sugerem que… No entanto, são necessárias mais pesquisas.' },
          { texto: 'The sample may not be representative.', traducao: 'A amostra pode não ser representativa.' },
          { texto: 'Several breeds, e.g. Saanen and Alpine, were included.', traducao: 'Várias raças, por exemplo Saanen e Alpina, foram incluídas.' },
          { texto: 'Only one variable, i.e. feed intake, was controlled.', traducao: 'Apenas uma variável, isto é, a ingestão, foi controlada.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Smith (2023) ___ that daily recording improves detection. (constatou)', resposta: 'found' },
          { tipo: 'lacuna', frase: 'These findings ___ that… (sugerem)', resposta: 'suggest' },
          { tipo: 'lacuna', frase: 'Further research is ___. (necessária)', resposta: 'needed' },
          { tipo: 'lacuna', frase: 'According to Jones ___ al. (2021), …', resposta: 'et' },
          { tipo: 'escolha', pergunta: '"e.g." significa…', opcoes: ['isto é', 'por exemplo', 'e outros'], correta: 1 },
          { tipo: 'escolha', pergunta: '"i.e." significa…', opcoes: ['isto é', 'por exemplo', 'compare'], correta: 0 },
          { tipo: 'escolha', pergunta: '"The author claims that…" sugere que quem escreve…', opcoes: ['concorda plenamente', 'reporta sem necessariamente concordar'], correta: 1 },
          { tipo: 'traducao', origem: 'São necessárias mais pesquisas.', resposta: ['Further research is needed.', 'More research is needed.', 'Further research is required.'] },
        ],
      },
    ],
  },
];

export const c1: ConteudoNivel<'c1'> = {
  'fluencia-avancada': fluenciaAvancada,
  nuances,
  argumentacao,
  apresentacoes,
  academica,
};
