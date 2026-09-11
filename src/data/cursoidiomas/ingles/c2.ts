import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ──────────────────────────────── Domínio ───────────────────────────────── */

const dominio: Licao[] = [
  {
    id: 'textos-densos',
    titulo: 'Ler textos densos: contrato, ensaio, literatura',
    resumo: 'O "legalese" (hereinafter, notwithstanding, shall), os períodos longos da prosa culta e como achar o esqueleto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Três gêneros exigem leitura de C2:

**Contratos** (*legalese*): palavras arcaicas e fórmulas fixas. *hereinafter* (doravante), *herein / thereof* (neste / daquele), *notwithstanding* (não obstante), *provided that* (desde que), *shall* (obrigação), *whereas* (considerando que, nos preâmbulos), *in witness whereof* (em testemunho do que). Um contrato americano define termos no início — *"the Supplier"*, *"the Goods"* — e daí em diante a palavra com maiúscula tem sentido técnico.

**Prosa ensaística**: períodos longos com incisos entre travessões, orações relativas encadeadas (*which*, *whereby*), inversões (*Only then did we…*).

**Literatura**: ironia, elipse, registro arcaico ocasional (*whom*, *lest*).

Estratégia comum: **ache o verbo principal** e seu sujeito; isole os incisos entre vírgulas e travessões; resolva a quem cada *which* e *this* se refere.`,
      },
      {
        tipo: 'texto',
        titulo: 'Um período (texto próprio, em registro ensaístico)',
        markdown: `> That the digitization of herd management — long dismissed by many farmers as a fad and now all but unavoidable — does not, as its critics tirelessly insist, drive a wedge between farmers and their animals, but rather makes possible (provided, admittedly, that the tool serves the person using it and not the other way around) the kind of daily attention that no pair of eyes can sustain across a barn of three hundred goats, is a lesson that appears to have reached even the most remote valleys.

**Esqueleto**: *That digitization does not drive a wedge but makes attention possible **is** a lesson that appears to have reached even remote valleys.* — O sujeito é a oração inteira com "that"; o verbo principal é **is**, quase no fim.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Contrato e prosa culta',
        itens: [
          { termo: 'hereinafter', traducao: 'doravante (denominado)' },
          { termo: 'herein / thereof / thereby', traducao: 'neste documento / daquilo / com isso' },
          { termo: 'notwithstanding', traducao: 'não obstante' },
          { termo: 'shall / shall not', traducao: 'deverá / não poderá (obrigação contratual)' },
          { termo: 'whereas', traducao: 'considerando que (preâmbulo); enquanto que' },
          { termo: 'provided that', traducao: 'desde que, contanto que' },
          { termo: 'in witness whereof', traducao: 'em testemunho do que (fecho de contrato)' },
          { termo: 'to be dismissed as', traducao: 'ser descartado como' },
          { termo: 'all but', traducao: 'quase', exemplo: 'all but unavoidable', exemploTraducao: 'quase inevitável' },
          { termo: 'to drive a wedge between', traducao: 'afastar, criar distância entre' },
          { termo: 'the other way around', traducao: 'o contrário' },
          { termo: 'lest', traducao: 'para que não (arcaico, literário)' },
          { termo: 'whom', traducao: 'quem (objeto, formal)', exemplo: 'To whom it may concern', exemploTraducao: 'A quem possa interessar' },
          { termo: 'remote', traducao: 'remoto' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No período acima, qual é o verbo principal?', opcoes: ['does not drive', 'makes', 'is'], correta: 2 },
          { tipo: 'escolha', pergunta: '"all but unavoidable" =', opcoes: ['tudo menos inevitável', 'quase inevitável'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num contrato, "the Supplier shall indemnify…" expressa…', opcoes: ['uma possibilidade', 'uma obrigação'], correta: 1 },
          { tipo: 'escolha', pergunta: '"hereinafter referred to as the Buyer" =', opcoes: ['doravante denominado Comprador', 'anteriormente chamado de Comprador'], correta: 0 },
          { tipo: 'lacuna', frase: '___ the above, the parties agree to… (não obstante)', resposta: 'Notwithstanding' },
          { tipo: 'lacuna', frase: 'The tool must serve the user, not the other way ___.', resposta: 'around' },
          { tipo: 'traducao', origem: 'A ferramenta deve servir a quem a usa, e não o contrário.', resposta: ['The tool must serve the person using it, not the other way around.', 'The tool should serve the person using it, not the other way around.', 'The tool must serve its user, not the other way around.'] },
        ],
      },
    ],
  },
  {
    id: 'variantes',
    titulo: 'EUA, Reino Unido, Austrália, Índia: variantes do inglês',
    resumo: 'Vocabulário, ortografia, gramática e pronúncia que mudam de país para país — e o que isso diz nos negócios.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês é **plurizêntrico**: há vários padrões, todos corretos. Para negócios, saber as diferenças evita mal-entendidos e mostra atenção ao interlocutor.

**Ortografia**: EUA *color, center, analyze, program, traveled*; Reino Unido *colour, centre, analyse, programme, travelled*. Escolha uma e mantenha no texto inteiro.

**Gramática**: britânicos usam mais *have got* e o present perfect (*Have you eaten yet?*), onde o americano diz *Did you eat yet?*; americanos têm *gotten*; britânicos tratam coletivos no plural (*the team are*).

**Pronúncia**: o americano pronuncia o R depois de vogal (*car, farm*); o britânico padrão, não. *schedule* ("skédjul" × "shédiul"), *herb* (H mudo nos EUA), *tomato* ("tomêidou" × "tomátou").

**Outros**: na **Austrália**, *arvo* (tarde), *no worries* (de nada, tranquilo), *mate*; na **Índia**, *prepone* (antecipar), *do the needful* (faça o necessário), *kindly revert* (por favor responda); na **Irlanda**, *grand* (ótimo, tudo bem).`,
      },
      {
        tipo: 'tabela',
        titulo: 'EUA × Reino Unido',
        cabecalho: ['EUA', 'Reino Unido', 'Português'],
        linhas: [
          ['apartment', 'flat', 'apartamento'],
          ['elevator', 'lift', 'elevador'],
          ['truck', 'lorry', 'caminhão'],
          ['cookie', 'biscuit', 'biscoito'],
          ['gas', 'petrol', 'gasolina'],
          ['fall', 'autumn', 'outono'],
          ['vacation', 'holiday', 'férias'],
          ['check', 'bill', 'conta (restaurante)'],
          ['line', 'queue', 'fila'],
          ['trash / garbage', 'rubbish', 'lixo'],
          ['sidewalk', 'pavement', 'calçada'],
          ['soccer', 'football', 'futebol'],
          ['pants', 'trousers', 'calça'],
          ['first floor', 'ground floor', 'térreo'],
          ['zip code', 'postcode', 'CEP'],
          ['résumé', 'CV', 'currículo'],
        ],
        nota: 'Datas: EUA 09/11/2026 = 11 de setembro; Reino Unido 09/11/2026 = 9 de novembro. Em documento internacional, escreva o mês por extenso.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"colour" e "centre" são grafias…', opcoes: ['americanas', 'britânicas', 'erradas'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz "Let’s meet on the ground floor". É…', opcoes: ['o primeiro andar', 'o térreo', 'o subsolo'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um australiano responde "No worries" ao seu "thanks". Significa…', opcoes: ['sem problemas / de nada', 'não se preocupe com o prazo', 'não tenho certeza'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Um fornecedor indiano escreve "Kindly revert at the earliest". Ele pede…', opcoes: ['que você reverta a compra', 'que você responda o quanto antes'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Can we prepone the meeting?" (inglês indiano) =', opcoes: ['adiar a reunião', 'antecipar a reunião'], correta: 1 },
          { tipo: 'lacuna', frase: 'EUA "line", Reino Unido ___ (fila)', resposta: 'queue' },
          { tipo: 'lacuna', frase: 'EUA "truck", Reino Unido ___ (caminhão)', resposta: 'lorry' },
        ],
      },
    ],
  },
  {
    id: 'erros-lusofonos',
    titulo: 'Os erros fossilizados de quem fala português',
    resumo: 'Falsos amigos, decalques e pronúncia: a lista dos deslizes que sobrevivem até o C2.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Erros fossilizados são os que já não geram mal-entendido — e por isso ninguém corrige. Três famílias:

**1. Falsos amigos**: palavras parecidas com sentido diferente. *Actually* é "na verdade" (não "atualmente" = *currently*); *pretend* é "fingir" (pretender = *intend*); *push* é "empurrar"; *library* é "biblioteca" (livraria = *bookstore*); *college* é "faculdade"; *eventually* é "no fim" (eventualmente = *occasionally*); *realize* é "perceber" (realizar = *carry out, achieve*); *parents* são pai e mãe; *exquisite* é "requintado"; *sensible* é "sensato"; *preservative* é "conservante" (preservativo = *condom*!); *costume* é "fantasia" (costume = *custom, habit*); *novel* é "romance"; *fabric* é "tecido"; *assist* é "ajudar" (assistir = *watch*); *attend* é "participar de" (atender = *answer, serve*).

**2. Decalques** do português: *I have 40 years*, *people is*, *informations*, *make a question*, *explain me*, *discuss about*, *I'm agree*, *depend of*, *married with*, *since three years*, *say me*, *more easy*, *enter in*.

**3. Pronúncia**: o "i" final (*bigui*), o "e" inicial (*eschool*), o *-ed* como sílaba (*worked* com duas), o *th* como "t" ou "f", e o *h* mudo.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Errado × certo',
        cabecalho: ['Erro típico', 'Forma correta', 'Por quê'],
        linhas: [
          ['Actually, I live in Curitiba. (atualmente)', 'Currently, I live in Curitiba.', 'actually = na verdade'],
          ['I pretend to expand the farm.', 'I intend to expand the farm.', 'pretend = fingir'],
          ['I have 40 years.', 'I’m 40.', 'idade com to be'],
          ['The people is friendly.', 'The people are friendly.', 'people é plural'],
          ['Can you explain me?', 'Can you explain it to me?', 'explain TO someone'],
          ['Let’s discuss about the price.', 'Let’s discuss the price.', 'discuss sem preposição'],
          ['I’m agree.', 'I agree.', 'agree é verbo'],
          ['It depends of the weather.', 'It depends on the weather.', 'depend on'],
          ['I live here since three years.', 'I’ve lived here for three years.', 'present perfect + for'],
          ['She is married with a vet.', 'She is married to a vet.', 'married to'],
          ['Can I make a question?', 'Can I ask a question?', 'ask a question'],
          ['more easy / more cheap', 'easier / cheaper', 'comparativo curto com -er'],
          ['He said me that…', 'He told me that…', 'tell someone'],
          ['I went to the library to buy a book.', 'I went to the bookstore to buy a book.', 'library = biblioteca'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Actually, we have 300 goats" =', opcoes: ['Atualmente temos 300 cabras', 'Na verdade, temos 300 cabras'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I realized I was wrong" =', opcoes: ['Realizei que estava errado', 'Percebi que estava errado'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num rótulo, "no preservatives" significa…', opcoes: ['sem preservativos', 'sem conservantes'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I attended the meeting" =', opcoes: ['Atendi a reunião', 'Participei da reunião'], correta: 1 },
          { tipo: 'lacuna', frase: 'It depends ___ the weather.', resposta: 'on' },
          { tipo: 'lacuna', frase: 'Can I ___ a question? (fazer)', resposta: 'ask' },
          { tipo: 'lacuna', frase: 'Let’s discuss ___ price. (sem "about")', resposta: 'the' },
          { tipo: 'lacuna', frase: 'I ___ to expand the farm next year. (pretendo)', resposta: ['intend', 'plan'] },
          { tipo: 'traducao', origem: 'Moro aqui há três anos.', resposta: ['I’ve lived here for three years.', 'I have lived here for three years.', 'I’ve been living here for three years.', 'I have been living here for three years.'] },
          { tipo: 'traducao', origem: 'Atualmente, trabalho com software.', resposta: ['Currently, I work with software.', 'I currently work with software.', 'Currently, I work in software.', 'I currently work in software.'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Sutilezas ──────────────────────────────── */

const sutilezas: Licao[] = [
  {
    id: 'conotacao-eufemismo',
    titulo: 'Eufemismo corporativo e o código britânico',
    resumo: '"Let go", "rightsizing", "not a good fit" — e a tabela do que o britânico diz × o que ele quer dizer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `No C2 você lê a **conotação** antes da denotação.

**Eufemismos corporativos**: *let go / rightsizing / headcount reduction* (demitir), *restructuring* (cortes), *challenging* (ruim), *an opportunity for improvement* (um problema), *not a good fit* (não serve), *going forward* (daqui em diante — e não vamos falar do passado), *we'll circle back* (talvez nunca).

**Palavras carregadas**: *factory farm* (crítico) × *intensive operation* (técnico) × *modern farm* (favorável); *chemicals* × *crop protection products*; *surveillance* × *monitoring* × *transparency*.

**O código britânico**: a cortesia inglesa inverte o sentido literal. Quem trabalha com britânicos precisa da tabela abaixo — e o americano, aliás, também se perde nela.`,
      },
      {
        tipo: 'tabela',
        titulo: 'O que o britânico diz × o que quer dizer',
        cabecalho: ['Diz', 'Quer dizer', 'O estrangeiro entende'],
        linhas: [
          ['With the greatest respect…', 'Você está errado (ou é um idiota).', 'Ele me respeita.'],
          ['That’s not bad.', 'Isso é bom, até muito bom.', 'É medíocre.'],
          ['Quite good.', 'Um pouco decepcionante.', 'Muito bom.'],
          ['I hear what you say.', 'Discordo e não quero mais discutir.', 'Ele concorda.'],
          ['I’ll bear it in mind.', 'Vou esquecer isso.', 'Ele vai considerar.'],
          ['Very interesting.', 'Isso é bobagem.', 'Ele gostou.'],
          ['Could we consider some other options?', 'Sua ideia não serve.', 'Ainda não decidiram.'],
          ['I’m sure it’s my fault.', 'A culpa é sua.', 'A culpa é dele.'],
          ['Just a few minor comments.', 'Refaça tudo.', 'Pequenos ajustes.'],
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'euphemism', traducao: 'eufemismo' },
          { termo: 'to let someone go', traducao: 'demitir (eufemismo)' },
          { termo: 'rightsizing / headcount reduction', traducao: 'redução de quadro (eufemismo)' },
          { termo: 'challenging', traducao: 'desafiador (eufemismo para difícil, ruim)' },
          { termo: 'not a good fit', traducao: 'não se encaixa (eufemismo para recusa)' },
          { termo: 'going forward', traducao: 'daqui em diante' },
          { termo: 'loaded word', traducao: 'palavra carregada, tendenciosa' },
          { termo: 'understatement', traducao: 'atenuação, dizer menos para dizer mais' },
          { termo: 'to read between the lines', traducao: 'ler nas entrelinhas' },
          { termo: 'subtext', traducao: 'subtexto' },
          { termo: 'tongue-in-cheek', traducao: 'irônico, de brincadeira' },
          { termo: 'deadpan', traducao: 'humor impassível, sem expressão' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Um e-mail da matriz diz que 40 pessoas "will be let go". Significa…', opcoes: ['serão liberadas mais cedo', 'serão demitidas'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um cliente britânico diz "With the greatest respect, I think…". Ele…', opcoes: ['concorda com admiração', 'discorda fortemente'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Seu relatório volta com "just a few minor comments" de um britânico. Espere…', opcoes: ['ajustes pequenos', 'uma revisão profunda'], correta: 1 },
          { tipo: 'escolha', pergunta: '"factory farm" × "intensive operation":', opcoes: ['sinônimos neutros', 'o primeiro é crítico, o segundo técnico'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz que sua apresentação foi "not bad". Provavelmente…', opcoes: ['achou fraca', 'gostou bastante'], correta: 1 },
          { tipo: 'lacuna', frase: 'Read between the ___.', resposta: 'lines' },
          { tipo: 'lacuna', frase: 'Unfortunately, the candidate was not a good ___.', resposta: 'fit' },
        ],
      },
    ],
  },
  {
    id: 'enfase-inversao',
    titulo: 'Ênfase: cleft sentences, "do" enfático e acento',
    resumo: '"What I need is…", "It was Sarah who…", "I do like it" — e a frase que muda de sentido sete vezes pelo acento.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês enfatiza de quatro jeitos:

**1. Cleft sentences** (frases clivadas):
- *It was Sarah **who** found the problem.* (Foi a Sarah que…)
- ***What** we need **is** more data.* (O que precisamos é…)
- ***All** I want **is** a clear answer.* (Tudo o que quero é…)
- ***The reason** we switched **is that**…*

**2. "Do" enfático** na afirmativa: *I **do** like the idea — I just think it's too early.* (Eu gosto, sim…) No imperativo, é cortesia calorosa: ***Do** come in!*

**3. Fronting** (antecipar o objeto): *That, I can't promise. The report, I've read; the appendix, I haven't.*

**4. Acento de frase**: o inglês move o acento para mudar o foco. *I didn't say he stole the goat* muda de sentido conforme a palavra acentuada: I (outra pessoa disse), SAY (insinuei), HE (foi outro), STOLE (pegou emprestado), GOAT (roubou outra coisa).

Advérbios de foco mudam o sentido pela posição: *Only I saw it* (só eu) × *I only saw it* (só vi, não toquei) × *I saw only that one* (só aquele).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'It was Sarah who spotted the problem, not the manager.', traducao: 'Foi a Sarah que identificou o problema, não o gerente.' },
          { texto: 'What we need is a clear decision.', traducao: 'O que precisamos é uma decisão clara.' },
          { texto: 'All I’m asking for is a straight answer.', traducao: 'Tudo o que peço é uma resposta direta.' },
          { texto: 'I do appreciate your help — I just can’t accept the price.', traducao: 'Agradeço sim sua ajuda, só não posso aceitar o preço.' },
          { texto: 'Do sit down.', traducao: 'Sente-se, por favor.', nota: 'cortesia calorosa, um pouco britânica' },
          { texto: 'That, I can’t promise.', traducao: 'Isso eu não posso prometer.' },
          { texto: 'Even the vet was surprised.', traducao: 'Até o veterinário ficou surpreso.' },
          { texto: 'The reason we switched suppliers is that they missed three deadlines.', traducao: 'O motivo pelo qual trocamos de fornecedor é que eles perderam três prazos.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'It was Sarah ___ found the problem.', resposta: 'who' },
          { tipo: 'lacuna', frase: '___ we need is more data. (o que)', resposta: 'What' },
          { tipo: 'lacuna', frase: '___ I want is a clear answer. (tudo o que)', resposta: 'All' },
          { tipo: 'lacuna', frase: 'I ___ like it, I just think it’s expensive. (ênfase)', resposta: 'do' },
          { tipo: 'escolha', pergunta: '"I only saw it" =', opcoes: ['Só eu vi', 'Eu só vi (não fiz mais nada)'], correta: 1 },
          { tipo: 'escolha', pergunta: '"I didn’t say HE stole it" (acento em HE) sugere…', opcoes: ['que outra pessoa roubou', 'que ele pegou emprestado', 'que eu não disse nada'], correta: 0 },
          { tipo: 'ordenar', resposta: 'What we need is a clear decision', traducao: 'O que precisamos é uma decisão clara' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Linguagem idiomática ──────────────────────── */

const idiomatico: Licao[] = [
  {
    id: 'expressoes-idiomaticas',
    titulo: 'Expressões idiomáticas: do escritório à fazenda',
    resumo: 'ballpark figure, touch base, bite the bullet — e as que vêm do campo: get someone’s goat, hold your horses.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma expressão bem colocada vale mais que dez estruturas gramaticais: sinaliza pertencimento. Mal colocada, ou no registro errado, chama atenção do jeito ruim. Cada item vem com o registro. O inglês de negócios americano, em particular, é cheio delas — e algumas viraram clichê (*think outside the box*, *synergy*): use com moderação.

Curiosidade útil para quem cria cabras: **get someone's goat** é "irritar alguém" — *His attitude really gets my goat.*`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'a ballpark figure', traducao: 'um número aproximado', nota: 'negócios, EUA' },
          { termo: 'to touch base', traducao: 'fazer contato rápido', nota: 'negócios' },
          { termo: 'to be on the same page', traducao: 'estar alinhado', nota: 'negócios' },
          { termo: 'to get the ball rolling', traducao: 'dar o pontapé inicial' },
          { termo: 'to cut corners', traducao: 'fazer nas coxas, economizar onde não devia' },
          { termo: 'the elephant in the room', traducao: 'o problema óbvio que ninguém menciona' },
          { termo: 'to bite the bullet', traducao: 'encarar algo desagradável' },
          { termo: 'the bottom line', traducao: 'o resultado final; o essencial' },
          { termo: 'back to the drawing board', traducao: 'voltar à estaca zero' },
          { termo: 'it’s not rocket science', traducao: 'não é nenhum bicho de sete cabeças' },
          { termo: 'to call it a day', traducao: 'encerrar por hoje' },
          { termo: 'to hit the nail on the head', traducao: 'acertar na mosca' },
          { termo: 'under the weather', traducao: 'meio doente, indisposto' },
          { termo: 'to cost an arm and a leg', traducao: 'custar os olhos da cara' },
          { termo: 'to break the ice', traducao: 'quebrar o gelo' },
          { termo: 'to beat around the bush', traducao: 'enrolar, fazer rodeios' },
          { termo: 'a no-brainer', traducao: 'uma decisão óbvia' },
          { termo: 'low-hanging fruit', traducao: 'ganhos fáceis', nota: 'negócios, um pouco clichê' },
          { termo: 'the ball is in your court', traducao: 'a decisão agora é sua' },
          { termo: 'to get someone’s goat', traducao: 'irritar alguém' },
          { termo: 'hold your horses', traducao: 'calma, espera aí' },
          { termo: 'till the cows come home', traducao: 'até cansar, por muito tempo' },
          { termo: 'don’t put all your eggs in one basket', traducao: 'não aposte tudo numa coisa só' },
          { termo: 'when pigs fly', traducao: 'no dia de São Nunca' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Em contexto',
        itens: [
          { texto: 'Can you give me a ballpark figure for 300 goats?', traducao: 'Pode me dar um número aproximado para 300 cabras?' },
          { texto: 'Let’s touch base next week to make sure we’re on the same page.', traducao: 'Vamos nos falar semana que vem para garantir que estamos alinhados.' },
          { texto: 'We can’t afford to cut corners on animal health.', traducao: 'Não podemos economizar de qualquer jeito na saúde animal.' },
          { texto: 'The bottom line is that the app pays for itself.', traducao: 'O essencial é que o app se paga.' },
          { texto: 'Nobody wants to mention the elephant in the room: the budget.', traducao: 'Ninguém quer tocar no problema óbvio: o orçamento.' },
          { texto: 'We’ve sent our proposal, so the ball is in their court.', traducao: 'Mandamos a proposta, agora a decisão é deles.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"a ballpark figure" =', opcoes: ['o preço do ingresso do estádio', 'um número aproximado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"It really gets my goat" =', opcoes: ['Isso me irrita muito', 'Isso me dá uma cabra'], correta: 0 },
          { tipo: 'escolha', pergunta: '"back to the drawing board" =', opcoes: ['voltar à estaca zero', 'voltar ao escritório'], correta: 0 },
          { tipo: 'escolha', pergunta: '"I’m feeling a bit under the weather" =', opcoes: ['Estou com calor', 'Estou meio indisposto'], correta: 1 },
          { tipo: 'lacuna', frase: 'Let’s ___ it a day. (encerrar por hoje)', resposta: 'call' },
          { tipo: 'lacuna', frase: 'You hit the ___ on the head.', resposta: 'nail' },
          { tipo: 'lacuna', frase: 'It costs an arm and a ___.', resposta: 'leg' },
          { tipo: 'traducao', origem: 'Não é nenhum bicho de sete cabeças.', resposta: ['It’s not rocket science.', 'It is not rocket science.', 'It isn’t rocket science.'] },
        ],
      },
    ],
  },
  {
    id: 'proverbios-cultura',
    titulo: 'Provérbios e referências culturais',
    resumo: 'Os provérbios ainda vivos (vários da fazenda), Shakespeare no dia a dia, metáforas de beisebol e os códigos do small talk.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Provérbios são citados pela metade: *Don't count your chickens…* já basta. Referências partilhadas funcionam como piscadelas; não é preciso usá-las, é preciso **reconhecê-las**.

**Shakespeare** está no inglês cotidiano sem que se perceba: *break the ice, wild-goose chase* (busca inútil), *all that glitters is not gold, in a pickle* (em apuros), *vanish into thin air*.

**Esporte**: o inglês americano pensa em **beisebol** — *ballpark figure, touch base, step up to the plate* (assumir a responsabilidade), *throw someone a curveball* (surpreender com algo difícil), *hit it out of the park* (arrasar), *cover all the bases*. O britânico, em **críquete**: *it's not cricket* (não é justo), *a sticky wicket* (situação complicada).

**Small talk**: nos EUA, *How are you?* é cumprimento; *Let's grab coffee sometime* nem sempre é convite real; primeiro nome desde o início. No Reino Unido, o **tempo** é o assunto universal; *Fancy a cuppa?* é oferta de chá; ninguém fura fila.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Provérbios',
        itens: [
          { termo: 'Don’t count your chickens before they hatch.', traducao: 'Não conte com o ovo antes de a galinha pôr.' },
          { termo: 'Make hay while the sun shines.', traducao: 'Aproveite enquanto é tempo.', nota: 'literalmente: faça feno enquanto há sol' },
          { termo: 'Don’t cry over spilled milk.', traducao: 'Não adianta chorar pelo leite derramado.' },
          { termo: 'You can lead a horse to water, but you can’t make it drink.', traducao: 'Dá para oferecer a oportunidade, não obrigar a aproveitar.' },
          { termo: 'The early bird catches the worm.', traducao: 'Deus ajuda quem cedo madruga.' },
          { termo: 'Practice makes perfect.', traducao: 'A prática leva à perfeição.' },
          { termo: 'Every cloud has a silver lining.', traducao: 'Há males que vêm para bem.' },
          { termo: 'Too many cooks spoil the broth.', traducao: 'Muitos cozinheiros estragam o caldo.' },
          { termo: 'A bird in the hand is worth two in the bush.', traducao: 'Mais vale um pássaro na mão que dois voando.' },
          { termo: 'Actions speak louder than words.', traducao: 'Ações falam mais alto que palavras.' },
          { termo: 'Where there’s a will, there’s a way.', traducao: 'Querer é poder.' },
          { termo: 'The grass is always greener on the other side.', traducao: 'A grama do vizinho é sempre mais verde.' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Referências',
        itens: [
          { termo: 'a wild-goose chase', traducao: 'uma busca inútil', nota: 'Shakespeare' },
          { termo: 'all that glitters is not gold', traducao: 'nem tudo que reluz é ouro', nota: 'Shakespeare' },
          { termo: 'to step up to the plate', traducao: 'assumir a responsabilidade', nota: 'beisebol' },
          { termo: 'to throw someone a curveball', traducao: 'surpreender com algo difícil', nota: 'beisebol' },
          { termo: 'to hit it out of the park', traducao: 'arrasar, ter sucesso total', nota: 'beisebol' },
          { termo: 'it’s not cricket', traducao: 'não é justo', nota: 'britânico, críquete' },
          { termo: 'a good Samaritan', traducao: 'uma boa alma que ajuda estranhos', nota: 'Bíblia' },
          { termo: 'the writing on the wall', traducao: 'sinal claro de que algo vai acabar mal', nota: 'Bíblia' },
          { termo: 'Fancy a cuppa?', traducao: 'Aceita um chá?', nota: 'britânico informal' },
          { termo: 'Let’s grab coffee sometime.', traducao: 'Vamos tomar um café qualquer dia.', nota: 'nos EUA, nem sempre é convite real' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Make hay while the sun shines" =', opcoes: ['Trabalhe só de dia', 'Aproveite a oportunidade enquanto ela existe'], correta: 1 },
          { tipo: 'escolha', pergunta: '"That was a wild-goose chase" =', opcoes: ['Foi uma busca inútil', 'Foi uma caçada de gansos'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Um americano diz "We need someone to step up to the plate". Ele pede…', opcoes: ['alguém que sirva o jantar', 'alguém que assuma a responsabilidade'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um britânico diz "That’s not cricket". Ele acha que…', opcoes: ['não é um esporte', 'não é justo'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um colega americano diz "Let’s grab coffee sometime" sem marcar data. Provavelmente…', opcoes: ['é uma gentileza, não um compromisso', 'quer marcar hoje'], correta: 0 },
          { tipo: 'lacuna', frase: 'Don’t cry over spilled ___.', resposta: 'milk' },
          { tipo: 'lacuna', frase: 'Don’t count your ___ before they hatch.', resposta: 'chickens' },
          { tipo: 'lacuna', frase: 'Actions speak louder than ___.', resposta: 'words' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Precisão estilística ──────────────────────── */

const estilo: Licao[] = [
  {
    id: 'conciso-vs-elaborado',
    titulo: 'Plain English: conciso versus elaborado',
    resumo: 'Cortar palavras ocas, preferir verbos fortes e voz ativa — e saber quando o período longo vale a pena.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês profissional moderno segue o ideal do **plain English**: frases curtas, voz ativa, verbos fortes, nenhuma palavra que não trabalhe. As regras de Orwell ainda circulam: *never use a long word where a short one will do; if it is possible to cut a word out, always cut it out; never use the passive where you can use the active.*

O brasileiro tende ao contrário: o português formal valoriza o período longo e a palavra latina. Traduzido, isso vira *"It is important to note that at this point in time we are in the process of conducting an analysis"* — onde bastava *"We're analyzing it now."*

O **estilo elaborado** tem lugar: ensaio, discurso, texto literário, efeito retórico. A escolha deve ser consciente.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Cortar',
        cabecalho: ['Inchado', 'Conciso'],
        linhas: [
          ['in order to', 'to'],
          ['due to the fact that', 'because'],
          ['at this point in time', 'now'],
          ['in the event that', 'if'],
          ['a large number of', 'many'],
          ['make a decision', 'decide'],
          ['conduct an analysis of', 'analyze'],
          ['It is important to note that the costs rose.', 'Costs rose.'],
          ['We would like to ask you to kindly let us know whether…', 'Please tell us whether…'],
          ['The report was reviewed by the team.', 'The team reviewed the report.'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'O mesmo conteúdo, dois estilos',
        markdown: `> **Plain:** The app records each goat's milk yield. If it drops, the system alerts you. You catch illness sooner.
>
> **Elaborate:** By recording, day after day, the yield of every single goat — and by flagging at once even the slightest drop — the app hands the farmer those few days' head start that, more often than not, decide how an illness will end.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Versão plain de "We are in a position to conduct an analysis of the data":', opcoes: ['We can analyze the data.', 'We have the capacity for data analysis.'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Versão plain de "due to the fact that":', opcoes: ['owing to the circumstance that', 'because'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Voz ativa de "The report was reviewed by the team":', opcoes: ['The team reviewed the report.', 'The report has been reviewed.'], correta: 0 },
          { tipo: 'lacuna', frase: 'Plain: "a large number of farms" → ___ farms', resposta: 'many' },
          { tipo: 'lacuna', frase: 'Plain: "at this point in time" → ___', resposta: 'now' },
          { tipo: 'traducao', origem: 'Analisamos os dados. (conciso)', resposta: ['We analyzed the data.', 'We analysed the data.', 'We analyze the data.'] },
          { tipo: 'ditado', texto: 'If yield drops, the system alerts you.', traducao: 'Se a produção cai, o sistema avisa.' },
        ],
      },
    ],
  },
  {
    id: 'revisar',
    titulo: 'Revisar e editar um texto em inglês',
    resumo: 'Comma splice, dangling modifier, its × it’s, affect × effect, fewer × less: a revisão em quatro passadas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Revisar é ler **com uma pergunta por vez**:

1. **Structure**: cada parágrafo tem uma ideia e uma topic sentence? A ordem é a melhor?
2. **Sentence**: há **comma splice** (duas orações completas unidas só por vírgula: *The app is simple, farmers love it* — use ponto, ponto e vírgula ou *and*)? **Run-on**? **Dangling modifier** (*Walking into the barn, the goats looked healthy* — quem entrou?)?
3. **Word**: repetições, palavras ocas, falsos amigos, preposições.
4. **Form**: as confusões clássicas até de nativos — *its / it's, your / you're, their / there / they're, affect / effect, fewer / less, then / than, lose / loose, who / whom*; apóstrofo em plural (*goat's for sale* está errado: *goats for sale*); concordância com *each, everyone, data*.

Pontuação: o americano põe vírgula e ponto **dentro** das aspas (*"yes," he said*); o britânico, fora quando não fazem parte da citação. A **vírgula de Oxford** (antes do *and* final numa lista) é padrão nos EUA e opcional no Reino Unido.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Erros frequentes',
        cabecalho: ['Problema', 'Errado', 'Certo'],
        linhas: [
          ['comma splice', 'The app is simple, farmers love it.', 'The app is simple, and farmers love it.'],
          ['dangling modifier', 'Walking into the barn, the goats looked healthy.', 'Walking into the barn, I saw that the goats looked healthy.'],
          ['its / it’s', 'The farm and it’s owner.', 'The farm and its owner.'],
          ['affect / effect', 'The rain effected the harvest.', 'The rain affected the harvest.'],
          ['fewer / less', 'less goats', 'fewer goats (contável) / less milk (incontável)'],
          ['then / than', 'bigger then last year', 'bigger than last year'],
          ['lose / loose', 'We don’t want to loose the client.', 'We don’t want to lose the client.'],
          ['apóstrofo em plural', 'Goat’s for sale', 'Goats for sale'],
          ['your / you’re', 'Your welcome.', 'You’re welcome.'],
          ['concordância', 'Each of the farms have a manager.', 'Each of the farms has a manager.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['The company and it’s clients.', 'The company and its clients.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['We have less goats this year.', 'We have fewer goats this year.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"The app is simple, farmers love it" — o problema é…', opcoes: ['ortografia', 'comma splice', 'nenhum'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Walking into the barn, the goats looked healthy" — o problema é…', opcoes: ['dangling modifier: parece que as cabras entraram', 'tempo verbal', 'nenhum'], correta: 0 },
          { tipo: 'lacuna', frase: 'The drought ___ the harvest. (afetou)', resposta: 'affected' },
          { tipo: 'lacuna', frase: 'This year was better ___ last year.', resposta: 'than' },
          { tipo: 'lacuna', frase: 'We don’t want to ___ the client. (perder)', resposta: 'lose' },
          { tipo: 'traducao', origem: 'Cabras à venda (placa)', resposta: ['Goats for sale', 'Goats for Sale'] },
        ],
      },
    ],
  },
];

/* ─────────────────── Comunicação altamente sofisticada ──────────────────── */

const sofisticada: Licao[] = [
  {
    id: 'discurso-ocasiao',
    titulo: 'Discurso em ocasião formal: o brinde',
    resumo: 'Toast, homenagem, abertura de evento: estrutura, humor autodepreciativo e "Please raise your glasses".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **toast** (brinde) e o discurso de ocasião em inglês seguem uma estrutura enxuta: **agradecimento → uma história curta → uma ideia → o brinde**. Dois a três minutos. Mais do que isso e o público olha o relógio.

O humor esperado é **autodepreciativo** (*self-deprecating*): você brinca consigo, nunca com o homenageado. A emoção aparece, mas contida — o americano tolera um pouco mais que o britânico.

Fórmulas do brinde: ***I'd like to propose a toast to…*** / ***Please raise your glasses to…*** / ***To…!*** / ***Cheers!*** Nos EUA, bate-se o copo; no Reino Unido formal, apenas se ergue.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: brinde de parceria',
        markdown: `> Good evening, everyone. Sarah, colleagues, friends —
>
> Three years ago, when Sarah and I first stood in her barn — me with my dictionary, her with remarkable patience — nobody would have bet that tonight we'd be celebrating our hundredth installation in New England.
>
> What brought us together wasn't software. It was the belief that good farming starts with paying attention — and that technology shouldn't replace that attention, but make it possible.
>
> I owe a huge thank-you to the whole team here in Vermont, who forgave every one of my mistakes and took every one of my suggestions seriously. Well — most of them.
>
> So please raise your glasses: to the next hundred — and to the goats, who, thankfully, couldn't care less about any of this. Cheers!`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'toast / to make a toast', traducao: 'brinde / fazer um brinde' },
          { termo: 'to propose a toast to', traducao: 'propor um brinde a' },
          { termo: 'to raise one’s glass', traducao: 'erguer o copo' },
          { termo: 'Cheers!', traducao: 'Saúde!' },
          { termo: 'speech / remarks', traducao: 'discurso / palavras (mais curtas)' },
          { termo: 'milestone', traducao: 'marco' },
          { termo: 'anniversary', traducao: 'aniversário (de empresa, casamento)', nota: 'birthday é o de pessoa' },
          { termo: 'to pay tribute to', traducao: 'prestar homenagem a' },
          { termo: 'self-deprecating', traducao: 'autodepreciativo' },
          { termo: 'to owe someone a thank-you', traducao: 'dever um agradecimento a alguém' },
          { termo: 'couldn’t care less', traducao: 'não estar nem aí' },
          { termo: 'to bet', traducao: 'apostar' },
          { termo: 'remarkable', traducao: 'notável' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Duração ideal de um toast:', opcoes: ['10 a 15 minutos', '2 a 3 minutos', '30 segundos'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O humor num toast deve ser…', opcoes: ['sobre o homenageado', 'autodepreciativo', 'evitado por completo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"The goats couldn’t care less" =', opcoes: ['As cabras se importam muito', 'As cabras não estão nem aí'], correta: 1 },
          { tipo: 'lacuna', frase: 'I’d like to ___ a toast to our partners.', resposta: 'propose' },
          { tipo: 'lacuna', frase: 'Please ___ your glasses.', resposta: 'raise' },
          { tipo: 'lacuna', frase: 'Tonight we celebrate an important ___. (marco)', resposta: 'milestone' },
          { tipo: 'ditado', texto: 'Please raise your glasses to the next hundred.', traducao: 'Por favor, ergam os copos às próximas cem.' },
        ],
      },
    ],
  },
  {
    id: 'essay',
    titulo: 'Escrever um ensaio pessoal',
    resumo: 'O personal essay e o op-ed: voz, "show, don’t tell", abertura por cena e um final que volta ao começo transformado.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **argumentative essay** (B2) é simétrico e impessoal. O **personal essay** — e seu primo jornalístico, o **op-ed** — tem **voz**, usa **"I"**, arrisca uma tese e tem ritmo. É o gênero das grandes revistas americanas e britânicas.

Convenções:
- **Abertura por cena** ou detalhe concreto, nunca por definição de dicionário.
- **Show, don't tell**: em vez de *"Farming is hard"*, mostre *the flashlight between her teeth at 5 a.m.*
- **Tese cedo e com aresta**: *The question isn't whether technology belongs in the barn, but what it does to the way we look.*
- **Movimento**: cada parágrafo desloca o anterior; transições discretas (*And yet. Still. Which is exactly the point.*).
- **Final que volta à cena inicial**, agora com a perspectiva mudada — é o que o leitor guarda.

Registro: culto mas conversado; frases de tamanho variado; nenhuma nota de rodapé.`,
      },
      {
        tipo: 'texto',
        titulo: 'Abertura e fechamento (modelo)',
        markdown: `> **The Flashlight**
>
> Five a.m. Sarah is standing in the dark barn, a flashlight between her teeth, flipping through a binder. She's looking for number 4471. The goat with that tag gave less milk yesterday, she thinks — or was it the day before? The binder isn't saying.
>
> You could read this scene as a sales pitch for an app. I'd rather read it as a question: what do we owe an animal we keep three hundred at a time? Attention, is the easy answer. The hard answer is that attention, at that scale, only works with help — and the help changes what it makes possible.
>
> […]
>
> Five a.m., a year later. Sarah is standing in the barn, phone in hand. The app flagged 4471 before she would have noticed. She walks over, rests a hand on the goat's back, and stays there for a moment. She doesn't need the flashlight anymore. She still needs the hand.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'personal essay / op-ed', traducao: 'ensaio pessoal / artigo de opinião' },
          { termo: 'voice', traducao: 'voz (autoral)' },
          { termo: 'show, don’t tell', traducao: 'mostre, não diga' },
          { termo: 'hook / opening scene', traducao: 'gancho / cena de abertura' },
          { termo: 'and yet / still', traducao: 'e no entanto / ainda assim' },
          { termo: 'which is exactly the point', traducao: 'e é exatamente essa a questão' },
          { termo: 'to owe', traducao: 'dever (a alguém)', exemplo: 'What do we owe the animal?', exemploTraducao: 'O que devemos ao animal?' },
          { termo: 'at a time', traducao: 'de cada vez', exemplo: 'three hundred at a time', exemploTraducao: 'trezentas de uma vez' },
          { termo: 'to flip through', traducao: 'folhear' },
          { termo: 'to flag', traducao: 'sinalizar, alertar' },
          { termo: 'to rest a hand on', traducao: 'pousar a mão sobre' },
          { termo: 'shift in perspective', traducao: 'mudança de perspectiva' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'A diferença central entre personal essay e argumentative essay:', opcoes: ['o personal essay é mais curto', 'o personal essay tem voz própria e usa "I"', 'o argumentative essay usa cenas'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Melhor abertura de ensaio pessoal:', opcoes: ['According to the dictionary, technology is…', 'Five a.m. Sarah is standing in the dark barn…', 'In this essay, I will discuss…'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Show, don’t tell" pede…', opcoes: ['explicar os sentimentos diretamente', 'mostrar por detalhes concretos', 'usar imagens no texto'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O final do modelo funciona porque…', opcoes: ['resume os argumentos', 'volta à cena inicial com a perspectiva mudada', 'traz uma estatística'], correta: 1 },
          { tipo: 'lacuna', frase: 'What do we ___ an animal we keep three hundred at a time? (devemos)', resposta: 'owe' },
          { tipo: 'lacuna', frase: 'And ___. (e no entanto)', resposta: 'yet' },
          { tipo: 'traducao', origem: 'Ela não precisa mais da lanterna. Da mão, ainda precisa.', resposta: ['She doesn’t need the flashlight anymore. She still needs the hand.', 'She doesn’t need the flashlight anymore. She still needs her hand.', 'She no longer needs the flashlight. She still needs the hand.'] },
        ],
      },
    ],
  },
];

export const c2: ConteudoNivel<'c2'> = { dominio, sutilezas, idiomatico, estilo, sofisticada };
